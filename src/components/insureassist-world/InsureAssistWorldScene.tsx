"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { blendShots, mix } from "@/components/worlds/choreography";
import { config, forms } from "@/content/insureassist-world";
import {
  chunks,
  formSlabs,
  queryPoint,
  wrongFormRanking,
} from "./geometry";
import { SHOTS, STATES, at } from "./states";

/**
 * A document-intelligence machine, opened up.
 *
 * The material language is the argument. Documents are warm paper; chunks that carry wording
 * shared across forms are the ones that make the problem, so they are drawn differently from the
 * ones that do not; the query is neutral ink; and amber is reserved for exactly one thing - a
 * passage retrieved from the wrong form. Nothing else on screen is allowed to be amber, so when
 * the failure state arrives the eye has already been trained on what that colour means.
 */

const PAPER = new THREE.Color("#e8e0d2");
const PAPER_DIM = new THREE.Color("#7d766a");
const ACCENT = new THREE.Color("#f0a03c");
const WRONG = new THREE.Color("#f15a35");
const RIGHT = new THREE.Color("#4cc4b0");
const LEX = new THREE.Color("#7aa7f0");
const INK = new THREE.Color("#f2f0e8");
const DIM = new THREE.Color("#4f5a63");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

/* ============================================================================================
 * 1. The three forms
 * ========================================================================================== */

