import { graphEdges, graphMaxHop, graphNodes, GRAPH } from "@/content/cinema-geometry";
import { calibration, selective } from "@/content/thesis-world";

import {
  beat,
  blend,
  caption,
  focus,
  hash01,
  mix,
  palette,
  type Palette,
  type SceneDefinition,
} from "../scene";
import type { Surface } from "../surface";

/**
 * Transport surrogate: a network, and how sure it is.
 *
 * Eight beats, and the gaps between them are where the scene stops so a reader can look at it:
 *
 *   rest   the road network, complete and flat. This is the still in the HTML.
 *   0.06   one junction is intervened on
 *   0.20   the effect propagates outward, ring by ring, along real hop distance
 *   0.38   the network lifts - height is hop distance, the thesis' own coordinate
 *   0.56   a prediction appears at every junction
 *   0.70   uncertainty separates from the prediction and grows with distance
 *   0.84   calibration: the reliability curve snaps toward the diagonal
 *   0.94   selective review: the least confident tenth is sent to a person
 *
 * Two honesty notes, because the picture would otherwise assert more than the repository does.
 *
 * The per-junction magnitudes are structural, not predictions. What is real - and what the thesis
 * reports - is that uncertainty grows with distance from the intervention; the individual heights
 * are a deterministic function of hop distance, and no junction here claims a value.
 *
 * And calibration does not narrow anything. The tracked curve is *under*-covering before scaling:
 * 0.0479 observed at a nominal 0.1. Temperature scaling widens the intervals until they mean what
 * they say, which is why the bands in this scene grow at the calibration beat rather than shrink.
 * The number that falls is the calibration error, 0.2687 to 0.0479, and it is drawn as the gap
 * between the curve and the diagonal closing.
 */

const CX = GRAPH.width / 2;
const CY = GRAPH.height / 2;

/** Retention endpoints, straight from the tracked selective-prediction table. */
const KEEP = selective.find((row) => row.retention === 10)!;
const ALL = selective.find((row) => row.retention === 100)!;

interface Placed {
  x: number;
  y: number;
  hop: number;
  id: number;
  /** Structural, not a prediction. Rises with distance from the intervention. */
  spread: number;
}

function layout(s: Surface, lift: number, spin: number): Placed[] {
  const f = focus(s);
  const scale = (f.r * 2) / Math.max(GRAPH.width, GRAPH.height * 1.5);

  return graphNodes.map((n) => {
    const dx = n.x - CX;
    const dy = n.y - CY;
    const rx = dx * Math.cos(spin) - dy * Math.sin(spin);
    const ry = dx * Math.sin(spin) + dy * Math.cos(spin);
    const hop = n.hop / Math.max(1, graphMaxHop);
    /*
     * Height is hop distance, and the whole network sinks as it rises. Without the counterweight
     * the far ring lifts straight out of the top of the frame; with it the object stays in the
     * same square of the stage and only its shape changes, which is what makes it read as one
     * thing being opened rather than two compositions cut together.
     */
    const z = hop * GRAPH.height * 0.34 * lift;
    const sink = lift * f.r * 0.34;
    return {
      id: n.id,
      hop: n.hop,
      x: f.x + rx * scale,
      y: f.y + sink + (ry * (0.6 + 0.4 * (1 - lift)) - z) * scale,
      spread: 0.22 + hop * 0.62 + (hash01(n.id * 977) - 0.5) * 0.2,
    };
  });
}

/** The tracked reliability curve, drawn as an inset. Real numbers, no interpolation of my own. */
function reliability(s: Surface, p: Palette, appear: number, mixTo: number) {
  if (appear <= 0.01) return;
  const size = s.unit * (s.portrait ? 0.32 : 0.24);
  /* Top right on a wide stage, below the network on a phone. Never over the plate. */
  const x = s.portrait ? (s.w - size) / 2 : s.w - size - s.w * 0.05;
  const y = s.portrait ? s.h * 0.63 : s.h * 0.07;

  s.rect(x, y, size, size, { fill: p.ground, alpha: 0.9 * appear });
  s.rect(x, y, size, size, { stroke: p.line, width: 1, alpha: appear });
  /* The diagonal is what a calibrated model would follow. */
  s.line(x, y + size, x + size, y, { stroke: p.soft, width: 1, dash: [4, 4], alpha: 0.55 * appear });

  const pts = calibration.nominal.map((nominal, i) => {
    const observed = mix(calibration.before[i], calibration.after[i], mixTo);
    return [x + nominal * size, y + size - observed * size] as const;
  });
  s.poly(pts, {
    stroke: blend(p.warn, p.accent, mixTo),
    width: 2,
    alpha: appear,
    cap: "round",
  });

  const label = mixTo > 0.5 ? `ECE ${calibration.eceAfter}` : `ECE ${calibration.eceBefore}`;
  s.text(x, y - size * 0.08, label, {
    size: s.unit * 0.026,
    fill: blend(p.warn, p.accent, mixTo),
    mono: true,
  });
  s.text(x + size / 2, y + size + size * 0.16, "nominal vs observed", {
    size: s.unit * 0.022,
    fill: p.soft,
    alpha: 0.85 * appear,
    mono: true,
    anchor: "middle",
  });
}

