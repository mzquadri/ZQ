"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import NeuralNetwork3D from "./NeuralNetwork3D";

/* =============================================
   Immersive Hero Scene - Full-screen 3D
   Features:
   - Neural Network brain centerpiece
   - Deep star field background
   - Bloom + vignette postprocessing
   - Interactive mouse-reactive camera
   - Floating wireframe shapes at edges
   - Ambient particle fog
   ============================================= */

/* Mouse-reactive camera */
function InteractiveCamera() {
  const { camera, mouse } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8));
  
  useFrame(() => {
    // Smooth camera follow mouse
    targetPosition.current.x = mouse.x * 1.2;
    targetPosition.current.y = mouse.y * 0.8;
    targetPosition.current.z = 8;
    
    camera.position.lerp(targetPosition.current, 0.02);
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

/* Background particle fog */
function ParticleFog({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    return pos;
  }, [count]);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.005;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.02;
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#10b981"
        transparent
        opacity={0.25}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* Peripheral wireframe decorations */
function PeripheralShapes() {
  const group1 = useRef<THREE.Mesh>(null);
  const group2 = useRef<THREE.Mesh>(null);
  const group3 = useRef<THREE.Mesh>(null);
  const group4 = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group1.current) {
      group1.current.rotation.x = t * 0.1;
      group1.current.rotation.y = t * 0.15;
      group1.current.position.y = -2 + Math.sin(t * 0.3) * 0.5;
    }
    if (group2.current) {
      group2.current.rotation.y = t * 0.12;
      group2.current.rotation.z = t * 0.08;
      group2.current.position.y = 2 + Math.cos(t * 0.25) * 0.4;
    }
    if (group3.current) {
      group3.current.rotation.x = t * 0.08;
      group3.current.rotation.z = t * 0.1;
      group3.current.position.x = -6 + Math.sin(t * 0.2) * 0.3;
    }
    if (group4.current) {
      group4.current.rotation.y = t * 0.1;
      group4.current.rotation.x = t * 0.06;
      group4.current.position.x = 6 + Math.cos(t * 0.2) * 0.3;
    }
  });
  
  return (
    <>
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={group1} position={[-5, -2, -6]} scale={1.2}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.06} />
        </mesh>
      </Float>
      <Float speed={1.0} rotationIntensity={0.15} floatIntensity={0.2}>
        <mesh ref={group2} position={[5.5, 2, -7]} scale={1.5}>
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.05} />
        </mesh>
      </Float>
      <Float speed={0.6} rotationIntensity={0.25} floatIntensity={0.4}>
        <mesh ref={group3} position={[-6, 1, -4]} scale={0.8}>
          <torusGeometry args={[1, 0.3, 8, 24]} />
          <meshBasicMaterial color="#059669" wireframe transparent opacity={0.04} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh ref={group4} position={[6, -1, -5]} scale={1.0}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.05} />
        </mesh>
      </Float>
    </>
  );
}

/* Grid plane for depth */
function GridPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, -5]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshBasicMaterial
        color="#10b981"
        wireframe
        transparent
        opacity={0.015}
      />
    </mesh>
  );
}

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
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        style={{ background: "transparent" }}
      >
        {/* Interactive camera */}
        <InteractiveCamera />
        
        {/* Lights */}
        <ambientLight intensity={0.15} />
        <pointLight position={[10, 10, 10]} intensity={0.3} color="#10b981" />
        <pointLight position={[-10, -5, 5]} intensity={0.15} color="#34d399" />
        
        {/* Neural Network Brain - centerpiece */}
        <NeuralNetwork3D />
        
        {/* Background elements */}
        <ParticleFog count={400} />
        <PeripheralShapes />
        <GridPlane />
        
        {/* Deep star field */}
        <Stars
          radius={80}
          depth={60}
          count={1500}
          factor={2}
          saturation={0}
          fade
          speed={0.3}
        />
        
        {/* Post-processing */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={0.8}
            mipmapBlur
          />
          <Vignette
            eskil={false}
            offset={0.1}
            darkness={0.8}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
