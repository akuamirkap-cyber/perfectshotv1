import { P, TAU, audio, clamp, lerp, lightning, pick, rnd, withAlpha } from '../core';
import { T, bez, emissive, glowRect, polyShape, rect, roundRect, screw, shape, vents } from '../art';
import {
  dust,
  embers,
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

type Ctx = CanvasRenderingContext2D;

/* ================================== PHASER ================================== */

function drawPhaser(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const c = clamp(s.cycle, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 6);
  const glow = (0.4 + 0.6 * c) * (0.8 + 0.2 * pulse) + kk;
  ctx.save();
  ctx.translate(-kk * 4, 0);
  ctx.translate(-10, 30);
  ctx.rotate(-kk * 0.07);
  ctx.translate(10, -30);

  /* grip */
  ctx.save();
  ctx.translate(-8, 6);
  ctx.rotate(0.2);
  rect(ctx, -15, 0, 30, 52, 10, T.polymer, { brush: true });
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-13, 12 + i * 6);
    ctx.lineTo(13, 12 + i * 6);
    ctx.stroke();
  }
  rect(ctx, -9, 46, 18, 8, 3, T.steel);
  ctx.restore();

  /* shell */
  const shell = () => {
    ctx.beginPath();
    ctx.moveTo(-54, 2);
    ctx.quadraticCurveTo(-60, -22, -30, -27);
    ctx.lineTo(64, -25);
    ctx.quadraticCurveTo(100, -24, 110, -10);
    ctx.lineTo(110, -2);
    ctx.quadraticCurveTo(100, 8, 64, 10);
    ctx.lineTo(-6, 14);
    ctx.quadraticCurveTo(-40, 22, -54, 2);
    ctx.closePath();
  };
  shape(ctx, shell, -27, 22, T.steel, { brush: true, hi: 0.5 });
  polyShape(ctx, [[-26, -25], [66, -24], [92, -14], [-18, -9]], T.black, { brush: true });
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-22, -22);
  ctx.lineTo(64, -21);
  ctx.stroke();

  // setting dial
  ctx.save();
  ctx.translate(14, -27);
  rect(ctx, -10, -7, 20, 9, 3, T.chrome, { lw: 0.9 });
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1;
  const dOff = (1 - c) * 4;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-8 + i * 3.4 + dOff * 0.3, -7);
    ctx.lineTo(-8 + i * 3.4 + dOff * 0.3, 2);
    ctx.stroke();
  }
  ctx.restore();

  // power cell LEDs
  for (let i = 0; i < 6; i++) {
    const on = i < Math.floor(c * 6 + 0.05);
    const x = -26 + i * 11;
    roundRect(ctx, x, -17, 8, 5, 2);
    ctx.fillStyle = on ? '#fb923c' : '#3a2a22';
    ctx.fill();
    if (on) glowRect(ctx, x, -17, 8, 5, 2, '#fb923c', 0.9);
  }
  glowRect(ctx, 44, -17, 26, 5, 2.5, '#38bdf8', 0.45 + pulse * 0.35);
  emissive(ctx, -34, -12, 6, '#4ade80', 0.7 * pulse + 0.3);
  vents(ctx, -4, 1, 40, 5, 6, '#2b3340');
  screw(ctx, -44, -6, 2);
  screw(ctx, 56, 4, 2);

  /* emitter housing + crystal */
  rect(ctx, 94, -22, 22, 28, 6, T.chrome, { lw: 1.1 });
  roundRect(ctx, 100, -16, 14, 16, 5);
  ctx.fillStyle = '#1a0c05';
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(112, -8, 5, 9, 0, 0, TAU);
  const eg = ctx.createRadialGradient(111, -8, 0, 112, -8, 10);
  eg.addColorStop(0, '#ffffff');
  eg.addColorStop(0.4, '#fdba74');
  eg.addColorStop(1, '#c2410c');
  ctx.fillStyle = eg;
  ctx.fill();
  emissive(ctx, 114, -8, 16 + glow * 14, '#fb923c', 0.85 * Math.min(1, glow));
  ctx.restore();
}

