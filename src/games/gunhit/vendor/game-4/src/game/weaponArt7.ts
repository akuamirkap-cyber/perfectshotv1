import { type Ctx, TAU, clamp, drawSprite, easeOutCubic, glowSprite, lin, polyPath, roundRect, starSprite } from './core';
import { RAINBOW } from './shapes5';
import { drawIceCluster } from './shapes6';
import {
  AMETHYST,
  EMERALD,
  RUBY,
  SAPPHIRE,
  drawChargeOrb,
  drawHolyEmblem,
  drawCrystalCluster,
  drawGem,
  drawQuantumOrb,
  drawRainbowStream,
  drawRobotGlove,
  drawShardBolt,
  drawStinger,
  drawTrefoil,
  drawUnicornHorn,
  drawWing,
} from './shapes7';
import type { WeaponAnim, WeaponId } from './weapons';

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
const hg = (ctx: Ctx, x0: number, x1: number, stops: [number, string][]) => lin(ctx, x0, 0, x1, 0, stops);
const STEEL: [number, string][] = [
  [0, '#3a4048'],
  [0.3, '#9aa3ae'],
  [0.5, '#e8edf2'],
  [0.75, '#7a838e'],
  [1, '#2c3238'],
];
const DARK: [number, string][] = [
  [0, '#08090c'],
  [0.3, '#262c34'],
  [0.5, '#4a535e'],
  [0.75, '#1e242c'],
  [1, '#06070a'],
];
const GOLD: [number, string][] = [
  [0, '#6b3a05'],
  [0.25, '#e3a52c'],
  [0.45, '#fff3c4'],
  [0.65, '#f2bf45'],
  [1, '#5e3204'],
];

export function drawWeapon7(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'holy':
      return drawHoly(ctx, a, time);
    case 'unicorn':
      return drawUnicorn(ctx, a, time);
    case 'obliterator':
      return drawObliterator(ctx, a, time);
    case 'coin':
      return drawCoinGun(ctx, a, time);
    case 'saber':
      return drawSaber(ctx, a, time);
    case 'gauntlet':
      return drawGauntlet(ctx, a, time);
    case 'ruby':
      return drawRuby(ctx, a, time);
    case 'emerald':
      return drawEmerald(ctx, a, time);
    case 'sapphire':
      return drawSapphireGun(ctx, a, time);
    case 'crystal':
      return drawCrystalCannon(ctx, a, time);
    case 'beerifle':
      return drawBeeRifle(ctx, a, time);
    case 'charge':
      return drawMegaBuster(ctx, a, time);
    case 'pulse':
      return drawPulseRifle(ctx, a, time);
    case 'cryo':
      return drawCryoBlaster(ctx, a, time);
    case 'hyperdrive':
      return drawHyperdrive(ctx, a, time);
    case 'quantum':
      return drawQuantum(ctx, a, time);
    case 'wars':
      return drawWars(ctx, a, time);
    default:
      return;
  }
}

