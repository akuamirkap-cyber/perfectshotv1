import { type Ctx, TAU, clamp, drawSprite, easeInCubic, glowSprite, lerp, makeBolt, normAngle, pick, rand, randomPoly } from './core';
import { drawCasing, makeCracks, strokeLines } from './art';
import { CONF_HEX, drawBolt, drawChicken, drawHarpoonProj, drawFastPizzaSlice, drawPlasmaOrb, drawSeed } from './shapes3';
import { MiniFlash, PartyPop } from './fx3';
import { BatchableWheelLightning, GlowLines, GlowSpot, K, Light, Lightning, Rays } from './particles';
import * as S from './spawn3';
import { sfx } from './audio';
import { Projectile, fallingCustom, makeItem } from './projectiles';
import type { StuckItem } from './weapons';
import type { Game } from './Game';

function boltStroke(ctx: Ctx, pts: number[], cols: [number, string][]) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [w, c] of cols) {
    ctx.strokeStyle = c;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(pts[0], pts[1]);
    for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
    ctx.stroke();
  }
}

// ───────────────────────── HARPOON ─────────────────────────
export class HarpoonShot extends Projectile {
  weapon = 'harpoon' as const;
  tip = 0;
  half = 0.075;
  ox: number;
  oy: number;
  state: 'fly' | 'stuck' | 'retract' = 'fly';
  stateT = 0;
  ringT = 0;
  item: StuckItem | null = null;
  attach = { x: 0, y: 0 };
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1750);
    this.ox = x;
    this.oy = y + 22;
  }
  update(dt: number) {
    this.age += dt;
    if (this.state === 'fly') {
      const prev = this.y - this.tip;
      this.y += this.vy * dt;
      this.trail(dt);
      if (!this.resolved) this.g.collide(this, prev, this.y - this.tip);
      if (this.y < -80) this.alive = false;
    } else {
      this.stateT += dt;
      if (this.state === 'stuck' && this.stateT > 0.55) {
        this.state = 'retract';
        this.stateT = 0;
        sfx.play('rope');
      } else if (this.state === 'retract' && this.stateT > 0.16) this.alive = false;
    }
  }
  trail(dt: number) {
    const ps = this.g.particles;
    this.ringT += dt;
    if (this.ringT > 0.028) {
      this.ringT = 0;
      S.ring(ps, this.x, this.y + 56, 3, 22, '190,250,255', 1.6, 0.3, false, 0.55);
    }
    if (Math.random() < 0.7) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-3, 3), y: this.y + rand(10, 50), vx: rand(-25, 25), vy: rand(10, 60), size: 1.5, life: 0.4, color: '110,255,235' });
    if (Math.random() < 0.3) S.smoke(ps, this.x, this.y + 58, 1, '235,248,252', [5, 18], { vy: [0, 30], alpha: 0.25, life: [0.3, 0.5] });
  }
  private ropeEnd() {
    const g = this.g;
    if (this.state === 'fly') return { x: this.x, y: this.y + 56 };
    let ax = this.attach.x;
    let ay = this.attach.y;
    if (this.item) {
      const w = g.wheel;
      const a = this.item.angle + w.angle;
      ax = w.x + Math.cos(a) * (w.R + this.item.protrude - 3);
      ay = w.y + w.bumpY + Math.sin(a) * (w.R + this.item.protrude - 3);
    }
    if (this.state === 'retract') {
      const k = easeInCubic(clamp(this.stateT / 0.16, 0, 1));
      return { x: lerp(ax, this.ox, k), y: lerp(ay, this.oy, k) };
    }
    return { x: ax, y: ay };
  }
  draw(ctx: Ctx) {
    const e = this.ropeEnd();
    const dx = e.x - this.ox;
    const dy = e.y - this.oy;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    let A = 0;
    if (this.state === 'fly') A = 9 * Math.sin(this.age * 30) * Math.exp(-this.age * 2) + 5;
    else if (this.state === 'stuck') A = 16 * Math.exp(-this.stateT * 6) * Math.sin(this.stateT * 55);
    else A = 12 * Math.sin(this.stateT * 70) * (1 - this.stateT / 0.16);
    const path = () => {
      ctx.beginPath();
      for (let i = 0; i <= 22; i++) {
        const s = i / 22;
        const off = Math.sin(s * Math.PI) * A;
        const px = this.ox + dx * s + nx * off;
        const py = this.oy + dy * s + ny * off;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    };
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3d2a12';
    ctx.lineWidth = 3.4;
    path();
    ctx.stroke();
    ctx.strokeStyle = '#c9a063';
    ctx.lineWidth = 2;
    path();
    ctx.stroke();
    ctx.strokeStyle = '#7a5a2c';
    ctx.lineWidth = 2;
    ctx.setLineDash([2.5, 3]);
    path();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    if (this.state === 'fly') {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createLinearGradient(0, this.y + 20, 0, this.y + 130);
      gr.addColorStop(0, 'rgba(210,255,250,0.45)');
      gr.addColorStop(1, 'rgba(210,255,250,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(this.x - 3, this.y + 20, 6, 110);
      drawSprite(ctx, glowSprite('90,255,230'), this.x, this.y + 6, 40, 0.45);
      ctx.restore();
      ctx.save();
      ctx.translate(this.x, this.y);
      drawHarpoonProj(ctx);
      ctx.restore();
    }
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(11, 'rgba(220,255,250,');
    g.hitStop(0.08);
    g.shake(9);
    g.addFX(new Light(hx, hy, 190, '130,255,235', 0.7, 0.3));
    S.glow(ps, hx, hy, 110, 16, '220,255,250', 0.18, 1);
    S.ring(ps, hx, hy, 5, 110, '190,255,248', 4, 0.36, true);
    S.ring(ps, hx, hy, 4, 74, '210,170,110', 5, 0.3, false, 0.7);
    S.smoke(ps, hx, hy, 10, '190,165,130', [12, 54], { vx: [-140, 140], vy: [-20, 90], alpha: 0.55, life: [0.7, 1.2], drag: 2.4 });
    S.chips(ps, hx, hy, 16, Math.PI / 2, 1.5, [150, 480]);
    S.splinters(ps, hx, hy, 16, Math.PI / 2, 1.4, [220, 640]);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [250, 700], '190,255,245', 1.5);
    S.sparks(ps, hx, hy, 8, Math.PI / 2, 1.5, [200, 500], '255,215,150', 1.2);
    const cracks = makeCracks(theta, R, 6, [16, 38], 1.2);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.93;
      const cy = ly * 0.93;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 15);
      rg.addColorStop(0, 'rgba(25,10,2,0.85)');
      rg.addColorStop(1, 'rgba(25,10,2,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 15, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(255,225,180,0.28)', 0.6, 0.5, 0.5);
      strokeLines(c, cracks, 'rgba(30,14,4,0.9)', 1.2);
    });
    g.addWheelFX(new GlowLines(cracks, '110,255,230', 1.0, 0.7));
    const item = makeItem('harpoon', theta, 0.075, 40, false, { wob: 0.28 });
    g.landed(item, 0.25);
    this.item = item;
    this.state = 'stuck';
    this.stateT = 0;
    sfx.play('harpoon_hit');
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.3, [250, 700], '210,255,250', 1.5);
    S.glow(ps, hx, hy, 70, 10, '200,255,250', 0.16, 1);
    S.ring(ps, hx, hy, 4, 56, '255,255,255', 3, 0.22, true);
    fallingCustom(this.g, hx, hy, (c) => {
      c.translate(0, -28);
      drawHarpoonProj(c);
    });
    this.attach = { x: hx, y: hy };
    this.state = 'retract';
    this.stateT = 0;
    sfx.play('ricochet');
  }
}

