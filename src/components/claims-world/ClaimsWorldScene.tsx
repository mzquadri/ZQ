"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import {
  AXIS_WIDTH,
  COLUMNS,
  CROSSING,
  DEPTH,
  GATES,
  HABIT,
  SURFACES,
  VALUE_SPAN,
  heightAt,
  px,
} from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Two planes that meet along a line.
 *
 * Both expectations are linear in one probability, so both are flat, so their intersection is a
 * straight edge standing in the air rather than a point on a chart. The edge is the only threshold
 * the matrix justifies, and it is placed from the same solved value the caption quotes.
 *
 * The surfaces are built once from their endpoints and then tilted, rather than rebuilt per frame:
 * their geometry is fixed by four numbers that do not depend on scroll, and the only thing a
 * reader's scroll changes is which part of the object is being looked at.
 */

const ACT = new THREE.Color("#4cc4b0");
const HOLD = new THREE.Color("#f0a03c");
const EDGE = new THREE.Color("#e8eef2");
const DEFAULT_CUT = new THREE.Color("#8ea6bd");
const FLOOR = new THREE.Color("#5c6873");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

/**
 * One surface, as a quad through its own four corners.
 *
 * Written out as corners rather than as a rotated plane because the tilt is the ratio of two of
 * the matrix's values, and a rotation would need that ratio converted into an angle and back. The
 * corners are the numbers.
 */
function surfaceGeometry(atZero: number, atOne: number) {
  const x0 = px(0);
  const x1 = px(1);
  const z = DEPTH / 2;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        x0, atZero, -z, x1, atOne, -z, x1, atOne, z,
        x0, atZero, -z, x1, atOne, z, x0, atZero, z,
      ],
      3,
    ),
  );
  geometry.computeVertexNormals();
  return geometry;
}

