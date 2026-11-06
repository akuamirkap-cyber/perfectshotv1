import type { Game } from '../engine';
import type { Weapon, WeaponState } from '../types';
import {
  BLUED, POLY, STEEL, WOODC, add, drawGlow, grain, metalBox, norm, pick, rand, rgba, rr, vgrad,
} from '../util';

type C = CanvasRenderingContext2D;

/* ------------------------------------------------------------------ helpers */
function woodPoly(ctx: C, pts: number[], y0: number, y1: number) {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i += 2) (i ? ctx.lineTo(pts[i], pts[i + 1]) : ctx.moveTo(pts[i], pts[i + 1]));
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, y0, y1, WOODC);
  ctx.fill();
  ctx.save();
  ctx.clip();
  const xs = pts.filter((_, i) => i % 2 === 0);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  grain(ctx, x0, y0, x1 - x0, y1 - y0, 8);
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
}
function eject(g: Game, lx: number, ly: number, size = 5.5) {
  const w = g.lw(lx, ly);
  g.spawn({ type: 'shell', x: w.x, y: w.y, vx: rand(110, 240), vy: rand(-320, -170), ay: 1100, vr: rand(-26, 26), size, life: 0.9 });
}
function gunSmoke(g: Game, m: { x: number; y: number }, n = 2, a = 0.22) {
  for (let i = 0; i < n; i++) {
    g.spawn({ type: 'smoke', x: m.x + rand(-3, 3), y: m.y, vx: rand(-25, 25), vy: rand(-90, -30), size: 4, size1: rand(14, 22), life: rand(0.45, 0.8), alpha: a, pal: ['#e8ecf5', '#8d93a3'], drag: 2.2 });
  }
}

interface TracerOpts {
  spread: number; speed: number; len: number; w: number; c1: string; c2: string; glow: number;
  smoke?: boolean; electro?: string; bullet?: boolean;
  onHit: (g: Game, hx: number, hy: number) => void;
}
function shoot(g: Game, o: TracerOpts, xo = 0) {
  const m = g.muzzlePos();
  const ang = rand(-o.spread, o.spread);
  const vx = Math.sin(ang) * o.speed, vy = -Math.cos(ang) * o.speed;
  g.addProj({
    x: m.x + xo, y: m.y, vx, vy,
    update: (gm, dt, p) => {
      if (o.smoke && Math.random() < dt * 40) gm.spawn({ type: 'smoke', x: p.x, y: p.y + 10, size: 2, size1: 8, life: 0.4, alpha: 0.1, pal: ['#e8ecf5'], vx: rand(-8, 8), vy: rand(-8, 8) });
      if (o.electro && Math.random() < dt * 50) gm.spawn({ type: 'glow', x: p.x + rand(-6, 6), y: p.y + rand(0, o.len), size: rand(2, 4), size1: 0, life: 0.2, pal: [o.electro, '#ffffff'] });
    },
    draw: (ctx, _g, p) => {
      const sp = Math.hypot(p.vx, p.vy);
      const ux = p.vx / sp, uy = p.vy / sp;
      const tx = p.x - ux * o.len, ty = p.y - uy * o.len;
      add(ctx);
      const gr = ctx.createLinearGradient(tx, ty, p.x, p.y);
      gr.addColorStop(0, rgba(o.c1, 0));
      gr.addColorStop(0.65, rgba(o.c1, 0.75));
      gr.addColorStop(1, rgba(o.c2, 1));
      ctx.strokeStyle = gr;
      ctx.lineCap = 'round';
      ctx.lineWidth = o.w * 1.7;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(p.x, p.y); ctx.stroke();
      ctx.lineWidth = o.w * 0.7;
      ctx.strokeStyle = rgba('#ffffff', 0.9);
      ctx.beginPath(); ctx.moveTo(p.x - ux * o.len * 0.45, p.y - uy * o.len * 0.45); ctx.lineTo(p.x, p.y); ctx.stroke();
      drawGlow(ctx, p.x, p.y, o.glow, o.c2, 0.9);
      drawGlow(ctx, p.x, p.y, o.glow * 0.4, '#ffffff', 0.9);
      if (o.electro) {
        ctx.strokeStyle = rgba(o.electro, 0.9);
        ctx.lineWidth = 1.2;
        for (let a = 0; a < 2; a++) {
          ctx.beginPath();
          for (let i = 0; i <= 7; i++) {
            const t = i / 7;
            const jx = i === 0 || i === 7 ? 0 : rand(-7, 7);
            ctx.lineTo(p.x - ux * o.len * 1.1 * t + jx, p.y - uy * o.len * 1.1 * t + rand(-2, 2));
          }
          ctx.stroke();
        }
      }
      norm(ctx);
      if (o.bullet) {
        ctx.fillStyle = '#f3c25a';
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 2.6, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff6c8'; ctx.fillRect(p.x - 1.4, p.y - 4, 1.2, 6);
      }
    },
    onHit: (gm, hx, hy) => o.onHit(gm, hx, hy),
  });
}

function bulletImpact(g: Game, hx: number, hy: number, o: { power?: number; size?: number; pal?: string[]; glow?: string; slug?: string; chips?: number }) {
  const n = g.normalAt(hx, hy);
  g.hit(hx, hy, { power: o.power ?? 1, chips: o.chips });
  g.addEmbed(hx, hy, { kind: 'slug', color: o.slug ?? '#e0a845', glow: o.glow ?? '#ffb347', size: o.size ?? 1, cracks: 3 });
  g.burst(hx, hy, { n: 8, ang: n, spread: 1.3, speed: [160, 520], life: [0.12, 0.35], size: [1, 2.2], pal: o.pal ?? ['#fff3c0', '#ffc24a', '#ff8a2a'], len: 0.04, ay: 500 });
  g.glow(hx, hy, 26 * (o.size ?? 1), o.glow ?? '#ffcf80', 0.1);
  g.ring(hx, hy, 3, 17 * (o.size ?? 1), o.glow ?? '#ffcf80', 0.16, 2);
}

