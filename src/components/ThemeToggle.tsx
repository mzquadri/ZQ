"use client";

import { useSyncExternalStore } from "react";

export const THEME_KEY = "zq-theme";

/**
 * Light and dark, owned by the document element.
 *
 * `data-theme` on `<html>` is the single source of truth: CSS reads it, and the
 * 3D world is handed a boolean derived from it rather than asking separately,
 * so the page and the scene can never disagree about which theme is on.
 *
 * The first paint is set by an inline script in the layout, before React runs,
 * because a toggle that reads localStorage in an effect shows the wrong theme
 * for one frame and the flash is worse than the feature.
 *
 * Read through `useSyncExternalStore` rather than `useState` in an effect. The
 * attribute is external state that something outside React writes, which is
 * exactly what the hook is for, and it avoids the cascading render that
 * setting state synchronously inside an effect causes.
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

/* The server has no document and no idea which theme the reader prefers. Light
 * is the honest default for it; the inline script has already corrected the
 * real document by the time anything is visible. */
function getServerSnapshot() {
  return false;
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setTheme(next: "light" | "dark") {
  document.documentElement.dataset.theme = next;
  try {
    window.localStorage.setItem(THEME_KEY, next);
  } catch {
    /* A browser with storage switched off still gets the theme, just not the memory of it. */
  }
}

export default function ThemeToggle({ className }: { className?: string }) {
  const dark = useTheme();

  return (
    <button
      type="button"
      className={className ? `theme-toggle ${className}` : "theme-toggle"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-pressed={dark}
      aria-label={dark ? "Switch to the light theme" : "Switch to the dark theme"}
    >
      <span aria-hidden="true" className="theme-toggle-mark" data-dark={dark ? "true" : "false"} />
      <span suppressHydrationWarning>{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

/**
 * The script that runs before first paint.
 *
 * Kept as a string so it can be inlined in the layout. It reads the stored
 * choice, falls back to the system preference, and writes the attribute the
 * stylesheet is keyed on.
 */
export const themeBootstrap = `(function(){try{var k=${JSON.stringify(THEME_KEY)};var s=localStorage.getItem(k);var m=window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.dataset.theme=s||(m?"dark":"light");}catch(e){document.documentElement.dataset.theme="light";}})();`;
