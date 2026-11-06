import type { WeaponId } from '../weapons';
import { TAU, rand, lin, vlin, steel, chrome, brass, rr, grip, guard, glow, jag, star, radial, gunState } from './kit';
import {
  slingshot, blowgun, shotgun, soaker, snowball, SNOWBALL_MAG_SIZE, sniper, flamethrower, bamboo, banana,
  bubbleGun, harpoon, chickenGun, confettiGun, seedGun,
} from './guns2';
import { drawGunExtra2, FLASH2, FLASH3 } from './guns4';
import { discGun } from './guns6';
import { drawChronoGrip, drawPortalGrip } from './gripSystem';

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- PIZZA
function pizzaGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const kick = gunState.sinceShot >= 0 && gunState.sinceShot < 0.3
    ? Math.sin((Math.PI * gunState.sinceShot) / 0.3) : 0;

  c.save();
  c.translate(0, kick * 5);

  const orangeOven = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#7c2d12', '#c2410c', '#f97316', '#fed7aa', '#ea580c', '#7c2d12']);
  const creamCrust = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#92400e', '#d97706', '#fcd34d', '#fef3c7', '#f59e0b', '#78350f']);
  const darkSlate = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d16', '#1e293b', '#475569', '#94a3b8', '#1e293b']);

  // ══════════════════ 1. ERGONOMIC RED & CHARCOAL PISTOL GRIP + ORANGE CARRY HANDLE (matching PIZZA LAUNCHER image!) ══════════════════
  // Orange & Slate Carry Handle / Sight Bracket on upper-left (`-x`, `cx - 23 .. cx - 14, y0 + 80 .. y0 + 112`)
  c.beginPath();
  c.moveTo(cx - 15, y0 + 80);
  c.lineTo(cx - 22.5, y0 + 84);
  c.lineTo(cx - 22.5, y0 + 108);
  c.lineTo(cx - 15, y0 + 112);
  c.lineTo(cx - 15, y0 + 105);
  c.lineTo(cx - 18.5, y0 + 103);
  c.lineTo(cx - 18.5, y0 + 89);
  c.lineTo(cx - 15, y0 + 87);
  c.closePath();
  c.fillStyle = orangeOven(cx - 23, cx - 15);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.84)';
  c.lineWidth = 0.82;
  c.stroke();

  // Dark Slate Trigger Guard & Curved Orange Trigger on right (`+x`, `cx + 12 .. cx + 28, y0 + 96 .. y0 + 120`)
  c.beginPath();
  c.moveTo(cx + 13, y0 + 94);
  c.bezierCurveTo(cx + 28, y0 + 98, cx + 29, y0 + 116, cx + 15, y0 + 121);
  c.lineTo(cx + 12, y0 + 116);
  c.bezierCurveTo(cx + 22, y0 + 113, cx + 22, y0 + 101, cx + 12, y0 + 99);
  c.closePath();
  c.fillStyle = darkSlate(cx + 12, cx + 29);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.84)';
  c.lineWidth = 0.82;
  c.stroke();

  // Curved Orange Trigger inside guard
  c.beginPath();
  c.moveTo(cx + 13, y0 + 101);
  c.quadraticCurveTo(cx + 21, y0 + 106, cx + 17, y0 + 114);
  c.lineTo(cx + 12, y0 + 112);
  c.closePath();
  c.fillStyle = orangeOven(cx + 12, cx + 21);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.8)';
  c.lineWidth = 0.75;
  c.stroke();

  // Ergonomic Dark-Slate & Crimson-Red Pistol Grip (`cx + 1 .. cx + 36, y0 + 108 .. y0 + 166`)
  c.beginPath();
  c.moveTo(cx + 1, y0 + 116);
  c.lineTo(cx + 16, y0 + 108);
  c.bezierCurveTo(cx + 24, y0 + 124, cx + 32, y0 + 140, cx + 36, y0 + 154);
  c.quadraticCurveTo(cx + 37, y0 + 161, cx + 30, y0 + 164);
  c.lineTo(cx + 15, y0 + 166);
  c.quadraticCurveTo(cx + 8, y0 + 165, cx + 7, y0 + 157);
  c.bezierCurveTo(cx + 5, y0 + 142, cx + 3, y0 + 128, cx + 1, y0 + 116);
  c.closePath();
  c.fillStyle = darkSlate(cx + 1, cx + 36);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.86)';
  c.lineWidth = 0.9;
  c.stroke();

  // Crimson-Red Textured Grip Insert inside the dark-slate handle (matching PIZZA LAUNCHER image!)
  c.beginPath();
  c.moveTo(cx + 6, y0 + 121);
  c.lineTo(cx + 15, y0 + 116);
  c.bezierCurveTo(cx + 21, y0 + 130, cx + 28, y0 + 143, cx + 31, y0 + 156);
  c.lineTo(cx + 17, y0 + 159);
  c.bezierCurveTo(cx + 13, y0 + 145, cx + 9, y0 + 132, cx + 6, y0 + 121);
  c.closePath();
  c.fillStyle = lin(c, cx + 6, cx + 31, ['#7f1d1d', '#dc2626', '#f87171', '#b91c1c']);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.8)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 2. CHUNKY CYLINDRICAL PIZZERIA CANNON BARREL WITH CHECKERBOARD & PIZZA EMBLEM (matching PIZZA LAUNCHER image!) ══════════════════
  c.save();
  c.beginPath();
  c.roundRect(cx - 17.5, y0 + 24, 35, 106, [8, 8, 15, 15]);
  c.clip();

  // Upper Toasted Cream-Gold Barrel (`y0 + 24 .. y0 + 92`)
  c.fillStyle = creamCrust(cx - 17.5, cx + 17.5);
  c.fillRect(cx - 18, y0 + 24, 36, 70);

  // Lower Warm Orange Breech (`y0 + 92 .. y0 + 130`)
  c.fillStyle = orangeOven(cx - 17.5, cx + 17.5);
  c.fillRect(cx - 18, y0 + 92, 36, 38);

  // Red-and-White Checkered Pizzeria Band (`y0 + 88 .. y0 + 104`, matching PIZZA LAUNCHER image!)
  const sqW = 5.8;
  const sqH = 5.4;
  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 7; col++) {
      c.fillStyle = (r + col) % 2 === 0 ? '#dc2626' : '#fef2f2';
      c.fillRect(cx - 18 + col * sqW, y0 + 88 + r * sqH, sqW + 0.3, sqH + 0.3);
    }
  }
  c.strokeStyle = 'rgba(124,45,18,0.75)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx - 18, y0 + 88);
  c.lineTo(cx + 18, y0 + 88);
  c.moveTo(cx - 18, y0 + 104.2);
  c.lineTo(cx + 18, y0 + 104.2);
  c.stroke();

  // Melted Gooey Cheddar/Mozzarella Cheese Drips along the upper barrel edge (matching PIZZA LAUNCHER image!)
  c.fillStyle = '#facc15';
  c.strokeStyle = 'rgba(180,83,9,0.7)';
  c.lineWidth = 0.75;
  c.beginPath();
  c.moveTo(cx - 18, y0 + 24);
  c.lineTo(cx - 9, y0 + 24);
  c.quadraticCurveTo(cx - 8, y0 + 44, cx - 11.5, y0 + 46);
  c.quadraticCurveTo(cx - 14, y0 + 44, cx - 13.5, y0 + 36);
  c.quadraticCurveTo(cx - 15, y0 + 58, cx - 18, y0 + 56);
  c.closePath();
  c.fill();
  c.stroke();

  // Iconic Pizza Slice Emblem in the center of the barrel (`cx, y0 + 62`, pointing toward the muzzle!)
  c.save();
  c.translate(cx + 0.5, y0 + 64);
  // Golden crust base
  c.beginPath();
  c.moveTo(0, -15);
  c.lineTo(10.5, 10);
  c.quadraticCurveTo(0, 14, -10.5, 10);
  c.closePath();
  c.fillStyle = '#d97706';
  c.fill();
  c.strokeStyle = '#7c2d12';
  c.lineWidth = 0.85;
  c.stroke();
  // Red/yellow pizza slice interior
  c.beginPath();
  c.moveTo(0, -13);
  c.lineTo(8.2, 6.5);
  c.quadraticCurveTo(0, 9.5, -8.2, 6.5);
  c.closePath();
  c.fillStyle = '#ef4444';
  c.fill();
  // Pepperoni dots on the emblem slice
  c.fillStyle = '#fde047';
  for (const [px, py, pr] of [[0, -4, 2.0], [-3.2, 3, 2.1], [3.2, 2.5, 2.0]] as [number, number, number][]) {
    c.beginPath();
    c.arc(px, py, pr, 0, TAU);
    c.fill();
  }
  c.restore();

  // Cylindrical specular highlight & shadow overlay across the barrel
  const cylG = c.createLinearGradient(cx - 17.5, y0, cx + 17.5, y0);
  cylG.addColorStop(0, 'rgba(67,20,7,0.38)');
  cylG.addColorStop(0.24, 'rgba(255,255,255,0.36)');
  cylG.addColorStop(0.5, 'rgba(255,255,255,0)');
  cylG.addColorStop(1, 'rgba(67,20,7,0.48)');
  c.fillStyle = cylG;
  c.fillRect(cx - 18, y0 + 24, 36, 106);
  c.restore();

  // Outer contour of the cylindrical pizzeria cannon barrel
  c.beginPath();
  c.roundRect(cx - 17.5, y0 + 24, 35, 106, [8, 8, 15, 15]);
  c.strokeStyle = 'rgba(67,20,7,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // ══════════════════ 3. THICK FLARED ORANGE OVEN-MOUTH MUZZLE COLLAR (`y0 + 17 .. y0 + 31`) ══════════════════
  c.beginPath();
  c.ellipse(cx, y0 + 24, 21.5, 7.2, 0, 0, TAU);
  c.fillStyle = orangeOven(cx - 21.5, cx + 21.5);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // Deep dark-red/brown oven mouth bore
  c.beginPath();
  c.ellipse(cx, y0 + 23.2, 16.2, 4.8, 0, 0, TAU);
  c.fillStyle = lin(c, cx - 16, cx + 16, ['#2a0a04', '#7c2d12', '#431407']);
  c.fill();
  c.strokeStyle = 'rgba(254,215,170,0.65)';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 4. WHOLE PEPPERONI PIZZA LAUNCHING OUT WITH STRETCHY MELTED CHEESE STRANDS (matching PIZZA LAUNCHER image!) ══════════════════
  if (ready || gunState.inPreview) {
    const pBob = Math.sin(t * 4.5) * 1.5;
    const py = y0 - 4 + pBob;

    // Stretchy golden melted cheese strands connecting the launching pizza back into the oven mouth!
    c.save();
    c.lineCap = 'round';
    c.strokeStyle = '#ca8a04';
    c.lineWidth = 3.2;
    for (const [sx0, sy0, cxm, cym, sx1, sy1] of [
      [cx - 9, y0 + 23, cx - 11, y0 + 11, cx - 10, py + 7],
      [cx - 1, y0 + 24, cx - 2, y0 + 12, cx - 1, py + 10],
      [cx + 8, y0 + 23, cx + 10, y0 + 11, cx + 9, py + 7],
    ] as [number, number, number, number, number, number][]) {
      c.beginPath();
      c.moveTo(sx0, sy0);
      c.quadraticCurveTo(cxm, cym, sx1, sy1);
      c.stroke();
    }
    c.strokeStyle = '#fef08a';
    c.lineWidth = 1.6;
    for (const [sx0, sy0, cxm, cym, sx1, sy1] of [
      [cx - 9, y0 + 23, cx - 11, y0 + 11, cx - 10, py + 7],
      [cx - 1, y0 + 24, cx - 2, y0 + 12, cx - 1, py + 10],
      [cx + 8, y0 + 23, cx + 10, y0 + 11, cx + 9, py + 7],
    ] as [number, number, number, number, number, number][]) {
      c.beginPath();
      c.moveTo(sx0, sy0);
      c.quadraticCurveTo(cxm, cym, sx1, sy1);
      c.stroke();
    }
    c.restore();

    // Whole 3D Pepperoni Pizza (`cx, py`)
    c.save();
    c.translate(cx, py);
    // Puffy golden-brown baked crust rim
    c.beginPath();
    c.ellipse(0, 0, 15.8, 13.5, -0.08, 0, TAU);
    c.fillStyle = radial(c, -3, -3, 16, ['#fde68a', '#f59e0b', '#d97706', '#78350f']);
    c.fill();
    c.strokeStyle = 'rgba(67,20,7,0.85)';
    c.lineWidth = 0.9;
    c.stroke();

    // Melted golden-yellow mozzarella/cheddar cheese layer
    c.beginPath();
    c.ellipse(0, 0, 12.6, 10.6, -0.08, 0, TAU);
    c.fillStyle = radial(c, -2, -2, 13, ['#fef9c3', '#facc15', '#eab308']);
    c.fill();
    c.strokeStyle = 'rgba(180,83,9,0.68)';
    c.lineWidth = 0.72;
    c.stroke();

    // 7 Savory Red Pepperoni Slices on the pizza
    for (const [rx, ry, rrP] of [
      [0, 0, 2.4],
      [-6.5, -2.5, 2.5],
      [6.2, -3.0, 2.4],
      [-5.2, 4.5, 2.5],
      [5.5, 4.2, 2.4],
      [-0.5, -6.2, 2.2],
      [0.5, 6.2, 2.2],
    ] as [number, number, number][]) {
      c.beginPath();
      c.ellipse(rx, ry, rrP, rrP * 0.86, 0, 0, TAU);
      c.fillStyle = '#dc2626';
      c.fill();
      c.strokeStyle = '#7f1d1d';
      c.lineWidth = 0.6;
      c.stroke();
      // Tiny white fat specks on pepperoni
      c.fillStyle = '#fecaca';
      c.beginPath();
      c.arc(rx - 0.6, ry - 0.4, 0.45, 0, TAU);
      c.fill();
    }

    // Green basil/oregano herb flecks
    c.fillStyle = '#16a34a';
    for (const [gx, gy] of [[-3, -2], [3, 1], [-2, 3], [2, -4]] as [number, number][]) {
      c.beginPath();
      c.arc(gx, gy, 0.85, 0, TAU);
      c.fill();
    }
    c.restore();

    // Flying cheese & sauce droplets around the launching pizza (matching PIZZA LAUNCHER image!)
    for (const [dx, dy, dr, dcol] of [
      [-18, 12, 2.0, '#facc15'],
      [18, 9, 2.2, '#facc15'],
      [15, 19, 1.7, '#ef4444'],
      [-15, 24, 1.8, '#ef4444'],
      [21, -2, 1.6, '#fde047'],
    ] as [number, number, number, string][]) {
      c.fillStyle = dcol;
      c.beginPath();
      c.arc(cx + dx, y0 + dy + pBob * 0.6, dr, 0, TAU);
      c.fill();
    }
  }

  c.restore();
}

