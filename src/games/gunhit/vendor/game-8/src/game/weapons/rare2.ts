import type { Game } from '../engine';
import type { Fx, Weapon, WeaponState } from '../types';
import {
  BRASS, TAU, add, clamp, drawGlow, easeOut, hgrad, lerp, metalBox, norm, rand, rgba, rr, vgrad,
} from '../util';
import { hexPath } from './rare';

type C = CanvasRenderingContext2D;

/* ================================================================================= */
/*  1. CHRONO RIFLE — stops time: the wheel freezes inside a giant clock               */
/* ================================================================================= */
const GOLDG = ['#fff3c0', '#f0c050', '#b07a1c', '#5a3a08'];

function gear(ctx: C, x: number, y: number, r: number, teeth: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const step = TAU / teeth, ri = r * 0.8;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [[-0.26, ri], [-0.16, r], [0.16, r], [0.26, ri]];
    pts.forEach(([da, rad], k) => {
      const px = Math.cos(a + da * step * 2) * rad, py = Math.sin(a + da * step * 2) * rad;
      i === 0 && k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
  g.addColorStop(0, '#fff0b8'); g.addColorStop(0.6, '#d6a03a'); g.addColorStop(1, '#6a4510');
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(40,22,0,.85)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#1a1006';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, TAU); ctx.fill();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + 0.5;
    ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52, r * 0.14, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawChrono(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const TEAL = '#5af2ff', GOLD = '#ffd36a';
  const rewind = s.fireT < 0.45 ? 1 - s.fireT / 0.45 : 0;
  const DK = ['#58707a', '#2a3a43', '#111b21', '#080d10'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 20, 92, ['#2f4048', '#16222a', '#080e12']);
  ctx.beginPath(); ctx.moveTo(122, 22); ctx.lineTo(166, 22); ctx.lineTo(156, 86); ctx.lineTo(114, 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(240,192,80,.7)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(126 + i * 1.2, 34 + i * 11); ctx.lineTo(162 - i * 1.6, 34 + i * 11); ctx.stroke(); }
  ctx.fillStyle = vgrad(ctx, 86, 98, GOLDG); rr(ctx, 110, 86, 50, 9, 3); ctx.fill();
  ctx.strokeStyle = '#a77a2a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(172, 28); ctx.quadraticCurveTo(172, 56, 192, 54); ctx.quadraticCurveTo(208, 52, 208, 30); ctx.stroke();
  // stock
  ctx.fillStyle = vgrad(ctx, -22, 34, DK);
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(34, -28, 100, -26); ctx.lineTo(104, 20); ctx.lineTo(62, 22); ctx.quadraticCurveTo(26, 34, 0, 32); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.strokeStyle = vgrad(ctx, -20, 30, GOLDG); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(6, -10); ctx.quadraticCurveTo(36, -22, 98, -21); ctx.stroke();
  add(ctx);
  ctx.strokeStyle = rgba(TEAL, 0.6 + 0.3 * Math.sin(t * 3)); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(18, 4); ctx.lineTo(90, 2); ctx.stroke();
  norm(ctx);
  gear(ctx, 50, 12, 12, 10, -t * 0.8);
  // receiver
  metalBox(ctx, 96, -36, 150, 58, 10, DK, 0.3);
  metalBox(ctx, 98, -42, 146, 9, 3, GOLDG, 0.5);
  metalBox(ctx, 98, 17, 146, 8, 3, GOLDG, 0.5);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(106 + i * 21, -37.5, 1.8, 0, TAU); ctx.fill(); }
  // clock dial
  const dx = 172, dy = -7;
  gear(ctx, dx, dy, 41, 20, t * 0.18);
  ctx.fillStyle = vgrad(ctx, dy - 32, dy + 32, ['#0e1a1f', '#050a0c']);
  ctx.beginPath(); ctx.arc(dx, dy, 31, 0, TAU); ctx.fill();
  ctx.strokeStyle = vgrad(ctx, dy - 32, dy + 32, GOLDG); ctx.lineWidth = 3; ctx.stroke();
  add(ctx);
  drawGlow(ctx, dx, dy, 44, TEAL, 0.16 + 0.22 * rd);
  ctx.strokeStyle = rgba(GOLD, 0.9); ctx.lineWidth = 1.6;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU, l = i % 3 ? 4 : 8;
    ctx.beginPath(); ctx.moveTo(dx + Math.cos(a) * 27, dy + Math.sin(a) * 27); ctx.lineTo(dx + Math.cos(a) * (27 - l), dy + Math.sin(a) * (27 - l)); ctx.stroke();
  }
  const ma = t * 1.4 - rewind * 12, ha = t * 0.12 - rewind * 1.2;
  ctx.strokeStyle = rgba('#ffffff', 0.95); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(ha) * 14, dy + Math.sin(ha) * 14); ctx.stroke();
  ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(TEAL, 0.95);
  ctx.beginPath(); ctx.moveTo(dx, dy); ctx.lineTo(dx + Math.cos(ma) * 23, dy + Math.sin(ma) * 23); ctx.stroke();
  ctx.lineWidth = 1; ctx.strokeStyle = rgba(GOLD, 0.9);
  const sa = t * 9;
  ctx.beginPath(); ctx.moveTo(dx - Math.cos(sa) * 6, dy - Math.sin(sa) * 6); ctx.lineTo(dx + Math.cos(sa) * 25, dy + Math.sin(sa) * 25); ctx.stroke();
  drawGlow(ctx, dx, dy, 7, '#ffffff', 0.9);
  norm(ctx);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.beginPath(); ctx.ellipse(dx - 8, dy - 12, 17, 9, -0.6, 0, TAU); ctx.fill();
  // barrel housing
  metalBox(ctx, 244, -22, 80, 40, 8, DK, 0.3);
  metalBox(ctx, 246, -26, 76, 7, 3, GOLDG, 0.5);
  metalBox(ctx, 246, 13, 76, 7, 3, GOLDG, 0.5);
  gear(ctx, 262, -12, 9, 10, -t * 1.6);
  gear(ctx, 262, 6, 9, 10, t * 1.6 + 0.3);
  // time crystal chamber
  ctx.save();
  hexPath(ctx, 296, -2, 21, Math.PI / 6);
  ctx.fillStyle = '#04141a'; ctx.fill();
  ctx.clip();
  add(ctx);
  const cg = ctx.createRadialGradient(296, -2, 1, 296, -2, 22);
  cg.addColorStop(0, 'rgba(255,255,255,1)'); cg.addColorStop(0.4, rgba(TEAL, 0.5 + 0.5 * rd)); cg.addColorStop(1, rgba('#1a6aff', 0.3));
  ctx.fillStyle = cg; ctx.fillRect(270, -26, 52, 48);
  for (let i = 0; i < 3; i++) {
    const a = t * (1 + i * 0.7) + i * 2.1;
    ctx.strokeStyle = rgba(i === 1 ? GOLD : '#ffffff', 0.55); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(296, -2, 17 - i * 4, 5 + i * 3, a, 0, TAU); ctx.stroke();
  }
  norm(ctx); ctx.restore();
  hexPath(ctx, 296, -2, 21, Math.PI / 6);
  ctx.strokeStyle = vgrad(ctx, -24, 20, GOLDG); ctx.lineWidth = 3; ctx.stroke();
  add(ctx); drawGlow(ctx, 296, -2, 44, TEAL, 0.25 + 0.4 * rd); norm(ctx);
  // barrel tube
  metalBox(ctx, 318, -9, 76, 18, 4, ['#d8e2ea', '#7d8d99', '#2c3942'], 0.45);
  for (let i = 0; i < 3; i++) metalBox(ctx, 330 + i * 20, -13, 6, 26, 2, GOLDG, 0.5);
  // temporal emitter rings
  add(ctx);
  for (let k = 0; k < 3; k++) {
    const x = 400 + k * 9;
    const ry = 30 - k * 6, rx = 6 - k;
    ctx.strokeStyle = rgba(k === 1 ? GOLD : TEAL, 0.5 + 0.4 * rd); ctx.lineWidth = 2 - k * 0.3;
    ctx.beginPath(); ctx.ellipse(x, 0, rx, ry, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = t * (k % 2 ? -1.6 : 1.6) + (i / 8) * TAU;
      drawGlow(ctx, x + Math.cos(a) * rx, Math.sin(a) * ry, 5, k === 1 ? GOLD : '#ffffff', 0.3 + 0.55 * rd);
    }
  }
  drawGlow(ctx, 408, 0, 26 + 30 * rd, TEAL, 0.35 + 0.5 * rd);
  drawGlow(ctx, 408, 0, 10 + 8 * rd, '#ffffff', 0.5 + 0.4 * rd);
  norm(ctx);
  void BRASS; void hgrad;
}

