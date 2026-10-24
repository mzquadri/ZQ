"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import WorldStage from "@/components/world/WorldStage";

import Readout from "./Readout";
import { STATES, active } from "./states";

/**
 * The host for the news-classification world.
 *
 * All four gates and the scroll sampler live in `WorldStage`. What belongs here is the dynamic
 * import, which keeps this world's Three.js out of every other page's bundle, and the state list
 * the caption reads from.
 */

const WorldCanvas = dynamic(() => import("./NlpWorldCanvas"), { ssr: false });

export default function NlpWorld({ flat }: { flat: ReactNode }) {
  return (
    <WorldStage
      states={STATES}
      active={active}
      className="nlp-world"
      flat={flat}
      readout={(state) => <Readout state={state} />}
      canvas={({ frame, frameloop }) => <WorldCanvas frame={frame} frameloop={frameloop} />}
    />
  );
}
