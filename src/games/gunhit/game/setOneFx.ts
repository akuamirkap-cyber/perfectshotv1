/**
 * SET 1 effects of slide 7 (`Weapon Hit 71 Senjata`, `games/game-4`) on slide 1.
 *
 * Everything here is the real slide-7 machinery, imported instead of retyped:
 *   · `particles.ts` — `Particles` (60 Hz gravity / drag / target-pull),
 *     `K`, and the FX classes (`MuzzleFlash`, `Light`, `Lightning`, `Rays`,
 *     `Streak`, `SplashSheet`, `GlowLines`, `GlowSpot`),
 *   · `spawn.ts` — `stars`, `smoke`, `ring`, `sparks`, `embers`, `droplets`,
 *     `chips`, `splinters`, `glow` with slide-7's own signatures,
 *   · `art.ts` — `drawGoldBullet`, `drawStone`, `drawDart`, `drawSingularity`,
 *     `drawCasing`, `drawShell`, `drawWad`, `makeCracks`, `strokeLines`,
 *   · `projectiles.ts` draw/trail numbers, copied verbatim below.
 *
 * `SetOneFx` is only a container plus the per-shot artwork: the fire recipes
 * live in `setOneWeapons.ts`, the projectiles stay slide 1's own objects (so
 * collision, scoring, ammo and stages are untouched).
 */
import {
  GlowLines,
  GlowSpot,
  K,
  Light,
  Lightning,
  MuzzleFlash,
  Particles,
  Rays,
  SplashSheet,
  Streak,
  type FX,
  type Particle,
} from '../vendor/game-4/src/game/particles';
import {
  drawCasing,
  drawDart,
  drawGoldBullet,
  drawShell,
  drawSingularity,
  drawStone,
  drawWad,
  makeCracks,
  strokeLines,
} from '../vendor/game-4/src/game/art';
import { TAU, drawSprite, glowSprite, lerp, makeBolt, rand, randomPoly } from '../vendor/game-4/src/game/core';
import type { SetOneId } from './setOneArt';
import { withSplinterClip } from './fx';

export const SET_ONE_PURPLES = ['200,140,255', '255,180,255', '150,100,255', '230,200,255'] as const;

/** Slide-7 `GOLDEN_SCALE` / `SHOTGUN_SCALE` drive the casing offsets. */
export const GOLDEN_SCALE = 0.92;
export const SHOTGUN_SCALE = 0.86;

/** Per-shot state slide 7 keeps inside its projectile objects. */
export interface SetOneShot {
  id: SetOneId;
  /** Slide 7 `age`. */
  age: number;
  /** Spawn Y — the golden bullet fades its tail out over 160 px. */
  startY: number;
  /** Water jet tail top (slide 7 `tailY`). */
  tailY: number;
  /** Water jet muzzle Y (slide 7 `muzzleY`). */
  muzzleY: number;
  /** Stone spin. */
  rot: number;
  /** Stone silhouette, generated once per shot. */
  shape: number[];
  /** Shotgun pellets. */
  pellets: { x: number; y: number; vx: number; vy: number; px: number; py: number }[];
  /** Slide-7 hue band for the black-hole round. */
  hue: number;
}

/**
 * Slide-7 side effects that only the game can perform. Slide 1 owns the wheel,
 * the shake budget and the screen tint, so those are injected.
 */
export interface SetOneHooks {
  shake(amount: number): void;
  hitStop(seconds: number): void;
  flash(rgb: string, strength: number): void;
  /** Paint into the target's own canvas (slide-7 `g.paint`). */
  paintWheel(draw: (c: CanvasRenderingContext2D) => void): void;
  /** FX that live in wheel space (`g.addWheelFX`). */
  addWheelFx(fx: FX): void;
  wheel(): { x: number; y: number; R: number };
}

export const NO_HOOKS: SetOneHooks = {
  shake: () => {},
  hitStop: () => {},
  flash: () => {},
  paintWheel: () => {},
  addWheelFx: () => {},
  wheel: () => ({ x: 0, y: 0, R: 0 }),
};

export class SetOneFx {
  particles = new Particles();
  fx: FX[] = [];
  /** Slide-7 `after()` timers, in seconds. */
  timers: { t: number; fn: () => void }[] = [];
  /** Wheel-space FX (drawn from the target's centre). */
  wheelFx: FX[] = [];

  add(f: FX) {
    this.fx.push(f);
    return f;
  }

  addWheel(f: FX) {
    this.wheelFx.push(f);
    return f;
  }

  at(t: number, fn: () => void) {
    this.timers.push({ t, fn });
  }

