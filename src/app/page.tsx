import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos } from "@/lib/api";
import { toggleDoneAction } from "./actions";
import { AppShell } from "./AppShell";
import { SettingsMenu } from "./SettingsMenu";
import { formatDue } from "@/lib/dueParser";
import "./spotlight.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isAuthenticated())) redirect("/login");

  const todos = await listWorkTodos();
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  const customers = Array.from(
    new Set(todos.flatMap((t) => (t.subcategory ? [t.subcategory] : []))),
  ).sort((a, b) => a.localeCompare(b));
  const people = Array.from(new Set(todos.flatMap((t) => t.people))).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <main className="shell">
      <div className="card card-wide">
        <header className="header">
          <h1 className="title">tasks</h1>
          <SettingsMenu />
        </header>

        <AppShell todos={todos} customers={customers} people={people} />

        <ul className="list">
          {open.length === 0 ? (
            <li className="empty">Keine offenen Tasks.</li>
          ) : (
            open.map((t) => (
              <li key={t.id} className="item">
                <form action={toggleDoneAction} className="toggle">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={String(t.done)} />
                  <button type="submit" aria-label="erledigt" className="check">○</button>
                </form>
                <div className="item-body">
                  <span className="item-title">{t.title}</span>
                  {t.subcategory || t.people.length > 0 || t.dueDate ? (
                    <span className="item-meta">
                      {t.subcategory ? <span className="meta-customer">{t.subcategory}</span> : null}
                      {t.people.map((p) => (
                        <span key={p} className="meta-person">{p}</span>
                      ))}
                      {t.dueDate ? <span className="meta-date">{formatDue(new Date(t.dueDate))}</span> : null}
                    </span>
                  ) : null}
                </div>
              </li>
            ))
          )}
        </ul>

        {done.length > 0 ? (
          <details className="done-section">
            <summary>Erledigt ({done.length})</summary>
            <ul className="list">
              {done.map((t) => (
                <li key={t.id} className="item item-done">
                  <form action={toggleDoneAction} className="toggle">
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value={String(t.done)} />
                    <button type="submit" aria-label="wiederherstellen" className="check">●</button>
                  </form>
                  <div className="item-body">
                    <span className="item-title">{t.title}</span>
                    {t.subcategory || t.people.length > 0 || t.dueDate ? (
                      <span className="item-meta">
                        {t.subcategory ? <span className="meta-customer">{t.subcategory}</span> : null}
                        {t.people.map((p) => (
                          <span key={p} className="meta-person">{p}</span>
                        ))}
                        {t.dueDate ? <span className="meta-date">{formatDue(new Date(t.dueDate))}</span> : null}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </main>
  );
}