/** one persistent stasis field; extending it when another shot lands */
function stasis(g: Game, s: WeaponState, dur: number) {
  g.wheel.freezeT = Math.max(g.wheel.freezeT, dur);
  const ex = s.data.stasis as Fx | undefined;
  if (ex && ex.age < ex.max - 0.1) { ex.max = Math.max(ex.max, ex.age + dur + 0.4); return; }
  let thawed = false;
  const fx: Fx = {
    age: 0, max: dur + 0.4,
    draw: (ctx, _k, f) => {
      const w = g.wheel;
      const a = clamp(w.freeze);
      if (a < 0.01) return;
      const cx = g.cx, cy = g.wy, R = g.R * w.scale, t = f.age;
      add(ctx);
      drawGlow(ctx, cx, cy, R * 1.9, '#5af2ff', 0.2 * a);
      drawGlow(ctx, cx, cy, R * 1.4, '#ffd36a', 0.12 * a);
      const ring = (r: number, col: string, wd: number, al: number, dash?: number[], off = 0) => {
        ctx.strokeStyle = rgba(col, al * a); ctx.lineWidth = wd;
        if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = off; }
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
      };
      ring(R + 18, '#ffd36a', 2.6, 0.95);
      ring(R + 18, '#ffd36a', 9, 0.16);
      ring(R + 40, '#5af2ff', 1.6, 0.8, [14, 10], -t * 40);
      ring(R + 54, '#ffd36a', 1.2, 0.5, [3, 9], t * 30);
      // minute ticks & numerals (rotates in reverse)
      const rot = -t * 0.12;
      for (let i = 0; i < 60; i++) {
        const an = rot + (i / 60) * TAU, big = i % 5 === 0;
        const r0 = R + 18, r1 = R + 18 + (big ? 14 : 6);
        ctx.strokeStyle = rgba(big ? '#fff3c0' : '#ffd36a', (big ? 0.95 : 0.55) * a);
        ctx.lineWidth = big ? 2.4 : 1.2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(an) * r0, cy + Math.sin(an) * r0); ctx.lineTo(cx + Math.cos(an) * r1, cy + Math.sin(an) * r1); ctx.stroke();
      }
      // orbiting gold glyph dots
      for (let i = 0; i < 12; i++) {
        const an = rot * 1.5 + (i / 12) * TAU;
        drawGlow(ctx, cx + Math.cos(an) * (R + 40), cy + Math.sin(an) * (R + 40), 8, i % 3 === 0 ? '#ffffff' : '#5af2ff', 0.65 * a);
      }
      // clock hands over the wheel, running backwards then slowing
      const ease = 1 - Math.exp(-t * 2.4);
      const ma = -Math.PI / 2 - (1 - ease) * 18 - t * 0.35, ha = -Math.PI / 2 - (1 - ease) * 1.5 - t * 0.03;
      ctx.lineCap = 'round';
      for (const [ang, len, wd, col] of [[ha, R * 0.58, 7, '#ffd36a'], [ma, R + 8, 4.4, '#fff3c0']] as [number, number, number, string][]) {
        ctx.strokeStyle = rgba(col, 0.2 * a); ctx.lineWidth = wd * 3.4;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.85 * a); ctx.lineWidth = wd;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke();
        ctx.strokeStyle = rgba('#ffffff', a); ctx.lineWidth = wd * 0.35;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); ctx.stroke();
      }
      // ghost afterimages of the minute hand
      for (let i = 1; i < 6; i++) {
        const ang = ma + i * 0.13 * (1 - ease + 0.1);
        ctx.strokeStyle = rgba('#5af2ff', 0.2 * a * (1 - i / 6)); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * (R + 8), cy + Math.sin(ang) * (R + 8)); ctx.stroke();
      }
      drawGlow(ctx, cx, cy, 26, '#ffffff', 0.5 * a);
      // pulse each "second"
      const ph = (t * 1.6) % 1;
      ctx.strokeStyle = rgba('#ffd36a', 0.4 * (1 - ph) * a); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R + 18 + ph * 40, 0, TAU); ctx.stroke();
      // gears riding the ring
      norm(ctx);
      for (let i = 0; i < 4; i++) {
        const an = Math.PI / 4 + (i * Math.PI) / 2 + rot * 0.3;
        ctx.save();
        ctx.globalAlpha = a;
        gear(ctx, cx + Math.cos(an) * (R + 30), cy + Math.sin(an) * (R + 30), i % 2 ? 11 : 15, i % 2 ? 9 : 12, (i % 2 ? -1 : 1) * t * 0.9);
        ctx.restore();
      }
    },
    update: (dt, f) => {
      if (g.state !== 'play') { g.wheel.freezeT = 0; f.age = f.max; return; }
      // wood shards hang in the air
      for (const q of g.parts) {
        if (q.type !== 'chip' && q.type !== 'smoke' && q.type !== 'cube') continue;
        if (Math.hypot(q.x - g.cx, q.y - g.wy) > 300) continue;
        q.ay = 0;
        const d = Math.exp(-dt * 7);
        q.vx *= d; q.vy *= d;
        q.life = Math.min(q.max, q.life + dt * 0.9);
      }
      if (Math.random() < dt * 14) {
        const an = rand(0, TAU), r = g.R + rand(20, 64);
        g.spawn({ type: 'glow', x: g.cx + Math.cos(an) * r, y: g.wy + Math.sin(an) * r, vx: rand(-8, 8), vy: rand(-18, -4), size: rand(1.6, 3), size1: 0, life: rand(0.8, 1.4), pal: ['#fff3c0', '#ffd36a', '#5af2ff'] });
      }
      g.light('#5af2ff', 0.1);
      if (!thawed && g.wheel.freezeT <= 0.02 && f.age > 0.4) {
        thawed = true;
        g.ring(g.cx, g.wy, g.R, g.R + 260, '#ffd36a', 0.55, 8, 1);
        g.ring(g.cx, g.wy, g.R, g.R + 190, '#5af2ff', 0.45, 4, 1);
        g.light('#ffe9a0', 0.8);
        g.shake(5);
        g.wheel.boost += 5.5 * g.wheel.dir;
        g.wheel.kickV += 220;
        for (const q of g.parts) {
          if (q.type !== 'chip') continue;
          const dx = q.x - g.cx, dy = q.y - g.wy, d = Math.hypot(dx, dy) || 1;
          if (d > 330) continue;
          q.ay = 820; q.vx += (dx / d) * rand(260, 560); q.vy += (dy / d) * rand(260, 560);
        }
        g.burst(g.cx, g.wy, { n: 50, ang: 0, spread: Math.PI, speed: [260, 820], life: [0.4, 0.9], size: [1, 2.6], pal: ['#ffffff', '#ffd36a', '#5af2ff'], len: 0.05, ay: 200 });
        f.max = f.age + 0.45;
      }
    },
  };
  g.fx.push(fx);
  s.data.stasis = fx;
}

