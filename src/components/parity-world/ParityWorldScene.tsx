"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { BLOCK, CLOSEST, FIXTURE_Y, GUARDS, HITS, LANES, SCORE_HEIGHT, TIE } from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Two stacks that have to match, and the four thousandths between the top two blocks.
 *
 * Both lanes are drawn from the same scores, because that is what the test asserts: the Java and
 * Python rankings are not similar, they are identical. What the world is actually about is the
 * distance between the first and second blocks - small enough that the implementation has to
 * give up an inverted index to keep it on the right side of zero.
 */

const JAVA = new THREE.Color("#5fb0d8");
const PYTHON = new THREE.Color("#4cc4b0");
const PAIR = new THREE.Color("#f0a03c");
const TIE_C = new THREE.Color("#b49ae0");
const AXIS_C = new THREE.Color("#5c6873");
const GUARD = new THREE.Color("#8ea6bd");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function ParityWorldScene({ frame }: { frame: FrameRef }) {
  const blocks = useRef<(THREE.Mesh | null)[]>([]);
  const gap = useRef<THREE.Mesh>(null);
  const tie = useRef<THREE.Mesh>(null);
  const guards = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const twice = at(p, "both");
    const near = at(p, "close");
    const tied = at(p, "tie");
    const ordered = at(p, "order");
    const guarded = at(p, "guards");
    const sized = at(p, "fixture");

    const stacks = 1 - guarded * 0.75;

    [LANES.java, LANES.python].forEach((z, lane) => {
      HITS.forEach((hit, i) => {
        const block = blocks.current[lane * HITS.length + i];
        if (!block) return;
        /* The Python lane arrives second, and arriving identically is the assertion. */
        const on = (lane === 0 ? 1 : twice) * stacks;
        block.visible = on > 0.03;
        block.position.set(0, hit.y, z);
        block.scale.setScalar(Math.max(0.0001, on));
        const material = block.material as THREE.MeshBasicMaterial;
        /* The top two take the pair colour once the beat about them arrives. */
        const isPair = i < 2;
        material.color.copy(isPair && near > 0.25 ? PAIR : lane === 0 ? JAVA : PYTHON);
        material.opacity = on * (isPair ? 0.92 : 0.55 - ordered * 0.15);
      });
    });

    /*
     * The gap itself, as a solid between the two blocks it separates.
     *
     * It is 0.004211 of eighteen points, so at any distance that holds the whole ranking it is
     * nothing. The shot table goes and looks at it instead of drawing it bigger.
     */
    if (gap.current) {
      const on = near * stacks;
      gap.current.visible = on > 0.02;
      const height = (CLOSEST.upper - CLOSEST.lower) * on;
      gap.current.position.set(0, CLOSEST.lower + height / 2, 0);
      gap.current.scale.set(1, Math.max(0.0001, height), 1);
      (gap.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }

    /* The exact tie, where the same drawing has no height left in it at all. */
    if (tie.current) {
      const on = tied * stacks;
      tie.current.visible = on > 0.02;
      tie.current.position.set(0, TIE.y, 0);
      tie.current.scale.set(Math.max(0.0001, on), 1, Math.max(0.0001, on));
      (tie.current.material as THREE.MeshBasicMaterial).opacity = on * 0.85;
    }

    /* The three refusals, as objects on a shelf below the ranking they protect. */
    GUARDS.forEach((guard, i) => {
      const block = guards.current[i];
      if (!block) return;
      const on = Math.max(0, Math.min(1, (guarded - i * 0.14) / 0.5)) * (1 - sized * 0.5);
      block.visible = on > 0.02;
      block.position.set(guard.x, FIXTURE_Y, 0);
      block.scale.setScalar(Math.max(0.0001, on));
      (block.material as THREE.MeshBasicMaterial).opacity = on * 0.8;
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {/* The score axis both lanes are read off. */}
      <mesh position={[0, SCORE_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.05, SCORE_HEIGHT, 0.05]} />
        <meshBasicMaterial color={AXIS_C} transparent depthWrite={false} opacity={0.4} />
      </mesh>

      {[LANES.java, LANES.python].flatMap((z, lane) =>
        HITS.map((hit, i) => (
          <mesh
            key={`hit-${lane}-${hit.id}`}
            ref={(node) => { blocks.current[lane * HITS.length + i] = node; }}
          >
            <boxGeometry args={[BLOCK.width, BLOCK.height, BLOCK.depth]} />
            <meshBasicMaterial color={JAVA} transparent depthWrite={false} opacity={0} />
          </mesh>
        )),
      )}

      <mesh ref={gap}>
        <boxGeometry args={[0.28, 1, 0.28]} />
        <meshBasicMaterial color={PAIR} transparent depthWrite={false} opacity={0} />
      </mesh>

      {/* A tie has no height, so it is drawn as one plate where two blocks would be. */}
      <mesh ref={tie}>
        <boxGeometry args={[BLOCK.width * 1.3, 0.05, BLOCK.depth * 1.3]} />
        <meshBasicMaterial color={TIE_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      {GUARDS.map((guard, i) => (
        <mesh key={guard.key} ref={(node) => { guards.current[i] = node; }}>
          <boxGeometry args={[1.3, 0.7, 1.3]} />
          <meshBasicMaterial color={GUARD} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}
    </group>
  );
}
