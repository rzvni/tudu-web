"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Command = {
  id: string;
  label: string;
  description?: string;
  action: () => void;
};

export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function exec(cmd: Command) {
    onClose();
    requestAnimationFrame(cmd.action);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[highlighted];
      if (cmd) exec(cmd);
    } else if (e.key === "ArrowDown") {
      if (filtered.length === 0) return;
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      if (filtered.length === 0) return;
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    }
  }

  if (!open) return null;

  return (
    <div
      className="sl-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sl-modal" role="dialog" aria-modal="true">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
          }}
          onKeyDown={onKey}
          placeholder="Befehl…"
          className="sl-input"
          autoComplete="off"
          spellCheck={false}
        />
        <ul className="sl-suggestions">
          {filtered.length === 0 ? (
            <li className="sl-empty-line">Kein Befehl</li>
          ) : (
            filtered.map((cmd, i) => (
              <li
                key={cmd.id}
                className={`sl-suggestion ${i === highlighted ? "is-active" : ""}`}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  exec(cmd);
                }}
              >
                <span>{cmd.label}</span>
                {cmd.description ? <span className="sl-cmd-desc">{cmd.description}</span> : null}
              </li>
            ))
          )}
        </ul>
        <div className="sl-hint">
          <span>Enter · ausführen</span>
          <span>Esc · schließen</span>
        </div>
      </div>
    </div>
  );
}
