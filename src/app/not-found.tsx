import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { ArrowLabel } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested portfolio route does not exist.",
  alternates: {},
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageShell>
      <section className="not-found section-wrap">
        <p className="kicker">404 / Outside the evidence set</p>
        <h1>This route does not exist.</h1>
        <p>The useful paths are still available: selected work, research, and contact.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/">Return home</Link>
          <Link className="text-link" href="/work"><ArrowLabel kind="forward">Browse work</ArrowLabel></Link>
        </div>
      </section>
    </PageShell>
  );
}
