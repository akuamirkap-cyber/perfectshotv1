import { type Ctx, TAU, drawSprite, glowSprite, lin, makeCanvas, mulberry32, polyPath, roundRect, starSprite } from './core';
import { drawFlameShape, drawSnowflake } from './shapes2';
import { drawWeapon3 } from './weaponArt3';
import type { WeaponAnim, WeaponId } from './weapons';

export const SNOW_SCALE = 0.9;
export const SNIPER_SCALE = 0.8;
export const FLAME_SCALE = 0.86;
export const BUBBLE_SCALE = 0.92;
export const BAMBOO_SCALE = 0.92;
export const BANANA_SCALE = 1;

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawWeapon2(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'snowball':
      return drawSnowCannon(ctx, a, time);
    case 'sniper':
      return drawSniper(ctx, a, time);
    case 'flame':
      return drawFlamethrower(ctx, a, time);
    case 'bubble':
      return drawBubbleGun(ctx, a, time);
    case 'bamboo':
      return drawBamboo(ctx, a, time);
    case 'banana':
      return drawBananaGun(ctx, a, time);
    default:
      return drawWeapon3(ctx, id, a, time);
  }
}

// ───────────────────────── SNOWBALL CANNON ─────────────────────────
let snowBallSprite: HTMLCanvasElement | undefined;
function getSnowBallSprite(ctx: Ctx): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement)) return null;
  if (snowBallSprite) return snowBallSprite;
  try {
    // One high-resolution gradient serves every snow lump and the moving
    // balls in the hopper; their positions and recoil remain live.
    const radius = 16, pad = 2, density = 3;
    const canvas = makeCanvas((radius + pad) * 2 * density, (radius + pad) * 2 * density);
    const c = canvas.getContext('2d');
    if (!c) return null;
    c.setTransform(density, 0, 0, density, (radius + pad) * density, (radius + pad) * density);
    snowBallVector(c, 0, 0, radius);
    snowBallSprite = canvas;
  } catch {
    return null;
  }
  return snowBallSprite ?? null;
}

function snowBall(ctx: Ctx, x: number, y: number, r: number) {
  const sprite = getSnowBallSprite(ctx);
  if (sprite && r > 0) {
    const half = r * 18 / 16;
    ctx.drawImage(sprite, x - half, y - half, half * 2, half * 2);
  } else snowBallVector(ctx, x, y, r);
}

function snowBallVector(ctx: Ctx, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r * 1.1);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.55, '#e6f1ff');
  g.addColorStop(1, '#8fb0e0');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function snowLump(ctx: Ctx, x: number, y: number, r: number) {
  ctx.fillStyle = 'rgba(110,160,225,0.55)';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.22, r, 0, TAU);
  ctx.fill();
  snowBall(ctx, x, y, r);
}

