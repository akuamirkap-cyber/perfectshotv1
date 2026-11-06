import type { Game } from '../engine';
import type { Weapon, WeaponState } from '../types';
import {
  TAU, add, clamp, drawGlow, easeOut, hgrad, lerp, metalBox, norm, pick, rand, rgba, rr, vgrad, wobblePath,
} from '../util';

type C = CanvasRenderingContext2D;

const WOOD = ['#f0c283', '#d9a062', '#b4733a', '#8a5226'];

export function hexPath(ctx: C, x: number, y: number, r: number, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i / 6) * TAU;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

/* ================================================================================= */
/*  1. SINGULARITY CANNON — mini black hole with accretion disk (Interstellar-style)   */
/* ================================================================================= */
const DISK = ['#ffffff', '#ffeab0', '#ffb347', '#ff6a3a', '#d6359a', '#8a3cff', '#4a1fa0'];

function drawBlackHole(ctx: C, x: number, y: number, r: number, t: number, inten = 1, tilt = -0.18) {
  if (r < 1) return;
  add(ctx);
  drawGlow(ctx, x, y, r * 4.6, '#5a1ec8', 0.32 * inten);
  drawGlow(ctx, x, y, r * 2.6, '#ff7a2a', 0.2 * inten);
  norm(ctx);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  const disk = (front: boolean) => {
    add(ctx);
    ctx.lineCap = 'butt';
    for (let k = 0; k < 7; k++) {
      const u = k / 6;
      const rx = r * (1.3 + u * 1.9);
      const ry = rx * 0.26;
      const col = DISK[k];
      const gr = ctx.createLinearGradient(-rx, 0, rx, 0);
      gr.addColorStop(0, rgba(col, 0.2 * inten));
      gr.addColorStop(0.55, rgba(col, 0.5 * inten));
      gr.addColorStop(1, rgba(col, 0.95 * inten));
      const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
      ctx.strokeStyle = gr;
      ctx.lineWidth = r * (0.2 - u * 0.1) + 0.6;
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, a0, a1); ctx.stroke();
      ctx.setLineDash([r * (1.6 - u * 0.8) + 1, r * 0.5 + 1]);
      ctx.lineDashOffset = -t * r * (5 - u * 3.2);
      ctx.strokeStyle = rgba('#ffffff', (0.55 - u * 0.35) * inten);
      ctx.lineWidth = Math.max(0.6, r * 0.05);
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, a0, a1); ctx.stroke();
      ctx.setLineDash([]);
    }
    norm(ctx);
  };
  disk(false);
  // gravitationally-lensed image of the disk, wrapping over/under the horizon
  add(ctx);
  ctx.lineCap = 'round';
  for (const sg of [-1, 1]) {
    const a0 = sg < 0 ? Math.PI * 1.08 : Math.PI * 0.08;
    const a1 = sg < 0 ? Math.PI * 1.92 : Math.PI * 0.92;
    ctx.strokeStyle = rgba('#ffa85a', 0.5 * inten); ctx.lineWidth = r * 0.32;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.2, r * 1.12, 0, a0, a1); ctx.stroke();
    ctx.strokeStyle = rgba('#ffffff', 0.85 * inten); ctx.lineWidth = Math.max(0.8, r * 0.1);
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.2, r * 1.12, 0, a0, a1); ctx.stroke();
  }
  norm(ctx);
  // event horizon
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  add(ctx);
  ctx.strokeStyle = rgba('#ffe2b0', 0.9 * inten); ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath(); ctx.arc(0, 0, r * 1.02, 0, TAU); ctx.stroke();
  norm(ctx);
  disk(true);
  ctx.restore();
}

/** matter spiralling into the hole (all in the disk plane) */
function inflow(ctx: C, x: number, y: number, r: number, t: number, tilt: number, n = 22) {
  add(ctx);
  const ct = Math.cos(tilt), st = Math.sin(tilt);
  for (let i = 0; i < n; i++) {
    const u = (t * 0.85 + i / n) % 1;
    const rad = r * (5 - 3.6 * u);
    const a = i * 2.399 + u * 7;
    const px = Math.cos(a) * rad, py = Math.sin(a) * rad * 0.3;
    const wx = x + px * ct - py * st, wy = y + px * st + py * ct;
    drawGlow(ctx, wx, wy, 3 + (1 - u) * 5, u > 0.6 ? '#ffd9a0' : '#c58aff', Math.sin(Math.PI * u) * 0.9);
  }
  norm(ctx);
}

