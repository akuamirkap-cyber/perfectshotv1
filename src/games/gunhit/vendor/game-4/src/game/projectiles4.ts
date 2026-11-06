import { type Ctx, TAU, clamp, drawSprite, glowSprite, lerp, pick, rand, randomPoly } from './core';
import { makeCracks, strokeLines } from './art';
import { DragonSpirit, GravityPulse, HexBurst, RadialFlash, Mandala, SpiralFX } from './fx4';
import { drawBee, drawBlossom, drawCoconut, drawDragonFlame, drawFireRocket, drawGravityOrb, drawHoneyGlob, drawKeris, drawNote, drawPetal, ROCKET_COLS } from './shapes4';
import { GlowLines, GlowSpot, K, Light, Rays, SplashSheet } from './particles';
import * as S from './spawn4';
import { sfx } from './audio';
import { Projectile, fallingCustom, makeItem } from './projectiles';
import type { Game } from './Game';

const GOLDS = ['255,225,120', '255,200,70', '255,245,190', '255,170,40'];
const HONEY_C: [string, string, string] = ['rgba(150,70,0,0.92)', 'rgba(255,176,30,0.96)', 'rgba(255,226,120,0.95)'];

// ───────────────────────── DRAGON FIREBALL ─────────────────────────
export class DragonFire extends Projectile {
  weapon = 'dragon' as const;
  tip = 22;
  half = 0.12;
  lightT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -920);
  }
  trail(dt: number) {
    const g = this.g;
    const ps = g.particles;
    for (let i = 0; i < 2; i++) ps.add({ k: K.FIRE, add: true, x: this.x + rand(-9, 9), y: this.y + rand(12, 70), vx: rand(-34, 34), vy: rand(30, 130), size: rand(16, 28), size2: rand(36, 58), life: rand(0.22, 0.4), alpha: 0.9, g: -90 });
    if (Math.random() < 0.8) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-10, 10), y: this.y + rand(8, 50), vx: rand(-60, 60), vy: rand(30, 140), size: rand(1.4, 2.6), life: rand(0.4, 0.8), color: pick(['255,200,90', '255,140,40']), g: 120, drag: 1.4 });
    if (Math.random() < 0.45) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(30, 90), vx: rand(-20, 20), vy: rand(10, 50), size: 14, size2: 46, life: rand(0.7, 1.1), color: '60,50,46', alpha: 0.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
    this.lightT += dt;
    if (this.lightT > 0.05) {
      this.lightT = 0;
      g.addFX(new Light(this.x, this.y + 10, 190, '255,120,40', 0.55, 0.12));
    }
  }
  draw(ctx: Ctx) {
    drawDragonFlame(ctx, this.x, this.y + 4, this.age, 1);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(12, 'rgba(255,200,120,');
    g.hitStop(0.09);
    g.shake(12);
    g.flashScreen('255,140,50', 0.22);
    g.addFX(new Light(hx, hy, 320, '255,130,40', 1, 0.5));
    g.addFX(new DragonSpirit(hx, hy + 6));
    S.glow(ps, hx, hy, 220, 30, '255,235,190', 0.3, 1);
    S.fire(ps, hx, hy, 40, Math.PI / 2, 1.7, [80, 460], [34, 60], [60, 110], [0.4, 0.8], { g: -220, drag: 2 });
    S.fire(ps, hx, hy - 10, 14, -Math.PI / 2, 1.2, [60, 240], [30, 50], [56, 96], [0.4, 0.7], { g: -160 });
    S.ring(ps, hx, hy, 8, 190, '255,160,60', 12, 0.5, true);
    S.ring(ps, hx, hy, 4, 120, '255,245,210', 3.5, 0.3, true);
    S.sparks(ps, hx, hy, 46, Math.PI / 2, 1.7, [200, 760], '255,200,110', 1.8);
    S.embers(ps, hx, hy, 30, Math.PI / 2, 1.8, [80, 420]);
    S.chips(ps, hx, hy, 16, Math.PI / 2, 1.6, [160, 500]);
    S.smoke(ps, hx, hy, 12, '40,34,30', [22, 90], { vx: [-110, 110], vy: [-70, 70], alpha: 0.65, life: [1, 1.7], drag: 2 });
    const cracks = makeCracks(theta, R, 8, [22, 52], 1.4);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const wide = c.createRadialGradient(cx, cy, 6, cx, cy, 44);
      wide.addColorStop(0, 'rgba(50,24,8,0.6)');
      wide.addColorStop(1, 'rgba(50,24,8,0)');
      c.fillStyle = wide;
      c.beginPath();
      c.arc(cx, cy, 44, 0, TAU);
      c.fill();
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 28);
      rg.addColorStop(0, 'rgba(8,4,2,0.97)');
      rg.addColorStop(0.55, 'rgba(26,12,5,0.75)');
      rg.addColorStop(1, 'rgba(40,20,8,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 28, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(10,5,2,0.92)', 1.5);
    });
    g.addWheelFX(new GlowLines(cracks, '255,110,25', 1.7, 3.4));
    g.addWheelFX(new GlowSpot(lx * 0.94, ly * 0.94, 110, '255,110,30', 2.8, 0.9));
    g.landed(makeItem('dragon', theta, 0.11, 13, false), 0.6);
    sfx.play('dragon_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 280, '255,130,40', 0.9, 0.4));
    g.addFX(new DragonSpirit(hx, hy, 0.45));
    S.fire(ps, hx, hy, 26, Math.PI / 2, 1.7, [80, 380], [30, 50], [54, 96], [0.4, 0.7], { g: -200 });
    S.ring(ps, hx, hy, 6, 140, '255,160,60', 9, 0.4, true);
    S.sparks(ps, hx, hy, 32, Math.PI / 2, 1.6, [200, 650], '255,200,110', 1.6);
    S.smoke(ps, hx, hy, 8, '40,34,30', [20, 80], { vx: [-90, 90], vy: [-40, 70], alpha: 0.6 });
    sfx.play('dragon_hit');
    this.alive = false;
  }
}

