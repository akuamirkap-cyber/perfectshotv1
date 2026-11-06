import { P, TAU, audio, clamp, lightning, pick, rnd, withAlpha } from '../core';
import { T, emissive, glowRect, polyShape, rect, ribs, roundRect, screw, spec, vents } from '../art';
import {
  dust,
  energyMuzzle,
  heatGlow,
  impactFlash,
  makeBeam,
  makeBullet,
  radialStreaks,
  rimArcs,
  shockRing,
  sparkFan,
  splinters,
  trailPath,
} from '../fx';
import type { Weapon, WeaponDrawState } from '../types';
import { drawMP5Art, drawRifleArt } from './firearms';

type Ctx = CanvasRenderingContext2D;

/* ============================== TESLA RIFLE ============================== */

export const rifleElectro: Weapon = {
  id: 'rifleElectro',
  name: 'Tesla Rifle ARC',
  tag: '50 kV · BALL LIGHTNING',
  accent: '#38bdf8',
  accent2: '#a5f3fc',
  mode: 'projectile',
  cooldown: 0.5,
  recoilAmt: 12,
  muzzle: [220, -13],
  markSize: 30,
  draw: (ctx, s) => drawRifleArt(ctx, s, true),
  fire(api, x, y, a) {
    audio.play('tesla');
    energyMuzzle(api, x, y, a, '#38bdf8', '#e0f9ff', 60);
    api.flash('#38bdf8', 0.18);
    api.particles.push(P({ type: 'streak', x, y, rot: a, size: 190, width: 5, color: '#7dd3fc', life: 0.14 }));
    for (let i = 0; i < 7; i++)
      api.particles.push(P({ type: 'bolt', x, y, rot: a + rnd(-0.8, 0.8), size: rnd(50, 130), color: '#a5f3fc', life: rnd(0.08, 0.18), width: 2 }));
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: 1500,
        weapon: rifleElectro,
        kind: 'ball',
        size: 11,
        trailMax: 16,
        update(b, _dt, g) {
          if (Math.random() < 0.55)
            g.particles.push(
              P({ type: 'bolt', x: b.x + rnd(-8, 8), y: b.y + rnd(-8, 8), rot: rnd(TAU), size: rnd(10, 26), color: '#a5f3fc', life: 0.08, width: 1.3 })
            );
          g.particles.push(
            P({
              type: 'glow',
              x: b.x - Math.cos(b.angle) * 8,
              y: b.y - Math.sin(b.angle) * 8,
              size: 24,
              size2: 2,
              color: '#7dd3fc',
              color2: '#0369a1',
              life: 0.22,
              vx: rnd(-40, 40),
              vy: rnd(-40, 40),
            })
          );
          if (Math.random() < 0.3)
            g.particles.push(
              P({ type: 'spark', x: b.x, y: b.y, vx: rnd(-160, 160), vy: rnd(-160, 160), color: '#e0f9ff', life: 0.25, grav: 200, width: 1.4 })
            );
        },
        draw(ctx, b) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          // jagged lightning wake following the ball
          if (b.trail.length > 2) {
            const jag = () => {
              ctx.beginPath();
              b.trail.forEach((p, i) => {
                const j = i === b.trail.length - 1 ? 0 : (Math.random() - 0.5) * 10;
                i ? ctx.lineTo(p.x + j, p.y + j) : ctx.moveTo(p.x + j, p.y + j);
              });
            };
            ctx.lineJoin = 'round';
            jag();
            ctx.strokeStyle = 'rgba(56,189,248,0.3)';
            ctx.lineWidth = 9;
            ctx.stroke();
            jag();
            ctx.strokeStyle = 'rgba(165,243,252,0.9)';
            ctx.lineWidth = 2.6;
            ctx.stroke();
            jag();
            ctx.strokeStyle = 'rgba(255,255,255,0.95)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          // plasma core + crackling tendrils
          const g1 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 34);
          g1.addColorStop(0, 'rgba(255,255,255,1)');
          g1.addColorStop(0.22, 'rgba(186,240,255,0.95)');
          g1.addColorStop(0.55, 'rgba(14,165,233,0.5)');
          g1.addColorStop(1, 'rgba(3,105,161,0)');
          ctx.fillStyle = g1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 34, 0, TAU);
          ctx.fill();
          for (let i = 0; i < 8; i++) {
            const an = Math.random() * TAU;
            const r = rnd(20, 42);
            lightning(ctx, b.x, b.y, b.x + Math.cos(an) * r, b.y + Math.sin(an) * r, 6, '#7dd3fc', Math.random() * 100, 1.3, 4);
          }
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    audio.play('hitZap');
    impactFlash(api, x, y, 70, '#e0f9ff', '#38bdf8', 0.14);
    for (let i = 0; i < 12; i++)
      api.particles.push(P({ type: 'bolt', x, y, rot: rnd(TAU), size: rnd(30, 90), color: pick(['#7dd3fc', '#e0f9ff']), life: rnd(0.1, 0.26), width: 2.2 }));
    rimArcs(api, x, y, '#7dd3fc', 3, 1.5);
    sparkFan(api, x, y, a + Math.PI, 26, { spread: Math.PI, colors: ['#e0f9ff', '#7dd3fc', '#ffffff'], grav: 300, min: 120, max: 720, width: 2 });
    for (let i = 0; i < 3; i++) shockRing(api, x, y, 60 + i * 28, '#7dd3fc', 2.6, 0.26 + i * 0.1);
    splinters(api, x, y, a, 6, 0.8);
    dust(api, x, y, a, 3, 0.8, '#b9c6d6');
    api.shake(10);
    api.flash('#38bdf8', 0.22);
    api.hitstop(0.045);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.35);
    // a compact electrical pin-burn with two routed arc paths, not a radial crack star
    const pit = ctx.createRadialGradient(-1, -1, 0, 0, 0, 11);
    pit.addColorStop(0, '#03090e');
    pit.addColorStop(0.58, '#10232b');
    pit.addColorStop(1, 'rgba(16,35,43,0)');
    ctx.fillStyle = pit;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 7.2, -0.14, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const side = i - 1;
      const phase = t * 8 + m.seed + i * 1.9;
      const al = (0.28 + 0.48 * Math.abs(Math.sin(phase))) * hot;
      ctx.strokeStyle = withAlpha('#7dd3fc', al);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, side * 2.6);
      ctx.lineTo(-2, side * 3.6);
      ctx.lineTo(2, side * 1.7);
      ctx.lineTo(7, side * 2.4);
      ctx.stroke();
    }
    ctx.strokeStyle = withAlpha('#dffaff', 0.28 + hot * 0.58);
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(0, 0, 10 + Math.sin(t * 6 + m.seed) * 0.8, 0.35, 2.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 10 + Math.sin(t * 6 + m.seed) * 0.8, 3.4, 5.25);
    ctx.stroke();
    ctx.restore();
    heatGlow(ctx, 12, '#38bdf8', hot * 0.35);
    emissive(ctx, 0, 0, 6 + 2 * Math.sin(t * 9 + m.seed), '#e0f9ff', 0.2 + hot * 0.38);
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 6 && Math.random() < dt * 3.2)
      api.particles.push(
        P({ type: 'bolt', x, y, rot: out + rnd(-1.4, 1.4), size: rnd(8, 22), color: '#a5f3fc', life: 0.09, width: 1.2 })
      );
  },
};

