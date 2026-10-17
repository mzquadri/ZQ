"use client";

import { Canvas } from "@react-three/fiber";
import type { RefObject } from "react";

import ParisWorldScene, { type WorldFrame } from "./ParisWorldScene";

/**
 * The WebGL boundary.
 *
 * Nothing three-shaped is imported above this file, so three, fiber and drei
 * are fetched only once the host has decided the reader can and wants to see
 * them: a browser with WebGL, a viewport wide enough to be worth it, and no
 * request for reduced motion. The same split is why the thesis world has its
 * own canvas module; naming fiber at module scope in a page pulls a megabyte
 * and a half into the chunk every reader downloads, including the ones who
 * will never see a frame of it.
 */
export default function ParisWorldCanvas({
  frame,
  frameloop,
}: {
  frame: RefObject<WorldFrame | null>;
  frameloop: "always" | "never";
}) {
  return (
    <Canvas
      frameloop={frameloop}
      camera={{ far: 120, fov: 44, near: 0.1, position: [0, 9.2, 13.4] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ParisWorldScene frame={frame} />
    </Canvas>
  );
}
