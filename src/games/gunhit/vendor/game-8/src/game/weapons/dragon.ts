import type { Game } from '../engine';
import type { WeaponState } from '../types';
import { TAU, add, drawGlow, hgrad, norm, rand, vgrad } from '../util';

type C = CanvasRenderingContext2D;

/* Local frame: +x = toward the target (up the screen), +y = jaw side, -y = dorsal side.   */
/* The head is drawn in side profile, mouth centre at about (306, 46).                      */

let scalePat: CanvasPattern | null = null;
function scalePattern(ctx: C) {
  if (scalePat) return scalePat;
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const x = c.getContext('2d')!;
  const pts = [[0, 0], [16, 0], [8, 8], [0, 16], [16, 16]];
  x.lineWidth = 1.2;
  x.strokeStyle = 'rgba(40,0,8,.5)';
  for (const [cx, cy] of pts) { x.beginPath(); x.arc(cx, cy, 8, 0.2, Math.PI - 0.2); x.stroke(); }
  x.strokeStyle = 'rgba(255,200,140,.2)';
  for (const [cx, cy] of pts) { x.beginPath(); x.arc(cx, cy - 1.6, 8, 0.45, Math.PI - 0.45); x.stroke(); }
  scalePat = ctx.createPattern(c, 'repeat');
  return scalePat!;
}

function headPath(ctx: C, close = true) {
  ctx.beginPath();
  ctx.moveTo(60, -62);
  ctx.bezierCurveTo(100, -64, 130, -60, 156, -55);
  ctx.bezierCurveTo(176, -68, 200, -66, 216, -50);
  ctx.bezierCurveTo(242, -43, 280, -39, 306, -31);
  ctx.bezierCurveTo(325, -28, 339, -18, 339, -4);
  ctx.bezierCurveTo(337, 4, 322, 8, 306, 9);
  ctx.bezierCurveTo(270, 10, 232, 14, 206, 24);
  ctx.bezierCurveTo(192, 30, 178, 44, 162, 58);
  ctx.bezierCurveTo(140, 74, 100, 80, 60, 78);
  if (close) ctx.closePath();
}
function neckPath(ctx: C) {
  ctx.beginPath();
  ctx.moveTo(150, -56);
  ctx.bezierCurveTo(100, -60, 40, -72, -34, -98);
  ctx.lineTo(-34, 104);
  ctx.bezierCurveTo(30, 94, 70, 86, 124, 76);
  ctx.closePath();
}

const BODY = ['#25040b', '#6a0b1f', '#b3202a', '#e0502e', '#f4b44e'];
const GOLDV = ['#fff6c4', '#f3c84e', '#b9801a', '#6a4208'];

function spike(ctx: C, bx: number, by: number, tx: number, ty: number, w: number) {
  const dx = tx - bx, dy = ty - by;
  const L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  ctx.moveTo(bx + nx * w, by + ny * w);
  ctx.quadraticCurveTo(bx + dx * 0.55 + nx * w * 0.45, by + dy * 0.55 + ny * w * 0.45, tx, ty);
  ctx.quadraticCurveTo(bx + dx * 0.45 - nx * w * 0.3, by + dy * 0.45 - ny * w * 0.3, bx - nx * w, by - ny * w);
  ctx.closePath();
  const g = ctx.createLinearGradient(bx, by, tx, ty);
  g.addColorStop(0, '#7a0f22'); g.addColorStop(0.45, '#d8a23c'); g.addColorStop(1, '#fff3b8');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,0,6,.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
}

function fang(ctx: C, x: number, y: number, w: number, h: number, dir: 1 | -1) {
  ctx.beginPath();
  ctx.moveTo(x - w, y);
  ctx.quadraticCurveTo(x - w * 0.3, y + dir * h * 0.6, x + w * 0.2, y + dir * h);
  ctx.quadraticCurveTo(x + w * 0.5, y + dir * h * 0.4, x + w, y);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, y, y + dir * h, ['#ddd0a6', '#fffef2']);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,34,8,.7)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
}