function electroImpact(g: Game, hx: number, hy: number, o: { color: string; core?: string; power: number; bolts: number; size?: number }) {
  const n = g.normalAt(hx, hy);
  g.hit(hx, hy, { power: o.power, chips: 4 });
  g.addEmbed(hx, hy, { kind: 'scorch', color: '#222', glow: o.color, size: o.size ?? 1, cracks: 6, cool: 1.8 });
  for (let i = 0; i < o.bolts; i++) {
    const a = n + rand(0.3, 1.15) * (i % 2 ? 1 : -1);
    const tx = g.cx + Math.cos(a) * g.R * 0.97, ty = g.wy + Math.sin(a) * g.R * 0.97;
    g.lightning(hx, hy, tx, ty, { color: o.color, core: o.core ?? '#ffffff', life: 0.22, width: 1.8, jag: 9 });
  }
  g.lightning(hx, hy, hx + rand(-30, 30), hy + rand(30, 60), { color: o.color, life: 0.15, width: 1.4, jag: 7 });
  g.burst(hx, hy, { n: 12, ang: n, spread: 1.4, speed: [150, 560], life: [0.15, 0.45], size: [1, 2.2], pal: [o.core ?? '#ffffff', o.color], len: 0.05, ay: 300 });
  g.glow(hx, hy, 42 * (o.size ?? 1), o.color, 0.16);
  g.ring(hx, hy, 4, 28 * (o.size ?? 1), o.color, 0.24, 2.6);
  g.heatWheel(o.color, 0.12);
}

/* ------------------------------------------------------------------ AK-47 */
function drawAK(ctx: C) {
  // magazine
  ctx.fillStyle = vgrad(ctx, 0, 112, ['#82868d', '#4a4d54', '#1d1e21']);
  ctx.beginPath();
  ctx.moveTo(196, 4); ctx.lineTo(234, 4); ctx.bezierCurveTo(238, 42, 254, 76, 282, 100); ctx.lineTo(250, 112); ctx.bezierCurveTo(222, 84, 202, 46, 196, 4);
  ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 2;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(190, 14 + i * 14); ctx.lineTo(300, 22 + i * 14 + i * 3); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(204, 6); ctx.bezierCurveTo(208, 44, 224, 80, 250, 106); ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
  // stock
  woodPoly(ctx, [0, -4, 94, -20, 98, 12, 90, 15, 6, 40, -1, 36], -20, 40);
  ctx.fillStyle = '#17181b';
  ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(5, -7); ctx.lineTo(8, 39); ctx.lineTo(-1, 41); ctx.closePath(); ctx.fill();
  // lower handguard + upper
  woodPoly(ctx, [214, -8, 290, -8, 300, 4, 300, 16, 214, 18], -8, 18);
  ctx.strokeStyle = 'rgba(40,18,4,.55)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(228 + i * 11, 0); ctx.lineTo(228 + i * 11, 10); ctx.stroke(); }
  woodPoly(ctx, [214, -22, 292, -22, 296, -8, 214, -8], -22, -8);
  // receiver
  metalBox(ctx, 92, -24, 124, 33, 3, BLUED);
  metalBox(ctx, 94, -29, 114, 8, 3, ['#4b5463', '#2e343e', '#1a1e25'], 0.28);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; rr(ctx, 148, -17, 50, 9, 2); ctx.fill();
  ctx.fillStyle = '#9aa3b0';
  for (const x of [108, 196]) { ctx.beginPath(); ctx.arc(x, -2, 2.1, 0, 7); ctx.fill(); }
  ctx.strokeStyle = '#7d8795'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(118, 2); ctx.lineTo(186, 0); ctx.stroke();
  ctx.fillStyle = '#c9d0da'; ctx.beginPath(); ctx.arc(164, -22, 3.6, 0, 7); ctx.fill();
  // rear sight
  metalBox(ctx, 196, -37, 18, 9, 2, STEEL);
  // gas tube + block
  metalBox(ctx, 214, -30, 112, 8, 4, ['#8a93a0', '#4f5662', '#262a31']);
  metalBox(ctx, 304, -22, 24, 30, 3, BLUED);
  // barrel + rod
  metalBox(ctx, 296, -4.5, 100, 9, 2, STEEL);
  metalBox(ctx, 300, 6, 78, 3.5, 1.5, STEEL);
  // front sight
  metalBox(ctx, 340, -32, 12, 28, 2, BLUED);
  ctx.fillStyle = '#d7dde6'; ctx.fillRect(345, -44, 2.4, 14);
  ctx.strokeStyle = '#9aa3b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(346, -36, 9, Math.PI, 0); ctx.stroke();
  // muzzle brake
  metalBox(ctx, 372, -8, 24, 16, 3, ['#7c8592', '#3b414b', '#1b1e24']);
  ctx.fillStyle = 'rgba(0,0,0,.8)';
  for (let i = 0; i < 3; i++) ctx.fillRect(378 + i * 6, -8, 2.4, 3);
  // grip
  woodPoly(ctx, [146, 8, 174, 8, 188, 60, 160, 66], 8, 66);
  // trigger guard & trigger
  ctx.strokeStyle = '#6f7885'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(114, 8); ctx.quadraticCurveTo(114, 34, 138, 32); ctx.quadraticCurveTo(146, 30, 146, 9); ctx.stroke();
  ctx.fillStyle = '#9aa3b0'; ctx.beginPath(); ctx.moveTo(126, 8); ctx.lineTo(131, 8); ctx.lineTo(127, 22); ctx.closePath(); ctx.fill();
}

