import { type Ctx, TAU, clamp, drawSprite, glowSprite, lin, makeBolt, makeCanvas, polyPath, roundRect } from './core';
import { GOLD_X, GOLD_Y, drawShell, drawSingularity, drawStone } from './art';
import { drawWeapon2 } from './weaponArt2';
import { drawWeapon6 } from './weaponArt6';
import { drawWeapon7 } from './weaponArt7';
import type { WeaponAnim, WeaponId } from './weapons';

const STONE_SHAPE = [8, 0.5, 5.6, 6, -1, 7.6, -6.6, 4.2, -7.6, -1.6, -3.4, -7, 3.6, -6.6];

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawWeapon(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'golden':
      return drawGolden(ctx, a, time);
    case 'blackhole':
      return drawStaff(ctx, a, time);
    case 'ketapel':
      return drawKetapel(ctx, a, time);
    case 'sumpit':
      return drawSumpit(ctx, a, time);
    case 'shotgun':
      return drawShotgun(ctx, a);
    case 'soaker':
      return drawSoaker(ctx, a, time);
    default:
      drawWeapon2(ctx, id, a, time);
      drawWeapon6(ctx, id, a, time);
      drawWeapon7(ctx, id, a, time);
      return;
  }
}

// ───────────────────────── GOLDEN GUN (desert-eagle style) ─────────────────────────
export const GOLDEN_SCALE = 0.92;
// The body and the sliding metal are detailed but mostly static. Bake the
// exact vector artwork at 3x once; keep the actual slide movement, shine sweep,
// chamber reveal and muzzle glow live on top. This removes the clipped grip's
// 88 strokes and repeated gradients from every gameplay frame.
interface GoldenLayer { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number }
interface GoldenLayers { body: GoldenLayer; slide: GoldenLayer }
let goldenLayers: GoldenLayers | undefined;
const GOLDEN_CACHE_SCALE = 3;

function bakeGoldenLayer(x: number, y: number, w: number, h: number, draw: (c: Ctx) => void): GoldenLayer | null {
  const canvas = makeCanvas(w * GOLDEN_CACHE_SCALE, h * GOLDEN_CACHE_SCALE);
  const c = canvas.getContext('2d');
  if (!c) return null;
  c.setTransform(GOLDEN_CACHE_SCALE, 0, 0, GOLDEN_CACHE_SCALE, -x * GOLDEN_CACHE_SCALE, -y * GOLDEN_CACHE_SCALE);
  draw(c);
  return { canvas, x, y, w, h };
}

function getGoldenLayers(ctx: Ctx): GoldenLayers | null {
  // A headless recording context must still see the actual paths, not a
  // throwaway shim canvas. Real browser and Skia canvases can reuse the art.
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement)) return null;
  if (goldenLayers) return goldenLayers;
  try {
    const body = bakeGoldenLayer(-158, -22, 162, 112, drawGoldenBody);
    const slide = bakeGoldenLayer(-134, -18, 72, 30, (c) => {
      // The live body sets round caps on the trigger before drawing the slide.
      c.lineCap = 'round';
      drawGoldenSlide(c, 0, 0);
    });
    if (body && slide) goldenLayers = { body, slide };
  } catch {
    // An unavailable offscreen canvas must not make the weapon disappear.
  }
  return goldenLayers ?? null;
}

function drawGoldenLayer(ctx: Ctx, layer: GoldenLayer) {
  ctx.drawImage(layer.canvas, layer.x, layer.y, layer.w, layer.h);
}

