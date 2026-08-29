"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import CifarWorldScene, { type Frame } from "./CifarWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function CifarWorldCanvas({ frame }: { frame: RefObject<Frame | null> }) {
  return (
    <Canvas
      camera={{ far: 90, fov: 42, near: 0.1, position: [0, 0, 4.2] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <CifarWorldScene frame={frame} />
    </Canvas>
  );
}