// ------------------------------------------------------------- MINIGUN
function minigun(c: C, cx: number, y0: number) {
  const sp = gunState.spinAngle;
  // spade grips
  for (const s of [-1, 1]) {
    c.strokeStyle = '#1f2937';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 196);
    c.lineTo(cx + s * 30, y0 + 222);
    c.stroke();
    rr(c, cx + s * 30 - 6, y0 + 218, 12, 22, 4, '#111');
  }
  // ammo belt
  c.save();
  for (let i = 0; i < 9; i++) {
    const bx = cx + 26 + i * 4;
    const by = y0 + 150 + i * 9 + Math.sin(i * 0.8) * 3;
    c.save();
    c.translate(bx, by);
    c.rotate(0.6);
    c.fillStyle = '#c28f22';
    c.fillRect(-2.5, -8, 5, 12);
    c.fillStyle = '#b45309';
    c.beginPath();
    c.moveTo(-2.5, -8);
    c.lineTo(0, -13);
    c.lineTo(2.5, -8);
    c.fill();
    c.fillStyle = '#374151';
    c.fillRect(-4, 2, 8, 3);
    c.restore();
  }
  c.restore();
  // motor housing
  rr(c, cx - 22, y0 + 128, 44, 70, 8, lin(c, cx - 22, cx + 22, ['#0b0c0e', '#4b5563', '#1f2937', '#0b0c0e']), '#000');
  c.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 5; i++) c.fillRect(cx - 16, y0 + 140 + i * 9, 32, 3);
  glow(c, cx - 12, y0 + 186, 2.5, gunState.spin > 0.3 ? '#22c55e' : '#ef4444', 8);
  // carry handle
  c.strokeStyle = '#111827';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(cx - 22, y0 + 136);
  c.quadraticCurveTo(cx - 40, y0 + 160, cx - 22, y0 + 186);
  c.stroke();
  // rotating barrels (6) — draw back ones first
  const barrels = Array.from({ length: 6 }, (_, k) => {
    const a = sp + (k / 6) * TAU;
    return { x: Math.cos(a) * 10, z: Math.sin(a) };
  }).sort((a, b) => a.z - b.z);
  for (const b of barrels) {
    const shade = Math.round(40 + (b.z + 1) * 50);
    c.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
    c.fillRect(cx + b.x - 3, y0 + 2, 6, 128);
    c.fillStyle = 'rgba(255,255,255,0.15)';
    c.fillRect(cx + b.x - 1.5, y0 + 2, 1.2, 128);
  }
  for (const by of [y0 + 6, y0 + 58, y0 + 112]) rr(c, cx - 16, by, 32, 8, 3, steel(c, cx - 16, cx + 16), '#000', 1);
  if (gunState.spin > 0.5) {
    c.save();
    c.globalAlpha = (gunState.spin - 0.5) * 0.8;
    c.fillStyle = 'rgba(200,210,220,0.25)';
    c.fillRect(cx - 14, y0 + 14, 28, 96);
    c.restore();
  }
}

