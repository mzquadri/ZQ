"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

import { findings, lossTerms, sources } from "@/content/medico-world";
import { blendShots, mix } from "@/components/worlds/choreography";
import { RADIOGRAPH_CELLS, radiographField } from "@/content/medico-radiograph";
import { jitter, labelStateFor, maskMatrix, sheets } from "./geometry";

/* Read here, where it is actually drawn, so no other route inherits the packed field. */
const GRID = RADIOGRAPH_CELLS;
const radiograph = radiographField();
import { SHOTS, STATES, at } from "./states";

/**
 * A chest-X-ray classifier, opened up.
 *
 * Restrained on purpose. This is the one project on the site where an over-designed visual would
 * be actively dishonest: there are no weights and no metrics behind it, so the scene shows
 * machinery and label semantics, and the palette stays close to a lightbox - charcoal, grayscale,
 * a cold blue for structure, and exactly one warm accent reserved for "this is not known".
 */

const FILM = new THREE.Color("#cfd6da");
const COOL = new THREE.Color("#6f9dc4");
const TEAL = new THREE.Color("#4cc4b0");
const WARN = new THREE.Color("#f0a03c");
const DIM = new THREE.Color("#4a565f");
const INK = new THREE.Color("#f2f0e8");

const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const P = new THREE.Vector3();
const S = new THREE.Vector3();
const C = new THREE.Color();

export type Frame = { progress: number };
type FrameRef = RefObject<Frame | null>;

const CELLS = GRID * GRID;
/*
 * Plate size and cell size are derived, not typed. The cell width was a literal tuned for a
 * 34-cell grid; at 72 the same number would have overlapped every neighbour by half a cell.
 */
const PLATE = 3.9;
const CELL = (PLATE / (GRID - 1)) * 0.98;

/* ============================================================================================
 * 1. The radiograph, and what preprocessing does to it
 * ========================================================================================== */

