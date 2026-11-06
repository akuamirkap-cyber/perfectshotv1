import type { WeaponId } from '../weapons';
import { getGunVariant, isFixedClassicGun, isSetElevenDesignWeapon, supportsGunVariants, type GunVariant, type VariantWeapon } from './gunVariants';
import { SET_ELEVEN_BY_SLIDE1_ID, SET_ELEVEN_METRICS, SET_ELEVEN_NEW_IDS, SET_ELEVEN_NEW_WEAPONS } from '../setElevenArt';
import { SET_SIX_BY_SLIDE1_ID, SET_SIX_METRICS } from '../setSixArt';

export interface GunMetrics {
  totalLen: number;
  centerOffsetY: number;
  centerOffsetX: number;
  span: number;
}

/**
 * Ink bounds of a gun in muzzle space (origin = muzzle, +y runs down the
 * barrel). Only the guns whose silhouette is too irregular for the rough
 * span/centre table are listed; they are measured from the renderer itself so
 * menu thumbnails can fit the WHOLE gun instead of cropping it.
 */
export interface GunInkBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const GUN_INK_BOX: Partial<Record<WeaponId, GunInkBox>> = {
  // Measured at rest (no recoil/charge) from drawGun(), re-measured whenever the
  // art changes (the Air Cannon lost its arm, the Xenomorph got a real neck).
  xeno: { x0: -104, y0: -41, x1: 48, y1: 415 },
  dora: { x0: -40, y0: -85, x1: 39, y1: 102 },
  pred: { x0: -101, y0: -85, x1: 100, y1: 240 },
};

export function getGunInkBox(id: WeaponId): GunInkBox | null {
  return GUN_INK_BOX[id] ?? null;
}

export interface PreviewFit {
  scale: number;
  tx: number;
  ty: number;
}

/**
 * Fit an ink box inside a W×H preview rotated a quarter turn (how every menu
 * strip draws guns). Returns the scale and the translation that puts the box
 * corner-to-corner inside the canvas — padding included — so nothing clips.
 */
export function fitInkBoxQuarterTurn(box: GunInkBox, w: number, h: number, pad = 8): PreviewFit {
  const bw = Math.max(1, box.x1 - box.x0);
  const bh = Math.max(1, box.y1 - box.y0);
  const scale = Math.max(0.01, Math.min((w - pad * 2) / bh, (h - pad * 2) / bw));
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;
  // rotate(90°): local (x, y) -> screen offset (-y * scale, x * scale)
  return { scale, tx: w / 2 + cy * scale, ty: h / 2 - cx * scale };
}