/* ------------------------------------------------------------------ M4-style rifle (+electro) */
function drawAR(ctx: C, s: WeaponState, electro: boolean) {
  const t = s.t;
  const pulse = (i: number) => 0.55 + 0.45 * Math.sin(t * 7 - i * 0.9);
  const cy = '#3de6ff';
  // magazine
  metalBox(ctx, 192, 14, 30, 58, 4, POLY);
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(196, 26 + i * 9); ctx.lineTo(218, 26 + i * 9); ctx.stroke(); }
  if (electro) {
    add(ctx);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = rgba(cy, 0.35 + 0.5 * pulse(i)); ctx.fillRect(199, 22 + i * 12, 16, 6); }
    drawGlow(ctx, 207, 46, 34, cy, 0.35 * pulse(0));
    norm(ctx);
  }
  // stock
  ctx.fillStyle = vgrad(ctx, -16, 22, POLY);
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(96, -10); ctx.lineTo(96, 12); ctx.lineTo(60, 14); ctx.lineTo(0, 24); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
  ctx.fillStyle = '#0c0d10'; ctx.fillRect(-3, -12, 6, 36);
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(20 + i * 14, -8); ctx.lineTo(20 + i * 14, 14 - i * 2); ctx.stroke(); }
  metalBox(ctx, 90, -8, 36, 16, 2, BLUED);
  // lower receiver + grip
  metalBox(ctx, 118, -4, 100, 22, 3, ['#4b5360', '#2b3039', '#15181d']);
  ctx.fillStyle = vgrad(ctx, 16, 66, POLY);
  ctx.beginPath(); ctx.moveTo(146, 16); ctx.lineTo(172, 16); ctx.lineTo(184, 62); ctx.lineTo(160, 66); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
  ctx.strokeStyle = '#6f7885'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(120, 18); ctx.quadraticCurveTo(122, 38, 142, 36); ctx.quadraticCurveTo(150, 34, 148, 17); ctx.stroke();
  // upper receiver
  metalBox(ctx, 112, -28, 126, 26, 3, ['#566070', '#303641', '#171a20']);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(ctx, 170, -22, 30, 8, 2); ctx.fill();
  ctx.fillStyle = '#8b94a1'; ctx.fillRect(176, -20, 6, 4);
  // rail
  ctx.fillStyle = '#20242b'; ctx.fillRect(114, -33, 190, 5);
  ctx.fillStyle = '#4d5560';
  for (let i = 0; i < 24; i++) ctx.fillRect(116 + i * 7.9, -35, 4.2, 3);
  // red dot sight
  metalBox(ctx, 160, -62, 48, 28, 5, ['#555d6b', '#2f343d', '#15181d']);
  ctx.fillStyle = electro ? 'rgba(61,230,255,.22)' : 'rgba(255,60,60,.2)';
  rr(ctx, 195, -58, 9, 20, 3); ctx.fill();
  add(ctx); drawGlow(ctx, 199, -48, 7, electro ? cy : '#ff3a3a', 0.9); norm(ctx);
  metalBox(ctx, 168, -36, 32, 5, 1, STEEL);
  // handguard
  metalBox(ctx, 238, -26, 84, 34, 8, ['#4d5562', '#2c313a', '#14171c']);
  ctx.fillStyle = 'rgba(0,0,0,.65)';
  for (let i = 0; i < 6; i++) rr(ctx, 248 + i * 12, -14, 7, 10, 3), ctx.fill();
  if (electro) {
    add(ctx);
    for (let i = 0; i < 6; i++) {
      const a = 0.4 + 0.6 * pulse(i);
      ctx.fillStyle = rgba(cy, a * 0.9); rr(ctx, 249 + i * 12, -12, 5, 7, 2); ctx.fill();
      drawGlow(ctx, 251.5 + i * 12, -8, 14, cy, a * 0.55);
    }
    drawGlow(ctx, 215, -16, 40, cy, 0.3 * pulse(2));
    ctx.fillStyle = rgba(cy, 0.75); ctx.fillRect(120, -22, 40, 3);
    norm(ctx);
    ctx.strokeStyle = '#b5772f'; ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(326 + i * 8, -7); ctx.lineTo(326 + i * 8, 7); ctx.stroke(); }
  }
  // barrel, flash hider, front sight
  metalBox(ctx, 320, -4, 56, 8, 2, STEEL);
  metalBox(ctx, 360, -7, 22, 14, 2, ['#6b7482', '#343a44', '#171a20']);
  ctx.fillStyle = 'rgba(0,0,0,.8)';
  for (let i = 0; i < 3; i++) ctx.fillRect(364 + i * 5, -7, 2, 3.5);
  metalBox(ctx, 296, -40, 8, 14, 1, BLUED);
  ctx.fillStyle = '#cfd6df'; ctx.fillRect(299, -48, 2, 9);
}

