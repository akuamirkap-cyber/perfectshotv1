import { type Ctx, TAU, clamp, drawSprite, glowSprite, lin, makeBolt, polyPath, roundRect, starSprite } from './core';
import { drawSnowflake } from './shapes2';
import { drawElectricOrb, strokeBolt } from './shapes5';
import { GROW_PAL, SHRINK_PAL, drawCannonball, drawFish, drawIceCluster, drawMagnet, drawMissile, drawPlayingCard } from './shapes6';
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
  [0, '#0c0e12'],
  [0.3, '#2c323a'],
  [0.5, '#4c5560'],
  [0.75, '#222830'],
  [1, '#08090c'],
];
const GOLD: [number, string][] = [
  [0, '#6b3a05'],
  [0.25, '#e3a52c'],
  [0.45, '#fff3c4'],
  [0.65, '#f2bf45'],
  [1, '#5e3204'],
];
const WOOD: [number, string][] = [
  [0, '#3d2209'],
  [0.3, '#b27a40'],
  [0.5, '#dcab70'],
  [0.75, '#8a5a28'],
  [1, '#33190a'],
];
const OLIVE: [number, string][] = [
  [0, '#1c2410'],
  [0.3, '#566a2a'],
  [0.5, '#8aa044'],
  [0.75, '#46581f'],
  [1, '#161d0a'],
];

export function drawWeapon6(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'fish':
      return drawFishGun(ctx, a, time);
    case 'rpg':
      return drawRpg(ctx, a, time);
    case 'cricket':
      return drawCricket(ctx, a, time);
    case 'electro':
      return drawElectro(ctx, a, time);
    case 'bazooka':
      return drawBazooka(ctx, a, time);
    case 'freeze':
      return drawFreeze(ctx, a, time);
    case 'rail':
      return drawRail(ctx, a, time);
    case 'magnet':
      return drawMagnetGun(ctx, a, time);
    case 'shrink':
      return drawSizeRay(ctx, a, time, false);
    case 'grow':
      return drawSizeRay(ctx, a, time, true);
    case 'pirate':
      return drawPirate(ctx, a, time);
    case 'card':
      return drawCardGun(ctx, a, time);
    default:
      return;
  }
}

