import { P, TAU, audio, clamp, lerp, rnd, smooth, withAlpha } from '../core';
import { crackStar, dust, holeMark, impactFlash, makeBullet, shockRing, sparkFan, splinters } from '../fx';
import type { Weapon, WeaponDrawState } from '../types';

type Ctx = CanvasRenderingContext2D;

/** Helper for rounded rectangles */
function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Radial core glow */
function coreGlow(ctx: Ctx, x: number, y: number, r: number, color: string, inner = '#ffffff', a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(0.35, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** Sleek arrow drawing: nock at (x, y), tip at x + len */
function drawSleekArrow(ctx: Ctx, x: number, y: number, len: number, glow = 0, t = 0) {
  ctx.save();
  // Wood shaft
  const sg = ctx.createLinearGradient(0, y - 2, 0, y + 2);
  sg.addColorStop(0, '#f0cf9a');
  sg.addColorStop(0.5, '#b98a4c');
  sg.addColorStop(1, '#6d4720');
  ctx.fillStyle = sg;
  ctx.fillRect(x + 4, y - 1.5, len - 18, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(x + 4, y - 1.5, len - 18, 0.8);

  // Steel broadhead
  const tipX = x + len;
  if (glow > 0.05) {
    ctx.save();
    ctx.shadowColor = '#ffd27a';
    ctx.shadowBlur = 12 + Math.sin(t * 18) * 4;
  }
  ctx.beginPath();
  ctx.moveTo(tipX, y);
  ctx.lineTo(tipX - 16, y - 6);
  ctx.lineTo(tipX - 12, y);
  ctx.lineTo(tipX - 16, y + 6);
  ctx.closePath();
  const hg = ctx.createLinearGradient(tipX - 16, y - 6, tipX, y + 6);
  hg.addColorStop(0, '#ffffff');
  hg.addColorStop(0.45, '#c3cdd7');
  hg.addColorStop(1, '#2c333a');
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  if (glow > 0.05) ctx.restore();

  // Cresting & nock
  ctx.fillStyle = '#111315';
  ctx.fillRect(x, y - 2, 4, 4);
  for (const [cx, col] of [[x + 24, '#f97316'], [x + 28, '#f8fafc'], [x + 32, '#f97316']] as [number, string][]) {
    ctx.fillStyle = col;
    ctx.fillRect(cx, y - 1.8, 2, 3.6);
  }

  // Fletching vanes (two aerodynamic vanes)
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 25, y);
    ctx.lineTo(x + 18, y + s * 7.5);
    ctx.lineTo(x - 2, y + s * 8);
    ctx.closePath();
    const vg = ctx.createLinearGradient(0, y, 0, y + s * 8);
    if (s < 0) {
      vg.addColorStop(0, '#ef4444');
      vg.addColorStop(1, '#991b1b');
    } else {
      vg.addColorStop(0, '#ffffff');
      vg.addColorStop(1, '#94a3b8');
    }
    ctx.fillStyle = vg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  ctx.restore();
}

/** Draws the recurve bow matching the graceful classic look from Slide 1 */
function drawBow(ctx: Ctx, s: WeaponDrawState) {
  const ch = clamp(s.charge, 0, 1);
  const c = clamp(s.cycle, 0, 1);
  const chPow = Math.pow(ch, 0.75);

  // String physics: vibration on release + full draw tension tremble
  const tremble = ch > 0.85 ? Math.sin(s.t * 50) * (ch - 0.85) * 3.5 : 0;
  const vib = ch < 0.02 && c < 1 ? Math.exp(-c * 7) * Math.sin(c * 96) * 8 * (1 - c) : 0;
  const limbFlex = chPow * 16;
  const limbTipX = -6 - chPow * 22;
  const pull = -18 - chPow * 72 + vib + tremble;
  const idleSway = s.icon ? 0 : Math.sin(s.t * 1.6) * 0.6;

  ctx.save();
  ctx.translate(0, idleSway);
  ctx.lineCap = 'round';

  // Laminated recurve limbs (Slide 1 golden-maple & walnut aesthetic)
  const lg = ctx.createLinearGradient(-14, -100, 26, 100);
  lg.addColorStop(0, '#2b1608');
  lg.addColorStop(0.32, '#b0742f');
  lg.addColorStop(0.62, '#6b3d12');
  lg.addColorStop(1, '#2b1608');

  for (const dir of [-1, 1]) {
    // Outer wood limb
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.bezierCurveTo(26, dir * 42, 10, dir * 82, limbTipX, dir * 98);
    ctx.strokeStyle = '#140a03';
    ctx.lineWidth = 11.5;
    ctx.stroke();

    ctx.strokeStyle = lg;
    ctx.lineWidth = 7.8;
    ctx.stroke();

    // Inner rim light highlight
    ctx.strokeStyle = 'rgba(255,222,158,0.75)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(19, dir * 6);
    ctx.bezierCurveTo(24, dir * 42, 11, dir * 80, limbTipX + 1, dir * 94);
    ctx.stroke();

    // Golden limb collars / reinforcement bands
    for (const k of [0.3, 0.56, 0.82]) {
      const bx = 18 + (limbTipX - 18) * k;
      const by = dir * 98 * k * 1.03;
      ctx.strokeStyle = 'rgba(216,178,116,0.65)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(bx - 3, by - 3.4);
      ctx.lineTo(bx + 3, by + 3.4);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(30,16,6,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 3, by - 3.4);
      ctx.lineTo(bx + 3, by + 3.4);
      ctx.stroke();
    }

    // Glowing golden limb tips
    coreGlow(ctx, limbTipX, dir * 98, 5, 'rgba(255,214,140,0.9)', '#fff4d8', 0.85);
  }

  // Bow string (damped vibration after release, draws back with pull)
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(limbTipX, -98);
  ctx.lineTo(pull, 0);
  ctx.lineTo(limbTipX, 98);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(248,244,232,0.95)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(limbTipX, -98);
  ctx.lineTo(pull, 0);
  ctx.lineTo(limbTipX, 98);
  ctx.stroke();

  // Serving around nocking point
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pull, -6);
  ctx.lineTo(pull, 6);
  ctx.stroke();

  // Carved wooden riser with leather grip wrapping (Slide 1 style)
  const riserGrad = ctx.createLinearGradient(6, -18, 25, 18);
  riserGrad.addColorStop(0, '#5c3517');
  riserGrad.addColorStop(0.5, '#241206');
  riserGrad.addColorStop(1, '#3d2210');
  roundRect(ctx, 6, -18, 19, 36, 6);
  ctx.fillStyle = riserGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Leather cross-stitching
  ctx.save();
  roundRect(ctx, 6, -18, 19, 36, 6);
  ctx.clip();
  for (let i = -18; i < 18; i += 3.2) {
    ctx.strokeStyle = 'rgba(20,8,2,0.5)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(6, i);
    ctx.lineTo(25, i + 3.6);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,214,150,0.18)';
    ctx.beginPath();
    ctx.moveTo(6, i + 1.4);
    ctx.lineTo(25, i + 5);
    ctx.stroke();
  }
  ctx.restore();

  // Grip screws & center jewel
  ctx.fillStyle = '#d4af37';
  ctx.beginPath();
  ctx.arc(12, -12, 1.8, 0, TAU);
  ctx.arc(12, 12, 1.8, 0, TAU);
  ctx.fill();
  coreGlow(ctx, 15, 0, 7, 'rgba(255,206,120,0.45)', 'rgba(255,255,255,0.9)', 0.65);

  // Arrow rest / shelf
  ctx.fillStyle = '#d6b98a';
  ctx.fillRect(17, -2.5, 9, 3.2);

  // Reload animation: arrow slides in from behind and fades onto the string
  const showArrow = c > 0.42 || ch > 0.01;
  const slide = ch > 0.01 ? 0 : (1 - smooth(0.42, 0.66, c)) * 36;
  const aAlpha = ch > 0.01 ? 1 : smooth(0.42, 0.52, c);

  if (showArrow) {
    ctx.save();
    ctx.globalAlpha = aAlpha;
    drawSleekArrow(ctx, pull + slide, 0, 132, ch > 0.85 ? 1 : 0, s.t);
    ctx.restore();
  }

  ctx.restore();
}

