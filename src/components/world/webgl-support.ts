/**
 * Whether this machine can render a world scene without hurting for it.
 *
 * The world hosts gate on three things - wide enough, motion not declined, section on screen -
 * and never asked whether WebGL is worth running here. `ShowcaseCanvas` has always asked, and
 * documents four gates for that reason; the worlds were the inconsistent ones.
 *
 * The question is not "is WebGL available". It is available on a software rasteriser too, and
 * that is the case worth excluding: a scroll-driven scene rendering continuously through
 * SwiftShader burns CPU on every frame and makes the compositor read each frame back before it
 * can be shown. On `/work/insureassist-rag` that readback is observable - ANGLE reports
 * "GPU stall due to ReadPixels" for the first frames after the drawing buffer is allocated.
 *
 * What was ruled out first, by measurement, because the obvious answers were all wrong:
 *
 *   - The page makes no readback calls of its own. readPixels, getBufferSubData, getImageData,
 *     toDataURL, toBlob, drawImage and finish were all instrumented across load, scroll and
 *     idle: zero calls. There is no application readback to remove or defer.
 *   - Not the context attributes. antialias, powerPreference and alpha were each forced both
 *     ways at runtime; the stall is identical in all six combinations.
 *   - Not the compositing around the canvas. Promoting it to its own layer, removing the
 *     ancestor clip, isolating the stacking context and removing the host background all leave
 *     it unchanged.
 *   - Not an oversized buffer. The drawing buffer matches the canvas box exactly.
 *   - Not WebGL as such. A bare WebGL canvas on the same rasteriser is silent, so this is the
 *     cost of rendering a real scene through software, not a fixed overhead.
 *
 * And on hardware the stall does not exist at all: headless with ANGLE/D3D11, headless with the
 * GPU enabled, and a headed browser all report zero. Only the software path pays.
 *
 * So the honest fix is not to make the readback cheaper - nothing in the application asks for
 * it - but to stop asking a software rasteriser to run a 3D scene. The flat figure underneath is
 * a complete drawing rather than a placeholder, which is what makes that an acceptable answer.
 *
 * The check fails OPEN. If the renderer cannot be identified - the debug extension is absent, as
 * it is behind a pref in some browsers - the scene runs. A reader with a perfectly good GPU must
 * never lose the visual because we could not read its name.
 */

/**
 * Renderer names that mean "no GPU is doing this". Matched case-insensitively against
 * `WEBGL_debug_renderer_info`, which is the only place the underlying device is named.
 */
const SOFTWARE_RENDERERS = [
  "swiftshader", // Chromium's bundled rasteriser, and what headless uses by default
  "llvmpipe", // Mesa's software path
  "softpipe",
  "basic render", // "Microsoft Basic Render Driver"
  "software adapter",
  "generic renderer",
];

let cached: boolean | null = null;

export function worldRenderingIsWorthIt(): boolean {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return false;

  cached = (() => {
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    try {
      const canvas = document.createElement("canvas");
      gl = (canvas.getContext("webgl2") ??
        canvas.getContext("webgl")) as WebGL2RenderingContext | null;
      if (!gl) return false;

      const info = gl.getExtension("WEBGL_debug_renderer_info");
      if (!info) return true; // Cannot tell. Assume hardware; see "fails open" above.

      const renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "").toLowerCase();
      if (!renderer) return true;

      return !SOFTWARE_RENDERERS.some((name) => renderer.includes(name));
    } catch {
      return false;
    } finally {
      // The probe context counts against the browser's WebGL context limit, so hand it back
      // rather than waiting for it to be collected.
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    }
  })();

  return cached;
}

/** Test seam: lets a spec assert both sides of the gate without a second browser. */
export function __resetWorldRenderingCache() {
  cached = null;
}
