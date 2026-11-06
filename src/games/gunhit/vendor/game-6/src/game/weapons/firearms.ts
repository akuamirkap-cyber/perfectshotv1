import { P, TAU, audio, clamp, lerp, lightning, rnd, smooth, withAlpha } from '../core';
import {
  T,
  bez,
  cyl,
  checker,
  emissive,
  glowRect,
  poly,
  polyShape,
  rect,
  ribs,
  roundRect,
  screw,
  shape,
  spec,
  vents,
  woodShape,
} from '../art';
import { bulletImpact, drawEmbedded, heatGlow, holeMark, makeBullet, muzzleFlash, shellEject, trailPath } from '../fx';
import type { Weapon, WeaponDrawState } from '../types';

type Ctx = CanvasRenderingContext2D;

/* ============================ bullet weapon factory ============================ */

interface BulletCfg {
  id: string;
  name: string;
  tag: string;
  accent: string;
  accent2: string;
  cooldown: number;
  recoilAmt: number;
  muzzle: [number, number];
  eject: [number, number];
  ejectDelay?: number;
  markSize: number;
  speed: number;
  bulletLen: number;
  bulletR: number;
  tracer: string;
  flash: { kind: 'ak' | 'brake' | 'smg' | 'pistol'; size: number };
  sound: string;
  power: number;
  casing: number;
  draw: (ctx: Ctx, s: WeaponDrawState) => void;
}

const bulletGradCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>();

function cachedBulletGrad(
  ctx: CanvasRenderingContext2D,
  key: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  build: (g: CanvasGradient) => void,
): CanvasGradient {
  let map = bulletGradCache.get(ctx);
  if (!map) {
    map = new Map();
    bulletGradCache.set(ctx, map);
  }
  let g = map.get(key);
  if (!g) {
    g = ctx.createLinearGradient(x0, y0, x1, y1);
    build(g);
    if (map.size > 128) map.clear();
    map.set(key, g);
  }
  return g;
}

function bulletWeapon(cfg: BulletCfg): Weapon {
  const w: Weapon = {
    id: cfg.id,
    name: cfg.name,
    tag: cfg.tag,
    accent: cfg.accent,
    accent2: cfg.accent2,
    mode: 'projectile',
    cooldown: cfg.cooldown,
    recoilAmt: cfg.recoilAmt,
    muzzle: cfg.muzzle,
    eject: cfg.eject,
    markSize: cfg.markSize,
    draw: cfg.draw,
    fire(api, x, y, a) {
      audio.play(cfg.sound);
      muzzleFlash(api, x, y, a, cfg.flash);
      api.flash(cfg.accent, 0.1);
      api.after(cfg.ejectDelay ?? 0.02, () => {
        const e = api.toWorld(cfg.eject[0], cfg.eject[1]);
        shellEject(api, e.x, e.y, { size: cfg.casing, power: cfg.power > 1 ? 1.1 : 0.9 });
      });
      api.bullets.push(
        makeBullet({
          x,
          y,
          a,
          speed: cfg.speed,
          weapon: w,
          kind: 'slug',
          size: cfg.bulletR,
          trailMax: 9,
          update(b, dt, g) {
            b.data.acc = (b.data.acc ?? 0) + dt;
            if (b.data.acc > 0.018) {
              b.data.acc = 0;
              if (g.particles.length < 105) {
                g.particles.push(
                  P({
                    type: 'smoke',
                    x: b.x,
                    y: b.y,
                    vx: rnd(-10, 10),
                    vy: rnd(-14, 2),
                    size: 11,
                    size2: 1.5,
                    color: '#c3cad4',
                    life: 0.42,
                    drag: 0.9,
                  })
                );
              }
            }
          },
          draw(ctx, b) {
            const L = cfg.bulletLen,
              R = cfg.bulletR;
            trailPath(ctx, b, cfg.tracer, R * 0.9, 0.9);
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            ctx.globalCompositeOperation = 'lighter';
            // supersonic shock (Mach) cone
            ctx.strokeStyle = 'rgba(200,222,255,0.2)';
            ctx.lineWidth = 1.2;
            for (const d of [-1, 1]) {
              ctx.beginPath();
              ctx.moveTo(-L * 0.2, d * R * 0.4);
              ctx.lineTo(-84, d * 26);
              ctx.stroke();
            }
            // hot tracer tail
            ctx.fillStyle = cachedBulletGrad(ctx, `tr|${cfg.id}`, -L * 6, 0, 0, 0, (tg) => {
              tg.addColorStop(0, withAlpha(cfg.tracer, 0));
              tg.addColorStop(1, withAlpha(cfg.tracer, 0.85));
            });
            ctx.fillRect(-L * 6, -R * 0.65, L * 6, R * 1.3);
            ctx.restore();
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.angle);
            // jacketed ogive bullet
            ctx.beginPath();
            ctx.moveTo(L, 0);
            ctx.quadraticCurveTo(L * 0.3, -R, -L * 0.45, -R);
            ctx.lineTo(-L, -R * 0.92);
            ctx.lineTo(-L, R * 0.92);
            ctx.lineTo(-L * 0.45, R);
            ctx.quadraticCurveTo(L * 0.3, R, L, 0);
            ctx.closePath();
            ctx.fillStyle = cachedBulletGrad(ctx, `bg|${cfg.id}`, 0, -R, 0, R, (bg) => {
              bg.addColorStop(0, '#fff2c2');
              bg.addColorStop(0.35, '#e2b04a');
              bg.addColorStop(0.65, '#9a6a1d');
              bg.addColorStop(1, '#4e300a');
            });
            ctx.fill();
            ctx.strokeStyle = 'rgba(40,24,6,0.6)';
            ctx.lineWidth = 0.7;
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.fillRect(-L * 0.2, -R * 0.65, L * 0.9, R * 0.3);
            emissive(ctx, -L * 0.9, 0, R * 3.6, cfg.tracer, 0.9);
            emissive(ctx, L * 0.8, 0, R * 2.2, '#ffffff', 0.55);
            ctx.restore();
          },
        })
      );
      api.shake(cfg.recoilAmt * 0.7);
    },
    onImpact(api, x, y, a) {
      audio.play('hit');
      bulletImpact(api, x, y, a, cfg.power, cfg.tracer);
      api.shake(6 * cfg.power);
      api.hitstop(0.03);
    },
    drawMark(ctx, m) {
      const hot = Math.max(0, 1 - m.age * 1.4);
      const r = cfg.id === 'rifle' ? 7.2 : cfg.id === 'ak47' ? 5.8 : cfg.id === 'beretta92' ? 4.7 : 4.2;
      holeMark(ctx, r, m.seed, cfg.id === 'rifle' ? 8 : 5);
      ctx.save();
      ctx.lineCap = 'round';
      // short splintered lips sit close to the entry hole instead of radiating outward
      const cuts = cfg.id === 'rifle' ? 3 : 2;
      for (let i = 0; i < cuts; i++) {
        const side = i - (cuts - 1) * 0.5;
        const x0 = r * (0.55 + i * 0.06);
        ctx.strokeStyle = i % 2 ? 'rgba(30,16,5,0.82)' : 'rgba(231,194,144,0.62)';
        ctx.lineWidth = 0.8 + cfg.power * 0.25;
        ctx.beginPath();
        ctx.moveTo(x0, side * 1.8);
        ctx.lineTo(x0 + r * (0.45 + (i % 2) * 0.16), side * (2.8 + cfg.power));
        ctx.stroke();
      }
      if (cfg.id === 'rifle') {
        // a rifle leaves a shallow oval spall lip around a clean, deep center
        ctx.strokeStyle = 'rgba(230,206,167,0.52)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.35, r * 0.72, 0, 3.25, 5.55);
        ctx.stroke();
      }
      ctx.restore();
      drawEmbedded(ctx, cfg.bulletR * 0.72, hot, cfg.tracer);
      heatGlow(ctx, cfg.id === 'rifle' ? 8 : 6, cfg.tracer, hot * 0.3);
    },
    ambient(api, x, y, out, m, dt) {
      if (m.age < 1.6 && api.particles.length < 72 && Math.random() < dt * 5)
        api.particles.push(
          P({
            type: 'smoke',
            x,
            y,
            vx: Math.cos(out) * rnd(6, 22) + rnd(-6, 6),
            vy: Math.sin(out) * rnd(6, 22) - rnd(6, 18),
            size: rnd(10, 17),
            size2: 2,
            color: '#9aa2ad',
            life: rnd(0.5, 0.95),
            drag: 0.97,
          })
        );
    },
  };
  return w;
}

