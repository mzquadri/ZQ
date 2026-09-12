import type { Metadata } from "next";
import Link from "next/link";

import { StageHero } from "@/components/cinema/PageStages";
import PageShell from "@/components/PageShell";
import SectionHeading from "@/components/SectionHeading";
import { ArrowLabel, ExternalArrow } from "@/components/Icon";
import { architecture, architectureEntries } from "@/content/architecture";
import { disclosure } from "@/content/reliable-knowledge-world";
import { createPageMetadata } from "@/lib/metadata";
import styles from "./Architecture.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Architecture",
  description:
    "Architecture case studies of the AI systems I contributed to at BP-ITCS: ingestion, verification, retrieval, document intelligence, and an interactive walkthrough built for technical interviews.",
  path: "/architecture",
  imagePath: "/architecture/opengraph-image",
  imageAlt:
    "Architecture case studies by Mohd Zamin Quadri - the systems, drawn at the level an interviewer asks about",
});

/*
 * The gateway to the case-study site.
 *
 * Everything the reader is being sent to is published elsewhere, and this page deliberately does
 * not restate it. What it adds is the thing a bare link cannot: what that material is, what it is
 * not, who each route into it is for, and how the two public treatments of the same employer work
 * relate - the synthetic model on this site, and the named architecture on that one.
 *
 * Nothing here names a service, topic, store, identifier or quantity from a deployed system. That
 * is what keeps /work/reliable-knowledge-systems able to call itself synthetic.
 */

const PANES = [0, 1, 2, 3];
const ROWS = [0, 1, 2, 3, 4];
const JOINS = [0, 1, 2];

/**
 * Four panes and a return arrow: the shape of the argument over there, drawn abstractly. Each
 * pane is a representation derived from the one before it, and the dashed arrow underneath is the
 * check running the other way, from the last representation back to the evidence. No labels,
 * because a labelled version of this would be the thing this page has just promised not to
 * publish.
 */
function ArchitectureMark() {
  return (
    <svg
      aria-hidden="true"
      className={styles.figure}
      viewBox="0 0 640 320"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="arch-pane" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(52, 211, 153, 0.20)" />
          <stop offset="100%" stopColor="rgba(52, 211, 153, 0.04)" />
        </linearGradient>
      </defs>

      {PANES.map((pane) => (
        <g key={pane} transform={"translate(" + (40 + pane * 148) + " 40)"}>
          <rect
            width="116"
            height="150"
            rx="6"
            fill="url(#arch-pane)"
            stroke="rgba(52, 211, 153, 0.75)"
            strokeOpacity={1}
          />
          {ROWS.map((row) => (
            <rect
              key={row}
              x="18"
              y={26 + row * 24}
              width={row % 2 === 0 ? 80 : 54}
              height="6"
              rx="3"
              fill="rgba(226, 232, 240, 0.55)"
              fillOpacity={0.45 + pane * 0.13}
            />
          ))}
        </g>
      ))}

      {JOINS.map((join) => (
        <path
          key={join}
          d={"M" + (156 + join * 148) + " 115 h32"}
          stroke="rgba(226, 232, 240, 0.55)"
          strokeOpacity={1}
          strokeWidth="1.5"
          fill="none"
        />
      ))}

      <path
        d="M574 190 v52 H66 v-52"
        stroke="rgba(241, 90, 53, 0.9)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        fill="none"
      />
      <path d="M61 200 L66 186 L71 200 Z" fill="rgba(241, 90, 53, 0.9)" />
    </svg>
  );
}

export default function ArchitecturePage() {
  return (
    <PageShell current="/architecture">
      <StageHero
        eyebrow={architecture.eyebrow}
        title={architecture.title}
        standfirst={architecture.standfirst}
        meta={[
          { label: "Diagrams", value: "Twenty, plus an interactive page" },
          { label: "Built for", value: "Technical interviews" },
          { label: "Published", value: "As a separate site" },
        ]}
        figure={<ArchitectureMark />}
      >
        <p className="hero-actions">
          <a className="button button-primary" href={architecture.site}>
            <ArrowLabel>Open the architecture site</ArrowLabel>
          </a>
          <a className="button button-secondary" href={architecture.repository}>
            <ArrowLabel>Repository</ArrowLabel>
          </a>
        </p>
      </StageHero>

      <section className="section-wrap">
        <SectionHeading
          index="01"
          eyebrow="Ways in"
          title="Four routes, ordered by how long you have"
          introduction="The first is the whole thing. The other three are the questions it gets asked most, each opening at the section that answers it."
        />

        <ul className={styles.entries}>
          {architectureEntries.map((entry) => (
            <li className={styles.entry} key={entry.id}>
              <a className={styles.entryLink} href={entry.href}>
                <span className={styles.entryHead}>
                  <span className={styles.audience}>{entry.audience}</span>
                  <span className={styles.label}>
                    {entry.label}
                    <ExternalArrow />
                  </span>
                </span>
                <span className={styles.entryBody}>
                  <span className={styles.summary}>{entry.summary}</span>
                  <span className={styles.duration}>{entry.duration}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="section-wrap">
        <SectionHeading
          index="02"
          eyebrow="Scope"
          title="What that material is, and what it is not"
          introduction="Worth reading before the diagrams rather than after. The case-study site makes a narrow claim carefully, and the narrowness is the point."
        />

        <div className={styles.scope}>
          <div>
            <p className={styles.scopeTitle + " " + styles.scopeIsTitle}>What it is</p>
            <ul className={styles.scopeList + " " + styles.scopeIs}>
              {architecture.scope.is.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={styles.scopeTitle + " " + styles.scopeNotTitle}>What it is not</p>
            <ul className={styles.scopeList}>
              {architecture.scope.isNot.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section-wrap">
        <SectionHeading
          index="03"
          eyebrow="The other treatment"
          title="Two public versions of the same work, on purpose"
          introduction="This site and the case-study site publish the same employer work at different levels, and it is worth knowing which one you are reading."
        />
        <div className="prose-large">
          <p>
            On this site the work appears as <cite>Reliable knowledge systems</cite>, which is
            synthetic throughout. {disclosure.long} It carries the class of problem: which
            invariants a system of that shape has to be able to check about itself, and which
            failures those checks exist to make visible.
          </p>
          <p>
            The case-study site carries the particulars, published after its own review of what
            could be shown and its own separation of public material from private evidence. If you
            want the argument, read the synthetic model. If you want the system, open the case
            studies.
          </p>
        </div>
        <p className="hero-actions">
          <Link className="button button-secondary" href="/work/reliable-knowledge-systems">
            <ArrowLabel kind="forward">Read the synthetic model</ArrowLabel>
          </Link>
          <Link className="button button-secondary" href="/work">
            <ArrowLabel kind="forward">Selected work</ArrowLabel>
          </Link>
        </p>
      </section>
    </PageShell>
  );
}
