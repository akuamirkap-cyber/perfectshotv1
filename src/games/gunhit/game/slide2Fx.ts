/**
 * Slide-2 FX kitchen for slide 1.
 *
 * Everything in this file is a verbatim port of the particle / glow / ring /
 * void / jet / beam / smoke / fireball / muzzle-flash layers of the Firework
 * 8-Gun engine (`games/fireworkgun/src/game/engine.ts`), including every
 * constant: drag `d` is applied per 60 Hz step (`d ** (dt * 60)`), gravity `g`
 * is per step, `tr` is the length of the motion streak, `tw` twinkles and
 * `crackle` pops into three sparks on death. Voids also devour nearby
 * particles exactly like slide 2 (`d2 < 62500`, orbital curve 0.35) and the
 * ring/void/lens drawing code is copied line for line.
 *
 * Slide 1 weapons that also exist on slide 2 (`blackhole`, `shark`, `bamboo`,
 * `soaker`, `rainbow`, `bazooka`, `rpg`) render their shots through this kit so
 * the result is pixel-identical instead of a look-alike.
 */

import { withSplinterClip } from './fx';

export const TAU = Math.PI * 2;
export const rnd = (a: number, b: number) => a + Math.random() * (b - a);
export const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

export interface S2Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  h: number;
  s: number;
  l: number;
  g: number;
  d: number;
  tr: number;
  tw: boolean;
  crackle: boolean;
  ax: number;
  ay: number;
  pull: number;
}

export interface S2Glow {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface S2Ring {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
  impl?: boolean;
}

export interface S2Void {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface S2Jet {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  len: number;
  wid: number;
}

export interface S2Beam {
  x: number;
  y: number;
  life: number;
  max: number;
  len: number;
  wid: number;
  seed: number;
}

export interface S2Smoke {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  grow: number;
  dark: number;
  seed: number;
}

export interface S2Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  hot: number;
  seed: number;
}

export interface S2Flash {
  x: number;
  y: number;
  life: number;
  max: number;
  r: number;
  seed: number;
  style: 'bazooka' | 'rpg';
}

export interface S2Text {
  x: number;
  y: number;
  text: string;
  hue: number;
  life: number;
}

const decay = (v: number, dt: number, k = 1) => Math.max(0, v - dt * k);

export class Slide2Fx {
  particles: S2Particle[] = [];
  glows: S2Glow[] = [];
  rings: S2Ring[] = [];
  voids: S2Void[] = [];
  jets: S2Jet[] = [];
  beams: S2Beam[] = [];
  smokes: S2Smoke[] = [];
  fireballs: S2Fireball[] = [];
  flashes: S2Flash[] = [];
  texts: S2Text[] = [];
  /** Slide-2 `timers`: callbacks scheduled in seconds. */
  timers: { t: number; fn: () => void }[] = [];

  clear() {
    this.particles.length = 0;
    this.glows.length = 0;
    this.rings.length = 0;
    this.voids.length = 0;
    this.jets.length = 0;
    this.beams.length = 0;
    this.smokes.length = 0;
    this.fireballs.length = 0;
    this.flashes.length = 0;
    this.texts.length = 0;
    this.timers.length = 0;
  }

  at(t: number, fn: () => void) {
    this.timers.push({ t, fn });
  }

  /** Slide 2 `spawn()` — the exact defaults, cap included. */
  spawn(x: number, y: number, vx: number, vy: number, o: Partial<S2Particle>) {
    if (this.particles.length > 3600) return;
    const life = o.life ?? 1.2;
    this.particles.push({
      x,
      y,
      vx,
      vy,
      life,
      max: life,
      size: o.size ?? 2,
      h: o.h ?? 0,
      s: o.s ?? 100,
      l: o.l ?? 60,
      g: o.g ?? 0.05,
      d: o.d ?? 0.96,
      tr: o.tr ?? 2.5,
      tw: o.tw ?? true,
      crackle: o.crackle ?? false,
      ax: o.ax ?? 0,
      ay: o.ay ?? 0,
      pull: o.pull ?? 0,
    });
  }

  glow(x: number, y: number, hue: number, life: number, r: number) {
    this.glows.push({ x, y, hue, life, max: life, r });
  }