function drawGoldenBody(ctx: Ctx) {
  const gy = (y0: number, y1: number) => lin(ctx, 0, y0, 0, y1, GOLD_Y);
  // chamber (revealed when slide moves back)
  ctx.fillStyle = lin(ctx, 0, -8, 0, 6, [
    [0, '#c88a1a'],
    [0.5, '#7a4506'],
    [1, '#4a2803'],
  ]);
  ctx.fillRect(-86, -8, 26, 14);

  // grip
  const grip = [-102, 16, -110, 60, -116, 82, -150, 82, -152, 74, -141, 22, -139, 12, -153, 8, -151, 2, -134, 4];
  polyPath(ctx, grip);
  ctx.fillStyle = lin(ctx, -152, 0, -102, 0, GOLD_X);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,48,4,0.8)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  const panel = [-108, 26, -114, 62, -119, 76, -144, 76, -137, 26];
  polyPath(ctx, panel);
  ctx.fillStyle = lin(ctx, -144, 26, -110, 76, [
    [0, '#2a1206'],
    [0.5, '#4d2711'],
    [1, '#1e0d04'],
  ]);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,200,120,0.13)';
  ctx.lineWidth = 0.6;
  for (let i = -70; i < 70; i += 3.2) {
    line(ctx, -150 + i, 20, -110 + i, 82);
    line(ctx, -110 + i, 20, -150 + i, 82);
  }
  ctx.restore();
  // medallion
  const mg = ctx.createRadialGradient(-128, 46, 0.5, -127, 48, 6);
  mg.addColorStop(0, '#fff6cf');
  mg.addColorStop(0.5, '#e8ad34');
  mg.addColorStop(1, '#7a4506');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(-127, 48, 5.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(110,60,5,0.85)';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 1.4 : 3.4;
    const an = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(-127 + Math.cos(an) * r, 48 + Math.sin(an) * r);
  }
  ctx.closePath();
  ctx.fill();

  // frame
  polyPath(ctx, [-60, 8, -54, 10, -55, 20, -102, 20, -136, 15, -136, 8]);
  ctx.fillStyle = gy(8, 20);
  ctx.fill();
  // trigger guard
  ctx.strokeStyle = gy(19, 43);
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-66, 19);
  ctx.quadraticCurveTo(-64, 42, -84, 41);
  ctx.lineTo(-95, 41);
  ctx.quadraticCurveTo(-104, 40, -104, 21);
  ctx.stroke();
  ctx.strokeStyle = '#a8650c';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-86, 21);
  ctx.quadraticCurveTo(-81, 30, -86, 37);
  ctx.stroke();

  // barrel block
  polyPath(ctx, [0, -11, 0, 8, -66, 8, -66, -11]);
  ctx.fillStyle = gy(-11, 8);
  ctx.fill();
  ctx.fillStyle = 'rgba(90,50,5,0.5)';
  ctx.fillRect(-2.4, -11, 2.4, 19);
  ctx.fillStyle = '#2a1500';
  ctx.fillRect(-0.9, -3.6, 0.9, 6);
  ctx.strokeStyle = 'rgba(255,244,200,0.55)';
  ctx.lineWidth = 0.8;
  line(ctx, -64, 3.6, -3, 3.6);
  // rail
  ctx.fillStyle = gy(-15, -11);
  ctx.fillRect(-63, -14.6, 60, 3.8);
  ctx.fillStyle = 'rgba(90,48,4,0.8)';
  for (let x = -60; x < -6; x += 4.5) ctx.fillRect(x, -14.6, 1.6, 2.3);
  polyPath(ctx, [-10, -14.5, -5, -14.5, -5.6, -19, -9.2, -19]);
  ctx.fillStyle = gy(-19, -14);
  ctx.fill();
  // engravings
  ctx.strokeStyle = 'rgba(120,64,4,0.6)';
  ctx.lineWidth = 0.7;
  for (const [ex, ey] of [
    [-52, -2],
    [-33, -1.5],
    [-15, -2],
  ]) {
    ctx.beginPath();
    for (let th = 0; th < TAU * 1.7; th += 0.25) {
      const r = 0.3 + th * 0.42;
      const px = ex + Math.cos(th) * r;
      const py = ey + Math.sin(th) * r * 0.8;
      if (th === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex + 5, ey + 3);
    ctx.quadraticCurveTo(ex + 9, ey - 3, ex + 13, ey + 1);
    ctx.stroke();
  }
}

function drawGoldenSlide(ctx: Ctx, sx: number, slide: number) {
  const gy = (y0: number, y1: number) => lin(ctx, 0, y0, 0, y1, GOLD_Y);
  polyPath(ctx, [-64, -12, -64, 9, -128, 9, -131, 5, -131, -9, -128, -12]);
  ctx.fillStyle = gy(-12, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,55,4,0.75)';
  ctx.lineWidth = 1;
  for (let x = -125; x <= -108; x += 2.6) line(ctx, x, -10, x, 6);
  ctx.fillStyle = '#2b1702';
  roundRect(ctx, -98, -9.5, 22, 8, 1.5);
  ctx.fill();
  if (slide > 0.25) {
    ctx.fillStyle = lin(ctx, 0, -9, 0, -2, GOLD_Y);
    ctx.fillRect(-94 + sx * 0.4, -8.6, 13, 6);
  }
  ctx.fillStyle = gy(-16, -12);
  ctx.fillRect(-128, -15.5, 8, 3.6);
  ctx.strokeStyle = 'rgba(255,244,200,0.45)';
  ctx.lineWidth = 0.8;
  line(ctx, -128, 2.5, -66, 2.5);
}

