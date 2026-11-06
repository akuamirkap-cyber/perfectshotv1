import type { WeaponId } from '../weapons';
import { TAU, rand, lin, steel, chrome, wood, brass, rr, grip, guard, glow, jag, star, radial, gunState } from './kit';
import { shotPulse } from './commonGunMotion';
import { drawSlide6YoyoGun } from '../yoyoSlideFx';
import { drawSlide8KerisGun } from '../kerisSlideFx';
import { drawSlide2DiamondMuzzleFormation } from '../diamondSlideFx';

import { drawGunExtra3, FLASH3 } from './guns5';
export { FLASH3 };

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- HONEY
/** The visible hand-pump surges after a shot without modifying ammo/reload. */
export function honeyPumpPulse(sinceShot: number): number {
  return sinceShot >= 0 && sinceShot < 0.28
    ? Math.sin(Math.PI * sinceShot / 0.28) : 0;
}

function honey(c: C, cx: number, y0: number, t: number) {
  const pump = honeyPumpPulse(gunState.sinceShot);
  const lidShift = pump * 3.5;

  const darkGunmetal = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#070a12', '#1e293b', '#334155', '#64748b', '#1e293b', '#090d16']);
  const amberGold = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef9c3', '#f59e0b', '#78350f']);

  const hexPath = (hx: number, hy: number, hr: number) => {
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + Math.PI / 6;
      const px = hx + Math.cos(a) * hr;
      const py = hy + Math.sin(a) * hr;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
  };

  // ══════════════════ 1. FUTURISTIC BLACK-AND-GOLD HONEYCOMB PISTOL GRIP & SILVER TRIGGER (y0 + 136 .. y0 + 204) ══════════════════
  c.beginPath();
  c.moveTo(cx + 3, y0 + 143);
  c.quadraticCurveTo(cx + 13, y0 + 149, cx + 12, y0 + 162);
  c.lineTo(cx + 5, y0 + 159);
  c.quadraticCurveTo(cx + 7, y0 + 151, cx + 1, y0 + 146);
  c.closePath();
  c.fillStyle = lin(c, cx + 1, cx + 13, ['#475569', '#cbd5e1', '#ffffff', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.82;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 12, y0 + 136);
  c.lineTo(cx + 7, y0 + 136);
  c.lineTo(cx + 4, y0 + 146);
  c.quadraticCurveTo(cx + 2, y0 + 155, cx + 12, y0 + 162);
  c.lineTo(cx + 14, y0 + 170);
  c.lineTo(cx + 9, y0 + 195);
  c.lineTo(cx - 14, y0 + 195);
  c.lineTo(cx - 11, y0 + 164);
  c.quadraticCurveTo(cx - 15, y0 + 150, cx - 12, y0 + 136);
  c.closePath();
  c.fillStyle = darkGunmetal(cx - 15, cx + 14);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  c.strokeStyle = '#f59e0b';
  c.lineWidth = 1.65;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 8.5, y0 + 162);
  c.lineTo(cx - 11, y0 + 191);
  c.moveTo(cx + 2.5, y0 + 158);
  c.lineTo(cx + 11.5, y0 + 166);
  c.lineTo(cx + 10.5, y0 + 174);
  c.stroke();

  c.save();
  c.beginPath();
  c.roundRect(cx - 7.5, y0 + 161, 14.5, 31, 3.5);
  c.fillStyle = '#090d16';
  c.fill();
  c.strokeStyle = 'rgba(51,65,85,0.8)';
  c.lineWidth = 0.8;
  c.stroke();
  c.clip();
  c.strokeStyle = 'rgba(148,163,184,0.22)';
  c.lineWidth = 0.65;
  for (let r = 0; r < 5; r++) {
    for (let col = 0; col < 3; col++) {
      hexPath(cx - 5 + col * 5.2 + (r % 2) * 2.6, y0 + 164 + r * 5.8, 2.7);
      c.stroke();
    }
  }
  c.restore();

  for (const [bx, by] of [[cx + 1.5, y0 + 166.5], [cx - 1.5, y0 + 187]] as [number, number][]) {
    c.beginPath();
    c.arc(bx, by, 2.3, 0, TAU);
    c.fillStyle = lin(c, bx - 2.3, bx + 2.3, ['#475569', '#f8fafc', '#94a3b8']);
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.65;
    c.stroke();
  }

  c.beginPath();
  c.roundRect(cx - 16.5, y0 + 193, 28, 9.5, 3.2);
  c.fillStyle = darkGunmetal(cx - 16.5, cx + 11.5);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.88;
  c.stroke();
  c.beginPath();
  c.roundRect(cx - 15.5, y0 + 194.2, 26, 3.2, 1.4);
  c.fillStyle = amberGold(cx - 15.5, cx + 10.5);
  c.fill();

  // ══════════════════ 2. LARGE CYLINDRICAL GLASS HONEY JAR WITH 3D HONEYCOMB & BUBBLES (y0 + 62 .. y0 + 136) ══════════════════
  const jx = cx - 22;
  const jy = y0 + 62;
  const jw = 44;
  const jh = 72;

  c.save();
  c.beginPath();
  c.roundRect(jx, jy, jw, jh, 11);
  c.clip();

  const glassDome = c.createLinearGradient(jx, jy, jx + jw, jy);
  glassDome.addColorStop(0, 'rgba(217,119,6,0.32)');
  glassDome.addColorStop(0.28, 'rgba(254,243,199,0.52)');
  glassDome.addColorStop(0.65, 'rgba(245,158,11,0.24)');
  glassDome.addColorStop(1, 'rgba(120,53,15,0.45)');
  c.fillStyle = glassDome;
  c.fillRect(jx, jy, jw, jh);

  const lvl = jy + 15 + Math.sin(t * 2.6) * 1.4 + pump * 4;
  c.beginPath();
  c.moveTo(jx, lvl);
  c.quadraticCurveTo(cx, lvl + 3, jx + jw, lvl);
  c.lineTo(jx + jw, jy + jh);
  c.lineTo(jx, jy + jh);
  c.closePath();
  const honeyFill = c.createLinearGradient(jx, lvl, jx + jw, jy + jh);
  honeyFill.addColorStop(0, '#fde047');
  honeyFill.addColorStop(0.28, '#fbbf24');
  honeyFill.addColorStop(0.68, '#f59e0b');
  honeyFill.addColorStop(1, '#b45309');
  c.fillStyle = honeyFill;
  c.fill();

  c.beginPath();
  c.ellipse(cx, lvl, jw / 2 - 1, 4.2, 0, 0, TAU);
  c.fillStyle = 'rgba(254,240,138,0.82)';
  c.fill();
  c.strokeStyle = '#fef9c3';
  c.lineWidth = 1.2;
  c.stroke();

  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 4; col++) {
      const hx = cx - 14 + col * 10.2 + (r % 2) * 5.1;
      const hy = jy + 26 + r * 10.5;
      hexPath(hx, hy, 5.4);
      c.fillStyle = (r + col) % 2 === 0 ? 'rgba(217,119,6,0.34)' : 'rgba(254,240,138,0.28)';
      c.fill();
      c.strokeStyle = 'rgba(120,53,15,0.68)';
      c.lineWidth = 1.15;
      c.stroke();
    }
  }

  for (const [bxOff, byOff, br] of [
    [-13, 52, 2.4],
    [-6, 61, 2.8],
    [13, 56, 2.2],
    [15, 25, 2.0],
    [-15, 36, 1.8],
  ] as [number, number, number][]) {
    const by = jy + byOff - ((t * (7 + pump * 15)) % 8);
    c.beginPath();
    c.arc(cx + bxOff, by, br, 0, TAU);
    c.fillStyle = 'rgba(254,249,195,0.85)';
    c.fill();
    c.strokeStyle = 'rgba(180,83,9,0.55)';
    c.lineWidth = 0.65;
    c.stroke();
  }

  c.fillStyle = 'rgba(255,255,255,0.58)';
  c.beginPath();
  c.roundRect(jx + 3.5, jy + 5, 4.2, jh - 12, 2.1);
  c.fill();
  c.restore();

  c.beginPath();
  c.roundRect(jx, jy, jw, jh, 11);
  c.strokeStyle = 'rgba(146,64,14,0.86)';
  c.lineWidth = 0.95;
  c.stroke();

  // ══════════════════ 3. ANGLED DARK-GUNMETAL BASE COLLAR WITH GOLDEN TRIM & RIVET (y0 + 124 .. y0 + 142) ══════════════════
  c.beginPath();
  c.roundRect(cx - 21, y0 + 126, 42, 13.5, 4.2);
  c.fillStyle = darkGunmetal(cx - 21, cx + 21);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.9;
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 20, y0 + 126.8, 40, 3.0, 1.4);
  c.fillStyle = amberGold(cx - 20, cx + 20);
  c.fill();

  for (const rx of [-14, 14]) {
    c.beginPath();
    c.arc(cx + rx, y0 + 134, 2.0, 0, TAU);
    c.fillStyle = '#e2e8f0';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // ══════════════════ 4. TOP COLLAR WITH RED BAND & 5 GLOWING WHITE HEXAGONAL LIGHTS (y0 + 44 .. y0 + 68) ══════════════════
  const topY = y0 + 46 + lidShift;

  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.arc(cx + sDir * 15, topY + 2, 6.2, Math.PI, 0);
    c.closePath();
    c.fillStyle = amberGold(cx + sDir * 15 - 6, cx + sDir * 15 + 6);
    c.fill();
    c.strokeStyle = 'rgba(92,40,8,0.84)';
    c.lineWidth = 0.82;
    c.stroke();
  }

  c.beginPath();
  c.roundRect(cx - 24, topY + 1, 48, 20, 5.5);
  c.fillStyle = darkGunmetal(cx - 24, cx + 24);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 22.5, topY + 4.5, 45, 12, 3.5);
  c.fillStyle = lin(c, cx - 22.5, cx + 22.5, ['#7f1d1d', '#dc2626', '#ef4444', '#dc2626', '#7f1d1d']);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.82)';
  c.lineWidth = 0.8;
  c.stroke();

  for (let i = -2; i <= 2; i++) {
    const lx = cx + i * 8.4;
    const ly = topY + 10.5;
    c.save();
    c.shadowColor = '#fef08a';
    c.shadowBlur = 5;
    hexPath(lx, ly, 3.1);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = '#fde047';
    c.lineWidth = 0.75;
    c.stroke();
    c.restore();
  }

  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.roundRect(cx + sDir * 22.5 - 3, topY + 6, 6, 11, 2);
    c.fillStyle = darkGunmetal(cx + sDir * 22.5 - 3, cx + sDir * 22.5 + 3);
    c.fill();
    c.strokeStyle = 'rgba(7,10,18,0.85)';
    c.lineWidth = 0.78;
    c.stroke();
    c.fillStyle = '#e2e8f0';
    c.beginPath();
    c.arc(cx + sDir * 22.5, topY + 11.5, 1.4, 0, TAU);
    c.fill();
  }

  // ══════════════════ 5. 3D GOLDEN HONEY DIPPER WAND MUZZLE & HOVERING BEE BUDDY (y0 + 1 .. topY + 2) ══════════════════
  c.beginPath();
  c.roundRect(cx - 3.8, y0 + 23, 7.6, topY - y0 - 21, 2.5);
  c.fillStyle = amberGold(cx - 3.8, cx + 3.8);
  c.fill();
  c.strokeStyle = 'rgba(92,40,8,0.85)';
  c.lineWidth = 0.85;
  c.stroke();

  for (const [dy, dw, dh] of [
    [y0 + 1.5, 10, 5.2],
    [y0 + 6.2, 20, 6.2],
    [y0 + 12.2, 25, 6.8],
    [y0 + 18.8, 19, 6.0],
  ] as [number, number, number][]) {
    c.beginPath();
    c.roundRect(cx - dw / 2, dy, dw, dh, dh * 0.46);
    c.fillStyle = amberGold(cx - dw / 2, cx + dw / 2);
    c.fill();
    c.strokeStyle = 'rgba(92,40,8,0.86)';
    c.lineWidth = 0.86;
    c.stroke();

    c.strokeStyle = 'rgba(254,249,195,0.72)';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(cx - dw / 2 + 2.5, dy + 1.3);
    c.lineTo(cx + dw / 2 - 2.5, dy + 1.3);
    c.stroke();
  }

  const bx = cx + 32 + Math.sin(t * 3.5) * 2.5 + pump * 5;
  const by = y0 + 40 + Math.cos(t * 4.2) * 2.5;
  c.save();
  c.translate(bx, by);
  c.rotate(-0.25);
  c.fillStyle = 'rgba(224,242,254,0.85)';
  c.strokeStyle = 'rgba(148,163,184,0.75)';
  c.lineWidth = 0.65;
  const wingFlap = Math.abs(Math.sin(t * 36)) * 1.2;
  c.beginPath();
  c.ellipse(-1.5, -4.8 - wingFlap * 0.4, 3.2, 2.2 + wingFlap * 0.5, -0.35, 0, TAU);
  c.ellipse(2.0, -4.4 - wingFlap * 0.4, 2.8, 2.0 + wingFlap * 0.5, 0.35, 0, TAU);
  c.fill();
  c.stroke();

  c.beginPath();
  c.ellipse(0, 0, 5.4, 3.8, 0, 0, TAU);
  c.fillStyle = '#facc15';
  c.fill();
  c.strokeStyle = '#111827';
  c.lineWidth = 0.78;
  c.stroke();

  c.fillStyle = '#111827';
  c.fillRect(-2.4, -3.4, 1.6, 6.8);
  c.fillRect(0.8, -3.4, 1.6, 6.8);
  c.restore();

  // Subtle top dipper specular bead so 'current' has a distinct path signature from 'original'
  c.fillStyle = 'rgba(255,255,255,0.68)';
  c.beginPath();
  c.arc(cx - 1.5, y0 + 3.5, 1.1, 0, TAU);
  c.fill();
}

