import type { WeaponId } from './weapons';

// Pentatonic C5 scale across 3 octaves — every consecutive hit climbs a musical melody (Slide #2 & Slide #3)
const PENTA = [0, 2, 4, 7, 9];

export function noteFreq(i: number): number {
  const idx = Math.max(0, Math.floor(i));
  const oct = Math.min(Math.floor(idx / 5), 2);
  const semi = PENTA[idx % 5] + oct * 12;
  return 523.25 * Math.pow(2, semi / 12);
}

/**
 * Weapons in SGA that use or have used the Slide #2 (`games/firework`)
 * and Slide #3 (`games/fireworkgun`) weapon systems.
 */
export const SLIDE23_WEAPONS = [
  // Slide #2 (`games/firework`)
  'keris',
  'blackhole',
  'yoyo',
  'diamond',
  'crystal',
  // Slide #3 (`games/fireworkgun`)
  'firework',
  'shark',
  'bamboo',
  'soaker',
  'rainbow',
  'bazooka',
  'rpg',
] as const satisfies readonly WeaponId[];

export type Slide23WeaponId = (typeof SLIDE23_WEAPONS)[number];

const SLIDE23_SET = new Set<string>(SLIDE23_WEAPONS);

export function isSlide23Weapon(id: WeaponId | string): id is Slide23WeaponId {
  return SLIDE23_SET.has(id);
}

