import { type Ctx, TAU, makeCanvas, pick, rand } from './core';
import { K, type Particle, type Particles } from './particles';
import { CONF_HEX, drawFeather, drawLeaf } from './shapes3';

export * from './spawn2';

type Range = [number, number];

export const CONF_COLS = ['255,79,135', '255,201,40', '56,182,255', '91,220,114', '176,107,255', '255,138,43', '255,255,255'];
const CONF_CSS = [...CONF_HEX, '#ffffff'];

/** fluttering confetti paper (flipping rectangles & dots) */
export function confetti(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, size: Range = [3, 6], life: Range = [1.1, 2.0]) {
  for (let i = 0; i < n; i++) {
    const col = pick(CONF_CSS);
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const w = rand(size[0], size[1]);
    const h = w * rand(0.4, 0.7);
    const dot = Math.random() < 0.18;
    const paper = { kind: 'confetti' as const, color: col, w, h, dot, paint: null as Particle['draw'] };
    const particle = ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 240,
      drag: 2.3,
      rot: rand(0, TAU),
      vrot: rand(-12, 12),
      seed: rand(0, 100),
      life: rand(life[0], life[1]),
      // Keep the original draw callback for fallback, but expose its geometry
      // so adjacent pieces can share paths without dropping any paper.
      data: paper,
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        const flip = Math.cos(p.seed + age * 14);
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 5) * 2.4 * (1 - t), p.y);
        c.rotate(p.rot);
        c.scale(1, 0.14 + 0.86 * Math.abs(flip));
        c.globalAlpha = Math.min(1, t * 3);
        c.fillStyle = col;
        if (dot) {
          c.beginPath();
          c.arc(0, 0, w * 0.5, 0, TAU);
          c.fill();
        } else c.fillRect(-w / 2, -h / 2, w, h);
        if (flip < 0) {
          c.fillStyle = 'rgba(0,0,0,0.22)';
          if (dot) {
            c.beginPath();
            c.arc(0, 0, w * 0.5, 0, TAU);
            c.fill();
          } else c.fillRect(-w / 2, -h / 2, w, h);
        }
        c.restore();
      },
    });
    // Only this exact callback may use the equivalent batched path. If a
    // caller replaces it, Particles must execute their custom drawing instead.
    paper.paint = particle.draw;
  }
}

/** curly ribbon streamers that trail behind their motion */
export function streamers(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, len: Range = [50, 90]) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(len[0], len[1]);
    const col = pick(CONF_HEX);
    const ph = rand(0, TAU);
    ps.add({
      k: K.CUSTOM,
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 220,
      drag: 2.6,
      life: rand(1.1, 1.8),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        const sp2 = Math.hypot(p.vx, p.vy) + 1;
        const dx = -p.vx / sp2;
        const dy = -p.vy / sp2;
        const Ln = L * Math.min(1, age * 6);
        const path = () => {
          c.beginPath();
          for (let j = 0; j <= 14; j++) {
            const s = j / 14;
            const w = Math.sin(s * 8 + age * 12 + ph) * 7 * s * (0.4 + 0.6 * t);
            const px = p.x + dx * s * Ln * 0.8 - dy * w;
            const py = p.y + dy * s * Ln * 0.8 + dx * w + s * s * Ln * 0.5 * (1 - t * 0.5);
            if (j === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
        };
        c.save();
        c.globalAlpha = Math.min(1, t * 3);
        c.lineCap = 'round';
        c.lineJoin = 'round';
        c.strokeStyle = col;
        c.lineWidth = 3.4;
        path();
        c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.5)';
        c.lineWidth = 1;
        path();
        c.stroke();
        c.restore();
      },
    });
  }
}

export function feathers(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(9, 17);
    const white = Math.random() < 0.55;
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 120,
      drag: 2.6,
      rot: rand(0, TAU),
      vrot: rand(-6, 6),
      seed: rand(0, 100),
      life: rand(0.9, 1.7),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 4) * 5 * (1 - t), p.y);
        c.rotate(p.rot + Math.sin(p.seed + age * 6) * 0.5);
        c.scale(1, 0.4 + 0.6 * Math.abs(Math.cos(p.seed + age * 7)));
        c.globalAlpha = Math.min(1, t * 2.5);
        if (white) drawFeather(c, L, '#fffef4', '#d8c88a');
        else drawFeather(c, L, '#ffe84a', '#c99a10');
        c.restore();
      },
    });
  }
}

interface LeafSprite { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number; length: number }
const fallingLeaves = new Map<string, LeafSprite>();

/**
 * The leaf's shaded shape is static; its flutter, spin and fall stay live.
 * Cache only opaque leaves: during the fade the separate translucent outline
 * and vein still use the original vector path, preserving their overlap.
 */
