import { drawSpiritMote } from '@/games/shared/spiritArt';
import { type Ctx, TAU, clamp, drawSprite, easeOutBack, easeOutCubic, glowSprite, rand, starSprite } from './core';
import { type FX, Lightning, spike } from './particles';
import { type PaintCol, RAINBOW, crescentPath, drawGhost, drawSplat } from './shapes5';

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

/** rotating rune circle with a configurable colour (moonbeam / wand) */
export class RuneCircle extends Timed {
  constructor(public x: number, public y: number, public rgb: string, public rgb2: string, life = 0.5, public size = 1, public flat = 0.5, public dir = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 1.5));
    const a = 1 - Math.pow(t, 1.5);
    const R = (22 + 70 * e) * this.size;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    ctx.scale(1, this.flat);
    drawSprite(ctx, glowSprite(this.rgb), 0, 0, R * 2.6, 0.5 * a);
    ctx.rotate(this.age * 2.2 * this.dir);
    ctx.strokeStyle = `rgba(${this.rgb},${0.95 * a})`;
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
    ctx.strokeStyle = `rgba(${this.rgb2},${0.85 * a})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 ? R * 0.34 : R * 0.7;
      const an = -Math.PI / 2 + (i * Math.PI) / 5;
      if (i === 0) ctx.moveTo(Math.cos(an) * rr, Math.sin(an) * rr);
      else ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr);
    }
    ctx.closePath();
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const an = (i * TAU) / 8;
      ctx.save();
      ctx.translate(Math.cos(an) * R, Math.sin(an) * R);
      ctx.rotate(an + Math.PI / 2);
      ctx.fillStyle = `rgba(${this.rgb2},${0.9 * a})`;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(2.6, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-2.6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

/** comic "POW" star with text */
export class ComicPop extends Timed {
  rot = rand(-0.22, 0.22);
  radii: number[] = [];
  constructor(
    public x: number,
    public y: number,
    public text: string,
    public c0 = '#fff6a0',
    public c1 = '#ff7a1a',
    public edge = '#7a1a00',
    public size = 1,
    life = 0.55,
  ) {
    super(life);
    for (let i = 0; i < 18; i++) this.radii.push(i % 2 ? 26 + rand(-2, 3) : 52 + rand(-5, 8));
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const sc = (t < 0.25 ? easeOutBack(t / 0.25) : 1) * this.size * (1 + 0.04 * Math.sin(this.age * 30));
    const a = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(sc, sc);
    ctx.globalAlpha = a;
    ctx.beginPath();
    for (let i = 0; i < 18; i++) {
      const an = (i / 18) * TAU;
      const r = this.radii[i];
      if (i === 0) ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r);
      else ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 54);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, this.c0);
    g.addColorStop(1, this.c1);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.edge;
    ctx.lineWidth = 3.4;
    ctx.stroke();
    ctx.font = '26px "Lilita One", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 5;
    ctx.strokeStyle = this.edge;
    ctx.strokeText(this.text, 0, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.text, 0, 2);
    ctx.restore();
  }
}

/** a lightning bolt crashing down from the sky onto (x, y1) */
export class StormStrike extends Timed {
  bolts: Lightning[] = [];
  constructor(public x: number, public y0: number, public y1: number, life = 0.45) {
    super(life);
    this.bolts.push(new Lightning(x + rand(-14, 14), y0, x, y1, life, '150,210,255', 3.4, 5, 0.035));
    this.bolts.push(new Lightning(x + rand(-30, 30), y0, x + rand(-6, 6), y1, life * 0.8, '210,238,255', 2.2, 3, 0.03));
    this.bolts.push(new Lightning(x + rand(-44, 44), y0 + 40, x + rand(-10, 10), y1, life * 0.6, '120,180,255', 1.6, 2, 0.03));
  }
  update(dt: number) {
    super.update(dt);
    for (const b of this.bolts) b.update(dt);
  }
  draw(ctx: Ctx) {
    const t = 1 - this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const w = 16 + 36 * t;
    const g = ctx.createLinearGradient(this.x - w, 0, this.x + w, 0);
    g.addColorStop(0, 'rgba(120,190,255,0)');
    g.addColorStop(0.5, `rgba(200,232,255,${0.4 * t})`);
    g.addColorStop(1, 'rgba(120,190,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - w, this.y0, w * 2, this.y1 - this.y0);
    drawSprite(ctx, glowSprite('150,210,255'), this.x, this.y1, 190 * t + 40, 0.9 * t);
    drawSprite(ctx, glowSprite('255,255,255'), this.x, this.y1, 70 * t + 14, t);
    ctx.restore();
    for (const b of this.bolts) if (!b.done) b.draw(ctx);
  }
}

/** shark jaws snapping shut over a point */
export class ChompFX extends Timed {
  constructor(public x: number, public y: number, life = 0.6) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const close = easeOutCubic(clamp(t / 0.2, 0, 1));
    const off = 4 + (1 - close) * 36;
    const fade = t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45;
    ctx.save();
    ctx.globalAlpha = fade;
    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.translate(this.x, this.y + dir * off);
      ctx.scale(1, dir);
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#7a1230';
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0.12, Math.PI - 0.12);
      ctx.stroke();
      ctx.strokeStyle = '#e8708c';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,220,230,0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0.5, 1.4);
      ctx.stroke();
      for (let i = 0; i < 9; i++) {
        const an = 0.28 + ((Math.PI - 0.56) * i) / 8;
        const bx = Math.cos(an) * 28;
        const by = Math.sin(an) * 28;
        const ax = Math.cos(an) * 19;
        const ay = Math.sin(an) * 19;
        const tx = -Math.sin(an) * 2.8;
        const ty = Math.cos(an) * 2.8;
        ctx.beginPath();
        ctx.moveTo(bx - tx, by - ty);
        ctx.lineTo(bx + tx, by + ty);
        ctx.lineTo(ax, ay);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#a4b2c6';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
    if (t > 0.17 && t < 0.4) {
      const k = 1 - (t - 0.17) / 0.23;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,255,255'), this.x, this.y, 70 * k, k);
      drawSprite(ctx, starSprite('220,245,255'), this.x, this.y, 90 * k, k, 0.5);
      ctx.restore();
    }
  }
}

/** green tractor-beam cone with rising rings */
export class TractorPulse extends Timed {
  constructor(public x: number, public y: number, life = 0.85, public len = 110) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const a = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    const e = 0.6 + 0.4 * easeOutCubic(Math.min(1, t * 3));
    ctx.save();
    const g = ctx.createLinearGradient(0, this.y, 0, this.y - this.len);
    g.addColorStop(0, `rgba(70,235,120,${0.55 * a})`);
    g.addColorStop(1, 'rgba(70,235,120,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(this.x - 8, this.y);
    ctx.lineTo(this.x - 52 * e, this.y - this.len);
    ctx.lineTo(this.x + 52 * e, this.y - this.len);
    ctx.lineTo(this.x + 8, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 4; k++) {
      const ph = (t * 2.2 + k / 4) % 1;
      const yy = this.y - ph * this.len;
      const rx = 10 + ph * 44 * e;
      ctx.strokeStyle = `rgba(200,255,215,${(1 - ph) * 0.85 * a})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(this.x, yy, rx, rx * 0.28, 0, 0, TAU);
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('90,255,140'), this.x, this.y, (70 + 40 * a) * e, 0.7 * a);
    ctx.restore();
  }
}