/* ------------------------------------------------------------------ MP5 (+electro) */
function drawMP5(ctx: C, s: WeaponState, electro: boolean) {
  const t = s.t;
  const cy = '#b25cff';
  const pulse = (i: number) => 0.55 + 0.45 * Math.sin(t * 8 - i);
  // magazine (curved)
  ctx.fillStyle = vgrad(ctx, 4, 96, ['#4a505c', '#262a31', '#111317']);
  ctx.beginPath();
  ctx.moveTo(148, 6); ctx.lineTo(184, 6); ctx.bezierCurveTo(188, 40, 196, 66, 206, 92); ctx.lineTo(172, 96); ctx.bezierCurveTo(166, 66, 152, 40, 148, 6);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
  ctx.save(); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(140, 18 + i * 13); ctx.lineTo(220, 22 + i * 13); ctx.stroke(); }
  if (electro) { add(ctx); for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba(cy, 0.3 + 0.5 * pulse(i)); ctx.fillRect(156 + i * 3, 16 + i * 14, 20, 5); } norm(ctx); }
  ctx.restore();
  // wire stock
  ctx.strokeStyle = '#8f98a6'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(72, -12); ctx.lineTo(6, -10); ctx.lineTo(2, 30); ctx.lineTo(60, 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = vgrad(ctx, -12, 30, POLY); rr(ctx, -3, -12, 10, 44, 3); ctx.fill();
  // receiver
  metalBox(ctx, 70, -22, 110, 30, 3, ['#505866', '#2c313a', '#15181d']);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(ctx, 118, -16, 36, 8, 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(84 + i * 5, -20); ctx.lineTo(84 + i * 5, 4); ctx.stroke(); }
  // rear drum sight
  metalBox(ctx, 156, -32, 16, 10, 3, BLUED);
  // grip & guard
  ctx.fillStyle = vgrad(ctx, 8, 60, POLY);
  ctx.beginPath(); ctx.moveTo(96, 8); ctx.lineTo(124, 8); ctx.lineTo(128, 58); ctx.lineTo(106, 62); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = '#6f7885'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(126, 8); ctx.quadraticCurveTo(138, 30, 150, 8); ctx.stroke();
  // handguard
  metalBox(ctx, 178, -22, 70, 38, 10, ['#555d6a', '#2f343d', '#16181d']);
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  for (let i = 0; i < 5; i++) rr(ctx, 188 + i * 11, -12, 6, 20, 3), ctx.fill();
  if (electro) {
    add(ctx);
    for (let i = 0; i < 5; i++) { const a = 0.4 + 0.6 * pulse(i); ctx.fillStyle = rgba(cy, a); rr(ctx, 189 + i * 11, -8, 4, 12, 2); ctx.fill(); drawGlow(ctx, 191 + i * 11, -2, 12, cy, a * 0.5); }
    drawGlow(ctx, 130, -8, 30, cy, 0.25 * pulse(1));
    norm(ctx);
  }
  // barrel + nut + front sight ring
  metalBox(ctx, 246, -5, 56, 10, 2, STEEL);
  metalBox(ctx, 244, -13, 8, 26, 2, BLUED);
  metalBox(ctx, 270, -22, 9, 17, 2, BLUED);
  ctx.strokeStyle = '#8f98a6'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(274.5, -20, 6, Math.PI, 0); ctx.stroke();
  metalBox(ctx, 290, -7, 12, 14, 2, ['#69727f', '#363c46', '#191c21']);
}

