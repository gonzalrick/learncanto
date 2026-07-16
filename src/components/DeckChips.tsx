// Deck selector pills. Active state is derived from `current`, so a click
// activates the pill immediately (no tab-switch needed — the vanilla bug is
// structurally impossible here).

export interface Chip {
  id: string;
  label: string;
  done: number;
  total: number;
}

export function DeckChips({
  chips,
  current,
  onPick,
  accent,
}: {
  chips: Chip[];
  current: string;
  onPick: (id: string) => void;
  accent: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map((c) => {
        const on = c.id === current;
        return (
          <button
            key={c.id}
            aria-pressed={on}
            onClick={() => onPick(c.id)}
            className={
              "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors " +
              (on ? "text-bg" : "border-line bg-surface text-ink2")
            }
            style={on ? { background: accent, borderColor: accent } : undefined}
          >
            {c.label}
            <span className="text-[11px] font-medium" style={on ? { color: "rgba(10,16,29,.65)" } : { color: "var(--mut)" }}>
              {c.done}/{c.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
