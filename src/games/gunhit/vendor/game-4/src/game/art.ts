import { type Ctx, H, TAU, W, drawSprite, glowSprite, lin, makeCanvas, mulberry32, polyPath, rand, randInt, roundRect, starSprite } from './core';
import { drawAmmoGlyph2, drawStuckItem2 } from './shapes2';
import { drawAmmoGlyph6, drawStuckItem6 } from './shapes6';
import { drawAmmoGlyph7, drawStuckItem7 } from './shapes7';
import type { StuckItem, WeaponId } from './weapons';

// ───────────────────────── palettes ─────────────────────────
export const GOLD_Y: [number, string][] = [
  [0, '#fff6cf'],
  [0.12, '#ffdc68'],
  [0.4, '#e09f23'],
  [0.66, '#9a5a08'],
  [0.84, '#e9b64a'],
  [1, '#6b3a05'],
];
export const GOLD_X: [number, string][] = [
  [0, '#6b3a05'],
  [0.22, '#e3a52c'],
  [0.4, '#fff3c4'],
  [0.58, '#f2bf45'],
  [0.82, '#a3650c'],
  [1, '#5e3204'],
];
export const WOOD_COLS = ['196,140,80', '170,112,58', '222,178,118', '140,90,45', '235,200,140', '120,72,34'];

// ───────────────────────── wheel texture ─────────────────────────
export const TEX_SCALE = 2.5;

