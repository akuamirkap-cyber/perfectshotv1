import { TAU, pick, rand, randomPoly } from './core';
import { WOOD_COLS } from './art';
import { K, type Particles } from './particles';

type Range = [number, number];

export function chips(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, colors = WOOD_COLS) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.CHIP,
      x: x + rand(-3, 3),
      y: y + rand(-3, 3),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1150,
      drag: 0.7,
      rot: rand(0, TAU),
      vrot: rand(-20, 20),
      life: rand(0.6, 1.15),
      poly: randomPoly(4 + Math.floor(Math.random() * 2), rand(1.5, 3.6), 0.55),
      color: pick(colors),
    });
  }
}

export function splinters(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(3, 7.5);
    const w = rand(0.6, 1.3);
    ps.add({
      k: K.CHIP,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1000,
      drag: 0.9,
      rot: a,
      vrot: rand(-28, 28),
      life: rand(0.55, 1),
      poly: [-L, -w, L, -w * 0.3, L * 0.85, w, -L, w * 0.7],
      color: pick(WOOD_COLS),
    });
  }
}

export function sparks(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, color = '255,210,120', size = 1.6, g = 900, len = 0.022) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.SPARK,
      add: true,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g,
      drag: 2.2,
      size: size * rand(0.7, 1.3),
      len,
      life: rand(0.25, 0.65),
      color,
    });
  }
}

export function smoke(
  ps: Particles,
  x: number,
  y: number,
  n: number,
  color: string,
  size: Range,
  opts: { vx?: Range; vy?: Range; life?: Range; alpha?: number; drag?: number; spread?: number; back?: boolean; g?: number } = {},
) {
  for (let i = 0; i < n; i++) {
    const s = opts.spread ?? 6;
    ps.add({
      k: K.SMOKE,
      x: x + rand(-s, s),
      y: y + rand(-s, s),
      vx: rand(...(opts.vx ?? [-30, 30])),
      vy: rand(...(opts.vy ?? [-40, -10])),
      size: size[0] * rand(0.8, 1.2),
      size2: size[1] * rand(0.8, 1.25),
      life: rand(...(opts.life ?? [0.7, 1.2])),
      alpha: opts.alpha ?? 0.5,
      drag: opts.drag ?? 1.5,
      g: opts.g ?? 0,
      rot: rand(0, TAU),
      vrot: rand(-1.2, 1.2),
      color,
      back: opts.back ?? false,
    });
  }
}

export function ring(ps: Particles, x: number, y: number, r0: number, r1: number, color: string, width: number, life: number, add = true, alpha = 1) {
  ps.add({ k: K.RING, x, y, size: r0, size2: r1, color, len: width, life, add, alpha });
}

export function glow(ps: Particles, x: number, y: number, size: number, size2: number, color: string, life: number, alpha = 1) {
  ps.add({ k: K.GLOW, add: true, x, y, size, size2, color, life, alpha });
}

export function stars(ps: Particles, x: number, y: number, n: number, color: string, speed: Range, size: Range, ang = -Math.PI / 2, spread = Math.PI) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.STAR,
      add: true,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 120,
      drag: 2.6,
      size: rand(size[0], size[1]),
      life: rand(0.5, 1.1),
      rot: rand(0, 1),
      vrot: rand(-2, 2),
      color,
    });
  }
}

export function droplets(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, size: Range, color = '150,210,255', g = 950) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.DROP,
      x: x + rand(-2, 2),
      y: y + rand(-2, 2),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g,
      drag: 0.6,
      size: rand(size[0], size[1]),
      life: rand(0.6, 1.1),
      color,
    });
  }
}

export function embers(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, color = '255,170,60', size = 1.8) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.EMBER,
      add: true,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 250,
      drag: 2.8,
      size: size * rand(0.7, 1.3),
      life: rand(0.4, 0.9),
      color,
    });
  }
}
