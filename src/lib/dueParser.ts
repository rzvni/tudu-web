export function parseDueText(s: string): Date | null {
  const t = s.trim().toLowerCase();
  if (!t) return null;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const day = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  if (t === "heute") return today;
  if (t === "morgen") return day(1);
  if (t === "übermorgen" || t === "uebermorgen") return day(2);

  const dows: Record<string, number> = {
    sonntag: 0,
    montag: 1,
    dienstag: 2,
    mittwoch: 3,
    donnerstag: 4,
    freitag: 5,
    samstag: 6,
  };
  if (t in dows) {
    const target = dows[t];
    const offset = (target - dayOfWeek + 7) % 7 || 7;
    return day(offset);
  }

  if (t === "wochenende") {
    const offset = (6 - dayOfWeek + 7) % 7 || 7;
    return day(offset);
  }
  if (t === "diese woche") {
    return day((5 - dayOfWeek + 7) % 7);
  }
  if (t === "nächste woche" || t === "naechste woche") {
    return day(7);
  }

  const m = t.match(/^(\d{1,2})\.(\d{1,2})\.?(\d{2,4})?$/);
  if (m) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    let y = today.getFullYear();
    if (m[3]) y = m[3].length === 2 ? 2000 + parseInt(m[3], 10) : parseInt(m[3], 10);
    const date = new Date(y, mo, d, 12, 0, 0);
    if (date.getDate() === d && date.getMonth() === mo) return date;
  }

  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]), 12, 0, 0);
  }

  return null;
}

export function formatDue(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  const diffDays = Math.round((t.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Morgen";
  if (diffDays === -1) return "Gestern";
  if (diffDays > 1 && diffDays < 7) {
    return d.toLocaleDateString("de-DE", { weekday: "short" });
  }
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "numeric" });
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
