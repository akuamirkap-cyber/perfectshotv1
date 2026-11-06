// ───────────────────────── Procedural SFX (WebAudio, no assets) ─────────────────────────
type FilterKind = 'lowpass' | 'highpass' | 'bandpass';

interface NoiseOpts {
  dur: number;
  type?: FilterKind;
  freq?: number;
  freqEnd?: number;
  q?: number;
  gain?: number;
  attack?: number;
  delay?: number;
}
interface ToneOpts {
  freq: number;
  freqEnd?: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  attack?: number;
  delay?: number;
}

class SFX {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private comp: DynamicsCompressorNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;
  /**
   * Per-name level trim, applied to every voice a recipe schedules.
   *
   * Slide 7 mixes some weapons as background texture: `rainbow_fire` peaks at
   * 0.12 because it plays over the stage track with fireworks cracking in front
   * of it. On slide 1 the same recipe is the only sound of the shot, and next to
   * 98 other guns it read as barely there. These multipliers lift exactly those
   * names to the ~0.45 peak band the rest of the arsenal lives in, without
   * touching their timbre, rhythm or the loud recipes at all.
   */
  private static readonly LEVEL: Record<string, number> = {
    angklung_fire: 3.6, rainbow_fire: 3.6, unicorn_fire: 3.6,
    wand_fire: 3.2, charge_charge: 3.2, emerald_charge: 3.6,
    laser_charge: 3.6, moon_charge: 3.2, plasma_charge: 4,
    chicken_fire: 2.5, freeze_fire: 2, ghost_fire: 1.8, holy_fire: 1.8,
    gravity_charge: 2, storm_charge: 2, ufo_fire: 2, rail_charge: 1.8,
    bamboo_fuse: 1.8,
    sakura_fire: 1.6, banana_fire: 1.5, bubble_fire: 1.5, diamond_fire: 1.5,
    shrink_fire: 2.8, grow_fire: 2.8,
    bh_fire: 0.9, bh_charge: 3.6, bh_suck: 2.2, bh_hit: 0.6,
    sling_fire: 1.65, sumpit_fire: 0.9, soaker_fire: 1.2, pump: 1,
  };
  /** Level trim of the recipe being played right now (see `LEVEL`). */
  private mul = 1;