export function createWheelTexture(R: number, seed = 11): HTMLCanvasElement {
  const rnd = mulberry32(seed);
  const scale = TEX_SCALE;
  const pad = 3;
  const S = Math.ceil((R + pad) * 2 * scale);
  const c = makeCanvas(S, S);
  const g = c.getContext('2d')!;
  g.translate(S / 2, S / 2);
  g.scale(scale, scale);
  const bark = 9;
  const Ri = R - bark;
  const p1 = rnd() * TAU;
  const p2 = rnd() * TAU;
  const p3 = rnd() * TAU;
  const edgeR = (a: number) =>
    R - 0.4 - 0.5 * (1 + Math.sin(a * 7 + p1)) * 0.5 - 0.45 * (1 + Math.sin(a * 17 + p2)) * 0.5 - 0.35 * (1 + Math.sin(a * 31 + p3)) * 0.5;

  // bark
  g.beginPath();
  for (let i = 0; i <= 260; i++) {
    const a = (i / 260) * TAU;
    const r = edgeR(a);
    if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  const bg = g.createRadialGradient(0, 0, Ri - 2, 0, 0, R);
  bg.addColorStop(0, '#74482a');
  bg.addColorStop(0.45, '#4d2e16');
  bg.addColorStop(1, '#2a170a');
  g.fillStyle = bg;
  g.fill();
  g.save();
  g.clip();
  for (let i = 0; i < 260; i++) {
    const a = rnd() * TAU;
    const r0 = Ri + rnd() * 3;
    const r1 = r0 + 2 + rnd() * 6;
    const da = (rnd() - 0.5) * 0.03;
    g.strokeStyle = rnd() < 0.6 ? `rgba(18,9,3,${0.35 + rnd() * 0.4})` : `rgba(160,112,66,${0.22 + rnd() * 0.3})`;
    g.lineWidth = 0.5 + rnd() * 1.4;
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a + da) * r1, Math.sin(a + da) * r1);
    g.stroke();
  }
  for (let i = 0; i < 80; i++) {
    const a = rnd() * TAU;
    const r = Ri + 2 + rnd() * (bark - 3);
    const span = 0.03 + rnd() * 0.06;
    g.strokeStyle = `rgba(178,128,78,${0.15 + rnd() * 0.25})`;
    g.lineWidth = 0.8 + rnd();
    g.beginPath();
    g.arc(0, 0, r, a, a + span);
    g.stroke();
  }
  g.restore();

  // inner bark line + wood
  g.beginPath();
  g.arc(0, 0, Ri + 0.7, 0, TAU);
  g.fillStyle = '#3b210f';
  g.fill();
  const pcx = -1.5;
  const pcy = -2.5;
  g.beginPath();
  g.arc(0, 0, Ri - 0.4, 0, TAU);
  const wg = g.createRadialGradient(pcx, pcy, 0, 0, 0, Ri);
  wg.addColorStop(0, '#b4743a');
  wg.addColorStop(0.08, '#d69853');
  wg.addColorStop(0.3, '#e8b46e');
  wg.addColorStop(0.7, '#dca35e');
  wg.addColorStop(0.85, '#e8c085');
  wg.addColorStop(0.95, '#f1d6a2');
  wg.addColorStop(1, '#d6ad73');
  g.fillStyle = wg;
  g.fill();

  g.save();
  g.beginPath();
  g.arc(0, 0, Ri - 0.4, 0, TAU);
  g.clip();
  // growth rings
  const rings = 17;
  for (let i = 1; i <= rings; i++) {
    const f = i / rings;
    const base = (Ri - 1) * Math.pow(f, 0.93);
    const ox = pcx * (1 - f);
    const oy = pcy * (1 - f);
    const q1 = rnd() * TAU;
    const q2 = rnd() * TAU;
    const amp1 = 0.018 + rnd() * 0.015;
    const amp2 = 0.008 + rnd() * 0.01;
    const path = () => {
      g.beginPath();
      for (let j = 0; j <= 160; j++) {
        const a = (j / 160) * TAU;
        const rr = base * (1 + amp1 * Math.sin(a * 3 + q1) + amp2 * Math.sin(a * 7 + q2));
        const x = ox + Math.cos(a) * rr;
        const y = oy + Math.sin(a) * rr;
        if (j === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
    };
    path();
    g.strokeStyle = `rgba(150,85,35,${0.06 + rnd() * 0.08})`;
    g.lineWidth = 2.5 + rnd() * 3.5;
    g.stroke();
    path();
    g.strokeStyle = `rgba(105,55,20,${0.2 + rnd() * 0.25})`;
    g.lineWidth = 0.5 + rnd() * 1.1;
    g.stroke();
  }
  // medullary rays
  for (let i = 0; i < 46; i++) {
    const a = rnd() * TAU;
    const r0 = 6 + rnd() * 20;
    const r1 = r0 + 15 + rnd() * (Ri - r0 - 15);
    g.strokeStyle = `rgba(255,235,200,${0.05 + rnd() * 0.07})`;
    g.lineWidth = 0.6;
    g.beginPath();
    g.moveTo(pcx + Math.cos(a) * r0, pcy + Math.sin(a) * r0);
    g.lineTo(pcx + Math.cos(a) * r1, pcy + Math.sin(a) * r1);
    g.stroke();
  }
  // speckles
  for (let i = 0; i < 1300; i++) {
    const a = rnd() * TAU;
    const r = Math.sqrt(rnd()) * Ri;
    g.fillStyle = rnd() < 0.5 ? `rgba(110,60,25,${0.08 + rnd() * 0.12})` : `rgba(255,230,190,${0.05 + rnd() * 0.08})`;
    g.fillRect(Math.cos(a) * r, Math.sin(a) * r, 0.6 + rnd() * 0.8, 0.6 + rnd() * 0.8);
  }
  // knot
  {
    const a = rnd() * TAU;
    const r = Ri * 0.56;
    const kx = Math.cos(a) * r;
    const ky = Math.sin(a) * r;
    for (let k = 4; k >= 1; k--) {
      g.beginPath();
      g.ellipse(kx, ky, 1.7 * k + 1, 1.15 * k + 0.8, a, 0, TAU);
      g.strokeStyle = `rgba(95,48,18,${0.2 + 0.08 * (4 - k)})`;
      g.lineWidth = 0.8;
      g.stroke();
    }
    g.beginPath();
    g.ellipse(kx, ky, 2.3, 1.5, a, 0, TAU);
    g.fillStyle = 'rgba(78,36,12,0.78)';
    g.fill();
  }
  // pith
  {
    const pg = g.createRadialGradient(pcx, pcy, 0, pcx, pcy, 5);
    pg.addColorStop(0, 'rgba(90,45,15,0.95)');
    pg.addColorStop(0.5, 'rgba(120,65,25,0.5)');
    pg.addColorStop(1, 'rgba(120,65,25,0)');
    g.fillStyle = pg;
    g.beginPath();
    g.arc(pcx, pcy, 5, 0, TAU);
    g.fill();
  }
  // radial checking cracks
  const nCr = 4 + Math.floor(rnd() * 2);
  for (let i = 0; i < nCr; i++) {
    const a0 = (i / nCr) * TAU + rnd() * 0.8;
    const len = Ri * (0.32 + rnd() * 0.45);
    const steps = 14;
    const left: number[] = [];
    const right: number[] = [];
    let a = a0;
    for (let s = 0; s <= steps; s++) {
      const f = s / steps;
      const r = Ri + 1 - f * len;
      a += (rnd() - 0.5) * 0.06;
      const w = (1 - f) * (1.5 + rnd() * 0.5) + 0.12;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      left.push(x + nx * w, y + ny * w);
      right.push(x - nx * w, y - ny * w);
    }
    g.beginPath();
    g.moveTo(left[0], left[1]);
    for (let k = 2; k < left.length; k += 2) g.lineTo(left[k], left[k + 1]);
    for (let k = right.length - 2; k >= 0; k -= 2) g.lineTo(right[k], right[k + 1]);
    g.closePath();
    g.fillStyle = 'rgba(45,22,8,0.85)';
    g.fill();
    g.beginPath();
    g.moveTo(right[0], right[1]);
    for (let k = 2; k < right.length; k += 2) g.lineTo(right[k] + 0.4, right[k + 1] + 0.4);
    g.strokeStyle = 'rgba(255,225,180,0.35)';
    g.lineWidth = 0.6;
    g.stroke();
  }
  const sg = g.createRadialGradient(0, 0, Ri - 7, 0, 0, Ri);
  sg.addColorStop(0, 'rgba(80,40,10,0)');
  sg.addColorStop(1, 'rgba(80,40,10,0.3)');
  g.fillStyle = sg;
  g.beginPath();
  g.arc(0, 0, Ri, 0, TAU);
  g.fill();
  g.restore();
  return c;
}

export function cloneCanvas(src: HTMLCanvasElement) {
  const c = makeCanvas(src.width, src.height);
  c.getContext('2d')!.drawImage(src, 0, 0);
  return c;
}

// ───────────────────────── shatter pieces ─────────────────────────
export interface ShatterPoly {
  poly: number[];
  cx: number;
  cy: number;
}

export function makeShatterPolys(R: number, n: number): ShatterPoly[] {
  const cuts: number[] = [];
  const off = Math.random() * TAU;
  for (let i = 0; i < n; i++) cuts.push(off + ((i + (Math.random() - 0.5) * 0.5) / n) * TAU);
  const center = [rand(-6, 6), rand(-6, 6)];
  const edges = cuts.map((a) => {
    const pts: number[] = [center[0], center[1]];
    const steps = 4;
    for (let s = 1; s < steps; s++) {
      const r = (s / steps) * R;
      const aa = a + rand(-0.1, 0.1);
      pts.push(Math.cos(aa) * r, Math.sin(aa) * r);
    }
    pts.push(Math.cos(a) * (R + 3), Math.sin(a) * (R + 3));
    return pts;
  });
  const out: ShatterPoly[] = [];
  for (let i = 0; i < n; i++) {
    const a1 = cuts[i];
    const a2 = i + 1 < n ? cuts[i + 1] : cuts[0] + TAU;
    const e1 = edges[i];
    const e2 = edges[(i + 1) % n];
    const poly: number[] = [...e1];
    const steps = Math.max(2, Math.ceil((a2 - a1) / 0.12));
    for (let s = 1; s < steps; s++) {
      const a = a1 + ((a2 - a1) * s) / steps;
      poly.push(Math.cos(a) * (R + 3), Math.sin(a) * (R + 3));
    }
    for (let k = e2.length - 2; k >= 2; k -= 2) poly.push(e2[k], e2[k + 1]);
    let cx = 0;
    let cy = 0;
    const m = poly.length / 2;
    for (let k = 0; k < poly.length; k += 2) {
      cx += poly[k];
      cy += poly[k + 1];
    }
    out.push({ poly, cx: cx / m, cy: cy / m });
  }
  return out;
}

/** crack polylines radiating inward from a rim point (local coords) */
export function makeCracks(theta: number, R: number, n: number, len: [number, number], spread = 1.2): number[][] {
  const ox = Math.cos(theta) * (R - 3);
  const oy = Math.sin(theta) * (R - 3);
  const inward = theta + Math.PI;
  const out: number[][] = [];
  for (let i = 0; i < n; i++) {
    let a = inward + rand(-spread, spread);
    const L = rand(len[0], len[1]);
    const pts = [ox, oy];
    let x = ox;
    let y = oy;
    const steps = 5;
    for (let s = 0; s < steps; s++) {
      a += rand(-0.35, 0.35);
      x += (Math.cos(a) * L) / steps;
      y += (Math.sin(a) * L) / steps;
      pts.push(x, y);
    }
    out.push(pts);
    if (Math.random() < 0.55) {
      const idx = 2 * randInt(2, 4);
      let bx = pts[idx];
      let by = pts[idx + 1];
      let ba = a + rand(-0.9, 0.9);
      const bp = [bx, by];
      for (let s = 0; s < 3; s++) {
        ba += rand(-0.3, 0.3);
        bx += (Math.cos(ba) * L * 0.4) / 3;
        by += (Math.sin(ba) * L * 0.4) / 3;
        bp.push(bx, by);
      }
      out.push(bp);
    }
  }
  return out;
}

export function strokeLines(c: Ctx, lines: number[][], style: string, width: number, ox = 0, oy = 0) {
  c.strokeStyle = style;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  for (const l of lines) {
    c.beginPath();
    c.moveTo(l[0] + ox, l[1] + oy);
    for (let i = 2; i < l.length; i += 2) c.lineTo(l[i] + ox, l[i + 1] + oy);
    c.stroke();
  }
}

// ───────────────────────── background ─────────────────────────
export function renderBackground(k: number): HTMLCanvasElement {
  const c = makeCanvas(W * k, H * k);
  const g = c.getContext('2d')!;
  g.scale(k, k);
  g.fillStyle = lin(g, 0, 0, 0, H, [
    [0, '#1e0f3b'],
    [0.42, '#2a1452'],
    [1, '#0c0518'],
  ]);
  g.fillRect(0, 0, W, H);
  let rg = g.createRadialGradient(W / 2, 262, 10, W / 2, 262, 330);
  rg.addColorStop(0, 'rgba(175,115,255,0.34)');
  rg.addColorStop(0.45, 'rgba(110,60,210,0.14)');
  rg.addColorStop(1, 'rgba(60,20,120,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
  g.save();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const x = 50 + i * 80;
    g.fillStyle = lin(g, 0, 0, 0, H * 0.8, [
      [0, 'rgba(185,145,255,0.075)'],
      [1, 'rgba(185,145,255,0)'],
    ]);
    g.beginPath();
    g.moveTo(x - 12, 0);
    g.lineTo(x + 12, 0);
    g.lineTo(x + 60 - i * 22, H * 0.8);
    g.lineTo(x + 8 - i * 22, H * 0.8);
    g.closePath();
    g.fill();
  }
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.022)';
  g.lineWidth = 1;
  for (let x = -H; x < W + H; x += 34) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x + H, H);
    g.stroke();
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x - H, H);
    g.stroke();
  }
  rg = g.createRadialGradient(W / 2, H - 70, 10, W / 2, H - 70, 250);
  rg.addColorStop(0, 'rgba(255,205,255,0.1)');
  rg.addColorStop(1, 'rgba(255,205,255,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
  rg = g.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.45, H * 0.8);
  rg.addColorStop(0, 'rgba(0,0,0,0)');
  rg.addColorStop(1, 'rgba(0,0,0,0.62)');
  g.fillStyle = rg;
  g.fillRect(0, 0, W, H);
  return c;
}

