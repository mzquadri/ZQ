"use client";

import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import type { PerspectiveCamera } from "three";

/** The aspect every world was composed for. Anything narrower gets a wider lens. */
const COMPOSED_ASPECT = 1.6;
const WIDEST_LENS = 100;

/**
 * Keeps a world's whole width in frame on a tall screen.
 *
 * A perspective camera holds its vertical field of view, so a portrait phone would crop the sides
 * of a scene composed for a landscape window. This widens the lens to hold the composed horizontal
 * field instead. Nothing changes at or above the composed aspect.
 */
export default function PortraitFit() {
  const read = useThree((state) => state.get);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);

  useLayoutEffect(() => {
    const camera = read().camera as PerspectiveCamera;
    if (!("fov" in camera) || height === 0) return;
    const base = (camera.userData.composedFov as number | undefined) ?? camera.fov;
    camera.userData.composedFov = base;

    const aspect = width / height;
    const half = Math.tan((base * Math.PI) / 360);
    const fitted = (Math.atan((half * COMPOSED_ASPECT) / aspect) * 360) / Math.PI;
    camera.fov = aspect < COMPOSED_ASPECT ? Math.min(fitted, WIDEST_LENS) : base;
    camera.updateProjectionMatrix();
  }, [height, read, width]);

  return null;
}
