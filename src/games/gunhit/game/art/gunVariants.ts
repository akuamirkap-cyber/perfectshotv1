import type { WeaponId } from '../weapons';
import { RETIRED_WEAPONS } from '../retiredWeapons';
import { savedValues } from '../safeStorage';
import { SET_SEVEN_BY_SLIDE1_ID, SET_SEVEN_SETS } from '../setSevenArt';
import { SET_NINE_NEW_WEAPONS, isNineNewWeapon } from '../setNineArt';
import { SET_ELEVEN_BY_SLIDE1_ID, SET_ELEVEN_NEW_IDS, SET_ELEVEN_NEW_WEAPONS } from '../setElevenArt';
import { SET_TWO_IDS, SET_TWO_BY_SLIDE1_ID } from '../setTwoArt';
import { SET_SIX_SLIDE1_IDS, type SixSlide1Id } from '../setSixArt';
import { ZIP_WEAPON_IDS, type ZipWeaponId } from '../../zipWeapons/ids';
import { notifyGunLookChange } from './lookChange';

/**
 * Guns locked to their original art AND shot only. PLASMA and LASER used to be
 * here; they now carry slide 3's own PLASMA GUN and LASER GUN as their newest
 * card (user request: every one of slide 3's 71 weapons lives on slide 1), and
 * their classic look stays pickable as "Sebelumnya".
 */
export const FIXED_CLASSIC_WEAPONS = [] as const satisfies readonly WeaponId[];
export type FixedClassicWeapon = (typeof FIXED_CLASSIC_WEAPONS)[number];

/** Only guns with an actual design choice appear in the DESAIN tab. */
const ALL_EDITABLE_WEAPON_IDS = [
  'dragon', 'diamond', 'rainbow', 'meteor', 'golden',
  'moonbeam', 'chicken', 'honey', 'cricket', 'fish',
  'electro', 'blackhole', 'slingshot', 'blowgun', 'shotgun',
  'soaker', 'snowball', 'sniper', 'flamethrower', 'bubble',
  'bamboo', 'banana', 'harpoon', 'confetti', 'seed',
  'pizza', 'minigun', 'crossbow', 'gravity', 'coconut',
  'angklung', 'bee', 'sakura', 'firework', 'keris',
  'storm', 'pencil', 'sandal', 'paintball', 'wand',
  'shark', 'ghost', 'ufo', 'rpg', 'bazooka',
  'freeze', 'railgun', 'magnet', 'shrink', 'grow',
  'pirate', 'card', 'holy', 'unicorn', 'obliterator',
  'coingun', 'photon_saber', 'gauntlet_cannon', 'ironman_hand', 'ruby', 'emerald',
  'sapphire', 'crystal', 'beerifle', 'buster', 'pulse_rifle',
  'cryo_blaster', 'hyperdrive', 'quantum_destabilizer', 'blaster',
  // Slide 3's PLASMA GUN and LASER GUN (both had only their classic card).
  'plasma', 'laser',
  // Slide 9 (games/game-6): the eight slide-1 guns it updates and the nine
  // weapons it added that slide 1 never had.
  'pistol', 'ak47', 'pred', 'sniper', 'railgun',
  'dragon', 'photon_saber', 'gauntlet_cannon',
  'longbow', 'mp5', 'tesla_rifle', 'ion_smg', 'phaser',
  'yautja', 'identity_disc', 'proton_pack', 'heat_ray',
  // Slide 11 (games/game-8): the XENOMORPH it shares with slide 1 plus the ten
  // weapons slide 1 never had.
  'xeno',
  'mega_buster', 'harmonic_disruptor', 'absolute_zero', 'helios_flare',
  'chrono_rifle', 'orbital_beacon', 'helix_pulsar', 'singularity',
  'prism_lance', 'nano_swarm',
] as const satisfies readonly WeaponId[];

// Keep the internal id union for shared imported code, but never expose retired
// weapons in the design picker or exports. Existing order is preserved.
export const EDITABLE_WEAPONS = ALL_EDITABLE_WEAPON_IDS.filter(id => !RETIRED_WEAPONS.has(id));

/**
 * Slide-6 (`games/game-2` / Weapon Wheel Hit) weapons. Slide 6 is the original
 * `Weapon Wheel Hit`, and its three beam weapons share their name with guns
 * slide 1 already has (through slide 9), so slide 6 adds one more design and
 * one more shot card to those three — it never adds a new gun.
 */
export const SET_SIX_DESIGN_WEAPONS = SET_SIX_SLIDE1_IDS as readonly WeaponId[];
export type SetSixDesignWeapon = SixSlide1Id;

export function isSetSixDesignWeapon(id: WeaponId | 'old'): id is SetSixDesignWeapon {
  return (SET_SIX_DESIGN_WEAPONS as readonly string[]).includes(id);
}

/**
 * Slide-7 SET 1 weapons that exist on slide 1 under the same name. Their
 * newest design is the real slide-7 artwork (`setOneArt.drawSetOneGun`), so
 * they get an extra "Set 1" design card alongside their requested defaults.
 */
export const SET_ONE_DESIGN_WEAPONS = [
  'golden', 'blackhole', 'slingshot', 'blowgun', 'shotgun', 'soaker',
] as const satisfies readonly WeaponId[];
export type SetOneDesignWeapon = (typeof SET_ONE_DESIGN_WEAPONS)[number];

export function isSetOneDesignWeapon(id: WeaponId | 'old'): id is SetOneDesignWeapon {
  return (SET_ONE_DESIGN_WEAPONS as readonly string[]).includes(id);
}
/**
 * Slide-7 SET 2..5 weapons. Their newest design is slide 7's own artwork
 * (`setSevenArt.drawSetSevenGun`); the slide-1 silhouette they had before
 * stays pickable as its own card, regardless of the requested default.
 */
export const SET_SEVEN_DESIGN_WEAPONS = [
  'snowball', 'sniper', 'flamethrower', 'bubble', 'bamboo',
  'banana', 'harpoon', 'chicken', 'confetti', 'seed',
  'pizza', 'minigun', 'crossbow', 'dragon', 'gravity',
  'honey', 'coconut', 'angklung', 'bee', 'sakura',
  'firework', 'keris', 'moonbeam', 'storm', 'pencil',
  'sandal', 'paintball', 'wand', 'shark', 'ghost',
  'ufo', 'rainbow', 'meteor', 'diamond', 'fish',
  'rpg', 'cricket', 'electro', 'bazooka', 'freeze',
  'railgun', 'magnet', 'shrink', 'grow', 'pirate',
  'card', 'holy', 'unicorn', 'obliterator', 'coingun',
  'photon_saber', 'gauntlet_cannon', 'ruby', 'emerald', 'sapphire',
  'crystal', 'beerifle', 'buster', 'pulse_rifle', 'cryo_blaster',
  'hyperdrive', 'quantum_destabilizer', 'blaster',
  'plasma', 'laser',
] as const satisfies readonly WeaponId[];
export type SetSevenDesignWeapon = (typeof SET_SEVEN_DESIGN_WEAPONS)[number];

export function isSetSevenDesignWeapon(id: WeaponId | 'old'): id is SetSevenDesignWeapon {
  return (SET_SEVEN_DESIGN_WEAPONS as readonly string[]).includes(id);
}

/**
 * Slide-9 (`games/game-6`) weapons. Their newest design is slide 9's own
 * artwork (`setNineArt.drawSetNineGun`); whatever the gun looked like before
 * stays pickable on its own card, regardless of the requested default. The nine guns
 * slide 1 never had (`longbow`, `mp5`, `tesla_rifle`, `ion_smg`, `phaser`,
 * `yautja`, `identity_disc`, `proton_pack`, `heat_ray`) only have this card.
 */
