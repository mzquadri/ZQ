"use client";

import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* =============================================
   Neural Network Brain - Hero Centerpiece
   A glowing network of neurons with pulsing
   connections that react to mouse movement
   ============================================= */

const NEURON_COUNT = 80;
const CONNECTION_DISTANCE = 2.8;
const PULSE_SPEED = 0.8;

interface NeuronData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
  layer: number;
  size: number;
}

function Neurons() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { mouse } = useThree();

  const neurons: NeuronData[] = useMemo(() => {
    const result: NeuronData[] = [];
    // Create neurons in a brain-like sphere shape
    for (let i = 0; i < NEURON_COUNT; i++) {
      // Fibonacci sphere distribution for even spacing
      const phi = Math.acos(1 - 2 * (i + 0.5) / NEURON_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      
      // Vary radius for organic shape (brain-like)
      const baseRadius = 2.5;
      const radiusVariation = Math.sin(phi * 3) * 0.4 + Math.cos(theta * 2) * 0.3;
      const radius = baseRadius + radiusVariation;
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      
      const pos = new THREE.Vector3(x, y, z);
      result.push({
        position: pos.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        ),
        basePosition: pos.clone(),
        layer: Math.floor(i / (NEURON_COUNT / 4)),
        size: Math.random() * 0.08 + 0.03,
      });
    }
    return result;
  }, []);

  // Pre-allocate geometry buffers
  const { positions, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(NEURON_COUNT * 3);
    const sz = new Float32Array(NEURON_COUNT);
    const col = new Float32Array(NEURON_COUNT * 3);
    
    const emerald = new THREE.Color("#10b981");
    const emeraldLight = new THREE.Color("#34d399");
    const white = new THREE.Color("#ffffff");
    
    neurons.forEach((neuron, i) => {
      pos[i * 3] = neuron.position.x;
      pos[i * 3 + 1] = neuron.position.y;
      pos[i * 3 + 2] = neuron.position.z;
      sz[i] = neuron.size;
      
      // Color based on layer
      const t = neuron.layer / 4;
      const color = emerald.clone().lerp(t > 0.5 ? white : emeraldLight, t * 0.5);
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    });
    
    return { positions: pos, sizes: sz, colors: col };
  }, [neurons]);

  // Connection lines buffer (max possible connections)
  const maxConnections = NEURON_COUNT * 6;
  const linePositions = useMemo(() => new Float32Array(maxConnections * 6), [maxConnections]);
  const lineColors = useMemo(() => new Float32Array(maxConnections * 6), [maxConnections]);

  const updateConnections = useCallback((time: number) => {
    if (!linesRef.current) return;
    
    let lineIndex = 0;
    const emerald = new THREE.Color("#10b981");
    
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dist = neurons[i].position.distanceTo(neurons[j].position);
        if (dist < CONNECTION_DISTANCE) {
          const opacity = 1 - (dist / CONNECTION_DISTANCE);
          const pulse = (Math.sin(time * PULSE_SPEED + i * 0.1 + j * 0.05) + 1) * 0.5;
          const intensity = opacity * pulse;
          
          // Start point
          linePositions[lineIndex * 6] = neurons[i].position.x;
          linePositions[lineIndex * 6 + 1] = neurons[i].position.y;
          linePositions[lineIndex * 6 + 2] = neurons[i].position.z;
          // End point
          linePositions[lineIndex * 6 + 3] = neurons[j].position.x;
          linePositions[lineIndex * 6 + 4] = neurons[j].position.y;
          linePositions[lineIndex * 6 + 5] = neurons[j].position.z;
          
          // Colors with intensity
          lineColors[lineIndex * 6] = emerald.r * intensity;
          lineColors[lineIndex * 6 + 1] = emerald.g * intensity;
          lineColors[lineIndex * 6 + 2] = emerald.b * intensity;
          lineColors[lineIndex * 6 + 3] = emerald.r * intensity;
          lineColors[lineIndex * 6 + 4] = emerald.g * intensity;
          lineColors[lineIndex * 6 + 5] = emerald.b * intensity;
          
          lineIndex++;
          if (lineIndex >= maxConnections) break;
        }
      }
      if (lineIndex >= maxConnections) break;
    }
    
    const geom = linesRef.current.geometry;
    geom.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions.slice(0, lineIndex * 6), 3)
    );
    geom.setAttribute(
      "color",
      new THREE.BufferAttribute(lineColors.slice(0, lineIndex * 6), 3)
    );
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;
    geom.setDrawRange(0, lineIndex * 2);
  }, [neurons, linePositions, lineColors, maxConnections]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (!pointsRef.current) return;
    
    // Mouse influence
    const mouseX = mouse.x * 0.5;
    const mouseY = mouse.y * 0.5;
    
    // Update neuron positions with organic movement
    neurons.forEach((neuron, i) => {
      // Organic drift
      neuron.position.x = neuron.basePosition.x + Math.sin(time * 0.3 + i * 0.1) * 0.15 + mouseX * 0.3;
      neuron.position.y = neuron.basePosition.y + Math.cos(time * 0.4 + i * 0.15) * 0.15 + mouseY * 0.3;
      neuron.position.z = neuron.basePosition.z + Math.sin(time * 0.2 + i * 0.2) * 0.1;
      
      positions[i * 3] = neuron.position.x;
      positions[i * 3 + 1] = neuron.position.y;
      positions[i * 3 + 2] = neuron.position.z;
      
      // Pulse size
      sizes[i] = neuron.size * (1 + Math.sin(time * 2 + i) * 0.3);
    });
    
    const geom = pointsRef.current.geometry;
    geom.attributes.position.needsUpdate = true;
    (geom.attributes as Record<string, THREE.BufferAttribute>).size.needsUpdate = true;
    
    // Rotate whole network slowly
    pointsRef.current.rotation.y = time * 0.05;
    pointsRef.current.rotation.x = Math.sin(time * 0.03) * 0.1;
    
    // Update connections
    updateConnections(time);
    if (linesRef.current) {
      linesRef.current.rotation.y = time * 0.05;
      linesRef.current.rotation.x = Math.sin(time * 0.03) * 0.1;
    }
  });

  return (
    <group>
      {/* Neuron points */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry />
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

/* Orbiting rings around the brain */
function OrbitalRing({ radius, speed, tilt, color }: { radius: number; speed: number; tilt: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = tilt;
    ref.current.rotation.y = state.clock.elapsedTime * speed;
  });
  
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

/* Floating data particles around the brain */
function DataParticles({ count = 40 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = 3.5 + Math.random() * 2;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, [count]);
  
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.2;
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
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

/* Pulsing core glow */
function CoreGlow() {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!ref.current) return;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    ref.current.scale.setScalar(scale);
  });
  
  return (
    <Float speed={0.5} rotationIntensity={0} floatIntensity={0.2}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.03}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Float>
  );
}

export default function NeuralNetwork3D() {
  return (
    <group position={[0, 0, 0]}>
      <Neurons />
      <CoreGlow />
      <DataParticles count={50} />
      
      {/* Orbital rings */}
      <OrbitalRing radius={3.5} speed={0.15} tilt={0.3} color="#10b981" />
      <OrbitalRing radius={4.0} speed={-0.1} tilt={-0.5} color="#34d399" />
      <OrbitalRing radius={4.5} speed={0.08} tilt={0.8} color="#059669" />
    </group>
  );
}
