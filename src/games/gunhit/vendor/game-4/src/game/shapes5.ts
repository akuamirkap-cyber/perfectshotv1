import { type Ctx, TAU, clamp, drawSprite, easeOutBack, easeOutCubic, glowSprite, lin, makeBolt, mulberry32, polyPath, roundRect, starSprite } from './core';
import type { StuckItem, WeaponId } from './weapons';

export const RAINBOW = ['255,72,84', '255,152,52', '255,226,72', '92,222,104', '72,172,255', '112,112,255', '192,102,255'];

export interface PaintCol {
  rgb: string;
  hi: string;
  lo: string;
}
export const PAINT: PaintCol[] = [
  { rgb: '236,52,64', hi: '255,170,170', lo: '120,12,24' },
  { rgb: '52,132,255', hi: '170,210,255', lo: '14,52,140' },
  { rgb: '62,206,96', hi: '180,255,190', lo: '16,100,40' },
  { rgb: '255,208,44', hi: '255,244,170', lo: '150,100,0' },
  { rgb: '232,72,196', hi: '255,180,240', lo: '120,20,100' },
];

// ───────────────────────── helpers ─────────────────────────
function strokePts(ctx: Ctx, pts: number[], layers: [number, string][]) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [w, c] of layers) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
    ctx.stroke();
  }
}

/** glowing lightning polyline (call inside 'lighter') */
export function strokeBolt(ctx: Ctx, pts: number[], w: number, rgb = '150,210,255') {
  strokePts(ctx, pts, [
    [w * 3.2, `rgba(${rgb},0.28)`],
    [w * 1.2, `rgba(${rgb},0.92)`],
    [w * 0.45, 'rgba(255,255,255,1)'],
  ]);
}

/** crescent opening downward, thick at the top (convex side up) */
export function crescentPath(ctx: Ctx, R: number, ri = R * 0.86, d = R * 0.42) {
  const y0 = (R * R - ri * ri + d * d) / (2 * d);
  const x0 = Math.sqrt(Math.max(0, R * R - y0 * y0));
  const to = Math.atan2(y0, x0);
  const pl = Math.atan2(y0 - d, -x0);
  const pr = Math.atan2(y0 - d, x0);
  ctx.beginPath();
  ctx.arc(0, 0, R, to, Math.PI - to, true);
  ctx.arc(0, d, ri, pl, pr, false);
  ctx.closePath();
}

export function drawMoon(ctx: Ctx, R: number) {
  crescentPath(ctx, R, R * 0.84, R * 0.5);
  ctx.fillStyle = lin(ctx, 0, -R, 0, R * 0.6, [
    [0, '#ffffff'],
    [0.5, '#e6deff'],
    [1, '#a994ff'],
  ]);
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(120,90,220,0.85)';
  ctx.lineWidth = Math.max(0.8, R * 0.07);
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = R * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, R * 0.88, -Math.PI * 0.82, -Math.PI * 0.35);
  ctx.stroke();
  ctx.restore();
}

