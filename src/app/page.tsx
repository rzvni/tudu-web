import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos } from "@/lib/api";
import { createTodoAction, logoutAction, toggleDoneAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!(await isAuthenticated())) redirect("/login");

  const todos = await listWorkTodos();
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <main className="shell">
      <div className="card card-wide">
        <header className="header">
          <h1 className="title">tudu · work</h1>
          <form action={logoutAction}>
            <button type="submit" className="linkbtn">Logout</button>
          </form>
        </header>

        <form action={createTodoAction} className="form">
          <input
            name="title"
            required
            maxLength={200}
            autoFocus
            placeholder="Was steht an?"
            className="input"
          />
          <button type="submit" className="btn">Add</button>
        </form>

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
                <span className="item-title">{t.title}</span>
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
                  <span className="item-title">{t.title}</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </main>
  );
}
