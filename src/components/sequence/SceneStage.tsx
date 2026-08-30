import type { ReactNode } from "react";

import SceneCanvas from "./SceneCanvas";
import { SCENES } from "./scenes";
import { sceneStills } from "./stills";

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

  /*
   * The same helper the detail route's opening figure uses, so the two sides of a navigation are
   * the identical drawing at the identical progress rather than two compositions that resemble
   * each other. That is what carries the continuity when there is no View Transitions support.
   */
  const stills = sceneStills(scene);

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
            dangerouslySetInnerHTML={{ __html: stills.wide.markup }}
            preserveAspectRatio="xMidYMid meet"
            viewBox={stills.wide.viewBox}
          />
          <svg
            aria-hidden="true"
            className="scn-still scn-still-tall"
            dangerouslySetInnerHTML={{ __html: stills.tall.markup }}
            preserveAspectRatio="xMidYMid meet"
            viewBox={stills.tall.viewBox}
          />
          <SceneCanvas slug={slug} />
          <figcaption className="visually-hidden">{scene.label}</figcaption>
        </figure>
        {children ? <div className="scn-plate">{children}</div> : null}
      </div>
    </div>
  );
}