  ring(x: number, y: number, hue: number, life: number, r: number, impl = false) {
    this.rings.push({ x, y, hue, life, max: life, r, impl });
  }

  void(x: number, y: number, hue: number, life: number, r: number) {
    this.voids.push({ x, y, hue, life, max: life, r });
  }

  jet(x: number, y: number, hue: number, life: number, len: number, wid: number) {
    this.jets.push({ x, y, hue, life, max: life, len, wid });
  }

  beam(x: number, y: number, life: number, len: number, wid: number, seed = rnd(0, 10)) {
    this.beams.push({ x, y, life, max: life, len, wid, seed });
  }

  /** Slide 2 `spawnSmoke()`. */
  spawnSmoke(x: number, y: number, vx: number, vy: number, r: number, life: number, dark: number) {
    // Slide 2 sizes the puff, then grows it relative to its own radius.
    this.smokes.push({ x, y, vx, vy, life, max: life, r, grow: r * rnd(1.6, 2.4), dark, seed: rnd(0, 10) });
  }

  /** Slide 2 `spawnFireball()`. */
  spawnFireball(x: number, y: number, vx: number, vy: number, r: number, life: number, hot: number) {
    this.fireballs.push({ x, y, vx, vy, life, max: life, r, hot, seed: rnd(0, 10) });
  }

  /** Slide 2 `spawnMuzzle()` — the star-shaped star flash of bazooka / rpg. */
  spawnMuzzle(x: number, y: number, r: number, style: 'bazooka' | 'rpg') {
    if (this.flashes.length > 16) return;
    // Slide 2 `spawnMuzzle()`: 0.16s star flash, seeded 0..10.
    this.flashes.push({ x, y, life: 0.16, max: 0.16, r, seed: rnd(0, 10), style });
  }

  text(x: number, y: number, text: string, hue: number, life = 0.9) {
    this.texts.push({ x, y, text, hue, life });
  }

