// ───────────────────────── Core helpers: math, random, sprite cache ─────────────────────────
export const TAU = Math.PI * 2;
export const W = 420; // logical width
export const H = 760; // logical height

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const randInt = (a: number, b: number) => Math.floor(rand(a, b + 1));
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const chance = (p: number) => Math.random() < p;

export const normAngle = (a: number) => {
  a %= TAU;
  return a < 0 ? a + TAU : a;
};
/** absolute shortest difference between two angles */
export const angleDiff = (a: number, b: number) => {
  const d = normAngle(a - b);
  return d > Math.PI ? TAU - d : d;
};

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export const easeInCubic = (t: number) => Math.pow(clamp(t, 0, 1), 3);
export const easeOutBack = (t: number) => {
  t = clamp(t, 0, 1);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
export const smooth = (t: number) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Minimal stand-in used when slide 7's art is rendered headlessly (tests). */
function headlessCtx(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => undefined };
  return new Proxy({}, {
    get: (_t, prop) => {
      const name = String(prop);
      if (name === 'createLinearGradient' || name === 'createRadialGradient'
        || name === 'createPattern') return () => gradient;
      if (name === 'measureText') return () => ({ width: 0 });
      if (name === 'getImageData') return () => ({ data: new Uint8ClampedArray(4) });
      return () => undefined;
    },
    set: () => true,
  }) as unknown as CanvasRenderingContext2D;
}

