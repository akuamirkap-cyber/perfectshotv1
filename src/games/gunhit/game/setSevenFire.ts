/**
 * SET 1..7 fire recipes of slide 3 (`Weapon Hit 71 Senjata`), copied verbatim
 * from the real `games/game-4/src/game/Game.ts` by `scripts/gen-set-seven.py`
 * (run it again after slide 7 changes; never edit this file by hand).
 *
 * Every body is slide 7's own: same FX classes, same particle counts, same
 * screen shake/flash, same sounds and the same projectile classes (the real
 * `projectiles*.ts` constructors, collected in `host.shots`). Only the receiver
 * changed: slide 7's `this` (its game object) is now the slide-1 host of
 * `setSevenFx.ts`, which forwards particles, timers, shake, sound and wheel
 * paint to slide 1.
 */

import { drawCasing, drawShell, drawWad } from '../vendor/game-4/src/game/art';
import { sfx } from '../vendor/game-4/src/game/audio';
import { TAU, pick, rand } from '../vendor/game-4/src/game/core';
import { BambooBlast, BananaPop, FrostFlash, SniperFlash } from '../vendor/game-4/src/game/fx2';
import { ArcWaves, PartyPop, PlasmaFlash } from '../vendor/game-4/src/game/fx3';
import { DragonBreathFlash, GravityPulse, HexBurst, Mandala, RadialFlash, SpiralFX } from '../vendor/game-4/src/game/fx4';
import { MoonSlash, RainbowBurst, RainbowRings, RuneCircle } from '../vendor/game-4/src/game/fx5';
import { ConvergeRings, FieldLines, FrostBloom } from '../vendor/game-4/src/game/fx6';
import { GlitchBurst, HaloRing, RadiationPulse, SaberSlash, WarpLines } from '../vendor/game-4/src/game/fx7';
import { K, Light, Lightning, MuzzleFlash, SplashSheet } from '../vendor/game-4/src/game/particles';
import { BlackHoleShot, DartShot, GoldenBullet, ShotgunBlast, StoneShot, WaterJet } from '../vendor/game-4/src/game/projectiles';
import { BambooShot, BananaShot, BubbleShot, FlameJet, SniperShot, SnowballShot } from '../vendor/game-4/src/game/projectiles2';
import { ChickenShot, ConfettiShot, CrossbowShot, HarpoonShot, LaserBeam, MinigunBurst, PizzaShot, PlasmaShot, SeedShot } from '../vendor/game-4/src/game/projectiles3';
import { BeeSwarm, CoconutShot, DragonFire, FireworkShot, GravityShot, HoneyShot, KerisShot, NoteShot, SakuraShot } from '../vendor/game-4/src/game/projectiles4';
import { DiamondShot, GhostShot, MeteorShot, MoonShot, PaintShot, PencilShot, RainbowShot, SandalShot, SharkShot, StormShot, UfoShot, WandShot } from '../vendor/game-4/src/game/projectiles5';
import { BazookaShot, CardShot, CricketShot, ElectroShot, FishShot, FreezeBeam, MagnetShot, PirateShot, RailShot, RpgShot, SizeShot } from '../vendor/game-4/src/game/projectiles6';
import { BeeRifleShot, ChargeShot, CoinShot, CryoShot, CrystalShot, EmeraldBeam, GauntletShot, HolyShot, HyperShot, ObliteratorShot, PulseShot, QuantumShot, RubyShot, SaberShot, SapphireBlast, UnicornShot, WarsShot } from '../vendor/game-4/src/game/projectiles7';
import { drawRifleCasing } from '../vendor/game-4/src/game/shapes2';
import { ROCKET_COLS } from '../vendor/game-4/src/game/shapes4';
import { PAINT, RAINBOW } from '../vendor/game-4/src/game/shapes5';
import { AMETHYST, EMERALD, SAPPHIRE } from '../vendor/game-4/src/game/shapes7';
import { GOLDEN_SCALE, SHOTGUN_SCALE } from '../vendor/game-4/src/game/weaponArt';
import * as S from '../vendor/game-4/src/game/spawn7';
import type { SevenHost } from './setSevenFx';
import type { SlideThreeId } from './setSevenArt';
const PURPLES = ['200,140,255', '255,180,255', '150,100,255', '230,200,255'];
const GREENS = ['120,255,170', '190,255,215', '60,255,140', '230,255,240'];
const MOON_COLS = ['225,215,255', '200,185,255', '255,255,255'];
const ICE_COLS = ['190,235,255', '140,210,255', '230,248,255', '170,225,255'];

export function fire_golden(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 15;
    host.addFX(new MuzzleFlash(mx, my - 4, 'gold', 0.085));
    host.addFX(new Light(mx, my - 10, 220, '255,190,80', 0.75, 0.2));
    S.stars(ps, mx, my - 8, 14, '255,220,130', [80, 300], [7, 14], -Math.PI / 2, 0.9);
    S.smoke(ps, mx, my - 10, 6, '235,215,175', [10, 44], { vy: [-90, -40], vx: [-30, 30], alpha: 0.35, life: [0.8, 1.3] });
    S.ring(ps, mx, my - 6, 3, 30, '255,230,160', 2, 0.2, true);
    S.sparks(ps, mx, my - 6, 10, -Math.PI / 2, 0.5, [300, 600], '255,220,140', 1.3, 300);
    host.shots.push(new GoldenBullet(host.g, mx, my - 6));
    host.after(0.035, () => {
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
    host.shake(4);
    sfx.play('golden_fire');
  }

export function fire_blackhole(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('bh_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my;
    for (let i = 0; i < 28; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(PURPLES) });
    }
    for (let i = 0; i < 3; i++) {
      const an = rand(0, TAU);
      host.addFX(new Lightning(mx + Math.cos(an) * 52, my + Math.sin(an) * 52, mx, my, 0.28, '190,120,255', 1.1, 1, 0.05));
    }
    host.after(0.28, () => {
      a.charging = false;
      a.charge = 0;
      a.orb = 0.12;
      a.fireT = 0;
      a.recoilV += 8;
      host.shots.push(new BlackHoleShot(host.g, mx, my - 4));
      S.ring(ps, mx, my, 6, 84, '190,120,255', 7, 0.42, true);
      S.ring(ps, mx, my, 3, 42, '255,255,255', 3, 0.22, true);
      host.addFX(new Light(mx, my, 210, '160,80,255', 0.85, 0.32));
      S.sparks(ps, mx, my, 18, -Math.PI / 2, 1.2, [150, 450], '215,165,255', 1.5, 200);
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + rand(-1.6, 1.6);
        const L = rand(40, 80);
        host.addFX(new Lightning(mx, my, mx + Math.cos(an) * L, my + Math.sin(an) * L, 0.16, '200,140,255', 1.3, 1));
      }
      host.shake(5);
      sfx.play('bh_fire');
    });
  }

export function fire_ketapel(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.loaded = false;
    a.pouchTarget = 0;
    a.pouchV = -1700;
    a.bandWob = 7;
    a.fireT = 0;
    a.recoilV += 2.5;
    host.shots.push(new StoneShot(host.g, mx, my + 40));
    S.smoke(ps, mx, my, 5, '240,240,250', [6, 26], { vy: [-120, -50], alpha: 0.22, life: [0.4, 0.7] });
    S.ring(ps, mx, my - 2, 4, 32, '255,255,255', 2, 0.25, false, 0.5);
    S.smoke(ps, mx, my + 46, 3, '200,175,140', [5, 18], { vy: [-20, 10], alpha: 0.3 });
    sfx.play('sling_fire');
    host.after(0.34, () => {
      a.loaded = true;
      a.pouchTarget = 46;
    });
  }

export function fire_sumpit(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.pulse = 0;
    a.fireT = 0;
    sfx.play('sumpit_fire');
    host.after(0.075, () => {
      a.recoilV += 4;
      a.tasselV += 7;
      host.shots.push(new DartShot(host.g, mx, my - 38));
      S.smoke(ps, mx, my - 4, 8, '235,242,255', [5, 28], { vy: [-140, -40], vx: [-50, 50], alpha: 0.32, life: [0.5, 0.9], drag: 3 });
      S.ring(ps, mx, my - 4, 2, 24, '255,255,255', 2, 0.26, false, 0.6);
    });
  }

