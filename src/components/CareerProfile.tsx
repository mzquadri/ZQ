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
          {record.status ? <p>{record.status}</p> : null}
        </li>
      ))}
    </ol>
  );
}