export const SET_NINE_DESIGN_WEAPONS = [
  'pistol', 'ak47', 'pred', 'sniper', 'railgun',
  'dragon', 'photon_saber', 'gauntlet_cannon',
  'longbow', 'mp5', 'tesla_rifle', 'ion_smg', 'phaser',
  'yautja', 'identity_disc', 'proton_pack', 'heat_ray',
] as const satisfies readonly WeaponId[];
export type SetNineDesignWeapon = (typeof SET_NINE_DESIGN_WEAPONS)[number];

export function isSetNineDesignWeapon(id: WeaponId | 'old'): id is SetNineDesignWeapon {
  return (SET_NINE_DESIGN_WEAPONS as readonly string[]).includes(id);
}

/**
 * Slide-11 (`games/game-8`) weapons. Slide 11 is the newest layer, so its own
 * artwork and shot are selectable for the guns it updates, and the only card
 * for the ten guns it adds. PISTOL, AK-47 and SNIPER keep their explicitly
 * requested defaults instead; PISTOL has no Slide 5 design card.
 */
export const SET_ELEVEN_DESIGN_WEAPONS = [
  ...new Set(
    [...Object.keys(SET_ELEVEN_BY_SLIDE1_ID), ...SET_ELEVEN_NEW_IDS].filter(
      (id) => id !== 'pistol',
    ),
  ),
] as readonly WeaponId[];
export type SetElevenDesignWeapon = (typeof SET_ELEVEN_DESIGN_WEAPONS)[number];

export function isSetElevenDesignWeapon(id: WeaponId | 'old'): id is SetElevenDesignWeapon {
  return (SET_ELEVEN_DESIGN_WEAPONS as readonly string[]).includes(id);
}

/**
 * Guns that gain Slide 11's ("Slide 5") shot effect card. PISTOL keeps its
 * Slide 5 shot effect option even though its Slide 5 weapon design is removed.
 */
export const SET_ELEVEN_EFFECT_WEAPONS = [
  ...new Set([...Object.keys(SET_ELEVEN_BY_SLIDE1_ID), ...SET_ELEVEN_NEW_IDS, 'gauntlet_cannon'].filter(id => id !== 'photon_saber')),
] as readonly WeaponId[];
export type SetElevenEffectWeapon = (typeof SET_ELEVEN_EFFECT_WEAPONS)[number];

export function isSetElevenEffectWeapon(id: WeaponId | 'old'): id is SetElevenEffectWeapon {
  return (SET_ELEVEN_EFFECT_WEAPONS as readonly string[]).includes(id);
}

/**
 * Slide 2 (`games/fireworkgun`) weapons. Slide 2 is the oldest layer of the
 * hub, so its artwork and its shots are offered as an EXTRA card on the eight
 * guns slide 1 already had; every other card stays exactly as it was.
 */
export const SET_TWO_DESIGN_WEAPONS = [
  // BLACK HOLE already wears slide 2's cannon as its "Terbaru" card, so it only
  // gains the slide-2 SHOT; a second identical design card would be a dud.
  ...new Set(Object.keys(SET_TWO_BY_SLIDE1_ID).filter((id) => id !== 'blackhole')),
] as readonly WeaponId[];
export type SetTwoDesignWeapon = (typeof SET_TWO_DESIGN_WEAPONS)[number];

export function isSetTwoDesignWeapon(id: WeaponId | 'old'): id is SetTwoDesignWeapon {
  return (SET_TWO_DESIGN_WEAPONS as readonly string[]).includes(id);
}

/**
 * Guns that gain slide 2's own SHOT as a new card. BLACK HOLE is left out: its
 * "Baru" shot already IS slide 2's collapsing singularity, so a second card
 * would do exactly the same thing.
 */
export const SET_TWO_EFFECT_WEAPONS = [...SET_TWO_DESIGN_WEAPONS] as readonly WeaponId[];
export type SetTwoEffectWeapon = (typeof SET_TWO_EFFECT_WEAPONS)[number];

export function isSetTwoEffectWeapon(id: WeaponId | 'old'): id is SetTwoEffectWeapon {
  return (SET_TWO_EFFECT_WEAPONS as readonly string[]).includes(id);
}

/** True when this gun carries a slide-11 update (its green NEW badge). */
export function hasSlide11Update(id: string): boolean {
  return (SET_ELEVEN_DESIGN_WEAPONS as readonly string[]).includes(id);
}

/** True for the ten slide-1 guns that only exist because of slide 11. */
export function isElevenOnlyWeapon(id: WeaponId | 'old'): boolean {
  return (SET_ELEVEN_NEW_IDS as readonly string[]).includes(id);
}

/**
 * Guns that only ever had ONE old look on slide 1, so the picker offers two
 * cards instead of three: "Sebelumnya" (slide-1 art) and "Terbaru" (slide 2).
 */
// No gun is limited to two cards any more: BLACK HOLE gained the slide-7 staff
// as a third silhouette, and the SET 1 guns gained their own card.
export const TWO_CARD_WEAPONS = [] as const satisfies readonly WeaponId[];
export type EditableWeapon = (typeof ALL_EDITABLE_WEAPON_IDS)[number];
/** Guns whose previous/current/latest renderers are three distinct designs. */
const NO_LATEST_DESIGN = [
  'honey', 'cricket', 'fish', 'electro', 'slingshot',
  'blowgun', 'shotgun', 'soaker', 'snowball', 'sniper',
  'flamethrower', 'bubble', 'bamboo', 'banana', 'harpoon',
  'confetti', 'seed', 'pizza', 'minigun', 'crossbow',
  'gravity', 'coconut', 'angklung', 'bee', 'sakura',
  'firework', 'keris', 'storm', 'pencil', 'sandal',
  'paintball', 'wand', 'shark', 'ghost', 'ufo',
  'rpg', 'bazooka', 'freeze', 'railgun', 'magnet',
  'shrink', 'grow', 'pirate', 'card', 'holy',
  'unicorn', 'obliterator', 'coingun', 'photon_saber', 'gauntlet_cannon', 'ironman_hand',
  'ruby', 'emerald', 'sapphire', 'crystal', 'beerifle',
  'buster', 'pulse_rifle', 'cryo_blaster', 'hyperdrive', 'quantum_destabilizer',
  'blaster',
  'pistol', 'ak47', 'pred', 'longbow', 'mp5', 'tesla_rifle', 'ion_smg',
  'phaser', 'yautja', 'identity_disc', 'proton_pack', 'heat_ray',
  'xeno', 'mega_buster', 'harmonic_disruptor', 'absolute_zero', 'helios_flare',
  'chrono_rifle', 'orbital_beacon', 'helix_pulsar', 'singularity', 'prism_lance',
  'nano_swarm',
  // PLASMA and LASER: one classic look ("Sebelumnya") plus slide 3's card.
  'plasma', 'laser',
] as const;

/**
 * Guns whose "Sebelumnya" art is NOT a separate silhouette: slide 1 only ever
 * drew them one way, and that drawing is the gun's normal renderer. They are
 * excluded from `drawOriginalGun` so nothing is duplicated.
 */
