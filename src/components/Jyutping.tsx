// Tone-colored jyutping — ports jpHTML/romanHTML. Each syllable's whole body is
// colored by its tone number (1–6) via the .tone1..tone6 classes in index.css.

export function Jyutping({ jp, className }: { jp: string; className?: string }) {
  const parts = String(jp).split(" ");
  return (
    <span className={className}>
      {parts.map((s, i) => {
        const m = s.match(/^([a-z]+?)([1-6])$/i);
        return (
          <span key={i}>
            {i > 0 ? " " : ""}
            {m ? <span className={"tone" + m[2]}>{m[1] + m[2]}</span> : s}
          </span>
        );
      })}
    </span>
  );
}
