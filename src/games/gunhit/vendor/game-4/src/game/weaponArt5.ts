import { type Ctx, TAU, clamp, drawSprite, glowSprite, lin, makeBolt, mulberry32, polyPath, roundRect, starSprite } from './core';
import { PAINT, RAINBOW, crescentPath, drawCloud, drawElectricOrb, drawGoldStar, drawRainbowArc, drawSandal, strokeBolt } from './shapes5';
import type { WeaponAnim, WeaponId } from './weapons';

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
const goldG = (ctx: Ctx, x0: number, x1: number) =>
  lin(ctx, x0, 0, x1, 0, [
    [0, '#6b3a05'],
    [0.25, '#e3a52c'],
    [0.45, '#fff3c4'],
    [0.65, '#f2bf45'],
    [1, '#5e3204'],
  ]);
const steelG = (ctx: Ctx, x0: number, x1: number) =>
  lin(ctx, x0, 0, x1, 0, [
    [0, '#4a515c'],
    [0.3, '#c8cfd8'],
    [0.5, '#f4f7fa'],
    [0.75, '#8a919c'],
    [1, '#3c424c'],
  ]);

export function drawWeapon5(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'moonbeam':
      return drawMoonbeam(ctx, a, time);
    case 'storm':
      return drawStormCaller(ctx, a, time);
    case 'pencil':
      return drawPencilGun(ctx, a, time);
    case 'sandal':
      return drawSandalLauncher(ctx, a, time);
    case 'paintball':
      return drawPaintballGun(ctx, a, time);
    case 'wand':
      return drawMagicWand(ctx, a, time);
    case 'shark':
      return drawSharkLauncher(ctx, a, time);
    case 'ghost':
      return drawGhostGun(ctx, a, time);
    case 'ufo':
      return drawUfoRay(ctx, a, time);
    case 'rainbow':
      return drawRainbowGun(ctx, a, time);
    case 'meteor':
      return drawMeteorLauncher(ctx, a, time);
    case 'diamond':
      return drawDiamondGun(ctx, a, time);
    default:
      return;
  }
}

