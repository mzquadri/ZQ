"use client";

import { Canvas } from "@react-three/fiber";
import DataSphere3D from "./DataSphere3D";

export default function DataSphereCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.15} />
      <pointLight position={[8, 8, 8]} intensity={0.3} color="#10b981" />
      <DataSphere3D />
    </Canvas>
  );
}
