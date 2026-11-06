import { type Ctx, TAU, pick, rand } from './core';
import { K, type Particle, type Particles } from './particles';
import { PETAL_COLS, ROCKET_COLS, drawBee, drawCoconutHalf, drawNote, drawPetal, hexPath } from './shapes4';

export * from './spawn3';

type Range = [number, number];

/** sakura petals that sway and flutter */
export function petals(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, life: Range = [1.2, 2.4], g = 60) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const [c0, c1] = pick(PETAL_COLS);
    const r = rand(5, 9);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g,
      drag: 2.2,
      rot: rand(0, TAU),
      vrot: rand(-5, 5),
      seed: rand(0, 100),
      life: rand(life[0], life[1]),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 3.5) * 9 * (1 - t * 0.4), p.y);
        c.rotate(p.rot + Math.sin(p.seed + age * 5) * 0.6);
        c.scale(0.55 + 0.45 * Math.abs(Math.cos(p.seed + age * 6)), 0.55 + 0.45 * Math.abs(Math.sin(p.seed + age * 4.5)));
        c.globalAlpha = Math.min(1, t * 2.5);
        drawPetal(c, r, c0, c1);
        c.restore();
      },
    });
  }
}

/** buzzing bees that burst out and drift away */
export function bees(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const sc = rand(0.85, 1.25);
    ps.add({
      k: K.CUSTOM,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: -140,
      drag: 1.7,
      seed: rand(0, 100),
      life: rand(0.9, 1.5),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        const heading = Math.hypot(p.vx, p.vy) > 28 ? Math.atan2(p.vy, p.vx) + Math.PI / 2 : 0;
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 22) * 3, p.y + Math.cos(p.seed + age * 19) * 2.4);
        c.rotate(heading * 0.8 + Math.sin(p.seed + age * 9) * 0.3);
        c.globalAlpha = Math.min(1, t * 3);
        drawBee(c, sc, Math.sin(p.seed + age * 70));
        c.restore();
      },
    });
  }
}

/** golden musical notes drifting out */
export function notes(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const s = rand(0.55, 1.0);
    const kind = Math.random() < 0.7 ? 0 : 1;
    const white = Math.random() < 0.3;
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: -30,
      drag: 1.8,
      rot: rand(-0.4, 0.4),
      seed: rand(0, 100),
      life: rand(0.9, 1.6),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 4) * 5, p.y);
        c.rotate(p.rot + Math.sin(p.seed + age * 3) * 0.25);
        c.globalAlpha = Math.min(1, t * 2.5);
        c.save();
        c.globalCompositeOperation = 'lighter';
        const gs = glowOf(white);
        c.drawImage(gs, -22 * s, -26 * s, 44 * s, 44 * s);
        c.restore();
        if (white) drawNote(c, s, kind, '#fff8dc', '#b8964a');
        else drawNote(c, s, kind);
        c.restore();
      },
    });
  }
}

import { glowSprite } from './core';
const glowOf = (white: boolean) => glowSprite(white ? '255,250,225' : '255,205,80');

/** drifting honeycomb hexagons */
export function hexes(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(3, 7);
    ps.add({
      k: K.CUSTOM,
      add: true,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 80,
      drag: 2,
      rot: rand(0, TAU),
      vrot: rand(-3, 3),
      life: rand(0.5, 1.0),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        c.save();
        c.translate(p.x, p.y);
        hexPath(c, r * (0.6 + 0.4 * t), p.rot);
        c.strokeStyle = `rgba(255,${200 + Math.round(40 * (1 - t))},80,${Math.min(1, t * 2) * 0.95})`;
        c.lineWidth = 1.3;
        c.stroke();
        c.fillStyle = `rgba(255,230,140,${0.25 * t})`;
        c.fill();
        c.restore();
      },
    });
  }
}

/** big colourful firework burst */
export function fireworkBurst(ps: Particles, x: number, y: number, ci: number, scale = 1) {
  const cols = ROCKET_COLS[ci % 3].burst;
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * TAU + rand(-0.04, 0.04);
    const sp = rand(180, 520) * scale;
    ps.add({ k: K.SPARK, add: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 260, drag: 2.6, size: rand(1.4, 2.4), len: 0.05, life: rand(0.7, 1.3), color: pick(cols) });
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * TAU + rand(-0.1, 0.1);
    const sp = rand(240, 340) * scale;
    ps.add({ k: K.STAR, add: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 120, drag: 2.4, size: rand(10, 17) * Math.max(0.6, scale), life: rand(0.9, 1.4), color: pick(cols), rot: rand(0, 1), vrot: rand(-2, 2) });
  }
  for (let i = 0; i < 36; i++) {
    const a = rand(0, TAU);
    const sp = rand(60, 300) * scale;
    ps.add({ k: K.EMBER, add: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 300, drag: 1.8, size: rand(1.4, 2.6), life: rand(1.0, 1.9), color: pick(['255,225,130', '255,255,235', cols[0]]) });
  }
  ps.add({ k: K.GLOW, add: true, x, y, size: 220 * scale, size2: 40 * scale, color: cols[0], life: 0.3, alpha: 0.9 });
}

/** cracked coconut shell halves */
export function coconutHalves(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(5.5, 8);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-2, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1150,
      drag: 0.6,
      rot: rand(0, TAU),
      vrot: rand(-12, 12),
      life: rand(0.8, 1.3),
      draw: (c: Ctx, p: Particle) => {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
        drawCoconutHalf(c, r);
        c.restore();
      },
    });
  }
}

/** thin husk fibres */
export function fibers(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({ k: K.SPARK, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 600, drag: 1.4, size: rand(1, 1.6), len: 0.05, life: rand(0.5, 0.95), color: '120,78,38' });
  }
}

/** stretchy sticky strands with custom colours (honey) */
export function strands(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, fill: string, edge: string) {
  for (let i = 0; i < n; i++) {
    const ox = x + rand(-8, 8);
    const oy = y + rand(-2, 4);
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.CUSTOM,
      x: ox,
      y: oy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 700,
      drag: 0.8,
      life: rand(0.55, 0.95),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const dx = p.x - ox;
        const dy = p.y - oy;
        const d = Math.hypot(dx, dy);
        const w = Math.max(0.6, 3.2 * Math.max(0, 1 - d / 120));
        c.save();
        c.globalAlpha = Math.min(1, t * 3);
        c.lineCap = 'round';
        const path = () => {
          c.beginPath();
          c.moveTo(ox, oy);
          c.quadraticCurveTo(ox + dx * 0.5, oy + dy * 0.5 + d * 0.2, p.x, p.y);
        };
        c.strokeStyle = edge;
        c.lineWidth = w + 1.4;
        path();
        c.stroke();
        c.strokeStyle = fill;
        c.lineWidth = w;
        path();
        c.stroke();
        c.fillStyle = fill;
        c.strokeStyle = edge;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(p.x, p.y, 3, 0, TAU);
        c.fill();
        c.stroke();
        c.restore();
      },
    });
  }
}
