import { type Ctx, TAU, drawSprite, glowSprite, lerp, pick, polyPath, rand, randomPoly } from './core';
import { drawBanana, drawBananaSlice, drawBubble, drawIronBall, drawRifleBullet, drawSnowball } from './shapes2';
import { makeCracks, strokeLines } from './art';
import { BananaPop, Contrail } from './fx2';
import { GlowLines, GlowSpot, K, Light, type Particles } from './particles';
import * as S from './spawn2';
import { sfx } from './audio';
import { Projectile, fallingCustom, makeItem } from './projectiles';
import type { Game } from './Game';

const ICE_COLS = ['190,235,255', '140,210,255', '230,248,255', '170,225,255'];
const BANANA_COLS = ['255,225,80', '240,190,20', '255,240,150', '200,150,10'];
const FILM_COLS = ['255,170,235', '150,225,255', '255,245,160', '170,255,210'];

function gooDrops(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: [number, number], size: [number, number]) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    ps.add({
      k: K.DROP,
      x: x + rand(-2, 2),
      y: y + rand(-2, 2),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 950,
      drag: 0.6,
      size: rand(size[0], size[1]),
      life: rand(0.6, 1.1),
      color: '255,226,110',
      alpha: 1.4,
      data: '190,130,20',
    });
  }
}

