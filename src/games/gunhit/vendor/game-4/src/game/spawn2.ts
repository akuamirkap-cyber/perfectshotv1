import { type Ctx, TAU, clamp, pick, rand, randomPoly } from './core';
import { K, type Particle, type Particles } from './particles';
import { drawBubble, drawSnowball, drawSnowflake } from './shapes2';
import { droplets, glow, ring, stars } from './spawn';

export * from './spawn';

type Range = [number, number];

/** additive flame particles (K.FIRE) */
export function fire(
  ps: Particles,
  x: number,
  y: number,
  n: number,
  ang: number,
  spread: number,
  speed: Range,
  size: Range,
  size2: Range,
  life: Range,
  o: { g?: number; drag?: number; alpha?: number } = {},
) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.FIRE,
      add: true,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: o.g ?? -200,
      drag: o.drag ?? 1.6,
      size: rand(size[0], size[1]),
      size2: rand(size2[0], size2[1]),
      life: rand(life[0], life[1]),
      alpha: o.alpha ?? 0.9,
    });
  }
}

export function snowChunks(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(2.2, 5.2);
    const shape = randomPoly(8, r, 0.2);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-3, 3),
      y: y + rand(-3, 3),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1100,
      drag: 0.8,
      rot: rand(0, TAU),
      vrot: rand(-14, 14),
      life: rand(0.6, 1.1),
      draw: (c: Ctx, p: Particle) => {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
        drawSnowball(c, shape, r);
        c.restore();
        c.globalAlpha = 1;
      },
    });
  }
}

export function shards(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, colors: string[]) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(3, 8);
    const w = rand(1, 2.2);
    ps.add({
      k: K.CHIP,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 900,
      drag: 0.9,
      rot: a,
      vrot: rand(-18, 18),
      life: rand(0.5, 0.95),
      poly: [-L * 0.3, -w, L, 0, -L * 0.3, w, -L * 0.6, 0],
      color: pick(colors),
      data: 'rgba(255,255,255,0.85)',
    });
  }
}

export function snowflakes(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const s = rand(3, 6.5);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-3, 3),
      y: y + rand(-3, 3),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 60,
      drag: 1.5,
      rot: rand(0, TAU),
      vrot: rand(-3, 3),
      life: rand(0.8, 1.6),
      draw: (c: Ctx, p: Particle) => {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 2.5) * 0.95;
        c.strokeStyle = 'rgba(235,250,255,1)';
        c.lineWidth = 1;
        drawSnowflake(c, s);
        c.restore();
        c.globalAlpha = 1;
      },
    });
  }
}

/** soap-film pop: rainbow rings, curved film shards, droplets, sparkles */
export function bubblePop(ps: Particles, x: number, y: number, r: number) {
  const big = r >= 9;
  ring(ps, x, y, r * 0.9, r * 2.6, '255,150,225', big ? 2.5 : 1.5, 0.28, true, 0.9);
  if (big) {
    ring(ps, x, y, r * 0.8, r * 2.2, '130,235,255', 2, 0.24, true, 0.9);
    ring(ps, x, y, r * 0.7, r * 1.8, '255,245,150', 1.6, 0.2, true, 0.9);
  }
  const nS = clamp(Math.round(r * 0.9), 3, 12);
  for (let i = 0; i < nS; i++) {
    const a = (i / nS) * TAU + rand(-0.3, 0.3);
    const sp = rand(60, 200) * (0.5 + r / 20);
    const hue = rand(0, 360);
    ps.add({
      k: K.CUSTOM,
      add: true,
      x: x + Math.cos(a) * r * 0.7,
      y: y + Math.sin(a) * r * 0.7,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 120,
      drag: 2.2,
      rot: a,
      vrot: rand(-8, 8),
      life: rand(0.35, 0.7),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.strokeStyle = `hsla(${(hue + (1 - t) * 120) % 360},100%,78%,${Math.min(1, t * 2) * 0.9})`;
        c.lineWidth = Math.max(1, r * 0.09);
        c.lineCap = 'round';
        c.beginPath();
        c.arc(0, 0, r * 0.45, -0.55, 0.55);
        c.stroke();
        c.restore();
      },
    });
  }
  droplets(ps, x, y, big ? 9 : 4, 0, Math.PI, [60, 240], [0.8, 1.8], '200,235,255', 600);
  stars(ps, x, y, big ? 5 : 2, '255,225,250', [30, 120], [big ? 8 : 5, big ? 14 : 8], -Math.PI / 2, Math.PI);
  if (big) glow(ps, x, y, r * 4, r, '255,230,250', 0.2, 0.7);
}

/** a free-floating bubble that pops when its life ends */
export function miniBubble(ps: Particles, x: number, y: number, vx: number, vy: number, r: number, life: number) {
  const seed = rand(0, 10);
  ps.add({
    k: K.CUSTOM,
    x,
    y,
    vx,
    vy,
    drag: 1.7,
    g: -30,
    life,
    seed,
    draw: (c: Ctx, p: Particle) => {
      const age = p.max - p.life;
      const t = p.life / p.max;
      const popping = t < 0.1;
      const wob = 1 + 0.07 * Math.sin(age * 14 + seed);
      c.save();
      c.translate(p.x, p.y);
      c.scale(wob, 1 / wob);
      drawBubble(c, r * (popping ? 1 + (0.1 - t) * 4 : 1), age * 2, seed, popping ? t * 10 : 1);
      c.restore();
    },
    die: (p: Particle) => bubblePop(ps, p.x, p.y, r * 0.9),
  });
}

export function bubbleSpray(ps: Particles, x: number, y: number) {
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + rand(-0.75, 0.75);
    const sp = rand(120, 300);
    miniBubble(ps, x + rand(-5, 5), y + rand(-4, 2), Math.cos(a) * sp, Math.sin(a) * sp, rand(2.6, 8), rand(0.55, 1.15));
  }
}
