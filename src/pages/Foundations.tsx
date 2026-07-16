import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { speak } from "../lib/speech";
import { LESSONS } from "../data/found";
import type { FoundationLesson, ToneItem, SoundItem, ConceptItem, WordItem } from "../data/types";
import { Jyutping } from "../components/Jyutping";
import { Speaker } from "../components/Speaker";
import { MarkButton, ProgressBar, Keynote } from "../components/common";
import { LessonPathHome } from "../components/LessonPathHome";
import { IconChevronLeft, IconSpeaker } from "../components/icons";

const ACCENT = "var(--l0)";

export function Foundations() {
  const [openId, setOpenId] = useState<string | null>(null);
  const known = useStore((s) => s.known);
  const km = known.found || {};
  const lessonDone = (l: FoundationLesson) => l.items.reduce((n, _it, i) => n + (km[l.id + ":" + i] ? 1 : 0), 0);

  if (openId) {
    const idx = LESSONS.findIndex((l) => l.id === openId);
    return (
      <LessonView
        lesson={LESSONS[idx]}
        next={LESSONS[idx + 1]}
        onBack={() => setOpenId(null)}
        onNext={() => setOpenId(LESSONS[idx + 1]?.id ?? null)}
      />
    );
  }

  return (
    <LessonPathHome
      eyebrow="Zone L0 · before the basics"
      title="Foundations"
      hk="入門"
      accent={ACCENT}
      intro="Six short lessons that take you from zero to ready for the Basics. Start at the top — sounds and tones first, then your first words."
      finaleHk="準備好喇!"
      finaleText="Finish all six and you'll have the ears, sounds and first words you need — then jump into Basics."
      lessons={LESSONS.map((l, i) => ({
        id: l.id,
        idx: i,
        title: l.title,
        sub: (l.badge.split("·")[1] || "").trim(),
        done: lessonDone(l),
        total: l.items.length,
      }))}
      onOpen={setOpenId}
    />
  );
}

