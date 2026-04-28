"use client";

import { useCallback, useEffect, useState } from "react";
import { SpotlightModal } from "./SpotlightModal";
import { SearchModal } from "./SearchModal";
import { CommandPalette, type Command } from "./CommandPalette";
import { HideOverlay } from "./HideOverlay";
import type { Todo } from "@/lib/api";

const CHORD_TIMEOUT_MS = 1500;

export function AppShell({
  todos,
  customers,
  people,
}: {
  todos: Todo[];
  customers: string[];
  people: string[];
}) {
  const [spotlight, setSpotlight] = useState(false);
  const [search, setSearch] = useState(false);
  const [palette, setPalette] = useState(false);
  const [hide, setHide] = useState(false);
  const [chord, setChord] = useState(false);

  const closeSpotlight = useCallback(() => setSpotlight(false), []);
  const closeSearch = useCallback(() => setSearch(false), []);
  const closePalette = useCallback(() => setPalette(false), []);
  const exitHide = useCallback(() => setHide(false), []);

  useEffect(() => {
    if (!chord) return;
    const t = setTimeout(() => setChord(false), CHORD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [chord]);

  useEffect(() => {
    function isInputFocused() {
      const a = document.activeElement as HTMLElement | null;
      if (!a) return false;
      const tag = a.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || a.isContentEditable;
    }

    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const cmd = isMac ? e.metaKey : e.ctrlKey;

      if (chord) {
        if (e.key === "Escape") {
          e.preventDefault();
          setChord(false);
          return;
        }
        const k = e.key.toLowerCase();
        if (["s", "o", "p", "h", "k", "n"].includes(k)) {
          e.preventDefault();
          setChord(false);
          if (k === "k" || k === "n") setSpotlight(true);
          else if (k === "s" || k === "o") setSearch(true);
          else if (k === "p") setPalette(true);
          else if (k === "h") setHide(true);
          return;
        }
        // any other key cancels chord
        setChord(false);
        return;
      }

      if (e.key === "Escape") {
        if (spotlight || search || palette) return;
        if (hide) {
          e.preventDefault();
          setHide(false);
        }
        return;
      }

      if (cmd && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpotlight(true);
        return;
      }

      if (
        e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === "a" &&
        !isInputFocused()
      ) {
        e.preventDefault();
        setChord(true);
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chord, hide, spotlight, search, palette]);

  const commands: Command[] = [
    { id: "hide", label: "Hide", description: "Bildschirm verstecken", action: () => setHide(true) },
    { id: "search", label: "Suchen", description: "Tasks finden", action: () => setSearch(true) },
    { id: "new", label: "Neuer Task", description: "Schnellerfassung öffnen", action: () => setSpotlight(true) },
  ];

  return (
    <>
      <div className="launcher-row">
        <button
          type="button"
          onClick={() => setSpotlight(true)}
          className="launcher"
          aria-label="Neuer Task"
        >
          <span>Neuer Task</span>
          <kbd className="launcher-kbd">⌘K</kbd>
        </button>
        <button
          type="button"
          onClick={() => setSearch(true)}
          className="launcher launcher-secondary"
          aria-label="Suche"
        >
          <span>Suchen</span>
          <kbd className="launcher-kbd">⌃A · S</kbd>
        </button>
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="launcher launcher-secondary"
          aria-label="Befehle"
        >
          <span>Befehle</span>
          <kbd className="launcher-kbd">⌃A · P</kbd>
        </button>
      </div>

      {chord ? <ChordHint /> : null}

      <SpotlightModal
        open={spotlight}
        onClose={closeSpotlight}
        customers={customers}
        people={people}
      />
      <SearchModal open={search} onClose={closeSearch} todos={todos} />
      <CommandPalette open={palette} onClose={closePalette} commands={commands} />
      {hide ? <HideOverlay /> : null}
    </>
  );
}

function ChordHint() {
  return (
    <div className="chord-hint" role="status" aria-live="polite">
      <kbd>⌃A</kbd>
      <span className="chord-arrow">→</span>
      <span className="chord-options">
        <span><kbd>S</kbd>Suchen</span>
        <span><kbd>P</kbd>Befehle</span>
        <span><kbd>H</kbd>Hide</span>
        <span><kbd>K</kbd>Neu</span>
      </span>
    </div>
  );
}
