"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { CLASS_X, EXITS, ROAD, TOKENS, TRACK_X } from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A road that stops, and a vocabulary that separates.
 *
 * The first half animates a refusal: the request travels the road, meets a barrier, and halts.
 * Nothing continues past it, because nothing does - that is the decision the project is about, and
 * drawing a dotted line onward would undo it.
 *
 * The second half is the evidence. Every distinct word in the fixture is a token; the ones that
 * appear in exactly one class sit inside their class's column and the ones that are shared drift
 * to the middle. Almost nothing is in the middle.
 */

const ROADC = new THREE.Color("#39424a");
const GO = new THREE.Color("#4cc4b0");
const STOP = new THREE.Color("#f0a03c");
const GATE = new THREE.Color("#8ea6bd");
const INK = new THREE.Color("#dfe6ea");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function NlpWorldScene({ frame }: { frame: FrameRef }) {
  const rig = useRef<THREE.Group>(null);
  const request = useRef<THREE.Mesh>(null);
  const barrier = useRef<THREE.Mesh>(null);
  const exits = useRef<(THREE.Mesh | null)[]>([]);
  const tokens = useRef<THREE.InstancedMesh>(null);
  const columns = useRef<(THREE.Mesh | null)[]>([]);
  const trackBars = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(shot.swing, shot.height, shot.distance);
    /* The camera aims at whatever the beat is about: the junction behind it, then the vocabulary
     * four units further back. Aiming at a fixed point put the tokens below the frame entirely. */
    camera.lookAt(0, 0.5, shot.look);

    const closed = at(p, "closed");
    const gated = at(p, "gated");
    const fixture = at(p, "fixture");
    const exclusive = at(p, "exclusive");
    const separable = at(p, "separable");
    const tracked = at(p, "tracks");

    if (rig.current) rig.current.rotation.x = shot.tilt * 0.2;

    /* The junction half recedes once the argument moves to the vocabulary. */
    const junction = 1 - Math.max(fixture, tracked) * 0.85;

    /*
     * The request travels the road and stops where the loader stops it. Its position is driven by
     * the refusal beat rather than by a loop, so a reader scrubbing backwards un-stops it.
     */
    if (request.current) {
      const z = mix(ROAD.from, ROAD.junction, Math.min(1, closed * 1.6));
      request.current.position.set(0, 0.26, z);
      request.current.visible = junction > 0.05;
      const material = request.current.material as THREE.MeshBasicMaterial;
      material.color.copy(closed > 0.55 ? STOP : INK);
      material.opacity = junction;
    }

    /* The barrier across the default exit. It is the subject, so it arrives before the request. */
    if (barrier.current) {
      const on = Math.min(1, closed * 2.2);
      barrier.current.visible = on > 0.02 && junction > 0.05;
      barrier.current.position.set(0, 0.34 * on, ROAD.junction + 0.42);
      barrier.current.scale.set(1, on, 1);
      (barrier.current.material as THREE.MeshBasicMaterial).opacity = on * junction * 0.95;
    }

    EXITS.forEach((exit, i) => {
      const plate = exits.current[i];
      if (!plate) return;
      const on = exit.gated ? gated : exit.blocked ? closed : 0.45;
      plate.visible = junction > 0.05 && on > 0.02;
      plate.position.set(exit.x * (exit.gated ? gated : 1), 0.06, exit.z);
      plate.scale.set(on, 1, on);
      const material = plate.material as THREE.MeshBasicMaterial;
      material.color.copy(exit.blocked ? STOP : exit.gated ? GATE : GO);
      material.opacity = on * junction * 0.5;
    });

    /* ---- the vocabulary ---- */
    if (tokens.current) {
      const mesh = tokens.current;
      TOKENS.forEach((token, i) => {
        const on = fixture;
        /*
         * Exclusive words settle into their own column; shared words are drawn toward the middle.
         * Both start together, so the separation is something that happens rather than a layout.
         */
        const pull = token.exclusive ? separable : 0;
        const x = mix(token.x, token.exclusive ? CLASS_X[token.cls] + (token.x - CLASS_X[token.cls]) * 0.45 : token.x * 0.3, pull);
        P.set(x, token.y * on, token.z);
        S.setScalar(0.1 * on);
        Q.setFromAxisAngle(UP, 0);
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);
        C.copy(token.exclusive ? GO : STOP).lerp(INK, exclusive * (token.exclusive ? 0.18 : 0));
        mesh.setColorAt(i, C);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    /* A floor plate under each class, so the columns read as four groups rather than a cloud. */
    columns.current.forEach((plate, i) => {
      if (!plate) return;
      const on = separable;
      plate.visible = on > 0.02;
      plate.position.set(CLASS_X[i], 0.01, 5.2);
      plate.scale.set(on, 1, on);
      (plate.material as THREE.MeshBasicMaterial).opacity = on * 0.22;
    });

    /* The two tracks, as two plates the same size: they are evaluated the same way. */
    trackBars.current.forEach((bar, i) => {
      if (!bar) return;
      const on = tracked;
      bar.visible = on > 0.02;
      bar.position.set(TRACK_X[i], 0.1, 1.6);
      bar.scale.set(on, 1, on);
      (bar.material as THREE.MeshBasicMaterial).opacity = on * 0.6;
    });
  });

  return (
    <group ref={rig}>
      <ambientLight intensity={1} />

      {/* The road into the junction. */}
      <mesh position={[0, 0, (ROAD.from + ROAD.junction) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.1, ROAD.junction - ROAD.from]} />
        <meshBasicMaterial color={ROADC} transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={request}>
        <boxGeometry args={[0.34, 0.34, 0.34]} />
        <meshBasicMaterial color={INK} transparent opacity={1} />
      </mesh>

      <mesh ref={barrier}>
        <boxGeometry args={[1.5, 0.68, 0.1]} />
        <meshBasicMaterial color={STOP} transparent opacity={0} />
      </mesh>

      {EXITS.map((exit, i) => (
        <mesh key={exit.key} ref={(node) => { exits.current[i] = node; }} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 1.0]} />
          <meshBasicMaterial color={GO} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}

      <instancedMesh args={[undefined, undefined, TOKENS.length]} ref={tokens}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>

      {CLASS_X.map((x, i) => (
        <mesh key={x} ref={(node) => { columns.current[i] = node; }} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.7, 3.0]} />
          <meshBasicMaterial color={GO} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {TRACK_X.map((x, i) => (
        <mesh key={x} ref={(node) => { trackBars.current[i] = node; }} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 1.2]} />
          <meshBasicMaterial color={GATE} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
