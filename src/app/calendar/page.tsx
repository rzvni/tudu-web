import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/session";
import { listWorkTodos, type Todo } from "@/lib/api";
import {
  WEEKDAY_HEADERS,
  buildMonthGrid,
  formatDayTitle,
  formatMonthTitle,
  isoDay,
  isoMonth,
  parseDayParam,
  parseMonthParam,
  sameDay,
  sameMonth,
  shiftMonth,
} from "@/lib/calendar";
import { AppShell } from "../AppShell";
import { SettingsMenu } from "../SettingsMenu";
import { TaskRow } from "../TaskRow";
import { ArrowLeft, ChevronLeft, ChevronRight } from "../icons";
import "../spotlight.css";

export const dynamic = "force-dynamic";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/login");
  const { month: monthParam, day: dayParam } = await searchParams;

  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const monthStart =
    parseMonthParam(monthParam) ?? new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0);

  const parsedDay = parseDayParam(dayParam);
  const selectedDay =
    parsedDay && sameMonth(parsedDay, monthStart)
      ? parsedDay
      : sameMonth(monthStart, today)
      ? today
      : null;

  const todos = await listWorkTodos();
  const todosByDay = new Map<string, Todo[]>();
  for (const t of todos) {
    if (!t.dueDate) continue;
    const key = isoDay(new Date(t.dueDate));
    if (!todosByDay.has(key)) todosByDay.set(key, []);
    todosByDay.get(key)!.push(t);
  }

  const customers = Array.from(
    new Set(todos.flatMap((t) => (t.subcategory ? [t.subcategory] : []))),
  ).sort((a, b) => a.localeCompare(b));
  const people = Array.from(new Set(todos.flatMap((t) => t.people))).sort((a, b) =>
    a.localeCompare(b),
  );

  const cells = buildMonthGrid(monthStart);
  const selectedKey = selectedDay ? isoDay(selectedDay) : null;
  const dayTodos = selectedKey ? todosByDay.get(selectedKey) ?? [] : [];
  const openDayTodos = dayTodos.filter((t) => !t.done);
  const doneDayTodos = dayTodos.filter((t) => t.done);

  const prev = isoMonth(shiftMonth(monthStart, -1));
  const next = isoMonth(shiftMonth(monthStart, 1));
  const monthParamCur = isoMonth(monthStart);

  function dayHref(d: Date): string {
    return `/calendar?month=${monthParamCur}&day=${isoDay(d)}`;
  }

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

        <div className="cal-head">
          <Link href={`/calendar?month=${prev}`} className="cal-nav" aria-label="Vormonat" scroll={false}>
            <ChevronLeft size={18} />
          </Link>
          <h1 className="cal-title">{formatMonthTitle(monthStart)}</h1>
          <Link href={`/calendar?month=${next}`} className="cal-nav" aria-label="Nächster Monat" scroll={false}>
            <ChevronRight size={18} />
          </Link>
        </div>

        <div className="cal-weekdays">
          {WEEKDAY_HEADERS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((c) => {
            const key = isoDay(c);
            const tasks = todosByDay.get(key) ?? [];
            const isToday = sameDay(c, today);
            const isOther = !sameMonth(c, monthStart);
            const isSelected = selectedDay ? sameDay(c, selectedDay) : false;
            const cls = [
              "cal-cell",
              isToday ? "is-today" : "",
              isOther ? "is-other" : "",
              isSelected ? "is-selected" : "",
            ]
              .filter(Boolean)
              .join(" ");
            const openCount = tasks.filter((t) => !t.done).length;
            const doneCount = tasks.length - openCount;
            return (
              <Link key={key} href={dayHref(c)} className={cls} scroll={false}>
                <span className="cal-num">{c.getDate()}</span>
                {tasks.length > 0 ? (
                  <span className="cal-dots" aria-label={`${tasks.length} Tasks`}>
                    {Array.from({ length: Math.min(openCount, 3) }).map((_, i) => (
                      <span key={`o${i}`} className="cal-dot" />
                    ))}
                    {Array.from({ length: Math.min(doneCount, Math.max(0, 3 - openCount)) }).map(
                      (_, i) => (
                        <span key={`d${i}`} className="cal-dot is-done" />
                      ),
                    )}
                    {tasks.length > 3 ? <span className="cal-dot-more">+</span> : null}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {selectedDay ? (
          <section className="cal-day">
            <h2 className="cal-day-title">{formatDayTitle(selectedDay)}</h2>
            {dayTodos.length === 0 ? (
              <p className="empty">Keine Tasks.</p>
            ) : (
              <>
                {openDayTodos.length > 0 ? (
                  <ul className="list">
                    {openDayTodos.map((t) => (
                      <TaskRow key={t.id} t={t} />
                    ))}
                  </ul>
                ) : null}
                {doneDayTodos.length > 0 ? (
                  <details className="done-section" open={openDayTodos.length === 0}>
                    <summary>Erledigt ({doneDayTodos.length})</summary>
                    <ul className="list">
                      {doneDayTodos.map((t) => (
                        <TaskRow key={t.id} t={t} />
                      ))}
                    </ul>
                  </details>
                ) : null}
              </>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
