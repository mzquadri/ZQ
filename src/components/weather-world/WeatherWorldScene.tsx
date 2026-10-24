"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { BY_AMPLITUDE, BY_SPREAD, MARKS, PLANE, ROW_Z } from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * Twelve marks and a plane at zero.
 *
 * The temperature row straddles the plane; the humidity row does not touch it. That is the whole
 * finding, and because zero is a solid object rather than a tick on an axis, "none of them
 * crossed" is a thing the eye settles rather than a claim the caption makes.
 */

const PLANE_C = new THREE.Color("#dfe6ea");
const OK = new THREE.Color("#4cc4b0");
const BIAS = new THREE.Color("#f0a03c");
const LINK = new THREE.Color("#8ea6bd");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function WeatherWorldScene({ frame }: { frame: FrameRef }) {
  const temps = useRef<(THREE.Mesh | null)[]>([]);
  const hums = useRef<(THREE.Mesh | null)[]>([]);
  const zeroPlane = useRef<THREE.Mesh>(null);
  const band = useRef<THREE.Mesh>(null);
  const links = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(shot.swing, shot.height, shot.distance);
    camera.lookAt(0, 0.1, shot.look);

    const moved = at(p, "temperature");
    const marked = at(p, "zero");
    const second = at(p, "humidity");
    const biased = at(p, "bias");
    const ranked = at(p, "ranking");
    const generated = at(p, "generated");

    const rows = 1 - ranked * 0.8;

    if (zeroPlane.current) {
      const on = 0.35 + marked * 0.65;
      (zeroPlane.current.material as THREE.MeshBasicMaterial).opacity = on * 0.4 * (1 - generated * 0.5);
    }

    MARKS.forEach((mark, i) => {
      const t = temps.current[i];
      if (t) {
        /* Each city travels from zero to its own miss: recovering a value, drawn as arriving. */
        t.position.set(mix(0, mark.temperature, moved), mark.y, ROW_Z.temperature);
        t.visible = rows > 0.05;
        const material = t.material as THREE.MeshBasicMaterial;
        material.color.copy(OK);
        material.opacity = rows * (0.45 + moved * 0.5);
      }

      const h = hums.current[i];
      if (h) {
        const on = second;
        h.visible = on > 0.02 && rows > 0.05;
        h.position.set(mix(0, mark.humidity, on), mark.y, ROW_Z.humidity);
        const material = h.material as THREE.MeshBasicMaterial;
        material.color.copy(biased > 0.2 ? BIAS : OK);
        material.opacity = on * rows * 0.9;
      }
    });

    /* The band the six humidity misses fall inside. Drawn only once they have all arrived. */
    if (band.current) {
      const on = biased * rows;
      band.current.visible = on > 0.02;
      const lo = Math.min(...MARKS.map((m) => m.humidity));
      const hi = Math.max(...MARKS.map((m) => m.humidity));
      band.current.position.set((lo + hi) / 2, 0, ROW_Z.humidity);
      band.current.scale.set(Math.max(0.0001, (hi - lo) * on), 1, 1);
      (band.current.material as THREE.MeshBasicMaterial).opacity = on * 0.22;
    }

    /*
     * The ranking check: a bar per city joining its place in the configured order to its place in
     * the recovered one. Nothing crosses, so the bars stay parallel - which is the result.
     */
    BY_AMPLITUDE.forEach((city, i) => {
      const bar = links.current[i];
      if (!bar) return;
      const on = ranked * (1 - generated * 0.6);
      bar.visible = on > 0.02;
      const to = BY_SPREAD.indexOf(city);
      const fromX = (i - (BY_AMPLITUDE.length - 1) / 2) * 0.92;
      const toX = (to - (BY_SPREAD.length - 1) / 2) * 0.92;
      bar.position.set((fromX + toX) / 2, 0.1, mix(ROW_Z.humidity, -3.0, on));
      /* Length along z, so a crossing would be visible as a lean. */
      bar.scale.set(1, 1, on * 1.6);
      bar.rotation.y = Math.atan2(toX - fromX, 1.6);
      (bar.material as THREE.MeshBasicMaterial).opacity = on * 0.7;
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {/* Zero, as a solid object. */}
      <mesh ref={zeroPlane}>
        <boxGeometry args={[PLANE.width, PLANE.height, PLANE.depth]} />
        <meshBasicMaterial color={PLANE_C} transparent opacity={0.4} />
      </mesh>

      {MARKS.map((mark, i) => (
        <mesh key={`t-${mark.city}`} ref={(node) => { temps.current[i] = node; }}>
          <sphereGeometry args={[0.22, 18, 14]} />
          <meshBasicMaterial color={OK} transparent opacity={0.45} />
        </mesh>
      ))}

      {MARKS.map((mark, i) => (
        <mesh key={`h-${mark.city}`} ref={(node) => { hums.current[i] = node; }}>
          <sphereGeometry args={[0.22, 18, 14]} />
          <meshBasicMaterial color={OK} transparent opacity={0} />
        </mesh>
      ))}

      <mesh ref={band}>
        <boxGeometry args={[1, 1.1, 2.2]} />
        <meshBasicMaterial color={BIAS} transparent opacity={0} />
      </mesh>

      {BY_AMPLITUDE.map((city, i) => (
        <mesh key={`link-${city}`} ref={(node) => { links.current[i] = node; }}>
          <boxGeometry args={[0.07, 0.07, 1]} />
          <meshBasicMaterial color={LINK} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
