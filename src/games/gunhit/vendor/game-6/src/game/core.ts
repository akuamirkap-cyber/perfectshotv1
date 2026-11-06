// Core math, particle system and tiny synth audio engine.

export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rnd = (a = 1, b?: number) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const rndi = (a: number, b: number) => Math.floor(rnd(a, b + 1));
export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const angNorm = (a: number) => {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
};

export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a || 1), 0, 1);
  return t * t * (3 - 2 * t);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export function rng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ParticleType =
  | 'spark'
  | 'ember'
  | 'smoke'
  | 'fire'
  | 'shard'
  | 'ring'
  | 'flash'
  | 'bolt'
  | 'glow'
  | 'casing'
  | 'star'
  | 'shock'
  | 'cone'
  | 'flare'
  | 'streak'
  | 'pixel'
  | 'ash'
  | 'rimarc';

export interface Particle {
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  size2: number;
  color: string;
  color2: string;
  rot: number;
  spin: number;
  grav: number;
  drag: number;
  width: number;
  seed: number;
  floor: number;
  bounce: number;
}

export function P(o: Partial<Particle>): Particle {
  const life = o.life ?? 0.5;
  return {
    type: o.type ?? 'spark',
    x: o.x ?? 0,
    y: o.y ?? 0,
    vx: o.vx ?? 0,
    vy: o.vy ?? 0,
    life,
    max: life,
    size: o.size ?? 2,
    size2: o.size2 ?? o.size ?? 2,
    color: o.color ?? '#fff',
    color2: o.color2 ?? 'rgba(255,255,255,0)',
    rot: o.rot ?? 0,
    spin: o.spin ?? 0,
    grav: o.grav ?? 0,
    drag: o.drag ?? 0.98,
    width: o.width ?? 1.6,
    seed: o.seed ?? Math.random() * 1000,
    floor: o.floor ?? 1e9,
    bounce: o.bounce ?? 0,
  };
}

const MAX_NINE_PARTICLES = 180;

export function updateParticles(list: Particle[], dt: number) {
  const len = list.length;
  const excess = len > MAX_NINE_PARTICLES ? len - MAX_NINE_PARTICLES : 0;
  let dropped = 0;
  let write = 0;
  for (let i = 0; i < len; i++) {
    const p = list[i];
    p.life -= dt;
    if (p.life <= 0) continue;
    if (dropped < excess && (p.type === 'smoke' || p.type === 'spark' || p.type === 'ember')) {
      dropped++;
      continue;
    }
    const d = Math.pow(p.drag, dt * 60);
    p.vx *= d;
    p.vy *= d;
    p.vy += p.grav * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
    if (p.y > p.floor) {
      p.y = p.floor;
      p.vy = -p.vy * p.bounce;
      p.vx *= 0.72;
      p.spin *= 0.55;
      if (Math.abs(p.vy) < 40) {
        p.vy = 0;
        p.grav = 0;
        p.vx *= 0.8;
        p.spin *= 0.5;
      }
    }
    list[write++] = p;
  }
  list.length = write;
}

const rgbParseCache = new Map<string, string>();

function hexA(color: string, a: number) {
  if (color.startsWith('rgba')) return color;
  if (color.startsWith('#')) {
    let rgb = rgbParseCache.get(color);
    if (rgb === undefined) {
      const h = color.slice(1);
      const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
      rgb = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
      if (rgbParseCache.size > 512) rgbParseCache.clear();
      rgbParseCache.set(color, rgb);
    }
    return `rgba(${rgb},${a})`;
  }
  return color;
}
export const withAlpha = hexA;

const nineRadialSprites = new Map<string, HTMLCanvasElement | null>();

