import { drawBreakerCoin } from '@/games/shared/coinArt';
import { type Ctx, TAU, clamp, drawSprite, easeOutBack, easeOutCubic, glowSprite, lin, polyPath, roundRect, starSprite } from './core';
import { RAINBOW, crescentPath } from './shapes5';
import { drawCoin, drawIceCluster } from './shapes6';
import type { StuckItem, WeaponId } from './weapons';

// ───────────────────────── gem palettes ─────────────────────────
export interface GemPal {
  rgb: string;
  hi: string;
  l: string;
  m: string;
  d: string;
  dd: string;
}
export const RUBY: GemPal = { rgb: '255,70,100', hi: '#ffe0e6', l: '#ff8aa0', m: '#e8284c', d: '#a50f2e', dd: '#6a0a1e' };
export const EMERALD: GemPal = { rgb: '60,255,150', hi: '#e0ffe8', l: '#7af0a8', m: '#1fc060', d: '#0c8a3c', dd: '#06501f' };
export const SAPPHIRE: GemPal = { rgb: '90,160,255', hi: '#e0ecff', l: '#8ab4ff', m: '#2f6ee8', d: '#1646b0', dd: '#0c2a70' };
export const AMETHYST: GemPal = { rgb: '195,120,255', hi: '#f2e0ff', l: '#cf9bff', m: '#9a4be0', d: '#6a2bb0', dd: '#3e1670' };

/** classic cut gem, flat table on top, point down */
export function drawGem(ctx: Ctx, r: number, pal: GemPal, t = 0) {
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
  facet([T1, T2, M2, M1], pal.hi);
  facet([G1, T1, M1], pal.l);
  facet([G2, T2, M2], pal.m);
  facet([T1, M1, Mc], pal.l);
  facet([T2, M2, Mc], pal.hi);
  facet([G1, M1, P], pal.m);
  facet([M1, Mc, P], pal.l);
  facet([Mc, M2, P], pal.m);
  facet([M2, G2, P], pal.d);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = Math.max(0.5, r * 0.05);
  ctx.beginPath();
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
  ctx.strokeStyle = pal.dd;
  ctx.lineWidth = Math.max(0.6, r * 0.07);
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
    drawSprite(ctx, starSprite(pal.rgb), -r * 0.2 + ph * r, -r * 0.45, r * 1.6 * k, k, 0);
    ctx.restore();
  }
}

/** elongated faceted crystal bolt, tip up, centred */
export function drawShardBolt(ctx: Ctx, L: number, w: number, pal: GemPal) {
  const h = L / 2;
  polyPath(ctx, [0, -h, w / 2, -h * 0.4, w / 2, h * 0.5, 0, h, -w / 2, h * 0.5, -w / 2, -h * 0.4]);
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, pal.d],
    [0.35, pal.l],
    [0.5, pal.hi],
    [0.75, pal.m],
    [1, pal.dd],
  ]);
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = pal.dd;
  ctx.lineWidth = Math.max(0.7, w * 0.07);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = Math.max(0.6, w * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(0, h);
  ctx.moveTo(-w / 2, -h * 0.4);
  ctx.lineTo(0, -h * 0.1);
  ctx.lineTo(w / 2, -h * 0.4);
  ctx.stroke();
}

