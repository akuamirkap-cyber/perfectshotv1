import type { Game } from '../engine';
import type { Weapon, WeaponState } from '../types';
import {
  GOLD, STEEL, TAU, add, clamp, drawGlow, lerp, metalBox, norm, rand, rgba, rr, vgrad, wobblePath,
} from '../util';

type C = CanvasRenderingContext2D;

function tick(s: WeaponState, key: string, dt: number, iv: number) {
  s.data[key] = (s.data[key] ?? 0) + dt;
  if (s.data[key] >= iv) { s.data[key] -= iv; return true; }
  return false;
}
function flare(ctx: C, x: number, y: number, size: number, color: string, alpha: number) {
  add(ctx);
  drawGlow(ctx, x, y, size, color, alpha);
  drawGlow(ctx, x, y, size * 0.35, '#ffffff', alpha);
  ctx.lineCap = 'round';
  for (const [dx, dy, l] of [[1, 0, 1.3], [0, 1, 0.9], [0.7, 0.7, 0.55], [0.7, -0.7, 0.55]] as number[][]) {
    const gr = ctx.createLinearGradient(x - dx * size * l, y - dy * size * l, x + dx * size * l, y + dy * size * l);
    gr.addColorStop(0, rgba(color, 0)); gr.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.8})`); gr.addColorStop(1, rgba(color, 0));
    ctx.strokeStyle = gr; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x - dx * size * l, y - dy * size * l); ctx.lineTo(x + dx * size * l, y + dy * size * l); ctx.stroke();
  }
  norm(ctx);
}
function glideSparks(g: Game, a: { x: number; y: number }, dt: number, pal: string[], rate = 60) {
  if (Math.random() < dt * rate) {
    const nn = Math.PI / 2;
    const ang = nn + rand(-1.4, 1.4);
    g.spawn({ type: 'spark', x: a.x + rand(-10, 10), y: a.y, vx: Math.cos(ang) * rand(120, 420), vy: Math.sin(ang) * rand(60, 300), ay: 450, size: 1.6, life: rand(0.2, 0.5), pal, len: 0.045 });
  }
}

/* =================================================================== PHASER */
function drawPhaser(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, ch = s.chan;
  // grip
  ctx.fillStyle = vgrad(ctx, 6, 90, ['#41454e', '#1e2025', '#0a0b0e']);
  ctx.beginPath(); ctx.moveTo(30, 4); ctx.lineTo(96, 4); ctx.lineTo(80, 92); ctx.lineTo(16, 92); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const y = 18 + i * 8; ctx.beginPath(); ctx.moveTo(30 - i * 1.6, y); ctx.lineTo(90 - i * 1.7, y); ctx.stroke(); }
  add(ctx);
  ctx.fillStyle = rgba('#ff8a2a', 0.5 + 0.4 * ch); rr(ctx, 54, 20, 6, 56, 3); ctx.fill();
  drawGlow(ctx, 57, 48, 36, '#ff8a2a', 0.25 + 0.3 * ch);
  norm(ctx);
  // main body
  metalBox(ctx, 12, -22, 176, 32, 12, ['#fbfdff', '#c1c9d4', '#7a8392', '#444a56']);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(20, 4, 160, 2);
  // black top module
  metalBox(ctx, 96, -34, 150, 24, 9, ['#4d515c', '#262930', '#0b0c0f']);
  ctx.strokeStyle = 'rgba(255,255,255,.1)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(116 + i * 9, -30); ctx.lineTo(116 + i * 9, -14); ctx.stroke(); }
  // emitter nozzle
  ctx.fillStyle = vgrad(ctx, -34, 4, ['#f4f7fb', '#a4adba', '#4a505c']);
  ctx.beginPath(); ctx.moveTo(236, -36); ctx.lineTo(268, -28); ctx.lineTo(268, -4); ctx.lineTo(236, 4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.stroke();
  ctx.fillStyle = '#1a0603'; ctx.beginPath(); ctx.ellipse(268, -16, 5, 11, 0, 0, TAU); ctx.fill();
  add(ctx);
  const lg = ctx.createRadialGradient(268, -16, 0, 268, -16, 14);
  lg.addColorStop(0, 'rgba(255,255,255,1)'); lg.addColorStop(0.4, rgba('#ff9a2e', 0.9)); lg.addColorStop(1, rgba('#ff3a10', 0));
  ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(268, -16, 8 + 10 * ch, 0, TAU); ctx.fill();
  drawGlow(ctx, 268, -16, 20 + 40 * ch, '#ff6a1a', 0.4 + 0.5 * ch);
  norm(ctx);
  // setting dial
  ctx.fillStyle = vgrad(ctx, -14, 4, ['#d9dee6', '#7a8392']); ctx.beginPath(); ctx.arc(62, -6, 12, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#1b1d22'; ctx.lineWidth = 2; ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; ctx.beginPath(); ctx.moveTo(62 + Math.cos(a) * 9, -6 + Math.sin(a) * 9); ctx.lineTo(62 + Math.cos(a) * 12, -6 + Math.sin(a) * 12); ctx.stroke(); }
  ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.arc(62, -6, 3, 0, TAU); ctx.fill();
  // power LEDs
  add(ctx);
  for (let i = 0; i < 6; i++) {
    const on = i < 1 + ch * 5;
    ctx.fillStyle = rgba(i < 3 ? '#ffb03a' : '#ff5a2a', on ? 0.95 : 0.15);
    rr(ctx, 100 + i * 14, -3, 9, 5, 2); ctx.fill();
    if (on) drawGlow(ctx, 104.5 + i * 14, -0.5, 10, i < 3 ? '#ffb03a' : '#ff5a2a', 0.6);
  }
  ctx.fillStyle = rgba('#7ad8ff', 0.5 + 0.3 * Math.sin(t * 3)); ctx.fillRect(30, -12, 22, 3);
  norm(ctx);
  // trigger guard
  ctx.strokeStyle = '#59606c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(104, 8); ctx.quadraticCurveTo(110, 32, 134, 28); ctx.quadraticCurveTo(150, 24, 148, 8); ctx.stroke();
}

export const phaserWeapon: Weapon = {
  id: 'phaser', name: 'Phaser', tag: 'Sci-Fi', sub: 'Starfleet Type-2 (Star Trek)',
  accent: '#ff9a2e',
  desc: 'Sinar phaser oranye bergelombang dengan inti putih. Kayu terurai jadi kilau bintik hangat yang naik berputar.',
  hint: 'Tahan = sinar kontinu',
  muzzle: 270, muzzleY: -16, scale: 1.35, kick: 0, cooldown: 0.1, channel: true, minHold: 0.3,
  draw: drawPhaser,
  channelUpdate: (g, s, dt) => {
    const a = g.aim();
    const ch = s.chan;
    g.light('#ff8a2a', 0.2 * ch);
    if (!a.hit) return;
    if (g.knifeNear(a.x, a.y)) { glideSparks(g, a, dt, ['#fff3c0', '#ffd24a'], 90); return; }
    g.heatWheel('#ff8a2a', dt * 1.2);
    if (Math.random() < dt * 110) {
      g.spawn({ type: Math.random() < 0.5 ? 'cube' : 'glow', x: a.x + rand(-26, 26), y: a.y + rand(-12, 4), vx: rand(-40, 40), vy: -rand(40, 190), size: rand(1.4, 3), size1: 0, life: rand(0.5, 1), pal: ['#fff6d6', '#ffb347', '#ff6a1a'], vr: rand(-8, 8) });
    }
    if (tick(s, 'rg', dt, 0.12)) g.ring(a.x, a.y, 3, 44, '#ffb347', 0.34, 2, 0.4);
    if (tick(s, 'ht', dt, 0.22)) {
      g.hit(a.x + rand(-8, 8), a.y, { power: 0.5, chips: 2, dust: false, kick: 0.5, shake: 0.6, flash: 0.15 });
      g.addEmbed(a.x + rand(-6, 6), a.y, { kind: 'scorch', color: '#222', glow: '#ff9a2e', size: 0.9, cracks: 4, cool: 0.9 });
    }
    glideSparks(g, a, dt, ['#ffffff', '#ffc24a', '#ff7a1a'], 40);
  },
  drawBeam: (ctx, g, s) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const ch = s.chan;
    const t = s.t;
    add(ctx);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const f = 0.88 + 0.12 * Math.sin(t * 60);
    for (const [w, c, al] of [[34, '#ff4a1a', 0.16], [15, '#ff8a2a', 0.5], [7, '#ffd27a', 0.9]] as [number, string, number][]) {
      wobblePath(ctx, m.x, m.y, a.x, a.y, 3.2, 52, -t * 36, 60, true);
      ctx.strokeStyle = rgba(c, al * ch * f); ctx.lineWidth = w * (0.6 + 0.4 * ch); ctx.stroke();
    }
    wobblePath(ctx, m.x, m.y, a.x, a.y, 1.5, 70, t * 30, 60, true);
    ctx.strokeStyle = rgba('#ffffff', 0.95 * ch); ctx.lineWidth = 3; ctx.stroke();
    ctx.setLineDash([3, 28]); ctx.lineDashOffset = -t * 900;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y);
    ctx.strokeStyle = rgba('#ffffff', 0.9 * ch); ctx.lineWidth = 9; ctx.stroke();
    ctx.setLineDash([]);
    norm(ctx);
    flare(ctx, m.x, m.y, 30 * ch + 6, '#ff8a2a', 0.9 * ch);
    if (a.hit) flare(ctx, a.x, a.y, 44 * ch, '#ff9a2e', 0.85 * ch * f);
  },
};

/* =================================================================== PLASMACASTER */
function drawPlasmacaster(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, rd = s.ready;
  const TEAL = '#37ffd0';
  const pulse = 0.55 + 0.45 * Math.sin(t * 5);
  const DARK = ['#8a917c', '#4a5042', '#1f221b'];
  // power cable
  ctx.strokeStyle = '#1a1c18'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(30, 50); ctx.bezierCurveTo(60, 90, 110, 80, 140, 34); ctx.stroke();
  ctx.strokeStyle = '#3a3f33'; ctx.lineWidth = 8; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 2; ctx.stroke();
  // shoulder mount
  ctx.fillStyle = vgrad(ctx, -76, 76, DARK);
  ctx.beginPath(); ctx.moveTo(-4, -64); ctx.lineTo(70, -78); ctx.lineTo(128, -48); ctx.lineTo(128, 48); ctx.lineTo(70, 78); ctx.lineTo(-4, 64); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(214,170,90,.8)'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(10, -52); ctx.lineTo(68, -64); ctx.lineTo(116, -40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, 52); ctx.lineTo(68, 64); ctx.lineTo(116, 40); ctx.stroke();
  ctx.fillStyle = '#c8a45a';
  for (const [x, y] of [[20, -40], [20, 40], [90, -52], [90, 52], [14, 0]]) { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill(); }
  add(ctx);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = rgba(TEAL, 0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 4 - i))); rr(ctx, 36 + i * 18, -8, 10, 16, 3); ctx.fill(); }
  norm(ctx);
  // main cannon
  metalBox(ctx, 100, -26, 200, 52, 14, DARK, 0.3);
  for (let i = 0; i < 4; i++) metalBox(ctx, 124 + i * 40, -31, 12, 62, 3, ['#e9c777', '#a47a2a', '#4a3410'], 0.4);
  add(ctx);
  for (let i = 0; i < 4; i++) {
    const a = 0.3 + 0.7 * clamp(rd * 5 - i * 0.8);
    ctx.fillStyle = rgba(TEAL, a); rr(ctx, 142 + i * 40, -14, 18, 7, 3); ctx.fill(); rr(ctx, 142 + i * 40, 7, 18, 7, 3); ctx.fill();
    drawGlow(ctx, 151 + i * 40, 0, 24, TEAL, a * 0.45);
  }
  norm(ctx);
  // muzzle shroud
  ctx.fillStyle = vgrad(ctx, -40, 40, ['#a0a791', '#4f5545', '#1f221b']);
  ctx.beginPath(); ctx.moveTo(290, -26); ctx.lineTo(322, -40); ctx.lineTo(332, -40); ctx.lineTo(332, 40); ctx.lineTo(322, 40); ctx.lineTo(290, 26); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#03100f'; ctx.beginPath(); ctx.ellipse(332, 0, 8, 32, 0, 0, TAU); ctx.fill();
  add(ctx);
  const ch = clamp(rd);
  drawGlow(ctx, 332, 0, 18 + 44 * ch * (0.8 + 0.2 * pulse), '#5af2ff', 0.5 + 0.5 * ch);
  drawGlow(ctx, 332, 0, 10 + 12 * ch, '#ffffff', 0.7 * ch);
  norm(ctx);
  // targeting optic with 3 red lenses
  metalBox(ctx, 150, -62, 70, 22, 6, DARK);
  add(ctx);
  for (const [x, y] of [[212, -57], [212, -51], [212, -45]]) { drawGlow(ctx, x, y, 8, '#ff2a2a', 0.9); ctx.fillStyle = '#ff6a6a'; ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill(); }
  norm(ctx);
}

export const plasmaWeapon: Weapon = {
  id: 'plasmacaster', name: 'Plasmacaster', tag: 'Sci-Fi', sub: 'Meriam Bahu (Predator)',
  accent: '#5af2ff',
  desc: 'Tiga titik laser merah mengunci target, lalu bola plasma biru-putih menghantam dan meledak dengan petir.',
  hint: 'Klik = kunci & tembak',
  muzzle: 338, muzzleY: 0, kick: 16, cooldown: 0.9,
  draw: drawPlasmacaster,
  drawOverlay: (ctx, g, s) => {
    if (!g.active) return;
    const a = g.aim();
    const lock = clamp(s.ready);
    const spread = lerp(34, 9, lock * lock);
    const cx = a.x, cy = a.y - 30;
    const dots: number[][] = [[0, -spread * 0.8], [-spread * 0.8, spread * 0.5], [spread * 0.8, spread * 0.5]];
    const src = g.lw(214, -51);
    add(ctx);
    const blink = lock >= 1 ? 0.7 + 0.3 * Math.sin(s.t * 26) : 0.5 + 0.3 * Math.sin(s.t * 10);
    ctx.lineWidth = 1;
    for (const d of dots) {
      ctx.strokeStyle = `rgba(255,60,60,${0.18 * blink})`;
      ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(cx + d[0], cy + d[1]); ctx.stroke();
      drawGlow(ctx, cx + d[0], cy + d[1], 12, '#ff2a2a', blink);
      drawGlow(ctx, cx + d[0], cy + d[1], 4, '#ffffff', blink);
    }
    norm(ctx);
  },
  fire: (g) => {
    const m = g.muzzlePos();
    g.light('#5af2ff', 0.7);
    g.shake(3);
    g.ring(m.x, m.y, 8, 90, '#5af2ff', 0.3, 4, 0.5);
    g.glow(m.x, m.y, 100, '#5af2ff', 0.2);
    for (let i = 0; i < 3; i++) g.lightning(m.x, m.y, m.x + rand(-50, 50), m.y - rand(30, 80), { color: '#5af2ff', life: 0.12, width: 1.6, jag: 9 });
    g.addProj({
      x: m.x, y: m.y, vx: 0, vy: -1450,
      update: (gm, dt, p) => {
        for (let i = 0; i < 3; i++) if (Math.random() < dt * 90) gm.spawn({ type: 'glow', x: p.x + rand(-6, 6), y: p.y + rand(0, 14), vx: rand(-40, 40), vy: rand(20, 140), size: rand(8, 15), size1: 0, life: rand(0.25, 0.45), pal: ['#e8ffff', '#5af2ff', '#2a6bff'], alpha: 0.8 });
        if (Math.random() < dt * 40) gm.spawn({ type: 'spark', x: p.x, y: p.y, vx: rand(-200, 200), vy: rand(0, 160), size: 1.6, life: 0.3, pal: ['#ffffff', '#5af2ff'], len: 0.05 });
      },
      draw: (ctx, _g, p) => {
        add(ctx);
        const f = 0.9 + 0.1 * Math.sin(p.age * 50);
        drawGlow(ctx, p.x, p.y, 88 * f, '#2a8bff', 0.4);
        drawGlow(ctx, p.x, p.y, 46 * f, '#5af2ff', 0.9);
        drawGlow(ctx, p.x, p.y, 22, '#ffffff', 1);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(190,250,255,.9)'; ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) { const a0 = p.age * 16 + i * 2.1; ctx.beginPath(); ctx.arc(p.x, p.y, 20 + i * 3, a0, a0 + 1.1); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(160,240,255,.9)'; ctx.lineWidth = 1.3;
        for (let k = 0; k < 4; k++) {
          const a = rand(0, TAU);
          ctx.beginPath(); ctx.moveTo(p.x, p.y);
          let px = p.x, py = p.y;
          for (let i = 1; i <= 4; i++) { px = p.x + Math.cos(a) * i * 8 + rand(-5, 5); py = p.y + Math.sin(a) * i * 8 + rand(-5, 5); ctx.lineTo(px, py); }
          ctx.stroke();
        }
        norm(ctx);
      },
      onHit: (gm, hx, hy) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 2.1, chips: 14, kick: 1.5, stop: 0.07, shake: 8, flash: 1 });
        gm.addEmbed(hx, hy, { kind: 'crater', color: '#222', glow: '#5af2ff', size: 1.25, cracks: 8, cool: 2.4 });
        gm.heatWheel('#5af2ff', 0.7);
        gm.light('#5af2ff', 0.9);
        gm.ring(hx, hy, 6, 150, '#5af2ff', 0.55, 8, 0.5);
        gm.ring(hx, hy, 4, 90, '#ffffff', 0.36, 3, 0.5);
        gm.ring(hx, hy, 2, 210, '#2a8bff', 0.7, 3, 0.5);
        gm.glow(hx, hy, 150, '#5af2ff', 0.4);
        gm.glow(hx, hy, 60, '#ffffff', 0.2);
        for (let i = 0; i < 6; i++) {
          const a = n + rand(-1.3, 1.3);
          gm.lightning(hx, hy, hx + Math.cos(a) * rand(60, 130), hy + Math.sin(a) * rand(60, 130), { color: '#5af2ff', life: 0.26, width: 1.8, jag: 10 });
        }
        for (const sg of [-1, 1]) {
          const a = n + sg * rand(0.5, 1.2);
          gm.lightning(hx, hy, gm.cx + Math.cos(a) * gm.R * 0.96, gm.wy + Math.sin(a) * gm.R * 0.96, { color: '#9ff8ff', life: 0.3, width: 2, jag: 8 });
        }
        gm.burst(hx, hy, { n: 40, ang: n, spread: 1.55, speed: [200, 900], life: [0.25, 0.7], size: [1, 2.8], pal: ['#ffffff', '#8ff3ff', '#2a8bff'], len: 0.05, ay: 450 });
        gm.burst(hx, hy, { n: 16, type: 'glow', ang: n, spread: 1.5, speed: [80, 360], life: [0.5, 1], size: [4, 9], size1: 0, pal: ['#5af2ff', '#2a6bff'], ay: 220 });
      },
    });
  },
};

/* =================================================================== IDENTITY DISC */
function drawDisc(ctx: C, x: number, y: number, r: number, rot: number, ga = 1) {
  add(ctx);
  drawGlow(ctx, x, y, r * 2.4, '#2a9bff', 0.35 * ga);
  drawGlow(ctx, x, y, r * 1.5, '#43e8ff', 0.5 * ga);
  norm(ctx);
  const bg = ctx.createRadialGradient(x, y, 2, x, y, r);
  bg.addColorStop(0, '#16303c'); bg.addColorStop(0.7, '#08141b'); bg.addColorStop(1, '#030a0e');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  add(ctx);
  ctx.lineCap = 'round';
  ctx.strokeStyle = rgba('#43e8ff', 0.5 * ga); ctx.lineWidth = r * 0.2; ctx.beginPath(); ctx.arc(x, y, r - r * 0.1, 0, TAU); ctx.stroke();
  ctx.strokeStyle = rgba('#d8ffff', 0.95 * ga); ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.arc(x, y, r - r * 0.1, 0, TAU); ctx.stroke();
  ctx.strokeStyle = rgba('#43e8ff', 0.85 * ga); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(x, y, r * 0.62, 0, TAU); ctx.stroke();
  ctx.lineWidth = r * 0.09;
  for (let i = 0; i < 4; i++) { const a0 = rot + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, r * 0.78, a0 + 0.15, a0 + 1.15); ctx.stroke(); }
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) { const a = -rot * 1.3 + i * TAU / 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.3, y + Math.sin(a) * r * 0.3); ctx.lineTo(x + Math.cos(a) * r * 0.58, y + Math.sin(a) * r * 0.58); ctx.stroke(); }
  ctx.strokeStyle = rgba('#ffffff', 0.9 * ga); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.26, 0, TAU); ctx.stroke();
  drawGlow(ctx, x, y, r * 0.3, '#ffffff', 0.8 * ga);
  norm(ctx);
}

function drawDiscArm(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t;
  const out = !!s.data.out;
  // forearm
  ctx.fillStyle = vgrad(ctx, -40, 40, ['#3a424e', '#171b22', '#07090c']);
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(150, -42); ctx.lineTo(176, -30); ctx.lineTo(176, 30); ctx.lineTo(150, 42); ctx.lineTo(0, 34); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.lineWidth = 2; ctx.stroke();
  add(ctx);
  ctx.strokeStyle = rgba('#43e8ff', 0.85); ctx.lineWidth = 2.4; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(96, -24); ctx.lineTo(112, -10); ctx.lineTo(172, -10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, 24); ctx.lineTo(96, 24); ctx.lineTo(112, 10); ctx.lineTo(172, 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(150, 0); ctx.stroke();
  ctx.strokeStyle = rgba('#43e8ff', 0.25); ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(96, -24); ctx.lineTo(112, -10); ctx.lineTo(172, -10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, 24); ctx.lineTo(96, 24); ctx.lineTo(112, 10); ctx.lineTo(172, 10); ctx.stroke();
  // moving pulse
  const px = ((t * 0.9) % 1) * 150;
  drawGlow(ctx, px + 20, 0, 12, '#ffffff', 0.7);
  norm(ctx);
  // dock clamps
  for (const sg of [-1, 1]) {
    ctx.strokeStyle = '#2b323c'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(236, 0, 62, sg < 0 ? Math.PI * 1.08 : 0.2 * Math.PI * 0.5 + 0.0, sg < 0 ? Math.PI * 1.35 : Math.PI * 0.27); ctx.stroke();
    ctx.strokeStyle = rgba('#43e8ff', 0.8); ctx.lineWidth = 2; ctx.stroke();
  }
  metalBox(ctx, 176, -14, 24, 28, 4, ['#3b4350', '#1a1e25', '#0a0c10']);
  if (!out) drawDisc(ctx, 236, 0, 52, t * 3.2);
  else {
    add(ctx);
    ctx.strokeStyle = rgba('#43e8ff', 0.35 + 0.2 * Math.sin(t * 9)); ctx.lineWidth = 2; ctx.setLineDash([4, 6]);
    ctx.beginPath(); ctx.arc(236, 0, 50, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    drawGlow(ctx, 236, 0, 46, '#43e8ff', 0.18);
    norm(ctx);
  }
}

export const discWeapon: Weapon = {
  id: 'identity-disc', name: 'Identity Disc', tag: 'Sci-Fi', sub: 'Piringan Cahaya (Tron)',
  accent: '#43e8ff',
  desc: 'Piringan cahaya dilempar, mengiris roda dengan pecahan kubus digital, lalu kembali ke lengan dengan jejak cahaya.',
  hint: 'Klik = lempar disc',
  muzzle: 292, muzzleY: 0, kick: 5, cooldown: 0.95,
  draw: drawDiscArm,
  onSelect: (_g, s) => { s.data.out = false; },
  update: (g, s) => {
    if (s.data.out && !g.projs.some((p) => p.data?.disc)) s.data.out = false;
  },
  fire: (g, s) => {
    const d = g.lw(236, 0);
    s.data.out = true;
    g.glow(d.x, d.y, 90, '#43e8ff', 0.2);
    g.ring(d.x, d.y, 10, 90, '#43e8ff', 0.3, 3, 0.5);
    const trail: number[][] = [];
    g.addProj({
      x: d.x, y: d.y, vx: 0, vy: -1750, data: { disc: true, phase: 'out' },
      update: (gm, dt, p) => {
        trail.push([p.x, p.y]);
        if (trail.length > 18) trail.shift();
        if (Math.random() < dt * 80) gm.spawn({ type: 'cube', x: p.x + rand(-30, 30), y: p.y + rand(-30, 30), vx: rand(-30, 30), vy: rand(20, 80), size: rand(1.2, 2.6), life: rand(0.3, 0.6), pal: ['#ffffff', '#43e8ff'] });
        if (p.data.phase === 'back') {
          const dock = gm.lw(236, 0);
          const dx = dock.x - p.x, dy = dock.y - p.y;
          const L = Math.hypot(dx, dy) || 1;
          const sp = 1900;
          p.vx += (dx / L * sp - p.vx) * Math.min(1, dt * 9);
          p.vy += (dy / L * sp - p.vy) * Math.min(1, dt * 9);
          if (L < 42 || (p.y > dock.y - 10 && p.age > 0.2)) {
            p.alive = false;
            s.data.out = false;
            gm.glow(dock.x, dock.y, 100, '#ffffff', 0.18);
            gm.ring(dock.x, dock.y, 8, 80, '#43e8ff', 0.3, 4, 0.5);
            gm.burst(dock.x, dock.y, { n: 14, type: 'cube', speed: [60, 240], life: [0.3, 0.6], size: [1.4, 2.8], pal: ['#ffffff', '#43e8ff'] });
            s.recoil = 0.6;
          }
        }
      },
      draw: (ctx, _g, p) => {
        // ribbon trail
        add(ctx);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (let i = 1; i < trail.length; i++) {
          const k = i / trail.length;
          ctx.strokeStyle = rgba('#43e8ff', 0.5 * k);
          ctx.lineWidth = 34 * k * k;
          ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
        }
        for (let i = 1; i < trail.length; i++) {
          const k = i / trail.length;
          ctx.strokeStyle = rgba('#ffffff', 0.8 * k);
          ctx.lineWidth = 3 * k;
          ctx.beginPath(); ctx.moveTo(trail[i - 1][0], trail[i - 1][1]); ctx.lineTo(trail[i][0], trail[i][1]); ctx.stroke();
        }
        norm(ctx);
        drawDisc(ctx, p.x, p.y, 40, p.age * 24);
      },
      onHit: (gm, hx, hy, p) => {
        const n = gm.normalAt(hx, hy);
        gm.hit(hx, hy, { power: 1.5, chips: 10, kick: 1.1, stop: 0.04, shake: 4, flash: 0.6 });
        gm.addEmbed(hx, hy, { kind: 'slash', glow: '#43e8ff', size: 1.1, rot: rand(-0.5, 0.5), cool: 2.2 });
        gm.heatWheel('#43e8ff', 0.3);
        gm.ring(hx, hy, 6, 100, '#43e8ff', 0.4, 5, 0.4);
        gm.glow(hx, hy, 100, '#43e8ff', 0.25);
        gm.burst(hx, hy, { n: 34, type: 'cube', ang: n, spread: 1.5, speed: [120, 560], life: [0.4, 0.9], size: [1.6, 4], size1: 0, pal: ['#ffffff', '#8ff3ff', '#2a9bff'], vr: 12, ay: 80 });
        gm.burst(hx, hy, { n: 24, ang: n, spread: 1.6, speed: [200, 700], life: [0.2, 0.5], size: [1, 2.2], pal: ['#ffffff', '#43e8ff'], len: 0.05, ay: 300 });
        for (const sg of [-1, 1]) gm.lightning(hx, hy, hx + sg * rand(50, 100), hy + rand(10, 40), { color: '#43e8ff', life: 0.18, width: 1.4, jag: 6 });
        p.alive = true; p.noCollide = true; p.data.phase = 'back';
        p.vx = rand(-260, 260); p.vy = 380; p.age = 0.01;
      },
    });
  },
};

/* =================================================================== PROTON PACK */
function drawProton(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, ch = s.chan;
  const wob = ch * 1.2;
  ctx.save();
  ctx.translate(rand(-1, 1) * wob, rand(-1, 1) * wob);
  // hose
  ctx.strokeStyle = '#17181b'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(60, 20); ctx.bezierCurveTo(100, 100, 130, 80, 150, 20); ctx.stroke();
  ctx.strokeStyle = '#3a3d44'; ctx.lineWidth = 8; ctx.stroke();
  ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 8; ctx.stroke(); ctx.setLineDash([]);
  // pack
  metalBox(ctx, -14, -92, 120, 184, 16, ['#6d727c', '#3a3e46', '#16181c'], 0.3);
  ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-8, -20 + i * 18); ctx.lineTo(98, -20 + i * 18); ctx.stroke(); }
  // cyclotron
  const cx0 = 46, cy0 = -52;
  ctx.fillStyle = '#0a0a0c'; ctx.beginPath(); ctx.arc(cx0, cy0, 32, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#a0a5af'; ctx.lineWidth = 4; ctx.stroke();
  add(ctx);
  const ph = Math.floor(t * (4 + ch * 14)) % 4;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    const on = i === ph ? 1 : 0.2;
    const x = cx0 + Math.cos(a) * 17, y = cy0 + Math.sin(a) * 17;
    ctx.fillStyle = rgba('#ff3a2a', on); ctx.beginPath(); ctx.arc(x, y, 7, 0, TAU); ctx.fill();
    drawGlow(ctx, x, y, 22, '#ff3a2a', on * 0.7);
  }
  norm(ctx);
  // power cell
  metalBox(ctx, 14, 0, 64, 60, 6, ['#2a2d33', '#14161a', '#08090b']);
  add(ctx);
  for (let i = 0; i < 6; i++) {
    const on = (i + 0.5) / 6 < 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (2 + ch * 8)));
    ctx.fillStyle = rgba(i < 4 ? '#3de6ff' : '#ffd23a', on ? 0.9 : 0.15); ctx.fillRect(24, 8 + i * 8, 44, 4);
  }
  norm(ctx);
  // wand body
  ctx.fillStyle = vgrad(ctx, 8, 70, ['#3a3d44', '#1a1c20', '#09090b']);
  ctx.beginPath(); ctx.moveTo(130, 6); ctx.lineTo(176, 6); ctx.lineTo(166, 72); ctx.lineTo(126, 70); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.2; ctx.stroke();
  metalBox(ctx, 110, -20, 190, 30, 10, ['#9aa1ae', '#555c68', '#23262c'], 0.35);
  metalBox(ctx, 120, -34, 130, 16, 6, ['#6d7480', '#363a42', '#14161a']);
  metalBox(ctx, 170, -42, 60, 10, 3, ['#2c2f36', '#14161a', '#08090b']);
  add(ctx);
  const cols = ['#3dff7a', '#8aff3a', '#ffe23a', '#ff9a2a', '#ff3a2a'];
  for (let i = 0; i < 5; i++) {
    const on = i < 1 + ch * 4.2;
    ctx.fillStyle = rgba(cols[i], on ? 0.95 : 0.15); ctx.fillRect(174 + i * 11, -40, 8, 6);
    if (on) drawGlow(ctx, 178 + i * 11, -37, 9, cols[i], 0.5);
  }
  norm(ctx);
  // vents
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  for (let i = 0; i < 5; i++) rr(ctx, 216 + i * 14, -12, 8, 14, 3), ctx.fill();
  add(ctx);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = rgba('#ff9a2a', 0.2 + 0.7 * ch * (0.6 + 0.4 * Math.sin(t * 20 + i))); rr(ctx, 217 + i * 14, -10, 6, 10, 2); ctx.fill(); }
  norm(ctx);
  // barrel tip
  metalBox(ctx, 296, -17, 30, 24, 4, ['#cfd5df', '#747c8a', '#2f333b']);
  for (let i = 0; i < 3; i++) metalBox(ctx, 300 + i * 8, -22, 4, 34, 1, ['#3a3e46', '#16181c', '#08090b']);
  ctx.fillStyle = '#080808'; ctx.beginPath(); ctx.ellipse(327, -5, 4, 11, 0, 0, TAU); ctx.fill();
  add(ctx);
  drawGlow(ctx, 328, -5, 16 + 26 * ch, '#ffb04a', 0.5 + 0.5 * ch);
  // hat light
  const bl = Math.sin(t * 9) > 0 ? 1 : 0.2;
  drawGlow(ctx, 250, -45, 14, '#ff3a2a', bl * 0.6);
  norm(ctx);
  ctx.restore();
}

export const protonWeapon: Weapon = {
  id: 'proton-pack', name: 'Proton Pack', tag: 'Sci-Fi', sub: 'Neutrona Wand (Ghostbusters)',
  accent: '#ffb02e',
  desc: 'Aliran proton oranye-kuning yang berpilin seperti tali, memercik ke segala arah dan merayap di tepi roda.',
  hint: 'Tahan = aliran proton',
  muzzle: 330, muzzleY: -5, kick: 0, cooldown: 0.1, channel: true, minHold: 0.35,
  draw: drawProton,
  channelUpdate: (g, s, dt) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const ch = s.chan;
    g.light('#ffa02e', 0.25 * ch);
    // sparks along beam
    if (Math.random() < dt * 90 * ch) {
      const t = Math.random();
      const x = lerp(m.x, a.x, t), y = lerp(m.y, a.y, t);
      const an = rand(0, TAU);
      g.spawn({ type: 'spark', x, y, vx: Math.cos(an) * rand(80, 300), vy: Math.sin(an) * rand(80, 300), size: 1.6, life: rand(0.15, 0.4), pal: ['#fff6c8', '#ffc83a', '#ff6a1a'], len: 0.05 });
    }
    if (Math.random() < dt * 14 * ch) {
      const t = rand(0.15, 0.95);
      const x = lerp(m.x, a.x, t), y = lerp(m.y, a.y, t);
      g.lightning(x, y, x + rand(-60, 60), y + rand(-40, 40), { color: '#ffb02e', core: '#fff6c8', life: 0.1, width: 1.3, jag: 7, fork: 0.2 });
    }
    if (!a.hit) return;
    if (g.knifeNear(a.x, a.y)) { glideSparks(g, a, dt, ['#fff6c8', '#ffc83a'], 100); return; }
    g.heatWheel('#ffa02e', dt * 1.4);
    glideSparks(g, a, dt, ['#ffffff', '#ffd23a', '#ff6a1a'], 90);
    if (Math.random() < dt * 14) {
      const an = Math.PI / 2 + rand(0.2, 1.1) * (Math.random() < 0.5 ? -1 : 1);
      g.lightning(a.x, a.y, g.cx + Math.cos(an) * g.R * 0.96, g.wy + Math.sin(an) * g.R * 0.96, { color: '#ffa02e', core: '#fff6c8', life: 0.14, width: 1.6, jag: 8 });
    }
    if (Math.random() < dt * 30) g.spawn({ type: 'smoke', x: a.x + rand(-20, 20), y: a.y + 6, vx: rand(-30, 30), vy: -rand(20, 80), size: 8, size1: 30, life: rand(0.6, 1.1), alpha: 0.18, pal: ['#6a5a50', '#2a2420'], drag: 1 });
    if (tick(s, 'ht', dt, 0.2)) {
      g.hit(a.x + rand(-10, 10), a.y, { power: 0.55, chips: 3, dust: false, kick: 0.5, shake: 1, flash: 0.15 });
      g.addEmbed(a.x + rand(-8, 8), a.y, { kind: 'scorch', color: '#222', glow: '#ffb02e', size: 1.0, cracks: 5, cool: 1 });
    }
  },
  drawBeam: (ctx, g, s) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const ch = s.chan;
    const t = s.t;
    add(ctx);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const L = m.y - a.y;
    // outer glow
    ctx.strokeStyle = rgba('#ff5a1a', 0.16 * ch); ctx.lineWidth = 60 * ch;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    ctx.strokeStyle = rgba('#ff9a2a', 0.28 * ch); ctx.lineWidth = 30 * ch;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    // braided strands
    const cols = ['#ff4a1a', '#ffc83a', '#ff8a2a'];
    for (let k = 0; k < 3; k++) {
      for (const sg of [1, -1]) {
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) {
          const u = i / 48;
          const amp = (4 + 20 * u) * (0.5 + 0.5 * ch);
          const ph = u * 16 - t * 22 + (k * TAU) / 3;
          const x = m.x + Math.sin(ph) * amp * sg;
          const y = m.y - L * u;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = rgba(cols[k], 0.85 * ch); ctx.lineWidth = 3.4; ctx.stroke();
      }
    }
    ctx.strokeStyle = rgba('#fff6d0', 0.95 * ch); ctx.lineWidth = 8 * ch;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    ctx.strokeStyle = rgba('#ffffff', ch); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    norm(ctx);
    flare(ctx, m.x, m.y, 34 * ch + 8, '#ffb02e', 0.9 * ch);
    if (a.hit) flare(ctx, a.x, a.y, 62 * ch, '#ffa02e', 0.9 * ch * (0.85 + 0.15 * Math.sin(t * 50)));
  },
};

/* =================================================================== TRIPOD HEAT RAY */
function drawTripod(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, ch = s.chan;
  const G = '#37ff7a';
  // hull dome
  ctx.fillStyle = vgrad(ctx, -90, 90, ['#8e6a3a', '#4c3a22', '#1c1610']);
  ctx.beginPath(); ctx.moveTo(-20, -86); ctx.quadraticCurveTo(70, -100, 80, -30); ctx.lineTo(80, 30); ctx.quadraticCurveTo(70, 100, -20, 86); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(120,255,170,.35)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-30, 0, 40 + i * 14, -0.9, 0.9); ctx.stroke(); }
  add(ctx);
  for (const sg of [-1, 1]) { drawGlow(ctx, 50, sg * 52, 16, G, 0.5 + 0.3 * Math.sin(t * 3 + sg)); }
  norm(ctx);
  // neck: segmented rings, swaying
  for (let i = 0; i < 11; i++) {
    const x = 70 + i * 17;
    const r = 34 - i * 1.7;
    const yo = Math.sin(t * 1.3 + i * 0.5) * 3 * (i / 11) + (ch > 0.1 ? rand(-1, 1) * ch * 0.8 : 0);
    ctx.fillStyle = vgrad(ctx, yo - r, yo + r, ['#d6a35c', '#7a5428', '#2a1c0c']);
    rr(ctx, x, yo - r, 15, r * 2, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(80,230,140,.2)'; ctx.fillRect(x + 2, yo - r + 2, 3, r * 2 - 4);
    ctx.fillStyle = '#161008'; ctx.fillRect(x + 14, yo - r * 0.8, 3, r * 1.6);
  }
  // head
  ctx.save();
  ctx.translate(0, 0);
  ctx.fillStyle = vgrad(ctx, -52, 52, ['#e6b66a', '#8a5f2e', '#2a1c0c']);
  ctx.beginPath();
  ctx.moveTo(250, -26); ctx.bezierCurveTo(290, -56, 340, -46, 368, -10); ctx.lineTo(372, 10); ctx.bezierCurveTo(340, 46, 290, 56, 250, 26); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath(); ctx.moveTo(258, -24); ctx.bezierCurveTo(292, -48, 336, -40, 360, -12); ctx.lineTo(356, -8); ctx.bezierCurveTo(330, -32, 292, -34, 262, -18); ctx.closePath(); ctx.fill();
  // fin
  ctx.fillStyle = vgrad(ctx, -90, -40, ['#9a6c36', '#3a2814']);
  ctx.beginPath(); ctx.moveTo(262, -34); ctx.quadraticCurveTo(300, -92, 352, -54); ctx.quadraticCurveTo(310, -62, 290, -40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.8)'; ctx.lineWidth = 1.4; ctx.stroke();
  // periscope eye
  metalBox(ctx, 330, -9, 38, 18, 5, ['#d9aa62', '#7a5428', '#2a1c0c']);
  ctx.fillStyle = '#021a0a'; ctx.beginPath(); ctx.ellipse(372, 0, 5, 12, 0, 0, TAU); ctx.fill();
  add(ctx);
  const pulse = 0.7 + 0.3 * Math.sin(t * 8);
  const eg = ctx.createRadialGradient(372, 0, 0, 372, 0, 18);
  eg.addColorStop(0, 'rgba(255,255,255,1)'); eg.addColorStop(0.35, rgba(G, 0.95)); eg.addColorStop(1, rgba(G, 0));
  ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(372, 0, 10 + 12 * ch, 0, TAU); ctx.fill();
  drawGlow(ctx, 372, 0, 30 + 50 * ch, G, (0.35 + 0.5 * ch) * pulse);
  // small red lens
  drawGlow(ctx, 300, 20, 10, '#ff3a3a', 0.6); ctx.fillStyle = '#ff7a7a'; ctx.beginPath(); ctx.arc(300, 20, 2.4, 0, TAU); ctx.fill();
  norm(ctx);
  ctx.restore();
}

export const tripodWeapon: Weapon = {
  id: 'tripod', name: 'Tripod Heat-Ray', tag: 'Sci-Fi', sub: 'Mesin Perang Mars (War of the Worlds)',
  accent: '#37ff7a',
  desc: 'Kepala tripod Mars dengan mata hijau. Sinar panas berdenyut cincin-cincin menguapkan kayu jadi abu yang melayang.',
  hint: 'Tahan = sinar panas',
  muzzle: 376, muzzleY: 0, kick: 0, cooldown: 0.1, channel: true, minHold: 0.45,
  draw: drawTripod,
  channelUpdate: (g, s, dt) => {
    const a = g.aim();
    const ch = s.chan;
    g.light('#37ff7a', 0.25 * ch);
    if (!a.hit) return;
    if (g.knifeNear(a.x, a.y)) { glideSparks(g, a, dt, ['#eafff0', '#37ff7a'], 90); return; }
    g.heatWheel('#37ff7a', dt * 1.4);
    if (Math.random() < dt * 90) g.spawn({ type: 'ash', x: a.x + rand(-26, 26), y: a.y + rand(-8, 6), vx: rand(-40, 40), vy: -rand(30, 150), ay: -20, size: rand(1.4, 3.2), life: rand(0.8, 1.6), pal: ['#d9ffe6', '#7a8a80', '#2a2e2c'], vr: rand(-6, 6), drag: 0.5 });
    if (Math.random() < dt * 50) g.spawn({ type: 'glow', x: a.x + rand(-20, 20), y: a.y + rand(-6, 6), vx: rand(-60, 60), vy: -rand(50, 200), size: rand(2, 4), size1: 0, life: rand(0.4, 0.9), pal: ['#eafff0', '#37ff7a', '#0a6a30'] });
    if (Math.random() < dt * 24) g.spawn({ type: 'smoke', x: a.x + rand(-26, 26), y: a.y + 4, vx: rand(-30, 30), vy: -rand(30, 90), size: 8, size1: 34, life: rand(0.8, 1.4), alpha: 0.2, pal: ['#8affb0', '#2a4a38'], drag: 1 });
    if (tick(s, 'rg', dt, 0.16)) g.ring(a.x, a.y, 4, 62, '#37ff7a', 0.38, 2.4, 0.4);
    if (tick(s, 'ht', dt, 0.18)) {
      g.hit(a.x + rand(-12, 12), a.y, { power: 0.55, chips: 2, dust: false, kick: 0.5, shake: 1, flash: 0.15 });
      g.addEmbed(a.x + rand(-8, 8), a.y, { kind: 'crater', color: '#111', glow: '#37ff7a', size: rand(0.55, 0.8), cracks: 4, cool: 1.4 });
    }
  },
  drawBeam: (ctx, g, s) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const ch = s.chan;
    const t = s.t;
    const L = m.y - a.y;
    add(ctx);
    ctx.lineCap = 'round';
    const f = 0.85 + 0.15 * Math.sin(t * 45);
    for (const [w, c, al] of [[58, '#0fbf5a', 0.16], [26, '#37ff7a', 0.5], [10, '#c8ffd8', 0.9]] as [number, string, number][]) {
      ctx.strokeStyle = rgba(c, al * ch * f); ctx.lineWidth = w * (0.5 + 0.5 * ch);
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    }
    ctx.strokeStyle = rgba('#ffffff', ch); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    // pulse rings racing along the ray
    for (let i = 0; i < 9; i++) {
      const u = (i / 9 + t * 1.7) % 1;
      const y = m.y - L * u;
      const rx = 12 + 22 * u;
      ctx.strokeStyle = rgba('#a8ffc8', (0.85 - 0.5 * u) * ch); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(m.x, y, rx, rx * 0.2, 0, 0, TAU); ctx.stroke();
    }
    norm(ctx);
    flare(ctx, m.x, m.y, 36 * ch + 8, '#37ff7a', 0.9 * ch);
    if (a.hit) {
      add(ctx);
      drawGlow(ctx, a.x, a.y, 90 * ch, '#37ff7a', 0.7 * f);
      drawGlow(ctx, a.x, a.y, 34 * ch, '#ffffff', 0.9);
      norm(ctx);
    }
  },
};

/* =================================================================== IRON MAN REPULSOR */
function drawIron(ctx: C, _g: Game, s: WeaponState) {
  const t = s.t, ch = s.chan;
  const RED = ['#ff4a50', '#c0111f', '#6a0610'];
  const jit = ch * 1.1;
  ctx.save();
  ctx.translate(rand(-1, 1) * jit, rand(-1, 1) * jit);
  // forearm
  ctx.fillStyle = vgrad(ctx, -46, 46, RED);
  ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(150, -32); ctx.lineTo(178, -48); ctx.lineTo(196, -44); ctx.lineTo(196, 44); ctx.lineTo(178, 48); ctx.lineTo(150, 32); ctx.lineTo(-4, 38); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,0,6,.9)'; ctx.lineWidth = 2; ctx.stroke();
  // gold plates
  for (const sg of [-1, 1]) {
    ctx.fillStyle = vgrad(ctx, sg < 0 ? -40 : 18, sg < 0 ? -18 : 40, GOLD);
    ctx.beginPath(); ctx.moveTo(14, sg * 34); ctx.lineTo(140, sg * 29); ctx.lineTo(142, sg * 19); ctx.lineTo(24, sg * 22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(80,40,0,.8)'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(40,0,6,.7)'; ctx.lineWidth = 1.6;
  for (const x of [50, 92]) { ctx.beginPath(); ctx.moveTo(x, -30); ctx.lineTo(x, 30); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(4, -35, 146, 3);
  add(ctx);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = rgba('#8fe8ff', 0.4 + 0.5 * (0.5 + 0.5 * Math.sin(t * 6 - i))); rr(ctx, 100 + i * 14, -8, 8, 16, 3); ctx.fill(); }
  norm(ctx);
  // wrist ring
  metalBox(ctx, 150, -52, 26, 104, 8, ['#fff3b8', '#e2ac3c', '#8a5a14', '#4a2c06'], 0.5);
  // hand
  ctx.fillStyle = vgrad(ctx, -46, 46, RED);
  ctx.beginPath(); ctx.moveTo(190, -42); ctx.lineTo(238, -36); ctx.lineTo(258, -26); ctx.lineTo(258, 26); ctx.lineTo(238, 36); ctx.lineTo(190, 42); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(40,0,6,.9)'; ctx.lineWidth = 2; ctx.stroke();
  for (const sg of [-1, 1]) {
    metalBox(ctx, 206, sg < 0 ? -66 : 40, 40, 26, 8, GOLD, 0.45);
    ctx.strokeStyle = 'rgba(80,40,0,.7)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(226, sg < 0 ? -66 : 40); ctx.lineTo(226, sg < 0 ? -40 : 66); ctx.stroke();
  }
  // palm repulsor
  ctx.fillStyle = vgrad(ctx, -30, 30, GOLD);
  ctx.beginPath(); ctx.ellipse(258, 0, 15, 30, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(80,40,0,.9)'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = '#04141c'; ctx.beginPath(); ctx.ellipse(259, 0, 10, 22, 0, 0, TAU); ctx.fill();
  add(ctx);
  const base = 0.55 + 0.15 * Math.sin(t * 4) + 0.5 * ch;
  const rg = ctx.createRadialGradient(260, 0, 0, 260, 0, 24);
  rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.4, `rgba(143,232,255,${Math.min(1, base)})`); rg.addColorStop(1, 'rgba(60,160,255,0)');
  ctx.save(); ctx.translate(260, 0); ctx.scale(0.55, 1); ctx.translate(-260, 0);
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(260, 0, 24, 0, TAU); ctx.fill(); ctx.restore();
  drawGlow(ctx, 262, 0, 28 + 50 * ch, '#8fe8ff', 0.45 + 0.5 * ch);
  ctx.strokeStyle = rgba('#d8f6ff', 0.8); ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(259, 0, 6, 14, 0, 0, TAU); ctx.stroke();
  norm(ctx);
  ctx.restore();
}

export const ironWeapon: Weapon = {
  id: 'ironman', name: 'Repulsor Laser', tag: 'Sci-Fi', sub: 'Gauntlet Deadblast',
  accent: '#8fe8ff',
  desc: 'Telapak sarung tangan merah-emas memuntahkan sinar repulsor putih-biru, cincin kejut berlari di sepanjang sinar dan kawah heksagon bercahaya.',
  hint: 'Tahan = sinar repulsor',
  muzzle: 266, muzzleY: 0, kick: 0, cooldown: 0.1, channel: true, minHold: 0.35,
  draw: drawIron,
  channelUpdate: (g, s, dt) => {
    const a = g.aim();
    const ch = s.chan;
    g.light('#8fe8ff', 0.3 * ch);
    if (!a.hit) return;
    if (g.knifeNear(a.x, a.y)) { glideSparks(g, a, dt, ['#ffffff', '#8fe8ff'], 100); return; }
    g.heatWheel('#8fe8ff', dt * 1.5);
    glideSparks(g, a, dt, ['#ffffff', '#8fe8ff', '#2a9bff'], 100);
    if (Math.random() < dt * 40) g.spawn({ type: 'glow', x: a.x + rand(-24, 24), y: a.y + rand(-8, 6), vx: rand(-50, 50), vy: -rand(40, 180), size: rand(2, 4.5), size1: 0, life: rand(0.4, 0.9), pal: ['#ffffff', '#8fe8ff', '#2a6bff'] });
    if (tick(s, 'hx', dt, 0.14)) {
      const x = a.x, y = a.y;
      g.addFx({
        max: 0.36, add: true,
        draw: (ctx, k) => {
          const r = lerp(8, 70, 1 - Math.pow(1 - k, 2));
          ctx.strokeStyle = rgba('#8fe8ff', 0.85 * (1 - k)); ctx.lineWidth = 2.4 * (1 - k) + 0.4;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU + Math.PI / 6; const px = x + Math.cos(an) * r, py = y + Math.sin(an) * r * 0.55; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.closePath(); ctx.stroke();
        },
      });
    }
    if (tick(s, 'ht', dt, 0.16)) {
      g.hit(a.x + rand(-10, 10), a.y, { power: 0.6, chips: 3, dust: false, kick: 0.55, shake: 1.2, flash: 0.2 });
      g.addEmbed(a.x + rand(-8, 8), a.y, { kind: 'crater', color: '#111', glow: '#8fe8ff', size: rand(0.55, 0.8), cracks: 5, cool: 1.2 });
    }
  },
  drawBeam: (ctx, g, s) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const ch = s.chan;
    const t = s.t;
    const L = m.y - a.y;
    add(ctx);
    ctx.lineCap = 'round';
    const f = 0.88 + 0.12 * Math.sin(t * 70);
    for (const [w, c, al] of [[70, '#2a7bff', 0.14], [34, '#5ac8ff', 0.4], [16, '#c8f4ff', 0.85]] as [number, string, number][]) {
      ctx.strokeStyle = rgba(c, al * ch * f); ctx.lineWidth = w * (0.5 + 0.5 * ch);
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    }
    ctx.strokeStyle = rgba('#ffffff', ch); ctx.lineWidth = 7 * ch;
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(a.x, a.y); ctx.stroke();
    // flowing repulsor rings
    for (let i = 0; i < 8; i++) {
      const u = (i / 8 + t * 2.4) % 1;
      const y = m.y - L * u;
      const rx = 14 + 18 * u;
      ctx.strokeStyle = rgba('#bfeeff', (0.9 - 0.6 * u) * ch); ctx.lineWidth = 2.6 * (1 - u * 0.5);
      ctx.beginPath(); ctx.ellipse(m.x, y, rx, rx * 0.22, 0, 0, TAU); ctx.stroke();
    }
    norm(ctx);
    flare(ctx, m.x, m.y, 44 * ch + 8, '#8fe8ff', 0.95 * ch);
    if (a.hit) {
      flare(ctx, a.x, a.y, 70 * ch, '#8fe8ff', 0.95 * ch * f);
    }
  },
};

void STEEL;

export const scifi: Weapon[] = [phaserWeapon, plasmaWeapon, discWeapon, protonWeapon, tripodWeapon, ironWeapon];
