# Why `.next/dev` is excluded from type checking

Next 16 gives `next dev` and `next build` separate output directories so the two
can run at once: dev writes `.next/dev`, build writes `.next`. The generated
`tsconfig.json` lists both directories' route-validation types under `include`,
which is right for an editor and wrong for a build.

With `.next/dev/types/**/*.ts` included, `npm run check` type-checks a file that
a running dev server owns and rewrites. If anyone has `npm run dev` open, the
build reads that file mid-write and fails on something that is not in the
source:

```
.next/dev/types/validator.ts(179,1): error TS1434: Unexpected keyword or identifier.
.next/dev/types/validator.ts(183,1): error TS1128: Declaration or statement expected.
```

Line 178 of that file was the tail of one route's validation block spliced onto
the head of another's. Two writers, one file.

So `.next/dev` is excluded and only `.next/types` is checked. Route types are
still validated, by the build's own generated copy, which is the one the build
actually produced. The cost is that `tsc --noEmit` on its own no longer sees
dev-generated route types, which matters only if a route's type is wrong *and*
nobody ever runs a build, and the build is the gate.

This also means `npm run check` no longer depends on whether a dev server
happens to be open, which it silently did before.

## Why the fix is an `exclude` and not an `include` edit

`next dev` rewrites `tsconfig.json` and puts `.next/dev/types/**/*.ts` back
under `include` every time it starts, the same way it writes the AGENTS.md
preamble. Deleting that line is therefore not a fix; it comes back on the next
`npm run dev` and the build starts failing again with nothing in the history to
explain it.

`exclude` wins over `include` in TypeScript, so the entry can return as often as
it likes and the directory stays out. The line being back in `include` is not a
sign the fix was reverted.
