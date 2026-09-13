"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import type { WalkthroughStep } from "@/content/legal-kb-walkthrough";

/**
 * Loads the walkthrough controller only on the page that has a walkthrough.
 *
 * The case-study route is shared by every project, so a static import would ship the controller to
 * all of them. `next/dynamic` keeps it out of the initial payload, and `ssr: true` keeps the
 * children server-rendered, so the article underneath is unaffected.
 *
 * Deferring the controller was not enough on its own. A lazily loaded module is still an emitted,
 * fetchable chunk, and the controller used to import the walkthrough script - so a production
 * build that correctly excluded the withheld case study still served its step titles and captions
 * as a static asset. The script now travels as a prop from the server component that renders this,
 * which only renders for a project the publication gate has allowed.
 */
const WalkthroughProvider = dynamic(
  () => import("./Walkthrough").then((module) => module.WalkthroughProvider),
  { ssr: true },
);

export default function GuidedArticle({
  steps,
  children,
}: {
  steps: readonly WalkthroughStep[];
  children: ReactNode;
}) {
  return (
    <WalkthroughProvider steps={steps}>
      <article>{children}</article>
    </WalkthroughProvider>
  );
}
