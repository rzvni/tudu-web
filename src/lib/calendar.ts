export function isoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isoMonth(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseMonthParam(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  if (mo < 0 || mo > 11) return null;
  return new Date(y, mo, 1, 12, 0, 0);
}

export function parseDayParam(s: string | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), 12, 0, 0);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function shiftMonth(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1, 12, 0, 0);
}

// Build 6×7 grid (42 cells), Monday-first, covering the month containing `monthStart`.
export function buildMonthGrid(monthStart: Date): Date[] {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1, 12, 0, 0);
  const dow = first.getDay(); // 0=Sun..6=Sat
  const offsetToMonday = (dow + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - offsetToMonday);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(12, 0, 0, 0);
    cells.push(d);
  }
  return cells;
}

const MONTH_LABELS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export function formatMonthTitle(d: Date): string {
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

const DAY_LABELS = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];

export function formatDayTitle(d: Date): string {
  return `${DAY_LABELS[d.getDay()]}, ${d.getDate()}. ${MONTH_LABELS[d.getMonth()]}`;
}

export const WEEKDAY_HEADERS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