export const NO_SEPARATE_ORIGINAL = [
  'snowball', 'sniper', 'flamethrower', 'bubble', 'bamboo',
  'banana', 'harpoon', 'confetti', 'seed', 'pizza',
  'minigun', 'crossbow', 'gravity', 'coconut', 'angklung',
  'bee', 'sakura', 'firework', 'keris', 'storm',
  'pencil', 'sandal', 'paintball', 'wand', 'shark',
  'ghost', 'ufo', 'rpg', 'bazooka', 'freeze',
  'railgun', 'magnet', 'shrink', 'grow', 'pirate',
  'card', 'holy', 'unicorn', 'obliterator', 'coingun',
  'photon_saber', 'gauntlet_cannon', 'ironman_hand', 'ruby', 'emerald', 'sapphire',
  'crystal', 'beerifle', 'buster', 'pulse_rifle', 'cryo_blaster',
  'hyperdrive', 'quantum_destabilizer', 'blaster',
  'pistol', 'ak47', 'pred', 'longbow', 'mp5', 'tesla_rifle', 'ion_smg',
  'phaser', 'yautja', 'identity_disc', 'proton_pack', 'heat_ray',
  'xeno', 'mega_buster', 'harmonic_disruptor', 'absolute_zero', 'helios_flare',
  'chrono_rifle', 'orbital_beacon', 'helix_pulsar', 'singularity', 'prism_lance',
  'nano_swarm',
] as const;
export type OriginalDesignWeapon = Exclude<VariantWeapon, (typeof NO_SEPARATE_ORIGINAL)[number]>;
export function hasSeparateOriginal(id: VariantWeapon): id is OriginalDesignWeapon {
  return !(NO_SEPARATE_ORIGINAL as readonly string[]).includes(id);
}
export type LatestDesignWeapon = Exclude<EditableWeapon, (typeof NO_LATEST_DESIGN)[number]>;
export const VARIANT_WEAPONS = [...EDITABLE_WEAPONS, ...FIXED_CLASSIC_WEAPONS] as const;
export type VariantWeapon = (typeof VARIANT_WEAPONS)[number];

/**
 * `zip` is the animated SVG card (`svg-weapons-with-glow-animation.zip`). Its id
 * is kept ahead of the slide ids on purpose: the arsenal shows the skin NUMBER,
 * so the zip guns read "SKIN NO. 3" — the card the player asked for — instead of
 * 5th place at the end of the list.
 */
export type GunVariant = 'original' | 'current' | 'zip' | 'latest' | 'set1' | 'set2' | 'set6' | 'set7' | 'set9' | 'set11';
export const GUN_VARIANTS: readonly { id: GunVariant; label: string }[] = [
  { id: 'original', label: 'Sebelumnya' },
  { id: 'current', label: 'Sekarang' },
  { id: 'latest', label: 'Terbaru' },
];
/** Every card of a slide-3 (`games/game-4`, Weapon Hit 71 Senjata) weapon. */
export const SLIDE_THREE_LABEL = 'Slide 3';
/** The slide-3 SET 1 design card (newest for its six weapons). */
export const SET_ONE_VARIANT: { id: GunVariant; label: string } = { id: 'set1', label: SLIDE_THREE_LABEL };
/** The slide-3 SET 2..7 design card (its own SET number is in the arsenal badge). */
export function setSevenVariant(_id: SetSevenDesignWeapon): { id: GunVariant; label: string } {
  return { id: 'set7', label: SLIDE_THREE_LABEL };
}
/*
 * Card labels follow the hub's *current* slide numbers. The ids (`set6`,
 * `set9`, `set11`…) and the module names (`setSixFx`, `setElevenFx`…) keep the
 * number each slide had when its guns were imported. Firework 8-Gun and Rainbow
 * Gun left the hub first, then Obliterator Hit and Weapon Hit Arena, then Neon
 * Ballistics and Ballistics Lab, so now: set6 = Slide 2 (Wheel Hit Ultra FX),
 * set1/set7 = Slide 3 (Weapon Hit 71 Senjata), set9 = Slide 4 (Arsenal Wheel
 * Hit Range), set11 = Slide 5 (Knife-Hit Arsenal FX), and the old slide-2 card
 * is called "Firework".
 */
/** The slide-2 design card: slide 2's own artwork for the eight guns it shares. */
export const SET_TWO_VARIANT: { id: GunVariant; label: string } = { id: 'set2', label: 'Firework' };
/** The slide-9 design card (newest for every ported slide-9 gun). */
export const SET_NINE_VARIANT: { id: GunVariant; label: string } = { id: 'set9', label: 'Slide 4' };
/** The slide-11 design card (newest for every ported slide-11 gun). */
export const SET_ELEVEN_VARIANT: { id: GunVariant; label: string } = { id: 'set11', label: 'Slide 5' };
/** The slide-6 design card: slide 6's own artwork for the three guns it shares. */
export const SET_SIX_VARIANT: { id: GunVariant; label: string } = { id: 'set6', label: 'Slide 2' };
/**
 * The zip artwork card (`svg-weapons-with-glow-animation.zip`, "Skin No. 3"):
 * the animated SVG marble-and-crystal gun the five zip weapons wear. It is a
 * card of its OWN now, so picking another card really changes the design
 * instead of the zip art sitting on top of every choice.
 */
export const ZIP_VARIANT: { id: GunVariant; label: string } = { id: 'zip', label: 'Skin 3' };
export const ZIP_DESIGN_WEAPONS = ZIP_WEAPON_IDS as readonly WeaponId[];
export type ZipDesignWeapon = ZipWeaponId;
export function isZipDesignWeapon(id: WeaponId | 'old' | string): id is ZipDesignWeapon {
  return (ZIP_WEAPON_IDS as readonly string[]).includes(id);
}
export type GunEffect = 'original' | 'new' | 'set2' | 'set6' | 'set7' | 'set9' | 'set11' | 'zip' | 'xeno_hybrid' | 'ironman_combo';
export const GUN_EFFECTS: readonly { id: GunEffect; label: string }[] = [
  { id: 'original', label: 'Sebelumnya' },
  { id: 'new', label: 'Baru' },
];
/** The slide-3 shot card of SET 2..7. */
export function setSevenEffect(_id: SetSevenDesignWeapon): { id: GunEffect; label: string } {
  return { id: 'set7', label: SLIDE_THREE_LABEL };
}
/**
 * The slide-3 shot of the six SET 1 guns. It keeps the `new` id their saved
 * choices already use (it used to read "Baru"); slide 3's own engine fires it.
 */
export const SET_ONE_EFFECT: { id: GunEffect; label: string } = { id: 'new', label: SLIDE_THREE_LABEL };
/** The slide-2 shot card: slide 2's own round, muzzle, burst and sounds. */
export const SET_TWO_EFFECT: { id: GunEffect; label: string } = { id: 'set2', label: 'Firework' };
/** The slide-9 shot card: slide 9's own projectile, burst and sounds. */
export const SET_NINE_EFFECT: { id: GunEffect; label: string } = { id: 'set9', label: 'Slide 4' };
/** The slide-11 shot card: slide 11's own round, burst and sounds. */
export const SET_ELEVEN_EFFECT: { id: GunEffect; label: string } = { id: 'set11', label: 'Slide 5' };
/** The slide-6 shot card: slide 6's own beam, muzzle burst and scorch mark. */
export const SET_SIX_EFFECT: { id: GunEffect; label: string } = { id: 'set6', label: 'Slide 2' };
/**
 * The zip's own shot card ("Skin 3"): the faceted crystal round of
 * `svg-weapons-with-glow-animation.zip` drawn by slide 2's exact recipe — the
 * ice-blue crown-and-pavilion gem with its halo, sparkle cross and shard burst.
 */
export const ZIP_EFFECT: { id: GunEffect; label: string } = { id: 'zip', label: 'Skin 3' };

