"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { COLUMN, DISAGREES, REFUSALS, TIERS, TIER_OF, VOLUMES } from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * Five solids, and the light in them.
 *
 * The composition rule is the argument: each volume is drawn at the full size of its component's
 * history, and only the share that is mine is lit. The dark part is never shrunk, never faded and
 * never left out, which is the opposite of what a figure about one's own contribution usually
 * does. One of the five never lights.
 *
 * There is no text in the scene. Everything quantitative is in the readout beside it, where it is
 * selectable and legible at any zoom, and the volumes carry only shape.
 */

const SHELL = new THREE.Color("#39424a");
const MINE = new THREE.Color("#8ea6bd");
const ZERO = new THREE.Color("#f0a03c");
const TIER = new THREE.Color("#5c6873");
const STRIKE = new THREE.Color("#f0a03c");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function AuthorshipWorldScene({ frame }: { frame: FrameRef }) {
  const rig = useRef<THREE.Group>(null);
  const shells = useRef<(THREE.Mesh | null)[]>([]);
  const lits = useRef<(THREE.Mesh | null)[]>([]);
  const tiers = useRef<(THREE.Mesh | null)[]>([]);
  const refusals = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);

    camera.position.set(shot.swing, shot.height, shot.distance);
    camera.lookAt(0, 0.6, 0);

    const share = at(p, "share");
    const zero = at(p, "zero");
    const classed = at(p, "classes");
    const judged = at(p, "judged");
    const refused = at(p, "refused");
    const unnamed = at(p, "unnamed");

    if (rig.current) rig.current.rotation.x = shot.tilt;

    VOLUMES.forEach((volume, i) => {
      const shell = shells.current[i];
      const lit = lits.current[i];

      /*
       * Sorting toward the tiers. The volume lifts to the height of the class it was put in, and
       * the two that disagree with their own counts drift sideways as they do - which is the only
       * way the scene says "the count informs this and does not decide it" without a caption.
       */
      const tierY = TIERS[TIER_OF[i]]?.y ?? 0;
      const lift = classed * tierY * 0.42;
      const drift = DISAGREES[i] ? judged * 0.55 : 0;

      if (shell) {
        shell.position.set(volume.x + drift, volume.height / 2 + lift, 0);
        shell.scale.set(1, volume.height, 1);
        const material = shell.material as THREE.MeshBasicMaterial;
        /* The shell never fades out. The part that is not mine is the point of the figure. */
        material.opacity = mix(0.5, 0.34, unnamed);
      }

      if (lit) {
        /*
         * The lit part grows from the floor of its own volume, so the proportion is read against
         * the solid it sits in rather than against its neighbours.
         */
        const isZero = volume.zero;
        const grow = isZero ? 0 : share;
        const height = Math.max(0.0001, volume.lit * grow);
        lit.visible = !isZero && grow > 0.01;
        lit.position.set(volume.x + drift, height / 2 + lift, 0);
        lit.scale.set(1, height, 1);
        const material = lit.material as THREE.MeshBasicMaterial;
        material.opacity = 0.9;
      }

      /* The one that never lights takes the warning colour once the beat names it. */
      if (shell && volume.zero) {
        const material = shell.material as THREE.MeshBasicMaterial;
        material.color.copy(SHELL).lerp(ZERO, zero * 0.75);
      }
    });

    /* The four claim tiers, strongest first. */
    TIERS.forEach((tier, i) => {
      const plate = tiers.current[i];
      if (!plate) return;
      plate.visible = classed > 0.02;
      const on = classed * (1 - unnamed * 0.7);
      plate.position.set(0, tier.y * 0.42 * classed, -1.1);
      plate.scale.set(tier.width * classed, 1, 1);
      (plate.material as THREE.MeshBasicMaterial).opacity = on * 0.4;
    });

    /* The four refusals, struck across the front of everything. */
    REFUSALS.forEach((refusal, i) => {
      const bar = refusals.current[i];
      if (!bar) return;
      const on = refused * (1 - unnamed * 0.6);
      bar.visible = on > 0.02;
      const grown = on * (0.4 + i * 0.08);
      bar.position.set(0, refusal.y * 0.5, 2.4);
      bar.scale.set(Math.max(0.001, 8.2 * grown), 1, 1);
      (bar.material as THREE.MeshBasicMaterial).opacity = on * 0.8;
    });
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={1} />

      {VOLUMES.map((volume, i) => (
        <group key={volume.name}>
          {/* The whole of the component's history. */}
          <mesh ref={(node) => { shells.current[i] = node; }}>
            <boxGeometry args={[COLUMN.width, 1, COLUMN.depth]} />
            <meshBasicMaterial color={SHELL} transparent opacity={0.5} />
          </mesh>
          {/* The share of it that is mine. */}
          <mesh ref={(node) => { lits.current[i] = node; }}>
            <boxGeometry args={[COLUMN.width * 0.94, 1, COLUMN.depth * 0.94]} />
            <meshBasicMaterial color={MINE} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}

      {TIERS.map((tier, i) => (
        <mesh key={tier.key} ref={(node) => { tiers.current[i] = node; }}>
          <boxGeometry args={[1, 0.035, 0.035]} />
          <meshBasicMaterial color={TIER} transparent opacity={0} />
        </mesh>
      ))}

      {REFUSALS.map((refusal, i) => (
        <mesh key={refusal.key} ref={(node) => { refusals.current[i] = node; }}>
          <boxGeometry args={[1, 0.03, 0.03]} />
          <meshBasicMaterial color={STRIKE} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
