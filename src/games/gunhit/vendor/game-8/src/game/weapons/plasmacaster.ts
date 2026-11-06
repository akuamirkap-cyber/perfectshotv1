import type { Game } from '../engine';
import type { Weapon, WeaponState } from '../types';
import {
  TAU, add, clamp, drawGlow, easeOut, metalBox, norm, rand, rgba, rr, vgrad,
} from '../util';

type C = CanvasRenderingContext2D;

const CY = '#4ae0ff';
const RED = '#ff3a3a';
const TIT = ['#e8edf4', '#878f9c', '#454c58', '#161a21'];

const PERIOD = 2.6;          // full auto cycle (at full lock)
function lockOf(s: WeaponState, time: number) {
  return (s.data.auto || s.holding) ? clamp(((s.data.cyc ?? 0) + time) / PERIOD) : clamp(s.ready * 1.15);
}

/* ------------------------------------------------------------------ drawing */
function drawShoulder(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, lk = lockOf(s, s.data.cyc ?? 0);
  const rec = s.recoil;
  const pulse = 0.6 + 0.4 * Math.sin(t * (3 + lk * 11));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';

  /* HUD / coil spines running off-frame (the rest of the gear) */
  metalBox(ctx, 8, -46, 34, 16, 4, TIT, 0.3);
  metalBox(ctx, 4, 30, 34, 16, 4, TIT, 0.3);
  add(ctx);
  ctx.strokeStyle = rgba(RED, 0.4 + 0.4 * Math.sin(t * 6)); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(6, -38); ctx.lineTo(48, -38); ctx.stroke();
  norm(ctx);

  /* power cables from the frame into the base */
  ctx.strokeStyle = '#0a0b0e'; ctx.lineWidth = 13;
  ctx.beginPath(); ctx.moveTo(-6, -6); ctx.bezierCurveTo(24, -30, 30, 24, 36, 16); ctx.stroke();
  ctx.strokeStyle = '#2c2f38'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(-6, -6); ctx.bezierCurveTo(24, -30, 30, 24, 36, 16); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-8, -8); ctx.bezierCurveTo(22, -32, 28, 22, 34, 14); ctx.stroke();
  ctx.fillStyle = '#16181d'; ctx.beginPath(); ctx.arc(-6, -6, 9, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4a4e58'; ctx.lineWidth = 2; ctx.stroke();

  /* articulation arm: upper bar, pistons to the cannon cradle */
  metalBox(ctx, 22, -52, 76, 104, 12, TIT, 0.35);
  ctx.strokeStyle = '#8a93a2'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(46, -44); ctx.lineTo(112, -44); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2; ctx.stroke();
  for (const [sg, ax, by] of [[-1, 66, -46], [1, 66, 46]]) {
    const tx = 128 + sg * 26, ty = sg * 26;
    ctx.beginPath(); ctx.moveTo(ax, by); ctx.lineTo(tx, ty);
    ctx.strokeStyle = '#05060a'; ctx.lineWidth = 20; ctx.stroke();
    ctx.strokeStyle = '#8a93a2'; ctx.lineWidth = 15; ctx.stroke();
    const m = clamp(by < 0 ? -rec * 14 : rec * 14, 0, 99);
    const u0 = 0.22 + m * 0.3, u1 = 0.88;
    const gx1 = ax + (tx - ax) * u0, gy1 = by + (ty - by) * u0;
    const gx2 = ax + (tx - ax) * u1, gy2 = by + (ty - by) * u1;
    ctx.strokeStyle = '#f2f5f9'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(gx1, gy1); ctx.lineTo(gx2, gy2); ctx.stroke();
    ctx.fillStyle = '#232730'; ctx.beginPath(); ctx.arc(ax, by, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#98a3b2'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.fillStyle = '#464c58'; ctx.beginPath(); ctx.arc(ax, by, 3.4, 0, TAU); ctx.fill();
  }
  /* side mesh cable */
  ctx.beginPath(); ctx.moveTo(70, 0); ctx.bezierCurveTo(110, 18, 150, -18, 190, 2);
  ctx.strokeStyle = '#05060a'; ctx.lineWidth = 9; ctx.stroke();
  ctx.strokeStyle = '#8a93a2'; ctx.lineWidth = 6; ctx.stroke();
  ctx.setLineDash([3, 4]); ctx.strokeStyle = '#c8d0dc'; ctx.lineWidth = 6; ctx.stroke(); ctx.setLineDash([]);

  /* servo shoulder */
  metalBox(ctx, 92, -44, 52, 88, 6, TIT, 0.35);
  const sx = 118, sy = 0;
  ctx.fillStyle = '#0b0d12'; ctx.beginPath(); ctx.arc(sx, sy, 27, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a6270'; ctx.lineWidth = 3; ctx.stroke();
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.5);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    ctx.fillStyle = '#3a3f4a';
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.lineTo(Math.cos(a + 0.1) * 25, Math.sin(a + 0.1) * 25); ctx.lineTo(Math.cos(a + 0.45) * 25, Math.sin(a + 0.45) * 25); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  add(ctx);
  for (let i = 0; i < 6; i++) {
    const a = ((i / 6) * TAU + t * 1.2) % TAU;
    const on = 0.25 + 0.75 * clamp(Math.sin(a + 1.2), 0, 1);
    ctx.fillStyle = rgba(RED, on); ctx.beginPath(); ctx.arc(sx + Math.cos((i / 6) * TAU) * 18, sy + Math.sin((i / 6) * TAU) * 18, 2.2, 0, TAU); ctx.fill();
    if (on > 0.6) drawGlow(ctx, sx + Math.cos((i / 6) * TAU) * 18, sy + Math.sin((i / 6) * TAU) * 18, 9, RED, on * 0.7);
  }
  norm(ctx);
  const hg = ctx.createRadialGradient(sx - 2, sy - 2, 0, sx, sy, 8);
  hg.addColorStop(0, '#fff'); hg.addColorStop(1, '#565c68');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(sx, sy, 7.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 4, sy - 3); ctx.stroke();

  /* the cannon itself kicks back when firing */
  ctx.save();
  ctx.translate(-rec * 26, 0);

  /* vented shroud */
  ctx.fillStyle = vgrad(ctx, -46, 46, TIT);
  ctx.beginPath();
  ctx.moveTo(168, -46); ctx.lineTo(208, -36); ctx.lineTo(208, 36); ctx.lineTo(168, 46); ctx.lineTo(166, 26); ctx.lineTo(130, 26); ctx.lineTo(130, -26); ctx.lineTo(166, -26); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.8; ctx.stroke();
  for (const sg of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      metalBox(ctx, 138 + i * 10, sg * 30 + (sg > 0 ? -3 : 3), 7, 7, 2, TIT, 0.4);
      ctx.fillStyle = '#06070a'; ctx.beginPath(); ctx.arc(141.5 + i * 10, sg * 30 + 3.5, 2.2, 0, TAU); ctx.fill();
      add(ctx);
      ctx.fillStyle = rgba('#ff6a2a', clamp(rec * 2) * 0.9 + 0.08);
      ctx.beginPath(); ctx.arc(141.5 + i * 10, sg * 30 + 3.5, 2.8, 0, TAU); ctx.fill();
      if (rec > 0.25) drawGlow(ctx, 141.5 + i * 10, sg * 30 + 3.5, 12, '#ff7a2a', rec * 0.8);
      norm(ctx);
    }
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(134, sg * 34); ctx.lineTo(200, sg * 36); ctx.stroke();
  }

  /* main barrel housing */
  metalBox(ctx, 200, -34, 130, 68, 9, TIT, 0.4);
  // battle wear
  ctx.strokeStyle = 'rgba(12,14,18,.5)'; ctx.lineWidth = 1.1;
  for (let i = 0; i < 7; i++) { const x = 214 + i * 16 + (i % 3) * 5, y = (((i * 53) % 30) - 15) * 0.9; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8 + (i % 2) * 6, y + (i % 2 ? -4 : 3)); ctx.stroke(); }
  // rail lines
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  for (const y of [-24, -12, 0, 12, 24]) ctx.fillRect(206, y - 1.2, 116, 2.4);
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  for (const y of [-24, -12, 0, 12, 24]) ctx.fillRect(206, y - 1.2, 116, 0.9);
  // cyan energy lanes
  add(ctx);
  for (const y of [-12, 0, 12]) {
    const on = clamp(lk * 6 - Math.abs(y) / 12 * 0.8);
    ctx.fillStyle = rgba(CY, 0.22 + 0.55 * on); rr(ctx, 208, y - 1.6, 112, 3.2, 1.4); ctx.fill();
  }
  drawGlow(ctx, 264, 0, 70, CY, 0.12 + 0.3 * lk);
  norm(ctx);

  /* tri-laser module (predator triangle) on top */
  metalBox(ctx, 226, -60, 54, 26, 5, TIT, 0.45);
  ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(ctx, 234, -56, 36, 18, 3); ctx.fill();
  // triangle pattern: apex down
  const dots: [number, number][] = [[252, -40], [248, -50], [256, -50]];
  for (const [x, y] of dots) {
    ctx.fillStyle = '#f2f5f9'; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#2a0606'; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill();
    add(ctx); drawGlow(ctx, x, y, 7, RED, 0.7 + 0.3 * pulse); norm(ctx);
  }
  for (const sg of [-1, 1]) {
    ctx.fillStyle = vgrad(ctx, sg * 40 - 6, sg * 40 + 6, TIT);
    rr(ctx, 220, sg * 40 - 5, 34, 10, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1; ctx.stroke();
  }

  /* charge ring */
  ctx.fillStyle = '#0a0c12'; rr(ctx, 326, -27, 14, 54, 5); ctx.fill();
  ctx.strokeStyle = '#2e3340'; ctx.lineWidth = 2; ctx.stroke();
  add(ctx);
  ctx.fillStyle = rgba(CY, 0.2 + 0.75 * lk); rr(ctx, 331, -22, 5, 44, 2); ctx.fill();
  drawGlow(ctx, 333.5, 0, 34, CY, 0.5 * lk + 0.2);
  norm(ctx);

  /* plasma core window */
  ctx.fillStyle = 'rgba(0,0,0,.7)'; rr(ctx, 282, -17, 32, 22, 9); ctx.fill(); rr(ctx, 282, 9, 32, 8, 4); ctx.fill();
  ctx.strokeStyle = '#4a505e'; ctx.lineWidth = 1.6; rr(ctx, 282, -17, 32, 22, 9); ctx.stroke();
  add(ctx);
  const cg = ctx.createRadialGradient(298, -6, 1, 298, -6, 12);
  cg.addColorStop(0, 'rgba(255,255,255,.95)'); cg.addColorStop(0.4, rgba(CY, 0.35 + 0.6 * lk)); cg.addColorStop(1, rgba('#1a4aff', 0.1));
  ctx.fillStyle = cg; ctx.fillRect(286, -22, 26, 20);
  ctx.strokeStyle = rgba('#ffffff', 0.5 + 0.5 * lk); ctx.lineWidth = 1.2;
  for (let i = 0; i < 2; i++) {
    const a = t * (3 + i * 1.4) + i * 2;
    ctx.beginPath(); ctx.ellipse(298, -7, 11, 5, a, 0, TAU); ctx.stroke();
  }
  drawGlow(ctx, 298, -7, 20 + 16 * lk, CY, 0.35 + 0.5 * lk * pulse);
  // charge wing panels
  ctx.save(); ctx.translate(298, 8); ctx.scale(2.6, 1);
  for (let i = 0; i < 4; i++) {
    const a0 = (i / 4) * TAU + 0.4;
    const on = clamp(lk * 5 - i * 0.85);
    ctx.fillStyle = rgba(on > 0.85 ? '#ffffff' : CY, 0.3 + 0.7 * on);
    ctx.beginPath(); ctx.arc(0, 0, 10, a0 + 0.12, a0 + 1.45); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 0.7; ctx.stroke();
    add(ctx);
  }
  norm(ctx); ctx.restore();
  // core status light
  add(ctx); ctx.fillStyle = rgba(RED, 0.4 + 0.6 * (Math.sin(t * 8) > 0 ? 1 : 0.25)); ctx.beginPath(); ctx.arc(337, -16, 2.2, 0, TAU); ctx.fill(); drawGlow(ctx, 337, -16, 8, RED, 0.6); norm(ctx);

  /* muzzle barrel, stopped by the shoulder "stop" plates */
  metalBox(ctx, 338, -11, 24, 22, 4, TIT, 0.45);
  ctx.fillStyle = vgrad(ctx, -11, 11, ['#565e6a', '#1d2129', '#05060a']);
  rr(ctx, 336, -12, 8, 24, 3); ctx.fill();
  // muzzle brake fins
  metalBox(ctx, 360, -17, 14, 34, 4, TIT, 0.4);
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) ctx.fillRect(360, sg * 17 + (sg > 0 ? i * 5 : -2.8 - i * 5), 14, 2.8);
  add(ctx);
  for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { const h = clamp(rec * 2.2 + 0.06); ctx.fillStyle = rgba('#ff7a2a', h * (0.9 - i * 0.2)); ctx.fillRect(361.5, sg * 17 + (sg > 0 ? i * 5 : -1.8 - i * 5), 11, 1.8); }
  drawGlow(ctx, 366, 0, 20 + 46 * lk * pulse, CY, 0.25 + 0.55 * lk);
  drawGlow(ctx, 366, 0, 6 + 8 * lk, '#ffffff', 0.5 + 0.5 * lk);
  // faint arcs when nearly charged
  if (lk > 0.8 && Math.random() < 0.05) {
    ctx.strokeStyle = rgba('#bfeaff', 0.8); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) { const px = 366 - i * 12; const py = rand(-12, 12); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
  }
  norm(ctx);
  ctx.restore();

  s.data.rec = rec;
}

