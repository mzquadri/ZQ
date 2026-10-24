"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { CHECKS, COUNTS, TILE, TILES } from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A grid of sixty, counted.
 *
 * Every beat lights a number of tiles and nothing else. There is no bar, no axis and no
 * percentage, because the report's unit is a correct answer out of sixty and drawing it any finer
 * would be claiming a resolution the held-out set does not have.
 *
 * The one tile that separates the two searches lifts out of the plane. It is the only thing in
 * this world with height, which is why the camera drops for that beat alone.
 */

const UNLIT = new THREE.Color("#2a323b");
const GUESS = new THREE.Color("#dfe6ea");
const BELOW = new THREE.Color("#f0a03c");
const GOOD = new THREE.Color("#a78bfa");
const WON = new THREE.Color("#4cc4b0");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function StatlearnWorldScene({ frame }: { frame: FrameRef }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const checks = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(shot.swing, shot.height, shot.distance);
    camera.lookAt(0, 0, shot.look);

    const guessing = at(p, "baseline");
    const untouched = at(p, "default");
    const swept = at(p, "sweep");
    const margin = at(p, "margin");
    const checked = at(p, "checks");
    const ledger = at(p, "ledger");

    /*
     * How many tiles are lit, and in what colour.
     *
     * Each beat replaces the last rather than adding to it, because these are five separate runs
     * over the same held-out set, not a quantity accumulating. Interpolating the *count* is what
     * makes a run arriving read as tiles filling in.
     */
    let lit = 0;
    let colour = UNLIT;
    if (guessing > 0.02) {
      lit = mix(0, COUNTS.baseline, guessing);
      colour = GUESS;
    }
    if (untouched > 0.02) {
      lit = mix(COUNTS.baseline, COUNTS.default, untouched);
      colour = BELOW;
    }
    if (swept > 0.02) {
      lit = mix(COUNTS.default, COUNTS.sweep, swept);
      colour = GOOD;
    }
    if (margin > 0.02) {
      lit = mix(COUNTS.sweep, COUNTS.random, margin);
      colour = GOOD;
    }

    /* The whole grid recedes while the gradient checks have the frame. */
    const grid = 1 - Math.max(checked * 0.8, 0);

    if (tiles.current) {
      const mesh = tiles.current;
      TILES.forEach((tile, i) => {
        const on = i < lit ? 1 : 0;
        /*
         * The single tile the random search won by. It lifts, and it is the only thing here with
         * height - "one test point" as a physical object rather than as a rounding note.
         */
        const isMargin = i >= COUNTS.bayes && i < COUNTS.random;
        const lift = isMargin ? margin * 0.6 : 0;

        P.set(tile.x, lift, tile.z);
        S.set(TILE.size, isMargin ? mix(0.05, 0.3, margin) : 0.05, TILE.size);
        Q.setFromAxisAngle(UP, 0);
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);

        C.copy(on ? colour : UNLIT);
        if (isMargin && margin > 0.2) C.copy(WON);
        /* The baseline's reach stays marked underneath everything that follows it. */
        if (!on && i < COUNTS.baseline && untouched > 0.3) C.copy(UNLIT).lerp(GUESS, 0.25);
        C.lerp(UNLIT, 1 - grid);
        mesh.setColorAt(i, C);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    /* The two gradient checks, on a log scale, off to one side of the grid. */
    CHECKS.forEach((check, i) => {
      const bar = checks.current[i];
      if (!bar) return;
      const on = checked * (1 - ledger * 0.8);
      bar.visible = on > 0.02;
      const height = Math.max(0.0001, check.height * on * 3.2);
      /* Right of the grid, not left: the caption plate occupies the lower left of every stage. */
      bar.position.set(3.6 + i * 1.0, height / 2, 0);
      bar.scale.set(1, height, 1);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = on * 0.85;
      material.color.copy(i === 0 ? WON : GUESS);
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      <instancedMesh args={[undefined, undefined, TILES.length]} ref={tiles}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {CHECKS.map((check, i) => (
        <mesh key={check.key} ref={(node) => { checks.current[i] = node; }}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshBasicMaterial color={GUESS} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