function singularity(g: Game, hx: number) {
  const HANG = 1.0, COL = 0.14;
  const pos = () => {
    const dx = hx - g.cx;
    return { x: hx, y: g.wy + Math.sqrt(Math.max(0, g.R * g.R - dx * dx)) };
  };
  let acc = 0, ringAcc = 0, collapsed = false;
  const p0 = pos();
  g.hit(p0.x, p0.y, { power: 0.7, count: 0, chips: 6, kick: 0.6, shake: 2, flash: 0.3 });
  g.ring(p0.x, p0.y, 4, 80, '#c070ff', 0.35, 4, 0.5);
  g.glow(p0.x, p0.y, 90, '#8a3cff', 0.3);

  g.addFx({
    max: HANG + COL + 0.05,
    draw: (ctx, _k, fx) => {
      const p = pos();
      const t = fx.age;
      let r: number, inten = 1;
      if (t < 0.25) { r = 6 + 22 * easeOut(t / 0.25); inten = t / 0.25; }
      else if (t < HANG) r = 28 + Math.sin(t * 34) * 1.6;
      else { const u = clamp((t - HANG) / COL); r = 28 * (1 - u * u); inten = 1 - u * 0.4; }
      inflow(ctx, p.x, p.y, r, t, -0.18, 26);
      drawBlackHole(ctx, p.x, p.y, r, t, inten, -0.18);
    },
    update: (dt, fx) => {
      if (!g.active) { fx.age = fx.max; return; }
      const p = pos();
      const t = fx.age;
      if (t < HANG) {
        const pw = clamp(t / 0.3);
        for (const q of g.parts) {
          if (q.type === 'ring') continue;
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d > 200 || d < 1) continue;
          if (d < 10) { q.life = 0; continue; }
          const a = (900 + 4200 * (1 - d / 200)) * pw;
          q.vx += (dx / d) * a * dt + (-dy / d) * 650 * dt * pw;
          q.vy += (dy / d) * a * dt + (dx / d) * 650 * dt * pw;
          q.vx *= 1 - dt * 1.1; q.vy *= 1 - dt * 1.1;
        }
        acc += dt; ringAcc += dt;
        while (acc > 0.03) {
          acc -= 0.03;
          const a = -Math.PI / 2 + rand(-1, 1) * 1.45;
          const rad = rand(34, 110);
          const x = p.x + Math.cos(a) * rad, y = p.y + Math.sin(a) * rad * 0.85;
          if (Math.hypot(x - g.cx, y - g.wy) > g.R - 4) continue;
          g.spawn({ type: 'chip', x, y, vx: rand(-50, 50), vy: rand(-50, 50), size: rand(1.8, 4.2), life: rand(0.5, 0.9), vr: rand(-20, 20), pal: [pick(WOOD)] });
        }
        if (ringAcc > 0.2) { ringAcc = 0; g.ring(p.x, p.y, 96, 14, '#c070ff', 0.3, 2, 0.5); }
        g.shake(1.1 + t * 1.8);
        g.heatWheel('#8a3cff', dt * 0.9);
        g.light('#8a3cff', 0.25);
      } else if (!collapsed) {
        collapsed = true;
        g.hit(p.x, p.y, { power: 2.6, count: 2, chips: 24, kick: 1.7, flash: 0.8, shake: 12, stop: 0.09 });
        g.addEmbed(p.x, p.y, { kind: 'crater', color: '#222', glow: '#b24cff', size: 1.35, cracks: 10, cool: 2.8 });
        g.heatWheel('#b24cff', 0.6);
        g.light('#c070ff', 0.95);
        g.ring(p.x, p.y, 6, 190, '#c070ff', 0.55, 8, 0.5);
        g.ring(p.x, p.y, 4, 120, '#ffffff', 0.34, 4, 0.5);
        g.ring(p.x, p.y, 2, 260, '#ff9a4a', 0.75, 3, 0.5);
        g.glow(p.x, p.y, 170, '#a24cff', 0.4);
        g.glow(p.x, p.y, 80, '#ffffff', 0.2);
        const n = g.normalAt(p.x, p.y);
        g.burst(p.x, p.y, { n: 46, ang: n, spread: 1.6, speed: [240, 1000], life: [0.3, 0.8], size: [1, 2.8], pal: ['#ffffff', '#ffb36a', '#c070ff', '#6a2cff'], len: 0.05, ay: 500 });
        g.burst(p.x, p.y, { n: 16, type: 'glow', ang: n, spread: 1.6, speed: [80, 380], life: [0.5, 1.1], size: [4, 10], size1: 0, pal: ['#c070ff', '#4a1fa0'], ay: 200 });
        for (let i = 0; i < 4; i++) {
          const a = n + rand(-1.3, 1.3);
          g.lightning(p.x, p.y, p.x + Math.cos(a) * rand(70, 150), p.y + Math.sin(a) * rand(70, 150), { color: '#c070ff', life: 0.26, width: 1.8, jag: 10 });
        }
      }
    },
  });
}

