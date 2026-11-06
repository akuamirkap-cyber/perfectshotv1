import { type Ctx, TAU, drawSprite, glowSprite, makeBolt, pick, rand, randomPoly } from './core';
import { makeCracks, strokeLines } from './art';
import { RadialFlash } from './fx4';
import { ComicPop } from './fx5';
import { ConvergeRings, FieldLines, FrostBloom } from './fx6';
import { GlowLines, GlowSpot, K, Light, Lightning, Rays, SplashSheet } from './particles';
import { GROW_PAL, SHRINK_PAL, drawCannonball, drawFish, drawMagnet, drawMissile, drawPlayingCard, drawSizeOrb } from './shapes6';
import { drawElectricOrb, strokeBolt } from './shapes5';
import * as S from './spawn6';
import { sfx } from './audio';
import { Projectile, fallingCustom, makeItem } from './projectiles';
import type { Game } from './Game';

// ───────────────────────── helpers ─────────────────────────
export function loc(g: Game, theta: number, k = 0.94) {
  const R = g.wheel.R;
  return { x: Math.cos(theta) * R * k, y: Math.sin(theta) * R * k };
}

export function woodCracks(g: Game, theta: number, n: number, len: [number, number], rgb: string, glowLife: number, spread = 1.3) {
  const cracks = makeCracks(theta, g.wheel.R, n, len, spread);
  g.paint((c) => {
    strokeLines(c, cracks, 'rgba(255,225,180,0.25)', 0.6, 0.5, 0.5);
    strokeLines(c, cracks, 'rgba(30,14,4,0.9)', 1.2);
  });
  g.addWheelFX(new GlowLines(cracks, rgb, 1.2, glowLife));
  return cracks;
}

export function crater(g: Game, theta: number, k: number, rgb: string, glowLife: number) {
  const R = g.wheel.R;
  const p = loc(g, theta, 0.94);
  const cracks = makeCracks(theta, R, 7, [18 * k, 46 * k], 1.4);
  g.paint((c) => {
    const wide = c.createRadialGradient(p.x, p.y, 6, p.x, p.y, 44 * k);
    wide.addColorStop(0, 'rgba(50,24,8,0.6)');
    wide.addColorStop(1, 'rgba(50,24,8,0)');
    c.fillStyle = wide;
    c.beginPath();
    c.arc(p.x, p.y, 44 * k, 0, TAU);
    c.fill();
    const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 28 * k);
    rg.addColorStop(0, 'rgba(8,4,2,0.97)');
    rg.addColorStop(0.55, 'rgba(26,12,5,0.78)');
    rg.addColorStop(1, 'rgba(40,20,8,0)');
    c.fillStyle = rg;
    c.beginPath();
    c.arc(p.x, p.y, 28 * k, 0, TAU);
    c.fill();
    strokeLines(c, cracks, 'rgba(12,6,2,0.92)', 1.5);
  });
  g.addWheelFX(new GlowLines(cracks, rgb, 1.5, glowLife));
  g.addWheelFX(new GlowSpot(p.x, p.y, 100 * k, rgb, glowLife * 0.85, 0.85));
}

function explode(g: Game, hx: number, hy: number, k: number, smokeRgb = '40,34,30') {
  const ps = g.particles;
  const n = (v: number) => Math.round(v * k);
  g.addFX(new Light(hx, hy, 340 * k, '255,130,40', 1, 0.5));
  S.glow(ps, hx, hy, 260 * k, 36 * k, '255,235,190', 0.32, 1);
  S.fire(ps, hx, hy, n(40), Math.PI / 2, 1.7, [80, 460 * k], [34 * k, 60 * k], [60 * k, 110 * k], [0.4, 0.8], { g: -200, drag: 2 });
  S.fire(ps, hx, hy - 10, n(14), -Math.PI / 2, 1.2, [60, 220], [30 * k, 46 * k], [56 * k, 90 * k], [0.4, 0.7], { g: -150 });
  S.ring(ps, hx, hy, 8, 190 * k, '255,160,60', 12, 0.5, true);
  S.ring(ps, hx, hy, 4, 120 * k, '255,245,210', 3.5, 0.3, true);
  S.sparks(ps, hx, hy, n(44), Math.PI / 2, 1.7, [200, 760], '255,200,110', 1.8);
  S.embers(ps, hx, hy, n(28), Math.PI / 2, 1.8, [80, 420]);
  S.chips(ps, hx, hy, n(16), Math.PI / 2, 1.6, [160, 500]);
  S.splinters(ps, hx, hy, n(10), Math.PI / 2, 1.6, [200, 560]);
  S.smoke(ps, hx, hy, n(11), smokeRgb, [22 * k, 86 * k], { vx: [-110, 110], vy: [-70, 70], alpha: 0.65, life: [1, 1.7], drag: 2 });
}

// ───────────────────────── FISH ─────────────────────────
export class FishShot extends Projectile {
  weapon = 'fish' as const;
  tip = 30;
  half = 0.11;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -880);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let tick = 0, n = this.cosmeticTicks(dt); tick < n; tick++) {
      S.droplets(ps, this.x + rand(-8, 8), this.y + rand(24, 60), 1, Math.PI / 2, 1.3, [40, 170], [1.2, 2.8], '170,225,255', 600);
      if (Math.random() < 0.5) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(30, 60), vx: rand(-20, 20), vy: rand(10, 50), size: 8, size2: 26, life: 0.5, color: '230,244,255', alpha: 0.4, rot: rand(0, TAU) });
      if (Math.random() < 0.14) S.miniBubble(ps, this.x + rand(-10, 10), this.y + 40, rand(-20, 20), rand(10, 40), rand(2.4, 4.6), rand(0.4, 0.7));
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    const gr = ctx.createLinearGradient(0, this.y + 32, 0, this.y + 150);
    gr.addColorStop(0, 'rgba(235,247,255,0.7)');
    gr.addColorStop(1, 'rgba(160,210,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 13, this.y + 34);
    ctx.quadraticCurveTo(this.x - 20 + Math.sin(this.age * 14) * 5, this.y + 90, this.x, this.y + 150);
    ctx.quadraticCurveTo(this.x + 20 + Math.sin(this.age * 14) * 5, this.y + 90, this.x + 13, this.y + 34);
    ctx.closePath();
    ctx.fill();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.age * 12) * 0.08);
    drawFish(ctx, 0.95, this.age, 0.75);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(10, 'rgba(190,230,255,');
    g.hitStop(0.06);
    g.shake(8);
    g.addFX(new ComicPop(hx, hy + 62, 'PLASH!', '#e8f8ff', '#3aa0ff', '#0a3a7a', 0.95, 0.6));
    g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 66, 0.28));
    g.addFX(new Light(hx, hy, 200, '150,215,255', 0.6, 0.3));
    S.droplets(ps, hx - 3, hy, 18, Math.PI - 0.3, 0.45, [200, 520], [1.4, 3.8]);
    S.droplets(ps, hx + 3, hy, 18, 0.3, 0.45, [200, 520], [1.4, 3.8]);
    S.droplets(ps, hx, hy, 20, Math.PI / 2, 1.5, [120, 460], [1.2, 3.4]);
    S.fishScales(ps, hx, hy, 18, Math.PI / 2, 1.6, [120, 460]);
    S.smoke(ps, hx, hy, 8, '230,244,255', [12, 54], { vx: [-100, 100], vy: [-10, 60], alpha: 0.36, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 70, '200,235,255', 3.5, 0.34, false, 0.85);
    S.ring(ps, hx, hy, 3, 46, '255,255,255', 2.5, 0.24, true);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [120, 360]);
    S.stars(ps, hx, hy, 8, '200,235,255', [60, 220], [8, 14], Math.PI / 2, 1.6);
    const p = loc(g, theta, 0.92);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 1, p.x, p.y, 22);
      rg.addColorStop(0, 'rgba(60,40,24,0.45)');
      rg.addColorStop(1, 'rgba(60,40,24,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 22, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,200,120,0.5)';
      c.lineWidth = 0.9;
      for (let r = 0; r < 3; r++)
        for (let k = -2; k <= 2; k++) {
          c.beginPath();
          c.arc(p.x + k * 6 + (r % 2) * 3, p.y - 6 + r * 6, 3.2, 0, Math.PI);
          c.stroke();
        }
    });
    g.addDecal({ kind: 'wet', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(10, 1, 0.45), next: 0.1 });
    g.landed(makeItem('fish', theta, 0.11, 46, false), 0.35);
    sfx.play('fish_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new ComicPop(hx, hy + 50, 'BLUP!', '#e8f8ff', '#3aa0ff', '#0a3a7a', 0.8, 0.45));
    g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 52, 0.24));
    S.droplets(ps, hx, hy, 28, Math.PI / 2, 1.3, [180, 520], [1.2, 3.4]);
    S.fishScales(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 400]);
    fallingCustom(g, hx, hy, (c) => drawFish(c, 0.95, 0.2, 0.6));
    sfx.play('fish_hit');
    this.alive = false;
  }
}

