import { storage } from '../games/gunhit/game/safeStorage';

interface ToneOptions {
  at: number;
  frequency: number;
  duration: number;
  gain: number;
  attack?: number;
  pan?: number;
  wet?: number;
  felt?: boolean;
}

interface Voice {
  source: AudioScheduledSourceNode;
  gate: GainNode;
  nodes: AudioNode[];
}

const NOTES = {
  c4: 261.6256,
  e4: 329.6276,
  g4: 391.9954,
  c5: 523.2511,
  e5: 659.2551,
  c6: 1046.5023,
};

const SOUND_PREF_KEY = 'sans-sound-v2';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

// Four C-major landing taps (Do-Mi-Sol-Do), a gentle release, and one star-bell strike for the wink.
// Ported directly from 2d-game-intro-animation (1).zip ("Mochi Garden" audio engine).
export class JuicyAudioEngine {
  private ctx: BaseAudioContext | null = null;
  private input: GainNode | null = null;
  private room: ConvolverNode | null = null;
  private scene: GainNode | null = null;
  private master: GainNode | null = null;
  private feltWave: PeriodicWave | null = null;
  private foamBuffer: AudioBuffer | null = null;
  public readonly voices = new Set<Voice>();
  private recentCues = new Map<string, number>();
  private resumePromise: Promise<boolean> | null = null;
  private offline = false;
  private randomSeed = 2107;
  private soundEnabled = true;
  private soundVolume = 0.7;
  private suspendTimer: number | null = null;

  constructor(context?: BaseAudioContext) {
    if (context) {
      this.offline = true;
      this.ctx = context;
      this.buildMixer(context);
    } else if (typeof window !== 'undefined') {
      try {
        const saved = JSON.parse(storage.getItem(SOUND_PREF_KEY) || 'null');
        if (typeof saved?.enabled === 'boolean') this.soundEnabled = saved.enabled;
        if (typeof saved?.volume === 'number') this.soundVolume = clamp(saved.volume, 0, 1);
      } catch {
        // Audio remains usable when browser storage is unavailable.
      }
    }
  }

  get enabled() {
    return this.soundEnabled;
  }