export function fire_shotgun(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 22;
    host.addFX(new MuzzleFlash(mx, my - 6, 'shotgun', 0.1));
    host.addFX(new Light(mx, my - 30, 330, '255,150,60', 0.9, 0.22));
    host.flashScreen('255,190,120', 0.16);
    host.shots.push(new ShotgunBlast(host.g, mx, my - 8));
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
    host.shake(10);
    sfx.play('shotgun_fire');
    host.after(0.17, () => {
      a.pumpStart = host.time;
      sfx.play('pump');
    });
    host.after(0.28, () => {
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
  }

export function fire_soaker(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    a.slosh = Math.min(1.8, a.slosh + 1.1);
    a.gauge = 0.22;
    a.water = host.ammoLeft / host.ammoTotal;
    host.shots.push(new WaterJet(host.g, mx, my - 2));
    S.droplets(ps, mx, my - 4, 16, -Math.PI / 2, 0.26, [300, 650], [0.7, 1.5], '170,220,255', 500);
    S.smoke(ps, mx, my - 8, 5, '220,240,255', [6, 28], { vy: [-120, -40], alpha: 0.26, life: [0.4, 0.8] });
    sfx.play('soaker_fire');
    host.after(0.1, () => {
      a.pumpStart = host.time;
    });
  }

export function fire_snowball(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 9;
    host.addFX(new FrostFlash(mx, my - 4));
    host.addFX(new Light(mx, my - 16, 210, '140,210,255', 0.75, 0.24));
    S.smoke(ps, mx, my - 10, 11, '238,247,255', [10, 54], { vx: [-80, 80], vy: [-190, -60], alpha: 0.55, life: [0.5, 1.0], drag: 2.2 });
    S.snowflakes(ps, mx, my - 10, 16, -Math.PI / 2, 0.85, [140, 420]);
    S.shards(ps, mx, my - 8, 9, -Math.PI / 2, 0.7, [260, 560], ICE_COLS);
    S.stars(ps, mx, my - 10, 10, '200,235,255', [80, 270], [8, 15], -Math.PI / 2, 0.9);
    S.ring(ps, mx, my - 6, 3, 44, '200,235,255', 3, 0.26, true);
    S.ring(ps, mx, my - 6, 2, 24, '255,255,255', 2, 0.18, true);
    host.shots.push(new SnowballShot(host.g, mx, my - 14));
    host.shake(4);
    sfx.play('snow_fire');
  }

export function fire_sniper(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 22;
    host.addFX(new SniperFlash(mx, my - 4));
    host.addFX(new Light(mx, my - 24, 280, '255,235,190', 0.85, 0.2));
    host.flashScreen('255,245,220', 0.18);
    host.shake(9);
    S.ring(ps, mx, my - 4, 4, 70, '255,240,210', 3, 0.26, true);
    for (const side of [-1, 1]) {
      S.smoke(ps, mx + side * 8, my + 4, 5, '215,205,190', [10, 40], { vx: [side * 90, side * 260], vy: [-30, 20], alpha: 0.4, life: [0.5, 0.9], drag: 3 });
      S.sparks(ps, mx + side * 8, my, 8, side > 0 ? 0 : Math.PI, 0.35, [250, 600], '255,220,140', 1.3, 200);
    }
    S.embers(ps, mx, my - 8, 10, -Math.PI / 2, 0.4, [200, 600]);
    S.smoke(ps, mx, my - 12, 6, '225,215,200', [8, 32], { vy: [-120, -40], vx: [-20, 20], alpha: 0.3 });
    host.shots.push(new SniperShot(host.g, mx, my - 14));
    sfx.play('sniper_fire');
    host.after(0.28, () => {
      a.boltStart = host.time;
      sfx.play('bolt');
    });
    host.after(0.46, () => {
      const ex = mx + 4;
      const ey = my + 140;
      ps.add({
        k: K.CUSTOM,
        x: ex,
        y: ey,
        vx: rand(150, 260),
        vy: rand(-360, -240),
        g: 1500,
        rot: 0,
        vrot: rand(14, 26),
        life: 1.6,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          drawRifleCasing(c);
          c.restore();
        },
      });
      S.smoke(ps, ex, ey, 2, '200,190,170', [5, 18], { vy: [-40, -15], alpha: 0.3 });
    });
  }

export function fire_flame(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 2.5;
    host.addFX(new Light(mx, my - 16, 220, '255,150,50', 0.8, 0.25));
    S.fire(ps, mx, my - 8, 10, -Math.PI / 2, 0.35, [150, 380], [18, 28], [30, 48], [0.2, 0.35], { g: -100 });
    S.embers(ps, mx, my - 8, 14, -Math.PI / 2, 0.6, [150, 480]);
    S.smoke(ps, mx, my - 12, 4, '70,60,55', [8, 28], { vy: [-120, -40], alpha: 0.28, life: [0.6, 1] });
    host.shots.push(new FlameJet(host.g, mx, my - 8));
    sfx.play('flame_fire');
  }

export function fire_bubble(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 2.5;
    S.bubbleSpray(ps, mx, my - 8);
    S.ring(ps, mx, my - 6, 4, 46, '255,160,230', 3, 0.3, true);
    S.ring(ps, mx, my - 6, 3, 34, '140,225,255', 2.2, 0.26, true);
    S.stars(ps, mx, my - 8, 10, '255,225,250', [60, 220], [7, 13], -Math.PI / 2, 0.9);
    host.addFX(new Light(mx, my - 12, 150, '255,170,230', 0.5, 0.22));
    host.shots.push(new BubbleShot(host.g, mx, my - 8));
    sfx.play('bubble_fire');
  }

export function fire_bamboo(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const fx = mx - 50;
    const fy = my + 114;
    a.fuse = 0.18;
    sfx.play('bamboo_fuse');
    S.sparks(ps, fx, fy, 14, -Math.PI / 2, Math.PI, [60, 220], '255,220,120', 1.3, 500);
    S.glow(ps, fx, fy, 40, 10, '255,200,100', 0.2, 1);
    host.after(0.17, () => {
      a.fireT = 0;
      a.recoilV += 26;
      host.addFX(new BambooBlast(mx, my - 6));
      host.addFX(new Light(mx, my - 40, 420, '255,160,60', 1, 0.34));
      host.flashScreen('255,200,120', 0.26);
      for (let i = 0; i < 16; i++) {
        const an = (i / 16) * TAU;
        ps.add({ k: K.SMOKE, x: mx + Math.cos(an) * 10, y: my - 14 + Math.sin(an) * 3, vx: Math.cos(an) * rand(150, 230), vy: Math.sin(an) * rand(25, 50) - 30, size: 16, size2: 46, life: rand(0.8, 1.3), color: '200,190,175', alpha: 0.5, drag: 2.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
      }
      S.fire(ps, mx, my - 10, 18, -Math.PI / 2, 0.55, [220, 520], [24, 38], [46, 80], [0.25, 0.5], { g: -120 });
      S.smoke(ps, mx, my - 20, 14, '60,52,46', [26, 100], { vx: [-70, 70], vy: [-190, -60], alpha: 0.6, life: [1.2, 2], drag: 1.8 });
      S.embers(ps, mx, my - 8, 26, -Math.PI / 2, 0.8, [200, 700]);
      S.sparks(ps, mx, my - 8, 20, -Math.PI / 2, 0.7, [250, 700], '255,210,120', 1.5, 300);
      S.chips(ps, mx, my - 10, 10, -Math.PI / 2, 0.7, [200, 500], ['120,170,50', '90,140,40', '200,225,120']);
      S.ring(ps, mx, my - 8, 6, 120, '255,200,120', 6, 0.35, true);
      host.shots.push(new BambooShot(host.g, mx, my - 16));
      host.shake(14);
      sfx.play('bamboo_fire');
    });
  }

export function fire_banana(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 4;
    host.addFX(new BananaPop(mx, my - 24, 1));
    host.addFX(new Light(mx, my - 14, 170, '255,220,90', 0.6, 0.2));
    S.stars(ps, mx, my - 12, 12, '255,230,100', [90, 300], [8, 15], -Math.PI / 2, 0.9);
    S.sparks(ps, mx, my - 10, 12, -Math.PI / 2, 0.8, [200, 500], '255,225,100', 1.4, 400);
    S.chips(ps, mx, my - 8, 6, -Math.PI / 2, 0.8, [150, 380], ['255,225,80', '240,190,20', '255,240,150']);
    S.ring(ps, mx, my - 8, 3, 40, '255,230,120', 3, 0.24, true);
    S.smoke(ps, mx, my - 12, 4, '255,238,160', [8, 30], { vy: [-120, -40], alpha: 0.28, life: [0.4, 0.8] });
    host.shots.push(new BananaShot(host.g, mx, my - 12));
    host.shake(4);
    sfx.play('banana_fire');
  }

export function fire_harpoon(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 24;
    a.fireT = 0;
    a.recoilV += 12;
    a.spinV += 34;
    host.addFX(new Light(mx, y, 190, '120,255,235', 0.65, 0.2));
    S.ring(ps, mx, y, 4, 64, '170,255,245', 3, 0.28, true);
    S.ring(ps, mx, y, 3, 38, '255,255,255', 2, 0.2, true);
    S.smoke(ps, mx, y, 9, '225,245,250', [8, 36], { vx: [-90, 90], vy: [-160, -40], alpha: 0.4, life: [0.4, 0.8], drag: 2.8 });
    S.sparks(ps, mx, y, 12, -Math.PI / 2, 0.9, [200, 520], '160,255,240', 1.3, 300);
    S.stars(ps, mx, y, 6, '170,255,245', [60, 200], [7, 12], -Math.PI / 2, 0.9);
    host.shots.push(new HarpoonShot(host.g, mx, y));
    host.shake(6);
    sfx.play('harpoon_fire');
  }

export function fire_chicken(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 10;
    a.fireT = 0;
    a.recoilV += 7;
    host.addFX(new ArcWaves(mx, y - 6));
    host.addFX(new Light(mx, y, 150, '255,230,110', 0.5, 0.2));
    S.feathers(ps, mx, y, 12, -Math.PI / 2, 0.9, [120, 360]);
    S.stars(ps, mx, y, 8, '255,235,120', [80, 260], [7, 13], -Math.PI / 2, 0.9);
    S.smoke(ps, mx, y, 5, '255,248,215', [8, 30], { vy: [-120, -40], vx: [-50, 50], alpha: 0.35, life: [0.4, 0.8] });
    ps.add({ k: K.TEXT, x: mx, y: y - 52, vy: -80, drag: 1.8, size: 22, text: 'SQUEEK!', color: '255,236,140', life: 0.8 });
    host.shots.push(new ChickenShot(host.g, mx, y - 4));
    host.shake(4);
    sfx.play('chicken_fire');
  }

export function fire_confetti(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 8;
    a.fireT = 0;
    a.recoilV += 10;
    host.addFX(new PartyPop(mx, y));
    host.addFX(new Light(mx, y - 10, 210, '255,200,255', 0.7, 0.24));
    S.confetti(ps, mx, y, 54, -Math.PI / 2, 0.75, [180, 560], [3, 6.5], [1.2, 2.1]);
    S.streamers(ps, mx, y, 6, -Math.PI / 2, 0.7, [220, 520]);
    S.smoke(ps, mx, y, 6, '255,235,250', [10, 40], { vy: [-140, -50], vx: [-60, 60], alpha: 0.35, life: [0.5, 0.9] });
    S.ring(ps, mx, y, 3, 56, '255,230,110', 3, 0.26, true);
    S.stars(ps, mx, y, 8, '255,235,250', [80, 260], [8, 14], -Math.PI / 2, 0.9);
    host.shots.push(new ConfettiShot(host.g, mx, y - 4));
    host.shake(5);
    sfx.play('confetti_fire');
  }

export function fire_seed(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 8;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new Light(mx, y, 130, '150,255,120', 0.45, 0.2));
    S.leaves(ps, mx, y, 10, -Math.PI / 2, 0.9, [140, 380]);
    S.soil(ps, mx, y, 8, -Math.PI / 2, 0.7, [120, 340]);
    S.smoke(ps, mx, y, 5, '170,225,140', [8, 30], { vy: [-120, -40], vx: [-50, 50], alpha: 0.3, life: [0.4, 0.8] });
    S.stars(ps, mx, y, 6, '190,255,150', [60, 220], [7, 12], -Math.PI / 2, 0.9);
    S.ring(ps, mx, y, 3, 40, '160,255,130', 2.5, 0.24, true);
    host.shots.push(new SeedShot(host.g, mx, y - 4));
    host.shake(3);
    sfx.play('seed_fire');
  }

export function fire_pizza(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 8;
    a.fireT = 0;
    a.recoilV += 8;
    host.addFX(new Light(mx, y - 8, 190, '255,190,80', 0.65, 0.24));
    S.smoke(ps, mx, y, 10, '255,248,235', [10, 46], { vx: [-80, 80], vy: [-170, -50], alpha: 0.4, life: [0.5, 1.0], drag: 2.2 });
    S.pepperoni(ps, mx, y, 3, -Math.PI / 2, 0.8, [200, 420]);
    S.goo(ps, mx, y, 8, -Math.PI / 2, 0.8, [160, 400], [1.6, 3], '255,200,60', '170,90,10');
    S.embers(ps, mx, y, 12, -Math.PI / 2, 0.7, [150, 450], '255,190,70');
    S.ring(ps, mx, y, 3, 52, '255,215,120', 3, 0.26, true);
    S.stars(ps, mx, y, 6, '255,225,130', [60, 220], [7, 12], -Math.PI / 2, 0.9);
    host.shots.push(new PizzaShot(host.g, mx, y - 4));
    host.shake(4);
    sfx.play('pizza_fire');
  }

export function fire_minigun(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    a.fireT = 0;
    a.spinV = 48;
    host.shots.push(new MinigunBurst(host.g, mx, my - 6));
    sfx.play('minigun_fire');
  }

export function fire_crossbow(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 10;
    host.addFX(new Light(mx, my - 10, 130, '255,230,180', 0.4, 0.14));
    S.ring(ps, mx, my - 6, 3, 50, '235,240,245', 2.5, 0.26, false, 0.7);
    S.ring(ps, mx - 67, my + 12, 2, 24, '255,255,255', 1.8, 0.22, true);
    S.ring(ps, mx + 67, my + 12, 2, 24, '255,255,255', 1.8, 0.22, true);
    S.smoke(ps, mx, my - 4, 6, '220,215,205', [8, 34], { vx: [-110, 110], vy: [-60, 30], alpha: 0.35, life: [0.4, 0.8], drag: 3 });
    S.sparks(ps, mx, my - 4, 6, -Math.PI / 2, 1.2, [150, 400], '255,235,200', 1.1, 300);
    host.shots.push(new CrossbowShot(host.g, mx, my - 4));
    host.shake(4);
    sfx.play('crossbow_fire');
  }

export function fire_plasma(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('plasma_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 6;
    for (let i = 0; i < 30; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(GREENS) });
    }
    for (let i = 0; i < 3; i++) {
      const an = rand(0, TAU);
      host.addFX(new Lightning(mx + Math.cos(an) * 54, my + Math.sin(an) * 54, mx, my - 6, 0.28, '120,255,170', 1.1, 1, 0.05));
    }
    host.after(0.2, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 9;
      host.addFX(new PlasmaFlash(mx, my - 6));
      host.addFX(new Light(mx, my - 14, 230, '60,255,150', 0.85, 0.28));
      S.ring(ps, mx, my - 6, 5, 90, '90,255,170', 6, 0.4, true);
      S.ring(ps, mx, my - 6, 3, 44, '255,255,255', 3, 0.22, true);
      S.sparks(ps, mx, my - 6, 22, -Math.PI / 2, 1.2, [150, 520], '140,255,190', 1.5, 200);
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + rand(-1.6, 1.6);
        const L = rand(40, 80);
        host.addFX(new Lightning(mx, my - 6, mx + Math.cos(an) * L, my - 6 + Math.sin(an) * L, 0.16, '150,255,190', 1.3, 1));
      }
      host.shots.push(new PlasmaShot(host.g, mx, my - 8));
      host.shake(6);
      sfx.play('plasma_fire');
    });
  }

