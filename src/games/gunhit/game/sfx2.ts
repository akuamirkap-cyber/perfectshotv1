import { noise, tone } from './audio';

const r = (a: number, b: number) => a + Math.random() * (b - a);

export const sfx2 = {
  // ------------- firing sounds -------------
  shotgun() {
    noise(0.4, 4200, 1, 'lowpass', 140);
    tone(120, 32, 0.3, 'sine', 1);
    tone(210, 50, 0.16, 'square', 0.28);
    // pump action: chk-chk
    noise(0.05, 2400, 0.5, 'bandpass', undefined, 0.3);
    tone(500, 300, 0.03, 'square', 0.08, 0.3);
    noise(0.05, 1700, 0.5, 'bandpass', undefined, 0.43);
    tone(380, 260, 0.03, 'square', 0.08, 0.43);
  },
  sniper() {
    noise(0.55, 6500, 1, 'lowpass', 110);
    tone(95, 24, 0.55, 'sine', 1);
    tone(2600, 1800, 0.07, 'square', 0.06);
    noise(1.4, 700, 0.22, 'lowpass', 90, 0.12); // echo
    noise(0.04, 3200, 0.4, 'bandpass', undefined, 0.55); // bolt
    noise(0.05, 2100, 0.4, 'bandpass', undefined, 0.7);
  },
  scope() {
    tone(1700, 2300, 0.07, 'sine', 0.07);
    noise(0.04, 5000, 0.12, 'highpass');
  },
  minigun() {
    noise(0.07, 5200, 0.75, 'lowpass', 700);
    tone(150, 60, 0.05, 'square', 0.22);
  },
  spinUp() {
    tone(70, 520, 0.45, 'sawtooth', 0.07);
    tone(140, 1040, 0.45, 'square', 0.02);
  },
  railgun() {
    tone(300, 3800, 0.06, 'sawtooth', 0.12);
    tone(3600, 90, 0.42, 'square', 0.12, 0.05);
    noise(0.45, 9000, 0.55, 'highpass', 1800, 0.04);
    tone(62, 24, 0.45, 'sine', 0.9, 0.04);
  },
  flame() {
    noise(0.22, 900, 0.7, 'bandpass', 380);
    tone(72, 48, 0.18, 'sawtooth', 0.1);
  },
  boomerang() {
    noise(0.45, 900, 0.45, 'bandpass', 3400);
    tone(260, 620, 0.3, 'triangle', 0.14);
  },
  slingshot() {
    tone(150, 560, 0.09, 'triangle', 0.45);
    tone(300, 900, 0.06, 'sine', 0.12);
    noise(0.12, 2800, 0.3, 'bandpass', 900);
  },
  blowgun() {
    noise(0.16, 1400, 0.55, 'bandpass', 4200);
    tone(950, 480, 0.06, 'sine', 0.07);
  },
  bamboo() {
    tone(72, 20, 1.1, 'sine', 1);
    noise(1.3, 1800, 1, 'lowpass', 55);
    tone(110, 36, 0.6, 'triangle', 0.4);
    noise(0.8, 500, 0.5, 'lowpass', 70, 0.28); // echo DUARR
    tone(60, 20, 0.6, 'sine', 0.45, 0.28);
  },
  banana() {
    tone(240, 720, 0.12, 'sine', 0.35);
    noise(0.12, 1800, 0.3, 'bandpass', 600);
  },
  portal() {
    tone(260, 1300, 0.28, 'sine', 0.22);
    tone(272, 1330, 0.28, 'triangle', 0.1);
    noise(0.3, 2200, 0.25, 'bandpass', 500);
  },
  magnet() {
    tone(58, 62, 0.35, 'sawtooth', 0.18);
    tone(118, 236, 0.3, 'square', 0.06);
    tone(900, 1800, 0.12, 'sine', 0.06);
  },
  bubble() {
    tone(380, 1150, 0.08, 'sine', 0.35);
    tone(620, 1400, 0.06, 'sine', 0.2, 0.06);
    tone(500, 1300, 0.05, 'sine', 0.14, 0.12);
  },
  chrono() {
    tone(1000, 1000, 0.035, 'square', 0.1);
    tone(1500, 1500, 0.035, 'square', 0.1, 0.1);
    tone(230, 110, 0.35, 'sine', 0.35);
    noise(0.15, 4000, 0.25, 'bandpass');
  },
  shrink() {
    tone(380, 2600, 0.24, 'square', 0.08);
    tone(760, 3200, 0.2, 'sine', 0.12);
  },
  grow() {
    tone(1300, 110, 0.35, 'square', 0.09);
    tone(650, 55, 0.35, 'sine', 0.35);
  },
  harpoon() {
    noise(0.12, 1200, 0.7, 'bandpass', 500);
    tone(230, 90, 0.12, 'square', 0.15);
    noise(0.5, 3000, 0.16, 'highpass', 7000, 0.04); // rope zip
  },
  soaker() {
    noise(0.22, 2600, 0.55, 'bandpass', 1300);
    tone(320, 210, 0.08, 'sine', 0.1);
  },
  snowball() {
    noise(0.12, 900, 0.5, 'lowpass', 300);
    tone(190, 120, 0.08, 'sine', 0.22);
  },
  pirate() {
    tone(62, 20, 0.95, 'sine', 1);
    noise(1.1, 1500, 1, 'lowpass', 60);
    noise(0.3, 5000, 0.4, 'highpass', 1400);
    tone(1200, 1100, 0.05, 'square', 0.05); // fuse
  },
  chicken() {
    tone(900, 1500, 0.08, 'square', 0.15);
    tone(1500, 650, 0.2, 'square', 0.15, 0.08);
  },
  card() {
    noise(0.05, 5200, 0.55, 'highpass');
    tone(2400, 1500, 0.04, 'triangle', 0.12);
  },
  confetti() {
    noise(0.15, 3000, 0.75, 'bandpass', 700);
    tone(380, 900, 0.1, 'triangle', 0.25);
    for (let i = 0; i < 6; i++) tone(r(1500, 3200), 1200, 0.05, 'sine', 0.05, 0.08 + i * 0.04);
  },
  sonic() {
    tone(110, 1300, 0.3, 'sine', 0.4);
    tone(220, 2600, 0.3, 'sine', 0.14);
    tone(55, 30, 0.4, 'square', 0.15);
  },
  seed() {
    tone(720, 1150, 0.06, 'sine', 0.2);
    noise(0.05, 2100, 0.2, 'bandpass');
  },
  glitch() {
    for (let i = 0; i < 7; i++) tone(r(200, 2400), r(100, 1200), 0.03, 'square', 0.1, i * 0.028);
    noise(0.15, 4000, 0.3, 'bandpass');
  },
  dragon() {
    noise(0.65, 700, 0.9, 'bandpass', 180);
    tone(110, 52, 0.55, 'sawtooth', 0.25);
    tone(166, 70, 0.55, 'sawtooth', 0.12);
    tone(82, 45, 0.6, 'square', 0.1, 0.05);
  },
  mirror() {
    tone(2600, 2600, 0.4, 'sine', 0.12);
    tone(3900, 3900, 0.3, 'sine', 0.06, 0.05);
    noise(0.05, 7500, 0.3, 'highpass');
  },
  gravity() {
    tone(48, 28, 0.6, 'sine', 0.85);
    tone(420, 60, 0.5, 'triangle', 0.16);
    noise(0.4, 300, 0.3, 'lowpass', 60);
  },
  pizza() {
    tone(300, 520, 0.1, 'triangle', 0.25);
    noise(0.12, 1500, 0.3, 'bandpass', 600);
  },

  // ------------- impact / perk sounds -------------
  squeak() {
    tone(1300, 2300, 0.1, 'square', 0.13);
    tone(2300, 900, 0.16, 'square', 0.12, 0.1);
  },
  pop() {
    tone(900, 1900, 0.05, 'sine', 0.4);
    noise(0.06, 3000, 0.3, 'highpass');
  },
  warp() {
    tone(1600, 180, 0.35, 'sine', 0.28);
    tone(700, 2500, 0.25, 'triangle', 0.1, 0.15);
    noise(0.3, 1500, 0.2, 'bandpass', 5000);
  },
  timestop() {
    tone(900, 90, 0.7, 'sine', 0.3);
    tone(450, 45, 0.7, 'triangle', 0.18);
    noise(0.5, 3000, 0.3, 'lowpass', 100);
    tone(2000, 2000, 0.03, 'square', 0.06, 0.6);
  },
  jackpot() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, f, 0.12, 'square', 0.1, i * 0.065));
  },
  bloom() {
    tone(880, 880, 0.1, 'sine', 0.12);
    tone(1320, 1320, 0.22, 'sine', 0.1, 0.08);
  },
  boing() {
    tone(180, 620, 0.16, 'sine', 0.4);
    tone(620, 260, 0.18, 'sine', 0.2, 0.14);
  },
  burn() {
    noise(0.2, 1200, 0.18, 'bandpass', 600);
  },
  thud() {
    tone(140, 60, 0.12, 'sine', 0.5);
    noise(0.1, 600, 0.4, 'lowpass');
  },
  splat() {
    noise(0.25, 1600, 0.6, 'bandpass', 300);
    tone(380, 120, 0.1, 'sine', 0.3);
  },
  metal() {
    tone(1600, 1500, 0.4, 'square', 0.06);
    tone(2400, 2300, 0.3, 'sine', 0.12);
    noise(0.1, 5000, 0.4, 'highpass');
  },
  crash() {
    noise(0.5, 3000, 0.8, 'lowpass', 200);
    tone(300, 50, 0.3, 'square', 0.15);
  },
  reverse() {
    tone(820, 200, 0.18, 'square', 0.08);
    tone(200, 820, 0.18, 'square', 0.08, 0.18);
  },
  shield() {
    tone(600, 1200, 0.15, 'sine', 0.25);
    tone(1200, 1800, 0.2, 'sine', 0.12, 0.1);
  },
  ding() {
    tone(1760, 1760, 0.25, 'sine', 0.15);
  },
};
