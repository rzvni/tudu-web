"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Todo } from "@/lib/api";
import { formatDue, formatDueDetail, parseDueText, toDateInputValue } from "@/lib/dueParser";
import { deleteTodoAction, toggleFlagAction, updateTodoAction } from "./actions";
import { CalendarIcon, CheckIcon, CloseIcon, Flag, Pencil, Trash } from "./icons";

export function TaskDetailModal({
  todo,
  open,
  onClose,
  customers,
  people,
}: {
  todo: Todo | null;
  open: boolean;
  onClose: () => void;
  customers: string[];
  people: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [customer, setCustomer] = useState("");
  const [customerHl, setCustomerHl] = useState(0);
  const [taskPeople, setTaskPeople] = useState<string[]>([]);
  const [personDraft, setPersonDraft] = useState("");
  const [personHl, setPersonHl] = useState(0);
  const [notes, setNotes] = useState("");
  const [dueText, setDueText] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const dateNativeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && todo) {
      setEditing(false);
      setConfirmDelete(false);
      setTitle(todo.title);
      setCustomer(todo.subcategory ?? "");
      setTaskPeople(todo.people);
      setPersonDraft("");
      setNotes(todo.notes ?? "");
      if (todo.dueDate) {
        const d = new Date(todo.dueDate);
        setDueDate(d);
        setDueText(formatDue(d));
      } else {
        setDueDate(null);
        setDueText("");
      }
    }
  }, [open, todo?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (confirmDelete) {
          setConfirmDelete(false);
        } else if (editing) {
          setEditing(false);
        } else {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, editing, confirmDelete, onClose]);

  const filteredCustomers = useMemo(() => {
    const q = customer.trim().toLowerCase();
    if (!q) return [];
    return customers.filter((c) => c.toLowerCase().includes(q) && c !== customer.trim()).slice(0, 5);
  }, [customer, customers]);

  const filteredPeople = useMemo(() => {
    const q = personDraft.trim().toLowerCase();
    if (!q) return [];
    return people
      .filter((p) => p.toLowerCase().includes(q) && !taskPeople.includes(p))
      .slice(0, 5);
  }, [personDraft, people, taskPeople]);

  if (!open || !todo) return null;

  function commitPerson(name?: string) {
    const v = (name ?? personDraft).trim();
    if (!v) return;
    setTaskPeople((prev) => (prev.includes(v) ? prev : [...prev, v]));
    setPersonDraft("");
    setPersonHl(0);
  }

  function removePerson(name: string) {
    setTaskPeople((prev) => prev.filter((p) => p !== name));
  }

  function onDueChange(s: string) {
    setDueText(s);
    setDueDate(parseDueText(s));
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

  function save() {
    if (!todo || !title.trim()) return;
    const fd = new FormData();
    fd.set("id", todo.id);
    fd.set("title", title.trim());
    fd.set("subcategory", customer.trim());
    fd.set("people", JSON.stringify(taskPeople));
    fd.set("notes", notes);
    fd.set("dueDate", dueDate ? dueDate.toISOString() : "");
    startTransition(async () => {
      await updateTodoAction(fd);
      setEditing(false);
      onClose();
    });
  }

  function executeDelete() {
    if (!todo) return;
    const fd = new FormData();
    fd.set("id", todo.id);
    startTransition(async () => {
      await deleteTodoAction(fd);
      setConfirmDelete(false);
      setEditing(false);
      onClose();
    });
  }

  function toggleFlag() {
    if (!todo) return;
    const fd = new FormData();
    fd.set("id", todo.id);
    fd.set("flagged", String(todo.flagged));
    startTransition(async () => {
      await toggleFlagAction(fd);
    });
  }

  return (
    <div
      className="sl-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sl-modal task-detail" role="dialog" aria-modal="true">
        <header className="td-head">
          <div className="td-title-wrap">
            {editing ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    save();
                  }
                }}
                className="td-title-input"
                autoFocus
                spellCheck={false}
              />
            ) : (
              <h2 className={`td-title ${todo.done ? "is-done" : ""}`}>{todo.title}</h2>
            )}
            {todo.done && !editing ? (
              <span className="td-done-tag">
                <CheckIcon size={12} /> Erledigt
              </span>
            ) : null}
          </div>
          <div className="td-actions">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="td-btn-icon"
                  aria-label="Abbrechen"
                  disabled={pending}
                >
                  <CloseIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="td-btn-primary"
                  disabled={pending || !title.trim()}
                >
                  {pending ? "…" : "Speichern"}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={toggleFlag}
                  className={`td-btn-icon ${todo.flagged ? "is-flagged" : ""}`}
                  aria-label={todo.flagged ? "Flagge entfernen" : "Flaggen"}
                  aria-pressed={todo.flagged}
                  disabled={pending}
                >
                  <Flag size={16} filled={todo.flagged} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    requestAnimationFrame(() => titleRef.current?.focus());
                  }}
                  className="td-btn-icon"
                  aria-label="Bearbeiten"
                >
                  <Pencil size={16} />
                </button>
              </>
            )}
          </div>
        </header>

        {editing ? (
          <div className="td-edit">
            <div className="td-row">
              <span className="td-label">Kunde</span>
              <div className="td-field">
                <input
                  value={customer}
                  onChange={(e) => {
                    setCustomer(e.target.value);
                    setCustomerHl(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && filteredCustomers.length > 0) {
                      e.preventDefault();
                      setCustomer(filteredCustomers[customerHl]);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCustomerHl((h) => Math.min(h + 1, filteredCustomers.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCustomerHl((h) => Math.max(h - 1, 0));
                    }
                  }}
                  className="td-input"
                  placeholder="—"
                  spellCheck={false}
                />
                {filteredCustomers.length > 0 ? (
                  <ul className="td-suggest">
                    {filteredCustomers.map((c, i) => (
                      <li
                        key={c}
                        className={`td-suggest-item ${i === customerHl ? "is-active" : ""}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setCustomer(c);
                        }}
                        onMouseEnter={() => setCustomerHl(i)}
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <div className="td-row">
              <span className="td-label">Personen</span>
              <div className="td-field">
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
                <input
                  value={personDraft}
                  onChange={(e) => {
                    setPersonDraft(e.target.value);
                    setPersonHl(0);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const opt = filteredPeople[personHl];
                      commitPerson(opt ?? personDraft);
                    } else if (e.key === "ArrowDown") {
                      if (filteredPeople.length === 0) return;
                      e.preventDefault();
                      setPersonHl((h) => Math.min(h + 1, filteredPeople.length - 1));
                    } else if (e.key === "ArrowUp") {
                      if (filteredPeople.length === 0) return;
                      e.preventDefault();
                      setPersonHl((h) => Math.max(h - 1, 0));
                    }
                  }}
                  className="td-input"
                  placeholder="Person hinzufügen — Enter"
                  spellCheck={false}
                />
                {filteredPeople.length > 0 ? (
                  <ul className="td-suggest">
                    {filteredPeople.map((p, i) => (
                      <li
                        key={p}
                        className={`td-suggest-item ${i === personHl ? "is-active" : ""}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          commitPerson(p);
                        }}
                        onMouseEnter={() => setPersonHl(i)}
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <div className="td-row">
              <span className="td-label">Frist</span>
              <div className="td-field td-due">
                <input
                  value={dueText}
                  onChange={(e) => onDueChange(e.target.value)}
                  className="td-input"
                  placeholder="heute, morgen, …"
                  spellCheck={false}
                />
                {dueDate ? (
                  <span className="sl-due-resolved">
                    → {formatDue(dueDate)}
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate(null);
                        setDueText("");
                      }}
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
            </div>

            <div className="td-row td-row-notes">
              <span className="td-label">Notiz</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="td-textarea"
                placeholder="—"
                rows={4}
              />
            </div>

            <div className="td-edit-foot">
              {confirmDelete ? (
                <div className="td-confirm">
                  <span>Wirklich löschen?</span>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="td-btn-icon"
                    disabled={pending}
                  >
                    <CloseIcon size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={executeDelete}
                    className="td-btn-danger"
                    disabled={pending}
                  >
                    {pending ? "…" : "Löschen"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="td-btn-ghost-danger"
                  disabled={pending}
                >
                  <Trash size={14} /> Löschen
                </button>
              )}
              <span className="sl-hint td-hint-inline">
                <span>{pending ? "speichert…" : "⌘ Enter speichern"}</span>
                <span>Esc abbrechen</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="td-view">
            {todo.subcategory || todo.people.length > 0 ? (
              <div className="td-meta">
                {todo.subcategory ? (
                  <span className="meta-customer">{todo.subcategory}</span>
                ) : null}
                {todo.people.map((p) => (
                  <span key={p} className="meta-person">
                    {p}
                  </span>
                ))}
              </div>
            ) : null}

            {todo.dueDate ? (
              <div className="td-due-row">
                <CalendarIcon size={14} className="td-due-icon" />
                <span className="td-due-text">{formatDueDetail(new Date(todo.dueDate))}</span>
              </div>
            ) : null}

            {todo.notes ? <div className="td-notes">{todo.notes}</div> : null}

            <div className="td-stamps">
              <span>
                Erstellt{" "}
                {new Date(todo.createdAt).toLocaleString("de-DE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              {todo.doneAt ? (
                <span>
                  Erledigt{" "}
                  {new Date(todo.doneAt).toLocaleString("de-DE", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
