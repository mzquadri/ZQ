import dynamic from "next/dynamic";
import { Suspense } from "react";

const DriveScene = dynamic(() => import("./DriveScene"), { ssr: false });

export const metadata = {
  title: "Drive — Mohd Zamin Quadri",
  description: "Drivable 3D portfolio world.",
};

export default function DrivePage() {
  return (
    <main className="fixed inset-0 bg-dark-950 overflow-hidden">
      <Suspense fallback={null}>
        <DriveScene />
      </Suspense>
    </main>
  );
}
