"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Leva } from "leva";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function DriveScene() {
  const searchParams = useSearchParams();
  const debug = searchParams.get("debug") === "1";

  return (
    <>
      <Leva hidden={!debug} collapsed />
      <Canvas
        camera={{ position: [12, 8, 12], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        style={{ background: "#030712" }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#030712"]} />
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[8, 12, 6]}
            intensity={0.9}
            color="#ffffff"
          />
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            target={[0, 0, 0]}
          />
        </Suspense>
      </Canvas>
    </>
  );
}
