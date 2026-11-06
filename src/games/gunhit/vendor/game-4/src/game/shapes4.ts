import { type Ctx, TAU, clamp, drawSprite, easeOutBack, easeOutCubic, glowSprite, lin, makeCanvas, mulberry32, polyPath, roundRect, starSprite } from './core';
import { drawAmmoGlyph5, drawStuckItem5 } from './shapes5';
import type { StuckItem, WeaponId } from './weapons';

export const PETAL_COLS: [string, string][] = [
  ['#fff2f6', '#ffb3cc'],
  ['#ffd9e6', '#ff8fb5'],
  ['#ffe6ee', '#ffa3c2'],
  ['#ffffff', '#ffc2d6'],
];

export const ROCKET_COLS = [
  { body: '#e5283d', dark: '#8a1220', burst: ['255,70,90', '255,170,120', '255,230,200', '255,120,60'] },
  { body: '#2f7bff', dark: '#18439b', burst: ['90,170,255', '150,230,255', '230,245,255', '110,120,255'] },
  { body: '#ffd23a', dark: '#a87608', burst: ['255,220,90', '255,250,170', '255,170,50', '255,255,255'] },
];

export function hexPath(ctx: Ctx, r: number, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i * TAU) / 6;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** layered flame pointing up (-Y), additive, base at origin */
export function drawFlame4(ctx: Ctx, len: number, wid: number, time: number, seed: number, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const layers = [
    { s: 1, c0: '255,120,20', c1: '255,60,10', a: 0.85 },
    { s: 0.7, c0: '255,205,70', c1: '255,120,20', a: 0.9 },
    { s: 0.4, c0: '255,255,230', c1: '255,225,110', a: 1 },
  ];
  layers.forEach((L, i) => {
    const l = len * L.s * (0.9 + 0.1 * Math.sin(time * 13 + seed + i * 1.7));
    const w = wid * L.s;
    const sw = Math.sin(time * 9 + seed * 2 + i) * w * 0.3;
    const g = ctx.createLinearGradient(0, 0, 0, -l);
    g.addColorStop(0, `rgba(${L.c0},${L.a * alpha})`);
    g.addColorStop(0.55, `rgba(${L.c1},${L.a * 0.7 * alpha})`);
    g.addColorStop(1, `rgba(${L.c1},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-w * 0.5, 0);
    ctx.bezierCurveTo(-w * 0.65, -l * 0.4, sw * 0.5 - w * 0.2, -l * 0.65, sw, -l);
    ctx.bezierCurveTo(sw * 0.5 + w * 0.2, -l * 0.6, w * 0.65, -l * 0.4, w * 0.5, 0);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

// ───────────────────────── DRAGON FIREBALL (head up, trail down) ─────────────────────────
export function drawDragonFlame(ctx: Ctx, x: number, y: number, t: number, s = 1, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,100,25'), 0, 20, 150, 0.55);
  const L = 150;
  const layers = [
    { w: 17, c0: '255,70,15', c1: '255,40,10', a: 0.75 },
    { w: 12, c0: '255,150,40', c1: '255,90,20', a: 0.9 },
    { w: 6, c0: '255,240,190', c1: '255,200,90', a: 0.95 },
  ];
  for (const lay of layers) {
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const cx = Math.sin(u * 8 - t * 16) * 9 * u;
      const w = lay.w * (1 - u) * (1 + 0.2 * Math.sin(u * 12 - t * 20)) + 0.4;
      const yy = 8 + u * L;
      left.push(cx - w, yy);
      right.push(cx + w, yy);
    }
    ctx.beginPath();
    ctx.moveTo(left[0], left[1]);
    for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i], left[i + 1]);
    for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i], right[i + 1]);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, 8, 0, 8 + L);
    gr.addColorStop(0, `rgba(${lay.c0},${lay.a})`);
    gr.addColorStop(0.5, `rgba(${lay.c1},${lay.a * 0.6})`);
    gr.addColorStop(1, `rgba(${lay.c1},0)`);
    ctx.fillStyle = gr;
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  // horns
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(k * 8, 2);
    ctx.quadraticCurveTo(k * 24, -8, k * 32, 14);
    ctx.quadraticCurveTo(k * 20, 6, k * 8, 13);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, 0, -8, 0, 14, [
      [0, '#fff1c0'],
      [1, '#ff7a1a'],
    ]);
    ctx.fill();
  }
  polyPath(ctx, [0, -24, 6, -18, 11, -8, 15, 3, 12, 14, 6, 19, 0, 17, -6, 19, -12, 14, -15, 3, -11, -8, -6, -18]);
  ctx.fillStyle = lin(ctx, 0, -24, 0, 19, [
    [0, '#ffe27a'],
    [0.45, '#ff7a1a'],
    [1, '#b81f08'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,236,170,0.95)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // open mouth + fangs
  polyPath(ctx, [-5.5, -21, 0, -6, 5.5, -21]);
  ctx.fillStyle = '#3a0a04';
  ctx.fill();
  ctx.fillStyle = '#fff6dc';
  for (const k of [-1, 1]) polyPath(ctx, [k * 4.8, -21, k * 3.2, -13.5, k * 1.6, -21]), ctx.fill();
  ctx.fillStyle = '#2a0802';
  ctx.beginPath();
  ctx.arc(-2.2, -16.4, 0.9, 0, TAU);
  ctx.arc(2.2, -16.4, 0.9, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,220,120'), 0, -13, 20, 0.9);
  for (const k of [-1, 1]) {
    ctx.save();
    ctx.translate(k * 6.4, -1.6);
    ctx.rotate(k * 0.55);
    drawSprite(ctx, glowSprite('255,250,200'), 0, 0, 16, 0.9);
    ctx.fillStyle = '#fffbe0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.2, 1.7, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── gravity orb ─────────────────────────
export function drawGravityOrb(ctx: Ctx, x: number, y: number, r: number, t: number, power = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('40,130,255'), x, y, r * 7, 0.5 * power);
  drawSprite(ctx, glowSprite('150,225,255'), x, y, r * 3.2, 0.45 * power);
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#8fe4ff');
  g.addColorStop(0.35, '#1a6fe0');
  g.addColorStop(0.8, '#0a2a78');
  g.addColorStop(1, '#041238');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(2,8,30,0.6)';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.42, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(190,240,255,${Math.min(1, 0.9 * power)})`;
  ctx.lineWidth = Math.max(0.8, r * 0.09);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
  for (let k = 0; k < 2; k++) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * (k ? -0.9 : 1.2) + k * 1.3);
    const rx = r * (1.75 + k * 0.35);
    const ry = r * (0.55 + k * 0.12);
    ctx.strokeStyle = `rgba(${k ? '120,200,255' : '200,245,255'},${Math.min(1, (0.85 - k * 0.2) * power)})`;
    ctx.lineWidth = Math.max(0.8, r * 0.1);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, TAU);
    ctx.stroke();
    const ph = t * (3.5 - k) + k * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(Math.cos(ph) * rx, Math.sin(ph) * ry, r * 0.13, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const a = t * (1.8 + i * 0.3) + i * 1.6;
    const d = r * (1.9 + (i % 2) * 0.5);
    ctx.save();
    ctx.translate(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.55);
    ctx.rotate(a * 2);
    ctx.fillStyle = i % 2 ? '#8a6a44' : '#b89a6a';
    ctx.fillRect(-r * 0.16, -r * 0.11, r * 0.32, r * 0.22);
    ctx.restore();
  }
}

// ───────────────────────── honey glob (tip up) ─────────────────────────
export function drawHoneyGlob(ctx: Ctx, r: number, t: number, stretch = 1) {
  const w = 1 + 0.07 * Math.sin(t * 15);
  const h = 1 - 0.05 * Math.sin(t * 15);
  ctx.save();
  ctx.scale(w, h);
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.55 * stretch);
  ctx.bezierCurveTo(r * 0.3, -r * 0.8, r * 1.05, -r * 0.2, r * 0.98, r * 0.5);
  ctx.bezierCurveTo(r * 0.9, r * 1.08, -r * 0.9, r * 1.08, -r * 0.98, r * 0.5);
  ctx.bezierCurveTo(-r * 1.05, -r * 0.2, -r * 0.3, -r * 0.8, 0, -r * 1.55 * stretch);
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.25, r * 0.05, r * 0.1, 0, r * 0.2, r * 1.2);
  g.addColorStop(0, '#fff6b0');
  g.addColorStop(0.35, '#ffd028');
  g.addColorStop(0.75, '#f09000');
  g.addColorStop(1, '#9a4c00');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,60,0,0.85)';
  ctx.lineWidth = Math.max(0.8, r * 0.1);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, -r * 0.05, r * 0.2, r * 0.38, 0.35, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.arc(r * 0.35, r * 0.55, r * 0.11, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(r * 0.22, r * 0.1);
  hexPath(ctx, r * 0.3, 0.3);
  ctx.strokeStyle = 'rgba(255,246,190,0.7)';
  ctx.lineWidth = Math.max(0.5, r * 0.06);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── coconut ─────────────────────────
const COCO_FIBERS: [number, number, number][] = (() => {
  const rnd = mulberry32(5);
  const o: [number, number, number][] = [];
  for (let i = 0; i < 46; i++) o.push([rnd() * TAU, 0.84 + rnd() * 0.1, 1.04 + rnd() * 0.12]);
  return o;
})();

export function drawCoconut(ctx: Ctx, r: number) {
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.15);
  g.addColorStop(0, '#b88a58');
  g.addColorStop(0.45, '#7a5230');
  g.addColorStop(1, '#2e1a0a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(35,18,6,0.8)';
  ctx.lineWidth = Math.max(0.7, r * 0.06);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const [a, i0, i1] of COCO_FIBERS) {
    ctx.moveTo(Math.cos(a) * r * i0, Math.sin(a) * r * i0);
    ctx.lineTo(Math.cos(a + 0.12) * r * i1, Math.sin(a + 0.12) * r * i1);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,16,6,0.32)';
  ctx.lineWidth = Math.max(0.5, r * 0.04);
  for (const k of [0.55, 0.75]) {
    ctx.beginPath();
    ctx.arc(0, 0, r * k, 0.4, 2.4);
    ctx.stroke();
  }
  ctx.fillStyle = '#1a0d04';
  for (const [ex, ey] of [
    [-0.3, -0.46],
    [0.3, -0.46],
    [0, -0.12],
  ]) {
    ctx.beginPath();
    ctx.arc(ex * r, ey * r, r * 0.13, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,0.4)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,235,200,0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.22, r * 0.12, -0.6, 0, TAU);
  ctx.fill();
}

