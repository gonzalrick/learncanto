import { useEffect, useRef, useState } from "react";
import { useSession, type SessionItem } from "../lib/session-store";
import { useStore } from "../lib/store";
import { srsDueOn, todayNum } from "../lib/srs";
import { isWild } from "../lib/vocab-lookup";
import { dstr } from "../lib/streak";
import { speak, cancelSpeech } from "../lib/speech";
import { ding } from "../lib/sfx";
import { Jyutping } from "./Jyutping";
import { IconX, IconSpeaker, IconPlay, IconSlow } from "./icons";

type Stats = { rev: number; fresh: number; ear: number; char: number; num: number };

/** Thin wrapper: mounts a fresh SessionRunner (keyed by runId) whenever a
    session opens, so the runner initializes its queue synchronously. */
export function SessionOverlay() {
  const active = useSession((s) => s.active);
  const items = useSession((s) => s.items);
  const kind = useSession((s) => s.kind);
  const runId = useSession((s) => s.runId);
  const close = useSession((s) => s.close);
  if (!active) return null;
  return <SessionRunner key={runId} items={items} kind={kind} close={close} />;
}

function SessionRunner({
  items,
  kind,
  close,
}: {
  items: SessionItem[];
  kind: "run" | "drill";
  close: () => void;
}) {
  const grade = useStore((s) => s.grade);
  const introduce = useStore((s) => s.introduce);
  const logDay = useStore((s) => s.logDay);

  const [queue, setQueue] = useState<SessionItem[]>(() => items);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const stats = useRef<Stats>({ rev: 0, fresh: 0, ear: 0, char: 0, num: 0 });
  const doneInfo = useRef<{ prevStreak: number; newStreak: number; hadToday: boolean; dueTomorrow: number } | null>(null);

  // Browser/hardware back closes the session.
  useEffect(() => {
    const onPop = () => close();
    window.history.pushState({ session: true }, "");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [close]);

  const finish = () => {
    const st = useStore.getState();
    const hadToday = !!st.days.days[dstr(0)];
    const prevStreak = st.days.streak;
    if (kind === "run") logDay();
    const after = useStore.getState();
    doneInfo.current = {
      prevStreak,
      newStreak: after.days.streak,
      hadToday,
      dueTomorrow: srsDueOn(after.srs, todayNum() + 1),
    };
    setDone(true);
  };

  const advance = () => {
    setFlipped(false);
    if (pos + 1 >= queue.length) finish();
    else setPos(pos + 1);
  };

  const close2 = () => {
    cancelSpeech();
    close();
  };

  const it = queue[pos];
  const s = stats.current;
  const totalStrength = s.rev + s.fresh + s.ear + s.char + s.num;
  if (!done && !it) return null; // empty queue guard (shouldn't happen for real sessions)

  return (
    <div
      className="fixed inset-0 z-50 mx-auto flex max-w-[560px] flex-col bg-bg"
      style={{
        paddingTop: "calc(14px + env(safe-area-inset-top))",
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
      }}
    >
      {/* top bar: close + progress segments */}
      <div className="flex items-center gap-3 pt-1 pb-4">
        <button
          onClick={close2}
          aria-label="Close session"
          className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border border-line2 bg-surface text-ink2"
        >
          <IconX className="h-[15px] w-[15px]" />
        </button>
        <div className="flex flex-1 gap-[5px]">
          {queue.map((_, i) => (
            <span
              key={i}
              className="h-[5px] flex-1 rounded-[3px] transition-colors"
              style={{ background: i < pos || done ? "var(--acc)" : "var(--line)" }}
            />
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {done ? (
          <DoneScreen info={doneInfo.current!} isRun={kind === "run"} strengthened={totalStrength} onHome={close2} />
        ) : it.t === "recall" ? (
          <RecallCard
            key={pos}
            item={it}
            flipped={flipped}
            onFlip={() => {
              if (!flipped) {
                setFlipped(true);
                speak(it.w.han);
              }
            }}
            onAgain={() => {
              if (!it.graded) grade(it.id, false);
              setQueue((q) => [...q, { ...it, graded: true }]);
              advance();
            }}
            onGood={() => {
              if (!it.graded) {
                grade(it.id, true);
                stats.current.rev++;
              }
              advance();
            }}
          />
        ) : it.t === "new" ? (
          <NewCard
            key={pos}
            item={it}
            onNext={() => {
              introduce(it.id);
              stats.current.fresh++;
              advance();
            }}
          />
        ) : it.t === "listen" ? (
          <ListenCard
            key={pos}
            item={it}
            onCorrect={() => {
              stats.current.ear++;
              advance();
            }}
          />
        ) : it.t === "num" ? (
          <NumCard
            key={pos}
            item={it}
            onCorrect={() => {
              stats.current.num++;
              advance();
            }}
          />
        ) : (
          <CharCard
            key={pos}
            item={it}
            onCorrect={() => {
              stats.current.char++;
              advance();
            }}
          />
        )}
      </div>
    </div>
  );
}

const tagFor = (it: SessionItem) =>
  it.t === "recall" ? (
    isWild(it.id) ? (
      <>
        <span style={{ color: "var(--tourist)" }}>Your word</span> — caught in the wild
      </>
    ) : it.ear ? (
      <>
        <span className="text-acc2">Review</span> — by ear
      </>
    ) : (
      <>
        <span className="text-acc2">Review</span> — about to fade
      </>
    )
  ) : it.t === "new" ? (
    <>
      <span className="text-t3">New word</span>
      {it.stTitle ? " — from " + it.stTitle : ""}
    </>
  ) : it.t === "listen" ? (
    <>
      <span className="text-t4">Ear rep</span> — what did you hear?
    </>
  ) : it.t === "num" ? (
    <>
      <span className="text-dojo">Numbers</span> — no reading this one
    </>
  ) : (
    <>
      <span className="text-chars">Character</span> — what does it mean?
    </>
  );

/** The prompt a number rep opens with, by category. */
const numPrompt = (t: string) =>
  t === "price"
    ? "How much did they say?"
    : t === "time"
      ? "What time did they say?"
      : t === "qty"
        ? "How many did they say?"
        : "Which number did they say?";

const cardBase =
  "flex flex-1 flex-col items-center justify-center overflow-y-auto rounded-[26px] border border-line2 bg-surface p-[22px] text-center";
const tagBase = "mb-3 text-center font-mono text-[10px] uppercase tracking-[.2em] text-mut";
const actBtn = "flex-1 rounded-[15px] py-[15px] font-disp text-[15px] font-extrabold";

function pulse(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("spk-pulse");
  void el.offsetWidth;
  el.classList.add("spk-pulse");
}

function RecallCard({
  item,
  flipped,
  onFlip,
  onAgain,
  onGood,
}: {
  item: Extract<SessionItem, { t: "recall" }>;
  flipped: boolean;
  onFlip: () => void;
  onAgain: () => void;
  onGood: () => void;
}) {
  const w = item.w;
  // Audio-first reviews hide the characters until the card is flipped, so the
  // only cue is the sound — the way the word actually arrives on the street.
  // `peek` shows them without giving the meaning away, for when the ear fails.
  const [peek, setPeek] = useState(false);
  const earFront = !!item.ear && !flipped && !peek;
  const playRef = useRef<HTMLButtonElement>(null);
  // Flipping speaks too, so a fast tap could collide with the opening autoplay.
  const flippedRef = useRef(flipped);
  flippedRef.current = flipped;
  useEffect(() => {
    if (!item.ear) return;
    const t = setTimeout(() => {
      if (flippedRef.current) return;
      pulse(playRef.current);
      speak(w.han);
    }, 420);
    return () => clearTimeout(t);
  }, [item.ear, w.han]);
  return (
    <>
      <div className={tagBase}>{tagFor(item)}</div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Flip card"
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        }}
        className={cardBase + " cursor-pointer"}
      >
        {earFront ? (
          <button
            ref={playRef}
            aria-label="Play audio"
            onClick={(e) => {
              e.stopPropagation();
              pulse(playRef.current);
              speak(w.han);
            }}
            className="grid h-[78px] w-[78px] place-items-center rounded-full text-acc2"
            style={{ background: "color-mix(in srgb, var(--acc) 24%, var(--surface2))" }}
          >
            <IconPlay className="h-[31px] w-[31px]" />
          </button>
        ) : (
          <div className="font-hk text-[clamp(34px,11vw,54px)] font-semibold leading-[1.2]">{w.han}</div>
        )}
        {!flipped ? (
          item.ear ? (
            <div className="mt-[18px] flex flex-col items-center gap-3">
              <div className="text-xs text-mut">
                {peek ? "Tap the card — do you remember it?" : "Listen — do you know what it means?"}
              </div>
              {!peek && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPeek(true);
                  }}
                  className="rounded-full border border-line bg-surface2 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[.12em] text-mut"
                >
                  Show the characters
                </button>
              )}
            </div>
          ) : (
            <div className="mt-[18px] text-xs text-mut">Tap the card — do you remember it?</div>
          )
        ) : (
          <div className="mt-4 flex flex-col items-center gap-1.5">
            <Jyutping jp={w.jp} className="font-mono text-lg" />
            <div className="max-w-[34ch] text-[15px] text-ink2">{w.en}</div>
            {w.nt && <div className="max-w-[32ch] text-xs italic text-mut">{w.nt}</div>}
            <button
              aria-label="Hear it"
              onClick={(e) => {
                e.stopPropagation();
                pulse(e.currentTarget);
                speak(w.han);
              }}
              className="mt-3 grid h-[46px] w-[46px] place-items-center rounded-full bg-surface2 text-ink"
            >
              <IconSpeaker className="h-[19px] w-[19px]" />
            </button>
          </div>
        )}
      </div>
      {flipped && (
        <div className="flex gap-[11px] pt-4">
          <button onClick={onAgain} className={actBtn + " bg-surface2 text-ink2"}>
            Again
          </button>
          <button onClick={onGood} className={actBtn + " bg-acc text-onacc"}>
            Got it
          </button>
        </div>
      )}
    </>
  );
}

