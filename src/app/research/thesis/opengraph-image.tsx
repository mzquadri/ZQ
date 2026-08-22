import { ImageResponse } from "next/og";
import { site, thesis } from "@/content/portfolio";
import { researchEvidence } from "@/content/research";

export const alt = "Transport surrogate thesis research — uncertainty, calibration, and selective review";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ThesisResearchOpenGraphImage() {
  const halfRetention = researchEvidence.selectiveRisk.points.find((point) => point.retentionPct === 50)!;

  return new ImageResponse(
    <div style={{ background: "#102126", color: "#f8f6ef", display: "flex", fontFamily: "sans-serif", height: "100%", width: "100%" }}>
      <div style={{ background: "#d76531", display: "flex", width: 34 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "58px 70px", width: "100%" }}>
        <div style={{ color: "#f2cb57", display: "flex", fontSize: 23, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          {/* The status string already opens with "Master's thesis"; prefixing it said so twice. */}
          {thesis.status}
        </div>
        <div style={{ display: "flex", fontFamily: "serif", fontSize: 61, fontWeight: 600, lineHeight: 1.02, maxWidth: 1050 }}>
          Reliable GNN Surrogates for Transport Policy Analysis
        </div>
        <div style={{ alignItems: "flex-end", display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 44 }}>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#9ac9c4", fontSize: 18 }}>TEST SCOPE</span><strong style={{ fontFamily: "serif", fontSize: 38 }}>{(researchEvidence.scope.predictions / 1_000_000).toFixed(2)}M</strong></div>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#9ac9c4", fontSize: 18 }}>RANK ASSOCIATION</span><strong style={{ fontFamily: "serif", fontSize: 38 }}>ρ {researchEvidence.results.mcDropout.spearman.toFixed(3)}</strong></div>
            <div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#9ac9c4", fontSize: 18 }}>{halfRetention.retentionPct}% RETAINED</span><strong style={{ fontFamily: "serif", fontSize: 38 }}>−{halfRetention.reductionPct.toFixed(1)}% MAE</strong></div>
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700 }}>{site.name} / mzquadri.de</div>
        </div>
      </div>
    </div>,
    size,
  );
}
