// Cantonese speech synthesis — ports voice.js + the per-page pickVoice/speak.
// Picks the best installed zh-HK / Cantonese voice and forces it on utterances.

let voice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const vs = speechSynthesis.getVoices();
  voice =
    vs.find((v) => /zh[-_]HK|yue|cantonese/i.test(v.lang + " " + v.name)) ||
    vs.find((v) => /zh[-_]Hant|zh[-_]TW/i.test(v.lang)) ||
    vs.find((v) => /^zh/i.test(v.lang)) ||
    null;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export function speak(text: string, rate = 0.8) {
  try {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(text).replace(/[?？…]/g, ""));
    u.lang = "zh-HK";
    if (voice) u.voice = voice;
    u.rate = rate;
    speechSynthesis.speak(u);
  } catch {
    /* speech unavailable — silent */
  }
}

export function cancelSpeech() {
  try {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/** True when the device has no Chinese voice (used by the Dojo warning banner). */
export function hasChineseVoice(): boolean {
  if (!("speechSynthesis" in window)) return false;
  return speechSynthesis.getVoices().some((v) => /^zh/i.test(v.lang));
}
