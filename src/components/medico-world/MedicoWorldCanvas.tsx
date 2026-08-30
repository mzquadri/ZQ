"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import MedicoWorldScene, { type Frame } from "./MedicoWorldScene";

/**
 * Everything that touches WebGL, behind one dynamic import.
 *
 * Same boundary the transport world uses, and for the same reason: naming `@react-three/fiber` at
 * module scope in a file the page imports directly pulls fiber and three into the eagerly-loaded
 * chunk, however lazy the scene import beneath it looks.
 */
export default function MedicoWorldCanvas({
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
      camera={{ far: 80, fov: 40, near: 0.1, position: [0, 0, 7.4] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <MedicoWorldScene frame={frame} />
    </Canvas>
  );
}
