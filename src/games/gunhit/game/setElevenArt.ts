/**
 * Slide 11 (`games/game-8` / Knife-Hit Arsenal FX) artwork for slide 1.
 *
 * Nothing here is redrawn: slide 11's own `Weapon.draw(ctx, g, state)` runs,
 * exactly like slide 7 and slide 9 before it. This module only answers three
 * questions — which slide-1 gun a slide-11 weapon belongs to, how big it is on
 * slide 1, and where its origin sits — so the existing gun pipeline can hand
 * the real drawing call to slide 11.
 */
import { WEAPONS as ELEVEN_WEAPONS } from '../vendor/game-8/src/game/weapons';
import type { Weapon, WeaponState } from '../vendor/game-8/src/game/types';
import { clamp, easeOut, TAU } from '../vendor/game-8/src/game/util';

type Ctx = CanvasRenderingContext2D;

/** Slide-11 weapon ids, in the order slide 11 lists them. */
export const SET_ELEVEN_IDS = [
  'tripod',
  'ironman',
  'xenomorph',
  'mega-buster',
  'harmonic',
  'absolute-zero',
  'helios',
  'chrono',
  'orbital-beacon',
  'helix-pulsar',
  'singularity',
  'prism-lance',
  'nano-swarm',
  'bow',
  'ak47',
  'rifle',
  'rifle-electro',
  'mp5',
  'mp5-electro',
  'sniper-beam',
  'dragon-breath',
  'beretta',
  'phaser',
  'energy-sword',
  'plasmacaster-mk2',
  'identity-disc',
  'proton-pack',
] as const;

export type ElevenId = (typeof SET_ELEVEN_IDS)[number];

/**
 * Slide-1 id for every slide-11 weapon. A gun slide 1 already had (matched by
 * what the weapon IS) keeps its id; the rest become brand-new guns under their
 * own slug — they are never folded into an unrelated weapon.
 */
export const SLIDE1_ID_FOR_ELEVEN: Record<ElevenId, string> = {
  tripod: 'heat_ray',
  ironman: 'ironman_hand',
  xenomorph: 'xeno',
  'mega-buster': 'mega_buster',
  harmonic: 'harmonic_disruptor',
  'absolute-zero': 'absolute_zero',
  helios: 'helios_flare',
  chrono: 'chrono_rifle',
  'orbital-beacon': 'orbital_beacon',
  'helix-pulsar': 'helix_pulsar',
  singularity: 'singularity',
  'prism-lance': 'prism_lance',
  'nano-swarm': 'nano_swarm',
  bow: 'longbow',
  ak47: 'ak47',
  rifle: 'sniper',
  'rifle-electro': 'tesla_rifle',
  mp5: 'mp5',
  'mp5-electro': 'ion_smg',
  'sniper-beam': 'railgun',
  'dragon-breath': 'dragon',
  beretta: 'pistol',
  phaser: 'phaser',
  'energy-sword': 'photon_saber',
  'plasmacaster-mk2': 'pred',
  'identity-disc': 'identity_disc',
  'proton-pack': 'proton_pack',
};

/** The ten guns slide 1 did not have: slide 11's own weapons arrive as new. */
const NEW_ELEVEN_IDS = new Set<ElevenId>([
  'ironman',
  'mega-buster',
  'harmonic',
  'absolute-zero',
  'helios',
  'chrono',
  'orbital-beacon',
  'helix-pulsar',
  'singularity',
  'prism-lance',
  'nano-swarm',
]);

/** True when slide-11's weapon is a brand-new slide-1 gun. */
export function isElevenNewWeapon(id: ElevenId): boolean {
  return NEW_ELEVEN_IDS.has(id);
}

/** True when `id` is the slide-1 id of one of those new guns. */
export function isElevenNewSlide1Id(id: string): boolean {
  return SET_ELEVEN_IDS.some((w) => NEW_ELEVEN_IDS.has(w) && SLIDE1_ID_FOR_ELEVEN[w] === id);
}

/** Every slide-11 weapon keyed by the slide-1 gun it lives on. */
export const SET_ELEVEN_BY_SLIDE1_ID: Record<string, ElevenId> = Object.fromEntries(
  SET_ELEVEN_IDS.map((id) => [SLIDE1_ID_FOR_ELEVEN[id], id]),
);

/** Slide-11 weapons with no related gun in slide 1: they arrive as new guns. */
export const SET_ELEVEN_NEW_WEAPONS = SET_ELEVEN_IDS.filter((id) => NEW_ELEVEN_IDS.has(id));

/** The slide-1 ids of those new guns. */
export const SET_ELEVEN_NEW_IDS = SET_ELEVEN_NEW_WEAPONS.map((id) => SLIDE1_ID_FOR_ELEVEN[id]);

const BY_ID = new Map<string, Weapon>(ELEVEN_WEAPONS.map((w) => [w.id, w]));

export function elevenWeapon(id: ElevenId): Weapon {
  const w = BY_ID.get(id);
  if (!w) throw new Error(`slide 11 has no weapon ${id}`);
  return w;
}

export function isElevenId(id: string): id is ElevenId {
  return BY_ID.has(id);
}

