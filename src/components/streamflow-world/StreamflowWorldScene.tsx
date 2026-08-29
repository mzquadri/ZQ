"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import { importances } from "@/content/streamflow-world";
import {
  LANES,
  SPAN_X,
  SPAN_Y,
  SPLIT_X,
  bars,
  barMax,
  monthlyPoints,
  series,
  test,
  x,
  y,
  zoomPoints,
  zoomY,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A bench, not a landscape.
 *
 * Everything is a measurement laid out along one time axis, with depth used for the three
 * leaderboard rows rather than for uncertainty. The hydrology world used depth for disagreement
 * between realisations; using it the same way here would make two different projects look like
 * one template, so depth means something else: which model, and what it was asked.
 *
 * Colour carries the argument. Neutral white is always the truth. Teal is a prediction. Amber is
 * error, and appears nowhere else - so the amber band under the baseline is the finding, not
 * decoration.
 */

const TRUTH = new THREE.Color("#e8edf1");
const HISTORY = new THREE.Color("#6f9dc4");
const PRED = new THREE.Color("#4cc4b0");
const ERROR = new THREE.Color("#f0a03c");
const GRID = new THREE.Color("#2b333a");
const DIMMED = new THREE.Color("#4a565f");

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/** Every line in this scene is a primitive: React's SVG `line` wins the JSX name. */
function makeLine(points: THREE.Vector3[], colour: THREE.Color) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: colour, opacity: 0, transparent: true });
  return new THREE.Line(geometry, material);
}

/* ------------------------------------------------------------------ */
/* The bench floor.                                                     */
/* ------------------------------------------------------------------ */