// ───────────────────────── GRAVITY ORB ─────────────────────────
export class GravityShot extends Projectile {
  weapon = 'gravity' as const;
  tip = 13;
  half = 0.1;
  r = 11.5;
  ringT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -640);
  }
  trail(dt: number) {
    const g = this.g;
    const ps = g.particles;
    g.lens(this.x, this.y, 50, 0.9);
    for (let i = 0; i < 2; i++) {
      const a = rand(0, TAU);
      const d = rand(40, 76);
      ps.add({ k: K.SPARK, add: true, x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d, target: this, pull: 2000, size: rand(0.9, 2), len: 0.03, life: 0.7, color: pick(['120,200,255', '200,240,255', '80,160,255']) });
    }
    this.ringT += dt;
    if (this.ringT > 0.06) {
      this.ringT = 0;
      S.ring(ps, this.x, this.y + 14, 4, 30, '120,200,255', 1.8, 0.32, true, 0.6);
    }
    if (Math.random() < 0.6) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-5, 5), y: this.y + rand(8, 24), vx: rand(-14, 14), vy: rand(20, 60), size: rand(16, 26), size2: 3, color: '70,150,255', life: rand(0.25, 0.4), alpha: 0.6 });
    if (Math.random() < 0.4) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-12, 12), y: this.y + rand(8, 24), vx: rand(-30, 30), vy: rand(20, 70), size: 1.7, life: 0.55, color: '150,220,255' });
  }
  draw(ctx: Ctx) {
    drawGravityOrb(ctx, this.x, this.y, this.r, this.g.time * 1.7, 1.15);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    const item = makeItem('gravity', theta, 0.1, 16, true);
    g.landed(item, 0.6);
    item.world.x = hx;
    item.world.y = hy;
    g.wheelImpact(3, 'rgba(150,220,255,');
    g.shake(3);
    sfx.play('gravity_charge');
    for (let i = 0; i < 46; i++) {
      if (i % 2 === 0) {
        const a = -Math.PI / 2 + rand(-1.2, 1.2);
        const d = rand(15, 80);
        ps.add({ k: K.CHIP, x: hx + Math.cos(a) * d, y: hy + Math.sin(a) * d, target: item.world, pull: 2600, rot: rand(0, TAU), vrot: rand(-20, 20), poly: randomPoly(4, rand(1.4, 3), 0.5), color: pick(['196,140,80', '222,178,118', '170,112,58']), life: 0.55 });
      } else {
        const a = rand(0, TAU);
        const d = rand(40, 120);
        ps.add({ k: K.SPARK, add: true, x: hx + Math.cos(a) * d, y: hy + Math.sin(a) * d, target: item.world, pull: 2800, size: rand(1, 2.2), len: 0.025, life: 0.6, color: pick(['120,200,255', '200,240,255', '80,160,255']) });
      }
    }
    for (let k = 0; k < 3; k++) g.after(k * 0.08, () => S.ring(ps, hx, hy, 110 - k * 20, 8, k === 1 ? '255,255,255' : '120,205,255', 4 - k, 0.28, true, 0.9));
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const cracks = makeCracks(theta, R, 8, [18, 42], 1.35);
    g.after(0.3, () => {
      const p = item.world;
      g.wheelImpact(16, 'rgba(190,235,255,');
      g.hitStop(0.1);
      g.shake(15);
      g.flashScreen('120,200,255', 0.26);
      g.addFX(new Light(p.x, p.y, 300, '90,180,255', 1, 0.5));
      g.addFX(new GravityPulse(p.x, p.y, 0.6, 1.5));
      g.after(0.1, () => g.addFX(new GravityPulse(p.x, p.y, 0.5, 1)));
      S.glow(ps, p.x, p.y, 190, 30, '200,240,255', 0.3, 1);
      S.ring(ps, p.x, p.y, 8, 180, '120,205,255', 10, 0.5, true);
      S.ring(ps, p.x, p.y, 4, 110, '255,255,255', 4, 0.3, true);
      S.chips(ps, p.x, p.y, 22, Math.PI / 2, 1.5, [160, 520]);
      S.splinters(ps, p.x, p.y, 10, Math.PI / 2, 1.5, [200, 560]);
      S.sparks(ps, p.x, p.y, 36, Math.PI / 2, 1.7, [200, 640], '160,220,255', 1.7);
      S.smoke(ps, p.x, p.y, 10, '150,185,230', [16, 70], { vx: [-120, 120], vy: [-30, 70], alpha: 0.45, life: [0.7, 1.2], drag: 2.4 });
      S.stars(ps, p.x, p.y, 10, '190,235,255', [80, 260], [9, 16], Math.PI / 2, 1.6);
      g.paint((c) => {
        const cx = lx * 0.95;
        const cy = ly * 0.95;
        const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 26);
        rg.addColorStop(0, 'rgba(6,14,36,0.92)');
        rg.addColorStop(0.5, 'rgba(18,36,70,0.55)');
        rg.addColorStop(1, 'rgba(30,60,100,0)');
        c.fillStyle = rg;
        c.beginPath();
        c.arc(cx, cy, 26, 0, TAU);
        c.fill();
        for (const r of [7, 12, 18]) {
          c.strokeStyle = `rgba(160,215,255,${0.5 - r * 0.012})`;
          c.lineWidth = 1.2;
          c.beginPath();
          c.arc(cx, cy, r, 0, TAU);
          c.stroke();
        }
        strokeLines(c, cracks, 'rgba(10,20,40,0.9)', 1.2);
      });
      g.addWheelFX(new GlowLines(cracks, '120,205,255', 1.2, 1.8));
      g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 84, '90,180,255', 2.0, 0.85));
      sfx.play('gravity_hit');
    });
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 240, '90,180,255', 0.85, 0.4));
    g.addFX(new GravityPulse(hx, hy, 0.5, 1.2));
    S.glow(ps, hx, hy, 130, 20, '200,240,255', 0.25, 1);
    S.ring(ps, hx, hy, 6, 130, '120,205,255', 7, 0.45, true);
    S.sparks(ps, hx, hy, 36, Math.PI / 2, Math.PI, [150, 580], '160,220,255', 1.6);
    S.chips(ps, hx, hy, 12, Math.PI / 2, 1.5, [120, 380]);
    sfx.play('gravity_hit');
    this.alive = false;
  }
}