export const chronoWeapon: Weapon = {
  id: 'chrono', name: 'Chrono Rifle', tag: 'Langka', sub: 'Temporal Stasis Projector', accent: '#ffd36a',
  desc: 'Ruang kristal waktu dan jam bergerigi di badan senapan. Peluru jam menghentikan roda dalam medan stasis: serpihan kayu melayang diam, jarum jam berputar mundur, lalu waktu meledak maju.',
  hint: 'Klik = hentikan waktu',
  muzzle: 408, muzzleY: 0, kick: 12, cooldown: 0.8,
  draw: drawChrono,
  fire: (g, s) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 38, color: '#ffd36a', core: '#ffffff', spikes: 5, spread: 0.5, life: 0.08 });
    g.ring(m.x, m.y, 50, 6, '#5af2ff', 0.24, 2.4, 0.5);
    g.ring(m.x, m.y, 6, 70, '#ffd36a', 0.3, 3, 0.5);
    g.light('#ffd36a', 0.4);
    g.burst(m.x, m.y, { n: 12, type: 'glow', ang: -Math.PI / 2, spread: 0.9, speed: [80, 320], life: [0.3, 0.7], size: [2, 4], size1: 0, pal: ['#fff3c0', '#ffd36a', '#5af2ff'] });
    let acc = 0;
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -2400,
      update: (gm, dt, p) => {
        acc += dt;
        if (acc > 0.022) {
          acc = 0;
          const x0 = p.x, y0 = p.y;
          gm.addFx({
            max: 0.34, add: true,
            draw: (ctx, k) => {
              const r = 10 + 30 * easeOut(k);
              ctx.strokeStyle = rgba(k < 0.5 ? '#ffd36a' : '#5af2ff', 0.55 * (1 - k)); ctx.lineWidth = 2.2 * (1 - k) + 0.4;
              ctx.beginPath(); ctx.ellipse(x0, y0, r, r * 0.3, 0, 0, TAU); ctx.stroke();
            },
          });
        }
      },
      draw: (ctx, _g, p) => {
        add(ctx);
        ctx.lineCap = 'round';
        for (const [ox, col, al] of [[-5, '#5af2ff', 0.55], [5, '#ffd36a', 0.55], [0, '#ffffff', 0.9]] as [number, string, number][]) {
          const gr = ctx.createLinearGradient(0, p.y, 0, p.y + 160);
          gr.addColorStop(0, rgba(col, al)); gr.addColorStop(1, rgba(col, 0));
          ctx.strokeStyle = gr; ctx.lineWidth = ox === 0 ? 2 : 3.4;
          ctx.beginPath(); ctx.moveTo(p.x + ox, p.y); ctx.lineTo(p.x + ox, p.y + 160); ctx.stroke();
        }
        drawGlow(ctx, p.x, p.y, 40, '#ffd36a', 0.65);
        drawGlow(ctx, p.x, p.y, 18, '#ffffff', 1);
        ctx.strokeStyle = rgba('#fff3c0', 0.95); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 15, 0, TAU); ctx.stroke();
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * 15, p.y + Math.sin(a) * 15); ctx.lineTo(p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20); ctx.stroke(); }
        const a1 = p.age * 24, a2 = p.age * 2;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a1) * 12, p.y + Math.sin(a1) * 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(a2) * 8, p.y + Math.sin(a2) * 8); ctx.stroke();
        norm(ctx);
      },
      onHit: (gm, hx, hy) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 1.4, chips: 12, kick: 1, stop: 0.07, shake: 4, flash: 0.5 });
        gm.addEmbed(hx, hy, { kind: 'clock', glow: '#ffd36a', size: rand(1, 1.2), cool: 2.6 });
        gm.heatWheel('#ffd36a', 0.25);
        gm.light('#ffe9a0', 0.7);
        gm.ring(hx, hy, 6, 120, '#ffd36a', 0.45, 5, 0.5);
        gm.ring(hx, hy, 4, 80, '#ffffff', 0.3, 3, 0.5);
        gm.ring(hx, hy, 80, 6, '#5af2ff', 0.3, 2, 0.5);
        gm.glow(hx, hy, 100, '#ffd36a', 0.28);
        gm.burst(hx, hy, { n: 26, ang: n, spread: 1.5, speed: [180, 640], life: [0.3, 0.8], size: [1, 2.4], pal: ['#ffffff', '#ffd36a', '#5af2ff'], len: 0.05, ay: 120 });
        gm.burst(hx, hy, { n: 12, type: 'glow', ang: n, spread: 1.6, speed: [40, 200], life: [0.7, 1.4], size: [3, 6], size1: 0, pal: ['#fff3c0', '#ffd36a'] });
        stasis(gm, s, 1.7);
      },
    });
  },
};

