import { type Ctx, TAU, clamp, drawSprite, glowSprite, lin, polyPath, roundRect, starSprite } from './core';
import { drawBee, drawBlossom, drawCoconut, drawGravityOrb, drawFireRocket, drawKeris, drawKerisBlade, drawPetal, hexPath } from './shapes4';
import { drawWeapon5 } from './weaponArt5';
import type { WeaponAnim, WeaponId } from './weapons';

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function drawWeapon4(ctx: Ctx, id: WeaponId, a: WeaponAnim, time: number) {
  switch (id) {
    case 'dragon':
      return drawDragonGun(ctx, a, time);
    case 'gravity':
      return drawGravityGun(ctx, a, time);
    case 'honey':
      return drawHoneyBlaster(ctx, a, time);
    case 'coconut':
      return drawCoconutCannon(ctx, a, time);
    case 'angklung':
      return drawAngklung(ctx, a, time);
    case 'bee':
      return drawBeeHive(ctx, a, time);
    case 'sakura':
      return drawSakuraLauncher(ctx, a, time);
    case 'firework':
      return drawFireworkLauncher(ctx, a, time);
    case 'keris':
      return drawKerisWeapon(ctx, a, time);
    default:
      return drawWeapon5(ctx, id, a, time);
  }
}

// ───────────────────────── DRAGON BREATH ─────────────────────────
function drawDragonGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const fire = a.fireT < 0.6 ? 1 - a.fireT / 0.6 : 0;
  const open = 0.25 + (a.fireT < 0.4 ? Math.sin((a.fireT / 0.4) * Math.PI) * 0.75 : 0);
  const flap = Math.sin(time * 2) * 0.05 + (a.fireT < 0.5 ? Math.sin((a.fireT / 0.5) * Math.PI) * 0.38 : 0);
  ctx.save();
  ctx.scale(0.86, 0.86);
  // bat wings
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 15, 122);
    ctx.rotate(s * (0.06 + flap));
    const X = (v: number) => s * v;
    ctx.beginPath();
    ctx.moveTo(X(0), -12);
    ctx.lineTo(X(40), -60);
    ctx.lineTo(X(82), -86);
    ctx.quadraticCurveTo(X(70), -50, X(96), -32);
    ctx.quadraticCurveTo(X(76), -8, X(92), 18);
    ctx.quadraticCurveTo(X(68), 28, X(66), 62);
    ctx.quadraticCurveTo(X(34), 34, X(0), 50);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, 0, 0, X(96), -40, [
      [0, '#5e0a0c'],
      [0.55, '#b3261a'],
      [1, '#ff7a2a'],
    ]);
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(40,5,5,0.9)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    const tips: [number, number][] = [
      [82, -86],
      [96, -32],
      [92, 18],
      [66, 62],
    ];
    ctx.lineCap = 'round';
    for (const [style, lw] of [
      ['#2a0707', 3],
      ['rgba(255,190,90,0.55)', 1],
    ] as [string, number][]) {
      ctx.strokeStyle = style;
      ctx.lineWidth = lw;
      for (const [tx, ty] of tips) {
        ctx.beginPath();
        ctx.moveTo(X(2), -4);
        ctx.quadraticCurveTo(X(tx * 0.5), ty * 0.5 - 6, X(tx), ty);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  // body
  const hw = (y: number) => 15 + 7 * Math.sin(Math.PI * clamp(y / 270, 0, 1));
  const pts: number[] = [];
  for (let y = 0; y <= 270; y += 9) pts.push(-hw(y), y);
  for (let y = 270; y >= 0; y -= 9) pts.push(hw(y), y);
  polyPath(ctx, pts);
  ctx.fillStyle = lin(ctx, -24, 0, 24, 0, [
    [0, '#4a0907'],
    [0.25, '#b3221a'],
    [0.5, '#ff6a3a'],
    [0.7, '#c4301a'],
    [1, '#3d0706'],
  ]);
  ctx.fill();
  ctx.save();
  polyPath(ctx, pts);
  ctx.clip();
  ctx.beginPath();
  for (let row = 0; row < 29; row++) {
    const y = 14 + row * 9.4;
    for (let col = -3; col <= 3; col++) {
      const x = col * 9.2 + (row % 2) * 4.6;
      if (Math.abs(x) > hw(y) + 5) continue;
      ctx.moveTo(x + 6.2, y);
      ctx.arc(x, y, 6.2, 0, Math.PI);
    }
  }
  ctx.strokeStyle = 'rgba(50,5,5,0.55)';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.beginPath();
  for (let row = 0; row < 29; row++) {
    const y = 14 + row * 9.4;
    for (let col = -3; col <= 3; col++) {
      const x = col * 9.2 + (row % 2) * 4.6;
      if (Math.abs(x) > hw(y) + 5) continue;
      ctx.moveTo(x + 5, y - 0.8);
      ctx.arc(x, y - 0.8, 5, Math.PI * 1.1, Math.PI * 1.9);
    }
  }
  ctx.strokeStyle = 'rgba(255,170,110,0.35)';
  ctx.stroke();
  ctx.restore();
  polyPath(ctx, pts);
  ctx.strokeStyle = 'rgba(30,3,3,0.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // gold bands
  for (const y of [74, 152, 228]) {
    roundRect(ctx, -hw(y) - 3, y - 5, hw(y) * 2 + 6, 10, 4);
    ctx.fillStyle = lin(ctx, -26, 0, 26, 0, [
      [0, '#7a4a08'],
      [0.35, '#f0c458'],
      [0.55, '#fff0b8'],
      [1, '#7a4a08'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,0,0.85)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // tail fins
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 20, 214, s * 42, 244, s * 20, 252]);
    ctx.fillStyle = '#7a0f10';
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,3,3,0.85)';
    ctx.stroke();
  }
  // horns
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 12, 8);
    ctx.quadraticCurveTo(s * 50, -6, s * 60, 56);
    ctx.quadraticCurveTo(s * 40, 22, s * 20, 28);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, 0, 0, s * 60, 56, [
      [0, '#fff1c9'],
      [1, '#b98a4a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#4a2a10';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  // head: brow + eyes
  polyPath(ctx, [-22, 24, -10, 18, 0, 20, 10, 18, 22, 24, 14, 36, -14, 36]);
  ctx.fillStyle = lin(ctx, 0, 18, 0, 36, [
    [0, '#8f1a10'],
    [1, '#4a0907'],
  ]);
  ctx.fill();
  ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.translate(s * 10, 29);
    ctx.rotate(s * 0.35);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.4, 2.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2a0702';
    ctx.fillRect(-0.7, -2.2, 1.4, 4.4);
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,60'), 0, 0, 22 + fire * 14, 0.8);
    ctx.restore();
  }
  // mouth
  ctx.beginPath();
  ctx.ellipse(0, 2, 22, 10.5, 0, 0, TAU);
  ctx.fillStyle = '#5a100a';
  ctx.fill();
  ctx.strokeStyle = '#ffb347';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  const mr = 14 * (1 + 0.35 * open);
  const mh = 6.6 * (1 + open * 0.55);
  ctx.beginPath();
  ctx.ellipse(0, 1.5, mr, mh, 0, 0, TAU);
  ctx.fillStyle = '#1a0402';
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 1.5, mr, mh, 0, 0, TAU);
  ctx.clip();
  const mg = ctx.createRadialGradient(0, 1.5, 1, 0, 1.5, mr);
  mg.addColorStop(0, `rgba(255,230,140,${0.6 + 0.4 * fire})`);
  mg.addColorStop(0.5, `rgba(255,120,30,${0.55 + 0.4 * fire})`);
  mg.addColorStop(1, 'rgba(120,20,5,0.2)');
  ctx.fillStyle = mg;
  ctx.fillRect(-mr, -mh, mr * 2, mh * 3);
  ctx.restore();
  ctx.fillStyle = '#fff6dc';
  for (let i = 0; i < 6; i++) {
    const ang = Math.PI + ((i + 0.5) / 6) * Math.PI;
    const px = Math.cos(ang) * mr * 0.98;
    const py = 1.5 + Math.sin(ang) * mh * 0.98;
    polyPath(ctx, [px - 1.8, py, px + 1.8, py, px, py + 5]);
    ctx.fill();
    const ang2 = ((i + 0.5) / 6) * Math.PI;
    const qx = Math.cos(ang2) * mr * 0.98;
    const qy = 1.5 + Math.sin(ang2) * mh * 0.98;
    polyPath(ctx, [qx - 1.8, qy, qx + 1.8, qy, qx, qy - 4.4]);
    ctx.fill();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,140,40'), 0, 0, 56 + fire * 90, 0.55 + fire * 0.4);
  drawSprite(ctx, glowSprite('255,230,160'), 0, 0, 24 + fire * 40, 0.6 + fire * 0.4);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── GRAVITY GUN ─────────────────────────
function drawGravityGun(ctx: Ctx, a: WeaponAnim, time: number) {
  const ch = a.charging ? a.charge : 0;
  const hot = a.fireT < 0.5 ? 1 - a.fireT / 0.5 : 0;
  const en = clamp(0.55 + 0.3 * Math.sin(time * 3.2) + ch * 0.8 + hot * 0.7, 0, 1.5);
  ctx.save();
  ctx.scale(0.9, 0.9);
  const navy = (x0: number, x1: number) =>
    lin(ctx, x0, 0, x1, 0, [
      [0, '#070d24'],
      [0.3, '#1a2c63'],
      [0.5, '#2c4690'],
      [0.75, '#13214f'],
      [1, '#060b1e'],
    ]);
  // grip
  roundRect(ctx, -16, 190, 32, 68, 9);
  ctx.fillStyle = navy(-16, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,180,255,0.45)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(90,170,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) line(ctx, -12, 208 + i * 11, 12, 208 + i * 11);
  // fins
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 25, 62, s * 46, 92, s * 46, 152, s * 25, 172]);
    ctx.fillStyle = navy(s > 0 ? 25 : -46, s > 0 ? 46 : -25);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,180,255,0.5)';
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(90,190,255,${clamp(0.4 + 0.4 * en, 0, 1)})`;
    ctx.lineWidth = 2;
    line(ctx, s * 38, 98, s * 38, 146);
    ctx.restore();
  }
  // body
  roundRect(ctx, -26, 30, 52, 176, 12);
  ctx.fillStyle = navy(-26, 26);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,180,255,0.5)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, -22, 36, 44, 12, 4);
  ctx.fill();
  roundRect(ctx, -22, 182, 44, 14, 4);
  ctx.fill();
  ctx.fillStyle = '#6aa8ff';
  for (const [rx, ry] of [
    [-19, 42],
    [19, 42],
    [-19, 190],
    [19, 190],
  ])
    ctx.beginPath(), ctx.arc(rx, ry, 1.8, 0, TAU), ctx.fill();
  // energy slot
  ctx.save();
  roundRect(ctx, -7, 62, 14, 112, 7);
  ctx.fillStyle = '#02081a';
  ctx.fill();
  ctx.clip();
  const sg = ctx.createLinearGradient(0, 62, 0, 174);
  sg.addColorStop(0, `rgba(30,110,230,${clamp(0.6 + 0.3 * en, 0, 1)})`);
  sg.addColorStop(0.5, `rgba(90,200,255,${clamp(0.7 + 0.3 * en, 0, 1)})`);
  sg.addColorStop(1, `rgba(30,110,230,${clamp(0.6 + 0.3 * en, 0, 1)})`);
  ctx.fillStyle = sg;
  ctx.fillRect(-7, 62, 14, 112);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(200,245,255,0.75)';
  const by = 62 + ((time * 95) % 128) - 16;
  ctx.fillRect(-7, by, 14, 16);
  ctx.restore();
  ctx.strokeStyle = 'rgba(170,230,255,0.8)';
  ctx.lineWidth = 1.2;
  roundRect(ctx, -7, 62, 14, 112, 7);
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('70,170,255'), 0, 118, 120, clamp(0.35 * en, 0, 0.7));
  ctx.restore();
  // emitter prongs
  for (const s of [-1, 1]) {
    polyPath(ctx, [s * 22, 36, s * 32, 12, s * 26, 8, s * 14, 32]);
    ctx.fillStyle = navy(s > 0 ? 14 : -32, s > 0 ? 32 : -14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,180,255,0.5)';
    ctx.stroke();
  }
  const ringBack = () => {
    ctx.beginPath();
    ctx.ellipse(0, 8, 30, 11, 0, Math.PI, TAU);
  };
  const ringFront = () => {
    ctx.beginPath();
    ctx.ellipse(0, 8, 30, 11, 0, 0, Math.PI);
  };
  for (const rf of [ringBack, ringFront]) {
    if (rf === ringFront) {
      // orb sits between the two halves of the ring
      const orbR = 12 * a.orb * (1 + ch * 0.45);
      if (orbR > 0.6) drawGravityOrb(ctx, 0, -8, orbR, time * 1.4, 0.8 + ch * 0.5);
    }
    rf();
    ctx.strokeStyle = '#0c1a45';
    ctx.lineWidth = 7;
    ctx.stroke();
    rf();
    ctx.strokeStyle = '#3a66c8';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    rf();
    ctx.strokeStyle = `rgba(120,215,255,${clamp(0.6 + 0.3 * en, 0, 1)})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  }
  if (a.fireT < 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,210,255'), 0, 4, 120 * (1 - a.fireT / 0.5), 0.7 * (1 - a.fireT / 0.5));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── HONEY BLASTER ─────────────────────────
function drawHoneyBlaster(ctx: Ctx, a: WeaponAnim, time: number) {
  const pulse = a.fireT < 0.3 ? Math.sin((a.fireT / 0.3) * Math.PI) : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  const amber = (x0: number, x1: number) =>
    lin(ctx, x0, 0, x1, 0, [
      [0, '#8f4a00'],
      [0.25, '#e69a10'],
      [0.5, '#ffd95a'],
      [0.75, '#f0a010'],
      [1, '#7a3c00'],
    ]);
  // grip
  roundRect(ctx, -15, 212, 30, 52, 9);
  ctx.fillStyle = lin(ctx, -15, 0, 15, 0, [
    [0, '#2a1606'],
    [0.5, '#6a4018'],
    [1, '#241204'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,90,0.45)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) line(ctx, -12, 226 + i * 9, 12, 226 + i * 9);
  // body
  roundRect(ctx, -24, 30, 48, 184, 15);
  ctx.fillStyle = amber(-24, 24);
  ctx.fill();
  ctx.save();
  roundRect(ctx, -24, 30, 48, 184, 15);
  ctx.clip();
  ctx.strokeStyle = 'rgba(120,60,0,0.55)';
  ctx.lineWidth = 1;
  const hr = 8.4;
  for (let row = 0; row < 18; row++) {
    for (let col = -3; col <= 3; col++) {
      const cx = col * hr * 1.73 + (row % 2) * hr * 0.865;
      const cy = 34 + row * hr * 1.5;
      ctx.save();
      ctx.translate(cx, cy);
      hexPath(ctx, hr * 0.97, Math.PI / 6);
      ctx.restore();
      ctx.stroke();
    }
  }
  ctx.fillStyle = 'rgba(255,245,190,0.28)';
  ctx.fillRect(-18, 34, 6, 176);
  ctx.restore();
  ctx.strokeStyle = 'rgba(110,55,0,0.9)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, -24, 30, 48, 184, 15);
  ctx.stroke();
  // honey jar window
  roundRect(ctx, -16, 70, 32, 72, 8);
  ctx.fillStyle = '#2a1304';
  ctx.fill();
  ctx.save();
  roundRect(ctx, -16, 70, 32, 72, 8);
  ctx.clip();
  const lvl = 92 + Math.sin(time * 3) * 1.4 + pulse * 6;
  ctx.beginPath();
  ctx.moveTo(-18, lvl);
  for (let x = -18; x <= 18; x += 3) ctx.lineTo(x, lvl + Math.sin(x * 0.4 + time * 4) * 1.5);
  ctx.lineTo(18, 144);
  ctx.lineTo(-18, 144);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, lvl, 0, 142, [
    [0, 'rgba(255,214,60,0.95)'],
    [1, 'rgba(225,130,0,0.98)'],
  ]);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 5; i++) {
    const ph = (time * (0.3 + i * 0.05) + i * 0.31) % 1;
    ctx.beginPath();
    ctx.arc(-9 + ((i * 7) % 18), 140 - ph * (140 - lvl), 1.2 + (i % 2), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,240,190,0.9)';
  ctx.lineWidth = 1.6;
  roundRect(ctx, -16, 70, 32, 72, 8);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  roundRect(ctx, -12, 75, 4, 58, 2);
  ctx.fill();
  // bee stripes
  for (const y of [158, 178]) {
    ctx.fillStyle = '#241204';
    ctx.fillRect(-24, y, 48, 12);
    ctx.strokeStyle = 'rgba(255,200,70,0.6)';
    ctx.lineWidth = 1;
    line(ctx, -24, y + 0.5, 24, y + 0.5);
    line(ctx, -24, y + 11.5, 24, y + 11.5);
  }
  // hexagonal nozzle
  ctx.save();
  ctx.translate(0, 18);
  hexPath(ctx, 20, Math.PI / 6);
  ctx.fillStyle = amber(-20, 20);
  ctx.fill();
  ctx.strokeStyle = '#6a3400';
  ctx.lineWidth = 2;
  ctx.stroke();
  hexPath(ctx, 12.5, Math.PI / 6);
  ctx.fillStyle = '#3a1c02';
  ctx.fill();
  ctx.strokeStyle = '#ffd95a';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(0, 12, 8, 4, 0, 0, TAU);
  ctx.fillStyle = '#120802';
  ctx.fill();
  // forming honey bead
  const ph = (time * 0.45) % 1;
  const br = 2 + ph * 3.4;
  ctx.beginPath();
  ctx.moveTo(-2.4, 10);
  ctx.lineTo(2.4, 10);
  ctx.lineTo(1.4, 8 + ph * 12);
  ctx.arc(0, 8 + ph * 12, br, 0, Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#ffc928';
  ctx.fill();
  ctx.strokeStyle = '#a85500';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(-1, 8 + ph * 12, br * 0.28, 0, TAU);
  ctx.fill();
  if (a.fireT < 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,50'), 0, 10, 110 * (1 - a.fireT / 0.4), 0.7 * (1 - a.fireT / 0.4));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── MERIAM KELAPA ─────────────────────────
function leaf(ctx: Ctx, ang: number, L: number, sway: number) {
  ctx.save();
  ctx.rotate(ang + sway);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(L * 0.5, -L * 0.2, L, L * 0.12);
  ctx.quadraticCurveTo(L * 0.5, L * 0.08, 0, 0);
  ctx.fillStyle = lin(ctx, 0, -L * 0.2, 0, L * 0.12, [
    [0, '#6fd13a'],
    [1, '#1f7a2a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#195a22';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(210,255,170,0.7)';
  ctx.lineWidth = 0.9;
  line(ctx, 2, 0, L * 0.95, L * 0.08);
  ctx.strokeStyle = 'rgba(20,90,30,0.7)';
  ctx.lineWidth = 0.9;
  for (let i = 1; i < 8; i++) {
    const x = (L * i) / 8.4;
    line(ctx, x, L * 0.04 * (i / 8), x + L * 0.05, -L * 0.1 * Math.sin((i / 8.4) * Math.PI));
    line(ctx, x, L * 0.04 * (i / 8), x + L * 0.05, L * 0.1 * Math.sin((i / 8.4) * Math.PI) + L * 0.04);
  }
  ctx.restore();
}

function drawCoconutCannon(ctx: Ctx, a: WeaponAnim, time: number) {
  const k = a.fireT < 0.5 ? Math.exp(-a.fireT * 5) * Math.sin(a.fireT * 34) : 0;
  const sw = Math.sin(time * 1.8) * 0.05 + k * 0.28;
  ctx.save();
  ctx.scale(0.88, 0.88);
  // stand
  roundRect(ctx, -12, 232, 24, 40, 6);
  ctx.fillStyle = lin(ctx, -12, 0, 12, 0, [
    [0, '#3d220d'],
    [0.5, '#a8703a'],
    [1, '#33190a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // leaves behind the tube
  ctx.save();
  ctx.translate(-20, 82);
  leaf(ctx, Math.PI * 0.82, 62, sw);
  leaf(ctx, Math.PI * 0.62, 56, sw * 1.3);
  leaf(ctx, Math.PI * 1.05, 52, sw * 0.8);
  ctx.restore();
  ctx.save();
  ctx.translate(20, 70);
  leaf(ctx, -0.2, 54, -sw);
  leaf(ctx, 0.35, 48, -sw * 1.2);
  ctx.restore();
  // tube
  const tube = () => roundRect(ctx, -23, 8, 46, 230, 7);
  tube();
  ctx.fillStyle = lin(ctx, -23, 0, 23, 0, [
    [0, '#5a8a14'],
    [0.25, '#a8d43a'],
    [0.5, '#eaffa0'],
    [0.75, '#a0cc34'],
    [1, '#4c7a10'],
  ]);
  ctx.fill();
  ctx.save();
  tube();
  ctx.clip();
  ctx.strokeStyle = 'rgba(60,100,10,0.28)';
  ctx.lineWidth = 0.9;
  for (let x = -18; x <= 18; x += 6) line(ctx, x, 8, x + 1, 238);
  ctx.fillStyle = 'rgba(255,255,230,0.35)';
  ctx.fillRect(-16, 10, 5, 226);
  for (const ny of [78, 154, 224]) {
    ctx.fillStyle = lin(ctx, 0, ny - 6, 0, ny + 6, [
      [0, '#5a8a14'],
      [0.5, '#c8e860'],
      [1, '#44700c'],
    ]);
    ctx.fillRect(-25, ny - 5, 50, 11);
    ctx.strokeStyle = 'rgba(40,70,5,0.75)';
    ctx.lineWidth = 1;
    line(ctx, -25, ny - 5, 25, ny - 5);
    line(ctx, -25, ny + 6, 25, ny + 6);
  }
  ctx.restore();
  tube();
  ctx.strokeStyle = 'rgba(40,70,5,0.9)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // rope lashing
  ctx.save();
  ctx.beginPath();
  ctx.rect(-24, 104, 48, 22);
  ctx.clip();
  ctx.fillStyle = lin(ctx, -24, 0, 24, 0, [
    [0, '#7a5a2a'],
    [0.4, '#e6c483'],
    [1, '#7a5a2a'],
  ]);
  ctx.fillRect(-24, 104, 48, 22);
  ctx.strokeStyle = 'rgba(80,50,20,0.85)';
  ctx.lineWidth = 1.3;
  for (let x = -30; x < 30; x += 5) line(ctx, x, 104, x + 8, 126);
  ctx.restore();
  // hanging coconut
  ctx.strokeStyle = '#8a6a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(22, 120);
  ctx.quadraticCurveTo(34, 128, 32 + k * 4, 146);
  ctx.stroke();
  ctx.save();
  ctx.translate(32 + k * 4, 156);
  drawCoconut(ctx, 10);
  ctx.restore();
  // hibiscus flower
  ctx.save();
  ctx.translate(-27, 176);
  ctx.rotate(-0.3 + sw);
  for (let i = 0; i < 5; i++) {
    ctx.rotate(TAU / 5);
    ctx.beginPath();
    ctx.ellipse(0, -9, 6.4, 9.6, 0, 0, TAU);
    ctx.fillStyle = lin(ctx, 0, 0, 0, -16, [
      [0, '#c4204f'],
      [1, '#ff7aa8'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(130,10,50,0.7)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }
  ctx.strokeStyle = '#ffd84a';
  ctx.lineWidth = 2;
  line(ctx, 0, 0, 11, -13);
  ctx.fillStyle = '#ff9a1f';
  ctx.beginPath();
  ctx.arc(11, -13, 2.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  // mouth + coconut ammo
  ctx.beginPath();
  ctx.ellipse(0, 9, 25, 9.5, 0, 0, TAU);
  ctx.fillStyle = lin(ctx, -25, 0, 25, 0, [
    [0, '#7ea024'],
    [0.5, '#dcf393'],
    [1, '#6a8c1c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,70,5,0.9)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 9, 19, 6.4, 0, 0, TAU);
  ctx.fillStyle = '#10200a';
  ctx.fill();
  if (a.fireT > 0.32) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 9, 19, 6.4, 0, 0, TAU);
    ctx.clip();
    ctx.translate(0, 8 + Math.max(0, 1 - (a.fireT - 0.32) * 4) * 10);
    drawCoconut(ctx, 15);
    ctx.restore();
  }
  if (a.fireT < 0.35) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,240,200'), 0, 6, 120 * (1 - a.fireT / 0.35), 0.7 * (1 - a.fireT / 0.35));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── ANGKLUNG ─────────────────────────
function drawAngklung(ctx: Ctx, a: WeaponAnim, time: number) {
  const wood = (x0: number, x1: number) =>
    lin(ctx, x0, 0, x1, 0, [
      [0, '#6e3f1a'],
      [0.3, '#d9a066'],
      [0.55, '#e8b87a'],
      [1, '#5a3010'],
    ]);
  ctx.save();
  ctx.scale(0.95, 0.95);
  // handle
  roundRect(ctx, -9, 208, 18, 62, 6);
  ctx.fillStyle = wood(-9, 9);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,14,4,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#c1121f';
  ctx.fillRect(-9, 226, 18, 8);
  ctx.fillRect(-9, 244, 18, 8);
  // posts
  for (const x of [-42, 35]) {
    roundRect(ctx, x, 0, 7, 212, 3);
    ctx.fillStyle = wood(x, x + 7);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,14,4,0.85)';
    ctx.stroke();
  }
  // pipes
  const pipes = [
    { x: -22, len: 140 },
    { x: 0, len: 170 },
    { x: 22, len: 140 },
  ];
  pipes.forEach((p, i) => {
    const sw = (a.fireT < 1.6 ? Math.exp(-a.fireT * 3.2) * Math.sin(a.fireT * 40 + i * 1.1) * 0.2 : 0) + Math.sin(time * 1.5 + i) * 0.015;
    ctx.save();
    ctx.translate(p.x, 12);
    ctx.rotate(sw);
    ctx.strokeStyle = '#e8d8a8';
    ctx.lineWidth = 1.4;
    line(ctx, -3, -12, -1, 6);
    line(ctx, 3, -12, 1, 6);
    roundRect(ctx, -6.5, 2, 13, p.len, 5);
    ctx.fillStyle = lin(ctx, -6.5, 0, 6.5, 0, [
      [0, '#8f6a12'],
      [0.3, '#e8c050'],
      [0.5, '#fff1b0'],
      [0.75, '#d9a830'],
      [1, '#7a560a'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(90,60,5,0.85)';
    ctx.lineWidth = 1;
    ctx.stroke();
    for (const f of [0.34, 0.68]) {
      ctx.fillStyle = 'rgba(100,65,8,0.7)';
      ctx.fillRect(-7.2, 2 + p.len * f, 14.4, 3.2);
      ctx.fillStyle = 'rgba(255,240,170,0.7)';
      ctx.fillRect(-7.2, 2 + p.len * f - 1, 14.4, 1);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(-3.8, 6, 2.4, p.len - 8);
    ctx.fillStyle = '#2a1604';
    ctx.beginPath();
    ctx.ellipse(0, 3, 4.6, 1.8, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 2 + p.len, 4.6, 2, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  });
  // rails (front)
  for (const [y, h] of [
    [0, 12],
    [196, 14],
  ]) {
    roundRect(ctx, -46, y, 92, h, 4);
    ctx.fillStyle = lin(ctx, 0, y, 0, y + h, [
      [0, '#e8b87a'],
      [0.5, '#b4763a'],
      [1, '#5a3010'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,14,4,0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.fillStyle = '#ffd23f';
  for (const x of [-38, -14, 14, 38]) ctx.beginPath(), ctx.arc(x, 6, 2, 0, TAU), ctx.fill();
  if (a.fireT < 0.45) {
    const h = 1 - a.fireT / 0.45;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,215,100'), 0, 2, 150 * h, 0.7 * h);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── BEE HIVE GUN ─────────────────────────
function drawBeeHive(ctx: Ctx, a: WeaponAnim, time: number) {
  const pulse = a.fireT < 0.4 ? Math.exp(-a.fireT * 6) * Math.sin(a.fireT * 44) : 0;
  const jit = Math.sin(time * 38) * 0.35;
  ctx.save();
  ctx.scale(0.88, 0.88);
  // grip
  roundRect(ctx, -11, 206, 22, 66, 7);
  ctx.fillStyle = lin(ctx, -11, 0, 11, 0, [
    [0, '#1a0e04'],
    [0.5, '#4a2c10'],
    [1, '#160a02'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,200,80,0.45)';
  for (let i = 0; i < 4; i++) line(ctx, -8, 224 + i * 10, 8, 224 + i * 10);
  ctx.save();
  ctx.translate(jit, 0);
  ctx.translate(0, 110);
  ctx.scale(1 + 0.07 * pulse, 1 - 0.05 * pulse);
  ctx.translate(0, -110);
  const hw = [16, 28, 38, 46, 51, 50, 44, 36];
  hw.forEach((w, i) => {
    const y = 14 + i * 25;
    roundRect(ctx, -w, y - 13, w * 2, 28, 13);
    ctx.fillStyle = lin(ctx, -w, 0, w, 0, [
      [0, '#9a5a08'],
      [0.25, '#e8a82a'],
      [0.5, '#ffdb6a'],
      [0.75, '#e0a020'],
      [1, '#7a4806'],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(110,60,0,0.9)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(140,80,10,0.5)';
    ctx.lineWidth = 0.9;
    for (let x = -w + 8; x < w - 4; x += 7) line(ctx, x, y - 8, x + 1.5, y + 8);
    ctx.fillStyle = 'rgba(255,245,180,0.3)';
    roundRect(ctx, -w + 6, y - 11, w * 0.5, 4, 2);
    ctx.fill();
  });
  // entrance
  ctx.beginPath();
  ctx.ellipse(8, 160, 12, 8, 0, 0, TAU);
  ctx.fillStyle = '#1a0c02';
  ctx.fill();
  ctx.strokeStyle = '#6a3a00';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  // top opening
  ctx.beginPath();
  ctx.ellipse(0, 2, 11, 5, 0, 0, TAU);
  ctx.fillStyle = '#e8a82a';
  ctx.fill();
  ctx.strokeStyle = '#6a3a00';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(0, 2, 7, 3, 0, 0, TAU);
  ctx.fillStyle = '#1a0c02';
  ctx.fill();
  // drips
  for (const [dx, L] of [
    [-18, 14],
    [10, 20],
    [26, 10],
  ]) {
    const len = L + Math.sin(time * 1.5 + dx) * 2.4;
    ctx.beginPath();
    ctx.moveTo(dx - 3, 192);
    ctx.lineTo(dx + 3, 192);
    ctx.lineTo(dx + 2, 192 + len);
    ctx.arc(dx, 192 + len, 2.4, 0, Math.PI);
    ctx.closePath();
    ctx.fillStyle = '#ffc928';
    ctx.fill();
    ctx.strokeStyle = '#a85500';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();
  // bees buzzing around
  for (let i = 0; i < 3; i++) {
    const ang = time * (2.6 + i * 0.5) + i * 2.1;
    const rr = 22 + i * 6;
    ctx.save();
    ctx.translate(8 + Math.cos(ang) * rr, 160 + Math.sin(ang * 1.3) * rr * 0.55);
    ctx.rotate(Math.cos(ang) * 0.6);
    drawBee(ctx, 0.78, Math.sin(time * 70 + i * 2));
    ctx.restore();
  }
  if (a.fireT < 0.4) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,200,60'), 0, 2, 120 * (1 - a.fireT / 0.4), 0.7 * (1 - a.fireT / 0.4));
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── SAKURA BLOSSOM ─────────────────────────
function drawSakuraLauncher(ctx: Ctx, a: WeaponAnim, time: number) {
  const fo = a.fireT < 0.6 ? Math.sin((a.fireT / 0.6) * Math.PI) : 0;
  ctx.save();
  ctx.scale(0.9, 0.9);
  const lac = (x0: number, x1: number) =>
    lin(ctx, x0, 0, x1, 0, [
      [0, '#5a0f12'],
      [0.25, '#b3262c'],
      [0.5, '#ee4a52'],
      [0.75, '#a31f25'],
      [1, '#4a0b0e'],
    ]);
  const gold = (x0: number, x1: number) =>
    lin(ctx, x0, 0, x1, 0, [
      [0, '#7a4a08'],
      [0.35, '#f0c458'],
      [0.55, '#fff0b8'],
      [1, '#7a4a08'],
    ]);
  // grip
  roundRect(ctx, -12, 224, 24, 48, 7);
  ctx.fillStyle = lac(-12, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,3,5,0.85)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // fan (behind tube, top-right)
  ctx.save();
  ctx.translate(20, 82);
  const spread = 0.95 + fo * 0.5;
  const c0 = -Math.PI / 2 + 0.5 - spread / 2;
  const c1 = -Math.PI / 2 + 0.5 + spread / 2;
  const FR = 70;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, FR, c0, c1);
  ctx.closePath();
  const fg = ctx.createRadialGradient(0, 0, 4, 0, 0, FR);
  fg.addColorStop(0, '#ffd0e0');
  fg.addColorStop(0.7, '#ff9fc0');
  fg.addColorStop(1, '#ffe6ee');
  ctx.fillStyle = fg;
  ctx.fill();
  ctx.strokeStyle = '#8a1f45';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(150,30,70,0.6)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const an = c0 + ((c1 - c0) * i) / 8;
    line(ctx, 0, 0, Math.cos(an) * FR, Math.sin(an) * FR);
  }
  ctx.save();
  ctx.rotate((c0 + c1) / 2 + Math.PI / 2);
  ctx.translate(0, -FR * 0.62);
  drawBlossom(ctx, 11, 1, time * 0.3);
  ctx.restore();
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.arc(0, 0, 3.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  // tube
  roundRect(ctx, -25, 8, 50, 222, 8);
  ctx.fillStyle = lac(-25, 25);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(ctx, -17, 14, 5, 208, 2.5);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,3,5,0.9)';
  ctx.lineWidth = 1.4;
  roundRect(ctx, -25, 8, 50, 222, 8);
  ctx.stroke();
  // gold bands with wave pattern
  for (const [y, h] of [
    [8, 14],
    [112, 8],
    [218, 12],
  ]) {
    ctx.save();
    roundRect(ctx, -26, y, 52, h, 3);
    ctx.fillStyle = gold(-26, 26);
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(120,70,5,0.65)';
    ctx.lineWidth = 0.8;
    for (let x = -24; x <= 24; x += 8)
      for (const r of [2.4, 4.2, 6]) {
        ctx.beginPath();
        ctx.arc(x, y + h, r, Math.PI, TAU);
        ctx.stroke();
      }
    ctx.restore();
  }
  // blossoms decoration
  ctx.strokeStyle = '#d8a84a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-18, 100);
  ctx.quadraticCurveTo(-4, 80, 12, 62);
  ctx.moveTo(14, 196);
  ctx.quadraticCurveTo(0, 170, -10, 148);
  ctx.stroke();
  for (const [x, y, r] of [
    [-5, 60, 11],
    [10, 150, 9],
    [-8, 192, 7.5],
    [13, 90, 6],
  ] as [number, number, number][]) {
    ctx.save();
    ctx.translate(x, y);
    drawBlossom(ctx, r, 1, x * 0.1);
    ctx.restore();
  }
  // mouth
  ctx.beginPath();
  ctx.ellipse(0, 10, 22, 8, 0, 0, TAU);
  ctx.fillStyle = '#2a0508';
  ctx.fill();
  ctx.strokeStyle = '#f0c458';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,150,190'), 0, 8, 54 + fo * 80, 0.5 + fo * 0.4);
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    const ph = (time * 0.4 + i * 0.33) % 1;
    ctx.save();
    ctx.translate(Math.sin(time * 2 + i * 2) * 8, 6 - ph * 22);
    ctx.rotate(time + i);
    ctx.globalAlpha = 1 - ph;
    drawPetal(ctx, 5.4);
    ctx.restore();
  }
  ctx.restore();
}

// ───────────────────────── FIREWORK LAUNCHER ─────────────────────────
function drawFireworkLauncher(ctx: Ctx, a: WeaponAnim, time: number) {
  ctx.save();
  ctx.scale(0.92, 0.92);
  const cols = [
    ['#8a1220', '#e5283d', '#ff8a96'],
    ['#18439b', '#2f7bff', '#9cc4ff'],
    ['#a87608', '#ffd23a', '#fff1a0'],
  ];
  // handle pole
  roundRect(ctx, -9, 190, 18, 78, 5);
  ctx.fillStyle = lin(ctx, -9, 0, 9, 0, [
    [0, '#141414'],
    [0.5, '#4a4a4e'],
    [1, '#101010'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = '#ffd23f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) line(ctx, -9, 214 + i * 12, 9, 214 + i * 12);
  // Red/yellow sit closer together, slightly lower, and behind blue.
  const order = [0, 2, 1];
  for (const ti of order) {
    const x = (ti - 1) * 15;
    const top = ti === 1 ? -4 : 8;
    const rec = a.idx === ti && a.fireT < 0.35 ? Math.exp(-a.fireT * 9) * 7 : 0;
    ctx.save();
    ctx.translate(0, rec);
    roundRect(ctx, x - 9.5, top, 19, 196 - top, 3);
    ctx.fillStyle = lin(ctx, x - 9.5, 0, x + 9.5, 0, [
      [0, cols[ti][0]],
      [0.45, cols[ti][1]],
      [0.7, cols[ti][2]],
      [1, cols[ti][0]],
    ]);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.save();
    roundRect(ctx, x - 9.5, top, 19, 196 - top, 3);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    for (let y = top + 18; y < 196; y += 18) line(ctx, x - 10, y, x + 10, y - 9);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const sy of [60, 126]) {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const rr = i % 2 ? 2.2 : 5.4;
        const an = -Math.PI / 2 + (i * Math.PI) / 5;
        ctx.lineTo(x + Math.cos(an) * rr, sy + Math.sin(an) * rr);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // open rim
    ctx.beginPath();
    ctx.ellipse(x, top, 9.5, 3.6, 0, 0, TAU);
    ctx.fillStyle = '#1a1a1c';
    ctx.fill();
    ctx.strokeStyle = '#d8d8dc';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // All three openings have a colorful rocket waiting, like skin 1.
    // Briefly dip the just-fired one into its tube as it reloads.
    const loading = a.idx === ti && a.fireT < 0.34 ? Math.sin(Math.PI * a.fireT / 0.34) * 8 : 0;
    ctx.save(); ctx.translate(x, top + 5 + loading);
    drawFireRocket(ctx, ti, 0, time, 0);
    ctx.restore();
    if (a.idx === ti && a.fireT < 0.5) {
      const h = 1 - a.fireT / 0.5;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,190,80'), x, top, 70 * h + 10, 0.8 * h);
      ctx.restore();
    }
    ctx.restore();
  }
  // binding straps
  for (const y of [74, 150]) {
    ctx.fillStyle = '#101012';
    roundRect(ctx, -30, y, 60, 9, 3);
    ctx.fill();
    ctx.fillStyle = '#ffd23f';
    ctx.fillRect(-30, y + 3, 60, 1.6);
  }
  // fuse with live spark
  ctx.strokeStyle = '#d8b878';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 38);
  ctx.quadraticCurveTo(38, 36, 34, 26);
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fl = 0.6 + 0.4 * Math.sin(time * 34);
  drawSprite(ctx, glowSprite('255,190,80'), 34, 26, 20 + 8 * fl, 0.9);
  drawSprite(ctx, starSprite('255,240,190'), 34, 26, 14 + 8 * fl, fl, time * 5);
  ctx.restore();
  ctx.restore();
}

// ───────────────────────── KERIS SAKTI ─────────────────────────
function drawKerisWeapon(ctx: Ctx, a: WeaponAnim, time: number) {
  const fire = a.fireT < 0.7 ? 1 - a.fireT / 0.7 : 0;
  ctx.save();
  ctx.scale(0.95, 0.95);
  // mystic aura + faint mandala
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite('255,200,80'), 0, 80, 230, 0.3 + 0.08 * Math.sin(time * 2.4) + fire * 0.5);
  ctx.translate(0, 92);
  ctx.rotate(time * 0.5);
  ctx.strokeStyle = `rgba(255,224,130,${0.14 + fire * 0.4})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.arc(0, 0, 64, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const rr = i % 2 ? 30 : 60;
    const an = (i * Math.PI) / 8;
    if (i === 0) ctx.moveTo(Math.cos(an) * rr, Math.sin(an) * rr);
    else ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
  drawKeris(ctx, 160, 26);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  if (fire > 0) {
    for (const u of [0.12, 0.3, 0.5, 0.7, 0.9]) drawSprite(ctx, glowSprite('255,240,190'), 0, u * 160, 46, fire * 0.7);
    drawKerisBlade(ctx, 160, 26, 7, 7.8);
  }
  drawSprite(ctx, glowSprite('255,70,80'), 2.6, 162, 20, 0.5 + 0.2 * Math.sin(time * 4));
  const ph = (time * 0.5) % 1;
  if (ph < 0.6) {
    const k = Math.sin((ph / 0.6) * Math.PI);
    drawSprite(ctx, starSprite('255,245,200'), 0, 10 + (ph / 0.6) * 140, 28 * k, k, time);
  }
  ctx.restore();
  ctx.restore();
}

