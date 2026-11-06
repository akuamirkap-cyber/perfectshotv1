import { type Ctx, TAU, drawSprite, glowSprite, rand, starSprite } from './core';
import { type FX, spike } from './particles';

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

/** a tiny rapid-fire muzzle flash (minigun) */
export class MiniFlash extends Timed {
  rot = rand(-0.3, 0.3);
  constructor(public x: number, public y: number, life = 0.055, public size = 1) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = (1 - t) * this.size;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawSprite(ctx, glowSprite('255,150,60'), 0, -10, 150 * s, 0.85 * s);
    drawSprite(ctx, glowSprite('255,170,70'), 0, -8, 96 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('255,240,200'), 0, -4, 38 * s, s);
    spike(ctx, -Math.PI / 2, 78 * s, 8 * s, '255,225,150', s);
    spike(ctx, -Math.PI / 2 + 0.4, 40 * s, 4.6 * s, '255,210,130', s);
    spike(ctx, -Math.PI / 2 - 0.4, 40 * s, 4.6 * s, '255,210,130', s);
    spike(ctx, 0.1, 34 * s, 4 * s, '255,200,120', s * 0.8);
    spike(ctx, Math.PI - 0.1, 34 * s, 4 * s, '255,200,120', s * 0.8);
    ctx.restore();
  }
}

/** party-popper burst: rainbow star spikes + glow */
const POP = ['255,79,135', '255,201,40', '56,182,255', '91,220,114', '176,107,255', '255,138,43'];
export class PartyPop extends Timed {
  lens: number[] = [];
  constructor(public x: number, public y: number, life = 0.18) {
    super(life);
    for (let i = 0; i < 15; i++) this.lens.push(rand(60, 120));
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.28 ? 1 : 1 - (t - 0.28) / 0.72;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('255,190,255'), 0, -14, 260 * s, 0.7 * s);
    drawSprite(ctx, glowSprite('255,250,235'), 0, -8, 100 * s, s);
    for (let i = 0; i < 15; i++) {
      const a = -Math.PI / 2 + (i - 7) * 0.2;
      spike(ctx, a, this.lens[i] * (0.65 + 0.35 * s), (i % 2 ? 6 : 9) * s, POP[i % POP.length], s);
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - t)})`;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, -8, 12 + 74 * t, 0, TAU);
    ctx.stroke();
    drawSprite(ctx, starSprite('255,240,255'), 0, -8, 110 * s, s, t * 2);
    ctx.restore();
  }
}

/** green plasma muzzle burst */
export class PlasmaFlash extends Timed {
  constructor(public x: number, public y: number, life = 0.17) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.25 ? 1 : 1 - (t - 0.25) / 0.75;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    drawSprite(ctx, glowSprite('40,255,140'), 0, -14, 250 * s, 0.85 * s);
    drawSprite(ctx, glowSprite('215,255,230'), 0, -8, 90 * s, s);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.22;
      spike(ctx, a, (i === 4 ? 100 : 62 - Math.abs(i - 4) * 6) * s, (i % 2 ? 5 : 8) * s, '120,255,180', s);
    }
    spike(ctx, 0, 54 * s, 6 * s, '120,255,180', s * 0.8);
    spike(ctx, Math.PI, 54 * s, 6 * s, '120,255,180', s * 0.8);
    ctx.strokeStyle = `rgba(190,255,215,${0.9 * (1 - t)})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, -8, 14 + 60 * t, 5 + 18 * t, 0, 0, TAU);
    ctx.stroke();
    drawSprite(ctx, starSprite('190,255,215'), 0, -8, 100 * s, s, 0.4);
    ctx.restore();
  }
}

/** concentric "squeak" sound arcs */
export class ArcWaves extends Timed {
  constructor(public x: number, public y: number, life = 0.34) {
    super(life);
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (let k = 0; k < 3; k++) {
      const tk = Math.max(0, Math.min(1, t * 1.25 - k * 0.14));
      if (tk <= 0 || tk >= 1) continue;
      const r = 16 + tk * 58 + k * 6;
      const a = (1 - tk) * (1 - k * 0.2);
      ctx.strokeStyle = `rgba(255,244,170,${0.9 * a})`;
      ctx.lineWidth = 4.4 - k * 1.1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, -Math.PI / 2 - 0.85, -Math.PI / 2 + 0.85);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
    ctx.restore();
  }
}
