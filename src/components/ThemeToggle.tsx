"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
/* Dispatched on this tab after a change, because `storage` only fires on others. */
const CHANGE_EVENT = "themechange";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  /*
   * The device preference is part of the state this button reports: with
   * nothing stored, the icon has to change if the visitor's system flips to
   * dark while the page is open.
   */
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}

/** What the page is showing right now, whether that came from storage or the device. */
function getSnapshot(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* Site data blocked. Fall through to the device preference. */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/*
 * The server cannot know the device preference, so it renders the light icon
 * and the client corrects it on hydration. The page underneath is already in the
 * right theme either way, because `color-scheme: light dark` and the inline
 * script in the layout settle that before first paint. Only the glyph moves.
 */
function getServerSnapshot(): Theme {
  return "light";
}

function apply(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* The attribute is still set, so this session is themed even unstored. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * One button: light or dark.
 *
 * This replaced a three-state radio group of Light / Dark / System. The
 * argument for keeping "System" visible was that the control should always be
 * able to say what is actually happening. That is true and it was still the
 * wrong call: three controls in the corner of a portfolio is three decisions
 * asked of someone who came to read about the work, and almost nobody wants to
 * go back to following their system once they have picked a side.
 *
 * Following the device is still the default, it is simply not a button any
 * more. Nothing is stored until the visitor clicks, so a first visit matches
 * their system and keeps matching it, including if they change it mid-visit.
 *
 * The icon shows the theme you would get by pressing it, which is the
 * convention nearly every site uses: a sun on a dark page, a moon on a light
 * one. The accessible name says it in words, because the glyph alone is only
 * legible to someone who already knows the convention.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${next} theme`}
      className="theme-button"
      onClick={() => apply(next)}
      title={`Switch to ${next} theme`}
      type="button"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/* Both icons are drawn, not glyphs: a character would depend on the font. */

function SunIcon() {
  return (
    <svg aria-hidden="true" focusable="false" height="18" viewBox="0 0 24 24" width="18">
      <circle cx="12" cy="12" fill="none" r="4.6" stroke="currentColor" strokeWidth="1.8" />
      <g stroke="currentColor" strokeLinecap="round" strokeWidth="1.8">
        <line x1="12" x2="12" y1="1.6" y2="4" />
        <line x1="12" x2="12" y1="20" y2="22.4" />
        <line x1="1.6" x2="4" y1="12" y2="12" />
        <line x1="20" x2="22.4" y1="12" y2="12" />
        <line x1="4.6" x2="6.3" y1="4.6" y2="6.3" />
        <line x1="17.7" x2="19.4" y1="17.7" y2="19.4" />
        <line x1="4.6" x2="6.3" y1="19.4" y2="17.7" />
        <line x1="17.7" x2="19.4" y1="6.3" y2="4.6" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" focusable="false" height="18" viewBox="0 0 24 24" width="18">
      <path
        d="M20.5 14.6A8.8 8.8 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
