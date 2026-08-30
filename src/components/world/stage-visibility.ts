"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Two questions about a world, which had been collapsed into one.
 *
 * "Has this reader ever reached the section?" decides whether the WebGL bundle is downloaded and
 * a rendering context is created. It is deliberately one-way: tearing a context down when the
 * section scrolls off would mean rebuilding it - and re-uploading every buffer - the moment the
 * reader scrolled back, which is both slower and visible.
 *
 * "Is the section on screen right now?" decides whether that context should be drawing. Nothing
 * about it is one-way, and until now nothing asked it at all. Every world mounted once and then
 * rendered for the rest of the session, because react-three-fiber's default frameloop is
 * "always" and the mount gate never flipped back. A continuous capture of the detail routes put
 * numbers on what that costs: parked at the bottom of a page, with the world thousands of pixels
 * above the viewport, the hydrology stage was still issuing about 4,700 draw calls a second and
 * the reliable-knowledge stage about 1,000. The reader was reading prose at 20 fps while a
 * renderer they had finished with fought them for the main thread.
 *
 * So the two gates are separated. The mount gate keeps its shrunken root, because its job is to
 * keep a megabyte of renderer out of the first screen. The visibility gate uses the real
 * viewport, because its job is to answer whether anyone can see the result.
 */
export function useStageVisibility(host: RefObject<HTMLElement | null>, eligible: boolean) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!eligible || !element) return;

    /*
     * The bottom of the root is pulled up by a third, so the section has to reach the upper two
     * thirds of the viewport before the renderer is fetched. A plain zero margin was not enough:
     * a world sitting under a hero shorter than one viewport is already intersecting on load, and
     * the renderer arrived as part of the initial page weight.
     */
    const arrival = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setMounted(true)),
      { rootMargin: "0px 0px -35% 0px" },
    );
    arrival.observe(element);

    /*
     * Whether it is on screen at all, against the true viewport. A small positive margin means a
     * world that is one scroll-tick away is already running, so returning to it never shows a
     * stalled first frame.
     */
    const onScreen = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setVisible(entry.isIntersecting)),
      { rootMargin: "200px 0px 200px 0px" },
    );
    onScreen.observe(element);

    return () => {
      arrival.disconnect();
      onScreen.disconnect();
    };
  }, [eligible, host]);

  /* Never claim to be drawing before there is something to draw with. */
  return { mounted, drawing: mounted && visible };
}
