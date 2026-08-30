import type { Metadata } from "next";
import Link from "next/link";

import PageShell from "@/components/PageShell";
import NextSystem from "@/components/cinema/NextSystem";
import SceneIdentity from "@/components/sequence/SceneIdentity";
import ReliableWorld from "@/components/reliable-world/ReliableWorld";
import ReliableWorldFlat from "@/components/reliable-world/ReliableWorldFlat";
import {
  actions,
  boundaries,
  contribution,
  disclosure,
  failureModes,
  invariants,
  principles,
  representations,
} from "@/content/reliable-knowledge-world";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Reliable knowledge systems",
  description:
    "A synthetic model of keeping several derived representations of one source honest: capture, derivation, verification that runs backwards, and rebuilding derived state from evidence. Illustrative throughout; describes no deployed system.",
  path: "/work/reliable-knowledge-systems",
});

/*
 * The public-safe world for current employer work.
 *
 * This route exists because the confidential case study cannot be published and a placeholder would
 * be worse than nothing. It is not that case study with the names removed - it has its own content
 * module, written by hand from a classification pass, and imports nothing from it in either
 * direction. The confidential draft remains draft and remains excluded from production builds.
 *
 * What is published here is the engineering: the invariants a system of this shape has to be able
 * to check about itself, the ownership rules that make those checks mean anything, and the failure
 * classes the design exists to make visible. What is not published is any architecture, technology,
 * identifier, interface or quantity belonging to anybody's deployed system.
 */
export default function ReliableKnowledgeSystemsPage() {
  return (
    <PageShell current="/work">
      <article>
        <header className="page-hero section-wrap">
          <Link className="back-link" href="/work">← Selected work</Link>
          <p className="kicker">Current engineering / Illustrative model</p>
          <h1>Anything derived should be rebuildable. Anything else must not be overwritten.</h1>

          {/*
            The object from the homepage chapter, at the same resting beat. Directly after the
            title so a phone sees it without scrolling; the desktop grid places it in the second
            column regardless of source order.
          */}
          <SceneIdentity
            caption="One captured evidence core, and the three representations derived from it."
            slug="reliable-knowledge-systems"
            viewTransitionName="world-reliable-knowledge-systems"
          />
          <p>
            Most data platforms end up holding the same information several times over &mdash; as
            records, as vectors, as a graph. Each copy earns its place, and each one can quietly stop
            agreeing with the others. This is a synthetic model of how to keep them honest, and of
            the engineering I work on.
          </p>
          <p className="section-note">{disclosure.long}</p>

        </header>

        {/*
          The machine, before the prose. On a phone, a narrow window, or for a reader who declined
          motion, the same schematic is drawn once and completely instead.
        */}
        <div>
          <ReliableWorld flat={<ReliableWorldFlat />} />
        </div>

        <section className="section-wrap case-section two-column-copy">
          <div>
            <p className="section-index"><span>01</span>The problem</p>
            <h2>Four descriptions of one thing, three of them disposable.</h2>
            <p>
              One capture, several derived views. They are not stages in a pipeline; they exist at
              the same time and each is good at something the others are bad at. Records answer
              exactly. A semantic index answers approximately, which is the point of it. A graph
              keeps structure that flat records flatten away.
            </p>
            <p>
              The captured evidence is different in kind. It is not another interpretation, it is
              what the interpretations are checked against, and it is the only part that cannot be
              regenerated from anything else.
            </p>
          </div>
          <ul className="reliable-list">
            {representations.map((representation) => (
              <li data-immutable={representation.rebuildable ? undefined : ""} key={representation.key}>
                <strong>{representation.label}</strong>
                <span>{representation.holds}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section-wrap case-section">
          <p className="section-index"><span>02</span>Verification</p>
          <h2>The interesting arrow points backwards.</h2>
          <p>
            A diagram of a system like this usually runs one way and stops at the output. The
            question worth engineering for is the other direction: does what we stored still agree
            with what it was built from? Each derived view gets asked, and the answer is a
            conjunction rather than a light.
          </p>
          <ol className="reliable-invariants">
            {invariants.map((invariant) => (
              <li key={invariant.key}>
                <strong>{invariant.label}</strong>
                <span>{invariant.question}</span>
                <em>{invariant.note}</em>
              </li>
            ))}
          </ol>
        </section>

        <section className="section-wrap case-section">
          <p className="section-index"><span>03</span>Rules that make a check mean something</p>
          <h2>Most of the difficulty is ownership, not measurement.</h2>
          <ul className="reliable-list">
            {principles.map((principle) => (
              <li key={principle.label}>
                <strong>{principle.label}</strong>
                <span>{principle.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section-wrap case-section two-column-copy">
          <div>
            <p className="section-index"><span>04</span>When it goes wrong</p>
            <h2>The failures worth designing for are the quiet ones.</h2>
            <p>
              None of these describes an incident. They are the classes of failure this shape of
              system has, and the reason the checks above are worth running: each of them looks
              perfectly healthy from inside the store it affects.
            </p>
            <p>
              The response is an operator action rather than a scheduled job. Derived state is
              discarded and rebuilt from evidence; the evidence itself is never touched.
            </p>
          </div>
          <div>
            <ul className="reliable-list">
              {failureModes.map((mode) => (
                <li data-fault="" key={mode.label}>
                  <strong>{mode.label}</strong>
                  <span>{mode.note}</span>
                </li>
              ))}
            </ul>
            <ul className="reliable-list reliable-actions">
              {actions.map((action) => (
                <li key={action.key}>
                  <strong>{action.label}</strong>
                  <span>{action.effect}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-wrap case-section">
          <p className="section-index"><span>05</span>What I worked on</p>
          <h2>Stated as problems, and only where I can show the commits.</h2>
          <ul className="reliable-list">
            {contribution.map((item) => (
              <li key={item}>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="closing-section section-wrap">
          <p className="kicker">Boundaries</p>
          <h2>What this page is not.</h2>
          <ul className="reliable-list">
            {boundaries.map((boundary) => (
              <li data-fault="" key={boundary.label}>
                <strong>{boundary.label}</strong>
                <span>{boundary.note}</span>
              </li>
            ))}
          </ul>
          <p>
            The engineering above is real and is what I spend my time on. The machine that
            illustrates it was invented for this page, and every quantity in it was chosen because
            it is legible on a screen.
          </p>
        </section>
        <NextSystem slug="reliable-knowledge-systems" />
      </article>
    </PageShell>
  );
}