/* ================================== AK-47 ================================== */

function drawAK(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const bolt = Math.sin(clamp(s.cycle, 0, 1) * Math.PI);
  ctx.save();
  ctx.translate(-kk * 8, -kk * 1.6);
  ctx.rotate(-kk * 0.02);

  /* magazine (curved, ribbed steel) */
  const mag = () => {
    ctx.beginPath();
    ctx.moveTo(4, 6);
    ctx.bezierCurveTo(2, 28, 10, 46, 26, 60);
    ctx.lineTo(52, 55);
    ctx.bezierCurveTo(40, 42, 36, 26, 30, 6);
    ctx.closePath();
  };
  shape(ctx, mag, 6, 60, ['#8d9096', '#4a4e55', '#25282d', '#08090b'], { brush: true });
  for (let i = 1; i <= 6; i++) {
    const u = i / 7;
    const L = bez([4, 6], [2, 28], [10, 46], [26, 60], u);
    const R = bez([30, 6], [36, 26], [40, 42], [52, 55], u);
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(L[0], L[1]);
    ctx.lineTo(R[0], R[1]);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(L[0], L[1] + 1.4);
    ctx.lineTo(R[0], R[1] + 1.4);
    ctx.stroke();
  }

  /* stock – laminated wood with butt plate */
  woodShape(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(-34, -19);
      ctx.lineTo(-100, -8);
      ctx.quadraticCurveTo(-110, -6, -111, 2);
      ctx.lineTo(-108, 26);
      ctx.quadraticCurveTo(-106, 30, -100, 29);
      ctx.lineTo(-34, 6);
      ctx.closePath();
    },
    -112,
    -20,
    -32,
    30,
    T.wood,
    3
  );
  ctx.strokeStyle = '#2a313a';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-110.5, 0);
  ctx.lineTo(-107.5, 26);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-112, 1);
  ctx.lineTo(-109, 25);
  ctx.stroke();
  screw(ctx, -104, 4, 1.8);
  screw(ctx, -103, 20, 1.8);

  /* pistol grip */
  ctx.save();
  ctx.translate(-18, 8);
  ctx.rotate(0.32);
  rect(ctx, -7, 0, 16, 38, 6, T.bakelite);
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(-6, 6 + i * 4.4);
    ctx.lineTo(8, 6 + i * 4.4);
    ctx.stroke();
  }
  ctx.restore();

  /* trigger guard + trigger */
  ctx.strokeStyle = '#1b2027';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-9, 9);
  ctx.quadraticCurveTo(-9, 30, 4, 30);
  ctx.lineTo(10, 30);
  ctx.quadraticCurveTo(17, 30, 17, 12);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();
  polyShape(ctx, [[0, 9], [4.5, 9], [6.5, 22], [2.5, 23.5]], T.steel, { lw: 0.8 });

  /* receiver (stamped steel) + dust cover */
  rect(ctx, -36, -18, 100, 26, 4, T.black, { brush: true });
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-30, 3);
  ctx.lineTo(58, 3);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-30, 4.4);
  ctx.lineTo(58, 4.4);
  ctx.stroke();
  rect(ctx, -34, -29, 96, 14, 5, T.gun, { brush: true });
  spec(ctx, -30, -26, 56, 0.55);
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.3;
  for (const yy of [-23, -19]) {
    ctx.beginPath();
    ctx.moveTo(-24, yy);
    ctx.lineTo(52, yy);
    ctx.stroke();
  }
  rect(ctx, 58, -27, 14, 11, 3, T.gun);

  /* ejection port with live bolt carrier + charging handle */
  ctx.save();
  roundRect(ctx, 6, -16, 44, 12, 2);
  ctx.fillStyle = '#04060a';
  ctx.fill();
  ctx.clip();
  rect(ctx, 12 - bolt * 22, -15, 42, 10, 2, T.steel, { brush: true });
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(14 - bolt * 22, -11, 30, 1.4);
  ctx.restore();
  roundRect(ctx, 6, -16, 44, 12, 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  roundRect(ctx, 6.6, -15.4, 42.8, 11, 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  const hx = 34 - bolt * 22;
  polyShape(ctx, [[hx - 2, -16], [hx + 7, -16], [hx + 8, -24], [hx + 15, -26], [hx + 15, -21], [hx + 12, -18], [hx + 11, -13], [hx - 2, -11]], T.steel, { lw: 0.9 });

  /* safety lever */
  polyShape(ctx, [[-8, -1], [34, -1], [40, 2], [34, 5], [-8, 5]], T.gun, { lw: 0.9 });
  screw(ctx, -4, 2, 1.6);
  screw(ctx, -30, -12, 1.8);
  screw(ctx, -30, -1, 1.8);
  screw(ctx, 58, 0, 1.8);

  /* wooden handguards, gas tube, barrel */
  rect(ctx, 106, -22, 22, 7, 3, T.gun, { brush: true });
  woodShape(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(62, -4);
      ctx.lineTo(116, -3);
      ctx.quadraticCurveTo(121, 2, 116, 10);
      ctx.lineTo(66, 14);
      ctx.quadraticCurveTo(58, 12, 60, 4);
      ctx.closePath();
    },
    58,
    -4,
    121,
    14,
    T.wood,
    5
  );
  woodShape(
    ctx,
    () => {
      ctx.beginPath();
      ctx.moveTo(64, -26);
      ctx.lineTo(110, -25);
      ctx.quadraticCurveTo(114, -20, 110, -13);
      ctx.lineTo(64, -13);
      ctx.closePath();
    },
    62,
    -26,
    114,
    -13,
    T.wood,
    8
  );
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(70 + i * 8, 6);
    ctx.lineTo(70 + i * 8, 11);
    ctx.stroke();
  }
  rect(ctx, 113, -26, 5, 38, 2, T.gun);
  rect(ctx, 118, -13, 36, 9, 2, T.gun, { brush: true });
  rect(ctx, 116, -1, 36, 3, 1.5, T.steel);
  rect(ctx, 138, -3, 7, 8, 2, T.gun);

  /* gas block + hooded front sight */
  rect(ctx, 122, -22, 17, 19, 3, T.black);
  rect(ctx, 129, -34, 5, 13, 1, T.black);
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.arc(131.5, -28, 7.5, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  /* slant muzzle brake */
  polyShape(ctx, [[150, -15], [168, -15], [163, -1], [150, -1]], T.black, { brush: true });
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(156, -15);
  ctx.lineTo(155, -1);
  ctx.moveTo(161, -15);
  ctx.lineTo(159.5, -1);
  ctx.stroke();

  /* tangent rear sight */
  polyShape(ctx, [[42, -31], [70, -31], [74, -28], [42, -28]], T.gun, { lw: 0.9 });
  ctx.fillStyle = '#05070a';
  ctx.fillRect(52, -31, 6, 3);
  ctx.restore();
}