// ───────────────────────── HOLY LIGHT GUN ─────────────────────────
function drawHoly(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const flap = 0.12 + 0.07 * Math.sin(time * 2.6) + hot * 0.55;
  ctx.save();
  ctx.scale(0.92, 0.92);
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 15, 96);
    ctx.scale(s, 1);
    drawWing(ctx, 82, flap);
    ctx.restore();
  }
  roundRect(ctx, -16, 20, 32, 270, 9);
  ctx.fillStyle = hg(ctx, -16, 16, [
    [0, '#9a7a30'],
    [0.25, '#f0e0a8'],
    [0.5, '#ffffff'],
    [0.75, '#e8d08c'],
    [1, '#7a5a1a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,80,20,0.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  for (const y of [44, 112, 180, 248]) {
    roundRect(ctx, -19, y, 38, 9, 3);
    ctx.fillStyle = hg(ctx, -19, 19, GOLD);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,0,0.9)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, 78);
  drawHolyEmblem(ctx, 11);
  ctx.restore();
  ctx.save();
  ctx.translate(0, 146);
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 12, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, 0, -12, 0, 12, [
    [0, '#fff6d0'],
    [0.5, '#ffd0e8'],
    [1, '#f09ac8'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#c89a2a';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,220,150'), 0, 0, 44 + hot * 40, 0.5 + hot * 0.3);
  ctx.restore();
  polyPath(ctx, [-10, 22, -15, 2, 15, 2, 10, 22]);
  ctx.fillStyle = hg(ctx, -15, 15, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.stroke();
  const bob = Math.sin(time * 2) * 1.6;
  ctx.save();
  ctx.translate(0, -17 + bob);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(255,225,140,${0.35 + hot * 0.4})`;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 7, 0, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = '#f6c040';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.strokeStyle = '#fffbe8';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,225,140'), 0, -8, 70 + hot * 110, 0.3 + hot * 0.5);
  ctx.restore();
  if (Math.sin(time * 1.7) > 0.93) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,245,200'), 22, 40, 18, 0.8, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── RAINBOW UNICORN ─────────────────────────
function drawUnicorn(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const bob = Math.sin(time * 2.4) * 1.4;
  ctx.save();
  ctx.scale(0.9, 0.9);
  ctx.save();
  ctx.translate(0, 84);
  drawRainbowStream(ctx, 250, 88, time, false);
  ctx.restore();
  roundRect(ctx, -25, 100, 50, 200, 24);
  ctx.fillStyle = hg(ctx, -25, 25, [
    [0, '#d8c8e8'],
    [0.3, '#ffffff'],
    [0.6, '#fff0f8'],
    [1, '#e0b8d8'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,120,190,0.75)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,170,215,0.4)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-9 + (i % 2) * 18, 134 + i * 20, 3.2, 0, TAU);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(0, bob);
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 11, 62, s * 22, 38, s * 27, 70]);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(190,120,190,0.8)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    polyPath(ctx, [s * 14, 62, s * 21, 46, s * 24, 66]);
    ctx.fillStyle = '#ffb3d8';
    ctx.fill();
  }
  ctx.lineCap = 'round';
  for (const s of [-1, 1])
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = `rgb(${RAINBOW[i]})`;
      ctx.lineWidth = 4.4;
      ctx.beginPath();
      ctx.moveTo(s * 20, 54 + i * 1.2);
      ctx.bezierCurveTo(s * (38 + i * 3.4 + Math.sin(time * 3 + i) * 3), 70, s * (30 + i * 4), 100, s * (42 + i * 3.6 + Math.sin(time * 2.4 + i) * 3), 148);
      ctx.stroke();
    }
  ctx.beginPath();
  ctx.arc(0, 86, 33, 0, TAU);
  ctx.fillStyle = hg(ctx, -33, 33, [
    [0, '#e0d0ee'],
    [0.35, '#ffffff'],
    [0.7, '#fff2fa'],
    [1, '#e8c0e0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,120,190,0.8)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  ctx.translate(0, -2);
  drawUnicornHorn(ctx, 56, 14, time);
  ctx.restore();
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#1a1226';
    ctx.beginPath();
    ctx.ellipse(s * 13, 86, 6.4, 8.6, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s * 13 - 1.8, 82.4, 2.6, 0, TAU);
    ctx.arc(s * 13 + 2, 90, 1.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,130,180,0.55)';
    ctx.beginPath();
    ctx.ellipse(s * 23, 98, 5.4, 3.2, 0, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = '#b8508c';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 97, 5.4, 0.25, Math.PI - 0.25);
  ctx.stroke();
  ctx.fillStyle = '#e898c0';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * 3.2, 94, 1.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,190,240'), 0, -6, 60 + hot * 110, 0.25 + hot * 0.55);
  const ph = (time * 0.7) % 1;
  if (ph < 0.25) {
    const k = Math.sin((ph / 0.25) * Math.PI);
    drawSprite(ctx, starSprite(RAINBOW[Math.floor(time * 3) % 7]), 0, 14 + ph * 80, 22 * k, k, time);
  }
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── OBLITERATOR 9000 ─────────────────────────
function drawObliterator(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const en = clamp(0.5 + 0.2 * Math.sin(time * 3.4) + ch * 0.9 + hot * 0.7, 0, 1.6);
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -22, 4, 44, 300, 7);
  ctx.fillStyle = hg(ctx, -22, 22, [
    [0, '#0a0e0c'],
    [0.3, '#2c3a34'],
    [0.5, '#4e6258'],
    [0.75, '#222e28'],
    [1, '#080c0a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -22, 4, 44, 300, 7);
  ctx.clip();
  for (const [y0, h] of [
    [20, 16],
    [200, 16],
    [262, 16],
  ]) {
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(-24, y0, 48, h);
    ctx.fillStyle = '#121208';
    for (let x = -34; x < 34; x += 14) {
      polyPath(ctx, [x, y0 + h, x + 7, y0 + h, x + 17, y0, x + 10, y0]);
      ctx.fill();
    }
  }
  ctx.restore();
  roundRect(ctx, -15, 50, 30, 140, 12);
  ctx.fillStyle = '#04160a';
  ctx.fill();
  ctx.save();
  roundRect(ctx, -15, 50, 30, 140, 12);
  ctx.clip();
  const lvl = 62 + Math.sin(time * 3) * 1.6;
  ctx.beginPath();
  ctx.moveTo(-17, lvl);
  for (let x = -17; x <= 17; x += 3) ctx.lineTo(x, lvl + Math.sin(x * 0.4 + time * 4) * 1.6);
  ctx.lineTo(17, 192);
  ctx.lineTo(-17, 192);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, lvl, 0, 192, [
    [0, `rgba(190,255,120,${clamp(0.8 + 0.2 * en, 0, 1)})`],
    [1, 'rgba(40,160,30,0.96)'],
  ]);
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const ph = (time * (0.3 + i * 0.05) + i * 0.29) % 1;
    ctx.fillStyle = 'rgba(220,255,180,0.7)';
    ctx.beginPath();
    ctx.arc(-6 + ((i * 7) % 14), 188 - ph * (188 - lvl), 1.4 + (i % 2) * 1.2, 0, TAU);
    ctx.fill();
  }
  drawSprite(ctx, glowSprite('110,255,80'), 0, 120, 120, clamp(0.4 * en, 0, 0.9));
  ctx.restore();
  ctx.strokeStyle = 'rgba(210,255,170,0.9)';
  ctx.lineWidth = 1.8;
  roundRect(ctx, -15, 50, 30, 140, 12);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  roundRect(ctx, -11, 56, 4, 120, 2);
  ctx.fill();
  ctx.save();
  ctx.translate(0, 232);
  ctx.rotate(time * 0.6);
  drawTrefoil(ctx, 13, '#ffe23a', '#16140a');
  ctx.restore();
  polyPath(ctx, [-20, 20, -14, -14, 14, -14, 20, 20]);
  ctx.fillStyle = hg(ctx, -20, 20, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -14, 14, 5, 0, 0, TAU);
  ctx.fillStyle = '#041208';
  ctx.fill();
  ctx.strokeStyle = `rgba(120,255,90,${clamp(0.6 + 0.4 * en, 0, 1)})`;
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('110,255,80'), 0, -14, 50 + ch * 70 + hot * 110, clamp(0.4 + 0.3 * en, 0, 1));
  drawSprite(ctx, glowSprite('230,255,200'), 0, -14, 20 + ch * 30 + hot * 40, 0.6 * clamp(en, 0, 1));
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── COIN GUN ─────────────────────────
function drawCoinGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const show = clamp((a.fireT - 0.1) / 0.25, 0, 1);
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -15, 30, 30, 280, 8);
  ctx.fillStyle = hg(ctx, -15, 15, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  for (let y = 40; y < 300; y += 11) {
    ctx.strokeStyle = 'rgba(90,50,0,0.55)';
    ctx.lineWidth = 1;
    line(ctx, -15, y, 15, y);
    ctx.strokeStyle = 'rgba(255,245,190,0.5)';
    line(ctx, -15, y + 1.4, 15, y + 1.4);
  }
  ctx.fillStyle = '#2a1604';
  roundRect(ctx, -9, 96, 18, 40, 5);
  ctx.fill();
  ctx.save();
  roundRect(ctx, -9, 96, 18, 40, 5);
  ctx.clip();
  for (let i = 0; i < 4; i++) {
    const cy = 100 + i * 10 + ((time * 14) % 10);
    ctx.fillStyle = hg(ctx, -9, 9, GOLD);
    ctx.fillRect(-8, cy, 16, 7);
  }
  ctx.restore();
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 14, 40, s * 34, 18, s * 38, 24, s * 20, 52]);
    ctx.fillStyle = hg(ctx, s > 0 ? 14 : -38, s > 0 ? 38 : -14, GOLD);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,0,0.9)';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, 8);
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 7.4, 0, 0, TAU);
  ctx.strokeStyle = '#7a4a08';
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.strokeStyle = '#f6c040';
  ctx.lineWidth = 4.2;
  ctx.stroke();
  ctx.strokeStyle = '#fff3c4';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(0, -12 - (1 - show) * 10);
  ctx.scale(show, show);
  const f = Math.abs(Math.cos(time * 5));
  ctx.scale(0.2 + 0.8 * f, 1);
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, TAU);
  const cg = ctx.createRadialGradient(-4, -4, 1, 0, 0, 14);
  cg.addColorStop(0, '#fff3b0');
  cg.addColorStop(0.5, '#f2b81a');
  cg.addColorStop(1, '#a86a06');
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.strokeStyle = '#7a4a00';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,210,90'), 0, -8, 56 + hot * 100, 0.3 + hot * 0.55);
  if (Math.sin(time * 2.2) > 0.9) drawSprite(ctx, starSprite('255,240,170'), 8, -18, 18, 0.9, 0);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── PHOTON SABER ─────────────────────────
function drawSaber(ctx: Ctx, a: WeaponAnim, time: number) {
  const side = a.saberSide ?? 1;
  const swing = a.fireT < 0.22 ? side * -0.85 * Math.pow(1 - a.fireT / 0.22, 2) : 0;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const fl = 0.9 + 0.1 * Math.sin(time * 38);
  const bladeAt = (ang: number, alpha: number) => {
    ctx.save();
    ctx.translate(0, 100);
    ctx.rotate(ang);
    ctx.translate(0, -100);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const top = -128 * fl;
    for (const [w, c] of [
      [34, `rgba(40,170,255,${0.16 * alpha})`],
      [20, `rgba(70,200,255,${0.32 * alpha})`],
      [11, `rgba(130,235,255,${0.95 * alpha})`],
      [4.4, `rgba(255,255,255,${alpha})`],
    ] as [number, string][]) {
      ctx.strokeStyle = c;
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(0, 46);
      ctx.lineTo(0, top);
      ctx.stroke();
    }
    ctx.restore();
  };
  ctx.save();
  ctx.scale(0.92, 0.92);
  if (swing !== 0) for (let k = 4; k >= 1; k--) bladeAt(swing - side * k * 0.1, 0.14 * (5 - k));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(0, 100);
  ctx.rotate(swing);
  ctx.translate(0, -100);
  drawSprite(ctx, glowSprite('80,200,255'), 0, -40, 220 + hot * 60, 0.35 + hot * 0.2);
  ctx.restore();
  bladeAt(swing, 1);
  ctx.save();
  ctx.translate(0, 100);
  ctx.rotate(swing);
  ctx.translate(0, -100);
  roundRect(ctx, -11, 40, 22, 16, 4);
  ctx.fillStyle = hg(ctx, -11, 11, STEEL);
  ctx.fill();
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  roundRect(ctx, -9, 54, 18, 112, 6);
  ctx.fillStyle = hg(ctx, -9, 9, DARK);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = hg(ctx, -10, 10, STEEL);
  for (const y of [62, 84, 106, 128, 150]) {
    roundRect(ctx, -10, y, 20, 7, 2);
    ctx.fill();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(90,210,255,${0.5 + 0.3 * Math.sin(time * 4)})`;
  ctx.fillRect(-2, 70, 4, 6);
  ctx.restore();
  roundRect(ctx, -12, 164, 24, 14, 6);
  ctx.fillStyle = hg(ctx, -12, 12, STEEL);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── GAUNTLET CANNON ─────────────────────────
function drawGauntlet(ctx: Ctx, a: WeaponAnim, time: number) {
  let gy = 0;
  let vis = true;
  if (a.fireT < 0.22) vis = false;
  else if (a.fireT < 0.62) gy = (1 - easeOutCubic((a.fireT - 0.22) / 0.4)) * 76;
  const ready = a.fireT >= 0.62 ? 1 : 0;
  const pistonExt = a.fireT < 0.22 ? 20 * (1 - a.fireT / 0.22) : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  if (vis) {
    ctx.save();
    ctx.translate(0, gy);
    drawRobotGlove(ctx, 1.05, time, 0.4 + 0.5 * ready);
    ctx.restore();
  }
  ctx.save();
  roundRect(ctx, -30, 48, 60, 12, 5);
  ctx.fillStyle = hg(ctx, -30, 30, STEEL);
  ctx.fill();
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  roundRect(ctx, -27, 58, 54, 230, 8);
  ctx.fillStyle = hg(ctx, -27, 27, [
    [0, '#1c2026'],
    [0.3, '#4a525c'],
    [0.5, '#8a929c'],
    [0.75, '#3a424c'],
    [1, '#14181e'],
  ]);
  ctx.fill();
  ctx.stroke();
  for (const y of [86, 142, 198]) {
    roundRect(ctx, -29, y, 58, 8, 3);
    ctx.fillStyle = hg(ctx, -29, 29, STEEL);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,150,40,${0.45 + 0.35 * Math.sin(time * 4 + y)})`;
    ctx.fillRect(-24, y + 2.6, 48, 2.8);
    ctx.restore();
  }
  for (const s of [-1, 1]) {
    ctx.fillStyle = hg(ctx, s * 18 - 4, s * 18 + 4, STEEL);
    ctx.fillRect(s * 18 - 4, 60 - pistonExt, 8, 26 + pistonExt);
    ctx.strokeStyle = '#161a20';
    ctx.lineWidth = 1;
    ctx.strokeRect(s * 18 - 4, 60 - pistonExt, 8, 26 + pistonExt);
  }
  ctx.fillStyle = '#ffb347';
  for (const [x, y] of [
    [-20, 70],
    [20, 70],
    [-20, 228],
    [20, 228],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  drawSprite(ctx, glowSprite('255,150,50'), 0, 54, 90 + hot * 120, 0.2 + hot * 0.6);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── RUBY REVOLVER ─────────────────────────
function drawRuby(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  roundRect(ctx, -9, 0, 18, 130, 3);
  ctx.fillStyle = hg(ctx, -9, 9, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(150,40,40,0.6)';
  ctx.lineWidth = 1;
  for (let y = 10; y < 124; y += 8) {
    ctx.beginPath();
    ctx.moveTo(-9, y);
    ctx.quadraticCurveTo(0, y + 4, 9, y);
    ctx.stroke();
  }
  polyPath(ctx, [-3, -2, 3, -2, 5, 10, -5, 10]);
  ctx.fillStyle = hg(ctx, -5, 5, GOLD);
  ctx.fill();
  ctx.stroke();
  for (const y of [34, 62, 90]) {
    ctx.save();
    ctx.translate(0, y);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(RUBY.rgb), 0, 0, 18 + hot * 12, 0.4 + hot * 0.4);
    ctx.restore();
    drawGem(ctx, 5.4, RUBY, time + y);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 6.4, 2.4, 0, 0, TAU);
  ctx.fillStyle = '#080406';
  ctx.fill();
  roundRect(ctx, -14, 64, 28, 66, 4);
  ctx.fillStyle = hg(ctx, -14, 14, GOLD);
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -24, 118, 48, 66, 8);
  ctx.fillStyle = hg(ctx, -24, 24, [
    [0, '#5a0a14'],
    [0.28, '#c4283c'],
    [0.5, '#ff7a8c'],
    [0.75, '#a01c2e'],
    [1, '#46060e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#2a0408';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -24, 118, 48, 66, 8);
  ctx.clip();
  for (let i = -1; i < 6; i++) {
    const x = ((i * 11 + a.spin * 11) % 66) - 18;
    ctx.fillStyle = 'rgba(30,2,6,0.45)';
    ctx.fillRect(x - 1.4, 118, 2.8, 66);
    ctx.fillStyle = 'rgba(255,240,200,0.3)';
    ctx.fillRect(x + 1.5, 118, 1.4, 66);
  }
  ctx.restore();
  for (const y of [124, 178]) {
    roundRect(ctx, -26, y - 4, 52, 8, 3);
    ctx.fillStyle = hg(ctx, -26, 26, GOLD);
    ctx.fill();
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, 151);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite(RUBY.rgb), 0, 0, 46 + hot * 40, 0.5 + hot * 0.3);
  ctx.restore();
  drawGem(ctx, 11, RUBY, time);
  ctx.restore();
  polyPath(ctx, [-18, 184, 18, 184, 22, 250, -22, 250]);
  ctx.fillStyle = hg(ctx, -22, 22, GOLD);
  ctx.fill();
  ctx.stroke();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,90,110'), 0, 2, 70 * hot + 14, 0.8 * hot);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── EMERALD LASER ─────────────────────────
function drawEmerald(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const en = clamp(0.5 + 0.2 * Math.sin(time * 3.2) + ch * 0.9 + hot * 0.7, 0, 1.6);
  ctx.save();
  ctx.scale(0.95, 0.95);
  roundRect(ctx, -15, 30, 30, 280, 9);
  ctx.fillStyle = hg(ctx, -15, 15, [
    [0, '#9aa8a4'],
    [0.3, '#f4faf8'],
    [0.55, '#ffffff'],
    [0.8, '#c4d4ce'],
    [1, '#7a8c86'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#4a5c56';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(60,255,150,${clamp(0.5 + 0.3 * en, 0, 1)})`;
  roundRect(ctx, -3, 52, 6, 150, 3);
  ctx.fill();
  drawSprite(ctx, glowSprite('60,255,150'), 0, 128, 90, clamp(0.3 * en, 0, 0.7));
  ctx.restore();
  for (const y of [60, 120, 180]) {
    roundRect(ctx, -18, y, 36, 9, 3);
    ctx.fillStyle = hg(ctx, -18, 18, [
      [0, '#0a5a30'],
      [0.45, '#3ee890'],
      [1, '#08482a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#04301a';
    ctx.stroke();
  }
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 10, 36, s * 24, 6, s * 20, -2, s * 6, 28]);
    ctx.fillStyle = hg(ctx, s > 0 ? 6 : -24, s > 0 ? 24 : -6, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#2a3632';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, -12 + Math.sin(time * 2.4) * 2);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('60,255,150'), 0, 0, 70 + ch * 70 + hot * 110, clamp(0.4 + 0.3 * en, 0, 1));
  ctx.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const an = time * 1.4 + (k * TAU) / 6;
    ctx.strokeStyle = `rgba(200,255,225,${0.3 + 0.4 * ch + 0.3 * hot})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(an) * 20, Math.sin(an) * 20);
    ctx.lineTo(Math.cos(an) * (30 + ch * 22 + hot * 18), Math.sin(an) * (30 + ch * 22 + hot * 18));
    ctx.stroke();
  }
  ctx.restore();
  const sc = 1 + ch * 0.35 + hot * 0.2;
  ctx.scale(sc, sc);
  drawGem(ctx, 17, EMERALD, time);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── SAPPHIRE SHOTGUN ─────────────────────────
function drawSapphireGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const pump = a.fireT > 0.17 && a.fireT < 0.4 ? Math.sin(((a.fireT - 0.17) / 0.23) * Math.PI) * 16 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  const BLUE: [number, string][] = [
    [0, '#06143a'],
    [0.28, '#1e4ab0'],
    [0.5, '#7ab0ff'],
    [0.75, '#16388a'],
    [1, '#050f2c'],
  ];
  for (const x of [-10.5, 10.5]) {
    roundRect(ctx, x - 8.5, 0, 17, 160, 3);
    ctx.fillStyle = hg(ctx, x - 8.5, x + 8.5, BLUE);
    ctx.fill();
    ctx.strokeStyle = '#030a1e';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,200,90,0.7)';
    ctx.lineWidth = 1;
    for (let y = 8; y < 150; y += 12) {
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.quadraticCurveTo(x, y + 4, x + 8, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(x, 0, 7, 2.4, 0, 0, TAU);
    ctx.fillStyle = '#04060c';
    ctx.fill();
    if (hot > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite(SAPPHIRE.rgb), x, 0, 36 * hot + 8, 0.9 * hot);
      ctx.restore();
    }
  }
  roundRect(ctx, -3, 6, 6, 150, 2);
  ctx.fillStyle = hg(ctx, -3, 3, GOLD);
  ctx.fill();
  for (const y of [40, 92, 142]) {
    ctx.save();
    ctx.translate(0, y);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(SAPPHIRE.rgb), 0, 0, 22 + hot * 14, 0.4 + hot * 0.4);
    ctx.restore();
    drawGem(ctx, 6, SAPPHIRE, time + y);
    ctx.restore();
  }
  ctx.save();
  ctx.translate(0, pump);
  roundRect(ctx, -25, 74, 50, 40, 10);
  ctx.fillStyle = hg(ctx, -25, 25, [
    [0, '#14102a'],
    [0.3, '#3a2c78'],
    [0.5, '#6a58b8'],
    [0.75, '#2c2262'],
    [1, '#0e0a22'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#06041a';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(240,200,90,0.8)';
  ctx.lineWidth = 1.2;
  for (let x = -18; x <= 18; x += 6) line(ctx, x, 80, x, 108);
  ctx.restore();
  roundRect(ctx, -27, 158, 54, 70, 10);
  ctx.fillStyle = hg(ctx, -27, 27, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.save();
  ctx.translate(0, 192);
  drawGem(ctx, 13, SAPPHIRE, time);
  ctx.restore();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,170,255'), 0, 0, 110 * hot + 20, 0.7 * hot);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── CRYSTAL CANNON ─────────────────────────
function drawCrystalCannon(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const show = clamp((a.fireT - 0.15) / 0.35, 0, 1);
  const en = clamp(0.55 + 0.25 * Math.sin(time * 3) + hot * 0.8, 0, 1.5);
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -23, 8, 46, 290, 9);
  ctx.fillStyle = hg(ctx, -23, 23, [
    [0, '#120a22'],
    [0.3, '#3a2864'],
    [0.5, '#6a4eaa'],
    [0.75, '#2c1c52'],
    [1, '#0c0618'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#08040e';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(200,120,255,${clamp(0.5 + 0.3 * en, 0, 1)})`;
  roundRect(ctx, -3.5, 60, 7, 160, 3);
  ctx.fill();
  drawSprite(ctx, glowSprite('190,110,255'), 0, 140, 110, clamp(0.35 * en, 0, 0.8));
  ctx.restore();
  for (const y of [40, 100, 170, 240]) {
    roundRect(ctx, -26, y, 52, 10, 3);
    ctx.fillStyle = hg(ctx, -26, 26, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#1a1626';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(230,190,255,0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(-13 + (i % 2) * 26, 126 + i * 16);
    ctx.rotate(i * 0.7);
    ctx.strokeRect(-3, -3, 6, 6);
    ctx.restore();
  }
  for (const [x, y, rot, sc] of [
    [-30, 30, -0.45, 0.8],
    [30, 36, 0.45, 0.85],
    [-34, 90, -0.7, 0.62],
    [34, 100, 0.7, 0.66],
  ] as [number, number, number, number][]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    drawCrystalCluster(ctx, sc, AMETHYST, time + x);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.ellipse(0, 8, 24, 8, 0, 0, TAU);
  ctx.fillStyle = '#080410';
  ctx.fill();
  ctx.strokeStyle = '#a070e0';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.save();
  ctx.translate(0, -2 - (1 - show) * 14);
  ctx.scale(show, show);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('190,110,255'), 0, -6, 70 + hot * 90, 0.6);
  ctx.restore();
  ctx.translate(0, -8);
  ctx.rotate(Math.sin(time * 1.6) * 0.08);
  drawShardBolt(ctx, 40, 18, AMETHYST);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── BEE RIFLE ─────────────────────────
function drawBeeRifle(ctx: Ctx, a: WeaponAnim, time: number) {
  const ld = clamp((a.fireT - 0.2) / 0.4, 0, 1);
  const hot = a.fireT < 0.4 ? 1 - a.fireT / 0.4 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  ctx.save();
  ctx.translate(0, -34 + (1 - ld) * 42);
  ctx.globalAlpha = ld;
  drawStinger(ctx, 42);
  ctx.restore();
  roundRect(ctx, -7.5, 4, 15, 170, 3);
  ctx.fillStyle = '#ffd23a';
  ctx.fill();
  ctx.save();
  roundRect(ctx, -7.5, 4, 15, 170, 3);
  ctx.clip();
  ctx.fillStyle = '#1a1208';
  for (let y = 8; y < 176; y += 16) ctx.fillRect(-9, y, 18, 8);
  ctx.fillStyle = hg(ctx, -8, 8, [
    [0, 'rgba(0,0,0,0.45)'],
    [0.4, 'rgba(255,255,255,0.4)'],
    [1, 'rgba(0,0,0,0.5)'],
  ]);
  ctx.fillRect(-9, 4, 18, 170);
  ctx.restore();
  ctx.strokeStyle = '#3a2a08';
  ctx.lineWidth = 1.2;
  roundRect(ctx, -7.5, 4, 15, 170, 3);
  ctx.stroke();
  ctx.fillStyle = '#0a0806';
  roundRect(ctx, -10, 2, 20, 8, 3);
  ctx.fill();
  roundRect(ctx, -16, 62, 32, 76, 7);
  ctx.fillStyle = hg(ctx, -16, 16, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,40,0.85)';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 2; c++) {
      ctx.save();
      ctx.translate(-6 + c * 12 + (r % 2) * 0, 74 + r * 12);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const an = (i * TAU) / 6 + Math.PI / 6;
        const px = Math.cos(an) * 5;
        const py = Math.sin(an) * 5;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  roundRect(ctx, -20, 134, 40, 80, 9);
  ctx.fillStyle = '#ffd23a';
  ctx.fill();
  ctx.save();
  roundRect(ctx, -20, 134, 40, 80, 9);
  ctx.clip();
  ctx.fillStyle = '#1a1208';
  for (let y = 138; y < 214; y += 18) ctx.fillRect(-22, y, 44, 9);
  ctx.restore();
  ctx.strokeStyle = '#3a2a08';
  ctx.stroke();
  ctx.fillStyle = '#2a2018';
  roundRect(ctx, -11, 30, 22, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#7ad8ff';
  ctx.beginPath();
  ctx.arc(0, 41, 6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(-2, 39, 2, 0, TAU);
  ctx.fill();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,210,70'), 0, -10, 90 * hot + 14, 0.7 * hot);
    ctx.restore();
  }
  if (Math.sin(time * 2) > 0.94) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,240,160'), 4, -30, 18, 0.8, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── CHARGE BLASTER (Mega Buster) ─────────────────────────
function drawMegaBuster(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.3 ? 1 - a.fireT / 0.3 : 0;
  const en = clamp(0.55 + 0.25 * Math.sin(time * 4) + ch * 0.9 + hot * 0.6, 0, 1.6);
  const BLUE: [number, string][] = [
    [0, '#06246e'],
    [0.28, '#1e72e0'],
    [0.5, '#7cc8ff'],
    [0.75, '#165ac0'],
    [1, '#041c58'],
  ];
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -34, 84, 68, 230, 14);
  ctx.fillStyle = hg(ctx, -34, 34, BLUE);
  ctx.fill();
  ctx.strokeStyle = '#031244';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(3,18,68,0.7)';
  ctx.lineWidth = 1.2;
  for (const y of [130, 190, 250]) line(ctx, -33, y, 33, y);
  ctx.fillStyle = 'rgba(200,236,255,0.3)';
  roundRect(ctx, -26, 92, 6, 214, 3);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(90,220,255,${clamp(0.5 + 0.3 * en, 0, 1)})`;
  roundRect(ctx, -3, 100, 6, 40, 3);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffd23a';
  ctx.beginPath();
  ctx.arc(20, 116, 4.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#7a5a00';
  ctx.lineWidth = 1;
  ctx.stroke();
  roundRect(ctx, -30, 70, 60, 20, 8);
  ctx.fillStyle = hg(ctx, -30, 30, [
    [0, '#2a64c0'],
    [0.4, '#c8ecff'],
    [1, '#1e50a0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#031244';
  ctx.stroke();
  ctx.fillStyle = '#ffd23a';
  ctx.fillRect(-30, 78, 60, 3);
  roundRect(ctx, -25, -6, 50, 82, 12);
  ctx.fillStyle = hg(ctx, -25, 25, BLUE);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(200,236,255,0.35)';
  roundRect(ctx, -18, 4, 5, 64, 2.5);
  ctx.fill();
  ctx.fillStyle = '#031244';
  for (const y of [34, 44, 54]) {
    roundRect(ctx, 8, y, 12, 4, 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(0, -6, 25, 9.4, 0, 0, TAU);
  ctx.fillStyle = hg(ctx, -25, 25, [
    [0, '#3a82e8'],
    [0.5, '#d0f0ff'],
    [1, '#2c68c4'],
  ]);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -6, 17.5, 6.2, 0, 0, TAU);
  const lg = ctx.createRadialGradient(0, -6, 1, 0, -6, 17);
  lg.addColorStop(0, `rgba(230,252,255,${0.7 + 0.3 * en})`);
  lg.addColorStop(0.5, `rgba(60,190,255,${0.8 + 0.2 * en})`);
  lg.addColorStop(1, 'rgba(4,30,90,0.95)');
  ctx.fillStyle = lg;
  ctx.fill();
  if (ch > 0.03) {
    drawChargeOrb(ctx, 0, -12, 5 + ch * 20, time, clamp(0.5 + ch, 0, 1));
  } else {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('80,200,255'), 0, -8, 50 + hot * 90, 0.35 + hot * 0.5);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── PULSE RIFLE ─────────────────────────
function drawPulseRifle(ctx: Ctx, a: WeaponAnim, time: number) {
  const ph = a.fireT < 0.4 ? a.fireT / 0.4 : -1;
  const hot = a.fireT < 0.4 ? 1 - a.fireT / 0.4 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  roundRect(ctx, -9, 0, 18, 140, 3);
  ctx.fillStyle = hg(ctx, -9, 9, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const y = 8 + i * 14;
    const lit = ph >= 0 ? clamp(1 - Math.abs((1 - ph) * 5 - i), 0, 1) : 0.25 + 0.15 * Math.sin(time * 3 + i);
    roundRect(ctx, -13, y, 26, 7, 3);
    ctx.fillStyle = hg(ctx, -13, 13, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#161a20';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(90,220,255,${clamp(0.4 + lit, 0, 1)})`;
    ctx.fillRect(-11, y + 2.4, 22, 2.2);
    drawSprite(ctx, glowSprite('70,215,255'), 0, y + 3.5, 46, clamp(lit * 0.5, 0, 0.8));
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(100,225,255,0.85)';
  ctx.lineWidth = 1.6;
  line(ctx, -3, 90, -3, 134);
  line(ctx, 3, 90, 3, 134);
  ctx.restore();
  polyPath(ctx, [-26, 124, 26, 124, 32, 176, 22, 236, -22, 236, -32, 176]);
  ctx.fillStyle = hg(ctx, -32, 32, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(80,220,255,${0.6 + 0.3 * Math.sin(time * 4)})`;
  ctx.lineWidth = 2;
  for (const y of [140, 156, 172]) line(ctx, -22, y, 22, y);
  drawSprite(ctx, glowSprite('70,215,255'), 0, 156, 90, 0.2 + hot * 0.3);
  ctx.restore();
  ctx.fillStyle = '#161c24';
  roundRect(ctx, 14, 140, 18, 56, 5);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 2.2, 0, 0, TAU);
  ctx.fillStyle = '#04080c';
  ctx.fill();
  if (ph >= 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(160,240,255,${0.9 * (1 - ph)})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(0, -ph * 40, 12 + ph * 24, 3 + ph * 6, 0, 0, TAU);
    ctx.stroke();
    drawSprite(ctx, glowSprite('120,230,255'), 0, -4, 70 * hot + 14, 0.8 * hot);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── CRYO BLASTER ─────────────────────────
function drawCryoBlaster(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  roundRect(ctx, -30, 52, 60, 150, 16);
  ctx.fillStyle = hg(ctx, -30, 30, [
    [0, '#8aa4c8'],
    [0.3, '#f2f8ff'],
    [0.55, '#ffffff'],
    [0.8, '#c4d8f0'],
    [1, '#7090b8'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#3a5a88';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#3a8ae8';
  roundRect(ctx, -30, 120, 60, 12, 5);
  ctx.fill();
  roundRect(ctx, 18, 76, 36, 100, 14);
  ctx.fillStyle = 'rgba(150,220,255,0.28)';
  ctx.fill();
  ctx.save();
  roundRect(ctx, 18, 76, 36, 100, 14);
  ctx.clip();
  const lvl = 100 + Math.sin(time * 3) * 1.5;
  ctx.beginPath();
  ctx.moveTo(14, lvl);
  for (let x = 14; x <= 58; x += 3) ctx.lineTo(x, lvl + Math.sin(x * 0.4 + time * 4) * 1.6);
  ctx.lineTo(58, 180);
  ctx.lineTo(14, 180);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, lvl, 0, 178, [
    [0, 'rgba(170,236,255,0.95)'],
    [1, 'rgba(40,150,230,0.97)'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.translate(36, 138);
    ctx.rotate(time * (i ? -0.8 : 0.9) + i);
    ctx.scale(0.4 - i * 0.08, 0.4 - i * 0.08);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((k * TAU) / 6) * 16, Math.sin((k * TAU) / 6) * 16);
    }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(220,245,255,0.9)';
  ctx.lineWidth = 1.8;
  roundRect(ctx, 18, 76, 36, 100, 14);
  ctx.stroke();
  roundRect(ctx, -13, 4, 26, 52, 7);
  ctx.fillStyle = hg(ctx, -13, 13, [
    [0, '#2a66b8'],
    [0.4, '#cfe8ff'],
    [1, '#245ca8'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#123a78';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 4, 13, 4.6, 0, 0, TAU);
  ctx.fillStyle = '#082448';
  ctx.fill();
  ctx.strokeStyle = '#c4ecff';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.save();
  ctx.translate(0, 8);
  drawIceCluster(ctx, 0.55 + hot * 0.15, time);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const p = (time * 0.6 + i / 3) % 1;
    drawSprite(ctx, glowSprite('190,238,255'), Math.sin(time * 2 + i * 2) * 10, -4 - p * 26, 22 * (1 - p) + 8, 0.35 * (1 - p));
  }
  drawSprite(ctx, glowSprite('130,225,255'), 0, -4, 70 + hot * 110, 0.2 + hot * 0.55);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── HYPERDRIVE CANNON ─────────────────────────
function drawHyperdrive(ctx: Ctx, a: WeaponAnim, time: number) {
  const ph = a.fireT < 0.4 ? a.fireT / 0.4 : -1;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  ctx.save();
  ctx.scale(0.93, 0.93);
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 14, 78, s * 64, 138, s * 64, 184, s * 14, 160]);
    ctx.fillStyle = hg(ctx, s > 0 ? 14 : -64, s > 0 ? 64 : -14, [
      [0, '#1a4ab0'],
      [0.5, '#5aa0ff'],
      [1, '#103a90'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#08246a';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(190,225,255,${0.5 + 0.4 * hot})`;
    ctx.lineWidth = 2;
    line(ctx, s * 24, 110, s * 56, 146);
    ctx.restore();
  }
  roundRect(ctx, -15, 0, 30, 230, 9);
  ctx.fillStyle = hg(ctx, -15, 15, [
    [0, '#8aa0c4'],
    [0.3, '#f2f8ff'],
    [0.55, '#ffffff'],
    [0.8, '#bcd0ec'],
    [1, '#6a84b0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#34507e';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const y = 14 + i * 20;
    const lit = ph >= 0 ? clamp(1 - Math.abs((1 - ph) * 7 - i), 0, 1) : 0.25 + 0.2 * Math.sin(time * 3 - i * 0.7);
    roundRect(ctx, -21 + i * 0.6, y, 42 - i * 1.2, 8, 3);
    ctx.fillStyle = hg(ctx, -21, 21, [
      [0, '#0e3a8a'],
      [0.45, '#6ab0ff'],
      [1, '#0c3280'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#08246a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(200,225,255,${clamp(0.35 + lit, 0, 1)})`;
    ctx.fillRect(-17, y + 2.6, 34, 2.6);
    drawSprite(ctx, glowSprite('110,170,255'), 0, y + 4, 70, clamp(lit * 0.5, 0, 0.9));
    ctx.restore();
  }
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 4, 0, 0, TAU);
  ctx.fillStyle = '#061030';
  ctx.fill();
  ctx.strokeStyle = '#cfe0ff';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('120,170,255'), 0, -2, 56 + hot * 130, 0.35 + hot * 0.55);
  drawSprite(ctx, glowSprite('255,255,255'), 0, -2, 20 + hot * 50, 0.5 + hot * 0.5);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── QUANTUM DESTABILIZER ─────────────────────────
function drawQuantum(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const drawBarrel = (ox: number, alpha: number, tint: string) => {
    ctx.save();
    ctx.translate(ox, 0);
    ctx.globalAlpha = alpha;
    roundRect(ctx, -9, 14, 18, 170, 4);
    ctx.fillStyle = tint || hg(ctx, -9, 9, [
      [0, '#100620'],
      [0.35, '#4a2a90'],
      [0.55, '#8a60d8'],
      [1, '#0c0418'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#06020e';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };
  ctx.save();
  ctx.scale(0.95, 0.95);
  if (hot > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawBarrel(-6 * hot, 0.5 * hot, 'rgba(90,230,255,0.9)');
    drawBarrel(6 * hot, 0.5 * hot, 'rgba(255,90,220,0.9)');
    ctx.restore();
  }
  drawBarrel(0, 1, '');
  ctx.save();
  roundRect(ctx, -9, 14, 18, 170, 4);
  ctx.clip();
  ctx.lineCap = 'round';
  for (let k = 0; k < 2; k++) {
    ctx.strokeStyle = k ? 'rgba(255,214,120,0.95)' : 'rgba(220,170,255,0.95)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    for (let y = 14; y <= 184; y += 3) {
      const x = Math.sin((y - time * 60 * (1 + hot)) * 0.16 + k * Math.PI) * 13;
      if (y === 14) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  polyPath(ctx, [-30, 150, 30, 150, 36, 190, 24, 250, -24, 250, -36, 190]);
  ctx.fillStyle = hg(ctx, -36, 36, [
    [0, '#0e0620'],
    [0.3, '#3a2278'],
    [0.5, '#6a46b8'],
    [0.75, '#2a1a58'],
    [1, '#0a0418'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#06020e';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(210,150,255,${0.5 + 0.3 * Math.sin(time * 4)})`;
  ctx.lineWidth = 2;
  for (const y of [168, 184, 200]) line(ctx, -24, y, 24, y);
  ctx.restore();
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 9, 22, s * 24, 6, s * 20, -4, s * 6, 14]);
    ctx.fillStyle = hg(ctx, s > 0 ? 6 : -24, s > 0 ? 24 : -6, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#1a1626';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(Math.sin(time * 30) * hot * 3, -12);
  drawQuantumOrb(ctx, 0, 0, 12 + hot * 4, time, 0.9 + hot * 0.4);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── WARS BLASTER ─────────────────────────
function drawWars(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.3 ? 1 - a.fireT / 0.3 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  roundRect(ctx, -9, 0, 18, 116, 4);
  ctx.fillStyle = hg(ctx, -9, 9, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(-6, 6, 3, 106);
  for (const y of [28, 44, 60]) {
    roundRect(ctx, -11, y, 22, 5, 2);
    ctx.fillStyle = hg(ctx, -11, 11, STEEL);
    ctx.fill();
    ctx.stroke();
  }
  roundRect(ctx, -12, -4, 24, 16, 5);
  ctx.fillStyle = hg(ctx, -12, 12, STEEL);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, -4, 9, 3.2, 0, 0, TAU);
  ctx.fillStyle = '#1a0406';
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const pulse = 0.6 + 0.4 * Math.sin(time * 5);
  ctx.fillStyle = `rgba(255,70,60,${0.5 + 0.4 * pulse + hot * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(0, -4, 6, 2, 0, 0, TAU);
  ctx.fill();
  drawSprite(ctx, glowSprite('255,70,60'), 0, -4, 36 + hot * 90, 0.45 + hot * 0.5);
  ctx.restore();
  roundRect(ctx, -5.4, 34, 10.8, 60, 5);
  ctx.fillStyle = hg(ctx, -5, 5, STEEL);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0a1018';
  ctx.beginPath();
  ctx.arc(0, 30, 6, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#8a929c';
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,80,70'), 0, 30, 14, 0.5 + 0.3 * pulse);
  ctx.restore();
  polyPath(ctx, [-26, 110, 26, 110, 34, 150, 28, 176, -28, 176, -34, 150]);
  ctx.fillStyle = hg(ctx, -34, 34, DARK);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = hg(ctx, -22, 22, STEEL);
  roundRect(ctx, -22, 120, 44, 10, 3);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(255,70,60,${0.4 + 0.3 * pulse})`;
  roundRect(ctx, 14, 138, 12, 24, 3);
  ctx.fill();
  ctx.restore();
  polyPath(ctx, [-12, 174, 14, 174, 20, 240, -8, 244]);
  ctx.fillStyle = hg(ctx, -12, 20, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.strokeStyle = '#161c24';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-14, 176);
  ctx.quadraticCurveTo(-30, 196, -12, 206);
  ctx.stroke();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,90,70'), 0, -6, 90 * hot + 12, 0.8 * hot);
    drawSprite(ctx, glowSprite('255,240,230'), 0, -6, 30 * hot + 8, hot);
    ctx.restore();
  }
  ctx.restore();
}