// ───────────────────────── HONEY GLOB ─────────────────────────
export class HoneyShot extends Projectile {
  weapon = 'honey' as const;
  tip = 14;
  half = 0.085;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -980);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.7) ps.add({ k: K.DROP, x: this.x + rand(-5, 5), y: this.y + rand(10, 40), vx: rand(-30, 30), vy: rand(80, 220), g: 700, size: rand(1.2, 2.6), life: 0.5, color: '255,184,30', alpha: 1.4, data: '150,80,0' });
    if (Math.random() < 0.3) S.hexes(ps, this.x + rand(-6, 6), this.y + rand(0, 20), 1, Math.PI / 2, 1.2, [20, 80]);
    if (Math.random() < 0.4) ps.add({ k: K.STAR, add: true, x: this.x + rand(-8, 8), y: this.y + rand(0, 26), vx: rand(-20, 20), vy: rand(0, 40), size: rand(6, 11), life: rand(0.3, 0.5), color: '255,220,110', drag: 2 });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    const L = 70;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,50'), this.x, this.y, 60, 0.35);
    ctx.restore();
    const w = 3.4 + Math.sin(t * 20) * 0.6;
    ctx.beginPath();
    ctx.moveTo(this.x - w, this.y + 8);
    ctx.quadraticCurveTo(this.x + Math.sin(t * 25) * 3, this.y + L * 0.5, this.x, this.y + L);
    ctx.quadraticCurveTo(this.x + Math.sin(t * 25 + 1) * 3, this.y + L * 0.5, this.x + w, this.y + 8);
    ctx.closePath();
    ctx.fillStyle = lerpGrad(ctx, this.x, this.y + 8, this.y + L);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,70,0,0.6)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.save();
    ctx.translate(this.x, this.y + 3);
    drawHoneyGlob(ctx, 10.5, t, 1);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(8, 'rgba(255,220,120,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new Light(hx, hy, 190, '255,190,60', 0.7, 0.3));
    g.addFX(new HexBurst(hx, hy + 10, 0.42, 1));
    S.glow(ps, hx, hy, 110, 16, '255,240,190', 0.2, 1);
    S.goo(ps, hx - 3, hy, 14, Math.PI - 0.3, 0.5, [200, 460], [1.8, 3.8], '255,184,30', '150,80,0');
    S.goo(ps, hx + 3, hy, 14, 0.3, 0.5, [200, 460], [1.8, 3.8], '255,184,30', '150,80,0');
    S.goo(ps, hx, hy, 16, Math.PI / 2, 1.4, [100, 380], [1.4, 3.4], '255,184,30', '150,80,0');
    S.goo(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 420], [1.2, 2.6], '255,226,120', '170,100,10');
    S.strands(ps, hx, hy, 7, Math.PI / 2, 1.2, [120, 340], '#ffc928', '#a85500');
    S.hexes(ps, hx, hy, 12, Math.PI / 2, 1.6, [100, 360]);
    S.stars(ps, hx, hy, 8, '255,225,130', [80, 240], [8, 14], Math.PI / 2, 1.6);
    S.smoke(ps, hx, hy, 5, '255,238,190', [10, 40], { vx: [-90, 90], vy: [-20, 60], alpha: 0.3, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 60, '255,200,80', 3.5, 0.32, true);
    g.addDecal({ kind: 'goo', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(11, 1, 0.4), next: 0.1, c: HONEY_C, drip: '255,184,30', dripData: '150,80,0' });
    g.landed(makeItem('honey', theta, 0.085, 11, false), 0.3);
    sfx.play('honey_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.goo(ps, hx, hy, 24, Math.PI / 2, 1.3, [150, 460], [1.6, 3.6], '255,184,30', '150,80,0');
    S.strands(ps, hx, hy, 4, Math.PI / 2, 1.2, [100, 300], '#ffc928', '#a85500');
    S.hexes(ps, hx, hy, 8, Math.PI / 2, 1.5, [80, 300]);
    this.g.addFX(new HexBurst(hx, hy + 8, 0.34, 0.8));
    sfx.play('honey_hit');
    this.alive = false;
  }
}

function lerpGrad(ctx: Ctx, x: number, y0: number, y1: number) {
  const g = ctx.createLinearGradient(x, y0, x, y1);
  g.addColorStop(0, 'rgba(255,200,40,0.95)');
  g.addColorStop(1, 'rgba(240,150,0,0.05)');
  return g;
}

