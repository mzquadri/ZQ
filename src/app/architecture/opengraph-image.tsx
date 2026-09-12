import { ImageResponse } from "next/og";
import { architecture } from "@/content/architecture";
import { site } from "@/content/portfolio";

export const alt =
  "Architecture case studies by Mohd Zamin Quadri — the systems, drawn at the level an interviewer asks about";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * The card for the page most likely to be pasted into a message.
 *
 * It carries the four panes from the page figure rather than a photograph or a logo, so a reader
 * who has seen the card recognises the page when it opens. No label appears on them, for the same
 * reason no label appears on the page: a labelled version would be the material this site does
 * not publish.
 */
export default function ArchitectureOpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0d1117",
        color: "#f2f0e8",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        height: "100%",
        justifyContent: "space-between",
        padding: "62px 72px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: "#34d399",
          display: "flex",
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {architecture.eyebrow}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", fontSize: 70, fontWeight: 700, lineHeight: 1.04, maxWidth: 1000 }}>
          The systems, drawn at the level an interviewer asks about.
        </div>
        <div style={{ color: "#9fb0bb", display: "flex", fontSize: 26, gap: 18 }}>
          <span>Twenty diagrams</span><span>·</span>
          <span>Interactive walkthrough</span><span>·</span>
          <span>Stated contribution</span>
        </div>
      </div>

      <div style={{ alignItems: "flex-end", display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <strong style={{ fontSize: 32 }}>{site.name}</strong>
          <span style={{ color: "#9fb0bb", fontSize: 23 }}>
            {site.role} · {site.location}
          </span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[0, 1, 2, 3].map((pane) => (
            <div
              key={pane}
              style={{
                background: "rgba(52, 211, 153, 0.12)",
                border: "2px solid rgba(52, 211, 153, 0.7)",
                borderRadius: 6,
                display: "flex",
                height: 78,
                width: 58,
              }}
            />
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
