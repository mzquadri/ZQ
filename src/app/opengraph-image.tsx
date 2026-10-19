import { ImageResponse } from "next/og";
import { site } from "@/content/portfolio";

export const alt = `${site.name}, ${site.role}, Munich`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/*
 * The card LinkedIn shows.
 *
 * This is, in practice, the most-seen thing on the site: it appears whenever
 * the link is shared or pasted into an application, often to someone who will
 * decide from it alone whether to open the page. So it carries the name, the
 * role and where he is, and nothing else.
 *
 * It used to be the old warm palette with a slogan, "Applied ML with evidence
 * built in", above a row of tracked-out keywords. A slogan tells a recruiter
 * nothing they can act on and dates badly; a name and a role are what the card
 * is for. The palette is now the site's.
 *
 * No webfont is loaded. `next/og` would need the font fetched and embedded on
 * every render, and the system stack at this size is indistinguishable in a
 * 1200x630 PNG. The risk of a font fetch failing and the card rendering empty
 * is not worth the difference.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f8fa",
          color: "#1c2430",
          padding: "72px 80px",
          /* The one piece of colour: the site's violet, as a left edge. */
          borderLeft: "20px solid #7a6ba8",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: "#5a6675" }}>
          mzquadri.de
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 86, fontWeight: 700, lineHeight: 1.0, letterSpacing: -2 }}>
            {site.name}
          </div>
          <div style={{ fontSize: 40, color: "#5f5190", fontWeight: 600 }}>
            {site.role}
          </div>
          <div style={{ fontSize: 30, color: "#5a6675", maxWidth: 900, lineHeight: 1.35 }}>
            Machine learning systems, from the first look at the data to a
            service running in production.
          </div>
        </div>

        <div style={{ display: "flex", gap: 34, fontSize: 25, color: "#5a6675" }}>
          <span>{site.location}</span>
          <span>M.Sc. Mathematics, TU Munich</span>
        </div>
      </div>
    ),
    size,
  );
}
