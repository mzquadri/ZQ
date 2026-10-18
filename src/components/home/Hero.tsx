import Image from "next/image";
import Link from "next/link";

import { heroLinks, homeIntro, parisNetwork, portrait } from "@/content/home";
import { site } from "@/content/portfolio";

/*
 * The opening screen.
 *
 * A server component with no JavaScript in it. The one animation is CSS
 * keyframes inside the inlined SVG, which means it costs nothing to download,
 * runs before hydration would have finished, and simply renders finished where
 * animation is turned off.
 *
 * Left aligned, two columns: who this is on the left, the photograph on the
 * right, the city they both sit in behind. Centring the name would have been
 * the default and would have given the page no spine; everything down the rest
 * of the page hangs off the same left edge as the name.
 *
 * The network is inlined rather than loaded through <img> because the reveal
 * animates `stroke-dashoffset` on six paths inside it, and an SVG referenced by
 * <img> cannot be reached by the page's stylesheet. It is 68 KB, it is the only
 * thing on this page that is not text, and it is the subject of the work rather
 * than an ornament.
 */

export default async function Hero() {
  const network = await loadNetwork();

  return (
    <section className="hero" aria-labelledby="hero-name">
      <div
        className="hero-map"
        aria-hidden="true"
        /*
         * The drawing is decoration *here* - the figure on the research page
         * carries the real description - so it is hidden from assistive
         * technology rather than announced on every visit to the front page.
         *
         * The markup is a file this repository generates and commits, read from
         * disk at build time. It is not user input, not fetched, and not
         * reachable by anything a visitor can influence, which is the condition
         * that makes this safe; `tools/export-paris-hero.mjs` writes only
         * `<path d="M.. L..">` elements from numeric coordinates.
         */
        dangerouslySetInnerHTML={{ __html: network }}
      />

      <div className="hero-inner">
        <div className="hero-identity">
          <h1 className="hero-name" id="hero-name">
            {site.name}
          </h1>
          <p className="hero-role">{site.role}</p>

          <div className="hero-intro">
            {homeIntro.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <p className="hero-where">
            {site.location}. {site.availability}.
          </p>

          <nav className="hero-links" aria-label="Sections of this site">
            {heroLinks.map((link) => (
              <Link key={link.href} className="hero-link" href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <figure className="hero-portrait">
          <Image
            alt={portrait.alt}
            className="hero-portrait-img"
            height={portrait.height}
            /*
             * The only image above the fold, so it is the one that should not
             * wait for anything. Everything else on the page is text.
             */
            priority
            sizes="(max-width: 860px) 60vw, 380px"
            src={portrait.src}
            width={portrait.width}
          />
        </figure>
      </div>

      <p className="hero-footnote">
        Behind: the real Paris road network from my Master&apos;s thesis, the
        longest {parisNetwork.drawn.toLocaleString("en-GB")} of its{" "}
        {parisNetwork.total.toLocaleString("en-GB")} road segments.
      </p>
    </section>
  );
}

/*
 * Read at build time, not bundled.
 *
 * Importing the SVG as a string would put 68 KB into the component's chunk and
 * into every page that ever imports this file. Reading it here keeps it in the
 * prerendered HTML of this one route, which is where it is wanted, and the
 * route is static so the read happens once at build.
 */
async function loadNetwork() {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const raw = await readFile(join(process.cwd(), "public", "media", "paris-network-4000.svg"), "utf8");
  return raw.replace("<svg ", '<svg class="hero-map-svg" aria-hidden="true" focusable="false" ');
}