/* ------------------------------------------------------------------ projectile */
function drawPlasmaBolt(ctx: C, p: { x: number; y: number; age: number }) {
  add(ctx);
  const r = 20 + Math.sin(p.age * 44) * 1.4;
  // long tail cone
  const tg = ctx.createLinearGradient(0, p.y, 0, p.y + 170);
  tg.addColorStop(0, 'rgba(210,250,255,.85)'); tg.addColorStop(0.4, 'rgba(90,180,255,.45)'); tg.addColorStop(1, 'rgba(40,110,255,0)');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(p.x - 22, p.y); ctx.quadraticCurveTo(p.x - 10, p.y + 90, p.x, p.y + 170); ctx.quadraticCurveTo(p.x + 10, p.y + 90, p.x + 22, p.y); ctx.closePath(); ctx.fill();
  drawGlow(ctx, p.x, p.y, 96, '#2a7bff', 0.45);
  drawGlow(ctx, p.x, p.y, 46, CY, 0.9);
  // plasma skin: puffy blobs made of glow sprites
  for (let i = 0; i < 6; i++) {
    const a = p.age * 9 + (i * TAU) / 6;
    const d = r * 0.62;
    drawGlow(ctx, p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.85, 12, CY, 0.8);
  }
  const cg = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 13);
  cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.7, 'rgba(200,245,255,1)'); cg.addColorStop(1, 'rgba(120,220,255,.6)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, TAU); ctx.fill();
  // orbiting energy rings
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(220,250,255,.95)'; ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) { const a = p.age * 16 + i * 2.1; ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.95, a, a + 1.1); ctx.stroke(); }
  // surface arcs
  ctx.strokeStyle = 'rgba(180,240,255,.9)'; ctx.lineWidth = 1.2;
  for (let k = 0; k < 4; k++) {
    const a = rand(0, TAU);
    ctx.beginPath(); ctx.moveTo(p.x, p.y);
    for (let i = 1; i <= 4; i++) { ctx.lineTo(p.x + Math.cos(a) * i * 9 + rand(-5, 5), p.y + Math.sin(a) * i * 9 + rand(-5, 5)); }
    ctx.stroke();
  }
  drawGlow(ctx, p.x, p.y, 10, '#ffffff', 1);
  norm(ctx);
}

