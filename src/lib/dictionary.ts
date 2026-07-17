// English → Cantonese dictionary search over everything the course teaches.
// Builds one deduped index from the zone registry plus the Dojo drill bank,
// then scores entries by exact / prefix / substring / typo (edit-distance)
// matching against the English gloss — with jyutping and 漢字 as fallbacks.

import { ZONES } from "../data/zones";
import { ITEMS as DOJO } from "../data/dojo";

export interface DictEntry {
  han: string;
  jp: string;
  en: string;
  nt: string;
  zone: string; // where it's taught, e.g. "Basics"
  cv: string; // that zone's accent color var
}

interface Indexed extends DictEntry {
  enNorm: string;
  enTokens: string[];
  jpSyls: string[]; // tone numbers stripped: "nei5 hou2" → ["nei","hou"]
  jpBare: string; // jpSyls joined: "nei hou"
  hanBare: string; // punctuation stripped: "唔該,埋單" → "唔該埋單"
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9一-鿿]+/g, " ")
    .trim();

/** Characters with the punctuation taken out. Text copied off a menu or a sign
    never carries the commas we write phrases with, so nothing may hang on them:
    "唔該,埋單" and "唔該埋單。" have to be the same string to match against. */
export const bareHan = (s: string) => s.toLowerCase().replace(/[^a-z0-9㐀-鿿]/g, "");

const INDEX: Indexed[] = [];
const seen = new Set<string>();

function add(han: string, jp: string, en: string, nt: string, zone: string, cv: string) {
  const key = han.replace(/[^一-鿿]/g, "");
  if (!key || seen.has(key)) return;
  seen.add(key);
  const enNorm = norm(en);
  const jpSyls = jp
    .toLowerCase()
    .split(/[^a-z1-6]+/)
    .map((s) => s.replace(/[1-6]$/, ""))
    .filter(Boolean);
  INDEX.push({
    han, jp, en, nt, zone, cv,
    enNorm,
    enTokens: enNorm.split(" ").filter(Boolean),
    jpSyls,
    jpBare: jpSyls.join(" "),
    hanBare: bareHan(han),
  });
}

ZONES.forEach((z) =>
  z.stations.forEach((st) => (st.vocab || []).forEach((w) => add(w.han, w.jp, w.en, w.nt, z.name, z.cv))),
);
DOJO.forEach((it) => add(String(it[0]), String(it[1]), String(it[2]), "", "Listening Dojo", "var(--dojo)"));

export const DICTIONARY: readonly DictEntry[] = INDEX;

/** The course entry for exactly this 漢字, if it teaches it. Offline and free —
    most of what a learner points at in Hong Kong is already in here. */
export function lookupHan(han: string): DictEntry | undefined {
  const q = bareHan(han);
  if (!q) return undefined;
  return INDEX.find((e) => e.hanBare === q);
}

/** The longest course word sitting *inside* a longer phrase. Only ever a hint
    ("you already know 奶茶 in there") — never the phrase's meaning, which is a
    different thing entirely. */
export function knownWordIn(han: string): DictEntry | undefined {
  const q = bareHan(han);
  if (!q) return undefined;
  let best: Indexed | undefined;
  for (const e of INDEX) {
    // single characters are too noisy to be worth pointing at
    if (e.hanBare.length < 2 || e.hanBare === q || !q.includes(e.hanBare)) continue;
    if (!best || e.hanBare.length > best.hanBare.length) best = e;
  }
  return best;
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

/** Typo budget for a query token: longer words may be further off. */
const typoCap = (t: string) => (t.length >= 7 ? 2 : t.length >= 4 ? 1 : 0);

/** Best match strength of one query token against one entry, 0 = no match. */
function scoreToken(e: Indexed, t: string): number {
  if (e.hanBare.includes(bareHan(t))) return 1; // pasted 中文, punctuation or not
  let best = 0;
  for (const w of e.enTokens) {
    if (w === t) return 1;
    if (w.startsWith(t)) best = Math.max(best, 0.8);
    else if (t.length >= 3 && w.includes(t)) best = Math.max(best, 0.55);
    else {
      const cap = typoCap(t);
      if (cap && Math.abs(w.length - t.length) <= cap) {
        const d = editDistance(t, w);
        if (d <= cap) best = Math.max(best, 0.7 - 0.2 * d);
      }
    }
  }
  if (best < 0.65) {
    const bare = t.replace(/[1-6]$/, "");
    for (const syl of e.jpSyls) {
      if (syl === bare) return Math.max(best, 0.65);
      if (bare.length >= 2 && syl.startsWith(bare)) best = Math.max(best, 0.5);
    }
  }
  return best;
}

/**
 * Fuzzy search. Every query token must match somewhere in an entry; entries
 * are ranked by match strength, whole-query hits first, shortest gloss wins ties.
 */
export function searchDictionary(query: string, limit = 40): DictEntry[] {
  const qNorm = norm(query);
  const qTokens = qNorm.split(" ").filter(Boolean);
  if (!qTokens.length) return [];
  // Whole-query jyutping bonus only when the query plausibly IS jyutping
  // (tone digits, or several syllables) — a lone "go" should stay English-first.
  const qBare = qTokens.map((t) => t.replace(/[1-6]$/, "")).join(" ");
  const jpish = qTokens.length > 1 || /[1-6]/.test(qNorm);
  // Pasting a phrase's own characters should surface that phrase, not something
  // that merely happens to contain the same two words in another order.
  const qHan = bareHan(query);

  const hits: Array<{ e: Indexed; s: number }> = [];
  for (const e of INDEX) {
    let s = 0;
    for (const t of qTokens) {
      const ts = scoreToken(e, t);
      if (!ts) {
        s = 0;
        break;
      }
      s += ts;
    }
    if (!s) continue;
    s /= qTokens.length;
    if (qHan && e.hanBare === qHan) s += 2;
    else if (e.enNorm === qNorm || (jpish && e.jpBare === qBare)) s += 1;
    else if (qHan && e.hanBare.startsWith(qHan)) s += 0.5;
    else if (e.enNorm.startsWith(qNorm) || (jpish && e.jpBare.startsWith(qBare))) s += 0.4;
    else if (e.enNorm.includes(qNorm)) s += 0.2;
    hits.push({ e, s });
  }

  hits.sort((a, b) => b.s - a.s || a.e.en.length - b.e.en.length || a.e.han.length - b.e.han.length);
  return hits.slice(0, limit).map((h) => h.e);
}
