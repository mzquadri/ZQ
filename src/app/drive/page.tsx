import { permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Drive",
  description: "A guided route through the work on this site.",
  path: "/drive",
});


export default function DrivePage() {
  permanentRedirect("/work");
}