export function fire_laser(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('laser_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 2;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 100);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: host.orbTarget, pull: 1500, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['255,90,90', '255,170,150', '255,230,225']) });
    }
    host.addFX(new Light(mx, my - 6, 150, '255,60,60', 0.5, 0.3));
    host.after(0.26, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 6;
      host.shots.push(new LaserBeam(host.g, mx, my - 4));
      host.addFX(new Light(mx, my - 10, 240, '255,70,60', 0.9, 0.34));
      S.ring(ps, mx, my - 4, 4, 80, '255,100,100', 5, 0.36, true);
      S.sparks(ps, mx, my - 4, 16, -Math.PI / 2, 1.2, [150, 450], '255,200,170', 1.4, 200);
      host.shake(5);
      sfx.play('laser_fire');
    });
  }

export function fire_dragon(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 4;
    a.fireT = 0;
    a.recoilV += 12;
    host.addFX(new DragonBreathFlash(mx, y));
    host.addFX(new Light(mx, y - 20, 300, '255,140,50', 0.9, 0.3));
    host.flashScreen('255,150,60', 0.14);
    S.fire(ps, mx, y, 22, -Math.PI / 2, 0.55, [260, 620], [26, 44], [50, 90], [0.25, 0.5], { g: -140 });
    S.embers(ps, mx, y, 26, -Math.PI / 2, 0.8, [200, 640]);
    S.sparks(ps, mx, y, 18, -Math.PI / 2, 0.9, [260, 640], '255,200,110', 1.5, 200);
    S.smoke(ps, mx, y - 10, 9, '60,50,46', [18, 70], { vx: [-70, 70], vy: [-180, -60], alpha: 0.5, life: [0.8, 1.4] });
    S.ring(ps, mx, y, 5, 90, '255,170,70', 6, 0.36, true);
    host.shots.push(new DragonFire(host.g, mx, y - 18));
    host.shake(8);
    sfx.play('dragon_fire');
  }

export function fire_gravity(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('gravity_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 10;
    for (let i = 0; i < 28; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 10 + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['120,200,255', '200,240,255', '80,160,255']) });
    }
    S.ring(ps, mx, my - 10, 70, 6, '120,205,255', 3, 0.26, true, 0.8);
    host.after(0.26, () => {
      a.charging = false;
      a.charge = 0;
      a.orb = 0.12;
      a.fireT = 0;
      a.recoilV += 8;
      host.shots.push(new GravityShot(host.g, mx, my - 12));
      host.addFX(new GravityPulse(mx, my - 6, 0.5, 0.9));
      host.addFX(new Light(mx, my - 8, 210, '90,180,255', 0.85, 0.32));
      S.ring(ps, mx, my - 8, 6, 84, '120,205,255', 6, 0.42, true);
      S.sparks(ps, mx, my - 8, 18, -Math.PI / 2, 1.2, [150, 450], '160,220,255', 1.5, 200);
      host.shake(5);
      sfx.play('gravity_fire');
    });
  }

export function fire_honey(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 2;
    a.fireT = 0;
    a.recoilV += 6;
    host.addFX(new HexBurst(mx, y - 6, 0.3, 0.6));
    host.addFX(new Light(mx, y - 8, 150, '255,190,60', 0.5, 0.2));
    S.goo(ps, mx, y, 12, -Math.PI / 2, 0.7, [200, 520], [1.4, 3], '255,184,30', '150,80,0');
    S.hexes(ps, mx, y, 8, -Math.PI / 2, 0.9, [100, 320]);
    S.stars(ps, mx, y, 6, '255,225,130', [60, 220], [7, 12], -Math.PI / 2, 0.9);
    S.ring(ps, mx, y, 3, 42, '255,200,80', 3, 0.26, true);
    host.shots.push(new HoneyShot(host.g, mx, y - 10));
    host.shake(3);
    sfx.play('honey_fire');
  }

