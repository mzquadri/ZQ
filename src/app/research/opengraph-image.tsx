import { ImageResponse } from "next/og";
import { site } from "@/content/portfolio";

export const alt = "Research by Mohd Zamin Quadri — reliable machine learning from prediction to decisions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ResearchOpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#f2f0e8", color: "#162126", display: "flex", fontFamily: "sans-serif", height: "100%", width: "100%" }}>
      <div style={{ background: "#006d65", display: "flex", width: 34 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
        <div style={{ color: "#006058", display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          Research / Reliable ML / Scientific modelling
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 78, fontWeight: 600, lineHeight: 1.02, maxWidth: 1030 }}>
            From fast predictions to decisions that expose uncertainty.
          </div>
          <div style={{ color: "#455158", display: "flex", fontSize: 27, maxWidth: 940 }}>
            Graph surrogates, calibration, conformal coverage, and selective review.
          </div>
        </div>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "#d76531", display: "flex", fontSize: 24, fontWeight: 700 }}>Point prediction → uncertainty → decision</div>
          <div style={{ display: "flex", fontSize: 23, fontWeight: 700 }}>{site.name} / mzquadri.de</div>
        </div>
      </div>
    </div>,
    size,
  );
}