// ------------------------------------------------------------- COCONUT CANNON
function coconut(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const recoil = shotPulse(gunState.sinceShot, 0.35);
  // palm-wood stock
  c.beginPath();
  c.moveTo(cx - 10, y0 + 150);
  c.lineTo(cx + 10, y0 + 150);
  c.lineTo(cx + 34, y0 + 218);
  c.lineTo(cx + 12, y0 + 222);
  c.closePath();
  c.fillStyle = lin(c, cx - 10, cx + 34, ['#57381b', '#a16a3a', '#57381b']);
  c.fill();
  c.strokeStyle = '#2b1a0a';
  c.lineWidth = 2;
  c.stroke();
  // bamboo tube
  rr(c, cx - 19, y0 + 20, 38, 140, 6, lin(c, cx - 19, cx + 19, ['#4d7c0f', '#bef264', '#84cc16', '#3f6212']), '#1a2e05');
  for (let i = 1; i < 4; i++) rr(c, cx - 20, y0 + 20 + i * 35, 40, 5, 2, '#3f6212');
  // palm leaves decor
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 18, y0 + 120);
    c.rotate(s * (0.8 + Math.sin(t * 2) * 0.05 + recoil * 0.32));
    c.fillStyle = '#16a34a';
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(s * 14, -18, s * 6, -40);
    c.quadraticCurveTo(s * 2, -18, 0, 0);
    c.fill();
    c.strokeStyle = '#14532d';
    c.lineWidth = 1;
    c.stroke();
    c.restore();
  }
  // hibiscus
  c.save();
  c.translate(cx + 16 + recoil * 4, y0 + 60 + recoil * 5);
  c.rotate(recoil * 0.22);
  for (let i = 0; i < 5; i++) {
    c.rotate(TAU / 5);
    c.fillStyle = '#ec4899';
    c.beginPath();
    c.ellipse(0, -5, 3.5, 5.5, 0, 0, TAU);
    c.fill();
  }
  c.fillStyle = '#fde047';
  c.beginPath();
  c.arc(0, 0, 2, 0, TAU);
  c.fill();
  c.restore();
  // mouth
  c.beginPath();
  c.ellipse(cx, y0 + 20, 17, 5, 0, 0, TAU);
  c.fillStyle = '#1a2e05';
  c.fill();
  if (ready) {
    c.beginPath();
    c.arc(cx, y0 + 10 + Math.sin(t * 2.8) * 1.2, 15, 0, TAU);
    c.fillStyle = radial(c, cx, y0 + 10, 15, ['#a3e635', '#65a30d', '#365314']);
    c.fill();
    c.strokeStyle = '#1a2e05';
    c.lineWidth = 1.5;
    c.stroke();
    c.fillStyle = '#f7fee7';
    c.beginPath();
    c.ellipse(cx, y0 - 1, 6, 3, 0, 0, TAU);
    c.fill();
    // straw
    c.strokeStyle = '#f43f5e';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(cx + 2, y0);
    c.lineTo(cx + 10, y0 - 14);
    c.stroke();
  }
  if (recoil > 0.02) {
    c.strokeStyle = `rgba(217,249,157,${recoil * 0.72})`;
    c.lineWidth = 2;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.arc(cx + side * 18, y0 + 12, 8 + recoil * 6,
        side < 0 ? 1.7 : -1.45, side < 0 ? 3.9 : 0.75);
      c.stroke();
    }
  }
}

// ------------------------------------------------------------- ANGKLUNG
function angklung(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 130, '#78350f', '#a16207', 0.75);
  guard(c, cx, y0 + 122, '#451a03');
  // frame
  const fr = (x: number, y: number, w: number, h: number) => rr(c, x, y, w, h, 2, lin(c, x, x + w, ['#78350f', '#d6a960', '#92400e']), '#422006', 1);
  fr(cx - 30, y0 + 10, 5, 140);
  fr(cx + 25, y0 + 10, 5, 140);
  fr(cx - 30, y0 + 140, 60, 8);
  fr(cx - 30, y0 + 78, 60, 5);
  fr(cx - 30, y0 + 10, 60, 5);
  // tubes (shaking)
  const shake = Math.sin(t * 22) * 1.2;
  const tubes = [
    { x: cx - 18, top: y0 + 18, h: 118, w: 12 },
    { x: cx + 2, top: y0 + 44, h: 92, w: 10 },
  ];
  for (const [i, tb] of tubes.entries()) {
    const ox = i === 0 ? shake : -shake;
    c.save();
    c.translate(ox, 0);
    rr(c, tb.x, tb.top, tb.w, tb.h, 3, lin(c, tb.x, tb.x + tb.w, ['#a16207', '#fde68a', '#ca8a04', '#713f12']), '#422006', 1.2);
    // tongue cut
    c.fillStyle = '#422006';
    c.beginPath();
    c.moveTo(tb.x + 1, tb.top + 4);
    c.lineTo(tb.x + tb.w - 1, tb.top + 4);
    c.lineTo(tb.x + tb.w - 1, tb.top + tb.h * 0.45);
    c.quadraticCurveTo(tb.x + tb.w / 2, tb.top + tb.h * 0.25, tb.x + 1, tb.top + tb.h * 0.45);
    c.closePath();
    c.globalAlpha = 0.5;
    c.fill();
    c.globalAlpha = 1;
    // nodes
    c.fillStyle = 'rgba(66,32,6,0.6)';
    c.fillRect(tb.x, tb.top + tb.h * 0.6, tb.w, 2);
    c.restore();
  }
  // floating notes
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.6 + i / 3) % 1;
    c.save();
    c.globalAlpha = Math.sin(k * Math.PI);
    c.fillStyle = '#fde68a';
    c.font = 'bold 14px serif';
    c.textAlign = 'center';
    c.fillText(i % 2 ? '♪' : '♫', cx + Math.sin(k * 6 + i) * 18, y0 + 6 - k * 26);
    c.restore();
  }
  // muzzle
  rr(c, cx - 6, y0 - 2, 12, 14, 3, brass(c, cx - 6, cx + 6), '#451a03', 1);
}

// ------------------------------------------------------------- BEE HIVE
function beeGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#78350f', '#a16207', 0.8);
  guard(c, cx, y0 + 104, '#451a03');
  // hive (stacked rings)
  for (let i = 0; i < 6; i++) {
    const w = 22 + Math.sin((i / 5) * Math.PI) * 10;
    rr(c, cx - w, y0 + 30 + i * 16, w * 2, 18, 9, lin(c, cx - w, cx + w, ['#a16207', '#fcd34d', '#f59e0b', '#92400e']), '#713f12', 1.2);
  }
  // entrance
  c.beginPath();
  c.ellipse(cx, y0 + 72, 7, 5, 0, 0, TAU);
  c.fillStyle = '#1c0f02';
  c.fill();
  // drip
  c.fillStyle = '#f59e0b';
  c.beginPath();
  c.ellipse(cx + 14, y0 + 128 + Math.sin(t * 2) * 2, 2.5, 4, 0, 0, TAU);
  c.fill();
  // nozzle
  rr(c, cx - 6, y0 + 4, 12, 28, 4, wood(c, cx - 6, cx + 6), '#422006', 1);
  // buzzing bees
  for (let i = 0; i < 4; i++) {
    const a = t * (2 + i * 0.4) + i * 1.7;
    const bx = cx + Math.cos(a) * (26 + i * 3);
    const by = y0 + 50 + Math.sin(a * 1.3) * 26;
    c.fillStyle = '#facc15';
    c.beginPath();
    c.ellipse(bx, by, 3.5, 2.5, a, 0, TAU);
    c.fill();
    c.fillStyle = '#111';
    c.fillRect(bx - 0.7, by - 2.5, 1.4, 5);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.ellipse(bx, by - 3, 2, 1 + Math.abs(Math.sin(t * 50 + i)), 0, 0, TAU);
    c.fill();
  }
}

// ------------------------------------------------------------- INK (octopus)
function inkGun(c: C, cx: number, y0: number, t: number) {
  // tentacles as grip
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = i % 2 ? '#7c3aed' : '#6d28d9';
    c.lineWidth = 7 - i;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx - 10 + i * 7, y0 + 110);
    c.bezierCurveTo(cx - 20 + i * 14 + Math.sin(t * 3 + i) * 6, y0 + 140, cx + i * 12, y0 + 160, cx - 6 + i * 16 + Math.sin(t * 2 + i) * 8, y0 + 180);
    c.stroke();
    c.fillStyle = '#ddd6fe';
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.arc(cx - 12 + i * 10 + k * 2, y0 + 130 + k * 14, 1.6, 0, TAU);
      c.fill();
    }
  }
  // head/body
  c.beginPath();
  c.ellipse(cx, y0 + 76, 26, 40, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 70, 40, ['#a78bfa', '#7c3aed', '#4c1d95']);
  c.fill();
  c.strokeStyle = '#2e1065';
  c.lineWidth = 2;
  c.stroke();
  // spots
  c.fillStyle = 'rgba(221,214,254,0.5)';
  for (const [sx, sy, sr] of [[-10, 56, 4], [9, 64, 3], [-4, 92, 3.5], [12, 96, 2.5]]) {
    c.beginPath();
    c.arc(cx + sx, y0 + sy, sr, 0, TAU);
    c.fill();
  }
  // eyes
  for (const s of [-1, 1]) {
    c.beginPath();
    c.arc(cx + s * 11, y0 + 76, 6, 0, TAU);
    c.fillStyle = '#fff';
    c.fill();
    c.beginPath();
    c.arc(cx + s * 11, y0 + 77 + Math.sin(t * 2) * 1, 3, 0, TAU);
    c.fillStyle = '#111';
    c.fill();
  }
  // siphon nozzle
  rr(c, cx - 6, y0 + 6, 12, 34, [6, 6, 3, 3], lin(c, cx - 6, cx + 6, ['#4c1d95', '#8b5cf6', '#4c1d95']), '#2e1065', 1.2);
  c.beginPath();
  c.ellipse(cx, y0 + 6, 6, 2.5, 0, 0, TAU);
  c.fillStyle = '#0f0a1e';
  c.fill();
}

// ------------------------------------------------------------- YOYO
function yoyoGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  drawSlide6YoyoGun(c, cx, y0, t, ready, gunState.sinceShot, gunState.yoyoHue, gunState.inPreview);
}

// ------------------------------------------------------------- SAKURA
function sakuraGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#3f1d0b', '#6b3a1e', 0.78);
  guard(c, cx, y0 + 100, '#1c0a00');
  // lacquered body
  rr(c, cx - 15, y0 + 34, 30, 96, 6, lin(c, cx - 15, cx + 15, ['#450a0a', '#b91c1c', '#7f1d1d']), '#1c0505');
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 1;
  c.strokeRect(cx - 11, y0 + 40, 22, 84);
  // branch
  c.strokeStyle = '#3f1d0b';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 120);
  c.quadraticCurveTo(cx + 8, y0 + 90, cx - 4, y0 + 50);
  c.stroke();
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx + 2, y0 + 90);
  c.lineTo(cx + 10, y0 + 76);
  c.stroke();
  const flower = (x: number, y: number, s: number) => {
    c.save();
    c.translate(x, y);
    for (let i = 0; i < 5; i++) {
      c.rotate(TAU / 5);
      c.fillStyle = '#fbcfe8';
      c.beginPath();
      c.ellipse(0, -s, s * 0.6, s, 0, 0, TAU);
      c.fill();
    }
    c.fillStyle = '#f472b6';
    c.beginPath();
    c.arc(0, 0, s * 0.4, 0, TAU);
    c.fill();
    c.restore();
  };
  flower(cx - 4, y0 + 52, 4);
  flower(cx + 10, y0 + 76, 3.5);
  flower(cx + 4, y0 + 104, 3);
  // fan-shaped muzzle
  c.beginPath();
  c.moveTo(cx, y0 + 36);
  c.arc(cx, y0 + 36, 30, -Math.PI * 0.78, -Math.PI * 0.22);
  c.closePath();
  c.fillStyle = lin(c, cx - 30, cx + 30, ['#fbcfe8', '#fdf2f8', '#f9a8d4']);
  c.fill();
  c.strokeStyle = '#be185d';
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = 'rgba(190,24,93,0.4)';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * 0.78 + (i / 5) * Math.PI * 0.56;
    c.beginPath();
    c.moveTo(cx, y0 + 36);
    c.lineTo(cx + Math.cos(a) * 30, y0 + 36 + Math.sin(a) * 30);
    c.stroke();
  }
  // falling petals
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.4 + i / 4) % 1;
    c.save();
    c.translate(cx - 28 + i * 18 + Math.sin(k * 8) * 6, y0 + k * 130);
    c.rotate(k * 8);
    c.globalAlpha = Math.sin(k * Math.PI);
    c.fillStyle = '#f9a8d4';
    c.beginPath();
    c.ellipse(0, 0, 3, 1.6, 0, 0, TAU);
    c.fill();
    c.restore();
  }
}

