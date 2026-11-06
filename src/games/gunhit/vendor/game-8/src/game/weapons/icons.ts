import type { Game } from '../engine';
import type { Weapon, WeaponState } from '../types';
import {
  GOLD, TAU, add, clamp, drawGlow, easeOut, metalBox, norm, pick, rand, rgba, rr, vgrad,
} from '../util';
import { ironWeapon, tripodWeapon } from './scifi';
import { drawBusterPellet } from './busterPellet';

type C = CanvasRenderingContext2D;

/* ================================================================================= */
/*  1. TRIPOD — Martian war machine (War of the Worlds): cobra head with green eye      */
/* ================================================================================= */
function drawTripod2(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, ch = s.chan;
  const G = '#37ff7a';
  const BR = ['#f8d99a', '#cf9548', '#845628', '#2e1d0c'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(rand(-1, 1) * ch * 0.9, rand(-1, 1) * ch * 0.9);

  /* hull dome with glowing glyph panels */
  ctx.beginPath();
  ctx.moveTo(-10, -96); ctx.bezierCurveTo(60, -108, 118, -76, 124, -22); ctx.lineTo(124, 22);
  ctx.bezierCurveTo(118, 76, 60, 108, -10, 96); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -100, 100, ['#e9bd78', '#a87638', '#5e3c1a', '#24160a']);
  ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(30,16,4,.55)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-40, 0, 60 + i * 16, -1.1, 1.1); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,230,170,.25)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-40, -1.5, 60 + i * 16, -1.1, 1.1); ctx.stroke(); }
  add(ctx);
  for (let i = -3; i <= 3; i++) {
    const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 3 - i * 0.7));
    ctx.fillStyle = rgba(G, a * 0.85); rr(ctx, 78 + Math.abs(i) * -4, i * 22 - 4, 14, 8, 2); ctx.fill();
    drawGlow(ctx, 85 - Math.abs(i) * 4, i * 22, 14, G, a * 0.5);
  }
  norm(ctx); ctx.restore();
  ctx.strokeStyle = 'rgba(20,10,2,.85)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-10, -96); ctx.bezierCurveTo(60, -108, 118, -76, 124, -22); ctx.lineTo(124, 22); ctx.bezierCurveTo(118, 76, 60, 108, -10, 96); ctx.stroke();
  for (const [x, y] of [[100, -52], [100, 52], [60, -80], [60, 80]]) { ctx.fillStyle = '#ffe9b0'; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, TAU); ctx.fill(); }

  /* swan neck: S-curve made of articulated bronze rings */
  const P = [[96, 10], [172, 10], [184, -34], [262, -34]];
  const bz = (u: number) => {
    const m = 1 - u;
    return [
      m * m * m * P[0][0] + 3 * m * m * u * P[1][0] + 3 * m * u * u * P[2][0] + u * u * u * P[3][0],
      m * m * m * P[0][1] + 3 * m * m * u * P[1][1] + 3 * m * u * u * P[2][1] + u * u * u * P[3][1],
    ];
  };
  const bd = (u: number) => {
    const m = 1 - u;
    return [
      3 * m * m * (P[1][0] - P[0][0]) + 6 * m * u * (P[2][0] - P[1][0]) + 3 * u * u * (P[3][0] - P[2][0]),
      3 * m * m * (P[1][1] - P[0][1]) + 6 * m * u * (P[2][1] - P[1][1]) + 3 * u * u * (P[3][1] - P[2][1]),
    ];
  };
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]);
  ctx.strokeStyle = '#120b04'; ctx.lineWidth = 30; ctx.stroke();
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const [x, y] = bz(u), [dx, dy] = bd(u);
    const w = 27 - 12 * u;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx));
    ctx.fillStyle = vgrad(ctx, -w, w, BR);
    rr(ctx, -7.5, -w, 15, w * 2, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(20,10,2,.85)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,200,.35)'; ctx.fillRect(-5, -w + 3, 3, w * 2 - 6);
    add(ctx); ctx.fillStyle = rgba(G, 0.18 + 0.3 * ch); ctx.fillRect(2, -w * 0.5, 2.4, w); norm(ctx);
    ctx.restore();
  }

  /* hood fin sweeping back from the head */
  ctx.beginPath();
  ctx.moveTo(300, -78); ctx.bezierCurveTo(260, -112, 218, -134, 172, -140);
  ctx.bezierCurveTo(196, -112, 212, -88, 226, -56); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -140, -56, ['#7a4f22', '#c18a44', '#e6b568']); ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,2,.85)'; ctx.lineWidth = 1.8; ctx.stroke();
  ctx.strokeStyle = 'rgba(30,16,4,.55)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(296 - i * 14, -76 + i * 3); ctx.quadraticCurveTo(250 - i * 18, -104 + i * 4, 186 + i * 8, -132 + i * 6); ctx.stroke(); }
  add(ctx); ctx.strokeStyle = rgba(G, 0.25 + 0.4 * ch); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(300, -78); ctx.bezierCurveTo(260, -112, 218, -134, 172, -140); ctx.stroke(); norm(ctx);

  /* head: smooth hooded cobra wedge */
  const head = () => {
    ctx.beginPath();
    ctx.moveTo(256, -62); ctx.bezierCurveTo(282, -84, 332, -88, 366, -68);
    ctx.bezierCurveTo(392, -56, 410, -46, 414, -34); ctx.bezierCurveTo(410, -22, 392, -12, 366, -2);
    ctx.bezierCurveTo(332, 14, 282, 12, 256, -6); ctx.bezierCurveTo(246, -20, 246, -48, 256, -62); ctx.closePath();
  };
  head();
  ctx.fillStyle = vgrad(ctx, -88, 14, ['#ffe6b0', '#d9a25a', '#9a6630', '#3a2410']);
  ctx.fill();
  ctx.save(); head(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  ctx.beginPath(); ctx.ellipse(320, -64, 62, 9, -0.12, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(30,16,4,.5)'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.moveTo(262, -34); ctx.lineTo(410, -34); ctx.moveTo(296, -80); ctx.quadraticCurveTo(290, -34, 296, 10); ctx.moveTo(334, -86); ctx.quadraticCurveTo(328, -34, 334, 14); ctx.stroke();
  ctx.fillStyle = vgrad(ctx, -20, 14, ['rgba(0,0,0,0)', 'rgba(0,0,0,.4)']); ctx.fillRect(240, -20, 190, 40);
  ctx.restore();
  head(); ctx.strokeStyle = 'rgba(20,10,2,.9)'; ctx.lineWidth = 2.4; ctx.stroke();

  // blinking lights
  for (const [x, y, c, ph] of [[296, -72, '#ff3a3a', 0], [308, -74, '#37ff7a', 2], [320, -74, '#3a8cff', 4]] as [number, number, string, number][]) {
    const on = 0.35 + 0.65 * (Math.sin(t * 5 + ph) > 0 ? 1 : 0.2);
    ctx.fillStyle = '#120b04'; ctx.beginPath(); ctx.arc(x, y, 4.2, 0, TAU); ctx.fill();
    add(ctx); drawGlow(ctx, x, y, 9, c, on); norm(ctx);
  }

  /* the eye: recessed lens, iris rings, glowing green */
  const ex = 366, ey = -34;
  ctx.fillStyle = '#0d0803'; ctx.beginPath(); ctx.arc(ex, ey, 21, 0, TAU); ctx.fill();
  ctx.strokeStyle = vgrad(ctx, ey - 22, ey + 22, BR); ctx.lineWidth = 4; ctx.stroke();
  const eg = ctx.createRadialGradient(ex - 3, ey - 3, 1, ex, ey, 17);
  eg.addColorStop(0, '#ffffff'); eg.addColorStop(0.3, '#b8ffd0'); eg.addColorStop(0.65, '#27d25a'); eg.addColorStop(1, '#064a1e');
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, 16.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(4,60,24,.8)'; ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(ex, ey, 6 + i * 4.4, 0, TAU); ctx.stroke(); }
  ctx.fillStyle = '#031a0a'; ctx.beginPath(); ctx.ellipse(ex, ey, 2.2, 8.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(ex - 6, ey - 7, 4.5, 2.6, -0.7, 0, TAU); ctx.fill();
  add(ctx);
  const pulse = 0.7 + 0.3 * Math.sin(t * 7);
  drawGlow(ctx, ex, ey, 36 + 46 * ch, G, (0.4 + 0.55 * ch) * pulse);
  drawGlow(ctx, ex, ey, 12 + 10 * ch, '#ffffff', 0.5 + 0.4 * ch);
  norm(ctx);

  /* heat-ray emitter nozzle at the snout tip */
  ctx.beginPath(); ctx.moveTo(408, -46); ctx.lineTo(430, -42); ctx.lineTo(430, -26); ctx.lineTo(408, -22); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -46, -22, ['#f2c880', '#a8742e', '#4a2e12']); ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,2,.9)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#031a0a'; ctx.beginPath(); ctx.ellipse(430, -34, 4, 8, 0, 0, TAU); ctx.fill();
  add(ctx);
  drawGlow(ctx, 432, -34, 14 + 30 * ch, G, 0.5 + 0.5 * ch);
  drawGlow(ctx, 432, -34, 5 + 5 * ch, '#ffffff', 0.7 + 0.3 * ch);
  norm(ctx);

  /* two thin sensor tendrils under the head */
  add(ctx);
  for (const sg of [0, 1]) {
    ctx.beginPath();
    for (let j = 0; j <= 16; j++) {
      const x = 300 - j * 4.6, y = 6 + j * 3.2 + Math.sin(j * 0.5 + t * 3 + sg * 2) * (2 + j * 0.5) + sg * 10;
      j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,214,140,.8)'; ctx.lineWidth = 1.6; ctx.stroke();
  }
  norm(ctx);
  ctx.restore();
}

