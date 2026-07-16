import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { srsDue } from "../lib/srs";
import { startCards, startEarDrill } from "../lib/launch";
import { currentStation, ZONE_OF_STATION } from "../data/zones";
import { initPwaReset } from "../lib/reset";
import { IconPractice, IconCards, IconChar, IconEar, IconQuiz, IconChevronRight } from "../components/icons";

export function Practice() {
  const known = useStore((s) => s.known);
  const srs = useStore((s) => s.srs);
  const dueN = srsDue(srs).length;
  const zone = ZONE_OF_STATION.get(currentStation(known))!;

  return (
    <div>
      <div className="px-0.5 pt-2.5 pb-4">
        <div className="font-mono text-[10.5px] uppercase tracking-[.18em] text-mut">Free play · never blocks the line</div>
        <div className="mt-1.5 font-disp text-[25px] font-extrabold leading-[1.1] -tracking-[.02em]">Practice</div>
      </div>

      <Tile as="link" to="/dojo" color="var(--dojo)" icon={<IconPractice className="h-[21px] w-[21px]" />} title="Listening Dojo" hk="聽力"
        sub="Listen & reveal · what did you hear? · numbers — at your speed" />

      <Tile as="button" onClick={startCards} color="var(--l15)" icon={<IconCards className="h-[21px] w-[21px]" />} title="Flashcards"
        badge={`${dueN} due`} sub="Spaced review across every zone — clears tomorrow's queue early" />

      <Tile as="link" to="/characters" color="var(--chars)" iconDark icon={<IconChar className="h-[21px] w-[21px]" />}
        title="Learn the Characters" hk="認字" sub="Optional reading branch — pictures first, zero experience needed" />

      <Tile as="button" onClick={startEarDrill} color="var(--t4)" icon={<IconEar className="h-[21px] w-[21px]" />} title="Quick ear drill"
        sub={'Six "what did you hear?" reps, right here'} />

      <Tile as="link" to={zone.route} color="var(--fam)" icon={<IconQuiz className="h-[21px] w-[21px]" />} title="Station quiz"
        sub={`Re-test ${zone.name} — cards & quiz tabs`} />

      <p className="mt-4 px-1 text-[11.5px] leading-[1.6] text-mut">
        Practice feeds the same memory as the Line — words you clear here won't be re-asked in tomorrow's session.
      </p>
      <div className="mt-[26px] text-center">
        <button
          onClick={() => {
            if (confirm("Reset ALL progress — every zone, the review schedule and your streak?")) initPwaReset();
          }}
          className="rounded-[9px] border border-line px-[13px] py-[7px] text-xs text-mut hover:border-acc hover:text-acc2"
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}

type TileProps = {
  color: string;
  icon: React.ReactNode;
  title: string;
  hk?: string;
  sub: string;
  badge?: string;
  iconDark?: boolean;
} & ({ as: "link"; to: string } | { as: "button"; onClick: () => void });

function Tile(props: TileProps) {
  const inner = (
    <>
      <span
        className={"grid h-[44px] w-[44px] shrink-0 place-items-center rounded-[14px] " + (props.iconDark ? "text-[#1d1403]" : "text-white")}
        style={{ background: props.color }}
      >
        {props.icon}
      </span>
      <span className="min-w-0 flex-1">
        <b className="block font-disp text-[15px] font-semibold -tracking-[.01em]">
          {props.title}
          {props.hk && <span className="ml-1.5 font-normal font-hk text-mut">{props.hk}</span>}
          {props.badge && (
            <span
              className="ml-[7px] rounded-full px-[7px] py-0.5 align-[2px] font-mono text-[9px] uppercase tracking-[.1em] text-acc2"
              style={{ background: "color-mix(in srgb, var(--acc) 25%, transparent)" }}
            >
              {props.badge}
            </span>
          )}
        </b>
        <small className="mt-0.5 block text-[11.5px] text-mut">{props.sub}</small>
      </span>
      <IconChevronRight className="h-[17px] w-[17px] shrink-0 text-mut" />
    </>
  );
  const cls = "mt-3 flex w-full items-center gap-3.5 rounded-[20px] border border-line2 bg-surface p-4 text-left text-ink";
  return props.as === "link" ? (
    <Link to={props.to} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={props.onClick} className={cls}>
      {inner}
    </button>
  );
}
