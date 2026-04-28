"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createTodoAction } from "./actions";
import { formatDue, parseDueText, toDateInputValue } from "@/lib/dueParser";
import { CalendarIcon, CloseIcon } from "./icons";

type Stage = "customer" | "task";

export function SpotlightModal({
  open,
  onClose,
  customers,
  people,
}: {
  open: boolean;
  onClose: () => void;
  customers: string[];
  people: string[];
}) {
  const [stage, setStage] = useState<Stage>("customer");
  const [customer, setCustomer] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const [title, setTitle] = useState("");
  const [taskPeople, setTaskPeople] = useState<string[]>([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(0);
  const [mentionHighlighted, setMentionHighlighted] = useState(0);

  const [dueText, setDueText] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [pending, startTransition] = useTransition();

  const customerInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dueInputRef = useRef<HTMLInputElement>(null);
  const dateNativeRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = useMemo(() => {
    const q = customer.trim().toLowerCase();
    if (!q) return [];
    return customers.filter((c) => c.toLowerCase().includes(q));
  }, [customer, customers]);

  const filteredPeople = useMemo(() => {
    const q = mentionQuery.trim().toLowerCase();
    if (!q) return people.filter((p) => !taskPeople.includes(p));
    return people.filter((p) => p.toLowerCase().includes(q) && !taskPeople.includes(p));
  }, [mentionQuery, people, taskPeople]);

  function reset() {
    setStage("customer");
    setCustomer("");
    setHighlighted(0);
    setTitle("");
    setTaskPeople([]);
    setMentionOpen(false);
    setMentionQuery("");
    setMentionStart(0);
    setMentionHighlighted(0);
    setDueText("");
    setDueDate(null);
  }

  useEffect(() => {
    if (open) {
      reset();
      requestAnimationFrame(() => customerInputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !mentionOpen) {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, mentionOpen]);

  function commitCustomer(value?: string) {
    const v = (value ?? customer).trim();
    setCustomer(v);
    setStage("task");
    requestAnimationFrame(() => titleInputRef.current?.focus());
  }

  function onCustomerKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (filteredCustomers.length === 0) return;
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filteredCustomers.length - 1));
    } else if (e.key === "ArrowUp") {
      if (filteredCustomers.length === 0) return;
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const pick = filteredCustomers[highlighted];
      commitCustomer(pick ?? customer);
    } else if (e.key === "Backspace" && customer === "") {
      onClose();
    }
  }

  function onTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const pos = e.target.selectionStart ?? value.length;
    setTitle(value);
    detectMention(value, pos);
  }

  function detectMention(value: string, pos: number) {
    let i = pos - 1;
    while (i >= 0) {
      const ch = value[i];
      if (ch === "\n") {
        setMentionOpen(false);
        return;
      }
      if (ch === "@") {
        const before = i === 0 ? "" : value[i - 1];
        if (before === "" || before === " " || before === "\n") {
          const query = value.slice(i + 1, pos);
          if (query.length > 50) {
            setMentionOpen(false);
            return;
          }
          setMentionStart(i);
          setMentionQuery(query);
          setMentionOpen(true);
          setMentionHighlighted(0);
          return;
        }
        setMentionOpen(false);
        return;
      }
      i--;
    }
    setMentionOpen(false);
  }

  function pickMention(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const before = title.slice(0, mentionStart);
    const after = title.slice(mentionStart + 1 + mentionQuery.length);
    const newTitle = before + trimmed + after;
    setTitle(newTitle);
    setTaskPeople((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setMentionOpen(false);
    setMentionQuery("");
    requestAnimationFrame(() => {
      const el = titleInputRef.current;
      if (!el) return;
      el.focus();
      const cursor = before.length + trimmed.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function removePerson(name: string) {
    setTaskPeople((prev) => prev.filter((p) => p !== name));
  }

  function filteredPeopleWithNew(): string[] {
    const q = mentionQuery.trim();
    const exact = filteredPeople.find((p) => p.toLowerCase() === q.toLowerCase());
    if (q && !exact) return [...filteredPeople, q];
    return filteredPeople;
  }

  function onTitleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mentionOpen) {
      const opts = filteredPeopleWithNew();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionHighlighted((h) => Math.min(h + 1, opts.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionHighlighted((h) => Math.max(h - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const pick = opts[mentionHighlighted];
        if (pick) pickMention(pick);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMentionOpen(false);
        return;
      }
    }
    if (e.key === "Enter" && !mentionOpen) {
      e.preventDefault();
      submit();
      return;
    }
    if (e.key === "Backspace" && title === "") {
      e.preventDefault();
      setStage("customer");
      requestAnimationFrame(() => customerInputRef.current?.focus());
    }
  }

  function onDueChange(text: string) {
    setDueText(text);
    setDueDate(parseDueText(text));
  }

  function onDueKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  }

  function onNativeDateChange(value: string) {
    if (!value) {
      setDueDate(null);
      setDueText("");
      return;
    }
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    setDueDate(date);
    setDueText(formatDue(date));
  }

  function clearDue() {
    setDueDate(null);
    setDueText("");
    requestAnimationFrame(() => dueInputRef.current?.focus());
  }

  function submit() {
    if (!title.trim()) return;
    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("subcategory", customer.trim());
    formData.set("people", JSON.stringify(taskPeople));
    formData.set("dueDate", dueDate ? dueDate.toISOString() : "");
    startTransition(async () => {
      await createTodoAction(formData);
      onClose();
    });
  }

  if (!open) return null;

  const mentionOpts = filteredPeopleWithNew();

  return (
    <div
      className="sl-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sl-modal" role="dialog" aria-modal="true">
        {customer && stage === "task" ? (
          <button
            type="button"
            className="sl-pill"
            onClick={() => {
              setStage("customer");
              requestAnimationFrame(() => customerInputRef.current?.focus());
            }}
          >
            {customer}
          </button>
        ) : null}

        {stage === "customer" ? (
          <>
            <input
              ref={customerInputRef}
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                setHighlighted(0);
              }}
              onKeyDown={onCustomerKey}
              placeholder="Kunde"
              className="sl-input"
              autoComplete="off"
              spellCheck={false}
            />
            {filteredCustomers.length > 0 ? (
              <ul className="sl-suggestions">
                {filteredCustomers.map((c, i) => (
                  <li
                    key={c}
                    className={`sl-suggestion ${i === highlighted ? "is-active" : ""}`}
                    onMouseEnter={() => setHighlighted(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commitCustomer(c);
                    }}
                  >
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <>
            <input
              ref={titleInputRef}
              value={title}
              onChange={onTitleChange}
              onKeyDown={onTitleKey}
              onSelect={(e) => {
                const t = e.currentTarget;
                detectMention(t.value, t.selectionStart ?? t.value.length);
              }}
              placeholder="Was steht an? @ für Personen"
              className="sl-input"
              autoComplete="off"
              spellCheck={false}
            />
            {taskPeople.length > 0 ? (
              <div className="sl-people">
                {taskPeople.map((p) => (
                  <span key={p} className="sl-chip">
                    {p}
                    <button
                      type="button"
                      onClick={() => removePerson(p)}
                      aria-label={`${p} entfernen`}
                      className="sl-chip-x"
                    >
                      <CloseIcon size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="sl-due-row">
              <input
                ref={dueInputRef}
                value={dueText}
                onChange={(e) => onDueChange(e.target.value)}
                onKeyDown={onDueKey}
                placeholder="Frist · heute, morgen, diese woche, …"
                className="sl-due-input"
                autoComplete="off"
                spellCheck={false}
              />
              {dueDate ? (
                <span className="sl-due-resolved">
                  → {formatDue(dueDate)}
                  <button
                    type="button"
                    onClick={clearDue}
                    aria-label="Frist entfernen"
                    className="sl-chip-x"
                  >
                    <CloseIcon size={12} />
                  </button>
                </span>
              ) : null}
              <input
                ref={dateNativeRef}
                type="date"
                className="sl-date-native"
                value={dueDate ? toDateInputValue(dueDate) : ""}
                onChange={(e) => onNativeDateChange(e.target.value)}
                tabIndex={-1}
              />
              <button
                type="button"
                onClick={() => {
                  const el = dateNativeRef.current;
                  if (!el) return;
                  if (typeof el.showPicker === "function") el.showPicker();
                  else el.focus();
                }}
                className="sl-cal-icon"
                aria-label="Datum auswählen"
              >
                <CalendarIcon size={14} />
              </button>
            </div>

            {mentionOpen && mentionOpts.length > 0 ? (
              <ul className="sl-suggestions">
                {mentionOpts.map((p, i) => {
                  const isNew = !people.includes(p);
                  return (
                    <li
                      key={p}
                      className={`sl-suggestion ${i === mentionHighlighted ? "is-active" : ""}`}
                      onMouseEnter={() => setMentionHighlighted(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickMention(p);
                      }}
                    >
                      <span>{p}</span>
                      {isNew ? <span className="sl-new">neu</span> : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </>
        )}

        <div className="sl-hint">
          {stage === "customer" ? (
            <>
              <span>Enter weiter</span>
              <span>Esc schließen</span>
            </>
          ) : (
            <>
              <span>{pending ? "speichert…" : "Enter speichern"}</span>
              <span>Backspace zurück</span>
              <span>Esc schließen</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