export const ak47 = bulletWeapon({
  id: 'ak47',
  name: 'AK-47 Kalashnikov',
  tag: '7.62×39 · FULL AUTO',
  accent: '#ffb347',
  accent2: '#8b5a2b',
  cooldown: 0.16,
  recoilAmt: 9,
  muzzle: [169, -8],
  eject: [30, -12],
  markSize: 20,
  speed: 2200,
  bulletLen: 9,
  bulletR: 3.4,
  tracer: '#ffb347',
  flash: { kind: 'ak', size: 54 },
  sound: 'ak',
  power: 1,
  casing: 4.2,
  draw: drawAK,
});

/* =============================== BOLT RIFLE =============================== */

export function drawRifleArt(ctx: Ctx, s: WeaponDrawState, el: boolean) {
  const kk = s.recoil * s.recoil;
  const c = clamp(s.cycle, 0, 1);
  const lift = smooth(0, 0.14, c) * (1 - smooth(0.84, 1, c));
  const back = smooth(0.14, 0.44, c) - smooth(0.54, 0.84, c);
  const body = el ? T.navy : T.olive;
  const charge = lerp(0.3, 1, c);
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 7);
  const glow = el ? charge * (0.7 + pulse * 0.3) : 0;
  ctx.save();
  ctx.translate(-kk * 12, -kk * 2);
  ctx.rotate(-kk * 0.028);

  /* stock / chassis */
  polyShape(ctx, [[-34, -18], [-98, -18], [-112, -14], [-117, 26], [-104, 30], [-72, 12], [-34, 10]], body, { brush: false });
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, -88, -6, 36, 10, 5);
  ctx.fill();
  rect(ctx, -121, -15, 7, 44, 3, T.black);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-120, -10 + i * 7);
    ctx.lineTo(-115, -10 + i * 7);
    ctx.stroke();
  }
  rect(ctx, -96, -27, 46, 10, 3, T.black, { brush: true });
  screw(ctx, -88, -22, 2.8);
  screw(ctx, -60, -22, 2.8);
  if (el) {
    glowRect(ctx, -92, 12, 44, 2.4, 1.2, '#38bdf8', 0.5 + pulse * 0.3);
  }

  /* pistol grip + trigger guard */
  ctx.save();
  ctx.translate(-20, 10);
  ctx.rotate(0.25);
  rect(ctx, -8, 0, 17, 36, 6, T.polymer, { brush: true });
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(-7, 5 + i * 4.4);
    ctx.lineTo(8, 5 + i * 4.4);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-12, 10);
  ctx.quadraticCurveTo(-12, 28, 2, 28);
  ctx.lineTo(18, 28);
  ctx.quadraticCurveTo(24, 28, 24, 14);
  ctx.stroke();
  polyShape(ctx, [[2, 10], [6, 10], [8, 21], [4, 22]], T.steel, { lw: 0.8 });

  /* magazine / energy cell */
  if (!el) {
    rect(ctx, 4, 10, 24, 36, 4, T.polymer, { brush: true });
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(6, 18 + i * 6);
      ctx.lineTo(26, 18 + i * 6);
      ctx.stroke();
    }
  } else {
    rect(ctx, 2, 10, 28, 40, 5, T.black, { brush: true });
    for (let i = 0; i < 4; i++) {
      const on = i / 4 < charge;
      roundRect(ctx, 7, 15 + i * 8.5, 18, 5.5, 2);
      ctx.fillStyle = on ? '#0e3a52' : '#0b1118';
      ctx.fill();
      if (on) glowRect(ctx, 7, 15 + i * 8.5, 18, 5.5, 2, '#38bdf8', 0.8);
    }
  }

  /* receiver + rail */
  rect(ctx, -36, -22, 102, 32, 4, T.black, { brush: true });
  rect(ctx, -36, -28, 102, 6, 1, T.gun);
  vents(ctx, -32, -27, 94, 4, 19, '#080a0e');
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-32, 8);
  ctx.lineTo(62, 8);
  ctx.stroke();
  screw(ctx, -30, -12, 2);
  screw(ctx, 58, -12, 2);

  /* ejection port + bolt */
  ctx.save();
  roundRect(ctx, 14, -17, 38, 10, 2);
  ctx.fillStyle = '#04060a';
  ctx.fill();
  ctx.clip();
  rect(ctx, 16 - back * 30, -16, 34, 8, 2, T.steel, { brush: true });
  ctx.restore();
  roundRect(ctx, 14, -17, 38, 10, 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();
  // bolt handle – lifts, slides back, returns
  const rx = 24 - back * 30,
    ry = -11;
  const ph = lerp(2.35, 3.9, lift);
  const ex = rx + Math.cos(ph) * 24,
    ey = ry + Math.sin(ph) * 24;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#06080b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.strokeStyle = '#a7b1bf';
  ctx.lineWidth = 3.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rx, ry - 1);
  ctx.lineTo(ex, ey - 1);
  ctx.stroke();
  const bk = ctx.createRadialGradient(ex - 2, ey - 2, 0, ex, ey, 7);
  bk.addColorStop(0, '#ffffff');
  bk.addColorStop(0.35, '#b6c0cd');
  bk.addColorStop(1, '#2a323c');
  ctx.fillStyle = bk;
  ctx.beginPath();
  ctx.arc(ex, ey, 6, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();

  /* precision scope */
  for (const rxx of [0, 50]) {
    rect(ctx, rxx, -37, 14, 14, 3, T.gun, { brush: true });
    screw(ctx, rxx + 7, -30, 2);
  }
  rect(ctx, -10, -53, 92, 18, 9, T.black, { brush: true });
  spec(ctx, -4, -49, 76, 0.5);
  rect(ctx, -27, -56, 20, 24, 7, T.black, { brush: true });
  rect(ctx, -31, -52, 8, 16, 4, T.polymer);
  rect(ctx, 70, -60, 30, 32, 9, T.black, { brush: true });
  // objective lens
  ctx.save();
  roundRect(ctx, 96, -57, 5, 26, 2.5);
  const lg = ctx.createLinearGradient(96, -57, 101, -31);
  lg.addColorStop(0, '#c9a8ff');
  lg.addColorStop(0.5, '#3c5fbf');
  lg.addColorStop(1, '#7ee8ff');
  ctx.fillStyle = lg;
  ctx.fill();
  ctx.restore();
  // lens glare sweep
  ctx.save();
  roundRect(ctx, 70, -60, 30, 32, 9);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  const sw = 70 + ((s.t * 26) % 70) - 20;
  const sg = ctx.createLinearGradient(sw, 0, sw + 10, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0)');
  sg.addColorStop(0.5, 'rgba(190,225,255,0.4)');
  sg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(sw - 10, -62, 24, 40);
  ctx.restore();
  // turrets
  rect(ctx, 24, -66, 18, 14, 3, T.gun, { brush: true });
  ribs(ctx, 24, -65, 42, -53, 6, 0.5);
  const wg = ctx.createRadialGradient(42, -45, 0, 44, -43, 9);
  wg.addColorStop(0, '#d6dce6');
  wg.addColorStop(0.7, '#5f6a79');
  wg.addColorStop(1, '#1a2027');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.arc(44, -43, 8, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    ctx.beginPath();
    ctx.moveTo(44 + Math.cos(a) * 5.5, -43 + Math.sin(a) * 5.5);
    ctx.lineTo(44 + Math.cos(a) * 8, -43 + Math.sin(a) * 8);
    ctx.stroke();
  }

  if (!el) {
    /* fore-end + M-LOK + folded bipod */
    rect(ctx, 66, -19, 72, 28, 5, body, { brush: true });
    ctx.fillStyle = '#05070a';
    for (let i = 0; i < 6; i++) {
      roundRect(ctx, 74 + i * 10, -6, 6, 3.2, 1.6);
      ctx.fill();
      roundRect(ctx, 74 + i * 10, -14, 6, 3.2, 1.6);
      ctx.fill();
    }
    rect(ctx, 80, 9, 44, 5, 2, T.gun);
    rect(ctx, 78, 6, 8, 8, 2, T.black);
    /* fluted heavy barrel + multi-port brake */
    rect(ctx, 136, -16, 52, 12, 2, T.gun, { brush: true });
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 1.2;
    for (const yy of [-13.5, -10, -6.5]) {
      ctx.beginPath();
      ctx.moveTo(142, yy);
      ctx.lineTo(182, yy);
      ctx.stroke();
    }
    rect(ctx, 186, -22, 36, 24, 4, T.black, { brush: true });
    ctx.fillStyle = '#020306';
    for (let i = 0; i < 3; i++) {
      roundRect(ctx, 194 + i * 8, -20, 3.4, 9, 1.7);
      ctx.fill();
      roundRect(ctx, 194 + i * 8, -7, 3.4, 7, 1.7);
      ctx.fill();
    }
    rect(ctx, 216, -22, 6, 24, 2, T.gun);
  } else {
    /* tesla coil assembly */
    rect(ctx, 66, -20, 20, 26, 4, T.black, { brush: true });
    ctx.save();
    roundRect(ctx, 84, -19, 120, 12, 6);
    ctx.fillStyle = '#04141f';
    ctx.fill();
    ctx.clip();
    const tg = ctx.createLinearGradient(0, -19, 0, -7);
    tg.addColorStop(0, withAlpha('#9be9ff', 0.2 + glow * 0.6));
    tg.addColorStop(0.5, withAlpha('#ffffff', 0.4 + glow * 0.55));
    tg.addColorStop(1, withAlpha('#1aa7e6', 0.2 + glow * 0.5));
    ctx.fillStyle = tg;
    ctx.fillRect(84, -19, 120, 12);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = withAlpha('#ffffff', 0.9);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const x = 84 + i * 3;
      const y = -13 + Math.sin(i * 0.9 - s.t * 30) * 3.4 * (0.6 + glow * 0.5);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 16; i++) {
      const x = 90 + i * 7.1;
      rect(ctx, x, -24, 3.4, 22, 1.4, T.copper, { lw: 0.7 });
    }
    for (const x of [88, 124, 160, 196]) {
      rect(ctx, x, -31, 9, 36, 3, T.ceramic, { lw: 0.9 });
      emissive(ctx, x + 4.5, -13, 12 + glow * 5, '#38bdf8', 0.3 * glow);
    }
    // toroid emitter
    ctx.save();
    ctx.translate(210, -13);
    ctx.strokeStyle = '#6b3a14';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 20, 0, 0, TAU);
    ctx.stroke();
    const tcg = ctx.createLinearGradient(-8, -20, 8, 20);
    tcg.addColorStop(0, '#fff0d6');
    tcg.addColorStop(0.4, '#e08a45');
    tcg.addColorStop(1, '#6b3a14');
    ctx.strokeStyle = tcg;
    ctx.lineWidth = 4.4;
    ctx.stroke();
    ctx.restore();
    emissive(ctx, 210, -13, 22 + glow * 12, '#7dd3fc', 0.8 * glow);
    // idle arcs hopping between insulators
    const q = Math.floor(s.t * 22);
    for (let i = 0; i < 3; i++) {
      if (((q + i * 5) * 2654435761) % 7 < 3 + (1 - c) * 4) {
        const a0 = [92, 128, 164][i] + 4,
          a1 = [128, 164, 200][i] + 4;
        lightning(ctx, a0, -30, a1, -30, 7, '#a5f3fc', (q + i) * 1.7, 1.2, 6);
      }
    }
    if (c < 0.6) lightning(ctx, 214, -13, 214 + rnd(18, 34), -13 + rnd(-16, 16), 6, '#e0f9ff', q, 1.4, 5);
  }
  ctx.restore();
}