/* ------------------------------------------------------------------ Beretta 92 */
function drawBeretta(ctx: C, s: WeaponState) {
  // top-down view: +x = barrel direction, y = across the gun
  const sl = -s.recoil * 24;
  ctx.lineJoin = 'round';
  // soft drop shadow
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  rr(ctx, 6, -14, 196, 34, 12); ctx.fill();
  // grip (polymer) with wood panels, widening towards the rear
  ctx.fillStyle = hgradV(ctx, -22, 22, ['#15171b', '#3d424c', '#15171b']);
  ctx.beginPath();
  ctx.moveTo(0, -12); ctx.lineTo(112, -17); ctx.lineTo(124, -15); ctx.lineTo(124, 15); ctx.lineTo(112, 17); ctx.lineTo(0, 12);
  ctx.quadraticCurveTo(-8, 0, 0, -12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.2; ctx.stroke();
  for (const sg of [-1, 1]) {
    const g = ctx.createLinearGradient(0, sg * 12, 0, sg * 19);
    g.addColorStop(0, '#6b3d19'); g.addColorStop(1, '#2a1406');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(12, sg * 12); ctx.lineTo(104, sg * 16); ctx.lineTo(104, sg * 21); ctx.lineTo(14, sg * 17); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,200,140,.25)'; ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(18 + i * 10, sg * (13 + i * 0.4)); ctx.lineTo(18 + i * 10, sg * (19 + i * 0.4)); ctx.stroke(); }
    ctx.fillStyle = '#e9c25a'; ctx.beginPath(); ctx.arc(60, sg * 18, 2.4, 0, 7); ctx.fill();
  }
  // frame / dust cover under the slide
  metalBox(ctx, 110, -12, 80, 24, 4, ['#aab3c0', '#6a7280', '#363c47']);
  // trigger guard seen from above
  ctx.strokeStyle = '#59616e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(112, -13); ctx.quadraticCurveTo(140, -17, 150, -9); ctx.moveTo(112, 13); ctx.quadraticCurveTo(140, 17, 150, 9); ctx.stroke();
  // barrel muzzle (static)
  const bg = ctx.createRadialGradient(198, -2, 1, 198, 0, 8);
  bg.addColorStop(0, '#f2f6fb'); bg.addColorStop(1, '#5b6370');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(198, 0, 7.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#0a0b0e'; ctx.beginPath(); ctx.arc(201, 0, 3.6, 0, 7); ctx.fill();
  // slide
  ctx.save();
  ctx.translate(sl, 0);
  ctx.fillStyle = hgradV(ctx, -14, 14, ['#1b1e24', '#6e7685', '#9aa3b2', '#4a515e', '#16181d']);
  ctx.beginPath();
  ctx.moveTo(8, -10); ctx.lineTo(186, -13); ctx.quadraticCurveTo(198, -13, 199, -6); ctx.lineTo(199, 6); ctx.quadraticCurveTo(198, 13, 186, 13); ctx.lineTo(8, 10);
  ctx.quadraticCurveTo(2, 0, 8, -10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.3; ctx.stroke();
  // top flat highlight and centre rib
  ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(20, -2.5, 160, 1.6);
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(24, -6); ctx.lineTo(176, -6); ctx.moveTo(24, 6); ctx.lineTo(176, 6); ctx.stroke();
  // rear serrations
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1.8;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(14 + i * 4.5, -9); ctx.lineTo(14 + i * 4.5, 9); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 0.8;
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(15.2 + i * 4.5, -9); ctx.lineTo(15.2 + i * 4.5, 9); ctx.stroke(); }
  // ejection port with brass showing
  ctx.fillStyle = '#07080a'; rr(ctx, 78, 4, 34, 8, 2); ctx.fill();
  ctx.fillStyle = '#d9a441'; ctx.fillRect(88, 6, 14, 3);
  // sights
  ctx.fillStyle = '#12141a'; rr(ctx, 6, -8, 10, 16, 2); ctx.fill();
  ctx.fillStyle = '#f4f6fa'; ctx.fillRect(8, -5, 2.4, 2.6); ctx.fillRect(8, 2.4, 2.4, 2.6);
  ctx.fillStyle = '#12141a'; rr(ctx, 178, -4, 9, 8, 2); ctx.fill();
  ctx.fillStyle = '#f4f6fa'; ctx.fillRect(181, -1.2, 3, 2.4);
  ctx.restore();
  // hammer
  ctx.fillStyle = '#8a93a0'; rr(ctx, -3, -4, 9, 8, 2); ctx.fill();
}
function hgradV(ctx: C, y0: number, y1: number, stops: string[]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
  return g;
}

/* ------------------------------------------------------------------ Sniper beam */
function drawSniper(ctx: C, s: WeaponState) {
  const t = s.t;
  const cy = '#43e8ff';
  const ready = s.ready;
  const pulse = 0.6 + 0.4 * Math.sin(t * 5);
  const WHITE = ['#ffffff', '#cfd6e2', '#8892a2', '#4a5262'];
  // battery
  metalBox(ctx, 130, 14, 56, 40, 5, ['#3a4150', '#1f232c', '#0e1015']);
  add(ctx);
  for (let i = 0; i < 4; i++) { const on = ready * 4 > i; ctx.fillStyle = rgba(cy, on ? 0.9 : 0.15); rr(ctx, 138 + i * 12, 22, 8, 24, 2); ctx.fill(); }
  drawGlow(ctx, 158, 34, 36, cy, 0.25 * ready);
  norm(ctx);
  // bipod
  ctx.strokeStyle = '#59616e'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(250, 12); ctx.lineTo(282, 36); ctx.moveTo(250, 12); ctx.lineTo(268, 44); ctx.stroke();
  // stock
  ctx.fillStyle = vgrad(ctx, -18, 40, WHITE);
  ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(48, -20); ctx.lineTo(96, -22); ctx.lineTo(96, 14); ctx.lineTo(50, 16); ctx.lineTo(10, 34); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.stroke();
  ctx.fillStyle = '#191c22'; ctx.fillRect(-3, -14, 7, 46);
  add(ctx); ctx.fillStyle = rgba(cy, 0.7); ctx.fillRect(22, -3, 52, 2.4); norm(ctx);
  // body
  metalBox(ctx, 92, -26, 150, 42, 6, WHITE);
  ctx.fillStyle = vgrad(ctx, 14, 62, POLY);
  ctx.beginPath(); ctx.moveTo(110, 14); ctx.lineTo(136, 14); ctx.lineTo(142, 62); ctx.lineTo(118, 66); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
  // energy window
  ctx.fillStyle = '#05151b'; rr(ctx, 150, -18, 82, 20, 6); ctx.fill();
  add(ctx);
  const gw = ctx.createLinearGradient(152, 0, 230, 0);
  gw.addColorStop(0, rgba(cy, 0.2)); gw.addColorStop(Math.min(1, ready), rgba(cy, 0.95)); gw.addColorStop(Math.min(1, ready + 0.001), rgba(cy, 0.1)); gw.addColorStop(1, rgba(cy, 0.1));
  ctx.fillStyle = gw; rr(ctx, 153, -15, 76, 14, 4); ctx.fill();
  drawGlow(ctx, 190, -8, 60, cy, 0.3 * ready * pulse);
  norm(ctx);
  // scope
  metalBox(ctx, 118, -42, 16, 18, 2, BLUED); metalBox(ctx, 206, -42, 16, 18, 2, BLUED);
  metalBox(ctx, 98, -66, 150, 26, 12, ['#d5dbe6', '#7c8696', '#363c48']);
  metalBox(ctx, 228, -72, 30, 38, 8, ['#4a5262', '#262a33', '#101216']);
  metalBox(ctx, 86, -70, 22, 34, 6, ['#4a5262', '#262a33', '#101216']);
  add(ctx);
  const lg = ctx.createRadialGradient(243, -53, 1, 243, -53, 15);
  lg.addColorStop(0, 'rgba(255,255,255,.95)'); lg.addColorStop(0.4, rgba(cy, 0.8)); lg.addColorStop(1, rgba(cy, 0));
  ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(243, -53, 15, 0, 7); ctx.fill();
  drawGlow(ctx, 243, -53, 30, cy, 0.35);
  norm(ctx);
  // barrel shroud with rings
  metalBox(ctx, 242, -14, 116, 24, 5, ['#cfd6e2', '#7f8999', '#363c48']);
  metalBox(ctx, 242, -4, 116, 8, 2, ['#222730', '#0e1014', '#050608']);
  for (let i = 0; i < 5; i++) {
    const x = 256 + i * 22;
    const on = clampN(ready * 6 - i * 0.9);
    metalBox(ctx, x, -20, 8, 36, 2, ['#59616e', '#2b3039', '#14171c']);
    add(ctx);
    ctx.fillStyle = rgba(cy, 0.2 + 0.8 * on); ctx.fillRect(x + 1.5, -18, 5, 32);
    drawGlow(ctx, x + 4, -2, 18, cy, 0.6 * on);
    norm(ctx);
  }
  // emitter prongs
  ctx.fillStyle = vgrad(ctx, -22, 20, ['#e8edf5', '#7f8999', '#363c48']);
  ctx.beginPath(); ctx.moveTo(356, -14); ctx.lineTo(412, -10); ctx.lineTo(414, -3); ctx.lineTo(356, -5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(356, 14); ctx.lineTo(412, 10); ctx.lineTo(414, 3); ctx.lineTo(356, 5); ctx.closePath(); ctx.fill();
  add(ctx);
  const ch = clampN(ready);
  drawGlow(ctx, 410, 0, 10 + 34 * ch * pulse, '#ffffff', 0.4 + 0.5 * ch);
  drawGlow(ctx, 410, 0, 24 + 40 * ch, cy, 0.5 * ch);
  // charge ring converging
  if (ready < 1) {
    ctx.strokeStyle = rgba(cy, 0.7); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(410, 0, 8 + (1 - ready) * 40, 4 + (1 - ready) * 22, 0, 0, 7); ctx.stroke();
  }
  norm(ctx);
}
function clampN(v: number) { return Math.max(0, Math.min(1, v)); }

/* ------------------------------------------------------------------ definitions */
export const akWeapon: Weapon = {
  id: 'ak47', name: 'AK-47', tag: 'Senapan', sub: 'Assault Rifle 7.62', accent: '#ff9d2e',
  desc: 'Tracer jingga panas, selongsong kuningan berloncatan, dan lubang peluru bergaris retak di kayu.',
  hint: 'Tahan = tembak otomatis',
  muzzle: 396, muzzleY: 0, scale: 1.1, kick: 12, cooldown: 0.1,
  draw: (ctx) => drawAK(ctx),
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 42, color: '#ffa526', core: '#fff4c4', spikes: 7, spread: 0.95, life: 0.07 });
    g.light('#ff9a3a', 0.35);
    gunSmoke(g, m, 1);
    eject(g, 175, -12);
    shoot(g, {
      spread: 0.028, speed: 2700, len: 54, w: 3, c1: '#ff7a1a', c2: '#ffe08a', glow: 16,
      onHit: (gm, hx, hy) => bulletImpact(gm, hx, hy, { power: 1, size: 1.05 }),
    });
  },
};

