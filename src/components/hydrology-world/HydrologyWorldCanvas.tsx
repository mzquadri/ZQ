"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import HydrologyWorldScene, { type Frame } from "./HydrologyWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function HydrologyWorldCanvas({ frame }: { frame: RefObject<Frame | null> }) {
  return (
    <Canvas
      camera={{ far: 90, fov: 38, near: 0.1, position: [0, 0.55, 11.4] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <HydrologyWorldScene frame={frame} />
    </Canvas>
  );
}