function Film({ frame }: { frame: FrameRef }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lastSignature = useRef(-1);
  const lastVisible = useRef(-1);
  const primed = useRef(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const prep = at(p, "preprocess");
    const toSources = at(p, "sources");
    const intoNetwork = at(p, "network");
    const gone = at(p, "head");

    const mesh = meshRef.current;
    if (!mesh) return;
    /*
     * The film hands the frame over to the label matrix.
     *
     * It used to stay full size until the network state and sat directly behind the three source
     * rows, so the one scene that has to be read as a grid was read through a chest instead. It
     * now falls back and fades as the sources arrive: the image is still the subject of the
     * sequence, but it is not the subject of this particular frame.
     */
    const handOver = Math.max(toSources, intoNetwork);
    const visible = (1 - gone) * (1 - toSources * 0.82);
    if (groupRef.current) {
      groupRef.current.visible = visible > 0.02;
      groupRef.current.position.z = mix(0, -4.6, handOver);
      groupRef.current.scale.setScalar(mix(1, 0.46, handOver));
    }
    if (visible <= 0.02) return;

    /*
     * The field is 96 cells square, so this loop touches 9,216 instances. Nothing in it depends on
     * time - only on scroll - so it is skipped outright when none of the driving values has moved.
     * At rest that takes the per-frame cost of this mesh to zero.
     */
    const signature =
      Math.round(prep * 500) * 1e9 +
      Math.round(at(p, "preprocess") * 500) * 1e6 +
      Math.round(toSources * 500) * 1e3 +
      Math.round(intoNetwork * 500);
    if (signature === lastSignature.current && Math.abs(visible - lastVisible.current) < 0.002) {
      return;
    }
    lastSignature.current = signature;
    lastVisible.current = visible;

    /*
     * Preprocessing is shown as the crop and the contrast step, because those are the two that
     * change what the model sees. CLAHE raises local contrast, so cells move apart in brightness
     * rather than uniformly brightening - a global gain would misrepresent it as exposure.
     */
    const crop = 0.14 * prep;
    const clahe = at(p, "preprocess");

    /*
     * Only two numbers per cell actually move.
     *
     * This loop used to compose a full transform for each of the 9,216 instances and hand it to
     * setMatrixAt: quaternion maths and sixteen float writes per cell per frame, for a grid that
     * never rotates and never slides sideways. The lateral scales and the x/y position are fixed
     * by the cell's index, and were being rewritten with their own values sixty times a second.
     *
     * A continuous capture of this route measured what that cost: 8 fps with the film on screen,
     * against 60 everywhere else on the site, on a scene issuing barely one draw call a frame -
     * the time was going into JavaScript, not the GPU.
     *
     * So the invariant half of the transform is written once, and the frame loop touches only the
     * depth scale, the depth offset and the colour. Same output, an order of magnitude less work.
     */
    if (!primed.current) {
      const fixed = mesh.instanceMatrix.array;
      for (let i = 0; i < CELLS; i += 1) {
        const o = i * 16;
        /* Cells all but touch: visible gutters made the film read as tiling, not tissue. */
        fixed[o] = CELL;
        fixed[o + 5] = CELL;
        fixed[o + 15] = 1;
        fixed[o + 12] = (((i % GRID) / (GRID - 1)) - 0.5) * PLATE;
        fixed[o + 13] = (0.5 - Math.floor(i / GRID) / (GRID - 1)) * PLATE;
        /* Allocates instanceColor, so the frame loop can write straight into it. */
        mesh.setColorAt(i, C);
      }
      primed.current = true;
    }

    const matrices = mesh.instanceMatrix.array;
    const colours = mesh.instanceColor?.array;
    if (!colours) return;

    const span = 1 / (GRID - 1);
    /*
     * Almost flat while it is still a radiograph, and only extruded once it is being treated as
     * data. Relief on the opening frame turned the film into a mosaic of blocks lit from the
     * front - the one thing it must not look like is tiling.
     */
    const relief = Math.max(prep, toSources) * (1 - intoNetwork * 0.7);
    const fade = prep * 0.8;
    const inner = 1 - crop;

    for (let i = 0; i < CELLS; i += 1) {
      const row = (i / GRID) | 0;
      const u = (i - row * GRID) * span;
      const v = row * span;
      const inCrop = u > crop && u < inner && v > crop && v < inner;

      const base = radiograph[i];
      const contrasted = mix(base, Math.max(0, Math.min(1, (base - 0.5) * 1.85 + 0.5)), clahe);
      const value = inCrop ? contrasted : mix(contrasted, 0.02, prep);

      const depth = 0.01 + value * 0.34 * relief;
      const o = i * 16;
      matrices[o + 10] = depth > 0.004 ? depth : 0.004;
      matrices[o + 14] = depth / 2;

      /*
       * Wide tonal range on purpose. Compressed into the top of the scale the film read as a white
       * blob; a radiograph is mostly dark, and the air in the lung fields has to be the darkest
       * thing inside the body outline for the image to read at all.
       */
      /* Gentler gamma: the squared curve blew the soft tissue out once the field was brighter. */
      C.copy(FILM).multiplyScalar(0.03 + Math.pow(value, 1.35) * 1.15);
      if (!inCrop) C.lerp(DIM, fade);
      const c = i * 3;
      colours[c] = C.r;
      colours[c + 1] = C.g;
      colours[c + 2] = C.b;
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    (mesh.material as THREE.MeshStandardMaterial).opacity = Math.min(1, visible);
  });

  return (
    <group ref={groupRef}>
      <instancedMesh args={[undefined, undefined, CELLS]} ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.05} roughness={0.75} transparent />
      </instancedMesh>
    </group>
  );
}

/* ============================================================================================
 * 2. Three sources, and the label space they disagree about
 *
 * The centre of the whole world. Each source is a row of fourteen cells; a filled cell is a
 * finding that source can speak to, an outlined one is a finding it says nothing about. The
 * matrix is derived from the script, so the gaps are real gaps.
 * ========================================================================================== */

