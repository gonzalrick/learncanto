// Spaced-repetition scheduler — ported verbatim from the vanilla index.html.
// Functions mutate the passed `srs` (and, on graduation, `known`) objects; the
// store hands them fresh copies so React state stays immutable.

import type { KnownMap, Srs } from "./state-types";
import { VOCAB } from "../data/zones";

export function todayNum(now: number = Date.now()): number {
  return Math.floor((now - new Date().getTimezoneOffset() * 6e4) / 864e5);
}

export function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function markKnown(known: KnownMap, ns: string, key: string): void {
  if (!known[ns]) known[ns] = {};
  known[ns][key] = 1;
}

/** Seeds existing checkmarks as long-interval reviews. Returns true if changed. */
export function srsSeed(srs: Srs, known: KnownMap, t: number = todayNum()): boolean {
  let added = 0;
  for (const id of Object.keys(VOCAB)) {
    if (srs[id]) continue;
    const v = VOCAB[id];
    if ((known[v.ns] || {})[v.w.key]) {
      srs[id] = { d: t + 3 + (hashStr(id) % 14), v: 16 };
      added++;
    }
  }
  return added > 0;
}

export function srsDue(srs: Srs, t: number = todayNum()): string[] {
  return Object.keys(srs)
    .filter((id) => srs[id].d <= t && VOCAB[id])
    .sort((a, b) => srs[a].d - srs[b].d);
}

export function srsDueOn(srs: Srs, day: number): number {
  return Object.keys(srs).filter((id) => srs[id].d === day && VOCAB[id]).length;
}

export function srsGrade(
  srs: Srs,
  known: KnownMap,
  id: string,
  ok: boolean,
  t: number = todayNum(),
): void {
  const r = srs[id] || { v: 0, d: t };
  if (!ok) {
    r.v = 1;
    r.d = t + 1;
  } else {
    r.v = r.v ? Math.min(Math.round(r.v * 2.2), 120) : 1;
    r.d = t + r.v;
    if (r.v >= 7) {
      const v = VOCAB[id];
      if (v) markKnown(known, v.ns, v.w.key);
    }
  }
  srs[id] = r;
}

export function srsIntroduce(srs: Srs, id: string, t: number = todayNum()): void {
  if (!srs[id]) srs[id] = { v: 1, d: t + 1 };
}