export function starPath(ctx: Ctx, R: number, inner = 0.46, rot = -Math.PI / 2, pts = 5) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 ? R * inner : R;
    const a = rot + (i * Math.PI) / pts;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawGoldStar(ctx: Ctx, R: number, rot = -Math.PI / 2, pink = false) {
  starPath(ctx, R, 0.46, rot);
  const g = ctx.createRadialGradient(-R * 0.2, -R * 0.25, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#fffbe0');
  g.addColorStop(0.5, pink ? '#ffb0e6' : '#ffd84a');
  g.addColorStop(1, pink ? '#c4569e' : '#c98a0a');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pink ? 'rgba(130,30,100,0.85)' : 'rgba(120,70,0,0.85)';
  ctx.lineWidth = Math.max(0.7, R * 0.07);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.ellipse(-R * 0.22, -R * 0.22, R * 0.16, R * 0.08, -0.7, 0, TAU);
  ctx.fill();
}

export function drawCloud(ctx: Ctx, s = 1, tint = '#ffffff') {
  const puffs: [number, number, number][] = [
    [-12, 3, 8],
    [-4, -4, 10.5],
    [8, -2, 9.5],
    [15, 4, 7],
    [2, 5, 9],
  ];
  ctx.save();
  ctx.scale(s, s);
  ctx.fillStyle = 'rgba(150,175,225,0.55)';
  for (const [x, y, r] of puffs) {
    ctx.beginPath();
    ctx.arc(x, y + 2.4, r, 0, TAU);
    ctx.fill();
  }
  for (const [x, y, r] of puffs) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, tint);
    g.addColorStop(1, '#dce8ff');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** ∩-shaped rainbow centred on the origin (feet at y = 0) */
export function drawRainbowArc(ctx: Ctx, rx: number, ry: number, bw: number, alpha = 1) {
  ctx.save();
  ctx.lineCap = 'butt';
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 7; i++) {
    const rxi = rx - (i + 0.5) * bw;
    const ryi = ry - (i + 0.5) * bw;
    if (rxi <= 0.3 || ryi <= 0.3) continue;
    ctx.strokeStyle = `rgb(${RAINBOW[i]})`;
    ctx.lineWidth = bw + 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, rxi, ryi, 0, Math.PI, TAU);
    ctx.stroke();
  }
  if (rx - 0.5 * bw > 0.3 && ry - 0.5 * bw > 0.3) {
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = Math.max(0.8, bw * 0.28);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx - 0.5 * bw, ry - 0.5 * bw, 0, Math.PI * 1.08, Math.PI * 1.45);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────── pencil (tip at origin pointing up, eraser at +Y) ─────────────────────────
export function drawPencil(ctx: Ctx, L = 48, w = 11) {
  const cone = w * 1.25;
  const bodyEnd = L - w;
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#a66a06'],
    [0.3, '#f5b800'],
    [0.5, '#fff0a0'],
    [0.72, '#ffd23a'],
    [1, '#a66a06'],
  ]);
  ctx.fillRect(-w / 2, cone, w, bodyEnd - cone);
  ctx.strokeStyle = 'rgba(120,70,0,0.55)';
  ctx.lineWidth = 0.7;
  for (const x of [-w * 0.2, w * 0.2]) {
    ctx.beginPath();
    ctx.moveTo(x, cone);
    ctx.lineTo(x, bodyEnd);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(-w * 0.3, cone, w * 0.14, bodyEnd - cone);
  polyPath(ctx, [0, 0, w / 2, cone, -w / 2, cone]);
  ctx.fillStyle = lin(ctx, 0, 0, 0, cone, [
    [0, '#f8e3b8'],
    [1, '#d8a45e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,70,20,0.7)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  polyPath(ctx, [0, 0, w * 0.2, cone * 0.3, -w * 0.2, cone * 0.3]);
  ctx.fillStyle = lin(ctx, -w * 0.2, 0, w * 0.2, 0, [
    [0, '#2c2c34'],
    [0.5, '#8a8a96'],
    [1, '#2c2c34'],
  ]);
  ctx.fill();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#6e7480'],
    [0.4, '#f0f3f8'],
    [1, '#5a606a'],
  ]);
  ctx.fillRect(-w / 2 - 0.4, bodyEnd, w + 0.8, w * 0.55);
  ctx.strokeStyle = 'rgba(40,44,52,0.6)';
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-w / 2, bodyEnd + (w * 0.55 * i) / 4);
    ctx.lineTo(w / 2, bodyEnd + (w * 0.55 * i) / 4);
    ctx.stroke();
  }
  roundRect(ctx, -w / 2 + 0.4, bodyEnd + w * 0.55, w - 0.8, w * 0.45, w * 0.18);
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#d9708a'],
    [0.4, '#ffb3c6'],
    [1, '#d9708a'],
  ]);
  ctx.fill();
}