function LabelMatrix({ frame }: { frame: FrameRef }) {
  const cellsRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const count = sources.length * findings.length;

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const arrive = at(p, "sources");
    const spread = at(p, "labels");
    const masking = at(p, "mask");
    const leave = at(p, "network");

    const shown = Math.min(arrive, 1 - leave);
    if (groupRef.current) groupRef.current.visible = shown > 0.02;
    const mesh = cellsRef.current;
    if (!mesh || shown <= 0.02) return;

    for (let s = 0; s < sources.length; s += 1) {
      for (let f = 0; f < findings.length; f += 1) {
        const i = s * findings.length + f;
        const supplied = maskMatrix[s][f] === 1;
        const state = labelStateFor(s, f);

        /* The three source rows arrive stacked, then separate in depth. */
        const rowStagger = Math.max(0, Math.min(1, arrive * sources.length - s * 0.5));
        /* 14 cells at this pitch span 4.4 units, which fits the frame at the label shots. */
        const x = (f - (findings.length - 1) / 2) * 0.34;
        const y = mix(0, ((sources.length - 1) / 2 - s) * 1.5, spread) * rowStagger;
        /* Barely any depth offset: it added perspective shear to a grid that must read flat. */
        const z = mix(0, (s - 1) * -0.22, spread * 0.6) * rowStagger;

        /* Under masking, everything that cannot teach anything drops away and dims. */
        const masked = state === "uncertain" || state === "unsupported";
        const drop = masked ? masking * 0.75 : 0;

        P.set(x, y - drop, z);
        const size = supplied ? 0.26 : 0.15;
        S.set(size * rowStagger, size * rowStagger, mix(0.06, masked ? 0.05 : 0.3, spread));
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);

        if (state === "unsupported") C.copy(DIM).lerp(new THREE.Color("#2a3238"), masking * 0.6);
        else if (state === "uncertain") C.copy(WARN).lerp(DIM, masking * 0.55);
        else if (state === "positive") C.copy(TEAL);
        else C.copy(COOL).multiplyScalar(0.55);

        mesh.setColorAt(i, C);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    (mesh.material as THREE.MeshStandardMaterial).opacity = shown;
  });

  /* Lifted so the third source row clears the caption scrim in the lower left. */
  return (
    <group position={[0, 0.8, 1.9]} ref={groupRef}>
      <instancedMesh args={[undefined, undefined, count]} ref={cellsRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.55} transparent />
      </instancedMesh>
    </group>
  );
}

/* ============================================================================================
 * 3a. The stem adapter: what makes a pretrained ImageNet model take a chest film
 * ========================================================================================== */

/**
 * Three channels becoming one.
 *
 * The single recorded fact about how this backbone was adapted is in the stem: "7x7 stride 2, 64
 * channels - RGB weights averaged to one channel". That is the whole of the transfer, and until
 * now it existed only as a line of text under a stack of blue sheets.
 *
 * So it is drawn. Three plates arrive separated, in the three channels a pretrained ImageNet stem
 * expects, and collapse into one neutral plate as the network opens. Nothing here implies the
 * blocks were frozen, because the repository does not say they were.
 */