// ───────────────────────── apple ─────────────────────────
function appleBodyPath(ctx: Ctx, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.72);
  ctx.bezierCurveTo(r * 0.95, -r * 1.18, r * 1.32, r * 0.25, r * 0.56, r * 0.92);
  ctx.bezierCurveTo(r * 0.28, r * 1.12, -r * 0.28, r * 1.12, -r * 0.56, r * 0.92);
  ctx.bezierCurveTo(-r * 1.32, r * 0.25, -r * 0.95, -r * 1.18, 0, -r * 0.72);
  ctx.closePath();
}

export function drawApple(ctx: Ctx, r: number) {
  ctx.strokeStyle = '#5b3a1a';
  ctx.lineWidth = r * 0.14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.6);
  ctx.quadraticCurveTo(r * 0.05, -r * 1.05, r * 0.22, -r * 1.25);
  ctx.stroke();
  ctx.fillStyle = lin(ctx, r * 0.1, -r * 1.1, r * 0.9, -r * 1.4, [
    [0, '#3fa34d'],
    [1, '#9be15d'],
  ]);
  ctx.beginPath();
  ctx.moveTo(r * 0.12, -r * 1.05);
  ctx.quadraticCurveTo(r * 0.5, -r * 1.55, r * 0.95, -r * 1.25);
  ctx.quadraticCurveTo(r * 0.5, -r * 0.95, r * 0.12, -r * 1.05);
  ctx.fill();
  appleBodyPath(ctx, r);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.3, r * 0.1, 0, 0, r * 1.25);
  g.addColorStop(0, '#ff9a88');
  g.addColorStop(0.35, '#e8312e');
  g.addColorStop(0.8, '#a3121a');
  g.addColorStop(1, '#6a0a10');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.42, -r * 0.3, r * 0.15, r * 0.26, 0.5, 0, TAU);
  ctx.fill();
}

