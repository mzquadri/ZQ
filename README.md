# ZQ &mdash; Personal Portfolio

An interactive single-page portfolio for Mohd Zamin Quadri, built with
Next.js 14, TypeScript, Tailwind CSS, and React Three Fiber. The page is a
single scroll-through experience: every section lives on `src/app/page.tsx`,
3D WebGL scenes run between sections, and scroll animations are triggered by
CSS classes rather than per-component glue code.

The **Projects** section links to public repositories and intentionally
describes their verified scope. Experimental or synthetic-data projects are
not presented as production systems or real-world performance evidence.

## Architecture

![Architecture overview](docs/diagrams/architecture.svg)

The layout composes section components in vertical order on one route:

| Area | What it does |
|---|---|
| Hero (`Scene3D`) | Immersive neural-network hero with postprocessing bloom and floating 3D elements |
| About / Experience / Education | Timeline entries, glass cards, animated skill bars |
| Skills / Certifications / Projects | Project cards linking to live GitHub repositories |
| Contact / Footer | Social links and closing section |
| `/drive` | Dedicated 3D scene page, linked from the navbar |

Two conventions keep the 3D code tidy. Every scene is split into a
`XCanvas.tsx` wrapper (owns the R3F `<Canvas>`, lighting, dpr) and an `X3D.tsx`
scene file, imported via `next/dynamic` with `ssr: false`. Scroll animations
are registered once in `ScrollAnimations.tsx` and driven by CSS classes
(`.glass-card`, `.timeline-entry`, `.skill-bar-fill`), so new components opt in
by adding a class instead of writing their own GSAP calls.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

## Verify a production build

```bash
npm run build
```

## Deployment

The site is configured for Vercel. Production deployment runs `npm run build`
via `vercel.json`.

## Repository layout

```
src/
|-- app/
|   |-- page.tsx            # single-page composition
|   |-- drive/              # /drive 3D scene page
|   |-- layout.tsx          # fonts, metadata, root layout
|   `-- globals.css         # Tailwind + reusable component classes
|-- components/             # section components and 3D scenes
`-- docs/diagrams/          # architecture diagrams
```

## License

This project is licensed under the [MIT License](LICENSE).
