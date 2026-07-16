import { useState } from "react";
import { useStore } from "../lib/store";
import { speak } from "../lib/speech";
import { KIN, DECKS as FAMILY, TIPS } from "../data/family";
import { LessonHeader, Tabs, type TabDef } from "../components/LessonChrome";
import { DeckChips, type Chip } from "../components/DeckChips";
import { LearnList } from "../components/LearnList";
import { TipsPanel } from "../components/LessonPanels";
import { Jyutping } from "../components/Jyutping";
import { MarkButton } from "../components/common";
import { IconSpeaker } from "../components/icons";

const ACCENT = "var(--fam)";
const TABS: TabDef[] = [
  { id: "kin", label: "Who's who", ji: "稱" },
  { id: "phrases", label: "Phrases", ji: "句" },
  { id: "tips", label: "Tips", ji: "貼士" },
];

export function FamilyLesson() {
  const [active, setActive] = useState("kin");
  return (
    <div>
      <LessonHeader eyebrow="Interchange · meeting the family" title="Meeting the Family" hk="見家長" accent={ACCENT} />
      <Tabs tabs={TABS} active={active} onChange={setActive} accent={ACCENT} />
      <div className="fade-up">
        {active === "kin" && <KinPanel />}
        {active === "phrases" && <PhrasesPanel />}
        {active === "tips" && <TipsPanel tips={TIPS} />}
      </div>
    </div>
  );
}

function KinPanel() {
  const [sel, setSel] = useState(0);
  const known = useStore((s) => s.known);
  const setKnown = useStore((s) => s.setKnown);
  const k = KIN[sel];
  const key = "kin:" + sel;
  const on = !!(known.family || {})[key];
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {KIN.map((kin, i) => {
          const active = i === sel;
          return (
            <button
              key={i}
              aria-pressed={active}
              onClick={() => setSel(i)}
              className={"rounded-full border px-3.5 py-2 text-[13px] font-semibold " + (active ? "text-bg" : "border-line bg-surface text-ink2")}
              style={active ? { background: ACCENT, borderColor: ACCENT } : undefined}
            >
              {kin.q}
            </button>
          );
        })}
      </div>
      <div className="rounded-[20px] border border-line2 bg-surface p-6 text-center">
        <div className="font-mono text-xs uppercase tracking-[.04em] text-mut">{k.q} — call them</div>
        <div className="my-1 font-hk text-[clamp(48px,15vw,76px)] font-bold leading-[1.05]" style={{ color: ACCENT }}>
          {k.han}
        </div>
        {k.jp && <Jyutping jp={k.jp} className="font-mono text-[clamp(16px,5vw,20px)] font-bold" />}
        <div className="mt-1.5 text-[14.5px] font-medium text-ink">{k.en}</div>
        {k.note && <p className="mx-auto mt-3 max-w-[42ch] text-[13px] text-ink2">{k.note}</p>}
        <div className="mt-4 flex items-center justify-center gap-2.5">
          {k.jp && (
            <button onClick={() => speak(k.han.split(" / ")[0])} className="flex items-center gap-2 rounded-[11px] border border-line bg-surface2 px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:border-fam">
              <IconSpeaker className="h-4 w-4" /> Hear it
            </button>
          )}
          <div className="flex items-center gap-2">
            <MarkButton on={on} accent={ACCENT} onClick={() => setKnown("family", key, !on)} label="Mark got it" />
            <span className="text-[13px] text-mut">{on ? "Got it" : "Mark got it"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhrasesPanel() {
  const [deckId, setDeckId] = useState(FAMILY[0].id);
  const known = useStore((s) => s.known);
  const km = known.family || {};
  const deck = FAMILY.find((d) => d.id === deckId) || FAMILY[0];
  const kp = "p:" + deck.id + ":";
  const chips: Chip[] = FAMILY.map((d) => {
    const p = "p:" + d.id + ":";
    return { id: d.id, label: d.name, total: d.cards.length, done: d.cards.reduce((n, _c, i) => n + (km[p + i] ? 1 : 0), 0) };
  });
  return (
    <div>
      <DeckChips chips={chips} current={deckId} onPick={setDeckId} accent={ACCENT} />
      <LearnList ns="family" cards={deck.cards} keyPrefix={kp} accent={ACCENT} />
    </div>
  );
}
