/**
 * Slide-3 wheel life, copied verbatim from `games/game-4/src/game/Game.ts` by
 * `scripts/gen-set-seven.py` (never edit by hand):
 *
 *   - `updateSevenStuck`  — the stuck-round loop of its `update()`: smoke off
 *     the rockets, cannonballs and gauntlets, the flamethrower's embers, the
 *     black hole's lens and sparks, the gravity orb's lens;
 *   - `updateSevenDecals` — the decal loop: wet and goo stains dripping off
 *     the turning rim, smouldering scorch marks;
 *   - `drawSevenDecals`   — `drawDecals()`: poison, goo and wet stains.
 *
 * `SPIN` (slide 3's fixed wheel speed) is the live wheel speed of slide 1.
 */
import { TAU, pick, rand } from '../vendor/game-4/src/game/core';
import { K } from '../vendor/game-4/src/game/particles';
import type { Ctx } from '../vendor/game-4/src/game/core';
import type { WeaponId } from '../vendor/game-4/src/game/weapons';
import type { SevenWheelHost } from './setSevenFx';
const PURPLES = ['200,140,255', '255,180,255', '150,100,255', '230,200,255'];
const SMOKERS: Partial<Record<WeaponId, string>> = {
  rpg: '110,106,100',
  bazooka: '120,116,110',
  pirate: '100,96,92',
  cricket: '130,100,170',
  freeze: '200,238,255',
  obliterator: '90,200,70',
  gauntlet: '150,154,160',
  wars: '100,90,86',
};

/** Slide 3's stuck rounds, one frame (from its `update()`). */
export function updateSevenStuck(host: SevenWheelHost, dt: number) {
  const w = host.wheel;
    for (const it of host.stuck) {
      it.t += dt;
      const a = it.angle + w.angle;
      it.world.x = w.x + Math.cos(a) * w.R;
      it.world.y = w.y + w.bumpY + Math.sin(a) * w.R;
      it.up = -a;
      const smk = SMOKERS[it.weapon];
      if (smk && it.t < 7 && !host.wheelGone && Math.random() < dt * 9)
        host.particles.add({ k: K.SMOKE, x: it.world.x + rand(-4, 4), y: it.world.y - 14 + rand(-3, 3), vx: rand(-10, 10), vy: rand(-60, -30), size: 6, size2: 28, life: rand(0.8, 1.3), color: smk, alpha: 0.3, rot: rand(0, TAU), vrot: rand(-1, 1) });
      if (it.weapon === 'gravity' && it.t < 0.5) host.lens(it.world.x, it.world.y, 74 * (1 - it.t / 0.5) + 18, 1.3 * (1 - it.t / 0.5) + 0.15);
      if (it.weapon === 'flame' && !host.wheelGone) {
        const wp = it.world;
        if (Math.random() < dt * 24)
          host.particles.add({ k: K.SMOKE, x: wp.x + rand(-4, 4), y: wp.y - 22 + rand(-4, 4), vx: rand(-10, 10), vy: rand(-60, -30), size: 6, size2: 30, life: rand(0.7, 1.2), color: '70,60,55', alpha: 0.28, rot: rand(0, TAU), vrot: rand(-1, 1) });
        if (Math.random() < dt * 12)
          host.particles.add({ k: K.EMBER, add: true, x: wp.x + rand(-6, 6), y: wp.y - 12, vx: rand(-30, 30), vy: rand(-110, -50), size: rand(1.2, 2.2), life: rand(0.6, 1.1), color: '255,170,60', g: -40 });
      }
      if (it.weapon === 'blackhole') {
        if (it.t < 0.45) host.lens(it.world.x, it.world.y, 66 * (1 - it.t / 0.45) + 16, 1.4 * (1 - it.t / 0.45) + 0.15);
        if (Math.random() < dt * 7) {
          const an = rand(0, TAU);
          const d = rand(18, 30);
          host.particles.add({ k: K.SPARK, add: true, x: it.world.x + Math.cos(an) * d, y: it.world.y + Math.sin(an) * d, target: it.world, pull: 700, size: rand(0.7, 1.4), len: 0.03, life: 0.6, color: pick(PURPLES) });
        }
      }
    }
}

