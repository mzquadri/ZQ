"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import { result } from "@/content/cifar-world";
import {
  CELL,
  KERNEL,
  PIXELS,
  RAIL_Z,
  classBars,
  fieldPath,
  layout,
  matrix,
  matrixMax,
  pixelPosition,
  pixels,
  railMax,
  rails,
  tileSize,
  worstCell,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * An imaging machine, entered from the front.
 *
 * The reader starts looking straight at a 32-pixel plate, gets close enough that the pixels become
 * objects, watches a three-by-three window move over them, and then travels backwards through the
 * stack as it narrows and deepens. The last third leaves the single image behind and shows what
 * the finished model does to ten thousand of them.
 *
 * Colour is doing one job. The pixels are the dataset's own RGB and are never recoloured. Teal is
 * a correct outcome, amber is a wrong one, and neutral is structure - so the amber block that
 * appears in the confusion state is the only warm thing on screen at that moment.
 */

const FRAME = new THREE.Color("#39424a");
const PLANE = new THREE.Color("#8ca3b5");
const CORRECT = new THREE.Color("#4cc4b0");
const WRONG = new THREE.Color("#f0a03c");
const NEUTRAL = new THREE.Color("#e8edf1");
const DIM = new THREE.Color("#2b333a");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/* Deterministic per-tile offsets, so the explosion is identical on every load. */
function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

/* ------------------------------------------------------------------ */
/* The image, as 1,024 real pixels.                                     */
/* ------------------------------------------------------------------ */

function PixelPlate({
  frame,
  flip,
  offset,
  show,
}: {
  frame: FrameRef;
  /** Horizontal flip, for the augmentation copy. RandomHorizontalFlip is in the config. */
  flip?: boolean;
  /** Crop shift in tiles, for the augmentation copy. RandomCrop(32, pad=4) is in the config. */
  offset?: { x: number; y: number };
  show?: Parameters<typeof at>[1];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = PIXELS * PIXELS;

  /*
   * Colour is applied per instance with setColorAt rather than through a vertex-colour attribute.
   * The first attempt attached a 1,024-entry array as `geometry-attributes-color`, which three
   * reads per vertex of the box, not per instance - so the counts never lined up.
   */
  const painted = useRef(false);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const mesh = ref.current;
    if (!mesh) return;

    const on = show ? at(p, show) * (1 - at(p, "field")) : 1;
    const apart = at(p, "pixels") * (1 - at(p, "features"));
    const gone = at(p, "features");

    mesh.visible = on > 0.02 && gone < 0.98;
    (mesh.material as THREE.MeshBasicMaterial).opacity = on * (1 - gone);

    if (!painted.current) {
      for (let r = 0; r < PIXELS; r += 1) {
        for (let c = 0; c < PIXELS; c += 1) {
          const [red, green, blue] = pixels[r][c];
          /* The dataset's own sRGB bytes, converted into the renderer's working space. */
          C.setRGB(red / 255, green / 255, blue / 255, THREE.SRGBColorSpace);
          mesh.setColorAt(r * PIXELS + c, C);
        }
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      painted.current = true;
    }

    for (let r = 0; r < PIXELS; r += 1) {
      for (let c = 0; c < PIXELS; c += 1) {
        const i = r * PIXELS + c;
        const base = pixelPosition(r, flip ? PIXELS - 1 - c : c);
        /* Tiles separate and lift out of the plate rather than sliding apart in-plane, so the
           reader sees a surface becoming a set of objects. */
        const lift = (hash(i) - 0.5) * 0.5 * apart;
        P.set(
          base.x + (offset?.x ?? 0) * tileSize,
          base.y + (offset?.y ?? 0) * tileSize,
          lift,
        );
        const s = tileSize * mix(1.0, 0.82, apart);
        S.set(s, s, mix(0.02, 0.06, apart));
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, count]} ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} transparent />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */
/* The 3x3 window.                                                      */
/* ------------------------------------------------------------------ */

function ReceptiveField({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const show = Math.max(0, at(p, "field") - at(p, "features") * 2.2);
    node.visible = show > 0.02;

    const step = Math.min(fieldPath.length - 1, Math.floor(at(p, "field") * fieldPath.length));
    const { row, col } = fieldPath[step];
    const pos = pixelPosition(row, col);
    node.position.set(pos.x, pos.y, 0.16);
    node.scale.setScalar(tileSize * KERNEL);

    const outline = node.children[0] as THREE.LineSegments;
    (outline.material as THREE.LineBasicMaterial).opacity = show;
    const glow = node.children[1] as THREE.Mesh;
    (glow.material as THREE.MeshBasicMaterial).opacity = show * 0.18;
  });

  const outline = useMemo(() => {
    const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 0.3));
    return new THREE.LineSegments(
      g,
      new THREE.LineBasicMaterial({ color: CORRECT, opacity: 0, transparent: true }),
    );
  }, []);

  return (
    <group ref={group} visible={false}>
      <primitive object={outline} />
      <mesh>
        <boxGeometry args={[1, 1, 0.3]} />
        <meshBasicMaterial color={CORRECT} depthWrite={false} opacity={0} transparent />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The stack: four stages at their real shapes.                         */
/* ------------------------------------------------------------------ */

function Stack({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  /* One flat plane per sampled channel, plus a frame per stage. */
  const stageMeta = useMemo(
    () =>
      layout.slice(1).map((s) => ({
        ...s,
        keys: Array.from({ length: s.planes }, (_, k) => k),
      })),
    [],
  );

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;

    const arrive = at(p, "features");
    const spread = at(p, "compress");
    const leaving = at(p, "decision");

    node.visible = arrive > 0.02;

    stageMeta.forEach((stage, si) => {
      /* Each stage is its own group, so its planes are one level down - flat-indexing the parent
         walked off the end and left every material undefined. */
      const holder = node.children[si] as THREE.Group;
      if (!holder) return;
      /* Later stages arrive later, so the stack builds rather than appearing at once. */
      const own = Math.max(0, Math.min(1, (arrive + spread * 1.4 - si * 0.28) / 0.7));
      stage.keys.forEach((k) => {
        const plane = holder.children[k] as THREE.Mesh;
        const material = plane.material as THREE.MeshBasicMaterial;
        material.opacity = own * mix(0.22, 0.5, spread) * (1 - leaving * 0.85);
        const fan = (k - (stage.planes - 1) / 2) * mix(0.02, 0.11, spread);
        plane.position.set(0, 0, stage.z + fan);
        const w = stage.width * own;
        plane.scale.set(Math.max(0.01, w), Math.max(0.01, stage.spatialStage ? w : w * 0.28), 1);
      });

      const frameMesh = holder.children[stage.planes] as THREE.LineSegments;
      (frameMesh.material as THREE.LineBasicMaterial).opacity = own * 0.55 * (1 - leaving);
      frameMesh.position.set(0, 0, stage.z);
      frameMesh.scale.set(
        stage.width * 1.08,
        stage.spatialStage ? stage.width * 1.08 : stage.width * 0.34,
        1,
      );
    });
  });

  const frames = useMemo(
    () =>
      stageMeta.map(() => {
        const g = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1));
        return new THREE.LineSegments(
          g,
          new THREE.LineBasicMaterial({ color: FRAME, opacity: 0, transparent: true }),
        );
      }),
    [stageMeta],
  );

  return (
    <group ref={group} visible={false}>
      {stageMeta.map((stage, si) => (
        <group key={stage.name}>
          {stage.keys.map((k) => (
            <mesh key={k}>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                color={PLANE}
                depthWrite={false}
                opacity={0}
                side={THREE.DoubleSide}
                transparent
              />
            </mesh>
          ))}
          <primitive object={frames[si]} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Ten rails: where the 1,000 real test cats actually landed.           */
/* ------------------------------------------------------------------ */

function Rails({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const show = Math.max(0, at(p, "decision") - at(p, "spread") * 2.2);
    node.visible = show > 0.02;

    node.children.forEach((child, i) => {
      const bar = child as THREE.Mesh;
      const rail = rails[i];
      const h = (rail.count / railMax) * 2.1 * show;
      bar.scale.set(1, Math.max(0.01, h), 1);
      bar.position.set(rail.x, h / 2, RAIL_Z);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = show * 0.9;
      /*
       * The true class is neutral-bright and everything else is amber, because every bar except
       * one is a mistake. 291 of them are a single mistake made over and over.
       */
      material.color.copy(rail.correct ? NEUTRAL : rail.count > 100 ? WRONG : DIM);
    });
  });

  return (
    <group ref={group} visible={false}>
      {rails.map((r) => (
        <mesh key={r.cls}>
          <boxGeometry args={[0.42, 1, 0.42]} />
          <meshBasicMaterial color={NEUTRAL} opacity={0} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Per-class accuracy, against the aggregate.                           */
/* ------------------------------------------------------------------ */

function ClassBars({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const show = Math.max(0, at(p, "spread") - at(p, "confusion") * 2.2);
    node.visible = show > 0.02;

    node.children.forEach((child, i) => {
      if (i === classBars.length) {
        /* The aggregate, as a plane cutting across every bar. */
        const plate = child as THREE.Mesh;
        const y = (result.testAccuracy / 100) * 2.4 * show;
        plate.position.set(0, y, RAIL_Z);
        (plate.material as THREE.MeshBasicMaterial).opacity = show * 0.5;
        return;
      }
      const bar = child as THREE.Mesh;
      const c = classBars[i];
      const h = (c.accuracy / 100) * 2.4 * show;
      bar.scale.set(1, Math.max(0.01, h), 1);
      bar.position.set(c.x, h / 2, RAIL_Z);
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = show * 0.92;
      material.color.copy(c.accuracy >= result.testAccuracy ? CORRECT : WRONG);
    });
  });

  return (
    <group ref={group} visible={false}>
      {classBars.map((c) => (
        <mesh key={c.cls}>
          <boxGeometry args={[0.42, 1, 0.42]} />
          <meshBasicMaterial color={CORRECT} opacity={0} transparent />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[6.4, 0.015, 0.6]} />
        <meshBasicMaterial color={NEUTRAL} depthWrite={false} opacity={0} transparent />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The confusion matrix, as a relief.                                   */
/* ------------------------------------------------------------------ */

function Matrix({ frame }: { frame: FrameRef }) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const mesh = ref.current;
    if (!mesh) return;
    const show = at(p, "confusion") * (1 - at(p, "limits"));
    /* Held through the grouping state, where the same relief is read a second way. */
    const grouped = at(p, "structure");
    mesh.visible = show > 0.02;
    (mesh.material as THREE.MeshBasicMaterial).opacity = show;

    matrix.forEach((cell, i) => {
      const h = Math.max(0.015, (cell.count / matrixMax) * 1.5 * show);
      P.set(cell.x, h / 2, RAIL_Z + cell.y);
      S.set(CELL * 0.82, h, CELL * 0.82);
      M.compose(P, Q, S);
      mesh.setMatrixAt(i, M);

      /*
       * Two readings of the same relief. First: right answers against wrong ones, with the single
       * largest mistake picked out. Then: whether a mistake stayed inside its own group, which is
       * where the vehicle/animal split becomes visible.
       */
      if (grouped > 0.5) {
        const sameGroup =
          (cell.trueCls === "airplane" ||
            cell.trueCls === "automobile" ||
            cell.trueCls === "ship" ||
            cell.trueCls === "truck") ===
          (cell.predCls === "airplane" ||
            cell.predCls === "automobile" ||
            cell.predCls === "ship" ||
            cell.predCls === "truck");
        C.copy(cell.diagonal ? NEUTRAL : sameGroup ? WRONG : DIM);
      } else if (cell.diagonal) {
        C.copy(CORRECT);
      } else if (cell.i === worstCell.i && cell.j === worstCell.j) {
        C.copy(WRONG);
      } else {
        C.copy(DIM).lerp(WRONG, Math.min(1, cell.count / 160));
      }
      mesh.setColorAt(i, C);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, matrix.length]} ref={ref} visible={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial toneMapped={false} transparent />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */

export default function CifarWorldScene({ frame }: { frame: FrameRef }) {
  const target = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);

    /*
     * The camera sits in front of whatever stage it is looking at and pushes down the same axis
     * the data travels. `tilt` only lifts it off that axis once there is channel depth worth
     * seeing from an angle.
     */
    const angle = shot.tilt * Math.PI * 0.5;
    camera.position.set(
      Math.sin(angle) * shot.zoom * 0.75,
      shot.height + Math.sin(angle) * shot.zoom * 0.55,
      shot.dolly + Math.cos(angle) * shot.zoom,
    );
    target.current.set(0, shot.height * 0.35, shot.dolly);
    camera.lookAt(target.current);
  });

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight intensity={0.35} position={[2, 5, 6]} />

      <PixelPlate frame={frame} />

      {/* The two transforms the config specifies geometrically. Colour jitter is named in the
          readout but not drawn, because its magnitude is not recorded. */}
      <group position={[-3.6, 0, 0]}>
        <PixelPlate frame={frame} offset={{ x: 3, y: -2 }} show="augment" />
      </group>
      <group position={[3.6, 0, 0]}>
        <PixelPlate flip frame={frame} show="augment" />
      </group>

      <ReceptiveField frame={frame} />
      <Stack frame={frame} />
      <Rails frame={frame} />
      <ClassBars frame={frame} />
      <Matrix frame={frame} />
    </>
  );
}
