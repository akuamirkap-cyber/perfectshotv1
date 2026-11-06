/**
 * SET 1 fire and impact recipes of slide 7 (`games/game-4`), lifted verbatim
 * from `Game.fireGolden / fireBlackHole / fireKetapel / fireSumpit /
 * fireShotgun / fireSoaker` and from the `hit()` halves of `projectiles.ts`.
 *
 * Slide 1 keeps its own projectile objects, scoring and collisions; these
 * functions only supply the slide-7 picture and voice, so a gun that exists on
 * both slides fires an indistinguishable shot.
 */
import { TAU } from '../vendor/game-4/src/game/core';
import { K } from '../vendor/game-4/src/game/particles';
import { drawCasing, drawShell, drawWad, makeCracks, strokeLines } from '../vendor/game-4/src/game/art';
import { drawGoldBullet, drawStone } from '../vendor/game-4/src/game/art';
import * as S from '../vendor/game-4/src/game/spawn';
import { pick, rand, randomPoly } from '../vendor/game-4/src/game/core';
import {
  GOLDEN_SCALE,
  SET_ONE_PURPLES,
  SHOTGUN_SCALE,
  SetOneFx,
  pickPurple,
  type SetOneHooks,
  type SetOneShot,
} from './setOneFx';
import type { SetOneId } from './setOneArt';

/** Slide-7 sound ids per weapon (`audio.ts` names, used unchanged). */
export const SET_ONE_SFX: Record<SetOneId, { fire: string; hit: string; extra?: string[] }> = {
  golden: { fire: 'golden_fire', hit: 'golden_hit' },
  blackhole: { fire: 'bh_fire', hit: 'bh_hit', extra: ['bh_charge', 'bh_suck'] },
  ketapel: { fire: 'sling_fire', hit: 'sling_hit' },
  sumpit: { fire: 'sumpit_fire', hit: 'sumpit_hit' },
  shotgun: { fire: 'shotgun_fire', hit: 'shotgun_hit', extra: ['pump'] },
  soaker: { fire: 'soaker_fire', hit: 'splash' },
};

/** Where the shot leaves the muzzle, and how long slide 7 waits to spawn it. */
export interface SetOneSpawn {
  delay: number;
  x: number;
  y: number;
}

/**
 * Slide-7 muzzle recipe. `mx, my` is the gun's muzzle in slide-1 space
 * (slide 7 passes its `GUN_X, GUN_Y`). Returns the projectile spawn.
 */
