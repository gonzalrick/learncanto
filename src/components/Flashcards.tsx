import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { speak } from "../lib/speech";
import type { Card } from "../data/types";
import { Jyutping } from "./Jyutping";

/** Flip-card deck runner: see the character, guess, flip; "Got it" marks learned. */
export function Flashcards({
  ns,
  cards,
  keyPrefix,
  deckName,
  accent,
}: {
  ns: string;
  cards: Card[];
  keyPrefix: string;
  deckName: string;
  accent: string;
}) {
  const setKnown = useStore((s) => s.setKnown);
  const queue = useMemo(
    () => cards.map((c, i) => ({ c, i })).sort(() => Math.random() - 0.5),
    [cards],
  );
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (pos >= queue.length) {
    return (
      <div className="rounded-[20px] border border-line2 bg-surface p-[26px] text-center">
        <div className="font-hk text-[46px] font-semibold leading-none">✓</div>
        <p className="mt-3 text-[14px] text-ink2">
          You went through the whole deck — <b className="text-ink">{deckName}</b>.
        </p>
        <button
          onClick={() => {
            setPos(0);
            setFlipped(false);
          }}
          className="mt-4 rounded-xl bg-surface2 px-5 py-2.5 font-disp text-sm font-semibold text-ink"
        >
          Go again
        </button>
      </div>
    );
  }

  const { c, i } = queue[pos];
  const [han, jp, en, note] = c;
  const advance = (got: boolean) => {
    if (got) setKnown(ns, keyPrefix + i, true);
    setFlipped(false);
    setPos(pos + 1);
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!flipped) {
            setFlipped(true);
            speak(han);
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !flipped) {
            e.preventDefault();
            setFlipped(true);
            speak(han);
          }
        }}
        className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[20px] border border-line2 bg-surface p-[26px] text-center"
      >
        <div className="absolute-corner font-mono text-[11px] uppercase tracking-[.14em] text-mut">
          {pos + 1} / {queue.length}
        </div>
        {!flipped ? (
          <>
            <div className="font-hk text-[clamp(46px,14vw,82px)] font-bold leading-[1.1]">{han}</div>
            <div className="mt-[18px] font-mono text-[11px] uppercase tracking-[.16em] text-mut">tap to flip</div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <Jyutping jp={jp} className="font-mono text-[clamp(20px,6vw,28px)] font-bold" />
            <div className="text-[18px] text-ink2">{en}</div>
            {note && <div className="max-w-[32ch] text-[13px] italic text-mut">{note}</div>}
          </div>
        )}
      </div>
      {flipped && (
        <div className="mt-2.5 flex gap-2.5">
          <button
            onClick={() => advance(false)}
            className="flex-1 rounded-xl border border-line bg-surface py-[13px] font-disp text-sm font-semibold text-ink2 hover:border-acc hover:text-acc2"
          >
            Again
          </button>
          <button
            onClick={() => advance(true)}
            className="flex-1 rounded-xl py-[13px] font-disp text-sm font-semibold text-bg"
            style={{ background: accent }}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