/** half shell, opening faces up (-Y) */
export function drawCoconutHalf(ctx: Ctx, r: number) {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI, false);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -r, 0, r, 0, [
    [0, '#2e1a0a'],
    [0.4, '#8a5e36'],
    [1, '#2a1708'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(35,18,6,0.85)';
  ctx.lineWidth = Math.max(0.7, r * 0.06);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40,22,8,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = 0.25 + i * 0.3;
    ctx.moveTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
    ctx.lineTo(Math.cos(a + 0.1) * r * 1.04, Math.sin(a + 0.1) * r * 1.04);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * 0.34, 0, 0, TAU);
  ctx.fillStyle = '#f8f3e6';
  ctx.fill();
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = Math.max(0.8, r * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, r * 0.03, r * 0.76, r * 0.22, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, 0, -r * 0.2, 0, r * 0.25, [
    [0, '#d8eefc'],
    [1, '#f6fbff'],
  ]);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.28, -r * 0.02, r * 0.17, r * 0.05, 0, 0, TAU);
  ctx.fill();
}

// ───────────────────────── musical note (head at origin, stem up) ─────────────────────────
export function drawNote(ctx: Ctx, s = 1, kind = 0, fill = '#ffd23f', edge = '#8a5200') {
  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const head = (x: number, y: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.38);
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.6, 4.2, 0, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.ellipse(-1.6, -1.2, 2, 1, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  };
  const stem = (x: number, y0: number, y1: number) => {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    ctx.strokeStyle = fill;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };
  if (kind === 0) {
    stem(5, -1, -22);
    ctx.beginPath();
    ctx.moveTo(5, -22);
    ctx.bezierCurveTo(5, -16, 14, -15, 11, -6);
    ctx.bezierCurveTo(12, -13, 7, -13.5, 5, -14);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.stroke();
    head(0, 0);
  } else {
    stem(-2, -1, -22);
    stem(12, -4, -25);
    polyPath(ctx, [-2, -22, 12, -25, 12, -20, -2, -17]);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.stroke();
    head(-7, 0);
    head(7, -3);
  }
  ctx.restore();
}

