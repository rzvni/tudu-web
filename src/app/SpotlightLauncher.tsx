"use client";

import { useCallback, useEffect, useState } from "react";
import { SpotlightModal } from "./SpotlightModal";

export function SpotlightLauncher({
  customers,
  people,
}: {
  customers: string[];
  people: string[];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
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
        className="launcher"
        aria-label="Neuer Task"
      >
        <span>Neuer Task</span>
        <kbd className="launcher-kbd">⌘K</kbd>
      </button>
      <SpotlightModal
        open={open}
        onClose={close}
        customers={customers}
        people={people}
      />
    </>
  );
}