// ───────────────────────── RUBBER CHICKEN ─────────────────────────
export class ChickenShot extends Projectile {
  weapon = 'chicken' as const;
  tip = 26;
  half = 0.1;
  rot = 0;
  flap = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -920);
  }
  trail(dt: number) {
    this.rot = Math.sin(this.age * 11) * 0.45;
    this.flap = Math.sin(this.age * 30) * 0.5;
    const ps = this.g.particles;
    for (let tick = 0, n = this.cosmeticTicks(dt); tick < n; tick++) {
      if (Math.random() < 0.3) S.feathers(ps, this.x + rand(-8, 8), this.y + rand(8, 22), 1, Math.PI / 2, 1.2, [20, 90]);
      if (Math.random() < 0.5) ps.add({ k: K.STAR, add: true, x: this.x + rand(-10, 10), y: this.y + rand(6, 30), vx: rand(-25, 25), vy: rand(0, 50), size: rand(6, 11), life: rand(0.3, 0.5), color: '255,235,120', drag: 2 });
      if (Math.random() < 0.4) ps.add({ k: K.SMOKE, x: this.x + rand(-5, 5), y: this.y + rand(10, 22), vx: rand(-14, 14), vy: rand(10, 30), size: 7, size2: 22, life: 0.45, color: '255,248,215', alpha: 0.3, rot: rand(0, TAU) });
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,225,90'), this.x, this.y, 74, 0.28);
    ctx.restore();
    const st = 1 + 0.07 * Math.sin(this.age * 22);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(1 / Math.sqrt(st), st);
    drawChicken(ctx, 0.9, this.flap, 0.6);
    ctx.restore();
  }
  private burst(hx: number, hy: number, big: boolean) {
    const g = this.g;
    const ps = g.particles;
    S.feathers(ps, hx, hy, big ? 26 : 16, Math.PI / 2, 1.6, [100, 440]);
    S.smoke(ps, hx, hy, big ? 9 : 5, '255,248,215', [14, 56], { vx: [-110, 110], vy: [-20, 80], alpha: 0.5, life: [0.6, 1.1], drag: 2.4 });
    S.stars(ps, hx, hy, big ? 14 : 8, '255,235,120', [80, 280], [9, 17], Math.PI / 2, 1.6);
    S.ring(ps, hx, hy, 4, big ? 70 : 50, '255,236,150', 3.5, 0.32, true);
    ps.add({ k: K.TEXT, x: hx, y: hy + 46, vy: -40, drag: 1.5, size: big ? 32 : 26, text: 'BWAK!', color: '255,226,80', life: 0.85 });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const R = g.wheel.R;
    g.wheelImpact(8, 'rgba(255,244,180,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new Light(hx, hy, 180, '255,230,110', 0.65, 0.3));
    this.burst(hx, hy, true);
    S.glow(g.particles, hx, hy, 110, 16, '255,248,200', 0.2, 0.9);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const sm = c.createRadialGradient(cx, cy, 1, cx, cy, 16);
      sm.addColorStop(0, 'rgba(255,240,170,0.5)');
      sm.addColorStop(1, 'rgba(255,240,170,0)');
      c.fillStyle = sm;
      c.beginPath();
      c.arc(cx, cy, 16, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(150,80,10,0.85)';
      c.lineWidth = 1.5;
      c.lineCap = 'round';
      for (const k of [-1, 1]) {
        const a0 = theta + k * 0.17;
        const px = Math.cos(a0) * (R - 14);
        const py = Math.sin(a0) * (R - 14);
        const dir = a0 + Math.PI;
        c.beginPath();
        for (const d of [-0.5, 0, 0.5]) {
          c.moveTo(px, py);
          c.lineTo(px + Math.cos(dir + d) * 6, py + Math.sin(dir + d) * 6);
        }
        c.stroke();
      }
    });
    g.landed(makeItem('chicken', theta, 0.1, 34, false), 0.3);
    sfx.play('chicken_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.burst(hx, hy, false);
    fallingCustom(this.g, hx, hy, (c) => drawChicken(c, 0.9, 0.5, 0.7));
    sfx.play('chicken_hit');
    this.alive = false;
  }
}

// ───────────────────────── CONFETTI BALL ─────────────────────────
export class ConfettiShot extends Projectile {
  weapon = 'confetti' as const;
  tip = 9;
  half = 0.09;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1100);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let tick = 0, n = this.cosmeticTicks(dt); tick < n; tick++) {
      S.confetti(ps, this.x + rand(-4, 4), this.y + rand(6, 16), 2, Math.PI / 2, 1.3, [20, 90], [3, 5.5], [0.7, 1.3]);
      if (Math.random() < 0.5) ps.add({ k: K.STAR, add: true, x: this.x + rand(-9, 9), y: this.y + rand(0, 26), vx: rand(-25, 25), vy: rand(0, 50), size: rand(7, 13), life: rand(0.3, 0.55), color: pick(['255,200,240', '200,230,255', '255,245,170']), drag: 2 });
    }
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.lineCap = 'round';
    for (let k = 0; k < 5; k++) {
      const L = 70 + k * 12;
      const dir = k % 2 ? -1 : 1;
      const path = () => {
        ctx.beginPath();
        for (let j = 0; j <= 14; j++) {
          const s = j / 14;
          const px = this.x + Math.sin(s * 10 - t * 30 + k * 1.7) * (2 + 9 * s) * dir * (0.6 + k * 0.12);
          const py = this.y + 4 + s * L;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
      };
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = CONF_HEX[k % CONF_HEX.length];
      ctx.lineWidth = 3.4;
      path();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 1;
      path();
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,250'), this.x, this.y, 58, 0.6);
    ctx.restore();
    const r = 8.5;
    if (typeof ctx.createConicGradient === 'function') {
      const cg = ctx.createConicGradient(t * 6, this.x, this.y);
      CONF_HEX.forEach((c, i) => cg.addColorStop(i / CONF_HEX.length, c));
      cg.addColorStop(1, CONF_HEX[0]);
      ctx.fillStyle = cg;
    } else ctx.fillStyle = '#ff7ac0';
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(this.x - 2.6, this.y - 3, 2.4, 0, TAU);
    ctx.fill();
    for (let k = 0; k < 5; k++) {
      const a = t * 9 + (k * TAU) / 5;
      ctx.save();
      ctx.translate(this.x + Math.cos(a) * 14, this.y + Math.sin(a) * 6);
      ctx.rotate(a * 2);
      ctx.fillStyle = CONF_HEX[(k + 2) % CONF_HEX.length];
      ctx.fillRect(-2.4, -1.3, 4.8, 2.6);
      ctx.restore();
    }
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(6, 'rgba(255,230,250,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new PartyPop(hx, hy + 14, 0.2));
    g.addFX(new Light(hx, hy, 200, '255,200,255', 0.65, 0.3));
    S.glow(ps, hx, hy, 120, 16, '255,240,255', 0.2, 1);
    S.ring(ps, hx, hy, 5, 90, '255,110,170', 4, 0.4, true);
    S.ring(ps, hx, hy, 4, 66, '110,210,255', 3.5, 0.34, true);
    S.ring(ps, hx, hy, 3, 44, '255,230,110', 3, 0.28, true);
    S.confetti(ps, hx, hy, 80, Math.PI / 2, 1.65, [120, 560], [3, 7], [1.2, 2.2]);
    S.confetti(ps, hx, hy, 18, -Math.PI / 2, 1.1, [40, 200], [3, 6], [1, 1.7]);
    S.streamers(ps, hx, hy, 9, Math.PI / 2, 1.3, [200, 540]);
    S.stars(ps, hx, hy, 12, '255,230,250', [80, 280], [9, 17], Math.PI / 2, 1.6);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.5, [200, 520], '255,235,200', 1.2, 600);
    g.after(0.13, () => {
      S.confetti(ps, hx, hy + 8, 44, Math.PI / 2, 1.5, [60, 340], [3, 6], [1.3, 2.2]);
      S.streamers(ps, hx, hy + 8, 4, Math.PI / 2, 1.2, [100, 320]);
      S.ring(ps, hx, hy + 8, 3, 52, '255,255,255', 2.5, 0.26, true);
      sfx.play('confetti_pop2');
    });
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const bits = Array.from({ length: 22 }, () => ({ a: rand(0, TAU), d: rand(4, 28), r: rand(0, TAU), c: pick(CONF_HEX), w: rand(3, 5.6) }));
    g.paint((c) => {
      for (const b of bits) {
        c.save();
        c.translate(lx * 0.94 + Math.cos(b.a) * b.d, ly * 0.94 + Math.sin(b.a) * b.d);
        c.rotate(b.r);
        c.fillStyle = b.c;
        c.fillRect(-b.w / 2, -b.w * 0.3, b.w, b.w * 0.6);
        c.restore();
      }
    });
    g.landed(makeItem('confetti', theta, 0.09, 24, true), 0.35);
    sfx.play('confetti_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new PartyPop(hx, hy + 10, 0.18));
    S.confetti(ps, hx, hy, 56, Math.PI / 2, 1.6, [120, 460], [3, 6.5], [1.1, 1.9]);
    S.streamers(ps, hx, hy, 6, Math.PI / 2, 1.3, [160, 440]);
    S.ring(ps, hx, hy, 4, 70, '255,170,230', 3.5, 0.34, true);
    sfx.play('confetti_hit');
    this.alive = false;
  }
}

// ───────────────────────── SEED ─────────────────────────
export class SeedShot extends Projectile {
  weapon = 'seed' as const;
  tip = 10;
  half = 0.07;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1250);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.35) S.leaves(ps, this.x + rand(-6, 6), this.y + rand(8, 22), 1, Math.PI / 2, 1.3, [20, 90]);
      if (Math.random() < 0.7) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-5, 5), y: this.y + rand(6, 26), vx: rand(-30, 30), vy: rand(10, 70), size: 1.7, life: 0.45, color: pick(['140,255,110', '255,235,120']) });
      if (Math.random() < 0.3) ps.add({ k: K.STAR, add: true, x: this.x + rand(-8, 8), y: this.y + rand(4, 26), vx: rand(-20, 20), vy: rand(0, 40), size: rand(6, 10), life: 0.4, color: '170,255,140', drag: 2 });
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 70);
    gr.addColorStop(0, 'rgba(160,255,130,0.5)');
    gr.addColorStop(1, 'rgba(160,255,130,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(this.x - 4, this.y + 4, 8, 66);
    drawSprite(ctx, glowSprite('130,255,110'), this.x, this.y, 42, 0.5);
    ctx.restore();
    const sx = Math.cos(this.age * 18);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(0.55 + 0.45 * Math.abs(sx), 1);
    drawSeed(ctx, 19, 7.6);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(6, 'rgba(200,255,170,');
    g.hitStop(0.03);
    g.shake(4);
    g.addFX(new Light(hx, hy, 150, '150,255,120', 0.5, 0.28));
    S.glow(ps, hx, hy, 90, 14, '210,255,190', 0.2, 0.9);
    S.ring(ps, hx, hy, 4, 64, '150,255,120', 3.5, 0.34, true);
    S.soil(ps, hx, hy, 22, Math.PI / 2, 1.5, [100, 400]);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.4, [100, 320]);
    S.leaves(ps, hx, hy, 14, Math.PI / 2, 1.5, [80, 320]);
    S.smoke(ps, hx, hy, 7, '150,215,120', [10, 44], { vx: [-90, 90], vy: [-20, 70], alpha: 0.4, life: [0.6, 1.1] });
    S.stars(ps, hx, hy, 8, '190,255,150', [60, 220], [8, 14], Math.PI / 2, 1.6);
    const cracks = makeCracks(theta, R, 3, [8, 18], 1.2);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.95;
      const cy = ly * 0.95;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 11);
      rg.addColorStop(0, 'rgba(46,26,10,0.9)');
      rg.addColorStop(1, 'rgba(46,26,10,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 11, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(30,14,4,0.85)', 1);
      c.fillStyle = 'rgba(90,190,70,0.4)';
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(cx + rand(-9, 9), cy + rand(-9, 9), rand(1, 2.2), 0, TAU);
        c.fill();
      }
    });
    g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 40, '150,255,120', 0.7, 0.55));
    const item = makeItem('seed', theta, 0.07, 24, false);
    g.landed(item, 0.9);
    g.after(0.85, () => {
      const w = g.wheel;
      const a = item.angle + w.angle;
      const px = w.x + Math.cos(a) * (w.R + 28);
      const py = w.y + w.bumpY + Math.sin(a) * (w.R + 28);
      S.stars(g.particles, px, py, 7, '255,205,235', [30, 110], [8, 13], -Math.PI / 2, Math.PI);
      S.leaves(g.particles, px, py, 5, a, 1.2, [30, 110]);
      sfx.play('seed_grow');
    });
    sfx.play('seed_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.leaves(ps, hx, hy, 10, Math.PI / 2, 1.5, [80, 280]);
    S.soil(ps, hx, hy, 8, Math.PI / 2, 1.4, [80, 280]);
    S.stars(ps, hx, hy, 6, '190,255,150', [60, 200], [8, 13], Math.PI / 2, 1.6);
    fallingCustom(this.g, hx, hy, (c) => drawSeed(c, 19, 7.6));
    sfx.play('seed_hit');
    this.alive = false;
  }
}

