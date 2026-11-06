/**
 * Slide-9 (`games/game-6` / `Weapon Lab`) artwork for slide 1.
 *
 * Slides 1 and 9 share only a few names, so this is a *mapping* table: every
 * slide-9 weapon is carried over on its own, either onto the slide-1 gun it
 * obviously belongs to (AK-47 → AK-47, Beretta 92FS → PISTOL, Plasmacaster →
 * PREDATOR PLASMA CASTER …) or as a brand-new slide-1 weapon (`longbow`,
 * `mp5`, `tesla_rifle`, `ion_smg`, `phaser`, `yautja`, `identity_disc`,
 * `proton_pack`, `heat_ray`).
 *
 * The art is not redrawn: slide 9's real `Weapon.draw()` renders the gun, at
 * slide 1's muzzle origin and with slide 9's own draw state (recoil, slide,
 * bolt, pump, charge, spin-up, drum index…).
 */
import { WEAPONS as NINE_WEAPONS } from '../vendor/game-6/src/game/weapons';
import type { Weapon as NineWeapon, WeaponDrawState } from '../vendor/game-6/src/game/types';

/** Slide-1 gun id -> slide-9 weapon id. */
export const SET_NINE_BY_SLIDE1_ID = {
  // Names that already exist on slide 1: slide 9's version becomes the newest
  // design of that gun.
  pistol: 'beretta92',
  ak47: 'ak47',
  sniper: 'rifle',
  railgun: 'sniperBeam',
  dragon: 'dragonBreath',
  pred: 'plasmacaster',
  photon_saber: 'energySword',
  gauntlet_cannon: 'repulsor',
  // Slide 9 weapons with no slide-1 counterpart: new guns, added whole.
  longbow: 'bow',
  mp5: 'mp5',
  tesla_rifle: 'rifleElectro',
  ion_smg: 'mp5Electro',
  phaser: 'phaser',
  yautja: 'yautjaCaster',
  identity_disc: 'identityDisc',
  proton_pack: 'protonPack',
  heat_ray: 'tripod',
} as const;

export type NineSlide1Id = keyof typeof SET_NINE_BY_SLIDE1_ID;
export type NineId = (typeof SET_NINE_BY_SLIDE1_ID)[NineSlide1Id];

/** The 17 slide-9 ids. */
export const SET_NINE_IDS = Object.values(SET_NINE_BY_SLIDE1_ID) as NineId[];

/** The 17 slide-1 ids that carry a slide-9 weapon. */
export const SET_NINE_SLIDE1_IDS = Object.keys(SET_NINE_BY_SLIDE1_ID) as NineSlide1Id[];

/**
 * Guns that did not exist on slide 1 before slide 9 was ported. They have no
 * earlier silhouette, so slide 9's artwork is their only (and newest) design.
 */
export const SET_NINE_NEW_WEAPONS = [
  'longbow', 'mp5', 'tesla_rifle', 'ion_smg', 'phaser',
  'yautja', 'identity_disc', 'proton_pack', 'heat_ray',
] as const satisfies readonly NineSlide1Id[];
export type NineNewWeapon = (typeof SET_NINE_NEW_WEAPONS)[number];

export function isNineNewWeapon(id: string): id is NineNewWeapon {
  return (SET_NINE_NEW_WEAPONS as readonly string[]).includes(id);
}

const NINE_BY_ID = new Map<string, NineWeapon>(NINE_WEAPONS.map((w) => [w.id, w]));

/** The slide-9 weapon behind a slide-1 gun, or null. */
export function setNineIdFor(id: string): NineId | null {
  return (SET_NINE_BY_SLIDE1_ID as Record<string, NineId>)[id] ?? null;
}

/** The slide-1 gun that carries a slide-9 weapon. */
export function slide1IdForNine(id: NineId): NineSlide1Id {
  return SET_NINE_SLIDE1_IDS.find((k) => SET_NINE_BY_SLIDE1_ID[k] === id) as NineSlide1Id;
}

/** Is this a ported slide-9 id? */
export function isNineId(id: string): id is NineId {
  return (SET_NINE_BY_SLIDE1_ID as Record<string, string>)[id] !== undefined
    && (SET_NINE_IDS as readonly string[]).includes(id);
}

