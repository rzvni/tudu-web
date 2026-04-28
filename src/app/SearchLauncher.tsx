"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";
import type { Todo } from "@/lib/api";

export function SearchLauncher({ todos }: { todos: Todo[] }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="launcher launcher-secondary"
        aria-label="Suche"
      >
        <span>Suchen</span>
        <kbd className="launcher-kbd">⌘O</kbd>
      </button>
      <SearchModal open={open} onClose={close} todos={todos} />
    </>
  );
}