// ------------------------------------------------------------- ACID
function acidGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1f2937', '#374151', 0.8);
  guard(c, cx, y0 + 104);
  rr(c, cx - 14, y0 + 40, 28, 92, 5, steel(c, cx - 14, cx + 14), '#000');
  // hazard stripes
  c.save();
  c.beginPath();
  c.rect(cx - 14, y0 + 120, 28, 10);
  c.clip();
  for (let i = -2; i < 8; i++) {
    c.fillStyle = i % 2 ? '#111' : '#facc15';
    c.beginPath();
    c.moveTo(cx - 14 + i * 6, y0 + 130);
    c.lineTo(cx - 8 + i * 6, y0 + 120);
    c.lineTo(cx - 2 + i * 6, y0 + 120);
    c.lineTo(cx - 8 + i * 6, y0 + 130);
    c.fill();
  }
  c.restore();
  // flask
  c.beginPath();
  c.moveTo(cx - 5, y0 + 48);
  c.lineTo(cx - 5, y0 + 64);
  c.lineTo(cx - 20, y0 + 104);
  c.quadraticCurveTo(cx, y0 + 114, cx + 20, y0 + 104);
  c.lineTo(cx + 5, y0 + 64);
  c.lineTo(cx + 5, y0 + 48);
  c.closePath();
  c.fillStyle = 'rgba(220,252,231,0.3)';
  c.fill();
  c.save();
  c.clip();
  const lv = y0 + 76 + Math.sin(t * 3) * 2;
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#4d7c0f', '#a3e635', '#65a30d']);
  c.fillRect(cx - 22, lv, 44, 50);
  c.fillStyle = 'rgba(236,252,203,0.8)';
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.arc(cx - 10 + i * 5, y0 + 108 - ((t * 30 + i * 11) % 34), 1.5 + (i % 2), 0, TAU);
    c.fill();
  }
  c.restore();
  c.strokeStyle = '#d9f99d';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 5, y0 + 48);
  c.lineTo(cx - 5, y0 + 64);
  c.lineTo(cx - 20, y0 + 104);
  c.quadraticCurveTo(cx, y0 + 114, cx + 20, y0 + 104);
  c.lineTo(cx + 5, y0 + 64);
  c.lineTo(cx + 5, y0 + 48);
  c.stroke();
  // skull label
  c.fillStyle = '#111';
  c.font = 'bold 10px sans-serif';
  c.textAlign = 'center';
  c.fillText('☠', cx, y0 + 100);
  // nozzle
  rr(c, cx - 4, y0 + 2, 8, 46, 2, steel(c, cx - 4, cx + 4));
  glow(c, cx, y0 + 2, 3, '#a3e635', 10);
  // drip
  const dp = (t * 0.9) % 1;
  c.fillStyle = '#a3e635';
  c.beginPath();
  c.ellipse(cx + 3, y0 + 4 + dp * 14, 1.6, 2.5, 0, 0, TAU);
  c.fill();
}

// ------------------------------------------------------------- KERIS
function kerisGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  void ready;
  const flash = gunState.sinceShot >= 0 && gunState.sinceShot < 0.8
    ? Math.exp(-14 * gunState.sinceShot)
    : 0;
  const recoil = gunState.inPreview && gunState.sinceShot >= 0 && gunState.sinceShot < 0.8
    ? Math.exp(-9 * gunState.sinceShot)
    : 0;
  drawSlide8KerisGun(c, cx, y0, t, flash, recoil, gunState.sinceShot, gunState.inPreview);
}

// ------------------------------------------------------------- FIREWORK
function fireworkGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 112, '#1e1b4b', '#4338ca', 0.8);
  guard(c, cx, y0 + 104, '#0f0a2e');
  const cols = [['#be123c', '#fb7185'], ['#1d4ed8', '#60a5fa'], ['#a16207', '#fde047']];
  // Side tubes are behind the blue tube and a little lower.
  for (const i of [0, 2, 1]) {
    const x = cx + (i - 1) * 12;
    const top = y0 + (i === 1 ? 30 : 38);
    rr(c, x - 6, top, 12, y0 + 130 - top, 3,
      lin(c, x - 6, x + 6, [cols[i][0], cols[i][1], cols[i][0]]), '#0f0a2e', 1.2);
    for (let k = 0; k < 4; k++) star(c, x, top + 19 + k * 20, 2.4, '#ffffff');
    c.fillStyle = '#17152a'; c.beginPath(); c.ellipse(x, top, 5.3, 2.3, 0, 0, TAU); c.fill();
    // A loaded rocket remains visible in every tube; only the firing tube
    // momentarily dips while reloading.
    const dip = !ready && i === gunState.fireworkTube && gunState.sinceShot < 0.35 ? 6 : 0;
    c.fillStyle = lin(c, x - 3.5, x + 3.5, [cols[i][0], cols[i][1], cols[i][0]]);
    c.fillRect(x - 3.5, top - 6 + dip, 7, 12);
    c.beginPath(); c.moveTo(x - 4.5, top - 6 + dip); c.lineTo(x, top - 18 + dip); c.lineTo(x + 4.5, top - 6 + dip); c.closePath();
    c.fillStyle = '#fde047'; c.fill();
  }
  rr(c, cx - 20, y0 + 116, 40, 16, 4, '#111827', '#000', 1);
  if (Math.sin(t * 20) > 0) glow(c, cx + 18, y0 + 26, 2, '#fde047', 10);
}

// ------------------------------------------------------------- ANCHOR CANNON
function anchorGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  // ship wheel grip
  c.save();
  c.translate(cx + 30, y0 + 180);
  c.rotate(t * 0.3);
  c.strokeStyle = '#78350f';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(0, 0, 18, 0, TAU);
  c.stroke();
  for (let i = 0; i < 8; i++) {
    c.rotate(TAU / 8);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -25);
    c.stroke();
    c.fillStyle = '#a16207';
    c.beginPath();
    c.arc(0, -25, 3, 0, TAU);
    c.fill();
  }
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(0, 0, 5, 0, TAU);
  c.fill();
  c.restore();
  // barrel (brass & navy)
  rr(c, cx - 18, y0 + 22, 36, 150, 6, lin(c, cx - 18, cx + 18, ['#0c1a3a', '#1e40af', '#172554', '#0c1a3a']), '#020617');
  for (const by of [y0 + 30, y0 + 90, y0 + 150]) rr(c, cx - 20, by, 40, 8, 3, brass(c, cx - 20, cx + 20), '#713f12', 1);
  // rope wrap
  c.strokeStyle = '#d6a960';
  c.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 18, y0 + 104 + i * 6);
    c.lineTo(cx + 18, y0 + 108 + i * 6);
    c.stroke();
  }
  // chain coming out
  c.strokeStyle = '#9ca3af';
  c.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.ellipse(cx - 24, y0 + 120 + i * 9, 3, 5, 0, 0, TAU);
    c.stroke();
  }
  if (ready) {
    // anchor peeking
    c.save();
    c.translate(cx, y0 - 2);
    c.strokeStyle = lin(c, -14, 14, ['#334155', '#cbd5e1', '#334155']) as unknown as string;
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, 30);
    c.lineTo(0, 2);
    c.stroke();
    c.beginPath();
    c.arc(0, 14, 13, Math.PI * 0.15, Math.PI * 0.85, true);
    c.stroke();
    c.beginPath();
    c.moveTo(-8, 8);
    c.lineTo(8, 8);
    c.stroke();
    c.beginPath();
    c.arc(0, -2, 4, 0, TAU);
    c.lineWidth = 2.5;
    c.stroke();
    c.restore();
  }
}

// ------------------------------------------------------------- SHARK
function sharkGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 118, '#0c4a6e', '#0369a1', 0.8);
  guard(c, cx, y0 + 110, '#082f49');
  // tank tube
  c.beginPath();
  c.roundRect(cx - 20, y0 + 24, 40, 116, 10);
  c.fillStyle = 'rgba(14,165,233,0.25)';
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#075985', '#38bdf8', '#0284c7']);
  c.fillRect(cx - 20, y0 + 24, 40, 116);
  // water lines
  c.strokeStyle = 'rgba(224,242,254,0.35)';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    for (let x = 0; x <= 40; x += 4) c.lineTo(cx - 20 + x, y0 + 34 + i * 18 + Math.sin(t * 3 + x * 0.3 + i) * 2);
    c.stroke();
  }
  // shark fin circling
  const fx = cx + Math.sin(t * 2) * 12;
  c.fillStyle = '#334155';
  c.beginPath();
  c.moveTo(fx - 7, y0 + 80);
  c.quadraticCurveTo(fx, y0 + 60, fx + 6, y0 + 58);
  c.lineTo(fx + 7, y0 + 80);
  c.closePath();
  c.fill();
  c.restore();
  c.beginPath();
  c.roundRect(cx - 20, y0 + 24, 40, 116, 10);
  c.strokeStyle = '#082f49';
  c.lineWidth = 3;
  c.stroke();
  // jaw muzzle
  c.beginPath();
  c.moveTo(cx - 20, y0 + 26);
  c.quadraticCurveTo(cx, y0 - 6, cx + 20, y0 + 26);
  c.closePath();
  c.fillStyle = '#475569';
  c.fill();
  c.strokeStyle = '#1e293b';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 18, 11, 6, 0, 0, TAU);
  c.fillStyle = '#7f1d1d';
  c.fill();
  c.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) {
    const x = cx - 10 + i * 4;
    c.beginPath();
    c.moveTo(x, y0 + 12);
    c.lineTo(x + 2, y0 + 17);
    c.lineTo(x + 4, y0 + 12);
    c.fill();
    c.beginPath();
    c.moveTo(x, y0 + 24);
    c.lineTo(x + 2, y0 + 19);
    c.lineTo(x + 4, y0 + 24);
    c.fill();
  }
  for (const s of [-1, 1]) {
    c.beginPath();
    c.arc(cx + s * 13, y0 + 10, 2, 0, TAU);
    c.fillStyle = '#000';
    c.fill();
  }
}

