/**
 * Contrast of the palette, computed rather than eyeballed.
 *
 *   node tools/check-contrast.mjs            audit every accent, both themes
 *   node tools/check-contrast.mjs darken '#4e9a92' 4.5   find the nearest darker shade
 *
 * HANDOFF section 4 records that accessibility went from 96 to 100 by fixing
 * exactly this class of bug: "eight scene accents that were fill-strength
 * colours used as text in about 40 places at 3.69:1", and it ends with the
 * instruction that if a new scene accent is added it has to be checked as
 * text. Checking it by hand is how it stopped being checked.
 *
 * Two questions per accent, because an accent is used two ways:
 *
 *   as text    the accent on the page ground, which needs 4.5:1 for body text
 *   as a fill  white on the accent, which is what a pressed button looks like
 *
 * A fill-strength colour is chosen to be seen against paper. It is almost
 * never dark enough to carry white text, and that is the trap: the token
 * reads fine in one role and fails in the other.
 */

const parseHex = (hex) => {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
};

const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;

/** WCAG relative luminance. */
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const la = luminance(parseHex(a));
  const lb = luminance(parseHex(b));
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The nearest darker shade of a colour that carries `on` at `target`.
 *
 * Scales in linear light rather than in sRGB, which keeps the hue and the
 * relationship between the channels: multiplying the sRGB bytes shifts the hue
 * towards whichever channel is largest.
 */
const darken = (hex, on = "#ffffff", target = 4.5) => {
  const rgb = parseHex(hex);
  const lin = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  for (let k = 1; k > 0; k -= 0.002) {
    const scaled = lin.map((c) => c * k);
    const back = scaled.map((c) => {
      const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
      return Math.max(0, Math.min(255, s * 255));
    });
    const candidate = toHex(back);
    if (contrast(candidate, on) >= target) return candidate;
  }
  return "#000000";
};

if (process.argv[2] === "pair") {
  const [, , , fg, bg] = process.argv;
  const ratio = contrast(fg, bg);
  console.log(`${fg} on ${bg}: ${ratio.toFixed(2)}:1  ${ratio >= 4.5 ? "passes AA text" : "FAILS AA text"}`);
  process.exit(ratio >= 4.5 ? 0 : 1);
}

if (process.argv[2] === "darken") {
  const [, , , hex, on = "#ffffff", target = "4.5"] = process.argv;
  const result = darken(hex, on, Number(target));
  console.log(`${hex} -> ${result}  (${contrast(result, on).toFixed(2)}:1 against ${on})`);
  process.exit(0);
}

/* ---- The audit -------------------------------------------------------------------------------- */

/*
 * Grounds the accents are actually used on, read from globals.css. `--paper`
 * is the page, `--paper-raised` is a card, `--stage` is the rail and the
 * closing section.
 */
const GROUND = {
  light: { paper: "#f7f8fa", raised: "#ffffff", stage: "#eef1f5" },
  dark: { paper: "#10151c", raised: "#171e27", stage: "#171e27" },
};

/* Every accent token, as `light-dark()` declares them. */
const ACCENTS = {
  "--violet": { light: "#7a6ba8", dark: "#a99cd6" },
  "--blue": { light: "#4c7cae", dark: "#87aeda" },
  "--teal-accent": { light: "#4e9a92", dark: "#82c0b8" },
  "--violet-ink": { light: "#5f5190", dark: "#a99cd6" },
  "--blue-ink": { light: "#3a6490", dark: "#87aeda" },
  "--teal-ink": { light: "#35756e", dark: "#82c0b8" },
  "--teal-dark": { light: "#35756e", dark: "#5e9c94" },
};

const AA_TEXT = 4.5;
let failures = 0;

for (const theme of ["light", "dark"]) {
  const ink = theme === "light" ? "#10151c" : "#e6edf5";
  console.log(`\n==== ${theme} ====`);
  for (const [name, values] of Object.entries(ACCENTS)) {
    const accent = values[theme];
    const asText = Math.min(...Object.values(GROUND[theme]).map((g) => contrast(accent, g)));
    /* White on the accent, which is what a filled control does. */
    const asFillWhite = contrast(accent, "#ffffff");
    /* The page ink on the accent, which is the other way to fill a control. */
    const asFillInk = contrast(accent, ink);
    const bestFill = Math.max(asFillWhite, asFillInk);

    const textOk = asText >= AA_TEXT;
    const fillOk = bestFill >= AA_TEXT;
    if (!textOk) failures += 1;

    console.log(
      `${name.padEnd(16)} ${accent}  text ${asText.toFixed(2)}:1 ${textOk ? "ok " : "FAIL"}   ` +
        `fill: white ${asFillWhite.toFixed(2)}:1, ink ${asFillInk.toFixed(2)}:1 ` +
        `${fillOk ? `ok via ${asFillWhite >= AA_TEXT ? "white" : "ink"}` : "NO LEGIBLE TEXT"}`,
    );
    if (!fillOk) {
      console.log(`${" ".repeat(16)}  a filled control needs ${darken(accent)} for white`);
    }
  }
}

console.log(
  failures === 0
    ? "\nEvery accent clears 4.5:1 as text on every ground it is used on."
    : `\n${failures} accents fail as text.`,
);
process.exitCode = failures === 0 ? 0 : 1;
