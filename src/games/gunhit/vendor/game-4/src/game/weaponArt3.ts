import { type Ctx, TAU, clamp, drawSprite, easeOutCubic, glowSprite, lin, polyPath, roundRect } from './core';
import { drawLeaf, drawPizzaSlice } from './shapes3';
import { drawWeapon4 } from './weaponArt4';
import type { WeaponAnim, WeaponId } from './weapons';

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
const steelG = (ctx: Ctx, y0: number, y1: number) =>
  lin(ctx, 0, y0, 0, y1, [
    [0, '#7d8590'],
    [0.2, '#dde3ea'],
    [0.5, '#5b626c'],
    [0.8, '#2a2e34'],
    [1, '#454b54'],
  ]);
const darkG = (ctx: Ctx, y0: number, y1: number) =>
  lin(ctx, 0, y0, 0, y1, [
    [0, '#6a717c'],
    [0.25, '#363b43'],
    [1, '#111316'],
  ]);
const woodG = (ctx: Ctx, y0: number, y1: number) =>
  lin(ctx, 0, y0, 0, y1, [
    [0, '#dcab70'],
    [0.3, '#ae763c'],
    [0.7, '#76481f'],
    [1, '#3d2209'],
  ]);

export function drawWeapon3(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'harpoon':
      return drawHarpoonGun(ctx, a, time);
    case 'chicken':
      return drawChickenGun(ctx, a, time);
    case 'confetti':
      return drawConfettiCannon(ctx, a, time);
    case 'seed':
      return drawSeedGun(ctx, a, time);
    case 'pizza':
      return drawPizzaLauncher(ctx, a, time);
    case 'minigun':
      return drawMinigun(ctx, a, time);
    case 'crossbow':
      return drawCrossbow(ctx, a, time);
    case 'plasma':
      return drawPlasmaGun(ctx, a, time);
    case 'laser':
      return drawLaserGun(ctx, a, time);
    default:
      return drawWeapon4(ctx, id, a, time);
  }
}