// ───────────────────────── sakura ─────────────────────────
function petalPath(ctx: Ctx, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-r * 0.55, -r * 0.25, -r * 0.62, -r * 0.92, -r * 0.14, -r * 1.0);
  ctx.lineTo(0, -r * 0.86);
  ctx.lineTo(r * 0.14, -r * 1.0);
  ctx.bezierCurveTo(r * 0.62, -r * 0.92, r * 0.55, -r * 0.25, 0, 0);
  ctx.closePath();
}

interface PetalSprite { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number; radius: number }
const petalSprites = new Map<string, PetalSprite>();

/** Petal colours and geometry are static; sway, spin and opacity remain live. */
function getPetalSprite(ctx: Ctx, r: number, c0: string, c1: string): PetalSprite | null {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement) || !Number.isFinite(r) || r < 1 || r > 32) return null;
  const radius = Math.round(r);
  const key = `${radius}:${c0}:${c1}`;
  const cached = petalSprites.get(key);
  if (cached) return cached;
  try {
    const x = Math.floor(-radius * 0.8 - 2);
    const y = Math.floor(-radius - 2);
    const w = Math.ceil(radius * 0.8 + 2) - x;
    const h = 2 - y;
    const density = 3;
    const canvas = makeCanvas(w * density, h * density);
    const c = canvas.getContext('2d');
    if (!c) return null;
    c.setTransform(density, 0, 0, density, -x * density, -y * density);
    drawPetalVector(c, radius, c0, c1);
    const sprite = { canvas, x, y, w, h, radius };
    if (petalSprites.size >= 96) {
      const oldest = petalSprites.keys().next().value;
      if (oldest !== undefined) petalSprites.delete(oldest);
    }
    petalSprites.set(key, sprite);
    return sprite;
  } catch {
    return null;
  }
}