// ------------------------------------------------------------- RAILGUN
function railgun(c: C, cx: number, y0: number, t: number) {
  const kick = gunState.sinceShot >= 0 && gunState.sinceShot < 0.3
    ? Math.sin((Math.PI * gunState.sinceShot) / 0.3) : 0;
  const pulse = 0.72 + 0.28 * Math.sin(t * 6);

  c.save();
  c.translate(0, kick * 5);

  const indigoArmor = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#070916', '#1e1b4b', '#312e81', '#6366f1', '#94a3b8', '#1e293b', '#090d1c']);
  const orangeGlowFrame = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#9a3412', '#f97316', '#fde047', '#fb923c', '#9a3412']);

  // ══════════════════ 1. ERGONOMIC DARK-INDIGO TACTICAL GRIP, REAR CYAN LOOP & HEX TRIGGER GUARD (y0 + 144 .. y0 + 214, matching RAILGUN image 1!) ══════════════════
  // Rear Hammer / Lanyard Loop with Glowing Cyan Accents on upper-left of grip (`cx - 20 .. cx - 9, y0 + 144 .. y0 + 166`)
  c.beginPath();
  c.moveTo(cx - 10, y0 + 145);
  c.lineTo(cx - 18.5, y0 + 149);
  c.lineTo(cx - 19.5, y0 + 161);
  c.lineTo(cx - 11, y0 + 166);
  c.lineTo(cx - 10, y0 + 161);
  c.lineTo(cx - 15.5, y0 + 158);
  c.lineTo(cx - 15, y0 + 152);
  c.lineTo(cx - 9.5, y0 + 149);
  c.closePath();
  c.fillStyle = indigoArmor(cx - 20, cx - 9);
  c.fill();
  c.strokeStyle = 'rgba(7,9,22,0.88)';
  c.lineWidth = 0.85;
  c.stroke();

  // Glowing cyan energy nodes on the rear hammer/loop
  c.save();
  c.shadowColor = '#22d3ee';
  c.shadowBlur = 5;
  c.strokeStyle = '#67e8f9';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 12, y0 + 143);
  c.lineTo(cx - 8, y0 + 146);
  c.moveTo(cx - 9.5, y0 + 152);
  c.lineTo(cx - 9.5, y0 + 164);
  c.stroke();
  c.restore();

  // Beveled Hexagonal Dark-Indigo Trigger Guard & Trigger on right (`+x`, `cx + 4 .. cx + 19, y0 + 148 .. y0 + 172`)
  c.beginPath();
  c.moveTo(cx + 6, y0 + 148);
  c.lineTo(cx + 18.5, y0 + 153);
  c.lineTo(cx + 18.5, y0 + 165);
  c.lineTo(cx + 8, y0 + 171);
  c.lineTo(cx + 5, y0 + 166);
  c.lineTo(cx + 14, y0 + 162);
  c.lineTo(cx + 14, y0 + 155);
  c.lineTo(cx + 5, y0 + 152);
  c.closePath();
  c.fillStyle = indigoArmor(cx + 5, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(7,9,22,0.86)';
  c.lineWidth = 0.85;
  c.stroke();

  // Curved dark trigger inside guard
  c.beginPath();
  c.moveTo(cx + 7, y0 + 154);
  c.quadraticCurveTo(cx + 12, y0 + 159, cx + 9, y0 + 165);
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 1.8;
  c.stroke();

  // Main Sculpted Dark-Indigo Tactical Grip (`cx - 15 .. cx + 11, y0 + 148 .. y0 + 206`)
  c.beginPath();
  c.moveTo(cx - 10, y0 + 148);
  c.lineTo(cx + 7, y0 + 148);
  c.lineTo(cx + 5, y0 + 166);
  c.quadraticCurveTo(cx + 10, y0 + 172, cx + 6, y0 + 180);
  c.lineTo(cx + 8, y0 + 202);
  c.lineTo(cx - 13, y0 + 202);
  c.lineTo(cx - 10.5, y0 + 168);
  c.closePath();
  c.fillStyle = indigoArmor(cx - 14, cx + 10);
  c.fill();
  c.strokeStyle = 'rgba(7,9,22,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  // Inset Stippled Dark Grip Panel (`y0 + 166 .. y0 + 198`) + Silver Bolt
  c.beginPath();
  c.roundRect(cx - 7.5, y0 + 166, 11.5, 31, 3);
  c.fillStyle = '#090d1c';
  c.fill();
  c.strokeStyle = 'rgba(99,102,241,0.45)';
  c.lineWidth = 0.78;
  c.stroke();
  c.fillStyle = 'rgba(148,163,184,0.28)';
  for (let r = 0; r < 6; r++) {
    for (let col = 0; col < 2; col++) {
      c.beginPath();
      c.arc(cx - 4 + col * 4.5, y0 + 170 + r * 4.4, 0.75, 0, TAU);
      c.fill();
    }
  }
  c.fillStyle = '#cbd5e1';
  c.beginPath();
  c.arc(cx - 5, y0 + 193, 1.6, 0, TAU);
  c.fill();

  // Chunky Flared Dark-Indigo Tactical Pommel Base (`cx - 17 .. cx + 11, y0 + 198 .. y0 + 213`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 16.5, y0 + 198);
  c.lineTo(cx + 10.5, y0 + 199);
  c.lineTo(cx + 9.5, y0 + 211);
  c.lineTo(cx - 4, y0 + 214);
  c.lineTo(cx - 17, y0 + 206);
  c.closePath();
  c.fillStyle = indigoArmor(cx - 17, cx + 10.5);
  c.fill();
  c.strokeStyle = 'rgba(7,9,22,0.9)';
  c.lineWidth = 0.9;
  c.stroke();

  // ══════════════════ 2. REVOLVER-STYLE DARK-INDIGO RECEIVER WITH 3 GLOWING CYAN SLOTS & ORANGE VENTS (y0 + 96 .. y0 + 154, matching image 1!) ══════════════════
  c.beginPath();
  c.moveTo(cx - 17, y0 + 96);
  c.lineTo(cx + 17, y0 + 96);
  c.lineTo(cx + 21, y0 + 106);
  c.lineTo(cx + 20, y0 + 136);
  c.lineTo(cx + 12, y0 + 152);
  c.lineTo(cx - 12, y0 + 150);
  c.lineTo(cx - 19.5, y0 + 134);
  c.lineTo(cx - 19.5, y0 + 105);
  c.closePath();
  c.fillStyle = indigoArmor(cx - 21, cx + 21);
  c.fill();
  c.strokeStyle = 'rgba(7,9,22,0.9)';
  c.lineWidth = 0.92;
  c.stroke();

  // 3 Vertical Glowing Neon-Cyan Capacitor Slots across the upper receiver drum (`y0 + 103 .. y0 + 129`, matching image 1!)
  for (let i = -1; i <= 1; i++) {
    const sx = cx + i * 10.2;
    c.beginPath();
    c.roundRect(sx - 3.6, y0 + 103, 7.2, 25, 2.6);
    c.fillStyle = '#08142c';
    c.fill();
    c.strokeStyle = 'rgba(56,189,248,0.75)';
    c.lineWidth = 0.8;
    c.stroke();

    c.save();
    c.shadowColor = '#22d3ee';
    c.shadowBlur = 7 * pulse;
    c.beginPath();
    c.roundRect(sx - 2.1, y0 + 105, 4.2, 21, 1.8);
    c.fillStyle = lin(c, sx - 2.1, sx + 2.1, ['#06b6d4', '#a5f3fc', '#ffffff', '#22d3ee']);
    c.fill();
    c.restore();
  }

  // Tiny glowing orange triangle indicator below the middle cyan slot (`cx, y0 + 132`)
  c.fillStyle = '#fb923c';
  c.beginPath();
  c.moveTo(cx, y0 + 130.5);
  c.lineTo(cx - 2.4, y0 + 134.5);
  c.lineTo(cx + 2.4, y0 + 134.5);
  c.closePath();
  c.fill();

  // 3 Glowing Orange-Gold Heat Vents on the lower-right receiver (`cx + 3 .. cx + 13, y0 + 136 .. y0 + 146`, matching image 1!)
  c.beginPath();
  c.roundRect(cx + 2.5, y0 + 135, 11, 12, 2.2);
  c.fillStyle = '#090d1c';
  c.fill();
  c.strokeStyle = 'rgba(71,85,105,0.75)';
  c.lineWidth = 0.75;
  c.stroke();
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 5;
  for (let i = 0; i < 3; i++) {
    c.fillStyle = '#fde047';
    c.fillRect(cx + 4.2 + i * 3.1, y0 + 137, 1.8, 8);
  }
  c.restore();

  // ══════════════════ 3. TWO GLOWING ORANGE-FRAME & VIOLET-PLASMA ENERGY CHAMBERS + TWIN RAILS (y0 + 2 .. y0 + 98, matching image 1!) ══════════════════
  // Two Rectangular Glowing Orange-Bordered Violet-Plasma Chambers (`y0 + 26 .. y0 + 57` and `y0 + 62 .. y0 + 93`)
  for (const [cy0, cy1] of [[y0 + 26, y0 + 57], [y0 + 62, y0 + 93]] as [number, number][]) {
    const chH = cy1 - cy0;
    // Violet-blue translucent plasma core inside chamber
    c.save();
    c.beginPath();
    c.roundRect(cx - 8.5, cy0, 17, chH, 2);
    const plasmaG = c.createLinearGradient(cx - 8.5, cy0, cx + 8.5, cy1);
    plasmaG.addColorStop(0, '#3b0764');
    plasmaG.addColorStop(0.35, '#7e22ce');
    plasmaG.addColorStop(0.5, '#c084fc');
    plasmaG.addColorStop(0.65, '#6d28d9');
    plasmaG.addColorStop(1, '#2e1065');
    c.fillStyle = plasmaG;
    c.fill();

    // Crackling cyan-white lightning filament dancing vertically inside each plasma chamber!
    c.shadowColor = '#38bdf8';
    c.shadowBlur = 6;
    c.strokeStyle = '#bae6fd';
    c.lineWidth = 1.25;
    c.beginPath();
    c.moveTo(cx + Math.sin(t * 14 + cy0) * 1.5, cy0 + 2);
    c.lineTo(cx - 3.2 + Math.cos(t * 19 + cy0) * 1.5, cy0 + chH * 0.36);
    c.lineTo(cx + 2.8 + Math.sin(t * 17 + cy0) * 1.5, cy0 + chH * 0.68);
    c.lineTo(cx + Math.cos(t * 15 + cy0) * 1.5, cy1 - 2);
    c.stroke();
    c.restore();

    // Glowing Neon Orange-Gold Rectangular Frame around each plasma chamber (matching image 1!)
    c.save();
    c.shadowColor = '#f97316';
    c.shadowBlur = 6 * pulse;
    c.beginPath();
    c.roundRect(cx - 8.2, cy0 + 0.5, 16.4, chH - 1, 2);
    c.strokeStyle = orangeGlowFrame(cx - 8.5, cx + 8.5);
    c.lineWidth = 2.4;
    c.stroke();
    c.strokeStyle = '#fef9c3';
    c.lineWidth = 0.8;
    c.stroke();
    c.restore();
  }

  // Twin Parallel Beveled Dark-Indigo Electromagnetic Rails (`cx - 15.5 .. cx - 8` and `cx + 8 .. cx + 15.5, y0 + 2 .. y0 + 97`)
  for (const sDir of [-1, 1]) {
    const rx = cx + sDir * 11.8 - 3.8;
    c.beginPath();
    c.roundRect(rx, y0 + 2, 7.6, 95, 2.4);
    c.fillStyle = indigoArmor(rx, rx + 7.6);
    c.fill();
    c.strokeStyle = 'rgba(7,9,22,0.9)';
    c.lineWidth = 0.88;
    c.stroke();

    // Metallic highlight stripe along each rail
    c.fillStyle = 'rgba(199,210,254,0.45)';
    c.fillRect(rx + 1.6, y0 + 7, 1.6, 86);

    // Glowing orange-gold tip accent at the muzzle end of each rail (`y0 + 3 .. y0 + 6.5`, matching image 1!)
    c.fillStyle = '#fb923c';
    c.beginPath();
    c.roundRect(rx + 1, y0 + 3, 5.6, 3.2, 1.2);
    c.fill();
  }

  // 3 Horizontal Dark-Indigo Cross-Braces with Glowing Orange Side Nodes (`y0 + 22`, `y0 + 57.5`, `y0 + 93.5`)
  for (const by of [y0 + 21.5, y0 + 57.5, y0 + 93.5]) {
    c.beginPath();
    c.roundRect(cx - 16.5, by, 33, 5.2, 1.8);
    c.fillStyle = indigoArmor(cx - 16.5, cx + 16.5);
    c.fill();
    c.strokeStyle = 'rgba(7,9,22,0.9)';
    c.lineWidth = 0.82;
    c.stroke();

    // Glowing orange side nodes on each cross-brace (matching image 1!)
    for (const sDir of [-1, 1]) {
      c.fillStyle = '#fb923c';
      c.beginPath();
      c.roundRect(cx + sDir * 12.2 - 2.2, by + 1.1, 4.4, 3.0, 1);
      c.fill();
    }
  }

  // ══════════════════ 4. BLAZING WHITE-BLUE PLASMA ORB & BLUE LIGHTNING ARC AT THE MUZZLE (`y0 + 4 .. y0 + 22`, matching image 1!) ══════════════════
  c.save();
  // Crackling cyan-blue lightning arc between the upper rail tips (`y0 + 12 .. y0 + 22`)
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 8;
  c.strokeStyle = '#7dd3fc';
  c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(cx - 6, y0 + 18);
  c.lineTo(cx - 2, y0 + 14 + Math.sin(t * 25) * 1.5);
  c.lineTo(cx + 2, y0 + 19 + Math.cos(t * 25) * 1.5);
  c.lineTo(cx + 6, y0 + 16);
  c.stroke();

  // Brilliant White-Blue Plasma Sphere hovering between the muzzle rail tips (`cx, y0 + 9.5`)
  glow(c, cx, y0 + 9.5, 6.2 * pulse, '#60a5fa', 14);
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(cx, y0 + 9.5, 4.4, 0, TAU);
  c.fill();
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- MAGNET
function magnetGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);

  // 1. INTEGRATED ERGONOMIC TACTICAL GRIP & TRIGGER GUARD (y0 + 94 .. y0 + 152)
  c.save();
  // Sculpted trigger guard loop
  c.beginPath();
  c.moveTo(cx + 4, y0 + 98);
  c.lineTo(cx + 20, y0 + 102);
  c.quadraticCurveTo(cx + 23, y0 + 114, cx + 14, y0 + 122);
  c.lineTo(cx + 2, y0 + 118);
  c.strokeStyle = '#1e293b';
  c.lineWidth = 3.2;
  c.lineCap = 'round';
  c.stroke();
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 1.1;
  c.stroke();

  // Curved crimson-anodized trigger
  c.beginPath();
  c.moveTo(cx + 10, y0 + 101);
  c.quadraticCurveTo(cx + 16, y0 + 109, cx + 11, y0 + 116);
  c.strokeStyle = '#ef4444';
  c.lineWidth = 2.6;
  c.stroke();

  // Contoured angled grip frame (compact & balanced so it never overlaps the bottom label)
  c.translate(cx - 2, y0 + 104);
  c.rotate(-0.34);
  c.beginPath();
  c.moveTo(-11, -6);
  c.lineTo(11, -6);
  c.quadraticCurveTo(13, 14, 10, 38);
  c.quadraticCurveTo(9, 44, 3, 45);
  c.lineTo(-10, 43);
  c.quadraticCurveTo(-14, 40, -13, 32);
  c.quadraticCurveTo(-11, 14, -11, -6);
  c.closePath();
  c.fillStyle = lin(c, -14, 13, ['#0f172a', '#475569', '#94a3b8', '#1e293b']);
  c.fill();
  c.strokeStyle = '#090d16';
  c.lineWidth = 1.8;
  c.stroke();

  // Inset crimson-carbon grip panel with ribs
  c.beginPath();
  c.roundRect(-7.5, 1, 14, 34, 4);
  c.fillStyle = lin(c, -8, 7, ['#450a0a', '#b91c1c', '#7f1d1d']);
  c.fill();
  c.strokeStyle = '#fca5a5';
  c.lineWidth = 0.7;
  c.stroke();
  c.strokeStyle = 'rgba(15,23,42,0.65)';
  c.lineWidth = 1.3;
  for (let i = 0; i < 5; i++) {
    const gy = 6 + i * 6;
    c.beginPath();
    c.moveTo(-5.5, gy);
    c.lineTo(4.5, gy + 1.5);
    c.stroke();
  }
  // Chrome grip bolts & flared baseplate
  c.fillStyle = '#e2e8f0';
  c.beginPath();
  c.arc(-0.5, 4.5, 1.4, 0, TAU);
  c.arc(-0.5, 31, 1.4, 0, TAU);
  c.fill();
  rr(c, -12, 41, 22, 5.5, 2.5, lin(c, -12, 10, ['#334155', '#e2e8f0', '#475569']), '#090d16', 1.2);
  c.restore();

  // 2. REAR FLUX STABILIZER DOME & LOWER RECEIVER TANG (y0 + 96 .. y0 + 114)
  c.beginPath();
  c.arc(cx, y0 + 104, 15, 0, Math.PI);
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#1e293b', '#64748b', '#cbd5e1', '#1e293b']);
  c.fill();
  c.strokeStyle = '#090d16';
  c.lineWidth = 1.6;
  c.stroke();
  // Rear glowing polarity core
  rr(c, cx - 8, y0 + 104, 16, 5, 2.5, '#090d16', '#475569', 0.9);
  c.fillStyle = '#38bdf8';
  c.fillRect(cx - 6.5, y0 + 105.2, 6, 2.6);
  c.fillStyle = '#ef4444';
  c.fillRect(cx + 0.5, y0 + 105.2, 6, 2.6);

  // 3. ARMORED ELECTROMAGNETIC SOLENOID RECEIVER (y0 + 44 .. y0 + 104)
  // Side stabilizer fins
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 17, y0 + 52);
    c.lineTo(cx + s * 22, y0 + 58);
    c.lineTo(cx + s * 22, y0 + 94);
    c.lineTo(cx + s * 17, y0 + 100);
    c.closePath();
    c.fillStyle = s < 0 ? '#334155' : '#475569';
    c.fill();
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.3;
    c.stroke();
  }

  // Main receiver body with 3D metallic shading
  rr(
    c,
    cx - 18,
    y0 + 45,
    36,
    60,
    8,
    lin(c, cx - 18, cx + 18, ['#0f172a', '#334155', '#94a3b8', '#475569', '#0f172a']),
    '#090d16',
    1.8,
  );

  // Recessed dark core chamber
  rr(c, cx - 13.5, y0 + 50, 27, 49, 5, '#090d16', '#334155', 1);

  // Glowing plasma core column inside the solenoid
  const coreG = c.createLinearGradient(cx - 8, y0 + 50, cx + 8, y0 + 50);
  coreG.addColorStop(0, `rgba(239,68,68,${0.45 + 0.25 * pulse})`);
  coreG.addColorStop(0.5, `rgba(255,240,240,${0.75 + 0.2 * pulse})`);
  coreG.addColorStop(1, `rgba(56,189,248,${0.45 + 0.25 * pulse})`);
  c.fillStyle = coreG;
  c.fillRect(cx - 8, y0 + 52, 16, 45);

  // 5 3D-sculpted Copper-Gold Solenoid Coils
  for (let i = 0; i < 5; i++) {
    const cy = y0 + 53.5 + i * 9;
    rr(
      c,
      cx - 15.5,
      cy,
      31,
      6.2,
      3,
      lin(c, cx - 15.5, cx + 15.5, ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa', '#c2410c', '#431407']),
      '#2a0a04',
      1.1,
    );
    // Specular shine across each copper ring
    c.fillStyle = 'rgba(255,255,255,0.45)';
    c.fillRect(cx - 11, cy + 1.2, 22, 1.3);
  }

  // Side armor rails with silver rivets
  for (const s of [-1, 1]) {
    c.fillStyle = 'rgba(255,255,255,0.22)';
    c.fillRect(cx + s * 15.5 - 0.8, y0 + 49, 1.6, 51);
    c.fillStyle = '#e2e8f0';
    for (const ry of [y0 + 57, y0 + 75, y0 + 93]) {
      c.beginPath();
      c.arc(cx + s * 19.2, ry, 1.2, 0, TAU);
      c.fill();
    }
  }

  // 4. HEAVY MAGNETIC YOKE / FLUX COLLAR (y0 + 36 .. y0 + 48)
  // Bridges the horseshoe magnet solidly into the receiver
  rr(
    c,
    cx - 22,
    y0 + 37,
    44,
    11,
    4.5,
    lin(c, cx - 22, cx + 22, ['#1e293b', '#94a3b8', '#f8fafc', '#64748b', '#0f172a']),
    '#090d16',
    1.7,
  );
  // Gold flux clamp bands
  rr(
    c,
    cx - 19,
    y0 + 35,
    38,
    3.5,
    1.5,
    lin(c, cx - 19, cx + 19, ['#78350f', '#fbbf24', '#fef08a', '#b45309']),
    '#090d16',
    1,
  );

  // 5. HEROIC 3D HORSESHOE MAGNET HEAD (y0 - 4 .. y0 + 38)
  const outerR = 21.5;
  const innerR = 9.5;
  const archY = y0 + 18;
  const tipY = y0 - 2;

  // Horseshoe U-body path
  c.save();
  c.beginPath();
  c.moveTo(cx - outerR, tipY);
  c.lineTo(cx - outerR, archY);
  c.arc(cx, archY, outerR, Math.PI, 0, true);
  c.lineTo(cx + outerR, tipY);
  c.lineTo(cx + innerR, tipY);
  c.lineTo(cx + innerR, archY);
  c.arc(cx, archY, innerR, 0, Math.PI, false);
  c.lineTo(cx - innerR, tipY);
  c.closePath();

  const magGrad = c.createLinearGradient(cx - outerR, y0, cx + outerR, y0 + 38);
  magGrad.addColorStop(0, '#991b1b');
  magGrad.addColorStop(0.22, '#ef4444');
  magGrad.addColorStop(0.45, '#f87171');
  magGrad.addColorStop(0.55, '#dc2626');
  magGrad.addColorStop(0.82, '#b91c1c');
  magGrad.addColorStop(1, '#7f1d1d');
  c.fillStyle = magGrad;
  c.fill();

  // Inner 3D bevel highlight along horseshoe curve
  c.strokeStyle = 'rgba(255,220,220,0.45)';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx, archY, (outerR + innerR) * 0.5, Math.PI * 0.88, Math.PI * 0.12, true);
  c.stroke();

  c.strokeStyle = '#2a0606';
  c.lineWidth = 1.9;
  c.stroke();
  c.restore();

  // Polished 3D Silver-Chrome Pole Shoes + Gold separator bands on left (N) and right (S) arms
  const armW = outerR - innerR; // 12px
  for (const [armX, label] of [
    [cx - outerR, 'N'],
    [cx + innerR, 'S'],
  ] as const) {
    // Gold separator ring
    c.fillStyle = lin(c, armX, armX + armW, ['#92400e', '#fde047', '#b45309']);
    c.fillRect(armX, y0 + 8.5, armW, 2.8);
    // Chrome pole shoe
    rr(
      c,
      armX - 0.5,
      tipY - 2,
      armW + 1,
      11,
      2.5,
      lin(c, armX, armX + armW, ['#475569', '#f8fafc', '#e2e8f0', '#64748b']),
      '#0f172a',
      1.5,
    );
    // Top specular bevel
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.fillRect(armX + 1.5, tipY - 0.8, armW - 3, 2);
    // Bold N / S pole engraving
    c.fillStyle = label === 'N' ? '#dc2626' : '#1d4ed8';
    c.font = "900 7.5px 'Russo One', sans-serif";
    c.textAlign = 'center';
    c.fillText(label, armX + armW * 0.5, tipY + 6.5);
  }

  // Central Flux Core Emblem on the yoke collar
  const orbG = c.createRadialGradient(cx - 1.5, y0 + 41, 0.5, cx, y0 + 42.5, 6.5);
  orbG.addColorStop(0, '#ffffff');
  orbG.addColorStop(0.45, '#f87171');
  orbG.addColorStop(0.85, '#dc2626');
  orbG.addColorStop(1, '#450a0a');
  c.fillStyle = orbG;
  c.beginPath();
  c.arc(cx, y0 + 42.5, 6, 0, TAU);
  c.fill();
  c.strokeStyle = '#fde047';
  c.lineWidth = 1.2;
  c.stroke();

  // 6. ANIMATED MAGNETIC FLUX WAVES & ARC BETWEEN POLES
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.85 + i / 3) % 1;
    const alpha = 0.65 * (1 - k);
    c.strokeStyle = i % 2 === 0 ? `rgba(255,110,110,${alpha})` : `rgba(125,211,252,${alpha})`;
    c.lineWidth = 1.7;
    c.beginPath();
    c.ellipse(cx, tipY - 2, 14 + k * 11, 5 + k * 12, 0, Math.PI, TAU);
    c.stroke();
  }
  // Subtle plasma arc between inner pole corners
  c.strokeStyle = `rgba(254,202,202,${0.45 + 0.35 * pulse})`;
  c.lineWidth = 1.3;
  jag(c, cx - innerR + 1, tipY + 2, cx + innerR - 1, tipY + 2, 3, 2.5);
  c.restore();
}

