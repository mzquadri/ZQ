import { PROJECT_WORLDS } from "@/components/cinema/project-worlds";
import SceneStage from "@/components/sequence/SceneStage";
import { SCENES } from "@/components/sequence/scenes";

/**
 * The project's own object, opening under the reader's scroll.
 *
 * The hero shows this drawing at rest, small, beside the title. This is the same drawing on a
 * full-bleed pinned stage, evaluated at whatever progress the scroll is at - so what a reader does
 * here is open the thing they just looked at, rather than meet a second illustration of the same
 * topic.
 *
 * It sits above the WebGL world rather than instead of it. The two are not alternatives and they
 * fail differently: a world is gated on viewport width, on a renderer that is not a software
 * rasteriser, and on motion being wanted, so on a phone or under reduced motion there is no world
 * at all. This renders everywhere, because the resting composition is SSR'd SVG in the HTML and
 * the canvas over it is an enhancement. On a phone this is the only moving stage a page has.
 *
 * ### Why the plate carries the question rather than the title
 *
 * These scenes are composed for a stage with type over its lower left - `focus()` puts every
 * subject clear of that corner, which is why a scene rendered without a plate has an empty third.
 * The plate is therefore not decoration, it is the other half of the composition.
 *
 * What goes in it is chosen not to repeat the hero immediately above: the hero gives the title,
 * the summary and the role, so the plate gives the one engineering question the project answers
 * and the one measured line that answers it. That pairing is what the homepage chapter showed over
 * this same drawing.
 */
export default function CaseScene({ slug }: { slug: string }) {
  if (!SCENES[slug]) return null;
  const world = PROJECT_WORLDS[slug];

  return (
    <SceneStage slug={slug}>
      {world ? (
        <div className="chapter-plate" style={{ "--accent": world.accent } as React.CSSProperties}>
          <p className="chapter-plate-eyebrow">{world.eyebrow}</p>
          <p className="chapter-plate-question">{world.question}</p>
          <p className="chapter-plate-evidence">
            <span>{world.evidence.label}</span>
            <strong>{world.evidence.value}</strong>
          </p>
        </div>
      ) : null}
    </SceneStage>
  );
}
