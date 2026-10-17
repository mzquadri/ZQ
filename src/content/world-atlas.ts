import { configurations } from "@/content/gateway-world";
import { insureAssistBenchmark } from "@/content/insureassist-benchmark";
import { calibration } from "@/content/thesis-world";
import { site } from "@/content/truth";

/**
 * The six places the world is built out of.
 *
 * The ground is the Paris road network from the thesis, so the thesis stands at
 * the centre of it and everything else is sited by what it has to do with that
 * ground: the two retrieval systems out on one arm, the two employers on
 * another, teaching where the work started.
 *
 * Every headline is read from a content module rather than typed, so a number
 * cannot drift between the world and the page that explains it. The exception
 * is the AUDI row, whose source is a paper certificate rather than a
 * repository; its figures come from the CV and are stated in the same words.
 *
 * None of those imports is `portfolio.ts`, and that is deliberate. This module
 * is reached from a client component, and portfolio.ts carries the whole
 * project catalogue including the confidential draft. Importing one figure
 * from it put the draft's title and summary into a static chunk served to
 * every browser, which the privacy scan caught: the route was a correct 404
 * and the strings shipped anyway. Narrow modules keep that from recurring.
 */

export type Place = {
  id: string;
  /** Shown as the marker label. Short enough to read at a distance. */
  name: string;
  /** One line: what it is. */
  kind: string;
  /** The single real result this place is worth visiting for. */
  headline: string;
  /** The sentence under the headline. Plain words, no jargon chain. */
  detail: string;
  /** Where on the ground it stands, in world units. The centre is the thesis. */
  at: readonly [number, number];
  /** Which structure to raise here. Each is a different shape, not a different colour. */
  form: "tower" | "stack" | "beams" | "gate" | "grid" | "surface";
  /** Where the classic view explains it in full. */
  href: string;
  /** Accent: 0 research, 1 engineering, 2 industry. Drives the marker hue only. */
  family: 0 | 1 | 2;
};

/** A stored share, said the way every other surface says it. */
const pct = (share: number) => `${Number((share * 100).toFixed(1))}%`;

const gateway = configurations.find((row) => row.key === "gateway");
const keyword = configurations.find((row) => row.key === "keyword");

export const places: readonly Place[] = [
  {
    id: "thesis",
    name: "Master's thesis",
    kind: "Uncertainty for a traffic surrogate",
    headline: `Calibration error down ${Math.round(calibration.improvementPct)}%`,
    detail:
      "Taught a graph neural network that predicts traffic across Paris to report how confident it is. Setting aside the least confident half of its predictions lowers the error on the rest by 41%.",
    at: [0, 0],
    form: "tower",
    href: "/research/thesis",
    family: 0,
  },
  {
    id: "legal-kb",
    name: "BP-IT Consulting",
    kind: "Legal knowledge base, 2025 to 2026",
    headline: "Four of the five services",
    detail:
      "A three-stage pipeline taking published German and EU law into relational, vector and graph storage, behind up to fourteen checks before a law is certified.",
    at: [2.55, -1.5],
    form: "stack",
    href: "/work",
    family: 2,
  },
  {
    id: "insureassist",
    name: "InsureAssist",
    kind: "Question answering over policies",
    headline: `Right document ${pct(insureAssistBenchmark.baselines.startingPoint.topDocumentAccuracy)} to ${pct(insureAssistBenchmark.selected.topDocumentAccuracy)}`,
    detail:
      "Keeping each clause with the form it belongs to moved the retrieval, not the fusion. Fusion earned its place on ranking instead.",
    at: [-2.7, -1.35],
    form: "beams",
    href: "/work/insureassist-rag",
    family: 1,
  },
  {
    id: "gateway",
    name: "MCP Policy Gateway",
    kind: "A gatekeeper for AI tool use",
    headline: `${pct(gateway?.caught ?? 0.9615)} caught, ${pct(gateway?.falseBlock ?? 0.0952)} wrongly refused`,
    detail: `Reads the call arguments and the returned results, not only how a tool describes itself. A keyword filter manages ${pct(keyword?.caught ?? 0.3846)} and ${pct(keyword?.falseBlock ?? 0.3333)} on the same cases.`,
    at: [-2.85, 1.65],
    form: "gate",
    href: "/work/mcp-policy-gateway",
    family: 1,
  },
  {
    id: "audi",
    name: "AUDI AG",
    kind: "Release tracking, 2023",
    headline: "600 rows and 130+ columns, one dropdown",
    detail:
      "An Excel VBA tool that replaced a manual search through the release sheet. German and Chinese versions, connected to the FREIPRO release system.",
    at: [2.7, 1.5],
    form: "grid",
    href: "/about",
    family: 2,
  },
  {
    id: "teaching",
    name: "TUM teaching",
    kind: "MATLAB labs, 2022 and 2023",
    headline: "Introduction to Programming (MA0010)",
    detail:
      "Taught the MATLAB labs at the Chair of Numerical Mathematics: fast array code, linear systems, and 2D and 3D plotting.",
    at: [0, 3.15],
    form: "surface",
    href: "/about",
    family: 0,
  },
] as const;

/** What the world is, said once, for the heading and the recording. */
export const worldIntro = {
  title: `${site.name}, in one place`,
  standfirst:
    "The ground is the Paris road network my thesis predicts traffic across. Six places stand on it. Visit one to see what it does and what it measured.",
  classicLabel: "Classic view",
  classicHint: "Every word on one scrolling page, no 3D.",
} as const;