// ------------------------------------------------------------- SHRINK / GROW RAY
function rayGun(c: C, cx: number, y0: number, t: number, growMode: boolean) {
  const col = growMode ? ['#9a3412', '#fdba74', '#f97316', '#7c2d12'] : ['#14532d', '#86efac', '#22c55e', '#052e16'];
  const glowC = growMode ? '#fb923c' : '#4ade80';
  grip(c, cx, y0 + 108, '#e5e7eb', '#9ca3af', 0.78);
  guard(c, cx, y0 + 100, '#374151');
  // fins
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 90);
    c.lineTo(cx + s * 30, y0 + 120);
    c.lineTo(cx + s * 14, y0 + 118);
    c.closePath();
    c.fillStyle = col[2];
    c.fill();
    c.strokeStyle = col[3];
    c.lineWidth = 1.5;
    c.stroke();
  }
  // body (bulb)
  c.beginPath();
  c.ellipse(cx, y0 + 98, 18, 30, 0, 0, TAU);
  c.fillStyle = chrome(c, cx - 18, cx + 18);
  c.fill();
  c.strokeStyle = '#374151';
  c.lineWidth = 2;
  c.stroke();
  // glass dome
  c.beginPath();
  c.arc(cx, y0 + 96, 9, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 96, 9, ['#ffffff', glowC, col[3]]);
  c.fill();
  glow(c, cx, y0 + 96, 3 + Math.sin(t * 6), '#ffffff', 10);
  // barrel
  rr(c, cx - 5, y0 + 10, 10, 64, 3, chrome(c, cx - 5, cx + 5), '#374151', 1);
  // rings (shrink: big->small toward tip; grow: small->big)
  for (let i = 0; i < 4; i++) {
    const k = growMode ? 0.5 + i * 0.22 : 1.2 - i * 0.22;
    const ry = y0 + 62 - i * 15;
    const wv = 1 + 0.08 * Math.sin(t * 8 - i);
    c.beginPath();
    c.ellipse(cx, ry, 14 * k * wv, 4 * k, 0, 0, TAU);
    c.fillStyle = lin(c, cx - 14 * k, cx + 14 * k, col);
    c.fill();
    c.strokeStyle = col[3];
    c.lineWidth = 1;
    c.stroke();
  }
  glow(c, cx, y0 + 4, growMode ? 6 : 3, glowC, 14);
}

