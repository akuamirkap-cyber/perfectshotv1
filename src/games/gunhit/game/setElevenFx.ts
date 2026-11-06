import { registerSlideAudio } from './slideAudioBridge';
import { traceBossSegment } from './bossRaycast';
/**
 * Slide-11 (`games/game-8` / Knife-Hit Arsenal FX) runtime for slide 1.
 *
 * Slide 11's own game object hosts everything visual: its particle system, its
 * `Fx` list, its `Embed` wheel marks and its `SoundEngine`. This module owns a
 * real slide-11 `Game` and gives slide 1 the same five calls slide 7 and slide 9
 * got — fire, take the round, follow it, report the hit, draw — while slide 1
 * keeps the rules (flight, hit test, score, ammo).
 */
import { Game } from '../vendor/game-8/src/game/engine';
import type { Embed, Proj, Weapon, WeaponState } from '../vendor/game-8/src/game/types';
import { clamp, drawGlow, rand, TAU } from '../vendor/game-8/src/game/util';
import { restElevenState, elevenScale, elevenWeapon, type ElevenId } from './setElevenArt';
import { withSplinterClip } from './fx';

/** What slide 1 does for slide 11. */
export interface ElevenHooks {
  shake(amount: number): void;
  flash(color: string, strength: number): void;
  hitStop(seconds: number): void;
  /** Optional visual-only yellow Plasma Gun burst for the Buster's tap. */
  busterPlasmaImpact?(x: number, y: number): void;
  /**
   * Slide 1's wheel; `dir` is the way it spins right now (+1 / -1). `marks`
   * is false on a stage with no wheel face to mark (the rock, the chest, the
   * bonus ring): slide 7's entry holes have nothing to sit on there.
   */
  wheel(): { x: number; y: number; R: number; angle: number; dir?: number; marks?: boolean };
}

/** Slide 11's own wheel motion this frame, applied to slide 1's wheel. */
export interface ElevenWheelMotion {
  /** Shiver jitter + the hit kick, in px. */
  dx: number;
  dy: number;
  /** The hit squash. */
  sx: number;
  sy: number;
}

const STILL: ElevenWheelMotion = { dx: 0, dy: 0, sx: 1, sy: 1 };

/**
 * The shoulder caster's lock time: slide 11 fires its plasma burst by itself
 * once the three laser dots have converged for this long (`plasmacaster.ts`,
 * `PERIOD`).
 */
const CASTER_LOCK = 2.6;

/**
 * The rounds of a slide-7 volley its own wheel counts (`hit({ count })`), in
 * the order slide 1's barrels take them: the nano-swarm counts drones 6 and 0.
 */
const SCORING: Partial<Record<ElevenId, number[]>> = { 'nano-swarm': [6, 0] };

/** Slide-7 guns whose round leaves a moment after the trigger (the sword's swing: 0.115 s). */
const DELAYED_ROUND = new Set<ElevenId>(['energy-sword']);

const NO_HOOKS: ElevenHooks = {
  shake: () => {},
  flash: () => {},
  hitStop: () => {},
  wheel: () => ({ x: 0, y: 0, R: 0, angle: 0 }),
};

/** Slide 11's own master switch, so slide 1's mute button silences it too. */
let muted = false;
/** Live slide-11 sound engines; disposed game shells remove their own engine. */
const engines = new Set<Game['sfx']>();

function useEngine(sfx: Game['sfx']) {
  engines.add(sfx);
  // Slide 11 stores its mute switch in `localStorage` under `arsenal-mute`.
  // Whoever toggled sound on slide 11 last would otherwise leave every ported
  // gun silent on slide 1 forever — slide 1 owns the switch here.
  sfx.muted = muted;
  // …and slide 11's background music must never start over slide 1's game.
  sfx.musicOn = false;
  return sfx;
}

/** Slide 11's current mute state, so a temporary silence can be undone. */
export function elevenMuted(): boolean {
  return muted;
}

let elevenVolume = 1;

export function setElevenMuted(m: boolean) {
  muted = m;
  for (const sfx of engines) {
    try {
      sfx.muted = m;
      if (m) (sfx as unknown as { stopAll?: () => void }).stopAll?.();
      const node = (sfx as unknown as { master?: GainNode | null }).master;
      if (node) node.gain.value = m ? 0 : 0.94 * elevenVolume;
    } catch {
      /* an engine that was never unlocked has nothing to mute */
    }
  }
}

export function setElevenVolume(v: number) {
  elevenVolume = Math.max(0, Math.min(1, v));
  for (const sfx of engines) {
    try {
      const node = (sfx as unknown as { master?: GainNode | null }).master;
      if (node) node.gain.value = muted ? 0 : 0.94 * elevenVolume;
    } catch {
      /* ignore */
    }
  }
}

function sfxOf(fx: SetElevenFx): Game['sfx'] | null {
  const g = fx.raw;
  return g ? g.sfx : null;
}

/** Slide 11's audio graph may only start after a user gesture. */
export function unlockElevenAudio(fx: SetElevenFx) {
  const sfx = sfxOf(fx) as unknown as { ensure?: () => boolean; musicOn?: boolean; ac?: AudioContext } | null;
  if (!sfx) return;
  try {
    useEngine(sfx as unknown as Game['sfx']);
    if (sfx.ensure?.() && sfx.ac && sfx.ac.state === 'suspended') void sfx.ac.resume();
    setElevenMuted(muted);
  } catch {
    /* No AudioContext (tests / unsupported): the visuals still run. */
  }
}

/** A canvas for slide 11's own background/face sprites; headless-safe. */
function spriteCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
  try {
    return document.createElement('canvas');
  } catch {
    return null;
  }
}

/**
 * The Mega Buster's charge on slide 7's own clock: the seconds the trigger
 * has been held (`update()`: `ws.charge += dt`, up to `maxCharge`). Its mid
 * and full glow, its rising whine and the blast `playRelease()` picks come at
 * 0.45 s and 1.2 s, and slide 1 releases the same level then (`releaseScope()`
 * on the "Slide 7" card), so the shot that leaves is the one the gun showed.
 */
export function busterCharge(seconds: number, max = 1.6): number {
  if (!(seconds > 0)) return 0;
  return Math.min(max, seconds);
}

export class SetElevenFx {
  /* ── slide-1 geometry, mirrored every frame ──────────────────────────── */
  cx = 210;
  wy = 300;
  wheelR = 96;
  rotation = 0;
  gunX = 210;
  gunY = 575;

  /**
   * Slide 1's landscape gun pose: the barrel tilts and the whole gun slides.
   *
   * Slide 11 places every flash, spark and mark in its own upright frame, so on
   * a tilted gun those left the muzzle the gun *used* to have — an AK's burst
   * hung in mid-air a barrel's width away. Every point this module hands to
   * slide 1 now goes through the same rotation slide 1 draws the gun with.
   */
  private poseTilt = 0;
  /** The gun's own x on slide 1 (it slides away from the wheel's centre). */
  private poseGunX = 210;
  /** Slide 11's upright pivot: the wheel's centre on the muzzle line. */
  private poseX = 210;
  private poseY = 560;
  /** The muzzle flash being added right now, so its spikes can lean too. */
  private flashAnchor: { x: number; y: number } | null = null;

  /**
   * @param tilt  the barrel's lean (0 when upright)
   * @param gunX  where slide 1 draws the gun's own x
   * @param pivotX slide 11's centre (the gun sits here when upright)
   * @param pivotY the muzzle line, upright
   */
  setGunPose(tilt: number, gunX: number, pivotX: number, pivotY: number) {
    this.poseTilt = Number.isFinite(tilt) ? tilt : 0;
    this.poseGunX = Number.isFinite(gunX) ? gunX : 210;
    this.poseX = Number.isFinite(pivotX) ? pivotX : 210;
    this.poseY = Number.isFinite(pivotY) ? pivotY : 560;
  }

