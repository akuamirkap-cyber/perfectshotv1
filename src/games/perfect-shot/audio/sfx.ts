/**
 * Procedural game audio engine (Web Audio API).
 * Every sound is synthesized in real time — no audio files needed.
 * Signal chain:  voices → panner → (dry bus + reverb send) → master → compressor → out
 */

import { LAND as LAND_FRAC, gunTiming, WHEEL, type Plan as MenuPlan } from "../anim/presets";

type BusOpts = { pan?: number; panTo?: number; verb?: number; t?: number; dur?: number; music?: boolean };

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
// C-major / A-minor pentatonic (sits perfectly on top of the ambient chords)
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093, 2349.32, 2637.02];
const CHORDS = [
  [45, 57, 60, 64, 67, 71], // Am9
  [41, 53, 57, 60, 64, 69], // Fmaj7
  [48, 55, 60, 62, 64, 67], // Cadd9
  [43, 55, 59, 62, 64, 67], // G6
];
const CHORD_LEN = 7;
const MUSIC_LEVEL = 0.5;

const load = (k: string) => {
  try {
    return localStorage.getItem(k) !== "0";
  } catch {
    return true;
  }
};
const save = (k: string, v: boolean) => {
  try {
    localStorage.setItem(k, v ? "1" : "0");
  } catch {
    /* ignore */
  }
};

const loadVol = () => {
  try {
    const v = localStorage.getItem("ps_vol");
    return v === null ? 1 : Math.max(0, Math.min(1, Number(v)));
  } catch {
    return 1;
  }
};

export type SoundState = { sfx: boolean; music: boolean; volume: number };

class Sfx {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxDry!: GainNode;
  private sfxWet!: GainNode;
  private musBus!: GainNode;
  private musDuck!: GainNode;
  private musDry!: GainNode;
  private musWet!: GainNode;
  private verbIn!: GainNode;
  private noiseBuf!: AudioBuffer;
  private musicTimer = 0;
  private nextChord = 0;
  private chordIdx = 0;
  private lastHover = 0;
  private menuBus: { dry: GainNode; wet: GainNode } | null = null;
  private buildingMenu = false;

  /** Silence scheduled notes from an obsolete menu replay without muting other sounds. */
  cancelMenuEnter() {
    if (!this.ctx || !this.menuBus) return;
    const t = this.ctx.currentTime;
    for (const node of [this.menuBus.dry, this.menuBus.wet]) {
      node.gain.cancelScheduledValues(t);
      node.gain.setValueAtTime(node.gain.value, t);
      node.gain.linearRampToValueAtTime(0, t + 0.01);
    }
    this.menuBus = null;
  }

  state: SoundState = { sfx: load("ps_sfx"), music: load("ps_music"), volume: loadVol() };
  private listeners = new Set<() => void>();