function draw(s: Surface, progress: number, p: Palette) {
  const intervene = beat(progress, 0.06, 0.14);
  const propagate = beat(progress, 0.2, 0.32);
  const lift = beat(progress, 0.38, 0.5);
  const predict = beat(progress, 0.56, 0.64);
  const uncertain = beat(progress, 0.7, 0.78);
  const calibrate = beat(progress, 0.84, 0.91);
  const review = beat(progress, 0.94, 0.99);

  /* One slow continuous turn across the whole scene. Never a cut. */
  const spin = beat(progress, 0.0, 1.0) * 0.5;
  const nodes = layout(s, lift, spin);

  /* Edges first, so junctions sit on them. An edge lights when the wavefront crosses it. */
  for (const e of graphEdges) {
    const a = nodes[e.a];
    const b = nodes[e.b];
    const front = Math.max(0, Math.min(1, propagate * (graphMaxHop + 1) - e.hop));
    s.line(a.x, a.y, b.x, b.y, {
      stroke: blend(p.line, p.accent, front * 0.85),
      width: front > 0.4 ? 1.6 : 1,
      alpha: 0.5 + front * 0.5,
    });
  }

  for (const n of nodes) {
    const reached = Math.max(0, Math.min(1, propagate * (graphMaxHop + 1) - n.hop));
    const source = n.hop === 0;

    /* Prediction: a stem at the junction. Structural magnitude, never a claimed value. */
    if (predict > 0.01) {
      const height = (0.1 + n.spread * 0.5) * s.unit * 0.16 * predict;
      s.line(n.x, n.y, n.x, n.y - height, {
        stroke: p.accent,
        width: 2,
        alpha: 0.75 * predict,
        cap: "round",
      });
    }

    /*
     * Uncertainty, drawn as a band around the prediction. It grows with hop distance, which is the
     * finding; calibration then widens every band to its honest width rather than tightening it.
     */
    if (uncertain > 0.01) {
      const width = n.spread * s.unit * 0.085 * uncertain * (1 + calibrate * 0.45);
      const reviewed = n.spread > 0.62;
      const colour = reviewed && review > 0.5 ? p.warn : blend(p.accent, p.warn, n.spread * 0.75);
      s.line(n.x, n.y - width, n.x, n.y + width, {
        stroke: colour,
        width: s.unit * 0.006,
        alpha: (0.55 + 0.35 * uncertain) * (reviewed && review > 0.5 ? 1 : 1 - review * 0.5),
        cap: "round",
      });
      /* Caps, so the band reads as an interval with ends rather than a smear. */
      const capW = s.unit * 0.012;
      for (const dy of [-width, width]) {
        s.line(n.x - capW, n.y + dy, n.x + capW, n.y + dy, {
          stroke: colour,
          width: 1.2,
          alpha: 0.7 * uncertain,
        });
      }
    }

    const r = s.unit * (source ? 0.013 : 0.008) * (1 + reached * 0.35 + intervene * (source ? 0.6 : 0));
    s.circle(n.x, n.y, r, {
      fill: source ? p.ink : blend(p.line, p.accent, 0.3 + reached * 0.7),
    });
  }

  /* The intervention itself: a ring leaving the junction it started at. */
  if (intervene > 0.01 && propagate < 0.99) {
    const source = nodes[0];
    const r = s.unit * (0.02 + propagate * 0.42);
    s.circle(source.x, source.y, r, {
      stroke: p.ink,
      width: 1.5,
      alpha: (1 - propagate) * 0.7 * intervene,
    });
  }

  reliability(s, p, calibrate, calibrate);

  /* One line of type at a time, clear of the plate, and only where a number is real. */
  const c = caption(s);
  const say = (line: string, alpha: number, fill: string, row = 0) => {
    if (alpha <= 0.02) return;
    s.text(c.x, c.y + row * c.step, line, {
      size: c.size,
      fill,
      alpha,
      mono: true,
      anchor: c.anchor,
    });
  };

  if (review > 0.05) {
    say(`most confident 10%  ·  MAE ${KEEP.mae.toFixed(2)}`, review, p.ink);
    say(`everything          ·  MAE ${ALL.mae.toFixed(2)}`, review * 0.8, p.soft, 1);
  } else if (uncertain > 0.05) {
    say("uncertainty grows with distance from the intervention", uncertain * (1 - calibrate * 0.7), p.ink);
  } else if (lift > 0.05) {
    say("height is hop distance from the intervention", lift * (1 - predict * 0.8), p.ink);
  } else if (intervene > 0.05) {
    say("one junction changes", intervene * (1 - propagate * 0.7), p.ink);
  }
}

export const transport: SceneDefinition = {
  width: 1280,
  height: 720,
  portraitWidth: 780,
  portraitHeight: 980,
  travel: 3.2,
  portraitTravel: 2.6,
  rest: 0,
  label:
    "A road network of twenty-five junctions. One junction is intervened on and the effect propagates outward along real hop distance; the network then lifts so that height carries that distance, a prediction appears at each junction, and a band of uncertainty grows around it with distance from the intervention. A reliability inset shows the tracked calibration curve moving from 0.2687 to 0.0479 expected calibration error, and the least confident junctions are finally marked for human review.",
  palette: palette("graph"),
  draw,
};
