import { type Ctx, TAU, drawSprite, glowSprite, lerp, makeBolt, pick, rand, randomPoly } from './core';
import { drawDart, drawGoldBullet, drawSingularity, drawStone, makeCracks, strokeLines } from './art';
import { GlowLines, GlowSpot, K, Light, Lightning, Rays, SplashSheet, Streak } from './particles';
import * as S from './spawn';
import { sfx } from './audio';
import type { StuckItem, WeaponId } from './weapons';
import type { Game } from './Game';

const PURPLES = ['200,140,255', '255,180,255', '150,100,255', '230,200,255'];

export abstract class Projectile {
  alive = true;
  age = 0;
  resolved = false;
  abstract weapon: WeaponId;
  tip = 6;
  half = 0.07;
  private cosmeticCarry = 0;
  constructor(
    public g: Game,
    public x: number,
    public y: number,
    public vy: number,
  ) {}
  update(dt: number) {
    this.age += dt;
    const prev = this.y - this.tip;
    this.y += this.vy * dt;
    this.trail(dt);
    if (!this.resolved) this.g.collide(this, prev, this.y - this.tip);
    if (this.y < -80) this.alive = false;
  }
  trail(_dt: number) {}

  /**
   * Run legacy per-frame cosmetic emitters at their original 60 Hz density,
   * irrespective of display refresh. Movement and collision still advance on
   * every update. The small clamp prevents a resumed tab from spawning a
   * frame's worth of backlog in one burst.
   */
  protected cosmeticTicks(dt: number): number {
    if (!Number.isFinite(dt) || dt <= 0) return 0;
    this.cosmeticCarry += Math.min(dt, 0.1) * 60;
    const count = Math.min(6, Math.floor(this.cosmeticCarry + 1e-8));
    this.cosmeticCarry = Math.max(0, this.cosmeticCarry - count);
    return count;
  }

  abstract draw(ctx: Ctx): void;
  abstract hit(theta: number, hx: number, hy: number): void;
  abstract block(hx: number, hy: number): void;
}

export function makeItem(weapon: WeaponId, angle: number, half: number, protrude: number, front: boolean, extra: Partial<StuckItem> = {}): StuckItem {
  return { weapon, angle, half, protrude, front, t: 0, seed: rand(0, 10), world: { x: 0, y: 0 }, ...extra };
}

export function fallingCustom(g: Game, x: number, y: number, draw: (c: Ctx) => void, vx = rand(-260, 260), vy = rand(260, 420)) {
  g.particles.add({
    k: K.CUSTOM,
    x,
    y,
    vx,
    vy,
    g: 1500,
    rot: 0,
    vrot: rand(-28, 28),
    life: 1.4,
    draw: (c, p) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      draw(c);
      c.restore();
    },
  });
}