/** Slide 3's decals, one frame (from its `update()`). */
export function updateSevenDecals(host: SevenWheelHost, dt: number) {
  const w = host.wheel;
  const ps = host.particles;
    for (const d of host.decals) {
      d.t += dt;
      if (host.wheelGone) continue;
      if (d.kind === 'wet') {
        d.next -= dt;
        if (d.next <= 0) {
          d.next = d.t < 6 ? rand(0.12, 0.4) : rand(0.8, 2.2);
          const wa = d.angle + rand(-0.06, 0.06) + w.angle;
          const px = w.x + Math.cos(wa) * (w.R + 1);
          const py = w.y + w.bumpY + Math.sin(wa) * (w.R + 1);
          const tv = host.spin * w.R;
          ps.add({ k: K.DROP, x: px, y: py, vx: -Math.sin(wa) * tv + Math.cos(wa) * 40, vy: Math.cos(wa) * tv + Math.sin(wa) * 40, g: 900, size: rand(1.1, 2.1), life: 1.2, color: '150,210,255' });
        }
      } else if (d.kind === 'goo') {
        d.next -= dt;
        if (d.next <= 0) {
          d.next = d.t < 5 ? rand(0.18, 0.5) : rand(1, 2.6);
          const wa = d.angle + rand(-0.05, 0.05) + w.angle;
          const px = w.x + Math.cos(wa) * (w.R + 1);
          const py = w.y + w.bumpY + Math.sin(wa) * (w.R + 1);
          const tv = host.spin * w.R;
          ps.add({ k: K.DROP, x: px, y: py, vx: -Math.sin(wa) * tv + Math.cos(wa) * 30, vy: Math.cos(wa) * tv + Math.sin(wa) * 30, g: 900, size: rand(1.6, 2.8), life: 1.2, color: d.drip ?? '255,226,110', alpha: 1.4, data: d.dripData ?? '190,130,20' });
        }
      } else if (d.kind === 'smolder') {
        if (d.t < 1.8 && Math.random() < dt * 9) {
          const wa = d.angle + w.angle;
          ps.add({ k: K.SMOKE, x: w.x + Math.cos(wa) * d.r, y: w.y + w.bumpY + Math.sin(wa) * d.r, vx: rand(-6, 6), vy: rand(-40, -20), size: 3, size2: 16, life: rand(0.7, 1.1), color: '160,155,150', alpha: 0.35, rot: rand(0, TAU) });
        }
      }
    }
}

/** Slide 3's `drawDecals()`, in wheel space (rotated with the wheel). */
export function drawSevenDecals(host: SevenWheelHost, ctx: Ctx) {
    const R = host.wheel.R;
    for (const d of host.decals) {
      if (d.kind === 'poison') {
        const k = Math.min(1, d.t / 1.6);
        const r = 3 + 11 * Math.sqrt(k);
        const x = Math.cos(d.angle) * (R - 9);
        const y = Math.sin(d.angle) * (R - 9);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(40,110,25,0.5)');
        g.addColorStop(0.6, 'rgba(70,150,40,0.28)');
        g.addColorStop(1, 'rgba(70,150,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      } else if (d.kind === 'goo') {
        const grow = Math.min(1, d.t / 0.2);
        const b = d.blob;
        const n = b.length / 2;
        const blobAt = (sx: number, sy: number, fill: string) => {
          ctx.save();
          ctx.scale(sx * grow + 0.01, sy * grow + 0.01);
          ctx.beginPath();
          ctx.moveTo((b[0] + b[(n - 1) * 2]) / 2, (b[1] + b[(n - 1) * 2 + 1]) / 2);
          for (let i = 0; i < n; i++) {
            const nx = b[((i + 1) % n) * 2];
            const ny = b[((i + 1) % n) * 2 + 1];
            ctx.quadraticCurveTo(b[i * 2], b[i * 2 + 1], (b[i * 2] + nx) / 2, (b[i * 2 + 1] + ny) / 2);
          }
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.restore();
        };
        ctx.save();
        ctx.rotate(d.angle);
        ctx.translate(R - 10, 0);
        const cc = d.c ?? ['rgba(184,120,10,0.9)', 'rgba(255,226,110,0.95)', 'rgba(255,244,190,0.9)'];
        blobAt(18, 14, cc[0]);
        blobAt(16, 12.2, cc[1]);
        blobAt(10, 7.5, cc[2]);
        ctx.fillStyle = `rgba(255,255,255,${(0.75 * grow).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(-4, -4.5, 4.4 * grow, 1.6 * grow, 0.4, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, 3.5, 1.4 * grow, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (d.kind === 'wet') {
        const grow = Math.min(1, d.t / 0.25);
        const dry = Math.max(0.5, 1 - d.t / 30);
        ctx.save();
        ctx.rotate(d.angle);
        ctx.translate(R - 11, 0);
        ctx.save();
        ctx.scale(15 * grow + 0.01, 12 * grow + 0.01);
        ctx.beginPath();
        const b = d.blob;
        const n = b.length / 2;
        ctx.moveTo((b[0] + b[(n - 1) * 2]) / 2, (b[1] + b[(n - 1) * 2 + 1]) / 2);
        for (let i = 0; i < n; i++) {
          const nx = b[((i + 1) % n) * 2];
          const ny = b[((i + 1) % n) * 2 + 1];
          ctx.quadraticCurveTo(b[i * 2], b[i * 2 + 1], (b[i * 2] + nx) / 2, (b[i * 2 + 1] + ny) / 2);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(55,28,10,${(0.4 * dry).toFixed(3)})`;
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = `rgba(255,255,255,${(0.3 * dry * grow).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(-3, -4, 4.5 * grow, 1.4 * grow, 0.4, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 3, 1.3 * grow, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-6, 4.5, 0.9 * grow, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  }