  /**
   * A slide-11 point, mapped onto the pose slide 1 draws the gun in: the gun
   * slides from its upright centre to `gunX` and the barrel leans by `tilt`.
   * Slide 11's own frame never slides — its `cx` is both gun and wheel — so the
   * pivot stays at the centre and the slide is a translation on top of it.
   */
  private posed(x: number, y: number): { x: number; y: number } {
    const tilt = this.poseTilt;
    const dx = x - this.poseX;
    const dy = y - this.poseY;
    if (!tilt) return { x: this.poseGunX + dx, y: this.poseY + dy };
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    return {
      x: this.poseGunX + dx * cos - dy * sin,
      y: this.poseY + dx * sin + dy * cos,
    };
  }

  /** Slide 11's live world (this is the real object slide 11 authored). */
  raw: Game | null = null;
  /** True once slide 11's world helpers have been bound to slide 1's scale. */
  private worldPatched = false;

  weaponId: ElevenId = 'ak47';
  state: WeaponState = restElevenState();
  /** Rounds slide 1 already took from slide 11. */
  private taken = new Set<Proj>();
  private carried = new Set<Proj>();
  /** The direction slide 1 is flying each carried round, for its art. */
  private aimAt = new WeakMap<Proj, number>();
  /**
   * The step each carried round was last carried in. Slide 1 hands every
   * carried round's position over once per frame (`carry()`); a round it no
   * longer carries (its carrier broke on the rock, opened the chest or left
   * the screen) is gone on slide 1, so it must leave slide 11's list too.
   */
  private carriedAt = new Map<Proj, number>();
  /** This frame's `flight()` of every carried round (rebuilt by `step()`). */
  private flights = new Map<Proj, { x: number; y: number; vx: number; vy: number; next?: Proj }>();
  /** False while slide 1 plays a stage without a wheel face (see `ElevenHooks.wheel`). */
  private marks = true;
  private tick = 0;
  shotsFired = 0;
  /**
   * The shoulder caster's lock has closed (slide 7's 2.6 s of holding): its
   * burst is due, and slide 1 fires it as its shot (see `fire()`).
   */
  casterLocked = false;
  /**
   * Seconds slide 1 has been charging the current shot (0 when it is not
   * charging — a press during the cooldown never charges on slide 1). The
   * Mega Buster's glow and whine follow it (`busterCharge()`).
   */
  chargeTime = 0;
  /** A channel / charge loop of slide 11's may be sounding right now. */
  private loopsLive = false;
  /** The shiver jitter rolled for the current frame (one roll per frame). */
  private motionAt = -1;
  private jitterX = 0;
  private jitterY = 0;
  private hooks: ElevenHooks;

  constructor(hooks: ElevenHooks = NO_HOOKS) {
    this.hooks = hooks;
    const canvas = spriteCanvas();
    if (!canvas) return;
    let g: Game | null = null;
    try {
      g = new Game(canvas, 1);
      useEngine(g.sfx);
      // Slide 11's constants become slide 1's, so every authored world point
      // (`g.lw`, `g.muzzlePos`, `g.aim`, embed angles) lands where slide 1 is.
      const raw = g as unknown as Record<string, unknown>;
      raw.W = 420;
      raw.H = 760;
      raw.state = 'play';
      raw.swapT = 1;
      (g.wheel as { scale: number }).scale = 1;
      this.raw = g;
      g.busterPlasmaImpact = (x, y) => {
        const emit = this.hooks.busterPlasmaImpact;
        if (!emit) return false;
        emit(x, y);
        return true;
      };
      this.muteOwnWheelBreak();
      this.forwardShake(g);
      this.adopt();
      this.selectWeapon('ak47');
    } catch {
      // Initialization can fail after the sound engine was registered.
      if (g) {
        engines.delete(g.sfx);
        g.sfx.dispose();
      }
      this.raw = null;
      /* No 2D canvas available: the runtime simply has nothing to draw. */
    }
  }

  /** A permanently removed host must not retain its hooks, canvas or audio. */
  dispose() {
    const g = this.raw;
    this.raw = null;
    this.hooks = NO_HOOKS;
    this.taken.clear();
    this.carried.clear();
    this.carriedAt.clear();
    this.flights.clear();
    if (!g) return;
    engines.delete(g.sfx);
    g.sfx.dispose();
  }

  setHooks(h: ElevenHooks) {
    this.hooks = h;
  }

  /* ── slide-1 geometry ─────────────────────────────────────────────────── */

  /** Mirror slide 1's wheel into slide 11's coordinates. */
  syncWheel() {
    const w = this.hooks.wheel();
    this.cx = w.x;
    this.wy = w.y;
    this.wheelR = w.R;
    this.rotation = w.angle;
    this.marks = w.marks !== false;
    // Slide 11 pushes its wheel the way it is turning (every hit's spin boost,
    // the chrono rifle's thaw), so it has to know which way slide 1's turns.
    if (this.raw && w.dir) this.raw.wheel.dir = w.dir < 0 ? -1 : 1;
    this.adopt();
  }

  /** The scale slide 1 actually draws this gun at. */
  scaleOf(): number {
    const w = this.raw?.weapon;
    return (w ? elevenScale(this.weaponId) * (w.scale ?? 1) : 1);
  }

  private adopt() {
    const g = this.raw;
    if (!g) return;
    const raw = g as unknown as Record<string, unknown>;
    const w = g.weapon;
    const sc = w ? elevenScale(this.weaponId) * (w.scale ?? 1) : 1;
    if (w && !this.worldPatched) {
      // Slide 11's own `lw()` / `muzzlePos()` scale by `weapon.scale` alone. On
      // slide 1 that gun is drawn at `elevenScale * scale`, so the muzzle, the
      // side vents and every spawn point have to use the same scale — or the
      // flash and the rounds appear somewhere other than the barrel.
      const self = this;
      const host = g as unknown as {
        lw(x: number, y: number): { x: number; y: number };
        muzzlePos(): { x: number; y: number };
      };
      host.lw = (x: number, y: number) => {
        const weapon = self.raw?.weapon;
        const k = self.scaleOf();
        const base = (self.raw as unknown as { baseY: number }).baseY;
        return self.posed(
          self.cx + (y - (weapon?.muzzleY ?? 0)) * k,
          base - (x - (self.state.recoil * (weapon?.kick ?? 0))) * k,
        );
      };
      host.muzzlePos = () => {
        const weapon = self.raw?.weapon;
        const k = self.scaleOf();
        const base = (self.raw as unknown as { baseY: number }).baseY;
        return self.posed(
          self.cx,
          base - ((weapon?.muzzle ?? 0) - self.state.recoil * (weapon?.kick ?? 0)) * k,
        );
      };
      // The muzzle burst's spikes are drawn pointing straight up, so a tilted
      // barrel has to turn the whole flash about its own muzzle as well.
      const flashHost = g as unknown as {
        muzzleFlash(x: number, y: number, o: Record<string, unknown>): void;
        addFx(f: Record<string, unknown>): void;
      };
      const addFx = flashHost.addFx.bind(g);
      const muzzleFlash = flashHost.muzzleFlash.bind(g);
      flashHost.addFx = (f: Record<string, unknown>) => {
        const anchor = self.flashAnchor;
        if (anchor && f && !f.poseAnchor) f.poseAnchor = { x: anchor.x, y: anchor.y };
        addFx(f);
      };
      flashHost.muzzleFlash = (x: number, y: number, o: Record<string, unknown>) => {
        const was = self.flashAnchor;
        self.flashAnchor = { x, y };
        try {
          muzzleFlash(x, y, o);
        } finally {
          self.flashAnchor = was;
        }
      };
      this.worldPatched = true;
    }
    raw.cx = this.cx;
    raw.wy0 = this.wy;
    // Slide 11 anchors the *stock* at `baseY` and puts the muzzle `muzzle * sc`
    // above it. Slide 1 anchors the *muzzle* line, so the base has to sit that
    // far below it — otherwise slide 11 spawns flashes and rounds above the gun.
    raw.baseY = this.gunY + (w ? w.muzzle * sc : 0);
    raw.R = this.wheelR;
    raw.W = 420;
    raw.H = 760;
    // The wheel's kick, squash and shiver stay slide 11's own: `step()` runs
    // their springs and slide 1 draws its wheel with them (`wheelMotion()`).
    // Only the spawn pop-in is pinned — slide 1 owns the stage flow.
    g.wheel.scale = 1;
    g.wheel.spawnT = 1;
    // Slide 11 stores its entry holes and aim in wheel-local angles, so its own
    // spin has to be slide 1's spin: otherwise every mark lands at the wrong
    // angle and slides around the rim with the wheel.
    g.wheel.angle = this.rotation;
    g.state = 'play';
  }

