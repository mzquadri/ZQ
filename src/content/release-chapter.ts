/**
 * Release tracking at AUDI AG: a wide sheet, and four frames.
 *
 * Everything here is read from the public case-study repository, which is
 * explicit about what it does and does not contain: no employer source code,
 * no internal data, no part numbers, no suppliers, no real field values, no
 * screenshots of the real interface and no colleagues' names. The figures in
 * that repository are drawn by a script from the description in the owner's
 * internship report rather than captured from the tool.
 *
 * The originating department is deliberately unnamed here, because the public
 * repository does not name it either. Its README says the interface was built
 * for a single department and was subsequently enlarged to accommodate
 * numerous departments, and that is the whole of what this page claims.
 */

export const repository = "https://github.com/mzquadri/audi-release-tracking-case-study";

export const sheet = {
  rows: 600,
  columns: 130,
  /** Both numbers are approximate in the source, and are published that way. */
  approximate: true,
} as const;

/**
 * The four frames the fields were grouped into, by subject rather than by the
 * column order the sheet happened to grow in.
 */
export const frames = [
  { key: "where", label: "department and location" },
  { key: "part", label: "part and supplier" },
  { key: "cost", label: "cost and drawings" },
  { key: "time", label: "milestones and lead time" },
] as const;

export const markets = 2;

/** Milestone annotations carried on the release data, each with its own comment. */
export const milestones = ["X", "P", "B", "K-AE", "BMG", "K"] as const;

/** How many column ticks the figure draws. Not a count of anything measured. */
export const tickCount = 44;

export const adoption = {
  builtFor: "one department",
  takenUpBy: "others",
  reportWording:
    "built for a single department and subsequently enlarged to accommodate numerous departments",
  /** The report records no count, no time saved and no error rate. */
  countStated: false,
} as const;