/** multicolour rainbow rays */
export class RainbowBurst extends Timed {
  lens: number[] = [];
  constructor(public x: number, public y: number, life = 0.28, public size = 1, public base = -Math.PI / 2, public spread = Math.PI) {
    super(life);
    for (let i = 0; i < 14; i++) this.lens.push(rand(0.6, 1));
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('255,220,250'), 0, 0, 230 * this.size * s, 0.6 * s);
    drawSprite(ctx, glowSprite('255,255,255'), 0, 0, 80 * this.size * s, s);
    const n = this.lens.length;
    for (let i = 0; i < n; i++) {
      const a = this.base + ((i + 0.5) / n - 0.5) * 2 * this.spread;
      spike(ctx, a, 110 * this.size * this.lens[i] * (0.6 + 0.4 * s), 8 * this.size * s, RAINBOW[i % 7], s);
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - t)})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, (10 + 70 * t) * this.size, 0, TAU);
    ctx.stroke();
    drawSprite(ctx, starSprite('255,245,255'), 0, 0, 100 * this.size * s, s, t * 2);
    ctx.restore();
  }
}

export class RainbowRings extends Timed {
  constructor(public x: number, public y: number, life = 0.6, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const ti = clamp(t * 1.5 - i * 0.07, 0, 1);
      if (ti <= 0 || ti >= 1) continue;
      const e = easeOutCubic(ti);
      ctx.strokeStyle = `rgba(${RAINBOW[i]},${0.95 * (1 - ti)})`;
      ctx.lineWidth = 4.6 * (1 - ti * 0.5);
      ctx.beginPath();
      ctx.arc(this.x, this.y, (8 + 120 * e) * this.size, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** crescent waves rushing outward (∩ upward and ∪ downward) */
export class MoonSlash extends Timed {
  constructor(public x: number, public y: number, life = 0.5, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 1.3));
    const a = 1 - Math.pow(t, 1.4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const dir of [-1, 1]) {
      const R = (16 + 96 * e) * this.size;
      ctx.save();
      ctx.translate(this.x, this.y + dir * e * 12);
      ctx.scale(1, dir);
      crescentPath(ctx, R, R * 0.9, R * 0.46);
      const g = ctx.createLinearGradient(0, -R, 0, R * 0.5);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
      g.addColorStop(1, `rgba(170,150,255,${0.2 * a})`);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    }
    drawSprite(ctx, glowSprite('200,185,255'), this.x, this.y, 150 * this.size * (1 - t * 0.4), 0.55 * a);
    ctx.restore();
  }
}

/** quick paint splat flash at the impact point */
export class SplatFlash extends Timed {
  constructor(public x: number, public y: number, public col: PaintCol, life = 0.5, public size = 26, public seed = 3) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const e = easeOutCubic(Math.min(1, t * 4));
    const a = t < 0.55 ? 1 : 1 - (t - 0.55) / 0.45;
    ctx.save();
    ctx.translate(this.x, this.y);
    drawSplat(ctx, this.size * (0.3 + 0.7 * e), this.col, this.seed, a);
    ctx.restore();
  }
}

