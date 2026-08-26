"use client";

import { useWalkthrough } from "./walkthrough-context";

/**
 * The one way in.
 *
 * It sits in the hero where every other case study puts its repository link, so it reads as this
 * page's equivalent affordance rather than as a promotion. It is a real button with a real label,
 * and it is where focus returns when the walkthrough ends.
 */
export default function WalkthroughLauncher() {
  const { start, active, registerLauncher } = useWalkthrough();

  return (
    <p className="legal-launcher">
      <button
        className="button button-primary"
        onClick={start}
        ref={registerLauncher}
        type="button"
      >
        {active ? "Walkthrough running" : "2-minute walkthrough"}
      </button>
      <span>Follow the system from source to verified state, in about two minutes.</span>
    </p>
  );
}