export const rifle = bulletWeapon({
  id: 'rifle',
  name: 'Marksman Rifle .308',
  tag: 'BOLT-ACTION · 10× SCOPE',
  accent: '#a3e635',
  accent2: '#3f6212',
  cooldown: 0.5,
  recoilAmt: 14,
  muzzle: [224, -11],
  eject: [34, -13],
  ejectDelay: 0.22,
  markSize: 24,
  speed: 3000,
  bulletLen: 12,
  bulletR: 4,
  tracer: '#d9f99d',
  flash: { kind: 'brake', size: 66 },
  sound: 'rifle',
  power: 1.4,
  casing: 5,
  draw: (ctx, s) => drawRifleArt(ctx, s, false),
});

/* ================================== MP5 ================================== */

export function drawMP5Art(ctx: Ctx, s: WeaponDrawState, el: boolean) {
  const kk = s.recoil * s.recoil;
  const bolt = Math.sin(clamp(s.cycle, 0, 1) * Math.PI);
  const c = clamp(s.cycle, 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(s.t * 9);
  const glow = el ? lerp(0.45, 1, c) * (0.7 + pulse * 0.3) : 0;
  ctx.save();
  ctx.translate(-kk * 5, Math.sin(s.t * 95) * kk * 1.1);
  ctx.rotate(-kk * 0.02);

  /* magazine */
  const mag = () => {
    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.bezierCurveTo(8, 26, 14, 44, 26, 56);
    ctx.lineTo(46, 52);
    ctx.bezierCurveTo(38, 40, 34, 24, 34, 8);
    ctx.closePath();
  };
  if (!el) {
    shape(ctx, mag, 8, 56, T.polymer, { brush: true });
    for (let i = 0; i < 7; i++) {
      const u = 0.1 + i * 0.13;
      const L = bez([10, 8], [8, 26], [14, 44], [26, 56], u);
      const R = bez([34, 8], [34, 24], [38, 40], [46, 52], u);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath();
      ctx.arc((L[0] + R[0]) / 2 + 3, (L[1] + R[1]) / 2, 1.8, 0, TAU);
      ctx.fill();
    }
  } else {
    shape(ctx, mag, 8, 56, T.black, { brush: true });
    ctx.save();
    mag();
    ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const lvl = ctx.createLinearGradient(0, 56, 0, 8);
    lvl.addColorStop(0, withAlpha('#c084fc', 0.9 * glow));
    lvl.addColorStop(Math.max(0.05, glow), withAlpha('#f0abfc', 0.7 * glow));
    lvl.addColorStop(Math.min(1, glow + 0.02), 'rgba(0,0,0,0)');
    lvl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lvl;
    ctx.fillRect(0, 0, 60, 60);
    ctx.restore();
    ctx.strokeStyle = 'rgba(240,171,252,0.55)';
    ctx.lineWidth = 1;
    mag();
    ctx.stroke();
  }
  rect(ctx, 8, 52, 40, 8, 3, T.black);

  /* A3 retractable wire stock */
  rect(ctx, -46, -14, 14, 22, 3, T.black, { brush: true });
  for (const y of [-10, 8]) rect(ctx, -124, y - 2, 94, 4, 2, T.steel, { lw: 0.8 });
  ctx.strokeStyle = '#7b8594';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-100, -10);
  ctx.lineTo(-124, 10);
  ctx.stroke();
  rect(ctx, -134, -18, 10, 40, 3, T.polymer, { brush: true });
  rect(ctx, -136, -12, 4, 28, 2, T.black);

  /* pistol grip + trigger group */
  ctx.save();
  ctx.translate(-20, 8);
  ctx.rotate(0.26);
  rect(ctx, -8, 0, 17, 36, 6, T.polymer, { brush: true });
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 3; i++) {
    roundRect(ctx, -7.5, 8 + i * 8, 4, 5, 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#161a20';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.quadraticCurveTo(-8, 26, 5, 26);
  ctx.lineTo(14, 26);
  ctx.quadraticCurveTo(20, 26, 20, 12);
  ctx.stroke();
  polyShape(ctx, [[3, 9], [7, 9], [9, 20], [5, 21]], T.steel, { lw: 0.8 });
  rect(ctx, -34, -6, 18, 4, 2, T.gun);
  ctx.fillStyle = '#e5e7eb';
  ctx.fillRect(-30, -5, 2, 2);
  ctx.fillRect(-25, -5, 2, 2);
  ctx.fillRect(-20, -5, 2, 2);

  /* stamped receiver + drum rear sight + cocking tube */
  rect(ctx, -34, -20, 96, 28, 6, T.black, { brush: true });
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-28, -16);
  ctx.lineTo(54, -16);
  ctx.stroke();
  rect(ctx, -22, -39, 18, 18, 6, T.black, { brush: true });
  ctx.strokeStyle = '#d8dde6';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-13, -31, 4.4, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#05070a';
  ctx.beginPath();
  ctx.arc(-13, -31, 2.4, 0, TAU);
  ctx.fill();
  rect(ctx, 38, -28, 38, 8, 4, T.gun, { brush: true });
  rect(ctx, 74, -32, 7, 16, 3, T.black);
  screw(ctx, -28, -4, 1.8);
  screw(ctx, 56, -4, 1.8);

  /* port + live bolt */
  ctx.save();
  roundRect(ctx, 4, -17, 36, 10, 2);
  ctx.fillStyle = '#04060a';
  ctx.fill();
  ctx.clip();
  rect(ctx, 8 - bolt * 14, -16, 26, 8, 2, T.steel, { brush: true });
  ctx.restore();
  roundRect(ctx, 4, -17, 36, 10, 2);
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = 1.3;
  ctx.stroke();

  if (!el) {
    /* ribbed handguard + barrel + hooded drum front sight */
    polyShape(ctx, [[60, -24], [116, -20], [118, 8], [62, 12]], T.polymer, { brush: true });
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const y = -13 + i * 6;
      ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.moveTo(68, y);
      ctx.lineTo(110, y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.moveTo(68, y + 1.6);
      ctx.lineTo(110, y + 1.6);
      ctx.stroke();
    }
    rect(ctx, 116, -14, 30, 8, 2, T.gun, { brush: true });
    rect(ctx, 124, -29, 13, 15, 4, T.black, { brush: true });
    ctx.strokeStyle = '#d8dde6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(130.5, -23, 3.6, 0, TAU);
    ctx.stroke();
    rect(ctx, 142, -17, 14, 14, 3, T.black);
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(145 + i * 4, -17);
      ctx.lineTo(145 + i * 4, -3);
      ctx.stroke();
    }
  } else {
    /* ion prism emitter */
    polyShape(ctx, [[60, -22], [100, -20], [102, 4], [62, 10]], T.black, { brush: true });
    const cr = [[70, -14], [100, -10], [112, -6], [100, 2], [70, 4]];
    ctx.save();
    poly(ctx, cr);
    const pg = ctx.createLinearGradient(70, -14, 112, 4);
    pg.addColorStop(0, withAlpha('#f3e0ff', 0.5 + glow * 0.45));
    pg.addColorStop(0.5, withAlpha('#b46cf5', 0.6 + glow * 0.3));
    pg.addColorStop(1, withAlpha('#4c1d95', 0.9));
    ctx.fillStyle = pg;
    ctx.fill();
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(70, -14);
    ctx.lineTo(100, 2);
    ctx.moveTo(70, 4);
    ctx.lineTo(100, -10);
    ctx.moveTo(86, -12);
    ctx.lineTo(86, 3);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    const hp = ctx.createRadialGradient(92, -5, 0, 92, -5, 26);
    hp.addColorStop(0, `rgba(255,255,255,${0.65 * glow})`);
    hp.addColorStop(1, 'rgba(180,108,245,0)');
    ctx.fillStyle = hp;
    ctx.fillRect(60, -22, 60, 40);
    ctx.restore();
    poly(ctx, cr);
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    rect(ctx, 110, -12, 20, 8, 2, T.gun, { brush: true });
    // floating accelerator rings
    for (let i = 0; i < 3; i++) {
      const x = 120 + i * 11;
      const ry = 11 + Math.sin(s.t * 6 + i) * 1.6;
      ctx.save();
      ctx.translate(x, -8);
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 5.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.6, ry, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = withAlpha('#e9d5ff', 0.6 + glow * 0.4);
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ctx.restore();
      emissive(ctx, x, -8, 9 + glow * 4, '#c084fc', 0.45 * glow);
    }
    rect(ctx, 152, -14, 12, 12, 3, T.black, { brush: true });
    emissive(ctx, 160, -8, 18 + glow * 10, '#f0abfc', 0.9 * glow);
    if (Math.sin(s.t * 31) > 0.1) lightning(ctx, 110, -8, 150, -8, 6, '#f5d0fe', s.t * 3, 1.1, 7);
  }
  ctx.restore();
}

