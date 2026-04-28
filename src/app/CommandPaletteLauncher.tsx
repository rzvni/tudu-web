"use client";

import { useCallback, useEffect, useState } from "react";
import { CommandPalette, type Command } from "./CommandPalette";
import { HideOverlay } from "./HideOverlay";

export function CommandPaletteLauncher() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hideMode, setHideMode] = useState(false);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const exitHide = useCallback(() => setHideMode(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (hideMode) {
          setHideMode(false);
          return;
        }
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hideMode]);

  const commands: Command[] = [
    {
      id: "hide",
      label: "Hide",
      description: "Bildschirm verstecken",
      action: () => setHideMode(true),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="launcher launcher-secondary"
        aria-label="Befehle"
      >
        <span>Befehle</span>
        <kbd className="launcher-kbd">⌘P</kbd>
      </button>
      <CommandPalette open={paletteOpen} onClose={closePalette} commands={commands} />
      {hideMode ? <HideOverlay onExit={exitHide} /> : null}
    </>
  );
}