export function drawPetal(ctx: Ctx, r: number, c0 = '#fff2f6', c1 = '#ffb3cc') {
  const sprite = getPetalSprite(ctx, r, c0, c1);
  if (sprite) {
    const scale = r / sprite.radius;
    ctx.drawImage(sprite.canvas, sprite.x * scale, sprite.y * scale, sprite.w * scale, sprite.h * scale);
  } else drawPetalVector(ctx, r, c0, c1);
}

function drawPetalVector(ctx: Ctx, r: number, c0: string, c1: string) {
  petalPath(ctx, r);
  ctx.fillStyle = lin(ctx, 0, 0, 0, -r, [
    [0, c0],
    [1, c1],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,100,140,0.5)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

export function drawBlossom(ctx: Ctx, r: number, bloom = 1, rot = 0) {
  ctx.save();
  ctx.rotate(rot);
  const pr = r * (0.25 + 0.75 * bloom);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((i * TAU) / 5);
    drawPetal(ctx, pr);
    ctx.strokeStyle = 'rgba(225,90,135,0.5)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -pr * 0.1);
    ctx.lineTo(0, -pr * 0.62);
    ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = '#e6567e';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.14, 0, TAU);
  ctx.fill();
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + 0.2;
    const L = r * (0.3 + (i % 2) * 0.06) * bloom;
    ctx.strokeStyle = 'rgba(200,60,110,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * L, Math.sin(a) * L);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? '#ffd84a' : '#b0245e';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * L, Math.sin(a) * L, Math.max(0.5, r * 0.04), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────── bee (head up) ─────────────────────────
let beeBodySprite: HTMLCanvasElement | undefined;
function getBeeBodySprite(ctx: Ctx): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement)) return null;
  if (beeBodySprite) return beeBodySprite;
  try {
    const density = 4;
    const canvas = makeCanvas(18 * density, 31 * density);
    const c = canvas.getContext('2d');
    if (!c) return null;
    c.setTransform(density, 0, 0, density, 9 * density, 15 * density);
    drawBeeBody(c);
    beeBodySprite = canvas;
  } catch {
    return null;
  }
  return beeBodySprite ?? null;
}

