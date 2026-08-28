"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import {
  FAILING_INVARIANT,
  graphEdges,
  graphNodes,
  modules,
  points,
  records,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A reliable-knowledge machine, taken apart.
 *
 * More mechanical than the other worlds on purpose. This one is about a machine with parts that
 * come out and go back in, so the language is machined plates, a dense core, and thin taut cables -
 * not particles and not atmosphere. Everything is synthetic; the counts are legibility choices and
 * the page says so.
 *
 * Colour carries one meaning each. The core is warm and solid because it is the thing that must
 * not change. Derived modules are cool. Verification cables are pale when they are only present and
 * teal when they have confirmed something. Amber appears exactly once, on the branch that drifts.
 */

const CORE = new THREE.Color("#e8d9b8");
const SHELL = new THREE.Color("#8e9aa4");
const DERIVED = new THREE.Color("#6f9dc4");
const OK = new THREE.Color("#4cc4b0");
const FAULT = new THREE.Color("#f0a03c");
const DIM = new THREE.Color("#3f4a53");
const INK = new THREE.Color("#f2f0e8");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/** Which module drifts, and therefore which one is rebuilt. */
const FAULTY = 1;

/* ============================================================================================
 * 1. The housing, and the core it closes around
 * ========================================================================================== */

function Core({ frame }: { frame: FrameRef }) {
  const shellRefs = useRef<(THREE.Mesh | null)[]>([]);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const opening = at(p, "core");
    const capture = at(p, "capture");
    const closing = at(p, "settled");

    /* Three housing panels hinge away, then come back for the closing state. */
    const open = Math.max(0, opening - closing * 0.85);
    shellRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const angle = (i / 3) * Math.PI * 2;
      const push = mix(1.05, 2.9, open);
      panel.position.set(Math.cos(angle) * push, mix(0, 0.5 + i * 0.2, open), Math.sin(angle) * push);
      panel.rotation.set(0, -angle, mix(0, 0.5, open));
      const material = panel.material as THREE.MeshStandardMaterial;
      material.opacity = mix(0.5, 0.1, open);
    });

    /*
     * The core never moves, in any state. That is the whole point of it: derived branches come
     * apart, drift, are thrown away and rebuilt around it, and it stays exactly where it is.
     */
    if (coreRef.current) {
      coreRef.current.scale.setScalar(0.42 + capture * 0.06);
      (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.18 + capture * 0.35;
    }
    /* The fingerprint ring closes around the core at capture and then stays shut. */
    if (ringRef.current) {
      ringRef.current.visible = capture > 0.02;
      ringRef.current.scale.setScalar(mix(1.6, 0.72, capture));
      ringRef.current.rotation.set(Math.PI / 2, 0, capture * 0.6);
      (ringRef.current.material as THREE.MeshStandardMaterial).opacity = capture * 0.9;
    }
  });

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(node) => {
            shellRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1.5, 2.1, 0.09]} />
          <meshStandardMaterial
            color={SHELL}
            metalness={0.5}
            roughness={0.42}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={CORE} emissive={CORE} metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.62, 0.03, 8, 48]} />
        <meshStandardMaterial color={CORE} emissive={CORE} emissiveIntensity={0.6} transparent />
      </mesh>
    </group>
  );
}

/* ============================================================================================
 * 2. Three derived modules, and what is inside each one
 * ========================================================================================== */