function drawSingularity(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const V = '#b24cff', O = '#ff8a3a';
  const DK = ['#6b7088', '#363a4e', '#161824', '#0a0b12'];
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 18, 94, ['#3b3f55', '#1b1d2a', '#090a10']);
  ctx.beginPath(); ctx.moveTo(116, 18); ctx.lineTo(160, 18); ctx.lineTo(150, 88); ctx.lineTo(108, 94); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  add(ctx); ctx.fillStyle = rgba(V, 0.4 + 0.35 * pulse);
  ctx.beginPath(); ctx.moveTo(132, 30); ctx.lineTo(139, 30); ctx.lineTo(133, 80); ctx.lineTo(127, 80); ctx.closePath(); ctx.fill(); norm(ctx);
  ctx.strokeStyle = '#4b5068'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(168, 24); ctx.quadraticCurveTo(168, 52, 188, 50); ctx.quadraticCurveTo(204, 48, 204, 26); ctx.stroke();
  // rear power core
  metalBox(ctx, -6, -38, 120, 76, 24, DK, 0.3);
  for (let i = 0; i < 6; i++) {
    const x = 8 + i * 17;
    metalBox(ctx, x, -43, 8, 26, 3, ['#ffe0a8', '#c47a2c', '#5a3110', '#2a1608'], 0.4);
    metalBox(ctx, x, 17, 8, 26, 3, ['#ffe0a8', '#c47a2c', '#5a3110', '#2a1608'], 0.4);
  }
  ctx.fillStyle = '#07040f'; rr(ctx, 12, -17, 92, 34, 15); ctx.fill();
  ctx.save(); rr(ctx, 12, -17, 92, 34, 15); ctx.clip(); add(ctx);
  for (let i = 0; i < 3; i++) {
    const a0 = t * (2 + i * 0.9) + i * 2.1;
    ctx.strokeStyle = rgba(i === 1 ? O : V, 0.5 + 0.3 * pulse); ctx.lineWidth = 3 - i * 0.6;
    ctx.beginPath(); ctx.ellipse(58, 0, 42 - i * 9, 11 + i * 2, 0, a0, a0 + 3.3); ctx.stroke();
  }
  drawGlow(ctx, 58, 0, 44, V, 0.3 + 0.45 * rd);
  drawGlow(ctx, 58, 0, 14, '#ffffff', 0.3 + 0.5 * rd);
  norm(ctx); ctx.restore();
  // main body
  metalBox(ctx, 104, -30, 160, 56, 10, DK, 0.3);
  add(ctx);
  ctx.strokeStyle = rgba(O, 0.45 + 0.4 * pulse); ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(116, -21); ctx.lineTo(178, -21); ctx.lineTo(194, -9); ctx.lineTo(256, -9); ctx.stroke();
  ctx.strokeStyle = rgba(V, 0.45 + 0.4 * pulse);
  ctx.beginPath(); ctx.moveTo(116, 16); ctx.lineTo(178, 16); ctx.lineTo(194, 6); ctx.lineTo(256, 6); ctx.stroke();
  norm(ctx);
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  for (let i = 0; i < 5; i++) rr(ctx, 208 + i * 10, -4, 5, 8, 2), ctx.fill();
  // charge gauge
  ctx.fillStyle = '#05030b'; rr(ctx, 118, -4, 80, 10, 4); ctx.fill();
  add(ctx);
  const gg = ctx.createLinearGradient(120, 0, 196, 0);
  gg.addColorStop(0, rgba(V, 0.9)); gg.addColorStop(1, rgba(O, 0.95));
  ctx.fillStyle = gg; rr(ctx, 120, -2, 76 * rd, 6, 3); ctx.fill();
  norm(ctx);
  // barrel
  metalBox(ctx, 256, -10, 124, 20, 5, ['#4a4f66', '#1c1e2c', '#08090f'], 0.3);
  add(ctx); ctx.fillStyle = rgba(V, 0.45 + 0.4 * pulse); ctx.fillRect(262, -2, 110, 4); norm(ctx);
  // containment hoops
  for (let i = 0; i < 3; i++) {
    const x = 274 + i * 30, h = 36 + i * 10;
    const on = clamp(rd * 4 - i * 0.8);
    metalBox(ctx, x, -h, 12, h * 2, 5, DK, 0.35);
    add(ctx);
    ctx.fillStyle = rgba(V, 0.25 + 0.7 * on); rr(ctx, x + 3.5, -h + 6, 5, h * 2 - 12, 2); ctx.fill();
    drawGlow(ctx, x + 6, -h + 4, 15, O, 0.6 * on);
    drawGlow(ctx, x + 6, h - 4, 15, O, 0.6 * on);
    norm(ctx);
  }
  add(ctx);
  for (const sg of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      wobblePath(ctx, 286, sg * 36, 346, sg * 56, 3.4, 11, t * 18 + k * 2 + sg, 20, true);
      ctx.strokeStyle = rgba(k ? '#ffffff' : V, 0.15 + 0.6 * rd); ctx.lineWidth = k ? 1 : 2.4; ctx.stroke();
    }
  }
  norm(ctx);
  // singularity at the muzzle
  const r = 4 + 10 * rd;
  inflow(ctx, 396, 0, r, t, Math.PI / 2 - 0.18, 12);
  drawBlackHole(ctx, 396, 0, r, t, 0.35 + 0.65 * rd, Math.PI / 2 - 0.18);
}

export const singularityWeapon: Weapon = {
  id: 'singularity', name: 'Singularity Cannon', tag: 'Langka', sub: 'Event-Horizon Projector', accent: '#b24cff',
  desc: 'Meriam gravitasi: menembakkan lubang hitam mini lengkap dengan piringan akresi. Saat menempel, serpihan kayu tersedot berputar sebelum runtuh jadi ledakan.',
  hint: 'Klik = tembak lubang hitam',
  muzzle: 396, muzzleY: 0, kick: 18, cooldown: 1.4,
  draw: drawSingularity,
  fire: (g) => {
    const m = g.muzzlePos();
    g.light('#b24cff', 0.7); g.shake(4);
    g.ring(m.x, m.y, 80, 6, '#c070ff', 0.26, 3, 0.55);
    g.ring(m.x, m.y, 130, 10, '#ff9a4a', 0.32, 2, 0.55);
    g.ring(m.x, m.y, 10, 100, '#ffffff', 0.34, 4, 0.5);
    g.glow(m.x, m.y, 120, '#8a3cff', 0.22);
    g.burst(m.x, m.y + 6, { n: 18, ang: Math.PI / 2, spread: 1.4, speed: [150, 520], life: [0.2, 0.5], size: [1, 2.4], pal: ['#ffffff', '#ffb36a', '#c070ff'], len: 0.05, ay: 200 });
    g.lightning(m.x, m.y, m.x - 70, m.y + 40, { color: '#c070ff', life: 0.14, width: 1.5, jag: 8 });
    g.lightning(m.x, m.y, m.x + 70, m.y + 40, { color: '#ff9a4a', life: 0.14, width: 1.5, jag: 8 });
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -380,
      update: (gm, dt, p) => {
        p.vy = Math.max(-1600, p.vy - 2200 * dt);
        if (Math.random() < dt * 80) gm.spawn({ type: 'glow', x: p.x + rand(-14, 14), y: p.y + rand(10, 34), vx: rand(-20, 20), vy: rand(40, 140), size: rand(5, 10), size1: 0, life: rand(0.3, 0.5), pal: ['#ffb066', '#a24cff', '#2a1060'], alpha: 0.7 });
      },
      draw: (ctx, _g, p) => {
        add(ctx);
        const gr = ctx.createLinearGradient(p.x, p.y, p.x, p.y + 190);
        gr.addColorStop(0, 'rgba(178,76,255,.55)'); gr.addColorStop(1, 'rgba(178,76,255,0)');
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.moveTo(p.x - 20, p.y); ctx.lineTo(p.x - 3, p.y + 190); ctx.lineTo(p.x + 3, p.y + 190); ctx.lineTo(p.x + 20, p.y); ctx.closePath(); ctx.fill();
        norm(ctx);
        inflow(ctx, p.x, p.y, 17, p.age, -0.2, 22);
        drawBlackHole(ctx, p.x, p.y, 17 + Math.sin(p.age * 24) * 1.2, p.age, 1, -0.2);
      },
      onHit: (gm, hx) => singularity(gm, hx),
    });
  },
};