  /* ── slide-11's own weapon ────────────────────────────────────────────── */

  /** Start a weapon: a different gun starts from a clean layer. */
  selectWeapon(id: ElevenId) {
    const g = this.raw;
    if (!g) {
      this.weaponId = id;
      return;
    }
    const changed = this.weaponId !== id || g.weapon?.id !== id;
    this.weaponId = id;
    if (changed) {
      g.setWeapon(elevenWeapon(id));
      this.state = g.ws;
      g.parts.length = 0;
      g.fx.length = 0;
      g.projs.length = 0;
      g.embeds.length = 0;
      this.taken.clear();
      this.carried.clear();
      this.carriedAt.clear();
      this.flights.clear();
      this.shotsFired = 0;
    }
    this.adopt();
  }

  /**
   * Keep slide 11's weapon on the equipped gun from the very first frame.
   *
   * Only the trigger used to call `selectWeapon()`, so until the first shot the
   * layer ran its default AK-47: the gun's idle FX and its aiming overlay (the
   * sniper beam's laser sight, the shoulder caster's lock) belonged to the
   * wrong weapon. Slide 11's own `setWeapon()` also plays its "select" blip —
   * slide 1 never swaps a gun mid-stage, so this switch is silent.
   */
  follow(id: ElevenId) {
    const g = this.raw;
    if (!g || (this.weaponId === id && g.weapon?.id === id)) {
      this.weaponId = id;
      return;
    }
    const was = muted;
    setElevenMuted(true);
    try {
      this.selectWeapon(id);
    } finally {
      setElevenMuted(was);
    }
  }

  /** Start `id` from a clean slate, even when it is already the weapon. */
  restart(id: ElevenId) {
    const g = this.raw;
    this.weaponId = id;
    if (!g) return;
    g.setWeapon(elevenWeapon(id));
    this.state = g.ws;
    this.clear();
    this.adopt();
  }

  get weapon(): Weapon {
    return elevenWeapon(this.weaponId);
  }

  /** Slide-11's own trigger: muzzle FX, particles, sound and its real round. */
  fire(x: number, y: number, charge = 0) {
    const g = this.raw;
    if (!g) return;
    this.gunX = x;
    this.gunY = y;
    this.adopt();
    const w = g.weapon;
    const ws = g.ws;
    this.shotsFired++;
    ws.holding = false;
    if (w.channel) {
      // A beam only opens on the press (`press()`: its shortest burn); slide 7
      // never kicks, recharges or counts a channel gun there. The caster's
      // burst does all that itself, when its lock closes.
      if (w.id !== 'plasmacaster-mk2') ws.minHold = w.minHold ?? 0.25;
    } else {
      ws.cd = ws.cdMax = w.cooldown;
      ws.ready = 0;
      ws.recoil = 1;
      ws.fireT = 0;
      ws.shots++;
    }
    // Slide 7's trigger makes no sound of its own: its engine never calls
    // `playFire()` (the recipes in its sound file are never heard there). A
    // shot is heard where slide 7 voices it — the round's impact accent and
    // the wood thunk when it lands, a beam's hum, the buster's release blast.
    // Slide 1 used to play `playFire()` on every trigger on top of all that.
    if (w.onRelease) {
      ws.charge = charge;
      w.onRelease(g, ws, charge);
      try {
        g.sfx.playRelease(w.id, charge);
      } catch {
        /* audio is optional */
      }
    } else {
      w.fire?.(g, ws);
    }
    // The shoulder caster has no trigger of its own: slide 11 fires its plasma
    // burst by itself once its three-dot lock has closed (2.6 s of holding).
    // Slide 1 fires on release instead — so that lock was never reached, and
    // the caster's bolt, its muzzle burst and its plasma dome never appeared.
    // The release closes the lock and the burst leaves now, slide 11's own.
    if (w.id === 'plasmacaster-mk2' && w.channelUpdate) {
      this.casterLocked = false;
      const D = (ws.data ??= {}) as { cyc?: number; auto?: boolean; fired?: boolean };
      D.cyc = CASTER_LOCK;
      D.auto = true;
      D.fired = false;
      try {
        w.channelUpdate(g, ws, 0);
      } catch {
        /* a weapon's own burst must never break the frame */
      }
    }
    // No extra flash here: every slide-11 gun throws its own muzzle FX from its
    // own `fire()` (and its artwork lights up on `fireT`). A generic star used
    // to be stacked on top of all of them — even the bow and the acid spitter
    // — which slide 11 never shows.
  }

  /**
   * Slide 7's `press()` for the gun that does not fire on it (the shoulder
   * caster): a channel gun burns at least its `minHold` once pressed.
   */
  press() {
    const g = this.raw;
    if (!g) return;
    this.adopt();
    const w = g.weapon;
    if (w?.channel) this.state.minHold = w.minHold ?? 0.25;
  }

  /** How far the shoulder caster's three-dot lock has closed (0..1). */
  get casterLock(): number {
    if (this.weaponId !== 'plasmacaster-mk2') return 0;
    const D = this.state.data as { cyc?: number } | undefined;
    return clamp((D?.cyc ?? 0) / CASTER_LOCK);
  }

  /** Slide-11's muzzle in slide-1 screen space (the anchor slide 1 draws at). */
  muzzlePos() {
    return this.posed(this.gunX, this.gunY);
  }

  /**
   * The rounds slide 11 created but nobody carries yet. Some weapons release
   * their shot a frame later (bursts, drones), so slide 1 asks again for a few
   * frames after the trigger.
   */
  takeShots(): Proj[] {
    const g = this.raw;
    if (!g) return [];
    // A round that already landed is never a new shot. It used to be handed
    // over a second time when the next trigger came in the same frame it hit
    // (every auto-fire gun at full rate): the new carrier spawned right under
    // the wheel, ran into the bullet that had just stuck and ended the stage
    // with GAGAL! on the first burst.
    //
    // Only a round that has not flown yet is new (`age` 0: made by this
    // trigger, or by the sword's swing at the end of the last frame). A round
    // slide 7 released in flight — the prism's seven rays, the dragon's
    // fireballs — already flies on slide 7's own physics and is nobody's shot.
    const made = g.projs.filter((p) => p.alive && !this.taken.has(p) && p.age === 0);
    // Only hand the round over: it becomes slide 1's on `carry()`. A volley
    // slide 1 cannot carry (a twelve-orb burst, a later timer shot) must keep
    // flying on slide 11's own physics instead of freezing at the muzzle.
    for (const p of made) this.taken.add(p);
    return made;
  }

  /**
   * The star pickup wipes the screen.
   *
   * Slide 11 never advances a carried round (slide 1 owns its position), so a
   * round whose carrier was dropped stayed in `projs` and kept being painted —
   * frozen in mid-air — for the rest of the stage.
   */
  sweepCarried() {
    const g = this.raw;
    if (!g || !this.carried.size) return;
    // Mutated in place: other layers keep a reference to this array.
    const keep = g.projs.filter((p) => !this.carried.has(p));
    g.projs.length = 0;
    g.projs.push(...keep);
    for (const p of this.carried) this.taken.delete(p);
    this.carried.clear();
    this.carriedAt.clear();
    this.flights.clear();
  }

