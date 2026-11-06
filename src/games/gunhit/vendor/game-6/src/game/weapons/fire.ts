import { P, TAU, audio, clamp, easeOut, pick, rnd, smooth } from '../core';
import { emissive, roundRect } from '../art';
import { dust, embers, impactFlash, makeBeam, shockRing, sparkFan } from '../fx';
import type { Weapon } from '../types';

const TRAVEL = 0.22;

export const dragonBreath: Weapon = {
  id: 'dragonBreath',
  name: 'Dragon Breath Cannon',
  tag: 'FLAME WYRM · MYTHIC',
  accent: '#ff7a18',
  accent2: '#ffcf4d',
  mode: 'beam',
  cooldown: 1.0,
  recoilAmt: 16,
  muzzle: [208, -2],
  markSize: 38,
  draw(ctx, s) {
    const r = s.recoil;
    const breathe = 0.5 + 0.5 * Math.sin(s.t * 3.2);
    const flick = 0.55 + 0.45 * Math.sin(s.t * 12);
    ctx.save();
    ctx.translate(-r * 12, 0);

    const scaleSkin = (x0: number, y0: number, x1: number, y1: number, step: number) => {
      ctx.save();
      ctx.clip();
      for (let y = y0, row = 0; y < y1; y += step * 0.7, row++) {
        for (let x = x0 + (row % 2) * step * 0.5; x < x1; x += step) {
          ctx.beginPath();
          ctx.arc(x, y, step * 0.58, Math.PI * 0.08, Math.PI * 0.92);
          ctx.strokeStyle = 'rgba(255,196,120,0.22)';
          ctx.lineWidth = 1.1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y - 1, step * 0.58, Math.PI * 1.1, Math.PI * 1.9);
          ctx.strokeStyle = 'rgba(60,10,6,0.25)';
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    /* ---------------- wing guard (drawn behind the body) ---------------- */
    ctx.save();
    ctx.translate(14, -20);
    ctx.rotate(Math.sin(s.t * 1.6) * 0.035 - s.recoil * 0.14);
    ctx.translate(-14, 20);
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.quadraticCurveTo(28, -92, 104, -104);
    ctx.quadraticCurveTo(84, -74, 96, -58);
    ctx.quadraticCurveTo(70, -62, 64, -40);
    ctx.quadraticCurveTo(46, -46, 30, -16);
    ctx.closePath();
    const wg = ctx.createLinearGradient(10, -100, 70, -10);
    wg.addColorStop(0, '#f97316');
    wg.addColorStop(0.35, '#b91c1c');
    wg.addColorStop(0.75, '#7f1d1d');
    wg.addColorStop(1, '#3b0a0a');
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,4,2,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    // wing finger bones
    ctx.strokeStyle = 'rgba(253,224,160,0.6)';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (const [ex, ey] of [
      [100, -100],
      [92, -60],
      [62, -42],
    ] as number[][]) {
      ctx.beginPath();
      ctx.moveTo(14, -20);
      ctx.quadraticCurveTo((ex + 14) / 2 - 6, (ey - 20) / 2 - 16, ex, ey);
      ctx.stroke();
    }
    ctx.restore();

    /* --------------------------- body + neck --------------------------- */
    ctx.beginPath();
    ctx.moveTo(-118, 0);
    ctx.bezierCurveTo(-100, -22, -64, -30, -24, -29);
    ctx.lineTo(116, -28);
    ctx.lineTo(116, 24);
    ctx.lineTo(-24, 25);
    ctx.bezierCurveTo(-62, 25, -94, 20, -118, 13);
    ctx.closePath();
    const bodyg = ctx.createLinearGradient(0, -30, 0, 26);
    bodyg.addColorStop(0, '#ef4444');
    bodyg.addColorStop(0.3, '#b91c1c');
    bodyg.addColorStop(0.62, '#7f1d1d');
    bodyg.addColorStop(0.82, '#8a4a12');
    bodyg.addColorStop(1, '#f0c069');
    ctx.fillStyle = bodyg;
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-118, 0);
    ctx.bezierCurveTo(-100, -22, -64, -30, -24, -29);
    ctx.lineTo(116, -28);
    ctx.lineTo(116, 24);
    ctx.lineTo(-24, 25);
    ctx.bezierCurveTo(-62, 25, -94, 20, -118, 13);
    ctx.closePath();
    scaleSkin(-120, -30, 120, 12, 11);
    ctx.restore();
    ctx.strokeStyle = 'rgba(25,5,3,0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-118, 0);
    ctx.bezierCurveTo(-100, -22, -64, -30, -24, -29);
    ctx.lineTo(116, -28);
    ctx.moveTo(116, 24);
    ctx.lineTo(-24, 25);
    ctx.bezierCurveTo(-62, 25, -94, 20, -118, 13);
    ctx.stroke();

    // golden belly plates
    for (let i = 0; i < 11; i++) {
      const x = -104 + i * 20;
      ctx.beginPath();
      roundRect(ctx, x, 12, 17, 11, 4);
      const pg = ctx.createLinearGradient(0, 12, 0, 23);
      pg.addColorStop(0, '#fde68a');
      pg.addColorStop(0.6, '#d9a441');
      pg.addColorStop(1, '#8a5a12');
      ctx.fillStyle = pg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,30,4,0.5)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // spine spikes
    for (let i = 0; i < 9; i++) {
      const x = -106 + i * 22;
      const h = 12 + Math.sin(i * 0.7) * 4 + i * 0.7;
      const base = i < 3 ? -18 - i * 3 : -27;
      ctx.beginPath();
      ctx.moveTo(x, base + 4);
      ctx.quadraticCurveTo(x + 4, base - h, x + 14, base - 1);
      ctx.closePath();
      const sg = ctx.createLinearGradient(x, base - h, x, base);
      sg.addColorStop(0, '#fff3cd');
      sg.addColorStop(0.5, '#e0a63c');
      sg.addColorStop(1, '#7c2d12');
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(40,12,2,0.6)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    // tail tip fin
    ctx.beginPath();
    ctx.moveTo(-112, -4);
    ctx.quadraticCurveTo(-148, -30, -156, -2);
    ctx.quadraticCurveTo(-146, 10, -114, 12);
    ctx.closePath();
    const tf = ctx.createLinearGradient(-156, -20, -112, 12);
    tf.addColorStop(0, '#fb923c');
    tf.addColorStop(0.6, '#9a1b1b');
    tf.addColorStop(1, '#4c0f0f');
    ctx.fillStyle = tf;
    ctx.fill();
    ctx.strokeStyle = 'rgba(25,5,3,0.7)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    /* ------------------------------ grip ------------------------------ */
    ctx.save();
    ctx.translate(-34, 22);
    ctx.rotate(0.22);
    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.quadraticCurveTo(-14, 26, -6, 44);
    ctx.lineTo(12, 42);
    ctx.quadraticCurveTo(14, 20, 10, 0);
    ctx.closePath();
    const gg = ctx.createLinearGradient(-12, 0, 14, 40);
    gg.addColorStop(0, '#8a3b12');
    gg.addColorStop(0.5, '#5c2409');
    gg.addColorStop(1, '#2a0f03');
    ctx.fillStyle = gg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,6,2,0.8)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // claws on grip
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-10, 8 + i * 12);
      ctx.quadraticCurveTo(-22, 12 + i * 12, -24, 20 + i * 12);
      ctx.quadraticCurveTo(-14, 16 + i * 12, -9, 16 + i * 12);
      ctx.closePath();
      const cg2 = ctx.createLinearGradient(-24, 0, -8, 0);
      cg2.addColorStop(0, '#fff6dd');
      cg2.addColorStop(1, '#b78b4a');
      ctx.fillStyle = cg2;
      ctx.fill();
    }
    ctx.restore();

    // trigger guard
    ctx.strokeStyle = '#3b1706';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-18, 28, 15, -0.35, Math.PI + 0.1);
    ctx.stroke();

    /* ------------------------------ head ------------------------------ */
    ctx.save();
    ctx.translate(112, -2);

    // back horns (behind skull)
    for (const [hy, hl, hc] of [
      [-18, 70, -22],
      [-10, 54, -4],
    ] as number[][]) {
      ctx.beginPath();
      ctx.moveTo(-2, hy);
      ctx.quadraticCurveTo(-hl * 0.55, hy + hc - 10, -hl, hy + hc);
      ctx.quadraticCurveTo(-hl * 0.5, hy + hc + 8, 2, hy + 10);
      ctx.closePath();
      const hgx = ctx.createLinearGradient(0, hy, -hl, hy + hc);
      hgx.addColorStop(0, '#6b3310');
      hgx.addColorStop(0.45, '#d9b27a');
      hgx.addColorStop(1, '#fffaf0');
      ctx.fillStyle = hgx;
      ctx.fill();
      ctx.strokeStyle = 'rgba(40,16,2,0.6)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // horn ridges
      ctx.strokeStyle = 'rgba(80,40,10,0.4)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 5; i++) {
        const t2 = i / 5;
        ctx.beginPath();
        ctx.moveTo(-hl * t2, hy + hc * t2 - 6 * (1 - t2));
        ctx.lineTo(-hl * t2 + 4, hy + hc * t2 + 8 * (1 - t2));
        ctx.stroke();
      }
    }

    // ---- mouth interior glow (behind jaws) ----
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const mg = ctx.createRadialGradient(58, 0, 2, 58, 0, 52 + breathe * 14 + s.recoil * 34);
    mg.addColorStop(0, `rgba(255,252,220,${0.85 * (0.5 + breathe * 0.3 + s.recoil * 0.6) * (0.5 + 0.5 * s.cycle)})`);
    mg.addColorStop(0.3, `rgba(255,160,40,${0.6 + breathe * 0.2})`);
    mg.addColorStop(0.65, 'rgba(220,60,0,0.3)');
    mg.addColorStop(1, 'rgba(160,20,0,0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(58, 0, 52 + breathe * 14 + s.recoil * 34, 0, TAU);
    ctx.fill();
    ctx.restore();

    // ---- lower jaw ----
    ctx.save();
    ctx.rotate(0.07 + breathe * 0.04 + s.recoil * 0.34 + Math.max(0, 1 - s.cycle * 3) * 0.06);
    ctx.beginPath();
    ctx.moveTo(-10, 4);
    ctx.bezierCurveTo(24, 18, 56, 16, 84, 6);
    ctx.lineTo(80, 15);
    ctx.bezierCurveTo(52, 30, 16, 30, -10, 20);
    ctx.closePath();
    const ljg = ctx.createLinearGradient(0, 4, 0, 30);
    ljg.addColorStop(0, '#b91c1c');
    ljg.addColorStop(0.45, '#7f1d1d');
    ljg.addColorStop(1, '#c58a31');
    ctx.fillStyle = ljg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(25,5,3,0.8)';
    ctx.lineWidth = 1.7;
    ctx.stroke();
    // lower teeth
    ctx.fillStyle = '#fffaf0';
    for (let i = 0; i < 7; i++) {
      const tx = 2 + i * 11;
      const th = 8 + (i % 2) * 4;
      ctx.beginPath();
      ctx.moveTo(tx, 11);
      ctx.lineTo(tx + 6, 11);
      ctx.lineTo(tx + 3, 11 - th);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // ---- upper skull ----
    ctx.beginPath();
    ctx.moveTo(-14, -26);
    ctx.bezierCurveTo(16, -40, 54, -36, 76, -22);
    ctx.quadraticCurveTo(92, -16, 94, -8);
    ctx.lineTo(78, -2);
    ctx.bezierCurveTo(52, 2, 16, 4, -14, 2);
    ctx.closePath();
    const skg = ctx.createLinearGradient(0, -40, 0, 6);
    skg.addColorStop(0, '#fda4a4');
    skg.addColorStop(0.22, '#dc2626');
    skg.addColorStop(0.6, '#991b1b');
    skg.addColorStop(1, '#4a0d0d');
    ctx.fillStyle = skg;
    ctx.fill();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-14, -26);
    ctx.bezierCurveTo(16, -40, 54, -36, 76, -22);
    ctx.quadraticCurveTo(92, -16, 94, -8);
    ctx.lineTo(78, -2);
    ctx.bezierCurveTo(52, 2, 16, 4, -14, 2);
    ctx.closePath();
    scaleSkin(-16, -38, 96, 2, 9);
    ctx.restore();
    ctx.strokeStyle = 'rgba(25,5,3,0.85)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // upper teeth
    ctx.fillStyle = '#fffaf0';
    for (let i = 0; i < 8; i++) {
      const tx = -2 + i * 11;
      const th = 9 + (i % 2) * 5;
      ctx.beginPath();
      ctx.moveTo(tx, -1);
      ctx.lineTo(tx + 6, -1);
      ctx.lineTo(tx + 3, -1 + th);
      ctx.closePath();
      ctx.fill();
    }
    // fang
    ctx.beginPath();
    ctx.moveTo(70, -2);
    ctx.lineTo(79, -3);
    ctx.lineTo(74, 14);
    ctx.closePath();
    ctx.fill();

    // brow ridge
    ctx.beginPath();
    ctx.moveTo(2, -26);
    ctx.quadraticCurveTo(26, -38, 50, -27);
    ctx.quadraticCurveTo(26, -30, 4, -19);
    ctx.closePath();
    const brg = ctx.createLinearGradient(0, -38, 0, -18);
    brg.addColorStop(0, '#fde68a');
    brg.addColorStop(1, '#b45309');
    ctx.fillStyle = brg;
    ctx.fill();

    // cheek spike
    ctx.beginPath();
    ctx.moveTo(6, -6);
    ctx.lineTo(-18, 2);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fillStyle = '#e7c98a';
    ctx.fill();

    // eye
    ctx.beginPath();
    ctx.ellipse(22, -17, 9, 6.4, -0.16, 0, TAU);
    const eg = ctx.createRadialGradient(20, -18, 1, 22, -17, 10);
    eg.addColorStop(0, '#fffbe6');
    eg.addColorStop(0.45, '#fbbf24');
    eg.addColorStop(1, '#b45309');
    ctx.fillStyle = eg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,12,2,0.8)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(24, -17, 2.1, 5.2, -0.16, 0, TAU);
    ctx.fillStyle = '#190700';
    ctx.fill();
    emissive(ctx, 22, -17, 15 + flick * 6, '#fbbf24', 0.5);

    // nostril + smoke wisp
    ctx.fillStyle = 'rgba(30,8,0,0.75)';
    ctx.beginPath();
    ctx.ellipse(80, -13, 3.6, 2.4, 0.35, 0, TAU);
    ctx.fill();

    // smoke curling from the nostril
    for (let i = 0; i < 3; i++) {
      const ph = (s.t * 0.7 + i / 3) % 1;
      ctx.fillStyle = `rgba(90,78,70,${0.38 * (1 - ph)})`;
      ctx.beginPath();
      ctx.arc(80 + ph * 16, -14 - ph * 34 + Math.sin(ph * 6 + s.t) * 3, 3 + ph * 9, 0, TAU);
      ctx.fill();
    }
    // hot breath at the muzzle
    emissive(ctx, 84, -4, 22 + breathe * 10, '#ff9c2a', 0.55 + breathe * 0.25);
    ctx.restore();

    ctx.restore();
  },
  fire(api, x, y, a) {
    audio.play('dragon');
    api.flash('#ff8c2b', 0.36);
    api.shake(18);
    const hs = api.hitscan(x, y, a);
    const len = hs.hit ? hs.dist : 950;
    const ps = api.particles;
    // roaring muzzle burst
    ps.push(P({ type: 'flash', x, y, size: 130, color: '#ffd27a', color2: '#ff5a00', life: 0.18 }));
    ps.push(P({ type: 'glow', x, y, size: 340, size2: 120, color: '#ffb347', color2: '#ff3d00', life: 0.24 }));
    ps.push(P({ type: 'cone', x, y, rot: a, size: 300, width: 0.5, color: '#ffe3a0', color2: '#ff5a00', life: 0.16 }));
    ps.push(P({ type: 'flare', x, y, rot: a, size: 240, size2: 7, width: 0.85, color: '#ffcf70', life: 0.14 }));
    shockRing(api, x, y, 110, '#ffd9a0', 4, 0.3);
    embers(api, x, y, 22, '#ffe3a0', '#ff5500', 1.3, 40);
    api.beams.push(
      makeBeam({
        weapon: dragonBreath,
        x,
        y,
        angle: a,
        len,
        duration: 1.05,
        hit: hs.hit,
        hitX: hs.x,
        hitY: hs.y,
        impactDelay: TRAVEL * 0.92,
        tick(bm, _dt, g) {
          const age = bm.age;
          const breath = smooth(0.1, 0.3, age) * (1 - smooth(0.6, 0.85, age));
          const n = Math.round(18 * breath);
          for (let i = 0; i < n; i++) {
            const ang = bm.angle + rnd(-0.28, 0.28) * (0.4 + rnd());
            const sp = rnd(480, 1250);
            g.particles.push(
              P({
                type: 'fire',
                x: bm.x + Math.cos(bm.angle) * rnd(0, 24) + rnd(-6, 6),
                y: bm.y + Math.sin(bm.angle) * rnd(0, 24) + rnd(-6, 6),
                vx: Math.cos(ang) * sp,
                vy: Math.sin(ang) * sp - 40,
                size: rnd(26, 64),
                size2: 6,
                color: pick(['#ff9a1f', '#ff6a00', '#ff7a18']),
                color2: '#8c1a00',
                life: rnd(0.3, 0.62),
                drag: 0.9,
              })
            );
          }
          for (let i = 0; i < 6 * breath; i++) {
            const ang = bm.angle + rnd(-0.3, 0.3);
            g.particles.push(
              P({
                type: 'ember',
                x: bm.x,
                y: bm.y,
                vx: Math.cos(ang) * rnd(300, 900),
                vy: Math.sin(ang) * rnd(300, 900),
                size: rnd(1.2, 2.8),
                color: '#ffe08a',
                color2: '#ff4d00',
                life: rnd(0.5, 1.3),
                grav: 240,
                drag: 0.96,
              })
            );
          }
          // flames shed by the serpent's head
          if (age < TRAVEL + 0.04 && age > 0.02) {
            const hd = bm.len * easeOut(clamp(age / TRAVEL, 0, 1));
            for (let i = 0; i < 3; i++)
              g.particles.push(
                P({
                  type: 'fire',
                  x: bm.x + Math.cos(bm.angle) * hd + rnd(-14, 14),
                  y: bm.y + Math.sin(bm.angle) * hd + rnd(-14, 14),
                  vx: rnd(-90, 90),
                  vy: rnd(-90, 90) - 30,
                  size: rnd(18, 36),
                  size2: 4,
                  color: '#ff9a1f',
                  color2: '#a31500',
                  life: rnd(0.25, 0.5),
                  drag: 0.92,
                })
              );
          }
          if (Math.random() < 0.5 * breath)
            g.particles.push(
              P({
                type: 'smoke',
                x: bm.x + Math.cos(bm.angle) * rnd(40, 260),
                y: bm.y + Math.sin(bm.angle) * rnd(40, 260),
                vx: rnd(-60, 60),
                vy: rnd(-130, -20),
                size: rnd(40, 90),
                size2: 14,
                color: '#3a2b22',
                life: rnd(0.8, 1.7),
              })
            );
        },
        draw(ctx, bm) {
          const age = bm.age;
          const ang = bm.angle;
          const breath = smooth(0.1, 0.3, age) * (1 - smooth(0.6, 0.85, age));
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          // fire sheet
          if (breath > 0) {
            ctx.save();
            ctx.translate(bm.x, bm.y);
            ctx.rotate(ang);
            const L = Math.min(bm.len, 640);
            const g = ctx.createLinearGradient(0, 0, L, 0);
            g.addColorStop(0, `rgba(255,240,200,${0.55 * breath})`);
            g.addColorStop(0.22, `rgba(255,150,40,${0.36 * breath})`);
            g.addColorStop(1, 'rgba(200,40,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(0, -10 * breath);
            ctx.quadraticCurveTo(L * 0.5, -L * 0.17 * breath, L, -L * 0.21 * breath);
            ctx.lineTo(L, L * 0.21 * breath);
            ctx.quadraticCurveTo(L * 0.5, L * 0.17 * breath, 0, 10 * breath);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          /* ---------------- the flame dragon ---------------- */
          const hd = bm.len * easeOut(clamp(age / TRAVEL, 0, 1));
          const bodyFade = 1 - smooth(0.45, 0.95, age);
          const headFade = 1 - smooth(TRAVEL * 0.92, TRAVEL * 0.92 + 0.07, age);
          const Lb = 380;
          const N = 48;
          const pts: { x: number; y: number; u: number; ax: number }[] = [];
          for (let j = 0; j <= N; j++) {
            const u = j / N;
            const ax = Math.max(0, hd - u * Lb);
            const env = smooth(0, 160, ax);
            const off = Math.sin(u * 9 - age * 16) * 48 * (0.3 + u * 0.8) * env;
            pts.push({
              u,
              ax,
              x: bm.x + Math.cos(ang) * ax - Math.sin(ang) * off,
              y: bm.y + Math.sin(ang) * ax + Math.cos(ang) * off,
            });
          }
          for (let j = N; j >= 0; j--) {
            const p = pts[j];
            if (j > 0 && p.ax <= 0 && pts[j - 1].ax <= 0) continue;
            const w = 9 + 32 * Math.pow(1 - p.u, 0.7);
            const al = bodyFade * 0.5 * (0.3 + 0.7 * (1 - p.u));
            const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, w);
            if (p.u < 0.18) {
              rg.addColorStop(0, `rgba(255,236,190,${al})`);
              rg.addColorStop(0.4, `rgba(255,212,100,${al * 0.9})`);
              rg.addColorStop(1, 'rgba(255,100,0,0)');
            } else {
              rg.addColorStop(0, `rgba(255,214,120,${al})`);
              rg.addColorStop(0.45, `rgba(255,110,10,${al * 0.75})`);
              rg.addColorStop(1, 'rgba(160,20,0,0)');
            }
            ctx.fillStyle = rg;
            ctx.beginPath();
            ctx.arc(p.x, p.y, w, 0, TAU);
            ctx.fill();
          }
          // white-hot spine
          ctx.lineCap = 'round';
          for (let j = N; j > 0; j--) {
            const p0 = pts[j],
              p1 = pts[j - 1];
            if (p0.ax <= 0 && p1.ax <= 0) continue;
            ctx.strokeStyle = `rgba(255,236,180,${bodyFade * 0.42 * (1 - p0.u)})`;
            ctx.lineWidth = (4 + 12 * Math.pow(1 - p0.u, 0.8)) * 0.6;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
          // flame spines along the back
          for (let j = 3; j < N; j += 3) {
            const p = pts[j];
            if (p.ax <= 0) continue;
            const q = pts[j - 1];
            const tx = p.x - q.x,
              ty = p.y - q.y;
            const tl = Math.hypot(tx, ty) || 1;
            const nx = -ty / tl,
              ny = tx / tl;
            const l = (14 + 14 * (1 - p.u)) * (0.7 + 0.3 * Math.sin(age * 40 + j));
            ctx.strokeStyle = `rgba(255,170,40,${bodyFade * 0.7 * (1 - p.u * 0.6)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + nx * l - (tx / tl) * l * 0.8, p.y + ny * l - (ty / tl) * l * 0.8);
            ctx.stroke();
          }
          // the head
          if (headFade > 0.01) {
            const h0 = pts[0],
              h2 = pts[3];
            const hang = hd > 30 ? Math.atan2(h0.y - h2.y, h0.x - h2.x) : ang;
            const gape = 0.08 + 0.5 * (1 - smooth(TRAVEL * 0.55, TRAVEL * 0.9, age));
            ctx.save();
            ctx.translate(h0.x, h0.y);
            ctx.rotate(hang);
            ctx.scale(1.55, 1.55);
            const fillHead = (alpha: number) => {
              const g = ctx.createLinearGradient(-40, 0, 52, 0);
              g.addColorStop(0, `rgba(255,120,20,${alpha * 0.7})`);
              g.addColorStop(0.5, `rgba(255,205,90,${alpha * 0.95})`);
              g.addColorStop(1, `rgba(255,255,235,${alpha})`);
              return g;
            };
            // horns
            for (const hornY of [-1, 1]) {
              ctx.beginPath();
              ctx.moveTo(-6, hornY * -12);
              ctx.quadraticCurveTo(-26, hornY * -32, -50, hornY * -26);
              ctx.quadraticCurveTo(-28, hornY * -20, -10, hornY * -6);
              ctx.closePath();
              ctx.fillStyle = fillHead(headFade * 0.8);
              ctx.fill();
            }
            // upper jaw
            ctx.beginPath();
            ctx.moveTo(-14, -12);
            ctx.lineTo(6, -18);
            ctx.lineTo(30, -14);
            ctx.lineTo(54, -7);
            ctx.lineTo(56, -3);
            ctx.lineTo(30, -1);
            ctx.lineTo(2, -2);
            ctx.closePath();
            ctx.fillStyle = fillHead(headFade);
            ctx.fill();
            ctx.strokeStyle = `rgba(255,150,40,${headFade * 0.9})`;
            ctx.lineWidth = 1.6;
            ctx.stroke();
            // lower jaw hinged at the cheek
            ctx.save();
            ctx.translate(-8, 2);
            ctx.rotate(gape);
            ctx.translate(8, -2);
            ctx.beginPath();
            ctx.moveTo(-10, 2);
            ctx.lineTo(26, 2);
            ctx.lineTo(50, 5);
            ctx.lineTo(44, 9);
            ctx.lineTo(24, 12);
            ctx.lineTo(-10, 12);
            ctx.closePath();
            ctx.fillStyle = fillHead(headFade * 0.9);
            ctx.fill();
            ctx.stroke();
            // fangs
            ctx.fillStyle = `rgba(255,255,255,${headFade})`;
            for (let i = 0; i < 4; i++) {
              ctx.beginPath();
              ctx.moveTo(8 + i * 10, 3);
              ctx.lineTo(13 + i * 10, 3);
              ctx.lineTo(10.5 + i * 10, -6);
              ctx.closePath();
              ctx.fill();
            }
            ctx.restore();
            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = `rgba(255,255,255,${headFade})`;
              ctx.beginPath();
              ctx.moveTo(10 + i * 10, -1);
              ctx.lineTo(15 + i * 10, -1);
              ctx.lineTo(12.5 + i * 10, 8);
              ctx.closePath();
              ctx.fill();
            }
            emissive(ctx, 36, 2 + gape * 10, 22, '#ffd27a', headFade * 0.9);
            emissive(ctx, 12, -10, 12, '#ffffff', headFade);
            // trailing whiskers
            ctx.strokeStyle = `rgba(255,190,70,${headFade * 0.8})`;
            ctx.lineWidth = 2;
            for (const wy of [-1, 1]) {
              ctx.beginPath();
              ctx.moveTo(46, wy * -5);
              ctx.bezierCurveTo(10, wy * -22, -30, wy * -4 + Math.sin(age * 30) * 6, -64, wy * -16);
              ctx.stroke();
            }
            ctx.restore();
          }
          ctx.restore();
        },
      })
    );
    if (hs.hit) api.registerHit(hs.x, hs.y, dragonBreath, TRAVEL * 0.92);
  },
  onImpact(api, x, y, a) {
    audio.play('hitFire');
    impactFlash(api, x, y, 140, '#fff1c4', '#ff5a00', 0.22);
    api.flash('#ff7a18', 0.34);
    api.shake(16);
    api.hitstop(0.05);
    const ps = api.particles;
    shockRing(api, x, y, 120, '#ffb347', 4, 0.36);
    shockRing(api, x, y, 76, '#fff1c4', 3, 0.26);
    // rolling fireball
    for (let i = 0; i < 34; i++) {
      const an = a + Math.PI + rnd(-1.6, 1.6);
      ps.push(
        P({
          type: 'fire',
          x,
          y,
          vx: Math.cos(an) * rnd(60, 460),
          vy: Math.sin(an) * rnd(60, 460) - 110,
          size: rnd(24, 54),
          size2: 5,
          color: pick(['#ff7a18', '#ff9a1f', '#ffd166']),
          color2: '#b31200',
          life: rnd(0.35, 0.85),
          drag: 0.9,
        })
      );
    }
    // fire column rising off the wheel
    for (let i = 0; i < 14; i++)
      ps.push(
        P({
          type: 'fire',
          x: x + rnd(-14, 14),
          y: y + rnd(-6, 6),
          vx: rnd(-40, 40),
          vy: -rnd(160, 460),
          size: rnd(20, 42),
          size2: 4,
          color: '#ff8a1f',
          color2: '#a31500',
          life: rnd(0.5, 1.0),
          drag: 0.94,
        })
      );
    embers(api, x, y, 40, '#ffe3a0', '#ff5500', 1.2, 160);
    sparkFan(api, x, y, a + Math.PI, 18, { spread: 1.6, colors: ['#ffe3a0', '#ff9a1f'], max: 800, grav: 700 });
    dust(api, x, y, a, 4, 1.2, '#3a2d25');
    for (let i = 0; i < 7; i++)
      ps.push(
        P({
          type: 'smoke',
          x,
          y,
          vx: rnd(-90, 90),
          vy: rnd(-170, -40),
          size: rnd(46, 90),
          size2: 10,
          color: '#4b4038',
          life: rnd(1, 1.9),
        })
      );
  },
  drawMark(ctx, m, t) {
    const fadeIn = smooth(0.16, 0.3, m.age);
    if (fadeIn <= 0.001) return;
    ctx.save();
    ctx.globalAlpha = fadeIn;
    const burn = Math.max(0, 1 - (m.age - 0.2) * 0.14);
    // charred crater
    const g = ctx.createRadialGradient(-4, 0, 0, -4, 0, 24);
    g.addColorStop(0, '#040302');
    g.addColorStop(0.5, '#190e08');
    g.addColorStop(1, 'rgba(40,20,10,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(-4, 0, 24, 20, 0, 0, TAU);
    ctx.fill();
    // three claw gouges, glowing at their edges
    ctx.save();
    ctx.rotate(0.55);
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-22, i * 8 - 1);
      ctx.quadraticCurveTo(0, i * 8 + 5, 24, i * 8 - 2);
      ctx.quadraticCurveTo(0, i * 8 - 1, -22, i * 8 + 1);
      ctx.fillStyle = '#080402';
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = `rgba(255,140,30,${0.35 + 0.5 * burn})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-20, i * 8);
      ctx.quadraticCurveTo(0, i * 8 + 3, 22, i * 8 - 1);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 10; i++) {
      const an = m.seed + i * 1.7;
      const rr = 4 + ((i * 37) % 13);
      const fl = 0.3 + 0.7 * Math.abs(Math.sin(t * 5 + i * 1.3 + m.seed));
      const ex = Math.cos(an) * rr - 4,
        ey = Math.sin(an) * rr * 0.8;
      const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 7);
      eg.addColorStop(0, `rgba(255,220,130,${0.8 * fl * burn})`);
      eg.addColorStop(0.4, `rgba(255,90,0,${0.5 * fl * burn})`);
      eg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(ex, ey, 7, 0, TAU);
      ctx.fill();
    }
    if (burn > 0.05) {
      for (let i = 0; i < 5; i++) {
        const fx = -8 + i * 4.5;
        const h = (10 + 12 * Math.abs(Math.sin(t * 7 + i * 2 + m.seed))) * burn;
        const fg = ctx.createLinearGradient(fx, 0, fx + h, 0);
        fg.addColorStop(0, `rgba(255,210,90,${0.55 * burn})`);
        fg.addColorStop(1, 'rgba(255,60,0,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.ellipse(fx + h * 0.4, Math.sin(t * 6 + i) * 3, h * 0.6, 5, 0, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.restore();
  },
  ambient(api, x, y, out, m, dt) {
    if (m.age < 0.3) return;
    const burn = Math.max(0, 1 - (m.age - 0.2) * 0.14);
    if (burn > 0.05 && Math.random() < dt * 16 * burn)
      api.particles.push(
        P({
          type: 'fire',
          x: x + rnd(-6, 6),
          y: y + rnd(-4, 4),
          vx: rnd(-22, 22),
          vy: -rnd(40, 110),
          size: rnd(16, 30),
          size2: 3,
          color: '#ff8a1f',
          color2: '#a31500',
          life: rnd(0.35, 0.65),
          drag: 0.95,
        })
      );
    if (burn > 0.05 && Math.random() < dt * 5)
      api.particles.push(P({ type: 'smoke', x, y, vx: rnd(-14, 14), vy: -rnd(30, 70), size: rnd(24, 40), size2: 6, color: '#4a3d34', life: rnd(0.9, 1.5) }));
    if (burn > 0.1 && Math.random() < dt * 6)
      api.particles.push(
        P({ type: 'ember', x, y, vx: rnd(-40, 40), vy: -rnd(40, 140), size: rnd(1.2, 2.4), color: '#ffe08a', color2: '#ff4d00', life: rnd(0.6, 1.3), grav: 120 })
      );
    void out;
  },
};

