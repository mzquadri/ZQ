"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { mix } from "@/components/worlds/choreography";
import {
  RAIL,
  SIDING,
  STATIONS,
  failingIndex,
  gateChecks,
  inputChecks,
  registrySlots,
  rows,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A model release machine.
 *
 * Industrial rather than atmospheric: a rail, machined stations along it, plates that physically
 * block, and one cartridge that travels the length of it. The artifact is the only thing that moves
 * along the rail, and it is the same object throughout - assembled, refused, rebuilt, passed,
 * registered, promoted, mounted. Losing that continuity would turn this into boxes on a line.
 *
 * Amber is reserved for one thing: the check that refuses. Teal means a condition has been met, and
 * nothing is teal before it has earned it.
 */

const STEEL = new THREE.Color("#8b98a3");
const RAIL_C = new THREE.Color("#5c6873");
const CART = new THREE.Color("#dfe6ea");
const PASS = new THREE.Color("#4cc4b0");
const FAIL = new THREE.Color("#f0a03c");
const DATA = new THREE.Color("#6f9dc4");
const DIM = new THREE.Color("#39424a");
const LIVE = new THREE.Color("#8fd05a");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/**
 * Where the artifact is at a given scroll position.
 *
 * One function, because the artifact's continuity is the spine of the world: it is assembled at
 * training, carried to the gate, pushed back to the siding when refused, returned to training to be
 * rebuilt, then carried the whole way through. Everything else in the scene reacts to this.
 */
function artifactAt(p: number) {
  const built = at(p, "artifact");
  const toGate = at(p, "gate");
  const refused = at(p, "rejected");
  const rebuilding = at(p, "rebuilt");
  const passed = at(p, "passed");
  const staged = at(p, "staging");
  const promoted = at(p, "promotion");
  const serving = at(p, "serving");

  /* Assembled at the training station, then carried along the rail. */
  let x = mix(STATIONS.training, STATIONS.artifact, built);
  let y = 0;
  let z = 0;

  x = mix(x, STATIONS.gate - 0.55, toGate);

  /* Refused: pushed off the rail and down onto the siding. */
  const divert = Math.max(0, refused - rebuilding);
  x = mix(x, SIDING.x, divert);
  y = mix(y, SIDING.y, divert);
  z = mix(z, SIDING.z, divert);

  /* Rebuilt: back to the training station, and the whole run happens again. */
  x = mix(x, STATIONS.training, rebuilding * (1 - passed));
  y = mix(y, 0, rebuilding);
  z = mix(z, 0, rebuilding);

  /* Second pass: through the gate, into the rack, promoted, then mounted. */
  x = mix(x, STATIONS.gate + 0.5, passed);
  x = mix(x, STATIONS.staging, staged);
  x = mix(x, STATIONS.promotion, promoted);
  x = mix(x, STATIONS.serving, serving);

  return { x, y, z, divert, passed, promoted, serving };
}

/* ============================================================================================
 * 1. The rail, the housing, and the stations
 * ========================================================================================== */

function Machine({ frame }: { frame: FrameRef }) {
  const railRef = useRef<THREE.Mesh>(null);
  const shellRefs = useRef<(THREE.Mesh | null)[]>([]);
  const standRefs = useRef<(THREE.Mesh | null)[]>([]);
  const stations = useMemo(() => Object.entries(STATIONS), []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const opening = at(p, "data");
    const closing = at(p, "limits");

    /* Two housing panels lift away as the machine opens, and return at the end. */
    const open = Math.max(0, opening - closing * 0.7);
    shellRefs.current.forEach((panel, i) => {
      if (!panel) return;
      const side = i === 0 ? 1 : -1;
      panel.position.set(0, mix(0, side * 2.6, open), side * 1.35);
      panel.rotation.set(mix(0, side * 0.35, open), 0, 0);
      (panel.material as THREE.MeshStandardMaterial).opacity = mix(0.34, 0.05, open);
    });

    if (railRef.current) {
      (railRef.current.material as THREE.MeshStandardMaterial).opacity = 0.25 + open * 0.55;
    }

    /* A stand under each station, so the rail reads as supported rather than floating. */
    standRefs.current.forEach((stand, i) => {
      if (!stand) return;
      stand.visible = open > 0.05;
      const t = Math.max(0, Math.min(1, open * stations.length - i * 0.35));
      stand.scale.set(1, Math.max(0.001, t), 1);
    });
  });

  return (
    <group>
      <mesh position={[(RAIL.from + RAIL.to) / 2, RAIL.y - 0.16, 0]} ref={railRef}>
        <boxGeometry args={[RAIL.to - RAIL.from, 0.05, 0.5]} />
        <meshStandardMaterial
          color={RAIL_C}
          emissive={RAIL_C}
          emissiveIntensity={0.25}
          metalness={0.8}
          roughness={0.28}
          transparent
        />
      </mesh>
      {stations.map(([key, x], i) => (
        <mesh
          key={key}
          position={[x, RAIL.y - 0.44, 0]}
          ref={(node) => {
            standRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[0.13, 0.56, 0.13]} />
          <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.45} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(node) => {
            shellRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[RAIL.to - RAIL.from + 0.6, 2.6, 0.08]} />
          <meshStandardMaterial
            color={STEEL}
            metalness={0.55}
            roughness={0.4}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 2. Data: rows, split, and the ones the input checks drop
 * ========================================================================================== */

function DataStage({ frame }: { frame: FrameRef }) {
  const rowsRef = useRef<THREE.InstancedMesh>(null);
  const checkRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const arrive = at(p, "data");
    const training = at(p, "training");
    const rebuilding = at(p, "rebuilt");
    const gone = at(p, "artifact") * (1 - rebuilding);
    const shown = Math.max(arrive * (1 - gone), rebuilding * 0.9);

    const mesh = rowsRef.current;
    if (mesh) {
      mesh.visible = shown > 0.02;
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        const t = Math.max(0, Math.min(1, shown * 2.4 - i * 0.012));
        /* Rows that fail the input checks fall away rather than continuing into training. */
        const drop = row.dropped ? Math.min(1, arrive * 1.6) : 0;
        /* Then the survivors are drawn toward the training station. */
        const pull = training * (1 - drop);
        P.set(
          mix(STATIONS.data + (row.col - 4.5) * 0.13, STATIONS.training, pull),
          mix(0.35 + (row.row - 2.5) * 0.13, 0, pull) - drop * 1.1,
          mix((row.group - 1) * 0.34, 0, pull),
        );
        S.setScalar(0.06 * t * (1 - drop * 0.8));
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);
        /* Colour is the split the row belongs to; a dropped row goes amber on its way out. */
        C.copy(DATA).lerp(DIM, row.group * 0.28);
        if (drop > 0.05) C.copy(FAIL).lerp(DIM, drop * 0.5);
        mesh.setColorAt(i, C);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      (mesh.material as THREE.MeshStandardMaterial).opacity = shown;
    }

    /* Three input checks standing before the rail, lit as they are satisfied. */
    inputChecks.forEach((check, i) => {
      const plate = checkRefs.current[i];
      if (!plate) return;
      const t = Math.max(0, Math.min(1, arrive * 3 - i * 0.5)) * (1 - gone);
      plate.visible = t > 0.02;
      plate.position.set(STATIONS.data - 0.95, check.y, 0);
      plate.scale.set(0.02, 0.3 * t, 0.62 * t);
      const material = plate.material as THREE.MeshStandardMaterial;
      material.color.copy(C.copy(PASS).lerp(DIM, 1 - t));
      material.emissive.copy(C);
      material.emissiveIntensity = 0.35 * t;
      material.opacity = t;
    });
  });

  return (
    <group>
      <instancedMesh args={[undefined, undefined, rows.length]} ref={rowsRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.2} roughness={0.55} transparent />
      </instancedMesh>
      {inputChecks.map((check, i) => (
        <mesh
          key={check.label}
          ref={(node) => {
            checkRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial metalness={0.3} roughness={0.4} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 3. The artifact: one cartridge, the length of the machine
 * ========================================================================================== */

function Artifact({ frame }: { frame: FrameRef }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const built = at(p, "artifact");
    const training = at(p, "training");
    const state = artifactAt(p);
    const closing = at(p, "limits");

    if (!groupRef.current) return;
    /* It does not exist until it has been assembled. */
    const exists = Math.max(training * 0.4, built);
    groupRef.current.visible = exists > 0.02 && closing < 0.85;
    groupRef.current.position.set(state.x, state.y, state.z);

    if (bodyRef.current) {
      /* Bigger, and boxy. The first version was smaller than the ring around it and read as a disc. */
      bodyRef.current.scale.setScalar(mix(0.001, 0.32, exists));
      const material = bodyRef.current.material as THREE.MeshStandardMaterial;
      /*
       * Status, worn on the object. Neutral while it is only a candidate, amber while it is the
       * one that was refused, teal once it has been promoted - never before.
       */
      C.copy(CART);
      if (state.divert > 0.05) C.lerp(FAIL, state.divert);
      if (state.promoted > 0.1) C.lerp(PASS, state.promoted);
      material.color.copy(C);
      material.emissive.copy(C);
      material.emissiveIntensity = 0.12 + state.promoted * 0.35;
    }

    /*
     * The manifest band: a collar around the cartridge's waist, not a halo around it. Sized under
     * the body so it reads as part of the object rather than a ring the object sits inside.
     */
    if (ringRef.current) {
      ringRef.current.visible = built > 0.05;
      ringRef.current.scale.setScalar(mix(1.7, 1, built));
      ringRef.current.rotation.set(0, 0, Math.PI / 2);
      const material = ringRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = built;
      C.copy(state.promoted > 0.1 ? PASS : state.divert > 0.05 ? FAIL : DATA);
      material.color.copy(C);
      material.emissive.copy(C);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={bodyRef}>
        <boxGeometry args={[1.35, 0.72, 0.72]} />
        <meshStandardMaterial metalness={0.5} roughness={0.26} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.115, 0.028, 8, 28]} />
        <meshStandardMaterial color={CART} emissive={CART} emissiveIntensity={0.5} transparent />
      </mesh>
    </group>
  );
}

/* ============================================================================================
 * 4. The gate: four plates, and one that stays shut
 * ========================================================================================== */

function Gate({ frame }: { frame: FrameRef }) {
  const plateRefs = useRef<(THREE.Mesh | null)[]>([]);
  const frameRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const arrive = at(p, "gate");
    const refused = at(p, "rejected");
    const rebuilding = at(p, "rebuilt");
    const passed = at(p, "passed");
    const closing = at(p, "limits");
    const shown = arrive * (1 - closing * 0.8);

    if (frameRef.current) {
      frameRef.current.visible = shown > 0.02;
      (frameRef.current.material as THREE.MeshStandardMaterial).opacity = shown * 0.5;
    }

    gateChecks.forEach((check, i) => {
      const plate = plateRefs.current[i];
      if (!plate) return;
      plate.visible = shown > 0.02;

      /*
       * On the first pass the margin check fails, so its plate stays across the rail while the
       * other three withdraw. One closed plate is enough: the gate is a conjunction.
       */
      const isFailing = i === failingIndex;
      const firstPass = Math.max(0, refused - rebuilding);
      const open = isFailing ? passed : Math.max(arrive * 0.85, passed);

      plate.position.set(STATIONS.gate, check.y, 0);
      /* An open plate slides out of the rail's way; a shut one spans it. */
      /* A shut plate spans the rail and stands proud of it; an open one retracts sideways. */
      plate.scale.set(0.07, 0.4, mix(1.15, 0.1, open));

      const material = plate.material as THREE.MeshStandardMaterial;
      C.copy(DIM);
      if (open > 0.3) C.copy(PASS);
      if (isFailing && firstPass > 0.1) C.copy(FAIL);
      material.color.copy(C);
      material.emissive.copy(C);
      material.emissiveIntensity = 0.2 + Math.max(open, isFailing ? firstPass : 0) * 0.6;
      material.opacity = shown;
    });
  });

  return (
    <group>
      <mesh position={[STATIONS.gate, 0, 0]} ref={frameRef}>
        <boxGeometry args={[0.16, 2.1, 1.5]} />
        <meshStandardMaterial
          color={STEEL}
          metalness={0.65}
          roughness={0.4}
          side={THREE.DoubleSide}
          transparent
          wireframe
        />
      </mesh>
      {gateChecks.map((check, i) => (
        <mesh
          key={check.key}
          ref={(node) => {
            plateRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial metalness={0.5} roughness={0.35} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 5. The registry rack, and the service that mounts one bundle
 * ========================================================================================== */

function Registry({ frame }: { frame: FrameRef }) {
  const slotRefs = useRef<(THREE.Mesh | null)[]>([]);
  const serviceRef = useRef<THREE.Mesh>(null);
  const readyRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const staged = at(p, "staging");
    const promoted = at(p, "promotion");
    const serving = at(p, "serving");
    const monitoring = at(p, "monitoring");
    const closing = at(p, "limits");
    const shown = Math.max(staged, promoted) * (1 - closing * 0.7);

    registrySlots.forEach((slot, i) => {
      const mesh = slotRefs.current[i];
      if (!mesh) return;
      const t = Math.max(0, Math.min(1, shown * 4 - i * 0.4));
      mesh.visible = t > 0.02;
      mesh.position.set(STATIONS.staging + 0.7, slot.y, 0);
      mesh.scale.set(0.5 * t, 0.3 * t, 0.62 * t);
      const material = mesh.material as THREE.MeshStandardMaterial;
      /*
       * Only the slot the artifact currently occupies is lit, and production only lights after the
       * promotion step - registering to it directly is refused by the code.
       */
      const occupied =
        (slot.key === "staging" && staged > 0.4 && promoted < 0.4) ||
        (slot.key === "production" && promoted > 0.4) ||
        (slot.key === "archived" && promoted > 0.8);
      C.copy(occupied ? PASS : DIM);
      material.color.copy(C);
      material.emissive.copy(C);
      material.emissiveIntensity = occupied ? 0.5 : 0.08;
      material.opacity = t * 0.85;
    });

    /* The service: a chamber the promoted bundle is mounted into, unready until it loads. */
    if (serviceRef.current) {
      serviceRef.current.visible = serving > 0.02 && closing < 0.8;
      serviceRef.current.position.set(STATIONS.serving, 0, 0);
      serviceRef.current.scale.setScalar(0.001 + serving * 0.62);
      (serviceRef.current.material as THREE.MeshStandardMaterial).opacity = serving * 0.22;
    }
    if (readyRef.current) {
      readyRef.current.visible = serving > 0.3 && closing < 0.8;
      readyRef.current.position.set(STATIONS.serving, 0.78, 0);
      readyRef.current.scale.setScalar(0.001 + Math.min(1, serving * 1.4) * 0.1);
      const material = readyRef.current.material as THREE.MeshStandardMaterial;
      /* Amber while unready, green once a model is genuinely usable. */
      const ready = Math.max(0, serving - 0.55) * 2.2;
      C.copy(FAIL).lerp(LIVE, Math.min(1, ready + monitoring));
      material.color.copy(C);
      material.emissive.copy(C);
      material.emissiveIntensity = 0.8;
    }
  });

  return (
    <group>
      {registrySlots.map((slot, i) => (
        <mesh
          key={slot.key}
          ref={(node) => {
            slotRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial metalness={0.4} roughness={0.4} transparent />
        </mesh>
      ))}
      <mesh ref={serviceRef}>
        <boxGeometry args={[1.5, 1.6, 1.5]} />
        <meshStandardMaterial
          color={STEEL}
          metalness={0.5}
          roughness={0.4}
          side={THREE.DoubleSide}
          transparent
          wireframe
        />
      </mesh>
      <mesh ref={readyRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial metalness={0.2} roughness={0.3} />
      </mesh>
    </group>
  );
}

/* ============================================================================================
 * 6. Camera - tracks the artifact rather than orbiting the machine
 * ========================================================================================== */

function CameraRig({ frame }: { frame: FrameRef }) {
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;

    /* Blend the keyframes by hand here: `track` is an x offset, not an orbit angle. */
    let shot = SHOTS[STATES[0].key];
    for (let i = 0; i < STATES.length - 1; i += 1) {
      const from = STATES[i];
      const to = STATES[i + 1];
      const start = from.from + (from.to - from.from) * 0.45;
      const t = Math.max(0, Math.min(1, (p - start) / Math.max(1e-6, to.to * 0.999 - start)));
      if (t <= 0) break;
      const a = SHOTS[from.key];
      const b = SHOTS[to.key];
      shot = {
        height: mix(a.height, b.height, t),
        distance: mix(a.distance, b.distance, t),
        look: mix(a.look, b.look, t),
        track: mix(a.track, b.track, t),
      };
    }

    /* Slightly off-axis so the rail has depth, but never orbiting: this machine is read side-on. */
    camera.position.set(shot.track - 1.1, shot.height, shot.distance);
    target.set(shot.track, shot.look, 0);
    camera.lookAt(target);
  });

  return null;
}

/* ========================================================================================== */

export default function MlopsWorldScene({ frame }: { frame: FrameRef }) {
  return (
    <>
      {/*
        Machine-shop lighting. A hard key so machined edges and the rail catch, a cool fill from
        below so the underside of the housing is not a void, and a warm rim from behind the gate so
        the artifact reads against it at the one moment it matters. No bloom.
      */}
      <color args={["#0a0c0e"]} attach="background" />
      <fogExp2 args={["#0a0c0e", 0.026]} attach="fog" />
      <ambientLight intensity={0.95} />
      <directionalLight intensity={1.55} position={[3, 6, 7]} />
      <directionalLight color="#6f9dc4" intensity={0.6} position={[-5, -2, -4]} />
      <pointLight color="#f0e0c0" distance={7} intensity={5} position={[0.4, 1.2, 1.6]} />
      <CameraRig frame={frame} />
      <Machine frame={frame} />
      <DataStage frame={frame} />
      <Gate frame={frame} />
      <Registry frame={frame} />
      <Artifact frame={frame} />
    </>
  );
}
