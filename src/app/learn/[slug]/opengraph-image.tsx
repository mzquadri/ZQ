import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { site } from "@/content/portfolio";
import { getPublishedLearnWriting, getPublishedWritingEntry } from "@/content/writing/repository";
import { levelLabel, topicLabel } from "@/content/writing/schema";

export const alt = "Technical writing by Mohd Zamin Quadri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPublishedLearnWriting().map((entry) => ({ slug: entry.slug }));
}

export default async function LearnOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getPublishedWritingEntry(slug, "learn");
  if (!entry) notFound();

  return new ImageResponse(
    <div style={{ background: "#f2f0e8", color: "#162126", display: "flex", fontFamily: "sans-serif", height: "100%", width: "100%" }}>
      <div style={{ background: "#d76531", display: "flex", width: 34 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
        <div style={{ color: "#006058", display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          {entry.kind} / {topicLabel(entry.topic)} / {levelLabel(entry.level)} / {entry.readingTime} min
        </div>
        <div style={{ display: "flex", fontFamily: "serif", fontSize: 72, fontWeight: 600, lineHeight: 1.02, maxWidth: 1020 }}>
          {entry.title}
        </div>
        <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
          <div style={{ color: "#455158", display: "flex", fontSize: 25 }}>{entry.description}</div>
          <div style={{ display: "flex", fontSize: 23, fontWeight: 700, marginLeft: 48, whiteSpace: "nowrap" }}>{site.name} / mzquadri.de</div>
        </div>
      </div>
    </div>,
    size,
  );
}