/** crystal cluster growing from the origin, tips up */
export function drawCrystalCluster(ctx: Ctx, s: number, pal: GemPal, t = 0) {
  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.fillStyle = pal.dd;
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
      [0, pal.d],
      [0.35, pal.hi],
      [0.6, pal.l],
      [1, pal.m],
    ]);
    ctx.fill();
    ctx.strokeStyle = pal.dd;
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
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
    drawSprite(ctx, starSprite(pal.rgb), -2 + ph * 10, -26, 22 * k, k, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── holy ─────────────────────────
/** angel wing growing to +X, feathers fanning upward */
export function drawWing(ctx: Ctx, L: number, flap: number) {
  ctx.save();
  ctx.rotate(-flap);
  for (let i = 5; i >= 0; i--) {
    ctx.save();
    ctx.rotate(-0.12 - i * 0.27 + flap * i * 0.05);
    const l = L * (1 - i * 0.07);
    ctx.beginPath();
    ctx.ellipse(l * 0.5, 0, l * 0.5, L * 0.1, 0, 0, TAU);
    ctx.fillStyle = lin(ctx, 0, -4, l, 4, [
      [0, '#ffffff'],
      [0.7, '#fff7dc'],
      [1, '#ffe08a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(210,160,50,0.75)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

export function drawHolyOrb(ctx: Ctx, r: number, t: number) {
  const flap = 0.15 + 0.35 * Math.abs(Math.sin(t * 14));
  ctx.save();
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * r * 0.6, 0);
    ctx.scale(s, 1);
    drawWing(ctx, r * 2.6, flap);
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,225,140'), 0, 0, r * 6.5, 0.6);
  drawSprite(ctx, glowSprite('255,255,245'), 0, 0, r * 3, 0.7);
  ctx.restore();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.5, '#fff1b8');
  g.addColorStop(1, '#f0b830');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,230,150,0.55)';
  ctx.lineWidth = r * 0.5;
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.7, r * 0.95, r * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = '#f6c040';
  ctx.lineWidth = r * 0.24;
  ctx.beginPath();
  ctx.ellipse(0, -r * 1.7, r * 0.95, r * 0.32, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = '#fffbe8';
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.restore();
}

/** Pearl and halo used by Holy Light (no cross symbols). */
export function drawHolyEmblem(ctx: Ctx, s: number) {
  ctx.save();
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.7, s, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, -s, 0, s, 0, [
    [0, '#b8801a'], [0.32, '#ffe9a0'], [0.5, '#ffffff'],
    [0.75, '#f0c458'], [1, '#8a5a0a'],
  ]);
  ctx.fill(); ctx.strokeStyle = 'rgba(120,70,0,0.8)';
  ctx.lineWidth = Math.max(0.6, s * 0.06); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-s * 0.12, -s * 0.2, s * 0.32, s * 0.48, 0, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fill();
  ctx.restore();
}

// ───────────────────────── unicorn ─────────────────────────
/** tip at origin, base at +Y (L) */
export function drawUnicornHorn(ctx: Ctx, L: number, w: number, t = 0) {
  const cone = () => polyPath(ctx, [0, 0, w / 2, L, -w / 2, L]);
  cone();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#e8d4f0'],
    [0.45, '#ffffff'],
    [1, '#f0c8e8'],
  ]);
  ctx.fill();
  ctx.save();
  cone();
  ctx.clip();
  const cols = ['#ff8ac8', '#ffe27a', '#8ad8ff'];
  ctx.lineWidth = 2.6;
  for (let i = -2; i < L / 7 + 2; i++) {
    const y = i * 7 + ((t * 20) % 7);
    ctx.strokeStyle = cols[((i % 3) + 3) % 3];
    ctx.beginPath();
    ctx.moveTo(-w, y + w * 0.5);
    ctx.lineTo(w, y - w * 0.5);
    ctx.stroke();
  }
  ctx.restore();
  cone();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(190,120,200,0.9)';
  ctx.lineWidth = Math.max(0.7, w * 0.08);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.15, L * 0.45, w * 0.06, L * 0.28, 0.05, 0, TAU);
  ctx.fill();
  roundRect(ctx, -w / 2 - 1, L - 4, w + 2, 6, 3);
  ctx.fillStyle = '#f7b3dc';
  ctx.fill();
}

