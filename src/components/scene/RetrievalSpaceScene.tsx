"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import SceneCanvas, { readColour } from "@/components/scene/SceneCanvas";

/**
 * Retrieval, in the space it actually happens in.
 *
 * The flat figure keeps retrieval and generation on opposite sides of a frame. This one uses the
 * axis a diagram cannot: passages occupy a volume where distance stands for similarity, and the
 * question is a point in that same volume. What the reader watches is a neighbourhood being
 * selected - not an answer being produced - which is the distinction the whole benchmark exists
 * to measure.
 *
 * Deterministic throughout. Passage positions come from a fixed lattice with fixed offsets, so
 * the same passages land in the same places on every build and a screenshot means something.
 */

const CHUNKS = 48;

const STAGE = {
  arriveFrom: 0.05,
  arriveTo: 0.34,
  queryFrom: 0.32,
  queryTo: 0.5,
  searchFrom: 0.46,
  searchTo: 0.68,
  tetherFrom: 0.66,
  tetherTo: 0.92,
} as const;

const ramp = (v: number, a: number, b: number) => Math.max(0, Math.min(1, (v - a) / (b - a)));
const ease = (t: number) => t * t * (3 - 2 * t);

/** Fixed pseudo-random placement - no RNG, so the cloud is identical every render. */
function place(i: number) {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  const c = Math.sin(i * 39.425) * 24634.6345;
  const frac = (n: number) => n - Math.floor(n);
  return {
    x: (frac(a) - 0.5) * 5.2,
    y: (frac(b) - 0.5) * 2.9,
    z: (frac(c) - 0.5) * 4.4,
  };
}

/** The query sits where the cloud is densest; the selected set is the nearest few to it. */
const QUERY = { x: 0.35, y: -0.1, z: 0.2 } as const;

const POINTS = Array.from({ length: CHUNKS }, (_, i) => {
  const p = place(i);
  const d = Math.hypot(p.x - QUERY.x, p.y - QUERY.y, p.z - QUERY.z);
  return { ...p, distance: d };
});

const NEAREST = [...POINTS]
  .map((p, i) => ({ i, d: p.distance }))
  .sort((a, b) => a.d - b.d)
  .slice(0, 4)
  .map((entry) => entry.i);

function Space({ progress, active }: { progress: number; active: boolean }) {
  const chunks = useRef<THREE.InstancedMesh>(null);
  const query = useRef<THREE.Mesh>(null);
  const tethers = useRef<THREE.LineSegments>(null);
  const group = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const palette = useMemo(
    () => ({
      accent: readColour("--accent-retrieval", "#f0a03c"),
      ink: readColour("--stage-ink", "#f2f0e8"),
      dim: readColour("--stage-ink-soft", "#9aa7b2"),
    }),
    [],
  );

  /* One line from the query to each selected passage - the tether the answer is built on. */
  const tetherGeometry = useMemo(() => {
    const positions = new Float32Array(NEAREST.length * 6);
    NEAREST.forEach((index, n) => {
      const p = POINTS[index];
      positions.set([QUERY.x, QUERY.y, QUERY.z, p.x, p.y, p.z], n * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useLayoutEffect(() => () => tetherGeometry.dispose(), [tetherGeometry]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const mesh = chunks.current;
    if (mesh && !mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(CHUNKS * 3), 3);
    }
  }, []);

  useFrame(() => {
    const mesh = chunks.current;
    if (!mesh) return;

    const arrive = ramp(progress, STAGE.arriveFrom, STAGE.arriveTo);
    const queryIn = ease(ramp(progress, STAGE.queryFrom, STAGE.queryTo));
    const search = ease(ramp(progress, STAGE.searchFrom, STAGE.searchTo));
    const tether = ease(ramp(progress, STAGE.tetherFrom, STAGE.tetherTo));

    for (let i = 0; i < CHUNKS; i += 1) {
      const p = POINTS[i];

      /*
       * Passages arrive from one place - the document - and take up positions. Staggering by
       * index is what makes it read as a corpus being ingested rather than a cloud fading in.
       */
      const t = ease(Math.max(0, Math.min(1, arrive * CHUNKS - i * 0.55)));
      const x = THREE.MathUtils.lerp(-3.6, p.x, t);
      const y = THREE.MathUtils.lerp(0, p.y, t);
      const z = THREE.MathUtils.lerp(0, p.z, t);

      const selected = NEAREST.includes(i) ? search : 0;
      const scale = (0.055 + selected * 0.055) * (t > 0 ? 1 : 0.0001);

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(Math.max(0.0001, scale));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Selected passages take the accent; the rest stay quiet. No blending between hues.
      colour.copy(palette.dim).lerp(palette.accent, selected);
      mesh.setColorAt(i, colour);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    if (query.current) {
      query.current.scale.setScalar(Math.max(0.0001, queryIn * 0.13));
      (query.current.material as THREE.MeshBasicMaterial).opacity = queryIn;
    }

    const tetherMaterial = tethers.current?.material as THREE.LineBasicMaterial | undefined;
    if (tetherMaterial) tetherMaterial.opacity = tether * 0.85;

    if (group.current) {
      group.current.rotation.y = -0.5 + progress * 0.85;
      group.current.rotation.x = 0.12 + Math.sin(progress * Math.PI) * 0.1;
    }

    if (active) invalidate();
  });

  return (
    <group ref={group}>
      <instancedMesh args={[undefined, undefined, CHUNKS]} ref={chunks}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* The question, as a point in the same space the passages live in. */}
      <mesh position={[QUERY.x, QUERY.y, QUERY.z]} ref={query}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color={palette.ink} toneMapped={false} transparent />
      </mesh>

      <lineSegments geometry={tetherGeometry} ref={tethers}>
        <lineBasicMaterial color={palette.accent} opacity={0} transparent />
      </lineSegments>
    </group>
  );
}

export default function RetrievalSpaceScene({
  progress,
  active,
  onDegrade,
}: {
  progress: number;
  active: boolean;
  onDegrade: () => void;
}) {
  return (
    <SceneCanvas camera={{ position: [0, 0.6, 6.4], fov: 42 }} onDegrade={onDegrade}>
      <Space active={active} progress={progress} />
    </SceneCanvas>
  );
}