// ───────────────────────── PIZZA ─────────────────────────
export class PizzaShot extends Projectile {
  weapon = 'pizza' as const;
  tip = 15;
  half = 0.1;
  rot = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
  }
  trail(dt: number) {
    this.rot += dt * 14;
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.6) ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + rand(8, 20), vx: rand(-16, 16), vy: rand(10, 40), size: 8, size2: 24, life: 0.5, color: '255,248,235', alpha: 0.3, rot: rand(0, TAU) });
      if (Math.random() < 0.6) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-9, 9), y: this.y + rand(4, 22), vx: rand(-40, 40), vy: rand(20, 90), size: 1.9, life: 0.5, color: pick(['255,210,80', '255,170,50']) });
      if (Math.random() < 0.08) S.pepperoni(ps, this.x, this.y, 1, Math.PI / 2, 0.8, [40, 140]);
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,80'), this.x, this.y, 70, 0.3);
    ctx.restore();
    for (let i = 3; i >= 1; i--) {
      ctx.globalAlpha = 0.12 * (4 - i);
      ctx.save();
      ctx.translate(this.x, this.y + i * 11);
      ctx.rotate(this.rot - i * 0.4);
      drawFastPizzaSlice(ctx, 36);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawFastPizzaSlice(ctx, 36);
    ctx.restore();
  }
  private splat(hx: number, hy: number, n: number) {
    const ps = this.g.particles;
    S.goo(ps, hx - 3, hy, n, Math.PI - 0.3, 0.5, [200, 460], [1.8, 3.8], '255,200,60', '170,90,10');
    S.goo(ps, hx + 3, hy, n, 0.3, 0.5, [200, 460], [1.8, 3.8], '255,200,60', '170,90,10');
    S.goo(ps, hx, hy, n, Math.PI / 2, 1.4, [100, 380], [1.4, 3.4], '255,200,60', '170,90,10');
    S.goo(ps, hx, hy, Math.round(n * 0.8), Math.PI / 2, 1.5, [120, 420], [1.2, 2.8], '220,50,30', '110,15,8');
    S.pepperoni(ps, hx, hy, 7, Math.PI / 2, 1.5, [140, 440]);
    S.cheeseStrings(ps, hx, hy, 6, Math.PI / 2, 1.2, [120, 330]);
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + rand(-1.4, 1.4);
      const sp = rand(120, 360);
      ps.add({
        k: K.CUSTOM,
        x: hx + rand(-6, 6),
        y: hy + rand(0, 6),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        g: 1000,
        drag: 0.5,
        rot: rand(0, TAU),
        vrot: rand(-12, 12),
        life: rand(0.7, 1.2),
        draw: (c, p) => {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.globalAlpha = Math.min(1, (p.life / p.max) * 3);
          c.fillStyle = '#4cb83c';
          c.beginPath();
          c.ellipse(0, 0, 4.4, 2.4, 0, 0, TAU);
          c.fill();
          c.strokeStyle = '#1d6b2c';
          c.lineWidth = 0.7;
          c.stroke();
          c.restore();
        },
      });
    }
    S.stars(ps, hx, hy, 8, '255,225,130', [80, 240], [8, 14], Math.PI / 2, 1.6);
    S.smoke(ps, hx, hy, 6, '255,245,225', [12, 46], { vx: [-100, 100], vy: [-20, 70], alpha: 0.4, life: [0.6, 1.1] });
    S.ring(ps, hx, hy, 4, 60, '255,215,120', 3.5, 0.32, true);
    ps.add({ k: K.TEXT, x: hx, y: hy + 44, vy: -40, drag: 1.5, size: 28, text: 'SPLAT!', color: '255,176,60', life: 0.85 });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    g.wheelImpact(8, 'rgba(255,226,160,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new Light(hx, hy, 190, '255,190,80', 0.65, 0.3));
    S.glow(g.particles, hx, hy, 110, 16, '255,240,200', 0.2, 0.9);
    this.splat(hx, hy, 14);
    g.addDecal({
      kind: 'goo',
      angle: theta,
      t: 0,
      seed: rand(0, 10),
      blob: randomPoly(11, 1, 0.4),
      next: 0.1,
      c: ['rgba(150,50,10,0.92)', 'rgba(255,190,50,0.96)', 'rgba(255,228,125,0.92)'],
      drip: '255,200,60',
      dripData: '170,90,10',
    });
    g.landed(makeItem('pizza', theta, 0.1, 26, false), 0.3);
    sfx.play('pizza_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.splat(hx, hy, 10);
    fallingCustom(this.g, hx, hy, (c) => drawFastPizzaSlice(c, 36));
    sfx.play('pizza_hit');
    this.alive = false;
  }
}

