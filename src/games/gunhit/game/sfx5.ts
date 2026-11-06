import { noise, tone } from './audio';

const r = (a: number, b: number) => a + Math.random() * (b - a);

export const sfx5 = {
  // DISC GUN - cakram neon berputar
  disc() {
    tone(700, 1800, 0.12, 'sawtooth', 0.12);
    noise(0.18, 5500, 0.45, 'bandpass', 1200);
    tone(220, 90, 0.08, 'sine', 0.3);
  },
  discHit() {
    tone(1400, 400, 0.1, 'square', 0.22);
    tone(2200, 1800, 0.15, 'sine', 0.18);
    noise(0.12, 4000, 0.35, 'bandpass');
  },

  // 8-BIT RETRO GUN - chiptune pew-pew
  bit8() {
    [440, 660, 880, 1320].forEach((f, i) => tone(f, f * 0.5, 0.045, 'square', 0.16, i * 0.022));
    noise(0.08, 2200, 0.3, 'bandpass');
  },
  bit8Hit() {
    tone(200, 80, 0.12, 'square', 0.25);
    noise(0.08, 1200, 0.5, 'bandpass');
  },

  // COIN GUN - dentingan koin emas
  coinGun() {
    tone(180, 90, 0.08, 'triangle', 0.3);
    tone(1319, 1319, 0.12, 'square', 0.12, 0.02);
    tone(1760, 1760, 0.18, 'square', 0.15, 0.06);
    noise(0.1, 3000, 0.2, 'bandpass');
  },

  // KUNAI - desingan logam tajam
  kunai() {
    noise(0.05, 7500, 0.55, 'highpass');
    tone(1800, 900, 0.05, 'triangle', 0.18);
  },

  // WARS BLASTER - blaster sci-fi
  blaster() {
    tone(2400, 180, 0.18, 'sawtooth', 0.22);
    tone(1600, 120, 0.2, 'square', 0.12);
    noise(0.08, 6000, 0.35, 'highpass');
    tone(120, 40, 0.12, 'sine', 0.4);
  },
  blasterHit() {
    tone(1800, 150, 0.15, 'sawtooth', 0.25);
    noise(0.12, 4000, 0.4, 'bandpass');
    tone(220, 70, 0.1, 'sine', 0.4);
  },

  // burst / charge helpers
  chargeStart() {
    tone(200, 600, 0.35, 'square', 0.06);
    tone(400, 1200, 0.35, 'sine', 0.08);
  },
  chargeFull() {
    tone(1200, 1200, 0.06, 'square', 0.08);
    tone(1600, 1600, 0.1, 'square', 0.08, 0.06);
    tone(2000, 2000, 0.25, 'sine', 0.06, 0.12);
  },
  chargeHum(level: number) {
    tone(300 + level * 500, 320 + level * 520, 0.12, 'square', 0.025);
  },
  obliterator() {
    tone(60, 240, 0.35, 'sawtooth', 0.18);
    tone(120, 480, 0.35, 'square', 0.06);
    tone(55, 25, 1.2, 'sine', 1, 0.3);
    noise(1.2, 1500, 0.9, 'lowpass', 60, 0.3);
    tone(400, 60, 0.8, 'sawtooth', 0.15, 0.3);
  },
  obliteratorHit() {
    tone(45, 20, 1.6, 'sine', 1);
    noise(1.6, 2500, 1, 'lowpass', 40);
    tone(900, 60, 1, 'sawtooth', 0.12);
    for (let i = 0; i < 6; i++) tone(r(800, 2000), 300, 0.08, 'square', 0.06, 0.1 + i * 0.07);
  },
  busterSmall() {
    tone(1400, 700, 0.07, 'square', 0.12);
    tone(700, 350, 0.05, 'triangle', 0.1);
  },
  busterMid() {
    tone(900, 300, 0.18, 'square', 0.14);
    tone(450, 150, 0.2, 'sawtooth', 0.08);
    noise(0.1, 4000, 0.25, 'highpass');
  },
  busterBig() {
    tone(1600, 100, 0.45, 'square', 0.15);
    tone(800, 60, 0.5, 'sawtooth', 0.12);
    tone(80, 30, 0.5, 'sine', 0.8);
    noise(0.35, 6000, 0.45, 'lowpass', 300);
  },
  paintball() {
    noise(0.06, 1800, 0.6, 'bandpass', 900);
    tone(260, 120, 0.06, 'sine', 0.35);
    noise(0.12, 5000, 0.15, 'highpass', undefined, 0.02);
  },
  paintSplat() {
    noise(0.22, 1300, 0.7, 'bandpass', 250);
    tone(350, 110, 0.1, 'sine', 0.3);
  },
  match() {
    [880, 1109, 1319].forEach((f, i) => tone(f, f, 0.12, 'square', 0.08, i * 0.06));
  },
  holy() {
    [523, 659, 784, 1047].forEach((f, i) => {
      tone(f, f, 0.7, 'sine', 0.07, i * 0.015);
      tone(f * 1.005, f * 1.005, 0.7, 'triangle', 0.03, i * 0.015);
    });
    noise(0.5, 7000, 0.12, 'highpass', 9000);
  },
  purify() {
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f, 0.35, 'sine', 0.08, i * 0.05));
  },
  beeRifle() {
    noise(0.35, 6000, 0.9, 'lowpass', 150);
    tone(90, 28, 0.4, 'sine', 0.9);
    tone(220, 250, 0.4, 'sawtooth', 0.06, 0.05);
    tone(226, 256, 0.4, 'square', 0.03, 0.05);
  },
  emerald() {
    tone(2200, 400, 0.18, 'square', 0.08);
    tone(1760, 1760, 0.4, 'sine', 0.08);
    tone(2637, 2637, 0.3, 'sine', 0.05, 0.03);
  },
  ruby() {
    noise(0.25, 6000, 0.95, 'lowpass', 160);
    tone(130, 34, 0.25, 'sine', 0.9);
    tone(2400, 2400, 0.3, 'sine', 0.05, 0.02);
    noise(0.03, 3000, 0.4, 'bandpass', undefined, 0.2);
  },
  sapphire() {
    noise(0.4, 4000, 1, 'lowpass', 140);
    tone(110, 30, 0.35, 'sine', 1);
    [2349, 2794, 3520].forEach((f, i) => tone(f, f * 0.98, 0.3, 'sine', 0.06, 0.03 + i * 0.03));
  },
  crystal() {
    tone(70, 25, 0.5, 'sine', 0.9);
    noise(0.4, 3000, 0.7, 'lowpass', 200);
    [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, f, 0.5, 'sine', 0.06, 0.05 + i * 0.04));
  },
  unicorn() {
    [523, 659, 784, 988, 1175, 1568, 1976].forEach((f, i) => tone(f, f, 0.18, 'triangle', 0.07, i * 0.03));
    tone(700, 1100, 0.15, 'sawtooth', 0.04, 0.2);
    tone(1100, 600, 0.25, 'sawtooth', 0.04, 0.33);
  },
  magic() {
    [1319, 1760, 2349].forEach((f, i) => tone(f, f * 1.02, 0.25, 'sine', 0.08, i * 0.05));
  },
  pencil() {
    noise(0.12, 2500, 0.45, 'bandpass', 5000);
    tone(500, 260, 0.06, 'triangle', 0.15);
  },
  scribble() {
    for (let i = 0; i < 4; i++) noise(0.04, r(2500, 4500), 0.25, 'bandpass', undefined, i * 0.05);
  },
  erase() {
    noise(0.35, 1800, 0.45, 'bandpass', 900);
    noise(0.35, 3200, 0.2, 'bandpass', 1800, 0.08);
  },
  sandal() {
    noise(0.18, 1500, 0.45, 'bandpass', 3500);
    tone(300, 180, 0.08, 'triangle', 0.2);
  },
  plak() {
    noise(0.07, 2200, 1, 'bandpass');
    tone(400, 140, 0.06, 'square', 0.25);
    noise(0.15, 800, 0.4, 'lowpass', 200, 0.02);
  },
  wand() {
    [1568, 1976, 2349, 3136].forEach((f, i) => tone(f, f, 0.2, 'sine', 0.07, i * 0.04));
    noise(0.25, 7000, 0.15, 'highpass');
  },
  salabim() {
    [784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => tone(f, f, 0.15, 'triangle', 0.08, i * 0.045));
    tone(300, 1200, 0.3, 'sine', 0.1);
  },
  chime() {
    [2093, 2637, 3136].forEach((f, i) => tone(f, f, 0.5, 'sine', 0.08, i * 0.06));
  },
};
