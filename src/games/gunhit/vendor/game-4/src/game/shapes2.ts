import { type Ctx, TAU, drawSprite, glowSprite, lin, polyPath, starSprite } from './core';
import { drawAmmoGlyph3, drawStuckItem3 } from './shapes3';
import type { StuckItem, WeaponId } from './weapons';

export const BRASS: [number, string][] = [
  [0, '#6b3a05'],
  [0.2, '#d9a03a'],
  [0.42, '#fff0b8'],
  [0.62, '#e8b64a'],
  [0.86, '#9a5f10'],
  [1, '#5a3004'],
];

// ───────────────────────── snow ─────────────────────────
/** six-armed snowflake, caller sets strokeStyle / lineWidth */
export function drawSnowflake(ctx: Ctx, s: number) {
  ctx.lineCap = 'round';
  // The six arms share one style. Transform their coordinates instead of
  // saving/rotating/stroking each arm: snow and freeze bursts can contain
  // hundreds of these little flakes at once.
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * TAU) / 6;
    const x = Math.cos(angle) * s;
    const y = Math.sin(angle) * s;
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.moveTo(x * 0.58, y * 0.58);
    ctx.lineTo(x * 0.84 - y * 0.3, y * 0.84 + x * 0.3);
    ctx.moveTo(x * 0.58, y * 0.58);
    ctx.lineTo(x * 0.84 + y * 0.3, y * 0.84 - x * 0.3);
    ctx.moveTo(x * 0.3, y * 0.3);
    ctx.lineTo(x * 0.46 - y * 0.18, y * 0.46 + x * 0.18);
    ctx.moveTo(x * 0.3, y * 0.3);
    ctx.lineTo(x * 0.46 + y * 0.18, y * 0.46 - x * 0.18);
  }
  ctx.stroke();
}

export function drawSnowball(ctx: Ctx, shape: number[], r: number) {
  polyPath(ctx, shape, true);
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.45, '#eef6ff');
  g.addColorStop(0.8, '#b4d0f2');
  g.addColorStop(1, '#7a9fd6');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,150,210,0.6)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.save();
  polyPath(ctx, shape, true);
  ctx.clip();
  ctx.fillStyle = 'rgba(140,175,225,0.32)';
  ctx.beginPath();
  for (let i = 0; i < shape.length; i += 4) {
    const x = shape[i] * 0.62, y = shape[i + 1] * 0.62, radius = r * 0.2;
    ctx.moveTo(x + radius, y);
    ctx.arc(x, y, radius, 0, TAU);
  }
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  for (let i = 2; i < shape.length; i += 4) {
    const x = shape[i] * 0.45 - r * 0.1, y = shape[i + 1] * 0.45 - r * 0.1, radius = r * 0.1;
    ctx.moveTo(x + radius, y);
    ctx.arc(x, y, radius, 0, TAU);
  }
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.42, r * 0.26, r * 0.13, -0.6, 0, TAU);
  ctx.fill();
}

// ───────────────────────── soap bubble ─────────────────────────
const FILM = ['255,120,220', '120,205,255', '255,246,140', '140,255,200', '190,140,255', '255,150,170', '255,120,220'];

export function drawBubble(ctx: Ctx, r: number, time: number, seed = 0, alpha = 1) {
  if (r < 0.5 || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  const body = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
  body.addColorStop(0, 'rgba(255,255,255,0.03)');
  body.addColorStop(0.68, 'rgba(185,225,255,0.12)');
  body.addColorStop(0.9, 'rgba(255,185,240,0.3)');
  body.addColorStop(1, 'rgba(140,215,255,0.5)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  const lw = Math.max(0.9, r * 0.13);
  if (typeof ctx.createConicGradient === 'function' && r > 3.5) {
    const cg = ctx.createConicGradient(time * 0.8 + seed * 2, 0, 0);
    FILM.forEach((c, i) => cg.addColorStop(i / (FILM.length - 1), `rgba(${c},0.85)`));
    ctx.strokeStyle = cg;
  } else {
    ctx.strokeStyle = 'rgba(200,225,255,0.8)';
  }
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(0, 0, r - lw / 2, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(1, r * 0.14);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.7, Math.PI * 1.08, Math.PI * 1.42);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(-r * 0.38, -r * 0.52, r * 0.09, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,235,255,0.5)';
  ctx.lineWidth = Math.max(0.8, r * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, Math.PI * 0.1, Math.PI * 0.42);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,200,240,0.6)';
  ctx.beginPath();
  ctx.arc(r * 0.42, r * 0.46, r * 0.06, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── banana ─────────────────────────
function bananaGeom(L: number, bend: number, th: number, n = 22) {
  const top: number[] = [];
  const bot: number[] = [];
  const mid: number[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const x = -L / 2 + u * L;
    const k = 2 * u - 1;
    const cy = -bend * (1 - k * k);
    const w = th * (0.28 + 0.72 * Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * u)), 0.6));
    top.push(x, cy - w / 2);
    bot.push(x, cy + w / 2);
    mid.push(x, cy);
  }
  return { top, bot, mid };
}