export const tripodWeapon2: Weapon = {
  ...tripodWeapon,
  name: 'Tripod Heat-Ray', sub: 'Mesin Perang Mars · War of the Worlds', isNew: true,
  desc: 'Kepala kobra perunggu bermata hijau di leher berlapis cincin. Sinar panas berdenyut cincin hijau menguapkan kayu jadi abu yang melayang, kawah kecil menyala di bekasnya.',
  hint: 'Tahan = sinar panas',
  muzzle: 432, muzzleY: -34, scale: 1,
  draw: drawTripod2,
};

/* ================================================================================= */
/*  2. IRON MAN — repulsor gauntlet with plated forearm, fins and a 3/4 palm            */
/* ================================================================================= */
function drawIron2(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, ch = s.chan;
  // DEADBLAST — repulsor cannon. The reference silhouette rendered premium: a
  // deep red outer shell under a bright inner shell, gold rim light on every
  // edge, angular gold armour bands, a wide recessed energy core with
  // travelling pulses, bezelled side pods and a bright crown emitter.
  const RED = ['#ff8f86', '#e8263a', '#a80f22', '#5c0714'];
  const DEEP = ['#9e101e', '#6e0716', '#3e040c', '#1e0206'];
  const RING = ['#fff6c2', '#f0bf4e', '#a9701a', '#5e3a08'];
  const OUT = 'rgba(26,0,5,.95)';
  const GLINE = 'rgba(255,222,140,.95)';
  const CY = '#8fe8ff';
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(rand(-1, 1) * ch * 1.1, rand(-1, 1) * ch * 1.1);

  /* ── silhouette: pointed crown, flaring shoulders, pointed base ────────── */
  const plate = () => {
    ctx.beginPath();
    ctx.moveTo(272, 0);
    ctx.bezierCurveTo(250, -16, 222, -36, 194, -46);
    ctx.bezierCurveTo(160, -58, 108, -58, 66, -44);
    ctx.bezierCurveTo(30, -32, -6, -18, -28, 0);
    ctx.bezierCurveTo(-6, 18, 30, 32, 66, 44);
    ctx.bezierCurveTo(108, 58, 160, 58, 194, 46);
    ctx.bezierCurveTo(222, 36, 250, 16, 272, 0);
    ctx.closePath();
  };

  /* collar behind the base */
  ctx.fillStyle = vgrad(ctx, -20, 20, RING);
  rr(ctx, -44, -20, 21, 40, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(80,40,0,.85)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#2a0a10'; rr(ctx, -44, -12, 8, 24, 3); ctx.fill();

  /* deep outer shell */
  plate();
  ctx.fillStyle = vgrad(ctx, -58, 58, DEEP); ctx.fill();
  ctx.save();
  plate(); ctx.clip();

  /* bright inner shell, inset from the silhouette */
  ctx.beginPath();
  ctx.moveTo(266, 0);
  ctx.bezierCurveTo(246, -14, 220, -32, 194, -41);
  ctx.bezierCurveTo(160, -52, 110, -52, 68, -39);
  ctx.bezierCurveTo(32, -28, -4, -15, -22, 0);
  ctx.bezierCurveTo(-4, 15, 32, 28, 68, 39);
  ctx.bezierCurveTo(110, 52, 160, 52, 194, 41);
  ctx.bezierCurveTo(220, 32, 246, 14, 266, 0);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -52, 52, RED); ctx.fill();

  /* dark seam just inside the rim */
  ctx.strokeStyle = 'rgba(26,0,5,.7)'; ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(264, 0);
  ctx.bezierCurveTo(245, -12, 219, -30, 193, -39);
  ctx.bezierCurveTo(159, -50, 109, -50, 67, -37);
  ctx.bezierCurveTo(31, -26, -4, -13, -22, 0);
  ctx.bezierCurveTo(-4, 13, 31, 26, 67, 37);
  ctx.bezierCurveTo(109, 50, 159, 50, 193, 39);
  ctx.bezierCurveTo(219, 30, 245, 12, 264, 0);
  ctx.stroke();

  /* gold rim light along the whole outer edge */
  ctx.strokeStyle = GLINE; ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(270, 0);
  ctx.bezierCurveTo(249, -15, 221, -35, 193, -45);
  ctx.bezierCurveTo(159, -57, 107, -57, 65, -43);
  ctx.bezierCurveTo(29, -31, -6, -17, -27, 0);
  ctx.bezierCurveTo(-6, 17, 29, 31, 65, 43);
  ctx.bezierCurveTo(107, 57, 159, 57, 193, 45);
  ctx.bezierCurveTo(221, 35, 249, 15, 270, 0);
  ctx.stroke();
  /* specular highlight just under the rim */
  ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(258, -6);
  ctx.bezierCurveTo(232, -22, 206, -34, 190, -38);
  ctx.bezierCurveTo(158, -48, 112, -48, 74, -36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(258, 6);
  ctx.bezierCurveTo(232, 22, 206, 34, 190, 38);
  ctx.bezierCurveTo(158, 48, 112, 48, 74, 36);
  ctx.stroke();

  /* angular gold armour bands along the flanks */
  for (const sg of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(188, sg * 34);
    ctx.bezierCurveTo(212, sg * 27, 234, sg * 19, 250, sg * 10);
    ctx.lineTo(246, sg * 2);
    ctx.bezierCurveTo(228, sg * 12, 206, sg * 19, 184, sg * 26);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, sg * 2, sg * 34, RING); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,0,.6)'; ctx.lineWidth = 1.1; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(70, sg * 34);
    ctx.bezierCurveTo(102, sg * 45, 138, sg * 47, 170, sg * 39);
    ctx.lineTo(168, sg * 31);
    ctx.bezierCurveTo(138, sg * 39, 102, sg * 37, 72, sg * 26);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, sg * 26, sg * 47, RING); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,0,.6)'; ctx.lineWidth = 1.1; ctx.stroke();
  }

  /* plate seams */
  ctx.strokeStyle = 'rgba(26,0,5,.5)'; ctx.lineWidth = 1.5;
  for (const sg of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(80, sg * 20); ctx.lineTo(116, sg * 34); ctx.lineTo(154, sg * 38); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(122, sg * 8); ctx.lineTo(158, sg * 24); ctx.lineTo(192, sg * 26); ctx.stroke();
  }

  /* vent slats */
  for (const sg of [-1, 1]) {
    ctx.fillStyle = 'rgba(18,0,4,.65)';
    for (let i = 0; i < 4; i++) {
      ctx.save(); ctx.translate(76 + i * 12, sg * 24); ctx.rotate(sg * -0.45);
      rr(ctx, -4, -1.7, 10, 3.4, 1.7); ctx.fill(); ctx.restore();
    }
  }

  /* gold base cap at the tail */
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.lineTo(-6, -21);
  ctx.lineTo(20, -18);
  ctx.lineTo(20, 18);
  ctx.lineTo(-6, 21);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -21, 21, RING); ctx.fill();
  ctx.strokeStyle = 'rgba(80,40,0,.7)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = 'rgba(18,0,4,.8)'; rr(ctx, -18, -4, 16, 8, 3.5); ctx.fill();
  add(ctx); drawGlow(ctx, -10, 0, 8 + 12 * ch, CY, 0.22 + 0.3 * ch); norm(ctx);

  /* ── recessed energy core ──────────────────────────────────────────────── */
  const coreChan = () => {
    ctx.beginPath();
    ctx.moveTo(258, -17);
    ctx.bezierCurveTo(214, -22, 140, -23, 66, -18);
    ctx.bezierCurveTo(20, -14, -8, -8, -24, 0);
    ctx.bezierCurveTo(-8, 8, 20, 14, 66, 18);
    ctx.bezierCurveTo(140, 23, 214, 22, 258, 17);
    ctx.closePath();
  };
  coreChan();
  ctx.fillStyle = '#03101a'; ctx.fill();
  for (const sg of [-1, 1]) {
    ctx.strokeStyle = GLINE; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(258, sg * 13);
    ctx.bezierCurveTo(214, sg * 18, 140, sg * 19, 66, sg * 14);
    ctx.bezierCurveTo(20, sg * 10, -8, sg * 6, -24, 0);
    ctx.stroke();
  }
  ctx.fillStyle = '#05202f'; rr(ctx, 58, -7, 192, 14, 7); ctx.fill();
  add(ctx);
  const core = ctx.createLinearGradient(58, 0, 250, 0);
  core.addColorStop(0, rgba('#1c6bff', 0.5));
  core.addColorStop(0.45, rgba(CY, 0.8 + 0.2 * ch));
  core.addColorStop(1, `rgba(255,255,255,${0.88 + 0.12 * ch})`);
  ctx.fillStyle = core; rr(ctx, 60, -4.6, 188, 9.2, 4.6); ctx.fill();
  for (let i = 0; i < 3; i++) drawGlow(ctx, 60 + (((t * 1.1 + i / 3) % 1) * 188), 0, 14, '#ffffff', 0.85);
  drawGlow(ctx, 150, 0, 62, CY, 0.18 + 0.24 * ch);
  norm(ctx);

  /* ── side emitter pods with gold bezels ────────────────────────────────── */
  for (const sg of [-1, 1]) {
    ctx.save();
    ctx.translate(120, sg * 38);
    ctx.rotate(sg * 0.3);
    ctx.fillStyle = vgrad(ctx, -18, 18, RING);
    rr(ctx, -14, -18, 28, 36, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,0,.85)'; ctx.lineWidth = 1.3; ctx.stroke();
    ctx.fillStyle = '#03101a'; rr(ctx, -8.5, -11.5, 17, 23, 6.5); ctx.fill();
    add(ctx);
    const pg = ctx.createLinearGradient(0, -11.5, 0, 11.5);
    pg.addColorStop(0, rgba('#2a7bff', 0.5 + 0.3 * ch));
    pg.addColorStop(1, rgba(CY, 0.82 + 0.18 * ch));
    ctx.fillStyle = pg; rr(ctx, -8.5, -11.5, 17, 23, 6.5); ctx.fill();
    norm(ctx);
    ctx.restore();
  }

  /* ── gold crown carrying the wide emitter ──────────────────────────────── */
  ctx.beginPath();
  ctx.moveTo(272, 0);
  ctx.bezierCurveTo(258, -14, 242, -22, 228, -22);
  ctx.lineTo(228, 22);
  ctx.bezierCurveTo(242, 22, 258, 14, 272, 0);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -22, 22, RING); ctx.fill();
  ctx.strokeStyle = 'rgba(80,40,0,.9)'; ctx.lineWidth = 1.7; ctx.stroke();
  ctx.strokeStyle = GLINE; ctx.lineWidth = 1.3;
  for (const o of [-11, 0, 11]) { ctx.beginPath(); ctx.moveTo(268, o * 0.4); ctx.lineTo(232, o); ctx.stroke(); }
  const lens = () => {
    ctx.beginPath();
    ctx.moveTo(270, 0);
    ctx.bezierCurveTo(256, -11, 244, -16, 234, -16);
    ctx.lineTo(234, 16);
    ctx.bezierCurveTo(244, 16, 256, 11, 270, 0);
    ctx.closePath();
  };
  lens();
  ctx.fillStyle = '#03101a'; ctx.fill();
  add(ctx);
  const eg = ctx.createLinearGradient(234, 0, 270, 0);
  eg.addColorStop(0, rgba('#2a7bff', 0.5 + 0.3 * ch));
  eg.addColorStop(1, rgba(CY, 0.9 + 0.1 * ch));
  ctx.fillStyle = eg; lens(); ctx.fill();
  norm(ctx);
  ctx.restore(); // end plate clip

  /* side pod glow, outside the clip so it blooms over the edge */
  add(ctx);
  for (const sg of [-1, 1]) drawGlow(ctx, 120, sg * 38, 16 + 26 * ch, CY, 0.28 + 0.4 * ch);
  norm(ctx);

  /* ── muzzle bloom at the crown ─────────────────────────────────────────── */
  add(ctx);
  const base = 0.5 + 0.15 * Math.sin(t * 4) + 0.5 * ch;
  const rg = ctx.createRadialGradient(258, 0, 0, 258, 0, 24);
  rg.addColorStop(0, 'rgba(255,255,255,1)');
  rg.addColorStop(0.4, `rgba(143,232,255,${Math.min(1, base)})`);
  rg.addColorStop(1, 'rgba(60,160,255,0)');
  ctx.save(); ctx.translate(258, 0); ctx.scale(0.55, 1); ctx.translate(-258, 0);
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(258, 0, 24, 0, TAU); ctx.fill(); ctx.restore();
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.translate(258, 0); ctx.scale(0.5, 1); ctx.rotate(t * (2 + i) + i * 2);
    ctx.strokeStyle = rgba('#d8f6ff', 0.55 + 0.35 * ch); ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(0, 0, 8 + i * 6, 0, 2.2); ctx.stroke();
    ctx.restore();
  }
  drawGlow(ctx, 260, 0, 30 + 56 * ch, CY, 0.45 + 0.5 * ch);
  drawGlow(ctx, 260, 0, 9 + 8 * ch, '#ffffff', 0.6 + 0.4 * ch);
  norm(ctx);

  ctx.restore();
}