export function drawAppleHalf(ctx: Ctx, r: number, side: number) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(side > 0 ? 0 : -r * 2, -r * 2, r * 2, r * 4);
  ctx.clip();
  drawApple(ctx, r);
  ctx.restore();
  ctx.fillStyle = lin(ctx, 0, -r, 0, r, [
    [0, '#fff6d8'],
    [1, '#efd593'],
  ]);
  ctx.beginPath();
  if (side > 0) ctx.ellipse(0, r * 0.12, r * 0.32, r * 0.85, 0, -Math.PI / 2, Math.PI / 2);
  else ctx.ellipse(0, r * 0.12, r * 0.32, r * 0.85, 0, Math.PI / 2, Math.PI * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3b1f0d';
  ctx.beginPath();
  ctx.ellipse(side * r * 0.1, r * 0.05, r * 0.06, r * 0.13, 0, 0, TAU);
  ctx.fill();
}

// ───────────────────────── projectile shapes ─────────────────────────
interface SmallArtSprite { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number }
const goldArtSprites = new Map<string, SmallArtSprite>();

/** Cache static brass art at high resolution; headless recording contexts keep the original paths. */
function cachedGoldArt(
  ctx: Ctx, key: string, x: number, y: number, w: number, h: number,
  draw: (c: Ctx, arg1: number, arg2: number) => void, arg1 = 0, arg2 = 0,
): SmallArtSprite | null {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement)) return null;
  const cached = goldArtSprites.get(key);
  if (cached) return cached;
  try {
    const density = 3;
    const canvas = makeCanvas(w * density, h * density);
    const c = canvas.getContext('2d');
    if (!c) return null;
    c.setTransform(density, 0, 0, density, -x * density, -y * density);
    draw(c, arg1, arg2);
    const sprite = { canvas, x, y, w, h };
    if (goldArtSprites.size >= 48) {
      const oldest = goldArtSprites.keys().next().value;
      if (oldest !== undefined) goldArtSprites.delete(oldest);
    }
    goldArtSprites.set(key, sprite);
    return sprite;
  } catch {
    return null;
  }
}

