// One lookup for every word the scheduler can schedule.
//
// VOCAB is a static index built from the course data at import time, so words
// the user captures themselves ("heard it in the wild") don't exist in it and
// would be dropped from every queue. This registry holds those alongside it;
// srs / session / launch go through lookupVocab so both kinds are first-class.

import { VOCAB, type VocabWord } from "../data/zones";
import type { WildCard } from "./state-types";
import { hashStr } from "./hash";

export const WILD_NS = "wild";

export interface VocabHit {
  w: VocabWord;
  ns: string;
}

const RUNTIME: Record<string, VocabHit> = {};

export const wildKey = (han: string) => "wild:" + hashStr(han);
export const wildId = (han: string) => WILD_NS + "|" + wildKey(han);

/** Rebuilds the runtime registry from the persisted list. Must run before
    anything reads the schedule — the store calls it on hydration and on every
    change, so a captured word survives a reload. */
export function registerWild(cards: WildCard[]): void {
  for (const k of Object.keys(RUNTIME)) delete RUNTIME[k];
  for (const c of cards) {
    const key = wildKey(c.han);
    RUNTIME[WILD_NS + "|" + key] = {
      ns: WILD_NS,
      w: { han: c.han, jp: c.jp, en: c.en, nt: c.nt, key },
    };
  }
}

/** The course index first, then anything the user caught themselves. */
export function lookupVocab(id: string): VocabHit | undefined {
  const v = VOCAB[id];
  if (v) return { w: v.w, ns: v.ns };
  return RUNTIME[id];
}

/** 漢字 → the course's own id for it, so catching a word the course already
    teaches schedules that card rather than a duplicate of it. */
const BY_HAN: Record<string, string> = {};
for (const id of Object.keys(VOCAB)) {
  const han = VOCAB[id].w.han;
  if (!(han in BY_HAN)) BY_HAN[han] = id;
}
export function courseIdForHan(han: string): string | undefined {
  return BY_HAN[han.trim()];
}

export const isWild = (id: string) => id.startsWith(WILD_NS + "|");