/* ================================================================================= */
/*  2. PRISM LANCE — white photon bolt → glass prism → 7 spectral beams                */
/* ================================================================================= */
const SPEC = ['#ff3b4a', '#ff9a2e', '#ffe23a', '#45f06a', '#3ad8ff', '#5a7bff', '#c056ff'];

function drawPrismLance(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const PEARL = ['#ffffff', '#e4ecf7', '#a9b6cc', '#5b667c'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // stock
  ctx.fillStyle = vgrad(ctx, -26, 30, PEARL);
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(30, -28, 98, -26); ctx.lineTo(102, 20); ctx.lineTo(62, 22); ctx.quadraticCurveTo(26, 32, 0, 30); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,40,70,.7)'; ctx.lineWidth = 1.3; ctx.stroke();
  add(ctx);
  const sg = ctx.createLinearGradient(8, 0, 92, 0);
  SPEC.forEach((c, i) => sg.addColorStop(i / 6, rgba(c, 0.7)));
  ctx.fillStyle = sg; ctx.fillRect(10, -3, 82, 3.4);
  norm(ctx);
  // grip
  ctx.fillStyle = vgrad(ctx, 20, 88, ['#cdd6e6', '#7e8aa2', '#343c50']);
  ctx.beginPath(); ctx.moveTo(122, 20); ctx.lineTo(166, 20); ctx.lineTo(158, 82); ctx.lineTo(116, 88); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(30,40,70,.7)'; ctx.stroke();
  ctx.fillStyle = '#10131c';
  ctx.beginPath(); ctx.moveTo(140, 34); ctx.lineTo(150, 48); ctx.lineTo(140, 62); ctx.lineTo(130, 48); ctx.closePath(); ctx.fill();
  add(ctx);
  const gi = ctx.createLinearGradient(130, 34, 150, 62);
  SPEC.forEach((c, i) => gi.addColorStop(i / 6, rgba(c, 0.55 + 0.4 * Math.sin(t * 3 + i))));
  ctx.fillStyle = gi;
  ctx.beginPath(); ctx.moveTo(140, 38); ctx.lineTo(146, 48); ctx.lineTo(140, 58); ctx.lineTo(134, 48); ctx.closePath(); ctx.fill();
  norm(ctx);
  ctx.strokeStyle = '#7e8aa2'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(170, 24); ctx.quadraticCurveTo(170, 50, 188, 48); ctx.quadraticCurveTo(202, 46, 202, 26); ctx.stroke();
  // body
  metalBox(ctx, 92, -28, 152, 50, 14, PEARL, 0.55);
  add(ctx);
  const bg = ctx.createLinearGradient(110, 0, 230, 0);
  SPEC.forEach((c, i) => bg.addColorStop(i / 6, rgba(c, 0.5)));
  ctx.fillStyle = bg; rr(ctx, 110, 6, 122, 4, 2); ctx.fill();
  const band = ((t * 0.5) % 1) * 140 + 100;
  const bgw = ctx.createLinearGradient(band - 20, 0, band + 20, 0);
  bgw.addColorStop(0, 'rgba(255,255,255,0)'); bgw.addColorStop(0.5, 'rgba(255,255,255,.7)'); bgw.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = bgw; ctx.fillRect(band - 20, -26, 40, 44);
  norm(ctx);
  ctx.fillStyle = 'rgba(20,28,50,.55)'; rr(ctx, 110, -14, 70, 12, 5); ctx.fill();
  add(ctx);
  ctx.fillStyle = rgba('#7ad8ff', 0.8); rr(ctx, 113, -11, 64 * rd, 6, 3); ctx.fill();
  norm(ctx);
  // crystal chamber
  const x0 = 128, x1 = 264;
  metalBox(ctx, x0 - 8, -62, 10, 36, 3, PEARL, 0.5);
  metalBox(ctx, x1 - 2, -62, 10, 36, 3, PEARL, 0.5);
  ctx.beginPath();
  ctx.moveTo(x0, -44); ctx.lineTo(x0 + 16, -62); ctx.lineTo(x1 - 16, -62); ctx.lineTo(x1, -44); ctx.lineTo(x1 - 16, -26); ctx.lineTo(x0 + 16, -26); ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -62, -26, ['rgba(235,246,255,.9)', 'rgba(150,180,230,.55)', 'rgba(90,110,170,.7)']);
  ctx.fill();
  ctx.save(); ctx.clip(); add(ctx);
  for (let i = 0; i < 7; i++) {
    const x = x0 - 20 + (((i / 7) + t * 0.12) % 1) * (x1 - x0 + 40);
    ctx.fillStyle = rgba(SPEC[i], 0.28 + 0.4 * rd);
    ctx.beginPath(); ctx.moveTo(x, -62); ctx.lineTo(x + 18, -62); ctx.lineTo(x + 2, -26); ctx.lineTo(x - 16, -26); ctx.closePath(); ctx.fill();
  }
  drawGlow(ctx, (x0 + x1) / 2, -44, 70, '#bfe6ff', 0.25 + 0.35 * rd);
  norm(ctx); ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, -44); ctx.lineTo(x0 + 16, -62); ctx.lineTo(x1 - 16, -62); ctx.lineTo(x1, -44); ctx.lineTo(x1 - 16, -26); ctx.lineTo(x0 + 16, -26); ctx.closePath(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x0 + 16, -62); ctx.lineTo(x0 + 16, -26); ctx.moveTo(x1 - 16, -62); ctx.lineTo(x1 - 16, -26); ctx.moveTo(x0, -44); ctx.lineTo(x1, -44); ctx.stroke();
  // barrel rails
  metalBox(ctx, 240, -16, 104, 8, 3, PEARL, 0.5);
  metalBox(ctx, 240, 8, 104, 8, 3, PEARL, 0.5);
  add(ctx);
  const ch = ctx.createLinearGradient(240, 0, 346, 0);
  ch.addColorStop(0, 'rgba(190,230,255,.2)'); ch.addColorStop(1, 'rgba(255,255,255,.9)');
  ctx.fillStyle = ch; ctx.fillRect(242, -6, 104, 12);
  norm(ctx);
  for (let i = 0; i < 3; i++) {
    const x = 262 + i * 30;
    const on = clamp(rd * 4 - i * 0.9);
    metalBox(ctx, x, -26, 8, 52, 3, PEARL, 0.5);
    add(ctx);
    ctx.fillStyle = rgba(SPEC[2 + i * 2 > 6 ? 6 : 2 + i * 2], 0.3 + 0.65 * on); ctx.fillRect(x + 2, -22, 4, 44);
    drawGlow(ctx, x + 4, 0, 24, SPEC[2 + i * 2 > 6 ? 6 : 2 + i * 2], 0.4 * on);
    norm(ctx);
  }
  // muzzle lens
  ctx.beginPath(); ctx.moveTo(344, 0); ctx.lineTo(364, -17); ctx.lineTo(388, 0); ctx.lineTo(364, 17); ctx.closePath();
  ctx.fillStyle = hgrad(ctx, 344, 388, ['rgba(220,240,255,.95)', 'rgba(120,170,255,.6)', 'rgba(255,255,255,.95)']); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 1.6; ctx.stroke();
  add(ctx);
  drawGlow(ctx, 366, 0, 24 + 34 * rd, '#bfe6ff', 0.4 + 0.5 * rd);
  drawGlow(ctx, 366, 0, 10 + 8 * rd, '#ffffff', 0.9);
  for (let i = 0; i < 7; i++) {
    const a = t * 3 + (i / 7) * TAU;
    drawGlow(ctx, 366 + Math.cos(a) * 11, Math.sin(a) * 9, 7, SPEC[i], 0.35 + 0.6 * rd);
  }
  norm(ctx);
}

