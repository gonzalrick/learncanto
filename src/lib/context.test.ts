import { describe, it, expect } from "vitest";
import { touristSlot, slotDeck, slotPhrases } from "./context";
import { DECKS } from "../data/tourist";

describe("time-of-day slot", () => {
  it("covers all 24 hours with a real deck", () => {
    for (let h = 0; h < 24; h++) {
      const slot = touristSlot(h);
      expect(slot.label, `hour ${h}`).toBeTruthy();
      expect(DECKS.some((d) => d.id === slot.deckId), `hour ${h} → ${slot.deckId}`).toBe(true);
    }
  });

  it("switches at the boundaries", () => {
    expect(touristSlot(4).deckId).toBe("help"); // still last night
    expect(touristSlot(5).deckId).toBe("eat"); // breakfast
    expect(touristSlot(10).deckId).toBe("eat");
    expect(touristSlot(11).deckId).toBe("transit"); // out and about
    expect(touristSlot(14).deckId).toBe("transit");
    expect(touristSlot(15).deckId).toBe("shop"); // markets
    expect(touristSlot(18).deckId).toBe("shop");
    expect(touristSlot(19).deckId).toBe("eat"); // dinner
    expect(touristSlot(23).deckId).toBe("eat");
    expect(touristSlot(0).deckId).toBe("help"); // late night
  });

  it("labels breakfast and dinner differently despite sharing a deck", () => {
    expect(touristSlot(8).label).not.toBe(touristSlot(20).label);
    expect(touristSlot(8).deckId).toBe(touristSlot(20).deckId);
  });

  it("resolves every slot to its deck", () => {
    for (let h = 0; h < 24; h++) {
      expect(slotDeck(touristSlot(h)).id).toBe(touristSlot(h).deckId);
    }
  });
});

describe("slot phrases", () => {
  const deck = DECKS[0];

  it("holds still within a day and moves on to the next", () => {
    const a = slotPhrases(deck, "2026-07-18");
    expect(slotPhrases(deck, "2026-07-18")).toEqual(a); // same day, same card
    expect(slotPhrases(deck, "2026-07-19")).not.toEqual(a);
  });

  it("returns n distinct phrases", () => {
    const p = slotPhrases(deck, "2026-07-18");
    expect(p.length).toBe(3);
    expect(new Set(p.map((c) => c[0])).size).toBe(3);
  });

  it("wraps past the end of a deck rather than running short", () => {
    // every day of a year must yield a full card, including the wrap-around days
    for (let i = 0; i < 370; i++) {
      const day = new Date(2026, 0, 1 + i).toISOString().slice(0, 10);
      for (const d of DECKS) {
        const p = slotPhrases(d, day);
        expect(p.length, `${d.id} on ${day}`).toBe(3);
        expect(p.every((c) => c && c[0]), `${d.id} on ${day}`).toBe(true);
      }
    }
  });

  it("never asks for more than the deck holds", () => {
    const tiny = { ...deck, cards: deck.cards.slice(0, 2) };
    expect(slotPhrases(tiny, "2026-07-18", 3).length).toBe(2);
    expect(slotPhrases({ ...deck, cards: [] }, "2026-07-18").length).toBe(0);
  });
});
