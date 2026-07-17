// "Heard it in the wild" — you paste 漢字 off a menu, a sign, a WhatsApp, and
// this turns it into a card you'll see in tomorrow's reviews.
//
// Jyutping always comes from the local dictionary, so it works on airplane mode.
// The course is checked first: if it already teaches the phrase, this schedules
// that card rather than making a duplicate. Only genuinely new text goes out to
// the network.

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { lookupHan, knownWordIn, type DictEntry } from "../lib/dictionary";
import { hanToJyutping, translateHan, NoReverseTranslation } from "../lib/translate";
import { wildId, courseIdForHan } from "../lib/vocab-lookup";
import { Jyutping } from "./Jyutping";
import { Speaker } from "./Speaker";
import { ShowCard, ShowButton } from "./ShowCard";
import { IconCheck } from "./icons";

type Meaning =
  | { s: "ask" } // not taught here — offer to look it up
  | { s: "loading" }
  | { s: "taught"; entry: DictEntry } // the course has this exact phrase
  | { s: "found"; en: string } // came back from the server
  | { s: "manual" } // server can't do 粵→英 yet; user writes their own
  | { s: "error"; msg: string };

export function WildCatch({ han }: { han: string }) {
  const [jp, setJp] = useState("");
  const [jpFailed, setJpFailed] = useState(false);
  const [meaning, setMeaning] = useState<Meaning>({ s: "ask" });
  const [note, setNote] = useState("");
  const [show, setShow] = useState(false);

  const wild = useStore((s) => s.wild);
  const srs = useStore((s) => s.srs);
  const addWild = useStore((s) => s.addWild);
  const introduce = useStore((s) => s.introduce);

  const taught = meaning.s === "taught" ? meaning.entry : undefined;
  const courseId = taught ? courseIdForHan(han) : undefined;
  const saved = courseId ? !!srs[courseId] : wild.some((w) => w.han === han) || !!srs[wildId(han)];
  // a hint, not a translation: the phrase means something other than its parts
  const inner = useMemo(() => knownWordIn(han), [han]);

  useEffect(() => {
    let live = true;
    setNote("");
    setJp("");
    setJpFailed(false);
    const hit = lookupHan(han);
    setMeaning(hit ? { s: "taught", entry: hit } : { s: "ask" });
    // The jyutping dictionary is a lazy chunk. The service worker precaches it,
    // but a cold first load with no connection can still miss it.
    hanToJyutping(han)
      .then((r) => live && setJp(r))
      .catch(() => live && setJpFailed(true));
    return () => {
      live = false;
    };
  }, [han]);

  async function askWhatItMeans() {
    setMeaning({ s: "loading" });
    try {
      const t = await translateHan(han);
      setMeaning({ s: "found", en: t.en });
      if (t.jp) setJp(t.jp);
    } catch (e) {
      if (e instanceof NoReverseTranslation) setMeaning({ s: "manual" });
      else setMeaning({ s: "error", msg: e instanceof Error ? e.message : "Lookup failed." });
    }
  }

  function onSave() {
    // Already taught? Put the course's own card into the schedule.
    if (taught && courseId) return introduce(courseId);
    if (taught) return addWild({ han, jp, en: taught.en, nt: taught.nt });
    if (meaning.s === "found") return addWild({ han, jp, en: meaning.en, nt: "" });
    if (meaning.s === "manual") return addWild({ han, jp, en: note.trim(), nt: "your own note" });
  }

  // A missing romanization degrades the card; it shouldn't block saving it.
  const canSave =
    (!!jp || jpFailed) &&
    (meaning.s === "taught" || meaning.s === "found" || (meaning.s === "manual" && !!note.trim()));
  const showEn = taught ? taught.en : meaning.s === "found" ? meaning.en : "";

  return (
    <div
      className="mt-4 rounded-[20px] border p-4"
      style={{ borderColor: "color-mix(in srgb, var(--tourist) 40%, var(--line2))" }}
    >
      <div className="font-mono text-[9.5px] uppercase tracking-[.16em]" style={{ color: "var(--tourist)" }}>
        Heard it in the wild?
      </div>

      <div className="mt-2 flex items-center gap-3.5">
        <div className="min-w-0 flex-1">
          <div className="font-hk text-[24px] leading-snug">{han}</div>
          {jp ? (
            <Jyutping jp={jp} className="mt-1 block font-mono text-[12.5px]" />
          ) : (
            <div className="mt-1 font-mono text-[12.5px] text-mut">
              {jpFailed ? "no jyutping — save it anyway" : "romanizing…"}
            </div>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <ShowButton onClick={() => setShow(true)} className="h-[44px] w-[44px]" />
          <Speaker text={han} className="h-[44px] w-[44px]" />
        </div>
      </div>

      {taught && (
        <div className="mt-3 border-t border-line2 pt-3">
          <div className="text-[13.5px] text-ink2">{taught.en}</div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[.12em]" style={{ color: taught.cv }}>
            Already in the course · {taught.zone}
          </div>
        </div>
      )}

      {meaning.s === "ask" && (
        <>
          {inner && (
            <div className="mt-3 border-t border-line2 pt-3 text-[12px] leading-[1.6] text-mut">
              You already know <span className="font-hk text-ink2">{inner.han}</span> in there —{" "}
              {inner.en.toLowerCase()}.
            </div>
          )}
          <button
            onClick={askWhatItMeans}
            className="mt-3 w-full rounded-[13px] border border-line bg-surface2 py-3 font-disp text-[13px] font-semibold text-ink2"
          >
            What does it mean?
          </button>
        </>
      )}

      {meaning.s === "loading" && (
        <div className="mt-3 py-3 text-center font-mono text-[11px] uppercase tracking-[.14em] text-mut">
          Looking it up…
        </div>
      )}

      {meaning.s === "found" && (
        <div className="mt-3 border-t border-line2 pt-3">
          <div className="text-[13.5px] text-ink2">{meaning.en}</div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[.12em] text-mut">
            Machine translated · check it with a local
          </div>
        </div>
      )}

      {meaning.s === "manual" && (
        <div className="mt-3 border-t border-line2 pt-3">
          <p className="text-[12px] leading-[1.6] text-mut">
            Looking up Cantonese needs the updated server. Write down what you think it means
            and save it anyway — you can fix it later.
          </p>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What you reckon it means"
            aria-label="What you reckon it means"
            className="mt-2 w-full rounded-[13px] border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-mut focus:border-acc"
          />
        </div>
      )}

      {meaning.s === "error" && (
        <div className="mt-3 border-t border-line2 pt-3">
          <p className="text-[12px] leading-[1.6] text-mut">{meaning.msg}</p>
          <button onClick={askWhatItMeans} className="mt-2 text-[12px] text-acc2 underline">
            Try again
          </button>
        </div>
      )}

      {saved ? (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-[13px] border border-line2 py-3 font-disp text-[13px] font-semibold text-t3">
          <IconCheck className="h-3.5 w-3.5" />
          Saved — it's in tomorrow's reviews
        </div>
      ) : (
        canSave && (
          <button
            onClick={onSave}
            className="mt-3 w-full rounded-[13px] py-3 font-disp text-[13.5px] font-bold text-bg"
            style={{ background: "var(--tourist)" }}
          >
            {taught ? "Add to my reviews" : "Save to my words"}
          </button>
        )
      )}

      {show && <ShowCard han={han} jp={jp} en={showEn} onClose={() => setShow(false)} />}
    </div>
  );
}
