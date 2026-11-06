/**
 * The numbers that decide how a SET 2..7 gun *feels*, taken from slide 7 itself.
 *
 * Slide 1 owns the flight, the hit test and the score, so a slide-7 round is
 * flown by slide 1's carrier. That carrier used to fly at slide 1's own `speed`
 * and reload on slide 1's own `cooldown`, which is why every imported gun felt
 * off: the snowball flew 2000 px/s instead of 1050, the bee fired every 0.10 s
 * instead of 0.50 s, the bazooka reached the wheel in half the time…
 *
 * Slide 7 keeps both numbers where it always has: the trigger interval in
 * `weapons.ts` (`WeaponDef.cooldown`) and the launch speed in each projectile
 * class's `super(g, x, y, SPEED)` call, which the base class stores as `vy`.
 */
import { WEAPONS } from '../vendor/game-4/src/game/weapons';

const BY_ID = new Map(WEAPONS.map((w) => [w.id as string, w]));

/** Slide-7's own trigger interval in seconds, or null for a non-slide-7 id. */
export function sevenCooldown(id: string): number | null {
  return BY_ID.get(id)?.cooldown ?? null;
}

/** Slide-7's own ammo per level, kept for the parity tools and tests. */
export function sevenAmmo(id: string): number | null {
  return BY_ID.get(id)?.ammo ?? null;
}

/**
 * The speed slide 7 launches a round with.
 *
 * `Projectile` keeps the constructor's fourth argument in `vy`, so the round
 * itself is the source of truth — no table to drift out of date.
 *
 * Three of slide 7's rounds are beams rather than travelling shots:
 * `LaserBeam`, `FreezeBeam` and `RailShot` are built with a placeholder `-100`
 * because they paint their whole beam the moment they exist. Slide 1 still has
 * to fly a carrier to the wheel for those, so they keep slide 1's near-instant
 * speed instead of creeping up the screen at 100 px/s.
 */
export function sevenShotSpeed(shot: { vy: number }, fallback: number): number {
  const sp = Math.abs(shot.vy);
  return sp > 200 ? sp : fallback;
}

/**
 * Point slide 1's carrier at slide 7's speed once its round exists.
 *
 * Used both when the recipe hands the round over on the trigger frame and when
 * a charged gun releases it a moment later, so a slow orb never keeps flying at
 * the speed slide 1 would have given its own bullet.
 */
export function adoptSevenRound(
  carrier: { vy: number },
  shot: { vy: number } | undefined,
  fallbackSpeed: number,
  speedMult: number,
): number {
  const speed = shot ? sevenShotSpeed(shot, fallbackSpeed) : fallbackSpeed;
  carrier.vy = -speed * speedMult;
  return speed;
}

/**
 * Slide 3's four beams — the LASER GUN, the FREEZE RAY, the RAILGUN and the
 * EMERALD staff — are built with a placeholder `-100` and resolve on their
 * very first frame (`update()` calls `collide()` straight away, then paints
 * the whole line from the muzzle to wherever it landed).
 */
export function isSevenBeam(shot: { vy: number }): boolean {
  return Math.abs(shot.vy) <= 200;
}

/**
 * The speed slide 1's carrier crosses the field with for a beam: the whole way
 * to the wheel (through its collision sweep) inside the beam's first frame, as
 * slide 3 resolves it.
 */
export const SEVEN_BEAM_SWEEP = 60000;

/** The carrier speed for a slide-3 round: its own launch speed, or a beam's sweep. */
export function sevenCarrierSpeed(shot: { vy: number }, fallback: number): number {
  return isSevenBeam(shot) ? SEVEN_BEAM_SWEEP : sevenShotSpeed(shot, fallback);
}
