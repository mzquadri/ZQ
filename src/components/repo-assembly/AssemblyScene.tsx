"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  CATEGORY_TOKEN,
  PART_KIND_LABEL,
  SCENE,
  type AssemblyPart,
  type RepoAssembly,
} from "@/content/assembly";

/**
 * The exploded-assembly layer.
 *
 * This is decoration over a server-rendered strip that carries the same facts, so the
 * canvas is aria-hidden and carries no unique information. Every label it draws is a
 * registry string already printed below it.
 *
 * It is scroll-driven and otherwise idle: `frameloop="demand"` means nothing renders
 * unless scroll or hover invalidates the frame, so an assembly sitting still costs
 * nothing. There is no ambient animation anywhere in here.
 *
 * Why this one is still WebGL
 * ---------------------------
 * Five other scenes were moved off three.js and onto the Canvas 2D projector, because they were
 * flat-shaded geometry that a perspective transform and a depth sort reproduce exactly. This one
 * was measured against the same question and kept, for two reasons that the projector cannot meet:
 * it is lit - `meshStandardMaterial` against an ambient and two directional lights, so a part's
 * shape is read from its shading - and it is picked, with `onPointerOver`/`onClick` raycasting into
 * real geometry, occlusion included, driving the hover readout and click-through. A painter's-
 * algorithm sort has no notion of either.
 *
 * The bytes are already deferred, which is what makes keeping it defensible. Measured on /work:
 *
 *   reader                       on arrival   after scrolling to this band
 *   wide desktop, motion on         567k                 +888k
 *   reduced motion                  567k                  +27k
 *   phone at 390px                  506k                  +20k
 *
 * Nobody pays for three.js to open the page, and the two audiences most likely to care - a reader
 * who asked for less motion, and a phone - never pay for it at all. The one reader who does has a
 * wide viewport, motion enabled, and has scrolled to the thing the renderer draws. Trading the
 * interaction away to save bytes that are already gated behind all three of those would make the
 * page worse for the only person it charges.
 */

const MIN_FPS = 30;
/** A frame counts as "active" if the user scrolled this recently. */
const ACTIVE_WINDOW_MS = 400;
/** Consecutive slow active frames before the layer gives up - roughly a second. */
const SLOW_FRAME_LIMIT = 20;

interface SceneProps {
  assemblies: readonly RepoAssembly[];
  progress: React.RefObject<number>;
  onSelect: (href: string) => void;
  onHover: (info: HoverInfo | null) => void;
  onDegrade: () => void;
}

export interface HoverInfo {
  label: string;
  kind: string;
  repo: string;
}

function readToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function Part({
  part,
  assembly,
  colour,
  progress,
  onSelect,
  onHover,
}: {
  part: AssemblyPart;
  assembly: RepoAssembly;
  colour: string;
  progress: React.RefObject<number>;
  onSelect: (href: string) => void;
  onHover: (info: HoverInfo | null) => void;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const rest = useMemo(() => new THREE.Vector3(...part.rest), [part.rest]);
  const axis = useMemo(() => new THREE.Vector3(...part.axis).normalize(), [part.axis]);

  useFrame(() => {
    if (!mesh.current) return;
    // A single normalised value drives everything: parts separate through the first
    // half of the section and converge back into one form by the end.
    const t = progress.current ?? 0;
    const spread = Math.sin(Math.min(Math.max(t, 0), 1) * Math.PI);
    const offset = axis.clone().multiplyScalar(spread * SCENE.explode);
    mesh.current.position.copy(rest).add(offset);
    const scale = hovered ? 1.16 : 1;
    mesh.current.scale.setScalar(scale);
  });

  const geometry = useMemo(() => {
    if (part.kind === "category") return new THREE.CylinderGeometry(SCENE.halfExtent.category, SCENE.halfExtent.category, 0.09, 6);
    if (part.kind === "boundary") return new THREE.IcosahedronGeometry(SCENE.halfExtent.boundary, 0);
    return new THREE.BoxGeometry(0.4, 0.24, 0.4);
  }, [part.kind]);

  const isShell = part.kind === "boundary";

  return (
    <mesh
      geometry={geometry}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        onHover({
          label: part.label,
          kind: PART_KIND_LABEL[part.kind],
          repo: assembly.title,
        });
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(assembly.caseStudyHref ?? assembly.href);
      }}
      ref={mesh}
    >
      {isShell ? (
        <meshBasicMaterial color={colour} opacity={hovered ? 0.5 : 0.22} transparent wireframe />
      ) : (
        <meshStandardMaterial
          color={colour}
          metalness={0.05}
          opacity={part.kind === "category" ? 0.9 : 1}
          roughness={0.62}
          transparent={part.kind === "category"}
        />
      )}
    </mesh>
  );
}

