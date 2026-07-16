// Daily streak with a weekly rest-day shield — ported from index.html.
import type { Days } from "./state-types";

export function dstr(offset = 0, base: Date = new Date()): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offset);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

/** Records today as complete, advancing the streak and spending/earning shields. Mutates `days`. */
export function logToday(days: Days): void {
  const t = dstr(0),
    y = dstr(-1),
    y2 = dstr(-2);
  if (days.days[t]) return;
  days.days[t] = 1;
  if (days.last === y) {
    days.streak += 1;
  } else if (days.last === y2 && days.shields > 0) {
    days.shields -= 1;
    days.days[y] = "shield";
    days.streak += 1;
  } else {
    days.streak = 1;
  }
  days.last = t;
  const total = Object.keys(days.days).filter((k) => days.days[k] === 1).length;
  if (total > 0 && total % 7 === 0) days.shields = Math.min(2, days.shields + 1);
}
