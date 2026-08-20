import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

import { capabilities, getProject, resumeProjectSlugs, site, thesis } from "../src/content/portfolio";

const rendererFiles = [
  "next.config.mjs",
  "package.json",
  "package-lock.json",
  "postcss.config.mjs",
  "scripts/generate-resume.ts",
  "scripts/resume-contract.ts",
  "tailwind.config.ts",
  "tsconfig.json",
] as const;

function collectFiles(root: string): string[] {
  return readdirSync(resolve(root), { recursive: true })
    .filter((path): path is string => typeof path === "string")
    .map((path) => resolve(root, path))
    .filter((path) => statSync(path).isFile())
    .map((path) => relative(process.cwd(), path).replace(/\\/g, "/"));
}

export const resumeSourceRecord = {
  schemaVersion: 1,
  identity: {
    name: site.name,
    role: site.role,
    positioning: site.positioning,
    location: site.location,
    domain: site.domain,
    github: site.github,
    linkedin: site.linkedin,
  },
  experience: site.experience,
  education: site.education,
  thesis: {
    title: thesis.title,
    status: thesis.status,
  },
  selectedProjects: resumeProjectSlugs.map((slug) => {
    const project = getProject(slug)!;
    return {
      slug: project.slug,
      title: project.title,
      summary: project.summary,
      evidence: project.evidence[0],
    };
  }),
  capabilities,
};

export function sha256(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

export function getResumeSourceSha256() {
  const renderer = [...rendererFiles, ...collectFiles("src")].sort().map((path) => ({
    path,
    sha256: sha256(readFileSync(resolve(path))),
  }));
  return sha256(JSON.stringify({ record: resumeSourceRecord, renderer }));
}

export type ResumeManifest = {
  schemaVersion: 1;
  sourceSha256: string;
  pdfSha256: string;
  tagged: true;
};
