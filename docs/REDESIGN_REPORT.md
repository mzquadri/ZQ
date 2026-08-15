# Portfolio Redesign Report

## Goal

Replace a client-heavy visual demo with a credible, recruiter-readable engineering portfolio
for reliable ML, Applied AI, GNN, scientific computing, and MLOps roles.

## Before

- Two routes, including an empty client-only `/drive` page.
- Up to eleven continuously rendering WebGL canvases and overlapping animation systems.
- Broken CV and font requests, a contact form that reported success without sending, and a
  publicly embedded phone number.
- Unsupported counters, proficiency percentages, work-impact statements, credentials, and an
  incorrect thesis description.
- No route tests, accessibility automation, sitemap, robots endpoint, OG image, structured
  data, canonical metadata, or custom not-found route.

## After

- Six main information routes and six statically generated evidence-rich case studies.
- Central typed content with explicit project classifications, contribution boundaries,
  evidence, quality controls, limitations, and source links.
- Static research pipeline and selective-risk graphics, with incompatible calibration
  protocols visibly separated.
- Server components by default; no WebGL, motion, audio, physics, debug UI, client forms,
  analytics, cookies, or third-party scripts.
- Local fonts, responsive editorial design, skip navigation, visible focus states, reduced
  motion behavior, semantic headings, and WCAG AA contrast.
- Canonical metadata, OG image, robots, sitemap, JSON-LD, security headers, and not-found page.
- Content/privacy validation plus 34 desktop/mobile Playwright checks with axe.

## Delivery Impact

The previous historical build exposed roughly 1.43 MB of uncompressed initial-route
JavaScript before deferred scene chunks. The redesigned production build reports 96.1 kB
first-load JavaScript for content routes, with only 192 B of route-specific client code.
Removing the decorative 3D stack eliminated 141 installed packages.

## Known Boundary

The project remains on Next.js 14.2.35 to preserve the requested framework compatibility.
As of the redesign, npm audit reports advisories whose offered remediation is a breaking
upgrade to Next.js 16. The site does not use remote image patterns, Server Actions, rewrites,
user-controlled scripts, or mutable application data, which narrows exposure but does not
erase framework advisories. Upgrade planning should be handled separately and tested as a
framework migration rather than forced into this redesign.
