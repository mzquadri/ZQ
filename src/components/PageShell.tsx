import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { site } from "@/content/portfolio";

interface PageShellProps {
  current?: string;
  children: ReactNode;
}

export default function PageShell({ current, children }: PageShellProps) {
  return (
    <>
      <SiteHeader
        current={current}
        identity={{ name: site.name, github: site.github, linkedin: site.linkedin }}
      />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </>
  );
}