// ------------------------------------------------------------- PIRATE CANNON
function pirate(c: C, cx: number, y0: number, t: number) {
  const kick = gunState.sinceShot >= 0 && gunState.sinceShot < 0.34
    ? Math.sin((Math.PI * gunState.sinceShot) / 0.34) : 0;

  c.save();
  c.translate(0, kick * 5.5);

  const castIron = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#05070c', '#1e293b', '#475569', '#cbd5e1', '#1f2937', '#05070c']);
  const antiqueBrass = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#451a03', '#a16207', '#eab308', '#fef08a', '#ca8a04', '#713f12']);
  const pirateOak = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#271004', '#6b3614', '#b46934', '#85461e', '#2d1205']);

  // ══════════════════ 1. CURVED ANTIQUE PIRATE WOODEN GRIP, BRASS LOCKPLATE, TRIGGER GUARD & POMMEL (matching MERIAM BAJAK image!) ══════════════════
  // Curled Golden-Brass Trigger Guard & Trigger on right (`+x`, `cx + 8 .. cx + 26, y0 + 112 .. y0 + 146`)
  c.beginPath();
  c.moveTo(cx + 10, y0 + 112);
  c.bezierCurveTo(cx + 26, y0 + 116, cx + 27, y0 + 138, cx + 14, y0 + 144);
  c.quadraticCurveTo(cx + 10, y0 + 146, cx + 12, y0 + 149);
  c.lineTo(cx + 8, y0 + 144);
  c.bezierCurveTo(cx + 20, y0 + 137, cx + 19, y0 + 120, cx + 9, y0 + 117);
  c.closePath();
  c.fillStyle = antiqueBrass(cx + 8, cx + 27);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.85)';
  c.lineWidth = 0.85;
  c.stroke();

  // Golden trigger blade inside guard
  c.beginPath();
  c.moveTo(cx + 10.5, y0 + 120);
  c.quadraticCurveTo(cx + 18, y0 + 126, cx + 13.5, y0 + 134);
  c.lineTo(cx + 9.5, y0 + 132);
  c.closePath();
  c.fillStyle = antiqueBrass(cx + 9.5, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.8)';
  c.lineWidth = 0.75;
  c.stroke();

  // Curved Carved Oak Flintlock Pistol Grip (`cx - 12 .. cx + 24, y0 + 114 .. y0 + 182`)
  c.beginPath();
  c.moveTo(cx - 14, y0 + 114);
  c.lineTo(cx + 12, y0 + 114);
  c.bezierCurveTo(cx + 15, y0 + 132, cx + 21, y0 + 152, cx + 23, y0 + 172);
  c.quadraticCurveTo(cx + 23, y0 + 180, cx + 14, y0 + 182);
  c.lineTo(cx + 1, y0 + 180);
  c.quadraticCurveTo(cx - 5, y0 + 177, cx - 5, y0 + 168);
  c.bezierCurveTo(cx - 5, y0 + 148, cx - 10, y0 + 130, cx - 14, y0 + 114);
  c.closePath();
  c.fillStyle = pirateOak(cx - 14, cx + 23);
  c.fill();
  c.strokeStyle = 'rgba(28,10,2,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // Deeply carved oak wood grain lines along the grip
  c.strokeStyle = 'rgba(34,12,3,0.62)';
  c.lineWidth = 0.95;
  for (const dx of [-5, 1, 7]) {
    c.beginPath();
    c.moveTo(cx + dx, y0 + 124);
    c.quadraticCurveTo(cx + dx + 5, y0 + 150, cx + dx + 9, y0 + 174);
    c.stroke();
  }

  // Rounded Antique Brass Pommel Cap (`y0 + 173 .. y0 + 183`)
  c.beginPath();
  c.moveTo(cx - 5, y0 + 172);
  c.quadraticCurveTo(cx + 9, y0 + 176, cx + 23.5, y0 + 172);
  c.quadraticCurveTo(cx + 23, y0 + 182, cx + 9, y0 + 183);
  c.quadraticCurveTo(cx - 4, y0 + 181, cx - 5, y0 + 172);
  c.closePath();
  c.fillStyle = antiqueBrass(cx - 5, cx + 23.5);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.85)';
  c.lineWidth = 0.85;
  c.stroke();

  // Riveted Antique Brass Side Lockplate on upper-left of wooden grip (`y0 + 118 .. y0 + 142`)
  c.beginPath();
  c.roundRect(cx - 12.5, y0 + 118, 9.5, 22, 3);
  c.fillStyle = antiqueBrass(cx - 12.5, cx - 3);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.84)';
  c.lineWidth = 0.82;
  c.stroke();
  c.fillStyle = '#3b1504';
  c.beginPath();
  c.arc(cx - 7.8, y0 + 123, 1.3, 0, TAU);
  c.arc(cx - 7.8, y0 + 135, 1.3, 0, TAU);
  c.fill();

  // Thick Riveted Brass Breech Collar (`cx - 19 .. cx + 19, y0 + 104 .. y0 + 118`, matching MERIAM BAJAK image!)
  c.beginPath();
  c.roundRect(cx - 19, y0 + 104, 38, 13, 4.5);
  c.fillStyle = antiqueBrass(cx - 19, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.86)';
  c.lineWidth = 0.9;
  c.stroke();
  for (const rx of [-12, 0, 12]) {
    c.fillStyle = '#3b1504';
    c.beginPath();
    c.arc(cx + rx, y0 + 110.5, 1.6, 0, TAU);
    c.fill();
  }

  // ══════════════════ 2. SPUTTERING LIT ROPE FUSE & BLAZING SPARK STARBURST ON UPPER-LEFT (-x, matching MERIAM BAJAK image!) ══════════════════
  const fx = cx - 30;
  const fy = y0 + 98;
  c.save();
  c.lineCap = 'round';
  c.strokeStyle = '#3b1504';
  c.lineWidth = 4.6;
  c.beginPath();
  c.moveTo(cx - 17, y0 + 110);
  c.quadraticCurveTo(cx - 28, y0 + 111, fx, fy);
  c.stroke();
  c.strokeStyle = '#d97706';
  c.lineWidth = 2.8;
  c.stroke();
  c.restore();

  // Blazing golden-yellow spark starburst at the fuse tip (`fx, fy`)
  const fPulse = 0.8 + 0.25 * Math.sin(t * 28);
  glow(c, fx, fy, 4.5 * fPulse, '#facc15', 14);
  star(c, fx, fy, 6.2 * fPulse, '#fef08a');
  star(c, fx, fy, 3.4 * fPulse, '#ffffff');

  // ══════════════════ 3. HEAVY TAPERED BLACK CAST-IRON CANNON BARREL WITH JOLLY ROGER SKULL & CROSSBONES (matching MERIAM BAJAK image!) ══════════════════
  c.beginPath();
  c.moveTo(cx - 19.5, y0 + 14);
  c.lineTo(cx + 19.5, y0 + 14);
  c.lineTo(cx + 17.5, y0 + 105);
  c.lineTo(cx - 17.5, y0 + 105);
  c.closePath();
  c.fillStyle = castIron(cx - 19.5, cx + 19.5);
  c.fill();
  c.strokeStyle = 'rgba(5,7,12,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  // Bright metallic specular highlight strip down the left-center of the black iron barrel
  c.fillStyle = 'rgba(226,232,240,0.42)';
  c.beginPath();
  c.roundRect(cx - 13, y0 + 38, 4.2, 62, 2.1);
  c.fill();

  // White Painted Jolly Roger Skull & Crossbones Emblem on the Barrel (`cx, y0 + 68`, matching MERIAM BAJAK image!)
  c.save();
  c.translate(cx, y0 + 68);
  // Crossed bones behind/below skull
  c.strokeStyle = '#f1f5f9';
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-10.5, 4);
  c.lineTo(10.5, 13);
  c.moveTo(10.5, 4);
  c.lineTo(-10.5, 13);
  c.stroke();
  for (const [bx, by] of [[-10.5, 4], [10.5, 4], [-10.5, 13], [10.5, 13]] as [number, number][]) {
    c.fillStyle = '#f1f5f9';
    c.beginPath();
    c.arc(bx, by, 1.9, 0, TAU);
    c.fill();
  }
  // White Pirate Skull cranium & jaw
  c.fillStyle = '#f8fafc';
  c.beginPath();
  c.arc(0, -3.5, 7.6, 0, TAU);
  c.fill();
  c.beginPath();
  c.roundRect(-4.4, 1.5, 8.8, 5.2, 1.6);
  c.fill();
  // Dark eye sockets & nasal cavity
  c.fillStyle = '#090d16';
  c.beginPath();
  c.arc(-2.8, -3.8, 2.1, 0, TAU);
  c.arc(2.8, -3.8, 2.1, 0, TAU);
  c.fill();
  c.beginPath();
  c.moveTo(0, -1.6);
  c.lineTo(-1.3, 1.2);
  c.lineTo(1.3, 1.2);
  c.closePath();
  c.fill();
  // Skull teeth lines
  c.strokeStyle = '#090d16';
  c.lineWidth = 0.85;
  for (const tx of [-2.2, 0, 2.2]) {
    c.beginPath();
    c.moveTo(tx, 3.2);
    c.lineTo(tx, 6.4);
    c.stroke();
  }
  c.restore();

  // ══════════════════ 4. THICK 3-TURN BRAIDED HEMP ROPE COILS BEHIND THE MUZZLE (`y0 + 21 .. y0 + 41`, matching MERIAM BAJAK image!) ══════════════════
  for (let i = 0; i < 3; i++) {
    const ry = y0 + 21 + i * 6.2;
    c.beginPath();
    c.roundRect(cx - 21.5, ry, 43, 6.4, 3.2);
    c.fillStyle = lin(c, cx - 21.5, cx + 21.5, ['#3b1504', '#92400e', '#d97706', '#fde68a', '#b45309', '#3b1504']);
    c.fill();
    c.strokeStyle = 'rgba(42,14,3,0.86)';
    c.lineWidth = 0.85;
    c.stroke();
    // Diagonal twisted rope strand lines across each coil
    c.strokeStyle = 'rgba(42,14,3,0.6)';
    c.lineWidth = 0.85;
    for (let k = -3; k <= 3; k++) {
      c.beginPath();
      c.moveTo(cx + k * 5.2 - 1.8, ry + 0.8);
      c.lineTo(cx + k * 5.2 + 1.8, ry + 5.6);
      c.stroke();
    }
  }

  // ══════════════════ 5. HEAVY FLARED CAST-IRON MUZZLE LIP & PURPLE-GREY CANNON SMOKE (matching MERIAM BAJAK image!) ══════════════════
  // Billowing purple-grey gunpowder smoke puffs drifting from the cannon mouth (`y0 - 16 .. y0 + 10`)
  c.save();
  const smokeBob = Math.sin(t * 3.5) * 1.8;
  for (const [sx, sy, sr, sa] of [
    [-10, -4, 9.5, 0.36],
    [4, -8, 11, 0.42],
    [13, -2, 8.5, 0.34],
    [-2, -13, 8, 0.28],
  ] as [number, number, number, number][]) {
    c.fillStyle = `rgba(167,139,250,${sa})`;
    c.beginPath();
    c.arc(cx + sx, y0 + sy + smokeBob, sr, 0, TAU);
    c.fill();
  }
  c.restore();

  // Heavy double-ringed cast-iron muzzle collar (`cx - 23.5 .. cx + 23.5, y0 + 5 .. y0 + 21`)
  c.beginPath();
  c.roundRect(cx - 22, y0 + 13, 44, 8, 3.8);
  c.fillStyle = castIron(cx - 22, cx + 22);
  c.fill();
  c.strokeStyle = 'rgba(5,7,12,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  c.beginPath();
  c.ellipse(cx, y0 + 9.5, 23.5, 6.8, 0, 0, TAU);
  c.fillStyle = castIron(cx - 23.5, cx + 23.5);
  c.fill();
  c.strokeStyle = 'rgba(5,7,12,0.9)';
  c.lineWidth = 0.92;
  c.stroke();

  // Deep black cannon bore opening
  c.beginPath();
  c.ellipse(cx, y0 + 9.0, 17.5, 4.4, 0, 0, TAU);
  c.fillStyle = '#030508';
  c.fill();
  c.strokeStyle = 'rgba(148,163,184,0.55)';
  c.lineWidth = 0.78;
  c.stroke();

  c.restore();
}