export function getNineRadialSprite(
  innerColor: string,
  midColor: string,
  midStop = 0.38,
  innerAlpha = 1,
  midAlpha = 0.55,
): HTMLCanvasElement | null {
  const key = `${innerColor}|${midColor}|${midStop}|${innerAlpha}|${midAlpha}`;
  const cached = nineRadialSprites.get(key);
  if (cached !== undefined) return cached;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    nineRadialSprites.set(key, null);
    return null;
  }
  const cv = document.createElement('canvas');
  if (!(cv instanceof HTMLCanvasElement)) {
    nineRadialSprites.set(key, null);
    return null;
  }
  const S = 64;
  cv.width = S;
  cv.height = S;
  const c = cv.getContext('2d');
  if (!c) {
    nineRadialSprites.set(key, null);
    return null;
  }
  const R = S * 0.5;
  const g = c.createRadialGradient(R, R, 0, R, R, R);
  g.addColorStop(0, hexA(innerColor, innerAlpha));
  g.addColorStop(midStop, hexA(midColor, midAlpha));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, S, S);
  if (nineRadialSprites.size > 192) nineRadialSprites.clear();
  nineRadialSprites.set(key, cv);
  return cv;
}

export function drawNineRadial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  innerColor: string,
  midColor: string,
  alpha: number,
  midStop = 0.38,
  innerAlpha = 1,
  midAlpha = 0.55,
) {
  if (r <= 0.25 || alpha <= 0.01) return;
  const sp = getNineRadialSprite(innerColor, midColor, midStop, innerAlpha, midAlpha);
  const prevAlpha = ctx.globalAlpha;
  if (sp) {
    ctx.globalAlpha = prevAlpha * clamp(alpha, 0, 1);
    ctx.drawImage(sp, x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = prevAlpha;
    return;
  }
  // Headless fallback without allocating CanvasGradients
  ctx.fillStyle = hexA(midColor, midAlpha * 0.55 * alpha);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = hexA(innerColor, innerAlpha * 0.85 * alpha);
  ctx.beginPath();
  ctx.arc(x, y, r * midStop, 0, TAU);
  ctx.fill();
}

function isAdditiveParticle(type: ParticleType): boolean {
  return type !== 'smoke' && type !== 'shard' && type !== 'casing' && type !== 'ash';
}

export function drawParticles(ctx: CanvasRenderingContext2D, list: Particle[]) {
  if (!list.length) return;
  // Pass 1: all source-over particles together (zero composite mode thrashing)
  let hasAdditive = false;
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (isAdditiveParticle(p.type)) {
      hasAdditive = true;
      continue;
    }
    drawParticleBody(ctx, p);
  }
  if (!hasAdditive) return;
  // Pass 2: all additive ('lighter') particles batched under a single composite state
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // Fast batched path for sparks first
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (p.type !== 'spark') continue;
    const t = clamp(p.life / p.max, 0, 1);
    if (t <= 0.03) continue;
    const sp = Math.hypot(p.vx, p.vy) || 1;
    const len = clamp(sp * 0.022, 2, 26) * (0.4 + t);
    const inv = len / sp;
    const tx = p.x - p.vx * inv;
    const ty = p.y - p.vy * inv;
    const mx = (tx + p.x) * 0.5;
    const my = (ty + p.y) * 0.5;
    const lw = p.width * (0.3 + t * 0.9);
    ctx.lineCap = 'round';
    ctx.lineWidth = lw * 0.72;
    ctx.strokeStyle = hexA(p.color, t * 0.42);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.lineWidth = lw;
    ctx.strokeStyle = hexA(p.color, t);
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    if (!isAdditiveParticle(p.type) || p.type === 'spark') continue;
    drawParticleBody(ctx, p);
  }
  ctx.restore();
}

export function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  const additive = isAdditiveParticle(p.type);
  ctx.save();
  if (additive) ctx.globalCompositeOperation = 'lighter';
  drawParticleBody(ctx, p);
  ctx.restore();
}

