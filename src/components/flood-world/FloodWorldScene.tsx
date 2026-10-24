"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import {
  BIAS,
  CEILING,
  COLUMNS,
  COLUMN_SIZE,
  GAP,
  SCORE_HEIGHT,
  SHARES,
  py,
} from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Five columns under a ceiling.
 *
 * The ceiling is the score the generator's own noise term makes unreachable, so it is drawn as a
 * solid the columns stand under rather than as a line they are compared to. The two the finding
 * is about - a network and a lookup table - stand next to each other on purpose, and the distance
 * between their tops is drawn as a length rather than printed as a difference.
 */

const CEILING_C = new THREE.Color("#8ea6bd");
const COMPARED = new THREE.Color("#5fb0d8");
const OTHER = new THREE.Color("#5c6873");
const GAP_C = new THREE.Color("#f0a03c");
const SEASONAL = new THREE.Color("#4cc4b0");
const RAIN = new THREE.Color("#5fb0d8");
const NOISE = new THREE.Color("#f0a03c");
const LOW = new THREE.Color("#f0a03c");
const HIGH = new THREE.Color("#4cc4b0");

const SHARE_COLOUR = { seasonal: SEASONAL, rain: RAIN, noise: NOISE } as const;

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function FloodWorldScene({ frame }: { frame: FrameRef }) {
  const ceiling = useRef<THREE.Mesh>(null);
  const columns = useRef<(THREE.Mesh | null)[]>([]);
  const gap = useRef<THREE.Mesh>(null);
  const shares = useRef<(THREE.Mesh | null)[]>([]);
  const below = useRef<THREE.Mesh>(null);
  const above = useRef<THREE.Mesh>(null);
  const zero = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const capped = at(p, "ceiling");
    const network = at(p, "network");
    const table = at(p, "calendar");
    const measured = at(p, "gap");
    const eventful = at(p, "events");
    const limited = at(p, "limits");

    /*
     * The variance shares, stacked. They are the opening object and they leave once the ceiling
     * they explain has arrived - the noise slab is why the ceiling is where it is, so showing
     * both at once would invite the reading that they are two separate claims.
     */
    let stacked = 0;
    SHARES.forEach((share, i) => {
      const slab = shares.current[i];
      if (!slab) return;
      const on = (1 - capped) * (1 - limited * 0.4);
      const height = share.share * SCORE_HEIGHT;
      slab.visible = on > 0.03;
      slab.position.set(0, stacked + height / 2, 0);
      slab.scale.set(1, Math.max(0.0001, height), 1);
      const material = slab.material as THREE.MeshBasicMaterial;
      material.color.copy(SHARE_COLOUR[share.key]);
      material.opacity = on * (share.key === "noise" ? 0.85 : 0.4);
      stacked += height;
    });

    /* The ceiling. A solid, because it is one: nothing on this series can score above it. */
    if (ceiling.current) {
      const on = capped * (1 - limited * 0.3);
      ceiling.current.visible = on > 0.02;
      ceiling.current.position.set(0, CEILING.y, 0);
      ceiling.current.scale.set(Math.max(0.0001, on), 1, 1);
      (ceiling.current.material as THREE.MeshBasicMaterial).opacity = on * 0.42;
    }

    /*
     * The columns. The network rises first, then the table beside it, then the rest - so the
     * comparison the project is actually about happens before the field it happens in.
     */
    COLUMNS.forEach((column, i) => {
      const bar = columns.current[i];
      if (!bar) return;
      const on =
        column.key === "lstm" ? network : column.compared ? table : table * Math.max(0, 1 - i * 0.12);
      bar.visible = on > 0.02;
      const height = Math.max(0.05, py(column.score)) * on;
      bar.position.set(column.x, height / 2, 0);
      bar.scale.set(1, Math.max(0.0001, height), 1);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.color.copy(column.compared ? COMPARED : OTHER);
      material.opacity = on * (column.compared ? 0.85 : 0.45) * (1 - limited * 0.3);
    });

    /* What the network buys, as the height between the two tops. */
    if (gap.current) {
      const on = measured;
      gap.current.visible = on > 0.02;
      const height = (GAP.to - GAP.from) * on;
      gap.current.position.set(GAP.x, GAP.from + height / 2, COLUMN_SIZE * 0.6);
      gap.current.scale.set(1, Math.max(0.0001, height), 1);
      (gap.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }

    /*
     * The bias, as two bars from a common zero on their own scale.
     *
     * Below the threshold the model runs slightly high; above it, well low. Drawn below the floor
     * the columns stand on, because it is a different quantity and should not be read off the
     * same axis.
     */
    const biasY = -1.2;
    if (zero.current) {
      const on = eventful;
      zero.current.visible = on > 0.02;
      zero.current.position.set(0, biasY, 0);
      (zero.current.material as THREE.MeshBasicMaterial).opacity = on * 0.5;
    }
    if (below.current) {
      const on = eventful;
      below.current.visible = on > 0.02;
      const length = BIAS.below * BIAS.scale * on;
      below.current.position.set(-1.6, biasY + length / 2, 0);
      below.current.scale.set(1, Math.max(0.0001, Math.abs(length)), 1);
      (below.current.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    }
    if (above.current) {
      const on = eventful;
      above.current.visible = on > 0.02;
      const length = BIAS.above * BIAS.scale * on;
      above.current.position.set(1.6, biasY + length / 2, 0);
      above.current.scale.set(1, Math.max(0.0001, Math.abs(length)), 1);
      (above.current.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    }
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {SHARES.map((share, i) => (
        <mesh key={share.key} ref={(node) => { shares.current[i] = node; }}>
          <boxGeometry args={[COLUMN_SIZE * 1.4, 1, COLUMN_SIZE * 1.4]} />
          <meshBasicMaterial color={SEASONAL} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      <mesh ref={ceiling}>
        <boxGeometry args={[CEILING.width, 0.14, CEILING.width * 0.42]} />
        <meshBasicMaterial color={CEILING_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      {COLUMNS.map((column, i) => (
        <mesh key={column.key} ref={(node) => { columns.current[i] = node; }}>
          <boxGeometry args={[COLUMN_SIZE, 1, COLUMN_SIZE]} />
          <meshBasicMaterial color={OTHER} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      <mesh ref={gap}>
        <boxGeometry args={[0.22, 1, 0.22]} />
        <meshBasicMaterial color={GAP_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      <mesh ref={zero}>
        <boxGeometry args={[6.4, 0.06, 0.06]} />
        <meshBasicMaterial color={CEILING_C} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={below}>
        <boxGeometry args={[0.9, 1, 0.9]} />
        <meshBasicMaterial color={HIGH} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={above}>
        <boxGeometry args={[0.9, 1, 0.9]} />
        <meshBasicMaterial color={LOW} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  );
}