  set enabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) this.stopAll();
    this.updateMaster();
    this.persist();
  }

  get volume() {
    return this.soundVolume;
  }

  set volume(volume: number) {
    this.soundVolume = clamp(volume, 0, 1);
    this.updateMaster();
    this.persist();
  }

  get ready() {
    return Boolean(this.ctx && (this.offline || this.ctx.state === 'running'));
  }

  private persist() {
    if (this.offline || typeof window === 'undefined') return;
    try {
      storage.setItem(
        SOUND_PREF_KEY,
        JSON.stringify({
          enabled: this.enabled,
          volume: this.volume,
        }),
      );
    } catch {
      // Private browsing may deny storage access.
    }
  }

  public async unlock(): Promise<boolean> {
    if (!this.enabled) return false;
    if (this.offline || this.ready) return true;
    if (this.resumePromise) return this.resumePromise;
    if (typeof window === 'undefined') return false;

    // Never queue sounds in a suspended context before the first user gesture.
    if (
      !this.ctx &&
      typeof navigator !== 'undefined' &&
      navigator.userActivation &&
      !navigator.userActivation.isActive &&
      !navigator.userActivation.hasBeenActive
    ) {
      return false;
    }

    try {
      if (this.suspendTimer !== null && typeof window !== 'undefined') {
        window.clearTimeout(this.suspendTimer);
        this.suspendTimer = null;
      }
      if (!this.ctx) {
        const AudioCtor =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return false;
        this.ctx = new AudioCtor({ latencyHint: 'interactive' });
        this.buildMixer(this.ctx);
      }
      const context = this.ctx as AudioContext;
      this.resumePromise = context
        .resume()
        .then(() => this.ready)
        .catch(() => false)
        .finally(() => {
          this.resumePromise = null;
        });
      return this.resumePromise;
    } catch {
      return false;
    }
  }

  private random() {
    this.randomSeed = (Math.imul(this.randomSeed, 1664525) + 1013904223) | 0;
    return (this.randomSeed >>> 0) / 4294967296;
  }

  private buildMixer(ctx: BaseAudioContext) {
    this.input = ctx.createGain();
    this.room = ctx.createConvolver();
    this.scene = ctx.createGain();
    this.master = ctx.createGain();

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 110;
    highpass.Q.value = 0.5;

    const warmth = ctx.createBiquadFilter();
    warmth.type = 'lowpass';
    warmth.frequency.value = 1900;
    warmth.Q.value = 0.45;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -15;
    compressor.knee.value = 15;
    compressor.ratio.value = 2;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.18;

    const roomTone = ctx.createBiquadFilter();
    roomTone.type = 'lowpass';
    roomTone.frequency.value = 1500;
    roomTone.Q.value = 0.4;
    const roomLevel = ctx.createGain();
    roomLevel.gain.value = 0.18;

    // Just a little room softness; no overlapping bell tails or audible echo.
    const length = Math.ceil(ctx.sampleRate * 0.28);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = impulse.getChannelData(channel);
      let smoothNoise = 0;
      for (let i = 0; i < length; i++) {
        const t = i / ctx.sampleRate;
        smoothNoise = smoothNoise * 0.64 + (this.random() * 2 - 1) * 0.36;
        const attack = Math.min(1, Math.max(0, (t - 0.01) / 0.014));
        data[i] = smoothNoise * attack * Math.exp(-t * 22);
      }
    }
    this.room.normalize = true;
    this.room.buffer = impulse;
    this.room.connect(roomTone).connect(roomLevel).connect(this.input);

    this.input
      .connect(highpass)
      .connect(warmth)
      .connect(compressor)
      .connect(this.scene)
      .connect(this.master)
      .connect(ctx.destination);
    this.master.gain.value = this.enabled ? this.volume * 0.9 : 0;

    this.feltWave = ctx.createPeriodicWave(
      new Float32Array(6),
      new Float32Array([0, 1, 0.035, 0.009, 0, 0]),
    );
    this.foamBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.65), ctx.sampleRate);
    const foam = this.foamBuffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < foam.length; i++) {
      last = last * 0.62 + (this.random() * 2 - 1) * 0.38;
      foam[i] = last;
    }
  }

  private updateMaster() {
    if (!this.master || !this.ctx) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(
      this.enabled ? this.volume * 0.9 : 0,
      this.ctx.currentTime,
      0.018,
    );
  }

  private at(offset = 0): number | null {
    if (!this.enabled || !this.ready || this.volume === 0) return null;
    return this.ctx!.currentTime + 0.008 + Math.max(0, offset);
  }

  private allow(key: string, at: number, gap = 0.06) {
    const previous = this.recentCues.get(key);
    if (previous !== undefined && Math.abs(at - previous) < gap) return false;
    this.recentCues.set(key, at);
    return this.voices.size < 40;
  }

  private nearCue(key: string, at: number, gap: number) {
    const previous = this.recentCues.get(key);
    return previous !== undefined && Math.abs(at - previous) < gap;
  }

  private envelope(duration: number, attack: number, peak: number) {
    const curve = new Float32Array(256);
    const tail = Math.min(0.055, duration * 0.3);
    for (let i = 0; i < curve.length; i++) {
      const t = (i / (curve.length - 1)) * duration;
      const rise = t < attack ? Math.sin((t / attack) * Math.PI * 0.5) ** 2 : 1;
      const decay = Math.exp((-Math.max(0, t - attack) * 3.7) / duration);
      const release = Math.min(1, (duration - t) / tail);
      curve[i] = peak * rise * decay * Math.max(0, release);
    }
    curve[0] = 0;
    curve[curve.length - 1] = 0;
    return curve;
  }

  private route(
    source: AudioScheduledSourceNode,
    envelope: GainNode,
    filter: BiquadFilterNode,
    pan: number,
    wet: number,
  ) {
    const ctx = this.ctx!;
    const panner = ctx.createStereoPanner();
    const gate = ctx.createGain();
    const send = ctx.createGain();
    panner.pan.value = clamp(pan, -0.15, 0.15);
    send.gain.value = wet;
    source.connect(envelope).connect(filter).connect(panner).connect(gate);
    gate.connect(this.input!);
    gate.connect(send).connect(this.room!);
    const voice: Voice = {
      source,
      gate,
      nodes: [source, envelope, filter, panner, gate, send],
    };
    this.voices.add(voice);
    source.onended = () => {
      voice.nodes.forEach((node) => node.disconnect());
      this.voices.delete(voice);
    };
  }

  public tone(options: ToneOptions) {
    const ctx = this.ctx!;
    const { at, frequency, duration, gain, attack = 0.014, pan = 0, wet = 0.06 } = options;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    if (options.felt && this.feltWave) osc.setPeriodicWave(this.feltWave);
    else osc.type = 'sine';

    osc.frequency.setValueAtTime(frequency, at);

    env.gain.setValueCurveAtTime(this.envelope(duration, attack, gain), at, duration);
    filter.type = 'lowpass';
    filter.frequency.value = options.felt ? 1250 : 1900;
    filter.Q.value = 0.45;
    this.route(osc, env, filter, pan, wet);
    osc.start(at);
    osc.stop(at + duration + 0.012);
  }

  private foam(at: number, duration: number, gain: number, frequency: number, pan = 0) {
    const ctx = this.ctx!;
    const source = ctx.createBufferSource();
    source.buffer = this.foamBuffer;
    const env = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    env.gain.setValueCurveAtTime(this.envelope(duration, 0.018, gain), at, duration);
    filter.type = 'bandpass';
    filter.Q.value = 0.65;
    filter.frequency.setValueAtTime(frequency, at);
    this.route(source, env, filter, pan, 0.025);
    source.start(at, this.random() * 0.08, duration);
    source.stop(at + duration + 0.012);
  }

  private mallet(
    at: number,
    frequency: number,
    gain: number,
    pan = 0,
    duration = 0.23,
    wet = 0.06,
  ) {
    this.tone({ at, frequency, gain, pan, duration, wet, attack: 0.014 });
    this.tone({
      at,
      frequency: frequency * 2,
      gain: gain * 0.045,
      pan,
      duration: duration * 0.55,
      wet: wet * 0.5,
      attack: 0.012,
    });
  }

  public stopAll() {
    this.recentCues.clear();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const voice of this.voices) {
      voice.gate.gain.cancelScheduledValues(now);
      voice.gate.gain.setTargetAtTime(0, now, 0.006);
      try {
        voice.source.stop(now + 0.035);
      } catch {
        /* Already stopped. */
      }
    }
  }

  public resetScene() {
    this.stopAll();
    if (!this.ctx || !this.scene) return;
    this.scene.gain.cancelScheduledValues(this.ctx.currentTime);
    this.scene.gain.setTargetAtTime(1, this.ctx.currentTime, 0.025);
  }

  public playIntroBloom(offset = 0) {
    const at = this.at(offset);
    if (at === null || !this.allow('bloom', at, 0.5)) return;
    this.foam(at, 0.12, 0.009, 650);
  }

  public playDropWhoosh(index = 0, offset = 0) {
    if (index !== 0) return;
    const at = this.at(offset);
    if (at === null || !this.allow('drop', at, 0.2)) return;
    this.foam(at, 0.09, 0.012, 800);
  }

  public playSquishImpact(index = 0, intensity = 1, offset = 0, playbackRate = 1) {
    const at = this.at(offset);
    const letter = Math.round(clamp(index, 0, 3));
    if (at === null || !this.allow(`landing-${letter}`, at, 0.06)) return;
    const gain = clamp(intensity, 0.45, 1.15);
    const rate = clamp(playbackRate, 0.5, 1.5);
    const note = [NOTES.c4, NOTES.e4, NOTES.g4, NOTES.c5][letter];
    // Each letter has its own short tap; it ends before the next 100 ms landing beat.
    this.tone({
      at,
      frequency: note,
      duration: 0.072 / rate,
      gain: 0.145 * gain,
      felt: true,
      wet: 0.025,
      attack: 0.007 / rate,
    });
    this.foam(at, 0.04 / rate, 0.014 * gain, 600);
  }

  public playManualSquish(intensity = 1, offset = 0) {
    const at = this.at(offset);
    if (at === null || !this.allow('squeeze', at, 0.1)) return;
    const gain = clamp(intensity, 0.45, 1.15);
    this.tone({
      at,
      frequency: NOTES.c4,
      duration: 0.16,
      gain: 0.12 * gain,
      felt: true,
      wet: 0.025,
      attack: 0.025,
    });
    this.foam(at, 0.13, 0.022 * gain, 520);
  }

  public playReleaseBoing(pitchOffset = 0, offset = 0) {
    const at = this.at(offset);
    if (at === null || !this.allow('release', at, 0.16)) return;
    this.mallet(at, NOTES.g4, 0.16 + clamp(pitchOffset, 0, 3) * 0.004, 0, 0.2, 0.05);
  }

  public playDropletBurst(offset = 0) {
    const at = this.at(offset);
    if (at === null || this.nearCue('release', at, 0.18)) return;
    if (!this.allow('bubbles', at, 0.22)) return;
    this.mallet(at, NOTES.c5, 0.065, 0, 0.1, 0.035);
  }

  public playStudioLetterTick(index: number, offset = 0) {
    // One understated accent for the whole label; no six-note rapid-fire run.
    if (index !== 0) return;
    const at = this.at(offset);
    if (at === null || this.nearCue('release', at, 0.2) || this.nearCue('bubbles', at, 0.2)) {
      return;
    }
    if (!this.allow('studio', at, 0.3)) return;
    this.mallet(at, NOTES.c5, 0.045, 0, 0.12, 0.035);
  }

  public playMascotWink(offset = 0) {
    const at = this.at(offset);
    if (at === null || !this.allow('wink', at, 0.5)) return;
    // All partials share one onset: a single soft "ting", not a two-note melody.
    const strike = at + 0.03;
    this.tone({
      at: strike,
      frequency: NOTES.c6,
      duration: 0.38,
      gain: 0.14,
      attack: 0.004,
      wet: 0.12,
    });
    this.tone({
      at: strike,
      frequency: NOTES.c6 * 2,
      duration: 0.15,
      gain: 0.012,
      attack: 0.003,
      wet: 0.06,
    });
    this.tone({
      at: strike,
      frequency: NOTES.c6 * 3,
      duration: 0.08,
      gain: 0.002,
      attack: 0.003,
      wet: 0.03,
    });
  }

  public playStudioResolveChord(offset = 0) {
    const at = this.at(offset);
    // Leave the star ting alone instead of stacking a chord on the wink.
    if (at === null || this.nearCue('wink', at, 0.5) || !this.allow('resolve', at, 0.6)) return;
    this.mallet(at, NOTES.c5, 0.085, 0, 0.25, 0.07);
  }

  public playTransitionOut(duration = 0.54) {
    const at = this.at();
    if (at === null || !this.allow('transition', at, 0.5)) return;
    this.foam(at, Math.min(0.25, duration), 0.012, 700);
    this.scene!.gain.cancelScheduledValues(at);
    this.scene!.gain.setValueAtTime(this.scene!.gain.value, at);
    this.scene!.gain.linearRampToValueAtTime(0.0001, at + duration);
  }

  public playGameArrival() {
    if (!this.ctx || !this.scene) return;
    this.scene.gain.cancelScheduledValues(this.ctx.currentTime);
    this.scene.gain.setTargetAtTime(1, this.ctx.currentTime, 0.09);
    const at = this.at();
    if (at === null || !this.allow('arrival', at, 0.5)) return;
    this.mallet(at + 0.04, NOTES.c5, 0.065, 0, 0.24, 0.07);
  }

  public playUiTap() {
    const at = this.at();
    if (at === null || !this.allow('ui', at, 0.08)) return;
    this.mallet(at, NOTES.c5, 0.06, 0, 0.1, 0.025);
  }

  public playCoin() {
    const at = this.at();
    if (at === null || !this.allow('coin', at, 0.08)) return;
    this.mallet(at, NOTES.e5, 0.075, 0, 0.14, 0.045);
  }

  public playPreview() {
    if (!this.ready || !this.enabled) return;
    this.resetScene();
    this.playIntroBloom();
    for (let i = 0; i < 4; i++) this.playSquishImpact(i, 0.8, 0.22 + i * 0.1);
    this.playManualSquish(0.95, 0.65);
    this.playReleaseBoing(1, 0.94);
    this.playDropletBurst(0.94);
    for (let i = 0; i < 6; i++) this.playStudioLetterTick(i, 0.96 + i * 0.036);
    this.playMascotWink(1.32);
    this.playStudioResolveChord(1.32);
  }

  /**
   * Release the intro AudioContext's OS mixer stream once the arrival chime ends
   * so gameplay AudioContexts keep full hardware headroom & sample rate.
   */
  public suspendAfterIntro(delayMs = 550) {
    if (this.offline || typeof window === 'undefined') return;
    if (this.suspendTimer !== null) window.clearTimeout(this.suspendTimer);
    this.suspendTimer = window.setTimeout(() => {
      this.suspendTimer = null;
      const ac = this.ctx as AudioContext | null;
      if (ac && ac.state === 'running' && typeof ac.suspend === 'function') {
        void ac.suspend().catch(() => undefined);
      }
    }, delayMs);
  }
}

export const juicyAudio = new JuicyAudioEngine();
