import { site } from "@/content/portfolio";
import { getDisciplines } from "@/content/disciplines";

/**
 * Experience grouped by discipline.
 *
 * This was an ordered rail: five roles, one marker each, read top to bottom. No date was ever
 * rendered on it, and it was still a career timeline - order was the only information the rail
 * carried, and a reader turns order into a narrative whether or not one is offered.
 *
 * Grouping by discipline answers a better question. Not when something happened, but which kinds
 * of work recur, which is visible immediately: one discipline holds two roles, and that repetition
 * is the actual signal in a five-role record.
 *
 * The entries are titles because titles are what has been approved for publication. The one role
 * with a sanitized practice description shows it under its discipline rather than as the only row
 * on the page with content.
 *
 * Each role now also carries its period, transcribed from the CV. That is a reversal: dates were
 * withheld here on the argument that they turn five roles into a narrative. The grouping still
 * prevents that - the periods sit inside disciplines rather than in one descending column - but
 * how long something ran is information a reader of a portfolio is entitled to, and withholding
 * it cost more than the narrative it avoided.
 */
export function ExperienceList() {
  const groups = getDisciplines();

  return (
    <div className="discipline-set">
      {groups.map((group) => (
        <section className="discipline" key={group.id}>
          <h3 className="discipline-name">{group.name}</h3>
          <p className="discipline-summary">{group.summary}</p>
          <ul className="discipline-roles">
            {group.roles.map((record) => (
              <li key={record.id}>
                <p className="discipline-role">{record.title}</p>
                <p className="career-org">
                  {[record.organization, record.location].filter(Boolean).join(" / ")}
                </p>
                {record.period ? <p className="career-period">{record.period}</p> : null}
                {record.practice ? <p className="career-practice">{record.practice}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function EducationList() {
  return (
    <ol className="education-list">
      {site.education.map((record) => (
        <li key={record.id}>
          <p className="classification">{record.institution}</p>
          <h3>{record.credential}</h3>
          <p className="career-period">
            {[record.period, record.location].filter(Boolean).join(" / ")}
          </p>
          {record.status ? <p>{record.status}</p> : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Certifications and languages.
 *
 * Two short records that were on the CV and nowhere on the site, which meant the document and
 * the pages disagreed about what the record contained. Neither is load-bearing for an engineering
 * portfolio, so they are set quietly and together rather than given a section each.
 */
export function CredentialsList() {
  return (
    <div className="credential-columns">
      <section>
        <h3 className="credential-heading">Certifications</h3>
        <ul className="credential-list">
          {site.certifications.map((entry) => (
            <li key={entry.id}>
              <p className="credential-name">{entry.title}</p>
              <p className="credential-meta">
                {entry.issuer} / {entry.awarded}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="credential-heading">Languages</h3>
        <ul className="credential-list">
          {site.languages.map((entry) => (
            <li key={entry.id}>
              <p className="credential-name">{entry.language}</p>
              <p className="credential-meta">{entry.level}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
