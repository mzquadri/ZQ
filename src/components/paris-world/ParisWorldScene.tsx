"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { GROUND_SCALE, groundLift, roadVertices, sites, type Site } from "./geometry";

export type WorldFrame = {
  /** Index of the selected place, or -1 for the overview. */
  selected: number;
  /** Index under the pointer, or -1. */
  hovered: number;
  /** 0 light, 1 dark. Interpolated, so a theme change is a dissolve. */
  dark: number;
  /** Seconds of elapsed world time, paused when motion is not wanted. */
  drift: boolean;
};

/* Light and dark are two palettes for the same world, not one with the lamps
 * turned down. Picked against the site's own tokens so the 3D view and the
 * classic view read as the same place. */
const PALETTE = {
  light: {
    sky: new THREE.Color("#eceadf"),
    ground: new THREE.Color("#cfc9b4"),
    road: new THREE.Color("#2f3a42"),
    roadLit: new THREE.Color("#006d65"),
    key: new THREE.Color("#fff6e4"),
    fill: new THREE.Color("#c9d7e8"),
  },
  dark: {
    sky: new THREE.Color("#0a1016"),
    ground: new THREE.Color("#0d141c"),
    road: new THREE.Color("#6f93ab"),
    roadLit: new THREE.Color("#35d6c4"),
    key: new THREE.Color("#cfe6ff"),
    fill: new THREE.Color("#2a3a52"),
  },
} as const;

/* Scratch values, reused every frame so the loop allocates nothing. They live
 * at module scope rather than behind useMemo because a value handed to a hook
 * may not be mutated afterwards, and the whole point of these is mutation.
 * One scene is ever mounted, so sharing them is safe. */
const SKY = new THREE.Color();
const LOOK = new THREE.Vector3(0, 0.4, 0);
const WANT = new THREE.Vector3(0, 10.6, 15.2);

const FAMILY = [
  { light: "#006d65", dark: "#35d6c4" },
  { light: "#1f3f66", dark: "#7aa8ff" },
  { light: "#b8501c", dark: "#ff9f6b" },
] as const;

/** Camera positions: one overview, one per place. */
function viewFor(site: Site | null) {
  if (!site) return { pos: new THREE.Vector3(0, 10.6, 15.2), look: new THREE.Vector3(0, 0.3, 0) };
  const outward = new THREE.Vector3(site.x, 0, site.z).normalize();
  if (outward.lengthSq() < 0.001) outward.set(0, 0, 1);
  const pos = new THREE.Vector3(site.x, 0, site.z)
    .add(outward.multiplyScalar(6.6))
    .setY(site.y + 4.4);
  return { pos, look: new THREE.Vector3(site.x, site.y + 0.95, site.z) };
}

