"use client";

import { Canvas } from "@react-three/fiber";
import GeometricAvatar3D from "./GeometricAvatar3D";

export default function GeometricAvatarCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.3} color="#10b981" />
      <GeometricAvatar3D />
    </Canvas>
  );
}