export function fire_coconut(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 4;
    a.fireT = 0;
    a.recoilV += 11;
    host.addFX(new Light(mx, y - 10, 190, '255,240,200', 0.55, 0.22));
    S.smoke(ps, mx, y - 4, 12, '245,248,240', [12, 56], { vx: [-80, 80], vy: [-190, -60], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    S.sparks(ps, mx, y - 4, 8, -Math.PI / 2, 0.8, [200, 500], '255,235,190', 1.2, 300);
    S.petals(ps, mx - 24, my + 160, 5, -Math.PI / 2, 1.2, [60, 200], [1, 1.8], 90);
    S.leaves(ps, mx, y, 6, -Math.PI / 2, 1, [80, 240]);
    S.ring(ps, mx, y - 2, 4, 50, '240,255,230', 3, 0.28, true);
    host.shots.push(new CoconutShot(host.g, mx, y - 8));
    host.shake(6);
    sfx.play('coconut_fire');
  }

export function fire_angklung(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 2;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new GravityPulse(mx, y - 4, 0.4, 0.8, '255,215,100'));
    host.addFX(new Light(mx, y - 10, 180, '255,210,90', 0.6, 0.24));
    S.notes(ps, mx, y - 6, 9, -Math.PI / 2, 1.0, [120, 340]);
    S.ring(ps, mx, y - 4, 4, 56, '255,215,100', 3, 0.3, true);
    S.ring(ps, mx, y - 4, 3, 38, '255,255,255', 2, 0.22, true);
    S.stars(ps, mx, y - 6, 8, '255,235,160', [60, 220], [7, 13], -Math.PI / 2, 1);
    host.shots.push(new NoteShot(host.g, mx, y - 8));
    host.shake(3);
    sfx.play('angklung_fire');
  }

export function fire_bee(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 2;
    a.fireT = 0;
    a.recoilV += 4;
    host.addFX(new Light(mx, y - 8, 160, '255,210,80', 0.5, 0.22));
    S.bees(ps, mx, y - 6, 7, -Math.PI / 2, 0.8, [180, 480]);
    S.goo(ps, mx, y, 8, -Math.PI / 2, 0.7, [160, 400], [1.3, 2.6], '255,184,30', '150,80,0');
    S.hexes(ps, mx, y, 6, -Math.PI / 2, 0.9, [100, 300]);
    S.ring(ps, mx, y - 4, 3, 44, '255,215,90', 3, 0.26, true);
    ps.add({ k: K.TEXT, x: mx, y: y - 44, vy: -70, drag: 1.8, size: 22, text: 'BZZ!', color: '255,226,80', life: 0.75 });
    host.shots.push(new BeeSwarm(host.g, mx, y - 12));
    host.shake(3);
    sfx.play('bee_fire');
  }

export function fire_sakura(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 8;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new SpiralFX(mx, y - 6, '255,170,205', 0.5, 3, 64, 1));
    host.addFX(new Light(mx, y - 10, 170, '255,170,205', 0.55, 0.26));
    S.petals(ps, mx, y - 4, 20, -Math.PI / 2, 1.0, [140, 400], [1.2, 2.2], 80);
    S.stars(ps, mx, y - 6, 8, '255,220,235', [60, 220], [7, 13], -Math.PI / 2, 1);
    S.ring(ps, mx, y - 4, 4, 54, '255,160,200', 3, 0.28, true);
    S.sparks(ps, mx, y - 4, 8, -Math.PI / 2, 0.9, [150, 400], '255,210,230', 1.2, 200);
    host.shots.push(new SakuraShot(host.g, mx, y - 10));
    host.shake(3);
    sfx.play('sakura_fire');
  }

export function fire_firework(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const idx = (host.shotsFired - 1) % 3;
    a.idx = idx;
    a.fireT = 0;
    a.recoilV += 6;
    // Match the tighter, slightly lower side tubes in drawFireworkLauncher.
    const tx = mx + (idx - 1) * 15 * 0.92;
    const ty = my + (idx === 1 ? -4 : 8) * 0.92;
    const cols = ROCKET_COLS[idx].burst;
    host.addFX(new RadialFlash(tx, ty - 4, cols, 0.12, 44, 12));
    host.addFX(new Light(tx, ty - 10, 200, cols[0], 0.7, 0.24));
    S.sparks(ps, tx, ty - 4, 20, -Math.PI / 2, 0.8, [200, 560], '255,225,130', 1.4, 400);
    S.smoke(ps, tx, ty - 6, 8, '225,225,230', [10, 44], { vx: [-70, 70], vy: [-150, -50], alpha: 0.45, life: [0.7, 1.2], drag: 2.2 });
    S.embers(ps, tx, ty - 4, 12, -Math.PI / 2, 0.7, [150, 450], cols[0]);
    S.ring(ps, tx, ty - 4, 3, 40, cols[0], 3, 0.24, true);
    host.shots.push(new FireworkShot(host.g, tx, ty - 8, idx));
    host.shake(5);
    sfx.play('firework_fire');
  }

export function fire_keris(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 6;
    host.addFX(new Mandala(mx, my + 10, 0.5, 0.7, 0.5, 1));
    host.addFX(new Light(mx, my - 6, 220, '255,205,90', 0.8, 0.3));
    S.sparks(ps, mx, my, 18, -Math.PI / 2, 0.9, [200, 560], '255,225,130', 1.5, 200);
    S.stars(ps, mx, my - 4, 10, '255,230,150', [60, 240], [8, 14], -Math.PI / 2, 1);
    S.ring(ps, mx, my - 2, 4, 70, '255,215,100', 4, 0.34, true);
    S.smoke(ps, mx, my - 4, 5, '255,240,205', [10, 40], { vy: [-120, -40], vx: [-40, 40], alpha: 0.25, life: [0.6, 1] });
    host.shots.push(new KerisShot(host.g, mx, my - 2));
    host.shake(5);
    sfx.play('keris_fire');
  }

export function fire_moonbeam(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('moon_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my + 9;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + 9 + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(MOON_COLS) });
    }
    host.addFX(new RuneCircle(mx, my + 10, '200,190,255', '255,250,255', 0.34, 0.6, 0.5, 1));
    host.after(0.22, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 7;
      host.addFX(new MoonSlash(mx, my - 6, 0.4, 0.7));
      host.addFX(new Light(mx, my - 10, 220, '190,170,255', 0.85, 0.3));
      S.stars(ps, mx, my - 8, 12, '235,228,255', [80, 280], [7, 13], -Math.PI / 2, 0.9);
      S.moonDust(ps, mx, my - 6, 10, -Math.PI / 2, 1.2, [40, 160]);
      S.ring(ps, mx, my - 4, 5, 70, '200,185,255', 4, 0.34, true);
      S.sparks(ps, mx, my - 6, 14, -Math.PI / 2, 1.1, [150, 460], '210,200,255', 1.4, 200);
      host.shots.push(new MoonShot(host.g, mx, my - 6));
      host.shake(5);
      sfx.play('moon_fire');
    });
  }

export function fire_storm(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('storm_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my + 7;
    for (let i = 0; i < 5; i++) host.addFX(new Lightning(mx + rand(-44, 44), my - 30 + rand(-12, 12), mx, my + 7, 0.24, '150,210,255', 1.2, 1, 0.04));
    for (let i = 0; i < 22; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 90);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + 7 + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2), len: 0.03, life: 0.5, color: pick(['170,220,255', '255,255,255', '110,180,255']) });
    }
    host.after(0.22, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 8;
      host.addFX(new Light(mx, my - 4, 230, '140,200,255', 0.85, 0.28));
      S.ring(ps, mx, my - 2, 5, 80, '150,210,255', 5, 0.36, true);
      S.sparks(ps, mx, my - 2, 20, -Math.PI / 2, 1.3, [150, 480], '170,220,255', 1.5, 200);
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + rand(-1.6, 1.6);
        const L = rand(40, 80);
        host.addFX(new Lightning(mx, my, mx + Math.cos(an) * L, my + Math.sin(an) * L, 0.16, '170,220,255', 1.3, 1));
      }
      host.shots.push(new StormShot(host.g, mx, my - 2));
      host.shake(6);
      sfx.play('storm_fire');
    });
  }

export function fire_pencil(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new Light(mx, my - 6, 130, '255,235,170', 0.4, 0.16));
    S.scribbles(ps, mx, my - 6, 6, -Math.PI / 2, 0.9, [160, 420]);
    S.shavings(ps, mx, my - 4, 5, -Math.PI / 2, 1.1, [100, 300]);
    S.chips(ps, mx, my - 2, 5, -Math.PI / 2, 0.9, [150, 380], ['255,150,172', '240,120,150']);
    S.smoke(ps, mx, my - 6, 4, '150,150,162', [8, 28], { vy: [-120, -40], vx: [-40, 40], alpha: 0.3, life: [0.4, 0.8] });
    S.sparks(ps, mx, my - 6, 6, -Math.PI / 2, 0.8, [150, 380], '235,235,245', 1.1, 300);
    S.ring(ps, mx, my - 4, 3, 36, '210,210,220', 2.5, 0.22, true);
    host.shots.push(new PencilShot(host.g, mx, my - 8));
    host.shake(3);
    sfx.play('pencil_fire');
  }

export function fire_sandal(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 11;
    host.addFX(new Light(mx, my - 8, 170, '255,235,180', 0.5, 0.2));
    S.smoke(ps, mx, my - 2, 12, '215,195,165', [12, 52], { vx: [-110, 110], vy: [-170, -40], alpha: 0.5, life: [0.5, 1.0], drag: 2.2 });
    S.stars(ps, mx, my - 6, 8, '255,230,120', [80, 260], [7, 13], -Math.PI / 2, 0.9);
    S.sparks(ps, mx, my - 4, 10, -Math.PI / 2, 1.0, [180, 480], '255,240,190', 1.2, 300);
    S.ring(ps, mx, my - 2, 4, 52, '235,215,180', 3, 0.28, true);
    host.shots.push(new SandalShot(host.g, mx, my - 12));
    host.shake(5);
    sfx.play('sandal_fire');
  }

export function fire_paintball(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const ci = (host.shotsFired - 1) % PAINT.length;
    const col = PAINT[ci];
    a.idx = ci;
    a.fireT = 0;
    a.recoilV += 4;
    host.addFX(new Light(mx, my - 6, 140, col.rgb, 0.45, 0.2));
    S.smoke(ps, mx, my - 4, 6, '245,250,255', [8, 34], { vx: [-70, 70], vy: [-150, -50], alpha: 0.4, life: [0.4, 0.8], drag: 2.4 });
    S.paintDrops(ps, mx, my - 4, 10, -Math.PI / 2, 0.7, [200, 520], [1, 2.2], col);
    S.ring(ps, mx, my - 2, 3, 40, col.hi, 2.5, 0.24, true);
    S.glow(ps, mx, my - 4, 50, 8, col.hi, 0.14, 0.9);
    host.shots.push(new PaintShot(host.g, mx, my - 6, ci));
    host.shake(3);
    sfx.play('paint_fire');
  }