  /* ------------------------------------------------------------------ */
  /* setup                                                              */
  /* ------------------------------------------------------------------ */
  init() {
    if (this.ctx) {
      if (this.ctx.state !== "running") this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 18;
    comp.ratio.value = 4;
    comp.attack.value = 0.003;
    comp.release.value = 0.22;

    this.master = ctx.createGain();
    this.master.gain.value = 0.9 * this.state.volume;
    this.master.connect(comp);
    comp.connect(ctx.destination);

    // ----- reverb (generated stereo impulse) -----
    const verb = ctx.createConvolver();
    verb.buffer = this.impulse(3.2, 3.2);
    const verbHp = ctx.createBiquadFilter();
    verbHp.type = "highpass";
    verbHp.frequency.value = 280;
    const verbLp = ctx.createBiquadFilter();
    verbLp.type = "lowpass";
    verbLp.frequency.value = 7500;
    const verbOut = ctx.createGain();
    verbOut.gain.value = 0.6;
    this.verbIn = ctx.createGain();
    this.verbIn.connect(verbHp);
    verbHp.connect(verbLp);
    verbLp.connect(verb);
    verb.connect(verbOut);
    verbOut.connect(this.master);

    // ----- buses -----
    const on = (b: boolean, lvl = 1) => (b ? lvl : 0);
    this.sfxDry = ctx.createGain();
    this.sfxWet = ctx.createGain();
    this.sfxDry.gain.value = on(this.state.sfx);
    this.sfxWet.gain.value = on(this.state.sfx);
    this.sfxDry.connect(this.master);
    this.sfxWet.connect(this.verbIn);

    this.musBus = ctx.createGain();
    this.musDuck = ctx.createGain();
    this.musDry = ctx.createGain();
    this.musWet = ctx.createGain();
    this.musDry.gain.value = 0;
    this.musWet.gain.value = 0;
    this.musBus.connect(this.musDuck);
    this.musDuck.connect(this.musDry);
    this.musDry.connect(this.master);
    this.musWet.connect(this.verbIn);

    // ----- noise source buffer -----
    const len = ctx.sampleRate * 2;
    this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    if (ctx.state !== "running") ctx.resume();
  }

  private impulse(seconds: number, decay: number) {
    const ctx = this.ctx!;
    const rate = ctx.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    const pre = Math.floor(rate * 0.012);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = pre; i < len; i++) {
        const k = (i - pre) / (len - pre);
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, decay) * (1 - Math.exp(-(i - pre) / (rate * 0.004)));
      }
    }
    return buf;
  }

  /* ------------------------------------------------------------------ */
  /* state / settings                                                   */
  /* ------------------------------------------------------------------ */
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getState = () => this.state;
  private emit() {
    this.state = { ...this.state };
    this.listeners.forEach((f) => f());
  }

  setSfx(on: boolean) {
    this.state.sfx = on;
    save("ps_sfx", on);
    if (this.ctx) {
      const t = this.ctx.currentTime;
      this.sfxDry.gain.setTargetAtTime(on ? 1 : 0, t, 0.04);
      this.sfxWet.gain.setTargetAtTime(on ? 1 : 0, t, 0.04);
    }
    this.emit();
  }

  setMusic(on: boolean) {
    this.state.music = on;
    save("ps_music", on);
    if (this.ctx) {
      if (on) this.startMusic();
      else {
        const t = this.ctx.currentTime;
        this.musDry.gain.cancelScheduledValues(t);
        this.musWet.gain.cancelScheduledValues(t);
        this.musDry.gain.setTargetAtTime(0, t, 0.25);
        this.musWet.gain.setTargetAtTime(0, t, 0.25);
        window.clearInterval(this.musicTimer);
        this.musicTimer = 0;
      }
    }
    this.emit();
  }

  /* ------------------------------------------------------------------ */
  /* primitives                                                         */
  /* ------------------------------------------------------------------ */
  private T(d = 0) {
    return this.ctx!.currentTime + 0.02 + d;
  }
  private ok() {
    return !!this.ctx && this.state.sfx;
  }

  private bus(o: BusOpts = {}) {
    const ctx = this.ctx!;
    const input = ctx.createGain();
    const p = ctx.createStereoPanner();
    const t = o.t ?? ctx.currentTime;
    p.pan.setValueAtTime(o.pan ?? 0, t);
    if (o.panTo !== undefined) p.pan.linearRampToValueAtTime(o.panTo, t + (o.dur ?? 0.3));
    input.connect(p);
    p.connect(o.music ? this.musBus : this.buildingMenu && this.menuBus ? this.menuBus.dry : this.sfxDry);
    const v = o.verb ?? 0.15;
    if (v > 0) {
      const s = ctx.createGain();
      s.gain.value = v;
      p.connect(s);
      s.connect(o.music ? this.musWet : this.buildingMenu && this.menuBus ? this.menuBus.wet : this.sfxWet);
    }
    return input;
  }

  private env(g: AudioParam, t: number, peak: number, a: number, d: number) {
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  private tone(o: {
    type?: OscillatorType;
    f: number;
    f2?: number;
    glide?: number;
    t: number;
    a?: number;
    d: number;
    peak: number;
    pan?: number;
    verb?: number;
    detune?: number;
  }) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = o.type ?? "sine";
    osc.frequency.setValueAtTime(o.f, o.t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, o.t + (o.glide ?? o.d));
    if (o.detune) osc.detune.value = o.detune;
    const g = ctx.createGain();
    const a = o.a ?? 0.004;
    this.env(g.gain, o.t, o.peak, a, o.d);
    osc.connect(g);
    g.connect(this.bus({ pan: o.pan, verb: o.verb, t: o.t }));
    osc.start(o.t);
    osc.stop(o.t + a + o.d + 0.05);
  }

  private noise(o: {
    t: number;
    d: number;
    peak: number;
    f: number;
    f2?: number;
    q?: number;
    type?: BiquadFilterType;
    a?: number;
    swell?: boolean;
    pan?: number;
    panTo?: number;
    verb?: number;
  }) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.type ?? "bandpass";
    f.Q.value = o.q ?? 1;
    f.frequency.setValueAtTime(o.f, o.t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, o.t + o.d);
    const g = ctx.createGain();
    if (o.swell) {
      g.gain.setValueAtTime(0.0001, o.t);
      g.gain.exponentialRampToValueAtTime(o.peak, o.t + o.d * (o.a ?? 0.55));
      g.gain.exponentialRampToValueAtTime(0.0001, o.t + o.d);
    } else this.env(g.gain, o.t, o.peak, o.a ?? 0.002, o.d);
    src.connect(f);
    f.connect(g);
    g.connect(this.bus({ pan: o.pan, panTo: o.panTo, verb: o.verb, t: o.t, dur: o.d }));
    src.start(o.t, Math.random() * 1.5);
    src.stop(o.t + o.d + (o.a ?? 0) + 0.1);
  }

  /** FM bell — glassy, sparkly, very "game UI" */
  private bell(
    f: number,
    t: number,
    o: { d?: number; peak?: number; pan?: number; verb?: number; ratio?: number; index?: number; music?: boolean } = {},
  ) {
    const ctx = this.ctx!;
    const d = o.d ?? 1.2;
    const peak = o.peak ?? 0.08;
    const ratio = o.ratio ?? 3.5;
    const index = o.index ?? 2.2;
    const car = ctx.createOscillator();
    car.frequency.value = f;
    const mod = ctx.createOscillator();
    mod.frequency.value = f * ratio;
    const mg = ctx.createGain();
    mg.gain.setValueAtTime(f * index, t);
    mg.gain.exponentialRampToValueAtTime(f * 0.02 + 0.01, t + d * 0.5);
    mod.connect(mg);
    mg.connect(car.frequency);
    const g = ctx.createGain();
    this.env(g.gain, t, peak, 0.003, d);
    car.connect(g);
    const s2 = ctx.createOscillator();
    s2.frequency.value = f * 2.003;
    const g2 = ctx.createGain();
    this.env(g2.gain, t, peak * 0.22, 0.003, d * 0.45);
    s2.connect(g2);
    const b = this.bus({ pan: o.pan, verb: o.verb ?? 0.35, t, music: o.music });
    g.connect(b);
    g2.connect(b);
    [car, mod, s2].forEach((n) => {
      n.start(t);
      n.stop(t + d + 0.1);
    });
  }

  private marimba(f: number, t: number, peak = 0.12, pan = 0, verb = 0.22) {
    this.bell(f, t, { ratio: 4, index: 1.4, d: 0.5, peak, pan, verb });
  }

  private duck(t: number, amount = 0.35, dur = 0.8) {
    if (!this.ctx) return;
    const g = this.musDuck.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(1, t);
    g.linearRampToValueAtTime(amount, t + 0.03);
    g.linearRampToValueAtTime(1, t + dur);
  }

  /* ------------------------------------------------------------------ */
  /* building blocks                                                    */
  /* ------------------------------------------------------------------ */
  whoosh(d = 0, dur = 0.4, f0 = 300, f1 = 2500, peak = 0.25, pan0 = 0, pan1 = pan0, q = 1.1) {
    if (!this.ok()) return;
    this.noise({ t: this.T(d), d: dur, peak, f: f0, f2: f1, q, swell: true, pan: pan0, panTo: pan1, verb: 0.14 });
  }

  hover() {
    if (!this.ok()) return;
    const now = performance.now();
    if (now - this.lastHover < 60) return;
    this.lastHover = now;
    const t = this.T();
    this.tone({ f: 2600, f2: 3000, t, d: 0.04, peak: 0.022, verb: 0.08 });
  }

  tap(d = 0, hi = 1100) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: hi, f2: hi * 0.5, glide: 0.05, t, d: 0.07, peak: 0.22, verb: 0.05 });
    this.noise({ t, d: 0.018, peak: 0.07, f: 5500, type: "highpass", verb: 0 });
  }

  confirm(d = 0) {
    if (!this.ok()) return;
    this.tap(d);
    const t = this.T(d);
    this.bell(783.99, t, { peak: 0.08, d: 0.9, pan: -0.15 });
    this.bell(1174.66, t + 0.07, { peak: 0.075, d: 1.2, pan: 0.15, verb: 0.45 });
  }

  back(d = 0) {
    if (!this.ok()) return;
    this.tap(d, 900);
    const t = this.T(d);
    this.bell(1046.5, t, { peak: 0.07, d: 0.7, pan: 0.15 });
    this.bell(783.99, t + 0.075, { peak: 0.07, d: 1.0, pan: -0.15, verb: 0.4 });
  }

  toggle(on: boolean) {
    if (!this.ctx) return;
    const t = this.T();
    const was = this.state.sfx;
    if (!was && !on) return;
    this.tone({ f: on ? 700 : 1100, f2: on ? 1400 : 550, glide: 0.08, t, d: 0.1, peak: 0.18, verb: 0.1 });
    this.bell(on ? 1567.98 : 783.99, t + 0.04, { peak: 0.05, d: 0.6 });
  }

  coin(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.bell(987.77, t, { ratio: 2, index: 0.8, d: 0.12, peak: 0.07, pan: 0.5, verb: 0.2 });
    this.bell(1318.51, t + 0.075, { ratio: 2, index: 0.8, d: 0.7, peak: 0.08, pan: 0.5, verb: 0.35 });
  }

  gem(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    [2093, 2637.02, 3135.96, 4186].forEach((f, i) =>
      this.bell(f, t + i * 0.035, { d: 0.8, peak: 0.03, pan: 0.7, verb: 0.6 }),
    );
  }

  sparkle(d = 0, n = 8, peak = 0.035, spread = 0.05) {
    if (!this.ok()) return;
    const t = this.T(d);
    for (let i = 0; i < n; i++) {
      const f = PENTA[Math.min(PENTA.length - 1, 5 + Math.floor((i / n) * 8) + Math.floor(Math.random() * 2))];
      this.bell(f * 2, t + i * spread + Math.random() * 0.02, {
        d: 0.9,
        peak: peak * (1 - i / (n * 1.6)),
        pan: Math.random() * 1.6 - 0.8,
        verb: 0.75,
        ratio: 5.01,
        index: 1.2,
      });
    }
  }

  thud(d = 0, size = 1, pan = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: 170, f2: 70, glide: 0.09, t, d: 0.14 * size, peak: 0.22 * size, pan, verb: 0.05 });
  }

  letterPop(d: number, i: number) {
    if (!this.ok()) return;
    const t = this.T(d);
    const pan = -0.6 + i * 0.2;
    this.marimba(PENTA[i], t, 0.12, pan);
    this.tone({ f: 190, f2: 80, glide: 0.08, t, d: 0.1, peak: 0.16, pan, verb: 0 });
  }

  /** metallic blade "shiiing" */
  shing(d = 0, pan = 0.4) {
    if (!this.ok()) return;
    const t = this.T(d);
    const base = 2150;
    [1, 1.342, 1.875, 2.414, 3.03, 3.61].forEach((r, i) => {
      this.tone({
        f: base * r * (1 + (Math.random() - 0.5) * 0.004),
        t: t + i * 0.004,
        a: 0.004,
        d: 1.3 - i * 0.15,
        peak: 0.045 / (1 + i * 0.35),
        pan,
        verb: 0.5,
      });
    });
    this.noise({ t, d: 0.22, peak: 0.16, f: 6000, f2: 9000, type: "highpass", pan: pan - 0.5, panTo: pan, verb: 0.3 });
  }

  /** bullet streaking along the title bar, stopping and spinning */
  bulletStreak(d = 0, fly = 0.437) {
    if (!this.ok()) return;
    const t = this.T(d);
    // distant muzzle crack
    this.noise({ t, d: 0.05, peak: 0.28, f: 2600, f2: 700, q: 0.9, pan: -0.85, verb: 0.3 });
    this.tone({ f: 150, f2: 55, glide: 0.1, t, d: 0.14, peak: 0.25, pan: -0.85, verb: 0.15 });
    // supersonic whizz with doppler drop, panning left → right
    this.noise({ t, d: fly, peak: 0.2, f: 2400, f2: 5200, q: 2.2, swell: true, a: 0.85, pan: -0.9, panTo: 0.75, verb: 0.15 });
    this.tone({ f: 2100, f2: 950, glide: fly, t, a: 0.02, d: fly, peak: 0.045, verb: 0.2 });
    // impact at the end of the bar
    const hit = t + fly;
    this.click(hit, 2600, 0.5, 0.75);
    this.tone({ f: 320, f2: 120, glide: 0.07, t: hit, d: 0.12, peak: 0.28, pan: 0.75, verb: 0.05 });
    this.metalRing(hit, 880, 0.035, 0.7, 0.75);
    // spinning whirr that slowly settles
    for (let i = 0; i < 16; i++) {
      const tt = hit + 0.06 + i * (0.03 + i * 0.0035);
      this.click(tt, 3600 - i * 60, 0.13 * (1 - i / 18), 0.75);
    }
    this.tone({ type: "triangle", f: 1400, f2: 900, glide: 0.8, t: hit + 0.05, a: 0.02, d: 0.8, peak: 0.018, pan: 0.75, verb: 0.3 });
  }

  slash(d = 0) {
    if (!this.ok()) return;
    this.whoosh(d, 0.42, 900, 6500, 0.22, -0.8, 0.8, 0.9);
    this.shing(d + 0.04, 0.3);
  }

  impact(d = 0, size = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    // sub boom
    this.tone({ f: 150, f2: 36, glide: 0.4, t, a: 0.002, d: 0.95 * size, peak: 0.85 * size, verb: 0.05 });
    // punchy body
    this.tone({ type: "triangle", f: 260, f2: 60, glide: 0.12, t, d: 0.22, peak: 0.28 * size, verb: 0.1 });
    // dust burst
    this.noise({ t, d: 0.5 * size, peak: 0.42 * size, f: 2600, f2: 220, type: "lowpass", q: 0.7, verb: 0.45 });
    // crack transient
    this.noise({ t, d: 0.035, peak: 0.3 * size, f: 3200, type: "highpass", verb: 0.2 });
    this.duck(t, 0.3, 1.1);
  }

  goldChord(d = 0, peak = 0.05) {
    if (!this.ok()) return;
    const t = this.T(d);
    [1046.5, 1318.51, 1567.98, 2093, 2637.02].forEach((f, i) =>
      this.bell(f, t + i * 0.028, { d: 2.2, peak: peak * (1 - i * 0.1), pan: -0.5 + i * 0.25, verb: 0.75, ratio: 3.5, index: 1.6 }),
    );
    // warm sustained pad under the bells
    [523.25, 659.25, 783.99].forEach((f) =>
      this.tone({ type: "triangle", f, t, a: 0.08, d: 1.6, peak: 0.025, verb: 0.8 }),
    );
  }

  riser(d = 0, dur = 0.6, peak = 0.13) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: dur, peak, f: 300, f2: 6000, q: 2.2, swell: true, a: 0.92, verb: 0.3 });
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(280, t);
    o.frequency.exponentialRampToValueAtTime(1400, t + dur);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(7, t);
    lfo.frequency.linearRampToValueAtTime(18, t + dur);
    const lg = ctx.createGain();
    lg.gain.value = 18;
    lfo.connect(lg);
    lg.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.9);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    o.connect(g);
    g.connect(this.bus({ verb: 0.4, t }));
    [o, lfo].forEach((n) => {
      n.start(t);
      n.stop(t + dur + 0.1);
    });
  }

  private click(t: number, f: number, peak: number, pan = 0) {
    this.noise({ t, d: 0.045, peak, f, q: 7, pan, verb: 0.12 });
    this.tone({ type: "square", f: f * 0.42, f2: f * 0.3, glide: 0.02, t, d: 0.025, peak: peak * 0.18, pan, verb: 0.05 });
  }

  /** gun cock — "chk-CHAK" */
  reload(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.click(t, 2600, 0.42, 0.1);
    this.click(t + 0.028, 1300, 0.25, 0.1);
    this.click(t + 0.15, 1900, 0.5, -0.05);
    this.click(t + 0.168, 3400, 0.22, -0.05);
    this.tone({ f: 210, f2: 95, glide: 0.06, t: t + 0.15, d: 0.09, peak: 0.25, verb: 0.08 });
    this.tone({ f: 4400, t: t + 0.17, d: 0.35, peak: 0.012, verb: 0.4 }); // metallic tail
  }

  bubble(d: number, i: number) {
    if (!this.ok()) return;
    const t = this.T(d);
    const pan = -0.6 + i * 0.4;
    const f = 360 * (1 + i * 0.14);
    this.tone({ f, f2: f * 2.4, glide: 0.06, t, d: 0.09, peak: 0.14, pan, verb: 0.08 });
    this.marimba([783.99, 880, 1046.5, 1318.51][i % 4], t + 0.01, 0.08, pan, 0.3);
  }

  zipUp(d: number, i: number) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: 480 + i * 70, f2: 2200 + i * 120, glide: 0.13, t, d: 0.13, peak: 0.045, pan: -0.6 + i * 0.2, verb: 0.25 });
  }

  popDown(d: number, i: number) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: 950 - i * 90, f2: 240, glide: 0.11, t, d: 0.12, peak: 0.09, pan: -0.6 + i * 0.4, verb: 0.1 });
  }

  poof(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.42, peak: 0.26, f: 300, f2: 4500, type: "lowpass", q: 0.8, swell: true, a: 0.3, verb: 0.35 });
    this.tone({ f: 110, f2: 42, glide: 0.3, t, d: 0.35, peak: 0.28, verb: 0.05 });
  }

  /* ------------------------------------------------------------------ */
  /* transition                                                         */
  /* ------------------------------------------------------------------ */
  irisClose(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.5, peak: 0.26, f: 4500, f2: 180, q: 0.8, swell: true, a: 0.6, verb: 0.2 });
    this.tone({ f: 95, f2: 44, glide: 0.4, t: t + 0.42 * k, d: 0.6, peak: 0.42, verb: 0.15 });
    this.noise({ t: t + 0.42 * k, d: 0.25, peak: 0.12, f: 900, f2: 150, type: "lowpass", verb: 0.3 });
    this.duck(t + 0.42 * k, 0.4, 1.0);
  }

  scopeLock(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ type: "triangle", f: 1567.98, t, d: 0.07, peak: 0.07, verb: 0.3 });
    this.tone({ type: "triangle", f: 1567.98, t: t + 0.11 * k, d: 0.07, peak: 0.07, verb: 0.3 });
    this.bell(2093, t + 0.22 * k, { d: 1.0, peak: 0.05, verb: 0.6 });
    this.click(t + 0.22 * k, 3000, 0.15);
  }

  irisOpen(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.65, peak: 0.2, f: 220, f2: 5200, q: 0.6, swell: true, a: 0.5, verb: 0.35 });
    [523.25, 659.25, 783.99, 987.77].forEach((f, i) =>
      this.tone({ type: "sine", f, t: t + i * 0.03 * k, a: 0.12, d: 1.3, peak: 0.035, pan: -0.4 + i * 0.27 * k, verb: 0.8 }),
    );
    this.sparkle(d + 0.15 * k, 6, 0.025, 0.06);
  }

  /* ------------------------------------------------------------------ */
  /* composite sequences (synced with the CSS animations)               */
  /* ------------------------------------------------------------------ */
  startTap() {
    if (!this.ok()) return;
    this.tap(0, 1300);
    const t = this.T();
    this.bell(523.25, t, { peak: 0.08, d: 1.4, pan: -0.3 });
    this.bell(783.99, t + 0.08, { peak: 0.08, d: 1.4 });
    this.bell(1046.5, t + 0.16, { peak: 0.08, d: 1.8, pan: 0.3, verb: 0.6 });
  }

  /* ------------------------------------------------------------------ */
  /* per-style sounds  (t = start of animation, dur = anim duration)    */
  /* ------------------------------------------------------------------ */
  private boing(t: number, f0: number, f1: number, dur: number, peak: number, pan: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.5);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(16, t);
    lfo.frequency.linearRampToValueAtTime(7, t + dur);
    const lg = ctx.createGain();
    lg.gain.setValueAtTime(f1 * 0.22, t);
    lg.gain.exponentialRampToValueAtTime(0.5, t + dur);
    lfo.connect(lg);
    lg.connect(o.frequency);
    const g = ctx.createGain();
    this.env(g.gain, t, peak, 0.006, dur);
    o.connect(g);
    g.connect(this.bus({ pan, verb: 0.2, t }));
    [o, lfo].forEach((n) => {
      n.start(t);
      n.stop(t + dur + 0.1);
    });
  }

  private flap(t: number, peak: number, pan: number) {
    this.noise({ t, d: 0.06, peak, f: 1700, f2: 700, q: 1.6, pan, verb: 0.12 });
    this.tone({ f: 320, f2: 160, glide: 0.04, t, d: 0.05, peak: peak * 0.5, pan, verb: 0 });
  }

  private blips(t: number, dur: number, n: number, peak: number, pan: number) {
    for (let i = 0; i < n; i++) {
      const tt = t + (i / n) * dur + Math.random() * 0.015;
      const f = [220, 440, 880, 1320, 1760, 2640, 3520][Math.floor(Math.random() * 7)];
      this.tone({ type: "square", f, f2: f * (Math.random() > 0.5 ? 1.5 : 0.5), glide: 0.03, t: tt, d: 0.03, peak: peak * 0.4, pan: pan + (Math.random() - 0.5) * 0.8, verb: 0.05 });
      if (i % 2 === 0) this.noise({ t: tt, d: 0.025, peak: peak * 0.6, f: 4000 + Math.random() * 4000, q: 4, pan, verb: 0 });
    }
  }

  styleIn(style: string, d: number, dur: number, pan = 0, size = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    const v = size;
    switch (style) {
      case "combo": {
        // comboMove and comboSpin run together for the first third of the
        // CSS animation. The blast peaks at 48%, not 77% as in the old v2
        // sequence; keeping the old timing made the sound noticeably late.
        this.styleIn("rise", d, dur / 3, pan, size);
        const s0 = t;
        const sd = dur / 3;
        for (let i = 0; i < 7; i++) {
          const p = i / 7;
          this.noise({ t: s0 + sd * p, d: 0.16, peak: 0.12 * v * (0.6 + p), f: 700 + p * 2600, f2: 1800 + p * 3500, q: 1.6, swell: true, a: 0.5, pan: Math.sin(i * 1.9) * 0.8, verb: 0.15 });
        }
        this.tone({ type: "triangle", f: 220, f2: 1100, glide: sd, t: s0, a: 0.05, d: sd, peak: 0.05 * v, pan, verb: 0.3 });
        this.bell(PENTA[8], s0 + sd, { d: 0.8, peak: 0.05 * v, pan, verb: 0.5 });
        // Pop's transient is at 38% of its own duration. Place that
        // transient exactly on comboScale/comboFlash's 48% visual peak.
        this.styleIn("pop", d + dur / 3, dur * ((0.48 - 1 / 3) / 0.38), pan, size);
        break;
      }
      case "pop": {
        const hit = t + dur * 0.38;
        // suck-in
        this.noise({ t, d: dur * 0.38, peak: 0.12 * v, f: 400, f2: 5000, q: 1.5, swell: true, a: 0.95, pan, verb: 0.15 });
        // blast
        this.tone({ f: 300, f2: 1400, glide: 0.05, t: hit, d: 0.12, peak: 0.22 * v, pan, verb: 0.15 });
        this.noise({ t: hit, d: 0.35 * (0.6 + v * 0.4), peak: 0.32 * v, f: 3000, f2: 300, type: "lowpass", q: 0.7, pan, verb: 0.4 });
        this.tone({ f: 130, f2: 40, glide: 0.25, t: hit, d: 0.4 * v, peak: 0.5 * v, pan, verb: 0.05 });
        this.bell(PENTA[6 + Math.floor(Math.random() * 4)], hit + 0.02, { d: 1, peak: 0.05 * v, pan, verb: 0.6 });
        if (v > 0.6) this.duck(hit, 0.45, 0.7);
        break;
      }
      case "rise": {
        const land = t + dur * 0.55;
        this.noise({ t, d: dur * 0.6, peak: 0.16 * v, f: 200, f2: 3500, q: 1.2, swell: true, a: 0.8, pan, verb: 0.2 });
        this.tone({ f: 260, f2: 1600, glide: dur * 0.5, t, a: 0.03, d: dur * 0.5, peak: 0.06 * v, pan, verb: 0.3 });
        this.marimba(PENTA[5 + Math.floor(Math.random() * 3)], land, 0.1 * v, pan);
        this.thud(d + dur * 0.75, 0.4 * v, pan);
        break;
      }
      case "fall": {
        const land = t + dur * 0.45;
        // falling whistle
        this.tone({ f: 2400, f2: 520, glide: dur * 0.45, t, a: 0.05, d: dur * 0.43, peak: 0.05 * v, pan, verb: 0.3 });
        this.noise({ t, d: dur * 0.45, peak: 0.1 * v, f: 3000, f2: 600, q: 1.4, swell: true, a: 0.9, pan, verb: 0.1 });
        // bounces
        this.tone({ f: 180, f2: 55, glide: 0.15, t: land, d: 0.3 * v + 0.05, peak: 0.55 * v, pan, verb: 0.08 });
        this.noise({ t: land, d: 0.2, peak: 0.2 * v, f: 1500, f2: 200, type: "lowpass", pan, verb: 0.3 });
        this.thud(d + dur * 0.76, 0.5 * v, pan);
        this.thud(d + dur * 0.87, 0.25 * v, pan);
        if (v > 0.6) this.duck(land, 0.4, 0.7);
        break;
      }
      case "storm": {
        const land = t + dur * 0.5;
        const from = pan >= 0 ? 0.95 : -0.95;
        this.noise({ t, d: dur * 0.6, peak: 0.24 * v, f: 500, f2: 4000, q: 0.8, swell: true, a: 0.75, pan: from, panTo: pan * 0.4, verb: 0.2 });
        this.noise({ t: t + 0.04, d: dur * 0.55, peak: 0.12 * v, f: 1500, f2: 7000, q: 2.5, swell: true, a: 0.7, pan: from, panTo: pan * 0.3, verb: 0.3 });
        this.thud(d + dur * 0.5, 0.45 * v, pan);
        if (v > 0.5) this.shing(d + dur * 0.48, pan * 0.5);
        else this.tone({ f: 2600, t: land, d: 0.25, peak: 0.02 * v + 0.01, pan, verb: 0.5 });
        break;
      }
      case "spin": {
        const land = t + dur * 0.7;
        for (let i = 0; i < 5; i++) {
          const p = i / 5;
          const tt = t + dur * 0.65 * (1 - Math.pow(1 - p, 1.6));
          this.noise({ t: tt, d: 0.14, peak: 0.1 * v * (0.5 + p), f: 600 + p * 2500, f2: 2000 + p * 3000, q: 1.6, swell: true, a: 0.5, pan: Math.sin(i * 2.1) * 0.7, verb: 0.15 });
        }
        this.tone({ type: "triangle", f: 200, f2: 900, glide: dur * 0.7, t, a: 0.05, d: dur * 0.68, peak: 0.05 * v, pan, verb: 0.3 });
        this.bell(PENTA[7 + Math.floor(Math.random() * 3)], land, { d: 1.1, peak: 0.07 * v, pan, verb: 0.55 });
        this.thud(d + dur * 0.7, 0.4 * v, pan);
        break;
      }
      case "flip": {
        this.flap(t + dur * 0.05, 0.22 * v, pan);
        this.flap(t + dur * 0.3, 0.26 * v, pan);
        this.flap(t + dur * 0.55, 0.3 * v, pan);
        this.marimba(PENTA[4 + Math.floor(Math.random() * 4)], t + dur * 0.58, 0.1 * v, pan);
        this.tone({ f: 150, f2: 70, glide: 0.08, t: t + dur * 0.58, d: 0.12, peak: 0.25 * v, pan, verb: 0 });
        break;
      }
      case "jelly": {
        this.boing(t + dur * 0.15, 140 + Math.random() * 40, 380 + Math.random() * 120, 0.55 * (0.6 + v * 0.4), 0.17 * v, pan);
        this.tone({ f: 170, f2: 70, glide: 0.08, t: t + dur * 0.28, d: 0.12, peak: 0.22 * v, pan, verb: 0 });
        break;
      }
      case "glitch": {
        this.blips(t + dur * 0.06, dur * 0.6, Math.round(6 + v * 6), 0.22 * v, pan);
        this.tone({ type: "sawtooth", f: 80, f2: 40, glide: 0.15, t: t + dur * 0.08, d: 0.18, peak: 0.08 * v, pan, verb: 0.05 });
        this.tone({ type: "square", f: 1760, t: t + dur * 0.55, d: 0.08, peak: 0.04 * v, pan, verb: 0.3 });
        break;
      }
    }
  }

  styleOut(style: string, d: number, dur: number, pan = 0, size = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    const v = size;
    switch (style) {
      case "combo":
      case "pop":
        this.tone({ f: 500, f2: 1500, glide: 0.04, t: t + dur * 0.3, d: 0.08, peak: 0.2 * v, pan, verb: 0.2 });
        this.noise({ t: t + dur * 0.3, d: 0.25, peak: 0.22 * v, f: 4000, f2: 600, type: "lowpass", pan, verb: 0.4 });
        break;
      case "rise":
        this.noise({ t, d: dur, peak: 0.18 * v, f: 400, f2: 5000, q: 1.2, swell: true, a: 0.6, pan, verb: 0.2 });
        this.tone({ f: 500, f2: 2400, glide: dur, t: t + dur * 0.2, d: dur * 0.8, peak: 0.05 * v, pan, verb: 0.3 });
        break;
      case "fall":
        this.tone({ f: 1600, f2: 260, glide: dur, t: t + dur * 0.15, a: 0.02, d: dur * 0.85, peak: 0.06 * v, pan, verb: 0.3 });
        this.noise({ t, d: dur, peak: 0.12 * v, f: 3000, f2: 400, q: 1.2, swell: true, a: 0.6, pan, verb: 0.15 });
        break;
      case "storm": {
        const to = pan >= 0 ? -0.95 : 0.95;
        this.noise({ t, d: dur * 1.1, peak: 0.22 * v, f: 3500, f2: 500, q: 0.8, swell: true, a: 0.5, pan: pan * 0.3, panTo: to, verb: 0.2 });
        break;
      }
      case "spin":
        this.noise({ t, d: dur, peak: 0.16 * v, f: 3000, f2: 400, q: 1.6, swell: true, a: 0.4, pan, verb: 0.2 });
        this.tone({ type: "triangle", f: 900, f2: 180, glide: dur, t, d: dur, peak: 0.05 * v, pan, verb: 0.3 });
        break;
      case "flip":
        this.flap(t + dur * 0.15, 0.22 * v, pan);
        this.flap(t + dur * 0.5, 0.18 * v, pan);
        break;
      case "jelly":
        this.boing(t + dur * 0.2, 520, 140, 0.4, 0.14 * v, pan);
        break;
      case "glitch":
        this.blips(t, dur * 0.8, Math.round(4 + v * 4), 0.2 * v, pan);
        this.tone({ type: "sine", f: 2000, f2: 60, glide: 0.12, t: t + dur * 0.8, d: 0.12, peak: 0.1 * v, pan, verb: 0.1 });
        break;
    }
  }

  /* ------------------------------------------------------------------ */
  /* composite menu sequences (driven by the animation plan)            */
  /* ------------------------------------------------------------------ */
  menuEnter(d = 0, plan?: MenuPlan) {
    if (!this.ok()) return;
    this.cancelMenuEnter();
    const dry = this.ctx!.createGain();
    const wet = this.ctx!.createGain();
    dry.connect(this.sfxDry);
    wet.connect(this.sfxWet);
    this.menuBus = { dry, wet };
    this.buildingMenu = true;
    try {
    const p: MenuPlan = plan ?? { title: Array(11).fill("classic"), gun: "classic", buttons: ["classic", "classic"], nav: Array(4).fill("classic"), k: 1 };
    const k = p.k;
    const at = (ms: number) => d + (ms * k) / 1000;
    const len = (ms: number) => (ms * k) / 1000;

    this.whoosh(d, 1.0 * k, 120, 900, 0.07); // air swell as the forest fades in
    this.coin(at(450));
    this.gem(at(580));

    // ---- TITLE: PERFECT ----
    if (p.title[0] === "classic") this.whoosh(at(300), len(550), 500, 2600, 0.1, -0.5, 0.5, 1.4);
    else this.styleIn(p.title[0], at(300), len(750), -0.4, 0.55);
    for (let i = 0; i < 7; i++) {
      const st = p.title[i];
      const land = 300 + i * 70 + 750 * (LAND_FRAC[st] ?? 0.6);
      this.letterPop(at(land), i);
    }

    // ---- GUN ----
    const g = p.gun;
    const gt = gunTiming(g);
    this.wheelDropPop(at(WHEEL.d), len(WHEEL.dur));
    if (g === "classic") this.riser(at(600), len(620), 0.11);
    else this.styleIn(g, at(gt.inD), len(gt.inDur), 0, 1);

    this.bulletStreak(at(800), len(437));

    // ---- SHOT ----
    if (p.title[7] !== "classic") this.styleIn(p.title[7], at(838), len(380), 0, 0.5);
    // each letter thumps as the bullet passes over it
    [838, 943, 1052, 1157].forEach((ms, i) => {
      this.thud(at(ms + 90), 0.55, -0.6 + i * 0.4);
      this.marimba(PENTA[5 + i], this.T(at(ms + 90)), 0.07, -0.6 + i * 0.4, 0.25);
    });
    this.impact(at(1237), 1);
    this.goldChord(at(1260));
    this.sparkle(at(1400), 7, 0.03);

    // ---- MAIN BUTTONS ----
    [-0.6, 0.6].forEach((pan, i) => {
      const st = p.buttons[i];
      const t0 = 1350 + i * 80;
      if (st === "classic") this.whoosh(at(t0), len(420), 300, 2600, 0.16, pan * 1.5, pan * 0.5);
      else this.styleIn(st, at(t0), len(700), pan, 0.7);
    });

    // gun locks in
    this.reload(at(g === "combo" ? gt.inD + gt.inDur * 0.95 : 1720));

    // ---- BOTTOM NAV ----
    for (let i = 0; i < 4; i++) {
      const st = p.nav[i];
      const t0 = 1550 + i * 80;
      if (st === "classic") this.bubble(at(t0 + 420), i);
      else {
        this.styleIn(st, at(t0), len(650), -0.6 + i * 0.4, 0.42);
        this.marimba([783.99, 880, 1046.5, 1318.51][i], this.T(at(t0 + 650 * (LAND_FRAC[st] ?? 0.6))), 0.06, -0.6 + i * 0.4, 0.3);
      }
    }
    } finally {
      this.buildingMenu = false;
    }
  }

  menuExit(to: string, d = 0, plan?: MenuPlan) {
    if (!this.ok()) return;
    const p: MenuPlan = plan ?? { title: Array(11).fill("classic"), gun: "classic", buttons: ["classic", "classic"], nav: Array(4).fill("classic"), k: 1 };
    const k = p.k;
    const at = (ms: number) => d + (ms * k) / 1000;
    const len = (ms: number) => (ms * k) / 1000;

    if (to === "play") {
      this.confirm(d);
      // menu gun lifts, then dives down into its in-game slot and lands (≈0.61s) with a cock
      this.noise({ t: this.T(d + 0.12), d: 0.5, peak: 0.17, f: 2800, f2: 360, q: 1, swell: true, a: 0.75, verb: 0.15 });
      this.tone({ f: 1100, f2: 240, glide: 0.48, t: this.T(d + 0.14), d: 0.48, peak: 0.04, verb: 0.2 });
      this.thud(d + 0.61, 0.85);
      this.click(this.T(d + 0.61), 1500, 0.3);
      this.reload(d + 0.7);
    } else if (to !== "preview") {
      this.confirm(d);
      this.whoosh(d + 0.06, 0.5, 2800, 500, 0.12, 0.2, -0.2, 1.5);
    }

    // title
    if (p.title[0] === "classic") for (let i = 0; i < 7; i++) this.zipUp(at(40 + i * 30), i);
    else {
      this.styleOut(p.title[0], at(40), len(420), -0.3, 0.5);
      for (let i = 0; i < 7; i++) this.zipUp(at(40 + i * 30), i);
    }
    // bullet leaves the bar
    this.noise({ t: this.T(at(110)), d: len(420), peak: 0.14, f: 2200, f2: 6000, q: 2, swell: true, a: 0.5, pan: 0.6, panTo: 1, verb: 0.15 });
    if (p.title[7] === "classic") this.poof(at(160));
    else this.styleOut(p.title[7], at(160), len(460), 0.2, 0.5);
    this.whoosh(at(120), len(340), 3500, 900, 0.08, 0, 0.9);

    // gun
    if (p.gun !== "classic") this.styleOut(p.gun, at(60), len(600), 0, 0.9);

    // buttons
    [-0.6, 0.6].forEach((pan, i) => {
      const st = p.buttons[i];
      if (st === "classic") this.whoosh(at(30), len(400), 600, 3200, 0.13, pan * 0.3, pan * 1.5);
      else this.styleOut(st, at(0), len(480), pan, 0.6);
    });

    // nav
    for (let i = 0; i < 4; i++) {
      const st = p.nav[i];
      if (st === "classic") this.popDown(at(20 + i * 45), i);
      else this.styleOut(st, at(20 + i * 45), len(420), -0.6 + i * 0.4, 0.35);
    }
  }


  setVolume(v: number) {
    this.state.volume = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem("ps_vol", String(this.state.volume));
    } catch {
      /* ignore */
    }
    if (this.ctx) this.master.gain.setTargetAtTime(0.9 * this.state.volume, this.ctx.currentTime, 0.03);
    this.emit();
  }


  /* ------------------------------------------------------------------ */
  /* GIFT OPENING                                                        */
  /* ------------------------------------------------------------------ */
  private rustle(t: number, dur: number, pan = 0, peak = 0.14, panTo?: number) {
    let x = 0;
    while (x < dur) {
      const p = panTo === undefined ? pan : pan + (panTo - pan) * (x / dur);
      this.noise({ t: t + x, d: 0.04 + Math.random() * 0.04, peak: peak * (0.5 + Math.random() * 0.5), f: 1800 + Math.random() * 2600, q: 1.6, pan: p, verb: 0.1 });
      x += 0.028 + Math.random() * 0.03;
    }
  }

  private rip(t: number, dur: number, peak = 0.3) {
    let x = 0;
    while (x < dur) {
      const p = x / dur;
      this.noise({ t: t + x, d: 0.012 + Math.random() * 0.02, peak: peak * (0.4 + 0.6 * Math.sin(p * Math.PI)), f: 2500 + Math.random() * 3500, q: 2.5, pan: (p - 0.5) * 1.2, verb: 0.08 });
      x += 0.008 + Math.random() * 0.01;
    }
    this.noise({ t, d: dur, peak: peak * 0.6, f: 1500, f2: 5000, q: 0.9, swell: true, a: 0.3, verb: 0.15 });
  }

  wrapClose(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.rustle(t, 0.42, -0.9, 0.12, -0.15);
    this.rustle(t + 0.03 * k, 0.42, 0.9, 0.12, 0.15);
    this.noise({ t, d: 0.44, peak: 0.16, f: 400, f2: 2200, q: 0.7, swell: true, a: 0.85, verb: 0.15 });
    this.thud(d + 0.42 * k, 0.6);
    this.tone({ f: 500, f2: 1900, glide: 0.14, t: t + 0.33 * k, d: 0.15, peak: 0.07, verb: 0.2 });
    this.noise({ t: t + 0.33 * k, d: 0.14, peak: 0.1, f: 3000, f2: 7000, type: "highpass", verb: 0.1 });
    this.tone({ f: 600, f2: 2200, glide: 0.12, t: t + 0.41 * k, d: 0.13, peak: 0.07, pan: 0.3, verb: 0.2 });
    this.noise({ t: t + 0.41 * k, d: 0.12, peak: 0.09, f: 3200, f2: 7500, type: "highpass", pan: 0.3, verb: 0.1 });
    this.boing(t + 0.51 * k, 260, 720, 0.5, 0.12, 0);
    this.tone({ f: 500, f2: 1400, glide: 0.04, t: t + 0.51 * k, d: 0.08, peak: 0.18, verb: 0.15 });
    [1567.98, 2093, 2637.02, 3135.96].forEach((f, i) => this.bell(f, t + 0.6 * k + i * 0.05 * k, { d: 0.9, peak: 0.04, pan: -0.4 + i * 0.27 * k, verb: 0.6, ratio: 3.01, index: 1.4 }));
    this.duck(t + 0.42 * k, 0.45, 1);
  }

  wrapOpen(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: 1800, f2: 400, glide: 0.2, t, d: 0.22, peak: 0.07, verb: 0.2 });
    this.noise({ t, d: 0.2, peak: 0.08, f: 6000, f2: 2500, type: "highpass", verb: 0.1 });
    this.rip(t + 0.22 * k, 0.36, 0.28);
    this.whoosh(d + 0.3 * k, 0.5, 500, 3500, 0.16, -0.2, -0.95);
    this.whoosh(d + 0.32 * k, 0.5, 500, 3500, 0.16, 0.2, 0.95);
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone({ type: "triangle", f, t: t + 0.35 * k + i * 0.03 * k, a: 0.1, d: 1, peak: 0.03, pan: -0.4 + i * 0.27 * k, verb: 0.8 }));
    this.sparkle(d + 0.4 * k, 7, 0.03);
  }

  giftDrop(d = 0, durMs = 900, land = 0.45) {
    if (!this.ok()) return;
    const t = this.T(d);
    const l = (durMs * land) / 1000;
    this.tone({ f: 2200, f2: 420, glide: l, t, a: 0.04, d: l, peak: 0.05, verb: 0.3 });
    this.noise({ t, d: l, peak: 0.14, f: 300, f2: 3000, q: 1, swell: true, a: 0.9, verb: 0.15 });
    this.impact(d + l, 0.6);
    this.noise({ t: t + l, d: 0.08, peak: 0.22, f: 700, q: 2, verb: 0.1 });
    this.boing(t + l + 0.05, 200, 520, 0.45, 0.1, 0);
    this.thud(d + (durMs * 0.76) / 1000, 0.3);
    [1046.5, 1567.98].forEach((f, i) => this.bell(f, t + l + 0.12 + i * 0.06, { d: 1, peak: 0.05, verb: 0.5 }));
  }

  giftEnter(d: number, TL: typeof import("../gift/data").GIFT_IN) {
    if (!this.ok()) return;
    const at = (ms: number) => d + ms / 1000;
    const tt = (ms: number) => this.T(at(ms));
    this.whoosh(d, 0.8, 140, 1000, 0.07);
    for (let i = 0; i < 3; i++) {
      const s = TL.top(i);
      this.tone({ f: 1300 + i * 150, f2: 650, glide: 0.04, t: tt(s.d + s.dur * 0.6), d: 0.05, peak: 0.08, pan: -0.7 + i * 0.7, verb: 0.08 });
    }
    this.coin(at(TL.top(1).d + 360));
    this.fabric(at(TL.banner.d), -0.3, false, 0.16);
    this.fabric(at(TL.banner.d + 40), 0.3, false, 0.16);
    this.thud(at(TL.banner.d + TL.banner.dur * TL.banner.land), 0.5);
    this.tone({ type: "sine", f: 220, f2: 440, glide: 0.5, t: tt(TL.spot.d), a: 0.2, d: 0.7, peak: 0.04, verb: 0.7 });
    this.whoosh(at(TL.pedestal.d), 0.45, 200, 1500, 0.1);
    this.giftDrop(at(TL.box.d), TL.box.dur, TL.box.land);
    for (let i = 0; i < 3; i++) this.bubble(at(TL.slot(i).d + 120), i);
    this.sparkle(at(TL.rays.d), 5, 0.022);
    this.bell(1318.51, tt(TL.hint.d + 100), { d: 0.9, peak: 0.05, verb: 0.5 });
  }

  giftTap(k: number, upgrade: boolean) {
    if (!this.ok()) return;
    const t = this.T();
    this.tone({ f: 160 - k * 12, f2: 60, glide: 0.1, t, d: 0.16, peak: 0.42, verb: 0.05 });
    this.noise({ t, d: 0.09, peak: 0.26, f: 650 + k * 140, q: 1.8, verb: 0.1 });
    for (let i = 0; i < 5 + k * 3; i++) this.click(t + 0.03 + Math.random() * 0.2, 1400 + Math.random() * 1800, 0.12 + k * 0.04, (Math.random() - 0.5) * 0.6);
    const base = [783.99, 1046.5, 1318.51][Math.min(2, k - 1)];
    this.bell(base, t + 0.02, { d: 0.8, peak: 0.07, verb: 0.45 });
    this.bell(base * 1.5, t + 0.06, { d: 0.8, peak: 0.05, verb: 0.5, pan: 0.3 });
    this.riser(0.04, 0.35, 0.05 + k * 0.03);
    if (upgrade) {
      this.shing(0.08, 0);
      this.goldChord(0.1, 0.035);
      this.sparkle(0.1, 6, 0.03);
    }
  }

  giftOpen(tier: number) {
    if (!this.ok()) return;
    const t = this.T();
    this.chestRattle(0, 0.44);
    const b = 0.45;
    this.impact(b, 0.8 + tier * 0.15);
    this.tone({ f: 500, f2: 1600, glide: 0.06, t: t + b, d: 0.12, peak: 0.25, verb: 0.2 });
    this.rip(t + b, 0.16, 0.22);
    this.noise({ t: t + b, d: 0.9, peak: 0.25, f: 6000, f2: 400, type: "lowpass", verb: 0.5 });
    const lift = [1, 1.122, 1.26, 1.5][tier];
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
      this.tone({ type: "sine", f: f * lift, t: t + b + 0.02, a: 0.15, d: 1.6 + tier * 0.3, peak: 0.028, pan: -0.5 + i * 0.25, verb: 0.9 }),
    );
    this.confetti(b, 14 + tier * 5);
    if (tier >= 1) this.fanfare(b + 0.05, 0.6 + tier * 0.15);
    if (tier >= 3) {
      this.goldChord(b + 0.35, 0.05);
      this.sparkle(b + 0.5, 12, 0.035);
      this.timpani(t + b + 0.3, 65.4, 0.4);
    }
    this.duck(t + b, 0.3, 1.6);
  }

  revealReward(kind: string, tier: number) {
    if (!this.ok()) return;
    const t = this.T();
    if (kind === "coin") {
      for (let i = 0; i < 12; i++) this.bell(1975.53 + (i % 5) * 160, t + i * 0.045, { ratio: 2, index: 0.7, d: 0.35, peak: 0.035, pan: -0.6 + (i % 5) * 0.3, verb: 0.25 });
    } else if (kind === "gem") {
      [2093, 2637.02, 3135.96, 4186, 5274].forEach((f, i) => this.bell(f, t + i * 0.05, { d: 1.2, peak: 0.04, pan: -0.5 + i * 0.25, verb: 0.7 }));
      this.shing(0.1, 0);
    } else {
      this.flap(t + 0.05, 0.22, 0);
      this.flap(t + 0.25, 0.26, 0);
      this.flap(t + 0.5, 0.3, 0);
      this.brass(t + 0.6, [261.63, 329.63, 392, 523.25], 0.9, 0.05);
      this.timpani(t + 0.6, 65.4, 0.35);
      this.reload(0.75);
      this.sparkle(0.65, 6 + tier * 2, 0.03);
    }
  }

  giftExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    this.whoosh(d + 0.03, 0.45, 500, 4000, 0.14);
    this.boing(this.T(d + 0.05), 300, 900, 0.3, 0.07, 0);
    this.fabric(d + 0.1, 0, true, 0.12);
  }

  /* ------------------------------------------------------------------ */
  /* GAMEPLAY                                                            */
  /* ------------------------------------------------------------------ */
  gunShot() {
    if (!this.ok()) return;
    const t = this.T();
    const pv = 1 + (Math.random() - 0.5) * 0.12;
    this.noise({ t, d: 0.1, peak: 0.55, f: 2000 * pv, f2: 450, q: 0.8, verb: 0.22 });
    this.noise({ t, d: 0.022, peak: 0.42, f: 4200, type: "highpass", verb: 0.08 });
    this.tone({ f: 160 * pv, f2: 42, glide: 0.12, t, d: 0.17, peak: 0.62, verb: 0.06 });
    this.tone({ type: "square", f: 95, f2: 40, glide: 0.06, t, d: 0.05, peak: 0.07, verb: 0 });
    this.noise({ t: t + 0.02, d: 0.38, peak: 0.07, f: 900, f2: 180, type: "lowpass", verb: 0.55 });
    this.click(t + 0.08, 3200, 0.12, 0.35);
    this.bell(4100 + Math.random() * 500, t + 0.24, { ratio: 2.7, index: 0.6, d: 0.22, peak: 0.018, pan: 0.55, verb: 0.15 });
    this.duck(t, 0.6, 0.3);
  }

  hitTarget(kind: string, combo = 1) {
    if (!this.ok()) return;
    const t = this.T();
    if (kind === "wood" || kind === "coconut") {
      this.tone({ type: "triangle", f: 720, f2: 240, glide: 0.06, t, d: 0.09, peak: 0.3, verb: 0.08 });
      this.click(t, 1500, 0.4);
      this.noise({ t, d: 0.07, peak: 0.2, f: 900, q: 3, verb: 0.08 });
    } else if (kind === "soccer" || kind === "basketball" || kind === "volleyball") {
      // rubber ball "bonk"
      const lo = kind === "basketball" ? 0.8 : 1;
      this.tone({ f: 240 * lo, f2: 120 * lo, glide: 0.07, t, d: 0.14, peak: 0.34, verb: 0.08 });
      this.tone({ type: "triangle", f: 520 * lo, f2: 300 * lo, glide: 0.05, t, d: 0.08, peak: 0.1, verb: 0.08 });
      this.noise({ t, d: 0.06, peak: 0.18, f: 700, q: 1.5, verb: 0.05 });
    } else if (kind === "tennis" || kind === "baseball") {
      // felt / leather "pock"
      const hi = kind === "tennis" ? 1.25 : 1;
      this.tone({ f: 900 * hi, f2: 420 * hi, glide: 0.04, t, d: 0.07, peak: 0.26, verb: 0.12 });
      this.noise({ t, d: 0.05, peak: 0.2, f: 2200 * hi, q: 2, verb: 0.08 });
      this.click(t, 1600 * hi, 0.3);
    } else if (kind === "bowling") {
      // dense resin "thock"
      this.tone({ type: "triangle", f: 190, f2: 85, glide: 0.1, t, d: 0.2, peak: 0.36, verb: 0.1 });
      this.noise({ t, d: 0.07, peak: 0.24, f: 620, q: 3, verb: 0.1 });
      this.click(t, 1100, 0.45);
    } else if (kind === "moon" || kind === "mars" || kind === "jupiter" || kind === "pluto") {
      // rocky planet thud with a cosmic shimmer
      this.tone({ f: 150, f2: 60, glide: 0.12, t, d: 0.2, peak: 0.36, verb: 0.2 });
      this.noise({ t, d: 0.12, peak: 0.2, f: 900, f2: 200, type: "lowpass", verb: 0.25 });
      this.bell(1567.98 + Math.random() * 400, t + 0.03, { ratio: 3.01, index: 1.2, d: 0.6, peak: 0.025, verb: 0.7 });
    } else if (kind === "disco" || kind === "ornament" || kind === "pearl") {
      // glassy ting
      this.click(t, 3200, 0.3);
      this.bell(2637.02 + Math.random() * 500, t + 0.01, { ratio: 2.76, index: 1, d: 0.5, peak: 0.05, verb: 0.5 });
      this.tone({ f: 420, f2: 200, glide: 0.06, t, d: 0.08, peak: 0.12, verb: 0.05 });
    } else if (kind === "ufo" || kind === "grapesoda") {
      // metal "dong"
      this.metalRing(t, kind === "ufo" ? 520 : 900, 0.05, 0.5);
      this.click(t, 2200, 0.35);
      if (kind === "ufo") this.tone({ type: "sine", f: 600, f2: 1200, glide: 0.25, t: t + 0.02, d: 0.3, peak: 0.04, verb: 0.4 });
    } else if (kind === "cannon") {
      // heavy cast-iron clank
      this.metalRing(t, 180, 0.07, 0.8);
      this.tone({ f: 120, f2: 60, glide: 0.12, t, d: 0.2, peak: 0.4, verb: 0.1 });
      this.click(t, 1400, 0.45);
    } else if (kind === "dartboard") {
      this.tone({ f: 260, f2: 110, glide: 0.06, t, d: 0.1, peak: 0.32, verb: 0.06 });
      this.noise({ t, d: 0.06, peak: 0.22, f: 1100, q: 2, verb: 0.05 });
    } else if (kind === "icecream" || kind === "friedegg") {
      // soft plop
      this.tone({ f: 300, f2: 620, glide: 0.07, t, d: 0.12, peak: 0.2, verb: 0.08 });
      this.noise({ t, d: 0.12, peak: 0.16, f: 900, f2: 300, type: "lowpass", verb: 0.05 });
    } else if (kind === "peppermint" || kind === "quailegg") {
      // candy / shell crack
      for (let i = 0; i < 3; i++) this.click(t + i * 0.014, 2600 + Math.random() * 1200, 0.28, (Math.random() - 0.5) * 0.4);
      this.tone({ type: "triangle", f: 820, f2: 400, glide: 0.04, t, d: 0.06, peak: 0.14, verb: 0.08 });
    } else if (kind === "spiral") {
      this.tone({ type: "sine", f: 300, f2: 900, glide: 0.18, t, d: 0.2, peak: 0.14, verb: 0.3 });
      this.tone({ f: 200, f2: 90, glide: 0.08, t, d: 0.1, peak: 0.24, verb: 0.05 });
    } else if (kind === "eyeball") {
      // squelch
      this.noise({ t, d: 0.18, peak: 0.3, f: 700, f2: 2400, q: 3, verb: 0.08 });
      this.tone({ f: 220, f2: 480, glide: 0.1, t, d: 0.14, peak: 0.16, verb: 0.05 });
    } else if (kind === "carrom" || kind === "carrom2" || kind === "eightball") {
      // hard lacquered "TAK"
      this.click(t, 2200, 0.5);
      this.tone({ type: "triangle", f: 980, f2: 420, glide: 0.05, t, d: 0.08, peak: 0.26, verb: 0.12 });
      this.click(t + 0.05, 2800, 0.16, 0.3);
    } else if (kind === "casino") {
      // clay chip clack + coin shimmer
      this.noise({ t, d: 0.05, peak: 0.3, f: 3200, q: 3, verb: 0.1 });
      this.tone({ f: 1500, f2: 1100, glide: 0.04, t, d: 0.06, peak: 0.16, verb: 0.1 });
      this.bell(2637.02, t + 0.02, { ratio: 2, index: 0.7, d: 0.3, peak: 0.03, verb: 0.3 });
    } else if (kind === "beach") {
      // soft sand "pfft"
      this.noise({ t, d: 0.2, peak: 0.3, f: 1200, f2: 300, type: "lowpass", q: 0.6, verb: 0.08 });
      this.tone({ f: 180, f2: 80, glide: 0.08, t, d: 0.12, peak: 0.22, verb: 0.05 });
    } else if (kind === "durian") {
      // thick husk crunch + creamy squish
      this.noise({ t, d: 0.16, peak: 0.32, f: 1300, f2: 260, type: "lowpass", q: 1.2, verb: 0.1 });
      this.tone({ f: 260, f2: 90, glide: 0.08, t, d: 0.12, peak: 0.3, verb: 0.05 });
      for (let i = 0; i < 4; i++) this.click(t + i * 0.012, 2400 + Math.random() * 1200, 0.18, (Math.random() - 0.5) * 0.5);
    } else if (kind === "boss") {
      this.impact(0, 0.35);
      this.tone({ type: "sawtooth", f: 90, f2: 60, glide: 0.15, t: t + 0.02, d: 0.18, peak: 0.06, verb: 0.1 });
    } else {
      this.noise({ t, d: 0.13, peak: 0.3, f: 1600, f2: 300, type: "lowpass", q: 1.2, verb: 0.1 });
      this.tone({ f: 320, f2: 110, glide: 0.07, t, d: 0.1, peak: 0.28, verb: 0.05 });
      for (let i = 0; i < 3; i++) {
        const f = 600 + Math.random() * 600;
        this.tone({ f, f2: f * 1.8, glide: 0.04, t: t + 0.02 + i * 0.03, d: 0.04, peak: 0.03, pan: (Math.random() - 0.5) * 0.6, verb: 0.15 });
      }
    }
    this.marimba(PENTA[Math.min(PENTA.length - 1, combo % PENTA.length)], t + 0.01, 0.07, 0, 0.2);
  }

  ricochet() {
    if (!this.ok()) return;
    const t = this.T();
    this.click(t, 2600, 0.6);
    this.metalRing(t, 640, 0.07, 0.7, -0.3);
    this.tone({ f: 2800, f2: 650, glide: 0.38, t: t + 0.02, d: 0.42, peak: 0.09, pan: -0.5, verb: 0.35 });
    this.tone({ type: "triangle", f: 320, f2: 120, glide: 0.3, t: t + 0.08, d: 0.35, peak: 0.1, verb: 0.1 });
    this.duck(t, 0.3, 1.4);
    // sad sting
    this.brass(t + 0.55, [392, 466.16], 0.24, 0.035);
    this.brass(t + 0.82, [349.23, 415.3], 0.24, 0.035);
    this.brass(t + 1.09, [311.13, 369.99], 0.8, 0.035);
    this.timpani(t + 1.09, 73.4, 0.25);
  }

  targetBreak(kind: string, boss = false) {
    if (!this.ok()) return;
    const t = this.T();
    this.impact(0, boss ? 1.2 : 0.9);
    this.noise({ t, d: 0.6, peak: 0.3, f: 5000, f2: 300, type: "lowpass", verb: 0.4 });
    if (kind === "wood" || kind === "coconut" || kind === "moon" || kind === "mars" || kind === "pluto") for (let i = 0; i < 8; i++) this.click(t + 0.05 + Math.random() * 0.4, 900 + Math.random() * 900, 0.25, Math.random() * 1.6 - 0.8);
    else if (kind === "bowling") {
      // STRIKE! pins clattering
      for (let i = 0; i < 16; i++) {
        const tt = t + 0.04 + Math.pow(Math.random(), 1.6) * 0.75;
        const pan = Math.random() * 1.6 - 0.8;
        this.click(tt, 700 + Math.random() * 900, 0.32, pan);
        this.tone({ type: "triangle", f: 420 + Math.random() * 260, f2: 260, glide: 0.06, t: tt, d: 0.08, peak: 0.08, pan, verb: 0.2 });
      }
      this.tone({ f: 70, f2: 40, glide: 0.5, t, d: 0.6, peak: 0.35, verb: 0.1 });
    } else if (kind === "cannon") {
      // KABOOM
      this.impact(0.02, 1.4);
      this.noise({ t, d: 1.4, peak: 0.42, f: 3000, f2: 120, type: "lowpass", q: 0.6, verb: 0.6 });
      this.tone({ f: 60, f2: 25, glide: 1, t, d: 1.2, peak: 0.6, verb: 0.15 });
      for (let i = 0; i < 10; i++) this.click(t + 0.08 + Math.random() * 0.6, 600 + Math.random() * 900, 0.22, Math.random() * 1.6 - 0.8);
      this.duck(t, 0.2, 1.8);
    } else if (kind === "disco" || kind === "ornament" || kind === "pearl") {
      // glass shatter shimmer
      for (let i = 0; i < 16; i++) {
        const tt = t + 0.02 + Math.pow(Math.random(), 1.4) * 0.7;
        this.click(tt, 3000 + Math.random() * 3000, 0.22, Math.random() * 1.6 - 0.8);
        if (i % 2 === 0) this.bell(2093 + Math.random() * 2500, tt, { ratio: 2.76, index: 1, d: 0.4, peak: 0.03, pan: Math.random() * 1.6 - 0.8, verb: 0.5 });
      }
    } else if (kind === "casino") {
      // jackpot: chips & coins pouring out
      for (let i = 0; i < 18; i++) {
        const tt = t + 0.05 + Math.pow(Math.random(), 1.4) * 0.9;
        this.bell(1975.53 + Math.random() * 1500, tt, { ratio: 2, index: 0.7, d: 0.3, peak: 0.035, pan: Math.random() * 1.6 - 0.8, verb: 0.25 });
        if (i % 3 === 0) this.noise({ t: tt, d: 0.04, peak: 0.12, f: 3000, q: 3, pan: Math.random() * 1.6 - 0.8, verb: 0.1 });
      }
      this.goldChord(0.3, 0.035);
    } else if (kind === "carrom" || kind === "carrom2" || kind === "eightball") {
      // shards scattering across the table
      for (let i = 0; i < 14; i++) {
        const tt = t + 0.04 + Math.pow(Math.random(), 1.5) * 0.7;
        this.click(tt, 1800 + Math.random() * 1400, 0.3, Math.random() * 1.6 - 0.8);
      }
      this.tone({ type: "triangle", f: 300, f2: 120, glide: 0.2, t, d: 0.25, peak: 0.2, verb: 0.15 });
    } else if (kind === "soccer" || kind === "basketball" || kind === "tennis" || kind === "baseball" || kind === "volleyball") {
      // ball bursts with an air "POP" and a whoosh of air
      this.tone({ f: 600, f2: 1600, glide: 0.03, t, d: 0.06, peak: 0.3, verb: 0.2 });
      this.noise({ t, d: 0.45, peak: 0.28, f: 6000, f2: 900, q: 0.8, swell: true, a: 0.05, verb: 0.3 });
      this.boing(t + 0.08, 500, 180, 0.35, 0.08, 0);
    } else this.splash(0.02, 0, kind === "durian" ? 1.4 : 1.2);
    for (let i = 0; i < 6; i++) this.bell(3000 + Math.random() * 1500, t + 0.2 + i * 0.07, { ratio: 2.7, index: 0.6, d: 0.2, peak: 0.02, pan: Math.random() * 1.6 - 0.8, verb: 0.2 });
    this.confetti(0.05, boss ? 26 : 16);
    if (boss) this.fanfare(0.15, 1);
  }

  /** boss laugh "HA-HA-HA" — formant-ish voice from filtered saw bursts */
  bossLaugh(head = "pirate") {
    if (!this.ok()) return;
    const ctx = this.ctx!;
    const t0 = this.T();
    const base = { pirate: 150, jester: 300, dragon: 95, skeleton: 210, tiki: 120, viking: 115, oni: 105, robot: 180, alien: 380, vampire: 140, sun: 170 }[head] ?? 160;
    for (let i = 0; i < 4; i++) {
      const t = t0 + i * 0.16;
      const f0 = base * (1.18 - i * 0.07);
      const o = ctx.createOscillator();
      o.type = head === "robot" ? "square" : "sawtooth";
      o.frequency.setValueAtTime(f0 * 1.1, t);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.82, t + 0.12);
      const f1 = ctx.createBiquadFilter();
      f1.type = "bandpass";
      f1.frequency.value = 800;
      f1.Q.value = 5;
      const f2 = ctx.createBiquadFilter();
      f2.type = "bandpass";
      f2.frequency.value = 1250;
      f2.Q.value = 7;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.28, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
      o.connect(f1);
      o.connect(f2);
      f1.connect(g);
      f2.connect(g);
      g.connect(this.bus({ verb: 0.25, t }));
      o.start(t);
      o.stop(t + 0.16);
      this.noise({ t, d: 0.05, peak: 0.06, f: 2500, q: 1, verb: 0.1 }); // breathy "h"
    }
  }

  /** short angry growl when the boss gets hit */
  bossGrowl() {
    if (!this.ok()) return;
    const ctx = this.ctx!;
    const t = this.T();
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(70, t + 0.3);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 28;
    const lg = ctx.createGain();
    lg.gain.value = 18;
    lfo.connect(lg);
    lg.connect(o.frequency);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(lp);
    lp.connect(g);
    g.connect(this.bus({ verb: 0.15, t }));
    [o, lfo].forEach((n) => {
      n.start(t);
      n.stop(t + 0.35);
    });
  }

  /** boss rage: roar + alarm stab */
  bossRage() {
    if (!this.ok()) return;
    const t = this.T();
    this.bossGrowl();
    this.tone({ type: "sawtooth", f: 60, f2: 140, glide: 0.5, t, d: 0.7, peak: 0.12, verb: 0.3 });
    this.noise({ t, d: 0.7, peak: 0.25, f: 400, f2: 1600, q: 1, swell: true, a: 0.3, verb: 0.3 });
    for (let i = 0; i < 3; i++) this.tone({ type: "square", f: 880, f2: 660, glide: 0.1, t: t + 0.25 + i * 0.16, d: 0.1, peak: 0.05, verb: 0.2 });
    this.impact(0.3, 0.7);
    // thrown knife
    this.whoosh(0.4, 0.25, 600, 4000, 0.14, 0.8, -0.2);
    this.click(t + 0.66, 2200, 0.45);
    this.metalRing(t + 0.66, 880, 0.04, 0.6);
  }

  /** boss: hit-flicker beeps → big explosion → K.O. fanfare */
  bossDefeat() {
    if (!this.ok()) return;
    const t = this.T();
    for (let i = 0; i < 4; i++) {
      this.tone({ type: "square", f: 880 - i * 90, f2: 700 - i * 90, glide: 0.05, t: t + i * 0.085, d: 0.06, peak: 0.07, verb: 0.1 });
      this.click(t + i * 0.085, 2400, 0.25);
    }
    this.riser(0, 0.34, 0.14);
    const b = 0.34;
    this.impact(b, 1.3);
    this.noise({ t: t + b, d: 1.1, peak: 0.34, f: 4000, f2: 200, type: "lowpass", q: 0.7, verb: 0.55 });
    this.tone({ f: 70, f2: 30, glide: 0.8, t: t + b, d: 0.9, peak: 0.5, verb: 0.1 });
    for (let i = 0; i < 10; i++) this.click(t + b + 0.05 + Math.random() * 0.5, 800 + Math.random() * 1600, 0.2, Math.random() * 1.6 - 0.8);
    this.confetti(b + 0.05, 24);
    this.fanfare(b + 0.25, 1.1);
    this.timpani(t + b + 0.51, 49, 0.45);
    this.goldChord(b + 0.55, 0.05);
    this.duck(t + b, 0.25, 1.8);
  }

  stageClear(stars: number) {
    if (!this.ok()) return;
    this.fanfare(0, 0.9);
    for (let i = 0; i < 3; i++) {
      const t = this.T(0.25 + i * 0.26);
      if (i < stars) {
        this.bell([1046.5, 1318.51, 1567.98][i] * 1.5, t + 0.12, { d: 1.2, peak: 0.08, pan: -0.5 + i * 0.5, verb: 0.55 });
        this.thud(0.25 + i * 0.26 + 0.12, 0.5, -0.5 + i * 0.5);
        this.sparkle(0.25 + i * 0.26 + 0.12, 4, 0.025);
      } else this.tone({ f: 300, f2: 200, glide: 0.1, t: t + 0.12, d: 0.12, peak: 0.06, verb: 0.1 });
    }
    this.coin(1.15);
  }

  levelStart(boss: boolean, ammo: number, TL: { target: { d: number; dur: number; land: number }; level: { d: number } }) {
    if (!this.ok()) return;
    const at = (ms: number) => ms / 1000;
    this.dropPop(at(TL.target.d), TL.target.dur / 1000, boss ? 1 : 0.8);
    for (let i = 0; i < Math.min(ammo, 12); i++) this.click(this.T(at(200 + i * 40)), 2400 + i * 60, 0.12, -0.7);
    if (boss) {
      this.drumRoll(at(TL.level.d - 80), 0.5, 0.12);
      this.brass(this.T(at(TL.level.d + 120)), [98, 146.83, 196], 1.1, 0.06);
      this.timpani(this.T(at(TL.level.d + 120)), 49, 0.5);
      this.impact(at(TL.level.d + 120), 0.9);
    } else {
      this.whoosh(at(TL.level.d), 0.25, 400, 3000, 0.12);
      this.thud(at(TL.level.d + 240), 0.8);
      this.bell(1318.51, this.T(at(TL.level.d + 250)), { d: 1, peak: 0.06, verb: 0.5 });
      this.bell(1975.53, this.T(at(TL.level.d + 290)), { d: 1, peak: 0.04, verb: 0.5, pan: 0.3 });
    }
  }

  playEnter(d: number, TL: typeof import("../play/levels").PLAY_IN, boss: boolean, ammo: number, opt: { gun?: boolean; offset?: number } = {}) {
    if (!this.ok()) return;
    const off = opt.offset ?? 0;
    const at = (ms: number) => d + ms / 1000;
    const tt = (ms: number) => this.T(at(ms));
    this.whoosh(at(TL.hud.d + off), 0.35, 500, 2600, 0.08);
    this.dropPop(at(TL.target.d), TL.target.dur / 1000, boss ? 1 : 0.8);
    if (opt.gun !== false) {
      this.whoosh(at(TL.gun.d + off), 0.45, 200, 1800, 0.14);
      this.reload(at(TL.gun.d + off + TL.gun.dur * 0.55));
    }
    for (let i = 0; i < Math.min(ammo, 12); i++) this.click(tt(TL.ammo(i).d + off + 200), 2400 + i * 60, 0.13, -0.7);
    const L = TL.level.d;
    if (boss) {
      this.drumRoll(at(L - 120), 0.5, 0.12);
      this.brass(tt(L + 120), [98, 146.83, 196], 1.1, 0.06);
      this.timpani(tt(L + 120), 49, 0.5);
      this.impact(at(L + 120), 0.9);
    } else {
      this.whoosh(at(L), 0.25, 400, 3000, 0.12);
      this.thud(at(L + 240), 0.8);
      this.bell(1318.51, tt(L + 250), { d: 1, peak: 0.06, verb: 0.5 });
      this.bell(1975.53, tt(L + 290), { d: 1, peak: 0.04, verb: 0.5, pan: 0.3 });
    }
  }

  playExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    this.whoosh(d + 0.03, 0.4, 2400, 300, 0.12);
    this.click(this.T(d + 0.05), 1800, 0.25);
  }

  /** scope v2: lens zooms in and locks on the target spot (≈0.62s) */
  scopeAim(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(380, t + 0.5);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
    o.connect(lp);
    lp.connect(g);
    g.connect(this.bus({ verb: 0.1, t }));
    o.start(t);
    o.stop(t + 0.6);
    this.noise({ t, d: 0.5, peak: 0.13, f: 3200, f2: 600, q: 0.8, swell: true, a: 0.85, verb: 0.2 });
    this.ratchet(t + 0.12, 8, 0.42, 3600, 0.09);
    this.click(t + 0.56, 1700, 0.45);
    this.bell(2093, t + 0.57, { d: 0.6, peak: 0.035, verb: 0.4 });
    [0.78, 0.92].forEach((x, i) => this.tone({ f: 70, f2: 45, glide: 0.08, t: t + x, d: 0.12, peak: i ? 0.2 : 0.28, verb: 0.05 }));
    this.duck(t + 0.5, 0.5, 1.2);
  }

  /** sniper scope transition */
  scopeClose(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(90, t);
    o.frequency.exponentialRampToValueAtTime(420, t + 0.35);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 900;
    const gg = ctx.createGain();
    gg.gain.setValueAtTime(0.0001, t);
    gg.gain.exponentialRampToValueAtTime(0.05, t + 0.3);
    gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    o.connect(lp);
    lp.connect(gg);
    gg.connect(this.bus({ verb: 0.1, t }));
    o.start(t);
    o.stop(t + 0.45);
    this.noise({ t, d: 0.35, peak: 0.16, f: 3000, f2: 500, q: 0.8, swell: true, a: 0.9, verb: 0.2 });
    this.ratchet(t + 0.18, 6, 0.18, 3400, 0.12);
    this.click(t + 0.36, 1600, 0.45);
    this.bell(2093, t + 0.37, { d: 0.6, peak: 0.04, verb: 0.4 });
    // heartbeat while aiming
    [0.5, 0.64].forEach((x, i) => this.tone({ f: 70, f2: 45, glide: 0.08, t: t + x, d: 0.12, peak: i ? 0.25 : 0.35, verb: 0.05 }));
    // close to black
    this.tone({ f: 110, f2: 40, glide: 0.25, t: t + 0.68, d: 0.4, peak: 0.35, verb: 0.15 });
    this.duck(t + 0.68, 0.4, 1.2);
    // loading ammo during hold
    for (let i = 0; i < 5; i++) this.click(t + 0.78 + i * 0.075, 2600 + i * 120, 0.22, -0.3 + i * 0.15);
    this.reload(d + 1.2);
  }

  scopeOpen(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.55, peak: 0.2, f: 250, f2: 5000, q: 0.6, swell: true, a: 0.5, verb: 0.3 });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone({ type: "triangle", f, t: t + 0.12 + i * 0.03, a: 0.08, d: 0.9, peak: 0.03, pan: -0.4 + i * 0.27, verb: 0.7 }),
    );
  }

  /* ------------------------------------------------------------------ */
  /* ARMORY / GUN SHOP                                                   */
  /* ------------------------------------------------------------------ */
  /** inharmonic metal ring (steel plate) */
  private metalRing(t: number, base: number, peak: number, dur = 1.2, pan = 0) {
    [1, 2.76, 5.4, 8.93, 13.34].forEach((r, i) => {
      this.tone({ f: base * r, t, a: 0.002, d: dur / (1 + i * 0.6), peak: peak / (1 + i * 0.8), pan, verb: 0.45 });
    });
  }

  private ratchet(t: number, n: number, span: number, f = 2800, peak = 0.16, pan = 0) {
    for (let i = 0; i < n; i++) this.click(t + (i / n) * span, f * (1 + (i % 2) * 0.25), peak * (0.7 + 0.3 * (i / n)), pan);
  }

  /** card flick "fwip" */
  fwip(d: number, pan = 0, peak = 0.14) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.11, peak, f: 1800, f2: 5200, q: 1.3, swell: true, a: 0.4, pan, verb: 0.08 });
  }

  private cardLand(t: number, i: number, pan: number) {
    this.noise({ t, d: 0.04, peak: 0.12, f: 2400, q: 2, pan, verb: 0.05 });
    this.tone({ f: 260, f2: 120, glide: 0.05, t, d: 0.07, peak: 0.12, pan, verb: 0 });
    this.marimba(PENTA[(3 + i) % PENTA.length], t + 0.005, 0.07, pan, 0.25);
  }

  shutterClose(d = 0, slamAt = 0.336, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    const slam = t + slamAt;
    // doors rushing in
    this.noise({ t, d: slamAt + 0.02, peak: 0.24, f: 500, f2: 2600, q: 0.7, swell: true, a: 0.92, verb: 0.15 });
    // servo motor whine
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(190, slam);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 700;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, slam - 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, slam + 0.03 * k);
    o.connect(lp);
    lp.connect(g);
    g.connect(this.bus({ verb: 0.1, t }));
    o.start(t);
    o.stop(slam + 0.1 * k);
    // SLAM
    this.impact(d + slamAt, 1.05);
    this.metalRing(slam, 132, 0.09, 1.4);
    this.metalRing(slam + 0.004 * k, 197, 0.05, 0.9, 0.3);
    this.click(slam, 1800, 0.55);
    this.click(slam + 0.012 * k, 900, 0.4);
    this.duck(slam, 0.25, 1.4);
    // emblem spins in (ratchet) → bolts lock
    this.ratchet(slam + 0.02 * k, 8, 0.32, 3000, 0.12);
    this.bell(1567.98, slam + 0.34 * k, { d: 1.2, peak: 0.06, verb: 0.6 });
    this.bell(2349.32, slam + 0.38 * k, { d: 1.2, peak: 0.04, verb: 0.6, pan: 0.3 });
    [0.56, 0.6, 0.64, 0.68].forEach((x, i) => {
      const tt = t + x * k;
      this.click(tt, 2200 - i * 150, 0.38, [-0.4, 0.4, 0, 0][i]);
      this.tone({ f: 190, f2: 90, glide: 0.04, t: tt, d: 0.06, peak: 0.14, verb: 0.05 });
    });
  }

  shutterOpen(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    // emblem unlock
    this.ratchet(t, 6, 0.18, 2600, 0.12);
    this.click(t + 0.2 * k, 1400, 0.5);
    this.tone({ f: 120, f2: 60, glide: 0.1, t: t + 0.2 * k, d: 0.18, peak: 0.3, verb: 0.1 });
    // hydraulic hiss (pressure release)
    this.noise({ t: t + 0.14 * k, d: 0.55, peak: 0.16, f: 3500, f2: 7000, type: "highpass", swell: true, a: 0.15, pan: -0.5, panTo: -0.2, verb: 0.3 });
    this.noise({ t: t + 0.16 * k, d: 0.5, peak: 0.13, f: 4000, f2: 7500, type: "highpass", swell: true, a: 0.15, pan: 0.5, panTo: 0.2, verb: 0.3 });
    // doors sliding apart (metal scrape + whoosh)
    this.noise({ t: t + 0.2 * k, d: 0.5, peak: 0.08, f: 1400, f2: 650, q: 9, swell: true, a: 0.3, verb: 0.2 });
    this.noise({ t: t + 0.2 * k, d: 0.5, peak: 0.2, f: 300, f2: 3800, q: 0.7, swell: true, a: 0.5, verb: 0.25 });
    // bright reveal shimmer
    [659.25, 783.99, 987.77, 1318.51].forEach((f, i) =>
      this.tone({ type: "sine", f, t: t + 0.28 * k + i * 0.03 * k, a: 0.1, d: 1.2, peak: 0.03, pan: -0.4 + i * 0.27 * k, verb: 0.85 }),
    );
  }

  shopEnter(d = 0, TL?: typeof import("../shop/timeline").SHOP_IN) {
    if (!this.ok() || !TL) return;
    const at = (ms: number) => d + ms / 1000;
    const tt = (ms: number) => this.T(at(ms));

    this.whoosh(d, 0.9, 140, 1200, 0.08);
    // top bar drops
    for (let i = 0; i < 4; i++) {
      const s = TL.top(i);
      this.tone({ f: 1400 + i * 120, f2: 700, glide: 0.04, t: tt(s.d + s.dur * 0.6), d: 0.05, peak: 0.08, pan: -0.7 + i * 0.45, verb: 0.08 });
    }
    this.coin(at(TL.top(3).d + 380));
    this.gem(at(TL.top(3).d + 470));
    this.whoosh(at(TL.row2.d), 0.35, 400, 2400, 0.08, -0.8, -0.3);
    // spotlight + rays
    this.tone({ type: "sine", f: 220, f2: 440, glide: 0.5, t: tt(TL.spot.d), a: 0.2, d: 0.7, peak: 0.04, verb: 0.7 });
    this.sparkle(at(TL.rays.d), 6, 0.022, 0.06);
    // HERO GUN drop
    const land = TL.hero.d + TL.hero.dur * TL.hero.land;
    this.tone({ f: 2200, f2: 380, glide: (land - TL.hero.d) / 1000, t: tt(TL.hero.d), a: 0.05, d: (land - TL.hero.d) / 1000, peak: 0.045, verb: 0.3 });
    this.noise({ t: tt(TL.hero.d), d: (land - TL.hero.d) / 1000, peak: 0.16, f: 300, f2: 3200, q: 1, swell: true, a: 0.9, verb: 0.15 });
    this.impact(at(land), 0.85);
    this.goldChord(at(land + 20), 0.04);
    this.reload(at(land + 160));
    // name plate slam + NEW
    const pl = TL.plate.d + TL.plate.dur * TL.plate.land;
    this.thud(at(pl), 0.8);
    this.marimba(1046.5, tt(pl), 0.1);
    this.marimba(1567.98, tt(pl + 60), 0.08, 0.3);
    this.bubble(at(pl + 120), 3);
    this.whoosh(at(TL.pill.d), 0.3, 500, 2600, 0.07, 0, 0);
    // tabs pop (ascending)
    for (let i = 0; i < 7; i++) {
      const s = TL.tab(i);
      const pan = -0.75 + i * 0.25;
      this.tone({ f: 380 + i * 50, f2: 900 + i * 90, glide: 0.06, t: tt(s.d + s.dur * 0.3), d: 0.08, peak: 0.08, pan, verb: 0.08 });
      this.marimba(PENTA[i], tt(s.d + s.dur * s.land), 0.07, pan, 0.25);
    }
    // panel rises
    this.noise({ t: tt(TL.panel.d), d: (TL.panel.dur * TL.panel.land) / 1000, peak: 0.2, f: 200, f2: 2600, q: 0.8, swell: true, a: 0.85, verb: 0.2 });
    this.thud(at(TL.panel.d + TL.panel.dur * TL.panel.land), 1);
    this.click(tt(TL.panel.d + TL.panel.dur * TL.panel.land), 1600, 0.25);
    // info bar shine
    this.tone({ f: 2600, t: tt(TL.info.d + 300), d: 0.6, peak: 0.02, verb: 0.6 });
    this.noise({ t: tt(TL.info.d + 200), d: 0.5, peak: 0.05, f: 5000, f2: 9000, type: "highpass", swell: true, a: 0.5, pan: -0.7, panTo: 0.7, verb: 0.3 });
    // cards dealt
    for (let i = 0; i < 6; i++) {
      const s = TL.card(i);
      const pan = [-0.6, 0, 0.6][i % 3];
      this.fwip(at(s.d), pan * 0.5, 0.13);
      this.cardLand(tt(s.d + s.dur * s.land), i, pan);
    }
    // pager dots ripple
    for (let i = 0; i < 8; i++) this.tone({ f: 1800 + i * 160, t: tt(TL.dots(i * 2).d + 200), d: 0.04, peak: 0.018, pan: -0.7 + i * 0.2, verb: 0.3 });
    // bottom bar + count-up
    this.whoosh(at(TL.bottom.d), 0.4, 300, 2200, 0.1);
    this.countUp(at(TL.fill.d), TL.fill.dur / 1000);
  }

  countUp(d: number, dur: number, n = 18) {
    if (!this.ok()) return;
    for (let i = 1; i <= n; i++) {
      const p = i / n;
      const tt = 1 - Math.cbrt(1 - p); // inverse easeOutCubic
      const t = this.T(d + tt * dur * 0.92);
      this.tone({ type: "triangle", f: 900 + p * 1100, t, d: 0.035, peak: 0.05, pan: -0.5 + p, verb: 0.08 });
    }
    const end = this.T(d + dur * 0.95);
    this.bell(1318.51, end, { d: 1.4, peak: 0.07, verb: 0.6 });
    this.bell(1975.53, end + 0.06, { d: 1.6, peak: 0.05, verb: 0.7, pan: 0.3 });
    this.sparkle(d + dur * 0.95, 5, 0.025);
  }

  shopExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    for (let i = 0; i < 6; i++) this.fwip(d + (5 - i) * 0.035, [-0.6, 0, 0.6][i % 3], 0.12);
    // hero gun launches up
    this.noise({ t: this.T(d + 0.09), d: 0.5, peak: 0.2, f: 500, f2: 5500, q: 1.2, swell: true, a: 0.6, verb: 0.2 });
    this.tone({ f: 400, f2: 2200, glide: 0.45, t: this.T(d + 0.15), d: 0.45, peak: 0.05, verb: 0.3 });
    // panel drops
    this.noise({ t: this.T(d + 0.14), d: 0.45, peak: 0.18, f: 2600, f2: 250, q: 0.8, swell: true, a: 0.4, verb: 0.15 });
    for (let i = 0; i < 7; i++) this.popDown(d + 0.04 + i * 0.025, i % 4);
    for (let i = 0; i < 4; i++) this.zipUp(d + i * 0.035, i);
  }

  tabSwitch(i: number) {
    if (!this.ok()) return;
    this.tap(0, 1000 + i * 60);
    const t = this.T();
    this.marimba(PENTA[i + 2], t + 0.02, 0.1, -0.6 + i * 0.2);
    for (let k = 0; k < 6; k++) this.fwip(k * 0.03, [-0.6, 0, 0.6][k % 3], 0.07);
  }

  deal(d: number, n: number, gap: number, land: number) {
    if (!this.ok()) return;
    for (let i = 0; i < n; i++) {
      const pan = [-0.6, 0, 0.6][i % 3];
      this.fwip(d + i * gap, pan * 0.5, 0.1);
      this.cardLand(this.T(d + i * gap + land), i, pan);
    }
  }

  pageFlip(dir: 1 | -1) {
    if (!this.ok()) return;
    this.tap(0, 900);
    this.whoosh(0, 0.3, 2400, 600, 0.14, 0, -dir * 0.9);
    this.whoosh(0.26, 0.35, 500, 3200, 0.14, dir * 0.9, 0);
    for (let i = 0; i < 3; i++) this.thud(0.4 + i * 0.05, 0.25, dir * (0.6 - i * 0.6));
  }

  selectWeapon(level: number, kind: string) {
    if (!this.ok()) return;
    this.tap(0, 1250);
    const t = this.T();
    // swap shimmer
    this.noise({ t, d: 0.25, peak: 0.12, f: 800, f2: 6000, q: 1.4, swell: true, a: 0.7, verb: 0.3 });
    this.impact(0.2, 0.35 + level * 0.12);
    if (kind === "crossbow") {
      this.click(t + 0.32, 1200, 0.4);
      this.tone({ f: 180, f2: 140, glide: 0.2, t: t + 0.36, d: 0.3, peak: 0.12, verb: 0.2 });
    } else if (["plasma", "laser", "blaster"].includes(kind)) {
      this.tone({ type: "sawtooth", f: 120, f2: 1400, glide: 0.35, t: t + 0.25, d: 0.4, peak: 0.04, verb: 0.4 });
      this.bell(2093, t + 0.6, { d: 1, peak: 0.04, verb: 0.6 });
    } else if (kind === "flamer") {
      this.noise({ t: t + 0.28, d: 0.6, peak: 0.2, f: 300, f2: 1500, type: "lowpass", swell: true, a: 0.2, verb: 0.2 });
    } else this.reload(0.28);
    const chords = [
      [783.99, 1174.66],
      [880, 1318.51, 1760],
      [1046.5, 1318.51, 1567.98, 2093],
      [1046.5, 1318.51, 1567.98, 2093, 2637.02],
      [659.25, 987.77, 1318.51, 1975.53, 2637.02],
    ][Math.min(4, level)];
    chords.forEach((f, i) => this.bell(f, t + 0.22 + i * 0.045, { d: 1.4, peak: 0.06, pan: -0.4 + i * 0.2, verb: 0.55 }));
    if (level >= 2) this.sparkle(0.3, 4 + level * 2, 0.03);
  }

  lockedBuzz() {
    if (!this.ok()) return;
    const t = this.T();
    [0, 0.12].forEach((x) => {
      this.tone({ type: "square", f: 155, f2: 140, glide: 0.08, t: t + x, d: 0.09, peak: 0.07, verb: 0.05 });
      this.tone({ type: "square", f: 233, t: t + x, d: 0.09, peak: 0.035, verb: 0.05 });
    });
    this.ratchet(t + 0.02, 5, 0.25, 3200, 0.1);
    this.click(t + 0.3, 1300, 0.25);
  }

  denied() {
    if (!this.ok()) return;
    const t = this.T();
    this.tone({ type: "triangle", f: 660, f2: 440, glide: 0.12, t, d: 0.16, peak: 0.12, verb: 0.15 });
    this.tone({ type: "triangle", f: 440, f2: 260, glide: 0.18, t: t + 0.14, d: 0.24, peak: 0.12, verb: 0.2 });
    this.tone({ type: "square", f: 110, t, d: 0.25, peak: 0.03, verb: 0.05 });
  }

  design(idx: number) {
    if (!this.ok()) return;
    const t = this.T();
    this.tap(0, 1300);
    this.noise({ t, d: 0.3, peak: 0.08, f: 2000, f2: 8000, q: 2, swell: true, a: 0.6, verb: 0.4 });
    [0, 2, 4].forEach((s, i) => this.bell(PENTA[(idx + s) % PENTA.length] * 2, t + 0.06 + i * 0.05, { d: 0.9, peak: 0.04, verb: 0.65, pan: -0.3 + i * 0.3 }));
  }

  /* ------------------------------------------------------------------ */
  /* ACHIEVEMENT — royal ceremony                                        */
  /* ------------------------------------------------------------------ */
  private brass(t: number, freqs: number[], dur: number, peak = 0.05, pan = 0) {
    const ctx = this.ctx!;
    freqs.forEach((f, i) => {
      [-7, 7].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f * 0.985, t);
        o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
        o.detune.value = det;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.Q.value = 1.5;
        lp.frequency.setValueAtTime(f * 1.1, t);
        lp.frequency.exponentialRampToValueAtTime(f * 5.5, t + 0.07);
        lp.frequency.exponentialRampToValueAtTime(f * 2.2, t + dur);
        const g = ctx.createGain();
        const pk = peak / (1 + i * 0.25);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(pk, t + 0.035);
        g.gain.setValueAtTime(pk * 0.8, t + dur * 0.55);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(lp);
        lp.connect(g);
        g.connect(this.bus({ pan: pan + (i - (freqs.length - 1) / 2) * 0.25, verb: 0.45, t }));
        o.start(t);
        o.stop(t + dur + 0.05);
      });
    });
  }

  private timpani(t: number, f = 98, peak = 0.35) {
    this.tone({ f: f * 1.15, f2: f, glide: 0.06, t, a: 0.003, d: 0.7, peak, verb: 0.25 });
    this.noise({ t, d: 0.12, peak: peak * 0.4, f: 400, type: "lowpass", verb: 0.2 });
  }

  fanfare(d = 0, big = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    const G4 = 392, C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5;
    this.brass(t, [G4, C5], 0.11, 0.045 * big);
    this.timpani(t, 98, 0.22 * big);
    this.brass(t + 0.13, [G4, C5], 0.11, 0.045 * big);
    this.timpani(t + 0.13, 98, 0.22 * big);
    this.brass(t + 0.26, [C5, E5, G5, C6], 1.0, 0.05 * big);
    this.timpani(t + 0.26, 65.4, 0.4 * big);
  }

  drumRoll(d: number, dur: number, peak = 0.12) {
    if (!this.ok()) return;
    let x = 0;
    while (x < dur) {
      const p = x / dur;
      const t = this.T(d + x);
      this.noise({ t, d: 0.05, peak: peak * (0.25 + 0.75 * p), f: 260 + p * 200, q: 1.1, verb: 0.15 });
      this.tone({ f: 140, f2: 90, glide: 0.04, t, d: 0.05, peak: peak * 0.5 * (0.3 + p), verb: 0.05 });
      x += 0.055 - p * 0.025;
    }
  }

  fabric(d: number, pan = 0, up = false, peak = 0.15) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.3, peak, f: up ? 1600 : 500, f2: up ? 500 : 1700, q: 0.9, swell: true, a: 0.6, pan, verb: 0.12 });
    // flutter
    for (let i = 0; i < 3; i++) this.noise({ t: t + 0.08 + i * 0.05, d: 0.04, peak: peak * 0.35, f: 900, q: 2, pan, verb: 0.05 });
  }

  confetti(d: number, n = 16) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.08, peak: 0.3, f: 2000, type: "highpass", verb: 0.3 }); // party popper
    this.tone({ f: 400, f2: 120, glide: 0.06, t, d: 0.08, peak: 0.25, verb: 0.1 });
    for (let i = 0; i < n; i++) {
      const tt = t + 0.05 + Math.random() * 0.7;
      this.noise({ t: tt, d: 0.018, peak: 0.04 + Math.random() * 0.03, f: 5000 + Math.random() * 3000, type: "highpass", pan: Math.random() * 1.8 - 0.9, verb: 0.15 });
    }
    this.sparkle(d + 0.1, 8, 0.03);
  }

  ribbonClose(d = 0, k = 1) {
    if (!this.ok()) return;
    this.drumRoll(d, 0.78, 0.13);
    for (let i = 0; i < 6; i++) {
      const pan = -0.8 + i * 0.32 * k;
      this.fabric(d + i * 0.034 * k, pan);
      this.thud(d + i * 0.034 * k + 0.29 * k, 0.35, pan);
    }
    // ta-ta-TAAA lands on the medal stamp (830ms)
    this.fanfare(d + 0.57 * k, 1);
    this.impact(d + 0.83 * k, 0.9);
    this.metalRing(this.T(d + 0.83 * k), 420, 0.04, 1.2);
    this.confetti(d + 0.84 * k, 20);
    this.bell(2093, this.T(d + 0.86 * k), { d: 1.6, peak: 0.05, verb: 0.7 });
  }

  ribbonOpen(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.whoosh(d, 0.35, 600, 2800, 0.1);
    [2.5, 1.5, 0.5].forEach((fc, j) => {
      this.fabric(d + 0.08 * k + j * 0.06, -0.6 + k * 0.1, true, 0.12);
      this.fabric(d + 0.08 * k + j * 0.06, 0.6 - k * 0.1, true, 0.12);
      void fc;
    });
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone({ type: "triangle", f, t: t + 0.1 * k + i * 0.04 * k, a: 0.12, d: 1.2, peak: 0.025, pan: -0.4 + i * 0.27 * k, verb: 0.8 }),
    );
    this.sparkle(d + 0.2 * k, 7, 0.03);
  }

  achEnter(d = 0, TL?: typeof import("../ach/data").ACH_IN, readyCount = 0) {
    if (!this.ok() || !TL) return;
    const at = (ms: number) => d + ms / 1000;
    const tt = (ms: number) => this.T(at(ms));
    this.whoosh(d, 0.8, 140, 1000, 0.07);
    for (let i = 0; i < 3; i++) {
      const s = TL.top(i);
      this.tone({ f: 1300 + i * 150, f2: 650, glide: 0.04, t: tt(s.d + s.dur * 0.6), d: 0.05, peak: 0.08, pan: -0.7 + i * 0.7, verb: 0.08 });
    }
    this.coin(at(TL.top(1).d + 360));
    // banner unfurls
    this.fabric(at(TL.banner.d), -0.3, false, 0.18);
    this.fabric(at(TL.banner.d + 40), 0.3, false, 0.18);
    this.thud(at(TL.banner.d + TL.banner.dur * TL.banner.land), 0.6);
    this.brass(tt(TL.banner.d + TL.banner.dur * TL.banner.land), [523.25, 659.25, 783.99], 0.5, 0.025);
    // trophy pop
    const tl = TL.trophy.d + TL.trophy.dur * TL.trophy.land;
    this.bubble(at(TL.trophy.d), 2);
    this.bell(1567.98, tt(tl), { d: 1.3, peak: 0.07, verb: 0.6 });
    this.bell(2349.32, tt(tl + 50), { d: 1.3, peak: 0.05, verb: 0.6, pan: 0.3 });
    this.sparkle(at(tl), 5, 0.025);
    // timer tick-tock
    this.click(tt(TL.timer.d + 200), 2600, 0.14, 0.2);
    this.click(tt(TL.timer.d + 420), 2000, 0.12, 0.2);
    // panel board
    this.noise({ t: tt(TL.panel.d), d: (TL.panel.dur * TL.panel.land) / 1000, peak: 0.2, f: 200, f2: 2400, q: 0.8, swell: true, a: 0.85, verb: 0.2 });
    this.impact(at(TL.panel.d + TL.panel.dur * TL.panel.land), 0.45);
    // track draws
    this.tone({ type: "triangle", f: 400, f2: 1200, glide: TL.track.dur / 1000, t: tt(TL.track.d), a: 0.02, d: TL.track.dur / 1000, peak: 0.035, pan: -0.5, verb: 0.3 });
    for (let i = 0; i < 4; i++) this.marimba(PENTA[2 + i * 2], tt(TL.node(i).d + 250), 0.06, -0.7 + i * 0.47, 0.25);
    // chests drop
    for (let i = 0; i < 3; i++) {
      const s = TL.chest(i);
      const pan = [-0.5, 0, 0.7][i];
      const land = s.d + s.dur * s.land;
      this.tone({ f: 1800, f2: 500, glide: (land - s.d) / 1000, t: tt(s.d), a: 0.03, d: (land - s.d) / 1000, peak: 0.035, pan, verb: 0.2 });
      this.thud(at(land), 0.7 + i * 0.15, pan);
      this.click(tt(land), 1400 - i * 200, 0.3, pan); // wooden clack
      this.marimba([783.99, 987.77, 1318.51][i], tt(land + 10), 0.08, pan, 0.3);
      this.thud(at(s.d + s.dur * 0.83), 0.3, pan);
    }
    // tabs
    this.whoosh(at(TL.tabs.d), 0.35, 400, 2600, 0.12, -0.9, -0.3);
    this.whoosh(at(TL.tabs.d + 40), 0.35, 400, 2600, 0.12, 0.9, 0.3);
    // rows
    for (let i = 0; i < 6; i++) {
      const s = TL.row(i);
      this.fwip(at(s.d), 0.6, 0.11);
      this.marimba(PENTA[(4 + i) % PENTA.length], tt(s.d + s.dur * s.land), 0.06, 0.3 - i * 0.1, 0.25);
    }
    for (let i = 0; i < 4; i++) {
      const s = TL.day(i);
      this.tone({ f: 300 + i * 60, f2: 760 + i * 90, glide: 0.07, t: tt(s.d + 60), d: 0.09, peak: 0.08, pan: -0.6 + i * 0.4, verb: 0.08 });
      this.thud(at(s.d + s.dur * 0.6), 0.3, -0.6 + i * 0.4);
    }
    if (readyCount > 0) {
      this.sparkle(at(TL.claimAll.d), 6, 0.03);
      this.bell(1318.51, tt(TL.claimAll.d + 200), { d: 1, peak: 0.05, verb: 0.6 });
    }
  }

  /** podium transition: blocks rise (ascending notes), medal stamp + fanfare */
  podiumClose(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    const order = [0, 0.06, 0.1, 0.15, 0.19]; // 1st, 2nd, 3rd, 4th, 5th
    const notes = [1046.5, 880, 783.99, 659.25, 587.33];
    order.forEach((x, i) => {
      const pan = [0, -0.4, 0.4, -0.8, 0.8][i];
      this.noise({ t: t + x * k, d: 0.36 * k, peak: 0.12, f: 300, f2: 1800, q: 1, swell: true, a: 0.85, pan, verb: 0.12 });
      this.thud(d + (x + 0.36) * k, 0.55, pan);
      this.marimba(notes[i], t + (x + 0.36) * k, 0.08, pan, 0.25);
    });
    this.drumRoll(d + 0.1 * k, 0.5 * k, 0.1);
    this.fanfare(d + 0.4 * k, 0.9);
    this.impact(d + 0.66 * k, 0.8);
    this.metalRing(t + 0.66 * k, 520, 0.04, 1.1);
    this.confetti(d + 0.68 * k, 18);
  }

  podiumOpen(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: 900, f2: 300, glide: 0.2, t, d: 0.2, peak: 0.06, verb: 0.2 });
    [0, 0.07, 0.15].forEach((x, i) => this.noise({ t: t + x * k, d: 0.45 * k, peak: 0.14, f: 2400, f2: 260, q: 0.9, swell: true, a: 0.4, pan: [0.8, 0.4, 0][i], verb: 0.15 }));
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone({ type: "triangle", f, t: t + (0.12 + i * 0.03) * k, a: 0.1, d: 1, peak: 0.03, pan: -0.4 + i * 0.27, verb: 0.8 }));
    this.sparkle(d + 0.2 * k, 6, 0.03);
  }

  /** leaderboard: crown drops, fanfare, confetti */
  lbEnter(d: number, TL: typeof import("../rank/data").LB_IN) {
    if (!this.ok()) return;
    const at = (ms: number) => d + ms / 1000;
    this.whoosh(d, 0.7, 140, 1000, 0.07);
    for (let i = 0; i < 3; i++) this.tone({ f: 1300 + i * 150, f2: 650, glide: 0.04, t: this.T(at(TL.top(i).d + TL.top(i).dur * 0.6)), d: 0.05, peak: 0.08, pan: -0.7 + i * 0.7, verb: 0.08 });
    this.drumRoll(at(TL.title.d), (TL.crown.d - TL.title.d) / 1000 + 0.2, 0.1);
    this.bubble(at(TL.avatar.d + 120), 2);
    const land = TL.crown.d + TL.crown.dur * TL.crown.land;
    this.tone({ f: 1800, f2: 500, glide: (land - TL.crown.d) / 1000, t: this.T(at(TL.crown.d)), a: 0.03, d: (land - TL.crown.d) / 1000, peak: 0.04, verb: 0.2 });
    this.impact(at(land), 0.6);
    this.fanfare(at(land - 260), 0.9);
    this.confetti(at(land), 22);
    this.metalRing(this.T(at(TL.badge.d + 200)), 520, 0.04, 1);
    this.coin(at(TL.score.d + 200));
    for (let i = 0; i < 2; i++) this.bubble(at(TL.btn(i).d + 160), 3 - i);
  }

  lbExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    this.whoosh(d + 0.03, 0.4, 2400, 400, 0.12);
    this.fabric(d + 0.08, 0, true, 0.12);
  }

  achExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    for (let i = 0; i < 6; i++) this.fwip(d + i * 0.03, -0.5, 0.1);
    for (let i = 0; i < 3; i++) this.boing(this.T(d + 0.06 + i * 0.04), 200, 700, 0.3, 0.07, -0.5 + i * 0.5);
    this.noise({ t: this.T(d + 0.16), d: 0.42, peak: 0.18, f: 2400, f2: 250, q: 0.8, swell: true, a: 0.4, verb: 0.15 });
    this.fabric(d + 0.08, 0, true, 0.14);
  }

  claim(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tap(d, 1300);
    this.noise({ t, d: 0.18, peak: 0.12, f: 1500, f2: 7000, q: 1.2, swell: true, a: 0.3, verb: 0.3 });
    [1046.5, 1318.51, 1567.98, 2093].forEach((f, i) => this.bell(f, t + 0.03 + i * 0.055, { d: 1.1, peak: 0.065, pan: -0.3 + i * 0.2, verb: 0.5 }));
    this.tone({ type: "triangle", f: 523.25, t: t + 0.02, a: 0.01, d: 0.5, peak: 0.06, verb: 0.3 });
  }

  /** each coin arriving at the wallet */
  coinRain(arrivals: number[], gem = false) {
    if (!this.ok()) return;
    arrivals.forEach((ms, i) => {
      const t = this.T(ms / 1000);
      const f = gem ? 2637.02 + i * 200 : 1975.53 + (i % 5) * 160;
      this.bell(f, t, { ratio: 2, index: 0.7, d: 0.35, peak: 0.035, pan: 0.6, verb: 0.25 });
    });
  }

  milestoneReady(d = 0) {
    if (!this.ok()) return;
    this.fanfare(d, 0.8);
    this.goldChord(d + 0.3, 0.04);
    this.sparkle(d + 0.35, 10, 0.03);
  }

  chestDrop(d = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.tone({ f: 1600, f2: 400, glide: 0.4, t, a: 0.03, d: 0.4, peak: 0.05, verb: 0.2 });
    this.impact(d + 0.38, 0.6);
    this.click(this.T(d + 0.38), 1200, 0.4);
    this.drumRoll(d + 0.5, 1.15, 0.1);
  }

  chestRattle(d = 0, dur = 0.95) {
    if (!this.ok()) return;
    for (let i = 0; i < 12; i++) {
      const p = i / 12;
      const t = this.T(d + p * dur);
      const pan = i % 2 ? 0.35 : -0.35;
      this.click(t, 900 + Math.random() * 500, 0.2 + p * 0.25, pan);
      this.tone({ f: 220 + p * 80, f2: 120, glide: 0.04, t, d: 0.05, peak: 0.08 + p * 0.1, pan, verb: 0.05 });
    }
    this.riser(d + 0.1, dur - 0.05, 0.14);
  }

  chestOpen(d = 0, level = 0) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.impact(d, 0.9);
    this.noise({ t, d: 0.9, peak: 0.25, f: 6000, f2: 400, type: "lowpass", verb: 0.5 });
    // angelic choir pad
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((f, i) =>
      this.tone({ type: "sine", f, t: t + 0.02, a: 0.15, d: 1.8, peak: 0.03, pan: -0.5 + i * 0.25, verb: 0.9 }),
    );
    this.fanfare(d + 0.05, 0.7 + level * 0.15);
    this.confetti(d + 0.05, 18 + level * 4);
    this.sparkle(d + 0.4, 6 + level * 3, 0.035);
  }

  /* ------------------------------------------------------------------ */
  /* QUEST — sky & water                                                 */
  /* ------------------------------------------------------------------ */
  splash(d: number, pan = 0, size = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.35 * (0.5 + size * 0.5), peak: 0.22 * size, f: 3200, f2: 380, type: "lowpass", q: 0.7, pan, verb: 0.3 });
    this.noise({ t, d: 0.12, peak: 0.1 * size, f: 1300, q: 2.2, pan, verb: 0.1 });
    const n = 2 + Math.round(size * 4);
    for (let i = 0; i < n; i++) {
      const tt = t + 0.03 + Math.random() * 0.25;
      const f = 500 + Math.random() * 700;
      this.tone({ f, f2: f * 1.9, glide: 0.05, t: tt, d: 0.05, peak: 0.035 * size + 0.01, pan: pan + (Math.random() - 0.5) * 0.5, verb: 0.2 });
    }
  }

  private chirp(t: number, pan: number) {
    [0, 0.09].forEach((x) => {
      this.tone({ f: 2400, f2: 3400, glide: 0.04, t: t + x, d: 0.06, peak: 0.018, pan, verb: 0.5 });
      this.tone({ f: 3300, f2: 2500, glide: 0.04, t: t + x + 0.045, d: 0.05, peak: 0.015, pan, verb: 0.5 });
    });
  }

  cloudClose(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.62, peak: 0.22, f: 250, f2: 1300, type: "lowpass", q: 0.6, swell: true, a: 0.85, pan: -0.9, panTo: -0.1, verb: 0.3 });
    this.noise({ t: t + 0.04 * k, d: 0.62, peak: 0.22, f: 250, f2: 1300, type: "lowpass", q: 0.6, swell: true, a: 0.85, pan: 0.9, panTo: 0.1, verb: 0.3 });
    // soft cloud "poof" when banks meet
    this.noise({ t: t + 0.5 * k, d: 0.45, peak: 0.22, f: 900, f2: 160, type: "lowpass", verb: 0.4 });
    this.tone({ f: 110, f2: 55, glide: 0.35, t: t + 0.5 * k, d: 0.5, peak: 0.25, verb: 0.2 });
    this.duck(t + 0.5 * k, 0.45, 1.0);
    // compass spins in (ratchet) and needle settles
    this.ratchet(t + 0.36 * k, 10, 0.5, 3200, 0.1);
    this.boing(t + 0.45 * k, 600, 1300, 0.5, 0.04, 0);
    // map pin drops and lands (≈930ms)
    this.tone({ f: 2000, f2: 900, glide: 0.3, t: t + 0.62 * k, a: 0.02, d: 0.3, peak: 0.035, verb: 0.2 });
    this.thud(d + 0.93 * k, 0.45);
    this.tone({ f: 1800, f2: 2700, glide: 0.04, t: t + 0.93 * k, d: 0.12, peak: 0.08, verb: 0.3 });
    this.bell(1318.51, t + 0.95 * k, { d: 1.4, peak: 0.06, verb: 0.6 });
    this.bell(1975.53, t + 1.0 * k, { d: 1.4, peak: 0.04, verb: 0.6, pan: 0.3 });
  }

  cloudOpen(d = 0, k = 1) {
    if (!this.ok()) return;
    const t = this.T(d);
    this.noise({ t, d: 0.85, peak: 0.24, f: 220, f2: 4500, q: 0.6, swell: true, a: 0.45, pan: -0.3, panTo: -0.9, verb: 0.35 });
    this.noise({ t: t + 0.03 * k, d: 0.85, peak: 0.2, f: 240, f2: 4800, q: 0.6, swell: true, a: 0.45, pan: 0.3, panTo: 0.9, verb: 0.35 });
    // harp glissando
    for (let i = 0; i < PENTA.length; i++) {
      this.bell(PENTA[i], t + 0.12 * k + i * 0.032 * k, { d: 1.4, peak: 0.032, pan: -0.8 + (i / PENTA.length) * 1.6, verb: 0.7, ratio: 2.01, index: 1.1 });
    }
    // seagulls + water lapping
    this.chirp(t + 0.55 * k, -0.6);
    this.chirp(t + 0.85 * k, 0.5);
    this.noise({ t: t + 0.3 * k, d: 1.2, peak: 0.07, f: 700, f2: 500, type: "lowpass", swell: true, a: 0.4, verb: 0.4 });
  }

  questEnter(d = 0, TL?: typeof import("../quest/data").QUEST_IN) {
    if (!this.ok() || !TL) return;
    const at = (ms: number) => d + ms / 1000;
    const tt = (ms: number) => this.T(at(ms));
    this.noise({ t: tt(0), d: 1.4, peak: 0.08, f: 600, f2: 400, type: "lowpass", swell: true, a: 0.3, verb: 0.4 }); // water bed
    this.whoosh(at(TL.header.d), 0.4, 400, 2200, 0.08);
    for (let i = 0; i < 3; i++) this.bubble(at(TL.chip(i).d + 120), i);
    for (let k = 0; k < 9; k++) {
      const s = TL.pillar(k);
      const pan = Math.sin(k * 0.82) * 0.6;
      // rising bloop from water then splash
      this.tone({ f: 170 + k * 18, f2: 520 + k * 40, glide: 0.14, t: tt(s.d + 40), d: 0.16, peak: 0.11, pan, verb: 0.15 });
      this.splash(at(s.d + s.dur * 0.08), pan, 0.45);
      this.marimba(PENTA[k % PENTA.length], tt(s.d + s.dur * s.land), 0.07, pan, 0.25);
    }
    for (let k = 0; k < 8; k++) this.tone({ f: 2200 + k * 120, t: tt(TL.dot(k).d + 120), d: 0.03, peak: 0.015, pan: Math.sin(k) * 0.5, verb: 0.3 });
    // avatar drop
    const a = TL.avatar;
    const land = a.d + a.dur * a.land;
    this.tone({ f: 2400, f2: 420, glide: (land - a.d) / 1000, t: tt(a.d), a: 0.04, d: (land - a.d) / 1000, peak: 0.05, verb: 0.3 });
    this.noise({ t: tt(a.d), d: (land - a.d) / 1000, peak: 0.12, f: 400, f2: 3000, q: 1, swell: true, a: 0.9, verb: 0.15 });
    this.impact(at(land), 0.55);
    this.splash(at(land), 0, 1.1);
    this.boing(tt(land + 120), 220, 520, 0.45, 0.1, 0);
    this.reload(at(land + 220));
    this.goldChord(at(land + 60), 0.035);
    this.whoosh(at(TL.bottom.d), 0.4, 300, 2200, 0.1);
  }

  questExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    this.boing(this.T(d + 0.05), 250, 1100, 0.35, 0.09, 0);
    this.whoosh(d + 0.05, 0.4, 600, 4000, 0.12);
    for (let k = 0; k < 7; k++) {
      const pan = Math.sin(k * 0.82) * 0.6;
      this.tone({ f: 520 - k * 20, f2: 150, glide: 0.18, t: this.T(d + 0.05 + k * 0.03), d: 0.2, peak: 0.07, pan, verb: 0.15 });
      if (k % 2 === 0) this.splash(d + 0.2 + k * 0.03, pan, 0.35);
    }
  }

  pillarTap(n: number, pan = 0) {
    if (!this.ok()) return;
    this.tap(0, 1200);
    this.marimba(PENTA[n % PENTA.length], this.T(0.01), 0.1, pan, 0.3);
    this.splash(0.02, pan, 0.3);
  }

  mapGlide() {
    if (!this.ok()) return;
    this.whoosh(0, 0.6, 300, 1800, 0.12, 0, 0, 0.8);
    this.noise({ t: this.T(0.1), d: 0.6, peak: 0.05, f: 700, type: "lowpass", swell: true, a: 0.5, verb: 0.4 });
  }

  /** target/boss: falls from the top (lands at 42%), then pop-blasts (peak 80%) */
  dropPop(d: number, dur: number, size = 0.8) {
    if (!this.ok()) return;
    const t = this.T(d);
    const land = dur * 0.42;
    this.tone({ f: 2200, f2: 420, glide: land, t, a: 0.03, d: land, peak: 0.045, verb: 0.25 });
    this.noise({ t, d: land, peak: 0.13, f: 3000, f2: 500, q: 1.2, swell: true, a: 0.9, verb: 0.15 });
    this.impact(d + land, 0.55 * size + 0.1);
    this.thud(d + dur * 0.52, 0.3);
    this.styleIn("pop", d + dur * 0.6, dur * 0.526, 0, size);
  }

  /** the wheel behind the gun: drops from the top, lands, then pop-blasts */
  wheelDropPop(d: number, dur: number) {
    if (!this.ok()) return;
    const t = this.T(d);
    const land = dur * 0.42;
    this.tone({ f: 2400, f2: 600, glide: land, t, a: 0.04, d: land, peak: 0.04, verb: 0.3 });
    this.noise({ t, d: land, peak: 0.12, f: 3000, f2: 600, q: 1.2, swell: true, a: 0.9, verb: 0.15 });
    this.thud(d + land, 0.7);
    this.metalRing(t + land, 520, 0.03, 0.8);
    this.styleIn("pop", d + dur * 0.6, dur * 0.5, 0, 0.7);
  }

  /** short audition for the studio panel */
  preview(style: string, size = 0.8) {
    if (!this.ok()) return;
    if (style === "classic") {
      this.whoosh(0, 0.4, 300, 2600, 0.14);
      this.marimba(1046.5, this.T(0.3), 0.1);
      return;
    }
    this.styleIn(style, 0, style === "combo" ? 3 : 0.7, 0, size);
  }

  subEnter(d = 0) {
    if (!this.ok()) return;
    this.whoosh(d + 0.15, 0.4, 400, 2400, 0.1, -0.9, -0.5);
    this.impact(d + 0.73, 0.45);
    this.goldChord(d + 0.75, 0.035);
    this.bubble(d + 0.9, 2);
    this.sparkle(d + 0.95, 5, 0.025);
    for (let i = 0; i < 3; i++) this.whoosh(d + 0.8 + i * 0.1, 0.35, 400, 2600, 0.08, i % 2 ? 0.8 : -0.8, 0);
    this.bubble(d + 1.57, 3);
  }

  subExit(d = 0) {
    if (!this.ok()) return;
    this.back(d);
    this.whoosh(d + 0.02, 0.4, 600, 3000, 0.12, -0.2, -0.9);
    this.poof(d + 0.08);
    for (let i = 0; i < 3; i++) this.popDown(d + i * 0.05, i);
  }

  /* ------------------------------------------------------------------ */
  /* ambient music (soft forest pad + twinkles)                         */
  /* ------------------------------------------------------------------ */
  startMusic() {
    const ctx = this.ctx;
    if (!ctx || !this.state.music || this.musicTimer) return;
    const t = ctx.currentTime;
    this.musDry.gain.cancelScheduledValues(t);
    this.musWet.gain.cancelScheduledValues(t);
    this.musDry.gain.setValueAtTime(this.musDry.gain.value, t);
    this.musWet.gain.setValueAtTime(this.musWet.gain.value, t);
    this.musDry.gain.linearRampToValueAtTime(MUSIC_LEVEL, t + 3);
    this.musWet.gain.linearRampToValueAtTime(MUSIC_LEVEL * 0.9, t + 3);
    this.nextChord = Math.max(this.nextChord, t + 0.1);
    this.musicTimer = window.setInterval(() => this.tickMusic(), 400);
    this.tickMusic();
  }

  private tickMusic() {
    const ctx = this.ctx!;
    while (this.nextChord < ctx.currentTime + 1.5) {
      this.playChord(this.nextChord, CHORDS[this.chordIdx % CHORDS.length]);
      this.chordIdx++;
      this.nextChord += CHORD_LEN;
    }
  }

  private playChord(t: number, notes: number[]) {
    const ctx = this.ctx!;
    const end = t + CHORD_LEN + 3;
    const filt = ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.Q.value = 0.6;
    filt.frequency.setValueAtTime(450, t);
    filt.frequency.linearRampToValueAtTime(1150, t + CHORD_LEN * 0.55);
    filt.frequency.linearRampToValueAtTime(500, end);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + 2.6);
    g.gain.setValueAtTime(1, t + CHORD_LEN);
    g.gain.linearRampToValueAtTime(0.0001, end);
    filt.connect(g);
    g.connect(this.bus({ verb: 0.55, t, music: true }));

    notes.forEach((n, idx) => {
      if (idx === 0) {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = mtof(n);
        const bg = ctx.createGain();
        bg.gain.value = 0.07;
        o.connect(bg);
        bg.connect(g);
        o.start(t);
        o.stop(end + 0.1);
        return;
      }
      [-7, 7].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = mtof(n);
        o.detune.value = det + (Math.random() - 0.5) * 3;
        const og = ctx.createGain();
        og.gain.value = 0.016;
        o.connect(og);
        og.connect(filt);
        o.start(t);
        o.stop(end + 0.1);
      });
    });

    // twinkling bells like fireflies
    const count = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const f = PENTA[5 + Math.floor(Math.random() * 6)];
      this.bell(f, t + 0.8 + Math.random() * (CHORD_LEN - 1.2), {
        d: 2.4,
        peak: 0.022 + Math.random() * 0.012,
        pan: Math.random() * 1.6 - 0.8,
        verb: 0.9,
        ratio: 3.5,
        index: 1.1,
        music: true,
      });
    }
  }
}

export const sfx = new Sfx();
