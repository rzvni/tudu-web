import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos } from "@/lib/api";
import { AppShell } from "./AppShell";
import { SettingsMenu } from "./SettingsMenu";
import { TaskRow } from "./TaskRow";
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
            open.map((t) => <TaskRow key={t.id} t={t} />)
          )}
        </ul>

        {done.length > 0 ? (
          <details className="done-section">
            <summary>Erledigt ({done.length})</summary>
            <ul className="list">
              {done.map((t) => (
                <TaskRow key={t.id} t={t} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </main>
  );
}
