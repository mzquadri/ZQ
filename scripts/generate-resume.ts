import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { getResumeSourceSha256, sha256, type ResumeManifest } from "./resume-contract";

const port = 3200;
const origin = `http://127.0.0.1:${port}`;
const nextCli = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${origin}/resume`);
      if (response.ok) return;
    } catch {
      // The production server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Timed out waiting for the resume route");
}

async function main() {
  const server = spawn(process.execPath, [nextCli, "start", "-p", String(port)], {
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "ignore",
  });

  try {
    await waitForServer();
    await mkdir(join(process.cwd(), "public"), { recursive: true });
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${origin}/resume`, { waitUntil: "networkidle" });
    const pdfPath = join(process.cwd(), "public", "mohd-zamin-quadri-resume.pdf");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      tagged: true,
      outline: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });
    await browser.close();
    const pdf = await readFile(pdfPath);
    const manifest: ResumeManifest = {
      schemaVersion: 1,
      sourceSha256: getResumeSourceSha256(),
      pdfSha256: sha256(pdf),
      tagged: true,
    };
    await writeFile(
      join(process.cwd(), "public", "mohd-zamin-quadri-resume.manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    console.log("Generated public/mohd-zamin-quadri-resume.pdf");
  } finally {
    server.kill();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