/** Flowing pale spirit ribbons for a ghost impact, not a radial splash. */
export class SpiritAura extends Timed {
  constructor(public x: number, public y: number, life = 0.9) { super(life); }
  draw(ctx: Ctx) {
    const k = Math.min(1, this.age / this.life);
    const fade = Math.sin(Math.PI * k) * (1 - 0.25 * k);
    ctx.save(); ctx.translate(this.x, this.y); ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('215,255,252'), 0, -16 - k * 10, 100 + k * 35, 0.28 * fade);
    ctx.restore();
    // Small sheet-shaped spirits rise through a soft mist, not thin ribbons.
    for (let i = 0; i < 5; i++) {
      const x = this.x + (i - 2) * 13 + Math.sin(this.age * 4 + i) * 5;
      const y = this.y - 12 - k * (38 + i * 5);
      drawSpiritMote(ctx, x, y, 11 + (i % 2) * 3, this.age * 3 + i, fade * 0.72);
    }
  }
}

/** A big translucent ghost rising out of the impact and fading. */
export class GhostSpirit extends Timed {
  constructor(public x: number, public y: number, life = 0.8) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const rise = easeOutCubic(Math.min(1, t * 1.4)) * 90;
    const s = 1.4 + 1.5 * easeOutCubic(Math.min(1, t * 1.6));
    const a = t < 0.15 ? t / 0.15 : 1 - Math.pow((t - 0.15) / 0.85, 1.5);
    ctx.save();
    ctx.translate(this.x, this.y - rise);
    drawGhost(ctx, s, this.age * 1.2, a * 0.85, 0.9);
    ctx.restore();
  }
}