function NewCard({ item, onNext }: { item: Extract<SessionItem, { t: "new" }>; onNext: () => void }) {
  const w = item.w;
  useEffect(() => {
    speak(w.han);
  }, [w.han]);
  return (
    <>
      <div className={tagBase}>{tagFor(item)}</div>
      <div className={cardBase}>
        <div className="font-hk text-[clamp(34px,11vw,54px)] font-semibold leading-[1.2]">{w.han}</div>
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <Jyutping jp={w.jp} className="font-mono text-lg" />
          <div className="max-w-[34ch] text-[15px] text-ink2">{w.en}</div>
          {w.nt && <div className="max-w-[32ch] text-xs italic text-mut">{w.nt}</div>}
          <button
            aria-label="Hear it"
            onClick={(e) => {
              pulse(e.currentTarget);
              speak(w.han);
            }}
            className="mt-3 grid h-[46px] w-[46px] place-items-center rounded-full bg-surface2 text-ink"
          >
            <IconSpeaker className="h-[19px] w-[19px]" />
          </button>
        </div>
      </div>
      <div className="flex gap-[11px] pt-4">
        <button onClick={onNext} className={actBtn + " bg-t3 text-[#04160d]"}>
          Say it out loud → next
        </button>
      </div>
    </>
  );
}

