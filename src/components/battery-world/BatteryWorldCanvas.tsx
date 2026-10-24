"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import BatteryWorldScene, { type Frame } from "./BatteryWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function BatteryWorldCanvas({
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
      camera={{ far: 120, fov: 38, near: 0.05, position: [0, 0.6, 20] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <BatteryWorldScene frame={frame} />
    </Canvas>
  );
}
