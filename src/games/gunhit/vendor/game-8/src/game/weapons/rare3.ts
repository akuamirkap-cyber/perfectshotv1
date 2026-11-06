import type { Game } from '../engine';
import type { Weapon, WeaponState } from '../types';
import {
  GOLD, TAU, add, clamp, drawGlow, easeOut, metalBox, norm, rand, rgba, rr, vgrad,
} from '../util';

type C = CanvasRenderingContext2D;

/* ================================================================================= */
/*  1. HARMONIC DISRUPTOR — sonic dome waves, wheel shivers, ripples, resonance crack   */
/* ================================================================================= */
const PK = '#ff5fb0';

function drawHarmonic(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const kick = clamp(1 - s.fireT * 3.5);
  const DK = ['#7d7592', '#433d57', '#1c1829', '#0a0911'];
  const WH = ['#ffffff', '#eadff2', '#b3a4c4', '#5e5472'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 20, 92, ['#403a55', '#1d1a2c', '#0a0910']);
  ctx.beginPath(); ctx.moveTo(118, 20); ctx.lineTo(162, 20); ctx.lineTo(152, 86); ctx.lineTo(110, 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  add(ctx); ctx.fillStyle = rgba(PK, 0.45 + 0.4 * Math.sin(t * 5)); rr(ctx, 132, 30, 4, 50, 2); ctx.fill(); norm(ctx);
  ctx.strokeStyle = '#5a5470'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(170, 26); ctx.quadraticCurveTo(170, 52, 188, 50); ctx.quadraticCurveTo(204, 48, 204, 28); ctx.stroke();
  // stock with speaker cone
  ctx.fillStyle = vgrad(ctx, -28, 32, WH);
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(30, -30, 98, -27); ctx.lineTo(102, 20); ctx.lineTo(62, 22); ctx.quadraticCurveTo(26, 34, 0, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,60,.7)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = '#17131f'; ctx.beginPath(); ctx.arc(52, 2, 19, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.4; ctx.stroke();
  add(ctx);
  for (let i = 0; i < 3; i++) {
    const r = 15 - i * 4.6 + kick * Math.sin(t * 60) * 1.6 * (i % 2 ? 1 : -1);
    ctx.strokeStyle = rgba(PK, 0.5 + 0.4 * kick); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(52, 2, Math.max(1, r), 0, TAU); ctx.stroke();
  }
  drawGlow(ctx, 52, 2, 8 + 8 * kick, PK, 0.6);
  norm(ctx);
  // body
  metalBox(ctx, 96, -34, 176, 56, 12, WH, 0.55);
  ctx.fillStyle = '#0b0812'; rr(ctx, 108, -27, 112, 36, 5); ctx.fill();
  add(ctx);
  for (let i = 0; i < 17; i++) {
    const amp = (Math.sin(t * 7 + i * 0.8) * 0.5 + 0.5) * (0.3 + 0.7 * rd) + kick * 0.6;
    const h = Math.min(30, 3 + amp * 24);
    ctx.fillStyle = rgba(i < 11 ? PK : i < 15 ? '#ffb0dc' : '#ffffff', 0.92);
    ctx.fillRect(112 + i * 6.2, 6 - h, 4.2, h);
  }
  drawGlow(ctx, 164, -8, 64, PK, 0.12 + 0.2 * rd);
  norm(ctx);
  ctx.fillStyle = 'rgba(255,255,255,.09)'; rr(ctx, 110, -26, 108, 9, 4); ctx.fill();
  // tuning knob
  ctx.fillStyle = vgrad(ctx, -22, 6, ['#f4eef9', '#8f84a6', '#3a3450']);
  ctx.beginPath(); ctx.arc(244, -8, 13, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,50,.8)'; ctx.lineWidth = 1.4; ctx.stroke();
  const ka = -2.2 + Math.sin(t * 0.8) * 0.9 + kick * 1.5;
  ctx.strokeStyle = PK; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(244, -8); ctx.lineTo(244 + Math.cos(ka) * 10, -8 + Math.sin(ka) * 10); ctx.stroke();
  // coil rings
  for (let i = 0; i < 3; i++) metalBox(ctx, 268 + i * 9, -32, 6, 62, 2, DK, 0.4);
  // horn
  const hx0 = 292, hx1 = 352;
  ctx.beginPath();
  ctx.moveTo(hx0, -20); ctx.quadraticCurveTo(326, -24, hx1, -64); ctx.lineTo(hx1, 64); ctx.quadraticCurveTo(326, 24, hx0, 20); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -64, 64, ['#a89cb8', '#ffffff', '#cfc4dc', '#5e5472', '#a89cb8']);
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,30,60,.85)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.save();
  ctx.beginPath(); ctx.ellipse(hx1, 0, 11, 64, 0, 0, TAU);
  ctx.fillStyle = '#12091a'; ctx.fill();
  ctx.strokeStyle = '#f0e6f8'; ctx.lineWidth = 3; ctx.stroke();
  ctx.clip();
  add(ctx);
  drawGlow(ctx, hx1 - 4, 0, 80, PK, 0.35 + 0.5 * rd + 0.3 * kick);
  drawGlow(ctx, hx1 - 2, 0, 28, '#ffffff', 0.4 + 0.4 * kick);
  norm(ctx);
  ctx.restore();
  // pulsing sound arcs travelling through the horn
  add(ctx);
  for (let i = 0; i < 5; i++) {
    const u = (t * 1.6 + i / 5) % 1;
    const x = hx0 + u * (hx1 - hx0 - 4);
    const h = 18 + Math.pow(u, 1.6) * 42;
    ctx.strokeStyle = rgba(i % 2 ? '#ffffff' : PK, (1 - u * 0.4) * (0.3 + 0.7 * rd));
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(x, 0, 3 + u * 6, h, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  }
  drawGlow(ctx, hx1 + 6, 0, 34 + 30 * rd + 50 * kick, PK, 0.45);
  norm(ctx);
}

function sonicWave(ctx: C, p: { x: number; y: number; age: number }) {
  add(ctx);
  const n = 6;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const w = 34 + i * 10, h = 12 + i * 2.8;
    const a = (1 - k) * 0.95 + 0.05;
    const y = p.y + i * 30 + Math.sin(p.age * 30 - i * 1.2) * 2;
    ctx.strokeStyle = rgba(PK, a * 0.3); ctx.lineWidth = 13 * (1 - k * 0.6);
    ctx.beginPath(); ctx.ellipse(p.x, y, w, h, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.strokeStyle = rgba(i === 0 ? '#ffffff' : i % 2 ? '#ffd0ea' : '#ffe9f5', a); ctx.lineWidth = 4 * (1 - k * 0.6) + 1;
    ctx.beginPath(); ctx.ellipse(p.x, y, w, h, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  }
  drawGlow(ctx, p.x, p.y - 6, 56, PK, 0.5);
  drawGlow(ctx, p.x, p.y - 4, 20, '#ffffff', 0.7);
  norm(ctx);
}

function resonate(g: Game, hx: number, hy: number) {
  const la = g.localAngle(hx, hy);
  const pos = () => {
    const a = g.wheel.angle + la;
    return { x: g.cx + Math.cos(a) * g.R, y: g.wy + Math.sin(a) * g.R };
  };
  const n = g.normalAt(hx, hy);
  // the shock shoves airborne debris outward
  for (const q of g.parts) {
    const dx = q.x - hx, dy = q.y - hy, d = Math.hypot(dx, dy);
    if (d < 260 && d > 1) { const f = (1 - d / 260) * 520; q.vx += (dx / d) * f; q.vy += (dy / d) * f; }
  }
  g.hit(hx, hy, { power: 1.5, count: 1, chips: 10, kick: 1.2, shake: 4, stop: 0.04, flash: 0.45 });
  g.addEmbed(hx, hy, { kind: 'sonic', glow: PK, size: 1.15, cracks: 7, cool: 2.4 });
  g.heatWheel(PK, 0.3);
  g.light(PK, 0.6);
  g.ring(hx, hy, 6, 130, PK, 0.42, 6, 0.45);
  g.ring(hx, hy, 4, 90, '#ffffff', 0.3, 3, 0.45);
  g.ring(hx, hy, 60, 6, '#ffd0ea', 0.26, 2, 0.45);
  g.glow(hx, hy, 100, PK, 0.26);
  g.burst(hx, hy, { n: 24, ang: n, spread: 1.5, speed: [180, 620], life: [0.2, 0.55], size: [1, 2.4], pal: ['#ffffff', '#ffd0ea', PK], len: 0.05, ay: 300 });
  let done = false;
  g.addFx({
    max: 1.0, add: true,
    draw: (ctx, k, fx) => {
      ctx.beginPath(); ctx.arc(g.cx, g.wy, g.R - 2, 0, TAU); ctx.clip();
      for (let i = 0; i < 7; i++) {
        const r = fx.age * 620 - i * 24;
        if (r < 3) continue;
        const a = clamp(1 - r / 330) * (1 - i / 8) * (1 - k * 0.5);
        ctx.strokeStyle = rgba(i % 2 ? PK : '#ffffff', a * 0.9); ctx.lineWidth = Math.max(0.6, 3.4 - i * 0.32);
        ctx.beginPath(); ctx.arc(hx, hy, r, 0, TAU); ctx.stroke();
      }
      // reflection from the far rim
      const mx = 2 * g.cx - hx, my = 2 * g.wy - hy;
      for (let i = 0; i < 5; i++) {
        const r = (fx.age - 0.2) * 560 - i * 26;
        if (r < 3) continue;
        const a = clamp(1 - r / 330) * (1 - i / 6) * (1 - k * 0.5);
        ctx.strokeStyle = rgba(i % 2 ? '#ffd0ea' : PK, a * 0.7); ctx.lineWidth = Math.max(0.6, 2.6 - i * 0.35);
        ctx.beginPath(); ctx.arc(mx, my, r, 0, TAU); ctx.stroke();
      }
    },
    update: (_dt, fx) => {
      if (g.state !== 'play') { fx.age = fx.max; return; }
      if (fx.age < 0.5) g.wheel.shiver = Math.max(g.wheel.shiver, 3.2 * (1 - fx.age / 0.5));
      if (!done && fx.age > 0.4) {
        done = true;
        if (!g.active) return;
        const p = pos();
        const nn = g.normalAt(p.x, p.y);
        g.hit(p.x, p.y, { power: 1.2, count: 1, chips: 16, kick: 1, shake: 7, stop: 0.05, flash: 0.5 });
        g.light(PK, 0.7);
        g.ring(p.x, p.y, 6, 150, PK, 0.45, 6, 0.45);
        g.ring(p.x, p.y, 4, 100, '#ffffff', 0.3, 3, 0.45);
        g.glow(p.x, p.y, 90, PK, 0.24);
        g.burst(p.x, p.y, { n: 26, ang: nn, spread: 1.5, speed: [200, 700], life: [0.2, 0.6], size: [1, 2.6], pal: ['#ffffff', '#ffd0ea', PK], len: 0.05, ay: 350 });
        g.burst(p.x, p.y, { n: 8, type: 'glow', ang: nn, spread: 1.6, speed: [60, 240], life: [0.4, 0.9], size: [3, 7], size1: 0, pal: [PK, '#7a2a5a'] });
      }
    },
  });
}

export const harmonicWeapon: Weapon = {
  id: 'harmonic', name: 'Harmonic Disruptor', tag: 'Langka', sub: 'Resonance Shockwave Cannon', accent: PK,
  desc: 'Terompet resonansi dengan equalizer hidup. Gelombang suara berbentuk kubah menghantam roda: kayu bergetar, riak menjalar dan memantul dari tepi seberang, lalu resonansi susulan meretakkan roda sekali lagi.',
  hint: 'Klik = tembak gelombang suara',
  muzzle: 360, muzzleY: 0, kick: 14, cooldown: 0.75,
  draw: drawHarmonic,
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 30, color: PK, core: '#ffffff', spikes: 4, spread: 0.5, life: 0.06 });
    for (let i = 0; i < 4; i++) g.ring(m.x, m.y - i * 6, 6, 70 + i * 18, i % 2 ? '#ffffff' : PK, 0.28 + i * 0.04, 3 - i * 0.4, 0.32);
    g.light(PK, 0.45); g.shake(2.5);
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -1650,
      update: (gm, dt, p) => {
        if (Math.random() < dt * 45) gm.spawn({ type: 'glow', x: p.x + rand(-40, 40), y: p.y + rand(0, 60), size: rand(2, 4), size1: 0, life: 0.3, pal: ['#ffffff', PK], alpha: 0.7 });
      },
      draw: (ctx, _g, p) => sonicWave(ctx, p),
      onHit: (gm, hx, hy) => resonate(gm, hx, hy),
    });
  },
};

