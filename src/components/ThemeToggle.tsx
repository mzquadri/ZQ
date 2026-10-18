"use client";

import { useSyncExternalStore } from "react";

type Choice = "light" | "dark" | "system";

const STORAGE_KEY = "theme";
/* Dispatched on this tab after a change, because `storage` only fires on others. */
const CHANGE_EVENT = "themechange";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): Choice {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    /* Site data blocked. Nothing is stored, so nothing is overriding the system. */
    return "system";
  }
}

/*
 * What the server renders, and what the client renders on its first pass so the
 * two agree. A reader with a stored choice sees the control correct itself as
 * soon as React is interactive; the page under it was already in the right
 * theme, because the inline script in the layout ran before paint.
 */
function getServerSnapshot(): Choice {
  return "system";
}

function apply(choice: Choice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  try {
    if (choice === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    /* The attribute is still set, so this session is themed even unstored. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Three states, not two: light, dark, and following the system.
 *
 * A two-state toggle has to pick a starting side, and whichever it picks is
 * wrong for half of all visitors: a reader on a dark system who has never
 * touched it sees a control that says "dark" next to a dark page and cannot
 * tell whether it is reporting or offering. Keeping "system" as a real, visible
 * third state means the control always says what is actually happening, and a
 * reader who has chosen can get back to following their system, which a
 * two-state toggle makes impossible.
 *
 * The stored preference is read through `useSyncExternalStore` rather than an
 * effect that calls setState. localStorage genuinely is an external store, and
 * reading it this way also picks up a change made in another tab for free,
 * through the `storage` event the subscription already has to listen for.
 *
 * The options render as words. A sun and a moon are only legible if you already
 * know the convention, and nobody came to this page to learn an icon.
 */
export default function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const options: ReadonlyArray<[Choice, string]> = [
    ["light", "Light"],
    ["dark", "Dark"],
    ["system", "System"],
  ];

  return (
    <fieldset className="theme-toggle" aria-label="Colour theme">
      {options.map(([value, label]) => (
        <label key={value} className="theme-toggle__option">
          <input
            type="radio"
            name="theme"
            value={value}
            checked={choice === value}
            onChange={() => apply(value)}
          />
          <span>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}
