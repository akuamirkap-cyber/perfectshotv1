import { withSplinterClip } from './fx';
import { Slide2Fx, TAU, rnd, hsl } from './slide2Fx';
import { slide2Sfx } from './slide2Audio';
import {
  SET_TWO_IDS, type TwoWeapon,
  drawOrb, drawShark, drawStone, drawDrop, drawRainbowBolt,
  drawBazookaShell, drawRpgGrenade, drawRocketShape,
} from './setTwoArt';

/**
 * Slide 2 (`games/fireworkgun`) FX, ported verbatim.
 *
 * Each of the eight slide-2 weapons owns a muzzle recipe (`fire`), its own
 * round art (`drawRound`) with its in-flight trail (`trail`) and a wheel impact
 * (`stick`) that fans into one of slide 2's burst recipes (`burst`,
 * `voidBurst`, `splashBurst`, `stoneBurst`, `rainbowBurst`, `warheadBurst`).
 * The shared particle/glow/ring/void/jet/beam/smoke/fireball kit is already
 * ported in `Slide2Fx`; this class adds the layers slide 1 did not need until
 * now (bubbles, impact cracks, shrapnel/clod debris) plus the per-weapon shots.
 */
export type BurstType =
  | 'peony' | 'ring' | 'star' | 'heart' | 'spiral' | 'crackle' | 'rainbow' | 'willow';

const IMPACT_TYPES: BurstType[] = ['peony', 'ring', 'star', 'heart', 'spiral', 'crackle', 'rainbow'];

/** Slide 2's sky-show burst wardrobe. */
const SKY_TYPES: BurstType[] = ['peony', 'ring', 'star', 'heart', 'spiral', 'crackle', 'rainbow', 'willow'];

/** Slide 2 canvas width (the sky show is laid out in slide-2 pixels). */
const W = 420;

/** Slide 2 round length, used by its trail offsets. */
const PL = 46;
/** Slide 2 wheel radius; only the ported `drawDebris` wedge branch reads it. */
const R = 100;

/** The little water bubbles repeat the same three layers at many sizes. */
interface BubbleSprite { canvas: HTMLCanvasElement; half: number }
const BUBBLE_SPRITE_SCALE = 2;
const bubbleSprites = new Map<number, BubbleSprite>();

function bubbleSprite(ctx: CanvasRenderingContext2D, radius: number): BubbleSprite | null {
  // Eighth-pixel radius steps are subpixel at phone size and bound the cache.
  if (!Number.isFinite(radius) || radius <= 0 || radius > 16
    || typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement)) return null;
  const key = Math.max(1, Math.round(radius * 8));
  const cached = bubbleSprites.get(key);
  if (cached) return cached;
  try {
    const canvas = document.createElement('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    const r = key / 8;
    const half = Math.ceil((r + 1.5) * BUBBLE_SPRITE_SCALE) / BUBBLE_SPRITE_SCALE;
    canvas.width = Math.ceil(half * 2 * BUBBLE_SPRITE_SCALE);
    canvas.height = canvas.width;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(BUBBLE_SPRITE_SCALE, BUBBLE_SPRITE_SCALE);
    ctx.translate(half, half);
    ctx.strokeStyle = 'rgba(180,230,255,1)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(220,245,255,0.35)';
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.beginPath(); ctx.arc(-r * 0.32, -r * 0.32, Math.max(0.6, r * 0.22), 0, TAU); ctx.fill();
    const sprite = { canvas, half };
    bubbleSprites.set(key, sprite);
    return sprite;
  } catch { return null; /* Non-browser contexts keep the vector rendering. */ }
}

/** Slide 2 `BubbleFx`. */
export interface TwoBubble { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number }

/** Slide 2 `Debris` (the wheel-wedge kind is slide 1's own). */
export interface TwoDebris {
  kind: 'rocket' | 'shard' | 'clod';
  x: number; y: number; vx: number; vy: number;
  rot: number; vr: number; hue: number; a0: number; life: number; hot?: number;
}

/** Slide 2 `BiteMark`, anchored to the point that actually got hit. */
export interface TwoBite { x: number; y: number; kind: TwoWeapon; life: number; max: number }

/** Slide 2 `SkyRocket` — the ambient firework show above the wheel. */
export interface TwoSkyRocket {
  x: number; y: number; vx: number; vy: number;
  hue: number; type: BurstType; scale: number;
}

/** One slide-2 round in flight. */
export interface TwoRound {
  hue: number; seed: number; age: number; open: number;
  /** Fractional world-time trail ticks and previous position; purely cosmetic. */
  trailCarry?: number; trailX?: number; trailY?: number;
}

/**
 * Slide 2 authored its trail at 60 Hz. Advance motion/age each update, but
 * emit only the same number of particles per world second at any refresh rate.
 * Cap catch-up after a suspended tab and spread low-refresh emissions along the
 * travelled segment; neither the carrier nor its collision is changed.
 */
export function advanceTwoRoundTrail(
  fx: Pick<SetTwoFx, 'trail'>, id: TwoWeapon, x: number, y: number, round: TwoRound, dt: number,
) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  const previousAge = round.age;
  const endAge = previousAge + dt;
  const previousX = round.trailX ?? x;
  const previousY = round.trailY ?? y;
  const carry = (round.trailCarry ?? 0) + Math.min(dt, 0.1) * 60;
  const ticks = Math.min(6, Math.floor(carry + 1e-8));
  round.trailCarry = Math.max(0, carry - ticks);
  round.trailX = x; round.trailY = y;
  for (let i = 1; i <= ticks; i++) {
    const f = i / ticks;
    round.age = previousAge + dt * f;
    fx.trail(id, previousX + (x - previousX) * f, previousY + (y - previousY) * f, round);
  }
  round.age = endAge;
}

/** The two things only the live game can do. */
export interface TwoHost {
  shake(amount: number): void;
  emit(): void;
}

const NO_HOST: TwoHost = { shake: () => {}, emit: () => {} };

export function restTwoRound(hue = 28, seed = Math.random() * 10): TwoRound {
  return { hue, seed, age: 0, open: 0 };
}

export class SetTwoFx extends Slide2Fx {
  /** Wheel centre/radius of the live game, refreshed every frame. */
  cx = 210;
  cy = 262;
  radius = 100;
  /** Muzzle line of the live game (slide 2's `GUNY` = 596). */
  gunY = 596;
  /** Screen height, for the ground dust slide 2 kicks up. */
  h = 760;
  /** The slide-2 weapon that is currently firing. */
  weapon: TwoWeapon = 'firework';
  /** Slide 2's `stuckCount` — picks the BOOM!/KABOOM! callouts. */
  stuckCount = 0;
  /** Screen flash, polled by the game (`flash` + `flashHue`). */
  flash = 0;
  flashHue = 0;
  /** Gun pulses slide 2 hands to its own artwork. */
  jolt = 0;
  pulse = 0;
  cannonPulse = 0;
  aquaPulse = 0;
  rainbowPulse = 0;
  voidPulse = 0;
  /** Slide 2's own clock (particle hues ride on it). */
  time = 0;
  bubbles: TwoBubble[] = [];
  debris: TwoDebris[] = [];
  biteMarks: TwoBite[] = [];
  /** Slide 2's sky show. */
  sky: TwoSkyRocket[] = [];
  /** True while slide 1 is actually playing, so the sky keeps launching. */
  ambient = false;
  private ambientT = 0.6;
  host: TwoHost = NO_HOST;
  private hitX = 0;
  private hitY = 0;
  private hitKind: TwoWeapon = 'firework';

  clear() {
    super.clear();
    this.sky.length = 0;
    this.ambientT = 0.6;
    this.bubbles.length = 0;
    this.debris.length = 0;
    this.biteMarks.length = 0;
    this.flash = 0;
    this.jolt = 0;
    this.pulse = 0;
  }

  /** True while the layer still paints something, so slide 1 can skip it. */
  get busy(): boolean {
    return this.particles.length > 0 || this.glows.length > 0 || this.rings.length > 0
      || this.voids.length > 0 || this.jets.length > 0 || this.beams.length > 0
      || this.smokes.length > 0 || this.fireballs.length > 0 || this.flashes.length > 0
      || this.texts.length > 0 || this.timers.length > 0
      || this.bubbles.length > 0 || this.debris.length > 0 || this.biteMarks.length > 0
      || this.sky.length > 0;
  }

  private bite(life: number) {
    this.biteMarks.push({ x: this.hitX, y: this.hitY, kind: this.hitKind, life, max: life });
  }