/* ================================================================================= */
/*  2. ABSOLUTE ZERO — cryo crystal lance: ice shards, frost snowflakes, cold mist     */
/* ================================================================================= */
const ICE = '#aee8ff';

function drawSnow(ctx: C, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = (k * TAU) / 6;
    const c = Math.cos(a), sn = Math.sin(a);
    ctx.moveTo(0, 0); ctx.lineTo(c * r, sn * r);
    for (const f of [0.5, 0.75]) {
      const bx = c * r * f, by = sn * r * f, bl = r * (f === 0.5 ? 0.34 : 0.22);
      ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + 0.9) * bl, by + Math.sin(a + 0.9) * bl);
      ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - 0.9) * bl, by + Math.sin(a - 0.9) * bl);
    }
  }
  ctx.stroke();
  ctx.restore();
}

function rime(ctx: C, x0: number, x1: number, y: number, dir: number, seed: number) {
  ctx.fillStyle = 'rgba(240,250,255,.92)';
  ctx.beginPath(); ctx.moveTo(x0, y);
  for (let x = x0; x < x1; x += 4) {
    const h = 2 + (Math.sin(x * 1.9 + seed * 3) * 0.5 + 0.5) * 5 + (Math.sin(x * 0.37 + seed) * 0.5 + 0.5) * 3;
    ctx.lineTo(x, y); ctx.lineTo(x + 2, y + dir * h);
  }
  ctx.lineTo(x1, y); ctx.closePath(); ctx.fill();
}