/* ================================================================================= */
/*  2. ORBITAL ION BEACON — marks the target, a satellite beam falls from the sky       */
/* ================================================================================= */
function drawBeacon(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const RED = '#ff3a3a';
  const DK = ['#6e737e', '#383b44', '#17191f', '#08090c'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 20, 92, ['#3a3d45', '#1b1d22', '#09090b']);
  ctx.beginPath(); ctx.moveTo(120, 20); ctx.lineTo(164, 20); ctx.lineTo(154, 86); ctx.lineTo(112, 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(124, 34 + i * 9); ctx.lineTo(160, 34 + i * 9); ctx.stroke(); }
  add(ctx); ctx.fillStyle = rgba(RED, 0.5 + 0.4 * Math.sin(t * 4)); rr(ctx, 134, 28, 4, 52, 2); ctx.fill(); norm(ctx);
  ctx.strokeStyle = '#4a4e58'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(172, 26); ctx.quadraticCurveTo(172, 52, 190, 50); ctx.quadraticCurveTo(206, 48, 206, 28); ctx.stroke();
  // stock
  ctx.fillStyle = vgrad(ctx, -24, 32, DK);
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(98, -26); ctx.lineTo(102, 20); ctx.lineTo(62, 22); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = '#c0302a'; ctx.beginPath(); ctx.moveTo(8, -6); ctx.lineTo(96, -17); ctx.lineTo(96, -11); ctx.lineTo(8, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0d0e11'; ctx.fillRect(-3, -12, 7, 42);
  // body
  metalBox(ctx, 96, -32, 176, 54, 9, DK, 0.3);
  ctx.fillStyle = '#c0302a'; ctx.fillRect(100, 12, 164, 4);
  ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 12; i++) ctx.fillRect(104 + i * 14, 12.6, 7, 2.8);
  // tactical screen
  ctx.fillStyle = '#04060a'; rr(ctx, 110, -24, 58, 32, 4); ctx.fill();
  ctx.strokeStyle = '#2a2e38'; ctx.lineWidth = 1.5; ctx.stroke();
  add(ctx);
  ctx.strokeStyle = rgba('#3aff7a', 0.5); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(139, -22); ctx.lineTo(139, 6); ctx.moveTo(112, -8); ctx.lineTo(166, -8); ctx.stroke();
  ctx.strokeStyle = rgba(RED, 0.9); ctx.lineWidth = 1.4;
  const sr = 8 + 3 * Math.sin(t * 6);
  ctx.beginPath(); ctx.arc(139, -8, sr, 0, TAU); ctx.stroke();
  ctx.fillStyle = rgba(RED, 0.5 + 0.5 * Math.sin(t * 12)); ctx.fillRect(137, -10, 4, 4);
  ctx.fillStyle = rgba('#3aff7a', 0.7);
  for (let i = 0; i < 4; i++) ctx.fillRect(114, -21 + i * 3.2, 8 + ((i * 7 + Math.floor(t * 3) * 5) % 14), 1.4);
  const sw = ((t * 0.8) % 1);
  ctx.fillStyle = rgba('#3aff7a', 0.2); ctx.fillRect(111, -23 + sw * 30, 56, 2);
  norm(ctx);
  // charge segments
  for (let i = 0; i < 6; i++) {
    const on = rd * 6 > i + 0.5;
    ctx.fillStyle = 'rgba(0,0,0,.6)'; rr(ctx, 182 + i * 14, -22, 10, 8, 2); ctx.fill();
    if (on) { add(ctx); ctx.fillStyle = rgba(i < 4 ? RED : '#ffb03a', 0.95); rr(ctx, 183 + i * 14, -21, 8, 6, 2); ctx.fill(); drawGlow(ctx, 187 + i * 14, -18, 11, RED, 0.5); norm(ctx); }
  }
  // satellite dish mast + dish
  metalBox(ctx, 214, -52, 18, 22, 3, DK, 0.4);
  ctx.save();
  ctx.translate(223, -58);
  ctx.rotate(-0.55 + Math.sin(t * 0.7) * 0.35);
  ctx.beginPath(); ctx.moveTo(-4, -34); ctx.quadraticCurveTo(30, 0, -4, 34); ctx.quadraticCurveTo(10, 0, -4, -34); ctx.closePath();
  ctx.fillStyle = hgrad(ctx, -4, 22, ['#f2f5fa', '#9aa3b2', '#4a505c']); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, -34); ctx.quadraticCurveTo(14, 0, -4, 34);
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = '#8a929f'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(2, -26); ctx.lineTo(30, 0); ctx.lineTo(2, 26); ctx.moveTo(0, 0); ctx.lineTo(30, 0); ctx.stroke();
  add(ctx); drawGlow(ctx, 31, 0, 12, RED, 0.5 + 0.5 * Math.abs(Math.sin(t * 5))); drawGlow(ctx, 31, 0, 4, '#ffffff', 1); norm(ctx);
  ctx.restore();
  // barrel & emitter
  metalBox(ctx, 268, -14, 70, 28, 6, DK, 0.35);
  ctx.fillStyle = 'rgba(0,0,0,.6)'; for (let i = 0; i < 5; i++) rr(ctx, 278 + i * 11, -9, 6, 18, 2), ctx.fill();
  add(ctx); for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba(RED, 0.15 + 0.7 * rd * (0.6 + 0.4 * Math.sin(t * 6 + i))); rr(ctx, 279 + i * 11, -7, 4, 14, 2); ctx.fill(); } norm(ctx);
  metalBox(ctx, 334, -10, 24, 20, 4, ['#cfd5df', '#7a828f', '#2c3038'], 0.4);
  for (let i = 0; i < 3; i++) metalBox(ctx, 338 + i * 6, -17, 3, 34, 1, DK, 0.3);
  ctx.fillStyle = '#100305'; ctx.beginPath(); ctx.ellipse(361, 0, 4, 9, 0, 0, TAU); ctx.fill();
  add(ctx);
  drawGlow(ctx, 362, 0, 14 + 24 * rd, RED, 0.5 + 0.5 * rd);
  drawGlow(ctx, 362, 0, 6, '#ffffff', 0.6 + 0.4 * rd);
  norm(ctx);
}

