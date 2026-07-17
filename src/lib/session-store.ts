import { create } from "zustand";
import type { VocabWord } from "../data/zones";
import type { CharItem, EarItem } from "./session";

export type SessionItem =
  | { t: "recall"; id: string; w: VocabWord; graded?: boolean }
  | { t: "new"; id: string; w: VocabWord; stTitle: string }
  | { t: "listen"; e: EarItem }
  | { t: "char"; c: CharItem };

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
