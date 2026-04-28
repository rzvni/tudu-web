"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Todo } from "@/lib/api";
import { searchTodos } from "@/lib/search";
import { formatDue, isOverdue } from "@/lib/dueParser";

const MAX_INLINE = 6;

export function SearchModal({
  open,
  onClose,
  todos,
}: {
  open: boolean;
  onClose: () => void;
  todos: Todo[];
}) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => searchTodos(todos, query), [todos, query]);
  const inline = results.slice(0, MAX_INLINE);

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

  function gotoFullscreen(q: string) {
    if (!q.trim()) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      gotoFullscreen(query);
    } else if (e.key === "ArrowDown") {
      if (inline.length === 0) return;
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, inline.length - 1));
    } else if (e.key === "ArrowUp") {
      if (inline.length === 0) return;
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
          placeholder="Suchen — Kunde, Person, Task"
          className="sl-input"
          autoComplete="off"
          spellCheck={false}
        />

        {query.trim() && inline.length === 0 ? (
          <p className="sl-empty-line">Keine Treffer</p>
        ) : null}

        {inline.length > 0 ? (
          <ul className="sl-suggestions">
            {inline.map((t, i) => (
              <li
                key={t.id}
                className={`sl-suggestion sl-result ${i === highlighted ? "is-active" : ""}`}
                onMouseEnter={() => setHighlighted(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  gotoFullscreen(query);
                }}
              >
                <div className="sl-result-main">
                  <span className={`sl-result-title ${t.done ? "is-done" : ""}`}>{t.title}</span>
                  <div className="sl-result-meta">
                    {t.subcategory ? <span className="sl-result-customer">{t.subcategory}</span> : null}
                    {t.people.map((p) => (
                      <span key={p} className="sl-result-person">{p}</span>
                    ))}
                    {t.dueDate && !t.done && isOverdue(new Date(t.dueDate)) ? (
                      <span className="sl-result-overdue">Überfällig</span>
                    ) : null}
                    {t.dueDate ? <span className="sl-result-date">{formatDue(new Date(t.dueDate))}</span> : null}
                  </div>
                </div>
              </li>
            ))}
            {results.length > MAX_INLINE ? (
              <li className="sl-more">
                +{results.length - MAX_INLINE} weitere — Enter für Vollbild
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="sl-hint">
          <span>Enter · Vollbild</span>
          <span>Esc · schließen</span>
        </div>
      </div>
    </div>
  );
}