/** Slide 9's own weapon object (its `draw`, `fire`, `onImpact`, `drawMark`). */
export function nineWeapon(id: NineId): NineWeapon {
  const w = NINE_BY_ID.get(id);
  if (!w) throw new Error(`unknown slide-9 weapon: ${id}`);
  return w;
}

/**
 * Slide 9 draws its guns with `scale(clamp(min(W/1500, H/950), 0.4, 0.74))`.
 * Slide 1's canvas is 420 × 760, so that formula would shrink everything to
 * its 0.4 floor; this factor puts slide 9's barrels at the length slide 1's
 * own guns have (measured from the proof sheet).
 */
export const NINE_SCALE = 0.62;

export interface NineOrigin {
  x: number;
  y: number;
}

/**
 * Where slide 9's grip/hand sits so that its muzzle lands on slide 1's muzzle
 * tip (cx, y0). Slide 9 aims up (`-π/2`): R(-π/2)·(x, y) = (y, -x), so the
 * muzzle sits at `origin + (my, -mx) · scale`.
 */
export function nineGunOrigin(id: NineId, cx: number, y0: number, scale = NINE_SCALE): NineOrigin {
  const [mx, my] = nineWeapon(id).muzzle;
  return { x: cx - my * scale, y: y0 + mx * scale };
}

/** Slide 9's rested pose: menus, cards and any frame without a live gun. */
export function restNineState(overrides: Partial<WeaponDrawState> = {}): WeaponDrawState {
  return { t: 0, recoil: 0, charge: 0, cycle: 1, out: 0, catchT: 9, ...overrides };
}

/**
 * Draw slide 9's own weapon art so its muzzle sits exactly on slide 1's muzzle
 * tip (cx, y0), pointing up like every other slide-1 gun.
 *
 * `state.recoil` is slide 9's 1 → 0 kick; the whole body is pushed back along
 * the barrel by the same amount slide 9's engine pushes it, so the weapon
 * looks identical to slide 9 mid-recoil.
 *
 * `live`: the gun standing in a live game holds still, exactly like slide 9's
 * (its engine never sways the weapon); menus and cards keep a slow idle sway.
 */
export function drawSetNineGun(
  c: CanvasRenderingContext2D,
  id: NineId,
  cx: number,
  y0: number,
  time: number,
  state: WeaponDrawState = restNineState(),
  scale = NINE_SCALE,
  live = false,
) {
  const w = nineWeapon(id);
  const recoil = Math.max(0, Math.min(1, state.recoil));
  // Slide 9's global recoil punch (engine.ts `drawPlayer`): world pixels, the
  // same jump whatever size the weapon is drawn at.
  const kickBack = recoil * w.recoilAmt * 1.35;
  const bounce = Math.sin(recoil * Math.PI) * w.recoilAmt * 0.28;
  const origin = nineGunOrigin(id, cx, y0 + kickBack - bounce, scale);
  // A gun at rest in a menu still breathes: the same slow sway slide 1's own
  // guns have, so a card never looks like a frozen photograph.
  const sway = live ? 0 : Math.sin(time * 1.9) * 1.3;
  const tilt = live ? 0 : Math.sin(time * 1.25 + 0.7) * 0.012;
  c.save();
  c.translate(origin.x, origin.y + sway);
  c.rotate(-Math.PI / 2 + tilt);
  c.scale(scale, scale);
  w.draw(c, { ...state, t: time, recoil });
  c.restore();
}

/** Slide 9's weapon draw, upright, for pickers that draw the whole gun. */
export function drawSetNineIcon(
  c: CanvasRenderingContext2D,
  id: NineId,
  cx: number,
  cy: number,
  size: number,
  time = 0,
) {
  const w = nineWeapon(id);
  const scale = Math.max(0.05, size / 220);
  c.save();
  c.translate(cx, cy);
  c.rotate(-Math.PI / 2);
  c.scale(scale, scale);
  (w.drawIcon ?? w.draw)(c, restNineState({ t: time }));
  c.restore();
}