// ------------------------------------------------------------- CARD GUN
function cardGun(c: C, cx: number, y0: number, ready: boolean) {
  grip(c, cx, y0 + 102, '#111', '#3f3f46', 0.78);
  guard(c, cx, y0 + 94, '#000');
  // deck magazine
  rr(c, cx + 16, y0 + 60, 18, 40, 2, '#fafafa', '#a1a1aa', 1);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = i % 2 ? '#e4e4e7' : '#fafafa';
    c.fillRect(cx + 16, y0 + 62 + i * 6, 18, 2);
  }
  // body
  c.beginPath();
  c.roundRect(cx - 16, y0 + 18, 32, 106, [4, 4, 8, 8]);
  c.fillStyle = lin(c, cx - 16, cx + 16, ['#000', '#3f3f46', '#18181b']);
  c.fill();
  c.strokeStyle = '#dc2626';
  c.lineWidth = 2;
  c.stroke();
  // gold trim + suits
  c.strokeStyle = '#eab308';
  c.lineWidth = 1;
  c.strokeRect(cx - 12, y0 + 24, 24, 94);
  c.font = 'bold 12px serif';
  c.textAlign = 'center';
  c.fillStyle = '#dc2626';
  c.fillText('♥', cx, y0 + 46);
  c.fillText('♦', cx, y0 + 96);
  c.fillStyle = '#e5e7eb';
  c.fillText('♠', cx, y0 + 71);
  c.fillText('♣', cx, y0 + 118);
  // slot
  rr(c, cx - 10, y0 + 12, 20, 6, 1, '#000');
  if (ready) {
    rr(c, cx - 9, y0 - 6, 18, 22, 2, '#ffffff', '#a1a1aa', 1);
    c.fillStyle = '#dc2626';
    c.font = 'bold 9px serif';
    c.fillText('A♥', cx, y0 + 7);
  }
}