function strikeBolt(ctx: C, p: { x: number; y: number }) {
  add(ctx);
  const gr = ctx.createLinearGradient(0, p.y, 0, p.y + 120);
  gr.addColorStop(0, 'rgba(255,90,90,.95)'); gr.addColorStop(1, 'rgba(255,40,40,0)');
  ctx.strokeStyle = gr; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 120); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + 50); ctx.stroke();
  drawGlow(ctx, p.x, p.y, 20, '#ff4a4a', 0.9);
  drawGlow(ctx, p.x, p.y, 8, '#ffffff', 1);
  norm(ctx);
}

function orbitalStrike(g: Game, hx: number, hy: number) {
  const la = g.localAngle(hx, hy);
  const pos = () => {
    const a = g.wheel.angle + la;
    return { x: g.cx + Math.cos(a) * g.R, y: g.wy + Math.sin(a) * g.R };
  };
  const LOCK = 0.95, BEAM = 0.62;
  let fired = false, sparkAcc = 0;
  g.hit(hx, hy, { power: 0.4, count: 0, chips: 4, kick: 0.3, shake: 1, flash: 0.15 });
  g.ring(hx, hy, 4, 50, '#ff5a5a', 0.3, 3, 0.5);

  g.addFx({
    max: LOCK + BEAM + 0.05,
    draw: (ctx, _k, fx) => {
      const t = fx.age;
      const p = pos();
      add(ctx);
      if (t < LOCK) {
        const u = t / LOCK;
        const blink = 0.45 + 0.55 * Math.abs(Math.sin(t * (7 + 16 * u)));
        // satellite glint + telegraph
        const sg = ctx.createLinearGradient(0, 0, 0, p.y);
        sg.addColorStop(0, `rgba(255,90,90,${0.1 + 0.5 * u})`); sg.addColorStop(1, `rgba(255,90,90,${0.05 + 0.35 * u})`);
        ctx.strokeStyle = sg; ctx.lineWidth = 1.5; ctx.setLineDash([4, 12]); ctx.lineDashOffset = -t * 320;
        ctx.beginPath(); ctx.moveTo(p.x, 18); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.setLineDash([]);
        drawGlow(ctx, p.x, 16, 16 + 22 * u, '#ff5a5a', 0.25 + 0.6 * u);
        ctx.strokeStyle = rgba('#ffffff', 0.4 + 0.5 * u); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(p.x - 18 * u - 4, 16); ctx.lineTo(p.x + 18 * u + 4, 16); ctx.moveTo(p.x, 16 - 12 * u - 3); ctx.lineTo(p.x, 16 + 12 * u + 3); ctx.stroke();
        // converging reticle
        const r = 14 + 52 * (1 - easeOut(u));
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba('#ff3a3a', 0.9); ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.stroke();
        ctx.strokeStyle = rgba('#ff8a8a', 0.7); ctx.lineWidth = 1.6; ctx.setLineDash([6, 8]); ctx.lineDashOffset = t * 80;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.6 + 8, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = rgba('#ff3a3a', 0.95); ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + t * 1.5 * (1 - u * 0.5);
          ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * (r + 4), p.y + Math.sin(a) * (r + 4)); ctx.lineTo(p.x + Math.cos(a) * (r + 18), p.y + Math.sin(a) * (r + 18)); ctx.stroke();
        }
        for (let i = 0; i < 3; i++) {
          const a = -t * 2.4 + (i / 3) * TAU, rr2 = r * 1.6 + 14;
          const x = p.x + Math.cos(a) * rr2, y = p.y + Math.sin(a) * rr2;
          ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
          ctx.fillStyle = rgba('#ff3a3a', 0.9);
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5, 4); ctx.lineTo(-5, 4); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        drawGlow(ctx, p.x, p.y, 26, '#ff3a3a', 0.4 * blink + 0.3 * u);
        drawGlow(ctx, p.x, p.y, 7, '#ffffff', blink);
      } else {
        const tb = t - LOCK, kb = clamp(tb / BEAM);
        const env = kb < 0.1 ? kb / 0.1 : Math.pow(1 - (kb - 0.1) / 0.9, 1.35);
        const w = 130 * env;
        const top = -40;
        ctx.lineCap = 'butt';
        const col = (wd: number, c: string, al: number) => {
          ctx.strokeStyle = rgba(c, al * Math.min(1, env * 1.3)); ctx.lineWidth = Math.max(0.5, wd);
          ctx.beginPath(); ctx.moveTo(p.x, top); ctx.lineTo(p.x, p.y + 6); ctx.stroke();
        };
        col(w * 1.5, '#ff2a2a', 0.16);
        col(w * 0.95, '#ff5a2a', 0.38);
        col(w * 0.55, '#ffb070', 0.75);
        col(w * 0.28, '#fff0dc', 0.95);
        col(w * 0.1, '#ffffff', 1);
        // energy rings sliding down
        for (let i = 0; i < 10; i++) {
          const u = (i / 10 + tb * 2.6) % 1;
          const y = top + (p.y - top) * u;
          const rx = w * 0.45 + 12;
          ctx.strokeStyle = rgba('#ffd9b0', (0.75 - 0.4 * u) * env); ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.ellipse(p.x, y, rx, rx * 0.2, 0, 0, TAU); ctx.stroke();
        }
        // flicker streaks inside beam
        for (let i = 0; i < 6; i++) {
          const x = p.x + rand(-1, 1) * w * 0.4;
          ctx.strokeStyle = rgba('#ffffff', 0.35 * env); ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, p.y); ctx.stroke();
        }
        drawGlow(ctx, p.x, 10, 130 * env + 20, '#ff9a6a', 0.6 * env);
        drawGlow(ctx, p.x, p.y, 200 * env + 20, '#ff5a2a', 0.65 * env);
        drawGlow(ctx, p.x, p.y, 84 * env + 10, '#ffffff', 0.9 * env);
        // impact ellipse shock ring
        const sr = 30 + 190 * easeOut(kb);
        ctx.strokeStyle = rgba('#ffd9b0', 0.8 * (1 - kb)); ctx.lineWidth = 6 * (1 - kb) + 1;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, sr, sr * 0.3, 0, 0, TAU); ctx.stroke();
      }
      norm(ctx);
    },
    update: (dt, fx) => {
      if (g.state !== 'play') { fx.age = fx.max; return; }
      const p = pos();
      if (fx.age >= LOCK && !fired) {
        fired = true;
        g.hit(p.x, p.y, { power: 3, count: 3, chips: 34, kick: 2.2, flash: 1, shake: 15, stop: 0.1 });
        g.addEmbed(p.x, p.y, { kind: 'crater', color: '#222', glow: '#ff5a2a', size: 1.7, cracks: 12, cool: 3.2 });
        g.heatWheel('#ff5a2a', 0.8);
        g.light('#ff6a3a', 1);
        g.ring(p.x, p.y, 8, 280, '#ff7a4a', 0.6, 9, 0.32);
        g.ring(p.x, p.y, 4, 170, '#ffffff', 0.4, 4, 0.32);
        g.ring(p.x, p.y, 2, 340, '#ff3a2a', 0.8, 3, 0.32);
        g.glow(p.x, p.y, 200, '#ff5a2a', 0.45);
        g.burst(p.x, p.y, { n: 60, ang: Math.PI / 2, spread: 1.7, speed: [260, 1100], life: [0.3, 0.9], size: [1, 3], pal: ['#ffffff', '#ffd9a0', '#ff8a3a', '#ff3a2a'], len: 0.05, ay: 600 });
        g.burst(p.x, p.y, { n: 14, type: 'glow', ang: Math.PI / 2, spread: 1.6, speed: [80, 420], life: [0.5, 1.2], size: [5, 12], size1: 0, pal: ['#ff9a4a', '#a8281a'], ay: -80 });
        for (let i = 0; i < 12; i++) g.spawn({ type: 'smoke', x: p.x + rand(-30, 30), y: p.y + rand(-10, 10), vx: rand(-90, 90), vy: rand(-140, -20), size: 8, size1: rand(30, 50), life: rand(0.9, 1.6), alpha: 0.3, pal: ['#4a3a34', '#15110f'], drag: 1.2 });
      }
      if (fx.age >= LOCK) {
        const kb = (fx.age - LOCK) / BEAM;
        sparkAcc += dt;
        while (sparkAcc > 0.012) {
          sparkAcc -= 0.012;
          const y = rand(-20, p.y);
          const sd = Math.random() < 0.5 ? -1 : 1;
          g.spawn({ type: 'spark', x: p.x + sd * rand(10, 50), y, vx: sd * rand(80, 420), vy: rand(60, 360), ay: 300, size: 1.6, life: rand(0.2, 0.5), pal: ['#ffffff', '#ffb070', '#ff5a2a'], len: 0.05 });
        }
        g.shake(5 * (1 - kb));
        g.light('#ff6a3a', 0.4 * (1 - kb));
      }
    },
  });
}

