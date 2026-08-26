"use client";

import { createContext, useContext } from "react";
import type { WalkthroughScene } from "@/content/legal-kb-walkthrough";

/**
 * The context alone, deliberately separated from the controller that fills it.
 *
 * `SceneReveal` needs to ask whether a guided run is driving it. If it asked the controller
 * directly, every case-study route would statically import the controller and its script - the
 * step titles and captions included - even on pages where no walkthrough exists and, in a
 * production build, even though the confidential case study is excluded entirely. Fragments of an
 * unapproved page have no business being fetchable from a published one.
 *
 * Splitting the context out keeps this module tiny and lets the controller be loaded only where it
 * is actually mounted.
 */

export interface WalkthroughValue {
  active: boolean;
  playing: boolean;
  complete: boolean;
  stepIndex: number;
  totalSteps: number;
  sceneStates: Record<WalkthroughScene, number> | null;
  start: () => void;
  exit: () => void;
  next: () => void;
  previous: () => void;
  toggle: () => void;
  restart: () => void;
  /** Jump to an exact position. The one primitive everything else is built from. */
  goTo: (stepIndex: number, beatIndex: number) => void;
  registerLauncher: (element: HTMLButtonElement | null) => void;
}

export const WalkthroughContext = createContext<WalkthroughValue | null>(null);

export function useWalkthrough() {
  const value = useContext(WalkthroughContext);
  if (!value) throw new Error("useWalkthrough must be used inside WalkthroughProvider");
  return value;
}

/**
 * The state a scene should render, or null when the walkthrough is not driving.
 *
 * Returning null rather than a number is what hands control back: a scene that sees null keeps
 * using its own reveal, so there is no moment where both drivers are writing.
 */
export function useWalkthroughScene(scene: WalkthroughScene | undefined): number | null {
  const value = useContext(WalkthroughContext);
  if (!value || !scene || !value.sceneStates) return null;
  return value.sceneStates[scene];
}