// ───────────────────────── GOLDEN BULLET ─────────────────────────
export class GoldenBullet extends Projectile {
  weapon = 'golden' as const;
  tip = 8;
  half = 0.06;
  startY: number;
  private trailCarry = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1750);
    this.startY = y;
  }
  trail(dt: number) {
    // A fixed rate keeps the same luminous trail on 60/90/120 Hz displays:
    // the old per-frame burst doubled particles on a 120 Hz phone.
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.trailCarry += Math.min(dt, 0.1) * 40;
    const count = Math.min(4, Math.floor(this.trailCarry + 1e-8));
    this.trailCarry = Math.max(0, this.trailCarry - count);
    const ps = this.g.particles;
    for (let i = 0; i < count; i++) {
      ps.add({ k: K.STAR, add: true, x: this.x + rand(-3, 3), y: this.y + rand(4, 26), vx: rand(-40, 40), vy: rand(-10, 50), size: rand(7, 14), life: rand(0.35, 0.7), color: '255,215,120', drag: 2.5 });
      const a = this.age * 70;
      ps.add({ k: K.EMBER, add: true, x: this.x + Math.cos(a) * 5, y: this.y + 12, vx: Math.cos(a) * 40, vy: 25, size: 1.5, life: 0.4, color: '255,200,90', drag: 3 });
    }
  }
  draw(ctx: Ctx) {
    const tail = Math.min(160, this.startY - this.y);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + tail);
    gr.addColorStop(0, 'rgba(255,250,220,0.95)');
    gr.addColorStop(0.2, 'rgba(255,205,80,0.6)');
    gr.addColorStop(1, 'rgba(255,150,30,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 3.6, this.y + 4);
    ctx.lineTo(this.x + 3.6, this.y + 4);
    ctx.lineTo(this.x + 0.6, this.y + tail);
    ctx.lineTo(this.x - 0.6, this.y + tail);
    ctx.closePath();
    ctx.fill();
    drawSprite(ctx, glowSprite('255,190,70'), this.x, this.y, 54, 0.8);
    drawSprite(ctx, glowSprite('255,255,230'), this.x, this.y - 2, 20, 0.9);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    drawGoldBullet(ctx, 15, 6);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(7, 'rgba(255,236,190,');
    g.hitStop(0.05);
    g.shake(5);
    g.addFX(new Streak(hx, hy, Math.min(hy + 160, this.startY), 3.6, '255,200,80', 0.18));
    g.addFX(new Light(hx, hy, 190, '255,190,70', 0.7, 0.32));
    g.addFX(new Rays(hx, hy, '255,210,100', 0.5, 16, Math.PI / 2, Math.PI * 0.8));
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
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
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
    g.addWheelFX(new GlowLines(cracks, '255,190,60', 1.3, 1.5));
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 46, '255,170,50', 1.3, 0.85));
    g.landed(makeItem('golden', theta, 0.065, 13, false));
    sfx.play('golden_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.sparks(ps, hx, hy, 28, Math.PI / 2, 1.4, [200, 620], '255,240,200', 1.6);
    S.glow(ps, hx, hy, 64, 10, '255,230,180', 0.18, 1);
    S.ring(ps, hx, hy, 4, 36, '255,255,255', 3, 0.2);
    fallingCustom(this.g, hx, hy, (c) => drawGoldBullet(c, 15, 6));
    sfx.play('ricochet');
    this.alive = false;
  }
}

