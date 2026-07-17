// Daily session composition — 5 new + 5 ear reps + 5 character reps.
import type { KnownMap, Srs } from "./state-types";
import { ITEMS } from "../data/dojo";
import { LESSONS } from "../data/chars";
import type { PictItem, StoryItem } from "../data/types";
import { nextWordFeed, VOCAB, type Station, type Zone, type VocabWord } from "../data/zones";
import { srsDue, todayNum } from "./srs";

export interface EarOption {
  han: string;
  jp: string;
  en: string;
}
export interface EarItem {
  han: string;
  jp: string;
  en: string;
  opts: EarOption[];
  ok: number;
}

/** Builds `n` "what did you hear?" reps from the Dojo word/phrase pool. */
export function earItems(n: number): EarItem[] {
  const pool = ITEMS.filter((it) => (it[3] as number) <= 2);
  if (!pool.length) return [];
  const out: EarItem[] = [];
  const used: Record<string, 1> = {};
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const it = pool[Math.floor(Math.random() * pool.length)];
    const han = it[0] as string;
    if (used[han]) continue;
    used[han] = 1;
    const opts: EarOption[] = [{ han, jp: it[1] as string, en: it[2] as string }];
    const seen: Record<string, 1> = { [it[2] as string]: 1 };
    let oguard = 0;
    while (opts.length < 3 && oguard++ < 100) {
      const o = pool[Math.floor(Math.random() * pool.length)];
      if (seen[o[2] as string] || (o[0] as string) === han) continue;
      seen[o[2] as string] = 1;
      opts.push({ han: o[0] as string, jp: o[1] as string, en: o[2] as string });
    }
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    let ok = -1;
    for (let k = 0; k < opts.length; k++) if (opts[k].han === han) ok = k;
    out.push({ han, jp: it[1] as string, en: it[2] as string, opts, ok });
  }
  return out;
}

export interface CharItem {
  han: string;
  jp: string;
  en: string;
  opts: string[];
  ok: number;
}

/** Single characters taught in the Characters lessons — the pict/story steps
    are the ones with a han/jp/en to test; concept and radical steps have none. */
const CHAR_POOL: { han: string; jp: string; en: string }[] = LESSONS.filter(
  (l) => l.type === "pict" || l.type === "story",
).flatMap((l) => (l.items as (PictItem | StoryItem)[]).map(({ han, jp, en }) => ({ han, jp, en })));

/** Builds `n` "what does this character mean?" reps. */
export function charItems(n: number): CharItem[] {
  if (!CHAR_POOL.length) return [];
  const out: CharItem[] = [];
  const used: Record<string, 1> = {};
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const c = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
    if (used[c.han]) continue;
    used[c.han] = 1;
    const opts = [c.en];
    const seen: Record<string, 1> = { [c.en]: 1 };
    let oguard = 0;
    while (opts.length < 3 && oguard++ < 100) {
      const o = CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
      if (seen[o.en] || o.han === c.han) continue;
      seen[o.en] = 1;
      opts.push(o.en);
    }
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    out.push({ han: c.han, jp: c.jp, en: c.en, opts, ok: opts.indexOf(c.en) });
  }
  return out;
}

export interface FreshWord {
  id: string;
  w: VocabWord;
  st: Station;
  z: Zone;
}
export interface SessionPlan {
  reviews: string[]; // vocab ids due
  fresh: FreshWord[];
  ears: EarItem[];
  chars: CharItem[];
}

export function sessionPlan(srs: Srs, known: KnownMap, t: number = todayNum()): SessionPlan {
  const due = srsDue(srs, t);
  const reviews = due.slice(0, 6);
  const fresh = nextWordFeed(known, srs, 5);
  const ears = earItems(5);
  const chars = charItems(5);
  return { reviews, fresh, ears, chars };
}

export function reviewWord(id: string): VocabWord | undefined {
  return VOCAB[id]?.w;
}