function Modules({ frame }: { frame: FrameRef }) {
  const hullRefs = useRef<(THREE.Mesh | null)[]>([]);
  const edgeRefs = useRef<(THREE.LineSegments | null)[]>([]);
  const recordRef = useRef<THREE.InstancedMesh>(null);
  const pointRef = useRef<THREE.InstancedMesh>(null);
  const nodeRef = useRef<THREE.InstancedMesh>(null);
  const graphRef = useRef<THREE.LineSegments>(null);

  const hullEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.7, 1.7, 1.7)), []);
  const graphGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(graphEdges.length * 6), 3));
    return g;
  }, []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const split = at(p, "split");
    const closing = at(p, "settled");
    const drift = at(p, "mismatch");
    const healed = at(p, "rebuild");
    const inspect = [at(p, "structured"), at(p, "semantic"), at(p, "relational")];

    /* Modules slide out on their own axis, then return when the machine closes. */
    const out = Math.max(0, split - closing * 0.8);

    modules.forEach((module, i) => {
      const hull = hullRefs.current[i];
      const edge = edgeRefs.current[i];
      if (!hull) return;
      const radius = mix(module.closed, module.open, out);
      /* The faulty module drifts off its own axis while it is wrong, and snaps back on rebuild. */
      const wrong = i === FAULTY ? Math.max(0, drift - healed) : 0;
      hull.position.set(
        module.dir.x * radius + wrong * 0.8,
        wrong * 0.55,
        module.dir.z * radius,
      );
      /* The one being inspected grows; the others give way. */
      const focus = inspect[i];
      const others = Math.max(...inspect.filter((_, k) => k !== i), 0);
      hull.scale.setScalar(mix(0.85, 1.15, focus) * mix(1, 0.72, others));

      const material = hull.material as THREE.MeshStandardMaterial;
      C.copy(DERIVED);
      if (wrong > 0.05) C.lerp(FAULT, wrong);
      material.color.copy(C);
      material.emissive.copy(C);
      material.opacity = (0.06 + out * 0.06 + focus * 0.06) * (1 - closing * 0.3);

      if (edge) {
        edge.position.copy(hull.position);
        edge.scale.copy(hull.scale);
        (edge.material as THREE.LineBasicMaterial).color.copy(C);
        (edge.material as THREE.LineBasicMaterial).opacity = 0.25 + out * 0.4 + focus * 0.35;
      }
    });

    const at0 = modules[0];
    const at1 = modules[1];
    const at2 = modules[2];
    const radius = (m: typeof at0) => mix(m.closed, m.open, out);

    /* Structured: a machined grid of records, one of which is the one that goes stale. */
    const grid = recordRef.current;
    if (grid) {
      const shown = Math.max(out, inspect[0]);
      grid.visible = shown > 0.02;
      const base = { x: at0.dir.x * radius(at0), z: at0.dir.z * radius(at0) };
      for (let i = 0; i < records.length; i += 1) {
        const record = records[i];
        const t = Math.max(0, Math.min(1, inspect[0] * records.length * 0.4 - i * 0.25));
        P.set(base.x + (record.col - 1.5) * 0.3, (record.row - 1) * 0.3, base.z);
        S.set(0.22 * (0.4 + t * 0.6), 0.22 * (0.4 + t * 0.6), 0.07);
        M.compose(P, Q, S);
        grid.setMatrixAt(i, M);
        C.copy(INK).lerp(DIM, 0.35 - t * 0.3);
        grid.setColorAt(i, C);
      }
      grid.instanceMatrix.needsUpdate = true;
      if (grid.instanceColor) grid.instanceColor.needsUpdate = true;
      (grid.material as THREE.MeshStandardMaterial).opacity = shown;
    }

    /* Semantic: a point field, and the one module that can drift without looking wrong. */
    const cloud = pointRef.current;
    if (cloud) {
      const shown = Math.max(out, inspect[1]);
      cloud.visible = shown > 0.02;
      const wrong = Math.max(0, drift - healed);
      const base = { x: at1.dir.x * radius(at1) + wrong * 0.8, y: wrong * 0.55, z: at1.dir.z * radius(at1) };
      for (let i = 0; i < points.length; i += 1) {
        const point = points[i];
        const t = Math.max(0, Math.min(1, inspect[1] * 2.2 - i * 0.04));
        /* On rebuild the field collapses to the core and reforms, rather than fading. */
        const rebuilding = healed * (1 - at(p, "settled"));
        P.set(
          mix(base.x + point.x * 0.62, 0, rebuilding * 0.85),
          mix(base.y + point.y * 0.42, 0, rebuilding * 0.85),
          mix(base.z + point.z * 0.62, 0, rebuilding * 0.85),
        );
        S.setScalar(0.048 * (0.35 + t * 0.65));
        M.compose(P, Q, S);
        cloud.setMatrixAt(i, M);
        C.copy(DERIVED);
        if (wrong > 0.05) C.lerp(FAULT, wrong * 0.9);
        if (healed > 0.4) C.lerp(OK, (healed - 0.4) * 1.4);
        cloud.setColorAt(i, C);
      }
      cloud.instanceMatrix.needsUpdate = true;
      if (cloud.instanceColor) cloud.instanceColor.needsUpdate = true;
      (cloud.material as THREE.MeshStandardMaterial).opacity = shown;
    }

    /* Relational: a small graph with real edges, so it reads as connected rather than scattered. */
    const nodes = nodeRef.current;
    if (nodes) {
      const shown = Math.max(out, inspect[2]);
      nodes.visible = shown > 0.02;
      const base = { x: at2.dir.x * radius(at2), z: at2.dir.z * radius(at2) };
      const place = (n: (typeof graphNodes)[number]) =>
        new THREE.Vector3(base.x + n.x * 0.62, n.y * 0.62, base.z + n.z * 0.62);
      for (let i = 0; i < graphNodes.length; i += 1) {
        const t = Math.max(0, Math.min(1, inspect[2] * 3 - i * 0.22));
        const v = place(graphNodes[i]);
        P.copy(v);
        S.setScalar(0.07 * (0.4 + t * 0.6) * (i === 0 ? 1.5 : 1));
        M.compose(P, Q, S);
        nodes.setMatrixAt(i, M);
        C.copy(i === 0 ? INK : DERIVED);
        nodes.setColorAt(i, C);
      }
      nodes.instanceMatrix.needsUpdate = true;
      if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
      (nodes.material as THREE.MeshStandardMaterial).opacity = shown;

      const position = graphGeometry.getAttribute("position") as THREE.BufferAttribute;
      graphEdges.forEach(([a, b], k) => {
        const va = place(graphNodes[a]);
        const vb = place(graphNodes[b]);
        position.setXYZ(k * 2, va.x, va.y, va.z);
        position.setXYZ(k * 2 + 1, vb.x, vb.y, vb.z);
      });
      position.needsUpdate = true;
      graphGeometry.computeBoundingSphere();
      if (graphRef.current) {
        graphRef.current.visible = shown > 0.02;
        (graphRef.current.material as THREE.LineBasicMaterial).opacity = shown * 0.55;
      }
    }
  });

  return (
    <group>
      {modules.map((module, i) => (
        <mesh
          key={module.key}
          ref={(node) => {
            hullRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1.7, 1.7, 1.7]} />
          <meshStandardMaterial
            depthWrite={false}
            emissiveIntensity={0.18}
            metalness={0.3}
            roughness={0.5}
            transparent
          />
        </mesh>
      ))}
      {modules.map((module, i) => (
        <lineSegments
          geometry={hullEdges}
          key={`${module.key}-edge`}
          ref={(node) => {
            edgeRefs.current[i] = node;
          }}
        >
          <lineBasicMaterial transparent />
        </lineSegments>
      ))}
      <instancedMesh args={[undefined, undefined, records.length]} ref={recordRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.35} roughness={0.45} transparent />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, points.length]} ref={pointRef}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial metalness={0.2} roughness={0.5} transparent />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, graphNodes.length]} ref={nodeRef}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial metalness={0.45} roughness={0.35} transparent />
      </instancedMesh>
      <lineSegments geometry={graphGeometry} ref={graphRef}>
        <lineBasicMaterial color={DERIVED} transparent />
      </lineSegments>
    </group>
  );
}