// ───────────────────────── BLACK HOLE ─────────────────────────
export class BlackHoleShot extends Projectile {
  weapon = 'blackhole' as const;
  tip = 13;
  half = 0.1;
  r = 13;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -620);
  }
  trail(dt: number) {
    const g = this.g;
    const ps = g.particles;
    // Refraction follows the projectile every frame; only cosmetic emissions
    // use a 60 Hz world-time rate instead of doubling on a 120 Hz display.
    g.lens(this.x, this.y, 46, 1);
    for (let tick = 0, n = this.cosmeticTicks(dt); tick < n; tick++) {
      for (let i = 0; i < 2; i++) {
        const a = rand(0, TAU);
        const d = rand(40, 76);
        ps.add({ k: K.SPARK, add: true, x: this.x + Math.cos(a) * d, y: this.y + Math.sin(a) * d, target: this, pull: 2000, size: rand(0.9, 2), len: 0.03, life: 0.7, color: pick(PURPLES) });
      }
      if (Math.random() < 0.7)
        ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + 14, vx: rand(-15, 15), vy: rand(10, 40), size: 18, size2: 50, life: 0.8, color: '55,18,105', alpha: 0.6, rot: rand(0, TAU), vrot: rand(-1, 1) });
      if (Math.random() < 0.6) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-12, 12), y: this.y + rand(8, 22), vx: rand(-30, 30), vy: rand(20, 70), size: 1.8, life: 0.55, color: '190,120,255' });
    }
  }
  draw(ctx: Ctx) {
    drawSingularity(ctx, this.x, this.y, this.r, this.g.time * 1.7, 1.15);
    if (Math.random() < 0.6) {
      const a = rand(0, TAU);
      const L = rand(22, 38);
      const pts = makeBolt(this.x + Math.cos(a) * this.r * 0.7, this.y + Math.sin(a) * this.r * 0.7, this.x + Math.cos(a) * L, this.y + Math.sin(a) * L, 0.4, 4);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (const [w, c] of [
        [3.5, 'rgba(170,100,255,0.3)'],
        [1.3, 'rgba(220,170,255,0.9)'],
        [0.5, 'rgba(255,255,255,1)'],
      ] as [number, string][]) {
        ctx.strokeStyle = c;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    const item = makeItem('blackhole', theta, 0.1, 9, true);
    g.landed(item, 0.5);
    item.world.x = hx;
    item.world.y = hy;
    g.wheelImpact(3, 'rgba(200,150,255,');
    g.shake(3);
    sfx.play('bh_suck');
    // implosion: suck wood & energy toward the singularity
    for (let i = 0; i < 40; i++) {
      const a = rand(0, TAU);
      const d = rand(40, 120);
      const onWood = i % 2 === 0;
      const sx = onWood ? hx + Math.cos(theta + Math.PI + rand(-1.2, 1.2)) * rand(15, 80) : hx + Math.cos(a) * d;
      const sy = onWood ? hy + Math.sin(theta + Math.PI + rand(-1.2, 1.2)) * rand(15, 80) - 0 : hy + Math.sin(a) * d;
      if (onWood) {
        ps.add({ k: K.CHIP, x: sx, y: sy - rand(0, 60), target: item.world, pull: 2600, rot: rand(0, TAU), vrot: rand(-20, 20), poly: randomPoly(4, rand(1.4, 3), 0.5), color: pick(['196,140,80', '222,178,118', '170,112,58']), life: 0.6 });
      } else {
        ps.add({ k: K.SPARK, add: true, x: sx, y: sy, target: item.world, pull: 2800, size: rand(1, 2.2), len: 0.025, life: 0.6, color: pick(PURPLES) });
      }
    }
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.after(0.32, () => {
      const p = item.world;
      const out = Math.atan2(p.y - (g.wheel.y + g.wheel.bumpY), p.x - g.wheel.x);
      g.wheelImpact(9, 'rgba(215,170,255,');
      g.hitStop(0.09);
      g.shake(12);
      g.flashScreen('190,120,255', 0.28);
      g.addFX(new Light(p.x, p.y, 280, '170,90,255', 0.95, 0.5));
      S.glow(ps, p.x, p.y, 170, 30, '235,200,255', 0.3, 1);
      S.ring(ps, p.x, p.y, 8, 170, '190,120,255', 12, 0.55, true);
      S.ring(ps, p.x, p.y, 4, 100, '255,255,255', 4, 0.32, true);
      S.ring(ps, p.x, p.y, 2, 60, '120,60,255', 6, 0.25, true);
      S.sparks(ps, p.x, p.y, 38, out, 1.7, [220, 680], '215,165,255', 1.8);
      S.sparks(ps, p.x, p.y, 14, out, 1.4, [300, 700], '140,220,255', 1.3);
      S.chips(ps, p.x, p.y, 18, out, 1.5, [150, 440]);
      S.smoke(ps, p.x, p.y, 10, '50,15,95', [16, 70], { vx: [-80, 80], vy: [-80, 60], alpha: 0.65, life: [0.7, 1.2], drag: 2.5 });
      for (let i = 0; i < 7; i++) {
        const a2 = theta + Math.PI + rand(-1.05, 1.05);
        const d = rand(45, 110);
        g.addWheelFX(new Lightning(lx * 0.98, ly * 0.98, lx + Math.cos(a2) * d, ly + Math.sin(a2) * d, rand(0.28, 0.5), '190,120,255', 1.6, 2, 0.04));
      }
      for (let i = 0; i < 4; i++) {
        const a = out + rand(-1.25, 1.25);
        const L = rand(50, 95);
        g.addFX(new Lightning(p.x, p.y, p.x + Math.cos(a) * L, p.y + Math.sin(a) * L, 0.24, '200,140,255', 1.4, 1));
      }
      g.paint((c) => {
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
      g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 80, '170,90,255', 2.2, 0.9));
      sfx.play('bh_hit');
    });
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 220, '170,90,255', 0.8, 0.4));
    S.glow(ps, hx, hy, 120, 20, '235,200,255', 0.25, 1);
    S.ring(ps, hx, hy, 6, 120, '190,120,255', 8, 0.45, true);
    S.sparks(ps, hx, hy, 40, Math.PI / 2, Math.PI, [150, 600], '215,165,255', 1.7);
    S.smoke(ps, hx, hy, 10, '50,15,95', [14, 60], { vx: [-90, 90], vy: [-60, 90], alpha: 0.6 });
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + rand(-1.4, 1.4);
      g.addFX(new Lightning(hx, hy, hx + Math.cos(a) * 70, hy + Math.sin(a) * 70, 0.25, '200,140,255', 1.4, 1));
    }
    sfx.play('bh_fire');
    this.alive = false;
  }
}

