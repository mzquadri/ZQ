import { SCENES } from "./scenes";
import { sceneStills } from "./stills";

/**
 * The object a flagship chapter showed, rendered again at the top of its detail route.
 *
 * The audit that produced this component found the problem exactly: on every detail route the
 * shared-element name sat on the world *below* the fold - between 661 and 1076 pixels down - while
 * on the homepage it was a full-viewport frame at the top. A browser was being asked to animate a
 * whole stage into something off screen, which can only read as a fade. Worse, the figure that did
 * appear in the hero was a different drawing of the same subject: for transport, an extruded bar
 * field where the homepage had a flat isometric network with uncertainty on it.
 *
 * So this renders the chapter's own scene at its own resting progress. Not a similar composition -
 * the same function, the same beat, the same palette. What changes across the navigation is the
 * size of the frame and nothing else, which is what makes it read as moving closer to one object
 * rather than as two pages that happen to share a topic.
 *
 * It is deliberately static and deliberately cheap: markup, no canvas, no request, no renderer. The
 * route's full world still loads underneath, and still loads late.
 */
export default function SceneIdentity({
  slug,
  viewTransitionName,
  caption,
}: {
  slug: string;
  viewTransitionName?: string;
  /** Overrides the scene's own description where the route already says it better. */
  caption?: string;
}) {
  const scene = SCENES[slug];
  if (!scene) return null;

  const stills = sceneStills(scene);

  return (
    <figure className="scn-identity">
      {/*
        The name goes on the frame, not on the figure around it. The figure includes the caption,
        so naming it handed the browser a box that was not 16 / 9 to morph a 16 / 9 chapter frame
        into - and a shape change is exactly the jump this pass exists to remove.
      */}
      <div
        className="scn-identity-frame"
        style={viewTransitionName ? { viewTransitionName } : undefined}
      >
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
      </div>
      <figcaption>
        {caption ? (
          <>
            <span>{caption}</span>
            {/* The full description of the drawing still reaches assistive technology. */}
            <span className="visually-hidden">{scene.label}</span>
          </>
        ) : (
          scene.label
        )}
      </figcaption>
    </figure>
  );
}
