/**
 * The line-art marks, one per project.
 *
 * Lifted out of ExhibitionIndex so the same drawings can serve every index on the site rather
 * than only the homepage one. They are drawn from the vocabulary the projects actually use - a
 * node with edges, a source with three derived forms, a plate with channels lifting off it, three
 * near-identical pages, a gate with one plate shut, two bands at different widths, a series with a
 * window on it, a grid of cells - rather than from a stock icon set, which is what keeps a card
 * recognisable as its own project instead of as a generic tile.
 *
 * A few are not projects: the architecture site and the engineering model are surfaces rather than
 * case studies, and they get their own marks so that no mark appears twice on one page meaning two
 * different things.
 */

/* Each mark is 40x28 and drawn in the accent of its own chapter. */
export function Mark({ slug }: { slug: string }) {
  switch (slug) {
    case "transport-uq":
      return (
        <>
          <path d="M6 20 L14 9 L26 15 L34 8" />
          <circle cx="6" cy="20" r="2.4" />
          <circle cx="14" cy="9" r="2.4" />
          <circle cx="26" cy="15" r="2.4" />
          <circle className="mark-fill" cx="34" cy="8" r="3" />
        </>
      );
    case "reliable-knowledge-systems":
      return (
        <>
          <rect height="6" width="10" x="15" y="4" />
          <path d="M20 10 V14 M20 14 H8 M20 14 H32 M20 14 V18" />
          <rect height="5" width="7" x="5" y="18" />
          <rect height="5" width="7" x="16.5" y="18" />
          <rect className="mark-fill" height="5" width="7" x="28" y="18" />
        </>
      );
    case "medico":
      return (
        <>
          <rect height="18" width="14" x="5" y="5" />
          <path d="M21 8 H35 M21 13 H35 M21 18 H30" />
          <path className="mark-dash" d="M31 18 H35" />
        </>
      );
    case "insureassist-rag":
      return (
        <>
          <rect height="16" width="11" x="4" y="6" />
          <rect height="16" width="11" x="12" y="6" />
          <rect className="mark-fill" height="16" width="11" x="20" y="6" />
          <path d="M33 10 L36 14 L33 18" />
        </>
      );
    case "mlops-reference-pipeline":
      return (
        <>
          <path d="M4 14 H16" />
          <rect height="14" width="2.5" x="17" y="7" />
          <rect height="14" width="2.5" x="21" y="7" />
          <rect className="mark-fill" height="14" width="2.5" x="25" y="7" />
          <path className="mark-dash" d="M29 14 H36" />
        </>
      );
    case "hydrology-uq":
      return (
        <>
          <path d="M4 20 Q10 20 13 12 Q16 6 19 12 Q22 20 36 20" />
          <path className="mark-fill-soft" d="M13 8 Q16 2 19 8 Q22 18 36 21 L36 23 Q20 20 16 10 Q14 6 13 8Z" />
        </>
      );
    case "streamflow-forecasting":
      return (
        <>
          <path d="M4 18 L10 12 L14 20 L19 10 L24 16 L29 9 L36 15" />
          <rect className="mark-window" height="18" width="9" x="19" y="5" />
        </>
      );
    case "mcp-policy-gateway":
      return (
        <>
          <path d="M5 14 H14" />
          <rect height="18" width="3" x="15" y="5" />
          <rect className="mark-fill" height="18" width="3" x="20" y="5" />
          <path d="M26 14 H36" />
          <path className="mark-dash" d="M26 9 H33 M26 19 H33" />
        </>
      );
    /* The four panes of the case-study site, with the check running back under them. */
    case "architecture-site":
      return (
        <>
          <rect height="14" width="7" x="4" y="5" />
          <rect height="14" width="7" x="13" y="5" />
          <rect height="14" width="7" x="22" y="5" />
          <rect className="mark-fill" height="14" width="7" x="31" y="5" />
          <path className="mark-dash" d="M34.5 21 H8 v3" />
        </>
      );
    /* One captured source, three representations derived from it. */
    case "engineering-model":
      return (
        <>
          <rect className="mark-fill" height="8" width="8" x="4" y="10" />
          <path d="M12 14 H18 M18 6 V22 M18 6 H24 M18 14 H24 M18 22 H24" />
          <circle cx="28" cy="6" r="2.6" />
          <circle cx="28" cy="14" r="2.6" />
          <circle cx="28" cy="22" r="2.6" />
        </>
      );
    /* ---- The architecture case studies ------------------------------------------------------
     * These stand for subjects on the separate case-study site rather than for projects here, so
     * they are drawn from the same vocabulary without repeating any project's own mark. No mark
     * may appear twice on one page meaning two different things.
     */
    /* A source, and the three representations derived from it. */
    case "arch-legal":
      return (
        <>
          <rect className="mark-fill" height="7" width="7" x="4" y="11" />
          <path d="M11 14 H16 M16 6 V22 M16 6 H21 M16 14 H21 M16 22 H21" />
          <rect height="5" width="7" x="22" y="4" />
          <rect height="5" width="7" x="22" y="11.5" />
          <rect height="5" width="7" x="22" y="19" />
        </>
      );
    /* A measurement running back against the thing it measures. */
    case "arch-trust":
      return (
        <>
          <rect height="14" width="10" x="5" y="4" />
          <rect height="14" width="10" x="25" y="4" />
          <path className="mark-dash" d="M35 22 H10 v-4" />
          <path d="M6 18 L10 22 L14 18" />
        </>
      );
    /* A log, and two consumers reading from it at their own positions. */
    case "arch-events":
      return (
        <>
          <path d="M4 9 H36" />
          <rect className="mark-fill" height="4" width="4" x="9" y="7" />
          <rect className="mark-fill" height="4" width="4" x="19" y="7" />
          <rect height="4" width="4" x="29" y="7" />
          <path className="mark-dash" d="M11 13 V20 M21 13 V20" />
          <rect height="5" width="9" x="6.5" y="20" />
          <rect height="5" width="9" x="16.5" y="20" />
        </>
      );
    /* A query, and the passage it is grounded in. */
    case "arch-query":
      return (
        <>
          <circle cx="11" cy="12" r="6" />
          <path d="M15.5 16.5 L20 21" />
          <path d="M25 6 H36 M25 11 H36 M25 16 H31" />
          <path className="mark-fill" d="M25 20 H33 v2 H25 Z" />
        </>
      );
    /* A page, and the fields lifted out of it. */
    case "arch-documents":
      return (
        <>
          <rect height="18" width="13" x="4" y="5" />
          <path d="M7 10 H17 M7 14 H17 M7 18 H13" />
          <path className="mark-dash" d="M17 10 H24 M17 14 H24" />
          <rect className="mark-fill" height="4" width="10" x="25" y="8" />
          <rect height="4" width="10" x="25" y="16" />
        </>
      );
    /* A questionnaire, and the flag one answer raises. */
    case "arch-compliance":
      return (
        <>
          <rect height="20" width="15" x="4" y="4" />
          <path d="M7 10 H16 M7 14 H16 M7 18 H13" />
          <circle className="mark-fill" cx="22" cy="14" r="2" />
          <path d="M27 22 V6 H36 l-3 4 3 4 h-9" />
        </>
      );
    /* A scan, with the region an explanation points at. */
    case "arch-radiology":
      return (
        <>
          <rect height="20" width="16" x="4" y="4" />
          <path d="M12 4 V24 M8 9 q4 3 8 0 M8 15 q4 3 8 0" />
          <rect className="mark-window" height="8" width="10" x="24" y="10" />
          <circle className="mark-fill-soft" cx="29" cy="14" r="3" />
        </>
      );
    case "cifar10-cnn":
      return (
        <>
          <rect height="20" width="9" x="4" y="4" />
          <rect height="12" width="8" x="15" y="8" />
          <rect className="mark-fill" height="6" width="6" x="25" y="11" />
          <path d="M33 14 H37" />
        </>
      );
    case "ai-engineering-portfolio":
      return (
        <>
          <rect height="9" width="11" x="8" y="4" />
          <rect className="mark-fill" height="9" width="11" x="21" y="4" />
          <rect height="9" width="11" x="8" y="15" />
          <rect height="9" width="11" x="21" y="15" />
        </>
      );
    case "jobhunter":
      return (
        <>
          <path className="mark-dash" d="M4 6 H36" />
          <rect height="17" width="5" x="8" y="6" />
          <rect height="17" width="5" x="17" y="6" />
          <rect className="mark-fill" height="17" width="5" x="26" y="6" />
        </>
      );
    case "nlp-transformers":
      return (
        <>
          <path d="M4 14 H26" />
          <rect className="mark-fill" height="16" width="3" x="28" y="6" />
          <path className="mark-dash" d="M33 14 H37" />
        </>
      );
    case "statistical-learning":
      return (
        <>
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                className={row === 1 && col === 3 ? "mark-fill" : undefined}
                cx={8 + col * 6}
                cy={7 + row * 7}
                key={`${row}-${col}`}
                r="1.6"
              />
            )),
          )}
        </>
      );
    case "supply-chain":
      return (
        <>
          <path d="M4 8 H15 L24 14 M4 20 H15 L24 14" />
          <rect className="mark-fill" height="8" width="11" x="25" y="10" />
        </>
      );
    case "weather-eda":
      return (
        <>
          <path d="M20 3 V25 M4 14 H36" />
          <circle cx="12" cy="20" r="1.8" />
          <circle cx="16" cy="9" r="1.8" />
          <circle cx="26" cy="19" r="1.8" />
          <circle className="mark-fill" cx="30" cy="8" r="2.4" />
        </>
      );
    case "water-quality":
      return (
        <>
          <path d="M6 7 H30 M10 14 H34 M8 21 H32" />
          <circle className="mark-fill" cx="18" cy="7" r="2.2" />
          <circle className="mark-fill" cx="22" cy="14" r="2.2" />
          <circle className="mark-fill" cx="20" cy="21" r="2.2" />
        </>
      );
    case "insurance-claims-threshold":
      return (
        <>
          <path d="M4 23 C18 23 20 5 36 5" />
          <path className="mark-dash" d="M24 3 V25" />
          <circle className="mark-fill" cx="24" cy="10" r="2.4" />
        </>
      );
    case "battery-soc":
      return (
        <>
          <rect height="12" width="26" x="5" y="8" />
          <rect height="4" width="3" x="31" y="12" />
          <rect className="mark-fill" height="8" width="12" x="7" y="10" />
        </>
      );
    case "nn-identifiability":
      return (
        <>
          <path d="M7 7 L33 21 M7 21 L33 7" />
          <circle cx="7" cy="7" r="2.6" />
          <circle cx="7" cy="21" r="2.6" />
          <circle cx="33" cy="7" r="2.6" />
          <circle className="mark-fill" cx="33" cy="21" r="2.6" />
        </>
      );
    case "flood-lstm":
      return (
        <>
          <path d="M3 16 Q9 5 15 16 T27 16 T37 14" />
          <path className="mark-dash" d="M3 23 H37" />
          <circle className="mark-fill" cx="9" cy="10.5" r="2.2" />
        </>
      );
    case "audi-release-tracking":
      return (
        <>
          <rect height="16" width="34" x="3" y="6" />
          <rect className="mark-fill" height="4" width="34" x="3" y="12" />
          <path d="M12 6 V22 M21 6 V22 M30 6 V22" />
        </>
      );
    case "keras-pytorch-parity":
      return (
        <>
          <rect height="12" width="12" x="4" y="8" />
          <path d="M17 12 H23 M17 16 H23" />
          <rect className="mark-fill" height="12" width="12" x="24" y="8" />
        </>
      );
    case "eurostat-modal-split":
      return (
        <>
          <rect height="20" width="9" x="8" y="4" />
          <rect height="20" width="9" x="23" y="4" />
          <path d="M8 15 H17" />
          <rect className="mark-fill" height="10" width="9" x="23" y="14" />
        </>
      );
    case "bm25-rrf-java":
      return (
        <>
          <path d="M5 7 H14 M5 14 H14 M5 21 H14 M26 7 H35 M26 14 H35 M26 21 H35" />
          <path className="mark-dash" d="M16 7 H24 M16 14 H24 M16 21 H24" />
        </>
      );
    case "munich-accident-forecasting":
      return (
        <>
          <rect height="10" width="4" x="5" y="14" />
          <rect height="13" width="4" x="11" y="11" />
          <rect height="9" width="4" x="17" y="15" />
          <rect height="12" width="4" x="23" y="12" />
          <rect className="mark-fill" height="15" width="4" x="29" y="9" />
          <path className="mark-dash" d="M3 6 H37" />
        </>
      );
    case "drift-aware-platform":
      return (
        <>
          <path d="M30 8 A10 10 0 1 0 31 19" />
          <path d="M31 3 V8 H26" />
          <circle className="mark-fill" cx="20" cy="14" r="3" />
        </>
      );
    default:
      return (
        <>
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect
                className={r === c ? "mark-fill" : undefined}
                height="4.4"
                key={`${r}-${c}`}
                width="4.4"
                x={11 + c * 5.4}
                y={5 + r * 5}
              />
            )),
          )}
        </>
      );
  }
}