// ───────────────────────── STONE (ketapel) ─────────────────────────
export class StoneShot extends Projectile {
  weapon = 'ketapel' as const;
  tip = 8;
  half = 0.075;
  rot = 0;
  shape = randomPoly(9, 8.2, 0.28);
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1150);
  }
  trail(dt: number) {
    this.rot += dt * 17;
    if (Math.random() < 0.5)
      this.g.particles.add({ k: K.SMOKE, x: this.x + rand(-3, 3), y: this.y + 12, vx: rand(-12, 12), vy: rand(10, 30), size: 6, size2: 18, life: 0.45, color: '205,185,155', alpha: 0.32 });
  }
  draw(ctx: Ctx) {
    ctx.strokeStyle = 'rgba(255,255,255,0.32)';
    ctx.lineWidth = 1;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(this.x + s * 8, this.y + 6);
      ctx.lineTo(this.x + s * 5, this.y + 44);
      ctx.stroke();
    }
    for (let i = 3; i >= 1; i--) {
      ctx.globalAlpha = (0.16 * (4 - i)) / 3;
      ctx.save();
      ctx.translate(this.x, this.y + i * 9);
      ctx.rotate(this.rot - i * 0.3);
      drawStone(ctx, this.shape, 8.2);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawStone(ctx, this.shape, 8.2);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(8);
    g.hitStop(0.035);
    g.shake(6);
    S.smoke(ps, hx, hy, 10, '195,165,125', [10, 50], { vx: [-110, 110], vy: [-30, 70], alpha: 0.55, life: [0.7, 1.2], drag: 2.6 });
    S.splinters(ps, hx, hy, 16, Math.PI / 2, 1.55, [160, 470]);
    S.chips(ps, hx, hy, 7, Math.PI / 2, 1.3, [100, 300], ['150,145,138', '110,105,98', '190,185,175']);
    S.ring(ps, hx, hy, 4, 52, '235,215,175', 4, 0.36, false, 0.55);
    const cracks = makeCracks(theta, R, 7, [12, 30], 1.35);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
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
    g.landed(makeItem('ketapel', theta, 0.08, 10, false, { shape: this.shape, rotS: this.rot }));
    sfx.play('sling_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.smoke(ps, hx, hy, 5, '195,165,125', [8, 34], { vx: [-80, 80], vy: [0, 60], alpha: 0.45 });
    S.chips(ps, hx, hy, 6, Math.PI / 2, 1.2, [100, 260], ['150,145,138', '110,105,98']);
    S.sparks(ps, hx, hy, 6, Math.PI / 2, 1.2, [150, 350], '255,230,190', 1.2);
    const shape = this.shape;
    fallingCustom(this.g, hx, hy, (c) => drawStone(c, shape, 8.2));
    sfx.play('sling_hit');
    this.alive = false;
  }
}

