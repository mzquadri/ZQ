import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getProject, projects, site } from "@/content/portfolio";

export const alt = "Project case study by Mohd Zamin Quadri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectOpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const metric = project.evidence[0];

  return new ImageResponse(
    <div
      style={{
        alignItems: "stretch",
        background: "#f2f0e8",
        color: "#162126",
        display: "flex",
        fontFamily: "sans-serif",
        height: "100%",
        width: "100%",
      }}
    >
      <div style={{ background: "#006d65", display: "flex", width: 34 }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: "100%" }}>
        <div style={{ color: "#006058", display: "flex", fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
          {project.classification}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontFamily: "serif", fontSize: 66, fontWeight: 600, lineHeight: 1.02, maxWidth: 960 }}>
            {project.title}
          </div>
          <div style={{ color: "#455158", display: "flex", fontSize: 26, maxWidth: 910 }}>
            {project.projectRole}
          </div>
        </div>
        <div style={{ alignItems: "flex-end", display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#006058", display: "flex", fontSize: 20, fontWeight: 700, textTransform: "uppercase" }}>{metric.label}</div>
            <div style={{ display: "flex", fontFamily: "serif", fontSize: 48 }}>{metric.value}</div>
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700 }}>{site.name} / mzquadri.de</div>
        </div>
      </div>
    </div>,
    size,
  );
}