function LessonView({
  lesson,
  next,
  onBack,
  onNext,
}: {
  lesson: FoundationLesson;
  next?: FoundationLesson;
  onBack: () => void;
  onNext: () => void;
}) {
  const known = useStore((s) => s.known);
  const setKnown = useStore((s) => s.setKnown);
  const setDeckKnown = useStore((s) => s.setDeckKnown);
  const km = known.found || {};
  const done = lesson.items.reduce((n, _it, i) => n + (km[lesson.id + ":" + i] ? 1 : 0), 0);
  const isOn = (i: number) => !!km[lesson.id + ":" + i];
  const toggle = (i: number) => setKnown("found", lesson.id + ":" + i, !isOn(i));
  const allDone = done === lesson.items.length;

  return (
    <div>
      <div className="flex items-center gap-3.5 pt-6 pb-1.5">
        <button onClick={onBack} aria-label="Back to lessons" className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-line2 bg-surface text-ink2 hover:border-l0">
          <IconChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[.16em]" style={{ color: ACCENT }}>{lesson.badge}</div>
          <h2 className="font-disp text-[22px] font-extrabold leading-[1.05]">{lesson.title}</h2>
        </div>
      </div>
      <p className="my-3 max-w-[62ch] text-[15px] text-ink2">{lesson.intro}</p>
      <ProgressBar done={done} total={lesson.items.length} accent={ACCENT} label="" />

      {lesson.keynote && (
        <Keynote title={lesson.keynote[0]} accent={ACCENT}>
          <span dangerouslySetInnerHTML={{ __html: lesson.keynote[1] }} />
        </Keynote>
      )}

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

      {lesson.type === "tone" && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[11px]">
          {(lesson.items as ToneItem[]).map((t, i) => (
            <div key={i} className={"rounded-[15px] border border-line2 bg-surface p-[15px] " + (isOn(i) ? "opacity-70" : "")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-disp text-[14.5px] font-extrabold" style={{ color: `var(--t${t.n})` }}>Tone {t.n}</div>
                  <div className="text-xs text-mut">{t.name}</div>
                </div>
                <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} label="Mark learned" />
              </div>
              <ToneCurveMini pts={t.pts} n={t.n} />
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold" style={{ color: `var(--t${t.n})` }}>{t.syl}</span>
                <span className="font-hk text-sm text-ink2">{t.han}</span>
                <button onClick={() => speak(t.han.split(" ")[0])} aria-label="Hear it" className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-line bg-surface2 text-ink2 hover:border-l0">
                  <IconSpeaker className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lesson.type === "sound" &&
        (lesson.items as SoundItem[]).map((s, i) => (
          <div key={i} className={"mb-2.5 rounded-[15px] border border-line2 bg-surface p-4 " + (isOn(i) ? "opacity-70" : "")}>
            <div className="mb-2.5 flex items-center gap-3">
              <span className="font-mono text-xl font-bold text-l0">{s.jp}</span>
              <span className="flex-1 text-[13px] text-ink2">{s.note}</span>
              <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} label="Mark learned" />
            </div>
            <div className="flex flex-wrap gap-2">
              {s.ex.map((e, j) => (
                <button key={j} onClick={() => speak(e[0])} className="flex items-center gap-2.5 rounded-[11px] border border-line2 bg-surface2 px-3 py-2">
                  <span className="font-hk text-xl font-bold">{e[0]}</span>
                  <span className="text-left">
                    <Jyutping jp={e[1]} className="font-mono text-[12px]" />
                    <span className="block text-[11.5px] text-mut">{e[2]}</span>
                  </span>
                  <IconSpeaker className="h-3.5 w-3.5 text-mut" />
                </button>
              ))}
            </div>
          </div>
        ))}

      {lesson.type === "word" &&
        (lesson.items as WordItem[]).map((c, i) => (
          <div key={i} className={"mb-2.5 flex items-center gap-3.5 rounded-[14px] border border-line2 bg-surface p-[13px_14px] " + (isOn(i) ? "opacity-70" : "")}>
            <div className="min-w-[1.6em] shrink-0 font-hk text-[28px] font-bold leading-none">{c[0]}</div>
            <div className="min-w-0 flex-1">
              <Jyutping jp={c[1]} className="text-[14.5px]" />
              <div className="text-[13.5px] text-ink2">{c[2]}</div>
              {c[3] && <div className="mt-0.5 text-xs italic text-mut">{c[3]}</div>}
            </div>
            <Speaker text={c[0]} className="h-[38px] w-[38px]" />
            <MarkButton on={isOn(i)} accent={ACCENT} onClick={() => toggle(i)} />
          </div>
        ))}

      <div className="mt-5 flex items-center gap-2.5">
        <button
          onClick={() => setDeckKnown("found", lesson.items.map((_it, i) => lesson.id + ":" + i), !allDone)}
          className="flex-1 rounded-[13px] py-3.5 font-disp text-sm font-bold text-bg"
          style={{ background: ACCENT }}
        >
          {allDone ? "✓ Lesson complete" : "Mark all complete"}
        </button>
        {next && (
          <button onClick={onNext} className="rounded-[13px] bg-surface2 px-5 py-3.5 font-disp text-sm font-bold text-ink">
            Next →
          </button>
        )}
      </div>
      {!next && (
        <p className="mt-4 text-center text-xs text-mut">
          That's the foundations done — next stop, <Link to="/basics" className="text-l0">Basics</Link>.
        </p>
      )}
    </div>
  );
}

function ToneCurveMini({ pts, n }: { pts: number[][]; n: number }) {
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 54" preserveAspectRatio="none" className="my-2 block h-12 w-full" aria-hidden>
      <line x1="6" y1="6" x2="6" y2="48" stroke="var(--line)" strokeWidth={1} />
      <line x1="6" y1="27" x2="94" y2="27" stroke="var(--line)" strokeWidth={1} strokeDasharray="3 3" />
      <path d={d} fill="none" stroke={`var(--t${n})`} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3.6} fill={`var(--t${n})`} />
    </svg>
  );
}