// ───────────────────────── MINIGUN (rapid burst) ─────────────────────────
interface Bullet {
  x: number;
  y: number;
  py: number;
  done: boolean;
}

export class MinigunBurst extends Projectile {
  weapon = 'minigun' as const;
  tip = 0;
  half = 0.06;
  N = 9;
  gap = 0.05;
  spawned = 0;
  bullets: Bullet[] = [];
  outcome: 'none' | 'hit' | 'block' = 'none';
  baseX: number;
  my: number;
  headDone = false;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -2300);
    this.baseX = x;
    this.my = y;
  }
  private fireOne(i: number) {
    const g = this.g;
    const ps = g.particles;
    const mx = this.baseX;
    const my = this.my + 4;
    g.addFX(new MiniFlash(mx + rand(-5, 5), my, 0.055, rand(0.85, 1.25)));
    if (i % 2 === 0) g.addFX(new Light(mx, my - 16, 130, '255,185,80', 0.5, 0.09));
    S.sparks(ps, mx, my, 3, -Math.PI / 2, 0.55, [260, 620], '255,215,130', 1.2, 300);
    ps.add({
      k: K.CUSTOM,
      x: mx + 14,
      y: my + 104,
      vx: rand(120, 260),
      vy: rand(-280, -130),
      g: 1500,
      rot: rand(0, TAU),
      vrot: rand(10, 24),
      life: 1.2,
      draw: (c, q) => {
        c.save();
        c.translate(q.x, q.y);
        c.rotate(q.rot);
        c.scale(0.8, 0.8);
        drawCasing(c);
        c.restore();
      },
    });
    if (i % 3 === 0) S.smoke(ps, mx, my - 10, 1, '210,205,200', [6, 22], { vy: [-110, -40], vx: [-30, 30], alpha: 0.25, life: [0.4, 0.8] });
    const a = g.anim;
    a.recoilV += 2.6;
    a.spinV = 48;
    a.heat = Math.min(1, a.heat + 0.1);
    g.shake(2.2);
    if (i > 0) this.bullets.push({ x: this.baseX + rand(-2.2, 2.2), y: this.my, py: this.my, done: false });
  }
  update(dt: number) {
    this.age += dt;
    const g = this.g;
    while (this.spawned < this.N && this.age >= this.spawned * this.gap) {
      this.fireOne(this.spawned);
      this.spawned++;
    }
    if (!this.headDone) {
      const prev = this.y;
      this.y += this.vy * dt;
      if (this.outcome === 'none' && !this.resolved) g.collide(this, prev, this.y);
      if (this.y < -60) this.headDone = true;
    }
    const w = g.wheel;
    const cx = w.x;
    const cy = w.y + w.bumpY;
    for (const b of this.bullets) {
      if (b.done) continue;
      b.py = b.y;
      b.y += this.vy * dt;
      if (!g.wheelGone && this.outcome !== 'none') {
        const dx = b.x - cx;
        if (Math.abs(dx) < w.R - 1) {
          const yb = cy + Math.sqrt(w.R * w.R - dx * dx);
          if (b.py > yb && b.y <= yb) {
            b.done = true;
            this.impact(b.x, yb);
            continue;
          }
        }
      }
      if (b.y < -60) b.done = true;
    }
    if (this.spawned >= this.N && this.headDone && this.bullets.every((b) => b.done)) this.alive = false;
  }
  private impact(ix: number, iy: number) {
    const g = this.g;
    const ps = g.particles;
    const w = g.wheel;
    const cy = w.y + w.bumpY;
    const out = Math.atan2(iy - cy, ix - w.x);
    if (this.outcome === 'block') {
      S.sparks(ps, ix, iy, 6, out, 0.9, [200, 500], '255,230,170', 1.3);
      S.glow(ps, ix, iy, 22, 4, '255,230,180', 0.1, 1);
      return;
    }
    const local = out - w.angle;
    const depth = rand(2, 5);
    const lx = Math.cos(local) * (w.R - depth);
    const ly = Math.sin(local) * (w.R - depth);
    g.paint((c) => {
      const rg = c.createRadialGradient(lx, ly, 0, lx, ly, 7);
      rg.addColorStop(0, 'rgba(25,10,2,0.8)');
      rg.addColorStop(1, 'rgba(25,10,2,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(lx, ly, 7, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,225,180,0.45)';
      c.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        const a = rand(0, TAU);
        c.beginPath();
        c.moveTo(lx + Math.cos(a) * 2, ly + Math.sin(a) * 2);
        c.lineTo(lx + Math.cos(a) * rand(3.4, 5), ly + Math.sin(a) * rand(3.4, 5));
        c.stroke();
      }
      c.fillStyle = '#0e0702';
      c.beginPath();
      c.arc(lx, ly, 2.3, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(210,150,60,0.9)';
      c.beginPath();
      c.arc(lx + 0.4, ly - 0.4, 0.8, 0, TAU);
      c.fill();
    });
    g.addWheelFX(new GlowSpot(lx, ly, 18, '255,120,30', 1.3, 0.95));
    g.addDecal({ kind: 'smolder', angle: local, r: w.R - depth, t: 0, seed: rand(0, 10) });
    S.glow(ps, ix, iy, 32, 6, '255,225,160', 0.1, 1);
    S.sparks(ps, ix, iy, 5, out, 0.9, [160, 460], '255,200,100', 1.2);
    S.splinters(ps, ix, iy, 2, out, 1, [100, 300]);
    g.wheelImpact(1.6);
    g.shake(1.4);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.outcome = 'hit';
    this.headDone = true;
    g.wheelImpact(5, 'rgba(255,230,190,');
    g.shake(4);
    S.sparks(ps, hx, hy, 14, Math.PI / 2, 1.4, [200, 600], '255,210,120', 1.5);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.4, [120, 380]);
    S.glow(ps, hx, hy, 60, 10, '255,230,170', 0.14, 1);
    g.landed(makeItem('minigun', theta, 0.06, 8, false), 0.6);
  }
  block(hx: number, hy: number) {
    this.outcome = 'block';
    this.headDone = true;
    S.sparks(this.g.particles, hx, hy, 24, Math.PI / 2, 1.3, [250, 650], '255,230,170', 1.5);
    S.glow(this.g.particles, hx, hy, 70, 10, '255,230,180', 0.16, 1);
    sfx.play('ricochet');
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const pts: { x: number; y: number }[] = [];
    if (!this.headDone) pts.push({ x: this.baseX, y: this.y });
    for (const b of this.bullets) if (!b.done) pts.push(b);
    for (const p of pts) {
      const tail = 50;
      const gr = ctx.createLinearGradient(0, p.y, 0, p.y + tail);
      gr.addColorStop(0, 'rgba(255,245,200,0.98)');
      gr.addColorStop(0.4, 'rgba(255,190,80,0.6)');
      gr.addColorStop(1, 'rgba(255,130,30,0)');
      ctx.strokeStyle = 'rgba(255,140,40,0.28)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + tail);
      ctx.stroke();
      ctx.strokeStyle = gr;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + tail);
      ctx.stroke();
      drawSprite(ctx, glowSprite('255,200,100'), p.x, p.y, 22, 0.85);
      drawSprite(ctx, glowSprite('255,255,240'), p.x, p.y, 8, 1);
    }
    ctx.restore();
  }
}