export const rifleWeapon: Weapon = {
  id: 'rifle', name: 'Rifle', tag: 'Senapan', sub: 'Tactical Carbine + Red Dot', accent: '#ffe27a',
  desc: 'Akurat dan stabil. Tracer emas-putih dengan jejak asap tipis, lubang peluru rapat di tengah.',
  hint: 'Tahan = tembak otomatis',
  muzzle: 384, muzzleY: 0, scale: 1.1, kick: 11, cooldown: 0.15,
  draw: (ctx, _g, s) => drawAR(ctx, s, false),
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 38, color: '#ffd45a', core: '#ffffff', spikes: 5, spread: 0.55, life: 0.07 });
    g.ring(m.x, m.y - 6, 4, 22, '#ffe9a0', 0.12, 2, 0.5);
    g.light('#ffd070', 0.32);
    gunSmoke(g, m, 2, 0.2);
    eject(g, 190, -14);
    shoot(g, {
      spread: 0.008, speed: 3100, len: 70, w: 3.2, c1: '#ffd24a', c2: '#ffffff', glow: 18, smoke: true,
      onHit: (gm, hx, hy) => bulletImpact(gm, hx, hy, { power: 1.15, size: 1.05, pal: ['#ffffff', '#ffe27a', '#ffb02e'], glow: '#ffe59a' }),
    });
  },
};

export const rifleElectroWeapon: Weapon = {
  id: 'rifle-electro', name: 'Rifle Electro', tag: 'Electro', sub: 'Arc-Rail Carbine', accent: '#3de6ff',
  desc: 'Peluru berselimut listrik dengan petir zig-zag. Saat kena, petir menjalar di sepanjang roda.',
  hint: 'Tahan = tembak otomatis',
  muzzle: 384, muzzleY: 0, scale: 1.1, kick: 10, cooldown: 0.17,
  draw: (ctx, _g, s) => drawAR(ctx, s, true),
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 40, color: '#3de6ff', core: '#ffffff', spikes: 6, spread: 0.7, life: 0.08 });
    g.lightning(m.x, m.y, m.x + rand(-34, 34), m.y - rand(40, 80), { color: '#3de6ff', life: 0.1, width: 1.3, jag: 8 });
    g.light('#3de6ff', 0.4);
    shoot(g, {
      spread: 0.01, speed: 2900, len: 64, w: 3.4, c1: '#1ca6ff', c2: '#c7fbff', glow: 22, electro: '#7df3ff',
      onHit: (gm, hx, hy) => electroImpact(gm, hx, hy, { color: '#3de6ff', power: 1.15, bolts: 3 }),
    });
  },
};