/** wavy rainbow ribbon growing downward from the origin */
export function drawRainbowStream(ctx: Ctx, len: number, w: number, t: number, fade = true) {
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const gr = ctx.createLinearGradient(0, 0, 0, len);
    gr.addColorStop(0, `rgba(${RAINBOW[i]},0.95)`);
    gr.addColorStop(1, `rgba(${RAINBOW[i]},${fade ? 0 : 0.92})`);
    ctx.strokeStyle = gr;
    ctx.lineWidth = w / 7 + 0.9;
    ctx.beginPath();
    for (let j = 0; j <= 20; j++) {
      const u = j / 20;
      const px = (i - 3) * (w / 7) + Math.sin(u * 8 - t * 12 + i * 0.5) * w * 0.28 * (0.3 + u);
      const py = u * len;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
}

// ───────────────────────── radiation ─────────────────────────
export function drawTrefoil(ctx: Ctx, r: number, bg = '#ffe23a', fg = '#16140a') {
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  for (let i = 0; i < 3; i++) {
    const a0 = (-Math.PI * 2) / 3 + (i * TAU) / 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.86, a0, a0 + Math.PI / 3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.22, 0, TAU);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.13, 0, TAU);
  ctx.fillStyle = fg;
  ctx.fill();
}

export function drawToxicOrb(ctx: Ctx, x: number, y: number, r: number, t: number, power = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('90,255,80'), x, y, r * 6.4, 0.55 * power);
  drawSprite(ctx, glowSprite('200,255,150'), x, y, r * 2.8, 0.5 * power);
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#f2ffd0');
  g.addColorStop(0.45, '#8aef3a');
  g.addColorStop(1, '#2a8a10');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,255,170,0.9)';
  ctx.lineWidth = Math.max(0.7, r * 0.09);
  ctx.stroke();
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 2.4);
  drawTrefoil(ctx, r * 0.66, '#d8ff7a', '#0c2a08');
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.45, r * 0.16, 0, TAU);
  ctx.fill();
}