// ───────────────────────── CROSSBOW BOLT ─────────────────────────
export class CrossbowShot extends Projectile {
  weapon = 'crossbow' as const;
  tip = 0;
  half = 0.065;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1900);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.5) ps.add({ k: K.SMOKE, x: this.x + rand(-3, 3), y: this.y + rand(30, 56), vx: rand(-12, 12), vy: rand(0, 20), size: 5, size2: 16, life: 0.4, color: '235,240,245', alpha: 0.2, rot: rand(0, TAU) });
    if (Math.random() < 0.3) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-3, 3), y: this.y + rand(10, 40), vx: rand(-20, 20), vy: rand(10, 50), size: 1.3, life: 0.3, color: '255,235,200' });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      const gr = ctx.createLinearGradient(0, this.y + 20, 0, this.y + 120);
      gr.addColorStop(0, 'rgba(255,255,255,0.5)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = gr;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.x + s * 9, this.y + 22);
      ctx.lineTo(this.x + s * 7, this.y + 120);
      ctx.stroke();
    }
    ctx.restore();
    for (let i = 2; i >= 1; i--) {
      ctx.globalAlpha = 0.14 * (3 - i);
      ctx.save();
      ctx.translate(this.x, this.y + i * 16);
      drawBolt(ctx);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(this.x, this.y);
    drawBolt(ctx);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(9, 'rgba(255,240,215,');
    g.hitStop(0.06);
    g.shake(7);
    g.addFX(new Light(hx, hy, 150, '255,225,170', 0.5, 0.24));
    S.ring(ps, hx, hy, 4, 80, '215,175,120', 5, 0.32, false, 0.7);
    S.ring(ps, hx, hy, 3, 54, '255,255,255', 2.5, 0.22, true);
    S.smoke(ps, hx, hy, 9, '200,175,140', [10, 46], { vx: [-130, 130], vy: [-20, 80], alpha: 0.5, life: [0.6, 1.1], drag: 2.4 });
    S.chips(ps, hx, hy, 14, Math.PI / 2, 1.5, [140, 440]);
    S.splinters(ps, hx, hy, 14, Math.PI / 2, 1.4, [200, 560]);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.4, [200, 520], '255,225,170', 1.3);
    const cracks = makeCracks(theta, R, 5, [14, 32], 1.2);
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 12);
      rg.addColorStop(0, 'rgba(30,14,4,0.8)');
      rg.addColorStop(1, 'rgba(30,14,4,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 12, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(255,225,180,0.28)', 0.6, 0.5, 0.5);
      strokeLines(c, cracks, 'rgba(30,14,4,0.9)', 1.15);
    });
    g.landed(makeItem('crossbow', theta, 0.065, 30, false, { wob: 0.24 }), 0.2);
    sfx.play('crossbow_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const ps = this.g.particles;
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.3, [220, 620], '255,235,190', 1.4);
    S.splinters(ps, hx, hy, 6, Math.PI / 2, 1.3, [100, 300]);
    S.glow(ps, hx, hy, 60, 10, '255,235,190', 0.14, 1);
    fallingCustom(this.g, hx, hy, (c) => {
      c.translate(0, -26);
      drawBolt(c);
    });
    sfx.play('ricochet');
    this.alive = false;
  }
}