// ───────────────────────── RPG-7 ─────────────────────────
export class RpgShot extends Projectile {
  weapon = 'rpg' as const;
  tip = 36;
  half = 0.105;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -440);
  }
  trail(dt: number) {
    this.vy = Math.max(-1300, this.vy - 3000 * dt);
    const ps = this.g.particles;
    S.fire(ps, this.x, this.y + 34, 2, Math.PI / 2, 0.3, [80, 220], [14, 24], [26, 42], [0.14, 0.3], { g: 0, drag: 1 });
    ps.add({ k: K.SMOKE, x: this.x + rand(-4, 4), y: this.y + rand(34, 60), vx: rand(-18, 18), vy: rand(10, 50), size: 12, size2: 44, life: rand(0.9, 1.5), color: '205,205,210', alpha: 0.5, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < 0.7) ps.add({ k: K.SPARK, add: true, x: this.x + rand(-4, 4), y: this.y + 32, vx: rand(-90, 90), vy: rand(80, 260), g: 400, size: 1.5, len: 0.03, life: rand(0.3, 0.6), color: '255,210,120', drag: 2 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,150,60'), this.x, this.y + 36, 70, 0.55);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.age * 26) * 0.03);
    ctx.scale(1.1, 1.1);
    drawMissile(ctx, 0, 1, this.age);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    g.wheelImpact(15, 'rgba(255,215,150,');
    g.hitStop(0.1);
    g.shake(14);
    g.flashScreen('255,170,70', 0.24);
    explode(g, hx, hy, 1.1);
    crater(g, theta, 1, '255,120,30', 2.8);
    g.landed(makeItem('rpg', theta, 0.1, 40, false), 0.55);
    sfx.play('rpg_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    g.flashScreen('255,170,70', 0.2);
    explode(g, hx, hy, 0.85);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 20);
      drawMissile(c, 0, 0, 0);
    });
    sfx.play('rpg_hit');
    this.alive = false;
  }
}

// ───────────────────────── NOISY CRICKET ─────────────────────────
export class CricketShot extends Projectile {
  weapon = 'cricket' as const;
  tip = 12;
  half = 0.11;
  lightT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1450);
  }
  trail(dt: number) {
    const g = this.g;
    const ps = g.particles;
    ps.add({ k: K.GLOW, add: true, x: this.x + rand(-5, 5), y: this.y + rand(8, 30), vx: rand(-20, 20), vy: rand(20, 80), size: rand(20, 34), size2: 3, color: '180,100,255', life: rand(0.25, 0.4), alpha: 0.65 });
    if (Math.random() < 0.8) S.sparks(ps, this.x, this.y + 8, 1, Math.PI / 2, 1.2, [60, 220], '220,170,255', 1.4, 0, 0.03);
    if (Math.random() < 0.4) ps.add({ k: K.STAR, add: true, x: this.x + rand(-9, 9), y: this.y + rand(6, 40), vx: rand(-30, 30), vy: rand(10, 70), size: rand(7, 12), life: 0.4, color: '235,200,255', drag: 2 });
    this.lightT += dt;
    if (this.lightT > 0.05) {
      this.lightT = 0;
      g.addFX(new Light(this.x, this.y, 130, '170,90,255', 0.5, 0.1));
    }
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = `rgba(${k === 1 ? '255,235,255' : '190,110,255'},${0.65 - k * 0.12})`;
      ctx.lineWidth = 4.4 - k;
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) {
        const u = i / 20;
        const px = this.x + Math.sin(u * 11 - t * 30 + k * 2.1) * (4 + 9 * u);
        const py = this.y + 6 + u * 110;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('170,90,255'), this.x, this.y + 4, 90, 0.6);
    drawSprite(ctx, glowSprite('240,215,255'), this.x, this.y + 4, 40, 0.8);
    ctx.restore();
    drawElectricOrb(ctx, this.x, this.y, 9, t * 5, 1.1, 0);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (Math.random() < 0.7) {
      const a = rand(0, TAU);
      strokeBolt(ctx, makeBolt(this.x, this.y, this.x + Math.cos(a) * rand(18, 32), this.y + Math.sin(a) * rand(18, 32), 0.4, 3), 1.1, '210,140,255');
    }
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(17, 'rgba(230,190,255,');
    g.hitStop(0.12);
    g.shake(19);
    g.flashScreen('190,120,255', 0.24);
    g.addFX(new RadialFlash(hx, hy, ['190,110,255', '240,215,255', '255,255,255', '150,90,255'], 0.22, 150, 20));
    g.addFX(new Light(hx, hy, 300, '170,90,255', 0.8, 0.45));
    g.addFX(new Rays(hx, hy, '215,170,255', 0.55, 16, Math.PI / 2, Math.PI * 0.9, 1.2));
    S.glow(ps, hx, hy, 210, 36, '240,220,255', 0.28, 0.9);
    S.ring(ps, hx, hy, 8, 210, '190,120,255', 12, 0.55, true);
    S.ring(ps, hx, hy, 5, 150, '255,255,255', 4, 0.34, true);
    S.ring(ps, hx, hy, 6, 270, '140,80,255', 6, 0.68, true, 0.7);
    S.sparks(ps, hx, hy, 58, Math.PI / 2, 1.7, [220, 860], '215,160,255', 1.9);
    S.sparks(ps, hx, hy, 16, Math.PI / 2, 1.5, [300, 800], '255,245,255', 1.3);
    S.chips(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 540]);
    S.splinters(ps, hx, hy, 12, Math.PI / 2, 1.6, [200, 580]);
    S.smoke(ps, hx, hy, 12, '70,40,110', [20, 90], { vx: [-120, 120], vy: [-70, 70], alpha: 0.6, life: [0.9, 1.5], drag: 2.2 });
    S.stars(ps, hx, hy, 14, '230,200,255', [80, 300], [9, 18], Math.PI / 2, 1.7);
    g.addFX(new ComicPop(hx, hy + 70, 'KRIIK!', '#f0e0ff', '#a050ff', '#2a0a5a', 1.1, 0.65));
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    for (let i = 0; i < 6; i++) {
      const a2 = theta + Math.PI + rand(-1.2, 1.2);
      const d = rand(40, 100);
      g.addWheelFX(new Lightning(lx * 0.98, ly * 0.98, lx + Math.cos(a2) * d, ly + Math.sin(a2) * d, rand(0.3, 0.55), '200,130,255', 1.5, 2, 0.04));
    }
    crater(g, theta, 1.05, '190,100,255', 3);
    g.landed(makeItem('cricket', theta, 0.11, 14, false), 0.55);
    sfx.play('cricket_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.flashScreen('190,120,255', 0.26);
    g.addFX(new RadialFlash(hx, hy, ['190,110,255', '240,215,255', '255,255,255'], 0.2, 120, 16));
    g.addFX(new Light(hx, hy, 320, '170,90,255', 0.95, 0.45));
    S.ring(ps, hx, hy, 6, 170, '190,120,255', 9, 0.45, true);
    S.sparks(ps, hx, hy, 40, Math.PI / 2, 1.7, [200, 700], '215,160,255', 1.7);
    S.smoke(ps, hx, hy, 8, '70,40,110', [18, 70], { vx: [-100, 100], vy: [-50, 70], alpha: 0.5 });
    sfx.play('cricket_hit');
    this.alive = false;
  }
}

