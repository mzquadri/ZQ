"use client";

import { useMemo, type ReactNode } from "react";

import CanvasStage from "@/components/scene/CanvasStage";
import { drawBranch, drawEnsemble, drawHorizon } from "@/components/scene/project-scenes";
import { drawGraphCity, drawRetrieval } from "@/components/scene/migrated-scenes";
import type { Camera } from "@/components/scene/projector";

/**
 * Thin hosts for the projected scenes.
 *
 * Gated to 900px and up. The projector is cheap enough to run on a phone, but cheap is not the
 * question - the flat SVG figures are dense, labelled and complete, and at 390px a perspective
 * view of the same data is sparser and harder to read than the drawing it would replace. The
 * spatial layer is an enhancement for screens with room for depth; below that the drawing wins.
 *
 * Each pairs a draw function with the flat figure it enhances. The flat figure is always
 * rendered and is the complete explanation on its own; the canvas is drawn over it and the flat
 * ink is hidden by CSS once it is. Layout is identical either way, which is what keeps these
 * stages at zero layout shift.
 *
 * The camera is shared: a long lens, a low three-quarter angle, and yaw held well away from zero
 * so that depth maps to screen width rather than collapsing.
 */

/*
 * The shared camera language: a long lens, a low three-quarter angle, and yaw held well away from
 * zero so depth maps to screen width instead of collapsing.
 *
 * Focal is per-scene, because the scenes do not share a coordinate span - the network occupies
 * about +/-3 units while the pipeline runs 16 deep, so one focal length leaves half of them
 * floating small in the middle of their frame. Each is sized to fill its own box; the *angle* is
 * what is shared, and that is what makes them look like one authored set.
 */
const SHARED_CAMERA: Camera = { distance: 13, focal: 1150, yaw: -0.95, pitch: 0.3 };

/** Below this the flat figure is the better experience, not merely the cheaper one. */
const MIN_WIDTH = 900;

function useCamera(overrides?: Partial<Camera>) {
  return useMemo<Camera>(() => ({ ...SHARED_CAMERA, ...overrides }), [overrides]);
}

export function EnsembleCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ focal: 1050 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-ensemble"
      draw={drawEnsemble}
      fallback={flat}
      minWidth={MIN_WIDTH}
      trackSelector=".case-story-body"
      label="Ensemble members run into the horizon, agreeing near the start and separating through the middle. Their spread is then summarised as a band, with what actually happened cutting across it."
    />
  );
}

export function HorizonCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ focal: 1000 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-horizon"
      draw={drawHorizon}
      fallback={flat}
      minWidth={MIN_WIDTH}
      trackSelector=".case-story-body"
      label="Observed history runs up to the moment a forecast is issued, and beyond that plane the predicted interval opens as it recedes - the depth axis is lead time."
    />
  );
}

export function BranchCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ pitch: 0.24, yaw: -0.8, focal: 1900 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-branch"
      draw={drawBranch}
      fallback={flat}
      minWidth={MIN_WIDTH}
      label="One captured source above, three derived forms beneath it - an ordered grid, a scattered volume and a ring - with a check returning from each form to the source it must agree with."
    />
  );
}

export function GraphCityCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ pitch: 0.42, yaw: -0.9, focal: 1850 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-graph"
      draw={drawGraphCity}
      fallback={flat}
      minWidth={MIN_WIDTH}
      trackSelector=".case-story-body"
      label="The road network drawn as a plan, with height at each junction standing for how uncertain the surrogate is there. The tallest, marked junctions are the ones that would go to review."
    />
  );
}

export function RetrievalCanvas({ flat }: { flat: ReactNode }) {
  const camera = useCamera({ pitch: 0.2, yaw: -0.85, focal: 1750 });
  return (
    <CanvasStage
      camera={camera}
      className="projected projected-retrieval"
      draw={drawRetrieval}
      fallback={flat}
      minWidth={MIN_WIDTH}
      trackSelector=".case-story-body"
      label="Passages take positions in a space where distance stands for similarity. A question arrives as a point in the same space, the nearest passages are selected, and lines tie them to the answer built from them."
    />
  );
}