export function fire_wand(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 4;
    host.addFX(new SpiralFX(mx, my, '255,150,230', 0.5, 3, 62, 1));
    host.addFX(new RuneCircle(mx, my + 4, '255,150,230', '255,235,150', 0.34, 0.5, 0.5, -1));
    host.addFX(new Light(mx, my - 4, 190, '255,170,235', 0.65, 0.26));
    S.stars(ps, mx, my - 4, 12, '255,200,240', [80, 280], [7, 13], -Math.PI / 2, 1.2);
    S.stars(ps, mx, my - 4, 6, '255,230,130', [60, 220], [7, 12], -Math.PI / 2, 1.2);
    S.sparks(ps, mx, my - 4, 14, -Math.PI / 2, 1.2, [160, 460], '255,215,245', 1.3, 300);
    S.ring(ps, mx, my - 2, 4, 50, '255,150,230', 3, 0.28, true);
    host.shots.push(new WandShot(host.g, mx, my - 6));
    host.shake(3);
    sfx.play('wand_fire');
  }

export function fire_shark(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 6;
    a.fireT = 0;
    a.recoilV += 8;
    host.addFX(new Light(mx, y - 8, 180, '150,215,255', 0.55, 0.22));
    S.droplets(ps, mx, y - 4, 20, -Math.PI / 2, 0.55, [260, 620], [1, 2.6], '170,225,255', 600);
    S.smoke(ps, mx, y - 6, 7, '230,244,255', [10, 40], { vx: [-80, 80], vy: [-170, -50], alpha: 0.4, life: [0.5, 0.9] });
    for (let i = 0; i < 4; i++) S.miniBubble(ps, mx + rand(-12, 12), y - 8, rand(-50, 50), rand(-170, -60), rand(2.6, 5.4), rand(0.5, 0.9));
    S.ring(ps, mx, y - 4, 4, 60, '190,230,255', 3.5, 0.3, true);
    host.shots.push(new SharkShot(host.g, mx, y - 10));
    host.shake(5);
    sfx.play('shark_fire');
  }

export function fire_ghost(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new Light(mx, my - 6, 190, '100,255,238', 0.6, 0.26));
    S.ghostWisps(ps, mx, my - 4, 6, -Math.PI / 2, 1.0, [120, 340]);
    S.smoke(ps, mx, my - 4, 8, '190,250,244', [10, 42], { vx: [-60, 60], vy: [-140, -40], alpha: 0.35, life: [0.6, 1.1] });
    S.stars(ps, mx, my - 4, 6, '170,255,248', [60, 220], [7, 12], -Math.PI / 2, 1);
    S.ring(ps, mx, my - 2, 4, 56, '110,255,240', 3, 0.3, true);
    ps.add({ k: K.TEXT, x: mx, y: my - 48, vy: -70, drag: 1.8, size: 24, text: 'BOO!', color: '190,255,248', life: 0.8 });
    host.shots.push(new GhostShot(host.g, mx, my - 6));
    host.shake(3);
    sfx.play('ghost_fire');
  }

export function fire_ufo(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new GravityPulse(mx, my + 8, 0.45, 0.8, '120,255,160'));
    host.addFX(new Light(mx, my - 4, 200, '90,255,140', 0.65, 0.26));
    S.ring(ps, mx, my - 2, 4, 66, '120,255,160', 3.5, 0.3, true);
    S.ring(ps, mx, my - 2, 3, 40, '255,255,255', 2, 0.22, true);
    S.sparks(ps, mx, my - 4, 16, -Math.PI / 2, 1.2, [160, 480], '140,255,170', 1.4, 200);
    S.stars(ps, mx, my - 4, 8, '160,255,190', [60, 220], [7, 12], -Math.PI / 2, 1.1);
    host.shots.push(new UfoShot(host.g, mx, my - 4));
    host.shake(4);
    sfx.play('ufo_fire');
  }

export function fire_rainbow(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new RainbowBurst(mx, my + 6, 0.26, 0.9));
    host.addFX(new RainbowRings(mx, my + 6, 0.5, 0.5));
    host.addFX(new Light(mx, my, 190, '255,220,250', 0.6, 0.24));
    S.rainbowSparks(ps, mx, my, 20, -Math.PI / 2, 1.2, [160, 520], 1.5);
    for (let i = 0; i < 7; i++) S.stars(ps, mx, my, 1, RAINBOW[i], [60, 240], [7, 13], -Math.PI / 2, 1.2);
    S.smoke(ps, mx - 26, my + 14, 3, '250,252,255', [14, 40], { vx: [-80, -20], vy: [-80, -10], alpha: 0.5, life: [0.6, 1] });
    S.smoke(ps, mx + 26, my + 14, 3, '250,252,255', [14, 40], { vx: [20, 80], vy: [-80, -10], alpha: 0.5, life: [0.6, 1] });
    host.shots.push(new RainbowShot(host.g, mx, my - 2));
    host.shake(4);
    sfx.play('rainbow_fire');
  }

export function fire_meteor(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('meteor_charge');
    for (let i = 0; i < 16; i++) ps.add({ k: K.EMBER, add: true, x: mx + rand(-30, 30), y: my + 34 + rand(-6, 6), vx: rand(-40, 40), vy: rand(-140, -40), size: rand(1.6, 2.8), life: rand(0.4, 0.8), color: '255,170,60', g: -40 });
    host.addFX(new Light(mx, my + 30, 200, '255,120,40', 0.6, 0.3));
    host.after(0.3, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 24;
      host.flashScreen('255,160,60', 0.22);
      host.addFX(new Light(mx, my + 10, 400, '255,130,40', 1, 0.4));
      S.fire(ps, mx, my + 30, 22, -Math.PI / 2, 0.7, [220, 560], [28, 48], [54, 96], [0.3, 0.55], { g: -140 });
      S.rocks(ps, mx, my + 30, 8, -Math.PI / 2, 0.9, [200, 520]);
      S.embers(ps, mx, my + 30, 24, -Math.PI / 2, 0.9, [200, 640]);
      S.sparks(ps, mx, my + 30, 20, -Math.PI / 2, 0.9, [250, 700], '255,200,110', 1.6, 300);
      S.smoke(ps, mx, my + 20, 10, '50,42,38', [20, 80], { vx: [-70, 70], vy: [-180, -60], alpha: 0.55, life: [1, 1.7] });
      S.ring(ps, mx, my + 30, 6, 130, '255,160,60', 6, 0.38, true);
      host.shots.push(new MeteorShot(host.g, mx, my + 18));
      host.shake(14);
      sfx.play('meteor_fire');
    });
  }

export function fire_diamond(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new RainbowBurst(mx, my - 2, 0.22, 0.8));
    host.addFX(new Light(mx, my - 4, 190, '170,230,255', 0.7, 0.24));
    S.crystalShards(ps, mx, my - 4, 7, -Math.PI / 2, 0.9, [200, 520]);
    S.stars(ps, mx, my - 4, 8, '235,252,255', [60, 240], [7, 13], -Math.PI / 2, 1.1);
    S.rainbowSparks(ps, mx, my - 4, 14, -Math.PI / 2, 1.1, [160, 480], 1.4);
    S.ring(ps, mx, my - 2, 4, 56, '170,230,255', 3, 0.28, true);
    host.shots.push(new DiamondShot(host.g, mx, my - 4));
    host.shake(4);
    sfx.play('diamond_fire');
  }

export function fire_fish(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 18;
    a.fireT = 0;
    a.recoilV += 7;
    host.addFX(new SplashSheet(mx, y - 6, -Math.PI / 2, 46, 0.22));
    host.addFX(new Light(mx, y - 8, 180, '150,215,255', 0.55, 0.22));
    S.droplets(ps, mx, y - 4, 22, -Math.PI / 2, 0.5, [260, 640], [1, 2.6], '170,225,255', 600);
    S.smoke(ps, mx, y - 6, 7, '230,244,255', [10, 40], { vx: [-70, 70], vy: [-170, -50], alpha: 0.4, life: [0.5, 0.9] });
    for (let i = 0; i < 5; i++) S.miniBubble(ps, mx + rand(-12, 12), y - 8, rand(-60, 60), rand(-190, -70), rand(2.6, 6), rand(0.5, 0.95));
    S.ring(ps, mx, y - 4, 4, 60, '190,230,255', 3.5, 0.3, true);
    host.shots.push(new FishShot(host.g, mx, y - 10));
    host.shake(5);
    sfx.play('fish_fire');
  }