  get busy(): boolean {
    return this.particles.list.length > 0 || this.fx.length > 0 || this.timers.length > 0
      || this.wheelFx.length > 0;
  }

  clear() {
    this.particles.clear();
    this.fx.length = 0;
    this.timers.length = 0;
    this.wheelFx.length = 0;
  }

  update(dt: number) {
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const t = this.timers[i];
      t.t -= dt;
      if (t.t <= 0) {
        this.timers.splice(i, 1);
        t.fn();
      }
    }
    this.particles.update(dt);
    for (const f of this.fx) f.update(dt);
    this.fx = this.fx.filter((f) => !f.done);
    for (const f of this.wheelFx) f.update(dt);
    this.wheelFx = this.wheelFx.filter((f) => !f.done);
  }

  /** Slide-7 draws back particles, then the additive ones, then the FX list. */
  draw(ctx: CanvasRenderingContext2D) {
    withSplinterClip(ctx, () => this.particles.draw(ctx, false));
  }

  drawFront(ctx: CanvasRenderingContext2D) {
    withSplinterClip(ctx, () => this.particles.draw(ctx, true));
    for (const f of this.fx) f.draw(ctx);
  }

  /** Wheel-space FX: translate to the target centre, then draw. */
  drawWheel(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    if (!this.wheelFx.length) return;
    ctx.save();
    ctx.translate(cx, cy);
    for (const f of this.wheelFx) f.draw(ctx);
    ctx.restore();
  }

  // ─────────────────────────────── shots ───────────────────────────────
  newShot(id: SetOneId, x: number, y: number): SetOneShot {
    const shot: SetOneShot = {
      id,
      age: 0,
      startY: y,
      tailY: y,
      muzzleY: y,
      rot: 0,
      shape: randomPoly(9, 8.2, 0.28),
      pellets: [],
      hue: 215 + rand(0, 105),
    };
    if (id === 'shotgun') {
      const n = 9;
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (i - (n - 1) / 2) * 0.0155 + rand(-0.008, 0.008);
        shot.pellets.push({
          x: x + rand(-1.5, 1.5),
          y,
          vx: Math.cos(ang) * 2400,
          vy: Math.sin(ang) * 2400,
          px: x,
          py: y,
        });
      }
    }
    return shot;
  }

  // ───────────────────────────── flight trails ─────────────────────────────
  /** One frame of the slide-7 trail (verbatim from `projectiles.ts`). */
  trail(shot: SetOneShot, x: number, y: number, dt: number) {
    const ps = this.particles;
    shot.age += dt;
    switch (shot.id) {
      case 'golden': {
        ps.add({ k: K.STAR, add: true, x: x + rand(-3, 3), y: y + rand(4, 26), vx: rand(-40, 40), vy: rand(-10, 50), size: rand(7, 14), life: rand(0.35, 0.7), color: '255,215,120', drag: 2.5 });
        const a = shot.age * 70;
        ps.add({ k: K.EMBER, add: true, x: x + Math.cos(a) * 5, y: y + 12, vx: Math.cos(a) * 40, vy: 25, size: 1.5, life: 0.4, color: '255,200,90', drag: 3 });
        break;
      }
      case 'blackhole': {
        for (let i = 0; i < 2; i++) {
          const a = rand(0, TAU);
          const d = rand(40, 76);
          ps.add({ k: K.SPARK, add: true, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, target: { x, y }, pull: 2000, size: rand(0.9, 2), len: 0.03, life: 0.7, color: pickPurple() });
        }
        if (Math.random() < 0.7)
          ps.add({ k: K.SMOKE, x: x + rand(-6, 6), y: y + 14, vx: rand(-15, 15), vy: rand(10, 40), size: 18, size2: 50, life: 0.8, color: '55,18,105', alpha: 0.6, rot: rand(0, TAU), vrot: rand(-1, 1) });
        if (Math.random() < 0.6)
          ps.add({ k: K.EMBER, add: true, x: x + rand(-12, 12), y: y + rand(8, 22), vx: rand(-30, 30), vy: rand(20, 70), size: 1.8, life: 0.55, color: '190,120,255' });
        break;
      }
      case 'ketapel': {
        shot.rot += dt * 17;
        if (Math.random() < 0.5)
          ps.add({ k: K.SMOKE, x: x + rand(-3, 3), y: y + 12, vx: rand(-12, 12), vy: rand(10, 30), size: 6, size2: 18, life: 0.45, color: '205,185,155', alpha: 0.32 });
        break;
      }
      case 'sumpit': {
        if (Math.random() < 0.35)
          ps.add({ k: K.EMBER, add: true, x: x + rand(-1, 1), y: y + 4, vx: rand(-15, 15), vy: rand(10, 40), size: 1.2, life: 0.4, color: '150,255,120' });
        break;
      }
      case 'shotgun': {
        for (const p of shot.pellets) {
          p.px = p.x;
          p.py = p.y;
          p.x += rand(-0.4, 0.4);
          p.y -= 2400 * dt;
        }
        break;
      }
      case 'soaker': {
        if (shot.age > 0.075) {
          shot.tailY -= 1300 * dt;
          for (let i = 0; i < 2; i++)
            ps.add({ k: K.DROP, x: x + rand(-3, 3), y: shot.tailY + rand(0, 10), vx: rand(-30, 30), vy: -1300 * rand(0.5, 0.78), g: 750, size: rand(1.1, 2.3), life: 0.55, color: '150,210,255' });
        }
        if (Math.random() < 0.5)
          ps.add({ k: K.SMOKE, x: x + rand(-4, 4), y: y + rand(10, 40), vx: rand(-15, 15), vy: rand(-10, 20), size: 6, size2: 20, life: 0.5, color: '225,240,255', alpha: 0.2 });
        break;
      }
    }
  }

  // ───────────────────────── projectile artwork ─────────────────────────
  /** Slide-7 projectile art, drawn with the shot's centre at (x, y). */
  drawShot(ctx: CanvasRenderingContext2D, shot: SetOneShot, x: number, y: number) {
    switch (shot.id) {
      case 'golden': {
        const tail = Math.min(160, shot.startY - y);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(0, y, 0, y + tail);
        gr.addColorStop(0, 'rgba(255,250,220,0.95)');
        gr.addColorStop(0.2, 'rgba(255,205,80,0.6)');
        gr.addColorStop(1, 'rgba(255,150,30,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.moveTo(x - 3.6, y + 4);
        ctx.lineTo(x + 3.6, y + 4);
        ctx.lineTo(x + 0.6, y + tail);
        ctx.lineTo(x - 0.6, y + tail);
        ctx.closePath();
        ctx.fill();
        drawSprite(ctx, glowSprite('255,190,70'), x, y, 54, 0.8);
        drawSprite(ctx, glowSprite('255,255,230'), x, y - 2, 20, 0.9);
        ctx.restore();
        ctx.save();
        ctx.translate(x, y);
        drawGoldBullet(ctx, 15, 6);
        ctx.restore();
        break;
      }
      case 'blackhole': {
        drawSingularity(ctx, x, y, 13, shot.age * 1.7, 1.15);
        if (Math.random() < 0.6) {
          const a = rand(0, TAU);
          const L = rand(22, 38);
          const pts = makeBolt(x + Math.cos(a) * 13 * 0.7, y + Math.sin(a) * 13 * 0.7, x + Math.cos(a) * L, y + Math.sin(a) * L, 0.4, 4);
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
        break;
      }
      case 'ketapel': {
        ctx.strokeStyle = 'rgba(255,255,255,0.32)';
        ctx.lineWidth = 1;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(x + s * 8, y + 6);
          ctx.lineTo(x + s * 5, y + 44);
          ctx.stroke();
        }
        for (let i = 3; i >= 1; i--) {
          ctx.globalAlpha = (0.16 * (4 - i)) / 3;
          ctx.save();
          ctx.translate(x, y + i * 9);
          ctx.rotate(shot.rot - i * 0.3);
          drawStone(ctx, shot.shape, 8.2);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(shot.rot);
        drawStone(ctx, shot.shape, 8.2);
        ctx.restore();
        break;
      }
      case 'sumpit': {
        const wob = Math.sin(shot.age * 45) * 0.035;
        const gr = ctx.createLinearGradient(0, y + 36, 0, y + 120);
        gr.addColorStop(0, 'rgba(255,255,255,0.45)');
        gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gr;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y + 36);
        ctx.lineTo(x, y + 120);
        ctx.stroke();
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(wob);
        drawDart(ctx);
        ctx.restore();
        break;
      }
      case 'shotgun': {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (const p of shot.pellets) {
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
        break;
      }
      case 'soaker': {
        // The stream hangs from the shot tip back to the muzzle (slide 7 tailY).
        const y0 = y;
        const y1 = Math.min(shot.tailY, shot.muzzleY);
        const len = y1 - y0;
        if (len < 2) break;
        const n = Math.max(4, Math.floor(len / 6));
        const left: number[] = [];
        const right: number[] = [];
        for (let i = 0; i <= n; i++) {
          const s = i / n;
          const yy = y0 + s * len;
          const wd = lerp(5.6, 2.3, s) * (1 + 0.18 * Math.sin(s * 18 - shot.age * 50));
          const xo = Math.sin(s * 7 + shot.age * 30) * 1.1 * s;
          left.push(x + xo - wd, yy);
          right.push(x + xo + wd, yy);
        }
        ctx.beginPath();
        ctx.moveTo(left[0], left[1]);
        for (let i = 2; i < left.length; i += 2) ctx.lineTo(left[i], left[i + 1]);
        for (let i = right.length - 2; i >= 0; i -= 2) ctx.lineTo(right[i], right[i + 1]);
        ctx.closePath();
        const gr = ctx.createLinearGradient(x - 6, 0, x + 6, 0);
        gr.addColorStop(0, 'rgba(60,150,255,0.55)');
        gr.addColorStop(0.35, 'rgba(215,247,255,0.92)');
        gr.addColorStop(0.6, 'rgba(120,200,255,0.75)');
        gr.addColorStop(1, 'rgba(40,120,230,0.6)');
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 1;
        ctx.moveTo(x - 2, y0 + 4);
        ctx.lineTo(x - 1.2, y0 + len * 0.75);
        ctx.stroke();
        const hg = ctx.createRadialGradient(x - 1.5, y0 + 1, 0.5, x, y0 + 3, 6.5);
        hg.addColorStop(0, 'rgba(255,255,255,0.98)');
        hg.addColorStop(0.45, 'rgba(160,220,255,0.85)');
        hg.addColorStop(1, 'rgba(40,120,230,0.7)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(x, y0 + 3, 6.3, 0, TAU);
        ctx.fill();
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('120,200,255'), x, y0 + 4, 34, 0.35);
        ctx.restore();
        break;
      }
    }
  }

  /** Slide-7 `paint()` helpers reused by the black-hole and golden hits. */
  static cracks(theta: number, R: number, n: number, len: [number, number], spread?: number) {
    return makeCracks(theta, R, n, len, spread);
  }

  static stroke(c: CanvasRenderingContext2D, lines: number[][], style: string, width: number, ox = 0, oy = 0) {
    strokeLines(c, lines, style, width, ox, oy);
  }

  static glowLines(lines: number[][], color: string, width: number, life: number) {
    return new GlowLines(lines, color, width, life);
  }

  static glowSpot(x: number, y: number, size: number, color: string, life: number, intensity = 1) {
    return new GlowSpot(x, y, size, color, life, intensity);
  }

  static muzzle(x: number, y: number, kind: 'gold' | 'shotgun', life: number) {
    return new MuzzleFlash(x, y, kind, life);
  }

  static light(x: number, y: number, r: number, color: string, intensity: number, life: number) {
    return new Light(x, y, r, color, intensity, life);
  }

  static lightning(x1: number, y1: number, x2: number, y2: number, life: number, color: string, width: number, branches: number, regen?: number) {
    return new Lightning(x1, y1, x2, y2, life, color, width, branches, regen);
  }

  static splash(x: number, y: number, ang: number, size: number, life: number) {
    return new SplashSheet(x, y, ang, size, life);
  }

  static streak(x: number, y1: number, y2: number, w: number, color: string, life: number) {
    return new Streak(x, y1, y2, w, color, life);
  }

  static rays(x: number, y: number, color: string, life: number, n: number, base: number, spread: number) {
    return new Rays(x, y, color, life, n, base, spread);
  }
}

/**
 * A still of the slide-7 round at `age` seconds after it left the muzzle, used
 * by the picker's effect card so "Baru" shows the real SET 1 projectile.
 */
export function drawSetOneShotShell(
  c: CanvasRenderingContext2D,
  id: SetOneId,
  age: number,
  travel = 0,
) {
  const fx = new SetOneFx();
  const shot = fx.newShot(id, 0, 0);
  shot.age = age;
  shot.rot = age * 6;
  // The stream hangs from the round back to the muzzle at the origin.
  shot.tailY = 0;
  shot.muzzleY = 0;
  shot.startY = 0;
  shot.shape = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  if (id === 'shotgun') {
    for (const p of shot.pellets) {
      p.x += p.vx * age * 0.35;
      p.y += p.vy * age * 0.35;
      p.px = p.x;
      p.py = p.y;
    }
  }
  if (id === 'ketapel') shot.rot = age * 17;
  fx.drawShot(c, shot, 0, -travel);
}

/** Slide-7's `PURPLES` array picker. */
export const pickPurple = () => SET_ONE_PURPLES[Math.floor(Math.random() * SET_ONE_PURPLES.length)];

export const drawCasingArt = drawCasing;
export const drawShellArt = drawShell;
export const drawWadArt = drawWad;
export type { Particle, FX };
