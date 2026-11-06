import type { Game } from '../engine';
import { drawDragon } from './dragon';
import type { Weapon, WeaponState } from '../types';
import {
  GOLD, TAU, add, clamp, drawGlow, easeOut, hgrad, lerp, metalBox, norm, rand, rgba, rr, vgrad,
} from '../util';

type C = CanvasRenderingContext2D;

/* =================================================================== BOW */
function drawArrowShape(ctx: C, tail: number, len: number, glow = 0) {
  const tip = tail + len;
  const g = ctx.createLinearGradient(0, -2.4, 0, 2.4);
  g.addColorStop(0, '#f8e2b0'); g.addColorStop(0.5, '#d29a58'); g.addColorStop(1, '#8c5a2a');
  ctx.fillStyle = g;
  ctx.fillRect(tail, -2.3, len, 4.6);
  // fletching
  for (const s of [-1, 1]) {
    ctx.fillStyle = s === -1 ? '#d9383f' : '#f2f2f6';
    ctx.beginPath();
    ctx.moveTo(tail + 10, 0); ctx.lineTo(tail + 24, s * 12); ctx.lineTo(tail + 62, s * 12); ctx.lineTo(tail + 54, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 0.8; ctx.stroke();
  }
  ctx.fillStyle = '#b0242c';
  ctx.beginPath(); ctx.moveTo(tail + 8, -2.4); ctx.lineTo(tail + 56, -2.4); ctx.lineTo(tail + 56, 2.4); ctx.lineTo(tail + 8, 2.4); ctx.fill();
  ctx.fillStyle = '#2a1a0e'; ctx.fillRect(tail - 5, -3.4, 8, 6.8);
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(tail + 64, -2.9, 3, 5.8);
  // head
  const hg = ctx.createLinearGradient(0, -10, 0, 10);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, '#a9b4c4'); hg.addColorStop(1, '#4b5464');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.moveTo(tip - 40, 0); ctx.lineTo(tip - 24, -10); ctx.lineTo(tip, 0); ctx.lineTo(tip - 24, 10); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(tip - 38, 0); ctx.lineTo(tip - 2, 0); ctx.stroke();
  ctx.fillStyle = '#d9a441'; ctx.fillRect(tip - 43, -3.4, 4, 6.8);
  if (glow > 0) { add(ctx); drawGlow(ctx, tip - 6, 0, 22, '#ffe08a', 0.55 * glow); norm(ctx); }
}