  update(dt: number) {
    const f = dt * 60;

    for (let i = this.timers.length - 1; i >= 0; i--) {
      const t = this.timers[i];
      t.t -= dt;
      if (t.t <= 0) {
        this.timers.splice(i, 1);
        t.fn();
      }
    }

    // particles — slide 2 physics, including the void gravity well
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const dr = Math.pow(p.d, f);
      p.vx *= dr;
      p.vy *= dr;
      if (p.pull > 0) {
        const pk = p.pull * f * 0.0012;
        p.vx += (p.ax - p.x) * pk;
        p.vy += (p.ay - p.y) * pk;
      }
      if (this.voids.length > 0) {
        for (const v of this.voids) {
          const dx = v.x - p.x;
          const dy = v.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 62500 && d2 > 36) {
            const d = Math.sqrt(d2);
            const s = (1 - d / 250) * (v.life / v.max) * f * 0.055;
            p.vx += (dx / d) * s;
            p.vy += (dy / d) * s;
            p.vx += (-dy / d) * s * 0.35;
            p.vy += (dx / d) * s * 0.35;
          } else if (d2 <= 36) {
            p.life = Math.min(p.life, 0.08);
          }
        }
      }
      p.vy += p.g * f;
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.life -= dt;
      if (p.life <= 0) {
        if (p.crackle) {
          for (let k = 0; k < 3; k++) {
            const a = rnd(0, TAU);
            const sp = rnd(0.8, 2.2);
            this.spawn(p.x, p.y, Math.cos(a) * sp, Math.sin(a) * sp, {
              life: rnd(0.2, 0.45),
              size: 1.3,
              h: 50,
              s: 40,
              l: 92,
              g: 0.02,
              d: 0.92,
              tr: 1,
            });
          }
        }
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.glows.length - 1; i >= 0; i--) {
      const g = this.glows[i];
      g.life -= dt;
      if (g.life <= 0) this.glows.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) this.rings.splice(i, 1);
    }
    for (let i = this.voids.length - 1; i >= 0; i--) {
      const v = this.voids[i];
      v.life -= dt;
      if (v.life <= 0) this.voids.splice(i, 1);
    }
    for (let i = this.jets.length - 1; i >= 0; i--) {
      const j = this.jets[i];
      j.life -= dt;
      if (j.life <= 0) this.jets.splice(i, 1);
    }
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.life -= dt;
      if (b.life <= 0) this.beams.splice(i, 1);
    }
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.vy += 0.04 * f;
      fb.vx *= Math.pow(0.97, f);
      fb.vy *= Math.pow(0.97, f);
      fb.x += fb.vx * f;
      fb.y += fb.vy * f;
      fb.life -= dt;
      fb.hot = Math.max(0, fb.hot - dt * 1.6);
      if (fb.life <= 0) this.fireballs.splice(i, 1);
    }
    for (let i = this.smokes.length - 1; i >= 0; i--) {
      const s = this.smokes[i];
      s.vx *= Math.pow(0.965, f);
      s.vy *= Math.pow(0.965, f);
      s.vy -= 0.02 * f;
      s.x += s.vx * f;
      s.y += s.vy * f;
      s.r += s.grow * dt;
      s.life -= dt;
      if (s.life <= 0) this.smokes.splice(i, 1);
    }
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const fl = this.flashes[i];
      fl.life -= dt;
      if (fl.life <= 0) this.flashes.splice(i, 1);
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.y -= 42 * dt;
      t.life -= dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  /** Voids sit behind the gun; every other layer paints above it. */
  drawBehind(ctx: CanvasRenderingContext2D, time: number) {
    this.drawVoids(ctx, time);
  }

  draw(ctx: CanvasRenderingContext2D, time: number) {
    // Glows, smokes, streaks and rings are splatter: on a boss stage they stay
    // on the drawing the round bit into. Jets and beams are the round in
    // flight, so they are never clipped.
    withSplinterClip(ctx, () => this.drawGlows(ctx));
    this.drawJets(ctx, time);
    this.drawBeams(ctx, time);
    withSplinterClip(ctx, () => this.drawSmokes(ctx, time));

    withSplinterClip(ctx, () => this.drawStreaks(ctx));

    this.drawFireballs(ctx, time);
    this.drawFlashes(ctx, time);

    // floating "+1" / "CHOMP!" texts
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of this.texts) {
      const k = Math.max(0, t.life / 0.9);
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.font = 'bold 20px "Lilita One", system-ui, sans-serif';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(20,4,30,0.85)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = hsl(t.hue, 95, 72);
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  // ------------------------------------------------------------- drawing
  /** Streaks and rings: everything the hit throws off. */
  private drawStreaks(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const p of this.particles) {
    const k = Math.max(0, p.life / p.max);
    let a = Math.pow(k, 0.7);
    if (p.tw && k < 0.6) a *= 0.55 + Math.random() * 0.45;
    const l = k > 0.88 ? Math.min(95, p.l + 25) : p.l - (1 - k) * 12;
    const size = p.size * (0.45 + 0.55 * k);
    ctx.strokeStyle = hsl(p.h, p.s, l, a);
    ctx.lineWidth = size * 1.6;
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * p.tr, p.y - p.vy * p.tr);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (size > 2.1 && a > 0.2) {
      ctx.fillStyle = hsl(p.h, p.s, 70, a * 0.18);
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 3.2, 0, TAU);
      ctx.fill();
    }
  }
  for (const r of this.rings) {
    const k = r.life / r.max;
    if (r.impl) {
      const rad = Math.max(2, r.r * k);
      ctx.strokeStyle = hsl(r.hue, 100, 72, 0.85 * (1 - k * 0.4));
      ctx.lineWidth = 1.5 + 3.5 * (1 - k);
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - k)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, Math.max(1, rad - 3), 0, TAU);
      ctx.stroke();
    } else {
      ctx.strokeStyle = hsl(r.hue, 100, 70, 0.7 * k);
      ctx.lineWidth = 3 * k + 0.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * (1 - k * k) + 4, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
  }

  /** The impact glows: soft additive halos around a hit. */
  private drawGlows(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const g of this.glows) {
      const k = g.life / g.max;
      const rad = g.r * (1.3 - 0.3 * k);
      const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, rad);
      gr.addColorStop(0, hsl(g.hue, 100, 60, 0.38 * k));
      gr.addColorStop(1, hsl(g.hue, 100, 50, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(g.x - rad, g.y - rad, rad * 2, rad * 2);
    }
    ctx.restore();
  }

  private drawVoids(ctx: CanvasRenderingContext2D, time: number) {
    for (const v of this.voids) {
      const k = Math.max(0, v.life / v.max);
      const p = 1 - k;
      const r = v.r * (0.25 + 0.75 * Math.min(1, p * 3.2));
      const a = k < 0.65 ? k / 0.65 : 1;
      const lh = ctx.createRadialGradient(v.x, v.y, r * 0.9, v.x, v.y, r * 1.9);
      lh.addColorStop(0, hsl(v.hue, 100, 65, 0.35 * a));
      lh.addColorStop(0.5, hsl(v.hue + 30, 100, 60, 0.12 * a));
      lh.addColorStop(1, hsl(v.hue, 100, 55, 0));
      ctx.fillStyle = lh;
      ctx.beginPath();
      ctx.arc(v.x, v.y, r * 1.9, 0, TAU);
      ctx.fill();
      const g = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, r);
      g.addColorStop(0, `rgba(0,0,4,${0.97 * a})`);
      g.addColorStop(0.72, `rgba(6,1,20,${0.94 * a})`);
      g.addColorStop(0.88, hsl(v.hue, 100, 60, 0.9 * a));
      g.addColorStop(1, hsl(v.hue, 100, 55, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(v.x, v.y, r, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.save();
      ctx.rotate(-0.35);
      ctx.scale(1, 0.42);
      ctx.strokeStyle = hsl(v.hue, 100, 58, 0.75 * a);
      ctx.lineWidth = Math.max(2, r * 0.22);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.12, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = hsl(v.hue + 45, 100, 80, 0.9 * a);
      ctx.lineWidth = Math.max(1.2, r * 0.08);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.12, Math.PI * 0.9, Math.PI * 2.0);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.65 * a})`;
      ctx.lineWidth = Math.max(1, r * 0.045);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.12, Math.PI * 1.15, Math.PI * 1.75);
      ctx.stroke();
      ctx.restore();
      ctx.rotate(time * 7);
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 1.1);
      ctx.stroke();
      ctx.strokeStyle = hsl(v.hue + 50, 100, 75, 0.85 * a);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, Math.PI, Math.PI * 2.1);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawJets(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const j of this.jets) {
      const k = Math.max(0, j.life / j.max);
      const flick = 0.85 + 0.15 * Math.sin(time * 40 + j.x);
      const wdt = j.wid * (0.4 + 0.6 * k) * flick;
      const half = (j.len * (0.35 + 0.65 * k)) / 2;
      for (const dir of [-1, 1]) {
        const y0 = j.y;
        const y1 = j.y + dir * half;
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, `rgba(255,255,255,${0.85 * k})`);
        g.addColorStop(0.25, hsl(j.hue + 40, 100, 75, 0.55 * k));
        g.addColorStop(1, hsl(j.hue, 100, 60, 0));
        ctx.fillStyle = g;
        ctx.fillRect(j.x - wdt, Math.min(y0, y1), wdt * 2, half);
        ctx.fillStyle = `rgba(255,255,255,${0.5 * k})`;
        ctx.fillRect(j.x - wdt * 0.3, Math.min(y0, y1), wdt * 0.6, half);
      }
      ctx.fillStyle = `rgba(255,255,255,${0.9 * k})`;
      ctx.beginPath();
      ctx.arc(j.x, j.y, wdt * 0.7, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBeams(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const b of this.beams) {
      const k = Math.max(0, b.life / b.max);
      const flick = 0.85 + 0.15 * Math.sin(time * 42 + b.seed * 9);
      const wdt = b.wid * (0.4 + 0.6 * k) * flick;
      const half = (b.len * (0.35 + 0.65 * k)) / 2;
      for (let i = -2; i <= 2; i++) {
        const hue = (time * 160 + b.seed * 60 + i * 42 + 360) % 360;
        const g = ctx.createLinearGradient(0, b.y - half, 0, b.y + half);
        g.addColorStop(0, hsl(hue, 100, 62, 0));
        g.addColorStop(0.5, hsl(hue, 100, 65, 0.6 * k));
        g.addColorStop(1, hsl(hue, 100, 62, 0));
        ctx.fillStyle = g;
        ctx.fillRect(b.x + i * wdt * 0.42 - wdt * 0.24, b.y - half, wdt * 0.48, half * 2);
      }
      const cg = ctx.createLinearGradient(0, b.y - half, 0, b.y + half);
      cg.addColorStop(0, 'rgba(255,255,255,0)');
      cg.addColorStop(0.5, `rgba(255,255,255,${0.85 * k})`);
      cg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = cg;
      ctx.fillRect(b.x - wdt * 0.14, b.y - half, wdt * 0.28, half * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.9 * k})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, wdt * 0.55, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSmokes(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    for (const s of this.smokes) {
      const k = Math.max(0, s.life / s.max);
      const fadeIn = Math.min(1, (1 - k) * 6 + 0.25);
      const a = Math.min(1, k * 1.6) * fadeIn;
      const wob = Math.sin(time * 3 + s.seed * 8) * s.r * 0.08;
      const g = ctx.createRadialGradient(s.x + wob, s.y, 0, s.x + wob, s.y, s.r);
      const base = 52 - s.dark * 30;
      g.addColorStop(0, `rgba(${base + 26},${base + 8},${base - 8},${0.5 * a})`);
      g.addColorStop(0.55, `rgba(${base},${base - 12},${base - 18},${0.34 * a})`);
      g.addColorStop(1, `rgba(${base - 18},${base - 24},${base - 26},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x + wob, s.y, s.r, 0, TAU);
      ctx.fill();
      if (k > 0.55) {
        const hg = ctx.createRadialGradient(s.x, s.y + s.r * 0.3, 0, s.x, s.y + s.r * 0.3, s.r * 0.75);
        hg.addColorStop(0, `rgba(255,140,50,${0.4 * (k - 0.55) * 2 * a})`);
        hg.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(s.x, s.y + s.r * 0.3, s.r * 0.75, 0, TAU);
        ctx.fill();
      }
      const tg = ctx.createRadialGradient(
        s.x - s.r * 0.3, s.y - s.r * 0.35, 0,
        s.x - s.r * 0.3, s.y - s.r * 0.35, s.r * 0.55,
      );
      tg.addColorStop(0, `rgba(200,195,185,${0.22 * a})`);
      tg.addColorStop(1, 'rgba(200,195,185,0)');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(s.x - s.r * 0.3, s.y - s.r * 0.35, s.r * 0.55, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawFireballs(ctx: CanvasRenderingContext2D, time: number) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const fb of this.fireballs) {
      const k = Math.max(0, fb.life / fb.max);
      const fl = 0.85 + 0.15 * Math.sin(time * 47 + fb.seed * 11);
      const r = fb.r * fl;
      const g = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, r);
      g.addColorStop(0, `rgba(255,240,200,${0.85 * k})`);
      g.addColorStop(0.3, `rgba(255,190,80,${0.7 * k})`);
      g.addColorStop(0.62, `rgba(255,110,30,${0.5 * k})`);
      g.addColorStop(0.85, `rgba(200,50,15,${0.28 * k})`);
      g.addColorStop(1, 'rgba(150,30,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fb.x, fb.y, r, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = fb.seed + i * 1.256 + time * (3 + i * 0.4);
        const bx = fb.x + Math.cos(a) * r * 0.72;
        const by = fb.y + Math.sin(a) * r * 0.72;
        const br = r * (0.28 + 0.12 * Math.sin(time * 9 + i * 2 + fb.seed));
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0, `rgba(255,220,140,${0.7 * k})`);
        bg.addColorStop(0.6, `rgba(255,130,40,${0.4 * k})`);
        bg.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, TAU);
        ctx.fill();
      }
      if (fb.hot > 0.3 && k > 0.35) {
        const ck = Math.min(1, k * 1.4) * fb.hot;
        const cg = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, r * 0.42);
        cg.addColorStop(0, `rgba(255,255,255,${0.95 * ck})`);
        cg.addColorStop(0.5, `rgba(255,245,215,${0.75 * ck})`);
        cg.addColorStop(1, 'rgba(255,230,170,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, r * 0.42, 0, TAU);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  private drawFlashes(ctx: CanvasRenderingContext2D, time: number) {
    void time;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const f of this.flashes) {
      const k = Math.max(0, f.life / f.max);
      const r = f.r * (0.7 + 0.3 * k);
      const spikes = f.style === 'rpg' ? 6 : 8;
      for (let i = 0; i < spikes; i++) {
        const a = f.seed + (i * TAU) / spikes;
        const len = r * (i % 2 === 0 ? 1 : 0.55);
        const g = ctx.createLinearGradient(
          f.x, f.y, f.x + Math.cos(a) * len, f.y + Math.sin(a) * len,
        );
        g.addColorStop(0, `rgba(255,255,255,${0.9 * k})`);
        g.addColorStop(0.4, f.style === 'rpg' ? `rgba(200,235,255,${0.7 * k})` : `rgba(255,225,150,${0.7 * k})`);
        g.addColorStop(1, 'rgba(255,140,40,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = (i % 2 === 0 ? 7 : 4) * k + 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + Math.cos(a) * len, f.y + Math.sin(a) * len);
        ctx.stroke();
      }
      const cg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 0.55);
      cg.addColorStop(0, `rgba(255,255,255,${0.98 * k})`);
      cg.addColorStop(0.45, f.style === 'rpg' ? `rgba(215,242,255,${0.85 * k})` : `rgba(255,240,200,${0.85 * k})`);
      cg.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r * 0.55, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** Slide 2 `drawOrb()` — verbatim port, drawn in local space around (0, 0). */
export function drawSlide2Orb(
  ctx: CanvasRenderingContext2D,
  hue: number,
  r: number,
  t: number,
  seed: number,
) {
  const halo = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 3.4);
  halo.addColorStop(0, hsl(hue, 100, 60, 0.55));
  halo.addColorStop(0.45, hsl(hue + 25, 100, 55, 0.2));
  halo.addColorStop(1, hsl(hue + 40, 100, 55, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 3.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = hsl(hue + 30, 100, 70, 0.28);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.5, 0, TAU);
  ctx.stroke();
  ctx.save();
  ctx.rotate(-0.35);
  ctx.scale(1, 0.45);
  ctx.strokeStyle = hsl(hue - 20, 95, 45, 0.55);
  ctx.lineWidth = r * 0.52;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue, 100, 62, 0.95);
  ctx.lineWidth = r * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.38, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue + 45, 100, 80, 0.95);
  ctx.lineWidth = Math.max(1.4, r * 0.14);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.38, Math.PI * 0.95, Math.PI * 1.95);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.38, Math.PI * 1.2, Math.PI * 1.7);
  ctx.stroke();
  const k1 = t * 4.5 + seed;
  ctx.fillStyle = '#fff';
  for (const a of [k1, k1 + TAU / 3, k1 + (TAU * 2) / 3]) {
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 1.38, Math.sin(a) * r * 1.38, Math.max(1.1, r * 0.15), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  const eg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  eg.addColorStop(0, '#05010f');
  eg.addColorStop(0.7, '#020108');
  eg.addColorStop(1, '#000');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  const shim = 0.75 + 0.25 * Math.sin(t * 9 + seed * 5);
  ctx.strokeStyle = hsl(hue + 60, 100, 82, 0.95 * shim + 0.05);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue + 40, 100, 75, 0.6);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue, 100, 70, 0.85);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, t * 5 + seed, t * 5 + seed + Math.PI * 1.2);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue + 70, 100, 78, 0.7);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, -t * 7 + seed * 2, -t * 7 + seed * 2 + Math.PI);
  ctx.stroke();
  for (let q = 0; q < 2; q++) {
    const sa = t * 2.6 + seed + q * Math.PI;
    ctx.fillStyle = q === 0 ? '#fff' : hsl(hue + 55, 100, 78, 0.95);
    ctx.beginPath();
    ctx.arc(Math.cos(sa) * r * 1.9, Math.sin(sa) * r * 1.9, q === 0 ? 1.7 : 1.3, 0, TAU);
    ctx.fill();
  }
}
