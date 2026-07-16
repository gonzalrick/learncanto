import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { ZONES, currentStation, stationDone, type Station, type Zone } from "../data/zones";
import { IconCheck } from "../components/icons";

export function Line() {
  const known = useStore((s) => s.known);
  const cur = currentStation(known);

  let totalAll = 0;
  let doneAll = 0;
  let reachedCur = false;

  const blocks = ZONES.map((z) => {
    const rows = z.stations.map((st, i) => {
      const done = stationDone(known, st);
      const full = done >= st.total;
      totalAll += st.total;
      doneAll += done;
      let state: "done" | "cur" | "cur2" | "lock";
      if (full) state = "done";
      else if (!z.elective && !reachedCur && st === cur) {
        state = "cur";
        reachedCur = true;
      } else state = done > 0 ? "cur2" : "lock";
      return { st, done, full, state, last: i === z.stations.length - 1 };
    });
    return { z, rows };
  });

  const pct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

  return (
    <div>
      <div className="px-0.5 pt-2.5 pb-4">
        <div className="font-mono text-[10.5px] uppercase tracking-[.18em] text-mut">
          Route map <span className="font-hk tracking-[.06em]">路綫圖</span>
        </div>
        <div className="mt-1.5 font-disp text-[25px] font-extrabold leading-[1.1] -tracking-[.02em]">You are here</div>
        <div className="mt-[5px] font-mono text-[10.5px] tracking-[.1em] text-mut">
          <span className="text-acc2">{doneAll}</span> / {totalAll} items travelled · {pct}% of the line
        </div>
      </div>

      {blocks.map(({ z, rows }) =>
        z.elective ? (
          <div key={z.id} className="my-1 ml-[29px] border-l-[3px] border-dashed py-1 pl-[17px]" style={{ borderColor: z.cv }}>
            <div className="my-[5px] font-mono text-[9px] uppercase tracking-[.14em]" style={{ color: z.cv }}>
              {z.blabel}
            </div>
            {rows.map(({ st, done, full, state }) => (
              <StationRow key={st.id} zone={z} st={st} done={done} full={full} state={state} branch />
            ))}
          </div>
        ) : (
          <div key={z.id} className="relative pb-3 pt-0.5" style={{ ["--zc" as string]: z.cv }}>
            <div className="mb-3 mt-2.5 flex items-center gap-[9px]">
              <span
                className="rounded-[4px] px-[7px] py-[2.5px] font-mono text-[9px] font-bold uppercase tracking-[.14em] text-bg"
                style={{ background: z.cv }}
              >
                {z.pill}
              </span>
              <span className="font-disp text-[12.5px] font-semibold tracking-[.01em] text-ink2">
                {z.name}
                <span className="ml-[5px] font-normal font-hk text-mut">{z.hk}</span>
              </span>
            </div>
            {rows.map(({ st, done, full, state, last }) => (
              <StationRow key={st.id} zone={z} st={st} done={done} full={full} state={state} last={last} />
            ))}
          </div>
        ),
      )}

      <div className="mt-2 ml-0.5 flex items-center gap-3.5">
        <span className="grid w-[26px] shrink-0 place-items-center">
          <span className="h-[15px] w-[15px] rotate-45 rounded-[4px]" style={{ background: "var(--l2)" }} />
        </span>
        <p className="text-xs text-mut">
          <b className="font-disp font-semibold text-ink2">Terminus — 講廣東話.</b> Finish the line and the whole map becomes review.
        </p>
      </div>
    </div>
  );
}

function StationRow({
  zone,
  st,
  done,
  full,
  state,
  branch,
  last,
}: {
  zone: Zone;
  st: Station;
  done: number;
  full: boolean;
  state: "done" | "cur" | "cur2" | "lock";
  branch?: boolean;
  last?: boolean;
}) {
  const zc = zone.cv;
  const dim = state === "lock";
  const tag = full ? (
    <span className="inline-grid h-[17px] w-[17px] place-items-center rounded-full align-[-4px] text-bg" style={{ background: zc }}>
      <IconCheck className="h-[9px] w-[9px]" />
    </span>
  ) : state === "cur" ? (
    "YOU ARE HERE"
  ) : done > 0 ? (
    `${done} / ${st.total}`
  ) : (
    "AHEAD"
  );
  const tagColor = full || state === "cur" ? zc : "var(--mut)";

  return (
    <Link to={zone.route} className="relative flex w-full items-center gap-3.5 pl-0.5 text-left text-ink">
      {!branch && (
        <span className="flex w-[26px] shrink-0 flex-col items-center self-stretch">
          <span className="w-[5px] flex-1" style={{ background: zc, opacity: dim ? 0.28 : 1 }} />
          <span
            className="relative h-[17px] w-[17px] shrink-0 rounded-full border-[4.5px] bg-bg"
            style={{ borderColor: dim ? "var(--line)" : zc, background: full ? zc : "var(--bg)" }}
          >
            {state === "cur" && <span className="ping-ring" style={{ ["--zc" as string]: zc }} />}
          </span>
          <span className="w-[5px] flex-1" style={{ background: zc, opacity: dim || last ? 0.28 : 1 }} />
        </span>
      )}
      <span className="min-w-0 flex-1 py-[11px]">
        <h5 className={"font-disp text-sm font-semibold -tracking-[.01em] " + (state === "lock" ? "text-ink2" : "")}>{st.title}</h5>
        <small className="mt-0.5 block text-[11px] text-mut">{st.sub}</small>
      </span>
      <span className="shrink-0 text-right font-mono text-[9.5px] uppercase tracking-[.1em]" style={{ color: tagColor }}>
        {tag}
      </span>
    </Link>
  );
}
