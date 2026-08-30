import type { SceneDefinition } from "./scene";
import { SvgSurface } from "./surface";

/**
 * A scene's resting composition, as markup.
 *
 * Both places a flagship object appears render it through here: the homepage chapter, where it is
 * the still under the scrubbing canvas, and the detail route's opening, where it is the whole
 * figure. That is the entire mechanism behind the continuity - the two sides are not *similar*
 * compositions, they are the same function evaluated at the same progress, so a reader arriving on
 * the detail page is looking at the object they just clicked rather than a second illustration of
 * the same subject.
 *
 * Evaluated on the server, so neither side costs a request or a decode.
 */
export function sceneStills(scene: SceneDefinition, progress = scene.rest) {
  const wide = new SvgSurface(scene.width, scene.height);
  scene.draw(wide, progress, scene.palette);

  const tall = new SvgSurface(scene.portraitWidth, scene.portraitHeight);
  scene.draw(tall, progress, scene.palette);

  return {
    wide: { markup: wide.markup(), viewBox: `0 0 ${scene.width} ${scene.height}` },
    tall: { markup: tall.markup(), viewBox: `0 0 ${scene.portraitWidth} ${scene.portraitHeight}` },
  };
}