/**
 * PLASMA and LASER never had a "Baru" shot: their cards are their classic shot
 * and slide 3's. A stale `new` (old save, old caller) draws the classic one.
 */
export function hasNoNewShot(id: WeaponId | 'old'): boolean {
  return id === 'plasma' || id === 'laser';
}

export function isFixedClassicGun(id: WeaponId | 'old'): id is FixedClassicWeapon {
  return (FIXED_CLASSIC_WEAPONS as readonly string[]).includes(id);
}
export function canChooseGunDesign(id: WeaponId | 'old'): id is EditableWeapon {
  return (EDITABLE_WEAPONS as readonly string[]).includes(id);
}
export function supportsGunVariants(id: WeaponId | 'old'): id is VariantWeapon {
  return isFixedClassicGun(id) || canChooseGunDesign(id);
}
export function supportsLatestDesign(id: VariantWeapon): id is LatestDesignWeapon {
  return !isFixedClassicGun(id) && !(NO_LATEST_DESIGN as readonly string[]).includes(id);
}

/**
 * True when the gun gained slide 7's own artwork and shot (SET 1..7). The
 * arsenal marks these with a green "NEW" badge so the updated guns are easy to
 * find among the 80.
 */
export function hasSlide7Update(id: WeaponId | 'old'): boolean {
  return isSetOneDesignWeapon(id) || isSetSevenDesignWeapon(id);
}

/** Which slide-7 set an updated gun came from (1 for the first batch). */
export function slide7UpdateSet(id: WeaponId | 'old'): number | null {
  if (isSetOneDesignWeapon(id)) return 1;
  if (isSetSevenDesignWeapon(id)) return SET_SEVEN_SETS[SET_SEVEN_BY_SLIDE1_ID[id]];
  return null;
}

/**
 * True when the gun gained slide 6's own artwork and shot. The arsenal marks
 * these with the green "NEW" badge too.
 */
export function hasSlide6Update(id: WeaponId | 'old'): boolean {
  return isSetSixDesignWeapon(id);
}

/**
 * True when the gun gained slide 9's own artwork and shot (the 17 ported
 * weapons). The arsenal marks these with the green "NEW" badge.
 */
export function hasSlide9Update(id: WeaponId | 'old'): boolean {
  return isSetNineDesignWeapon(id);
}

export function isTwoCardGun(id: WeaponId | 'old'): boolean {
  return (TWO_CARD_WEAPONS as readonly string[]).includes(id);
}

function baseGunVariantOptions(id: VariantWeapon) {
  if (isFixedClassicGun(id)) return GUN_VARIANTS.slice(0, 1);
  // SET 2..5 weapons: the slide-1 silhouette(s) they already had, plus slide
  // 7's own artwork as the newest card (and the default).
  if (isSetSevenDesignWeapon(id)) {
    const card = setSevenVariant(id);
    // PLASMA and LASER only ever had their classic look on slide 1.
    if (id === 'plasma' || id === 'laser') return [GUN_VARIANTS[0], card];
    // HONEY already had a second silhouette ("Sekarang"), keep it.
    if (id === 'honey') return [...GUN_VARIANTS.slice(0, 2), card];
    // Three genuine slide-1 designs: keep all of them, slide 7 last.
    if (supportsLatestDesign(id as LatestDesignWeapon)) return [...GUN_VARIANTS, card];
    // Guns whose slide-1 art is a separate "Sebelumnya" design (CRICKET, FISH,
    // ELECTRO) keep both slide-1 cards and gain slide 7 as the newest.
    if (!(NO_SEPARATE_ORIGINAL as readonly string[]).includes(id)) {
      return [...GUN_VARIANTS.slice(0, 2), card];
    }
    // Every other ported gun only ever had one slide-1 look.
    return [GUN_VARIANTS[0], card];
  }
  // SET 1 weapons: the slide-1 silhouette(s) plus slide 7's own artwork, which
  // is the newest design and therefore the default.
  if (isSetOneDesignWeapon(id)) {
    // GOLDEN GUN already has three genuine slide-1 designs, so it keeps all of
    // them and gains "Set 1" as a fourth card.
    if (id === 'golden') return [...GUN_VARIANTS, SET_ONE_VARIANT];
    // The BLACK HOLE cannon keeps its slide-2 look as "Terbaru" next to the
    // slide-7 staff, which is what the default now points at.
    if (id === 'blackhole') return [GUN_VARIANTS[0], GUN_VARIANTS[2], SET_ONE_VARIANT];
    // The other four only ever had one slide-1 look.
    return [GUN_VARIANTS[0], SET_ONE_VARIANT];
  }
  // Only two genuine silhouettes: the old slide-1 art and the slide-2 art.
  if (isTwoCardGun(id)) return [GUN_VARIANTS[0], GUN_VARIANTS[2]];
  // These have a previous/current comparison only; don't offer a fake third
  // card whose renderer would duplicate one of those two designs.
  if (!(NO_LATEST_DESIGN as readonly string[]).includes(id)) return GUN_VARIANTS;
  // A gun with no separate "Sebelumnya" art only ever had ONE slide-1 look:
  // both cards would draw the same gun, so it gets a single honest card.
  if ((NO_SEPARATE_ORIGINAL as readonly string[]).includes(id)) return GUN_VARIANTS.slice(0, 1);
  return GUN_VARIANTS.slice(0, 2);
}
/**
 * Every design card a gun offers. Slide-9 weapons keep the cards they already
 * had and gain slide 9's own artwork as the newest one; the nine guns that only
 * exist because of slide 9 have that single card.
 */
/**
 * File slide 6's card where it belongs by age: the hub's slides are exported
 * out of order, but a gun's cards read oldest → newest, so slide 6 sits before
 * slide 7/9/11's cards (and before slide 2's, which is appended last because
 * slide 2 is a full stage export older than every gun on this list).
 */
function withSixCard<T extends { id: string }>(cards: readonly T[], card: T): T[] {
  const later = ['set2', 'set7', 'set9', 'set11'];
  const at = cards.findIndex((o) => later.includes(o.id));
  const list = [...cards];
  list.splice(at < 0 ? list.length : at, 0, card);
  return list;
}

export function getGunVariantOptions(id: VariantWeapon): readonly { id: GunVariant; label: string }[] {
  if (RETIRED_WEAPONS.has(id)) return [];
  // The zip's five weapons (Diamond Gun, Wars Blaster, Paintball, Shark
  // Launcher, Martian Heat-Ray) keep every card they had and gain the zip's own
  // animated SVG as their last card — that is "Skin No. 3" for the Diamond Gun.
  const cards = isSetTwoDesignWeapon(id)
    ? [...getGunVariantOptionsBeforeSetTwo(id), SET_TWO_VARIANT]
    : getGunVariantOptionsBeforeSetTwo(id);
  // Slide 6 is the oldest board in the hub, so its artwork is an EXTRA card on
  // the three guns it shares — exactly what slide 2 got. It is filed where it
  // belongs by age (before slide 7/9/11's cards), and the card the player
  // already picked stays the default.
  const withSix = isSetSixDesignWeapon(id) ? withSixCard(cards, SET_SIX_VARIANT) : cards;
  if (!isZipDesignWeapon(id)) return withSix;
  // The zip's card is filed third, so it is "SKIN NO. 3" on the five guns it
  // draws; the third card those guns used to have stays right behind it.
  const list = withSix.filter((card) => card.id !== 'zip');
  list.splice(Math.min(2, list.length), 0, ZIP_VARIANT);
  return list;
}