  /** True when slide 11 fired a projectile (as opposed to a channel/beam). */
  get hasRound(): boolean {
    return this.raw ? this.raw.projs.length > 0 : false;
  }

  /**
   * The rounds of one trigger that slide 1 scores — one per barrel.
   *
   * A volley is not one round per lane: slide 7's nano-swarm releases twelve
   * drones that spread, brake and home in on the wheel, and its own wheel
   * only counts drones 0 and 6. Slide 1 carries those (one per barrel); the
   * other drones keep flying, homing and biting on slide 7's own physics.
   * Fanning all twelve into straight, parallel lanes is what sent half the
   * swarm past the wheel and stuck a dozen hidden knives with one shot.
   */
  scoringRounds(made: Proj[], n: number): Proj[] {
    if (made.length <= n) return made.slice();
    const picked: Proj[] = [];
    for (const i of SCORING[this.weaponId] ?? []) {
      const r = made.find((p) => (p.data as { i?: number } | undefined)?.i === i);
      if (r && picked.length < n && !picked.includes(r)) picked.push(r);
    }
    for (const r of made) if (picked.length < n && !picked.includes(r)) picked.push(r);
    return picked;
  }

  /**
   * Put the round slide 1 scores on slide 1's barrel line `x`.
   *
   * On slide 7 nothing ever fails: a round may land a few degrees off (the
   * AK's random spread, the helix's alternating prongs, a drone's random spot
   * under the wheel) and the next one simply lands next to it. On slide 1 the
   * scored round is a knife — one landing on the last one is GAGAL! — so the
   * scored round lands where slide 1 aims, like every slide-1 shot does.
   * A homing drone keeps its whole slide-7 flight (spread, brake, homing,
   * swirl) and only its target spot is the barrel; a straight round leaves
   * straight up the barrel at its own slide-7 speed. The rest of a volley
   * keeps every bit of slide 7's randomness.
   *
   * Returns where the round's carrier starts on slide 1.
   */
  aimRound(p: Proj, x: number): number {
    const d = p.data as { tx?: number } | undefined;
    if (d && typeof d.tx === 'number') {
      d.tx = x;
      // The drone leaves its own barrel with its own few pixels of jitter.
      return x + (p.x - this.cx);
    }
    p.x = x;
    if (p.vy < 0) {
      p.vy = -Math.hypot(p.vx, p.vy);
      p.vx = 0;
    }
    return x;
  }

  /** The current gun releases its round a moment after the trigger (the sword's swing). */
  get roundDue(): boolean {
    return DELAYED_ROUND.has(this.weaponId);
  }

  /**
   * How slide 7's own update moved a carried round this frame: where it is
   * (after any jump its update made — a drone pulled back under the wheel)
   * and how fast it goes now (its spread, its acceleration, its homing and
   * swirl). Slide 1 moves the carrier exactly that way and only adds the hit
   * test, so every round flies slide 7's own path.
   *
   * `next` is set when the round burst in flight into new rounds and slide 1
   * should carry one of them from now on (the prism lance's central ray).
   */
  flight(p: Proj): { x: number; y: number; vx: number; vy: number; next?: Proj } | null {
    return this.flights.get(p) ?? null;
  }

