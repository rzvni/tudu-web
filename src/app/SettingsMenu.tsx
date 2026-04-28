"use client";

import { useEffect, useRef, useState } from "react";
import { logoutAction } from "./actions";
import { GearIcon } from "./icons";

const KEY_SHORTCUTS = "tudu-show-shortcuts";
const KEY_THEME = "tudu-theme";

type Theme = "light" | "dark";

function detectInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(KEY_THEME);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");
  const [hydrated, setHydrated] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(KEY_SHORTCUTS);
    if (stored === "0") setShowShortcuts(false);
    setTheme(detectInitialTheme());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_SHORTCUTS, showShortcuts ? "1" : "0");
    document.documentElement.classList.toggle("shortcuts-hidden", !showShortcuts);
  }, [showShortcuts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY_THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="settings-wrap" ref={wrapRef}>
      <button
        type="button"
        className="settings-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Einstellungen"
        aria-expanded={open}
      >
        <GearIcon />
      </button>
      {open ? (
        <div className="settings-menu" role="menu">
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={theme === "dark"}
            className="settings-item"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          >
            <span>Dark Mode</span>
            <span className={`settings-toggle ${theme === "dark" ? "is-on" : ""}`} aria-hidden="true">
              <span className="settings-toggle-knob" />
            </span>
          </button>
          <button
            type="button"
            role="menuitemcheckbox"
            aria-checked={showShortcuts}
            className="settings-item"
            onClick={() => setShowShortcuts((s) => !s)}
          >
            <span>Shortcuts</span>
            <span className={`settings-toggle ${showShortcuts ? "is-on" : ""}`} aria-hidden="true">
              <span className="settings-toggle-knob" />
            </span>
          </button>
          <div className="settings-divider" />
          <form action={logoutAction}>
            <button type="submit" role="menuitem" className="settings-item settings-item-danger">
              Logout
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