function ListenCard({ item, onCorrect }: { item: Extract<SessionItem, { t: "listen" }>; onCorrect: () => void }) {
  const e = item.e;
  const playRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      pulse(playRef.current);
      speak(e.han);
    }, 420);
    return () => clearTimeout(t);
  }, [e.han]);
  return (
    <>
      <div className={tagBase}>{tagFor(item)}</div>
      <div className={cardBase}>
        <button
          ref={playRef}
          aria-label="Play audio"
          onClick={() => {
            pulse(playRef.current);
            speak(e.han);
          }}
          className="grid h-[78px] w-[78px] place-items-center rounded-full text-t4"
          style={{ background: "color-mix(in srgb, var(--t4) 24%, var(--surface2))" }}
        >
          <IconPlay className="h-[31px] w-[31px]" />
        </button>
        <div className="mt-4 flex flex-col items-center gap-[5px]">
          <span className="font-hk text-[clamp(30px,9vw,42px)] font-semibold leading-[1.2]">{e.han}</span>
          <Jyutping jp={e.jp} className="font-mono text-[15px]" />
        </div>
        <div className="mt-2.5 text-xs text-mut">Listen while you read it — then tap what it means.</div>
        <Choices opts={e.opts.map((o) => o.en)} ok={e.ok} onCorrect={onCorrect} />
      </div>
    </>
  );
}

