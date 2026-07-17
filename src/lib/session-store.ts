import { create } from "zustand";
import type { VocabWord } from "../data/zones";
import type { CharItem, EarItem, NumItem } from "./session";

export type SessionItem =
  // `ear` flips a review to audio-first — set only for mature cards, see markEar()
  | { t: "recall"; id: string; w: VocabWord; graded?: boolean; ear?: boolean }
  | { t: "new"; id: string; w: VocabWord; stTitle: string }
  | { t: "listen"; e: EarItem }
  | { t: "char"; c: CharItem }
  | { t: "num"; n: NumItem };

interface SessionStore {
  active: boolean;
  kind: "run" | "drill";
  items: SessionItem[];
  runId: number; // increments each start() so the runner remounts with fresh state
  start: (items: SessionItem[], kind: "run" | "drill") => void;
  close: () => void;
}

export const useSession = create<SessionStore>((set) => ({
  active: false,
  kind: "run",
  items: [],
  runId: 0,
  start: (items, kind) => set((s) => ({ active: true, items, kind, runId: s.runId + 1 })),
  close: () => set({ active: false, items: [] }),
}));
