import { P, TAU, audio, clamp, rnd, withAlpha } from '../core';
import { T, emissive, glowRect, polyShape, rect, roundRect, screw, vents } from '../art';
import {
  dust,
  energyMuzzle,
  heatGlow,
  impactFlash,
  makeBeam,
  makeBullet,
  radialStreaks,
  shockRing,
  sparkFan,
  splinters,
  trailPath,
} from '../fx';
import type { Weapon, WeaponDrawState } from '../types';

type Ctx = CanvasRenderingContext2D;

/** Yautja shoulder weapon: a low shoulder saddle, articulated gimbal and three-prong plasma cannon. */
function drawYautja(ctx: Ctx, s: WeaponDrawState) {
  const recoil = s.recoil * s.recoil;
  const cycle = clamp(s.cycle, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 4.4);
  const charge = clamp(0.16 + cycle * 0.62 + recoil * 0.7, 0, 1);
  const deploy = 1 - clamp(cycle / 0.4, 0, 1);
  ctx.save();
  ctx.translate(-recoil * 13, recoil * 1.2);
  ctx.rotate(-recoil * 0.025);

  // Shoulder saddle / bio-mechanical mounting plate.
  polyShape(ctx, [[-122, -25], [-108, -39], [-66, -40], [-38, -24], [-32, 18], [-58, 37], [-108, 32], [-126, 12]], T.alien, { brush: true, hi: 0.4, lw: 1.5 });
  polyShape(ctx, [[-116, -17], [-96, -30], [-67, -28], [-59, -8], [-70, 18], [-105, 23], [-118, 11]], T.bronze, { lw: 1.1 });
  // etched Yautja runes
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = withAlpha('#a3e635', 0.48 + pulse * 0.35);
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-102, -16); ctx.lineTo(-91, -5); ctx.lineTo(-102, 7);
  ctx.moveTo(-84, -17); ctx.lineTo(-75, -5); ctx.lineTo(-84, 8);
  ctx.stroke();
  ctx.restore();
  for (const [x, y] of [[-116, -12], [-110, 17], [-67, -20], [-64, 19]] as number[][]) screw(ctx, x, y, 2.4);

  // Twin suspension arms and a rotating, four-tooth shoulder gimbal.
  rect(ctx, -46, -22, 42, 10, 4, T.black, { brush: true });
  rect(ctx, -46, 12, 42, 10, 4, T.black, { brush: true });
  ctx.strokeStyle = '#8c6b39';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-39, -16); ctx.lineTo(-7, -16);
  ctx.moveTo(-39, 17); ctx.lineTo(-7, 17);
  ctx.stroke();
  const joint = ctx.createRadialGradient(-3, -2, 0, 0, 0, 19);
  joint.addColorStop(0, '#f1d8a7');
  joint.addColorStop(0.36, '#a0804f');
  joint.addColorStop(0.72, '#30353a');
  joint.addColorStop(1, '#090b0e');
  ctx.fillStyle = joint;
  ctx.beginPath();
  ctx.arc(1, 0, 17, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#d7b66a';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = s.t * 0.65 + (i / 4) * TAU;
    ctx.beginPath();
    ctx.arc(1 + Math.cos(a) * 12, Math.sin(a) * 12, 2, 0, TAU);
    ctx.fillStyle = '#101318';
    ctx.fill();
    ctx.stroke();
  }

  // The cannon pivots independently of its shoulder saddle on every discharge.
  ctx.save();
  ctx.translate(1, 0);
  ctx.rotate(-recoil * 0.105 + Math.sin(s.t * 1.4) * 0.01);
  ctx.translate(-1, 0);

  // Cannon shell with raised dorsal armour and open vent slots.
  polyShape(ctx, [[-10, -25], [27, -34], [99, -29], [130, -17], [138, -6], [138, 7], [128, 18], [96, 28], [27, 32], [-10, 23]], T.alien, { brush: true, hi: 0.52, lw: 1.6 });
  polyShape(ctx, [[8, -28], [38, -41], [84, -37], [111, -25], [61, -22]], T.bronze, { lw: 1.1 });
  polyShape(ctx, [[8, 25], [40, 36], [84, 33], [111, 22], [59, 19]], T.black, { lw: 1 });
  // dorsal silver ridge
  polyShape(ctx, [[25, -33], [52, -43], [76, -39], [92, -31], [58, -28]], T.steel, { lw: 1 });
  // charge cells move from rear to the muzzle
  for (let i = 0; i < 5; i++) {
    const x = 18 + i * 17;
    const lit = clamp(charge * 5.5 - i, 0, 1) * (0.76 + pulse * 0.24);
    roundRect(ctx, x, -12, 10, 24, 4);
    ctx.fillStyle = '#10150d';
    ctx.fill();
    ctx.strokeStyle = '#806335';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    glowRect(ctx, x + 3, -8, 4, 16, 2, '#a3e635', lit);
  }
  // thermal exhaust and charging vents
  vents(ctx, 22, -27, 57, 5, 8, '#10140e');
  for (let i = 0; i < 4; i++) {
    const x = 29 + i * 15;
    ctx.strokeStyle = `rgba(195,222,139,${0.14 + charge * 0.22})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, -25); ctx.lineTo(x + 2, -31);
    ctx.stroke();
  }
  screw(ctx, 20, 21, 2.2);
  screw(ctx, 102, 19, 2.2);

  // Three deployable emitter claws open when the weapon fires.
  const jaw = 0.12 + deploy * 0.48;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(118, side * 12);
    ctx.rotate(side * jaw);
    polyShape(ctx, [[-3, -5.5], [30, -5], [51, 0], [30, 5], [-3, 5.5]], T.bronze, { lw: 1 });
    ctx.strokeStyle = 'rgba(218,236,161,0.75)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(2, 0); ctx.lineTo(38, 0);
    ctx.stroke();
    ctx.restore();
  }
  // third centre tooth
  polyShape(ctx, [[123, -4], [158, -2], [169, 0], [158, 2], [123, 4]], T.steel, { lw: 0.9 });
  ctx.beginPath();
  ctx.arc(135, 0, 17, 0, TAU);
  ctx.fillStyle = '#080d11';
  ctx.fill();
  ctx.strokeStyle = '#bdc99a';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(135, 0, 10.5, 0, TAU);
  ctx.fillStyle = '#192514';
  ctx.fill();
  emissive(ctx, 135, 0, 19 + charge * 12 + recoil * 20, '#c7f36a', 0.7 + charge * 0.2);
  // moving internal focusing iris
  ctx.save();
  ctx.translate(135, 0);
  ctx.rotate(s.t * 1.25);
  ctx.strokeStyle = 'rgba(234,255,188,0.88)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
    ctx.lineTo(Math.cos(a + 0.42) * 9, Math.sin(a + 0.42) * 9);
    ctx.stroke();
  }
  ctx.restore();

  // Tri-laser range finder: three independently pulsing ruby lenses.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const y = -17 + i * 17;
    const flash = 0.5 + 0.5 * Math.sin(s.t * 8 + i * 1.9);
    ctx.fillStyle = '#16090b';
    ctx.beginPath();
    ctx.arc(94, y, 4.6, 0, TAU);
    ctx.fill();
    emissive(ctx, 94, y, 8, '#ff4038', 0.38 + flash * 0.5);
    ctx.strokeStyle = `rgba(255,60,52,${0.18 + flash * 0.18 + deploy * 0.35})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(98, y);
    ctx.lineTo(135, 0);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();

  // Hard recoil lifts the whole head and vents a single bright plasma flash.
  ctx.restore();
}