export const mp5 = bulletWeapon({
  id: 'mp5',
  name: 'MP5 SMG',
  tag: '9×19 · 800 RPM',
  accent: '#7dd3fc',
  accent2: '#1e3a8a',
  cooldown: 0.085,
  recoilAmt: 5,
  muzzle: [158, -10],
  eject: [26, -12],
  markSize: 15,
  speed: 2000,
  bulletLen: 6,
  bulletR: 2.7,
  tracer: '#ffd88a',
  flash: { kind: 'smg', size: 40 },
  sound: 'smg',
  power: 0.65,
  casing: 3.4,
  draw: (ctx, s) => drawMP5Art(ctx, s, false),
});

/* ================================ BERETTA 92 ================================ */

function drawBeretta(ctx: Ctx, s: WeaponDrawState) {
  const kk = s.recoil * s.recoil;
  const c = clamp(s.cycle, 0, 1);
  const cyc = clamp(c / 0.5, 0, 1);
  const sl = Math.sin(cyc * Math.PI) * 24;
  ctx.save();
  ctx.translate(-kk * 5, 0);
  ctx.translate(-20, 26);
  ctx.rotate(-kk * 0.1);
  ctx.translate(20, -26);

  /* walnut grip + magazine base */
  polyShape(ctx, [[-46, -9], [-12, -9], [-12, 9], [-14, 16], [-32, 64], [-66, 62]], T.black);
  ctx.save();
  poly(ctx, [[-42, -3], [-17, -3], [-19, 12], [-35, 58], [-61, 56]]);
  ctx.fillStyle = cyl(ctx, -4, 58, T.walnut);
  ctx.fill();
  ctx.clip();
  checker(ctx, -64, -4, -14, 60, 3.6, 0.3);
  ctx.restore();
  poly(ctx, [[-42, -3], [-17, -3], [-19, 12], [-35, 58], [-61, 56]]);
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  const gm = ctx.createRadialGradient(-37, 20, 0, -37, 20, 5);
  gm.addColorStop(0, '#fffbd0');
  gm.addColorStop(0.6, '#e0a82a');
  gm.addColorStop(1, '#6b4a0c');
  ctx.fillStyle = gm;
  ctx.beginPath();
  ctx.arc(-37, 20, 4.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.stroke();
  polyShape(ctx, [[-69, 60], [-30, 63], [-30, 71], [-70, 68]], T.black);
  ctx.fillStyle = '#d8dde6';
  ctx.beginPath();
  ctx.arc(-62, 64, 1.8, 0, TAU);
  ctx.fill();

  /* beaver tail + frame + dust cover rail */
  polyShape(ctx, [[-52, -14], [-44, -9], [-47, -1], [-56, -4]], T.black);
  polyShape(ctx, [[-46, -10], [80, -10], [80, 4], [36, 5], [24, 10], [-12, 10], [-12, -2]], T.black, { brush: true });
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 1);
  ctx.lineTo(78, 1);
  ctx.stroke();

  /* trigger guard + gold trigger */
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0c0f13';
  ctx.lineWidth = 5.2;
  ctx.beginPath();
  ctx.moveTo(-15, 10);
  ctx.quadraticCurveTo(-15, 32, 4, 32);
  ctx.lineTo(24, 32);
  ctx.quadraticCurveTo(33, 32, 33, 18);
  ctx.lineTo(33, 6);
  ctx.stroke();
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.save();
  ctx.translate(-kk * 4, 0);
  polyShape(ctx, [[-4, 10], [2, 10], [5, 25], [0, 27]], T.gold, { lw: 0.9 });
  ctx.restore();

  /* barrel + locking block (static) */
  rect(ctx, 34, -30, 66, 13, 3, T.steel, { brush: true });
  spec(ctx, 38, -27, 94, 0.7);
  rect(ctx, 16, -11, 14, 7, 1, T.gun);

  /* slide – recoils */
  ctx.save();
  ctx.translate(-sl, 0);
  const slide = () => {
    ctx.beginPath();
    ctx.moveTo(-50, -34);
    ctx.lineTo(30, -34);
    ctx.lineTo(34, -21);
    ctx.lineTo(84, -21);
    ctx.lineTo(86, -34);
    ctx.lineTo(98, -34);
    ctx.lineTo(98, -9);
    ctx.lineTo(-50, -9);
    ctx.closePath();
  };
  shape(ctx, slide, -34, -9, T.steel, { brush: true, hi: 0.5 });
  // engraved vines in gold
  ctx.save();
  slide();
  ctx.clip();
  ctx.strokeStyle = 'rgba(224,168,42,0.85)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-14, -26);
  ctx.bezierCurveTo(0, -32, 10, -14, 26, -18);
  ctx.moveTo(-14, -16);
  ctx.bezierCurveTo(2, -10, 12, -26, 30, -14);
  ctx.moveTo(40, -17);
  ctx.bezierCurveTo(52, -12, 66, -18, 82, -13);
  ctx.stroke();
  ctx.fillStyle = 'rgba(224,168,42,0.9)';
  for (const [x, y] of [[26, -18], [30, -14], [82, -13]]) {
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // serrations
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(-46 + i * 3.6, -32);
    ctx.lineTo(-48 + i * 3.6, -10);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(89 + i * 3, -31);
    ctx.lineTo(88 + i * 3, -11);
    ctx.stroke();
  }
  // decocker / safety lever
  const lg = ctx.createRadialGradient(-26, -24, 0, -24, -22, 8);
  lg.addColorStop(0, '#ffffff');
  lg.addColorStop(0.5, '#a7b1bf');
  lg.addColorStop(1, '#3c4552');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.arc(-24, -22, 7, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU;
    ctx.beginPath();
    ctx.moveTo(-24 + Math.cos(a) * 5, -22 + Math.sin(a) * 5);
    ctx.lineTo(-24 + Math.cos(a) * 7, -22 + Math.sin(a) * 7);
    ctx.stroke();
  }
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-24, -22, 1.5, 0, TAU);
  ctx.fill();
  // sights with white dots
  rect(ctx, 88, -40, 7, 6, 1, T.black);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(90.5, -38.5, 2, 2);
  rect(ctx, -48, -40, 14, 6, 1, T.black);
  ctx.fillStyle = '#05070a';
  ctx.fillRect(-43, -40, 4, 4);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-46, -38.5, 1.8, 2);
  ctx.fillRect(-37, -38.5, 1.8, 2);
  ctx.restore();

  /* hammer – cocks as the slide cycles */
  ctx.save();
  ctx.translate(-50, -12);
  ctx.rotate(-(sl / 24) * 0.75);
  polyShape(ctx, [[0, -4], [-8, -8], [-11, 0], [-3, 4]], T.gun, { lw: 0.9 });
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(-9 + i * 2, -6 + i);
    ctx.lineTo(-6 + i * 2, 2 + i);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}


export const beretta = bulletWeapon({
  id: 'beretta92',
  name: 'Beretta 92FS Elite',
  tag: '9mm · SEMI-AUTO',
  accent: '#e2e8f0',
  accent2: '#64748b',
  cooldown: 0.24,
  recoilAmt: 8,
  muzzle: [101, -25],
  eject: [44, -28],
  ejectDelay: 0.03,
  markSize: 17,
  speed: 1800,
  bulletLen: 7,
  bulletR: 3,
  tracer: '#ffd9a0',
  flash: { kind: 'pistol', size: 44 },
  sound: 'pistol',
  power: 0.8,
  casing: 3.8,
  draw: drawBeretta,
});