// ───────────────────────── robot glove (fist up, cuff down) ─────────────────────────
export function drawRobotGlove(ctx: Ctx, s = 1, t = 0, lit = 0.6) {
  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  const red = (x0: number, x1: number) =>
    lin(ctx, x0, 0, x1, 0, [
      [0, '#6a0a10'],
      [0.28, '#d41e28'],
      [0.5, '#ff6a5e'],
      [0.75, '#c01620'],
      [1, '#560810'],
    ]);
  const steel = lin(ctx, -17, 0, 17, 0, [
    [0, '#3a4048'],
    [0.3, '#9aa3ae'],
    [0.5, '#eef2f6'],
    [0.75, '#7a838e'],
    [1, '#2c3238'],
  ]);
  roundRect(ctx, -17, 24, 34, 26, 5);
  ctx.fillStyle = steel;
  ctx.fill();
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#161a20';
  ctx.fillRect(-17, 33, 34, 3);
  ctx.fillRect(-17, 41, 34, 3);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(255,150,40,${0.55 + 0.4 * lit})`;
  ctx.fillRect(-14, 36.6, 28, 3.4);
  drawSprite(ctx, glowSprite('255,150,40'), 0, 38, 44, 0.35 + 0.4 * lit);
  ctx.restore();
  ctx.save();
  ctx.translate(-22, 6);
  ctx.rotate(-0.45);
  roundRect(ctx, -9, -14, 18, 32, 9);
  ctx.fillStyle = red(-9, 9);
  ctx.fill();
  ctx.strokeStyle = '#3a0508';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  roundRect(ctx, -22, -32, 44, 62, 17);
  ctx.fillStyle = red(-22, 22);
  ctx.fill();
  ctx.strokeStyle = '#3a0508';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,4,8,0.7)';
  ctx.lineWidth = 1.6;
  for (const y of [-14, -2, 10]) {
    ctx.beginPath();
    ctx.moveTo(-20, y);
    ctx.quadraticCurveTo(0, y + 5, 20, y);
    ctx.stroke();
  }
  roundRect(ctx, -20, -35, 40, 13, 6);
  ctx.fillStyle = steel;
  ctx.fill();
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.fillStyle = '#161a20';
  for (const x of [-13, -4.4, 4.4, 13]) {
    ctx.beginPath();
    ctx.arc(x, -28.6, 1.7, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-11, -6, 4, 16, 0.1, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(255,170,60,${0.3 + 0.3 * lit})`;
  roundRect(ctx, -3, 8, 6, 18, 3);
  ctx.fill();
  const ph = (t * 0.7) % 1;
  if (ph < 0.2) {
    const k = Math.sin((ph / 0.2) * Math.PI);
    drawSprite(ctx, starSprite('255,235,200'), 12, -28, 18 * k, k, 0);
  }
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── slash / stinger / icicle ─────────────────────────
export function drawSlashWave(ctx: Ctx, R: number) {
  crescentPath(ctx, R, R * 0.9, R * 0.5);
  const g = ctx.createLinearGradient(0, -R, 0, R * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,0.98)');
  g.addColorStop(0.5, 'rgba(130,235,255,0.85)');
  g.addColorStop(1, 'rgba(40,150,255,0.15)');
  ctx.fillStyle = g;
  ctx.fill();
}

/** tip at origin pointing up, tail at +Y (L) */
export function drawStinger(ctx: Ctx, L = 46) {
  const w = 9;
  ctx.lineJoin = 'round';
  ctx.save();
  roundRect(ctx, -w / 2, 14, w, L - 14, 2);
  ctx.clip();
  ctx.fillStyle = '#ffd23a';
  ctx.fillRect(-w, 10, w * 2, L);
  ctx.fillStyle = '#1a1208';
  for (let y = 16; y < L; y += 9) ctx.fillRect(-w, y, w * 2, 4.4);
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, 'rgba(0,0,0,0.35)'],
    [0.4, 'rgba(255,255,255,0.35)'],
    [1, 'rgba(0,0,0,0.4)'],
  ]);
  ctx.fillRect(-w, 10, w * 2, L);
  ctx.restore();
  roundRect(ctx, -w / 2, 14, w, L - 14, 2);
  ctx.strokeStyle = '#3a2a08';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  polyPath(ctx, [0, 0, 5.6, 12, 2.6, 10.4, 3.4, 17, -3.4, 17, -2.6, 10.4, -5.6, 12]);
  ctx.fillStyle = lin(ctx, -5, 0, 5, 0, [
    [0, '#08080c'],
    [0.4, '#4a4a56'],
    [1, '#08080c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  for (const k of [-1, 1]) {
    polyPath(ctx, [(k * w) / 2, L - 12, k * 13, L + 2, (k * w) / 2, L - 2]);
    ctx.fillStyle = 'rgba(235,248,255,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,150,180,0.8)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
}

/** hexagonal ice spear, tip at origin pointing up */
export function drawIcicle(ctx: Ctx, L: number, w: number) {
  polyPath(ctx, [0, 0, w / 2, L * 0.22, w / 2, L, -w / 2, L, -w / 2, L * 0.22]);
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#5cc0f0'],
    [0.35, '#effcff'],
    [0.62, '#a4e4fb'],
    [1, '#3aa0e0'],
  ]);
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(30,120,180,0.9)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, L);
  ctx.moveTo(-w / 2, L * 0.22);
  ctx.lineTo(0, L * 0.4);
  ctx.lineTo(w / 2, L * 0.22);
  ctx.stroke();
}

