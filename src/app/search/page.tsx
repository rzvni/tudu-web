import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos } from "@/lib/api";
import { searchTodos } from "@/lib/search";
import { AppShell } from "../AppShell";
import { SettingsMenu } from "../SettingsMenu";
import { TaskRow } from "../TaskRow";
import "../spotlight.css";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/login");
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const todos = await listWorkTodos();
  const results = query ? searchTodos(todos, query) : [];
  const openResults = results.filter((t) => !t.done);
  const doneResults = results.filter((t) => t.done);

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
            ← Zurück
          </Link>
          <SettingsMenu />
        </header>

        <AppShell todos={todos} customers={customers} people={people} />

        <div className="search-head">
          <h1 className="search-query">{query || "—"}</h1>
          <p className="search-count">
            {results.length === 0 ? "Keine Treffer" : `${results.length} Treffer`}
          </p>
        </div>

        {openResults.length > 0 ? (
          <ul className="list">
            {openResults.map((t) => (
              <TaskRow key={t.id} t={t} />
            ))}
          </ul>
        ) : null}

        {doneResults.length > 0 ? (
          <details className="done-section" open>
            <summary>Erledigt ({doneResults.length})</summary>
            <ul className="list">
              {doneResults.map((t) => (
                <TaskRow key={t.id} t={t} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </main>
  );
}
