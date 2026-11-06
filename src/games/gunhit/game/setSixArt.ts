/**
 * Slide-6 (`games/game-2` / Weapon Wheel Hit) artwork for slide 1.
 *
 * Slide 6 is the older `Weapon Wheel Hit`: sixteen guns, one rotating wheel,
 * and the same three beam weapons slide 9 later redrew (`Sniper Beam`,
 * `Tripod Heat-Ray`, `Iron Man Repulsor`). Those three already exist on slide 1
 * through the slide-9 export (`railgun`, `heat_ray`, `gauntlet_cannon`), so
 * slide 6 does not add a gun: it adds another *design* (and another *shot*) to
 * the guns that already carry that name.
 *
 * Nothing is redrawn here. Slide 6's real `drawWeapon()` renders the gun, at
 * slide 1's muzzle origin, with slide 6's own `WState` (draw progress + time
 * since the trigger), so the barrel, its glow and its pulse are byte-identical
 * to slide 6's own frame.
 */
import {
  WEAPONS as SIX_WEAPONS,
  drawWeapon,
  type Weapon as SixWeapon,
  type WState as SixState,
} from '../vendor/game-2/src/weapons';

/** Slide-1 gun id -> slide-6 weapon id. */
export const SET_SIX_BY_SLIDE1_ID = {
  // Sniper Beam -> the railgun slide 9's `sniperBeam` already lives on.
  railgun: 'sniper',
  // Tripod Heat-Ray -> the Martian heat-ray slide 9's `tripod` already lives on.
  heat_ray: 'tripod',
  // Iron Man Repulsor -> the gauntlet slide 9's `repulsor` already lives on.
  gauntlet_cannon: 'iron',
} as const;

export type SixSlide1Id = keyof typeof SET_SIX_BY_SLIDE1_ID;
export type SixId = (typeof SET_SIX_BY_SLIDE1_ID)[SixSlide1Id];

/** The three slide-6 ids this export carries. */
export const SET_SIX_IDS = Object.values(SET_SIX_BY_SLIDE1_ID) as SixId[];

/** The three slide-1 guns that gain slide 6's design and shot. */
export const SET_SIX_SLIDE1_IDS = Object.keys(SET_SIX_BY_SLIDE1_ID) as SixSlide1Id[];

/**
 * Guns slide 6 introduces. None: every slide-6 beam already exists on slide 1
 * under the name slide 9 gave it, so the export is design + shot only.
 */
export const SET_SIX_NEW_WEAPONS = [] as const;

const SIX_BY_ID = new Map<string, SixWeapon>(SIX_WEAPONS.map((w) => [w.id, w]));

/** The slide-6 weapon behind a slide-1 gun, or null. */
export function setSixIdFor(id: string): SixId | null {
  return (SET_SIX_BY_SLIDE1_ID as Record<string, SixId>)[id] ?? null;
}

/** The slide-1 gun that carries a slide-6 weapon. */
export function slide1IdForSix(id: SixId): SixSlide1Id {
  return SET_SIX_SLIDE1_IDS.find((k) => SET_SIX_BY_SLIDE1_ID[k] === id) as SixSlide1Id;
}

/** Is this a ported slide-6 id? */
export function isSixId(id: string): id is SixId {
  return (SET_SIX_IDS as readonly string[]).includes(id);
}

/** Slide 6's own weapon object (its `cd`, `muzzle`, `col`, `beam`, `stuck`). */
export function sixWeapon(id: SixId): SixWeapon {
  const w = SIX_BY_ID.get(id);
  if (!w) throw new Error(`unknown slide-6 weapon: ${id}`);
  return w;
}

/* ── slide-1-sized art ────────────────────────────────────────────────────── */

/**
 * Slide 6 authors its guns on a 480 × 960 board with the barrel along +x and
 * the muzzle at `+muzzle`. These are the raw ink extents of slide 6's own
 * drawing at scale 1, measured from the muzzle (0, 0) with the body hanging
 * away from it — the same anchor slide 1's `drawGun` uses. Scale and menu
 * metrics are derived from them, so no gun is ever cropped or blown up.
 */
const SIX_INK: Record<SixId, { len: number; wid: number }> = {
  // scope/stock at x = -106 … emitter at x = 304, rail shroud ±39
  sniper: { len: 410, wid: 77 },
  // copper legs at x = -120 … nozzle at x = 138, tripod legs ±46
  tripod: { len: 258, wid: 92 },
  // forearm at x = -118 … open palm at x = 58, fingers ±26
  iron: { len: 176, wid: 52 },
};