// ───────────────────────── SNOWBALL ─────────────────────────
export class SnowballShot extends Projectile {
  weapon = 'snowball' as const;
  tip = 10;
  half = 0.09;
  rot = 0;
  shape = randomPoly(10, 10.5, 0.15);
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1050);
  }
  trail(dt: number) {
    this.rot += dt * 13;
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.8)
        ps.add({ k: K.SMOKE, x: this.x + rand(-4, 4), y: this.y + rand(8, 16), vx: rand(-18, 18), vy: rand(10, 40), size: 8, size2: 26, life: 0.5, color: '225,242,255', alpha: 0.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
      if (Math.random() < 0.55) S.snowflakes(ps, this.x + rand(-6, 6), this.y + rand(6, 22), 1, Math.PI / 2, 2.6, [10, 60]);
      if (Math.random() < 0.4)
        ps.add({ k: K.STAR, add: true, x: this.x + rand(-8, 8), y: this.y + rand(4, 28), vx: rand(-20, 20), vy: rand(0, 50), size: rand(6, 12), life: rand(0.3, 0.55), color: '190,230,255', drag: 2 });
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 110);
    gr.addColorStop(0, 'rgba(210,240,255,0.55)');
    gr.addColorStop(1, 'rgba(120,190,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 9, this.y + 4);
    ctx.lineTo(this.x + 9, this.y + 4);
    ctx.lineTo(this.x + 1, this.y + 110);
    ctx.lineTo(this.x - 1, this.y + 110);
    ctx.closePath();
    ctx.fill();
    drawSprite(ctx, glowSprite('150,210,255'), this.x, this.y, 62, 0.55);
    ctx.restore();
    for (let i = 2; i >= 1; i--) {
      ctx.globalAlpha = 0.12 * (3 - i);
      ctx.save();
      ctx.translate(this.x, this.y + i * 11);
      ctx.rotate(this.rot - i * 0.35);
      drawSnowball(ctx, this.shape, 10.5);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawSnowball(ctx, this.shape, 10.5);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(7, 'rgba(220,240,255,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new Light(hx, hy, 180, '140,205,255', 0.7, 0.3));
    S.glow(ps, hx, hy, 120, 20, '235,248,255', 0.2, 1);
    S.ring(ps, hx, hy, 5, 74, '190,230,255', 4, 0.4, true);
    S.ring(ps, hx, hy, 3, 40, '255,255,255', 2.5, 0.24, true);
    S.smoke(ps, hx, hy, 16, '240,248,255', [18, 78], { vx: [-170, 170], vy: [-30, 120], alpha: 0.65, life: [0.7, 1.3], drag: 2.4 });
    S.snowChunks(ps, hx, hy, 16, Math.PI / 2, 1.5, [120, 420]);
    S.shards(ps, hx, hy, 14, Math.PI / 2, 1.5, [180, 520], ICE_COLS);
    S.snowflakes(ps, hx, hy, 14, Math.PI / 2, 1.6, [60, 260]);
    S.stars(ps, hx, hy, 14, '200,235,255', [80, 280], [9, 17], Math.PI / 2, 1.6);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.5, [200, 520], '210,240,255', 1.3, 700);
    const cracks = makeCracks(theta, R, 6, [10, 28], 1.3);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const blob = randomPoly(12, 15, 0.42);
    const spat = Array.from({ length: 14 }, () => ({ a: rand(0, TAU), d: rand(15, 30), r: rand(0.8, 2.5) }));
    g.paint((c) => {
      const cx = lx * 0.93;
      const cy = ly * 0.93;
      strokeLines(c, cracks, 'rgba(170,215,250,0.55)', 1.5);
      strokeLines(c, cracks, 'rgba(240,250,255,0.9)', 0.7);
      const sh = c.createRadialGradient(cx, cy, 2, cx, cy, 24);
      sh.addColorStop(0, 'rgba(60,100,170,0.4)');
      sh.addColorStop(1, 'rgba(60,100,170,0)');
      c.fillStyle = sh;
      c.beginPath();
      c.arc(cx, cy, 24, 0, TAU);
      c.fill();
      c.save();
      c.translate(cx, cy);
      polyPath(c, blob, true);
      const bg = c.createRadialGradient(-4, -4, 1, 0, 0, 17);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.7, '#e6f1ff');
      bg.addColorStop(1, '#b4d0f2');
      c.fillStyle = bg;
      c.fill();
      c.strokeStyle = 'rgba(110,150,210,0.6)';
      c.lineWidth = 0.9;
      c.stroke();
      for (const s of spat) {
        c.fillStyle = 'rgba(245,250,255,0.95)';
        c.beginPath();
        c.arc(Math.cos(s.a) * s.d, Math.sin(s.a) * s.d, s.r, 0, TAU);
        c.fill();
        c.strokeStyle = 'rgba(110,150,210,0.4)';
        c.lineWidth = 0.5;
        c.stroke();
      }
      c.restore();
    });
    g.addWheelFX(new GlowLines(cracks, '140,215,255', 1.1, 1.2));
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 56, '150,215,255', 1.0, 0.7));
    g.landed(makeItem('snowball', theta, 0.095, 11, false, { shape: this.shape }));
    sfx.play('snow_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.smoke(ps, hx, hy, 8, '240,248,255', [12, 50], { vx: [-120, 120], vy: [0, 80], alpha: 0.55 });
    S.snowChunks(ps, hx, hy, 8, Math.PI / 2, 1.3, [120, 320]);
    S.shards(ps, hx, hy, 6, Math.PI / 2, 1.3, [150, 400], ICE_COLS);
    const shape = this.shape;
    fallingCustom(this.g, hx, hy, (c) => drawSnowball(c, shape, 10.5));
    sfx.play('snow_hit');
    this.alive = false;
  }
}