export function fire_rpg(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 24;
    a.fireT = 0;
    a.recoilV += 11;
    host.addFX(new RadialFlash(mx, y - 8, ['255,170,70', '255,240,200', '255,120,40'], 0.14, 60, 12));
    host.addFX(new Light(mx, y - 10, 220, '255,150,60', 0.7, 0.26));
    S.fire(ps, mx, y - 6, 12, -Math.PI / 2, 0.5, [200, 480], [20, 34], [40, 70], [0.2, 0.4], { g: -100 });
    S.smoke(ps, mx, y - 6, 8, '215,215,220', [12, 50], { vx: [-90, 90], vy: [-170, -50], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    for (const s of [-1, 1]) S.smoke(ps, mx + s * 16, my + 90, 5, '225,225,228', [12, 44], { vx: [s * 70, s * 210], vy: [-30, 30], alpha: 0.45, life: [0.6, 1], drag: 2.4 });
    S.sparks(ps, mx, y - 6, 14, -Math.PI / 2, 0.9, [200, 560], '255,210,120', 1.4, 300);
    S.ring(ps, mx, y - 4, 4, 56, '255,200,140', 3, 0.26, true);
    host.shots.push(new RpgShot(host.g, mx, my - 2));
    host.shake(8);
    sfx.play('rpg_fire');
  }

export function fire_cricket(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 26;
    a.fireT = 0;
    a.recoilV += 26;
    host.addFX(new RadialFlash(mx, y - 6, ['190,110,255', '240,215,255', '255,255,255', '150,90,255'], 0.18, 90, 16));
    host.addFX(new Light(mx, y - 10, 300, '170,90,255', 0.95, 0.34));
    host.flashScreen('190,120,255', 0.16);
    S.ring(ps, mx, y - 4, 5, 100, '190,120,255', 6, 0.38, true);
    S.ring(ps, mx, y - 4, 3, 60, '255,255,255', 3, 0.24, true);
    S.sparks(ps, mx, y - 4, 26, -Math.PI / 2, 1.2, [200, 680], '215,160,255', 1.6, 200);
    S.stars(ps, mx, y - 6, 10, '235,205,255', [80, 280], [8, 14], -Math.PI / 2, 1.1);
    S.smoke(ps, mx, y - 8, 6, '100,60,150', [10, 40], { vx: [-70, 70], vy: [-150, -40], alpha: 0.4, life: [0.6, 1] });
    ps.add({ k: K.TEXT, x: mx + 34, y: my - 12, vy: -70, drag: 1.8, size: 20, text: 'KRIK!', color: '225,190,255', life: 0.7 });
    host.shots.push(new CricketShot(host.g, mx, y - 4));
    host.shake(13);
    sfx.play('cricket_fire');
  }

export function fire_electro(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my - 12;
    a.fireT = 0;
    a.recoilV += 6;
    for (let i = 0; i < 5; i++) host.addFX(new Lightning(mx + rand(-30, 30), y + rand(14, 90), mx + rand(-14, 14), y + rand(-4, 6), 0.2, '130,205,255', 1.3, 1, 0.04));
    host.addFX(new RadialFlash(mx, y, ['110,190,255', '230,245,255', '255,215,90'], 0.14, 70, 14));
    host.addFX(new Light(mx, y - 6, 230, '110,190,255', 0.8, 0.26));
    S.ring(ps, mx, y, 4, 70, '130,205,255', 4, 0.3, true);
    S.sparks(ps, mx, y, 22, -Math.PI / 2, 1.3, [180, 560], '170,225,255', 1.5, 200);
    S.sparks(ps, mx, y, 8, -Math.PI / 2, 1.0, [200, 520], '255,220,110', 1.3, 200);
    host.shots.push(new ElectroShot(host.g, mx, y - 4));
    host.shake(5);
    sfx.play('electro_fire');
  }

export function fire_bazooka(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const y = my + 24;
    a.fireT = 0;
    a.recoilV += 16;
    host.addFX(new RadialFlash(mx, y - 8, ['255,170,70', '255,240,200', '255,120,40'], 0.16, 80, 14));
    host.addFX(new Light(mx, y - 12, 280, '255,150,60', 0.85, 0.3));
    host.flashScreen('255,180,90', 0.16);
    S.fire(ps, mx, y - 6, 16, -Math.PI / 2, 0.55, [220, 540], [22, 38], [44, 80], [0.22, 0.45], { g: -110 });
    S.smokeRing(ps, mx, y - 6, 14, '235,235,240', 14, 210, 0.3);
    for (const s of [-1, 1]) S.smoke(ps, mx + s * 20, my + 100, 6, '230,230,234', [14, 50], { vx: [s * 80, s * 240], vy: [-30, 30], alpha: 0.5, life: [0.7, 1.2], drag: 2.4 });
    S.sparks(ps, mx, y - 6, 18, -Math.PI / 2, 0.9, [220, 600], '255,210,120', 1.5, 300);
    S.ring(ps, mx, y - 4, 5, 80, '255,210,150', 3.5, 0.3, true);
    host.shots.push(new BazookaShot(host.g, mx, my + 2));
    host.shake(12);
    sfx.play('bazooka_fire');
  }

export function fire_freeze(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('freeze_fire');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 14;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 14 + Math.sin(an) * d, target: host.orbTarget, pull: 1600, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['190,240,255', '255,255,255', '120,215,255']) });
    }
    S.snowflakes(ps, mx, my - 14, 8, -Math.PI / 2, Math.PI, [30, 100]);
    host.addFX(new Light(mx, my - 10, 160, '110,215,255', 0.5, 0.26));
    host.after(0.2, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 5;
      host.addFX(new FrostBloom(mx, my - 18, 0.45, 0.5));
      host.addFX(new Light(mx, my - 14, 230, '110,215,255', 0.85, 0.3));
      S.ring(ps, mx, my - 14, 4, 70, '150,230,255', 4, 0.32, true);
      S.snowflakes(ps, mx, my - 16, 10, -Math.PI / 2, 1.1, [120, 340]);
      S.sparks(ps, mx, my - 16, 14, -Math.PI / 2, 1.1, [150, 460], '200,240,255', 1.3, 200);
      host.shots.push(new FreezeBeam(host.g, mx, my - 16));
      host.shake(4);
      sfx.play('freeze_fire');
    });
  }

export function fire_rail(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('rail_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my + 2;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 100);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + 2 + Math.sin(an) * d, target: host.orbTarget, pull: 1800, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['150,190,255', '200,160,255', '255,255,255']) });
    }
    host.after(0.3, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 22;
      host.addFX(new Light(mx, my - 6, 320, '130,170,255', 1, 0.3));
      host.flashScreen('200,220,255', 0.2);
      S.ring(ps, mx, my - 2, 5, 100, '130,175,255', 6, 0.36, true);
      S.sparks(ps, mx, my - 2, 24, -Math.PI / 2, 1.0, [220, 700], '170,205,255', 1.6, 200);
      host.shots.push(new RailShot(host.g, mx, my - 4));
      host.shake(12);
      sfx.play('rail_fire');
    });
  }

export function fire_shrink(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const rgb = false ? '255,160,50' : '70,255,140';
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new ConvergeRings(mx, my + 4, rgb, false ? 1 : -1, 0.5, 0.65));
    host.addFX(new Light(mx, my, 190, rgb, 0.65, 0.26));
    S.ring(ps, mx, my + 4, 4, 56, rgb, 3, 0.28, true);
    S.sparks(ps, mx, my + 4, 16, -Math.PI / 2, 1.2, [160, 480], rgb, 1.4, 200);
    S.stars(ps, mx, my, 6, rgb, [60, 220], [7, 12], -Math.PI / 2, 1.1);
    S.plusMinus(ps, mx, my - 8, 3, false ? '+' : '-', rgb, [80, 200]);
    host.shots.push(new SizeShot(host.g, mx, my - 4, false));
    host.shake(4);
    sfx.play(false ? 'grow_fire' : 'shrink_fire');
  }

export function fire_grow(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const rgb = true ? '255,160,50' : '70,255,140';
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new ConvergeRings(mx, my + 4, rgb, true ? 1 : -1, 0.5, 0.65));
    host.addFX(new Light(mx, my, 190, rgb, 0.65, 0.26));
    S.ring(ps, mx, my + 4, 4, 56, rgb, 3, 0.28, true);
    S.sparks(ps, mx, my + 4, 16, -Math.PI / 2, 1.2, [160, 480], rgb, 1.4, 200);
    S.stars(ps, mx, my, 6, rgb, [60, 220], [7, 12], -Math.PI / 2, 1.1);
    S.plusMinus(ps, mx, my - 8, 3, true ? '+' : '-', rgb, [80, 200]);
    host.shots.push(new SizeShot(host.g, mx, my - 4, true));
    host.shake(4);
    sfx.play(true ? 'grow_fire' : 'shrink_fire');
  }

export function fire_magnet(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new FieldLines(mx, my + 6, 0.7, 0.85));
    host.addFX(new Light(mx, my, 190, '255,130,150', 0.6, 0.26));
    S.sparks(ps, mx - 30, my + 6, 12, -Math.PI / 2, 1.0, [160, 460], '255,110,110', 1.4, 200);
    S.sparks(ps, mx + 30, my + 6, 12, -Math.PI / 2, 1.0, [160, 460], '130,170,255', 1.4, 200);
    S.ring(ps, mx, my + 4, 4, 60, '255,200,210', 3, 0.28, true);
    host.shots.push(new MagnetShot(host.g, mx, my - 12));
    host.shake(4);
    sfx.play('magnet_fire');
  }

export function fire_pirate(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fuse = 0.2;
    sfx.play('bamboo_fuse');
    S.sparks(ps, mx + 38, my + 16, 14, -Math.PI / 2, Math.PI, [60, 220], '255,220,120', 1.3, 500);
    S.glow(ps, mx + 38, my + 16, 40, 10, '255,200,100', 0.2, 1);
    host.after(0.2, () => {
      a.fireT = 0;
      a.recoilV += 22;
      host.addFX(new RadialFlash(mx, my + 6, ['255,170,70', '255,240,200', '255,120,40'], 0.17, 100, 16));
      host.addFX(new Light(mx, my - 10, 340, '255,150,60', 1, 0.34));
      host.flashScreen('255,190,90', 0.22);
      S.fire(ps, mx, my + 8, 18, -Math.PI / 2, 0.6, [220, 520], [24, 40], [46, 84], [0.25, 0.5], { g: -120 });
      S.smokeRing(ps, mx, my + 8, 16, '175,170,165', 16, 230, 0.32);
      S.smoke(ps, mx, my - 6, 12, '110,106,102', [24, 90], { vx: [-70, 70], vy: [-190, -60], alpha: 0.6, life: [1.1, 1.8] });
      S.embers(ps, mx, my + 6, 22, -Math.PI / 2, 0.9, [200, 640]);
      S.sparks(ps, mx, my + 6, 20, -Math.PI / 2, 0.8, [250, 700], '255,210,120', 1.5, 300);
      S.coins(ps, mx, my + 8, 6, -Math.PI / 2, 0.8, [260, 520]);
      S.ring(ps, mx, my + 8, 6, 120, '255,200,120', 6, 0.36, true);
      host.shots.push(new PirateShot(host.g, mx, my - 2));
      host.shake(13);
      sfx.play('pirate_fire');
    });
  }