// ───────────────────────── MOONBEAM ─────────────────────────
function drawMoonbeam(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const en = clamp(0.6 + 0.2 * Math.sin(time * 2.4) + ch * 0.9 + hot * 0.8, 0, 1.7);
  ctx.save();
  ctx.scale(0.9, 0.9);
  // shaft
  roundRect(ctx, -6.5, 34, 13, 280, 6);
  ctx.fillStyle = lin(ctx, -6.5, 0, 6.5, 0, [
    [0, '#24104e'],
    [0.3, '#6a46c8'],
    [0.5, '#b79cff'],
    [0.72, '#4f2fa6'],
    [1, '#1e0e44'],
  ]);
  ctx.fill();
  ctx.save();
  roundRect(ctx, -6.5, 34, 13, 280, 6);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,225,140,0.5)';
  ctx.lineWidth = 1.1;
  for (let y = 40; y < 320; y += 11) line(ctx, -7, y, 7, y + 6);
  ctx.restore();
  ctx.strokeStyle = 'rgba(15,5,40,0.85)';
  ctx.lineWidth = 1;
  roundRect(ctx, -6.5, 34, 13, 280, 6);
  ctx.stroke();
  for (const y of [88, 150, 212]) {
    roundRect(ctx, -9.5, y, 19, 10, 3);
    ctx.fillStyle = goldG(ctx, -9.5, 9.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,50,0,0.8)';
    ctx.stroke();
  }
  ctx.fillStyle = '#7ad8ff';
  ctx.beginPath();
  ctx.arc(0, 119, 3.4, 0, TAU);
  ctx.fill();
  polyPath(ctx, [-7, 312, 7, 312, 0, 342]);
  ctx.fillStyle = goldG(ctx, -7, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.8)';
  ctx.stroke();
  // gold crescent cradle
  ctx.save();
  ctx.translate(0, 12);
  ctx.rotate(Math.PI);
  crescentPath(ctx, 38, 33, 12);
  ctx.fillStyle = goldG(ctx, -38, 38);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#ff8fd6';
    ctx.beginPath();
    ctx.arc(k * 31, -7, 3.4, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#7a3a60';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  // glow + orb
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('170,140,255'), 0, 10, 100 + en * 60, clamp(0.45 * en, 0, 0.9));
  ctx.restore();
  const og = ctx.createRadialGradient(-7, 3, 2, 0, 10, 24);
  og.addColorStop(0, '#ffffff');
  og.addColorStop(0.3, '#e0d4ff');
  og.addColorStop(0.7, '#8e68ff');
  og.addColorStop(1, '#3b1c8c');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.arc(0, 10, 23, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 10, 22, 0, TAU);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2.2;
  for (let k = 0; k < 2; k++) {
    ctx.beginPath();
    for (let x = -24; x <= 24; x += 3) {
      const y = 10 + Math.sin((x + time * (30 + k * 20)) * 0.17 + k * 2) * 6 * (0.5 + 0.5 * en);
      if (x === -24) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const tw = 0.5 + 0.5 * Math.sin(time * 3 + i * 1.7);
    drawSprite(ctx, starSprite('255,255,255'), -10 + ((i * 9) % 22), 2 + ((i * 7) % 16), 9 * tw + 3, tw, 0);
  }
  ctx.restore();
  if (ch > 0.05 || hot > 0.05) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(220,205,255,${0.7 * Math.max(ch, hot)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 10, 28 + ch * 8 + (1 - hot) * 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── STORM CALLER ─────────────────────────
function drawStormCaller(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const en = clamp(0.5 + 0.3 * Math.sin(time * 5) + ch * 1.1 + hot, 0, 1.7);
  ctx.save();
  ctx.scale(0.9, 0.9);
  // grip
  roundRect(ctx, -14, 206, 28, 78, 8);
  ctx.fillStyle = lin(ctx, -14, 0, 14, 0, [
    [0, '#06091a'],
    [0.5, '#1c2a4c'],
    [1, '#050816'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,200,255,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(100,190,255,0.5)';
  for (let i = 0; i < 4; i++) line(ctx, -10, 222 + i * 12, 10, 222 + i * 12);
  // body
  roundRect(ctx, -27, 34, 54, 182, 12);
  ctx.fillStyle = lin(ctx, -27, 0, 27, 0, [
    [0, '#040716'],
    [0.28, '#10244e'],
    [0.5, '#20508e'],
    [0.7, '#0e2150'],
    [1, '#030614'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,205,255,0.6)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(160,220,255,0.14)';
  ctx.fillRect(-21, 40, 7, 170);
  ctx.strokeStyle = 'rgba(100,180,255,0.35)';
  ctx.lineWidth = 1;
  for (const y of [112, 180]) line(ctx, -26, y, 26, y);
  // coils
  for (const y of [54, 74, 94]) {
    roundRect(ctx, -30, y, 60, 9, 3);
    ctx.fillStyle = steelG(ctx, -30, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(90,200,255,${clamp(0.3 + 0.3 * en, 0, 0.9)})`;
    ctx.fillRect(-26, y + 3, 52, 3);
    ctx.restore();
  }
  // lightning emblem
  ctx.save();
  ctx.translate(0, 148);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('90,190,255'), 0, 0, 90, clamp(0.4 * en, 0, 0.8));
  ctx.restore();
  polyPath(ctx, [8, -34, -12, 6, -1, 6, -9, 38, 13, -8, 2, -8]);
  ctx.fillStyle = lin(ctx, 0, -34, 0, 38, [
    [0, '#ffffff'],
    [0.5, '#9fdcff'],
    [1, '#3a9aff'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,50,110,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  // prongs
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 13, 40, s * 32, -4, s * 27, -26, s * 18, -26, s * 21, -2, s * 8, 34]);
    ctx.fillStyle = steelG(ctx, s > 0 ? 8 : -32, s > 0 ? 32 : -8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.65)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,200,255'), s * 22.5, -28, 24 + en * 12, clamp(0.5 + 0.3 * en, 0, 1));
    ctx.restore();
    ctx.fillStyle = '#e8f6ff';
    ctx.beginPath();
    ctx.arc(s * 22.5, -28, 4, 0, TAU);
    ctx.fill();
  }
  // arcs between the prongs
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (Math.random() < 0.28 + ch * 0.7 + hot * 0.5) strokeBolt(ctx, makeBolt(-22.5, -28, 22.5, -28, 0.5, 3), 1.1);
  if (Math.random() < 0.2 + ch * 0.6) strokeBolt(ctx, makeBolt(-22.5, -28, 0, 8, 0.4, 3), 0.9);
  if (Math.random() < 0.2 + ch * 0.6) strokeBolt(ctx, makeBolt(22.5, -28, 0, 8, 0.4, 3), 0.9);
  ctx.restore();
  drawElectricOrb(ctx, 0, 8, 7 + ch * 4 + hot * 3, time * 3, 0.7 + ch * 0.5, ch > 0.1 ? 2 : 1);
  ctx.restore();
}

// ───────────────────────── PENCIL GUN ─────────────────────────
function drawPencilGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  const w = 17;
  const y0 = 34;
  const y1 = 262;
  // facets
  polyPath(ctx, [-w, y0, -6, y0, -6, y1, -w, y1]);
  ctx.fillStyle = '#d08e0c';
  ctx.fill();
  polyPath(ctx, [-6, y0, 6, y0, 6, y1, -6, y1]);
  ctx.fillStyle = lin(ctx, -6, 0, 6, 0, [
    [0, '#ffd83a'],
    [0.5, '#fff2a8'],
    [1, '#ffd02a'],
  ]);
  ctx.fill();
  polyPath(ctx, [6, y0, w, y0, w, y1, 6, y1]);
  ctx.fillStyle = '#bf7c02';
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,55,0,0.8)';
  ctx.lineWidth = 1.2;
  for (const x of [-w, -6, 6, w]) line(ctx, x, y0, x, y1);
  // dark bands + text
  ctx.fillStyle = '#2a2a32';
  ctx.fillRect(-w, 190, w * 2, 6);
  ctx.fillRect(-w, 202, w * 2, 3);
  ctx.save();
  ctx.translate(0, 126);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 10px "Lilita One", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(110,50,0,0.9)';
  ctx.fillText('PENCIL GUN  2B', 0, 0);
  ctx.restore();
  // wood cone
  polyPath(ctx, [0, -6, w, y0, -w, y0]);
  ctx.fillStyle = lin(ctx, 0, -6, 0, y0, [
    [0, '#f8e3b8'],
    [1, '#d8a45e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(110,70,20,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(130,85,30,0.4)';
  for (const k of [-0.5, 0, 0.5]) line(ctx, k * 6, 6, k * 12, y0 - 3);
  for (let i = -2; i <= 2; i++) {
    ctx.fillStyle = '#e9c78e';
    ctx.beginPath();
    ctx.arc(i * 7, y0, 3.4, 0, Math.PI);
    ctx.fill();
  }
  polyPath(ctx, [0, -6, 5.8, 9, -5.8, 9]);
  ctx.fillStyle = lin(ctx, -6, 0, 6, 0, [
    [0, '#26262e'],
    [0.5, '#8a8a98'],
    [1, '#26262e'],
  ]);
  ctx.fill();
  // ferrule + eraser
  roundRect(ctx, -w - 1, y1, w * 2 + 2, 22, 2);
  ctx.fillStyle = steelG(ctx, -w, w);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,44,52,0.7)';
  ctx.stroke();
  for (let i = 1; i < 5; i++) line(ctx, -w, y1 + i * 4.4, w, y1 + i * 4.4);
  roundRect(ctx, -w + 1, y1 + 22, w * 2 - 2, 26, 8);
  ctx.fillStyle = lin(ctx, -w, 0, w, 0, [
    [0, '#d9708a'],
    [0.4, '#ffb6c9'],
    [1, '#d9708a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,30,60,0.6)';
  ctx.stroke();
  // trigger grip
  roundRect(ctx, w - 2, 128, 11, 56, 5);
  ctx.fillStyle = lin(ctx, w, 0, w + 10, 0, [
    [0, '#1a1a22'],
    [0.5, '#5a5a68'],
    [1, '#16161c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#2a2a34';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w + 3, 146);
  ctx.quadraticCurveTo(w + 22, 154, w + 9, 176);
  ctx.stroke();
  // graphite glow
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('200,200,215'), 0, -4, 50 * hot + 12, 0.6 * hot);
    ctx.restore();
  }
  if (Math.sin(time * 2.2) > 0.96) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,250,225'), -6, 62, 14, 0.8, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── SANDAL JEPIT ─────────────────────────
function drawSandalLauncher(ctx: Ctx, a: WeaponAnim, time: number) {
  const loaded = a.fireT < 0.2 ? 0 : clamp((a.fireT - 0.3) / 0.35, 0, 1);
  const kick = a.fireT < 0.22 ? Math.sin((a.fireT / 0.22) * Math.PI) : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  // grip
  roundRect(ctx, -13, 252, 26, 54, 8);
  ctx.fillStyle = lin(ctx, -13, 0, 13, 0, [
    [0, '#14439a'],
    [0.5, '#3a86ff'],
    [1, '#14439a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0c2a66';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // body
  roundRect(ctx, -25, 52, 50, 210, 10);
  ctx.fillStyle = lin(ctx, -25, 0, 25, 0, [
    [0, '#a3b0c8'],
    [0.3, '#f4f8ff'],
    [0.55, '#ffffff'],
    [0.85, '#c8d4e8'],
    [1, '#8492ae'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,70,130,0.7)';
  ctx.stroke();
  for (const y of [52, 242]) {
    roundRect(ctx, -26, y, 52, 20, 6);
    ctx.fillStyle = lin(ctx, -26, 0, 26, 0, [
      [0, '#10378a'],
      [0.45, '#4a94ff'],
      [1, '#10378a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#0c2a66';
    ctx.stroke();
  }
  // label
  roundRect(ctx, -20, 92, 40, 130, 6);
  ctx.fillStyle = '#f6f9ff';
  ctx.fill();
  ctx.strokeStyle = '#2f6fe0';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.translate(0, 168);
  ctx.rotate(-Math.PI / 2);
  ctx.font = '19px "Lilita One", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#2a62d8';
  ctx.fillText('ENAK POWER', 0, 1);
  ctx.restore();
  ctx.save();
  ctx.translate(0, 112);
  drawSandal(ctx, 0.36);
  ctx.restore();
  // loaded sandal peeking out of the nozzle
  ctx.save();
  ctx.translate(0, 9 + (1 - loaded) * 48 - kick * 4);
  ctx.scale(0.82, 0.82);
  drawSandal(ctx, 1);
  ctx.restore();
  // candy-striped nozzle
  const noz = () => polyPath(ctx, [-24, 56, -15, 9, 15, 9, 24, 56]);
  noz();
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.save();
  noz();
  ctx.clip();
  ctx.fillStyle = '#2f7bff';
  for (let i = -3; i < 9; i++) {
    const x = -34 + i * 14;
    polyPath(ctx, [x, 6, x + 7, 6, x - 3, 60, x - 10, 60]);
    ctx.fill();
  }
  ctx.fillStyle = lin(ctx, -24, 0, 24, 0, [
    [0, 'rgba(0,0,40,0.3)'],
    [0.4, 'rgba(255,255,255,0.25)'],
    [1, 'rgba(0,0,40,0.3)'],
  ]);
  ctx.fillRect(-26, 6, 52, 54);
  ctx.restore();
  noz();
  ctx.strokeStyle = '#0c2a66';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 9, 15, 3.6, 0, 0, TAU);
  ctx.fillStyle = loaded > 0.2 ? 'rgba(10,20,50,0.5)' : '#0a1020';
  ctx.fill();
  ctx.strokeStyle = '#d8e6ff';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  if (a.fireT < 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,240,200'), 0, 6, 100 * (1 - a.fireT / 0.3), 0.7 * (1 - a.fireT / 0.3));
    ctx.restore();
  }
  if (Math.sin(time * 1.3) > 0.97) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,255,255'), -14, 120, 18, 0.8, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── PAINTBALL GUN ─────────────────────────
const HOPPER: [number, number, number][] = (() => {
  const rnd = mulberry32(9);
  const o: [number, number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = rnd() * TAU;
    const d = Math.sqrt(rnd()) * 15;
    o.push([Math.cos(a) * d, Math.sin(a) * d + 3, Math.floor(rnd() * 5)]);
  }
  return o;
})();

function drawPaintballGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const puff = a.fireT < 0.3 ? 1 - a.fireT / 0.3 : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  // CO2 tank
  roundRect(ctx, -36, 150, 13, 84, 6);
  ctx.fillStyle = steelG(ctx, -36, -23);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,34,42,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#ff4f9a';
  ctx.fillRect(-36, 176, 13, 8);
  ctx.strokeStyle = '#6a737f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-23, 156);
  ctx.quadraticCurveTo(-20, 140, -14, 134);
  ctx.stroke();
  // grip
  roundRect(ctx, -14, 200, 28, 68, 9);
  ctx.fillStyle = lin(ctx, -14, 0, 14, 0, [
    [0, '#0a0a10'],
    [0.5, '#34343e'],
    [1, '#08080c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#ff4f9a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) line(ctx, -11, 214 + i * 12, 11, 214 + i * 12);
  // barrel
  roundRect(ctx, -6.5, 0, 13, 150, 5);
  ctx.fillStyle = lin(ctx, -6.5, 0, 6.5, 0, [
    [0, '#0a0a10'],
    [0.35, '#4a4a58'],
    [0.5, '#8a8a98'],
    [1, '#08080c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, 22 + i * 13, 3, 4.2, 0, 0, TAU);
    ctx.fill();
  }
  roundRect(ctx, -9, -2, 18, 14, 3);
  ctx.fillStyle = steelG(ctx, -9, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,34,42,0.8)';
  ctx.stroke();
  ctx.fillStyle = '#05050a';
  ctx.beginPath();
  ctx.ellipse(0, -1, 4, 1.8, 0, 0, TAU);
  ctx.fill();
  // receiver (pink with polka dots)
  roundRect(ctx, -23, 118, 46, 90, 13);
  ctx.fillStyle = lin(ctx, -23, 0, 23, 0, [
    [0, '#a01c5c'],
    [0.3, '#ff6cb0'],
    [0.5, '#ffb3d6'],
    [0.75, '#ee4a98'],
    [1, '#8c1650'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,10,60,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -23, 118, 46, 90, 13);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 3; c++) {
      ctx.beginPath();
      ctx.arc(-14 + c * 14 + (r % 2) * 7, 128 + r * 15, 3.2, 0, TAU);
      ctx.fill();
    }
  ctx.restore();
  ctx.strokeStyle = '#1a1a22';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, 208);
  ctx.quadraticCurveTo(-4, 230, 12, 232);
  ctx.stroke();
  // hopper (clear dome of paintballs)
  ctx.save();
  ctx.translate(28, 104);
  roundRect(ctx, -7, 8, 14, 18, 3);
  ctx.fillStyle = '#34343e';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, TAU);
  ctx.fillStyle = 'rgba(190,225,255,0.22)';
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 19, 0, TAU);
  ctx.clip();
  for (const [bx, by, ci] of HOPPER) {
    const col = PAINT[ci];
    const g = ctx.createRadialGradient(bx - 1.4, by - 1.6, 0.5, bx, by, 5.2);
    g.addColorStop(0, `rgb(${col.hi})`);
    g.addColorStop(0.5, `rgb(${col.rgb})`);
    g.addColorStop(1, `rgb(${col.lo})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(bx, by + Math.sin(time * 3 + bx) * 0.4 + puff * 1.4, 5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(240,250,255,0.9)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 14, Math.PI * 1.1, Math.PI * 1.4);
  ctx.stroke();
  roundRect(ctx, -8, -24, 16, 7, 3);
  ctx.fillStyle = '#34343e';
  ctx.fill();
  ctx.restore();
  // feed indicator: current colour
  const cur = PAINT[a.idx % PAINT.length];
  ctx.fillStyle = `rgb(${cur.rgb})`;
  ctx.beginPath();
  ctx.arc(0, 196, 4.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (puff > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(cur.rgb), 0, -2, 80 * puff + 10, 0.6 * puff);
    drawSprite(ctx, glowSprite('255,255,255'), 0, -2, 40 * puff + 8, 0.7 * puff);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── MAGIC WAND ─────────────────────────
function drawMagicWand(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const pulse = 0.8 + 0.2 * Math.sin(time * 4);
  ctx.save();
  ctx.scale(0.95, 0.95);
  // shaft with spiral stripes
  roundRect(ctx, -6, 24, 12, 310, 5);
  ctx.fillStyle = lin(ctx, -6, 0, 6, 0, [
    [0, '#3a1c8a'],
    [0.4, '#8a5af0'],
    [1, '#2c1470'],
  ]);
  ctx.fill();
  ctx.save();
  roundRect(ctx, -6, 24, 12, 310, 5);
  ctx.clip();
  ctx.fillStyle = 'rgba(248,240,255,0.92)';
  for (let y = 22; y < 340; y += 24) {
    polyPath(ctx, [-8, y, 8, y + 10, 8, y + 18, -8, y + 8]);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(-4, 24, 2.6, 310);
  ctx.restore();
  ctx.strokeStyle = 'rgba(30,10,80,0.8)';
  ctx.lineWidth = 1;
  roundRect(ctx, -6, 24, 12, 310, 5);
  ctx.stroke();
  // ferrule + pommel
  roundRect(ctx, -9, 24, 18, 12, 3);
  ctx.fillStyle = goldG(ctx, -9, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,0,0.85)';
  ctx.stroke();
  const pg = ctx.createRadialGradient(-3, 336, 1, 0, 340, 10);
  pg.addColorStop(0, '#fff3c4');
  pg.addColorStop(0.6, '#e3a52c');
  pg.addColorStop(1, '#6b3a05');
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.arc(0, 340, 9, 0, TAU);
  ctx.fill();
  // ribbon
  ctx.strokeStyle = '#ff6fc8';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let t = 0; t <= 1; t += 0.05) {
    const y = 40 + t * 70;
    const x = Math.sin(t * 9 + time * 2.4) * (10 + t * 8);
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // star
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,170,235'), 0, 0, (90 + hot * 70) * pulse, 0.65);
  drawSprite(ctx, glowSprite('255,240,255'), 0, 0, 40 + hot * 40, 0.7);
  ctx.restore();
  ctx.save();
  ctx.rotate(Math.sin(time * 1.6) * 0.12);
  ctx.scale(1 + hot * 0.4, 1 + hot * 0.4);
  drawGoldStar(ctx, 22, -Math.PI / 2, true);
  ctx.restore();
  for (let i = 0; i < 5; i++) {
    const an = time * (1.4 + i * 0.2) + (i * TAU) / 5;
    const tw = 0.5 + 0.5 * Math.sin(time * 6 + i * 2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite(i % 2 ? '255,230,130' : '255,170,235'), Math.cos(an) * 32, Math.sin(an) * 30, 8 + 8 * tw, tw, an);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── SHARK LAUNCHER ─────────────────────────
function drawSharkLauncher(ctx: Ctx, a: WeaponAnim, time: number) {
  const open = 0.25 + (a.fireT < 0.35 ? Math.sin((a.fireT / 0.35) * Math.PI) * 0.75 : 0);
  ctx.save();
  ctx.scale(0.9, 0.9);
  // tail
  polyPath(ctx, [0, 246, -30, 296, -8, 278, 0, 286, 8, 278, 30, 296]);
  ctx.fillStyle = '#16407e';
  ctx.fill();
  ctx.strokeStyle = '#0a2650';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // fins
  polyPath(ctx, [-28, 94, -58, 152, -28, 146]);
  ctx.fillStyle = '#2a64b4';
  ctx.fill();
  ctx.stroke();
  polyPath(ctx, [28, 106, 58, 158, 28, 148]);
  ctx.fillStyle = '#2a64b4';
  ctx.fill();
  ctx.stroke();
  // body
  roundRect(ctx, -30, 22, 60, 232, 22);
  ctx.fillStyle = lin(ctx, -30, 0, 30, 0, [
    [0, '#a6d4f2'],
    [0.2, '#3d86d6'],
    [0.5, '#1c4c98'],
    [0.8, '#3d86d6'],
    [1, '#a6d4f2'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#0a2650';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(ctx, -22, 34, 6, 200, 3);
  ctx.fill();
  // dorsal ridge + belly stripe + gills
  ctx.fillStyle = '#12346e';
  roundRect(ctx, -4, 60, 8, 180, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,225,255,0.65)';
  ctx.lineWidth = 1.4;
  for (const k of [-1, 1])
    for (let i = 0; i < 4; i++) line(ctx, k * 28, 70 + i * 7, k * 20, 66 + i * 7);
  ctx.fillStyle = '#f4f9ff';
  for (const k of [-1, 1]) {
    polyPath(ctx, [k * 30, 190, k * 30, 240, k * 24, 236, k * 20, 196]);
    ctx.fill();
  }
  // eyes
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 22, 54, 5.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#0a2650';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#10141c';
    ctx.beginPath();
    ctx.arc(k * 22, 55, 2.8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 22 - 1, 53.6, 1, 0, TAU);
    ctx.fill();
  }
  // toothy mouth (muzzle)
  const my = 22;
  const ry = 5 + open * 15;
  ctx.beginPath();
  ctx.ellipse(0, my, 30, ry, 0, 0, TAU);
  ctx.fillStyle = '#45091a';
  ctx.fill();
  ctx.fillStyle = '#e8708c';
  ctx.beginPath();
  ctx.ellipse(0, my + ry * 0.5, 15, ry * 0.45, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#9aa6b8';
  ctx.lineWidth = 0.8;
  for (let i = -6; i <= 6; i++) {
    const x = i * 4.3;
    const yy = ry * Math.sqrt(Math.max(0, 1 - (x / 30) * (x / 30)));
    polyPath(ctx, [x - 2.2, my - yy - 0.6, x + 2.2, my - yy - 0.6, x, my - yy + 7.4]);
    ctx.fill();
    ctx.stroke();
    polyPath(ctx, [x - 2.2, my + yy + 0.6, x + 2.2, my + yy + 0.6, x, my + yy - 7.4]);
    ctx.fill();
    ctx.stroke();
  }
  ctx.strokeStyle = '#0a2650';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.ellipse(0, my, 30, ry, 0, 0, TAU);
  ctx.stroke();
  if (a.fireT < 0.5) {
    const h = 1 - a.fireT / 0.5;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('150,220,255'), 0, my - 4, 110 * h + 20, 0.7 * h);
    ctx.restore();
  }
  if (Math.sin(time * 1.9) > 0.9) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite('255,255,255'), 14, 108, 14, 0.8, 0);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── GHOST GUN ─────────────────────────
function drawGhostGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const open = 0.2 + (a.fireT < 0.35 ? Math.sin((a.fireT / 0.35) * Math.PI) * 0.8 : 0);
  const bob = Math.sin(time * 2.2) * 2.4;
  ctx.save();
  ctx.scale(0.9, 0.9);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('90,255,235'), 0, 150 + bob, 280, 0.28 + hot * 0.3);
  ctx.restore();
  // barrel
  roundRect(ctx, -13, 0, 26, 150, 9);
  ctx.fillStyle = lin(ctx, -13, 0, 13, 0, [
    [0, '#9fe6e2'],
    [0.35, '#f2fffd'],
    [0.6, '#cdf6f2'],
    [1, '#6fcfca'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,250,235,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,200,195,0.7)';
  for (const y of [34, 56, 78]) line(ctx, -13, y, 13, y);
  // cyan flames
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 2; k++) {
      const sw = Math.sin(time * 7 + s * 1.7 + k * 2) * 5;
      ctx.beginPath();
      ctx.moveTo(s * 15, 78 - k * 8);
      ctx.bezierCurveTo(s * (26 + sw), 62, s * (14 + sw), 38, s * (24 + sw * 1.2), 10 - k * 6);
      ctx.bezierCurveTo(s * 10, 38, s * 20, 60, s * 15, 78 - k * 8);
      ctx.fillStyle = k ? 'rgba(210,255,250,0.85)' : 'rgba(80,240,225,0.7)';
      ctx.fill();
    }
    ctx.restore();
  }
  // muzzle rim
  ctx.beginPath();
  ctx.ellipse(0, 2, 17, 5.6, 0, 0, TAU);
  ctx.fillStyle = '#e4fffc';
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,245,230,0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 2, 10.5, 3.2, 0, 0, TAU);
  ctx.fillStyle = '#0a2228';
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('100,255,238'), 0, 2, 46 + hot * 60, 0.6 + hot * 0.4);
  ctx.restore();
  // ghost body
  ctx.save();
  ctx.translate(0, bob);
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(-44, 176);
    ctx.arc(0, 176, 44, Math.PI, TAU);
    ctx.lineTo(44, 262);
    const n = 4;
    for (let i = 0; i < n; i++) {
      const x0 = 44 - (88 * i) / n;
      const x1 = 44 - (88 * (i + 1)) / n;
      const wob = Math.sin(time * 4 + i * 1.7) * 5;
      ctx.quadraticCurveTo((x0 + x1) / 2, 262 + (i % 2 ? -16 : 18) + wob, x1, 262);
    }
    ctx.closePath();
  };
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 46, 206 + Math.sin(time * 3 + k) * 3, 9, 15, k * 0.5, 0, TAU);
    ctx.fillStyle = 'rgba(235,255,252,0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100,250,235,0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  body();
  const g = ctx.createRadialGradient(-12, 150, 4, 0, 190, 70);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.7, '#d9fffa');
  g.addColorStop(1, '#86e6de');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,250,235,0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#0e2028';
    ctx.beginPath();
    ctx.ellipse(k * 16, 172, 7.4, 11, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,255,240'), k * 16, 172, 28, 0.8);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 16 - 2, 167, 2, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = '#0e2028';
  ctx.beginPath();
  ctx.ellipse(0, 198, 7 + open * 2, 5 + open * 9, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,170,190,0.35)';
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 28, 188, 6, 3.4, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── UFO RAY ─────────────────────────
function drawUfoRay(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const pulse = 0.6 + 0.4 * Math.sin(time * 4);
  ctx.save();
  ctx.scale(0.92, 0.92);
  // handle + tube
  roundRect(ctx, -12, 40, 24, 232, 9);
  ctx.fillStyle = lin(ctx, -12, 0, 12, 0, [
    [0, '#4a525e'],
    [0.35, '#dfe5ec'],
    [0.55, '#f6f9fc'],
    [1, '#4a525e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,36,44,0.8)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  for (const y of [78, 128, 178]) {
    roundRect(ctx, -14, y, 28, 9, 3);
    ctx.fillStyle = '#1c2a22';
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(110,255,150,${0.5 + 0.4 * pulse})`;
    ctx.fillRect(-11, y + 3, 22, 3);
    drawSprite(ctx, glowSprite('90,255,140'), 0, y + 4.5, 36, 0.35 * pulse + hot * 0.3);
    ctx.restore();
  }
  roundRect(ctx, -16, 228, 32, 60, 9);
  ctx.fillStyle = lin(ctx, -16, 0, 16, 0, [
    [0, '#143a22'],
    [0.5, '#2f8a52'],
    [1, '#0e2a18'],
  ]);
  ctx.fill();
  ctx.stroke();
  // antennae
  for (const s of [-1, 1]) {
    ctx.strokeStyle = '#8a929c';
    ctx.lineWidth = 2;
    line(ctx, s * 12, 60, s * 26, 36);
    ctx.fillStyle = '#9dffb0';
    ctx.beginPath();
    ctx.arc(s * 26, 35, 3.4, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,255,160'), s * 26, 35, 16, 0.5 + 0.4 * Math.sin(time * 5 + s));
    ctx.restore();
  }
  // saucer
  ctx.beginPath();
  ctx.ellipse(0, 30, 48, 13, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, 0, 17, 0, 43, [
    [0, '#f4f7fb'],
    [0.5, '#aeb8c8'],
    [1, '#4a5565'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#2a323e';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const x = -36 + i * 9;
    const on = Math.sin(time * 9 + i * 1.1) > -0.2;
    const y = 33 + 4 * Math.cos((i - 4) * 0.34);
    ctx.fillStyle = on ? '#8dff9c' : '#2f6a3a';
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, TAU);
    ctx.fill();
    if (on) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('120,255,150'), x, y, 14, 0.8);
      ctx.restore();
    }
  }
  // dome
  ctx.beginPath();
  ctx.ellipse(0, 22, 24, 22, 0, Math.PI, TAU);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, -2, 0, 22, [
    [0, 'rgba(210,255,225,0.96)'],
    [1, 'rgba(80,225,135,0.85)'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,120,60,0.9)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('90,255,140'), 0, 10, 70 + hot * 90, 0.45 + hot * 0.4);
  drawSprite(ctx, glowSprite('220,255,230'), 0, 8, 30 + hot * 40, 0.5 + hot * 0.4);
  ctx.restore();
  // alien pilot
  const bob = Math.sin(time * 3) * 1;
  ctx.fillStyle = '#4fd36a';
  ctx.beginPath();
  ctx.ellipse(0, 14 + bob, 8, 9, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#1d6a30';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = '#0e2412';
  for (const k of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(k * 3.6, 13 + bob, 2.2, 3.6, k * 0.5, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.ellipse(-10, 4, 5, 2, -0.7, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ───────────────────────── RAINBOW GUN ─────────────────────────
function drawRainbowGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  // grip
  roundRect(ctx, -14, 212, 28, 68, 9);
  ctx.fillStyle = lin(ctx, -14, 0, 14, 0, [
    [0, '#08081a'],
    [0.5, '#2a2a56'],
    [1, '#060614'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,170,255,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // body
  roundRect(ctx, -24, 36, 48, 182, 12);
  ctx.fillStyle = lin(ctx, -24, 0, 24, 0, [
    [0, '#05051a'],
    [0.3, '#1a1a4a'],
    [0.5, '#2e2e72'],
    [0.75, '#16163e'],
    [1, '#04041a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(190,170,255,0.55)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // star pattern
  ctx.save();
  roundRect(ctx, -24, 36, 48, 182, 12);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  const rnd = mulberry32(5);
  for (let i = 0; i < 18; i++) {
    const sx = -18 + rnd() * 36;
    const sy = 46 + rnd() * 166;
    const sr = 1.2 + rnd() * 2.2;
    const tw = 0.6 + 0.4 * Math.sin(time * 3 + i);
    ctx.globalAlpha = tw;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const r = k % 2 ? sr * 0.4 : sr * 1.6;
      const an = -Math.PI / 2 + (k * Math.PI) / 4;
      ctx.lineTo(sx + Math.cos(an) * r, sy + Math.sin(an) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // rainbow band
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = `rgb(${RAINBOW[i]})`;
    ctx.fillRect(-26, 110 + i * 5, 52, 5.2);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-26, 110, 52, 6);
  ctx.restore();
  // rainbow arch over the muzzle
  ctx.save();
  ctx.translate(0, 38);
  const shimmer = 0.5 + 0.5 * Math.sin(time * 3);
  drawRainbowArc(ctx, 40, 44, 5, 0.96);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,220,250'), 0, -30, 120 + hot * 80, 0.25 + 0.15 * shimmer + hot * 0.4);
  ctx.restore();
  for (const k of [-1, 1]) {
    ctx.save();
    ctx.translate(k * 34, 4);
    drawCloud(ctx, 0.95);
    ctx.restore();
  }
  ctx.restore();
  // muzzle
  ctx.beginPath();
  ctx.ellipse(0, 38, 20, 6, 0, 0, TAU);
  ctx.fillStyle = '#0a0a20';
  ctx.fill();
  ctx.strokeStyle = '#d8c8ff';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,200,245'), 0, 34, 50 + hot * 60, 0.5 + hot * 0.4);
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    const ph = (time * 0.5 + i * 0.33) % 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, starSprite(RAINBOW[(i * 2 + 1) % 7]), Math.sin(time * 2 + i * 2) * 26, 20 - ph * 50, 12 * (1 - ph) + 3, 1 - ph, time + i);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── METEOR LAUNCHER ─────────────────────────
const METEOR_LEFT: number[] = [];
const METEOR_RIGHT: number[] = [];
const METEOR_CRACKS: number[][] = (() => {
  const rnd = mulberry32(21);
  for (let y = 44; y <= 236; y += 12) {
    METEOR_LEFT.push(-34 + (rnd() - 0.5) * 8, y);
    METEOR_RIGHT.push(34 + (rnd() - 0.5) * 8, y);
  }
  const out: number[][] = [];
  for (let k = 0; k < 8; k++) {
    let x = -24 + rnd() * 48;
    let y = 50 + rnd() * 170;
    const l = [x, y];
    for (let j = 0; j < 5; j++) {
      x += (rnd() - 0.5) * 22;
      y += (rnd() - 0.2) * 22;
      l.push(clamp(x, -30, 30), clamp(y, 44, 236));
    }
    out.push(l);
  }
  return out;
})();

function drawMeteorLauncher(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const en = clamp(0.55 + 0.25 * Math.sin(time * 3) + ch * 1.0 + hot * 0.9, 0, 1.8);
  ctx.save();
  ctx.scale(0.9, 0.9);
  // grip
  roundRect(ctx, -14, 226, 28, 62, 8);
  ctx.fillStyle = lin(ctx, -14, 0, 14, 0, [
    [0, '#120a07'],
    [0.5, '#3a2820'],
    [1, '#0e0705'],
  ]);
  ctx.fill();
  ctx.strokeStyle = `rgba(255,120,40,${0.4 + 0.3 * en})`;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // rocky body
  const outline: number[] = [];
  for (let i = 0; i < METEOR_LEFT.length; i += 2) outline.push(METEOR_LEFT[i], METEOR_LEFT[i + 1]);
  for (let i = METEOR_RIGHT.length - 2; i >= 0; i -= 2) outline.push(METEOR_RIGHT[i], METEOR_RIGHT[i + 1]);
  polyPath(ctx, outline);
  ctx.fillStyle = lin(ctx, -36, 0, 36, 0, [
    [0, '#0e0806'],
    [0.3, '#34261f'],
    [0.5, '#4e3a2e'],
    [0.75, '#2a1d17'],
    [1, '#0a0605'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#080403';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.save();
  polyPath(ctx, outline);
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.ellipse(-24 + ((i * 17) % 48), 60 + ((i * 29) % 170), 6, 3, i, 0, TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const c of METEOR_CRACKS) {
    ctx.strokeStyle = `rgba(255,80,20,${clamp(0.3 * en, 0, 0.7)})`;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1]);
    for (let k = 2; k < c.length; k += 2) ctx.lineTo(c[k], c[k + 1]);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,210,100,${clamp(0.8 * en, 0, 1)})`;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }
  ctx.restore();
  // emblem
  ctx.save();
  ctx.translate(18, 76);
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, TAU);
  ctx.fillStyle = '#1a0e08';
  ctx.fill();
  ctx.strokeStyle = '#ff9a2b';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,120,30'), 0, 0, 44, 0.4 + 0.3 * en);
  ctx.restore();
  ctx.fillStyle = '#ffb347';
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.bezierCurveTo(7, -3, 8, 3, 4, 7);
  ctx.bezierCurveTo(2, 9, -2, 9, -4, 7);
  ctx.bezierCurveTo(-8, 3, -3, -3, 0, -9);
  ctx.fill();
  ctx.restore();
  // crater muzzle
  ctx.beginPath();
  ctx.ellipse(0, 40, 36, 12, 0, 0, TAU);
  ctx.fillStyle = '#1a0d08';
  ctx.fill();
  ctx.strokeStyle = `rgba(255,140,50,${clamp(0.6 + 0.3 * en, 0, 1)})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 40, 26, 7.6, 0, 0, TAU);
  const lg = ctx.createRadialGradient(0, 40, 2, 0, 40, 26);
  lg.addColorStop(0, `rgba(255,240,170,${clamp(0.5 + 0.4 * en, 0, 1)})`);
  lg.addColorStop(0.5, `rgba(255,120,30,${clamp(0.6 + 0.3 * en, 0, 1)})`);
  lg.addColorStop(1, 'rgba(120,30,8,0.9)');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,130,40'), 0, 34, 90 + en * 70, clamp(0.4 + 0.3 * en, 0, 1));
  ctx.restore();
  if (Math.random() < 0.3 + ch * 0.5 + hot * 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,200,90'), -14 + Math.random() * 28, 34 - Math.random() * 14, 7, 0.9);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── DIAMOND GUN ─────────────────────────
function drawDiamondGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  ctx.save();
  ctx.scale(0.92, 0.92);
  const facet = (pts: number[], fill: string) => {
    polyPath(ctx, pts);
    ctx.fillStyle = fill;
    ctx.fill();
  };
  // grip
  polyPath(ctx, [-18, 196, 18, 196, 22, 264, 6, 276, -14, 270]);
  ctx.fillStyle = lin(ctx, -18, 0, 22, 0, [
    [0, '#4a8abd'],
    [0.5, '#bfe6fb'],
    [1, '#3a78ae'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,70,120,0.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  line(ctx, -6, 200, -2, 268);
  line(ctx, 8, 200, 12, 268);
  // body block (faceted)
  facet([-30, 112, -12, 100, 12, 100, 30, 112, 30, 196, 12, 208, -12, 208, -30, 196], '#7cc8f0');
  facet([-12, 100, 12, 100, 12, 208, -12, 208], '#dff6ff');
  facet([-30, 112, -12, 100, -12, 208, -30, 196], '#4ea6e0');
  facet([12, 100, 30, 112, 30, 196, 12, 208], '#3a8ccc');
  ctx.strokeStyle = 'rgba(230,250,255,0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-30, 112);
  ctx.lineTo(-12, 100);
  ctx.lineTo(12, 100);
  ctx.lineTo(30, 112);
  ctx.lineTo(30, 196);
  ctx.lineTo(12, 208);
  ctx.lineTo(-12, 208);
  ctx.lineTo(-30, 196);
  ctx.closePath();
  ctx.moveTo(-12, 100);
  ctx.lineTo(-12, 208);
  ctx.moveTo(12, 100);
  ctx.lineTo(12, 208);
  ctx.stroke();
  // inset diamond
  ctx.save();
  ctx.translate(0, 152);
  ctx.scale(1.15, 1.15);
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(13, 0);
  ctx.lineTo(0, 22);
  ctx.lineTo(-13, 0);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -13, -18, 13, 22, [
    [0, '#ffffff'],
    [0.5, '#9fdcf8'],
    [1, '#3a9ae0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,80,140,0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  line(ctx, -13, 0, 13, 0);
  line(ctx, 0, -18, 0, 22);
  ctx.restore();
  // barrel: hexagonal crystal prism
  facet([-14, 100, -20, 40, -20, 10, -8, -2, -8, 100], '#7ac4ee');
  facet([-8, -2, 8, -2, 8, 100, -8, 100], '#e6f9ff');
  facet([8, -2, 20, 10, 20, 40, 14, 100, 8, 100], '#4aa0e0');
  facet([-20, 10, -8, -2, 8, -2, 20, 10, 0, 22], '#f4fdff');
  ctx.strokeStyle = 'rgba(235,252,255,0.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-14, 100);
  ctx.lineTo(-20, 40);
  ctx.lineTo(-20, 10);
  ctx.lineTo(-8, -2);
  ctx.lineTo(8, -2);
  ctx.lineTo(20, 10);
  ctx.lineTo(20, 40);
  ctx.lineTo(14, 100);
  ctx.moveTo(-8, -2);
  ctx.lineTo(-8, 100);
  ctx.moveTo(8, -2);
  ctx.lineTo(8, 100);
  ctx.moveTo(-20, 10);
  ctx.lineTo(0, 22);
  ctx.lineTo(20, 10);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20,80,140,0.8)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // side crystals
  for (const [sx, sy, sh] of [
    [-34, 70, 26],
    [32, 120, 22],
    [-36, 150, 18],
  ] as [number, number, number][]) {
    polyPath(ctx, [sx, sy - sh, sx + 7, sy - 4, sx, sy + sh * 0.5, sx - 7, sy - 4]);
    ctx.fillStyle = lin(ctx, sx - 7, sy - sh, sx + 7, sy + sh * 0.5, [
      [0, '#ffffff'],
      [1, '#5ab0e8'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,80,140,0.7)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }
  // glow + moving glints
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('150,225,255'), 0, 40, 110 + hot * 70, 0.28 + hot * 0.4);
  drawSprite(ctx, glowSprite('230,250,255'), 0, 2, 40 + hot * 50, 0.5 + hot * 0.45);
  for (let i = 0; i < 3; i++) {
    const ph = (time * 0.55 + i * 0.33) % 1;
    if (ph < 0.3) {
      const k = Math.sin((ph / 0.3) * Math.PI);
      drawSprite(ctx, starSprite('225,250,255'), -10 + i * 10, 20 + ((i * 53) % 150), 22 * k, k, 0);
    }
  }
  const sp = (time * 0.5) % 1;
  drawSprite(ctx, starSprite('255,255,255'), 0, -4, 26 + 10 * Math.sin(sp * TAU), 0.9, time);
  ctx.restore();
  ctx.restore();
}