export const beaconWeapon: Weapon = {
  id: 'orbital-beacon', name: 'Orbital Ion Beacon', tag: 'Langka', sub: 'Satellite Strike Designator', accent: '#ff4a3a',
  desc: 'Antena parabola dan layar taktis. Peluru penanda menempel di roda dan terkunci mengikuti putaran, lalu sinar ion raksasa jatuh dari satelit di langit menghantam roda.',
  hint: 'Klik = tandai & panggil serangan',
  muzzle: 362, muzzleY: 0, kick: 10, cooldown: 1.7,
  draw: drawBeacon,
  drawOverlay: (ctx, g, s) => {
    if (s.ready < 0.98 || !g.active) return;
    const m = g.muzzlePos(), a = g.aim();
    add(ctx);
    ctx.setLineDash([3, 9]); ctx.lineDashOffset = -s.t * 100;
    ctx.strokeStyle = rgba('#ff3a3a', 0.3 + 0.1 * Math.sin(s.t * 16)); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke(); ctx.setLineDash([]);
    drawGlow(ctx, a.x, a.y, 12, '#ff3a3a', 0.9); drawGlow(ctx, a.x, a.y, 4, '#ffffff', 1);
    ctx.strokeStyle = rgba('#ff5a5a', 0.7); ctx.lineWidth = 1.4;
    const r = 18 + Math.sin(s.t * 6) * 2;
    ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, TAU); ctx.stroke();
    for (let i = 0; i < 4; i++) { const an = (i * Math.PI) / 2 + s.t; ctx.beginPath(); ctx.moveTo(a.x + Math.cos(an) * (r - 4), a.y + Math.sin(an) * (r - 4)); ctx.lineTo(a.x + Math.cos(an) * (r + 7), a.y + Math.sin(an) * (r + 7)); ctx.stroke(); }
    norm(ctx);
  },
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 34, color: '#ff4a3a', core: '#ffffff', spikes: 5, spread: 0.6, life: 0.08 });
    g.ring(m.x, m.y, 4, 46, '#ff6a6a', 0.18, 2, 0.5);
    g.light('#ff4a3a', 0.4);
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -2300,
      update: (gm, dt, p) => {
        if (Math.random() < dt * 60) gm.spawn({ type: 'glow', x: p.x + rand(-3, 3), y: p.y + rand(10, 40), size: rand(2, 4), size1: 0, life: 0.25, pal: ['#ff7a7a', '#ff3a3a'], alpha: 0.7 });
      },
      draw: (ctx, _g, p) => strikeBolt(ctx, p),
      onHit: (gm, hx, hy) => orbitalStrike(gm, hx, hy),
    });
  },
};

