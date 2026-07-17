import { useState } from "react";
import { useStore } from "../lib/store";
import type { Card } from "../data/types";
import { Jyutping } from "./Jyutping";
import { Speaker } from "./Speaker";
import { ShowCard } from "./ShowCard";
import { MarkButton, ProgressBar } from "./common";

/** Short words sit beside their reading; a whole sentence gets its own line,
    because squeezing one into a side column shreds the jyutping. */
const isPhrase = (han: string) => han.length > 4;

/** A deck's cards as a scannable list with tap-to-hear + mark-learned.
    Tapping the 漢字 fills the screen with it, for showing someone. */
export function LearnList({
  ns,
  cards,
  keyPrefix,
  accent,
}: {
  ns: string;
  cards: Card[];
  keyPrefix: string;
  accent: string;
}) {
  const known = useStore((s) => s.known);
  const setKnown = useStore((s) => s.setKnown);
  const setDeckKnown = useStore((s) => s.setDeckKnown);
  const [show, setShow] = useState<Card | null>(null);
  const km = known[ns] || {};
  const done = cards.reduce((n, _c, i) => n + (km[keyPrefix + i] ? 1 : 0), 0);
  const allDone = done === cards.length;

  return (
    <div>
      <ProgressBar done={done} total={cards.length} accent={accent} label="learned" />
      <button
        onClick={() => setDeckKnown(ns, cards.map((_c, i) => keyPrefix + i), !allDone)}
        className={
          "mb-3.5 w-full rounded-[13px] py-3 font-disp text-[13.5px] font-bold " +
          (allDone ? "bg-surface2 text-ink2" : "text-bg")
        }
        style={allDone ? undefined : { background: accent }}
      >
        {allDone ? "✓ All learned — tap to clear" : "Mark all learned"}
      </button>
      <p className="mb-3 px-1 text-[11px] text-mut">
        Tap any <span className="font-hk text-ink2">漢字</span> to fill the screen with it — for
        showing someone.
      </p>
      <div className="flex flex-col gap-[9px]">
        {cards.map((c, i) => {
          const [han, jp, en, note] = c;
          const key = keyPrefix + i;
          const on = !!km[key];
          const phrase = isPhrase(han);

          const hanButton = (
            <button
              onClick={() => setShow(c)}
              aria-label={`Show ${en} full screen`}
              className={
                "shrink-0 text-left font-hk font-semibold " +
                (phrase ? "text-[22px] leading-snug" : "min-w-[1.6em] text-[28px] leading-none")
              }
            >
              {han}
            </button>
          );
          const buttons = (
            <div className="flex shrink-0 gap-[7px]">
              <Speaker text={han} className="h-[38px] w-[38px]" />
              <MarkButton on={on} accent={accent} onClick={() => setKnown(ns, key, !on)} />
            </div>
          );
          const meaning = (
            <div className="min-w-0 flex-1">
              <Jyutping jp={jp} className="text-[14.5px]" />
              <div className="mt-px text-[13.5px] text-ink2">{en}</div>
              {note && <div className="mt-[3px] text-xs italic text-mut">{note}</div>}
            </div>
          );

          return (
            <div
              key={i}
              className={
                "rounded-[14px] border border-line2 bg-surface p-[13px_14px] " +
                (on ? "opacity-70" : "")
              }
            >
              {phrase ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    {hanButton}
                    {buttons}
                  </div>
                  {meaning}
                </div>
              ) : (
                <div className="flex items-center gap-3.5">
                  {hanButton}
                  {meaning}
                  {buttons}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {show && <ShowCard han={show[0]} jp={show[1]} en={show[2]} onClose={() => setShow(null)} />}
    </div>
  );
}
