"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import SceneCanvas, { readColour } from "@/components/scene/SceneCanvas";
import { graphEdges3D, graphNodes3D, graphMaxHop } from "@/content/cinema-geometry";

/**
 * The transport network, as an uncertainty field.
 *
 * The flat figure lays the graph out and lights it up hop by hop. This one adds the axis the
 * diagram cannot carry: height is how uncertain the surrogate is at that junction. What the
 * reader ends up looking at is a landscape whose ridges are the parts of the network a fast
 * approximation should not be trusted on without review - which is the thesis in one image.
 *
 * The whole sequence is driven by `progress`, the host's travel through the viewport, so scroll
 * scrubs it exactly like every CSS-driven figure on the site. Nothing here animates on its own
 * clock, which also means a screenshot at a given scroll position is reproducible.
 *
 * Draw calls: one for every edge (a single LineSegments), one for every pillar and one for every
 * cap (two InstancedMesh). Twenty-five junctions could have been twenty-five meshes; they are not,
 * because the habit is what matters once a scene grows.
 */

const NODE_COUNT = graphNodes3D.length;

/** Where each stage of the argument sits in the scroll span. */
const STAGE = {
  drawFrom: 0.04,
  drawTo: 0.26,
  waveFrom: 0.22,
  waveTo: 0.52,
  riseFrom: 0.48,
  riseTo: 0.72,
  calibrateFrom: 0.7,
  calibrateTo: 0.94,
} as const;

const ramp = (value: number, from: number, to: number) =>
  Math.max(0, Math.min(1, (value - from) / (to - from)));

/** Smoothstep, so stages ease rather than switch. */
const ease = (t: number) => t * t * (3 - 2 * t);

function Network({ progress, active }: { progress: number; active: boolean }) {
  const pillars = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const edges = useRef<THREE.LineSegments>(null);
  const group = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const palette = useMemo(
    () => ({
      accent: readColour("--accent-graph", "#4cc4b0"),
      ink: readColour("--stage-ink", "#f2f0e8"),
      warn: readColour("--orange", "#f15a35"),
      dim: readColour("--stage-ink-soft", "#9aa7b2"),
    }),
    [],
  );

  /* Edge geometry is fixed; only its material opacity changes, so it is built once. */
  const edgeGeometry = useMemo(() => {
    const positions = new Float32Array(graphEdges3D.length * 6);
    graphEdges3D.forEach(([a, b], i) => {
      const from = graphNodes3D[a];
      const to = graphNodes3D[b];
      positions.set([from.x, 0, from.z, to.x, 0, to.z], i * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useLayoutEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);

  /*
   * Allocate the per-instance colour buffers up front.
   *
   * `setColorAt` lazily creates `instanceColor` on first use, which means writes issued before
   * the mesh has rendered once can be dropped - and the symptom is a field of default-white
   * instances with only the last few frames' colours applied. Owning the buffer removes the
   * ordering question entirely.
   */
  useLayoutEffect(() => {
    for (const mesh of [pillars.current, caps.current]) {
      if (!mesh || mesh.instanceColor) continue;
      mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NODE_COUNT * 3), 3);
    }
  }, []);

  useFrame(() => {
    const pillarMesh = pillars.current;
    const capMesh = caps.current;
    if (!pillarMesh || !capMesh) return;

    const draw = ease(ramp(progress, STAGE.drawFrom, STAGE.drawTo));
    const wave = ramp(progress, STAGE.waveFrom, STAGE.waveTo) * (graphMaxHop + 1);
    const rise = ease(ramp(progress, STAGE.riseFrom, STAGE.riseTo));
    const calibrate = ease(ramp(progress, STAGE.calibrateFrom, STAGE.calibrateTo));

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const node = graphNodes3D[i];

      // A junction appears when the wavefront reaches it, and not before.
      const reached = Math.max(0, Math.min(1, wave - node.hop));
      const present = draw * reached;

      // Uniform height first - an interval that knows nothing about where it is wrong - then the
      // calibrated field, which is tall only where information had furthest to travel.
      const height =
        (node.rawHeight * rise * (1 - calibrate) + node.calHeight * calibrate * rise) || 0.0001;

      dummy.position.set(node.x, height / 2, node.z);
      dummy.scale.set(present * 0.09, Math.max(0.0001, height), present * 0.09);
      dummy.updateMatrix();
      pillarMesh.setMatrixAt(i, dummy.matrix);

      dummy.position.set(node.x, height, node.z);
      const capScale = present * (node.hop === 0 ? 0.2 : 0.12);
      dummy.scale.setScalar(Math.max(0.0001, capScale));
      dummy.updateMatrix();
      capMesh.setMatrixAt(i, dummy.matrix);

      /*
       * Colour carries the selective-prediction step: once calibrated, the junctions the model
       * had least to go on are marked rather than quietly left in the field.
       */
      /*
       * A step, not a blend.
       *
       * Interpolating the accent toward the warning colour looked reasonable in code and awful on
       * screen: teal and orange are near-complementary, so every intermediate value is mud, and
       * for most of the scroll the field sat in that mud. The junction is either in the declined
       * set or it is not, so the transition is compressed into the last part of calibration and
       * the muddy middle is passed through quickly rather than parked in.
       */
      const isFar = node.hop >= graphMaxHop - 1;
      const declined = isFar ? ease(ramp(calibrate, 0.55, 0.8)) : 0;
      colour.copy(node.hop === 0 ? palette.ink : palette.accent).lerp(palette.warn, declined);
      capMesh.setColorAt(i, colour);
      colour.copy(palette.accent).lerp(palette.warn, declined).multiplyScalar(0.55);
      pillarMesh.setColorAt(i, colour);
    }

    pillarMesh.instanceMatrix.needsUpdate = true;
    capMesh.instanceMatrix.needsUpdate = true;
    if (pillarMesh.instanceColor) pillarMesh.instanceColor.needsUpdate = true;
    if (capMesh.instanceColor) capMesh.instanceColor.needsUpdate = true;

    const edgeMaterial = edges.current?.material as THREE.LineBasicMaterial | undefined;
    if (edgeMaterial) edgeMaterial.opacity = 0.16 + draw * 0.34;

    /*
     * A slow quarter turn across the whole scroll, plus a tilt that settles as the field rises.
     * The camera is doing one job: making it unambiguous that the ridges are height and not size.
     */
    if (group.current) {
      group.current.rotation.y = -0.35 + progress * 0.7;
      /*
       * Starts near plan view - which is how a road network is read - and drops to a low
       * three-quarter angle as the field rises, because height cannot be judged from above.
       */
      group.current.rotation.x = 0.82 - rise * 0.62;
    }

    if (active) invalidate();
  });

  return (
    <group ref={group}>
      <lineSegments geometry={edgeGeometry} ref={edges}>
        <lineBasicMaterial color={palette.dim} opacity={0.16} transparent />
      </lineSegments>

      <instancedMesh args={[undefined, undefined, NODE_COUNT]} ref={pillars}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.85} />
      </instancedMesh>

      <instancedMesh args={[undefined, undefined, NODE_COUNT]} ref={caps}>
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export default function GraphCityScene({
  progress,
  active,
  onDegrade,
}: {
  progress: number;
  active: boolean;
  onDegrade: () => void;
}) {
  return (
    <SceneCanvas camera={{ position: [0, 2.2, 7.2], fov: 38 }} onDegrade={onDegrade}>
      <Network active={active} progress={progress} />
    </SceneCanvas>
  );
}