export function drawDragon(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t;
  const ch = s.chan;
  const jaw = 0.05 + 0.5 * ch + Math.sin(t * 2.2) * 0.012;
  const sway = Math.sin(t * 1.6) * 0.012;

  ctx.save();
  ctx.translate(rand(-1, 1) * 1.6 * ch, rand(-1, 1) * 1.6 * ch);
  ctx.translate(100, 0);
  ctx.rotate(sway);
  ctx.translate(-100, 0);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  /* ---------- fiery mane behind the head */
  add(ctx);
  for (let i = 0; i < 11; i++) {
    const bx = 150 - i * 14, by = -58 - (i % 2) * 2;
    const w = Math.sin(t * 3 + i * 0.8);
    const tx = bx - 46 - i * 5 + w * 12, ty = by - 72 - (i % 3) * 16 + Math.cos(t * 2.3 + i) * 10;
    const fg = ctx.createLinearGradient(bx, by, tx, ty);
    fg.addColorStop(0, `rgba(255,200,70,${0.6 + 0.25 * ch})`);
    fg.addColorStop(0.55, 'rgba(255,90,20,.38)');
    fg.addColorStop(1, 'rgba(160,20,10,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(bx + 11, by);
    ctx.quadraticCurveTo(bx - 8 + w * 8, (by + ty) / 2 + 6, tx, ty);
    ctx.quadraticCurveTo(bx - 20, (by + ty) / 2, bx - 11, by);
    ctx.closePath();
    ctx.fill();
  }
  drawGlow(ctx, 110, -80, 100, '#ff7a1a', 0.18 + 0.15 * ch);
  norm(ctx);

  /* ---------- ear-fin (webbed frill) */
  const tips = [[48, -138], [80, -164], [118, -176], [156, -166]];
  const bases = [[96, -58], [118, -58], [140, -57], [160, -56]];
  ctx.beginPath();
  ctx.moveTo(172, -55);
  ctx.lineTo(tips[3][0], tips[3][1]);
  for (let i = 3; i > 0; i--) {
    const a = tips[i], b = tips[i - 1];
    ctx.quadraticCurveTo((a[0] + b[0]) / 2 + 8, (a[1] + b[1]) / 2 + 26, b[0], b[1]);
  }
  ctx.lineTo(80, -60);
  ctx.closePath();
  const fm = ctx.createLinearGradient(120, -56, 100, -176);
  fm.addColorStop(0, 'rgba(255,150,40,.95)');
  fm.addColorStop(0.5, 'rgba(200,40,30,.8)');
  fm.addColorStop(1, 'rgba(110,10,40,.55)');
  ctx.fillStyle = fm;
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,0,10,.8)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,220,140,.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(bases[i][0], bases[i][1]);
    ctx.quadraticCurveTo((bases[i][0] + tips[i][0]) / 2 + 6, (bases[i][1] + tips[i][1]) / 2, tips[i][0], tips[i][1]);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(bases[i][0], bases[i][1]);
    ctx.quadraticCurveTo((bases[i][0] + tips[i][0]) / 2 + 6, (bases[i][1] + tips[i][1]) / 2, tips[i][0], tips[i][1]);
    ctx.strokeStyle = 'rgba(40,0,8,.9)'; ctx.lineWidth = 6.5; ctx.stroke();
    ctx.strokeStyle = hgrad(ctx, 40, 180, GOLDV); ctx.lineWidth = 3.4; ctx.stroke();
  }

  /* ---------- dorsal spines along neck */
  for (let i = 0; i < 6; i++) {
    const x = 130 - i * 28;
    const top = -56 - (150 - x) * 0.222;
    spike(ctx, x + 4, top + 6, x - 30 - i * 2, top - 36 - (i % 2) * 6, 11);
  }

  /* ---------- neck */
  neckPath(ctx);
  ctx.fillStyle = vgrad(ctx, -100, 100, BODY);
  ctx.fill();
  ctx.save();
  neckPath(ctx);
  ctx.clip();
  ctx.fillStyle = scalePattern(ctx);
  ctx.fillRect(-40, -110, 200, 220);
  for (let k = 0; k < 9; k++) {
    const x0 = 118 - k * 17;
    const bot = 80 + (124 - x0) * 0.14;
    ctx.beginPath();
    ctx.moveTo(x0, bot - 40); ctx.lineTo(x0 - 15, bot - 38); ctx.lineTo(x0 - 15, bot + 8); ctx.lineTo(x0, bot + 8);
    ctx.closePath();
    ctx.fillStyle = hgrad(ctx, x0 - 15, x0, ['#d9a548', '#ffe9a0', '#d9a548']);
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,30,0,.65)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.fillStyle = hgrad(ctx, -34, 150, ['rgba(0,0,0,.45)', 'rgba(0,0,0,0)']);
  ctx.fillRect(-40, -110, 200, 220);
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(150, -56); ctx.bezierCurveTo(100, -60, 40, -72, -34, -98);
  ctx.moveTo(-34, 104); ctx.bezierCurveTo(30, 94, 70, 86, 124, 76);
  ctx.strokeStyle = 'rgba(22,0,6,.9)'; ctx.lineWidth = 2.2; ctx.stroke();

  /* ---------- mouth cavity */
  const hx = 178, hy = 38;
  const tipx = hx + 158 * Math.cos(jaw) + 28 * Math.sin(jaw);
  const tipy = hy + 158 * Math.sin(jaw) - 28 * Math.cos(jaw);
  const cav = ctx.createLinearGradient(190, 0, 340, 0);
  cav.addColorStop(0, '#1a0307');
  cav.addColorStop(0.5, `rgb(${120 + 110 * ch | 0},${24 + 60 * ch | 0},8)`);
  cav.addColorStop(1, `rgb(255,${110 + 100 * ch | 0},${30 + 40 * ch | 0})`);
  ctx.fillStyle = cav;
  ctx.beginPath();
  ctx.moveTo(342, 0); ctx.lineTo(196, 20); ctx.lineTo(hx, hy); ctx.lineTo(tipx, tipy); ctx.lineTo(344, 8);
  ctx.closePath(); ctx.fill();
  add(ctx);
  drawGlow(ctx, 270, 24 + jaw * 40, 60 + 60 * ch, '#ff9a2a', 0.2 + 0.8 * ch);
  drawGlow(ctx, 300, 22 + jaw * 30, 24 + 26 * ch, '#fff3c0', 0.15 + 0.7 * ch);
  norm(ctx);
  // upper palate fangs
  for (const [x, y, w, h] of [[318, 8, 7, 24], [292, 9, 6, 17], [262, 11, 5.5, 13], [232, 15, 5, 11]]) fang(ctx, x, y, w, h, 1);

  /* ---------- lower jaw */
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(jaw);
  ctx.beginPath();
  ctx.moveTo(-24, -4);
  ctx.lineTo(26, -14);
  ctx.bezierCurveTo(70, -22, 110, -30, 150, -30);
  ctx.bezierCurveTo(164, -28, 168, -14, 160, -6);
  ctx.bezierCurveTo(130, 4, 100, 10, 60, 16);
  ctx.bezierCurveTo(30, 22, 0, 28, -26, 24);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -30, 28, ['#b2202a', '#8a1224', '#4a0814']);
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = scalePattern(ctx);
  ctx.fillRect(-30, -40, 210, 80);
  ctx.fillStyle = vgrad(ctx, -4, 28, ['rgba(255,214,120,0)', 'rgba(255,220,130,.8)']);
  ctx.fillRect(-30, -4, 210, 40);
  ctx.restore();
  ctx.strokeStyle = 'rgba(22,0,6,.95)'; ctx.lineWidth = 2.2; ctx.stroke();
  // tongue
  ctx.beginPath();
  ctx.moveTo(8, -12);
  for (let i = 0; i <= 10; i++) ctx.lineTo(8 + i * 11, -16 - i * 1.4 + Math.sin(t * 9 + i) * 1.6 * ch);
  for (let i = 10; i >= 0; i--) ctx.lineTo(8 + i * 11, -6 - i * 1.3);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -34, -4, ['#f06a82', '#a01c38']);
  ctx.fill();
  // lower fangs
  for (const [x, y, w, h] of [[142, -28, 7.5, 26], [112, -25, 6, 16], [84, -22, 5, 12], [58, -18, 4.5, 10]]) fang(ctx, x, y, w, h, -1);
  ctx.restore();

  /* ---------- cheek spikes */
  spike(ctx, 168, 52, 118, 98, 9);
  spike(ctx, 150, 62, 106, 112, 8);
  spike(ctx, 128, 70, 92, 120, 7);

  /* ---------- head */
  headPath(ctx);
  ctx.fillStyle = vgrad(ctx, -100, 100, BODY);
  ctx.fill();
  ctx.save();
  headPath(ctx);
  ctx.clip();
  ctx.fillStyle = scalePattern(ctx);
  ctx.fillRect(40, -80, 320, 170);
  // jowl & cheek plate
  const cp = ctx.createLinearGradient(150, 0, 210, 50);
  cp.addColorStop(0, 'rgba(255,214,110,0)'); cp.addColorStop(1, 'rgba(255,214,110,.6)');
  ctx.fillStyle = cp;
  ctx.beginPath(); ctx.moveTo(150, -2); ctx.quadraticCurveTo(190, 8, 214, 26); ctx.lineTo(166, 62); ctx.quadraticCurveTo(138, 36, 150, -2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,226,140,.65)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(156, 0); ctx.quadraticCurveTo(186, 10, 208, 28); ctx.stroke();
  ctx.fillStyle = hgrad(ctx, -34, 150, ['rgba(0,0,0,.45)', 'rgba(0,0,0,0)']);
  ctx.fillRect(40, -80, 320, 170);
  // top shading and brow shadow
  ctx.fillStyle = vgrad(ctx, -70, -20, ['rgba(0,0,0,.5)', 'rgba(0,0,0,0)']);
  ctx.fillRect(40, -80, 320, 60);
  ctx.fillStyle = 'rgba(0,0,0,.32)';
  ctx.beginPath(); ctx.moveTo(196, -36); ctx.quadraticCurveTo(228, -52, 262, -38); ctx.lineTo(264, -28); ctx.quadraticCurveTo(228, -36, 196, -26); ctx.closePath(); ctx.fill();
  // underlit by fire
  if (ch > 0.02) {
    add(ctx);
    const rim = ctx.createRadialGradient(306, 24, 4, 306, 24, 170);
    rim.addColorStop(0, `rgba(255,170,60,${0.55 * ch})`); rim.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = rim; ctx.fillRect(40, -80, 320, 170);
    norm(ctx);
  }
  ctx.restore();
  headPath(ctx, false);
  ctx.strokeStyle = 'rgba(22,0,6,.95)'; ctx.lineWidth = 2.6; ctx.stroke();
  // golden crest along the snout
  ctx.beginPath();
  ctx.moveTo(158, -57); ctx.bezierCurveTo(176, -69, 200, -67, 216, -52); ctx.bezierCurveTo(242, -45, 280, -41, 306, -33);
  ctx.strokeStyle = 'rgba(255,214,110,.9)'; ctx.lineWidth = 3; ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const x = 230 + i * 14;
    ctx.fillStyle = 'rgba(255,230,150,.9)';
    ctx.beginPath(); ctx.moveTo(x - 4, -43 + i * 1.7); ctx.lineTo(x, -52 + i * 1.6); ctx.lineTo(x + 4, -42 + i * 1.7); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = vgrad(ctx, -22, -4, GOLDV);
  ctx.beginPath(); ctx.arc(318, -28, 4, 0, TAU); ctx.fill();

  /* ---------- horns */
  const horn = (b0: number[], b1: number[], tip: number[], c1: number[], c2: number[]) => {
    ctx.beginPath();
    ctx.moveTo(b0[0], b0[1]);
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], tip[0], tip[1]);
    ctx.bezierCurveTo(c2[0] + 22, c2[1] + 30, c1[0] - 6, c1[1] + 34, b1[0], b1[1]);
    ctx.closePath();
    ctx.fillStyle = hgrad(ctx, tip[0], b0[0], ['#fffbe0', '#f3c84e', '#b9801a', '#5a3506']);
    ctx.fill();
    ctx.strokeStyle = 'rgba(48,24,0,.9)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = 'rgba(80,45,0,.55)'; ctx.lineWidth = 1.2;
    for (let i = 1; i < 6; i++) {
      const u = i / 6;
      const px = b0[0] + (tip[0] - b0[0]) * u * 0.9, py = b0[1] + (tip[1] - b0[1]) * u * 0.92;
      ctx.beginPath(); ctx.moveTo(px, py + 2); ctx.lineTo(px + 5, py + 17 * (1 - u * 0.7)); ctx.stroke();
    }
  };
  horn([214, -56], [172, -56], [78, -146], [200, -92], [146, -122]);
  horn([240, -46], [216, -50], [162, -108], [236, -76], [196, -96]);

  /* ---------- nostril + eye */
  ctx.fillStyle = '#16020a';
  ctx.beginPath(); ctx.ellipse(324, -14, 6, 3.2, -0.45, 0, TAU); ctx.fill();
  add(ctx); drawGlow(ctx, 324, -14, 10 + 16 * ch, '#ff7a1a', 0.4 + 0.5 * ch); norm(ctx);

  ctx.save();
  ctx.translate(228, -34); ctx.rotate(0.26);
  ctx.fillStyle = '#14020a';
  ctx.beginPath(); ctx.ellipse(0, 0, 21, 10.5, 0, 0, TAU); ctx.fill();
  const eg = ctx.createRadialGradient(0, 0, 1, 0, 0, 19);
  eg.addColorStop(0, '#fffbd0'); eg.addColorStop(0.35, '#ffc21a'); eg.addColorStop(1, '#e0480f');
  ctx.fillStyle = eg;
  ctx.beginPath(); ctx.moveTo(-18, 1); ctx.quadraticCurveTo(0, -16, 19, -1); ctx.quadraticCurveTo(0, 9, -18, 1); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#100208';
  ctx.beginPath(); ctx.ellipse(1, -2, 2.2, 7, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-4, -5, 1.8, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(30,0,6,.7)';
  ctx.beginPath(); ctx.moveTo(-22, -3); ctx.quadraticCurveTo(0, -23, 24, -4); ctx.lineTo(24, -10); ctx.quadraticCurveTo(0, -29, -22, -9); ctx.closePath(); ctx.fill();
  add(ctx); drawGlow(ctx, 0, -1, 30 + 18 * ch, '#ffb020', 0.5 + 0.4 * ch); norm(ctx);
  ctx.restore();

  /* ---------- whiskers */
  add(ctx);
  for (const [ax, ay, sg] of [[312, -4, -1], [300, 6, 1]] as number[][]) {
    ctx.beginPath();
    for (let j = 0; j <= 28; j++) {
      const x = ax - j * 9.5;
      const y = ay + sg * (j * 1.9 + 4) + Math.sin(j * 0.36 + t * 2.4 + sg) * (3 + j * 0.8);
      j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,200,80,.16)'; ctx.lineWidth = 7; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,228,140,.95)'; ctx.lineWidth = 1.8; ctx.stroke();
  }
  norm(ctx);
  ctx.restore();
}
