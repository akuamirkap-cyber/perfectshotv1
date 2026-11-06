import { type Ctx, TAU, makeCanvas, pick, rand } from './core';
import { K, type Particle, type Particles } from './particles';
import { drawCoin, drawPlayingCard } from './shapes6';

export * from './spawn5';

type Range = [number, number];

interface CoinSprite { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number; radius: number }
const fallingCoins = new Map<number, CoinSprite>();

/** Coin face is static; rotation/flip, glow and falling motion remain live. */
function drawFallingCoin(ctx: Ctx, radius: number, flip: number) {
  const canCache = typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined'
    && ctx.canvas instanceof HTMLCanvasElement && Number.isFinite(radius) && radius >= 4.4 && radius <= 6.6
    && ctx.globalAlpha >= 0.999 && ctx.globalCompositeOperation === 'source-over';
  let sprite: CoinSprite | undefined;
  if (canCache) {
    const r = Math.round(radius * 4) / 4;
    sprite = fallingCoins.get(r);
    if (!sprite) {
      try {
        const x = Math.floor(-r - 2), y = x;
        const w = Math.ceil(r + 2) - x, h = w;
        const density = 4;
        const canvas = makeCanvas(w * density, h * density);
        const c = canvas.getContext('2d');
        if (c) {
          c.setTransform(density, 0, 0, density, -x * density, -y * density);
          drawCoin(c, r, 1);
          sprite = { canvas, x, y, w, h, radius: r };
          fallingCoins.set(r, sprite); // bounded to eleven radii
        }
      } catch { /* Fall back to the original drawing if allocation is denied. */ }
    }
  }
  if (!sprite) { drawCoin(ctx, radius, flip); return; }
  const scale = radius / sprite.radius;
  ctx.save();
  ctx.scale(Math.abs(flip) * 0.92 + 0.08, 1);
  ctx.drawImage(sprite.canvas, sprite.x * scale, sprite.y * scale, sprite.w * scale, sprite.h * scale);
  ctx.restore();
}

export function coins(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(4.4, 6.6);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-5, 5),
      y: y + rand(-3, 5),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1300,
      drag: 0.5,
      seed: rand(0, 100),
      life: rand(0.9, 1.5),
      draw: (c: Ctx, p: Particle) => {
        const age = p.max - p.life;
        c.save();
        c.translate(p.x, p.y);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
        c.save();
        c.globalCompositeOperation = 'lighter';
        const tw = 0.5 + 0.5 * Math.sin(p.seed + age * 14);
        c.fillStyle = `rgba(255,230,120,${0.2 * tw})`;
        c.beginPath();
        c.arc(0, 0, r * 1.9, 0, TAU);
        c.fill();
        c.restore();
        drawFallingCoin(c, r, Math.cos(p.seed + age * 17));
        c.restore();
      },
    });
  }
}

export function cards(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, scale = 0.8) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const suit = Math.floor(rand(0, 4));
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 520,
      drag: 1.5,
      rot: rand(0, TAU),
      vrot: rand(-9, 9),
      seed: rand(0, 100),
      life: rand(0.8, 1.5),
      draw: (c: Ctx, p: Particle) => {
        const age = p.max - p.life;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 2.6);
        const f = Math.cos(p.seed + age * 13);
        c.scale(0.18 + 0.82 * Math.abs(f), 1);
        drawPlayingCard(c, suit, scale);
        if (f < 0) {
          c.fillStyle = 'rgba(0,0,0,0.18)';
          c.fillRect(-9 * scale, -12.5 * scale, 18 * scale, 25 * scale);
        }
        c.restore();
      },
    });
  }
}

/** puffs expanding sideways in a flattened ring (cannon / bazooka muzzle) */
export function smokeRing(ps: Particles, x: number, y: number, n: number, rgb: string, rad: number, speed: number, flat = 0.4) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    ps.add({
      k: K.SMOKE,
      x: x + Math.cos(a) * rad,
      y: y + Math.sin(a) * rad * flat,
      vx: Math.cos(a) * speed * rand(0.85, 1.15),
      vy: Math.sin(a) * speed * flat * rand(0.85, 1.15),
      size: 14,
      size2: 38,
      life: rand(0.8, 1.3),
      alpha: 0.5,
      drag: 2.1,
      color: rgb,
      rot: rand(0, TAU),
      vrot: rand(-1, 1),
    });
  }
}

/** shiny fish scales */
export function fishScales(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(2.4, 4.4);
    const silver = Math.random() < 0.4;
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-3, 3),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 500,
      drag: 1.4,
      rot: rand(0, TAU),
      vrot: rand(-8, 8),
      seed: rand(0, 100),
      life: rand(0.8, 1.4),
      draw: (c: Ctx, p: Particle) => {
        const age = p.max - p.life;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
        c.scale(0.4 + 0.6 * Math.abs(Math.cos(p.seed + age * 11)), 1);
        c.beginPath();
        c.ellipse(0, 0, r * 1.2, r, 0, 0, TAU);
        c.fillStyle = silver ? '#e8f0fa' : '#ffab3a';
        c.fill();
        c.strokeStyle = silver ? '#8aa0bc' : '#b4560a';
        c.lineWidth = 0.8;
        c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.8)';
        c.beginPath();
        c.ellipse(-r * 0.3, -r * 0.3, r * 0.5, r * 0.22, -0.6, 0, TAU);
        c.fill();
        c.restore();
      },
    });
  }
}

/** floating "+" or "-" glyphs */
export function plusMinus(ps: Particles, x: number, y: number, n: number, glyph: string, rgb: string, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + rand(-1.4, 1.4);
    const sp = rand(speed[0], speed[1]);
    ps.add({ k: K.TEXT, x: x + rand(-10, 10), y: y + rand(-6, 6), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 1.8, size: rand(18, 28), text: glyph, color: rgb, life: rand(0.7, 1.1) });
  }
}

/** iron filings drawn toward a target */
export function filings(ps: Particles, x: number, y: number, n: number, target: { x: number; y: number }, pull: number, spread = 70) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU);
    const d = rand(14, spread);
    ps.add({
      k: K.SPARK,
      x: x + Math.cos(a) * d,
      y: y + Math.sin(a) * d,
      target,
      pull,
      size: rand(1.1, 1.9),
      len: 0.04,
      life: rand(0.5, 0.8),
      color: pick(['150,156,170', '190,196,208', '110,116,130']),
      alpha: 1,
    });
  }
}
