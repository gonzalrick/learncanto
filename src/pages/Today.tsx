import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { sessionPlan } from "../lib/session";
import { srsDue } from "../lib/srs";
import { dstr } from "../lib/streak";
import { startRun, startCards } from "../lib/launch";
import { currentStation, stationDone, ZONE_OF_STATION } from "../data/zones";
import { IconFlame, IconShield, IconCheck, IconChevronRight, IconPractice, IconCards } from "../components/icons";

const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const WD_HK = ["日", "一", "二", "三", "四", "五", "六"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function Today() {
  const known = useStore((s) => s.known);
  const srs = useStore((s) => s.srs);
  const days = useStore((s) => s.days);
  const seed = useStore((s) => s.seed);

  useEffect(() => {
    seed();
  }, [seed]);

  const now = new Date();
  const h = now.getHours();
  const greeting =
    h < 5 ? "夜瞓喇 — night owl" : h < 12 ? "早晨 — good morning" : h < 18 ? "午安 — good afternoon" : "晚上好 — good evening";

  const plan = sessionPlan(srs, known);
  const count = plan.reviews.length + plan.fresh.length + plan.ears.length;
  const mins = Math.max(2, Math.round(count * 0.6));
  const dueN = srsDue(srs).length;

  const st = currentStation(known);
  const zone = ZONE_OF_STATION.get(st)!;
  const stDone = stationDone(known, st);

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between px-0.5 pt-2 pb-4">
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[.18em] text-mut">
            {WD[now.getDay()]} · {now.getDate()} {MON[now.getMonth()]}{" "}
            <span className="font-hk tracking-[.05em]">星期{WD_HK[now.getDay()]}</span>
          </div>
          <div className="mt-1.5 font-disp text-[25px] font-extrabold leading-[1.1] -tracking-[.02em]">{greeting}</div>
        </div>
        <div
          className="flex items-center gap-[7px] rounded-full border border-line2 bg-surface py-[7px] pl-2.5 pr-[13px]"
          title="Daily streak — one rest-day shield earned per week"
        >
          <IconFlame className="h-4 w-4 shrink-0 text-acc" />
          <div>
            <b className="font-disp text-[15px] font-extrabold">{days.streak}</b>
            <small className="-mt-0.5 block font-mono text-[9px] uppercase tracking-[.14em] text-mut">day streak</small>
          </div>
        </div>
      </div>

      {/* session card */}
      <div
        className="rounded-3xl border p-[19px_19px_17px]"
        style={{
          background: "linear-gradient(150deg, color-mix(in srgb, var(--acc) 16%, var(--surface)), var(--surface) 62%)",
          borderColor: "color-mix(in srgb, var(--acc) 32%, var(--line2))",
        }}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <div className="font-mono text-[10.5px] uppercase tracking-[.18em] text-ink2">Today's session</div>
          <span className="font-mono text-[10.5px] uppercase tracking-[.14em] text-acc2">≈ {mins} min</span>
        </div>
        <div className="mb-[17px] flex flex-col gap-[9px]">
          {plan.reviews.length > 0 && (
            <Row color="var(--acc)">
              <b className="font-semibold text-ink">
                {plan.reviews.length} review{plan.reviews.length > 1 ? "s" : ""}
              </b>{" "}
              about to fade
            </Row>
          )}
          {plan.fresh.length > 0 && (
            <Row color="var(--t3)">
              <b className="font-semibold text-ink">
                {plan.fresh.length} new word{plan.fresh.length > 1 ? "s" : ""}
              </b>{" "}
              from {plan.fresh[0].st.title}
            </Row>
          )}
          {plan.ears.length > 0 && (
            <Row color="var(--t4)">
              <b className="font-semibold text-ink">
                {plan.ears.length} ear rep{plan.ears.length > 1 ? "s" : ""}
              </b>{" "}
              — what did you hear?
            </Row>
          )}
        </div>
        <button
          onClick={startRun}
          className="flex w-full items-center justify-center gap-[9px] rounded-2xl bg-acc py-[15px] font-disp text-base font-extrabold text-onacc transition-transform active:scale-[.975]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[17px] w-[17px]">
            <path d="M8 5v14l11-7z" />
          </svg>
          {days.days[dstr(0)] ? "Run it again" : "Start today's run"}
        </button>
      </div>

      {/* week dots */}
      <div className="mx-1 mt-[19px] mb-1 flex justify-between">
        {Array.from({ length: 7 }, (_, k) => {
          const i = k - 6;
          const d = new Date();
          d.setDate(d.getDate() + i);
          const mark = days.days[dstr(i)];
          const isToday = i === 0;
          let cls = "border-line text-mut";
          let inner: React.ReactNode = "·";
          if (mark === 1) {
            cls = "text-acc2";
            inner = <IconCheck className="h-[13px] w-[13px]" />;
          } else if (mark === "shield") {
            cls = "text-t4";
            inner = <IconShield className="h-[13px] w-[13px]" />;
          } else if (isToday) {
            cls = "border-dashed border-acc text-acc2";
          }
          const bg =
            mark === 1
              ? "color-mix(in srgb, var(--acc) 22%, transparent)"
              : mark === "shield"
                ? "color-mix(in srgb, var(--t4) 18%, transparent)"
                : undefined;
          const border =
            mark === 1 ? "var(--acc)" : mark === "shield" ? "var(--t4)" : undefined;
          return (
            <div
              key={k}
              className={"flex flex-col items-center gap-[7px] font-mono text-[9.5px] tracking-[.08em] " + (isToday ? "text-ink2" : "text-mut")}
            >
              <span
                className={"grid h-[30px] w-[30px] place-items-center rounded-full border-[1.5px] " + cls}
                style={{ background: bg, borderColor: border }}
              >
                {inner}
              </span>
              {WD[d.getDay()]}
            </div>
          );
        })}
      </div>

      {/* next stop */}
      <Link
        to={zone.route}
        className="mt-[15px] flex w-full items-center gap-[13px] rounded-[20px] border border-line2 bg-surface p-[17px] text-left"
      >
        <span
          className="h-[15px] w-[15px] shrink-0 rounded-full border-4 bg-bg"
          style={{ borderColor: zone.cv }}
        />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[9.5px] uppercase tracking-[.16em] text-mut">
            Next stop · {zone.pill} — {zone.name}
          </span>
          <span className="mt-[3px] block font-disp text-[14.5px] font-semibold -tracking-[.01em]">
            {st.title} <span className="font-normal text-mut">{zone.hk}</span>
          </span>
          <span className="mt-1 block font-mono text-[10.5px] text-mut">
            <span style={{ color: zone.cv }}>{stDone}</span> / {st.total} aboard
          </span>
        </span>
        <IconChevronRight className="h-[18px] w-[18px] shrink-0 text-mut" />
      </Link>

      {/* mini tiles */}
      <div className="mt-[15px] grid grid-cols-2 gap-[11px]">
        <Link to="/dojo" className="block rounded-[17px] border border-line2 bg-surface p-[13px_14px] text-left text-ink">
          <span className="mb-[9px] grid h-[30px] w-[30px] place-items-center rounded-[9px] text-white" style={{ background: "var(--dojo)" }}>
            <IconPractice className="h-[15px] w-[15px]" />
          </span>
          <b className="block font-disp text-[13.5px] font-semibold -tracking-[.01em]">Ear training</b>
          <small className="text-[11px] text-mut">Listening Dojo</small>
        </Link>
        <button onClick={startCards} className="block rounded-[17px] border border-line2 bg-surface p-[13px_14px] text-left text-ink">
          <span className="mb-[9px] grid h-[30px] w-[30px] place-items-center rounded-[9px] text-white" style={{ background: "var(--l15)" }}>
            <IconCards className="h-[15px] w-[15px]" />
          </span>
          <b className="block font-disp text-[13.5px] font-semibold -tracking-[.01em]">Flashcards</b>
          <small className="text-[11px] text-mut">{dueN} due now</small>
        </button>
      </div>

      <footer className="mt-7 text-center text-[11.5px] leading-[1.7] text-mut">
        Every word speaks with your device's Cantonese voice.
        <br />
        <span className="font-hk text-acc2">慢慢嚟</span> · take it slow, come back tomorrow.
      </footer>
    </div>
  );
}

function Row({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-[13.5px] text-ink2">
      <span className="h-[9px] w-[9px] shrink-0 rounded-[3px]" style={{ background: color }} />
      <span>{children}</span>
    </div>
  );
}
