/**
 * Reads a timeline recorded by tools/record-motion.mjs and reports where the motion broke.
 *
 * The unit that matters is the frame interval, not the average frame rate. A pass can average a
 * comfortable 58 fps and still feel broken, because a reader does not perceive a mean - they
 * perceive the one 180 ms gap where the page stopped moving under their hand. So the summary is
 * a distribution and a list of incidents, and every incident carries the timestamp it happened
 * at, which is also its timestamp in the video.
 *
 * Thresholds, at a 60 Hz display: a frame is late past 20 ms, a frame is dropped past 32 ms
 * (one whole missed vsync), and past 50 ms it is a hitch a reader can see.
 *
 * Usage: node tools/analyse-motion.mjs media/motion/home.timeline.json
 */
import { readFileSync } from "node:fs";

const t = JSON.parse(readFileSync(process.argv[2], "utf8"));
const stamp = (ms) => {
  const s = ms / 1000;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(2).padStart(5, "0")}`;
};

/* Absolute time of each frame, so an incident can be placed in the recording. */
const at = [];
let acc = 0;
for (const d of t.frames) {
  acc += d;
  at.push(acc);
}

const marks = t.marks ?? [];
const sceneOf = (ms) => {
  let found = "(before first mark)";
  for (const m of marks) if (m.at <= ms) found = m.label;
  return found;
};

const sorted = [...t.frames].sort((a, b) => a - b);
const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length * p) / 100))];
const late = t.frames.filter((d) => d > 20).length;
const dropped = t.frames.filter((d) => d > 32).length;
const hitches = [];
for (let i = 0; i < t.frames.length; i += 1) {
  if (t.frames[i] > 50) hitches.push({ at: at[i], ms: t.frames[i] });
}

console.log(`duration      ${stamp(acc)}  (${t.frames.length} frames)`);
console.log(`median frame  ${pct(50).toFixed(1)} ms   ->  ${(1000 / pct(50)).toFixed(0)} fps`);
console.log(`p95 frame     ${pct(95).toFixed(1)} ms`);
console.log(`p99 frame     ${pct(99).toFixed(1)} ms`);
console.log(`worst frame   ${sorted.at(-1).toFixed(1)} ms`);
console.log(
  `late  >20ms   ${late} (${((late / t.frames.length) * 100).toFixed(1)}%)   ` +
    `dropped >32ms ${dropped} (${((dropped / t.frames.length) * 100).toFixed(2)}%)`,
);

console.log(`\nhitches >50ms (${hitches.length})`);
for (const h of hitches.slice(0, 40)) {
  console.log(`  ${stamp(h.at)}  ${h.ms.toFixed(0).padStart(4)} ms   ${sceneOf(h.at)}`);
}
if (hitches.length > 40) console.log(`  ... ${hitches.length - 40} more`);

const long = (t.long ?? []).filter((l) => l.ms >= 50);
console.log(`\nlong tasks >=50ms (${long.length})`);
for (const l of long.slice(0, 30)) {
  console.log(`  ${stamp(l.at)}  ${String(l.ms).padStart(4)} ms   ${sceneOf(l.at)}`);
}
if (long.length > 30) console.log(`  ... ${long.length - 30} more`);

const shifts = (t.shifts ?? []).filter((s) => s.value > 0.001);
const cls = shifts.reduce((a, s) => a + s.value, 0);
console.log(`\nlayout shift total ${cls.toFixed(4)} across ${shifts.length} shifts`);
for (const s of shifts.slice(0, 15)) {
  console.log(`  ${stamp(s.at)}  ${s.value.toFixed(4)}   ${sceneOf(s.at)}`);
}

/* Per-labelled-moment frame health, which is how a fix gets aimed at one scene. */
console.log(`\nper moment`);
for (let i = 0; i < marks.length; i += 1) {
  const from = marks[i].at;
  const to = marks[i + 1]?.at ?? acc;
  const idx = [];
  for (let f = 0; f < at.length; f += 1) if (at[f] >= from && at[f] < to) idx.push(t.frames[f]);
  if (idx.length < 4) continue;
  const s = [...idx].sort((a, b) => a - b);
  const med = s[Math.floor(s.length / 2)];
  const p95v = s[Math.floor((s.length * 95) / 100)];
  const drop = idx.filter((d) => d > 32).length;
  console.log(
    `  ${stamp(from)}  ${marks[i].label.padEnd(30)} ` +
      `med ${med.toFixed(1).padStart(5)}ms (${(1000 / med).toFixed(0).padStart(2)}fps)  ` +
      `p95 ${p95v.toFixed(0).padStart(4)}ms  dropped ${String(drop).padStart(3)}/${idx.length}`,
  );
}