/** Slide-1 id -> slide-11 weapon id (null when slide 1 owns nothing for it). */
export function setElevenIdFor(slide1Id: string): ElevenId | null {
  // Gauntlet keeps the old Slide-5 *effect* as an effect-only alias; the
  // corresponding design now belongs exclusively to Deadblast.
  return slide1Id === 'gauntlet_cannon' ? 'ironman' : SET_ELEVEN_BY_SLIDE1_ID[slide1Id] ?? null;
}

/** Slide-11 weapon id -> the slide-1 gun it lives on. */
export function slide1IdForEleven(id: ElevenId): string {
  return SLIDE1_ID_FOR_ELEVEN[id];
}

/* ── slide-1-sized art ────────────────────────────────────────────────────── */

/**
 * Slide 11 draws in a 540-wide world standing on `baseY = 940`, so its guns are
 * authored at their own size. These are the *raw* ink extents measured from
 * slide 11's own `draw()` at scale 1, in slide-1 screen space with the muzzle
 * at (0, 0) and the body hanging below - the same anchor slide 1's `drawGun`
 * uses. Everything else (scale, menu metrics) is derived from them so no gun is
 * ever cropped and every gun reads at slide 1's size.
 */
const ELEVEN_INK: Record<ElevenId, { len: number; wid: number; cx: number; cy: number }> = {
  'tripod': { len: 456, wid: 239, cx: 10, cy: 215 },
  'ironman': { len: 331, wid: 109, cx: 0, cy: 157 },
  'xenomorph': { len: 429, wid: 183, cx: -46, cy: 207 },
  'mega-buster': { len: 375, wid: 103, cx: -1, cy: 179 },
  'harmonic': { len: 412, wid: 156, cx: 12, cy: 153 },
  'absolute-zero': { len: 443, wid: 175, cx: 2, cy: 176 },
  'helios': { len: 450, wid: 200, cx: -9, cy: 184 },
  'chrono': { len: 459, wid: 143, cx: 21, cy: 178 },
  'orbital-beacon': { len: 400, wid: 178, cx: 1, cy: 164 },
  'helix-pulsar': { len: 417, wid: 167, cx: 4, cy: 199 },
  'singularity': { len: 453, wid: 160, cx: 11, cy: 175 },
  'prism-lance': { len: 420, wid: 151, cx: 10, cy: 177 },
  'nano-swarm': { len: 403, wid: 168, cx: 6, cy: 174 },
  'bow': { len: 232, wid: 412, cx: -2, cy: 107 },
  'ak47': { len: 439, wid: 173, cx: 35, cy: 218 },
  'rifle': { len: 424, wid: 149, cx: 3, cy: 212 },
  'rifle-electro': { len: 424, wid: 149, cx: 3, cy: 212 },
  'mp5': { len: 397, wid: 168, cx: 39, cy: 200 },
  'mp5-electro': { len: 397, wid: 168, cx: 39, cy: 200 },
  'sniper-beam': { len: 468, wid: 141, cx: -7, cy: 182 },
  'dragon-breath': { len: 471, wid: 345, cx: -89, cy: 191 },
  'beretta': { len: 357, wid: 75, cx: -2, cy: 175 },
  'phaser': { len: 369, wid: 173, cx: 58, cy: 164 },
  'energy-sword': { len: 441, wid: 272, cx: -2, cy: 195 },
  'plasmacaster-mk2': { len: 424, wid: 118, cx: -3, cy: 168 },
  'identity-disc': { len: 336, wid: 197, cx: -1, cy: 124 },
  'proton-pack': { len: 357, wid: 186, cx: 2, cy: 166 },
};

/** The size slide 1's own guns have at the muzzle line. */
const TARGET_LEN = 176;
/** Nothing may be wider than the 420-wide play field (with air on both sides). */
const MAX_WID = 320;

/** Per-weapon scale: slide 1's length, but never wide enough to clip. */
export function elevenScale(id: ElevenId): number {
  const ink = ELEVEN_INK[id];
  return Math.min(1.45, TARGET_LEN / ink.len, MAX_WID / ink.wid);
}

/** Slide 11's drawing scale (kept for callers that want the global default). */
export const ELEVEN_SCALE = 1;

/** Menu metrics derived from the same measurements the drawing uses. */
export const SET_ELEVEN_METRICS = Object.fromEntries(
  SET_ELEVEN_IDS.map((id) => {
    const s = elevenScale(id);
    const ink = ELEVEN_INK[id];
    const len = ink.len * s;
    const wid = ink.wid * s;
    return [id, {
      totalLen: Math.round(len),
      centerOffsetY: Math.round(ink.cy * s),
      centerOffsetX: Math.round(ink.cx * s),
      span: Math.ceil((len + wid) / Math.SQRT2) + 2,
    }];
  }),
) as Record<ElevenId, { totalLen: number; centerOffsetY: number; centerOffsetX: number; span: number }>;

/** A resting slide-11 weapon state (art only: no cooldown, no charge). */
export function restElevenState(): WeaponState {
  return {
    recoil: 0, cd: 0, cdMax: 0, ready: 1, chan: 0, minHold: 0, holding: false,
    t: 0, fireT: 9, shots: 0, charge: 0, data: {},
  };
}

