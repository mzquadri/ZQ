"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { configurations, stages } from "@/content/gateway-world";
import {
  CLIENT_Z,
  COST_BARS,
  CONTROLS_BY_STAGE,
  LANE_X,
  PACKETS,
  PLANE,
  PLANE_Z,
  SERVER_Z,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A boundary, seen down its own axis.
 *
 * No other world here is a place. The rest are objects being assembled, measured or taken apart,
 * watched from outside; this one puts the reader between a server and a client and sends traffic
 * at them. That is the argument made spatially: the three moments content crosses into a model's
 * context are three *depths*, written by three different people, and only the nearest one to the
 * server can be inspected before anybody calls anything.
 *
 * Colour carries one distinction and only one. Amber is a thing refused or a thing that got
 * through when it should not have; teal is a thing that was allowed and should have been. Nothing
 * is amber for decoration, which is the same rule the release machine follows.
 */

const EDGE = new THREE.Color("#5c6873");
const INK = new THREE.Color("#dfe6ea");
const PASS = new THREE.Color("#4cc4b0");
const STOP = new THREE.Color("#f0a03c");
const DIM = new THREE.Color("#2a323b");
const SERVER = new THREE.Color("#8ea6bd");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

/** The three planes, as outlines. Built once; only their material opacity changes. */
function planeOutline(width: number, height: number) {
  const w = width / 2;
  const h = height / 2;
  const points = [
    new THREE.Vector3(-w, -h, 0),
    new THREE.Vector3(w, -h, 0),
    new THREE.Vector3(w, h, 0),
    new THREE.Vector3(-w, h, 0),
    new THREE.Vector3(-w, -h, 0),
  ];
  return new THREE.BufferGeometry().setFromPoints(points);
}

export default function GatewayWorldScene({ frame }: { frame: FrameRef }) {
  const outline = useMemo(() => planeOutline(PLANE.width, PLANE.height), []);

  const rig = useRef<THREE.Group>(null);
  const planes = useRef<(THREE.Group | null)[]>([]);
  const fills = useRef<(THREE.Mesh | null)[]>([]);
  const packets = useRef<THREE.InstancedMesh>(null);
  const controlBars = useRef<THREE.InstancedMesh>(null);
  const costBars = useRef<(THREE.Mesh | null)[]>([]);
  const lanes = useRef<(THREE.Group | null)[]>([]);

  /* Flat list of every control bar, so one instanced mesh can carry all of them. */
  const bars = useMemo(
    () =>
      CONTROLS_BY_STAGE.flatMap((list, stage) =>
        list.map((control, i) => ({ stage, i, total: list.length, decidable: control.decidable })),
      ),
    [],
  );

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;

    /* ---- camera: a dolly down the depth axis, never an orbit ---- */
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(shot.swing, shot.rise, shot.dolly * shot.pull);
    camera.lookAt(0, 0, 0);

    const authors = at(p, "authors");
    const scannable = at(p, "scannable");
    const traffic = at(p, "traffic");
    const controls = at(p, "controls");
    const depth = at(p, "depth");
    const compare = at(p, "compare");
    const refused = at(p, "refused");
    const cost = at(p, "cost");
    const bypass = at(p, "bypass");
    const limits = at(p, "limits");

    /*
     * The comparison pulls the three lanes apart, and everything that belongs to the single
     * boundary recedes while it does. One scene, two readings, never both at full strength.
     */
    const single = 1 - Math.max(compare, cost) * 0.85;

    if (rig.current) {
      /* A few degrees only. Enough to read the planes as planes rather than as lines. */
      rig.current.rotation.y = mix(0, 0.22, Math.max(authors, scannable)) * (1 - compare * 0.8);
      rig.current.rotation.x = mix(0.02, 0.16, limits);
    }

    /* ---- the three planes ---- */
    PLANE_Z.forEach((z, i) => {
      const group = planes.current[i];
      if (group) {
        group.position.z = mix(z, z * 1.35, limits);
        group.visible = single > 0.04;
        const material = (group.children[0] as THREE.Line | undefined)?.material as
          | THREE.LineBasicMaterial
          | undefined;
        if (material) {
          /* Each plane takes its author's weight as the authorship beat arrives. */
          const weight = i === 0 ? 1 : i === 1 ? 0.78 : 0.6;
          material.opacity = single * mix(0.5, weight, authors) * (1 - limits * 0.45);
          material.color.copy(EDGE).lerp(INK, authors * weight * 0.5);
        }
      }

      const fill = fills.current[i];
      if (fill) {
        /*
         * Only the first plane fills in. A tool description exists before any call, so it can be
         * read ahead; the other two are drawn as open frames because the content that will cross
         * them does not exist yet. That absence is the project's whole premise, so it is drawn as
         * absence rather than labelled.
         */
        const solid = i === 0 ? scannable : 0;
        const material = fill.material as THREE.MeshBasicMaterial;
        material.opacity = single * solid * 0.16;
        fill.visible = material.opacity > 0.01;
      }
    });

    /* ---- the traffic ---- */
    if (packets.current) {
      const mesh = packets.current;
      PACKETS.forEach((packet, i) => {
        /*
         * Each packet runs the length of the axis on its own phase. Where a control catches it, it
         * stops at that plane rather than continuing - the stop is the whole event, so nothing is
         * drawn past it.
         */
        const t = (traffic * 1.25 + packet.phase) % 1;
        const stopZ = packet.caughtAt >= 0 ? PLANE_Z[packet.caughtAt] : CLIENT_Z;
        const reach = mix(SERVER_Z, CLIENT_Z, t);
        let z = Math.min(reach, mix(CLIENT_Z, stopZ, controls));

        /* The one that went around: a withheld tool called directly at the request stage. */
        const isBypass = i === 0;
        let x = packet.x;
        if (isBypass && bypass > 0.02) {
          x = mix(packet.x, packet.x + 1.5, bypass);
          z = mix(z, PLANE_Z[1] + 0.12, bypass);
        }

        /* The comparison lifts everything out of the single boundary; the lanes carry it instead. */
        const shown = single;
        const held = packet.caughtAt >= 0 && reach >= stopZ ? 1 : 0;
        const flare = held * controls;

        P.set(x, packet.y, z);
        S.setScalar(mix(0.055, 0.085, flare) * shown * (traffic > 0.02 ? 1 : 0.0001));
        Q.setFromAxisAngle(UP, 0);
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);

        C.copy(packet.attack ? STOP : PASS);
        if (packet.attack && packet.caughtAt < 0) C.copy(STOP).lerp(INK, 0.55);
        if (packet.falseBlock && refused > 0.1) C.copy(STOP);
        /* Caught twice: brighter, because the overlap is the defence-in-depth claim. */
        if (packet.doubled && depth > 0.1) C.lerp(INK, depth * 0.5);
        mesh.setColorAt(i, C);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    /* ---- the control bars along each plane's lower edge ---- */
    if (controlBars.current) {
      const mesh = controlBars.current;
      bars.forEach((bar, i) => {
        const spread = PLANE.width * 0.82;
        const x = bar.total <= 1 ? 0 : (-0.5 + bar.i / (bar.total - 1)) * spread;
        const on = controls * single;
        P.set(x, -PLANE.height / 2 - 0.1, PLANE_Z[bar.stage]);
        S.set(spread / Math.max(1, bar.total) * 0.7, 0.05 * on, 0.05);
        Q.setFromAxisAngle(UP, 0);
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);
        /* Decidable controls are the ones that answer a question of fact rather than of shape. */
        C.copy(bar.decidable ? PASS : INK).lerp(DIM, 1 - on);
        mesh.setColorAt(i, C);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    /* ---- the three lanes of the comparison ---- */
    lanes.current.forEach((group, i) => {
      if (!group) return;
      group.visible = compare > 0.02;
      group.position.x = mix(0, LANE_X[i], compare);
      group.position.z = mix(0, -0.4, compare);
      group.scale.setScalar(mix(0.001, 1, compare) * (1 - cost * 0.8));
    });

    /* ---- what it costs per event ---- */
    costBars.current.forEach((bar, i) => {
      if (!bar) return;
      const on = cost;
      bar.visible = on > 0.02;
      const height = COST_BARS[i].height * on * 2.4;
      bar.scale.set(1, Math.max(0.001, height), 1);
      bar.position.set(LANE_X[i] * 0.52, height / 2 - 0.9, 1.2);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = on * 0.85;
    });
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={0.9} />

      {/* The server, behind everything, and the client in front of it. */}
      <mesh position={[0, 0, SERVER_Z]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={SERVER} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 0, CLIENT_Z]}>
        <boxGeometry args={[0.42, 0.42, 0.42]} />
        <meshBasicMaterial color={INK} transparent opacity={0.4} />
      </mesh>

      {/* The three boundaries. */}
      {stages.map((stage, i) => (
        <group key={stage.key} position={[0, 0, PLANE_Z[i]]} ref={(node) => { planes.current[i] = node; }}>
          <line>
            <primitive attach="geometry" object={outline} />
            <lineBasicMaterial color={EDGE} transparent opacity={0.5} />
          </line>
          <mesh ref={(node) => { fills.current[i] = node; }}>
            <planeGeometry args={[PLANE.width, PLANE.height]} />
            <meshBasicMaterial color={INK} transparent opacity={0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Forty-seven cases. */}
      <instancedMesh args={[undefined, undefined, PACKETS.length]} ref={packets}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* Nine controls, at the stages their evidence exists. */}
      <instancedMesh args={[undefined, undefined, bars.length]} ref={controlBars}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {/* The comparison: one lane per configuration, each a block of what it let through. */}
      {LANE_X.map((_, lane) => (
        <group key={lane} ref={(node) => { lanes.current[lane] = node; }}>
          <mesh>
            <planeGeometry args={[1.9, 1.2]} />
            <meshBasicMaterial color={DIM} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]} scale={[Math.max(0.02, laneCaught(lane)), 1, 1]}>
            <planeGeometry args={[1.9, 1.2]} />
            <meshBasicMaterial color={PASS} transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.78, 0.02]} scale={[Math.max(0.02, laneFalseBlock(lane)), 1, 1]}>
            <planeGeometry args={[1.9, 0.26]} />
            <meshBasicMaterial color={STOP} transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* What it costs per event, on a log scale. */}
      {COST_BARS.map((bar, i) => (
        <mesh key={bar.key} ref={(node) => { costBars.current[i] = node; }}>
          <boxGeometry args={[0.46, 1, 0.46]} />
          <meshBasicMaterial color={i === 2 ? PASS : EDGE} transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

/* The share each configuration catches and wrongly blocks, read straight from the evidence file. */
function laneCaught(i: number) {
  return configurations[i]?.caught ?? 0;
}
function laneFalseBlock(i: number) {
  return configurations[i]?.falseBlock ?? 0;
}