function drawGolden(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(GOLDEN_SCALE, GOLDEN_SCALE);
  const sx = a.slide * 17;
  const gy = (y0: number, y1: number) => lin(ctx, 0, y0, 0, y1, GOLD_Y);
  const layers = getGoldenLayers(ctx);
  if (layers) drawGoldenLayer(ctx, layers.body);
  else drawGoldenBody(ctx);

  // The slide remains independently animated. The brass chamber only appears
  // on its live frame, inside the open ejection port.
  ctx.save();
  ctx.translate(-sx, 0);
  if (layers) {
    drawGoldenLayer(ctx, layers.slide);
    if (a.slide > 0.25) {
      ctx.fillStyle = lin(ctx, 0, -9, 0, -2, GOLD_Y);
      ctx.fillRect(-94 + sx * 0.4, -8.6, 13, 6);
    }
  } else drawGoldenSlide(ctx, sx, a.slide);
  ctx.restore();
  // hammer
  polyPath(ctx, [-134, -5, -141, -12, -145, -10, -139, -2]);
  ctx.fillStyle = '#b8781a';
  ctx.fill();
  ctx.fillStyle = gy(82, 86);
  ctx.fillRect(-151, 82, 36, 4);

  // shine sweep
  const ph = (time * 0.42) % 1;
  if (ph < 0.5) {
    const gx = -170 + (ph / 0.5) * 200;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-66, -15, 66, 23);
    ctx.rect(-131 - sx, -12, 67, 21);
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const sg = ctx.createLinearGradient(gx - 12, 0, gx + 12, 0);
    sg.addColorStop(0, 'rgba(255,255,255,0)');
    sg.addColorStop(0.5, 'rgba(255,250,220,0.6)');
    sg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.moveTo(gx - 6, -16);
    ctx.lineTo(gx + 14, -16);
    ctx.lineTo(gx + 2, 12);
    ctx.lineTo(gx - 18, 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  // muzzle heat glow
  if (a.fireT < 0.6) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,170,60'), -2, -1, 30, 0.6 * (1 - a.fireT / 0.6));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── BLACK HOLE STAFF ─────────────────────────
function drawStaff(ctx: Ctx, a: WeaponAnim, time: number) {
  const sw = 5;
  ctx.fillStyle = lin(ctx, -sw, 0, sw, 0, [
    [0, '#0d0617'],
    [0.35, '#3b2163'],
    [0.5, '#6f4aab'],
    [0.65, '#2c1650'],
    [1, '#0a0412'],
  ]);
  ctx.fillRect(-sw, 34, sw * 2, 210);
  ctx.save();
  ctx.beginPath();
  ctx.rect(-sw, 34, sw * 2, 210);
  ctx.clip();
  ctx.strokeStyle = 'rgba(170,110,255,0.35)';
  ctx.lineWidth = 1;
  for (let y = 30; y < 250; y += 9) line(ctx, -sw, y, sw, y + 6);
  ctx.restore();
  for (let i = 0; i < 4; i++) {
    const y = 64 + i * 40;
    const pulse = clamp(0.5 + 0.45 * Math.sin(time * 4 - i * 0.9) + a.charge * 0.7, 0, 1.4);
    ctx.fillStyle = lin(ctx, -sw - 1, 0, sw + 1, 0, [
      [0, '#3a1a6a'],
      [0.5, '#e2b8ff'],
      [1, '#3a1a6a'],
    ]);
    ctx.fillRect(-sw - 1.2, y, sw * 2 + 2.4, 4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('180,100,255'), 0, y + 2, 34, 0.35 * pulse);
    ctx.restore();
  }
  // collar
  polyPath(ctx, [-15, 22, 15, 22, 10.5, 38, -10.5, 38]);
  ctx.fillStyle = lin(ctx, -15, 0, 15, 0, [
    [0, '#140a24'],
    [0.45, '#7a52b8'],
    [0.6, '#3a2068'],
    [1, '#100720'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,180,255,0.6)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // gem
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('200,120,255'), 0, 30, 22, 0.7 + a.charge * 0.3);
  ctx.restore();
  ctx.fillStyle = '#e0b0ff';
  ctx.beginPath();
  ctx.moveTo(0, 25.5);
  ctx.lineTo(3.4, 30);
  ctx.lineTo(0, 34.5);
  ctx.lineTo(-3.4, 30);
  ctx.closePath();
  ctx.fill();
  // claws
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 6, 25);
    ctx.bezierCurveTo(s * 28, 12, s * 26, -12, s * 12, -25);
    ctx.bezierCurveTo(s * 20, -10, s * 19, 10, s * 2, 22);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, s * 2, 0, s * 26, 0, [
      [0, '#1a0e2e'],
      [0.6, '#6d47a8'],
      [1, '#24123f'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(205,160,255,0.55)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  // orb
  const orbR = 13 * a.orb * (1 + a.charge * 0.4);
  if (orbR > 0.6) drawSingularity(ctx, 0, 0, orbR, time * 1.4, 0.8 + a.charge * 0.6);
  // crackling lightning between claws and orb
  if (Math.random() < 0.28 + a.charge * 0.72) {
    const n = a.charge > 0.2 ? 2 : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      const s = Math.random() < 0.5 ? -1 : 1;
      const ang = Math.random() * TAU;
      const pts = makeBolt(s * (12 + Math.random() * 8), -22 + Math.random() * 34, Math.cos(ang) * orbR * 0.8, Math.sin(ang) * orbR * 0.8, 0.35, 4);
      for (const [w, c] of [
        [4, 'rgba(170,100,255,0.3)'],
        [1.6, 'rgba(210,160,255,0.85)'],
        [0.6, 'rgba(255,255,255,0.95)'],
      ] as [number, string][]) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

// ───────────────────────── KETAPEL (slingshot) ─────────────────────────
function woodGrad(ctx: Ctx, x0: number, x1: number) {
  return lin(ctx, x0, 0, x1, 0, [
    [0, '#3d220d'],
    [0.3, '#a8703a'],
    [0.45, '#dba56b'],
    [0.7, '#7a4a20'],
    [1, '#33190a'],
  ]);
}

function drawKetapel(ctx: Ctx, a: WeaponAnim, time: number) {
  // handle
  ctx.fillStyle = woodGrad(ctx, -8.5, 8.5);
  ctx.beginPath();
  ctx.moveTo(-8.5, 34);
  ctx.lineTo(8.5, 34);
  ctx.lineTo(7.5, 168);
  ctx.quadraticCurveTo(0, 176, -7.5, 168);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(50,25,8,0.6)';
  ctx.beginPath();
  ctx.ellipse(-2.5, 62, 1.6, 2.6, 0, 0, TAU);
  ctx.fill();
  // leather wrap
  ctx.save();
  roundRect(ctx, -9.4, 80, 18.8, 72, 4);
  ctx.fillStyle = lin(ctx, -9.4, 0, 9.4, 0, [
    [0, '#2e1a0c'],
    [0.4, '#7a4e2c'],
    [0.55, '#9e6e43'],
    [1, '#2a160a'],
  ]);
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(30,15,5,0.75)';
  ctx.lineWidth = 1.3;
  for (let y = 74; y < 160; y += 6.5) line(ctx, -10, y, 10, y + 5);
  ctx.strokeStyle = 'rgba(255,220,170,0.2)';
  ctx.lineWidth = 0.7;
  for (let y = 75.5; y < 160; y += 6.5) line(ctx, -10, y + 1.4, 10, y + 6.4);
  ctx.restore();
  // fork arms
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 8.5, 38);
    ctx.bezierCurveTo(s * 12, 20, s * 34, 14, s * 35.5, -4);
    ctx.lineTo(s * 25, -4);
    ctx.bezierCurveTo(s * 24, 8, s * 6, 14, 0, 26);
    ctx.closePath();
    ctx.fillStyle = woodGrad(ctx, s > 0 ? 4 : -36, s > 0 ? 36 : -4);
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,10,0.45)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(s * 5, 30);
    ctx.bezierCurveTo(s * 16, 16, s * 28, 10, s * 30, -2);
    ctx.stroke();
    // tip groove + band wrap
    ctx.fillStyle = '#8f1515';
    ctx.fillRect(s > 0 ? 24.6 : -35.6, -2.5, 11, 4.6);
    ctx.fillStyle = 'rgba(255,140,140,0.5)';
    ctx.fillRect(s > 0 ? 24.6 : -35.6, -2.5, 11, 1.2);
  }
  ctx.fillStyle = woodGrad(ctx, -8.5, 8.5);
  ctx.beginPath();
  ctx.moveTo(-8.5, 40);
  ctx.quadraticCurveTo(0, 22, 8.5, 40);
  ctx.closePath();
  ctx.fill();

  // bands + pouch
  const py = a.pouchY;
  const wob = a.bandWob * Math.sin(time * 70);
  for (const s of [-1, 1]) {
    const tx = s * 30;
    const ty = 0;
    const ex = s * 9;
    const ey = py;
    const len = Math.hypot(ex - tx, ey - ty);
    const w = clamp(5.4 - len * 0.04, 2.2, 5);
    const mx = (tx + ex) / 2 + wob * s;
    const my = (ty + ey) / 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#a3121a';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,120,120,0.75)';
    ctx.lineWidth = w * 0.35;
    ctx.beginPath();
    ctx.moveTo(tx, ty - w * 0.2);
    ctx.quadraticCurveTo(mx, my - w * 0.2, ex, ey - w * 0.2);
    ctx.stroke();
  }
  if (a.loaded) {
    ctx.save();
    ctx.translate(0, py - 2.5);
    drawStone(ctx, STONE_SHAPE, 8);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.moveTo(-12.5, py - 3);
  ctx.quadraticCurveTo(0, py + 9, 12.5, py - 3);
  ctx.lineTo(10.5, py + 2.5);
  ctx.quadraticCurveTo(0, py + 13, -10.5, py + 2.5);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, py - 3, 0, py + 12, [
    [0, '#9a6a40'],
    [0.5, '#6b4226'],
    [1, '#3a2010'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,15,5,0.8)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,230,190,0.6)';
  for (let i = -3; i <= 3; i++) ctx.fillRect(i * 3 - 0.4, py + 4.5 - Math.abs(i) * 0.9, 0.9, 0.9);
}

// ───────────────────────── SUMPIT DAYAK (blowpipe) ─────────────────────────
function drawSumpit(ctx: Ctx, a: WeaponAnim, time: number) {
  const bot = 250;
  ctx.fillStyle = lin(ctx, -5.8, 0, 5.8, 0, [
    [0, '#1a0904'],
    [0.25, '#5a2a12'],
    [0.42, '#a8663c'],
    [0.56, '#6e3519'],
    [1, '#160803'],
  ]);
  ctx.beginPath();
  ctx.moveTo(-4.6, 0);
  ctx.lineTo(4.6, 0);
  ctx.lineTo(5.8, bot);
  ctx.lineTo(-5.8, bot);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,8,2,0.35)';
  ctx.lineWidth = 0.5;
  line(ctx, -2, 0, -2.6, bot);
  line(ctx, 2.4, 0, 3, bot);
  // Dayak motif band
  ctx.fillStyle = 'rgba(15,5,2,0.55)';
  ctx.fillRect(-5, 62, 10, 42);
  ctx.strokeStyle = '#f1e3c4';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  for (let y = 64, i = 0; y <= 102; y += 3, i++) {
    if (i === 0) ctx.moveTo(-3, y);
    else ctx.lineTo(i % 2 ? 3 : -3, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#e63946';
  for (let y = 67; y < 102; y += 6) {
    ctx.beginPath();
    ctx.arc(-3.4, y, 0.9, 0, TAU);
    ctx.arc(3.4, y + 3, 0.9, 0, TAU);
    ctx.fill();
  }
  // rattan bindings
  const binding = (y: number, h: number) => {
    ctx.fillStyle = lin(ctx, -6.3, 0, 6.3, 0, [
      [0, '#7a5a2a'],
      [0.45, '#f2d495'],
      [1, '#6a4a20'],
    ]);
    ctx.fillRect(-6.3, y, 12.6, h);
    ctx.strokeStyle = 'rgba(90,60,25,0.8)';
    ctx.lineWidth = 0.6;
    for (let x = -6; x < 6; x += 2) line(ctx, x, y, x + 2, y + h);
  };
  binding(118, 7);
  binding(168, 7);
  binding(218, 7);
  // muzzle ring
  ctx.fillStyle = lin(ctx, -5.6, 0, 5.6, 0, [
    [0, '#8a7a5a'],
    [0.45, '#f6eed8'],
    [1, '#7a6a4a'],
  ]);
  ctx.fillRect(-5.4, -2, 10.8, 6);
  ctx.fillStyle = '#120804';
  ctx.fillRect(-1.5, -2.6, 3, 1.3);
  // spear blade (sangkoh)
  ctx.save();
  ctx.translate(9.5, 0);
  ctx.fillStyle = lin(ctx, -2, 0, 2, 0, [
    [0, '#2a2d31'],
    [0.5, '#7d848c'],
    [1, '#25282c'],
  ]);
  ctx.fillRect(-2, -2, 4, 28);
  ctx.beginPath();
  ctx.moveTo(0, -40);
  ctx.quadraticCurveTo(7.5, -19, 4.5, -4);
  ctx.lineTo(1.6, 0);
  ctx.lineTo(-1.6, 0);
  ctx.lineTo(-4.5, -4);
  ctx.quadraticCurveTo(-7.5, -19, 0, -40);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -7, 0, 7, 0, [
    [0, '#5b6570'],
    [0.47, '#f0f6fc'],
    [0.53, '#9aa6b2'],
    [1, '#4a535c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,70,80,0.6)';
  line(ctx, 0, -35, 0, -2);
  const gl = (time * 0.35) % 1;
  if (gl < 0.25) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('230,240,255'), 0, -36 + (gl / 0.25) * 32, 12, 0.6);
    ctx.restore();
  }
  ctx.restore();
  // lashing
  ctx.save();
  ctx.beginPath();
  ctx.rect(-6.4, 6, 18.6, 20);
  ctx.clip();
  ctx.fillStyle = lin(ctx, -6.4, 0, 12, 0, [
    [0, '#7a5a2a'],
    [0.4, '#e6c483'],
    [1, '#7a5a2a'],
  ]);
  ctx.fillRect(-6.4, 6, 18.6, 20);
  ctx.strokeStyle = 'rgba(90,60,25,0.85)';
  ctx.lineWidth = 0.7;
  for (let y = 2; y < 30; y += 2.4) line(ctx, -7, y, 13, y + 4);
  ctx.restore();
  // tassel
  const ang = a.tassel + Math.sin(time * 2.1) * 0.07;
  const ax = 12;
  const ay = 25;
  for (let i = 0; i < 12; i++) {
    const off = (i - 5.5) * 0.045;
    const L = 30 + (i % 3) * 4;
    const ex = ax + Math.sin(ang + off) * L;
    const ey = ay + Math.cos(ang + off) * L;
    const cx = ax + Math.sin(ang * 0.4 + off * 0.5) * L * 0.5;
    const cy = ay + L * 0.55;
    ctx.strokeStyle = i % 2 ? '#d62839' : '#9d0208';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd166';
  ctx.beginPath();
  ctx.arc(ax, ay, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#1b1b1b';
  ctx.beginPath();
  ctx.arc(ax, ay, 1.8, 0, TAU);
  ctx.fill();
  // breath pressure pulse travelling up the pipe
  if (a.pulse >= 0 && a.pulse <= 1) {
    const y = 170 - a.pulse * 170;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,236,200'), 0, y, 30, 0.75);
    drawSprite(ctx, glowSprite('255,255,255'), 0, y, 12, 0.8);
    ctx.restore();
  }
}

// ───────────────────────── SHOTGUN (pump action) ─────────────────────────
export const SHOTGUN_SCALE = 0.86;
function drawShotgun(ctx: Ctx, a: WeaponAnim) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(SHOTGUN_SCALE, SHOTGUN_SCALE);
  const pumpOff = -a.pump * 26;
  // stock
  polyPath(ctx, [-176, -10, -195, -8, -280, -4, -330, -9, -334, 30, -318, 34, -280, 24, -222, 26, -194, 30, -176, 16]);
  ctx.fillStyle = lin(ctx, 0, -10, 0, 34, [
    [0, '#6b3a17'],
    [0.3, '#ae6f33'],
    [0.6, '#6e3a14'],
    [1, '#3a1d08'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,18,4,0.35)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-180, -4 + i * 5);
    ctx.bezierCurveTo(-220, -2 + i * 6, -260, 4 + i * 4, -330, i * 6);
    ctx.stroke();
  }
  // receiver
  polyPath(ctx, [-104, -6, -108, -10, -176, -10, -176, 16, -104, 16]);
  ctx.fillStyle = lin(ctx, 0, -10, 0, 16, [
    [0, '#5a606b'],
    [0.18, '#a3aab6'],
    [0.4, '#2c3036'],
    [0.8, '#1a1c20'],
    [1, '#3a3f47'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = 0.8;
  line(ctx, -172, 7, -110, 7);
  ctx.fillStyle = '#8a919b';
  for (const px of [-120, -164]) {
    ctx.beginPath();
    ctx.arc(px, 11, 1.4, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#07080a';
  roundRect(ctx, -160, -7, 28, 9, 1.5);
  ctx.fill();
  if (a.pump > 0.35) {
    ctx.save();
    ctx.translate(-146 - a.pump * 4, -2.5);
    ctx.rotate(Math.PI / 2);
    ctx.scale(0.75, 0.75);
    drawShell(ctx);
    ctx.restore();
  }
  // trigger
  ctx.strokeStyle = '#202328';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(-130, 16);
  ctx.quadraticCurveTo(-130, 32, -142, 33);
  ctx.lineTo(-156, 33);
  ctx.quadraticCurveTo(-163, 32, -163, 16);
  ctx.stroke();
  ctx.strokeStyle = '#4b5059';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-144, 17);
  ctx.quadraticCurveTo(-140, 24, -144, 29);
  ctx.stroke();
  // magazine tube
  ctx.fillStyle = lin(ctx, 0, 3, 0, 11, [
    [0, '#6c727c'],
    [0.35, '#b6bcc6'],
    [1, '#25282d'],
  ]);
  ctx.fillRect(-106, 3.5, 98, 7.5);
  ctx.fillStyle = '#3a3f46';
  ctx.fillRect(-11, 2.5, 4.5, 9.5);
  // barrel
  ctx.fillStyle = lin(ctx, 0, -5, 0, 3.5, [
    [0, '#7d8590'],
    [0.3, '#d6dce4'],
    [0.6, '#4a5059'],
    [1, '#202328'],
  ]);
  ctx.fillRect(-106, -5, 106, 8.5);
  ctx.fillStyle = '#5c636d';
  ctx.fillRect(-4.5, -6, 4.5, 10.5);
  ctx.fillStyle = '#ffd76a';
  ctx.beginPath();
  ctx.arc(-3, -7.4, 1.5, 0, TAU);
  ctx.fill();
  // heat shield
  ctx.fillStyle = lin(ctx, 0, -10.5, 0, -1.5, [
    [0, '#5a606a'],
    [0.4, '#2a2e34'],
    [1, '#121417'],
  ]);
  roundRect(ctx, -96, -10.5, 84, 9, 2.5);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const x = -89 + i * 10;
    ctx.fillStyle = '#050506';
    ctx.beginPath();
    ctx.ellipse(x, -6, 3, 2.3, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,210,220,0.38)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(x, -6, 3, 2.3, 0, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  // pump forend
  ctx.save();
  ctx.translate(pumpOff, 0);
  roundRect(ctx, -84, 0.5, 44, 15.5, 4);
  ctx.fillStyle = lin(ctx, 0, 0.5, 0, 16, [
    [0, '#8a5328'],
    [0.3, '#cc8e50'],
    [0.65, '#7a4520'],
    [1, '#3d1e0a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,18,5,0.7)';
  ctx.lineWidth = 1.1;
  for (let x = -79; x < -44; x += 4) line(ctx, x, 2.5, x, 14);
  ctx.restore();
  // hot barrel glow
  if (a.fireT < 1.4) {
    const h = Math.max(0, 1 - a.fireT / 1.4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,120,30'), -3, -1, 34, 0.7 * h);
    ctx.fillStyle = `rgba(255,110,30,${0.35 * h})`;
    ctx.fillRect(-30, -5, 28, 8.5);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── SUPER SOAKER ─────────────────────────
export const SOAKER_SCALE = 0.88;
function drawSoaker(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(SOAKER_SCALE, SOAKER_SCALE);
  const pumpOff = a.pumpS * 14;
  // grip
  polyPath(ctx, [-138, 10, -146, 60, -152, 64, -166, 62, -168, 54, -160, 10]);
  ctx.fillStyle = lin(ctx, -168, 0, -138, 0, [
    [0, '#1c5e12'],
    [0.5, '#52bb33'],
    [1, '#1f6a14'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,50,5,0.5)';
  ctx.lineWidth = 1;
  for (let y = 22; y < 58; y += 6) line(ctx, -147 - y * 0.12, y, -163 - y * 0.06, y);
  // trigger + guard
  polyPath(ctx, [-128, 12, -125, 27, -130, 30, -136, 13]);
  ctx.fillStyle = '#ff8c00';
  ctx.fill();
  ctx.strokeStyle = '#2a8a1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-116, 11);
  ctx.quadraticCurveTo(-114, 34, -128, 36);
  ctx.lineTo(-140, 34);
  ctx.stroke();
  // rear body
  roundRect(ctx, -178, -12, 64, 26, 11);
  ctx.fillStyle = lin(ctx, 0, -12, 0, 14, [
    [0, '#a6ef6c'],
    [0.25, '#6cd136'],
    [0.6, '#349a1f'],
    [1, '#18520c'],
  ]);
  ctx.fill();
  // barrel body
  roundRect(ctx, -124, -11, 112, 22, 10);
  ctx.fillStyle = lin(ctx, 0, -11, 0, 11, [
    [0, '#c2fa8a'],
    [0.18, '#82de47'],
    [0.55, '#3a9f22'],
    [1, '#1b5c0e'],
  ]);
  ctx.fill();
  ctx.fillStyle = lin(ctx, 0, -1.6, 0, 1.6, [
    [0, '#ffd23f'],
    [1, '#ff9f1c'],
  ]);
  ctx.fillRect(-112, -1.6, 92, 3.2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  roundRect(ctx, -118, -9.5, 100, 2.6, 1.3);
  ctx.fill();
  // nozzle
  polyPath(ctx, [-12, -7, 0, -3.6, 0, 3.6, -12, 7]);
  ctx.fillStyle = lin(ctx, 0, -7, 0, 7, [
    [0, '#ffd166'],
    [0.4, '#ff9f1c'],
    [1, '#c25e00'],
  ]);
  ctx.fill();
  ctx.fillStyle = '#ffe066';
  ctx.fillRect(-1.6, -3.8, 2.2, 7.6);
  // pump handle
  ctx.save();
  ctx.translate(-pumpOff, 0);
  ctx.fillStyle = '#9aa3ad';
  ctx.fillRect(-40, 12, 26, 3);
  roundRect(ctx, -94, 9, 54, 15, 6);
  ctx.fillStyle = lin(ctx, 0, 9, 0, 24, [
    [0, '#ffbd5c'],
    [0.45, '#ff8c00'],
    [1, '#b35400'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,50,0,0.6)';
  ctx.lineWidth = 1;
  for (let x = -88; x < -44; x += 5) line(ctx, x, 11.5, x, 21.5);
  ctx.restore();
  // tank
  const tx0 = -152;
  const tx1 = -58;
  const ty0 = -46;
  const ty1 = -12;
  ctx.fillStyle = '#ff8c00';
  ctx.fillRect(-140, -13, 8, 4);
  ctx.fillRect(-82, -13, 8, 4);
  roundRect(ctx, tx0, ty0, tx1 - tx0, ty1 - ty0, 12);
  ctx.fillStyle = 'rgba(70,150,255,0.25)';
  ctx.fill();
  ctx.save();
  ctx.clip();
  const level = tx0 + (tx1 - tx0) * (0.1 + 0.82 * clamp(a.water, 0, 1));
  ctx.beginPath();
  ctx.moveTo(tx0 - 2, ty0 - 2);
  for (let y = ty0 - 2; y <= ty1 + 2; y += 2) {
    const wv = Math.sin(y * 0.22 + time * 9) * a.slosh * 3.2 + Math.sin(y * 0.11 - time * 5) * (0.7 + a.slosh * 2);
    ctx.lineTo(level + wv, y);
  }
  ctx.lineTo(tx0 - 2, ty1 + 2);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, ty0, 0, ty1, [
    [0, 'rgba(130,210,255,0.9)'],
    [1, 'rgba(25,95,225,0.92)'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(230,248,255,0.85)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  for (let y = ty0; y <= ty1; y += 2) {
    const wv = Math.sin(y * 0.22 + time * 9) * a.slosh * 3.2 + Math.sin(y * 0.11 - time * 5) * (0.7 + a.slosh * 2);
    if (y === ty0) ctx.moveTo(level + wv, y);
    else ctx.lineTo(level + wv, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 6; i++) {
    const ph = (time * (0.45 + i * 0.07) + i * 0.23) % 1;
    const bx = tx0 + 5 + ph * Math.max(4, level - tx0 - 8);
    const by = ty0 + 6 + ((i * 7.3) % (ty1 - ty0 - 12));
    ctx.beginPath();
    ctx.arc(bx, by + Math.sin(time * 6 + i) * 1.2, 1 + (i % 2) * 0.8, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
  roundRect(ctx, tx0, ty0, tx1 - tx0, ty1 - ty0, 12);
  ctx.strokeStyle = 'rgba(185,228,255,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  roundRect(ctx, tx0 + 9, ty0 + 3.5, tx1 - tx0 - 18, 3.2, 1.6);
  ctx.fill();
  roundRect(ctx, -147, -53, 14, 8, 2);
  ctx.fillStyle = '#ff8c00';
  ctx.fill();
  // pressure gauge
  const gx = -150;
  const gyy = 1;
  ctx.fillStyle = '#c9d1d9';
  ctx.beginPath();
  ctx.arc(gx, gyy, 8.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(gx, gyy, 6.8, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.6;
  for (let i = 0; i <= 6; i++) {
    const an = Math.PI * 0.75 + (i / 6) * Math.PI * 1.5;
    line(ctx, gx + Math.cos(an) * 5, gyy + Math.sin(an) * 5, gx + Math.cos(an) * 6.3, gyy + Math.sin(an) * 6.3);
  }
  ctx.strokeStyle = '#ff2d2d';
  ctx.beginPath();
  ctx.arc(gx, gyy, 5.6, Math.PI * 0.75 + Math.PI * 1.2, Math.PI * 2.25);
  ctx.stroke();
  const na = Math.PI * 0.75 + clamp(a.gauge, 0, 1) * Math.PI * 1.5 + Math.sin(time * 40) * 0.02;
  ctx.strokeStyle = '#d00000';
  ctx.lineWidth = 1.1;
  line(ctx, gx, gyy, gx + Math.cos(na) * 5.4, gyy + Math.sin(na) * 5.4);
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(gx, gyy, 1.2, 0, TAU);
  ctx.fill();
  ctx.restore();
}
