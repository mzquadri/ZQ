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
  /*
   * The ground goes in first, as a rect, which is what `Palette.ground` has always said it was
   * for: "Canvas clears to this; the SVG paints it as a backing rect." It did not, and the
   * omission was visible on every chapter page in the light theme.
   *
   * A scene's palette is fixed dark - the canvas clears to #0b0f14 and the ink is #f2f0e8 - while
   * every surface these stills are mounted on takes `var(--stage)`, which follows the theme. In
   * the light theme that left near-white type and pale accents painted straight onto near-white
   * paper: measured on production, the CIFAR hero rendered as faint pastel squares with its
   * caption at a contrast ratio no reader could work with. The canvas never had the bug because
   * it fills its own ground before drawing; only the markup did.
   */
  const wide = new SvgSurface(scene.width, scene.height);
  wide.rect(0, 0, scene.width, scene.height, { fill: scene.palette.ground });
  scene.draw(wide, progress, scene.palette);

  const tall = new SvgSurface(scene.portraitWidth, scene.portraitHeight);
  tall.rect(0, 0, scene.portraitWidth, scene.portraitHeight, { fill: scene.palette.ground });
  scene.draw(tall, progress, scene.palette);

  return {
    wide: { markup: wide.markup(), viewBox: `0 0 ${scene.width} ${scene.height}` },
    tall: { markup: tall.markup(), viewBox: `0 0 ${scene.portraitWidth} ${scene.portraitHeight}` },
  };
}