  // ------------------------------------------------------------------ firing
  /**
   * Slide 2's `fire()` muzzle recipe: flash, cone, backblast, smoke, embers,
   * glows and the gun pulse that belongs to this weapon. The round itself is
   * slide 1's projectile carrying a slide-2 `TwoRound`.
   */
  fire(id: TwoWeapon, hue: number): TwoRound {
    this.weapon = id;
    // Slide 2 draws the round's seed BEFORE the muzzle recipe runs; keeping the
    // same order keeps the whole randomised recipe identical to slide 2.
    const round: TwoRound = { hue, seed: Math.random() * 10, age: 0, open: 0 };
    const bh = this.weapon === "blackhole";
    const sh = this.weapon === "shark";
    const bb = this.weapon === "bamboo";
    const sq = this.weapon === "soaker";
    const rb = this.weapon === "rainbow";
    const bz = this.weapon === "bazooka";
    const rp = this.weapon === "rpg";
    this.host.shake(bh ? 3.5 : sh ? 4 : bb ? 7 : sq ? 3 : rb ? 4 : bz ? 10 : rp ? 9 : 2.5);
    if (bz) {
      slide2Sfx.shootBazooka();
      const mx = this.cx;
      const my = this.gunY - 14;
      // star-shaped muzzle flash + fireball (no shockwave lines, no firework rings)
      this.spawnMuzzle(mx, my, 52, "bazooka");
      this.spawnFireball(mx, my - 8, 0, -60, 26, 0.4, 1);
      this.spawnFireball(mx - 10, my - 4, -40, -30, 16, 0.35, 0.8);
      this.spawnFireball(mx + 10, my - 4, 40, -30, 16, 0.35, 0.8);
      // forward fire cone — dense, layered, no twinkle
      for (let i = 0; i < 40; i++) {
        const a = -Math.PI / 2 + rnd(-0.5, 0.5);
        const sp = rnd(4, 14);
        const white = Math.random() < 0.25;
        this.spawn(mx + rnd(-10, 10), my, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.22, 0.55),
          size: rnd(1.8, 3.6),
          h: white ? 52 : rnd(14, 46),
          s: white ? 65 : 100,
          l: white ? 90 : rnd(56, 70),
          g: 0.02,
          d: 0.92,
          tr: 2.8,
          tw: false,
        });
      }
      // REAL backblast — smoke + flame venting DOWNWARD behind the tube
      for (let i = 0; i < 14; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        this.spawnSmoke(
          mx + side * rnd(10, 22),
          my + rnd(50, 90),
          side * rnd(40, 130),
          rnd(60, 190),
          rnd(9, 16),
          rnd(1.0, 1.8),
          rnd(0.4, 0.85)
        );
      }
      for (let i = 0; i < 16; i++) {
        const a = Math.PI / 2 + rnd(-0.65, 0.65);
        const sp = rnd(3, 9);
        this.spawn(mx + rnd(-8, 8), my + 60, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.25, 0.55),
          size: rnd(1.6, 3.0),
          h: rnd(15, 45),
          s: 100,
          l: rnd(55, 68),
          g: -0.02,
          d: 0.92,
          tw: false,
        });
      }
      // thick muzzle smoke billowing up + out
      for (let i = 0; i < 10; i++) {
        const a = rnd(0, TAU);
        this.spawnSmoke(
          mx + Math.cos(a) * 12,
          my + Math.sin(a) * 8,
          Math.cos(a) * rnd(20, 70),
          Math.sin(a) * rnd(20, 60) - 40,
          rnd(10, 18),
          rnd(1.1, 2.0),
          rnd(0.35, 0.8)
        );
      }
      // hot embers with gravity (no firework crackle/twinkle)
      for (let i = 0; i < 14; i++) {
        const a = -Math.PI / 2 + rnd(-0.9, 0.9);
        const sp = rnd(2, 7);
        this.spawn(mx + rnd(-8, 8), my + rnd(-4, 6), Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.35, 0.75),
          size: rnd(1.1, 1.8),
          h: rnd(30, 48),
          s: 100,
          l: 62,
          g: 0.14,
          d: 0.94,
          tr: 2.6,
          tw: false,
          crackle: false,
        });
      }
      // ground dust kicked around the mount
      for (let i = 0; i < 8; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        this.spawnSmoke(mx + side * rnd(30, 60), this.h - 46, side * rnd(30, 80), rnd(-30, -8), rnd(8, 14), rnd(0.9, 1.5), 0.25);
      }
      this.glows.push({ x: mx, y: my, hue: 36, life: 0.4, max: 0.4, r: 140 });
      this.glows.push({ x: mx, y: my, hue: 15, life: 0.5, max: 0.5, r: 190 });
      this.flash = Math.max(this.flash, 0.22);
      this.flashHue = 38;
      this.cannonPulse = Math.min(1, this.cannonPulse + 0.65);
      // lingering smoke column
      this.at(0.18, () => {
        for (let i = 0; i < 5; i++) {
          this.spawnSmoke(mx + rnd(-14, 14), my + rnd(-6, 30), rnd(-10, 10), rnd(-50, -20), rnd(10, 16), rnd(1.2, 1.9), rnd(0.5, 0.9));
        }
      });
      return round;
    }
    if (rp) {
      slide2Sfx.shootRpg();
      const mx = this.cx;
      const my = this.gunY - 14;
      // sharp diamond muzzle flash + hot jet (no shockwave lines, no firework rings)
      this.spawnMuzzle(mx, my, 46, "rpg");
      this.spawnFireball(mx, my - 10, 0, -80, 22, 0.38, 1);
      // narrow piercing fire cone with blue-white core streaks
      for (let i = 0; i < 36; i++) {
        const a = -Math.PI / 2 + rnd(-0.34, 0.34);
        const sp = rnd(5, 14);
        const core = Math.random() < 0.35;
        this.spawn(mx + rnd(-6, 6), my, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.22, 0.55),
          size: rnd(1.5, 3.0),
          h: core ? 198 : rnd(20, 48),
          s: core ? 70 : 100,
          l: core ? 90 : rnd(60, 70),
          g: 0.03,
          d: 0.92,
          tr: 3.2,
          tw: false,
        });
      }
      // backblast jets downward (twin streaks)
      for (let i = 0; i < 12; i++) {
        const side = i % 2 === 0 ? -1 : 1;
        this.spawnSmoke(
          mx + side * rnd(8, 18),
          my + rnd(55, 95),
          side * rnd(50, 140),
          rnd(70, 200),
          rnd(8, 14),
          rnd(0.9, 1.6),
          rnd(0.4, 0.8)
        );
      }
      for (let i = 0; i < 12; i++) {
        const a = Math.PI / 2 + rnd(-0.5, 0.5);
        const sp = rnd(4, 10);
        this.spawn(mx + rnd(-6, 6), my + 62, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.2, 0.45),
          size: rnd(1.4, 2.6),
          h: i % 3 === 0 ? 200 : rnd(20, 45),
          s: i % 3 === 0 ? 65 : 100,
          l: i % 3 === 0 ? 88 : 65,
          g: -0.02,
          d: 0.92,
          tw: false,
        });
      }
      // muzzle smoke + booster haze
      for (let i = 0; i < 8; i++) {
        const a = rnd(0, TAU);
        this.spawnSmoke(
          mx + Math.cos(a) * 10,
          my + Math.sin(a) * 7,
          Math.cos(a) * rnd(25, 75),
          Math.sin(a) * rnd(20, 55) - 45,
          rnd(9, 15),
          rnd(1.0, 1.8),
          rnd(0.35, 0.75)
        );
      }
      for (let i = 0; i < 12; i++) {
        const a = -Math.PI / 2 + rnd(-0.8, 0.8);
        const sp = rnd(2, 7);
        this.spawn(mx + rnd(-6, 6), my + rnd(-4, 4), Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.3, 0.6),
          size: 1.4,
          h: rnd(38, 52),
          s: 100,
          l: 68,
          g: 0.12,
          d: 0.93,
          tr: 2.6,
          tw: false,
          crackle: false,
        });
      }
      this.glows.push({ x: mx, y: my, hue: 32, life: 0.36, max: 0.36, r: 125 });
      this.glows.push({ x: mx, y: my, hue: 200, life: 0.3, max: 0.3, r: 90 });
      this.flash = Math.max(this.flash, 0.2);
      this.flashHue = 32;
      this.cannonPulse = Math.min(1, this.cannonPulse + 0.6);
      this.at(0.16, () => {
        for (let i = 0; i < 4; i++) {
          this.spawnSmoke(mx + rnd(-12, 12), my + rnd(-4, 28), rnd(-10, 10), rnd(-55, -22), rnd(9, 15), rnd(1.1, 1.8), rnd(0.5, 0.85));
        }
      });
      return round;
    }
    if (rb) {
      slide2Sfx.shootRainbow();
      // prismatic muzzle blast — full spectrum cone
      for (let i = 0; i < 36; i++) {
        const a = -Math.PI / 2 + rnd(-0.45, 0.45);
        const sp = rnd(3, 11);
        this.spawn(this.cx + rnd(-8, 8), this.gunY - 16, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.25, 0.6),
          size: rnd(1.4, 2.8),
          h: (i / 36) * 360 + rnd(-12, 12),
          s: 100,
          l: i % 6 === 0 ? 92 : rnd(58, 70),
          g: 0.04,
          d: 0.92,
        });
      }
      // instant laser beam flash up the barrel line
      this.beams.push({ x: this.cx, y: this.gunY - 60, life: 0.3, max: 0.3, len: 190, wid: 15, seed: rnd(0, 10) });
      this.spawn(this.cx, this.gunY - 18, 0, 0, { life: 0.18, size: 24, h: 0, s: 0, l: 96, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x: this.cx, y: this.gunY - 20, hue: (this.time * 120) % 360, life: 0.32, max: 0.32, r: 100 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue: 0, life: 0.38, max: 0.38, r: 56 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue: 140, life: 0.45, max: 0.45, r: 72 });
      this.rainbowPulse = Math.min(1, this.rainbowPulse + 0.45);
      return round;
    }
    if (bb) {
      slide2Sfx.shootBamboo();
      // big bamboo DUAR — fire cone + smoke + embers
      for (let i = 0; i < 30; i++) {
        const a = -Math.PI / 2 + rnd(-0.55, 0.55);
        const sp = rnd(3, 11);
        const fire = Math.random() < 0.55;
        this.spawn(this.cx + rnd(-10, 10), this.gunY - 16, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.25, 0.6),
          size: rnd(1.5, 3.2),
          h: fire ? rnd(18, 48) : rnd(0, 12),
          s: fire ? 100 : 60,
          l: fire ? rnd(55, 70) : rnd(70, 88),
          g: fire ? 0.02 : -0.03,
          d: 0.92,
        });
      }
      // gray smoke puffs drifting up
      for (let i = 0; i < 10; i++) {
        this.spawn(this.cx + rnd(-14, 14), this.gunY - 18, rnd(-1, 1), rnd(-2.5, -0.8), {
          life: rnd(0.7, 1.3),
          size: rnd(2.5, 4.5),
          h: 30,
          s: 12,
          l: rnd(45, 65),
          g: -0.02,
          d: 0.97,
          tr: 1.2,
          tw: false,
        });
      }
      this.spawn(this.cx, this.gunY - 18, 0, 0, { life: 0.18, size: 24, h: 35, s: 100, l: 80, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x: this.cx, y: this.gunY - 20, hue: 32, life: 0.32, max: 0.32, r: 100 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue: 35, life: 0.4, max: 0.4, r: 60 });
      this.cannonPulse = Math.min(1, this.cannonPulse + 0.5);
      return round;
    }
    if (sq) {
      slide2Sfx.shootSoaker();
      // pressurized water jet cone + foam + bubbles
      for (let i = 0; i < 28; i++) {
        const a = -Math.PI / 2 + rnd(-0.32, 0.32);
        const sp = rnd(4, 11);
        this.spawn(this.cx + rnd(-6, 6), this.gunY - 16, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.3, 0.6),
          size: rnd(1.4, 2.6),
          h: rnd(190, 210),
          s: 95,
          l: rnd(62, 86),
          g: 0.12,
          d: 0.93,
        });
      }
      for (let i = 0; i < 12; i++) {
        this.spawnBubble(this.cx + rnd(-12, 12), this.gunY - 14 + rnd(-6, 6), rnd(-1.5, 1.5), rnd(-5, -1.5), rnd(1.8, 4.2));
      }
      this.spawn(this.cx, this.gunY - 18, 0, 0, { life: 0.15, size: 18, h: 200, s: 90, l: 90, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x: this.cx, y: this.gunY - 20, hue: 200, life: 0.28, max: 0.28, r: 80 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue: 200, life: 0.32, max: 0.32, r: 48 });
      this.aquaPulse = Math.min(1, this.aquaPulse + 0.3);
      return round;
    }
    if (sh) {
      slide2Sfx.shootShark();
      // water cannon blast
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI / 2 + rnd(-0.5, 0.5);
        const sp = rnd(3, 10);
        this.spawn(this.cx + rnd(-8, 8), this.gunY - 16, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.3, 0.65),
          size: rnd(1.4, 2.8),
          h: rnd(188, 212),
          s: rnd(70, 100),
          l: rnd(60, 85),
          g: 0.14,
          d: 0.93,
        });
      }
      // foam + bubbles bursting from the jaws
      for (let i = 0; i < 10; i++) {
        this.spawnBubble(this.cx + rnd(-16, 16), this.gunY - 14 + rnd(-6, 6), rnd(-1.5, 1.5), rnd(-5, -1.5), rnd(2, 5));
      }
      this.spawn(this.cx, this.gunY - 18, 0, 0, { life: 0.16, size: 20, h: 200, s: 90, l: 88, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x: this.cx, y: this.gunY - 20, hue: 200, life: 0.3, max: 0.3, r: 85 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue: 200, life: 0.35, max: 0.35, r: 52 });
      this.aquaPulse = Math.min(1, this.aquaPulse + 0.35);
      return round;
    }
    if (bh) {
      slide2Sfx.shootBH();
      // collapsing sparks into the muzzle
      for (let i = 0; i < 16; i++) {
        const a = rnd(0, TAU);
        const rr = rnd(14, 44);
        const sx = this.cx + Math.cos(a) * rr;
        const sy = this.gunY - 18 + Math.sin(a) * rr * 0.7;
        this.spawn(sx, sy, -Math.cos(a) * rnd(2, 4.5), -Math.sin(a) * rnd(2, 4.5), {
          life: rnd(0.2, 0.4),
          size: rnd(1.4, 2.4),
          h: hue + rnd(-25, 25),
          l: 75,
          g: 0,
          d: 0.93,
          ax: this.cx,
          ay: this.gunY - 18,
          pull: 5,
        });
      }
      this.spawn(this.cx, this.gunY - 18, 0, 0, { life: 0.16, size: 18, h: hue + 50, s: 80, l: 90, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x: this.cx, y: this.gunY - 20, hue, life: 0.25, max: 0.25, r: 80 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue: hue + 40, life: 0.35, max: 0.35, r: 46 });
    } else {
      slide2Sfx.shootFirework();
      // muzzle flash
      for (let i = 0; i < 22; i++) {
        const a = -Math.PI / 2 + rnd(-0.55, 0.55);
        const sp = rnd(2, 8);
        this.spawn(this.cx, this.gunY - 18, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.25, 0.55),
          size: rnd(1.2, 2.6),
          h: hue + rnd(-25, 25),
          l: 65,
          g: 0.12,
          d: 0.92,
        });
      }
      this.spawn(this.cx, this.gunY - 18, 0, 0, { life: 0.14, size: 16, h: hue, l: 85, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x: this.cx, y: this.gunY - 20, hue, life: 0.25, max: 0.25, r: 70 });
      this.rings.push({ x: this.cx, y: this.gunY - 18, hue, life: 0.3, max: 0.3, r: 38 });
    }
    return round;
  }

  // ----------------------------------------------------------------- impacts
  /**
   * Slide 2's `stick()` impact for the weapon that just landed, played at the
   * point slide 1's round actually hit.
   */
  stick(id: TwoWeapon, hitX: number, hitY: number, hue: number, seed: number) {
    this.weapon = id;
    this.hitX = hitX;
    this.hitY = hitY;
    this.hitKind = id;
    this.stuckCount++;
    const bh = this.weapon === "blackhole";
    const sh = this.weapon === "shark";
    const bb = this.weapon === "bamboo";
    const sq = this.weapon === "soaker";
    const rb = this.weapon === "rainbow";
    const bz = this.weapon === "bazooka";
    const rp = this.weapon === "rpg";
    this.host.shake(bh ? 6 : sh ? 8 : bb ? 9 : sq ? 5 : rb ? 6 : bz ? 12 : rp ? 11 : 4.5);
    if (bz) {
      // SHELL SLAMS into armor — fireball + smoke + shrapnel (no shock lines/rings)
      slide2Sfx.hitBazooka(this.stuckCount);
      this.flash = 0.3;
      this.flashHue = 35;
      const bx = hitX;
      const by = (hitY - 6) + 6;
      this.warheadBurst(bx, by, 1.05, "bazooka");
      this.bite(2.0);
      this.spawnShrapnel(bx, by, 5, 0.9, false);
      const word = this.stuckCount % 4 === 0 ? "BOOM!" : "+1";
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 36, text: word, hue: 40, life: 0.9 });
      this.host.emit();
      return;
    }
    if (rp) {
      // GRENADE PIERCES steel — jet + fire + smoke (no shock lines/rings)
      slide2Sfx.hitRpg(this.stuckCount);
      this.flash = 0.3;
      this.flashHue = 28;
      const bx = hitX;
      const by = (hitY - 6) + 6;
      this.warheadBurst(bx, by, 1.05, "rpg");
      this.bite(2.0);
      this.spawnShrapnel(bx, by, 5, 0.9, true);
      const word = this.stuckCount % 4 === 0 ? "KABOOM!" : "+1";
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 36, text: word, hue: 25, life: 0.9 });
      this.host.emit();
      return;
    }
    if (rb) {
      // LASER LODGES into the prism board — spectrum shatter
      slide2Sfx.hitRainbow(this.stuckCount);
      this.flash = 0.22;
      this.flashHue = (this.time * 140) % 360;
      const bx = hitX;
      const by = (hitY - 6) + 6;
      this.rainbowBurst(bx, by, 0.95);
      this.bite(1.4);
      this.beams.push({ x: bx, y: by - 40, life: 0.35, max: 0.35, len: 170, wid: 12, seed: rnd(0, 10) });
      const word = this.stuckCount % 4 === 0 ? "ZAP!" : "+1";
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 32, text: word, hue: (this.stuckCount * 47) % 360, life: 0.9 });
      this.host.emit();
      return;
    }
    if (bb) {
      // STONE SLAMS into the wood — dust, chips, cracks
      slide2Sfx.hitBamboo(this.stuckCount);
      this.flash = 0.2;
      this.flashHue = 32;
      const bx = hitX;
      const by = (hitY - 6) + 6;
      this.stoneBurst(bx, by, 0.9);
      this.bite(1.4);
      this.rings.push({ x: bx, y: by, hue: 35, life: 0.4, max: 0.4, r: 85 });
      const word = this.stuckCount % 4 === 0 ? "DUK!" : "+1";
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 32, text: word, hue: 35, life: 0.9 });
      this.host.emit();
      return;
    }
    if (sq) {
      // WATER BLOB splats and sticks, wobbling
      slide2Sfx.hitSoaker(this.stuckCount);
      this.flash = 0.18;
      this.flashHue = 200;
      const bx = hitX;
      const by = (hitY - 6) + 10;
      this.splashBurst(bx, by, 202, 0.85);
      this.rings.push({ x: bx, y: by, hue: 200, life: 0.4, max: 0.4, r: 75 });
      const word = this.stuckCount % 4 === 0 ? "BYUR!" : "+1";
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 32, text: word, hue: 200, life: 0.9 });
      this.host.emit();
      return;
    }
    if (sh) {
      // HARD BITE — the shark slams its jaws shut on the board and hangs on
      slide2Sfx.hitShark(this.stuckCount);
      this.flash = 0.22;
      this.flashHue = 200;
      const bx = hitX;
      const by = (hitY - 6) + 8;
      this.splashBurst(bx, by, 200, 0.95);
      this.bite(1.4);
      this.rings.push({ x: bx, y: by, hue: 200, life: 0.4, max: 0.4, r: 80 });
      const word = this.stuckCount % 4 === 0 ? "CHOMP!" : "+1";
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 34, text: word, hue: 200, life: 0.9 });
      this.host.emit();
      return;
    }
    if (bh) {
      slide2Sfx.hitBH(this.stuckCount);
      this.flash = 0.25;
      this.flashHue = hue;
      const by = (hitY - 6) + 26;
      this.voidBurst(hitX, by, hue, 0.8);
      this.rings.push({ x: hitX, y: by, hue: hue + 40, life: 0.45, max: 0.45, r: 95 });
      this.texts.push({ x: hitX + rnd(-30, 30), y: by + 30, text: "+1", hue: hue, life: 0.9 });
    } else {
      slide2Sfx.hitFirework(this.stuckCount);
      const bx = hitX;
      const by = (hitY - 6) + PL * 0.65;
      const type = IMPACT_TYPES[Math.floor(Math.random() * IMPACT_TYPES.length)];
      this.burst(bx, by, hue, type, 0.72);
      this.burst(bx, (hitY - 6) + 4, hue + 60, "peony", 0.35);
      this.rings.push({ x: bx, y: by, hue: hue, life: 0.45, max: 0.45, r: 90 });
      this.texts.push({ x: bx + rnd(-30, 30), y: by + 26, text: "+1", hue: hue, life: 0.9 });
    }
    this.host.emit();
  }

  // ------------------------------------------------------------------- round
  /** Slide 2's per-weapon round art, at the round's live position. */
  drawRound(
    c: CanvasRenderingContext2D, id: TwoWeapon, round: TwoRound,
    x: number, y: number, time: number,
  ) {
    const { hue, seed, age, open } = round;
    c.save();
      if (id === 'blackhole') {
        {
          c.save();
          c.translate(x, y);
          drawOrb(c, hue, 12.5, this.time, 2.3);
          c.restore();
        }
      } else if (id === 'bazooka') {
        {
          const wig = Math.sin(age * 12 + seed * 5) * 0.03;
          c.save();
          c.translate(x + Math.sin(age * 8 + seed * 3) * 1.5, y);
          c.rotate(Math.PI / 2 + wig);
          drawBazookaShell(c, hue, this.time, seed, 0, 1);
          c.restore();
        }
      } else if (id === 'rpg') {
        {
          const wig = Math.sin(age * 13 + seed * 4) * 0.04;
          c.save();
          c.translate(x + Math.sin(age * 9 + seed * 5) * 2, y);
          c.rotate(Math.PI / 2 + wig);
          drawRpgGrenade(c, hue, this.time, seed, 0, 1);
          c.restore();
        }
      } else if (id === 'rainbow') {
        {
          c.save();
          c.translate(x + Math.sin(age * 11 + seed * 4) * 2, y);
          c.rotate(Math.PI / 2);
          drawRainbowBolt(c, this.time, seed, 0, 1);
          c.restore();
        }
      } else if (id === 'bamboo') {
        {
          c.save();
          c.translate(x, y);
          drawStone(c, hue, 13.5, this.time + age * 2, seed, 0);
          c.restore();
        }
      } else if (id === 'soaker') {
        {
          c.save();
          c.translate(x + Math.sin(age * 10 + seed * 4) * 2.5, y);
          drawDrop(c, hue, 12, this.time, seed, 0);
          c.restore();
        }
      } else if (id === 'shark') {
        {
          const wig = Math.sin(age * 14 + seed * 5) * 0.06;
          c.save();
          c.translate(x + Math.sin(age * 9 + seed * 4) * 3, y);
          c.rotate(Math.PI / 2 + wig);
          drawShark(c, hue, Math.max(open, 0.12), this.time, seed, 0);
          c.restore();
        }
      } else {
        {
          c.save();
          c.translate(x, y);
          c.rotate(Math.PI / 2);
          drawRocketShape(c, hue);
          c.restore();
        }
      }
    c.restore();
  }

  /** Slide 2's in-flight trail for the round that is currently flying. */
  trail(id: TwoWeapon, x: number, y: number, round: TwoRound) {
    this.weapon = id;
    const age = round.age;
    const seed = round.seed;
    const hue = round.hue;
    const bh = id === 'blackhole';
    const sh = id === 'shark';
    const bb = id === 'bamboo';
    const sq = id === 'soaker';
    const rb = id === 'rainbow';
    const bz = id === 'bazooka';
    const rp = id === 'rpg';
    if (bh || sh || bb || sq || rb || bz || rp) {
      /* the flags above are all read by the ported recipe below */
    }
      if (bz) {
        // bazooka sustainer — roaring orange core + thick smoke ribbon + sparks
        const tx = x + Math.sin(age * 8 + seed * 3) * 1.5;
        for (let k = 0; k < 4; k++) {
          const core = k < 2;
          this.spawn(tx + rnd(-5, 5), y + 26 + rnd(0, 16), rnd(-0.7, 0.7), rnd(2.5, 5.5), {
            life: rnd(0.2, 0.48),
            size: core ? rnd(2.0, 3.4) : rnd(1.5, 2.6),
            h: core ? rnd(38, 52) : rnd(15, 40),
            s: 100,
            l: core ? rnd(68, 82) : rnd(56, 66),
            g: 0.02,
            d: 0.9,
            tr: 3,
            tw: false,
          });
        }
        // dense lingering smoke ribbon (real smoke puffs)
        if (Math.random() < 0.85) {
          this.spawnSmoke(
            tx + rnd(-7, 7),
            y + rnd(30, 52),
            rnd(-14, 14),
            rnd(20, 60),
            rnd(8, 14),
            rnd(0.9, 1.6),
            rnd(0.35, 0.75)
          );
        }
        if (Math.random() < 0.5) {
          this.spawn(tx + rnd(-4, 4), y + rnd(20, 34), rnd(-1.2, 1.2), rnd(1.5, 3.5), {
            life: rnd(0.25, 0.55),
            size: rnd(1.1, 1.7),
            h: rnd(35, 48),
            s: 100,
            l: 64,
            g: 0.12,
            d: 0.93,
            tr: 2.6,
            tw: false,
            crackle: false,
          });
        }
      } else if (rp) {
        // RPG booster — searing blue-white jet + orange sheath + smoke corkscrew
        const tx = x + Math.sin(age * 9 + seed * 5) * 2;
        for (let k = 0; k < 4; k++) {
          const core = k === 0;
          const mid = k === 1;
          this.spawn(tx + rnd(-4, 4), y + 26 + rnd(0, 16), rnd(-0.7, 0.7), rnd(2.5, 5.5), {
            life: rnd(0.2, 0.48),
            size: core ? rnd(2.0, 3.0) : rnd(1.4, 2.5),
            h: core ? 200 : mid ? 48 : rnd(20, 45),
            s: core ? 70 : 100,
            l: core ? 90 : mid ? 80 : rnd(60, 70),
            g: 0.02,
            d: 0.9,
            tr: 3.4,
            tw: false,
          });
        }
        if (Math.random() < 0.8) {
          const swirl = Math.sin(age * 14 + seed * 6) * 8;
          this.spawnSmoke(tx + swirl * 0.4 + rnd(-5, 5), y + rnd(30, 50), swirl * 0.8 + rnd(-8, 8), rnd(25, 65), rnd(7, 12), rnd(0.8, 1.5), rnd(0.35, 0.7));
        }
        if (Math.random() < 0.4) {
          this.spawn(tx + rnd(-4, 4), y + rnd(20, 32), rnd(-1, 1), rnd(1.5, 3), {
            life: rnd(0.25, 0.5),
            size: 1.3,
            h: 195,
            s: 70,
            l: 86,
            g: 0.05,
            d: 0.93,
            tr: 3.6,
            tw: false,
            crackle: false,
          });
        }
      } else if (rb) {
        // rainbow laser streak — spectrum ribbon + white core glints
        for (let k = 0; k < 4; k++) {
          this.spawn(x + rnd(-5, 5) + (k - 1.5) * 3, y + 20 + rnd(0, 22), rnd(-0.6, 0.6), rnd(2, 5), {
            life: rnd(0.22, 0.5),
            size: rnd(1.5, 2.7),
            h: this.time * 260 + y * 1.5 + k * 45,
            s: 100,
            l: k === 1 ? 90 : 64,
            g: 0,
            d: 0.92,
            tr: 3,
          });
        }
        if (Math.random() < 0.5) {
          this.spawn(x + rnd(-4, 4), y + rnd(-6, 10), 0, 0, {
            life: 0.18,
            size: 8,
            h: 0,
            s: 0,
            l: 96,
            d: 1,
            g: 0,
            tr: 0,
            tw: false,
          });
        }
      } else if (bb) {
        // stone rips upward — fire streak + smoke + dust
        for (let k = 0; k < 3; k++) {
          const fire = k < 2;
          this.spawn(x + rnd(-6, 6), y + 14 + rnd(0, 14), rnd(-0.8, 0.8), rnd(1.5, 4), {
            life: rnd(0.2, 0.5),
            size: rnd(1.4, 2.6),
            h: fire ? rnd(20, 45) : 32,
            s: fire ? 100 : 15,
            l: fire ? rnd(58, 72) : 55,
            g: fire ? 0.02 : -0.01,
            d: 0.92,
          });
        }
        if (Math.random() < 0.4) {
          this.spawn(x + rnd(-8, 8), y + rnd(10, 26), rnd(-0.6, 0.6), rnd(0.5, 2), {
            life: rnd(0.5, 0.9),
            size: rnd(2, 3.4),
            h: 30,
            s: 12,
            l: 55,
            g: -0.015,
            d: 0.96,
            tr: 1.2,
            tw: false,
          });
        }
      } else if (sq) {
        // water blob streams droplets + bubbles
        for (let k = 0; k < 3; k++) {
          this.spawn(x + rnd(-7, 7), y + 14 + rnd(0, 14), rnd(-1, 1), rnd(2, 5), {
            life: rnd(0.25, 0.5),
            size: rnd(1.4, 2.5),
            h: rnd(190, 210),
            s: 95,
            l: k === 0 ? 90 : 70,
            g: 0.12,
            d: 0.92,
          });
        }
        if (Math.random() < 0.5) {
          this.spawnBubble(x + rnd(-10, 10), y + rnd(8, 30), rnd(-1, 1), rnd(-0.5, 1.5), rnd(1.5, 3.2));
        }
      } else if (sh) {
        // watery wake + bubbles streaming off the shark
        for (let k = 0; k < 3; k++) {
          const side = k - 1;
          this.spawn(x + side * rnd(6, 14), y + 34 + rnd(0, 16), side * rnd(0.5, 1.8), rnd(2, 5), {
            life: rnd(0.25, 0.55),
            size: rnd(1.4, 2.6),
            h: rnd(188, 212),
            s: rnd(75, 100),
            l: k === 1 ? 90 : 68,
            g: 0.1,
            d: 0.92,
          });
        }
        if (Math.random() < 0.55) {
          this.spawnBubble(x + rnd(-14, 14), y + rnd(10, 40), rnd(-1, 1), rnd(-0.5, 1.5), rnd(1.6, 3.6));
        }
      } else if (bh) {
        // singularity rips upward — accretion spiral + stretched starlight + lens glints
        for (let k = 0; k < 4; k++) {
          const a = rnd(0, TAU);
          const rr = rnd(10, 26);
          this.spawn(
            x + Math.cos(a) * rr,
            y + Math.sin(a) * rr * 0.7,
            -Math.sin(a) * rnd(2, 4),
            Math.cos(a) * rnd(1, 2) + rnd(2, 4.5),
            {
              life: rnd(0.3, 0.65),
              size: rnd(1.4, 2.6),
              h: hue + rnd(-30, 30),
              s: 100,
              l: k === 0 ? 88 : 68,
              g: 0,
              d: 0.93,
              ax: x,
              ay: y,
              pull: 3.2,
              tr: 3,
            }
          );
        }
        // stretched star streaks bending past the orb
        if (Math.random() < 0.55) {
          const side = Math.random() < 0.5 ? -1 : 1;
          this.spawn(x + side * rnd(18, 34), y + rnd(-14, 14), -side * rnd(1, 2.5), rnd(2, 4), {
            life: rnd(0.3, 0.55),
            size: 1.6,
            h: 0,
            s: 0,
            l: 92,
            g: 0,
            d: 0.94,
            ax: x,
            ay: y,
            pull: 2,
            tr: 4,
          });
        }
        if (Math.random() < 0.6) {
          this.spawn(x + rnd(-3, 3), y + rnd(-3, 3), 0, 0, {
            life: 0.2,
            size: 10,
            h: hue + 60,
            s: 70,
            l: 93,
            d: 1,
            g: 0,
            tr: 0,
            tw: false,
          });
        }
      } else {
        for (let k = 0; k < 3; k++) {
          this.spawn(x + rnd(-2, 2), y + PL + rnd(0, 10), rnd(-0.6, 0.6), rnd(1, 3.5), {
            life: rnd(0.2, 0.5),
            size: rnd(1.5, 2.8),
            h: hue + rnd(-25, 25),
            l: k === 0 ? 90 : 62,
            g: 0.02,
            d: 0.93,
          });
        }
      }
  }

  // ------------------------------------------------------------------ layers
  burst(x: number, y: number, hue: number, type: BurstType, scale = 1, hueJitter = 25) {
    const speed = 5.2 * scale;
    const cnt = Math.max(0.5, scale);
    const life = () => rnd(1.0, 1.6) * (0.7 + scale * 0.3);
    this.glows.push({ x, y, hue, life: 0.5, max: 0.5, r: 90 * scale + 30 });
    this.spawn(x, y, 0, 0, { life: 0.22, size: 22 * scale, h: hue, l: 92, d: 1, g: 0, tr: 0, tw: false });

    const jh = () => rnd(-hueJitter, hueJitter);

    switch (type) {
      case "peony": {
        const n = Math.round(80 * cnt);
        for (let i = 0; i < n; i++) {
          const a = rnd(0, TAU);
          const sp = speed * (0.7 + 0.3 * Math.random());
          this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: life(),
            size: rnd(1.6, 2.6),
            h: hue + jh(),
            g: 0.035,
            d: 0.955,
          });
        }
        for (let i = 0; i < n * 0.45; i++) {
          const a = rnd(0, TAU);
          const sp = speed * 0.42 * (0.4 + Math.random() * 0.6);
          this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: life() * 0.8,
            size: 1.8,
            h: hue + 150,
            l: 72,
            g: 0.035,
            d: 0.955,
          });
        }
        break;
      }
      case "ring": {
        const n = Math.round(56 * cnt);
        const off = rnd(0, TAU);
        for (let i = 0; i < n; i++) {
          const a = off + (i / n) * TAU;
          this.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, {
            life: life(),
            size: 2.4,
            h: hue + jh() * 0.3,
            g: 0.02,
            d: 0.958,
          });
        }
        const m = Math.round(30 * cnt);
        for (let i = 0; i < m; i++) {
          const a = off + (i / m) * TAU;
          this.spawn(x, y, Math.cos(a) * speed * 0.55, Math.sin(a) * speed * 0.55, {
            life: life() * 0.85,
            size: 2,
            h: hue + 120,
            l: 70,
            g: 0.02,
            d: 0.958,
          });
        }
        break;
      }
      case "star": {
        const n = Math.round(110 * cnt);
        const off = rnd(0, TAU);
        for (let i = 0; i < n; i++) {
          const seg = (i / n) * 10;
          const k = Math.floor(seg);
          const f = seg - k;
          const a1 = (k * Math.PI) / 5 - Math.PI / 2 + off;
          const a2 = ((k + 1) * Math.PI) / 5 - Math.PI / 2 + off;
          const r1 = k % 2 === 0 ? 1 : 0.42;
          const r2 = (k + 1) % 2 === 0 ? 1 : 0.42;
          const vx = Math.cos(a1) * r1 * (1 - f) + Math.cos(a2) * r2 * f;
          const vy = Math.sin(a1) * r1 * (1 - f) + Math.sin(a2) * r2 * f;
          this.spawn(x, y, vx * speed * 1.05, vy * speed * 1.05, {
            life: life(),
            size: 2.3,
            h: hue + jh() * 0.3,
            l: 66,
            g: 0.015,
            d: 0.957,
          });
        }
        break;
      }
      case "heart": {
        const n = Math.round(70 * cnt);
        const hh = rnd(325, 360);
        for (let i = 0; i < n; i++) {
          const t = (i / n) * TAU;
          const hx = 16 * Math.pow(Math.sin(t), 3);
          const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          const k = (speed * 1.05) / 17;
          this.spawn(x, y, hx * k, hy * k, {
            life: life(),
            size: 2.5,
            h: hh + rnd(-8, 8),
            l: 64,
            g: 0.015,
            d: 0.957,
          });
        }
        break;
      }
      case "spiral": {
        const n = Math.round(100 * cnt);
        const off = rnd(0, TAU);
        for (let i = 0; i < n; i++) {
          const a = off + i * 0.34;
          const sp = speed * (0.15 + 0.85 * (i / n));
          this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: life(),
            size: 2.2,
            h: hue + (i / n) * 90,
            g: 0.02,
            d: 0.957,
          });
        }
        break;
      }
      case "crackle": {
        const n = Math.round(70 * cnt);
        for (let i = 0; i < n; i++) {
          const a = rnd(0, TAU);
          const sp = speed * (0.55 + 0.45 * Math.random());
          this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: rnd(0.9, 1.3),
            size: 2.4,
            h: hue + jh(),
            l: 68,
            g: 0.03,
            d: 0.955,
            crackle: true,
          });
        }
        break;
      }
      case "rainbow": {
        const n = Math.round(90 * cnt);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * TAU;
          const sp = speed * (0.75 + 0.25 * Math.random());
          this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: life(),
            size: 2.3,
            h: hue + (i / n) * 360,
            l: 62,
            g: 0.03,
            d: 0.955,
          });
        }
        break;
      }
      case "willow": {
        const n = Math.round(80 * cnt);
        for (let i = 0; i < n; i++) {
          const a = rnd(0, TAU);
          const sp = speed * rnd(0.35, 1);
          this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: rnd(1.8, 2.8),
            size: 1.7,
            h: rnd(36, 50),
            s: 95,
            l: 66,
            g: 0.045,
            d: 0.972,
            tr: 4,
          });
        }
        break;
      }
    }
  }

  voidBurst(x: number, y: number, hue: number, scale = 1) {
    const h = 215 + ((((hue - 215) % 105) + 105) % 105); // clamp to the cosmic band
    this.voids.push({ x, y, hue: h, life: 0.85, max: 0.85, r: 62 * scale + 18 });
    this.rings.push({ x, y, hue: h, life: 0.5, max: 0.5, r: 130 * scale, impl: true });
    this.rings.push({ x, y, hue: h + 40, life: 0.55, max: 0.55, r: 110 * scale });
    this.glows.push({ x, y, hue: h, life: 0.6, max: 0.6, r: 140 * scale + 20 });
    this.voidPulse = Math.min(1, this.voidPulse + 0.6 * scale);
    // accretion inflow — matter spiralling into the well
    const n = Math.round(52 * scale);
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU);
      const rr = rnd(70, 160) * scale;
      const sx = x + Math.cos(a) * rr;
      const sy = y + Math.sin(a) * rr;
      const sp = rnd(3.5, 6.5);
      const swirl = 0.9;
      this.spawn(sx, sy, -Math.cos(a) * sp - Math.sin(a) * sp * swirl, -Math.sin(a) * sp + Math.cos(a) * sp * swirl, {
        life: rnd(0.45, 0.75),
        size: rnd(1.6, 2.6),
        h: h + rnd(-30, 30),
        l: 70,
        g: 0,
        d: 0.94,
        ax: x,
        ay: y,
        pull: 6,
      });
    }
    // collapse flash + relativistic jets (delayed)
    this.at(0.15, () => {
      // hot core flash
      this.spawn(x, y, 0, 0, { life: 0.22, size: 20 * scale, h: h + 45, s: 70, l: 92, d: 1, g: 0, tr: 0, tw: false });
      this.glows.push({ x, y, hue: h + 40, life: 0.35, max: 0.35, r: 110 * scale });
      // bipolar jets
      this.jets.push({ x, y, hue: h, life: 0.5, max: 0.5, len: 200 * scale, wid: 13 * scale });
      for (let i = 0; i < Math.round(26 * scale); i++) {
        const up = i % 2 === 0;
        this.spawn(x + rnd(-6, 6), y + rnd(-8, 8), rnd(-0.6, 0.6), (up ? -1 : 1) * rnd(6, 12) * scale, {
          life: rnd(0.4, 0.8),
          size: rnd(1.4, 2.3),
          h: h + rnd(-20, 40),
          s: 85,
          l: 84,
          g: 0,
          d: 0.965,
          tr: 3.5,
        });
      }
      // tangential ejecta — curved shreds orbiting outward, never a radial firework shell
      const m = Math.round(30 * scale);
      const dir = Math.random() < 0.5 ? 1 : -1;
      for (let i = 0; i < m; i++) {
        const a = rnd(0, TAU);
        const sp = rnd(2.5, 5.5) * scale;
        this.spawn(
          x + Math.cos(a) * 10,
          y + Math.sin(a) * 10,
          Math.cos(a) * sp * 0.45 - Math.sin(a) * sp * dir,
          Math.sin(a) * sp * 0.45 + Math.cos(a) * sp * dir,
          {
            life: rnd(0.6, 1.1),
            size: rnd(1.5, 2.4),
            h: h + rnd(-25, 35),
            l: 68,
            g: 0,
            d: 0.958,
            ax: x,
            ay: y,
            pull: 1.2,
          }
        );
      }
      this.rings.push({ x, y, hue: h + 30, life: 0.4, max: 0.4, r: 90 * scale });
      this.host.shake(5 * scale);
    });
  }

  splashBurst(x: number, y: number, hue: number, scale = 1) {
    const h = 188 + ((((hue - 188) % 26) + 26) % 26);
    // droplets — mostly upward cone
    const n = Math.round(42 * scale);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + rnd(-1.15, 1.15);
      const sp = rnd(2.5, 8.5) * scale;
      this.spawn(x + rnd(-6, 6), y + rnd(-4, 4), Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.5, 1.0),
        size: rnd(1.5, 2.8),
        h: h + rnd(-12, 18),
        s: rnd(75, 100),
        l: rnd(58, 80),
        g: 0.22,
        d: 0.96,
        tr: 2,
      });
    }
    // white foam
    for (let i = 0; i < Math.round(16 * scale); i++) {
      const a = rnd(0, TAU);
      const sp = rnd(1, 4.5) * scale;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp - 2, {
        life: rnd(0.4, 0.8),
        size: rnd(1.6, 2.6),
        h: 205,
        s: 45,
        l: 94,
        g: 0.16,
        d: 0.94,
      });
    }
    // bubbles
    for (let i = 0; i < Math.round(14 * scale); i++) {
      const a = rnd(0, TAU);
      this.spawnBubble(
        x + Math.cos(a) * rnd(4, 20),
        y + Math.sin(a) * rnd(4, 14),
        Math.cos(a) * rnd(0.5, 2),
        rnd(-3.5, -1),
        rnd(1.8, 4.6)
      );
    }
    this.glows.push({ x, y, hue: 200, life: 0.45, max: 0.45, r: 120 * scale + 20 });
    this.rings.push({ x, y, hue: 200, life: 0.45, max: 0.45, r: 100 * scale });
    this.aquaPulse = Math.min(1, this.aquaPulse + 0.5 * scale);
  }

  stoneBurst(x: number, y: number, scale = 1) {
    // dust cloud — tan/brown puffs
    const n = Math.round(30 * scale);
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU);
      const sp = rnd(1.5, 6) * scale;
      this.spawn(x + rnd(-5, 5), y + rnd(-4, 4), Math.cos(a) * sp, Math.sin(a) * sp - 1.5, {
        life: rnd(0.5, 1.0),
        size: rnd(1.8, 3.2),
        h: rnd(22, 42),
        s: rnd(30, 55),
        l: rnd(42, 62),
        g: 0.1,
        d: 0.94,
        tr: 1.6,
        tw: false,
      });
    }
    // rock chips — fast gray shards
    for (let i = 0; i < Math.round(18 * scale); i++) {
      const a = -Math.PI / 2 + rnd(-1.2, 1.2);
      const sp = rnd(3, 9) * scale;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.4, 0.8),
        size: rnd(1.4, 2.4),
        h: rnd(20, 45),
        s: 18,
        l: rnd(50, 70),
        g: 0.25,
        d: 0.96,
        tr: 2.2,
      });
    }
    // wood splinters — warm orange streaks
    for (let i = 0; i < Math.round(12 * scale); i++) {
      const a = rnd(0, TAU);
      const sp = rnd(2, 6) * scale;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.4, 0.7),
        size: rnd(1.5, 2.3),
        h: rnd(24, 36),
        s: 80,
        l: 52,
        g: 0.2,
        d: 0.95,
      });
    }
    // hot impact flash
    this.spawn(x, y, 0, 0, { life: 0.2, size: 20 * scale, h: 40, s: 100, l: 75, d: 1, g: 0, tr: 0, tw: false });
    this.glows.push({ x, y, hue: 32, life: 0.45, max: 0.45, r: 120 * scale + 20 });
    this.rings.push({ x, y, hue: 35, life: 0.4, max: 0.4, r: 95 * scale });
    this.cannonPulse = Math.min(1, this.cannonPulse + 0.5 * scale);
  }

  rainbowBurst(x: number, y: number, scale = 1) {
    const base = this.time * 90;
    // spectrum shell — hue follows launch angle for a true rainbow ring
    const n = Math.round(64 * scale);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rnd(-0.04, 0.04);
      const sp = rnd(2.5, 6.5) * scale;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.55, 1.0),
        size: rnd(1.6, 2.6),
        h: base + (i / n) * 360,
        s: 100,
        l: 64,
        g: 0.03,
        d: 0.955,
        tr: 2.6,
      });
    }
    // white-hot core flash + prism shards
    this.spawn(x, y, 0, 0, { life: 0.22, size: 22 * scale, h: 0, s: 0, l: 97, d: 1, g: 0, tr: 0, tw: false });
    for (let i = 0; i < Math.round(14 * scale); i++) {
      const a = rnd(0, TAU);
      const sp = rnd(1.5, 4) * scale;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.4, 0.8),
        size: rnd(1.8, 2.6),
        h: 0,
        s: 0,
        l: 95,
        g: 0.02,
        d: 0.95,
      });
    }
    // chromatic shockwave rings
    this.rings.push({ x, y, hue: base % 360, life: 0.45, max: 0.45, r: 95 * scale });
    this.rings.push({ x, y, hue: (base + 130) % 360, life: 0.55, max: 0.55, r: 125 * scale });
    this.glows.push({ x, y, hue: base % 360, life: 0.45, max: 0.45, r: 130 * scale + 20 });
    this.glows.push({ x, y, hue: (base + 180) % 360, life: 0.35, max: 0.35, r: 90 * scale });
    this.rainbowPulse = Math.min(1, this.rainbowPulse + 0.5 * scale);
  }

  warheadBurst(x: number, y: number, scale = 1, style: "bazooka" | "rpg" = "bazooka") {
    const hot = style === "rpg";
    const s = Math.max(0.6, scale);

    // 1) blinding core flash + fire light
    this.flashes.push({ x, y, life: 0.22, max: 0.22, r: (hot ? 74 : 68) * s, seed: rnd(0, 10), style });
    this.spawn(x, y, 0, 0, { life: 0.16, size: 30 * s, h: 48, s: 100, l: 92, d: 1, g: 0, tr: 0, tw: false });
    this.glows.push({ x, y, hue: hot ? 30 : 36, life: 0.55, max: 0.55, r: 170 * s + 30 });
    this.glows.push({ x, y, hue: 15, life: 0.7, max: 0.7, r: 220 * s + 40 });

    // 2) layered fireballs — 1 big core + chaotic satellites (biased upward, rolling)
    this.spawnFireball(x, y, rnd(-12, 12), rnd(-28, -8), 36 * s, 0.65, 1);
    const sats = Math.round((hot ? 7 : 6) * s);
    for (let i = 0; i < sats; i++) {
      const a = rnd(0, TAU);
      const d = rnd(8, 30) * s;
      this.spawnFireball(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d * 0.7 - 6 * s,
        Math.cos(a) * rnd(25, 95) * s,
        Math.sin(a) * rnd(25, 90) * s - 55 * s,
        rnd(13, 23) * s,
        rnd(0.45, 0.78),
        rnd(0.5, 0.9)
      );
    }

    // 3) flame tongues — chaotic, upward-rolling, no twinkle
    const n = Math.round((hot ? 48 : 44) * s);
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU);
      const upward = Math.sin(a) < 0 ? 1.25 : 0.7;
      const sp = rnd(2, hot ? 8.5 : 7.5) * s * upward;
      const white = Math.random() < 0.2;
      this.spawn(x + rnd(-6, 6), y + rnd(-4, 4), Math.cos(a) * sp, Math.sin(a) * sp - 1.2 * s, {
        life: rnd(0.3, 0.7),
        size: rnd(1.8, 3.4),
        h: white ? rnd(48, 55) : rnd(10, 42),
        s: white ? 70 : 100,
        l: white ? 88 : rnd(54, 66),
        g: 0.03,
        d: 0.93,
        tr: 2.2,
        tw: false,
      });
    }

    // 4) RPG shaped-charge jet — searing lance punching upward
    if (hot) {
      for (let i = 0; i < Math.round(28 * s); i++) {
        const a = -Math.PI / 2 + rnd(-0.3, 0.3);
        const sp = rnd(6, 14) * s;
        const core = i % 3 === 0;
        this.spawn(x + rnd(-5, 5), y - 4, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.35, 0.75),
          size: rnd(1.5, 2.7),
          h: core ? 195 : rnd(32, 52),
          s: core ? 75 : 100,
          l: core ? 90 : 70,
          g: 0.015,
          d: 0.94,
          tr: 3.4,
          tw: false,
        });
      }
      // jet fireballs riding the lance
      for (let i = 0; i < 3; i++) {
        this.spawnFireball(x + rnd(-6, 6), y - 18 - i * 22 * s, rnd(-8, 8), rnd(-90, -50), 15 * s, 0.5, 0.85);
      }
    }

    // 5) thick dark smoke — billowing, long-lived (the real "shockwave" is dust)
    const ns = Math.round(20 * s);
    for (let i = 0; i < ns; i++) {
      const a = rnd(0, TAU);
      const sp = rnd(14, 70) * s;
      this.spawnSmoke(
        x + Math.cos(a) * rnd(6, 20) * s,
        y + Math.sin(a) * rnd(6, 16) * s,
        Math.cos(a) * sp,
        Math.sin(a) * sp - 55 * s,
        rnd(10, 20) * s,
        rnd(1.2, 2.3),
        rnd(0.45, 1)
      );
    }
    // low dust wall rolling outward along the ground
    for (let i = 0; i < Math.round(8 * s); i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      this.spawnSmoke(
        x + side * rnd(10, 40) * s,
        y + rnd(6, 22) * s,
        side * rnd(50, 130) * s,
        rnd(-18, 6),
        rnd(11, 19) * s,
        rnd(1.0, 1.8),
        0.35
      );
    }

    // 6) shrapnel + burning dirt clods (real physics debris)
    this.spawnShrapnel(x, y, Math.round(10 * s), s, hot);

    // 7) heavy embers with gravity (no crackle pops, no twinkle)
    for (let i = 0; i < Math.round(22 * s); i++) {
      const a = rnd(0, TAU);
      const sp = rnd(2.5, 8) * s;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.45, 1.0),
        size: rnd(1.1, 1.9),
        h: rnd(28, 48),
        s: 100,
        l: 62,
        g: 0.2,
        d: 0.955,
        tr: 2.8,
        tw: false,
        crackle: false,
      });
    }

    // 8) delayed secondary cook-off pops + rising smoke column
    this.at(0.14, () => {
      this.spawnFireball(x + rnd(-14, 14), y + rnd(-10, 10), rnd(-10, 10), rnd(-50, -20), 18 * s, 0.45, 0.6);
      for (let i = 0; i < Math.round(10 * s); i++) {
        const a = rnd(0, TAU);
        const sp = rnd(1.5, 5) * s;
        this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.3, 0.6),
          size: rnd(1.5, 2.6),
          h: rnd(15, 45),
          s: 100,
          l: 60,
          g: 0.04,
          d: 0.94,
          tw: false,
        });
      }
      this.host.shake(3.5 * s);
    });
    this.at(0.3, () => {
      for (let i = 0; i < Math.round(6 * s); i++) {
        this.spawnSmoke(x + rnd(-18, 18), y + rnd(-8, 14), rnd(-12, 12), rnd(-70, -30), rnd(12, 20) * s, rnd(1.4, 2.2), rnd(0.6, 1));
      }
    });

    this.host.shake((hot ? 7 : 6.5) * s);
    this.flash = Math.max(this.flash, 0.32 * Math.min(s, 1.3));
    this.flashHue = hot ? 30 : 36;
    this.cannonPulse = Math.min(1, this.cannonPulse + 0.6 * s);
  }

  spawnShrapnel(x: number, y: number, n: number, scale: number, hot: boolean) {
    for (let i = 0; i < n; i++) {
      const shard = Math.random() < 0.45;
      const a = rnd(0, TAU);
      const sp = rnd(180, hot ? 520 : 440) * scale;
      this.debris.push({
        kind: shard ? "shard" : "clod",
        x: x + rnd(-4, 4),
        y: y + rnd(-4, 4),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 160 * scale,
        rot: rnd(0, TAU),
        vr: rnd(-14, 14),
        hue: shard ? rnd(30, 50) : rnd(18, 32),
        a0: rnd(2.5, 5.5) * scale,
        life: rnd(0.9, 1.7),
        hot: shard ? 1 : 0.4,
      });
    }
  }

  spawnBubble(x: number, y: number, vx: number, vy: number, r: number) {
    if (this.bubbles.length > 320) return;
    const life = rnd(0.7, 1.6);
    this.bubbles.push({ x, y, vx, vy, life, max: life, r });
  }

  /** Slide 2 `drawBubbles()`. */
  drawBubbles(c: CanvasRenderingContext2D) {
    const ctx = c;
    ctx.save();
    const inheritedAlpha = ctx.globalAlpha;
    for (const b of this.bubbles) {
      const k = Math.max(0, b.life / b.max);
      const a = Math.min(1, k * 2) * 0.8;
      const sprite = bubbleSprite(ctx, b.r);
      if (sprite) {
        ctx.globalAlpha = inheritedAlpha * a;
        const { canvas, half } = sprite;
        ctx.drawImage(canvas, b.x - half, b.y - half, half * 2, half * 2);
      } else {
        // Canvas-less tools and restricted browsers retain the original art.
        ctx.globalAlpha = inheritedAlpha;
        ctx.strokeStyle = `rgba(180,230,255,${a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke();
        ctx.fillStyle = `rgba(220,245,255,${a * 0.35})`;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.beginPath(); ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, Math.max(0.6, b.r * 0.22), 0, TAU); ctx.fill();
      }
    }
    ctx.restore();
  }

  /** Slide 2 `drawDebris()`, minus the wheel wedges slide 1 breaks itself. */
  drawDebris(c: CanvasRenderingContext2D) {
    const ctx = c;
    for (const d of this.debris) {
      const a = Math.min(1, d.life / 0.6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      if (d.kind === "rocket") {
        if (this.weapon === "blackhole") {
          drawOrb(ctx, d.hue, 11, this.time, d.hue);
        } else if (this.weapon === "shark") {
          // tumbling shark, mouth agape
          ctx.translate(-36, 0);
          drawShark(ctx, d.hue, 0.7, this.time, d.hue * 0.3, 0);
        } else if (this.weapon === "bamboo") {
          drawStone(ctx, d.hue, 13, this.time, d.hue * 0.5, 0);
        } else if (this.weapon === "soaker") {
          ctx.rotate(-Math.PI / 2);
          drawDrop(ctx, d.hue, 11.5, this.time, d.hue * 0.5, 0);
        } else if (this.weapon === "rainbow") {
          ctx.translate(-32, 0);
          drawRainbowBolt(ctx, this.time, d.hue * 0.4, 0, 1);
        } else if (this.weapon === "bazooka") {
          ctx.translate(-29, 0);
          drawBazookaShell(ctx, d.hue, this.time, d.hue * 0.5, 0, 0.35);
        } else if (this.weapon === "rpg") {
          ctx.translate(-30, 0);
          drawRpgGrenade(ctx, d.hue, this.time, d.hue * 0.5, 0, 0.35);
        } else {
          ctx.translate(-PL / 2, 0);
          drawRocketShape(ctx, d.hue);
        }
      } else if (d.kind === "shard") {
        // glowing-hot twisted shrapnel
        const s = d.a0 || 4;
        const hot = d.hot ?? 0;
        ctx.fillStyle = hot > 0.4 ? `rgba(255,${120 + Math.round(hot * 80)},60,1)` : "#3a3a40";
        ctx.strokeStyle = "rgba(10,10,10,0.9)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.6);
        ctx.lineTo(s * 0.2, -s * 1.1);
        ctx.lineTo(s, s * 0.3);
        ctx.lineTo(-s * 0.3, s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (hot > 0.15) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = `rgba(255,170,70,${hot * 0.7})`;
          ctx.beginPath();
          ctx.arc(0, 0, s * 1.6, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
      } else if (d.kind === "clod") {
        // burning dirt clod
        const s = d.a0 || 4;
        const hot = d.hot ?? 0;
        ctx.fillStyle = hot > 0.3 ? "#5a3418" : "#3a2412";
        ctx.strokeStyle = "rgba(15,8,4,0.9)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.75, 0.3, 0, TAU);
        ctx.fill();
        ctx.stroke();
        if (hot > 0.2) {
          ctx.fillStyle = `rgba(255,130,40,${hot * 0.6})`;
          ctx.beginPath();
          ctx.arc(-s * 0.2, -s * 0.2, s * 0.45, 0, TAU);
          ctx.fill();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, d.a0, d.a0 + TAU / 10);
        ctx.closePath();
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
        if (this.weapon === "shark") {
          g.addColorStop(0, "#0e4a7d");
          g.addColorStop(1, "#062544");
        } else if (this.weapon === "bamboo") {
          g.addColorStop(0, "#6b4a22");
          g.addColorStop(1, "#3a2410");
        } else if (this.weapon === "soaker") {
          g.addColorStop(0, "#1a7ab5");
          g.addColorStop(1, "#0a4a75");
        } else if (this.weapon === "rainbow") {
          g.addColorStop(0, "#2a2058");
          g.addColorStop(1, "#100b2c");
        } else if (this.weapon === "bazooka") {
          g.addColorStop(0, "#4a5232");
          g.addColorStop(1, "#1c2012");
        } else if (this.weapon === "rpg") {
          g.addColorStop(0, "#5a3a26");
          g.addColorStop(1, "#201309");
        } else {
          g.addColorStop(0, "#3a2278");
          g.addColorStop(1, "#150a38");
        }
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle =
          this.weapon === "shark"
            ? "#c08a45"
            : this.weapon === "bamboo"
              ? "#8fd06a"
              : this.weapon === "soaker"
                ? "#ffd23e"
                : this.weapon === "rainbow"
                  ? hsl(d.hue, 100, 68)
                  : this.weapon === "bazooka"
                    ? "#9aa856"
                    : this.weapon === "rpg"
                      ? "#d88a4a"
                      : hsl(d.hue, 100, 65);
        ctx.lineWidth = 4;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /** Slide 2's impact cracks, drawn where the round actually landed. */
  drawBites(c: CanvasRenderingContext2D) {
    for (const m of this.biteMarks) {
      const k = Math.max(0, m.life / m.max);
      c.save();
      c.translate(m.x, m.y);
      c.lineCap = 'round';
      c.strokeStyle = m.kind === 'bamboo'
        ? `rgba(255,230,180,${0.9 * k})` : `rgba(255,255,255,${0.85 * k})`;
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, 0); c.lineTo(-9, 18);
      c.moveTo(0, 0); c.lineTo(3, 22);
      c.moveTo(0, 0); c.lineTo(11, 15);
      c.stroke();
      if (m.kind === 'bamboo') {
        c.fillStyle = `rgba(20,12,5,${0.9 * k})`;
        c.beginPath();
        c.ellipse(0, 2, 9, 7, 0, 0, TAU);
        c.fill();
        c.strokeStyle = `rgba(255,220,160,${0.7 * k})`;
        c.lineWidth = 1.5;
        c.stroke();
      }
      if (m.kind === 'shark') {
        c.strokeStyle = `rgba(180,240,255,${0.5 * k})`;
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(0, 0, 13, 0.2, Math.PI - 0.2);
        c.stroke();
      }
      c.restore();
    }
  }

  /**
   * Slide 2 `launchSky()`: a rocket climbs from the bottom of the screen on a
   * gravity arc and bursts overhead. Same launch window, same 700 px/s² pull.
   */
  launchSky(scale = 1.1) {
    const x0 = rnd(50, W - 50);
    const y0 = this.h - 110;
    const ty = rnd(70, 330);
    const tx = rnd(50, W - 50);
    const accel = 700;
    const vy = -Math.sqrt(2 * accel * (y0 - ty));
    const tt = -vy / accel;
    this.sky.push({
      x: x0,
      y: y0,
      vx: (tx - x0) / tt,
      vy,
      hue: rnd(0, 360),
      type: SKY_TYPES[Math.floor(Math.random() * SKY_TYPES.length)],
      scale,
    });
    slide2Sfx.skyLaunch();
  }

  /** Slide 2's ambient show, per weapon (bazooka and RPG never use the sky). */
  private ambientSky(dt: number) {
    const w = this.weapon;
    if (w === 'bazooka' || w === 'rpg' || w === 'blackhole') return;
    if (!this.ambient) {
      this.ambientT = 0.6;
      return;
    }
    this.ambientT -= dt;
    if (this.ambientT > 0) return;
    this.launchSky(rnd(0.9, 1.2));
    this.ambientT = w === 'firework' ? rnd(0.7, 1.5) : rnd(1.4, 2.4);
  }

  private stepSky(dt: number) {
    for (let i = this.sky.length - 1; i >= 0; i--) {
      const s = this.sky[i];
      s.vy += 700 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      for (let k = 0; k < 2; k++) {
        this.spawn(s.x, s.y, rnd(-0.5, 0.5), rnd(0.5, 2), {
          life: rnd(0.3, 0.7),
          size: 1.8,
          h: 38 + rnd(-10, 10),
          l: 70,
          g: 0.02,
          d: 0.94,
        });
      }
      if (s.vy > -40) {
        this.sky.splice(i, 1);
        this.burst(s.x, s.y, s.hue, s.type, s.scale, 30);
        slide2Sfx.boom(s.scale);
        this.host.shake(2);
      }
    }
  }

  /** The rocket heads (slide 2 draws them with the particles, on top). */
  drawSky(c: CanvasRenderingContext2D) {
    for (const s of this.sky) {
      c.fillStyle = 'rgba(255,230,160,0.95)';
      c.beginPath();
      c.arc(s.x, s.y, 2.6, 0, TAU);
      c.fill();
    }
  }

  update(dt: number) {
    this.time += dt;
    super.update(dt);
    this.ambientSky(dt);
    this.stepSky(dt);

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.x += b.vx * dt * 60;
      b.y += b.vy * dt * 60;
      b.vx += Math.sin((this.time + b.r) * 3) * dt * 0.35;
      b.life -= dt;
      if (b.life <= 0 || b.y < -12) this.bubbles.splice(i, 1);
    }

    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      const isFrag = d.kind === 'shard' || d.kind === 'clod';
      d.vy += (isFrag ? 1650 : 1300) * dt;
      if (isFrag) d.vx *= 1 - 0.35 * dt;
      for (const v of this.voids) {
        const dx = v.x - d.x;
        const dy = v.y - d.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 320 && dist > 8) {
          const s = (1 - dist / 320) * (v.life / v.max) * 2600 * dt;
          d.vx += (dx / dist) * s;
          d.vy += (dy / dist) * s;
        } else if (dist <= 8) {
          d.life = Math.min(d.life, 0.15);
        }
      }
      const spd = Math.hypot(d.vx, d.vy);
      if (this.voids.length > 0 && spd > 900) {
        d.vx = (d.vx / spd) * 900;
        d.vy = (d.vy / spd) * 900;
      }
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt;
      d.life -= dt;
      if (isFrag && d.hot !== undefined) {
        d.hot = Math.max(0, d.hot - dt * 1.8);
        if (d.y > this.h - 30 && d.vy > 0) {
          d.y = this.h - 30;
          d.vy *= -0.35;
          d.vx *= 0.7;
        }
      }
      if (d.life <= 0 || d.y > this.h + 100) this.debris.splice(i, 1);
    }

    for (let i = this.biteMarks.length - 1; i >= 0; i--) {
      this.biteMarks[i].life -= dt;
      if (this.biteMarks[i].life <= 0) this.biteMarks.splice(i, 1);
    }

    this.jolt = Math.max(0, this.jolt - dt * 6);
    this.pulse = Math.max(0, this.pulse - dt * 5);
    this.cannonPulse = Math.max(0, this.cannonPulse - dt * 3);
    this.aquaPulse = Math.max(0, this.aquaPulse - dt * 3);
    this.rainbowPulse = Math.max(0, this.rainbowPulse - dt * 3);
    this.voidPulse = Math.max(0, this.voidPulse - dt * 3);
  }

  draw(c: CanvasRenderingContext2D, time: number) {
    super.draw(c, time);
    withSplinterClip(c, () => {
      this.drawBubbles(c);
      this.drawDebris(c);
      this.drawBites(c);
    });
  }
}

/**
 * Slide 2 `ammoHue()` — the colour each loaded round gets. Every gun has its
 * own spread, which is why a slide-2 magazine cycles hues shot by shot.
 */
export function twoAmmoHue(id: TwoWeapon, i: number, hueBase = 28): number {
  if (id === 'blackhole') return 215 + ((i * 53) % 105);
  if (id === 'shark') return 192 + ((i * 37) % 30);
  if (id === 'bamboo') return 20 + ((i * 29) % 40);
  if (id === 'soaker') return 190 + ((i * 23) % 25);
  if (id === 'rainbow') return (i * 47) % 360;
  if (id === 'bazooka') return [45, 90, 140, 200, 280, 0][i % 6];
  if (id === 'rpg') return [15, 45, 120, 190, 265, 320][i % 6];
  return (hueBase + i * 41) % 360;
}
