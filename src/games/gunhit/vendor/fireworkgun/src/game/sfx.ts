// Synthesised firework sound engine (WebAudio, no assets needed)

const PENTA = [0, 2, 4, 7, 9];

export function noteFreq(i: number): number {
  const oct = Math.min(Math.floor(i / 5), 2);
  const semi = PENTA[i % 5] + oct * 12;
  return 523.25 * Math.pow(2, semi / 12);
}

export class Sfx {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private dry!: GainNode;
  private wet!: GainNode;
  private noise!: AudioBuffer;
  muted = false;
  private lastBoom = 0;

  init() {
    if (this.ctx) {
      try {
        if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => undefined);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.ctx = ctx;
      this.buildGraph(ctx);
    } catch (e) {
      console.error("[gunhit] audio unavailable:", e);
      this.ctx = null;
    }
  }

  private buildGraph(ctx: AudioContext) {
    void 0;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 6;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    this.dry = ctx.createGain();
    this.dry.connect(this.master);

    // simple generated reverb
    const conv = ctx.createConvolver();
    const len = ctx.sampleRate * 2.2;
    const imp = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = imp.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    conv.buffer = imp;
    this.wet = ctx.createGain();
    this.wet.gain.value = 0.45;
    this.wet.connect(conv);
    conv.connect(this.master);

    // noise buffer
    const nl = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, nl, ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;

    try {
      if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    } catch {
      /* ignore */
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    try {
      if (this.ctx && this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.8, this.ctx.currentTime, 0.02);
    } catch {
      /* ignore */
    }
  }

  // ---------- primitives ----------
  private tone(
    freq: number,
    t0: number,
    dur: number,
    type: OscillatorType,
    vol: number,
    slideTo?: number,
    reverb = 0.5,
    attack = 0.005
  ) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
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
    reverb = 0.4
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const off = Math.random() * 1.5;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
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
    // glockenspiel-ish: a few inharmonic partials
    this.tone(freq, t0, dur, "sine", vol, undefined, 0.7);
    this.tone(freq * 2.01, t0, dur * 0.6, "sine", vol * 0.45, undefined, 0.7);
    this.tone(freq * 3.97, t0, dur * 0.35, "sine", vol * 0.2, undefined, 0.7);
    this.tone(freq * 0.5, t0, dur * 0.5, "triangle", vol * 0.25, undefined, 0.5);
  }

  private crackle(t0: number, count: number, span: number, vol: number) {
    for (let i = 0; i < count; i++) {
      const t = t0 + Math.random() * span;
      this.noiseBurst(t, 0.015 + Math.random() * 0.03, vol * (0.4 + Math.random() * 0.6), "highpass", 3500 + Math.random() * 4000, 2000, 0.8, 0.25);
    }
  }

  // water bubble "blup" — pitch slides UP quickly
  private bubble(freq: number, t0: number, vol: number, dur = 0.18) {
    this.tone(freq, t0, dur, "sine", vol, freq * 2.6, 0.6, 0.008);
    this.tone(freq * 1.5, t0 + 0.015, dur * 0.7, "sine", vol * 0.4, freq * 3.4, 0.6, 0.008);
  }

  private splash(t0: number, vol: number, dur = 0.5, bright = 1) {
    this.noiseBurst(t0, dur, vol, "bandpass", 2600 * bright, 400, 1.1, 0.65);
    this.noiseBurst(t0 + 0.02, dur * 0.7, vol * 0.6, "highpass", 3200 * bright, 1200, 0.8, 0.5);
  }

