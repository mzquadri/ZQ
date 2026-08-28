"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { features, layers } from "@/content/thesis-world";
import { featureValue, intervened, network, predicted, sigma, sigmaQuantile } from "./geometry";
import { STATES, at, ease, mix, span, type StateKey } from "./states";

/**
 * The thesis, as an object that comes apart.
 *
 * Everything here is a pure function of one number: how far the reader has scrolled. No timers, no
 * autonomous motion, no spinning. Scrubbing backwards is not handled anywhere because it does not
 * need to be - the same expression evaluated at a smaller number produces the earlier frame, which
 * is also what makes the reduced-motion still frame a real frame of the sequence rather than a
 * separate drawing.
 *
 * The geometry is schematic and the page says so. The quantities are not: bar heights follow the
 * published target distribution, the shells are MC Dropout spread, and the reliability curve is
 * the measured coverage array - which is why it sits so far under the diagonal before calibration.
 */

const ACCENT = new THREE.Color("#4cc4b0");
const WARN = new THREE.Color("#f15a35");
const INK = new THREE.Color("#f2f0e8");
const DIM = new THREE.Color("#6d7b86");
const PIPE = new THREE.Color("#7aa7f0");
const HEAD = new THREE.Color("#9fb0bd");

/* Reused every frame so the render loop allocates nothing. */
const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/* ============================================================================================
 * 1. The network, and what the policy does to it
 * ========================================================================================== */

