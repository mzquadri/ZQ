"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";

/**
 * Shared canvas setup for every WebGL scene on the site.
 *
 * The settings here are the ones that keep a portfolio full of 3D from behaving like a portfolio
 * full of 3D:
 *
 *   frameloop="demand"  nothing renders until a scene invalidates. A settled figure costs zero
 *                       frames, which is what makes it affordable to have several on one page.
 *   dpr capped at 1.75  a retina laptop would otherwise render four times the pixels for a
 *                       stylised diagram that gains nothing from them.
 *   no antialias        these scenes are flat-shaded geometry on a dark ground; MSAA costs real
 *                       fill rate and buys almost nothing here.
 *   powerPreference     "low-power" - none of this is worth waking a discrete GPU for.
 *
 * The budget guard is shared too: if a device cannot hold a usable frame rate the scene tells its
 * host to give up and fall back to the flat figure, rather than grinding.
 */

const MIN_FPS = 24;
const SLOW_FRAME_LIMIT = 24;

/** Reads a design token so a scene never hard-codes a colour the stylesheet owns. */
export function readColour(name: string, fallback: string) {
  if (typeof window === "undefined") return new THREE.Color(fallback);
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  try {
    return new THREE.Color(value || fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

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

/**
 * Keeps rendering while a scene is still moving, then stops.
 *
 * Scenes call `invalidate()` themselves while animating; this is the safety net that guarantees a
 * few frames after mount so nothing is left half-drawn if a scene forgets.
 */
function Warmup() {
  const frames = useRef(0);
  const { invalidate } = useThree();
  useFrame(() => {
    if (frames.current < 3) {
      frames.current += 1;
      invalidate();
    }
  });
  return null;
}

export default function SceneCanvas({
  children,
  onDegrade,
  camera,
}: {
  children: ReactNode;
  onDegrade: () => void;
  camera?: { position?: [number, number, number]; fov?: number };
}) {
  return (
    <Canvas
      camera={{ position: camera?.position ?? [0, 0, 6], fov: camera?.fov ?? 42 }}
      dpr={[1, 1.75]}
      frameloop="demand"
      gl={{ antialias: false, powerPreference: "low-power", alpha: true }}
    >
      <BudgetGuard onDegrade={onDegrade} />
      <Warmup />
      {children}
    </Canvas>
  );
}
