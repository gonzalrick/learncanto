import { Link } from "react-router-dom";
import { IconChevronLeft, IconChevronRight, IconCheck } from "./icons";

export interface PathLesson {
  id: string;
  idx: number;
  title: string;
  sub: string;
  done: number;
  total: number;
}

/** Shared "lesson path" home: progress ring, intro, stepping-stone list, finale. */
export function LessonPathHome({
  eyebrow,
  title,
  hk,
  accent,
  intro,
  finaleHk,
  finaleText,
  lessons,
  onOpen,
}: {
  eyebrow: string;
  title: string;
  hk: string;
  accent: string;
  intro: string;
  finaleHk: string;
  finaleText: string;
  lessons: PathLesson[];
  onOpen: (id: string) => void;
}) {
  const total = lessons.reduce((n, l) => n + l.total, 0);
  const done = lessons.reduce((n, l) => n + l.done, 0);
  const pct = total ? done / total : 0;
  const C = 2 * Math.PI * 19;

  return (
    <div>
      <header className="flex items-start gap-3 pt-6 pb-1.5">
        <Link to="/line" aria-label="Back to the line" className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-line2 bg-surface text-ink2 hover:border-acc hover:text-acc2">
          <IconChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="font-mono text-[10.5px] uppercase tracking-[.18em]" style={{ color: accent }}>{eyebrow}</div>
          <div className="mt-1 flex items-end justify-between gap-3">
            <h1 className="font-disp text-[clamp(24px,6vw,34px)] font-extrabold leading-[1.05] -tracking-[.02em]">
              {title} <span className="font-hk text-[.6em] font-bold" style={{ color: accent }}>{hk}</span>
            </h1>
            <div className="flex items-center gap-3 rounded-[15px] border border-line2 bg-surface px-3.5 py-2.5">
              <svg width="46" height="46" viewBox="0 0 46 46" aria-hidden>
                <circle cx="23" cy="23" r="19" fill="none" stroke="var(--line)" strokeWidth={5} />
                <circle cx="23" cy="23" r="19" fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} transform="rotate(-90 23 23)" />
              </svg>
              <div className="font-disp text-[15px] font-extrabold leading-[1.15]">
                {Math.round(pct * 100)}%
                <small className="block font-mono text-[10px] font-medium tracking-[.06em] text-mut">complete</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-4 rounded-2xl border border-line2 bg-surface p-[15px_17px] text-[14.5px] text-ink2">{intro}</div>

      <div className="relative mt-5 pl-2">
        <span className="absolute bottom-6 left-[34px] top-6 w-[3px] rounded-[3px] opacity-30" style={{ background: accent }} />
        {lessons.map((l) => {
          const complete = l.done === l.total;
          return (
            <button
              key={l.id}
              onClick={() => onOpen(l.id)}
              className="relative mb-3 flex w-full items-center gap-4 rounded-2xl border border-line2 bg-surface p-[14px_16px_14px_14px] text-left transition-transform hover:translate-x-0.5"
            >
              <span
                className="z-[1] grid h-[54px] w-[54px] shrink-0 place-items-center rounded-full border-2 font-disp text-[20px] font-extrabold"
                style={complete ? { background: accent, borderColor: accent, color: "var(--bg)" } : { background: "var(--surface2)", borderColor: "var(--line)", color: accent }}
              >
                {complete ? <IconCheck className="h-5 w-5" /> : l.idx}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-disp text-base font-bold">{l.title}</span>
                <span className="block text-[12.5px] text-mut">{l.sub}</span>
                <span className="mt-0.5 block text-[11.5px] font-semibold" style={{ color: accent }}>
                  {complete ? "Complete" : `${l.done} / ${l.total} done`}
                </span>
              </span>
              <IconChevronRight className="h-5 w-5 shrink-0 text-mut" />
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 rounded-2xl border border-line2 p-[18px] text-center" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 12%, transparent), color-mix(in srgb, var(--t4) 10%, transparent))` }}>
        <div className="font-hk text-2xl font-bold" style={{ color: accent }}>{finaleHk}</div>
        <p className="mt-1.5 text-sm text-ink2">{finaleText}</p>
      </div>
    </div>
  );
}
