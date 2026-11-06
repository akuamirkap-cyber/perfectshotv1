/**
 * 1:1 port of the Firework 8-Gun sound engine (slide 2, `games/fireworkgun/src/game/sfx.ts`)
 * for the FIREWORK LAUNCHER weapon of slide 1 (Gun Hit Arcade).
 *
 * The synthesis graph, the envelopes and every number below are copied verbatim from
 * slide 2, so a shot / hit / boom / stage clear on slide 1 sounds exactly like slide 2:
 *   master 0.8 -> compressor(-14, 6) -> speakers
 *   dry + 2.2s generated reverb (send 0.45)
 *
 * Only the firework weapon's sounds live here (`shoot`, `hit`, `boom`, `skyLaunch`,
 * `clear`, `fail`); the other slide-2/3 weapons keep using `slide23Sfx`.
 */
const PENTA = [0, 2, 4, 7, 9];

export function fwNoteFreq(i: number): number {
  const oct = Math.min(Math.floor(i / 5), 2);
  const semi = PENTA[i % 5] + oct * 12;
  return 523.25 * Math.pow(2, semi / 12);
}

class FireworkSlide2Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private dry: GainNode | null = null;
  private wet: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;
  private lastBoom = 0;

  init() {
    if (this.ctx) {
      try {
        if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      if (typeof window === 'undefined') return;
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      this.buildGraph(ctx);
    } catch {
      this.ctx = null;
    }
  }

  private buildGraph(ctx: AudioContext) {
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    this.dry = ctx.createGain();
    this.dry.connect(this.master);

    // Warm 1.2s stereo reverb impulse with WebAudio equal-power normalization enabled
    const conv = ctx.createConvolver();
    conv.normalize = true;
    const len = Math.max(1, Math.floor(ctx.sampleRate * 1.2));
    const imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = imp.getChannelData(ch);
      let smooth = 0;
      for (let i = 0; i < len; i++) {
        const raw = Math.random() * 2 - 1;
        smooth = smooth * 0.4 + raw * 0.6;
        d[i] = smooth * Math.pow(1 - i / len, 2.7);
      }
    }
    conv.buffer = imp;
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.36;
    this.wet.connect(conv);
    conv.connect(this.master);

    const nl = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, nl, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;

    try {
      if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    } catch {
      /* ignore */
    }
  }

  private volume = 1;

  setMuted(m: boolean) {
    this.muted = m;
    try {
      if (this.ctx && this.master) {
        this.master.gain.setTargetAtTime(m ? 0 : 0.8 * this.volume, this.ctx.currentTime, 0.02);
      }
    } catch {
      /* ignore */
    }
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    try {
      if (this.ctx && this.master) {
        this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8 * this.volume, this.ctx.currentTime, 0.02);
      }
    } catch {
      /* ignore */
    }
  }

  unlock() {
    this.init();
  }

  /** Lazy accessor: every sound silently no-ops until an AudioContext exists. */
  private ready(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) this.init();
    if (!this.ctx) return null;
    try {
      if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
    } catch {
      /* ignore */
    }
    return this.ctx;
  }

  // ---------------------------------------------------------------- primitives
  private tone(
    freq: number,
    t0: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    slideTo?: number,
    reverb = 0.5,
    attack = 0.005,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.dry || !this.wet) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(this.dry);
    if (reverb > 0) {
      const s = ctx.createGain();
      s.gain.value = reverb;
      g.connect(s);
      s.connect(this.wet);
    }
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  private noiseBurst(
    t0: number,
    dur: number,
    vol: number,
    type: BiquadFilterType,
    f0: number,
    f1: number,
    q = 1,
    reverb = 0.4,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.noise || !this.dry || !this.wet) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const off = Math.random() * 1.5;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(Math.max(vol, 0.0002), t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.dry);
    if (reverb > 0) {
      const s = ctx.createGain();
      s.gain.value = reverb;
      g.connect(s);
      s.connect(this.wet);
    }
    src.start(t0, off, dur + 0.05);
  }

  private bell(freq: number, t0: number, vol: number, dur = 0.9) {
    this.tone(freq, t0, dur, 'sine', vol, undefined, 0.7);
    this.tone(freq * 2.01, t0, dur * 0.6, 'sine', vol * 0.45, undefined, 0.7);
    this.tone(freq * 3.97, t0, dur * 0.35, 'sine', vol * 0.2, undefined, 0.7);
    this.tone(freq * 0.5, t0, dur * 0.5, 'triangle', vol * 0.25, undefined, 0.5);
  }

  private crackle(t0: number, count: number, span: number, vol: number) {
    for (let i = 0; i < count; i++) {
      const t = t0 + Math.random() * span;
      this.noiseBurst(
        t,
        0.015 + Math.random() * 0.03,
        vol * (0.4 + Math.random() * 0.6),
        'highpass',
        3500 + Math.random() * 4000,
        2000,
        0.8,
        0.25,
      );
    }
  }

  // ------------------------------------------------------------ firework sounds
  /** Slide 2 `shoot()` — launcher thump, whoosh, rising whistle, sparkly pop. */
  shoot() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(220, t, 0.16, 'sine', 0.7, 45, 0.2);
    this.noiseBurst(t, 0.1, 0.5, 'lowpass', 3000, 300, 0.7, 0.3);
    this.noiseBurst(t + 0.01, 0.28, 0.16, 'bandpass', 900, 4200, 3, 0.5);
    this.tone(700 + Math.random() * 150, t + 0.01, 0.26, 'sine', 0.1, 2600, 0.6, 0.02);
    this.tone(1400, t, 0.05, 'square', 0.05, 600, 0.3);
  }

  /** Slide 2 `hit(idx)` — thud, pop, pentatonic bell, sparkle crackle and shimmer. */
  hit(idx: number) {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    const f = fwNoteFreq(idx);
    this.tone(150, t, 0.12, 'sine', 0.5, 55, 0.2);
    this.noiseBurst(t, 0.22, 0.38, 'bandpass', 1800, 500, 0.9, 0.55);
    this.bell(f, t + 0.01, 0.2, 1.0);
    this.bell(f * 1.5, t + 0.07, 0.09, 0.7);
    this.crackle(t + 0.08, 14, 0.5, 0.2);
    this.tone(f * 4, t + 0.03, 0.4, 'sine', 0.05, f * 6, 0.9, 0.05);
  }

  /** Slide 2 `boom(size)` — throttled (40 ms) so stacked bursts never clip. */
  boom(size = 1, delay = 0) {
    if (!this.ready()) return;
    const now = this.ctx!.currentTime;
    if (now - this.lastBoom < 0.04) return;
    this.lastBoom = now;
    const t = now + delay;
    this.tone(110 * (1.2 - size * 0.3), t, 0.5 + size * 0.3, 'sine', 0.55 * Math.min(size, 1.2), 28, 0.5);
    this.noiseBurst(t, 0.45 + size * 0.3, 0.55 * Math.min(size, 1.2), 'lowpass', 2400, 120, 0.6, 0.7);
    this.noiseBurst(t, 0.3, 0.25, 'highpass', 2500, 900, 0.7, 0.5);
    this.crackle(t + 0.12, Math.round(12 + size * 12), 0.9 + size * 0.4, 0.17);
  }

  /** Slide 2 `skyLaunch()` — the faint whistle of a rocket leaving the skyline. */
  skyLaunch() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.noiseBurst(t, 0.5, 0.07, 'bandpass', 700, 3200, 3, 0.6);
    this.tone(600, t, 0.5, 'sine', 0.035, 2400, 0.7, 0.05);
  }

  /** Slide 2 `clear()` — big boom + rising pentatonic run + final chord + crackle. */
  clear() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.boom(1.4);
    const seq = [0, 2, 4, 7, 9, 12, 16, 19, 24];
    seq.forEach((s, i) => {
      const f = 523.25 * Math.pow(2, s / 12);
      this.bell(f, t + 0.12 + i * 0.085, 0.17, 1.3);
    });
    [0, 4, 7, 12].forEach((s) => {
      this.bell(523.25 * Math.pow(2, s / 12), t + 0.95, 0.12, 2);
    });
    this.crackle(t + 0.2, 40, 1.8, 0.15);
  }

  /** Slide 2 `fail()` — rocket crashes into the board. */
  fail() {
    if (!this.ready()) return;
    const t = this.ctx!.currentTime;
    this.tone(320, t, 0.6, 'sawtooth', 0.2, 60, 0.5);
    this.tone(240, t + 0.02, 0.7, 'square', 0.1, 45, 0.5);
    this.noiseBurst(t, 0.5, 0.5, 'lowpass', 3000, 150, 0.8, 0.5);
    this.tone(90, t, 0.4, 'sine', 0.7, 30, 0.2);
    this.bell(392, t + 0.25, 0.1, 0.8);
    this.bell(311, t + 0.45, 0.1, 0.9);
    this.bell(262, t + 0.7, 0.1, 1.3);
  }
}

export const fireworkSfx = new FireworkSlide2Sfx();
