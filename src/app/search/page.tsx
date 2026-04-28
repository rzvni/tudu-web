import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos } from "@/lib/api";
import { searchTodos } from "@/lib/search";
import { formatDue } from "@/lib/dueParser";
import { logoutAction, toggleDoneAction } from "../actions";
import { CommandPaletteLauncher } from "../CommandPaletteLauncher";

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
  const open = results.filter((t) => !t.done);
  const done = results.filter((t) => t.done);

  return (
    <main className="shell">
      <div className="card card-wide">
        <header className="header">
          <Link href="/" className="back-link" aria-label="zurück">
            ← Zurück
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="linkbtn">Logout</button>
          </form>
        </header>

        <CommandPaletteLauncher />

        <div className="search-head">
          <h1 className="search-query">{query || "—"}</h1>
          <p className="search-count">
            {results.length === 0
              ? "Keine Treffer"
              : `${results.length} ${results.length === 1 ? "Treffer" : "Treffer"}`}
          </p>
        </div>

        {open.length > 0 ? (
          <ul className="list">
            {open.map((t) => (
              <TodoRow key={t.id} t={t} />
            ))}
          </ul>
        ) : null}

        {done.length > 0 ? (
          <details className="done-section" open>
            <summary>Erledigt ({done.length})</summary>
            <ul className="list">
              {done.map((t) => (
                <TodoRow key={t.id} t={t} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </main>
  );
}

function TodoRow({ t }: { t: Awaited<ReturnType<typeof listWorkTodos>>[number] }) {
  return (
    <li className={`item ${t.done ? "item-done" : ""}`}>
      <form action={toggleDoneAction} className="toggle">
        <input type="hidden" name="id" value={t.id} />
        <input type="hidden" name="done" value={String(t.done)} />
        <button type="submit" aria-label={t.done ? "wiederherstellen" : "erledigt"} className="check">
          {t.done ? "●" : "○"}
        </button>
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
  );
}
