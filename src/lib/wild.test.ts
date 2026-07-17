import { describe, it, expect, beforeEach } from "vitest";
import type { KnownMap, Srs } from "./state-types";
import { registerWild, lookupVocab, wildId, isWild, courseIdForHan, WILD_NS } from "./vocab-lookup";
import { srsDue, srsDueOn, srsGrade, srsIntroduce, todayNum } from "./srs";
import { lookupHan, knownWordIn, searchDictionary } from "./dictionary";
import { useStore } from "./store";
import { VOCAB } from "../data/zones";

const t = todayNum();
const card = (han: string, en: string) => ({ han, jp: "test1", en, nt: "", ts: 1 });

describe("wild vocab registry", () => {
  beforeEach(() => registerWild([]));

  it("resolves course words and captured words through one lookup", () => {
    registerWild([card("蛋撻", "egg tart")]);
    expect(lookupVocab("chars|pict:0")?.w.han).toBe("人"); // course
    expect(lookupVocab(wildId("蛋撻"))?.w.en).toBe("egg tart"); // captured
    expect(lookupVocab("nope|nope:0")).toBeUndefined();
  });

  it("re-registering replaces rather than accumulates", () => {
    registerWild([card("蛋撻", "egg tart")]);
    registerWild([card("菠蘿包", "pineapple bun")]);
    expect(lookupVocab(wildId("蛋撻"))).toBeUndefined();
    expect(lookupVocab(wildId("菠蘿包"))?.w.en).toBe("pineapple bun");
  });

  it("gives each phrase a stable, distinct id", () => {
    expect(wildId("蛋撻")).toBe(wildId("蛋撻"));
    expect(wildId("蛋撻")).not.toBe(wildId("菠蘿包"));
    expect(isWild(wildId("蛋撻"))).toBe(true);
    expect(isWild("basics|greet:0")).toBe(false);
  });

  it("maps course 漢字 back to the card that teaches it", () => {
    const id = courseIdForHan("你好");
    expect(id && VOCAB[id]?.w.han).toBe("你好");
    expect(courseIdForHan("蛋撻冇人識")).toBeUndefined();
  });
});

describe("scheduling a captured word", () => {
  beforeEach(() => registerWild([]));

  it("puts it in the due queue like any other card", () => {
    registerWild([card("蛋撻", "egg tart")]);
    const id = wildId("蛋撻");
    const srs: Srs = { [id]: { d: t, v: 1 } };
    expect(srsDue(srs, t)).toEqual([id]);
    expect(srsDueOn(srs, t)).toBe(1);
  });

  it("drops from the queue if the word was forgotten but the schedule lingers", () => {
    const srs: Srs = { [wildId("蛋撻")]: { d: t, v: 1 } };
    registerWild([]); // user deleted it
    expect(srsDue(srs, t)).toEqual([]);
  });

  it("graduates into its own namespace without touching course progress", () => {
    registerWild([card("蛋撻", "egg tart")]);
    const id = wildId("蛋撻");
    const srs: Srs = { [id]: { d: t, v: 4 } };
    const known: KnownMap = {};
    srsGrade(srs, known, id, true, t); // 4 * 2.2 → 9, past the graduation line
    expect(srs[id].v).toBeGreaterThanOrEqual(7);
    expect(Object.keys(known)).toEqual([WILD_NS]);
  });

  it("introduces as due tomorrow, and never re-introduces", () => {
    const srs: Srs = {};
    const id = wildId("蛋撻");
    srsIntroduce(srs, id, t);
    expect(srs[id]).toEqual({ v: 1, d: t + 1 });
    srsIntroduce(srs, id, t + 5); // saving the same phrase again
    expect(srs[id].d).toBe(t + 1); // schedule untouched
  });
});

describe("searching 漢字 regardless of punctuation", () => {
  // Text copied off a menu has no commas; the course writes phrases with them.
  it("finds a phrase whose entry carries punctuation the query doesn't", () => {
    expect(searchDictionary("唔該埋單")[0]?.en).toMatch(/bill/i);
    expect(searchDictionary("我要一杯凍奶茶")[0]?.en).toMatch(/milk tea/i);
  });

  it("finds it just as well with the punctuation included", () => {
    expect(searchDictionary("唔該,埋單")[0]?.en).toMatch(/bill/i);
    expect(searchDictionary("唔該埋單。")[0]?.en).toMatch(/bill/i);
  });

  it("still finds plain unpunctuated phrases", () => {
    expect(searchDictionary("早晨")[0]?.han).toBe("早晨");
  });
});

