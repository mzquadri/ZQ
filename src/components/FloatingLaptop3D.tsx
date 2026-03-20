"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

/* =============================================
   Floating Laptop 3D - Projects Section
   A procedural 3D laptop model with glowing screen
   showing code/data, surrounded by floating icons
   ============================================= */

function LaptopBase() {
  const ref = useRef<THREE.Group>(null);
  
  return (
    <group ref={ref}>
      {/* Laptop bottom (keyboard section) */}
      <RoundedBox args={[3.2, 0.12, 2.0]} radius={0.04} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>
      
      {/* Keyboard area (dark inset) */}
      <RoundedBox args={[2.8, 0.01, 1.5]} radius={0.02} smoothness={4} position={[0, 0.07, -0.1]}>
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.3}
          roughness={0.8}
        />
      </RoundedBox>
      
      {/* Trackpad */}
      <RoundedBox args={[0.8, 0.01, 0.5]} radius={0.02} smoothness={4} position={[0, 0.07, 0.55]}>
        <meshStandardMaterial
          color="#1a2332"
          metalness={0.5}
          roughness={0.5}
        />
      </RoundedBox>
      
      {/* Key dots for keyboard illusion */}
      {Array.from({ length: 30 }).map((_, i) => {
        const row = Math.floor(i / 10);
        const col = i % 10;
        return (
          <mesh key={i} position={[-1.2 + col * 0.27, 0.075, -0.5 + row * 0.35]}>
            <boxGeometry args={[0.18, 0.01, 0.2]} />
            <meshStandardMaterial color="#162031" metalness={0.4} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

function LaptopScreen() {
  const screenRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (glowRef.current) {
      const intensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
    }
  });
  
  return (
    <group ref={screenRef} position={[0, 1.15, -0.95]} rotation={[-0.25, 0, 0]}>
      {/* Screen bezel */}
      <RoundedBox args={[3.2, 2.1, 0.08]} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.8}
          roughness={0.2}
        />
      </RoundedBox>
      
      {/* Screen display */}
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[2.9, 1.8]} />
        <meshBasicMaterial color="#030712" />
      </mesh>
      
      {/* Code lines on screen */}
      {Array.from({ length: 12 }).map((_, i) => {
        const width = 0.5 + Math.random() * 1.5;
        const indent = i % 3 === 0 ? 0 : i % 3 === 1 ? 0.2 : 0.4;
        const isHighlight = i === 3 || i === 7;
        return (
          <mesh key={i} position={[-1.2 + indent + width / 2, 0.7 - i * 0.13, 0.05]}>
            <planeGeometry args={[width, 0.04]} />
            <meshBasicMaterial
              color={isHighlight ? "#10b981" : "#334155"}
              transparent
              opacity={isHighlight ? 0.9 : 0.6}
            />
          </mesh>
        );
      })}
      
      {/* Screen glow */}
      <mesh ref={glowRef} position={[0, 0, 0.03]}>
        <planeGeometry args={[3.5, 2.5]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* Floating code/data symbols around the laptop */
function FloatingSymbols() {
  const groupRef = useRef<THREE.Group>(null);
  
  const symbols = useMemo(() => {
    const items = [
      { text: "{ }", pos: [-2.5, 1.5, 0.5] as [number, number, number], size: 0.18 },
      { text: "</>", pos: [2.5, 1.8, -0.3] as [number, number, number], size: 0.16 },
      { text: "AI", pos: [-2.0, 0.3, 1.0] as [number, number, number], size: 0.22 },
      { text: "ML", pos: [2.3, 0.5, 0.8] as [number, number, number], size: 0.2 },
      { text: ">>", pos: [-1.8, 2.3, -0.5] as [number, number, number], size: 0.15 },
      { text: "0x", pos: [1.8, 2.5, 0.3] as [number, number, number], size: 0.14 },
      { text: "fn()", pos: [-2.8, 1.0, -0.2] as [number, number, number], size: 0.13 },
      { text: "API", pos: [2.8, 1.2, 0.5] as [number, number, number], size: 0.15 },
    ];
    return items;
  }, []);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.y += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.001;
      child.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + i * 0.5) * 0.2;
    });
  });
  
  return (
    <group ref={groupRef}>
      {symbols.map((sym, i) => (
        <Float key={i} speed={1 + i * 0.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <Text
            position={sym.pos}
            fontSize={sym.size}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
            font="/fonts/JetBrainsMono-Regular.ttf"
            fillOpacity={0.5}
          >
            {sym.text}
            <meshBasicMaterial
              color="#10b981"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
            />
          </Text>
        </Float>
      ))}
    </group>
  );
}

/* Data streams flowing from laptop */
function DataStreams({ count = 20 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positionsRef = useRef<Float32Array>(new Float32Array(count * 3));
  const velocities = useRef<Float32Array>(new Float32Array(count));
  
  useMemo(() => {
    for (let i = 0; i < count; i++) {
      positionsRef.current[i * 3] = (Math.random() - 0.5) * 2;
      positionsRef.current[i * 3 + 1] = Math.random() * 3;
      positionsRef.current[i * 3 + 2] = (Math.random() - 0.5) * 1;
      velocities.current[i] = 0.01 + Math.random() * 0.02;
    }
  }, [count]);
  
  useFrame(() => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      positionsRef.current[i * 3 + 1] += velocities.current[i];
      if (positionsRef.current[i * 3 + 1] > 3.5) {
        positionsRef.current[i * 3 + 1] = 0;
        positionsRef.current[i * 3] = (Math.random() - 0.5) * 2;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsRef.current, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#34d399"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function FloatingLaptop3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle floating + mouse follow
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1 + mouse.x * 0.15;
    groupRef.current.rotation.x = -0.2 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05 + mouse.y * 0.08;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });
  
  return (
    <group ref={groupRef} scale={0.9}>
      <LaptopBase />
      <LaptopScreen />
      <FloatingSymbols />
      <DataStreams />
      
      {/* Ground reflection glow */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
