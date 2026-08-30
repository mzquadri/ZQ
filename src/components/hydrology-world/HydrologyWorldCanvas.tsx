"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import HydrologyWorldScene, { type Frame } from "./HydrologyWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function HydrologyWorldCanvas({
  frame,
  frameloop,
}: {
  frame: RefObject<Frame | null>;
  /* "never" while the stage is off screen, so a finished world stops competing for the
   * main thread with whatever the reader moved on to. */
  frameloop: "always" | "never";
}) {
  return (
    <Canvas
      frameloop={frameloop}
      camera={{ far: 90, fov: 38, near: 0.1, position: [0, 0.55, 11.4] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <HydrologyWorldScene frame={frame} />
    </Canvas>
  );
}
