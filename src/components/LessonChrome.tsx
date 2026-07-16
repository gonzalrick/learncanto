import { Link } from "react-router-dom";
import { IconChevronLeft } from "./icons";

/** Header used across lesson pages: back-to-line link, eyebrow, title (+ 漢字). */
export function LessonHeader({
  eyebrow,
  title,
  hk,
  accent,
}: {
  eyebrow: string;
  title: string;
  hk: string;
  accent: string;
}) {
  return (
    <header className="flex items-start gap-3 pt-6 pb-1.5">
      <Link
        to="/line"
        aria-label="Back to the line"
        className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl border border-line2 bg-surface text-ink2 hover:border-acc hover:text-acc2"
      >
        <IconChevronLeft className="h-5 w-5" />
      </Link>
      <div>
        <div className="font-mono text-[10.5px] uppercase tracking-[.18em]" style={{ color: accent }}>
          {eyebrow}
        </div>
        <h1 className="mt-1 font-disp text-[clamp(24px,6vw,34px)] font-extrabold leading-[1.05] -tracking-[.02em]">
          {title} <span className="font-hk text-[.6em] font-bold" style={{ color: accent }}>{hk}</span>
        </h1>
      </div>
    </header>
  );
}

export interface TabDef {
  id: string;
  label: string;
  ji?: string;
}

/** Scrollable tab bar. Active state is derived from `active`, so it updates
    immediately on click (the bug the vanilla app had is structurally gone). */
export function Tabs({
  tabs,
  active,
  onChange,
  accent,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
  accent: string;
}) {
  return (
    <nav className="no-scrollbar sticky top-0 z-20 -mx-1 mt-4 mb-5 flex gap-1.5 overflow-x-auto rounded-[13px] border border-line2 bg-surface2 p-[5px]">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(t.id)}
            className={
              "flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-[9px] px-3.5 py-2.5 font-body text-[13.5px] font-semibold transition-colors " +
              (on ? "text-bg" : "text-ink2")
            }
            style={on ? { background: accent } : undefined}
          >
            {t.ji && <span className="font-hk text-[13px] opacity-70">{t.ji}</span>}
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
