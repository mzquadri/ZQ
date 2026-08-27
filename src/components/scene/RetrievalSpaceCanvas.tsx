"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import Stage3D from "@/components/scene/Stage3D";

/**
 * The spatial layer over the retrieval figure.
 *
 * The flat SVG is always rendered and is the complete figure on its own: document, passages,
 * query, selection, tethered answer. The volume adds the one thing the diagram cannot show -
 * that "nearest" is a claim about distance in a space, and the selected set is a neighbourhood.
 */

const RetrievalSpaceScene = dynamic(() => import("./RetrievalSpaceScene"), {
  ssr: false,
  loading: () => null,
});

export default function RetrievalSpaceCanvas({ flat }: { flat: ReactNode }) {
  return (
    <Stage3D
      className="graph-city"
      fallback={flat}
      trackSelector=".case-story-body"
      label="Passages take positions in a space where distance stands for similarity. A question arrives as a point in the same space, the nearest passages are selected, and lines tie them to the answer built from them."
    >
      {({ active, progress, onDegrade }) => (
        <div className="graph-city-canvas">
          <RetrievalSpaceScene active={active} onDegrade={onDegrade} progress={progress} />
        </div>
      )}
    </Stage3D>
  );
}