// ───────────────────────── DART (sumpit) ─────────────────────────
export class DartShot extends Projectile {
  weapon = 'sumpit' as const;
  tip = 0;
  half = 0.05;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1450);
  }
  trail() {
    if (Math.random() < 0.35)
      this.g.particles.add({ k: K.EMBER, add: true, x: this.x + rand(-1, 1), y: this.y + 4, vx: rand(-15, 15), vy: rand(10, 40), size: 1.2, life: 0.4, color: '150,255,120' });
  }
  draw(ctx: Ctx) {
    const wob = Math.sin(this.age * 45) * 0.035;
    const gr = ctx.createLinearGradient(0, this.y + 36, 0, this.y + 120);
    gr.addColorStop(0, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.strokeStyle = gr;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + 36);
    ctx.lineTo(this.x, this.y + 120);
    ctx.stroke();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(wob);
    drawDart(ctx);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(3.5);
    g.shake(2);
    S.splinters(ps, hx, hy, 7, Math.PI / 2, 1.4, [100, 300]);
    S.smoke(ps, hx, hy, 7, '110,225,80', [8, 40], { vx: [-50, 50], vy: [-40, 30], alpha: 0.38, life: [1, 1.6], drag: 2 });
    S.droplets(ps, hx, hy, 6, Math.PI / 2, 1.3, [60, 170], [0.9, 1.6], '120,230,90', 700);
    S.glow(ps, hx, hy, 46, 12, '140,255,120', 0.4, 0.55);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      c.strokeStyle = 'rgba(40,18,6,0.8)';
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(lx * 0.99, ly * 0.99);
      c.lineTo(lx * 0.9 + rand(-1, 1), ly * 0.9 + rand(-1, 1));
      c.stroke();
    });
    g.addDecal({ kind: 'poison', angle: theta, t: 0, seed: rand(0, 10) });
    g.landed(makeItem('sumpit', theta, 0.055, 22, false, { wob: 0.24 }));
    sfx.play('sumpit_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    S.splinters(this.g.particles, hx, hy, 4, Math.PI / 2, 1.2, [80, 200]);
    fallingCustom(this.g, hx, hy, (c) => {
      c.translate(0, -19);
      drawDart(c);
    });
    sfx.play('sumpit_hit');
    this.alive = false;
  }
}

// ───────────────────────── SHOTGUN BLAST ─────────────────────────
interface Pellet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  px: number;
  py: number;
  done: boolean;
}

function segCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  if (c < 0) return 0;
  const disc = b * b - 4 * a * c;
  if (disc < 0 || a === 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

export class ShotgunBlast extends Projectile {
  weapon = 'shotgun' as const;
  tip = 0;
  half = 0.13;
  pellets: Pellet[] = [];
  outcome: 'none' | 'hit' | 'block' = 'none';
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -2400);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (i - (n - 1) / 2) * 0.0155 + rand(-0.008, 0.008);
      this.pellets.push({ x: x + rand(-1.5, 1.5), y, vx: Math.cos(ang) * 2400, vy: Math.sin(ang) * 2400, px: x, py: y, done: false });
    }
  }
  update(dt: number) {
    this.age += dt;
    const prev = this.y - this.tip;
    this.y += this.vy * dt;
    if (this.outcome === 'none' && !this.resolved) this.g.collide(this, prev, this.y - this.tip);
    const w = this.g.wheel;
    const cx = w.x;
    const cy = w.y + w.bumpY;
    let all = true;
    for (const p of this.pellets) {
      if (p.done) continue;
      all = false;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (this.outcome !== 'none' && !this.g.wheelGone) {
        const t = segCircle(p.px, p.py, p.x, p.y, cx, cy, w.R);
        if (t >= 0) {
          p.done = true;
          this.pelletImpact(p.px + (p.x - p.px) * t, p.py + (p.y - p.py) * t);
          continue;
        }
      }
      if (p.y < -40) p.done = true;
    }
    if (all) this.alive = false;
  }
  pelletImpact(ix: number, iy: number) {
    const g = this.g;
    const ps = g.particles;
    const w = g.wheel;
    const cy = w.y + w.bumpY;
    const out = Math.atan2(iy - cy, ix - w.x);
    if (this.outcome === 'block') {
      S.sparks(ps, ix, iy, 6, out, 0.9, [200, 500], '255,230,170', 1.4);
      S.glow(ps, ix, iy, 20, 4, '255,230,180', 0.1, 1);
      return;
    }
    const local = out - w.angle;
    const depth = rand(3, 9);
    const lx = Math.cos(local) * (w.R - depth);
    const ly = Math.sin(local) * (w.R - depth);
    g.paint((c) => {
      const rg = c.createRadialGradient(lx, ly, 0, lx, ly, 6);
      rg.addColorStop(0, 'rgba(25,10,2,0.7)');
      rg.addColorStop(1, 'rgba(25,10,2,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(lx, ly, 6, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,230,190,0.5)';
      c.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        const a = rand(0, TAU);
        c.beginPath();
        c.moveTo(lx + Math.cos(a) * 1.8, ly + Math.sin(a) * 1.8);
        c.lineTo(lx + Math.cos(a) * rand(3, 4.4), ly + Math.sin(a) * rand(3, 4.4));
        c.stroke();
      }
      c.fillStyle = '#120802';
      c.beginPath();
      c.arc(lx, ly, 2.1, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(170,175,185,0.8)';
      c.beginPath();
      c.arc(lx + 0.4, ly - 0.4, 0.7, 0, TAU);
      c.fill();
    });
    g.addWheelFX(new GlowSpot(lx, ly, 15, '255,130,30', 1.7, 0.95));
    g.addDecal({ kind: 'smolder', angle: local, r: w.R - depth, t: 0, seed: rand(0, 10) });
    S.glow(ps, ix, iy, 30, 6, '255,220,150', 0.1, 1);
    S.sparks(ps, ix, iy, 3, out, 0.8, [150, 400], '255,190,90', 1.2);
    S.splinters(ps, ix, iy, 3, out, 1, [100, 320]);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.outcome = 'hit';
    this.resolved = true;
    g.wheelImpact(11);
    g.hitStop(0.06);
    g.shake(7);
    S.chips(ps, hx, hy, 20, Math.PI / 2, 1.5, [150, 500]);
    S.splinters(ps, hx, hy, 12, Math.PI / 2, 1.5, [200, 520]);
    S.smoke(ps, hx, hy, 7, '150,130,115', [10, 50], { vx: [-90, 90], vy: [-20, 60], alpha: 0.5, life: [0.8, 1.3] });
    g.landed(makeItem('shotgun', theta, 0.13, 0, false), 0.2);
    sfx.play('shotgun_hit');
  }
  block(hx: number, hy: number) {
    this.outcome = 'block';
    this.resolved = true;
    S.sparks(this.g.particles, hx, hy, 24, Math.PI / 2, 1.3, [250, 650], '255,230,170', 1.5);
    S.glow(this.g.particles, hx, hy, 70, 10, '255,230,180', 0.16, 1);
    sfx.play('ricochet');
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of this.pellets) {
      if (p.done) continue;
      const tx = p.x - p.vx * 0.014;
      const ty = p.y - p.vy * 0.014;
      ctx.strokeStyle = 'rgba(255,140,40,0.35)';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,190,0.95)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(lerp(p.x, tx, 0.6), lerp(p.y, ty, 0.6));
      ctx.stroke();
      drawSprite(ctx, glowSprite('255,200,110'), p.x, p.y, 12, 0.8);
    }
    ctx.restore();
  }
}

