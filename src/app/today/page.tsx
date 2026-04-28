import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos } from "@/lib/api";
import { sameDay } from "@/lib/calendar";
import { formatDueLong } from "@/lib/dueParser";
import { AppShell } from "../AppShell";
import { SettingsMenu } from "../SettingsMenu";
import { TaskRow } from "../TaskRow";
import { ArrowLeft } from "../icons";
import "../spotlight.css";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  if (!(await isAuthenticated())) redirect("/login");
  const todos = await listWorkTodos();
  const today = new Date();

  const todayTodos = todos.filter(
    (t) => t.dueDate && sameDay(new Date(t.dueDate), today),
  );
  const open = todayTodos.filter((t) => !t.done);
  const done = todayTodos.filter((t) => t.done);

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
          <Link href="/" className="back-link" aria-label="zurück">
            <ArrowLeft size={14} /> Zurück
          </Link>
          <SettingsMenu />
        </header>

        <AppShell todos={todos} customers={customers} people={people} />

        <div className="search-head">
          <h1 className="search-query">Heute</h1>
          <p className="search-count">{formatDueLong(today)}</p>
        </div>

        {todayTodos.length === 0 ? (
          <p className="empty">Nichts für heute.</p>
        ) : null}

        {open.length > 0 ? (
          <ul className="list">
            {open.map((t) => (
              <TaskRow key={t.id} t={t} />
            ))}
          </ul>
        ) : null}

        {done.length > 0 ? (
          <details className="done-section" open={open.length === 0}>
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
