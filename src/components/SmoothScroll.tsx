"use client";

import { useEffect } from "react";

import { worldRenderingIsWorthIt } from "@/components/world/webgl-support";
import { Lenis } from "@/vendor/lenis/lenis";
import "@/vendor/lenis/lenis.css";

/**
 * Inertia on wheel scrolling.
 *
 * Touch keeps the device's own scrolling, which is already inertial and which a script can only
 * make worse. A reader who has asked for reduced motion keeps native scrolling too.
 *
 * Sticky pins and CSS scroll timelines need no wiring: Lenis moves the real scroll position, so
 * they follow it exactly as they follow a native scroll.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // Read by phone-motion.css, which only pins a 3D stage on a device that can draw one.
    document.documentElement.dataset.webgl = worldRenderingIsWorthIt() ? "yes" : "no";

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wheel = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (calm || !wheel) return;

    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, wheelMultiplier: 1 });
    return () => lenis.destroy();
  }, []);

  return null;
}