/** banana lying along +X (stem at left, tip at right), arched upward */
export function drawBanana(ctx: Ctx, L = 40, bend = 5, th = 11) {
  const { top, bot, mid } = bananaGeom(L, bend, th);
  const n = top.length / 2;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]);
    for (let i = 1; i < n; i++) ctx.lineTo(top[i * 2], top[i * 2 + 1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(bot[i * 2], bot[i * 2 + 1]);
    ctx.closePath();
  };
  // stem
  ctx.fillStyle = '#7a5a1c';
  ctx.beginPath();
  ctx.moveTo(-L / 2 + 1, -th * 0.14);
  ctx.lineTo(-L / 2 - th * 0.3, -th * 0.2);
  ctx.lineTo(-L / 2 - th * 0.3, th * 0.2);
  ctx.lineTo(-L / 2 + 1, th * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2a1a06';
  ctx.fillRect(-L / 2 - th * 0.36, -th * 0.2, th * 0.1, th * 0.4);
  path();
  ctx.fillStyle = lin(ctx, 0, -th * 0.8, 0, th * 0.9, [
    [0, '#fff6a0'],
    [0.3, '#ffe12e'],
    [0.7, '#f3b800'],
    [1, '#b87400'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,0,0.85)';
  ctx.lineWidth = Math.max(0.8, th * 0.07);
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.save();
  path();
  ctx.clip();
  ctx.strokeStyle = 'rgba(170,105,0,0.5)';
  ctx.lineWidth = Math.max(0.6, th * 0.06);
  for (const f of [-0.2, 0.17]) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const w = bot[i * 2 + 1] - top[i * 2 + 1];
      const y = mid[i * 2 + 1] + f * w;
      if (i === 0) ctx.moveTo(mid[0], y);
      else ctx.lineTo(mid[i * 2], y);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,240,0.72)';
  ctx.lineWidth = Math.max(0.8, th * 0.1);
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 3; i < n - 3; i++) {
    const w = bot[i * 2 + 1] - top[i * 2 + 1];
    const y = mid[i * 2 + 1] - 0.3 * w;
    if (i === 3) ctx.moveTo(mid[i * 2], y);
    else ctx.lineTo(mid[i * 2], y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(110,60,0,0.55)';
  for (let i = 0; i < 9; i++) {
    const u = 0.14 + i * 0.09;
    const idx = Math.min(n - 1, Math.round(u * (n - 1)));
    const w = bot[idx * 2 + 1] - top[idx * 2 + 1];
    ctx.beginPath();
    ctx.ellipse(mid[idx * 2], mid[idx * 2 + 1] + (i % 3 - 1) * w * 0.22, th * 0.05, th * 0.035, 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // tip
  ctx.fillStyle = lin(ctx, 0, -th * 0.2, 0, th * 0.2, [
    [0, '#6a4416'],
    [1, '#2e1c07'],
  ]);
  ctx.beginPath();
  ctx.ellipse(L / 2 - 0.5, 0, th * 0.2, th * 0.17, 0, 0, TAU);
  ctx.fill();
}

export function drawBananaSlice(ctx: Ctx, r: number) {
  ctx.fillStyle = '#f5c211';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(140,85,0,0.8)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  const g = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r * 0.82);
  g.addColorStop(0, '#fffbe0');
  g.addColorStop(1, '#ffe9a0');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(90,55,10,0.8)';
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.28, Math.sin(a) * r * 0.28, r * 0.07, 0, TAU);
    ctx.fill();
  }
}

// ───────────────────────── iron ball ─────────────────────────
export function drawIronBall(ctx: Ctx, r: number, hot = 0) {
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
  g.addColorStop(0, '#9aa0a8');
  g.addColorStop(0.5, '#3a3c42');
  g.addColorStop(1, '#0d0e11');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.42, r * 0.28, r * 0.14, -0.6, 0, TAU);
  ctx.fill();
  if (hot > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hg = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.05);
    hg.addColorStop(0, 'rgba(255,100,20,0)');
    hg.addColorStop(1, `rgba(255,150,40,${0.75 * hot})`);
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

// ───────────────────────── rifle ammo ─────────────────────────
/** pointed rifle bullet, nose up, centered */
export function drawRifleBullet(ctx: Ctx, L = 16, w = 6) {
  const top = -L / 2;
  const bot = L / 2;
  const sh = top + L * 0.46;
  ctx.beginPath();
  ctx.moveTo(-w / 2, bot);
  ctx.lineTo(-w / 2, sh);
  ctx.bezierCurveTo(-w / 2, top + L * 0.2, -w * 0.15, top + L * 0.04, 0, top);
  ctx.bezierCurveTo(w * 0.15, top + L * 0.04, w / 2, top + L * 0.2, w / 2, sh);
  ctx.lineTo(w / 2, bot);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, BRASS);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#6a737d'],
    [0.4, '#f1f5f8'],
    [1, '#59626c'],
  ]);
  ctx.fillRect(-w / 2, top, w, (sh - top) * 0.92);
  ctx.restore();
  ctx.strokeStyle = 'rgba(90,50,5,0.8)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-w / 2, bot - L * 0.2);
  ctx.lineTo(w / 2, bot - L * 0.2);
  ctx.stroke();
  ctx.fillStyle = '#8a5208';
  ctx.fillRect(-w / 2, bot - 1.2, w, 1.2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(-w * 0.2, top + L * 0.28, w * 0.1, L * 0.45);
}