/** Numbers by ear only: unlike the ear rep, the 漢字 stays hidden until the
    answer is in — on the street nobody shows you the price, they just say it.
    A slow replay is one tap away, because that's the real repair strategy. */
function NumCard({ item, onCorrect }: { item: Extract<SessionItem, { t: "num" }>; onCorrect: () => void }) {
  const n = item.n;
  const [revealed, setRevealed] = useState(false);
  const playRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      pulse(playRef.current);
      speak(n.han);
    }, 420);
    return () => clearTimeout(t);
  }, [n.han]);
  return (
    <>
      <div className={tagBase}>{tagFor(item)}</div>
      <div className={cardBase}>
        <div className="mb-4 text-[13.5px] text-ink2">{numPrompt(n.t)}</div>
        <button
          ref={playRef}
          aria-label="Play audio"
          onClick={() => {
            pulse(playRef.current);
            speak(n.han);
          }}
          className="grid h-[78px] w-[78px] place-items-center rounded-full text-dojo"
          style={{ background: "color-mix(in srgb, var(--dojo) 24%, var(--surface2))" }}
        >
          <IconPlay className="h-[31px] w-[31px]" />
        </button>
        <button
          onClick={() => speak(n.han, 0.5)}
          className="mt-3.5 flex items-center gap-1.5 rounded-full border border-line bg-surface2 px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[.12em] text-ink2"
        >
          <IconSlow className="h-3 w-3" />
          Slower
        </button>

        {revealed ? (
          <div className="mt-4 flex flex-col items-center gap-1">
            <span className="font-hk text-[26px] font-semibold leading-tight">{n.han}</span>
            <Jyutping jp={n.jp} className="font-mono text-[13px]" />
          </div>
        ) : (
          <div className="mt-4 text-xs text-mut">Listen — the characters come after you answer.</div>
        )}

        <Choices opts={n.opts} ok={n.ok} cols={2} onReveal={() => setRevealed(true)} onCorrect={onCorrect} />
      </div>
    </>
  );
}

function CharCard({ item, onCorrect }: { item: Extract<SessionItem, { t: "char" }>; onCorrect: () => void }) {
  const c = item.c;
  return (
    <>
      <div className={tagBase}>{tagFor(item)}</div>
      <div className={cardBase}>
        <button
          aria-label="Hear it"
          onClick={(ev) => {
            pulse(ev.currentTarget);
            speak(c.han);
          }}
          className="font-hk text-[clamp(46px,14vw,76px)] font-semibold leading-[1.1]"
        >
          {c.han}
        </button>
        <Jyutping jp={c.jp} className="mt-2 font-mono text-lg" />
        <div className="mt-2.5 text-xs text-mut">Tap the character to hear it — then tap what it means.</div>
        <Choices opts={c.opts} ok={c.ok} onCorrect={onCorrect} />
      </div>
    </>
  );
}

