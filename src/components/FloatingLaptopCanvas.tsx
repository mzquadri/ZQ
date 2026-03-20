"use client";

import { Canvas } from "@react-three/fiber";
import FloatingLaptop3D from "./FloatingLaptop3D";

export default function FloatingLaptopCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#10b981" />
      <pointLight position={[-5, -5, 5]} intensity={0.15} color="#34d399" />
      <FloatingLaptop3D />
    </Canvas>
  );
}
