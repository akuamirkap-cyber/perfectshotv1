import { registerSlideAudio } from './slideAudioBridge';
import { traceBossSegment } from './bossRaycast';
/**
 * Slide-9 (`games/game-6` / `Weapon Lab`) runtime for slide 1.
 *
 * Nothing is redrawn here. Slide 9's own `Weapon` objects run on slide 1:
 * `fire()` pushes the real slide-9 `Bullet`s and `Beam`s (they carry their own
 * flight particles, trails, impact bursts and sounds), `drawMark()` paints the
 * entry hole into the wheel, and `ambient()` keeps the hot rim breathing. All
 * of that was written against slide 9's `Game`/`GameAPI`; the shim below is
 * that object, forwarded to slide 1 through `NineHooks`.
 *
 * Slide 1 keeps the physics and the rules: it moves the carrier round, decides
 * when the wheel is hit, and scores it. Slide 9 owns everything you see and
 * hear — including its own synthesizer, which plays through `audio.play()`.
 */
import {
  audio as nineAudio,
  drawParticles,
  updateParticles,
  type Particle,
} from '../vendor/game-6/src/game/core';
import type { Beam, Bullet, GameAPI, Mark, Weapon as NineWeapon } from '../vendor/game-6/src/game/types';
import { NINE_SCALE, nineGunOrigin, nineWeapon, type NineId } from './setNineArt';
import { withSplinterClip } from './fx';

/** What slide 1 does for slide 9 (the parts slide 9 needs from its game). */
export interface NineHooks {
  /** Camera/wheel shake, in slide-9 units (0..34). */
  shake(amount: number): void;
  /** Full-screen colour flash (any CSS colour) + strength. */
  flash(color: string, strength: number): void;
  /** Brief slow motion after a heavy hit. */
  hitStop(seconds: number): void;
  /** Slide-1 wheel geometry, refreshed every frame. */
  wheel(): { x: number; y: number; R: number; angle: number };
}

const NO_HOOKS: NineHooks = {
  shake: () => {},
  flash: () => {},
  hitStop: () => {},
  wheel: () => ({ x: 0, y: 0, R: 0, angle: 0 }),
};

/**
 * How fast slide 1's carrier crosses the field for a slide-9 instant beam
 * (rail, phaser, proton stream, heat-ray): ~22 ms to the wheel, so the score
 * and the entry hole land with the beam's own impact.
 */
export const NINE_BEAM_SPEED = 9500;

let nineVolume = 1;

/** Slide 9's muted switch, so slide 1's UI can silence the ported guns too. */
export function setNineMuted(muted: boolean) {
  nineAudio.muted = muted;
  if (nineAudio.master) nineAudio.master.gain.value = muted ? 0 : 0.92 * nineVolume;
}

export function setNineVolume(v: number) {
  nineVolume = Math.max(0, Math.min(1, v));
  if (nineAudio.master) nineAudio.master.gain.value = nineAudio.muted ? 0 : 0.92 * nineVolume;
}

/** Slide 9's current mute state, so a temporary silence can be undone. */
export function nineMuted(): boolean {
  return nineAudio.muted;
}

const STATIC_HOLE_WEAPONS = new Set(['beretta92', 'ak47', 'mp5', 'rifle']);
const cooledMarkSprites = new WeakMap<Mark, HTMLCanvasElement | null>();

function getCooledMarkSprite(m: Mark, time: number): HTMLCanvasElement | null {
  const existing = cooledMarkSprites.get(m);
  if (existing !== undefined) return existing;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    cooledMarkSprites.set(m, null);
    return null;
  }
  const cv = document.createElement('canvas');
  if (!(cv instanceof HTMLCanvasElement)) {
    cooledMarkSprites.set(m, null);
    return null;
  }
  const S = 40;
  const scale = 2;
  cv.width = S * scale;
  cv.height = S * scale;
  const c = cv.getContext('2d');
  if (!c) {
    cooledMarkSprites.set(m, null);
    return null;
  }
  c.scale(scale, scale);
  c.translate(S * 0.5, S * 0.5);
  m.weapon.drawMark(c, m, time);
  cooledMarkSprites.set(m, cv);
  return cv;
}

/** Slide 9's audio graph may only start after a user gesture. */
export function unlockNineAudio() {
  try {
    nineAudio.ensure();
  } catch {
    /* No AudioContext (tests / unsupported): the visuals still run. */
  }
}