/* ================================================================================= */
/*  3. HELIX PULSAR — rapid-fire bolts made of two intertwined strands (DNA double helix)*/
/* ================================================================================= */
function drawHelix(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t;
  const CY = '#3de6ff', MG = '#ff4adf';
  const heat = clamp(1 - s.fireT * 5);
  const DK = ['#6e739a', '#363a5c', '#171932', '#0a0b18'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 18, 90, ['#3a3d5a', '#1b1c33', '#090a14']);
  ctx.beginPath(); ctx.moveTo(116, 18); ctx.lineTo(160, 18); ctx.lineTo(150, 84); ctx.lineTo(108, 90); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  add(ctx);
  const gg = ctx.createLinearGradient(0, 28, 0, 78);
  gg.addColorStop(0, rgba(CY, 0.8)); gg.addColorStop(1, rgba(MG, 0.8));
  ctx.fillStyle = gg; rr(ctx, 132, 28, 5, 50, 2); ctx.fill();
  norm(ctx);
  ctx.strokeStyle = '#51557a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(168, 24); ctx.quadraticCurveTo(168, 50, 186, 48); ctx.quadraticCurveTo(202, 46, 202, 26); ctx.stroke();
  // energy cell magazine
  metalBox(ctx, 188, 16, 30, 54, 6, DK, 0.35);
  add(ctx);
  for (let i = 0; i < 5; i++) {
    const on = 0.3 + 0.6 * Math.max(0, Math.sin(t * 6 - i * 0.8));
    ctx.fillStyle = rgba(i % 2 ? MG : CY, on); rr(ctx, 194, 22 + i * 9, 18, 5, 2); ctx.fill();
  }
  drawGlow(ctx, 203, 44, 34, '#b58cff', 0.2 + 0.25 * heat);
  norm(ctx);
  // stock
  ctx.fillStyle = vgrad(ctx, -20, 30, DK);
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.quadraticCurveTo(30, -26, 98, -26); ctx.lineTo(102, 20); ctx.lineTo(60, 22); ctx.quadraticCurveTo(26, 32, 0, 28); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.3; ctx.stroke();
  add(ctx);
  const sg = ctx.createLinearGradient(8, 0, 94, 0);
  sg.addColorStop(0, rgba(CY, 0.8)); sg.addColorStop(1, rgba(MG, 0.8));
  ctx.strokeStyle = sg; ctx.lineWidth = 2.4;
  for (const sgn of [-1, 1]) {
    ctx.beginPath();
    for (let x = 10; x <= 92; x += 4) { const y = -2 + Math.sin(x * 0.18 - t * 5 + (sgn > 0 ? Math.PI : 0)) * 6; x === 10 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  norm(ctx);
  // body
  metalBox(ctx, 96, -32, 150, 52, 12, DK, 0.3);
  add(ctx);
  ctx.strokeStyle = rgba(CY, 0.6); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(108, -22); ctx.lineTo(220, -22); ctx.stroke();
  ctx.strokeStyle = rgba(MG, 0.6);
  ctx.beginPath(); ctx.moveTo(108, 10); ctx.lineTo(220, 10); ctx.stroke();
  norm(ctx);
  // holo sight
  metalBox(ctx, 130, -46, 44, 16, 4, DK, 0.35);
  add(ctx);
  hexPath(ctx, 152, -62, 13, t * 0.8); ctx.strokeStyle = rgba(CY, 0.85); ctx.lineWidth = 1.6; ctx.stroke();
  hexPath(ctx, 152, -62, 7, -t * 1.4); ctx.strokeStyle = rgba(MG, 0.85); ctx.stroke();
  drawGlow(ctx, 152, -62, 20, '#b58cff', 0.35);
  norm(ctx);
  // coil housing
  ctx.fillStyle = '#05060f'; rr(ctx, 236, -24, 150, 48, 24); ctx.fill();
  ctx.save(); rr(ctx, 236, -24, 150, 48, 24); ctx.clip();
  add(ctx);
  drawGlow(ctx, 311, 0, 110, '#7a5cff', 0.12 + 0.3 * heat);
  const amp = 13;
  for (let sg2 = 0; sg2 < 2; sg2++) {
    const col = sg2 ? MG : CY;
    for (const [wd, al] of [[8, 0.18], [3.2, 0.95]] as [number, number][]) {
      ctx.strokeStyle = rgba(col, al * (0.55 + 0.45 * heat)); ctx.lineWidth = wd;
      ctx.beginPath();
      for (let x = 244; x <= 380; x += 3) { const y = Math.sin((x - 244) * 0.085 - t * (9 + 22 * heat) + sg2 * Math.PI) * amp; x === 244 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
  ctx.strokeStyle = rgba('#ffffff', 0.5 + 0.3 * heat); ctx.lineWidth = 1.2;
  for (let x = 250; x < 378; x += 8) {
    const ph = (x - 244) * 0.085 - t * (9 + 22 * heat);
    ctx.beginPath(); ctx.moveTo(x, Math.sin(ph) * amp); ctx.lineTo(x, Math.sin(ph + Math.PI) * amp); ctx.stroke();
  }
  norm(ctx); ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.1)'; rr(ctx, 244, -21, 134, 6, 3); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.6; rr(ctx, 236, -24, 150, 48, 24); ctx.stroke();
  for (let i = 0; i < 5; i++) metalBox(ctx, 252 + i * 31, -28, 8, 56, 3, DK, 0.4);
  // twin emitter prongs
  for (const sg2 of [-1, 1]) {
    ctx.fillStyle = vgrad(ctx, sg2 * 8 - 10, sg2 * 24 + 10, ['#9aa0c4', '#4a4e72', '#14152a']);
    ctx.beginPath(); ctx.moveTo(380, sg2 * 8); ctx.lineTo(404, sg2 * 15); ctx.lineTo(404, sg2 * 21); ctx.lineTo(380, sg2 * 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.2; ctx.stroke();
    add(ctx);
    drawGlow(ctx, 405, sg2 * 18, 14 + 22 * heat, sg2 < 0 ? CY : MG, 0.5 + 0.5 * heat);
    drawGlow(ctx, 405, sg2 * 18, 5, '#ffffff', 0.7 + 0.3 * heat);
    norm(ctx);
  }
  add(ctx); drawGlow(ctx, 396, 0, 22 + 30 * heat, '#b58cff', 0.3 + 0.5 * heat); norm(ctx);
}

function helixBolt(ctx: C, p: { x: number; y: number; age: number }) {
  const L = 110, ph = -p.age * 38, N = 24;
  add(ctx);
  ctx.lineCap = 'round';
  const X = (u: number, sg: number) => p.x + Math.sin(u * 13 + ph + sg * Math.PI) * 8 * (1 - u * 0.4);
  for (let sg = 0; sg < 2; sg++) {
    const col = sg ? '#ff4adf' : '#3de6ff';
    for (let i = 0; i < N; i++) {
      const u0 = i / N, u1 = (i + 1) / N;
      const a = (1 - u0) * 0.95;
      ctx.strokeStyle = rgba(col, a * 0.3); ctx.lineWidth = 7 * (1 - u0 * 0.6);
      ctx.beginPath(); ctx.moveTo(X(u0, sg), p.y + u0 * L); ctx.lineTo(X(u1, sg), p.y + u1 * L); ctx.stroke();
      ctx.strokeStyle = rgba(col, a); ctx.lineWidth = 3 * (1 - u0 * 0.55);
      ctx.beginPath(); ctx.moveTo(X(u0, sg), p.y + u0 * L); ctx.lineTo(X(u1, sg), p.y + u1 * L); ctx.stroke();
    }
  }
  ctx.lineWidth = 1;
  for (let i = 1; i < N; i += 2) {
    const u = i / N;
    ctx.strokeStyle = rgba('#ffffff', (1 - u) * 0.5);
    ctx.beginPath(); ctx.moveTo(X(u, 0), p.y + u * L); ctx.lineTo(X(u, 1), p.y + u * L); ctx.stroke();
  }
  drawGlow(ctx, p.x, p.y, 28, '#b58cff', 0.5);
  drawGlow(ctx, p.x, p.y, 13, '#ffffff', 0.95);
  norm(ctx);
}

export const helixWeapon: Weapon = {
  id: 'helix-pulsar', name: 'Helix Pulsar', tag: 'Langka', sub: 'Double-Strand Plasma Repeater', accent: '#d27aff',
  desc: 'Tabung kumparan transparan berisi dua untai energi cyan dan magenta yang berpilin. Tiap peluru adalah heliks ganda DNA bercahaya dan meninggalkan jejak heliks di kayu.',
  hint: 'Tahan = tembak otomatis',
  muzzle: 408, muzzleY: 0, kick: 8, cooldown: 0.085,
  draw: drawHelix,
  fire: (g, s) => {
    const m = g.muzzlePos();
    const side = s.shots % 2 ? 1 : -1;
    const ox = side * 18;
    g.muzzleFlash(m.x + ox, m.y, { size: 28, color: side < 0 ? '#3de6ff' : '#ff4adf', core: '#ffffff', spikes: 4, spread: 0.7, life: 0.05 });
    g.glow(m.x, m.y, 50, '#b58cff', 0.1, 0.6);
    g.light(side < 0 ? '#3de6ff' : '#ff4adf', 0.22);
    if (Math.random() < 0.3) g.spawn({ type: 'glow', x: m.x + ox, y: m.y, vx: rand(-60, 60), vy: rand(-120, -30), size: 3, size1: 0, life: 0.4, pal: ['#ffffff', side < 0 ? '#3de6ff' : '#ff4adf'] });
    const ang = rand(-0.018, 0.018);
    g.addProj({
      x: m.x + ox * 0.5, y: m.y, vx: Math.sin(ang) * 2700, vy: -Math.cos(ang) * 2700,
      draw: (ctx, _g, p) => helixBolt(ctx, p),
      onHit: (gm, hx, hy) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 0.6, chips: 3 });
        gm.addEmbed(hx, hy, { kind: 'helix', color: '#3de6ff', glow: '#ff4adf', size: rand(0.85, 1.1), cool: 1.4 });
        gm.burst(hx, hy, { n: 6, ang: n, spread: 1.3, speed: [150, 480], life: [0.15, 0.4], size: [1, 2.2], pal: ['#3de6ff', '#ffffff'], len: 0.05, ay: 350 });
        gm.burst(hx, hy, { n: 6, ang: n, spread: 1.3, speed: [150, 480], life: [0.15, 0.4], size: [1, 2.2], pal: ['#ff4adf', '#ffffff'], len: 0.05, ay: 350 });
        gm.ring(hx, hy, 3, 22, '#3de6ff', 0.22, 2, 0.45);
        gm.ring(hx, hy, 3, 31, '#ff4adf', 0.27, 2, 0.45);
        gm.glow(hx, hy, 32, '#b58cff', 0.13);
      },
    });
  },
};

void lerp;

export const rare2Weapons: Weapon[] = [chronoWeapon, beaconWeapon, helixWeapon];
