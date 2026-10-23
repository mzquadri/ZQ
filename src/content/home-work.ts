import { site } from "./truth";

/**
 * Selected work on the home page.
 *
 * Every card is the same four things, in the same order: the project's real
 * name, one plain sentence saying what it does, one real result, and the tools.
 *
 * This replaced a set of cards headed by questions and aphorisms: "Keeping
 * derived state honest", "The boundary a scanner cannot stand at", "One number
 * covering ten". Those titles were written to be interesting and they cost the
 * reader the one thing a card has to give them, which is what the project is.
 * A recruiter scanning ten cards in forty seconds cannot afford a riddle.
 *
 * Order is the owner's: the thesis, then the employer work, then the two public
 * systems, the AUDI case study, the two seminars, and the pipeline. It runs
 * from what is most thoroughly evidenced to what is smallest, which is also
 * roughly the order of what a hiring reader came for.
 *
 * Two cards were removed rather than reordered: a CIFAR-10 CNN and a synthetic
 * streamflow benchmark. Both are real and both are written up, and neither
 * belongs beside a thesis and four production systems. They are still on the
 * full list at /work.
 *
 * Every result below is traceable to FACTS.md and to the repository that
 * produced it. Where a number describes something other than the work itself,
 * the card says so rather than letting the number borrow credit.
 */

export interface WorkCard {
  /** The project's real name, as anyone involved would say it. */
  name: string;
  /** Where it was done, when that is the first thing worth knowing. */
  context?: string;
  /** One sentence. What it does, in words a non-specialist reads once. */
  what: string;
  /** One measured outcome, with whatever qualifier keeps it honest. */
  result: string;
  tech: readonly string[];
  href: string;
  /** True when the link leaves this site. */
  external?: boolean;
}

export const selectedWork: readonly WorkCard[] = [
  {
    /*
     * Named for the thesis, so it opens the thesis.
     *
     * This card used to point at /work/transport-uq while carrying this name.
     * That was fine while both routes were titled "Master's Thesis: Uncertainty
     * for a Traffic GNN", and stopped being fine when the case study was
     * renamed to "Uncertainty Quantification for Traffic Prediction (Project)"
     * to end the duplicate title: the card would have named the thesis and
     * opened the project.
     *
     * The name is the one worth keeping on a front page, so the destination
     * moved to match it rather than the other way round. /research/thesis is
     * the thesis record; the case study is still one click from there and from
     * the /work index.
     */
    name: "Master's Thesis: Uncertainty for a Traffic GNN",
    context: "TU Munich",
    what: "A graph neural network predicts how Paris traffic changes when a road policy changes, and reports how confident it is in each prediction.",
    result: "Calibration error cut by 82%, and setting aside the least confident half of the predictions lowered the error on the rest by 41%.",
    tech: ["PyTorch", "PyTorch Geometric", "Conformal prediction", "MATSim"],
    href: "/research/thesis",
  },
  {
    name: "Legal Knowledge Base",
    context: "BP-IT Consulting",
    what: "German and EU legislation is parsed into a database, embedded for search, and linked as a graph, with a verification service that decides whether a law is complete enough to publish.",
    result: "I built four of the five services. Every law passes up to 14 checks before it is certified, one of them a parse on an independent XML stack.",
    tech: ["Python", "FastAPI", "PostgreSQL", "Qdrant", "Neo4j", "BGE-M3"],
    href: "/work/reliable-knowledge-systems",
  },
  {
    name: "AI Radiologist",
    context: "BP-IT Consulting",
    what: "A chest X-ray classifier that flags five findings, shows which part of the image drove each call, and serves predictions behind a queue.",
    result: "The screening demo scores AUROC 0.834 to 0.909 across the five findings on 4,128 public NIH images. Those are the public pre-trained weights it runs, not a model trained here.",
    tech: ["PyTorch", "DenseNet-121", "Grad-CAM++", "Apache Kafka"],
    href: "/work/medico",
  },
  {
    name: "Document Extraction",
    context: "BP-IT Consulting",
    what: "Insurance paperwork is read by OCR, then pulled into fields by a language model and a set of regular expressions working against the same declarative template.",
    result: "The template is the contract rather than the model, so a model can be swapped without touching the pipeline, and fields that failed stay visible instead of being filled in silently.",
    tech: ["Python", "Docling OCR", "LLM extraction", "Declarative templates"],
    href: site.architecture,
    external: true,
  },
  {
    name: "MCP Policy Gateway",
    what: "A proxy that applies security policy to AI tool calls, checking both the arguments going out and the results coming back.",
    result: "Blocked 96.2% of attacks at a 9.5% false-refusal rate on a 47-case corpus, against a keyword filter's 38.5%, and decided in well under a millisecond per call.",
    tech: ["Python", "Model Context Protocol", "pytest"],
    href: "/work/mcp-policy-gateway",
  },
  {
    name: "InsureAssist",
    what: "Question answering over flood insurance policy documents, with every answer tied back to the passage it came from.",
    result: "Returning the right policy form went from 17% to 56%, which came from the chunk size rather than the retriever. Fusing keyword and vector search lifted the ranking score from 0.365 to 0.420.",
    tech: ["Python", "BM25", "BGE embeddings", "Qdrant", "FastAPI"],
    href: "/work/insureassist-rag",
  },
  {
    name: "AUDI Release Tracking Tool",
    context: "AUDI AG",
    what: "An Excel VBA application with UserForms that replaced searching a development release sheet of roughly 600 rows and 130 or more columns, using a dropdown and a single-click lookup.",
    result: "Separate interfaces for the German and Chinese markets, create, update and delete with automatic write-back to the source sheet, linked to the FREIPRO release system, and adopted by other departments.",
    tech: ["Excel VBA", "UserForms", "FREIPRO integration"],
    href: "https://github.com/mzquadri/audi-release-tracking-case-study",
    external: true,
  },
  {
    name: "Uncertainty in a Hydrological Model",
    context: "TUM seminar",
    what: "An 18-parameter rainfall-runoff model is calibrated, then tested to see how much of that fit survives uncertainty in its parameters and in the measurements.",
    result: "Error in the discharge measurements costs 0.148 of the fit score, far more than noise on the rainfall, and recalibrating recovers only 5.76% of it. Three-person group submission.",
    tech: ["Python", "Cython", "HBV", "Sobol sensitivity analysis"],
    href: "/work/hydrology-uq",
  },
  {
    name: "Identification of Neural Networks",
    context: "TUM seminar",
    what: "When do a network's weights follow uniquely from the function it computes? A study of Fefferman's framework, with code that checks the symmetries numerically.",
    result: "Networks using tanh are identifiable up to permuting neurons and flipping signs. ReLU networks fail the framework's conditions, because ReLU is not analytic.",
    tech: ["Python", "NumPy", "Jupyter"],
    href: "https://github.com/mzquadri/Neural-Network-Identifiability-Analysis",
    external: true,
  },
  {
    name: "MLOps Pipeline",
    what: "The full lifecycle for one small model: validation that can stop the run, leak-free feature fitting, versioned model bundles, and a promotion gate that can refuse a release.",
    result: "0.8795 ROC-AUC on the held-out split, behind a gate that requires a margin over a baseline before anything ships.",
    tech: ["Python", "MLflow", "Docker", "GitHub Actions", "pytest"],
    href: "/work/mlops-reference-pipeline",
  },
] as const;
