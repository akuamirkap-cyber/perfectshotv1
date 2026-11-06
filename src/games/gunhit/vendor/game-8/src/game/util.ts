export const TAU = Math.PI * 2;
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];
export const wrapAng = (a: number) => {
  while (a > Math.PI) a -= TAU;
  while (a < -Math.PI) a += TAU;
  return a;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);

export type RGB = [number, number, number];
const cc = new Map<string, RGB>();
export function rgb(c: string): RGB {
  const hit = cc.get(c);
  if (hit) return hit;
  let h = c.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const v: RGB = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  cc.set(c, v);
  return v;
}
export function rgba(c: string, a: number) {
  const [r, g, b] = rgb(c);
  return `rgba(${r},${g},${b},${a})`;
}
export function palAt(pal: RGB[], t: number): RGB {
  if (pal.length === 1) return pal[0];
  const f = clamp(t) * (pal.length - 1);
  const i = Math.min(pal.length - 2, Math.floor(f));
  const k = f - i;
  const a = pal[i];
  const b = pal[i + 1];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

const sprites = new Map<number, HTMLCanvasElement>();
export function glowSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const q = (v: number) => Math.min(255, (v >> 4) << 4);
  const R = q(r), G = q(g), B = q(b);
  const key = (R << 16) | (G << 8) | B;
  let s = sprites.get(key);
  if (s) return s;
  s = document.createElement('canvas');
  s.width = s.height = 64;
  const c = s.getContext('2d')!;
  const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${R},${G},${B},1)`);
  gr.addColorStop(0.25, `rgba(${R},${G},${B},0.62)`);
  gr.addColorStop(0.6, `rgba(${R},${G},${B},0.18)`);
  gr.addColorStop(1, `rgba(${R},${G},${B},0)`);
  c.fillStyle = gr;
  c.fillRect(0, 0, 64, 64);
  sprites.set(key, s);
  return s;
}
/** additive-ish glow blob (caller chooses composite op) */
export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string | RGB, alpha = 1) {
  if (alpha <= 0.003 || r <= 0.2) return;
  const c = typeof color === 'string' ? rgb(color) : color;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(glowSprite(c[0], c[1], c[2]), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/* ---------- gun-part helpers ---------- */
export const STEEL = ['#c3cbd6', '#7a8492', '#454c58', '#23272f'];
export const BLUED = ['#5a6374', '#2c323d', '#161a21'];
export const POLY = ['#4a515e', '#282c34', '#111318'];
export const WOODC = ['#d99a5b', '#a4622e', '#66380f'];
export const BRASS = ['#fff0b0', '#e0ab4a', '#8d5c16'];
export const GOLD = ['#fff3b8', '#f1c14a', '#b07a14', '#6e4608'];

export function vgrad(ctx: CanvasRenderingContext2D, y0: number, y1: number, stops: string[]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}
export function hgrad(ctx: CanvasRenderingContext2D, x0: number, x1: number, stops: string[]) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}
export function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
export function metalBox(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 2,
  stops: string[] = STEEL, hl = 0.35,
) {
  ctx.fillStyle = vgrad(ctx, y, y + h, stops);
  rr(ctx, x, y, w, h, r);
  ctx.fill();
  ctx.fillStyle = `rgba(255,255,255,${hl})`;
  ctx.fillRect(x + r, y + 1, Math.max(0, w - 2 * r), Math.max(1, h * 0.09));
  ctx.strokeStyle = 'rgba(0,0,0,.6)';
  ctx.lineWidth = 1;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
}
export function grain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n = 5, col = 'rgba(50,25,8,.38)') {
  ctx.save();
  ctx.strokeStyle = col;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const yy = y + ((i + 0.5) / n) * h;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.bezierCurveTo(x + w * 0.3, yy + Math.sin(i * 2.1) * 3, x + w * 0.6, yy - Math.cos(i * 1.3) * 3, x + w, yy + Math.sin(i) * 2);
    ctx.stroke();
  }
  ctx.restore();
}
export function add(ctx: CanvasRenderingContext2D) {
  ctx.globalCompositeOperation = 'lighter';
}
export function norm(ctx: CanvasRenderingContext2D) {
  ctx.globalCompositeOperation = 'source-over';
}
/** polyline with perpendicular sine wobble, from (x1,y1) to (x2,y2) */
export function wobblePath(
  ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number,
  amp: number, freq: number, phase: number, steps = 40, taper = true,
) {
  const dx = x2 - x1, dy = y2 - y1;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const env = taper ? Math.sin(Math.PI * Math.min(1, t * 1.15)) * 0.5 + 0.5 : 1;
    const o = Math.sin(t * freq + phase) * amp * env;
    const px = x1 + dx * t + nx * o;
    const py = y1 + dy * t + ny * o;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
}