export function fireSetOne(
  fx: SetOneFx,
  id: SetOneId,
  mx: number,
  my: number,
  hooks: SetOneHooks,
  play: (name: string) => void,
): SetOneSpawn {
  const ps = fx.particles;
  switch (id) {
    case 'golden': {
      // Game.fireGolden
      fx.add(SetOneFx.muzzle(mx, my - 4, 'gold', 0.085));
      fx.add(SetOneFx.light(mx, my - 10, 220, '255,190,80', 0.75, 0.2));
      S.stars(ps, mx, my - 8, 14, '255,220,130', [80, 300], [7, 14], -Math.PI / 2, 0.9);
      S.smoke(ps, mx, my - 10, 6, '235,215,175', [10, 44], { vy: [-90, -40], vx: [-30, 30], alpha: 0.35, life: [0.8, 1.3] });
      S.ring(ps, mx, my - 6, 3, 30, '255,230,160', 2, 0.2, true);
      S.sparks(ps, mx, my - 6, 10, -Math.PI / 2, 0.5, [300, 600], '255,220,140', 1.3, 300);
      fx.at(0.035, () => {
        const ex = mx - 5.5 * GOLDEN_SCALE;
        const ey = my + 87 * GOLDEN_SCALE;
        ps.add({
          k: K.CUSTOM,
          x: ex,
          y: ey,
          vx: rand(-280, -180),
          vy: rand(-300, -190),
          g: 1300,
          rot: 0,
          vrot: rand(-30, -18),
          life: 1.5,
          draw: (c, q) => {
            c.save();
            c.translate(q.x, q.y);
            c.rotate(q.rot);
            drawCasing(c);
            c.restore();
          },
        });
        S.smoke(ps, ex, ey, 2, '220,210,190', [5, 18], { vy: [-40, -15], alpha: 0.3 });
        S.stars(ps, ex, ey, 3, '255,220,130', [30, 90], [6, 10]);
      });
      hooks.shake(4);
      play('golden_fire');
      return { delay: 0, x: mx, y: my - 6 };
    }
    case 'blackhole': {
      // Game.fireBlackHole — a 0.28 s charge, then the orb is released.
      play('bh_charge');
      for (let i = 0; i < 28; i++) {
        const an = rand(0, TAU);
        const d = rand(40, 95);
        ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: { x: mx, y: my }, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pickPurple() });
      }
      for (let i = 0; i < 3; i++) {
        const an = rand(0, TAU);
        fx.add(SetOneFx.lightning(mx + Math.cos(an) * 52, my + Math.sin(an) * 52, mx, my, 0.28, '190,120,255', 1.1, 1, 0.05));
      }
      fx.at(0.28, () => {
        S.ring(ps, mx, my, 6, 84, '190,120,255', 7, 0.42, true);
        S.ring(ps, mx, my, 3, 42, '255,255,255', 3, 0.22, true);
        fx.add(SetOneFx.light(mx, my, 210, '160,80,255', 0.85, 0.32));
        S.sparks(ps, mx, my, 18, -Math.PI / 2, 1.2, [150, 450], '215,165,255', 1.5, 200);
        for (let i = 0; i < 5; i++) {
          const an = -Math.PI / 2 + rand(-1.6, 1.6);
          const L = rand(40, 80);
          fx.add(SetOneFx.lightning(mx, my, mx + Math.cos(an) * L, my + Math.sin(an) * L, 0.16, '200,140,255', 1.3, 1));
        }
        hooks.shake(5);
        play('bh_fire');
      });
      return { delay: 0.28, x: mx, y: my - 4 };
    }
    case 'ketapel': {
      // Game.fireKetapel — the stone leaves (mx, my + 40) at once.
      S.smoke(ps, mx, my, 5, '240,240,250', [6, 26], { vy: [-120, -50], alpha: 0.22, life: [0.4, 0.7] });
      S.ring(ps, mx, my - 2, 4, 32, '255,255,255', 2, 0.25, false, 0.5);
      S.smoke(ps, mx, my + 46, 3, '200,175,140', [5, 18], { vy: [-20, 10], alpha: 0.3 });
      play('sling_fire');
      return { delay: 0, x: mx, y: my + 40 };
    }
    case 'sumpit': {
      // Game.fireSumpit — breath first, dart 0.075 s later.
      play('sumpit_fire');
      fx.at(0.075, () => {
        S.smoke(ps, mx, my - 4, 8, '235,242,255', [5, 28], { vy: [-140, -40], vx: [-50, 50], alpha: 0.32, life: [0.5, 0.9], drag: 3 });
        S.ring(ps, mx, my - 4, 2, 24, '255,255,255', 2, 0.26, false, 0.6);
      });
      return { delay: 0.075, x: mx, y: my - 38 };
    }
    case 'shotgun': {
      // Game.fireShotgun
      fx.add(SetOneFx.muzzle(mx, my - 6, 'shotgun', 0.1));
      fx.add(SetOneFx.light(mx, my - 30, 330, '255,150,60', 0.9, 0.22));
      hooks.flash('255,190,120', 0.16);
      S.smoke(ps, mx, my - 14, 13, '165,165,170', [14, 74], { vy: [-150, -50], vx: [-45, 45], alpha: 0.5, life: [1.1, 1.8], drag: 1.7 });
      S.embers(ps, mx, my - 8, 16, -Math.PI / 2, 0.38, [300, 760]);
      ps.add({
        k: K.CUSTOM,
        x: mx,
        y: my - 10,
        vx: rand(-40, 40),
        vy: -780,
        g: 700,
        drag: 4.2,
        rot: 0,
        vrot: rand(-22, 22),
        life: 1.3,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          drawWad(c);
          c.restore();
        },
      });
      hooks.shake(10);
      play('shotgun_fire');
      fx.at(0.17, () => play('pump'));
      fx.at(0.28, () => {
        const ex = mx - 2.5 * SHOTGUN_SCALE;
        const ey = my + 146 * SHOTGUN_SCALE;
        ps.add({
          k: K.CUSTOM,
          x: ex,
          y: ey,
          vx: rand(-330, -230),
          vy: rand(-340, -240),
          g: 1400,
          rot: 0,
          vrot: rand(-26, -14),
          life: 1.6,
          draw: (c, q) => {
            c.save();
            c.translate(q.x, q.y);
            c.rotate(q.rot);
            drawShell(c);
            c.restore();
          },
        });
        S.smoke(ps, ex, ey, 3, '170,170,175', [5, 22], { vy: [-60, -20], alpha: 0.35 });
      });
      return { delay: 0, x: mx, y: my - 8 };
    }
    case 'soaker':
    default: {
      // Game.fireSoaker
      S.droplets(ps, mx, my - 4, 16, -Math.PI / 2, 0.26, [300, 650], [0.7, 1.5], '170,220,255', 500);
      S.smoke(ps, mx, my - 8, 5, '220,240,255', [6, 28], { vy: [-120, -40], alpha: 0.26, life: [0.4, 0.8] });
      play('soaker_fire');
      return { delay: 0, x: mx, y: my - 2 };
    }
  }
}

