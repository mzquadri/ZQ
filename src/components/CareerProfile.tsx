import { site } from "@/content/portfolio";

interface CareerProfileProps {
  compact?: boolean;
}

/**
 * Experience as a deliberate timeline.
 *
 * Only one role carries an approved description, so the previous list read as four
 * unfinished rows following one complete one. A rail with explicit markers makes the
 * shape intentional: the entries are titles because titles are what has been approved
 * for publication, and the one role with a sanitized description shows it as an
 * annotation on the rail rather than as the only row with content.
 *
 * No date is rendered anywhere. Disputed historical dates are deliberately unpublished.
 */
export function ExperienceList({ compact = false }: CareerProfileProps) {
  const records = compact ? site.experience.slice(0, 3) : site.experience;

  return (
    <ol className="career-list timeline">
      {records.map((record) => (
        <li key={record.id}>
          <span aria-hidden="true" className="career-rail" />
          <div>
            <h3>{record.title}</h3>
            <p className="career-org">{record.organization}</p>
            {record.practice ? <p className="career-practice">{record.practice}</p> : null}
          </div>
          <p className="career-context">
            {[record.location, record.status].filter(Boolean).join(" / ")}
          </p>
        </li>
      ))}
    </ol>
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
