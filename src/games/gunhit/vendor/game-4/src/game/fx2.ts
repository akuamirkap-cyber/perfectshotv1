import { type Ctx, TAU, clamp, drawSprite, easeOutBack, easeOutCubic, glowSprite, rand, starSprite } from './core';
import { type FX, flame, spike } from './particles';

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

/** icy muzzle burst for the snowball cannon */
export class FrostFlash extends Timed {
  rot = rand(0, TAU);
  constructor(public x: number, public y: number, life = 0.15) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('110,195,255'), 0, -16, 230 * s, 0.85 * s);
    drawSprite(ctx, glowSprite('235,250,255'), 0, -8, 90 * s, s);
    for (let i = 0; i < 13; i++) {
      const k = i - 6;
      const a = -Math.PI / 2 + k * 0.19;
      const len = (i % 2 ? 44 : 84) * (0.55 + 0.45 * Math.cos(k * 0.2)) * (0.6 + 0.4 * s);
      spike(ctx, a, len, (i % 2 ? 4 : 7) * s, '170,225,255', s);
    }
    drawSprite(ctx, starSprite('200,240,255'), 0, -10, 100 * s, s, this.rot);
    ctx.restore();
  }
}

/** AWP muzzle-brake blast: forward spike, side jets, anamorphic streak */
export class SniperFlash extends Timed {
  constructor(public x: number, public y: number, life = 0.13) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.22 ? 1 : 1 - (t - 0.22) / 0.78;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('255,190,100'), 0, -10, 240 * s, 0.7 * s);
    drawSprite(ctx, glowSprite('255,245,215'), 0, -6, 96 * s, s);
    spike(ctx, -Math.PI / 2, 140 * s, 8 * s, '255,235,170', s);
    spike(ctx, -Math.PI / 2 + 0.16, 70 * s, 4 * s, '255,225,150', s);
    spike(ctx, -Math.PI / 2 - 0.16, 70 * s, 4 * s, '255,225,150', s);
    spike(ctx, 0.12, 100 * s, 11 * s, '255,220,140', s);
    spike(ctx, Math.PI - 0.12, 100 * s, 11 * s, '255,220,140', s);
    spike(ctx, 0.5, 44 * s, 5 * s, '255,210,130', s * 0.8);
    spike(ctx, Math.PI - 0.5, 44 * s, 5 * s, '255,210,130', s * 0.8);
    const sg = ctx.createLinearGradient(-190, 0, 190, 0);
    sg.addColorStop(0, 'rgba(255,220,150,0)');
    sg.addColorStop(0.5, `rgba(255,248,225,${0.85 * s})`);
    sg.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(-190, -1.6 * s - 0.4, 380, 3.2 * s + 0.8);
    ctx.strokeStyle = `rgba(255,240,200,${0.8 * (1 - t)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -6, 18 + 70 * t, 0, TAU);
    ctx.stroke();
    drawSprite(ctx, starSprite('255,240,200'), 0, -6, 120 * s, s, Math.PI / 4);
    ctx.restore();
  }
}

/** supersonic vapor trail with expanding shock rings + tracer core */
export class Contrail extends Timed {
  constructor(public x: number, public y0: number, public y1: number, life = 0.9) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const len = this.y0 - this.y1;
    if (len < 4) return;
    const fade = Math.pow(1 - t, 1.5);
    ctx.save();
    const n = 16;
    const Lp: number[] = [];
    const Rp: number[] = [];
    for (let i = 0; i <= n; i++) {
      const s = i / n;
      const yy = this.y0 - s * len;
      const w = (2.2 + 15 * Math.pow(t, 0.65)) * (0.55 + 0.45 * (1 - s));
      const xo = Math.sin(i * 0.9 + this.age * 5) * 3.2 * t;
      Lp.push(this.x + xo - w, yy);
      Rp.push(this.x + xo + w, yy);
    }
    ctx.beginPath();
    ctx.moveTo(Lp[0], Lp[1]);
    for (let i = 2; i < Lp.length; i += 2) ctx.lineTo(Lp[i], Lp[i + 1]);
    for (let i = Rp.length - 2; i >= 0; i -= 2) ctx.lineTo(Rp[i], Rp[i + 1]);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, this.y0, 0, this.y1);
    g.addColorStop(0, `rgba(240,248,255,${0.42 * fade})`);
    g.addColorStop(1, `rgba(220,236,255,${0.14 * fade})`);
    ctx.fillStyle = g;
    ctx.fill();
    const rings = 7;
    for (let k = 0; k < rings; k++) {
      const yk = this.y0 - ((k + 0.5) / rings) * len;
      const tk = clamp((this.age - k * 0.01) / (this.life * 0.75), 0, 1);
      if (tk <= 0 || tk >= 1) continue;
      const e = easeOutCubic(tk);
      ctx.strokeStyle = `rgba(236,246,255,${0.55 * Math.pow(1 - tk, 1.4)})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(this.x, yk, 3 + 30 * e, 0.8 + 4.5 * e, 0, 0, TAU);
      ctx.stroke();
    }
    const c = clamp(1 - this.age / 0.16, 0, 1);
    if (c > 0) {
      ctx.globalCompositeOperation = 'lighter';
      const tg = ctx.createLinearGradient(0, this.y0, 0, this.y1);
      tg.addColorStop(0, `rgba(255,250,225,${0.5 * c})`);
      tg.addColorStop(1, `rgba(255,255,255,${0.95 * c})`);
      ctx.strokeStyle = tg;
      ctx.lineWidth = 2.6 * c + 0.4;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y0);
      ctx.lineTo(this.x, this.y1);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,200,110,${0.25 * c})`;
      ctx.lineWidth = 9 * c;
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** meriam karbit blast: huge cone of flame, side blasts and a shock ellipse */
export class BambooBlast extends Timed {
  constructor(public x: number, public y: number, life = 0.17) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('255,140,40'), 0, -30, 440 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('255,240,190'), 0, -14, 170 * s, s);
    for (let i = 0; i < 9; i++) {
      const k = i - 4;
      const a = -Math.PI / 2 + k * 0.2 + rand(-0.03, 0.03);
      const len = (i === 4 ? 200 : 150 - Math.abs(k) * 18 + rand(-12, 12)) * (0.7 + 0.3 * s);
      flame(ctx, a, len, (i === 4 ? 48 : 32) * s, '255,255,235', '255,190,60', '255,70,10', s);
    }
    flame(ctx, Math.PI - 0.2, 80 * s, 26 * s, '255,250,220', '255,180,60', '255,70,0', s);
    flame(ctx, 0.2, 80 * s, 26 * s, '255,250,220', '255,180,60', '255,70,0', s);
    ctx.fillStyle = `rgba(255,255,240,${s})`;
    ctx.beginPath();
    ctx.arc(0, -6, 20 * s, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,220,160,${0.75 * (1 - t)})`;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, -4, 30 + 150 * t, 8 + 34 * t, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
}

/** cartoon "POW" star for the banana gun */
export class BananaPop extends Timed {
  rot = rand(-0.4, 0.4);
  radii: number[] = [];
  constructor(public x: number, public y: number, public size = 1, life = 0.2) {
    super(life);
    for (let i = 0; i < 20; i++) this.radii.push(i % 2 ? 22 + rand(-3, 3) : 46 + rand(-6, 8));
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const sc = (t < 0.35 ? easeOutBack(t / 0.35) : 1) * this.size;
    const a = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.scale(sc, sc);
    ctx.globalAlpha = a;
    ctx.beginPath();
    for (let i = 0; i < 20; i++) {
      const an = (i / 20) * TAU;
      const r = this.radii[i];
      if (i === 0) ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r);
      else ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r);
    }
    ctx.closePath();
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 48);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, '#fff59a');
    g.addColorStop(0.75, '#ffd21f');
    g.addColorStop(1, '#ffa800');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ff8a00';
    ctx.lineWidth = 3.2;
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,220,90'), this.x, this.y, 150 * sc, 0.6 * a);
    ctx.restore();
  }
}
