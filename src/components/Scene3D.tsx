"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";

/* =============================================
   Particle Field - Floating emerald particles
   ============================================= */
function ParticleField({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sz[i] = Math.random() * 0.5 + 0.1;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#10b981"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* =============================================
   Wireframe Geometry - Rotating shapes
   ============================================= */
function WireframeShape({
  position,
  geometry,
  speed = 0.3,
  scale = 1,
}: {
  position: [number, number, number];
  geometry: "icosahedron" | "octahedron" | "torus";
  speed?: number;
  scale?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
    mesh.current.rotation.y = state.clock.elapsedTime * speed * 0.2;
    mesh.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={mesh} position={position} scale={scale}>
        {geometry === "icosahedron" && <icosahedronGeometry args={[1, 1]} />}
        {geometry === "octahedron" && <octahedronGeometry args={[1, 0]} />}
        {geometry === "torus" && <torusGeometry args={[1, 0.3, 16, 32]} />}
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </Float>
  );
}

/* =============================================
   Connection Lines - Connecting particles
   ============================================= */
function ConnectionLines({ count = 15 }: { count?: number }) {
  const linesRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: { start: THREE.Vector3; end: THREE.Vector3 }[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        start: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8
        ),
        end: new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8
        ),
      });
    }
    return result;
  }, [count]);

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  const lineObjects = useMemo(() => {
    return lines.map((line) => {
      const points = [line.start, line.end];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: "#10b981",
        transparent: true,
        opacity: 0.06,
      });
      return new THREE.Line(geometry, material);
    });
  }, [lines]);

  return (
    <group ref={linesRef}>
      {lineObjects.map((lineObj, i) => (
        <primitive key={i} object={lineObj} />
      ))}
    </group>
  );
}

/* =============================================
   Main Scene3D Component
   ============================================= */
export default function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.2} color="#10b981" />

        <ParticleField count={250} />
        <ConnectionLines count={20} />

        <WireframeShape
          position={[-4, 2, -3]}
          geometry="icosahedron"
          speed={0.2}
          scale={1.5}
        />
        <WireframeShape
          position={[4, -1, -4]}
          geometry="octahedron"
          speed={0.3}
          scale={1.2}
        />
        <WireframeShape
          position={[0, -3, -5]}
          geometry="torus"
          speed={0.15}
          scale={1.8}
        />

        <Stars
          radius={50}
          depth={50}
          count={1000}
          factor={2}
          saturation={0}
          fade
          speed={0.5}
        />
      </Canvas>
    </div>
  );
}
