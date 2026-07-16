import { useState } from "react";
import { useStore } from "../lib/store";
import { speak } from "../lib/speech";
import { LESSONS } from "../data/chars";
import type { CharLesson, ConceptItem, PictItem, StoryItem, RadicalItem, WordItem, QuizQ } from "../data/types";
import { Jyutping } from "../components/Jyutping";
import { Speaker } from "../components/Speaker";
import { MarkButton, ProgressBar } from "../components/common";
import { LessonPathHome } from "../components/LessonPathHome";
import { IconChevronLeft } from "../components/icons";

const ACCENT = "var(--chars)";

export function Characters() {
  const [openId, setOpenId] = useState<string | null>(null);
  const known = useStore((s) => s.known);
  const km = known.chars || {};
  const lessonDone = (l: CharLesson) => l.items.reduce((n, _it, i) => n + (km[l.id + ":" + i] ? 1 : 0), 0);

  if (openId) {
    const idx = LESSONS.findIndex((l) => l.id === openId);
    return <CharLessonView lesson={LESSONS[idx]} next={LESSONS[idx + 1]} onBack={() => setOpenId(null)} onNext={() => setOpenId(LESSONS[idx + 1]?.id ?? null)} />;
  }

  return (
    <LessonPathHome
      eyebrow="Reading branch · optional side trip"
      title="Learn the Characters"
      hk="認字"
      accent={ACCENT}
      intro="Zero experience needed. We start with characters that are still pictures, snap them into stories, and finish with you actually reading words from the course."
      finaleHk="識睇喇!"
      finaleText="Finish all seven steps and menus, signs and flashcards stop being decoration — you'll see the pictures inside."
      lessons={LESSONS.map((l, i) => ({ id: l.id, idx: i, title: l.title, sub: (l.badge.split("·")[1] || "").trim(), done: lessonDone(l), total: l.items.length }))}
      onOpen={setOpenId}
    />
  );
}

