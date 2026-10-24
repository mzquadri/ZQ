"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots } from "@/components/worlds/choreography";
import type { WorldFrame } from "@/components/world/WorldStage";
import {
  AGED_Z,
  AXIS_WIDTH,
  DEPTH,
  DETAIL,
  FRESH_Z,
  GRID,
  MISREAD,
  SPLIT_Z,
  VOLT_SPAN,
  surfacePoint,
} from "./geometry";
import { PLATE_BIAS, SHOTS, STATES, at } from "./states";

/**
 * The generator's own surface, evaluated.
 *
 * Nothing here is sampled from a cell. `ocv` is transcribed from `src/data_loader.py` and called
 * on a grid, so the sheet a reader sees is the function the repository ships rather than a picture
 * of it - and the two things the project is about, that the sheet barely tilts with age and that a
 * lookup built on its fresh edge therefore drifts, are properties of the function rather than
 * decisions taken while drawing.
 */

const SHEET = new THREE.Color("#5fb0d8");
const FRESH = new THREE.Color("#4cc4b0");
const AGED = new THREE.Color("#f0a03c");
const TRUTH = new THREE.Color("#e8eef2");
const HELD = new THREE.Color("#8ea6bd");

export type Frame = WorldFrame;
type FrameRef = RefObject<Frame | null>;