export function tracer(ctx: C, p: { x: number; y: number; vx: number; vy: number }, c: string, len: number, w: number) {
  const sp = Math.hypot(p.vx, p.vy) || 1;
  const ux = p.vx / sp, uy = p.vy / sp;
  const tx = p.x - ux * len, ty = p.y - uy * len;
  add(ctx);
  ctx.lineCap = 'round';
  const gr = ctx.createLinearGradient(tx, ty, p.x, p.y);
  gr.addColorStop(0, rgba(c, 0)); gr.addColorStop(0.7, rgba(c, 0.7)); gr.addColorStop(1, rgba(c, 1));
  ctx.strokeStyle = gr; ctx.lineWidth = w * 3;
  ctx.globalAlpha = 0.45;
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(p.x, p.y); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineWidth = w;
  ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(p.x, p.y); ctx.stroke();
  ctx.strokeStyle = rgba('#ffffff', 0.95); ctx.lineWidth = w * 0.4;
  ctx.beginPath(); ctx.moveTo(p.x - ux * len * 0.5, p.y - uy * len * 0.5); ctx.lineTo(p.x, p.y); ctx.stroke();
  drawGlow(ctx, p.x, p.y, w * 5, c, 0.95);
  drawGlow(ctx, p.x, p.y, w * 2, '#ffffff', 0.95);
  norm(ctx);
}

function prismGlass(ctx: C, x: number, y: number, k: number) {
  const sc = 0.4 + 0.6 * easeOut(Math.min(1, k * 6));
  const al = 1 - clamp((k - 0.35) / 0.65);
  add(ctx);
  drawGlow(ctx, x, y, 90 * sc, '#9ad0ff', 0.55 * al);
  drawGlow(ctx, x, y, 38 * sc, '#ffffff', 0.6 * al);
  norm(ctx);
  ctx.save();
  ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.globalAlpha = al;
  ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(-34, 24); ctx.lineTo(34, 24); ctx.closePath();
  const gr = ctx.createLinearGradient(-30, -30, 30, 24);
  gr.addColorStop(0, 'rgba(255,255,255,.65)'); gr.addColorStop(0.5, 'rgba(160,210,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,.5)');
  ctx.fillStyle = gr; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.98)'; ctx.lineWidth = 2.6; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 24); ctx.moveTo(-17, -7); ctx.lineTo(17, -7); ctx.stroke();
  add(ctx);
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = rgba(SPEC[i], 0.9);
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(16, 4); ctx.lineTo(16 + 26, 4 - 28 + (i - 3) * 6.5); ctx.stroke();
  }
  norm(ctx);
  ctx.restore();
}

