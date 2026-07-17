import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { Today } from "./Today";
import { Search } from "./Search";
import { Translate } from "./Translate";
import { clearTranslations } from "../lib/translate";
import { vi } from "vitest";
import { Line } from "./Line";
import { Practice } from "./Practice";
import { Foundations } from "./Foundations";
import { Characters } from "./Characters";
import { Dojo } from "./Dojo";
import { VocabLesson } from "./VocabLesson";
import { useStore } from "../lib/store";

const wrap = (el: ReactElement) => render(<MemoryRouter>{el}</MemoryRouter>);

describe("page render smoke tests", () => {
  beforeEach(() => {
    useStore.getState().reset();
    cleanup();
  });

  it("Today renders the daily session card", () => {
    wrap(<Today />);
    expect(screen.getByText(/Today's session/)).toBeInTheDocument();
    expect(screen.getByText(/Start today's run/)).toBeInTheDocument();
  });

  it("Line renders the route map with all six zones", () => {
    wrap(<Line />);
    expect(screen.getByText("You are here")).toBeInTheDocument();
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Conversational")).toBeInTheDocument();
    expect(screen.getByText(/Terminus/)).toBeInTheDocument();
  });

  it("Practice renders the free-play tiles", () => {
    wrap(<Practice />);
    expect(screen.getByText("Listening Dojo")).toBeInTheDocument();
    expect(screen.getByText("Learn the Characters")).toBeInTheDocument();
  });

  it("Foundations renders the lesson path", () => {
    wrap(<Foundations />);
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("The six tones")).toBeInTheDocument();
  });

  it("Characters renders the reading branch path", () => {
    wrap(<Characters />);
    expect(screen.getByText("Learn the Characters")).toBeInTheDocument();
    expect(screen.getByText("Characters are pictures")).toBeInTheDocument();
  });

  it("Dojo renders the three ear-training tabs", () => {
    wrap(<Dojo />);
    expect(screen.getByRole("tab", { name: "Listen" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Catch it" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Numbers" })).toBeInTheDocument();
  });

  it("Search finds a word and offers to play it", async () => {
    wrap(<Search />);
    const input = screen.getByPlaceholderText(/try "thank you"/);
    await userEvent.type(input, "good morning");
    expect(screen.getByText("早晨")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Hear it" }).length).toBeGreaterThan(0);
  });

  it("Translate calls the API and shows han + jyutping + play button", async () => {
    clearTranslations();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ han: "我識講少少廣東話" }) })),
    );
    try {
      wrap(<Translate />);
      const input = screen.getByPlaceholderText(/An English sentence/);
      await userEvent.type(input, "I can speak a little Cantonese");
      await userEvent.click(screen.getByRole("button", { name: "Translate" }));
      // appears in both the result card and the offline history list
      expect((await screen.findAllByText("我識講少少廣東話")).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/ngo5/).length).toBeGreaterThan(0);
      expect(screen.getAllByRole("button", { name: "Hear it" }).length).toBeGreaterThan(0);
    } finally {
      vi.unstubAllGlobals();
      clearTranslations();
    }
  });

  it.each(["basics", "beyond", "conversational", "family", "tourist"])(
    "VocabLesson[%s] renders",
    (page) => {
      wrap(<VocabLesson page={page} />);
      // each vocab page shows at least one deck chip / tab
      expect(screen.getAllByRole("button").length).toBeGreaterThan(2);
    },
  );

  it("Tourist renders the survival decks", () => {
    wrap(<VocabLesson page="tourist" />);
    expect(screen.getByText("Hong Kong Survival")).toBeInTheDocument();
    expect(screen.getByText("八達通")).toBeInTheDocument(); // first deck, first card
  });

  it("Today surfaces the tourist deck for the hour", () => {
    vi.setSystemTime(new Date(2026, 6, 18, 8, 30)); // breakfast
    try {
      wrap(<Today />);
      expect(screen.getByText(/Breakfast run/)).toBeInTheDocument();
      expect(screen.getByText(/All ordering food phrases/i)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("Today swaps that deck as the day moves on", () => {
    vi.setSystemTime(new Date(2026, 6, 18, 12, 0)); // midday, on the move
    try {
      wrap(<Today />);
      expect(screen.getByText(/On the move/)).toBeInTheDocument();
      expect(screen.getByText(/All getting around phrases/i)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("Search offers to catch 中文 the course doesn't teach", async () => {
    wrap(<Search />);
    await userEvent.type(screen.getByPlaceholderText(/try "thank you"/), "呢度嘅奶茶好正");
    expect(await screen.findByText(/Heard it in the wild/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /What does it mean/ })).toBeInTheDocument();
    // and it points out the bit already learned, without claiming it's the meaning
    expect(screen.getByText(/You already know/)).toBeInTheDocument();
  });

  it("Search recognises 中文 the course does teach", async () => {
    wrap(<Search />);
    await userEvent.type(screen.getByPlaceholderText(/try "thank you"/), "早晨");
    // an exact course phrase is a plain search hit, not a capture prompt
    expect(screen.queryByText(/Heard it in the wild/)).not.toBeInTheDocument();
  });

  it("Practice lists words caught in the wild once there are any", () => {
    expect(screen.queryByText(/My words/)).not.toBeInTheDocument();
    useStore.getState().addWild({ han: "蛋撻", jp: "daan6 taat1", en: "egg tart", nt: "" });
    wrap(<Practice />);
    expect(screen.getByText(/My words/)).toBeInTheDocument();
    expect(screen.getByText("蛋撻")).toBeInTheDocument();
    expect(screen.getByText("due tomorrow")).toBeInTheDocument();
  });
});