// Measured actual bounding box of every gun from muzzle (cx, y0)
// centerOffsetY = vertical distance from muzzle (y0) to the visual center
// centerOffsetX = horizontal distance from barrel line (cx) to center of mass
// span = maximum overall dimension (diagonal/length) used for auto-scale
export const GUN_METRICS: Partial<Record<WeaponId, Partial<GunMetrics>>> = {
  pistol: { totalLen: 172, centerOffsetY: 84, centerOffsetX: 22, span: 185 },
  ak47: { totalLen: 265, centerOffsetY: 130, centerOffsetX: 24, span: 270 },
  nail: { totalLen: 168, centerOffsetY: 74, centerOffsetX: 24, span: 182 },
  crossbow: { totalLen: 225, centerOffsetY: 110, centerOffsetX: 0, span: 230 },
  plasma: { totalLen: 225, centerOffsetY: 106, centerOffsetX: 12, span: 245 },
  laser: { totalLen: 192, centerOffsetY: 94, centerOffsetX: 2, span: 198 },
  fish: { totalLen: 158, centerOffsetY: 78, centerOffsetX: 0, span: 168 },
  rpg: { totalLen: 226, centerOffsetY: 110, centerOffsetX: 4, span: 230 },
  cricket: { totalLen: 160, centerOffsetY: 77, centerOffsetX: 4, span: 190 },
  electro: { totalLen: 180, centerOffsetY: 88, centerOffsetX: 2, span: 192 },
  bazooka: { totalLen: 270, centerOffsetY: 132, centerOffsetX: 12, span: 275 },
  freeze: { totalLen: 182, centerOffsetY: 82, centerOffsetX: 10, span: 192 },
  golden: { totalLen: 180, centerOffsetY: 86, centerOffsetX: 17, span: 210 },
  blackhole: { totalLen: 174, centerOffsetY: 84, centerOffsetX: 2, span: 180 },
  slingshot: { totalLen: 176, centerOffsetY: 88, centerOffsetX: 0, span: 184 },
  blowgun: { totalLen: 290, centerOffsetY: 145, centerOffsetX: 5, span: 295 },
  shotgun: { totalLen: 226, centerOffsetY: 113, centerOffsetX: 6, span: 224 },
  soaker: { totalLen: 164, centerOffsetY: 75, centerOffsetX: -1, span: 174 },
  snowball: { totalLen: 202, centerOffsetY: 98, centerOffsetX: -3, span: 208 },
  sniper: { totalLen: 236, centerOffsetY: 114, centerOffsetX: -3, span: 242 },
  flamethrower: { totalLen: 186, centerOffsetY: 74, centerOffsetX: 8, span: 192 },
  bamboo: { totalLen: 210, centerOffsetY: 100, centerOffsetX: 4, span: 230 },
  banana: { totalLen: 175, centerOffsetY: 78, centerOffsetX: 9, span: 185 },
  bubble: { totalLen: 166, centerOffsetY: 80, centerOffsetX: 2, span: 174 },
  harpoon: { totalLen: 265, centerOffsetY: 130, centerOffsetX: 14, span: 270 },
  chicken: { totalLen: 194, centerOffsetY: 91, centerOffsetX: 2, span: 198 },
  confetti: { totalLen: 184, centerOffsetY: 80, centerOffsetX: 0, span: 188 },
  seed: { totalLen: 178, centerOffsetY: 88, centerOffsetX: -4, span: 184 },
  pizza: { totalLen: 182, centerOffsetY: 76, centerOffsetX: 6, span: 188 },
  minigun: { totalLen: 235, centerOffsetY: 115, centerOffsetX: 0, span: 240 },
  railgun: { totalLen: 214, centerOffsetY: 106, centerOffsetX: 0, span: 218 },
  magnet: { totalLen: 154, centerOffsetY: 74, centerOffsetX: 4, span: 162 },
  shrink: { totalLen: 165, centerOffsetY: 80, centerOffsetX: 14, span: 170 },
  grow: { totalLen: 165, centerOffsetY: 80, centerOffsetX: 14, span: 170 },
  pirate: { totalLen: 192, centerOffsetY: 86, centerOffsetX: 0, span: 196 },
  card: { totalLen: 160, centerOffsetY: 78, centerOffsetX: 14, span: 165 },
  dragon: { totalLen: 185, centerOffsetY: 82, centerOffsetX: 0, span: 240 },
  gravity: { totalLen: 170, centerOffsetY: 82, centerOffsetX: 16, span: 175 },
  honey: { totalLen: 204, centerOffsetY: 100, centerOffsetX: 2, span: 208 },
  coconut: { totalLen: 225, centerOffsetY: 110, centerOffsetX: 14, span: 230 },
  angklung: { totalLen: 185, centerOffsetY: 92, centerOffsetX: 12, span: 190 },
  bee: { totalLen: 170, centerOffsetY: 82, centerOffsetX: 16, span: 175 },
  yoyo: { totalLen: 186, centerOffsetY: 93, centerOffsetX: 14, span: 205 },
  sakura: { totalLen: 170, centerOffsetY: 82, centerOffsetX: 14, span: 175 },
  acid: { totalLen: 170, centerOffsetY: 82, centerOffsetX: 16, span: 175 },
  keris: { totalLen: 208, centerOffsetY: 102, centerOffsetX: 0, span: 215 },
  firework: { totalLen: 185, centerOffsetY: 90, centerOffsetX: 14, span: 190 },
  anchor: { totalLen: 220, centerOffsetY: 108, centerOffsetX: 14, span: 225 },
  shark: { totalLen: 180, centerOffsetY: 88, centerOffsetX: 16, span: 185 },
  ghost: { totalLen: 152, centerOffsetY: 82, centerOffsetX: 0, span: 186 },
  ufo: { totalLen: 194, centerOffsetY: 86, centerOffsetX: 2, span: 204 },
  rainbow: { totalLen: 188, centerOffsetY: 90, centerOffsetX: 2, span: 196 },
  meteor: { totalLen: 178, centerOffsetY: 78, centerOffsetX: 3, span: 184 },
  diamond: { totalLen: 165, centerOffsetY: 80, centerOffsetX: 0, span: 170 },
  moonbeam: { totalLen: 198, centerOffsetY: 88, centerOffsetX: 0, span: 204 },
  storm: { totalLen: 172, centerOffsetY: 76, centerOffsetX: 2, span: 178 },
  pencil: { totalLen: 180, centerOffsetY: 88, centerOffsetX: 8, span: 185 },
  sandal: { totalLen: 165, centerOffsetY: 80, centerOffsetX: 12, span: 170 },
  paintball: { totalLen: 175, centerOffsetY: 85, centerOffsetX: 18, span: 185 },
  wand: { totalLen: 202, centerOffsetY: 94, centerOffsetX: 0, span: 210 },
  ruby: { totalLen: 184, centerOffsetY: 92, centerOffsetX: 12, span: 192 },
  emerald: { totalLen: 165, centerOffsetY: 80, centerOffsetX: 14, span: 170 },
  sapphire: { totalLen: 234, centerOffsetY: 116, centerOffsetX: 12, span: 242 },
  crystal: { totalLen: 192, centerOffsetY: 88, centerOffsetX: 2, span: 202 },
  beerifle: { totalLen: 300, centerOffsetY: 148, centerOffsetX: 16, span: 305 },
  buster: { totalLen: 170, centerOffsetY: 82, centerOffsetX: 10, span: 175 },
  holy: { totalLen: 175, centerOffsetY: 85, centerOffsetX: 16, span: 180 },
  unicorn: { totalLen: 175, centerOffsetY: 85, centerOffsetX: 16, span: 180 },
  obliterator: { totalLen: 225, centerOffsetY: 110, centerOffsetX: 16, span: 230 },
  coingun: { totalLen: 170, centerOffsetY: 82, centerOffsetX: 16, span: 175 },
  blaster: { totalLen: 185, centerOffsetY: 90, centerOffsetX: 16, span: 190 },
  // ---------------------------------------------------------- SCI-FI
  photon_saber: { totalLen: 240, centerOffsetY: 120, centerOffsetX: 8, span: 245 },
  gauntlet_cannon: { totalLen: 196, centerOffsetY: 100, centerOffsetX: 0, span: 204 },
  pulse_rifle: { totalLen: 240, centerOffsetY: 118, centerOffsetX: 14, span: 245 },
  cryo_blaster: { totalLen: 158, centerOffsetY: 72, centerOffsetX: -5, span: 168 },
  hyperdrive: { totalLen: 166, centerOffsetY: 78, centerOffsetX: 8, span: 174 },
  quantum_destabilizer: { totalLen: 195, centerOffsetY: 94, centerOffsetX: 12, span: 200 },
  // ---------------------------------------------------------- ELEMENTAL ARSENAL (slide 7)
  // Measured silhouettes (w×h at rest): xeno 152×456, dora 79×187, pred 201×325.
  // `span` is the box diagonal after the 45° showcase rotation, i.e.
  // (w + h) / √2 — the old 135/165/200 values were far too small, so every
  // menu scaled these three up until they were cropped.
  xeno: { totalLen: 456, centerOffsetY: 187, centerOffsetX: -28, span: 430 },
  dora: { totalLen: 187, centerOffsetY: 9, centerOffsetX: -1, span: 188 },
  pred: { totalLen: 325, centerOffsetY: 78, centerOffsetX: -1, span: 372 },
};

