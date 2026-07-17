// "Show to a local" — a phrase blown up to fill the screen so you can hand the
// phone to a waiter, driver or shopkeeper when your tones don't land. Speaks
// once on open; the English stays small underneath so you still know what
// you're showing them.

import { useEffect } from "react";
import { speak, cancelSpeech } from "../lib/speech";
import { Jyutping } from "./Jyutping";
import { IconX, IconSpeaker, IconShow } from "./icons";

/** Opens a ShowCard — sits next to <Speaker> wherever a phrase is listed. */
export function ShowButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label="Show full screen"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={
        "grid shrink-0 place-items-center rounded-xl border border-line bg-surface2 text-ink2 " +
        "transition-colors hover:border-acc hover:text-acc2 " +
        className
      }
    >
      <IconShow className="h-[17px] w-[17px]" />
    </button>
  );
}

export function ShowCard({
  han,
  jp,
  en,
  onClose,
}: {
  han: string;
  jp: string;
  en: string;
  onClose: () => void;
}) {
  // Speak once on open, and again whenever the phrase itself changes.
  useEffect(() => {
    speak(han, 0.75);
    return () => cancelSpeech();
  }, [han]);

  // Escape closes; body scroll is locked while the overlay owns the screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Show this phrase"
      className="fixed inset-0 z-[60] flex flex-col bg-bg"
      style={{
        paddingTop: "calc(14px + env(safe-area-inset-top))",
        paddingBottom: "calc(20px + env(safe-area-inset-bottom))",
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      <div className="flex justify-end">
        <button
          onClick={onClose}
          aria-label="Close"
          className="grid h-[34px] w-[34px] place-items-center rounded-full border border-line2 bg-surface text-ink2"
        >
          <IconX className="h-[15px] w-[15px]" />
        </button>
      </div>

      {/* The 漢字 is the whole point — everything else defers to it. */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="font-hk text-[clamp(44px,15vw,104px)] font-semibold leading-[1.15] text-ink">
          {han}
        </div>
        <button
          onClick={(e) => {
            e.currentTarget.classList.remove("spk-pulse");
            void e.currentTarget.offsetWidth;
            e.currentTarget.classList.add("spk-pulse");
            speak(han, 0.75);
          }}
          aria-label="Play out loud"
          className="grid h-[64px] w-[64px] place-items-center rounded-full text-t4"
          style={{ background: "color-mix(in srgb, var(--t4) 24%, var(--surface2))" }}
        >
          <IconSpeaker className="h-[26px] w-[26px]" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-1.5 pb-1 text-center">
        <Jyutping jp={jp} className="font-mono text-[13px]" />
        <div className="max-w-[34ch] text-[13px] text-mut">{en}</div>
        <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[.16em] text-mut">
          Show this screen · tap ▸ to play it
        </div>
      </div>
    </div>
  );
}
