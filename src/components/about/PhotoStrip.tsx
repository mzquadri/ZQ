"use client";

import { useEffect, useRef } from "react";

import { aboutPhotos, PHOTO_WIDTHS } from "@/content/about-photos";

/**
 * The photographs on the About page, with a light parallax.
 *
 * Much lighter than the hero: no WebGL, no depth map, no shader. Each
 * photograph simply drifts a little slower than the page it sits on, which is
 * enough movement for a set of snapshots and does not ask a reader to look at
 * them as an effect.
 *
 * The drift is written to a CSS custom property and applied with `translate3d`,
 * so the compositor does the work and nothing re-lays-out while scrolling.
 *
 * Nothing moves under reduced motion. The effect is decorative in a way the
 * hero's is not, so it is simply turned off rather than given a resting state.
 */
export default function PhotoStrip() {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const figures = Array.from(root.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (figures.length === 0) return;

    let raf = 0;
    let queued = false;

    const apply = () => {
      queued = false;
      const h = window.innerHeight;
      for (const fig of figures) {
        const rect = fig.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > h + 200) continue;
        /* -1 at the bottom of the viewport, 1 at the top. */
        const centre = (rect.top + rect.height / 2) / h;
        const offset = (0.5 - centre) * 2;
        /* Alternating direction, so a row of photographs does not move as a block. */
        const dir = Number(fig.dataset.parallax) % 2 === 0 ? 1 : -1;
        fig.style.setProperty("--drift", `${(offset * 14 * dir).toFixed(2)}px`);
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <ul className="photo-strip" ref={ref}>
      {aboutPhotos.map((photo, index) => (
        <li key={photo.stem}>
          <figure
            className="photo-figure"
            data-parallax={index}
            /*
             * `croppable` reaches the DOM because the CSS needs it: a photograph
             * whose licence requires the whole item is laid out with
             * `object-fit: contain`, and one that may be cropped uses `cover`
             * so a row of mixed aspect ratios still lines up.
             */
            data-whole={photo.croppable ? undefined : ""}
          >
            {/*
              * Two widths and a `sizes` hint, because one file was four times
              * the pixels anyone sees: the strip renders each photograph at
              * about 283 CSS pixels on a desktop, and a single 1280px file was
              * being shipped for it. `sizes` has to describe the *layout*, not
              * the file, or the browser picks from the wrong column.
              *
              * eslint-disable because next/image would re-encode these at a
              * width of its own choosing, and the Parliament photograph has a
              * licence condition about not being cropped that is easier to hold
              * when this file controls the geometry.
              */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={photo.alt}
              decoding="async"
              height={photo.height}
              loading="lazy"
              sizes="(max-width: 640px) 92vw, (max-width: 1100px) 44vw, 290px"
              src={`/media/about/${photo.stem}-560.webp`}
              srcSet={PHOTO_WIDTHS.map((w) => `/media/about/${photo.stem}-${w}.webp ${w}w`).join(", ")}
              width={photo.width}
            />
            <figcaption>
              {photo.caption}
              {photo.credit ? <span className="photo-credit">{photo.credit}</span> : null}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
