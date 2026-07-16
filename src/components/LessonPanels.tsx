import { useState } from "react";
import { speak } from "../lib/speech";
import { Jyutping } from "./Jyutping";
import { IconSpeaker } from "./icons";
import type {
  ToneItem,
  Scene,
  GrammarTopic,
  Particle,
  BuilderBase,
  Pattern,
  Tip,
} from "../data/types";

const toneColor = (n: number) => `var(--t${n})`;

function ToneCurve({ pts, n }: { pts: number[][]; n: number }) {
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 54" preserveAspectRatio="none" className="my-2 block h-12 w-full" aria-hidden>
      <line x1="6" y1="6" x2="6" y2="48" stroke="var(--line)" strokeWidth={1} />
      <line x1="6" y1="27" x2="94" y2="27" stroke="var(--line)" strokeWidth={1} strokeDasharray="3 3" />
      <path d={d} fill="none" stroke={toneColor(n)} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3.6} fill={toneColor(n)} />
    </svg>
  );
}

export function TonesPanel({ tones }: { tones: ToneItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-[11px]">
      {tones.map((t) => (
        <div key={t.n} className="rounded-[15px] border border-line2 bg-surface p-[15px]">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-disp text-[14.5px] font-extrabold" style={{ color: toneColor(t.n) }}>
                Tone {t.n}
              </div>
              <div className="text-xs text-mut">{t.name}</div>
            </div>
          </div>
          <ToneCurve pts={t.pts} n={t.n} />
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-bold" style={{ color: toneColor(t.n) }}>
              {t.syl}
            </span>
            <span className="font-hk text-sm text-ink2">{t.han}</span>
            <button onClick={() => speak(t.han.split(" ")[0])} aria-label="Hear it" className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-line bg-surface2 text-ink2 hover:border-acc hover:text-acc2">
              <IconSpeaker className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ScenesPanel({ scenes }: { scenes: Scene[] }) {
  return (
    <div className="flex flex-col gap-4">
      {scenes.map((sc) => (
        <div key={sc.id} className="rounded-[18px] border border-line2 bg-surface p-4">
          <div className="mb-0.5 font-disp text-base font-bold">{sc.title}</div>
          <div className="mb-3 text-xs text-mut">{sc.where}</div>
          <div className="flex flex-col gap-2.5">
            {sc.lines.map((ln, i) => {
              const you = ln.who === "you";
              return (
                <div key={i} className={"flex " + (you ? "justify-end" : "justify-start")}>
                  <div
                    className={"max-w-[85%] rounded-2xl px-3.5 py-2.5 " + (you ? "bg-surface2" : "border border-line2")}
                    style={you ? { background: "color-mix(in srgb, var(--l15) 16%, var(--surface2))" } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-hk text-lg">{ln.han}</span>
                      <button onClick={() => speak(ln.han)} aria-label="Hear it" className="text-mut hover:text-acc2">
                        <IconSpeaker className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Jyutping jp={ln.jp} className="font-mono text-[11.5px]" />
                    <div className="text-[12px] text-ink2">{ln.en}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function GrammarPanel({ grammar }: { grammar: GrammarTopic[] }) {
  return (
    <div className="flex flex-col gap-3">
      {grammar.map((g, gi) => (
        <div key={gi} className="rounded-[16px] border border-line2 bg-surface p-4">
          <div className="mb-1.5 flex items-baseline gap-2">
            <span className="font-disp text-[15px] font-bold">{g.topic}</span>
            <span className="font-hk text-sm text-mut">{g.han}</span>
          </div>
          <p className="mb-3 text-[13px] text-ink2">{g.note}</p>
          <div className="flex flex-col gap-1.5">
            {g.ex.map((e, i) => (
              <button key={i} onClick={() => speak(e[0])} className="flex items-center gap-3 rounded-[11px] border border-line2 bg-surface2 px-3 py-2 text-left">
                <span className="font-hk text-lg">{e[0]}</span>
                <span className="min-w-0 flex-1">
                  <Jyutping jp={e[1]} className="font-mono text-[11.5px]" />
                  <span className="block text-[11.5px] text-mut">{e[2]}</span>
                </span>
                <IconSpeaker className="h-3.5 w-3.5 shrink-0 text-mut" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ParticlesPanel({ particles }: { particles: Particle[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
      {particles.map((p, i) => (
        <button key={i} onClick={() => speak(p.ex[0])} className="rounded-[15px] border border-line2 bg-surface p-3.5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-hk text-2xl font-bold">{p.ch}</span>
            <span className="font-mono text-xs text-acc2">{p.jp}</span>
          </div>
          <div className="mt-1 text-[12px] text-ink2">{p.gl}</div>
          <div className="mt-2 flex items-center gap-2 border-t border-line2 pt-2">
            <span className="font-hk text-[15px]">{p.ex[0]}</span>
            <IconSpeaker className="h-3 w-3 text-mut" />
          </div>
        </button>
      ))}
    </div>
  );
}

export function BuilderPanel({ builder }: { builder: BuilderBase[] }) {
  const [baseId, setBaseId] = useState(builder[0].id);
  const [sel, setSel] = useState(0);
  const base = builder.find((b) => b.id === baseId) || builder[0];
  const v = base.variants[sel] || base.variants[0];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {builder.map((b) => {
          const on = b.id === baseId;
          return (
            <button
              key={b.id}
              onClick={() => {
                setBaseId(b.id);
                setSel(0);
              }}
              className={"rounded-full border px-3.5 py-2 text-[13px] font-semibold " + (on ? "border-l2 bg-l2 text-bg" : "border-line bg-surface text-ink2")}
            >
              "{b.baseEn}"
            </button>
          );
        })}
      </div>
      <div className="mb-3 rounded-[18px] border border-line2 bg-surface p-6 text-center">
        <button onClick={() => speak(v.han)} className="font-hk text-[clamp(32px,10vw,48px)] font-bold">
          {v.han}
        </button>
        <Jyutping jp={v.jp} className="mt-2 block font-mono text-base" />
        <div className="mt-1.5 text-[13px] text-ink2">{v.en}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {base.variants.map((vv, i) => {
          const on = i === sel;
          return (
            <button
              key={i}
              onClick={() => {
                setSel(i);
                speak(vv.han);
              }}
              className={"rounded-[14px] border px-3.5 py-2.5 font-hk text-[15px] " + (on ? "border-l2 bg-l2 text-bg" : "border-line bg-surface2 text-ink")}
            >
              {vv.p === "—" ? <span className="text-mut">none</span> : vv.p}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PatternsPanel({ patterns }: { patterns: Pattern[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {patterns.map((p, i) => (
        <div key={i} className="rounded-[15px] border border-line2 bg-surface p-4">
          <div className="font-hk text-lg">{p.f.join("")}</div>
          <Jyutping jp={p.jp} className="mt-1 font-mono text-[12px]" />
          <div className="mt-1 text-[13px] text-ink2" dangerouslySetInnerHTML={{ __html: p.m }} />
          <button onClick={() => speak(p.eg[0])} className="mt-2 flex items-center gap-2 border-t border-line2 pt-2 text-left">
            <span className="font-hk text-[15px]">{p.eg[0]}</span>
            <span className="font-mono text-[11px] text-mut">{p.eg[2]}</span>
            <IconSpeaker className="h-3 w-3 text-mut" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function TipsPanel({ tips }: { tips: Tip[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {tips.map((t, i) => (
        <div key={i} className="rounded-[14px] border border-line2 bg-surface p-4">
          <h4 className="mb-1.5 font-disp text-[15px] font-bold">{t[0]}</h4>
          <p className="text-[13.5px] text-ink2" dangerouslySetInnerHTML={{ __html: t[1] }} />
        </div>
      ))}
    </div>
  );
}
