// Short "correct answer" chime — synthesised so there's no audio asset to load.

let ctx: AudioContext | null = null;

/** Two-note rise played when a quiz answer is right. */
export function ding() {
  try {
    if (typeof AudioContext === "undefined") return;
    if (!ctx) ctx = new AudioContext();
    // Autoplay policies park the context until a gesture — answering is one.
    if (ctx.state === "suspended") void ctx.resume();

    const t0 = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);

    [1318.5, 1975.5].forEach((hz, i) => {
      const osc = ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(hz, t0 + i * 0.085);
      osc.connect(gain);
      osc.start(t0 + i * 0.085);
      osc.stop(t0 + 0.42);
    });
  } catch {
    /* audio unavailable — silent */
  }
}
