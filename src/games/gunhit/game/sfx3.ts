import { noise, tone } from './audio';

const r = (a: number, b: number) => a + Math.random() * (b - a);
// Sundanese-ish pentatonic (da mi na ti la)
const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

export const sfx3 = {
  honey() {
    tone(180, 90, 0.18, 'sine', 0.45);
    tone(320, 160, 0.12, 'sine', 0.2, 0.04);
    noise(0.14, 700, 0.35, 'lowpass', 200);
  },
  coconut() {
    tone(150, 60, 0.18, 'sine', 0.8);
    noise(0.12, 1300, 0.6, 'bandpass', 500);
    tone(90, 40, 0.25, 'triangle', 0.3);
  },
  coconutHit() {
    tone(260, 120, 0.08, 'square', 0.18);
    noise(0.35, 2000, 0.6, 'bandpass', 400, 0.03);
  },
  angklung() {
    // bamboo clack + shimmering tube rattle
    for (let i = 0; i < 4; i++) tone(1300 + i * 20, 1250, 0.05, 'triangle', 0.12, i * 0.03);
    noise(0.05, 2500, 0.3, 'bandpass');
  },
  note(i: number) {
    const f = PENTA[Math.min(PENTA.length - 1, Math.max(0, i))];
    for (let k = 0; k < 5; k++) tone(f, f * 0.995, 0.35, 'triangle', 0.12, k * 0.028);
    tone(f * 2, f * 2, 0.25, 'sine', 0.05);
  },
  bee() {
    tone(220, 240, 0.12, 'sawtooth', 0.08);
    tone(225, 250, 0.12, 'square', 0.04);
    noise(0.04, 1500, 0.2, 'bandpass');
  },
  sting() {
    tone(1500, 600, 0.06, 'sawtooth', 0.08);
  },
  ink() {
    noise(0.22, 600, 0.7, 'lowpass', 150);
    tone(140, 60, 0.18, 'sine', 0.45);
    tone(90, 50, 0.2, 'triangle', 0.2, 0.05);
  },
  yoyo() {
    tone(280, 950, 0.14, 'triangle', 0.3);
    noise(0.12, 2400, 0.25, 'bandpass', 3600);
    tone(160, 420, 0.28, 'sawtooth', 0.05, 0.03);
  },
  sakura() {
    [1568, 1760, 2093, 2349].forEach((f, i) => tone(f, f, 0.4, 'sine', 0.06, i * 0.05));
    noise(0.3, 3500, 0.15, 'bandpass', 6000);
  },
  acid() {
    tone(500, 160, 0.14, 'square', 0.12);
    noise(0.3, 5500, 0.35, 'highpass', 2500, 0.05);
  },
  sizzle() {
    noise(0.55, 6500, 0.45, 'highpass', 3000);
    tone(1900, 1500, 0.3, 'sine', 0.03);
  },
  keris() {
    // Slide #8 Sambaran Halilintar Mahadahsyat: Snap Tajam + Dentum Sub + Gemuruh Petir
    noise(0.18, 8500, 0.35, 'highpass', 1800);
    tone(3400, 280, 0.12, 'sawtooth', 0.14);
    tone(210, 38, 0.38, 'sawtooth', 0.22);
    tone(90, 30, 0.5, 'sine', 0.36, 0.01);
    noise(0.42, 420, 0.22, 'lowpass', 80, 0.01);
  },
  kerisStick() {
    // Slide #8 Ledakan Tumbukan Petir: Retakan Listrik + Dentum Guntur + Sisa Sizzling
    noise(0.12, 5200, 0.32, 'highpass');
    tone(2900, 180, 0.14, 'sawtooth', 0.16);
    tone(160, 40, 0.45, 'sine', 0.32, 0.01);
    noise(0.55, 240, 0.2, 'lowpass', 60, 0.02);
    noise(0.08, 6800, 0.14, 'highpass', undefined, 0.11);
  },
  tornado() {
    noise(0.7, 500, 0.8, 'bandpass', 2600);
    noise(0.6, 2200, 0.3, 'bandpass', 600, 0.1);
    tone(80, 140, 0.6, 'sawtooth', 0.06);
  },
  firework() {
    tone(900, 2600, 0.45, 'sine', 0.12); // whistle
    noise(0.2, 2000, 0.4, 'bandpass', 800);
  },
  fireworkBoom() {
    tone(90, 30, 0.6, 'sine', 0.8);
    noise(0.5, 3000, 0.7, 'lowpass', 200);
    for (let i = 0; i < 10; i++) noise(0.03, r(3000, 8000), 0.25, 'highpass', undefined, 0.25 + i * r(0.03, 0.07)); // crackle
  },
  anchor() {
    for (let i = 0; i < 6; i++) tone(r(1600, 2600), 1400, 0.04, 'square', 0.06, i * 0.035); // chain rattle
    tone(120, 45, 0.4, 'sine', 0.8);
    noise(0.25, 1200, 0.5, 'lowpass', 200);
  },
  clank() {
    tone(700, 650, 0.6, 'square', 0.08);
    tone(1100, 1050, 0.5, 'sine', 0.14);
    tone(90, 50, 0.3, 'sine', 0.5);
  },
  shark() {
    noise(0.3, 1800, 0.6, 'bandpass', 500);
    tone(110, 220, 0.25, 'sine', 0.35);
  },
  chomp() {
    noise(0.06, 2500, 0.8, 'bandpass');
    tone(200, 70, 0.1, 'square', 0.2);
    noise(0.06, 2000, 0.6, 'bandpass', undefined, 0.09);
  },
  ghost() {
    tone(500, 800, 0.35, 'sine', 0.15);
    tone(507, 760, 0.45, 'sine', 0.12, 0.05);
    tone(300, 200, 0.5, 'triangle', 0.08, 0.1);
  },
  wail() {
    tone(700, 380, 0.5, 'sine', 0.14);
    tone(706, 386, 0.5, 'sine', 0.1);
  },
  ufo() {
    for (let i = 0; i < 6; i++) tone(500 + (i % 2) * 300, 700 - (i % 2) * 200, 0.06, 'sine', 0.12, i * 0.05);
    tone(1800, 1200, 0.2, 'square', 0.04);
  },
  abduct() {
    tone(200, 1600, 0.8, 'sine', 0.2);
    tone(204, 1620, 0.8, 'triangle', 0.08);
    noise(0.8, 1500, 0.2, 'bandpass', 6000);
  },
  rainbow() {
    [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, f, 0.15, 'triangle', 0.07, i * 0.025));
  },
  meteor() {
    noise(0.8, 300, 0.8, 'lowpass', 1800);
    tone(70, 30, 0.8, 'sawtooth', 0.15);
    tone(1500, 300, 0.6, 'sine', 0.06);
  },
  diamond() {
    tone(3136, 3136, 0.5, 'sine', 0.09);
    tone(4186, 4186, 0.4, 'sine', 0.06, 0.04);
    noise(0.05, 7000, 0.35, 'highpass');
    noise(0.15, 5000, 0.4, 'lowpass', 400);
    tone(140, 40, 0.12, 'sine', 0.4);
  },
  chime() {
    [2093, 2637, 3136].forEach((f, i) => tone(f, f, 0.5, 'sine', 0.08, i * 0.06));
  },
  moonbeam() {
    tone(880, 440, 0.4, 'sine', 0.16);
    tone(1320, 660, 0.4, 'sine', 0.08);
    tone(1760, 1760, 0.6, 'sine', 0.05, 0.05);
    noise(0.2, 6000, 0.12, 'highpass');
  },
  storm() {
    tone(2000, 200, 0.12, 'sawtooth', 0.12);
    noise(0.12, 8000, 0.6, 'highpass', 2000);
  },
  thunder() {
    noise(1.4, 900, 0.9, 'lowpass', 50);
    tone(55, 25, 1.2, 'sine', 0.7);
    noise(0.1, 6000, 0.6, 'highpass');
  },
  bloop() {
    tone(340, 140, 0.16, 'sine', 0.35);
    tone(200, 420, 0.14, 'sine', 0.22, 0.08);
    noise(0.06, 1800, 0.25, 'bandpass', 900);
    tone(659, 659, 0.28, 'sine', 0.12, 0.05);
  },
};