// ───────────────────────── flip-flop (toe up) ─────────────────────────
export function drawSandal(ctx: Ctx, s = 1) {
  ctx.save();
  ctx.scale(s, s);
  const sole = () => {
    ctx.beginPath();
    ctx.moveTo(0, -26);
    ctx.bezierCurveTo(13, -26, 14, -6, 12, 8);
    ctx.bezierCurveTo(11, 22, 8, 26, 0, 26);
    ctx.bezierCurveTo(-8, 26, -11, 22, -12, 8);
    ctx.bezierCurveTo(-14, -6, -13, -26, 0, -26);
    ctx.closePath();
  };
  sole();
  ctx.fillStyle = lin(ctx, -14, 0, 14, 0, [
    [0, '#14439a'],
    [0.5, '#3a86ff'],
    [1, '#14439a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0c2a66';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.scale(0.8, 0.84);
  sole();
  ctx.fillStyle = lin(ctx, 0, -26, 0, 26, [
    [0, '#f4f8ff'],
    [1, '#c4d6f4'],
  ]);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,90,190,0.35)';
  ctx.lineWidth = 0.9;
  for (let y = 12; y < 24; y += 3.2) {
    ctx.beginPath();
    ctx.moveTo(-6, y);
    ctx.lineTo(6, y);
    ctx.stroke();
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [lw, col] of [
    [5.2, '#a8620a'],
    [3.4, '#ffd23a'],
  ] as [number, string][]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-10, 3);
    ctx.lineTo(0, -12);
    ctx.lineTo(10, 3);
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -19);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff8a2b';
  ctx.beginPath();
  ctx.arc(0, -12, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(-0.8, -12.8, 1, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── paint ─────────────────────────
export function drawPaintBall(ctx: Ctx, r: number, col: PaintCol) {
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.1);
  g.addColorStop(0, `rgb(${col.hi})`);
  g.addColorStop(0.5, `rgb(${col.rgb})`);
  g.addColorStop(1, `rgb(${col.lo})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = `rgba(${col.lo},0.7)`;
  ctx.lineWidth = Math.max(0.6, r * 0.08);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.28, r * 0.15, -0.6, 0, TAU);
  ctx.fill();
}

export function splatPoly(r: number, seed: number): number[] {
  const rnd = mulberry32(seed);
  const pts: number[] = [];
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const spike = i % 3 === 0 ? 1.2 + rnd() * 0.9 : 0.62 + rnd() * 0.35;
    pts.push(Math.cos(a) * r * spike, Math.sin(a) * r * spike);
  }
  return pts;
}

export function drawSplat(ctx: Ctx, r: number, col: PaintCol, seed: number, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  polyPath(ctx, splatPoly(r, seed), true);
  const g = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r * 1.2);
  g.addColorStop(0, `rgb(${col.hi})`);
  g.addColorStop(0.45, `rgb(${col.rgb})`);
  g.addColorStop(1, `rgb(${col.lo})`);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = `rgba(${col.lo},0.7)`;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  const rnd = mulberry32(seed + 99);
  ctx.fillStyle = `rgb(${col.rgb})`;
  for (let i = 0; i < 7; i++) {
    const a = rnd() * TAU;
    const d = r * (1.35 + rnd() * 0.9);
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * (0.07 + rnd() * 0.12), 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.32, r * 0.22, r * 0.1, -0.6, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── shark (nose up, tail down) ─────────────────────────
export function drawShark(ctx: Ctx, s = 1, t = 0, mouth = 0.5) {
  ctx.save();
  ctx.scale(s, s);
  const wag = Math.sin(t * 16) * 0.28;
  // tail
  ctx.save();
  ctx.translate(0, 26);
  ctx.rotate(wag);
  polyPath(ctx, [0, 0, -15, 24, -4, 15, 0, 19, 4, 15, 15, 24]);
  ctx.fillStyle = lin(ctx, 0, 0, 0, 24, [
    [0, '#2c66b8'],
    [1, '#16407e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0e2c5c';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  // pectoral fins
  for (const k of [-1, 1]) {
    polyPath(ctx, [k * 12, -4, k * 31, 13, k * 11, 11]);
    ctx.fillStyle = '#2f6fc4';
    ctx.fill();
    ctx.strokeStyle = '#0e2c5c';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // body
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.bezierCurveTo(14, -34, 17, -10, 12, 16);
  ctx.bezierCurveTo(9, 28, 4, 32, 0, 32);
  ctx.bezierCurveTo(-4, 32, -9, 28, -12, 16);
  ctx.bezierCurveTo(-17, -10, -14, -34, 0, -36);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -17, 0, 17, 0, [
    [0, '#9fd0f0'],
    [0.2, '#3d86d6'],
    [0.5, '#1d4f9e'],
    [0.8, '#3d86d6'],
    [1, '#9fd0f0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0e2c5c';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // dorsal fin
  polyPath(ctx, [0, -2, 3.4, 18, -3.4, 18]);
  ctx.fillStyle = '#143a78';
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,220,255,0.6)';
  ctx.lineWidth = 0.7;
  for (const k of [-1, 1])
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(k * 13, -2 + i * 4.4);
      ctx.lineTo(k * 9.4, -3.6 + i * 4.4);
      ctx.stroke();
    }
  // mouth + teeth
  const ry = 2 + mouth * 6.5;
  ctx.beginPath();
  ctx.ellipse(0, -29, 8.6, ry, 0, 0, TAU);
  ctx.fillStyle = '#4a0a14';
  ctx.fill();
  ctx.fillStyle = '#e8718c';
  ctx.beginPath();
  ctx.ellipse(0, -29 + ry * 0.45, 4.4, ry * 0.4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#9aa6b8';
  ctx.lineWidth = 0.5;
  for (let i = -3; i <= 3; i++) {
    const x = i * 2.5;
    const yy = ry * Math.sqrt(Math.max(0, 1 - (x / 8.6) * (x / 8.6)));
    polyPath(ctx, [x - 1.35, -29 - yy - 0.4, x + 1.35, -29 - yy - 0.4, x, -29 - yy + 3.2]);
    ctx.fill();
    ctx.stroke();
    polyPath(ctx, [x - 1.35, -29 + yy + 0.4, x + 1.35, -29 + yy + 0.4, x, -29 + yy - 3.2]);
    ctx.fill();
    ctx.stroke();
  }
  // eyes
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 9.4, -17, 3.1, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#10141c';
    ctx.beginPath();
    ctx.arc(k * 9.4, -16.4, 1.6, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 9.4 - 0.5, -17.1, 0.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────── ghost (tail down) ─────────────────────────
export function drawGhost(ctx: Ctx, s = 1, t = 0, alpha = 1, open = 0.3) {
  ctx.save();
  ctx.scale(s, s);
  ctx.globalAlpha = alpha;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('90,255,235'), 0, 4, 78, 0.45 * alpha);
  ctx.restore();
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(-17, -8);
    ctx.arc(0, -8, 17, Math.PI, TAU);
    ctx.lineTo(17, 18);
    const n = 4;
    for (let i = 0; i < n; i++) {
      const x0 = 17 - (34 * i) / n;
      const x1 = 17 - (34 * (i + 1)) / n;
      const wob = Math.sin(t * 10 + i * 1.7) * 3;
      ctx.quadraticCurveTo((x0 + x1) / 2, 18 + (i % 2 ? -7 : 11) + wob, x1, 18);
    }
    ctx.closePath();
  };
  // arms
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 17.5, 4 + Math.sin(t * 6 + k) * 1.5, 5, 7, k * 0.5, 0, TAU);
    ctx.fillStyle = 'rgba(235,255,252,0.92)';
    ctx.fill();
  }
  body();
  const g = ctx.createRadialGradient(-4, -12, 2, 0, 0, 26);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.7, '#d9fffa');
  g.addColorStop(1, '#8ee8e0');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,250,235,0.95)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // face
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#10222a';
    ctx.beginPath();
    ctx.ellipse(k * 6.2, -8, 3.1, 4.6, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,255,240'), k * 6.2, -8, 11, 0.8);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 6.2 - 0.9, -9.6, 0.9, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#10222a';
  ctx.beginPath();
  ctx.ellipse(0, 3, 3 + open * 1.4, 2.2 + open * 5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,170,190,0.35)';
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 11, -1, 2.8, 1.6, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────── mini UFO (side view, dome up) ─────────────────────────
export function drawUfo(ctx: Ctx, s = 1, t = 0) {
  ctx.save();
  ctx.scale(s, s);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('90,255,140'), 0, 6, 54, 0.45);
  ctx.restore();
  // emitter underside
  ctx.beginPath();
  ctx.ellipse(0, 7, 8, 3.4, 0, 0, TAU);
  ctx.fillStyle = '#3c4a58';
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('150,255,180'), 0, 8, 16, 0.9);
  ctx.restore();
  // disc
  ctx.beginPath();
  ctx.ellipse(0, 1, 23, 7.4, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, 0, -7, 0, 9, [
    [0, '#f2f5fa'],
    [0.45, '#aab4c4'],
    [1, '#4a5565'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#2a323e';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const x = -16 + i * 6.4;
    const on = Math.sin(t * 10 + i * 1.3) > 0;
    ctx.fillStyle = on ? '#8dff9c' : '#2f6a3a';
    ctx.beginPath();
    ctx.arc(x, 2.2 + 2 * Math.cos((i - 2.5) * 0.4), 1.5, 0, TAU);
    ctx.fill();
    if (on) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('120,255,150'), x, 2.2, 9, 0.8);
      ctx.restore();
    }
  }
  // dome
  ctx.beginPath();
  ctx.ellipse(0, -2, 11.5, 11.5, 0, Math.PI, TAU);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, -14, 0, -1, [
    [0, 'rgba(210,255,225,0.95)'],
    [1, 'rgba(90,230,140,0.8)'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,120,60,0.85)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // alien pilot
  ctx.fillStyle = '#4fd36a';
  ctx.beginPath();
  ctx.ellipse(0, -5, 4.2, 4.8, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#0e2412';
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 1.9, -5.4, 1.2, 1.9, k * 0.5, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(-4.6, -9, 2.4, 1.1, -0.7, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── meteor rock ─────────────────────────
export interface Rock {
  pts: number[];
  cracks: number[][];
  r: number;
}
export function makeRock(r: number, seed: number): Rock {
  const rnd = mulberry32(seed);
  const pts: number[] = [];
  const n = 11;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (rnd() - 0.5) * 0.3;
    const rr = r * (0.78 + rnd() * 0.3);
    pts.push(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const cracks: number[][] = [];
  for (let k = 0; k < 5; k++) {
    const a = rnd() * TAU;
    const line: number[] = [Math.cos(a) * r * 0.1, Math.sin(a) * r * 0.1];
    let aa = a;
    for (let j = 1; j <= 4; j++) {
      aa += (rnd() - 0.5) * 0.8;
      const d = (r * 0.9 * j) / 4;
      line.push(Math.cos(aa) * d, Math.sin(aa) * d);
    }
    cracks.push(line);
  }
  return { pts, cracks, r };
}

export function drawRock(ctx: Ctx, m: Rock, t: number, heat = 1) {
  const r = m.r;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,110,30'), 0, 0, r * 4.4, 0.5 * heat);
  ctx.restore();
  polyPath(ctx, m.pts, true);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
  g.addColorStop(0, '#6a5448');
  g.addColorStop(0.5, '#34261f');
  g.addColorStop(1, '#120b08');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  polyPath(ctx, m.pts, true);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const pul = 0.7 + 0.3 * Math.sin(t * 6);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const c of m.cracks) {
    ctx.strokeStyle = `rgba(255,90,20,${0.4 * heat * pul})`;
    ctx.lineWidth = r * 0.22;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1]);
    for (let k = 2; k < c.length; k += 2) ctx.lineTo(c[k], c[k + 1]);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,200,90,${0.95 * heat * pul})`;
    ctx.lineWidth = r * 0.08;
    ctx.stroke();
  }
  ctx.restore();
  polyPath(ctx, m.pts, true);
  ctx.strokeStyle = `rgba(255,140,40,${0.7 * heat})`;
  ctx.lineWidth = Math.max(0.8, r * 0.08);
  ctx.stroke();
}

// ───────────────────────── diamond (point down) ─────────────────────────
export function drawDiamond(ctx: Ctx, r: number, t = 0) {
  const T1: [number, number] = [-0.5 * r, -0.75 * r];
  const T2: [number, number] = [0.5 * r, -0.75 * r];
  const G1: [number, number] = [-r, -0.2 * r];
  const G2: [number, number] = [r, -0.2 * r];
  const M1: [number, number] = [-0.3 * r, -0.2 * r];
  const M2: [number, number] = [0.3 * r, -0.2 * r];
  const Mc: [number, number] = [0, -0.2 * r];
  const P: [number, number] = [0, 0.95 * r];
  const facet = (a: [number, number][], fill: string) => {
    ctx.beginPath();
    ctx.moveTo(a[0][0], a[0][1]);
    for (let i = 1; i < a.length; i++) ctx.lineTo(a[i][0], a[i][1]);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };
  facet([T1, T2, M2, M1], '#effcff');
  facet([G1, T1, M1], '#a6e1fa');
  facet([G2, T2, M2], '#78c6f0');
  facet([T1, M1, Mc], '#d3f3ff');
  facet([T2, M2, Mc], '#bfeaff');
  facet([G1, M1, P], '#62b6ea');
  facet([M1, Mc, P], '#c4ecfd');
  facet([Mc, M2, P], '#8cd4f6');
  facet([M2, G2, P], '#4aa0e2');
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(235,252,255,0.85)';
  ctx.lineWidth = Math.max(0.5, r * 0.05);
  ctx.beginPath();
  ctx.moveTo(...T1);
  ctx.lineTo(...T2);
  ctx.lineTo(...G2);
  ctx.lineTo(...P);
  ctx.lineTo(...G1);
  ctx.closePath();
  ctx.moveTo(...G1);
  ctx.lineTo(...G2);
  ctx.moveTo(...M1);
  ctx.lineTo(...P);
  ctx.moveTo(...M2);
  ctx.lineTo(...P);
  ctx.moveTo(...T1);
  ctx.lineTo(...M1);
  ctx.moveTo(...T2);
  ctx.lineTo(...M2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20,90,150,0.7)';
  ctx.lineWidth = Math.max(0.5, r * 0.04);
  ctx.beginPath();
  ctx.moveTo(...T1);
  ctx.lineTo(...T2);
  ctx.lineTo(...G2);
  ctx.lineTo(...P);
  ctx.lineTo(...G1);
  ctx.closePath();
  ctx.stroke();
  const ph = (t * 0.9) % 1;
  if (ph < 0.3) {
    const k = Math.sin((ph / 0.3) * Math.PI);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('220,250,255'), -r * 0.2 + ph * r, -r * 0.45, r * 1.5 * k, k, 0);
    ctx.restore();
  }
}

// ───────────────────────── electric orb ─────────────────────────
export function drawElectricOrb(ctx: Ctx, x: number, y: number, r: number, t: number, power = 1, arcs = 3) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('60,140,255'), x, y, r * 6.5, 0.55 * power);
  drawSprite(ctx, glowSprite('180,230,255'), x, y, r * 3, 0.5 * power);
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.45, '#cfeaff');
  g.addColorStop(1, '#4a9cff');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < arcs; k++) {
    const a = Math.random() * TAU + t * 0.1;
    const L = r * (1.8 + Math.random() * 1.6);
    const pts = makeBolt(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L, 0.38, 3);
    strokeBolt(ctx, pts, Math.max(0.8, r * 0.16));
  }
  ctx.restore();
}

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
export function drawStuckItem5(ctx: Ctx, it: StuckItem, R: number, time: number) {
  switch (it.weapon) {
    case 'moonbeam': {
      const tw = 0.7 + 0.3 * Math.sin(time * 3 + it.seed);
      ctx.save();
      ctx.translate(R + 9, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('190,170,255'), 0, 0, 56, 0.4 * tw + 0.15);
      ctx.restore();
      ctx.rotate(Math.PI / 2);
      drawMoon(ctx, 13);
      ctx.restore();
      const ph = (time * 0.7 + it.seed) % 1;
      if (ph < 0.16) {
        const k = Math.sin((ph / 0.16) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('240,235,255'), R + 16, -4, 18 * k, k, time);
        ctx.restore();
      }
      break;
    }
    case 'storm': {
      ctx.save();
      drawElectricOrb(ctx, R + 8, 0, 7.5, time * 2 + it.seed, 0.9, 2);
      ctx.restore();
      break;
    }
    case 'pencil': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 5) * Math.sin(it.t * 56);
      ctx.save();
      ctx.translate(R, 0);
      ctx.rotate(wob);
      ctx.translate(-14, 0);
      ctx.rotate(-Math.PI / 2);
      drawPencil(ctx, 56, 11);
      ctx.restore();
      break;
    }
    case 'sandal': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 4.5) * Math.sin(it.t * 40);
      ctx.save();
      ctx.translate(R + 10, 0);
      ctx.rotate(Math.PI / 2 + wob);
      drawSandal(ctx, 0.85);
      ctx.restore();
      break;
    }
    case 'paintball': {
      const col = PAINT[(it.shape?.[0] ?? 0) % PAINT.length];
      const grow = easeOutBack(clamp(it.t / 0.2, 0, 1));
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.scale(grow, grow);
      const lumps: [number, number, number][] = [
        [3, 0, 7.5],
        [8, -5.5, 5],
        [8, 5.5, 5],
        [12, 0, 4],
      ];
      for (const [x, y, r] of lumps) {
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
        g.addColorStop(0, `rgb(${col.hi})`);
        g.addColorStop(0.5, `rgb(${col.rgb})`);
        g.addColorStop(1, `rgb(${col.lo})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = `rgba(${col.lo},0.7)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.ellipse(7, -3.8, 2.4, 1.2, -0.6, 0, TAU);
      ctx.ellipse(11, 2.6, 1.4, 0.8, -0.4, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(R + 4, 0);
      ctx.rotate(it.up ?? 0);
      const len = 3 + 11 * (1 - Math.exp(-it.t * 0.8)) + 1.2 * Math.sin(time * 2 + it.seed);
      ctx.beginPath();
      ctx.moveTo(-2.4, 2);
      ctx.lineTo(2.4, 2);
      ctx.lineTo(1.4, len);
      ctx.arc(0, len, 2.7, 0, Math.PI);
      ctx.closePath();
      ctx.fillStyle = `rgb(${col.rgb})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${col.lo},0.8)`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'wand': {
      const tw = 0.8 + 0.2 * Math.sin(time * 5 + it.seed);
      ctx.save();
      ctx.translate(R + 13, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,190,240'), 0, 0, 52 * tw, 0.55);
      ctx.restore();
      ctx.rotate(time * 0.6 + it.seed);
      drawGoldStar(ctx, 12.5, -Math.PI / 2, false);
      ctx.restore();
      const ph = (time * 0.8 + it.seed) % 1;
      if (ph < 0.2) {
        const k = Math.sin((ph / 0.2) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('255,235,255'), R + 20, -6, 20 * k, k, time);
        ctx.restore();
      }
      break;
    }
    case 'shark': {
      const wag = Math.sin(time * 12 + it.seed) * 0.14 * (0.4 + 0.6 * Math.exp(-it.t * 0.8));
      ctx.save();
      ctx.translate(R + 8, 0);
      ctx.rotate(-Math.PI / 2 + wag);
      drawShark(ctx, 0.72, it.t, 0.9);
      ctx.restore();
      break;
    }
    case 'ghost': {
      const bob = Math.sin(time * 2.4 + it.seed) * 3;
      ctx.save();
      ctx.translate(R + 14, 0);
      ctx.rotate(it.up ?? 0);
      ctx.translate(0, bob);
      drawGhost(ctx, 0.9, time + it.seed, 0.92, 0.3 + 0.3 * Math.sin(time * 3));
      ctx.restore();
      break;
    }
    case 'ufo': {
      ctx.save();
      ctx.translate(R + 11, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const fl = 0.6 + 0.4 * Math.sin(time * 9 + it.seed);
      ctx.fillStyle = `rgba(120,255,160,${0.2 * fl})`;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(-30, -20);
      ctx.lineTo(-30, 20);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.rotate(Math.PI / 2);
      drawUfo(ctx, 0.72, time * 0.8 + it.seed);
      ctx.restore();
      break;
    }
    case 'rainbow': {
      ctx.save();
      ctx.translate(R + 2, 0);
      ctx.rotate(Math.PI / 2);
      const gr = easeOutCubic(clamp(it.t / 0.3, 0, 1));
      drawRainbowArc(ctx, 22, 8 + 18 * gr, 3, 0.96);
      for (const k of [-1, 1]) {
        ctx.save();
        ctx.translate(k * 19, -1);
        drawCloud(ctx, 0.62);
        ctx.restore();
      }
      ctx.restore();
      const ph = (time * 0.8 + it.seed) % 1;
      if (ph < 0.18) {
        const k = Math.sin((ph / 0.18) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('255,245,200'), R + 20, 0, 18 * k, k, time);
        ctx.restore();
      }
      break;
    }
    case 'meteor': {
      const hot = 0.55 + 0.45 * Math.max(0, 1 - it.t / 4);
      ctx.save();
      ctx.translate(R + 3, 0);
      ctx.rotate(it.seed);
      const rock = ROCK_STUCK;
      drawRock(ctx, rock, time + it.seed, hot);
      ctx.restore();
      break;
    }
    case 'diamond': {
      ctx.save();
      ctx.translate(R + 7, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('150,225,255'), 0, 0, 44, 0.35 + 0.15 * Math.sin(time * 4 + it.seed));
      ctx.restore();
      ctx.rotate(Math.PI / 2);
      drawDiamond(ctx, 11, time + it.seed);
      ctx.restore();
      break;
    }
    default:
      break;
  }
}
const ROCK_STUCK = makeRock(11, 31);

// ───────────────────────── HUD ammo glyphs (g pre-translated to centre, scaled 2.2x) ─────────────────────────
export function drawAmmoGlyph5(g: Ctx, weapon: WeaponId) {
  switch (weapon) {
    case 'moonbeam':
      g.save();
      g.translate(0, 1);
      drawMoon(g, 10.5);
      g.restore();
      break;
    case 'storm':
      drawElectricOrb(g, 0, 0, 6.2, 0.5, 0.8, 0);
      g.strokeStyle = '#e8f6ff';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(1, -10);
      g.lineTo(-3, 0);
      g.lineTo(2, 0);
      g.lineTo(-2, 10);
      g.stroke();
      break;
    case 'pencil':
      g.save();
      g.rotate(0.6);
      g.scale(0.5, 0.5);
      g.translate(0, -30);
      drawPencil(g, 60, 12);
      g.restore();
      break;
    case 'sandal':
      g.save();
      g.rotate(0.35);
      drawSandal(g, 0.42);
      g.restore();
      break;
    case 'paintball':
      drawPaintBall(g, 8.6, PAINT[0]);
      break;
    case 'wand':
      g.save();
      g.rotate(0.2);
      drawGoldStar(g, 11, -Math.PI / 2, false);
      g.restore();
      break;
    case 'shark':
      g.save();
      g.scale(0.34, 0.34);
      g.translate(0, 4);
      drawShark(g, 1, 0, 0.6);
      g.restore();
      break;
    case 'ghost':
      g.save();
      g.scale(0.52, 0.52);
      g.translate(0, 0);
      drawGhost(g, 1, 0.4, 1, 0.3);
      g.restore();
      break;
    case 'ufo':
      g.save();
      g.scale(0.4, 0.4);
      drawUfo(g, 1, 0.5);
      g.restore();
      break;
    case 'rainbow':
      g.save();
      g.translate(0, 5);
      drawRainbowArc(g, 12, 13, 1.6, 1);
      g.restore();
      break;
    case 'meteor':
      drawRock(g, ICON_ROCK, 0.5, 0.8);
      break;
    case 'diamond':
      g.save();
      g.translate(0, -1);
      drawDiamond(g, 9, 0);
      g.restore();
      break;
    default:
      break;
  }
}
const ICON_ROCK = makeRock(8, 17);