/* ------------------------------------------------------------------ impact */
function plasmaBlast(g: Game, hx: number, hy: number) {
  const n = g.normalAt(hx, hy);
  g.hit(hx, hy, { power: 3, count: 3, chips: 26, kick: 1.8, stop: 0.09, shake: 10, flash: 0.85 });
  g.addEmbed(hx, hy, { kind: 'crater', color: '#222', glow: CY, size: 1.35, cracks: 10, cool: 2.8 });
  g.heatWheel(CY, 0.85);
  g.light(CY, 0.95);
  g.glow(hx, hy, 170, '#2a8bff', 0.45);
  g.glow(hx, hy, 70, '#ffffff', 0.22);
  // expanding plasma dome (flattened sphere with a rim)
  g.addFx({
    max: 0.55, add: true,
    draw: (ctx, k, fx) => {
      const e = easeOut(Math.min(1, fx.age / 0.12));
      const r = (18 + 96 * easeOut(k)) * e;
      const a = Math.pow(1 - k, 1.35);
      ctx.save(); ctx.translate(hx, hy); ctx.scale(1, 0.7);
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, `rgba(255,255,255,${0.5 * a})`);
      gr.addColorStop(0.55, `rgba(74,224,255,${0.35 * a})`);
      gr.addColorStop(1, 'rgba(42,123,255,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba('#e8fbff', 0.9 * a); ctx.lineWidth = (1 - k) * 8 + 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
      ctx.strokeStyle = rgba('#ffffff', a); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, TAU); ctx.stroke();
      ctx.restore();
    },
  });
  g.ring(hx, hy, 6, 200, CY, 0.5, 6, 0.45);
  g.ring(hx, hy, 3, 140, '#ffffff', 0.3, 3, 0.45);
  // ground burst column
  g.addFx({
    max: 0.4, add: true,
    draw: (ctx, k) => {
      const a = (1 - k) * (1 - k);
      const L = 260 * easeOut(Math.min(1, k * 2.2));
      const w = 15 * (1 - k * 0.5);
      const gr = ctx.createLinearGradient(0, hy, 0, hy - L);
      gr.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); gr.addColorStop(1, `rgba(74,224,255,${0.5 * a})`);
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.moveTo(hx - w, hy); ctx.lineTo(hx - w * 0.3, hy - L); ctx.lineTo(hx + w * 0.3, hy - L); ctx.lineTo(hx + w, hy); ctx.closePath(); ctx.fill();
    },
  });
  // arcs along the wheel + free arcs
  for (let i = 0; i < 2; i++) {
    const a0 = g.localAngle(hx, hy) + rand(0.3, 0.9) * (i ? 1 : -1);
    g.lightning(hx, hy, g.cx + Math.cos(g.wheel.angle + a0) * g.R * 0.97, g.wy + Math.sin(g.wheel.angle + a0) * g.R * 0.97, { color: '#9ff8ff', life: 0.28, width: 2, jag: 8 });
  }
  for (let i = 0; i < 4; i++) {
    const a = n + rand(-1.2, 1.2);
    g.lightning(hx, hy, hx + Math.cos(a) * rand(60, 130), hy + Math.sin(a) * rand(60, 130), { color: '#7adfff', life: 0.22, width: 1.7, jag: 9 });
  }
  const SL = ['#cfeeff', '#7adfff', '#2a7bff', '#131a2c'];
  g.burst(hx, hy, { n: 16, type: 'chip', ang: n, spread: 1.5, speed: [200, 640], life: [0.6, 1.2], size: [2, 4.4], pal: [SL[Math.min(3, Math.floor(Math.random() * 4))]], ay: 700, vr: 14 });
  g.burst(hx, hy, { n: 34, ang: n, spread: 1.55, speed: [240, 1000], life: [0.25, 0.7], size: [1, 2.8], pal: ['#ffffff', '#bfeaff', '#2a8bff'], len: 0.05, ay: 500 });
  for (let i = 0; i < 6; i++) g.spawn({ type: 'smoke', x: hx + rand(-22, 22), y: hy + rand(-6, 8), vx: rand(-70, 70), vy: rand(-110, -30), size: 8, size1: rand(26, 42), life: rand(0.8, 1.4), alpha: 0.25, pal: ['#9fb4c8', '#3a4a5a'], drag: 1.2 });
}