function Forms({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const slabRefs = useRef<(THREE.Mesh | null)[]>([]);
  const edgeRefs = useRef<(THREE.LineSegments | null)[]>([]);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.5, 0.06, 3)), []);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const shared = at(p, "duplication");
    const cut = at(p, "chunking");
    const away = at(p, "embedding");
    const back = at(p, "evidence");
    const close = at(p, "limits");

    /* The forms recede while the chunks are out in vector space, then return for the evidence. */
    const gone = Math.max(0, away - back);
    if (groupRef.current) {
      groupRef.current.position.y = mix(0, -3.6, gone);
      groupRef.current.visible = gone < 0.98;
    }

    formSlabs.forEach((slab, i) => {
      const mesh = slabRefs.current[i];
      const edge = edgeRefs.current[i];
      if (!mesh) return;
      const stagger = Math.max(0, Math.min(1, 1 - i * 0.12));
      /*
       * They start as a pile with each form clearly offset, then fan apart as the shared wording
       * is pointed out. The first attempt started them almost coincident and the opening frame
       * read as one thick slab - a project about three documents has to open on three documents.
       */
      const spread = mix(0.8, 1.35, shared);
      mesh.position.set(i * 0.34 * spread, i * 0.3 * spread, slab.z * spread);
      mesh.scale.set(slab.scale, 1, slab.scale);
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = (0.5 + stagger * 0.35) * (1 - cut * 0.55) * (1 - close * 0.5);
      if (edge) {
        edge.position.copy(mesh.position);
        edge.scale.copy(mesh.scale);
        (edge.material as THREE.LineBasicMaterial).opacity = 0.5 * (1 - cut * 0.4);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {formSlabs.map((slab, i) => (
        <mesh
          key={slab.id}
          ref={(node) => {
            slabRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[2.5, 0.06, 3]} />
          <meshStandardMaterial color={PAPER} metalness={0.02} roughness={0.85} transparent />
        </mesh>
      ))}
      {formSlabs.map((slab, i) => (
        <lineSegments
          geometry={edges}
          key={`${slab.id}-edge`}
          ref={(node) => {
            edgeRefs.current[i] = node;
          }}
        >
          <lineBasicMaterial color={PAPER_DIM} transparent />
        </lineSegments>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 2. 314 chunks: on the page, then out in the space
 * ========================================================================================== */

function Chunks({ frame }: { frame: FrameRef }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const shared = at(p, "duplication");
    const cut = at(p, "chunking");
    const identity = at(p, "identity");
    const lift = at(p, "embedding");
    const querying = at(p, "query");
    const wrong = at(p, "wrongform");
    const fusion = at(p, "fusion");
    const evidence = at(p, "evidence");
    const close = at(p, "limits");

    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.visible = cut > 0.01 || shared > 0.01;

    for (let i = 0; i < chunks.length; i += 1) {
      const chunk = chunks[i];
      const slab = formSlabs[chunk.formIndex];
      const appear = Math.max(0, Math.min(1, cut * chunks.length * 0.02 - i * 0.004));

      /* On the page while it is a document; out in the space once it is an index. */
      const spread = mix(0.35, 1, shared);
      const onPage = {
        x: chunk.page.x,
        y: chunk.formIndex * 0.16 * spread + 0.06,
        z: slab.z * spread + chunk.page.y * 0.5,
      };
      const inSpace = chunk.space;
      const t = lift;

      P.set(mix(onPage.x, inSpace.x, t), mix(onPage.y, inSpace.y, t), mix(onPage.z, inSpace.z, t));
      const size = mix(0.055, 0.05, t) * appear * (0.6 + shared * 0.4);
      S.setScalar(Math.max(0.001, size));
      M.compose(P, Q, S);
      mesh.setMatrixAt(i, M);

      /*
       * Colour carries provenance, not similarity. Chunks whose wording also appears in another
       * form are the ones that make the corpus hard, so during the duplication and identity states
       * they are the only thing lit.
       */
      const emphasiseShared = Math.max(shared * (1 - cut * 0.5), identity);
      if (chunk.shared && emphasiseShared > 0.05) {
        C.copy(ACCENT).lerp(PAPER_DIM, 1 - emphasiseShared);
      } else {
        C.copy(PAPER_DIM);
      }

      /* In the space, form membership is the signal. */
      if (t > 0.05) {
        const byForm = [RIGHT, LEX, ACCENT][chunk.formIndex];
        C.lerp(byForm, t * 0.85);
        /* Everything dims around the retrieved set once a question is being answered. */
        const focus = Math.max(querying, wrong, fusion, evidence);
        if (focus > 0.05) C.lerp(DIM, focus * 0.62);
      }
      C.lerp(DIM, close * 0.5);
      mesh.setColorAt(i, C);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh args={[undefined, undefined, chunks.length]} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial metalness={0.05} roughness={0.6} />
    </instancedMesh>
  );
}

/* ============================================================================================
 * 3. The question, the ranked list, and the wrong form
 *
 * The ranking drawn here is the real one: the reference run's ordered chunk list for the first
 * held-out question whose top result came from a form other than the one that answers it.
 * ========================================================================================== */

const RANK_SHOWN = 5;

function Retrieval({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const queryRef = useRef<THREE.Mesh>(null);
  const rankRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tetherRef = useRef<THREE.LineSegments>(null);

  const tetherGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RANK_SHOWN * 6), 3));
    return g;
  }, []);

  /* Where each ranked result sits: an arc in front of the query, rank one nearest. */
  const rankPosition = (rank: number) => {
    /* Spread wider than the first attempt: the five results overlapped into one clump. */
    const angle = (rank / (RANK_SHOWN - 1) - 0.5) * 2.1;
    const radius = 1.9 + rank * 0.46;
    return new THREE.Vector3(
      queryPoint.x + Math.sin(angle) * radius,
      queryPoint.y + 0.55 - rank * 0.12,
      queryPoint.z + Math.cos(angle) * radius,
    );
  };

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const querying = at(p, "query");
    const wrong = at(p, "wrongform");
    const fusion = at(p, "fusion");
    const evidence = at(p, "evidence");
    const close = at(p, "limits");
    const shown = Math.max(querying, wrong, fusion) * (1 - close);

    if (groupRef.current) groupRef.current.visible = shown > 0.02;
    if (shown <= 0.02) return;

    if (queryRef.current) {
      queryRef.current.position.set(queryPoint.x, queryPoint.y, queryPoint.z);
      queryRef.current.scale.setScalar(0.001 + querying * 0.13);
      (queryRef.current.material as THREE.MeshStandardMaterial).opacity = querying * (1 - close);
    }

    const position = tetherGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let rank = 0; rank < RANK_SHOWN; rank += 1) {
      const mesh = rankRefs.current[rank];
      const entry = wrongFormRanking[rank];
      if (!mesh || !entry) continue;
      const t = Math.max(0, Math.min(1, querying * RANK_SHOWN - rank * 0.7));
      const target = rankPosition(rank);
      mesh.position.copy(target);
      mesh.scale.setScalar(0.001 + t * (rank === 0 ? 0.22 : 0.15));
      mesh.visible = t > 0.02;

      const material = mesh.material as THREE.MeshStandardMaterial;
      material.opacity = t * (1 - evidence * 0.4);
      /*
       * Until the failure state, results are neutral - the reader is not told which is which.
       * Then provenance is revealed: rank one came from the wrong form, and the passage that
       * actually answers the question is sitting below it.
       */
      if (wrong > 0.05) {
        C.copy(entry.correct ? RIGHT : WRONG).lerp(DIM, 1 - wrong);
        material.color.copy(C);
        material.emissive.copy(C);
        material.emissiveIntensity = 0.25 + wrong * 0.5;
      } else {
        material.color.copy(INK);
        material.emissive.copy(INK);
        material.emissiveIntensity = 0.12;
      }

      position.setXYZ(rank * 2, queryPoint.x, queryPoint.y, queryPoint.z);
      position.setXYZ(rank * 2 + 1, target.x, target.y, target.z);
    }
    position.needsUpdate = true;
    tetherGeometry.computeBoundingSphere();
    if (tetherRef.current) {
      (tetherRef.current.material as THREE.LineBasicMaterial).opacity = querying * 0.5 * (1 - close);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={queryRef}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color={INK} emissive={INK} emissiveIntensity={0.6} transparent />
      </mesh>
      {Array.from({ length: RANK_SHOWN }, (_, rank) => (
        <mesh
          key={rank}
          ref={(node) => {
            rankRefs.current[rank] = node;
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial metalness={0.15} roughness={0.4} transparent />
        </mesh>
      ))}
      <lineSegments geometry={tetherGeometry} ref={tetherRef}>
        <lineBasicMaterial color="#7d766a" transparent />
      </lineSegments>
    </group>
  );
}

/*
 * The retriever comparison used to be a bar chart in world space, and it was the wrong tool twice
 * over. Three retrievers by two metrics is a table, and perspective only made it collide with the
 * chunk cloud it was floating inside. It is an SVG overlay now, pinned to the viewport.
 *
 * The deeper reason there is no spatial version: the reference run publishes the *fused* ranking
 * and the aggregate baselines, not the dense and lexical candidate lists separately. Drawing two
 * neighbourhoods would mean inventing which chunks each retriever found, on the one page whose
 * subject is retrieval being wrong in ways a single number hides.
 */

/* ============================================================================================
 * 5. Evidence returning, and the answer it is tethered to
 * ========================================================================================== */

function Answer({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const linkRef = useRef<THREE.LineSegments>(null);
  const packetRef = useRef<THREE.Group>(null);
  const feedRef = useRef<THREE.LineSegments>(null);

  const linkGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(config.servingTopK * 6), 3));
    return g;
  }, []);

  /* Packet-to-answer feed: one segment per slab, so the answer is visibly fed rather than lit. */
  const feedGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(config.servingTopK * 6), 3));
    return g;
  }, []);

  /* One provenance colour per form, so a slab in the packet still says which document it is. */
  const provenance = useMemo(
    () => formSlabs.map((_, i) => new THREE.Color().setHSL(0.08 + i * 0.12, 0.55, 0.6)),
    [],
  );

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const evidence = at(p, "evidence");
    const generation = at(p, "generation");
    const close = at(p, "limits");
    const shown = Math.max(evidence, generation) * (1 - close * 0.85);
    if (groupRef.current) groupRef.current.visible = shown > 0.02;
    if (shown <= 0.02) return;

    /*
     * The evidence packet.
     *
     * Five slabs, stacked, each carrying a stripe in the colour of the form it came from. This is
     * the object the whole project is about: after retrieval the passage is not free-floating text,
     * it is text plus the identity of the document it was taken from, and that identity has to
     * survive into whatever is generated next.
     */
    const packet = packetRef.current;
    if (packet) {
      packet.visible = evidence > 0.02;
      packet.children.forEach((child, i) => {
        const slabIndex = Math.floor(i / 2);
        const isStripe = i % 2 === 1;
        const mesh = child as THREE.Mesh;
        const t = Math.max(0, Math.min(1, evidence * config.servingTopK - slabIndex * 0.5));
        const y = (slabIndex - 2) * 0.5;
        mesh.position.set(isStripe ? -2.06 : -1.0, y, 2.2);
        mesh.scale.set(t, t, t);
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.opacity = t * (isStripe ? 0.95 : 0.5);
        if (isStripe) material.color.copy(provenance[slabIndex % provenance.length]);
      });
    }

    /*
     * The answer surface only exists after evidence has been selected, never before - and it is
     * framed rather than free. Generation here is a constrained formatter fed by the packet, not
     * an autonomous thing that knows something the evidence does not.
     */
    if (planeRef.current) {
      planeRef.current.position.set(2.4, mix(-1.4, 0.1, generation), 2.2);
      planeRef.current.scale.set(2.1 * generation, 1.25 * generation, 1);
      (planeRef.current.material as THREE.MeshStandardMaterial).opacity = generation * 0.62;
    }

    /* Packet feeds answer. Short, thick, and only present once there is something to feed it. */
    const feed = feedGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < config.servingTopK; i += 1) {
      const y = (i - 2) * 0.5;
      feed.setXYZ(i * 2, -0.45, y, 2.2);
      feed.setXYZ(i * 2 + 1, mix(-0.45, 1.3, generation), mix(y, y * 0.3 + 0.1, generation), 2.2);
    }
    feed.needsUpdate = true;
    if (feedRef.current) {
      (feedRef.current.material as THREE.LineBasicMaterial).opacity = generation * 0.8 * (1 - close);
    }

    /* Five citations, each still attached to the form it came from. */
    const position = linkGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < config.servingTopK; i += 1) {
      const t = Math.max(0, Math.min(1, evidence * config.servingTopK - i * 0.55));
      const slab = formSlabs[i % formSlabs.length];
      position.setXYZ(i * 2, -2.06, (i - 2) * 0.5, 2.2);
      position.setXYZ(i * 2 + 1, mix(-2.06, 0, t), mix((i - 2) * 0.5, slab.index * 0.16, t), mix(2.2, slab.z, t));
    }
    position.needsUpdate = true;
    linkGeometry.computeBoundingSphere();
    if (linkRef.current) {
      (linkRef.current.material as THREE.LineBasicMaterial).opacity = evidence * 0.65 * (1 - close);
    }
  });

  return (
    <group ref={groupRef}>
      {/* The packet: a slab and its provenance stripe, five times. */}
      <group ref={packetRef}>
        {formSlabs.slice(0, config.servingTopK).flatMap((_, i) => [
          <mesh key={`slab-${i}`}>
            <boxGeometry args={[2, 0.36, 0.06]} />
            <meshStandardMaterial
              color={PAPER}
              depthWrite={false}
              roughness={0.7}
              side={THREE.DoubleSide}
              transparent
            />
          </mesh>,
          <mesh key={`stripe-${i}`}>
            <boxGeometry args={[0.12, 0.36, 0.08]} />
            <meshStandardMaterial roughness={0.4} transparent />
          </mesh>,
        ])}
      </group>

      {/* The generation frame. Open on all sides: it formats, it does not decide. */}
      <group position={[2.4, 0.1, 2.2]}>
        {[
          [0, 0.72, 2.4, 0.05],
          [0, -0.72, 2.4, 0.05],
          [-1.2, 0, 0.05, 1.45],
          [1.2, 0, 0.05, 1.45],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <boxGeometry args={[w, h, 0.05]} />
            <meshStandardMaterial color={DIM} roughness={0.5} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      <mesh ref={planeRef}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={INK}
          emissive={INK}
          emissiveIntensity={0.12}
          side={THREE.DoubleSide}
          transparent
        />
      </mesh>

      <lineSegments geometry={feedGeometry} ref={feedRef}>
        <lineBasicMaterial color={RIGHT} transparent />
      </lineSegments>
      <lineSegments geometry={linkGeometry} ref={linkRef}>
        <lineBasicMaterial color={RIGHT} transparent />
      </lineSegments>
    </group>
  );
}

/* ============================================================================================
 * 6. Camera
 * ========================================================================================== */

function CameraRig({ frame }: { frame: FrameRef }) {
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = frame.current?.progress ?? 0;
    const shot = blendShots(p, STATES, SHOTS);
    camera.position.set(
      Math.sin(shot.yaw) * shot.distance,
      shot.height,
      Math.cos(shot.yaw) * shot.distance,
    );
    target.set(0, shot.look, 0);
    camera.lookAt(target);
  });

  return null;
}

/* ========================================================================================== */

export default function InsureAssistWorldScene({ frame }: { frame: FrameRef }) {
  return (
    <>
      {/*
        Paper needs a soft, broad key or it stops looking like paper, so the main light is high
        and wide and the fill is generous. The cool rim exists only to separate the three slabs
        from each other in depth. No bloom: the one bright thing on screen should be a retrieved
        passage, and a glow pass would spread that emphasis over everything.
      */}
      <color args={["#0b0e11"]} attach="background" />
      <fogExp2 args={["#0b0e11", 0.028]} attach="fog" />
      <ambientLight intensity={0.9} />
      <directionalLight intensity={1.25} position={[3, 8, 4]} />
      <directionalLight color="#7aa7f0" intensity={0.4} position={[-6, 2, -6]} />
      <CameraRig frame={frame} />
      <Forms frame={frame} />
      <Chunks frame={frame} />
      <Retrieval frame={frame} />
      <Answer frame={frame} />
    </>
  );
}

export const formCount = forms.length;