// ───────────────────────── ELECTRO ─────────────────────────
export class ElectroShot extends Projectile {
  weapon = 'electro' as const;
  tip = 10;
  half = 0.095;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1250);
  }
  trail() {
    const g = this.g;
    const ps = g.particles;
    S.sparks(ps, this.x, this.y + 6, 2, Math.PI / 2, 1.3, [60, 240], '170,225,255', 1.3, 0, 0.03);
    if (Math.random() < 0.4) g.addFX(new Lightning(this.x + rand(-6, 6), this.y + 4, this.x + rand(-28, 28), this.y + rand(30, 80), 0.09, '130,205,255', 1.1, 1, 0.03));
    if (Math.random() < 0.5) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-4, 4), y: this.y + rand(6, 24), vx: rand(-14, 14), vy: rand(20, 60), size: rand(16, 26), size2: 3, color: '80,170,255', life: rand(0.2, 0.35), alpha: 0.6 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    strokeBolt(ctx, makeBolt(this.x, this.y + 8, this.x + rand(-6, 6), this.y + 110, 0.3, 4), 1.5);
    ctx.restore();
    drawElectricOrb(ctx, this.x, this.y, 10, this.age * 4, 1.15, 4);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(9, 'rgba(190,230,255,');
    g.hitStop(0.06);
    g.shake(9);
    g.flashScreen('160,210,255', 0.14);
    g.addFX(new Light(hx, hy, 260, '110,190,255', 0.9, 0.4));
    S.glow(ps, hx, hy, 170, 24, '220,242,255', 0.24, 1);
    S.ring(ps, hx, hy, 5, 110, '130,205,255', 6, 0.4, true);
    S.ring(ps, hx, hy, 4, 70, '255,255,255', 3, 0.26, true);
    S.sparks(ps, hx, hy, 36, Math.PI / 2, 1.7, [220, 700], '170,225,255', 1.7);
    S.sparks(ps, hx, hy, 10, Math.PI / 2, 1.5, [300, 700], '255,255,255', 1.2);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380]);
    S.smoke(ps, hx, hy, 6, '70,70,86', [12, 44], { vx: [-80, 80], vy: [-50, 50], alpha: 0.4, life: [0.7, 1.1] });
    const nodes = g.stuck
      .map((it) => ({ x: it.world.x, y: it.world.y }))
      .sort((a, b) => Math.hypot(a.x - hx, a.y - hy) - Math.hypot(b.x - hx, b.y - hy))
      .slice(0, 3);
    let from = { x: hx, y: hy };
    nodes.forEach((n, i) => {
      const a0 = from;
      from = n;
      g.after(0.05 + i * 0.07, () => {
        g.addFX(new Lightning(a0.x, a0.y, n.x, n.y, 0.38, '130,205,255', 2.4, 2, 0.04));
        S.ring(ps, n.x, n.y, 3, 52, '150,215,255', 3.5, 0.3, true);
        S.glow(ps, n.x, n.y, 80, 12, '210,240,255', 0.2, 1);
        S.sparks(ps, n.x, n.y, 14, -Math.PI / 2, Math.PI, [120, 420], '170,225,255', 1.4);
        g.addFX(new Light(n.x, n.y, 150, '110,190,255', 0.6, 0.25));
        sfx.play('electro_chain');
      });
    });
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    for (let i = 0; i < 7; i++) {
      const a2 = theta + (i % 2 ? 1 : -1) * rand(0.4, 1.3);
      g.addWheelFX(new Lightning(lx * 0.98, ly * 0.98, Math.cos(a2) * R * 0.93, Math.sin(a2) * R * 0.93, rand(0.3, 0.6), '130,205,255', 1.5, 2, 0.04));
    }
    const fern: number[][] = [];
    for (let i = 0; i < 7; i++) {
      const a = theta + Math.PI + rand(-1.3, 1.3);
      const L = rand(16, 38);
      fern.push(makeBolt(lx * 0.95, ly * 0.95, lx * 0.95 + Math.cos(a) * L, ly * 0.95 + Math.sin(a) * L, 0.35, 4));
    }
    g.paint((c) => {
      const rg = c.createRadialGradient(lx * 0.95, ly * 0.95, 0, lx * 0.95, ly * 0.95, 17);
      rg.addColorStop(0, 'rgba(10,8,8,0.9)');
      rg.addColorStop(1, 'rgba(40,30,24,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(lx * 0.95, ly * 0.95, 17, 0, TAU);
      c.fill();
      strokeLines(c, fern, 'rgba(14,10,8,0.9)', 1.4);
      strokeLines(c, fern, 'rgba(140,205,255,0.4)', 0.5);
    });
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 70, '110,190,255', 1.4, 0.85));
    g.landed(makeItem('electro', theta, 0.095, 15, false), 0.4);
    sfx.play('electro_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 230, '110,190,255', 0.85, 0.35));
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + rand(-1.4, 1.4);
      g.addFX(new Lightning(hx, hy, hx + Math.cos(a) * 70, hy + Math.sin(a) * 70, 0.26, '150,215,255', 1.4, 1));
    }
    S.ring(ps, hx, hy, 5, 100, '130,205,255', 5, 0.38, true);
    S.sparks(ps, hx, hy, 32, Math.PI / 2, 1.6, [200, 640], '170,225,255', 1.5);
    sfx.play('electro_hit');
    this.alive = false;
  }
}

