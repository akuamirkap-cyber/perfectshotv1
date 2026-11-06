/**
 * Slide-3 weapon animation and idle ambience of SET 1..7, copied verbatim from
 * `games/game-4/src/game/Game.ts` by `scripts/gen-set-seven.py`.
 *
 * `updateSevenAnim` integrates the same springs slide 7 does (recoil, slide,
 * pump, bolt, heat, spin, charge, orb, pouch, tassel, gauge, fuse, fan) and then
 * spawns the same idle particles for the selected weapon — the snow drifting off
 * the SNOWBALL CANNON, the embers of the FLAMETHROWER, the dripping honey, the
 * storm's little lightning bolts, and so on. That is what makes the gun look
 * alive on slide 1 exactly as it does on slide 7.
 */
import { TAU, easeOutCubic, pick, rand } from '../vendor/game-4/src/game/core';
import { K, Lightning, flame } from '../vendor/game-4/src/game/particles';
import { PAINT } from '../vendor/game-4/src/game/shapes5';
import * as S from '../vendor/game-4/src/game/spawn7';
import type { SevenHost } from './setSevenFx';
const PURPLES = ['200,140,255', '255,180,255', '150,100,255', '230,200,255'];

/** Slide-7 frame update: springs first, then the idle ambience. */
export function updateSevenAnim(host: SevenHost, dt: number) {
    // weapon animation state
    const a = host.anim;
    a.intro = Math.min(1, a.intro + dt / 0.45);
    a.fireT += dt;
    a.recoilV += (-260 * a.recoil - 20 * a.recoilV) * dt;
    a.recoil += a.recoilV * dt;
    const ft = a.fireT;
    a.slide = ft < 0.035 ? ft / 0.035 : Math.max(0, 1 - (ft - 0.035) / 0.09);
    if (a.pumpStart >= 0) {
      const tp = host.time - a.pumpStart;
      let v = 0;
      if (tp < 0.12) v = easeOutCubic(tp / 0.12);
      else if (tp < 0.27) v = 1 - easeOutCubic((tp - 0.12) / 0.15);
      else a.pumpStart = -1;
      if (host.weaponId === 'shotgun') a.pump = v;
      else a.pumpS = v;
    }
    if (a.charging) a.charge = Math.min(1, a.charge + dt / 0.28);
    a.orb = Math.min(1, a.orb + dt * 2.2);
    const kS = a.loaded ? 160 : 900;
    const cS = a.loaded ? 20 : 10;
    a.pouchV += (-kS * (a.pouchY - a.pouchTarget) - cS * a.pouchV) * dt;
    a.pouchY += a.pouchV * dt;
    a.bandWob *= Math.exp(-6 * dt);
    if (a.pulse >= 0) {
      a.pulse += dt / 0.075;
      if (a.pulse > 1) a.pulse = -1;
    }
    a.tasselV += (-28 * a.tassel - 2.4 * a.tasselV) * dt;
    a.tassel += a.tasselV * dt;
    a.slosh *= Math.exp(-1.4 * dt);
    a.gauge += (0.92 - a.gauge) * Math.min(1, dt * 2.2);

    if (a.boltStart >= 0) {
      const tb = host.time - a.boltStart;
      let lift = 0;
      let back = 0;
      if (tb < 0.12) lift = tb / 0.12;
      else if (tb < 0.3) {
        lift = 1;
        back = easeOutCubic((tb - 0.12) / 0.18);
      } else if (tb < 0.4) {
        lift = 1;
        back = 1;
      } else if (tb < 0.58) {
        lift = 1;
        back = 1 - easeOutCubic((tb - 0.4) / 0.18);
      } else if (tb < 0.7) lift = 1 - (tb - 0.58) / 0.12;
      else a.boltStart = -1;
      a.bolt = back;
      a.lift = lift;
    } else {
      a.bolt = 0;
      a.lift = 0;
    }
    a.fuse = Math.max(0, a.fuse - dt);
    a.fan += dt * (a.fireT < 0.7 ? 28 : 3);
    a.spin += a.spinV * dt;
    a.spinV *= Math.exp(-2.4 * dt);
    a.heat *= Math.exp(-0.9 * dt);

    // idle weapon ambience
    const mx = host.gunX;
    const my = host.gunY + (1 - easeOutCubic(a.intro)) * 170;
    const ps = host.particles;
    switch (host.weaponId) {
      case 'golden':
        if (Math.random() < dt * 4.5) {
          const onGrip = Math.random() < 0.3;
          ps.add({ k: K.STAR, add: true, x: onGrip ? mx + rand(18, 66) : mx + rand(-11, 9), y: onGrip ? my + rand(96, 134) : my + rand(4, 118), size: rand(8, 15), life: rand(0.45, 0.8), color: '255,230,150', vrot: rand(-1, 1) });
        }
        if (a.fireT < 1 && Math.random() < dt * 16 * (1 - a.fireT))
          ps.add({ k: K.SMOKE, x: mx + rand(-1.5, 1.5), y: my - 2, vx: rand(-6, 6), vy: rand(-45, -25), size: 3, size2: 16, life: rand(0.7, 1.1), color: '230,220,200', alpha: 0.28, rot: rand(0, TAU), vrot: rand(-1, 1) });
        break;

      case 'blackhole':
        if (Math.random() < dt * 10) {
          const an = rand(0, TAU);
          const d = rand(26, 46);
          host.orbTarget.x = mx;
          host.orbTarget.y = my;
          ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: host.orbTarget, pull: 900, size: rand(0.8, 1.6), len: 0.03, life: 0.8, color: pick(PURPLES) });
        }
        break;

      case 'shotgun':
        if (a.fireT < 1.8 && Math.random() < dt * 24 * (1 - a.fireT / 1.8))
          ps.add({ k: K.SMOKE, x: mx + rand(-2, 2), y: my - 4, vx: rand(-8, 8), vy: rand(-55, -25), size: 4, size2: 24, life: rand(0.8, 1.3), color: '175,175,180', alpha: 0.32, rot: rand(0, TAU), vrot: rand(-1, 1) });
        break;

      case 'soaker':
        if (Math.random() < dt * 0.9) ps.add({ k: K.DROP, x: mx + rand(-1, 1), y: my + 2, vy: 30, g: 900, size: rand(1.2, 1.8), life: 1, color: '150,210,255' });
        break;

      case 'snowball':
        if (Math.random() < dt * 6) S.snowflakes(ps, mx + rand(-16, 16), my + rand(0, 60), 1, -Math.PI / 2, 1.2, [10, 40]);
        if (Math.random() < dt * 2.5) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 12), y: my + rand(0, 110), size: rand(7, 13), life: rand(0.45, 0.8), color: '200,235,255', vrot: rand(-1, 1) });
        break;

      case 'flame':
        if (Math.random() < dt * 6) ps.add({ k: K.EMBER, add: true, x: mx + rand(-3, 3), y: my - 6, vx: rand(-20, 20), vy: rand(-90, -40), size: rand(1.2, 2), life: rand(0.5, 0.9), color: '255,170,60', g: -60 });
        if (Math.random() < dt * 4) ps.add({ k: K.SMOKE, x: mx + rand(-2, 2), y: my - 14, vx: rand(-8, 8), vy: rand(-50, -25), size: 3, size2: 14, life: rand(0.7, 1.1), color: '110,100,95', alpha: 0.2, rot: rand(0, TAU) });
        break;

      case 'bubble':
        if (Math.random() < dt * 1.6) S.miniBubble(ps, mx + rand(-8, 8), my - 8, rand(-14, 14), rand(-60, -30), rand(2.5, 6), rand(1.2, 2));
        break;

      case 'bamboo':
        if (Math.random() < dt * 6) ps.add({ k: K.SMOKE, x: mx - 50 + rand(-2, 2), y: my + 114 + rand(-2, 2), vx: rand(-6, 6), vy: rand(-40, -20), size: 3, size2: 14, life: rand(0.8, 1.2), color: '200,195,185', alpha: 0.2, rot: rand(0, TAU) });
        if (a.fireT < 2.4 && Math.random() < dt * 22 * (1 - a.fireT / 2.4)) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my - 4, vx: rand(-14, 14), vy: rand(-60, -25), size: 6, size2: 30, life: rand(0.9, 1.4), color: '120,112,104', alpha: 0.32, rot: rand(0, TAU), vrot: rand(-1, 1) });
        break;

      case 'banana':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-16, 16), y: my + rand(10, 120), size: rand(7, 13), life: rand(0.45, 0.8), color: '255,235,120', vrot: rand(-1, 1) });
        break;

      case 'harpoon':
        if (Math.random() < dt * 3) ps.add({ k: K.STAR, add: true, x: mx + rand(-6, 6), y: my + rand(30, 130), size: rand(6, 11), life: rand(0.4, 0.7), color: '130,255,235', vrot: rand(-1, 1) });
        break;

      case 'chicken':
        if (Math.random() < dt * 0.9) S.feathers(ps, mx + rand(-6, 6), my - 6, 1, -Math.PI / 2, 1, [20, 60]);
        break;

      case 'confetti':
        if (Math.random() < dt * 4) S.confetti(ps, mx + rand(-8, 8), my - 8, 1, -Math.PI / 2, 0.9, [40, 130], [3, 5], [1.1, 1.9]);
        break;

      case 'seed':
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-8, 8), y: my - 6, vx: rand(-20, 20), vy: rand(-60, -25), size: 1.6, life: rand(0.6, 1.1), color: Math.random() < 0.5 ? '255,235,120' : '150,255,120', g: -20 });
        if (Math.random() < dt * 0.8) S.leaves(ps, mx + rand(-20, 20), my + rand(0, 40), 1, -Math.PI / 2, 1.2, [20, 50]);
        break;

      case 'pizza':
        if (Math.random() < dt * 7) ps.add({ k: K.SMOKE, x: mx + rand(-3, 3), y: my - 6, vx: rand(-10, 10), vy: rand(-60, -30), size: 4, size2: 20, life: rand(0.8, 1.2), color: '255,250,240', alpha: 0.22, rot: rand(0, TAU) });
        break;

      case 'minigun':
        if (a.heat > 0.25 && Math.random() < dt * 30 * a.heat) ps.add({ k: K.SMOKE, x: mx + rand(-14, 14), y: my - 4, vx: rand(-14, 14), vy: rand(-70, -30), size: 5, size2: 26, life: rand(0.7, 1.2), color: '150,148,145', alpha: 0.26, rot: rand(0, TAU) });
        break;

      case 'plasma':
        if (Math.random() < dt * 8) S.sparks(ps, mx, my - 6, 1, -Math.PI / 2, 1.4, [30, 110], '140,255,190', 1.2, -60, 0.03);
        break;

      case 'laser':
        if (Math.random() < dt * 5) ps.add({ k: K.STAR, add: true, x: mx + rand(-6, 6), y: my + rand(-10, 10), size: rand(6, 11), life: rand(0.3, 0.55), color: '255,150,150', vrot: rand(-1, 1) });
        break;

      case 'dragon':
        if (Math.random() < dt * 6) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my - 2, vx: rand(-14, 14), vy: rand(-70, -30), size: 5, size2: 26, life: rand(0.8, 1.3), color: '70,60,56', alpha: 0.3, rot: rand(0, TAU), vrot: rand(-1, 1) });
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-9, 9), y: my, vx: rand(-20, 20), vy: rand(-90, -40), size: rand(1.2, 2.2), life: rand(0.5, 0.9), color: '255,170,60', g: -40 });
        break;

      case 'gravity':
        if (Math.random() < dt * 10) {
          const an = rand(0, TAU);
          const d = rand(26, 46);
          host.orbTarget.x = mx;
          host.orbTarget.y = my - 10;
          ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 10 + Math.sin(an) * d, target: host.orbTarget, pull: 900, size: rand(0.8, 1.6), len: 0.03, life: 0.8, color: pick(['120,200,255', '200,240,255']) });
        }
        break;

      case 'honey':
        if (Math.random() < dt * 5) S.hexes(ps, mx + rand(-14, 14), my + rand(30, 160), 1, -Math.PI / 2, 0.6, [10, 40]);
        if (Math.random() < dt * 1.4) ps.add({ k: K.DROP, x: mx + rand(-1, 1), y: my + 20, vy: 40, g: 900, size: rand(1.2, 1.8), life: 1, color: '255,184,30', alpha: 1.4, data: '150,80,0' });
        break;

      case 'coconut':
        if (Math.random() < dt * 1.2) S.petals(ps, mx - 24, my + 160, 1, -Math.PI / 2, 1.2, [10, 50], [1.4, 2.2], 40);
        break;

      case 'angklung':
        if (Math.random() < dt * 1.6) S.notes(ps, mx + rand(-30, 30), my + 4, 1, -Math.PI / 2, 0.5, [30, 70]);
        break;

      case 'bee':
        if (Math.random() < dt * 0.8) S.bees(ps, mx + 8, my + 140, 1, -Math.PI / 2, 1.2, [60, 150]);
        break;

      case 'sakura':
        if (Math.random() < dt * 2.5) S.petals(ps, mx + rand(-30, 40), my + rand(-4, 40), 1, -Math.PI / 2, 1.2, [10, 40], [1.6, 2.6], 30);
        break;

      case 'firework':
        if (Math.random() < dt * 14) ps.add({ k: K.SPARK, add: true, x: mx + 31, y: my + 24, vx: rand(-60, 60), vy: rand(-120, -30), g: 300, drag: 1.6, size: 1.2, len: 0.03, life: rand(0.3, 0.6), color: '255,210,110' });
        break;

      case 'keris':
        if (Math.random() < dt * 9) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 14), y: my + rand(0, 160), vx: rand(-10, 10), vy: rand(-50, -15), size: rand(6, 11), life: rand(0.5, 0.9), color: '255,230,150', vrot: rand(-1, 1) });
        if (Math.random() < dt * 8) ps.add({ k: K.EMBER, add: true, x: mx + rand(-10, 10), y: my + rand(20, 150), vx: rand(-14, 14), vy: rand(-60, -25), size: 1.6, life: rand(0.6, 1.1), color: '255,215,110', g: -30 });
        break;

      case 'moonbeam':
        if (Math.random() < dt * 6) S.moonDust(ps, mx + rand(-14, 14), my + rand(-10, 20), 1, -Math.PI / 2, 1, [10, 40]);
        break;

      case 'storm':
        if (Math.random() < dt * 3) host.addFX(new Lightning(mx - 20, my - 25, mx + 20, my - 25, 0.08, '150,210,255', 1, 0, 0.03));
        if (Math.random() < dt * 8) S.sparks(ps, mx + rand(-20, 20), my - 22, 1, -Math.PI / 2, 1.4, [30, 120], '170,220,255', 1.1, 100);
        break;

      case 'paintball':
        if (Math.random() < dt * 0.9) ps.add({ k: K.DROP, x: mx + rand(-1, 1), y: my + 4, vy: 40, g: 900, size: rand(1.2, 1.8), life: 1, color: PAINT[a.idx % PAINT.length].rgb, alpha: 1.4, data: PAINT[a.idx % PAINT.length].lo });
        break;

      case 'wand':
        if (Math.random() < dt * 7) S.stars(ps, mx + rand(-26, 26), my + rand(-24, 24), 1, pick(['255,170,235', '255,230,130', '200,150,255']), [10, 40], [6, 11], -Math.PI / 2, 1);
        break;

      case 'shark':
        if (Math.random() < dt * 2) S.droplets(ps, mx + rand(-20, 20), my + 30, 1, Math.PI / 2, 0.3, [20, 60], [1.2, 2], '170,225,255');
        break;

      case 'ghost':
        if (Math.random() < dt * 4) S.ghostWisps(ps, mx + rand(-14, 14), my + rand(0, 40), 1, -Math.PI / 2, 0.6, [20, 60]);
        break;

      case 'ufo':
        if (Math.random() < dt * 7) ps.add({ k: K.STAR, add: true, x: mx + rand(-24, 24), y: my + rand(0, 34), vx: rand(-10, 10), vy: rand(-40, -10), size: rand(6, 11), life: rand(0.4, 0.8), color: pick(['150,255,180', '220,255,230']), vrot: rand(-1, 1) });
        break;

      case 'rainbow':
        if (Math.random() < dt * 4) S.rainbowSparks(ps, mx + rand(-30, 30), my + rand(-20, 30), 1, -Math.PI / 2, 1, [10, 50]);
        break;

      case 'meteor':
        if (Math.random() < dt * 8) ps.add({ k: K.EMBER, add: true, x: mx + rand(-24, 24), y: my + 34, vx: rand(-20, 20), vy: rand(-110, -40), size: rand(1.4, 2.4), life: rand(0.5, 1), color: '255,160,50', g: -30 });
        if (Math.random() < dt * 5) ps.add({ k: K.SMOKE, x: mx + rand(-20, 20), y: my + 30, vx: rand(-10, 10), vy: rand(-60, -25), size: 6, size2: 26, life: rand(0.8, 1.3), color: '70,60,56', alpha: 0.28, rot: rand(0, TAU) });
        break;

      case 'diamond':
        if (Math.random() < dt * 6) ps.add({ k: K.STAR, add: true, x: mx + rand(-24, 24), y: my + rand(0, 200), size: rand(7, 13), life: rand(0.4, 0.7), color: pick(['235,252,255', '170,230,255']), vrot: rand(-1, 1) });
        break;

      case 'fish':
        if (Math.random() < dt * 2.4) S.miniBubble(ps, mx + rand(-6, 6), my - 22, rand(-14, 14), rand(-60, -30), rand(2.4, 5), rand(0.9, 1.6));
        break;

      case 'rpg':
        if (a.fireT < 2.2 && Math.random() < dt * 20 * (1 - a.fireT / 2.2)) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my + 28, vx: rand(-14, 14), vy: rand(-60, -25), size: 5, size2: 28, life: rand(0.9, 1.4), color: '150,148,145', alpha: 0.3, rot: rand(0, TAU) });
        break;

      case 'cricket':
        if (Math.random() < dt * 4) S.sparks(ps, mx + 36, my + 3, 1, -Math.PI / 2, 1.4, [30, 100], '210,150,255', 1.2, 60, 0.03);
        break;

      case 'electro':
        if (Math.random() < dt * 5) host.addFX(new Lightning(mx - 16, my - 14, mx + 16, my - 14, 0.08, '130,205,255', 1, 0, 0.03));
        break;

      case 'bazooka':
        if (a.fireT < 2.6 && Math.random() < dt * 22 * (1 - a.fireT / 2.6)) ps.add({ k: K.SMOKE, x: mx + rand(-10, 10), y: my + 24, vx: rand(-14, 14), vy: rand(-60, -25), size: 6, size2: 30, life: rand(1, 1.5), color: '170,170,172', alpha: 0.3, rot: rand(0, TAU) });
        break;

      case 'freeze':
        if (Math.random() < dt * 7) ps.add({ k: K.SMOKE, x: mx + rand(-16, 16), y: my + 6, vx: rand(-14, 14), vy: rand(10, 36), size: 6, size2: 26, life: rand(0.8, 1.3), color: '200,238,255', alpha: 0.28, rot: rand(0, TAU) });
        if (Math.random() < dt * 3) S.snowflakes(ps, mx + rand(-20, 20), my - 10, 1, -Math.PI / 2, 1.2, [10, 40]);
        break;

      case 'rail':
        if (Math.random() < dt * 8) S.sparks(ps, mx + rand(-12, 12), my + rand(0, 160), 1, rand(0, TAU), 0.3, [20, 80], '150,190,255', 1.1, 0, 0.03);
        break;

      case 'magnet':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-30, 30), my + rand(-8, 10), 1, -Math.PI / 2, 1.2, [20, 80], Math.random() < 0.5 ? '255,110,110' : '130,170,255', 1.1, 0, 0.03);
        break;

      case 'shrink':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-20, 20), my + rand(0, 120), 1, -Math.PI / 2, 1.2, [20, 70], '70,255,140', 1.1, 0, 0.03);
        break;

      case 'grow':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-20, 20), my + rand(0, 120), 1, -Math.PI / 2, 1.2, [20, 70], '255,160,50', 1.1, 0, 0.03);
        break;

      case 'pirate':
        if (Math.random() < dt * 7) ps.add({ k: K.SMOKE, x: mx + 36, y: my + 16, vx: rand(-8, 8), vy: rand(-50, -25), size: 3, size2: 14, life: rand(0.8, 1.2), color: '190,185,175', alpha: 0.22, rot: rand(0, TAU) });
        if (a.fireT < 2 && Math.random() < dt * 18 * (1 - a.fireT / 2)) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my + 6, vx: rand(-12, 12), vy: rand(-60, -25), size: 6, size2: 30, life: rand(0.9, 1.4), color: '120,116,112', alpha: 0.3, rot: rand(0, TAU) });
        break;

      case 'card':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-30, 30), y: my + rand(40, 200), size: rand(7, 12), life: rand(0.4, 0.7), color: pick(['255,235,190', '255,160,180']), vrot: rand(-1, 1) });
        break;

      case 'holy':
        if (Math.random() < dt * 5) S.stars(ps, mx + rand(-30, 30), my + rand(-20, 140), 1, '255,236,170', [10, 40], [6, 11], -Math.PI / 2, 1);
        if (Math.random() < dt * 1.2) S.feathers(ps, mx + rand(-40, 40), my + rand(40, 120), 1, -Math.PI / 2, 1, [10, 40]);
        break;

      case 'unicorn':
        if (Math.random() < dt * 5) S.rainbowSparks(ps, mx + rand(-40, 40), my + rand(60, 160), 1, -Math.PI / 2, 1, [10, 60], 1.2);
        if (Math.random() < dt * 0.9) S.hearts(ps, mx + rand(-20, 20), my + 60, 1, -Math.PI / 2, 0.6, [30, 70]);
        break;

      case 'obliterator':
        if (Math.random() < dt * 4) S.miniBubble(ps, mx + rand(-8, 8), my + rand(50, 150), rand(-6, 6), rand(-50, -20), rand(2, 4), rand(0.6, 1.1));
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-12, 12), y: my - 12, vx: rand(-20, 20), vy: rand(-70, -30), size: 1.6, life: rand(0.5, 0.9), color: '150,255,100', g: -30 });
        break;

      case 'coin':
        if (Math.random() < dt * 5) ps.add({ k: K.STAR, add: true, x: mx + rand(-20, 20), y: my + rand(-20, 140), size: rand(6, 11), life: rand(0.4, 0.7), color: '255,230,130', vrot: rand(-1, 1) });
        break;

      case 'saber':
        if (Math.random() < dt * 14) ps.add({ k: K.SPARK, add: true, x: mx + rand(-3, 3), y: my - 116, vx: rand(-40, 40), vy: rand(-70, 20), g: 100, drag: 1.5, size: 1.2, len: 0.03, life: rand(0.3, 0.6), color: '140,235,255' });
        break;

      case 'gauntlet':
        if (a.fireT < 1.2 && Math.random() < dt * 22 * (1 - a.fireT / 1.2)) ps.add({ k: K.SMOKE, x: mx + rand(-14, 14), y: my + 52, vx: rand(-14, 14), vy: rand(-50, -20), size: 5, size2: 24, life: rand(0.7, 1.1), color: '190,194,200', alpha: 0.3, rot: rand(0, TAU) });
        break;

      case 'ruby':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-12, 12), y: my + rand(20, 100), size: rand(6, 11), life: rand(0.4, 0.7), color: '255,150,175', vrot: rand(-1, 1) });
        break;

      case 'emerald':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-24, 24), my - 12 + rand(-24, 24), 1, -Math.PI / 2, 1.4, [10, 50], '120,255,180', 1.1, -40, 0.03);
        break;

      case 'sapphire':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 14), y: my + rand(10, 150), size: rand(6, 11), life: rand(0.4, 0.7), color: '170,205,255', vrot: rand(-1, 1) });
        if (a.fireT < 1.6 && Math.random() < dt * 20 * (1 - a.fireT / 1.6)) ps.add({ k: K.SMOKE, x: mx + rand(-10, 10), y: my - 4, vx: rand(-10, 10), vy: rand(-60, -25), size: 5, size2: 26, life: rand(0.8, 1.2), color: '170,176,196', alpha: 0.3, rot: rand(0, TAU) });
        break;

      case 'crystal':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-30, 30), my + rand(-10, 90), 1, -Math.PI / 2, 1.4, [10, 60], '210,150,255', 1.1, -30, 0.03);
        break;

      case 'beerifle':
        if (Math.random() < dt * 0.9) S.bees(ps, mx + rand(-10, 10), my + 60, 1, -Math.PI / 2, 1.2, [60, 140]);
        break;

      case 'charge':
        if (a.fireT < 1.2 && Math.random() < dt * 22 * (1 - a.fireT / 1.2)) ps.add({ k: K.SMOKE, x: mx + rand(-22, 22), y: my + 40, vx: rand(-12, 12), vy: rand(-50, -20), size: 5, size2: 22, life: rand(0.7, 1.1), color: '225,240,250', alpha: 0.25, rot: rand(0, TAU) });
        if (Math.random() < dt * 5) S.sparks(ps, mx + rand(-20, 20), my + rand(-8, 8), 1, -Math.PI / 2, 1.3, [20, 80], '130,225,255', 1.1, -30, 0.03);
        break;

      case 'pulse':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-14, 14), my + rand(0, 130), 1, rand(0, TAU), 0.3, [20, 70], '110,225,255', 1.1, 0, 0.03);
        break;

      case 'cryo':
        if (Math.random() < dt * 6) ps.add({ k: K.SMOKE, x: mx + rand(-10, 10), y: my - 2, vx: rand(-12, 12), vy: rand(-40, -15), size: 5, size2: 22, life: rand(0.8, 1.2), color: '210,240,255', alpha: 0.22, rot: rand(0, TAU) });
        if (Math.random() < dt * 2.4) S.snowflakes(ps, mx + rand(-20, 20), my - 6, 1, -Math.PI / 2, 1.2, [10, 40]);
        break;

      case 'hyperdrive':
        if (Math.random() < dt * 7) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 14), y: my + rand(0, 150), vx: 0, vy: rand(-90, -40), size: rand(5, 9), life: rand(0.3, 0.6), color: '200,225,255' });
        break;

      case 'quantum':
        if (Math.random() < dt * 6) S.glitchBits(ps, mx + rand(-16, 16), my - 8 + rand(-14, 14), 1, 10);
        break;

      case 'wars':
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-4, 4), y: my - 4, vx: rand(-14, 14), vy: rand(-50, -20), size: rand(1.2, 2), life: rand(0.5, 0.9), color: '255,100,80', g: -20 });
        break;
      default:
        break;
    }
}
