/**
 * Slide-7 (`games/game-4` / `Weapon Hit 71 Senjata`) artwork for slide 1.
 *
 * SET 2..5 share 36 weapon ids with slide 1 (only FLAMETHROWER is called
 * `flame` there), so this is a rename table, not a redraw: the art is slide 7's
 * real `drawWeapon()` (`weapons.ts` + `weaponArt.ts`), drawn at slide 1's muzzle
 * origin with slide 7's own `WeaponAnim`.
 */
import { drawWeapon } from '../vendor/game-4/src/game/weaponArt';
import { newAnim, type WeaponAnim, type WeaponId } from '../vendor/game-4/src/game/weapons';
import { setOneIdFor, type SetOneId } from './setOneArt';

/** Which slide-7 set each ported weapon comes from. */
export const SET_SEVEN_SETS = {
  snowball: 2, sniper: 2, flame: 2, bubble: 2, bamboo: 2, banana: 2,
  harpoon: 3, chicken: 3, confetti: 3, seed: 3, pizza: 3, minigun: 3,
  crossbow: 3, plasma: 3, laser: 3,
  dragon: 4, gravity: 4, honey: 4, coconut: 4, angklung: 4, bee: 4,
  sakura: 4, firework: 4, keris: 4,
  moonbeam: 5, storm: 5, pencil: 5, sandal: 5, paintball: 5, wand: 5,
  shark: 5, ghost: 5, ufo: 5, rainbow: 5, meteor: 5, diamond: 5,
  fish: 6, rpg: 6, cricket: 6, electro: 6, bazooka: 6, freeze: 6,
  rail: 6, magnet: 6, shrink: 6, grow: 6, pirate: 6, card: 6,
  holy: 7, unicorn: 7, obliterator: 7, coin: 7, saber: 7, gauntlet: 7,
  ruby: 7, emerald: 7, sapphire: 7, crystal: 7, beerifle: 7, charge: 7,
  pulse: 7, cryo: 7, hyperdrive: 7, quantum: 7, wars: 7,
} as const;

/** Which slide-7 set a ported weapon belongs to (2..5). */
export function setSevenSetOf(id: SevenId): number {
  return SET_SEVEN_SETS[id];
}

/** Slide-1 gun id -> slide-7 id (identical except `flamethrower`). */
export const SET_SEVEN_BY_SLIDE1_ID = {
  snowball: 'snowball',
  sniper: 'sniper',
  flamethrower: 'flame',
  bubble: 'bubble',
  bamboo: 'bamboo',
  banana: 'banana',
  harpoon: 'harpoon',
  chicken: 'chicken',
  confetti: 'confetti',
  seed: 'seed',
  pizza: 'pizza',
  minigun: 'minigun',
  crossbow: 'crossbow',
  plasma: 'plasma',
  laser: 'laser',
  dragon: 'dragon',
  gravity: 'gravity',
  honey: 'honey',
  coconut: 'coconut',
  angklung: 'angklung',
  bee: 'bee',
  sakura: 'sakura',
  firework: 'firework',
  keris: 'keris',
  moonbeam: 'moonbeam',
  storm: 'storm',
  pencil: 'pencil',
  sandal: 'sandal',
  paintball: 'paintball',
  wand: 'wand',
  shark: 'shark',
  ghost: 'ghost',
  ufo: 'ufo',
  rainbow: 'rainbow',
  meteor: 'meteor',
  diamond: 'diamond',
  fish: 'fish',
  rpg: 'rpg',
  cricket: 'cricket',
  electro: 'electro',
  bazooka: 'bazooka',
  freeze: 'freeze',
  railgun: 'rail',
  magnet: 'magnet',
  shrink: 'shrink',
  grow: 'grow',
  pirate: 'pirate',
  card: 'card',
  holy: 'holy',
  unicorn: 'unicorn',
  obliterator: 'obliterator',
  coingun: 'coin',
  photon_saber: 'saber',
  gauntlet_cannon: 'gauntlet',
  ruby: 'ruby',
  emerald: 'emerald',
  sapphire: 'sapphire',
  crystal: 'crystal',
  beerifle: 'beerifle',
  buster: 'charge',
  pulse_rifle: 'pulse',
  cryo_blaster: 'cryo',
  hyperdrive: 'hyperdrive',
  quantum_destabilizer: 'quantum',
  blaster: 'wars',
} as const satisfies Record<string, WeaponId>;

export type SevenSlide1Id = keyof typeof SET_SEVEN_BY_SLIDE1_ID;
export type SevenId = (typeof SET_SEVEN_BY_SLIDE1_ID)[SevenSlide1Id];

/** The 36 slide-7 ids of SET 2..5. */
export const SET_SEVEN_IDS = Object.values(SET_SEVEN_BY_SLIDE1_ID) as SevenId[];

