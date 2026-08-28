"use client";

import { useMemo, type ReactNode } from "react";

import CanvasStage from "@/components/scene/CanvasStage";
import { drawClosing, drawDomains } from "@/components/scene/personal-scenes";
import type { Camera } from "@/components/scene/projector";

/**
 * Hosts for the three personal routes.
 *
 * Same contract and same 900px gate as the project scenes: the flat figure is always rendered
 * and is complete on its own, the canvas is drawn over it, and below tablet width the drawing is
 * the better experience rather than merely the cheaper one.
 */

const MIN_WIDTH = 900;

function useCamera(overrides: Partial<Camera>) {
  return useMemo<Camera>(
    () => ({ distance: 13, focal: 1150, yaw: -0.95, pitch: 0.3, ...overrides }),
    [overrides],
  );
}

export function DomainsCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ focal: 1500, pitch: 0.18, yaw: -0.5 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-domains"
      draw={drawDomains}
      fallback={flat}
      minWidth={MIN_WIDTH}
      label="Three fields drawn as planes in space - modelling, systems and evidence - with the region where all three overlap marked as where the work sits."
    />
  );
}

export function ClosingCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ focal: 1300, pitch: 0.5, yaw: -0.2 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-closing"
      draw={drawClosing}
      fallback={flat}
      minWidth={MIN_WIDTH}
      label="A boundary drawn around a point."
    />
  );
}