export const ironWeapon2: Weapon = {
  ...ironWeapon,
  name: 'Deadblast Repulsor', sub: 'Gauntlet Repulsor Laser', isNew: true,
  desc: 'Gauntlet cannon faceted merah-emas: shell merah tua di bawah shell merah terang, rim light emas di setiap tepi, band armour emas angular, core energy lebar berenda dengan pulsa berjalan, pod emitter berbezell emas, vent slat, dan emitter mahkota lebar sebagai muara.',
  muzzle: 278, muzzleY: 0,
  draw: drawIron2,
};

/* ================================================================================= */
/*  3. XENOMORPH ACID SPITTER — molecular acid blood that eats through anything         */
/* ================================================================================= */
const ACID = '#b6ff2a';

function drawXeno(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready, ft = s.fireT;
  const open = clamp(1 - ft * 3);
  const ie = ft < 0.06 ? ft / 0.06 : ft < 0.5 ? 1 - ((ft - 0.06) / 0.44) * 0.78 : 0.22;
  const jaw = 0.12 + 0.34 * open + Math.sin(t * 1.9) * 0.012;
  const cj = Math.cos(jaw), sj = Math.sin(jaw);
  const BLK = ['#34485a', '#101a24', '#04070a', '#0b141c'];
  const lipY = (x: number) => (x >= 300 ? 4 + (358 - x) * 0.138 : 12 + (300 - x) * 0.06);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(rand(-1, 1) * open * 1.4, rand(-1, 1) * open * 1.4);

  /* dorsal pipes + ribbed neck */
  for (const [y0, y1, w] of [[-58, -96, 10], [-46, -66, 8]] as number[][]) {
    ctx.beginPath(); ctx.moveTo(92, y0); ctx.bezierCurveTo(60, y0 - 10, 20, y1, -20, y1 + 4);
    ctx.strokeStyle = '#05080c'; ctx.lineWidth = w + 4; ctx.stroke();
    ctx.strokeStyle = '#1d2a35'; ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = 'rgba(160,200,230,.4)'; ctx.lineWidth = 2; ctx.translate(0, -2); ctx.stroke(); ctx.translate(0, 2);
  }
  ctx.beginPath(); ctx.moveTo(-20, -44); ctx.lineTo(60, -50); ctx.lineTo(58, 44); ctx.lineTo(-20, 52); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -50, 52, BLK); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(120,170,210,.28)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-16 + i * 12, -46); ctx.quadraticCurveTo(-8 + i * 12, 0, -16 + i * 12, 50); ctx.stroke(); }

  /* mouth cavity */
  const tipx = 170 + 176 * cj, tipy = 24 + 176 * sj;
  const cav = ctx.createLinearGradient(190, 0, 360, 0);
  cav.addColorStop(0, '#010201'); cav.addColorStop(0.6, `rgb(${10 + 30 * open | 0},${24 + 60 * open | 0},6)`); cav.addColorStop(1, `rgb(${40 + 60 * open | 0},${90 + 120 * open | 0},14)`);
  ctx.fillStyle = cav;
  ctx.beginPath(); ctx.moveTo(190, 16); ctx.lineTo(358, 4); ctx.lineTo(tipx, tipy); ctx.lineTo(170, 24); ctx.closePath(); ctx.fill();
  add(ctx); drawGlow(ctx, 290, 22 + jaw * 40, 50 + 40 * open, ACID, 0.12 + 0.5 * open + 0.15 * rd); norm(ctx);

  /* lower jaw */
  ctx.save();
  ctx.translate(170, 24); ctx.rotate(jaw);
  ctx.beginPath();
  ctx.moveTo(-14, -2); ctx.lineTo(110, -8); ctx.bezierCurveTo(140, -8, 166, -4, 172, 4); ctx.bezierCurveTo(166, 14, 140, 16, 112, 16); ctx.lineTo(-8, 24); ctx.bezierCurveTo(-20, 18, -20, 6, -14, -2); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -8, 24, ['#2c3e4e', '#0c141c', '#030507']); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(150,200,240,.4)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(0, 18); ctx.quadraticCurveTo(80, 12, 150, 12); ctx.stroke();
  for (const [x, h] of [[44, 8], [66, 10], [88, 12], [108, 13], [128, 12], [146, 10]]) {
    ctx.beginPath(); ctx.moveTo(x - 4.5, -7); ctx.lineTo(x + 1, -7 - h); ctx.lineTo(x + 4.5, -7); ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -7 - h, -7, ['#ffffff', '#b4bcc4', '#6a737c']); ctx.fill();
    ctx.strokeStyle = 'rgba(20,24,28,.8)'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  ctx.restore();

  /* inner jaw (pharyngeal) that thrusts out */
  const yJ = 22, L = 40 + 72 * ie, x0 = 236, x1 = x0 + L;
  ctx.fillStyle = vgrad(ctx, yJ - 11, yJ + 11, ['#7a8794', '#232d36', '#07090c', '#1a232b']);
  rr(ctx, x0, yJ - 11, L - 6, 22, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(190,220,240,.4)'; ctx.lineWidth = 1;
  for (let x = x0 + 10; x < x1 - 14; x += 9) { ctx.beginPath(); ctx.moveTo(x, yJ - 10); ctx.lineTo(x, yJ + 10); ctx.stroke(); }
  ctx.fillStyle = vgrad(ctx, yJ - 14, yJ + 14, ['#cfd8e0', '#6c7782', '#222a31']);
  ctx.beginPath(); ctx.moveTo(x1 - 22, yJ - 11); ctx.lineTo(x1 - 2, yJ - 7); ctx.lineTo(x1, yJ + 7); ctx.lineTo(x1 - 22, yJ + 11); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.stroke();
  for (const sg of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bx = x1 - 20 + i * 6;
      ctx.beginPath(); ctx.moveTo(bx - 2.4, yJ + sg * 10); ctx.lineTo(bx + 5, yJ + sg * 17); ctx.lineTo(bx + 2.6, yJ + sg * 9); ctx.closePath();
      ctx.fillStyle = '#e8eef3'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 0.7; ctx.stroke();
    }
  }
  ctx.fillStyle = '#020503'; ctx.beginPath(); ctx.ellipse(x1 + 1, yJ, 2.6, 5.4, 0, 0, TAU); ctx.fill();
  add(ctx);
  drawGlow(ctx, x1 + 3, yJ, 12 + 26 * open + 8 * rd, ACID, 0.55 + 0.4 * open);
  drawGlow(ctx, x1 + 3, yJ, 5, '#ffffff', 0.6 + 0.4 * open);
  norm(ctx);

  /* acid strings between the open jaws */
  add(ctx);
  for (const xu of [236, 262, 288, 314]) {
    const ya = lipY(xu) + 8;
    const ux = xu, jx = 170 + (xu - 170) * cj - (-9) * sj * 0, jy = 24 + (xu - 170) * sj - 8;
    const mx = (ux + jx) / 2 - 8 - 12 * open, my = (ya + jy) / 2;
    const al = clamp(open * 1.3 + 0.1) * 0.7;
    ctx.beginPath(); ctx.moveTo(ux, ya); ctx.quadraticCurveTo(mx, my, jx, jy);
    ctx.strokeStyle = rgba(ACID, al * 0.4); ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = rgba('#f6ffb0', al); ctx.lineWidth = 1.2; ctx.stroke();
  }
  norm(ctx);

  /* cranium: long glossy dome */
  const head = () => {
    ctx.beginPath();
    ctx.moveTo(30, 24); ctx.bezierCurveTo(8, -10, 20, -58, 90, -66);
    ctx.bezierCurveTo(150, -72, 210, -62, 252, -40); ctx.bezierCurveTo(280, -28, 312, -24, 346, -16);
    ctx.bezierCurveTo(362, -12, 366, -2, 358, 4); ctx.lineTo(300, 12); ctx.lineTo(200, 18); ctx.lineTo(150, 34);
    ctx.bezierCurveTo(110, 48, 60, 48, 30, 24); ctx.closePath();
  };
  head();
  ctx.fillStyle = vgrad(ctx, -70, 50, ['#3d5468', '#142029', '#05080c', '#0d1822']); ctx.fill();
  ctx.save(); head(); ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1.3;
  for (let i = 0; i < 8; i++) { const x = 50 + i * 16; ctx.beginPath(); ctx.moveTo(x, -68); ctx.quadraticCurveTo(x + 12, -20, x - 6, 40); ctx.stroke(); }
  // glowing acid veins beneath the skin
  add(ctx);
  const va = 0.12 + 0.3 * rd + 0.3 * open;
  for (let k = 0; k < 3; k++) {
    ctx.beginPath(); ctx.moveTo(60, 20 + k * 6); ctx.bezierCurveTo(130, 34 - k * 4, 210, 16 + k * 3, 300 + k * 10, 6 + k * 2);
    ctx.strokeStyle = rgba(ACID, va * 0.5); ctx.lineWidth = 5 - k; ctx.stroke();
    ctx.strokeStyle = rgba('#e8ff9a', va); ctx.lineWidth = 1.3; ctx.stroke();
  }
  drawGlow(ctx, 250, 8, 80, ACID, va * 0.3);
  norm(ctx);
  // sheen
  const sh = ctx.createLinearGradient(0, -70, 0, -30);
  sh.addColorStop(0, 'rgba(190,225,255,.5)'); sh.addColorStop(1, 'rgba(190,225,255,0)');
  ctx.fillStyle = sh; ctx.beginPath(); ctx.moveTo(70, -64); ctx.bezierCurveTo(140, -70, 200, -62, 248, -40); ctx.lineTo(250, -30); ctx.bezierCurveTo(200, -50, 140, -56, 74, -50); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(160, -61, 54, 2.2, 0.1, 0, TAU); ctx.fill();
  const rim = ctx.createLinearGradient(0, 20, 0, 50);
  rim.addColorStop(0, 'rgba(90,160,255,0)'); rim.addColorStop(1, 'rgba(90,160,255,.42)');
  ctx.fillStyle = rim; ctx.fillRect(20, 20, 200, 34);
  ctx.restore();
  head(); ctx.strokeStyle = 'rgba(0,0,0,.95)'; ctx.lineWidth = 2.4; ctx.stroke();

  /* upper teeth along the lip */
  for (const [x, h] of [[214, 10], [232, 12], [250, 13], [268, 15], [286, 15], [304, 16], [322, 15], [340, 12]]) {
    const y = lipY(x);
    ctx.beginPath(); ctx.moveTo(x - 4.6, y - 1); ctx.lineTo(x + 0.6, y + h); ctx.lineTo(x + 4.6, y - 1); ctx.closePath();
    ctx.fillStyle = vgrad(ctx, y, y + h, ['#7a838c', '#cfd6dc', '#ffffff']); ctx.fill();
    ctx.strokeStyle = 'rgba(20,24,28,.8)'; ctx.lineWidth = 0.8; ctx.stroke();
    add(ctx); drawGlow(ctx, x + 0.6, y + h, 5, ACID, 0.2 + 0.4 * open); norm(ctx);
  }
  ctx.restore();
}