export function makeCanvas(w: number, h: number) {
  if (typeof document === 'undefined') {
    // Sprites are only used as drawImage sources; headless geometry checks do
    // not need a DOM canvas.
    return {
      width: Math.max(1, Math.ceil(w)),
      height: Math.max(1, Math.ceil(h)),
      getContext: () => headlessCtx(),
    } as unknown as HTMLCanvasElement;
  }
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

export type Ctx = CanvasRenderingContext2D;

// ───────────────────────── Sprite cache ─────────────────────────
const cache = new Map<string, HTMLCanvasElement>();

/** soft radial glow, color as "r,g,b" */
export function glowSprite(rgb: string): HTMLCanvasElement {
  const key = 'g' + rgb;
  let c = cache.get(key);
  if (c) return c;
  const s = 128;
  c = makeCanvas(s, s);
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(0.18, `rgba(${rgb},0.75)`);
  gr.addColorStop(0.45, `rgba(${rgb},0.25)`);
  gr.addColorStop(0.75, `rgba(${rgb},0.06)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  cache.set(key, c);
  return c;
}

/** hard-ish dot with soft falloff (for embers/sparks heads) */
export function dotSprite(rgb: string): HTMLCanvasElement {
  const key = 'd' + rgb;
  let c = cache.get(key);
  if (c) return c;
  const s = 64;
  c = makeCanvas(s, s);
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, `rgba(255,255,255,1)`);
  gr.addColorStop(0.2, `rgba(${rgb},1)`);
  gr.addColorStop(0.5, `rgba(${rgb},0.35)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, s, s);
  cache.set(key, c);
  return c;
}

/** puffy smoke sprite built from many soft blobs */
export function smokeSprite(rgb: string, variant: number): HTMLCanvasElement {
  const v = variant % 4;
  const key = 's' + rgb + '_' + v;
  let c = cache.get(key);
  if (c) return c;
  const s = 128;
  c = makeCanvas(s, s);
  const g = c.getContext('2d')!;
  const rnd = mulberry32(1234 + v * 77);
  for (let i = 0; i < 14; i++) {
    const a = rnd() * TAU;
    const d = rnd() * s * 0.2;
    const x = s / 2 + Math.cos(a) * d;
    const y = s / 2 + Math.sin(a) * d;
    const r = s * (0.14 + rnd() * 0.18);
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const al = 0.16 + rnd() * 0.14;
    gr.addColorStop(0, `rgba(${rgb},${al})`);
    gr.addColorStop(0.6, `rgba(${rgb},${al * 0.45})`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, TAU);
    g.fill();
  }
  cache.set(key, c);
  return c;
}

/** 4-point twinkle star */
export function starSprite(rgb: string): HTMLCanvasElement {
  const key = 't' + rgb;
  let c = cache.get(key);
  if (c) return c;
  const s = 96;
  c = makeCanvas(s, s);
  const g = c.getContext('2d')!;
  const m = s / 2;
  const glow = g.createRadialGradient(m, m, 0, m, m, m * 0.5);
  glow.addColorStop(0, `rgba(${rgb},0.9)`);
  glow.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = glow;
  g.fillRect(0, 0, s, s);
  const spike = (len: number, wid: number, rot: number) => {
    g.save();
    g.translate(m, m);
    g.rotate(rot);
    const gr = g.createLinearGradient(0, -len, 0, len);
    gr.addColorStop(0, `rgba(${rgb},0)`);
    gr.addColorStop(0.5, `rgba(255,255,255,1)`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, -len);
    g.quadraticCurveTo(wid * 0.25, -wid * 0.25, wid, 0);
    g.quadraticCurveTo(wid * 0.25, wid * 0.25, 0, len);
    g.quadraticCurveTo(-wid * 0.25, wid * 0.25, -wid, 0);
    g.quadraticCurveTo(-wid * 0.25, -wid * 0.25, 0, -len);
    g.fill();
    g.restore();
  };
  spike(m * 0.98, m * 0.12, 0);
  spike(m * 0.98, m * 0.12, Math.PI / 2);
  spike(m * 0.5, m * 0.07, Math.PI / 4);
  spike(m * 0.5, m * 0.07, -Math.PI / 4);
  cache.set(key, c);
  return c;
}

export function drawSprite(ctx: Ctx, img: HTMLCanvasElement, x: number, y: number, size: number, alpha = 1, rot = 0) {
  if (alpha <= 0.003 || size <= 0.1) return;
  ctx.globalAlpha = alpha > 1 ? 1 : alpha;
  if (rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  } else {
    ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

/** generic linear gradient helper */
export function lin(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function polyPath(ctx: Ctx, pts: number[], smoothCurve = false) {
  ctx.beginPath();
  const n = pts.length / 2;
  if (!smoothCurve) {
    ctx.moveTo(pts[0], pts[1]);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
  } else {
    const mx = (pts[0] + pts[(n - 1) * 2]) / 2;
    const my = (pts[1] + pts[(n - 1) * 2 + 1]) / 2;
    ctx.moveTo(mx, my);
    for (let i = 0; i < n; i++) {
      const x = pts[i * 2];
      const y = pts[i * 2 + 1];
      const nx = pts[((i + 1) % n) * 2];
      const ny = pts[((i + 1) % n) * 2 + 1];
      ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
    }
  }
  ctx.closePath();
}

/** random irregular polygon (stone / chips) */
export function randomPoly(n: number, r: number, jag: number): number[] {
  const pts: number[] = [];
  const off = Math.random() * TAU;
  for (let i = 0; i < n; i++) {
    const a = off + (i / n) * TAU + rand(-0.2, 0.2);
    const rr = r * (1 - jag + Math.random() * jag * 1.3);
    pts.push(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  return pts;
}

/** jagged lightning polyline using midpoint displacement */
export function makeBolt(x1: number, y1: number, x2: number, y2: number, roughness = 0.28, iterations = 5): number[] {
  let pts = [x1, y1, x2, y2];
  let disp = Math.hypot(x2 - x1, y2 - y1) * roughness;
  for (let it = 0; it < iterations; it++) {
    const np: number[] = [];
    for (let i = 0; i < pts.length - 2; i += 2) {
      const ax = pts[i];
      const ay = pts[i + 1];
      const bx = pts[i + 2];
      const by = pts[i + 3];
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy) || 1;
      const off = (Math.random() * 2 - 1) * disp;
      np.push(ax, ay, (ax + bx) / 2 + (-dy / len) * off, (ay + by) / 2 + (dx / len) * off);
    }
    np.push(pts[pts.length - 2], pts[pts.length - 1]);
    pts = np;
    disp *= 0.52;
  }
  return pts;
}
