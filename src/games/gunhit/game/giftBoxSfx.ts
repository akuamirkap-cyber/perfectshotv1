let ctx: AudioContext | null = null;
let muted = false;
let noiseBuf: AudioBuffer | null = null;

export const audio = {
  get muted() { return muted; },
  setMuted(v: boolean) { muted = v; },
};

function getCtx(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

type ToneOpt = { type?: OscillatorType; vol?: number; to?: number; delay?: number; attack?: number };
function tone(f: number, dur: number, { type = "sine", vol = 0.2, to, delay = 0, attack = 0.005 }: ToneOpt = {}) {
  const c = getCtx(); if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

type NoiseOpt = { vol?: number; f?: number; to?: number; type?: BiquadFilterType; q?: number; delay?: number; attack?: number };
function noise(dur: number, { vol = 0.2, f = 1000, to, type = "bandpass", q = 1, delay = 0, attack = 0.005 }: NoiseOpt = {}) {
  const c = getCtx(); if (!c) return;
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const t = c.currentTime + delay;
  const s = c.createBufferSource();
  s.buffer = noiseBuf; s.loop = true;
  const fl = c.createBiquadFilter();
  fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  if (to) fl.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl).connect(g).connect(c.destination);
  s.start(t); s.stop(t + dur + 0.05);
}

function chime(notes: number[], step: number, dur: number, vol: number, delay = 0) {
  notes.forEach((f, i) => {
    tone(f, dur, { type: "triangle", vol, delay: delay + i * step });
    tone(f * 2, dur * 0.6, { type: "sine", vol: vol * 0.3, delay: delay + i * step });
  });
}

export const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch { /* noop */ } };

export const sfx = {
  throw: () => noise(0.12, { vol: 0.12, f: 1500, to: 5000, q: 2 }),
  hit: () => { tone(220, 0.15, { type: "triangle", vol: 0.35, to: 70 }); noise(0.07, { vol: 0.25, f: 2500, to: 600, type: "lowpass" }); },
  break: () => {
    noise(0.6, { vol: 0.45, f: 4000, to: 150, type: "lowpass" });
    tone(140, 0.5, { vol: 0.5, to: 35 });
    chime([784, 988, 1175, 1568], 0.06, 0.25, 0.12, 0.15);
  },
  thud: () => { tone(120, 0.25, { vol: 0.5, to: 45 }); noise(0.1, { vol: 0.2, f: 600, type: "lowpass" }); },
  tap: (n: number) => { tone(260 + n * 120, 0.12, { type: "square", vol: 0.06, to: 380 + n * 160 }); tone(110, 0.15, { vol: 0.35, to: 50 }); },
  charge: () => {
    tone(180, 0.85, { type: "sawtooth", vol: 0.05, to: 1400, attack: 0.05 });
    noise(0.85, { vol: 0.1, f: 400, to: 7000, q: 3, attack: 0.3 });
  },
  open: () => {
    tone(90, 0.7, { vol: 0.6, to: 30 });
    noise(0.5, { vol: 0.35, f: 3000, to: 200, type: "lowpass" });
    chime([523, 659, 784, 1047, 1319], 0.07, 0.45, 0.16, 0.1);
  },
  tick: (urgent = false) => tone(urgent ? 1200 : 880, 0.05, { type: "square", vol: urgent ? 0.07 : 0.04 }),
  click: () => tone(600, 0.08, { vol: 0.15, to: 1200 }),
  reveal: () => { chime([659, 784, 988, 1319, 1568], 0.08, 0.55, 0.15); noise(0.9, { vol: 0.05, f: 8000, type: "highpass" }); },
  equip: () => { tone(400, 0.15, { type: "triangle", vol: 0.2, to: 900 }); chime([1047, 1319, 1568, 2093], 0.06, 0.3, 0.12, 0.12); },
  whoosh: () => noise(0.35, { vol: 0.15, f: 400, to: 3000, q: 1.5 }),
  shoot: (heavy = false) => {
    if (heavy) { tone(180, 0.22, { type: "sawtooth", vol: 0.22, to: 60 }); noise(0.18, { vol: 0.2, f: 900, to: 150, type: "lowpass" }); }
    else { tone(700, 0.09, { type: "square", vol: 0.08, to: 220 }); noise(0.06, { vol: 0.08, f: 3000, to: 800 }); }
  },
  coin: () => { tone(950, 0.09, { type: "square", vol: 0.07, to: 1400 }); tone(1420, 0.14, { type: "sine", vol: 0.09, delay: 0.06 }); },
};