export function drawXenoAcidGlob(ctx: C, p: { x: number; y: number; age: number }, opacity = 1) {
  // Reusable visual only: the caller still owns the single real projectile.
  ctx.save();
  const alpha = ctx.globalAlpha * Math.max(0, Math.min(1, opacity));
  const r = 11 + Math.sin(p.age * 30) * 1.1;
  const len = 58;
  add(ctx);
  drawGlow(ctx, p.x, p.y + 8, r * 3.4, ACID, 0.42 * alpha);
  norm(ctx);
  ctx.globalAlpha = alpha;
  const sw = Math.sin(p.age * 24) * 2;
  const tg = ctx.createLinearGradient(0, p.y, 0, p.y + len);
  tg.addColorStop(0, 'rgba(160,242,44,.95)'); tg.addColorStop(1, 'rgba(110,210,30,0)');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(p.x - r * 0.8, p.y + 2); ctx.quadraticCurveTo(p.x - r * 0.3 + sw, p.y + len * 0.6, p.x, p.y + len); ctx.quadraticCurveTo(p.x + r * 0.3 + sw, p.y + len * 0.6, p.x + r * 0.8, p.y + 2); ctx.closePath(); ctx.fill();
  const bg = ctx.createRadialGradient(p.x - r * 0.3, p.y - r * 0.35, 1, p.x, p.y, r * 1.1);
  bg.addColorStop(0, '#f8ffc0'); bg.addColorStop(0.35, '#c6ff3a'); bg.addColorStop(0.75, '#5fc01c'); bg.addColorStop(1, '#1f6a0c');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 0.92, r * 1.1, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(20,80,8,.85)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.ellipse(p.x - r * 0.38, p.y - r * 0.5, r * 0.26, r * 0.14, -0.7, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(p.x + r * 0.34, p.y + r * 0.42, r * 0.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(240,255,170,.6)'; ctx.lineWidth = 1;
  for (const [bx, by, br] of [[0.1, 0.1, 0.22], [-0.25, 0.35, 0.14], [0.3, -0.1, 0.12]]) { ctx.beginPath(); ctx.arc(p.x + bx * r, p.y + by * r, br * r, 0, TAU); ctx.stroke(); }
  for (let i = 0; i < 4; i++) {
    const oy = 26 + i * 18 + Math.sin(p.age * 18 + i) * 3;
    const ox = (i % 2 ? 1 : -1) * (6 + i * 2.4);
    const dr = 3.4 - i * 0.55;
    ctx.fillStyle = '#9ae82a'; ctx.beginPath(); ctx.arc(p.x + ox, p.y + oy, dr, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,80,8,.7)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(p.x + ox - dr * 0.3, p.y + oy - dr * 0.3, dr * 0.3, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function acidSplat(g: Game, hx: number, hy: number) {
  const n = g.normalAt(hx, hy);
  const raw = Array.from({ length: 30 }, (_, i) => (i % 7 === 0 ? rand(34, 46) : rand(16, 24)));
  const radii = raw.map((_, i) => (raw[(i + 29) % 30] + raw[i] * 2 + raw[(i + 1) % 30]) / 4);
  const specks = Array.from({ length: 8 }, () => ({ a: rand(0, TAU), d: rand(8, 30), r: rand(1.4, 3.4) }));
  g.addFx({
    max: 0.75,
    draw: (ctx, k, fx) => {
      ctx.beginPath(); ctx.arc(g.cx, g.wy, g.R - 2, 0, TAU); ctx.clip();
      const gr = easeOut(Math.min(1, fx.age / 0.09));
      const a = 0.85 * (1 - clamp((fx.age - 0.1) / 0.45));
      const N = radii.length;
      const pts = radii.map((r, i) => [hx + Math.cos(n + Math.PI + (i / N) * TAU) * r * gr * 0.0 + Math.cos((i / N) * TAU) * r * gr, hy + Math.sin((i / N) * TAU) * r * gr * 0.82]);
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const p0 = pts[i], p1 = pts[(i + 1) % N];
        const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2;
        i ? ctx.quadraticCurveTo(p0[0], p0[1], mx, my) : ctx.moveTo(mx, my);
      }
      ctx.closePath();
      const fg = ctx.createRadialGradient(hx, hy, 2, hx, hy, 50 * gr + 1);
      fg.addColorStop(0, `rgba(246,255,176,${0.9 * a})`); fg.addColorStop(0.5, `rgba(160,240,44,${0.7 * a})`); fg.addColorStop(1, `rgba(70,160,12,${0.25 * a})`);
      ctx.fillStyle = fg; ctx.fill();
      ctx.strokeStyle = `rgba(40,120,12,${0.5 * a})`; ctx.lineWidth = 1.2; ctx.stroke();
      for (const sp of specks) {
        ctx.fillStyle = `rgba(255,255,255,${0.8 * a})`;
        ctx.beginPath(); ctx.arc(hx + Math.cos(sp.a) * sp.d * gr, hy + Math.sin(sp.a) * sp.d * gr * 0.8, sp.r * 0.5, 0, TAU); ctx.fill();
      }
      void k;
    },
  });
}

function molecular(g: Game, hx: number, hy: number) {
  const cells: { x: number; y: number; d: number }[] = [];
  const hr = 11;
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    if (Math.abs(q + r) > 2) continue;
    const x = hr * 1.5 * q, y = hr * Math.sqrt(3) * (r + q / 2);
    cells.push({ x, y, d: Math.hypot(x, y) });
  }
  g.addFx({
    max: 0.95, add: true,
    draw: (ctx, _k, fx) => {
      ctx.beginPath(); ctx.arc(g.cx, g.wy, g.R - 2, 0, TAU); ctx.clip();
      for (const c of cells) {
        const u = (fx.age - c.d / (hr * 4.2) * 0.3) / 0.55;
        if (u < 0 || u > 1) continue;
        const al = Math.sin(Math.PI * u);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; const px = hx + c.x + Math.cos(a) * hr * (1 - u * 0.35), py = hy + c.y + Math.sin(a) * hr * (1 - u * 0.35); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.closePath();
        ctx.fillStyle = rgba(ACID, 0.14 * al); ctx.fill();
        ctx.strokeStyle = rgba('#e8ff8a', 0.85 * al); ctx.lineWidth = 1.4; ctx.stroke();
        for (let k = 0; k < 6; k += 2) { const a = (k / 6) * TAU; drawGlow(ctx, hx + c.x + Math.cos(a) * hr * (1 - u * 0.35), hy + c.y + Math.sin(a) * hr * (1 - u * 0.35), 5, '#ffffff', 0.7 * al); }
      }
    },
  });
}

export const xenoWeapon: Weapon = {
  id: 'xenomorph', name: 'Xenomorph Acid Spitter', tag: 'Alien', sub: 'Molecular Acid Blood', accent: ACID, isNew: true,
  desc: 'Kepala biomekanik hitam berkilau dengan rahang dalam bergigi yang menjulur dan urat asam bercahaya. Meludahkan bola asam molekuler yang memercik, berdesis, dan menggerogoti kayu hingga berlubang makin lebar.',
  hint: 'Klik = ludahkan asam',
  muzzle: 358, muzzleY: 22, scale: 1.1, kick: 12, cooldown: 0.45,
  draw: drawXeno,
  update: (g, s, dt) => {
    if (Math.random() < dt * (3 + 12 * clamp(1 - s.fireT * 0.7))) {
      const p = g.lw(rand(220, 330), rand(26, 40) + 4 * Math.sin(s.t));
      g.spawn({ type: 'dot', x: p.x, y: p.y, vx: rand(-8, 8), vy: rand(20, 60), ay: 520, size: rand(1.2, 2.4), size1: 1, life: rand(0.5, 0.9), pal: ['#eaff7a', '#8be82a'] });
    }
    if (Math.random() < dt * 4) {
      const p = g.lw(rand(240, 340), 26);
      g.spawn({ type: 'smoke', x: p.x, y: p.y, vx: rand(-12, 12), vy: rand(-50, -20), size: 3, size1: rand(10, 16), life: rand(0.6, 1), alpha: 0.12, pal: ['#e8ffb8', '#7a9a3a'], drag: 1 });
    }
  },
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 26, color: ACID, core: '#f6ffb0', spikes: 4, spread: 0.7, life: 0.07 });
    g.glow(m.x, m.y, 70, ACID, 0.18);
    g.light(ACID, 0.3); g.shake(2);
    g.burst(m.x, m.y, { n: 14, type: 'dot', ang: -Math.PI / 2, spread: 0.7, speed: [100, 420], life: [0.3, 0.7], size: [1.4, 3], size1: 1, pal: ['#f6ffb0', '#b6ff2a', '#5fc01c'], ay: 600, rpal: true });
    for (let i = 0; i < 4; i++) g.spawn({ type: 'smoke', x: m.x + rand(-6, 6), y: m.y, vx: rand(-40, 40), vy: rand(-60, 10), size: 4, size1: rand(14, 22), life: rand(0.5, 0.9), alpha: 0.2, pal: ['#eaffc0', '#8aaa4a'], drag: 2 });
    g.addProj({
      x: m.x, y: m.y, vx: rand(-6, 6), vy: -1650,
      update: (gm, dt, p) => {
        if (Math.random() < dt * 50) gm.spawn({ type: 'dot', x: p.x + rand(-6, 6), y: p.y + rand(8, 40), vx: rand(-40, 40), vy: rand(30, 120), ay: 500, size: rand(1.2, 2.6), size1: 0.8, life: rand(0.3, 0.6), pal: ['#eaff7a', '#8be82a'] });
        if (Math.random() < dt * 30) gm.spawn({ type: 'glow', x: p.x, y: p.y + 12, size: rand(5, 9), size1: 0, life: 0.3, pal: ['#c6ff3a', '#2c7a0e'], alpha: 0.5 });
      },
      draw: (ctx, _g, p) => drawXenoAcidGlob(ctx, p),
      onHit: (gm, hx, hy) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 1.3, count: 1, chips: 8, kick: 0.9, shake: 3, flash: 0.3, dust: false });
        gm.addEmbed(hx, hy, { kind: 'acid', glow: ACID, size: rand(1, 1.15), cracks: 6, cool: 2.4, fire: 3.4 });
        gm.heatWheel('#9aff2a', 0.2);
        gm.light(ACID, 0.5);
        acidSplat(gm, hx, hy);
        molecular(gm, hx, hy);
        gm.ring(hx, hy, 4, 78, ACID, 0.34, 4, 0.45);
        gm.ring(hx, hy, 3, 48, '#f6ffb0', 0.22, 2, 0.45);
        gm.glow(hx, hy, 90, ACID, 0.26);
        gm.burst(hx, hy, { n: 34, type: 'dot', ang: n, spread: 1.55, speed: [120, 600], life: [0.5, 1.1], size: [1.4, 3.6], size1: 1, pal: ['#f6ffb0', '#d2ff4a', '#8be82a', '#4aa014'], ay: 760, rpal: true });
        gm.burst(hx, hy, { n: 12, ang: n, spread: 1.5, speed: [200, 640], life: [0.2, 0.5], size: [1, 2.2], pal: ['#f6ffb0', ACID], len: 0.05, ay: 400 });
        for (let i = 0; i < 9; i++) gm.spawn({ type: 'smoke', x: hx + rand(-20, 20), y: hy + rand(-8, 8), vx: rand(-50, 50), vy: rand(-110, -30), size: 5, size1: rand(22, 38), life: rand(0.9, 1.6), alpha: 0.3, pal: ['#f4ffc8', '#a8d44a', '#4a6a1a'], drag: 1.2 });
      },
    });
  },
};

