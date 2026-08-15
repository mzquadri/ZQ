import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <section className="not-found section-wrap">
        <p className="kicker">404 / Outside the evidence set</p>
        <h1>This route does not exist.</h1>
        <p>The useful paths are still available: selected work, research, and contact.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/">Return home</Link>
          <Link className="text-link" href="/work">Browse work <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </PageShell>
  );
}