function StemAdapter({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);

  const CHANNELS = useMemo(
    () => [new THREE.Color("#c2584f"), new THREE.Color("#5fa05a"), new THREE.Color("#4f74c2")],
    [],
  );

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const open = at(p, "network");
    const merged = at(p, "reuse");
    const gone = at(p, "head");
    const shown = Math.min(open, 1 - gone);
    const node = groupRef.current;
    if (!node) return;
    node.visible = shown > 0.02;
    if (shown <= 0.02) return;

    node.children.forEach((child, i) => {
      const plate = child as THREE.Mesh;
      const material = plate.material as THREE.MeshStandardMaterial;
      if (i < 3) {
        /* The three input channels, converging on the midline as the merge completes. */
        const spread = (i - 1) * 0.42 * (1 - merged);
        plate.position.set(spread, spread * 0.5, -2.5 + i * 0.14 * (1 - merged));
        plate.scale.setScalar(1);
        material.color.copy(CHANNELS[i]).multiplyScalar(0.9);
        material.opacity = shown * 0.55 * (1 - merged * 0.92);
      } else {
        /* The single grayscale plate the averaged weights actually receive. */
        plate.position.set(0, 0, -2.4);
        material.opacity = shown * merged * 0.7;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i}>
          <boxGeometry args={[1.85, 1.85, 0.05]} />
          <meshStandardMaterial
            depthWrite={false}
            metalness={0.1}
            roughness={0.6}
            side={THREE.DoubleSide}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 3. DenseNet-121, and what makes it dense
 * ========================================================================================== */

function Network({ frame }: { frame: FrameRef }) {
  const groupRef = useRef<THREE.Group>(null);
  const sheetRef = useRef<THREE.InstancedMesh>(null);
  const reuseRef = useRef<THREE.InstancedMesh>(null);

  /* Feature reuse: every layer in a block feeds every later one. Drawn for the widest block. */
  const reuseCount = 16 * 4;

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const open = at(p, "network");
    const reuse = at(p, "reuse");
    const toHead = at(p, "head");
    const shown = Math.min(open, 1 - toHead);
    if (groupRef.current) groupRef.current.visible = shown > 0.02;
    if (shown <= 0.02) return;

    const mesh = sheetRef.current;
    if (mesh) {
      for (let i = 0; i < sheets.length; i += 1) {
        const sheet = sheets[i];
        /* Sheets arrive along the stack, front to back. */
        const t = Math.max(0, Math.min(1, open * 2.2 - (i / sheets.length) * 1.1));
        const size = 2.9 * sheet.scale * t;
        P.set(0, 0, sheet.z);
        S.set(size, size, 0.04);
        M.compose(P, Q, S);
        mesh.setMatrixAt(i, M);
        /*
         * Dense layers are the substance and read cool; transitions are the steps between blocks
         * and read dim, so the four blocks separate visually without a label.
         */
        if (sheet.kind === "dense") C.copy(COOL).multiplyScalar(0.55 + (i / sheets.length) * 0.6);
        else if (sheet.kind === "transition") C.copy(WARN).multiplyScalar(0.95);
        else C.copy(INK).multiplyScalar(0.35);
        mesh.setColorAt(i, C);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      (mesh.material as THREE.MeshStandardMaterial).opacity = shown * 0.34 * (1 - reuse * 0.7);
    }

    /*
     * The reuse state zooms one block and draws its skip pattern: layer k receives the outputs of
     * every layer before it, which is the single thing that distinguishes a dense block from a
     * plain stack.
     */
    const bundle = reuseRef.current;
    if (bundle) {
      bundle.visible = reuse > 0.02;
      for (let i = 0; i < reuseCount; i += 1) {
        const layer = i % 16;
        const lane = Math.floor(i / 16);
        /* A lane only exists once the layer it comes from has been passed. */
        const t = Math.max(0, Math.min(1, reuse * 3 - layer * 0.09 - lane * 0.12));
        const x = (layer - 7.5) * 0.34;
        const y = (lane - 1.5) * 0.3 + jitter(i) * 0.04;
        P.set(x, y * t, 0.3 + lane * 0.12);
        S.set(0.22 * t, 0.13 * t, 0.13 * t);
        M.compose(P, Q, S);
        bundle.setMatrixAt(i, M);
        /* Later layers carry more accumulated channels, so they read brighter. */
        C.copy(COOL).lerp(TEAL, layer / 15);
        bundle.setColorAt(i, C);
      }
      bundle.instanceMatrix.needsUpdate = true;
      if (bundle.instanceColor) bundle.instanceColor.needsUpdate = true;
      (bundle.material as THREE.MeshStandardMaterial).opacity = reuse * (1 - toHead);
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh args={[undefined, undefined, sheets.length]} ref={sheetRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          depthWrite={false}
          metalness={0.1}
          roughness={0.6}
          side={THREE.DoubleSide}
          transparent
        />
      </instancedMesh>
      <instancedMesh args={[undefined, undefined, reuseCount]} ref={reuseRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.1} roughness={0.5} transparent />
      </instancedMesh>
    </group>
  );
}

/* ============================================================================================
 * 4. The head, and the loss that decides what may teach it
 * ========================================================================================== */

function HeadAndLoss({ frame }: { frame: FrameRef }) {
  const logitsRef = useRef<THREE.InstancedMesh>(null);
  const termRefs = useRef<(THREE.Mesh | null)[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const p = frame.current?.progress ?? 0;
    const head = at(p, "head");
    const loss = at(p, "loss");
    const evaluation = at(p, "evaluation");
    const limits = at(p, "limits");
    if (groupRef.current) groupRef.current.visible = head > 0.02;
    if (head <= 0.02) return;

    /* Fourteen logits, one per finding, arranged as an arc so all of them stay readable at once. */
    const mesh = logitsRef.current;
    if (mesh) {
      for (let f = 0; f < findings.length; f += 1) {
        const t = Math.max(0, Math.min(1, head * findings.length - f * 0.4));
        const angle = ((f - (findings.length - 1) / 2) / findings.length) * 2.1;
        const radius = 3.1;
        P.set(Math.sin(angle) * radius, Math.cos(angle) * radius - 2.5, mix(0, 0.6, t));
        S.setScalar(0.001 + t * 0.24);
        M.compose(P, Q, S);
        mesh.setMatrixAt(f, M);
        /*
         * Every channel is drawn identically. There are no trained weights in the repository, so
         * there is no prediction to show - giving one finding a taller bar than another would be
         * inventing a result, on a medical model, to make a picture look busier.
         */
        C.copy(COOL).lerp(DIM, Math.max(limits * 0.5, loss * 0.55));
        mesh.setColorAt(f, C);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      /* The arc steps back while the loss is the subject; it is the head's frame, not this one. */
      (mesh.material as THREE.MeshStandardMaterial).opacity = head * (1 - limits * 0.4) * (1 - loss * 0.72);
    }

    /*
     * The loss as five plates in a row. The last is the mask, and when it closes the whole product
     * collapses - which is the point of the term and the reason the model can be trained on three
     * corpora that disagree about what they label.
     */
    lossTerms.forEach((_, i) => {
      const plate = termRefs.current[i];
      if (!plate) return;
      const t = Math.max(0, Math.min(1, loss * lossTerms.length - i * 0.55));
      plate.visible = t > 0.02 && evaluation < 0.9;
      plate.position.set((i - (lossTerms.length - 1) / 2) * 1.34, 0.55, 1.6);
      const isMask = i === lossTerms.length - 1;
      /* The mask plate shuts as the state completes; the others hold open. */
      const shut = isMask ? Math.max(0, loss * 1.6 - 0.6) : 0;
      plate.scale.set(t * 0.82, t * 0.82 * (1 - shut * 0.94), t * 0.82);
      const material = plate.material as THREE.MeshStandardMaterial;
      material.opacity = t * (1 - evaluation * 0.8);
      material.color.copy(isMask ? C.copy(WARN) : C.copy(COOL));
      material.emissive.copy(isMask ? WARN : COOL);
    });
  });

  return (
    <group ref={groupRef}>
      <instancedMesh args={[undefined, undefined, findings.length]} ref={logitsRef}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial metalness={0.2} roughness={0.4} transparent />
      </instancedMesh>
      {lossTerms.map((term, i) => (
        <mesh
          key={term.term}
          ref={(node) => {
            termRefs.current[i] = node;
          }}
        >
          <boxGeometry args={[1, 1, 0.16]} />
          <meshStandardMaterial emissiveIntensity={0.35} metalness={0.15} roughness={0.45} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================================================
 * 5. Camera
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

export default function MedicoWorldScene({ frame }: { frame: FrameRef }) {
  return (
    <>
      {/*
        A lightbox, not an operating theatre. One soft key from the front so the film reads flat
        and even the way a viewing box does, a cool rim to separate layers from the background, and
        low ambient. No bloom, no coloured haze, nothing that would make a medical image look
        dramatic.
      */}
      <color args={["#0a0d0f"]} attach="background" />
      <fogExp2 args={["#0a0d0f", 0.035]} attach="fog" />
      <ambientLight intensity={0.75} />
      <directionalLight intensity={1.15} position={[0.5, 2.5, 6]} />
      <directionalLight color="#6f9dc4" intensity={0.55} position={[-5, 1.5, -5]} />
      <CameraRig frame={frame} />
      <Film frame={frame} />
      <LabelMatrix frame={frame} />
      <StemAdapter frame={frame} />
      <Network frame={frame} />
      <HeadAndLoss frame={frame} />
    </>
  );
}
