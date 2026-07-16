import { IconCheck } from "./icons";

/** Square check toggle used to mark an item learned. */
export function MarkButton({
  on,
  onClick,
  accent,
  label = "Mark learned",
}: {
  on: boolean;
  onClick: () => void;
  accent: string;
  label?: string;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={on}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={"grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] border transition-colors " + (on ? "text-bg" : "border-line bg-surface2 text-ink2 hover:border-acc")}
      style={on ? { background: accent, borderColor: accent } : undefined}
    >
      <IconCheck className="h-[17px] w-[17px]" />
    </button>
  );
}

/** Thin progress bar with a "N/total label" caption. */
export function ProgressBar({
  done,
  total,
  accent,
  label,
}: {
  done: number;
  total: number;
  accent: string;
  label: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-[7px] flex-1 overflow-hidden rounded-full border border-line2 bg-surface2">
        <span className="block h-full transition-[width] duration-300" style={{ width: (total ? (done / total) * 100 : 0) + "%", background: accent }} />
      </div>
      <small className="whitespace-nowrap font-mono text-xs text-mut">
        {done}/{total} {label}
      </small>
    </div>
  );
}

/** Keynote / rule callout box. */
export function Keynote({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div
      className="mb-4 rounded-[15px] border border-line2 p-[15px_17px]"
      style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 10%, transparent), color-mix(in srgb, var(--t4) 8%, transparent))` }}
    >
      <h4 className="mb-1.5 flex items-center gap-2 font-disp text-sm font-bold">
        <span className="h-2 w-2 rotate-45 rounded-[2px]" style={{ background: accent }} />
        {title}
      </h4>
      <div className="text-[13.5px] text-ink2">{children}</div>
    </div>
  );
}
