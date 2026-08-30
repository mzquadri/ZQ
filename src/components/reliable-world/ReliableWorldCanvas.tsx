"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import ReliableWorldScene, { type Frame } from "./ReliableWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function ReliableWorldCanvas({
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
      camera={{ far: 80, fov: 42, near: 0.1, position: [0, 1.6, 8.6] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ReliableWorldScene frame={frame} />
    </Canvas>
  );
}