export function fire_card(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const suit = a.idx;
    a.idx = (a.idx + 1) % 4;
    a.fireT = 0;
    a.recoilV += 4;
    host.addFX(new Light(mx, my + 6, 170, '255,225,210', 0.5, 0.22));
    S.cards(ps, mx, my + 8, 8, -Math.PI / 2, 0.95, [200, 470], 0.6);
    S.stars(ps, mx, my + 6, 8, '255,235,170', [60, 240], [7, 13], -Math.PI / 2, 1);
    S.sparks(ps, mx, my + 6, 12, -Math.PI / 2, 0.9, [160, 460], '255,235,190', 1.3, 300);
    S.ring(ps, mx, my + 6, 3, 46, '255,200,210', 2.5, 0.26, true);
    host.shots.push(new CardShot(host.g, mx, my - 4, suit));
    host.shake(3);
    sfx.play('card_fire');
  }

export function fire_holy(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 6;
    host.addFX(new HaloRing(mx, my - 18, 0.45, 0.9));
    host.addFX(new Light(mx, my - 14, 200, '255,230,150', 0.7, 0.26));
    S.feathers(ps, mx, my - 10, 10, -Math.PI / 2, 0.9, [120, 360]);
    S.stars(ps, mx, my - 12, 10, '255,236,170', [80, 280], [7, 13], -Math.PI / 2, 1);
    S.sparks(ps, mx, my - 12, 14, -Math.PI / 2, 1.0, [160, 480], '255,225,140', 1.4, 200);
    S.embers(ps, mx, my - 10, 10, -Math.PI / 2, 0.9, [60, 200], '255,230,150', 2);
    S.ring(ps, mx, my - 14, 4, 60, '255,235,170', 3, 0.3, true);
    host.shots.push(new HolyShot(host.g, mx, my - 16));
    host.shake(4);
    sfx.play('holy_fire');
  }

export function fire_unicorn(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new RainbowBurst(mx, my - 4, 0.26, 0.8));
    host.addFX(new RainbowRings(mx, my - 4, 0.5, 0.5));
    host.addFX(new Light(mx, my - 6, 190, '255,200,245', 0.6, 0.24));
    S.hearts(ps, mx, my - 6, 8, -Math.PI / 2, 1.0, [100, 300]);
    S.rainbowSparks(ps, mx, my - 6, 20, -Math.PI / 2, 1.2, [160, 520], 1.5);
    for (let i = 0; i < 7; i++) S.stars(ps, mx, my - 6, 1, RAINBOW[i], [60, 240], [7, 13], -Math.PI / 2, 1.2);
    host.shots.push(new UnicornShot(host.g, mx, my - 4));
    host.shake(4);
    sfx.play('unicorn_fire');
  }

export function fire_obliterator(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('obl_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 13;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 13 + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['150,255,100', '210,255,170', '100,230,60']) });
    }
    host.addFX(new Light(mx, my - 10, 160, '110,255,80', 0.5, 0.3));
    host.after(0.26, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 8;
      host.addFX(new RadiationPulse(mx, my - 12, 0.5, 0.55));
      host.addFX(new Light(mx, my - 12, 230, '110,255,80', 0.85, 0.3));
      S.smoke(ps, mx, my - 12, 8, '80,190,60', [12, 46], { vx: [-70, 70], vy: [-160, -40], alpha: 0.45, life: [0.6, 1.1] });
      S.goo(ps, mx, my - 12, 8, -Math.PI / 2, 0.8, [160, 420], [1.4, 3], '110,255,80', '30,110,20');
      S.ring(ps, mx, my - 12, 5, 80, '120,255,90', 5, 0.38, true);
      S.sparks(ps, mx, my - 12, 18, -Math.PI / 2, 1.1, [160, 520], '150,255,100', 1.5, 200);
      host.shots.push(new ObliteratorShot(host.g, mx, my - 14));
      host.shake(8);
      sfx.play('obl_fire');
    });
  }

export function fire_coin(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new Light(mx, my - 10, 170, '255,215,100', 0.55, 0.22));
    S.coins(ps, mx, my - 10, 6, -Math.PI / 2, 0.9, [260, 520]);
    S.stars(ps, mx, my - 12, 8, '255,230,130', [60, 240], [7, 13], -Math.PI / 2, 1);
    S.sparks(ps, mx, my - 12, 12, -Math.PI / 2, 1.0, [160, 460], '255,225,120', 1.4, 300);
    S.ring(ps, mx, my - 10, 3, 50, '255,215,100', 3, 0.28, true);
    host.shots.push(new CoinShot(host.g, mx, my - 12));
    host.shake(3);
    sfx.play('coin_fire');
  }

export function fire_saber(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    const ty = my - 114;
    a.fireT = 0;
    a.recoilV += 3;
    host.addFX(new SaberSlash(mx, ty + 20, 0.3, 150, 0.26));
    host.addFX(new Light(mx, ty + 10, 220, '90,210,255', 0.7, 0.26));
    S.sparks(ps, mx, ty + 10, 18, -Math.PI / 2, 1.3, [160, 520], '140,235,255', 1.5, 200);
    S.stars(ps, mx, ty + 10, 8, '200,245,255', [60, 240], [7, 13], -Math.PI / 2, 1.2);
    S.ring(ps, mx, ty + 14, 4, 60, '110,225,255', 3, 0.28, true);
    host.shots.push(new SaberShot(host.g, mx, ty));
    host.shake(5);
    sfx.play('saber_fire');
  }

export function fire_gauntlet(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 16;
    host.addFX(new RadialFlash(mx, my + 10, ['255,170,70', '255,240,200', '255,120,40'], 0.14, 60, 12));
    host.addFX(new Light(mx, my + 4, 220, '255,150,60', 0.7, 0.26));
    S.smoke(ps, mx, my + 50, 10, '215,218,224', [12, 46], { vx: [-100, 100], vy: [-90, 10], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    for (const s of [-1, 1]) S.smoke(ps, mx + s * 28, my + 54, 4, '225,228,232', [10, 36], { vx: [s * 60, s * 190], vy: [-40, 20], alpha: 0.45, life: [0.5, 0.9], drag: 2.4 });
    S.chips(ps, mx, my + 40, 6, -Math.PI / 2, 1.2, [100, 280], ['150,156,166', '110,116,126', '200,206,216']);
    S.sparks(ps, mx, my + 20, 16, -Math.PI / 2, 1.2, [200, 560], '255,200,110', 1.4, 300);
    S.ring(ps, mx, my + 6, 4, 62, '255,200,130', 3, 0.28, true);
    host.shots.push(new GauntletShot(host.g, mx, my));
    host.shake(9);
    sfx.play('gauntlet_fire');
  }

export function fire_ruby(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 7;
    a.spinV += 14;
    host.addFX(new RadialFlash(mx, my - 4, ['255,70,100', '255,200,215', '255,255,255'], 0.12, 70, 14));
    host.addFX(new Light(mx, my - 6, 180, '255,80,110', 0.65, 0.22));
    S.stars(ps, mx, my - 4, 8, '255,150,175', [80, 260], [7, 12], -Math.PI / 2, 1);
    S.sparks(ps, mx, my - 4, 14, -Math.PI / 2, 0.9, [200, 540], '255,110,140', 1.4, 300);
    S.smoke(ps, mx, my - 6, 3, '230,215,220', [8, 28], { vy: [-120, -40], vx: [-40, 40], alpha: 0.28, life: [0.5, 0.9] });
    host.shots.push(new RubyShot(host.g, mx, my - 2));
    host.shake(4);
    sfx.play('ruby_fire');
  }

export function fire_emerald(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('emerald_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 11;
    for (let i = 0; i < 24; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 90);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 11 + Math.sin(an) * d, target: host.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['120,255,180', '200,255,225', '60,230,130']) });
    }
    host.after(0.22, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 5;
      host.addFX(new RadialFlash(mx, my - 12, ['60,255,150', '200,255,225', '255,255,255'], 0.16, 80, 14));
      host.addFX(new Light(mx, my - 12, 230, '60,255,150', 0.85, 0.3));
      S.ring(ps, mx, my - 12, 4, 70, '90,255,170', 4, 0.32, true);
      S.gemShards(ps, mx, my - 12, 6, -Math.PI / 2, 1.0, [160, 400], EMERALD);
      S.sparks(ps, mx, my - 12, 14, -Math.PI / 2, 1.1, [150, 460], '120,255,180', 1.3, 200);
      host.shots.push(new EmeraldBeam(host.g, mx, my - 14));
      host.shake(4);
      sfx.play('emerald_fire');
    });
  }

export function fire_sapphire(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 18;
    host.addFX(new RadialFlash(mx, my - 6, ['90,160,255', '210,228,255', '255,255,255', '60,110,230'], 0.12, 100, 16));
    host.addFX(new Light(mx, my - 20, 300, '90,160,255', 0.9, 0.22));
    host.flashScreen('150,190,255', 0.12);
    S.gemShards(ps, mx, my - 4, 10, -Math.PI / 2, 0.5, [260, 640], SAPPHIRE);
    S.smoke(ps, mx, my - 10, 9, '165,175,205', [12, 58], { vy: [-150, -50], vx: [-45, 45], alpha: 0.45, life: [1, 1.6], drag: 1.8 });
    S.sparks(ps, mx, my - 6, 18, -Math.PI / 2, 0.6, [300, 760], '130,180,255', 1.5, 200);
    S.embers(ps, mx, my - 6, 12, -Math.PI / 2, 0.5, [300, 700], '130,180,255');
    host.shots.push(new SapphireBlast(host.g, mx, my - 4));
    host.shake(9);
    sfx.play('sapphire_fire');
  }

