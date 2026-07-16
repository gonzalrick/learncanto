import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement } from "react";
import { Today } from "./Today";
import { Search } from "./Search";
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

  it.each(["basics", "beyond", "conversational", "family"])("VocabLesson[%s] renders", (page) => {
    wrap(<VocabLesson page={page} />);
    // each vocab page shows at least one deck chip / tab
    expect(screen.getAllByRole("button").length).toBeGreaterThan(2);
  });
});