// ------------------------------------------------------------- SONIC BLASTER
function sonic(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1c1917', '#44403c', 0.8);
  guard(c, cx, y0 + 104);
  rr(c, cx - 16, y0 + 44, 32, 88, 6, lin(c, cx - 16, cx + 16, ['#0c0a09', '#44403c', '#1c1917']), '#000');
  // equalizer
  for (let i = 0; i < 5; i++) {
    const h = 6 + Math.abs(Math.sin(t * 9 + i * 1.3)) * 28;
    for (let j = 0; j < h / 4; j++) {
      c.fillStyle = j > 6 ? '#ef4444' : j > 4 ? '#facc15' : '#a3e635';
      c.fillRect(cx - 12 + i * 5, y0 + 124 - j * 4, 4, 3);
    }
  }
  // horn
  c.beginPath();
  c.moveTo(cx - 8, y0 + 46);
  c.lineTo(cx - 26, y0 + 4);
  c.lineTo(cx + 26, y0 + 4);
  c.lineTo(cx + 8, y0 + 46);
  c.closePath();
  c.fillStyle = lin(c, cx - 26, cx + 26, ['#1c1917', '#78716c', '#292524']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2;
  c.stroke();
  // speaker cone
  const pump = 1 + 0.08 * Math.sin(t * 20);
  c.beginPath();
  c.ellipse(cx, y0 + 4, 26, 7, 0, 0, TAU);
  c.fillStyle = '#0c0a09';
  c.fill();
  c.beginPath();
  c.ellipse(cx, y0 + 4, 18 * pump, 5 * pump, 0, 0, TAU);
  c.fillStyle = '#292524';
  c.fill();
  c.strokeStyle = '#a3e635';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 4, 6 * pump, 2 * pump, 0, 0, TAU);
  c.fillStyle = '#a3e635';
  c.fill();
  // waves
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const k = (t * 1.5 + i / 3) % 1;
    c.strokeStyle = `rgba(190,255,120,${0.7 * (1 - k)})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(cx, y0 - k * 26, 22 + k * 10, 6 + k * 3, 0, Math.PI, TAU);
    c.stroke();
  }
  c.restore();
}

// ------------------------------------------------------------- MIRROR GUN
function mirrorGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#cbd5e1', '#64748b', 0.78);
  guard(c, cx, y0 + 100, '#334155');
  // crystal facets body
  const pts: [number, number][] = [[cx, y0 + 20], [cx + 18, y0 + 48], [cx + 16, y0 + 128], [cx - 16, y0 + 128], [cx - 18, y0 + 48]];
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#94a3b8', '#f8fafc', '#cbd5e1', '#e2e8f0', '#64748b']);
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 2;
  c.stroke();
  c.strokeStyle = 'rgba(51,65,85,0.5)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx, y0 + 20);
  c.lineTo(cx - 4, y0 + 128);
  c.moveTo(cx - 18, y0 + 48);
  c.lineTo(cx + 6, y0 + 80);
  c.lineTo(cx + 16, y0 + 128);
  c.moveTo(cx + 18, y0 + 48);
  c.lineTo(cx - 8, y0 + 96);
  c.stroke();
  // moving glare
  c.save();
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.clip();
  const gy = y0 + 20 + ((t * 60) % 140);
  c.fillStyle = 'rgba(255,255,255,0.7)';
  c.beginPath();
  c.moveTo(cx - 20, gy);
  c.lineTo(cx + 20, gy - 20);
  c.lineTo(cx + 20, gy - 12);
  c.lineTo(cx - 20, gy + 8);
  c.fill();
  c.restore();
  // prism tip
  c.beginPath();
  c.moveTo(cx, y0 - 4);
  c.lineTo(cx + 9, y0 + 22);
  c.lineTo(cx - 9, y0 + 22);
  c.closePath();
  const pg = c.createLinearGradient(cx - 9, 0, cx + 9, 0);
  ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#c084fc'].forEach((s, i) => pg.addColorStop(i / 4, s));
  c.fillStyle = pg;
  c.globalAlpha = 0.85;
  c.fill();
  c.globalAlpha = 1;
  c.strokeStyle = '#fff';
  c.lineWidth = 1;
  c.stroke();
  for (let i = 0; i < 3; i++) {
    const a = Math.sin(t * 3 + i * 2);
    if (a > 0.3) star(c, cx + [-12, 10, 2][i], y0 + [50, 90, 116][i], 4 * a, '#ffffff', 4);
  }
}

// ------------------------------------------------------------- PORTAL GUN
function portalGun(c: C, cx: number, y0: number, t: number) {
  const blue = Math.floor(t * 0.7) % 2 === 0;
  const pc = blue ? '#3b82f6' : '#fb923c';
  drawPortalGrip(c, cx, y0 + 98, pc);
  guard(c, cx, y0 + 100, '#1f2937');
  // body white glossy
  c.beginPath();
  c.roundRect(cx - 20, y0 + 40, 40, 90, [16, 16, 10, 10]);
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#cbd5e1', '#ffffff', '#e2e8f0', '#94a3b8']);
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 20, y0 + 96, 40, 34, [0, 0, 10, 10], '#1f2937');
  // core tube
  rr(c, cx - 7, y0 + 50, 14, 50, 7, '#0b1020', '#475569', 1);
  c.save();
  c.shadowColor = pc;
  c.shadowBlur = 14;
  c.fillStyle = pc;
  c.beginPath();
  c.roundRect(cx - 4, y0 + 54, 8, 42, 4);
  c.fill();
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.fillRect(cx - 2, y0 + 56, 1.5, 38);
  // prongs
  for (const a of [-0.5, 0, 0.5]) {
    c.save();
    c.translate(cx, y0 + 34);
    c.rotate(a);
    rr(c, -3, -30, 6, 30, 3, '#111827');
    c.restore();
  }
  // orb
  glow(c, cx, y0 + 8, 7 + Math.sin(t * 6), pc, 18);
  c.beginPath();
  c.arc(cx, y0 + 8, 4, 0, TAU);
  c.fillStyle = '#fff';
  c.fill();
  c.strokeStyle = pc;
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(cx, y0 + 8, 12, 4, t * 2, 0, TAU);
  c.stroke();
}

// ------------------------------------------------------------- CHRONO
function chronoGun(c: C, cx: number, y0: number, t: number) {
  drawChronoGrip(c, cx, y0 + 102);
  guard(c, cx, y0 + 104, '#451a03');
  rr(c, cx - 16, y0 + 40, 32, 92, 6, brass(c, cx - 16, cx + 16), '#451a03');
  // gears
  const gear = (x: number, y: number, r: number, rot: number, teeth: number) => {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const rr2 = i % 2 === 0 ? r : r * 0.78;
      const a = (i / (teeth * 2)) * TAU;
      c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
    }
    c.closePath();
    c.fillStyle = brass(c, -r, r);
    c.fill();
    c.strokeStyle = '#451a03';
    c.lineWidth = 1;
    c.stroke();
    c.beginPath();
    c.arc(0, 0, r * 0.3, 0, TAU);
    c.fillStyle = '#451a03';
    c.fill();
    c.restore();
  };
  gear(cx - 20, y0 + 116, 11, t * 1.2, 10);
  gear(cx - 26, y0 + 98, 7, -t * 1.9, 7);
  // clock dial
  c.beginPath();
  c.arc(cx, y0 + 76, 13, 0, TAU);
  c.fillStyle = '#fefce8';
  c.fill();
  c.strokeStyle = '#a16207';
  c.lineWidth = 2.5;
  c.stroke();
  c.strokeStyle = '#451a03';
  c.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * 10, y0 + 76 + Math.sin(a) * 10);
    c.lineTo(cx + Math.cos(a) * 12, y0 + 76 + Math.sin(a) * 12);
    c.stroke();
  }
  const sec = Math.floor(t * 2) / 2;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx, y0 + 76);
  c.lineTo(cx + Math.cos(sec * 1.05 - Math.PI / 2) * 10, y0 + 76 + Math.sin(sec * 1.05 - Math.PI / 2) * 10);
  c.strokeStyle = '#b91c1c';
  c.stroke();
  c.beginPath();
  c.moveTo(cx, y0 + 76);
  c.lineTo(cx + Math.cos(t * 0.1) * 6, y0 + 76 + Math.sin(t * 0.1) * 6);
  c.strokeStyle = '#111';
  c.lineWidth = 2;
  c.stroke();
  // hourglass tube
  rr(c, cx - 6, y0 + 14, 12, 28, 4, 'rgba(254,249,195,0.5)', '#a16207', 1.5);
  c.fillStyle = '#facc15';
  const sand = (t * 0.3) % 1;
  c.beginPath();
  c.moveTo(cx - 4, y0 + 18);
  c.lineTo(cx + 4, y0 + 18);
  c.lineTo(cx, y0 + 18 + 10 * (1 - sand));
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(cx - 4, y0 + 40);
  c.lineTo(cx + 4, y0 + 40);
  c.lineTo(cx, y0 + 40 - 10 * sand);
  c.closePath();
  c.fill();
  // emitter
  rr(c, cx - 8, y0 - 2, 16, 16, 4, brass(c, cx - 8, cx + 8), '#451a03');
  glow(c, cx, y0 + 4, 3, '#fde047', 14);
}

// ------------------------------------------------------------- GLITCH GUN (pixel art)
function glitchGun(c: C, cx: number, y0: number, t: number) {
  const P = 6;
  const map = [
    '..##..',
    '..##..',
    '.####.',
    '.####.',
    '.#@@#.',
    '.#@@#.',
    '.####.',
    '.####.',
    '.#######',
    '.########',
    '.####..###',
    '.####...###',
    '.####....###',
    '..........##',
  ];
  const glitchOn = Math.sin(t * 13) > 0.7 || Math.sin(t * 7.3) > 0.92;
  const drawMap = (ox: number, col: string, colB: string) => {
    for (let r = 0; r < map.length; r++) {
      for (let k = 0; k < map[r].length; k++) {
        const ch = map[r][k];
        if (ch === '.') continue;
        c.fillStyle = ch === '@' ? colB : col;
        c.fillRect(cx - 3 * P + k * P + ox, y0 + r * P * 1.6, P, P * 1.6);
      }
    }
  };
  if (glitchOn) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    drawMap(-3, 'rgba(255,0,85,0.7)', 'rgba(255,0,85,0.7)');
    drawMap(3, 'rgba(0,255,238,0.7)', 'rgba(0,255,238,0.7)');
    c.restore();
  }
  drawMap(0, '#16a34a', '#22ff88');
  // pixel outline highlight
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 2 * P + 1, y0 + 2, 2, P * 1.6 * 8);
  if (glitchOn) {
    c.fillStyle = 'rgba(0,255,140,0.5)';
    c.fillRect(cx - 30, y0 + rand(0, 100), 60, 3);
  }
  glow(c, cx, y0 + 2, 3, '#22ff88', 10);
}

// ------------------------------------------------------------- DRAGON BREATH
export function dragonFlameSurge(sinceShot: number): number {
  return sinceShot >= 0 && sinceShot < 0.22
    ? Math.sin(Math.PI * sinceShot / 0.22) : 0;
}

function dragon(c: C, cx: number, y0: number, t: number) {
  // A living dragon wraps the barrel; its tail forms the grip and its mouth
  // sits right on the muzzle. Wings have articulated ribs and scalloped skin.
  const blast = dragonFlameSurge(gunState.sinceShot);
  c.lineCap = 'round';
  c.strokeStyle = '#40141c'; c.lineWidth = 11;
  c.beginPath(); c.moveTo(cx + 8, y0 + 112);
  c.bezierCurveTo(cx + 30, y0 + 135, cx + 34, y0 + 153, cx + 12, y0 + 167); c.stroke();
  c.strokeStyle = '#d95b32'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(cx + 17, y0 + 126);
  c.bezierCurveTo(cx + 31, y0 + 144, cx + 26, y0 + 157, cx + 13, y0 + 165); c.stroke();
  c.fillStyle = '#eaa363'; c.beginPath();
  c.moveTo(cx + 12, y0 + 167); c.lineTo(cx + 3, y0 + 172);
  c.lineTo(cx + 15, y0 + 157); c.closePath(); c.fill();

  for (const side of [-1, 1]) {
    c.save(); c.translate(cx + side * 12, y0 + 68); c.scale(side, 1);
    c.rotate(Math.sin(t * 3.2) * 0.055);
    c.beginPath(); c.moveTo(0, 14);
    c.quadraticCurveTo(20, -27, 60, -41);
    c.lineTo(51, -4);
    c.quadraticCurveTo(69, 12, 62, 43);
    c.quadraticCurveTo(48, 32, 39, 54);
    c.quadraticCurveTo(27, 38, 17, 52);
    c.quadraticCurveTo(9, 29, 0, 14); c.closePath();
    const membrane = c.createLinearGradient(8, -42, 54, 54);
    membrane.addColorStop(0, '#ef7a4e');
    membrane.addColorStop(0.36, '#ad2d32');
    membrane.addColorStop(1, '#431536');
    c.fillStyle = membrane; c.fill();
    c.strokeStyle = '#38101d'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(255,192,112,0.75)'; c.lineWidth = 2;
    for (const [xx, yy] of [[60, -41], [51, -4], [62, 43], [39, 54], [17, 52]]) {
      c.beginPath(); c.moveTo(1, 14);
      c.quadraticCurveTo(xx * 0.4, yy * 0.36, xx, yy); c.stroke();
    }
    // Small illuminated scales between the wing bones catch the firelight.
    c.fillStyle = 'rgba(255,185,113,0.39)';
    for (const [xx, yy] of [[22, -1], [38, -13], [29, 22], [46, 17], [50, 36]]) {
      c.beginPath(); c.moveTo(xx - 4, yy);
      c.quadraticCurveTo(xx + 1, yy - 6, xx + 5, yy);
      c.quadraticCurveTo(xx + 1, yy + 3, xx - 4, yy); c.fill();
    }
    c.fillStyle = '#eeb67a';
    for (const [xx, yy] of [[60, -41], [62, 43]]) {
      c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 5, yy - 4);
      c.lineTo(xx - 4, yy + 6); c.closePath(); c.fill();
    }
    c.restore();
  }

  rr(c, cx - 16, y0 + 52, 32, 106, 13,
    lin(c, cx - 17, cx + 17, ['#471224', '#c53c37', '#94242e', '#351021']), '#3b1018', 2.5);
  // Layered, pointed scales and a bright segmented underbelly.
  for (let row = 0; row < 8; row++) {
    const yy = y0 + 61 + row * 12;
    c.fillStyle = row % 2 ? '#e8754c' : '#db5a37';
    c.beginPath(); c.moveTo(cx - 10, yy);
    c.quadraticCurveTo(cx, yy + 2, cx + 10, yy);
    c.lineTo(cx + 7, yy + 8); c.quadraticCurveTo(cx, yy + 13, cx - 7, yy + 8);
    c.closePath(); c.fill();
    c.strokeStyle = '#85302c'; c.lineWidth = 0.9; c.stroke();
    for (const side of [-1, 1]) {
      c.fillStyle = '#71202b'; c.beginPath();
      c.moveTo(cx + side * 12, yy - 1);
      c.lineTo(cx + side * 19, yy + 3);
      c.lineTo(cx + side * 12, yy + 8); c.closePath(); c.fill();
    }
  }
  // Crest spines connect the neck to the armored crown.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      c.fillStyle = '#e9a673'; c.beginPath();
      c.moveTo(cx + side * 13, y0 + 50 + i * 15);
      c.lineTo(cx + side * (20 + (2 - i) * 2), y0 + 42 + i * 15);
      c.lineTo(cx + side * 15, y0 + 57 + i * 15); c.closePath(); c.fill();
    }
  }

  c.save(); c.translate(cx, y0 + 24);
  // A separate lower jaw keeps the blazing mouth visibly open.
  c.beginPath(); c.moveTo(-11, 2); c.quadraticCurveTo(0, 10, 11, 2);
  c.lineTo(7, 23); c.quadraticCurveTo(0, 29, -7, 23); c.closePath();
  c.fillStyle = '#792333'; c.fill(); c.strokeStyle = '#350e19'; c.lineWidth = 2; c.stroke();
  c.save(); c.shadowColor = '#ff9e36'; c.shadowBlur = 15;
  c.fillStyle = radial(c, 0, -3, 16, ['#fffce0', '#ffc352', '#ee5b24', '#6d1722']);
  c.beginPath(); c.ellipse(0, -3, 7, 12, 0, 0, TAU); c.fill(); c.restore();
  for (const side of [-1, 1]) {
    c.fillStyle = '#ffdab0'; c.beginPath();
    c.moveTo(side * 5, 0); c.lineTo(side * 3, 9); c.lineTo(side * 8, 3);
    c.closePath(); c.fill();
  }
  c.beginPath();
  c.moveTo(-15, 6); c.lineTo(-12, -14); c.lineTo(-8, -20);
  c.lineTo(-5, -17); c.lineTo(0, -25); c.lineTo(5, -17);
  c.lineTo(8, -20); c.lineTo(12, -14); c.lineTo(15, 6);
  c.quadraticCurveTo(0, 12, -15, 6); c.closePath();
  c.fillStyle = lin(c, -16, 16, ['#742036', '#ee6d49', '#b73335', '#64152a']);
  c.fill(); c.strokeStyle = '#390d19'; c.lineWidth = 2; c.stroke();
  for (const side of [-1, 1]) {
    c.fillStyle = '#f2c391'; c.beginPath();
    c.moveTo(side * 8, -17); c.quadraticCurveTo(side * 22, -21, side * 25, -35);
    c.quadraticCurveTo(side * 19, -28, side * 12, -27); c.closePath(); c.fill();
    c.fillStyle = '#fceca8'; c.beginPath();
    c.ellipse(side * 8, -6, 3.1, 1.9, side * 0.22, 0, TAU); c.fill();
    c.fillStyle = '#3c1519'; c.beginPath(); c.arc(side * 8, -6, 1, 0, TAU); c.fill();
    c.fillStyle = '#45111b'; c.beginPath(); c.arc(side * 3.2, -18, 1.2, 0, TAU); c.fill();
  }
  // Raised snout, nostrils and cheek ridges give the head a reptilian face
  // rather than a flat rectangular red mask; the open lower jaw stays visible.
  c.fillStyle = lin(c, -12, 12, ['#7e2330', '#ed8055', '#be3837', '#71202b']);
  c.beginPath(); c.moveTo(-10, -2);
  c.quadraticCurveTo(0, -5, 10, -2);
  c.lineTo(7, 8); c.quadraticCurveTo(0, 13, -7, 8); c.closePath(); c.fill();
  c.strokeStyle = '#5a1728'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#45141f';
  for (const side of [-1, 1]) {
    c.beginPath(); c.ellipse(side * 4.5, 5, 1.4, 2, side * 0.23, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,210,142,0.88)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(side * 11, -3);
    c.quadraticCurveTo(side * 13, 2, side * 7, 8); c.stroke();
  }
  c.restore();
  // Fire breath surges BEYOND the horns after firing, then settles back to a
  // short living tongue. It follows shot time, never changes hitboxes/ammo.
  const flicker = Math.sin(t * 17) * 3;
  c.save(); c.shadowColor = '#f97316'; c.shadowBlur = 14 + blast * 13;
  c.fillStyle = '#df4529'; c.beginPath(); c.moveTo(cx - 7, y0 + 4);
  c.quadraticCurveTo(cx - 17 - blast * 14, y0 - 8,
    cx + flicker * 0.5, y0 - 19 - blast * 47);
  c.quadraticCurveTo(cx + 16 + blast * 14, y0 - 6, cx + 7, y0 + 4);
  c.closePath(); c.fill();
  c.fillStyle = '#ffae39'; c.beginPath(); c.moveTo(cx - 5, y0 + 3);
  c.quadraticCurveTo(cx - 10 - blast * 7, y0 - 6,
    cx + flicker * 0.4, y0 - 16 - blast * 33);
  c.quadraticCurveTo(cx + 11 + blast * 7, y0 - 5, cx + 5, y0 + 3);
  c.closePath(); c.fill();
  c.fillStyle = '#fff3bf'; c.beginPath(); c.moveTo(cx - 2.5, y0 + 2);
  c.quadraticCurveTo(cx - 3 - blast * 3, y0 - 3,
    cx + flicker * 0.2, y0 - 10 - blast * 19);
  c.quadraticCurveTo(cx + 4 + blast * 3, y0 - 3, cx + 2.5, y0 + 2);
  c.closePath(); c.fill(); c.restore();
}

// ------------------------------------------------------------- GRAVITY
function gravityGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1e1b4b', '#3730a3', 0.8);
  guard(c, cx, y0 + 104, '#0f0a2e');
  rr(c, cx - 18, y0 + 44, 36, 88, 8, lin(c, cx - 18, cx + 18, ['#0f0a2e', '#3730a3', '#1e1b4b', '#0f0a2e']), '#000');
  // starfield panel
  c.save();
  c.beginPath();
  c.roundRect(cx - 12, y0 + 52, 24, 70, 6);
  c.clip();
  c.fillStyle = '#05031a';
  c.fillRect(cx - 12, y0 + 52, 24, 70);
  for (let i = 0; i < 14; i++) {
    const sy = y0 + 52 + ((i * 17 + t * 12) % 70);
    c.fillStyle = `rgba(255,255,255,${0.4 + (i % 3) * 0.2})`;
    c.fillRect(cx - 11 + ((i * 7) % 22), sy, 1.2, 1.2);
  }
  c.restore();
  // arms
  for (const s of [-1, 1]) {
    c.strokeStyle = '#312e81';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 46);
    c.quadraticCurveTo(cx + s * 22, y0 + 26, cx + s * 12, y0 + 16);
    c.stroke();
  }
  // planet
  c.beginPath();
  c.arc(cx, y0 + 14, 10, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 14, 10, ['#c7d2fe', '#6366f1', '#1e1b4b']);
  c.fill();
  // ring
  c.save();
  c.translate(cx, y0 + 14);
  c.rotate(-0.3);
  c.strokeStyle = 'rgba(199,210,254,0.85)';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(0, 0, 18, 5, 0, 0, Math.PI);
  c.stroke();
  c.restore();
  // moon orbit
  const ma = t * 3;
  const mx = cx + Math.cos(ma) * 20;
  const my = y0 + 14 + Math.sin(ma) * 7;
  glow(c, mx, my, 2.5, '#e0e7ff', 8);
}

// ================================================================ dispatch
export function drawGunExtra(c: C, id: WeaponId, cx: number, y0: number, t: number, ready: boolean, snowLoaded = SNOWBALL_MAG_SIZE) {
  switch (id) {
    case 'slingshot': slingshot(c, cx, y0, t, ready); break;
    case 'blowgun': blowgun(c, cx, y0, t); break;
    case 'shotgun': shotgun(c, cx, y0, t, ready); break;
    case 'soaker': soaker(c, cx, y0, t); break;
    case 'snowball': snowball(c, cx, y0, t, snowLoaded); break;
    case 'sniper': sniper(c, cx, y0); break;
    case 'flamethrower': flamethrower(c, cx, y0, t); break;
    case 'bamboo': bamboo(c, cx, y0, t); break;
    case 'banana': banana(c, cx, y0, t); break;
    case 'bubble': bubbleGun(c, cx, y0, t); break;
    case 'harpoon': harpoon(c, cx, y0, ready); break;
    case 'chicken': chickenGun(c, cx, y0, t, ready); break;
    case 'confetti': confettiGun(c, cx, y0, t); break;
    case 'seed': seedGun(c, cx, y0, t); break;
    case 'pizza': pizzaGun(c, cx, y0, t, ready); break;
    case 'minigun': minigun(c, cx, y0); break;
    case 'railgun': railgun(c, cx, y0, t); break;
    case 'magnet': magnetGun(c, cx, y0, t); break;
    case 'shrink': rayGun(c, cx, y0, t, false); break;
    case 'grow': rayGun(c, cx, y0, t, true); break;
    case 'pirate': pirate(c, cx, y0, t); break;
    case 'card': cardGun(c, cx, y0, ready); break;
    case 'dragon': dragon(c, cx, y0, t); break;
    case 'gravity': gravityGun(c, cx, y0, t); break;
    default: {
      void discGun; void portalGun; void glitchGun; void sonic; void mirrorGun; void chronoGun;
      drawGunExtra2(c, id, cx, y0, t, ready);
      break;
    }
  }
}

// ================================================================ flashes
type Flash = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number } | { k: 'puff'; col: string; n: number } | { k: 'none' };
const FLASH: Partial<Record<WeaponId, Flash>> = {
  shotgun: { k: 'fire', s: 1.6 }, sniper: { k: 'fire', s: 1.5 }, minigun: { k: 'fire', s: 0.9 }, pirate: { k: 'fire', s: 1.8 },
  bamboo: { k: 'fire', s: 1.7 }, flamethrower: { k: 'fire', s: 1.1 }, dragon: { k: 'fire', s: 1.4 },
  railgun: { k: 'energy', rgb: '56,189,248', r: 50 },
  magnet: { k: 'energy', rgb: '239,68,68', r: 36 }, shrink: { k: 'energy', rgb: '74,222,128', r: 36 },
  grow: { k: 'energy', rgb: '251,146,60', r: 50 },
  gravity: { k: 'energy', rgb: '129,140,248', r: 46 },
  soaker: { k: 'puff', col: 'rgba(147,197,253,', n: 10 }, bubble: { k: 'puff', col: 'rgba(250,200,240,', n: 8 },
  snowball: { k: 'puff', col: 'rgba(255,255,255,', n: 12 }, confetti: { k: 'puff', col: 'rgba(255,180,220,', n: 6 },
  seed: { k: 'puff', col: 'rgba(160,230,120,', n: 5 }, chicken: { k: 'puff', col: 'rgba(255,250,200,', n: 6 },
  pizza: { k: 'puff', col: 'rgba(255,220,160,', n: 6 }, blowgun: { k: 'puff', col: 'rgba(230,255,210,', n: 4 },
};

export function drawFlashExtra(c: C, id: WeaponId, t: number, a: number) {
  if (id === 'firework') {
    const h = ((gunState.rocketHue % 360) + 360) % 360;
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = `hsla(${h}, 100%, 70%, ${a * 0.8})`;
    c.beginPath();
    c.ellipse(0, 0, 18 * a, 10 * a, 0, 0, TAU);
    c.fill();
    return;
  }
  if (id === 'yoyo') {
    const h = ((gunState.yoyoHue % 360) + 360) % 360;
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `hsla(${h}, 100%, 70%, ${a * 0.8})`;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, 0, 20 + (1 - a) * 26, 0, TAU);
    c.stroke();
    return;
  }
  if (id === 'keris') {
    return;
  }
  const f: Flash = FLASH[id] ?? FLASH2[id] ?? FLASH3[id] ?? { k: 'none' };
  if (f.k === 'none') return;
  c.globalCompositeOperation = f.k === 'puff' ? 'source-over' : 'lighter';
  if (f.k === 'fire') {
    const big = f.s;
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, 46 * big);
    fg.addColorStop(0, `rgba(255,255,220,${a})`);
    fg.addColorStop(0.3, `rgba(255,200,60,${a * 0.9})`);
    fg.addColorStop(1, 'rgba(255,90,0,0)');
    c.fillStyle = fg;
    c.beginPath();
    for (let i = 0; i <= 18; i++) {
      const ang = (i / 18) * TAU + t * 10;
      const r = (i % 2 === 0 ? rand(30, 50) : rand(8, 14)) * big;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r * 1.2 - 10 * big;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.fill();
  } else if (f.k === 'energy') {
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, f.r);
    fg.addColorStop(0, `rgba(255,255,255,${a})`);
    fg.addColorStop(0.35, `rgba(${f.rgb},${a * 0.85})`);
    fg.addColorStop(1, `rgba(${f.rgb},0)`);
    c.fillStyle = fg;
    c.beginPath();
    c.arc(0, -4, f.r, 0, TAU);
    c.fill();
    c.strokeStyle = `rgba(${f.rgb},${a})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, -4, f.r * 0.6 * (1.4 - a), f.r * 0.18 * (1.4 - a), 0, 0, TAU);
    c.stroke();
  } else {
    for (let i = 0; i < f.n; i++) {
      c.fillStyle = `${f.col}${a * 0.8})`;
      c.beginPath();
      c.arc(rand(-16, 16), rand(-26, 0), rand(2, 6) * (1.5 - a), 0, TAU);
      c.fill();
    }
  }
  void vlin;
}