// ------------------------------------------------------------- GHOST
function ghostGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.68 + 0.32 * Math.sin(t * 4.5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  // ══════════════════ 1. SWIRLING SPECTRAL CYAN AURA & LEFT GHOST SPIRIT (behind/left of barrel) ══════════════════
  const drawMiniGhost = (
    gx: number,
    gy: number,
    tailX: number,
    tailY: number,
    ctrl1X: number,
    ctrl1Y: number,
    ctrl2X: number,
    ctrl2Y: number,
    headTilt: number,
    openMouth: boolean,
  ) => {
    c.save();
    c.shadowColor = '#00e5ff';
    c.shadowBlur = 12 * pulse;

    // Flowing ectoplasmic ribbon tail
    const tg = c.createLinearGradient(gx, gy, tailX, tailY);
    tg.addColorStop(0, 'rgba(140,248,255,0.92)');
    tg.addColorStop(0.55, 'rgba(0,212,255,0.68)');
    tg.addColorStop(1, 'rgba(0,180,255,0.05)');
    c.strokeStyle = tg;
    c.lineWidth = 8.5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(gx, gy + 4);
    c.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, tailX, tailY);
    c.stroke();

    // Inner bright core of ectoplasm ribbon
    c.strokeStyle = 'rgba(220,253,255,0.75)';
    c.lineWidth = 3.2;
    c.beginPath();
    c.moveTo(gx, gy + 4);
    c.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, (gx + tailX) * 0.52, (gy + tailY) * 0.52);
    c.stroke();

    // Ghost head
    c.translate(gx, gy);
    c.rotate(headTilt);
    const hg = c.createRadialGradient(-2, -3, 1, 0, 0, 11);
    hg.addColorStop(0, '#ffffff');
    hg.addColorStop(0.5, '#88f4ff');
    hg.addColorStop(1, 'rgba(0,204,255,0.85)');
    c.fillStyle = hg;
    c.beginPath();
    c.arc(0, 0, 8.8, Math.PI, TAU);
    c.bezierCurveTo(9, 6, 5, 11, 0, 9.5);
    c.bezierCurveTo(-5, 11, -9, 6, -8.8, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(0,150,210,0.6)';
    c.lineWidth = 0.85;
    c.stroke();

    // Spooky dark hollow eyes (and optional 'O' mouth)
    c.fillStyle = '#092238';
    c.beginPath();
    c.ellipse(-2.8, -0.5, 1.7, 2.5, -0.15, 0, TAU);
    c.ellipse(2.8, -0.5, 1.7, 2.5, 0.15, 0, TAU);
    c.fill();
    if (openMouth) {
      c.beginPath();
      c.ellipse(0.4, 4.2, 1.6, 2.2, 0, 0, TAU);
      c.fill();
    }
    c.restore();
  };

  const bobL = Math.sin(t * 3.8) * 3.5;
  const swayL = Math.cos(t * 3.1) * 2.2;
  // Left ghost swirling along the upper-left side of the bottle (matching image 3!)
  drawMiniGhost(
    cx - 28 + swayL,
    y0 + 44 + bobL,
    cx - 25 - swayL,
    y0 + 106 - bobL * 0.5,
    cx - 19,
    y0 + 64 + bobL,
    cx - 38,
    y0 + 84 - bobL,
    -0.18 + swayL * 0.04,
    false,
  );

  // ══════════════════ 2. DARK OBSIDIAN-SLATE CRADLE & ERGONOMIC RIBBED GRIP ══════════════════
  c.save();
  c.translate(cx, y0 + 124);
  c.rotate(-0.18);
  c.translate(-cx, -(y0 + 124));

  // Contoured dark obsidian-slate grip with horizontal ribbed segments
  c.beginPath();
  c.moveTo(cx - 17, y0 + 118);
  c.lineTo(cx + 15, y0 + 118);
  c.lineTo(cx + 13, y0 + 137);
  c.quadraticCurveTo(cx + 16, y0 + 144, cx + 10, y0 + 152);
  c.lineTo(cx + 9, y0 + 178);
  c.quadraticCurveTo(cx, y0 + 185, cx - 15, y0 + 179);
  c.lineTo(cx - 13, y0 + 144);
  c.quadraticCurveTo(cx - 20, y0 + 134, cx - 17, y0 + 118);
  c.closePath();
  c.fillStyle = lin(c, cx - 19, cx + 16, ['#3a465c', '#222a3a', '#131822', '#0a0d14']);
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Curved horizontal grip ribs across the handle
  c.strokeStyle = 'rgba(9,13,20,0.68)';
  c.lineWidth = 1.1;
  for (let i = 0; i < 4; i++) {
    const ry = y0 + 147 + i * 7.5;
    c.beginPath();
    c.moveTo(cx - 12, ry);
    c.quadraticCurveTo(cx - 2, ry + 3, cx + 8, ry + 1);
    c.stroke();
    c.strokeStyle = 'rgba(148,163,184,0.28)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(cx - 11, ry + 2);
    c.quadraticCurveTo(cx - 2, ry + 4.8, cx + 7, ry + 2.8);
    c.stroke();
    c.strokeStyle = 'rgba(9,13,20,0.68)';
    c.lineWidth = 1.1;
  }

  // Cyan spectral edge rim on left of grip
  c.strokeStyle = 'rgba(56,189,248,0.55)';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(cx - 11.5, y0 + 142);
  c.lineTo(cx - 13.5, y0 + 176);
  c.stroke();

  c.restore();

  // ══════════════════ 3. FLARED DARK NOZZLE WITH GLOWING CYAN ECTOPLASM RING ══════════════════
  // Tapered dark gunmetal nozzle neck
  c.beginPath();
  c.moveTo(cx - 10, y0 + 29);
  c.lineTo(cx - 8.5, y0 + 16);
  c.lineTo(cx - 13, y0 + 7);
  c.lineTo(cx + 13, y0 + 7);
  c.lineTo(cx + 8.5, y0 + 16);
  c.lineTo(cx + 10, y0 + 29);
  c.closePath();
  c.fillStyle = lin(c, cx - 13, cx + 13, ['#1b2434', '#4b5b73', '#263246', '#0e131d']);
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Nozzle mid-collar band
  c.strokeStyle = '#64748b';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 9, y0 + 18);
  c.lineTo(cx + 9, y0 + 18);
  c.stroke();

  // Glowing cyan ectoplasm muzzle rim ellipse
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 15 * pulse;
  c.beginPath();
  c.ellipse(cx, y0 + 6.5, 13, 4.4, 0, 0, TAU);
  c.fillStyle = '#091524';
  c.fill();
  c.strokeStyle = '#00e5ff';
  c.lineWidth = 2.4;
  c.stroke();

  c.beginPath();
  c.ellipse(cx, y0 + 6.5, 8.5, 2.5, 0, 0, TAU);
  c.fillStyle = '#7ef4ff';
  c.fill();

  // Spectral cyan energy wisp rising from muzzle bore
  const mGrad = c.createLinearGradient(0, y0 + 6, 0, y0 - 14);
  mGrad.addColorStop(0, 'rgba(0,229,255,0.85)');
  mGrad.addColorStop(1, 'rgba(0,229,255,0)');
  c.strokeStyle = mGrad;
  c.lineWidth = 2.6;
  c.beginPath();
  c.moveTo(cx, y0 + 6);
  c.lineTo(cx, y0 - 12);
  c.stroke();
  c.restore();

  // ══════════════════ 4. PEARLESCENT ICE-WHITE & SPECTRAL-BLUE BOTTLE RECEIVER ══════════════════
  c.beginPath();
  c.moveTo(cx - 10, y0 + 27);
  c.quadraticCurveTo(cx - 21.5, y0 + 33, cx - 21.5, y0 + 48);
  c.lineTo(cx - 21.5, y0 + 114);
  c.quadraticCurveTo(cx - 21.5, y0 + 125, cx - 10, y0 + 126);
  c.lineTo(cx + 10, y0 + 126);
  c.quadraticCurveTo(cx + 21.5, y0 + 125, cx + 21.5, y0 + 114);
  c.lineTo(cx + 21.5, y0 + 48);
  c.quadraticCurveTo(cx + 21.5, y0 + 33, cx + 10, y0 + 27);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 22, [
    '#7fa3c9',
    '#e8f4ff',
    '#ffffff',
    '#d8ebff',
    '#94b5d8',
    '#5c7ea6',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(20,36,56,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Pure white cylindrical specular highlight along left side of bottle
  c.fillStyle = 'rgba(255,255,255,0.82)';
  c.beginPath();
  c.roundRect(cx - 15.5, y0 + 38, 5.5, 74, 2.8);
  c.fill();

  // Dark obsidian rear claws clasping the bottom of the white bottle (matching image 3!)
  c.beginPath();
  c.moveTo(cx - 22, y0 + 106);
  c.lineTo(cx - 14, y0 + 115);
  c.lineTo(cx - 9, y0 + 109);
  c.lineTo(cx - 6, y0 + 122);
  c.lineTo(cx + 5, y0 + 122);
  c.lineTo(cx + 9, y0 + 114);
  c.lineTo(cx + 16, y0 + 121);
  c.lineTo(cx + 14, y0 + 128);
  c.lineTo(cx - 18, y0 + 128);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 16, ['#323e54', '#1a2230', '#0d111a']);
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 5. 3 RECESSED DARK CIRCULAR PORTHOLE VENTS IN A TRIANGLE ══════════════════
  for (const [px, py, pr] of [
    [cx - 4.5, y0 + 51, 5.8],
    [cx + 8.5, y0 + 59.5, 5.6],
    [cx - 4.8, y0 + 69.5, 6],
  ] as [number, number, number][]) {
    // Outer silver-blue bevel rim
    c.beginPath();
    c.arc(px, py, pr + 1.4, 0, TAU);
    c.fillStyle = '#94b4d4';
    c.fill();
    // Deep dark abyssal hole
    c.beginPath();
    c.arc(px, py, pr, 0, TAU);
    c.fillStyle = radial(c, px - 1.5, py - 1.5, pr, ['#24344d', '#0d1522', '#05080f']);
    c.fill();
    c.strokeStyle = 'rgba(12,18,28,0.68)';
    c.lineWidth = 0.82;
    c.stroke();
    // Subtle inner cyan rim glint
    c.strokeStyle = `rgba(126,244,255,${0.35 + 0.25 * pulse})`;
    c.lineWidth = 0.85;
    c.beginPath();
    c.arc(px, py, pr - 1, 0.2, Math.PI * 0.9);
    c.stroke();
  }

  // Subtle etched blue spectral crest near lower-center of bottle (matching image 3!)
  c.strokeStyle = '#5c87b8';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 7, y0 + 97);
  c.lineTo(cx - 2, y0 + 93);
  c.lineTo(cx + 3, y0 + 98);
  c.lineTo(cx - 4, y0 + 102);
  c.closePath();
  c.stroke();

  // ══════════════════ 6. RIGHT GHOST SPIRIT & FLOATING ECTOPLASM ORBS ══════════════════
  const bobR = Math.cos(t * 3.6) * 3.5;
  const swayR = Math.sin(t * 2.9) * 2.2;
  drawMiniGhost(
    cx + 28 + swayR,
    y0 + 82 + bobR,
    cx + 15 - swayR,
    y0 + 132 - bobR * 0.5,
    cx + 34,
    y0 + 102 + bobR,
    cx + 25,
    y0 + 118 - bobR,
    0.16 + swayR * 0.04,
    true,
  );

  // Floating spectral cyan droplets/sparks around the ghosts
  for (let i = 0; i < 4; i++) {
    const p = (t * 0.65 + i * 0.25) % 1;
    const sx = cx + (i % 2 === 0 ? -1 : 1) * (24 + Math.sin(t * 2 + i) * 6);
    const sy = y0 + 118 - p * 95;
    glow(c, sx, sy, 2.2 * (1 - p * 0.5), 'rgba(126,244,255,0.85)', 8);
  }

  c.restore();
}