  /**
   * The round of a mid-air burst that keeps the old round's line — the one
   * slide 1 goes on carrying (the prism's central ray). Slide 7's other rays
   * keep flying on their own.
   */
  private heirOf(p: Proj, kids: Proj[]): Proj | null {
    const a = Math.atan2(p.vy, p.vx);
    let best: Proj | null = null;
    let bestD = Infinity;
    for (const k of kids) {
      if (!k.alive || k.noCollide) continue;
      const d = Math.abs(Math.atan2(Math.sin(Math.atan2(k.vy, k.vx) - a), Math.cos(Math.atan2(k.vy, k.vx) - a)));
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    return best;
  }

  /** Slide 1 hands the carried round's real position back to slide 11. */
  carry(p: Proj, x: number, y: number, angle: number) {
    p.x = x;
    p.y = y;
    // Where slide 1 is actually flying this round. Slide 11's recipes paint
    // their tracers along the round's own velocity — straight up its frame — so
    // the art is turned onto this angle while it is painted (`drawShot`), and a
    // leaning barrel's tracer leans with it.
    this.aimAt.set(p, angle);
    if (!p.noCollide) p.data = { ...(p.data ?? {}), aim: angle };
    this.taken.add(p);
    this.carried.add(p);
    this.carriedAt.set(p, this.tick);
  }

  /**
   * Slide-11's own impact FX for a round that landed on slide 1's wheel.
   *
   * The round leaves slide 11's list right here, the same frame it lands —
   * exactly like slide 11's own update, which kills and drops a round in one
   * step. Left in the list until the next `step()`, the dead round flew one
   * more frame on slide 11's physics, crossed the rim again and ran `onHit` a
   * second time: two bursts, two entry holes and a doubled thunk for every
   * single hit.
   */
  impact(x: number, y: number, p?: Proj) {
    const g = this.raw;
    if (!g) return;
    const proj = p ?? null;
    if (proj) {
      // A round that already burst by itself in flight (the prism lance's
      // tracer splits into its seven rays before the wheel) has nothing left
      // to land: only slide 1's hit counts.
      if (proj.alive) {
        proj.alive = false;
        try {
          proj.onHit(g, x, y, proj);
        } catch {
          /* a weapon's own burst must never break the frame */
        }
      }
      if (proj.alive) {
        // The round turned round in its own `onHit` (the identity disc slices
        // the wheel and flies back to the arm, `noCollide`, then docks): slide
        // 1's carrier ends here, the round keeps flying on slide 7's physics.
        this.carried.delete(proj);
        this.carriedAt.delete(proj);
      } else {
        this.drop(proj);
      }
    }
  }

  /** Take one round out of slide 11's list (in place: it is shared). */
  private drop(p: Proj) {
    const g = this.raw;
    p.alive = false;
    if (g) {
      const i = g.projs.indexOf(p);
      if (i >= 0) g.projs.splice(i, 1);
    }
    this.carried.delete(p);
    this.carriedAt.delete(p);
    this.taken.delete(p);
  }

  /**
   * A shot that hit an obstacle: slide 11's own ricochet — the metallic ping,
   * the spark star, the flash ring and the little wheel jolt slide 11 plays
   * when a round hits one of its knives.
   *
   * The blocked round itself goes away with slide 1's carrier: it used to stay
   * in slide 11's list, carried but never moved again, and hung frozen next to
   * the wheel for the whole GAGAL! screen.
   */
  block(x: number, y: number, p?: Proj) {
    const g = this.raw;
    if (!g) return;
    if (p) this.drop(p);
    try {
      g.ricochet(x, y);
    } catch {
      /* the spark must never break the frame */
    }
  }

  /**
   * GAGAL!: every round slide 11 still has in the air goes, carried or not —
   * a drone or a delayed slash must not land a hit after the stage failed.
   * Bursts, particles and marks stay and fade out on their own.
   */
  sweepRounds() {
    const g = this.raw;
    if (!g) return;
    g.projs.length = 0;
    this.taken.clear();
    this.carried.clear();
    this.carriedAt.clear();
    this.flights.clear();
  }

  /**
   * Cut every running slide-11 loop (the beams' hum, the buster's charge
   * whine) and the delayed booms it scheduled. Slide 1 calls it when it
   * pauses or leaves, and when a stage resets: a loop keeps sounding until it
   * is told to stop, and nothing else would tell it then.
   */
  silence() {
    const g = this.raw;
    this.loopsLive = false;
    this.state.chan = 0;
    this.state.minHold = 0;
    this.state.charge = 0;
    if (!g) return;
    try {
      g.sfx.stopAll();
    } catch {
      /* no audio graph yet */
    }
  }

  /** True while slide 11 still has something to draw or animate. */
  get busy(): boolean {
    const g = this.raw;
    if (!g) return false;
    return g.parts.length > 0 || g.fx.length > 0 || g.projs.length > 0
      || g.embeds.length > 0 || this.state.chan > 0.01 || this.state.minHold > 0;
  }

  /**
   * Slide 11's own wheel must never break.
   *
   * `Game.hit()` counts the hits that land on slide 11's own wheel and, at
   * `goal` (15), calls its own `breakWheel()`: eleven wedges clipped out of
   * slide 11's *wooden* face plus seventy wood chips, drawn from slide 11's
   * wheel centre — and slide 1 draws that whole layer on top of its own wheel.
   * The player saw a second, extra wheel shattering around the real one, while
   * the actual SGA wheel stayed intact ("ada 2 roda, roda asli SGA aman").
   *
   * It came back level after level because `adopt()` pins slide 11's `state`
   * back to `'play'` every frame and nothing ever reset its hit counter, so the
   * hidden wheel broke again every 15 hits. Slide 1 owns the stages, the hits
   * and the score; slide 11 only lends its guns, rounds and impact FX.
   */
  /**
   * Slide 11's screen shake moves slide 1's camera.
   *
   * Every slide-11 hit, muzzle and burst calls `g.shake()`, which only ever
   * set a number slide 1 never read — the plasma dome, the orbital strike and
   * the singularity's collapse landed without the jolt slide 11 gives them.
   */
  private forwardShake(g: Game) {
    const host = g as unknown as { shake(amount: number): void; shakeAmt: number };
    host.shake = (amount: number) => {
      host.shakeAmt = Math.max(host.shakeAmt, amount);
      this.hooks.shake(amount);
    };
  }

  /**
   * Run one of slide 11's sound loops (`channel()` / `charge()`) for this
   * frame. Slide 11 stops a loop on its own when the level drops — but not
   * when it is muted (its mute check returns before the stop), and slide 1's
   * mute button only flips that flag: so a muted slide 1 cuts the loops here.
   */
  private loop(level: number, drive: () => void) {
    const g = this.raw;
    if (!g) return;
    if (muted) {
      if (this.loopsLive) {
        this.loopsLive = false;
        try {
          g.sfx.stopAll();
        } catch {
          /* no audio graph yet */
        }
      }
      return;
    }
    try {
      drive();
    } catch {
      /* audio is optional */
    }
    if (level > 0.04) this.loopsLive = true;
  }

  private muteOwnWheelBreak() {
    const g = this.raw as unknown as { breakWheel?: () => void; hits: number } | null;
    if (!g) return;
    g.breakWheel = () => {};
    g.hits = 0;
  }

  clear() {
    const g = this.raw;
    this.taken.clear();
    this.carried.clear();
    this.carriedAt.clear();
    this.flights.clear();
    if (!g) return;
    // A new stage starts with slide 11's own level flow at zero as well.
    this.muteOwnWheelBreak();
    g.parts.length = 0;
    g.fx.length = 0;
    g.projs.length = 0;
    g.embeds.length = 0;
    g.wheel.heat = 0;
    g.wheel.freeze = 0;
    g.wheel.freezeT = 0;
    g.wheel.flash = 0;
    g.wheel.shiver = 0;
    g.wheel.kick = 0;
    g.wheel.kickV = 0;
    g.wheel.sq = 0;
    g.wheel.boost = 0;
    g.lightA = 0;
    g.hitstop = 0;
    this.state.chan = 0;
    this.state.minHold = 0;
    this.state.recoil = 0;
    this.state.charge = 0;
    // A beam's hum or the buster's whine would otherwise outlive the stage.
    this.loopsLive = false;
    try {
      g.sfx.stopAll();
    } catch {
      /* no audio graph yet */
    }
  }

  /* ── one frame of slide 11 ────────────────────────────────────────────── */

  advance(dt: number, holding = false) {
    try {
      if (!this.settled) this.settle(dt);
      this.settled = false;
      this.step(dt, holding);
    } catch {
      // Slide 11's own weapon FX may never break slide 1's simulation: a thrown
      // frame is what makes the round look frozen or the wheel glitch.
    }
  }

  /** Set by `settle()`, cleared by the `advance()` that follows it. */
  private settled = false;

  /**
   * The top of slide 7's `update()`: its wheel (spin boost, shiver, freeze,
   * kick spring, squash, flash, heat), its scene light and its gun (recoil,
   * cooldown) settle first, and only then do its guns fire and its rounds
   * land. Slide 1 calls this at the start of its frame, before its trigger and
   * its rounds, so a fresh kick, muzzle light or wheel flash is seen at full
   * strength on the frame it happens — exactly as on slide 7, instead of one
   * frame's decay early. `advance()` settles by itself when nobody did.
   */
  settle(dt: number) {
    this.settled = true;
    const g = this.raw;
    if (!g) return;
    const wl = g.wheel;
    // Slide 11's own wheel physics: the spin boost every hit adds (and the
    // chrono rifle's thaw), the kick spring and the squash. Slide 1 applies
    // them to its own wheel (`wheelMotion()`, its spin).
    wl.boost *= Math.exp(-dt * 2.5);
    wl.shiver *= Math.exp(-dt * 6);
    wl.freezeT = Math.max(0, wl.freezeT - dt);
    wl.freeze += ((wl.freezeT > 0 ? 1 : 0) - wl.freeze) * (1 - Math.exp(-dt * (wl.freezeT > 0 ? 14 : 5)));
    wl.kickV += (-300 * wl.kick - 15 * wl.kickV) * dt;
    wl.kick += wl.kickV * dt;
    wl.sq *= Math.exp(-dt * 10);
    wl.flash *= Math.exp(-dt * 9);
    wl.heat *= Math.exp(-dt * 1.1);
    // The scene light every muzzle and impact throws (`drawLight()`).
    g.lightA *= Math.exp(-dt * 6);
    const ws = this.state;
    ws.recoil *= Math.exp(-dt * 15);
    ws.cd = Math.max(0, ws.cd - dt);
    ws.ready = ws.cdMax > 0 ? 1 - ws.cd / ws.cdMax : 1;
  }

  private step(dt: number, holding: boolean) {
    const g = this.raw;
    if (!g) return;
    this.adopt();
    // A round slide 1 stopped carrying this frame has no carrier any more:
    // it would otherwise sit in the list for good — invisible (slide 1 paints
    // carried rounds) but still running its own per-frame update in place.
    for (const p of [...this.carried]) {
      if ((this.carriedAt.get(p) ?? -1) < this.tick) this.drop(p);
    }
    this.tick++;
    g.time += dt;
    const w = g.weapon;
    const ws = this.state;
    ws.t += dt;
    ws.fireT += dt;
    // Slide 11's guns read the held trigger themselves (the caster's lock
    // dots, the buster's charge glow), exactly as slide 11's `press()` sets it.
    ws.holding = holding;
    if (w.channel) {
      ws.minHold = Math.max(0, ws.minHold - dt);
      const on = holding || ws.minHold > 0;
      ws.chan += ((on ? 1 : 0) - ws.chan) * (1 - Math.exp(-dt * (on ? 16 : 8)));
      if (ws.chan < 0.01 && !on) ws.chan = 0;
      if (w.id === 'plasmacaster-mk2') {
        // The caster locks on on slide 7's own clock (2.6 s of holding). Its
        // burst is slide 1's shot, though: the lock stops a hair short and
        // raises `casterLocked`, slide 1 fires, and `fire()` closes the lock,
        // so the round slide 1 carries is the caster's own bolt.
        const D = (ws.data ??= {}) as { cyc?: number; fired?: boolean };
        if (!D.fired) D.cyc = Math.min(D.cyc ?? 0, CASTER_LOCK - dt - 1e-3);
      }
      if (ws.chan > 0.01) {
        try {
          w.channelUpdate?.(g, ws, dt);
        } catch {
          /* a channel's own FX must never break the frame */
        }
      }
      // The beam's own hum (heat-ray, repulsor, phaser, proton stream, dragon
      // fire), started, swelled and faded with the channel like slide 11's
      // `update()` does every frame.
      this.loop(ws.chan, () => g.sfx.channel(w.id, ws.chan));
      // Due next frame on slide 7's clock: the lock closes then.
      const D = (ws.data ?? {}) as { cyc?: number; fired?: boolean; auto?: boolean };
      this.casterLocked = w.id === 'plasmacaster-mk2' && holding && ws.chan > 0.01 && !D.fired
        && D.auto !== false && (D.cyc ?? 0) + dt >= CASTER_LOCK - 1e-3;
    } else if (w.onRelease) {
      // Slide 1 owns the trigger and the charge: the buster glows and whines
      // only while slide 1 is really charging a shot, on slide 1's clock.
      const c = holding && this.chargeTime > 0 ? busterCharge(this.chargeTime, w.maxCharge ?? 1.6) : 0;
      if (c > 0) {
        ws.charge = c;
        this.loop(c, () => g.sfx.charge(w.id, c));
      } else if (ws.charge > 0) {
        // Let go (or a press slide 1 did not charge): the whine stops.
        ws.charge = 0;
        this.loop(0, () => g.sfx.charge(w.id, 0));
      }
    }
    try {
      w.update?.(g, ws, dt);
    } catch {
      /* a weapon's idle FX must never break the frame */
    }

    const R = this.wheelR;
    this.flights.clear();
    // Rounds slide 1 is not carrying fly on slide 11's own physics — and they
    // hit slide 11's own wheel, so a burst that slide 1 never carried still
    // bursts into the target instead of sailing through it.
    for (const p of g.projs) {
      // A round that already burst never flies (or hits) again.
      if (!p.alive) continue;
      p.age += dt;
      if (this.carried.has(p)) {
        // A carried round runs slide 7's own update — its trail, drips and
        // sparks, the prism lance's split, the singularity's acceleration, a
        // drone's braking, homing and swirl — and slide 1 moves its carrier
        // by what that update decided (`flight()`). Slide 1 only adds the hit
        // test; the position stays the carrier's until slide 1 has moved it.
        const x0 = p.x;
        const y0 = p.y;
        const n0 = g.projs.length;
        if (p.update) {
          try {
            p.update(g, dt, p);
          } catch {
            /* ignore */
          }
        }
        let f: { x: number; y: number; vx: number; vy: number; next?: Proj } = { x: p.x, y: p.y, vx: p.vx, vy: p.vy };
        if (!p.alive && g.projs.length > n0) {
          // It burst in flight into new rounds (the prism's spectrum): slide 1
          // goes on carrying the one that keeps its line — the central ray,
          // the one slide 7's wheel counts — and the others fly on their own.
          const heir = this.heirOf(p, g.projs.slice(n0));
          if (heir) {
            this.taken.add(heir);
            this.carried.add(heir);
            this.carriedAt.set(heir, this.tick);
            f = { x: heir.x, y: heir.y, vx: heir.vx, vy: heir.vy, next: heir };
          }
        }
        this.flights.set(p, f);
        p.x = x0;
        p.y = y0;
        continue;
      }
      try {
        p.update?.(g, dt, p);
      } catch {
        /* ignore */
      }
      const py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (!p.noCollide && this.wy > 0 && p.vy < 0) {
        // A boss is a drawing: the round stops where it meets the artwork, not
        // where it would meet a circle of radius R.
        const px0 = p.x - p.vx * dt;
        const onArt = this.hasArt ? this.segmentHit(px0, py, p.x, p.y) : null;
        if (onArt) {
          p.x = onArt.x;
          p.y = onArt.y;
          p.alive = false;
          try {
            p.onHit(g, onArt.x, onArt.y, p);
          } catch {
            /* a weapon's own burst must never break the frame */
          }
        } else if (!this.hasArt) {
          const dx = p.x - this.cx;
          if (Math.abs(dx) < R) {
            const sy = this.wy + Math.sqrt(Math.max(0, R * R - dx * dx));
            if (py >= sy && p.y <= sy) {
              p.y = sy;
              p.alive = false;
              try {
                p.onHit(g, p.x, sy, p);
              } catch {
                /* a weapon's own burst must never break the frame */
              }
            }
          }
        }
      }
      if (p.y < -160 || p.y > 1020 || p.x < -200 || p.x > 620) p.alive = false;
    }
    g.projs = g.projs.filter((p) => {
      if (!p.alive) {
        this.carried.delete(p);
        this.taken.delete(p);
      }
      return p.alive;
    });

    // particles (slide 11's own update, including its wheel-hit droplets)
    const parts = g.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
        continue;
      }
      if (p.drag) {
        const f = Math.exp(-p.drag * dt);
        p.vx *= f;
        p.vy *= f;
      }
      if (p.turb) p.vx += Math.sin(g.time * 14 + p.seed) * p.turb * dt;
      p.vy += p.ay * dt;
      const py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.hit && g.active && p.vy < 0 && this.hasArt) {
        const onArt = this.segmentHit(p.x - p.vx * dt, py, p.x, p.y);
        if (onArt) {
          p.x = onArt.x;
          p.y = onArt.y;
          p.life = 0;
          try {
            p.hit(g, p);
          } catch {
            /* ignore */
          }
        }
      } else if (p.hit && g.active && p.vy < 0) {
        const dx = p.x - this.cx;
        if (Math.abs(dx) < R * 0.97) {
          const sy = this.wy + Math.sqrt(Math.max(0, R * R - dx * dx));
          if (py >= sy && p.y <= sy) {
            p.y = sy;
            p.life = 0;
            try {
              p.hit(g, p);
            } catch {
              /* ignore */
            }
          }
        }
      }
    }

    for (const f of g.fx) {
      f.age += dt;
      f.update?.(dt, f);
    }
    g.fx = g.fx.filter((f) => f.age < f.max);

    // Slide 11's hit-stop belongs to slide 1's clock.
    if (g.hitstop > 0) {
      this.hooks.hitStop(g.hitstop);
      g.hitstop = 0;
    }
    // No wheel face on this stage (the rock, the chest, the bonus ring): a
    // round's entry hole has nothing to sit on, and a burning one would throw
    // its embers from an empty circle.
    if (!this.marks) g.embeds.length = 0;
    for (const e of g.embeds) {
      if (e.fade > 0) e.fade -= dt;
      if (e.fire > 0) {
        e.fire -= dt;
        this.embedFire(e, dt);
      }
    }
    g.embeds = g.embeds.filter((e) => e.fade >= 0);
  }

  /**
   * First point of a segment that is on the target's artwork, when the host has
   * one (a boss). `null` means "not the drawing": the caller falls back to the
   * wheel's own circle maths for an ordinary wheel.
   */
  private segmentHit(x0: number, y0: number, x1: number, y1: number) {
    const w = this.hooks.wheel() as { ink?: (x: number, y: number) => boolean };
    if (!w.ink) return null;
    return traceBossSegment(x0, y0, x1, y1, w.ink);
  }

  /** Whether the host answers with artwork pixels (a boss stage). */
  private get hasArt() {
    return !!(this.hooks.wheel() as { ink?: unknown }).ink;
  }

  private embedFire(e: Embed, dt: number) {
    const g = this.raw;
    if (!g) return;
    const w = this.hooks.wheel() as { surfacePoint?: (a: number) => { x: number; y: number } };
    const onArt = w.surfacePoint?.(e.a);
    const an = g.wheel.angle + e.a;
    const ex = onArt ? onArt.x : this.cx + Math.cos(an) * this.wheelR;
    const ey = onArt ? onArt.y : this.wy + Math.sin(an) * this.wheelR;
    if (e.kind === 'acid') {
      const k = clamp(e.fire / 2.4);
      if (Math.random() < dt * 22 * k) {
        g.spawn({
          type: 'smoke', x: ex + rand(-8, 8), y: ey + rand(-8, 4), vx: rand(-14, 14),
          vy: rand(-80, -30), size: 4, size1: rand(16, 26), life: rand(0.8, 1.4),
          alpha: 0.24, pal: ['#f0ffc0', '#a8d84a', '#5a7a2a'], drag: 0.8,
        });
      }
      if (Math.random() < dt * 16 * k) {
        g.spawn({
          type: 'ring', x: ex + rand(-9, 9), y: ey + rand(-6, 6), size: 1,
          size1: rand(4, 7), len: 1.3, life: rand(0.25, 0.5),
          pal: ['#e8ff8a', '#9aff2a'], alpha: 0.9,
        });
      }
      return;
    }
    if (Math.random() < dt * 14) {
      g.spawn({
        type: 'glow', x: ex, y: ey, vx: rand(-14, 14), vy: rand(-70, -30),
        size: rand(2, 4), size1: 0, life: rand(0.5, 1.0),
        pal: ['#ffe9a0', '#ff9a2e', '#7a2a10'], alpha: 0.9,
      });
    }
  }

  /* ── drawing ──────────────────────────────────────────────────────────── */

  /**
   * Every round slide 11 is flying, its `Fx` list and its particles.
   *
   * One weapon's renderer throwing must never take the whole slide-1 frame with
   * it (a blank screen mid-round reads as a freeze), so each piece is guarded.
   */
  draw(ctx: CanvasRenderingContext2D) {
    const g = this.raw;
    if (!g) return;
    for (const p of g.projs) {
      // A carried round is painted once, by slide 1's projectile pass
      // (`drawShot()`), under the gun — where slide 11's `render()` paints its
      // rounds. Painting it here as well drew every round twice: double glow
      // (most rounds add their light) and a second copy over the barrel.
      if (this.carried.has(p)) continue;
      ctx.save();
      try {
        p.draw(ctx, g, p);
      } catch {
        /* a single round's art must not break the frame */
      }
      ctx.restore();
    }
    for (const f of g.fx) {
      ctx.save();
      if (f.add) ctx.globalCompositeOperation = 'lighter';
      try {
        // A muzzle burst is painted around a point: turning that geometry about
        // its own muzzle makes its spikes lean along the barrel.
        const anchor = (f as unknown as { poseAnchor?: { x: number; y: number } }).poseAnchor;
        if (anchor && this.poseTilt) {
          ctx.translate(anchor.x, anchor.y);
          ctx.rotate(this.poseTilt);
          ctx.translate(-anchor.x, -anchor.y);
        }
        f.draw(ctx, clamp(f.age / f.max), f);
      } catch {
        /* ignore */
      }
      ctx.restore();
    }
    try {
      // Splinters stay on the drawing the round bit into (boss outline).
      withSplinterClip(ctx, () => (g as unknown as { drawParticles(c: CanvasRenderingContext2D): void }).drawParticles(ctx));
    } catch {
      /* ignore */
    }
  }

  /** One round of slide 11's own art (slide 1 paints carried rounds itself). */
  drawShot(ctx: CanvasRenderingContext2D, p: Proj) {
    const g = this.raw;
    // A round that burst by itself in flight (the prism tracer after its
    // split) is gone, even while slide 1's carrier finishes the flight.
    if (!g || !p.alive) return;
    // Slide 11 paints a tracer from its tail to its tip along `(vx, vy)`, which
    // is the layer's own straight-up flight. Point that at the path slide 1
    // flies the round along (the barrel), so the streak really leans and its
    // tail stays behind the round.
    const aim = this.aimAt.get(p);
    const vx = p.vx;
    const vy = p.vy;
    if (typeof aim === 'number' && Number.isFinite(aim)) {
      const speed = Math.hypot(vx, vy);
      if (speed > 1) {
        p.vx = Math.cos(aim) * speed;
        p.vy = Math.sin(aim) * speed;
      }
    }
    ctx.save();
    try {
      p.draw(ctx, g, p);
    } catch {
      /* a single round's art must not break the frame */
    }
    ctx.restore();
    p.vx = vx;
    p.vy = vy;
  }

  /**
   * Slide 11's own wheel motion for this frame — the hit kick, the squash and
   * the harmonic disruptor's shiver — for slide 1 to move its own wheel with.
   * One jitter roll per frame, so the wheel, its marks and every overlay of
   * slide 11 shake together.
   */
  wheelMotion(): ElevenWheelMotion {
    const g = this.raw;
    if (!g) return STILL;
    const w = g.wheel;
    if (this.motionAt !== g.time) {
      this.motionAt = g.time;
      const sh = w.shiver > 0.05 ? w.shiver : 0;
      this.jitterX = sh ? (Math.random() - 0.5) * 2 * sh : 0;
      this.jitterY = sh ? (Math.random() - 0.5) * 2 * sh : 0;
    }
    if (!this.jitterX && !this.jitterY && Math.abs(w.kick) < 0.05 && w.sq < 0.001) return STILL;
    return { dx: this.jitterX, dy: w.kick + this.jitterY, sx: 1 + w.sq, sy: 1 - w.sq };
  }

  /**
   * The scene light slide 11 throws with every muzzle and impact
   * (`g.light()`), painted the way slide 11's `render()` paints it under its
   * wheel: one wash around the wheel, one over the gun.
   */
  drawLight(ctx: CanvasRenderingContext2D) {
    const g = this.raw;
    if (!g || g.lightA <= 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    try {
      drawGlow(ctx, this.cx, g.wy + 60, 420, g.lightC, g.lightA * 0.45);
      drawGlow(ctx, this.cx, this.gunY + 110, 300, g.lightC, g.lightA * 0.3);
    } catch {
      /* ignore */
    }
    ctx.restore();
  }

  /**
   * Slide 11's marks and its wheel's mood, painted onto slide 1's wheel: the
   * entry holes (handles outside, wounds inside), then — world-oriented, like
   * slide 11's own pass over its face — the heat glow its beams and flares
   * build up, the icy tint of a frozen wheel and the flash of every hit, and
   * the flames over burning marks. `cx, cy` is where slide 1 drew its wheel,
   * and `motion` the kick / squash / shiver it drew it with (`wheelMotion()`).
   */
  drawWheel(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    rot: number,
    motion: ElevenWheelMotion = STILL,
  ) {
    const g = this.raw;
    if (!g) return;
    const wl = g.wheel;
    const m = motion;
    const x0 = cx + m.dx;
    const y0 = cy + m.dy;
    const self = g as unknown as {
      embedOut(c: CanvasRenderingContext2D, e: Embed): void;
      embedIn(c: CanvasRenderingContext2D, e: Embed): void;
    };
    if (g.embeds.length) {
      ctx.save();
      ctx.translate(x0, y0);
      ctx.scale(m.sx, m.sy);
      ctx.rotate(rot);
      for (const e of g.embeds) {
        ctx.save();
        ctx.rotate(e.a);
        ctx.translate(radius, 0);
        ctx.globalAlpha = e.fade > 0 ? clamp(e.fade / 0.4) : 1;
        try {
          self.embedOut(ctx, e);
        } catch {
          /* ignore */
        }
        ctx.restore();
      }
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius - 1, 0, TAU);
      ctx.clip();
      for (const e of g.embeds) {
        ctx.save();
        ctx.rotate(e.a);
        ctx.translate(radius, 0);
        ctx.globalAlpha = e.fade > 0 ? clamp(e.fade / 0.4) : 1;
        try {
          self.embedIn(ctx, e);
        } catch {
          /* ignore */
        }
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();
    }

    // heat, frost and hit flash over the whole face (slide 11's `drawWheel`)
    if (wl.heat > 0.01 || wl.freeze > 0.01 || wl.flash > 0.01) {
      ctx.save();
      ctx.translate(x0, y0);
      ctx.scale(m.sx, m.sy);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      try {
        if (wl.heat > 0.01) drawGlow(ctx, 0, radius * 0.9, radius * 1.2, wl.heatC, wl.heat * 0.5);
        if (wl.freeze > 0.01) {
          ctx.fillStyle = `rgba(90,200,255,${0.1 * wl.freeze})`;
          ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        }
        if (wl.flash > 0.01) {
          ctx.fillStyle = `rgba(255,236,205,${Math.min(0.3, wl.flash * 0.26)})`;
          ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        }
      } catch {
        /* ignore */
      }
      ctx.restore();
    }

    // burning marks glow on the rim, exactly like slide 11's
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const e of g.embeds) {
      if (e.fire <= 0 || e.kind === 'acid') continue;
      const an = rot + e.a;
      const x = x0 + Math.cos(an) * radius * m.sx;
      const y = y0 + Math.sin(an) * radius * m.sy;
      const f = clamp(e.fire / 0.6);
      const fl = 0.75 + 0.25 * Math.sin(g.time * 30 + e.seed);
      drawGlow(ctx, x, y - 8, 15 * fl, '#ff7a1a', 0.8 * f);
      drawGlow(ctx, x, y - 13 * fl, 9 * fl, '#ffd25a', 0.9 * f);
      drawGlow(ctx, x, y - 6, 5, '#ffffff', 0.6 * f);
    }
    ctx.restore();
  }

  /** The gun itself, in slide 11's own coordinates, at slide 1's size. */
  drawWeapon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    time: number,
  ) {
    const g = this.raw;
    if (!g) return;
    const w = g.weapon;
    const ws = this.state;
    const sc = elevenScale(this.weaponId) * (w.scale ?? 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 2);
    ctx.rotate(Math.sin(time * 1.25 + 0.7) * 0.012);
    // Scale first: the muzzle offset is in the weapon's own units.
    ctx.scale(sc, sc);
    ctx.translate(-w.muzzle - ws.recoil * w.kick, -w.muzzleY);
    w.draw(ctx, g, ws);
    ctx.restore();
  }

  /**
   * Slide-11's aiming overlay — the sniper beam's laser sight, the shoulder
   * caster's three-dot lock and HUD, the orbital beacon's designator.
   *
   * Slide 11 paints it every frame, between its wheel and its gun, in world
   * space (`g.muzzlePos()`, `g.lw()`, `g.aim()` — bound to slide 1's barrel
   * and wheel in `adopt()`). Slide 1 never called it, so those guns lost their
   * whole targeting look.
   */
  drawOverlay(ctx: CanvasRenderingContext2D) {
    const g = this.raw;
    if (!g) return;
    const w = g.weapon;
    if (!w.drawOverlay) return;
    ctx.save();
    try {
      w.drawOverlay(ctx, g, this.state);
    } catch {
      /* a weapon's own overlay must never break the frame */
    }
    ctx.restore();
  }

  /**
   * Slide-11's channel beam (the tripod heat-ray, the repulsor, the phaser,
   * the proton stream, the dragon's flame), in slide-1 screen space.
   *
   * Every slide-11 beam recipe draws in *world* space: it reads its own
   * `g.muzzlePos()` and `g.aim()`, which `adopt()` binds to slide 1's barrel
   * and wheel. The beam used to be painted inside the gun's local transform
   * as well — turned a quarter and scaled — so it left the gun sideways and
   * showed up as a streak at the edge of the screen, and the wheel only got
   * the sparks of a beam nobody could see.
   */
  drawBeam(ctx: CanvasRenderingContext2D) {
    const g = this.raw;
    if (!g) return;
    const w = g.weapon;
    const ws = this.state;
    if (!w.channel || ws.chan <= 0.02) return;
    ctx.save();
    try {
      w.drawBeam?.(ctx, g, ws);
    } catch {
      /* ignore */
    }
    ctx.restore();
  }
}