/** golden bullet, nose up, centered */
export function drawGoldBullet(ctx: Ctx, L = 16, w = 6.4) {
  const x = Math.floor(-w / 2 - 2);
  const y = Math.floor(-L / 2 - 2);
  const width = Math.ceil(w / 2 + 2) - x;
  const height = Math.ceil(L / 2 + 2) - y;
  const sprite = cachedGoldArt(ctx, `bullet:${L}:${w}`, x, y, width, height, drawGoldBulletVector, L, w);
  if (sprite) {
    ctx.drawImage(sprite.canvas, sprite.x, sprite.y, sprite.w, sprite.h);
    return;
  }
  drawGoldBulletVector(ctx, L, w);
}

function drawGoldBulletVector(ctx: Ctx, L: number, w: number) {
  const top = -L / 2;
  const bot = L / 2;
  const sh = top + L * 0.42;
  ctx.beginPath();
  ctx.moveTo(-w / 2, bot);
  ctx.lineTo(-w / 2, sh);
  ctx.bezierCurveTo(-w / 2, top + L * 0.12, -w * 0.18, top, 0, top);
  ctx.bezierCurveTo(w * 0.18, top, w / 2, top + L * 0.12, w / 2, sh);
  ctx.lineTo(w / 2, bot);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, GOLD_X);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,60,5,0.75)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-w / 2, bot - L * 0.22);
  ctx.lineTo(w / 2, bot - L * 0.22);
  ctx.stroke();
  ctx.fillStyle = '#8a5208';
  ctx.fillRect(-w / 2, bot - 1.2, w, 1.2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-w * 0.18, sh - L * 0.08, w * 0.12, L * 0.5);
}

/** brass casing, centered upright */
export function drawCasing(ctx: Ctx) {
  const sprite = cachedGoldArt(ctx, 'casing', -5, -8, 10, 16, drawCasingVector);
  if (sprite) {
    ctx.drawImage(sprite.canvas, sprite.x, sprite.y, sprite.w, sprite.h);
    return;
  }
  drawCasingVector(ctx);
}

function drawCasingVector(ctx: Ctx) {
  const w = 5.2;
  const h = 12;
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, GOLD_X);
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#3a2004';
  ctx.beginPath();
  ctx.ellipse(0, -h / 2, w / 2 - 0.4, 1, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = lin(ctx, -w / 2 - 0.6, 0, w / 2 + 0.6, 0, GOLD_X);
  ctx.fillRect(-w / 2 - 0.5, h / 2 - 1.6, w + 1, 1.6);
  ctx.fillStyle = 'rgba(90,50,5,0.8)';
  ctx.fillRect(-w / 2, h / 2 - 2.6, w, 0.8);
}

