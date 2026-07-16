import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { SessionOverlay } from "./SessionOverlay";
import { useSession } from "../lib/session-store";
import { useStore } from "../lib/store";
import { startEarDrill } from "../lib/launch";
import type { EarItem } from "../lib/session";

function drill(n: number): EarItem[] {
  return Array.from({ length: n }, (_, k) => ({
    han: "字" + k,
    jp: "zi6",
    en: "meaning-" + k,
    opts: [
      { han: "字" + k, jp: "zi6", en: "meaning-" + k },
      { han: "x", jp: "x1", en: "wrong-a-" + k },
      { han: "y", jp: "y1", en: "wrong-b-" + k },
    ],
    ok: 0,
  }));
}

describe("SessionOverlay — quick ear drill", () => {
  beforeEach(() => {
    cleanup();
    useStore.getState().reset();
    useSession.getState().close();
  });

  it("renders the first ear card immediately on open (no crash on empty first frame)", () => {
    render(<SessionOverlay />);
    // opening a drill must not throw and must show the prompt + options
    act(() =>
      useSession.getState().start(
        drill(3).map((e) => ({ t: "listen" as const, e })),
        "drill",
      ),
    );
    expect(screen.getByText("字0")).toBeInTheDocument();
    expect(screen.getByText("Listen while you read it — then tap what it means.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "meaning-0" })).toBeInTheDocument();
  });

  it("advances through all reps to the done screen when answered correctly", () => {
    render(<SessionOverlay />);
    act(() =>
      useSession.getState().start(
        drill(3).map((e) => ({ t: "listen" as const, e })),
        "drill",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "meaning-0" }));
    fireEvent.click(screen.getByRole("button", { name: "meaning-1" }));
    fireEvent.click(screen.getByRole("button", { name: "meaning-2" }));
    expect(screen.getByText("Nice drill")).toBeInTheDocument();
    // a drill does not advance the streak
    expect(useStore.getState().days.streak).toBe(0);
  });

  it("startEarDrill() opens a 6-rep listen session from real Dojo data", () => {
    render(<SessionOverlay />);
    act(() => startEarDrill());
    const st = useSession.getState();
    expect(st.active).toBe(true);
    expect(st.items).toHaveLength(6);
    expect(st.items.every((i) => i.t === "listen")).toBe(true);
    // the overlay renders (close control + play + options), not a crash
    expect(screen.getByRole("button", { name: "Close session" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play audio" })).toBeInTheDocument();
    expect(screen.getByText(/tap what it means/)).toBeInTheDocument();
    // close + play + ≥3 options
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(5);
  });
});