/**
 * The picker card's frame (`ShotEffectCanvas`: 152 × 88, painted at 1.15 × 1.1
 * from its top centre): the target rim it strokes across the top edge, and a
 * muzzle near the bottom edge.
 */
const CARD_WHEEL_Y = -40;
const CARD_WHEEL_R = 38;
const CARD_MUZZLE_Y = 54;

/**
 * The one slide-11 world every card still is painted with.
 *
 * The cards repaint about 18 times a second, and a fresh `SetElevenFx` built a
 * whole new slide-11 `Game` each time — its sprite canvases, and through its
 * `setWeapon()` a brand-new `AudioContext` that was never closed: roughly
 * fifteen audio contexts a second for every Slide 11 card on screen.
 */
let cardFx: SetElevenFx | null = null;

/**
 * A still of slide 11's round (or beam) at `age` seconds after the muzzle, for
 * the picker's "Slide 11" effect card — slide 11's own draw, nothing redrawn.
 *
 * Slide 11's world is set to the card's own frame: its muzzle sits at the
 * bottom of the card and its wheel is the rim the card draws. A channel beam
 * then joins that muzzle to that rim, and the muzzle burst blooms on the card
 * (slide 11's world used to stay on the 420-wide game field, so the beam and
 * the burst were painted far outside the card).
 */
