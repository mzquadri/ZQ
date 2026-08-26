"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

/**
 * Loads the walkthrough controller only on the page that has a walkthrough.
 *
 * The case-study route is shared by every project, so a static import would ship the controller -
 * and the walkthrough script it carries - to all of them. In a production build, where the
 * confidential case study is excluded, that meant its step titles and captions were still
 * fetchable from a published page. They are sanitised, but an unapproved page should not be
 * readable in pieces from an approved one.
 *
 * `ssr: true` keeps the children server-rendered, so the article underneath is unaffected: the
 * only thing deferred is the controller itself.
 */
const WalkthroughProvider = dynamic(
  () => import("./Walkthrough").then((module) => module.WalkthroughProvider),
  { ssr: true },
);

export default function GuidedArticle({ children }: { children: ReactNode }) {
  return (
    <WalkthroughProvider>
      <article>{children}</article>
    </WalkthroughProvider>
  );
}