// ───────────────────────── SNIPER ─────────────────────────
export class SniperShot extends Projectile {
  weapon = 'sniper' as const;
  tip = 8;
  half = 0.04;
  startY: number;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -4600);
    this.startY = y;
    const w = g.wheel;
    const endY = w.y + w.bumpY + w.R;
    g.addFX(new Contrail(x, y - 6, endY, 0.9));
    for (let yy = y - 10; yy > endY; yy -= 11)
      g.particles.add({ k: K.SMOKE, x: x + rand(-2, 2), y: yy, vx: rand(-14, 14), vy: rand(-8, 8), size: 6, size2: 22 + rand(0, 10), life: rand(0.5, 0.95), color: '235,244,255', alpha: 0.22, rot: rand(0, TAU), vrot: rand(-1, 1), drag: 2 });
  }
  draw(ctx: Ctx) {
    const tail = Math.min(220, this.startY - this.y);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + tail);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.2, 'rgba(255,225,150,0.7)');
    gr.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 2.4, this.y + 4);
    ctx.lineTo(this.x + 2.4, this.y + 4);
    ctx.lineTo(this.x + 0.4, this.y + tail);
    ctx.lineTo(this.x - 0.4, this.y + tail);
    ctx.closePath();
    ctx.fill();
    drawSprite(ctx, glowSprite('255,210,120'), this.x, this.y, 44, 0.9);
    drawSprite(ctx, glowSprite('255,255,240'), this.x, this.y, 16, 1);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    drawRifleBullet(ctx, 15, 4.6);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(11, 'rgba(255,255,255,');
    g.hitStop(0.1);
    g.shake(10);
    g.flashScreen('255,250,235', 0.14);
    g.addFX(new Light(hx, hy, 180, '255,225,160', 0.95, 0.3));
    S.glow(ps, hx, hy, 130, 16, '255,250,225', 0.16, 1);
    ps.add({ k: K.STAR, add: true, x: hx, y: hy, size: 150, life: 0.22, color: '255,245,200' });
    S.ring(ps, hx, hy, 4, 140, '255,255,255', 2.5, 0.32, true);
    S.ring(ps, hx, hy, 3, 76, '255,215,140', 4, 0.22, true);
    S.sparks(ps, hx, hy, 34, Math.PI / 2, 0.55, [500, 1250], '255,235,170', 1.6, 800, 0.03);
    S.sparks(ps, hx, hy, 10, Math.PI / 2, 1.6, [200, 520], '255,200,110', 1.3);
    S.splinters(ps, hx, hy, 18, Math.PI / 2, 0.75, [300, 900]);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.0, [200, 520]);
    S.smoke(ps, hx, hy, 6, '170,150,125', [8, 34], { vx: [-80, 80], vy: [0, 80], alpha: 0.4, life: [0.6, 1] });
    const cracks = makeCracks(theta, R, 6, [26, 58], 0.75);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.95;
      const cy = ly * 0.95;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 12);
      rg.addColorStop(0, 'rgba(25,10,2,0.8)');
      rg.addColorStop(1, 'rgba(25,10,2,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 12, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(255,225,180,0.3)', 0.6, 0.5, 0.5);
      strokeLines(c, cracks, 'rgba(30,14,4,0.92)', 1.2);
      c.fillStyle = '#0c0602';
      c.beginPath();
      c.arc(lx * 0.96, ly * 0.96, 2.8, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,225,180,0.5)';
      c.lineWidth = 0.7;
      c.stroke();
    });
    g.addWheelFX(new GlowLines(cracks, '255,200,110', 1.2, 1.3));
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 44, '255,170,60', 1.3, 0.9));
    g.landed(makeItem('sniper', theta, 0.05, 8, false));
    sfx.play('sniper_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.2, [300, 900], '255,240,200', 1.5);
    S.glow(ps, hx, hy, 80, 10, '255,240,200', 0.16, 1);
    S.ring(ps, hx, hy, 4, 60, '255,255,255', 3, 0.22, true);
    fallingCustom(this.g, hx, hy, (c) => drawRifleBullet(c, 15, 4.6));
    sfx.play('ricochet');
    this.alive = false;
  }
}

