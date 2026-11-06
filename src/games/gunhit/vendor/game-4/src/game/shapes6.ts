import { type Ctx, TAU, clamp, drawSprite, easeOutBack, easeOutCubic, glowSprite, lin, makeCanvas, mulberry32, polyPath, roundRect, starSprite } from './core';
import { drawSnowflake } from './shapes2';
import { drawFlame4 } from './shapes4';
import { drawElectricOrb, strokeBolt } from './shapes5';
import type { StuckItem, WeaponId } from './weapons';

export const SUIT_RED = '#d4202e';
export const SUIT_DARK = '#1b1b26';

// ───────────────────────── fish (nose up, tail down) ─────────────────────────
export function drawFish(ctx: Ctx, s = 1, t = 0, open = 0.3) {
  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  const wag = Math.sin(t * 16) * 0.3;
  ctx.save();
  ctx.translate(0, 24);
  ctx.rotate(wag);
  polyPath(ctx, [0, 0, -16, 28, -5, 19, 0, 25, 5, 19, 16, 28]);
  ctx.fillStyle = lin(ctx, 0, 0, 0, 28, [
    [0, '#3aa0ff'],
    [1, '#1b5fc4'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0e3a80';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.restore();
  for (const k of [-1, 1]) {
    polyPath(ctx, [k * 13, -2, k * 32, 14, k * 12, 12]);
    ctx.fillStyle = lin(ctx, 0, -2, 0, 14, [
      [0, '#ffe27a'],
      [1, '#ff9a1a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#a85a00';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, -35);
  ctx.bezierCurveTo(17, -33, 20, -4, 12, 18);
  ctx.bezierCurveTo(9, 28, 4, 33, 0, 33);
  ctx.bezierCurveTo(-4, 33, -9, 28, -12, 18);
  ctx.bezierCurveTo(-20, -4, -17, -33, 0, -35);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -20, 0, 20, 0, [
    [0, '#d9501a'],
    [0.25, '#ff9a2b'],
    [0.5, '#ffcc70'],
    [0.75, '#ff9a2b'],
    [1, '#d9501a'],
  ]);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,248,230,0.92)';
  ctx.beginPath();
  ctx.ellipse(0, 28, 12, 14, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.92)';
  ctx.lineWidth = 3.2;
  for (const y of [-6, 6]) {
    ctx.beginPath();
    ctx.moveTo(-18, y - 3);
    ctx.quadraticCurveTo(0, y + 5, 18, y - 3);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(160,60,10,0.3)';
  ctx.lineWidth = 0.8;
  for (let r = 0; r < 5; r++)
    for (let c = -2; c <= 2; c++) {
      ctx.beginPath();
      ctx.arc(c * 6 + (r % 2) * 3, 10 + r * 5.5, 3.4, 0, Math.PI);
      ctx.stroke();
    }
  ctx.restore();
  ctx.strokeStyle = '#8a3000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  polyPath(ctx, [0, -2, 4.4, 18, -4.4, 18]);
  ctx.fillStyle = '#2a7be0';
  ctx.fill();
  ctx.strokeStyle = '#0e3a80';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  const ry = 1.6 + open * 5.4;
  ctx.beginPath();
  ctx.ellipse(0, -30, 7.4, ry, 0, 0, TAU);
  ctx.fillStyle = '#5a0e1a';
  ctx.fill();
  ctx.fillStyle = '#ee7088';
  ctx.beginPath();
  ctx.ellipse(0, -30 + ry * 0.4, 3.6, ry * 0.4, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#8a3000';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, -30, 7.4, ry, 0, 0, TAU);
  ctx.stroke();
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 9.2, -17, 4.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#8a3000';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#10141c';
    ctx.beginPath();
    ctx.arc(k * 9.2, -16.2, 2.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 9.2 - 0.8, -17.4, 0.9, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ───────────────────────── missiles (nose up, centred) ─────────────────────────
/** kind 0 = RPG grenade (pear warhead), kind 1 = slim bazooka rocket */
export function drawMissile(ctx: Ctx, kind: 0 | 1, flame = 0, t = 0) {
  const tail = kind ? 32 : 28;
  if (flame > 0.02) {
    ctx.save();
    ctx.translate(0, tail);
    ctx.rotate(Math.PI);
    drawFlame4(ctx, (kind ? 34 : 28) * flame, kind ? 11 : 10, t, kind ? 3 : 1, 1);
    ctx.restore();
  }
  ctx.lineJoin = 'round';
  if (kind === 0) {
    for (const k of [-1, 1]) {
      polyPath(ctx, [k * 4.6, 18, k * 12, 31, k * 12, 34, k * 4.6, 29]);
      ctx.fillStyle = '#2b2f2a';
      ctx.fill();
      ctx.strokeStyle = '#0a0c0a';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    roundRect(ctx, -4.8, 2, 9.6, 26, 2);
    ctx.fillStyle = lin(ctx, -5, 0, 5, 0, [
      [0, '#1c2018'],
      [0.4, '#6a7468'],
      [1, '#161a14'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#0a0c0a';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -37);
    ctx.bezierCurveTo(5, -35, 8, -27, 11, -14);
    ctx.bezierCurveTo(13, -6, 9, 2, 5, 4);
    ctx.lineTo(-5, 4);
    ctx.bezierCurveTo(-9, 2, -13, -6, -11, -14);
    ctx.bezierCurveTo(-8, -27, -5, -35, 0, -37);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, -12, 0, 12, 0, [
      [0, '#21480e'],
      [0.28, '#5fb12a'],
      [0.5, '#cdf58a'],
      [0.75, '#4f9a22'],
      [1, '#1c400a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#173208';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    polyPath(ctx, [-3.2, -34, 3.2, -34, 4, -30, -4, -30]);
    ctx.fill();
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(-10.4, -8, 20.8, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.ellipse(-4.4, -18, 1.8, 7, 0.2, 0, TAU);
    ctx.fill();
  } else {
    for (const k of [-1, 1]) {
      polyPath(ctx, [k * 5, 20, k * 13, 35, k * 13, 38, k * 5, 30]);
      ctx.fillStyle = '#3c4a1c';
      ctx.fill();
      ctx.strokeStyle = '#141c08';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    roundRect(ctx, -5.4, -30, 10.8, 62, 3);
    ctx.fillStyle = lin(ctx, -6, 0, 6, 0, [
      [0, '#26300f'],
      [0.35, '#7a8e38'],
      [0.55, '#b6c868'],
      [1, '#222c0c'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#141c08';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    polyPath(ctx, [-5.4, -30, 0, -48, 5.4, -30]);
    ctx.fillStyle = lin(ctx, -6, 0, 6, 0, [
      [0, '#7a0e14'],
      [0.45, '#ff4a4a'],
      [1, '#6a0a10'],
    ]);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(-5.4, -24, 10.8, 3);
    ctx.fillRect(-5.4, 14, 10.8, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(-3.6, -28, 2, 56);
  }
}

// ───────────────────────── horseshoe magnet (tips up) ─────────────────────────
export function drawMagnet(ctx: Ctx, s = 1, t = 0, field = 0) {
  ctx.save();
  ctx.scale(s, s);
  const r = 15;
  const L = 22;
  const w = 11;
  const U = (lw: number, col: string) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(-r, -L);
    ctx.lineTo(-r, 0);
    ctx.arc(0, 0, r, Math.PI, 0, true);
    ctx.lineTo(r, -L);
    ctx.stroke();
  };
  U(w + 3, '#4a0810');
  U(w, '#d92638');
  U(w * 0.4, '#ff8a92');
  for (const k of [-1, 1]) {
    ctx.fillStyle = lin(ctx, k * r - w / 2, 0, k * r + w / 2, 0, [
      [0, '#6c7480'],
      [0.45, '#f4f7fa'],
      [1, '#5a626e'],
    ]);
    ctx.fillRect(k * r - w / 2, -L, w, 9);
    ctx.strokeStyle = '#2a323c';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(k * r - w / 2, -L, w, 9);
  }
  if (field > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 1; k <= 3; k++) {
      const g = ctx.createLinearGradient(-r * 1.5, 0, r * 1.5, 0);
      g.addColorStop(0, `rgba(255,90,90,${0.85 * field})`);
      g.addColorStop(1, `rgba(110,150,255,${0.85 * field})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.2 - k * 0.4;
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -t * 40 * (k % 2 ? 1 : -1);
      ctx.beginPath();
      ctx.ellipse(0, -L - 4, r * (0.6 + k * 0.62), 8 + k * 10, 0, Math.PI, TAU);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    drawSprite(ctx, glowSprite('255,90,90'), -r, -L - 3, 24, 0.7 * field);
    drawSprite(ctx, glowSprite('110,150,255'), r, -L - 3, 24, 0.7 * field);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── cannonball with skull ─────────────────────────
export function drawCannonball(ctx: Ctx, r: number, skull = true) {
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r * 1.15);
  g.addColorStop(0, '#8a8f98');
  g.addColorStop(0.35, '#3a3d44');
  g.addColorStop(1, '#08090c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.9)';
  ctx.lineWidth = Math.max(0.6, r * 0.06);
  ctx.stroke();
  if (skull) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#e8e2d2';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, r * 0.2);
    ctx.lineTo(r * 0.5, r * 0.62);
    ctx.moveTo(r * 0.5, r * 0.2);
    ctx.lineTo(-r * 0.5, r * 0.62);
    ctx.stroke();
    ctx.fillStyle = '#f4efe0';
    ctx.beginPath();
    ctx.arc(0, -r * 0.14, r * 0.38, 0, TAU);
    ctx.fill();
    ctx.fillRect(-r * 0.2, r * 0.1, r * 0.4, r * 0.24);
    ctx.fillStyle = '#0a0a0e';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.16, r * 0.1, 0, TAU);
    ctx.arc(r * 0.15, -r * 0.16, r * 0.1, 0, TAU);
    ctx.fill();
    polyPath(ctx, [0, -r * 0.04, r * 0.05, r * 0.06, -r * 0.05, r * 0.06]);
    ctx.fill();
    ctx.fillRect(-r * 0.1, r * 0.16, r * 0.04, r * 0.16);
    ctx.fillRect(r * 0.06, r * 0.16, r * 0.04, r * 0.16);
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.4, -r * 0.5, r * 0.22, r * 0.11, -0.7, 0, TAU);
  ctx.fill();
}

export function drawCoin(ctx: Ctx, r: number, flip: number) {
  const f = Math.abs(flip) * 0.92 + 0.08;
  ctx.save();
  ctx.scale(f, 1);
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#fff3b0');
  g.addColorStop(0.5, '#f2b81a');
  g.addColorStop(1, '#a86a06');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#7a4a00';
  ctx.lineWidth = Math.max(0.6, r * 0.12);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,70,0,0.7)';
  ctx.lineWidth = Math.max(0.5, r * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.62, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = 'rgba(140,80,0,0.8)';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.16 : r * 0.4;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── playing cards ─────────────────────────
export function fillSuit(ctx: Ctx, suit: number, r: number, fill: string) {
  ctx.fillStyle = fill;
  const heart = () => {
    ctx.beginPath();
    ctx.moveTo(0, r * 0.95);
    ctx.bezierCurveTo(-r * 1.6, -r * 0.1, -r * 0.9, -r * 1.1, 0, -r * 0.4);
    ctx.bezierCurveTo(r * 0.9, -r * 1.1, r * 1.6, -r * 0.1, 0, r * 0.95);
    ctx.closePath();
    ctx.fill();
  };
  if (suit === 0) heart();
  else if (suit === 1) {
    polyPath(ctx, [0, -r * 1.05, r * 0.72, 0, 0, r * 1.05, -r * 0.72, 0]);
    ctx.fill();
  } else if (suit === 2) {
    ctx.save();
    ctx.scale(1, -1);
    heart();
    ctx.restore();
    polyPath(ctx, [0, r * 0.1, r * 0.4, r * 1.05, -r * 0.4, r * 1.05]);
    ctx.fill();
  } else {
    for (const [x, y] of [
      [0, -r * 0.5],
      [-r * 0.55, r * 0.18],
      [r * 0.55, r * 0.18],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, r * 0.52, 0, TAU);
      ctx.fill();
    }
    polyPath(ctx, [0, 0, r * 0.4, r * 1.05, -r * 0.4, r * 1.05]);
    ctx.fill();
  }
}

interface CardSprite { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number }
const cardSprites = new Map<string, CardSprite>();

/** Static card faces are reused by the card gun, projectile and its confetti. */
function getCardSprite(ctx: Ctx, suit: number, s: number): CardSprite | null {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement) || !Number.isFinite(s) || s <= 0 || s > 4) return null;
  const key = `${suit}:${s}`;
  const cached = cardSprites.get(key);
  if (cached) return cached;
  try {
    const x = Math.floor(-17 * s / 2 - 2);
    const y = Math.floor(-25 * s / 2 - 2);
    const w = Math.ceil(17 * s / 2 + 2) - x;
    const h = Math.ceil(25 * s / 2 + 2) - y;
    const density = 3;
    const canvas = makeCanvas(w * density, h * density);
    const c = canvas.getContext('2d');
    if (!c) return null;
    c.setTransform(density, 0, 0, density, -x * density, -y * density);
    drawPlayingCardVector(c, suit, s);
    const sprite = { canvas, x, y, w, h };
    if (cardSprites.size >= 48) {
      const oldest = cardSprites.keys().next().value;
      if (oldest !== undefined) cardSprites.delete(oldest);
    }
    cardSprites.set(key, sprite);
    return sprite;
  } catch {
    return null;
  }
}

export function drawPlayingCard(ctx: Ctx, suit: number, s = 1) {
  const sprite = getCardSprite(ctx, suit, s);
  if (sprite) ctx.drawImage(sprite.canvas, sprite.x, sprite.y, sprite.w, sprite.h);
  else drawPlayingCardVector(ctx, suit, s);
}

function drawPlayingCardVector(ctx: Ctx, suit: number, s: number) {
  const w = 17 * s;
  const h = 25 * s;
  const red = suit < 2;
  const col = red ? SUIT_RED : SUIT_DARK;
  ctx.save();
  roundRect(ctx, -w / 2, -h / 2, w, h, 2.6 * s);
  ctx.fillStyle = lin(ctx, 0, -h / 2, 0, h / 2, [
    [0, '#ffffff'],
    [1, '#e6e8f0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,76,96,0.85)';
  ctx.lineWidth = Math.max(0.7, s * 0.9);
  ctx.stroke();
  ctx.save();
  ctx.scale(s, s);
  ctx.save();
  ctx.translate(0, 0.6);
  fillSuit(ctx, suit, 5.4, col);
  ctx.restore();
  for (const sgn of [-1, 1]) {
    ctx.save();
    ctx.translate(sgn * 5.2, sgn * 9.4);
    ctx.rotate(sgn > 0 ? Math.PI : 0);
    fillSuit(ctx, suit, 2.3, col);
    ctx.restore();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillRect(-w / 2 + 1.2, -h / 2 + 1.2, w * 0.14, h * 0.62);
  ctx.restore();
}

// ───────────────────────── ice crystal cluster (tips up) ─────────────────────────
export function drawIceCluster(ctx: Ctx, s = 1, t = 0) {
  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(235,250,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(0, 1, 18, 5, 0, 0, TAU);
  ctx.fill();
  const cr: [number, number, number, number][] = [
    [-16, 16, 4.4, -0.75],
    [15, 17, 4.8, 0.78],
    [-9, 25, 6, -0.36],
    [9, 27, 6.4, 0.4],
    [0, 36, 8, 0],
  ];
  for (const [x, L, w, ang] of cr) {
    ctx.save();
    ctx.translate(x, 0);
    ctx.rotate(ang);
    polyPath(ctx, [-w, 0, -w * 0.82, -L * 0.72, 0, -L, w * 0.82, -L * 0.72, w, 0]);
    ctx.fillStyle = lin(ctx, -w, 0, w, 0, [
      [0, '#6fcbf0'],
      [0.35, '#e8fbff'],
      [0.6, '#aee8fb'],
      [1, '#3aa8e0'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,120,180,0.85)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -L);
    ctx.lineTo(0, -2);
    ctx.moveTo(-w * 0.82, -L * 0.72);
    ctx.lineTo(0, -L * 0.3);
    ctx.stroke();
    ctx.restore();
  }
  const ph = (t * 0.8) % 1;
  if (ph < 0.3) {
    const k = Math.sin((ph / 0.3) * Math.PI);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('225,250,255'), -2 + ph * 10, -26, 22 * k, k, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── shrink / grow orb ─────────────────────────
export const SHRINK_PAL = { rgb: '70,255,140', hi: '#eafff0', mid: '#3fe27a', lo: '#0a7a38' };
export const GROW_PAL = { rgb: '255,160,50', hi: '#fff1d8', mid: '#ff9a2b', lo: '#a84a00' };

export function drawSizeOrb(ctx: Ctx, x: number, y: number, r: number, t: number, grow: boolean, power = 1) {
  const pal = grow ? GROW_PAL : SHRINK_PAL;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite(pal.rgb), x, y, r * 6, 0.55 * power);
  for (let k = 0; k < 3; k++) {
    const ph = (t * 1.5 + k / 3) % 1;
    const rr = grow ? r * (0.9 + ph * 1.9) : r * (2.8 - ph * 1.9);
    const a = grow ? 1 - ph : ph;
    ctx.strokeStyle = `rgba(${pal.rgb},${0.9 * a * power})`;
    ctx.lineWidth = Math.max(0.8, r * 0.14);
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, pal.hi);
  g.addColorStop(0.45, pal.mid);
  g.addColorStop(1, pal.lo);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = Math.max(0.7, r * 0.08);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(x - r * 0.32, y - r * 0.36, r * 0.18, 0, TAU);
  ctx.fill();
  // plus / minus emblem
  ctx.fillStyle = 'rgba(10,40,20,0.7)';
  ctx.fillRect(x - r * 0.4, y - r * 0.08, r * 0.8, r * 0.16);
  if (grow) ctx.fillRect(x - r * 0.08, y - r * 0.4, r * 0.16, r * 0.8);
}

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
export function drawStuckItem6(ctx: Ctx, it: StuckItem, R: number, time: number) {
  switch (it.weapon) {
    case 'fish': {
      const flop = Math.sin(it.t * 18) * 0.34 * Math.exp(-it.t * 1.6) + Math.sin(time * 5 + it.seed) * 0.05;
      ctx.save();
      ctx.translate(R + 17, 0);
      ctx.rotate(-Math.PI / 2 + flop);
      drawFish(ctx, 0.72, it.t * 0.7 + it.seed, 0.9);
      ctx.restore();
      break;
    }
    case 'rpg': {
      const hot = Math.max(0, 1 - it.t / 3);
      ctx.save();
      ctx.translate(R + 20, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.scale(0.82, 0.82);
      drawMissile(ctx, 0, 0, time);
      ctx.restore();
      if (hot > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,120,40'), R + 2, 0, 46 * hot + 10, 0.7 * hot);
        ctx.restore();
      }
      break;
    }
    case 'cricket': {
      const pulse = 0.7 + 0.3 * Math.sin(time * 6 + it.seed);
      ctx.save();
      ctx.translate(R + 6, 0);
      drawSizeOrbPurple(ctx, 9.5, time + it.seed, pulse);
      ctx.restore();
      break;
    }
    case 'electro': {
      ctx.save();
      ctx.translate(R + 6, 0);
      ctx.fillStyle = '#9aa6b4';
      ctx.beginPath();
      ctx.arc(0, 0, 5.4, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#2a323c';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ffd23a';
      ctx.fillRect(-1.2, -9, 2.4, 6);
      ctx.restore();
      drawElectricOrb(ctx, R + 6, 0, 4.2, time * 3 + it.seed, 0.8, 2);
      break;
    }
    case 'bazooka': {
      const hot = Math.max(0, 1 - it.t / 3);
      ctx.save();
      ctx.translate(R + 24, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.scale(0.8, 0.8);
      drawMissile(ctx, 1, 0, time);
      ctx.restore();
      if (hot > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,130,50'), R + 2, 0, 50 * hot + 10, 0.7 * hot);
        ctx.restore();
      }
      break;
    }
    case 'freeze': {
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.rotate(Math.PI / 2);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('130,225,255'), 0, -18, 56, 0.4 + 0.15 * Math.sin(time * 3 + it.seed));
      ctx.restore();
      drawIceCluster(ctx, 0.95, time + it.seed);
      ctx.restore();
      break;
    }
    case 'rail': {
      const hot = Math.max(0, 1 - it.t / 2);
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('120,180,255'), 4, 0, 36 + 24 * hot, 0.6 + 0.3 * hot);
      drawSprite(ctx, glowSprite('255,255,255'), 4, 0, 12 + 10 * hot, 0.8);
      ctx.restore();
      ctx.fillStyle = lin(ctx, 0, -2.4, 0, 2.4, [
        [0, '#6a8cc8'],
        [0.5, '#f4faff'],
        [1, '#5a7cb8'],
      ]);
      roundRect(ctx, -2, -2.6, 11, 5.2, 2.4);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'magnet': {
      ctx.save();
      ctx.translate(R - 2 + 22, 0);
      ctx.rotate(-Math.PI / 2);
      drawMagnet(ctx, 0.95, time, 0.5 + 0.3 * Math.sin(time * 4 + it.seed));
      ctx.restore();
      break;
    }
    case 'shrink': {
      const sc = 1 - 0.5 * easeOutCubic(clamp(it.t / 0.45, 0, 1));
      ctx.save();
      ctx.translate(R + 3, 0);
      drawSizeOrb(ctx, 0, 0, 7.5 * sc + 1.5, time + it.seed, false, 0.9);
      ctx.restore();
      break;
    }
    case 'grow': {
      const sc = 0.45 + 0.9 * easeOutBack(clamp(it.t / 0.55, 0, 1));
      ctx.save();
      ctx.translate(R + 5 * sc, 0);
      drawSizeOrb(ctx, 0, 0, 8 * sc, time + it.seed, true, 0.9);
      ctx.restore();
      break;
    }
    case 'pirate': {
      const hot = Math.max(0, 1 - it.t / 2);
      ctx.save();
      ctx.translate(R + 4, 0);
      ctx.rotate(it.seed);
      drawCannonball(ctx, 12.5, true);
      ctx.restore();
      if (hot > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,150,50'), R + 2, 0, 44 * hot, 0.55 * hot);
        ctx.restore();
      }
      break;
    }
    case 'card': {
      const suit = it.shape?.[0] ?? 0;
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 5) * Math.sin(it.t * 50);
      ctx.save();
      ctx.translate(R + 10, 0);
      ctx.rotate(Math.PI / 2 + wob + Math.sin(it.seed) * 0.22);
      drawPlayingCard(ctx, suit, 1.15);
      ctx.restore();
      break;
    }
    default:
      break;
  }
}

function drawSizeOrbPurple(ctx: Ctx, r: number, t: number, pulse: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('170,90,255'), 0, 0, r * 6, 0.55 * pulse);
  drawSprite(ctx, glowSprite('230,190,255'), 0, 0, r * 2.8, 0.5);
  ctx.restore();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.4, '#e0b8ff');
  g.addColorStop(1, '#7a2fd8');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    ctx.strokeStyle = `rgba(245,225,255,${0.7 - k * 0.2})`;
    ctx.lineWidth = r * 0.16;
    const a0 = t * (4 + k * 1.6) + k * 2;
    ctx.beginPath();
    ctx.arc(0, 0, r * (0.5 + k * 0.22), a0, a0 + 1.8);
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────── HUD ammo glyphs (g pre-translated to centre, scaled 2.2x) ─────────────────────────
export function drawAmmoGlyph6(g: Ctx, weapon: WeaponId) {
  switch (weapon) {
    case 'fish':
      g.save();
      g.rotate(0.5);
      drawFish(g, 0.3, 0, 0.3);
      g.restore();
      break;
    case 'rpg':
      g.save();
      g.rotate(0.45);
      g.scale(0.5, 0.5);
      g.translate(0, 2);
      drawMissile(g, 0, 0, 0);
      g.restore();
      break;
    case 'cricket':
      g.save();
      drawSizeOrbPurple(g, 7.4, 0.5, 0.8);
      g.restore();
      break;
    case 'electro':
      drawElectricOrb(g, 0, 0, 6.2, 0.5, 0.8, 0);
      g.fillStyle = '#ffd23a';
      g.fillRect(-1.2, -11, 2.4, 5);
      g.strokeStyle = '#e8f6ff';
      g.lineWidth = 1.5;
      strokeBolt(g, [-8, 8, -2, 2, -5, 1, 3, -8], 0.6);
      break;
    case 'bazooka':
      g.save();
      g.rotate(0.45);
      g.scale(0.44, 0.44);
      g.translate(0, 0);
      drawMissile(g, 1, 0, 0);
      g.restore();
      break;
    case 'freeze':
      g.save();
      g.translate(0, 6);
      drawIceCluster(g, 0.52, 0);
      g.restore();
      break;
    case 'rail':
      g.save();
      g.rotate(0.5);
      roundRect(g, -3, -12, 6, 24, 3);
      g.fillStyle = lin(g, -3, 0, 3, 0, [
        [0, '#4a78c8'],
        [0.5, '#f4faff'],
        [1, '#4a78c8'],
      ]);
      g.fill();
      g.restore();
      break;
    case 'magnet':
      g.save();
      g.translate(0, 3);
      g.rotate(0.3);
      drawMagnet(g, 0.58, 0, 0);
      g.restore();
      break;
    case 'shrink':
      drawSizeOrb(g, 0, 0, 5.4, 0.3, false, 0.8);
      break;
    case 'grow':
      drawSizeOrb(g, 0, 0, 6.2, 0.3, true, 0.8);
      break;
    case 'pirate':
      drawCannonball(g, 9, true);
      break;
    case 'card':
      g.save();
      g.rotate(-0.35);
      drawPlayingCard(g, 2, 0.74);
      g.restore();
      break;
    default:
      break;
  }
}

export { drawSnowflake };
export function seedRand(seed: number) {
  return mulberry32(seed);
}
