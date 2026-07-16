// The Line registry — ports the `build()` + VOCAB index from the vanilla
// index.html. Pure static data derived from the lesson data modules.

import type { KnownMap, Srs } from "../lib/state-types";
import type { Card } from "./types";
import { LESSONS as FOUND } from "./found";
import { LESSONS as CHARS } from "./chars";
import { DECKS as BASICS } from "./basics";
import { KIN, DECKS as FAMILY } from "./family";
import { DECKS as BEYOND } from "./beyond";
import { DECKS as CONV } from "./conv";

export interface VocabWord {
  han: string;
  jp: string;
  en: string;
  nt: string;
  key: string;
}
export interface Station {
  id: string;
  title: string;
  sub: string;
  total: number;
  ns: string;
  kp: string; // key prefix
  vocab: VocabWord[] | null;
}
export interface Zone {
  id: string;
  pill: string;
  name: string;
  hk: string;
  cv: string; // e.g. "var(--l0)"
  route: string;
  ns: string;
  elective: boolean;
  blabel?: string;
  stations: Station[];
}

function words(cards: Card[], kp: string): VocabWord[] {
  return cards.map((c, i) => ({
    han: c[0],
    jp: c[1],
    en: c[2],
    nt: c[3] || "",
    key: kp + i,
  }));
}
const badgeSub = (badge: string) => (badge.split("·")[1] || "").trim();

export const ZONES: Zone[] = [];

// L0 — foundations lessons
ZONES.push({
  id: "l0", pill: "Zone L0", name: "Foundations", hk: "入門", cv: "var(--l0)",
  route: "/foundations", ns: "found", elective: false,
  stations: FOUND.map((l) => ({
    id: l.id, title: l.title, sub: badgeSub(l.badge), total: l.items.length,
    ns: "found", kp: l.id + ":",
    vocab: l.type === "word" ? words(l.items as Card[], l.id + ":") : null,
  })),
});

// Reading branch — characters (elective)
ZONES.push({
  id: "chars", pill: "Reading", name: "Learn the Characters", hk: "認字", cv: "var(--chars)",
  route: "/characters", ns: "chars", elective: true,
  blabel: "Reading branch — optional · learn to see the pictures",
  stations: CHARS.map((l) => {
    let vocab: VocabWord[] | null = null;
    if (l.type === "pict" || l.type === "story") {
      vocab = (l.items as Array<{ han: string; jp: string; en: string; story?: string }>).map(
        (it, i) => ({ han: it.han, jp: it.jp, en: it.en, nt: it.story || "", key: l.id + ":" + i }),
      );
    } else if (l.type === "read") {
      vocab = words(l.items as Card[], l.id + ":");
    }
    return {
      id: l.id, title: l.title, sub: badgeSub(l.badge), total: l.items.length,
      ns: "chars", kp: l.id + ":", vocab,
    };
  }),
});

// L1 — basics decks
ZONES.push({
  id: "l1", pill: "Zone L1", name: "Basics", hk: "基礎", cv: "var(--l1)",
  route: "/basics", ns: "basics", elective: false,
  stations: BASICS.map((d) => ({
    id: d.id, title: d.name, sub: d.han + " · " + d.cards.length + " words",
    total: d.cards.length, ns: "basics", kp: d.id + ":", vocab: words(d.cards, d.id + ":"),
  })),
});

// Interchange — family (elective side trip)
const famStations: Station[] = [
  {
    id: "kin", title: "Who's who", sub: "稱謂 · every relative's title",
    total: KIN.length, ns: "family", kp: "kin:",
    vocab: KIN.map((k, i) =>
      k.jp ? { han: k.han, jp: k.jp, en: k.en, nt: k.note || "", key: "kin:" + i } : null,
    ).filter((x): x is VocabWord => x !== null),
  },
];
FAMILY.forEach((d) => {
  famStations.push({
    id: d.id, title: d.name, sub: d.han + " · " + d.cards.length + " phrases",
    total: d.cards.length, ns: "family", kp: "p:" + d.id + ":", vocab: words(d.cards, "p:" + d.id + ":"),
  });
});
ZONES.push({
  id: "fam", pill: "Interchange", name: "Meeting the Family", hk: "見家長", cv: "var(--fam)",
  route: "/family", ns: "family", elective: true,
  blabel: "Interchange — side trip · ride any time",
  stations: famStations,
});

// L1.5 — beyond decks
ZONES.push({
  id: "l15", pill: "Zone L1.5", name: "Beyond the Basics", hk: "進階", cv: "var(--l15)",
  route: "/beyond", ns: "beyond", elective: false,
  stations: BEYOND.map((d) => ({
    id: d.id, title: d.name, sub: d.han + " · " + d.cards.length + " words",
    total: d.cards.length, ns: "beyond", kp: d.id + ":", vocab: words(d.cards, d.id + ":"),
  })),
});

// L2 — conversational decks (terminus)
ZONES.push({
  id: "l2", pill: "Zone L2", name: "Conversational", hk: "講廣東話", cv: "var(--l2)",
  route: "/conversational", ns: "conv", elective: false,
  stations: CONV.map((d) => ({
    id: d.id, title: d.name, sub: d.han + " · " + d.cards.length + " phrases",
    total: d.cards.length, ns: "conv", kp: d.id + ":", vocab: words(d.cards, d.id + ":"),
  })),
});

/* Global vocab index: id = "ns|key" */
export interface VocabEntry {
  w: VocabWord;
  ns: string;
  st: Station;
  z: Zone;
}
export const VOCAB: Record<string, VocabEntry> = {};
ZONES.forEach((z) =>
  z.stations.forEach((st) =>
    (st.vocab || []).forEach((w) => {
      VOCAB[st.ns + "|" + w.key] = { w, ns: st.ns, st, z };
    }),
  ),
);

/* Station → parent zone lookup (replaces the vanilla `st._z`) */
export const ZONE_OF_STATION = new Map<Station, Zone>();
ZONES.forEach((z) => z.stations.forEach((st) => ZONE_OF_STATION.set(st, z)));

export function knownMap(known: KnownMap, ns: string): Record<string, 1> {
  return known[ns] || {};
}
export function stationDone(known: KnownMap, st: Station): number {
  const km = knownMap(known, st.ns);
  let n = 0;
  for (let i = 0; i < st.total; i++) if (km[st.kp + i]) n++;
  return n;
}
export function progressionStations(): Station[] {
  const out: Station[] = [];
  ZONES.forEach((z) => {
    if (!z.elective) z.stations.forEach((s) => out.push(s));
  });
  return out;
}
export function currentStation(known: KnownMap): Station {
  const ps = progressionStations();
  for (const st of ps) if (stationDone(known, st) < st.total) return st;
  return ps[ps.length - 1];
}
export function nextWordFeed(
  known: KnownMap,
  srs: Srs,
  n: number,
): Array<{ id: string; w: VocabWord; st: Station; z: Zone }> {
  const ps = progressionStations();
  const out: Array<{ id: string; w: VocabWord; st: Station; z: Zone }> = [];
  for (const st of ps) {
    if (out.length >= n) break;
    if (!st.vocab) continue;
    const km = knownMap(known, st.ns);
    const z = ZONE_OF_STATION.get(st)!;
    for (const w of st.vocab) {
      if (out.length >= n) break;
      const id = st.ns + "|" + w.key;
      if (!km[w.key] && !srs[id]) out.push({ id, w, st, z });
    }
  }
  return out;
}