/** The sheet, as a grid of quads over the generator's two inputs. */
function sheetGeometry() {
  const positions: number[] = [];
  for (let i = 0; i < GRID.soc; i += 1) {
    for (let j = 0; j < GRID.cycle; j += 1) {
      const a = surfacePoint(i / GRID.soc, j / GRID.cycle);
      const b = surfacePoint((i + 1) / GRID.soc, j / GRID.cycle);
      const c = surfacePoint((i + 1) / GRID.soc, (j + 1) / GRID.cycle);
      const d = surfacePoint(i / GRID.soc, (j + 1) / GRID.cycle);
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      positions.push(a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** One edge of the sheet, as a tube of segments along state of charge at a fixed cycle. */
function edgeGeometry(cycleT: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= GRID.soc; i += 1) {
    const p = surfacePoint(i / GRID.soc, cycleT);
    points.push(new THREE.Vector3(p.x, p.y, p.z));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), GRID.soc, 0.045, 6, false);
}

export default function BatteryWorldScene({ frame }: { frame: FrameRef }) {
  const cycleAxis = useRef<THREE.Group>(null);
  const sheet = useRef<THREE.Mesh>(null);
  const fresh = useRef<THREE.Mesh>(null);
  const aged = useRef<THREE.Mesh>(null);
  const reading = useRef<THREE.Mesh>(null);
  const truth = useRef<THREE.Mesh>(null);
  const reads = useRef<THREE.Mesh>(null);
  const gap = useRef<THREE.Mesh>(null);
  const held = useRef<THREE.Mesh>(null);

  const sheetMesh = useMemo(() => sheetGeometry(), []);
  const freshEdge = useMemo(() => edgeGeometry(0), []);
  const agedEdge = useMemo(() => edgeGeometry(1), []);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    const lens = camera as THREE.PerspectiveCamera;
    const frameWidth = 2 * shot.distance * Math.tan((lens.fov * Math.PI) / 360) * lens.aspect;
    const aim = shot.target - frameWidth * PLATE_BIAS;
    camera.position.set(aim + shot.swing, shot.aimY + shot.height, shot.distance);
    camera.lookAt(aim, shot.aimY, shot.look);

    const swept = at(p, "cycles");
    const tilted = at(p, "flat");
    const close = at(p, "detail");
    const wrong = at(p, "misread");
    const splitOff = at(p, "split");
    const limited = at(p, "limits");

    /*
     * The cycle axis folds away for the close beats, and that is the argument rather than a
     * convenience.
     *
     * Two edges separated by two per cent of the voltage axis and by the whole depth of the sheet
     * cannot be compared in perspective: at a distance short enough to see the voltage gap, the
     * near edge is twice the size of the far one and a reader would read that difference as the
     * ageing. Folding the cycle axis to nothing leaves exactly what a gauge has - two curves on one
     * voltage-against-charge plane, no cycle number anywhere - which is the situation the project
     * is about and the view its flat figure draws.
     */
    if (cycleAxis.current) {
      cycleAxis.current.scale.z = 1 - Math.max(close, wrong) * 0.97;
    }

    /* The sheet exists once the curve has been swept across every cycle the generator runs. */
    if (sheet.current) {
      const on = swept;
      sheet.current.visible = on > 0.02;
      (sheet.current.material as THREE.MeshBasicMaterial).opacity = on * (0.42 - limited * 0.18);
    }

    /* The fresh edge is the lookup table. It is present from the first frame; the curve is it. */
    if (fresh.current) {
      (fresh.current.material as THREE.MeshBasicMaterial).opacity = 0.95 - limited * 0.35;
    }

    /* The aged edge arrives with the sweep and brightens once the two are worth telling apart. */
    if (aged.current) {
      const on = swept;
      aged.current.visible = on > 0.02;
      (aged.current.material as THREE.MeshBasicMaterial).opacity =
        on * (0.45 + tilted * 0.25 + close * 0.25) * (1 - limited * 0.35);
    }

    /*
     * The reading itself, as a plane at the voltage the aged cell reports.
     *
     * A gauge does not know about cycles. It has one number and one curve, so the horizontal
     * plane is the whole of what it sees, and where that plane meets the fresh edge is its answer.
     */
    if (reading.current) {
      const on = wrong;
      reading.current.visible = on > 0.02;
      reading.current.position.set(DETAIL.centre, MISREAD.volts, 0);
      reading.current.scale.set(Math.max(0.0001, on), 1, 1);
      (reading.current.material as THREE.MeshBasicMaterial).opacity = on * 0.26;
    }

    /* Where the cell actually is, and where the lookup says it is. */
    if (truth.current) {
      const on = wrong;
      truth.current.visible = on > 0.02;
      truth.current.position.set(MISREAD.truthX, MISREAD.volts, AGED_Z);
      (truth.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }
    if (reads.current) {
      const on = wrong;
      reads.current.visible = on > 0.02;
      reads.current.position.set(MISREAD.readsX, MISREAD.volts, FRESH_Z);
      (reads.current.material as THREE.MeshBasicMaterial).opacity = on * 0.95;
    }

    /* The charge the lookup gives away, as a length along the axis it is measured on. */
    if (gap.current) {
      const on = wrong;
      gap.current.visible = on > 0.02;
      const width = (MISREAD.truthX - MISREAD.readsX) * on;
      gap.current.position.set(MISREAD.readsX + width / 2, MISREAD.volts - 0.12, FRESH_Z);
      gap.current.scale.set(Math.max(0.0001, Math.abs(width)), 1, 1);
      (gap.current.material as THREE.MeshBasicMaterial).opacity = on * 0.9;
    }

    /*
     * The held-back cycles, as a slab over the end of the depth axis.
     *
     * Held back whole rather than sampled, which is the point: the split is on cycle number and
     * nothing is shuffled, so the test rows have no near-duplicate twin left behind in training.
     */
    if (held.current) {
      const on = splitOff * (1 - limited * 0.5);
      held.current.visible = on > 0.02;
      const depth = (DEPTH / 2 - SPLIT_Z) * on;
      held.current.position.set(0, (VOLT_SPAN.low + VOLT_SPAN.high) / 2, SPLIT_Z + depth / 2);
      held.current.scale.set(1, 1, Math.max(0.0001, depth));
      (held.current.material as THREE.MeshBasicMaterial).opacity = on * 0.22;
    }
  });

  return (
    <group>
      <ambientLight intensity={1} />

      {/* Everything positioned along the cycle axis, so one scale folds all of it together. */}
      <group ref={cycleAxis}>

        <mesh ref={sheet} geometry={sheetMesh}>
          <meshBasicMaterial color={SHEET} transparent depthWrite={false} side={THREE.DoubleSide} opacity={0} />
        </mesh>

        <mesh ref={fresh} geometry={freshEdge}>
          <meshBasicMaterial color={FRESH} transparent depthWrite={false} opacity={0.95} />
        </mesh>
        <mesh ref={aged} geometry={agedEdge}>
          <meshBasicMaterial color={AGED} transparent depthWrite={false} opacity={0} />
        </mesh>

        {/* The voltage the aged cell reports, as a plane across the window being looked at. */}
        <mesh ref={reading}>
          <boxGeometry args={[DETAIL.to - DETAIL.from, 0.012, DEPTH]} />
          <meshBasicMaterial color={TRUTH} transparent depthWrite={false} opacity={0} />
        </mesh>

        <mesh ref={truth}>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshBasicMaterial color={TRUTH} transparent depthWrite={false} opacity={0} />
        </mesh>
        <mesh ref={reads}>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshBasicMaterial color={AGED} transparent depthWrite={false} opacity={0} />
        </mesh>

        <mesh ref={gap}>
          <boxGeometry args={[1, 0.035, 0.035]} />
          <meshBasicMaterial color={AGED} transparent depthWrite={false} opacity={0} />
        </mesh>

      </group>

      <mesh ref={held}>
        <boxGeometry args={[AXIS_WIDTH, VOLT_SPAN.high - VOLT_SPAN.low, 1]} />
        <meshBasicMaterial color={HELD} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  );
}