export const phaser: Weapon = {
  id: 'phaser',
  name: 'Phaser Type-II',
  tag: 'STAR TREK · NADION PULSE',
  accent: '#fb923c',
  accent2: '#fde68a',
  mode: 'beam',
  cooldown: 0.65,
  recoilAmt: 4,
  muzzle: [120, -8],
  markSize: 24,
  draw: drawPhaser,
  fire(api, x, y, a) {
    audio.play('phaser');
    const hs = api.hitscan(x, y, a);
    energyMuzzle(api, x, y, a, '#fb923c', '#fde68a', 44);
    api.flash('#ffb062', 0.2);
    api.shake(5);
    api.particles.push(P({ type: 'flare', x, y, rot: a, size: 90, size2: 6, width: 0.3, color: '#ffe3b0', life: 0.14 }));
    api.beams.push(
      makeBeam({
        weapon: phaser,
        x,
        y,
        angle: a,
        len: hs.hit ? hs.dist : 1500,
        duration: 0.6,
        hit: hs.hit,
        hitX: hs.x,
        hitY: hs.y,
        tick(bm, _dt, g) {
          if (bm.hit && Math.random() < 0.9)
            g.particles.push(
              P({
                type: 'pixel',
                x: bm.hitX + rnd(-14, 14),
                y: bm.hitY + rnd(-14, 14),
                vx: rnd(-30, 30),
                vy: -rnd(20, 120),
                size: rnd(1.5, 3.4),
                rot: rnd(TAU),
                color: pick(['#ffe3b0', '#fdba74', '#ffffff']),
                life: rnd(0.4, 1),
                drag: 0.97,
              })
            );
        },
        draw(ctx, bm, t) {
          const k = clamp(Math.min(bm.age * 16, 1) * (1 - Math.pow(bm.age / bm.duration, 3)), 0, 1);
          const wob = Math.sin(t * 90) * 0.4 * k;
          const x1 = bm.x + Math.cos(bm.angle) * bm.len;
          const y1 = bm.y + Math.sin(bm.angle) * bm.len;
          const nx = -Math.sin(bm.angle),
            ny = Math.cos(bm.angle);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineCap = 'round';
          const line = (w: number, col: string) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(bm.x, bm.y + wob);
            ctx.lineTo(x1, y1 + wob);
            ctx.stroke();
          };
          line(24 * k, `rgba(249,115,22,${0.18 * k})`);
          line(11 * k, `rgba(251,146,60,${0.7 * k})`);
          line(4 * k, `rgba(254,240,180,${0.95 * k})`);
          line(1.4 * k, `rgba(255,255,255,${0.98 * k})`);
          // twin ripple ribbons
          for (let r = 0; r < 2; r++) {
            ctx.beginPath();
            for (let i = 0; i <= 80; i++) {
              const u = i / 80;
              const px = bm.x + (x1 - bm.x) * u;
              const py = bm.y + (y1 - bm.y) * u;
              const off = Math.sin(u * 46 - t * 40 + r * Math.PI) * 4.4 * k;
              i ? ctx.lineTo(px + nx * off, py + ny * off) : ctx.moveTo(px + nx * off, py + ny * off);
            }
            ctx.strokeStyle = `rgba(253,186,116,${0.6 * k})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
          // pulse train racing down the beam
          for (let i = 0; i < 16; i++) {
            const u = (bm.age * 2.4 + i / 16) % 1;
            const px = bm.x + (x1 - bm.x) * u;
            const py = bm.y + (y1 - bm.y) * u;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(bm.angle);
            const pg = ctx.createLinearGradient(-30, 0, 30, 0);
            pg.addColorStop(0, 'rgba(255,255,255,0)');
            pg.addColorStop(0.5, `rgba(255,255,255,${0.7 * k})`);
            pg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = pg;
            ctx.fillRect(-30, -2.2 * k, 60, 4.4 * k);
            ctx.restore();
          }
          if (bm.hit) emissive(ctx, x1, y1, 30 * k + 8, '#ffe3b0', 0.9 * k);
          ctx.restore();
        },
      })
    );
    if (hs.hit) api.registerHit(hs.x, hs.y, phaser);
  },
  onImpact(api, x, y, a) {
    audio.play('hitZap');
    impactFlash(api, x, y, 72, '#fff1d0', '#fb923c', 0.16);
    shockRing(api, x, y, 66, '#fdba74', 2.6, 0.3);
    shockRing(api, x, y, 38, '#ffffff', 2, 0.22);
    // dematerialisation: motes drift up instead of falling
    for (let i = 0; i < 38; i++) {
      const an = rnd(TAU);
      api.particles.push(
        P({
          type: 'pixel',
          x: x + Math.cos(an) * rnd(0, 18),
          y: y + Math.sin(an) * rnd(0, 18),
          vx: Math.cos(an) * rnd(20, 200),
          vy: Math.sin(an) * rnd(20, 200) - rnd(30, 140),
          size: rnd(1.5, 4),
          rot: rnd(TAU),
          color: pick(['#ffe3b0', '#fdba74', '#ffffff', '#fb923c']),
          life: rnd(0.5, 1.4),
          drag: 0.95,
        })
      );
    }
    for (let i = 0; i < 6; i++)
      api.particles.push(P({ type: 'star', x: x + rnd(-20, 20), y: y + rnd(-20, 20), size: rnd(6, 14), color: '#fff1d0', life: rnd(0.2, 0.5), width: 1.2 }));
    splinters(api, x, y, a, 4, 0.5);
    api.shake(7);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.4);
    // vaporised pale ash patch with a glowing molten rim
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
    g.addColorStop(0, 'rgba(224,214,200,0.95)');
    g.addColorStop(0.6, 'rgba(120,98,76,0.9)');
    g.addColorStop(1, 'rgba(50,28,12,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    // two soft vaporisation crescents, not radial fractures
    ctx.strokeStyle = withAlpha('#fdba74', 0.28 + hot * 0.48);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0.32, 1.65);
    ctx.arc(0, 0, 12, 3.45, 4.85);
    ctx.stroke();
    ctx.strokeStyle = withAlpha('#fb923c', 0.35 + hot * 0.6);
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = withAlpha('#fff1d0', 0.2 + hot * 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, TAU);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const fl = Math.abs(Math.sin(t * 7 + i * 2 + m.seed));
      if (fl > 0.55 && m.age < 4) {
        const an = m.seed + i * 1.1;
        emissive(ctx, Math.cos(an) * 8, Math.sin(an) * 8, 5, '#ffe3b0', fl * 0.7);
      }
    }
    ctx.restore();
    heatGlow(ctx, 18, '#fb923c', hot * 0.5);
  },
  ambient(api, x, y, _o, m, dt) {
    if (m.age < 3 && Math.random() < dt * 8)
      api.particles.push(
        P({ type: 'pixel', x: x + rnd(-8, 8), y: y + rnd(-8, 8), vx: rnd(-10, 10), vy: -rnd(20, 60), size: rnd(1.4, 2.6), rot: rnd(TAU), color: '#ffe3b0', life: rnd(0.5, 1) })
      );
  },
};

/* ============================== ENERGY SWORD ============================== */

function drawSword(ctx: Ctx, s: WeaponDrawState) {
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 9);
  const rec = s.recoil;
  const side = s.saberSide ?? 1;
  // Keep the resting stance fixed; only the animated stroke changes direction.
  const ang = -0.28 + side * 0.66 * rec * rec;
  const x0 = 34,
    x1 = 208;

  const blade = (alpha: number) => {
    const N = 34;
    const top: number[][] = [],
      bot: number[][] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const x = lerp(x0, x1, u);
      const w = 2.5 + 20 * Math.sin(Math.PI * Math.pow(u, 0.55)) * (1 - 0.22 * u);
      const curve = -(u * u) * 12;
      const n = Math.sin(x * 0.16 - s.t * 22) * 1.8 + Math.sin(x * 0.43 + s.t * 37) * 1.1;
      top.push([x, curve - w - n * 0.7]);
      bot.push([x, curve + w + n * 0.7]);
    }
    const path = (k = 1) => {
      ctx.beginPath();
      top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] * k) : ctx.moveTo(p[0], p[1] * k)));
      for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1] * k);
      ctx.closePath();
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    path();
    ctx.strokeStyle = 'rgba(56,246,255,0.2)';
    ctx.lineWidth = 22;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(56,246,255,0.35)';
    ctx.lineWidth = 9;
    ctx.stroke();
    const g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(224,255,255,0.95)');
    g.addColorStop(0.5, 'rgba(70,236,255,0.9)');
    g.addColorStop(1, 'rgba(150,120,255,0.85)');
    path();
    ctx.fillStyle = g;
    ctx.fill();
    // white-hot core
    const cg = ctx.createLinearGradient(x0, 0, x1, 0);
    cg.addColorStop(0, 'rgba(255,255,255,1)');
    cg.addColorStop(0.7, 'rgba(255,255,255,0.9)');
    cg.addColorStop(1, 'rgba(255,255,255,0)');
    path();
    ctx.save();
    ctx.clip();
    ctx.restore();
    ctx.beginPath();
    top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1] * 0.38) : ctx.moveTo(p[0], p[1] * 0.38)));
    for (let i = bot.length - 1; i >= 0; i--) ctx.lineTo(bot[i][0], bot[i][1] * 0.38);
    ctx.closePath();
    ctx.fillStyle = cg;
    ctx.fill();
    // bright edge line
    ctx.beginPath();
    top.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  };

  ctx.save();
  ctx.translate(-30, 12);
  ctx.rotate(ang);
  ctx.translate(30, -12);
  // motion-blur ghosts during the swing
  if (rec > 0.15)
    for (let g = 3; g >= 1; g--) {
      ctx.save();
      ctx.translate(30, -12);
      ctx.rotate(-side * g * 0.22 * rec);
      ctx.translate(-30, 12);
      blade(0.17 * rec);
      ctx.restore();
    }
  blade(1);
  // rising plasma motes
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 10; k++) {
    const ph = (s.t * 0.9 + k / 10) % 1;
    const x = 56 + k * 15;
    const y = -(((x - x0) / (x1 - x0)) ** 2) * 12 - 20 - ph * 26;
    ctx.fillStyle = `rgba(190,250,255,${(1 - ph) * 0.9})`;
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  /* hilt */
  // emitter prongs
  for (const d of [-1, 1]) {
    polyShape(ctx, [[-4, d * 12], [26, d * 20], [46, d * 15], [40, d * 9], [20, d * 11], [-4, d * 7]], T.bronze, { lw: 1 });
  }
  rect(ctx, -6, -9, 36, 18, 5, T.polymer, { brush: true });
  rect(ctx, 24, -7, 14, 14, 3, T.black);
  emissive(ctx, 36, 0, 24 + pulse * 8, '#67e8f9', 0.95);
  // grip
  rect(ctx, -66, -9, 62, 18, 6, T.black, { brush: true });
  for (let i = 0; i < 6; i++) {
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-62 + i * 10, -8);
    ctx.lineTo(-58 + i * 10, 8);
    ctx.stroke();
  }
  for (const bx of [-52, -32, -12]) rect(ctx, bx, -11, 6, 22, 2, T.bronze, { lw: 0.9 });
  // energy cell
  ctx.beginPath();
  ctx.arc(-24, 0, 6, 0, TAU);
  ctx.fillStyle = '#04141f';
  ctx.fill();
  emissive(ctx, -24, 0, 12 + pulse * 5, '#a78bfa', 0.9);
  // pommel
  const pg = ctx.createRadialGradient(-72, -2, 0, -70, 0, 12);
  pg.addColorStop(0, '#fff3c4');
  pg.addColorStop(0.5, '#b98a45');
  pg.addColorStop(1, '#3d2508');
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.ellipse(-70, 0, 8, 12, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();
}

export const energySword: Weapon = {
  id: 'energySword',
  name: 'Plasma Energy Sword',
  tag: 'COVENANT BLADE · CRESCENT WAVE',
  accent: '#38f6ff',
  accent2: '#a78bfa',
  mode: 'projectile',
  cooldown: 0.5,
  recoilAmt: 10,
  muzzle: [176, -34],
  markSize: 34,
  draw: drawSword,
  fire(api, x, y, a) {
    audio.play('sword');
    energyMuzzle(api, x, y, a, '#67e8f9', '#a78bfa', 54);
    api.flash('#67e8f9', 0.18);
    api.shake(9);
    // slash arc left hanging in the air
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 120, width: 5, color: '#a5f3fc', life: 0.14 }));
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: 1300,
        weapon: energySword,
        kind: 'crescent',
        size: 30,
        trailMax: 9,
        update(b, _dt, g) {
          for (let i = 0; i < 2; i++) {
            const t = rnd(-1.1, 1.1);
            const ca = Math.cos(b.angle),
              sa = Math.sin(b.angle);
            const lx = Math.cos(t) * 44 - 8,
              ly = Math.sin(t) * 44;
            g.particles.push(
              P({
                type: 'spark',
                x: b.x + lx * ca - ly * sa,
                y: b.y + lx * sa + ly * ca,
                vx: -ca * rnd(60, 220) + rnd(-60, 60),
                vy: -sa * rnd(60, 220) + rnd(-60, 60),
                color: pick(['#a5f3fc', '#ffffff', '#c4b5fd']),
                life: rnd(0.15, 0.35),
                width: 1.6,
              })
            );
          }
        },
        draw(ctx, b, t) {
          const crescent = (scale: number, alpha: number) => {
            ctx.save();
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.arc(0, 0, 44, -1.2, 1.2);
            ctx.arc(-30, 0, 61.5, 0.727, -0.727, true);
            ctx.closePath();
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.restore();
          };
          // afterimages along the path
          for (let i = 0; i < b.trail.length - 1; i += 2) {
            const p = b.trail[i];
            const u = i / b.trail.length;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(b.angle);
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = `rgba(103,232,249,${0.35})`;
            crescent(0.9 * u + 0.1, u * 0.45);
            ctx.restore();
          }
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle + Math.sin(t * 22) * 0.03);
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(56,246,255,0.22)';
          crescent(1.35, 1);
          ctx.fillStyle = 'rgba(103,232,249,0.5)';
          crescent(1.16, 1);
          const g = ctx.createLinearGradient(-20, 0, 46, 0);
          g.addColorStop(0, 'rgba(167,139,250,0.9)');
          g.addColorStop(0.5, 'rgba(160,250,255,1)');
          g.addColorStop(1, 'rgba(255,255,255,1)');
          ctx.fillStyle = g;
          crescent(1, 1);
          ctx.fillStyle = '#ffffff';
          crescent(0.9, 0.0);
          ctx.strokeStyle = 'rgba(255,255,255,0.95)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 44, -1.15, 1.15);
          ctx.stroke();
          emissive(ctx, 30, 0, 36, '#a78bfa', 0.55);
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    audio.play('hit');
    impactFlash(api, x, y, 90, '#ecfeff', '#38f6ff', 0.16);
    // the cut: long streak along the slash diagonal
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2 + 0.5, size: 220, width: 7, color: '#a5f3fc', life: 0.2 }));
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2 + 0.5, size: 120, width: 3, color: '#ffffff', life: 0.24 }));
    shockRing(api, x, y, 82, '#67e8f9', 3.2, 0.3);
    shockRing(api, x, y, 48, '#c4b5fd', 2.4, 0.24);
    rimArcs(api, x, y, '#67e8f9', 1, 0.9);
    sparkFan(api, x, y, a + Math.PI, 28, { spread: 1.5, colors: ['#a5f3fc', '#ffffff', '#c4b5fd'], max: 900, grav: 500 });
    splinters(api, x, y, a, 13, 1.1);
    dust(api, x, y, a, 4, 1);
    api.shake(13);
    api.hitstop(0.05);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.35);
    ctx.save();
    ctx.rotate(0.5);
    // gash with raised splinters on both lips
    ctx.strokeStyle = 'rgba(236,200,150,0.55)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      const x = -24 + i * 3.6;
      const d = i % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x, d * 3.4);
      ctx.lineTo(x + 2, d * (6 + (i % 3) * 1.5));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.quadraticCurveTo(0, -7, 28, 0);
    ctx.quadraticCurveTo(0, 7, -26, 0);
    ctx.closePath();
    ctx.fillStyle = '#07060a';
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(-26, 0, 28, 0);
    g.addColorStop(0, `rgba(103,232,249,${0.25 + hot * 0.6})`);
    g.addColorStop(0.5, `rgba(255,255,255,${0.3 + hot * 0.6})`);
    g.addColorStop(1, `rgba(167,139,250,${0.2 + hot * 0.5})`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.quadraticCurveTo(0, -3.4, 27, 0);
    ctx.stroke();
    if (Math.sin(t * 11 + m.seed) > 0.2 && m.age < 5) lightning(ctx, -22, 0, 24, 0, 5, '#a5f3fc', m.seed + t, 1.1, 7);
    ctx.restore();
    ctx.restore();
    heatGlow(ctx, 20, '#38f6ff', hot * 0.4);
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 4 && Math.random() < dt * 4)
      api.particles.push(P({ type: 'spark', x, y, vx: Math.cos(out) * rnd(10, 60), vy: -rnd(30, 90), color: '#a5f3fc', life: 0.3, width: 1.2, grav: 100 }));
  },
};

/* =============================== PLASMACASTER =============================== */

function drawPlasmacaster(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const c = clamp(s.cycle, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 4.5);
  const charge = clamp(0.28 + c * 0.62 + kk * 0.8, 0, 1);
  const glow = charge * (0.82 + 0.18 * pulse);
  ctx.save();
  ctx.translate(-kk * 12, 0);

  /* shoulder mount */
  polyShape(ctx, [[-100, 28], [-108, -4], [-86, -24], [-44, -28], [-28, -10], [-28, 32], [-62, 42]], T.alien, { brush: true });
  polyShape(ctx, [[-92, -2], [-70, -16], [-50, -18], [-50, 20], [-76, 26], [-92, 20]], T.bronze, { lw: 1 });
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-84 + i * 10, -6);
    ctx.lineTo(-84 + i * 10, 18);
    ctx.stroke();
  }
  for (const [x, y] of [[-96, 8], [-40, -14], [-38, 24]]) screw(ctx, x, y, 2.4);
  // glowing tribal glyphs
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = `rgba(96,165,250,${0.5 + glow * 0.4})`;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-64, -10);
  ctx.lineTo(-58, 0);
  ctx.lineTo(-64, 10);
  ctx.moveTo(-52, -10);
  ctx.lineTo(-46, 0);
  ctx.lineTo(-52, 10);
  ctx.stroke();
  ctx.restore();

  /* gimbal arm */
  rect(ctx, -34, -16, 44, 11, 4, T.gun, { brush: true });
  rect(ctx, -34, 6, 44, 11, 4, T.gun, { brush: true });
  const jg = ctx.createRadialGradient(-2, -2, 0, 0, 0, 14);
  jg.addColorStop(0, '#e5e7eb');
  jg.addColorStop(0.6, '#6b7280');
  jg.addColorStop(1, '#1f2937');
  ctx.fillStyle = jg;
  ctx.beginPath();
  ctx.arc(2, 0, 13, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  /* cannon body: the shoulder gimbal kicks upward, then settles back on target */
  ctx.save();
  ctx.translate(2, 0);
  ctx.rotate(-kk * 0.095 + Math.sin(s.t * 1.7) * 0.012);
  ctx.translate(-2, 0);
  polyShape(ctx, [[6, -28], [72, -36], [112, -22], [126, -9], [126, 9], [112, 22], [72, 36], [6, 28]], T.alien, { brush: true });
  polyShape(ctx, [[20, -31], [76, -39], [108, -26], [44, -21]], T.bronze, { lw: 1 });
  polyShape(ctx, [[20, 31], [76, 39], [108, 26], [44, 21]], T.bronze, { lw: 1 });
  // coil rings charge up from rear to front
  for (let i = 0; i < 3; i++) {
    const x = 28 + i * 22;
    rect(ctx, x, -32, 9, 64, 3, T.gun, { brush: true });
    const lit = clamp(charge * 3.2 - i, 0, 1);
    glowRect(ctx, x + 2, -26, 5, 52, 2, '#60a5fa', Math.min(1, lit) * 0.9);
  }
  // front prongs flare open on firing
  const open = 0.1 + s.recoil * 0.5;
  for (const d of [-1, 1]) {
    ctx.save();
    ctx.translate(112, d * 18);
    ctx.rotate(d * open);
    polyShape(ctx, [[0, -7], [46, -4], [64, 0], [46, 4], [0, 7]], T.bronze, { lw: 1 });
    ctx.restore();
  }
  // emitter
  ctx.beginPath();
  ctx.arc(126, 0, 13, 0, TAU);
  ctx.fillStyle = '#04080f';
  ctx.fill();
  ctx.strokeStyle = '#8b97a8';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  emissive(ctx, 126, 0, 20 + glow * 14, '#93c5fd', 0.9 * Math.min(1, glow));
  // triple targeting laser
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const tri = [[176, -10], [186, 6], [168, 7]];
  for (const [tx, ty] of tri) {
    ctx.strokeStyle = `rgba(255,60,60,${0.28 + pulse * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(126 + (ty > 0 ? 6 : -2), ty * 0.2);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    emissive(ctx, tx, ty, 6, '#ff3030', 0.9);
  }
  ctx.restore();
  ctx.restore();
  ctx.restore();
}

export const plasmacaster: Weapon = {
  id: 'plasmacaster',
  name: 'Plasmacaster',
  tag: 'PREDATOR · SHOULDER CANNON',
  accent: '#60a5fa',
  accent2: '#c4b5fd',
  mode: 'projectile',
  cooldown: 0.8,
  recoilAmt: 12,
  muzzle: [134, 0],
  markSize: 34,
  draw: drawPlasmacaster,
  fire(api, x, y, a) {
    audio.play('plasma');
    energyMuzzle(api, x, y, a, '#60a5fa', '#c4b5fd', 70);
    api.flash('#d5e8ff', 0.3);
    api.shake(15);
    api.hitstop(0.035);
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 150, width: 6, color: '#bfdbfe', life: 0.17 }));
    for (let i = 0; i < 4; i++)
      api.particles.push(P({ type: 'shock', x, y, rot: a + Math.PI / 2, size: 62 + i * 31, size2: 7, color: i % 2 ? '#c4b5fd' : '#bfdbfe', width: 2.4, life: 0.22 + i * 0.07 }));
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 130, width: 7, color: '#bfdbfe', life: 0.15 }));
    // steam vent
    api.after(0.05, () => {
      const v = api.toWorld(60, -36);
      for (let i = 0; i < 6; i++)
        api.particles.push(P({ type: 'smoke', x: v.x + rnd(-14, 14), y: v.y, vx: rnd(-20, 20), vy: -rnd(40, 100), size: rnd(18, 36), size2: 4, color: '#cfe0ff', life: rnd(0.6, 1.1) }));
    });
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: 1160,
        weapon: plasmacaster,
        kind: 'plasmaBall',
        size: 17,
        trailMax: 16,
        update(b, _dt, g) {
          for (let i = 0; i < 2; i++)
            g.particles.push(
              P({
                type: 'glow',
                x: b.x + rnd(-9, 9),
                y: b.y + rnd(-9, 9),
                size: 26,
                size2: 2,
                color: '#60a5fa',
                color2: '#1e3a8a',
                life: rnd(0.2, 0.5),
                vx: -Math.cos(b.angle) * rnd(20, 100),
                vy: -Math.sin(b.angle) * rnd(20, 100),
              })
            );
          if (Math.random() < 0.35)
            g.particles.push(P({ type: 'bolt', x: b.x, y: b.y, rot: rnd(TAU), size: rnd(16, 34), color: '#bfdbfe', life: 0.1, width: 1.5 }));
          if (Math.random() < 0.4)
            g.particles.push(
              P({ type: 'ember', x: b.x, y: b.y, vx: rnd(-90, 90), vy: rnd(-90, 90), size: rnd(1.6, 3), color: '#dbeafe', color2: '#3b82f6', life: rnd(0.3, 0.7), grav: 60 })
            );
        },
        draw(ctx, b, t) {
          trailPath(ctx, b, '#60a5fa', 9, 0.65);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.globalCompositeOperation = 'lighter';
          const pu = 1 + Math.sin(t * 26) * 0.1;
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 40 * pu);
          g.addColorStop(0, 'rgba(255,255,255,1)');
          g.addColorStop(0.2, 'rgba(219,234,254,0.96)');
          g.addColorStop(0.5, 'rgba(59,130,246,0.6)');
          g.addColorStop(1, 'rgba(29,78,216,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(0, 0, 40 * pu, 0, TAU);
          ctx.fill();
          // swirling plasma strands
          ctx.lineWidth = 1.6;
          for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = `rgba(${i % 2 ? '196,181,253' : '191,219,254'},0.7)`;
            ctx.beginPath();
            const ph = t * (6 + i) + i * 1.7;
            ctx.arc(0, 0, 10 + i * 3.2, ph, ph + 2.2);
            ctx.stroke();
          }
          ctx.rotate(b.angle);
          for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `rgba(196,181,253,${0.5 - i * 0.13})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(-12 - i * 13, 0, 5, 16 - i * 3.4, 0, 0, TAU);
            ctx.stroke();
          }
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    audio.play('hitBoom');
    impactFlash(api, x, y, 152, '#ffffff', '#3b82f6', 0.22);
    api.flash('#bfdbfe', 0.34);
    for (let i = 0; i < 5; i++) shockRing(api, x, y, 58 + i * 34, i % 2 ? '#c4b5fd' : '#93c5fd', 3.6, 0.25 + i * 0.09);
    radialStreaks(api, x, y, 18, '#bfdbfe', 80, 265);
    rimArcs(api, x, y, '#93c5fd', 2, 1.2);
    // molten plasma droplets splashing and falling
    for (let i = 0; i < 34; i++) {
      const an = a + Math.PI + rnd(-1.5, 1.5);
      const sp = rnd(120, 560);
      api.particles.push(
        P({
          type: 'ember',
          x,
          y,
          vx: Math.cos(an) * sp,
          vy: Math.sin(an) * sp - 60,
          size: rnd(2, 4.4),
          color: '#e0f2fe',
          color2: '#2563eb',
          life: rnd(0.6, 1.5),
          grav: 700,
          drag: 0.97,
        })
      );
    }
    sparkFan(api, x, y, a + Math.PI, 22, { spread: 1.6, colors: ['#ffffff', '#93c5fd', '#c4b5fd'], max: 900 });
    splinters(api, x, y, a, 14, 1.2);
    dust(api, x, y, a, 5, 1.2, '#b9c6d6');
    api.shake(21);
    api.hitstop(0.07);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.3);
    // compact fused plasma splash; three soft lobes instead of a starburst crater
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(-2, -1, 0, 0, 0, 17);
    g.addColorStop(0, `rgba(235,245,255,${0.84 * hot})`);
    g.addColorStop(0.42, `rgba(96,165,250,${0.52 * hot})`);
    g.addColorStop(1, 'rgba(30,64,175,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 17, 12, -0.15, 0, TAU);
    ctx.fill();
    for (const [sx, sy, rr] of [[-12, -5, 4], [11, -2, 3.2], [3, 8, 2.5]] as number[][]) {
      const fl = 0.58 + 0.42 * Math.sin(t * 4 + sx + m.seed);
      emissive(ctx, sx, sy, rr * 2.2, '#93c5fd', fl * hot * 0.68);
    }
    ctx.strokeStyle = `rgba(191,219,254,${0.28 * hot})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 13, 8.5, -0.15, 0.35, 2.5);
    ctx.stroke();
    ctx.restore();
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 5 && Math.random() < dt * 5)
      api.particles.push(
        P({ type: 'ember', x, y, vx: rnd(-20, 20), vy: -rnd(10, 50), size: rnd(1.4, 2.6), color: '#dbeafe', color2: '#3b82f6', life: rnd(0.5, 1), grav: 60 })
      );
    if (m.age < 3 && Math.random() < dt * 3)
      api.particles.push(P({ type: 'smoke', x, y, vx: Math.cos(out) * 10, vy: -rnd(20, 50), size: rnd(14, 24), size2: 3, color: '#a8b8d0', life: rnd(0.7, 1.2) }));
  },
};