export function drawBee(ctx: Ctx, s = 1, flap = 0) {
  ctx.save();
  ctx.scale(s, s);
  // Both wings keep their individual, continuously animated flap angle,
  // while sharing one fill and outline instead of drawing each separately.
  ctx.beginPath();
  for (const k of [-1, 1]) {
    const angle = k * (0.7 + 0.55 * flap);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const x = k * 2.4 + 6.4 * sin, y = -1 - 6.4 * cos;
    ctx.moveTo(x + 3.4 * cos, y + 3.4 * sin);
    ctx.ellipse(x, y, 3.4, 7.4, angle, 0, TAU);
  }
  ctx.fillStyle = 'rgba(232,248,255,0.8)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,150,185,0.95)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Wing movement stays continuous; only the unchanging detailed body is
  // cached, so dozens of bees do not recreate gradients and clipped stripes.
  const body = getBeeBodySprite(ctx);
  if (body) ctx.drawImage(body, -9, -15, 18, 31);
  else drawBeeBody(ctx);
  ctx.restore();
}

function drawBeeBody(ctx: Ctx) {
  ctx.strokeStyle = '#2a1706';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (const k of [-1, 1])
    for (const y of [-1.5, 1.5, 4]) {
      ctx.moveTo(k * 3.8, y);
      ctx.lineTo(k * 6.4, y + 2.2);
    }
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 3.4, 4.7, 7.2, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, -5, 0, 5, 0, [
    [0, '#c98500'],
    [0.45, '#ffe45a'],
    [1, '#c98500'],
  ]);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#1c1006';
  ctx.fillRect(-6, 1.4, 12, 2.4);
  ctx.fillRect(-6, 6, 12, 2.4);
  ctx.restore();
  ctx.strokeStyle = '#6a3f00';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = '#1c1006';
  ctx.beginPath();
  ctx.moveTo(-1.2, 9.8);
  ctx.lineTo(1.2, 9.8);
  ctx.lineTo(0, 13.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2208';
  ctx.beginPath();
  ctx.arc(0, -6.2, 3.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-1.7, -7, 1.1, 0, TAU);
  ctx.arc(1.7, -7, 1.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-1.7, -7.2, 0.5, 0, TAU);
  ctx.arc(1.7, -7.2, 0.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#2a1706';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-1, -9.4);
  ctx.lineTo(-3, -12.6);
  ctx.moveTo(1, -9.4);
  ctx.lineTo(3, -12.6);
  ctx.stroke();
}

// ───────────────────────── firework rocket (nose up, body centred) ─────────────────────────
export function drawFireRocket(ctx: Ctx, ci: number, flame = 0, t = 0, stick = 26) {
  const c = ROCKET_COLS[ci % 3];
  ctx.fillStyle = lin(ctx, -1.2, 0, 1.2, 0, [
    [0, '#6a4a1c'],
    [0.5, '#d9b070'],
    [1, '#5a3e14'],
  ]);
  ctx.fillRect(-1.2, 12, 2.4, stick);
  if (flame > 0.02) {
    ctx.save();
    ctx.translate(0, 14);
    ctx.rotate(Math.PI);
    drawFlame4(ctx, 24 * flame, 9, t, 2, 1);
    ctx.restore();
  }
  for (const k of [-1, 1]) {
    polyPath(ctx, [k * 4, 6, k * 8.8, 15, k * 8.8, 17, k * 4, 13]);
    ctx.fillStyle = c.dark;
    ctx.fill();
  }
  roundRect(ctx, -4.2, -7, 8.4, 21, 1.6);
  ctx.fillStyle = lin(ctx, -4.2, 0, 4.2, 0, [
    [0, c.dark],
    [0.4, c.body],
    [1, c.dark],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillRect(-4.2, -2, 8.4, 1.6);
  ctx.fillRect(-4.2, 7, 8.4, 1.6);
  ctx.fillStyle = '#fff6c0';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? 0.9 : 2.2;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(a) * rr, 3.4 + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  polyPath(ctx, [-4.2, -7, 0, -17, 4.2, -7]);
  ctx.fillStyle = lin(ctx, -4, 0, 4, 0, [
    [0, '#c2c2c2'],
    [0.45, '#ffffff'],
    [1, '#adadad'],
  ]);
  ctx.fill();
  ctx.stroke();
}

// ───────────────────────── keris (tip at origin pointing up, hilt toward +Y) ─────────────────────────
export function drawKerisBlade(ctx: Ctx, L = 64, w = 11, waves = 7, amp = 3.2) {
  const left: number[] = [];
  const right: number[] = [];
  const mid: number[] = [];
  const n = 30;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const y = u * L;
    const cx = amp * (0.3 + 0.7 * u) * Math.sin(u * waves * Math.PI);
    const ww = (w / 2) * Math.pow(u, 0.7) + 0.2;
    left.push(cx - ww, y);
    right.push(cx + ww, y);
    mid.push(cx, y);
  }
  ctx.beginPath();
  ctx.moveTo(left[0], left[1]);
  for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i], left[i + 1]);
  for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i], right[i + 1]);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -w / 2 - amp, 0, w / 2 + amp, 0, [
    [0, '#7a4a08'],
    [0.3, '#e9b84a'],
    [0.5, '#fff3c0'],
    [0.7, '#e0a830'],
    [1, '#6a3e06'],
  ]);
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(90,50,5,0.9)';
  ctx.lineWidth = Math.max(0.7, w * 0.07);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,235,0.8)';
  ctx.lineWidth = Math.max(0.6, w * 0.06);
  ctx.beginPath();
  for (let i = 2; i < mid.length; i += 2) {
    if (i === 2) ctx.moveTo(mid[i], mid[i + 1]);
    else ctx.lineTo(mid[i], mid[i + 1]);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,70,10,0.5)';
  ctx.lineWidth = Math.max(0.5, w * 0.05);
  ctx.beginPath();
  for (let i = 5; i < n - 1; i += 2) {
    const k = i * 2;
    ctx.moveTo(mid[k], mid[k + 1]);
    ctx.lineTo(left[k] * 0.55 + mid[k] * 0.45 + w * 0.1, mid[k + 1] - w * 0.18);
    ctx.moveTo(mid[k], mid[k + 1]);
    ctx.lineTo(right[k] * 0.55 + mid[k] * 0.45 - w * 0.1, mid[k + 1] - w * 0.18);
  }
  ctx.stroke();
}

