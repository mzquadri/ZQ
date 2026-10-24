"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { BAR, GATES, LADDER, TERMS } from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * Seven terms with ceilings over them, and two penalties that go straight through.
 *
 * Everything is measured in one unit - a point of the hundred-point score - because the engine
 * measures weights and flat penalties in that same unit. Once that is true of the drawing, "a
 * penalty larger than the term it belongs to" stops being a sentence the reader has to accept and
 * becomes a bar standing above a plate.
 *
 * Amber is reserved for the two overruns and for the thing a gate discards. Nothing else takes it.
 */

const TERM = new THREE.Color("#8fd05a");
const CEIL = new THREE.Color("#8ea6bd");
const BREAK = new THREE.Color("#f0a03c");
const DIM = new THREE.Color("#39424a");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function CareerWorldScene({ frame }: { frame: FrameRef }) {
  const rig = useRef<THREE.Group>(null);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const ceilings = useRef<(THREE.Mesh | null)[]>([]);
  const penalties = useRef<(THREE.Mesh | null)[]>([]);
  const ladder = useRef<(THREE.Mesh | null)[]>([]);
  const gates = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(shot.swing, shot.height, shot.distance);
    camera.lookAt(0, 1.0, 0);

    const capped = at(p, "ceilings");
    const flat = at(p, "penalties");
    const through = at(p, "through");
    const steps = at(p, "ladder");
    const discard = at(p, "rejects");
    const reach = at(p, "reach");

    if (rig.current) rig.current.rotation.x = shot.tilt;

    /* The set recedes while the ladder and the gates have the frame to themselves. */
    const main = 1 - Math.max(steps * 0.55, discard * 0.8, reach * 0.9);

    TERMS.forEach((term, i) => {
      const bar = bars.current[i];
      const ceiling = ceilings.current[i];
      const penalty = penalties.current[i];

      if (bar) {
        bar.position.set(term.x, term.height / 2, 0);
        bar.scale.set(1, term.height, 1);
        const material = bar.material as THREE.MeshBasicMaterial;
        material.opacity = 0.75 * main;
        material.color.copy(term.overruns && through > 0.3 ? BREAK : TERM).lerp(DIM, 1 - main);
      }

      if (ceiling) {
        /*
         * The ceiling is the term's own weight, drawn as a plate the bar cannot pass. It appears
         * on every term, not only on the two that are about to be broken, because the claim is
         * about what a weighted sum can express at all.
         */
        ceiling.visible = capped > 0.02 && main > 0.05;
        ceiling.position.set(term.x, term.height + 0.035, 0);
        ceiling.scale.set(capped, 1, capped);
        (ceiling.material as THREE.MeshBasicMaterial).opacity = capped * 0.75 * main;
      }

      if (penalty) {
        /*
         * The penalty grows from the floor in the same unit, so where it ends up relative to the
         * plate above it is simply where the numbers put it.
         */
        const has = term.penalty > 0;
        const grow = has ? flat : 0;
        const height = Math.max(0.0001, term.penaltyHeight * grow);
        penalty.visible = has && grow > 0.02 && main > 0.05;
        penalty.position.set(term.x, height / 2, -BAR.depth * 0.78);
        penalty.scale.set(1, height, 1);
        const material = penalty.material as THREE.MeshBasicMaterial;
        material.opacity = grow * 0.9 * main;
        material.color.copy(term.overruns && through > 0.25 ? BREAK : CEIL);
      }
    });

    /* The language ladder: the same axis, read as three steps. */
    LADDER.forEach((step, i) => {
      const bar = ladder.current[i];
      if (!bar) return;
      const on = steps;
      bar.visible = on > 0.02;
      const height = Math.max(0.0001, step.height * on);
      bar.position.set(step.x + 3.4, height / 2, 1.4);
      bar.scale.set(1, height, 1);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = on * 0.85;
      /* Only the top of the ladder is a thing you cannot do rather than a thing that is hard. */
      material.color.copy(i === LADDER.length - 1 ? BREAK : CEIL);
    });

    /* The four conditions that discard outright, as gates that remove rather than deduct. */
    GATES.forEach((gate, i) => {
      const plate = gates.current[i];
      if (!plate) return;
      const on = discard * (1 - reach * 0.7);
      plate.visible = on > 0.02;
      plate.position.set(gate.x, 0.5 + i * 0.02, 2.6);
      plate.scale.set(on, on, 1);
      (plate.material as THREE.MeshBasicMaterial).opacity = on * 0.6;
    });
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={1} />

      {TERMS.map((term, i) => (
        <group key={term.key}>
          <mesh ref={(node) => { bars.current[i] = node; }}>
            <boxGeometry args={[BAR.width, 1, BAR.depth]} />
            <meshBasicMaterial color={TERM} transparent opacity={0.75} />
          </mesh>
          <mesh ref={(node) => { ceilings.current[i] = node; }}>
            <boxGeometry args={[BAR.width * 1.5, 0.05, BAR.depth * 1.5]} />
            <meshBasicMaterial color={CEIL} transparent opacity={0} />
          </mesh>
          <mesh ref={(node) => { penalties.current[i] = node; }}>
            <boxGeometry args={[BAR.width * 0.5, 1, BAR.depth * 0.5]} />
            <meshBasicMaterial color={CEIL} transparent opacity={0} />
          </mesh>
        </group>
      ))}

      {LADDER.map((step, i) => (
        <mesh key={step.key} ref={(node) => { ladder.current[i] = node; }}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshBasicMaterial color={CEIL} transparent opacity={0} />
        </mesh>
      ))}

      {GATES.map((gate, i) => (
        <mesh key={gate.key} ref={(node) => { gates.current[i] = node; }}>
          <planeGeometry args={[1.3, 0.9]} />
          <meshBasicMaterial color={BREAK} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
