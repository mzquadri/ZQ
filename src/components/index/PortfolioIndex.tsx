import Link from "next/link";

import { Mark } from "./marks";
import styles from "./PortfolioIndex.module.css";

/**
 * The one index this site uses.
 *
 * It replaces a reel. The homepage used to give every flagship a full viewport, which read well
 * for the first project and badly for the eighth: the last card sat 47,000px down a 55-screen
 * page, so a reader who arrived looking for one specific thing had to scroll past seven others to
 * find out whether it was there. Choosing is not reading, and the two want different shapes - a
 * compact index to choose from, then a page long enough to read.
 *
 * So the same component now carries projects, research, architecture and tutorials. Not because
 * they are the same kind of thing, but because the act of choosing between them is the same act,
 * and four bespoke grids taught a reader four layouts for one decision.
 *
 * Personality survives per item rather than per page: each card keeps its own accent and its own
 * line-art mark, drawn from that project's vocabulary. What is shared is the proportion, the
 * spacing and the interaction.
 *
 * Nothing here is staged on scroll. The previous index faded its items in across a scroll range,
 * which is a pleasant effect on a page you are reading and an obstacle on a page you are choosing
 * from - and it made the reduced-motion rendering the only one that showed everything at once.
 * Every card is present and legible on first paint.
 */

export interface IndexItem {
  /** Drives the mark, and is the stable key. For research and architecture, a descriptive slug. */
  slug: string;
  title: string;
  /** The category line: what kind of thing this is. */
  kind: string;
  /** One line on what it is. Rendered where the variant has room for it. */
  summary?: string;
  href: string;
  /** A CSS colour or custom property; falls back to the page's ink. */
  accent?: string;
  /** Set for links that leave the site, so the card can say so. */
  external?: boolean;
}

export default function PortfolioIndex({
  items,
  label,
  tone = "paper",
  numbered = true,
  summaries = true,
}: {
  items: readonly IndexItem[];
  /** Accessible name for the navigation landmark. */
  label: string;
  /** `stage` on the dark homepage ground, `paper` everywhere else. */
  tone?: "stage" | "paper";
  numbered?: boolean;
  summaries?: boolean;
}) {
  return (
    <nav aria-label={label} className={styles.index} data-tone={tone}>
      <ol className={styles.list}>
        {items.map((item, i) => {
          const style = item.accent ? ({ "--card-accent": item.accent } as React.CSSProperties) : undefined;
          const inner = (
            <>
              <span aria-hidden="true" className={styles.mark}>
                <svg viewBox="0 0 40 28">
                  <Mark slug={item.slug} />
                </svg>
              </span>
              {numbered ? (
                <span aria-hidden="true" className={styles.number}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              ) : null}
              <span className={styles.title}>{item.title}</span>
              <span className={styles.kind}>{item.kind}</span>
              {summaries && item.summary ? (
                <span className={styles.summary}>{item.summary}</span>
              ) : null}
            </>
          );

          return (
            <li className={styles.item} key={item.slug} style={style}>
              {item.external ? (
                /* An outbound card says so in its accessible name, not only by an icon. */
                <a className={styles.link} href={item.href}>
                  {inner}
                  <span className={styles.external}>Opens the case-study site</span>
                </a>
              ) : (
                <Link className={styles.link} href={item.href}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
