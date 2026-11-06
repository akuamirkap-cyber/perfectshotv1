/**
 * SET 1 artwork of slide 7 (`Weapon Hit 71 Senjata`, `games/game-4`), drawn on
 * slide 1 at the same muzzle origin with the same animation state.
 *
 * The draw call is the real `drawWeapon()` from
 * `games/game-4/src/game/weaponArt.ts`, so every path, gradient and detail of
 * GOLDEN GUN, BLACK HOLE (staff), KETAPEL, SUMPIT DAYAK, SHOTGUN and SUPER
 * SOAKER is identical instead of redrawn by hand. Only the animation values are
 * supplied by slide 1: slide 7 integrates springs over time, slide 1 knows how
 * long ago it fired, so the same visible pose is reproduced from that.
 */
import { drawWeapon } from '../vendor/game-4/src/game/weaponArt';
import { newAnim, type WeaponAnim } from '../vendor/game-4/src/game/weapons';

/** The six SET 1 weapons of slide 7. */
export const SET_ONE_IDS = ['golden', 'blackhole', 'ketapel', 'sumpit', 'shotgun', 'soaker'] as const;
export type SetOneId = (typeof SET_ONE_IDS)[number];

export function isSetOneId(id: string): id is SetOneId {
  return (SET_ONE_IDS as readonly string[]).includes(id);
}

/**
 * Slide-1 id → slide-7 SET 1 id. Two of the six carry a different name on
 * slide 1: KETAPEL is `slingshot` and SUMPIT DAYAK is `blowgun`.
 */
export const SET_ONE_BY_SLIDE1_ID = {
  golden: 'golden',
  blackhole: 'blackhole',
  slingshot: 'ketapel',
  blowgun: 'sumpit',
  shotgun: 'shotgun',
  soaker: 'soaker',
} as const satisfies Record<string, SetOneId>;

export type SetOneSlide1Id = keyof typeof SET_ONE_BY_SLIDE1_ID;

/** The slide-7 SET 1 weapon behind a slide-1 gun id, or null. */
export function setOneIdFor(id: string): SetOneId | null {
  return (SET_ONE_BY_SLIDE1_ID as Record<string, SetOneId>)[id] ?? null;
}

/** Everything slide 1 knows about the gun this frame. */
export interface SetOneGunInput {
  /** Seconds since the last shot (slide 1 `rt - lastShotRT`, idle uses 9). */
  sinceShot: number;
  /** 0..1 charge meter, used by the black-hole staff. */
  charge?: number;
  /** Remaining ammo ratio, used by the water tank gauge. */
  water?: number;
  /** True when the weapon can fire (drives the loaded pouch / rocket). */
  ready?: boolean;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * Rebuilds the slide-7 `WeaponAnim` for a given moment. The numbers below are
 * slide 7's own visible ranges: the pistol slide travels back over ~0.16 s,
 * the shotgun pump starts at 0.17 s, the soaker pump at 0.10 s, the slingshot
 * pouch returns 0.34 s after the shot, and the blowpipe tassel keeps swinging.
 */
export function buildSetOneAnim(id: SetOneId, st: SetOneGunInput): WeaponAnim {
  const a = newAnim();
  const since = Math.max(0, st.sinceShot);
  a.fireT = since;
  a.intro = 1;
  switch (id) {
    case 'golden':
      // Slide-back on fire, springing home over ~0.16 s.
      a.slide = Math.max(0, 1 - since * 7);
      break;
    case 'blackhole': {
      // The staff shows the charge meter, then a released orb that fades.
      const charge = clamp01(st.charge ?? 0);
      a.charge = charge;
      a.charging = charge > 0.02;
      a.orb = since < 0.32 ? 1 - since / 0.32 : 0;
      break;
    }
    case 'ketapel':
      // Pouch is pulled back while reloading (0.34 s) and released after.
      a.loaded = st.ready ?? true;
      a.pouchTarget = st.ready === false ? 0 : 46;
      a.pouchY = st.ready === false ? Math.max(0, 46 - since * 135) : Math.min(46, since * 135);
      a.bandWob = Math.max(0, 7 - since * 26);
      break;
    case 'sumpit':
      a.pulse = since < 0.24 ? since : -1;
      a.tassel = Math.sin(since * 22) * Math.max(0, 1 - since * 2.2) * 8;
      break;
    case 'shotgun':
      // Pump starts 0.17 s after the shot and takes ~0.24 s.
      a.pump = since < 0.17 ? 0 : Math.sin(clamp01((since - 0.17) / 0.24) * Math.PI);
      break;
    case 'soaker':
      a.water = clamp01(st.water ?? 1);
      a.gauge = 0.22 + Math.min(0.7, a.water * 0.7);
      a.slosh = Math.max(0, 1.1 - since * 2.6);
      a.pumpS = since < 0.1 ? 0 : Math.sin(clamp01((since - 0.1) / 0.3) * Math.PI);
      break;
  }
  return a;
}

/**
 * Draws a SET 1 weapon with its muzzle exactly at (cx, y0) — the same origin
 * contract slide 1's `drawGun` uses, so `drawGunCentered` and the picker cards
 * place it correctly.
 */
export function drawSetOneGun(
  c: CanvasRenderingContext2D,
  id: SetOneId,
  cx: number,
  y0: number,
  time: number,
  st: SetOneGunInput,
) {
  const a = buildSetOneAnim(id, st);
  c.save();
  c.translate(cx, y0);
  drawWeapon(c, id, a, time);
  c.restore();
}