function drawFallingLeaf(ctx: Ctx, length: number, dark: boolean) {
  let sprite: LeafSprite | undefined;
  const canCache = typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined'
    && ctx.canvas instanceof HTMLCanvasElement && Number.isFinite(length) && length >= 7 && length <= 13
    && ctx.globalAlpha >= 0.999 && ctx.lineCap === 'butt' && ctx.lineJoin === 'miter';
  if (canCache) {
    const l = Math.round(length * 2) / 2;
    const key = `${l}:${dark ? 1 : 0}`;
    sprite = fallingLeaves.get(key);
    if (!sprite) {
      try {
        const width = l * 0.42;
        const x = -2, y = Math.floor(-width - 2);
        const w = Math.ceil(l + 2) - x, h = Math.ceil(width + 2) - y;
        const density = 3;
        const canvas = makeCanvas(w * density, h * density);
        const c = canvas.getContext('2d');
        if (c) {
          c.setTransform(density, 0, 0, density, -x * density, -y * density);
          if (dark) drawLeaf(c, l, width, '#5cc34a', '#1d6b2c');
          else drawLeaf(c, l, width);
          sprite = { canvas, x, y, w, h, length: l };
          fallingLeaves.set(key, sprite); // at most 26 size/colour pairs
        }
      } catch { /* Continue drawing the vector when canvas allocation is denied. */ }
    }
  }
  if (sprite) {
    const scale = length / sprite.length;
    ctx.drawImage(sprite.canvas, sprite.x * scale, sprite.y * scale, sprite.w * scale, sprite.h * scale);
  } else if (dark) drawLeaf(ctx, length, length * 0.42, '#5cc34a', '#1d6b2c');
  else drawLeaf(ctx, length, length * 0.42);
}

export function leaves(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(7, 13);
    const dark = Math.random() < 0.4;
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-3, 3),
      y: y + rand(-3, 3),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 160,
      drag: 2.2,
      rot: rand(0, TAU),
      vrot: rand(-8, 8),
      seed: rand(0, 100),
      life: rand(0.8, 1.5),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 5) * 3 * (1 - t), p.y);
        c.rotate(p.rot);
        c.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(p.seed + age * 8)));
        c.globalAlpha = Math.min(1, t * 2.5);
        drawFallingLeaf(c, L, dark);
        c.restore();
      },
    });
  }
}

export function soil(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  const cols = ['74,44,20', '98,60,28', '52,30,14', '120,78,38'];
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(1.2, 2.8);
    ps.add({
      k: K.CHIP,
      x: x + rand(-3, 3),
      y: y + rand(-3, 3),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1100,
      drag: 0.8,
      rot: rand(0, TAU),
      vrot: rand(-14, 14),
      life: rand(0.5, 0.95),
      poly: [r, 0, r * 0.3, r * 0.9, -r, r * 0.4, -r * 0.7, -r * 0.7, r * 0.4, -r],
      color: pick(cols),
      data: 'rgba(0,0,0,0)',
    });
  }
}

export function pepperoni(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(4, 6.4);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-2, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 1100,
      drag: 0.6,
      rot: rand(0, TAU),
      vrot: rand(-10, 10),
      life: rand(0.8, 1.3),
      draw: (c: Ctx, p: Particle) => {
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
        const g = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        g.addColorStop(0, '#f05a46');
        g.addColorStop(1, '#a8180f');
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fill();
        c.strokeStyle = '#6a0f08';
        c.lineWidth = 0.8;
        c.stroke();
        c.fillStyle = 'rgba(100,10,5,0.5)';
        for (const [dx, dy] of [
          [-0.3, 0.2],
          [0.35, -0.1],
          [0.05, 0.45],
        ]) {
          c.beginPath();
          c.arc(dx * r, dy * r, r * 0.16, 0, TAU);
          c.fill();
        }
        c.restore();
      },
    });
  }
}

/** stretchy cheese strands */
export function cheeseStrings(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
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
        const w = Math.max(0.6, 3.4 * Math.max(0, 1 - d / 120));
        c.save();
        c.globalAlpha = Math.min(1, t * 3);
        c.lineCap = 'round';
        const path = () => {
          c.beginPath();
          c.moveTo(ox, oy);
          c.quadraticCurveTo(ox + dx * 0.5, oy + dy * 0.5 + d * 0.2, p.x, p.y);
        };
        c.strokeStyle = '#c98a10';
        c.lineWidth = w + 1.4;
        path();
        c.stroke();
        c.strokeStyle = '#ffd34d';
        c.lineWidth = w;
        path();
        c.stroke();
        c.fillStyle = '#ffd34d';
        c.strokeStyle = '#c98a10';
        c.lineWidth = 1;
        c.beginPath();
        c.arc(p.x, p.y, 3.2, 0, TAU);
        c.fill();
        c.stroke();
        c.restore();
      },
    });
  }
}

/** generic sticky blobs (cheese, sauce…) */
export function goo(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, size: Range, color: string, data: string) {
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
      color,
      alpha: 1.4,
      data,
    });
  }
}