/** big rifle casing, upright centered */
export function drawRifleCasing(ctx: Ctx) {
  const w = 7.6;
  const h = 26;
  ctx.beginPath();
  ctx.moveTo(-2, -h / 2);
  ctx.lineTo(2, -h / 2);
  ctx.lineTo(2, -h / 2 + 4);
  ctx.lineTo(w / 2, -h / 2 + 9);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.lineTo(-w / 2, -h / 2 + 9);
  ctx.lineTo(-2, -h / 2 + 4);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, BRASS);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,5,0.6)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.fillStyle = '#2b1702';
  ctx.beginPath();
  ctx.ellipse(0, -h / 2, 2, 0.9, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = lin(ctx, -w / 2 - 1, 0, w / 2 + 1, 0, BRASS);
  ctx.fillRect(-w / 2 - 0.9, h / 2 - 2.2, w + 1.8, 2.2);
  ctx.fillStyle = '#a56a14';
  ctx.beginPath();
  ctx.arc(0, h / 2 - 1, 1.6, 0, TAU);
  ctx.fill();
}

// ───────────────────────── fire ─────────────────────────
/** layered flame pointing up (-Y), base at origin. draws additively */
export function drawFlameShape(ctx: Ctx, len: number, wid: number, time: number, seed: number, alpha = 1) {
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

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
export function drawStuckItem2(ctx: Ctx, it: StuckItem, R: number, time: number) {
  switch (it.weapon) {
    case 'snowball': {
      ctx.save();
      ctx.translate(R - 3, 0);
      const lumps: [number, number, number][] = [
        [2, 0, 10],
        [4, -7.5, 6.5],
        [4, 7.5, 6.5],
        [9, -1.5, 6.8],
        [8, 5, 4.5],
        [8, -6.5, 4.2],
      ];
      ctx.fillStyle = 'rgba(70,110,170,0.35)';
      ctx.beginPath();
      ctx.ellipse(3, 0, 6, 13, 0, 0, TAU);
      ctx.fill();
      for (const [x, y, r] of lumps) {
        const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, '#eef6ff');
        g.addColorStop(0.85, '#a9c6ea');
        g.addColorStop(1, '#7d9fd2');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = 'rgba(110,150,205,0.5)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.ellipse(6, -5, 2.6, 1.4, -0.6, 0, TAU);
      ctx.ellipse(9, 3, 1.8, 1, -0.4, 0, TAU);
      ctx.fill();
      const ph = (time * 0.5 + it.seed) % 1;
      if (ph < 0.14) {
        const k = Math.sin((ph / 0.14) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('210,240,255'), 8, -3, 22 * k, k, time);
        ctx.restore();
      }
      ctx.restore();
      break;
    }
    case 'sniper': {
      ctx.save();
      ctx.translate(R - 0.5, 0);
      ctx.rotate(-Math.PI / 2);
      drawRifleBullet(ctx, 16, 6);
      ctx.restore();
      const hot = Math.max(0, 1 - it.t / 1.2);
      if (hot > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,170,60'), R + 5, 0, 40, 0.8 * hot);
        drawSprite(ctx, glowSprite('255,240,200'), R + 6, 0, 14, hot);
        ctx.restore();
      }
      break;
    }
    case 'flame': {
      const up = it.up ?? 0;
      const grow = 1 + 0.9 * Math.max(0, 1 - it.t / 0.9);
      ctx.save();
      ctx.translate(R - 1, 0);
      ctx.rotate(up);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,130,30'), 0, -8, 40 * grow, 0.55 + 0.15 * Math.sin(time * 20 + it.seed));
      ctx.restore();
      const fl: [number, number, number][] = [
        [-6, 24, 12],
        [0, 34, 16],
        [6, 21, 11],
      ];
      fl.forEach(([ox, len, wid], i) => {
        ctx.save();
        ctx.translate(ox, 2);
        drawFlameShape(ctx, len * grow, wid * (0.9 + 0.1 * grow), time, it.seed + i * 2.3);
        ctx.restore();
      });
      ctx.restore();
      break;
    }
    case 'bubble': {
      const beads = it.beads ?? [];
      const up = it.up ?? 0;
      beads.forEach((b, i) => {
        const jig = 1 + 0.16 * Math.sin(it.t * 28 + i) * Math.exp(-it.t * 5) + 0.04 * Math.sin(time * 5 + i * 1.7 + it.seed);
        ctx.save();
        ctx.rotate(b.da);
        ctx.translate(R + b.s * 0.55, 0);
        ctx.rotate(up - b.da);
        ctx.scale(jig, 2 - jig);
        drawBubble(ctx, b.s, time + i, it.seed + i, 1);
        ctx.restore();
      });
      break;
    }
    case 'bamboo': {
      const hot = Math.max(0, 1 - it.t / 3);
      ctx.save();
      ctx.translate(R + 3, 0);
      drawIronBall(ctx, 10.5, hot);
      ctx.restore();
      if (hot > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,120,30'), R + 2, 0, 52 * hot, 0.7 * hot);
        ctx.restore();
      }
      break;
    }
    case 'banana': {
      ctx.save();
      ctx.translate(R + 9, 0);
      ctx.rotate(Math.PI + (it.rotS ?? 0));
      drawBanana(ctx, 34, 6, 12);
      ctx.restore();
      break;
    }
    default:
      drawStuckItem3(ctx, it, R, time);
      break;
  }
}

// ───────────────────────── HUD ammo glyphs ─────────────────────────
const ICON_SNOW = [8, 0, 5.6, 5.5, 0, 8, -5.6, 5.5, -8, 0, -5.6, -5.5, 0, -8, 5.6, -5.5];

/** g is pre-translated to the centre of a 64px icon and scaled 2.2x */
export function drawAmmoGlyph2(g: Ctx, weapon: WeaponId) {
  switch (weapon) {
    case 'snowball':
      drawSnowball(g, ICON_SNOW, 8.5);
      break;
    case 'sniper':
      g.save();
      drawRifleBullet(g, 23, 7.4);
      g.restore();
      break;
    case 'flame':
      g.save();
      g.translate(0, 10);
      drawFlameShape(g, 22, 15, 1.3, 2);
      g.restore();
      g.fillStyle = '#ffb347';
      g.beginPath();
      g.ellipse(0, 9, 4.5, 2.2, 0, 0, TAU);
      g.fill();
      break;
    case 'bubble':
      drawBubble(g, 10, 0.5, 1, 1);
      break;
    case 'bamboo':
      g.save();
      g.translate(0, 2);
      drawIronBall(g, 8.8, 0.4);
      g.restore();
      g.strokeStyle = '#c9a063';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(3, -6);
      g.quadraticCurveTo(7, -11, 4, -13);
      g.stroke();
      g.fillStyle = '#ffd35e';
      g.beginPath();
      g.arc(4, -13, 1.6, 0, TAU);
      g.fill();
      break;
    case 'banana':
      g.save();
      g.rotate(-0.55);
      drawBanana(g, 27, 5, 9.5);
      g.restore();
      break;
    default:
      drawAmmoGlyph3(g, weapon);
      break;
  }
}
