/**
 * Copy for the cinematic layer.
 *
 * Separated from the components so the content validator and the privacy rules can read every
 * public string in one place, the same way the rest of the site's content is handled. Nothing
 * here states a measurement. Where a figure needs a number, that number comes from the evidence
 * registry via the project content - never from this file.
 */

export const heroStage = {
  disciplines: [
    "Machine learning",
    "Data systems",
    "Uncertainty",
    "Verification",
  ],
  positionPrefix: "AI Engineer",
  primaryAction: "Examine the work",
  secondaryAction: "Read the research",
  scrollHint: "Scroll to run the sequence",
  figureDescription:
    "A predicted series is drawn, then surrounded by a wide uncorrected interval. The interval is calibrated so that it narrows where the signal is easy and stays wide where it is hard. Observations are then plotted against it, and the region where the model's confidence falls below a threshold is marked as one the system declines to answer in.",
  /*
   * Five beats, one per motion verb. The verbs are the site's motion vocabulary, so the caption
   * names the movement the reader is watching rather than describing it a second time in prose.
   */
  beats: [
    {
      verb: "Predict",
      text: "A surrogate produces an answer quickly enough to be useful for policy review.",
    },
    {
      verb: "Expand",
      text: "On its own the answer carries no interval. A uniform one is honest about nothing.",
    },
    {
      verb: "Calibrate",
      text: "Fitted against held-out data, the interval widens where the signal is genuinely hard.",
    },
    {
      verb: "Verify",
      text: "Observations are plotted against it. Coverage is measured, not assumed.",
    },
    {
      verb: "Decline",
      text: "Below a confidence floor the system abstains rather than answering badly.",
    },
  ],
} as const;

export const chapters = {
  work: {
    index: "01",
    eyebrow: "Selected work",
    title: "Each system, as the thing it actually is",
    introduction:
      "Eight worlds, in running order. Every one is drawn as its own mechanism rather than as a card, because a graph surrogate and a retrieval benchmark do not resemble each other and should not be presented as though they do. Each opens into a case study carrying its evidence and its limits.",
  },
  engineering: {
    index: "02",
    eyebrow: "Current engineering",
    title: "Ingest, represent, verify, observe",
    introduction:
      "The shape of the work I do now, drawn synthetically. It describes a class of problem common to data platforms rather than any particular system, and every figure in it is an illustrative model.",
  },
  research: {
    index: "03",
    eyebrow: "Research",
    title: "What has to be true before a fast approximation is allowed to matter",
    introduction:
      "A surrogate that is wrong quickly is worse than a simulation that is slow. The research record is about the evidence that closes that gap.",
  },
  experience: {
    index: "04",
    eyebrow: "Experience",
    title: "Problems, in the order I met them",
    introduction:
      "Each role is written as the class of technical problem it put in front of me, rather than as a job title with a date range attached.",
  },
} as const;

/**
 * The problem classes behind each role.
 *
 * Deliberately abstract. The current-employer entry describes a category of engineering that is
 * common to any organisation holding a large document corpus; it names no system, no service, no
 * dataset and no internal terminology, and it is the same story the public showcase tells.
 */
export const problemClasses = [
  {
    id: "systems",
    stage: "Now",
    problem: "One source, several representations",
    detail:
      "Records, vectors and a graph all describing the same material. Each is useful, each can drift, and agreement between them has to be demonstrated rather than assumed.",
    verbs: ["Ingest", "Represent", "Verify", "Observe"],
  },
  {
    id: "research",
    stage: "Research",
    problem: "A fast approximation of a slow simulation",
    detail:
      "Learning a surrogate is the easy half. Establishing when its answer may be trusted, and building the machinery that says so, is the work.",
    verbs: ["Simulate", "Approximate", "Quantify", "Select"],
  },
  {
    id: "automation",
    stage: "Earlier",
    problem: "A reporting process that ran on people",
    detail:
      "Several spreadsheets, reconciled by hand on a schedule. The interesting part was not the automation; it was making the consolidated figure reproducible.",
    verbs: ["Collect", "Reconcile", "Automate", "Report"],
  },
] as const;

export const closing = {
  line: "Build systems that can explain what they know.",
  support:
    "And, just as importantly, systems that can say where they stop knowing it. If that is the kind of engineering you need, the case studies and the research record are the fastest way to judge whether it is any good.",
} as const;
