"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { vectorPoints } from "@/content/scene-geometry";

/**
 * The vector space, drawn.
 *
 * Sixteen fixed points from a committed table, not a random cloud: a scene that differs between
 * renders cannot be screenshotted, recorded or compared, and a field of drifting particles would
 * be saying something about randomness that this system does not claim.
 *
 * The motion has one job and then stops. Points travel out from the origin to their coordinates
 * and the group turns a quarter of a revolution, which is what shows they occupy depth rather
 * than a plane. After that the frame loop goes quiet: `frameloop="demand"` renders nothing until
 * something invalidates, so a settled card costs no frames at all.
 */

const EASE = 0.085;
const SETTLE_EPSILON = 0.002;
const QUARTER_TURN = Math.PI / 2;
const MIN_FPS = 24;
const SLOW_FRAME_LIMIT = 24;

function readColour(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Gives up rather than keeping a weak device busy for a decoration. */
function BudgetGuard({ onDegrade }: { onDegrade: () => void }) {
  const strikes = useRef(0);
  useFrame((_, delta) => {
    if (delta <= 0) return;
    if (1 / delta < MIN_FPS) {
      strikes.current += 1;
      if (strikes.current >= SLOW_FRAME_LIMIT) onDegrade();
      return;
    }
    strikes.current = 0;
  });
  return null;
}

function Lattice({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const settle = useRef(0);
  const turn = useRef(0);
  const { invalidate } = useThree();

  const palette = useMemo(
    () => ({
      point: new THREE.Color(readColour("--teal-dark", "#004c47")),
      accent: new THREE.Color(readColour("--teal", "#006d65")),
    }),
    [],
  );

  useEffect(() => {
    invalidate();
  }, [active, invalidate]);

  useFrame((_, delta) => {
    let busy = false;
    const target = active ? 1 : 0;
    const gap = target - settle.current;

    if (Math.abs(gap) > SETTLE_EPSILON) {
      settle.current += gap * EASE;
      busy = true;
    } else {
      settle.current = target;
    }

    if (active && turn.current < QUARTER_TURN) {
      turn.current = Math.min(turn.current + delta * 0.42, QUARTER_TURN);
      busy = true;
    }

    if (group.current) {
      group.current.rotation.y = -0.5 + turn.current * 0.62;
      group.current.rotation.x = 0.12;
      group.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const [x, y, z] = vectorPoints[index];
        const t = THREE.MathUtils.clamp(settle.current * 1.35 - index * 0.018, 0, 1);
        mesh.position.set(x * t, y * t, z * t);
        mesh.scale.setScalar(t);
      });
    }

    if (busy) invalidate();
  });

  return (
    <group ref={group}>
      {vectorPoints.map((point, index) => (
        <mesh key={point.join()}>
          <sphereGeometry args={[index % 5 === 0 ? 0.08 : 0.052, 14, 12]} />
          <meshStandardMaterial color={index % 5 === 0 ? palette.accent : palette.point} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export default function VectorSpaceScene({
  active,
  onDegrade,
}: {
  active: boolean;
  onDegrade: () => void;
}) {
  return (
    <Canvas
      camera={{ fov: 34, position: [0, 0, 3.5] }}
      dpr={[1, 2]}
      frameloop="demand"
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      resize={{ scroll: false }}
    >
      <ambientLight intensity={1.35} />
      <directionalLight intensity={1.05} position={[2, 3, 4]} />
      <BudgetGuard onDegrade={onDegrade} />
      <Lattice active={active} />
    </Canvas>
  );
}