/* ============================== ION MP5 ============================== */

export const mp5Electro: Weapon = {
  id: 'mp5Electro',
  name: 'MP5 ION PULSE',
  tag: 'HELIX BOLT · 650 RPM',
  accent: '#c084fc',
  accent2: '#f0abfc',
  mode: 'projectile',
  cooldown: 0.11,
  recoilAmt: 6,
  muzzle: [166, -8],
  markSize: 22,
  draw: (ctx, s) => drawMP5Art(ctx, s, true),
  fire(api, x, y, a) {
    audio.play('ion');
    energyMuzzle(api, x, y, a, '#c084fc', '#f5d0fe', 40);
    api.flash('#c084fc', 0.1);
    api.particles.push(P({ type: 'streak', x, y, rot: a, size: 110, width: 3, color: '#f0abfc', life: 0.1 }));
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: 1900,
        weapon: mp5Electro,
        kind: 'helix',
        size: 7,
        trailMax: 10,
        update(b, _dt, g) {
          g.particles.push(
            P({
              type: 'pixel',
              x: b.x + rnd(-5, 5),
              y: b.y + rnd(-5, 5),
              size: rnd(2, 4),
              rot: rnd(TAU),
              color: pick(['#f0abfc', '#c084fc', '#ffffff']),
              life: rnd(0.15, 0.32),
              vx: rnd(-30, 30),
              vy: rnd(-30, 30),
            })
          );
        },
        draw(ctx, b, t) {
          trailPath(ctx, b, '#c084fc', 3.2, 0.9);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          ctx.globalCompositeOperation = 'lighter';
          const L = 26;
          const cg = ctx.createLinearGradient(-L * 1.8, 0, L * 0.7, 0);
          cg.addColorStop(0, 'rgba(192,132,252,0)');
          cg.addColorStop(0.6, 'rgba(240,171,252,0.8)');
          cg.addColorStop(1, 'rgba(255,255,255,1)');
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.ellipse(-L * 0.4, 0, L * 1.3, 4.6, 0, 0, TAU);
          ctx.fill();
          // double helix
          for (let k = 0; k < 2; k++) {
            ctx.beginPath();
            for (let i = 0; i <= 28; i++) {
              const u = i / 28;
              const x = -L * 2.4 + u * L * 3;
              const y = Math.sin(i * 0.85 - t * 46 + k * Math.PI) * 6.5 * (0.2 + u * 0.8);
              i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.strokeStyle = k ? 'rgba(245,208,254,0.95)' : 'rgba(192,132,252,0.95)';
            ctx.lineWidth = 1.9;
            ctx.stroke();
          }
          emissive(ctx, L * 0.4, 0, 18, '#f0abfc', 0.95);
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    audio.play('hitZap');
    impactFlash(api, x, y, 46, '#f5d0fe', '#a855f7', 0.1);
    radialStreaks(api, x, y, 14, '#f0abfc', 40, 150);
    api.particles.push(P({ type: 'flare', x, y, rot: a, size: 90, size2: 8, width: 3.2, color: '#f0abfc', life: 0.12 }));
    shockRing(api, x, y, 56, '#c084fc', 3, 0.26);
    for (let i = 0; i < 12; i++)
      api.particles.push(
        P({
          type: 'pixel',
          x,
          y,
          vx: Math.cos(a + Math.PI + rnd(-1.4, 1.4)) * rnd(100, 520),
          vy: Math.sin(a + Math.PI + rnd(-1.4, 1.4)) * rnd(100, 520),
          size: rnd(2, 5),
          rot: rnd(TAU),
          color: pick(['#f0abfc', '#c084fc', '#ffffff']),
          life: rnd(0.25, 0.6),
          grav: 400,
          drag: 0.94,
        })
      );
    splinters(api, x, y, a, 4, 0.6);
    api.shake(6);
    api.hitstop(0.03);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.5);
    // ionised pinhole surrounded by three small circuit contacts
    const pit = ctx.createRadialGradient(-0.7, -0.7, 0, 0, 0, 8);
    pit.addColorStop(0, '#08040d');
    pit.addColorStop(0.62, '#251037');
    pit.addColorStop(1, 'rgba(37,16,55,0)');
    ctx.fillStyle = pit;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7.5, 5.5, 0.16, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const radius = 10 + Math.sin(t * 5 + m.seed) * 0.7;
    for (let i = 0; i < 3; i++) {
      const an = m.seed + t * 0.18 + (i / 3) * TAU;
      ctx.strokeStyle = withAlpha('#c084fc', (0.34 + hot * 0.42) * (0.7 + 0.3 * Math.sin(t * 7 + i)));
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, an, an + 0.72);
      ctx.stroke();
      const nx = Math.cos(an + 0.36) * radius,
        ny = Math.sin(an + 0.36) * radius;
      ctx.fillStyle = withAlpha('#f5d0fe', 0.6 + hot * 0.3);
      ctx.beginPath();
      ctx.arc(nx, ny, 1.5, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = withAlpha('#f0abfc', 0.28 + hot * 0.55);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.2, 2.1, Math.sin(t * 2 + m.seed) * 0.18, 0, TAU);
    ctx.stroke();
    ctx.restore();
    emissive(ctx, 0, 0, 9, '#f5d0fe', 0.3 + hot * 0.45);
  },
  ambient(api, x, y, _o, m, dt) {
    if (m.age < 3 && Math.random() < dt * 4)
      api.particles.push(P({ type: 'star', x: x + rnd(-6, 6), y: y + rnd(-6, 6), size: rnd(4, 8), color: '#f0abfc', life: 0.2, width: 1.1 }));
  },
};

/* ============================= RAILGUN SNIPER ============================= */

function drawSniper(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const c = clamp(s.cycle, 0, 1);
  const charge = c;
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 6);
  const glow = 0.4 + charge * 0.6;
  ctx.save();
  ctx.translate(-kk * 16, -kk * 2.4);
  ctx.rotate(-kk * 0.03);

  /* bipod */
  ctx.strokeStyle = '#0c1118';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(152, 2);
  ctx.lineTo(134, 40);
  ctx.moveTo(152, 2);
  ctx.lineTo(176, 40);
  ctx.stroke();
  ctx.strokeStyle = '#5b6778';
  ctx.lineWidth = 3;
  ctx.stroke();
  rect(ctx, 144, -2, 16, 10, 3, T.steel);

  /* stock + chassis */
  polyShape(ctx, [[-34, -20], [-100, -20], [-116, -14], [-118, 24], [-104, 28], [-76, 10], [-34, 10]], T.polymer, { brush: true });
  polyShape(ctx, [[-36, -18], [-96, -18], [-108, -13], [-90, -8], [-36, -8]], T.steel, { brush: true });
  rect(ctx, -122, -15, 7, 42, 3, T.black);
  glowRect(ctx, -92, 6, 40, 2.4, 1.2, '#38bdf8', 0.5 + pulse * 0.4);
  glowRect(ctx, -104, 17, 20, 2.2, 1.1, '#38bdf8', 0.4 + pulse * 0.3);

  /* grip + guard */
  ctx.save();
  ctx.translate(-22, 10);
  ctx.rotate(0.22);
  rect(ctx, -8, 0, 18, 36, 6, T.polymer, { brush: true });
  ctx.restore();
  ctx.strokeStyle = '#10151c';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.quadraticCurveTo(-12, 28, 2, 28);
  ctx.lineTo(18, 28);
  ctx.quadraticCurveTo(24, 28, 24, 12);
  ctx.stroke();

  /* receiver with power-cell window */
  rect(ctx, -36, -28, 112, 38, 7, T.polymer, { brush: true });
  polyShape(ctx, [[-30, -34], [64, -34], [72, -28], [-30, -28]], T.steel, { brush: true });
  ctx.save();
  roundRect(ctx, -22, -22, 56, 14, 4);
  ctx.fillStyle = '#04141f';
  ctx.fill();
  ctx.clip();
  const bars = 8;
  for (let i = 0; i < bars; i++) {
    const on = i / bars < charge;
    ctx.fillStyle = on ? withAlpha('#38bdf8', 0.9) : 'rgba(30,60,90,0.5)';
    roundRect(ctx, -19 + i * 6.8, -19, 5, 8, 1.4);
    ctx.fill();
    if (on) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(190,240,255,0.55)';
      roundRect(ctx, -19 + i * 6.8, -19, 5, 8, 1.4);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
  roundRect(ctx, -22, -22, 56, 14, 4);
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  vents(ctx, 42, -22, 26, 6, 5, '#04080d');
  screw(ctx, -30, 3, 2);
  screw(ctx, 68, 3, 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-30, 9);
  ctx.lineTo(70, 9);
  ctx.stroke();

  /* holo-scope */
  rect(ctx, 0, -42, 14, 12, 3, T.steel);
  rect(ctx, 52, -42, 14, 12, 3, T.steel);
  rect(ctx, -12, -62, 112, 22, 11, T.polymer, { brush: true });
  spec(ctx, -4, -57, 94, 0.45);
  rect(ctx, 86, -68, 28, 34, 10, T.black, { brush: true });
  ctx.save();
  roundRect(ctx, 112, -64, 6, 26, 3);
  const lg = ctx.createLinearGradient(112, -64, 118, -38);
  lg.addColorStop(0, '#a5f3fc');
  lg.addColorStop(0.5, '#2563eb');
  lg.addColorStop(1, '#a78bfa');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.restore();
  emissive(ctx, 116, -51, 16, '#67e8f9', 0.35 + pulse * 0.2);
  rect(ctx, -26, -66, 18, 30, 8, T.black, { brush: true });
  glowRect(ctx, 28, -58, 30, 7, 2, '#34d399', 0.55 + pulse * 0.3);
  rect(ctx, 22, -72, 16, 12, 3, T.gun, { brush: true });
  ribs(ctx, 22, -71, 38, -61, 5, 0.5);

  /* rail barrel with plasma channel */
  rect(ctx, 74, -23, 170, 9, 3, T.steel, { brush: true });
  rect(ctx, 74, -4, 170, 9, 3, T.steel, { brush: true });
  ctx.save();
  ctx.beginPath();
  ctx.rect(74, -14, 170, 10);
  ctx.clip();
  const cg = ctx.createLinearGradient(74, 0, 244, 0);
  cg.addColorStop(0, withAlpha('#0284c7', 0.25 + 0.3 * glow));
  cg.addColorStop(0.7, withAlpha('#7dd3fc', 0.5 + 0.45 * glow));
  cg.addColorStop(1, withAlpha('#ffffff', 0.7 + 0.3 * glow));
  ctx.fillStyle = '#031019';
  ctx.fillRect(74, -14, 170, 10);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = cg;
  ctx.fillRect(74, -14, 170, 10);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 56; i++) {
    const x = 74 + i * 3;
    const y = -9 + Math.sin(i * 0.8 - s.t * 34) * 2.6 * glow;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 6; i++) {
    const x = 96 + i * 26;
    rect(ctx, x, -30, 9, 40, 3, T.navy, { brush: true });
    glowRect(ctx, x + 2, -30, 5, 40, 2, '#38bdf8', 0.18 + glow * 0.5);
  }
  /* emitter */
  rect(ctx, 236, -30, 20, 44, 5, T.steel, { brush: true });
  ctx.strokeStyle = '#0b1220';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(246, -9, 12, 0, TAU);
  ctx.stroke();
  emissive(ctx, 252, -9, 18 + glow * 16 + kk * 20, '#bae6fd', 0.8 * glow + kk * 0.5);
  if (c < 0.5) lightning(ctx, 252, -26, 252, 9, 8, '#e0f2fe', Math.floor(s.t * 30), 1.4, 5);
  ctx.restore();
}