function drawCryo(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const WH = ['#ffffff', '#e3eef8', '#a3b6cc', '#55637a'];
  const DK = ['#5e7088', '#2f3a4c', '#141a26', '#080b12'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 20, 92, ['#38465a', '#1a2230', '#090c12']);
  ctx.beginPath(); ctx.moveTo(118, 20); ctx.lineTo(162, 20); ctx.lineTo(152, 86); ctx.lineTo(110, 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  add(ctx); ctx.fillStyle = rgba(ICE, 0.45 + 0.35 * Math.sin(t * 4)); rr(ctx, 132, 30, 4, 50, 2); ctx.fill(); norm(ctx);
  ctx.strokeStyle = '#6a7c94'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(170, 26); ctx.quadraticCurveTo(170, 52, 188, 50); ctx.quadraticCurveTo(204, 48, 204, 28); ctx.stroke();
  // stock + emblem
  ctx.fillStyle = vgrad(ctx, -28, 32, WH);
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(30, -30, 98, -27); ctx.lineTo(102, 20); ctx.lineTo(62, 22); ctx.quadraticCurveTo(26, 34, 0, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,60,90,.7)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.strokeStyle = 'rgba(70,120,180,.85)'; ctx.lineWidth = 1.8;
  drawSnow(ctx, 50, 2, 17, t * 0.15);
  add(ctx); drawGlow(ctx, 50, 2, 26, ICE, 0.18 + 0.18 * rd); norm(ctx);
  rime(ctx, 14, 92, -24, 1, 5);
  // body
  metalBox(ctx, 96, -34, 170, 56, 12, WH, 0.55);
  ctx.fillStyle = '#07131c'; rr(ctx, 150, -22, 88, 22, 6); ctx.fill();
  add(ctx);
  ctx.fillStyle = rgba(ICE, 0.18 + 0.2 * rd); rr(ctx, 152, -20, 84, 18, 5); ctx.fill();
  ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 70;
  ctx.strokeStyle = rgba(ICE, 0.85); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(156, -11); ctx.lineTo(232, -11); ctx.stroke(); ctx.setLineDash([]);
  norm(ctx);
  ctx.strokeStyle = 'rgba(70,120,180,.8)'; ctx.lineWidth = 1.6;
  drawSnow(ctx, 124, -8, 11, 0);
  // cryo tank
  metalBox(ctx, 112, -78, 12, 44, 4, WH, 0.5);
  metalBox(ctx, 244, -78, 12, 44, 4, WH, 0.5);
  ctx.fillStyle = vgrad(ctx, -74, -36, ['#122434', '#071018']);
  rr(ctx, 124, -74, 120, 36, 12); ctx.fill();
  ctx.save();
  rr(ctx, 124, -74, 120, 36, 12); ctx.clip();
  const lvl = 0.3 + 0.7 * rd;
  const top = -38 - 36 * lvl;
  ctx.beginPath(); ctx.moveTo(124, -38);
  for (let x = 124; x <= 244; x += 4) ctx.lineTo(x, top + Math.sin(x * 0.12 + t * 3) * 1.8);
  ctx.lineTo(244, -38); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, top, -38, ['rgba(200,244,255,.96)', 'rgba(80,180,245,.92)', 'rgba(20,90,200,.92)']);
  ctx.fill();
  add(ctx);
  for (let i = 0; i < 10; i++) {
    const bx = 130 + ((i * 37) % 108);
    const by = -38 - ((t * (14 + (i % 4) * 6) + i * 11) % Math.max(4, 36 * lvl));
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    ctx.beginPath(); ctx.arc(bx, by, 1.2 + (i % 3) * 0.7, 0, TAU); ctx.fill();
  }
  drawGlow(ctx, 184, -56, 84, ICE, 0.2 + 0.25 * rd);
  norm(ctx);
  ctx.fillStyle = 'rgba(255,255,255,.2)'; rr(ctx, 130, -71, 108, 6, 3); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1.6; rr(ctx, 124, -74, 120, 36, 12); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(134 + i * 12, -74); ctx.lineTo(134 + i * 12, -70); ctx.stroke(); }
  rime(ctx, 126, 242, -74, -1, 1);
  // barrel
  metalBox(ctx, 262, -14, 96, 28, 6, WH, 0.5);
  for (let i = 0; i < 4; i++) metalBox(ctx, 272 + i * 20, -25, 7, 50, 2, DK, 0.4);
  add(ctx);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = rgba(ICE, 0.3 + 0.55 * rd); ctx.fillRect(280 + i * 20, -8, 11, 16); }
  norm(ctx);
  rime(ctx, 264, 356, -14, -1, 3);
  rime(ctx, 264, 356, 14, 1, 7);
  // nozzle
  ctx.beginPath();
  ctx.moveTo(356, -14); ctx.lineTo(380, -27); ctx.lineTo(397, -18); ctx.lineTo(397, 18); ctx.lineTo(380, 27); ctx.lineTo(356, 14); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -27, 27, ['#e8f2fa', '#8da3bb', '#2f3a4c']); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#04101a'; ctx.beginPath(); ctx.ellipse(397, 0, 5, 16, 0, 0, TAU); ctx.fill();
  add(ctx);
  drawGlow(ctx, 399, 0, 20 + 28 * rd, ICE, 0.5 + 0.5 * rd);
  drawGlow(ctx, 399, 0, 8, '#ffffff', 0.9);
  ctx.strokeStyle = rgba('#ffffff', 0.55 + 0.4 * rd); ctx.lineWidth = 1.6;
  drawSnow(ctx, 399, 0, 9 + 8 * rd, t * 0.8);
  norm(ctx);
}

