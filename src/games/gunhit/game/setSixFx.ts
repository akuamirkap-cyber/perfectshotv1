import { traceBossSegment } from './bossRaycast';
/**
 * Slide-6 (`games/game-2` / Weapon Wheel Hit) runtime for slide 1.
 *
 * Slide 6 has no classes to hand over: its whole game lives inside one React
 * component, and the three beam weapons that slide 1 gains here are painted by
 * four plain functions there — `spawnMuzzle()`, `spawnImpact()`, `drawBeam()`
 * and the `'scorch'` case of `drawStuck()`. Those are ported here line for
 * line, on slide 1's own wheel, so the beam, its colours, its wobble, the
 * motes that drift up it and the scorch mark it leaves are the same pixels and
 * the same timings slide 6 shows.
 *
 * Slide 1 keeps the physics and the rules: it flies the carrier, decides when
 * the wheel is hit and scores it. Slide 6 owns everything you see.
 */
import { bolt, glow } from '../vendor/game-2/src/weapons';
import { sixWeapon, type SixId } from './setSixArt';
import { withSplinterClip } from './fx';

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/**
 * The Martian Heat-Ray's own green.
 *
 * Slide 6 authored its tripod as `col: '90,255,120'` — a mint green. The gun the
 * player actually sees is the zip's `MartianHeatray` SVG, whose head, orb and
 * bead tail are lime (`#8dff3b`, `#b6ff5a`, highlights `#c4ff6a`). Its shot is
 * tinted with the artwork's own greens so the beam reads as coming out of *that*
 * gun; the beam's shape, width and timing stay slide 6's.
 */
const LIME = '141,255,59';
const LIME_LIGHT = '182,255,90';
const LIME_HOT = '214,255,138';
const LIME_CORE = '244,255,224';

/** What slide 1 does for slide 6 (the parts slide 6 needs from its game). */
export interface SixHooks {
  /** Camera/wheel shake, in slide-6 units (0..16). */
  shake(amount: number): void;
  /** Slide-1 wheel geometry, refreshed every frame. */
  wheel(): { x: number; y: number; R: number; angle: number };
}

const NO_HOOKS: SixHooks = {
  shake: () => {},
  wheel: () => ({ x: 0, y: 0, R: 0, angle: 0 }),
};

/** One of slide-6's particles (its `P`, with the same defaults `add()` fills). */
export interface SixPart {
  t: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  col: string;
  g?: number;
  drag?: number;
  rot?: number;
  vr?: number;
  a1?: number;
  add?: boolean;
}

/** A beam slide 6 paints from the muzzle to the wheel (`life`/`max` seconds). */
export interface SixBeam {
  life: number;
  max: number;
  seed: number;
}

/** A scorch mark slide 6 leaves on the wheel face (its `'scorch'` stuck art). */
export interface SixMark {
  a: number;
  col: string;
  born: number;
  seed: number;
}

/**
 * Slide 6's trigger-to-beam delay: its `fire()` pushes the beam and resolves
 * the hit in the same call, so the beam and the hole always appear together.
 * Slide 1 still has to fly a carrier across the field, so the carrier gets an
 * instant-beam speed: nothing is drawn at its position (the beam is the shot),
 * it only exists to reach the wheel before the beam fades.
 */
export const SIX_BEAM_SPEED = 9500;

export class SetSixFx {
  /* ── slide-6 game geometry (mirrored from slide 1 every frame) ─────────── */
  cx = 210;
  cy = 0;
  wheelR = 0;
  rotation = 0;
  time = 0;
  W = 420;
  H = 760;

  /* ── slide-6's live world ─────────────────────────────────────────────── */
  parts: SixPart[] = [];
  beams: SixBeam[] = [];
  /** Scorch marks riding the wheel face. */
  marks: SixMark[] = [];

