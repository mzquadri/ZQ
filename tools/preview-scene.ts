/**
 * Render one scene at several progress values, as PNGs, without building the site.
 *
 * A scene is a pure function of progress, which is the property this exploits: the whole drawing
 * can be evaluated outside a browser, so checking that a new scene composes - that nothing
 * overlaps the caption plate, that no beat is empty, that the resting frame is the informative one
 * - costs a second rather than a build and a deploy.
 *
 * Both orientations are rendered, because a scene that works at 1280x720 and collapses at 780x980
 * is the usual failure and only ever shows up in the tall frame.
 *
 * Usage: npx tsx tools/preview-scene.ts <slug> [outDir] [--steps 6]
 */
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

import { SCENES } from "../src/components/sequence/scenes";
import { SvgSurface } from "../src/components/sequence/surface";
import type { SceneDefinition } from "../src/components/sequence/scene";

const slug = process.argv[2];
const outDir = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : "media/scene-preview";
const stepsArg = process.argv.indexOf("--steps");
const STEPS = stepsArg === -1 ? 6 : Number(process.argv[stepsArg + 1]);

const scene: SceneDefinition | undefined = SCENES[slug];
if (!scene) {
  console.error(`no scene for "${slug}". Known: ${Object.keys(SCENES).sort().join(", ")}`);
  process.exit(1);
}

function render(scene: SceneDefinition, progress: number, portrait: boolean) {
  const w = portrait ? scene.portraitWidth : scene.width;
  const h = portrait ? scene.portraitHeight : scene.height;
  const surface = new SvgSurface(w, h);
  scene.draw(surface, progress, scene.palette);
  /*
   * The font stack carries a quoted family - `"Courier New"` - inside a double-quoted attribute.
   * In the page that is harmless, because the markup is parsed by the HTML parser, which is what
   * it is written for. A standalone rasteriser parses XML and rejects it, so the preview rewrites
   * those inner quotes. Nothing that ships is affected; this is a property of reading the drawing
   * outside a browser.
   */
  const body = surface.markup().split('"Courier New"').join("'Courier New'");
  return {
    elements: surface.size(),
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">` +
      `<rect width="${w}" height="${h}" fill="${scene.palette.ground}"/>${body}</svg>`,
  };
}

/* Wrapped rather than written at the top level: tsx transforms this file to CommonJS. */
async function main(scene: SceneDefinition) {
  await mkdir(outDir, { recursive: true });

  for (const portrait of [false, true]) {
    const shape = portrait ? "tall" : "wide";
    for (let i = 0; i < STEPS; i += 1) {
      const progress = i / (STEPS - 1);
      const { svg, elements } = render(scene, progress, portrait);
      const name = `${slug}-${shape}-${String(Math.round(progress * 100)).padStart(3, "0")}`;
      await writeFile(`${outDir}/${name}.svg`, svg);
      await sharp(Buffer.from(svg)).png().toFile(`${outDir}/${name}.png`);
      console.log(`${name}  ${elements} elements`);
    }
  }

  /*
   * The resting frame is the one that ships in the HTML and the one a reduced-motion reader sees,
   * so its element count is the page-weight number worth knowing.
   */
  const rest = render(scene, scene.rest, false);
  console.log(`\nresting frame: ${rest.elements} elements, ${(rest.svg.length / 1024).toFixed(1)} KiB of SVG`);
  console.log(`label: ${scene.label.length} characters`);
}

void main(scene);