export class SetNineFx implements GameAPI {
  /* ── slide-9 game geometry (mirrored from slide 1 every frame) ─────────── */
  cx = 210;
  cy = 0;
  wheelR = 0;
  rotation = 0;
  aim = -Math.PI / 2;
  floorY = 760;
  W = 420;
  H = 760;
  time = 0;

  /* ── slide-9's live world ─────────────────────────────────────────────── */
  particles: Particle[] = [];
  bullets: Bullet[] = [];
  beams: Beam[] = [];
  /** Entry holes slide 9 paints into the wheel (`drawMark` + `ambient`). */
  marks: Mark[] = [];
  /** Slide-9 `after()` timers, in seconds. */
  timers: { t: number; fn: () => void }[] = [];

  /** Rounds slide 1 already took from slide 9 (it carries their position). */
  private taken = new Set<Bullet>();
  /** Rounds slide 1 is carrying; their position comes from slide 1. */
  private carried = new Set<Bullet>();
  /**
   * The frame each carried round was last carried on. Slide 1 carries every
   * live round once per frame, so a round that missed a frame lost its carrier
   * without an impact (a coin, a stone, a cleared stage) and must go: slide 9
   * never flies a carried round, so it would hang frozen in the air.
   */
  private carriedAt = new Map<Bullet, number>();
  private tick = 0;
  /** Beams of the second barrel: their delayed impact stays silent too. */
  private quiet = new Set<Beam>();

  /**
   * Slide 9's wheel recoil (engine.ts `kick`): every hit shoves the wheel away
   * from the blow by `markSize * 11` px/s and a stiff spring (k 420, damping
   * 14) snaps it back. Slide 1 draws its wheel at this offset.
   */
  kick = { x: 0, y: 0, vx: 0, vy: 0 };

  weaponId: NineId = 'ak47';
  /** Slide-9 muzzle in slide-1 screen space (set before every shot). */
  gunX = 210;
  gunY = 575;
  scale = NINE_SCALE;
  /** Seconds since the hand last caught something (identity disc). */
  catchT = 9;
  shotsFired = 0;

  private hooks: NineHooks;

  constructor(hooks: NineHooks = NO_HOOKS) {
    this.hooks = hooks;
  }

  setHooks(hooks: NineHooks) {
    this.hooks = hooks;
  }

  /* ── GameAPI ──────────────────────────────────────────────────────────── */

  shake(amount: number) {
    this.hooks.shake(amount);
  }

  flash(color: string, strength: number) {
    this.hooks.flash(color, strength);
  }

  hitstop(seconds: number) {
    this.hooks.hitStop(seconds);
  }

  /**
   * Slide 9 resolves its own wheel hits through this. On slide 1 the carrier
   * round does that (and scores), so the ported weapon must not do it twice —
   * the beam still stops exactly on the rim because `hitscan` is real.
   */
  registerHit(x: number, y: number, weapon?: NineWeapon): boolean {
    // Slide 9's beams (and the disc's bounce) register their hit themselves:
    // the wheel recoils from that blow exactly as in slide 9's `registerHit`.
    this.wheelKick(x, y, weapon ?? nineWeapon(this.weaponId));
    return true;
  }

  /** Slide 9's wheel recoil from one blow at (x, y). */
  private wheelKick(x: number, y: number, w: NineWeapon) {
    const dir = Math.atan2(this.cy - y, this.cx - x);
    const imp = w.markSize * 11;
    this.kick.vx += Math.cos(dir) * imp;
    this.kick.vy += Math.sin(dir) * imp;
  }

