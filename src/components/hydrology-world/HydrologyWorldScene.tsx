"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { sensitivity } from "@/content/hydrology-world";
import { blendShots, mix } from "@/components/worlds/choreography";
import {
  MEMBERS,
  SPAN_X,
  SPAN_Y,
  SPAN_Z,
  curveMaxQ,
  curveRibbon,
  envelope,
  peakIndex,
  rainEnvelope,
  rainMembers,
  reference,
  stageMembers,
  transitionAt,
  x,
  y,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A measurement, taken apart.
 *
 * The scene is a scientific instrument rather than a landscape: a base plane, one reference
 * trajectory, and ensembles that occupy depth. There is no water, no terrain and no sky, because
 * the seminar is not about a river - it is about whether the number you wrote down for the river
 * can be trusted.
 *
 * Colour carries one distinction only. Neutral is the reference, the thing everything is compared
 * against. Cool blue is the precipitation experiment. Amber is the stage experiment, and amber
 * appears nowhere else, so the moment the scene turns warm is the moment the finding lands.
 */

const REF = new THREE.Color("#e8edf1");
const RAIN = new THREE.Color("#6f9dc4");
const STAGE = new THREE.Color("#f0a03c");
const GRID = new THREE.Color("#2b333a");
const CURVE = new THREE.Color("#9fb3c2");

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/* ------------------------------------------------------------------ */
/* The base plane: a plain measurement grid, so depth has a floor.      */
/* ------------------------------------------------------------------ */

function BasePlane({ frame }: { frame: FrameRef }) {
  const ref = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i += 1) {
      const px = -SPAN_X / 2 + (SPAN_X * i) / 10;
      out.push(new THREE.Vector3(px, 0, -SPAN_Z / 2), new THREE.Vector3(px, 0, SPAN_Z / 2));
    }
    for (let i = 0; i <= 6; i += 1) {
      const pz = -SPAN_Z / 2 + (SPAN_Z * i) / 6;
      out.push(new THREE.Vector3(-SPAN_X / 2, 0, pz), new THREE.Vector3(SPAN_X / 2, 0, pz));
    }
    return out;
  }, []);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(lines), [lines]);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const group = ref.current;
    if (!group) return;
    /* The floor is only worth showing once there is depth to measure against. */
    const depth = Math.max(at(p, "diverge"), at(p, "envelope"), at(p, "standpoint"));
    const material = (group.children[0] as THREE.LineSegments).material as THREE.LineBasicMaterial;
    material.opacity = mix(0.1, 0.42, depth);
  });

  return (
    <group ref={ref}>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={GRID} opacity={0.1} transparent />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The reference trajectory. The one thing that never moves.            */
/* ------------------------------------------------------------------ */

function Reference({ frame }: { frame: FrameRef }) {
  /*
   * Built as a THREE object rather than as <line> JSX: React's own SVG `line` element wins that
   * name in JSX, so the fibre intrinsic is unusable here.
   *
   * A ribbon mesh was tried first, to get around WebGL ignoring `linewidth`. It rendered as two
   * parallel edges with no fill, and chasing that was not worth the time when the line reads
   * perfectly well against this background - including where it matters most, as the thin neutral
   * spine inside the stage envelope.
   */
  const object = useMemo(() => {
    const pts = reference.map((p) => new THREE.Vector3(x(p.t), y(p.q), 0));
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({ color: REF, opacity: 0, transparent: true });
    return new THREE.Line(geometry, material);
  }, []);

  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const line = node.children[0] as THREE.Line;
    const draw = at(p, "event");
    /* Steps aside while the rating curve is being explained, then comes back. */
    const hidden = Math.max(0, at(p, "curve") - at(p, "diverge"));
    /*
     * Reaches full strength early in its own state rather than easing across the whole of it.
     * This is the only object on screen at that point, and a half-faded line reads as a rendering
     * problem rather than as an entrance.
     */
    (line.material as THREE.LineBasicMaterial).opacity =
      Math.min(1, draw * 2.2) * (1 - hidden * 0.985);
    line.geometry.setDrawRange(0, Math.max(2, Math.floor(reference.length * draw)));
  });

  return (
    <group ref={group}>
      <primitive object={object} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* An ensemble: many trajectories, one per depth slice.                 */
/* ------------------------------------------------------------------ */

function Ensemble({
  frame,
  members,
  colour,
  appear,
  spread,
  fade,
  settle,
  depth,
}: {
  frame: FrameRef;
  members: number[][];
  colour: THREE.Color;
  /** State whose progress brings the members in. */
  appear: Parameters<typeof at>[1];
  /** State whose progress pushes them apart in depth. */
  spread: Parameters<typeof at>[1];
  /** State whose progress takes them away again. */
  fade: Parameters<typeof at>[1];
  /**
   * State during which the members step back so the surface they produced can be read.
   *
   * Without this the envelope is invisible underneath its own ensemble, and the sequence loses
   * the one move it exists to make: many trajectories, therefore a band.
   */
  settle: Parameters<typeof at>[1];
  /**
   * How much of the depth axis this ensemble is allowed to occupy.
   *
   * The precipitation ensemble gets almost none. Separating its members in Z would make them
   * project to different heights under perspective and paint a visible band across the peak -
   * which is exactly the thing this experiment did not produce. Its 2,000 members genuinely do
   * lie on top of each other, and the scene has to show that or it is lying.
   */
  depth: number;
}) {
  const group = useRef<THREE.Group>(null);

  const objects = useMemo(
    () =>
      members.map((member) => {
        const pts = member.map((q, i) => new THREE.Vector3(x(reference[i].t), y(q), 0));
        const geometry = new THREE.BufferGeometry().setFromPoints(pts);
        const material = new THREE.LineBasicMaterial({
          color: colour,
          opacity: 0,
          transparent: true,
        });
        return new THREE.Line(geometry, material);
      }),
    [members, colour],
  );

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;

    const inAmount = at(p, appear);
    const spreadAmount = at(p, spread);
    const outAmount = at(p, fade);
    const settled = at(p, settle);

    node.children.forEach((child, m) => {
      const line = child as THREE.Line;
      const material = line.material as THREE.LineBasicMaterial;

      /* Members arrive a few at a time rather than all at once, so the count reads. */
      const stagger = m / MEMBERS;
      const arrived = Math.max(0, Math.min(1, (inAmount - stagger * 0.55) / 0.45));

      /* Depth: collapsed onto the reference plane until the ensemble is asked to separate. */
      const slot = (m / (MEMBERS - 1) - 0.5) * SPAN_Z * depth;
      line.position.z = slot * spreadAmount;

      material.opacity =
        arrived * mix(0.5, 0.13, spreadAmount) * mix(1, 0.28, settled) * (1 - outAmount);
      material.color.copy(colour);
    });
  });

  return (
    <group ref={group}>
      {objects.map((object, m) => (
        <primitive key={m} object={object} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The envelope: a surface hung between the ensemble's extremes.        */
/* ------------------------------------------------------------------ */

function Envelope({
  frame,
  bounds,
  colour,
  show,
  hide,
}: {
  frame: FrameRef;
  bounds: { lo: number; hi: number }[];
  colour: THREE.Color;
  show: Parameters<typeof at>[1];
  /** State whose progress clears it again, so a later beat gets an empty frame. */
  hide?: Parameters<typeof at>[1];
}) {
  const mesh = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const positions: number[] = [];
    const indices: number[] = [];
    bounds.forEach((b, i) => {
      const px = x(reference[i].t);
      positions.push(px, y(b.hi), 0, px, y(b.lo), 0);
      if (i < bounds.length - 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [bounds]);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = mesh.current;
    if (!node) return;
    const material = node.material as THREE.MeshBasicMaterial;
    material.opacity = at(p, show) * 0.46 * (hide ? 1 - at(p, hide) : 1);
    material.color.copy(colour);
  });

  return (
    <mesh geometry={geometry} ref={mesh}>
      <meshBasicMaterial
        color={colour}
        depthWrite={false}
        opacity={0}
        side={THREE.DoubleSide}
        transparent
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* The rating curve, as its own object. The mechanism state.            */
/* ------------------------------------------------------------------ */

function RatingCurve({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  const { curveObject, band, marker } = useMemo(() => {
    const cx = (t: number) => (t - 0.5) * SPAN_X * 0.84;
    const cy = (q: number) => (q / curveMaxQ) * SPAN_Y * 0.92;

    const linePts = curveRibbon.map((c) => new THREE.Vector3(cx(c.t), cy(c.q), 0));

    const positions: number[] = [];
    const indices: number[] = [];
    curveRibbon.forEach((c, i) => {
      const px = cx(c.t);
      positions.push(px, cy(c.hi), 0, px, cy(c.lo), 0);
      if (i < curveRibbon.length - 1) {
        const a = i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const bandGeometry = new THREE.BufferGeometry();
    bandGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    bandGeometry.setIndex(indices);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: CURVE,
      opacity: 0,
      transparent: true,
    });

    return {
      curveObject: new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePts), lineMaterial),
      band: bandGeometry,
      marker: cx(transitionAt),
    };
  }, []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const show = Math.max(0, at(p, "curve") - at(p, "diverge") * 2.2);
    node.visible = show > 0.01;
    /* Nudged left: the curve is flat over its first half, so its visual mass sits right. */
    node.position.set(-0.9, mix(0.4, 0.0, show), 0);

    const curveLine = node.children[0] as THREE.Line;
    (curveLine.material as THREE.LineBasicMaterial).opacity = show;

    const bandMesh = node.children[1] as THREE.Mesh;
    (bandMesh.material as THREE.MeshBasicMaterial).opacity = show * 0.34;

    const tick = node.children[2] as THREE.Mesh;
    (tick.material as THREE.MeshBasicMaterial).opacity = show * 0.75;
  });

  return (
    <group ref={group} visible={false}>
      <primitive object={curveObject} />
      <mesh geometry={band}>
        <meshBasicMaterial
          color={STAGE}
          depthWrite={false}
          opacity={0}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>
      {/* Where the two power laws hand over: h = 450 cm. */}
      <mesh position={[marker, SPAN_Y * 0.46, 0]}>
        <boxGeometry args={[0.02, SPAN_Y * 0.92, 0.02]} />
        <meshBasicMaterial color={REF} opacity={0} transparent />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* The peak marker: a post at the point the argument is about.          */
/* ------------------------------------------------------------------ */

function PeakMarker({ frame }: { frame: FrameRef }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = ref.current;
    if (!node) return;
    const show = Math.max(at(p, "diverge"), at(p, "envelope")) * (1 - at(p, "standpoint"));
    const material = node.material as THREE.MeshBasicMaterial;
    material.opacity = show * 0.5;
    node.visible = show > 0.02;

    const hi = envelope[peakIndex].hi;
    const lo = envelope[peakIndex].lo;
    node.position.set(x(reference[peakIndex].t), (y(hi) + y(lo)) / 2, 0);
    node.scale.set(1, Math.max(0.01, y(hi) - y(lo)), 1);
  });

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[0.035, 1, 0.035]} />
      <meshBasicMaterial color={STAGE} opacity={0} transparent />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Sensitivity: two standpoints, two answers.                           */
/* ------------------------------------------------------------------ */

function Standpoints({ frame }: { frame: FrameRef }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const node = group.current;
    if (!node) return;
    const show = at(p, "standpoint") * (1 - at(p, "limits"));
    node.visible = show > 0.02;
    node.children.forEach((child, i) => {
      const bar = child as THREE.Mesh;
      const material = bar.material as THREE.MeshBasicMaterial;
      material.opacity = show * 0.8;
      /* Two bars: the narrow-range answer and the full-range answer, at their real total indices. */
      const index = i === 0 ? sensitivity.narrow.totalIndex : sensitivity.full.totalIndex;
      const height = index * SPAN_Y * 1.15 * show;
      bar.scale.set(1, Math.max(0.01, height), 1);
      /* Right of centre: the caption occupies the lower left of the frame at this width. */
      bar.position.set(i === 0 ? 1.3 : 3.1, height / 2, 0);
    });
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshBasicMaterial color={RAIN} opacity={0} transparent />
      </mesh>
      <mesh>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshBasicMaterial color={STAGE} opacity={0} transparent />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

export default function HydrologyWorldScene({ frame }: { frame: FrameRef }) {
  const target = useRef(new THREE.Vector3());

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);

    /*
     * `swing` is an angle away from side-on, not an orbit. At zero the camera sits on the +Z axis
     * and the scene reads as a flat plot; as it grows the camera walks around toward the side and
     * the ensemble's depth opens up. Keeping it as one number means the two experiments can be
     * shown from provably identical positions.
     */
    const angle = shot.swing * Math.PI * 0.42;
    camera.position.set(
      Math.sin(angle) * shot.distance,
      shot.height,
      Math.cos(angle) * shot.distance,
    );
    target.current.set(0, shot.look + SPAN_Y * 0.28, 0);
    camera.lookAt(target.current);
  });

  return (
    <>
      <ambientLight intensity={0.95} />
      <directionalLight intensity={0.5} position={[3, 6, 5]} />

      <BasePlane frame={frame} />
      <Reference frame={frame} />

      {/* The precipitation experiment: arrives, barely separates, leaves. */}
      <Ensemble
        appear="rain"
        colour={RAIN}
        fade="stage"
        frame={frame}
        depth={0.16}
        members={rainMembers}
        settle="stage"
        spread="rainVerdict"
      />
      <Envelope bounds={rainEnvelope} colour={RAIN} frame={frame} show="rainVerdict" />

      {/* The stage experiment: the same apparatus, and it does not stay put. */}
      <Ensemble
        appear="diverge"
        colour={STAGE}
        fade="standpoint"
        frame={frame}
        depth={1}
        members={stageMembers}
        settle="envelope"
        spread="diverge"
      />
      <Envelope bounds={envelope} colour={STAGE} frame={frame} hide="standpoint" show="envelope" />

      <RatingCurve frame={frame} />
      <PeakMarker frame={frame} />
      <Standpoints frame={frame} />
    </>
  );
}