/** The built form at one place. Geometry carries the meaning, not colour. */
function Structure({ site, index, frame }: { site: Site; index: number; frame: React.RefObject<WorldFrame | null> }) {
  const group = useRef<THREE.Group>(null);
  const accent = useMemo(() => new THREE.Color(FAMILY[site.place.family].light), [site.place.family]);
  const accentDark = useMemo(() => new THREE.Color(FAMILY[site.place.family].dark), [site.place.family]);
  const live = useMemo(() => new THREE.Color(), []);
  const material = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const f = frame.current;
    if (!f || !group.current) return;
    const active = f.selected === index || f.hovered === index;
    const t = state.clock.elapsedTime;
    /* A selected place lifts and turns; everything else stands still, so the
     * eye is drawn by motion rather than by a glow nothing else has. */
    const target = active ? 1 : 0;
    const g = group.current;
    g.userData.k = THREE.MathUtils.lerp(g.userData.k ?? 0, target, 0.08);
    g.position.y = site.y + g.userData.k * 0.16;
    g.rotation.y = f.drift ? t * 0.12 * (0.35 + g.userData.k) : 0;
    if (material.current) {
      live.copy(accent).lerp(accentDark, f.dark);
      material.current.color.copy(live);
      material.current.emissive.copy(live).multiplyScalar(0.12 + g.userData.k * 0.5);
    }
  });

  const form = site.place.form;

  return (
    <group ref={group} position={[site.x, site.y, site.z]} scale={1.55}>
      <meshStandardMaterial ref={material} metalness={0.15} roughness={0.42} />
      {form === "tower" && (
        /* The thesis: a calibration tower. Eight rings, each narrower than the
         * one below, the way a spread narrows once it is scaled. */
        <group>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[0, 0.16 + i * 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.62 - i * 0.058, 0.026, 8, 36]} />
              <meshStandardMaterial
                color={FAMILY[0].light}
                emissive={FAMILY[0].light}
                emissiveIntensity={0.35}
                metalness={0.2}
                roughness={0.35}
              />
            </mesh>
          ))}
        </group>
      )}
      {form === "stack" && (
        /* BP-IT: three stores, one above the other, with a gate over them. */
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0, 0.12 + i * 0.3, 0]}>
              <cylinderGeometry args={[0.46 - i * 0.07, 0.5 - i * 0.07, 0.2, 24]} />
              <meshStandardMaterial color={FAMILY[2].light} metalness={0.2} roughness={0.5} />
            </mesh>
          ))}
          <mesh position={[0, 1.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.028, 8, 28, Math.PI]} />
            <meshStandardMaterial color={FAMILY[2].light} emissive={FAMILY[2].light} emissiveIntensity={0.4} />
          </mesh>
        </group>
      )}
      {form === "beams" && (
        /* InsureAssist: two searches leaning into one answer. */
        <group>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.3, 0.52, 0]} rotation={[0, 0, (-s * Math.PI) / 14]}>
              <boxGeometry args={[0.12, 1.04, 0.12]} />
              <meshStandardMaterial color={FAMILY[1].light} metalness={0.25} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 1.12, 0]}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial color={FAMILY[1].light} emissive={FAMILY[1].light} emissiveIntensity={0.55} />
          </mesh>
        </group>
      )}
      {form === "gate" && (
        /* The gateway: a doorway, and the one call in ten it turns away. */
        <group>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.42, 0.55, 0]}>
              <boxGeometry args={[0.13, 1.1, 0.13]} />
              <meshStandardMaterial color={FAMILY[1].light} metalness={0.3} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 1.14, 0]}>
            <boxGeometry args={[1.0, 0.14, 0.14]} />
            <meshStandardMaterial color={FAMILY[1].light} emissive={FAMILY[1].light} emissiveIntensity={0.45} />
          </mesh>
          <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.06, 0.74, 0.06]} />
            <meshStandardMaterial color="#b8501c" emissive="#b8501c" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
      {form === "grid" && (
        /* AUDI: the release sheet, and the one cell the dropdown returns. */
        <group>
          {Array.from({ length: 5 }, (_, r) =>
            Array.from({ length: 5 }, (_, c) => {
              const picked = r === 3 && c === 1;
              return (
                <mesh key={`${r}-${c}`} position={[(c - 2) * 0.19, 0.08 + r * 0.17, 0]}>
                  <boxGeometry args={[0.15, 0.12, 0.08]} />
                  <meshStandardMaterial
                    color={picked ? "#b8501c" : FAMILY[2].light}
                    emissive={picked ? "#b8501c" : "#000000"}
                    emissiveIntensity={picked ? 0.8 : 0}
                    metalness={0.1}
                    roughness={0.6}
                  />
                </mesh>
              );
            }),
          )}
        </group>
      )}
      {form === "surface" && (
        /* Teaching: the 2D and 3D plotting the labs were about. */
        <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2.6, 0, 0]}>
          <planeGeometry args={[1.15, 1.15, 14, 14]} />
          <meshStandardMaterial
            color={FAMILY[0].light}
            metalness={0.1}
            roughness={0.5}
            side={THREE.DoubleSide}
            wireframe
          />
        </mesh>
      )}
      {/* The pin that makes a place findable from across the city, on a stem
          so it belongs to the structure instead of hovering over it. */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 1.44, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.38} />
      </mesh>
      <mesh position={[0, 1.44, 0]}>
        <sphereGeometry args={[0.038, 14, 14]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.85} />
      </mesh>
    </group>
  );
}

