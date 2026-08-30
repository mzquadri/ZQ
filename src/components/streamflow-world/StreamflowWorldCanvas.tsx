"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import StreamflowWorldScene, { type Frame } from "./StreamflowWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function StreamflowWorldCanvas({
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
      camera={{ far: 90, fov: 40, near: 0.1, position: [0, 1.9, 8.1] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <StreamflowWorldScene frame={frame} />
    </Canvas>
  );
}