// ───────────────────────── COCONUT ─────────────────────────
export class CoconutShot extends Projectile {
  weapon = 'coconut' as const;
  tip = 12;
  half = 0.09;
  rot = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
  }
  trail(dt: number) {
    this.rot += dt * 14;
    const ps = this.g.particles;
    if (Math.random() < 0.6) ps.add({ k: K.SMOKE, x: this.x + rand(-4, 4), y: this.y + rand(8, 18), vx: rand(-14, 14), vy: rand(10, 36), size: 7, size2: 22, life: 0.5, color: '210,235,190', alpha: 0.32, rot: rand(0, TAU) });
    if (Math.random() < 0.25) S.leaves(ps, this.x + rand(-6, 6), this.y + rand(8, 20), 1, Math.PI / 2, 1.3, [20, 80]);
    if (Math.random() < 0.3) ps.add({ k: K.STAR, add: true, x: this.x + rand(-8, 8), y: this.y + rand(4, 26), vx: rand(-20, 20), vy: rand(0, 40), size: rand(6, 10), life: 0.4, color: '220,255,200', drag: 2 });
  }
  draw(ctx: Ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(this.x + s * 9, this.y + 6);
      ctx.lineTo(this.x + s * 6, this.y + 48);
      ctx.stroke();
    }
    for (let i = 3; i >= 1; i--) {
      ctx.globalAlpha = (0.16 * (4 - i)) / 3;
      ctx.save();
      ctx.translate(this.x, this.y + i * 10);
      ctx.rotate(this.rot - i * 0.3);
      drawCoconut(ctx, 11.5);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawCoconut(ctx, 11.5);
    ctx.restore();
  }
  private burst(hx: number, hy: number, n: number) {
    const g = this.g;
    const ps = g.particles;
    S.coconutHalves(ps, hx, hy, n, Math.PI / 2, 1.5, [140, 420]);
    S.chips(ps, hx, hy, 12, Math.PI / 2, 1.5, [100, 360], ['248,244,230', '236,228,206', '255,252,240']);
    S.fibers(ps, hx, hy, 16, Math.PI / 2, 1.6, [120, 400]);
    S.droplets(ps, hx - 3, hy, 12, Math.PI - 0.3, 0.45, [200, 460], [1.4, 3.2], '225,242,255');
    S.droplets(ps, hx + 3, hy, 12, 0.3, 0.45, [200, 460], [1.4, 3.2], '225,242,255');
    S.droplets(ps, hx, hy, 14, Math.PI / 2, 1.4, [100, 380], [1.2, 3], '235,248,255');
    g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 52, 0.24));
    S.smoke(ps, hx, hy, 8, '245,250,240', [12, 52], { vx: [-100, 100], vy: [-20, 60], alpha: 0.4, life: [0.6, 1.1] });
    S.ring(ps, hx, hy, 4, 56, '230,248,255', 3, 0.3, true);
    S.stars(ps, hx, hy, 6, '230,255,235', [80, 220], [8, 13], Math.PI / 2, 1.6);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    g.wheelImpact(8, 'rgba(240,255,240,');
    g.hitStop(0.05);
    g.shake(7);
    g.addFX(new Light(hx, hy, 170, '230,255,220', 0.55, 0.28));
    S.glow(g.particles, hx, hy, 100, 14, '255,255,245', 0.2, 0.9);
    this.burst(hx, hy, 6);
    g.addDecal({ kind: 'wet', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(10, 1, 0.45), next: 0.1 });
    g.landed(makeItem('coconut', theta, 0.09, 10, false), 0.3);
    sfx.play('coconut_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.burst(hx, hy, 4);
    fallingCustom(this.g, hx, hy, (c) => drawCoconut(c, 11.5));
    sfx.play('coconut_hit');
    this.alive = false;
  }
}