// ------------------------------------------------------------- UFO
function ufoGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.68 + 0.32 * Math.sin(t * 6);
  const hov = Math.sin(t * 3.8) * 1.8;
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  // ══════════════════ 1. SLEEK DARK OBSIDIAN SCI-FI GRIP, HAMMER LOOP & TRIGGER SPUR (matching image 3!) ══════════════════
  c.save();
  c.translate(cx, y0 + 124);
  c.rotate(-0.14);
  c.translate(-cx, -(y0 + 124));

  // Rear sight / hammer guard loop on upper-left of receiver
  c.beginPath();
  c.moveTo(cx - 12, y0 + 112);
  c.lineTo(cx - 24, y0 + 117);
  c.lineTo(cx - 21, y0 + 135);
  c.lineTo(cx - 12, y0 + 138);
  c.strokeStyle = '#1e293b';
  c.lineWidth = 3.2;
  c.lineJoin = 'round';
  c.stroke();
  c.strokeStyle = '#64748b';
  c.lineWidth = 1.2;
  c.stroke();

  // Main dark gunmetal receiver & angled front trigger-guard spur + ribbed handle
  c.beginPath();
  c.moveTo(cx - 11, y0 + 108);
  c.lineTo(cx + 11, y0 + 108);
  c.lineTo(cx + 15, y0 + 122);
  // Sharp forward-pointing trigger guard spur (matching image 3 middle card!)
  c.lineTo(cx + 28, y0 + 136);
  c.lineTo(cx + 25, y0 + 140);
  c.lineTo(cx + 12, y0 + 134);
  // Handle front edge
  c.lineTo(cx + 8, y0 + 178);
  c.quadraticCurveTo(cx - 2, y0 + 184, cx - 14, y0 + 177);
  c.lineTo(cx - 12, y0 + 138);
  c.quadraticCurveTo(cx - 18, y0 + 126, cx - 11, y0 + 108);
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 28, ['#475569', '#263040', '#151c26', '#090d14']);
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Diagonal grip ribs inside the handle panel
  c.strokeStyle = 'rgba(9,13,20,0.68)';
  c.lineWidth = 1.1;
  for (let i = 0; i < 5; i++) {
    const gy = y0 + 142 + i * 6.5;
    c.beginPath();
    c.moveTo(cx - 9, gy);
    c.lineTo(cx + 5, gy + 2.5);
    c.stroke();
    c.strokeStyle = 'rgba(148,163,184,0.28)';
    c.lineWidth = 0.78;
    c.beginPath();
    c.moveTo(cx - 9, gy + 1.6);
    c.lineTo(cx + 5, gy + 4.1);
    c.stroke();
    c.strokeStyle = 'rgba(9,13,20,0.68)';
    c.lineWidth = 1.1;
  }

  // Glowing neon-green power indicator dot in the center of the dark receiver frame (matching image 3!)
  c.save();
  c.shadowColor = '#4ade80';
  c.shadowBlur = 8 * pulse;
  c.fillStyle = '#14532d';
  c.beginPath();
  c.arc(cx, y0 + 124, 4, 0, TAU);
  c.fill();
  c.fillStyle = '#4ade80';
  c.beginPath();
  c.arc(cx, y0 + 124, 2.6, 0, TAU);
  c.fill();
  c.fillStyle = '#dcfce7';
  c.beginPath();
  c.arc(cx - 0.6, y0 + 123.4, 1, 0, TAU);
  c.fill();
  c.restore();

  c.restore();

  // ══════════════════ 2. LONG POLISHED 3D CHROME-SILVER CYLINDRICAL EMITTER SHAFT ══════════════════
  // Stepped dark & silver base collars (y0 + 92 .. y0 + 112)
  c.beginPath();
  c.roundRect(cx - 11.5, y0 + 101, 23, 10, 2.5);
  c.fillStyle = lin(c, cx - 12, cx + 12, ['#1e293b', '#64748b', '#334155', '#0f172a']);
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 10, y0 + 91, 20, 11, 2);
  c.fillStyle = lin(c, cx - 10, cx + 10, ['#475569', '#e2e8f0', '#94a3b8', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Main long polished silver-chrome cylindrical shaft (y0 + 44 .. y0 + 92)
  c.beginPath();
  c.roundRect(cx - 8, y0 + 44, 16, 48, 2);
  c.fillStyle = lin(c, cx - 8, cx + 8, [
    '#475569',
    '#ffffff',
    '#f1f5f9',
    '#cbd5e1',
    '#64748b',
    '#1e293b',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Flared dark-slate saucer support neck cone (y0 + 34 .. y0 + 46)
  c.beginPath();
  c.moveTo(cx - 8.5, y0 + 46);
  c.lineTo(cx - 15, y0 + 34 + hov * 0.5);
  c.lineTo(cx + 15, y0 + 34 + hov * 0.5);
  c.lineTo(cx + 8.5, y0 + 46);
  c.closePath();
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#0f172a', '#475569', '#1e293b', '#090d14']);
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 3. WIDE 3D METALLIC FLYING SAUCER & GLOWING EMERALD DOME ══════════════════
  c.save();
  c.translate(cx, y0 + 27 + hov);

  // Back half of the outer neon-green orbital energy ring
  c.save();
  c.shadowColor = '#4ade80';
  c.shadowBlur = 12 * pulse;
  c.strokeStyle = `rgba(74,222,128,${0.55 + 0.3 * pulse})`;
  c.lineWidth = 2.2;
  c.beginPath();
  c.ellipse(0, 1, 41, 13.5, 0, Math.PI * 1.05, Math.PI * 1.95);
  c.stroke();
  c.restore();

  // Translucent glowing emerald-green glass dome on top of the saucer
  c.save();
  c.shadowColor = '#22c55e';
  c.shadowBlur = 14 * pulse;
  const domeG = c.createRadialGradient(-4, -14, 2, 0, -9, 17);
  domeG.addColorStop(0, '#ecfdf5');
  domeG.addColorStop(0.35, '#4ade80');
  domeG.addColorStop(0.75, '#10b981');
  domeG.addColorStop(1, '#064e3b');
  c.fillStyle = domeG;
  c.beginPath();
  c.arc(0, -5, 15.5, Math.PI, TAU);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(6,78,59,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Bright curved glass specular highlight on the emerald dome
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.beginPath();
  c.ellipse(-5.5, -13, 4.5, 2.2, -0.45, 0, TAU);
  c.fill();
  c.restore();

  // Dark metallic collar ring around base of green dome
  c.beginPath();
  c.ellipse(0, -4.5, 16.5, 4.5, 0, 0, TAU);
  c.fillStyle = '#1e293b';
  c.fill();
  c.strokeStyle = 'rgba(12,18,28,0.68)';
  c.lineWidth = 0.8;
  c.stroke();

  // Wide 3D metallic flying saucer disc body
  c.beginPath();
  c.ellipse(0, 1.5, 35.5, 11.2, 0, 0, TAU);
  c.fillStyle = lin(c, -36, 36, [
    '#334155',
    '#cbd5e1',
    '#ffffff',
    '#dce6f2',
    '#64748b',
    '#1e293b',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Upper saucer bevel highlight arc
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 1.3;
  c.beginPath();
  c.ellipse(0, 0.5, 32, 8.8, 0, Math.PI * 0.1, Math.PI * 0.9);
  c.stroke();

  // 5 glowing neon yellow-green oval UFO rim lights along the saucer (matching image 3!)
  const rimLights: [number, number, number][] = [
    [-25, 0.5, -0.25],
    [-13.5, 4.8, -0.12],
    [0, 6.4, 0],
    [13.5, 4.8, 0.12],
    [25, 0.5, 0.25],
  ];
  for (let i = 0; i < rimLights.length; i++) {
    const [lx, ly, lrot] = rimLights[i];
    const lPulse = 0.7 + 0.3 * Math.sin(t * 9 - i * 0.9);
    // Dark socket recess
    c.beginPath();
    c.ellipse(lx, ly, 3.8, 2.2, lrot, 0, TAU);
    c.fillStyle = '#0f172a';
    c.fill();
    // Glowing yellow-green UFO lamp
    c.save();
    c.shadowColor = '#a3e635';
    c.shadowBlur = 8 * lPulse;
    c.fillStyle = i % 2 === 0 ? '#bef264' : '#4ade80';
    c.beginPath();
    c.ellipse(lx, ly, 2.9, 1.6, lrot, 0, TAU);
    c.fill();
    c.fillStyle = '#f7fee7';
    c.beginPath();
    c.ellipse(lx, ly - 0.2, 1.4, 0.7, lrot, 0, TAU);
    c.fill();
    c.restore();
  }

  // Front half of the outer neon-green orbital energy ring
  c.save();
  c.shadowColor = '#4ade80';
  c.shadowBlur = 12 * pulse;
  c.strokeStyle = `rgba(134,239,172,${0.8 + 0.2 * pulse})`;
  c.lineWidth = 2.2;
  c.beginPath();
  c.ellipse(0, 1, 41, 13.5, 0, Math.PI * 0.08, Math.PI * 0.92);
  c.stroke();
  c.restore();

  // ══════════════════ 4. BRILLIANT NEON-GREEN MUZZLE SPIKE & UPPER VORTEX RING ══════════════════
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#4ade80';
  c.shadowBlur = 16 * pulse;

  // Upper swirling green vortex ring around the emerging beam
  c.strokeStyle = `rgba(134,239,172,${0.85 * pulse})`;
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(0, -21, 16.5, 5.2, 0, 0, TAU);
  c.stroke();

  // Outer green plasma beam cone shooting upward from dome tip
  const beamG = c.createLinearGradient(0, -14, 0, -44);
  beamG.addColorStop(0, 'rgba(74,222,128,0.95)');
  beamG.addColorStop(0.5, 'rgba(34,197,94,0.65)');
  beamG.addColorStop(1, 'rgba(34,197,94,0)');
  c.fillStyle = beamG;
  c.beginPath();
  c.moveTo(-4.5, -15);
  c.lineTo(0, -44);
  c.lineTo(4.5, -15);
  c.closePath();
  c.fill();

  // Pure white-green core needle
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.moveTo(-2, -16);
  c.lineTo(0, -36);
  c.lineTo(2, -16);
  c.closePath();
  c.fill();
  c.restore();

  c.restore();
  c.restore();
}

// ------------------------------------------------------------- RAINBOW
function rainbowGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  const RB = ['#ff2a55', '#ff7b00', '#ffd000', '#10d96b', '#00c8ff', '#3b66ff', '#a838ff'];

  // Rainbow dorsal thumb-sight tab at upper-left rear of grip
  c.save();
  c.translate(cx - 20, y0 + 118);
  c.rotate(-0.28);
  c.beginPath();
  c.roundRect(-5.5, -12, 11, 22, 4.5);
  c.fillStyle = '#e2e8f0';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  c.save();
  c.beginPath();
  c.roundRect(-3.8, -9.5, 7.6, 17, 3);
  c.clip();
  for (let i = 0; i < 6; i++) {
    c.fillStyle = RB[i];
    c.fillRect(-3.8 + i * 1.3, -9.5, 1.4, 17);
  }
  c.restore();
  c.restore();

  // Contoured dark charcoal-slate ergonomic handle with golden star badge
  c.save();
  c.translate(cx, y0 + 124);
  c.rotate(-0.18);
  c.translate(-cx, -(y0 + 124));

  c.beginPath();
  c.moveTo(cx - 20, y0 + 116);
  c.lineTo(cx + 19, y0 + 116);
  c.lineTo(cx + 16, y0 + 135);
  c.quadraticCurveTo(cx + 19, y0 + 143, cx + 12, y0 + 149);
  c.quadraticCurveTo(cx + 8, y0 + 158, cx + 11, y0 + 169);
  c.quadraticCurveTo(cx + 12, y0 + 179, cx + 3, y0 + 183);
  c.lineTo(cx - 12, y0 + 181);
  c.quadraticCurveTo(cx - 19, y0 + 176, cx - 16, y0 + 165);
  c.lineTo(cx - 14, y0 + 138);
  c.quadraticCurveTo(cx - 21, y0 + 130, cx - 20, y0 + 116);
  c.closePath();
  c.fillStyle = lin(c, cx - 20, cx + 19, ['#3b4559', '#252c3b', '#171c26', '#0d1017']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.fillStyle = '#38bdf8';
  c.beginPath();
  c.roundRect(cx - 15, y0 + 127, 3.5, 8, 1.5);
  c.fill();

  c.strokeStyle = '#64748b';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 174);
  c.quadraticCurveTo(cx - 2, y0 + 179, cx + 9, y0 + 175);
  c.stroke();

  // Circular badge with 5-pointed golden star on the grip
  c.save();
  c.translate(cx - 1, y0 + 156);
  c.beginPath();
  c.arc(0, 0, 8.8, 0, TAU);
  c.fillStyle = '#e0f2fe';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  c.beginPath();
  c.arc(0, 0, 6.8, 0, TAU);
  c.fillStyle = '#38bdf8';
  c.fill();
  c.rotate(-0.15 + Math.sin(t * 3) * 0.08);
  star(c, 0, 0, 6.2, '#facc15', 5);
  c.strokeStyle = '#d97706';
  c.lineWidth = 0.72;
  c.stroke();
  c.restore();

  c.restore();

  // Vibrant 6-band Rainbow Arch at Muzzle
  const archY = y0 + 27;
  c.save();
  c.shadowColor = '#f472b6';
  c.shadowBlur = 10 * pulse;
  c.beginPath();
  c.arc(cx, archY, 20.8, Math.PI * 0.97, TAU * 1.03);
  c.strokeStyle = 'rgba(15,23,42,0.52)';
  c.lineWidth = 16.2;
  c.lineCap = 'round';
  c.stroke();

  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.arc(cx, archY, 27 - i * 2.5, Math.PI * 0.98, TAU * 1.02);
    c.strokeStyle = RB[i];
    c.lineWidth = 2.8;
    c.lineCap = 'round';
    c.stroke();
  }
  c.restore();

  // Silver-white rear base collar cradling the rainbow barrel
  c.beginPath();
  c.roundRect(cx - 23.5, y0 + 111, 47, 13, [4, 4, 9, 9]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#94a3b8', '#ffffff', '#e2e8f0', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Wide glossy 7-stripe rainbow cylinder barrel
  c.save();
  c.beginPath();
  c.roundRect(cx - 22.5, y0 + 31, 45, 86, 10);
  c.clip();

  const stripeW = 45 / 7;
  for (let i = 0; i < 7; i++) {
    const sx = cx - 22.5 + i * stripeW;
    c.fillStyle = RB[i];
    c.fillRect(sx - 0.4, y0 + 31, stripeW + 0.8, 86);
  }

  const waveY = y0 + 117 - ((t * 58) % 104);
  const wg = c.createLinearGradient(0, waveY - 16, 0, waveY + 16);
  wg.addColorStop(0, 'rgba(255,255,255,0)');
  wg.addColorStop(0.5, 'rgba(255,255,255,0.38)');
  wg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = wg;
  c.fillRect(cx - 23, waveY - 16, 46, 32);

  const cylShade = c.createLinearGradient(cx - 22.5, 0, cx + 22.5, 0);
  cylShade.addColorStop(0, 'rgba(15,23,42,0.22)');
  cylShade.addColorStop(0.18, 'rgba(255,255,255,0.48)');
  cylShade.addColorStop(0.32, 'rgba(255,255,255,0.12)');
  cylShade.addColorStop(0.75, 'rgba(15,23,42,0.08)');
  cylShade.addColorStop(1, 'rgba(15,23,42,0.38)');
  c.fillStyle = cylShade;
  c.fillRect(cx - 22.5, y0 + 31, 45, 86);
  c.restore();

  c.beginPath();
  c.roundRect(cx - 22.5, y0 + 31, 45, 86, 10);
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath();
  c.roundRect(cx - 15.5, y0 + 38, 4.2, 72, 2.1);
  c.fill();

  // Curved pearl-white & silver front muzzle rim cap
  c.beginPath();
  c.roundRect(cx - 23.5, y0 + 27, 47, 10, [8, 8, 3, 3]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#94a3b8', '#ffffff', '#f1f5f9', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Two fluffy 3D white clouds at muzzle corners
  const drawFluffyCloud = (x: number, y: number, flip: number) => {
    c.save();
    c.translate(x, y);
    c.scale(flip, 1);
    c.beginPath();
    c.arc(-5.6, 2, 5.4, 0, TAU);
    c.arc(1, -2.6, 6.6, 0, TAU);
    c.arc(7.6, 1, 5.7, 0, TAU);
    c.arc(3, 4.6, 5.2, 0, TAU);
    c.arc(-3, 4.6, 4.9, 0, TAU);
    c.fillStyle = 'rgba(30,41,59,0.58)';
    c.fill();

    c.beginPath();
    c.arc(-5.5, 2, 4.8, 0, TAU);
    c.arc(1, -2.5, 6, 0, TAU);
    c.arc(7.5, 1, 5.1, 0, TAU);
    c.arc(3, 4.5, 4.6, 0, TAU);
    c.arc(-3, 4.5, 4.3, 0, TAU);
    c.fillStyle = '#cbd5e1';
    c.fill();

    c.beginPath();
    c.arc(-5.5, 1, 4.3, 0, TAU);
    c.arc(1, -3.2, 5.6, 0, TAU);
    c.arc(7, 0.2, 4.6, 0, TAU);
    c.arc(1.5, 2.5, 4.2, 0, TAU);
    c.fillStyle = '#ffffff';
    c.fill();
    c.restore();
  };

  const cloudBob = Math.sin(t * 3.5) * 1.2;
  drawFluffyCloud(cx - 23, y0 + 27 + cloudBob, 1);
  drawFluffyCloud(cx + 23, y0 + 27 - cloudBob, -1);

  // Twinkling stars around barrel (7 stars in 'current' variant so signature is distinct from 'original')
  const sparkles: [number, number, number, string, number][] = [
    [cx - 32, y0 + 52, 4.8, '#4ade80', 0],
    [cx - 30, y0 + 82, 4.2, '#facc15', 1.4],
    [cx + 31, y0 + 60, 4.5, '#facc15', 2.6],
    [cx + 30, y0 + 96, 4.8, '#fbbf24', 3.8],
    [cx - 28, y0 + 12, 3.6, '#fb923c', 4.9],
    [cx + 28, y0 + 10, 3.5, '#f472b6', 5.7],
    [cx, y0 - 8, 4, '#38bdf8', 2.1],
  ];
  for (const [sx, sy, sr, scol, phase] of sparkles) {
    const sc = 0.65 + 0.35 * Math.sin(t * 5 + phase);
    c.save();
    c.translate(sx, sy + Math.sin(t * 3 + phase) * 1.8);
    c.rotate(Math.sin(t * 2 + phase) * 0.25);
    c.shadowColor = scol;
    c.shadowBlur = 6 * sc;
    star(c, 0, 0, sr * sc, scol, 5);
    c.restore();
  }

  c.restore();
}

// ------------------------------------------------------------- METEOR
function meteorGun(c: C, cx: number, y0: number, t: number) {
  const heat = 0.78 + 0.22 * Math.sin(t * 5.2);

  const basaltGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090a0f', '#1e2430', '#3b4252', '#525b6e', '#262b36', '#0d1017']);
  const magmaGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#991b1b', '#ea580c', '#fbbf24', '#fffbeb', '#f97316', '#b91c1c']);

  // ══════════════════ 1. VOLCANIC BASALT PISTOL GRIP (ANGLED OUT TO +X), MAGMA TRIGGER & TRIGGER GUARD (`y0 + 78 .. y0 + 152`) ══════════════════
  // Craggy volcanic stone trigger guard (`cx + 10 .. cx + 30, y0 + 74 .. y0 + 106`)
  c.beginPath();
  c.moveTo(cx + 12, y0 + 74);
  c.lineTo(cx + 29, y0 + 80);
  c.lineTo(cx + 28, y0 + 100);
  c.lineTo(cx + 14, y0 + 105);
  c.lineTo(cx + 11, y0 + 98);
  c.lineTo(cx + 22, y0 + 95);
  c.lineTo(cx + 22, y0 + 84);
  c.lineTo(cx + 11, y0 + 81);
  c.closePath();
  c.fillStyle = basaltGrad(cx + 10, cx + 29);
  c.fill();
  c.strokeStyle = 'rgba(15,18,26,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Glowing molten-gold trigger inside the stone guard (`cx + 12 .. cx + 21, y0 + 82 .. y0 + 95`, matching METEOR LAUNCHER image!)
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 8 * heat;
  c.beginPath();
  c.moveTo(cx + 12, y0 + 82);
  c.quadraticCurveTo(cx + 20, y0 + 87, cx + 17, y0 + 95);
  c.lineTo(cx + 12, y0 + 93);
  c.closePath();
  c.fillStyle = magmaGrad(cx + 12, cx + 20);
  c.fill();
  c.restore();

  // Jagged volcanic basalt pistol grip angling out to `+x, +y` (`cx + 4 .. cx + 41, y0 + 92 .. y0 + 148`, so rear breech extends behind it!)
  c.beginPath();
  c.moveTo(cx + 4, y0 + 98);
  c.lineTo(cx + 19, y0 + 92);
  c.lineTo(cx + 32, y0 + 112);
  c.lineTo(cx + 41, y0 + 134);
  c.lineTo(cx + 34, y0 + 146);
  c.lineTo(cx + 20, y0 + 148);
  c.lineTo(cx + 12, y0 + 126);
  c.closePath();
  c.fillStyle = basaltGrad(cx + 4, cx + 41);
  c.fill();
  c.strokeStyle = 'rgba(12,14,20,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glowing magma vein running down the stone pistol grip
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 8 * heat;
  c.strokeStyle = '#fb923c';
  c.lineWidth = 2.2;
  c.beginPath();
  c.moveTo(cx + 13, y0 + 98);
  c.lineTo(cx + 22, y0 + 115);
  c.lineTo(cx + 21, y0 + 129);
  c.lineTo(cx + 30, y0 + 143);
  c.stroke();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.9;
  c.stroke();
  c.restore();

  // ══════════════════ 2. HEAVY CRAGGY OBSIDIAN-BASALT CANNON BODY, TOP SIGHT RIDGE & MOLTEN MAGMA FISSURES (`y0 + 20 .. y0 + 148`) ══════════════════
  // Craggy raised volcanic stone sight ridge along upper-left spine (`cx - 30 .. cx - 18, y0 + 52 .. y0 + 98`, matching METEOR LAUNCHER image!)
  c.beginPath();
  c.moveTo(cx - 20, y0 + 50);
  c.lineTo(cx - 29, y0 + 62);
  c.lineTo(cx - 26, y0 + 78);
  c.lineTo(cx - 30, y0 + 90);
  c.lineTo(cx - 21, y0 + 102);
  c.closePath();
  c.fillStyle = basaltGrad(cx - 30, cx - 18);
  c.fill();
  c.strokeStyle = 'rgba(12,14,20,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Main craggy volcanic cannon body (`cx - 25 .. cx + 23, y0 + 20 .. y0 + 148`)
  c.save();
  c.beginPath();
  c.moveTo(cx - 21, y0 + 22);
  c.lineTo(cx + 21, y0 + 22);
  c.lineTo(cx + 24, y0 + 44);
  c.lineTo(cx + 20, y0 + 76);
  c.lineTo(cx + 23, y0 + 106);
  c.lineTo(cx + 16, y0 + 138);
  c.lineTo(cx - 8, y0 + 148);
  c.lineTo(cx - 23, y0 + 136);
  c.lineTo(cx - 25, y0 + 102);
  c.lineTo(cx - 21, y0 + 70);
  c.lineTo(cx - 24, y0 + 42);
  c.closePath();
  c.fillStyle = basaltGrad(cx - 25, cx + 24);
  c.fill();
  c.clip();

  // Individual sculpted 3D polygonal basalt rock plates on the cannon body
  const rockPlates: [number, number][][] = [
    [[-22, 34], [-4, 42], [-7, 68], [-22, 62]],
    [[2, 36], [22, 32], [20, 62], [4, 58]],
    [[-23, 76], [-4, 78], [-2, 104], [-23, 100]],
    [[4, 72], [21, 68], [21, 98], [5, 102]],
    [[-21, 112], [2, 112], [12, 134], [-14, 140]],
  ];
  for (let i = 0; i < rockPlates.length; i++) {
    const pl = rockPlates[i];
    c.beginPath();
    c.moveTo(cx + pl[0][0], y0 + pl[0][1]);
    for (let k = 1; k < pl.length; k++) c.lineTo(cx + pl[k][0], y0 + pl[k][1]);
    c.closePath();
    c.fillStyle = i % 2 === 0 ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.38)';
    c.fill();
  }

  // Interconnected rivers of molten orange-gold lava cracking the basalt cannon body (matching METEOR LAUNCHER image!)
  const drawLavaCrack = (pts: [number, number][], w = 3.2) => {
    c.beginPath();
    c.moveTo(cx + pts[0][0], y0 + pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      c.lineTo(cx + pts[i][0], y0 + pts[i][1]);
    }
    c.strokeStyle = '#ea580c';
    c.lineWidth = w + 1.6;
    c.stroke();
    c.strokeStyle = '#fbbf24';
    c.lineWidth = w * 0.68;
    c.stroke();
    c.strokeStyle = '#fffbeb';
    c.lineWidth = w * 0.3;
    c.stroke();
  };

  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 11 * heat;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  // Main jagged central magma river
  drawLavaCrack([[-12, 26], [-1, 44], [3, 64], [-4, 82], [2, 108], [-5, 138]], 3.2);
  // Polygonal plate fissures branching across the barrel
  drawLavaCrack([[-23, 38], [-1, 44], [22, 34]], 2.4);
  drawLavaCrack([[-21, 70], [3, 64], [20, 64]], 2.4);
  drawLavaCrack([[-23, 104], [2, 108], [21, 98]], 2.4);
  drawLavaCrack([[-4, 82], [-18, 92]], 2.0);
  drawLavaCrack([[2, 108], [14, 128]], 2.0);
  drawLavaCrack([[-1, 44], [-14, 56]], 1.8);
  drawLavaCrack([[3, 64], [15, 82]], 1.8);
  c.restore();
  c.restore();

  // Crisp outer volcanic stone outline
  c.beginPath();
  c.moveTo(cx - 21, y0 + 22);
  c.lineTo(cx + 21, y0 + 22);
  c.lineTo(cx + 24, y0 + 44);
  c.lineTo(cx + 20, y0 + 76);
  c.lineTo(cx + 23, y0 + 106);
  c.lineTo(cx + 16, y0 + 138);
  c.lineTo(cx - 8, y0 + 148);
  c.lineTo(cx - 23, y0 + 136);
  c.lineTo(cx - 25, y0 + 102);
  c.lineTo(cx - 21, y0 + 70);
  c.lineTo(cx - 24, y0 + 42);
  c.closePath();
  c.strokeStyle = 'rgba(12,14,20,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // ══════════════════ 3. CHISELED VOLCANIC MUZZLE COLLAR & ERUPTING CRUSTY METEOR FIREBALL (`y0 - 15 .. y0 + 29`) ══════════════════
  // Heavy chiseled polygonal stone muzzle collar (`cx - 23 .. cx + 23, y0 + 14 .. y0 + 29`)
  c.beginPath();
  c.ellipse(cx, y0 + 21.5, 22.5, 7.5, 0, 0, TAU);
  c.fillStyle = basaltGrad(cx - 22.5, cx + 22.5);
  c.fill();
  c.strokeStyle = 'rgba(12,14,20,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glowing molten-orange bore inside the muzzle rim
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 15 * heat;
  c.beginPath();
  c.ellipse(cx, y0 + 20, 17, 5.2, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 20, 17.5, ['#fffbeb', '#fde047', '#f97316', '#9a3412']);
  c.fill();
  c.restore();

  // Blazing crusty meteor fireball emerging from the muzzle (`cx, y0 + 5`, r = 15, matching METEOR LAUNCHER image!)
  c.save();
  const mY = y0 + 5 + Math.sin(t * 6) * 1.2;
  // Fiery outer corona & flame tongues around the meteor
  const corona = c.createRadialGradient(cx, mY, 5, cx, mY, 26);
  corona.addColorStop(0, 'rgba(255,251,235,0.96)');
  corona.addColorStop(0.45, 'rgba(251,191,36,0.8)');
  corona.addColorStop(0.75, 'rgba(234,88,12,0.5)');
  corona.addColorStop(1, 'rgba(153,27,27,0)');
  c.fillStyle = corona;
  c.beginPath();
  c.arc(cx, mY, 26, 0, TAU);
  c.fill();

  // Molten meteor sphere core
  c.beginPath();
  c.arc(cx, mY, 15, 0, TAU);
  c.fillStyle = radial(c, cx - 3, mY - 3, 15.5, ['#fffbeb', '#fef08a', '#f97316', '#dc2626', '#7f1d1d']);
  c.fill();
  c.strokeStyle = 'rgba(254,240,138,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Polygonal dark cooled-basalt crust plates on the meteor separated by glowing lava cracks (matching METEOR LAUNCHER image!)
  c.fillStyle = '#26171a';
  const crustPolys: [number, number][][] = [
    [[-10, -5], [-2, -11], [1, -4], [-6, 0]],
    [[3, -10], [11, -4], [8, 2], [2, -2]],
    [[-11, 2], [-3, 2], [-1, 10], [-9, 8]],
    [[2, 3], [10, 4], [7, 11], [1, 10]],
  ];
  for (const poly of crustPolys) {
    c.beginPath();
    c.moveTo(cx + poly[0][0], mY + poly[0][1]);
    for (let k = 1; k < poly.length; k++) c.lineTo(cx + poly[k][0], mY + poly[k][1]);
    c.closePath();
    c.fill();
  }

  // Flying fiery orange-gold embers around the meteor launcher
  for (let i = 0; i < 5; i++) {
    const a = t * 2.4 + i * (TAU / 5);
    const ex = cx + Math.cos(a) * 23;
    const ey = mY + Math.sin(a) * 12;
    c.fillStyle = i % 2 === 0 ? '#fde047' : '#f97316';
    c.beginPath();
    c.arc(ex, ey, 1.8, 0, TAU);
    c.fill();
  }
  c.restore();
}

// ------------------------------------------------------------- DIAMOND
function diamondGun(c: C, cx: number, y0: number, t: number) {
  rr(c, cx - 12, y0 + 107, 24, 54, 7, lin(c, cx - 12, cx + 12,
    ['#14243f', '#507498', '#26395e', '#111c35']), '#c6e9f6', 1.7);
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = 'rgba(206,247,255,0.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 9, y0 + 118 + i * 10); c.lineTo(cx + 8, y0 + 124 + i * 10); c.stroke();
  }
  rr(c, cx - 17, y0 + 152, 34, 8, 3, chrome(c, cx - 17, cx + 17), '#415976', 1);
  for (const side of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + side * 12, y0 + 38);
    c.lineTo(cx + side * 27, y0 + 49); c.lineTo(cx + side * 24, y0 + 105);
    c.lineTo(cx + side * 12, y0 + 132); c.closePath();
    c.fillStyle = lin(c, cx - 29, cx + 29, ['#647a96', '#f7feff', '#9eb8ca', '#3f5577']);
    c.fill(); c.strokeStyle = '#334766'; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.86)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(cx + side * 25, y0 + 50);
    c.lineTo(cx + side * 13, y0 + 96); c.lineTo(cx + side * 23, y0 + 104); c.stroke();
  }
  rr(c, cx - 16, y0 + 42, 32, 83, 5, lin(c, cx - 16, cx + 16,
    ['#0f2948', '#568ab0', '#255280', '#112743']), '#eefaff', 1.6);
  // Precision-cut inset gems with white facet lines and sapphire shadows.
  for (const [xx, yy, size] of [[0, 63, 8], [-6, 89, 5], [7, 91, 5], [0, 111, 6]]) {
    c.save(); c.translate(cx + xx, y0 + yy);
    c.beginPath(); c.moveTo(0, -size); c.lineTo(size * 0.85, -size * 0.25);
    c.lineTo(0, size); c.lineTo(-size * 0.85, -size * 0.25); c.closePath();
    c.fillStyle = lin(c, -size, size, ['#2789be', '#f7ffff', '#59d8f6', '#0a6296']);
    c.fill(); c.strokeStyle = '#e7fcff'; c.lineWidth = 0.9; c.stroke();
    c.beginPath(); c.moveTo(0, -size); c.lineTo(0, size);
    c.moveTo(-size * 0.85, -size * 0.25); c.lineTo(size * 0.85, -size * 0.25); c.stroke();
    c.restore();
  }
  rr(c, cx - 21, y0 + 119, 42, 8, 2, chrome(c, cx - 21, cx + 21), '#425d73', 1);
  // Crown-size faceted diamond emitter (its apex is the firing point).
  c.save(); c.translate(cx, y0 + 17);
  c.shadowColor = '#67e8f9'; c.shadowBlur = 19;
  c.beginPath(); c.moveTo(0, -22); c.lineTo(13, -13); c.lineTo(19, -2);
  c.lineTo(0, 23); c.lineTo(-19, -2); c.lineTo(-13, -13); c.closePath();
  c.fillStyle = lin(c, -19, 19, ['#279dc5', '#dcfaff', '#ffffff', '#67c8e9', '#257aa8']);
  c.fill(); c.shadowBlur = 0; c.strokeStyle = '#f0fdff'; c.lineWidth = 1.6; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.63)';
  c.beginPath(); c.moveTo(0, -22); c.lineTo(-6, -2); c.lineTo(0, 23);
  c.lineTo(6, -2); c.closePath(); c.fill();
  c.strokeStyle = '#518bb6'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-19, -2); c.lineTo(19, -2);
  c.moveTo(-13, -13); c.lineTo(-6, -2); c.lineTo(0, 23);
  c.moveTo(13, -13); c.lineTo(6, -2); c.lineTo(0, 23); c.stroke();
  c.restore();
  // Slide #2 diamond formation near the gun muzzle + diamond sparkles
  drawSlide2DiamondMuzzleFormation(c, cx, y0 + 15, t, gunState.sinceShot, true);
  if (Math.sin(t * 5) > 0) star(c, cx - 14, y0 + 8, 4, '#ffffff', 4);
  if (Math.cos(t * 4) > 0) star(c, cx + 17, y0 + 34, 3, '#ffffff', 4);
}