/* ================================= PROTON PACK ================================ */

function drawProton(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const c = clamp(s.cycle, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 8);
  const spin = s.t * (5 + kk * 16) + (1 - c) * 10;
  const hoseKick = kk * 13 + Math.sin(s.t * 2.4) * 2;
  ctx.save();
  ctx.translate(-kk * 2.5, kk * 0.7);

  /* the pack */
  rect(ctx, -200, -50, 96, 108, 12, T.polymer, { brush: true });
  rect(ctx, -194, -44, 84, 40, 8, T.steel, { brush: true });
  // cyclotron window
  ctx.beginPath();
  ctx.arc(-152, -20, 26, 0, TAU);
  ctx.fillStyle = '#0b0b0f';
  ctx.fill();
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3.4;
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const an = spin + (i * TAU) / 4;
    const lx = -152 + Math.cos(an) * 15,
      ly = -20 + Math.sin(an) * 15;
    const lit = 0.55 + 0.45 * Math.sin(an * 1 + s.t * 3);
    emissive(ctx, lx, ly, 15, i % 2 ? '#fb923c' : '#ef4444', lit);
  }
  emissive(ctx, -152, -20, 18, '#fbbf24', 0.25 + pulse * 0.2);
  // pack detail
  rect(ctx, -190, 14, 72, 10, 3, T.black);
  for (let i = 0; i < 5; i++) {
    roundRect(ctx, -186 + i * 14, 16, 10, 6, 2);
    ctx.fillStyle = (Math.floor(s.t * 3) + i) % 5 === 0 ? '#fde047' : '#3a3f48';
    ctx.fill();
  }
  rect(ctx, -190, 30, 30, 22, 4, T.gun);
  rect(ctx, -154, 30, 36, 22, 4, T.gun);
  vents(ctx, -186, 34, 22, 14, 4, '#06080b');
  rect(ctx, -106, 6, 18, 18, 4, T.chrome, { lw: 1 });

  /* hose from pack to wand */
  const hose: number[][] = [];
  for (let i = 0; i <= 28; i++)
    hose.push(bez([-92, 14], [-78, 78 + hoseKick], [-52, 62 - hoseKick * 0.45], [-30 - kk * 8, 6 + kk * 4], i / 28));
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  hose.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
  ctx.strokeStyle = '#05060a';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.strokeStyle = '#2a2f38';
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1.4;
  for (let i = 1; i < hose.length - 1; i += 1) {
    const p = hose[i],
      q = hose[i + 1];
    const tx = q[0] - p[0],
      ty = q[1] - p[1];
    const l = Math.hypot(tx, ty) || 1;
    ctx.beginPath();
    ctx.moveTo(p[0] - (ty / l) * 4.5, p[1] + (tx / l) * 4.5);
    ctx.lineTo(p[0] + (ty / l) * 4.5, p[1] - (tx / l) * 4.5);
    ctx.stroke();
  }

  /* neutrona wand */
  ctx.translate(-kk * 8, 0);
  ctx.translate(-4, 10);
  ctx.rotate(-kk * 0.13 + Math.sin(s.t * 2.8) * 0.012);
  ctx.translate(4, -10);
  // grips
  ctx.save();
  ctx.translate(-4, 10);
  ctx.rotate(0.14);
  rect(ctx, -12, 0, 26, 46, 8, T.polymer, { brush: true });
  ctx.restore();
  rect(ctx, 54, 8, 16, 32, 6, T.polymer, { brush: true });
  // main body
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(-34, -22);
    ctx.lineTo(66, -26);
    ctx.quadraticCurveTo(92, -24, 92, -10);
    ctx.lineTo(92, 2);
    ctx.quadraticCurveTo(92, 12, 66, 12);
    ctx.lineTo(-34, 14);
    ctx.quadraticCurveTo(-42, -4, -34, -22);
    ctx.closePath();
  };
  shape(ctx, body, -26, 14, T.steel, { brush: true, hi: 0.5 });
  rect(ctx, -20, -34, 66, 14, 4, T.black, { brush: true });
  // bar graph chase
  for (let i = 0; i < 9; i++) {
    const on = (Math.floor(s.t * 8) + i) % 9 < 5 + Math.round(c * 3);
    const col = i < 4 ? '#22c55e' : i < 7 ? '#eab308' : '#ef4444';
    roundRect(ctx, -16 + i * 6.6, -31, 5, 8, 1.4);
    ctx.fillStyle = on ? col : '#2b2f36';
    ctx.fill();
    if (on) glowRect(ctx, -16 + i * 6.6, -31, 5, 8, 1.4, col, 0.8);
  }
  // clippard valve & red/yellow boxes
  rect(ctx, 48, -40, 6, 16, 2, T.chrome, { lw: 0.9 });
  rect(ctx, 48, -42, 26, 6, 3, T.chrome, { lw: 0.9 });
  rect(ctx, -26, -14, 24, 12, 3, T.red);
  rect(ctx, 2, -14, 24, 12, 3, T.brass);
  glowRect(ctx, 2, -14, 24, 12, 3, '#fde047', 0.25 + pulse * 0.4);
  for (let i = 0; i < 4; i++) {
    const on = Math.sin(s.t * 6 + i * 1.7) > 0;
    const col = ['#ef4444', '#22c55e', '#eab308', '#38bdf8'][i];
    ctx.fillStyle = on ? col : '#2b3340';
    ctx.beginPath();
    ctx.arc(36 + i * 9, -3, 2.8, 0, TAU);
    ctx.fill();
    if (on) emissive(ctx, 36 + i * 9, -3, 7, col, 0.7);
  }
  // barrel + flared shroud
  rect(ctx, 90, -18, 62, 18, 5, T.steel, { brush: true });
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(98 + i * 9, -18);
    ctx.lineTo(98 + i * 9, 0);
    ctx.stroke();
  }
  polyShape(ctx, [[150, -24], [176, -16], [176, -2], [150, 6]], T.chrome, { lw: 1 });
  ctx.beginPath();
  ctx.ellipse(176, -9, 4, 8, 0, 0, TAU);
  ctx.fillStyle = '#1a0a02';
  ctx.fill();
  emissive(ctx, 176, -9, 16 + pulse * 8 + kk * 18, '#fde047', 0.85);
  ctx.restore();
}