// ───────────────────────── FLAME JET ─────────────────────────
export class FlameJet extends Projectile {
  weapon = 'flame' as const;
  tip = 4;
  half = 0.1;
  muzzleY: number;
  impactY = 0;
  state: 'fly' | 'burn' = 'fly';
  burnT = 0;
  lightT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
    this.muzzleY = y;
    g.addFX(new Light(x, y - 30, 170, '255,150,50', 0.6, 0.12));
  }
  private stream(dt: number, endY: number | null) {
    const ps = this.g.particles;
    const n = Math.max(1, Math.round(dt * 260));
    for (let i = 0; i < n; i++) {
      const v = rand(760, 960);
      let life = rand(0.26, 0.38);
      if (endY !== null) life = Math.max(0.05, (this.muzzleY - endY) / v) * rand(0.93, 1);
      const ang = -Math.PI / 2 + rand(-0.045, 0.045);
      ps.add({ k: K.FIRE, add: true, x: this.x + rand(-3, 3), y: this.muzzleY + rand(-4, 2), vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, size: rand(14, 22), size2: rand(36, 56), life, alpha: 0.9, g: -60 });
    }
  }
  private splash(dt: number) {
    const g = this.g;
    const ps = g.particles;
    const w = g.wheel;
    const cx = w.x;
    const cy = w.y + w.bumpY;
    const R = w.R;
    const n = Math.max(1, Math.round(dt * 150));
    for (let i = 0; i < n; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const phi = Math.PI / 2 + side * rand(0, 0.28);
      const px = cx + Math.cos(phi) * R;
      const py = cy + Math.sin(phi) * R;
      const tx = -Math.sin(phi) * side;
      const ty = Math.cos(phi) * side;
      const sp = rand(120, 330);
      ps.add({ k: K.FIRE, add: true, x: px, y: py + rand(-4, 4), vx: tx * sp + Math.cos(phi) * rand(20, 70), vy: ty * sp + Math.sin(phi) * rand(20, 70), size: rand(18, 30), size2: rand(36, 66), life: rand(0.28, 0.5), alpha: 0.9, g: -420, drag: 1.2 });
    }
    ps.add({ k: K.FIRE, add: true, x: this.x + rand(-12, 12), y: this.impactY + rand(-8, 6), vx: rand(-60, 60), vy: rand(-40, 60), size: 34, size2: 70, life: 0.25, alpha: 1 });
    if (Math.random() < dt * 34)
      ps.add({ k: K.SMOKE, x: this.x + rand(-14, 14), y: this.impactY + rand(-6, 10), vx: rand(-40, 40), vy: rand(-110, -40), size: 12, size2: 46, life: rand(0.8, 1.3), color: '50,42,38', alpha: 0.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < dt * 60)
      ps.add({ k: K.EMBER, add: true, x: this.x + rand(-14, 14), y: this.impactY + rand(-6, 6), vx: rand(-160, 160), vy: rand(-240, -60), g: 120, size: rand(1.4, 2.4), life: rand(0.5, 1), color: '255,170,60', drag: 1.2 });
    this.lightT += dt;
    if (this.lightT > 0.05) {
      this.lightT = 0;
      g.addFX(new Light(this.x, this.impactY - 24, 190 + rand(0, 40), '255,140,40', rand(0.45, 0.7), 0.14));
    }
  }
  update(dt: number) {
    this.age += dt;
    if (this.state === 'fly') {
      const prev = this.y - this.tip;
      this.y += this.vy * dt;
      this.stream(dt, null);
      if (!this.resolved) this.g.collide(this, prev, this.y - this.tip);
      if (this.y < -60) this.alive = false;
    } else {
      this.burnT += dt;
      if (this.burnT < 0.5) this.stream(dt, this.impactY);
      this.splash(dt);
      if (this.burnT > 0.6) this.alive = false;
    }
  }
  draw(ctx: Ctx) {
    const y0 = this.state === 'fly' ? this.y : this.impactY;
    const y1 = this.muzzleY;
    const len = y1 - y0;
    if (len < 4 || (this.state === 'burn' && this.burnT > 0.5)) return;
    const fade = this.state === 'burn' ? Math.max(0, 1 - this.burnT / 0.5) : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const n = Math.max(6, Math.floor(len / 10));
    const layers: [number, number, string, string, string][] = [
      [1, 0.5, '255,110,20', '255,90,15', '255,60,10'],
      [0.62, 0.7, '255,190,60', '255,150,40', '255,100,20'],
      [0.3, 0.95, '255,250,225', '255,225,120', '255,170,60'],
    ];
    for (const [wm, am, c0, c1, c2] of layers) {
      const Lp: number[] = [];
      const Rp: number[] = [];
      for (let i = 0; i <= n; i++) {
        const s = i / n;
        const yy = y1 - s * len;
        const w = lerp(4, 24, s) * wm * (1 + 0.22 * Math.sin(s * 16 - this.age * 45));
        const xo = Math.sin(s * 9 + this.age * 30) * 2.2 * s;
        Lp.push(this.x + xo - w, yy);
        Rp.push(this.x + xo + w, yy);
      }
      ctx.beginPath();
      ctx.moveTo(Lp[0], Lp[1]);
      for (let i = 2; i < Lp.length; i += 2) ctx.lineTo(Lp[i], Lp[i + 1]);
      for (let i = Rp.length - 2; i >= 0; i -= 2) ctx.lineTo(Rp[i], Rp[i + 1]);
      ctx.closePath();
      const gr = ctx.createLinearGradient(0, y1, 0, y0);
      gr.addColorStop(0, `rgba(${c0},${am * fade})`);
      gr.addColorStop(0.5, `rgba(${c1},${am * 0.75 * fade})`);
      gr.addColorStop(1, `rgba(${c2},${am * 0.5 * fade})`);
      ctx.fillStyle = gr;
      ctx.fill();
    }
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    this.state = 'burn';
    this.impactY = hy;
    this.burnT = 0;
    g.wheelImpact(4, 'rgba(255,190,100,');
    g.shake(4);
    S.fire(ps, hx, hy, 24, Math.PI / 2, 1.6, [80, 360], [26, 44], [50, 90], [0.3, 0.6], { g: -350 });
    S.glow(ps, hx, hy, 160, 30, '255,200,100', 0.25, 0.9);
    S.ring(ps, hx, hy, 6, 74, '255,170,70', 5, 0.3, true);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [150, 500], '255,200,100', 1.4);
    S.embers(ps, hx, hy, 20, Math.PI / 2, 1.6, [60, 300]);
    S.smoke(ps, hx, hy, 5, '50,42,38', [14, 50], { vx: [-50, 50], vy: [-80, -20], alpha: 0.45, life: [0.8, 1.4] });
    const cracks = makeCracks(theta, R, 5, [14, 34], 1.4);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const wide = c.createRadialGradient(cx, cy, 4, cx, cy, 36);
      wide.addColorStop(0, 'rgba(60,28,8,0.5)');
      wide.addColorStop(1, 'rgba(60,28,8,0)');
      c.fillStyle = wide;
      c.beginPath();
      c.arc(cx, cy, 36, 0, TAU);
      c.fill();
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 24);
      rg.addColorStop(0, 'rgba(10,5,2,0.95)');
      rg.addColorStop(0.5, 'rgba(28,14,6,0.7)');
      rg.addColorStop(1, 'rgba(40,20,8,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 24, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(15,7,3,0.9)', 1.4);
    });
    g.addWheelFX(new GlowLines(cracks, '255,140,40', 1.3, 2.4));
    g.addWheelFX(new GlowSpot(lx * 0.94, ly * 0.94, 76, '255,120,30', 2.4, 0.85));
    g.landed(makeItem('flame', theta, 0.1, 12, true), 0.6);
    sfx.play('flame_hit');
  }
  block(hx: number, hy: number) {
    this.state = 'burn';
    this.impactY = hy;
    this.burnT = 0;
    const ps = this.g.particles;
    S.fire(ps, hx, hy, 18, Math.PI / 2, 1.6, [80, 320], [24, 40], [46, 80], [0.3, 0.55], { g: -300 });
    S.sparks(ps, hx, hy, 14, Math.PI / 2, 1.4, [150, 450], '255,200,100', 1.3);
    this.g.addFX(new Light(hx, hy, 190, '255,140,40', 0.7, 0.3));
    sfx.play('flame_hit');
  }
}

