import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Days, KnownMap, Srs } from "./state-types";
import { srsGrade, srsIntroduce, srsSeed } from "./srs";
import { logToday } from "./streak";

function cloneKnown(known: KnownMap): KnownMap {
  const out: KnownMap = {};
  for (const ns of Object.keys(known)) out[ns] = { ...known[ns] };
  return out;
}

interface AppState {
  known: KnownMap;
  srs: Srs;
  days: Days;

  /** Lesson pages: mark/unmark a single item known. */
  setKnown: (ns: string, key: string, val: boolean) => void;
  /** Lesson pages: mark/unmark a whole deck at once. */
  setDeckKnown: (ns: string, keys: string[], val: boolean) => void;
  /** Session: grade a review (schedules + may graduate to "known"). */
  grade: (id: string, ok: boolean) => void;
  /** Session: introduce a new word into the schedule. */
  introduce: (id: string) => void;
  /** Session: record today's completion for the streak. */
  logDay: () => void;
  /** Seed existing checkmarks into the SRS as long-interval reviews. */
  seed: () => void;
  /** Reset everything (also clears the persisted store + service worker caches upstream). */
  reset: () => void;
}

const emptyDays = (): Days => ({ days: {}, streak: 0, shields: 0, last: null });

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      known: {},
      srs: {},
      days: emptyDays(),

      setKnown: (ns, key, val) =>
        set((s) => {
          const known = cloneKnown(s.known);
          if (!known[ns]) known[ns] = {};
          if (val) known[ns][key] = 1;
          else delete known[ns][key];
          return { known };
        }),

      setDeckKnown: (ns, keys, val) =>
        set((s) => {
          const known = cloneKnown(s.known);
          if (!known[ns]) known[ns] = {};
          for (const key of keys) {
            if (val) known[ns][key] = 1;
            else delete known[ns][key];
          }
          return { known };
        }),

      grade: (id, ok) =>
        set((s) => {
          const srs = { ...s.srs };
          const known = cloneKnown(s.known);
          srsGrade(srs, known, id, ok);
          return { srs, known };
        }),

      introduce: (id) =>
        set((s) => {
          const srs = { ...s.srs };
          srsIntroduce(srs, id);
          return { srs };
        }),

      logDay: () =>
        set((s) => {
          const days = { ...s.days, days: { ...s.days.days } };
          logToday(days);
          return { days };
        }),

      seed: () =>
        set((s) => {
          const srs = { ...s.srs };
          const known = cloneKnown(s.known);
          if (srsSeed(srs, known)) return { srs };
          return {};
        }),

      reset: () => set({ known: {}, srs: {}, days: emptyDays() }),
    }),
    {
      name: "canto:v2",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ known: s.known, srs: s.srs, days: s.days }),
    },
  ),
);
