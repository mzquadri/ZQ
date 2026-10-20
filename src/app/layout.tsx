import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import JsonLd from "@/components/JsonLd";
import { site } from "@/content/portfolio";
import "./globals.css";
import "./motion.css";
import "./cinema.css";
import "./scenes.css";
import "./home.css";
import "./rail.css";
import "./pages.css";

/*
 * Archivo and IBM Plex Mono, self-hosted and subset to Latin-1.
 *
 * The same pair the GitHub profile's animations and the system diagram are set
 * in, so a reader arriving from one surface to the other is reading the same
 * typography. Self-hosted is not a preference here: loading a face from
 * Google's servers sends the visitor's IP to a third country, which is the
 * thing a German privacy page then has to disclose.
 *
 * Archivo is variable on weight and width. The width axis is why it is here:
 * the display sizes are set wide and the body normal, which gives the headings
 * a voice without a second family. Subsetting the variable file to Latin-1 took
 * it from 643 KB to 90 KB with both axes intact.
 */
const archivo = localFont({
  src: "./fonts/Archivo-variable.woff2",
  variable: "--font-archivo",
  display: "swap",
  weight: "400 700",
  // Measured off the face, so a fallback line does not reflow when it swaps.
  adjustFontFallback: "Arial",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});

const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["Consolas", "monospace"],
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
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/rss.xml" },
  },
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
        /* Read aloud when the link is shared, so it says who and where, not a list of fields. */
        alt: "Mohd Zamin Quadri, AI/ML Engineer in Munich",
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

/*
 * Both of these were pinned to the old light-only design and would have fought
 * the theme.
 *
 * `colorScheme: "light"` emits a meta tag that tells the browser the page only
 * supports light, which overrides the stylesheet's `color-scheme: light dark`
 * and would have left every `light-dark()` token resolving to its light half
 * whatever the reader chose. "light dark" says what is actually true.
 *
 * `themeColor` tints the browser's own chrome on a phone. A single warm-paper
 * value left a cream bar above a dark page, so it is now a pair matched to each
 * theme's ground, which Next emits as two media-scoped meta tags.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
  /*
   * `viewportFit: "cover"` is what makes `env(safe-area-inset-*)` mean
   * anything.
   *
   * Without it iOS letterboxes the page inside the safe area and every inset
   * resolves to zero, so the one rule in the stylesheet that reached for
   * `env(safe-area-inset-bottom)` had been doing nothing since it was written.
   * With it the page is allowed to reach the physical edges, which is why the
   * rail, the navigation sheet and the page gutters now add the insets back
   * themselves: on a phone held sideways the notch is on the long edge, and
   * that is where the text starts.
   */
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#10151c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /*
     * `suppressHydrationWarning` because the script below writes `data-theme`
     * on this element before React hydrates, so the server's markup and the
     * client's genuinely differ by that one attribute, by design.
     */
    /*
     * The font variables go on <html>, not <body>.
     *
     * `--sans` is declared on `:root` as `var(--font-archivo), ...`, and a
     * `var()` inside a custom property is substituted at the element where that
     * property is declared, not where it is later used. With the font class on
     * <body>, `--font-archivo` was undefined at `:root`, so `--sans` resolved
     * to nothing at all, `body { font-family: var(--sans) }` became invalid,
     * and the page fell through to Tailwind's preflight stack. The site had
     * been serving ui-sans-serif rather than its own typeface, in every
     * browser, for as long as the variable sat on <body>; nothing caught it
     * because the fallback is a reasonable-looking sans.
     */
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          * Applied before first paint, so a reader whose stored choice differs
          * from their system preference does not see the other theme first.
          *
          * Only a stored choice is written here. With no choice stored the
          * attribute stays off and `color-scheme: light dark` lets the system
          * preference decide, which means the common case needs no script at
          * all and cannot flash.
          *
          * Wrapped in try/catch because reading localStorage throws outright
          * when a browser is set to block site data, and a themed page is worth
          * less than a page that renders.
          *
          * The string is a literal with nothing interpolated into it, which is
          * the condition that makes `dangerouslySetInnerHTML` safe here: there
          * is no input to sanitise, because there is no input. The stored value
          * is not trusted either - it is compared against the two permitted
          * strings rather than assigned through.
          */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `try{var t=localStorage.getItem("theme");` +
              `if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
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
            email: `mailto:${site.email}`,
            /*
             * Both degrees. This is the field a recruiter's tooling actually
             * reads off a personal site, and it was the one thing missing from
             * an otherwise complete Person block. End years only, matching the
             * CV and the Education section.
             */
            alumniOf: [
              {
                "@type": "CollegeOrUniversity",
                name: "Technical University of Munich",
                sameAs: "https://www.tum.de/",
              },
              {
                "@type": "CollegeOrUniversity",
                name: "Aligarh Muslim University",
                sameAs: "https://www.amu.ac.in/",
              },
            ],
            knowsAbout: [
              "Machine learning",
              "Uncertainty quantification",
              "Conformal prediction",
              "Graph neural networks",
              "Retrieval-augmented generation",
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