// ───────────────────────── BUBBLE ─────────────────────────
export class BubbleShot extends Projectile {
  weapon = 'bubble' as const;
  tip = 8;
  half = 0.1;
  r = 5;
  baseX: number;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -560);
    this.baseX = x;
  }
  trail(dt: number) {
    this.r = Math.min(15, 5 + this.age * 60);
    this.tip = this.r * 0.9;
    this.x = this.baseX + Math.sin(this.age * 7) * 4;
    const ps = this.g.particles;
    if (Math.random() < dt * 20)
      ps.add({ k: K.STAR, add: true, x: this.x + rand(-this.r, this.r), y: this.y + rand(0, this.r), vx: rand(-20, 20), vy: rand(10, 50), size: rand(5, 9), life: rand(0.3, 0.5), color: pick(FILM_COLS), drag: 2 });
    if (Math.random() < dt * 9) S.miniBubble(ps, this.x + rand(-10, 10), this.y + rand(6, 20), rand(-30, 30), rand(10, 40), rand(2.4, 5), rand(0.45, 0.8));
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,240'), this.x, this.y, this.r * 4, 0.18);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    const w = Math.sin(this.age * 18) * 0.07;
    ctx.scale(1 + w, 1 - w);
    drawBubble(ctx, this.r, this.g.time, this.baseX * 0.01, 1);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(4, 'rgba(255,215,245,');
    g.shake(3);
    const cy = hy + this.r * 0.8;
    S.bubblePop(ps, hx, cy, this.r * 1.15);
    S.bubblePop(ps, hx - 10, cy + 6, 6);
    S.bubblePop(ps, hx + 11, cy + 3, 5);
    S.droplets(ps, hx, hy, 14, Math.PI / 2, 1.4, [60, 300], [1, 2.4], '205,235,255');
    S.smoke(ps, hx, hy + 4, 6, '255,236,250', [10, 40], { vx: [-70, 70], vy: [-10, 60], alpha: 0.3 });
    S.stars(ps, hx, hy + 10, 10, '255,225,250', [60, 220], [8, 15], Math.PI / 2, 1.6);
    g.addFX(new Light(hx, hy + 10, 170, '255,170,230', 0.55, 0.3));
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const tiny = Array.from({ length: 10 }, () => ({ a: rand(0, TAU), d: rand(2, 17), r: rand(1.2, 3.2) }));
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy2 = ly * 0.94;
      const sh = c.createRadialGradient(cx, cy2, 1, cx, cy2, 20);
      sh.addColorStop(0, 'rgba(255,255,255,0.42)');
      sh.addColorStop(0.7, 'rgba(255,210,245,0.2)');
      sh.addColorStop(1, 'rgba(255,210,245,0)');
      c.fillStyle = sh;
      c.beginPath();
      c.arc(cx, cy2, 20, 0, TAU);
      c.fill();
      for (const t of tiny) {
        const bx = cx + Math.cos(t.a) * t.d;
        const by = cy2 + Math.sin(t.a) * t.d;
        c.fillStyle = 'rgba(255,205,240,0.28)';
        c.beginPath();
        c.arc(bx, by, t.r, 0, TAU);
        c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.85)';
        c.lineWidth = 0.7;
        c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.9)';
        c.beginPath();
        c.arc(bx - t.r * 0.35, by - t.r * 0.35, t.r * 0.25, 0, TAU);
        c.fill();
      }
    });
    const beads = [
      { da: 0, s: 9.5 },
      { da: 0.11, s: 6 },
      { da: -0.1, s: 4.6 },
      { da: 0.2, s: 3.2 },
      { da: -0.19, s: 3 },
    ];
    g.landed(makeItem('bubble', theta, 0.14, 15, true, { beads }), 0.35);
    sfx.play('bubble_pop');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.bubblePop(ps, hx, hy + 8, this.r * 1.2);
    S.droplets(ps, hx, hy, 16, Math.PI / 2, 1.5, [80, 320], [1, 2.4], '205,235,255');
    S.stars(ps, hx, hy + 8, 8, '255,225,250', [60, 200], [8, 14], Math.PI / 2, 1.6);
    sfx.play('bubble_pop');
    this.alive = false;
  }
}

