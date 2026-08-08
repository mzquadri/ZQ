# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Next.js dev server on http://localhost:3000
- `npm run build` — production build (this is what Vercel runs via `vercel.json`)
- `npm start` — run the production build locally
- `npm run lint` — `next lint` with `next/core-web-vitals` + `next/typescript`

There is no test suite in this repo.

## Architecture

This is a single-page portfolio site (Next.js 14, App Router, TypeScript, Tailwind). Everything renders from `src/app/page.tsx`, which composes the section components in vertical order with `<FloatingElements>` 3D dividers between them. Routing is incidental — the only "page" is `/`, and the navbar uses anchor links (`#about`, `#projects`, etc.) into section IDs on that page.

### 3D scene pattern (important)

Every 3D feature is split into two files following a strict convention:

- `XCanvas.tsx` — a `"use client"` component that owns the `<Canvas>` from `@react-three/fiber`, sets up lights, dpr, and gl options. This file is what gets imported by section components.
- `X3D.tsx` — the scene contents (meshes, `useFrame` loops, custom geometry/shaders). It assumes it is already inside a `<Canvas>` and must not be rendered standalone.

Examples: `Scene3D.tsx` (hero, special — combines both roles), `NeuralNetwork3D.tsx`, `FloatingLaptop3D.tsx` + `FloatingLaptopCanvas.tsx`, `DataSphere3D.tsx` + `DataSphereCanvas.tsx`, `GeometricAvatar3D.tsx` + `GeometricAvatarCanvas.tsx`.

Canvases are imported via `next/dynamic` with `ssr: false` (WebGL is browser-only). When adding a new 3D feature, follow the split and import the Canvas wrapper dynamically — never import `*3D.tsx` directly into a section.

Postprocessing (`@react-three/postprocessing` Bloom + Vignette) is currently only wired into the hero `Scene3D`. Pinned to `2.16` for compatibility with the `@react-three/fiber` 8.x / drei 9.x stack — don't bump it casually.

### Scroll animations are class-driven

`src/components/ScrollAnimations.tsx` is mounted once near the top of `page.tsx` and registers GSAP `ScrollTrigger` animations against CSS class selectors. Components opt in to animations by adding the right class:

- `.section-title`, `.section-subtitle` — fade/slide on enter
- `.glass-card` — staggered card reveals (stagger key is index `% 3`)
- `.timeline-entry` — alternating left/right slide based on index parity
- `.skill-bar-fill` — animates `width` from `data-width` attribute
- `.floating-divider` — parallax scrub
- `.scene-reveal`, `.parallax-3d` — for 3D containers

If a new component should animate, add the class — don't add a per-component GSAP call. Framer Motion is used separately for hero/in-view micro-animations; both libraries coexist intentionally.

### Theme

Tailwind config (`tailwind.config.ts`) defines a custom emerald + dark palette and a set of named keyframes (`float`, `pulse-glow`, `gradient`, `slide-up`, `typing`, etc.). Reusable visual primitives — `.glass-card`, `.glass-nav`, `.gradient-text`, `.btn-primary`, `.btn-outline`, `.skill-badge`, `.timeline-line`, `.section-container` — live in `@layer components` inside `src/app/globals.css`. Prefer these over re-rolling utility chains. The `<html>` element is hardcoded to `className="dark"`; there is no light-mode toggle.

Fonts are loaded in `src/app/layout.tsx` via `next/font/google` (Inter, JetBrains Mono, Orbitron) and exposed as the CSS variables `--font-inter`, `--font-jetbrains`, `--font-orbitron`, mapped to Tailwind's `font-sans` / `font-mono` / `font-display`.

### Path alias

`@/*` resolves to `./src/*` (see `tsconfig.json`). Use `@/components/...` rather than relative paths.
