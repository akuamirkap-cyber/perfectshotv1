import { type Ctx, TAU, clamp, drawSprite, easeOutCubic, glowSprite, lerp, rand } from './core';
import type { FX } from './particles';
import { drawSnowflake } from './shapes2';

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

/** radial ice spikes + snowflakes blooming from a point */
export class FrostBloom extends Timed {
  spikes: { a: number; l: number; w: number }[] = [];
  constructor(public x: number, public y: number, life = 0.75, public size = 1) {
    super(life);
    for (let i = 0; i < 18; i++) this.spikes.push({ a: (i / 18) * TAU + rand(-0.1, 0.1), l: (i % 2 ? rand(30, 52) : rand(58, 92)), w: rand(3, 6.5) });
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 2.4));
    const a = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('120,215,255'), 0, 0, 240 * this.size * (0.5 + 0.5 * e), 0.7 * a);
    drawSprite(ctx, glowSprite('235,252,255'), 0, 0, 90 * this.size * (1 - t * 0.5), 0.9 * a);
    for (const sp of this.spikes) {
      const L = sp.l * e * this.size;
      ctx.save();
      ctx.rotate(sp.a);
      const g = ctx.createLinearGradient(0, 0, L, 0);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`);
      g.addColorStop(0.5, `rgba(150,225,255,${0.8 * a})`);
      g.addColorStop(1, 'rgba(110,200,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -sp.w * 0.5);
      ctx.lineTo(L, 0);
      ctx.lineTo(0, sp.w * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = `rgba(200,240,255,${0.85 * a})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, (10 + 100 * e) * this.size, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = `rgba(235,250,255,${0.9 * a})`;
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) {
      ctx.save();
      ctx.rotate(this.age * (k % 2 ? 1 : -1) + k * 2);
      ctx.translate((16 + k * 26) * this.size, 0);
      ctx.globalAlpha = a;
      drawSnowflake(ctx, (9 - k * 1.6) * this.size);
      ctx.restore();
    }
    ctx.restore();
  }
}

/** dipole-like magnetic field loops (red north / blue south) */
export class FieldLines extends Timed {
  constructor(public x: number, public y: number, life = 0.8, public size = 1, public vertical = false) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 2));
    const a = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    if (this.vertical) ctx.rotate(Math.PI / 2);
    ctx.lineCap = 'round';
    drawSprite(ctx, glowSprite('255,80,80'), -26 * this.size, 0, 70 * this.size * a, 0.65 * a);
    drawSprite(ctx, glowSprite('100,150,255'), 26 * this.size, 0, 70 * this.size * a, 0.65 * a);
    for (let k = 1; k <= 5; k++) {
      const g = ctx.createLinearGradient(-60 * this.size, 0, 60 * this.size, 0);
      g.addColorStop(0, `rgba(255,90,90,${0.9 * a})`);
      g.addColorStop(0.5, `rgba(255,255,255,${0.7 * a})`);
      g.addColorStop(1, `rgba(110,150,255,${0.9 * a})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 2.6 - k * 0.32;
      ctx.setLineDash([7, 6]);
      ctx.lineDashOffset = -this.age * 70 * (k % 2 ? 1 : -1);
      const rx = (12 + k * 15) * this.size * e;
      const ry = (6 + k * 16) * this.size * e;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, dir < 0 ? Math.PI : 0, dir < 0 ? TAU : Math.PI);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    ctx.restore();
  }
}

/** rings contracting inward (dir < 0) or expanding outward (dir > 0) with direction ticks */
export class ConvergeRings extends Timed {
  constructor(public x: number, public y: number, public rgb: string, public dir: number, life = 0.65, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const R0 = 14 * this.size;
    const R1 = 118 * this.size;
    drawSprite(ctx, glowSprite(this.rgb), this.x, this.y, 150 * this.size * (this.dir < 0 ? 1 - t * 0.6 : 0.5 + t * 0.7), 0.5 * (1 - t));
    for (let i = 0; i < 4; i++) {
      const ti = clamp(t * 1.3 - i * 0.11, 0, 1);
      if (ti <= 0 || ti >= 1) continue;
      const e = easeOutCubic(ti);
      const r = this.dir < 0 ? lerp(R1, R0, e) : lerp(R0, R1, e);
      const a = this.dir < 0 ? Math.sin(ti * Math.PI) : 1 - ti;
      ctx.strokeStyle = `rgba(${this.rgb},${0.95 * a})`;
      ctx.lineWidth = 4 * (1 - ti * 0.4);
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * a})`;
      ctx.lineWidth = 1.4;
      for (let k = 0; k < 10; k++) {
        const an = (k / 10) * TAU + ti * 1.4;
        const c = Math.cos(an);
        const s = Math.sin(an);
        const d = 7 * this.size * (this.dir < 0 ? -1 : 1);
        ctx.beginPath();
        ctx.moveTo(this.x + c * r, this.y + s * r);
        ctx.lineTo(this.x + c * (r + d), this.y + s * (r + d));
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