export const mp5Weapon: Weapon = {
  id: 'mp5', name: 'MP5', tag: 'SMG', sub: 'Submachine Gun 9mm', accent: '#ffd23a',
  desc: 'Laju tembak sangat cepat — hujan peluru kuning dan percikan kecil yang rapat.',
  hint: 'Tahan = tembak otomatis',
  muzzle: 304, muzzleY: 0, scale: 1.3, kick: 8, cooldown: 0.062,
  draw: (ctx, _g, s) => drawMP5(ctx, s, false),
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 28, color: '#ffc93a', core: '#ffffff', spikes: 5, spread: 0.9, life: 0.05 });
    g.light('#ffcb5a', 0.25);
    if (Math.random() < 0.4) gunSmoke(g, m, 1, 0.16);
    if (Math.random() < 0.7) eject(g, 130, -12, 4.5);
    shoot(g, {
      spread: 0.045, speed: 2500, len: 36, w: 2.3, c1: '#ffb81f', c2: '#fff0a0', glow: 12,
      onHit: (gm, hx, hy) => bulletImpact(gm, hx, hy, { power: 0.6, size: 0.8, chips: 3, pal: ['#fff3c0', '#ffd24a', '#ff9a2e'] }),
    });
  },
};

export const mp5ElectroWeapon: Weapon = {
  id: 'mp5-electro', name: 'MP5 Electro', tag: 'Electro', sub: 'Plasma-Coil SMG', accent: '#b25cff',
  desc: 'Semburan bolt ungu-biru berloncatan. Tiap peluru meninggalkan bekas hangus bercahaya.',
  hint: 'Tahan = tembak otomatis',
  muzzle: 304, muzzleY: 0, scale: 1.3, kick: 7, cooldown: 0.058,
  draw: (ctx, _g, s) => drawMP5(ctx, s, true),
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 30, color: '#b25cff', core: '#f1dcff', spikes: 5, spread: 0.9, life: 0.05 });
    if (Math.random() < 0.3) g.lightning(m.x, m.y, m.x + rand(-26, 26), m.y - rand(30, 60), { color: '#c78bff', life: 0.08, width: 1.1, jag: 6 });
    g.light('#b25cff', 0.3);
    shoot(g, {
      spread: 0.045, speed: 2600, len: 40, w: 2.4, c1: '#7a3cff', c2: '#f0d8ff', glow: 15, electro: '#d9a8ff',
      onHit: (gm, hx, hy) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 0.6, chips: 3 });
        gm.addEmbed(hx, hy, { kind: 'scorch', color: '#222', glow: '#c070ff', size: 0.75, cracks: 4, cool: 1.2 });
        gm.burst(hx, hy, { n: 7, ang: n, spread: 1.3, speed: [150, 480], life: [0.12, 0.35], size: [1, 2], pal: ['#ffffff', '#d9a8ff', '#8a4cff'], len: 0.05, ay: 300 });
        gm.glow(hx, hy, 28, '#b25cff', 0.12);
        if (Math.random() < 0.55) gm.lightning(hx, hy, hx + Math.cos(n + rand(-1, 1)) * 42, hy + Math.sin(n + rand(-1, 1)) * 42, { color: '#c78bff', life: 0.12, width: 1.2, jag: 6 });
        gm.heatWheel('#b25cff', 0.05);
      },
    });
  },
};

export const berettaWeapon: Weapon = {
  id: 'beretta', name: 'Beretta 92', tag: 'Pistol', sub: 'Semi-Auto 9×19mm', accent: '#e8c070',
  desc: 'Slide mundur realistis, selongsong terlempar dari ejection port, peluru kuningan terlihat melesat.',
  hint: 'Klik = satu tembakan',
  muzzle: 204, muzzleY: 0, scale: 1.7, kick: 14, cooldown: 0.19,
  draw: (ctx, _g, s) => drawBeretta(ctx, s),
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 34, color: '#ffbf45', core: '#ffffff', spikes: 6, spread: 0.8, life: 0.07 });
    g.ring(m.x, m.y - 4, 3, 20, '#ffe0a0', 0.12, 2, 0.5);
    g.light('#ffc060', 0.3);
    gunSmoke(g, m, 2, 0.2);
    eject(g, 96, 14, 5);
    shoot(g, {
      spread: 0.012, speed: 2400, len: 26, w: 2.2, c1: '#ffb347', c2: '#fff0b0', glow: 11, bullet: true, smoke: true,
      onHit: (gm, hx, hy) => bulletImpact(gm, hx, hy, { power: 0.9, size: 1, pal: ['#fff6d0', '#ffcf5a', '#ff9a2e'] }),
    });
  },
};