/**
 * The particle/FX half of slide 7's `hit()`. `theta` is the impact angle in the
 * target's own (rotated) frame, exactly what `projectiles.ts` receives.
 */
export function impactSetOne(
  fx: SetOneFx,
  shot: SetOneShot,
  hx: number,
  hy: number,
  theta: number,
  hooks: SetOneHooks,
  play: (name: string) => void,
) {
  const ps = fx.particles;
  const { R } = hooks.wheel();
  const lx = Math.cos(theta) * R;
  const ly = Math.sin(theta) * R;
  switch (shot.id) {
    case 'golden': {
      // GoldenBullet.hit
      hooks.hitStop(0.05);
      hooks.shake(5);
      fx.add(SetOneFx.streak(hx, hy, Math.min(hy + 160, shot.startY), 3.6, '255,200,80', 0.18));
      fx.add(SetOneFx.light(hx, hy, 190, '255,190,70', 0.7, 0.32));
      fx.add(SetOneFx.rays(hx, hy, '255,210,100', 0.5, 16, Math.PI / 2, Math.PI * 0.8));
      S.glow(ps, hx, hy, 100, 20, '255,240,200', 0.22, 1);
      S.ring(ps, hx, hy, 6, 80, '255,215,120', 5, 0.4, true);
      S.ring(ps, hx, hy, 4, 44, '255,255,255', 3, 0.24, true);
      S.sparks(ps, hx, hy, 34, Math.PI / 2, 1.45, [260, 720], '255,215,120', 1.8);
      S.sparks(ps, hx, hy, 10, Math.PI / 2, 1.2, [400, 800], '255,255,240', 1.2);
      S.stars(ps, hx, hy, 16, '255,220,130', [80, 280], [9, 18], Math.PI / 2, 1.6);
      for (let i = 0; i < 12; i++) {
        ps.add({ k: K.FLAKE, x: hx + rand(-4, 4), y: hy, vx: rand(-170, 170), vy: rand(-140, 130), g: 150, drag: 2.6, size: rand(1.6, 3.2), life: rand(1.1, 1.9), rot: rand(0, TAU), vrot: rand(-5, 5) });
      }
      S.chips(ps, hx, hy, 10, Math.PI / 2, 1.4, [120, 380]);
      S.smoke(ps, hx, hy, 5, '255,226,170', [10, 40], { vy: [-20, 30], alpha: 0.35, life: [0.6, 1] });
      const cracks = makeCracks(theta, R, 6, [10, 26]);
      hooks.paintWheel((c) => {
        const rg = c.createRadialGradient(lx * 0.93, ly * 0.93, 0, lx * 0.93, ly * 0.93, 17);
        rg.addColorStop(0, 'rgba(40,18,4,0.78)');
        rg.addColorStop(0.5, 'rgba(70,32,8,0.36)');
        rg.addColorStop(1, 'rgba(70,32,8,0)');
        c.fillStyle = rg;
        c.beginPath();
        c.arc(lx * 0.93, ly * 0.93, 17, 0, TAU);
        c.fill();
        strokeLines(c, cracks, 'rgba(255,220,170,0.25)', 0.6, 0.5, 0.5);
        strokeLines(c, cracks, 'rgba(40,18,6,0.85)', 1.1);
      });
      hooks.addWheelFx(SetOneFx.glowLines(cracks, '255,190,60', 1.3, 1.5));
      hooks.addWheelFx(SetOneFx.glowSpot(lx * 0.95, ly * 0.95, 46, '255,170,50', 1.3, 0.85));
      play('golden_hit');
      break;
    }
    case 'blackhole': {
      // BlackHoleShot.hit — implosion, then a delayed collapse.
      hooks.shake(3);
      play('bh_suck');
      for (let i = 0; i < 40; i++) {
        const a = rand(0, TAU);
        const d = rand(40, 120);
        const onWood = i % 2 === 0;
        const sx = onWood ? hx + Math.cos(theta + Math.PI + rand(-1.2, 1.2)) * rand(15, 80) : hx + Math.cos(a) * d;
        const sy = onWood ? hy + Math.sin(theta + Math.PI + rand(-1.2, 1.2)) * rand(15, 80) : hy + Math.sin(a) * d;
        if (onWood) {
          ps.add({ k: K.CHIP, x: sx, y: sy - rand(0, 60), target: { x: hx, y: hy }, pull: 2600, rot: rand(0, TAU), vrot: rand(-20, 20), poly: randomPoly(4, rand(1.4, 3), 0.5), color: pick(['196,140,80', '222,178,118', '170,112,58']), life: 0.6 });
        } else {
          ps.add({ k: K.SPARK, add: true, x: sx, y: sy, target: { x: hx, y: hy }, pull: 2800, size: rand(1, 2.2), len: 0.025, life: 0.6, color: pickPurple() });
        }
      }
      fx.at(0.32, () => {
        const w = hooks.wheel();
        const out = Math.atan2(hy - w.y, hx - w.x);
        hooks.hitStop(0.09);
        hooks.shake(12);
        hooks.flash('190,120,255', 0.28);
        fx.add(SetOneFx.light(hx, hy, 280, '170,90,255', 0.95, 0.5));
        S.glow(ps, hx, hy, 170, 30, '235,200,255', 0.3, 1);
        S.ring(ps, hx, hy, 8, 170, '190,120,255', 12, 0.55, true);
        S.ring(ps, hx, hy, 4, 100, '255,255,255', 4, 0.32, true);
        S.ring(ps, hx, hy, 2, 60, '120,60,255', 6, 0.25, true);
        S.sparks(ps, hx, hy, 38, out, 1.7, [220, 680], '215,165,255', 1.8);
        S.sparks(ps, hx, hy, 14, out, 1.4, [300, 700], '140,220,255', 1.3);
        S.chips(ps, hx, hy, 18, out, 1.5, [150, 440]);
        S.smoke(ps, hx, hy, 10, '50,15,95', [16, 70], { vx: [-80, 80], vy: [-80, 60], alpha: 0.65, life: [0.7, 1.2], drag: 2.5 });
        for (let i = 0; i < 7; i++) {
          const a2 = theta + Math.PI + rand(-1.05, 1.05);
          const d = rand(45, 110);
          hooks.addWheelFx(SetOneFx.lightning(lx * 0.98, ly * 0.98, lx + Math.cos(a2) * d, ly + Math.sin(a2) * d, rand(0.28, 0.5), '190,120,255', 1.6, 2, 0.04));
        }
        for (let i = 0; i < 4; i++) {
          const a = out + rand(-1.25, 1.25);
          const L = rand(50, 95);
          fx.add(SetOneFx.lightning(hx, hy, hx + Math.cos(a) * L, hy + Math.sin(a) * L, 0.24, '200,140,255', 1.4, 1));
        }
        hooks.paintWheel((c) => {
          const cx = lx * 0.95;
          const cy = ly * 0.95;
          const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 24);
          rg.addColorStop(0, 'rgba(10,0,20,0.92)');
          rg.addColorStop(0.45, 'rgba(45,12,70,0.5)');
          rg.addColorStop(1, 'rgba(60,20,90,0)');
          c.fillStyle = rg;
          c.beginPath();
          c.arc(cx, cy, 24, 0, TAU);
          c.fill();
          c.strokeStyle = 'rgba(25,8,40,0.55)';
          c.lineWidth = 0.9;
          for (let i = 0; i < 22; i++) {
            const a = (i / 22) * TAU + rand(-0.1, 0.1);
            const r0 = rand(7, 10);
            const r1 = rand(18, 30);
            c.beginPath();
            c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
            c.quadraticCurveTo(cx + Math.cos(a + 0.35) * (r0 + r1) * 0.5, cy + Math.sin(a + 0.35) * (r0 + r1) * 0.5, cx + Math.cos(a + 0.6) * r0, cy + Math.sin(a + 0.6) * r0);
            c.stroke();
          }
          c.strokeStyle = 'rgba(160,90,240,0.3)';
          c.lineWidth = 1.5;
          c.beginPath();
          c.arc(cx, cy, 13, 0, TAU);
          c.stroke();
        });
        hooks.addWheelFx(SetOneFx.glowSpot(lx * 0.95, ly * 0.95, 80, '170,90,255', 2.2, 0.9));
        play('bh_hit');
      });
      break;
    }
    case 'ketapel': {
      // StoneShot.hit
      hooks.hitStop(0.035);
      hooks.shake(6);
      S.smoke(ps, hx, hy, 10, '195,165,125', [10, 50], { vx: [-110, 110], vy: [-30, 70], alpha: 0.55, life: [0.7, 1.2], drag: 2.6 });
      S.splinters(ps, hx, hy, 16, Math.PI / 2, 1.55, [160, 470]);
      S.chips(ps, hx, hy, 7, Math.PI / 2, 1.3, [100, 300], ['150,145,138', '110,105,98', '190,185,175']);
      S.ring(ps, hx, hy, 4, 52, '235,215,175', 4, 0.36, false, 0.55);
      const cracks = makeCracks(theta, R, 7, [12, 30], 1.35);
      hooks.paintWheel((c) => {
        const rg = c.createRadialGradient(lx * 0.95, ly * 0.95, 0, lx * 0.95, ly * 0.95, 11);
        rg.addColorStop(0, 'rgba(50,25,8,0.6)');
        rg.addColorStop(1, 'rgba(50,25,8,0)');
        c.fillStyle = rg;
        c.beginPath();
        c.arc(lx * 0.95, ly * 0.95, 11, 0, TAU);
        c.fill();
        strokeLines(c, cracks, 'rgba(255,225,180,0.3)', 0.6, 0.5, 0.5);
        strokeLines(c, cracks, 'rgba(35,16,5,0.9)', 1.15);
      });
      play('sling_hit');
      break;
    }
    case 'sumpit': {
      // DartShot.hit
      hooks.shake(2);
      S.splinters(ps, hx, hy, 7, Math.PI / 2, 1.4, [100, 300]);
      S.smoke(ps, hx, hy, 7, '110,225,80', [8, 40], { vx: [-50, 50], vy: [-40, 30], alpha: 0.38, life: [1, 1.6], drag: 2 });
      S.droplets(ps, hx, hy, 6, Math.PI / 2, 1.3, [60, 170], [0.9, 1.6], '120,230,90', 700);
      S.glow(ps, hx, hy, 46, 12, '140,255,120', 0.4, 0.55);
      hooks.paintWheel((c) => {
        c.strokeStyle = 'rgba(40,18,6,0.8)';
        c.lineWidth = 0.9;
        c.beginPath();
        c.moveTo(lx * 0.99, ly * 0.99);
        c.lineTo(lx * 0.9 + rand(-1, 1), ly * 0.9 + rand(-1, 1));
        c.stroke();
      });
      play('sumpit_hit');
      break;
    }
    case 'shotgun': {
      // ShotgunBlast.hit + pelletImpact, fanned around the impact point.
      hooks.hitStop(0.06);
      hooks.shake(7);
      S.chips(ps, hx, hy, 20, Math.PI / 2, 1.5, [150, 500]);
      S.splinters(ps, hx, hy, 12, Math.PI / 2, 1.5, [200, 520]);
      S.smoke(ps, hx, hy, 7, '150,130,115', [10, 50], { vx: [-90, 90], vy: [-20, 60], alpha: 0.5, life: [0.8, 1.3] });
      for (let i = 0; i < 9; i++) {
        const out = -Math.PI / 2 + (i - 4) * 0.16;
        S.sparks(ps, hx + rand(-10, 10), hy + rand(-8, 8), 3, out, 0.8, [150, 400], '255,190,90', 1.2);
      }
      hooks.paintWheel((c) => {
        for (let i = 0; i < 9; i++) {
          const a = theta + rand(-0.11, 0.11);
          const rr = R - rand(3, 9);
          const px = Math.cos(a) * rr;
          const py = Math.sin(a) * rr;
          const rg = c.createRadialGradient(px, py, 0, px, py, 6);
          rg.addColorStop(0, 'rgba(25,10,2,0.7)');
          rg.addColorStop(1, 'rgba(25,10,2,0)');
          c.fillStyle = rg;
          c.beginPath();
          c.arc(px, py, 6, 0, TAU);
          c.fill();
          c.strokeStyle = 'rgba(255,230,190,0.5)';
          c.lineWidth = 0.6;
          for (let k = 0; k < 6; k++) {
            const aa = rand(0, TAU);
            c.beginPath();
            c.moveTo(px + Math.cos(aa) * 1.8, py + Math.sin(aa) * 1.8);
            c.lineTo(px + Math.cos(aa) * rand(3, 4.4), py + Math.sin(aa) * rand(3, 4.4));
            c.stroke();
          }
        }
      });
      hooks.addWheelFx(SetOneFx.glowSpot(lx, ly, 15, '255,130,30', 1.7, 0.95));
      play('shotgun_hit');
      break;
    }
    case 'soaker':
    default: {
      // WaterJet splash (update() once the stream reaches the wheel).
      hooks.shake(3);
      S.droplets(ps, hx - 3, hy, 2, Math.PI - 0.25, 0.4, [180, 360], [1.2, 2.8]);
      S.droplets(ps, hx + 3, hy, 2, 0.25, 0.4, [180, 360], [1.2, 2.8]);
      S.droplets(ps, hx, hy, 2, Math.PI / 2, 1.3, [100, 300], [1, 2.4]);
      S.droplets(ps, hx, hy, 14, Math.PI / 2, 1.35, [120, 420], [1.2, 3.2]);
      fx.add(SetOneFx.splash(hx, hy, Math.PI / 2, 52, 0.24));
      S.smoke(ps, hx, hy, 7, '215,238,255', [10, 54], { vx: [-90, 90], vy: [-10, 50], alpha: 0.32, life: [0.6, 1] });
      S.ring(ps, hx, hy, 4, 46, '210,240,255', 3, 0.36, false, 0.8);
      S.glow(ps, hx, hy, 50, 10, '170,225,255', 0.2, 0.6);
      play('splash');
      break;
    }
  }
}

/** Slide-7's `landed()` keeps a bullet in the target; slide 1 has its own. */
export const SET_ONE_STICK = {
  golden: { half: 0.065, protrude: 13, front: false },
  blackhole: { half: 0.1, protrude: 9, front: true },
  ketapel: { half: 0.08, protrude: 10, front: false },
  sumpit: { half: 0.055, protrude: 22, front: false },
  shotgun: { half: 0.13, protrude: 0, front: false },
  soaker: { half: 0.085, protrude: 0, front: false },
} as const satisfies Record<SetOneId, { half: number; protrude: number; front: boolean }>;

export { drawGoldBullet, drawStone, SET_ONE_PURPLES };
