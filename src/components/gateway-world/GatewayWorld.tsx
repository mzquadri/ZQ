"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import WorldStage from "@/components/world/WorldStage";

import Readout from "./Readout";
import { STATES, active } from "./states";

/**
 * The host for the gateway world.
 *
 * All four gates and the scroll sampler live in `WorldStage`; what belongs here is the dynamic
 * import, which is what keeps this world's Three.js scene out of every other page's bundle, and
 * the state list the caption reads from.
 *
 * `minWidth` is higher than the shared default. This world's composition is depth - three planes
 * one behind another with traffic coming through them - and depth needs horizontal room to read
 * as depth rather than as three concentric rectangles. Below it, the flat figure is the page.
 */

const WorldCanvas = dynamic(() => import("./GatewayWorldCanvas"), { ssr: false });

export default function GatewayWorld({ flat }: { flat: ReactNode }) {
  return (
    <WorldStage
      states={STATES}
      active={active}
      className="gateway-world"
      flat={flat}
      minWidth={1100}
      readout={(state) => <Readout state={state} />}
      canvas={({ frame, frameloop }) => <WorldCanvas frame={frame} frameloop={frameloop} />}
    />
  );
}
