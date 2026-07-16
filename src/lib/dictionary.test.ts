import { describe, it, expect } from "vitest";
import { DICTIONARY, searchDictionary } from "./dictionary";

describe("dictionary index", () => {
  it("aggregates the whole course plus the dojo bank", () => {
    expect(DICTIONARY.length).toBeGreaterThan(600);
    for (const e of DICTIONARY) expect(e.han && e.jp && e.en && e.zone).toBeTruthy();
  });
  it("dedupes repeated words", () => {
    expect(DICTIONARY.filter((e) => e.han === "你好").length).toBe(1);
  });
});

describe("searchDictionary", () => {
  it("ranks exact english matches first", () => {
    expect(searchDictionary("hello")[0].han).toBe("你好");
    expect(searchDictionary("good morning")[0].han).toBe("早晨");
    expect(searchDictionary("water")[0].han).toBe("水");
  });
  it("matches word prefixes and substrings", () => {
    expect(searchDictionary("thank").some((e) => e.han === "多謝")).toBe(true);
    expect(searchDictionary("toilet").some((e) => e.han === "廁所喺邊度")).toBe(true);
  });
  it("tolerates typos", () => {
    expect(searchDictionary("helo").some((e) => e.han === "你好")).toBe(true);
    expect(searchDictionary("mornign").some((e) => e.han === "早晨")).toBe(true);
  });
  it("requires every query word to match", () => {
    for (const e of searchDictionary("speak cantonese")) {
      expect(e.en.toLowerCase()).toContain("cantonese");
    }
  });
  it("matches jyutping (with or without tones) and 漢字", () => {
    expect(searchDictionary("nei5 hou2")[0].han).toBe("你好");
    expect(searchDictionary("do ze").some((e) => e.han === "多謝")).toBe(true);
    expect(searchDictionary("多謝").some((e) => e.han === "多謝")).toBe(true);
  });
  it("returns nothing for empty or nonsense queries", () => {
    expect(searchDictionary("")).toEqual([]);
    expect(searchDictionary("   ")).toEqual([]);
    expect(searchDictionary("qqxxyyzz")).toEqual([]);
  });
});
