"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import MlopsWorldScene, { type Frame } from "./MlopsWorldScene";

/** Everything that touches WebGL, behind one dynamic import. Same boundary as the other worlds. */
export default function MlopsWorldCanvas({ frame }: { frame: RefObject<Frame | null> }) {
  return (
    <Canvas
      camera={{ far: 80, fov: 40, near: 0.1, position: [-1.1, 1.9, 9.4] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <MlopsWorldScene frame={frame} />
    </Canvas>
  );
}
