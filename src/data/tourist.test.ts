import { describe, it, expect } from "vitest";
import { DECKS } from "./tourist";

const cards = DECKS.flatMap((d) => d.cards);

describe("tourist decks", () => {
  it("has 5 decks with a stable id, name and 漢字 label", () => {
    expect(DECKS.length).toBe(5);
    expect(DECKS.map((d) => d.id)).toEqual(["transit", "eat", "shop", "way", "help"]);
    for (const d of DECKS) {
      expect(d.name).toBeTruthy();
      expect(d.han).toMatch(/^[一-鿿]+$/);
      expect(d.cards.length).toBeGreaterThanOrEqual(12);
    }
  });

  it("gives every card han / jyutping / english", () => {
    for (const [han, jp, en] of cards) {
      expect(han?.trim()).toBeTruthy();
      expect(jp?.trim()).toBeTruthy();
      expect(en?.trim()).toBeTruthy();
    }
  });

  it("writes jyutping as toned syllables", () => {
    for (const [han, jp] of cards) {
      for (const syl of jp.split(/[\s,]+/).filter(Boolean)) {
        // every syllable carries a 1-6 tone number — a missing tone is the
        // typo that would teach the wrong pronunciation
        expect(syl, `${han} → ${syl}`).toMatch(/^[a-z]+[1-6]$/);
      }
    }
  });

  it("has one jyutping syllable per 漢字", () => {
    for (const [han, jp] of cards) {
      // 㐀- rather than the 一- the rest of the app uses: HK particles
      // like 㗎 (U+35CE) live down in CJK Extension A.
      const chars = (han.match(/[㐀-鿿]/g) || []).length;
      const syls = jp.split(/[\s,]+/).filter(Boolean).length;
      expect(syls, `${han} → ${jp}`).toBe(chars);
    }
  });

  it("never repeats a phrase across decks", () => {
    const seen = new Set<string>();
    for (const [han] of cards) {
      expect(seen.has(han), `duplicate: ${han}`).toBe(false);
      seen.add(han);
    }
  });
});
