"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import InsureAssistWorldScene, { type Frame } from "./InsureAssistWorldScene";

/**
 * Everything that touches WebGL, behind one dynamic import - the same boundary the other worlds
 * use, and for the same reason: naming the renderer at module scope in a file the page imports
 * directly pulls fiber and three into the eagerly-loaded chunk, however lazy the scene beneath
 * it looks.
 */
export default function InsureAssistWorldCanvas({
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
      camera={{ far: 80, fov: 42, near: 0.1, position: [0, 6.4, 6.2] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <InsureAssistWorldScene frame={frame} />
    </Canvas>
  );
}