/** Multiple-choice answers: a right pick flashes green + chimes, then advances
    after a beat so the correct answer registers before the card changes.
    `onReveal` fires on that right pick, for cards that hold something back
    until it's answered; `cols` goes to 2 for short answers like prices. */
function Choices({
  opts,
  ok,
  onCorrect,
  onReveal,
  cols = 1,
}: {
  opts: string[];
  ok: number;
  onCorrect: () => void;
  onReveal?: () => void;
  cols?: 1 | 2;
}) {
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [right, setRight] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div
      className={
        "mt-[18px] grid w-full gap-2.5 " + (cols === 2 ? "grid-cols-2" : "grid-cols-1")
      }
    >
      {opts.map((o, i) => {
        const hit = right && i === ok;
        return (
          <button
            key={i}
            disabled={right || wrong.has(i)}
            onClick={() => {
              if (i !== ok) return setWrong((w) => new Set(w).add(i));
              setRight(true);
              onReveal?.();
              ding();
              timer.current = setTimeout(onCorrect, 750);
            }}
            className={
              "rounded-[14px] border-[1.5px] py-[13px] text-[15px] transition-colors " +
              (hit
                ? "border-t3 font-semibold text-t3"
                : wrong.has(i)
                  ? "animate-shake border-t1 text-t1"
                  : "border-line bg-surface2 text-ink")
            }
            style={
              hit
                ? { background: "color-mix(in srgb, var(--t3) 20%, var(--surface2))" }
                : wrong.has(i)
                  ? { background: "color-mix(in srgb, var(--t1) 14%, var(--surface2))" }
                  : undefined
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function DoneScreen({
  info,
  isRun,
  strengthened,
  onHome,
}: {
  info: { prevStreak: number; newStreak: number; hadToday: boolean; dueTomorrow: number };
  isRun: boolean;
  strengthened: number;
  onHome: () => void;
}) {
  const [ringOffset, setRingOffset] = useState(339.3);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setRingOffset(0)));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="relative mb-[22px] h-[132px] w-[132px]">
        <svg viewBox="0 0 132 132" className="h-[132px] w-[132px] -rotate-90">
          <circle cx="66" cy="66" r="54" fill="none" stroke="var(--line)" strokeWidth={9} />
          <circle
            cx="66"
            cy="66"
            r="54"
            fill="none"
            stroke="var(--acc)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={339.3}
            strokeDashoffset={ringOffset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,.8,.3,1)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-hk text-[30px] font-semibold">掂!</div>
      </div>
      <h3 className="mb-1.5 font-disp text-[23px] font-extrabold -tracking-[.02em]">
        {isRun ? "Terminus reached" : "Nice drill"}
      </h3>
      <div className="max-w-[28ch] text-[13.5px] text-ink2">
        {isRun ? "That's today's run — the map remembers." : "Logged to the same memory as your daily run."}
      </div>
      <div className="my-[22px] flex w-full flex-col gap-[9px]">
        {isRun && !info.hadToday && (
          <Stat label="Streak" value={`${info.prevStreak} → ${info.newStreak} days`} valueClass="text-acc2" />
        )}
        <Stat label="Words strengthened" value={String(strengthened)} />
        <Stat
          label="Coming due tomorrow"
          value={`${info.dueTomorrow} review${info.dueTomorrow === 1 ? "" : "s"}`}
          valueClass="text-t4"
        />
      </div>
      <button
        onClick={onHome}
        className="w-full rounded-2xl bg-surface2 py-[15px] font-disp text-base font-semibold text-ink"
      >
        Back to Today
      </button>
      {isRun && <p className="mt-3 text-[11px] text-mut">聽日見 — see you tomorrow.</p>}
    </div>
  );
}

function Stat({ label, value, valueClass = "text-ink" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between rounded-[14px] border border-line2 bg-surface px-4 py-3 text-[13.5px] text-ink2">
      <span>{label}</span>
      <b className={"font-disp text-[15px] font-extrabold " + valueClass}>{value}</b>
    </div>
  );
}