/* ============================================================================================
 * 3. Verification, running the other way
 *
 * The signature of the whole world. Cables extend from each derived module back to the core and
 * ask the same question. Two come back confirmed; one does not.
 * ========================================================================================== */

const CABLE_SEGMENTS = 14;

function Verification({ frame }: { frame: FrameRef }) {
  const cableRefs = useRef<(THREE.Line | null)[]>([]);
  const geometries = useMemo(
    () =>
      modules.map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(CABLE_SEGMENTS * 6), 3));
        return g;
      }),
    [],
  );

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const split = at(p, "split");
    const verify = at(p, "verify");
    const drift = at(p, "mismatch");
    const healed = at(p, "rebuild");
    const closing = at(p, "settled");
    const out = Math.max(0, split - closing * 0.8);

    modules.forEach((module, i) => {
      const line = cableRefs.current[i];
      if (!line) return;
      line.visible = verify > 0.02;
      if (verify <= 0.02) return;

      const wrong = i === FAULTY ? Math.max(0, drift - healed) : 0;
      const radius = mix(module.closed, module.open, out);
      const from = new THREE.Vector3(
        module.dir.x * radius + wrong * 0.8,
        wrong * 0.55,
        module.dir.z * radius,
      );

      /*
       * The cable is drawn from the module inward, not from the core outward, and the drawn
       * fraction is how far the check has got. A drifted branch never completes the journey.
       */
      const reach = wrong > 0.05 ? Math.min(0.55, verify) : verify;
      const position = geometries[i].getAttribute("position") as THREE.BufferAttribute;
      for (let s = 0; s < CABLE_SEGMENTS; s += 1) {
        const t0 = (s / CABLE_SEGMENTS) * reach;
        const t1 = ((s + 1) / CABLE_SEGMENTS) * reach;
        const point = (t: number) => {
          const sag = Math.sin(t * Math.PI) * 0.28;
          return new THREE.Vector3(
            from.x * (1 - t),
            from.y * (1 - t) + sag,
            from.z * (1 - t),
          );
        };
        const a = point(t0);
        const b = point(t1);
        position.setXYZ(s * 2, a.x, a.y, a.z);
        position.setXYZ(s * 2 + 1, b.x, b.y, b.z);
      }
      position.needsUpdate = true;
      geometries[i].computeBoundingSphere();

      const material = line.material as THREE.LineBasicMaterial;
      C.copy(wrong > 0.05 ? FAULT : OK).lerp(DIM, 1 - verify);
      material.color.copy(C);
      material.opacity = verify * (1 - closing * 0.5);
    });
  });

  return (
    <group>
      {modules.map((module, i) => (
        <lineSegments
          geometry={geometries[i]}
          key={`${module.key}-cable`}
          ref={(node) => {
            cableRefs.current[i] = node as unknown as THREE.Line;
          }}
        >
          <lineBasicMaterial transparent />
        </lineSegments>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 4. The verdict, as four lamps rather than one
 * ========================================================================================== */

function Verdict({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const lampRefs = useRef<(THREE.Mesh | null)[]>([]);
  const keys = ["present", "complete", FAILING_INVARIANT, "current"];

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const health = at(p, "health");
    const healed = at(p, "rebuild");
    const settled = at(p, "settled");
    const shown = Math.max(health, settled);
    if (groupRef.current) {
      groupRef.current.visible = shown > 0.02;
      /* Low enough to stay in frame at the health shot; the verdict is the subject there. */
      groupRef.current.position.set(0, 1.95, 0);
    }
    if (shown <= 0.02) return;

    keys.forEach((key, i) => {
      const lamp = lampRefs.current[i];
      if (!lamp) return;
      const t = Math.max(0, Math.min(1, shown * 4 - i * 0.5));
      lamp.position.set((i - 1.5) * 0.62, 0, 0);
      lamp.scale.setScalar(0.001 + t * 0.19);
      /* Only the consistency lamp fails, and only until the rebuild completes. */
      const failing = key === FAILING_INVARIANT ? Math.max(0, health - healed) : 0;
      const material = lamp.material as THREE.MeshStandardMaterial;
      C.copy(failing > 0.05 ? FAULT : OK);
      material.color.copy(C);
      material.emissive.copy(C);
      material.emissiveIntensity = 0.4 + t * 0.6;
      material.opacity = t;
    });
  });

  return (
    <group ref={groupRef}>
      {keys.map((key, i) => (
        <mesh
          key={key}
          ref={(node) => {
            lampRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial metalness={0.2} roughness={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 5. Camera
 * ========================================================================================== */

function CameraRig({ frame }: { frame: FrameRef }) {
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(
      Math.sin(shot.yaw) * shot.distance,
      shot.height,
      Math.cos(shot.yaw) * shot.distance,
    );
    target.set(0, shot.look, 0);
    camera.lookAt(target);
  });

  return null;
}

/* ========================================================================================== */

export default function ReliableWorldScene({ frame }: { frame: FrameRef }) {
  return (
    <>
      {/*
        Instrument lighting. A hard key so machined edges catch, a cool fill so the far side of a
        module is still readable, and a warm point at the origin so the core looks lit from within
        rather than lit from outside like everything else - it is the one part that is not derived.
      */}
      <color args={["#0a0c0e"]} attach="background" />
      <fogExp2 args={["#0a0c0e", 0.03]} attach="fog" />
      <ambientLight intensity={0.65} />
      <directionalLight intensity={1.5} position={[4, 7, 5]} />
      <directionalLight color="#6f9dc4" intensity={0.5} position={[-6, 2, -5]} />
      <pointLight color="#e8d9b8" distance={6} intensity={9} position={[0, 0, 0]} />
      <CameraRig frame={frame} />
      <Core frame={frame} />
      <Modules frame={frame} />
      <Verification frame={frame} />
      <Verdict frame={frame} />
    </>
  );
}
