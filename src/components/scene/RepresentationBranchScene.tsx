"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import SceneCanvas, { readColour } from "@/components/scene/SceneCanvas";

/**
 * One capture, three representations, checked back against the capture.
 *
 * This is the public engineering section's figure, and it is synthetic by construction. It shows
 * a class of problem that any organisation holding a large document corpus has: the same material
 * ends up stored more than once, each copy is derived rather than authored, and agreement between
 * them has to be demonstrated. There is no system here - no service, store, topic, dataset or
 * identifier - and the shapes would be equally true of a platform that does not exist.
 *
 * The spatial claim is the branching itself: one thing above, three derived forms below it, and a
 * return path from each form back to the thing it must be checked against. A flat diagram can
 * draw those arrows; only depth makes it obvious that the three forms are siblings at the same
 * remove from the source rather than a pipeline of three stages.
 */

const ROWS = 5;
const COLS = 5;
const PER_FORM = ROWS * COLS;
const FORMS = 3;
const TOTAL = PER_FORM * FORMS;

/** Where each derived form sits, and how its units are arranged once they get there. */
const FORM_LAYOUT = [
  { x: -2.5, spin: -0.5, kind: "records" },
  { x: 0, spin: 0, kind: "vectors" },
  { x: 2.5, spin: 0.5, kind: "graph" },
] as const;

const STAGE = {
  ingestFrom: 0.04,
  ingestTo: 0.24,
  branchFrom: 0.22,
  branchTo: 0.56,
  verifyFrom: 0.54,
  verifyTo: 0.78,
  observeFrom: 0.76,
  observeTo: 0.96,
} as const;

const ramp = (v: number, a: number, b: number) => Math.max(0, Math.min(1, (v - a) / (b - a)));
const ease = (t: number) => t * t * (3 - 2 * t);

/** Fixed target for every unit: which form it belongs to and where it sits inside it. */
const UNITS = Array.from({ length: TOTAL }, (_, i) => {
  const form = Math.floor(i / PER_FORM);
  const within = i % PER_FORM;
  const row = Math.floor(within / COLS);
  const col = within % COLS;
  const layout = FORM_LAYOUT[form];

  if (layout.kind === "records") {
    // A stack of ordered rows: structure is the point, so it is a grid.
    return { form, x: layout.x + (col - 2) * 0.22, y: -1.15 + row * 0.2, z: 0 };
  }
  if (layout.kind === "vectors") {
    // Positions in a volume: the arrangement carries meaning, so it is scattered but fixed.
    const a = Math.sin(within * 12.9898) * 43758.5453;
    const b = Math.sin(within * 78.233) * 12345.6789;
    const frac = (n: number) => n - Math.floor(n);
    return {
      form,
      x: layout.x + (frac(a) - 0.5) * 1.25,
      y: -1.15 + (within / PER_FORM) * 1.0,
      z: (frac(b) - 0.5) * 1.25,
    };
  }
  // A ring with a hub: relationships, not order.
  const angle = (within / PER_FORM) * Math.PI * 2;
  const radius = within % 4 === 0 ? 0.2 : 0.62;
  return {
    form,
    x: layout.x + Math.cos(angle) * radius,
    y: -0.72 + Math.sin(angle) * radius * 0.5,
    z: Math.sin(angle) * radius,
  };
});

function Branch({ progress, active }: { progress: number; active: boolean }) {
  const units = useRef<THREE.InstancedMesh>(null);
  const source = useRef<THREE.Mesh>(null);
  const returns = useRef<THREE.LineSegments>(null);
  const group = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const palette = useMemo(
    () => ({
      accent: readColour("--accent-systems", "#8fd05a"),
      ink: readColour("--stage-ink", "#f2f0e8"),
      dim: readColour("--stage-ink-soft", "#9aa7b2"),
    }),
    [],
  );

  /* One return path per form: the check that travels back to what it is compared against. */
  const returnGeometry = useMemo(() => {
    const positions = new Float32Array(FORMS * 6);
    FORM_LAYOUT.forEach((form, i) => {
      positions.set([form.x, -0.5, 0, 0, 1.35, 0], i * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useLayoutEffect(() => () => returnGeometry.dispose(), [returnGeometry]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = units.current;
    if (mesh && !mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(TOTAL * 3), 3);
    }
  }, []);

  useFrame(() => {
    const mesh = units.current;
    if (!mesh) return;

    const ingest = ease(ramp(progress, STAGE.ingestFrom, STAGE.ingestTo));
    const branch = ramp(progress, STAGE.branchFrom, STAGE.branchTo);
    const verify = ease(ramp(progress, STAGE.verifyFrom, STAGE.verifyTo));
    const observe = ease(ramp(progress, STAGE.observeFrom, STAGE.observeTo));

    for (let i = 0; i < TOTAL; i += 1) {
      const unit = UNITS[i];

      /*
       * Units leave the source and travel to their form. Staggering by form and then by index is
       * what makes three derived views read as three, rather than as one cloud dispersing.
       */
      const t = ease(Math.max(0, Math.min(1, branch * (TOTAL * 0.9) - i * 0.5)));
      dummy.position.set(
        THREE.MathUtils.lerp(0, unit.x, t),
        THREE.MathUtils.lerp(1.35, unit.y, t),
        THREE.MathUtils.lerp(0, unit.z, t),
      );
      dummy.rotation.set(0, t * FORM_LAYOUT[unit.form].spin, 0);
      dummy.scale.setScalar(Math.max(0.0001, t * 0.085 * (1 + observe * 0.25)));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Everything the check has confirmed takes the accent; before that it stays neutral.
      colour.copy(palette.dim).lerp(palette.accent, verify);
      mesh.setColorAt(i, colour);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    if (source.current) {
      source.current.scale.setScalar(Math.max(0.0001, ingest * 0.34));
      source.current.rotation.y = progress * 1.1;
    }

    const returnMaterial = returns.current?.material as THREE.LineBasicMaterial | undefined;
    if (returnMaterial) returnMaterial.opacity = verify * 0.7;

    if (group.current) {
      group.current.rotation.y = -0.3 + progress * 0.6;
      group.current.rotation.x = 0.08 + observe * 0.12;
    }

    if (active) invalidate();
  });

  return (
    <group ref={group}>
      {/* The capture: one object, held still, that everything below is derived from. */}
      <mesh position={[0, 1.35, 0]} ref={source}>
        <boxGeometry args={[1, 1.35, 0.16]} />
        <meshBasicMaterial color={palette.ink} toneMapped={false} />
      </mesh>

      <instancedMesh args={[undefined, undefined, TOTAL]} ref={units}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      <lineSegments geometry={returnGeometry} ref={returns}>
        <lineBasicMaterial color={palette.accent} opacity={0} transparent />
      </lineSegments>
    </group>
  );
}

export default function RepresentationBranchScene({
  progress,
  active,
  onDegrade,
}: {
  progress: number;
  active: boolean;
  onDegrade: () => void;
}) {
  return (
    <SceneCanvas camera={{ position: [0, 0.4, 6.8], fov: 42 }} onDegrade={onDegrade}>
      <Branch active={active} progress={progress} />
    </SceneCanvas>
  );
}
