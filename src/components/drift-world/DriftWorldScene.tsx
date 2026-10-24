"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import {
  AXIS_WIDTH,
  BANDS,
  COLUMNS,
  DETECTOR,
  OFFERS,
  TARGET,
  WINDOWS,
} from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * A gate on an axis, and three offers to it.
 *
 * The gate is one object that moves. That is the entire point of the upper band: a policy that
 * requires a challenger to beat the champion by two per cent is a policy whose bar rises every
 * time it is cleared, and the third offer fails it by being the second one again.
 *
 * Below the axis, on their own scales, are the two things the monitor itself is about: what it
 * measured, and the defect found in how it measured.
 */

const AXIS_C = new THREE.Color("#5c6873");
const GATE = new THREE.Color("#e8eef2");
const PROMOTED = new THREE.Color("#4cc4b0");
const REFUSED = new THREE.Color("#f0a03c");
const QUIET = new THREE.Color("#5c6873");
const MOVED = new THREE.Color("#f0a03c");
const STILL = new THREE.Color("#5c6873");
const CONTROL = new THREE.Color("#4cc4b0");
const ALARM = new THREE.Color("#f0a03c");
const FLIPPED = new THREE.Color("#4cc4b0");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function DriftWorldScene({ frame }: { frame: FrameRef }) {
  const gate = useRef<THREE.Mesh>(null);
  const offers = useRef<(THREE.Mesh | null)[]>([]);
  const columns = useRef<(THREE.Mesh | null)[]>([]);
  const target = useRef<THREE.Mesh>(null);
  const threshold = useRef<THREE.Mesh>(null);
  const control = useRef<THREE.Mesh>(null);
  const alarm = useRef<THREE.Mesh>(null);
  const windows = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const second = at(p, "retrain");
    const third = at(p, "refused");
    const measured = at(p, "measured");
    const watched = at(p, "detector");
    const defective = at(p, "seasonal");
    const closed = at(p, "absent");

    const upper = 1 - Math.max(measured, defective) * 0.75;

    /*
     * One gate, moving. Not three gates drawn at three places: the policy has a single bar and
     * the reason the third offer fails is that the second offer moved it, so the world has one
     * object that travels rather than a sequence that accumulates.
     */
    if (gate.current) {
      const toSecond = mix(OFFERS[0].gateX, OFFERS[1].gateX, second);
      const x = mix(toSecond, OFFERS[2].gateX, third);
      gate.current.visible = upper > 0.05;
      gate.current.position.set(x, 0, 0);
      (gate.current.material as THREE.MeshBasicMaterial).opacity = upper * (0.5 + third * 0.35);
    }

    /* Three offers, each arriving at its own height so the sequence stays readable. */
    OFFERS.forEach((offer, i) => {
      const block = offers.current[i];
      if (!block) return;
      const on = (i === 0 ? 1 : i === 1 ? second : third) * upper;
      block.visible = on > 0.03;
      block.position.set(offer.x, offer.y, 0);
      block.scale.setScalar(Math.max(0.0001, on));
      const material = block.material as THREE.MeshBasicMaterial;
      material.color.copy(offer.promoted ? PROMOTED : REFUSED);
      material.opacity = on * (offer.promoted ? 0.85 : 0.95);
    });

    /* What the monitor measured: eleven columns, one of which crossed its own threshold. */
    COLUMNS.forEach((column, i) => {
      const block = columns.current[i];
      if (!block) return;
      const on = measured * (1 - closed * 0.5);
      block.visible = on > 0.02;
      block.position.set(column.x, BANDS.measured + (column.moved ? 0.8 * on : 0), 0);
      block.scale.setScalar(Math.max(0.0001, on));
      const material = block.material as THREE.MeshBasicMaterial;
      material.color.copy(column.moved ? MOVED : STILL);
      material.opacity = on * (column.moved ? 0.95 : 0.35);
    });

    /* The target's own distance against its own threshold, on a scale neither shares with MAE. */
    if (threshold.current) {
      const on = measured * (1 - closed * 0.5);
      threshold.current.visible = on > 0.02;
      threshold.current.position.set(-4.4 + TARGET.threshold * TARGET.scale, BANDS.measured + 2.0, 0);
      (threshold.current.material as THREE.MeshBasicMaterial).opacity = on * 0.6;
    }
    if (target.current) {
      const on = measured * (1 - closed * 0.5);
      target.current.visible = on > 0.02;
      const length = TARGET.distance * TARGET.scale * on;
      target.current.position.set(-4.4 + length / 2, BANDS.measured + 2.0, 0);
      target.current.scale.set(Math.max(0.0001, length), 1, 1);
      (target.current.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    }

    /*
     * The detector, as the series it watched: the control span, where every alarm would be false
     * by construction and there were none, and the row the first alarm actually landed on.
     */
    if (control.current) {
      const on = watched * (1 - closed * 0.5);
      control.current.visible = on > 0.02;
      const length = DETECTOR.width * DETECTOR.controlShare * on;
      control.current.position.set(-DETECTOR.width / 2 + length / 2, BANDS.measured - 1.6, 0);
      control.current.scale.set(Math.max(0.0001, length), 1, 1);
      (control.current.material as THREE.MeshBasicMaterial).opacity = on * 0.8;
    }
    if (alarm.current) {
      const on = watched * (1 - closed * 0.5);
      alarm.current.visible = on > 0.02;
      alarm.current.position.set(
        -DETECTOR.width / 2 + DETECTOR.width * DETECTOR.alarmShare,
        BANDS.measured - 1.6,
        0,
      );
      alarm.current.scale.setScalar(Math.max(0.0001, on));
      (alarm.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }

    /*
     * The four window sizes, and the two verdicts the fix changed.
     *
     * A flipped window rises; the two that did not change stay put. Which ones flip is read from
     * the artefact rather than listed here, so a re-run that changed a third would show it.
     */
    WINDOWS.forEach((window, i) => {
      const block = windows.current[i];
      if (!block) return;
      const on = defective * (1 - closed * 0.4);
      block.visible = on > 0.02;
      block.position.set(window.x, BANDS.seasonal + (window.flipped ? 0.9 * on : 0), 0);
      block.scale.setScalar(Math.max(0.0001, on));
      const material = block.material as THREE.MeshBasicMaterial;
      material.color.copy(window.flipped ? FLIPPED : QUIET);
      material.opacity = on * (window.flipped ? 0.9 : 0.4);
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {/* The MAE axis. Better is to the left, which is the direction the gate travels. */}
      <mesh position={[0, -1.6, 0]}>
        <boxGeometry args={[AXIS_WIDTH, 0.05, 0.05]} />
        <meshBasicMaterial color={AXIS_C} transparent depthWrite={false} opacity={0.45} />
      </mesh>

      <mesh ref={gate}>
        <boxGeometry args={[0.16, 5.2, 3.0]} />
        <meshBasicMaterial color={GATE} transparent depthWrite={false} opacity={0} />
      </mesh>

      {OFFERS.map((offer, i) => (
        <mesh key={offer.key} ref={(node) => { offers.current[i] = node; }}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshBasicMaterial color={PROMOTED} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {COLUMNS.map((column, i) => (
        <mesh key={`col-${i}`} ref={(node) => { columns.current[i] = node; }}>
          <boxGeometry args={[0.36, 0.36, 0.36]} />
          <meshBasicMaterial color={STILL} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      <mesh ref={target}>
        <boxGeometry args={[1, 0.34, 0.34]} />
        <meshBasicMaterial color={MOVED} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={threshold}>
        <boxGeometry args={[0.1, 0.9, 0.9]} />
        <meshBasicMaterial color={GATE} transparent depthWrite={false} opacity={0} />
      </mesh>

      <mesh ref={control}>
        <boxGeometry args={[1, 0.3, 0.3]} />
        <meshBasicMaterial color={CONTROL} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={alarm}>
        <octahedronGeometry args={[0.32]} />
        <meshBasicMaterial color={ALARM} transparent depthWrite={false} opacity={0} />
      </mesh>

      {WINDOWS.map((window, i) => (
        <mesh key={`win-${window.rows}`} ref={(node) => { windows.current[i] = node; }}>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshBasicMaterial color={QUIET} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