  ensure() {
    if (!this.ctx) {
      try {
        const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        this.ctx = new AC();
        this.comp = this.ctx.createDynamicsCompressor();
        this.comp.threshold.value = -14;
        this.comp.ratio.value = 6;
        this.master = this.ctx.createGain();
        // 0.55 was too quiet once slide 7's guns started firing on slide 1 next
        // to slide 9 (0.85) and slide 11 (0.92); 0.8 keeps every ported set in
        // the same loudness band while the compressor below still tames peaks.
        this.master.gain.value = 0.8;
        this.master.connect(this.comp);
        this.comp.connect(this.ctx.destination);
        const len = this.ctx.sampleRate * 1.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private noise(o: NoiseOpts) {
    const c = this.ctx;
    if (!c || !this.master || !this.noiseBuf) return;
    const t0 = c.currentTime + (o.delay ?? 0);
    const src = c.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = c.createBiquadFilter();
    f.type = o.type ?? 'lowpass';
    f.frequency.setValueAtTime(o.freq ?? 1000, t0);
    if (o.freqEnd) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.freqEnd), t0 + o.dur);
    f.Q.value = o.q ?? 0.8;
    const g = c.createGain();
    const peak = (o.gain ?? 0.5) * this.mul;
    const att = o.attack ?? 0.004;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.master);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + o.dur + 0.05);
  }

  private tone(o: ToneOpts) {
    const c = this.ctx;
    if (!c || !this.master) return;
    const t0 = c.currentTime + (o.delay ?? 0);
    const osc = c.createOscillator();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(10, o.freqEnd), t0 + o.dur);
    const g = c.createGain();
    const peak = (o.gain ?? 0.3) * this.mul;
    const att = o.attack ?? 0.003;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + att);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.05);
  }

  play(name: string, gain = 1) {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    const prev = this.mul;
    this.mul = prev * gain * (SFX.LEVEL[name] ?? 1);
    try {
      this.recipe(name);
    } finally {
      this.mul = prev;
    }
  }

  /** Runs `fn` with every recipe it plays scaled by `gain` (per-shot level). */
  withGain<T>(gain: number, fn: () => T): T {
    const prev = this.mul;
    this.mul = prev * gain;
    try {
      return fn();
    } finally {
      this.mul = prev;
    }
  }

  private recipe(name: string) {
    const n = (o: NoiseOpts) => this.noise(o);
    const t = (o: ToneOpts) => this.tone(o);
    switch (name) {
      case 'golden_fire':
        n({ dur: 0.22, type: 'lowpass', freq: 5200, freqEnd: 700, gain: 0.9 });
        n({ dur: 0.05, type: 'highpass', freq: 3000, gain: 0.5 });
        t({ freq: 160, freqEnd: 45, dur: 0.18, gain: 0.8 });
        t({ freq: 2637, freqEnd: 2600, dur: 0.6, type: 'triangle', gain: 0.05, delay: 0.01 });
        t({ freq: 3951, freqEnd: 3900, dur: 0.5, type: 'sine', gain: 0.035, delay: 0.02 });
        t({ freq: 4200, dur: 0.05, type: 'triangle', gain: 0.05, delay: 0.42 });
        t({ freq: 3800, dur: 0.05, type: 'triangle', gain: 0.035, delay: 0.52 });
        break;
      case 'golden_hit':
        n({ dur: 0.12, type: 'lowpass', freq: 1000, gain: 0.7 });
        t({ freq: 190, freqEnd: 80, dur: 0.12, gain: 0.5 });
        t({ freq: 1975, freqEnd: 1900, dur: 0.45, type: 'triangle', gain: 0.07 });
        t({ freq: 2960, freqEnd: 2900, dur: 0.35, type: 'sine', gain: 0.05, delay: 0.03 });
        break;
      case 'bh_charge':
        t({ freq: 70, freqEnd: 320, dur: 0.3, type: 'sawtooth', gain: 0.08, attack: 0.08 });
        n({ dur: 0.3, type: 'highpass', freq: 2500, freqEnd: 6000, gain: 0.12, attack: 0.1 });
        break;
      case 'bh_fire':
        t({ freq: 420, freqEnd: 50, dur: 0.5, type: 'sine', gain: 0.55 });
        t({ freq: 900, freqEnd: 120, dur: 0.25, type: 'square', gain: 0.05 });
        n({ dur: 0.4, type: 'bandpass', freq: 900, freqEnd: 150, q: 1.2, gain: 0.45 });
        break;
      case 'bh_hit':
        t({ freq: 60, freqEnd: 28, dur: 0.9, type: 'sine', gain: 0.9 });
        n({ dur: 0.8, type: 'lowpass', freq: 700, freqEnd: 60, gain: 0.8 });
        n({ dur: 0.25, type: 'highpass', freq: 3500, gain: 0.3, delay: 0.02 });
        t({ freq: 1500, freqEnd: 90, dur: 0.35, type: 'sawtooth', gain: 0.06 });
        break;
      case 'bh_suck':
        t({ freq: 90, freqEnd: 260, dur: 0.3, type: 'sine', gain: 0.25, attack: 0.15 });
        n({ dur: 0.3, type: 'bandpass', freq: 300, freqEnd: 1600, q: 2, gain: 0.25, attack: 0.2 });
        break;
      case 'sling_fire':
        t({ freq: 240, freqEnd: 120, dur: 0.22, type: 'triangle', gain: 0.25 });
        t({ freq: 480, freqEnd: 300, dur: 0.12, type: 'sine', gain: 0.08 });
        n({ dur: 0.18, type: 'bandpass', freq: 900, freqEnd: 3500, q: 1, gain: 0.3 });
        break;
      case 'sling_hit':
        n({ dur: 0.18, type: 'lowpass', freq: 800, freqEnd: 200, gain: 0.95 });
        t({ freq: 130, freqEnd: 55, dur: 0.18, gain: 0.7 });
        n({ dur: 0.06, type: 'highpass', freq: 2200, gain: 0.35 });
        break;
      case 'sumpit_fire':
        n({ dur: 0.14, type: 'bandpass', freq: 700, freqEnd: 1400, q: 1.4, gain: 0.55, attack: 0.012 });
        n({ dur: 0.08, type: 'highpass', freq: 4000, gain: 0.12, delay: 0.06 });
        t({ freq: 520, freqEnd: 900, dur: 0.06, gain: 0.05, delay: 0.06 });
        break;
      case 'sumpit_hit':
        n({ dur: 0.045, type: 'highpass', freq: 1600, gain: 0.55 });
        t({ freq: 240, freqEnd: 140, dur: 0.09, gain: 0.4 });
        t({ freq: 330, dur: 0.35, type: 'triangle', gain: 0.05, delay: 0.01 });
        t({ freq: 345, dur: 0.3, type: 'triangle', gain: 0.03, delay: 0.02 });
        break;
      case 'shotgun_fire':
        n({ dur: 0.55, type: 'lowpass', freq: 3200, freqEnd: 180, gain: 1 });
        n({ dur: 0.07, type: 'bandpass', freq: 3500, q: 0.7, gain: 0.6 });
        t({ freq: 100, freqEnd: 32, dur: 0.4, gain: 1 });
        break;
      case 'pump':
        n({ dur: 0.045, type: 'bandpass', freq: 2400, q: 2, gain: 0.45 });
        t({ freq: 380, dur: 0.03, type: 'square', gain: 0.05 });
        n({ dur: 0.05, type: 'bandpass', freq: 1800, q: 2, gain: 0.5, delay: 0.14 });
        t({ freq: 300, dur: 0.03, type: 'square', gain: 0.05, delay: 0.14 });
        break;
      case 'shotgun_hit':
        for (let i = 0; i < 5; i++) n({ dur: 0.05, type: 'bandpass', freq: 1200 + Math.random() * 1800, q: 1.5, gain: 0.35, delay: i * 0.012 });
        n({ dur: 0.16, type: 'lowpass', freq: 900, gain: 0.8 });
        t({ freq: 150, freqEnd: 60, dur: 0.14, gain: 0.6 });
        break;
      case 'soaker_fire':
        n({ dur: 0.28, type: 'bandpass', freq: 2500, freqEnd: 5000, q: 0.9, gain: 0.4, attack: 0.02 });
        n({ dur: 0.12, type: 'lowpass', freq: 600, gain: 0.3 });
        break;
      case 'splash':
        n({ dur: 0.38, type: 'bandpass', freq: 1500, freqEnd: 400, q: 0.8, gain: 0.7 });
        n({ dur: 0.25, type: 'highpass', freq: 3500, gain: 0.22, delay: 0.02 });
        t({ freq: 300, freqEnd: 120, dur: 0.1, gain: 0.2 });
        break;
      case 'wood':
        n({ dur: 0.09, type: 'lowpass', freq: 1100, gain: 0.55 });
        t({ freq: 190, freqEnd: 90, dur: 0.1, gain: 0.45 });
        break;
      case 'apple':
        n({ dur: 0.09, type: 'bandpass', freq: 2600, q: 1.2, gain: 0.45 });
        t({ freq: 620, freqEnd: 300, dur: 0.1, gain: 0.15 });
        break;
      case 'ricochet':
        t({ freq: 2800, freqEnd: 900, dur: 0.3, type: 'sine', gain: 0.12 });
        n({ dur: 0.05, type: 'bandpass', freq: 3200, q: 1, gain: 0.5 });
        break;
      case 'fail':
        t({ freq: 240, freqEnd: 90, dur: 0.45, type: 'square', gain: 0.07 });
        t({ freq: 1250, freqEnd: 950, dur: 0.35, type: 'triangle', gain: 0.1 });
        n({ dur: 0.1, type: 'bandpass', freq: 2000, gain: 0.3 });
        break;
      case 'snow_fire':
        n({ dur: 0.28, type: 'lowpass', freq: 3800, freqEnd: 500, gain: 0.55 });
        n({ dur: 0.12, type: 'highpass', freq: 4500, gain: 0.2 });
        t({ freq: 220, freqEnd: 80, dur: 0.18, gain: 0.5 });
        [2093, 2637, 3136, 3951].forEach((f, i) => t({ freq: f, dur: 0.28, type: 'sine', gain: 0.035, delay: 0.02 + i * 0.035 }));
        break;
      case 'snow_hit':
        n({ dur: 0.22, type: 'lowpass', freq: 1400, freqEnd: 300, gain: 0.8 });
        n({ dur: 0.16, type: 'bandpass', freq: 5200, q: 1.4, gain: 0.28 });
        t({ freq: 120, freqEnd: 50, dur: 0.16, gain: 0.55 });
        [3136, 3951, 4699].forEach((f, i) => t({ freq: f, dur: 0.3, type: 'triangle', gain: 0.04, delay: 0.03 + i * 0.05 }));
        break;
      case 'sniper_fire':
        n({ dur: 0.12, type: 'highpass', freq: 2500, gain: 1 });
        n({ dur: 0.9, type: 'lowpass', freq: 2200, freqEnd: 90, gain: 1 });
        t({ freq: 130, freqEnd: 28, dur: 0.55, gain: 1.1 });
        n({ dur: 0.5, type: 'bandpass', freq: 700, freqEnd: 200, q: 0.8, gain: 0.5, delay: 0.12 });
        n({ dur: 0.4, type: 'lowpass', freq: 900, freqEnd: 100, gain: 0.3, delay: 0.22 });
        break;
      case 'bolt':
        n({ dur: 0.04, type: 'bandpass', freq: 2000, q: 3, gain: 0.5 });
        t({ freq: 300, dur: 0.03, type: 'square', gain: 0.05 });
        t({ freq: 900, dur: 0.05, type: 'triangle', gain: 0.08, delay: 0.12 });
        n({ dur: 0.05, type: 'bandpass', freq: 1500, q: 3, gain: 0.5, delay: 0.18 });
        n({ dur: 0.05, type: 'bandpass', freq: 1800, q: 3, gain: 0.5, delay: 0.3 });
        t({ freq: 4200, dur: 0.1, type: 'sine', gain: 0.04, delay: 0.45 });
        break;
      case 'sniper_hit':
        n({ dur: 0.06, type: 'highpass', freq: 2500, gain: 0.7 });
        n({ dur: 0.2, type: 'lowpass', freq: 1200, freqEnd: 200, gain: 0.8 });
        t({ freq: 170, freqEnd: 60, dur: 0.14, gain: 0.6 });
        t({ freq: 3200, freqEnd: 1200, dur: 0.35, type: 'sine', gain: 0.06 });
        break;
      case 'flame_fire':
        n({ dur: 0.75, type: 'lowpass', freq: 1100, freqEnd: 500, q: 0.7, gain: 0.75, attack: 0.04 });
        n({ dur: 0.7, type: 'bandpass', freq: 1800, freqEnd: 900, q: 0.5, gain: 0.35, attack: 0.05 });
        t({ freq: 90, freqEnd: 60, dur: 0.5, type: 'sawtooth', gain: 0.08 });
        n({ dur: 0.1, type: 'lowpass', freq: 600, gain: 0.7 });
        break;
      case 'flame_hit':
        for (let i = 0; i < 9; i++) n({ dur: 0.04 + Math.random() * 0.03, type: 'bandpass', freq: 1500 + Math.random() * 3000, q: 2, gain: 0.25, delay: 0.05 + i * 0.045 + Math.random() * 0.02 });
        n({ dur: 0.4, type: 'lowpass', freq: 800, freqEnd: 200, gain: 0.4 });
        break;
      case 'bubble_fire':
        t({ freq: 380, freqEnd: 880, dur: 0.14, type: 'sine', gain: 0.3 });
        t({ freq: 560, freqEnd: 1250, dur: 0.12, type: 'sine', gain: 0.12, delay: 0.05 });
        n({ dur: 0.18, type: 'highpass', freq: 5000, gain: 0.12 });
        break;
      case 'bubble_pop':
        t({ freq: 1400, freqEnd: 420, dur: 0.07, type: 'sine', gain: 0.5 });
        n({ dur: 0.05, type: 'bandpass', freq: 3500, q: 1, gain: 0.45 });
        t({ freq: 2200, freqEnd: 3000, dur: 0.12, type: 'sine', gain: 0.05, delay: 0.03 });
        break;
      case 'bamboo_fuse':
        n({ dur: 0.16, type: 'highpass', freq: 3500, gain: 0.25, attack: 0.02 });
        break;
      case 'bamboo_fire':
        t({ freq: 95, freqEnd: 24, dur: 0.7, gain: 1.2 });
        n({ dur: 0.8, type: 'lowpass', freq: 2600, freqEnd: 120, gain: 1 });
        n({ dur: 0.08, type: 'bandpass', freq: 1800, q: 0.6, gain: 0.7 });
        break;
      case 'bamboo_hit':
        t({ freq: 70, freqEnd: 25, dur: 1, gain: 1.1 });
        n({ dur: 0.9, type: 'lowpass', freq: 1800, freqEnd: 70, gain: 1 });
        n({ dur: 0.2, type: 'highpass', freq: 2500, gain: 0.4 });
        for (let i = 0; i < 5; i++) n({ dur: 0.06, type: 'bandpass', freq: 800 + Math.random() * 2000, q: 1.5, gain: 0.3, delay: 0.1 + i * 0.05 });
        break;
      case 'banana_fire':
        t({ freq: 300, freqEnd: 760, dur: 0.12, type: 'triangle', gain: 0.3 });
        t({ freq: 900, freqEnd: 300, dur: 0.15, type: 'sine', gain: 0.2, delay: 0.09 });
        n({ dur: 0.05, type: 'highpass', freq: 3500, gain: 0.3 });
        break;
      case 'banana_hit':
        n({ dur: 0.22, type: 'lowpass', freq: 900, freqEnd: 200, gain: 0.8 });
        n({ dur: 0.14, type: 'bandpass', freq: 1600, freqEnd: 500, q: 2.5, gain: 0.5 });
        t({ freq: 200, freqEnd: 70, dur: 0.15, gain: 0.5 });
        t({ freq: 520, freqEnd: 260, dur: 0.2, type: 'triangle', gain: 0.1, delay: 0.04 });
        break;
      case 'harpoon_fire':
        n({ dur: 0.18, type: 'highpass', freq: 3500, gain: 0.55 });
        n({ dur: 0.26, type: 'lowpass', freq: 2400, freqEnd: 500, gain: 0.7 });
        t({ freq: 150, freqEnd: 50, dur: 0.2, gain: 0.7 });
        t({ freq: 1800, freqEnd: 700, dur: 0.16, type: 'sine', gain: 0.08, delay: 0.02 });
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'bandpass', freq: 3000 + Math.random() * 2000, q: 3, gain: 0.15, delay: 0.1 + i * 0.03 });
        break;
      case 'harpoon_hit':
        n({ dur: 0.22, type: 'lowpass', freq: 1000, freqEnd: 200, gain: 0.9 });
        t({ freq: 110, freqEnd: 45, dur: 0.22, gain: 0.8 });
        n({ dur: 0.07, type: 'highpass', freq: 2500, gain: 0.5 });
        t({ freq: 520, dur: 0.5, type: 'triangle', gain: 0.07, delay: 0.02 });
        t({ freq: 780, dur: 0.4, type: 'triangle', gain: 0.04, delay: 0.03 });
        break;
      case 'rope':
        t({ freq: 900, freqEnd: 300, dur: 0.14, type: 'sawtooth', gain: 0.06 });
        n({ dur: 0.12, type: 'bandpass', freq: 2200, q: 2, gain: 0.3 });
        break;
      case 'chicken_fire':
        t({ freq: 700, freqEnd: 1900, dur: 0.16, type: 'sawtooth', gain: 0.1 });
        t({ freq: 760, freqEnd: 2100, dur: 0.16, type: 'triangle', gain: 0.18 });
        t({ freq: 1500, freqEnd: 900, dur: 0.12, type: 'triangle', gain: 0.12, delay: 0.14 });
        n({ dur: 0.1, type: 'bandpass', freq: 1800, q: 1.5, gain: 0.15 });
        break;
      case 'chicken_hit':
        t({ freq: 900, freqEnd: 420, dur: 0.14, type: 'sawtooth', gain: 0.12 });
        t({ freq: 1100, freqEnd: 500, dur: 0.14, type: 'triangle', gain: 0.18 });
        t({ freq: 600, freqEnd: 1500, dur: 0.1, type: 'triangle', gain: 0.1, delay: 0.14 });
        n({ dur: 0.16, type: 'lowpass', freq: 900, gain: 0.55 });
        t({ freq: 140, freqEnd: 60, dur: 0.14, gain: 0.45 });
        break;
      case 'confetti_fire':
        n({ dur: 0.1, type: 'highpass', freq: 2000, gain: 0.8 });
        t({ freq: 220, freqEnd: 70, dur: 0.14, gain: 0.8 });
        n({ dur: 0.4, type: 'bandpass', freq: 4500, freqEnd: 2500, q: 0.8, gain: 0.25, delay: 0.03 });
        [1047, 1319, 1568, 2093].forEach((f, i) => t({ freq: f, dur: 0.25, type: 'triangle', gain: 0.06, delay: 0.02 + i * 0.04 }));
        break;
      case 'confetti_hit':
        n({ dur: 0.12, type: 'highpass', freq: 1800, gain: 0.7 });
        t({ freq: 200, freqEnd: 60, dur: 0.12, gain: 0.6 });
        n({ dur: 0.45, type: 'bandpass', freq: 4200, freqEnd: 2200, q: 0.7, gain: 0.3, delay: 0.02 });
        [1319, 1760, 2349].forEach((f, i) => t({ freq: f, dur: 0.22, type: 'triangle', gain: 0.06, delay: 0.03 + i * 0.05 }));
        break;
      case 'confetti_pop2':
        n({ dur: 0.08, type: 'highpass', freq: 2500, gain: 0.5 });
        t({ freq: 260, freqEnd: 90, dur: 0.1, gain: 0.45 });
        n({ dur: 0.3, type: 'bandpass', freq: 4000, q: 0.8, gain: 0.2 });
        break;
      case 'seed_fire':
        t({ freq: 340, freqEnd: 140, dur: 0.14, type: 'triangle', gain: 0.3 });
        n({ dur: 0.16, type: 'bandpass', freq: 1400, freqEnd: 3000, q: 1, gain: 0.35 });
        t({ freq: 900, freqEnd: 500, dur: 0.08, type: 'sine', gain: 0.1, delay: 0.02 });
        break;
      case 'seed_hit':
        n({ dur: 0.14, type: 'lowpass', freq: 700, freqEnd: 200, gain: 0.8 });
        t({ freq: 120, freqEnd: 55, dur: 0.14, gain: 0.55 });
        n({ dur: 0.06, type: 'bandpass', freq: 2200, q: 1.5, gain: 0.3 });
        break;
      case 'seed_grow':
        t({ freq: 440, freqEnd: 880, dur: 0.3, type: 'sine', gain: 0.1 });
        [880, 1175, 1480].forEach((f, i) => t({ freq: f, dur: 0.25, type: 'triangle', gain: 0.05, delay: 0.1 + i * 0.07 }));
        break;
      case 'pizza_fire':
        n({ dur: 0.3, type: 'lowpass', freq: 1800, freqEnd: 400, gain: 0.7 });
        n({ dur: 0.35, type: 'bandpass', freq: 3500, freqEnd: 1500, q: 0.7, gain: 0.25 });
        t({ freq: 170, freqEnd: 60, dur: 0.2, gain: 0.7 });
        t({ freq: 420, freqEnd: 260, dur: 0.12, type: 'triangle', gain: 0.1, delay: 0.04 });
        break;
      case 'pizza_hit':
        n({ dur: 0.26, type: 'lowpass', freq: 800, freqEnd: 150, gain: 0.9 });
        n({ dur: 0.2, type: 'bandpass', freq: 1200, freqEnd: 400, q: 2, gain: 0.5 });
        t({ freq: 110, freqEnd: 45, dur: 0.2, gain: 0.6 });
        for (let i = 0; i < 4; i++) n({ dur: 0.05, type: 'bandpass', freq: 600 + Math.random() * 800, q: 3, gain: 0.25, delay: 0.1 + i * 0.05 });
        break;
      case 'minigun_fire':
        for (let i = 0; i < 9; i++) {
          n({ dur: 0.07, type: 'lowpass', freq: 3200, freqEnd: 500, gain: 0.55, delay: i * 0.05 });
          n({ dur: 0.02, type: 'highpass', freq: 3500, gain: 0.3, delay: i * 0.05 });
          t({ freq: 150, freqEnd: 55, dur: 0.06, gain: 0.5, delay: i * 0.05 });
          t({ freq: 5200, dur: 0.02, type: 'triangle', gain: 0.03, delay: 0.1 + i * 0.05 });
        }
        t({ freq: 60, freqEnd: 140, dur: 0.5, type: 'sawtooth', gain: 0.06, attack: 0.1 });
        break;
      case 'crossbow_fire':
        t({ freq: 190, freqEnd: 70, dur: 0.12, type: 'triangle', gain: 0.5 });
        t({ freq: 520, freqEnd: 300, dur: 0.3, type: 'triangle', gain: 0.1 });
        t({ freq: 780, freqEnd: 480, dur: 0.22, type: 'sine', gain: 0.07 });
        n({ dur: 0.1, type: 'bandpass', freq: 2600, freqEnd: 1000, q: 1.5, gain: 0.35 });
        break;
      case 'crossbow_hit':
        n({ dur: 0.12, type: 'lowpass', freq: 1100, freqEnd: 250, gain: 0.85 });
        t({ freq: 150, freqEnd: 65, dur: 0.12, gain: 0.6 });
        n({ dur: 0.05, type: 'highpass', freq: 2200, gain: 0.45 });
        t({ freq: 300, dur: 0.3, type: 'triangle', gain: 0.05, delay: 0.01 });
        break;
      case 'plasma_charge':
        t({ freq: 120, freqEnd: 520, dur: 0.22, type: 'sawtooth', gain: 0.07, attack: 0.06 });
        t({ freq: 240, freqEnd: 1040, dur: 0.22, type: 'sine', gain: 0.1, attack: 0.08 });
        n({ dur: 0.22, type: 'highpass', freq: 3000, freqEnd: 7000, gain: 0.1, attack: 0.1 });
        break;
      case 'plasma_fire':
        t({ freq: 900, freqEnd: 90, dur: 0.35, type: 'sawtooth', gain: 0.12 });
        t({ freq: 300, freqEnd: 60, dur: 0.4, type: 'sine', gain: 0.5 });
        n({ dur: 0.3, type: 'bandpass', freq: 1800, freqEnd: 400, q: 1.2, gain: 0.4 });
        t({ freq: 2400, freqEnd: 800, dur: 0.2, type: 'square', gain: 0.03 });
        break;
      case 'plasma_hit':
        n({ dur: 0.5, type: 'lowpass', freq: 1800, freqEnd: 120, gain: 0.85 });
        t({ freq: 90, freqEnd: 30, dur: 0.6, gain: 0.8 });
        for (let i = 0; i < 6; i++) n({ dur: 0.04, type: 'bandpass', freq: 2000 + Math.random() * 3500, q: 4, gain: 0.25, delay: 0.04 + i * 0.045 });
        t({ freq: 1600, freqEnd: 300, dur: 0.4, type: 'sawtooth', gain: 0.05 });
        break;
      case 'laser_charge':
        t({ freq: 200, freqEnd: 1800, dur: 0.26, type: 'sine', gain: 0.12, attack: 0.08 });
        t({ freq: 400, freqEnd: 3600, dur: 0.26, type: 'triangle', gain: 0.05, attack: 0.1 });
        n({ dur: 0.26, type: 'highpass', freq: 4000, freqEnd: 8000, gain: 0.08, attack: 0.12 });
        break;
      case 'laser_fire':
        t({ freq: 1800, freqEnd: 600, dur: 0.38, type: 'sawtooth', gain: 0.1 });
        t({ freq: 900, freqEnd: 300, dur: 0.4, type: 'sine', gain: 0.35 });
        n({ dur: 0.35, type: 'bandpass', freq: 3000, freqEnd: 1200, q: 0.8, gain: 0.3 });
        t({ freq: 70, freqEnd: 50, dur: 0.4, gain: 0.5 });
        break;
      case 'laser_hit':
        for (let i = 0; i < 10; i++) n({ dur: 0.04, type: 'bandpass', freq: 1600 + Math.random() * 3500, q: 3, gain: 0.2, delay: i * 0.03 });
        n({ dur: 0.3, type: 'lowpass', freq: 1200, freqEnd: 200, gain: 0.5 });
        break;
      case 'dragon_fire':
        n({ dur: 0.9, type: 'lowpass', freq: 1800, freqEnd: 300, q: 0.7, gain: 0.9, attack: 0.02 });
        n({ dur: 0.8, type: 'bandpass', freq: 900, freqEnd: 400, q: 0.6, gain: 0.5 });
        t({ freq: 70, freqEnd: 32, dur: 0.7, type: 'sawtooth', gain: 0.35 });
        t({ freq: 190, freqEnd: 60, dur: 0.5, type: 'sawtooth', gain: 0.12 });
        n({ dur: 0.1, type: 'highpass', freq: 2500, gain: 0.4 });
        break;
      case 'dragon_hit':
        t({ freq: 60, freqEnd: 24, dur: 1.1, gain: 1.1 });
        n({ dur: 0.9, type: 'lowpass', freq: 1600, freqEnd: 80, gain: 1 });
        t({ freq: 280, freqEnd: 90, dur: 0.6, type: 'sawtooth', gain: 0.16 });
        for (let i = 0; i < 7; i++) n({ dur: 0.05, type: 'bandpass', freq: 1500 + Math.random() * 3000, q: 2, gain: 0.22, delay: 0.1 + i * 0.05 });
        break;
      case 'gravity_charge':
        t({ freq: 80, freqEnd: 380, dur: 0.3, type: 'sine', gain: 0.22, attack: 0.1 });
        n({ dur: 0.3, type: 'bandpass', freq: 300, freqEnd: 1800, q: 2, gain: 0.22, attack: 0.15 });
        break;
      case 'gravity_fire':
        t({ freq: 520, freqEnd: 60, dur: 0.5, type: 'sine', gain: 0.5 });
        t({ freq: 1000, freqEnd: 140, dur: 0.25, type: 'square', gain: 0.04 });
        n({ dur: 0.4, type: 'bandpass', freq: 1000, freqEnd: 160, q: 1.2, gain: 0.4 });
        break;
      case 'gravity_hit':
        t({ freq: 52, freqEnd: 24, dur: 1.0, type: 'sine', gain: 1 });
        n({ dur: 0.8, type: 'lowpass', freq: 900, freqEnd: 60, gain: 0.85 });
        n({ dur: 0.14, type: 'highpass', freq: 3000, gain: 0.35 });
        t({ freq: 1400, freqEnd: 90, dur: 0.4, type: 'sawtooth', gain: 0.05 });
        break;
      case 'honey_fire':
        t({ freq: 320, freqEnd: 140, dur: 0.16, type: 'sine', gain: 0.4 });
        n({ dur: 0.18, type: 'bandpass', freq: 900, freqEnd: 400, q: 1.6, gain: 0.35 });
        t({ freq: 700, freqEnd: 420, dur: 0.08, type: 'triangle', gain: 0.07, delay: 0.03 });
        break;
      case 'honey_hit':
        n({ dur: 0.24, type: 'lowpass', freq: 800, freqEnd: 150, gain: 0.9 });
        n({ dur: 0.18, type: 'bandpass', freq: 1100, freqEnd: 350, q: 2.4, gain: 0.5 });
        t({ freq: 120, freqEnd: 50, dur: 0.2, gain: 0.55 });
        for (let i = 0; i < 4; i++) t({ freq: 500 + Math.random() * 300, freqEnd: 250, dur: 0.06, type: 'sine', gain: 0.1, delay: 0.08 + i * 0.05 });
        break;
      case 'coconut_fire':
        t({ freq: 150, freqEnd: 52, dur: 0.22, gain: 0.85 });
        n({ dur: 0.3, type: 'lowpass', freq: 2200, freqEnd: 260, gain: 0.7 });
        t({ freq: 320, freqEnd: 190, dur: 0.1, type: 'triangle', gain: 0.18 });
        break;
      case 'coconut_hit':
        n({ dur: 0.06, type: 'highpass', freq: 2000, gain: 0.7 });
        t({ freq: 260, freqEnd: 110, dur: 0.14, type: 'triangle', gain: 0.5 });
        t({ freq: 120, freqEnd: 55, dur: 0.16, gain: 0.55 });
        n({ dur: 0.36, type: 'bandpass', freq: 1500, freqEnd: 420, q: 0.8, gain: 0.5, delay: 0.04 });
        break;
      case 'angklung_fire':
        [784, 988, 1175, 1568].forEach((f, i) => {
          t({ freq: f, freqEnd: f * 0.995, dur: 0.5, type: 'triangle', gain: 0.1, delay: i * 0.045 });
          t({ freq: f * 2.01, dur: 0.3, type: 'sine', gain: 0.03, delay: i * 0.045 });
        });
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'bandpass', freq: 3000 + Math.random() * 2000, q: 4, gain: 0.12, delay: i * 0.03 });
        break;
      case 'angklung_hit':
        n({ dur: 0.12, type: 'lowpass', freq: 1200, freqEnd: 300, gain: 0.7 });
        t({ freq: 140, freqEnd: 60, dur: 0.14, gain: 0.5 });
        [523, 659, 784, 1047].forEach((f, i) => {
          t({ freq: f, dur: 0.7, type: 'triangle', gain: 0.1, delay: 0.02 + i * 0.03 });
          t({ freq: f * 2, dur: 0.5, type: 'sine', gain: 0.035, delay: 0.02 + i * 0.03 });
        });
        break;
      case 'angklung_echo':
        [1047, 1319].forEach((f, i) => t({ freq: f, dur: 0.45, type: 'triangle', gain: 0.06, delay: i * 0.05 }));
        break;
      case 'bee_fire':
        for (let i = 0; i < 4; i++) t({ freq: 210 + i * 16, freqEnd: 250 + i * 14, dur: 0.4, type: 'sawtooth', gain: 0.05, delay: i * 0.012 });
        n({ dur: 0.4, type: 'bandpass', freq: 2400, q: 3, gain: 0.18 });
        n({ dur: 0.1, type: 'lowpass', freq: 700, gain: 0.5 });
        t({ freq: 150, freqEnd: 70, dur: 0.14, gain: 0.4 });
        break;
      case 'bee_hit':
        for (let i = 0; i < 5; i++) t({ freq: 190 + i * 22, freqEnd: 260 + i * 10, dur: 0.5, type: 'sawtooth', gain: 0.045, delay: i * 0.02 });
        n({ dur: 0.5, type: 'bandpass', freq: 2600, q: 3, gain: 0.16 });
        n({ dur: 0.12, type: 'lowpass', freq: 900, gain: 0.55 });
        t({ freq: 2800, freqEnd: 1800, dur: 0.05, type: 'square', gain: 0.03, delay: 0.1 });
        break;
      case 'sakura_fire':
        n({ dur: 0.45, type: 'bandpass', freq: 800, freqEnd: 3200, q: 0.8, gain: 0.28, attack: 0.1 });
        [659, 784, 988, 1319].forEach((f, i) => t({ freq: f, freqEnd: f * 0.99, dur: 0.4, type: 'triangle', gain: 0.07, delay: i * 0.06 }));
        break;
      case 'sakura_hit':
        n({ dur: 0.5, type: 'bandpass', freq: 2200, freqEnd: 900, q: 0.7, gain: 0.3 });
        n({ dur: 0.1, type: 'lowpass', freq: 800, gain: 0.45 });
        [1319, 1568, 1976, 2637].forEach((f, i) => t({ freq: f, dur: 0.55, type: 'sine', gain: 0.06, delay: 0.03 + i * 0.07 }));
        break;
      case 'firework_fire':
        n({ dur: 0.35, type: 'highpass', freq: 1500, freqEnd: 4500, gain: 0.45, attack: 0.03 });
        t({ freq: 300, freqEnd: 900, dur: 0.35, type: 'sawtooth', gain: 0.05 });
        t({ freq: 120, freqEnd: 50, dur: 0.14, gain: 0.5 });
        for (let i = 0; i < 8; i++) n({ dur: 0.02, type: 'highpass', freq: 5000, gain: 0.12, delay: 0.05 + i * 0.035 });
        break;
      case 'firework_hit':
        t({ freq: 95, freqEnd: 32, dur: 0.7, gain: 1 });
        n({ dur: 0.6, type: 'lowpass', freq: 2200, freqEnd: 150, gain: 0.9 });
        n({ dur: 0.08, type: 'highpass', freq: 3000, gain: 0.6 });
        for (let i = 0; i < 12; i++) n({ dur: 0.025, type: 'highpass', freq: 4000 + Math.random() * 2000, gain: 0.16, delay: 0.1 + i * 0.045 });
        break;
      case 'firework_crackle':
        for (let i = 0; i < 9; i++) n({ dur: 0.03, type: 'highpass', freq: 3500 + Math.random() * 2500, gain: 0.3, delay: i * 0.03 + Math.random() * 0.02 });
        t({ freq: 150, freqEnd: 55, dur: 0.12, gain: 0.3 });
        break;
      case 'keris_fire':
        n({ dur: 0.18, type: 'highpass', freq: 4000, gain: 0.4 });
        [2349, 3136, 4186].forEach((f, i) => t({ freq: f, dur: 0.6, type: 'triangle', gain: 0.05, delay: i * 0.02 }));
        t({ freq: 220, freqEnd: 200, dur: 0.9, type: 'sine', gain: 0.18 });
        n({ dur: 0.3, type: 'bandpass', freq: 3000, freqEnd: 1200, q: 1, gain: 0.25 });
        break;
      case 'keris_hit':
        n({ dur: 0.1, type: 'lowpass', freq: 1400, freqEnd: 300, gain: 0.8 });
        t({ freq: 150, freqEnd: 60, dur: 0.14, gain: 0.55 });
        t({ freq: 196, dur: 1.1, type: 'sine', gain: 0.2, delay: 0.02 });
        [1568, 2093, 2637].forEach((f, i) => t({ freq: f, dur: 0.8, type: 'triangle', gain: 0.06, delay: 0.03 + i * 0.05 }));
        n({ dur: 0.06, type: 'highpass', freq: 3500, gain: 0.4 });
        break;
      case 'moon_charge':
        t({ freq: 300, freqEnd: 900, dur: 0.24, type: 'sine', gain: 0.14, attack: 0.08 });
        [1175, 1568, 1976].forEach((f, i) => t({ freq: f, dur: 0.3, type: 'sine', gain: 0.04, delay: 0.04 + i * 0.05 }));
        n({ dur: 0.24, type: 'highpass', freq: 4000, freqEnd: 8000, gain: 0.08, attack: 0.1 });
        break;
      case 'moon_fire':
        t({ freq: 700, freqEnd: 260, dur: 0.4, type: 'sine', gain: 0.3 });
        [1568, 2093, 2637].forEach((f, i) => t({ freq: f, dur: 0.45, type: 'triangle', gain: 0.05, delay: i * 0.03 }));
        n({ dur: 0.3, type: 'bandpass', freq: 3000, freqEnd: 1200, q: 1, gain: 0.22 });
        break;
      case 'moon_hit':
        n({ dur: 0.18, type: 'lowpass', freq: 1200, freqEnd: 240, gain: 0.7 });
        t({ freq: 150, freqEnd: 60, dur: 0.18, gain: 0.55 });
        [1319, 1760, 2349, 3136].forEach((f, i) => t({ freq: f, dur: 0.8, type: 'triangle', gain: 0.07, delay: 0.03 + i * 0.06 }));
        n({ dur: 0.5, type: 'highpass', freq: 5000, gain: 0.1, delay: 0.05 });
        break;
      case 'storm_charge':
        t({ freq: 80, freqEnd: 420, dur: 0.24, type: 'sawtooth', gain: 0.08, attack: 0.06 });
        n({ dur: 0.24, type: 'highpass', freq: 3000, freqEnd: 8000, gain: 0.14, attack: 0.08 });
        for (let i = 0; i < 6; i++) n({ dur: 0.02, type: 'highpass', freq: 5000, gain: 0.22, delay: i * 0.04 + Math.random() * 0.02 });
        break;
      case 'storm_fire':
        t({ freq: 900, freqEnd: 200, dur: 0.3, type: 'sawtooth', gain: 0.1 });
        n({ dur: 0.3, type: 'bandpass', freq: 2500, freqEnd: 900, q: 1, gain: 0.35 });
        t({ freq: 160, freqEnd: 60, dur: 0.2, gain: 0.5 });
        break;
      case 'storm_strike':
        n({ dur: 0.12, type: 'highpass', freq: 3000, gain: 1 });
        n({ dur: 1.1, type: 'lowpass', freq: 1800, freqEnd: 60, gain: 1 });
        t({ freq: 70, freqEnd: 26, dur: 0.95, gain: 1.1 });
        for (let i = 0; i < 8; i++) n({ dur: 0.03, type: 'highpass', freq: 3500 + Math.random() * 3000, gain: 0.3, delay: 0.05 + i * 0.05 });
        break;
      case 'pencil_fire':
        n({ dur: 0.14, type: 'bandpass', freq: 2400, freqEnd: 4200, q: 2, gain: 0.4 });
        t({ freq: 600, freqEnd: 900, dur: 0.08, type: 'triangle', gain: 0.1 });
        n({ dur: 0.05, type: 'highpass', freq: 4000, gain: 0.2 });
        break;
      case 'pencil_hit':
        n({ dur: 0.05, type: 'highpass', freq: 2000, gain: 0.6 });
        t({ freq: 250, freqEnd: 120, dur: 0.1, type: 'triangle', gain: 0.5 });
        t({ freq: 340, dur: 0.3, type: 'triangle', gain: 0.05, delay: 0.01 });
        n({ dur: 0.12, type: 'lowpass', freq: 1000, gain: 0.5 });
        break;
      case 'sandal_fire':
        n({ dur: 0.28, type: 'lowpass', freq: 2400, freqEnd: 300, gain: 0.6 });
        n({ dur: 0.2, type: 'bandpass', freq: 900, freqEnd: 2600, q: 1, gain: 0.3 });
        t({ freq: 170, freqEnd: 60, dur: 0.2, gain: 0.6 });
        break;
      case 'sandal_hit':
        n({ dur: 0.05, type: 'highpass', freq: 2500, gain: 0.7 });
        n({ dur: 0.18, type: 'lowpass', freq: 1500, freqEnd: 200, gain: 0.75 });
        t({ freq: 190, freqEnd: 70, dur: 0.16, gain: 0.6 });
        t({ freq: 900, freqEnd: 300, dur: 0.12, type: 'square', gain: 0.04, delay: 0.04 });
        break;
      case 'paint_fire':
        n({ dur: 0.14, type: 'highpass', freq: 3500, gain: 0.5 });
        n({ dur: 0.2, type: 'bandpass', freq: 2500, freqEnd: 1200, q: 1, gain: 0.25 });
        t({ freq: 220, freqEnd: 80, dur: 0.12, gain: 0.35 });
        break;
      case 'paint_hit':
        n({ dur: 0.22, type: 'lowpass', freq: 900, freqEnd: 150, gain: 0.85 });
        n({ dur: 0.2, type: 'bandpass', freq: 1500, freqEnd: 400, q: 2.2, gain: 0.5 });
        t({ freq: 130, freqEnd: 55, dur: 0.18, gain: 0.55 });
        for (let i = 0; i < 3; i++) t({ freq: 420 + Math.random() * 200, freqEnd: 220, dur: 0.06, type: 'sine', gain: 0.09, delay: 0.08 + i * 0.05 });
        break;
      case 'wand_fire':
        [1319, 1568, 1976, 2637].forEach((f, i) => t({ freq: f, freqEnd: f * 1.01, dur: 0.35, type: 'triangle', gain: 0.07, delay: i * 0.05 }));
        n({ dur: 0.3, type: 'bandpass', freq: 3000, freqEnd: 6500, q: 1, gain: 0.14 });
        break;
      case 'wand_hit':
        n({ dur: 0.12, type: 'lowpass', freq: 1200, freqEnd: 300, gain: 0.5 });
        [1568, 1976, 2637, 3136, 3951].forEach((f, i) => t({ freq: f, dur: 0.6, type: 'triangle', gain: 0.06, delay: i * 0.05 }));
        n({ dur: 0.5, type: 'highpass', freq: 5500, gain: 0.12, delay: 0.04 });
        break;
      case 'shark_fire':
        n({ dur: 0.4, type: 'bandpass', freq: 800, freqEnd: 2800, q: 0.8, gain: 0.45, attack: 0.03 });
        t({ freq: 220, freqEnd: 90, dur: 0.25, gain: 0.45 });
        n({ dur: 0.1, type: 'highpass', freq: 3500, gain: 0.25 });
        break;
      case 'shark_hit':
        n({ dur: 0.05, type: 'highpass', freq: 2500, gain: 0.7 });
        t({ freq: 150, freqEnd: 60, dur: 0.1, gain: 0.7 });
        n({ dur: 0.05, type: 'highpass', freq: 2800, gain: 0.65, delay: 0.1 });
        t({ freq: 120, freqEnd: 50, dur: 0.12, gain: 0.65, delay: 0.1 });
        n({ dur: 0.45, type: 'bandpass', freq: 1600, freqEnd: 400, q: 0.8, gain: 0.6, delay: 0.06 });
        break;
      case 'ghost_fire':
        for (let i = 0; i < 3; i++) t({ freq: 520 + i * 3, freqEnd: 260 + i * 2, dur: 0.5, type: 'sine', gain: 0.08, delay: i * 0.01 });
        t({ freq: 6, freqEnd: 6, dur: 0.1, gain: 0.0001 });
        n({ dur: 0.5, type: 'bandpass', freq: 1200, freqEnd: 500, q: 1.4, gain: 0.25 });
        break;
      case 'ghost_hit':
        for (let i = 0; i < 3; i++) t({ freq: 900 + i * 4, freqEnd: 380 + i * 3, dur: 0.7, type: 'sine', gain: 0.1, delay: i * 0.012 });
        n({ dur: 0.6, type: 'lowpass', freq: 1400, freqEnd: 200, gain: 0.5 });
        n({ dur: 0.4, type: 'highpass', freq: 5000, gain: 0.1 });
        break;
      case 'ufo_fire':
        t({ freq: 300, freqEnd: 1300, dur: 0.22, type: 'sine', gain: 0.22 });
        t({ freq: 1900, freqEnd: 900, dur: 0.25, type: 'sawtooth', gain: 0.05 });
        n({ dur: 0.25, type: 'bandpass', freq: 2200, freqEnd: 900, q: 2, gain: 0.2 });
        break;
      case 'ufo_hit':
        for (let i = 0; i < 6; i++) t({ freq: i % 2 ? 1000 : 780, dur: 0.1, type: 'sine', gain: 0.1, delay: i * 0.09 });
        n({ dur: 0.5, type: 'highpass', freq: 3000, freqEnd: 7000, gain: 0.1 });
        t({ freq: 120, freqEnd: 60, dur: 0.2, gain: 0.45 });
        break;
      case 'rainbow_fire':
        [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => t({ freq: f, dur: 0.3, type: 'triangle', gain: 0.07, delay: i * 0.035 }));
        n({ dur: 0.2, type: 'highpass', freq: 5000, gain: 0.12 });
        break;
      case 'rainbow_hit':
        n({ dur: 0.12, type: 'lowpass', freq: 1400, freqEnd: 300, gain: 0.5 });
        [784, 988, 1175, 1568, 1976, 2349, 3136].forEach((f, i) => t({ freq: f, dur: 0.5, type: 'triangle', gain: 0.07, delay: i * 0.04 }));
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'highpass', freq: 5000 + Math.random() * 3000, gain: 0.14, delay: 0.1 + i * 0.05 });
        break;
      case 'meteor_charge':
        t({ freq: 50, freqEnd: 170, dur: 0.32, type: 'sawtooth', gain: 0.12, attack: 0.12 });
        n({ dur: 0.32, type: 'lowpass', freq: 400, freqEnd: 1400, gain: 0.35, attack: 0.15 });
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'highpass', freq: 3000, gain: 0.2, delay: 0.05 + i * 0.045 });
        break;
      case 'meteor_fire':
        t({ freq: 85, freqEnd: 28, dur: 0.8, gain: 1.1 });
        n({ dur: 0.9, type: 'lowpass', freq: 2600, freqEnd: 120, gain: 1 });
        n({ dur: 0.08, type: 'highpass', freq: 2500, gain: 0.5 });
        break;
      case 'meteor_hit':
        t({ freq: 55, freqEnd: 22, dur: 1.3, gain: 1.2 });
        n({ dur: 1.1, type: 'lowpass', freq: 2000, freqEnd: 60, gain: 1 });
        n({ dur: 0.2, type: 'highpass', freq: 2500, gain: 0.55 });
        for (let i = 0; i < 9; i++) n({ dur: 0.06, type: 'bandpass', freq: 700 + Math.random() * 2200, q: 1.5, gain: 0.3, delay: 0.1 + i * 0.06 });
        break;
      case 'diamond_fire':
        n({ dur: 0.12, type: 'highpass', freq: 5000, gain: 0.3 });
        [3136, 4186, 5274].forEach((f, i) => t({ freq: f, dur: 0.4, type: 'triangle', gain: 0.05, delay: i * 0.02 }));
        t({ freq: 1200, freqEnd: 1500, dur: 0.2, type: 'sine', gain: 0.12 });
        break;
      case 'diamond_hit':
        n({ dur: 0.08, type: 'lowpass', freq: 1400, freqEnd: 300, gain: 0.6 });
        t({ freq: 160, freqEnd: 60, dur: 0.12, gain: 0.45 });
        for (let i = 0; i < 9; i++) n({ dur: 0.04, type: 'highpass', freq: 4000 + Math.random() * 5000, gain: 0.3, delay: i * 0.03 + Math.random() * 0.02 });
        [2093, 2637, 3136, 4186].forEach((f, i) => t({ freq: f, dur: 0.6, type: 'triangle', gain: 0.06, delay: 0.03 + i * 0.05 }));
        break;
      case 'fish_fire':
        n({ dur: 0.3, type: 'bandpass', freq: 900, freqEnd: 2800, q: 0.8, gain: 0.45, attack: 0.03 });
        t({ freq: 300, freqEnd: 640, dur: 0.12, type: 'sine', gain: 0.2 });
        t({ freq: 700, freqEnd: 300, dur: 0.14, type: 'triangle', gain: 0.12, delay: 0.08 });
        n({ dur: 0.1, type: 'highpass', freq: 3500, gain: 0.2 });
        break;
      case 'fish_hit':
        n({ dur: 0.08, type: 'highpass', freq: 2200, gain: 0.6 });
        t({ freq: 170, freqEnd: 60, dur: 0.12, gain: 0.6 });
        n({ dur: 0.5, type: 'bandpass', freq: 1600, freqEnd: 420, q: 0.8, gain: 0.65, delay: 0.03 });
        t({ freq: 520, freqEnd: 260, dur: 0.14, type: 'sine', gain: 0.12, delay: 0.1 });
        break;
      case 'rpg_fire':
        n({ dur: 0.55, type: 'lowpass', freq: 2800, freqEnd: 300, gain: 0.85 });
        t({ freq: 130, freqEnd: 42, dur: 0.4, gain: 0.8 });
        n({ dur: 0.6, type: 'bandpass', freq: 700, freqEnd: 2200, q: 0.7, gain: 0.35, delay: 0.1, attack: 0.1 });
        n({ dur: 0.08, type: 'highpass', freq: 2500, gain: 0.5 });
        break;
      case 'rpg_hit':
        t({ freq: 72, freqEnd: 26, dur: 1.0, gain: 1.1 });
        n({ dur: 0.9, type: 'lowpass', freq: 2400, freqEnd: 90, gain: 1 });
        n({ dur: 0.12, type: 'highpass', freq: 2500, gain: 0.5 });
        for (let i = 0; i < 6; i++) n({ dur: 0.05, type: 'bandpass', freq: 800 + Math.random() * 2400, q: 1.5, gain: 0.25, delay: 0.1 + i * 0.05 });
        break;
      case 'cricket_fire':
        t({ freq: 1200, freqEnd: 220, dur: 0.22, type: 'sawtooth', gain: 0.12 });
        t({ freq: 3400, freqEnd: 3200, dur: 0.06, type: 'sine', gain: 0.06 });
        t({ freq: 3600, freqEnd: 3400, dur: 0.06, type: 'sine', gain: 0.06, delay: 0.08 });
        n({ dur: 0.25, type: 'bandpass', freq: 2200, freqEnd: 600, q: 1.2, gain: 0.4 });
        t({ freq: 160, freqEnd: 50, dur: 0.3, gain: 0.8 });
        break;
      case 'cricket_hit':
        t({ freq: 62, freqEnd: 24, dur: 1.1, gain: 1.2 });
        n({ dur: 0.9, type: 'lowpass', freq: 2000, freqEnd: 80, gain: 1 });
        t({ freq: 1500, freqEnd: 200, dur: 0.5, type: 'sawtooth', gain: 0.1 });
        n({ dur: 0.1, type: 'highpass', freq: 3000, gain: 0.5 });
        [3300, 3500, 3300].forEach((f, i) => t({ freq: f, dur: 0.07, type: 'sine', gain: 0.06, delay: 0.3 + i * 0.1 }));
        break;
      case 'electro_fire':
        n({ dur: 0.3, type: 'highpass', freq: 2500, freqEnd: 6000, gain: 0.35 });
        t({ freq: 240, freqEnd: 900, dur: 0.2, type: 'sawtooth', gain: 0.1 });
        for (let i = 0; i < 6; i++) n({ dur: 0.02, type: 'highpass', freq: 5000, gain: 0.25, delay: i * 0.035 + Math.random() * 0.02 });
        t({ freq: 140, freqEnd: 60, dur: 0.18, gain: 0.5 });
        break;
      case 'electro_hit':
        n({ dur: 0.08, type: 'highpass', freq: 3000, gain: 0.8 });
        n({ dur: 0.4, type: 'lowpass', freq: 1800, freqEnd: 150, gain: 0.7 });
        t({ freq: 110, freqEnd: 40, dur: 0.3, gain: 0.7 });
        for (let i = 0; i < 9; i++) n({ dur: 0.03, type: 'highpass', freq: 3500 + Math.random() * 3000, gain: 0.3, delay: 0.03 + i * 0.04 });
        break;
      case 'electro_chain':
        n({ dur: 0.12, type: 'highpass', freq: 4000, gain: 0.5 });
        t({ freq: 1800, freqEnd: 400, dur: 0.12, type: 'sawtooth', gain: 0.05 });
        for (let i = 0; i < 4; i++) n({ dur: 0.02, type: 'highpass', freq: 5000, gain: 0.2, delay: i * 0.03 });
        break;
      case 'bazooka_fire':
        t({ freq: 100, freqEnd: 30, dur: 0.6, gain: 1 });
        n({ dur: 0.75, type: 'lowpass', freq: 2600, freqEnd: 200, gain: 0.9 });
        n({ dur: 0.8, type: 'bandpass', freq: 600, freqEnd: 2000, q: 0.6, gain: 0.35, delay: 0.12, attack: 0.15 });
        n({ dur: 0.08, type: 'highpass', freq: 2500, gain: 0.5 });
        break;
      case 'bazooka_hit':
        t({ freq: 58, freqEnd: 22, dur: 1.4, gain: 1.2 });
        n({ dur: 1.2, type: 'lowpass', freq: 2200, freqEnd: 60, gain: 1 });
        n({ dur: 0.18, type: 'highpass', freq: 2500, gain: 0.55 });
        for (let i = 0; i < 9; i++) n({ dur: 0.06, type: 'bandpass', freq: 700 + Math.random() * 2000, q: 1.5, gain: 0.3, delay: 0.1 + i * 0.06 });
        break;
      case 'freeze_fire':
        t({ freq: 900, freqEnd: 2400, dur: 0.35, type: 'sine', gain: 0.1, attack: 0.1 });
        n({ dur: 0.5, type: 'highpass', freq: 3000, freqEnd: 8000, gain: 0.22, attack: 0.1 });
        n({ dur: 0.4, type: 'bandpass', freq: 3500, q: 1.2, gain: 0.2 });
        break;
      case 'freeze_hit':
        for (let i = 0; i < 12; i++) n({ dur: 0.03, type: 'highpass', freq: 4000 + Math.random() * 4000, gain: 0.28, delay: i * 0.035 });
        n({ dur: 0.3, type: 'lowpass', freq: 1400, freqEnd: 300, gain: 0.5 });
        [2349, 3136, 3951, 4699].forEach((f, i) => t({ freq: f, dur: 0.7, type: 'triangle', gain: 0.07, delay: 0.03 + i * 0.05 }));
        t({ freq: 140, freqEnd: 60, dur: 0.18, gain: 0.5 });
        break;
      case 'rail_charge':
        t({ freq: 200, freqEnd: 2200, dur: 0.32, type: 'sine', gain: 0.14, attack: 0.1 });
        t({ freq: 100, freqEnd: 1100, dur: 0.32, type: 'sawtooth', gain: 0.05, attack: 0.1 });
        for (let i = 0; i < 7; i++) n({ dur: 0.02, type: 'bandpass', freq: 1800 + i * 300, q: 3, gain: 0.25, delay: i * 0.042 });
        break;
      case 'rail_fire':
        n({ dur: 0.1, type: 'highpass', freq: 2500, gain: 1 });
        t({ freq: 2400, freqEnd: 120, dur: 0.35, type: 'sawtooth', gain: 0.12 });
        t({ freq: 90, freqEnd: 28, dur: 0.6, gain: 1.1 });
        n({ dur: 0.5, type: 'lowpass', freq: 3000, freqEnd: 150, gain: 0.8 });
        break;
      case 'rail_hit':
        n({ dur: 0.07, type: 'highpass', freq: 3000, gain: 0.8 });
        t({ freq: 70, freqEnd: 26, dur: 0.8, gain: 1 });
        n({ dur: 0.6, type: 'lowpass', freq: 1800, freqEnd: 100, gain: 0.8 });
        for (let i = 0; i < 8; i++) n({ dur: 0.03, type: 'highpass', freq: 3500 + Math.random() * 3500, gain: 0.25, delay: 0.04 + i * 0.04 });
        break;
      case 'magnet_fire':
        t({ freq: 110, freqEnd: 260, dur: 0.3, type: 'sine', gain: 0.35, attack: 0.04 });
        t({ freq: 111, freqEnd: 262, dur: 0.3, type: 'sawtooth', gain: 0.05 });
        n({ dur: 0.25, type: 'bandpass', freq: 1200, freqEnd: 2600, q: 1.5, gain: 0.2 });
        break;
      case 'magnet_hit':
        n({ dur: 0.07, type: 'highpass', freq: 2500, gain: 0.6 });
        t({ freq: 220, freqEnd: 90, dur: 0.12, type: 'triangle', gain: 0.5 });
        t({ freq: 420, dur: 0.4, type: 'triangle', gain: 0.07, delay: 0.01 });
        for (let i = 0; i < 12; i++) n({ dur: 0.02, type: 'highpass', freq: 3000 + Math.random() * 3000, gain: 0.18, delay: 0.1 + i * 0.03 });
        break;
      case 'shrink_fire':
        t({ freq: 1900, freqEnd: 360, dur: 0.3, type: 'sine', gain: 0.16 });
        t({ freq: 2400, freqEnd: 500, dur: 0.3, type: 'triangle', gain: 0.05 });
        n({ dur: 0.2, type: 'bandpass', freq: 3500, freqEnd: 1200, q: 2, gain: 0.15 });
        break;
      case 'shrink_hit':
        t({ freq: 1600, freqEnd: 180, dur: 0.5, type: 'sine', gain: 0.18 });
        n({ dur: 0.14, type: 'lowpass', freq: 1200, freqEnd: 300, gain: 0.5 });
        t({ freq: 160, freqEnd: 70, dur: 0.14, gain: 0.45 });
        [1568, 1175, 784].forEach((f, i) => t({ freq: f, dur: 0.25, type: 'triangle', gain: 0.06, delay: 0.25 + i * 0.07 }));
        break;
      case 'grow_fire':
        t({ freq: 300, freqEnd: 1900, dur: 0.3, type: 'sine', gain: 0.16 });
        t({ freq: 500, freqEnd: 2400, dur: 0.3, type: 'triangle', gain: 0.05 });
        n({ dur: 0.2, type: 'bandpass', freq: 1200, freqEnd: 3500, q: 2, gain: 0.15 });
        break;
      case 'grow_hit':
        t({ freq: 180, freqEnd: 1700, dur: 0.5, type: 'sine', gain: 0.18 });
        n({ dur: 0.14, type: 'lowpass', freq: 1200, freqEnd: 300, gain: 0.5 });
        t({ freq: 160, freqEnd: 70, dur: 0.14, gain: 0.45 });
        [784, 1175, 1568].forEach((f, i) => t({ freq: f, dur: 0.25, type: 'triangle', gain: 0.06, delay: 0.25 + i * 0.07 }));
        break;
      case 'pirate_fire':
        t({ freq: 90, freqEnd: 28, dur: 0.8, gain: 1.15 });
        n({ dur: 0.9, type: 'lowpass', freq: 2600, freqEnd: 130, gain: 1 });
        n({ dur: 0.1, type: 'bandpass', freq: 1500, q: 0.6, gain: 0.7 });
        break;
      case 'pirate_hit':
        t({ freq: 62, freqEnd: 24, dur: 1.1, gain: 1.15 });
        n({ dur: 0.9, type: 'lowpass', freq: 2000, freqEnd: 80, gain: 1 });
        n({ dur: 0.16, type: 'highpass', freq: 2500, gain: 0.5 });
        [2093, 2637, 3136, 2637, 3520].forEach((f, i) => t({ freq: f, dur: 0.18, type: 'triangle', gain: 0.07, delay: 0.15 + i * 0.07 }));
        break;
      case 'card_fire':
        n({ dur: 0.1, type: 'bandpass', freq: 3500, freqEnd: 6000, q: 2, gain: 0.35 });
        t({ freq: 1800, freqEnd: 2600, dur: 0.06, type: 'triangle', gain: 0.07 });
        n({ dur: 0.05, type: 'highpass', freq: 4500, gain: 0.2, delay: 0.05 });
        break;
      case 'card_hit':
        n({ dur: 0.05, type: 'highpass', freq: 2200, gain: 0.6 });
        t({ freq: 260, freqEnd: 130, dur: 0.09, type: 'triangle', gain: 0.45 });
        t({ freq: 420, dur: 0.3, type: 'triangle', gain: 0.05, delay: 0.01 });
        for (let i = 0; i < 5; i++) n({ dur: 0.03, type: 'bandpass', freq: 3500 + Math.random() * 2000, q: 2, gain: 0.2, delay: 0.06 + i * 0.03 });
        break;
      case 'holy_fire':
        [1319, 1568, 1976, 2637].forEach((f, i) => t({ freq: f, dur: 0.5, type: 'sine', gain: 0.07, delay: i * 0.05 }));
        n({ dur: 0.4, type: 'highpass', freq: 4500, freqEnd: 8000, gain: 0.14, attack: 0.08 });
        t({ freq: 330, freqEnd: 220, dur: 0.3, type: 'sine', gain: 0.25 });
        break;
      case 'holy_hit':
        n({ dur: 0.2, type: 'lowpass', freq: 1400, freqEnd: 260, gain: 0.7 });
        t({ freq: 130, freqEnd: 55, dur: 0.18, gain: 0.5 });
        [523, 659, 784, 1047, 1319].forEach((f, i) => { t({ freq: f, dur: 1.1, type: 'sine', gain: 0.09, delay: 0.02 + i * 0.06 }); t({ freq: f * 2, dur: 0.8, type: 'triangle', gain: 0.03, delay: 0.02 + i * 0.06 }); });
        n({ dur: 0.7, type: 'highpass', freq: 5000, gain: 0.1, delay: 0.05 });
        break;
      case 'unicorn_fire':
        [784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => t({ freq: f, dur: 0.3, type: 'triangle', gain: 0.07, delay: i * 0.035 }));
        n({ dur: 0.2, type: 'highpass', freq: 5000, gain: 0.12 });
        break;
      case 'unicorn_hit':
        n({ dur: 0.12, type: 'lowpass', freq: 1300, freqEnd: 300, gain: 0.55 });
        t({ freq: 150, freqEnd: 60, dur: 0.12, gain: 0.4 });
        [659, 784, 988, 1319, 1568, 1976, 2637].forEach((f, i) => t({ freq: f, dur: 0.5, type: 'triangle', gain: 0.07, delay: 0.02 + i * 0.045 }));
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'highpass', freq: 5000 + Math.random() * 3000, gain: 0.14, delay: 0.1 + i * 0.05 });
        break;
      case 'obl_charge':
        t({ freq: 50, freqEnd: 190, dur: 0.3, type: 'sawtooth', gain: 0.12, attack: 0.12 });
        n({ dur: 0.3, type: 'lowpass', freq: 400, freqEnd: 1600, gain: 0.3, attack: 0.15 });
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'highpass', freq: 3500, gain: 0.18, delay: 0.05 + i * 0.04 });
        break;
      case 'obl_fire':
        t({ freq: 110, freqEnd: 34, dur: 0.6, gain: 0.9 });
        n({ dur: 0.7, type: 'lowpass', freq: 2200, freqEnd: 160, gain: 0.8 });
        n({ dur: 0.4, type: 'bandpass', freq: 600, freqEnd: 1800, q: 1.6, gain: 0.3, delay: 0.1 });
        break;
      case 'obl_hit':
        t({ freq: 56, freqEnd: 22, dur: 1.2, gain: 1.1 });
        n({ dur: 1.0, type: 'lowpass', freq: 1800, freqEnd: 70, gain: 0.95 });
        for (let i = 0; i < 9; i++) n({ dur: 0.07, type: 'bandpass', freq: 500 + Math.random() * 1200, q: 3, gain: 0.25, delay: 0.1 + i * 0.07 });
        t({ freq: 220, freqEnd: 80, dur: 0.6, type: 'sawtooth', gain: 0.1 });
        break;
      case 'coin_fire':
        [2093, 2637].forEach((f, i) => t({ freq: f, dur: 0.35, type: 'triangle', gain: 0.1, delay: i * 0.05 }));
        n({ dur: 0.1, type: 'highpass', freq: 4000, gain: 0.3 });
        t({ freq: 200, freqEnd: 90, dur: 0.12, gain: 0.35 });
        break;
      case 'coin_hit':
        n({ dur: 0.06, type: 'highpass', freq: 2500, gain: 0.5 });
        t({ freq: 190, freqEnd: 80, dur: 0.1, gain: 0.45 });
        [1976, 2637, 3136, 2637, 3951].forEach((f, i) => t({ freq: f, dur: 0.35, type: 'triangle', gain: 0.09, delay: i * 0.06 }));
        break;
      case 'saber_fire':
        t({ freq: 90, freqEnd: 300, dur: 0.18, type: 'sawtooth', gain: 0.1 });
        n({ dur: 0.22, type: 'bandpass', freq: 1200, freqEnd: 3800, q: 1.2, gain: 0.45, attack: 0.02 });
        t({ freq: 880, freqEnd: 220, dur: 0.25, type: 'sine', gain: 0.1 });
        break;
      case 'saber_hit':
        n({ dur: 0.18, type: 'bandpass', freq: 3000, freqEnd: 800, q: 1, gain: 0.6 });
        t({ freq: 130, freqEnd: 55, dur: 0.14, gain: 0.5 });
        t({ freq: 330, freqEnd: 120, dur: 0.4, type: 'sawtooth', gain: 0.07 });
        for (let i = 0; i < 6; i++) n({ dur: 0.03, type: 'highpass', freq: 4000 + Math.random() * 3000, gain: 0.2, delay: 0.04 + i * 0.03 });
        break;
      case 'gauntlet_fire':
        n({ dur: 0.35, type: 'bandpass', freq: 300, freqEnd: 1800, q: 0.8, gain: 0.5 });
        t({ freq: 90, freqEnd: 40, dur: 0.25, gain: 0.7 });
        n({ dur: 0.06, type: 'highpass', freq: 3000, gain: 0.5 });
        t({ freq: 200, freqEnd: 120, dur: 0.12, type: 'square', gain: 0.06, delay: 0.04 });
        break;
      case 'gauntlet_hit':
        t({ freq: 52, freqEnd: 20, dur: 1.0, gain: 1.2 });
        n({ dur: 0.8, type: 'lowpass', freq: 1800, freqEnd: 80, gain: 1 });
        n({ dur: 0.1, type: 'highpass', freq: 2200, gain: 0.7 });
        t({ freq: 180, freqEnd: 60, dur: 0.2, type: 'square', gain: 0.1 });
        for (let i = 0; i < 6; i++) n({ dur: 0.05, type: 'bandpass', freq: 800 + Math.random() * 2200, q: 3, gain: 0.3, delay: 0.1 + i * 0.05 });
        break;
      case 'ruby_fire':
        n({ dur: 0.18, type: 'lowpass', freq: 3200, freqEnd: 400, gain: 0.7 });
        t({ freq: 160, freqEnd: 55, dur: 0.16, gain: 0.6 });
        [2637, 3136].forEach((f, i) => t({ freq: f, dur: 0.3, type: 'triangle', gain: 0.05, delay: 0.02 + i * 0.04 }));
        t({ freq: 900, dur: 0.03, type: 'square', gain: 0.05, delay: 0.1 });
        break;
      case 'ruby_hit':
        n({ dur: 0.08, type: 'highpass', freq: 2500, gain: 0.5 });
        t({ freq: 170, freqEnd: 70, dur: 0.12, gain: 0.5 });
        for (let i = 0; i < 8; i++) t({ freq: 2000 + Math.random() * 2500, dur: 0.12, type: 'triangle', gain: 0.07, delay: i * 0.035 });
        break;
      case 'emerald_charge':
        t({ freq: 300, freqEnd: 2000, dur: 0.24, type: 'sine', gain: 0.12, attack: 0.08 });
        n({ dur: 0.24, type: 'highpass', freq: 4000, freqEnd: 8000, gain: 0.08, attack: 0.1 });
        break;
      case 'emerald_fire':
        t({ freq: 1800, freqEnd: 700, dur: 0.4, type: 'sawtooth', gain: 0.08 });
        t({ freq: 900, freqEnd: 340, dur: 0.45, type: 'sine', gain: 0.3 });
        n({ dur: 0.35, type: 'bandpass', freq: 3000, freqEnd: 1200, q: 0.9, gain: 0.28 });
        break;
      case 'emerald_hit':
        for (let i = 0; i < 10; i++) n({ dur: 0.04, type: 'bandpass', freq: 1800 + Math.random() * 3500, q: 3, gain: 0.2, delay: i * 0.04 });
        [1568, 2093, 2637].forEach((f, i) => t({ freq: f, dur: 0.7, type: 'triangle', gain: 0.07, delay: 0.05 + i * 0.07 }));
        n({ dur: 0.3, type: 'lowpass', freq: 1200, freqEnd: 200, gain: 0.45 });
        break;
      case 'sapphire_fire':
        n({ dur: 0.5, type: 'lowpass', freq: 3200, freqEnd: 200, gain: 1 });
        n({ dur: 0.07, type: 'bandpass', freq: 3500, q: 0.7, gain: 0.6 });
        t({ freq: 100, freqEnd: 32, dur: 0.4, gain: 1 });
        [3136, 3951].forEach((f, i) => t({ freq: f, dur: 0.4, type: 'triangle', gain: 0.04, delay: 0.03 + i * 0.04 }));
        break;
      case 'sapphire_hit':
        for (let i = 0; i < 6; i++) n({ dur: 0.05, type: 'bandpass', freq: 1200 + Math.random() * 2400, q: 1.5, gain: 0.3, delay: i * 0.012 });
        n({ dur: 0.16, type: 'lowpass', freq: 900, gain: 0.7 });
        t({ freq: 150, freqEnd: 60, dur: 0.14, gain: 0.55 });
        for (let i = 0; i < 4; i++) t({ freq: 2200 + Math.random() * 2000, dur: 0.15, type: 'triangle', gain: 0.06, delay: 0.04 + i * 0.04 });
        break;
      case 'crystal_fire':
        t({ freq: 140, freqEnd: 60, dur: 0.3, gain: 0.55 });
        [1319, 1760, 2349].forEach((f, i) => t({ freq: f, dur: 0.55, type: 'triangle', gain: 0.07, delay: i * 0.04 }));
        n({ dur: 0.25, type: 'bandpass', freq: 3000, freqEnd: 1500, q: 1.5, gain: 0.25 });
        break;
      case 'crystal_hit':
        n({ dur: 0.1, type: 'highpass', freq: 2500, gain: 0.6 });
        t({ freq: 150, freqEnd: 60, dur: 0.16, gain: 0.5 });
        for (let i = 0; i < 10; i++) t({ freq: 1500 + Math.random() * 3000, dur: 0.25, type: 'triangle', gain: 0.06, delay: i * 0.04 });
        [1047, 1319, 1568].forEach((f, i) => t({ freq: f, dur: 0.9, type: 'sine', gain: 0.07, delay: 0.1 + i * 0.06 }));
        break;
      case 'beerifle_fire':
        for (let i = 0; i < 4; i++) t({ freq: 220 + i * 18, freqEnd: 260 + i * 12, dur: 0.35, type: 'sawtooth', gain: 0.045, delay: i * 0.012 });
        n({ dur: 0.18, type: 'bandpass', freq: 2200, q: 2.5, gain: 0.3 });
        n({ dur: 0.1, type: 'lowpass', freq: 900, gain: 0.5 });
        t({ freq: 150, freqEnd: 60, dur: 0.14, gain: 0.45 });
        break;
      case 'beerifle_hit':
        n({ dur: 0.06, type: 'highpass', freq: 2200, gain: 0.5 });
        t({ freq: 190, freqEnd: 90, dur: 0.1, gain: 0.4 });
        for (let i = 0; i < 5; i++) t({ freq: 190 + i * 24, freqEnd: 260 + i * 10, dur: 0.5, type: 'sawtooth', gain: 0.045, delay: 0.04 + i * 0.02 });
        n({ dur: 0.5, type: 'bandpass', freq: 2600, q: 3, gain: 0.15, delay: 0.04 });
        break;
      case 'charge_charge':
        t({ freq: 300, freqEnd: 1600, dur: 0.1, type: 'sine', gain: 0.14, attack: 0.03 });
        n({ dur: 0.1, type: 'highpass', freq: 3000, freqEnd: 7000, gain: 0.1 });
        break;
      case 'charge_fire':
        t({ freq: 1400, freqEnd: 180, dur: 0.22, type: 'sawtooth', gain: 0.1 });
        t({ freq: 220, freqEnd: 60, dur: 0.2, gain: 0.55 });
        n({ dur: 0.2, type: 'bandpass', freq: 2400, freqEnd: 800, q: 1, gain: 0.3 });
        break;
      case 'charge_hit':
        n({ dur: 0.35, type: 'lowpass', freq: 2400, freqEnd: 200, gain: 0.8 });
        t({ freq: 90, freqEnd: 30, dur: 0.5, gain: 0.8 });
        t({ freq: 1200, freqEnd: 300, dur: 0.3, type: 'sawtooth', gain: 0.06 });
        n({ dur: 0.08, type: 'highpass', freq: 3000, gain: 0.4 });
        break;
      case 'pulse_fire':
        for (let i = 0; i < 3; i++) { t({ freq: 1500, freqEnd: 400, dur: 0.06, type: 'square', gain: 0.07, delay: i * 0.05 }); n({ dur: 0.04, type: 'highpass', freq: 3500, gain: 0.25, delay: i * 0.05 }); }
        t({ freq: 150, freqEnd: 70, dur: 0.15, gain: 0.4 });
        break;
      case 'pulse_hit':
        for (let i = 0; i < 3; i++) { t({ freq: 180, freqEnd: 70, dur: 0.12, gain: 0.5, delay: i * 0.07 }); n({ dur: 0.07, type: 'bandpass', freq: 2200, q: 2, gain: 0.4, delay: i * 0.07 }); t({ freq: 900, freqEnd: 400, dur: 0.1, type: 'sine', gain: 0.06, delay: i * 0.07 }); }
        break;
      case 'cryo_fire':
        n({ dur: 0.45, type: 'highpass', freq: 2500, freqEnd: 7000, gain: 0.3, attack: 0.03 });
        n({ dur: 0.3, type: 'bandpass', freq: 2200, q: 1, gain: 0.25 });
        t({ freq: 220, freqEnd: 100, dur: 0.14, gain: 0.35 });
        break;
      case 'cryo_hit':
        for (let i = 0; i < 10; i++) n({ dur: 0.03, type: 'highpass', freq: 4000 + Math.random() * 4000, gain: 0.25, delay: i * 0.03 });
        n({ dur: 0.2, type: 'lowpass', freq: 1300, freqEnd: 300, gain: 0.5 });
        [2349, 3136, 3951].forEach((f, i) => t({ freq: f, dur: 0.6, type: 'triangle', gain: 0.06, delay: 0.03 + i * 0.05 }));
        t({ freq: 140, freqEnd: 60, dur: 0.14, gain: 0.45 });
        break;
      case 'hyper_fire':
        t({ freq: 200, freqEnd: 3000, dur: 0.22, type: 'sine', gain: 0.14 });
        t({ freq: 100, freqEnd: 1500, dur: 0.22, type: 'sawtooth', gain: 0.05 });
        n({ dur: 0.25, type: 'highpass', freq: 2500, freqEnd: 8000, gain: 0.3 });
        n({ dur: 0.08, type: 'lowpass', freq: 1500, gain: 0.5 });
        break;
      case 'hyper_hit':
        n({ dur: 0.1, type: 'highpass', freq: 3000, gain: 0.6 });
        t({ freq: 3000, freqEnd: 140, dur: 0.4, type: 'sine', gain: 0.12 });
        t({ freq: 80, freqEnd: 28, dur: 0.6, gain: 0.8 });
        n({ dur: 0.5, type: 'lowpass', freq: 2200, freqEnd: 120, gain: 0.6 });
        break;
      case 'quantum_fire':
        for (let i = 0; i < 3; i++) t({ freq: 440 * (1 + i * 0.5), freqEnd: 220 * (1 + i * 0.4), dur: 0.3, type: 'square', gain: 0.04, delay: i * 0.03 });
        for (let i = 0; i < 6; i++) n({ dur: 0.02, type: 'bandpass', freq: 1000 + Math.random() * 3000, q: 4, gain: 0.2, delay: i * 0.03 });
        t({ freq: 160, freqEnd: 60, dur: 0.2, gain: 0.45 });
        break;
      case 'quantum_hit':
        t({ freq: 90, freqEnd: 26, dur: 0.9, gain: 0.9 });
        n({ dur: 0.6, type: 'lowpass', freq: 1600, freqEnd: 90, gain: 0.7 });
        for (let i = 0; i < 12; i++) { n({ dur: 0.025, type: 'bandpass', freq: 800 + Math.random() * 4000, q: 5, gain: 0.25, delay: i * 0.04 }); if (i % 3 === 0) t({ freq: 200 + Math.random() * 1200, dur: 0.05, type: 'square', gain: 0.05, delay: i * 0.04 }); }
        break;
      case 'wars_fire':
        t({ freq: 2400, freqEnd: 200, dur: 0.16, type: 'sawtooth', gain: 0.14 });
        t({ freq: 3000, freqEnd: 500, dur: 0.1, type: 'square', gain: 0.05 });
        n({ dur: 0.08, type: 'highpass', freq: 3500, gain: 0.35 });
        t({ freq: 150, freqEnd: 70, dur: 0.1, gain: 0.35 });
        break;
      case 'wars_hit':
        n({ dur: 0.1, type: 'highpass', freq: 3000, gain: 0.5 });
        t({ freq: 1800, freqEnd: 300, dur: 0.2, type: 'sawtooth', gain: 0.07 });
        n({ dur: 0.16, type: 'lowpass', freq: 1200, freqEnd: 200, gain: 0.5 });
        t({ freq: 140, freqEnd: 60, dur: 0.12, gain: 0.4 });
        for (let i = 0; i < 4; i++) n({ dur: 0.03, type: 'highpass', freq: 4000 + Math.random() * 2000, gain: 0.18, delay: 0.05 + i * 0.04 });
        break;
      case 'clear':
        n({ dur: 0.6, type: 'lowpass', freq: 1400, freqEnd: 120, gain: 0.95 });
        t({ freq: 110, freqEnd: 40, dur: 0.4, gain: 0.6 });
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => t({ freq: f, dur: 0.35, type: 'triangle', gain: 0.12, delay: 0.25 + i * 0.09 }));
        break;
    }
  }
}

export const sfx = new SFX();
