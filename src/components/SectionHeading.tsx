interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  introduction?: string;
}

export default function SectionHeading({
  index,
  eyebrow,
  title,
  introduction,
}: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <p className="section-index">
        <span>{index}</span>
        {eyebrow}
      </p>
      <h2>{title}</h2>
      {introduction ? <p className="section-intro">{introduction}</p> : null}
    </header>
  );
}
