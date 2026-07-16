import { useState, type ReactNode } from "react";
import type { Deck } from "../data/types";
import { LessonHeader, Tabs, type TabDef } from "../components/LessonChrome";
import { DeckChips, type Chip } from "../components/DeckChips";
import { LearnList } from "../components/LearnList";
import { Flashcards } from "../components/Flashcards";
import { Quiz } from "../components/Quiz";
import { useStore } from "../lib/store";
import { FamilyLesson } from "./Family";

import { DECKS as BASICS, TONES } from "../data/basics";
import { DECKS as BEYOND, SCENES, GRAMMAR } from "../data/beyond";
import { DECKS as CONV, PARTICLES, BUILDER, PATTERNS } from "../data/conv";
import {
  TonesPanel,
  ScenesPanel,
  GrammarPanel,
  ParticlesPanel,
  BuilderPanel,
  PatternsPanel,
} from "../components/LessonPanels";

interface ExtraTab {
  id: string;
  label: string;
  ji: string;
  where: "before" | "after";
  render: () => ReactNode;
}
interface Config {
  ns: string;
  accent: string;
  eyebrow: string;
  title: string;
  hk: string;
  decks: Deck[];
  keyPrefix: (deckId: string) => string;
  learnLabel: string;
  learnJi: string;
  extras: ExtraTab[];
}

const CONFIGS: Record<string, Config> = {
  basics: {
    ns: "basics", accent: "var(--l1)", eyebrow: "Zone L1 · survival words", title: "Basics", hk: "基礎",
    decks: BASICS, keyPrefix: (id) => id + ":", learnLabel: "Learn", learnJi: "學",
    extras: [{ id: "tones", label: "Tones", ji: "聲", where: "after", render: () => <TonesPanel tones={TONES} /> }],
  },
  beyond: {
    ns: "beyond", accent: "var(--l15)", eyebrow: "Zone L1.5 · build sentences", title: "Beyond the Basics", hk: "進階",
    decks: BEYOND, keyPrefix: (id) => id + ":", learnLabel: "Words", learnJi: "字",
    extras: [
      { id: "scenes", label: "Scenes", ji: "情景", where: "before", render: () => <ScenesPanel scenes={SCENES} /> },
      { id: "grammar", label: "Grammar", ji: "文法", where: "before", render: () => <GrammarPanel grammar={GRAMMAR} /> },
    ],
  },
  conversational: {
    ns: "conv", accent: "var(--l2)", eyebrow: "Zone L2 · sound local", title: "Conversational", hk: "講廣東話",
    decks: CONV, keyPrefix: (id) => id + ":", learnLabel: "Phrases", learnJi: "句",
    extras: [
      { id: "particles", label: "Particles", ji: "語氣", where: "before", render: () => <ParticlesPanel particles={PARTICLES} /> },
      { id: "builder", label: "Builder", ji: "砌句", where: "before", render: () => <BuilderPanel builder={BUILDER} /> },
      { id: "patterns", label: "Patterns", ji: "句式", where: "before", render: () => <PatternsPanel patterns={PATTERNS} /> },
    ],
  },
};

export function VocabLesson({ page }: { page: string }) {
  if (page === "family") return <FamilyLesson />;
  const cfg = CONFIGS[page];
  return <VocabCore cfg={cfg} />;
}

function VocabCore({ cfg }: { cfg: Config }) {
  const before = cfg.extras.filter((e) => e.where === "before");
  const after = cfg.extras.filter((e) => e.where === "after");
  const coreTabs: TabDef[] = [
    { id: "learn", label: cfg.learnLabel, ji: cfg.learnJi },
    { id: "cards", label: "Cards", ji: "咭" },
    { id: "quiz", label: "Quiz", ji: "測" },
  ];
  const tabs: TabDef[] = [...before.map((e) => ({ id: e.id, label: e.label, ji: e.ji })), ...coreTabs, ...after.map((e) => ({ id: e.id, label: e.label, ji: e.ji }))];

  const [active, setActive] = useState(tabs[0].id);
  const [deckId, setDeckId] = useState(cfg.decks[0].id);
  const known = useStore((s) => s.known);
  const km = known[cfg.ns] || {};

  const deck = cfg.decks.find((d) => d.id === deckId) || cfg.decks[0];
  const kp = cfg.keyPrefix(deck.id);
  const chips: Chip[] = cfg.decks.map((d) => {
    const p = cfg.keyPrefix(d.id);
    return { id: d.id, label: d.name, total: d.cards.length, done: d.cards.reduce((n, _c, i) => n + (km[p + i] ? 1 : 0), 0) };
  });

  const extra = cfg.extras.find((e) => e.id === active);

  return (
    <div>
      <LessonHeader eyebrow={cfg.eyebrow} title={cfg.title} hk={cfg.hk} accent={cfg.accent} />
      <Tabs tabs={tabs} active={active} onChange={setActive} accent={cfg.accent} />

      {extra ? (
        <div className="fade-up">{extra.render()}</div>
      ) : (
        <div className="fade-up">
          <DeckChips chips={chips} current={deckId} onPick={setDeckId} accent={cfg.accent} />
          {active === "learn" && <LearnList ns={cfg.ns} cards={deck.cards} keyPrefix={kp} accent={cfg.accent} />}
          {active === "cards" && (
            <Flashcards ns={cfg.ns} cards={deck.cards} keyPrefix={kp} deckName={deck.name} accent={cfg.accent} />
          )}
          {active === "quiz" && <Quiz pool={deck.cards} accent={cfg.accent} />}
        </div>
      )}
    </div>
  );
}