// ───────────────────────── BAZOOKA ─────────────────────────
export class BazookaShot extends Projectile {
  weapon = 'bazooka' as const;
  tip = 54;
  half = 0.115;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -980);
  }
  trail() {
    const ps = this.g.particles;
    S.fire(ps, this.x, this.y + 38, 2, Math.PI / 2, 0.25, [60, 200], [16, 26], [30, 46], [0.14, 0.28], { g: 0, drag: 1 });
    ps.add({ k: K.SMOKE, x: this.x + rand(-5, 5), y: this.y + rand(40, 70), vx: rand(-22, 22), vy: rand(8, 40), size: 16, size2: 58, life: rand(1.2, 1.9), color: '240,240,244', alpha: 0.6, rot: rand(0, TAU), vrot: rand(-1, 1), drag: 1.2 });
    if (Math.random() < 0.7) ps.add({ k: K.SPARK, add: true, x: this.x + rand(-4, 4), y: this.y + 36, vx: rand(-100, 100), vy: rand(80, 280), g: 400, size: 1.5, len: 0.03, life: rand(0.3, 0.6), color: '255,210,120', drag: 2 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,150,60'), this.x, this.y + 40, 80, 0.55);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(245,245,250,0.55)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (const ph of [0, Math.PI]) {
      ctx.beginPath();
      for (let i = 0; i <= 18; i++) {
        const u = i / 18;
        const px = this.x + Math.sin(u * 8 - this.age * 20 + ph) * (3 + u * 10);
        const py = this.y + 46 + u * 130;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(1.15, 1.15);
    drawMissile(ctx, 1, 1, this.age);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(18, 'rgba(255,220,160,');
    g.hitStop(0.13);
    g.shake(18);
    g.flashScreen('255,180,80', 0.3);
    explode(g, hx, hy, 1.4, '58,50,46');
    g.lens(hx, hy, 80, 0.8);
    S.ring(ps, hx, hy, 10, 260, '255,230,190', 4, 0.45, true, 0.8);
    S.smoke(ps, hx - 6, hy + 4, 14, '70,62,58', [24, 70], { vx: [-12, 12], vy: [-180, -60], alpha: 0.7, life: [1.3, 2], drag: 1.2, spread: 4 });
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + rand(-1.6, 1.6);
      ps.add({ k: K.SMOKE, x: hx + Math.cos(a) * 20, y: hy - 150 + Math.sin(a) * 10 + rand(-10, 10), vx: Math.cos(a) * rand(60, 150), vy: rand(-30, 10), size: 26, size2: 78, life: rand(1.2, 1.9), color: '90,80,74', alpha: 0.65, rot: rand(0, TAU), vrot: rand(-1, 1), drag: 1.6 });
    }
    S.smokeRing(ps, hx, hy + 20, 14, '210,190,160', 14, 220, 0.35);
    crater(g, theta, 1.3, '255,120,30', 3.4);
    g.landed(makeItem('bazooka', theta, 0.115, 52, false), 0.65);
    sfx.play('bazooka_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    g.flashScreen('255,180,80', 0.24);
    explode(g, hx, hy, 1.05, '58,50,46');
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 22);
      drawMissile(c, 1, 0, 0);
    });
    sfx.play('bazooka_hit');
    this.alive = false;
  }
}