describe("reading 漢字 the user pasted", () => {
  it("recognises a phrase the course already teaches", () => {
    expect(lookupHan("你好")?.en.toLowerCase()).toBe("hello");
    expect(lookupHan(" 你好 ")?.en.toLowerCase()).toBe("hello");
  });

  it("matches a taught phrase despite its punctuation", () => {
    // the course stores it as 我要一杯凍奶茶。— a menu won't have the full stop
    expect(lookupHan("我要一杯凍奶茶")?.en).toMatch(/milk tea/i);
  });

  it("does not pass off a contained word as the whole phrase's meaning", () => {
    // 奶茶 is taught, but "the milk tea here is great" doesn't mean "milk tea"
    expect(lookupHan("呢度嘅奶茶好正")).toBeUndefined();
  });

  it("points out a word you already know inside a longer phrase", () => {
    const inner = knownWordIn("呢度嘅奶茶好正");
    expect(inner?.han).toBe("奶茶");
    expect(inner!.han.length).toBeGreaterThan(1); // never single characters
  });

  it("picks the longest known word inside a phrase, not the first", () => {
    expect(knownWordIn("凍奶茶好好飲")?.han).toBe("凍奶茶");
  });

  it("does not report a phrase as a word inside itself", () => {
    expect(knownWordIn("你好")?.han).not.toBe("你好");
  });
});

describe("the wild store slice", () => {
  beforeEach(() => {
    useStore.getState().reset();
    localStorage.clear();
  });

  it("saves a word and schedules it for tomorrow", () => {
    useStore.getState().addWild({ han: "蛋撻", jp: "daan6 taat1", en: "egg tart", nt: "" });
    const { wild, srs } = useStore.getState();
    expect(wild.map((w) => w.han)).toEqual(["蛋撻"]);
    expect(srs[wildId("蛋撻")]).toEqual({ v: 1, d: todayNum() + 1 });
    // and it's immediately resolvable, so the session can render it
    expect(lookupVocab(wildId("蛋撻"))?.w.jp).toBe("daan6 taat1");
  });

  it("keeps one card per phrase when saved twice", () => {
    const s = useStore.getState();
    s.addWild({ han: "蛋撻", jp: "daan6 taat1", en: "egg tart", nt: "" });
    s.addWild({ han: "蛋撻", jp: "daan6 taat1", en: "custard tart", nt: "" });
    expect(useStore.getState().wild.length).toBe(1);
    expect(useStore.getState().wild[0].en).toBe("custard tart"); // text refreshed
  });

  it("ignores an empty phrase", () => {
    useStore.getState().addWild({ han: "   ", jp: "", en: "nothing", nt: "" });
    expect(useStore.getState().wild).toEqual([]);
  });

  it("forgetting a word takes its schedule with it", () => {
    const s = useStore.getState();
    s.addWild({ han: "蛋撻", jp: "daan6 taat1", en: "egg tart", nt: "" });
    useStore.getState().removeWild("蛋撻");
    expect(useStore.getState().wild).toEqual([]);
    expect(useStore.getState().srs[wildId("蛋撻")]).toBeUndefined();
    expect(lookupVocab(wildId("蛋撻"))).toBeUndefined();
  });

  it("persists captured words across a reload", () => {
    useStore.getState().addWild({ han: "蛋撻", jp: "daan6 taat1", en: "egg tart", nt: "" });
    const raw = JSON.parse(localStorage.getItem("canto:v2")!);
    expect(raw.version).toBe(2);
    expect(raw.state.wild[0].han).toBe("蛋撻");
    expect(raw.state.srs[wildId("蛋撻")]).toBeTruthy();
  });

  it("resetting clears the words and the registry with them", () => {
    useStore.getState().addWild({ han: "蛋撻", jp: "daan6 taat1", en: "egg tart", nt: "" });
    useStore.getState().reset();
    expect(useStore.getState().wild).toEqual([]);
    expect(lookupVocab(wildId("蛋撻"))).toBeUndefined();
  });

  it("upgrades a v1 save without losing progress", async () => {
    // what a user who last opened the app before this feature has on disk
    localStorage.setItem(
      "canto:v2",
      JSON.stringify({
        version: 1,
        state: {
          known: { basics: { "greet:0": 1 } },
          srs: { "basics|greet:0": { d: 42, v: 16 } },
          days: { days: { "2026-07-16": 1 }, streak: 3, shields: 1, last: "2026-07-16" },
        },
      }),
    );
    await useStore.persist.rehydrate();
    const s = useStore.getState();
    expect(s.known).toEqual({ basics: { "greet:0": 1 } });
    expect(s.srs["basics|greet:0"]).toEqual({ d: 42, v: 16 });
    expect(s.days.streak).toBe(3);
    expect(s.wild).toEqual([]); // the new slice, defaulted
  });
});