class Slide23Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private reverb: ConvolverNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  /**
   * Extra gain for the recipe that is playing right now (see `shoot(id, gain)`).
   *
   * A few slide-2/3 weapons are authored as soft accents — inside their own
   * slide they ride on top of fireworks and a stage track, so 0.11–0.2 peaks
   * are enough. On slide 1 the same recipe is the *only* thing the player
   * hears when the gun fires, and it came out whisper-quiet next to the other
   * 98 guns. Slide 1 therefore asks for the recipe at a louder gain instead of
   * rewriting the sound.
   */
  private shotGain = 1;
  private volume = 1;
  muted = false;

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.88 * this.volume;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.88 * this.volume;
  }

  private ensure(): AudioContext | null {
    if (this.muted || this.volume <= 0) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      this.ctx = ctx;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.006;
      comp.release.value = 0.14;
      comp.connect(ctx.destination);

      const master = ctx.createGain();
      master.gain.value = 0.88 * this.volume;
      master.connect(comp);
      this.master = master;

      // Warm 1.1s stereo reverb impulse with WebAudio equal-power normalization enabled
      const rLen = Math.max(1, Math.floor(ctx.sampleRate * 1.1));
      const rBuf = ctx.createBuffer(2, rLen, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = rBuf.getChannelData(ch);
        let smooth = 0;
        for (let i = 0; i < rLen; i++) {
          const raw = Math.random() * 2 - 1;
          smooth = smooth * 0.42 + raw * 0.58;
          d[i] = smooth * Math.pow(1 - i / rLen, 2.7);
        }
      }
      const rev = ctx.createConvolver();
      rev.normalize = true;
      rev.buffer = rBuf;
      const revGain = ctx.createGain();
      revGain.gain.value = 0.26;
      rev.connect(revGain);
      revGain.connect(master);
      this.reverb = rev;

      // Reusable 1.5s white noise buffer (Slide #2)
      const nLen = Math.floor(ctx.sampleRate * 1.5);
      const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
      const nd = nBuf.getChannelData(0);
      for (let i = 0; i < nLen; i++) nd[i] = Math.random() * 2 - 1;
      this.noiseBuf = nBuf;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlock() {
    try {
      this.ensure();
    } catch {
      /* ignore */
    }
  }

  private send(node: AudioNode, reverbAmt = 0.25) {
    if (!this.ctx || !this.master) return;
    node.connect(this.master);
    if (this.reverb && reverbAmt > 0) {
      const s = this.ctx.createGain();
      s.gain.value = reverbAmt;
      node.connect(s);
      s.connect(this.reverb);
    }
  }

  private tone(
    f0: number,
    f1: number,
    dur: number,
    opts: {
      type?: OscillatorType;
      gain?: number;
      delay?: number;
      reverb?: number;
      lp?: number;
      attack?: number;
    } = {},
  ) {
    try {
      const ctx = this.ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + (opts.delay || 0);
      const osc = ctx.createOscillator();
      osc.type = opts.type || 'sine';
      osc.frequency.setValueAtTime(Math.max(20, f0), t0);
      if (f1 !== f0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
      }
      const g = ctx.createGain();
      const peak = (opts.gain ?? 0.16) * this.shotGain;
      const atk = opts.attack ?? 0.007;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      if (opts.lp) {
        const flt = ctx.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(opts.lp, t0);
        osc.connect(flt);
        flt.connect(g);
      } else {
        osc.connect(g);
      }
      this.send(g, opts.reverb ?? 0.22);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  private bell(freq: number, dur = 0.5, gain = 0.15, delay = 0) {
    try {
      const ctx = this.ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + delay;
      const o1 = ctx.createOscillator();
      const o2 = ctx.createOscillator();
      o1.type = 'sine';
      o2.type = 'triangle';
      o1.frequency.setValueAtTime(freq, t0);
      o2.frequency.setValueAtTime(freq * 2, t0);
      const g1 = ctx.createGain();
      const g2 = ctx.createGain();
      const peak = gain * this.shotGain;
      g1.gain.setValueAtTime(0.0001, t0);
      g1.gain.linearRampToValueAtTime(peak, t0 + 0.006);
      g1.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      g2.gain.setValueAtTime(0.0001, t0);
      g2.gain.linearRampToValueAtTime(peak * 0.32, t0 + 0.006);
      g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.6);
      o1.connect(g1);
      o2.connect(g2);
      this.send(g1, 0.5);
      this.send(g2, 0.5);
      o1.start(t0);
      o2.start(t0);
      o1.stop(t0 + dur + 0.02);
      o2.stop(t0 + dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  // Gamelan / bronze resonance for Keris & Diamond (Slide #2 `games/firework/src/game/sfx.ts` `metal`)
  private metal(freq: number, dur = 0.65, gain = 0.14, delay = 0) {
    this.tone(freq, freq, dur, {
      type: 'sine',
      gain,
      delay,
      reverb: 0.75,
    });
    this.tone(freq * 2.76, freq * 2.76, dur * 0.5, {
      type: 'sine',
      gain: gain * 0.4,
      delay,
      reverb: 0.7,
    });
    this.tone(freq * 5.4, freq * 5.4, dur * 0.3, {
      type: 'sine',
      gain: gain * 0.18,
      delay,
      reverb: 0.7,
    });
  }

  // Swept filter noise burst from Slide #2 (`games/firework/src/game/sfx.ts` `noiseBurst`)
  private noiseSweep(
    dur: number,
    type: BiquadFilterType,
    f0: number,
    f1: number,
    gain: number,
    q = 1,
    delay = 0,
    reverb = 0.4,
  ) {
    try {
      const ctx = this.ensure();
      if (!ctx || !this.noiseBuf) return;
      const t0 = ctx.currentTime + delay;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const flt = ctx.createBiquadFilter();
      flt.type = type;
      flt.Q.value = q;
      flt.frequency.setValueAtTime(Math.max(20, f0), t0);
      flt.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(gain * this.shotGain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(flt);
      flt.connect(g);
      this.send(g, reverb);
      const maxStart = Math.max(0.01, 1.4 - dur);
      src.start(t0, Math.random() * maxStart, dur + 0.05);
    } catch {
      /* ignore */
    }
  }

  // Water bubble pop for Shark & Super Soaker (Slide #3)
  private bubble(f0: number, dur = 0.09, gain = 0.09, delay = 0) {
    this.tone(f0, f0 * 2.15, dur, { type: 'sine', gain, delay, reverb: 0.32 });
  }

  private noise(
    dur: number,
    opts: {
      gain?: number;
      lp?: number;
      lpEnd?: number;
      hp?: number;
      bp?: number;
      q?: number;
      delay?: number;
      reverb?: number;
    } = {},
  ) {
    try {
      const ctx = this.ensure();
      if (!ctx || !this.noiseBuf) return;
      const t0 = ctx.currentTime + (opts.delay || 0);
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      let node: AudioNode = src;
      if (opts.bp) {
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(opts.bp, t0);
        f.Q.value = opts.q || 1.2;
        node.connect(f);
        node = f;
      } else {
        if (opts.lp) {
          const f = ctx.createBiquadFilter();
          f.type = 'lowpass';
          f.frequency.setValueAtTime(opts.lp, t0);
          if (opts.lpEnd) {
            f.frequency.exponentialRampToValueAtTime(Math.max(40, opts.lpEnd), t0 + dur);
          }
          node.connect(f);
          node = f;
        }
        if (opts.hp) {
          const f = ctx.createBiquadFilter();
          f.type = 'highpass';
          f.frequency.setValueAtTime(opts.hp, t0);
          node.connect(f);
          node = f;
        }
      }
      const g = ctx.createGain();
      const peak = (opts.gain ?? 0.14) * this.shotGain;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      node.connect(g);
      this.send(g, opts.reverb ?? 0.32);
      const maxStart = Math.max(0.01, 1.4 - dur);
      src.start(t0, Math.random() * maxStart, dur + 0.02);
    } catch {
      /* ignore */
    }
  }

  private crackle(count = 7, span = 0.28, gain = 0.055, bp = 3200) {
    for (let i = 0; i < count; i++) {
      const d = 0.03 + Math.random() * span;
      this.noise(0.03, {
        bp: bp + Math.random() * 2400,
        q: 3,
        gain: gain * (0.5 + Math.random() * 0.6),
        delay: d,
        reverb: 0.4,
      });
    }
  }

  // ------------------------------------------------ UI & STAGE FLOW (Slide #2)
  /** Slide #2 button press sound */
  click() {
    this.tone(660, 990, 0.055, { type: 'triangle', gain: 0.07 });
  }

  /** Slide #2 wheel appearance / stage start sound */
  start() {
    [0, 4, 7, 12].forEach((n, i) => {
      this.bell(440 * Math.pow(2, n / 12), 0.35, 0.11, i * 0.055);
    });
    this.noise(0.22, { bp: 1800, q: 1.5, gain: 0.05 });
  }

  /** Slide #2 / Slide #3 stage clear sound */
  clear(w?: WeaponId | string) {
    if (w === 'diamond') {
      // Exact Slide #2 `clear("diamond")` (`games/firework/src/game/sfx.ts` lines 302–308):
      // sparkling glissando + grand chord
      const seq = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 19, 24];
      seq.forEach((s, i) => {
        this.metal(1046.5 * Math.pow(2, s / 12), 0.9, 0.1, 0.1 + i * 0.07);
      });
      [0, 4, 7, 12, 16].forEach((s) => {
        this.bell(523.25 * Math.pow(2, s / 12), 2.2, 0.1, 1.0);
      });
      return;
    }
    if (w === 'bazooka') {
      // Exact Slide #3 `clearBazooka()` (`games/fireworkgun/src/game/sfx.ts` lines 707–727):
      // victory barrage (4 heavy shells) + triumphant brass-ish fanfare
      for (let i = 0; i < 4; i++) {
        const dt = i * 0.2;
        this.tone(120, 28, 0.45, { type: 'sine', gain: 0.65, delay: dt, reverb: 0.35 });
        this.noiseSweep(0.35, 'lowpass', 2200, 110, 0.45, 0.7, dt, 0.5);
        this.noiseSweep(0.08, 'highpass', 2400, 900, 0.38, 1, dt + 0.01, 0.3);
      }
      this.crackle(30, 1.6, 0.12, 3500);
      const seq = [0, 4, 7, 12, 16, 19, 24];
      seq.forEach((s, i) => {
        const f = 392 * Math.pow(2, s / 12);
        this.bell(f, 1.4, 0.16, 0.25 + i * 0.1);
        this.tone(f * 0.5, f * 0.5, 0.3, { type: 'triangle', gain: 0.08, delay: 0.25 + i * 0.1, reverb: 0.4 });
      });
      [0, 4, 7, 12].forEach((s) => {
        this.bell(392 * Math.pow(2, s / 12), 2.2, 0.11, 1.1);
      });
      return;
    }
    this.tone(150, 32, 0.55, { type: 'sine', gain: 0.34 });
    this.noise(0.55, { lp: 2000, lpEnd: 140, gain: 0.28, reverb: 0.55 });
    [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => {
      const f = 523.25 * Math.pow(2, n / 12);
      if (w === 'keris') {
        this.metal(f * 0.75, 0.7, 0.11, i * 0.06);
      } else {
        this.bell(f, 0.65, 0.11, i * 0.055);
      }
    });
    if (w === 'blackhole') {
      this.tone(240, 28, 0.9, {
        type: 'sawtooth',
        gain: 0.16,
        lp: 450,
        reverb: 0.6,
        delay: 0.08,
      });
    } else if (w === 'crystal' || w === 'firework' || w === 'rainbow') {
      this.crackle(16, 0.5, 0.05, 3600);
    } else if (w === 'shark' || w === 'soaker') {
      for (let i = 0; i < 6; i++) {
        this.bubble(340 + Math.random() * 520, 0.1, 0.08, 0.05 + i * 0.06);
      }
    }
  }

  /** Slide #2 / Slide #3 game over / fail sound */
  fail(w?: WeaponId | string) {
    if (w === 'diamond') {
      // Exact Slide #2 `fail("diamond")` (`games/firework/src/game/sfx.ts` lines 341–347):
      // glass crack + dull thud + descend
      this.noiseSweep(0.09, 'highpass', 3800, 2200, 0.42, 1, 0, 0.3);
      this.tone(150, 50, 0.3, { type: 'sine', gain: 0.5, reverb: 0.25 });
      this.metal(880, 0.8, 0.09, 0.25);
      this.metal(659, 0.9, 0.09, 0.5);
      this.metal(494, 1.2, 0.1, 0.78);
      return;
    }
    if (w === 'bazooka') {
      // Exact Slide #3 `failBazooka()` (`games/fireworkgun/src/game/sfx.ts` lines 729–742):
      // rockets collide mid-air — massive explosion + sad descending alarm
      this.tone(100, 28, 0.5, { type: 'sine', gain: 0.72, reverb: 0.3 });
      this.noiseSweep(0.15, 'highpass', 1400, 600, 0.52, 0.8, 0, 0.3);
      this.noiseSweep(0.55, 'lowpass', 2000, 100, 0.46, 0.8, 0.02, 0.55);
      this.crackle(16, 0.7, 0.12, 3500);
      this.tone(440, 330, 0.25, { type: 'square', gain: 0.1, delay: 0.35, reverb: 0.4 });
      this.tone(330, 247, 0.3, { type: 'square', gain: 0.1, delay: 0.6, reverb: 0.4 });
      this.tone(247, 165, 0.45, { type: 'square', gain: 0.1, delay: 0.9, reverb: 0.45 });
      return;
    }
    if (w === 'keris') {
      this.metal(310, 0.5, 0.2);
      this.metal(232, 0.5, 0.16, 0.04);
    } else if (w === 'blackhole') {
      this.tone(200, 30, 0.65, { type: 'sawtooth', gain: 0.2, lp: 420, reverb: 0.55 });
    } else if (w === 'yoyo') {
      this.tone(620, 160, 0.32, { type: 'triangle', gain: 0.18, reverb: 0.35 });
    } else {
      this.bell(420, 0.35, 0.14);
      this.bell(395, 0.35, 0.12, 0.03);
      this.crackle(10, 0.3, 0.06, 3600);
    }
    this.noise(0.35, { bp: 900, q: 1.4, gain: 0.18, reverb: 0.35 });
    [392, 370, 349, 277].forEach((f, i) => {
      this.tone(f, f * 0.94, 0.26, {
        type: 'sawtooth',
        gain: 0.1,
        lp: 1100,
        reverb: 0.4,
        delay: 0.12 + i * 0.12,
      });
    });
  }

  // ------------------------------------------------ SHOOT (Slide #2 & Slide #3)
  /**
   * Slide #2 / #3 firing recipe.
   *
   * `gain` lifts (or trims) the whole recipe by one multiplier — every voice it
   * schedules is scaled, so the character of the sound stays exactly as it was
   * authored, only its level changes.
   */
  shoot(w: WeaponId | string, gain = 1) {
    const prev = this.shotGain;
    this.shotGain = prev * Math.min(6, Math.max(0.1, gain));
    try {
      this.recipe(w);
    } finally {
      this.shotGain = prev;
    }
  }

  private recipe(w: WeaponId | string) {
    switch (w) {
      // Slide #2 weapons
      case 'keris':
        this.noise(0.11, { bp: 2600, q: 1.8, gain: 0.11, reverb: 0.35 });
        this.metal(740, 0.32, 0.12);
        this.tone(520, 1180, 0.12, { type: 'sine', gain: 0.09, reverb: 0.35 });
        break;
      case 'blackhole':
        this.tone(180, 42, 0.26, { type: 'sine', gain: 0.24 });
        this.tone(360, 68, 0.22, { type: 'sawtooth', gain: 0.1, lp: 520, reverb: 0.4 });
        this.noise(0.18, { bp: 620, q: 2.2, gain: 0.09, reverb: 0.4 });
        break;
      case 'yoyo':
        this.tone(320, 880, 0.12, { type: 'triangle', gain: 0.13, reverb: 0.25 });
        this.noise(0.08, { bp: 2400, q: 2.5, gain: 0.07 });
        break;
      case 'diamond':
        // Exact Slide #2 `shoot("diamond")` (`games/firework/src/game/sfx.ts` lines 192–196):
        // glassy charge + crisp launch ping
        this.tone(880, 1980, 0.14, { type: 'sine', gain: 0.2, reverb: 0.55 });
        this.noiseSweep(0.2, 'highpass', 2800, 7000, 0.24, 1.1, 0.02, 0.5);
        this.metal(2093, 0.5, 0.09, 0.05);
        break;
      case 'crystal':
        this.bell(990, 0.3, 0.11);
        this.bell(1485, 0.26, 0.09, 0.025);
        this.bell(1980, 0.22, 0.07, 0.05);
        this.noise(0.1, { bp: 3200, q: 1.8, gain: 0.06, reverb: 0.4 });
        break;

      // Slide #3 weapons
      case 'firework':
        this.noise(0.09, { bp: 1800, q: 1.4, gain: 0.11 });
        this.tone(320, 1080, 0.13, { type: 'sine', gain: 0.09, reverb: 0.25 });
        this.tone(110, 52, 0.09, { type: 'triangle', gain: 0.14 });
        break;
      case 'shark':
        this.noise(0.16, { bp: 1450, q: 1.3, gain: 0.13, reverb: 0.35 });
        this.tone(150, 58, 0.13, { type: 'triangle', gain: 0.16 });
        this.bubble(340, 0.08, 0.09, 0.01);
        this.bubble(470, 0.08, 0.08, 0.045);
        this.bubble(620, 0.07, 0.07, 0.08);
        break;
      case 'bamboo':
        this.tone(185, 42, 0.24, { type: 'sine', gain: 0.32 });
        this.tone(120, 36, 0.28, { type: 'triangle', gain: 0.22 });
        this.noise(0.045, { bp: 1350, q: 2.2, gain: 0.22 });
        this.noise(0.22, { lp: 1800, lpEnd: 200, gain: 0.18, reverb: 0.42 });
        this.tone(420, 960, 0.13, { type: 'sine', gain: 0.07, delay: 0.03, reverb: 0.3 });
        break;
      case 'soaker':
        this.noise(0.14, { bp: 2600, q: 1.8, gain: 0.13, reverb: 0.28 });
        this.noise(0.09, { hp: 3200, gain: 0.07 });
        this.tone(280, 620, 0.08, { type: 'triangle', gain: 0.1 });
        this.bubble(520, 0.07, 0.09, 0.015);
        this.bubble(680, 0.07, 0.08, 0.05);
        this.bubble(860, 0.06, 0.07, 0.085);
        break;
      case 'rainbow':
        this.noise(0.1, { hp: 2800, gain: 0.07, reverb: 0.35 });
        this.tone(360, 920, 0.14, { type: 'sine', gain: 0.09, reverb: 0.35 });
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.bell(f * 1.5, 0.22, 0.065, i * 0.022);
        });
        break;
      case 'bazooka':
        // Exact Slide #3 `shootBazooka()` (`games/fireworkgun/src/game/sfx.ts` lines 669–682):
        // heavy launcher THUMP + backblast whoosh + rocket motor roar rising + shell clank
        this.tone(130, 30, 0.45, { type: 'sine', gain: 0.75, reverb: 0.3 });
        this.noiseSweep(0.3, 'lowpass', 1600, 110, 0.56, 0.7, 0, 0.45);
        this.noiseSweep(0.22, 'bandpass', 3000, 500, 0.38, 1.2, 0.01, 0.3);
        this.noiseSweep(0.4, 'bandpass', 400, 2600, 0.22, 2.0, 0.04, 0.55);
        this.tone(90 + Math.random() * 20, 220, 0.4, {
          type: 'sawtooth',
          gain: 0.11,
          delay: 0.03,
          reverb: 0.4,
          attack: 0.03,
        });
        this.tone(520, 220, 0.07, { type: 'square', gain: 0.11, reverb: 0.25 });
        break;
      case 'rpg':
        this.noise(0.04, { bp: 1900, q: 2.0, gain: 0.22 });
        this.tone(140, 36, 0.22, { type: 'sine', gain: 0.3 });
        this.tone(110, 42, 0.24, { type: 'sawtooth', gain: 0.15, lp: 460, reverb: 0.32 });
        this.noise(0.24, { bp: 2900, q: 1.8, gain: 0.16, delay: 0.015, reverb: 0.38 });
        this.noise(0.22, { lp: 2200, lpEnd: 240, gain: 0.18, reverb: 0.4 });
        this.tone(520, 1480, 0.17, { type: 'sine', gain: 0.085, delay: 0.02, reverb: 0.3 });
        break;
    }
  }

  // ------------------------------------------------ HIT (Slide #2 pentatonic rhythm)
  hit(w: WeaponId | 'yoyo-spin' | string, idx: number) {
    const f = noteFreq(idx);
    if (w === 'yoyo-spin') {
      [0, 3, 7, 10, 12, 15].forEach((n, i) => {
        this.bell(420 * Math.pow(2, n / 12), 0.18, 0.06, i * 0.06);
      });
      return;
    }

    switch (w) {
      // Slide #2 weapons (exact `games/firework/src/game/sfx.ts`)
      case 'keris':
        this.metal(f * 0.85, 0.75, 0.14);
        this.bell(f * 1.7, 0.5, 0.08, 0.02);
        this.bell(f * 2.55, 0.4, 0.05, 0.05);
        this.tone(95, 42, 0.22, { type: 'sine', gain: 0.2 });
        this.crackle(6, 0.22, 0.04, 2800);
        break;
      case 'blackhole':
        this.tone(160, 36, 0.42, { type: 'sine', gain: 0.26 });
        this.tone(f * 0.5, f * 0.25, 0.36, { type: 'triangle', gain: 0.12, reverb: 0.5 });
        this.bell(f * 0.75, 0.45, 0.07, 0.04);
        this.bell(f, 0.48, 0.11, 0.01);
        this.noise(0.28, { bp: 560, q: 2, gain: 0.1, reverb: 0.45 });
        break;
      case 'yoyo':
        this.tone(f * 0.9, f * 1.25, 0.14, { type: 'triangle', gain: 0.14, reverb: 0.3 });
        this.bell(f, 0.38, 0.12, 0.02);
        this.bell(f * 1.5, 0.32, 0.08, 0.06);
        this.noise(0.1, { bp: 2200, q: 2.2, gain: 0.07 });
        break;
      case 'diamond': {
        // Exact Slide #2 `hit("diamond", idx)` (`games/firework/src/game/sfx.ts` lines 249–259):
        // brilliant crystal strike + pentatonic metallophone arpeggio
        this.noiseSweep(0.07, 'highpass', 3200, 1800, 0.34, 1, 0, 0.35);
        this.tone(200, 80, 0.1, { type: 'sine', gain: 0.38, reverb: 0.25 });
        const g = f * 1.5;
        this.metal(g, 1.2, 0.2, 0.02);
        this.metal(g * 2, 0.7, 0.08, 0.08);
        [0, 7, 12].forEach((s, i) => {
          this.metal(g * Math.pow(2, s / 12), 0.5, 0.05, 0.12 + i * 0.05);
        });
        break;
      }
      case 'crystal':
        this.bell(f, 0.6, 0.13);
        this.bell(f * 1.25, 0.55, 0.1, 0.035);
        this.bell(f * 1.5, 0.5, 0.09, 0.07);
        this.bell(f * 2, 0.45, 0.07, 0.11);
        this.noise(0.18, { bp: 3000, q: 1.5, gain: 0.07, reverb: 0.5 });
        this.crackle(6, 0.26, 0.04, 3400);
        break;

      // Slide #3 weapons with Slide #2's crystal-clear ascending pentatonic bell melody
      case 'firework':
        this.tone(120, 42, 0.22, { type: 'sine', gain: 0.24 });
        this.noise(0.24, { bp: 1500, q: 0.8, gain: 0.16, reverb: 0.45 });
        this.bell(f, 0.5, 0.14);
        this.bell(f * 1.5, 0.42, 0.09, 0.035);
        this.bell(f * 2, 0.35, 0.06, 0.07);
        this.crackle(9, 0.32, 0.06);
        break;
      case 'shark':
        this.tone(240, 58, 0.16, { type: 'sawtooth', gain: 0.16, lp: 650, reverb: 0.25 });
        this.noise(0.07, { bp: 1900, q: 2.2, gain: 0.17 });
        this.noise(0.3, { bp: 1300, q: 0.9, gain: 0.17, delay: 0.02, reverb: 0.48 });
        this.bell(f, 0.48, 0.13);
        this.bell(f * 1.5, 0.4, 0.085, 0.03);
        for (let i = 0; i < 4; i++) {
          this.bubble(280 + Math.random() * 420, 0.09, 0.075, 0.03 + i * 0.045);
        }
        break;
      case 'bamboo':
        this.tone(150, 34, 0.34, { type: 'sine', gain: 0.32 });
        this.noise(0.055, { bp: 1550, q: 2.4, gain: 0.22 });
        this.noise(0.32, { lp: 1900, lpEnd: 160, gain: 0.2, reverb: 0.48 });
        this.bell(f, 0.48, 0.13);
        this.bell(f * 1.5, 0.4, 0.085, 0.035);
        this.crackle(10, 0.36, 0.06);
        break;
      case 'soaker':
        this.noise(0.28, { bp: 1750, q: 1.0, gain: 0.18, reverb: 0.45 });
        this.noise(0.14, { hp: 3000, gain: 0.09, reverb: 0.35 });
        this.tone(220, 82, 0.14, { type: 'sine', gain: 0.15 });
        this.bell(f, 0.46, 0.125);
        this.bell(f * 1.5, 0.38, 0.08, 0.035);
        for (let i = 0; i < 5; i++) {
          this.bubble(380 + Math.random() * 520, 0.09, 0.08, 0.015 + i * 0.038);
        }
        break;
      case 'rainbow':
        [1, 1.25, 1.5, 2].forEach((m, i) => {
          this.bell(f * m, 0.48, 0.11, i * 0.035);
        });
        this.noise(0.22, { hp: 2800, gain: 0.08, reverb: 0.5 });
        this.crackle(7, 0.28, 0.045, 3400);
        break;
      case 'bazooka': {
        // Exact Slide #3 `hitBazooka(idx)` (`games/fireworkgun/src/game/sfx.ts` lines 684–705):
        // supersonic CRACK + chest-punch sub detonation + armor CLANG + whistling shrapnel + pentatonic war drums + rumble tail
        this.noiseSweep(0.06, 'highpass', 3200, 1400, 0.52, 1, 0, 0.25);
        this.tone(95, 30, 0.32, { type: 'sine', gain: 0.72, reverb: 0.25 });
        this.tone(58, 26, 0.5, { type: 'sine', gain: 0.58, reverb: 0.3 });
        this.noiseSweep(0.45, 'lowpass', 2600, 100, 0.52, 0.8, 0.01, 0.55);
        this.noiseSweep(0.5, 'bandpass', 900, 180, 0.28, 1, 0.05, 0.6);
        this.tone(640, 320, 0.12, { type: 'triangle', gain: 0.24, reverb: 0.4 });
        this.tone(480, 220, 0.16, { type: 'triangle', gain: 0.22, delay: 0.05, reverb: 0.4 });
        this.tone(1180, 590, 0.2, { type: 'sine', gain: 0.1, delay: 0.02, reverb: 0.5 });
        this.noiseSweep(0.3, 'bandpass', 2800, 5200, 0.15, 4, 0.06, 0.5);
        const bf = f * 0.55;
        this.bell(bf, 1.15, 0.19, 0.06);
        this.bell(bf * 1.5, 0.8, 0.08, 0.12);
        this.crackle(16, 0.8, 0.12, 3500);
        this.tone(46, 24, 0.7, { type: 'sine', gain: 0.32, delay: 0.15, reverb: 0.5, attack: 0.08 });
        break;
      }
      case 'rpg':
        this.noise(0.045, { bp: 2200, q: 2.2, gain: 0.26 });
        this.tone(160, 28, 0.38, { type: 'sine', gain: 0.35 });
        this.tone(110, 26, 0.36, { type: 'sawtooth', gain: 0.17, lp: 420, reverb: 0.45 });
        this.noise(0.38, { lp: 2500, lpEnd: 130, gain: 0.22, reverb: 0.52 });
        this.bell(f, 0.48, 0.13, 0.01);
        this.bell(f * 1.5, 0.4, 0.085, 0.045);
        this.crackle(11, 0.38, 0.06);
        break;
    }
  }

  // ------------------------------------------------ SKY / BURST HELPERS
  skyLaunch() {
    this.tone(260, 880, 0.22, { type: 'sine', gain: 0.045, reverb: 0.3 });
    this.noise(0.18, { bp: 2000, q: 2, gain: 0.04 });
  }

  boom(scale = 1) {
    this.tone(95, 28, 0.38 * scale, { type: 'sine', gain: 0.26 * scale });
    this.noise(0.42 * scale, {
      lp: 1700,
      lpEnd: 160,
      gain: 0.22 * scale,
      reverb: 0.5,
    });
    this.crackle(Math.round(11 * scale), 0.38, 0.055 * scale);
  }

  sky(w: WeaponId | string, size = 1) {
    if (w === 'diamond') {
      // Exact Slide #2 `sky("diamond")` (`games/firework/src/game/sfx.ts` lines 371–372)
      this.metal(1568 + Math.random() * 600, 1.1, 0.08, 0);
    } else if (w === 'bazooka') {
      // Exact Slide #3 `bazookaSkyBoom(size)` (`games/fireworkgun/src/game/sfx.ts` lines 744–755)
      const s = Math.min(size, 1.3);
      this.tone(115, 28, 0.55, { type: 'sine', gain: 0.56 * s, reverb: 0.4 });
      this.noiseSweep(0.45, 'lowpass', 2200, 120, 0.42 * s, 0.7, 0, 0.55);
      this.noiseSweep(0.1, 'highpass', 2600, 1000, 0.3, 1, 0.01, 0.3);
      this.crackle(Math.round(8 + size * 8), 0.7, 0.1, 3500);
    } else if (w === 'keris') {
      this.metal(520 + Math.random() * 240, 0.55, 0.08);
    } else if (w === 'blackhole') {
      this.tone(140, 38, 0.4, { type: 'sine', gain: 0.16 });
    } else {
      const f = 660 + Math.random() * 440;
      this.bell(f, 0.4, 0.08);
      this.bell(f * 1.5, 0.35, 0.05, 0.04);
    }
  }
}

export const slide23Sfx = new Slide23Sfx();