// Variant-specific centers also keep the three comparison cards at the same
// apparent size. The rest of the arsenal retains its existing metrics.
type VariantMetrics = Partial<Record<GunVariant, GunMetrics>> & { original?: GunMetrics };

const VARIANT_METRICS: Partial<Record<VariantWeapon, VariantMetrics>> = {
  plasma: {
    original: { totalLen: 180, centerOffsetY: 85, centerOffsetX: 15, span: 195 },
    latest: { totalLen: 180, centerOffsetY: 88, centerOffsetX: 9, span: 211 },
  },
  laser: {
    original: { totalLen: 192, centerOffsetY: 94, centerOffsetX: 2, span: 198 },
    latest: { totalLen: 180, centerOffsetY: 88, centerOffsetX: 9, span: 212 },
  },
  chicken: {
    original: { totalLen: 185, centerOffsetY: 88, centerOffsetX: 13, span: 203 },
    latest: { totalLen: 194, centerOffsetY: 91, centerOffsetX: 2, span: 198 },
  },
  dragon: {
    original: { totalLen: 175, centerOffsetY: 85, centerOffsetX: 16, span: 195 },
    latest: { totalLen: 180, centerOffsetY: 88, centerOffsetX: 8, span: 218 },
  },
  diamond: {
    original: { totalLen: 165, centerOffsetY: 80, centerOffsetX: 14, span: 190 },
    latest: { totalLen: 180, centerOffsetY: 87, centerOffsetX: 11, span: 210 },
  },
  rainbow: {
    original: { totalLen: 188, centerOffsetY: 90, centerOffsetX: 2, span: 196 },
    latest: { totalLen: 180, centerOffsetY: 87, centerOffsetX: 9, span: 210 },
  },
  meteor: {
    original: { totalLen: 178, centerOffsetY: 78, centerOffsetX: 3, span: 184 },
    latest: { totalLen: 180, centerOffsetY: 87, centerOffsetX: 9, span: 210 },
  },
  golden: {
    original: { totalLen: 170, centerOffsetY: 80, centerOffsetX: 22, span: 185 },
    latest: { totalLen: 180, centerOffsetY: 87, centerOffsetX: 10, span: 210 },
    set1: { totalLen: 150, centerOffsetY: 66, centerOffsetX: 31, span: 174 }, // -17,-9..79,141
  },
  blackhole: {
    original: { totalLen: 174, centerOffsetY: 84, centerOffsetX: 2, span: 180 },
    // Measured from the slide-2 renderer (games/fireworkgun drawBHGun):
    // ink runs x -117..116, y -76..216 around the muzzle, so the 45° showcase
    // diagonal is (233 + 292) / √2 ≈ 371. The old 180 cropped the orbit ring.
    latest: { totalLen: 216, centerOffsetY: 70, centerOffsetX: 0, span: 371 },
    // Slide-7 BLACK HOLE staff: ink x -51..51, y -51..244.
    set1: { totalLen: 295, centerOffsetY: 97, centerOffsetX: 0, span: 281 },
  },
  moonbeam: {
    original: { totalLen: 198, centerOffsetY: 88, centerOffsetX: 0, span: 204 },
    latest: { totalLen: 175, centerOffsetY: 86, centerOffsetX: 0, span: 204 },
  },
  honey: {
    original: { totalLen: 204, centerOffsetY: 100, centerOffsetX: 2, span: 208 },
  },
  cricket: {
    original: { totalLen: 95, centerOffsetY: 45, centerOffsetX: 12, span: 110 },
  },
  fish: {
    original: { totalLen: 210, centerOffsetY: 104, centerOffsetX: 18, span: 230 },
  },
  electro: {
    original: { totalLen: 215, centerOffsetY: 105, centerOffsetX: 18, span: 230 },
  },
  // SET 1 of slide 7. The "Set 1" numbers are measured from the real slide-7
  // renderer (`drawSetOneGun`, at rest and mid-animation) so the card shows the
  // whole weapon: ink box → diagonal span (w + h) / √2, centre = box centre.
  //                           box                      w×h    → span
  slingshot: {
    original: { totalLen: 176, centerOffsetY: 88, centerOffsetX: 0, span: 184 },
    set1: { totalLen: 179, centerOffsetY: 83, centerOffsetX: 0, span: 177 }, // -36,-7..36,172
  },
  blowgun: {
    original: { totalLen: 290, centerOffsetY: 145, centerOffsetX: 5, span: 295 },
    set1: { totalLen: 290, centerOffsetY: 105, centerOffsetX: 12, span: 257 }, // -25,-40..48,250
  },
  shotgun: {
    original: { totalLen: 226, centerOffsetY: 113, centerOffsetX: 6, span: 224 },
    set1: { totalLen: 297, centerOffsetY: 139, centerOffsetX: 9, span: 240 }, // -13,-10..30,287
  },
  soaker: {
    original: { totalLen: 164, centerOffsetY: 75, centerOffsetX: -1, span: 174 },
    set1: { totalLen: 158, centerOffsetY: 78, centerOffsetX: 5, span: 185 }, // -47,-1..56,157
  },
};