// ───────────────────────── HARPOON GUN ─────────────────────────
function drawHarpoonGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.7, 0.7);
  const hot = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const pulse = 0.55 + 0.45 * Math.sin(time * 3.2);
  // rear stock
  polyPath(ctx, [-252, -8, -178, -13, -178, 17, -246, 25]);
  ctx.fillStyle = woodG(ctx, -13, 25);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40,20,6,0.35)';
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-182, -7 + i * 6);
    ctx.bezierCurveTo(-210, -5 + i * 6, -232, -3 + i * 6, -248, -4 + i * 7);
    ctx.stroke();
  }
  ctx.fillStyle = darkG(ctx, -8, 25);
  roundRect(ctx, -258, -10, 10, 38, 3);
  ctx.fill();
  // pistol grip
  polyPath(ctx, [-188, 12, -156, 12, -148, 66, -180, 72]);
  ctx.fillStyle = woodG(ctx, 12, 72);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,14,4,0.45)';
  for (let i = 0; i < 5; i++) line(ctx, -184 + i * 0.8, 24 + i * 9, -153 + i * 1.2, 24 + i * 9);
  ctx.strokeStyle = '#23262b';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-142, 16);
  ctx.quadraticCurveTo(-140, 34, -154, 35);
  ctx.lineTo(-166, 34);
  ctx.stroke();
  ctx.strokeStyle = '#8a929c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-156, 17);
  ctx.quadraticCurveTo(-152, 25, -156, 30);
  ctx.stroke();
  // receiver + glowing cell
  roundRect(ctx, -178, -17, 108, 34, 9);
  ctx.fillStyle = darkG(ctx, -17, 17);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  roundRect(ctx, -160, -9.5, 66, 19, 8);
  ctx.fillStyle = '#04201d';
  ctx.fill();
  ctx.clip();
  const lg = ctx.createLinearGradient(-160, 0, -94, 0);
  lg.addColorStop(0, `rgba(10,120,110,${0.7 + 0.2 * pulse})`);
  lg.addColorStop(0.5, `rgba(40,240,215,${0.75 + 0.25 * pulse})`);
  lg.addColorStop(1, `rgba(10,120,110,${0.7 + 0.2 * pulse})`);
  ctx.fillStyle = lg;
  ctx.fillRect(-160, -9.5, 66, 19);
  ctx.globalCompositeOperation = 'lighter';
  const bx = -160 + ((time * 40) % 80) - 14;
  ctx.fillStyle = 'rgba(210,255,248,0.55)';
  ctx.fillRect(bx, -9.5, 10, 19);
  for (let i = 0; i < 4; i++) {
    const ph = (time * (0.4 + i * 0.08) + i * 0.27) % 1;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(-155 + ph * 56, -5 + ((i * 5) % 10), 1.3 + (i % 2), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(190,255,248,0.85)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, -160, -9.5, 66, 19, 8);
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('50,255,225'), -127, 0, 110, 0.4 * pulse + hot * 0.4);
  ctx.restore();
  // barrel + rings
  ctx.fillStyle = steelG(ctx, -6, 6);
  ctx.fillRect(-74, -6, 74, 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 0.8;
  line(ctx, -72, -3, -2, -3);
  [-60, -38, -16].forEach((x, i) => {
    ctx.fillStyle = darkG(ctx, -11, 11);
    roundRect(ctx, x - 4, -11, 8, 22, 2.5);
    ctx.fill();
    const e = 0.45 + 0.4 * Math.sin(time * 4 - i * 0.9) + hot * 0.9;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(90,255,232,${clamp(0.6 + e * 0.4, 0, 1)})`;
    ctx.fillRect(x - 0.9, -11, 1.8, 22);
    drawSprite(ctx, glowSprite('60,255,220'), x, 0, 34, clamp(e * 0.5, 0, 0.9));
    ctx.restore();
  });
  // reel + rope
  const rx = -128;
  const ry = 30;
  ctx.strokeStyle = '#7a5a2c';
  ctx.lineWidth = 2.2;
  line(ctx, rx + 10, ry - 12, -66, 7.5);
  line(ctx, -66, 7.5, -6, 7.5);
  ctx.fillStyle = steelG(ctx, ry - 16, ry + 16);
  ctx.beginPath();
  ctx.arc(rx, ry, 16, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#9a7a44';
  ctx.beginPath();
  ctx.arc(rx, ry, 11.5, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.translate(rx, ry);
  ctx.rotate(a.spin);
  ctx.strokeStyle = 'rgba(70,45,15,0.8)';
  ctx.lineWidth = 1;
  for (let r = 4; r <= 11; r += 2.4) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
  }
  ctx.strokeStyle = '#2a2e34';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 3; i++) {
    ctx.rotate(TAU / 3);
    line(ctx, 0, 0, 14, 0);
  }
  ctx.fillStyle = '#d8dee6';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#c1121f';
  ctx.beginPath();
  ctx.arc(13, 0, 2.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  // harpoon head loading out of the muzzle
  const ld = easeOutCubic(clamp((a.fireT - 0.22) / 0.4, 0, 1));
  if (ld > 0.02) {
    const tx = ld * 32;
    ctx.fillStyle = steelG(ctx, -2.2, 2.2);
    ctx.fillRect(-14, -2.2, tx - 20 + 14, 4.4);
    polyPath(ctx, [tx, 0, tx - 9, -6.4, tx - 20, -5, tx - 20, 5, tx - 9, 6.4]);
    ctx.fillStyle = lin(ctx, 0, -6, 0, 6, [
      [0, '#58616c'],
      [0.48, '#f8fbff'],
      [1, '#59626d'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,20,26,0.85)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    for (const k of [-1, 1]) {
      polyPath(ctx, [tx - 20, k * 5, tx - 29, k * 10.5, tx - 17, k * 6.4]);
      ctx.fillStyle = '#a3adb8';
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.fillStyle = darkG(ctx, -9, 9);
  roundRect(ctx, -8, -9, 8, 18, 2.5);
  ctx.fill();
  if (hot > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,255,235'), 0, 0, 70 * hot + 14, 0.8 * hot);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── RUBBER CHICKEN LAUNCHER ─────────────────────────
function drawChickenGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.72, 0.72);
  const sq = a.fireT < 0.16 ? Math.sin((a.fireT / 0.16) * Math.PI) : 0;
  const mouth = 0.14 + (a.fireT < 0.24 ? Math.sin((a.fireT / 0.24) * Math.PI) * 0.86 : 0);
  const red = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#ff8a7a'],
      [0.3, '#e63a2e'],
      [0.75, '#a8140f'],
      [1, '#5e0906'],
    ]);
  const yel = (y0: number, y1: number) =>
    lin(ctx, 0, y0, 0, y1, [
      [0, '#fff6a0'],
      [0.28, '#ffdf2e'],
      [0.7, '#f0ac00'],
      [1, '#a86e00'],
    ]);
  // pistol grip
  polyPath(ctx, [-218, 12, -186, 12, -180, 64, -212, 70]);
  ctx.fillStyle = red(12, 70);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,5,3,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,5,3,0.45)';
  for (let i = 0; i < 4; i++) line(ctx, -214 + i * 0.8, 26 + i * 10, -183 + i, 26 + i * 10);
  ctx.fillStyle = '#ffd23f';
  roundRect(ctx, -178, 18, 6, 18, 3);
  ctx.fill();
  // rear squeeze bulb
  roundRect(ctx, -252, -15, 76, 30, 14);
  ctx.fillStyle = red(-15, 15);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,5,3,0.4)';
  for (let x = -244; x < -180; x += 8) line(ctx, x, -12, x, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  roundRect(ctx, -244, -12, 60, 4, 2);
  ctx.fill();
  // ribbed rubber body (squashes when squeaking)
  ctx.save();
  ctx.translate(-100, 0);
  ctx.scale(1 - 0.05 * sq, 1 + 0.2 * sq);
  ctx.translate(100, 0);
  for (let i = 0; i < 10; i++) {
    const x = -178 + i * 13.4;
    const h = 11.5 + (i / 9) * 8;
    roundRect(ctx, x, -h, 15, h * 2, 6.5);
    ctx.fillStyle = yel(-h, h);
    ctx.fill();
    ctx.strokeStyle = '#9a6200';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 10; i++) {
    const x = -178 + i * 13.4;
    const h = 11.5 + (i / 9) * 8;
    roundRect(ctx, x + 3, -h + 2.4, 9, 3, 1.5);
    ctx.fill();
  }
  ctx.restore();
  // wing
  ctx.save();
  ctx.translate(-92, 18);
  ctx.rotate(0.15 + Math.sin(time * 2) * 0.03);
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 8, 0, 0, TAU);
  ctx.fillStyle = yel(-8, 8);
  ctx.fill();
  ctx.strokeStyle = '#9a6200';
  ctx.stroke();
  ctx.restore();
  // neck + head
  roundRect(ctx, -50, -9 - 2 * sq, 40, 18 + 4 * sq, 8);
  ctx.fillStyle = yel(-10, 10);
  ctx.fill();
  ctx.strokeStyle = '#9a6200';
  ctx.stroke();
  const hr = 15 + sq * 1.6;
  ctx.beginPath();
  ctx.arc(-14, 0, hr, 0, TAU);
  const hg = ctx.createRadialGradient(-18, -6, 2, -14, 0, hr);
  hg.addColorStop(0, '#fff6a0');
  hg.addColorStop(0.5, '#ffdf2e');
  hg.addColorStop(1, '#d99a00');
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.strokeStyle = '#8a5200';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // comb
  for (const [x, y, r] of [
    [-24, -17, 5],
    [-16, -20, 5.8],
    [-8, -17, 4.8],
  ] as [number, number, number][]) {
    ctx.beginPath();
    ctx.arc(x, y - sq * 1.4, r, 0, TAU);
    ctx.fillStyle = red(y - r, y + r);
    ctx.fill();
    ctx.strokeStyle = '#7a0a10';
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }
  // eye
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#3a2a10';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(-9, -6.5, 5.4, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(-7.4, -6, 2.6, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-6.4, -7.2, 0.9, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#8a5200';
  ctx.lineWidth = 1.4;
  line(ctx, -14, -12.6, -4.4, -10.6);
  // open beak = muzzle
  const gap = 1 + mouth * 7;
  ctx.fillStyle = '#5e1008';
  ctx.beginPath();
  ctx.moveTo(-6, -gap);
  ctx.lineTo(8, -gap * 0.4);
  ctx.lineTo(8, gap * 0.4);
  ctx.lineTo(-6, gap);
  ctx.closePath();
  ctx.fill();
  polyPath(ctx, [-8, -6.8 - gap * 0.2, 10, -1.6 - gap, -5, -gap]);
  ctx.fillStyle = '#ff9a1f';
  ctx.fill();
  ctx.strokeStyle = '#a85a00';
  ctx.lineWidth = 1;
  ctx.stroke();
  polyPath(ctx, [-8, 6.8 + gap * 0.2, 9, 1.6 + gap, -5, gap]);
  ctx.fillStyle = '#f58a10';
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#d62839';
  ctx.beginPath();
  ctx.ellipse(-8, 11 + gap * 0.8, 3.4, 4.4, 0.4, 0, TAU);
  ctx.fill();
  if (a.fireT < 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,235,120'), 6, 0, 80 * (1 - a.fireT / 0.3), 0.7 * (1 - a.fireT / 0.3));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── CONFETTI CANNON ─────────────────────────
const STRIPES = ['#3aa0ff', '#ff5fa8', '#ffd23f', '#35d6a0', '#ff8a2b', '#9b6bff'];

function drawConfettiCannon(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.8, 0.8);
  const blow = a.fireT < 0.4 ? 1 - a.fireT / 0.4 : 0;
  // handle + grip
  roundRect(ctx, -214, -8, 64, 16, 7);
  ctx.fillStyle = woodG(ctx, -8, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(-216, 0, 6.5, 0, TAU);
  ctx.fill();
  ctx.stroke();
  roundRect(ctx, -126, 16, 24, 40, 7);
  ctx.fillStyle = lin(ctx, -126, 0, -102, 0, [
    [0, '#1a6fd6'],
    [0.5, '#5bb6ff'],
    [1, '#1559b0'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,40,90,0.8)';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) line(ctx, -122, 28 + i * 9, -106, 28 + i * 9);
  // pull string with ring
  const sw = Math.sin(time * 3) * 2 + blow * 7;
  ctx.strokeStyle = '#e8d8a8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-218, 2);
  ctx.quadraticCurveTo(-228, 10 + sw, -230, 20 + sw);
  ctx.stroke();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.arc(-230, 26 + sw, 5.5, 0, TAU);
  ctx.stroke();
  // striped cone
  const cone = () => {
    ctx.beginPath();
    ctx.moveTo(0, -31);
    ctx.lineTo(0, 31);
    ctx.lineTo(-156, 11);
    ctx.lineTo(-156, -11);
    ctx.closePath();
  };
  cone();
  ctx.fillStyle = '#ddd';
  ctx.fill();
  ctx.save();
  cone();
  ctx.clip();
  for (let i = -2; i < 12; i++) {
    const x0 = -i * 22 + 4;
    polyPath(ctx, [x0, -40, x0 - 22, -40, x0 - 40, 40, x0 - 18, 40]);
    ctx.fillStyle = STRIPES[((i % 6) + 6) % 6];
    ctx.fill();
  }
  ctx.fillStyle = lin(ctx, 0, -31, 0, 31, [
    [0, 'rgba(255,255,255,0.4)'],
    [0.35, 'rgba(255,255,255,0)'],
    [1, 'rgba(0,0,40,0.4)'],
  ]);
  ctx.fillRect(-160, -34, 164, 68);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for (const [sx, sy, r] of [
    [-100, -4, 6],
    [-52, 6, 7],
    [-22, -10, 5],
  ] as [number, number, number][]) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? r * 0.42 : r;
      const an = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  cone();
  ctx.strokeStyle = 'rgba(20,20,60,0.7)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // mouth rim (gold, scalloped paper edge)
  roundRect(ctx, -9, -34, 11, 68, 4);
  ctx.fillStyle = lin(ctx, -9, 0, 2, 0, [
    [0, '#a56a14'],
    [0.5, '#fff0b8'],
    [1, '#c88a1e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,5,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = STRIPES[2];
  for (let y = -30; y < 32; y += 10) {
    ctx.beginPath();
    ctx.arc(1.5, y + 3, 4, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
  }
  // streamers & confetti poking out of the mouth
  const len = 22 + blow * 26;
  for (let k = 0; k < 7; k++) {
    const y0 = -24 + k * 8;
    ctx.strokeStyle = STRIPES[k % 6];
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let j = 0; j <= 10; j++) {
      const s = j / 10;
      const px = 2 + s * len * (0.7 + (k % 3) * 0.2);
      const py = y0 + Math.sin(s * 7 + time * 5 + k * 1.3) * 5 * s + (y0 / 24) * s * 8;
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
  for (let k = 0; k < 8; k++) {
    ctx.save();
    ctx.translate(4 + ((k * 7) % 14) + blow * 12, -22 + ((k * 13) % 44));
    ctx.rotate(time * 2 + k);
    ctx.fillStyle = STRIPES[(k + 2) % 6];
    ctx.fillRect(-2.6, -1.4, 5.2, 2.8);
    ctx.restore();
  }
  if (a.fireT < 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,220,255'), 4, 0, 110 * (1 - a.fireT / 0.3), 0.8 * (1 - a.fireT / 0.3));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── SEED GUN ─────────────────────────
function leafAt(ctx: Ctx, x: number, y: number, ang: number, L: number, dark = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  if (dark) drawLeaf(ctx, L, L * 0.42, '#5cc34a', '#1d6b2c');
  else drawLeaf(ctx, L, L * 0.42);
  ctx.restore();
}

function drawSeedGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.8, 0.8);
  const k = a.fireT < 0.2 ? Math.sin((a.fireT / 0.2) * Math.PI) : 0;
  const sw = Math.sin(time * 2.4) * 0.12 + k * 0.35;
  // wooden handle + grip
  roundRect(ctx, -214, -9, 88, 18, 9);
  ctx.fillStyle = woodG(ctx, -9, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(40,20,6,0.55)';
  ctx.beginPath();
  ctx.ellipse(-180, 0, 4.5, 2.6, 0, 0, TAU);
  ctx.fill();
  polyPath(ctx, [-182, 8, -154, 8, -146, 58, -176, 62]);
  ctx.fillStyle = woodG(ctx, 8, 62);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,14,4,0.4)';
  for (let i = 0; i < 4; i++) line(ctx, -178 + i, 22 + i * 9, -150 + i, 22 + i * 9);
  // terracotta pot barrel
  polyPath(ctx, [-132, -15, -14, -23, -14, 23, -132, 15]);
  ctx.fillStyle = lin(ctx, 0, -23, 0, 23, [
    [0, '#f7b48a'],
    [0.3, '#e0793f'],
    [0.7, '#b4501f'],
    [1, '#6e2c0e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,24,6,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,225,190,0.35)';
  polyPath(ctx, [-128, -12, -18, -20, -18, -15, -128, -8]);
  ctx.fill();
  ctx.fillStyle = 'rgba(80,30,10,0.4)';
  ctx.fillRect(-92, -16, 3, 32);
  ctx.fillRect(-56, -18, 3, 36);
  ctx.fillStyle = 'rgba(90,150,70,0.5)';
  for (const [mx, my, r] of [
    [-104, 8, 5],
    [-72, -11, 4],
    [-38, 12, 5.5],
  ] as [number, number, number][]) {
    ctx.beginPath();
    ctx.ellipse(mx, my, r, r * 0.6, 0.3, 0, TAU);
    ctx.fill();
  }
  // rim + dark opening
  roundRect(ctx, -20, -28, 18, 56, 5);
  ctx.fillStyle = lin(ctx, 0, -28, 0, 28, [
    [0, '#ffd2ad'],
    [0.3, '#ee8a50'],
    [0.75, '#c15a26'],
    [1, '#7a3412'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(70,24,6,0.9)';
  ctx.stroke();
  const og = ctx.createRadialGradient(-2, 0, 2, -2, 0, 24);
  og.addColorStop(0, '#0a0502');
  og.addColorStop(1, '#3a1d0c');
  ctx.fillStyle = og;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 5, 20, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#ffd2ad';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // vine
  const vine = (lw: number, col: string) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = -132; x <= -22; x += 3) {
      const y = 15 * Math.sin((x + 132) * 0.085 + 0.6) + (x + 132) * 0.02;
      if (x === -132) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  vine(6.4, '#1a5524');
  vine(4, '#46b04a');
  vine(1.2, 'rgba(210,255,190,0.6)');
  for (const [x, up] of [
    [-122, 1],
    [-102, -1],
    [-82, 1],
    [-62, -1],
    [-42, 1],
  ] as [number, number][]) {
    const y = 15 * Math.sin((x + 132) * 0.085 + 0.6) + (x + 132) * 0.02;
    leafAt(ctx, x, y, up * (1.15 + sw * 0.4), 14, up > 0);
  }
  // pink flower on the vine
  ctx.save();
  ctx.translate(-92, 15 * Math.sin(40 * 0.085 + 0.6) + 0.8);
  for (let p = 0; p < 5; p++) {
    ctx.rotate(TAU / 5);
    ctx.fillStyle = '#ff9ccb';
    ctx.strokeStyle = 'rgba(160,40,90,0.7)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(4.6, 0, 4.4, 2.8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, TAU);
  ctx.fill();
  ctx.restore();
  // sprout on top of the pot
  ctx.save();
  ctx.translate(-70, -17);
  ctx.rotate(-0.15 + sw * 0.5);
  ctx.strokeStyle = '#1d5e28';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-4, -16, 0, -32);
  ctx.stroke();
  ctx.strokeStyle = '#47b04a';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  leafAt(ctx, -1, -14, -2.2, 16);
  leafAt(ctx, -1, -20, -0.9, 16, true);
  leafAt(ctx, 0, -32, -1.57, 12);
  ctx.restore();
  if (a.fireT < 0.35) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('150,255,120'), 4, 0, 100 * (1 - a.fireT / 0.35), 0.6 * (1 - a.fireT / 0.35));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── PIZZA LAUNCHER ─────────────────────────
function drawPizzaLauncher(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.76, 0.76);
  const pop = a.fireT < 0.25 ? Math.sin((a.fireT / 0.25) * Math.PI) : 0;
  // handle + grip
  roundRect(ctx, -232, -10, 70, 20, 8);
  ctx.fillStyle = woodG(ctx, -10, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  polyPath(ctx, [-198, 14, -168, 14, -160, 62, -192, 68]);
  ctx.fillStyle = woodG(ctx, 14, 68);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = 'rgba(30,14,4,0.4)';
  for (let i = 0; i < 4; i++) line(ctx, -194 + i, 28 + i * 9, -165 + i, 28 + i * 9);
  ctx.strokeStyle = '#2a1608';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-158, 18);
  ctx.quadraticCurveTo(-156, 34, -170, 35);
  ctx.stroke();
  // sauce tank on top
  roundRect(ctx, -160, -42, 40, 24, 9);
  ctx.fillStyle = lin(ctx, 0, -42, 0, -18, [
    [0, '#ff7a6a'],
    [0.4, '#d9261a'],
    [1, '#7a0e08'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,5,3,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  roundRect(ctx, -154, -39, 28, 4, 2);
  ctx.fill();
  ctx.fillStyle = '#f2f2f2';
  roundRect(ctx, -148, -48, 16, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#9aa3ad';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-132, -20);
  ctx.quadraticCurveTo(-122, -16, -120, -8);
  ctx.stroke();
  // orange tube
  roundRect(ctx, -178, -21, 164, 42, 10);
  ctx.fillStyle = lin(ctx, 0, -21, 0, 21, [
    [0, '#ffd27a'],
    [0.25, '#ffa22e'],
    [0.7, '#e0700f'],
    [1, '#8f3e05'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(100,40,4,0.85)';
  ctx.stroke();
  // checker band
  ctx.save();
  roundRect(ctx, -178, -21, 164, 42, 10);
  ctx.clip();
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      ctx.fillStyle = (r + c) % 2 ? '#f5f0e6' : '#d62828';
      ctx.fillRect(-122 + c * 11, -22 + r * 11, 11, 11);
    }
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.fillRect(-178, -18, 164, 4);
  ctx.restore();
  for (const x of [-124, -77]) {
    ctx.fillStyle = darkG(ctx, -22, 22);
    ctx.fillRect(x, -22, 3, 44);
  }
  // pizza emblem
  ctx.save();
  ctx.translate(-44, 0);
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.78, 0.78);
  drawPizzaSlice(ctx, 34);
  ctx.restore();
  // cheesy flared muzzle with drips
  polyPath(ctx, [-20, -23, 0, -29, 0, 29, -20, 23]);
  ctx.fillStyle = lin(ctx, -20, 0, 0, 0, [
    [0, '#e8a010'],
    [0.5, '#ffe27a'],
    [1, '#ffc22e'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#a86a08';
  ctx.stroke();
  const drips: [number, number][] = [
    [-14, 12],
    [-7, 20],
    [-1, 9],
  ];
  drips.forEach(([x, L], i) => {
    const len = L + Math.sin(time * 1.4 + i * 2) * 3 + pop * 8;
    ctx.fillStyle = '#ffd34d';
    ctx.strokeStyle = '#c98a10';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 3.4, 24);
    ctx.lineTo(x + 3.4, 24);
    ctx.lineTo(x + 2.4, 24 + len);
    ctx.arc(x, 24 + len, 2.4, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });
  ctx.fillStyle = '#0c0603';
  ctx.beginPath();
  ctx.ellipse(-1, 0, 5, 20, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#c8281e';
  ctx.beginPath();
  ctx.arc(-1, -8, 7.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#6a0f08';
  ctx.stroke();
  if (a.fireT < 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,80'), 2, 0, 100 * (1 - a.fireT / 0.4), 0.7 * (1 - a.fireT / 0.4));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── MINIGUN ─────────────────────────
function drawMinigun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.66, 0.66);
  const heat = clamp(a.heat, 0, 1);
  const shake = a.spinV > 8 ? Math.sin(time * 90) * 1.2 : 0;
  ctx.translate(0, shake);
  // pistol grip + rear spade grip
  polyPath(ctx, [-186, 28, -152, 28, -144, 80, -178, 86]);
  ctx.fillStyle = darkG(ctx, 28, 86);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = '#ff8a2b';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) line(ctx, -180 + i, 46 + i * 10, -150 + i, 46 + i * 10);
  ctx.strokeStyle = '#1a1c20';
  ctx.lineWidth = 3.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-140, 30);
  ctx.quadraticCurveTo(-138, 48, -152, 50);
  ctx.stroke();
  // ammo belt feeding from the top
  const belt: [number, number][] = [];
  for (let i = 0; i < 11; i++) {
    const s = i / 10;
    belt.push([-176 + s * -30 + Math.sin(s * 3 + time * 0.5) * 1.5, -30 - s * 56 + s * s * 14]);
  }
  belt.forEach(([bx, by], i) => {
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-0.4 + i * 0.05);
    ctx.fillStyle = lin(ctx, -4, 0, 4, 0, [
      [0, '#6b3a05'],
      [0.5, '#ffe9a0'],
      [1, '#7a4a08'],
    ]);
    roundRect(ctx, -4, -7, 8, 14, 2);
    ctx.fill();
    ctx.fillStyle = '#d96a2a';
    ctx.fillRect(-3.4, -9, 6.8, 3);
    ctx.restore();
  });
  ctx.fillStyle = darkG(ctx, -96, -70);
  roundRect(ctx, -222, -100, 40, 26, 5);
  ctx.fill();
  ctx.stroke();
  // motor + housing
  roundRect(ctx, -262, -22, 64, 44, 10);
  ctx.fillStyle = darkG(ctx, -22, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.stroke();
  ctx.fillStyle = '#ff8a2b';
  ctx.fillRect(-262, -4, 64, 7);
  ctx.strokeStyle = '#5b626c';
  ctx.lineWidth = 4;
  line(ctx, -262, -12, -276, -12);
  line(ctx, -262, 12, -276, 12);
  roundRect(ctx, -206, -30, 90, 60, 8);
  ctx.fillStyle = lin(ctx, 0, -30, 0, 30, [
    [0, '#6a717c'],
    [0.25, '#3c4149'],
    [1, '#16181b'],
  ]);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(-198, -26, 74, 3);
  ctx.fillStyle = '#9aa3ad';
  for (const [bx, by] of [
    [-198, -22],
    [-198, 22],
    [-124, -22],
    [-124, 22],
  ])
    ctx.beginPath(), ctx.arc(bx, by, 2.2, 0, TAU), ctx.fill();
  ctx.fillStyle = '#ff8a2b';
  ctx.fillRect(-170, 22, 40, 4);
  // carry handle
  ctx.strokeStyle = '#2a2e34';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-196, -30);
  ctx.quadraticCurveTo(-170, -58, -134, -30);
  ctx.stroke();
  ctx.strokeStyle = '#7d8590';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // 6 rotating barrels
  const barrels: { d: number; y: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const ph = a.spin + (i * TAU) / 6;
    barrels.push({ d: Math.cos(ph), y: Math.sin(ph) * 16 });
  }
  barrels.sort((p, q) => p.d - q.d);
  for (const b of barrels) {
    const br = 0.5 + 0.5 * b.d;
    ctx.fillStyle = lin(ctx, 0, b.y - 5.4, 0, b.y + 5.4, [
      [0, `rgb(${Math.round(90 + 110 * br)},${Math.round(98 + 110 * br)},${Math.round(108 + 110 * br)})`],
      [0.5, `rgb(${Math.round(50 + 70 * br)},${Math.round(56 + 70 * br)},${Math.round(64 + 70 * br)})`],
      [1, `rgb(${Math.round(18 + 20 * br)},${Math.round(20 + 20 * br)},${Math.round(24 + 20 * br)})`],
    ]);
    ctx.fillRect(-116, b.y - 5.4, 116, 10.8);
    if (heat > 0.02) {
      ctx.fillStyle = `rgba(255,${Math.round(110 + 60 * (1 - heat))},40,${0.55 * heat * (0.5 + 0.5 * br)})`;
      ctx.fillRect(-90, b.y - 5.4, 90, 10.8);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(-114, b.y - 3.6, 112, 1.4);
    ctx.fillStyle = '#050506';
    ctx.beginPath();
    ctx.ellipse(-0.5, b.y, 1.6, 4.2, 0, 0, TAU);
    ctx.fill();
  }
  // clamps
  for (const [x, w, h] of [
    [-122, 18, 50],
    [-70, 10, 46],
    [-22, 14, 48],
  ] as [number, number, number][]) {
    roundRect(ctx, x, -h / 2, w, h, 3);
    ctx.fillStyle = steelG(ctx, -h / 2, h / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.fillStyle = '#ff8a2b';
  ctx.fillRect(-122, -3, 18, 6);
  if (heat > 0.05 || a.fireT < 0.3) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,140,50'), -6, 0, 90 * Math.max(heat, 1 - a.fireT / 0.3) + 20, 0.7 * Math.max(heat, 1 - a.fireT / 0.3));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── CROSSBOW ─────────────────────────
function drawCrossbow(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.76, 0.76);
  const ft = a.fireT;
  let pull = 1;
  if (ft < 0.045) pull = 1 - ft / 0.045;
  else if (ft < 0.13) pull = 0;
  else if (ft < 0.55) {
    const k = (ft - 0.13) / 0.42;
    pull = k * k * (3 - 2 * k);
  }
  const vib = ft > 0.04 && ft < 0.5 ? Math.sin(ft * 95) * Math.exp(-(ft - 0.04) * 9) : 0;
  const tipX = -26 + (10 - 34 * pull) + vib * 5;
  const nutX = -30 - 42 * pull + vib * 6;
  // stock
  polyPath(ctx, [6, -7, -28, -9, -200, -13, -236, -9, -240, 28, -204, 24, -152, 17, -112, 13, -30, 9, 6, 7]);
  ctx.fillStyle = woodG(ctx, -13, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.9)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(40,20,6,0.3)';
  ctx.lineWidth = 0.9;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-34, -4 + i * 4);
    ctx.bezierCurveTo(-90, -6 + i * 5, -170, -5 + i * 6, -236, -2 + i * 7);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(10,5,0,0.7)';
  ctx.fillRect(-130, -2.6, 130, 5.2);
  ctx.fillStyle = darkG(ctx, -10, 30);
  roundRect(ctx, -246, -10, 10, 40, 3);
  ctx.fill();
  // trigger
  ctx.strokeStyle = '#23262b';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-128, 16);
  ctx.quadraticCurveTo(-126, 36, -144, 37);
  ctx.lineTo(-160, 36);
  ctx.stroke();
  ctx.strokeStyle = '#8a929c';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-142, 17);
  ctx.quadraticCurveTo(-139, 25, -143, 31);
  ctx.stroke();
  // red-dot sight
  roundRect(ctx, -104, -22, 28, 14, 3);
  ctx.fillStyle = darkG(ctx, -22, -8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,50,50'), -90, -15, 10 + Math.sin(time * 6) * 1.5, 0.9);
  ctx.restore();
  // bow limbs
  const limb = (lw: number, col: string) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(-26, s * 10);
      ctx.quadraticCurveTo(-26 + 20, s * 56, tipX, s * 88);
      ctx.stroke();
    }
  };
  limb(9.6, '#0b0c0e');
  limb(7, '#2a2e36');
  limb(2.2, 'rgba(190,200,215,0.55)');
  roundRect(ctx, -42, -17, 28, 34, 5);
  ctx.fillStyle = steelG(ctx, -17, 17);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#c1121f';
  ctx.fillRect(-36, -2, 16, 4);
  // string
  ctx.strokeStyle = '#efe6cc';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(tipX, -88);
  ctx.lineTo(nutX, 0);
  ctx.lineTo(tipX, 88);
  ctx.stroke();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(tipX, -88, 3, 0, TAU);
  ctx.arc(tipX, 88, 3, 0, TAU);
  ctx.fill();
  // bolt
  if (ft > 0.45) {
    const lift = ft < 0.6 ? (0.6 - ft) * 14 : 0;
    ctx.save();
    ctx.translate(0, -lift);
    ctx.fillStyle = lin(ctx, 0, -2.6, 0, 2.6, [
      [0, '#4a2a0c'],
      [0.5, '#d29a58'],
      [1, '#4a2a0c'],
    ]);
    ctx.fillRect(-112, -2.6, 104, 5.2);
    for (const k of [-1, 1]) {
      polyPath(ctx, [-90, k * 2.6, -102, k * 10, -118, k * 10, -108, k * 2.6]);
      ctx.fillStyle = k < 0 ? '#e0303f' : '#a31622';
      ctx.fill();
    }
    polyPath(ctx, [7, 0, -9, -6, -9, 6]);
    ctx.fillStyle = lin(ctx, 0, -6, 0, 6, [
      [0, '#4f5863'],
      [0.5, '#f4f8fc'],
      [1, '#4a525c'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,24,30,0.8)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── PLASMA GUN ─────────────────────────
function drawPlasmaGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.84, 0.84);
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const en = 0.6 + 0.4 * Math.sin(time * 3) + ch * 0.8 + hot * 0.6;
  // grip
  polyPath(ctx, [-176, 14, -144, 14, -136, 66, -168, 70]);
  ctx.fillStyle = lin(ctx, -176, 0, -136, 0, [
    [0, '#0c141b'],
    [0.5, '#3a505e'],
    [1, '#0c141b'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(80,255,170,0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(80,255,160,${0.5 + 0.3 * en})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) line(ctx, -170 + i * 1.4, 28 + i * 10, -142 + i * 1.8, 28 + i * 10);
  ctx.restore();
  ctx.strokeStyle = '#1a242c';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-134, 18);
  ctx.quadraticCurveTo(-132, 36, -146, 37);
  ctx.stroke();
  // body
  roundRect(ctx, -198, -19, 162, 40, 11);
  ctx.fillStyle = lin(ctx, 0, -19, 0, 21, [
    [0, '#7898a8'],
    [0.25, '#44606f'],
    [0.7, '#1c2d38'],
    [1, '#0d1720'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(ctx, -190, -16, 146, 3.4, 1.7);
  ctx.fill();
  ctx.fillStyle = '#04100b';
  for (let i = 0; i < 4; i++) ctx.fillRect(-190 + i * 6, 6, 3.4, 11);
  // plasma cell window
  ctx.save();
  roundRect(ctx, -150, -12, 88, 24, 11);
  ctx.fillStyle = '#031a10';
  ctx.fill();
  ctx.clip();
  const lg = ctx.createLinearGradient(-150, 0, -62, 0);
  lg.addColorStop(0, `rgba(8,110,60,${0.7 + 0.2 * en})`);
  lg.addColorStop(0.5, `rgba(60,255,150,${clamp(0.7 + 0.3 * en, 0, 1)})`);
  lg.addColorStop(1, `rgba(8,110,60,${0.7 + 0.2 * en})`);
  ctx.fillStyle = lg;
  ctx.fillRect(-150, -12, 88, 24);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(215,255,228,0.7)';
  ctx.lineWidth = 1.6;
  for (let w = 0; w < 2; w++) {
    ctx.beginPath();
    for (let x = -150; x <= -62; x += 3) {
      const y = Math.sin((x + time * (70 + w * 30)) * 0.18 + w) * 6 * (0.6 + 0.4 * en);
      if (x === -150) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(190,255,215,0.85)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, -150, -12, 88, 24, 11);
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('40,255,140'), -106, 0, 150, clamp(0.45 * en, 0, 0.9));
  ctx.restore();
  // plus emblem
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(110,255,170,${clamp(0.6 + 0.3 * en, 0, 1)})`;
  ctx.fillRect(-186, -2, 14, 4);
  ctx.fillRect(-181, -7, 4, 14);
  ctx.restore();
  // antenna
  ctx.strokeStyle = '#8aa0ac';
  ctx.lineWidth = 2.2;
  line(ctx, -98, -19, -104, -42);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const blink = 0.5 + 0.5 * Math.sin(time * 6);
  drawSprite(ctx, glowSprite('80,255,170'), -104, -44, 20 + blink * 6, 0.5 + 0.5 * blink);
  ctx.restore();
  ctx.fillStyle = '#bfffd8';
  ctx.beginPath();
  ctx.arc(-104, -44, 2.8, 0, TAU);
  ctx.fill();
  // emitter
  polyPath(ctx, [-44, -13, -16, -21, 0, -21, 0, 21, -16, 21, -44, 13]);
  ctx.fillStyle = darkG(ctx, -21, 21);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.stroke();
  [-38, -29, -20].forEach((x, i) => {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(90,255,170,${clamp(0.45 + 0.35 * Math.sin(time * 6 - i) + ch * 0.4, 0.2, 1)})`;
    const hh = 12 + i * 3.4;
    ctx.fillRect(x, -hh, 2.6, hh * 2);
    ctx.restore();
  });
  for (const s of [-1, 1]) {
    polyPath(ctx, [-34, s * 14, -4, s * 22, -4, s * 27, -26, s * 20]);
    ctx.fillStyle = steelG(ctx, -28, 28);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    ctx.stroke();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cs = 28 + ch * 40 + hot * 30;
  drawSprite(ctx, glowSprite('80,255,170'), -2, 0, cs, clamp(0.7 + ch * 0.3, 0, 1));
  drawSprite(ctx, glowSprite('230,255,240'), -2, 0, cs * 0.45, 0.9);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── LASER BEAM ─────────────────────────
function drawLaserGun(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.scale(0.78, 0.78);
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const en = clamp(0.55 + 0.25 * Math.sin(time * 3.4) + ch * 0.9 + hot * 0.8, 0, 1.4);
  // grip
  polyPath(ctx, [-156, 14, -124, 14, -116, 64, -148, 70]);
  ctx.fillStyle = lin(ctx, -156, 0, -116, 0, [
    [0, '#3a3f48'],
    [0.5, '#8a929e'],
    [1, '#30343c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(255,60,70,${clamp(0.5 + 0.4 * en, 0, 1)})`;
  ctx.lineWidth = 2.4;
  line(ctx, -150, 30, -122, 30);
  line(ctx, -148, 44, -120, 44);
  ctx.restore();
  ctx.strokeStyle = '#23262b';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-114, 18);
  ctx.quadraticCurveTo(-112, 36, -126, 37);
  ctx.stroke();
  // sleek body
  const body = () => polyPath(ctx, [2, -5, -24, -10, -120, -19, -198, -17, -232, -9, -232, 11, -198, 18, -120, 18, -24, 10, 2, 5]);
  body();
  ctx.fillStyle = lin(ctx, 0, -19, 0, 18, [
    [0, '#ffffff'],
    [0.28, '#eef2f8'],
    [0.65, '#b3bccb'],
    [1, '#6b7686'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,46,58,0.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.save();
  body();
  ctx.clip();
  // red energy panels
  [-208, -172, -136, -100, -64].forEach((x, i) => {
    roundRect(ctx, x, -8, 26, 16, 4);
    ctx.fillStyle = lin(ctx, 0, -8, 0, 8, [
      [0, '#ff7a82'],
      [0.5, '#e11d2e'],
      [1, '#7a0a14'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,5,12,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    const e = clamp(0.4 + 0.4 * Math.sin(time * 4 - i * 0.8) + ch * 0.7 + hot * 0.6, 0.1, 1.2);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,170,170,${clamp(e * 0.7, 0, 1)})`;
    ctx.fillRect(x + 3, -2, 20, 4);
    drawSprite(ctx, glowSprite('255,50,60'), x + 13, 0, 46, clamp(e * 0.45, 0, 0.8));
    ctx.restore();
  });
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(-224, -16, 190, 2.6);
  ctx.fillStyle = 'rgba(30,36,48,0.35)';
  ctx.fillRect(-224, 12, 220, 4);
  ctx.restore();
  // fins
  for (const s of [-1, 1]) {
    polyPath(ctx, [-96, s * 18, -66, s * 18, -80, s * 30, -112, s * 30]);
    ctx.fillStyle = steelG(ctx, -30, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,36,48,0.8)';
    ctx.stroke();
  }
  // lens
  ctx.fillStyle = '#12151a';
  ctx.beginPath();
  ctx.ellipse(-3, 0, 6.5, 8, 0, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const ls = 26 + ch * 46 + hot * 40;
  drawSprite(ctx, glowSprite('255,50,60'), -2, 0, ls, clamp(0.55 + ch * 0.45, 0, 1));
  drawSprite(ctx, glowSprite('255,235,230'), -2, 0, ls * 0.4, clamp(0.5 + en * 0.4, 0, 1));
  ctx.restore();
  ctx.fillStyle = '#ff3b4c';
  ctx.beginPath();
  ctx.ellipse(-3, 0, 3.4, 5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-3.8, -1.6, 1.2, 2, 0, 0, TAU);
  ctx.fill();
  // tail light
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,50,60'), -232, 1, 24, 0.6 * en);
  ctx.restore();
  ctx.restore();
}