export const sniperWeapon: Weapon = {
  id: 'sniper-beam', name: 'Sniper Beam', tag: 'Energi', sub: 'Railbeam Anti-Materiel', accent: '#43e8ff',
  desc: 'Cincin energi memadat di moncong, laser pembidik, lalu sinar menembus roda dengan gelombang kejut.',
  hint: 'Klik = tembak (isi ulang energi)',
  muzzle: 414, muzzleY: 0, kick: 24, cooldown: 1.15,
  draw: (ctx, _g, s) => drawSniper(ctx, s),
  drawOverlay: (ctx, g, s) => {
    if (s.ready < 0.98 || !g.active) return;
    const m = g.muzzlePos();
    const a = g.aim();
    add(ctx);
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -s.t * 120;
    ctx.strokeStyle = rgba('#43e8ff', 0.28 + 0.1 * Math.sin(s.t * 20));
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    ctx.setLineDash([]);
    drawGlow(ctx, a.x, a.y, 14, '#ff3a4a', 0.9);
    drawGlow(ctx, a.x, a.y, 5, '#ffffff', 1);
    ctx.strokeStyle = rgba('#43e8ff', 0.7);
    ctx.lineWidth = 1.4;
    const r = 18 + Math.sin(s.t * 6) * 2;
    ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, 7); ctx.stroke();
    for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(a.x + Math.cos(an) * (r - 4), a.y + Math.sin(an) * (r - 4)); ctx.lineTo(a.x + Math.cos(an) * (r + 7), a.y + Math.sin(an) * (r + 7)); ctx.stroke(); }
    norm(ctx);
  },
  fire: (g) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const blocked = a.hit && g.knifeNear(a.x, a.y);
    const endY = a.y;
    g.light('#43e8ff', 0.8);
    g.muzzleFlash(m.x, m.y, { size: 70, color: '#43e8ff', core: '#ffffff', spikes: 8, spread: 0.5, life: 0.12 });
    g.ring(m.x, m.y, 6, 70, '#8ff3ff', 0.3, 5, 0.45);
    g.shake(5);
    // the beam
    g.addFx({
      max: 0.42, add: true,
      draw: (ctx, k) => {
        const e = 1 - k;
        const L = m.y - endY;
        const grd = (w: number, c: string, al: number) => {
          ctx.strokeStyle = rgba(c, al); ctx.lineWidth = w; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x, endY); ctx.stroke();
        };
        grd(64 * e * e, '#1a8cff', 0.18);
        grd(34 * e, '#43e8ff', 0.4);
        grd(14 * Math.pow(e, 0.7), '#bff8ff', 0.85);
        grd(6 * Math.pow(e, 0.5), '#ffffff', 1);
        // mach rings travelling along the beam
        ctx.lineWidth = 2;
        for (let i = 0; i < 9; i++) {
          const t = (i / 9 + k * 1.3) % 1;
          const y = m.y - L * t;
          const rx = 10 + 26 * (1 - t) * e + 6;
          ctx.strokeStyle = rgba('#aef6ff', 0.7 * e * (1 - t * 0.5));
          ctx.beginPath(); ctx.ellipse(m.x, y, rx, rx * 0.22, 0, 0, 7); ctx.stroke();
        }
        drawGlow(ctx, m.x, endY, 80 * e + 20, '#43e8ff', 0.8 * e);
        drawGlow(ctx, m.x, endY, 30 * e + 10, '#ffffff', 0.9 * e);
      },
    });
    if (!a.hit) return;
    if (blocked) { g.ricochet(a.x, a.y); return; }
    // slight delay for impact feel is skipped: beam is instant
    g.hit(a.x, a.y, { power: 2.4, count: 2, chips: 18, kick: 1.5, flash: 1, shake: 9, stop: 0.07 });
    g.addEmbed(a.x, a.y, { kind: 'crater', color: '#222', glow: '#43e8ff', size: 1.15, cracks: 9, cool: 2.4 });
    g.heatWheel('#43e8ff', 0.7);
    g.ring(a.x, a.y, 6, 120, '#43e8ff', 0.5, 7, 0.5);
    g.ring(a.x, a.y, 4, 70, '#ffffff', 0.32, 3, 0.5);
    g.glow(a.x, a.y, 110, '#43e8ff', 0.35);
    g.burst(a.x, a.y, { n: 36, ang: Math.PI / 2, spread: 1.5, speed: [250, 900], life: [0.2, 0.6], size: [1, 2.8], pal: ['#ffffff', '#8ff3ff', '#2db6ff'], len: 0.05, ay: 500 });
    for (let i = 0; i < 4; i++) g.lightning(a.x, a.y, a.x + rand(-80, 80), a.y + rand(10, 70), { color: '#43e8ff', life: 0.2, width: 1.6, jag: 10 });
    // piercing exit on the far side of the wheel
    const ty = g.wy - g.R;
    g.glow(a.x, ty, 70, '#8ff3ff', 0.4, 0.9);
    g.ring(a.x, ty, 4, 70, '#8ff3ff', 0.4, 4, 0.5);
    g.burst(a.x, ty, { n: 24, ang: -Math.PI / 2, spread: 0.7, speed: [300, 1000], life: [0.25, 0.7], size: [1, 2.6], pal: ['#ffffff', '#8ff3ff'], len: 0.05, ay: 200 });
    g.burst(a.x, ty, { n: 8, type: 'chip', ang: -Math.PI / 2, spread: 0.8, speed: [200, 500], life: [0.6, 1.1], size: [2.5, 5], pal: ['#e0a964', '#8a5226'], ay: 800, vr: 15 });
  },
};

export const firearms: Weapon[] = [
  akWeapon, rifleWeapon, rifleElectroWeapon, mp5Weapon, mp5ElectroWeapon, berettaWeapon, sniperWeapon,
];
void pick;
