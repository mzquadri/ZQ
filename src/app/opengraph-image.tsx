import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mohd Zamin Quadri — Applied ML and reliable systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f2f0e8",
          color: "#101820",
          padding: "70px 76px",
          border: "18px solid #101820",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 3 }}>
          <span>MZQ / PORTFOLIO</span>
          <span style={{ color: "#006d65" }}>MUNICH, DE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 72, fontWeight: 700, maxWidth: 980, lineHeight: 1.02 }}>
            Applied ML with evidence built in.
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 28 }}>
            <span>Reliable ML</span><span>·</span><span>GNNs</span><span>·</span><span>MLOps</span><span>·</span><span>Scientific computing</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <strong style={{ fontSize: 34 }}>Mohd Zamin Quadri</strong>
          <span style={{ background: "#ff5b35", padding: "12px 18px", fontSize: 22 }}>mzquadri.de</span>
        </div>
      </div>
    ),
    size,
  );
}
