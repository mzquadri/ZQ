import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import JsonLd from "@/components/JsonLd";
import { site } from "@/content/portfolio";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: `${site.name} | ${site.role}`,
    template: "%s | Mohd Zamin Quadri",
  },
  description: site.description,
  keywords: [
    "Mohd Zamin Quadri",
    "Machine Learning Engineer",
    "Applied AI",
    "Uncertainty Quantification",
    "Graph Neural Networks",
    "Scientific Computing",
    "MLOps",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} | ${site.role}`,
    description: site.description,
    url: site.domain,
    siteName: site.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mohd Zamin Quadri — Applied ML, reliable systems, scientific computing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.role}`,
    description: site.description,
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f2f0e8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: site.name,
            jobTitle: site.role,
            url: site.domain,
            sameAs: [site.github, site.linkedin],
            address: {
              "@type": "PostalAddress",
              addressLocality: site.location.split(",")[0],
              addressCountry: "DE",
            },
            knowsAbout: [
              "Machine learning",
              "Uncertainty quantification",
              "Graph neural networks",
              "Scientific computing",
              "MLOps",
            ],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.domain,
            description: site.description,
          }}
        />
        {children}
      </body>
    </html>
  );
}