/* ======================================================================== */

export const bow: Weapon = {
  id: 'bow',
  name: 'Longbow Recurve',
  tag: 'LAMINATED RECURVE · CHARGE',
  accent: '#ffd27a',
  accent2: '#6ee7b7',
  mode: 'projectile',
  cooldown: 0.28,
  charged: true,
  recoilAmt: 14,
  muzzle: [78, 0],
  markSize: 15,
  draw: drawBow,
  fire(api, x, y, a, charge) {
    const power = lerp(1500, 3400, charge);
    audio.play('bow');
    api.flash('#9af5c8', 0.12 + charge * 0.14);
    api.shake(7 + charge * 9);
    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: power,
        weapon: bow,
        kind: 'arrow',
        size: 8,
        trailMax: 12,
        data: { charge },
        update(b, dt, g) {
          b.data.acc = (b.data.acc ?? 0) + dt;
          if (b.data.acc > 0.028) {
            b.data.acc = 0;
            g.particles.push(
              P({
                type: 'shock',
                x: b.x - Math.cos(b.angle) * 30,
                y: b.y - Math.sin(b.angle) * 30,
                rot: b.angle + Math.PI / 2,
                size: 20 + charge * 10,
                size2: 4,
                color: '#d7fbe8',
                width: 1.4,
                life: 0.2,
              })
            );
            for (const d of [-1, 1]) {
              g.particles.push(
                P({
                  type: 'streak',
                  x: b.x - Math.cos(b.angle) * 45 + Math.cos(b.angle + Math.PI / 2) * d * rnd(6, 14),
                  y: b.y - Math.sin(b.angle) * 45 + Math.sin(b.angle + Math.PI / 2) * d * rnd(6, 14),
                  rot: b.angle,
                  size: rnd(25, 60),
                  width: 1.2,
                  color: '#c8f3dc',
                  life: 0.18,
                })
              );
            }
          }
          if (charge > 0.8 && Math.random() < 0.5) {
            g.particles.push(
              P({
                type: 'ember',
                x: b.x - Math.cos(b.angle) * rnd(0, 36),
                y: b.y - Math.sin(b.angle) * rnd(0, 36),
                vx: rnd(-25, 25),
                vy: rnd(-25, 25),
                size: rnd(1.4, 2.4),
                color: '#d9ffe9',
                color2: '#34d399',
                life: rnd(0.3, 0.6),
              })
            );
          }
        },
        draw(ctx, b, t) {
          // Faint glowing wake
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          const wg = ctx.createLinearGradient(-100, 0, 8, 0);
          wg.addColorStop(0, 'rgba(160,255,210,0)');
          wg.addColorStop(1, `rgba(160,255,210,${0.22 + charge * 0.3})`);
          ctx.fillStyle = wg;
          ctx.fillRect(-100, -2 - charge * 1.5, 108, 4 + charge * 3);
          ctx.restore();

          // Flight arrow (sleek, properly scaled)
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          drawSleekArrow(ctx, -95, 0, 95, charge > 0.8 ? 1 : 0, t);
          ctx.restore();
        },
      })
    );

    // Release snap particles
    for (let i = 0; i < 8; i++) {
      const an = a + rnd(-1, 1);
      api.particles.push(
        P({
          type: 'spark',
          x,
          y,
          vx: Math.cos(an) * rnd(60, 280),
          vy: Math.sin(an) * rnd(60, 280),
          color: '#d7fbe8',
          life: rnd(0.1, 0.25),
          width: 1.2,
        })
      );
    }
    shockRing(api, x, y, 40, '#9af5c8', 2.2, 0.22);
    api.particles.push(P({ type: 'flare', x, y, rot: a, size: 55 + charge * 35, size2: 4, width: 0.6, color: '#bbf7d0', life: 0.1 }));
  },
  onImpact(api, x, y, a) {
    audio.play('hit');
    impactFlash(api, x, y, 44, '#e8fff2', '#34d399', 0.12);
    dust(api, x, y, a, 8, 1.1);
    splinters(api, x, y, a, 14, 1.2);
    sparkFan(api, x, y, a + Math.PI, 12, { spread: 1.1, colors: ['#d7fbe8', '#ffffff', '#ffd27a'], max: 600 });
    for (let i = 0; i < 3; i++) shockRing(api, x, y, 32 + i * 20, '#d7fbe8', 2.2, 0.24 + i * 0.08);
    api.shake(14);
    api.hitstop(0.06);
  },
  drawMark(ctx, m) {
    // Arrow quivering cleanly in the wood - proportional and sleek!
    const wob = Math.exp(-m.age * 4.2) * Math.sin(m.age * 38) * 0.12;
    holeMark(ctx, 4, m.seed, 8);
    crackStar(ctx, m.seed, 4, 8);

    // Subtle drop shadow onto wood
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#000';
    ctx.rotate(wob);
    ctx.fillRect(0, 1.8, 54, 2);
    ctx.restore();

    // Proportional sleek arrow sticking out from the wheel rim
    ctx.save();
    ctx.rotate(wob);
    ctx.scale(0.68, 0.68);
    drawSleekArrow(ctx, -8, 0, 78, 0, 0);
    ctx.restore();
  },
};