/**
 * The `Game` slide 11's `draw()` expects. Art only needs the wheel geometry,
 * the clock and the weapon state; every effect entry point is a no-op so a
 * card or a thumbnail never spawns anything.
 */
const DRAW_HOST = {
  W: 540,
  H: 960,
  cx: 270,
  cy: 0,
  R: 122,
  wy: 288,
  baseY: 940,
  time: 0,
  state: 'play',
  active: true,
  swapT: 1,
  hits: 0,
  goal: 1,
  wheel: {
    angle: 0, dir: 1, boost: 0, kick: 0, kickV: 0, sq: 0, flash: 0, heat: 0,
    heatC: '#ff8a2a', scale: 1, spawnT: 1, freezeT: 0, freeze: 0, shiver: 0,
  },
  parts: [] as unknown[],
  fx: [] as unknown[],
  projs: [] as unknown[],
  embeds: [] as unknown[],
  aim: () => ({ x: 270, y: 410, hit: true }),
  localAngle: () => 0,
  normalAt: () => -Math.PI / 2,
  knifeNear: () => false,
  spawn: () => undefined,
  burst: () => undefined,
  addFx: () => undefined,
  addProj: () => undefined,
  glow: () => undefined,
  ring: () => undefined,
  light: () => undefined,
  shake: () => undefined,
  lightning: () => undefined,
  muzzleFlash: () => undefined,
  heatWheel: () => undefined,
  ricochet: () => undefined,
  addEmbed: () => undefined,
  hit: () => undefined,
  lw: (x: number, y: number) => ({ x: 270 + y, y: 940 - x }),
  muzzlePos: () => ({ x: 270, y: 900 }),
  sfx: { playFire: () => undefined, impact: () => undefined, ricochet: () => undefined, thunk: () => undefined },
};

/** The host above, with the weapon + state slide 11's `draw()` reads. */
export function elevenDrawHost(id: ElevenId, ws: WeaponState, time = 0) {
  const host = DRAW_HOST as unknown as Record<string, unknown>;
  host.weapon = elevenWeapon(id);
  host.ws = ws;
  host.time = time;
  return DRAW_HOST as unknown as import('../vendor/game-8/src/game/engine').Game;
}

/**
 * Where the gun's own origin sits on slide 1 for a given muzzle position, in
 * screen space — the mirror of slide 11's `translate(cx, baseY)` transform.
 */
export function elevenGunOrigin(id: ElevenId, x: number, y: number, scale = elevenScale(id)) {
  const w = elevenWeapon(id);
  const sc = scale * (w.scale ?? 1);
  return { x, y, scale: sc, muzzleY: w.muzzleY * sc, muzzle: w.muzzle * sc };
}

/**
 * Slide 11's weapon drawing, on slide 1: same transform the slide-11 engine
 * uses (`translate(cx, baseY) · rotate(-π/2) · scale · recoil · muzzleY`), plus
 * the breathing idle slide 1's guns all have.
 */
export function drawSetElevenGun(
  c: Ctx,
  id: ElevenId,
  cx: number,
  y0: number,
  time: number,
  ws: WeaponState = restElevenState(),
  scale = elevenScale(id),
  live = false,
) {
  const w = elevenWeapon(id);
  const sc = scale * (w.scale ?? 1);
  const host = elevenDrawHost(id, ws, time);
  c.save();
  c.translate(cx, y0);
  c.rotate(-Math.PI / 2);
  // Menu cards let the gun breathe a little. In the game it stands exactly
  // like slide 11's `render()` stands it — no sway, no shadow under the stock —
  // and only its own recoil and animation move it.
  if (!live) {
    c.rotate(Math.sin(time * 1.25 + 0.7) * 0.012);
    c.translate(Math.sin(time * 1.9) * 1.3, 0);
  }
  c.scale(sc, sc);
  // No contact shadow under the weapon: the gun stands on its own light.
  // Slide 1 anchors the muzzle, slide 11 anchors the stock: shift along the
  // gun's own axis so the muzzle lands exactly on (cx, y0) and the body hangs
  // below it, which is what every slide-1 weapon does.
  c.translate(-w.muzzle - ws.recoil * w.kick, -w.muzzleY);
  w.draw(c, host, ws);
  c.restore();
  return host;
}

/** Slide 11's gun for the menu strips (bottom pivot, no idle motion). */
export function drawSetElevenIcon(
  c: Ctx,
  id: ElevenId,
  cx: number,
  y0: number,
  scale = elevenScale(id),
) {
  const ws = restElevenState();
  const w = elevenWeapon(id);
  const sc = scale * (w.scale ?? 1);
  c.save();
  c.translate(cx, y0);
  c.rotate(-Math.PI / 2);
  c.scale(sc, sc);
  c.translate(-w.muzzle, -w.muzzleY);
  w.draw(c, elevenDrawHost(id, ws, 0), ws);
  c.restore();
}

/* Slide 11's own easing/geometry helpers, re-exported for the runtime layer so
 * both sides agree on the curve. */
export { clamp, easeOut, TAU };