/** The design cards a gun had before slide 2 was exported. */
function getGunVariantOptionsBeforeSetTwo(id: VariantWeapon) {
  if (isSetElevenDesignWeapon(id)) {
    if (isElevenOnlyWeapon(id)) return [SET_ELEVEN_VARIANT];
    return [...getGunVariantOptionsBeforeEleven(id), SET_ELEVEN_VARIANT];
  }
  if (!isSetNineDesignWeapon(id)) return baseGunVariantOptions(id);
  if (isNineNewWeapon(id)) return [SET_NINE_VARIANT];
  const hadSeven = SET_SEVEN_DESIGN_WEAPONS.includes(id as SetSevenDesignWeapon);
  const before = hadSeven
    ? baseGunVariantOptions(id)
    // `baseGunVariantOptions` already answers for SET 1 / SET 2..5 guns; for
    // PISTOL, AK-47 and the PREDATOR caster slide 1 only ever had one look.
    : [GUN_VARIANTS[0]] as const;
  return [...before, SET_NINE_VARIANT];
}

export function getGunEffectOptions(id: VariantWeapon): readonly { id: GunEffect; label: string }[] {
  if (RETIRED_WEAPONS.has(id)) return [];
  if (id === 'ironman_hand') return [{ id: 'ironman_combo', label: 'Gabungan Efek 3 + 5' }];
  if (id === 'xeno') return [...getGunEffectOptionsBeforeSetTwo(id), { id: 'xeno_hybrid', label: 'Efek 4' }];
  const cards = isSetTwoEffectWeapon(id) && !isFixedClassicGun(id)
    ? [...getGunEffectOptionsBeforeSetTwo(id), SET_TWO_EFFECT]
    : getGunEffectOptionsBeforeSetTwo(id);
  const withSix = isSetSixDesignWeapon(id) ? withSixCard(cards, SET_SIX_EFFECT) : cards;
  // The zip weapons fire the zip's own faceted-crystal round on their zip card
  // (it stays pickable next to every other shot card).
  if (isZipDesignWeapon(id)) {
    return [...withSix.filter(card => card.id !== 'zip'), ZIP_EFFECT];
  }
  return withSix;
}

/** The shot cards a gun had before slide 2 was exported. */
function getGunEffectOptionsBeforeSetTwo(id: VariantWeapon) {
  if (isSetElevenEffectWeapon(id)) {
    if (isElevenOnlyWeapon(id)) return [SET_ELEVEN_EFFECT];
    return [...getGunEffectOptionsBeforeEleven(id), SET_ELEVEN_EFFECT];
  }
  if (isSetNineDesignWeapon(id)) {
    if (isNineNewWeapon(id)) return [SET_NINE_EFFECT];
    return [...getGunEffectOptionsBase(id), SET_NINE_EFFECT];
  }
  return getGunEffectOptionsBase(id);
}

/** The design cards a gun had before slide 11 (slide 9 included). */
function getGunVariantOptionsBeforeEleven(id: VariantWeapon) {
  if (isSetNineDesignWeapon(id)) {
    // A gun slide 9 introduced has no slide-1 silhouette: its first card is
    // slide 9's own artwork, exactly as before slide 11 existed.
    if (isNineNewWeapon(id)) return [SET_NINE_VARIANT];
    const hadSeven = SET_SEVEN_DESIGN_WEAPONS.includes(id as SetSevenDesignWeapon);
    const before = hadSeven ? baseGunVariantOptions(id) : [GUN_VARIANTS[0]] as const;
    return [...before, SET_NINE_VARIANT];
  }
  return baseGunVariantOptions(id);
}

/** The effect cards a gun had before slide 11 (slide 9 included). */
function getGunEffectOptionsBeforeEleven(id: VariantWeapon) {
  if (isSetNineDesignWeapon(id)) {
    if (isNineNewWeapon(id)) return [SET_NINE_EFFECT];
    return [...getGunEffectOptionsBase(id), SET_NINE_EFFECT];
  }
  return getGunEffectOptionsBase(id);
}

function getGunEffectOptionsBase(id: VariantWeapon) {
  if (isFixedClassicGun(id)) return GUN_EFFECTS.slice(0, 1);
  // PLASMA and LASER: their classic shot, and slide 3's own (no "Baru" shot
  // was ever drawn for them).
  if (id === 'plasma' || id === 'laser') return [GUN_EFFECTS[0], setSevenEffect(id)];
  // SET 1: the `new` shot is slide 3's own. BLACK HOLE shares that card with
  // slide 2's void, which its slide-2 cannon design fires instead — so the card
  // only reads "Slide 3" while slide 3's staff is the design in use.
  if (isSetOneDesignWeapon(id)) {
    if (id === 'blackhole' && getGunVariant('blackhole') !== 'set1') return GUN_EFFECTS;
    return [GUN_EFFECTS[0], SET_ONE_EFFECT];
  }
  // Slide 7's own shot is a third card for SET 2..5: the two slide-1 effects
  // stay pickable, and the requested factory default is chosen separately.
  if (isSetSevenDesignWeapon(id)) return [...GUN_EFFECTS, setSevenEffect(id)];
  return GUN_EFFECTS;
}

// Factory loadouts not superseded by the more recent requested presets below.
const DEFAULT_DESIGNS: Record<EditableWeapon, GunVariant> = {
  // DIAMOND keeps the zip artwork ("Skin 3") as its design; every other card is
  // still pickable, so the design tab really changes the gun.
  dragon: 'set11', diamond: 'zip', rainbow: 'set7', meteor: 'set7', golden: 'set1',
  moonbeam: 'set7', chicken: 'set7', honey: 'set7', cricket: 'set7', fish: 'set7',
  electro: 'set7', blackhole: 'set1', slingshot: 'set1', blowgun: 'set1', shotgun: 'set1',
  soaker: 'set1', snowball: 'set7', sniper: 'set11', flamethrower: 'set7', bubble: 'set7',
  bamboo: 'set7', banana: 'set7', harpoon: 'set7', confetti: 'set7', seed: 'set7',
  pizza: 'set7', minigun: 'set7', crossbow: 'set7', gravity: 'set7', coconut: 'set7',
  angklung: 'set7', bee: 'set7', sakura: 'set7', firework: 'set7', keris: 'set7',
  storm: 'set7', pencil: 'set7', sandal: 'set7', paintball: 'zip', wand: 'set7',
  shark: 'zip', ghost: 'set7', ufo: 'set7', rpg: 'set7', bazooka: 'set7',
  freeze: 'set7', railgun: 'set11', magnet: 'set7', shrink: 'set7', grow: 'set7',
  pirate: 'set7', card: 'set7', holy: 'set7', unicorn: 'set7', obliterator: 'set7',
  coingun: 'set7', photon_saber: 'set11', gauntlet_cannon: 'original', ironman_hand: 'set11', ruby: 'set7', emerald: 'set7',
  sapphire: 'set7', crystal: 'set7', beerifle: 'set7', buster: 'set7', pulse_rifle: 'set7',
  cryo_blaster: 'set7', hyperdrive: 'set7', quantum_destabilizer: 'set7', blaster: 'zip',
  // Slide 3's PLASMA GUN and LASER GUN are their newest design (user request).
  plasma: 'set7', laser: 'set7',
  // PISTOL uses Slide 01's classic pistol design ('original') by default.
  pistol: 'original', ak47: 'set11', pred: 'set11',
  longbow: 'set11', mp5: 'set11', tesla_rifle: 'set11', ion_smg: 'set11', phaser: 'set11',
  yautja: 'set9', identity_disc: 'set11', proton_pack: 'set11', heat_ray: 'zip',
  // Slide 11 is the newest layer: its own art/shot is the default for the
  // seventeen guns it updates and the only card of the ten guns it adds.
  mega_buster: 'set11',
  harmonic_disruptor: 'set11',
  absolute_zero: 'set11',
  helios_flare: 'set11',
  chrono_rifle: 'set11',
  orbital_beacon: 'set11',
  helix_pulsar: 'set11',
  singularity: 'set11',
  prism_lance: 'set11',
  nano_swarm: 'set11', xeno: 'set11',
};

