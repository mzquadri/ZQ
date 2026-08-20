import type { ReactNode } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

interface PageShellProps {
  current?: string;
  children: ReactNode;
}

export default function PageShell({ current, children }: PageShellProps) {
  return (
    <>
      <SiteHeader current={current} />
      <main id="main-content" tabIndex={-1}>{children}</main>
      <SiteFooter />
    </>
  );
}
