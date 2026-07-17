import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Days, KnownMap, Srs, WildCard } from "./state-types";
import { srsGrade, srsIntroduce, srsSeed } from "./srs";
import { registerWild, wildId } from "./vocab-lookup";
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
  wild: WildCard[];

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
  /** Capture a word from the wild and schedule it for tomorrow. */
  addWild: (card: Omit<WildCard, "ts">) => void;
  /** Drop a captured word and its schedule. */
  removeWild: (han: string) => void;
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
      wild: [],

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

      addWild: (card) =>
        set((s) => {
          const han = card.han.trim();
          if (!han) return {};
          // one entry per phrase — re-saving refreshes the text, not the schedule
          const wild = [
            { ...card, han, ts: Date.now() },
            ...s.wild.filter((w) => w.han !== han),
          ];
          registerWild(wild);
          const srs = { ...s.srs };
          srsIntroduce(srs, wildId(han)); // due tomorrow, like any new word
          return { wild, srs };
        }),

      removeWild: (han) =>
        set((s) => {
          const wild = s.wild.filter((w) => w.han !== han);
          registerWild(wild);
          const srs = { ...s.srs };
          delete srs[wildId(han)];
          return { wild, srs };
        }),

      reset: () => {
        registerWild([]);
        set({ known: {}, srs: {}, days: emptyDays(), wild: [] });
      },
    }),
    {
      name: "canto:v2",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ known: s.known, srs: s.srs, days: s.days, wild: s.wild }),
      // v1 predates captured words; everything else carries over untouched.
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Partial<AppState>;
        if (version < 2) return { ...s, wild: [] };
        return s;
      },
      // localStorage rehydration is synchronous, but the registry has to be
      // populated before anything reads the schedule off the restored state.
      onRehydrateStorage: () => (state) => {
        registerWild(state?.wild ?? []);
      },
    },
  ),
);
