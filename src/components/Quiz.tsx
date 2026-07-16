import { useMemo, useState } from "react";
import { speak } from "../lib/speech";
import type { Card } from "../data/types";
import { Jyutping } from "./Jyutping";

interface Q {
  han: string;
  jp: string;
  en: string;
  opts: string[];
  ok: number;
}

const shuffle = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);

function buildQuestions(pool: Card[]): Q[] {
  return shuffle(pool).map((c) => {
    const en = c[2];
    const distractors = shuffle(pool.filter((x) => x[2] !== en))
      .slice(0, 3)
      .map((x) => x[2]);
    const opts = shuffle([en, ...distractors]);
    return { han: c[0], jp: c[1], en, opts, ok: opts.indexOf(en) };
  });
}

/** Multiple-choice quiz: hear/read the character, pick the meaning. */
export function Quiz({ pool, accent }: { pool: Card[]; accent: string }) {
  const questions = useMemo(() => buildQuestions(pool), [pool]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  if (idx >= questions.length) {
    return (
      <div className="rounded-[20px] border border-line2 bg-surface p-[34px_24px] text-center">
        <div className="font-disp text-[52px] font-extrabold leading-none" style={{ color: accent }}>
          {score}/{questions.length}
        </div>
        <p className="mt-2 text-ink2">Nicely done.</p>
        <button
          onClick={() => {
            setIdx(0);
            setScore(0);
            setPicked(null);
          }}
          className="mt-4 rounded-xl py-3 px-6 font-disp text-sm font-bold text-bg"
          style={{ background: accent }}
        >
          Again
        </button>
      </div>
    );
  }

  const q = questions[idx];
  const answered = picked !== null;

  return (
    <div>
      <div className="mb-4 font-disp text-[19px] font-extrabold">
        <span style={{ color: accent }}>{score}</span> correct
      </div>
      <div className="mb-3.5 rounded-[18px] border border-line2 bg-surface p-[26px] text-center">
        <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[.16em] text-mut">what does it mean?</div>
        <button onClick={() => speak(q.han)} className="font-hk text-[clamp(40px,12vw,62px)] font-bold leading-[1.1]">
          {q.han}
        </button>
        <Jyutping jp={q.jp} className="mt-2.5 block font-mono text-base" />
      </div>
      <div className="flex flex-col gap-[9px]">
        {q.opts.map((o, i) => {
          let cls = "border-line bg-surface text-ink";
          if (answered) {
            if (i === q.ok) cls = "border-t3 bg-[color-mix(in_srgb,var(--t3)_18%,var(--surface))] text-t3 font-semibold";
            else if (i === picked) cls = "border-t1 bg-[color-mix(in_srgb,var(--t1)_14%,var(--surface))] text-t1";
          }
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => {
                setPicked(i);
                if (i === q.ok) setScore(score + 1);
              }}
              className={"rounded-[13px] border px-4 py-3.5 text-left text-[15px] transition-colors " + cls}
            >
              {o}
            </button>
          );
        })}
      </div>
      {answered && (
        <button
          onClick={() => {
            setIdx(idx + 1);
            setPicked(null);
          }}
          className="mt-3.5 w-full rounded-[13px] py-[15px] font-disp text-[15px] font-bold text-bg"
          style={{ background: accent }}
        >
          {idx + 1 >= questions.length ? "See score" : "Next →"}
        </button>
      )}
    </div>
  );
}