export const sniperBeam: Weapon = {
  id: 'sniperBeam',
  name: 'Railgun Sniper BEAM',
  tag: 'PHOTON LANCE · HITSCAN',
  accent: '#7dd3fc',
  accent2: '#e0f2fe',
  mode: 'beam',
  cooldown: 0.9,
  recoilAmt: 18,
  muzzle: [258, -9],
  markSize: 26,
  draw: drawSniper,
  fire(api, x, y, a) {
    audio.play('rail');
    const hs = api.hitscan(x, y, a);
    const len = hs.hit ? hs.dist : 1700;
    energyMuzzle(api, x, y, a, '#bae6fd', '#38bdf8', 62);
    api.flash('#d6f2ff', 0.24);
    api.shake(24);
    api.hitstop(0.07);
    // anamorphic lens flare + starburst
    api.particles.push(P({ type: 'streak', x, y, rot: a, size: 420, width: 9, color: '#7dd3fc', life: 0.2 }));
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 150, width: 6, color: '#bae6fd', life: 0.16 }));
    api.particles.push(P({ type: 'flare', x, y, rot: 0, size: 190, size2: 10, width: 3.2, color: '#e0f2fe', life: 0.16 }));
    for (let i = 0; i < 4; i++)
      api.particles.push(
        P({ type: 'shock', x: x + Math.cos(a) * i * 24, y: y + Math.sin(a) * i * 24, rot: a + Math.PI / 2, size: 120 + i * 40, size2: 8, color: '#e0f2fe', width: 3, life: 0.3 + i * 0.07 })
      );
    // coolant steam from the vents
    api.after(0.06, () => {
      const v = api.toWorld(150, -28);
      for (let i = 0; i < 10; i++)
        api.particles.push(
          P({ type: 'smoke', x: v.x + rnd(-30, 30), y: v.y, vx: rnd(-30, 30), vy: -rnd(40, 120), size: rnd(24, 50), size2: 6, color: '#dbeafe', life: rnd(0.7, 1.4), drag: 0.96 })
        );
    });
    api.beams.push(
      makeBeam({
        weapon: sniperBeam,
        x,
        y,
        angle: a,
        len,
        duration: 0.62,
        hit: hs.hit,
        hitX: hs.x,
        hitY: hs.y,
        tick(bm, _dt, g) {
          const k = 1 - bm.age / bm.duration;
          if (Math.random() < 0.9 * k) {
            const d = rnd(0, bm.len);
            g.particles.push(
              P({
                type: 'spark',
                x: bm.x + Math.cos(bm.angle) * d + rnd(-3, 3),
                y: bm.y + Math.sin(bm.angle) * d + rnd(-3, 3),
                vx: Math.cos(bm.angle + Math.PI / 2) * rnd(-200, 200),
                vy: Math.sin(bm.angle + Math.PI / 2) * rnd(-200, 200),
                color: '#e0f2fe',
                life: rnd(0.15, 0.4),
                width: 1.4,
                grav: 150,
              })
            );
          }
        },
        draw(ctx, bm) {
          const k = 1 - bm.age / bm.duration;
          const x1 = bm.x + Math.cos(bm.angle) * bm.len;
          const y1 = bm.y + Math.sin(bm.angle) * bm.len;
          const nx = -Math.sin(bm.angle),
            ny = Math.cos(bm.angle);
          const w = 18 * k * k * k + 2.2;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineCap = 'round';
          const g = ctx.createLinearGradient(bm.x, bm.y, x1, y1);
          g.addColorStop(0, withAlpha('#7dd3fc', 0.2 * k));
          g.addColorStop(0.15, withAlpha('#bae6fd', 0.85 * k));
          g.addColorStop(1, withAlpha('#ffffff', 0.95 * k));
          ctx.strokeStyle = g;
          for (const [mul, al] of [[5.2, 0.1], [3, 0.22], [1.6, 0.5]]) {
            ctx.globalAlpha = al * 2 > 1 ? 1 : al * 2;
            ctx.lineWidth = w * mul;
            ctx.beginPath();
            ctx.moveTo(bm.x, bm.y);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.strokeStyle = withAlpha('#ffffff', 0.98 * k);
          ctx.lineWidth = Math.max(0.9, w * 0.42);
          ctx.beginPath();
          ctx.moveTo(bm.x, bm.y);
          ctx.lineTo(x1, y1);
          ctx.stroke();
          // double helix of ionised air
          for (let h = 0; h < 2; h++) {
            ctx.beginPath();
            for (let i = 0; i <= 90; i++) {
              const u = i / 90;
              const px = bm.x + (x1 - bm.x) * u;
              const py = bm.y + (y1 - bm.y) * u;
              const off = Math.sin(u * 30 - bm.age * 36 + h * Math.PI) * (11 * k + 2);
              i ? ctx.lineTo(px + nx * off, py + ny * off) : ctx.moveTo(px + nx * off, py + ny * off);
            }
            ctx.strokeStyle = withAlpha(h ? '#e0f2fe' : '#38bdf8', 0.6 * k);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          // travelling pressure rings
          for (let i = 0; i < 9; i++) {
            const u = (bm.age * 2.4 + i / 9) % 1;
            const px = bm.x + (x1 - bm.x) * u;
            const py = bm.y + (y1 - bm.y) * u;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(bm.angle);
            ctx.strokeStyle = withAlpha('#bae6fd', 0.4 * k * (1 - u));
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(0, 0, 4 + u * 5, 14 + 30 * k * u, 0, 0, TAU);
            ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
        },
      })
    );
    if (hs.hit) api.registerHit(hs.x, hs.y, sniperBeam);
  },
  onImpact(api, x, y, a) {
    audio.play('hitBoom');
    impactFlash(api, x, y, 78, '#ffffff', '#38bdf8', 0.16);
    radialStreaks(api, x, y, 22, '#bae6fd', 80, 280);
    api.particles.push(P({ type: 'flare', x, y, rot: 0, size: 160, size2: 12, width: 3.2, color: '#e0f2fe', life: 0.18 }));
    for (let i = 0; i < 4; i++) shockRing(api, x, y, 70 + i * 36, '#bae6fd', 3.4, 0.28 + i * 0.1);
    sparkFan(api, x, y, a + Math.PI, 30, { spread: 1.6, colors: ['#ffffff', '#bae6fd', '#38bdf8'], max: 1100, grav: 500 });
    splinters(api, x, y, a, 16, 1.3);
    dust(api, x, y, a, 7, 1.3, '#cbd5e1');
    api.shake(18);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.45);
    // railgun leaves a narrow, fused aperture with one clean scoring line
    const pit = ctx.createRadialGradient(-2, -1, 0, 0, 0, 16);
    pit.addColorStop(0, '#02080d');
    pit.addColorStop(0.55, '#10212a');
    pit.addColorStop(1, 'rgba(16,33,42,0)');
    ctx.fillStyle = pit;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 9, -0.08, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(210,225,235,0.42)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 7, -0.08, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-10, -1);
    ctx.lineTo(12, 1);
    ctx.strokeStyle = 'rgba(13,34,46,0.9)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = withAlpha('#bae6fd', 0.25 + hot * 0.65);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = withAlpha('#38bdf8', 0.2 + hot * 0.4);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, 17 + Math.sin(t * 4 + m.seed) * 1.5, 0, TAU);
    ctx.stroke();
    ctx.restore();
    heatGlow(ctx, 22, '#38bdf8', hot * 0.85);
    emissive(ctx, 0, 0, 7, '#ffffff', 0.25 + hot * 0.5);
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 3 && Math.random() < dt * 5)
      api.particles.push(
        P({ type: 'smoke', x, y, vx: Math.cos(out) * rnd(8, 26), vy: Math.sin(out) * rnd(8, 26) - rnd(10, 24), size: rnd(12, 20), size2: 2, color: '#b6c4d6', life: rnd(0.7, 1.3), drag: 0.97 })
      );
  },
};