/** blowpipe dart: tip at (0,0) pointing up, tail toward +Y (len 38) */
export function drawDart(ctx: Ctx) {
  ctx.lineCap = 'round';
  ctx.strokeStyle = lin(ctx, -1, 0, 1, 0, [
    [0, '#9a7a45'],
    [0.5, '#f0dcaa'],
    [1, '#8a6a38'],
  ]);
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.lineTo(0, 28);
  ctx.stroke();
  ctx.fillStyle = lin(ctx, -1.3, 0, 1.3, 0, [
    [0, '#0e1a0a'],
    [0.45, '#5b8a2e'],
    [1, '#0c1608'],
  ]);
  ctx.beginPath();
  ctx.moveTo(0, -0.6);
  ctx.lineTo(1.2, 8.5);
  ctx.lineTo(-1.2, 8.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(190,255,140,0.65)';
  ctx.fillRect(-0.35, 2, 0.5, 5);
  ctx.fillStyle = '#c1121f';
  ctx.fillRect(-1.4, 21.6, 2.8, 1.8);
  ctx.beginPath();
  ctx.moveTo(-1.2, 23.4);
  ctx.lineTo(1.2, 23.4);
  ctx.lineTo(6, 37);
  ctx.quadraticCurveTo(0, 40, -6, 37);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -6, 0, 6, 0, [
    [0, '#c7b083'],
    [0.42, '#fffaf0'],
    [1, '#bba476'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,120,70,0.5)';
  ctx.lineWidth = 0.5;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 0.3, 24);
    ctx.lineTo(i * 2.3, 37.6);
    ctx.stroke();
  }
}

export function drawStone(ctx: Ctx, shape: number[], r: number) {
  polyPath(ctx, shape, true);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.25);
  g.addColorStop(0, '#dcd6cc');
  g.addColorStop(0.45, '#928b80');
  g.addColorStop(1, '#3c3833');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,28,25,0.55)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = 'rgba(40,36,32,0.5)';
  for (let i = 0; i < shape.length; i += 4) ctx.fillRect(shape[i] * 0.42, shape[i + 1] * 0.42, 1.1, 1.1);
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.38, r * 0.26, r * 0.13, -0.6, 0, TAU);
  ctx.fill();
}