// ───────────────────────── MUSICAL NOTE ─────────────────────────
export class NoteShot extends Projectile {
  weapon = 'angklung' as const;
  tip = 18;
  half = 0.085;
  waveT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -980);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    this.waveT += dt;
    if (this.waveT > 0.05) {
      this.waveT = 0;
      S.ring(ps, this.x, this.y + 20, 4, 28, '255,215,100', 1.8, 0.28, true, 0.6);
    }
    if (Math.random() < 0.18) S.notes(ps, this.x + rand(-8, 8), this.y + rand(20, 36), 1, Math.PI / 2, 0.9, [20, 70]);
    if (Math.random() < 0.6) ps.add({ k: K.STAR, add: true, x: this.x + rand(-10, 10), y: this.y + rand(0, 30), vx: rand(-25, 25), vy: rand(0, 50), size: rand(6, 11), life: rand(0.3, 0.5), color: pick(GOLDS), drag: 2 });
    if (Math.random() < 0.5) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-8, 8), y: this.y + rand(4, 26), vx: rand(-30, 30), vy: rand(10, 60), size: 1.6, life: 0.45, color: '255,220,110' });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const ph = (t * 3 + k / 3) % 1;
      ctx.strokeStyle = `rgba(255,225,130,${0.7 * (1 - ph)})`;
      ctx.lineWidth = 3 - k * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y + 6 + ph * 30, 12 + ph * 16, Math.PI * 0.18, Math.PI * 0.82);
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('255,205,80'), this.x, this.y + 4, 74, 0.5);
    drawSprite(ctx, glowSprite('255,248,210'), this.x, this.y + 4, 34, 0.6);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x - 2, this.y + 10);
    ctx.rotate(Math.sin(t * 9) * 0.14);
    drawNote(ctx, 1.3, 0);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(8, 'rgba(255,235,170,');
    g.hitStop(0.05);
    g.shake(7);
    g.addFX(new Light(hx, hy, 200, '255,210,90', 0.75, 0.35));
    g.addFX(new GravityPulse(hx, hy, 0.5, 1.1, '255,215,100'));
    S.glow(ps, hx, hy, 120, 16, '255,245,200', 0.2, 1);
    S.ring(ps, hx, hy, 5, 100, '255,215,100', 5, 0.42, true);
    S.ring(ps, hx, hy, 4, 70, '255,255,255', 3, 0.3, true);
    S.ring(ps, hx, hy, 3, 130, '255,190,60', 3, 0.5, true);
    S.notes(ps, hx, hy, 12, Math.PI / 2, 1.5, [120, 360]);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [180, 520], '255,225,130', 1.5);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [100, 340]);
    S.splinters(ps, hx, hy, 8, Math.PI / 2, 1.4, [140, 420]);
    S.stars(ps, hx, hy, 10, '255,235,160', [80, 260], [9, 16], Math.PI / 2, 1.6);
    g.after(0.12, () => {
      S.ring(ps, hx, hy, 4, 90, '255,230,150', 3, 0.4, true);
      S.notes(ps, hx, hy, 6, Math.PI / 2, 1.5, [80, 260]);
      sfx.play('angklung_echo');
    });
    const cracks = makeCracks(theta, R, 6, [16, 38], 1.3);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 14);
      rg.addColorStop(0, 'rgba(30,14,4,0.7)');
      rg.addColorStop(1, 'rgba(30,14,4,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 14, 0, TAU);
      c.fill();
      for (const r of [8, 14, 20]) {
        c.strokeStyle = `rgba(255,225,150,${0.4 - r * 0.012})`;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(cx, cy, r, 0, TAU);
        c.stroke();
      }
      strokeLines(c, cracks, 'rgba(30,14,4,0.88)', 1.15);
    });
    g.addWheelFX(new GlowLines(cracks, '255,210,90', 1.1, 1.3));
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 56, '255,200,80', 1.0, 0.7));
    g.landed(makeItem('angklung', theta, 0.085, 36, false, { wob: 0.3 }), 0.3);
    sfx.play('angklung_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new GravityPulse(hx, hy, 0.4, 0.9, '255,215,100'));
    S.notes(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 340]);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.4, [180, 520], '255,225,130', 1.4);
    S.ring(ps, hx, hy, 4, 80, '255,215,100', 4, 0.34, true);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, -8);
      drawNote(c, 1.2, 0);
    });
    sfx.play('angklung_hit');
    this.alive = false;
  }
}

// ───────────────────────── BEE SWARM ─────────────────────────
export class BeeSwarm extends Projectile {
  weapon = 'bee' as const;
  tip = 8;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -820);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.5) ps.add({ k: K.SPARK, add: true, x: this.x + rand(-16, 16), y: this.y + rand(10, 60), vx: rand(-20, 20), vy: rand(20, 80), size: 1.2, len: 0.04, life: rand(0.25, 0.45), color: '255,215,80' });
      if (Math.random() < 0.3) ps.add({ k: K.DROP, x: this.x + rand(-12, 12), y: this.y + rand(20, 60), vx: rand(-20, 20), vy: rand(60, 160), g: 600, size: rand(1, 1.9), life: 0.4, color: '255,184,30', alpha: 1.4, data: '150,80,0' });
      if (Math.random() < 0.25) ps.add({ k: K.STAR, add: true, x: this.x + rand(-16, 16), y: this.y + rand(0, 50), vx: rand(-20, 20), vy: rand(0, 40), size: rand(5, 9), life: 0.35, color: '255,235,140', drag: 2 });
    }
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,200,60'), this.x, this.y + 18, 90, 0.28);
    ctx.restore();
    const N = 11;
    for (let i = N - 1; i >= 0; i--) {
      const k = i / N;
      const ox = Math.sin(t * 10 + i * 2.3) * (5 + k * 17);
      const oy = k * 52 + Math.cos(t * 8 + i * 1.7) * 5;
      ctx.save();
      ctx.translate(this.x + ox, this.y + oy);
      ctx.rotate(Math.sin(t * 10 + i * 2.3 + 1.2) * 0.35);
      drawBee(ctx, i === 0 ? 1.35 : 0.9 - k * 0.14, Math.sin(t * 70 + i * 1.9));
      ctx.restore();
    }
  }
  private swarm(hx: number, hy: number, n: number) {
    const ps = this.g.particles;
    S.bees(ps, hx, hy, n, Math.PI / 2, 1.7, [160, 440]);
    S.bees(ps, hx, hy, Math.round(n * 0.7), -Math.PI / 2, 1.2, [120, 320]);
    ps.add({ k: K.TEXT, x: hx, y: hy + 48, vy: -40, drag: 1.5, size: 26, text: 'BZZT!', color: '255,220,60', life: 0.85 });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(7, 'rgba(255,235,150,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new Light(hx, hy, 170, '255,210,80', 0.6, 0.28));
    S.glow(ps, hx, hy, 100, 14, '255,240,170', 0.2, 0.9);
    this.swarm(hx, hy, 12);
    S.goo(ps, hx - 3, hy, 8, Math.PI - 0.3, 0.6, [160, 380], [1.6, 3], '255,184,30', '150,80,0');
    S.goo(ps, hx + 3, hy, 8, 0.3, 0.6, [160, 380], [1.6, 3], '255,184,30', '150,80,0');
    S.hexes(ps, hx, hy, 8, Math.PI / 2, 1.6, [100, 320]);
    S.stars(ps, hx, hy, 8, '255,230,130', [80, 240], [8, 14], Math.PI / 2, 1.6);
    S.ring(ps, hx, hy, 4, 66, '255,215,90', 3.5, 0.32, true);
    S.splinters(ps, hx, hy, 6, Math.PI / 2, 1.4, [100, 300]);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const dots = Array.from({ length: 9 }, () => ({ a: rand(0, TAU), d: rand(3, 22), r: rand(0.9, 1.7) }));
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const sm = c.createRadialGradient(cx, cy, 1, cx, cy, 18);
      sm.addColorStop(0, 'rgba(255,200,60,0.4)');
      sm.addColorStop(1, 'rgba(255,200,60,0)');
      c.fillStyle = sm;
      c.beginPath();
      c.arc(cx, cy, 18, 0, TAU);
      c.fill();
      for (const d of dots) {
        c.fillStyle = 'rgba(25,12,4,0.88)';
        c.beginPath();
        c.arc(cx + Math.cos(d.a) * d.d, cy + Math.sin(d.a) * d.d, d.r, 0, TAU);
        c.fill();
        c.strokeStyle = 'rgba(255,190,60,0.5)';
        c.lineWidth = 0.6;
        c.stroke();
      }
    });
    g.addDecal({ kind: 'goo', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(9, 1, 0.4), next: 0.4, c: HONEY_C, drip: '255,184,30', dripData: '150,80,0' });
    g.landed(makeItem('bee', theta, 0.08, 22, false), 0.4);
    sfx.play('bee_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.swarm(hx, hy, 10);
    S.goo(this.g.particles, hx, hy, 12, Math.PI / 2, 1.4, [120, 360], [1.4, 3], '255,184,30', '150,80,0');
    sfx.play('bee_hit');
    this.alive = false;
  }
}

