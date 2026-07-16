// English → Cantonese translation client. The network hop (/api/translate →
// Firebase Function → Claude Haiku) returns characters only; jyutping is
// derived locally by the to-jyutping dictionary (lazy-loaded, works offline).
// Results are cached in localStorage so repeat lookups are instant and free,
// and past translations stay available offline.

export interface Translation {
  en: string;
  han: string;
  jp: string;
  ts: number;
}

const KEY = "canto.translations.v1";
const MAX = 200;

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

function loadCache(): Translation[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveCache(list: Translation[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* storage full/unavailable — translation still returned */
  }
}

/** Past translations, newest first — the offline history list. */
export function recentTranslations(): Translation[] {
  return loadCache();
}

export function clearTranslations() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Characters → jyutping via the bundled dictionary (separate lazy chunk). */
export async function hanToJyutping(han: string): Promise<string> {
  const { getJyutpingText } = await import("to-jyutping");
  return getJyutpingText(han);
}

export async function translateEnglish(text: string): Promise<Translation> {
  const en = norm(text);
  if (!en) throw new Error("Nothing to translate");
  const key = en.toLowerCase();

  const cache = loadCache();
  const hit = cache.find((t) => t.en.toLowerCase() === key);
  if (hit) return hit;

  let res: Response;
  try {
    res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: en }),
    });
  } catch {
    throw new Error("You're offline — only previously translated phrases are available.");
  }
  if (!res.ok) throw new Error("The translation service isn't reachable right now.");

  const { han } = (await res.json()) as { han?: string };
  if (!han) throw new Error("The translation service returned nothing.");

  const entry: Translation = { en, han, jp: await hanToJyutping(han), ts: Date.now() };
  saveCache([entry, ...cache.filter((t) => t.en.toLowerCase() !== key)]);
  return entry;
}
