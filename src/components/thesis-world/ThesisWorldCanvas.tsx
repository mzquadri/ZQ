"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import ThesisWorldScene, { type Frame } from "./ThesisWorldScene";

/**
 * Everything that touches WebGL, behind one dynamic import.
 *
 * This module exists purely as a code-splitting boundary and it is load-bearing. The host used to
 * import `Canvas` itself and lazily import only the scene, which looks lazy and is not: naming
 * `@react-three/fiber` at module scope in a file the page imports directly pulls fiber and three
 * into the eagerly-loaded chunk, so the route arrived at about 1.47MB for every reader - including
 * the ones on a phone and the ones who asked for less motion, neither of whom can ever see it.
 *
 * With the renderer isolated here, nothing three-shaped is fetched until all three gates pass.
 */
export default function ThesisWorldCanvas({ frame }: { frame: RefObject<Frame | null> }) {
  return (
    <Canvas
      camera={{ far: 90, fov: 42, near: 0.1, position: [0, 11, 13] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ThesisWorldScene frame={frame} />
    </Canvas>
  );
}