// The Plasma Gun's hit is shared with the yellow Mega Buster tap. These
// palettes only change color: rings, sparks, rays, wheel lightning, glowing
// cracks and timings remain the authored Plasma Gun effect.
export interface PlasmaImpactPalette {
  light: string; burst: string; ringAndWheel: string; darkRing: string;
  rays: string; sparks: string; brightSparks: string; smoke: string; stars: string;
  outwardLightning: string; scarCore: string; scarMiddle: string; scarOuter: string;
  scarRing: string; scarCracks: string; screenFlash: string;
}
export const GREEN_PLASMA_IMPACT: Readonly<PlasmaImpactPalette> = {
  light: '60,255,150', burst: '200,255,220', ringAndWheel: '90,255,170', darkRing: '30,200,110',
  rays: '110,255,170', sparks: '140,255,190', brightSparks: '230,255,240', smoke: '60,110,80',
  stars: '170,255,200', outwardLightning: '150,255,190',
  scarCore: 'rgba(6,14,8,0.95)', scarMiddle: 'rgba(18,40,24,0.6)', scarOuter: 'rgba(30,60,40,0)',
  scarRing: 'rgba(80,255,160,0.5)', scarCracks: 'rgba(10,20,12,0.9)', screenFlash: '80,255,160',
};
export const YELLOW_PLASMA_IMPACT: Readonly<PlasmaImpactPalette> = {
  light: '255,213,35', burst: '255,248,190', ringAndWheel: '255,226,65', darkRing: '211,155,10',
  rays: '255,226,90', sparks: '255,237,120', brightSparks: '255,252,220', smoke: '116,94,52',
  stars: '255,240,150', outwardLightning: '255,238,135',
  scarCore: 'rgba(28,18,3,0.95)', scarMiddle: 'rgba(72,49,7,0.6)', scarOuter: 'rgba(100,75,10,0)',
  scarRing: 'rgba(255,220,70,0.5)', scarCracks: 'rgba(30,20,4,0.9)', screenFlash: '255,228,80',
};