  weaponId: SixId = 'sniper';
  /** Slide-6 muzzle in slide-1 screen space (set before every shot). */
  gunX = 210;
  gunY = 575;
  /** True while the gun is armed: slide 6's sniper keeps its sight lit. */
  sight = false;
  shotsFired = 0;

  private hooks: SixHooks;

  constructor(hooks: SixHooks = NO_HOOKS) {
    this.hooks = hooks;
  }

  setHooks(hooks: SixHooks) {
    this.hooks = hooks;
  }

  /** Mirror slide 1's wheel into slide 6's coordinates. */
  syncWheel() {
    const w = this.hooks.wheel();
    this.cx = w.x;
    this.cy = w.y;
    this.wheelR = w.R;
    this.rotation = w.angle;
  }

  /** Start a weapon: a different gun starts from a clean layer. */
  selectWeapon(id: SixId) {
    if (this.weaponId !== id) {
      this.parts.length = 0;
      this.beams.length = 0;
      this.marks.length = 0;
      this.shotsFired = 0;
    }
    this.weaponId = id;
  }

  /** Slide-6's `add()`: push a particle with its default fields filled in. */
  private add(p: Partial<SixPart> & { t: string; x: number; y: number }) {
    this.parts.push({
      vx: 0, vy: 0, life: 1, size: 3, col: '255,255,255',
      ...p, max: p.life ?? 1,
    } as SixPart);
  }

  /* ── slide-6's fire recipes ───────────────────────────────────────────── */

  /** Slide 6's `spawnMuzzle()` for the three beam weapons it carries. */
  private spawnMuzzle(x: number, y: number) {
    const w = sixWeapon(this.weaponId);
    if (w.flash === 'sniper') {
      this.add({ t: 'flash', x, y, life: 0.1, size: 44, col: '255,80,90', rot: 0, add: true });
      this.add({ t: 'ring', x, y, life: 0.35, size: 50, col: w.col, add: true });
      this.add({ t: 'ring', x, y: y - 20, life: 0.3, size: 30, col: w.col, add: true });
      for (let i = 0; i < 6; i++) {
        this.add({ t: 'smoke', x, y, vx: rnd(-60, 60), vy: rnd(-40, 10), life: 0.8, size: 8, col: '255,170,170', drag: 0.93 });
      }
    } else if (w.flash === 'tripod') {
      this.add({ t: 'glow', x, y, life: 0.4, size: 90, col: LIME, add: true });
      this.add({ t: 'ring', x, y, life: 0.4, size: 50, col: LIME_LIGHT, add: true });
    } else {
      // 'iron'
      this.add({ t: 'glow', x, y, life: 0.3, size: 90, col: w.col, add: true });
      this.add({ t: 'ring', x, y, life: 0.35, size: 55, col: w.col, add: true });
      this.add({ t: 'ring', x, y, life: 0.25, size: 30, col: '255,255,255', add: true });
    }
  }