// ── Slide-7 SET 2..5 ────────────────────────────────────────────────────────
// Measured from the real slide-7 renderer (`drawWeapon`, at the rested pose and
// mid-animation) with an ink-bounds pass: box → diagonal span (w + h) / √2,
// centre = box centre. The previews therefore show the whole weapon, never a
// cropped one — the same rule the SET 1 cards follow.
const SET_SEVEN_METRICS: Partial<Record<WeaponId, GunMetrics>> = {
  snowball: { totalLen: 191, centerOffsetY: 90, centerOffsetX: 21, span: 239 }, // -51,-6..92,185
  sniper: { totalLen: 204, centerOffsetY: 100, centerOffsetX: 13, span: 215 }, // -36,-2..61,202
  flamethrower: { totalLen: 185, centerOffsetY: 77, centerOffsetX: 20, span: 202 }, // -29,-16..68,169
  bubble: { totalLen: 175, centerOffsetY: 79, centerOffsetX: -4, span: 259 }, // -98,-9..90,166
  bamboo: { totalLen: 230, centerOffsetY: 108, centerOffsetX: 9, span: 255 }, // -55,-7..72,223
  banana: { totalLen: 211, centerOffsetY: 99, centerOffsetX: 18, span: 229 }, // -37,-7..72,204
  harpoon: { totalLen: 203, centerOffsetY: 79, centerOffsetX: 17, span: 193 }, // -16,-23..50,180
  chicken: { totalLen: 189, centerOffsetY: 87, centerOffsetX: 15, span: 186 }, // -20,-8..50,181
  confetti: { totalLen: 212, centerOffsetY: 83, centerOffsetX: 8, span: 205 }, // -29,-23..45,189
  seed: { totalLen: 174, centerOffsetY: 84, centerOffsetX: 0, span: 195 }, // -49,-3..49,171
  pizza: { totalLen: 182, centerOffsetY: 85, centerOffsetX: 8, span: 194 }, // -37,-6..52,176
  minigun: { totalLen: 184, centerOffsetY: 91, centerOffsetX: -5, span: 221 }, // -68,-1..57,183
  crossbow: { totalLen: 192, centerOffsetY: 90, centerOffsetX: 0, span: 238 }, // -71,-6..70,186
  plasma: { totalLen: 174, centerOffsetY: 79, centerOffsetX: 6, span: 200 }, // -47,-8..59,166
  laser: { totalLen: 192, centerOffsetY: 90, centerOffsetX: 15, span: 193 }, // -24,-6..54,186
  dragon: { totalLen: 250, centerOffsetY: 107, centerOffsetX: 0, span: 319 }, // -99,-18..98,232
  gravity: { totalLen: 266, centerOffsetY: 99, centerOffsetX: 0, span: 251 }, // -43,-34..42,232
  honey: { totalLen: 241, centerOffsetY: 118, centerOffsetX: 0, span: 205 }, // -23,-3..22,238
  coconut: { totalLen: 240, centerOffsetY: 119, centerOffsetX: -2, span: 268 }, // -70,-1..66,239
  angklung: { totalLen: 257, centerOffsetY: 128, centerOffsetX: 0, span: 247 }, // -45,-1..44,256
  bee: { totalLen: 243, centerOffsetY: 118, centerOffsetX: 0, span: 239 }, // -46,-4..45,239
  sakura: { totalLen: 257, centerOffsetY: 117, centerOffsetX: 23, span: 251 }, // -24,-12..70,245
  firework: { totalLen: 254, centerOffsetY: 119, centerOffsetX: 6, span: 230 }, // -28,-8..40,246
  keris: { totalLen: 232, centerOffsetY: 115, centerOffsetX: 0, span: 273 }, // -76,-1..75,231
  moonbeam: { totalLen: 340, centerOffsetY: 137, centerOffsetX: 0, span: 302 }, // -42,-33..41,307
  storm: { totalLen: 292, centerOffsetY: 110, centerOffsetX: 0, span: 252 }, // -31,-36..30,256
  pencil: { totalLen: 300, centerOffsetY: 144, centerOffsetX: 7, span: 249 }, // -18,-6..31,294
  sandal: { totalLen: 287, centerOffsetY: 132, centerOffsetX: 0, span: 239 }, // -24,-12..23,275
  paintball: { totalLen: 244, centerOffsetY: 119, centerOffsetX: 5, span: 229 }, // -33,-3..43,241
  wand: { totalLen: 353, centerOffsetY: 155, centerOffsetX: 0, span: 299 }, // -33,-22..33,331
  shark: { totalLen: 258, centerOffsetY: 139, centerOffsetX: 0, span: 261 }, // -54,10..53,268
  ghost: { totalLen: 152, centerOffsetY: 82, centerOffsetX: 0, span: 186 }, // barrel-free spirit
  ufo: { totalLen: 279, centerOffsetY: 126, centerOffsetX: 0, span: 263 }, // -45,-14..44,265
  rainbow: { totalLen: 281, centerOffsetY: 112, centerOffsetX: 1, span: 270 }, // -48,-29..49,252
  meteor: { totalLen: 269, centerOffsetY: 125, centerOffsetX: 0, span: 250 }, // -41,-10..40,259
  diamond: { totalLen: 266, centerOffsetY: 121, centerOffsetX: -2, span: 244 }, // -40,-12..36,254
  fish: { totalLen: 276, centerOffsetY: 113, centerOffsetX: 0, span: 324 }, // -90,-25..89,251
  rpg: { totalLen: 307, centerOffsetY: 108, centerOffsetX: 7, span: 264 }, // -25,-46..38,261
  cricket: { totalLen: 225, centerOffsetY: 106, centerOffsetX: 9, span: 213 }, // -27,-7..45,218
  electro: { totalLen: 300, centerOffsetY: 124, centerOffsetX: 0, span: 263 }, // -35,-26..34,274
  bazooka: { totalLen: 320, centerOffsetY: 110, centerOffsetX: 6, span: 279 }, // -30,-50..41,270
  freeze: { totalLen: 296, centerOffsetY: 131, centerOffsetX: 0, span: 276 }, // -46,-17..45,279
  railgun: { totalLen: 287, centerOffsetY: 133, centerOffsetX: 0, span: 243 }, // -27,-11..26,276
  magnet: { totalLen: 353, centerOffsetY: 100, centerOffsetX: 0, span: 359 }, // -76,-77..75,276
  shrink: { totalLen: 267, centerOffsetY: 125, centerOffsetX: 0, span: 266 }, // -53,-9..52,258
  grow: { totalLen: 271, centerOffsetY: 123, centerOffsetX: 0, span: 268 }, // -53,-13..52,258
  pirate: { totalLen: 294, centerOffsetY: 137, centerOffsetX: 4, span: 258 }, // -30,-10..37,284
  card: { totalLen: 247, centerOffsetY: 130, centerOffsetX: 0, span: 229 }, // -37,6..36,253
  holy: { totalLen: 296, centerOffsetY: 119, centerOffsetX: 0, span: 336 }, // -88,-29..87,267
  unicorn: { totalLen: 329, centerOffsetY: 142, centerOffsetX: 0, span: 327 }, // -65,-23..65,306
  obliterator: { totalLen: 310, centerOffsetY: 125, centerOffsetX: 0, span: 251 }, // -21,-30..20,280
  coingun: { totalLen: 310, centerOffsetY: 130, centerOffsetX: 0, span: 272 }, // -36,-25..35,285
  photon_saber: { totalLen: 298, centerOffsetY: 15, centerOffsetX: 0, span: 313 }, // -71,-134..70,164
  gauntlet_cannon: { totalLen: 310, centerOffsetY: 119, centerOffsetX: -2, span: 266 }, // -34,-36..29,274
  ruby: { totalLen: 241, centerOffsetY: 118, centerOffsetX: 0, span: 209 }, // -26,-3..25,238
  emerald: { totalLen: 335, centerOffsetY: 128, centerOffsetX: 0, span: 277 }, // -27,-40..26,295
  sapphire: { totalLen: 220, centerOffsetY: 107, centerOffsetX: 0, span: 196 }, // -27,-3..26,217
  crystal: { totalLen: 307, centerOffsetY: 121, centerOffsetX: 1, span: 291 }, // -50,-33..51,274
  beerifle: { totalLen: 236, centerOffsetY: 85, centerOffsetX: 0, span: 197 }, // -20,-33..19,203
  buster: { totalLen: 312, centerOffsetY: 133, centerOffsetX: 0, span: 268 }, // -32,-23..31,289
  pulse_rifle: { totalLen: 226, centerOffsetY: 111, centerOffsetX: 0, span: 205 }, // -31,-2..30,224
  cryo_blaster: { totalLen: 218, centerOffsetY: 83, centerOffsetX: 11, span: 215 }, // -30,-26..52,192
  hyperdrive: { totalLen: 234, centerOffsetY: 97, centerOffsetX: 0, span: 254 }, // -61,-20..60,214
  quantum_destabilizer: { totalLen: 276, centerOffsetY: 100, centerOffsetX: 0, span: 246 }, // -35,-38..34,238
  blaster: { totalLen: 248, centerOffsetY: 108, centerOffsetX: 0, span: 224 }, // -33,-16..32,232
};

