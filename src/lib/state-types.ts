// Shared persisted-state shapes (fresh "v2" schema — no migration from the
// vanilla app's per-page keys).

export type KnownMap = Record<string, Record<string, 1>>; // namespace -> itemKey -> 1
export interface SrsEntry {
  d: number; // due day (integer day number)
  v: number; // current interval in days
}
export type Srs = Record<string, SrsEntry>; // vocabId ("ns|key") -> schedule
/** A word the user caught in the wild — off a menu, a sign, a conversation.
    Scheduled like course vocab, but its text lives here rather than in the
    static registry. */
export interface WildCard {
  han: string;
  jp: string;
  en: string;
  nt: string;
  ts: number;
}
export interface Days {
  days: Record<string, 1 | "shield">; // "YYYY-MM-DD" -> completed | shield-bridged
  streak: number;
  shields: number;
  last: string | null;
}