/* ================================================================================= */
/*  4. MEGA BUSTER — tap = lemon pellets; hold = charge, release = big plasma shot       */
/* ================================================================================= */
const MB = ['#e2f8ff', '#7fd0ff', '#2f78ff', '#1a45c8', '#0b2370'];

function starburst(g: Game, x: number, y: number, size: number, col: string, life = 0.3, pts = 8) {
  g.addFx({
    max: life, add: true,
    draw: (ctx, k) => {
      const e = easeOut(Math.min(1, k * 2.4));
      const a = 1 - k;
      const L = size * (0.35 + 0.85 * e);
      ctx.save(); ctx.translate(x, y); ctx.rotate(k * 0.7);
      for (let i = 0; i < pts; i++) {
        const ang = (i / pts) * TAU;
        const len = i % 2 === 0 ? L : L * 0.52;
        const w = size * 0.075 * (1 - k * 0.6);
        const c = Math.cos(ang), sn = Math.sin(ang);
        ctx.fillStyle = rgba(i % 2 ? '#ffffff' : col, a);
        ctx.beginPath(); ctx.moveTo(-sn * w, c * w); ctx.lineTo(c * len, sn * len); ctx.lineTo(sn * w, -c * w); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      drawGlow(ctx, x, y, size * (0.5 + 0.5 * a), col, 0.8 * a);
      drawGlow(ctx, x, y, size * 0.3, '#ffffff', a);
    },
  });
}

function drawBuster(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t;
  const c = s.holding ? s.charge : 0;
  const lvl = c >= 1.2 ? 2 : c >= 0.45 ? 1 : 0;
  const frac = s.holding ? clamp(c / 1.6) : 0;
  const flash = lvl >= 1 && Math.floor(t * 20) % 2 === 0;
  const OUT = '#050f3a';
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save();
  ctx.translate(lvl >= 2 ? rand(-1, 1) * 1.1 : 0, lvl >= 2 ? rand(-1, 1) * 1.1 : 0);

  /* upper arm */
  ctx.beginPath(); ctx.moveTo(-6, -36); ctx.lineTo(100, -40); ctx.lineTo(100, 40); ctx.lineTo(-6, 36); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -40, 40, MB); ctx.fill();
  ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(5,15,58,.7)'; ctx.lineWidth = 2;
  for (const x of [30, 64]) { ctx.beginPath(); ctx.moveTo(x, -38); ctx.lineTo(x, 38); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(2, -33, 96, 4);
  /* wrist cuff */
  ctx.fillStyle = vgrad(ctx, -48, 48, ['#ffffff', '#c6ecff', '#6cb4f0', '#2a5ab8']);
  rr(ctx, 92, -49, 24, 98, 8); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  /* cannon body */
  ctx.beginPath(); ctx.moveTo(110, -42); ctx.lineTo(252, -50); ctx.quadraticCurveTo(296, -50, 308, -32); ctx.lineTo(308, 32); ctx.quadraticCurveTo(296, 50, 252, 50); ctx.lineTo(110, 42); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -50, 50, MB); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.moveTo(120, -38); ctx.lineTo(250, -45); ctx.quadraticCurveTo(284, -45, 296, -33); ctx.lineTo(290, -30); ctx.quadraticCurveTo(278, -38, 248, -38); ctx.lineTo(122, -32); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(5,15,58,.35)'; ctx.fillRect(116, 32, 180, 10);
  ctx.strokeStyle = 'rgba(5,15,58,.8)'; ctx.lineWidth = 2;
  for (const x of [134, 262]) { ctx.beginPath(); ctx.moveTo(x, -46); ctx.lineTo(x, 46); ctx.stroke(); }
  ctx.fillStyle = '#ffe14a'; ctx.beginPath(); ctx.moveTo(122, 22); ctx.lineTo(132, 22); ctx.lineTo(127, 32); ctx.closePath(); ctx.fill();
  for (const [x, y] of [[144, -40], [144, 40], [254, -44], [254, 44]]) { ctx.fillStyle = '#cfeeff'; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, TAU); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 1; ctx.stroke(); }
  /* charge gauge */
  ctx.fillStyle = '#031035'; rr(ctx, 142, -30, 112, 20, 5); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const on = frac * 10 > i + 0.2 || (!s.holding && s.ready >= 1 && i === Math.floor(t * 7) % 10);
    const x = 147 + i * 10.4;
    ctx.fillStyle = on ? (i < 4 ? '#5ad0ff' : i < 7 ? '#a8ecff' : '#ffffff') : '#0e2766';
    rr(ctx, x, -26, 8, 12, 2); ctx.fill();
    if (on) { add(ctx); drawGlow(ctx, x + 4, -20, 11, '#5ac8ff', 0.5); norm(ctx); }
  }
  /* barrel */
  ctx.fillStyle = vgrad(ctx, -34, 34, ['#bfeaff', '#5fb2ff', '#2a62e8', '#143a9c', '#0a2068']);
  rr(ctx, 300, -33, 48, 66, 12); ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = 'rgba(5,15,58,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(318, -32); ctx.lineTo(318, 32); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(304, -29, 38, 3.4);
  ctx.fillStyle = '#04103a'; ctx.beginPath(); ctx.ellipse(348, 0, 9, 29, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#d6f2ff'; ctx.lineWidth = 2.4; ctx.stroke();
  const lg = ctx.createRadialGradient(349, 0, 1, 349, 0, 22);
  lg.addColorStop(0, '#ffffff'); lg.addColorStop(0.4, '#7fd0ff'); lg.addColorStop(1, '#1a45c8');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.ellipse(349, 0, 6, 21, 0, 0, TAU); ctx.fill();
  add(ctx);
  drawGlow(ctx, 350, 0, 22 + 20 * frac, '#5ac8ff', 0.4 + 0.5 * frac);
  /* charge orb */
  if (c > 0.12) {
    const r = c < 0.45 ? 5 + (c / 0.45) * 9 : c < 1.2 ? 14 + ((c - 0.45) / 0.75) * 11 : 25 + 3 * Math.sin(t * 30);
    drawGlow(ctx, 360, 0, r * 3.4, '#2a8bff', 0.55);
    drawGlow(ctx, 360, 0, r * 2, flash ? '#ffffff' : '#7fd8ff', 0.8);
    drawGlow(ctx, 360, 0, r * 1.05, '#ffffff', 0.95);
    ctx.strokeStyle = rgba('#ffffff', 0.85); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(360, 0, r * 0.9, 0, TAU); ctx.stroke();
    if (lvl === 2) {
      for (let i = 0; i < 4; i++) {
        const a = t * 8 + (i * TAU) / 4;
        const px = 360 + Math.cos(a) * r * 1.5, py = Math.sin(a) * r * 1.5;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px + 2.4, py); ctx.lineTo(px, py + 6); ctx.lineTo(px - 2.4, py); ctx.closePath(); ctx.fill();
      }
    }
  }
  norm(ctx);
  ctx.restore();
}

