"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { HIDDEN, LAYER_X, NETS, OUTPUT_Y, slotY } from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Three networks, and where their outputs land.
 *
 * Each hidden unit is a solid with an edge running in from the input and another running out to
 * the output. Relabelling slides the units to new slots and takes their edges with them, which is
 * what makes "a name is not a parameter" something a reader watches rather than reads. A sign flip
 * turns a matched pair of edges over, and because the two flips cancel, the output does not move.
 *
 * Nothing here is a trained weight. The repository publishes none and claims none; what it does
 * is construct this relabelling and check it, and that is what is drawn.
 */

const UNIT = new THREE.Color("#5fb0d8");
const FLIP = new THREE.Color("#f0a03c");
const EDGE = new THREE.Color("#8ea6bd");
const AGREES = new THREE.Color("#4cc4b0");
const DIFFERS = new THREE.Color("#f0a03c");
const NODE = new THREE.Color("#e8eef2");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

/** One straight edge between two points, as a thin box oriented along it. */
function place(mesh: THREE.Mesh, from: THREE.Vector3, to: THREE.Vector3) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mesh.position.copy(mid);
  const delta = to.clone().sub(from);
  mesh.scale.set(1, 1, Math.max(0.0001, delta.length()));
  mesh.lookAt(to);
}

export default function IdentifiabilityWorldScene({ frame }: { frame: FrameRef }) {
  const units = useRef<(THREE.Mesh | null)[]>([]);
  const inEdges = useRef<(THREE.Mesh | null)[]>([]);
  const outEdges = useRef<(THREE.Mesh | null)[]>([]);
  const inputs = useRef<(THREE.Mesh | null)[]>([]);
  const outputs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const built = at(p, "second");
    const permuted = at(p, "permute");
    const flipped = at(p, "sign");
    const agreed = at(p, "agree");
    const tested = at(p, "unrelated");
    const limited = at(p, "limits");

    NETS.forEach((net, n) => {
      /*
       * The second network arrives with its own beat; the third only when the comparison needs
       * something it can reject. A check with nothing to reject is a demonstration.
       */
      const present =
        net.key === "first" ? 1 : net.key === "relabelled" ? built : tested;
      const fade = 1 - limited * 0.4;

      for (let i = 0; i < HIDDEN; i += 1) {
        const index = n * HIDDEN + i;
        /* The unit travels from its original slot to its relabelled one. */
        const slide = net.key === "first" ? 0 : permuted;
        const y = mix(slotY(i), slotY(net.slots[i]), slide);
        const turns = net.flipped[i] ? flipped : 0;

        const unit = units.current[index];
        if (unit) {
          unit.visible = present > 0.03;
          unit.position.set(LAYER_X.hidden, y, net.z);
          /* A sign flip is drawn as the unit turning over, because that is what it does. */
          unit.rotation.x = turns * Math.PI;
          const material = unit.material as THREE.MeshBasicMaterial;
          material.color.copy(net.flipped[i] && flipped > 0.3 ? FLIP : UNIT);
          material.opacity = present * fade * 0.9;
        }

        const into = inEdges.current[index];
        if (into) {
          into.visible = present > 0.03;
          place(
            into,
            new THREE.Vector3(LAYER_X.input, 0, net.z),
            new THREE.Vector3(LAYER_X.hidden, y, net.z),
          );
          const material = into.material as THREE.MeshBasicMaterial;
          material.color.copy(net.flipped[i] && flipped > 0.3 ? FLIP : EDGE);
          material.opacity = present * fade * (0.3 + permuted * 0.25);
        }

        const outOf = outEdges.current[index];
        if (outOf) {
          outOf.visible = present > 0.03;
          const landing = net.agrees ? OUTPUT_Y.agreeing : mix(OUTPUT_Y.agreeing, OUTPUT_Y.disagreeing, tested);
          place(
            outOf,
            new THREE.Vector3(LAYER_X.hidden, y, net.z),
            new THREE.Vector3(LAYER_X.output, landing, net.z),
          );
          const material = outOf.material as THREE.MeshBasicMaterial;
          material.color.copy(net.flipped[i] && flipped > 0.3 ? FLIP : EDGE);
          material.opacity = present * fade * (0.3 + permuted * 0.25);
        }
      }

      const input = inputs.current[n];
      if (input) {
        input.visible = present > 0.03;
        input.position.set(LAYER_X.input, 0, net.z);
        (input.material as THREE.MeshBasicMaterial).opacity = present * fade * 0.9;
      }

      /*
       * The output mark. The first two land on the same point and stay there; the third moves off
       * it once the comparison runs, which is the only thing that distinguishes it here.
       */
      const output = outputs.current[n];
      if (output) {
        output.visible = present > 0.03;
        const landing = net.agrees ? OUTPUT_Y.agreeing : mix(OUTPUT_Y.agreeing, OUTPUT_Y.disagreeing, tested);
        output.position.set(LAYER_X.output, landing, net.z);
        const material = output.material as THREE.MeshBasicMaterial;
        material.color.copy(net.agrees ? AGREES : DIFFERS);
        material.opacity = present * fade * (0.5 + agreed * 0.45);
        const size = 1 + (net.agrees ? agreed : tested) * 0.5;
        output.scale.setScalar(size);
      }
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {NETS.flatMap((net) =>
        Array.from({ length: HIDDEN }, (_, i) => {
          const index = NETS.indexOf(net) * HIDDEN + i;
          return (
            <group key={`${net.key}-${i}`}>
              <mesh ref={(node) => { units.current[index] = node; }}>
                <boxGeometry args={[0.6, 0.6, 0.6]} />
                <meshBasicMaterial color={UNIT} transparent depthWrite={false} opacity={0} />
              </mesh>
              <mesh ref={(node) => { inEdges.current[index] = node; }}>
                <boxGeometry args={[0.05, 0.05, 1]} />
                <meshBasicMaterial color={EDGE} transparent depthWrite={false} opacity={0} />
              </mesh>
              <mesh ref={(node) => { outEdges.current[index] = node; }}>
                <boxGeometry args={[0.05, 0.05, 1]} />
                <meshBasicMaterial color={EDGE} transparent depthWrite={false} opacity={0} />
              </mesh>
            </group>
          );
        }),
      )}

      {NETS.map((net, n) => (
        <mesh key={`in-${net.key}`} ref={(node) => { inputs.current[n] = node; }}>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshBasicMaterial color={NODE} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {NETS.map((net, n) => (
        <mesh key={`out-${net.key}`} ref={(node) => { outputs.current[n] = node; }}>
          <sphereGeometry args={[0.34, 20, 16]} />
          <meshBasicMaterial color={AGREES} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