export default function ClaimsWorldScene({ frame }: { frame: FrameRef }) {
  const act = useRef<THREE.Mesh>(null);
  const hold = useRef<THREE.Mesh>(null);
  const edge = useRef<THREE.Mesh>(null);
  const habit = useRef<THREE.Mesh>(null);
  const span = useRef<THREE.Mesh>(null);
  const columns = useRef<(THREE.Mesh | null)[]>([]);
  const gates = useRef<(THREE.Mesh | null)[]>([]);

  const geometries = useMemo(
    () => SURFACES.map((s) => surfaceGeometry(heightAt(s, 0), heightAt(s, 1))),
    [],
  );

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    /* Aimed into the clear part of the frame, as a share of its width, so closing in holds. */
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const valued = at(p, "matrix");
    const crossed = at(p, "crossing");
    const defaulted = at(p, "habit");
    const compared = at(p, "ratio");
    const separated = at(p, "stages");
    const limited = at(p, "limits");

    /*
     * The two surfaces are solid while the argument is about where they cross and thin out for the
     * closing beat, which is about what is not being claimed. A surface you can see through is the
     * honest state for arithmetic on an illustrative matrix.
     */
    const solid = 1 - limited * 0.62;
    if (act.current) {
      (act.current.material as THREE.MeshBasicMaterial).opacity = solid * (0.3 + crossed * 0.12);
    }
    if (hold.current) {
      (hold.current.material as THREE.MeshBasicMaterial).opacity = solid * (0.3 + crossed * 0.12);
    }

    /* The line they meet along, which is the threshold. It grows along the depth of the surfaces. */
    if (edge.current) {
      const on = crossed;
      edge.current.visible = on > 0.02;
      edge.current.position.set(CROSSING.x, CROSSING.y, 0);
      edge.current.scale.set(1, 1, Math.max(0.0001, on));
      (edge.current.material as THREE.MeshBasicMaterial).opacity = on * (0.95 - limited * 0.4);
    }

    /* The cut a classifier arrives at without being asked: a wall, drawn at one half. */
    if (habit.current) {
      const on = defaulted;
      habit.current.visible = on > 0.02;
      habit.current.position.set(HABIT.x, (VALUE_SPAN.low + VALUE_SPAN.high) / 2, 0);
      habit.current.scale.set(1, Math.max(0.0001, on), 1);
      (habit.current.material as THREE.MeshBasicMaterial).opacity = on * 0.55;
    }

    /*
     * The distance between the two cuts, on the floor beneath them. Drawn as a length rather than
     * printed as a ratio: the ratio is in the readout, and a reader should be able to disagree
     * with it by looking.
     */
    if (span.current) {
      const on = compared;
      span.current.visible = on > 0.02;
      const width = (HABIT.x - CROSSING.x) * on;
      span.current.position.set(CROSSING.x + width / 2, VALUE_SPAN.low - 0.5, 0);
      span.current.scale.set(Math.max(0.0001, width), 1, 1);
      (span.current.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    }

    /* The four signed values, standing at the ends of the axis their outcome anchors. */
    COLUMNS.forEach((column, i) => {
      const bar = columns.current[i];
      if (!bar) return;
      const on = valued * (1 - separated * 0.75);
      bar.visible = on > 0.02 && Math.abs(column.height) > 0.001;
      const grown = column.height * on;
      bar.position.set(column.x, grown / 2, column.z);
      bar.scale.set(1, Math.max(0.0001, Math.abs(grown)), 1);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.color.copy(column.value > 0 ? ACT : HOLD);
      material.opacity = on * 0.8;
    });

    /* Three gates the axis runs through, because the three questions are answered separately. */
    GATES.forEach((gate, i) => {
      const ring = gates.current[i];
      if (!ring) return;
      const on = at(p, "stages") * (1 - limited * 0.5);
      const staged = Math.max(0, Math.min(1, (on - i * 0.18) / 0.5));
      ring.visible = staged > 0.02;
      ring.position.set(gate.x, (VALUE_SPAN.low + VALUE_SPAN.high) / 2, 0);
      ring.scale.set(1, Math.max(0.0001, staged), 1);
      (ring.material as THREE.MeshBasicMaterial).opacity = staged * 0.5;
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      <mesh ref={act} geometry={geometries[0]}>
        <meshBasicMaterial color={ACT} transparent depthWrite={false} side={THREE.DoubleSide} opacity={0.4} />
      </mesh>
      <mesh ref={hold} geometry={geometries[1]}>
        <meshBasicMaterial color={HOLD} transparent depthWrite={false} side={THREE.DoubleSide} opacity={0.4} />
      </mesh>

      {/* The intersection, as a solid edge rather than a drawn line. */}
      <mesh ref={edge}>
        <boxGeometry args={[0.26, 0.26, DEPTH]} />
        <meshBasicMaterial color={EDGE} transparent depthWrite={false} opacity={0} />
      </mesh>

      {/* One half, as a wall the axis passes through. */}
      <mesh ref={habit}>
        <boxGeometry args={[0.22, VALUE_SPAN.high - VALUE_SPAN.low, DEPTH]} />
        <meshBasicMaterial color={DEFAULT_CUT} transparent depthWrite={false} opacity={0} />
      </mesh>

      {/* The span between the two cuts, on the floor. */}
      <mesh ref={span}>
        <boxGeometry args={[1, 0.16, 0.16]} />
        <meshBasicMaterial color={EDGE} transparent depthWrite={false} opacity={0} />
      </mesh>

      {COLUMNS.map((column, i) => (
        <mesh key={column.key} ref={(node) => { columns.current[i] = node; }}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshBasicMaterial color={ACT} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {GATES.map((gate, i) => (
        <mesh key={gate.key} ref={(node) => { gates.current[i] = node; }}>
          <boxGeometry args={[0.08, VALUE_SPAN.high - VALUE_SPAN.low, DEPTH * 1.1]} />
          <meshBasicMaterial color={FLOOR} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {/* The probability axis itself, which never leaves. */}
      <mesh position={[0, VALUE_SPAN.low - 0.5, 0]}>
        <boxGeometry args={[AXIS_WIDTH, 0.05, 0.05]} />
        <meshBasicMaterial color={FLOOR} transparent depthWrite={false} opacity={0.5} />
      </mesh>
    </group>
  );
}