// ── Slide 11 (games/game-8) ────────────────────────────────────────────────
// Measured from slide 11's real renderer; the module that owns the drawing also
// owns the numbers, so the preview and the game can never disagree.
const SET_ELEVEN_METRICS_BY_SLIDE1: Partial<Record<WeaponId, GunMetrics>> = Object.fromEntries(
  Object.entries(SET_ELEVEN_BY_SLIDE1_ID).map(([slide1, eleven]) => [
    slide1,
    SET_ELEVEN_METRICS[eleven as keyof typeof SET_ELEVEN_METRICS],
  ]),
) as Partial<Record<WeaponId, GunMetrics>>;
for (const [i, eleven] of SET_ELEVEN_NEW_WEAPONS.entries()) {
  SET_ELEVEN_METRICS_BY_SLIDE1[SET_ELEVEN_NEW_IDS[i] as WeaponId] =
    SET_ELEVEN_METRICS[eleven as keyof typeof SET_ELEVEN_METRICS];
}

// ── Slide 9 (games/game-6) ──────────────────────────────────────────────────
// Measured from slide 9's real renderer (`drawSetNineGun`, rested pose) with the
// same ink-bounds pass: box → diagonal span (w + h) / √2, centre = box centre.
// Previews therefore show the whole weapon, never a cropped one.
const SET_NINE_METRICS: Partial<Record<WeaponId, GunMetrics>> = {
  pistol: { totalLen: 106, centerOffsetY: 53, centerOffsetX: 25, span: 126 }, // -10,0..59,106
  ak47: { totalLen: 174, centerOffsetY: 87, centerOffsetX: 12, span: 168 }, // -18,0..42,174
  sniper: { totalLen: 214, centerOffsetY: 107, centerOffsetX: 0, span: 203 }, // -35,0..35,214
  railgun: { totalLen: 253, centerOffsetY: 110, centerOffsetX: -3, span: 234 }, // -40,-17..34,236
  dragon: { totalLen: 234, centerOffsetY: 108, centerOffsetX: -10, span: 242 }, // -63,-9..42,225
  pred: { totalLen: 186, centerOffsetY: 57, centerOffsetX: 1, span: 170 }, // -25,-36..26,150
  photon_saber: { totalLen: 177, centerOffsetY: 71, centerOffsetX: -5, span: 184 }, // -45,-18..35,159
  gauntlet_cannon: { totalLen: 122, centerOffsetY: 34, centerOffsetX: 0, span: 125 }, // -26,-27..25,95
  longbow: { totalLen: 83, centerOffsetY: 19, centerOffsetX: 0, span: 152 }, // -65,-23..64,60
  mp5: { totalLen: 182, centerOffsetY: 91, centerOffsetX: 12, span: 175 }, // -19,0..43,182
  tesla_rifle: { totalLen: 225, centerOffsetY: 99, centerOffsetX: 3, span: 213 }, // -34,-14..39,211
  ion_smg: { totalLen: 198, centerOffsetY: 88, centerOffsetX: 11, span: 186 }, // -20,-11..42,187
  phaser: { totalLen: 122, centerOffsetY: 47, centerOffsetX: 12, span: 131 }, // -18,-14..42,108
  yautja: { totalLen: 183, centerOffsetY: 92, centerOffsetX: -2, span: 167 }, // -27,0..23,183
  identity_disc: { totalLen: 105, centerOffsetY: 56, centerOffsetX: 0, span: 113 }, // -26,3..25,108
  proton_pack: { totalLen: 245, centerOffsetY: 114, centerOffsetX: 9, span: 225 }, // -26,-9..43,236
  heat_ray: { totalLen: 184, centerOffsetY: 90, centerOffsetX: 2, span: 190 }, // -39,-2..42,182
};