// FIREWORK LAUNCHER keeps slide 2's celebrated fireworks as its default effect
// (explicit request): the SET 4 card is its artwork, not its shot.
const DEFAULT_EFFECTS: Record<EditableWeapon, GunEffect> = {
  dragon: 'set11', diamond: 'zip', rainbow: 'set7', meteor: 'set7', golden: 'new',
  moonbeam: 'set7', chicken: 'set7', honey: 'set7', cricket: 'set7', fish: 'set7',
  electro: 'set7', blackhole: 'new', slingshot: 'new', blowgun: 'new', shotgun: 'new',
  soaker: 'new', snowball: 'set7', sniper: 'set11', flamethrower: 'set7', bubble: 'set7',
  bamboo: 'set7', banana: 'set7', harpoon: 'set7', confetti: 'set7', seed: 'set7',
  pizza: 'set7', minigun: 'set7', crossbow: 'set7', gravity: 'set7', coconut: 'set7',
  angklung: 'set7', bee: 'set7', sakura: 'set7', firework: 'new', keris: 'set7',
  storm: 'set7', pencil: 'set7', sandal: 'set7', paintball: 'zip', wand: 'set7',
  shark: 'zip', ghost: 'set7', ufo: 'set7', rpg: 'set7', bazooka: 'set7',
  freeze: 'set7', railgun: 'set11', magnet: 'set7', shrink: 'set7', grow: 'set7',
  pirate: 'set7', card: 'set7', holy: 'set7', unicorn: 'set7', obliterator: 'set7',
  coingun: 'set7', photon_saber: 'set9', gauntlet_cannon: 'set7', ironman_hand: 'ironman_combo', ruby: 'set7', emerald: 'set7',
  sapphire: 'set7', crystal: 'set7', beerifle: 'set7', buster: 'set7', pulse_rifle: 'set7',
  cryo_blaster: 'set7', hyperdrive: 'set7', quantum_destabilizer: 'set7', blaster: 'zip',
  // Baseline shot cards; the requested LASER override is applied below.
  plasma: 'set7', laser: 'set7',
  // PISTOL uses Slide 4's shot effect ('set9') by default while keeping Slide 5 selectable.
  pistol: 'set9', ak47: 'set11', pred: 'set11',
  longbow: 'set11', mp5: 'set11', tesla_rifle: 'set11', ion_smg: 'set11', phaser: 'set11',
  yautja: 'set9', identity_disc: 'set11', proton_pack: 'set11', heat_ray: 'zip',
  // Slide 11's own shot is the newest effect of all of them.
  mega_buster: 'set11',
  harmonic_disruptor: 'set11',
  absolute_zero: 'set11',
  helios_flare: 'set11',
  chrono_rifle: 'set11',
  orbital_beacon: 'set11',
  helix_pulsar: 'set11',
  singularity: 'set11',
  prism_lance: 'set11',
  nano_swarm: 'set11', xeno: 'set11',
};


export interface MarkedWeaponDefault {
  variant: GunVariant;
  effect: GunEffect;
}

// The 29 combinations exported by the player (the imported list minus the
// retired Shrink Ray). IDs refer to the existing cards; their order, labels,
// projectile mechanics and other weapons remain unchanged.
const REQUESTED_DEFAULT_PRESETS = {
  ak47: { variant: 'original', effect: 'set11' },
  crossbow: { variant: 'original', effect: 'set7' },
  laser: { variant: 'set7', effect: 'original' },
  fish: { variant: 'current', effect: 'set7' },
  rpg: { variant: 'original', effect: 'set7' },
  cricket: { variant: 'current', effect: 'new' },
  bazooka: { variant: 'set7', effect: 'set7' },
  freeze: { variant: 'original', effect: 'set7' },
  blackhole: { variant: 'set1', effect: 'new' },
  slingshot: { variant: 'original', effect: 'new' },
  blowgun: { variant: 'set1', effect: 'new' },
  shotgun: { variant: 'original', effect: 'original' },
  soaker: { variant: 'set1', effect: 'set2' },
  snowball: { variant: 'set7', effect: 'set7' },
  sniper: { variant: 'original', effect: 'set9' },
  flamethrower: { variant: 'original', effect: 'set7' },
  bubble: { variant: 'original', effect: 'set7' },
  bamboo: { variant: 'original', effect: 'set7' },
  banana: { variant: 'original', effect: 'new' },
  harpoon: { variant: 'set7', effect: 'set7' },
  chicken: { variant: 'set7', effect: 'set7' },
  confetti: { variant: 'set7', effect: 'set7' },
  seed: { variant: 'original', effect: 'set7' },
  pizza: { variant: 'original', effect: 'set7' },
  minigun: { variant: 'set7', effect: 'new' },
  railgun: { variant: 'set11', effect: 'set7' },
  magnet: { variant: 'original', effect: 'set7' },
  pirate: { variant: 'original', effect: 'set7' },
  card: { variant: 'set7', effect: 'set7' },
} as const satisfies Partial<Record<EditableWeapon, MarkedWeaponDefault>>;

const requestedDefaultEntries = Object.entries(REQUESTED_DEFAULT_PRESETS) as
  [EditableWeapon, MarkedWeaponDefault][];
for (const [id, preset] of requestedDefaultEntries) {
  DEFAULT_DESIGNS[id] = preset.variant;
  DEFAULT_EFFECTS[id] = preset.effect;
}

function readChoices(key: string): Record<string, unknown> | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch { return null; /* Storage may be disabled or contain malformed JSON. */ }
}

const DESIGN_KEY = 'gunhit:gun-designs:v3';
const EFFECT_KEY = 'gunhit:shot-effects:v3';
const PISTOL_LOADOUT_KEY = 'gunhit:pistol-loadout:v2';
// Apply this 30-weapon revision once, including profiles upgraded from v1.
const DEFAULTS_REVISION_KEY = 'gunhit:requested-defaults:v2';
// The zip artwork became a design card of its own: every profile that still
// carries a pre-card choice (the zip art used to sit on top of all of them, so
// the stored card said e.g. "Slide 3") is moved to the zip card once, and the
// zip shot with it — that is what the player was actually seeing.
const ZIP_CARD_REVISION_KEY = 'gunhit:zip-design-card:v1';
const GAUNTLET_REVISION_KEY = 'gunhit:gauntlet-ironman:v1';
const saved: Partial<Record<EditableWeapon, GunVariant>> = {};
const effects: Partial<Record<EditableWeapon, GunEffect>> = {};

function hasPistolCustomSave(): boolean {
  try {
    return globalThis.localStorage?.getItem(PISTOL_LOADOUT_KEY) === '1';
  } catch {
    return false;
  }
}

/** Defaults change only the silhouette, never weapon stats or mechanics. */
export function getGunVariant(id: WeaponId): GunVariant {
  if (isFixedClassicGun(id)) return 'original';
  return canChooseGunDesign(id) ? saved[id] ?? DEFAULT_DESIGNS[id] : 'current';
}