/** red shotgun shell, upright centered */
export function drawShell(ctx: Ctx) {
  ctx.fillStyle = lin(ctx, -3.4, 0, 3.4, 0, [
    [0, '#6e0b0b'],
    [0.4, '#ff4b3e'],
    [1, '#6e0b0b'],
  ]);
  roundRect(ctx, -3.4, -9, 6.8, 13.5, 1.4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,0,0,0.5)';
  ctx.lineWidth = 0.5;
  for (let i = -1.5; i <= 1.5; i += 1.5) {
    ctx.beginPath();
    ctx.moveTo(i, -8);
    ctx.lineTo(i, 4);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(50,0,0,0.85)';
  ctx.beginPath();
  ctx.moveTo(-3, -8.3);
  ctx.lineTo(3, -8.3);
  ctx.stroke();
  ctx.fillStyle = lin(ctx, -3.8, 0, 3.8, 0, [
    [0, '#7a5410'],
    [0.4, '#ffe08a'],
    [1, '#7a5410'],
  ]);
  ctx.fillRect(-3.6, 4, 7.2, 4.6);
  ctx.fillRect(-4.1, 7.6, 8.2, 1.4);
}

export function drawWad(ctx: Ctx) {
  ctx.fillStyle = 'rgba(240,240,235,0.9)';
  roundRect(ctx, -3, -3, 6, 7, 1.2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(240,240,235,0.9)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-2.4, -3);
  ctx.lineTo(-4.6, -7.5);
  ctx.moveTo(0, -3);
  ctx.lineTo(0, -8);
  ctx.moveTo(2.4, -3);
  ctx.lineTo(4.6, -7.5);
  ctx.stroke();
}

// ───────────────────────── singularity (black hole) ─────────────────────────
function diskHalf(ctx: Ctx, x: number, y: number, r: number, t: number, front: boolean, power: number, tilt: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.globalCompositeOperation = 'lighter';
  const a = r * 1.9;
  const b = r * 0.5;
  const s0 = front ? 0 : Math.PI;
  const s1 = front ? Math.PI : TAU;
  const grad = ctx.createLinearGradient(-a * 1.6, 0, a * 1.6, 0);
  grad.addColorStop(0, 'rgba(255,235,255,1)');
  grad.addColorStop(0.45, 'rgba(225,130,255,0.9)');
  grad.addColorStop(1, 'rgba(110,40,230,0.6)');
  ctx.strokeStyle = grad;
  ctx.lineCap = 'round';
  ctx.globalAlpha = Math.min(1, power * 0.35);
  ctx.lineWidth = r * 0.55;
  ctx.beginPath();
  ctx.ellipse(0, 0, a * 1.22, b * 1.22, 0, s0, s1);
  ctx.stroke();
  for (let k = 0; k < 3; k++) {
    const sc = 1 + k * 0.3;
    ctx.globalAlpha = Math.min(1, power * (0.9 - k * 0.22));
    ctx.lineWidth = r * (0.34 - k * 0.08);
    ctx.setLineDash([r * (0.9 + k * 0.4), r * (0.35 + k * 0.2)]);
    ctx.lineDashOffset = -t * r * (14 - k * 3);
    ctx.beginPath();
    ctx.ellipse(0, 0, a * sc, b * sc, 0, s0, s1);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 5; i++) {
    const phi = t * (5 - i * 0.4) + i * 1.3;
    const ph = ((phi % TAU) + TAU) % TAU;
    if (ph < Math.PI !== front) continue;
    const sc = 1 + (i % 3) * 0.3;
    drawSprite(ctx, glowSprite('255,205,255'), Math.cos(ph) * a * sc, Math.sin(ph) * b * sc, r * 1.0, 0.8 * Math.min(1, power));
  }
  ctx.restore();
}

export function drawSingularity(ctx: Ctx, x: number, y: number, r: number, t: number, power = 1, tilt = -0.32) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('120,50,255'), x, y, r * 7, 0.5 * power);
  drawSprite(ctx, glowSprite('220,110,255'), x, y, r * 3.2, 0.5 * power);
  ctx.restore();
  diskHalf(ctx, x, y, r, t, false, power, tilt);
  const hg = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.15);
  hg.addColorStop(0, 'rgba(0,0,0,1)');
  hg.addColorStop(0.55, 'rgba(10,0,25,0.6)');
  hg.addColorStop(1, 'rgba(10,0,25,0)');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.15, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.56, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(255,220,255,${Math.min(1, 0.95 * power)})`;
  ctx.lineWidth = Math.max(0.7, r * 0.07);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.6, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(180,100,255,${Math.min(1, 0.45 * power)})`;
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.71, 0, TAU);
  ctx.stroke();
  ctx.restore();
  diskHalf(ctx, x, y, r, t, true, power, tilt);
}

// ───────────────────────── water bead ─────────────────────────
function drawBead(ctx: Ctx, s: number) {
  const g = ctx.createRadialGradient(s * 0.1, -s * 0.35, s * 0.1, s * 0.2, 0, s * 1.1);
  g.addColorStop(0, 'rgba(235,250,255,0.95)');
  g.addColorStop(0.4, 'rgba(140,205,255,0.6)');
  g.addColorStop(1, 'rgba(40,110,210,0.75)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(s * 0.25, 0, s * 0.8, s, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,70,150,0.45)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  ctx.arc(s * 0.45, -s * 0.38, s * 0.26, 0, TAU);
  ctx.fill();
}

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
export function drawStuckItem(ctx: Ctx, it: StuckItem, R: number, time: number) {
  switch (it.weapon) {
    case 'golden': {
      ctx.save();
      ctx.translate(R + 4, 0);
      ctx.rotate(-Math.PI / 2);
      drawGoldBullet(ctx, 16, 6.6);
      ctx.restore();
      const hot = Math.max(0, 1 - it.t / 1.1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (hot > 0) {
        drawSprite(ctx, glowSprite('255,150,40'), R + 8, 0, 44, 0.85 * hot);
        drawSprite(ctx, glowSprite('255,240,200'), R + 10, 0, 16, hot);
      }
      drawSprite(ctx, glowSprite('255,200,90'), R + 9, 0, 22, 0.25);
      const ph = (time * 0.45 + it.seed) % 1;
      if (ph < 0.12) {
        const k = Math.sin((ph / 0.12) * Math.PI);
        drawSprite(ctx, starSprite('255,230,150'), R + 9, -2, 22 * k, k, time);
      }
      ctx.restore();
      break;
    }
    case 'ketapel': {
      ctx.save();
      ctx.translate(R + 3.5, 0);
      ctx.rotate(it.rotS ?? 0);
      drawStone(ctx, it.shape ?? [], 8.2);
      ctx.restore();
      break;
    }
    case 'sumpit': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 6.5) * Math.sin(it.t * 62);
      ctx.save();
      ctx.translate(R, 0);
      ctx.rotate(wob);
      ctx.translate(-15, 0);
      ctx.rotate(-Math.PI / 2);
      drawDart(ctx);
      ctx.restore();
      break;
    }
    case 'blackhole': {
      const ph = it.t / 0.32;
      const grow = ph < 1 ? 1 + 1.1 * Math.sin(ph * Math.PI * 0.5) : Math.max(1, 2.1 - (it.t - 0.32) * 9);
      drawSingularity(ctx, R - 1, 0, 8 * grow, time * 1.5 + it.seed, ph < 1 ? 1.4 : 1, 0.2);
      break;
    }
    case 'soaker': {
      const beads = it.beads ?? [];
      beads.forEach((b, i) => {
        const jig = 1 + 0.07 * Math.sin(time * 18 + i * 2.1) * Math.exp(-it.t * 1.5);
        ctx.save();
        ctx.rotate(b.da);
        ctx.translate(R - 0.5, 0);
        ctx.scale(jig, 1 / jig);
        drawBead(ctx, b.s);
        ctx.restore();
      });
      break;
    }
    case 'shotgun':
      break;
    default:
      drawStuckItem2(ctx, it, R, time);
      drawStuckItem6(ctx, it, R, time);
      drawStuckItem7(ctx, it, R, time);
      break;
  }
}

