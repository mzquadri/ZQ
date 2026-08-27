"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import Stage3D from "@/components/scene/Stage3D";

/**
 * The spatial layer over the transport figure.
 *
 * The SVG passed in as `flat` is rendered by the server and is always present - it is the whole
 * figure for anyone on a narrow screen, without WebGL, or with reduced motion, and it says the
 * same things: the network, the wavefront, and which junctions the model had least to go on.
 *
 * When the gates pass, the 3D field is drawn over it and the flat version steps back. Two views
 * of one dataset, never two different pictures.
 */

const GraphCityScene = dynamic(() => import("./GraphCityScene"), { ssr: false, loading: () => null });

export default function GraphCityCanvas({ flat }: { flat: ReactNode }) {
  return (
    <Stage3D
      className="graph-city"
      fallback={flat}
      trackSelector=".case-story-body"
      label="The road network drawn as a plan, with height at each junction standing for how uncertain the surrogate is there. The ridges are the parts of the network that would go to review."
    >
      {({ active, progress, onDegrade }) => (
        <div className="graph-city-canvas">
          <GraphCityScene active={active} onDegrade={onDegrade} progress={progress} />
        </div>
      )}
    </Stage3D>
  );
}
