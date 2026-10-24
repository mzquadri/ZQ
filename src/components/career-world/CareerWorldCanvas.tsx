"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import CareerWorldScene, { type Frame } from "./CareerWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function CareerWorldCanvas({
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
      /* Square to the bars and low: a ceiling being broken is only legible from the side. */
      camera={{ far: 90, fov: 36, near: 0.1, position: [0, 1.1, 9.2] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <CareerWorldScene frame={frame} />
    </Canvas>
  );
}