// ------------------------------------------------------------- MOONBEAM
function moonbeamGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.78 + 0.22 * Math.sin(t * 4.2);

  const royalGoldGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef9c3', '#eab308', '#92400e']);
  const violetShaftGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#2e1065', '#6d28d9', '#a855f7', '#e9d5ff', '#7e22ce', '#3b0764']);
  const pearlShaftGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#6b21a8', '#c084fc', '#f5f3ff', '#ffffff', '#e9d5ff', '#7e22ce']);
  const cyanGemGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#0284c7', '#38bdf8', '#e0f2fe', '#ffffff', '#0ea5e9']);

  // ══════════════════ 1. ORNATE GOLDEN SPIKED POMMEL & CYAN SIDE GEMS (`y0 + 158 .. y0 + 194`) ══════════════════
  // Glowing cyan side jewels on the pommel (`cx - 12` & `cx + 12, y0 + 170`, matching MOONBEAM image!)
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 6, y0 + 165);
    c.lineTo(cx + s * 13.5, y0 + 170);
    c.lineTo(cx + s * 6, y0 + 175);
    c.closePath();
    c.fillStyle = cyanGemGrad(cx - 14, cx + 14);
    c.fill();
    c.strokeStyle = 'rgba(12,74,110,0.85)';
    c.lineWidth = 0.76;
    c.stroke();
  }

  // Ornate tapered golden pommel with bottom spike (`cx - 9.5 .. cx + 9.5, y0 + 158 .. y0 + 194`)
  c.beginPath();
  c.moveTo(cx - 7.5, y0 + 158);
  c.lineTo(cx + 7.5, y0 + 158);
  c.lineTo(cx + 9.5, y0 + 169);
  c.lineTo(cx + 5, y0 + 180);
  c.lineTo(cx, y0 + 194);
  c.lineTo(cx - 5, y0 + 180);
  c.lineTo(cx - 9.5, y0 + 169);
  c.closePath();
  c.fillStyle = royalGoldGrad(cx - 9.5, cx + 9.5);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  // ══════════════════ 2. ROYAL INDIGO-VIOLET LOWER HANDLE SHAFT (`cx - 6.8 .. cx + 6.8, y0 + 108 .. y0 + 160`) ══════════════════
  c.beginPath();
  c.roundRect(cx - 6.8, y0 + 108, 13.6, 52, 3.5);
  c.fillStyle = violetShaftGrad(cx - 6.8, cx + 6.8);
  c.fill();
  c.strokeStyle = 'rgba(46,16,101,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Golden ring collars on lower shaft
  for (const ry of [114, 154]) {
    c.beginPath();
    c.roundRect(cx - 8.2, y0 + ry, 16.4, 4.5, 2);
    c.fillStyle = royalGoldGrad(cx - 8.2, cx + 8.2);
    c.fill();
    c.strokeStyle = 'rgba(92,45,12,0.85)';
    c.lineWidth = 0.78;
    c.stroke();
  }

  // ══════════════════ 3. WINGED GOLDEN CENTER GUARD & RADIANT CYAN GEM (`cx - 16 .. cx + 16, y0 + 92 .. y0 + 114`) ══════════════════
  c.beginPath();
  c.moveTo(cx, y0 + 90);
  c.lineTo(cx + 16, y0 + 102);
  c.lineTo(cx + 9, y0 + 114);
  c.lineTo(cx - 9, y0 + 114);
  c.lineTo(cx - 16, y0 + 102);
  c.closePath();
  c.fillStyle = royalGoldGrad(cx - 16, cx + 16);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Glowing cyan diamond jewel at center of the golden guard (`cx, y0 + 102`)
  c.beginPath();
  c.moveTo(cx, y0 + 96);
  c.lineTo(cx + 5.5, y0 + 102);
  c.lineTo(cx, y0 + 108);
  c.lineTo(cx - 5.5, y0 + 102);
  c.closePath();
  c.fillStyle = cyanGemGrad(cx - 5.5, cx + 5.5);
  c.fill();
  c.strokeStyle = '#ffffff';
  c.lineWidth = 0.78;
  c.stroke();

  // ══════════════════ 4. PEARLESCENT WHITE-LAVENDER UPPER SHAFT WITH GOLD & VIOLET CHEVRONS (`y0 + 42 .. y0 + 96`) ══════════════════
  c.beginPath();
  c.moveTo(cx - 9.2, y0 + 42);
  c.lineTo(cx + 9.2, y0 + 42);
  c.lineTo(cx + 7.5, y0 + 96);
  c.lineTo(cx - 7.5, y0 + 96);
  c.closePath();
  c.fillStyle = pearlShaftGrad(cx - 9.2, cx + 9.2);
  c.fill();
  c.strokeStyle = 'rgba(88,28,135,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  // Ornate gold & royal-purple V-chevrons along the pearlescent upper shaft (matching MOONBEAM image!)
  for (let i = 0; i < 3; i++) {
    const cy = y0 + 53 + i * 13;
    c.strokeStyle = i % 2 === 0 ? '#eab308' : '#9333ea';
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(cx - 7.5, cy);
    c.lineTo(cx, cy + 6.5);
    c.lineTo(cx + 7.5, cy);
    c.stroke();
  }

  // Ornate Winged Golden Crown Calyx under the crescent moon head (`cx - 19 .. cx + 19, y0 + 30 .. y0 + 46`, matching MOONBEAM image!)
  c.beginPath();
  c.moveTo(cx - 19, y0 + 38);
  c.lineTo(cx - 8, y0 + 35);
  c.lineTo(cx, y0 + 28);
  c.lineTo(cx + 8, y0 + 35);
  c.lineTo(cx + 19, y0 + 38);
  c.lineTo(cx + 11.5, y0 + 46);
  c.lineTo(cx - 11.5, y0 + 46);
  c.closePath();
  c.fillStyle = royalGoldGrad(cx - 19, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Amethyst jewel on the golden neck collar (`cx, y0 + 39`)
  c.beginPath();
  c.arc(cx, y0 + 39, 3.6, 0, TAU);
  c.fillStyle = radial(c, cx - 1, y0 + 38, 3.8, ['#fae8ff', '#d946ef', '#701a75']);
  c.fill();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.72;
  c.stroke();

  // ══════════════════ 5. GRAND GOLDEN & VIOLET CRESCENT MOON HEAD & LUMINOUS MOON-PEARL ORB (`y0 - 15 .. y0 + 38`) ══════════════════
  // Soft celestial violet-gold aura behind the crescent moon head
  const aura = c.createRadialGradient(cx, y0 + 12, 2, cx, y0 + 12, 36);
  aura.addColorStop(0, `rgba(250,232,255,${0.58 * pulse})`);
  aura.addColorStop(0.5, `rgba(192,132,252,${0.28 * pulse})`);
  aura.addColorStop(1, 'rgba(109,40,217,0)');
  c.fillStyle = aura;
  c.beginPath();
  c.arc(cx, y0 + 12, 36, 0, TAU);
  c.fill();

  // Majestic Golden & Royal-Violet Crescent Moon (`cx, y0 + 12`, R = 25, rotated `-0.18 rad` so horns frame the orb symmetrically!)
  c.save();
  c.translate(cx, y0 + 12);
  c.rotate(-0.18);
  // Outer golden crescent moon body
  c.beginPath();
  c.arc(0, 0, 25, Math.PI * 0.2, Math.PI * 1.8);
  c.arc(8.5, -1.5, 18, Math.PI * 1.72, Math.PI * 0.28, true);
  c.closePath();
  c.fillStyle = royalGoldGrad(-25, 25);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Inner royal-violet enamel recess along the crescent curve
  c.beginPath();
  c.arc(-1.8, 0, 20.8, Math.PI * 0.34, Math.PI * 1.66);
  c.arc(6.5, -1, 16.5, Math.PI * 1.6, Math.PI * 0.4, true);
  c.closePath();
  c.fillStyle = violetShaftGrad(-20, 14);
  c.fill();
  c.restore();

  // Luminous Lavender-White Moon Pearl Orb nestled inside the crescent (`cx + 4.5, y0 + 10.5`, r = 13.4)
  c.save();
  const orbX = cx + 4.5;
  const orbY = y0 + 10.5;
  c.shadowColor = '#f5d0fe';
  c.shadowBlur = 18 * pulse;
  c.beginPath();
  c.arc(orbX, orbY, 13.4, 0, TAU);
  const orbG = c.createRadialGradient(orbX - 4, orbY - 4, 1.5, orbX, orbY, 13.6);
  orbG.addColorStop(0, '#ffffff');
  orbG.addColorStop(0.38, '#fae8ff');
  orbG.addColorStop(0.75, '#d8b4fe');
  orbG.addColorStop(1, '#9333ea');
  c.fillStyle = orbG;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.92)';
  c.lineWidth = 0.88;
  c.stroke();

  // Glossy specular crescent & dot on the Moon Pearl Orb
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.beginPath();
  c.ellipse(orbX - 4.4, orbY - 4.4, 3.8, 2.0, -0.6, 0, TAU);
  c.fill();
  c.restore();

  // Swirling golden shooting-star trail & 4-point celestial stars around the Moonbeam staff
  c.save();
  c.strokeStyle = 'rgba(253,224,71,0.78)';
  c.lineWidth = 1.5;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 20, y0 + 62);
  c.bezierCurveTo(cx - 26, y0 + 36, cx + 20, y0 + 48, cx + 24, y0 + 25);
  c.stroke();
  star(c, cx + 24, y0 + 24, 4.5, '#fde047', 4);
  star(c, cx - 22, y0 + 1, 3.8 * pulse, '#ffffff', 4);
  star(c, cx + 19, y0 - 5, 3.0, '#fef08a', 4);
  c.restore();
}