function drawProtonIcon(ctx: Ctx, s: WeaponDrawState) {
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 8);
  // unmistakable backpack/cyclotron silhouette
  rect(ctx, -108, -30, 55, 62, 8, T.polymer, { brush: true });
  rect(ctx, -103, -25, 45, 18, 5, T.steel, { brush: true });
  ctx.fillStyle = '#090b10';
  ctx.beginPath();
  ctx.arc(-82, 2, 17, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3;
  ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = s.t * 4 + (i / 4) * TAU;
    emissive(ctx, -82 + Math.cos(a) * 10, 2 + Math.sin(a) * 10, 8, i % 2 ? '#fb923c' : '#ef4444', 0.7 + pulse * 0.25);
  }
  rect(ctx, -102, 20, 39, 7, 2, T.black);
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, -99 + i * 9, 21, 6, 4, 1.5);
    ctx.fillStyle = (Math.floor(s.t * 3) + i) % 4 === 0 ? '#fde047' : '#475569';
    ctx.fill();
  }
  // reinforced hose behind the wand
  ctx.beginPath();
  ctx.moveTo(-54, 8);
  ctx.bezierCurveTo(-35, 44, -27, 34, -14, 4);
  ctx.strokeStyle = '#05060a';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // wand and hand grip
  ctx.save();
  ctx.translate(-20, 5);
  ctx.rotate(0.2);
  rect(ctx, -9, 0, 18, 30, 6, T.polymer, { brush: true });
  ctx.restore();
  rect(ctx, -23, -16, 116, 26, 7, T.steel, { brush: true });
  rect(ctx, -16, -22, 67, 8, 3, T.black);
  for (let i = 0; i < 7; i++) {
    const col = i < 3 ? '#22c55e' : i < 5 ? '#eab308' : '#ef4444';
    roundRect(ctx, -12 + i * 8.5, -20, 6, 4, 1.5);
    ctx.fillStyle = col;
    ctx.fill();
  }
  rect(ctx, 3, -9, 23, 12, 3, T.red);
  rect(ctx, 31, -9, 23, 12, 3, T.brass);
  glowRect(ctx, 31, -9, 23, 12, 3, '#fde047', 0.25 + pulse * 0.35);
  rect(ctx, 50, -13, 40, 19, 5, T.gun, { brush: true });
  vents(ctx, 53, -9, 31, 11, 5, '#121820');
  polyShape(ctx, [[87, -20], [112, -13], [112, 4], [87, 11]], T.chrome, { lw: 1 });
  ctx.fillStyle = '#140a03';
  ctx.beginPath();
  ctx.ellipse(112, -4.5, 4, 8, 0, 0, TAU);
  ctx.fill();
  emissive(ctx, 112, -4.5, 13 + pulse * 6, '#fde047', 0.8);
}