function drawParticleBody(ctx: CanvasRenderingContext2D, p: Particle) {
  const t = clamp(p.life / p.max, 0, 1);
  if (t <= 0.025) return;

  switch (p.type) {
    case 'spark': {
      const sp = Math.hypot(p.vx, p.vy) || 1;
      const len = clamp(sp * 0.022, 2, 26) * (0.4 + t);
      const inv = len / sp;
      const tx = p.x - p.vx * inv;
      const ty = p.y - p.vy * inv;
      const mx = (tx + p.x) * 0.5;
      const my = (ty + p.y) * 0.5;
      const lw = p.width * (0.3 + t * 0.9);
      ctx.lineCap = 'round';
      ctx.lineWidth = lw * 0.72;
      ctx.strokeStyle = hexA(p.color, t * 0.42);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.lineWidth = lw;
      ctx.strokeStyle = hexA(p.color, t);
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      break;
    }
    case 'ember': {
      const fl = 0.65 + 0.35 * Math.sin(p.seed + (p.max - p.life) * 30);
      const r = Math.max(0.5, p.size * (0.4 + t * 0.9) * fl * 3.2);
      drawNineRadial(ctx, p.x, p.y, r, p.color, p.color2, t, 0.35, 1, 0.55);
      break;
    }
    case 'glow': {
      const r = Math.max(0.6, lerp(p.size2, p.size, t));
      drawNineRadial(ctx, p.x, p.y, r, p.color, p.color2, t, 0.4, 1, 0.5);
      break;
    }
    case 'flash': {
      const r = Math.max(0.6, p.size * (0.5 + (1 - t) * 0.9));
      drawNineRadial(ctx, p.x, p.y, r, '#ffffff', p.color, t, 0.32, 1, 0.85);
      break;
    }
    case 'fire': {
      const r = Math.max(1, lerp(p.size2, p.size, 1 - t));
      drawNineRadial(ctx, p.x, p.y, r, '#fff5a8', p.color, t, 0.36, 0.9, 0.72);
      break;
    }
    case 'smoke': {
      const r = Math.max(1, lerp(p.size2, p.size, 1 - t));
      drawNineRadial(ctx, p.x, p.y, r, p.color, p.color, t, 0.5, 0.42, 0.2);
      break;
    }
    case 'shard': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = clamp(t * 1.6, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(-p.size, -p.size * 0.35);
      ctx.lineTo(p.size * 0.9, -p.size * 0.5);
      ctx.lineTo(p.size, p.size * 0.42);
      ctx.lineTo(-p.size * 0.8, p.size * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = hexA(p.color2, 0.6);
      ctx.fillRect(-p.size, -p.size * 0.35, p.size * 1.9, p.size * 0.18);
      ctx.restore();
      break;
    }
    case 'casing': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = clamp(t * 1.8, 0, 1);
      ctx.fillStyle = '#d4a017';
      ctx.fillRect(-p.size * 1.1, -p.size * 0.38, p.size * 2.2, p.size * 0.76);
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-p.size * 1.1, -p.size * 0.38, p.size * 2.2, p.size * 0.24);
      ctx.fillStyle = '#8a5a12';
      ctx.fillRect(-p.size * 1.1, p.size * 0.14, p.size * 2.2, p.size * 0.24);
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(p.size * 0.7, -p.size * 0.45, p.size * 0.45, p.size * 0.9);
      ctx.restore();
      break;
    }
    case 'ring': {
      const r = lerp(p.size2, p.size, 1 - t);
      ctx.strokeStyle = hexA(p.color, t * 0.9);
      ctx.lineWidth = p.width * (0.25 + t);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, r), 0, TAU);
      ctx.stroke();
      break;
    }
    case 'shock': {
      const r = lerp(p.size2, p.size, 1 - t);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, 0.42);
      ctx.strokeStyle = hexA(p.color, t * 0.8);
      ctx.lineWidth = p.width * (0.3 + t);
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.5, r), 0, TAU);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'bolt': {
      const a = p.rot;
      const len = p.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      let cx = p.x,
        cy = p.y;
      const seg = 5;
      for (let i = 1; i <= seg; i++) {
        const prog = i / seg;
        const off = (Math.sin(p.seed * 9.1 + i * 2.3) * len) / 6;
        cx = p.x + Math.cos(a) * len * prog - Math.sin(a) * off;
        cy = p.y + Math.sin(a) * len * prog + Math.cos(a) * off;
        ctx.lineTo(cx, cy);
      }
      ctx.strokeStyle = hexA(p.color, t * 0.34);
      ctx.lineWidth = p.width * (0.4 + t) * 2.5;
      ctx.stroke();
      ctx.strokeStyle = hexA(p.color, t);
      ctx.lineWidth = p.width * (0.4 + t);
      ctx.stroke();
      break;
    }
    case 'cone': {
      const L = p.size * (0.6 + (1 - t) * 0.55);
      const h = Math.tan(p.width) * L * 0.6;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = hexA(p.color, t * 0.72);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.14);
      ctx.quadraticCurveTo(L * 0.45, -h, L, 0);
      ctx.quadraticCurveTo(L * 0.45, h, 0, h * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = hexA('#ffffff', t * 0.9);
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.08);
      ctx.quadraticCurveTo(L * 0.28, -h * 0.46, L * 0.62, 0);
      ctx.quadraticCurveTo(L * 0.28, h * 0.46, 0, h * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'flare': {
      const n = Math.max(2, Math.round(p.size2));
      const full = p.width >= 3.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = hexA(p.color, t * 0.78);
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = full ? (i / n) * TAU : lerp(-p.width, p.width, i / (n - 1));
        const rr = Math.abs(Math.sin(p.seed * 12.9898 + i * 78.233) * 43758.5453) % 1;
        const len = p.size * (0.45 + rr * 0.55) * (0.5 + t * 0.7);
        const bw = Math.max(0.8, p.size * 0.045) * (0.4 + t);
        const ca = Math.cos(a), sa = Math.sin(a);
        ctx.moveTo(sa * bw, -ca * bw);
        ctx.lineTo(ca * len, sa * len);
        ctx.lineTo(-sa * bw, ca * bw);
        ctx.closePath();
      }
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${t * 0.92})`;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = full ? (i / n) * TAU : lerp(-p.width, p.width, i / (n - 1));
        const rr = Math.abs(Math.sin(p.seed * 12.9898 + i * 78.233) * 43758.5453) % 1;
        const len = p.size * (0.45 + rr * 0.55) * (0.5 + t * 0.7) * 0.48;
        const bw = Math.max(0.5, p.size * 0.025) * (0.4 + t);
        const ca = Math.cos(a), sa = Math.sin(a);
        ctx.moveTo(sa * bw, -ca * bw);
        ctx.lineTo(ca * len, sa * len);
        ctx.lineTo(-sa * bw, ca * bw);
        ctx.closePath();
      }
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'streak': {
      const L = p.size * (0.55 + (1 - t) * 0.45);
      const h = p.width * (0.3 + t * 0.7);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = hexA(p.color, t * 0.48);
      ctx.beginPath();
      ctx.ellipse(0, 0, L, Math.max(0.6, h * 0.55), 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${t * 0.92})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, L * 0.55, Math.max(0.4, h * 0.22), 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'pixel': {
      const s2 = p.size * (0.4 + 0.6 * t);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = hexA(p.color, t * 0.28);
      ctx.fillRect(-s2 * 1.1, -s2 * 1.1, s2 * 2.2, s2 * 2.2);
      ctx.fillStyle = hexA(p.color, t);
      ctx.fillRect(-s2 / 2, -s2 / 2, s2, s2);
      ctx.restore();
      break;
    }
    case 'ash': {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = clamp(t * 1.3, 0, 1) * 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(-p.size, -p.size * 0.3);
      ctx.lineTo(p.size * 0.7, -p.size * 0.5);
      ctx.lineTo(p.size, p.size * 0.25);
      ctx.lineTo(-p.size * 0.6, p.size * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'rimarc': {
      const prog = clamp((1 - t) * 3.4, 0, 1);
      const N = Math.max(2, Math.floor(34 * prog));
      const pts: [number, number][] = [];
      for (let i = 0; i <= N; i++) {
        const a = p.rot + p.size2 * prog * (i / N);
        const jr = i === 0 ? 0 : (Math.random() - 0.5) * p.width * 3.4;
        pts.push([p.x + Math.cos(a) * (p.size + jr), p.y + Math.sin(a) * (p.size + jr)]);
      }
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (let pass = 0; pass < 3; pass++) {
        ctx.beginPath();
        pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
        ctx.strokeStyle = pass === 0 ? hexA(p.color, 0.28 * t) : pass === 1 ? hexA(p.color, 0.9 * t) : `rgba(255,255,255,${0.95 * t})`;
        ctx.lineWidth = [p.width * 3.2, p.width * 1.3, Math.max(0.6, p.width * 0.45)][pass];
        ctx.stroke();
      }
      break;
    }
    case 'star': {
      const r = p.size * (0.3 + t * 1.1);
      ctx.strokeStyle = hexA(p.color, t);
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.x - r, p.y);
      ctx.lineTo(p.x + r, p.y);
      ctx.moveTo(p.x, p.y - r);
      ctx.lineTo(p.x, p.y + r);
      ctx.stroke();
      break;
    }
  }
}

/* --------------------------- drawing helpers --------------------------- */

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const metalGradCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>();

export function metal(
  ctx: CanvasRenderingContext2D,
  y0: number,
  y1: number,
  c0: string,
  c1: string,
  c2: string
) {
  let map = metalGradCache.get(ctx);
  if (!map) {
    map = new Map();
    metalGradCache.set(ctx, map);
  }
  const key = `${y0.toFixed(2)}|${y1.toFixed(2)}|${c0}|${c1}|${c2}`;
  let g = map.get(key);
  if (!g) {
    g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, c0);
    g.addColorStop(0.42, c1);
    g.addColorStop(0.62, c1);
    g.addColorStop(1, c2);
    if (map.size > 512) map.clear();
    map.set(key, g);
  }
  return g;
}

export function glowLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  w: number,
  color: string,
  alpha = 1
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.strokeStyle = hexA(color, 0.22 * alpha);
  ctx.lineWidth = w * 3.4;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.strokeStyle = hexA(color, 0.6 * alpha);
  ctx.lineWidth = w * 1.7;
  ctx.stroke();
  ctx.strokeStyle = `rgba(255,255,255,${0.95 * alpha})`;
  ctx.lineWidth = Math.max(0.6, w * 0.5);
  ctx.stroke();
  ctx.restore();
}

export function lightning(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  amp: number,
  color: string,
  seed: number,
  width = 2,
  segs = 8
) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const nx = lerp(x0, x1, t);
    const ny = lerp(y0, y1, t);
    const dx = x1 - x0,
      dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len,
      py = dx / len;
    const w = i === 0 || i === segs ? 0 : Math.sin(seed * 12.9 + i * 3.7) * amp * (0.5 + Math.random() * 0.5);
    pts.push([nx + px * w, ny + py * w]);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = hexA(color, 0.3);
  ctx.lineWidth = width * 3;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.stroke();
  ctx.strokeStyle = hexA(color, 0.85);
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = Math.max(0.5, width * 0.38);
  ctx.stroke();
  ctx.restore();
}

/* ------------------------------- audio -------------------------------- */

class Synth {
  ctx: AudioContext | null = null;
  muted = false;
  noise: AudioBuffer | null = null;
  master: GainNode | null = null;
  verb: ConvolverNode | null = null;

  ensure() {
    if (!this.ctx) {
      const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const c = new AC();
      this.ctx = c;
      const len = Math.floor(c.sampleRate * 1.2);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.006;
      comp.release.value = 0.14;
      this.master = c.createGain();
      this.master.gain.value = this.muted ? 0 : 0.92;
      this.master.connect(comp);
      comp.connect(c.destination);
      // Warm 1.1s stereo room impulse with equal-power normalization enabled (crisp stereo, zero clipping)
      const rl = Math.max(1, Math.floor(c.sampleRate * 1.1));
      const ir = c.createBuffer(2, rl, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const dd = ir.getChannelData(ch);
        let smooth = 0;
        for (let i = 0; i < rl; i++) {
          const raw = Math.random() * 2 - 1;
          smooth = smooth * 0.42 + raw * 0.58;
          dd[i] = smooth * Math.pow(1 - i / rl, 3.2);
        }
      }
      this.verb = c.createConvolver();
      this.verb.normalize = true;
      this.verb.buffer = ir;
      const wet = c.createGain();
      wet.gain.value = 0.28;
      this.verb.connect(wet);
      wet.connect(comp);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private out(node: AudioNode, send: number): GainNode | null {
    node.connect(this.master!);
    if (send > 0) {
      const s = this.ctx!.createGain();
      s.gain.value = send;
      node.connect(s);
      s.connect(this.verb!);
      return s;
    }
    return null;
  }

  private env(
    srcNode: AudioScheduledSourceNode,
    node: AudioNode,
    g: number,
    a: number,
    d: number,
    t0: number,
    send: number,
  ) {
    const ctx = this.ctx!;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, g), t0 + a);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
    node.connect(gain);
    const sendGain = this.out(gain, send);
    srcNode.onended = () => {
      try {
        srcNode.disconnect();
        if (node !== srcNode) node.disconnect();
        gain.disconnect();
        sendGain?.disconnect();
      } catch {
        /* ignore */
      }
    };
  }

  noiseBurst(dur: number, gain: number, type: BiquadFilterType, freq: number, q = 1, t0 = 0, sweepTo = 0, send = 0.25) {
    const ctx = this.ensure();
    if (this.muted) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise!;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    const start = ctx.currentTime + t0;
    f.frequency.setValueAtTime(freq, start);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(Math.max(30, sweepTo), start + dur);
    src.connect(f);
    this.env(src, f, gain, 0.003, dur, start, send);
    const maxOffset = Math.max(0, 1.15 - dur);
    src.start(start, maxOffset > 0 ? Math.random() * Math.min(0.5, maxOffset) : 0);
    src.stop(start + dur + 0.1);
  }

  tone(f0: number, f1: number, dur: number, gain: number, type: OscillatorType = 'sine', t0 = 0, send = 0.2, detune = 0) {
    const ctx = this.ensure();
    if (this.muted) return;
    const o = ctx.createOscillator();
    o.type = type;
    o.detune.value = detune;
    const start = ctx.currentTime + t0;
    o.frequency.setValueAtTime(f0, start);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), start + dur);
    this.env(o, o, gain, 0.004, dur, start, send);
    o.start(start);
    o.stop(start + dur + 0.1);
  }

  private gun(crack: number, thump: number, tail: number, bright = 2600) {
    this.noiseBurst(0.035, crack, 'highpass', 2400, 0.7, 0, 0, 0.1);
    this.noiseBurst(tail, crack * 0.8, 'lowpass', bright, 0.8, 0.004, 400, 0.45);
    this.tone(thump * 1.8, thump * 0.35, 0.16, crack * 0.9, 'sine', 0, 0.15);
    this.tone(thump * 3, thump * 0.7, 0.07, crack * 0.4, 'square', 0, 0.1);
  }

  play(kind: string) {
    try {
      this.ensure();
      if (this.muted) return;
      switch (kind) {
        case 'ak': this.gun(0.5, 120, 0.3, 3200); break;
        case 'rifle': this.gun(0.62, 85, 0.5, 2400); this.noiseBurst(0.12, 0.2, 'bandpass', 700, 1, 0.12); break;
        case 'smg': this.gun(0.34, 170, 0.16, 3800); break;
        case 'pistol': this.gun(0.4, 150, 0.22, 3000); this.tone(1900, 1300, 0.04, 0.08, 'triangle', 0.09); break;
        case 'sniper':
          this.tone(1600, 90, 0.5, 0.26, 'sawtooth', 0, 0.5);
          this.tone(70, 28, 0.6, 0.5, 'sine', 0, 0.2);
          this.noiseBurst(0.5, 0.4, 'bandpass', 3200, 0.8, 0, 300, 0.6);
          this.tone(2400, 2400, 0.35, 0.05, 'sine', 0.02, 0.8);
          break;
        case 'bow':
          this.noiseBurst(0.18, 0.42, 'bandpass', 1800, 1.8, 0, 0, 0.1);
          this.tone(640, 110, 0.24, 0.38, 'triangle', 0, 0.1);
          this.tone(190, 48, 0.2, 0.45, 'sine', 0, 0.1);
          this.noiseBurst(0.35, 0.12, 'highpass', 2400, 1.4, 0.03, 4000, 0.1);
          break;
        case 'tesla':
          this.noiseBurst(0.3, 0.3, 'highpass', 3500, 1.2, 0, 800, 0.4);
          this.tone(2200, 120, 0.3, 0.2, 'sawtooth', 0, 0.4);
          this.tone(60, 40, 0.35, 0.3, 'square', 0, 0.2);
          break;
        case 'ion':
          this.tone(1500, 500, 0.12, 0.36, 'square', 0, 0.3);
          this.tone(2200, 700, 0.1, 0.24, 'sawtooth', 0.01, 0.3, 14);
          this.noiseBurst(0.08, 0.26, 'highpass', 4000, 1, 0, 0, 0.2);
          break;
        case 'rail':
          this.tone(200, 1800, 0.35, 0.16, 'sawtooth', 0, 0.5);
          this.tone(1800, 60, 0.7, 0.34, 'sawtooth', 0.32, 0.6);
          this.noiseBurst(0.6, 0.4, 'bandpass', 5000, 1, 0.32, 200, 0.6);
          this.tone(50, 25, 0.8, 0.5, 'sine', 0.32, 0.3);
          break;
        case 'dragon':
          this.noiseBurst(0.9, 0.42, 'bandpass', 500, 0.6, 0, 1800, 0.5);
          this.tone(70, 38, 0.9, 0.4, 'sawtooth', 0, 0.3);
          this.tone(150, 55, 0.7, 0.2, 'square', 0.05, 0.3, 30);
          this.noiseBurst(0.25, 0.3, 'lowpass', 400, 1, 0, 0, 0.6);
          break;
        case 'phaser':
          // Two detuned sines + air. Slide 9 runs this under a beam that is
          // already ringing, so 0.13 was plenty there; as slide 1's single fire
          // voice it barely registered next to the other ported guns.
          this.tone(1200, 1650, 0.45, 0.3, 'sine', 0, 0.4);
          this.tone(1203, 1658, 0.45, 0.24, 'sine', 0, 0.4, 20);
          this.noiseBurst(0.4, 0.14, 'highpass', 6000, 1, 0, 0, 0.3);
          break;
        case 'sword':
          this.noiseBurst(0.3, 0.3, 'bandpass', 600, 1.5, 0, 5200, 0.4);
          this.tone(300, 1500, 0.28, 0.14, 'sawtooth', 0, 0.4);
          this.tone(110, 110, 0.4, 0.1, 'square', 0, 0.2, 12);
          break;
        case 'plasma':
          this.tone(1000, 90, 0.5, 0.4, 'triangle', 0, 0.4);
          this.tone(500, 40, 0.5, 0.32, 'sawtooth', 0, 0.4);
          this.noiseBurst(0.4, 0.32, 'bandpass', 1200, 2, 0, 200, 0.4);
          break;
        case 'disc':
          // Identity disc: a throw-whistle. Slide 9 also plays discBounce and
          // discCatch around it, so the launch itself was mixed low; on slide 1
          // it is the whole sound of the shot.
          this.tone(500, 1900, 0.14, 0.34, 'sine', 0, 0.4);
          this.tone(1900, 800, 0.35, 0.3, 'sine', 0.1, 0.5);
          this.tone(2800, 2400, 0.4, 0.09, 'square', 0.05, 0.4);
          break;
        case 'proton':
          this.tone(90, 130, 0.9, 0.36, 'sawtooth', 0, 0.3);
          this.tone(93, 134, 0.9, 0.32, 'sawtooth', 0, 0.3, 24);
          this.noiseBurst(0.9, 0.34, 'bandpass', 2200, 2, 0, 3400, 0.4);
          this.tone(900, 1300, 0.9, 0.1, 'sine', 0, 0.3);
          break;
        case 'tripod':
          this.tone(110, 1400, 0.3, 0.18, 'sawtooth', 0, 0.5);
          this.tone(1400, 70, 1.0, 0.3, 'sawtooth', 0.28, 0.6);
          this.tone(1410, 72, 1.0, 0.18, 'square', 0.28, 0.6, 18);
          this.noiseBurst(0.9, 0.22, 'bandpass', 1500, 1.5, 0.28, 300, 0.5);
          break;
        case 'repulsor':
          this.tone(300, 1700, 0.14, 0.14, 'sine', 0, 0.3);
          this.tone(1700, 120, 0.35, 0.3, 'triangle', 0.1, 0.5);
          this.noiseBurst(0.3, 0.3, 'lowpass', 1500, 1, 0.1, 200, 0.5);
          this.tone(80, 38, 0.4, 0.4, 'sine', 0.1, 0.3);
          break;
        case 'yautja':
          // alien shoulder capacitor: hydraulic latch, rising coil whine, then a hot plasma crack
          this.noiseBurst(0.075, 0.18, 'bandpass', 620, 1.4, 0, 0, 0.35);
          this.tone(96, 58, 0.24, 0.36, 'sine', 0, 0.28);
          this.tone(420, 1380, 0.16, 0.16, 'sawtooth', 0.015, 0.4);
          this.tone(1380, 260, 0.28, 0.22, 'triangle', 0.12, 0.58, 11);
          this.noiseBurst(0.12, 0.18, 'highpass', 4200, 0.8, 0.13, 700, 0.45);
          this.tone(62, 34, 0.36, 0.34, 'sine', 0.12, 0.3);
          break;
        case 'yautjaHit':
          this.noiseBurst(0.19, 0.24, 'bandpass', 1600, 1.2, 0, 260, 0.45);
          this.tone(920, 180, 0.22, 0.18, 'sawtooth', 0, 0.4);
          this.tone(72, 38, 0.3, 0.34, 'sine', 0, 0.3);
          this.tone(2100, 2100, 0.08, 0.08, 'triangle', 0.015, 0.42);
          break;
        case 'discBounce':
          this.tone(2300, 1500, 0.09, 0.14, 'sine', 0, 0.5);
          this.tone(3500, 2600, 0.12, 0.07, 'triangle', 0.01, 0.5);
          this.noiseBurst(0.05, 0.1, 'highpass', 5000, 1, 0, 0, 0.3);
          break;
        case 'discCatch':
          this.tone(500, 900, 0.12, 0.16, 'sine', 0, 0.4);
          this.tone(1800, 2400, 0.18, 0.1, 'triangle', 0.04, 0.5);
          this.noiseBurst(0.08, 0.12, 'bandpass', 1200, 1, 0, 0, 0.2);
          break;
        case 'hit':
          this.noiseBurst(0.12, 0.34, 'lowpass', 1200, 1, 0, 300, 0.2);
          this.tone(170, 60, 0.12, 0.3, 'triangle', 0, 0.1);
          this.noiseBurst(0.05, 0.14, 'highpass', 3500, 1, 0, 0, 0.1);
          break;
        case 'hitZap':
          this.noiseBurst(0.3, 0.28, 'highpass', 3000, 1.5, 0, 800, 0.4);
          this.tone(1800, 120, 0.25, 0.16, 'sawtooth', 0, 0.3);
          this.tone(120, 50, 0.2, 0.3, 'square', 0, 0.2);
          break;
        case 'hitBoom':
          this.tone(110, 30, 0.5, 0.55, 'sine', 0, 0.4);
          this.noiseBurst(0.5, 0.45, 'lowpass', 1400, 0.8, 0, 160, 0.5);
          break;
        case 'hitFire':
          this.noiseBurst(0.7, 0.36, 'lowpass', 1800, 0.8, 0, 200, 0.5);
          this.tone(80, 35, 0.6, 0.4, 'sine', 0, 0.3);
          break;
        case 'fail':
          this.tone(260, 50, 0.9, 0.3, 'sawtooth', 0, 0.5);
          this.noiseBurst(0.9, 0.34, 'lowpass', 900, 0.7, 0, 120, 0.6);
          this.tone(60, 30, 0.8, 0.5, 'sine', 0, 0.3);
          break;
        case 'win':
          [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, f, 0.3, 0.14, 'triangle', i * 0.09, 0.5));
          break;
        // legacy aliases
        case 'rifleOld': this.gun(0.5, 120, 0.3); break;
        case 'electro': this.play('tesla'); break;
        case 'laser': this.play('phaser'); break;
        case 'beam': this.play('proton'); break;
        case 'fire': this.play('dragon'); break;
      }
    } catch {
      /* ignore */
    }
  }
}

export const audio = new Synth();
