"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import {
  ACROSS_PLACE,
  AXIS_HEIGHT,
  LANES,
  OVER_TIME,
  RAIL,
  railX,
} from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * One axis, two quantities, one scale.
 *
 * The left lane carries twenty-four years of change and the right lane carries the distance
 * between countries in a single year, and they are drawn against the same axis at the same scale
 * because that is the comparison the report exists to make. The step on the left stays as small
 * as it is. Nothing in this world magnifies it.
 */

const AXIS_C = new THREE.Color("#5c6873");
const TIME = new THREE.Color("#8ea6bd");
const MOVED = new THREE.Color("#f0a03c");
const PLACE = new THREE.Color("#5fb0d8");
const HERE = new THREE.Color("#4cc4b0");
const GAINED = new THREE.Color("#4cc4b0");
const FLAT = new THREE.Color("#5c6873");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function ModalSplitWorldScene({ frame }: { frame: FrameRef }) {
  const axisBar = useRef<THREE.Mesh>(null);
  const start = useRef<THREE.Mesh>(null);
  const end = useRef<THREE.Mesh>(null);
  const step = useRef<THREE.Mesh>(null);
  const span = useRef<THREE.Mesh>(null);
  const low = useRef<THREE.Mesh>(null);
  const high = useRef<THREE.Mesh>(null);
  const germany = useRef<THREE.Mesh>(null);
  const railMarks = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const placed = at(p, "eu");
    const travelled = at(p, "moved");
    const opened = at(p, "spread");
    const here = at(p, "germany");
    const railed = at(p, "rail");
    const sourced = at(p, "provenance");

    const lanes = 1 - railed * 0.8;

    if (axisBar.current) {
      (axisBar.current.material as THREE.MeshBasicMaterial).opacity = lanes * 0.45;
    }

    /* The aggregate in 2000, and the same aggregate twenty-four years later. */
    if (start.current) {
      const on = placed * lanes;
      start.current.visible = on > 0.02;
      start.current.position.set(LANES.time, OVER_TIME.from, 0);
      (start.current.material as THREE.MeshBasicMaterial).opacity = on * (0.9 - travelled * 0.4);
    }
    if (end.current) {
      const on = travelled * lanes;
      end.current.visible = on > 0.02;
      /* It travels, rather than appearing beside the first mark: the quantity is the distance. */
      end.current.position.set(LANES.time, mix(OVER_TIME.from, OVER_TIME.to, travelled), 0);
      (end.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }
    if (step.current) {
      const on = travelled * lanes;
      step.current.visible = on > 0.02;
      const height = (OVER_TIME.to - OVER_TIME.from) * on;
      step.current.position.set(LANES.time, OVER_TIME.from + height / 2, 0);
      step.current.scale.set(1, Math.max(0.0001, height), 1);
      (step.current.material as THREE.MeshBasicMaterial).opacity = on * 0.4;
    }

    /*
     * The spread, as a span the same axis is read off. It opens from the middle outward, so the
     * two ends arrive together and neither reads as the subject.
     */
    if (span.current) {
      const on = opened * lanes;
      span.current.visible = on > 0.02;
      const full = ACROSS_PLACE.high - ACROSS_PLACE.low;
      const height = full * on;
      const centre = (ACROSS_PLACE.high + ACROSS_PLACE.low) / 2;
      span.current.position.set(LANES.place, centre, 0);
      span.current.scale.set(1, Math.max(0.0001, height), 1);
      (span.current.material as THREE.MeshBasicMaterial).opacity = on * 0.62;
    }
    [low, high].forEach((ref, i) => {
      const mark = ref.current;
      if (!mark) return;
      const on = opened * lanes;
      mark.visible = on > 0.02;
      mark.position.set(LANES.place, i === 0 ? ACROSS_PLACE.low : ACROSS_PLACE.high, 0);
      (mark.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    });

    /* One country inside the span, because the page is written from it. */
    if (germany.current) {
      const on = here * lanes;
      germany.current.visible = on > 0.02;
      germany.current.position.set(LANES.place, ACROSS_PLACE.germany, 0);
      germany.current.scale.setScalar(Math.max(0.0001, on));
      (germany.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }

    /*
     * The rail beat: one mark per country with a rail share recorded, the ones that gained
     * lifted. Only the count and the largest gain are published, so the lifted marks rise to one
     * common height rather than to values the report does not give.
     */
    for (let i = 0; i < RAIL.total; i += 1) {
      const mark = railMarks.current[i];
      if (!mark) continue;
      const on = railed * (1 - sourced * 0.6);
      const gained = i < RAIL.gained;
      mark.visible = on > 0.02;
      mark.position.set(railX(i), -1.8 + (gained ? 0.75 * on : 0), 0);
      const material = mark.material as THREE.MeshBasicMaterial;
      material.color.copy(gained ? GAINED : FLAT);
      material.opacity = on * (gained ? 0.9 : 0.4);
    }
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {/* The axis itself, which every quantity in this world is read off. */}
      <mesh ref={axisBar} position={[0, AXIS_HEIGHT / 2, -0.6]}>
        <boxGeometry args={[0.07, AXIS_HEIGHT, 0.07]} />
        <meshBasicMaterial color={AXIS_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      {/*
        Rules, not marks.
        
        A sphere wide enough to see at the wide shot is wider than the quantity it is meant to
        sit at: the whole change is 0.1 of a drawn unit, and two 0.12-radius marks at that
        distance apart are one blob at every distance. A rule has no height to speak of, so the
        gap between two of them is the only thing there is to look at - which is the point.
      */}
      <mesh ref={start}>
        <boxGeometry args={[1.6, 0.035, 1.6]} />
        <meshBasicMaterial color={TIME} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={end}>
        <boxGeometry args={[1.6, 0.04, 1.6]} />
        <meshBasicMaterial color={MOVED} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={step}>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshBasicMaterial color={MOVED} transparent depthWrite={false} opacity={0} />
      </mesh>

      <mesh ref={span}>
        <boxGeometry args={[0.95, 1, 0.95]} />
        <meshBasicMaterial color={PLACE} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={low}>
        <sphereGeometry args={[0.24, 18, 14]} />
        <meshBasicMaterial color={PLACE} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={high}>
        <sphereGeometry args={[0.24, 18, 14]} />
        <meshBasicMaterial color={PLACE} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={germany}>
        <octahedronGeometry args={[0.34]} />
        <meshBasicMaterial color={HERE} transparent depthWrite={false} opacity={0} />
      </mesh>

      {Array.from({ length: RAIL.total }, (_, i) => (
        <mesh key={`rail-${i}`} ref={(node) => { railMarks.current[i] = node; }}>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
          <meshBasicMaterial color={FLAT} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
