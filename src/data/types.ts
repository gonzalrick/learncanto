// Shared vocab shapes. Tuple-ish rows are typed as string[] (rather than fixed
// tuples) so the ported literal data assigns cleanly; components destructure
// [han, jp, en, note] exactly as the original vanilla code did.

export type Card = string[]; // [han, jp, en, note?]
export interface Deck {
  id: string;
  name: string;
  han: string;
  cards: Card[];
}

/* ---- Foundations ---- */
export interface ToneItem {
  n: number;
  name: string;
  pts: number[][];
  syl: string;
  han: string;
  col?: string; // optional color var (basics TONES carries this; rendering derives from `n`)
}
export interface SoundItem {
  jp: string;
  note: string;
  ex: string[][];
}
export type ConceptItem = string[]; // [title, body]
export type WordItem = string[]; // [han, jp, en, note?]
export interface FoundationLesson {
  id: string;
  title: string;
  badge: string;
  type: "concept" | "tone" | "sound" | "word";
  intro: string;
  keynote?: string[];
  // polymorphic by `type` — narrowed in the Foundations component
  items: ConceptItem[] | ToneItem[] | SoundItem[] | WordItem[];
}

/* ---- Characters ---- */
export interface PictItem {
  han: string;
  jp: string;
  en: string;
  pic: string;
  story: string;
}
export interface StoryItem {
  parts: string[];
  pen: string[];
  han: string;
  jp: string;
  en: string;
  story: string;
}
export interface RadicalItem {
  rad: string;
  name: string;
  note: string;
  ex: string[][];
}
export interface QuizQ {
  q: string;
  opts: string[];
  ok: number;
}
export interface CharLesson {
  id: string;
  title: string;
  badge: string;
  type: "concept" | "pict" | "story" | "radical" | "read";
  intro: string;
  items: ConceptItem[] | PictItem[] | StoryItem[] | RadicalItem[] | WordItem[];
  quiz?: QuizQ[];
}

/* ---- Family ---- */
export interface KinEntry {
  q: string;
  han: string;
  jp: string;
  en: string;
  note: string;
}
export type Tip = string[]; // [title, bodyHtml]

/* ---- Beyond ---- */
export interface SceneLine {
  who: string;
  han: string;
  jp: string;
  en: string;
}
export interface Scene {
  id: string;
  title: string;
  where: string;
  lines: SceneLine[];
}
export interface GrammarTopic {
  topic: string;
  han: string;
  note: string;
  ex: string[][];
}

/* ---- Conversational ---- */
export interface Particle {
  ch: string;
  jp: string;
  gl: string;
  ex: string[];
}
export interface BuilderVariant {
  p: string;
  han: string;
  pp: string;
  jp: string;
  en: string;
}
export interface BuilderBase {
  id: string;
  baseEn: string;
  variants: BuilderVariant[];
}
export interface Pattern {
  f: string[];
  jp: string;
  m: string;
  eg: string[];
}

/* ---- Dojo ---- */
export type DojoItem = (string | number)[]; // [han, jp, en, level]
export interface DojoNum {
  han: string;
  jp: string;
  a: string;
  t: string;
}
