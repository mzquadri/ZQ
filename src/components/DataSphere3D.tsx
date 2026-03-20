"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* =============================================
   Data Sphere 3D - Skills Section
   An abstract sphere made of data points,
   connections, and orbiting rings representing
   a universe of skills and technologies
   ============================================= */

const POINT_COUNT = 300;

function SpherePoints() {
  const ref = useRef<THREE.Points>(null);
  const { mouse } = useThree();
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(POINT_COUNT * 3);
    const col = new Float32Array(POINT_COUNT * 3);
    
    const emerald = new THREE.Color("#10b981");
    const emeraldLight = new THREE.Color("#34d399");
    const white = new THREE.Color("#e2e8f0");
    
    for (let i = 0; i < POINT_COUNT; i++) {
      // Fibonacci sphere
      const phi = Math.acos(1 - 2 * (i + 0.5) / POINT_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      // Multiple radii for layered effect
      const layer = i % 3;
      const radius = layer === 0 ? 2.0 : layer === 1 ? 2.5 : 3.0;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      // Color based on layer
      const color = layer === 0 ? emerald : layer === 1 ? emeraldLight : white;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    
    return [pos, col];
  }, []);
  
  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime;
    
    // Breathe effect + wave distortion
    const breathe = 1 + Math.sin(time * 0.3) * 0.05;
    for (let i = 0; i < POINT_COUNT; i++) {
      const bx = positions[i * 3];
      const by = positions[i * 3 + 1];
      
      const wave = Math.sin(time * 0.5 + bx * 0.5 + by * 0.3) * 0.02;
      
      positions[i * 3] += wave * breathe;
      positions[i * 3 + 1] += wave * breathe;
      positions[i * 3 + 2] += wave * 0.5 * breathe;
    }
    
    ref.current.geometry.attributes.position.needsUpdate = true;
    
    // Mouse interaction
    ref.current.rotation.y = time * 0.08 + mouse.x * 0.2;
    ref.current.rotation.x = Math.sin(time * 0.05) * 0.1 + mouse.y * 0.1;
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* Orbiting data rings */
function DataRing({ radius, speed, axis, color, opacity = 0.2 }: {
  radius: number;
  speed: number;
  axis: [number, number, number];
  color: string;
  opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = axis[0] + state.clock.elapsedTime * speed * 0.3;
    ref.current.rotation.y = axis[1] + state.clock.elapsedTime * speed;
    ref.current.rotation.z = axis[2];
  });
  
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.006, 8, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* Floating hexagons representing skill categories */
function SkillHexagons() {
  const groupRef = useRef<THREE.Group>(null);
  
  const hexagons = useMemo(() => {
    return [
      { pos: [3.5, 0, 0] as [number, number, number], color: "#10b981", size: 0.3 },
      { pos: [-3.5, 0.5, 0.5] as [number, number, number], color: "#34d399", size: 0.25 },
      { pos: [0, 3.5, -0.5] as [number, number, number], color: "#059669", size: 0.28 },
      { pos: [0, -3.5, 0.5] as [number, number, number], color: "#10b981", size: 0.22 },
      { pos: [2.5, 2.5, 0] as [number, number, number], color: "#34d399", size: 0.2 },
      { pos: [-2.5, -2.5, -0.3] as [number, number, number], color: "#059669", size: 0.26 },
    ];
  }, []);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
  });
  
  return (
    <group ref={groupRef}>
      {hexagons.map((hex, i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0.5} floatIntensity={0.3}>
          <mesh position={hex.pos} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[hex.size, hex.size, 0.02, 6]} />
            <meshBasicMaterial
              color={hex.color}
              transparent
              opacity={0.15}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* Energy core at center */
function EnergyCore() {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.setScalar(s);
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.rotation.x = state.clock.elapsedTime * 0.3;
    }
    if (glowRef.current) {
      const s = 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      glowRef.current.scale.setScalar(s);
    }
  });
  
  return (
    <>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.4} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

export default function DataSphere3D() {
  return (
    <group>
      <SpherePoints />
      <EnergyCore />
      <SkillHexagons />
      
      {/* Data rings at different angles */}
      <DataRing radius={2.8} speed={0.2} axis={[0.3, 0, 0]} color="#10b981" opacity={0.15} />
      <DataRing radius={3.3} speed={-0.15} axis={[0, 0, 0.5]} color="#34d399" opacity={0.1} />
      <DataRing radius={3.8} speed={0.1} axis={[0.6, 0, 0.3]} color="#059669" opacity={0.08} />
    </group>
  );
}