/** Cosmetic burst only; the caller owns scoring, collision, speed and sound. */
export function spawnPlasmaImpact(
  g: Game, theta: number, hx: number, hy: number,
  color: Readonly<PlasmaImpactPalette> = GREEN_PLASMA_IMPACT,
) {
  const ps = g.particles;
  const R = g.wheel.R;
  g.addFX(new Light(hx, hy, 270, color.light, 0.95, 0.45));
  S.glow(ps, hx, hy, 170, 24, color.burst, 0.28, 1);
  S.ring(ps, hx, hy, 6, 140, color.ringAndWheel, 8, 0.45, true);
  S.ring(ps, hx, hy, 4, 84, '255,255,255', 3.5, 0.28, true);
  S.ring(ps, hx, hy, 3, 54, color.darkRing, 5, 0.24, true);
  g.addFX(new Rays(hx, hy, color.rays, 0.4, 12, Math.PI / 2, Math.PI * 0.8));
  S.sparks(ps, hx, hy, 40, Math.PI / 2, 1.6, [220, 680], color.sparks, 1.7);
  S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.4, [300, 700], color.brightSparks, 1.2);
  S.chips(ps, hx, hy, 12, Math.PI / 2, 1.5, [120, 380]);
  S.smoke(ps, hx, hy, 8, color.smoke, [16, 60], { vx: [-80, 80], vy: [-60, 60], alpha: 0.5, life: [0.8, 1.3], drag: 2.4 });
  S.stars(ps, hx, hy, 10, color.stars, [80, 260], [9, 16], Math.PI / 2, 1.6);
  const lx = Math.cos(theta) * R;
  const ly = Math.sin(theta) * R;
  for (let i = 0; i < 7; i++) {
    const a2 = theta + Math.PI + rand(-1.05, 1.05);
    const d = rand(40, 100);
    const WheelBolt = color === YELLOW_PLASMA_IMPACT ? BatchableWheelLightning : Lightning;
    g.addWheelFX(new WheelBolt(lx * 0.98, ly * 0.98, lx + Math.cos(a2) * d, ly + Math.sin(a2) * d, rand(0.3, 0.55), color.ringAndWheel, 1.5, 2, 0.04));
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 2 + rand(-1.3, 1.3);
    const L = rand(46, 90);
    g.addFX(new Lightning(hx, hy, hx + Math.cos(a) * L, hy + Math.sin(a) * L, 0.22, color.outwardLightning, 1.3, 1));
  }
  const cracks = makeCracks(theta, R, 6, [14, 32], 1.3);
  g.paint((c) => {
    const cx = lx * 0.94;
    const cy = ly * 0.94;
    const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 22);
    rg.addColorStop(0, color.scarCore);
    rg.addColorStop(0.5, color.scarMiddle);
    rg.addColorStop(1, color.scarOuter);
    c.fillStyle = rg;
    c.beginPath();
    c.arc(cx, cy, 22, 0, TAU);
    c.fill();
    c.strokeStyle = color.scarRing;
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(cx, cy, 12, 0, TAU);
    c.stroke();
    strokeLines(c, cracks, color.scarCracks, 1.2);
  });
  g.addWheelFX(new GlowLines(cracks, color.ringAndWheel, 1.3, 2.2));
  g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 80, color.light, 2.0, 0.85));
}

