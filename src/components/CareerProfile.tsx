import { site } from "@/content/portfolio";

interface CareerProfileProps {
  compact?: boolean;
}

export function ExperienceList({ compact = false }: CareerProfileProps) {
  const records = compact ? site.experience.slice(0, 3) : site.experience;

  return (
    <ol className="career-list">
      {records.map((record, index) => (
        <li key={record.id}>
          <span className="career-number" aria-hidden="true">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <div>
            <h3>{record.title}</h3>
            <p>{record.organization}</p>
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