export const protonPack: Weapon = {
  id: 'protonPack',
  name: 'Proton Pack',
  tag: 'GHOSTBUSTERS · PARTICLE STREAM',
  accent: '#fde047',
  accent2: '#f87171',
  mode: 'beam',
  cooldown: 1.0,
  recoilAmt: 10,
  muzzle: [180, -9],
  markSize: 34,
  draw: drawProton,
  drawIcon: drawProtonIcon,
  fire(api, x, y, a) {
    audio.play('proton');
    const hs = api.hitscan(x, y, a);
    energyMuzzle(api, x, y, a, '#fde047', '#f87171', 56);
    api.flash('#fef08a', 0.24);
    api.shake(12);
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 112, width: 5.5, color: '#fff1a8', life: 0.16 }));
    api.after(0.35, () => {
      const v = api.toWorld(120, -22);
      for (let i = 0; i < 7; i++)
        api.particles.push(P({ type: 'smoke', x: v.x + rnd(-20, 20), y: v.y, vx: rnd(-20, 20), vy: -rnd(40, 110), size: rnd(18, 36), size2: 4, color: '#e5e7eb', life: rnd(0.7, 1.3) }));
    });
    api.beams.push(
      makeBeam({
        weapon: protonPack,
        x,
        y,
        angle: a,
        len: hs.hit ? hs.dist : 1300,
        duration: 0.95,
        hit: hs.hit,
        hitX: hs.x,
        hitY: hs.y,
        tick(bm, _dt, g) {
          const k = 1 - bm.age / bm.duration;
          const nx = -Math.sin(bm.angle),
            ny = Math.cos(bm.angle);
          for (let i = 0; i < 3; i++) {
            const d = rnd(0, bm.len);
            const off = rnd(-16, 16);
            g.particles.push(
              P({
                type: 'spark',
                x: bm.x + Math.cos(bm.angle) * d + nx * off,
                y: bm.y + Math.sin(bm.angle) * d + ny * off,
                vx: nx * rnd(-240, 240),
                vy: ny * rnd(-240, 240) - 40,
                color: pick(['#fde047', '#fb7185', '#ffffff', '#fb923c']),
                life: rnd(0.1, 0.35),
                width: 1.5,
                grav: 100,
              })
            );
          }
          if (bm.hit && Math.random() < 0.95 * k) {
            g.particles.push(P({ type: 'bolt', x: bm.hitX, y: bm.hitY, rot: rnd(TAU), size: rnd(26, 70), color: pick(['#fde047', '#fb7185']), life: 0.12, width: 2 }));
            g.particles.push(
              P({ type: 'fire', x: bm.hitX + rnd(-8, 8), y: bm.hitY + rnd(-8, 8), vx: rnd(-80, 80), vy: -rnd(40, 160), size: rnd(18, 34), size2: 4, color: '#fbbf24', color2: '#b91c1c', life: rnd(0.25, 0.5), drag: 0.93 })
            );
          }
        },
        draw(ctx, bm, t) {
          const k = clamp(Math.min(bm.age * 12, 1) * (1 - Math.pow(bm.age / bm.duration, 2.4)), 0, 1);
          const nx = -Math.sin(bm.angle),
            ny = Math.cos(bm.angle);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          const wave = (amp: number, freq: number, width: number, color: string, alpha: number, ph: number, speed = 18) => {
            ctx.beginPath();
            const N = 90;
            for (let i = 0; i <= N; i++) {
              const u = i / N;
              const px = bm.x + Math.cos(bm.angle) * bm.len * u;
              const py = bm.y + Math.sin(bm.angle) * bm.len * u;
              const env = Math.min(1, u * 8) * (0.55 + 0.45 * Math.sin(u * 5 - t * 6));
              const o = Math.sin(u * freq - t * speed + ph) * amp * env * k + Math.sin(u * freq * 2.3 - t * 29 + ph) * amp * 0.28 * k;
              i ? ctx.lineTo(px + nx * o, py + ny * o) : ctx.moveTo(px + nx * o, py + ny * o);
            }
            ctx.strokeStyle = withAlpha(color, alpha * k);
            ctx.lineWidth = width;
            ctx.stroke();
          };
          // intertwined ribbons: the stream "boils"
          wave(28, 17, 20, '#f59e0b', 0.14, 0);
          wave(26, 17, 9, '#fde047', 0.5, 0);
          wave(26, 17, 3, '#ffffff', 0.95, 0);
          wave(22, 21, 8, '#f87171', 0.4, 2.1);
          wave(22, 21, 2.4, '#fecaca', 0.8, 2.1);
          wave(18, 26, 6, '#fb923c', 0.35, 4.2);
          wave(14, 33, 5, '#c084fc', 0.35, 5.5);
          wave(8, 11, 14, '#fff7c2', 0.25, 1, 11);
          emissive(ctx, bm.x, bm.y, 26 * k + 4, '#fde047', 0.95 * k);
          if (bm.hit) {
            const hx = bm.hitX,
              hy = bm.hitY;
            emissive(ctx, hx, hy, 44 * k + 8, '#fde047', 0.95 * k);
            ctx.strokeStyle = withAlpha('#fb7185', 0.7 * k);
            ctx.lineWidth = 2.4;
            for (let i = 0; i < 2; i++) {
              ctx.beginPath();
              ctx.arc(hx, hy, 14 + i * 9 + Math.sin(t * 20 + i) * 3, t * 10, t * 10 + 4.2);
              ctx.stroke();
            }
          }
          ctx.restore();
        },
      })
    );
    if (hs.hit) api.registerHit(hs.x, hs.y, protonPack);
  },
  onImpact(api, x, y, a) {
    audio.play('hitZap');
    impactFlash(api, x, y, 90, '#fff7c2', '#f59e0b', 0.18);
    for (let i = 0; i < 12; i++)
      api.particles.push(P({ type: 'bolt', x, y, rot: rnd(TAU), size: rnd(30, 80), color: pick(['#fde047', '#fb7185', '#c084fc']), life: rnd(0.1, 0.26), width: 2 }));
    rimArcs(api, x, y, '#fde047', 3, 1.4);
    shockRing(api, x, y, 80, '#fde047', 3, 0.3);
    shockRing(api, x, y, 50, '#fb7185', 2.4, 0.24);
    sparkFan(api, x, y, a + Math.PI, 26, { spread: Math.PI, colors: ['#fde047', '#fb7185', '#ffffff'], grav: 300, max: 760, width: 2 });
    embers(api, x, y, 20, '#fde68a', '#dc2626', 1, 100);
    splinters(api, x, y, a, 8, 0.9);
    api.shake(14);
    api.hitstop(0.045);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.35);
    // a compact soot patch crossed by the three colored particle-stream channels
    const sg = ctx.createRadialGradient(-2, 0, 2, 0, 0, 22);
    sg.addColorStop(0, 'rgba(12,9,8,0.9)');
    sg.addColorStop(0.68, 'rgba(42,31,24,0.68)');
    sg.addColorStop(1, 'rgba(30,16,8,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 22, 14, 0, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const colors = ['#fde047', '#fb7185', '#c084fc'];
    for (let i = 0; i < 3; i++) {
      const yy = (i - 1) * 5;
      const fl = 0.68 + 0.32 * Math.sin(t * 5 + i * 2 + m.seed);
      ctx.strokeStyle = withAlpha(colors[i], (0.28 + hot * 0.48) * fl);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-14, yy + 1.5);
      ctx.quadraticCurveTo(-3, yy - 2.2, 5, yy + 0.8);
      ctx.quadraticCurveTo(12, yy + 3.4, 17, yy - 0.5);
      ctx.stroke();
      ctx.strokeStyle = withAlpha('#fff5d0', (0.15 + hot * 0.45) * fl);
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }
    ctx.strokeStyle = withAlpha('#fb7185', 0.35 + hot * 0.45);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15 + Math.sin(t * 7 + m.seed), 9, 0, 0.2, 2.8);
    ctx.stroke();
    ctx.restore();
    emissive(ctx, 0, 0, 10 + 3 * Math.sin(t * 7), '#fef08a', 0.3 + hot * 0.3);
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 6 && Math.random() < dt * 5)
      api.particles.push(P({ type: 'spark', x, y, vx: Math.cos(out + rnd(-1, 1)) * rnd(30, 120), vy: -rnd(20, 100), color: pick(['#fde047', '#fb7185']), life: rnd(0.15, 0.35), width: 1.3, grav: 200 }));
    if (m.age < 2.5 && Math.random() < dt * 4)
      api.particles.push(P({ type: 'smoke', x, y, vx: rnd(-10, 10), vy: -rnd(25, 60), size: rnd(14, 26), size2: 3, color: '#6b5f58', life: rnd(0.8, 1.4) }));
  },
};

