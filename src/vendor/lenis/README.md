# Lenis 1.3.27

The source of `packages/core/src` from https://github.com/darkroomengineering/lenis at `e01eefb`,
MIT licensed. It is vendored because it was added from an environment with no npm registry access.
Two edits: the version constant in `lenis.ts`, which upstream imports from its own
`package.json`, and the timer type in `debounce.ts`, which assumed no Node types. Replacing this folder with the `lenis` npm package needs no other change than the
import in `src/components/SmoothScroll.tsx`.