  /**
   * Slide-6's `spawnImpact()` for the three beams. The wheel chips are the same
   * wooden splinters slide 1's own wheel throws.
   */
  private spawnImpact(x: number, y: number) {
    const w = sixWeapon(this.weaponId);
    const fan = (n: number, col: string, smin: number, smax: number, life = 0.35, size = 1.6) => {
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + rnd(-1.3, 1.3);
        const sp = rnd(smin, smax);
        this.add({ t: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 500, life: rnd(life * 0.5, life), size, col, add: true, drag: 0.94 });
      }
    };
    const chips = (n: number, pow = 1) => {
      for (let i = 0; i < n; i++) {
        const a = Math.PI / 2 + rnd(-1.1, 1.1);
        const sp = rnd(120, 420) * pow;
        this.add({
          t: 'chip', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 1100,
          life: rnd(0.5, 1), size: rnd(2, 5), rot: rnd(0, TAU), vr: rnd(-20, 20),
          col: Math.random() < 0.5 ? '#c98a4a' : '#7a4318',
        });
      }
    };
    switch (w.beam) {
      case 'sniper':
        chips(16, 1.2);
        this.add({ t: 'glow', x, y, life: 0.35, size: 100, col: w.col, add: true });
        this.add({ t: 'ring', x, y, life: 0.3, size: 45, col: '255,200,200', add: true });
        fan(26, '255,160,90', 250, 800, 0.5, 1.6);
        for (let i = 0; i < 4; i++) {
          this.add({ t: 'smoke', x, y, vx: rnd(-40, 40), vy: rnd(-10, 50), life: 1, size: 8, col: '90,70,70', drag: 0.95 });
        }
        break;
      case 'tripod':
        chips(18, 1.2);
        this.add({ t: 'glow', x, y, life: 0.5, size: 160, col: LIME, add: true });
        this.add({ t: 'ring', x, y, life: 0.45, size: 80, col: LIME_LIGHT, add: true });
        for (let i = 0; i < 30; i++) {
          const a = rnd(0, TAU), sp = rnd(60, 300);
          this.add({ t: 'fire', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, life: rnd(0.3, 0.7), size: rnd(8, 18), col: 'g', drag: 0.92, add: true });
        }
        for (let i = 0; i < 6; i++) {
          this.add({ t: 'smoke', x, y, vx: rnd(-40, 40), vy: rnd(-60, 0), life: 1.4, size: 14, col: '40,50,40', drag: 0.95 });
        }
        break;
      default:
        // 'iron'
        chips(14, 1.2);
        this.add({ t: 'glow', x, y, life: 0.35, size: 140, col: w.col, add: true });
        for (let i = 0; i < 3; i++) {
          this.add({ t: 'ring', x, y, life: 0.3 + i * 0.1, size: 50 + i * 28, col: i ? w.col : '255,255,255', add: true });
        }
        fan(22, '200,240,255', 250, 700, 0.4, 1.5);
        break;
    }
  }

  /** Slide-6's trigger: its muzzle burst and its beam. */
  fire(x: number, y: number) {
    const w = sixWeapon(this.weaponId);
    this.gunX = x;
    this.gunY = y;
    this.shotsFired++;
    this.spawnMuzzle(x, y);
    // Slide 6's own beam lifetimes: proton 0.55 (not ported), tripod 0.45,
    // sniper 0.32, everything else (the repulsor) 0.28.
    const dur = w.beam === 'tripod' ? 0.45 : w.beam === 'sniper' ? 0.32 : 0.28;
    this.beams.push({ life: dur, max: dur, seed: Math.random() * 100 });
  }

  /** Slide-6's impact: the burst, the shake and the scorch it leaves behind. */
  impact(hx: number, hy: number, local: number) {
    const w = sixWeapon(this.weaponId);
    this.spawnImpact(hx, hy);
    this.marks.push({ a: local, col: w.col, born: this.time, seed: Math.random() });
    // Slide 6 shakes by 7 for a beam (4 for a round). It has no slow motion and
    // no screen flash here — slide 1 already flashes its own wheel.
    this.hooks.shake(w.kind === 'beam' ? 7 : 4);
  }

  /** A shot stopped by an occupied spot still bursts, exactly like slide 6's. */
  block(hx: number, hy: number) {
    this.add({ t: 'flash', x: hx, y: hy, life: 0.12, size: 50, col: '255,255,255', rot: 0, add: true });
    this.add({ t: 'ring', x: hx, y: hy, life: 0.4, size: 70, col: '255,80,80', add: true });
    for (let i = 0; i < 30; i++) {
      const an = rnd(0, TAU);
      this.add({ t: 'spark', x: hx, y: hy, vx: Math.cos(an) * rnd(200, 600), vy: Math.sin(an) * rnd(200, 600), life: 0.5, size: 2, col: '255,255,200', add: true, drag: 0.93 });
    }
    this.hooks.shake(14);
  }

  /** True while slide 6 still has something to draw or animate. */
  get busy(): boolean {
    return this.parts.length > 0 || this.beams.length > 0 || this.marks.length > 0;
  }

  clear() {
    this.parts.length = 0;
    this.beams.length = 0;
    this.marks.length = 0;
  }

  /** One frame of slide-6 time: beams fade, particles fall, marks age. */
  update(dt: number) {
    this.time += dt;
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.parts.splice(i, 1);
        continue;
      }
      if (p.drag) {
        const d = Math.pow(p.drag, dt * 60);
        p.vx *= d;
        p.vy *= d;
      }
      if (p.g) p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.vr) p.rot = (p.rot ?? 0) + p.vr * dt;
    }
    if (this.parts.length > 700) this.parts.splice(0, this.parts.length - 700);
  }

  /* ── slide-6's renderers ──────────────────────────────────────────────── */

  /**
   * Slide-6's `drawBeam()`: the beam runs from the muzzle to the bottom of the
   * wheel and fades over its own lifetime (`k` is that fade, 1 → 0). The tripod
   * drops green fire along the beam and the sniper leaves glowing motes on it,
   * exactly as slide 6 does while it draws.
   */
  drawBeam(c: CanvasRenderingContext2D) {
    const w = sixWeapon(this.weaponId);
    const x1 = this.gunX, y1 = this.gunY;
    // A beam follows its own path, not a radial point on an irregular head.
    // If that path misses the silhouette, it continues offscreen.
    const ink = (this.hooks.wheel() as { ink?: (x: number, y: number) => boolean }).ink;
    const hit = ink ? traceBossSegment(x1, y1, x1, -80, ink) : null;
    const x2 = ink ? x1 : this.cx;
    const y2 = ink ? hit?.y ?? -80 : this.cy + this.wheelR - 4;
    // Slide 6's sniper keeps a laser sight lit the whole time it is armed.
    if (this.sight && w.id === 'sniper') {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = `rgba(255,40,60,${0.12 + 0.08 * Math.sin(this.time * 6)})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.stroke();
      glow(c, x2, y2, 8, '255,40,60', 0.8);
      c.restore();
    }
    if (!this.beams.length) return;
    for (const b of this.beams) {
      const k = b.life / b.max;
      c.save();
      c.globalCompositeOperation = 'lighter';
      const line = (wd: number, col: string, wob = 0, freq = 0.08, ph = 0) => {
        c.beginPath();
        const n = 30;
        for (let i = 0; i <= n; i++) {
          const yy = y1 + (y2 - y1) * (i / n);
          const env = Math.sin((i / n) * Math.PI);
          const xx = x1 + (x2 - x1) * (i / n) + Math.sin(yy * freq + this.time * 40 + ph) * wob * env;
          if (i) c.lineTo(xx, yy);
          else c.moveTo(xx, yy);
        }
        c.strokeStyle = col;
        c.lineWidth = wd;
        c.lineCap = 'round';
        c.stroke();
      };
      switch (w.beam) {
        case 'sniper':
          line(22 * k, `rgba(255,30,60,${0.18 * k})`);
          line(8 * k, `rgba(255,50,80,${0.6 * k})`);
          line(2.5, `rgba(255,235,235,${k})`);
          for (let i = 0; i < 6; i++) {
            const yy = y1 + (y2 - y1) * ((this.time * 3 + i / 6) % 1);
            glow(c, x1, yy, 10, '255,60,80', 0.5 * k);
          }
          break;
        case 'tripod':
          line(40 * k, `rgba(${LIME},${0.14 * k})`, 4, 0.04);
          line(16 * k, `rgba(${LIME_LIGHT},${0.5 * k})`, 3, 0.05);
          line(5, `rgba(${LIME_CORE},${k})`, 2, 0.07);
          for (let i = 0; i < 2; i++) {
            const yy = rnd(y2, y1);
            this.add({ t: 'fire', x: x1 + rnd(-6, 6), y: yy, vx: rnd(-40, 40), vy: rnd(-40, 10), life: 0.3, size: rnd(5, 10), col: 'g', add: true, drag: 0.9 });
          }
          glow(c, x2, y2, 60, LIME, 0.7 * k);
          break;
        default:
          // 'iron'
          line(44 * k, `rgba(120,200,255,${0.15 * k})`);
          line(20 * k, `rgba(160,225,255,${0.55 * k})`);
          line(8 * k, `rgba(255,255,255,${k})`);
          {
            const ph = (1 - k) * 4;
            for (let i = 0; i < 4; i++) {
              const u = (i / 4 + ph) % 1;
              const yy = y1 + (y2 - y1) * u;
              c.strokeStyle = `rgba(200,240,255,${0.6 * k})`;
              c.lineWidth = 2;
              c.beginPath();
              c.ellipse(x1, yy, 16 * k + 4, 5, 0, 0, TAU);
              c.stroke();
            }
          }
          break;
      }
      c.restore();
    }
  }

  /** Slide-6's `drawPart()`: every particle it can spawn. */
  draw(c: CanvasRenderingContext2D) {
    // Splinters stay on the drawing they bit into (the boss' own outline).
    withSplinterClip(c, () => this.drawParts(c));
  }

  /** The burst itself: every spark, ember and plume of slide 6. */
  private drawParts(c: CanvasRenderingContext2D) {
    for (const p of this.parts) {
      const k = Math.max(0, p.life / p.max);
      c.save();
      if (p.add) c.globalCompositeOperation = 'lighter';
      switch (p.t) {
        case 'spark':
          c.strokeStyle = `rgba(${p.col},${k})`;
          c.lineWidth = p.size;
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
          c.stroke();
          break;
        case 'glow':
          glow(c, p.x, p.y, p.size * (0.6 + 0.4 * k), p.col, k);
          break;
        case 'ring':
          c.strokeStyle = `rgba(${p.col},${k * 0.9})`;
          c.lineWidth = 3 * k + 0.5;
          c.beginPath();
          c.arc(p.x, p.y, p.size * (1 - k * 0.8), 0, TAU);
          c.stroke();
          break;
        case 'flash': {
          c.translate(p.x, p.y);
          c.rotate(p.rot ?? 0);
          glow(c, 0, 0, p.size * 1.3, p.col, k);
          c.fillStyle = `rgba(255,250,230,${k})`;
          c.beginPath();
          const n = 6;
          for (let i = 0; i < n * 2; i++) {
            const a = (i / (n * 2)) * TAU;
            const r = i % 2 ? p.size * 0.18 : p.size * (i % 4 === 0 ? 1.1 : 0.6);
            if (i) c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
            else c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          c.fill();
          c.fillStyle = `rgba(${p.col},${k * 0.8})`;
          c.beginPath();
          c.ellipse(0, -p.size * 0.5, p.size * 0.25, p.size * 0.9, 0, 0, TAU);
          c.fill();
          break;
        }
        case 'smoke':
          c.fillStyle = `rgba(${p.col},${k * 0.25})`;
          c.beginPath();
          c.arc(p.x, p.y, p.size * (2 - k), 0, TAU);
          c.fill();
          break;
        case 'fire': {
          const sz = p.size * (0.4 + k * 0.8);
          const col = p.col === 'g'
            ? (k > 0.6 ? LIME_CORE : k > 0.3 ? LIME_LIGHT : '26,122,18')
            : (k > 0.7 ? '255,240,180' : k > 0.4 ? '255,150,40' : '220,50,10');
          glow(c, p.x, p.y, sz * 1.3, col, k * 0.8);
          glow(c, p.x, p.y, sz * 0.55, p.col === 'g' ? LIME_HOT : '255,220,120', k * 0.9);
          const ang = Math.atan2(p.vy, p.vx);
          c.save();
          c.translate(p.x, p.y);
          c.rotate(ang + Math.PI / 2);
          c.fillStyle = `rgba(255,240,200,${k * 0.9})`;
          c.beginPath();
          c.ellipse(0, 0, sz * 0.35, sz * 0.6, 0, 0, TAU);
          c.fill();
          c.restore();
          break;
        }
        case 'ember':
          c.fillStyle = `rgba(${p.col},${k})`;
          c.beginPath();
          c.arc(p.x, p.y, p.size, 0, TAU);
          c.fill();
          glow(c, p.x, p.y, p.size * 4, p.col, k * 0.5);
          break;
        case 'bolt':
          bolt(c, p.x, p.y, p.x + p.vx, p.y + p.vy, p.col, p.size, 5, 6);
          break;
        case 'chip':
          c.translate(p.x, p.y);
          c.rotate(p.rot ?? 0);
          c.globalAlpha = Math.min(1, k * 2);
          c.fillStyle = p.col;
          c.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
          break;
      }
      c.restore();
    }
  }

  /**
   * The scorch marks, drawn from the wheel centre and carried by its spin.
   *
   * Slide 6 paints them with the same code as its stuck rounds: a dark burn
   * with a glowing core that cools to a faint ember but never disappears.
   */
  drawWheel(c: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rot: number) {
    if (!this.marks.length) return;
    const sc = radius / 92; // slide 6's wheel is 92 px; slide 1's varies
    c.save();
    c.translate(cx, cy);
    c.rotate(rot);
    for (const m of this.marks) {
      c.save();
      c.rotate(m.a);
      c.translate(radius, 0);
      c.scale(sc, sc);
      const age = this.time - m.born;
      const g = c.createRadialGradient(-5, 0, 0, -5, 0, 18);
      g.addColorStop(0, 'rgba(15,6,3,0.95)');
      g.addColorStop(1, 'rgba(15,6,3,0)');
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(-5, 0, 18, 10, 0, 0, TAU);
      c.fill();
      c.globalCompositeOperation = 'lighter';
      const e = Math.max(0.2, 1 - age * 0.5);
      glow(c, -4, 0, 14, m.col, e);
      c.fillStyle = `rgba(255,240,200,${e * 0.9})`;
      c.beginPath();
      c.ellipse(-3, 0, 5, 3, 0, 0, TAU);
      c.fill();
      c.globalCompositeOperation = 'source-over';
      c.restore();
    }
    c.restore();
  }
}

/**
 * A still of the slide-6 beam at `age` seconds after the trigger, used by the
 * picker's effect card so "Slide 6" shows the real slide-6 beam — slide 6's
 * own `drawBeam()` on the same geometry the card uses for slide 9.
 */
export function drawSetSixShotShell(
  c: CanvasRenderingContext2D,
  id: SixId,
  age: number,
) {
  const fx = new SetSixFx();
  fx.weaponId = id;
  // The card is 152 × 88 with the muzzle at its bottom: slide 6's beam is
  // painted between that muzzle and a wheel rim that fits in the same frame, so
  // the card shows the whole shot instead of just a flash.
  fx.cx = 0;
  fx.cy = -60;
  fx.wheelR = 26;
  fx.gunX = 0;
  fx.gunY = 40;
  fx.fire(0, 40);
  // Let the muzzle burst bloom to the age the card freezes, then hold the beam
  // at exactly `age` seconds into its own fade.
  fx.update(age * 0.8);
  fx.time = age;
  for (const b of fx.beams) b.life = Math.max(0.02, b.max - age);
  fx.drawBeam(c);
  // The scorch slide 6 burns into the wheel, where the beam lands.
  fx.marks.push({ a: Math.PI / 2, col: id === 'tripod' ? LIME : sixWeapon(id).col, born: 0, seed: 1 });
  fx.drawWheel(c, fx.cx, fx.cy, fx.wheelR, 0);
  fx.draw(c);
}
