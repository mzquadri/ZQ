"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import StreamflowWorldScene, { type Frame } from "./StreamflowWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function StreamflowWorldCanvas({ frame }: { frame: RefObject<Frame | null> }) {
  return (
    <Canvas
      camera={{ far: 90, fov: 40, near: 0.1, position: [0, 1.9, 8.1] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <StreamflowWorldScene frame={frame} />
    </Canvas>
  );
}
