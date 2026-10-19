import Link from "next/link";

import {
  credentialsLink,
  homeEducation,
  homeExperience,
  homeSkills,
  researchHighlights,
  researchSummary,
} from "@/content/home-sections";
import { selectedWork } from "@/content/home-work";

/*
 * Everything on the home page below the hero.
 *
 * One component rather than five files, because these are five short sections
 * of one page and splitting them would mean five files to open to answer "what
 * does the home page say".
 *
 * All server-rendered, no state, no client JavaScript.
 */

export function SelectedWork() {
  return (
    <section className="hs section-wrap" id="work">
      <h2 className="hs-h2">Selected work</h2>
      <p className="hs-lede">
        Ten projects, newest and most thoroughly evidenced first. Each one links
        to how it was built and what was measured.
      </p>

      <ul className="work-list">
        {selectedWork.map((card) => (
          <li className="work-card" key={card.name}>
            <h3 className="work-name">
              {card.external ? (
                <a href={card.href} rel="noopener noreferrer" target="_blank">
                  {card.name}
                </a>
              ) : (
                <Link href={card.href}>{card.name}</Link>
              )}
            </h3>
            {card.context ? <p className="work-context">{card.context}</p> : null}
            <p className="work-what">{card.what}</p>
            <p className="work-result">{card.result}</p>
            <ul className="work-tech" aria-label={`Tools used on ${card.name}`}>
              {card.tech.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <p className="hs-more">
        <Link href="/work">Every project, including the smaller ones</Link>
      </p>
    </section>
  );
}

export function ResearchSummary() {
  return (
    <section className="hs section-wrap" id="research">
      <h2 className="hs-h2">{researchSummary.heading}</h2>
      <p className="hs-lede">{researchSummary.lede}</p>

      <ul className="res-list">
        {researchHighlights.map((item) => (
          <li className="res-item" key={item.figure}>
            <p className="res-figure">{item.figure}</p>
            <p className="res-plain">{item.plain}</p>
          </li>
        ))}
      </ul>

      <p className="hs-note">{researchSummary.closing}</p>
      <p className="hs-more">
        <Link href={researchSummary.href}>The thesis in full, with the figures</Link>
      </p>
    </section>
  );
}

export function Experience() {
  return (
    <section className="hs section-wrap" id="experience">
      <h2 className="hs-h2">Experience</h2>
      <ul className="exp-list">
        {homeExperience.map((role) => (
          <li className="exp-item" key={`${role.organisation}-${role.role}`}>
            <div className="exp-head">
              <h3 className="exp-role">{role.role}</h3>
              <p className="exp-org">{role.organisation}</p>
            </div>
            <div className="exp-meta">
              {/*
                * No period on the BP-IT entry, and nothing marked current
                * anywhere: that role has ended, and a "Now" badge on a finished
                * role is the kind of small wrongness that makes a reader
                * wonder what else on the page is stale.
                */}
              {role.period ? <span className="exp-period">{role.period}</span> : null}
              <span className="exp-place">{role.location}</span>
            </div>
            <ul className="exp-bullets">
              {role.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EducationAndSkills() {
  return (
    <section className="hs section-wrap" id="education">
      <div className="es-grid">
        <div>
          <h2 className="hs-h2">Education</h2>
          <ul className="edu-list">
            {homeEducation.map((entry) => (
              <li className="edu-item" key={entry.institution}>
                <p className="edu-credential">{entry.credential}</p>
                <p className="edu-institution">
                  {entry.institution}, {entry.year}
                </p>
                <p className="edu-note">{entry.note}</p>
              </li>
            ))}
          </ul>

          <h2 className="hs-h2 hs-h2-spaced">Certificates and volunteering</h2>
          <p className="hs-lede">{credentialsLink.summary}</p>
          <p className="hs-more">
            <Link href={credentialsLink.href}>{credentialsLink.label}</Link>
          </p>
        </div>

        <div>
          <h2 className="hs-h2">Skills</h2>
          <ul className="skill-list">
            {homeSkills.map((group) => (
              <li className="skill-group" key={group.group}>
                <p className="skill-name">{group.group}</p>
                <ul className="skill-items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
