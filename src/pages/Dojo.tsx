import { useEffect, useMemo, useState } from "react";
import { ITEMS, NUMS } from "../data/dojo";
import type { DojoItem, DojoNum } from "../data/types";
import { speak, hasChineseVoice } from "../lib/speech";
import { Jyutping } from "../components/Jyutping";
import { LessonHeader, Tabs, type TabDef } from "../components/LessonChrome";
import { IconPlay, IconReplay, IconSlow } from "../components/icons";

const ACCENT = "var(--dojo)";
const TABS: TabDef[] = [
  { id: "listen", label: "Listen" },
  { id: "catch", label: "Catch it" },
  { id: "num", label: "Numbers" },
];
const PRESETS = [
  { r: 0.6, label: "🐢 Slow" },
  { r: 0.85, label: "Easy" },
  { r: 1, label: "Natural" },
  { r: 1.15, label: "⚡ Fast" },
];
const rnd = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const shuffle = <T,>(a: T[]) => a.slice().sort(() => Math.random() - 0.5);

export function Dojo() {
  const [rate, setRate] = useState(0.85);
  const [tab, setTab] = useState("listen");
  const noVoice = typeof window !== "undefined" && "speechSynthesis" in window && !hasChineseVoice();

  return (
    <div>
      <LessonHeader eyebrow="Train your ear · adjustable speed" title="Listening Dojo" hk="聽力訓練" accent={ACCENT} />
      <p className="mb-4 text-[14px] text-ink2">Hear it first, struggle, then reveal. Start slow; as it gets easy, push toward natural speed.</p>

      {noVoice && (
        <div className="mb-4 rounded-xl border border-t1 bg-[color-mix(in_srgb,var(--t1)_10%,transparent)] p-3 text-center text-[13px] text-t1">
          Your device has no Cantonese voice, so playback may be silent. Try Safari (iPhone/Mac) or Chrome (Android).
        </div>
      )}

      {/* speed bar */}
      <div className="sticky top-0 z-10 mb-4 rounded-[15px] border border-line2 bg-surface p-[13px_15px]">
        <div className="mb-2.5 flex justify-between font-mono text-[11px] uppercase tracking-[.14em] text-mut">
          <span>Playback speed</span>
          <b style={{ color: ACCENT }}>{rate.toFixed(2)}×</b>
        </div>
        <div className="mb-2.5 flex gap-[7px]">
          {PRESETS.map((p) => (
            <button
              key={p.r}
              onClick={() => setRate(p.r)}
              className={"flex-1 rounded-[9px] border py-2 text-[12.5px] font-semibold " + (rate === p.r ? "text-bg" : "border-line bg-surface2 text-ink2")}
              style={rate === p.r ? { background: ACCENT, borderColor: ACCENT } : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input type="range" min={0.5} max={1.3} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} className="w-full" style={{ accentColor: "var(--dojo)" }} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} accent={ACCENT} />

      <div className="fade-up">
        {tab === "listen" && <ListenPanel rate={rate} />}
        {tab === "catch" && <CatchPanel rate={rate} />}
        {tab === "num" && <NumbersPanel rate={rate} />}
      </div>
    </div>
  );
}

function BigPlay({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Play"
      className="mx-auto mb-1 grid h-[84px] w-[84px] place-items-center rounded-full text-[#0d1b1a] transition-transform active:scale-95"
      style={{ background: "linear-gradient(150deg, var(--t4), var(--dojo))", boxShadow: "0 0 32px color-mix(in srgb, var(--dojo) 40%, transparent)" }}
    >
      <IconPlay className="h-9 w-9" />
    </button>
  );
}

function MiniCtrls({ onReplay, onSlow }: { onReplay: () => void; onSlow: () => void }) {
  return (
    <div className="mt-3.5 flex justify-center gap-2">
      <button onClick={onReplay} className="flex items-center gap-1.5 rounded-[10px] border border-line bg-surface2 px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-dojo">
        <IconReplay className="h-3.5 w-3.5" /> Replay
      </button>
      <button onClick={onSlow} className="flex items-center gap-1.5 rounded-[10px] border border-line bg-surface2 px-3.5 py-2 text-[13px] font-semibold text-ink hover:border-dojo">
        <IconSlow className="h-3.5 w-3.5" /> Slow
      </button>
    </div>
  );
}

const card = "rounded-[20px] border border-line2 bg-surface p-[26px_22px] text-center";

function ListenPanel({ rate }: { rate: number }) {
  const [lvl, setLvl] = useState(1);
  const pool = useMemo(() => ITEMS.filter((i) => i[3] === lvl), [lvl]);
  const [cur, setCur] = useState<DojoItem>(() => rnd(pool));
  const [shown, setShown] = useState(false);
  useEffect(() => {
    setCur(rnd(ITEMS.filter((i) => i[3] === lvl)));
    setShown(false);
  }, [lvl]);
  const next = () => {
    const n = rnd(pool);
    setCur(n);
    setShown(false);
    setTimeout(() => speak(n[0] as string, rate), 120);
  };
  return (
    <div>
      <div className="mb-4 flex gap-[7px]">
        {[
          [1, "Words"],
          [2, "Phrases"],
          [3, "Sentences"],
        ].map(([v, label]) => (
          <button key={v} onClick={() => setLvl(v as number)} className={"flex-1 rounded-[9px] border py-2.5 text-[12.5px] font-semibold " + (lvl === v ? "text-bg" : "border-line bg-surface text-ink2")} style={lvl === v ? { background: ACCENT, borderColor: ACCENT } : undefined}>
            {label}
          </button>
        ))}
      </div>
      <div className={card}>
        <div className="mb-1 font-mono text-xs uppercase tracking-[.14em] text-mut">Tap to listen</div>
        <BigPlay onClick={() => speak(cur[0] as string, rate)} />
        <MiniCtrls onReplay={() => speak(cur[0] as string, rate)} onSlow={() => speak(cur[0] as string, 0.55)} />
        <div className="mt-4 min-h-[70px]">
          {shown && (
            <div className="fade-up">
              <div className="font-hk text-[clamp(28px,8vw,42px)] font-bold leading-[1.25]">{cur[0]}</div>
              <Jyutping jp={cur[1] as string} className="mt-2 block font-mono text-[15px]" />
              <div className="mt-1.5 text-[15px] text-ink2">{cur[2]}</div>
            </div>
          )}
        </div>
        <div className="mt-5 flex gap-2.5">
          <button onClick={() => setShown(true)} className="flex-1 rounded-[13px] border border-line bg-surface2 py-3.5 font-disp text-[14.5px] font-bold text-ink hover:border-dojo">
            Reveal
          </button>
          <button onClick={next} className="flex-1 rounded-[13px] py-3.5 font-disp text-[14.5px] font-bold text-bg" style={{ background: ACCENT }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

function CatchPanel({ rate }: { rate: number }) {
  const pool = useMemo(() => ITEMS.filter((i) => (i[3] as number) >= 2), []);
  const [cur, setCur] = useState<DojoItem>(() => rnd(pool));
  const [opts, setOpts] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [seen, setSeen] = useState(0);

  const load = (item?: DojoItem) => {
    const it = item || rnd(pool);
    setCur(it);
    setPicked(null);
    const others = shuffle(ITEMS.filter((i) => i[2] !== it[2])).slice(0, 3).map((i) => i[2] as string);
    setOpts(shuffle([it[2] as string, ...others]));
  };
  useEffect(() => load(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (o: string) => {
    if (picked) return;
    setPicked(o);
    setSeen(seen + 1);
    if (o === cur[2]) setScore(score + 1);
  };

  return (
    <div>
      <Scoreline score={score} seen={seen} />
      <div className={card}>
        <div className="mb-1 font-mono text-xs uppercase tracking-[.14em] text-mut">What did you hear?</div>
        <BigPlay onClick={() => speak(cur[0] as string, rate)} />
        <MiniCtrls onReplay={() => speak(cur[0] as string, rate)} onSlow={() => speak(cur[0] as string, 0.55)} />
        <div className="mt-4 grid gap-2.5">
          {opts.map((o, i) => {
            const right = picked && o === cur[2];
            const wrong = picked === o && o !== cur[2];
            return (
              <button
                key={i}
                disabled={!!picked}
                onClick={() => answer(o)}
                className={"rounded-xl border px-4 py-3.5 text-left text-[15px] " + (right ? "border-dojo bg-[color-mix(in_srgb,var(--dojo)_18%,transparent)] font-semibold text-dojo" : wrong ? "border-t1 bg-[color-mix(in_srgb,var(--t1)_16%,transparent)] text-t1" : "border-line bg-surface2 text-ink")}
              >
                {o}
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="mt-3.5">
            <div className="font-hk text-2xl">{cur[0]}</div>
            <Jyutping jp={cur[1] as string} className="font-mono text-[13px]" />
            <button onClick={() => load()} className="mt-3 w-full rounded-[13px] py-3.5 font-disp text-[14.5px] font-bold text-bg" style={{ background: ACCENT }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const promptFor = (t: string) => (t === "price" ? "How much did they say?" : t === "time" ? "What time did they say?" : t === "qty" ? "How many did they say?" : "Which number did they say?");

function NumbersPanel({ rate }: { rate: number }) {
  const [cur, setCur] = useState<DojoNum>(() => rnd(NUMS));
  const [opts, setOpts] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [seen, setSeen] = useState(0);

  const load = () => {
    const it = rnd(NUMS);
    setCur(it);
    setPicked(null);
    const used = new Set([it.a]);
    const pool: string[] = [];
    shuffle(NUMS.filter((n) => n.t === it.t)).forEach((n) => {
      if (!used.has(n.a)) {
        used.add(n.a);
        pool.push(n.a);
      }
    });
    setOpts(shuffle([it.a, ...pool.slice(0, 3)]));
  };
  useEffect(() => load(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (a: string) => {
    if (picked) return;
    setPicked(a);
    setSeen(seen + 1);
    if (a === cur.a) setScore(score + 1);
  };

  return (
    <div>
      <Scoreline score={score} seen={seen} />
      <div className={card}>
        <div className="mb-1 font-mono text-xs uppercase tracking-[.14em] text-mut">{promptFor(cur.t)}</div>
        <BigPlay onClick={() => speak(cur.han, rate)} />
        <MiniCtrls onReplay={() => speak(cur.han, rate)} onSlow={() => speak(cur.han, 0.55)} />
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {opts.map((a, i) => {
            const right = picked && a === cur.a;
            const wrong = picked === a && a !== cur.a;
            return (
              <button
                key={i}
                disabled={!!picked}
                onClick={() => answer(a)}
                className={"rounded-[14px] border py-4 font-disp text-[22px] font-extrabold " + (right ? "border-dojo bg-[color-mix(in_srgb,var(--dojo)_18%,transparent)] text-dojo" : wrong ? "border-t1 bg-[color-mix(in_srgb,var(--t1)_16%,transparent)] text-t1" : "border-line bg-surface2 text-ink")}
              >
                {a}
              </button>
            );
          })}
        </div>
        {picked && (
          <div className="mt-3.5">
            <div className="font-hk text-xl">{cur.han}</div>
            <Jyutping jp={cur.jp} className="font-mono text-[13px]" />
            <button onClick={load} className="mt-3 w-full rounded-[13px] py-3.5 font-disp text-[14.5px] font-bold text-bg" style={{ background: ACCENT }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Scoreline({ score, seen }: { score: number; seen: number }) {
  return (
    <div className="mb-3.5 flex justify-between font-disp text-base font-extrabold">
      <span style={{ color: ACCENT }}>{score}</span> <span className="text-ink2">correct · {seen} heard</span>
    </div>
  );
}
