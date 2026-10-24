"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import WorldStage from "@/components/world/WorldStage";

import Readout from "./Readout";
import { STATES, active } from "./states";

/** The host for the modal-split world. Gates and sampler live in `WorldStage`. */

const WorldCanvas = dynamic(() => import("./ModalSplitWorldCanvas"), { ssr: false });

export default function ModalSplitWorld({ flat }: { flat: ReactNode }) {
  return (
    <WorldStage
      states={STATES}
      active={active}
      className="modalsplit-world"
      flat={flat}
      readout={(state) => <Readout state={state} />}
      canvas={({ frame, frameloop }) => <WorldCanvas frame={frame} frameloop={frameloop} />}
    />
  );
}
