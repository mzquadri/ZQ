"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* =============================================
   Geometric Avatar 3D - About Section
   An abstract geometric human figure made of
   emerald wireframes, particles, and flowing
   energy lines - representing the person
   ============================================= */

/* Head - Dodecahedron wireframe */
function Head() {
  const ref = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      innerRef.current.rotation.x = state.clock.elapsedTime * 0.15;
    }
  });
  
  return (
    <group position={[0, 2.8, 0]}>
      {/* Outer head shape */}
      <mesh ref={ref}>
        <dodecahedronGeometry args={[0.55, 1]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.4} />
      </mesh>
      {/* Inner rotating core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.3, 0]} />
        <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.3} />
      </mesh>
      {/* "Eyes" - two glowing points */}
      <mesh position={[-0.15, 0.05, 0.45]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#10b981" blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.15, 0.05, 0.45]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#10b981" blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* Torso - Elongated octahedron wireframe */
function Torso() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });
  
  return (
    <group position={[0, 1.3, 0]}>
      <mesh ref={ref} scale={[0.8, 1.4, 0.5]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Core energy */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* Arms - Segmented wireframe lines */
function Arm({ side }: { side: "left" | "right" }) {
  const groupRef = useRef<THREE.Group>(null);
  const x = side === "left" ? -1 : 1;
  
  useFrame((state) => {
    if (groupRef.current) {
      const swing = Math.sin(state.clock.elapsedTime * 0.4 + (side === "left" ? 0 : Math.PI)) * 0.1;
      groupRef.current.rotation.z = x * 0.3 + swing;
    }
  });
  
  return (
    <group ref={groupRef} position={[x * 0.7, 1.8, 0]}>
      {/* Upper arm */}
      <mesh position={[x * 0.3, -0.3, 0]} scale={[0.15, 0.5, 0.15]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.25} />
      </mesh>
      {/* Joint */}
      <mesh position={[x * 0.5, -0.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.5} />
      </mesh>
      {/* Lower arm */}
      <mesh position={[x * 0.6, -1.1, 0]} scale={[0.12, 0.5, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#059669" wireframe transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* Energy flow along the body */
function EnergyFlow() {
  const ref = useRef<THREE.Points>(null);
  const count = 60;
  
  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const by = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 4;
      pos[i * 3] = Math.sin(angle) * (0.3 + t * 0.2);
      pos[i * 3 + 1] = t * 3.5;
      pos[i * 3 + 2] = Math.cos(angle) * (0.3 + t * 0.2);
      by[i] = t * 3.5;
    }
    return [pos];
  }, []);
  
  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const offset = (time * 0.5 + t) % 1;
      const angle = (t + time * 0.2) * Math.PI * 4;
      positions[i * 3] = Math.sin(angle) * (0.3 + t * 0.15);
      positions[i * 3 + 1] = offset * 3.5;
      positions[i * 3 + 2] = Math.cos(angle) * (0.3 + t * 0.15);
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#34d399"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* Floating particles surrounding the avatar */
function AuraParticles({ count = 50 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 1.5;
      const height = Math.random() * 4;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count]);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#10b981"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function GeometricAvatar3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    // Subtle mouse follow
    groupRef.current.rotation.y = mouse.x * 0.2;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1 - 1.5;
  });
  
  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={groupRef} scale={0.8}>
        <Head />
        <Torso />
        <Arm side="left" />
        <Arm side="right" />
        <EnergyFlow />
        <AuraParticles />
        
        {/* Ground glow */}
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.5, 32]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>
    </Float>
  );
}
