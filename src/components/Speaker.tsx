import { speak } from "../lib/speech";
import { IconSpeaker } from "./icons";

/** Round tap-to-hear button used across every lesson (▶ audio). */
export function Speaker({
  text,
  rate,
  className = "",
  label = "Hear it",
}: {
  text: string;
  rate?: number;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        speak(text, rate);
      }}
      className={
        "grid place-items-center rounded-xl border border-line bg-surface2 text-ink2 " +
        "transition-colors hover:border-acc hover:text-acc2 " +
        className
      }
    >
      <IconSpeaker className="h-[18px] w-[18px]" />
    </button>
  );
}