/** The size slide 1's own guns have below the muzzle line. */
const TARGET_LEN = 176;
/** Nothing may be wider than the 420-wide play field (with air on both sides). */
const MAX_WID = 320;

/** Per-weapon scale: slide 1's length, but never wide enough to clip. */
export function sixScale(id: SixId): number {
  const ink = SIX_INK[id];
  return Math.min(1.45, TARGET_LEN / ink.len, MAX_WID / ink.wid);
}

/** Menu metrics derived from the same measurements the drawing uses. */
export const SET_SIX_METRICS = Object.fromEntries(
  SET_SIX_IDS.map((id) => {
    const s = sixScale(id);
    const ink = SIX_INK[id];
    const len = ink.len * s;
    const wid = ink.wid * s;
    return [id, {
      totalLen: Math.round(len),
      centerOffsetY: Math.round(len / 2),
      centerOffsetX: 0,
      span: Math.ceil((len + wid) / Math.SQRT2) + 2,
    }];
  }),
) as Record<SixId, { totalLen: number; centerOffsetY: number; centerOffsetX: number; span: number }>;

/** Slide 6's trigger interval, in seconds (its `cd`). */
export function sixCooldown(id: SixId): number {
  return sixWeapon(id).cd;
}

/**
 * Slide 6's draw state plus the recoil it applies to the whole gun.
 *
 * Slide 6 keeps `recoil` outside the weapon's `WState`: it starts at 1 on the
 * trigger and decays as `recoil *= 0.0008^dt`, which pushes the gun back by up
 * to 14 px. `kick` is that same decay, so the artwork recoils identically.
 */
export interface SixDrawState extends SixState {
  kick?: number;
}

/** A rested slide-6 draw state (art only: no trigger, no draw progress). */
export function restSixState(overrides: Partial<SixDrawState> = {}): SixDrawState {
  return { t: 0, ready: 1, fireT: 9, kick: 0, ...overrides };
}

/**
 * Slide 6's draw state, rebuilt from slide 1's shot clock.
 *
 * Slide 6 keeps two numbers for the art: `fireT` (seconds since the trigger,
 * reset to 0 on fire) and `ready` (`1 - cd / weapon.cd`, so it climbs from 0 to
 * 1 across the trigger interval — the bow's string, the heat-ray's glow and the
 * repulsor's palm all breathe with it). Live games hand the same numbers over
 * through `gunState.sixState`; menus and cards rebuild them from `sinceShot`.
 */
export function sixStateFor(sinceShot: number, id: SixId, time = 0): SixDrawState {
  const cd = sixCooldown(id) || 1;
  const since = Math.max(0, sinceShot);
  return {
    t: time,
    ready: Math.min(1, since / cd),
    fireT: since >= 4 ? 9 : since,
    kick: Math.pow(0.0008, since),
  };
}

/**
 * Draw slide 6's own weapon art so its muzzle sits exactly on slide 1's muzzle
 * tip (cx, y0), pointing up like every other slide-1 gun.
 */
export function drawSetSixGun(
  c: CanvasRenderingContext2D,
  id: SixId,
  cx: number,
  y0: number,
  time: number,
  state: SixDrawState = restSixState(),
  scale = sixScale(id),
) {
  const w = sixWeapon(id);
  c.save();
  c.translate(cx, y0);
  // Slide 6 aims along +x with the muzzle at `+w.muzzle`; slide 1's guns point
  // up from the muzzle, so the same rotation slide 6 uses puts the barrel on
  // slide 1's axis and the stock below it.
  c.rotate(-Math.PI / 2);
  // The same idle sway slide 1's own guns have, in screen-space pixels.
  c.rotate(Math.sin(time * 1.25 + 0.7) * 0.012);
  c.translate(Math.sin(time * 1.9) * 1.3, 0);
  c.scale(scale, scale);
  // Slide 1 anchors the muzzle, slide 6 anchors the stock: shift along the
  // gun's own axis so the barrel tip lands on (cx, y0). Slide 6 kicks the whole
  // gun back by `recoil * 14` after a shot, which is exactly the same offset.
  c.translate(-w.muzzle - (state.kick ?? 0) * 14, -w.mY);
  drawWeapon(c, id, state);
  c.restore();
}

/** Slide 6's gun for the menu strips (bottom pivot, no idle motion). */
export function drawSetSixIcon(
  c: CanvasRenderingContext2D,
  id: SixId,
  cx: number,
  y0: number,
  scale = sixScale(id),
) {
  drawSetSixGun(c, id, cx, y0, 0, restSixState(), scale);
}
