"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import {
  FRAMES,
  GROUP,
  LANDING,
  MILESTONES,
  TICK,
  TICKS,
  TICK_GAP,
  frameHalf,
} from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * A run of column ticks that regroups itself.
 *
 * Each tick is a solid, and the migration moves solids rather than redrawing a chart - which is
 * the claim: the fields were not reduced, they were put in a different order. Four outlines then
 * close around the four groups, and nothing has left the scene.
 *
 * Nothing drawn here is employer material. There is no field name, no value, no part, no supplier
 * and no department in this world, because the public case study it is built from carries none.
 */

const PLAIN = new THREE.Color("#5c6873");
const SUBJECT = [
  new THREE.Color("#5fb0d8"),
  new THREE.Color("#4cc4b0"),
  new THREE.Color("#f0a03c"),
  new THREE.Color("#b49ae0"),
];
const OUTLINE = new THREE.Color("#8ea6bd");
const MARK = new THREE.Color("#e8eef2");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

/** Each frame outline is four bars; this is their offsets and lengths from the frame's half size. */
function outlineBars(size: number) {
  const half = frameHalf(size);
  return [
    { dx: 0, dz: -half.z, length: half.x * 2, along: "x" as const },
    { dx: 0, dz: half.z, length: half.x * 2, along: "x" as const },
    { dx: -half.x, dz: 0, length: half.z * 2, along: "z" as const },
    { dx: half.x, dz: 0, length: half.z * 2, along: "z" as const },
  ];
}

export default function ReleaseWorldScene({ frame }: { frame: FrameRef }) {
  const ticks = useRef<(THREE.Mesh | null)[]>([]);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const marks = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const coloured = at(p, "subject");
    const moved = at(p, "migrate");
    const framed = at(p, "frames");
    const marked = at(p, "milestones");
    const limited = at(p, "limits");

    for (let i = 0; i < TICKS; i += 1) {
      const tick = ticks.current[i];
      if (!tick) continue;
      /* Each tick travels from its place in the sheet to its place in a frame. Nothing is added
       * on the way and nothing is dropped, which is the whole of what the regrouping did. */
      const sheetX = (i - (TICKS - 1) / 2) * TICK_GAP;
      const landing = LANDING[i];
      tick.position.set(mix(sheetX, landing.x, moved), TICK.height / 2, mix(0, landing.z, moved));
      const material = tick.material as THREE.MeshBasicMaterial;
      material.color.copy(coloured > 0.1 ? SUBJECT[GROUP[i]] : PLAIN);
      material.opacity = (0.55 + coloured * 0.35) * (1 - limited * 0.35);
    }

    /* The four outlines, closing once their columns have arrived. */
    FRAMES.forEach((entry, f) => {
      outlineBars(entry.size).forEach((bar, b) => {
        const mesh = bars.current[f * 4 + b];
        if (!mesh) return;
        const on = framed * (1 - limited * 0.3);
        mesh.visible = on > 0.02;
        mesh.position.set(entry.x + bar.dx, 0.05, entry.z + bar.dz);
        const grown = bar.length * on;
        if (bar.along === "x") mesh.scale.set(Math.max(0.0001, grown), 1, 1);
        else mesh.scale.set(1, 1, Math.max(0.0001, grown));
        (mesh.material as THREE.MeshBasicMaterial).opacity = on * 0.6;
      });
    });

    /* The milestone codes, as marks standing over the frames. Six of them, each with a comment. */
    MILESTONES.forEach((milestone, i) => {
      const mark = marks.current[i];
      if (!mark) return;
      const on = Math.max(0, Math.min(1, (marked - i * 0.1) / 0.5)) * (1 - limited * 0.5);
      mark.visible = on > 0.02;
      mark.position.set(milestone.x, milestone.y, 0);
      mark.scale.setScalar(Math.max(0.0001, on));
      (mark.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {Array.from({ length: TICKS }, (_, i) => (
        <mesh key={`tick-${i}`} ref={(node) => { ticks.current[i] = node; }}>
          <boxGeometry args={[TICK.width, TICK.height, TICK.depth]} />
          <meshBasicMaterial color={PLAIN} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {FRAMES.flatMap((entry, f) =>
        outlineBars(entry.size).map((bar, b) => (
          <mesh key={`bar-${entry.key}-${b}`} ref={(node) => { bars.current[f * 4 + b] = node; }}>
            <boxGeometry args={bar.along === "x" ? [1, 0.07, 0.07] : [0.07, 0.07, 1]} />
            <meshBasicMaterial color={OUTLINE} transparent depthWrite={false} opacity={0} />
          </mesh>
        )),
      )}

      {MILESTONES.map((milestone, i) => (
        <mesh key={`mile-${milestone.code}`} ref={(node) => { marks.current[i] = node; }}>
          <octahedronGeometry args={[0.3]} />
          <meshBasicMaterial color={MARK} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
