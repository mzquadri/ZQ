"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import { BAND, BAND_HEIGHT, BAND_THICKNESS, COMPARISON, ROWS, px } from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * Five intervals and one slab.
 *
 * The slab is the range of F1 consistent with every contender at once, and the intervals that meet
 * it run through it rather than stopping at it. That is the difference between a shaded region on
 * a chart and an intersection: a reader can see which bars are pierced.
 *
 * The one model the run does separate stays clear of the slab entirely, which is what makes the
 * other three reading as indistinguishable a finding rather than a limitation of the drawing.
 */

const MARK = new THREE.Color("#5fb0d8");
const SPLIT = new THREE.Color("#5c6873");
const BAND_C = new THREE.Color("#5fb0d8");
const CLEAR = new THREE.Color("#4cc4b0");
const WARN = new THREE.Color("#f0a03c");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

export default function WaterWorldScene({ frame }: { frame: FrameRef }) {
  const splits = useRef<(THREE.Mesh | null)[]>([]);
  const means = useRef<(THREE.Mesh | null)[]>([]);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const slab = useRef<THREE.Mesh>(null);
  const gapBar = useRef<THREE.Mesh>(null);
  const spreadBar = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    /*
     * Aim right of centre by a share of the current frame width, so the axis clears the caption
     * plate at every distance. Swing is an offset from that aim rather than an absolute x, so
     * closing in on the contenders never slews the camera off the axis.
     */
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const moved = at(p, "crossval");
    const opened = at(p, "intervals");
    const banded = at(p, "band");
    const through = at(p, "through");
    const apart = at(p, "separated");
    const compared = at(p, "spread");

    /* The rows leave entirely for the closing comparison, which is drawn somewhere else on the axis. */
    const rows = 1 - compared;

    ROWS.forEach((row, i) => {
      const splitX = px(row.split);
      const meanX = row.mean === null ? splitX : px(row.mean);

      /* The published single-split mark stays as a ghost once the model has been re-measured. */
      const ghost = splits.current[i];
      if (ghost) {
        ghost.position.set(splitX, row.y, row.z);
        /* Not drawn until the mark has somewhere to have come from: at rest it sits exactly
         * where the mark does, and a zero-opacity mesh still writes depth over it. */
        ghost.visible = rows > 0.05 && moved > 0.02;
        (ghost.material as THREE.MeshBasicMaterial).opacity = rows * 0.3 * moved;
      }

      /* The mark travels from the split score to the cross-validated mean: a re-measurement. */
      const mark = means.current[i];
      if (mark) {
        mark.position.set(mix(splitX, meanX, moved), row.y, row.z);
        mark.visible = rows > 0.05;
        const material = mark.material as THREE.MeshBasicMaterial;
        material.color.copy(row.isSeparated && apart > 0.3 ? CLEAR : MARK);
        material.opacity = rows * 0.95;
      }

      /* The interval, where one was recorded. The tuned model has none, so none is drawn. */
      const bar = bars.current[i];
      if (bar) {
        const has = row.mean !== null && row.sd > 0;
        const on = has ? opened : 0;
        bar.visible = on > 0.02 && rows > 0.05;
        const lo = px((row.mean ?? 0) - row.sd);
        const hi = px((row.mean ?? 0) + row.sd);
        const width = (hi - lo) * on;
        bar.position.set(meanX, row.y, row.z);
        bar.scale.set(Math.max(0.0001, width), 1, 1);
        const material = bar.material as THREE.MeshBasicMaterial;
        material.color.copy(row.isSeparated && apart > 0.3 ? CLEAR : MARK);
        /* A bar that meets the band brightens as the band arrives; the separated one does not. */
        material.opacity = rows * on * (row.contender ? 0.72 + through * 0.24 : 0.5);
      }
    });

    /* The slab: the range every contender could be sitting in. */
    if (slab.current) {
      const on = banded * rows;
      slab.current.visible = on > 0.02;
      const width = (BAND.to - BAND.from) * on;
      slab.current.position.set((BAND.from + BAND.to) / 2, 0, 0);
      slab.current.scale.set(Math.max(0.0001, width), 1, 1);
      (slab.current.material as THREE.MeshBasicMaterial).opacity = on * (0.22 + through * 0.2);
    }

    /*
     * The closing comparison, from a common origin: the smallest gap the table ranks on against
     * the widest fold-to-fold spread in the same run. Same axis, same scale, so the one being
     * longer is a measurement rather than an assertion.
     */
    if (gapBar.current) {
      const on = compared;
      gapBar.current.visible = on > 0.02;
      gapBar.current.position.set(COMPARISON.origin + (COMPARISON.gap * on) / 2, 0.42, 0);
      gapBar.current.scale.set(Math.max(0.0001, COMPARISON.gap * on), 1, 1);
      (gapBar.current.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    }
    if (spreadBar.current) {
      const on = compared;
      spreadBar.current.visible = on > 0.02;
      spreadBar.current.position.set(COMPARISON.origin + (COMPARISON.spread * on) / 2, -0.42, 0);
      spreadBar.current.scale.set(Math.max(0.0001, COMPARISON.spread * on), 1, 1);
      (spreadBar.current.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    }
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {ROWS.map((row, i) => (
        <mesh key={`split-${row.name}`} ref={(node) => { splits.current[i] = node; }}>
          <sphereGeometry args={[0.17, 14, 12]} />
          <meshBasicMaterial color={SPLIT} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      {ROWS.map((row, i) => (
        <mesh key={`mean-${row.name}`} ref={(node) => { means.current[i] = node; }}>
          <sphereGeometry args={[0.26, 18, 14]} />
          <meshBasicMaterial color={MARK} transparent depthWrite={false} opacity={0.95} />
        </mesh>
      ))}

      {ROWS.map((row, i) => (
        <mesh key={`bar-${row.name}`} ref={(node) => { bars.current[i] = node; }}>
          <boxGeometry args={[1, 0.3, 0.3]} />
          <meshBasicMaterial color={MARK} transparent depthWrite={false} opacity={0} />
        </mesh>
      ))}

      <mesh ref={slab}>
        {/* A wall standing clear of the stack top and bottom, with thickness to be passed through. */}
        <boxGeometry args={[1, BAND_HEIGHT, BAND_THICKNESS]} />
        <meshBasicMaterial color={BAND_C} transparent depthWrite={false} opacity={0} />
      </mesh>

      <mesh ref={gapBar}>
        <boxGeometry args={[1, 0.14, 0.14]} />
        <meshBasicMaterial color={CLEAR} transparent depthWrite={false} opacity={0} />
      </mesh>
      <mesh ref={spreadBar}>
        <boxGeometry args={[1, 0.14, 0.14]} />
        <meshBasicMaterial color={WARN} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  );
}