// ───────────────────────── PLASMA BOLT ─────────────────────────
export class PlasmaShot extends Projectile {
  weapon = 'plasma' as const;
  tip = 11;
  half = 0.095;
  r = 10.5;
  lightT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -860);
  }
  trail(dt: number) {
    const g = this.g;
    const ps = g.particles;
    ps.add({ k: K.GLOW, add: true, x: this.x + rand(-4, 4), y: this.y + rand(6, 20), vx: rand(-20, 20), vy: rand(10, 50), size: rand(18, 30), size2: 3, color: '60,255,150', life: rand(0.25, 0.4), alpha: 0.7 });
    if (Math.random() < 0.7) S.sparks(ps, this.x, this.y + 6, 1, Math.PI / 2, 1.2, [60, 200], '140,255,190', 1.2, 0, 0.03);
    if (Math.random() < 0.3) {
      const a = rand(0, TAU);
      g.addFX(new Lightning(this.x + Math.cos(a) * 8, this.y + Math.sin(a) * 8, this.x + Math.cos(a) * rand(24, 38), this.y + Math.sin(a) * rand(24, 38), 0.09, '120,255,170', 1, 1, 0.03));
    }
    this.lightT += dt;
    if (this.lightT > 0.05) {
      this.lightT = 0;
      g.addFX(new Light(this.x, this.y, 105, '60,255,150', 0.4, 0.1));
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 110);
    gr.addColorStop(0, 'rgba(150,255,190,0.7)');
    gr.addColorStop(1, 'rgba(40,255,140,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 8, this.y + 4);
    ctx.lineTo(this.x + 8, this.y + 4);
    ctx.lineTo(this.x + 1, this.y + 110);
    ctx.lineTo(this.x - 1, this.y + 110);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawPlasmaOrb(ctx, this.x, this.y, this.r, this.g.time * 1.8, 1.1);
    if (Math.random() < 0.65) {
      const a = rand(0, TAU);
      const L = rand(20, 36);
      const pts = makeBolt(this.x + Math.cos(a) * this.r * 0.7, this.y + Math.sin(a) * this.r * 0.7, this.x + Math.cos(a) * L, this.y + Math.sin(a) * L, 0.4, 4);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      boltStroke(ctx, pts, [
        [3.4, 'rgba(60,255,150,0.3)'],
        [1.3, 'rgba(190,255,215,0.9)'],
        [0.5, 'rgba(255,255,255,1)'],
      ]);
      ctx.restore();
    }
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    g.wheelImpact(9, 'rgba(170,255,200,');
    g.hitStop(0.07);
    g.shake(9);
    g.flashScreen('80,255,160', 0.18);
    spawnPlasmaImpact(g, theta, hx, hy);
    g.landed(makeItem('plasma', theta, 0.095, 12, false), 0.45);
    sfx.play('plasma_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 220, '60,255,150', 0.8, 0.35));
    S.glow(ps, hx, hy, 120, 18, '200,255,220', 0.22, 1);
    S.ring(ps, hx, hy, 5, 110, '90,255,170', 6, 0.4, true);
    S.sparks(ps, hx, hy, 34, Math.PI / 2, Math.PI, [150, 560], '140,255,190', 1.6);
    for (let i = 0; i < 5; i++) {
      const a = Math.PI / 2 + rand(-1.4, 1.4);
      g.addFX(new Lightning(hx, hy, hx + Math.cos(a) * 70, hy + Math.sin(a) * 70, 0.24, '150,255,190', 1.3, 1));
    }
    sfx.play('plasma_hit');
    this.alive = false;
  }
}

// ───────────────────────── LASER BEAM (instant ray) ─────────────────────────
export class LaserBeam extends Projectile {
  weapon = 'laser' as const;
  tip = 0;
  half = 0.05;
  life = 0.36;
  fired = false;
  endY: number;
  mode: 'none' | 'hit' | 'block' = 'none';
  ox: number;
  oy: number;
  fxT = 0;
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
    if (!this.fired) {
      this.fired = true;
      const bottom = w.y + w.bumpY + w.R;
      this.endY = bottom;
      g.collide(this, this.y, bottom - 3);
      if (this.mode === 'none') this.endY = -40;
    }
    if (this.mode !== 'none' && !g.wheelGone) this.burn(dt);
    if (this.age > this.life) this.alive = false;
  }
  private burn(dt: number) {
    const g = this.g;
    const ps = g.particles;
    const w = g.wheel;
    const cy = w.y + w.bumpY;
    const bottom = cy + w.R;
    const fade = 1 - this.age / this.life;
    g.shake(1.4);
    if (this.mode === 'block') {
      S.sparks(ps, this.ox, this.endY, 3, Math.PI / 2, 1.5, [200, 520], '255,200,150', 1.3);
      return;
    }
    const th = normAngle(Math.PI / 2 - w.angle);
    const lx = Math.cos(th) * (w.R - 2);
    const ly = Math.sin(th) * (w.R - 2);
    g.paint((c) => {
      c.fillStyle = 'rgba(16,7,3,0.88)';
      c.beginPath();
      c.arc(lx, ly, 2.5, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(255,90,40,0.12)';
      c.beginPath();
      c.arc(lx, ly, 4.6, 0, TAU);
      c.fill();
    });
    this.fxT += dt;
    if (this.fxT > 0.03) {
      this.fxT = 0;
      g.addWheelFX(new GlowSpot(lx, ly, 22, '255,70,40', 0.8, 0.95 * fade + 0.1));
    }
    S.sparks(ps, this.ox, bottom, 2, Math.PI / 2, 1.5, [220, 560], '255,175,100', 1.3);
    S.sparks(ps, this.ox, bottom, 1, 0.2, 0.3, [220, 420], '255,225,160', 1.1);
    S.sparks(ps, this.ox, bottom, 1, Math.PI - 0.2, 0.3, [220, 420], '255,225,160', 1.1);
    if (Math.random() < dt * 40) S.smoke(ps, this.ox, bottom - 2, 1, '70,60,56', [8, 28], { vx: [-30, 30], vy: [-90, -30], alpha: 0.35, life: [0.6, 1.1] });
    if (Math.random() < dt * 50) ps.add({ k: K.EMBER, add: true, x: this.ox + rand(-6, 6), y: bottom, vx: rand(-110, 110), vy: rand(60, 200), g: 300, size: 1.8, life: 0.5, color: '255,150,60' });
    if (Math.random() < dt * 20) g.addFX(new Light(this.ox, bottom - 6, 120, '255,80,60', 0.5, 0.09));
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.mode = 'hit';
    this.endY = hy;
    g.wheelImpact(5, 'rgba(255,190,180,');
    g.shake(4);
    g.flashScreen('255,70,60', 0.1);
    g.addFX(new Light(hx, hy, 220, '255,80,60', 0.85, 0.4));
    g.addFX(new Rays(hx, hy, '255,120,100', 0.3, 10, Math.PI / 2, Math.PI * 0.8, 0.9));
    S.glow(ps, hx, hy, 120, 20, '255,230,225', 0.2, 1);
    S.ring(ps, hx, hy, 4, 74, '255,110,100', 4, 0.32, true);
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.5, [220, 650], '255,190,120', 1.5);
    g.landed(makeItem('laser', theta, 0.05, 5, true), 0.55);
    sfx.play('laser_hit');
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.mode = 'block';
    this.endY = hy;
    g.addFX(new Light(hx, hy, 200, '255,80,60', 0.8, 0.35));
    S.glow(ps, hx, hy, 100, 16, '255,230,225', 0.2, 1);
    S.ring(ps, hx, hy, 4, 70, '255,110,100', 4, 0.3, true);
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.5, [200, 600], '255,200,150', 1.5);
    sfx.play('laser_hit');
  }
  draw(ctx: Ctx) {
    const y0 = this.oy;
    const y1 = this.endY;
    const L = y0 - y1;
    if (L < 2) return;
    const grow = Math.min(1, this.age / 0.045);
    const fade = this.age > this.life - 0.14 ? Math.max(0, (this.life - this.age) / 0.14) : 1;
    const s = grow * fade * (0.92 + 0.08 * Math.sin(this.age * 90));
    const x = this.ox;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const layers: [number, string][] = [
      [30, 'rgba(255,30,40,0.1)'],
      [16, 'rgba(255,50,60,0.26)'],
      [8, 'rgba(255,110,105,0.6)'],
      [3.4, 'rgba(255,238,232,0.97)'],
    ];
    for (const [w, col] of layers) {
      const n = 26;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const yy = y0 - (i / n) * L;
        const ww = w * 0.5 * s * (1 + 0.14 * Math.sin(yy * 0.07 - this.age * 60));
        if (i === 0) ctx.moveTo(x - ww, yy);
        else ctx.lineTo(x - ww, yy);
      }
      for (let i = n; i >= 0; i--) {
        const yy = y0 - (i / n) * L;
        const ww = w * 0.5 * s * (1 + 0.14 * Math.sin(yy * 0.07 - this.age * 60));
        ctx.lineTo(x + ww, yy);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * s})`;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const yy = y0 - ((this.age * 2600 + (i * L) / 5) % L);
      ctx.beginPath();
      ctx.ellipse(x, yy, 11 * s, 2.6 * s, 0, 0, TAU);
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('255,70,60'), x, y0 - 2, 130 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('255,240,235'), x, y0 - 2, 44 * s, s);
    if (this.mode !== 'none') {
      drawSprite(ctx, glowSprite('255,100,80'), x, y1, 120 * s, 0.9 * s);
      drawSprite(ctx, glowSprite('255,245,240'), x, y1, 40 * s, s);
    }
    ctx.restore();
  }
}