function Assembly({
  assembly,
  index,
  total,
  progress,
  onSelect,
  onHover,
}: {
  assembly: RepoAssembly;
  index: number;
  total: number;
  progress: React.RefObject<number>;
  onSelect: (href: string) => void;
  onHover: (info: HoverInfo | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const colour = readToken(CATEGORY_TOKEN[assembly.category], "#006d65");
  // Lay the assemblies out along x, centred on the viewport.
  const x = (index - (total - 1) / 2) * SCENE.spacing;

  useFrame(() => {
    if (!group.current) return;
    const t = progress.current ?? 0;
    // A quarter turn across the section, driven by scroll only.
    group.current.rotation.y = t * Math.PI * 0.5 + index * 0.35;
  });

  return (
    <group position={[x, 0, 0]} ref={group}>
      {assembly.parts.map((part) => (
        <Part
          assembly={assembly}
          colour={colour}
          key={part.id}
          onHover={onHover}
          onSelect={onSelect}
          part={part}
          progress={progress}
        />
      ))}
    </group>
  );
}

/**
 * Under `frameloop="demand"` nothing renders unless something asks for it, so scrolling
 * is what asks. Subscribing here rather than in the parent keeps three.js inside the
 * lazily loaded chunk. When the page is still, the canvas draws nothing at all.
 */
function ScrollInvalidator({ lastScrollAt }: { lastScrollAt: React.RefObject<number> }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    let frame = 0;
    const request = () => {
      lastScrollAt.current = performance.now();
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        invalidate();
      });
    };
    invalidate();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [invalidate, lastScrollAt]);

  return null;
}

/**
 * Frame budget.
 *
 * Under demand rendering, long gaps between frames are usually idleness rather than
 * slowness, so the two have to be told apart by something other than the gap itself.
 * A frame is judged only if the user scrolled within the last `ACTIVE_WINDOW_MS`; that
 * is the only time the layer is doing work the visitor is waiting on. An earlier version
 * skipped any gap over 120ms as "idle", which meant a device slow enough to take longer
 * than that per frame - exactly the device this guard exists for - could never trip it.
 */
function BudgetGuard({
  lastScrollAt,
  onDegrade,
}: {
  lastScrollAt: React.RefObject<number>;
  onDegrade: () => void;
}) {
  const previous = useRef(0);
  const strikes = useRef(0);

  useFrame(() => {
    const now = performance.now();
    const delta = now - previous.current;
    previous.current = now;

    const active = now - (lastScrollAt.current ?? 0) < ACTIVE_WINDOW_MS;
    if (!active || delta <= 0) {
      strikes.current = 0;
      return;
    }

    if (delta > 1000 / MIN_FPS) {
      strikes.current += 1;
      if (strikes.current >= SLOW_FRAME_LIMIT) onDegrade();
      return;
    }
    strikes.current = 0;
  });

  return null;
}

export default function AssemblyScene({
  assemblies,
  progress,
  onSelect,
  onHover,
  onDegrade,
}: SceneProps) {
  // This component only ever mounts client-side (dynamic, ssr: false), so the device
  // ratio can be read during the first render instead of being patched in afterwards.
  const [dpr] = useState(() => Math.min(window.devicePixelRatio || 1, 2));
  const lastScrollAt = useRef(0);

  return (
    <Canvas
      camera={{ fov: SCENE.camera.fov, position: [0, SCENE.camera.y, SCENE.camera.z] }}
      dpr={dpr}
      frameloop="demand"
      // Antialiasing is the first thing to give up on a weak GPU.
      gl={{ antialias: dpr > 1, powerPreference: "high-performance" }}
      onPointerMissed={() => onHover(null)}
      resize={{ scroll: false }}
    >
      <ambientLight intensity={1.15} />
      <directionalLight intensity={1.5} position={[3, 5, 4]} />
      <directionalLight intensity={0.4} position={[-4, -2, -3]} />
      <ScrollInvalidator lastScrollAt={lastScrollAt} />
      <BudgetGuard lastScrollAt={lastScrollAt} onDegrade={onDegrade} />
      {assemblies.map((assembly, index) => (
        <Assembly
          assembly={assembly}
          index={index}
          key={assembly.name}
          onHover={onHover}
          onSelect={onSelect}
          progress={progress}
          total={assemblies.length}
        />
      ))}
    </Canvas>
  );
}