function drawSnowCannon(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(SNOW_SCALE, SNOW_SCALE);
  const rec = a.slide * 9;
  const blue = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#e6f8ff'],
      [0.22, '#8fd3ff'],
      [0.6, '#3f88e8'],
      [1, '#1b469e'],
    ]);

  // grip
  polyPath(ctx, [-182, 26, -138, 26, -126, 94, -160, 102, -178, 72]);
  ctx.fillStyle = lin(ctx, -182, 0, -126, 0, [
    [0, '#0f2459'],
    [0.5, '#2f66cf'],
    [1, '#0c1e48'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(170,220,255,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(200,238,255,0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const y = 46 + i * 13;
    line(ctx, -174 + i * 1.4, y, -136 + i * 2.6, y);
  }
  ctx.strokeStyle = '#dff4ff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-124, 30);
  ctx.quadraticCurveTo(-118, 56, -138, 58);
  ctx.stroke();
  ctx.fillStyle = '#8fd8ff';
  roundRect(ctx, -130, 34, 5, 17, 2);
  ctx.fill();

  // hopper dome with snowballs
  const hx = -146;
  const hy = -24;
  ctx.beginPath();
  ctx.arc(hx, hy, 31, Math.PI, TAU);
  ctx.closePath();
  ctx.fillStyle = 'rgba(150,225,255,0.22)';
  ctx.fill();
  ctx.save();
  ctx.clip();
  const jump = -a.slide * 4;
  snowBall(ctx, -160, -36 + jump, 11);
  snowBall(ctx, -132, -37 + jump * 1.4, 11);
  snowBall(ctx, -146, -46 + jump * 0.6, 10);
  snowBall(ctx, -170, -27, 8);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(hx, hy, 31, Math.PI, TAU);
  ctx.strokeStyle = 'rgba(215,247,255,0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hx, hy, 24, Math.PI * 1.12, Math.PI * 1.4);
  ctx.stroke();
  ctx.fillStyle = lin(ctx, 0, -30, 0, -20, [
    [0, '#eaf8ff'],
    [1, '#7fb3e8'],
  ]);
  roundRect(ctx, -182, -29, 72, 9, 3);
  ctx.fill();

  // body
  roundRect(ctx, -206, -24, 118, 58, 16);
  ctx.fillStyle = blue(-24, 34);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,50,120,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -206, -24, 118, 58, 16);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (const sx of [-178, -134]) {
    polyPath(ctx, [sx, -26, sx + 12, -26, sx - 10, 36, sx - 22, 36]);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-206, -20, 118, 3);
  ctx.restore();
  for (let x = -198; x < -90; x += 15) snowLump(ctx, x, -24 + Math.sin(x) * 1.6, 6 + (Math.abs(Math.sin(x * 1.7)) * 2.6));
  // crystal
  const pulse = 0.75 + 0.25 * Math.sin(time * 3) + (a.fireT < 0.4 ? (1 - a.fireT / 0.4) * 0.6 : 0);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('110,215,255'), -150, 8, 60, 0.7 * Math.min(1.3, pulse));
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(-150, -5);
  ctx.lineTo(-141, 8);
  ctx.lineTo(-150, 21);
  ctx.lineTo(-159, 8);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -159, -5, -141, 21, [
    [0, '#ffffff'],
    [0.5, '#8fe6ff'],
    [1, '#2f9be0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#cfeaff';
  for (const [rx, ry] of [
    [-196, -14],
    [-196, 26],
    [-96, -14],
    [-96, 26],
  ]) {
    ctx.beginPath();
    ctx.arc(rx, ry, 2, 0, TAU);
    ctx.fill();
  }

  // barrel (recoils)
  ctx.save();
  ctx.translate(-rec, 0);
  polyPath(ctx, [-122, -14, -30, -16, -10, -25, 0, -25, 0, 25, -10, 25, -30, 16, -122, 14]);
  ctx.fillStyle = blue(-25, 25);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,50,120,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.clip();
  for (const x of [-98, -76]) {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(x, -30, 9, 60);
    ctx.fillStyle = 'rgba(40,100,200,0.55)';
    ctx.fillRect(x - 1.4, -30, 1.4, 60);
    ctx.fillRect(x + 9, -30, 1.4, 60);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-120, -12, 112, 3);
  ctx.restore();
  ctx.save();
  ctx.translate(-50, 0);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.6;
  drawSnowflake(ctx, 11);
  ctx.restore();
  ctx.fillStyle = lin(ctx, -12, 0, 2, 0, [
    [0, '#ffffff'],
    [0.5, '#cfeaff'],
    [1, '#7fb4ea'],
  ]);
  roundRect(ctx, -12, -28, 14, 56, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,60,140,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (const [lx, ly, lr] of [
    [-62, -17, 7],
    [-44, -20, 8.5],
    [-26, -24, 8],
    [-6, -29, 7.5],
    [-82, -16, 6],
  ] as [number, number, number][])
    snowLump(ctx, lx, ly, lr);
  for (const [ix, il] of [
    [-20, 17],
    [-12, 24],
    [-5, 13],
    [3, 20],
  ]) {
    ctx.fillStyle = lin(ctx, 0, 26, 0, 26 + il, [
      [0, 'rgba(255,255,255,0.95)'],
      [1, 'rgba(150,215,255,0.5)'],
    ]);
    ctx.beginPath();
    ctx.moveTo(ix - 3, 26);
    ctx.lineTo(ix, 26 + il);
    ctx.lineTo(ix + 3, 26);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  if (a.fireT < 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('150,220,255'), 0, 0, 90 * (1 - a.fireT / 0.5), 0.8 * (1 - a.fireT / 0.5));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── SNIPER AWP ─────────────────────────
function drawSniper(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(SNIPER_SCALE, SNIPER_SCALE);
  const steel = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#6b7480'],
      [0.2, '#dde2e8'],
      [0.45, '#7a828d'],
      [0.75, '#2a2e34'],
      [1, '#454b54'],
    ]);
  const lime = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#d6fa7c'],
      [0.25, '#97d63e'],
      [0.65, '#57901c'],
      [1, '#2f5a0d'],
    ]);

  // pistol grip + magazine
  polyPath(ctx, [-228, 14, -196, 14, -188, 68, -218, 76]);
  ctx.fillStyle = lime(14, 76);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,40,5,0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20,40,5,0.45)';
  for (let y = 24; y < 70; y += 6) line(ctx, -220 + y * 0.1, y, -192 + y * 0.05, y);
  roundRect(ctx, -210, 14, 28, 26, 3);
  ctx.fillStyle = '#22262c';
  ctx.fill();
  ctx.fillStyle = '#8fd13f';
  ctx.fillRect(-210, 30, 28, 3);
  ctx.strokeStyle = '#1d2126';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-186, 14);
  ctx.quadraticCurveTo(-186, 36, -170, 36);
  ctx.lineTo(-160, 34);
  ctx.stroke();
  // receiver
  roundRect(ctx, -252, -12, 108, 28, 5);
  ctx.fillStyle = steel(-12, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#0b0c0e';
  roundRect(ctx, -210, -6, 28, 10, 2);
  ctx.fill();
  // handguard with holes
  roundRect(ctx, -162, -11, 104, 27, 7);
  ctx.fillStyle = lime(-11, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,45,5,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#0d1208';
    ctx.beginPath();
    ctx.ellipse(-142 + i * 22, 2.5, 8, 4.6, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(210,255,140,0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(-142 + i * 22, 2.5, 8, 4.6, 0, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  ctx.fillStyle = steel(-15, -11);
  ctx.fillRect(-152, -15, 94, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let x = -148; x < -60; x += 6) ctx.fillRect(x, -15, 2, 3);
  // bipod (folded)
  ctx.strokeStyle = '#2a2e34';
  ctx.lineWidth = 3.4;
  line(ctx, -106, 16, -60, 27);
  line(ctx, -96, 16, -52, 30);
  ctx.fillStyle = '#15171a';
  ctx.fillRect(-64, 24, 8, 6);
  // barrel
  ctx.fillStyle = steel(-5, 5);
  ctx.fillRect(-60, -5, 36, 10);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 0.8;
  line(ctx, -58, -2.6, -26, -2.6);
  // muzzle brake
  roundRect(ctx, -30, -9, 30, 18, 3);
  ctx.fillStyle = steel(-9, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#07080a';
  for (const x of [-24, -16, -8]) {
    ctx.fillRect(x, -9, 2.6, 6);
    ctx.fillRect(x, 3, 2.6, 6);
  }
  ctx.fillStyle = '#1c1f24';
  ctx.beginPath();
  ctx.ellipse(0, 0, 1.6, 5, 0, 0, TAU);
  ctx.fill();
  // scope
  for (const mx of [-216, -130]) {
    ctx.fillStyle = steel(-24, -12);
    roundRect(ctx, mx, -24, 12, 13, 2);
    ctx.fill();
  }
  roundRect(ctx, -240, -35, 144, 14, 7);
  ctx.fillStyle = lin(ctx, 0, -35, 0, -21, [
    [0, '#4a515b'],
    [0.3, '#22262c'],
    [1, '#0c0e11'],
  ]);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(-232, -32, 128, 2);
  ctx.fillStyle = '#8fd13f';
  ctx.fillRect(-196, -35, 6, 14);
  polyPath(ctx, [-100, -38, -82, -44, -82, -12, -100, -18]);
  ctx.fillStyle = lin(ctx, 0, -44, 0, -12, [
    [0, '#4a515b'],
    [0.4, '#1c2026'],
    [1, '#0c0e11'],
  ]);
  ctx.fill();
  ctx.fillStyle = steel(-43, -37);
  roundRect(ctx, -178, -42, 11, 8, 2);
  ctx.fill();
  roundRect(ctx, -152, -22, 9, 7, 2);
  ctx.fill();
  const lg = ctx.createLinearGradient(-86, -28, -78, -28);
  lg.addColorStop(0, '#3a3a9a');
  lg.addColorStop(0.5, '#7ad8ff');
  lg.addColorStop(1, '#b8f0ff');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.ellipse(-82, -28, 4, 15.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#05060a';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  const gl = (time * 0.35) % 1;
  if (gl < 0.22) {
    const k = Math.sin((gl / 0.22) * Math.PI);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('200,240,255'), -82, -30, 46 * k, k, 0);
    ctx.restore();
  }
  // bolt (animated)
  const bx = -168 - a.bolt * 32;
  roundRect(ctx, bx - 14, -7, 28, 11, 3);
  ctx.fillStyle = steel(-7, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  const Lh = 19 * (1 - 0.88 * a.lift);
  ctx.strokeStyle = '#cfd5dc';
  ctx.lineWidth = 3;
  line(ctx, bx, 1, bx, 1 + Lh);
  const br = 4.2 * (1 + 0.4 * a.lift);
  const bg = ctx.createRadialGradient(bx - 1, 1 + Lh - 1, 0.5, bx, 1 + Lh, br);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(1, '#6b7480');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(bx, 1 + Lh, br, 0, TAU);
  ctx.fill();
  if (a.fireT < 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,170,70'), -6, 0, 70 * (1 - a.fireT / 0.5), 0.8 * (1 - a.fireT / 0.5));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── FLAMETHROWER ─────────────────────────
function drawFlamethrower(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(FLAME_SCALE, FLAME_SCALE);
  const steel = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#7d8590'],
      [0.2, '#d6dce4'],
      [0.5, '#5b626c'],
      [1, '#23262b'],
    ]);
  const red = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#ff8a78'],
      [0.22, '#ec3b30'],
      [0.6, '#b01a14'],
      [1, '#5a0a07'],
    ]);

  // grip
  polyPath(ctx, [-80, 18, -50, 18, -38, 74, -68, 80]);
  ctx.fillStyle = lin(ctx, -80, 0, -38, 0, [
    [0, '#14161a'],
    [0.5, '#3a3e46'],
    [1, '#101216'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#ff8a2b';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) line(ctx, -74 + i * 2, 36 + i * 11, -46 + i * 2, 36 + i * 11);
  ctx.strokeStyle = '#2a2d33';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-48, 20);
  ctx.quadraticCurveTo(-44, 40, -58, 42);
  ctx.stroke();
  ctx.fillStyle = '#ff8a2b';
  roundRect(ctx, -58, 22, 5, 15, 2);
  ctx.fill();

  // fuel tank
  roundRect(ctx, -196, 20, 140, 40, 20);
  ctx.fillStyle = red(20, 60);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,5,3,0.8)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  roundRect(ctx, -186, 24.5, 122, 5, 2.5);
  ctx.fill();
  for (const sx of [-168, -128, -88]) {
    ctx.fillStyle = lin(ctx, sx, 0, sx + 10, 0, [
      [0, '#0c0d0f'],
      [0.5, '#3c4048'],
      [1, '#0c0d0f'],
    ]);
    ctx.fillRect(sx, 19, 10, 42);
    ctx.fillStyle = '#9aa3ad';
    ctx.beginPath();
    ctx.arc(sx + 5, 26, 1.5, 0, TAU);
    ctx.arc(sx + 5, 54, 1.5, 0, TAU);
    ctx.fill();
  }
  // flame emblem
  ctx.save();
  ctx.translate(-108, 40);
  ctx.fillStyle = '#ffd23f';
  ctx.strokeStyle = '#6a1a05';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.bezierCurveTo(7, -4, 9, 3, 5, 8);
  ctx.bezierCurveTo(3, 11, -3, 11, -5, 8);
  ctx.bezierCurveTo(-8, 3, -3, -3, 0, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff7a1a';
  ctx.beginPath();
  ctx.ellipse(0, 5, 2.6, 4, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
  // hose
  ctx.strokeStyle = '#121417';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-58, 42);
  ctx.quadraticCurveTo(-30, 52, -40, 20);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-58, 40);
  ctx.quadraticCurveTo(-32, 49, -41, 20);
  ctx.stroke();

  // housing
  roundRect(ctx, -180, -17, 104, 38, 9);
  ctx.fillStyle = lin(ctx, 0, -17, 0, 21, [
    [0, '#5b616b'],
    [0.3, '#33373e'],
    [1, '#15171a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -180, -17, 104, 38, 9);
  ctx.clip();
  ctx.fillStyle = '#e03a2f';
  ctx.fillRect(-180, -1, 104, 5);
  ctx.fillStyle = '#ffd23f';
  for (let x = -178; x < -148; x += 10) {
    polyPath(ctx, [x, 8, x + 5, 8, x - 3, 21, x - 8, 21]);
    ctx.fill();
  }
  ctx.restore();
  // gauge
  const gx = -118;
  const gy = -23;
  ctx.fillStyle = '#9aa3ad';
  ctx.beginPath();
  ctx.arc(gx, gy, 10.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(gx, gy, 8.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#ff2d2d';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(gx, gy, 6.8, Math.PI * 1.95, Math.PI * 2.25);
  ctx.stroke();
  const na = Math.PI * 0.75 + Math.min(1, a.fireT < 0.8 ? 0.95 : 0.55) * Math.PI * 1.5 + Math.sin(time * 30) * 0.03;
  ctx.strokeStyle = '#c00000';
  ctx.lineWidth = 1.2;
  line(ctx, gx, gy, gx + Math.cos(na) * 6.2, gy + Math.sin(na) * 6.2);

  // nozzle tube with coil + rings
  ctx.fillStyle = steel(-7, 7);
  ctx.fillRect(-84, -7, 78, 14);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-84, -7, 78, 14);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,150,50,0.8)';
  ctx.lineWidth = 2.2;
  for (let x = -82; x < -8; x += 9) line(ctx, x, -8, x + 5, 8);
  ctx.restore();
  for (const x of [-80, -50, -22]) {
    ctx.fillStyle = steel(-10, 10);
    roundRect(ctx, x, -10, 6, 20, 2);
    ctx.fill();
  }
  polyPath(ctx, [-9, -8, 0, -14, 0, 14, -9, 8]);
  ctx.fillStyle = lin(ctx, 0, -14, 0, 14, [
    [0, '#ffd89a'],
    [0.4, '#c8741a'],
    [1, '#6a3408'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // pilot flame (grows when firing)
  const boost = a.fireT < 0.7 ? 1 - a.fireT / 0.7 : 0;
  ctx.save();
  ctx.translate(2, 0);
  ctx.rotate(Math.PI / 2);
  drawFlameShape(ctx, 20 + boost * 34 + Math.sin(time * 17) * 2, 8 + boost * 8, time, 1.3, 0.95);
  ctx.restore();
  if (a.fireT < 1.2) {
    const h = 1 - a.fireT / 1.2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,140,40'), -4, 0, 56 * h + 16, 0.7 * h);
    ctx.fillStyle = `rgba(255,120,30,${0.35 * h})`;
    ctx.fillRect(-26, -7, 24, 14);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── BUBBLE GUN ─────────────────────────
function drawBubbleGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(BUBBLE_SCALE, BUBBLE_SCALE);
  const cy = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#d6fbff'],
      [0.25, '#6fdcf5'],
      [0.65, '#2aa6d6'],
      [1, '#146890'],
    ]);
  const pk = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#ffe0f2'],
      [0.25, '#ff86c9'],
      [0.65, '#e0489f'],
      [1, '#8f1f63'],
    ]);

  // grip
  polyPath(ctx, [-150, 24, -108, 24, -96, 92, -134, 98]);
  ctx.fillStyle = lin(ctx, -150, 0, -96, 0, [
    [0, '#a82a72'],
    [0.45, '#ff8ccd'],
    [1, '#9a2468'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,10,60,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 3;
  line(ctx, -140, 44, -104, 44);
  line(ctx, -138, 60, -102, 60);
  ctx.fillStyle = '#ffd23f';
  roundRect(ctx, -100, 28, 6, 18, 3);
  ctx.fill();

  // glass tank
  const tx = -104;
  const ty = -52;
  const tr = 35;
  ctx.beginPath();
  ctx.arc(tx, ty, tr, 0, TAU);
  ctx.fillStyle = 'rgba(255,205,240,0.16)';
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(tx, ty, tr - 1.5, 0, TAU);
  ctx.clip();
  const ly = ty + 4 + Math.sin(time * 3) * 1.2 + (a.fireT < 0.5 ? Math.sin(a.fireT * 40) * 2 * (1 - a.fireT / 0.5) : 0);
  ctx.beginPath();
  ctx.moveTo(tx - 40, ly);
  for (let x = tx - 40; x <= tx + 40; x += 4) ctx.lineTo(x, ly + Math.sin(x * 0.18 + time * 4) * 1.4);
  ctx.lineTo(tx + 40, ty + 40);
  ctx.lineTo(tx - 40, ty + 40);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, ly, 0, ty + 36, [
    [0, 'rgba(255,175,225,0.95)'],
    [1, 'rgba(235,70,160,0.97)'],
  ]);
  ctx.fill();
  for (let i = 0; i < 9; i++) {
    const ph = (time * (0.28 + i * 0.045) + i * 0.37) % 1;
    const bx = tx + Math.sin(i * 2.3) * 19 + Math.sin(time * 3 + i) * 2;
    const by = ty + 34 - ph * (ty + 34 - ly - 2);
    const br = 1.4 + (i % 3) * 1.1;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(tx, ty, tr, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(tx, ty, tr - 7, Math.PI * 1.08, Math.PI * 1.4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(tx + 17, ty + 17, 2.4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = cy(-96, -84);
  roundRect(ctx, tx - 22, -95, 44, 12, 5);
  ctx.fill();
  ctx.strokeStyle = '#146890';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = cy(-110, -94);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(tx, -100, 8, 5, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = cy(-20, -8);
  roundRect(ctx, tx - 15, -21, 30, 12, 3);
  ctx.fill();

  // body
  roundRect(ctx, -180, -14, 120, 44, 18);
  ctx.fillStyle = cy(-14, 30);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,70,100,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -180, -14, 120, 44, 18);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = -180; x <= -58; x += 3) {
    const y = 18 + Math.sin(x * 0.12) * 4;
    if (x === -180) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(-176, -10, 112, 3.5);
  ctx.restore();
  // fan vent
  const fx = -150;
  const fy = 8;
  ctx.fillStyle = '#0b2b3b';
  ctx.beginPath();
  ctx.arc(fx, fy, 12, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(fx, fy);
  ctx.rotate(a.fan);
  ctx.fillStyle = '#ffd1ea';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(5, 0, 5.5, 2.4, 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(fx, fy, 12, 0, TAU);
  ctx.stroke();

  // barrel
  roundRect(ctx, -64, -9, 52, 18, 7);
  ctx.fillStyle = pk(-9, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,10,60,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(-52, -9, 6, 18);
  ctx.fillRect(-38, -9, 6, 18);

  // wand ring + soap film
  ctx.strokeStyle = pk(-30, 30);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(-4, 0, 10, 26, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(-4, 0, 11.5, 27.5, 0, Math.PI * 1.1, Math.PI * 1.55);
  ctx.stroke();
  const sh = (time * 0.5) % 1;
  const fg = ctx.createLinearGradient(0, -22, 0, 22);
  const pal = ['255,140,225', '130,215,255', '255,245,150', '150,255,205', '255,140,225'];
  pal.forEach((c, i) => fg.addColorStop(Math.min(1, Math.max(0, ((i / (pal.length - 1) + sh) % 1.0001))), `rgba(${c},0.4)`));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.ellipse(-4, 0, 6.8, 22.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.restore();
  if (a.fireT < 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,240'), -4, 0, 80 * (1 - a.fireT / 0.4), 0.7 * (1 - a.fireT / 0.4));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── MERIAM BAMBU ─────────────────────────
const FIBERS: number[][] = (() => {
  const rnd = mulberry32(7);
  const out: number[][] = [];
  for (let i = 0; i < 80; i++) out.push([-rnd() * 236, (rnd() * 2 - 1) * 25, 14 + rnd() * 54, rnd()]);
  return out;
})();

function drawBamboo(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(BAMBOO_SCALE, BAMBOO_SCALE);

  // wooden handle
  polyPath(ctx, [-136, 20, -106, 20, -100, 70, -132, 78]);
  ctx.fillStyle = lin(ctx, -136, 0, -100, 0, [
    [0, '#4a2a10'],
    [0.5, '#a8703a'],
    [1, '#3a2008'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,14,4,0.35)';
  for (let i = 0; i < 4; i++) line(ctx, -130 + i * 7, 26, -126 + i * 7, 72);

  // tube
  const tube = () => {
    ctx.beginPath();
    ctx.moveTo(-242, -24);
    ctx.lineTo(-22, -25);
    ctx.quadraticCurveTo(-12, -26, -8, -30);
    ctx.lineTo(0, -30);
    ctx.lineTo(0, 30);
    ctx.lineTo(-8, 30);
    ctx.quadraticCurveTo(-12, 26, -22, 25);
    ctx.lineTo(-242, 24);
    ctx.closePath();
  };
  tube();
  ctx.fillStyle = lin(ctx, 0, -30, 0, 30, [
    [0, '#d3ee86'],
    [0.18, '#a6d048'],
    [0.5, '#6aa22c'],
    [0.82, '#3d731a'],
    [1, '#2a5410'],
  ]);
  ctx.fill();
  ctx.save();
  tube();
  ctx.clip();
  ctx.lineWidth = 1;
  for (const f of FIBERS) {
    ctx.strokeStyle = f[3] < 0.55 ? 'rgba(35,75,8,0.25)' : 'rgba(235,255,170,0.22)';
    line(ctx, f[0], f[1], f[0] + f[2], f[1]);
  }
  ctx.fillStyle = 'rgba(255,255,220,0.32)';
  ctx.fillRect(-242, -21, 242, 4);
  for (const nx of [-54, -124, -198]) {
    ctx.fillStyle = lin(ctx, nx - 4, 0, nx + 4, 0, [
      [0, '#46661a'],
      [0.5, '#9ab845'],
      [1, '#3a5414'],
    ]);
    ctx.fillRect(nx - 4, -31, 8, 62);
    ctx.fillStyle = 'rgba(30,50,5,0.55)';
    ctx.fillRect(nx - 4, -31, 1.4, 62);
    ctx.fillRect(nx + 2.6, -31, 1.4, 62);
  }
  ctx.restore();
  tube();
  ctx.strokeStyle = 'rgba(30,60,8,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // rope lashing
  ctx.save();
  ctx.beginPath();
  ctx.rect(-102, -31, 20, 62);
  ctx.clip();
  ctx.fillStyle = lin(ctx, -102, 0, -82, 0, [
    [0, '#7a5a2a'],
    [0.4, '#e2c08a'],
    [1, '#7a5a2a'],
  ]);
  ctx.fillRect(-102, -31, 20, 62);
  ctx.strokeStyle = 'rgba(80,50,20,0.85)';
  ctx.lineWidth = 1.4;
  for (let y = -36; y < 36; y += 4.4) line(ctx, -103, y, -81, y + 7);
  ctx.restore();
  ctx.strokeStyle = '#c9a063';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-92, 29);
  ctx.quadraticCurveTo(-96, 46, -88, 54);
  ctx.moveTo(-86, 29);
  ctx.quadraticCurveTo(-78, 42, -82, 58);
  ctx.stroke();

  // red plaque with gold emblem
  roundRect(ctx, -178, -19, 42, 38, 6);
  ctx.fillStyle = lin(ctx, 0, -19, 0, 19, [
    [0, '#ff6a5a'],
    [0.5, '#d1241f'],
    [1, '#7a0f0c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#ffd36b';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  const eg = ctx.createRadialGradient(-159, -2, 1, -157, 0, 11);
  eg.addColorStop(0, '#fff6cf');
  eg.addColorStop(0.55, '#e8ad34');
  eg.addColorStop(1, '#7a4506');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(-157, 0, 10.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(120,60,5,0.85)';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 3 : 7;
    const an = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(-157 + Math.cos(an) * r, Math.sin(an) * r);
  }
  ctx.closePath();
  ctx.fill();

  // muzzle lip + dark opening
  roundRect(ctx, -17, -33, 17, 66, 5);
  ctx.fillStyle = lin(ctx, -17, 0, 0, 0, [
    [0, '#9ec23e'],
    [0.55, '#dcf393'],
    [1, '#7c9f2c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,70,10,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  const og = ctx.createRadialGradient(-1, 0, 2, -1, 0, 30);
  og.addColorStop(0, '#0d0602');
  og.addColorStop(0.7, '#2a160a');
  og.addColorStop(1, '#4a2c12');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.ellipse(-1, 0, 7.5, 28, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#eefab0';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  if (a.fireT < 0.6) {
    const h = 1 - a.fireT / 0.6;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,140,40,${0.8 * h})`;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 7, 27, 0, 0, TAU);
    ctx.fill();
    drawSprite(ctx, glowSprite('255,160,60'), 0, 0, 110 * h, 0.7 * h);
    ctx.restore();
  }

  // fuse
  ctx.fillStyle = '#0c0603';
  ctx.beginPath();
  ctx.ellipse(-119, -25, 4.4, 2.6, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#e8c07a';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-119, -25);
  ctx.quadraticCurveTo(-128, -36, -122, -46);
  ctx.quadraticCurveTo(-117, -52, -124, -58);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(120,60,10,0.7)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  const idle = 0.25 + 0.25 * Math.sin(time * 9);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (a.fuse > 0) {
    drawSprite(ctx, glowSprite('255,190,80'), -124, -58, 34, 0.9);
    drawSprite(ctx, glowSprite('255,255,230'), -124, -58, 12, 1);
    drawSprite(ctx, starSprite('255,230,150'), -124, -58, 22 + Math.sin(time * 60) * 5, 0.9, time * 8);
  } else {
    drawSprite(ctx, glowSprite('255,150,50'), -124, -58, 10, idle);
  }
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── BANANA GUN ─────────────────────────
const FRECKLES: [number, number][] = [
  [-20, 0.1],
  [-34, -0.15],
  [-48, 0.22],
  [-62, -0.05],
  [-76, 0.3],
  [-88, 0.0],
  [-102, -0.2],
  [-116, 0.18],
  [-128, 0.34],
  [-142, -0.08],
  [-156, 0.2],
  [-170, 0.05],
];

function drawBananaGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(BANANA_SCALE, BANANA_SCALE);
  const cyOf = (x: number) => -18 * (1 - Math.pow((x + 100) / 100, 2));
  const wOf = (x: number) => 9 + 27 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, -x / 200))), 0.6);

  // peel grip (two strips)
  const peel = (ox: number, oy: number, fill: [string, string, string], inner: string) => {
    ctx.save();
    ctx.translate(ox, oy);
    ctx.beginPath();
    ctx.moveTo(-124, -6);
    ctx.quadraticCurveTo(-134, 30, -114, 62);
    ctx.quadraticCurveTo(-105, 74, -96, 62);
    ctx.quadraticCurveTo(-100, 30, -98, -6);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, -134, 0, -96, 0, [
      [0, fill[0]],
      [0.45, fill[1]],
      [1, fill[2]],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#8a5200';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-118, 4);
    ctx.quadraticCurveTo(-124, 30, -112, 56);
    ctx.quadraticCurveTo(-106, 62, -104, 54);
    ctx.quadraticCurveTo(-108, 30, -106, 4);
    ctx.closePath();
    ctx.fillStyle = inner;
    ctx.fill();
    ctx.fillStyle = '#5e3a10';
    ctx.beginPath();
    ctx.ellipse(-105, 65, 6.5, 4.4, 0.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  };
  peel(16, 3, ['#b87600', '#e0a800', '#8f5a00'], '#e8cf80');
  peel(0, 0, ['#e0a800', '#ffe430', '#b87600'], '#fff3b8');
  ctx.fillStyle = '#7a4a14';
  roundRect(ctx, -84, 4, 5, 16, 2.5);
  ctx.fill();

  // body
  const top: number[] = [];
  const bot: number[] = [];
  for (let x = 0; x >= -204; x -= 4) {
    top.push(x, cyOf(x) - wOf(x) / 2);
    bot.push(x, cyOf(x) + wOf(x) / 2);
  }
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(top[0], top[1]);
    for (let i = 2; i < top.length; i += 2) ctx.lineTo(top[i], top[i + 1]);
    for (let i = bot.length - 2; i >= 0; i -= 2) ctx.lineTo(bot[i], bot[i + 1]);
    ctx.closePath();
  };
  body();
  ctx.fillStyle = lin(ctx, 0, -48, 0, 22, [
    [0, '#fff7a8'],
    [0.28, '#ffe430'],
    [0.7, '#f5b800'],
    [1, '#b87600'],
  ]);
  ctx.fill();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#8a5200';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.save();
  body();
  ctx.clip();
  const offLine = (f: number, x0: number, x1: number) => {
    ctx.beginPath();
    for (let x = x0; x >= x1; x -= 4) {
      const y = cyOf(x) + f * wOf(x);
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  ctx.strokeStyle = 'rgba(150,90,0,0.3)';
  ctx.lineWidth = 6;
  offLine(0.4, 0, -204);
  ctx.strokeStyle = 'rgba(176,112,0,0.5)';
  ctx.lineWidth = 1.5;
  offLine(-0.2, 0, -204);
  offLine(0.16, 0, -204);
  ctx.strokeStyle = 'rgba(255,255,236,0.72)';
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  offLine(-0.3, -16, -186);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.3;
  offLine(-0.12, -24, -150);
  ctx.fillStyle = 'rgba(110,60,0,0.55)';
  for (const [fx, ff] of FRECKLES) {
    ctx.beginPath();
    ctx.ellipse(fx, cyOf(fx) + ff * wOf(fx), 1.9, 1.3, 0.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // brown muzzle tip
  const mg = ctx.createLinearGradient(0, -8, 0, 8);
  mg.addColorStop(0, '#7a4f1a');
  mg.addColorStop(1, '#2e1c07');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.ellipse(-3, 0, 9, 7.4, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#1e1204';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#0a0602';
  ctx.beginPath();
  ctx.ellipse(1, 0, 2.2, 5, 0, 0, TAU);
  ctx.fill();

  const ph = (time * 0.4) % 1;
  if (ph < 0.3) {
    const k = Math.sin((ph / 0.3) * Math.PI);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,240,160'), -34 - ph * 330, cyOf(-60) - 9, 26 * k, k, 0);
    ctx.restore();
  }
  if (a.fireT < 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,220,90'), 2, 0, 86 * (1 - a.fireT / 0.5), 0.8 * (1 - a.fireT / 0.5));
    ctx.restore();
  }
  ctx.restore();
}