// ───────────────────────── ammo icons (HUD) ─────────────────────────
const iconCache = new Map<string, HTMLCanvasElement>();
const ICON_STONE = [7, 0, 4.6, 5.6, -1.2, 6.8, -6, 3.4, -6.6, -2.2, -2.4, -6.4, 4, -5.6];

export function ammoIcon(weapon: WeaponId, used: boolean): HTMLCanvasElement {
  const key = weapon + (used ? '1' : '0');
  let c = iconCache.get(key);
  if (c) return c;
  c = makeCanvas(64, 64);
  const g = c.getContext('2d')!;
  g.translate(32, 32);
  g.scale(2.2, 2.2);
  switch (weapon) {
    case 'golden':
      g.save();
      g.translate(0, 3.5);
      g.fillStyle = lin(g, -3.4, 0, 3.4, 0, GOLD_X);
      g.fillRect(-3.4, -2, 6.8, 10.5);
      g.fillStyle = '#7a4506';
      g.fillRect(-3.8, 7.3, 7.6, 1.4);
      g.restore();
      g.save();
      g.translate(0, -5);
      drawGoldBullet(g, 10, 6);
      g.restore();
      break;
    case 'blackhole': {
      const rg = g.createRadialGradient(0, 0, 1, 0, 0, 9);
      rg.addColorStop(0, '#000');
      rg.addColorStop(0.45, '#12021f');
      rg.addColorStop(0.6, '#e2a8ff');
      rg.addColorStop(0.75, '#8a3ffc');
      rg.addColorStop(1, 'rgba(90,30,200,0)');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(0, 0, 9, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(240,200,255,0.9)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.ellipse(0, 0, 10.5, 3, -0.35, 0, TAU);
      g.stroke();
      break;
    }
    case 'ketapel':
      drawStone(g, ICON_STONE, 7);
      break;
    case 'sumpit':
      g.save();
      g.scale(0.62, 0.62);
      g.translate(0, -18);
      drawDart(g);
      g.restore();
      break;
    case 'shotgun':
      g.save();
      g.scale(1.15, 1.15);
      drawShell(g);
      g.restore();
      break;
    case 'soaker': {
      g.beginPath();
      g.moveTo(0, -10);
      g.bezierCurveTo(4, -4, 7.5, 0, 7.5, 3.5);
      g.bezierCurveTo(7.5, 8, 4, 10.5, 0, 10.5);
      g.bezierCurveTo(-4, 10.5, -7.5, 8, -7.5, 3.5);
      g.bezierCurveTo(-7.5, 0, -4, -4, 0, -10);
      g.closePath();
      const dg = g.createRadialGradient(-2, 1, 1, 0, 3, 10);
      dg.addColorStop(0, '#d8f3ff');
      dg.addColorStop(0.5, '#4cc9f0');
      dg.addColorStop(1, '#1d6fd1');
      g.fillStyle = dg;
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.beginPath();
      g.ellipse(-3, 2, 1.4, 2.6, 0.3, 0, TAU);
      g.fill();
      break;
    }
    default:
      drawAmmoGlyph2(g, weapon);
      drawAmmoGlyph6(g, weapon);
      drawAmmoGlyph7(g, weapon);
      break;
  }
  if (used) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = '#2c2244';
    g.fillRect(0, 0, 64, 64);
  }
  iconCache.set(key, c);
  return c;
}
