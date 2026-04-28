import { formatDue, isOverdue } from "@/lib/dueParser";
import type { Todo } from "@/lib/api";
import { toggleDoneAction } from "./actions";

export function TaskRow({ t }: { t: Todo }) {
  return (
    <li className={`item ${t.done ? "item-done" : ""}`}>
      <form action={toggleDoneAction} className="toggle">
        <input type="hidden" name="id" value={t.id} />
        <input type="hidden" name="done" value={String(t.done)} />
        <button
          type="submit"
          aria-label={t.done ? "wiederherstellen" : "erledigt"}
          className="check"
        >
          {t.done ? "●" : "○"}
        </button>
      </form>
      <div className="item-body">
        <span className="item-title">{t.title}</span>
        <TaskMeta t={t} />
      </div>
    </li>
  );
}

export function TaskMeta({ t }: { t: Todo }) {
  if (!t.subcategory && t.people.length === 0 && !t.dueDate) return null;
  const overdue = t.dueDate && !t.done && isOverdue(new Date(t.dueDate));
  return (
    <span className="item-meta">
      {t.subcategory ? <span className="meta-customer">{t.subcategory}</span> : null}
      {t.people.map((p) => (
        <span key={p} className="meta-person">
          {p}
        </span>
      ))}
      {overdue ? <span className="meta-overdue">Überfällig</span> : null}
      {t.dueDate ? (
        <span className={`meta-date ${overdue ? "is-overdue" : ""}`}>
          {formatDue(new Date(t.dueDate))}
        </span>
      ) : null}
    </span>
  );
}