export function setGunVariant(id: EditableWeapon, variant: GunVariant): void {
  if (!getGunVariantOptions(id).some(option => option.id === variant)) return;
  saved[id] = variant;
  try {
    globalThis.localStorage?.setItem(DESIGN_KEY, JSON.stringify(saved));
    if (id === 'pistol') globalThis.localStorage?.setItem(PISTOL_LOADOUT_KEY, '1');
  }
  catch { /* Continue using this session's choice if storage is unavailable. */ }
  notifyGunLookChange();
}

/** Shot appearance remains independent from the gun's physical design. */
export function getGunEffect(id: WeaponId | 'old'): GunEffect {
  if (isFixedClassicGun(id)) return 'original';
  return canChooseGunDesign(id) ? effects[id] ?? DEFAULT_EFFECTS[id] : 'new';
}

export function setGunEffect(id: EditableWeapon, effect: GunEffect): void {
  if (!getGunEffectOptions(id).some(option => option.id === effect)) return;
  effects[id] = effect;
  try {
    globalThis.localStorage?.setItem(EFFECT_KEY, JSON.stringify(effects));
    if (id === 'pistol') globalThis.localStorage?.setItem(PISTOL_LOADOUT_KEY, '1');
  }
  catch { /* Continue using this session's choice if storage is unavailable. */ }
  notifyGunLookChange();
}

/** Deduplicated editable weapons in canonical order (EDITABLE_WEAPONS keeps its legacy length). */
export const UNIQUE_EDITABLE_WEAPONS: readonly EditableWeapon[] = [...new Set(EDITABLE_WEAPONS)];

export type DefaultExportScope = 'marked_or_changed' | 'marked_only' | 'all';

export interface WeaponDefaultExportEntry {
  id: EditableWeapon;
  name: string;
  skinNo: number;
  skinTotal: number;
  skinId: GunVariant;
  skinLabel: string;
  effectNo: number;
  effectTotal: number;
  effectId: GunEffect;
  effectLabel: string;
  marked: boolean;
  changedFromFactory: boolean;
}

const DEFAULT_PRESETS_KEY = 'gunhit:default-presets:v1';
const markedDefaults: Partial<Record<EditableWeapon, MarkedWeaponDefault>> = {};

function persistMarkedDefaults(): void {
  try {
    globalThis.localStorage?.setItem(DEFAULT_PRESETS_KEY, JSON.stringify(markedDefaults));
  } catch { /* Continue using in-memory defaults if storage is unavailable. */ }
}

function getEffectOptionsForVariant(id: EditableWeapon, variant: GunVariant): readonly { id: GunEffect; label: string }[] {
  if (id === 'blackhole') {
    return variant === 'set1' ? [GUN_EFFECTS[0], SET_ONE_EFFECT] : GUN_EFFECTS;
  }
  return getGunEffectOptions(id);
}

/**
 * Module imports happen before the app's storage-readiness gate. In restricted
 * embeds the storage shim may still be restoring IndexedDB; never migrate or
 * overwrite those keys until that restoration has completed.
 */
function restoreSavedLoadouts(): void {
  for (const key of Object.keys(saved) as EditableWeapon[]) delete saved[key];
  for (const key of Object.keys(effects) as EditableWeapon[]) delete effects[key];
  for (const key of Object.keys(markedDefaults) as EditableWeapon[]) delete markedDefaults[key];
  const designsOnDisk = readChoices(DESIGN_KEY);
  const effectsOnDisk = readChoices(EFFECT_KEY);
  const keepSavedPistol = hasPistolCustomSave();
  let applyGauntletDefault = true;
  try { applyGauntletDefault = globalThis.localStorage?.getItem(GAUNTLET_REVISION_KEY) !== '1'; }
  catch { /* Storage denied: use the requested default in memory. */ }
  let applyRequestedDefaults = true;
  try {
    applyRequestedDefaults = globalThis.localStorage?.getItem(DEFAULTS_REVISION_KEY) !== '1';
  } catch { /* Storage denied: use the requested choices in memory. */ }
  let applyZipCard = true;
  try {
    applyZipCard = globalThis.localStorage?.getItem(ZIP_CARD_REVISION_KEY) !== '1';
  } catch { /* Storage denied: use the zip card in memory. */ }
  for (const id of EDITABLE_WEAPONS) {
    if (id === 'pistol' && !keepSavedPistol) continue;
    if (id === 'gauntlet_cannon' && applyGauntletDefault) continue;
    // Discard only these 29 older selections during the one-time migration.
    if (applyRequestedDefaults && Object.hasOwn(REQUESTED_DEFAULT_PRESETS, id)) continue;
    const design = designsOnDisk?.[id];
    if (getGunVariantOptions(id).some(option => option.id === design)) saved[id] = design as GunVariant;
    const effect = effectsOnDisk?.[id];
    if (getGunEffectOptions(id).some(option => option.id === effect)) effects[id] = effect as GunEffect;
  }

  const presetsOnDisk = readChoices(DEFAULT_PRESETS_KEY);
  if (presetsOnDisk) {
    for (const id of UNIQUE_EDITABLE_WEAPONS) {
      const raw = presetsOnDisk[id];
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
      const rec = raw as { variant?: unknown; effect?: unknown };
      // The deleted Photon effect cannot remain equipped or pinned; keep the
      // marked skin and move only that obsolete effect to the last valid card.
      if (id === 'photon_saber' && rec.effect === 'set11') rec.effect = 'set9';
      const variantOpts = getGunVariantOptions(id);
      if (!variantOpts.some(o => o.id === rec.variant)) continue;
      const chosenVariant = rec.variant as GunVariant;
      const effectOpts = getEffectOptionsForVariant(id, chosenVariant);
      if (!effectOpts.some(o => o.id === rec.effect)) continue;
      markedDefaults[id] = { variant: chosenVariant, effect: rec.effect as GunEffect };
    }
  }

  if (applyGauntletDefault) {
    markedDefaults.gauntlet_cannon = { variant: 'original', effect: 'set7' };
  }

  if (applyZipCard) {
    // Before the zip artwork became a card of its own it REPLACED the drawing of
    // all five guns on every card, so a saved "Slide 3 / Slide 2 …" meant "the
    // zip gun". Move each of them onto the zip card and the zip shot, exactly
    // the look the profile already had on screen; from here on every other card
    // shows (and fires) its own design again.
    for (const id of ZIP_DESIGN_WEAPONS as readonly EditableWeapon[]) {
      saved[id] = 'zip';
      effects[id] = 'zip';
      // A profile that had already pinned one of these keeps its ★ — on the card
      // it was actually looking at. Nobody gains a new mark from this migration.
      if (markedDefaults[id]) markedDefaults[id] = { variant: 'zip', effect: 'zip' };
    }
    try {
      const store = globalThis.localStorage;
      if (store) {
        store.setItem(DESIGN_KEY, JSON.stringify(saved));
        store.setItem(EFFECT_KEY, JSON.stringify(effects));
        store.setItem(DEFAULT_PRESETS_KEY, JSON.stringify(markedDefaults));
        store.setItem(ZIP_CARD_REVISION_KEY, '1');
      }
    } catch { /* The in-memory defaults still work when storage is denied. */ }
  }

  if (applyRequestedDefaults) {
    // Seed these as marked presets too, preserving any marks on other weapons.
    // A later unmark/clear or selection change persists normally. Complete all
    // writes before the revision marker so an interrupted migration can retry.
    for (const [id, preset] of requestedDefaultEntries) {
      markedDefaults[id] = { ...preset };
    }
    try {
      const store = globalThis.localStorage;
      if (store) {
        store.setItem(DESIGN_KEY, JSON.stringify(saved));
        store.setItem(EFFECT_KEY, JSON.stringify(effects));
        store.setItem(DEFAULT_PRESETS_KEY, JSON.stringify(markedDefaults));
        store.setItem(DEFAULTS_REVISION_KEY, '1');
      }
    } catch { /* The in-memory defaults still work when storage is denied. */ }
  }
  if (applyGauntletDefault) {
    try {
      const store = globalThis.localStorage;
      if (store) {
        store.setItem(DESIGN_KEY, JSON.stringify(saved));
        store.setItem(EFFECT_KEY, JSON.stringify(effects));
        store.setItem(DEFAULT_PRESETS_KEY, JSON.stringify(markedDefaults));
        store.setItem(GAUNTLET_REVISION_KEY, '1');
      }
    } catch { /* Keep the in-memory default if storage is unavailable. */ }
  }
}

