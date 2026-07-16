import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  translateEnglish,
  recentTranslations,
  clearTranslations,
  type Translation,
} from "../lib/translate";
import { Jyutping } from "../components/Jyutping";
import { Speaker } from "../components/Speaker";

export function Translate() {
  const [params] = useSearchParams();
  const [text, setText] = useState(params.get("q") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Translation | null>(null);
  const [history, setHistory] = useState<Translation[]>(recentTranslations);

  async function go(input?: string) {
    const q = (input ?? text).trim();
    if (!q || busy) return;
    setBusy(true);
    setError("");
    try {
      const t = await translateEnglish(q);
      setResult(t);
      setText(t.en);
      setHistory(recentTranslations());
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Translation failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="px-0.5 pt-2.5 pb-4">
        <div className="font-mono text-[10.5px] uppercase tracking-[.18em] text-mut">
          English → spoken Cantonese
        </div>
        <div className="mt-1.5 font-disp text-[25px] font-extrabold leading-[1.1] -tracking-[.02em]">
          Translate
          <span className="ml-2 font-hk text-[19px] font-normal text-mut">翻譯</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go();
        }}
        className="flex gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='An English sentence — try "I can speak a little Cantonese"'
          autoFocus
          autoCorrect="on"
          enterKeyHint="go"
          className="min-w-0 flex-1 rounded-[16px] border border-line bg-surface px-4 py-3 text-[15px] text-ink outline-none placeholder:text-mut focus:border-acc"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="shrink-0 rounded-[16px] border border-line bg-surface2 px-4 font-disp text-[13px] font-semibold text-ink2 transition-colors hover:border-acc hover:text-acc2 disabled:opacity-50"
        >
          {busy ? "…" : "Translate"}
        </button>
      </form>

      {error && (
        <p className="mt-4 px-1 text-[12.5px] leading-[1.7] text-mut">{error}</p>
      )}

      {result && (
        <div className="mt-4 rounded-[20px] border border-line2 bg-surface p-4">
          <div className="text-[12px] text-mut">{result.en}</div>
          <div className="mt-2 flex items-center gap-3.5">
            <div className="min-w-0 flex-1">
              <div className="font-hk text-[24px] leading-snug">{result.han}</div>
              <Jyutping jp={result.jp} className="mt-1 block font-mono text-[12.5px]" />
            </div>
            <Speaker text={result.han} className="h-[44px] w-[44px] shrink-0" />
          </div>
          <div className="mt-2.5 font-mono text-[9.5px] uppercase tracking-[.12em] text-mut">
            Machine translated · check tones by ear
          </div>
        </div>
      )}

      {!result && !error && (
        <p className="mt-4 px-1 text-[12.5px] leading-[1.7] text-mut">
          Type any English sentence and get the spoken Cantonese (口語) with jyutping and
          audio. Translating needs a connection; everything you've translated before works
          offline from the history below.
        </p>
      )}

      {history.length > 0 && (
        <>
          <div className="mt-6 flex items-baseline justify-between px-1">
            <div className="font-mono text-[10.5px] uppercase tracking-[.15em] text-mut">
              History · works offline
            </div>
            <button
              onClick={() => {
                clearTranslations();
                setHistory([]);
              }}
              className="text-[11px] text-mut hover:text-acc2"
            >
              Clear
            </button>
          </div>
          {history.map((t) => (
            <button
              key={t.en.toLowerCase()}
              onClick={() => {
                setResult(t);
                setText(t.en);
                window.scrollTo({ top: 0 });
              }}
              className="mt-3 flex w-full items-center gap-3.5 rounded-[20px] border border-line2 bg-surface p-4 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[11.5px] text-mut">{t.en}</span>
                <span className="mt-0.5 block font-hk text-[17px] leading-snug">{t.han}</span>
                <Jyutping jp={t.jp} className="font-mono text-[11px]" />
              </span>
              <Speaker text={t.han} className="h-[38px] w-[38px] shrink-0" />
            </button>
          ))}
        </>
      )}
    </div>
  );
}