function CharLessonView({ lesson, next, onBack, onNext }: { lesson: CharLesson; next?: CharLesson; onBack: () => void; onNext: () => void }) {
  const known = useStore((s) => s.known);
  const setKnown = useStore((s) => s.setKnown);
  const setDeckKnown = useStore((s) => s.setDeckKnown);
  const km = known.chars || {};
  const done = lesson.items.reduce((n, _it, i) => n + (km[lesson.id + ":" + i] ? 1 : 0), 0);
  const isOn = (i: number) => !!km[lesson.id + ":" + i];
  const toggle = (i: number) => setKnown("chars", lesson.id + ":" + i, !isOn(i));
  const allDone = done === lesson.items.length;

  return (
    <div>
      <div className="flex items-center gap-3.5 pt-6 pb-1.5">
        <button onClick={onBack} aria-label="Back to steps" className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-line2 bg-surface text-ink2 hover:border-chars">
          <IconChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[.16em]" style={{ color: ACCENT }}>{lesson.badge}</div>
          <h2 className="font-disp text-[22px] font-extrabold leading-[1.05]">{lesson.title}</h2>
        </div>
      </div>
      <p className="my-3 max-w-[62ch] text-[15px] text-ink2">{lesson.intro}</p>
      <ProgressBar done={done} total={lesson.items.length} accent={ACCENT} label="" />

      {lesson.type === "concept" &&
        (lesson.items as ConceptItem[]).map((it, i) => (
          <div key={i} className={"mb-2.5 flex gap-3 rounded-[15px] border border-line2 bg-surface p-4 " + (isOn(i) ? "opacity-70" : "")}>
            <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} label="Mark read" />
            <div>
              <h4 className="mb-1 font-disp text-[15px] font-bold">{it[0]}</h4>
              <p className="text-[13.5px] text-ink2">{it[1]}</p>
            </div>
          </div>
        ))}

      {lesson.type === "pict" &&
        (lesson.items as PictItem[]).map((it, i) => (
          <div key={i} className={"mb-2.5 flex items-center gap-4 rounded-[18px] border border-line2 bg-surface p-[14px_15px] " + (isOn(i) ? "opacity-70" : "")}>
            <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[14px] bg-surface2 text-[27px]">{it.pic}</div>
            <div className="shrink-0 text-center font-hk text-[44px] font-bold leading-none">{it.han}</div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold">
                {it.en} <Jyutping jp={it.jp} className="ml-1.5 text-[13px] font-medium" />
              </div>
              <div className="mt-0.5 text-xs text-mut">{it.story}</div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <Speaker text={it.han} className="h-9 w-9" />
              <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} />
            </div>
          </div>
        ))}

      {lesson.type === "story" &&
        (lesson.items as StoryItem[]).map((it, i) => (
          <div key={i} className={"mb-3 rounded-[18px] border border-line2 bg-surface p-4 " + (isOn(i) ? "opacity-70" : "")}>
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2.5">
              {it.parts.map((p, pi) => (
                <div key={pi} className="flex items-center gap-2.5">
                  <div className="text-center">
                    <span className="block rounded-xl border border-line2 bg-surface2 px-3 py-1.5 font-hk text-[30px] font-bold">{p}</span>
                    <small className="mt-1 block max-w-[11ch] text-[10px] text-mut">{it.pen[pi]}</small>
                  </div>
                  <span className="font-disp text-xl font-extrabold text-mut">+</span>
                </div>
              ))}
              <span className="font-disp text-xl font-extrabold text-mut">=</span>
              <div className="text-center">
                <span className="block rounded-xl border px-3.5 py-1.5 font-hk text-[36px] font-bold" style={{ background: "color-mix(in srgb, var(--chars) 14%, transparent)", borderColor: ACCENT, color: ACCENT }}>
                  {it.han}
                </span>
                <small className="mt-1 block text-[10px] text-mut">{it.en}</small>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[14.5px] font-semibold">
                  {it.en} <Jyutping jp={it.jp} className="ml-1.5 text-[13px] font-medium" />
                </div>
                <div className="mt-0.5 text-[12.5px] text-mut">{it.story}</div>
              </div>
              <Speaker text={it.han} className="h-9 w-9" />
              <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} />
            </div>
          </div>
        ))}

      {lesson.type === "radical" &&
        (lesson.items as RadicalItem[]).map((it, i) => (
          <div key={i} className={"mb-3 rounded-[18px] border border-line2 bg-surface p-[15px_16px] " + (isOn(i) ? "opacity-70" : "")}>
            <div className="mb-2.5 flex items-center gap-3">
              <span className="grid h-[56px] w-[56px] shrink-0 place-items-center rounded-xl bg-surface2 font-hk text-[34px] font-bold" style={{ color: ACCENT }}>{it.rad}</span>
              <div className="flex-1">
                <b className="block font-disp text-[15px] font-bold">{it.name}</b>
                <p className="mt-0.5 text-[12.5px] text-ink2">{it.note}</p>
              </div>
              <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {it.ex.map((e, j) => (
                <button key={j} onClick={() => speak(e[0])} className="flex items-center gap-2.5 rounded-[11px] border border-line2 bg-surface2 px-3 py-2">
                  <span className="font-hk text-[22px] font-bold">{e[0]}</span>
                  <span className="text-left">
                    <Jyutping jp={e[1]} className="font-mono text-[11.5px]" />
                    <span className="block text-[11px] text-mut">{e[2]}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

      {lesson.type === "read" &&
        (lesson.items as WordItem[]).map((c, i) => (
          <div key={i} className={"mb-2.5 flex items-center gap-3.5 rounded-[16px] border border-line2 bg-surface p-[14px_15px] " + (isOn(i) ? "opacity-70" : "")}>
            <div className="min-w-[2.2em] shrink-0 font-hk text-[32px] font-bold leading-none">{c[0]}</div>
            <div className="min-w-0 flex-1">
              <Jyutping jp={c[1]} className="text-[14px]" />
              <div className="text-[13.5px] text-ink2">{c[2]}</div>
              {c[3] && <div className="mt-0.5 text-[11.5px] italic text-mut">{c[3]}</div>}
            </div>
            <Speaker text={c[0]} className="h-9 w-9" />
            <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} />
          </div>
        ))}

      {lesson.quiz && <QuickCheck quiz={lesson.quiz} />}

      <div className="mt-5 flex items-center gap-2.5">
        <button
          onClick={() => setDeckKnown("chars", lesson.items.map((_it, i) => lesson.id + ":" + i), !allDone)}
          className="flex-1 rounded-[13px] py-3.5 font-disp text-sm font-bold text-bg"
          style={{ background: ACCENT }}
        >
          {allDone ? "✓ Step complete" : "Mark all learned"}
        </button>
        {next && (
          <button onClick={onNext} className="rounded-[13px] bg-surface2 px-5 py-3.5 font-disp text-sm font-bold text-ink">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

function QuickCheck({ quiz }: { quiz: QuizQ[] }) {
  return (
    <div className="my-5 rounded-[18px] border border-line2 p-[17px]" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--chars) 8%, transparent), color-mix(in srgb, var(--t4) 8%, transparent))" }}>
      <h4 className="mb-3 flex items-center gap-2 font-disp text-sm font-extrabold tracking-[.02em]">
        <span className="h-2 w-2 rotate-45 rounded-[2px]" style={{ background: ACCENT }} />
        Quick check — no pressure, guess away
      </h4>
      <div className="flex flex-col gap-3.5">
        {quiz.map((q, qi) => (
          <QuickQ key={qi} q={q} />
        ))}
      </div>
    </div>
  );
}

function QuickQ({ q }: { q: QuizQ }) {
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);
  const isText = q.opts[0].length > 4 || /[a-z]/.test(q.opts[0]);
  const prompt = q.q.includes("?") || q.q.includes(":") ? q.q : null;
  return (
    <div>
      <div className="mb-2 text-[13.5px] text-ink2">
        {prompt ?? (
          <>
            Tap the character for <b className="text-ink">{q.q}</b>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {q.opts.map((o, oi) => {
          const wrong = picked.has(oi);
          const right = solved && oi === q.ok;
          return (
            <button
              key={oi}
              disabled={solved || wrong}
              onClick={() => {
                if (oi === q.ok) {
                  setSolved(true);
                  if (/[一-鿿]/.test(o)) speak(o);
                } else setPicked((p) => new Set(p).add(oi));
              }}
              className={
                "min-w-[72px] flex-1 rounded-xl border-[1.5px] px-2 py-2.5 " +
                (isText ? "font-body text-[13px] font-medium" : "font-hk text-xl font-semibold") +
                (right ? " border-t3 bg-[color-mix(in_srgb,var(--t3)_15%,transparent)] text-t3" : wrong ? " animate-shake border-t1 bg-[color-mix(in_srgb,var(--t1)_12%,transparent)] text-t1" : " border-line bg-surface2 text-ink")
              }
            >
              {o}
            </button>
          );
        })}
      </div>
      {solved && <div className="mt-1 text-[12.5px] font-semibold text-t3">好嘢! Got it.</div>}
    </div>
  );
}
