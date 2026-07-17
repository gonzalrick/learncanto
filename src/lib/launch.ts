// Builds session queues and opens the overlay — shared by Today and Practice.
import { useStore } from "./store";
import { useSession, type SessionItem } from "./session-store";
import { sessionPlan, earItems } from "./session";
import { srsDue } from "./srs";
import type { Srs } from "./state-types";
import { lookupVocab } from "./vocab-lookup";

/** Interval (days) at which a card is mature enough to be tested by ear.
    srsGrade doubles 1 → 2 → 4, so this is ~2 correct reviews in. */
const EAR_MIN_INTERVAL = 4;

/** Picks the reviews to run audio-first: the most mature half of the queue.
    Capping at half keeps a session from turning into a wall of audio on a day
    when every due card happens to be an old one. */
export function markEar(ids: string[], srs: Srs): Set<string> {
  const cap = Math.floor(ids.length / 2);
  if (!cap) return new Set();
  return new Set(
    ids
      .filter((id) => (srs[id]?.v ?? 0) >= EAR_MIN_INTERVAL)
      .sort((a, b) => srs[b].v - srs[a].v)
      .slice(0, cap),
  );
}

export function startRun() {
  const { srs, known } = useStore.getState();
  const plan = sessionPlan(srs, known);
  const items: SessionItem[] = [];
  const ear = markEar(plan.reviews, srs);
  plan.reviews.forEach((id) => {
    const v = lookupVocab(id);
    if (v) items.push({ t: "recall", id, w: v.w, ear: ear.has(id) });
  });
  plan.fresh.forEach((f) => items.push({ t: "new", id: f.id, w: f.w, stTitle: f.st.title }));
  plan.ears.forEach((e) => items.push({ t: "listen", e }));
  plan.nums.forEach((n) => items.push({ t: "num", n }));
  plan.chars.forEach((c) => items.push({ t: "char", c }));
  if (!items.length) earItems(4).forEach((e) => items.push({ t: "listen", e }));
  useSession.getState().start(items, "run");
}

export function startCards() {
  const { srs } = useStore.getState();
  const due = srsDue(srs).slice(0, 20);
  if (!due.length) return startRun();
  const ear = markEar(due, srs);
  const items = due.flatMap((id): SessionItem[] => {
    const v = lookupVocab(id);
    return v ? [{ t: "recall", id, w: v.w, ear: ear.has(id) }] : [];
  });
  if (!items.length) return startRun();
  useSession.getState().start(items, "drill");
}

export function startEarDrill() {
  useSession.getState().start(
    earItems(6).map((e) => ({ t: "listen" as const, e })),
    "drill",
  );
}
