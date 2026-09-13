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