export function drawKeris(ctx: Ctx, L = 64, w = 11) {
  drawKerisBlade(ctx, L, w, 7, w * 0.3);
  polyPath(ctx, [-w * 0.8, L - 2, -w * 0.4, L - 5, w * 0.6, L - 4, w * 1.0, L + 1, w * 0.75, L + 7, -w * 0.2, L + 8, -w * 0.8, L + 5]);
  ctx.fillStyle = lin(ctx, -w, 0, w, 0, [
    [0, '#2a1604'],
    [0.5, '#8a5a1a'],
    [1, '#2a1604'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#e8b84a';
  ctx.lineWidth = Math.max(0.7, w * 0.07);
  ctx.stroke();
  ctx.fillStyle = '#e0243a';
  ctx.beginPath();
  ctx.arc(w * 0.1, L + 2, w * 0.14, 0, TAU);
  ctx.fill();
  const hy = L + 8;
  ctx.beginPath();
  ctx.moveTo(-w * 0.28, hy);
  ctx.bezierCurveTo(-w * 0.34, hy + w * 0.9, -w * 0.7, hy + w * 1.5, -w * 0.55, hy + w * 2.4);
  ctx.bezierCurveTo(-w * 0.3, hy + w * 3.1, w * 0.5, hy + w * 3.0, w * 0.62, hy + w * 2.4);
  ctx.bezierCurveTo(w * 0.75, hy + w * 1.7, w * 0.3, hy + w * 0.9, w * 0.28, hy);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -w * 0.7, 0, w * 0.7, 0, [
    [0, '#7a4a08'],
    [0.4, '#f0c458'],
    [0.6, '#fff0b8'],
    [1, '#7a4a08'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,5,0.9)';
  ctx.lineWidth = Math.max(0.6, w * 0.06);
  ctx.stroke();
  ctx.beginPath();
  for (const f of [0.7, 1.3, 1.9]) {
    ctx.moveTo(-w * 0.4, hy + w * f);
    ctx.lineTo(w * 0.4, hy + w * f);
  }
  ctx.stroke();
}

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
export function drawStuckItem4(ctx: Ctx, it: StuckItem, R: number, time: number) {
  switch (it.weapon) {
    case 'dragon': {
      const pulse = 0.65 + 0.35 * Math.sin(time * 5 + it.seed);
      const hot = Math.max(0, 1 - it.t / 2.5);
      ctx.save();
      ctx.translate(R + 1, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,100,25'), 8, 0, 46 + hot * 30, 0.45 + 0.3 * pulse + hot * 0.3);
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(-2, -9);
      ctx.bezierCurveTo(8, -12, 18, -6, 22, 0);
      ctx.bezierCurveTo(18, 6, 8, 12, -2, 9);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, -2, 0, 22, 0, [
        [0, '#7a0c06'],
        [0.55, '#e03a14'],
        [1, '#ffb347'],
      ]);
      ctx.fill();
      ctx.strokeStyle = '#ffd98a';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(60,5,2,0.7)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(18, 0);
      ctx.moveTo(4, -4);
      ctx.lineTo(15, -2);
      ctx.moveTo(4, 4);
      ctx.lineTo(15, 2);
      ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,200,90,${0.5 * pulse})`;
      ctx.beginPath();
      ctx.ellipse(12, 0, 5, 2.4, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.translate(14, 0);
      ctx.rotate(it.up ?? 0);
      drawFlame4(ctx, 16 + hot * 8, 8, time, it.seed);
      ctx.restore();
      break;
    }
    case 'gravity':
      drawGravityOrb(ctx, R + 9, 0, 7.5, time * 1.3 + it.seed, 0.9);
      break;
    case 'honey': {
      const grow = easeOutBack(clamp(it.t / 0.25, 0, 1));
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.scale(grow, grow);
      const lumps: [number, number, number][] = [
        [3, 0, 8],
        [8, -6, 5.5],
        [8, 6, 5.5],
        [12, 0, 5],
      ];
      for (const [x, y, r] of lumps) {
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
        g.addColorStop(0, '#fff3a0');
        g.addColorStop(0.45, '#ffc928');
        g.addColorStop(1, '#b86400');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(130,70,0,0.7)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.ellipse(7, -4, 2.6, 1.3, -0.6, 0, TAU);
      ctx.ellipse(11, 3, 1.5, 0.9, -0.4, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(R + 4, 0);
      ctx.rotate(it.up ?? 0);
      const len = 3 + 12 * (1 - Math.exp(-it.t * 0.7)) + 1.5 * Math.sin(time * 2 + it.seed);
      ctx.beginPath();
      ctx.moveTo(-2.6, 2);
      ctx.lineTo(2.6, 2);
      ctx.lineTo(1.5, len);
      ctx.arc(0, len, 2.9, 0, Math.PI);
      ctx.lineTo(-2.6, 2);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, 0, 0, 0, len + 3, [
        [0, '#ffd23a'],
        [1, '#e08a00'],
      ]);
      ctx.fill();
      ctx.strokeStyle = 'rgba(130,70,0,0.8)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(-1, len, 0.9, 0, TAU);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'coconut': {
      ctx.save();
      ctx.translate(R - 3, 0);
      ctx.rotate(Math.PI / 2);
      drawCoconutHalf(ctx, 11);
      ctx.restore();
      const ph = (time * 0.5 + it.seed) % 1;
      if (ph < 0.14) {
        const k = Math.sin((ph / 0.14) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('220,245,255'), R + 8, -2, 18 * k, k, time);
        ctx.restore();
      }
      break;
    }
    case 'angklung': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 4.5) * Math.sin(it.t * 50);
      ctx.save();
      ctx.translate(R - 3, 0);
      ctx.rotate(wob);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#6a4a14';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(20, 0);
      ctx.stroke();
      ctx.strokeStyle = '#e8c050';
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.translate(23, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,215,100'), 8, 0, 44, 0.5 + 0.2 * Math.sin(time * 6));
      ctx.restore();
      ctx.rotate(Math.PI / 2);
      drawNote(ctx, 0.95, 0);
      ctx.restore();
      break;
    }
    case 'bee': {
      const flap = Math.sin(time * 75 + it.seed);
      const bob = Math.sin(time * 40 + it.seed) * 0.05;
      ctx.save();
      ctx.translate(R + 11, 0);
      ctx.rotate(Math.PI / 2 + bob);
      drawBee(ctx, 1.25, flap);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,215,80'), R + 10, 0, 30, 0.3);
      ctx.restore();
      break;
    }
    case 'sakura': {
      const bl = easeOutCubic(clamp((it.t - 0.05) / 0.5, 0, 1));
      const sway = Math.sin(time * 2.2 + it.seed) * 0.06;
      ctx.save();
      ctx.translate(R - 2, 0);
      ctx.rotate(sway);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#4a2a14';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(14, -2, 26, 1);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(12, -1);
      ctx.quadraticCurveTo(16, -9, 22, -13);
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(22, 8, 28, 12);
      ctx.stroke();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,170,200'), 24, 0, 56 * bl, 0.3 * bl);
      ctx.restore();
      const spots: [number, number, number][] = [
        [26, 1, 8],
        [22, -13, 6.5],
        [28, 12, 6],
        [13, -8, 5],
      ];
      spots.forEach(([x, y, r], i) => {
        ctx.save();
        ctx.translate(x, y);
        drawBlossom(ctx, r, bl, it.seed + i * 1.3);
        ctx.restore();
      });
      ctx.restore();
      break;
    }
    case 'firework': {
      const ci = it.shape?.[0] ?? 0;
      ctx.save();
      ctx.translate(R + 9, 0);
      ctx.rotate(-Math.PI / 2);
      drawFireRocket(ctx, ci, 0, time, 12);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const fl = 0.7 + 0.3 * Math.sin(time * 30 + it.seed);
      drawSprite(ctx, glowSprite('255,150,50'), R + 34, 0, 16 + 5 * fl, 0.6 * fl + 0.2);
      ctx.restore();
      break;
    }
    case 'keris': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 4.5) * Math.sin(it.t * 52);
      const hot = Math.max(0, 1 - it.t / 1.4);
      ctx.save();
      ctx.translate(R, 0);
      ctx.rotate(wob);
      ctx.translate(-14, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,200,80'), 0, 36, 90, 0.3 + 0.3 * hot + 0.1 * Math.sin(time * 5));
      ctx.restore();
      ctx.scale(0.62, 0.62);
      drawKeris(ctx, 64, 12);
      ctx.restore();
      const ph = (time * 0.6 + it.seed) % 1;
      if (ph < 0.15) {
        const k = Math.sin((ph / 0.15) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('255,235,170'), R + 12, 0, 20 * k, k, time);
        ctx.restore();
      }
      break;
    }
    default:
      drawStuckItem5(ctx, it, R, time);
      break;
  }
}

// ───────────────────────── HUD ammo glyphs (g pre-translated to centre, scaled 2.2x) ─────────────────────────
export function drawAmmoGlyph4(g: Ctx, weapon: WeaponId) {
  switch (weapon) {
    case 'dragon':
      g.save();
      g.translate(0, 9);
      drawFlame4(g, 26, 16, 1.3, 3);
      g.restore();
      g.fillStyle = '#7a0c06';
      g.beginPath();
      g.ellipse(0, 8, 5.4, 2.4, 0, 0, TAU);
      g.fill();
      break;
    case 'gravity':
      drawGravityOrb(g, 0, 0, 6.2, 0.5, 0.8);
      break;
    case 'honey':
      g.save();
      g.translate(0, 2);
      drawHoneyGlob(g, 7.4, 0.3, 1);
      g.restore();
      break;
    case 'coconut':
      drawCoconut(g, 9.4);
      break;
    case 'angklung':
      g.save();
      g.translate(0, 5);
      drawNote(g, 0.62, 1);
      g.restore();
      break;
    case 'bee':
      drawBee(g, 1.35, 0.2);
      break;
    case 'sakura':
      drawBlossom(g, 11, 1, 0.3);
      break;
    case 'firework':
      g.save();
      g.rotate(0.5);
      g.scale(0.7, 0.7);
      g.translate(0, 4);
      drawFireRocket(g, 0, 0, 0, 8);
      g.restore();
      break;
    case 'keris':
      g.save();
      g.rotate(0.55);
      g.scale(0.62, 0.62);
      g.translate(0, -22);
      drawKeris(g, 30, 9);
      g.restore();
      break;
    default:
      drawAmmoGlyph5(g, weapon);
      break;
  }
}
