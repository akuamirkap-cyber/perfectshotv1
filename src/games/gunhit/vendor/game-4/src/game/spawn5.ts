// @ts-nocheck
import { drawSpiritMote } from '@/games/shared/spiritArt';
import { type Ctx, TAU, drawSprite, glowSprite, pick, rand, randomPoly, starSprite } from './core';
import { K, type Particle, type Particles } from './particles';
import { type PaintCol, RAINBOW } from './shapes5';

export * from './spawn4';

type Range = [number, number];

/** short graphite scribbles flying off */
export function scribbles(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(0.8, 1.5);
    const sq: number[] = [];
    for (let j = 0; j < 9; j++) sq.push(j * 2.4 * L, Math.sin(j * 1.9) * 3.4 * (j % 2 ? 1 : -1));
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 700,
      drag: 1.1,
      rot: rand(0, TAU),
      vrot: rand(-9, 9),
      life: rand(0.6, 1.1),
      draw: (c: Ctx, p: Particle) => {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 2.5);
        c.strokeStyle = 'rgba(60,60,72,0.95)';
        c.lineWidth = 1.5;
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.beginPath();
        c.moveTo(sq[0], sq[1]);
        for (let k = 2; k < sq.length; k += 2) c.lineTo(sq[k], sq[k + 1]);
        c.stroke();
        c.restore();
      },
    });
  }
}

/** curly wood shavings */
export function shavings(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const s = rand(0.8, 1.4);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 600,
      drag: 1.3,
      rot: rand(0, TAU),
      vrot: rand(-6, 6),
      life: rand(0.8, 1.4),
      draw: (c: Ctx, p: Particle) => {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 2.5);
        c.lineCap = 'round';
        for (const [w, col] of [
          [3.4 * s, '#b98a4a'],
          [2.2 * s, '#f1d9a6'],
        ] as [number, string][]) {
          c.strokeStyle = col;
          c.lineWidth = w;
          c.beginPath();
          for (let t = 0; t <= 3.2; t += 0.2) {
            const r = (1.2 + t * 2.2) * s;
            const px = Math.cos(t * 2.4) * r;
            const py = Math.sin(t * 2.4) * r * 0.8;
            if (t === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.stroke();
        }
        c.restore();
      },
    });
  }
}

/** coloured paint drops */
export function paintDrops(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, size: Range, col: PaintCol) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.DROP,
      x: x + rand(-2, 2),
      y: y + rand(-2, 2),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 950,
      drag: 0.6,
      size: rand(size[0], size[1]),
      life: rand(0.6, 1.1),
      color: col.rgb,
      alpha: 1.4,
      data: col.lo,
    });
  }
}

/** slow floating motes of moon dust */
export function moonDust(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.EMBER,
      add: true,
      x: x + rand(-6, 6),
      y: y + rand(-6, 6),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 20,
      g: -60,
      drag: 1.2,
      size: rand(1.6, 3),
      life: rand(1.0, 2.0),
      color: pick(['235,228,255', '200,185,255', '255,255,255']),
    });
  }
}

/** Floating white/cyan sheet-spirits, replacing the old head-and-tail wisps. */
export function ghostWisps(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const size = rand(9, 15);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: -50,
      drag: 1.6,
      seed: rand(0, 100),
      life: rand(0.8, 1.5),
      draw: (c: Ctx, p: Particle) => {
        const fade = Math.min(1, p.life / p.max * 2);
        const age = p.max - p.life;
        const px = p.x + Math.sin(p.seed + age * 5) * 2;
        c.save();
        c.globalCompositeOperation = 'lighter';
        drawSprite(c, glowSprite('150,255,248'), px, p.y, size * 2.1, 0.25 * fade);
        c.restore();
        drawSpiritMote(c, px, p.y, size, p.seed + age * 4, fade * 0.9);
      },
    });
  }
}

/** glowing hot rock debris */
export function rocks(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(3, 8);
    const shape = randomPoly(7, r, 0.4);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-5, 5),
      y: y + rand(-3, 5),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1250,
      drag: 0.5,
      rot: rand(0, TAU),
      vrot: rand(-12, 12),
      life: rand(0.9, 1.6),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, t * 3);
        c.save();
        c.globalCompositeOperation = 'lighter';
        drawSprite(c, glowSprite('255,110,30'), 0, 0, r * 4.4, 0.55 * t);
        c.restore();
        c.beginPath();
        c.moveTo(shape[0], shape[1]);
        for (let k = 2; k < shape.length; k += 2) c.lineTo(shape[k], shape[k + 1]);
        c.closePath();
        c.fillStyle = '#2a1d17';
        c.fill();
        c.strokeStyle = `rgba(255,${130 + Math.round(70 * t)},40,0.95)`;
        c.lineWidth = 1.3;
        c.stroke();
        c.restore();
      },
    });
  }
}

/** faceted crystal shards */
export function crystalShards(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(5, 11);
    const w = L * rand(0.35, 0.6);
    const hue = Math.random();
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 900,
      drag: 0.8,
      rot: rand(0, TAU),
      vrot: rand(-14, 14),
      seed: rand(0, 100),
      life: rand(0.7, 1.3),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, t * 3);
        c.beginPath();
        c.moveTo(0, -L);
        c.lineTo(w, -L * 0.1);
        c.lineTo(0, L * 0.9);
        c.lineTo(-w, -L * 0.1);
        c.closePath();
        const g = c.createLinearGradient(-w, -L, w, L);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, hue < 0.5 ? '#9fdcf8' : '#c8ecff');
        g.addColorStop(1, '#4aa0e2');
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = 'rgba(235,252,255,0.9)';
        c.lineWidth = 0.7;
        c.stroke();
        c.beginPath();
        c.moveTo(0, -L);
        c.lineTo(0, L * 0.9);
        c.moveTo(-w, -L * 0.1);
        c.lineTo(w, -L * 0.1);
        c.strokeStyle = 'rgba(255,255,255,0.55)';
        c.stroke();
        if (Math.sin(p.seed + age * 22) > 0.7) {
          c.globalCompositeOperation = 'lighter';
          drawSprite(c, starSprite('220,250,255'), 0, -L * 0.3, L * 2.2, 0.9, 0);
        }
        c.restore();
      },
    });
  }
}

/** multicoloured glitter sparks (rainbow) */
export function rainbowSparks(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, size = 1.5) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({ k: K.SPARK, add: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 500, drag: 2.2, size: size * rand(0.8, 1.3), len: 0.03, life: rand(0.4, 0.9), color: pick(RAINBOW) });
  }
}

/** a ring of stars orbiting a point ("dizzy" stars) */
export function orbitStars(ps: Particles, cx: number, cy: number, n: number, life: number, rad = 22, rgb = '255,230,110') {
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU;
    ps.add({
      k: K.CUSTOM,
      add: true,
      x: cx,
      y: cy,
      life,
      seed: i,
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        const a = a0 + age * 8;
        c.save();
        drawSprite(c, starSprite(rgb), cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.45, 13 * Math.min(1, t * 3), Math.min(1, t * 3), age * 3);
        c.restore();
      },
    });
  }
}