export function fire_crystal(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 9;
    host.addFX(new RadialFlash(mx, my - 6, ['195,120,255', '240,215,255', '255,255,255'], 0.14, 80, 14));
    host.addFX(new Light(mx, my - 10, 220, '180,100,255', 0.7, 0.26));
    S.gemShards(ps, mx, my - 8, 8, -Math.PI / 2, 1.0, [160, 440], AMETHYST);
    S.stars(ps, mx, my - 8, 8, '225,180,255', [60, 240], [7, 13], -Math.PI / 2, 1.1);
    S.ring(ps, mx, my - 8, 4, 64, '190,120,255', 3, 0.3, true);
    S.smoke(ps, mx, my - 8, 4, '170,110,230', [10, 38], { vy: [-120, -40], vx: [-40, 40], alpha: 0.3, life: [0.6, 1] });
    host.shots.push(new CrystalShot(host.g, mx, my - 8));
    host.shake(5);
    sfx.play('crystal_fire');
  }

export function fire_beerifle(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 9;
    host.addFX(new Light(mx, my - 30, 170, '255,210,70', 0.55, 0.22));
    S.bees(ps, mx, my - 30, 6, -Math.PI / 2, 0.8, [180, 480]);
    S.goo(ps, mx, my - 28, 5, -Math.PI / 2, 0.7, [160, 360], [1.3, 2.6], '255,184,30', '150,80,0');
    S.hexes(ps, mx, my - 30, 5, -Math.PI / 2, 0.9, [100, 300]);
    S.sparks(ps, mx, my - 30, 12, -Math.PI / 2, 0.9, [160, 460], '255,215,80', 1.3, 300);
    ps.add({ k: K.TEXT, x: mx, y: my - 62, vy: -70, drag: 1.8, size: 22, text: 'BZZ!', color: '255,226,80', life: 0.75 });
    host.shots.push(new BeeRifleShot(host.g, mx, my - 32));
    host.shake(4);
    sfx.play('beerifle_fire');
  }

export function fire_charge(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('charge_charge');
    host.orbTarget.x = mx;
    host.orbTarget.y = my - 11;
    for (let i = 0; i < 14; i++) {
      const an = rand(0, TAU);
      const d = rand(30, 70);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 11 + Math.sin(an) * d, target: host.orbTarget, pull: 2600, size: rand(1, 2), len: 0.03, life: 0.3, color: pick(['150,230,255', '255,255,255', '70,200,255']) });
    }
    host.after(0.1, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 11;
      host.addFX(new RadialFlash(mx, my - 12, ['60,200,255', '210,248,255', '255,255,255'], 0.14, 90, 14));
      host.addFX(new Light(mx, my - 12, 230, '70,200,255', 0.8, 0.24));
      S.ring(ps, mx, my - 12, 4, 76, '90,210,255', 4, 0.3, true);
      S.sparks(ps, mx, my - 12, 16, -Math.PI / 2, 1.1, [180, 540], '150,230,255', 1.4, 200);
      S.smoke(ps, mx + 18, my + 38, 4, '225,240,250', [8, 30], { vx: [20, 80], vy: [-90, -20], alpha: 0.4, life: [0.5, 0.9] });
      S.smoke(ps, mx - 18, my + 38, 4, '225,240,250', [8, 30], { vx: [-80, -20], vy: [-90, -20], alpha: 0.4, life: [0.5, 0.9] });
      host.shots.push(new ChargeShot(host.g, mx, my - 12));
      host.shake(6);
      sfx.play('charge_fire');
    });
  }

export function fire_pulse(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 5;
    host.addFX(new Light(mx, my - 6, 160, '70,215,255', 0.55, 0.2));
    for (let k = 0; k < 3; k++) host.after(k * 0.05, () => S.ring(ps, mx, my - 4, 3, 40 + k * 10, '110,225,255', 2.5, 0.22, true));
    S.sparks(ps, mx, my - 4, 12, -Math.PI / 2, 0.9, [160, 460], '130,230,255', 1.3, 200);
    S.smoke(ps, mx, my - 4, 3, '215,235,245', [8, 26], { vy: [-100, -30], vx: [-30, 30], alpha: 0.25, life: [0.4, 0.8] });
    host.shots.push(new PulseShot(host.g, mx, my - 4));
    host.shake(3);
    sfx.play('pulse_fire');
  }

export function fire_cryo(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 6;
    host.addFX(new Light(mx, my - 6, 180, '110,215,255', 0.55, 0.24));
    S.smoke(ps, mx, my - 6, 10, '220,244,255', [12, 48], { vx: [-80, 80], vy: [-170, -50], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    S.snowflakes(ps, mx, my - 6, 10, -Math.PI / 2, 1.0, [120, 340]);
    S.crystalShards(ps, mx, my - 6, 6, -Math.PI / 2, 0.8, [200, 460]);
    S.stars(ps, mx, my - 6, 6, '200,245,255', [60, 220], [7, 12], -Math.PI / 2, 1);
    S.ring(ps, mx, my - 6, 4, 56, '150,230,255', 3, 0.28, true);
    host.shots.push(new CryoShot(host.g, mx, my - 4));
    host.shake(4);
    sfx.play('cryo_fire');
  }

export function fire_hyperdrive(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 10;
    host.addFX(new WarpLines(mx, my - 6, 0.3, 0.7));
    host.addFX(new RadialFlash(mx, my - 4, ['130,180,255', '230,240,255', '255,255,255'], 0.12, 80, 14));
    host.addFX(new Light(mx, my - 8, 230, '120,170,255', 0.8, 0.24));
    S.ring(ps, mx, my - 6, 4, 70, '130,180,255', 4, 0.3, true);
    S.sparks(ps, mx, my - 6, 20, -Math.PI / 2, 1.0, [220, 640], '170,205,255', 1.4, 200);
    S.stars(ps, mx, my - 6, 8, '210,228,255', [60, 240], [7, 13], -Math.PI / 2, 1.1);
    host.shots.push(new HyperShot(host.g, mx, my - 4));
    host.shake(6);
    sfx.play('hyper_fire');
  }

export function fire_quantum(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 8;
    host.addFX(new GlitchBurst(mx, my - 10, 0.4, 0.55));
    host.addFX(new Light(mx, my - 10, 200, '170,80,255', 0.7, 0.26));
    S.glitchBits(ps, mx, my - 10, 18, 40);
    S.ring(ps, mx, my - 10, 4, 66, '190,110,255', 3.5, 0.3, true);
    S.sparks(ps, mx, my - 10, 14, -Math.PI / 2, 1.1, [160, 480], '210,150,255', 1.4, 200);
    S.stars(ps, mx, my - 10, 6, '225,185,255', [60, 220], [7, 12], -Math.PI / 2, 1.1);
    host.shots.push(new QuantumShot(host.g, mx, my - 12));
    host.shake(5);
    sfx.play('quantum_fire');
  }

export function fire_wars(host: SevenHost, mx: number, my: number) {
    const a = host.anim;
    const ps = host.particles;
    a.fireT = 0;
    a.recoilV += 7;
    host.addFX(new RadialFlash(mx, my - 6, ['255,70,60', '255,220,210', '255,255,255'], 0.1, 60, 12));
    host.addFX(new Light(mx, my - 8, 170, '255,70,60', 0.65, 0.2));
    S.sparks(ps, mx, my - 6, 12, -Math.PI / 2, 0.8, [200, 520], '255,120,100', 1.3, 300);
    S.smoke(ps, mx, my - 6, 3, '120,110,106', [8, 26], { vy: [-110, -30], vx: [-30, 30], alpha: 0.25, life: [0.4, 0.8] });
    S.ring(ps, mx, my - 6, 3, 40, '255,90,80', 2.5, 0.22, true);
    host.shots.push(new WarsShot(host.g, mx, my - 6));
    host.shake(3);
    sfx.play('wars_fire');
  }

/** Slide-3 fire recipe per weapon (all 71 of SET 1..7). */
export const FIRE_RECIPES = {
  golden: fire_golden,
  blackhole: fire_blackhole,
  ketapel: fire_ketapel,
  sumpit: fire_sumpit,
  shotgun: fire_shotgun,
  soaker: fire_soaker,
  snowball: fire_snowball,
  sniper: fire_sniper,
  flame: fire_flame,
  bubble: fire_bubble,
  bamboo: fire_bamboo,
  banana: fire_banana,
  harpoon: fire_harpoon,
  chicken: fire_chicken,
  confetti: fire_confetti,
  seed: fire_seed,
  pizza: fire_pizza,
  minigun: fire_minigun,
  crossbow: fire_crossbow,
  plasma: fire_plasma,
  laser: fire_laser,
  dragon: fire_dragon,
  gravity: fire_gravity,
  honey: fire_honey,
  coconut: fire_coconut,
  angklung: fire_angklung,
  bee: fire_bee,
  sakura: fire_sakura,
  firework: fire_firework,
  keris: fire_keris,
  moonbeam: fire_moonbeam,
  storm: fire_storm,
  pencil: fire_pencil,
  sandal: fire_sandal,
  paintball: fire_paintball,
  wand: fire_wand,
  shark: fire_shark,
  ghost: fire_ghost,
  ufo: fire_ufo,
  rainbow: fire_rainbow,
  meteor: fire_meteor,
  diamond: fire_diamond,
  fish: fire_fish,
  rpg: fire_rpg,
  cricket: fire_cricket,
  electro: fire_electro,
  bazooka: fire_bazooka,
  freeze: fire_freeze,
  rail: fire_rail,
  shrink: fire_shrink,
  grow: fire_grow,
  magnet: fire_magnet,
  pirate: fire_pirate,
  card: fire_card,
  holy: fire_holy,
  unicorn: fire_unicorn,
  obliterator: fire_obliterator,
  coin: fire_coin,
  saber: fire_saber,
  gauntlet: fire_gauntlet,
  ruby: fire_ruby,
  emerald: fire_emerald,
  sapphire: fire_sapphire,
  crystal: fire_crystal,
  beerifle: fire_beerifle,
  charge: fire_charge,
  pulse: fire_pulse,
  cryo: fire_cryo,
  hyperdrive: fire_hyperdrive,
  quantum: fire_quantum,
  wars: fire_wars,
} as const satisfies Record<SlideThreeId, (host: SevenHost, mx: number, my: number) => void>;