function Bench({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  const object = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i += 1) {
      const px = -SPAN_X / 2 + (SPAN_X * i) / 12;
      pts.push(new THREE.Vector3(px, 0, -2.1), new THREE.Vector3(px, 0, 2.1));
    }
    for (let i = 0; i <= 6; i += 1) {
      const pz = -2.1 + (4.2 * i) / 6;
      pts.push(new THREE.Vector3(-SPAN_X / 2, 0, pz), new THREE.Vector3(SPAN_X / 2, 0, pz));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({ color: GRID, opacity: 0, transparent: true });
    return new THREE.LineSegments(geometry, material);
  }, []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const seg = node.children[0] as THREE.LineSegments;
    const on = Math.max(at(p, "series"), at(p, "incomparable"));
    (seg.material as THREE.LineBasicMaterial).opacity = on * 0.34 * (1 - at(p, "limits") * 0.5);
  });

  return (
    <group ref={group}>
      <primitive object={object} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The leaderboard: three bars, the shape the result is usually read in.*/
/* ------------------------------------------------------------------ */

function Leaderboard({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    /* Present at the open, and again at the end once the reader knows what it hides. */
    /*
     * The opening only. `at` holds at 1 once a state has passed, so this is a countdown from the
     * series rather than a difference - and the bars do not come back for the comparison, where
     * they collided with the three lanes and said nothing the readout was not already saying.
     */
    const show = Math.max(0, 1 - at(p, "series") * 2.4);
    node.visible = show > 0.02;
    node.children.forEach((child, i) => {
      const bar = child as THREE.Mesh;
      const h = (bars[i].height / barMax) * SPAN_Y * 0.85 * show;
      bar.scale.set(1, Math.max(0.01, Math.abs(h)), 1);
      bar.position.set(bars[i].x, h / 2, 0);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = show * 0.85;
      /* The row that scores below zero is the one the world spends longest on. */
      material.color.copy(bars[i].r2 < 0 ? ERROR : PRED);
    });
  });

  return (
    <group ref={group} visible={false}>
      {bars.map((b) => (
        <mesh key={b.key}>
          <boxGeometry args={[0.86, 1, 0.86]} />
          <meshBasicMaterial color={PRED} opacity={0} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The full record.                                                     */
/* ------------------------------------------------------------------ */

function Series({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  const object = useMemo(
    () => makeLine(series.map((p) => new THREE.Vector3(x(p.t), y(p.q), 0)), HISTORY),
    [],
  );

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const line = node.children[0] as THREE.Line;
    const draw = at(p, "series");
    /* Recedes once a single model's lane is the subject, returns for the comparison. */
    const focus = Math.max(at(p, "naive"), at(p, "xgboost"), at(p, "onestep"));
    const back = Math.max(at(p, "incomparable"), at(p, "limits"));
    (line.material as THREE.LineBasicMaterial).opacity =
      Math.min(1, draw * 2.2) * mix(1, 0.22, focus * (1 - back));
    line.geometry.setDrawRange(0, Math.max(2, Math.floor(series.length * draw)));
  });

  return (
    <group ref={group}>
      <primitive object={object} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The chronological cut.                                               */
/* ------------------------------------------------------------------ */

function SplitWall({ frame }: { frame: FrameRef }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = ref.current;
    if (!node) return;
    /* Clears once the first lane arrives; it has made its point by then. */
    const show = Math.max(0, at(p, "split") - at(p, "naive"));
    node.visible = show > 0.02;
    const h = SPAN_Y * 1.2 * show;
    node.position.set(SPLIT_X, h / 2, 0);
    node.scale.set(1, Math.max(0.01, h), 1);
    (node.material as THREE.MeshBasicMaterial).opacity = show * 0.7;
  });

  return (
    <mesh ref={ref} visible={false}>
      {/* Thin in depth: the series lives at z = 0, so a deep slab reads as an object beside it
          rather than as a cut through it. */}
      <boxGeometry args={[0.03, 1, 0.42]} />
      <meshBasicMaterial color={TRUTH} opacity={0} transparent />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* One model's lane: its prediction against the truth, at its own       */
/* resolution, with the error between them drawn as a surface.          */
/* ------------------------------------------------------------------ */

function Lane({
  frame,
  lane,
  actual,
  predicted,
  colour,
  show,
  hide,
  errorFrom,
  points,
  returns,
  mapY,
}: {
  frame: FrameRef;
  lane: number;
  actual: { t: number; q: number }[];
  predicted: { t: number; q: number }[] | null;
  colour: THREE.Color;
  show: Parameters<typeof at>[1];
  /**
   * State at which this lane clears again.
   *
   * `at` holds at 1 once its state has passed, so without this every lane stays on screen for the
   * rest of the sequence and the later states are read through three earlier ones.
   */
  hide: Parameters<typeof at>[1];
  /** Whether the lane comes back for the side-by-side comparison. */
  returns?: boolean;
  /** State from which the gap between the two lines is filled in. */
  errorFrom?: Parameters<typeof at>[1];
  /** Draw the truth as separated points rather than a line, for a coarser resolution. */
  points?: boolean;
  /** Vertical mapping, when this lane needs a scale of its own rather than the shared one. */
  mapY?: (q: number) => number;
}) {
  const group = useRef<THREE.Group>(null);

  const { truthLine, predLine, gap } = useMemo(() => {
    const vy = mapY ?? y;
    const t = makeLine(actual.map((p) => new THREE.Vector3(x(p.t), vy(p.q), 0)), TRUTH);
    const pr = predicted
      ? makeLine(predicted.map((p) => new THREE.Vector3(x(p.t), vy(p.q), 0)), colour)
      : null;

    let g: THREE.Mesh | null = null;
    if (predicted) {
      const positions: number[] = [];
      const indices: number[] = [];
      actual.forEach((p, i) => {
        const px = x(p.t);
        positions.push(px, vy(p.q), 0, px, vy(predicted[i].q), 0);
        if (i < actual.length - 1) {
          const a = i * 2;
          indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      g = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: ERROR,
          depthWrite: false,
          opacity: 0,
          side: THREE.DoubleSide,
          transparent: true,
        }),
      );
    }
    return { truthLine: t, predLine: pr, gap: g };
  }, [actual, predicted, colour, mapY]);

  const marks = useMemo(() => (points ? actual : []), [points, actual]);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const own = Math.max(0, at(p, show) - at(p, hide));
    const back = returns ? Math.max(0, at(p, "incomparable") - at(p, "limits")) : 0;
    const on = Math.max(own, back);
    node.visible = on > 0.02;
    node.position.z = lane * at(p, "incomparable");

    let i = 0;
    const truth = node.children[i++] as THREE.Line;
    (truth.material as THREE.LineBasicMaterial).opacity = points ? 0 : on;

    if (predLine) {
      const pred = node.children[i++] as THREE.Line;
      (pred.material as THREE.LineBasicMaterial).opacity = on;
    }
    if (gap) {
      const mesh = node.children[i++] as THREE.Mesh;
      /* Cleared for the comparison, where three overlapping fills read as one smear. */
      const fill = errorFrom ? at(p, errorFrom) * (1 - at(p, "incomparable")) : 0;
      (mesh.material as THREE.MeshBasicMaterial).opacity = on * fill * 0.55;
    }
    for (; i < node.children.length; i += 1) {
      const dot = node.children[i] as THREE.Mesh;
      (dot.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    }
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={truthLine} />
      {predLine ? <primitive object={predLine} /> : null}
      {gap ? <primitive object={gap} /> : null}
      {marks.map((p, i) => (
        <mesh key={i} position={[x(p.t), (mapY ?? y)(p.q), 0]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshBasicMaterial color={TRUTH} opacity={0} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Feature importance, as a row of posts.                               */
/* ------------------------------------------------------------------ */

function Importances({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);
  const top = useMemo(() => importances.slice(0, 6), []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const show = Math.max(0, at(p, "features") - at(p, "onestep") * 2.4);
    node.visible = show > 0.02;
    node.children.forEach((child, i) => {
      const post = child as THREE.Mesh;
      const h = top[i].value * SPAN_Y * 2.4 * show;
      post.scale.set(1, Math.max(0.01, h), 1);
      post.position.set((i - (top.length - 1) / 2) * 1.15, h / 2, 0);
      const material = post.material as THREE.MeshBasicMaterial;
      material.opacity = show * 0.9;
      /* The two lag columns that carry the model are the two that get the accent. */
      material.color.copy(i < 2 ? ERROR : DIMMED);
    });
  });

  return (
    <group ref={group} visible={false}>
      {top.map((f) => (
        <mesh key={f.feature}>
          <boxGeometry args={[0.6, 1, 0.6]} />
          <meshBasicMaterial color={DIMMED} opacity={0} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function StreamflowWorldScene({ frame }: { frame: FrameRef }) {
  const target = useRef(new THREE.Vector3());

  const testTruth = useMemo(() => test.map((p) => ({ t: p.t, q: p.actual })), []);
  const testNaive = useMemo(() => test.map((p) => ({ t: p.t, q: p.naive })), []);
  const testXgb = useMemo(() => test.map((p) => ({ t: p.t, q: p.xgboost })), []);
  const zoomTruth = useMemo(() => zoomPoints.map((p) => ({ t: p.t, q: p.actual })), []);
  const zoomXgb = useMemo(() => zoomPoints.map((p) => ({ t: p.t, q: p.xgboost })), []);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);

    /*
     * `elevation` is a descent, not an orbit: 1 puts the camera overhead looking down at a flat
     * plan of the record, 0 puts it level with the signal. Combined with `travel` along X it
     * reads as walking the length of a bench rather than circling an object.
     */
    const angle = shot.elevation * Math.PI * 0.46;
    camera.position.set(
      shot.travel,
      shot.height + Math.sin(angle) * shot.distance,
      Math.cos(angle) * shot.distance,
    );
    target.current.set(shot.travel, shot.look, 0);
    camera.lookAt(target.current);
  });

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight intensity={0.45} position={[2, 7, 5]} />

      <Bench frame={frame} />
      <Leaderboard frame={frame} />
      <Series frame={frame} />
      <SplitWall frame={frame} />

      {/* The baseline, and the constant gap underneath it. */}
      <Lane
        actual={testTruth}
        colour={ERROR}
        errorFrom="drift"
        frame={frame}
        hide="sarimax"
        lane={LANES.naive}
        predicted={testNaive}
        returns
        show="naive"
      />

      {/* SARIMAX's target: the same two years, as 25 monthly means. */}
      <Lane
        actual={monthlyPoints}
        colour={PRED}
        frame={frame}
        hide="xgboost"
        lane={LANES.sarimax}
        points
        predicted={null}
        returns
        show="sarimax"
      />

      {/* The headline row: prediction laid over truth at daily resolution. */}
      <Lane
        actual={testTruth}
        colour={PRED}
        frame={frame}
        hide="features"
        lane={LANES.xgboost}
        predicted={testXgb}
        returns
        show="xgboost"
      />

      {/* The repository's own zoom, where one-step-ahead becomes legible. */}
      <Lane
        actual={zoomTruth}
        colour={PRED}
        frame={frame}
        errorFrom="peaks"
        hide="incomparable"
        lane={0}
        mapY={zoomY}
        predicted={zoomXgb}
        show="onestep"
      />

      <Importances frame={frame} />
    </>
  );
}
