import { type Ctx, TAU, drawSprite, easeOutCubic, glowSprite, rand, starSprite } from './core';
import { type FX, flame } from './particles';
import { drawDragonFlame, hexPath } from './shapes4';

abstract class Timed implements FX {
  done = false;
  age = 0;
  constructor(public life: number) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  abstract draw(ctx: Ctx): void;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** huge cone of dragon fire + roar arcs */
export class DragonBreathFlash extends Timed {
  constructor(public x: number, public y: number, life = 0.2) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('255,120,30'), 0, -40, 460 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('255,240,190'), 0, -16, 170 * s, s);
    for (let i = 0; i < 11; i++) {
      const k = i - 5;
      const a = -Math.PI / 2 + k * 0.18 + rand(-0.02, 0.02);
      const len = (i === 5 ? 230 : 170 - Math.abs(k) * 20 + rand(-10, 10)) * (0.7 + 0.3 * s);
      flame(ctx, a, len, (i === 5 ? 52 : 34) * s, '255,255,235', '255,170,50', '255,60,10', s);
    }
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const tk = clamp01(t * 1.3 - k * 0.15);
      if (tk <= 0 || tk >= 1) continue;
      ctx.strokeStyle = `rgba(255,200,100,${0.8 * (1 - tk)})`;
      ctx.lineWidth = 5 - k;
      ctx.beginPath();
      ctx.arc(0, -4, 30 + tk * 130, -Math.PI / 2 - 0.9, -Math.PI / 2 + 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** a roaring flame-dragon head that rises out of the impact and fades */
export class DragonSpirit extends Timed {
  constructor(public x: number, public y: number, life = 0.6) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const rise = easeOutCubic(Math.min(1, t * 1.6)) * 80;
    const s = 1.2 + 1.2 * easeOutCubic(Math.min(1, t * 2));
    const a = t < 0.15 ? t / 0.15 : 1 - Math.pow((t - 0.15) / 0.85, 1.6);
    drawDragonFlame(ctx, this.x, this.y - rise, this.age * 0.6 + 1, s, a * 0.95);
  }
}

/** perspective shock rings (ellipses) */
export class GravityPulse extends Timed {
  constructor(public x: number, public y: number, life = 0.5, public size = 1, public rgb = '120,210,255') {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(this.rgb), this.x, this.y, 170 * this.size * (1 - t), 0.8 * (1 - t));
    for (let k = 0; k < 3; k++) {
      const tk = clamp01(t * 1.4 - k * 0.16);
      if (tk <= 0 || tk >= 1) continue;
      const e = easeOutCubic(tk);
      const rx = (14 + 120 * e) * this.size;
      const a = (1 - tk) * (1 - k * 0.18);
      ctx.strokeStyle = `rgba(${this.rgb},${0.9 * a})`;
      ctx.lineWidth = (5 - k * 1.3) * (1 - tk * 0.5);
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, rx, rx * 0.38, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** expanding honeycomb hexagons */
export class HexBurst extends Timed {
  constructor(public x: number, public y: number, life = 0.4, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,50'), this.x, this.y, 180 * this.size * (1 - t * 0.5), 0.7 * (1 - t));
    for (let k = 0; k < 3; k++) {
      const tk = clamp01(t * 1.3 - k * 0.14);
      if (tk <= 0 || tk >= 1) continue;
      const e = easeOutCubic(tk);
      ctx.save();
      ctx.translate(this.x, this.y);
      hexPath(ctx, (12 + 74 * e) * this.size, this.age * (k % 2 ? 1.4 : -1.4));
      ctx.strokeStyle = `rgba(${k === 1 ? '255,255,220' : '255,200,60'},${0.9 * (1 - tk)})`;
      ctx.lineWidth = 3.4 - k;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}

/** pink/white swirling spiral arms */
export class SpiralFX extends Timed {
  constructor(public x: number, public y: number, public rgb: string, life = 0.5, public arms = 3, public maxR = 70, public dir = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 1.4));
    const a = 1 - Math.pow(t, 1.6);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    drawSprite(ctx, glowSprite(this.rgb), this.x, this.y, this.maxR * 2.4 * (0.5 + e * 0.5), 0.5 * a);
    for (let k = 0; k < this.arms; k++) {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 22; i++) {
        const u = i / 22;
        const ang = (k * TAU) / this.arms + this.dir * (u * 3.4 + this.age * 7);
        const rr = this.maxR * e * u;
        pts.push([this.x + Math.cos(ang) * rr, this.y + Math.sin(ang) * rr * 0.8]);
      }
      for (const [w, col] of [
        [5, `rgba(${this.rgb},${0.3 * a})`],
        [1.8, `rgba(255,255,255,${0.85 * a})`],
      ] as [number, string][]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.beginPath();
        pts.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

/** multicolour radial starburst flash (fireworks) */
export class RadialFlash extends Timed {
  lens: number[] = [];
  constructor(public x: number, public y: number, public cols: string[], life = 0.18, public len = 120, n = 18) {
    super(life);
    for (let i = 0; i < n; i++) this.lens.push(rand(0.55, 1));
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75;
    const n = this.lens.length;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite(this.cols[0]), 0, 0, this.len * 3 * s, 0.7 * s);
    drawSprite(ctx, glowSprite('255,255,245'), 0, 0, this.len * 1.1 * s, s);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const L = this.len * this.lens[i] * (0.5 + 0.5 * s) * (i % 2 ? 0.7 : 1);
      ctx.save();
      ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, `rgba(255,255,255,${s})`);
      g.addColorStop(0.35, `rgba(${this.cols[i % this.cols.length]},${0.85 * s})`);
      g.addColorStop(1, `rgba(${this.cols[i % this.cols.length]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -3.4 * s);
      ctx.lineTo(L, 0);
      ctx.lineTo(0, 3.4 * s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    drawSprite(ctx, starSprite(this.cols[1 % this.cols.length]), 0, 0, this.len * 1.3 * s, s, t);
    ctx.restore();
  }
}

/** golden rotating magic circle (keris) */
export class Mandala extends Timed {
  constructor(public x: number, public y: number, life = 0.5, public size = 1, public flat = 0.5, public dir = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 1.5));
    const a = 1 - Math.pow(t, 1.5);
    const R = (24 + 70 * e) * this.size;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    ctx.scale(1, this.flat);
    drawSprite(ctx, glowSprite('255,200,80'), 0, 0, R * 2.6, 0.5 * a);
    ctx.rotate(this.age * 2.4 * this.dir);
    ctx.strokeStyle = `rgba(255,224,130,${0.95 * a})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([R * 0.14, R * 0.08]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.8, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(255,245,200,${0.85 * a})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const rr = i % 2 ? R * 0.38 : R * 0.72;
      const an = (i * Math.PI) / 8;
      if (i === 0) ctx.moveTo(Math.cos(an) * rr, Math.sin(an) * rr);
      else ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = `rgba(255,250,220,${0.95 * a})`;
    for (let i = 0; i < 8; i++) {
      const an = (i * TAU) / 8;
      ctx.beginPath();
      ctx.arc(Math.cos(an) * R, Math.sin(an) * R, 2.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}
