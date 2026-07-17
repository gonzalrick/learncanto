// Spaced-repetition scheduler — ported verbatim from the vanilla index.html.
// Functions mutate the passed `srs` (and, on graduation, `known`) objects; the
// store hands them fresh copies so React state stays immutable.
//
// Scheduled words are resolved through lookupVocab, not the static VOCAB index,
// so words the user captured themselves ride the same schedule as the course's.

import type { KnownMap, Srs } from "./state-types";
import { VOCAB } from "../data/zones";
import { lookupVocab } from "./vocab-lookup";

export { hashStr } from "./hash";
import { hashStr } from "./hash";

export function todayNum(now: number = Date.now()): number {
  return Math.floor((now - new Date().getTimezoneOffset() * 6e4) / 864e5);
}

function markKnown(known: KnownMap, ns: string, key: string): void {
  if (!known[ns]) known[ns] = {};
  known[ns][key] = 1;
}

/** Seeds existing checkmarks as long-interval reviews. Returns true if changed.
    Course words only — a captured word is scheduled the moment it's saved, and
    is never "already known". */
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
    .filter((id) => srs[id].d <= t && lookupVocab(id))
    .sort((a, b) => srs[a].d - srs[b].d);
}

export function srsDueOn(srs: Srs, day: number): number {
  return Object.keys(srs).filter((id) => srs[id].d === day && lookupVocab(id)).length;
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
      const v = lookupVocab(id);
      if (v) markKnown(known, v.ns, v.w.key);
    }
  }
  srs[id] = r;
}

export function srsIntroduce(srs: Srs, id: string, t: number = todayNum()): void {
  if (!srs[id]) srs[id] = { v: 1, d: t + 1 };
}