function drawBow(ctx: C, _g: Game, s: WeaponState) {
  const draw = easeOut(clamp((s.ready - 0.1) / 0.9));
  let snap = 0;
  if (s.fireT < 0.3) snap = Math.sin(s.fireT * 95) * 10 * Math.exp(-s.fireT * 15);
  const sx = lerp(118, 50, draw) + (draw < 0.05 ? snap : 0);
  // arrow (behind bow)
  if (s.ready > 0.25) {
    const shift = (1 - clamp((s.ready - 0.25) / 0.3)) * 70;
    ctx.save();
    ctx.globalAlpha = clamp((s.ready - 0.25) / 0.15);
    drawArrowShape(ctx, sx - shift, 212, s.ready >= 0.99 ? 0.5 + 0.5 * Math.sin(s.t * 4) : 0);
    ctx.restore();
  }
  const limb = (sg: number) => {
    ctx.beginPath();
    ctx.moveTo(150, sg * 14);
    ctx.bezierCurveTo(182, sg * 52, 176, sg * 128, 128, sg * 174);
    ctx.quadraticCurveTo(113, sg * 187, 119, sg * 199);
  };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const sg of [-1, 1]) {
    limb(sg); ctx.strokeStyle = '#25130a'; ctx.lineWidth = 14; ctx.stroke();
    limb(sg); ctx.strokeStyle = hgrad(ctx, 112, 190, ['#a8622a', '#e8ac60', '#8a4e1e']); ctx.lineWidth = 10; ctx.stroke();
    ctx.save(); ctx.translate(-2.2, 0);
    limb(sg); ctx.strokeStyle = 'rgba(255,232,180,.7)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    limb(sg); ctx.setLineDash([5, 11]); ctx.strokeStyle = '#ffd86b'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = hgrad(ctx, 112, 126, ['#fff3b8', '#c4902c']);
    ctx.beginPath(); ctx.arc(119, sg * 199, 5.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1; ctx.stroke();
  }
  // grip
  ctx.fillStyle = hgrad(ctx, 140, 164, ['#5a3416', '#2a170a', '#1a0d05']);
  rr(ctx, 140, -38, 24, 76, 9); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = 'rgba(214,160,70,.7)'; ctx.lineWidth = 1.4;
  for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(141, i * 6.2 - 2); ctx.lineTo(163, i * 6.2 + 2); ctx.stroke(); }
  ctx.fillStyle = vgrad(ctx, -42, -34, GOLD); rr(ctx, 138, -42, 28, 7, 3); ctx.fill();
  ctx.fillStyle = vgrad(ctx, 34, 42, GOLD); rr(ctx, 138, 34, 28, 7, 3); ctx.fill();
  ctx.fillStyle = '#e03a5a'; ctx.beginPath(); ctx.arc(152, 0, 4.2, 0, TAU); ctx.fill();
  add(ctx); drawGlow(ctx, 152, 0, 12, '#ff5a7a', 0.7); norm(ctx);
  ctx.fillStyle = '#8a5a2a'; ctx.fillRect(163, -5, 8, 10);
  // string
  ctx.lineWidth = 1.8; ctx.strokeStyle = '#f7efd8';
  ctx.beginPath(); ctx.moveTo(119, -199); ctx.lineTo(sx, 0); ctx.lineTo(119, 199); ctx.stroke();
  add(ctx); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,240,200,.12)';
  ctx.beginPath(); ctx.moveTo(119, -199); ctx.lineTo(sx, 0); ctx.lineTo(119, 199); ctx.stroke(); norm(ctx);
  // finger tab
  if (draw > 0.1) { ctx.fillStyle = '#6a4020'; ctx.beginPath(); ctx.ellipse(sx - 5, 0, 6, 11, 0, 0, TAU); ctx.fill(); }
}

export const bowWeapon: Weapon = {
  id: 'bow', name: 'Busur & Panah', tag: 'Klasik', sub: 'Recurve Bow',
  accent: '#e8b86a',
  desc: 'Busur recurve berukir emas. Tali ditarik otomatis, panah melesat dengan garis angin dan menancap bergetar di roda.',
  hint: 'Klik = lepas panah',
  muzzle: 264, muzzleY: 0, kick: 6, cooldown: 0.62,
  draw: drawBow,
  fire: (g) => {
    const m = g.muzzlePos();
    const len = 212;
    const nock = g.lw(56, 0);
    g.glow(nock.x, nock.y, 34, '#fff0c8', 0.12, 0.7);
    g.ring(m.x, m.y + 30, 6, 60, '#fff3d6', 0.28, 2, 0.35);
    g.burst(m.x, m.y + 60, { n: 6, type: 'glow', ang: -Math.PI / 2, spread: 0.5, speed: [60, 160], life: [0.3, 0.6], size: [2, 3.5], size1: 0, pal: ['#fff3c8', '#ffd27a'] });
    g.addProj({
      x: m.x, y: m.y, vx: rand(-14, 14), vy: -1950,
      update: (gm, dt, p) => {
        if (Math.random() < dt * 90) gm.spawn({ type: 'glow', x: p.x + rand(-8, 8), y: p.y + rand(20, 160), size: rand(1.5, 3), size1: 0, life: 0.3, alpha: 0.5, pal: ['#fff6dc'], vx: rand(-10, 10), vy: rand(20, 60) });
      },
      draw: (ctx, _g, p) => {
        add(ctx);
        ctx.lineCap = 'round';
        for (const [ox, l, a] of [[-10, 110, 0.35], [12, 140, 0.3], [-20, 80, 0.2], [22, 90, 0.2]] as number[][]) {
          const gr = ctx.createLinearGradient(p.x + ox, p.y + 30, p.x + ox, p.y + 30 + l);
          gr.addColorStop(0, `rgba(255,248,225,${a})`); gr.addColorStop(1, 'rgba(255,248,225,0)');
          ctx.strokeStyle = gr; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(p.x + ox, p.y + 30); ctx.lineTo(p.x + ox, p.y + 30 + l); ctx.stroke();
        }
        drawGlow(ctx, p.x, p.y + 10, 40, '#ffd98a', 0.25);
        norm(ctx);
        ctx.translate(p.x, p.y);
        ctx.rotate(-Math.PI / 2);
        drawArrowShape(ctx, -len, len, 0.7);
      },
      onHit: (gm, hx, hy) => {
        gm.hit(hx, hy, { power: 1.35, chips: 8, stop: 0.025 });
        gm.addEmbed(hx, hy, { kind: 'arrow', cracks: 4, glow: '#ffd27a', cool: 0.6 });
        gm.ring(hx, hy + 2, 5, 52, '#f3dcb0', 0.32, 3, 0.35);
        gm.burst(hx, hy, { n: 8, ang: gm.normalAt(hx, hy), spread: 1.2, speed: [120, 380], life: [0.2, 0.5], size: [1, 2.2], pal: ['#fff3c8', '#ffd27a'], len: 0.04, ay: 400 });
        gm.glow(hx, hy, 34, '#ffe6b0', 0.14);
      },
    });
  },
};