function spectrumSplit(g: Game, x: number, y: number) {
  const t0 = g.time;
  g.addFx({ max: 0.55, draw: (ctx, k) => prismGlass(ctx, x, y, k) });
  g.light('#cfe8ff', 0.6);
  g.ring(x, y, 6, 80, '#ffffff', 0.32, 3, 0.5);
  SPEC.forEach((c, i) => g.ring(x, y, 4, 46 + i * 7, c, 0.26 + i * 0.02, 2, 0.5));
  g.burst(x, y, { n: 26, type: 'glow', ang: -Math.PI / 2, spread: 1.2, speed: [60, 380], life: [0.3, 0.8], size: [2, 5], size1: 0, pal: SPEC, rpal: true });
  g.burst(x, y, { n: 14, ang: -Math.PI / 2, spread: 1.3, speed: [200, 700], life: [0.15, 0.4], size: [1, 2], pal: ['#ffffff', '#bfe6ff'], len: 0.05 });
  void t0;
  for (let i = 0; i < 7; i++) {
    const c = SPEC[i];
    const ang = (i - 3) * 0.135;
    g.addProj({
      x, y, vx: Math.sin(ang) * 2400, vy: -Math.cos(ang) * 2400, data: { i },
      update: (gm, dt, p) => {
        if (Math.random() < dt * 40) gm.spawn({ type: 'glow', x: p.x + rand(-4, 4), y: p.y + rand(0, 40), size: rand(2, 4), size1: 0, life: 0.3, pal: [c, '#ffffff'], alpha: 0.7, vx: rand(-20, 20), vy: rand(10, 60) });
      },
      draw: (ctx, _g, p) => tracer(ctx, p, c, 120, 3),
      onHit: (gm, hx, hy) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 0.5, count: i === 3 ? 1 : 0, chips: 3, dust: false, kick: 0.45, shake: 0.7, flash: 0.1 });
        gm.addEmbed(hx, hy, { kind: 'scorch', color: '#222', glow: c, size: 0.5, cracks: 2, cool: 2 });
        gm.burst(hx, hy, { n: 9, ang: n, spread: 1.4, speed: [160, 520], life: [0.15, 0.4], size: [1, 2.2], pal: [c, '#ffffff'], len: 0.05, ay: 400 });
        gm.glow(hx, hy, 34, c, 0.14);
        gm.ring(hx, hy, 3, 26, c, 0.25, 2.4, 0.45);
        if (i === 3) {
          gm.hit(hx, hy, { power: 0.3, count: 0, chips: 4, kick: 0.3, shake: 1.5, flash: 0.4 });
          gm.light('#ffffff', 0.4);
          gm.ring(hx, hy, 6, 96, '#ffffff', 0.4, 4, 0.45);
          gm.addFx({
            max: 0.36, add: true,
            draw: (ctx, k) => {
              const a = 1 - k, l = 90 * easeOut(Math.min(1, k * 2));
              ctx.lineCap = 'round';
              for (let j = 0; j < 7; j++) {
                const aa = (j / 7) * TAU + 0.3;
                ctx.strokeStyle = rgba(SPEC[j], a); ctx.lineWidth = 3 * a + 0.5;
                ctx.beginPath(); ctx.moveTo(hx + Math.cos(aa) * 10, hy + Math.sin(aa) * 10); ctx.lineTo(hx + Math.cos(aa) * l, hy + Math.sin(aa) * l); ctx.stroke();
              }
              ctx.strokeStyle = rgba('#ffffff', a); ctx.lineWidth = 2;
              ctx.beginPath(); ctx.moveTo(hx - 120 * a, hy); ctx.lineTo(hx + 120 * a, hy); ctx.moveTo(hx, hy - 70 * a); ctx.lineTo(hx, hy + 70 * a); ctx.stroke();
            },
          });
        }
      },
    });
  }
}

export const prismWeapon: Weapon = {
  id: 'prism-lance', name: 'Prism Lance', tag: 'Langka', sub: 'Spectral Refraction Rifle', accent: '#7ad8ff',
  desc: 'Peluru foton putih menembus prisma kaca melayang dan terurai menjadi 7 sinar warna pelangi. Tiap sinar meninggalkan bintik warna di kayu.',
  hint: 'Klik = tembak spektrum',
  muzzle: 388, muzzleY: 0, kick: 12, cooldown: 0.75,
  draw: drawPrismLance,
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 46, color: '#bfe6ff', core: '#ffffff', spikes: 6, spread: 0.55, life: 0.09 });
    SPEC.forEach((c, i) => g.ring(m.x, m.y, 4 + i * 2, 36 + i * 6, c, 0.2 + i * 0.02, 2.2, 0.45));
    g.light('#cfe8ff', 0.5);
    const splitY = g.wy0 + g.R + 118;
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -2800, noCollide: true,
      update: (gm, _dt, p) => {
        if (p.y <= splitY) { p.alive = false; spectrumSplit(gm, p.x, splitY); }
      },
      draw: (ctx, _g, p) => tracer(ctx, p, '#dff2ff', 90, 4),
      onHit: () => {},
    });
  },
};

