import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The requested portfolio route does not exist.",
  alternates: {},
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageShell>
      {/*
        * A 404 should help, not perform.
        *
        * It read "404 / Outside the evidence set", which is a joke at the
        * expense of someone who has just failed to find something, and the
        * only way onward was "Browse work". Plain sentence, and every section
        * of the site listed, because the commonest reason to land here is a
        * stale or mistyped link and the reader already knows what they wanted.
        */}
      <section className="not-found section-wrap">
        <p className="kicker">404</p>
        <h1>That page does not exist</h1>
        <p>
          The link may be out of date, or there may be a typo in the address.
          Everything on this site is one of these:
        </p>
        <ul className="not-found-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/experience">Experience</Link></li>
          <li><Link href="/research">Research</Link></li>
          <li><Link href="/work">Projects</Link></li>
          <li><Link href="/certificates">Certificates and volunteering</Link></li>
          <li><Link href="/learn">Writing</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>
      </section>
    </PageShell>
  );
}
