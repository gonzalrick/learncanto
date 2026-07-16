import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  translateEnglish,
  recentTranslations,
  clearTranslations,
  hanToJyutping,
} from "./translate";

const ok = (han: string) =>
  ({ ok: true, json: async () => ({ han }) }) as Response;

describe("hanToJyutping", () => {
  it("romanizes characters with the local dictionary", async () => {
    expect(await hanToJyutping("我識講少少廣東話")).toBe(
      "ngo5 sik1 gong2 siu2 siu2 gwong2 dung1 waa2",
    );
  });
});

describe("translateEnglish", () => {
  beforeEach(() => {
    clearTranslations();
    vi.stubGlobal("fetch", vi.fn(async () => ok("我識講少少廣東話")));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearTranslations();
  });

  it("calls the API and derives jyutping locally", async () => {
    const t = await translateEnglish("I can speak a little Cantonese");
    expect(t.han).toBe("我識講少少廣東話");
    expect(t.jp).toBe("ngo5 sik1 gong2 siu2 siu2 gwong2 dung1 waa2");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("serves repeats from the cache without a network call", async () => {
    await translateEnglish("hello there");
    const again = await translateEnglish("  Hello   THERE ");
    expect(again.han).toBe("我識講少少廣東話");
    expect(fetch).toHaveBeenCalledOnce();
    expect(recentTranslations()).toHaveLength(1);
  });

  it("keeps history newest first", async () => {
    await translateEnglish("first");
    await translateEnglish("second");
    expect(recentTranslations().map((t) => t.en)).toEqual(["second", "first"]);
  });

  it("throws a friendly error when offline", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fail"))));
    await expect(translateEnglish("hello")).rejects.toThrow(/offline/);
  });

  it("throws when the service errors", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false }) as Response));
    await expect(translateEnglish("hello")).rejects.toThrow(/isn't reachable/);
  });
});
