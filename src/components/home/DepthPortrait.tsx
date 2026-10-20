"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero portrait, given depth.
 *
 * The photograph is displaced by a depth map generated locally with Depth
 * Anything V2 (`_portfolio-work/photos/make_depth.py`). Nothing is retouched:
 * the shader shifts where it *samples* the photograph, it never alters a pixel
 * of it, and the depth map lives in a separate file so there is no path by
 * which a model-generated value reaches the subject's face.
 *
 * Why parallax sampling rather than a displaced mesh
 * --------------------------------------------------
 * Pushing vertices along Z by depth is the obvious approach and it warps a
 * face: the silhouette stretches and the nose and cheeks shear as the camera
 * moves, which is exactly the thing the brief forbids. Offsetting the sample
 * coordinate instead keeps the geometry flat, so the portrait slides in layers
 * and the face stays the shape the photographer captured. The depth map is also
 * deliberately smooth across the face for the same reason.
 *
 * Three inputs, all optional
 * --------------------------
 *   pointer  mouse or trackpad position over the hero
 *   scroll   how far down the page the hero has travelled
 *   tilt     device orientation on a phone, after permission where required
 *
 * Each contributes to one target offset, and the rendered offset eases towards
 * it, so the motion is gentle and nothing snaps.
 *
 * It renders the flat photograph instead when WebGL is unavailable, when the
 * textures fail, or when the reader prefers reduced motion. That is a real
 * fallback rather than a blank box: the flat image is the same photograph.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 1.0 - (aPos.y * 0.5 + 0.5));
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/*
 * Four refinement steps rather than one offset.
 *
 * A single offset proportional to depth tears at any sharp depth edge, because
 * the pixel it lands on may itself belong to a different layer. Stepping
 * towards the answer and re-reading the depth each time is the standard
 * parallax-occlusion trick and it costs four texture reads on one quad.
 */
const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uShift;
uniform float uAmount;