export function drawSetElevenShotShell(
  c: CanvasRenderingContext2D,
  id: ElevenId,
  age: number,
  travel = 26,
) {
  const fx = (cardFx ??= new SetElevenFx());
  if (!fx.raw) return;
  fx.cx = 0;
  fx.wy = CARD_WHEEL_Y;
  fx.wheelR = CARD_WHEEL_R;
  fx.restart(id);
  const w = fx.weapon;
  fx.fire(0, CARD_MUZZLE_Y);
  // Channel weapons (the flame throwers, the beams) and charged guns only show
  // their shot after slide 11 has run a few of its own frames: let it, so the
  // card shows the real flame / beam instead of an empty muzzle.
  const holds = !!w.channel || !!w.onRelease;
  // The card's wheel is tiny, so a real round would reach it — and burst —
  // before the card ever painted it. The first round is held where the card
  // freezes it; any other round of a volley flies on slide 11's own physics.
  // Like slide 1's carrier, the card hands the held round over every frame,
  // or slide 11 would let go of it as a round nobody carries any more.
  let shown: Proj | undefined;
  const claim = () => {
    shown ??= fx.takeShots()[0];
    if (shown) fx.carry(shown, 0, -travel, -Math.PI / 2);
  };
  claim();
  // Hitscan beams live in slide 11's `Fx` list for a fraction of a second, so
  // stop as soon as the weapon has produced anything you can see: the card
  // shows the beam at its brightest, not a frame after it already faded. A
  // timer with nothing to draw (the sword's swing before its slash leaves)
  // does not count — the card waits for the slash itself.
  const raw = fx.raw;
  const shows = () => !!shown || raw.projs.length > 0 || raw.parts.length > 0
    || raw.fx.some((f) => f.draw.length > 0);
  for (let i = 0; i < 60 && !shows(); i++) {
    fx.advance(1 / 30, holds);
    claim();
  }
  for (let i = 0; i < 2; i++) {
    fx.advance(1 / 60, holds);
    claim();
  }
  if (shown) shown.age = age;
  // Beam weapons (the heat-ray, the pack) are their channel, not a round.
  if (w.channel) {
    fx.state.chan = 1;
    fx.drawBeam(c);
  }
  // The round (carried, so painted the way slide 1's carrier paints it), then
  // the rest of the volley, the muzzle burst and the flame body slide 11
  // spawned for it.
  if (shown) fx.drawShot(c, shown);
  fx.draw(c);
}

// Slide 1's master mute/volume drives this bus as soon as the module loads.
registerSlideAudio((muted, volume) => {
    setElevenMuted(muted); setElevenVolume(volume);
});
