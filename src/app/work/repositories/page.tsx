import type { Metadata } from "next";
import Link from "next/link";

import { EcosystemGroups, SnapshotNote } from "@/components/EcosystemGrid";
import { StageHero } from "@/components/cinema/PageStages";
import PageShell from "@/components/PageShell";
import { ecosystemRepositories, getPopulatedCategories } from "@/content/ecosystem";
import { site } from "@/content/portfolio";
import { createPageMetadata } from "@/lib/metadata";
import { ArrowLabel } from "@/components/Icon";

export const metadata: Metadata = createPageMetadata({
  title: "Public repositories",
  description:
    "Every public repository, grouped by portfolio status rather than by technical quality: flagship work, active projects, research, experiments and references, each stating what it does and does not establish.",
  path: "/work/repositories",
});

/*
 * The catalogue, on its own route.
 *
 * It used to be the last and largest section of /work. Measured at 390px that page ran to 18,900px
 * - twenty-one screens - and most of the height below the case studies was this: thirty-odd
 * repository cards in five category groups, each with a disclosure. A visitor who came to see the
 * work had to scroll past all of it to reach the end of the page, and a visitor who came for the
 * catalogue had no way to link to it.
 *
 * Both are better served by a route. /work keeps a short pointer; this page keeps the whole list,
 * gets its own sitemap entry and its own title, and can be sent to someone directly.
 *
 * Nothing was cut. The groups, the summaries, the disclosures and the snapshot note are the same
 * components rendering the same registry.
 */
export default function RepositoriesPage() {
  const groups = getPopulatedCategories();

  return (
    <PageShell current="/work">
      <StageHero
        accent="var(--accent-steel)"
        eyebrow="Repository index"
        title="Every public repository, labelled by what it can prove."
        standfirst="Categories describe portfolio status, not technical quality. An experiment is never presented as a production system, and a repository that carries no evidence says so in its own entry. Where a repository has been read module by module, its card opens into how it actually runs."
        meta={[
          { label: "Repositories", value: ecosystemRepositories.length.toString() },
          { label: "Categories", value: groups.length.toString() },
        ]}
      >
        <p className="hero-actions">
          <Link className="button button-secondary" href="/work">
            <ArrowLabel kind="forward">Selected work</ArrowLabel>
          </Link>
          <a className="button button-secondary" href={site.github}>
            <ArrowLabel>GitHub profile</ArrowLabel>
          </a>
        </p>
      </StageHero>

      <section className="section-wrap ecosystem-index" id="repositories">
        <div className="ecosystem-index-rest" data-showcase="index">
          <EcosystemGroups groups={groups} />
          <SnapshotNote />
        </div>
      </section>

      <section className="closing-section section-wrap">
        <p className="kicker">Reading the labels</p>
        <h2>Not every repository is flagship work, and none of them pretend to be.</h2>
        <p>
          Reference and experiment repositories are kept public because the reasoning in them is
          useful, not because they carry production evidence. Where a claim needs proof, the case
          study links directly to the artifact.
        </p>
        <Link className="button button-primary" href="/work">
          <ArrowLabel kind="forward">Selected work</ArrowLabel>
        </Link>
      </section>
    </PageShell>
  );
}