function iceShard(ctx: C, p: { x: number; y: number; age: number }) {
  add(ctx);
  const tg = ctx.createLinearGradient(0, p.y, 0, p.y + 190);
  tg.addColorStop(0, 'rgba(210,244,255,.65)'); tg.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(p.x - 11, p.y + 6); ctx.lineTo(p.x, p.y + 190); ctx.lineTo(p.x + 11, p.y + 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(p.x, p.y + 10); ctx.lineTo(p.x, p.y + 90); ctx.stroke();
  drawGlow(ctx, p.x, p.y + 14, 42, '#8fe0ff', 0.55);
  norm(ctx);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.lineJoin = 'round';
  // small satellite shards
  for (const sg of [-1, 1]) {
    ctx.save(); ctx.translate(sg * 15, 18 + Math.sin(p.age * 20 + sg) * 2); ctx.rotate(sg * 0.35);
    ctx.fillStyle = 'rgba(200,238,255,.9)';
    ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(3.6, 0); ctx.lineTo(0, 9); ctx.lineTo(-3.6, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.restore();
  }
  // main crystal, two lit facets
  const L = ctx.createLinearGradient(-10, 0, 0, 0);
  L.addColorStop(0, '#9fdcff'); L.addColorStop(1, '#ffffff');
  ctx.fillStyle = L;
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(-10, -4); ctx.lineTo(-5, 24); ctx.lineTo(0, 38); ctx.closePath(); ctx.fill();
  const R = ctx.createLinearGradient(0, 0, 10, 0);
  R.addColorStop(0, '#6fb8ec'); R.addColorStop(1, '#2d78bd');
  ctx.fillStyle = R;
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(10, -4); ctx.lineTo(5, 24); ctx.lineTo(0, 38); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(-10, -4); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(20,70,130,.35)';
  ctx.beginPath(); ctx.moveTo(10, -4); ctx.lineTo(5, 24); ctx.lineTo(0, 12); ctx.lineTo(0, 2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(-10, -4); ctx.lineTo(-5, 24); ctx.lineTo(0, 38); ctx.lineTo(5, 24); ctx.lineTo(10, -4); ctx.closePath(); ctx.moveTo(0, -32); ctx.lineTo(0, 38); ctx.stroke();
  ctx.restore();
  add(ctx);
  const f = 0.7 + 0.3 * Math.sin(p.age * 30);
  ctx.strokeStyle = rgba('#ffffff', 0.9 * f); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(p.x - 20, p.y - 30); ctx.lineTo(p.x + 20, p.y - 30); ctx.moveTo(p.x, p.y - 48); ctx.lineTo(p.x, p.y - 14); ctx.stroke();
  drawGlow(ctx, p.x, p.y - 30, 12, '#ffffff', 0.9 * f);
  norm(ctx);
}

function frostBurst(g: Game, hx: number, hy: number) {
  const n = g.normalAt(hx, hy);
  g.hit(hx, hy, { power: 1.5, chips: 6, kick: 1, stop: 0.05, shake: 4, flash: 0.5 });
  g.addEmbed(hx, hy, { kind: 'frost', glow: '#cfeeff', size: rand(1, 1.2), cool: 2.4 });
  g.heatWheel('#8fd8ff', 0.3);
  g.light('#cfeeff', 0.6);
  g.ring(hx, hy, 5, 120, '#cfeeff', 0.4, 5, 0.45);
  g.ring(hx, hy, 4, 80, '#ffffff', 0.28, 3, 0.45);
  g.glow(hx, hy, 96, '#9fe0ff', 0.28);
  // flying crystal shards (solid) + sparkles
  g.burst(hx, hy, { n: 14, type: 'chip', ang: n, spread: 1.5, speed: [160, 560], life: [0.6, 1.2], size: [2, 4.2], pal: ['#ffffff', '#cfeeff', '#8fc8f0', '#4a8ccc'], ay: 560, vr: 14, rpal: true });
  g.burst(hx, hy, { n: 26, type: 'cube', ang: n, spread: 1.55, speed: [140, 620], life: [0.5, 1.1], size: [1.2, 3], size1: 0.4, pal: ['#ffffff', '#cfeeff', '#7aa8ff'], vr: 14, ay: 380 });
  g.burst(hx, hy, { n: 20, ang: n, spread: 1.55, speed: [200, 760], life: [0.2, 0.5], size: [1, 2.2], pal: ['#ffffff', '#cfeeff'], len: 0.05, ay: 300 });
  // heavy cold mist that sinks
  for (let i = 0; i < 9; i++) {
    g.spawn({
      type: 'smoke', x: hx + rand(-26, 26), y: hy + rand(-4, 8), vx: rand(-60, 60), vy: rand(10, 70), ay: 30,
      size: 8, size1: rand(30, 46), life: rand(0.9, 1.6), alpha: 0.3, pal: ['#eaf8ff', '#7f9fbd'], drag: 1.5,
    });
  }
  // frost creeping across the wood
  g.addFx({
    max: 0.9, add: true,
    draw: (ctx, k) => {
      ctx.beginPath(); ctx.arc(g.cx, g.wy, g.R - 2, 0, TAU); ctx.clip();
      const e = easeOut(Math.min(1, k * 1.6));
      const r = 20 + 160 * e;
      const gr = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
      gr.addColorStop(0, `rgba(255,255,255,${0.55 * (1 - k)})`);
      gr.addColorStop(0.7, `rgba(200,236,255,${0.28 * (1 - k)})`);
      gr.addColorStop(1, 'rgba(200,236,255,0)');
      ctx.fillStyle = gr; ctx.fillRect(hx - r, hy - r, r * 2, r * 2);
      ctx.strokeStyle = rgba('#ffffff', 0.9 * (1 - k)); ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < 9; i++) {
        const ang = n + Math.PI + (i - 4) * 0.36;
        const L = r * (0.75 + 0.25 * Math.sin(i * 7));
        const c = Math.cos(ang), sn = Math.sin(ang);
        ctx.moveTo(hx, hy); ctx.lineTo(hx + c * L, hy + sn * L);
        for (const b of [0.35, 0.6, 0.82]) {
          const bx = hx + c * L * b, by = hy + sn * L * b, bl = L * 0.2 * (1 - b * 0.4);
          ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ang + 0.9) * bl, by + Math.sin(ang + 0.9) * bl);
          ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ang - 0.9) * bl, by + Math.sin(ang - 0.9) * bl);
        }
      }
      ctx.stroke();
    },
  });
}