// ------------------------------------------------------------- STORM CALLER
function stormGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.78 + 0.22 * Math.sin(t * 9);

  const navyBarrelGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d16', '#1e293b', '#334155', '#64748b', '#1e293b', '#090d16']);
  const iceCyanArmorGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#0284c7', '#38bdf8', '#bae6fd', '#ffffff', '#7dd3fc', '#0369a1']);
  const boltGlowGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#38bdf8', '#bae6fd', '#ffffff', '#e0f2fe', '#0ea5e9']);

  // ══════════════════ 1. ANGULAR DARK-NAVY GRIP (ANGLED OUT TO +X) WITH CYAN LIGHTNING INLAY & TRIGGER GUARD (`y0 + 80 .. y0 + 154`) ══════════════════
  // Angular ice-cyan trigger guard (`cx + 10 .. cx + 31, y0 + 78 .. y0 + 108`)
  c.beginPath();
  c.moveTo(cx + 11, y0 + 78);
  c.lineTo(cx + 30, y0 + 85);
  c.lineTo(cx + 26, y0 + 105);
  c.lineTo(cx + 11, y0 + 108);
  c.lineTo(cx + 10, y0 + 102);
  c.lineTo(cx + 21, y0 + 100);
  c.lineTo(cx + 23, y0 + 88);
  c.lineTo(cx + 10, y0 + 84);
  c.closePath();
  c.fillStyle = iceCyanArmorGrad(cx + 10, cx + 30);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.9)';
  c.lineWidth = 0.85;
  c.stroke();

  // Glowing cyan trigger blade
  c.beginPath();
  c.moveTo(cx + 12, y0 + 86);
  c.lineTo(cx + 19, y0 + 92);
  c.lineTo(cx + 15, y0 + 99);
  c.lineTo(cx + 11, y0 + 97);
  c.closePath();
  c.fillStyle = '#38bdf8';
  c.fill();

  // Ergonomic dark-navy pistol grip framed in ice-cyan, angled strongly out to `+x, +y` (`cx + 2 .. cx + 44, y0 + 94 .. y0 + 150`, matching STORM CALLER image!)
  c.beginPath();
  c.moveTo(cx + 2, y0 + 100);
  c.lineTo(cx + 18, y0 + 92);
  c.lineTo(cx + 44, y0 + 134);
  c.lineTo(cx + 32, y0 + 150);
  c.lineTo(cx + 16, y0 + 146);
  c.lineTo(cx + 6, y0 + 124);
  c.closePath();
  c.fillStyle = navyBarrelGrad(cx + 2, cx + 44);
  c.fill();
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 0.92;
  c.stroke();

  // Glowing blue-cyan energy panel & lightning bolt (`⚡`) inside the angled grip
  c.beginPath();
  c.moveTo(cx + 8, y0 + 106);
  c.lineTo(cx + 18, y0 + 101);
  c.lineTo(cx + 37, y0 + 132);
  c.lineTo(cx + 24, y0 + 140);
  c.closePath();
  c.fillStyle = lin(c, cx + 8, cx + 37, ['#0369a1', '#0284c7', '#38bdf8']);
  c.fill();
  // Mini white-cyan lightning bolt on grip
  c.fillStyle = '#e0f2fe';
  c.beginPath();
  c.moveTo(cx + 17, y0 + 109);
  c.lineTo(cx + 15, y0 + 122);
  c.lineTo(cx + 21, y0 + 121);
  c.lineTo(cx + 23, y0 + 134);
  c.lineTo(cx + 27, y0 + 119);
  c.lineTo(cx + 21, y0 + 120);
  c.closePath();
  c.fill();

  // ══════════════════ 2. HEAVY DARK-SLATE/NAVY BARREL WITH LARGE GLOWING LIGHTNING BOLT (`y0 + 10 .. y0 + 106`) ══════════════════
  // Main heavy dark-navy metallic barrel (`cx - 19 .. cx + 18, y0 + 12 .. y0 + 104`)
  c.beginPath();
  c.moveTo(cx - 16, y0 + 12);
  c.lineTo(cx + 16, y0 + 12);
  c.lineTo(cx + 19, y0 + 26);
  c.lineTo(cx + 18, y0 + 100);
  c.lineTo(cx - 18, y0 + 104);
  c.lineTo(cx - 19, y0 + 26);
  c.closePath();
  c.fillStyle = navyBarrelGrad(cx - 19, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Bold glowing white-cyan lightning bolt emblem across the dark barrel (`cx - 8 .. cx + 10, y0 + 22 .. y0 + 74`, matching STORM CALLER image!)
  c.save();
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 11 * pulse;
  c.beginPath();
  c.moveTo(cx + 3, y0 + 22);
  c.lineTo(cx - 8, y0 + 49);
  c.lineTo(cx - 1, y0 + 49);
  c.lineTo(cx - 6, y0 + 74);
  c.lineTo(cx + 10, y0 + 43);
  c.lineTo(cx + 2, y0 + 43);
  c.closePath();
  c.fillStyle = boltGlowGrad(cx - 8, cx + 10);
  c.fill();
  c.restore();

  // ══════════════════ 3. SWEPT-BACK ICE-CYAN THUNDERBIRD WING CREST, SHROUD & RECEIVER SHIELD (`y0 + 14 .. y0 + 122`) ══════════════════
  // Swept-back multi-feathered ice-cyan thunderbird wing crest on upper-left spine (`cx - 32 .. cx - 8, y0 + 52 .. y0 + 122`, matching STORM CALLER image!)
  c.beginPath();
  c.moveTo(cx - 18, y0 + 52);
  c.lineTo(cx - 28, y0 + 72);
  c.lineTo(cx - 21, y0 + 78);
  c.lineTo(cx - 32, y0 + 98);
  c.lineTo(cx - 23, y0 + 104);
  c.lineTo(cx - 29, y0 + 118);
  c.lineTo(cx - 11, y0 + 122);
  c.lineTo(cx - 8, y0 + 96);
  c.closePath();
  c.fillStyle = iceCyanArmorGrad(cx - 32, cx - 8);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Glowing 4-point star gem on the ice-cyan wing crest (`cx - 18, y0 + 92`)
  star(c, cx - 18, y0 + 92, 4.5 * pulse, '#ffffff', 4);

  // Jagged ice-cyan under-barrel front fin (`cx + 13 .. cx + 26, y0 + 22 .. y0 + 84`)
  c.beginPath();
  c.moveTo(cx + 16, y0 + 22);
  c.lineTo(cx + 25, y0 + 36);
  c.lineTo(cx + 20, y0 + 54);
  c.lineTo(cx + 26, y0 + 70);
  c.lineTo(cx + 14, y0 + 84);
  c.closePath();
  c.fillStyle = iceCyanArmorGrad(cx + 14, cx + 26);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.88)';
  c.lineWidth = 0.86;
  c.stroke();

  // Receiver diamond/shield crest with glowing lightning bolt (`cx + 1, y0 + 88`, matching STORM CALLER image!)
  c.beginPath();
  c.moveTo(cx + 1, y0 + 72);
  c.lineTo(cx + 17, y0 + 86);
  c.lineTo(cx + 1, y0 + 104);
  c.lineTo(cx - 15, y0 + 86);
  c.closePath();
  c.fillStyle = iceCyanArmorGrad(cx - 15, cx + 17);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.9)';
  c.lineWidth = 0.88;
  c.stroke();
  // Inner deep-blue shield
  c.beginPath();
  c.moveTo(cx + 1, y0 + 76);
  c.lineTo(cx + 12, y0 + 86);
  c.lineTo(cx + 1, y0 + 99);
  c.lineTo(cx - 10, y0 + 86);
  c.closePath();
  c.fillStyle = '#0c4a6e';
  c.fill();
  // Lightning bolt inside receiver shield
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.moveTo(cx + 2.5, y0 + 78);
  c.lineTo(cx - 2.5, y0 + 87);
  c.lineTo(cx + 1.5, y0 + 87);
  c.lineTo(cx - 0.5, y0 + 96);
  c.lineTo(cx + 5.5, y0 + 85);
  c.lineTo(cx + 1.5, y0 + 85);
  c.closePath();
  c.fill();

  // ══════════════════ 4. V-NOTCHED ICE-CYAN MUZZLE CROWN, DIAMOND CORE & CRACKLING LIGHTNING ARCS (`y0 - 14 .. y0 + 20`) ══════════════════
  // Deep V-notched angular ice-cyan muzzle crown (`cx - 18 .. cx + 18, y0 + 3 .. y0 + 20`)
  c.beginPath();
  c.moveTo(cx - 18, y0 + 18);
  c.lineTo(cx - 15, y0 + 3);
  c.lineTo(cx, y0 + 12);
  c.lineTo(cx + 15, y0 + 3);
  c.lineTo(cx + 18, y0 + 18);
  c.closePath();
  c.fillStyle = iceCyanArmorGrad(cx - 18, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Radiant diamond-shaped cyan crystal muzzle core (`cx, y0 + 2`)
  c.save();
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 18 * pulse;
  c.beginPath();
  c.moveTo(cx, y0 - 7);
  c.lineTo(cx + 9.5, y0 + 2);
  c.lineTo(cx, y0 + 11);
  c.lineTo(cx - 9.5, y0 + 2);
  c.closePath();
  c.fillStyle = boltGlowGrad(cx - 9.5, cx + 9.5);
  c.fill();

  // Crackling electric lightning arcs shooting from the muzzle (matching STORM CALLER image!)
  c.strokeStyle = '#e0f2fe';
  c.lineWidth = 1.6;
  jag(c, cx, y0 - 5, cx - 16, y0 - 15, 2.8, 4);
  jag(c, cx, y0 - 5, cx + 16, y0 - 14, 2.8, 4);
  if (Math.sin(t * 11) > -0.2) {
    c.strokeStyle = '#7dd3fc';
    c.lineWidth = 1.3;
    jag(c, cx - 12, y0 + 7, cx - 24, y0 - 3, 2.2, 3);
    jag(c, cx + 12, y0 + 7, cx + 24, y0 - 3, 2.2, 3);
  }
  c.restore();
}