/* ================================================================================= */
/*  3. NANO-SWARM LAUNCHER — a cloud of homing nanite drones that eat the wood         */
/* ================================================================================= */
function drawNano(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const L = '#c6ff3a';
  const DK = ['#5b685b', '#2c352e', '#111612', '#070907'];
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // grip
  ctx.fillStyle = vgrad(ctx, 20, 92, ['#3a4439', '#1b221c', '#0a0d0a']);
  ctx.beginPath(); ctx.moveTo(116, 22); ctx.lineTo(162, 22); ctx.lineTo(152, 86); ctx.lineTo(108, 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
  add(ctx);
  for (let i = 0; i < 4; i++) {
    hexPath(ctx, 134 + (i % 2) * 6 - 3, 38 + i * 14, 6, 0);
    ctx.strokeStyle = rgba(L, 0.3 + 0.6 * Math.max(0, Math.sin(t * 5 - i))); ctx.lineWidth = 1.4; ctx.stroke();
  }
  norm(ctx);
  ctx.strokeStyle = '#46544a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(170, 28); ctx.quadraticCurveTo(170, 54, 188, 52); ctx.quadraticCurveTo(202, 50, 202, 30); ctx.stroke();
  // rear stock
  metalBox(ctx, -4, -22, 104, 52, 18, DK, 0.3);
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  for (let i = 0; i < 5; i++) rr(ctx, 12 + i * 14, -12, 7, 32, 3), ctx.fill();
  add(ctx);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba(L, 0.25 + 0.6 * Math.max(0, Math.sin(t * 4 - i * 0.8))); rr(ctx, 13.5 + i * 14, -9, 4, 26, 2); ctx.fill(); }
  norm(ctx);
  // nanite canister
  metalBox(ctx, 82, -74, 12, 52, 4, DK, 0.4);
  metalBox(ctx, 248, -74, 12, 52, 4, DK, 0.4);
  ctx.fillStyle = vgrad(ctx, -70, -26, ['#0c2410', '#04120a', '#0a1c0e']);
  rr(ctx, 94, -70, 154, 44, 14); ctx.fill();
  ctx.save(); rr(ctx, 94, -70, 154, 44, 14); ctx.clip(); add(ctx);
  const n = Math.round(14 + 40 * (0.3 + 0.7 * rd));
  for (let i = 0; i < n; i++) {
    const sp = 18 + (i % 5) * 12;
    const px = 94 + ((i * 37 + t * sp) % 154);
    const py = -48 + Math.sin(t * (1.6 + (i % 4) * 0.7) + i * 1.9) * (12 + (i % 3) * 3);
    drawGlow(ctx, px, py, 3.2 + (i % 3) * 0.8, i % 4 === 0 ? '#ffffff' : L, 0.85);
  }
  for (let k = 0; k < 2; k++) {
    ctx.strokeStyle = rgba(L, 0.28); ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 96; x <= 246; x += 6) { const y = -48 + Math.sin(x * 0.07 - t * (2.4 + k) + k * 2) * (10 + k * 3); x === 96 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.stroke();
  }
  drawGlow(ctx, 171, -48, 90, L, 0.12 + 0.2 * rd);
  norm(ctx);
  ctx.strokeStyle = 'rgba(198,255,58,.12)'; ctx.lineWidth = 1;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) { hexPath(ctx, 104 + c * 19 + (r % 2) * 9.5, -62 + r * 16.5, 9.5, 0); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.14)'; rr(ctx, 100, -67, 142, 7, 4); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 1.5; rr(ctx, 94, -70, 154, 44, 14); ctx.stroke();
  // main body
  metalBox(ctx, 90, -24, 178, 52, 10, DK, 0.3);
  const cells = [[130, -8], [150, -18], [150, 2], [170, -8], [190, -18], [190, 2], [210, -8], [230, -18], [230, 2]];
  cells.forEach((c, i) => {
    const on = Math.max(0, Math.sin(t * 6 - i * 0.7));
    hexPath(ctx, c[0], c[1], 9.5, 0);
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
    add(ctx);
    ctx.strokeStyle = rgba(L, 0.25 + 0.7 * on); ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = rgba(L, 0.08 + 0.4 * on); ctx.fill();
    drawGlow(ctx, c[0], c[1], 14, L, 0.35 * on);
    norm(ctx);
  });
  // emitter
  metalBox(ctx, 264, -14, 38, 28, 6, DK, 0.4);
  for (const sgn of [-1, 1]) {
    const flip = sgn < 0 ? DK : [...DK].reverse();
    ctx.fillStyle = vgrad(ctx, sgn < 0 ? -66 : 12, sgn < 0 ? -12 : 66, flip);
    ctx.beginPath();
    ctx.moveTo(268, sgn * 12);
    ctx.bezierCurveTo(298, sgn * 16, 336, sgn * 32, 360, sgn * 62);
    ctx.lineTo(372, sgn * 54);
    ctx.bezierCurveTo(348, sgn * 36, 312, sgn * 30, 274, sgn * 30);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 1.4; ctx.stroke();
    add(ctx);
    ctx.strokeStyle = rgba(L, 0.5 + 0.4 * rd); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(272, sgn * 12.5); ctx.bezierCurveTo(300, sgn * 17, 336, sgn * 33, 358, sgn * 60); ctx.stroke();
    drawGlow(ctx, 360, sgn * 58, 14, L, 0.6 * (0.4 + rd));
    norm(ctx);
  }
  add(ctx);
  drawGlow(ctx, 336, 0, 34 + 34 * rd, L, 0.4 + 0.5 * rd);
  drawGlow(ctx, 336, 0, 12 + 8 * rd, '#ffffff', 0.5 + 0.4 * rd);
  hexPath(ctx, 336, 0, 13 + 4 * rd, t * 2); ctx.strokeStyle = rgba(L, 0.95); ctx.lineWidth = 2; ctx.stroke();
  hexPath(ctx, 336, 0, 7, -t * 3); ctx.strokeStyle = rgba('#ffffff', 0.9); ctx.lineWidth = 1.4; ctx.stroke();
  norm(ctx);
}

function drawDrone(ctx: C, p: { x: number; y: number; vx: number; vy: number; data?: any }) {
  const d = p.data;
  const tr: number[] = d.trail;
  add(ctx);
  ctx.lineCap = 'round';
  for (let j = 2; j < tr.length; j += 2) {
    const k = j / tr.length;
    ctx.strokeStyle = rgba('#a6ff3a', 0.6 * k * k);
    ctx.lineWidth = 3.2 * k;
    ctx.beginPath(); ctx.moveTo(tr[j - 2], tr[j - 1]); ctx.lineTo(tr[j], tr[j + 1]); ctx.stroke();
  }
  drawGlow(ctx, p.x, p.y, 14, '#c6ff3a', 0.75);
  norm(ctx);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
  ctx.fillStyle = '#0d1608';
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(5.4, 4); ctx.lineTo(0, 1.6); ctx.lineTo(-5.4, 4); ctx.closePath(); ctx.fill();
  const g = ctx.createLinearGradient(0, -8, 0, 4);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#d8ff5a'); g.addColorStop(1, '#5aff3a');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(3.2, 1.5); ctx.lineTo(0, 0); ctx.lineTo(-3.2, 1.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(198,255,58,.9)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-5.4, 4); ctx.lineTo(-2, -1); ctx.moveTo(5.4, 4); ctx.lineTo(2, -1); ctx.stroke();
  ctx.restore();
}

