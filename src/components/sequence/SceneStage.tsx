import type { ReactNode } from "react";

import SceneCanvas from "./SceneCanvas";
import { SCENES } from "./scenes";
import { SvgSurface } from "./surface";

/**
 * A flagship chapter, as a full stage.
 *
 * The composition is the one every reference for this rebuild converges on: a full-bleed object
 * with the title and the one measured line at the lower left, and scroll as the thing that opens
 * it. What differs here is what is behind the glass. There is no video and no frame sequence: the
 * still below is produced at build time by running the chapter's own drawing function at its
 * resting progress, and the canvas over it runs the identical function as the reader scrolls.
 *
 * Consequences worth stating, because they are the reason for the design:
 *
 *   - **Nothing is fetched.** The resting picture is markup. There is no poster request, no decode,
 *     and no window in which the chapter is a grey box.
 *   - **No layout shift is possible.** The frame reserves its ratio and the still fills it from the
 *     first paint.
 *   - **Reduced motion is the same picture.** Not a fallback, not a cropped frame: the exact
 *     composition the scene comes to rest at, at full resolution.
 *   - **It is sharp at any size.** Ninety fixed-width frames never were.
 */
export default function SceneStage({
  slug,
  viewTransitionName,
  children,
}: {
  slug: string;
  viewTransitionName?: string;
  children?: ReactNode;
}) {
  const scene = SCENES[slug];
  if (!scene) return null;

  const wide = new SvgSurface(scene.width, scene.height);
  scene.draw(wide, scene.rest, scene.palette);

  const tall = new SvgSurface(scene.portraitWidth, scene.portraitHeight);
  scene.draw(tall, scene.rest, scene.palette);

  return (
    <div
      className="scn"
      style={
        {
          "--scn-travel": String(scene.travel),
          "--scn-travel-portrait": String(scene.portraitTravel),
        } as React.CSSProperties
      }
    >
      <div className="scn-pin">
        <figure className="scn-frame" style={viewTransitionName ? { viewTransitionName } : undefined}>
          {/*
            Two stills, one per orientation, and only one is ever displayed. A phone gets a
            restacked composition rather than a wide one letterboxed into a tall screen, which is
            the difference between a mobile design and a desktop screenshot.

            Both are hidden from assistive technology and the description is carried once, by the
            caption below, so a screen reader hears the picture described once rather than twice.
          */}
          <svg
            aria-hidden="true"
            className="scn-still scn-still-wide"
            dangerouslySetInnerHTML={{ __html: wide.markup() }}
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${scene.width} ${scene.height}`}
          />
          <svg
            aria-hidden="true"
            className="scn-still scn-still-tall"
            dangerouslySetInnerHTML={{ __html: tall.markup() }}
            preserveAspectRatio="xMidYMid meet"
            viewBox={`0 0 ${scene.portraitWidth} ${scene.portraitHeight}`}
          />
          <SceneCanvas slug={slug} />
          <figcaption className="visually-hidden">{scene.label}</figcaption>
        </figure>
        {children ? <div className="scn-plate">{children}</div> : null}
      </div>
    </div>
  );
}