// ───────────────────────── FISH GUN ─────────────────────────
function drawFishGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const open = 0.2 + (a.fireT < 0.3 ? Math.sin((a.fireT / 0.3) * Math.PI) * 0.8 : 0);
  const sq = a.fireT < 0.22 ? Math.sin((a.fireT / 0.22) * Math.PI) : 0;
  ctx.save();
  ctx.scale(0.92, 0.92);
  polyPath(ctx, [18, 150, 48, 158, 58, 224, 32, 232]);
  ctx.fillStyle = hg(ctx, 18, 58, [
    [0, '#143e86'],
    [0.5, '#3a86e8'],
    [1, '#10337a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0a2250';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(190,225,255,0.5)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) line(ctx, 25 + i * 0.7, 172 + i * 12, 51 + i * 1.2, 172 + i * 12);
  ctx.save();
  ctx.translate(0, 105);
  ctx.scale(1 + 0.05 * sq, 1 - 0.035 * sq);
  drawFish(ctx, 3, time * 0.25, open);
  ctx.restore();
  roundRect(ctx, -10, -24, 20, 40, 6);
  ctx.fillStyle = hg(ctx, -10, 10, [
    [0, '#0e3a80'],
    [0.4, '#58b0ff'],
    [1, '#0c2f70'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#082050';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  for (const y of [-14, -2]) {
    roundRect(ctx, -12, y, 24, 5, 2);
    ctx.fillStyle = '#eaf6ff';
    ctx.fill();
    ctx.strokeStyle = '#4a7ab8';
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(0, -24, 7.4, 3, 0, 0, TAU);
  ctx.fillStyle = '#05121f';
  ctx.fill();
  if (a.fireT < 0.4) {
    const h = 1 - a.fireT / 0.4;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('150,220,255'), 0, -22, 110 * h + 14, 0.7 * h);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── RPG-7 ─────────────────────────
function drawRpg(ctx: Ctx, a: WeaponAnim, time: number) {
  const ld = clamp((a.fireT - 0.35) / 0.4, 0, 1);
  const hot = a.fireT < 1.2 ? 1 - a.fireT / 1.2 : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  ctx.save();
  ctx.translate(0, 8 + (1 - ld) * 76);
  ctx.scale(1.55, 1.55);
  drawMissile(ctx, 0, 0, 0);
  ctx.restore();
  polyPath(ctx, [-12, 30, 12, 30, 26, 66, -26, 66]);
  ctx.fillStyle = hg(ctx, -26, 26, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 30, 12, 4, 0, 0, TAU);
  ctx.fillStyle = '#05060a';
  ctx.fill();
  ctx.strokeStyle = '#8a929c';
  ctx.stroke();
  roundRect(ctx, -12, 64, 24, 200, 3);
  ctx.fillStyle = hg(ctx, -12, 12, DARK);
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -17, 106, 34, 82, 6);
  ctx.fillStyle = hg(ctx, -17, 17, WOOD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.9)';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40,20,6,0.4)';
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 5; i++) line(ctx, -14 + i * 7, 110, -14 + i * 7, 184);
  for (const y of [112, 180]) {
    roundRect(ctx, -18, y, 36, 8, 2);
    ctx.fillStyle = hg(ctx, -18, 18, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#1a1e24';
    ctx.stroke();
  }
  roundRect(ctx, 12, 76, 10, 26, 3);
  ctx.fillStyle = hg(ctx, 12, 22, STEEL);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2a2e34';
  ctx.fillRect(15, 70, 4, 8);
  polyPath(ctx, [12, 198, 36, 208, 42, 266, 24, 272, 14, 236]);
  ctx.fillStyle = hg(ctx, 12, 42, WOOD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.9)';
  ctx.stroke();
  ctx.strokeStyle = '#1a1e24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 196);
  ctx.quadraticCurveTo(14, 218, 2, 222);
  ctx.stroke();
  polyPath(ctx, [-12, 258, 12, 258, 24, 290, -24, 290]);
  ctx.fillStyle = hg(ctx, -24, 24, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,130,40'), 0, 34, 90 * hot + 16, 0.7 * hot);
    ctx.restore();
  }
  if (Math.sin(time * 1.8) > 0.96) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('220,255,170'), 0, -20, 20, 0.7, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── NOISY CRICKET ─────────────────────────
function drawCricket(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const blink = Math.sin(time * 5) > 0.2 ? 1 : 0.25;
  ctx.save();
  ctx.scale(1.02, 1.02);
  roundRect(ctx, -15, 118, 30, 96, 10);
  ctx.fillStyle = hg(ctx, -15, 15, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,150,50,0.8)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) line(ctx, -11, 140 + i * 16, 11, 140 + i * 16);
  ctx.strokeStyle = '#1a1e24';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(14, 128);
  ctx.quadraticCurveTo(36, 140, 14, 170);
  ctx.stroke();
  roundRect(ctx, -25, 28, 50, 112, 15);
  ctx.fillStyle = hg(ctx, -25, 25, STEEL);
  ctx.fill();
  ctx.strokeStyle = '#1a1e24';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(20,24,30,0.9)';
  roundRect(ctx, -9, 52, 18, 62, 6);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(190,110,255,${0.5 + 0.4 * hot + 0.1 * blink})`;
  roundRect(ctx, -6, 58, 12, 50, 4);
  ctx.fill();
  drawSprite(ctx, glowSprite('170,90,255'), 0, 83, 60, 0.4 + 0.5 * hot);
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,46,56,0.8)';
  ctx.lineWidth = 1;
  for (const y of [40, 124]) line(ctx, -24, y, 24, y);
  for (const x of [-18, 18]) {
    ctx.fillStyle = '#4a525c';
    ctx.beginPath();
    ctx.arc(x, 46, 2, 0, TAU);
    ctx.arc(x, 118, 2, 0, TAU);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.ellipse(0, 28, 25, 9, 0, 0, TAU);
  ctx.fillStyle = '#0a0a12';
  ctx.fill();
  ctx.strokeStyle = '#2a323c';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 28, 17, 5.4, 0, 0, TAU);
  const lg = ctx.createRadialGradient(0, 28, 1, 0, 28, 17);
  lg.addColorStop(0, `rgba(255,240,255,${0.7 + 0.3 * hot})`);
  lg.addColorStop(0.5, `rgba(170,90,255,${0.8 + 0.2 * hot})`);
  lg.addColorStop(1, 'rgba(60,20,120,0.9)');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('190,110,255'), 0, 24, 54 + hot * 110, 0.5 + 0.45 * hot);
  ctx.restore();
  ctx.strokeStyle = '#98a2ae';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(24, 82);
  ctx.quadraticCurveTo(40, 54, 36, 4);
  ctx.stroke();
  ctx.strokeStyle = '#3a424c';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    const yy = 76 - i * 12;
    line(ctx, 25 + i * -0.2, yy, 33 + i * 0.6, yy - 5);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('190,110,255'), 36, 2, 22 + 8 * blink, 0.4 + 0.5 * blink);
  ctx.restore();
  ctx.fillStyle = '#e8d0ff';
  ctx.beginPath();
  ctx.arc(36, 3, 3.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── ELECTRO GUN ─────────────────────────
function drawElectro(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const en = clamp(0.55 + 0.25 * Math.sin(time * 5) + hot, 0, 1.6);
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -14, 226, 28, 72, 8);
  ctx.fillStyle = hg(ctx, -14, 14, [
    [0, '#06122e'],
    [0.5, '#1a3a78'],
    [1, '#050f26'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,200,255,0.55)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  roundRect(ctx, -15, 14, 30, 220, 9);
  ctx.fillStyle = hg(ctx, -15, 15, [
    [0, '#050c22'],
    [0.3, '#12306a'],
    [0.5, '#2656a8'],
    [0.75, '#0f2858'],
    [1, '#040a1c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,200,255,0.6)';
  ctx.stroke();
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 15, 60, s * 34, 76, s * 34, 190, s * 15, 206]);
    ctx.fillStyle = hg(ctx, s > 0 ? 15 : -34, s > 0 ? 34 : -15, [
      [0, '#0a1c44'],
      [0.5, '#2a64c0'],
      [1, '#081838'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,205,255,0.6)';
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(100,210,255,${clamp(0.4 + 0.4 * en, 0, 1)})`;
    ctx.lineWidth = 2;
    line(ctx, s * 25, 90, s * 25, 176);
    ctx.restore();
  }
  ctx.save();
  roundRect(ctx, -7, 26, 14, 190, 6);
  ctx.fillStyle = '#021226';
  ctx.fill();
  ctx.clip();
  const cg = ctx.createLinearGradient(0, 26, 0, 216);
  cg.addColorStop(0, `rgba(40,150,255,${clamp(0.6 + 0.3 * en, 0, 1)})`);
  cg.addColorStop(0.5, `rgba(150,230,255,${clamp(0.8 + 0.2 * en, 0, 1)})`);
  cg.addColorStop(1, `rgba(40,150,255,${clamp(0.6 + 0.3 * en, 0, 1)})`);
  ctx.fillStyle = cg;
  ctx.fillRect(-7, 26, 14, 190);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(230,250,255,0.8)';
  const by = 26 + ((time * 130) % 220) - 20;
  ctx.fillRect(-7, by, 14, 18);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('80,190,255'), 0, 120, 130, clamp(0.4 * en, 0, 0.9));
  ctx.restore();
  for (let i = 0; i < 7; i++) {
    const y = 34 + i * 28;
    roundRect(ctx, -21, y, 42, 10, 3);
    ctx.fillStyle = hg(ctx, -21, 21, GOLD);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,0,0.85)';
    ctx.lineWidth = 1;
    ctx.stroke();
    const lit = clamp(0.4 + 0.5 * Math.sin(time * 7 - i * 0.8) + hot * 0.8, 0, 1.3);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(160,225,255,${clamp(lit * 0.7, 0, 1)})`;
    ctx.fillRect(-17, y + 3, 34, 3);
    drawSprite(ctx, glowSprite('100,200,255'), 0, y + 5, 54, clamp(lit * 0.35, 0, 0.7));
    ctx.restore();
  }
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 10, 18, s * 22, -6, s * 18, -14, s * 6, 14]);
    ctx.fillStyle = hg(ctx, s > 0 ? 6 : -22, s > 0 ? 22 : -6, GOLD);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,0,0.9)';
    ctx.stroke();
    ctx.fillStyle = '#e8f6ff';
    ctx.beginPath();
    ctx.arc(s * 18, -15, 3.6, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('150,220,255'), s * 18, -15, 26 + 12 * en, 0.7);
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (Math.random() < 0.45 + hot * 0.5) strokeBolt(ctx, makeBolt(-18, -15, 18, -15, 0.5, 3), 1.2);
  if (Math.random() < 0.25 + hot * 0.4) strokeBolt(ctx, makeBolt(-18, -15, 0, 4, 0.4, 3), 0.9);
  if (Math.random() < 0.25 + hot * 0.4) strokeBolt(ctx, makeBolt(18, -15, 0, 4, 0.4, 3), 0.9);
  ctx.restore();
  drawElectricOrb(ctx, 0, 2, 5 + hot * 4, time * 3, 0.6 + hot * 0.5, hot > 0.1 ? 2 : 1);
  ctx.restore();
}

// ───────────────────────── BAZOOKA ─────────────────────────
function drawBazooka(ctx: Ctx, a: WeaponAnim, time: number) {
  const ld = clamp((a.fireT - 0.4) / 0.45, 0, 1);
  const hot = a.fireT < 1.4 ? 1 - a.fireT / 1.4 : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  ctx.save();
  ctx.translate(0, 20 + (1 - ld) * 60);
  ctx.scale(1.55, 1.55);
  drawMissile(ctx, 1, 0, 0);
  ctx.restore();
  roundRect(ctx, -24, 24, 48, 18, 5);
  ctx.fillStyle = hg(ctx, -24, 24, OLIVE);
  ctx.fill();
  ctx.strokeStyle = '#0a0e04';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 26, 20, 5, 0, 0, TAU);
  ctx.fillStyle = '#04060a';
  ctx.fill();
  ctx.strokeStyle = '#8a929c';
  ctx.stroke();
  roundRect(ctx, -20, 38, 40, 232, 8);
  ctx.fillStyle = hg(ctx, -20, 20, OLIVE);
  ctx.fill();
  ctx.strokeStyle = '#0a0e04';
  ctx.stroke();
  ctx.fillStyle = 'rgba(230,240,180,0.2)';
  ctx.fillRect(-14, 44, 5, 220);
  for (const y of [74, 154, 232]) {
    ctx.fillStyle = '#12160a';
    ctx.fillRect(-21, y, 42, 12);
    ctx.fillStyle = '#ffd23a';
    ctx.fillRect(-21, y + 4, 42, 2.4);
  }
  ctx.fillStyle = '#e8f0c8';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 3.4 : 8;
    const an = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(an) * r, 114 + Math.sin(an) * r);
  }
  ctx.closePath();
  ctx.fill();
  roundRect(ctx, 20, 92, 14, 40, 4);
  ctx.fillStyle = hg(ctx, 20, 34, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,80,60'), 27, 98, 10 + 3 * Math.sin(time * 6), 0.7);
  ctx.restore();
  polyPath(ctx, [20, 140, 42, 150, 46, 214, 26, 220, 20, 190]);
  ctx.fillStyle = hg(ctx, 20, 46, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.stroke();
  polyPath(ctx, [-20, 262, 20, 262, 32, 300, -32, 300]);
  ctx.fillStyle = hg(ctx, -32, 32, OLIVE);
  ctx.fill();
  ctx.stroke();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,140,50'), 0, 30, 110 * hot + 16, 0.7 * hot);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── FREEZE RAY ─────────────────────────
function drawFreeze(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const en = clamp(0.55 + 0.2 * Math.sin(time * 3) + ch * 0.9 + hot * 0.8, 0, 1.6);
  ctx.save();
  ctx.scale(0.95, 0.95);
  roundRect(ctx, -14, 218, 28, 76, 8);
  ctx.fillStyle = hg(ctx, -14, 14, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,225,255,0.6)';
  ctx.lineWidth = 1.8;
  for (let i = 0; i < 4; i++) line(ctx, -10, 236 + i * 12, 10, 236 + i * 12);
  roundRect(ctx, -26, 46, 52, 180, 15);
  ctx.fillStyle = hg(ctx, -26, 26, [
    [0, '#9aa8bc'],
    [0.3, '#f4f8fc'],
    [0.55, '#ffffff'],
    [0.8, '#c4d2e4'],
    [1, '#7e8ca2'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#4a5a70';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  for (const y of [66, 196]) {
    roundRect(ctx, -27, y, 54, 14, 5);
    ctx.fillStyle = hg(ctx, -27, 27, [
      [0, '#0c5a8a'],
      [0.45, '#5cd0ff'],
      [1, '#0a4a78'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#06344e';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, 132);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('110,215,255'), 0, 0, 90 + ch * 40, clamp(0.45 * en, 0, 0.9));
  ctx.restore();
  ctx.strokeStyle = `rgba(30,150,210,0.95)`;
  ctx.lineWidth = 2.4;
  drawSnowflake(ctx, 17);
  ctx.strokeStyle = `rgba(255,255,255,${clamp(0.5 + 0.3 * en, 0, 1)})`;
  ctx.lineWidth = 1;
  drawSnowflake(ctx, 17);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(110,225,255,${clamp(0.4 + 0.4 * en, 0, 1)})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) line(ctx, -22, 92 + i * 7, 22, 88 + i * 7);
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 46, 24, 8, 0, 0, TAU);
  ctx.fillStyle = '#e8f6ff';
  ctx.fill();
  ctx.strokeStyle = '#5ac8f0';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('120,225,255'), 0, 20, 100 + ch * 50 + hot * 90, clamp(0.4 + 0.3 * en, 0, 1));
  ctx.restore();
  ctx.save();
  ctx.translate(0, 48);
  drawIceCluster(ctx, 1.75, time);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── RAILGUN ─────────────────────────
function drawRail(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const N = 7;
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -14, 234, 28, 66, 8);
  ctx.fillStyle = hg(ctx, -14, 14, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  roundRect(ctx, -28, 196, 56, 56, 11);
  ctx.fillStyle = hg(ctx, -28, 28, DARK);
  ctx.fill();
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(110,170,255,${0.5 + 0.3 * Math.sin(time * 4)})`;
  ctx.fillRect(-20, 226, 40, 3);
  ctx.restore();
  roundRect(ctx, -9, 4, 18, 200, 4);
  ctx.fillStyle = '#05080e';
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const core = ctx.createLinearGradient(0, 4, 0, 204);
  core.addColorStop(0, `rgba(120,170,255,${0.35 + 0.5 * hot + 0.4 * ch})`);
  core.addColorStop(1, `rgba(150,110,255,${0.35 + 0.4 * hot + 0.4 * ch})`);
  ctx.fillStyle = core;
  ctx.fillRect(-5, 6, 10, 196);
  ctx.restore();
  for (const x of [-21, 12]) {
    roundRect(ctx, x, 0, 9, 208, 3);
    ctx.fillStyle = hg(ctx, x, x + 9, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#1a1e24';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  for (let i = 0; i < N; i++) {
    const y = 190 - i * 27;
    const prog = a.charging ? clamp(ch * N - i, 0, 1) : a.fireT < 0.6 ? clamp(1 - Math.abs(a.fireT * 16 - i * 0.9), 0, 1) : 0;
    const idle = 0.2 + 0.12 * Math.sin(time * 3 + i);
    const lit = clamp(idle + prog, 0, 1.3);
    roundRect(ctx, -25, y, 50, 12, 4);
    ctx.fillStyle = hg(ctx, -25, 25, DARK);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(${i % 2 ? '170,120,255' : '110,180,255'},${clamp(lit * 0.9, 0, 1)})`;
    ctx.fillRect(-20, y + 4, 40, 3.4);
    drawSprite(ctx, glowSprite(i % 2 ? '160,110,255' : '100,170,255'), 0, y + 6, 70, clamp(lit * 0.4, 0, 0.8));
    ctx.restore();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('130,180,255'), 0, 2, 40 + ch * 70 + hot * 110, clamp(0.4 + 0.5 * ch + 0.5 * hot, 0, 1));
  drawSprite(ctx, glowSprite('255,255,255'), 0, 2, 16 + ch * 24 + hot * 40, clamp(0.4 + ch + hot, 0, 1));
  if (Math.random() < 0.2 + ch * 0.6 + hot * 0.6) strokeBolt(ctx, makeBolt(-17, 8, 17, 8, 0.5, 3), 0.9, '140,190,255');
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── MAGNET GUN ─────────────────────────
function drawMagnetGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.7 ? 1 - a.fireT / 0.7 : 0;
  const field = clamp(0.25 + 0.15 * Math.sin(time * 3) + hot, 0, 1);
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -14, 236, 28, 64, 8);
  ctx.fillStyle = hg(ctx, -14, 14, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  roundRect(ctx, -27, 178, 54, 66, 11);
  ctx.fillStyle = hg(ctx, -27, 27, DARK);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d92638';
  ctx.fillRect(-27, 200, 54, 6);
  ctx.save();
  roundRect(ctx, -21, 92, 42, 92, 7);
  ctx.fillStyle = hg(ctx, -21, 21, [
    [0, '#5a2a0a'],
    [0.3, '#c46a24'],
    [0.5, '#ffb066'],
    [0.75, '#b05a1c'],
    [1, '#4a2208'],
  ]);
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(70,28,4,0.75)';
  ctx.lineWidth = 1.4;
  for (let y = 94; y < 188; y += 6) {
    ctx.beginPath();
    ctx.moveTo(-22, y + 4);
    ctx.quadraticCurveTo(0, y - 2, 22, y + 4);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,220,170,0.5)';
  ctx.lineWidth = 0.9;
  for (let y = 92; y < 188; y += 6) {
    ctx.beginPath();
    ctx.moveTo(-22, y + 1.4);
    ctx.quadraticCurveTo(0, y - 4.6, 22, y + 1.4);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = '#3a1a06';
  ctx.lineWidth = 1.3;
  roundRect(ctx, -21, 92, 42, 92, 7);
  ctx.stroke();
  for (const y of [90, 178]) {
    roundRect(ctx, -23, y, 46, 8, 3);
    ctx.fillStyle = hg(ctx, -23, 23, STEEL);
    ctx.fill();
    ctx.strokeStyle = '#1a1e24';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, 58);
  drawMagnet(ctx, 2.2, time, field);
  ctx.restore();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (Math.random() < 0.15 + hot * 0.7) strokeBolt(ctx, makeBolt(-33, 0, 33, 0, 0.4, 3), 1, '255,170,200');
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── SHRINK / GROW RAY ─────────────────────────
function drawSizeRay(ctx: Ctx, a: WeaponAnim, time: number, grow: boolean) {
  const pal = grow ? GROW_PAL : SHRINK_PAL;
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const N = 6;
  const accent = grow ? '#ff9a2b' : '#35d870';
  const accentDark = grow ? '#a84a00' : '#0a7a38';
  ctx.save();
  ctx.scale(0.92, 0.92);
  roundRect(ctx, -2.8, 8, 5.6, 130, 2);
  ctx.fillStyle = hg(ctx, -3, 3, STEEL);
  ctx.fill();
  ctx.strokeStyle = '#1a1e24';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let i = 0; i < N; i++) {
    const y = 14 + i * 21;
    const rad = grow ? 7 + (N - 1 - i) * 3.8 : 7 + i * 3.8;
    const k = grow ? N - 1 - i : i;
    const wave = (time * 1.6) % 1;
    const pos = grow ? wave : 1 - wave;
    const near = clamp(1 - Math.abs(i / (N - 1) - (grow ? 1 - pos : pos)) * 3.4, 0, 1);
    const lit = clamp(0.35 + near * 0.7 + hot * 0.7, 0, 1.4);
    ctx.save();
    ctx.translate(0, y);
    ctx.scale(1, 0.34);
    ctx.strokeStyle = accentDark;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(${pal.rgb},${clamp(lit * 0.85, 0, 1)})`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(pal.rgb), 0, y, 26 + rad * 2, clamp(lit * 0.3, 0, 0.6));
    ctx.restore();
    void k;
  }
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 22, 196, s * 56, 270, s * 24, 252]);
    ctx.fillStyle = hg(ctx, s > 0 ? 22 : -56, s > 0 ? 56 : -22, [
      [0, accentDark],
      [0.5, accent],
      [1, accentDark],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#0a2a14';
    ctx.lineWidth = 1.3;
    ctx.stroke();
  }
  polyPath(ctx, [-12, 134, 12, 134, 26, 200, 30, 244, 18, 276, -18, 276, -30, 244, -26, 200]);
  ctx.fillStyle = hg(ctx, -30, 30, [
    [0, '#9aa8bc'],
    [0.3, '#f4f8fc'],
    [0.55, '#ffffff'],
    [0.8, '#c4d2e4'],
    [1, '#7e8ca2'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#4a5a70';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = accent;
  polyPath(ctx, [-27, 232, 27, 232, 29, 244, -29, 244]);
  ctx.fill();
  ctx.save();
  ctx.translate(0, 190);
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, TAU);
  ctx.fillStyle = '#e6eef8';
  ctx.fill();
  ctx.strokeStyle = '#4a5a70';
  ctx.lineWidth = 2;
  ctx.stroke();
  const og = ctx.createRadialGradient(-5, -5, 2, 0, 0, 14);
  og.addColorStop(0, pal.hi);
  og.addColorStop(0.5, pal.mid);
  og.addColorStop(1, pal.lo);
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.arc(0, 0, 13.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(10,40,20,0.7)';
  ctx.fillRect(-6, -1.4, 12, 2.8);
  if (grow) ctx.fillRect(-1.4, -6, 2.8, 12);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite(pal.rgb), 0, 0, 56 + hot * 60, 0.5 + 0.4 * hot + 0.1 * Math.sin(time * 4));
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(-5, -5.4, 2.6, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 276, 18, 5, 0, 0, TAU);
  ctx.fillStyle = '#1a2230';
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite(pal.rgb), 0, 8, 50 + hot * 90, 0.35 + 0.5 * hot);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── MERIAM BAJAK LAUT ─────────────────────────
function drawPirate(ctx: Ctx, a: WeaponAnim, time: number) {
  const ld = clamp((a.fireT - 0.45) / 0.4, 0, 1);
  const hot = a.fireT < 1.2 ? 1 - a.fireT / 1.2 : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  ctx.save();
  ctx.translate(0, 8 + (1 - ld) * 46);
  drawCannonball(ctx, 18, true);
  ctx.restore();
  polyPath(ctx, [-24, 20, 24, 20, 32, 214, -32, 214]);
  ctx.fillStyle = hg(ctx, -32, 32, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(190,200,215,0.18)';
  ctx.fillRect(-18, 26, 6, 184);
  roundRect(ctx, -30, 8, 60, 20, 6);
  ctx.fillStyle = hg(ctx, -30, 30, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 10, 22, 5, 0, 0, TAU);
  ctx.fillStyle = '#05060a';
  ctx.fill();
  for (const y of [74, 168]) {
    roundRect(ctx, -32, y, 64, 9, 3);
    ctx.fillStyle = hg(ctx, -32, 32, GOLD);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,0,0.9)';
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(0, 120);
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, TAU);
  ctx.fillStyle = hg(ctx, -24, 24, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 19, 0, TAU);
  ctx.fillStyle = '#0c0d12';
  ctx.fill();
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#e8e2d2';
  ctx.lineWidth = 3.4;
  line(ctx, -11, 5, 11, 15);
  line(ctx, 11, 5, -11, 15);
  ctx.fillStyle = '#f4efe0';
  ctx.beginPath();
  ctx.arc(0, -3, 8.4, 0, TAU);
  ctx.fill();
  ctx.fillRect(-4.4, 2, 8.8, 5.4);
  ctx.fillStyle = '#0a0a0e';
  ctx.beginPath();
  ctx.arc(-3.2, -3.4, 2.2, 0, TAU);
  ctx.arc(3.2, -3.4, 2.2, 0, TAU);
  ctx.fill();
  polyPath(ctx, [0, -0.4, 1.2, 2, -1.2, 2]);
  ctx.fill();
  ctx.restore();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(0, 220, 26, 0, TAU);
  ctx.fillStyle = hg(ctx, -26, 26, DARK);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 240, 9, 0, TAU);
  ctx.fillStyle = hg(ctx, -9, 9, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.stroke();
  polyPath(ctx, [-13, 244, 13, 244, 17, 316, -17, 316]);
  ctx.fillStyle = hg(ctx, -17, 17, WOOD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.9)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,14,4,0.55)';
  ctx.lineWidth = 2;
  for (let y = 252; y < 310; y += 8) line(ctx, -14, y, 14, y + 4);
  ctx.strokeStyle = '#d8b878';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(26, 44);
  ctx.quadraticCurveTo(44, 36, 40, 18);
  ctx.stroke();
  ctx.fillStyle = '#0c0603';
  ctx.beginPath();
  ctx.ellipse(26, 44, 4, 2.6, 0, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (a.fuse > 0) {
    drawSprite(ctx, glowSprite('255,190,80'), 40, 18, 36, 0.9);
    drawSprite(ctx, glowSprite('255,255,230'), 40, 18, 12, 1);
    drawSprite(ctx, starSprite('255,230,150'), 40, 18, 22 + Math.sin(time * 60) * 5, 0.9, time * 8);
  } else {
    drawSprite(ctx, glowSprite('255,150,50'), 40, 18, 10, 0.25 + 0.25 * Math.sin(time * 9));
  }
  if (hot > 0) drawSprite(ctx, glowSprite('255,140,50'), 0, 12, 100 * hot + 14, 0.6 * hot);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── CARD GUN ─────────────────────────
function drawCardGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const ld = clamp((a.fireT - 0.15) / 0.35, 0, 1);
  const hot = a.fireT < 0.4 ? 1 - a.fireT / 0.4 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  ctx.save();
  ctx.translate(0, 32 + (1 - ld) * 44);
  drawPlayingCard(ctx, a.idx % 4, 1.95);
  ctx.restore();
  roundRect(ctx, -36, 40, 72, 224, 15);
  ctx.fillStyle = hg(ctx, -36, 36, [
    [0, '#aab4c4'],
    [0.3, '#f6f8fc'],
    [0.55, '#ffffff'],
    [0.8, '#d4dcea'],
    [1, '#8e9ab0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#d4202e';
  ctx.lineWidth = 5.4;
  ctx.stroke();
  roundRect(ctx, -30, 46, 60, 212, 11);
  ctx.strokeStyle = 'rgba(210,32,46,0.6)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  roundRect(ctx, -22, 72, 44, 122, 8);
  ctx.fillStyle = '#10121a';
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(-18, 76, 5, 114);
  for (let i = 0; i < 5; i++) {
    const on = Math.sin(time * 5 + i * 1.4) > -0.2;
    ctx.fillStyle = i % 2 ? '#f4f4f8' : '#e8283a';
    ctx.beginPath();
    ctx.arc(-9 + (i % 2) * 18, 88 + i * 20, 3.2, 0, TAU);
    ctx.fill();
    if (on && i % 2 === 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,70,90'), -9, 88 + i * 20, 14, 0.8);
      ctx.restore();
    }
  }
  roundRect(ctx, -9, 150, 18, 22, 3);
  ctx.fillStyle = hg(ctx, -9, 9, GOLD);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(90,50,0,0.7)';
  for (const y of [156, 161, 166]) line(ctx, -7, y, 7, y);
  for (const [sx, sy, su] of [
    [-26, 214, 0],
    [-9, 214, 2],
    [9, 214, 1],
    [26, 214, 3],
  ] as [number, number, number][]) {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(0.5, 0.5);
    drawPlayingCard(ctx, su, 0.6);
    ctx.restore();
  }
  roundRect(ctx, -36, 238, 72, 28, 12);
  ctx.fillStyle = hg(ctx, -36, 36, [
    [0, '#7a0e18'],
    [0.5, '#f0384a'],
    [1, '#6a0a14'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#4a0610';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  roundRect(ctx, -12, 246, 24, 10, 4);
  ctx.fillStyle = '#f4f4f8';
  ctx.fill();
  roundRect(ctx, -30, 40, 60, 12, 5);
  ctx.fillStyle = '#05060a';
  ctx.fill();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,230,160'), 0, 24, 100 * hot + 14, 0.7 * hot);
    ctx.restore();
  }
  if (Math.sin(time * 2) > 0.94) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,255,255'), 24, 70, 18, 0.8, 0);
    ctx.restore();
  }
  ctx.restore();
}
