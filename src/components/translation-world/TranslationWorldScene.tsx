"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { ACCURACY, BEAM, SIDES, SPANS, TRAP, WALL, accuracyY } from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Two walls, five spans, and a beam that never moves.
 *
 * Each span grows from one wall toward the other. Four of them meet; the fifth stops short, and
 * the gap it leaves is the floor the project names rather than a thing left undone. The beam
 * above is the parameter count, and the whole of the second-to-last beat is a sixth span opening
 * underneath it and closing again without the beam reacting at all.
 */

const WALL_C = new THREE.Color("#5c6873");
const CLOSED = new THREE.Color("#4cc4b0");
const OPEN = new THREE.Color("#f0a03c");
const BEAM_C = new THREE.Color("#5fb0d8");
const TRAP_C = new THREE.Color("#b49ae0");
const MEASURED = new THREE.Color("#4cc4b0");
const PENDING = new THREE.Color("#8ea6bd");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function TranslationWorldScene({ frame }: { frame: FrameRef }) {
  const walls = useRef<(THREE.Mesh | null)[]>([]);
  const spans = useRef<(THREE.Mesh | null)[]>([]);
  const beam = useRef<THREE.Mesh>(null);
  const trap = useRef<THREE.Mesh>(null);
  const measured = useRef<THREE.Mesh>(null);
  const pending = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const counted = at(p, "count");
    const opened = at(p, "differences");
    const closed = at(p, "resolved");
    const floored = at(p, "floor");
    const missed = at(p, "missed");
    const scored = at(p, "pending");

    const wallFade = 1 - scored * 0.5;
    [SIDES.pytorch, SIDES.keras].forEach((x, i) => {
      const wall = walls.current[i];
      if (!wall) return;
      wall.position.set(x, WALL.height / 2, 0);
      (wall.material as THREE.MeshBasicMaterial).opacity = wallFade * 0.4;
    });

    /*
     * The beam. Present from the moment it is asserted and never altered after that - not by the
     * differences below it, and not by the one the count cannot see.
     */
    if (beam.current) {
      const on = counted * (1 - scored * 0.6);
      beam.current.visible = on > 0.02;
      beam.current.position.set(0, BEAM.y, 0);
      beam.current.scale.set(Math.max(0.0001, on), 1, 1);
      (beam.current.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    }

    /*
     * The spans. Each grows from the PyTorch wall toward the Keras one; the four that were
     * corrected for reach it, and the fifth stops at the fraction of the gap it can cross.
     */
    SPANS.forEach((span, i) => {
      const bar = spans.current[i];
      if (!bar) return;
      const arrives = Math.max(0, Math.min(1, (opened - i * 0.12) / 0.5));
      const reach = span.resolved ? closed : floored * 0.62;
      const on = arrives * (1 - scored * 0.7);
      bar.visible = on > 0.02;
      const full = SIDES.keras - SIDES.pytorch;
      const length = full * (0.12 + reach * 0.88) * arrives;
      bar.position.set(SIDES.pytorch + length / 2, span.y, 0);
      bar.scale.set(Math.max(0.0001, length), 1, 1);
      const material = bar.material as THREE.MeshBasicMaterial;
      /* Colour follows whether it got there, which is derived rather than listed per span. */
      material.color.copy(span.resolved && closed > 0.4 ? CLOSED : OPEN);
      material.opacity = on * (span.resolved ? 0.8 : 0.9);
    });

    /* The difference the count cannot see, opening and closing beneath a beam that does not move. */
    if (trap.current) {
      const on = missed * (1 - scored * 0.7);
      trap.current.visible = on > 0.02;
      const full = SIDES.keras - SIDES.pytorch;
      const length = full * on;
      trap.current.position.set(SIDES.pytorch + length / 2, TRAP.y, 0);
      trap.current.scale.set(Math.max(0.0001, length), 1, 1);
      (trap.current.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    }

    /* One accuracy exists and one does not, so one is a solid and one is an outline. */
    if (measured.current) {
      const on = scored;
      measured.current.visible = on > 0.02;
      const height = accuracyY(ACCURACY.pytorch) * on;
      measured.current.position.set(SIDES.pytorch, height / 2, 0);
      measured.current.scale.set(1, Math.max(0.0001, height), 1);
      (measured.current.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    }
    if (pending.current) {
      const on = scored;
      pending.current.visible = on > 0.02;
      pending.current.position.set(SIDES.keras, 0.06, 0);
      pending.current.scale.set(Math.max(0.0001, on), 1, Math.max(0.0001, on));
      (pending.current.material as THREE.MeshBasicMaterial).opacity = on * 0.55;
    }
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {[SIDES.pytorch, SIDES.keras].map((x, i) => (
        <mesh key={`wall-${i}`} ref={(node) => { walls.current[i] = node; }}>
          <boxGeometry args={[WALL.width, WALL.height, WALL.depth]} />
          <meshBasicMaterial color={WALL_C} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      <mesh ref={beam}>
        <boxGeometry args={[1, 0.3, 1.1]} />
        <meshBasicMaterial color={BEAM_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      {SPANS.map((span, i) => (
        <mesh key={span.key} ref={(node) => { spans.current[i] = node; }}>
          <boxGeometry args={[1, 0.3, 0.75]} />
          <meshBasicMaterial color={OPEN} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      <mesh ref={trap}>
        <boxGeometry args={[1, 0.26, 0.75]} />
        <meshBasicMaterial color={TRAP_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      {/* The accuracy that exists, and the slot where the other one would go. */}
      <mesh ref={measured}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshBasicMaterial color={MEASURED} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={pending}>
        <boxGeometry args={[1.5, 0.12, 1.5]} />
        <meshBasicMaterial color={PENDING} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  );
}