  hitscan(x: number, y: number, angle: number) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const ink = (this.hooks.wheel() as { ink?: (x: number, y: number) => boolean }).ink;
    if (ink) {
      const hit = traceBossSegment(x, y, x + dx * 1600, y + dy * 1600, ink);
      return hit ? { hit: true, ...hit } : { hit: false, x: x + dx * 1600, y: y + dy * 1600, dist: 1600 };
    }
    const fx = x - this.cx;
    const fy = y - this.cy;
    const b = 2 * (fx * dx + fy * dy);
    // The beam meets the boss' silhouette in its own direction, not a circle.
    const rr = this.radiusAt(angle - this.rotation);
    const c = fx * fx + fy * fy - rr * rr;
    const disc = b * b - 4 * c;
    if (disc < 0) return { hit: false, x: x + dx * 1600, y: y + dy * 1600, dist: 1600 };
    const sq = Math.sqrt(disc);
    const t1 = (-b - sq) / 2;
    if (t1 < 0) return { hit: false, x: x + dx * 1600, y: y + dy * 1600, dist: 1600 };
    return { hit: true, x: x + dx * t1, y: y + dy * t1, dist: t1 };
  }

  handPulse() {
    this.catchT = 0;
  }

  /** Weapon-local coordinates -> slide-1 screen space, like slide 9's `toWorld`. */
  toWorld(lx: number, ly: number) {
    const origin = nineGunOrigin(this.weaponId, this.gunX, this.gunY, this.scale);
    return {
      x: origin.x + ly * this.scale,
      y: origin.y - lx * this.scale,
    };
  }

  after(sec: number, fn: () => void) {
    this.timers.push({ t: sec, fn });
  }

  /* ── slide-9's world ──────────────────────────────────────────────────── */

  /** Mirror slide 1's wheel into slide 9's coordinates. */
  syncWheel() {
    const w = this.hooks.wheel();
    this.cx = w.x;
    this.cy = w.y;
    this.wheelR = w.R;
    this.rotation = w.angle;
  }

  /** Start a weapon: a different gun starts from a clean layer. */
  selectWeapon(id: NineId) {
    if (this.weaponId !== id) {
      this.particles.length = 0;
      this.bullets.length = 0;
      this.beams.length = 0;
      this.marks.length = 0;
      this.timers.length = 0;
      this.taken.clear();
      this.carried.clear();
      this.carriedAt.clear();
      this.quiet.clear();
      this.catchT = 9;
      this.shotsFired = 0;
    }
    this.weaponId = id;
  }

  /** Slide 9's own trigger: its muzzle FX, sound, shake and projectile. */
  fire(x: number, y: number, angle: number, charge = 0) {
    const w = nineWeapon(this.weaponId);
    this.gunX = x;
    this.gunY = y;
    this.aim = angle;
    this.shotsFired++;
    w.fire(this, x, y, angle, charge);
  }

  /** The second barrel: same recipe, and even its delayed beam impact is mute. */
  fireQuiet(x: number, y: number, angle: number, charge = 0) {
    const before = this.beams.length;
    const was = nineAudio.muted;
    nineAudio.muted = true;
    try {
      this.fire(x, y, angle, charge);
    } finally {
      nineAudio.muted = was;
    }
    for (const bm of this.beams.slice(before)) this.quiet.add(bm);
  }

  /** Seconds until slide 9's newest beam strikes the wheel (0 = instant). */
  beamDelay(): number {
    const bm = this.beams[this.beams.length - 1];
    return bm ? Math.max(0, bm.impactDelay ?? 0) : 0;
  }

  /**
   * The rounds slide 9 has created but nobody carries yet. Slide 9 releases
   * some shots later than the trigger (charged staffs, drum bursts), so slide 1
   * calls this again on the frames that follow a shot.
   */
  takeShots(): Bullet[] {
    if (this.bullets.length === this.taken.size) return [];
    const made = this.bullets.filter((b) => !this.taken.has(b));
    // Only hand the round over here: `carry()` is what makes it slide 1's. An
    // extra round of a volley must keep flying on slide 9's own physics
    // instead of freezing in place at the muzzle.
    for (const b of made) this.taken.add(b);
    return made;
  }

  /**
   * The star pickup wipes the screen.
   *
   * A carried round is never advanced by slide 9 (slide 1 owns its position),
   * so once slide 1 drops its carriers the round would keep sitting in
   * `bullets` — painted where it froze — until its own life ran out.
   */
  sweepCarried() {
    if (!this.carried.size) return;
    // Mutated in place: slide 9's own `update`/`draw` walk this same array.
    const keep = this.bullets.filter((b) => !this.carried.has(b));
    this.bullets.length = 0;
    this.bullets.push(...keep);
    for (const b of this.carried) this.taken.delete(b);
    this.carried.clear();
    this.carriedAt.clear();
  }

  /**
   * Slide-9's impact, exactly as its engine resolves a round on the wheel:
   * the weapon's own burst at the rim — aimed along the round's *flight*
   * (`b.angle`), so its sparks fan back towards the shooter — the wheel's
   * recoil, and the entry hole it paints (`drawMark`). The round itself is
   * spent, except the identity disc: it reflects off the rim (`collide`),
   * leaves its marker and flies home on slide 9's own physics.
   */
  impact(hx: number, hy: number, local: number, round?: Bullet, travel = round ? round.angle : this.aim) {
    const w = nineWeapon(this.weaponId);
    if (round?.collide) {
      const n = Math.atan2(hy - this.cy, hx - this.cx);
      this.carried.delete(round);
      this.carriedAt.delete(round);
      round.collide(round, this, { x: hx, y: hy, nx: Math.cos(n), ny: Math.sin(n) });
    } else {
      w.onImpact?.(this, hx, hy, travel);
      this.wheelKick(hx, hy, w);
      if (round) this.drop(round);
    }
    this.addMark(w, local, 0);
  }

  /**
   * A beam's hit, once slide 1's carrier has scored it. Slide 9 bursts the
   * beam itself when it strikes (`impactDelay`) and its `registerHit` already
   * moved the wheel, so only the entry hole is left — as old as the beam, so
   * a scorch that fades in after the flame arrives keeps slide 9's timing.
   */
  markBeam(local: number) {
    const w = nineWeapon(this.weaponId);
    let age = 0;
    for (let i = this.beams.length - 1; i >= 0; i--) {
      if (this.beams[i].weapon === w) { age = this.beams[i].age; break; }
    }
    this.addMark(w, local, age);
  }

  /** The silhouette's radius in a wheel-local direction (the wheel's R otherwise). */
  private radiusAt(a: number) {
    const w = this.hooks.wheel() as { radiusAt?: (a: number) => number };
    return w.radiusAt ? w.radiusAt(a) : this.wheelR;
  }

  private addMark(w: NineWeapon, local: number, age: number) {
    this.marks.push({
      weapon: w,
      a: local,
      // A mark burns where the arrow actually landed: on the boss that is the
      // drawing's own radius for this angle, never the wheel's circle.
      r: this.radiusAt(local),
      size: w.markSize,
      age,
      seed: Math.random() * 1000,
    });
  }

  /** A carried round is spent: gone from slide 9's world at once. */
  private drop(b: Bullet) {
    const i = this.bullets.indexOf(b);
    if (i >= 0) this.bullets.splice(i, 1);
    this.taken.delete(b);
    this.carried.delete(b);
    this.carriedAt.delete(b);
  }

  /** A round that bounced off an occupied spot still bursts, like slide 9's. */
  block(hx: number, hy: number, round?: Bullet) {
    nineWeapon(this.weaponId).onImpact?.(this, hx, hy, round ? round.angle : this.aim);
    if (round) this.drop(round);
  }

  /** True while slide 9 still has something to draw or animate. */
  get busy(): boolean {
    return this.particles.length > 0 || this.bullets.length > 0 || this.beams.length > 0
      || this.marks.length > 0 || this.timers.length > 0
      || Math.abs(this.kick.x) + Math.abs(this.kick.y) + Math.abs(this.kick.vx) + Math.abs(this.kick.vy) > 0.05;
  }

  clear() {
    this.particles.length = 0;
    this.bullets.length = 0;
    this.beams.length = 0;
    this.marks.length = 0;
    this.timers.length = 0;
    this.taken.clear();
    this.carried.clear();
    this.carriedAt.clear();
    this.quiet.clear();
    this.catchT = 9;
    this.kick = { x: 0, y: 0, vx: 0, vy: 0 };
  }

  /**
   * One frame of slide-9 time: timers, particles, rounds, beams, entry holes.
   *
   * `dt` is slide 9's world step (12 % of a frame during a hit-stop), `raw`
   * the real frame: like slide 9's own `update`, its timers (ejected brass,
   * delayed bolts), its wheel spring and its hand clock never slow down.
   */
  update(dt: number, raw = dt) {
    this.time += raw;
    this.catchT += raw;
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const t = this.timers[i];
      t.t -= raw;
      if (t.t <= 0) {
        this.timers.splice(i, 1);
        t.fn();
      }
    }
    const k = this.kick;
    k.vx += (-420 * k.x - 14 * k.vx) * raw;
    k.vy += (-420 * k.y - 14 * k.vy) * raw;
    k.x += k.vx * raw;
    k.y += k.vy * raw;
    if (Math.abs(k.x) + Math.abs(k.y) + Math.abs(k.vx) + Math.abs(k.vy) < 0.01) k.x = k.y = k.vx = k.vy = 0;
    // A carried round whose carrier vanished without an impact goes (see
    // `carriedAt`): slide 1 carried every live one earlier this frame.
    for (const [b, at] of this.carriedAt) {
      if (at < this.tick) this.drop(b);
    }
    this.tick++;
    updateParticles(this.particles, dt);
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.age += dt;
      if (!this.carried.has(b)) {
        // Rounds slide 1 is not carrying (extra pellets of a burst) fly on
        // their own, exactly like slide 9 moves them.
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (!b.spin) b.angle = Math.atan2(b.vy, b.vx);
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > b.trailMax) b.trail.shift();
      }
      b.update?.(b, dt, this);
      if (b.age > b.life || b.dead || b.x < -400 || b.x > this.W + 400
        || b.y < -800 || b.y > this.H + 600) {
        this.bullets.splice(i, 1);
        this.carried.delete(b);
        this.taken.delete(b);
      }
    }
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const bm = this.beams[i];
      // Slide 9's engine bursts a beam on the wheel once it has travelled
      // (`impactDelay`): the dragon's flame lands late, the rail at once.
      if (bm.hit && !bm.impacted && bm.age >= (bm.impactDelay ?? 0)) {
        bm.impacted = true;
        if (this.quiet.has(bm)) {
          const was = nineAudio.muted;
          nineAudio.muted = true;
          try {
            bm.weapon.onImpact?.(this, bm.hitX, bm.hitY, bm.angle);
          } finally {
            nineAudio.muted = was;
          }
        } else bm.weapon.onImpact?.(this, bm.hitX, bm.hitY, bm.angle);
      }
      bm.age += dt;
      bm.tick?.(bm, dt, this);
      if (bm.age >= bm.duration) {
        this.beams.splice(i, 1);
        this.quiet.delete(bm);
      }
    }
    for (const m of this.marks) {
      m.age += dt;
      if (m.weapon.ambient && this.wheelR > 0) {
        // The hot rim breathes where the wheel is drawn: kick included.
        const wa = this.rotation + m.a;
        m.weapon.ambient(
          this,
          this.cx + this.kick.x + Math.cos(wa) * m.r,
          this.cy + this.kick.y + Math.sin(wa) * m.r,
          wa,
          m,
          dt,
        );
      }
    }
  }

  /**
   * Beams, then every particle, then the free rounds — slide 9's own render
   * order (its rounds sit on top of their sparks). Rounds slide 1 carries are
   * painted by slide 1 right after this (`drawShot`), with its size buffs;
   * painting them here too doubled every round and its glow. Each piece is
   * guarded: one weapon's renderer throwing must never blank slide 1's frame.
   */
  draw(ctx: CanvasRenderingContext2D) {
    for (const bm of this.beams) {
      try {
        bm.draw(ctx, bm, this.time);
      } catch {
        /* ignore */
      }
    }
    // Splinters belong to the target they bit into: on a boss stage the game
    // hands over that drawing's own outline, and the debris stops on it.
    withSplinterClip(ctx, () => drawParticles(ctx, this.particles));
    for (const b of this.bullets) {
      if (this.carried.has(b)) continue;
      ctx.save();
      try {
        b.draw(ctx, b, this.time);
      } catch {
        /* ignore */
      }
      ctx.restore();
    }
  }

  /** Is slide 1 carrying this round right now? */
  isCarried(b: Bullet): boolean {
    return this.carried.has(b);
  }

  /** How many rounds of the current weapon are still out (slide 9's `out`). */
  out(): number {
    const w = nineWeapon(this.weaponId);
    let n = 0;
    for (const b of this.bullets) if (b.weapon === w && !b.dead) n++;
    return n;
  }

  /** Entry holes, drawn from the wheel centre with the wheel's own spin. */
  /** One round of slide 9's own art (slide 1 paints carried rounds itself). */
  drawShot(ctx: CanvasRenderingContext2D, b: Bullet) {
    ctx.save();
    try {
      b.draw(ctx, b, this.time);
    } catch {
      /* a single round's art must not break the frame */
    }
    ctx.restore();
  }

  drawWheel(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, rot: number) {
    if (!this.marks.length) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    for (const m of this.marks) {
      ctx.save();
      ctx.rotate(m.a);
      ctx.translate(m.r || radius, 0);
      if (m.age > 0.76 && STATIC_HOLE_WEAPONS.has(m.weapon.id)) {
        const sp = getCooledMarkSprite(m, this.time);
        if (sp) ctx.drawImage(sp, -20, -20, 40, 40);
        else m.weapon.drawMark(ctx, m, this.time);
      } else {
        m.weapon.drawMark(ctx, m, this.time);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Called by slide 1 whenever it moves a carried round.
   *
   * Slide 9 samples a trail once per 60 Hz frame, so its tail is a fixed
   * *pixel* length for that weapon (`trailMax * speed / 60`). Slide 1 flies the
   * same round at its own (often much faster) game speed, so a single sample
   * per frame left long straight segments behind the bullet - the frozen
   * tracer look. Resampling at slide 9's own spacing keeps the tail identical
   * to slide 9 at any frame rate and any slide-1 speed buff.
   */
  carry(b: Bullet, x: number, y: number, angle: number) {
    // Slide 9's tail is a *pixel* length: `trailMax` samples, one per 60 Hz
    // frame, at the round's own speed. Slide 1 can fly the same round much
    // faster, which stretched that 9-point polyline into a long, chunky bar -
    // the "frozen tracer" look. Sample the flown path at a fine, fixed pixel
    // step and keep exactly slide 9's tail length, so the comet is the same
    // size as on slide 9 and its width taper is smooth at any speed and any
    // frame rate.
    const v = Math.hypot(b.vx, b.vy) || 1;
    const step = 6;
    const maxLen = Math.max(24, (Math.max(2, b.trailMax - 1) * v) / 60);
    const dist = Math.hypot(x - b.x, y - b.y);
    const n = Math.max(1, Math.min(120, Math.ceil(dist / step)));
    for (let i = 1; i < n; i++) {
      const k = i / n;
      b.trail.push({ x: b.x + (x - b.x) * k, y: b.y + (y - b.y) * k });
    }
    b.trail.push({ x, y });
    // Trim the oldest points until the tail is slide 9's own length again.
    while (b.trail.length > 2) {
      const p = b.trail[0];
      if (Math.hypot(x - p.x, y - p.y) > maxLen) b.trail.shift();
      else break;
    }
    if (b.trail.length > 140) b.trail.splice(0, b.trail.length - 140);
    b.x = x;
    b.y = y;
    b.angle = angle;
    // From now on slide 1 owns this round: slide 9 must not fly it again.
    this.taken.add(b);
    this.carried.add(b);
    this.carriedAt.set(b, this.tick);
  }
}

/**
 * A still of the slide-9 round at `age` seconds after it left the muzzle, used
 * by the picker's effect card so "Set 9" shows the real slide-9 projectile or
 * beam — slide 9's own `draw()` for that weapon.
 */
export function drawSetNineShotShell(
  c: CanvasRenderingContext2D,
  id: NineId,
  age: number,
  travel = 22,
) {
  const fx = new SetNineFx();
  fx.weaponId = id;
  fx.cx = 0;
  fx.cy = -120;
  fx.wheelR = 78;
  fx.gunX = 0;
  fx.gunY = 0;
  fx.fire(0, 0, -Math.PI / 2, 0);
  for (let i = 0; i < 40 && !fx.bullets.length && !fx.beams.length; i++) fx.update(1 / 60);
  const b = fx.bullets[0];
  if (b) {
    b.x = 0;
    b.y = -travel;
    b.age = age;
    b.trail = [{ x: 0, y: 2 }, { x: 0, y: -travel * 0.6 }, { x: 0, y: -travel }];
    c.save();
    b.draw(c, b, age);
    c.restore();
    return;
  }
  const bm = fx.beams[0];
  if (bm) {
    bm.age = age;
    c.save();
    bm.draw(c, bm, age);
    c.restore();
  }
}

// Slide 1's master mute/volume drives this bus as soon as the module loads.
registerSlideAudio((muted, volume) => {
    setNineMuted(muted); setNineVolume(volume);
});