/** The 36 slide-1 ids that carry a slide-7 weapon. */
export const SET_SEVEN_SLIDE1_IDS = Object.keys(SET_SEVEN_BY_SLIDE1_ID) as SevenSlide1Id[];

/** The slide-7 weapon behind a slide-1 gun, or null. */
export function setSevenIdFor(id: string): SevenId | null {
  return (SET_SEVEN_BY_SLIDE1_ID as Record<string, SevenId>)[id] ?? null;
}

/**
 * Every slide-3 weapon slide 1 fires with slide 3's own engine: SET 2..7 above
 * plus the six SET 1 guns (`setOneArt.ts`), all 71 of `Weapon Hit 71 Senjata`.
 */
export type SlideThreeId = SevenId | SetOneId;

/** The slide-3 weapon behind a slide-1 gun (SET 1..7), or null. */
export function slideThreeIdFor(id: string): SlideThreeId | null {
  return setSevenIdFor(id) ?? setOneIdFor(id);
}

/** Is this a slide-7 id of SET 2..5? */
export function isSevenId(id: string): id is SevenId {
  return id in SET_SEVEN_IDS_SET;
}

const SET_SEVEN_IDS_SET = new Set<string>(SET_SEVEN_IDS);

/** The slide-1 gun that carries a slide-7 weapon. */
export function slide1IdFor(id: SevenId): SevenSlide1Id {
  return SET_SEVEN_SLIDE1_IDS.find((k) => SET_SEVEN_BY_SLIDE1_ID[k] === id) as SevenSlide1Id;
}

/**
 * Draw slide 7's own weapon art, translated to slide 1's muzzle origin.
 * `anim` is slide 7's animation state (see `setSevenAnim.ts`).
 */
export function drawSetSevenGun(
  c: CanvasRenderingContext2D,
  id: SlideThreeId,
  cx: number,
  y0: number,
  time: number,
  anim: WeaponAnim,
) {
  c.save();
  c.translate(cx, y0);
  drawWeapon(c, id, anim, time);
  c.restore();
}

/** Slide 7's pose at rest: menus, cards and any frame without a live gun. */
export function restSevenAnim(): WeaponAnim {
  const a = newAnim();
  a.intro = 1;
  a.fireT = 99;
  a.orb = 1;
  a.gauge = 0.92;
  a.charge = 0;
  return a;
}

/** Live slide-1 state that slide 7's artwork needs to look alive. */
export interface SevenAnimState {
  /** Seconds since the last trigger (9 = rested, like slide 7's idle). */
  sinceShot: number;
  /** Held charge, 0..1 (CHARGE BLASTER, plasma…). */
  charge: number;
  /** Spin-up, 0..1 (minigun, gatling…). */
  spin: number;
}

/**
 * Slide 7 advances a spring per weapon (`WeaponAnim`) from its fire recipes.
 * Slide 1 fires its own rounds, so the same motion is rebuilt from the state it
 * already tracks: the trigger age drives recoil/slide/pump/heat, the held
 * charge drives `charge`, and the spin-up drives the drums.
 */
export function buildSevenAnim(st: SevenAnimState): WeaponAnim {
  const a = newAnim();
  const ft = Math.max(0, st.sinceShot);
  a.intro = 1;
  a.fireT = ft;
  a.orb = 1;
  a.gauge = 0.92;
  a.recoil = 0.5 * Math.exp(-ft * 9) * Math.cos(ft * 26);
  a.slide = ft < 0.035 ? ft / 0.035 : Math.max(0, 1 - (ft - 0.035) / 0.09);
  // Pump action: out over 0.12 s, back by 0.27 s — slide 7's own timing.
  const pump = ft < 0.12 ? ft / 0.12 : ft < 0.27 ? 1 - (ft - 0.12) / 0.15 : 0;
  a.pump = pump;
  a.pumpS = pump;
  // Bolt: lift, pull back, return — again slide 7's curve.
  const bolt = ft < 0.12 ? 0 : ft < 0.3 ? (ft - 0.12) / 0.18 : ft < 0.4 ? 1
    : ft < 0.58 ? 1 - (ft - 0.4) / 0.18 : 0;
  a.bolt = bolt;
  a.lift = ft < 0.58 ? Math.min(1, ft / 0.12) : 0;
  a.charge = st.charge;
  a.charging = st.charge > 0 && ft < 0.25;
  a.heat = Math.max(st.spin, Math.exp(-ft * 0.9));
  a.spin = st.spin * 26;
  a.fan = ft * 20;
  a.fuse = Math.max(0, 1.6 - ft * 0.6);
  a.water = 1;
  a.pouchTarget = ft < 0.2 ? 1 : 0;
  a.pouchY = a.pouchTarget;
  a.loaded = true;
  a.pulse = -1;
  a.idx = Math.floor(ft * 12) % 12;
  return a;
}