// ───────────────────────── BAMBOO CANNONBALL ─────────────────────────
export class BambooShot extends Projectile {
  weapon = 'bamboo' as const;
  tip = 11;
  half = 0.115;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -760);
  }
  trail() {
    const ps = this.g.particles;
    ps.add({ k: K.SMOKE, x: this.x + rand(-5, 5), y: this.y + rand(10, 20), vx: rand(-22, 22), vy: rand(10, 50), size: 14, size2: 46, life: rand(0.7, 1.1), color: '60,52,46', alpha: 0.55, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < 0.8) ps.add({ k: K.FIRE, add: true, x: this.x + rand(-6, 6), y: this.y + rand(8, 18), vx: rand(-30, 30), vy: rand(40, 120), size: 16, size2: 34, life: rand(0.18, 0.3), alpha: 0.9, g: 0, drag: 1 });
    if (Math.random() < 0.6) ps.add({ k: K.SPARK, add: true, x: this.x + rand(-5, 5), y: this.y + rand(6, 16), vx: rand(-120, 120), vy: rand(60, 200), g: 300, size: 1.4, life: rand(0.3, 0.6), color: '255,200,100', drag: 2 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 130);
    gr.addColorStop(0, 'rgba(255,235,170,0.85)');
    gr.addColorStop(0.35, 'rgba(255,150,40,0.5)');
    gr.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 11, this.y + 4);
    ctx.lineTo(this.x + 11, this.y + 4);
    ctx.lineTo(this.x + 1, this.y + 130);
    ctx.lineTo(this.x - 1, this.y + 130);
    ctx.closePath();
    ctx.fill();
    drawSprite(ctx, glowSprite('255,140,40'), this.x, this.y + 6, 76, 0.75);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    drawIronBall(ctx, 11, 0.75);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(13, 'rgba(255,210,140,');
    g.hitStop(0.12);
    g.shake(16);
    g.flashScreen('255,200,120', 0.32);
    g.addFX(new Light(hx, hy, 360, '255,150,50', 1, 0.55));
    S.glow(ps, hx, hy, 280, 40, '255,235,190', 0.3, 1);
    S.fire(ps, hx, hy, 36, Math.PI / 2, 1.7, [60, 420], [34, 60], [60, 110], [0.45, 0.8], { g: -200, drag: 2.2 });
    S.fire(ps, hx, hy - 12, 14, -Math.PI / 2, 1.2, [40, 200], [30, 46], [56, 90], [0.4, 0.7], { g: -150 });
    S.ring(ps, hx, hy, 10, 200, '255,170,70', 14, 0.5, true);
    S.ring(ps, hx, hy, 6, 250, '255,240,200', 3, 0.36, true);
    S.smoke(ps, hx, hy, 14, '40,34,30', [24, 100], { vx: [-120, 120], vy: [-70, 80], alpha: 0.7, life: [1, 1.8], drag: 2 });
    S.sparks(ps, hx, hy, 50, Math.PI / 2, 1.7, [200, 800], '255,200,110', 1.8);
    S.embers(ps, hx, hy, 26, Math.PI / 2, 1.8, [80, 420]);
    S.chips(ps, hx, hy, 24, Math.PI / 2, 1.6, [160, 560]);
    S.splinters(ps, hx, hy, 16, Math.PI / 2, 1.6, [200, 600]);
    const cracks = makeCracks(theta, R, 7, [18, 44], 1.3);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const wide = c.createRadialGradient(cx, cy, 6, cx, cy, 44);
      wide.addColorStop(0, 'rgba(50,24,8,0.55)');
      wide.addColorStop(1, 'rgba(50,24,8,0)');
      c.fillStyle = wide;
      c.beginPath();
      c.arc(cx, cy, 44, 0, TAU);
      c.fill();
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 30);
      rg.addColorStop(0, 'rgba(8,4,2,0.97)');
      rg.addColorStop(0.55, 'rgba(24,12,5,0.75)');
      rg.addColorStop(1, 'rgba(40,20,8,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 30, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(12,6,2,0.6)';
      c.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * TAU + rand(-0.1, 0.1);
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * rand(8, 12), cy + Math.sin(a) * rand(8, 12));
        c.lineTo(cx + Math.cos(a) * rand(24, 38), cy + Math.sin(a) * rand(24, 38));
        c.stroke();
      }
      strokeLines(c, cracks, 'rgba(255,225,180,0.25)', 0.6, 0.5, 0.5);
      strokeLines(c, cracks, 'rgba(12,6,2,0.92)', 1.4);
    });
    g.addWheelFX(new GlowLines(cracks, '255,140,40', 1.4, 2.2));
    g.addWheelFX(new GlowSpot(lx * 0.94, ly * 0.94, 100, '255,120,30', 2.2, 0.9));
    g.landed(makeItem('bamboo', theta, 0.115, 13, false), 0.5);
    sfx.play('bamboo_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 280, '255,150,50', 0.9, 0.4));
    S.fire(ps, hx, hy, 24, Math.PI / 2, 1.7, [80, 380], [30, 50], [54, 96], [0.4, 0.7], { g: -200 });
    S.ring(ps, hx, hy, 8, 150, '255,170,70', 10, 0.4, true);
    S.smoke(ps, hx, hy, 8, '40,34,30', [20, 80], { vx: [-100, 100], vy: [-40, 80], alpha: 0.6 });
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.6, [200, 650], '255,200,110', 1.6);
    fallingCustom(g, hx, hy, (c) => drawIronBall(c, 11, 0.6));
    sfx.play('bamboo_hit');
    this.alive = false;
  }
}

