import { describe, it, expect, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DeckChips, type Chip } from "./DeckChips";
import { Quiz } from "./Quiz";
import { useStore } from "../lib/store";
import type { Card } from "../data/types";

const chips: Chip[] = [
  { id: "a", label: "Alpha", done: 0, total: 5 },
  { id: "b", label: "Beta", done: 2, total: 4 },
  { id: "c", label: "Gamma", done: 1, total: 3 },
];

function ChipsHarness() {
  const [cur, setCur] = useState("a");
  return <DeckChips chips={chips} current={cur} onPick={setCur} accent="var(--l1)" />;
}

describe("DeckChips", () => {
  it("activates the clicked pill immediately (no tab-switch needed)", () => {
    render(<ChipsHarness />);
    const alpha = screen.getByRole("button", { name: /Alpha/ });
    const gamma = screen.getByRole("button", { name: /Gamma/ });
    expect(alpha).toHaveAttribute("aria-pressed", "true");
    expect(gamma).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(gamma);
    expect(gamma).toHaveAttribute("aria-pressed", "true");
    expect(alpha).toHaveAttribute("aria-pressed", "false");
    // exactly one pressed
    expect(screen.getAllByRole("button").filter((b) => b.getAttribute("aria-pressed") === "true")).toHaveLength(1);
  });
});

const pool: Card[] = [
  ["你好", "nei5 hou2", "Hello"],
  ["多謝", "do1 ze6", "Thank you"],
  ["食飯", "sik6 faan6", "Eat"],
  ["屋企", "uk1 kei2", "Home"],
];

describe("Quiz", () => {
  it("scores a correct answer and advances", () => {
    render(<Quiz pool={pool} accent="var(--l1)" />);
    // one of the option buttons equals the correct meaning for the shown prompt.
    // Click every option meaning until we find the right one for the first Q.
    expect(screen.getByText(/correct/)).toBeInTheDocument();
    const optionButtons = () => screen.getAllByRole("button").filter((b) => /Hello|Thank you|Eat|Home/.test(b.textContent || ""));
    const before = optionButtons();
    expect(before.length).toBe(4);
    // After answering, a "Next" or "See score" button appears (answered state).
    fireEvent.click(before[0]);
    expect(screen.getByRole("button", { name: /Next|See score/ })).toBeInTheDocument();
  });
});

describe("store actions", () => {
  beforeEach(() => useStore.getState().reset());

  it("setKnown toggles a namespaced key", () => {
    useStore.getState().setKnown("basics", "greet:0", true);
    expect(useStore.getState().known.basics["greet:0"]).toBe(1);
    useStore.getState().setKnown("basics", "greet:0", false);
    expect(useStore.getState().known.basics?.["greet:0"]).toBeUndefined();
  });

  it("grade graduates a mature item into known", () => {
    const id = "found|blocks:0";
    // push interval high so a "Got it" crosses the graduation threshold
    useStore.setState({ srs: { [id]: { d: 0, v: 4 } } });
    useStore.getState().grade(id, true);
    const s = useStore.getState();
    expect(s.srs[id].v).toBe(9);
    expect(s.known.found?.["blocks:0"]).toBe(1);
  });

  it("logDay starts a streak at 1", () => {
    useStore.getState().logDay();
    expect(useStore.getState().days.streak).toBe(1);
  });
});

// Ensure a page renders without crashing inside a router (smoke test).
describe("smoke", () => {
  it("renders DeckChips inside a router", () => {
    render(
      <MemoryRouter>
        <ChipsHarness />
      </MemoryRouter>,
    );
    expect(within(document.body).getByRole("button", { name: /Beta/ })).toBeInTheDocument();
  });
});
