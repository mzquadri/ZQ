"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* =============================================
   Floating Section Elements
   Ambient floating 3D shapes that appear between
   sections to create depth and continuity
   ============================================= */

function FloatingShape({
  position,
  geometry,
  color,
  speed,
  rotationSpeed,
  scale,
  opacity,
}: {
  position: [number, number, number];
  geometry: "icosahedron" | "octahedron" | "torus" | "tetrahedron" | "dodecahedron";
  color: string;
  speed: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * rotationSpeed * 0.3;
    ref.current.rotation.y = state.clock.elapsedTime * rotationSpeed * 0.2;
    ref.current.rotation.z = state.clock.elapsedTime * rotationSpeed * 0.15;
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry === "icosahedron" && <icosahedronGeometry args={[1, 0]} />}
        {geometry === "octahedron" && <octahedronGeometry args={[1, 0]} />}
        {geometry === "torus" && <torusGeometry args={[1, 0.3, 8, 16]} />}
        {geometry === "tetrahedron" && <tetrahedronGeometry args={[1, 0]} />}
        {geometry === "dodecahedron" && <dodecahedronGeometry args={[1, 0]} />}
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
}

function AmbientParticles({ count = 30 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#10b981"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

interface FloatingElementsProps {
  variant?: "a" | "b" | "c";
  className?: string;
}

export default function FloatingElements({ variant = "a", className = "" }: FloatingElementsProps) {
  const shapes = useMemo(() => {
    if (variant === "a") {
      return [
        { position: [-4, 0, -3] as [number, number, number], geometry: "icosahedron" as const, color: "#10b981", speed: 1.5, rotationSpeed: 0.3, scale: 0.6, opacity: 0.08 },
        { position: [4, 0.5, -4] as [number, number, number], geometry: "octahedron" as const, color: "#34d399", speed: 1.2, rotationSpeed: 0.2, scale: 0.5, opacity: 0.06 },
        { position: [0, -0.5, -5] as [number, number, number], geometry: "torus" as const, color: "#059669", speed: 1.8, rotationSpeed: 0.15, scale: 0.8, opacity: 0.05 },
      ];
    } else if (variant === "b") {
      return [
        { position: [-3, 0, -2] as [number, number, number], geometry: "tetrahedron" as const, color: "#34d399", speed: 1.3, rotationSpeed: 0.25, scale: 0.5, opacity: 0.07 },
        { position: [3.5, -0.5, -3] as [number, number, number], geometry: "dodecahedron" as const, color: "#10b981", speed: 1.6, rotationSpeed: 0.35, scale: 0.4, opacity: 0.06 },
        { position: [-1, 0.5, -4] as [number, number, number], geometry: "icosahedron" as const, color: "#059669", speed: 1.1, rotationSpeed: 0.2, scale: 0.7, opacity: 0.05 },
      ];
    }
    return [
      { position: [-3.5, 0, -3] as [number, number, number], geometry: "dodecahedron" as const, color: "#10b981", speed: 1.4, rotationSpeed: 0.2, scale: 0.55, opacity: 0.07 },
      { position: [3, 0.3, -2.5] as [number, number, number], geometry: "tetrahedron" as const, color: "#34d399", speed: 1.7, rotationSpeed: 0.3, scale: 0.45, opacity: 0.06 },
    ];
  }, [variant]);

  return (
    <div className={`w-full h-32 md:h-48 relative ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        {shapes.map((shape, i) => (
          <FloatingShape key={i} {...shape} />
        ))}
        <AmbientParticles count={20} />
      </Canvas>
    </div>
  );
}
