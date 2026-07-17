// What you're most likely about to need, by the clock. The Today page opens on
// whichever tourist deck matches the hour — breakfast phrases at 8am, transit
// at noon, the market at 5, essentials at 2am.

import type { Card, Deck } from "../data/types";
import { DECKS } from "../data/tourist";
import { hashStr } from "./hash";

export interface Slot {
  deckId: string;
  label: string; // the eyebrow — what's happening right now
  hk: string;
  blurb: string; // why this deck, in the user's own terms
}

const SLOTS: Slot[] = [
  { deckId: "eat", label: "Breakfast run", hk: "早晨", blurb: "Order like you've done it before" },
  { deckId: "transit", label: "On the move", hk: "搭車", blurb: "MTR, taxi, Octopus" },
  { deckId: "shop", label: "Market hours", hk: "買嘢", blurb: "Ask the price, talk it down" },
  { deckId: "eat", label: "Dinner", hk: "食飯", blurb: "Order, ask, pay" },
  { deckId: "help", label: "Late night", hk: "夜晚", blurb: "The ones you hope you don't need" },
];

/** Maps an hour (0–23) onto the deck you're most likely to need in it. */
export function touristSlot(hour: number): Slot {
  if (hour >= 5 && hour < 11) return SLOTS[0]; // breakfast
  if (hour >= 11 && hour < 15) return SLOTS[1]; // getting around
  if (hour >= 15 && hour < 19) return SLOTS[2]; // markets are open
  if (hour >= 19) return SLOTS[3]; // dinner
  return SLOTS[4]; // 00:00–04:59
}

export function slotDeck(slot: Slot): Deck {
  return DECKS.find((d) => d.id === slot.deckId) ?? DECKS[0];
}

/** `n` phrases from a deck, rotating by day rather than by render — the card
    has to hold still long enough to be read, but be worth looking at tomorrow. */
export function slotPhrases(deck: Deck, dayStr: string, n = 3): Card[] {
  const cards = deck.cards;
  if (!cards.length) return [];
  const take = Math.min(n, cards.length);
  const start = hashStr(dayStr + ":" + deck.id) % cards.length;
  return Array.from({ length: take }, (_, i) => cards[(start + i) % cards.length]);
}
