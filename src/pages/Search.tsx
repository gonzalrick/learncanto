import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DICTIONARY, searchDictionary } from "../lib/dictionary";
import { Jyutping } from "../components/Jyutping";
import { Speaker } from "../components/Speaker";
import { IconSearch, IconX } from "../components/icons";

export function Search() {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchDictionary(q), [q]);
  const query = q.trim();

  return (
    <div>
      <div className="px-0.5 pt-2.5 pb-4">
        <div className="font-mono text-[10.5px] uppercase tracking-[.18em] text-mut">
          Dictionary · {DICTIONARY.length} words & phrases
        </div>
        <div className="mt-1.5 font-disp text-[25px] font-extrabold leading-[1.1] -tracking-[.02em]">
          Search
          <span className="ml-2 font-hk text-[19px] font-normal text-mut">搵字</span>
        </div>
      </div>

      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-mut" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='English, jyutping or 中文 — try "thank you"'
          autoFocus
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="search"
          className="w-full rounded-[16px] border border-line bg-surface py-3 pl-11 pr-11 text-[15px] text-ink outline-none placeholder:text-mut focus:border-acc"
        />
        {q && (
          <button
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mut hover:text-ink"
          >
            <IconX className="h-[14px] w-[14px]" />
          </button>
        )}
      </div>

      {query === "" ? (
        <p className="mt-4 px-1 text-[12.5px] leading-[1.7] text-mut">
          Look up anything the course teaches — type English (<i>water</i>, <i>thank you</i>,{" "}
          <i>where is the toilet</i>), jyutping (<i>nei hou</i>) or paste 中文. Close-enough
          spelling is fine. Tap the speaker to hear it.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-4 px-1 text-[12.5px] leading-[1.7] text-mut">
          No matches for “{query}”. Try a shorter or simpler word — this dictionary only knows
          what the course teaches. Or{" "}
          <Link to={"/translate?q=" + encodeURIComponent(query)} className="text-acc2 underline">
            translate it with AI
          </Link>
          .
        </p>
      ) : (
        <>
          <div className="mt-4 px-1 font-mono text-[10.5px] uppercase tracking-[.15em] text-mut">
            {results.length} match{results.length === 1 ? "" : "es"}
          </div>
          {results.map((e) => (
            <div key={e.han} className="mt-3 flex items-center gap-3.5 rounded-[20px] border border-line2 bg-surface p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="font-hk text-[21px] leading-tight">{e.han}</span>
                  <Jyutping jp={e.jp} className="font-mono text-xs" />
                </div>
                <div className="mt-1 text-[13.5px] text-ink2">{e.en}</div>
                {e.nt && <div className="mt-1 text-[11.5px] leading-[1.5] text-mut">{e.nt}</div>}
                <div className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[.12em]" style={{ color: e.cv }}>
                  {e.zone}
                </div>
              </div>
              <Speaker text={e.han} className="h-[44px] w-[44px] shrink-0" />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
