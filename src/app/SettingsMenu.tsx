"use client";

import { useEffect, useRef, useState } from "react";
import { logoutAction } from "./actions";

const STORAGE_KEY = "tudu-show-shortcuts";

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "0") setShowShortcuts(false);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, showShortcuts ? "1" : "0");
    document.body.classList.toggle("shortcuts-hidden", !showShortcuts);
  }, [showShortcuts, hydrated]);

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
            role="menuitem"
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

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