// ───────────────────────── SAKURA PETAL VORTEX ─────────────────────────
export class SakuraShot extends Projectile {
  weapon = 'sakura' as const;
  tip = 11;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -900);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.5) S.petals(ps, this.x + rand(-10, 10), this.y + rand(8, 28), 1, Math.PI / 2, 1.3, [10, 60], [0.8, 1.5], 80);
      if (Math.random() < 0.6) ps.add({ k: K.STAR, add: true, x: this.x + rand(-12, 12), y: this.y + rand(0, 30), vx: rand(-25, 25), vy: rand(0, 50), size: rand(6, 11), life: rand(0.3, 0.5), color: pick(['255,200,225', '255,240,248', '255,170,205']), drag: 2 });
      if (Math.random() < 0.4) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-10, 10), y: this.y + rand(4, 26), vx: rand(-30, 30), vy: rand(10, 60), size: 1.6, life: 0.45, color: '255,190,215' });
    }
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 0; k < 2; k++) {
      ctx.strokeStyle = `rgba(255,190,215,${0.45 - k * 0.12})`;
      ctx.lineWidth = 3 - k;
      ctx.beginPath();
      for (let i = 0; i <= 18; i++) {
        const u = i / 18;
        const px = this.x + Math.sin(u * 9 - t * 18 + k * 3) * (4 + u * 12);
        const py = this.y + 8 + u * 64;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('255,170,200'), this.x, this.y, 76, 0.42);
    drawSprite(ctx, glowSprite('255,240,248'), this.x, this.y, 32, 0.55);
    ctx.restore();
    for (let i = 0; i < 9; i++) {
      const a = t * 7 + (i * TAU) / 9;
      const rr = 11 + (i % 3) * 5;
      ctx.save();
      ctx.translate(this.x + Math.cos(a) * rr, this.y + Math.sin(a) * rr * 0.55 + (i % 3) * 3);
      ctx.rotate(a + 1);
      ctx.scale(0.7 + 0.3 * Math.abs(Math.cos(a * 2)), 1);
      drawPetal(ctx, 7 - (i % 3));
      ctx.restore();
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    drawBlossom(ctx, 9.5, 1, t * 4);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(7, 'rgba(255,215,230,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new Light(hx, hy, 200, '255,170,205', 0.65, 0.35));
    g.addFX(new SpiralFX(hx, hy + 8, '255,170,205', 0.55, 4, 90, 1));
    g.addFX(new Rays(hx, hy, '255,190,215', 0.45, 12, Math.PI / 2, Math.PI * 0.8, 0.9));
    S.glow(ps, hx, hy, 130, 18, '255,240,246', 0.24, 1);
    S.ring(ps, hx, hy, 5, 92, '255,160,200', 4, 0.4, true);
    S.ring(ps, hx, hy, 4, 60, '255,255,255', 3, 0.28, true);
    S.petals(ps, hx, hy, 46, Math.PI / 2, 1.9, [90, 400], [1.4, 2.6], 70);
    S.petals(ps, hx, hy, 12, -Math.PI / 2, 1.3, [60, 220], [1.4, 2.4], 50);
    S.stars(ps, hx, hy, 12, '255,220,235', [80, 260], [9, 16], Math.PI / 2, 1.6);
    S.sparks(ps, hx, hy, 14, Math.PI / 2, 1.6, [180, 480], '255,210,230', 1.3, 400);
    S.smoke(ps, hx, hy, 6, '255,230,240', [14, 56], { vx: [-90, 90], vy: [-20, 60], alpha: 0.3, life: [0.7, 1.2] });
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const rot = rand(0, TAU);
    const scat = Array.from({ length: 7 }, () => ({ a: rand(0, TAU), d: rand(10, 26), r: rand(0, TAU) }));
    g.paint((c) => {
      const cx = lx * 0.9;
      const cy = ly * 0.9;
      const sm = c.createRadialGradient(cx, cy, 1, cx, cy, 24);
      sm.addColorStop(0, 'rgba(255,170,200,0.35)');
      sm.addColorStop(1, 'rgba(255,170,200,0)');
      c.fillStyle = sm;
      c.beginPath();
      c.arc(cx, cy, 24, 0, TAU);
      c.fill();
      for (const s of scat) {
        c.save();
        c.translate(cx + Math.cos(s.a) * s.d, cy + Math.sin(s.a) * s.d);
        c.rotate(s.r);
        c.globalAlpha = 0.9;
        drawPetal(c, 5);
        c.restore();
      }
      c.save();
      c.translate(cx, cy);
      c.globalAlpha = 0.96;
      drawBlossom(c, 14, 1, rot);
      c.restore();
    });
    g.addWheelFX(new GlowSpot(lx * 0.92, ly * 0.92, 60, '255,170,205', 1.0, 0.7));
    g.landed(makeItem('sakura', theta, 0.1, 26, false), 0.4);
    sfx.play('sakura_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new SpiralFX(hx, hy + 8, '255,170,205', 0.45, 3, 70, 1));
    S.petals(ps, hx, hy, 30, Math.PI / 2, 1.8, [90, 360], [1.2, 2.2], 70);
    S.ring(ps, hx, hy, 4, 70, '255,160,200', 3.5, 0.34, true);
    S.stars(ps, hx, hy, 8, '255,220,235', [60, 220], [8, 14], Math.PI / 2, 1.6);
    sfx.play('sakura_hit');
    this.alive = false;
  }
}

// ───────────────────────── FIREWORK ROCKET ─────────────────────────
export class FireworkShot extends Projectile {
  weapon = 'firework' as const;
  tip = 17 * 1.35;
  half = 0.085;
  baseX: number;
  startY: number;
  ci: number;
  /** Optional independent lane for twin launchers; single guns aim at the wheel centre. */
  targetX?: number;
  constructor(g: Game, x: number, y: number, ci: number) {
    super(g, x, y, -940);
    this.baseX = x;
    this.startY = y;
    this.ci = ci;
  }
  trail() {
    const g = this.g;
    const ps = g.particles;
    const w = g.wheel;
    const bottom = w.y + w.bumpY + w.R;
    const prog = clamp((this.startY - this.y) / Math.max(1, this.startY - bottom), 0, 1);
    this.x = lerp(this.baseX, this.targetX ?? w.x, prog) + Math.sin(this.age * 28) * 2.4;
    const col = ROCKET_COLS[this.ci].burst;
    for (let i = 0; i < 3; i++) ps.add({ k: K.SPARK, add: true, x: this.x + rand(-3, 3), y: this.y + 22, vx: rand(-60, 60), vy: rand(60, 220), g: 380, drag: 1.5, size: rand(1.2, 2.2), len: 0.03, life: rand(0.35, 0.8), color: pick(['255,225,130', '255,200,90', col[0]]) });
    if (Math.random() < 0.6) ps.add({ k: K.SMOKE, x: this.x + rand(-3, 3), y: this.y + rand(24, 40), vx: rand(-16, 16), vy: rand(10, 50), size: 7, size2: 26, life: rand(0.5, 0.9), color: '235,235,240', alpha: 0.3, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < 0.5) ps.add({ k: K.STAR, add: true, x: this.x + rand(-6, 6), y: this.y + rand(20, 60), vx: rand(-30, 30), vy: rand(20, 90), size: rand(5, 10), life: rand(0.3, 0.6), color: '255,240,190', drag: 2 });
  }
  draw(ctx: Ctx) {
    const col = ROCKET_COLS[this.ci].burst[0];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y + 20, 0, this.y + 100);
    gr.addColorStop(0, 'rgba(255,230,150,0.75)');
    gr.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(this.x - 2.4, this.y + 20, 4.8, 80);
    drawSprite(ctx, glowSprite(col), this.x, this.y + 14, 60, 0.35);
    drawSprite(ctx, glowSprite('255,190,80'), this.x, this.y + 30, 40, 0.6);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 17 * 1.35);
    ctx.rotate(Math.sin(this.age * 28 + 1) * 0.1);
    ctx.scale(1.35, 1.35);
    drawFireRocket(ctx, this.ci, 1, this.age * 1.2, 22);
    ctx.restore();
  }
  private boom(hx: number, hy: number, scale: number) {
    const g = this.g;
    const ps = g.particles;
    const cols = ROCKET_COLS[this.ci].burst;
    g.addFX(new RadialFlash(hx, hy, cols, 0.2, 130 * scale, 18));
    g.addFX(new Light(hx, hy, 300 * scale, cols[0], 1, 0.5));
    S.fireworkBurst(ps, hx, hy, this.ci, scale);
    S.ring(ps, hx, hy, 6, 150 * scale, cols[0], 6, 0.5, true);
    S.ring(ps, hx, hy, 4, 90 * scale, '255,255,255', 3, 0.3, true);
    S.smoke(ps, hx, hy, 8, '215,215,225', [18, 70], { vx: [-100, 100], vy: [-60, 70], alpha: 0.4, life: [0.9, 1.5], drag: 2.2 });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    const cols = ROCKET_COLS[this.ci].burst;
    g.wheelImpact(10, 'rgba(255,240,210,');
    g.hitStop(0.07);
    g.shake(10);
    g.flashScreen('255,235,200', 0.2);
    this.boom(hx, hy, 1);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [200, 640], '255,225,130', 1.6);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380]);
    g.after(0.2, () => {
      for (let i = 0; i < 4; i++) {
        const a = rand(0, TAU);
        const d = rand(30, 80);
        const cx = hx + Math.cos(a) * d;
        const cy = hy + Math.sin(a) * d * 0.7 - 20;
        S.stars(ps, cx, cy, 5, pick(cols), [40, 160], [8, 13], 0, Math.PI);
        S.sparks(ps, cx, cy, 10, 0, Math.PI, [80, 260], pick(cols), 1.3, 300);
        S.ring(ps, cx, cy, 2, 22, '255,255,255', 1.6, 0.18, true);
      }
      sfx.play('firework_crackle');
    });
    const cracks = makeCracks(theta, R, 5, [12, 28], 1.3);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const spots = Array.from({ length: 10 }, () => ({ a: rand(0, TAU), d: rand(4, 24), r: rand(1.2, 2.6), c: pick(cols) }));
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 22);
      rg.addColorStop(0, 'rgba(10,5,2,0.9)');
      rg.addColorStop(0.5, 'rgba(30,15,6,0.55)');
      rg.addColorStop(1, 'rgba(40,20,8,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 22, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(20,10,4,0.85)', 1.1);
      for (const s of spots) {
        c.fillStyle = `rgba(${s.c},0.55)`;
        c.beginPath();
        c.arc(cx + Math.cos(s.a) * s.d, cy + Math.sin(s.a) * s.d, s.r, 0, TAU);
        c.fill();
      }
    });
    g.addWheelFX(new GlowLines(cracks, cols[0], 1.1, 1.2));
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 70, cols[0], 1.2, 0.8));
    g.landed(makeItem('firework', theta, 0.085, 32, false, { shape: [this.ci] }), 0.5);
    sfx.play('firework_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.boom(hx, hy, 0.8);
    sfx.play('firework_hit');
    this.alive = false;
  }
}