/* ------------------------------------------------------------------ weapon */
export const predatorCaster: Weapon = {
  id: 'plasmacaster-mk2', name: 'Predator Shoulder Caster', tag: 'Sci-Fi', sub: 'Plasmacaster · Titanium Servo Mount', accent: CY, isNew: true,
  desc: 'Armor titanium tempur dengan dudukan servo artikulasi dan modul segitiga tiga laser merah. Inti plasma menyala sementara tiga titik laser menyatu mengunci roda, lalu bola plasma biru-putih meledak jadi kubah energi.',
  hint: 'Tahan = kunci target & luncurkan plasma',
  muzzle: 366, muzzleY: 0, kick: 22, cooldown: 0.55,
  channel: true, minHold: 0.2,
  draw: drawShoulder,
  onSelect: (_g, s) => { s.data = { cyc: 0, auto: true, fired: false, rec: 0 }; },
  channelUpdate: (g, s, dt) => {
    const D = s.data;
    D.cyc = (D.cyc ?? 0) + dt;
    const lk = clamp(D.cyc / PERIOD);
    // charge glow at the muzzle while locking
    g.light(CY, 0.18 * lk);
    if (lk > 0.5 && Math.random() < dt * (lk * 80)) {
      const m = g.muzzlePos();
      const a = rand(0, TAU), rr2 = rand(20, 80);
      g.spawn({ type: 'glow', x: m.x + Math.cos(a) * rr2, y: m.y + Math.sin(a) * rr2, vx: -Math.cos(a) * rr2 * 4, vy: -Math.sin(a) * rr2 * 4, size: rand(1.6, 3), size1: 0, life: rand(0.12, 0.2), pal: ['#ffffff', CY] });
    }
    if (Math.random() < dt * 26 && (D.rec ?? 0) > 0.08) {
      const vent = g.lw(140 - (D.rec ?? 0) * 26, Math.random() < 0.5 ? 30 : -30);
      g.spawn({ type: 'smoke', x: vent.x, y: vent.y, vx: rand(-60, 30), vy: rand(-70, 10), size: 4, size1: rand(14, 24), life: rand(0.4, 0.8), alpha: 0.3, pal: ['#ffd9a0', '#4a4a58'], drag: 1.6 });
    }
    // after the lock, the burst fires by itself
    if (D.cyc >= PERIOD && lk >= 1 && !D.fired && D.auto) {
      D.fired = true; D.auto = false;
      s.recoil = 1; s.fireT = 0; s.shots++;
      const m = g.muzzlePos();
      g.muzzleFlash(m.x, m.y, { size: 66, color: CY, core: '#ffffff', spikes: 8, spread: 0.6, life: 0.12 });
      g.ring(m.x, m.y, 8, 100, '#bfeaff', 0.3, 5, 0.5);
      g.ring(m.x, m.y, 4, 60, '#ffffff', 0.22, 3, 0.5);
      g.glow(m.x, m.y, 120, '#2a8bff', 0.26);
      g.light(CY, 0.85); g.shake(6);
      for (let i = 0; i < 3; i++) g.lightning(m.x, m.y, m.x + rand(-60, 60), m.y - rand(30, 90), { color: CY, life: 0.14, width: 1.6, jag: 9 });
      g.addProj({
        x: m.x, y: m.y, vx: 0, vy: -1500,
        update: (gm, d2, p) => {
          if (Math.random() < d2 * 110) gm.spawn({ type: 'glow', x: p.x + rand(-8, 8), y: p.y + rand(0, 40), vx: rand(-30, 30), vy: rand(30, 150), size: rand(6, 12), size1: 0, life: rand(0.25, 0.45), pal: ['#e8ffff', CY, '#2a6bff'], alpha: 0.8 });
        },
        draw: (ctx, _g, p) => drawPlasmaBolt(ctx, p),
        onHit: (gm, hx, hy) => plasmaBlast(gm, hx, hy),
      });
    }
    // release / auto-off: wind down, reset cycle
    if ((lk >= 1 && s.minHold <= 0 && D.fired) || s.chan < 0.25) { D.cyc = 0; D.fired = false; D.auto = true; D.rec = s.recoil; }
  },

  drawOverlay: (ctx, g, s) => {
    if (!g.active) return;
    const a = g.aim();
    const D = s.data;
    const lk = lockOf(s, D.cyc ?? 0);
    const src = g.lw(252, -44);
    const cx = a.x, cy = a.y - 26;
    // energy for the dots: converge as the core charges (and ping when firing)
    const e = clamp((s.holding || D.auto) ? lk : s.ready * 1.15);
    const spread = 6 + 54 * (1 - e * e) - clamp(1 - s.fireT * 2) * 6;
    const dots: [number, number][] = [[0, spread * 0.8], [-spread * 0.8, -spread * 0.48], [spread * 0.8, -spread * 0.48]];
    add(ctx);
    const blink = e >= 1 ? (Math.sin(s.t * 24) > 0 ? 1 : 0.55) : 0.75;
    // guide lines from the laser module
    ctx.lineWidth = 1;
    for (const [dx, dy] of dots) {
      ctx.strokeStyle = rgba(RED, (0.1 + 0.1 * e) * blink);
      ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(cx + dx, cy + dy); ctx.stroke();
    }
    // triangle wireframe near the lock
    if (e > 0.7) {
      ctx.strokeStyle = rgba(RED, clamp((e - 0.7) * 3) * 0.7 * blink); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(dots[0][0] + cx, dots[0][1] + cy); ctx.lineTo(dots[1][0] + cx, dots[1][1] + cy); ctx.lineTo(dots[2][0] + cx, dots[2][1] + cy); ctx.closePath(); ctx.stroke();
    }
    // the three dots
    for (const [dx, dy] of dots) {
      drawGlow(ctx, cx + dx, cy + dy, 14, RED, 0.95 * blink);
      drawGlow(ctx, cx + dx, cy + dy, 5, '#ffffff', 0.9 * blink);
    }
    // drifting scan "dust" along one laser
    const u = (s.t * 0.8) % 1;
    ctx.fillStyle = rgba(RED, 0.5);
    ctx.beginPath(); ctx.arc(lerpN(src.x, cx + dots[0][0], u), lerpN(src.y, cy + dots[0][1], u), 1.6, 0, TAU); ctx.fill();
    // target ring tracker
    const rr2 = 26 - e * 10;
    ctx.strokeStyle = rgba(CY, 0.25 + 0.5 * e);
    ctx.lineWidth = 1.6;
    for (const ang of [0.3, 2.4, 4.5]) {
      ctx.beginPath(); ctx.arc(cx, cy, rr2, ang + s.t * 1.4, ang + s.t * 1.4 + 1.1); ctx.stroke();
    }
    norm(ctx);

    /* HUD near the muzzle */
    const m = g.muzzlePos();
    const my = Math.min(g.baseY - 8, m.y + 74);
    ctx.save();
    ctx.translate(m.x, my);
    ctx.globalAlpha = 0.9;
    ctx.font = '700 5.5px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(CY, 0.85);
    ctx.fillText(e >= 1 ? '[ TARGET LOCK ]' : `[ CHARGE ${(e * 100) | 0} ]`, 0, -8);
    for (let i = 0; i < 9; i++) {
      const on = e * 9 > i;
      ctx.fillStyle = on ? rgba(i < 6 ? CY : '#ffffff', 0.95) : 'rgba(120,140,160,.25)';
      ctx.save(); ctx.translate((i - 4) * 5.2, 0); ctx.transform(1, 0, -0.3, 1, 0, 0); ctx.fillRect(-1.8, -3, 3.6, 6); ctx.restore();
    }
    ctx.restore();
  },
};

function lerpN(a: number, b: number, u: number) { return a + (b - a) * u; }

void clamp; void drawGlow;
void norm; void add; void easeOut;
