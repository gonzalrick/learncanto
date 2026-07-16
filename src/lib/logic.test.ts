import { describe, it, expect, beforeEach } from "vitest";
import type { Days, KnownMap, Srs } from "./state-types";
import { srsSeed, srsDue, srsDueOn, srsGrade, srsIntroduce, todayNum, hashStr } from "./srs";
import { logToday, dstr } from "./streak";
import { sessionPlan, earItems } from "./session";
import { ZONES, VOCAB, currentStation, stationDone } from "../data/zones";

const t = todayNum();

describe("registry", () => {
  it("builds 6 zones incl. the elective reading branch", () => {
    expect(ZONES.length).toBe(6);
    expect(ZONES[1].id).toBe("chars");
    expect(ZONES[1].elective).toBe(true);
    expect(ZONES[3].elective).toBe(true); // family
  });
  it("indexes character vocab", () => {
    expect(VOCAB["chars|pict:0"]?.w.han).toBe("人");
  });
  it("has >600 vocab items, all with han/jp/en", () => {
    const ids = Object.keys(VOCAB);
    expect(ids.length).toBeGreaterThan(600);
    for (const id of ids) {
      const w = VOCAB[id].w;
      expect(w.han && w.jp && w.en).toBeTruthy();
    }
  });
});

describe("fresh-user session plan", () => {
  it("is 0 reviews / 5 new / 5 ears, new words from 'blocks'", () => {
    const srs: Srs = {};
    const known: KnownMap = {};
    const plan = sessionPlan(srs, known, t);
    expect(plan.reviews.length).toBe(0);
    expect(plan.fresh.length).toBe(5);
    expect(plan.fresh[0].st.id).toBe("blocks");
    expect(plan.ears.length).toBe(5);
    expect(currentStation(known).id).toBe("how");
  });
});

describe("ear items", () => {
  it("carry han/jp/en per option, correct at ok, no dup meanings", () => {
    const ears = earItems(3);
    expect(ears.length).toBe(3);
    for (const e of ears) {
      expect(e.opts.length).toBe(3);
      expect(e.opts[e.ok].han).toBe(e.han);
      expect(new Set(e.opts.map((o) => o.en)).size).toBe(3);
    }
  });
});

describe("srs scheduling", () => {
  let srs: Srs;
  let known: KnownMap;
  const id = "found|blocks:0";
  beforeEach(() => {
    srs = {};
    known = {};
  });
  it("introduces due tomorrow, ivl 1", () => {
    srsIntroduce(srs, id, t);
    expect(srs[id].d).toBe(t + 1);
    expect(srs[id].v).toBe(1);
    expect(srsDueOn(srs, t + 1)).toBeGreaterThanOrEqual(1);
  });
  it("grades Got it 1→2, Again→1, graduates at ≥7", () => {
    srsIntroduce(srs, id, t);
    srs[id].d = t; // force due
    expect(srsDue(srs, t)).toContain(id);
    srsGrade(srs, known, id, true, t);
    expect(srs[id].v).toBe(2);
    expect(srs[id].d).toBe(t + 2);
    srsGrade(srs, known, id, false, t);
    expect(srs[id].v).toBe(1);
    srs[id].v = 4;
    srsGrade(srs, known, id, true, t);
    expect(srs[id].v).toBe(9); // 4 * 2.2 → 9
    const v = VOCAB[id];
    expect(known[v.ns][v.w.key]).toBe(1); // graduated → marked known
    expect(stationDone(known, v.st)).toBe(1);
  });
});

describe("seeding checkmarks", () => {
  it("seeds known items as long-interval reviews, idempotently", () => {
    const srs: Srs = {};
    const known: KnownMap = { basics: { "greet:0": 1, "greet:1": 1 } };
    srsSeed(srs, known, t);
    const s1 = srs["basics|greet:0"];
    expect(s1.v).toBe(16);
    expect(s1.d).toBeGreaterThanOrEqual(t + 3);
    expect(s1.d).toBeLessThan(t + 17);
    const before = JSON.stringify(srs["basics|greet:0"]);
    srsSeed(srs, known, t);
    expect(JSON.stringify(srs["basics|greet:0"])).toBe(before);
  });
});

describe("streak + shields", () => {
  let d: Days;
  beforeEach(() => {
    d = { days: {}, streak: 0, shields: 0, last: null };
  });
  it("first session → streak 1", () => {
    logToday(d);
    expect(d.streak).toBe(1);
    expect(d.days[dstr(0)]).toBe(1);
  });
  it("consecutive day → +1", () => {
    d.days[dstr(-1)] = 1;
    d.streak = 5;
    d.last = dstr(-1);
    logToday(d);
    expect(d.streak).toBe(6);
  });
  it("one-day gap bridged by a shield", () => {
    d.days[dstr(-2)] = 1;
    d.streak = 9;
    d.shields = 1;
    d.last = dstr(-2);
    logToday(d);
    expect(d.streak).toBe(10);
    expect(d.shields).toBe(0);
    expect(d.days[dstr(-1)]).toBe("shield");
  });
  it("two-day gap with no shield → reset to 1", () => {
    d.days[dstr(-3)] = 1;
    d.streak = 20;
    d.shields = 0;
    d.last = dstr(-3);
    logToday(d);
    expect(d.streak).toBe(1);
  });
  it("earns a shield on every 7th completed day", () => {
    for (let i = 1; i <= 5; i++) d.days["2026-06-0" + i] = 1;
    d.days[dstr(-1)] = 1;
    d.last = dstr(-1);
    d.streak = 6;
    logToday(d); // 5 + yesterday + today = 7
    expect(d.shields).toBe(1);
  });
});

describe("session with reviews due", () => {
  it("keeps fresh/ears fixed at 5 regardless of review load", () => {
    const srs: Srs = {};
    const known: KnownMap = {};
    Object.keys(VOCAB).slice(10, 16).forEach((id) => (srs[id] = { d: t, v: 2 }));
    const plan = sessionPlan(srs, known, t);
    expect(plan.reviews.length).toBe(6);
    expect(plan.fresh.length).toBe(5);
    expect(plan.ears.length).toBe(5);
  });
});

describe("hashStr", () => {
  it("is stable and non-negative", () => {
    expect(hashStr("found|blocks:0")).toBe(hashStr("found|blocks:0"));
    expect(hashStr("x")).toBeGreaterThanOrEqual(0);
  });
});