  // ---------- game sounds ----------
  click() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(660, t, 0.12, "triangle", 0.18, 990, 0.3);
  }

  shoot() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // launcher "thump"
    this.tone(220, t, 0.16, "sine", 0.7, 45, 0.2);
    this.noiseBurst(t, 0.1, 0.5, "lowpass", 3000, 300, 0.7, 0.3);
    // whoosh / whistle rising
    this.noiseBurst(t + 0.01, 0.28, 0.16, "bandpass", 900, 4200, 3, 0.5);
    this.tone(700 + Math.random() * 150, t + 0.01, 0.26, "sine", 0.1, 2600, 0.6, 0.02);
    // sparkly pop
    this.tone(1400, t, 0.05, "square", 0.05, 600, 0.3);
  }

  hit(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const f = noteFreq(idx);
    // soft thud
    this.tone(150, t, 0.12, "sine", 0.5, 55, 0.2);
    // pop + burst
    this.noiseBurst(t, 0.22, 0.38, "bandpass", 1800, 500, 0.9, 0.55);
    // melodic bell
    this.bell(f, t + 0.01, 0.2, 1.0);
    this.bell(f * 1.5, t + 0.07, 0.09, 0.7);
    // sparkle crackles
    this.crackle(t + 0.08, 14, 0.5, 0.2);
    // shimmer
    this.tone(f * 4, t + 0.03, 0.4, "sine", 0.05, f * 6, 0.9, 0.05);
  }

  boom(size = 1, delay = 0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBoom < 0.04) return;
    this.lastBoom = now;
    const t = now + delay;
    this.tone(110 * (1.2 - size * 0.3), t, 0.5 + size * 0.3, "sine", 0.55 * Math.min(size, 1.2), 28, 0.5);
    this.noiseBurst(t, 0.45 + size * 0.3, 0.55 * Math.min(size, 1.2), "lowpass", 2400, 120, 0.6, 0.7);
    this.noiseBurst(t, 0.3, 0.25, "highpass", 2500, 900, 0.7, 0.5);
    this.crackle(t + 0.12, Math.round(12 + size * 12), 0.9 + size * 0.4, 0.17);
  }

  skyLaunch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.5, 0.07, "bandpass", 700, 3200, 3, 0.6);
    this.tone(600, t, 0.5, "sine", 0.035, 2400, 0.7, 0.05);
  }

  clear() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.boom(1.4);
    const seq = [0, 2, 4, 7, 9, 12, 16, 19, 24];
    seq.forEach((s, i) => {
      const f = 523.25 * Math.pow(2, s / 12);
      this.bell(f, t + 0.12 + i * 0.085, 0.17, 1.3);
    });
    // final chord
    [0, 4, 7, 12].forEach((s) => this.bell(523.25 * Math.pow(2, s / 12), t + 0.95, 0.12, 2));
    this.crackle(t + 0.2, 40, 1.8, 0.15);
  }

  fail() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(320, t, 0.6, "sawtooth", 0.2, 60, 0.5);
    this.tone(240, t + 0.02, 0.7, "square", 0.1, 45, 0.5);
    this.noiseBurst(t, 0.5, 0.5, "lowpass", 3000, 150, 0.8, 0.5);
    this.tone(90, t, 0.4, "sine", 0.7, 30, 0.2);
    this.bell(392, t + 0.25, 0.1, 0.8);
    this.bell(311, t + 0.45, 0.1, 0.9);
    this.bell(262, t + 0.7, 0.1, 1.3);
  }

  start() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 4, 7, 12].forEach((s, i) => this.bell(523.25 * Math.pow(2, s / 12), t + i * 0.07, 0.14, 0.9));
    this.noiseBurst(t, 0.4, 0.15, "bandpass", 800, 4000, 3, 0.6);
  }

  // ---------- black hole gun sounds ----------
  shootBH() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // sub charge drop
    this.tone(170, t, 0.4, "sine", 0.85, 26, 0.35);
    // dark surge
    this.noiseBurst(t, 0.35, 0.4, "lowpass", 1400, 90, 1, 0.5);
    // eerie rising shimmer
    this.tone(280, t + 0.02, 0.32, "sine", 0.09, 2500, 0.85, 0.09);
    this.tone(420, t + 0.02, 0.28, "triangle", 0.05, 3200, 0.85, 0.1);
  }

  hitBH(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // gravity-well suck
    this.noiseBurst(t, 0.3, 0.42, "bandpass", 3800, 180, 2.2, 0.6);
    this.tone(950, t, 0.3, "sine", 0.24, 65, 0.6, 0.01);
    // collapse + jet eruption (no firework crackle — pure void)
    const d = t + 0.13;
    this.tone(72, d, 0.55, "sine", 0.85, 26, 0.4);
    this.noiseBurst(d, 0.3, 0.4, "lowpass", 2000, 120, 0.8, 0.6);
    // plasma jet hiss sweeping upward
    this.noiseBurst(d + 0.02, 0.45, 0.16, "bandpass", 300, 5200, 2.5, 0.7);
    const f = noteFreq(idx) * 0.5;
    this.bell(f, d, 0.2, 1.2);
    this.bell(f * 1.5, d + 0.06, 0.08, 0.9);
    // deep space tail
    this.tone(52, d, 1.3, "sine", 0.22, 30, 0.7, 0.1);
  }

  clearBH() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // supermassive collapse — deep, vast, no fireworks
    this.tone(90, t, 1.4, "sine", 0.9, 22, 0.5);
    this.tone(45, t, 1.8, "sine", 0.7, 20, 0.6, 0.05);
    this.noiseBurst(t, 1.0, 0.55, "lowpass", 1800, 70, 0.7, 0.7);
    // gravitational suck before the eruption
    this.noiseBurst(t, 0.35, 0.35, "bandpass", 4200, 150, 2.2, 0.6);
    // dark choir bells
    const seq = [0, 3, 5, 7, 10, 12, 15, 19, 24];
    seq.forEach((s, i) => {
      const f = 392 * Math.pow(2, s / 12);
      this.bell(f, t + 0.3 + i * 0.1, 0.15, 1.6);
    });
    [0, 3, 7, 12].forEach((s) => this.bell(392 * Math.pow(2, s / 12), t + 1.35, 0.1, 2.4));
    // jet wash
    this.noiseBurst(t + 0.35, 0.9, 0.14, "bandpass", 400, 4800, 2.5, 0.75);
  }

  failBH() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(220, t, 0.9, "sawtooth", 0.16, 34, 0.6);
    this.tone(160, t, 1.0, "square", 0.08, 28, 0.6);
    this.noiseBurst(t, 0.6, 0.5, "lowpass", 2500, 100, 0.8, 0.6);
    this.tone(64, t, 0.7, "sine", 0.85, 24, 0.3);
    this.bell(311, t + 0.3, 0.09, 0.9);
    this.bell(233, t + 0.55, 0.09, 1.1);
    this.bell(155, t + 0.85, 0.1, 1.6);
  }

  voidOpen() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // space tearing open — thin shimmer collapsing down
    this.noiseBurst(t, 0.32, 0.2, "bandpass", 5200, 500, 3, 0.7);
    this.tone(1400, t, 0.3, "sine", 0.07, 220, 0.8, 0.02);
  }

  voidBoom(size = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBoom < 0.05) return;
    this.lastBoom = now;
    const t = now;
    const s = Math.min(size, 1.3);
    this.tone(80, t, 0.7, "sine", 0.8 * s, 24, 0.5);
    this.noiseBurst(t, 0.5, 0.45 * s, "lowpass", 1600, 90, 0.8, 0.65);
    this.noiseBurst(t + 0.02, 0.5, 0.12, "bandpass", 500, 4200, 2.5, 0.7);
    this.tone(46, t, 1.1, "sine", 0.25, 28, 0.7, 0.08);
  }

  // ---------- shark gun sounds ----------
  shootShark() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // water cannon thump
    this.tone(180, t, 0.22, "sine", 0.8, 40, 0.25);
    this.noiseBurst(t, 0.18, 0.5, "lowpass", 2200, 250, 0.8, 0.4);
    // water whoosh upward
    this.noiseBurst(t + 0.02, 0.32, 0.3, "bandpass", 500, 3800, 2.2, 0.6);
    // shark growl (low + menacing)
    this.tone(95 + Math.random() * 20, t + 0.02, 0.35, "sawtooth", 0.1, 55, 0.4, 0.03);
    // launch blup
    this.bubble(300 + Math.random() * 120, t + 0.03, 0.16, 0.22);
  }

  hitShark(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // HARD CHOMP — jaw snap
    this.tone(130, t, 0.14, "sine", 0.9, 45, 0.25);
    this.noiseBurst(t, 0.07, 0.65, "highpass", 1800, 900, 0.7, 0.3);
    // teeth crunch (double hit)
    this.noiseBurst(t + 0.015, 0.05, 0.5, "bandpass", 2400, 700, 1.5, 0.3);
    this.noiseBurst(t + 0.07, 0.06, 0.4, "bandpass", 1900, 600, 1.5, 0.35);
    // wood bite knock
    this.tone(240, t, 0.1, "triangle", 0.4, 110, 0.3);
    // splash around the bite
    this.splash(t + 0.02, 0.4, 0.45, 1.1);
    // melodic bubble — consecutive bites sing upward like the other guns
    const f = noteFreq(idx) * 0.75;
    this.bubble(f, t + 0.05, 0.22, 0.3);
    this.bell(f * 1.5, t + 0.1, 0.07, 0.7);
    // happy droplets
    for (let i = 0; i < 3; i++) {
      this.bubble(f * (1.3 + Math.random() * 0.9), t + 0.15 + i * 0.07 + Math.random() * 0.04, 0.08, 0.15);
    }
  }

  clearShark() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // SHARK FRENZY — giant splash
    this.tone(100, t, 0.8, "sine", 0.9, 30, 0.4);
    this.splash(t, 0.65, 1.1, 1.2);
    this.splash(t + 0.15, 0.4, 0.8, 0.8);
    // ascending bubble arpeggio
    const seq = [0, 2, 4, 7, 9, 12, 14, 16, 19, 24];
    seq.forEach((s, i) => {
      const f = 392 * Math.pow(2, s / 12);
      this.bubble(f, t + 0.15 + i * 0.09, 0.16, 0.24);
    });
    // triumphant chord + whale call
    [0, 4, 7, 12].forEach((s) => this.bell(523.25 * Math.pow(2, s / 12), t + 1.1, 0.1, 2));
    this.tone(280, t + 0.3, 0.7, "sine", 0.12, 620, 0.85, 0.15);
    this.tone(620, t + 0.9, 0.6, "sine", 0.09, 350, 0.85, 0.1);
  }

  failShark() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // sharks collide — painful crunch + big sad splash
    this.tone(140, t, 0.2, "sine", 0.85, 40, 0.3);
    this.noiseBurst(t, 0.09, 0.6, "highpass", 1600, 800, 0.7, 0.3);
    this.splash(t + 0.03, 0.55, 0.7, 0.9);
    // sad descending growl
    this.tone(200, t + 0.05, 0.7, "sawtooth", 0.12, 55, 0.5, 0.05);
    // sad bubbles sinking down
    this.tone(500, t + 0.3, 0.35, "sine", 0.14, 180, 0.6, 0.02);
    this.tone(380, t + 0.6, 0.4, "sine", 0.12, 140, 0.6, 0.02);
    this.tone(300, t + 0.95, 0.55, "sine", 0.12, 110, 0.65, 0.02);
  }

  sharkLeap() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // whoosh up out of the water...
    this.noiseBurst(t, 0.4, 0.12, "bandpass", 500, 3600, 2.5, 0.6);
    // ...and a happy splash back down
    this.splash(t + 0.38, 0.3, 0.5, 1.0);
    this.bubble(620 + Math.random() * 200, t + 0.4, 0.1, 0.2);
  }

  // ---------- bamboo cannon sounds ----------
  shootBamboo() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // deep bamboo cannon DUAR
    this.tone(150, t, 0.4, "sine", 0.95, 32, 0.3);
    this.noiseBurst(t, 0.28, 0.7, "lowpass", 1800, 120, 0.7, 0.45);
    // bamboo crack
    this.noiseBurst(t + 0.01, 0.08, 0.55, "bandpass", 2600, 900, 1.6, 0.25);
    this.tone(320, t, 0.09, "triangle", 0.35, 140, 0.25);
    // stone whistle upward
    this.noiseBurst(t + 0.03, 0.3, 0.18, "bandpass", 600, 3400, 2.4, 0.5);
    // ember sizzle tail
    this.crackle(t + 0.05, 8, 0.4, 0.12);
  }

  hitBamboo(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // stone THUNK into wood
    this.tone(120, t, 0.16, "sine", 0.9, 42, 0.25);
    this.noiseBurst(t, 0.08, 0.55, "lowpass", 2200, 300, 0.9, 0.3);
    // wood knock double
    this.tone(260, t, 0.09, "triangle", 0.45, 130, 0.3);
    this.tone(210, t + 0.07, 0.1, "triangle", 0.35, 100, 0.3);
    // stone chips clatter
    this.noiseBurst(t + 0.02, 0.05, 0.4, "highpass", 2800, 1500, 1, 0.25);
    this.noiseBurst(t + 0.09, 0.06, 0.32, "highpass", 2400, 1300, 1, 0.25);
    // gamelan-ish bonk climbs pentatonically like other guns
    const f = noteFreq(idx) * 0.6;
    this.bell(f, t + 0.04, 0.2, 1.1);
    this.bell(f * 2, t + 0.08, 0.07, 0.6);
    // dust poof
    this.noiseBurst(t + 0.03, 0.3, 0.2, "lowpass", 900, 150, 0.8, 0.5);
  }

  clearBamboo() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // victory volley — 3 cannon shots
    for (let i = 0; i < 3; i++) {
      const dt = i * 0.22;
      this.tone(140, t + dt, 0.4, "sine", 0.8, 30, 0.35);
      this.noiseBurst(t + dt, 0.3, 0.55, "lowpass", 2000, 120, 0.7, 0.5);
      this.noiseBurst(t + dt + 0.01, 0.08, 0.45, "bandpass", 2600, 900, 1.6, 0.3);
    }
    this.crackle(t + 0.1, 26, 1.4, 0.14);
    // gamelan victory melody
    const seq = [0, 2, 4, 7, 9, 12, 14, 19, 24];
    seq.forEach((s, i) => {
      const f = 440 * Math.pow(2, s / 12);
      this.bell(f, t + 0.2 + i * 0.095, 0.15, 1.4);
    });
    [0, 4, 7, 12].forEach((s) => this.bell(440 * Math.pow(2, s / 12), t + 1.15, 0.1, 2.2));
  }

  failBamboo() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // stones smash each other — harsh crack + rumble
    this.tone(110, t, 0.3, "sine", 0.9, 35, 0.3);
    this.noiseBurst(t, 0.12, 0.65, "highpass", 1500, 700, 0.8, 0.3);
    this.noiseBurst(t + 0.02, 0.4, 0.5, "lowpass", 1800, 120, 0.8, 0.5);
    // bamboo splinter
    this.tone(280, t + 0.03, 0.25, "sawtooth", 0.1, 70, 0.4);
    // sad wooden knocks descending
    this.tone(300, t + 0.3, 0.2, "triangle", 0.25, 150, 0.4);
    this.tone(230, t + 0.55, 0.25, "triangle", 0.22, 110, 0.4);
    this.tone(170, t + 0.85, 0.4, "triangle", 0.22, 80, 0.45);
  }

  bambooSkyBoom(size = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBoom < 0.06) return;
    this.lastBoom = now;
    const t = now;
    const s = Math.min(size, 1.3);
    this.tone(130, t, 0.5, "sine", 0.7 * s, 30, 0.4);
    this.noiseBurst(t, 0.4, 0.5 * s, "lowpass", 2000, 140, 0.7, 0.55);
    this.crackle(t + 0.08, Math.round(8 + size * 8), 0.7, 0.13);
  }

  // ---------- super soaker sounds ----------
  shootSoaker() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // pump + pressurized squirt
    this.tone(300, t, 0.1, "triangle", 0.3, 520, 0.2);
    this.noiseBurst(t + 0.02, 0.3, 0.42, "bandpass", 900, 4200, 2.4, 0.6);
    // watery blup launch
    this.bubble(420 + Math.random() * 140, t + 0.03, 0.18, 0.22);
    this.noiseBurst(t, 0.12, 0.25, "highpass", 2800, 1600, 0.8, 0.4);
  }

  hitSoaker(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // juicy SPLAT
    this.splash(t, 0.5, 0.4, 1.25);
    this.tone(220, t, 0.1, "sine", 0.55, 90, 0.25);
    // melodic bubble climbs like the other guns
    const f = noteFreq(idx) * 0.9;
    this.bubble(f, t + 0.03, 0.24, 0.28);
    this.bell(f * 1.5, t + 0.09, 0.07, 0.7);
    // playful droplets
    for (let i = 0; i < 4; i++) {
      this.bubble(f * (1.2 + Math.random() * 1.1), t + 0.12 + i * 0.06 + Math.random() * 0.03, 0.09, 0.14);
    }
  }

  clearSoaker() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // WATER PARTY — giant splash + rain
    this.splash(t, 0.7, 1.2, 1.3);
    this.splash(t + 0.2, 0.45, 0.9, 1.0);
    this.splash(t + 0.45, 0.35, 0.8, 0.85);
    // sparkling bubble arpeggio
    const seq = [0, 4, 7, 12, 16, 19, 24, 28];
    seq.forEach((s, i) => {
      const f = 523.25 * Math.pow(2, s / 12);
      this.bubble(f * 0.8, t + 0.15 + i * 0.085, 0.15, 0.22);
    });
    // sunny happy chord
    [0, 4, 7, 12].forEach((s) => this.bell(659.25 * Math.pow(2, s / 12), t + 1.0, 0.09, 2));
  }

  failSoaker() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // blobs collide — sad splat
    this.splash(t, 0.55, 0.6, 0.9);
    this.tone(190, t, 0.2, "sine", 0.6, 60, 0.3);
    // deflating bubbles sink down
    this.tone(550, t + 0.25, 0.3, "sine", 0.13, 200, 0.6, 0.02);
    this.tone(420, t + 0.5, 0.35, "sine", 0.12, 150, 0.6, 0.02);
    this.tone(320, t + 0.8, 0.5, "sine", 0.12, 110, 0.65, 0.02);
  }

  soakerGeyser() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.35, 0.22, "bandpass", 800, 3800, 2.2, 0.6);
    this.splash(t + 0.25, 0.28, 0.5, 1.1);
    this.bubble(700 + Math.random() * 200, t + 0.27, 0.09, 0.18);
  }

  // ---------- rainbow laser gun sounds ----------
  private laserZap(t0: number, f0: number, f1: number, dur: number, vol: number) {
    // classic laser sweep + harmonic shimmer
    this.tone(f0, t0, dur, "sawtooth", vol, f1, 0.55, 0.008);
    this.tone(f0 * 1.5, t0, dur * 0.9, "square", vol * 0.35, f1 * 1.5, 0.5, 0.008);
    this.tone(f0 * 2, t0 + 0.01, dur * 0.7, "sine", vol * 0.5, f1 * 2, 0.7, 0.008);
  }

  shootRainbow() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // prism charge-up
    this.tone(300, t, 0.12, "sine", 0.25, 1200, 0.5, 0.02);
    // rainbow laser blast sweeping UP through the spectrum
    this.laserZap(t + 0.03, 900, 3600, 0.28, 0.22);
    this.noiseBurst(t + 0.02, 0.22, 0.3, "highpass", 2000, 6000, 1.2, 0.5);
    // sparkling prism tail
    this.bell(1568, t + 0.06, 0.08, 0.5);
    this.bell(2093, t + 0.12, 0.06, 0.5);
  }

  hitRainbow(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // laser impact crack
    this.laserZap(t, 2400, 500, 0.16, 0.2);
    this.noiseBurst(t, 0.08, 0.4, "highpass", 3000, 1500, 1, 0.3);
    this.tone(180, t, 0.12, "sine", 0.6, 60, 0.25);
    // prismatic chime climbs the rainbow scale like other guns
    const f = noteFreq(idx) * 1.0;
    this.bell(f, t + 0.03, 0.22, 1.1);
    this.bell(f * 2, t + 0.08, 0.1, 0.8);
    // rainbow sparkle arpeggio
    [0, 4, 7, 12].forEach((s, i) => {
      this.bell(f * Math.pow(2, s / 12), t + 0.12 + i * 0.05, 0.06, 0.6);
    });
  }

  clearRainbow() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // RAINBOW FINALE — ascending spectrum sweep
    this.laserZap(t, 500, 4000, 0.7, 0.18);
    this.noiseBurst(t, 0.6, 0.35, "highpass", 1500, 7000, 1, 0.6);
    // full rainbow scale fanfare
    const seq = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 19, 24];
    seq.forEach((s, i) => {
      const f = 523.25 * Math.pow(2, s / 12);
      this.bell(f, t + 0.15 + i * 0.08, 0.14, 1.2);
    });
    // glorious major chord + shimmer wash
    [0, 4, 7, 12, 16].forEach((s) => this.bell(523.25 * Math.pow(2, s / 12), t + 1.2, 0.1, 2.2));
    this.crackle(t + 0.2, 30, 1.6, 0.12);
  }

  failRainbow() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // lasers collide — harsh detuned crash
    this.laserZap(t, 2000, 200, 0.4, 0.22);
    this.laserZap(t + 0.03, 1500, 150, 0.4, 0.16);
    this.noiseBurst(t, 0.3, 0.5, "lowpass", 2500, 200, 0.8, 0.5);
    this.tone(140, t, 0.4, "sine", 0.7, 40, 0.3);
    // sad rainbow descending
    [12, 7, 4, 0].forEach((s, i) => {
      this.bell(523.25 * Math.pow(2, s / 12), t + 0.35 + i * 0.22, 0.1, 1.0);
    });
  }

  rainbowSky() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // aurora beam whoosh + chime
    this.noiseBurst(t, 0.4, 0.16, "bandpass", 700, 4200, 2.5, 0.65);
    this.laserZap(t + 0.1, 800, 3200, 0.35, 0.1);
    const f = 659.25 * Math.pow(2, [0, 4, 7, 12][Math.floor(Math.random() * 4)] / 12);
    this.bell(f, t + 0.25, 0.12, 1.2);
  }

  // ---------- bazooka sounds ----------
  shootBazooka() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // heavy launcher THUMP
    this.tone(130, t, 0.45, "sine", 1.0, 30, 0.3);
    this.noiseBurst(t, 0.3, 0.75, "lowpass", 1600, 110, 0.7, 0.45);
    // backblast whoosh
    this.noiseBurst(t + 0.01, 0.22, 0.5, "bandpass", 3000, 500, 1.2, 0.3);
    // rocket motor roar rising
    this.noiseBurst(t + 0.04, 0.4, 0.28, "bandpass", 400, 2600, 2.0, 0.55);
    this.tone(90 + Math.random() * 20, t + 0.03, 0.4, "sawtooth", 0.12, 220, 0.4, 0.03);
    // shell clank
    this.tone(520, t, 0.07, "square", 0.12, 220, 0.25);
  }

  hitBazooka(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // supersonic CRACK first
    this.noiseBurst(t, 0.06, 0.7, "highpass", 3200, 1400, 1, 0.25);
    // chest-punch sub detonation + rolling body blast
    this.tone(95, t, 0.32, "sine", 1.0, 30, 0.25);
    this.tone(58, t, 0.5, "sine", 0.8, 26, 0.3);
    this.noiseBurst(t + 0.01, 0.45, 0.7, "lowpass", 2600, 100, 0.8, 0.55);
    this.noiseBurst(t + 0.05, 0.5, 0.35, "bandpass", 900, 180, 1, 0.6);
    // armor CLANG + stressed metal ring
    this.tone(640, t, 0.12, "triangle", 0.3, 320, 0.4);
    this.tone(480, t + 0.05, 0.16, "triangle", 0.28, 220, 0.4);
    this.tone(1180, t + 0.02, 0.2, "sine", 0.12, 590, 0.5);
    // whistling shrapnel flying past
    this.noiseBurst(t + 0.06, 0.3, 0.18, "bandpass", 2800, 5200, 4, 0.5);
    // war drums climb pentatonically like other guns
    const f = noteFreq(idx) * 0.55;
    this.bell(f, t + 0.06, 0.2, 1.15);
    this.bell(f * 1.5, t + 0.12, 0.08, 0.8);
    // burning debris crackle + deep rumble tail
    this.crackle(t + 0.09, 16, 0.8, 0.15);
    this.tone(46, t + 0.15, 0.7, "sine", 0.4, 24, 0.5, 0.08);
  }

  clearBazooka() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // victory barrage — 4 heavy shells
    for (let i = 0; i < 4; i++) {
      const dt = i * 0.2;
      this.tone(120, t + dt, 0.45, "sine", 0.85, 28, 0.35);
      this.noiseBurst(t + dt, 0.35, 0.6, "lowpass", 2200, 110, 0.7, 0.5);
      this.noiseBurst(t + dt + 0.01, 0.08, 0.5, "highpass", 2400, 900, 1, 0.3);
    }
    this.crackle(t + 0.1, 30, 1.6, 0.15);
    // triumphant brass-ish fanfare
    const seq = [0, 4, 7, 12, 16, 19, 24];
    seq.forEach((s, i) => {
      const f = 392 * Math.pow(2, s / 12);
      this.bell(f, t + 0.25 + i * 0.1, 0.16, 1.4);
      this.tone(f * 0.5, t + 0.25 + i * 0.1, 0.3, "triangle", 0.08, undefined, 0.4);
    });
    [0, 4, 7, 12].forEach((s) => this.bell(392 * Math.pow(2, s / 12), t + 1.1, 0.11, 2.2));
  }

  failBazooka() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // rockets collide mid-air — massive explosion + sad alarm
    this.tone(100, t, 0.5, "sine", 0.95, 28, 0.3);
    this.noiseBurst(t, 0.15, 0.7, "highpass", 1400, 600, 0.8, 0.3);
    this.noiseBurst(t + 0.02, 0.55, 0.6, "lowpass", 2000, 100, 0.8, 0.55);
    this.crackle(t + 0.1, 16, 0.7, 0.15);
    // descending alarm tones
    this.tone(440, t + 0.35, 0.25, "square", 0.1, 330, 0.4);
    this.tone(330, t + 0.6, 0.3, "square", 0.1, 247, 0.4);
    this.tone(247, t + 0.9, 0.45, "square", 0.1, 165, 0.45);
  }

  bazookaSkyBoom(size = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBoom < 0.06) return;
    this.lastBoom = now;
    const t = now;
    const s = Math.min(size, 1.3);
    this.tone(115, t, 0.55, "sine", 0.75 * s, 28, 0.4);
    this.noiseBurst(t, 0.45, 0.55 * s, "lowpass", 2200, 120, 0.7, 0.55);
    this.noiseBurst(t + 0.01, 0.1, 0.4, "highpass", 2600, 1000, 1, 0.3);
    this.crackle(t + 0.08, Math.round(8 + size * 8), 0.7, 0.13);
  }

  // ---------- RPG sounds ----------
  shootRpg() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // sharp recoilless pop
    this.tone(200, t, 0.28, "sine", 0.9, 40, 0.3);
    this.noiseBurst(t, 0.2, 0.65, "lowpass", 2400, 200, 0.8, 0.4);
    // booster crack
    this.noiseBurst(t + 0.01, 0.07, 0.55, "bandpass", 3200, 1100, 1.6, 0.25);
    this.tone(420, t, 0.08, "triangle", 0.3, 180, 0.25);
    // screaming booster whistle upward
    this.noiseBurst(t + 0.03, 0.35, 0.22, "bandpass", 900, 4200, 2.6, 0.55);
    this.tone(700, t + 0.04, 0.3, "sine", 0.1, 2100, 0.6, 0.03);
  }

  hitRpg(idx: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // piercing supersonic KRAK
    this.noiseBurst(t, 0.07, 0.7, "highpass", 3400, 1500, 1, 0.25);
    // shaped-charge punch + searing jet hiss
    this.tone(120, t, 0.26, "sine", 0.95, 36, 0.25);
    this.tone(64, t + 0.01, 0.5, "sine", 0.75, 27, 0.3);
    this.noiseBurst(t + 0.01, 0.4, 0.6, "bandpass", 4200, 350, 1.5, 0.55);
    this.noiseBurst(t + 0.02, 0.35, 0.55, "lowpass", 2200, 120, 0.8, 0.5);
    // tearing steel + bright ping
    this.noiseBurst(t + 0.03, 0.22, 0.3, "bandpass", 1500, 4200, 3, 0.4);
    this.tone(880, t, 0.1, "triangle", 0.22, 440, 0.45);
    this.tone(660, t + 0.06, 0.14, "triangle", 0.2, 300, 0.45);
    this.tone(1320, t + 0.02, 0.18, "sine", 0.1, 660, 0.5);
    // heroic motif climbs like other guns
    const f = noteFreq(idx) * 0.7;
    this.bell(f, t + 0.06, 0.2, 1.1);
    this.bell(f * 2, t + 0.1, 0.07, 0.7);
    this.crackle(t + 0.09, 14, 0.7, 0.14);
    this.tone(50, t + 0.14, 0.65, "sine", 0.38, 25, 0.5, 0.08);
  }

  clearRpg() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // rapid RPG volley — 5 shots
    for (let i = 0; i < 5; i++) {
      const dt = i * 0.16;
      this.tone(170, t + dt, 0.32, "sine", 0.75, 35, 0.35);
      this.noiseBurst(t + dt, 0.25, 0.5, "lowpass", 2400, 150, 0.7, 0.5);
      this.noiseBurst(t + dt + 0.01, 0.07, 0.4, "bandpass", 3200, 1100, 1.6, 0.3);
    }
    this.crackle(t + 0.1, 28, 1.5, 0.14);
    // soaring victory run
    const seq = [0, 2, 4, 7, 12, 16, 19, 24, 28];
    seq.forEach((s, i) => {
      const f = 466.16 * Math.pow(2, s / 12);
      this.bell(f, t + 0.2 + i * 0.09, 0.15, 1.3);
    });
    [0, 5, 7, 12].forEach((s) => this.bell(466.16 * Math.pow(2, s / 12), t + 1.1, 0.1, 2.2));
  }

  failRpg() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // grenades smash — sharp crack + rolling blast
    this.tone(160, t, 0.35, "sine", 0.9, 36, 0.3);
    this.noiseBurst(t, 0.12, 0.65, "highpass", 2000, 800, 0.8, 0.3);
    this.noiseBurst(t + 0.02, 0.5, 0.55, "lowpass", 1900, 110, 0.8, 0.55);
    // booster sputter dying
    this.tone(900, t + 0.05, 0.4, "sawtooth", 0.07, 120, 0.4, 0.02);
    // sad bugle descending
    this.tone(392, t + 0.3, 0.25, "triangle", 0.2, 311, 0.4);
    this.tone(311, t + 0.55, 0.3, "triangle", 0.2, 233, 0.4);
    this.tone(233, t + 0.85, 0.45, "triangle", 0.2, 155, 0.45);
  }

  rpgSkyBoom(size = 1) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBoom < 0.06) return;
    this.lastBoom = now;
    const t = now;
    const s = Math.min(size, 1.3);
    this.tone(150, t, 0.45, "sine", 0.7 * s, 34, 0.4);
    this.noiseBurst(t, 0.35, 0.5 * s, "bandpass", 3000, 300, 1.2, 0.55);
    this.noiseBurst(t, 0.4, 0.45 * s, "lowpass", 2000, 140, 0.7, 0.5);
    this.crackle(t + 0.08, Math.round(8 + size * 8), 0.7, 0.13);
  }
}
