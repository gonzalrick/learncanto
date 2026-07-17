// Builds session queues and opens the overlay — shared by Today and Practice.
import { useStore } from "./store";
import { useSession, type SessionItem } from "./session-store";
import { sessionPlan, earItems } from "./session";
import { srsDue } from "./srs";
import { VOCAB } from "../data/zones";

export function startRun() {
  const { srs, known } = useStore.getState();
  const plan = sessionPlan(srs, known);
  const items: SessionItem[] = [];
  plan.reviews.forEach((id) => items.push({ t: "recall", id, w: VOCAB[id].w }));
  plan.fresh.forEach((f) => items.push({ t: "new", id: f.id, w: f.w, stTitle: f.st.title }));
  plan.ears.forEach((e) => items.push({ t: "listen", e }));
  plan.chars.forEach((c) => items.push({ t: "char", c }));
  if (!items.length) earItems(4).forEach((e) => items.push({ t: "listen", e }));
  useSession.getState().start(items, "run");
}

export function startCards() {
  const { srs } = useStore.getState();
  const due = srsDue(srs).slice(0, 20);
  if (!due.length) return startRun();
  useSession.getState().start(
    due.map((id) => ({ t: "recall", id, w: VOCAB[id].w })),
    "drill",
  );
}

export function startEarDrill() {
  useSession.getState().start(
    earItems(6).map((e) => ({ t: "listen" as const, e })),
    "drill",
  );
}