// ───────────────────────── WATER JET (super soaker) ─────────────────────────
export class WaterJet extends Projectile {
  weapon = 'soaker' as const;
  tip = 3;
  half = 0.085;
  tailY: number;
  muzzleY: number;
  spray = 0.075;
  state: 'fly' | 'splash' = 'fly';
  blocked = false;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1300);
    this.tailY = y;
    this.muzzleY = y;
  }
  update(dt: number) {
    this.age += dt;
    const ps = this.g.particles;
    if (this.state === 'fly') {
      const prev = this.y - this.tip;
      this.y += this.vy * dt;
      if (!this.resolved) this.g.collide(this, prev, this.y - this.tip);
    }
    if (this.age > this.spray) {
      this.tailY += this.vy * dt;
      if (this.state === 'fly') {
        for (let i = 0; i < 2; i++)
          ps.add({ k: K.DROP, x: this.x + rand(-3, 3), y: this.tailY + rand(0, 10), vx: rand(-30, 30), vy: this.vy * rand(0.5, 0.78), g: 750, size: rand(1.1, 2.3), life: 0.55, color: '150,210,255' });
      }
    }
    if (this.state === 'fly' && Math.random() < 0.5)
      ps.add({ k: K.SMOKE, x: this.x + rand(-4, 4), y: this.y + rand(10, 40), vx: rand(-15, 15), vy: rand(-10, 20), size: 6, size2: 20, life: 0.5, color: '225,240,255', alpha: 0.2 });
    if (this.state === 'splash') {
      const w = this.g.wheel;
      this.y = w.y + w.bumpY + w.R;
      const hx = this.x;
      const hy = this.y;
      if (this.blocked) {
        S.droplets(ps, hx, hy, 4, Math.PI / 2, 1.1, [150, 380], [1.2, 2.6]);
      } else {
        S.droplets(ps, hx - 3, hy, 2, Math.PI - 0.25, 0.4, [180, 360], [1.2, 2.8]);
        S.droplets(ps, hx + 3, hy, 2, 0.25, 0.4, [180, 360], [1.2, 2.8]);
        S.droplets(ps, hx, hy, 2, Math.PI / 2, 1.3, [100, 300], [1, 2.4]);
      }
      if (this.tailY <= this.y + 2) this.alive = false;
    }
    if (this.y < -60 || this.tailY < -60) this.alive = false;
  }
  draw(ctx: Ctx) {
    const y0 = this.y;
    const y1 = Math.min(this.tailY, this.muzzleY);
    const len = y1 - y0;
    if (len < 2) return;
    const n = Math.max(4, Math.floor(len / 6));
    const left: number[] = [];
    const right: number[] = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const yy = y0 + s * len;
      const wd = lerp(5.6, 2.3, s) * (1 + 0.18 * Math.sin(s * 18 - this.age * 50));
      const xo = Math.sin(s * 7 + this.age * 30) * 1.1 * s;
      left.push(this.x + xo - wd, yy);
      right.push(this.x + xo + wd, yy);
    }
    ctx.beginPath();
    ctx.moveTo(left[0], left[1]);
    for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i], left[i + 1]);
    for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i], right[i + 1]);
    ctx.closePath();
    const gr = ctx.createLinearGradient(this.x - 6, 0, this.x + 6, 0);
    gr.addColorStop(0, 'rgba(60,150,255,0.55)');
    gr.addColorStop(0.35, 'rgba(215,247,255,0.92)');
    gr.addColorStop(0.6, 'rgba(120,200,255,0.75)');
    gr.addColorStop(1, 'rgba(40,120,230,0.6)');
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x - 2, y0 + 4);
    ctx.lineTo(this.x - 1.2, y0 + len * 0.75);
    ctx.stroke();
    if (this.state === 'fly') {
      const hg = ctx.createRadialGradient(this.x - 1.5, y0 + 1, 0.5, this.x, y0 + 3, 6.5);
      hg.addColorStop(0, 'rgba(255,255,255,0.98)');
      hg.addColorStop(0.45, 'rgba(160,220,255,0.85)');
      hg.addColorStop(1, 'rgba(40,120,230,0.7)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(this.x, y0 + 3, 6.3, 0, TAU);
      ctx.fill();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('120,200,255'), this.x, y0 + 4, 34, 0.35);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.state = 'splash';
    g.wheelImpact(4, 'rgba(170,225,255,');
    g.shake(3);
    S.droplets(ps, hx - 3, hy, 14, Math.PI - 0.3, 0.45, [200, 480], [1.4, 3.6]);
    S.droplets(ps, hx + 3, hy, 14, 0.3, 0.45, [200, 480], [1.4, 3.6]);
    S.droplets(ps, hx, hy, 16, Math.PI / 2, 1.35, [120, 420], [1.2, 3.2]);
    S.droplets(ps, hx, hy, 18, Math.PI / 2, 1.5, [250, 600], [0.6, 1.2]);
    g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 52, 0.24));
    S.smoke(ps, hx, hy, 7, '215,238,255', [10, 54], { vx: [-90, 90], vy: [-10, 50], alpha: 0.32, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 46, '210,240,255', 3, 0.36, false, 0.8);
    S.glow(ps, hx, hy, 50, 10, '170,225,255', 0.2, 0.6);
    const beads: { da: number; s: number }[] = [];
    for (let i = 0; i < 5; i++) beads.push({ da: rand(-0.085, 0.085), s: rand(2, 3.7) });
    g.addDecal({ kind: 'wet', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(10, 1, 0.45), next: 0.1 });
    g.landed(makeItem('soaker', theta, 0.09, 4, true, { beads }), 0.3);
    sfx.play('splash');
  }
  block(hx: number, hy: number) {
    this.state = 'splash';
    this.blocked = true;
    S.droplets(this.g.particles, hx, hy, 30, Math.PI / 2, 1.2, [180, 520], [1.2, 3.4]);
    this.g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 40, 0.2));
    sfx.play('splash');
  }
}
