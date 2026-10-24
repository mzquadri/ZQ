"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import GatewayWorldScene, { type Frame } from "./GatewayWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function GatewayWorldCanvas({
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
      /*
       * A longer lens and a far clip that reaches past the server. The composition is depth, so a
       * wide field of view would exaggerate it and make the three planes read as three sizes
       * rather than three distances.
       */
      camera={{ far: 120, fov: 34, near: 0.1, position: [0, 0.9, 5.4] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <GatewayWorldScene frame={frame} />
    </Canvas>
  );
}
