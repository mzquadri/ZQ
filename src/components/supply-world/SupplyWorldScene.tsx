"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { BAR, FORMULA_X, MERGED, SEGMENTS, SOURCES, SOURCE_Z } from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A composite, its sources, and two ties that land on the same column.
 *
 * The bar is the score and a segment's width is its weight, so proportion is never asserted. The
 * columns behind it are the distinct signals - four, not five - and the lines between are what
 * each segment is normalised from. Two of those lines converge, which is the finding, and it is
 * the one thing in this project that a diagram can show better than a sentence can.
 */

const SEG = new THREE.Color("#7aa7f0");
const DUPE = new THREE.Color("#f0a03c");
const COLUMN = new THREE.Color("#5c6873");
const TIE = new THREE.Color("#8ea6bd");
const INK = new THREE.Color("#dfe6ea");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function SupplyWorldScene({ frame }: { frame: FrameRef }) {
  const segments = useRef<(THREE.Mesh | null)[]>([]);
  const columns = useRef<(THREE.Mesh | null)[]>([]);
  const ties = useRef<(THREE.Line | null)[]>([]);
  const formulas = useRef<(THREE.Mesh | null)[]>([]);

  /* One line geometry per segment; the vertices are rewritten each frame as the segments move. */
  const tieGeometries = useMemo(
    () => SEGMENTS.map(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()])),
    [],
  );

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(shot.swing, shot.height, shot.distance);
    camera.lookAt(0, 0.2, shot.look);

    const sourced = at(p, "sources");
    const converge = at(p, "converge");
    const merge = at(p, "merge");
    const remaining = at(p, "remaining");
    const classical = at(p, "classical");
    const withheld = at(p, "withheld");

    /* The bar and its ties recede while the inventory formulas have the frame. */
    const main = 1 - Math.max(classical * 0.75, withheld * 0.85);

    SEGMENTS.forEach((segment, i) => {
      const mesh = segments.current[i];
      if (!mesh) return;

      /*
       * The second duplicate slides back over the first and both end as one block: the first
       * stays where it is and grows to the whole duplicated share, the second shrinks to nothing
       * as it arrives. Collapsing them is the claim, so it is drawn as a collapse.
       */
      const isSecondDupe = segment.duplicate && i === 1;
      const width = segment.duplicate
        ? i === 0
          ? mix(segment.width, MERGED.width, merge)
          : mix(segment.width, 0.0001, merge)
        : segment.width;
      const x = isSecondDupe ? mix(segment.x, MERGED.x, merge) : segment.duplicate ? mix(segment.x, MERGED.x, merge) : segment.x;

      mesh.position.set(x, BAR.y, 0);
      /* A gap between segments, so a weighted sum reads as five parts rather than one slab. */
      mesh.scale.set(Math.max(0.0001, width - 0.08), 1, 1);
      mesh.visible = width > 0.01 && main > 0.05;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.color.copy(segment.duplicate && converge > 0.2 ? DUPE : SEG);
      material.opacity = main * (segment.duplicate ? 0.6 + converge * 0.35 : 0.42 + (i % 2) * 0.16);

      /* The tie from this segment back to the column it is normalised from. */
      const line = ties.current[i];
      if (line) {
        const on = sourced * main * (isSecondDupe ? 1 - merge : 1);
        line.visible = on > 0.02;
        const source = SOURCES[segment.source] ?? SOURCES[0];
        const geometry = tieGeometries[i];
        const positions = geometry.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, x, BAR.y - BAR.height / 2, 0);
        positions.setXYZ(1, source.x, BAR.y - BAR.height / 2, mix(0, SOURCE_Z, sourced));
        positions.needsUpdate = true;
        geometry.computeBoundingSphere();
        const material = line.material as THREE.LineBasicMaterial;
        material.color.copy(segment.duplicate && converge > 0.2 ? DUPE : TIE);
        material.opacity = on * (segment.duplicate ? 1 : 0.7);
      }
    });

    /* The source columns. One of them carries two ties, which is why there are four and not five. */
    SOURCES.forEach((source, i) => {
      const column = columns.current[i];
      if (!column) return;
      const on = sourced * main;
      column.visible = on > 0.02;
      const height = mix(0.0001, 1.1, on) * (i === 0 ? 1 + converge * 0.35 : 1);
      column.position.set(source.x, height / 2 - 0.3, SOURCE_Z);
      column.scale.set(1, height, 1);
      const material = column.material as THREE.MeshBasicMaterial;
      material.color.copy(i === 0 && converge > 0.2 ? DUPE : COLUMN);
      material.opacity = on * 0.7;
    });

    /* The three classical formulas, as three plates of equal size: none is in question. */
    FORMULA_X.forEach((x, i) => {
      const plate = formulas.current[i];
      if (!plate) return;
      const on = classical * (1 - withheld * 0.8);
      plate.visible = on > 0.02;
      plate.position.set(x, 0.2, 1.8);
      plate.scale.set(on, on, 1);
      (plate.material as THREE.MeshBasicMaterial).opacity = on * 0.55;
    });

    /* Marking what is left: the largest independent term, once the duplicates have collapsed. */
    SEGMENTS.forEach((segment, i) => {
      const mesh = segments.current[i];
      if (!mesh || segment.duplicate) return;
      const material = mesh.material as THREE.MeshBasicMaterial;
      if (remaining > 0.2 && segment.weight === Math.max(...SEGMENTS.filter((s) => !s.duplicate).map((s) => s.weight))) {
        material.color.copy(SEG).lerp(INK, remaining * 0.5);
      }
    });
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {SEGMENTS.map((segment, i) => (
        <mesh key={segment.key} ref={(node) => { segments.current[i] = node; }}>
          <boxGeometry args={[1, BAR.height, BAR.depth]} />
          <meshBasicMaterial color={SEG} transparent opacity={0.5} />
        </mesh>
      ))}

      {SOURCES.map((source, i) => (
        <mesh key={source.index} ref={(node) => { columns.current[i] = node; }}>
          <boxGeometry args={[0.46, 1, 0.46]} />
          <meshBasicMaterial color={COLUMN} transparent opacity={0} />
        </mesh>
      ))}

      {SEGMENTS.map((segment, i) => (
        <line key={`tie-${segment.key}`} ref={(node) => { ties.current[i] = node as unknown as THREE.Line; }}>
          <primitive attach="geometry" object={tieGeometries[i]} />
          <lineBasicMaterial color={TIE} transparent opacity={0} />
        </line>
      ))}

      {FORMULA_X.map((x, i) => (
        <mesh key={x} ref={(node) => { formulas.current[i] = node; }}>
          <planeGeometry args={[1.7, 0.72]} />
          <meshBasicMaterial color={TIE} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