/* =================================================================== ENERGY SWORD */
const swingAng = (ft: number) => {
  const e = (u: number) => u * u * (3 - 2 * u);
  if (ft < 0.07) return -0.95 * e(ft / 0.07);
  if (ft < 0.2) return -0.95 + 1.9 * e((ft - 0.07) / 0.13);
  if (ft < 0.52) return 0.95 * (1 - easeOut((ft - 0.2) / 0.32));
  return 0;
};

function drawSword(ctx: C, g: Game, s: WeaponState) {
  const side = s.data.side ?? 1;
  const ft = s.fireT;
  const ang = side * swingAng(ft);
  const t = s.t;
  const PX = 66;
  const L = 280;
  // slash trail
  if (ft > 0.06 && ft < 0.5) {
    const a0 = -0.95 * side;
    const a1 = ang;
    const al = ft < 0.2 ? 1 : clamp(1 - (ft - 0.2) / 0.22);
    const lo = Math.min(a0, a1), hi = Math.max(a0, a1);
    add(ctx);
    ctx.lineCap = 'round';
    for (const [w, c, a] of [[42, '#2a7bff', 0.2], [22, '#43e8ff', 0.45], [6, '#ffffff', 0.8]] as [number, string, number][]) {
      ctx.strokeStyle = rgba(c, a * al);
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.arc(PX, 0, L - 20, lo, hi); ctx.stroke();
    }
    norm(ctx);
  }
  ctx.save();
  ctx.translate(PX, 0); ctx.rotate(ang); ctx.translate(-PX, 0);
  // hilt
  ctx.fillStyle = vgrad(ctx, -14, 14, ['#6a7384', '#2a2f3a', '#12151b']);
  rr(ctx, -34, -13, 100, 26, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = vgrad(ctx, -14, 14, GOLD);
  for (const x of [-26, 4, 34]) { rr(ctx, x, -15, 10, 30, 3); ctx.fill(); }
  add(ctx);
  ctx.fillStyle = rgba('#43e8ff', 0.55 + 0.25 * Math.sin(t * 6));
  for (let i = 0; i < 3; i++) ctx.fillRect(-14 + i * 30, -2, 14, 4);
  norm(ctx);
  // pommel
  ctx.fillStyle = vgrad(ctx, -12, 12, GOLD);
  ctx.beginPath(); ctx.arc(-36, 0, 12, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.stroke();
  // guard: curved prongs
  for (const sg of [-1, 1]) {
    ctx.fillStyle = vgrad(ctx, -50, 50, ['#fff2b8', '#e2b050', '#8a5a14']);
    ctx.beginPath();
    ctx.moveTo(62, sg * 8);
    ctx.bezierCurveTo(72, sg * 24, 84, sg * 40, 112, sg * 52);
    ctx.bezierCurveTo(96, sg * 34, 90, sg * 22, 86, sg * 8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,40,5,.8)'; ctx.lineWidth = 1.2; ctx.stroke();
    add(ctx); drawGlow(ctx, 108, sg * 50, 14, '#43e8ff', 0.6); norm(ctx);
  }
  ctx.fillStyle = vgrad(ctx, -14, 14, GOLD);
  rr(ctx, 62, -12, 26, 24, 5); ctx.fill(); ctx.strokeStyle = 'rgba(70,40,5,.8)'; ctx.stroke();
  // blade
  const bx0 = 88, bx1 = bx0 + L;
  const flick = 0.9 + 0.1 * Math.sin(t * 40);
  const blade = () => {
    ctx.beginPath();
    ctx.moveTo(bx0, -9);
    ctx.bezierCurveTo(bx0 + 40, -26, bx0 + 190, -22, bx1, 0);
    ctx.bezierCurveTo(bx0 + 190, 22, bx0 + 40, 26, bx0, 9);
    ctx.closePath();
  };
  add(ctx);
  // A continuous blue/cyan halo follows the *whole* blade, like the older
  // saber skin; the original center glow alone left its tip looking unlit.
  ctx.save();
  ctx.lineCap = 'round';
  const aura = ctx.createLinearGradient(bx0, 0, bx1, 0);
  aura.addColorStop(0, 'rgba(45,125,255,0.45)');
  aura.addColorStop(0.55, 'rgba(70,210,255,0.8)');
  aura.addColorStop(1, 'rgba(150,245,255,0.35)');
  for (const [width, alpha] of [[76, 0.13], [48, 0.24], [29, 0.42]] as const) {
    ctx.globalAlpha = alpha * flick;
    ctx.strokeStyle = aura;
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(bx0 + 8, 0); ctx.lineTo(bx1 - 7, 0); ctx.stroke();
  }
  ctx.restore();
  drawGlow(ctx, bx0 + L * 0.5, 0, 190, '#2a7bff', 0.28 * flick);
  drawGlow(ctx, bx0 + L * 0.5, 0, 120, '#43e8ff', 0.3 * flick);
  ctx.save();
  ctx.scale(1, 1.55); ctx.translate(0, 0);
  ctx.restore();
  const bg = ctx.createLinearGradient(bx0, 0, bx1, 0);
  bg.addColorStop(0, 'rgba(60,150,255,.95)'); bg.addColorStop(0.6, 'rgba(90,225,255,.9)'); bg.addColorStop(1, 'rgba(210,255,255,.95)');
  ctx.fillStyle = bg; blade(); ctx.fill();
  ctx.strokeStyle = rgba('#8ff3ff', 0.9); ctx.lineWidth = 3; blade(); ctx.stroke();
  // white core
  const cg = ctx.createLinearGradient(0, -12, 0, 12);
  cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(0.5, 'rgba(255,255,255,1)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.save(); blade(); ctx.clip();
  ctx.fillStyle = cg; ctx.fillRect(bx0, -13, L, 26);
  // travelling pulses
  for (let i = 0; i < 6; i++) {
    const x = bx0 + ((i / 6 + t * 0.9) % 1) * L;
    const pg = ctx.createLinearGradient(x - 22, 0, x + 22, 0);
    pg.addColorStop(0, 'rgba(255,255,255,0)'); pg.addColorStop(0.5, 'rgba(255,255,255,.55)'); pg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = pg; ctx.fillRect(x - 22, -24, 44, 48);
  }
  ctx.restore();
  drawGlow(ctx, bx1, 0, 26, '#ffffff', 0.9);
  norm(ctx);
  ctx.restore();
  void g;
}

function crescent(ctx: C, W: number, H: number, scale = 1) {
  ctx.beginPath();
  ctx.moveTo(-W * scale, 26 * scale);
  ctx.quadraticCurveTo(-W * 0.55 * scale, -H * 1.05 * scale, 0, -H * scale);
  ctx.quadraticCurveTo(W * 0.55 * scale, -H * 1.05 * scale, W * scale, 26 * scale);
  ctx.quadraticCurveTo(W * 0.5 * scale, -H * 0.38 * scale, 0, -H * 0.42 * scale);
  ctx.quadraticCurveTo(-W * 0.5 * scale, -H * 0.38 * scale, -W * scale, 26 * scale);
  ctx.closePath();
}

export const swordWeapon: Weapon = {
  id: 'energy-sword', name: 'Energy Sword', tag: 'Energi', sub: 'Plasma Blade',
  accent: '#43e8ff',
  desc: 'Bilah plasma berdenyut. Tiap tebasan melepaskan gelombang sabit energi yang membelah roda.',
  hint: 'Klik = tebas',
  muzzle: 368, muzzleY: 0, kick: 0, cooldown: 0.52,
  draw: drawSword,
  onSelect: (_g, s) => { s.data.side = 1; },
  fire: (g, s) => {
    const side: number = s.data.side ?? 1;
    s.data.side = -side;
    const tilt = side * 0.3;
    g.addFx({
      max: 0.2, draw: () => {},
      update: (_dt, fx) => {
        if (fx.age > 0.115 && !(fx as any).done) {
          (fx as any).done = true;
          const m = g.muzzlePos();
          const ox = m.x, oy = m.y - 30;
          g.light('#43e8ff', 0.7);
          g.ring(ox, oy + 30, 20, 110, '#8ff3ff', 0.3, 4, 0.35);
          g.shake(3);
          g.addProj({
            x: ox, y: oy, vx: Math.sin(tilt) * 60, vy: -1500,
            update: (gm, dt, p) => {
              if (Math.random() < dt * 120) {
                const a = rand(-1, 1);
                gm.spawn({ type: 'glow', x: p.x + a * 90, y: p.y + 10 + Math.abs(a) * 30, size: rand(2, 5), size1: 0, life: rand(0.2, 0.4), pal: ['#ffffff', '#43e8ff', '#2a7bff'], vy: rand(30, 120), vx: rand(-20, 20) });
              }
            },
            draw: (ctx, _g, p) => {
              ctx.translate(p.x, p.y);
              ctx.rotate(tilt);
              add(ctx);
              for (let i = 3; i >= 1; i--) {
                ctx.save(); ctx.translate(0, i * 26);
                ctx.fillStyle = rgba('#43e8ff', 0.12 / i); crescent(ctx, 96, 58, 1 - i * 0.07); ctx.fill();
                ctx.restore();
              }
              drawGlow(ctx, 0, -10, 130, '#2a7bff', 0.4);
              const g1 = ctx.createLinearGradient(0, -60, 0, 24);
              g1.addColorStop(0, 'rgba(255,255,255,1)'); g1.addColorStop(0.5, 'rgba(90,230,255,.9)'); g1.addColorStop(1, 'rgba(40,120,255,0)');
              ctx.fillStyle = g1; crescent(ctx, 96, 58); ctx.fill();
              ctx.strokeStyle = 'rgba(255,255,255,.95)'; ctx.lineWidth = 2.4; ctx.stroke();
              ctx.fillStyle = 'rgba(255,255,255,.85)'; crescent(ctx, 80, 48, 0.8); ctx.fill();
              norm(ctx);
            },
            onHit: (gm, hx, hy) => {
              gm.hit(hx, hy, { power: 1.9, chips: 14, kick: 1.3, stop: 0.05, shake: 6, flash: 0.7 });
              gm.addEmbed(hx, hy, { kind: 'slash', glow: '#43e8ff', size: 1.15, rot: -tilt * 1.8, cool: 2.0 });
              gm.heatWheel('#43e8ff', 0.35);
              gm.ring(hx, hy, 6, 90, '#43e8ff', 0.4, 5, 0.4);
              gm.glow(hx, hy, 100, '#43e8ff', 0.28);
              // X flare
              gm.addFx({
                max: 0.28, add: true,
                draw: (ctx, k) => {
                  const a = 1 - k;
                  ctx.lineCap = 'round';
                  for (const sg of [-1, 1]) {
                    const ang = tilt * 1.5 + sg * 0.55 + Math.PI / 2;
                    const l = 110 * easeOut(k * 2.2 > 1 ? 1 : k * 2.2);
                    const gx = ctx.createLinearGradient(hx - Math.cos(ang) * l, hy - Math.sin(ang) * l, hx + Math.cos(ang) * l, hy + Math.sin(ang) * l);
                    gx.addColorStop(0, 'rgba(67,232,255,0)'); gx.addColorStop(0.5, `rgba(255,255,255,${a})`); gx.addColorStop(1, 'rgba(67,232,255,0)');
                    ctx.strokeStyle = gx; ctx.lineWidth = 7 * a + 1;
                    ctx.beginPath(); ctx.moveTo(hx - Math.cos(ang) * l, hy - Math.sin(ang) * l); ctx.lineTo(hx + Math.cos(ang) * l, hy + Math.sin(ang) * l); ctx.stroke();
                  }
                },
              });
              const n = gm.normalAt(hx, hy);
              gm.burst(hx, hy, { n: 30, ang: n, spread: 1.5, speed: [200, 760], life: [0.2, 0.55], size: [1, 2.6], pal: ['#ffffff', '#8ff3ff', '#2db6ff'], len: 0.05, ay: 300 });
              gm.burst(hx, hy, { n: 10, type: 'glow', ang: n, spread: 1.6, speed: [60, 220], life: [0.4, 0.8], size: [3, 6], size1: 0, pal: ['#8ff3ff', '#2a7bff'] });
            },
          });
        }
      },
    });
  },
};

/* =================================================================== DRAGON BREATH */
const FLAME = ['#fff9e0', '#ffd84a', '#ff7a1a', '#c4260f', '#3a0e0a'];

export const dragonWeapon: Weapon = {
  id: 'dragon-breath', name: 'Dragon Breath', tag: 'Fantasi', sub: 'Naga Api Kuno',
  accent: '#ff7a1a',
  desc: 'Kepala naga bertanduk emas dengan surai api, rahang membuka dan menyemburkan api berlapis plus bola api. Kayu terbakar dan berasap.',
  hint: 'Tahan = semburkan api',
  muzzle: 306, muzzleY: 46, scale: 1.15, kick: 0, cooldown: 0.1, channel: true, minHold: 0.45,
  draw: drawDragon,
  update: (g, s, dt) => {
    const rate = 5 + 14 * s.chan;
    if (Math.random() < dt * rate) {
      const p = g.lw(322, -16);
      g.spawn({ type: 'smoke', x: p.x, y: p.y, vx: rand(-14, 14), vy: rand(-60, -25), size: 3, size1: 13, life: rand(0.5, 0.9), alpha: 0.18, pal: ['#c9c2c0', '#6a625f'], drag: 1.5 });
    }
  },
  channelUpdate: (g, s, dt) => {
    const ch = s.chan;
    const m = g.muzzlePos();
    const a = g.aim();
    const dist = Math.max(60, m.y - a.y);
    const n = Math.round(dt * 480 * ch + Math.random());
    for (let i = 0; i < n; i++) {
      const sp = rand(760, 1000);
      const ang = rand(-0.12, 0.12);
      g.spawn({
        type: 'flame', x: m.x + rand(-7, 7), y: m.y + rand(-4, 4), vx: Math.sin(ang) * sp, vy: -Math.cos(ang) * sp,
        life: rand(0.42, 0.62), size: rand(8, 14), size1: rand(34, 54), pal: FLAME, turb: 320, drag: 0.4, alpha: 0.85,
        hit: (gm, p) => {
          if (Math.random() < 0.7) {
            const side = Math.random() < 0.5 ? -1 : 1;
            gm.spawn({ type: 'flame', x: p.x, y: p.y + 4, vx: side * rand(160, 460), vy: rand(20, 140), ay: -420, drag: 2.2, life: rand(0.35, 0.6), size: rand(14, 20), size1: rand(32, 48), pal: FLAME, turb: 220, alpha: 0.8 });
          }
          if (Math.random() < 0.16) gm.spawn({ type: 'spark', x: p.x, y: p.y, vx: rand(-260, 260), vy: rand(-80, 220), ay: 500, size: 1.8, life: rand(0.4, 0.9), pal: ['#fff3c0', '#ffb02e', '#ff5a1a'], len: 0.04 });
          if (Math.random() < 0.08) gm.spawn({ type: 'smoke', x: p.x + rand(-20, 20), y: p.y + 10, vx: rand(-30, 30), vy: rand(-90, -30), ay: -30, size: 10, size1: 40, life: rand(0.8, 1.4), alpha: 0.25, pal: ['#3c3330', '#15110f'], drag: 1 });
        },
      });
    }
    // soft glowing under-layer
    if (Math.random() < dt * 60 * ch) {
      g.spawn({ type: 'glow', x: m.x, y: m.y, vx: rand(-20, 20), vy: -rand(600, 800), life: 0.4, size: 20, size1: 56, pal: ['#ff9a2a', '#b42810'], alpha: 0.28, drag: 0.5 });
    }
    // swirling embers
    if (Math.random() < dt * 30 * ch) {
      g.spawn({ type: 'spark', x: m.x + rand(-12, 12), y: m.y - rand(0, 100), vx: rand(-120, 120), vy: -rand(200, 600), ay: -80, size: 1.6, life: rand(0.5, 1.1), pal: ['#fff0b0', '#ff9a2e', '#ff3a10'], len: 0.05 });
    }
    // fireballs
    s.data.fb = (s.data.fb ?? 0) + dt;
    if (s.data.fb > 0.72 && ch > 0.6) {
      s.data.fb = 0;
      g.glow(m.x, m.y, 90, '#ff8a2a', 0.2);
      g.shake(2);
      g.addProj({
        x: m.x, y: m.y, vx: rand(-10, 10), vy: -820,
        update: (gm, d, p) => {
          const k = 4;
          for (let i = 0; i < k * d * 60; i++) gm.spawn({ type: 'flame', x: p.x + rand(-10, 10), y: p.y + rand(0, 20), vx: rand(-60, 60), vy: rand(60, 220), life: rand(0.25, 0.45), size: rand(14, 22), size1: rand(2, 8), pal: FLAME, turb: 300, alpha: 0.9 });
        },
        draw: (ctx, _g, p) => {
          add(ctx);
          const f = 0.9 + 0.1 * Math.sin(p.age * 40);
          drawGlow(ctx, p.x, p.y, 84 * f, '#ff5a1a', 0.5);
          drawGlow(ctx, p.x, p.y, 48 * f, '#ffb02e', 0.85);
          drawGlow(ctx, p.x, p.y, 24 * f, '#fff6d0', 1);
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
          for (let i = 0; i < 3; i++) {
            const a0 = p.age * 14 + i * 2.09;
            ctx.beginPath(); ctx.arc(p.x, p.y, 20, a0, a0 + 1.2); ctx.stroke();
          }
          norm(ctx);
        },
        onHit: (gm, hx, hy) => {
          const nn = gm.normalAt(hx, hy);
          gm.hit(hx, hy, { power: 1.8, chips: 12, kick: 1.3, stop: 0.04, shake: 6, flash: 0.8 });
          gm.addEmbed(hx, hy, { kind: 'burn', glow: '#ff7a1a', size: 1.7, cracks: 8, fire: 2.8, cool: 2 });
          gm.heatWheel('#ff7a1a', 0.5);
          gm.ring(hx, hy, 6, 130, '#ff9a2a', 0.5, 7, 0.45);
          gm.ring(hx, hy, 4, 80, '#fff3c0', 0.3, 3, 0.45);
          gm.glow(hx, hy, 140, '#ff7a1a', 0.4);
          gm.burst(hx, hy, { n: 36, type: 'flame', ang: nn, spread: 1.55, speed: [180, 620], life: [0.4, 0.8], size: [16, 26], size1: [30, 54], pal: FLAME, turb: 260, ay: -260, drag: 1.8, alpha: 0.85 });
          gm.burst(hx, hy, { n: 26, ang: nn, spread: 1.5, speed: [200, 800], life: [0.4, 1], size: [1.4, 2.6], pal: ['#fff3c0', '#ffb02e', '#ff5a1a'], len: 0.05, ay: 500 });
        },
      });
    }
    // impact ticks
    s.data.ht = (s.data.ht ?? 0) + dt;
    if (a.hit) {
      const blocked = g.knifeNear(a.x, a.y);
      if (blocked) {
        if (Math.random() < dt * 30) g.ricochet(a.x, a.y);
      } else {
        g.heatWheel('#ff7a1a', dt * 1.6);
        if (s.data.ht > 0.2) {
          s.data.ht = 0;
          g.hit(a.x + rand(-14, 14), a.y, { power: 0.5, chips: 3, count: 1, dust: false, kick: 0.5, shake: 1, flash: 0.15 });
          g.addEmbed(a.x + rand(-10, 10), a.y, { kind: 'burn', glow: '#ff8a2a', size: rand(0.9, 1.25), cracks: 4, fire: 1.6, cool: 1.5 });
          g.glow(a.x, a.y, 60, '#ff7a1a', 0.2, 0.7);
        }
      }
    }
    g.light('#ff7a1a', 0.22 + 0.22 * ch);
    void dist;
  },
  drawBeam: (ctx, g, s) => {
    const m = g.muzzlePos();
    const a = g.aim();
    const ch = s.chan;
    const f = 0.85 + 0.15 * Math.sin(s.t * 50);
    add(ctx);
    const L = m.y - a.y;
    const grd = ctx.createLinearGradient(m.x, m.y, m.x, a.y);
    grd.addColorStop(0, `rgba(255,214,120,${0.55 * ch * f})`); grd.addColorStop(1, `rgba(255,90,20,${0.28 * ch})`);
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.moveTo(m.x - 10, m.y); ctx.lineTo(m.x - 44, a.y + 6); ctx.lineTo(m.x + 44, a.y + 6); ctx.lineTo(m.x + 10, m.y); ctx.closePath(); ctx.fill();
    const cg = ctx.createLinearGradient(m.x, m.y, m.x, a.y);
    cg.addColorStop(0, `rgba(255,255,255,${0.7 * ch})`); cg.addColorStop(1, `rgba(255,240,170,${0.2 * ch})`);
    ctx.strokeStyle = cg; ctx.lineWidth = 12 * f; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x, a.y + 10); ctx.stroke();
    drawGlow(ctx, m.x, m.y, 90 * ch, '#ff9a2a', 0.75);
    drawGlow(ctx, m.x, m.y, 40 * ch, '#fff0b0', 0.8);
    if (a.hit) { drawGlow(ctx, a.x, a.y, 110 * ch, '#ff7a1a', 0.6); drawGlow(ctx, a.x, a.y - 4, 44 * ch, '#ffe08a', 0.8); }
    norm(ctx);
    void L;
  },
};

void metalBox;

export const fantasy: Weapon[] = [bowWeapon, dragonWeapon, swordWeapon];