// ───────────────────────── FREEZE RAY (beam) ─────────────────────────
export class FreezeBeam extends Projectile {
  weapon = 'freeze' as const;
  tip = 0;
  half = 0.07;
  life = 0.5;
  fired = false;
  endY: number;
  mode: 'none' | 'hit' | 'block' = 'none';
  ox: number;
  oy: number;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -100);
    this.ox = x;
    this.oy = y;
    this.endY = g.wheel.y + g.wheel.R;
  }
  update(dt: number) {
    this.age += dt;
    const g = this.g;
    const w = g.wheel;
    const ps = g.particles;
    if (!this.fired) {
      this.fired = true;
      const bottom = w.y + w.bumpY + w.R;
      this.endY = bottom;
      g.collide(this, this.y, bottom - 3);
      if (this.mode === 'none') this.endY = -40;
    }
    const top = this.oy;
    const bot = this.endY;
    const ticks = this.cosmeticTicks(dt);
    if (this.age < this.life - 0.1 && top - bot > 10) {
      for (let tick = 0; tick < ticks; tick++) {
        for (let i = 0; i < 2; i++) {
          const yy = rand(bot, top);
          ps.add({ k: K.STAR, add: true, x: this.ox + rand(-9, 9), y: yy, vx: rand(-30, 30), vy: rand(-20, 40), size: rand(7, 14), life: rand(0.3, 0.6), color: pick(['210,246,255', '150,225,255', '255,255,255']), drag: 2 });
        }
        if (Math.random() < 0.5) S.snowflakes(ps, this.ox + rand(-10, 10), rand(bot, top), 1, Math.PI / 2, 1.5, [10, 60]);
        if (Math.random() < 0.4) ps.add({ k: K.SMOKE, x: this.ox + rand(-8, 8), y: rand(bot, top), vx: rand(-20, 20), vy: rand(0, 30), size: 10, size2: 34, life: rand(0.5, 0.9), color: '200,238,255', alpha: 0.3, rot: rand(0, TAU) });
      }
    }
    if (this.mode === 'hit' && !g.wheelGone && this.age < this.life - 0.1) {
      for (let tick = 0; tick < ticks; tick++) {
        S.sparks(ps, this.ox, bot, 1, Math.PI / 2, 1.5, [100, 340], '200,240,255', 1.3);
        if (Math.random() < 0.5) S.snowChunks(ps, this.ox, bot, 1, Math.PI / 2, 1.5, [60, 220]);
      }
    }
    if (this.age > this.life) this.alive = false;
  }
  draw(ctx: Ctx) {
    const y0 = this.oy;
    const y1 = this.endY;
    const L = y0 - y1;
    if (L < 2) return;
    const grow = Math.min(1, this.age / 0.06);
    const fade = this.age > this.life - 0.16 ? Math.max(0, (this.life - this.age) / 0.16) : 1;
    const s = grow * fade * (0.93 + 0.07 * Math.sin(this.age * 70));
    const x = this.ox;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const layers: [number, string][] = [
      [34, 'rgba(70,190,255,0.12)'],
      [18, 'rgba(110,215,255,0.3)'],
      [9, 'rgba(180,240,255,0.65)'],
      [3.6, 'rgba(255,255,255,0.97)'],
    ];
    for (const [w, col] of layers) {
      const n = 26;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const yy = y0 - (i / n) * L;
        const ww = w * 0.5 * s * (1 + 0.16 * Math.sin(yy * 0.08 - this.age * 50));
        if (i === 0) ctx.moveTo(x - ww, yy);
        else ctx.lineTo(x - ww, yy);
      }
      for (let i = n; i >= 0; i--) {
        const yy = y0 - (i / n) * L;
        const ww = w * 0.5 * s * (1 + 0.16 * Math.sin(yy * 0.08 - this.age * 50));
        ctx.lineTo(x + ww, yy);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(235,252,255,${0.85 * s})`;
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      const yy = y0 - (((this.age * 700 + (i * L) / 9) % L) + 0);
      const sz = 5 + (i % 3) * 2.4;
      ctx.beginPath();
      ctx.moveTo(x - sz, yy);
      ctx.lineTo(x + sz, yy);
      ctx.moveTo(x, yy - sz);
      ctx.lineTo(x, yy + sz);
      ctx.moveTo(x - sz * 0.7, yy - sz * 0.7);
      ctx.lineTo(x + sz * 0.7, yy + sz * 0.7);
      ctx.moveTo(x - sz * 0.7, yy + sz * 0.7);
      ctx.lineTo(x + sz * 0.7, yy - sz * 0.7);
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('110,215,255'), x, y0 - 2, 130 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('240,252,255'), x, y0 - 2, 44 * s, s);
    if (this.mode !== 'none') {
      drawSprite(ctx, glowSprite('150,230,255'), x, y1, 130 * s, 0.9 * s);
      drawSprite(ctx, glowSprite('255,255,255'), x, y1, 44 * s, s);
    }
    ctx.restore();
  }
  private frost(theta: number, r: number) {
    const g = this.g;
    const R = g.wheel.R;
    const p = loc(g, theta, 0.9);
    const cr = makeCracks(theta, R, 7, [r * 0.8, r * 1.5], 1.5);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.2);
      rg.addColorStop(0, 'rgba(235,250,255,0.82)');
      rg.addColorStop(0.55, 'rgba(180,230,250,0.5)');
      rg.addColorStop(1, 'rgba(160,220,250,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, r * 1.2, 0, TAU);
      c.fill();
      strokeLines(c, cr, 'rgba(120,200,245,0.7)', 1.8);
      strokeLines(c, cr, 'rgba(255,255,255,0.95)', 0.7);
      c.fillStyle = 'rgba(255,255,255,0.9)';
      for (let i = 0; i < 12; i++) {
        const a = rand(0, TAU);
        const d = rand(0, r);
        c.beginPath();
        c.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, rand(0.6, 1.6), 0, TAU);
        c.fill();
      }
    });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.mode = 'hit';
    this.endY = hy;
    g.wheelImpact(6, 'rgba(210,245,255,');
    g.shake(6);
    g.flashScreen('170,235,255', 0.14);
    g.addFX(new FrostBloom(hx, hy, 0.8, 1));
    g.addFX(new Light(hx, hy, 240, '110,215,255', 0.85, 0.45));
    S.glow(ps, hx, hy, 150, 20, '220,248,255', 0.26, 1);
    S.ring(ps, hx, hy, 5, 100, '150,230,255', 5, 0.42, true);
    S.crystalShards(ps, hx, hy, 18, Math.PI / 2, 1.6, [140, 520]);
    S.snowChunks(ps, hx, hy, 10, Math.PI / 2, 1.5, [100, 380]);
    S.snowflakes(ps, hx, hy, 14, Math.PI / 2, 1.7, [60, 260]);
    S.stars(ps, hx, hy, 12, '210,246,255', [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.smoke(ps, hx, hy, 8, '220,244,255', [16, 60], { vx: [-90, 90], vy: [-30, 60], alpha: 0.4, life: [0.8, 1.3] });
    this.frost(theta, 13);
    g.after(0.12, () => this.frost(theta, 21));
    g.after(0.26, () => this.frost(theta, 30));
    const p = loc(g, theta, 0.92);
    g.addWheelFX(new GlowSpot(p.x, p.y, 90, '130,225,255', 1.6, 0.8));
    g.landed(makeItem('freeze', theta, 0.07, 36, false), 0.6);
    sfx.play('freeze_hit');
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.mode = 'block';
    this.endY = hy;
    g.addFX(new FrostBloom(hx, hy, 0.6, 0.8));
    g.addFX(new Light(hx, hy, 210, '110,215,255', 0.8, 0.35));
    S.crystalShards(ps, hx, hy, 14, Math.PI / 2, 1.6, [140, 480]);
    S.snowflakes(ps, hx, hy, 10, Math.PI / 2, 1.7, [60, 240]);
    S.ring(ps, hx, hy, 4, 80, '150,230,255', 4, 0.34, true);
    sfx.play('freeze_hit');
  }
}

// ───────────────────────── RAILGUN (instant slug) ─────────────────────────
export class RailShot extends Projectile {
  weapon = 'rail' as const;
  tip = 0;
  half = 0.05;
  life = 0.32;
  fired = false;
  endY: number;
  mode: 'none' | 'hit' | 'block' = 'none';
  ox: number;
  oy: number;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -100);
    this.ox = x;
    this.oy = y;
    this.endY = g.wheel.y + g.wheel.R;
  }
  update(dt: number) {
    this.age += dt;
    const g = this.g;
    const w = g.wheel;
    const ps = g.particles;
    if (!this.fired) {
      this.fired = true;
      const bottom = w.y + w.bumpY + w.R;
      this.endY = bottom;
      g.collide(this, this.y, bottom - 3);
      if (this.mode === 'none') this.endY = -40;
      const top = this.oy;
      const bot = this.endY;
      for (let yy = top - 6; yy > bot; yy -= 9) {
        ps.add({ k: K.SMOKE, x: this.ox + rand(-2, 2), y: yy, vx: rand(-16, 16), vy: rand(-8, 8), size: 6, size2: 22 + rand(0, 10), life: rand(0.5, 0.95), color: '200,225,255', alpha: 0.24, rot: rand(0, TAU), vrot: rand(-1, 1), drag: 2 });
        if (Math.random() < 0.3) ps.add({ k: K.STAR, add: true, x: this.ox + rand(-10, 10), y: yy, vx: rand(-40, 40), vy: rand(-20, 20), size: rand(6, 12), life: rand(0.3, 0.6), color: pick(['150,200,255', '190,150,255', '255,255,255']), drag: 2 });
        if (Math.random() < 0.4) S.sparks(ps, this.ox, yy, 1, rand(0, TAU), 0.2, [120, 340], '170,205,255', 1.2, 0, 0.03);
      }
    }
    if (this.age > this.life) this.alive = false;
  }
  draw(ctx: Ctx) {
    const y0 = this.oy;
    const y1 = this.endY;
    const L = y0 - y1;
    if (L < 2) return;
    const grow = Math.min(1, this.age / 0.03);
    const fade = this.age > this.life - 0.18 ? Math.max(0, (this.life - this.age) / 0.18) : 1;
    const s = grow * fade;
    const x = this.ox;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const layers: [number, string][] = [
      [40, 'rgba(90,130,255,0.1)'],
      [20, 'rgba(120,160,255,0.26)'],
      [9, 'rgba(180,200,255,0.62)'],
      [3.2, 'rgba(255,255,255,0.98)'],
    ];
    for (const [w, col] of layers) {
      ctx.beginPath();
      ctx.moveTo(x - w * 0.5 * s, y0);
      ctx.lineTo(x - w * 0.2 * s, y1);
      ctx.lineTo(x + w * 0.2 * s, y1);
      ctx.lineTo(x + w * 0.5 * s, y0);
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    }
    const nR = 8;
    for (let k = 0; k < nR; k++) {
      const tk = Math.max(0, Math.min(1, (this.age - k * 0.006) / 0.28));
      if (tk <= 0 || tk >= 1) continue;
      const yy = y0 - ((k + 0.5) / nR) * L;
      ctx.strokeStyle = `rgba(${k % 2 ? '190,160,255' : '150,200,255'},${0.85 * (1 - tk) * s})`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(x, yy, 4 + 34 * tk, 1.2 + 6 * tk, 0, 0, TAU);
      ctx.stroke();
    }
    if (Math.random() < 0.9) {
      for (let i = 0; i < 3; i++) {
        const yy = y1 + Math.random() * L;
        strokeBolt(ctx, makeBolt(x + rand(-4, 4), yy, x + rand(-30, 30), yy + rand(-24, 24), 0.4, 3), 0.9 * s, '150,190,255');
      }
    }
    drawSprite(ctx, glowSprite('130,170,255'), x, y0 - 2, 150 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('255,255,255'), x, y0 - 2, 50 * s, s);
    if (this.mode !== 'none') {
      drawSprite(ctx, glowSprite('150,190,255'), x, y1, 190 * s, 0.9 * s);
      drawSprite(ctx, glowSprite('255,255,255'), x, y1, 64 * s, s);
    }
    ctx.restore();
  }
  private blast(hx: number, hy: number, big: boolean) {
    const g = this.g;
    const ps = g.particles;
    const k = big ? 1 : 0.75;
    g.addFX(new RadialFlash(hx, hy, ['150,190,255', '255,255,255', '190,150,255', '120,170,255'], 0.2, 150 * k, 22));
    g.addFX(new Light(hx, hy, 330 * k, '130,170,255', 1, 0.5));
    g.addFX(new Rays(hx, hy, '190,210,255', 0.45, 14, Math.PI / 2, Math.PI * 0.9, 1.1));
    S.glow(ps, hx, hy, 220 * k, 30, '235,242,255', 0.3, 1);
    S.ring(ps, hx, hy, 6, 180 * k, '130,175,255', 9, 0.45, true);
    S.ring(ps, hx, hy, 4, 110 * k, '255,255,255', 4, 0.3, true);
    S.ring(ps, hx, hy, 3, 70 * k, '190,150,255', 5, 0.26, true);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + rand(-0.1, 0.1);
      const sp = rand(500, 1100) * k;
      ps.add({ k: K.SPARK, add: true, x: hx, y: hy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 3.2, size: rand(1.4, 2.4), len: 0.05, life: rand(0.25, 0.5), color: pick(['170,205,255', '255,255,255', '200,170,255']) });
    }
    S.sparks(ps, hx, hy, 36, Math.PI / 2, 1.6, [240, 780], '160,200,255', 1.7);
    S.chips(ps, hx, hy, 14, Math.PI / 2, 1.5, [140, 460]);
    S.splinters(ps, hx, hy, 10, Math.PI / 2, 1.4, [220, 620]);
    S.smoke(ps, hx, hy, 6, '120,130,160', [12, 48], { vx: [-90, 90], vy: [-40, 60], alpha: 0.4, life: [0.7, 1.1] });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const R = g.wheel.R;
    this.mode = 'hit';
    this.endY = hy;
    g.wheelImpact(19, 'rgba(210,225,255,');
    g.hitStop(0.14);
    g.shake(16);
    g.flashScreen('200,220,255', 0.3);
    this.blast(hx, hy, true);
    const p = loc(g, theta, 0.95);
    const cracks = makeCracks(theta, R, 6, [26, 58], 0.8);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
      rg.addColorStop(0, 'rgba(6,8,16,0.95)');
      rg.addColorStop(1, 'rgba(20,24,40,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 14, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(140,180,255,0.85)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(p.x, p.y, 5.6, 0, TAU);
      c.stroke();
      strokeLines(c, cracks, 'rgba(10,14,24,0.92)', 1.2);
      c.fillStyle = '#05070c';
      c.beginPath();
      c.arc(p.x, p.y, 3.6, 0, TAU);
      c.fill();
    });
    g.addWheelFX(new GlowLines(cracks, '140,180,255', 1.3, 1.8));
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '130,170,255', 1.8, 0.95));
    g.landed(makeItem('rail', theta, 0.055, 9, false), 0.5);
    sfx.play('rail_hit');
  }
  block(hx: number, hy: number) {
    this.mode = 'block';
    this.endY = hy;
    this.g.flashScreen('200,220,255', 0.22);
    this.blast(hx, hy, false);
    sfx.play('rail_hit');
  }
}

// ───────────────────────── MAGNET ─────────────────────────
export class MagnetShot extends Projectile {
  weapon = 'magnet' as const;
  tip = 20;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -840);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      S.filings(ps, this.x, this.y + 30, 2, this, 1700, 60);
      if (Math.random() < 0.4) S.sparks(ps, this.x + rand(-14, 14), this.y + rand(0, 20), 1, rand(0, TAU), 0.3, [60, 200], pick(['255,110,110', '130,170,255']), 1.3, 0, 0.03);
      if (Math.random() < 0.4) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-12, 12), y: this.y + rand(0, 26), vx: rand(-10, 10), vy: rand(20, 60), size: rand(12, 20), size2: 3, color: pick(['255,80,80', '100,150,255']), life: 0.3, alpha: 0.5 });
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + 8);
    ctx.rotate(Math.sin(this.age * 5) * 0.1);
    ctx.scale(0.3 + 0.7 * Math.abs(Math.cos(this.age * 7)), 1);
    drawMagnet(ctx, 1.3, this.age, 0.9);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(9, 'rgba(255,200,200,');
    g.hitStop(0.06);
    g.shake(8);
    const item = makeItem('magnet', theta, 0.1, 42, false);
    g.landed(item, 0.5);
    g.addFX(new FieldLines(hx, hy + 14, 0.85, 1));
    g.addFX(new Light(hx, hy, 220, '255,120,140', 0.75, 0.35));
    S.glow(ps, hx, hy, 130, 18, '255,225,235', 0.22, 1);
    S.ring(ps, hx, hy, 5, 90, '255,110,110', 4, 0.36, true);
    S.ring(ps, hx, hy, 4, 70, '120,160,255', 4, 0.3, true);
    S.filings(ps, hx, hy, 70, item.world, 2500, 130);
    S.sparks(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 520], '255,110,110', 1.4);
    S.sparks(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 520], '130,170,255', 1.4);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380]);
    S.smoke(ps, hx, hy, 5, '220,200,210', [10, 40], { vx: [-80, 80], vy: [-20, 50], alpha: 0.3, life: [0.6, 1] });
    const p = loc(g, theta, 0.9);
    const dots = Array.from({ length: 70 }, () => ({ a: rand(0, TAU), d: rand(4, 30), r: rand(0.4, 1.1) }));
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta - Math.PI / 2);
      c.lineCap = 'round';
      c.setLineDash([1.6, 2.4]);
      for (let k = 1; k <= 4; k++) {
        c.strokeStyle = `rgba(34,38,48,${0.9 - k * 0.1})`;
        c.lineWidth = 1.7;
        for (const dir of [-1, 1]) {
          c.beginPath();
          c.ellipse(0, -6, 5 + k * 5.4, 6 + k * 6.4, 0, dir < 0 ? Math.PI : 0, dir < 0 ? TAU : Math.PI);
          c.stroke();
        }
      }
      c.setLineDash([]);
      for (const d of dots) {
        c.fillStyle = 'rgba(40,44,56,0.8)';
        c.beginPath();
        c.arc(Math.cos(d.a) * d.d, Math.sin(d.a) * d.d * 0.8, d.r, 0, TAU);
        c.fill();
      }
      c.fillStyle = 'rgba(255,100,100,0.25)';
      c.beginPath();
      c.arc(-9, 0, 6, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(110,150,255,0.25)';
      c.beginPath();
      c.arc(9, 0, 6, 0, TAU);
      c.fill();
      c.restore();
    });
    sfx.play('magnet_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new FieldLines(hx, hy + 12, 0.6, 0.9));
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [180, 560], '255,120,120', 1.4);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [180, 560], '130,170,255', 1.4);
    S.ring(ps, hx, hy, 4, 74, '255,200,210', 4, 0.32, true);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 10);
      drawMagnet(c, 1.3, 0, 0);
    });
    sfx.play('magnet_hit');
    this.alive = false;
  }
}

// ───────────────────────── SHRINK / GROW ─────────────────────────
export class SizeShot extends Projectile {
  weapon: 'shrink' | 'grow' = 'shrink';
  tip = 12;
  half = 0.1;
  grow: boolean;
  r = 12;
  constructor(g: Game, x: number, y: number, grow: boolean) {
    super(g, x, y, -900);
    this.grow = grow;
    this.weapon = grow ? 'grow' : 'shrink';
  }
  trail(dt: number) {
    this.r = this.grow ? 6 + Math.min(this.age * 20, 12) : 16 - Math.min(this.age * 14, 9);
    this.tip = this.r;
    const ps = this.g.particles;
    const pal = this.grow ? GROW_PAL : SHRINK_PAL;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.7) S.sparks(ps, this.x + rand(-9, 9), this.y + rand(6, 36), 1, Math.PI / 2, 1.3, [30, 140], pal.rgb, 1.4, 0, 0.03);
      if (Math.random() < 0.4) ps.add({ k: K.STAR, add: true, x: this.x + rand(-10, 10), y: this.y + rand(4, 36), vx: rand(-20, 20), vy: rand(0, 50), size: rand(6, 11), life: 0.4, color: pal.rgb, drag: 2 });
      if (Math.random() < 0.15) S.plusMinus(ps, this.x + rand(-10, 10), this.y + rand(10, 40), 1, this.grow ? '+' : '-', pal.rgb, [10, 40]);
    }
  }
  draw(ctx: Ctx) {
    const pal = this.grow ? GROW_PAL : SHRINK_PAL;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 100);
    gr.addColorStop(0, `rgba(${pal.rgb},0.55)`);
    gr.addColorStop(1, `rgba(${pal.rgb},0)`);
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - this.r * 0.7, this.y + 4);
    ctx.lineTo(this.x + this.r * 0.7, this.y + 4);
    ctx.lineTo(this.x + 1, this.y + 100);
    ctx.lineTo(this.x - 1, this.y + 100);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawSizeOrb(ctx, this.x, this.y, this.r, this.age, this.grow, 1.1);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const grow = this.grow;
    const pal = grow ? GROW_PAL : SHRINK_PAL;
    g.wheelImpact(6, `rgba(${pal.rgb},`);
    g.hitStop(0.05);
    g.shake(5);
    g.pulseWheel(grow ? 0.13 : -0.13);
    g.flashScreen(pal.rgb, 0.12);
    g.addFX(new ConvergeRings(hx, hy, pal.rgb, grow ? 1 : -1, 0.7, 1.05));
    g.addFX(new Light(hx, hy, 230, pal.rgb, 0.75, 0.4));
    S.glow(ps, hx, hy, 140, 18, grow ? '255,235,210' : '215,255,230', 0.24, 1);
    S.ring(ps, hx, hy, 5, 84, pal.rgb, 4, 0.4, true);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [160, 540], pal.rgb, 1.5);
    S.stars(ps, hx, hy, 10, pal.rgb, [60, 240], [8, 15], Math.PI / 2, 1.7);
    S.plusMinus(ps, hx, hy, 6, grow ? '+' : '-', pal.rgb, [80, 220]);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 340]);
    ps.add({ k: K.TEXT, x: hx, y: hy + 56, vy: -50, drag: 1.5, size: 26, text: grow ? 'GROW!' : 'SHRINK!', color: grow ? '255,206,140' : '170,255,200', life: 0.9 });
    const p = loc(g, theta, 0.9);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      const rg = c.createRadialGradient(0, 0, 1, 0, 0, 22);
      rg.addColorStop(0, `rgba(${pal.rgb},0.35)`);
      rg.addColorStop(1, `rgba(${pal.rgb},0)`);
      c.fillStyle = rg;
      c.beginPath();
      c.arc(0, 0, 22, 0, TAU);
      c.fill();
      for (const [r, w] of [
        [6, 1.5],
        [11, 1.1],
        [16, 1.3],
      ]) {
        c.strokeStyle = `rgba(${pal.rgb},0.7)`;
        c.lineWidth = w;
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.stroke();
      }
      c.strokeStyle = `rgba(${pal.rgb},0.55)`;
      c.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const d0 = grow ? 6 : 16;
        const d1 = grow ? 16 : 6;
        c.beginPath();
        c.moveTo(Math.cos(a) * d0, Math.sin(a) * d0);
        c.lineTo(Math.cos(a) * d1, Math.sin(a) * d1);
        c.stroke();
      }
      c.restore();
    });
    woodCracks(g, theta, 3, [8, 18], pal.rgb, 0.8);
    g.addWheelFX(new GlowSpot(p.x, p.y, 60, pal.rgb, 1.2, 0.75));
    g.landed(makeItem(grow ? 'grow' : 'shrink', theta, 0.1, grow ? 22 : 14, false), 0.4);
    sfx.play(grow ? 'grow_hit' : 'shrink_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const pal = this.grow ? GROW_PAL : SHRINK_PAL;
    g.addFX(new ConvergeRings(hx, hy, pal.rgb, this.grow ? 1 : -1, 0.5, 0.85));
    g.addFX(new Light(hx, hy, 200, pal.rgb, 0.7, 0.3));
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [160, 520], pal.rgb, 1.4);
    S.plusMinus(ps, hx, hy, 4, this.grow ? '+' : '-', pal.rgb, [80, 200]);
    sfx.play(this.grow ? 'grow_hit' : 'shrink_hit');
    this.alive = false;
  }
}

// ───────────────────────── PIRATE CANNONBALL ─────────────────────────
export class PirateShot extends Projectile {
  weapon = 'pirate' as const;
  tip = 16;
  half = 0.12;
  rot = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -800);
  }
  trail(dt: number) {
    this.rot += dt * 5;
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + rand(14, 30), vx: rand(-24, 24), vy: rand(10, 50), size: 14, size2: 46, life: rand(0.9, 1.4), color: '120,116,112', alpha: 0.5, rot: rand(0, TAU), vrot: rand(-1, 1) });
      if (Math.random() < 0.7) S.sparks(ps, this.x + rand(-6, 6), this.y + 8, 1, Math.PI / 2, 1.2, [60, 220], '255,210,120', 1.4, 300, 0.03);
      if (Math.random() < 0.4) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-6, 6), y: this.y + rand(8, 24), vx: rand(-40, 40), vy: rand(20, 90), size: 1.8, life: 0.5, color: '255,170,60', g: 200 });
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    const gr = ctx.createLinearGradient(0, this.y + 12, 0, this.y + 110);
    gr.addColorStop(0, 'rgba(180,176,170,0.55)');
    gr.addColorStop(1, 'rgba(180,176,170,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 14, this.y + 12);
    ctx.lineTo(this.x + 14, this.y + 12);
    ctx.lineTo(this.x + 2, this.y + 110);
    ctx.lineTo(this.x - 2, this.y + 110);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.rot) * 0.4);
    drawCannonball(ctx, 16, true);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,90'), this.x + 10, this.y - 14, 18 + 6 * Math.sin(this.age * 40), 0.8);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(15, 'rgba(255,225,170,');
    g.hitStop(0.11);
    g.shake(15);
    g.flashScreen('255,190,90', 0.2);
    explode(g, hx, hy, 0.95, '70,64,60');
    S.coins(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 560]);
    S.stars(ps, hx, hy, 10, '255,225,130', [80, 280], [9, 16], Math.PI / 2, 1.7);
    g.addFX(new ComicPop(hx, hy + 66, 'BUMM!', '#ffe9a0', '#ff8a1a', '#5a2a00', 1.05, 0.6));
    crater(g, theta, 1, '255,150,50', 2.2);
    g.landed(makeItem('pirate', theta, 0.12, 14, false, { seed: rand(0, 6) }), 0.5);
    sfx.play('pirate_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.flashScreen('255,190,90', 0.18);
    explode(g, hx, hy, 0.75, '70,64,60');
    S.coins(ps, hx, hy, 10, Math.PI / 2, 1.5, [140, 460]);
    fallingCustom(g, hx, hy, (c) => drawCannonball(c, 16, true));
    sfx.play('pirate_hit');
    this.alive = false;
  }
}

// ───────────────────────── PLAYING CARD ─────────────────────────
export class CardShot extends Projectile {
  weapon = 'card' as const;
  tip = 20;
  half = 0.07;
  suit: number;
  constructor(g: Game, x: number, y: number, suit: number) {
    super(g, x, y, -1350);
    this.suit = suit % 4;
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.7) ps.add({ k: K.STAR, add: true, x: this.x + rand(-10, 10), y: this.y + rand(10, 50), vx: rand(-30, 30), vy: rand(10, 70), size: rand(7, 12), life: rand(0.3, 0.55), color: pick(['255,230,150', '255,255,255', '255,160,180']), drag: 2 });
      if (Math.random() < 0.2) S.cards(ps, this.x + rand(-6, 6), this.y + rand(20, 40), 1, Math.PI / 2, 1, [20, 80], 0.45);
      if (Math.random() < 0.4) ps.add({ k: K.SMOKE, x: this.x + rand(-4, 4), y: this.y + rand(16, 34), vx: rand(-12, 12), vy: rand(10, 40), size: 7, size2: 22, life: 0.4, color: '255,245,240', alpha: 0.25, rot: rand(0, TAU) });
    }
  }
  draw(ctx: Ctx) {
    const f = Math.abs(Math.cos(this.age * 11));
    for (let i = 2; i >= 1; i--) {
      ctx.save();
      ctx.globalAlpha = 0.18 * (3 - i);
      ctx.translate(this.x, this.y + i * 16);
      ctx.scale(0.25 + 0.75 * f, 1);
      drawPlayingCard(ctx, this.suit, 1.3);
      ctx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,235,200'), this.x, this.y, 60, 0.3);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.age * 9) * 0.1);
    ctx.scale(0.25 + 0.75 * f, 1);
    drawPlayingCard(ctx, this.suit, 1.3);
    ctx.restore();
  }
  private burst(hx: number, hy: number, n: number) {
    const g = this.g;
    const ps = g.particles;
    S.cards(ps, hx, hy, n, Math.PI / 2, 1.7, [140, 520], 0.8);
    S.stars(ps, hx, hy, 10, '255,235,170', [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 16, Math.PI / 2, 1.6, [180, 540], '255,235,190', 1.4, 500);
    S.smoke(ps, hx, hy, 6, '255,246,240', [12, 46], { vx: [-90, 90], vy: [-20, 60], alpha: 0.4, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 66, '255,200,210', 3.5, 0.3, true);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const R = g.wheel.R;
    g.wheelImpact(7, 'rgba(255,230,235,');
    g.hitStop(0.04);
    g.shake(6);
    g.addFX(new Light(hx, hy, 190, '255,220,200', 0.6, 0.3));
    g.addFX(new ComicPop(hx, hy + 46, 'TAK!', '#fff1f4', '#ff4f6a', '#5a0a1a', 0.85, 0.5));
    S.glow(g.particles, hx, hy, 110, 16, '255,240,230', 0.2, 0.9);
    this.burst(hx, hy, 20);
    S.chips(g.particles, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    const p = loc(g, theta, 0.92);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
      rg.addColorStop(0, 'rgba(30,14,4,0.75)');
      rg.addColorStop(1, 'rgba(30,14,4,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 11, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(30,14,4,0.9)';
      c.lineWidth = 1.6;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta + Math.PI / 2);
      c.beginPath();
      c.moveTo(-9, 0);
      c.lineTo(9, 0);
      c.stroke();
      c.restore();
    });
    void R;
    woodCracks(g, theta, 3, [8, 20], '255,200,180', 0.6);
    g.landed(makeItem('card', theta, 0.075, 28, false, { shape: [this.suit], wob: 0.2 }), 0.2);
    sfx.play('card_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.burst(hx, hy, 14);
    const suit = this.suit;
    fallingCustom(this.g, hx, hy, (c) => drawPlayingCard(c, suit, 1.3));
    sfx.play('card_hit');
    this.alive = false;
  }
}
