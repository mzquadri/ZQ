/**
 * Build the way production builds, from any shell.
 *
 *   node tools/build-prod.mjs
 *
 * The only difference from `next build` is `HIDE_DRAFTS=1`, and it matters more
 * than its size suggests. Draft visibility is decided at build time:
 *
 *   VERCEL_ENV !== "production" && HIDE_DRAFTS !== "1"
 *
 * so a plain local build prerenders the confidential case study, by design, so
 * that it can be reviewed. Anything that then inspects `.next` is inspecting a
 * tree that contains it. `npm run check` ends in `next build`, which is why
 * running the privacy scan after it reported findings that were not defects,
 * and why `npm run check:privacy` exists to do the two in the right order.
 *
 * This is a script rather than `cross-env HIDE_DRAFTS=1 next build`, because
 * `cross-env` is present in node_modules only as a transitive dependency and
 * depending on it undeclared would break on a clean install. `set VAR=x &&` is
 * cmd-only and `VAR=x` is POSIX-only; Node is the one thing already required.
 */
import { spawn } from "node:child_process";

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, HIDE_DRAFTS: "1" },
});

child.on("exit", (code) => process.exit(code ?? 1));