// ───────────────────────── SPIRIT KERIS ─────────────────────────
export class KerisShot extends Projectile {
  weapon = 'keris' as const;
  tip = 0;
  half = 0.06;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1500);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.7) ps.add({ k: K.STAR, add: true, x: this.x + rand(-8, 8), y: this.y + rand(10, 80), vx: rand(-30, 30), vy: rand(10, 80), size: rand(7, 14), life: rand(0.35, 0.65), color: pick(GOLDS), drag: 2.4 });
    for (let i = 0; i < 2; i++) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-7, 7), y: this.y + rand(20, 90), vx: rand(-40, 40), vy: rand(20, 100), size: rand(1.4, 2.4), life: rand(0.4, 0.8), color: pick(GOLDS) });
    if (Math.random() < 0.35) ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + rand(40, 100), vx: rand(-14, 14), vy: rand(10, 40), size: 8, size2: 30, life: rand(0.6, 1), color: '255,240,200', alpha: 0.22, rot: rand(0, TAU) });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = `rgba(255,${200 + k * 12},${90 + k * 25},${0.5 - k * 0.09})`;
      ctx.lineWidth = 5 - k;
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const u = i / 16;
        const px = this.x + Math.sin(u * 9 - t * 22 + k * 1.6) * (3 + 9 * u);
        const py = this.y + 20 + u * 130;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('255,200,80'), this.x, this.y + 36, 130, 0.45);
    drawSprite(ctx, glowSprite('255,248,210'), this.x, this.y + 6, 40, 0.8);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    drawKeris(ctx, 62, 11);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(11, 'rgba(255,240,200,');
    g.hitStop(0.08);
    g.shake(9);
    g.flashScreen('255,225,140', 0.16);
    g.addFX(new Light(hx, hy, 260, '255,200,80', 0.95, 0.45));
    g.addFX(new Mandala(hx, hy + 6, 0.6, 1.2, 0.5, 1));
    g.addFX(new Mandala(hx, hy + 6, 0.5, 0.8, 0.5, -1));
    g.addFX(new Rays(hx, hy, '255,215,110', 0.55, 16, Math.PI / 2, Math.PI * 0.85, 1.1));
    S.glow(ps, hx, hy, 170, 24, '255,245,200', 0.26, 1);
    S.ring(ps, hx, hy, 6, 120, '255,215,100', 6, 0.45, true);
    S.ring(ps, hx, hy, 4, 80, '255,255,255', 3, 0.3, true);
    S.sparks(ps, hx, hy, 40, Math.PI / 2, 1.6, [220, 700], '255,225,130', 1.8);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.2, [300, 700], '255,250,220', 1.2);
    S.stars(ps, hx, hy, 14, '255,230,150', [80, 280], [9, 17], Math.PI / 2, 1.6);
    S.smoke(ps, hx, hy, 10, '255,240,205', [16, 66], { vx: [-80, 80], vy: [-70, 40], alpha: 0.32, life: [0.9, 1.5], drag: 2 });
    S.chips(ps, hx, hy, 12, Math.PI / 2, 1.5, [140, 420]);
    S.splinters(ps, hx, hy, 8, Math.PI / 2, 1.4, [200, 520]);
    const cracks = makeCracks(theta, R, 6, [14, 34], 1.2);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 14);
      rg.addColorStop(0, 'rgba(30,14,4,0.85)');
      rg.addColorStop(1, 'rgba(30,14,4,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 14, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(255,225,170,0.28)', 0.6, 0.5, 0.5);
      strokeLines(c, cracks, 'rgba(30,14,4,0.9)', 1.15);
    });
    g.addWheelFX(new GlowLines(cracks, '255,210,90', 1.3, 2));
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 70, '255,200,80', 1.6, 0.85));
    g.landed(makeItem('keris', theta, 0.06, 40, false, { wob: 0.22 }), 0.35);
    sfx.play('keris_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 220, '255,200,80', 0.85, 0.35));
    g.addFX(new Mandala(hx, hy + 4, 0.45, 0.9, 0.5, 1));
    S.sparks(ps, hx, hy, 34, Math.PI / 2, 1.5, [200, 620], '255,225,130', 1.6);
    S.ring(ps, hx, hy, 4, 80, '255,215,100', 4, 0.34, true);
    S.stars(ps, hx, hy, 8, '255,230,150', [60, 220], [8, 14], Math.PI / 2, 1.6);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, -30);
      drawKeris(c, 62, 11);
    });
    sfx.play('keris_hit');
    this.alive = false;
  }
}