function NetworkPlate({ frame }: { frame: FrameRef }) {
  const nodesRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const lineGeometry = useMemo(() => {
    const positions = new Float32Array(network.edges.length * 6);
    network.edges.forEach(([u, v], i) => {
      const a = network.nodes[u];
      const b = network.nodes[v];
      positions.set([a.x, 0, a.z, b.x, 0, b.z], i * 6);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const scenario = at(p, "scenario");
    const lifted = at(p, "features");
    const back = at(p, "prediction");
    const limits = at(p, "limits");

    /* The plate sinks away while the model is being inspected, then returns to carry the result. */
    const away = Math.max(0, lifted - back);
    if (groupRef.current) {
      groupRef.current.position.y = mix(0, -3.2, away);
      groupRef.current.visible = away < 0.97;
    }

    const mesh = nodesRef.current;
    if (!mesh) return;
    for (let i = 0; i < network.nodes.length; i += 1) {
      const node = network.nodes[i];
      const hit = intervened.has(i);
      const lift = hit ? scenario * 0.13 : 0;
      const size = 0.05 + (hit ? scenario * 0.03 : 0) + (node.hop === 0 ? 0.032 : 0);
      P.set(node.x, lift, node.z);
      S.setScalar(size);
      M.compose(P, Q, S);
      mesh.setMatrixAt(i, M);
      C.copy(node.hop === 0 ? INK : ACCENT);
      if (hit) C.lerp(WARN, scenario);
      C.lerp(DIM, limits * 0.35);
      mesh.setColorAt(i, C);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#55707f" opacity={0.75} transparent />
      </lineSegments>
      <instancedMesh args={[undefined, undefined, network.nodes.length]} ref={nodesRef}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial metalness={0.15} roughness={0.55} />
      </instancedMesh>
    </group>
  );
}

/* ============================================================================================
 * 2. Five feature planes, in the order the model receives them
 * ========================================================================================== */

function FeaturePlanes({ frame }: { frame: FrameRef }) {
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const plateRefs = useRef<(THREE.Mesh | null)[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const open = at(p, "features");
    const fold = at(p, "model");
    const shown = open * (1 - fold);
    if (groupRef.current) groupRef.current.visible = shown > 0.01;
    if (shown <= 0.01) return;

    for (let f = 0; f < features.length; f += 1) {
      const mesh = refs.current[f];
      if (!mesh) continue;
      /* One plane per feature, separating upward in the model's own input order. */
      const stagger = Math.max(0, Math.min(1, open * features.length - f * 0.55));
      const y = mix(0, 0.7 + f * 0.85, stagger) * (1 - fold);
      mesh.position.y = y;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = shown * (0.45 + stagger * 0.5);

      /*
       * Each layer gets a backing plate.
       *
       * Without one, five separated fields of the same 113 points are simply five copies of the
       * same cloud and no camera angle makes them read as five. The plate is what turns a layer
       * into a part: it gives the layer an edge, catches the key light, and occludes what is
       * behind it, which is exactly how an exploded view of anything physical stays legible.
       */
      const plate = plateRefs.current[f];
      if (plate) {
        plate.position.y = y - 0.035;
        plate.visible = stagger > 0.01;
        const plateMaterial = plate.material as THREE.MeshStandardMaterial;
        plateMaterial.opacity = shown * stagger * 0.16;
        plateMaterial.emissiveIntensity = 0.1 + stagger * 0.25;
      }

      for (let i = 0; i < network.nodes.length; i += 1) {
        const node = network.nodes[i];
        const value = featureValue(node, f, intervened.has(i));
        const height = 0.015 + value * 0.32 * stagger;
        P.set(node.x, height / 2, node.z);
        S.set(0.07, Math.max(0.012, height), 0.07);
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);
        /* CAPACITY_REDUCTION is the policy input and is zero almost everywhere; it reads warm so
         * the reader can see the intervention is a narrow corridor, not a global change. */
        C.copy(f === 2 ? WARN : ACCENT).lerp(DIM, 1 - value * 0.95);
        mesh.setColorAt(i, C);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {features.map((feature, f) => (
        <group key={feature.name}>
          <mesh
            ref={(node) => {
              plateRefs.current[f] = node;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[4.35, 48]} />
            <meshStandardMaterial
              color={f === 2 ? WARN : ACCENT}
              depthWrite={false}
              emissive={f === 2 ? WARN : ACCENT}
              metalness={0}
              roughness={1}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>
          <instancedMesh
            args={[undefined, undefined, network.nodes.length]}
            ref={(node) => {
              refs.current[f] = node;
            }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial metalness={0.1} roughness={0.6} transparent />
          </instancedMesh>
        </group>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 3. PointNetTransfGAT, separated into its layers
 * ========================================================================================== */

function ModelStack({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const slabRefs = useRef<(THREE.Mesh | null)[]>([]);
  const frameRefs = useRef<(THREE.LineSegments | null)[]>([]);
  const headRefs = useRef<(THREE.Mesh | null)[]>([]);

  /* One shared outline, instanced by reference rather than rebuilt per layer. */
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(6.6, 0.05, 6.6)), []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const open = at(p, "model");
    const close = at(p, "prediction");
    const shown = open * (1 - close);
    if (groupRef.current) groupRef.current.visible = shown > 0.01;
    if (shown <= 0.01) return;

    layers.forEach((layer, i) => {
      const slab = slabRefs.current[i];
      if (!slab) return;
      const stagger = Math.max(0, Math.min(1, open * layers.length - i * 0.6));
      /* The stack separates along depth, so the camera flies through it rather than past it. */
      slab.position.z = mix(0, (i - (layers.length - 1) / 2) * 2.5, stagger) * (1 - close);
      slab.position.y = mix(0, 0.3 + i * 0.1, stagger);
      slab.scale.setScalar(mix(0.55, 1, stagger));
      /*
       * Nearly transparent, and barely emissive.
       *
       * These were filled bright planes to begin with and the result was four white walls the
       * camera sat inside: the layers stopped being layers and became the background. A layer
       * reads best as an edge plus a hint of surface - the way a board in an exploded assembly
       * does - so the fill is almost nothing and the outline carries it.
       */
      const material = slab.material as THREE.MeshStandardMaterial;
      material.opacity = shown * (0.03 + stagger * 0.07);
      material.emissiveIntensity = 0.04 + stagger * 0.1;
      const frame_ = frameRefs.current[i];
      if (frame_) {
        frame_.position.copy(slab.position);
        frame_.scale.copy(slab.scale);
        frame_.visible = stagger > 0.01;
        (frame_.material as THREE.LineBasicMaterial).opacity = shown * stagger * 0.55;
      }
    });

    /*
     * The four attention heads are the one internal detail worth exposing. They are the reason
     * this is a TransformerConv rather than a plain graph convolution, and each takes a quarter of
     * the channel width - so there are exactly four, not a decorative cloud.
     */
    for (let h = 0; h < 4; h += 1) {
      const head = headRefs.current[h];
      if (!head) continue;
      const t = Math.max(0, Math.min(1, open * 3 - 1.15 - h * 0.16));
      head.visible = t > 0.02 && shown > 0.02;
      head.position.set(mix(0, (h - 1.5) * 1.15, t), 0.5, (1 - (layers.length - 1) / 2) * 2.5);
      head.scale.setScalar(0.001 + t * 0.24);
      (head.material as THREE.MeshStandardMaterial).opacity = t * shown;
    }
  });

  /* The head layer is the output, so it is neutral - but not near-white, which read as a wall. */
  const tint = (kind: string) => (kind === "head" ? HEAD : kind === "attention" ? PIPE : ACCENT);

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => (
        <mesh
          key={layer.name}
          ref={(node) => {
            slabRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[6.6, 0.05, 6.6]} />
          <meshStandardMaterial
            color={tint(layer.kind)}
            emissive={tint(layer.kind)}
            metalness={0.2}
            roughness={0.45}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}
      {layers.map((layer, i) => (
        <lineSegments
          geometry={edges}
          key={`${layer.name}-edge`}
          ref={(node) => {
            frameRefs.current[i] = node;
          }}
        >
          <lineBasicMaterial color={tint(layer.kind)} transparent />
        </lineSegments>
      ))}
      {[0, 1, 2, 3].map((h) => (
        <mesh
          key={h}
          ref={(node) => {
            headRefs.current[h] = node;
          }}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={PIPE}
            emissive={PIPE}
            emissiveIntensity={0.9}
            metalness={0.3}
            roughness={0.3}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 4. The prediction, its spread, and the review decision
 * ========================================================================================== */

function ResultField({ frame }: { frame: FrameRef }) {
  const barsRef = useRef<THREE.InstancedMesh>(null);
  const shellRef = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const show = at(p, "prediction");
    const uncertainty = at(p, "uncertainty");
    const calibrated = at(p, "calibration");
    const selectiveNow = at(p, "selective");
    const limits = at(p, "limits");

    const bars = barsRef.current;
    const shells = shellRef.current;
    if (!bars || !shells) return;
    bars.visible = show > 0.01;
    shells.visible = uncertainty > 0.01;

    /* Swept from keep-everything down to the measured 50% operating point. */
    const retention = mix(100, 50, selectiveNow);
    const threshold = sigmaQuantile(retention);

    for (let i = 0; i < network.nodes.length; i += 1) {
      const node = network.nodes[i];
      const value = predicted(node, i);
      const spread = sigma(node, i);
      const reviewed = selectiveNow > 0.02 && spread > threshold;

      const height = Math.abs(value) * show * 0.78;
      /*
       * Negative change reads downward, and an exactly-zero change is drawn as nothing at all.
       * More than a quarter of the real target is exact zeros; giving those segments a visible bar
       * would flatter the model by making it look busy where it predicted no effect.
       */
      const y = value >= 0 ? height / 2 : -height / 2;
      const lift = reviewed ? mix(0, 2.9, selectiveNow) : 0;
      P.set(node.x, y + lift, node.z);
      S.set(0.082, Math.max(0.001, height), 0.082);
      M.compose(P, Q, S);
      bars.setMatrixAt(i, M);
      C.copy(value < 0 ? WARN : ACCENT);
      if (reviewed) C.lerp(DIM, 0.6 * selectiveNow);
      C.lerp(DIM, limits * 0.4);
      bars.setColorAt(i, C);

      /* The interval around each prediction, narrowing as the temperature is applied. */
      const width = spread * mix(1, 0.6, calibrated) * uncertainty;
      P.set(node.x, y + lift, node.z);
      S.setScalar(Math.max(0.001, width * 0.22));
      M.compose(P, Q, S);
      shells.setMatrixAt(i, M);
      C.copy(calibrated > 0.5 ? ACCENT : WARN);
      shells.setColorAt(i, C);
    }

    bars.instanceMatrix.needsUpdate = true;
    shells.instanceMatrix.needsUpdate = true;
    if (bars.instanceColor) bars.instanceColor.needsUpdate = true;
    if (shells.instanceColor) shells.instanceColor.needsUpdate = true;
    (shells.material as THREE.MeshStandardMaterial).opacity = uncertainty * 0.22 * (1 - limits * 0.8);
  });

  return (
    <group>
      <instancedMesh args={[undefined, undefined, network.nodes.length]} ref={barsRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.5} />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, network.nodes.length]} ref={shellRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial depthWrite={false} metalness={0} roughness={1} transparent />
      </instancedMesh>
    </group>
  );
}

/*
 * The reliability curve used to live here, in world space, and it was the wrong place for it.
 *
 * It is a two-dimensional chart: two axes, ten points, one diagonal. Perspective adds nothing to
 * that except the risk of the camera orbiting it out of frame, which is exactly what happened -
 * the most important measurement in the whole sequence spent the uncertainty state clipped into
 * the top-left corner. It is now an SVG overlay pinned to the viewport, where it is always framed,
 * always sharp at any device pixel ratio, and readable by something that is not a GPU.
 */

/* ============================================================================================
 * 6. Camera - one continuous move, driven only by scroll
 * ========================================================================================== */

function CameraRig({ frame }: { frame: FrameRef }) {
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;

    /*
     * One keyframe per state, interpolated across the boundary between them.
     *
     * A single monotone sweep was tried first and it failed on the feature stack: five planes
     * separated vertically between y=0.75 and y=4.4 are only readable as five if the camera is
     * above the top one, and a camera falling steadily through the sequence was level with them
     * exactly when they mattered, so they projected onto each other into a single cloud. Each
     * state now says where it wants to be watched from, which is what an exploded view of a
     * physical object does too - you do not inspect a gearbox from one fixed chair.
     *
     * `orbit` never resets, so the whole sequence is one continuous move around the object rather
     * than a series of cuts.
     */
    const shots: Record<StateKey, { height: number; distance: number; look: number }> = {
      network: { height: 7.2, distance: 8.6, look: 0 },
      scenario: { height: 5.4, distance: 7.8, look: 0.1 },
      features: { height: 8.2, distance: 11.4, look: 2.6 },
      model: { height: 5.6, distance: 13.6, look: 0.5 },
      prediction: { height: 4.2, distance: 7.6, look: 0.2 },
      uncertainty: { height: 4.6, distance: 8.2, look: 0.9 },
      calibration: { height: 4.4, distance: 8.4, look: 1.3 },
      selective: { height: 5.2, distance: 8.2, look: 0.9 },
      limits: { height: 8.4, distance: 11, look: 0.2 },
    };

    /* Blend the two states the scroll currently sits between. */
    let height = shots.network.height;
    let distance = shots.network.distance;
    let look = shots.network.look;
    for (let i = 0; i < STATES.length - 1; i += 1) {
      const from = STATES[i];
      const to = STATES[i + 1];
      /* Hand over across the second half of a state, so each shot is held before it moves on. */
      const t = ease(span(p, mix(from.from, from.to, 0.45), to.to * 0.999));
      if (t <= 0) break;
      const a = shots[from.key];
      const b = shots[to.key];
      height = mix(a.height, b.height, t);
      distance = mix(a.distance, b.distance, t);
      look = mix(a.look, b.look, t);
    }

    const orbit = -0.95 + p * 1.05;
    camera.position.set(Math.sin(orbit) * distance, height, Math.cos(orbit) * distance);
    target.set(0, look, 0);
    camera.lookAt(target);
  });

  return null;
}

/* ========================================================================================== */

export default function ThesisWorldScene({ frame }: { frame: FrameRef }) {
  return (
    <>
      {/*
        Lit rather than flat: a key from above front, a cool rim from behind so silhouettes read
        against the background, and enough ambient that nothing in shadow becomes unreadable.
        Exponential fog carries the depth; there is no post-processing pass and no bloom.
      */}
      <color args={["#060909"]} attach="background" />
      <fogExp2 args={["#060909", 0.03]} attach="fog" />
      <ambientLight intensity={0.9} />
      <directionalLight intensity={1.4} position={[6, 10, 6]} />
      <directionalLight color="#7aa7f0" intensity={0.45} position={[-7, 4, -8]} />
      <CameraRig frame={frame} />
      <NetworkPlate frame={frame} />
      <FeaturePlanes frame={frame} />
      <ModelStack frame={frame} />
      <ResultField frame={frame} />
    </>
  );
}