export default function ParisWorldScene({ frame }: { frame: React.RefObject<WorldFrame | null> }) {
  /*
   * Background and fog are declared as elements and reached through refs, not
   * assigned onto the scene object. `useThree()` returns the scene, and a value
   * returned from a hook may not be mutated; the ref is the same object without
   * that problem. The camera comes off the frame callback for the same reason.
   */
  const background = useRef<THREE.Color>(null);
  const fogRef = useRef<THREE.Fog>(null);
  const roads = useRef<THREE.LineSegments>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.HemisphereLight>(null);
  const ground = useRef<THREE.Mesh>(null);

  const positions = useMemo(() => roadVertices(groundLift), []);

  useFrame((state, delta) => {
    const camera = state.camera;
    const f = frame.current;
    if (!f) return;
    const d = f.dark;
    const L = PALETTE.light;
    const D = PALETTE.dark;

    SKY.copy(L.sky).lerp(D.sky, d);
    background.current?.copy(SKY);
    fogRef.current?.color.copy(SKY);
    if (key.current) key.current.color.copy(L.key).lerp(D.key, d);
    if (fill.current) {
      fill.current.color.copy(L.key).lerp(D.key, d);
      fill.current.groundColor.copy(L.fill).lerp(D.fill, d);
      fill.current.intensity = 0.55 + d * 0.25;
    }
    if (ground.current) {
      const m = ground.current.material as THREE.MeshStandardMaterial;
      m.color.copy(L.ground).lerp(D.ground, d);
    }
    if (roads.current) {
      const m = roads.current.material as THREE.LineBasicMaterial;
      const lit = f.selected >= 0 || f.hovered >= 0;
      m.color.copy(L.road).lerp(D.road, d).lerp(d > 0.5 ? D.roadLit : L.roadLit, lit ? 0.33 : 0);
      m.opacity = 0.82 + d * 0.1;
    }

    /* One camera, moved by easing rather than by a controller, so a visit is a
     * move a viewer can follow and a recording is identical every run. */
    const site = f.selected >= 0 ? sites[f.selected] : null;
    const view = viewFor(site);
    WANT.copy(view.pos);
    if (f.drift && !site) {
      const t = state.clock.elapsedTime * 0.09;
      WANT.x += Math.sin(t) * 2.6;
      WANT.z += Math.cos(t) * 1.5;
      WANT.y += Math.sin(t * 0.7) * 0.5;
    }
    const ease = 1 - Math.pow(0.0015, delta);
    camera.position.lerp(WANT, ease);
    LOOK.lerp(view.look, ease);
    camera.lookAt(LOOK);
  });

  return (
    <>
      <color ref={background} attach="background" args={["#eceadf"]} />
      <fog ref={fogRef} attach="fog" args={["#eceadf", 19, 44]} />
      <hemisphereLight ref={fill} intensity={0.6} />
      <directionalLight ref={key} position={[6, 11, 7]} intensity={1.15} castShadow={false} />

      {/* The plate the city sits on. Large enough that its edge never shows. */}
      <mesh ref={ground} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.62, 0]} receiveShadow={false}>
        <circleGeometry args={[17, 72]} />
        <meshStandardMaterial roughness={0.95} metalness={0} />
      </mesh>

      <lineSegments ref={roads}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial transparent opacity={0.85} />
      </lineSegments>

      {sites.map((site, i) => (
        <Structure key={site.place.id} site={site} index={i} frame={frame} />
      ))}

      {/* A faint ring at the city limit, so the world has an edge you can see. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.6, 0]}>
        <ringGeometry args={[7.35 * GROUND_SCALE, 7.42 * GROUND_SCALE, 120]} />
        <meshBasicMaterial color="#2f3a42" transparent opacity={0.42} />
      </mesh>
    </>
  );
}