// ───────────────────────── energy bolts & orbs ─────────────────────────
/** vertical capsule bolt, head at (x, y), tail at y + len. additive. */
export function drawBlasterBolt(ctx: Ctx, x: number, y: number, len: number, w: number, rgb: string) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  const gr = ctx.createLinearGradient(0, y, 0, y + len);
  gr.addColorStop(0, `rgba(${rgb},1)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  const gw = ctx.createLinearGradient(0, y, 0, y + len);
  gw.addColorStop(0, 'rgba(255,255,255,1)');
  gw.addColorStop(1, 'rgba(255,255,255,0)');
  const seg = () => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len);
    ctx.stroke();
  };
  ctx.strokeStyle = gr;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = w * 3.4;
  seg();
  ctx.globalAlpha = 1;
  ctx.lineWidth = w * 1.5;
  seg();
  ctx.strokeStyle = gw;
  ctx.lineWidth = w * 0.6;
  seg();
  drawSprite(ctx, glowSprite(rgb), x, y, w * 8, 0.85);
  ctx.restore();
}

export function drawChargeOrb(ctx: Ctx, x: number, y: number, r: number, t: number, power = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('60,200,255'), x, y, r * 6, 0.6 * power);
  drawSprite(ctx, glowSprite('220,250,255'), x, y, r * 2.8, 0.6 * power);
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.4, '#a8ecff');
  g.addColorStop(0.8, '#1ea4f2');
  g.addColorStop(1, '#0a56c0');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = `rgba(255,255,255,${0.85 - k * 0.2})`;
    ctx.lineWidth = r * 0.16;
    const a0 = t * (6 + k * 2) + k * 2;
    ctx.beginPath();
    ctx.arc(x, y, r * (0.45 + k * 0.2), a0, a0 + 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(200,245,255,0.9)';
  ctx.lineWidth = Math.max(0.7, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
}

export function drawQuantumOrb(ctx: Ctx, x: number, y: number, r: number, t: number, power = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('170,70,255'), x, y, r * 6.4, 0.55 * power);
  drawSprite(ctx, glowSprite('255,190,255'), x, y, r * 2.6, 0.5 * power);
  ctx.restore();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, '#fff0ff');
  g.addColorStop(0.45, '#c070ff');
  g.addColorStop(1, '#5a1ab0');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    ctx.strokeStyle = `rgba(${k ? '120,230,255' : '255,255,255'},0.85)`;
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    for (let j = 0; j <= 24; j++) {
      const u = j / 24;
      const a = t * 5 + k * Math.PI + u * 5.5;
      const rr = r * (1 - u) * 0.95;
      const px = x + Math.cos(a) * rr;
      const py = y + Math.sin(a) * rr;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(160,255,255,0.8)';
  for (let k = 0; k < 3; k++) ctx.fillRect(x - r + Math.random() * r * 2, y - r + Math.random() * r * 2, r * 0.5, r * 0.1);
  ctx.restore();
  ctx.strokeStyle = 'rgba(240,200,255,0.9)';
  ctx.lineWidth = Math.max(0.7, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
}

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
export function drawStuckItem7(ctx: Ctx, it: StuckItem, R: number, time: number) {
  const wob = (k: number, d = 5) => (it.wob ?? 0) * Math.exp(-it.t * d) * Math.sin(it.t * k);
  switch (it.weapon) {
    case 'holy': {
      const tw = 0.7 + 0.3 * Math.sin(time * 3 + it.seed);
      ctx.save();
      ctx.translate(R + 15, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,225,140'), 0, 0, 62, 0.45 * tw + 0.2);
      ctx.restore();
      ctx.rotate(Math.PI / 2);
      drawHolyEmblem(ctx, 14);
      ctx.strokeStyle = '#f6c040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -20, 8, 3, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'unicorn': {
      ctx.save();
      ctx.translate(R - 3, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,190,240'), 0, 22, 56, 0.3 + 0.15 * Math.sin(time * 4 + it.seed));
      ctx.restore();
      drawUnicornHorn(ctx, 40, 10, time);
      ctx.restore();
      const ph = (time * 0.7 + it.seed) % 1;
      if (ph < 0.16) {
        const k = Math.sin((ph / 0.16) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite(RAINBOW[Math.floor(it.seed * 7) % 7]), R + 20, -3, 18 * k, k, time);
        ctx.restore();
      }
      break;
    }
    case 'obliterator': {
      const p = 0.75 + 0.25 * Math.sin(time * 6 + it.seed);
      ctx.save();
      ctx.translate(R + 6, 0);
      drawToxicOrb(ctx, 0, 0, 8 * p + 1, time + it.seed, 0.9);
      ctx.restore();
      break;
    }
    case 'coin': {
      ctx.save();
      ctx.translate(R + 9, 0);
      ctx.rotate(Math.PI / 2);
      drawBreakerCoin(ctx, 0, 0, 10, time, it.seed, 1, true, true);
      ctx.restore();
      break;
    }
    case 'saber': {
      const fl = 0.85 + 0.15 * Math.sin(time * 40);
      ctx.save();
      ctx.translate(R - 2, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const len = 26 * fl;
      for (const [w, c] of [
        [15, 'rgba(60,200,255,0.3)'],
        [8, 'rgba(120,230,255,0.9)'],
        [3.4, 'rgba(255,255,255,1)'],
      ] as [number, string][]) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(len, 0);
        ctx.stroke();
      }
      drawSprite(ctx, glowSprite('90,210,255'), len * 0.5, 0, 60, 0.4);
      ctx.restore();
      ctx.restore();
      break;
    }
    case 'gauntlet': {
      const s = 0.85;
      ctx.save();
      ctx.translate(R - 6, 0);
      ctx.rotate(wob(46, 4.5));
      ctx.translate(34 * s, 0);
      ctx.rotate(-Math.PI / 2);
      drawRobotGlove(ctx, s, time, 0.5 + 0.4 * Math.max(0, 1 - it.t / 3));
      ctx.restore();
      break;
    }
    case 'ruby':
    case 'sapphire': {
      const pal = it.weapon === 'ruby' ? RUBY : SAPPHIRE;
      const r = it.weapon === 'ruby' ? 10 : 6.5;
      ctx.save();
      ctx.translate(R + r, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite(pal.rgb), 0, 0, r * 4.6, 0.4 + 0.15 * Math.sin(time * 4 + it.seed));
      ctx.restore();
      ctx.rotate(Math.PI / 2);
      drawGem(ctx, r, pal, time + it.seed);
      ctx.restore();
      break;
    }
    case 'emerald':
    case 'crystal': {
      const pal = it.weapon === 'emerald' ? EMERALD : AMETHYST;
      const gr = easeOutBack(clamp(it.t / 0.9, 0, 1));
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.rotate(Math.PI / 2);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite(pal.rgb), 0, -16, 58 * gr, 0.35 + 0.15 * Math.sin(time * 3 + it.seed));
      ctx.restore();
      drawCrystalCluster(ctx, Math.max(0.05, gr), pal, time + it.seed);
      ctx.restore();
      break;
    }
    case 'beerifle': {
      ctx.save();
      ctx.translate(R - 6, 0);
      ctx.rotate(wob(60, 4));
      ctx.rotate(-Math.PI / 2);
      drawStinger(ctx, 46);
      ctx.restore();
      break;
    }
    case 'charge': {
      const p = 0.7 + 0.3 * Math.sin(time * 7 + it.seed);
      ctx.save();
      ctx.translate(R + 3, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('70,200,255'), 0, 0, 40 * p, 0.7);
      drawSprite(ctx, glowSprite('255,255,255'), 0, 0, 14, 0.8);
      ctx.strokeStyle = 'rgba(160,235,255,0.8)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 7 + 2 * p, 0, TAU);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      break;
    }
    case 'pulse': {
      const p = (time * 1.4 + it.seed) % 1;
      ctx.save();
      ctx.translate(R + 1, 0);
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('70,215,255'), 3, 0, 26, 0.7);
      ctx.strokeStyle = `rgba(150,235,255,${0.9 * (1 - p)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2, 0, 4 + 14 * p, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#e8fbff';
      roundRect(ctx, -2, -2.4, 9, 4.8, 2.4);
      ctx.fill();
      ctx.restore();
      break;
    }
    case 'cryo': {
      const gr = easeOutBack(clamp(it.t / 0.7, 0, 1));
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.rotate(Math.PI / 2);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('130,225,255'), 0, -16, 52 * gr, 0.35 + 0.15 * Math.sin(time * 3 + it.seed));
      ctx.restore();
      drawIceCluster(ctx, Math.max(0.05, 0.9 * gr), time + it.seed);
      ctx.restore();
      break;
    }
    case 'hyperdrive': {
      ctx.save();
      ctx.translate(R + 6, 0);
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('110,170,255'), 0, 0, 36, 0.6);
      drawSprite(ctx, glowSprite('255,255,255'), 0, 0, 13, 0.85);
      ctx.lineCap = 'round';
      for (let k = 0; k < 2; k++) {
        ctx.save();
        ctx.rotate(time * (k ? -2.4 : 2.8));
        ctx.strokeStyle = `rgba(${k ? '190,215,255' : '110,170,255'},0.9)`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11 + k * 3, 4 + k, 0, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(210,230,255,0.7)';
      ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        const a = (k * TAU) / 4 + time;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
        ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case 'quantum': {
      ctx.save();
      ctx.translate(R + 7, 0);
      drawQuantumOrb(ctx, 0, 0, 8, time * 1.3 + it.seed, 0.9);
      if (Math.sin(time * 22 + it.seed) > 0.6) {
        ctx.globalAlpha = 0.4;
        drawQuantumOrb(ctx, 4, -2, 8, time, 0.5);
      }
      ctx.restore();
      break;
    }
    case 'wars': {
      const hot = Math.max(0, 1 - it.t / 2.6);
      ctx.save();
      ctx.translate(R + 2, 0);
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,70,60'), 0, 0, 18 + 20 * hot, 0.4 + 0.5 * hot);
      drawSprite(ctx, glowSprite('255,230,220'), 0, 0, 7 + 5 * hot, 0.5 + 0.4 * hot);
      ctx.restore();
      break;
    }
    default:
      break;
  }
  void easeOutCubic;
}

