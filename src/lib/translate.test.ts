import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  translateEnglish,
  translateHan,
  NoReverseTranslation,
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

  it("asks for the default direction, so an old server still answers it", async () => {
    await translateEnglish("hello");
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.dir).toBeUndefined();
  });
});

describe("translateHan", () => {
  const okEn = (en: string) => ({ ok: true, json: async () => ({ en }) }) as Response;

  beforeEach(() => {
    clearTranslations();
    vi.stubGlobal("fetch", vi.fn(async () => okEn("I want an iced milk tea")));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    clearTranslations();
  });

  it("asks the server for English and romanizes locally", async () => {
    const t = await translateHan("我要一杯凍奶茶");
    expect(t.en).toBe("I want an iced milk tea");
    expect(t.jp).toBe("ngo5 jiu3 jat1 bui1 dung3 naai5 caa4");
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body).toEqual({ text: "我要一杯凍奶茶", dir: "yue2en" });
  });

  it("serves repeats from the cache, so it works offline afterwards", async () => {
    await translateHan("我要一杯凍奶茶");
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("offline"))));
    const again = await translateHan("我要一杯凍奶茶");
    expect(again.en).toBe("I want an iced milk tea");
  });

  it("keeps its cache separate from the English→Cantonese one", async () => {
    await translateHan("我要一杯凍奶茶");
    expect(recentTranslations()).toEqual([]); // the page's history is unpolluted
  });

  it("signals a server that predates this direction, rather than erroring", async () => {
    // an old deployment ignores `dir` and hands back Cantonese under `han`
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ han: "冇嘢" }) }) as Response));
    await expect(translateHan("蛋撻")).rejects.toBeInstanceOf(NoReverseTranslation);

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 400 }) as Response));
    await expect(translateHan("蛋撻")).rejects.toBeInstanceOf(NoReverseTranslation);
  });

  it("throws a friendly error when offline with nothing cached", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fail"))));
    await expect(translateHan("蛋撻")).rejects.toThrow(/offline/);
  });

  it("refuses empty input", async () => {
    await expect(translateHan("   ")).rejects.toThrow(/Nothing to look up/);
  });
});