// ───────────────────────── BANANA ─────────────────────────
export class BananaShot extends Projectile {
  weapon = 'banana' as const;
  tip = 9;
  half = 0.085;
  rot = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -980);
  }
  trail(dt: number) {
    this.rot += dt * 20;
    const ps = this.g.particles;
    if (Math.random() < 0.7) ps.add({ k: K.STAR, add: true, x: this.x + rand(-8, 8), y: this.y + rand(4, 30), vx: rand(-30, 30), vy: rand(0, 60), size: rand(7, 13), life: rand(0.3, 0.6), color: '255,225,90', drag: 2 });
    if (Math.random() < 0.5) ps.add({ k: K.SMOKE, x: this.x + rand(-4, 4), y: this.y + rand(8, 16), vx: rand(-15, 15), vy: rand(10, 40), size: 8, size2: 24, life: 0.45, color: '255,238,160', alpha: 0.3, rot: rand(0, TAU) });
    if (Math.random() < 0.25) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-6, 6), y: this.y + 10, vx: rand(-40, 40), vy: rand(20, 80), size: 1.8, life: 0.5, color: '255,210,70' });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,215,80'), this.x, this.y, 64, 0.4);
    ctx.restore();
    for (let i = 3; i >= 1; i--) {
      ctx.globalAlpha = 0.15 * (4 - i);
      ctx.save();
      ctx.translate(this.x, this.y + i * 11);
      ctx.rotate(this.rot - i * 0.4);
      drawBanana(ctx, 36, 5.5, 11);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawBanana(ctx, 36, 5.5, 11);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(7, 'rgba(255,240,150,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new BananaPop(hx, hy + 18, 0.8));
    g.addFX(new Light(hx, hy, 170, '255,225,100', 0.6, 0.28));
    gooDrops(ps, hx - 3, hy, 14, Math.PI - 0.3, 0.5, [200, 460], [1.8, 3.8]);
    gooDrops(ps, hx + 3, hy, 14, 0.3, 0.5, [200, 460], [1.8, 3.8]);
    gooDrops(ps, hx, hy, 16, Math.PI / 2, 1.4, [100, 380], [1.4, 3.4]);
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 2 + rand(-1.5, 1.5);
      const sp = rand(150, 460);
      const r = rand(3.4, 6);
      ps.add({
        k: K.CUSTOM,
        x: hx + rand(-6, 6),
        y: hy + rand(0, 6),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 1200,
        drag: 0.5,
        rot: rand(0, TAU),
        vrot: rand(-14, 14),
        life: rand(0.7, 1.2),
        draw: (c, p) => {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
          drawBananaSlice(c, r);
          c.restore();
          c.globalAlpha = 1;
        },
      });
    }
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380], BANANA_COLS);
    S.stars(ps, hx, hy, 12, '255,230,100', [80, 260], [9, 16], Math.PI / 2, 1.6);
    S.smoke(ps, hx, hy, 6, '255,238,160', [12, 46], { vx: [-100, 100], vy: [-20, 70], alpha: 0.4, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 56, '255,230,120', 3, 0.3, true);
    g.addDecal({ kind: 'goo', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(11, 1, 0.4), next: 0.1 });
    g.landed(makeItem('banana', theta, 0.08, 22, false, { rotS: rand(-0.5, 0.5) }), 0.25);
    sfx.play('banana_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    gooDrops(ps, hx, hy, 24, Math.PI / 2, 1.3, [150, 460], [1.6, 3.6]);
    S.stars(ps, hx, hy, 8, '255,230,100', [80, 240], [8, 14], Math.PI / 2, 1.6);
    S.chips(ps, hx, hy, 6, Math.PI / 2, 1.3, [120, 320], BANANA_COLS);
    fallingCustom(this.g, hx, hy, (c) => drawBanana(c, 36, 5.5, 11));
    sfx.play('banana_hit');
    this.alive = false;
  }
}