export const nanoWeapon: Weapon = {
  id: 'nano-swarm', name: 'Nano-Swarm', tag: 'Langka', sub: 'Hive Drone Launcher', accent: '#c6ff3a',
  desc: 'Kanister nanite hidup melepas kawanan 12 drone yang menyebar lalu berputar mengejar roda. Tiap drone menggerogoti kayu menjadi sel heksagon bercahaya.',
  hint: 'Klik = lepas kawanan',
  muzzle: 372, muzzleY: 0, kick: 10, cooldown: 0.85,
  draw: drawNano,
  fire: (g) => {
    const m = g.muzzlePos();
    g.muzzleFlash(m.x, m.y, { size: 36, color: '#c6ff3a', core: '#ffffff', spikes: 5, spread: 1.0, life: 0.08 });
    g.light('#c6ff3a', 0.45);
    g.addFx({
      max: 0.34, add: true,
      draw: (ctx, k) => {
        const r = lerp(8, 70, easeOut(k));
        ctx.save(); ctx.translate(m.x, m.y - 6); ctx.scale(1, 0.5);
        hexPath(ctx, 0, 0, r, k * 0.6);
        ctx.strokeStyle = rgba('#c6ff3a', 0.9 * (1 - k)); ctx.lineWidth = 2.6 * (1 - k) + 0.5; ctx.stroke();
        hexPath(ctx, 0, 0, r * 0.6, -k * 0.8);
        ctx.strokeStyle = rgba('#ffffff', 0.7 * (1 - k)); ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      },
    });
    g.burst(m.x, m.y, { n: 16, type: 'cube', ang: -Math.PI / 2, spread: 1.0, speed: [150, 560], life: [0.3, 0.7], size: [1.2, 2.8], size1: 0, pal: ['#ffffff', '#c6ff3a', '#5aff3a'], vr: 10 });
    const N = 12;
    for (let i = 0; i < N; i++) {
      const ang = (i / (N - 1) - 0.5) * 2 * 1.15 + rand(-0.12, 0.12);
      const sp = rand(420, 720);
      const data = { i, free: rand(0.1, 0.19), tx: g.cx + rand(-62, 62), ph: rand(0, TAU), trail: [] as number[] };
      g.addProj({
        x: m.x + rand(-5, 5), y: m.y + rand(-4, 4), vx: Math.sin(ang) * sp, vy: -Math.cos(ang) * sp, data,
        update: (gm, dt, p) => {
          const d = p.data;
          d.trail.push(p.x, p.y);
          if (d.trail.length > 18) d.trail.splice(0, 2);
          if (Math.random() < dt * 26) gm.spawn({ type: 'glow', x: p.x, y: p.y, size: rand(2, 3.5), size1: 0, life: 0.28, pal: ['#e8ff9a', '#8aff3a'], alpha: 0.7 });
          if (p.age < d.free) { const f = Math.exp(-dt * 1.2); p.vx *= f; p.vy *= f; return; }
          const dx = d.tx - gm.cx;
          const ty = gm.wy + Math.sqrt(Math.max(1, gm.R * gm.R - dx * dx));
          if (p.y < ty) { p.y = ty + 1; p.vy = -Math.abs(p.vy) - 300; return; }
          const ax = d.tx - p.x, ay = ty - p.y;
          const Ld = Math.hypot(ax, ay) || 1;
          const sp2 = Math.min(2200, Math.hypot(p.vx, p.vy) + 4200 * dt);
          const k = 1 - Math.exp(-dt * 8);
          p.vx += ((ax / Ld) * sp2 - p.vx) * k;
          p.vy += ((ay / Ld) * sp2 - p.vy) * k;
          const sw = Math.sin(p.age * 24 + d.ph) * 1300 * Math.min(1, Ld / 150);
          const sv = Math.hypot(p.vx, p.vy) || 1;
          p.vx += (-p.vy / sv) * sw * dt;
          p.vy += (p.vx / sv) * sw * dt;
        },
        draw: (ctx, _g, p) => drawDrone(ctx, p),
        onHit: (gm, hx, hy) => {
          const n2 = gm.normalAt(hx, hy);
          gm.hit(hx, hy, { power: 0.45, count: i === 0 || i === 6 ? 1 : 0, chips: 2, dust: false, kick: 0.25, shake: 0.4, flash: 0.1 });
          gm.addEmbed(hx, hy, { kind: 'nano', glow: '#c6ff3a', size: rand(0.85, 1.2), cool: 2.2 });
          gm.burst(hx, hy, { n: 7, type: 'cube', ang: n2, spread: 1.4, speed: [90, 380], life: [0.3, 0.7], size: [1.2, 2.6], size1: 0, pal: ['#ffffff', '#c6ff3a', '#5aff3a'], vr: 12, ay: 120 });
          gm.burst(hx, hy, { n: 6, ang: n2, spread: 1.4, speed: [180, 520], life: [0.15, 0.4], size: [1, 2], pal: ['#ffffff', '#d8ff5a'], len: 0.05, ay: 300 });
          gm.glow(hx, hy, 36, '#c6ff3a', 0.16);
          gm.ring(hx, hy, 3, 24, '#c6ff3a', 0.24, 2.2, 0.45);
          gm.heatWheel('#c6ff3a', 0.04);
        },
      });
    }
  },
};

export const rareWeapons: Weapon[] = [singularityWeapon, prismWeapon, nanoWeapon];