/* ================================= TRIPOD HEAT-RAY ================================= */

function drawTripod(ctx: Ctx, s: WeaponDrawState) {
  const kick = s.recoil * s.recoil;
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 3.4);
  const charge = clamp(s.cycle, 0, 1);
  const flex = Math.sin(s.t * 1.8) * 2.2 + kick * 15;
  const lensColor = kick > 0.15 ? '#ff6a5e' : '#b8ef4a';
  ctx.save();
  ctx.translate(-kick * 11, 0);
  ctx.rotate(-kick * 0.035);

  // Articulated rear neck stays compact so the alien emitter reads first.
  ctx.beginPath();
  ctx.moveTo(-132, 14);
  ctx.bezierCurveTo(-104, 30 + flex, -76, 16 - flex, -48, -2);
  ctx.bezierCurveTo(-29, -14, -14, -18, 2, -14);
  ctx.strokeStyle = '#100b07';
  ctx.lineWidth = 23;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = '#7d5727';
  ctx.lineWidth = 17;
  ctx.stroke();
  ctx.strokeStyle = '#d6b878';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const u = 0.12 + i * 0.105;
    const x = -132 + u * 118;
    const y = 14 + Math.sin(u * Math.PI) * 12 + flex * (1 - u);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.42 + u * 0.3);
    ctx.fillStyle = '#191108';
    roundRect(ctx, -4.4, -11, 10, 22, 4);
    ctx.fill();
    const vg = ctx.createLinearGradient(0, -11, 0, 11);
    vg.addColorStop(0, '#f2d49a');
    vg.addColorStop(0.42, '#9c7136');
    vg.addColorStop(1, '#2a1a0a');
    ctx.fillStyle = vg;
    roundRect(ctx, -3.1, -9, 7.5, 18, 3.5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.68)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
  }

  // Shoulder socket and gimbal.
  const socket = ctx.createRadialGradient(-10, -1, 0, -4, 0, 23);
  socket.addColorStop(0, '#f2d49a');
  socket.addColorStop(0.45, '#7f5929');
  socket.addColorStop(1, '#1a1007');
  ctx.fillStyle = socket;
  ctx.beginPath();
  ctx.ellipse(-6, -2, 22, 18, -0.25, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#11151a';
  ctx.beginPath();
  ctx.arc(7, -3, 12, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#c1a36d';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#69717b';
  ctx.beginPath();
  ctx.arc(7, -3, 5, 0, TAU);
  ctx.fill();

  // The eye-head kicks back on discharge while the three legs brace outward.
  ctx.save();
  ctx.translate(7, -3);
  ctx.rotate(-kick * 0.19 + Math.sin(s.t * 1.5) * 0.008);
  ctx.translate(-7, 3);

  // Broad armoured heat-ray head with a crown, layered plates and front optic.
  const head = () => {
    ctx.beginPath();
    ctx.moveTo(-5, -22);
    ctx.quadraticCurveTo(8, -39, 42, -36);
    ctx.lineTo(91, -29);
    ctx.quadraticCurveTo(110, -25, 118, -10);
    ctx.lineTo(118, 8);
    ctx.quadraticCurveTo(107, 25, 89, 29);
    ctx.lineTo(42, 35);
    ctx.quadraticCurveTo(8, 34, -5, 17);
    ctx.closePath();
  };
  shape(ctx, head, -39, 36, T.bronze, { brush: true, hi: 0.54, lw: 1.5 });
  polyShape(ctx, [[11, -32], [72, -33], [102, -22], [39, -19]], T.steel, { lw: 0.9 });
  polyShape(ctx, [[11, 29], [72, 33], [101, 22], [40, 18]], T.black, { lw: 0.9 });
  for (let i = 0; i < 4; i++) {
    const x = 18 + i * 18;
    ctx.strokeStyle = i % 2 ? 'rgba(20,13,7,0.75)' : 'rgba(250,220,160,0.55)';
    ctx.lineWidth = i % 2 ? 4 : 1.4;
    ctx.beginPath();
    ctx.moveTo(x, -28 + i * 0.7);
    ctx.quadraticCurveTo(x + 6, 0, x, 26 - i * 0.7);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(17,12,8,0.74)';
  ctx.lineWidth = 2.3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(30 + i * 11, -29 - i * 0.4);
    ctx.lineTo(32 + i * 11, -21 - i * 0.2);
    ctx.stroke();
  }
  for (const [sx, sy] of [[14, -25], [51, -25], [77, 23], [20, 22]] as number[][]) screw(ctx, sx, sy, 2.2);

  // Three jointed walker legs. Their small idle flex is visible without clutter.
  const legs: [number, number, number, number, number][] = [
    [18, -22, -34, -55, -46],
    [40, 27, 47, 52, 67],
    [77, 24, 96, 48, 118],
  ];
  for (let i = 0; i < legs.length; i++) {
    const [ax, ay, kx, ky, fx] = legs[i];
    const fy = i === 0 ? -61 + flex : 53 + flex * 0.4;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(kx, ky);
    ctx.lineTo(fx, fy);
    ctx.strokeStyle = '#100d09';
    ctx.lineWidth = 9.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#9b7440';
    ctx.lineWidth = 5.8;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,225,162,0.7)';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    for (const [jx, jy] of [[kx, ky], [fx, fy]] as number[][]) {
      const jg = ctx.createRadialGradient(jx - 1, jy - 1, 0, jx, jy, 7);
      jg.addColorStop(0, '#f0d59a');
      jg.addColorStop(0.55, '#8c6735');
      jg.addColorStop(1, '#21170c');
      ctx.fillStyle = jg;
      ctx.beginPath();
      ctx.arc(jx, jy, 6.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.74)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.fillStyle = '#17120c';
    ctx.beginPath();
    ctx.ellipse(fx + (i === 0 ? -1 : 4), fy + (i === 0 ? -2 : 3), 11, 4.5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#b49358';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // Oversized glass eye with a rotating three-blade iris.
  const lx = 116,
    ly = -5;
  const bezel = ctx.createRadialGradient(lx - 4, ly - 5, 0, lx, ly, 27);
  bezel.addColorStop(0, '#f0d39a');
  bezel.addColorStop(0.42, '#71552e');
  bezel.addColorStop(0.72, '#22262a');
  bezel.addColorStop(1, '#080a0c');
  ctx.fillStyle = bezel;
  ctx.beginPath();
  ctx.arc(lx, ly, 26, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.82)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(lx, ly, 19, 0, TAU);
  const lens = ctx.createRadialGradient(lx - 5, ly - 7, 1, lx, ly, 20);
  lens.addColorStop(0, '#fff6db');
  lens.addColorStop(0.18, kick > 0.1 ? '#ffb7a3' : '#dfff8a');
  lens.addColorStop(0.58, kick > 0.1 ? '#e34a39' : '#719a1f');
  lens.addColorStop(1, '#11170b');
  ctx.fillStyle = lens;
  ctx.fill();
  ctx.strokeStyle = '#080b0d';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(s.t * 0.8);
  ctx.strokeStyle = 'rgba(18,24,10,0.82)';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
    ctx.lineTo(Math.cos(a + 0.26) * 16, Math.sin(a + 0.26) * 16);
    ctx.stroke();
  }
  ctx.restore();
  emissive(ctx, lx + 2, ly, 23 + pulse * 7 + charge * 12 + kick * 24, lensColor, 0.4 + charge * 0.35 + kick * 0.45);

  // Ruby ranging diode at the muzzle.
  for (let i = 0; i < 3; i++) {
    const yy = -15 + i * 10;
    ctx.fillStyle = '#17080a';
    ctx.beginPath();
    ctx.arc(148, yy, 3.2, 0, TAU);
    ctx.fill();
    emissive(ctx, 148, yy, 7, i === 1 ? '#ff4a41' : '#a3e635', 0.55 + pulse * 0.25);
  }
  ctx.restore();
  ctx.restore();
}

function drawTripodIcon(ctx: Ctx, s: WeaponDrawState) {
  ctx.save();
  ctx.scale(0.9, 0.82);
  drawTripod(ctx, { ...s, recoil: 0, cycle: 1 });
  ctx.restore();
}


export const tripod: Weapon = {
  id: 'tripod',
  name: 'Martian Heat-Ray',
  tag: 'WAR OF THE WORLDS · TRIPOD',
  accent: '#ff4d4d',
  accent2: '#a3e635',
  mode: 'beam',
  cooldown: 1.15,
  recoilAmt: 14,
  muzzle: [151, -5],
  markSize: 36,
  draw: drawTripod,
  drawIcon: drawTripodIcon,
  fire(api, x, y, a) {
    audio.play('tripod');
    const hs = api.hitscan(x, y, a);
    api.flash('#ff8a7a', 0.44);
    api.shake(24);
    api.hitstop(0.05);
    energyMuzzle(api, x, y, a, '#ff5a5a', '#ffffff', 92);
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 190, width: 10, color: '#a3e635', life: 0.24 }));
    api.particles.push(P({ type: 'flare', x, y, rot: 0, size: 210, size2: 7, width: 4.2, color: '#ffb4b4', life: 0.2 }));
    api.beams.push(
      makeBeam({
        weapon: tripod,
        x,
        y,
        angle: a,
        len: hs.hit ? hs.dist : 1400,
        duration: 1.0,
        hit: hs.hit,
        hitX: hs.x,
        hitY: hs.y,
        tick(bm, _dt, g) {
          const k = 1 - bm.age / bm.duration;
          if (Math.random() < 0.9)
            g.particles.push(
              P({ type: 'ring', x: bm.x + Math.cos(bm.angle) * 30, y: bm.y + Math.sin(bm.angle) * 30, size: 48, size2: 14, color: '#ff8a7a', width: 2, life: 0.35 })
            );
          if (bm.hit) {
            for (let i = 0; i < 4 * k; i++) {
              const ang = rnd(TAU);
              g.particles.push(
                P({ type: 'ember', x: bm.hitX, y: bm.hitY, vx: Math.cos(ang) * rnd(80, 440), vy: Math.sin(ang) * rnd(80, 440) - 90, size: rnd(1.4, 3.2), color: '#fecaca', color2: '#dc2626', life: rnd(0.4, 1.1), grav: 240 })
              );
            }
            if (Math.random() < 0.6 * k)
              g.particles.push(
                P({ type: 'ash', x: bm.hitX + rnd(-16, 16), y: bm.hitY + rnd(-10, 10), vx: rnd(-40, 40), vy: -rnd(60, 190), size: rnd(1.6, 3.6), rot: rnd(TAU), spin: rnd(-6, 6), color: pick(['#3d3a38', '#57534e', '#78716c']), life: rnd(0.9, 1.8), grav: 40, drag: 0.98 })
              );
          }
        },
        draw(ctx, bm, t) {
          const k = clamp(Math.min(bm.age * 10, 1) * (1 - Math.pow(bm.age / bm.duration, 2.2)), 0, 1);
          const x1 = bm.x + Math.cos(bm.angle) * bm.len;
          const y1 = bm.y + Math.sin(bm.angle) * bm.len;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineCap = 'round';
          const wob = 1 + Math.sin(t * 34) * 0.07;
          const line = (w: number, col: string) => {
            ctx.strokeStyle = col;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(bm.x, bm.y);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          };
          line(54 * k * wob, `rgba(220,38,38,${0.15 * k})`);
          line(28 * k * wob, `rgba(248,113,113,${0.5 * k})`);
          line(12 * k, `rgba(254,226,226,${0.92 * k})`);
          line(4 * k, `rgba(255,255,255,${0.98 * k})`);
          // green-white fringe flicker
          ctx.setLineDash([26, 40]);
          ctx.lineDashOffset = -t * 900;
          line(8 * k, `rgba(190,255,120,${0.55 * k})`);
          ctx.setLineDash([]);
          // heat-haze pressure rings racing down the ray
          for (let i = 0; i < 8; i++) {
            const tt = (t * 1.7 + i / 8) % 1;
            const px = bm.x + (x1 - bm.x) * tt,
              py = bm.y + (y1 - bm.y) * tt;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(bm.angle);
            ctx.strokeStyle = `rgba(255,170,150,${0.4 * k * (1 - tt)})`;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 30 * k * (0.6 + tt * 0.7), 0, 0, TAU);
            ctx.stroke();
            ctx.restore();
          }
          emissive(ctx, bm.x, bm.y, 40 * k + 10, '#ff9a8a', 0.9 * k);
          if (bm.hit) emissive(ctx, x1, y1, 70 * k + 14, '#ffffff', 0.9 * k);
          ctx.restore();
        },
      })
    );
    if (hs.hit) api.registerHit(hs.x, hs.y, tripod);
  },
  onImpact(api, x, y, a) {
    audio.play('hitBoom');
    impactFlash(api, x, y, 172, '#ffffff', '#ef4444', 0.25);
    api.flash('#ff6b6b', 0.34);
    shockRing(api, x, y, 148, '#fca5a5', 4.4, 0.44);
    shockRing(api, x, y, 88, '#ffffff', 3.4, 0.32);
    // vaporised matter: ash flakes lift off, fireball, black smoke
    for (let i = 0; i < 46; i++) {
      const an = rnd(TAU);
      api.particles.push(
        P({
          type: 'ash',
          x: x + Math.cos(an) * rnd(0, 20),
          y: y + Math.sin(an) * rnd(0, 20),
          vx: Math.cos(an) * rnd(30, 260),
          vy: Math.sin(an) * rnd(30, 260) - rnd(60, 220),
          size: rnd(1.8, 4.2),
          rot: rnd(TAU),
          spin: rnd(-8, 8),
          color: pick(['#2a2725', '#44403c', '#78716c', '#a8a29e']),
          life: rnd(1, 2.2),
          grav: 70,
          drag: 0.97,
        })
      );
    }
    for (let i = 0; i < 20; i++) {
      const an = a + Math.PI + rnd(-1.6, 1.6);
      api.particles.push(
        P({ type: 'fire', x, y, vx: Math.cos(an) * rnd(60, 380), vy: Math.sin(an) * rnd(60, 380) - 100, size: rnd(24, 50), size2: 5, color: '#f87171', color2: '#7f1d1d', life: rnd(0.3, 0.7), drag: 0.9 })
      );
    }
    embers(api, x, y, 26, '#fecaca', '#dc2626', 1.1, 120);
    for (let i = 0; i < 6; i++)
      api.particles.push(P({ type: 'smoke', x, y, vx: rnd(-70, 70), vy: -rnd(90, 200), size: rnd(50, 100), size2: 10, color: '#262220', life: rnd(1.2, 2.2) }));
    radialStreaks(api, x, y, 16, '#fecaca', 90, 280);
    splinters(api, x, y, a, 10, 1);
    api.shake(25);
    api.hitstop(0.085);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.22);
    // fused thermal scar with three parallel heat-ray grooves
    const g = ctx.createRadialGradient(-2, 0, 1, 0, 0, 24);
    g.addColorStop(0, '#050404');
    g.addColorStop(0.55, '#19120d');
    g.addColorStop(0.82, 'rgba(80,45,26,0.55)');
    g.addColorStop(1, 'rgba(50,28,10,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 23, 15, -0.06, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const yy = (i - 1) * 5.5;
      const fl = 0.7 + 0.3 * Math.sin(t * 4 + i * 1.8 + m.seed);
      ctx.strokeStyle = withAlpha(i === 1 ? '#ffe8ba' : '#ef5946', (0.28 + 0.42 * hot) * fl);
      ctx.lineWidth = i === 1 ? 2 : 1.5;
      ctx.beginPath();
      ctx.moveTo(-17, yy + 1);
      ctx.quadraticCurveTo(-4, yy - 2, 4, yy + 1);
      ctx.lineTo(17, yy - 0.5);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(255,210,158,${0.24 + 0.3 * hot})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 12, -0.06, 3.6, 5.8);
    ctx.stroke();
    ctx.restore();
    heatGlow(ctx, 17, '#ef4444', hot * 0.28);
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 8 && Math.random() < dt * 6)
      api.particles.push(P({ type: 'smoke', x, y, vx: rnd(-12, 12), vy: -rnd(30, 70), size: rnd(18, 34), size2: 4, color: '#2a2522', life: rnd(1, 1.8) }));
    if (m.age < 6 && Math.random() < dt * 5)
      api.particles.push(
        P({ type: 'ash', x, y, vx: Math.cos(out) * 10 + rnd(-14, 14), vy: -rnd(30, 90), size: rnd(1.4, 3), rot: rnd(TAU), spin: rnd(-4, 4), color: pick(['#44403c', '#78716c']), life: rnd(1, 1.8), drag: 0.98 })
      );
  },
};

