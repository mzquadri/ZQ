"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { AXIS_WIDTH, BAR, RUNS, SERIES, WALL, ZERO_X } from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Two intervals and one wall.
 *
 * The wall stands at zero and it is the only thing in the world that matters about either
 * interval: one of them is entirely to one side of it, and the other has it running through.
 * Both are drawn on the same axis with the same thickness, so the difference between them is a
 * difference in where they are rather than in how they are drawn.
 */

const WALL_C = new THREE.Color("#8ea6bd");
const CLEARS = new THREE.Color("#4cc4b0");
const CROSSES = new THREE.Color("#f0a03c");
const MARGIN = new THREE.Color("#e8eef2");
const WON = new THREE.Color("#4cc4b0");
const LOST = new THREE.Color("#5c6873");
const AXIS_C = new THREE.Color("#5c6873");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function MunichWorldScene({ frame }: { frame: FrameRef }) {
  const wall = useRef<THREE.Mesh>(null);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const marks = useRef<(THREE.Mesh | null)[]>([]);
  const series = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const opened = at(p, "interval");
    const counted = at(p, "series");
    const second = at(p, "ordinary");
    const straddled = at(p, "crosses");
    const recounted = at(p, "count");
    const closed = at(p, "survives");

    /* Zero. Present from the first frame, because both runs are statements about one side of it. */
    if (wall.current) {
      wall.current.position.set(ZERO_X, 0, 0);
      (wall.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + opened * 0.08 + straddled * 0.16;
    }

    const showing = counted > 0.1 || recounted > 0.1;

    RUNS.forEach((run, i) => {
      const present = i === 0 ? 1 : second;
      /* Each run's own interval beat opens its bar; before that it is the margin mark alone. */
      const spread = i === 0 ? opened : straddled;

      const bar = bars.current[i];
      if (bar) {
        const on = present * (1 - closed * 0.2);
        bar.visible = on > 0.02 && spread > 0.02;
        const width = (run.high - run.low) * spread;
        bar.position.set(run.low + width / 2, 0, run.z);
        bar.scale.set(Math.max(0.0001, width), 1, 1);
        const material = bar.material as THREE.MeshBasicMaterial;
        /* Derived, not listed: a bar is amber because its own bounds contain zero. */
        material.color.copy(run.clearsZero ? CLEARS : CROSSES);
        material.opacity = on * spread * 0.62;
      }

      const mark = marks.current[i];
      if (mark) {
        const on = present * (1 - closed * 0.2);
        mark.visible = on > 0.02;
        mark.position.set(run.margin, 0, run.z);
        (mark.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
      }
    });

    /*
     * Seven blocks per run, lit where that run beat the baseline on that series.
     *
     * The same picture twice, so seven of seven and three of seven are compared as shapes. They
     * stand in for the series rather than identifying them: the repository publishes the counts,
     * not which series are which.
     */
    RUNS.forEach((run, r) => {
      SERIES.forEach((entry, s) => {
        const block = series.current[r * SERIES.length + s];
        if (!block) return;
        const on = (r === 0 ? counted : recounted) * (1 - closed * 0.5);
        const won = entry.index < run.seriesWon;
        block.visible = on > 0.02 && showing;
        block.position.set(ZERO_X + (r === 0 ? -3.4 : 3.4), entry.y, run.z);
        block.scale.setScalar(Math.max(0.0001, on));
        const material = block.material as THREE.MeshBasicMaterial;
        material.color.copy(won ? WON : LOST);
        material.opacity = on * (won ? 0.9 : 0.3);
      });
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {/* The axis, which both intervals are read off. */}
      <mesh position={[0, -WALL.height / 2 - 0.4, 0]}>
        <boxGeometry args={[AXIS_WIDTH, 0.05, 0.05]} />
        <meshBasicMaterial color={AXIS_C} transparent depthWrite={false} opacity={0.45} />
      </mesh>

      {/* Zero, as a wall. */}
      <mesh ref={wall}>
        <boxGeometry args={[WALL.width, WALL.height, WALL.depth]} />
        <meshBasicMaterial color={WALL_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      {RUNS.map((run, i) => (
        <mesh key={`bar-${run.key}`} ref={(node) => { bars.current[i] = node; }}>
          <boxGeometry args={[1, BAR.thickness, BAR.thickness]} />
          <meshBasicMaterial color={CLEARS} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {RUNS.map((run, i) => (
        <mesh key={`mark-${run.key}`} ref={(node) => { marks.current[i] = node; }}>
          <sphereGeometry args={[0.3, 18, 14]} />
          <meshBasicMaterial color={MARGIN} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {RUNS.flatMap((run, r) =>
        SERIES.map((entry, s) => (
          <mesh
            key={`series-${run.key}-${s}`}
            ref={(node) => { series.current[r * SERIES.length + s] = node; }}
          >
            <boxGeometry args={[0.38, 0.38, 0.38]} />
            <meshBasicMaterial color={LOST} transparent depthWrite={false} opacity={0} />
          </mesh>
        )),
      )}
    </group>
  );
}
