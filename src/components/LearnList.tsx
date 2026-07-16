import { useStore } from "../lib/store";
import type { Card } from "../data/types";
import { Jyutping } from "./Jyutping";
import { Speaker } from "./Speaker";
import { MarkButton, ProgressBar } from "./common";

/** A deck's cards as a scannable list with tap-to-hear + mark-learned. */
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
  const km = known[ns] || {};
  const done = cards.reduce((n, _c, i) => n + (km[keyPrefix + i] ? 1 : 0), 0);

  return (
    <div>
      <ProgressBar done={done} total={cards.length} accent={accent} label="learned" />
      <div className="flex flex-col gap-[9px]">
        {cards.map((c, i) => {
          const [han, jp, en, note] = c;
          const key = keyPrefix + i;
          const on = !!km[key];
          return (
            <div
              key={i}
              className={"flex items-center gap-3.5 rounded-[14px] border border-line2 bg-surface p-[13px_14px] " + (on ? "opacity-70" : "")}
            >
              <div className="min-w-[1.6em] shrink-0 font-hk text-[28px] font-semibold leading-none">{han}</div>
              <div className="min-w-0 flex-1">
                <Jyutping jp={jp} className="text-[14.5px]" />
                <div className="mt-px text-[13.5px] text-ink2">{en}</div>
                {note && <div className="mt-[3px] text-xs italic text-mut">{note}</div>}
              </div>
              <div className="flex shrink-0 gap-[7px]">
                <Speaker text={han} className="h-[38px] w-[38px]" />
                <MarkButton on={on} accent={accent} onClick={() => setKnown(ns, key, !on)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