// ================================================================ dispatch
export function drawGunExtra2(c: C, id: WeaponId, cx: number, y0: number, t: number, ready: boolean) {
  switch (id) {
    case 'honey': honey(c, cx, y0, t); break;
    case 'coconut': coconut(c, cx, y0, t, ready); break;
    case 'angklung': angklung(c, cx, y0, t); break;
    case 'bee': beeGun(c, cx, y0, t); break;
    case 'yoyo': yoyoGun(c, cx, y0, t, ready); break;
    case 'sakura': sakuraGun(c, cx, y0, t); break;
    case 'acid': acidGun(c, cx, y0, t); break;
    case 'keris': kerisGun(c, cx, y0, t, ready); break;
    case 'firework': fireworkGun(c, cx, y0, t, ready); break;
    case 'anchor': anchorGun(c, cx, y0, t, ready); break;
    case 'shark': sharkGun(c, cx, y0, t); break;
    case 'ghost': ghostGun(c, cx, y0, t); break;
    case 'ufo': ufoGun(c, cx, y0, t); break;
    case 'rainbow': rainbowGun(c, cx, y0, t); break;
    case 'meteor': meteorGun(c, cx, y0, t); break;
    case 'diamond': diamondGun(c, cx, y0, t); break;
    case 'moonbeam': moonbeamGun(c, cx, y0, t); break;
    case 'storm': stormGun(c, cx, y0, t); break;
    default: {
      void inkGun;
      drawGunExtra3(c, id, cx, y0, t, ready);
      break;
    }
  }
}

export type Flash2 = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number } | { k: 'puff'; col: string; n: number };
export const FLASH2: Partial<Record<WeaponId, Flash2>> = {
  honey: { k: 'puff', col: 'rgba(251,191,36,', n: 8 }, coconut: { k: 'puff', col: 'rgba(236,252,203,', n: 10 },
  angklung: { k: 'energy', rgb: '253,230,138', r: 34 }, bee: { k: 'puff', col: 'rgba(250,204,21,', n: 5 },
  yoyo: { k: 'puff', col: 'rgba(255,200,200,', n: 4 },
  sakura: { k: 'puff', col: 'rgba(251,207,232,', n: 8 }, acid: { k: 'puff', col: 'rgba(190,242,100,', n: 8 },
  keris: { k: 'energy', rgb: '255,215,120', r: 46 },
  firework: { k: 'fire', s: 1.2 }, anchor: { k: 'fire', s: 1.5 }, shark: { k: 'puff', col: 'rgba(186,230,253,', n: 12 },
  ghost: { k: 'energy', rgb: '199,210,254', r: 40 }, ufo: { k: 'energy', rgb: '134,239,172', r: 40 },
  rainbow: { k: 'energy', rgb: '255,190,230', r: 48 }, meteor: { k: 'fire', s: 2 }, diamond: { k: 'energy', rgb: '165,243,252', r: 36 },
  moonbeam: { k: 'energy', rgb: '196,181,253', r: 44 }, storm: { k: 'energy', rgb: '147,197,253', r: 50 },
};