export const cryoWeapon: Weapon = {
  id: 'absolute-zero', name: 'Absolute Zero', tag: 'Langka', sub: 'Cryo-Crystal Lance', accent: '#9fe4ff',
  desc: 'Tangki kriogenik bergelembung dan laras berembun. Menembakkan pecahan kristal es bersegi yang membekukan kayu menjadi kepingan salju, disusul kabut dingin yang turun dan serpihan es berkilau.',
  hint: 'Klik = tembak kristal es',
  muzzle: 398, muzzleY: 0, kick: 12, cooldown: 0.6,
  draw: drawCryo,
  update: (g, s, dt) => {
    const rate = 7 + 14 * clamp(1 - s.fireT * 1.5);
    if (Math.random() < dt * rate) {
      const p = g.lw(396, 0);
      g.spawn({ type: 'smoke', x: p.x + rand(-6, 6), y: p.y, vx: rand(-30, 30), vy: rand(10, 60), size: 4, size1: rand(14, 24), life: rand(0.7, 1.2), alpha: 0.2, pal: ['#eaf8ff', '#8fb4d6'], drag: 1.4 });
    }
    if (Math.random() < dt * 5) {
      const p = g.lw(rand(130, 240), -74);
      g.spawn({ type: 'smoke', x: p.x, y: p.y, vx: rand(-14, 14), vy: rand(-30, -8), size: 3, size1: rand(10, 18), life: rand(0.8, 1.3), alpha: 0.16, pal: ['#eaf8ff', '#8fb4d6'], drag: 1 });
    }
  },
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 34, color: ICE, core: '#ffffff', spikes: 6, spread: 0.6, life: 0.08 });
    g.light('#bfefff', 0.4);
    g.burst(m.x, m.y, { n: 14, type: 'glow', ang: -Math.PI / 2, spread: 0.7, speed: [80, 320], life: [0.3, 0.8], size: [2, 4], size1: 0, pal: ['#ffffff', '#bfefff', '#7aa8ff'] });
    for (let i = 0; i < 7; i++) g.spawn({ type: 'smoke', x: m.x + rand(-8, 8), y: m.y, vx: rand(-90, 90), vy: rand(-120, 40), size: 6, size1: rand(22, 36), life: rand(0.6, 1.1), alpha: 0.3, pal: ['#eaf8ff', '#8fb4d6'], drag: 2 });
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -2000,
      update: (gm, dt, p) => {
        if (Math.random() < dt * 90) gm.spawn({ type: 'cube', x: p.x + rand(-10, 10), y: p.y + rand(6, 50), vx: rand(-20, 20), vy: rand(10, 80), size: rand(1, 2.4), size1: 0, life: rand(0.3, 0.6), pal: ['#ffffff', '#bfefff'], vr: 8 });
        if (Math.random() < dt * 40) gm.spawn({ type: 'smoke', x: p.x, y: p.y + 20, vx: rand(-20, 20), vy: rand(10, 50), size: 3, size1: 14, life: 0.5, alpha: 0.14, pal: ['#eaf8ff'] });
      },
      draw: (ctx, _g, p) => iceShard(ctx, p),
      onHit: (gm, hx, hy) => frostBurst(gm, hx, hy),
    });
  },
};

/* ================================================================================= */
/*  3. HELIOS FLARE CANNON — a miniature star; impact raises solar prominence loops    */
/* ================================================================================= */
const FLAME = ['#fff9e0', '#ffd84a', '#ff7a1a', '#c4260f', '#3a0e0a'];
const SOL = '#ffc83a';