if (savedValues.isReady()) restoreSavedLoadouts();
else savedValues.subscribe(restoreSavedLoadouts);

export function getGunSkinAndEffectPosition(
  id: EditableWeapon,
  variant: GunVariant = getGunVariant(id),
  effect: GunEffect = getGunEffect(id),
): {
  skinNo: number;
  skinTotal: number;
  skinId: GunVariant;
  skinLabel: string;
  effectNo: number;
  effectTotal: number;
  effectId: GunEffect;
  effectLabel: string;
} {
  const designs = getGunVariantOptions(id);
  const skinIdx = Math.max(0, designs.findIndex(o => o.id === variant));
  const resolvedSkin = designs[skinIdx] ?? designs[0];
  const effectList = getEffectOptionsForVariant(id, resolvedSkin.id);
  const effIdx = Math.max(0, effectList.findIndex(o => o.id === effect));
  const resolvedEff = effectList[effIdx] ?? effectList[0];
  return {
    skinNo: skinIdx + 1,
    skinTotal: designs.length,
    skinId: resolvedSkin.id,
    skinLabel: resolvedSkin.label,
    effectNo: effIdx + 1,
    effectTotal: effectList.length,
    effectId: resolvedEff.id,
    effectLabel: resolvedEff.label,
  };
}

/**
 * Mark a weapon's skin + shot effect combination as its user-pinned default
 * (independent per weapon) and immediately equip both choices on that weapon.
 */
export function markGunDefault(
  id: EditableWeapon,
  variant: GunVariant = getGunVariant(id),
  effect: GunEffect = getGunEffect(id),
): MarkedWeaponDefault | null {
  const designs = getGunVariantOptions(id);
  if (!designs.some(o => o.id === variant)) return null;
  const effectList = getEffectOptionsForVariant(id, variant);
  const validEffect = effectList.some(o => o.id === effect)
    ? effect
    : (effectList[0]?.id ?? effect);
  setGunVariant(id, variant);
  setGunEffect(id, validEffect);
  const entry: MarkedWeaponDefault = { variant, effect: validEffect };
  markedDefaults[id] = entry;
  persistMarkedDefaults();
  return entry;
}

export function unmarkGunDefault(id: EditableWeapon): void {
  delete markedDefaults[id];
  persistMarkedDefaults();
}

export function clearAllMarkedGunDefaults(): void {
  for (const key of Object.keys(markedDefaults) as EditableWeapon[]) {
    delete markedDefaults[key];
  }
  persistMarkedDefaults();
}

export function getMarkedGunDefault(id: WeaponId): MarkedWeaponDefault | null {
  return canChooseGunDesign(id) ? (markedDefaults[id] ?? null) : null;
}

export function isGunDefaultMarked(id: WeaponId): boolean {
  return getMarkedGunDefault(id) !== null;
}

export function isCurrentSelectionMarkedDefault(id: WeaponId): boolean {
  if (!canChooseGunDesign(id)) return false;
  const marked = markedDefaults[id];
  if (!marked) return false;
  return marked.variant === getGunVariant(id) && marked.effect === getGunEffect(id);
}

export function isGunModifiedFromFactory(id: WeaponId): boolean {
  if (!canChooseGunDesign(id)) return false;
  return getGunVariant(id) !== DEFAULT_DESIGNS[id] || getGunEffect(id) !== DEFAULT_EFFECTS[id];
}

export function getMarkedGunDefaultCount(): number {
  // Retired weapons can still sit in an older save; they are not part of the
  // arsenal any more, so they never count as marked defaults.
  let count = 0;
  for (const id of Object.keys(markedDefaults) as EditableWeapon[]) {
    if (canChooseGunDesign(id)) count++;
  }
  return count;
}

export function getWeaponDefaultExportEntries(
  scope: DefaultExportScope = 'marked_or_changed',
  catalog?: readonly { id: WeaponId; name: string }[],
): WeaponDefaultExportEntry[] {
  const seen = new Set<EditableWeapon>();
  const ordered: { id: EditableWeapon; name: string }[] = [];
  if (catalog && catalog.length > 0) {
    for (const item of catalog) {
      if (!canChooseGunDesign(item.id) || seen.has(item.id)) continue;
      seen.add(item.id);
      ordered.push({ id: item.id, name: item.name });
    }
  }
  for (const id of UNIQUE_EDITABLE_WEAPONS) {
    if (seen.has(id)) continue;
    seen.add(id);
    ordered.push({ id, name: id });
  }

  const out: WeaponDefaultExportEntry[] = [];
  for (const { id, name } of ordered) {
    const marked = markedDefaults[id];
    const isMarked = !!marked;
    const chosenVariant = marked ? marked.variant : getGunVariant(id);
    const chosenEffect = marked ? marked.effect : getGunEffect(id);
    const changed = chosenVariant !== DEFAULT_DESIGNS[id] || chosenEffect !== DEFAULT_EFFECTS[id];

    if (scope === 'marked_only' && !isMarked) continue;
    if (scope === 'marked_or_changed' && !isMarked && !changed) continue;

    const pos = getGunSkinAndEffectPosition(id, chosenVariant, chosenEffect);
    out.push({
      id,
      name,
      ...pos,
      marked: isMarked,
      changedFromFactory: changed,
    });
  }
  return out;
}

export function formatWeaponDefaultsExport(
  scope: DefaultExportScope = 'marked_or_changed',
  catalog?: readonly { id: WeaponId; name: string }[],
): string {
  const entries = getWeaponDefaultExportEntries(scope, catalog);
  const scopeLabel =
    scope === 'marked_only' ? 'hanya ★ ditandai'
      : scope === 'marked_or_changed' ? 'ditandai / diubah'
      : 'semua senjata';
  const header = [
    `# SGA DEFAULT WEAPON CONFIG (${entries.length} senjata · mode: ${scopeLabel})`,
    '# Format: id | Nama | skin=No/Total(id:Label) | efek=No/Total(id:Label) | status',
  ];
  if (entries.length === 0) {
    return [
      ...header,
      '# (Belum ada senjata yang ditandai default atau diubah. Tandai ★ DEFAULT pada senjata atau pilih tab SEMUA SENJATA.)',
    ].join('\n');
  }
  const lines = entries.map((e) => {
    const status = e.marked ? '★DEFAULT' : e.changedFromFactory ? 'DIUBAH' : 'BAWAAN';
    return `${e.id} | ${e.name} | skin=${e.skinNo}/${e.skinTotal}(${e.skinId}:${e.skinLabel}) | efek=${e.effectNo}/${e.effectTotal}(${e.effectId}:${e.effectLabel}) | ${status}`;
  });
  return [...header, ...lines].join('\n');
}