// ───────────────────────── HUD ammo glyphs (g pre-translated to centre, scaled 2.2x) ─────────────────────────
export function drawAmmoGlyph7(g: Ctx, weapon: WeaponId) {
  switch (weapon) {
    case 'holy':
      drawHolyEmblem(g, 9);
      break;
    case 'unicorn':
      g.save();
      g.rotate(0.5);
      g.translate(0, -10);
      drawUnicornHorn(g, 22, 8, 0);
      g.restore();
      break;
    case 'obliterator':
      drawTrefoil(g, 9.4);
      break;
    case 'coin':
      drawCoin(g, 9.4, 1);
      break;
    case 'saber':
      g.save();
      g.rotate(0.5);
      g.lineCap = 'round';
      g.strokeStyle = '#2aa6ff';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(0, -11);
      g.lineTo(0, 9);
      g.stroke();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 2.6;
      g.stroke();
      g.restore();
      break;
    case 'gauntlet':
      g.save();
      g.translate(0, -1);
      drawRobotGlove(g, 0.26, 0, 0.5);
      g.restore();
      break;
    case 'ruby':
      drawGem(g, 9.6, RUBY, 0);
      break;
    case 'emerald':
      drawGem(g, 9.6, EMERALD, 0);
      break;
    case 'sapphire':
      drawGem(g, 9.6, SAPPHIRE, 0);
      break;
    case 'crystal':
      g.save();
      g.translate(0, 8);
      drawCrystalCluster(g, 0.52, AMETHYST, 0);
      g.restore();
      break;
    case 'beerifle':
      g.save();
      g.rotate(0.45);
      g.scale(0.5, 0.5);
      g.translate(0, -23);
      drawStinger(g, 46);
      g.restore();
      break;
    case 'charge':
      drawChargeOrb(g, 0, 0, 6.8, 0.4, 0.8);
      break;
    case 'pulse':
      g.save();
      g.rotate(0.5);
      drawBlasterBolt(g, 0, -9, 18, 1.8, '70,215,255');
      g.restore();
      break;
    case 'cryo':
      g.save();
      g.rotate(0.4);
      g.translate(0, -10);
      drawIcicle(g, 22, 8);
      g.restore();
      break;
    case 'hyperdrive':
      g.save();
      g.rotate(0.5);
      drawBlasterBolt(g, 0, -10, 20, 1.6, '120,180,255');
      g.restore();
      break;
    case 'quantum':
      drawQuantumOrb(g, 0, 0, 6.6, 0.4, 0.8);
      break;
    case 'wars':
      g.save();
      g.rotate(0.5);
      drawBlasterBolt(g, 0, -9, 18, 1.8, '255,70,60');
      g.restore();
      break;
    default:
      break;
  }
}