function drawStar(ctx: C, x: number, y: number, r: number, t: number, heat = 1) {
  if (r < 1) return;
  add(ctx);
  drawGlow(ctx, x, y, r * 3.4, '#ff8a1a', 0.35 * heat);
  drawGlow(ctx, x, y, r * 2.1, '#ffd04a', 0.5 * heat);
  norm(ctx);
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#fff2a8'); g.addColorStop(0.65, '#ffc238'); g.addColorStop(0.9, '#ff7a1a'); g.addColorStop(1, '#c8400e');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  for (let i = 0; i < 18; i++) {
    const a = i * 2.399 + t * 0.25 * (1 + (i % 3) * 0.25);
    const d = r * (0.15 + 0.75 * ((i * 0.37) % 1));
    const bx = x + Math.cos(a) * d, by = y + Math.sin(a) * d;
    ctx.fillStyle = i % 2 ? 'rgba(200,70,10,.32)' : 'rgba(255,252,210,.4)';
    ctx.beginPath(); ctx.arc(bx, by, r * (0.12 + ((i * 0.23) % 0.14)), 0, TAU); ctx.fill();
  }
  const limb = ctx.createRadialGradient(x, y, r * 0.55, x, y, r);
  limb.addColorStop(0, 'rgba(120,30,0,0)'); limb.addColorStop(1, 'rgba(120,30,0,.5)');
  ctx.fillStyle = limb; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
  add(ctx);
  ctx.lineCap = 'round';
  for (let j = 0; j < 3; j++) {
    const a = t * 0.3 + j * 2.1;
    const bulge = r * (0.5 + 0.25 * Math.sin(t * 2 + j));
    const a1 = a + 0.55;
    const p0 = [x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95];
    const p1 = [x + Math.cos(a1) * r * 0.95, y + Math.sin(a1) * r * 0.95];
    const c0 = [x + Math.cos(a) * (r + bulge * 1.3), y + Math.sin(a) * (r + bulge * 1.3)];
    const c1 = [x + Math.cos(a1) * (r + bulge * 1.3), y + Math.sin(a1) * (r + bulge * 1.3)];
    ctx.strokeStyle = rgba('#ff8a1a', 0.35 * heat); ctx.lineWidth = r * 0.22;
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.bezierCurveTo(c0[0], c0[1], c1[0], c1[1], p1[0], p1[1]); ctx.stroke();
    ctx.strokeStyle = rgba('#fff0b0', 0.85 * heat); ctx.lineWidth = r * 0.07;
    ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.bezierCurveTo(c0[0], c0[1], c1[0], c1[1], p1[0], p1[1]); ctx.stroke();
  }
  norm(ctx);
}

