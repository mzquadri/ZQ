interface SectionHeadingProps {
  /**
   * A sequence marker, for the rare section that genuinely is step N of a
   * process. Optional, and almost always omitted.
   *
   * Every section on this site used to carry one, zero-padded to "01". The
   * design skill's rule is the right one: a numbered marker is appropriate when
   * the content really is a sequence, and these are categories of work. The
   * marker told a reader that ordering carried meaning when it did not.
   */
  index?: string;
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
        {index ? <span>{index}</span> : null}
        {eyebrow}
      </p>
      <h2>{title}</h2>
      {introduction ? <p className="section-intro">{introduction}</p> : null}
    </header>
  );
}