// ── Slide 6 (games/game-2) ──────────────────────────────────────────────────
// Measured from slide 6's real renderer (`drawSetSixGun`, rested pose): the same
// ink-bounds pass slide 9 and slide 11 use, so the picker shows the whole gun.
const SET_SIX_METRICS_BY_SLIDE1: Partial<Record<WeaponId, GunMetrics>> = Object.fromEntries(
  Object.entries(SET_SIX_BY_SLIDE1_ID).map(([slide1, six]) => [
    slide1,
    SET_SIX_METRICS[six as keyof typeof SET_SIX_METRICS],
  ]),
) as Partial<Record<WeaponId, GunMetrics>>;

export function getGunMetrics(id: WeaponId, variant: GunVariant = getGunVariant(id)): GunMetrics {
  const effectiveVariant = isFixedClassicGun(id) ? 'original'
    : id === 'honey' && variant === 'latest' ? 'current' : variant;
  const eleven =
    effectiveVariant === 'set11' && isSetElevenDesignWeapon(id)
      ? SET_ELEVEN_METRICS_BY_SLIDE1[id]
      : undefined;
  const six = effectiveVariant === 'set6' ? SET_SIX_METRICS_BY_SLIDE1[id] : undefined;
  const measured = eleven
    ? eleven
    : six
    ? six
    : effectiveVariant === 'set9'
    ? SET_NINE_METRICS[id]
    : effectiveVariant === 'set7'
      ? SET_SEVEN_METRICS[id]
      : supportsGunVariants(id) && effectiveVariant !== 'current'
      ? VARIANT_METRICS[id]?.[effectiveVariant] : undefined;
  const m = measured ?? GUN_METRICS[id];
  return {
    totalLen: m?.totalLen ?? 175,
    centerOffsetY: m?.centerOffsetY ?? 85,
    centerOffsetX: m?.centerOffsetX ?? 16,
    span: m?.span ?? 180,
  };
}