function drawYautjaIcon(ctx: Ctx, s: WeaponDrawState) {
  ctx.save();
  ctx.scale(0.88, 0.88);
  drawYautja(ctx, { ...s, recoil: 0, cycle: 1 });
  ctx.restore();
}

export const yautjaCaster: Weapon = {
  id: 'yautjaCaster',
  name: 'Yautja Shoulder Caster',
  tag: 'TRI-LASER · PLASMA BOLT',
  accent: '#a3e635',
  accent2: '#e8ffb2',
  mode: 'projectile',
  cooldown: 0.74,
  recoilAmt: 9,
  muzzle: [169, 0],
  markSize: 34,
  note: 'Kanon pundak Yautja: tiga laser merah mengunci titik sasaran sebelum satu bolt plasma hijau ditembakkan.',
  hint: 'Arahkan tri-laser merah dan klik untuk menembakkan bolt plasma Yautja',
  draw: drawYautja,
  drawIcon: drawYautjaIcon,
  fire(api, x, y, a) {
    audio.play('yautja');
    const hs = api.hitscan(x, y, a);
    const len = hs.hit ? hs.dist : 440;
    energyMuzzle(api, x, y, a, '#c7f36a', '#f6ffd8', 64);
    api.flash('#e4ffae', 0.24);
    api.shake(10);
    api.hitstop(0.025);
    api.particles.push(P({ type: 'streak', x, y, rot: a + Math.PI / 2, size: 138, width: 5.5, color: '#dfff8a', life: 0.16 }));
    shockRing(api, x, y, 72, '#d9ff8b', 2.8, 0.22);

    // Three rangefinders converge on one point, then wink out before the plasma bolt arrives.
    api.beams.push(
      makeBeam({
        weapon: yautjaCaster,
        x,
        y,
        angle: a,
        len,
        duration: 0.19,
        hit: false,
        draw(ctx, bm) {
          const k = Math.max(0, 1 - bm.age / bm.duration);
          const ca = Math.cos(bm.angle),
            sa = Math.sin(bm.angle);
          const nx = -sa,
            ny = ca;
          const x1 = bm.x + ca * bm.len,
            y1 = bm.y + sa * bm.len;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.lineCap = 'round';
          for (const off of [-9, 0, 9]) {
            ctx.strokeStyle = `rgba(255,57,48,${0.2 + k * 0.7})`;
            ctx.lineWidth = 4.4;
            ctx.beginPath();
            ctx.moveTo(bm.x + nx * off, bm.y + ny * off);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            ctx.strokeStyle = `rgba(255,224,201,${0.35 + k * 0.6})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
          if (bm.len < 700) {
            ctx.fillStyle = `rgba(255,65,55,${0.55 + k * 0.4})`;
            ctx.beginPath();
            ctx.arc(x1, y1, 2.8 + k * 1.2, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,220,200,${k * 0.75})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x1, y1, 8 + (1 - k) * 8, 0, TAU);
            ctx.stroke();
          }
          ctx.restore();
        },
      })
    );
    if (hs.hit) {
      api.particles.push(P({ type: 'star', x: hs.x, y: hs.y, size: 18, color: '#ff564c', life: 0.14, width: 1.4 }));
      api.particles.push(P({ type: 'ring', x: hs.x, y: hs.y, size: 32, size2: 8, color: '#ff564c', width: 1.4, life: 0.16 }));
    }

    // tiny radiator vents cough out hot dust after the firing pulse
    api.after(0.06, () => {
      const v = api.toWorld(74, -34);
      for (let i = 0; i < 5; i++)
        api.particles.push(
          P({
            type: 'smoke',
            x: v.x + rnd(-12, 12),
            y: v.y,
            vx: rnd(-24, 24),
            vy: -rnd(35, 90),
            size: rnd(17, 31),
            size2: 4,
            color: '#87907b',
            life: rnd(0.55, 1.1),
          })
        );
    });

    api.bullets.push(
      makeBullet({
        x,
        y,
        a,
        speed: 1380,
        weapon: yautjaCaster,
        kind: 'yautjaPlasma',
        size: 16,
        trailMax: 15,
        update(b, _dt, g) {
          if (Math.random() < 0.8)
            g.particles.push(
              P({
                type: 'glow',
                x: b.x - Math.cos(b.angle) * rnd(5, 15) + rnd(-3, 3),
                y: b.y - Math.sin(b.angle) * rnd(5, 15) + rnd(-3, 3),
                size: rnd(12, 21),
                size2: 1.5,
                color: '#c7f36a',
                color2: '#526f15',
                life: rnd(0.18, 0.34),
              })
            );
          if (Math.random() < 0.36)
            g.particles.push(
              P({
                type: 'spark',
                x: b.x,
                y: b.y,
                vx: rnd(-80, 80),
                vy: rnd(-80, 80),
                color: '#edffbf',
                life: rnd(0.12, 0.26),
                width: 1.2,
                grav: 70,
              })
            );
        },
        draw(ctx, b, t) {
          trailPath(ctx, b, '#a3e635', 6.5, 0.74);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          ctx.globalCompositeOperation = 'lighter';
          // green plasma sheath, a bright white-hot spear and three orbiting rings
          const pulse = 1 + Math.sin(t * 26) * 0.08;
          const sheath = ctx.createRadialGradient(0, 0, 0, 0, 0, 29 * pulse);
          sheath.addColorStop(0, 'rgba(255,255,245,1)');
          sheath.addColorStop(0.2, 'rgba(232,255,184,0.96)');
          sheath.addColorStop(0.53, 'rgba(163,230,53,0.62)');
          sheath.addColorStop(1, 'rgba(82,111,21,0)');
          ctx.fillStyle = sheath;
          ctx.beginPath();
          ctx.ellipse(1, 0, 31 * pulse, 18 * pulse, 0, 0, TAU);
          ctx.fill();
          // pointed plasma tip
          const tip = ctx.createLinearGradient(-26, 0, 18, 0);
          tip.addColorStop(0, 'rgba(163,230,53,0)');
          tip.addColorStop(0.55, '#dcff94');
          tip.addColorStop(1, '#ffffff');
          ctx.fillStyle = tip;
          ctx.beginPath();
          ctx.moveTo(20, 0);
          ctx.lineTo(-9, -6.5);
          ctx.lineTo(-25, -4);
          ctx.lineTo(-25, 4);
          ctx.lineTo(-9, 6.5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(240,255,205,0.8)';
          ctx.lineWidth = 1;
          ctx.stroke();
          // rotating containment rings
          for (let i = 0; i < 3; i++) {
            const phase = t * 10 + i * (TAU / 3);
            ctx.strokeStyle = `rgba(209,248,133,${0.62 - i * 0.12})`;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.ellipse(-8 - i * 6, 0, 4.2, 12 + 2 * Math.sin(phase), phase * 0.12, 0, TAU);
            ctx.stroke();
          }
          emissive(ctx, 13, 0, 15, '#f3ffd5', 0.8);
          ctx.restore();
        },
      })
    );
  },
  onImpact(api, x, y, a) {
    audio.play('yautjaHit');
    impactFlash(api, x, y, 104, '#f7ffdc', '#8dbc27', 0.17);
    shockRing(api, x, y, 78, '#c7f36a', 3, 0.29);
    shockRing(api, x, y, 46, '#efffc5', 2, 0.22);
    radialStreaks(api, x, y, 10, '#c7f36a', 34, 120);
    sparkFan(api, x, y, a + Math.PI, 14, { spread: 1.25, colors: ['#f7ffdc', '#c7f36a', '#fff2bd'], max: 620, grav: 420, width: 1.6 });
    splinters(api, x, y, a, 7, 0.75);
    dust(api, x, y, a, 3, 0.7, '#a59c7c');
    for (let i = 0; i < 8; i++) {
      const an = a + Math.PI + rnd(-1.3, 1.3);
      api.particles.push(
        P({
          type: 'ember',
          x,
          y,
          vx: Math.cos(an) * rnd(70, 250),
          vy: Math.sin(an) * rnd(70, 250) - 30,
          size: rnd(1.5, 2.8),
          color: '#dfff8a',
          color2: '#536b1a',
          life: rnd(0.45, 0.95),
          grav: 250,
          drag: 0.96,
        })
      );
    }
    api.shake(12);
    api.hitstop(0.055);
  },
  drawMark(ctx, m, t) {
    const hot = Math.max(0, 1 - m.age * 0.52);
    // a Yautja plasma sigil: contained oval, three parallel cuts and tiny ranging dots
    const scorch = ctx.createRadialGradient(-2, 0, 1, 0, 0, 19);
    scorch.addColorStop(0, 'rgba(8,12,5,0.94)');
    scorch.addColorStop(0.56, 'rgba(31,42,15,0.84)');
    scorch.addColorStop(0.86, 'rgba(97,125,35,0.36)');
    scorch.addColorStop(1, 'rgba(97,125,35,0)');
    ctx.fillStyle = scorch;
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 12, -0.2, 0, TAU);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.strokeStyle = withAlpha('#a3e635', 0.26 + hot * 0.55);
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * 5;
      ctx.beginPath();
      ctx.moveTo(-12, y + 1);
      ctx.lineTo(-4, y - 1);
      ctx.lineTo(5, y + 1.2);
      ctx.lineTo(12, y - 0.3);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(238,255,200,${0.18 + hot * 0.42})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 9, -0.2, 3.4, 5.9);
    ctx.stroke();
    // three small targeting pips at one edge
    for (let i = 0; i < 3; i++) {
      const fl = 0.45 + 0.55 * Math.sin(t * 8 + i * 1.8 + m.seed);
      ctx.fillStyle = withAlpha(i === 1 ? '#ff594e' : '#d9ff8b', (0.25 + hot * 0.55) * fl);
      ctx.beginPath();
      ctx.arc(-13 + i * 3.3, -6, 1.1, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    heatGlow(ctx, 12, '#a3e635', hot * 0.32);
  },
  ambient(api, x, y, _out, m, dt) {
    if (m.age < 2.2 && Math.random() < dt * 3)
      api.particles.push(P({ type: 'ember', x: x + rnd(-6, 6), y: y + rnd(-5, 5), vx: rnd(-10, 10), vy: -rnd(20, 50), size: rnd(1.2, 2.1), color: '#dfff8a', color2: '#708b21', life: rnd(0.4, 0.8), grav: 100 }));
  },
};