function drawHelios(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const heat = 0.35 + 0.65 * rd;
  const DK = ['#7a6552', '#403229', '#1b1410', '#0a0705'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 24, 94, ['#4a3c30', '#231a14', '#0c0806']);
  ctx.beginPath(); ctx.moveTo(122, 24); ctx.lineTo(168, 24); ctx.lineTo(158, 88); ctx.lineTo(114, 94); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(240,192,80,.7)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(126, 38 + i * 10); ctx.lineTo(162 - i * 1.5, 38 + i * 10); ctx.stroke(); }
  ctx.strokeStyle = '#8a7358'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(176, 30); ctx.quadraticCurveTo(176, 56, 194, 54); ctx.quadraticCurveTo(210, 52, 210, 32); ctx.stroke();
  // stock with radiator fins
  ctx.fillStyle = vgrad(ctx, -30, 36, DK);
  ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(34, -34, 100, -34); ctx.lineTo(104, 24); ctx.lineTo(62, 26); ctx.quadraticCurveTo(26, 38, 0, 34); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.3; ctx.stroke();
  for (let i = 0; i < 6; i++) metalBox(ctx, 12 + i * 13, -28, 6, 50, 2, GOLD, 0.5);
  add(ctx);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = rgba('#ff7a1a', 0.12 + 0.35 * heat * (0.6 + 0.4 * Math.sin(t * 3 + i))); ctx.fillRect(14 + i * 13, -24, 2.4, 42); }
  norm(ctx);
  // housing
  metalBox(ctx, 96, -52, 186, 80, 16, DK, 0.35);
  metalBox(ctx, 100, -58, 178, 8, 3, GOLD, 0.5);
  metalBox(ctx, 100, 22, 178, 8, 3, GOLD, 0.5);
  // star window
  const sx = 190, sy = -12;
  ctx.fillStyle = '#060302'; ctx.beginPath(); ctx.arc(sx, sy, 41, 0, TAU); ctx.fill();
  drawStar(ctx, sx, sy, 22 + 13 * rd, t, heat);
  // containment rings
  add(ctx);
  ctx.save(); ctx.translate(sx, sy);
  for (let k = 0; k < 2; k++) {
    ctx.save(); ctx.rotate(t * (0.7 + 0.4 * k) + k * 1.2);
    ctx.strokeStyle = rgba('#ffe08a', 0.85); ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.ellipse(0, 0, 46, 15 + k * 7, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  norm(ctx);
  ctx.strokeStyle = vgrad(ctx, sy - 44, sy + 44, GOLD); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(sx, sy, 43, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(70,40,5,.8)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(sx, sy, 46, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.1)';
  ctx.beginPath(); ctx.ellipse(sx - 14, sy - 22, 18, 8, -0.5, 0, TAU); ctx.fill();
  // vents
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  for (let i = 0; i < 5; i++) rr(ctx, 240 + i * 8, -46, 4, 12, 2), ctx.fill();
  add(ctx);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba('#ff9a2a', 0.2 + 0.7 * heat * (0.6 + 0.4 * Math.sin(t * 9 + i))); rr(ctx, 241 + i * 8, -44, 2.4, 8, 1); ctx.fill(); }
  norm(ctx);
  // magnetic rails
  metalBox(ctx, 276, -20, 120, 40, 6, DK, 0.35);
  for (const sg of [-1, 1]) {
    const y0 = sg < 0 ? -34 : 20;
    metalBox(ctx, 282, y0, 100, 14, 4, DK, 0.4);
    for (let i = 0; i < 7; i++) metalBox(ctx, 288 + i * 13, y0 - 2, 5, 18, 1, GOLD, 0.5);
    ctx.fillStyle = vgrad(ctx, sg * 8 - 10, sg * 30, ['#c8b090', '#6a5540', '#1a1410']);
    ctx.beginPath(); ctx.moveTo(380, sg * 14); ctx.lineTo(412, sg * 6); ctx.lineTo(414, sg * 12); ctx.lineTo(382, sg * 32); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.fillStyle = '#050201'; rr(ctx, 276, -8, 130, 16, 5); ctx.fill();
  add(ctx);
  const cg = ctx.createLinearGradient(278, 0, 410, 0);
  cg.addColorStop(0, rgba('#ff7a1a', 0.3 + 0.4 * heat)); cg.addColorStop(1, rgba('#fff4c8', 0.7 + 0.3 * heat));
  ctx.fillStyle = cg; rr(ctx, 278, -4, 128, 8, 3); ctx.fill();
  for (let i = 0; i < 4; i++) {
    const x = 284 + (((t * 1.3 + i / 4) % 1) * 120);
    drawGlow(ctx, x, 0, 9, '#fff0b0', 0.6 * heat);
  }
  norm(ctx);
  // muzzle star
  drawStar(ctx, 410, 0, 6 + 9 * rd, t * 2, heat);
  add(ctx);
  ctx.strokeStyle = rgba('#fff4c8', 0.4 + 0.4 * rd); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(380, 0); ctx.lineTo(446, 0); ctx.moveTo(410, -24); ctx.lineTo(410, 24); ctx.stroke();
  norm(ctx);
}

function sunBolt(ctx: C, p: { x: number; y: number; age: number }) {
  add(ctx);
  const tg = ctx.createLinearGradient(0, p.y, 0, p.y + 230);
  tg.addColorStop(0, 'rgba(255,240,180,.85)'); tg.addColorStop(0.35, 'rgba(255,150,40,.5)'); tg.addColorStop(1, 'rgba(200,50,10,0)');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(p.x - 20, p.y);
  ctx.quadraticCurveTo(p.x - 14 + Math.sin(p.age * 30) * 5, p.y + 110, p.x, p.y + 230);
  ctx.quadraticCurveTo(p.x + 14 + Math.cos(p.age * 27) * 5, p.y + 110, p.x + 20, p.y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,210,90,.55)';
  for (let i = 0; i < 12; i++) {
    const a = p.age * 2.2 + (i * TAU) / 12;
    const l = 40 + (i % 2) * 20 + Math.sin(p.age * 20 + i) * 5, w = 0.1;
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(a - w) * 14, p.y + Math.sin(a - w) * 14);
    ctx.lineTo(p.x + Math.cos(a) * l, p.y + Math.sin(a) * l);
    ctx.lineTo(p.x + Math.cos(a + w) * 14, p.y + Math.sin(a + w) * 14);
    ctx.closePath(); ctx.fill();
  }
  drawGlow(ctx, p.x, p.y, 72, '#ff9a2a', 0.35);
  norm(ctx);
  drawStar(ctx, p.x, p.y, 19 + Math.sin(p.age * 26) * 1.2, p.age * 3, 1.2);
}

function solarFlare(g: Game, hx: number, hy: number) {
  const la = g.localAngle(hx, hy);
  const n = g.normalAt(hx, hy);
  g.hit(hx, hy, { power: 2.4, count: 2, chips: 20, kick: 1.5, stop: 0.08, shake: 10, flash: 0.9 });
  g.addEmbed(hx, hy, { kind: 'solar', glow: SOL, size: 1.35, cool: 3.2, fire: 2.2 });
  g.heatWheel('#ffb02e', 0.65);
  g.light('#ffb02e', 1);
  g.ring(hx, hy, 6, 220, '#ffb02e', 0.55, 8, 0.45);
  g.ring(hx, hy, 4, 140, '#ffffff', 0.34, 4, 0.45);
  g.ring(hx, hy, 2, 280, '#ff6a1a', 0.7, 3, 0.45);
  g.glow(hx, hy, 160, '#ff9a2a', 0.4);
  g.glow(hx, hy, 70, '#ffffff', 0.18);
  g.burst(hx, hy, { n: 34, type: 'flame', ang: n, spread: 1.55, speed: [180, 620], life: [0.4, 0.8], size: [14, 24], size1: [30, 52], pal: FLAME, turb: 260, ay: -260, drag: 1.8, alpha: 0.85 });
  g.burst(hx, hy, { n: 40, ang: n, spread: 1.6, speed: [240, 900], life: [0.3, 0.9], size: [1, 2.8], pal: ['#ffffff', '#fff0b0', '#ffb02e', '#ff5a1a'], len: 0.05, ay: 500 });
  for (let i = 0; i < 7; i++) g.spawn({ type: 'smoke', x: hx + rand(-26, 26), y: hy + rand(-4, 10), vx: rand(-80, 80), vy: rand(-110, -20), size: 8, size1: rand(26, 44), life: rand(0.9, 1.5), alpha: 0.28, pal: ['#3c3330', '#15110f'], drag: 1.2 });
  // lens-flare streaks
  g.addFx({
    max: 0.42, add: true,
    draw: (ctx, k) => {
      const a = 1 - k;
      const L = 300 * easeOut(Math.min(1, k * 3));
      const gx = ctx.createLinearGradient(hx - L, hy, hx + L, hy);
      gx.addColorStop(0, 'rgba(255,200,80,0)'); gx.addColorStop(0.5, `rgba(255,255,240,${a})`); gx.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = gx; ctx.fillRect(hx - L, hy - 3 * a - 0.5, L * 2, 6 * a + 1);
      const V = 140 * easeOut(Math.min(1, k * 3));
      const gy = ctx.createLinearGradient(hx, hy - V, hx, hy + V);
      gy.addColorStop(0, 'rgba(255,200,80,0)'); gy.addColorStop(0.5, `rgba(255,255,240,${a * 0.8})`); gy.addColorStop(1, 'rgba(255,200,80,0)');
      ctx.fillStyle = gy; ctx.fillRect(hx - 2 * a - 0.5, hy - V, 4 * a + 1, V * 2);
      drawGlow(ctx, hx, hy, 130 * a + 30, '#ffb02e', 0.8 * a);
    },
  });
  // prominence loops rising off the wheel surface
  const loops = [[0.1, 70], [0.17, 112], [0.26, 150], [0.06, 44]];
  g.addFx({
    max: 1.3, add: true,
    draw: (ctx, _k, fx) => {
      const w = g.wheel;
      const a0 = w.angle + la;
      const grow = easeOut(clamp(fx.age / 0.28));
      const fade = 1 - clamp((fx.age - 0.5) / 0.8);
      if (fade <= 0.01) return;
      const nx = Math.cos(a0), ny = Math.sin(a0);
      ctx.lineCap = 'round';
      loops.forEach(([dl, h], idx) => {
        const aL = a0 - dl, aR = a0 + dl;
        const P1 = [g.cx + Math.cos(aL) * g.R, g.wy + Math.sin(aL) * g.R];
        const P2 = [g.cx + Math.cos(aR) * g.R, g.wy + Math.sin(aR) * g.R];
        const C1 = [P1[0] + nx * h * 1.3 * grow, P1[1] + ny * h * 1.3 * grow];
        const C2 = [P2[0] + nx * h * 1.3 * grow, P2[1] + ny * h * 1.3 * grow];
        const path = () => { ctx.beginPath(); ctx.moveTo(P1[0], P1[1]); ctx.bezierCurveTo(C1[0], C1[1], C2[0], C2[1], P2[0], P2[1]); };
        path(); ctx.strokeStyle = rgba('#ff7a1a', 0.16 * fade); ctx.lineWidth = 18; ctx.stroke();
        path(); ctx.strokeStyle = rgba('#ffb02e', 0.5 * fade); ctx.lineWidth = 7.5; ctx.stroke();
        path(); ctx.strokeStyle = rgba('#fff3c0', 0.95 * fade); ctx.lineWidth = 2.6; ctx.stroke();
        for (let j = 0; j < 6; j++) {
          const u = (fx.age * 1.2 + j / 6 + idx * 0.17) % 1, mt = 1 - u;
          const bx = mt * mt * mt * P1[0] + 3 * mt * mt * u * C1[0] + 3 * mt * u * u * C2[0] + u * u * u * P2[0];
          const by = mt * mt * mt * P1[1] + 3 * mt * mt * u * C1[1] + 3 * mt * u * u * C2[1] + u * u * u * P2[1];
          drawGlow(ctx, bx, by, 8, '#ffffff', 0.8 * fade * grow);
        }
        drawGlow(ctx, P1[0], P1[1], 16, '#ffd04a', 0.6 * fade);
        drawGlow(ctx, P2[0], P2[1], 16, '#ffd04a', 0.6 * fade);
      });
    },
    update: (_dt, fx) => { if (g.state !== 'play') fx.age = fx.max; },
  });
}

export const heliosWeapon: Weapon = {
  id: 'helios', name: 'Helios Flare Cannon', tag: 'Langka', sub: 'Stellar Plasma Projector', accent: SOL,
  desc: 'Bintang mini berselimut cincin magnet dalam badan meriam. Peluru berupa matahari kecil dengan sinar dan ekor plasma. Saat kena, lengkung api matahari menjulang dari tepi roda dan bekas gosongnya memancarkan sinar emas.',
  hint: 'Klik = tembak bintang',
  muzzle: 410, muzzleY: 0, kick: 20, cooldown: 1.3,
  draw: drawHelios,
  update: (g, s, dt) => {
    if (Math.random() < dt * (6 + 14 * s.ready)) {
      const p = g.lw(190, -12);
      const a = rand(0, TAU), d = rand(30, 44);
      g.spawn({ type: 'spark', x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, vx: Math.cos(a) * rand(20, 80), vy: Math.sin(a) * rand(20, 80) - 30, size: 1.4, life: rand(0.4, 0.9), pal: ['#fff0b0', '#ffb02e', '#ff5a1a'], len: 0.04 });
    }
  },
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 56, color: SOL, core: '#ffffff', spikes: 7, spread: 0.8, life: 0.1 });
    g.ring(m.x, m.y, 8, 100, '#ffb02e', 0.32, 5, 0.5);
    g.ring(m.x, m.y, 4, 60, '#ffffff', 0.24, 3, 0.5);
    g.glow(m.x, m.y, 130, '#ff9a2a', 0.24);
    g.light('#ffb02e', 0.7); g.shake(4);
    g.burst(m.x, m.y, { n: 10, type: 'flame', ang: -Math.PI / 2, spread: 0.5, speed: [200, 600], life: [0.25, 0.5], size: [10, 16], size1: [26, 40], pal: FLAME, turb: 240, ay: -100, alpha: 0.85 });
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -1300,
      update: (gm, dt, p) => {
        if (Math.random() < dt * 150) gm.spawn({ type: 'flame', x: p.x + rand(-8, 8), y: p.y + rand(4, 18), vx: rand(-50, 50), vy: rand(80, 260), life: rand(0.25, 0.45), size: rand(12, 18), size1: rand(2, 6), pal: FLAME, turb: 260, alpha: 0.8 });
        if (Math.random() < dt * 40) gm.spawn({ type: 'spark', x: p.x, y: p.y, vx: rand(-200, 200), vy: rand(60, 260), size: 1.6, life: rand(0.3, 0.6), pal: ['#fff0b0', '#ffb02e', '#ff5a1a'], len: 0.05 });
      },
      draw: (ctx, _g, p) => sunBolt(ctx, p),
      onHit: (gm, hx, hy) => solarFlare(gm, hx, hy),
    });
  },
};

export const rare3Weapons: Weapon[] = [harmonicWeapon, cryoWeapon, heliosWeapon];