void main() {
  vec2 uv = vUv;
  for (int i = 0; i < 4; i++) {
    float d = texture2D(uDepth, uv).r;
    uv = vUv + uShift * (d - 0.5) * uAmount;
  }
  vec4 c = texture2D(uColor, uv);
  /*
   * The alpha comes from the unshifted coordinate. Sampling it from the shifted
   * one lets the cut-out edge crawl across the page as the pointer moves, which
   * reads as the subject having a loose outline.
   */
  c.a = texture2D(uColor, vUv).a;
  gl_FragColor = c;
}`;

interface Props {
  color: string;
  depth: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

/*
 * iOS has gated device orientation behind a permission call since 13, and the
 * call only works from inside a user gesture. Safari is the only engine that
 * defines it, so its presence is the test for "this device will not give us
 * tilt until somebody taps something".
 */
type OrientationGate = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied" | "default">;
};

const orientationNeedsPermission = () =>
  typeof DeviceOrientationEvent !== "undefined" &&
  typeof (DeviceOrientationEvent as OrientationGate).requestPermission === "function";

export default function DepthPortrait({ color, depth, alt, width, height, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  /*
   * `null` until the client has been asked. Starting at `false` would run the
   * whole WebGL setup and tear it down again one tick later for a reader who
   * asked for reduced motion, which is the one reader who should cost nothing.
   */
  const [still, setStill] = useState<boolean | null>(null);
  /* Set when the device has tilt to give and has not been asked for it yet. */
  const [offerTilt, setOfferTilt] = useState(false);
  const enableTilt = useRef<null | (() => void)>(null);

  /*
   * Tracked, not sampled once.
   *
   * This used to read the media query at mount and return. Reduced motion is a
   * setting a reader changes *because* something is moving, so the one moment
   * it matters is after the page has loaded, and that was the one moment this
   * ignored. The shader now stops when the preference is turned on and starts
   * again when it is turned off.
   */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (still !== false) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      /*
       * Keeps the last frame readable after it is presented, so the canvas can
       * be captured with `toDataURL` and compared. That is how
       * tools/check-depth-hero.mjs proves the pointer actually changes the
       * rendering; without it the read comes back blank and the only
       * alternative is a screenshot, which software WebGL is too slow to
       * complete. The cost is one extra buffer for a single quad.
       */
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    let disposed = false;
    const cleanups: Array<() => void> = [];

    /*
     * A lost context is not a rare event on a phone. Backgrounding the tab,
     * rotating the device or the system reclaiming GPU memory all take the
     * context away, and when that happens the canvas keeps its `data-live`
     * attribute and the stylesheet keeps the flat photograph hidden behind it:
     * the hero becomes an empty rectangle where a face was. Dropping back to
     * the photograph is the same fallback as having no WebGL at all.
     */
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setLive(false);
    };
    canvas.addEventListener("webglcontextlost", onContextLost);
    cleanups.push(() => canvas.removeEventListener("webglcontextlost", onContextLost));

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uShift = gl.getUniformLocation(prog, "uShift");
    const uAmount = gl.getUniformLocation(prog, "uAmount");
    gl.uniform1i(gl.getUniformLocation(prog, "uColor"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "uDepth"), 1);
    /*
     * 3.2% of the frame at full deflection. Enough to read as depth on a face
     * at this size, small enough that the silhouette does not visibly slide.
     */
    gl.uniform1f(uAmount, 0.032);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const loadTexture = (src: string, unit: number) =>
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          if (disposed) return resolve();
          const tex = gl.createTexture();
          gl.activeTexture(unit === 0 ? gl.TEXTURE0 : gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          resolve();
        };
        img.onerror = () => reject(new Error(`texture failed: ${src}`));
        img.src = src;
      });

    let raf = 0;
    const target = { x: 0, y: 0 };
    const shown = { x: 0, y: 0 };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    const onScroll = () => {
      const rect = canvas.getBoundingClientRect();
      /* Where the hero sits in the viewport, as -1 to 1. */
      const centre = (rect.top + rect.height / 2) / window.innerHeight;
      target.y = (centre - 0.5) * -1.1;
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      target.x = Math.max(-1, Math.min(1, event.gamma / 28));
      target.y = Math.max(-1, Math.min(1, (event.beta - 45) / 28));
    };

    Promise.all([loadTexture(color, 0), loadTexture(depth, 1)])
      .then(() => {
        if (disposed) return;
        setLive(true);

        const resize = () => {
          const ratio = Math.min(window.devicePixelRatio || 1, 2);
          const w = canvas.clientWidth || width;
          const h = canvas.clientHeight || height;
          canvas.width = Math.round(w * ratio);
          canvas.height = Math.round(h * ratio);
          gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener("resize", resize);
        cleanups.push(() => window.removeEventListener("resize", resize));

        window.addEventListener("pointermove", onPointer, { passive: true });
        canvas.addEventListener("pointerleave", onLeave);
        window.addEventListener("scroll", onScroll, { passive: true });
        cleanups.push(() => {
          window.removeEventListener("pointermove", onPointer);
          canvas.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("deviceorientation", onTilt);
        });

        /*
         * Tilt, and the tap iOS requires before it will give any.
         *
         * `window.addEventListener("deviceorientation", ...)` is all Android
         * Chrome needs. On iOS 13 and later the event never fires until
         * `DeviceOrientationEvent.requestPermission()` has resolved to
         * "granted", and that call is rejected unless it happens inside a user
         * gesture, so a listener added on mount is simply dead. This hero has
         * carried three inputs in its own documentation and shipped two of them
         * to every iPhone.
         *
         * Where the gate exists a reader is offered a control and nothing is
         * requested until they press it. Where it does not, the listener is
         * attached the way it always was.
         */
        if (orientationNeedsPermission()) {
          enableTilt.current = () => {
            const gate = DeviceOrientationEvent as OrientationGate;
            gate
              .requestPermission?.()
              .then((verdict) => {
                if (disposed) return;
                if (verdict === "granted") window.addEventListener("deviceorientation", onTilt);
                /* Asked and answered, either way. Nobody wants to be asked twice. */
                setOfferTilt(false);
              })
              .catch(() => setOfferTilt(false));
          };
          setOfferTilt(true);
          cleanups.push(() => {
            enableTilt.current = null;
            setOfferTilt(false);
          });
        } else {
          window.addEventListener("deviceorientation", onTilt);
        }

        /*
         * The loop runs only while the hero is on screen and the tab is in
         * front.
         *
         * It used to run from mount until navigation, at the full frame rate,
         * whether or not the portrait was anywhere near the viewport. On a
         * desktop that is invisible; on a mid-range phone it is a fragment
         * shader with four texture reads per pixel competing with the scroll of
         * every section below it, and it keeps running while the reader is in
         * another tab.
         */
        let visible = true;
        let focused = !document.hidden;
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            pump();
          },
          { rootMargin: "100px" },
        );
        observer.observe(canvas);
        const onVisibility = () => {
          focused = !document.hidden;
          pump();
        };
        document.addEventListener("visibilitychange", onVisibility);
        cleanups.push(() => {
          observer.disconnect();
          document.removeEventListener("visibilitychange", onVisibility);
        });

        /*
         * Four readings are taken after a warm-up, and a device that cannot
         * hold a readable rate gives up and shows the photograph.
         *
         * "Falls back when WebGL is missing" was true and was not the whole
         * promise: a phone with a slow GPU gets a context, compiles the shader
         * and then renders a portrait that judders every time the reader
         * scrolls, which is worse than the flat image it replaced. The warm-up
         * is skipped past because the first frames land while the rest of the
         * page is still arriving and are slow for reasons that are not the GPU.
         */
        const WARMUP = 24;
        const SAMPLE = 40;
        /* 40ms is 25 frames a second, the point where easing stops reading as motion. */
        const TOO_SLOW = 40;
        let seen = 0;
        let elapsed = 0;
        let last = 0;

        const frame = (now: number) => {
          if (last) {
            seen += 1;
            if (seen > WARMUP && seen <= WARMUP + SAMPLE) elapsed += now - last;
            if (seen === WARMUP + SAMPLE && elapsed / SAMPLE > TOO_SLOW) {
              raf = 0;
              setLive(false);
              return;
            }
          }
          last = now;

          /* Ease towards the target. 0.055 is slow enough to read as weight. */
          shown.x += (target.x - shown.x) * 0.055;
          shown.y += (target.y - shown.y) * 0.055;
          gl.uniform2f(uShift, shown.x, shown.y);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          raf = requestAnimationFrame(frame);
        };

        function pump() {
          const wanted = visible && focused && !disposed;
          if (wanted && !raf) {
            /* A gap in the timestamps is not a slow frame. */
            last = 0;
            raf = requestAnimationFrame(frame);
          } else if (!wanted && raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        }

        pump();
        cleanups.push(() => {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
        });
      })
      .catch(() => {
        /* Stays false, so the flat photograph remains visible. */
        setLive(false);
      });

    return () => {
      disposed = true;
      for (const fn of cleanups) fn();
    };
  }, [color, depth, width, height, still]);

  /*
   * Derived, not stored.
   *
   * `live` means "the textures arrived and the loop is drawing". The first
   * version of this cleared it from inside the effect when reduced motion came
   * on, which is a setState in an effect body: React treats that as a cascading
   * render and defers it. Measured, the canvas kept `data-live` for about two
   * seconds after the reduced-motion rule had already set it to
   * `display: none`, and for those two seconds the stylesheet was still hiding
   * the photograph behind a canvas that was not there. The reader saw an empty
   * box. Reading both pieces of state at render time means the attribute and
   * the media query cannot disagree, because one render decides both.
   */
  const drawing = live && still === false;

  return (
    <div className={className} style={{ position: "relative" }}>
      {/*
        * The flat photograph is always in the markup. It is what a reader sees
        * without WebGL, under reduced motion, before the textures arrive, and
        * it is what a crawler and a screen reader get. The canvas covers it
        * once the shader is actually drawing.
        */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        className="hero-portrait-img"
        decoding="async"
        fetchPriority="high"
        height={height}
        src={color}
        width={width}
      />
      <canvas
        aria-hidden="true"
        className="hero-portrait-canvas"
        data-live={drawing ? "" : undefined}
        ref={canvasRef}
      />
      {/*
        * Only on a device that has tilt to give and has not been asked yet, and
        * only once the shader is actually drawing: offering to add motion to a
        * flat photograph would be an offer the page cannot keep.
        *
        * It is a real button rather than a tap anywhere on the portrait,
        * because a permission prompt that appears from touching a photograph
        * is a prompt nobody understands, and because a keyboard reaches a
        * button.
        */}
      {drawing && offerTilt ? (
        <button
          className="hero-tilt"
          onClick={() => enableTilt.current?.()}
          type="button"
        >
          Tilt to look around
        </button>
      ) : null}
    </div>
  );
}