function plasmaBall(ctx: C, p: { x: number; y: number; age: number }, r: number, big: boolean) {
  add(ctx);
  drawGlow(ctx, p.x, p.y, r * 3.6, '#2a8bff', 0.45);
  drawGlow(ctx, p.x, p.y, r * 2.2, '#5ac8ff', 0.7);
  const tg = ctx.createLinearGradient(0, p.y, 0, p.y + r * 6);
  tg.addColorStop(0, 'rgba(120,210,255,.65)'); tg.addColorStop(1, 'rgba(60,140,255,0)');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(p.x - r * 0.9, p.y); ctx.quadraticCurveTo(p.x - r * 0.45, p.y + r * 3, p.x, p.y + r * 6); ctx.quadraticCurveTo(p.x + r * 0.45, p.y + r * 3, p.x + r * 0.9, p.y); ctx.closePath(); ctx.fill();
  norm(ctx);
  const g = ctx.createRadialGradient(p.x - r * 0.25, p.y - r * 0.25, r * 0.1, p.x, p.y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#c6f0ff'); g.addColorStop(0.75, '#4aa8ff'); g.addColorStop(1, '#1f5aff');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(220,245,255,.95)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = Math.max(1.4, r * 0.1);
  for (let i = 0; i < 3; i++) { const a = p.age * 14 + (i * TAU) / 3; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.62, a, a + 1.1); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.beginPath(); ctx.arc(p.x, p.y, r * (0.3 + 0.06 * Math.sin(p.age * 50)), 0, TAU); ctx.fill();
  if (big) {
    add(ctx);
    for (let i = 0; i < 4; i++) {
      const a = -p.age * 9 + (i * TAU) / 4;
      const px = p.x + Math.cos(a) * r * 1.4, py = p.y + Math.sin(a) * r * 1.4;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(px, py - 8); ctx.lineTo(px + 3, py); ctx.lineTo(px, py + 8); ctx.lineTo(px - 3, py); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = rgba('#bfeaff', 0.7); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.18, p.age * 6, p.age * 6 + 2.4); ctx.stroke();
    norm(ctx);
  }
}

export const busterWeapon: Weapon = {
  id: 'mega-buster', name: 'Mega Buster', tag: 'Game', sub: 'Arm Cannon · Mega Man', accent: '#5ac8ff', isNew: true,
  desc: 'Meriam lengan biru dengan gauge energi. Ketuk = peluru kuning kecil. Tahan = isi daya (bola kecil berkedip, lalu level penuh), lepas = tembakan plasma raksasa dengan bintang ledakan.',
  hint: 'Ketuk = tembak · tahan lalu lepas = charge shot',
  muzzle: 360, muzzleY: 0, kick: 10, cooldown: 0.13, maxCharge: 1.6,
  draw: drawBuster,
  update: (g, s, dt) => {
    const c = s.holding ? s.charge : 0;
    const lv = c >= 1.2 ? 2 : c >= 0.45 ? 1 : 0;
    if (lv !== (s.data.lv ?? 0)) {
      if (lv > 0) {
        const m = g.muzzlePos();
        g.ring(m.x, m.y, 8, 70, lv === 2 ? '#ffffff' : '#7fd8ff', 0.3, 3, 0.8);
        g.glow(m.x, m.y, 80, '#5ac8ff', 0.2);
        g.shake(lv === 2 ? 3 : 1);
      }
      s.data.lv = lv;
    }
    if (c > 0.2) {
      const m = g.muzzlePos();
      s.data.acc = (s.data.acc ?? 0) + dt;
      const iv = lv === 2 ? 0.014 : lv === 1 ? 0.026 : 0.05;
      while (s.data.acc > iv) {
        s.data.acc -= iv;
        const a = rand(0, TAU), d = rand(46, lv === 2 ? 110 : 80), life = rand(0.12, 0.22);
        g.spawn({ type: 'spark', x: m.x + Math.cos(a) * d, y: m.y + Math.sin(a) * d, vx: (-Math.cos(a) * d) / life, vy: (-Math.sin(a) * d) / life, size: 1.6, life, pal: lv === 2 ? ['#ffffff', '#bfeaff'] : ['#ffffff', '#5ac8ff'], len: 0.05 });
      }
      g.light('#5ac8ff', 0.12 + 0.12 * lv);
    }
  },
  onRelease: (g, s, c) => {
    const m = g.muzzlePos();
    const lv = c >= 1.2 ? 2 : c >= 0.45 ? 1 : 0;
    s.data.lv = 0;
    if (lv === 0) {
      // The Plasma Gun's energy flash, but immediate: no plasma charge delay
      // may change the Mega Buster's original tap or firing speed.
      g.muzzleFlash(m.x, m.y, { size: 48, color: '#ffe04a', core: '#ffffff', spikes: 9, spread: 1.0, life: 0.12 });
      g.ring(m.x, m.y, 5, 90, '#ffe465', 0.4, 6, 0.45);
      g.ring(m.x, m.y, 3, 44, '#ffffff', 0.22, 3, 0.45);
      g.light('#ffe27a', 0.35);
      g.addProj({
        x: m.x, y: m.y, vx: 0, vy: -2700,
        draw: (ctx, _g, p) => drawBusterPellet(ctx, p),
        update: (gm, dt, p) => {
          // Small golden motes trail the tap shot at a fixed world-time rate,
          // not once per display frame on high-refresh phones.
          const d = (p.data ??= {});
          d.busterTrail = (d.busterTrail ?? 0) + Math.min(dt, 0.1);
          const n = Math.min(3, Math.floor(d.busterTrail / 0.045));
          d.busterTrail -= n * 0.045;
          for (let i = 0; i < n; i++) gm.spawn({
            type: 'glow', x: p.x + rand(-4, 4), y: p.y + rand(6, 20),
            vx: rand(-20, 20), vy: rand(10, 50), size: rand(9, 15), size1: 1.5,
            life: rand(0.25, 0.4), pal: ['#fff7ba', '#ffd52a'], alpha: 0.7,
          });
        },
        onHit: (gm, hx, hy) => {
          const n = gm.normalAt(hx, hy);
          gm.hit(hx, hy, { power: 0.55, chips: 3, dust: false });
          gm.addEmbed(hx, hy, { kind: 'scorch', color: '#222', glow: '#ffe27a', size: 0.5, cracks: 2, cool: 0.8 });
          // Gun Hit hosts the actual Plasma Gun impact (rings, rays, lightning
          // and sparks) in yellow, without scoring a second hit. The standalone
          // engine still gets a matching golden burst when no host is installed.
          if (!gm.busterPlasmaImpact?.(hx, hy)) {
            gm.glow(hx, hy, 135, '#ffd52a', 0.45, 0.95);
            gm.ring(hx, hy, 6, 140, '#ffe241', 0.45, 8);
            gm.ring(hx, hy, 4, 84, '#ffffff', 0.28, 3.5);
            gm.ring(hx, hy, 3, 54, '#d39b0a', 0.24, 5);
            starburst(gm, hx, hy, 100, '#ffe25a', 0.4, 12);
            gm.burst(hx, hy, { n: 40, ang: n, spread: 1.6, speed: [220, 680], life: [0.25, 0.65], size: [1.2, 2.2], pal: ['#fff5ae', '#ffe16a'], len: 0.03, ay: 900, drag: 2.2 });
            for (let i = 0; i < 4; i++) {
              const a = n + rand(-1.3, 1.3), d = rand(46, 90);
              gm.lightning(hx, hy, hx + Math.cos(a) * d, hy + Math.sin(a) * d, { color: '#ffe886', life: 0.22, width: 1.3, jag: 8 });
            }
          }
        },
      });
    } else if (lv === 1) {
      g.muzzleFlash(m.x, m.y, { size: 40, color: '#5ac8ff', core: '#ffffff', spikes: 6, spread: 0.7, life: 0.08 });
      g.ring(m.x, m.y, 6, 60, '#7fd8ff', 0.22, 3, 0.6);
      g.light('#5ac8ff', 0.5); g.shake(2);
      g.addProj({
        x: m.x, y: m.y, vx: 0, vy: -2200,
        update: (gm, dt, p) => { if (Math.random() < dt * 80) gm.spawn({ type: 'glow', x: p.x + rand(-6, 6), y: p.y + rand(6, 40), size: rand(2, 4), size1: 0, life: 0.3, pal: ['#ffffff', '#5ac8ff'], alpha: 0.7 }); },
        draw: (ctx, _g, p) => plasmaBall(ctx, p, 16, false),
        onHit: (gm, hx, hy) => {
          const n = gm.normalAt(hx, hy);
          gm.hit(hx, hy, { power: 1.4, chips: 9, stop: 0.04, shake: 4, flash: 0.5 });
          gm.addEmbed(hx, hy, { kind: 'scorch', color: '#222', glow: '#5ac8ff', size: 0.95, cracks: 4, cool: 1.8 });
          gm.heatWheel('#5ac8ff', 0.25);
          starburst(gm, hx, hy, 62, '#5ac8ff', 0.32, 8);
          gm.ring(hx, hy, 5, 100, '#7fd8ff', 0.36, 4, 0.45);
          gm.ring(hx, hy, 3, 62, '#ffffff', 0.24, 2.4, 0.45);
          gm.glow(hx, hy, 90, '#5ac8ff', 0.26);
          gm.burst(hx, hy, { n: 16, type: 'cube', ang: n, spread: 1.5, speed: [140, 520], life: [0.3, 0.7], size: [1.4, 3], size1: 0, pal: ['#ffffff', '#7fd8ff', '#2f78ff'], vr: 12 });
          gm.burst(hx, hy, { n: 20, ang: n, spread: 1.5, speed: [200, 700], life: [0.2, 0.5], size: [1, 2.4], pal: ['#ffffff', '#7fd8ff'], len: 0.05, ay: 300 });
        },
      });
    } else {
      g.muzzleFlash(m.x, m.y, { size: 74, color: '#5ac8ff', core: '#ffffff', spikes: 8, spread: 0.9, life: 0.11 });
      g.ring(m.x, m.y, 8, 120, '#bfeaff', 0.3, 5, 0.6);
      g.ring(m.x, m.y, 4, 80, '#ffffff', 0.22, 3, 0.6);
      g.glow(m.x, m.y, 130, '#2a8bff', 0.24);
      g.light('#5ac8ff', 0.8); g.shake(5);
      g.addProj({
        x: m.x, y: m.y, vx: 0, vy: -1900,
        update: (gm, dt, p) => {
          if (Math.random() < dt * 140) gm.spawn({ type: 'glow', x: p.x + rand(-14, 14), y: p.y + rand(10, 70), size: rand(3, 7), size1: 0, life: rand(0.25, 0.5), pal: ['#ffffff', '#7fd8ff', '#2a6bff'], alpha: 0.7 });
          if (Math.random() < dt * 70) gm.spawn({ type: 'cube', x: p.x + rand(-22, 22), y: p.y + rand(0, 60), vx: rand(-30, 30), vy: rand(20, 100), size: rand(1.2, 2.6), size1: 0, life: rand(0.3, 0.6), pal: ['#ffffff', '#bfeaff'], vr: 10 });
        },
        draw: (ctx, _g, p) => plasmaBall(ctx, p, 34, true),
        onHit: (gm, hx, hy) => {
          const n = gm.normalAt(hx, hy);
          gm.hit(hx, hy, { power: 2.5, count: 2, chips: 18, kick: 1.5, stop: 0.08, shake: 9, flash: 0.9 });
          gm.addEmbed(hx, hy, { kind: 'crater', color: '#222', glow: '#5ac8ff', size: 1.3, cracks: 9, cool: 2.6 });
          gm.heatWheel('#5ac8ff', 0.6);
          gm.light('#5ac8ff', 0.95);
          starburst(gm, hx, hy, 150, '#5ac8ff', 0.46, 12);
          starburst(gm, hx, hy, 90, '#ffffff', 0.34, 8);
          gm.ring(hx, hy, 6, 180, '#5ac8ff', 0.55, 8, 0.45);
          gm.ring(hx, hy, 4, 110, '#ffffff', 0.34, 4, 0.45);
          gm.ring(hx, hy, 2, 240, '#2a6bff', 0.7, 3, 0.45);
          gm.glow(hx, hy, 150, '#5ac8ff', 0.4);
          gm.glow(hx, hy, 60, '#ffffff', 0.2);
          gm.burst(hx, hy, { n: 28, type: 'cube', ang: n, spread: 1.55, speed: [180, 820], life: [0.4, 0.9], size: [1.6, 3.6], size1: 0, pal: ['#ffffff', '#7fd8ff', '#2f78ff'], vr: 14 });
          gm.burst(hx, hy, { n: 40, ang: n, spread: 1.6, speed: [240, 900], life: [0.25, 0.7], size: [1, 2.8], pal: ['#ffffff', '#bfeaff', '#5ac8ff'], len: 0.05, ay: 450 });
          for (let i = 0; i < 4; i++) { const a = n + rand(-1.3, 1.3); gm.lightning(hx, hy, hx + Math.cos(a) * rand(60, 130), hy + Math.sin(a) * rand(60, 130), { color: '#5ac8ff', life: 0.22, width: 1.6, jag: 9 }); }
        },
      });
    }
  },
};

void pick; void metalBox;

export const iconWeapons: Weapon[] = [tripodWeapon2, ironWeapon2, xenoWeapon, busterWeapon];
