import { getLanguage } from '../../../i18n/language';
import { tr } from '../../../i18n/strings';
import { traceBossSegment } from './bossRaycast';
import { advanceCosmeticTrail } from './cosmeticTrail';
import { sfx, withSfxGain } from './audio';
import { normalizeSgaSpeed, type SgaGameSpeed } from './gameSpeed';
import { getSavedBulletSpeed, normalizeBulletSpeed } from './bulletSpeed';
import { SPOT_COMBO_COIN_VALUE, SPOT_COMBO_REACH, SPOT_COMBO_STEP, getSavedSpotCombo } from './spotCombo';
import { getFast2DContext, getOptimalCanvasDpr, isMobilePerfProfile } from '../utils/mobilePerf';
import { AdaptiveCanvasDpr } from '../utils/adaptiveCanvasDpr';
import { FrameCadence } from '../utils/frameCadence';
import { slide2Sfx } from './slide2Audio';
import { Slide2Fx } from './slide2Fx';
import {
  ambientBlackHole2,
  drawBlackHoleShot2,
  fireBlackHole2,
  launchVoidSky2,
  trailBlackHole2,
  voidBurst2,
} from './slide2Weapons';
import { isSlide23Weapon, slide23Sfx } from './slide23Sfx';
import { fireworkSfx } from './fireworkSlide2Sfx';
import { setOneSfx } from './setOneAudio';
import { silentPreview } from './previewAudio';
import { SetOneFx, type SetOneHooks, type SetOneShot } from './setOneFx';
import { fireSetOne, impactSetOne } from './setOneWeapons';
import { setOneIdFor, type SetOneId } from './setOneArt';
import { SetSevenFx, type SevenHooks } from './setSevenFx';
import { buildSevenAnim, slideThreeIdFor, type SlideThreeId } from './setSevenArt';
import { FIRE_RECIPES } from './setSevenFire';
import { adoptSevenRound, isSevenBeam, sevenCarrierSpeed, sevenCooldown, sevenShotSpeed } from './setSevenShot';
import { NINE_BEAM_SPEED, SetNineFx, unlockNineAudio, type NineHooks } from './setNineFx';
import { SetSixFx, SIX_BEAM_SPEED, type SixHooks } from './setSixFx';
import { setSixIdFor, sixCooldown, sixStateFor, type SixId } from './setSixArt';
import { nineGunOrigin, nineWeapon, setNineIdFor, type NineId } from './setNineArt';
import { SetElevenFx, setElevenMuted, unlockElevenAudio, type ElevenHooks, type ElevenWheelMotion } from './setElevenFx';
import type { Proj as ElevenProj } from '../vendor/game-8/src/game/types';
import { drawBusterPelletOrb } from '../vendor/game-8/src/game/weapons/busterPellet';
import { elevenWeapon, setElevenIdFor, type ElevenId } from './setElevenArt';
import { SetTwoFx, advanceTwoRoundTrail, twoAmmoHue, type TwoRound } from './setTwoFx';
import {
  drawSetTwoAtmosphere,
  drawSetTwoPins,
  drawSetTwoSky,
  drawSetTwoStars,
  drawSetTwoWheelGlow,
  setTwoWheelHue,
  type SetTwoPin,
} from './setTwoLook';
import { setTwoGunFx, setTwoIdFor, type TwoWeapon } from './setTwoArt';
import type { Bullet as NineBullet } from '../vendor/game-6/src/game/types';
import { newAnim, type StuckItem } from '../vendor/game-4/src/game/weapons';
import { drawStuckItem } from '../vendor/game-4/src/game/art';
import { RECOIL_ROT } from '../vendor/game-4/src/game/recoil';
import { drawSprite, glowSprite } from '../vendor/game-4/src/game/core';
import { sfx as sevenSfx } from '../vendor/game-4/src/game/audio';
import type { Projectile as SevenShot } from '../vendor/game-4/src/game/projectiles';
import { spawnPlasmaImpact, YELLOW_PLASMA_IMPACT } from '../vendor/game-4/src/game/projectiles3';
import { sfx2 } from './sfx2';
import { drawKnife, knifeVariant, KNIFE_SINK } from './knifeArt';
import { sfx as bossVoice } from '../../perfect-shot/audio/sfx';
import { bossHeadFor, bossNameFor, bossStyleFor } from './bossIdentity';
import { sfx3 } from './sfx3';
import { sfx4 } from './sfx4';
import { sfx6 } from './sfx6';
import { sfx5 } from './sfx5';
import { gunState } from './art/kit';
import { FX, spawnImpact, spawnMuzzle, spawnSpeedLines, drawFxParticle, drawSmokeParticle, drawDropParticles, cssColor, setSplinterClip, withSplinterClip, type Particle, type FxSink } from './fx';
import { drawPreciseWeaponDecal } from './art/decalSystem';
import { drawBehindWheelSunburst, drawGlow, drawRgbGlowSprite, drawScreenTintWash } from './art/glowSprite';
import { drawForestFireflies } from './art/forestFireflies';
import { AcidFluid, type AcidStuckBlob } from './acidFluid';
import { drawCrystalEffectTwo, drawIronmanCombo, type ComboBeam } from './art/combinedShots';
import { drawXenoCorrosion, drawXenoHybridFlight, drawXenoSpecialPuddle } from './art/xenoHybrid';
import { GHOST_HAND_X, GHOST_HAND_Y, type GhostHand } from './art/ghostSpiritGun';
import { fireworkMouth } from './art/fireworkTubes';
import type { FireworkShot } from '../vendor/game-4/src/game/projectiles4';
import { SNOWBALL_MAG_SIZE } from './art/guns2';
import { drawMaterialTrail } from './art/projectileTrails';
import { drawClassicBeam, drawLaserBeam, drawVoidTether } from './art/beamEffects';
import { getGunEffect, getGunVariant } from './art/gunVariants';
import { drawWetSurface } from './art/waterSurface';
import { drawFace, STYLE_COLORS, type Style } from './faces';
import { paintStageForest, paintStageGrass, paintStageVignette } from './stageBackdrop';
import { hasZipArt } from '../zipWeapons/ids';
import { zipKick } from '../zipWeapons/motion';
import { drawGun, drawProjectile } from './weaponDraw';
import { WEAPONS, getWeapon, type Weapon, type WeaponId, type ProjKind } from './weapons';
import { drawStar, drawRockFragment } from './art/boulder';
import { DiamondRock, drawRockDiamond, type BrokenRockCell } from './art/diamondRock';
import { drawBonusCoin, TreasureChest } from './art/bonusArt';
import {
  advanceTreasureCoins,
  throwTreasureCoins,
  SHOWER_LANDSCAPE,
  SHOWER_PORTRAIT,
  type TreasureCoin,
} from './treasureShower';
import { drawBreakerCoin } from '../../shared/coinArt';
import { drawBreakerDiamond } from '../../shared/diamondArt';
import { bossDef, type BossAttackFamily, type BossHead } from './bossCatalog';
import { getSpecialSunburstTheme, getWheelSunburstTheme, gunSunburstColor } from './sunburstPalette';
import {
  drawBossMuzzleFlash,
  drawBossProjectile,
  type BossMuzzleFlash,
} from './bossProjectileArt';
import {
  createFirework8State,
  drawFirework8Background,
  drawFirework8GunGlow,
  drawFirework8ParticlesAndRings,
  FIREWORK_EMBED_NOSE,
  firework8ShotHue,
  hsl,
  launchFirework8Sky,
  spawnFirework8ClearFinale,
  spawnFirework8FailBurst,
  spawnFirework8FlightSparks,
  spawnFirework8Muzzle,
  spawnFirework8StickBurst,
  updateFirework8State,
  type Firework8State,
} from './firework8fx';
import {
  createYoyoSlideState,
  drawSlide6String,
  drawSlide6Yoyo,
  drawYoyoSlideBackground,
  drawYoyoSlideGunGlow,
  drawYoyoSlideParticlesRingsAndStrings,
  spawnYoyoClearFinale,
  spawnYoyoFailBurst,
  spawnYoyoFlightSparks,
  spawnYoyoLaunch,
  spawnYoyoStickBurst,
  updateYoyoSlideState,
  yoyoAmmoHue,
  type YoyoSlideState,
} from './yoyoSlideFx';
import {
  createKerisSlideState,
  drawKerisAimGuide,
  drawKerisSlideBackground,
  drawKerisSlideMini,
  drawKerisSlideParticlesAndArcs,
  drawKerisStuckCrater,
  drawKerisSurfaceArcs,
  KERIS_GLEAM_DUR,
  spawnKerisFlightSparks,
  spawnKerisImpact,
  spawnKerisLaunch,
  updateKerisSlideState,
  type KerisSlideState,
} from './kerisSlideFx';
import {
  createDiamondSlideState,
  drawDiamondSlideBackground,
  drawDiamondSlideForeground,
  drawDiamondSlideGunGlow,
  drawSlide2DiamondBullet,
  spawnDiamondClearFinale,
  spawnDiamondFailBurst,
  spawnDiamondFlightSparks,
  spawnDiamondLaunch,
  spawnDiamondStickBurst,
  updateDiamondSlideState,
  type DiamondSlideState,
} from './diamondSlideFx';
import {
  BAZOOKA_HUES,
  BazookaSlideFx,
  drawSlide3BazookaShell,
  drawSlide3BazookaStuckCrater,
} from './bazookaSlideFx';
import {
  drawCustomSgaTheme,
  normalizeSgaBgTheme,
  type SgaBackgroundTheme,
} from './backgroundThemes';

import {
  BASE_WHEEL_CY,
  CX,
  CY,
  BOARD_PACKAGE_SCALE,
  GAMEPLAY_GUN_SCALE,
  GUN_Y,
  LAND_GUN_LIFT,
  H,
  SPECIAL_CY,
  W,
  initialGameplayWheelCenterY,
} from './layout';
export { BASE_WHEEL_CY, BOARD_PACKAGE_SCALE, CY, GAMEPLAY_GUN_SCALE, GUN_Y, H, SPECIAL_CY, W, initialGameplayWheelCenterY };
import { displaySize, displayToWorld, worldTransform } from './layout';
import {
  getSavedSgaOrientation,
  normalizeSgaOrientation,
  type SgaOrientation,
} from './orientation';
import {
  ROCK_RADIUS,
  allowsStarPowerups,
  bossKnifeCount,
  isSpecial,
  makeLevel,
  type LevelCfg,
  type LevelMode,
  type PatternName,
  type SpecialMode,
} from './levels';

/** Teks HUD canvas memakai bahasa aktif (dibaca ulang tiap frame). */
const T = (text: string): string => tr(getLanguage(), text);

export { ROCK_RADIUS, allowsStarPowerups, bossKnifeCount, isSpecial, makeLevel };
export type { LevelCfg, LevelMode, PatternName, SpecialMode } from './levels';
const TWIN_SPACING = 30; // dual lebih rapat: 60px antar laras (dulu 92px)
const SINGLE_BARREL = [0] as const;
const TWIN_BARRELS = [-TWIN_SPACING, TWIN_SPACING] as const;
const CLASSIC_COIN_RADIUS = 13.5 * 1.2; // compact original coin, enlarged only 20%
const CLASSIC_DIAMOND_SCALE = 1.2;
/**
 * The longest a gun may ever wait before it can fire again, in seconds.
 *
 * Every layer (slide 1's own table, and slides 2/6/7/9/11 handing back their
 * own trigger interval) used to set its own cadence — the orbital beacon sat
 * at 1.7 s, the singularity at 1.4 s, the bazooka at 0.85 s — so half the
 * arsenal felt like it had stopped responding while the acid spitter fired
 * 4.5 times a second. A single ceiling at the trigger pull keeps every gun
 * "ready again" within a fifth of a second; guns that were already faster
 * (AK-47, nail gun, MP5, ion SMG, pistol) keep their own rhythm untouched.
 */
const MAX_WEAPON_COOLDOWN = 0.2;
const TOTAL_LEN = 42; // total standard bullet length
const EMBED = 21; // tertancap setengah (50% masuk ke dalam)
const L = TOTAL_LEN - EMBED; // hanya terlihat setengah (50% di luar)
const BLEN = TOTAL_LEN;
// projectile speed depends on weapon
const TAU = Math.PI * 2;

/**
 * Landscape gun control (W/S + pointer aim).
 *
 * The gun lives at world (CX, GUN_Y); landscape shows the world rotated 90°, so
 * screen-up is world -x. The caps keep the muzzle inside the wheel's width, so
 * a full slide or tilt never sends every round past the target.
 */
export const GUN_SLIDE_MAX = 150; // world px, i.e. display px up/down
export const GUN_SLIDE_SPEED = 368; // world px per second while held (1.6× the original 230)
export const GUN_TILT_MAX = 0.62; // radians (~36°) — the aim-assist clamp is tighter

/**
 * How quickly the barrel chases the pointer, in 1/s.
 *
 * The first pass eased at 12/s, which left the muzzle about a tenth of a second
 * behind the mouse and felt sluggish on a flick. 55/s closes 60% of the gap
 * every frame, so a wide swing settles in two or three frames, and the rate
 * floor below makes short flicks land on the very next one.
 */
export const GUN_TILT_EASE = 65;
export const GUN_TILT_MIN_RATE = 22; // radians per second

// A new run brings the weapon in from beneath the screen. This is only a
// drawing offset: collision, muzzle origins, recoil and weapon scale stay put.
export const GAMEPLAY_GUN_ENTRY_DURATION = 0.8;
export const GAMEPLAY_GUN_ENTRY_DISTANCE = 380;
export function gameplayGunEntryOffset(age: number): number {
  // The normal gameplay hot path is settled; do no easing work in that case.
  if (!Number.isFinite(age) || age >= GAMEPLAY_GUN_ENTRY_DURATION) return 0;
  const remaining = 1 - Math.max(0, age) / GAMEPLAY_GUN_ENTRY_DURATION;
  return GAMEPLAY_GUN_ENTRY_DISTANCE * remaining * remaining * remaining;
}

/**
 * Game A shows Game B's wheel artwork verbatim: the React side rasterises
 * `TargetArt` for the stage and hands the image over through this source.
 */
export type WheelArtSource = {
  /** Cache key for a stage (kind + boss head), e.g. `orange|`. */
  keyFor: (level: number) => string;
  get: (key: string) => HTMLImageElement | null;
  request: (level: number) => void;
  /**
   * The SVG markup that raster came from. A runtime that refuses to hand back
   * the pixels of an SVG-drawn canvas still gets the exact silhouette, because
   * the engine rasterises these paths itself on demand.
   */
  markup?: (key: string) => string | null;
};

export type PerfectShotWheelEntry = {
  offsetY: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  brightness: number;
};
export type PerfectShotWheelBurst = {
  flashOpacity: number;
  flashScale: number;
  waves: { opacity: number; scale: number; width: number }[];
};

const NO_WHEEL_BURST: PerfectShotWheelBurst = {
  flashOpacity: 0,
  flashScale: 0.2,
  waves: [{ opacity: 0, scale: 0.2, width: 12 }, { opacity: 0, scale: 0.2, width: 12 }],
};

/** Warm landing flash and expanding target shockwaves from Perfect Shot's PLAY_IN timeline. */
export function perfectShotWheelBurst(elapsed: number, pace = 1): PerfectShotWheelBurst {
  const safePace = Number.isFinite(pace) && pace > 0 ? pace : 1;
  const t = elapsed - 0.06 * safePace;
  const duration = 1.1 * safePace;
  // The warm flash + shockwaves now belong to the landing: they fire at 42%,
  // the frame the wheel touches down and goes straight into the pop blast.
  const flashAge = t - duration * 0.42;
  const flashDuration = 0.52 * safePace;
  const flashProgress = Math.max(0, Math.min(1, flashAge / flashDuration));
  const flashEase = [0, 0, 0.58, 1] as const; // CSS ease-out used by Perfect Shot's shFlash.
  const flashOpacity = flashAge < 0 ? 0 : flashProgress < 0.18
    ? bezierProgress(flashProgress / 0.18, ...flashEase)
    : 1 - bezierProgress((flashProgress - 0.18) / 0.82, ...flashEase);
  const shockEase = [0.1, 0.7, 0.3, 1] as const;
  const waves = ([0.47, 0.55] as const).map((start) => {
    const age = t - duration * start;
    const waveDuration = 0.72 * safePace;
    const progress = Math.max(0, Math.min(1, age / waveDuration));
    const opacity = age < 0 || age >= waveDuration ? 0 : progress < 0.06
      ? bezierProgress(progress / 0.06, ...shockEase)
      : 1 - bezierProgress((progress - 0.06) / 0.94, ...shockEase);
    const easedProgress = bezierProgress(progress, ...shockEase);
    return { opacity: Math.max(0, opacity), scale: 0.2 + easedProgress * 2.4, width: 12 - easedProgress * 11 };
  });
  return {
    flashOpacity: Math.max(0, flashOpacity),
    flashScale: 0.2 + bezierProgress(flashProgress, ...flashEase) * 1.8,
    waves,
  };
}

const RESTING_WHEEL_ENTRY: PerfectShotWheelEntry = {
  offsetY: 0, scaleX: 1, scaleY: 1, opacity: 1, brightness: 1,
};

function bezierCoordinate(t: number, p1: number, p2: number): number {
  const inverse = 1 - t;
  return 3 * inverse * inverse * t * p1 + 3 * inverse * t * t * p2 + t * t * t;
}

function bezierProgress(x: number, x1: number, y1: number, x2: number, y2: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 18; i++) {
    const t = (low + high) / 2;
    if (bezierCoordinate(t, x1, x2) < x) low = t;
    else high = t;
  }
  return bezierCoordinate((low + high) / 2, y1, y2);
}

/**
 * The first gameplay wheel uses the same delayed, drop-and-pop choreography as
 * Perfect Shot's gpTargetIn keyframes. Values are sampled in game-time seconds.
 */
export function perfectShotWheelEntry(elapsed: number, pace = 1, radius = 106): PerfectShotWheelEntry {
  const safePace = Number.isFinite(pace) && pace > 0 ? pace : 1;
  const t = elapsed - 0.06 * safePace;
  const duration = 1.1 * safePace;
  if (t <= 0) return { offsetY: -3.2 * radius, scaleX: 0.5, scaleY: 0.5, opacity: 0, brightness: 1 };
  if (t >= duration) return RESTING_WHEEL_ENTRY;
  const p = Number(((t / duration) * 100).toFixed(9));
  type Frame = { at: number; value: number; ease?: readonly [number, number, number, number] };
  const sample = (frames: Frame[]) => {
    let index = 0;
    while (index < frames.length - 2 && p > frames[index + 1].at) index++;
    const from = frames[index];
    const to = frames[index + 1];
    const raw = Math.max(0, Math.min(1, (p - from.at) / (to.at - from.at)));
    const u = from.ease ? bezierProgress(raw, ...from.ease) : raw;
    return from.value + (to.value - from.value) * u;
  };
  const dropEase = [0.55, 0, 1, 0.45] as const;
  const blastEase = [0.2, 0.9, 0.3, 1] as const;
  const settleEase = [0.45, 0, 0.55, 1] as const;
  const outEase = [0.42, 0, 0.58, 1] as const;
  // Drop 0-42%, then the pop blast fires the instant the wheel lands (peak 56%),
  // exactly like Game B's gpTargetIn — no bounce, no pause.
  const y = sample([
    { at: 0, value: -3.2, ease: dropEase }, { at: 42, value: 0 },
    { at: 100, value: 0 },
  ]);
  const sx = sample([
    { at: 0, value: 0.5, ease: dropEase }, { at: 42, value: 1.14, ease: blastEase },
    { at: 56, value: 1.32, ease: settleEase }, { at: 68, value: 0.94, ease: outEase },
    { at: 80, value: 1.04 }, { at: 88, value: 1 }, { at: 100, value: 1 },
  ]);
  const sy = sample([
    { at: 0, value: 0.5, ease: dropEase }, { at: 42, value: 0.84, ease: blastEase },
    { at: 56, value: 1.32, ease: settleEase }, { at: 68, value: 0.94, ease: outEase },
    { at: 80, value: 1.04 }, { at: 88, value: 1 }, { at: 100, value: 1 },
  ]);
  const opacity = sample([
    { at: 0, value: 0, ease: dropEase }, { at: 10, value: 1 }, { at: 100, value: 1 },
  ]);
  const brightness = sample([
    { at: 0, value: 1 }, { at: 42, value: 1, ease: blastEase },
    { at: 56, value: 2.4, ease: settleEase }, { at: 68, value: 1.1, ease: outEase },
    { at: 80, value: 1 }, { at: 100, value: 1 },
  ]);
  return { offsetY: y * radius, scaleX: sx, scaleY: sy, opacity, brightness };
}

/** Symmetrical 5-pointed star path used for the Boss stage indicator on the gameplay HUD. */
export function traceHudStarPath(
  c: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR = outerR * 0.44,
  points = 5,
) {
  c.beginPath();
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
}
const SPIKE_LEN = 28;
export const BOARD_OBSTACLE_SCALE = 2;
export const SPIKE_SCALE = BOARD_OBSTACLE_SCALE;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Keep the sandal's chunky silhouette at full size even if a mini-shot buff is active. */
export function projectileSizeMultiplier(kind: WeaponId, mini: boolean, giant: boolean) {
  if (kind === 'sandal' && mini) return giant ? 1.8 : 1;
  return mini ? 0.65 : giant ? 1.8 : 1;
}

/** Preserve the normal Nail Gun size; only the weapon's existing charge buff enlarges shots. */
export function embeddedProjectileScale(big = 0) {
  return big ? 1 + big * 0.3 : 1;
}

/** Convert each weapon's visible shot width into the rock's local hit radius. */
export function diamondCoreProjectileRadius(weaponHalf: number, shotScale: number, rockScale: number) {
  return Math.max(6, weaponHalf * shotScale / Math.max(0.1, rockScale));
}

/**
 * Fast, distinctive signature rotation choreography for each boss:
 * - knight: Duelist sword-lunge & counter-parry (4.4s cycle)
 * - oni: Berserker rage whiplash & sudden fake-out snap (3.6s cycle)
 * - cyborg: High-torque servo overdrive with 3x harmonic burst pulses
 * - pirate: Stormy swashbuckler sea-surge pendulum whip
 */
/**
 * Game B's boss wheel rhythm, number for number (`levels.ts` → `speedAt`, the
 * `boss` pattern), in rad/s: 6 s cycle of fast spin → fake brake → reverse
 * burst → freeze → jitter. Game A's old per-type spin curves (knight lunge,
 * oni whiplash, pirate surge) are Game A's own invention and no longer run on
 * a boss stage: Perfect Shot's boss is what Game A's boss does now.
 */
export function bossSpinSpeed(level: number, levelTime: number) {
  const baseDeg = 72 + Math.min(110, Math.max(0, level) * 4);
  const b = (baseDeg * Math.PI) / 180;
  const t = Math.max(0, levelTime);
  const c = t % 6;
  const k = c < 2.1 ? 1.25
    : c < 2.6 ? 0.12
    : c < 4.1 ? -1.5
    : c < 4.5 ? 0
    : 0.85 + 0.75 * Math.sin(t * 6);
  return b * k;
}

export function bossRotationSpeed(type: BossAttackFamily, levelTime: number) {
  const t = Math.max(0, levelTime);
  switch (type) {
    case 'knight': {
      const phase = t % 4.4;
      if (phase < 2.2) {
        const lunge = Math.sin((phase / 2.2) * Math.PI);
        return 2.65 + lunge * 1.05;
      }
      const parry = Math.sin(((phase - 2.2) / 2.2) * Math.PI);
      return -(2.75 + parry * 0.95);
    }
    case 'oni': {
      const phase = t % 3.6;
      if (phase < 1.55) return -3.45 - Math.sin((phase / 1.55) * Math.PI) * 0.75;
      if (phase < 2.25) return 3.35;
      if (phase < 2.85) return -3.75;
      return 3.15 + Math.sin(((phase - 2.85) / 0.75) * Math.PI) * 0.65;
    }
    case 'cyborg':
      return Math.cos(t * 1.48) * 3.15 + Math.sin(t * 4.44) * 1.05;
    case 'pirate':
      return Math.cos(t * 1.18 + 0.25) * 3.55 + Math.sin(t * 2.55) * 1.15;
  }
}

const BOSS_RISE_HEIGHT = 58;
const BOSS_MOVE_CYCLE = 10;
const smooth01 = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Rises smoothly, pauses at the high position, then returns and rests for strategy time. */
export function bossRiseOffset(levelTime: number) {
  const phase = ((levelTime % BOSS_MOVE_CYCLE) + BOSS_MOVE_CYCLE) % BOSS_MOVE_CYCLE;
  if (phase < 2) return 0;
  if (phase < 3.3) return BOSS_RISE_HEIGHT * smooth01((phase - 2) / 1.3);
  if (phase < 4.6) return BOSS_RISE_HEIGHT;
  if (phase < 5.9) return BOSS_RISE_HEIGHT * (1 - smooth01((phase - 4.6) / 1.3));
  return 0;
}

/** Shorter intervals make bosses fire about 30% more often without bunching shots. */
export function bossFireInterval(baseInterval: number, jitter = 0) {
  return Math.max(1.05, baseInterval * 0.7 + jitter);
}

/** A 2D affine matrix, enough for the boss' idle float and its reactions. */
type BossMat = { a: number; b: number; c: number; d: number; e: number; f: number };
const bossMatMul = (m: BossMat, n: BossMat): BossMat => ({
  a: m.a * n.a + m.c * n.b,
  b: m.b * n.a + m.d * n.b,
  c: m.a * n.c + m.c * n.d,
  d: m.b * n.c + m.d * n.d,
  e: m.a * n.e + m.c * n.f + m.e,
  f: m.b * n.e + m.d * n.f + m.f,
});
const bossMatRot = (r: number): BossMat => ({ a: Math.cos(r), b: Math.sin(r), c: -Math.sin(r), d: Math.cos(r), e: 0, f: 0 });
const bossMatScale = (x: number, y: number): BossMat => ({ a: x, b: 0, c: 0, d: y, e: 0, f: 0 });
const bossMatMove = (x: number, y: number): BossMat => ({ a: 1, b: 0, c: 0, d: 1, e: x, f: y });
const bossMatApply = (m: BossMat, x: number, y: number) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });
const bossMatInvert = (m: BossMat): BossMat => {
  const det = m.a * m.d - m.b * m.c || 1e-6;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
};

const norm = (a: number) => ((a % TAU) + TAU) % TAU;
const angDiff = (a: number, b: number) => {
  let d = norm(a - b);
  if (d > Math.PI) d = TAU - d;
  return d;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
/** Slide 9 flashes with any CSS colour; slide 1's tint wants an `r,g,b` triple. */
const hexToRgbTriplet = (color: string): string => {
  const hex = color.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hex) {
    const raw = hex[1].length === 3 ? hex[1].split('').map((ch) => ch + ch).join('') : hex[1];
    const n = parseInt(raw, 16);
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const rgb = color.match(/(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
  return rgb ? `${rgb[1]},${rgb[2]},${rgb[3]}` : '255,255,255';
};

/**
 * Every weapon's own classic firing sound (the "Sebelumnya" / "Baru" cards).
 *
 * The `slide23Sfx.shoot(id, gain)` arms carry a level multiplier: slide 2/3
 * wrote those recipes as soft accents under their stage music, and as the only
 * voice of a slide-1 shot they were far quieter than the rest of the arsenal.
 * ×1.5–×4 brings them to the same peak band as everything else while keeping
 * their exact timbre and rhythm.
 */
export const FIRE_SFX: Record<WeaponId, () => void> = {
  pistol: sfx.shoot, ak47: sfx.shootAk, plasma: sfx.shootPlasma, laser: sfx.shootLaser,
  cricket: sfx.shootCricket, electro: sfx.shootElectro, nail: sfx.shootNail, fish: sfx.shootFish,
  crossbow: sfx.shootCrossbow, bazooka: () => slide23Sfx.shoot('bazooka'), rpg: () => slide23Sfx.shoot('rpg', 1.6), freeze: sfx.shootFreeze,
  golden: sfx.shootGolden, blackhole: () => slide23Sfx.shoot('blackhole', 2.2),
  shotgun: sfx2.shotgun, sniper: sfx2.sniper, minigun: sfx2.minigun, railgun: sfx2.railgun,
  flamethrower: sfx2.flame, slingshot: sfx2.slingshot, blowgun: sfx2.blowgun,
  bamboo: () => slide23Sfx.shoot('bamboo', 1.8), banana: sfx2.banana, magnet: sfx2.magnet, bubble: sfx2.bubble,
  shrink: sfx2.shrink, grow: sfx2.grow, harpoon: sfx2.harpoon, soaker: () => slide23Sfx.shoot('soaker', 3.2),
  snowball: sfx2.snowball, pirate: sfx2.pirate, chicken: sfx2.chicken, card: sfx2.card, confetti: sfx2.confetti,
  seed: sfx2.seed, dragon: sfx2.dragon,
  gravity: sfx2.gravity, pizza: sfx2.pizza,
  honey: sfx3.honey, coconut: sfx3.coconut, angklung: sfx3.angklung, bee: sfx3.bee, yoyo: () => slide23Sfx.shoot('yoyo', 4),
  sakura: sfx3.sakura, acid: sfx3.acid, keris: () => slide23Sfx.shoot('keris', 3.4), firework: () => fireworkSfx.shoot(), anchor: sfx3.anchor,
  shark: () => slide23Sfx.shoot('shark', 3.4), ghost: sfx3.ghost, ufo: sfx3.ufo, rainbow: () => slide23Sfx.shoot('rainbow', 4.6), meteor: sfx3.meteor, diamond: () => slide23Sfx.shoot('diamond', 1.8),
  moonbeam: sfx3.moonbeam, storm: sfx3.storm,
  obliterator: sfx4.obliterator, buster: sfx4.busterSmall, paintball: sfx4.paintball, holy: sfx4.holy, beerifle: sfx4.beeRifle,
  emerald: sfx4.emerald, ruby: sfx4.ruby, sapphire: sfx4.sapphire, crystal: () => slide23Sfx.shoot('crystal', 4), unicorn: sfx4.unicorn,
  pencil: sfx4.pencil, sandal: sfx4.sandal, wand: sfx4.wand,
  coingun: sfx5.coinGun, blaster: sfx5.blaster,
  photon_saber: sfx6.saberShoot,
  gauntlet_cannon: sfx6.gauntlet, ironman_hand: sfx6.gauntlet,
  pulse_rifle: sfx6.pulse, cryo_blaster: sfx6.cryo, hyperdrive: sfx6.hyper,
  quantum_destabilizer: sfx6.quantum,
  xeno: sfx6.xeno,
  dora: sfx6.dora,
  pred: sfx6.pred,
  // Slide 9 ports: their own synthesizer plays while the SET 9 effect is
  // selected; these are the classic sounds of the older effect cards.
  longbow: sfx.shootCrossbow, mp5: sfx.shootNail, tesla_rifle: sfx.shootElectro,
  ion_smg: sfx.shootElectro, phaser: sfx.shootLaser, yautja: sfx.shootPlasma,
  identity_disc: sfx2.magnet, proton_pack: sfx3.ghost, heat_ray: sfx2.flame,
  // Slide 11
  mega_buster: () => slide23Sfx.shoot('bamboo', 1.8), harmonic_disruptor: sfx2.magnet,
  absolute_zero: sfx.shootFreeze, helios_flare: sfx.shootGolden,
  chrono_rifle: sfx2.railgun, orbital_beacon: () => slide23Sfx.shoot('bazooka'),
  helix_pulsar: sfx2.minigun, singularity: () => slide23Sfx.shoot('blackhole', 2.2),
  prism_lance: sfx.shootLaser, nano_swarm: sfx2.minigun,
};
/** The per-weapon impact accent, where the weapon has one of its own. */
export const HIT_SFX: Partial<Record<WeaponId, () => void>> = {
  coingun: sfx.coin, blaster: sfx5.blasterHit,
  photon_saber: sfx6.saberHit,
  gauntlet_cannon: sfx6.gauntletHit, ironman_hand: sfx6.gauntletHit,
  pulse_rifle: sfx6.pulseHit, cryo_blaster: sfx6.cryoHit, hyperdrive: sfx6.hyperHit,
  quantum_destabilizer: sfx6.quantumHit,
  chicken: sfx2.squeak, bubble: sfx2.pop, card: sfx2.card, snowball: sfx2.thud, soaker: sfx2.splat,
  pizza: sfx2.splat, banana: sfx2.splat, seed: sfx2.seed, slingshot: sfx2.thud, pirate: sfx2.crash,
  magnet: sfx2.metal,
  shrink: sfx2.shrink, grow: sfx2.grow, gravity: sfx2.gravity, railgun: sfx.zap,
  honey: sfx2.splat, coconut: sfx3.coconutHit, bee: sfx3.sting, yoyo: sfx3.bloop, sakura: sfx3.chime,
  acid: sfx3.sizzle, keris: sfx3.kerisStick, anchor: sfx3.clank, shark: sfx3.chomp, ghost: sfx3.wail,
  ufo: sfx.zap, rainbow: sfx3.chime, diamond: sfx3.chime, moonbeam: sfx3.chime, storm: sfx3.thunder,
  obliterator: sfx4.obliteratorHit, paintball: sfx4.paintSplat, holy: sfx4.purify, emerald: sfx3.chime, ruby: sfx2.metal,
  sapphire: sfx.ice, crystal: sfx4.shatter, unicorn: sfx4.magic, pencil: sfx4.scribble, sandal: sfx4.plak, wand: sfx4.magic,
};
/**
 * Level trim for slide 1's own recipes.
 *
 * A dozen of slide 1's sounds were written as *accents* — a unicorn's sparkle,
 * a shrink ray's whiff, a ghost's moan — mixed to sit under a bigger blast. On
 * the guns where that accent is the entire shot, they measured 0.07–0.2 peak
 * next to a 0.45 peak arsenal, which is exactly the "lirih" that made the
 * ports feel wrong. The trim keeps each recipe untouched and only lifts its
 * level into the same band as every other gun.
 */
export const FIRE_GAIN: Partial<Record<WeaponId, number>> = {
  unicorn: 6, emerald: 5.6, shrink: 3.75, ufo: 3.75, buster: 3.75, holy: 3.75,
  chicken: 3, sakura: 3, ghost: 3, wand: 3, moonbeam: 2.8, magnet: 2.5,
  seed: 2.25, bee: 2.25, laser: 1.6,
};

/** Fires a slide-1 gun's own sound at its trimmed level. */
export function playFireSfx(id: WeaponId) {
  const k = FIRE_GAIN[id] ?? 1;
  if (k === 1) FIRE_SFX[id]();
  else withSfxGain(k, FIRE_SFX[id]);
}
/**
 * Slide 2's own stage-clear and fail cheers, one voice per gun.
 *
 * Slide 1 used to answer every weapon with `slide23Sfx` — a hand-typed copy of
 * slide 2's envelopes, close but never the same. Slide 2 ships the real class,
 * so the eight imported guns now play the real thing: no re-typed gain, no
 * re-typed reverb send.
 */
const SET_TWO_CLEAR: Record<string, () => void> = {
  firework: () => slide2Sfx.clearFirework(),
  blackhole: () => slide2Sfx.clearBH(),
  shark: () => slide2Sfx.clearShark(),
  bamboo: () => slide2Sfx.clearBamboo(),
  soaker: () => slide2Sfx.clearSoaker(),
  rainbow: () => slide2Sfx.clearRainbow(),
  bazooka: () => slide2Sfx.clearBazooka(),
  rpg: () => slide2Sfx.clearRpg(),
};

const SET_TWO_FAIL: Record<string, () => void> = {
  firework: () => slide2Sfx.failFirework(),
  blackhole: () => slide2Sfx.failBH(),
  shark: () => slide2Sfx.failShark(),
  bamboo: () => slide2Sfx.failBamboo(),
  soaker: () => slide2Sfx.failSoaker(),
  rainbow: () => slide2Sfx.failRainbow(),
  bazooka: () => slide2Sfx.failBazooka(),
  rpg: () => slide2Sfx.failRpg(),
};

const PAINT = ['244,63,94', '250,204,21', '34,211,238', '168,85,247', '74,222,128', '251,146,60'];

type ItemType = 'bullet' | 'old' | 'spike' | 'coin' | 'diamond_chest';
interface AcidStuck { blobs: AcidStuckBlob[]; dripT: number; drip: number; seed: number; hybrid?: boolean }
interface Item { angle: number; type: ItemType; age: number; /** Game B's stuck-knife variant (boss obstacles). */ knife?: number; /** Game B's knife lean, in degrees. */ tilt?: number; /** Exact radius (px) the round bit into the target artwork. */ r?: number; /** Exact impact point in the target's own frame (art-local px). */ px?: number; py?: number; ghostVolley?: number; w?: WeaponId; scale?: number; vel?: number; harvested?: boolean; tint?: string; big?: number; hits?: number; hue?: number; flash?: number; acid?: AcidStuck; hideArt?: boolean; busterPellet?: boolean; setTwo?: boolean; s7Half?: number; s7Protrude?: number }
interface Proj { x: number; y: number; vx: number; vy: number; originX?: number; ghostAim?: boolean; ghostVolley?: number; setSix?: true; setOne?: SetOneShot; setSeven?: SevenShot; setSevenPending?: boolean; s7Ghost?: boolean; comboBeam?: ComboBeam; hold?: number; setNine?: NineBullet; setNinePending?: boolean; s9Ghost?: boolean; setNineBeam?: number; setEleven?: ElevenProj; setElevenPending?: boolean; s11Wait?: boolean; s11Ghost?: boolean; setTwo?: TwoRound; pierced?: number; hist?: { x: number; y: number }[]; tint?: string; big?: number; mini?: boolean; giant?: boolean; hue?: number; flash?: number; spawnDelay?: number; wob?: number; lastEcho?: number; t?: number; trail?: { x: number; y: number }[] }
type StepRes = {
  res: 'none' | 'stick' | 'fail' | 'hit';
  spike?: boolean;
  local?: number;
  r?: number;
  /** Exact impact point in the target's own frame (art-local px). */
  px?: number;
  py?: number;
};
interface Light { x: number; y: number; r: number; rgb: string; life: number; max: number }
interface Fragment {
  x: number; y: number; vx: number; vy: number; rot: number; vr: number;
  a0: number; a1: number; pitch: number; pitchV: number;
  /** Colour/thickness read from the target artwork for this wedge. */
  side?: string; edge?: string; depth?: number;
  /** Faces baked once per stage, so the burst only blits them. */
  sprite?: WedgeSprite | null;
}

/** Game B's SVG, traced into real paths so hits never depend on pixel reads. */
export interface ArtMask {
  size: number;
  /** Alpha of the target artwork, row-major, exactly as drawn on screen. */
  alpha: Uint8Array;
  /**
   * Half of the mask's world extent, in units of the level radius R. The target
   * is blitted into a padded canvas (`R + 40` for a boss), so the mask spans
   * more than [-R, R] and every lookup has to be scaled by this.
   */
  span: number;
  /** Outermost opaque pixel of the mask, in units of R. */
  maxR: number;
  /**
   * The boss as a solid object: `1` for every pixel a round can hit. That is
   * the ink *plus* the see-through windows the head encloses (the jester's hat,
   * the vampire's collar). Those windows are inside the silhouette — the player
   * sees them framed by the drawing — so a round may not sail through the middle
   * of the boss. Air outside the silhouette stays `0`.
   */
  solid: Uint8Array;
}

/**
 * The boss' solid footprint: its ink, with the transparent windows the ink
 * completely encloses filled in. The fill starts at the mask border and creeps
 * through air that is not walled off by ink; whatever air it cannot reach is
 * inside the drawing (a window in the art), and the boss is solid there.
 * Concave notches stay open — they are part of the outside, so a round can still
 * fly into them and only stops where the drawing itself is.
 */
export function buildSolidFootprint(size: number, alpha: Uint8Array): Uint8Array {
  // 1. The wall: real ink, thickened by one pixel. Anti-aliasing and the odd
  //    one-pixel break in a hairline stroke would otherwise leak the fill from
  //    the sky into the middle of the head.
  const wall = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (alpha[y * size + x] <= INK_ALPHA) continue;
      const y0 = Math.max(0, y - 1);
      const y1 = Math.min(size - 1, y + 1);
      const x0 = Math.max(0, x - 1);
      const x1 = Math.min(size - 1, x + 1);
      for (let v = y0; v <= y1; v++) for (let u = x0; u <= x1; u++) wall[v * size + u] = 1;
    }
  }
  // 2. Flood the sky: every pixel the outside can reach through non-wall air.
  const open = new Uint8Array(size * size);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = y * size + x;
    if (open[i] || wall[i]) return;
    open[i] = 1;
    stack.push(i);
  };
  for (let x = 0; x < size; x++) {
    push(x, 0);
    push(x, size - 1);
  }
  for (let y = 0; y < size; y++) {
    push(0, y);
    push(size - 1, y);
  }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % size;
    const y = (i - x) / size;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  // 3. The boss: its real ink, plus the windows the ink encloses. The soft
  //    fringe is left to the sky, so the line sits on the visible edge.
  const touchesSky = (x: number, y: number) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const u = x + dx;
        const v = y + dy;
        if (u < 0 || v < 0 || u >= size || v >= size) return true;
        if (open[v * size + u]) return true;
      }
    }
    return false;
  };
  const solid = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      // Ink is boss. So is the air a drawing encloses (a window in the head) —
      // but not the anti-aliased fringe that merely borders the sky, or the
      // blue line would float a pixel off the art.
      solid[i] = alpha[i] > INK_ALPHA || (!open[i] && !touchesSky(x, y)) ? 1 : 0;
    }
  }
  return solid;
}

/** Assemble the mask + its solid footprint once, for both builders. */
function finalizeArtMask(size: number, alpha: Uint8Array, span: number, maxPx: number): ArtMask {
  return {
    size,
    alpha,
    span,
    maxR: (maxPx / (size / 2)) * span,
    solid: buildSolidFootprint(size, alpha),
  };
}

/**
 * Alpha mask of the artwork that is actually on screen, for pixel-exact hits.
 * `source` is the very canvas the renderer blits (or an image drawn 1:1 into
 * it), so the mask can never describe a different shape than the player sees.
 */
export function buildArtMask(source: CanvasImageSource | null, span = 1, size = 240): ArtMask | null {
  if (!source) return null;
  try {
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const g = cv.getContext('2d');
    if (!g) return null;
    g.drawImage(source, 0, 0, size, size);
    const data = g.getImageData(0, 0, size, size).data;
    const alpha = new Uint8Array(size * size);
    const half = size / 2;
    let maxPx = 0;
    for (let i = 0, p = 3; i < alpha.length; i++, p += 4) {
      const a = data[p];
      alpha[i] = a;
      if (a > 20) {
        const x = (i % size) - half + 0.5;
        const y = Math.floor(i / size) - half + 0.5;
        const d = Math.hypot(x, y);
        if (d > maxPx) maxPx = d;
      }
    }
    return finalizeArtMask(size, alpha, span, maxPx);
  } catch {
    return null;
  }
}

/**
 * Rasterise the target's own SVG markup into the same alpha mask the pixel
 * readback produces. Some browsers and WebViews hand back an empty buffer for a
 * canvas that has had an SVG image drawn into it (SVG images can never be read
 * back). Drawing the *paths* into our own canvas is always readable, so the
 * boss keeps its real silhouette — hat, beard, horns, every notch — instead of
 * falling back to a ring.
 */
export function buildArtMaskFromSvg(markup: string | null, span = 1, size = 384): ArtMask | null {
  if (!markup) return null;
  if (typeof DOMParser === 'undefined' || typeof Path2D === 'undefined') return null;
  const doc = (() => {
    try {
      return new DOMParser().parseFromString(markup, 'image/svg+xml');
    } catch {
      return null;
    }
  })();
  if (!doc) return null;
  const root = (doc as Document).documentElement as Element | null;
  if (!root) return null;
  const tagOf = (el: Element) => String(el.nodeName || '').toLowerCase();
  const svg = tagOf(root) === 'svg'
    ? root
    : ((doc as Document).getElementsByTagName?.('svg')[0] as Element | undefined) ?? null;
  if (!svg) return null;
  const vb = readViewBox(svg);
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  if (!g) return null;
  g.clearRect(0, 0, size, size);
  // A world point sits at mask pixel ((w - -span*R) / (2*span*R)) * size, and the
  // drawing is blitted into the -R..R box, so one viewBox unit is
  // (2*R/vb.w) world px. Both scale factors fold into a single transform.
  const kx = size / (span * vb.w);
  const ky = size / (span * vb.h);
  g.setTransform(kx, 0, 0, ky, -vb.x * kx + ((span - 1) * size) / (2 * span), -vb.y * ky + ((span - 1) * size) / (2 * span));
  let inked = 0;
  const paint = new Set(['path', 'circle', 'ellipse', 'rect', 'polygon', 'polyline', 'line']);
  const walk = (el: Element, inherited: { fill: string | null; stroke: string | null; sw: number; alpha: number }) => {
    const tag = tagOf(el);
    if (SKIP_SVG.has(tag)) return;
    const style = parseSvgStyle(el.getAttribute('style'));
    const attr = (k: string) => {
      const v = el.getAttribute(k);
      return v === null || v === undefined ? style[k] ?? null : v;
    };
    const ownAlpha = attr('opacity');
    const alpha = inherited.alpha * (ownAlpha === null ? 1 : clamp01(Number(ownAlpha)));
    if (alpha <= 0.04 || (attr('display') ?? '') === 'none' || (attr('visibility') ?? '') === 'hidden') return;
    const next = {
      fill: attr('fill') ?? inherited.fill,
      stroke: attr('stroke') ?? inherited.stroke,
      sw: attr('stroke-width') === null ? inherited.sw : Number(attr('stroke-width')) || 0,
      alpha,
    };
    // A group's transform applies to everything under it, so it is pushed
    // before the shape and popped after its children.
    g.save();
    applySvgTransforms(g, attr('transform'));
    if (paint.has(tag)) {
      const path = svgShapePath(el, tag);
      if (path) {
        const fill = next.fill ?? 'black';
        const stroke = next.stroke;
        if (tag !== 'line' && fill !== 'none' && fill !== 'transparent') {
          g.globalAlpha = clamp01((Number(attr('fill-opacity') ?? '1') || 0) * next.alpha);
          g.fillStyle = '#000';
          g.fill(path);
          inked++;
        }
        if (stroke && stroke !== 'none' && stroke !== 'transparent' && next.sw > 0) {
          g.globalAlpha = clamp01((Number(attr('stroke-opacity') ?? '1') || 0) * next.alpha);
          g.strokeStyle = '#000';
          g.lineWidth = next.sw;
          g.lineJoin = 'round';
          g.lineCap = 'round';
          g.stroke(path);
          inked++;
        }
      }
    }
    for (let i = 0; i < el.childNodes.length; i++) {
      const child = el.childNodes[i] as Element;
      if (child && child.nodeType === 1) walk(child, next);
    }
    g.restore();
  };
  try {
    walk(svg, { fill: null, stroke: null, sw: 1, alpha: 1 });
    if (!inked) return null;
    const data = g.getImageData(0, 0, size, size).data;
    const alpha = new Uint8Array(size * size);
    const half = size / 2;
    let maxPx = 0;
    for (let i = 0, p = 3; i < alpha.length; i++, p += 4) {
      const a = data[p];
      alpha[i] = a;
      if (a > 20) {
        const x = (i % size) - half + 0.5;
        const y = Math.floor(i / size) - half + 0.5;
        const d = Math.hypot(x, y);
        if (d > maxPx) maxPx = d;
      }
    }
    return finalizeArtMask(size, alpha, span, maxPx);
  } catch {
    return null;
  }
}

/** Containers whose contents are paint servers or clipping, never ink. */
const SKIP_SVG = new Set([
  'defs', 'clippath', 'mask', 'filter', 'symbol', 'pattern', 'lineargradient',
  'radialgradient', 'stop', 'title', 'desc', 'metadata', 'style', 'script',
  'foreignobject', 'marker', 'animate', 'animatetransform', 'animatemotion', 'set',
]);

function clamp01(n: number) {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}

function readViewBox(svg: Element) {
  const raw = (svg.getAttribute('viewBox') ?? '').trim().split(/[\s,]+/).map(Number);
  const ok = raw.length === 4 && raw.every(Number.isFinite) && raw[2] > 0 && raw[3] > 0;
  return ok
    ? { x: raw[0], y: raw[1], w: raw[2], h: raw[3] }
    : { x: -100, y: -100, w: 200, h: 200 };
}

function parseSvgStyle(raw: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  for (const part of raw.split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    out[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim();
  }
  return out;
}

/** The path geometry of one SVG shape, in the shape's own coordinates. */
function svgShapePath(el: Element, tag: string): Path2D | null {
  const num = (k: string, d = 0) => {
    const v = Number(el.getAttribute(k));
    return Number.isFinite(v) ? v : d;
  };
  try {
    if (tag === 'path') {
      const d = el.getAttribute('d');
      return d ? new Path2D(d) : null;
    }
    const p = new Path2D();
    if (tag === 'circle') {
      p.arc(num('cx'), num('cy'), Math.max(0, num('r')), 0, Math.PI * 2);
      return p;
    }
    if (tag === 'ellipse') {
      p.ellipse(num('cx'), num('cy'), Math.max(0, num('rx')), Math.max(0, num('ry')), 0, 0, Math.PI * 2);
      return p;
    }
    if (tag === 'rect') {
      p.rect(num('x'), num('y'), num('width'), num('height'));
      return p;
    }
    const pts = (el.getAttribute('points') ?? '').trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
    if (pts.length < 4) return null;
    p.moveTo(pts[0], pts[1]);
    for (let i = 2; i + 1 < pts.length; i += 2) p.lineTo(pts[i], pts[i + 1]);
    if (tag === 'polygon') p.closePath();
    return p;
  } catch {
    return null;
  }
}

/** Apply an SVG `transform` attribute, left to right, exactly as SVG does. */
function applySvgTransforms(g: CanvasRenderingContext2D, raw: string | null) {
  if (!raw) return;
  const re = /([a-zA-Z]+)\s*\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const op = m[1].toLowerCase();
    const a = m[2].trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
    try {
      if (op === 'translate') g.translate(a[0] ?? 0, a[1] ?? 0);
      else if (op === 'scale') g.scale(a[0] ?? 1, a.length > 1 ? a[1] : a[0] ?? 1);
      else if (op === 'rotate') {
        const deg = ((a[0] ?? 0) * Math.PI) / 180;
        if (a.length >= 3) {
          g.translate(a[1], a[2]);
          g.rotate(deg);
          g.translate(-a[1], -a[2]);
        } else g.rotate(deg);
      } else if (op === 'skewx') g.transform(1, 0, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 1, 0, 0);
      else if (op === 'skewy') g.transform(1, Math.tan(((a[0] ?? 0) * Math.PI) / 180), 0, 1, 0, 0);
      else if (op === 'matrix' && a.length >= 6) g.transform(a[0], a[1], a[2], a[3], a[4], a[5]);
    } catch {
      /* an unparsable op leaves the rest of the chain intact */
    }
  }
}

/**
 * 360-bin silhouette radius of an alpha mask, in units of R — the contour every
 * placement, the debug overlay and the de-wobbled hit test share. It is read
 * from the artwork's own pixels, so it can never describe a circle that the
 * drawing does not have.
 */
/**
 * The artwork's own edge, one exact value per degree: a ray is walked from just
 * outside the mask inwards and the first solid pixel is the surface — the same
 * rule every round is tested with. No smoothing and no inset, because this is
 * also what positions the knives, the coins and the aim guide: a 5-tap average
 * put a knife a few pixels off a spiked silhouette (the pirate's mane), which
 * read as "the knife is on the wheel rim, not on the head".
 */
export function maskProfile(mask: ArtMask): number[] {
  const { size, span } = mask;
  const half = size / 2;
  const out: number[] = new Array(360).fill(0.3);
  for (let deg = 0; deg < 360; deg++) {
    const a = (deg * Math.PI) / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    let found = 0;
    for (let r = half * 0.995; r >= 2; r -= 0.3) {
      const x = Math.floor(half + cos * r);
      const y = Math.floor(half + sin * r);
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      if (maskInk(mask, x, y)) {
        found = r;
        break;
      }
    }
    out[deg] = Math.min(1.45, Math.max(0.3, (found / half) * span));
  }
  return out;
}

/**
 * The artwork's exact silhouette as a path, in mask pixels: every opaque pixel
 * that touches a transparent one becomes a 1x1 square. `?hitbox=1` draws this
 * so the shape on screen can be compared with the shape the engine collects.
 */
export function buildMaskOutline(mask: ArtMask): Path2D | null {
  if (typeof Path2D === 'undefined') return null;
  const { size } = mask;
  const p = new Path2D();
  const solid = (x: number, y: number) => maskInk(mask, x, y);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!solid(x, y)) continue;
      if (solid(x - 1, y) && solid(x + 1, y) && solid(x, y - 1) && solid(x, y + 1)) continue;
      p.rect(x, y, 1, 1);
    }
  }
  return p;
}

/**
 * The same silhouette as a *filled* shape, in mask pixels: a ray is marched
 * from outside the mask inwards every degree, and the first solid pixel is the
 * edge. Cached once per mask, so the collision overlay can fill the exact area
 * the hit test uses instead of a smoothed approximation of it.
 */
export function buildMaskSurface(mask: ArtMask, steps = 720): Path2D | null {
  if (typeof Path2D === 'undefined') return null;
  const { size } = mask;
  const p = new Path2D();
  const half = size / 2;
  const outer = half * 0.995;
  let first = true;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    let r = outer;
    for (; r > 1; r -= 0.35) {
      const u = Math.floor(half + cos * r);
      const v = Math.floor(half + sin * r);
      if (u < 0 || v < 0 || u >= size || v >= size) continue;
      if (maskInk(mask, u, v)) break;
    }
    const x = half + cos * r;
    const y = half + sin * r;
    if (first) {
      p.moveTo(x, y);
      first = false;
    } else p.lineTo(x, y);
  }
  p.closePath();
  return p;
}

/**
 * Where the drawing actually is. One threshold for everything — the hit test,
 * the collision overlay, the contour and the outline — so the blue line the
 * player sees is *exactly* the line a round stops on: no anti-aliased halo, no
 * 3x3 neighbourhood, nothing a few pixels outside the artwork's own edge.
 */
export const INK_ALPHA = 96;

/** Is this mask pixel part of the drawing's ink? Used for tracing, not hits. */
function maskInk(mask: ArtMask, x: number, y: number): boolean {
  const { size, alpha } = mask;
  if (x < 0 || y < 0 || x >= size || y >= size) return false;
  return alpha[y * size + x] > INK_ALPHA;
}

/**
 * Is this mask pixel inside the boss' blue outline? THIS is the hitbox.
 *
 * A boss is a closed object, not a set of visible pixels: its silhouette is the
 * ink plus the transparent windows that ink encloses. A round used to sail
 * through those windows — straight through the middle of the boss — because the
 * test only accepted ink. Air outside the silhouette is still air, so a round
 * that misses the blue outline keeps flying.
 */
function maskSolid(mask: ArtMask, x: number, y: number): boolean {
  const { size, alpha, solid } = mask;
  if (x < 0 || y < 0 || x >= size || y >= size) return false;
  // A mask built by hand (tests, tooling) may not carry a footprint; the ink is
  // then the best available shape.
  if (!solid || !solid.length) return alpha[y * size + x] > INK_ALPHA;
  return solid[y * size + x] === 1;
}

/**
 * The blue line: the exact boundary of the solid footprint, traced with marching
 * squares in mask pixel space. It follows the helmet's notch and the horns'
 * spikes (no star-shaped bridging) and it never wanders into empty air, because
 * every segment separates a solid pixel from an open one. Hit test and line are
 * two views of the same bytes.
 */
export function buildSolidRegion(mask: ArtMask): Path2D | null {
  if (typeof Path2D === 'undefined') return null;
  const { size, solid } = mask;
  const p = new Path2D();
  for (let y = 0; y < size; y++) {
    let x = 0;
    while (x < size) {
      if (!solid[y * size + x]) { x++; continue; }
      const start = x;
      while (x < size && solid[y * size + x]) x++;
      p.rect(start, y, x - start, 1);
    }
  }
  return p;
}

export function buildSolidOutline(mask: ArtMask): Path2D | null {
  if (typeof Path2D === 'undefined') return null;
  const { size, solid } = mask;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= size || y >= size ? 0 : solid[y * size + x];
  const p = new Path2D();
  const seg = (x1: number, y1: number, x2: number, y2: number) => {
    p.moveTo(x1, y1);
    p.lineTo(x2, y2);
  };
  for (let y = -1; y < size; y++) {
    for (let x = -1; x < size; x++) {
      const a = at(x, y);
      const b = at(x + 1, y);
      const c = at(x + 1, y + 1);
      const d = at(x, y + 1);
      const code = a * 8 + b * 4 + c * 2 + d;
      if (code === 0 || code === 15) continue;
      const tx = x + 1, ty = y + 0.5;
      const rx = x + 1.5, ry = y + 1;
      const bx = x + 1, by = y + 1.5;
      const lx = x + 0.5, ly = y + 1;
      switch (code) {
        case 1: case 14: seg(lx, ly, bx, by); break;
        case 2: case 13: seg(bx, by, rx, ry); break;
        case 3: case 12: seg(lx, ly, rx, ry); break;
        case 4: case 11: seg(tx, ty, rx, ry); break;
        case 6: case 9: seg(tx, ty, bx, by); break;
        case 7: case 8: seg(lx, ly, tx, ty); break;
        case 5: seg(tx, ty, rx, ry); seg(lx, ly, bx, by); break;
        case 10: seg(lx, ly, tx, ty); seg(bx, by, rx, ry); break;
        default: break;
      }
    }
  }
  return p;
}

interface TargetPixels { data: Uint8ClampedArray; size: number }

/** Read the target artwork once so the shatter debris can wear its own colours. */
export function readTargetPixels(face: HTMLCanvasElement | null): TargetPixels | null {
  if (!face) return null;
  try {
    const ctx = face.getContext('2d');
    if (!ctx) return null;
    const size = face.width;
    return { data: ctx.getImageData(0, 0, size, size).data, size };
  } catch {
    return null; // a canvas we are not allowed to read: keep the palette fallback
  }
}

const hex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')}`;

/** Average ink of one wheel/boss wedge, plus its lighter bevel and darker wall. */
export function wedgeInk(
  pix: TargetPixels,
  radius: number,
  pad: number,
  scale: number,
  a0: number,
  a1: number,
): { side: string; edge: string } | null {
  const { data, size } = pix;
  let r = 0, g = 0, b = 0, n = 0;
  const rings = [0.42, 0.56, 0.7, 0.84, 0.94];
  const steps = 6;
  for (const k of rings) {
    for (let i = 0; i < steps; i++) {
      const a = a0 + (a1 - a0) * ((i + 0.5) / steps);
      const px = Math.round((Math.cos(a) * radius * k + radius + pad) * scale);
      const py = Math.round((Math.sin(a) * radius * k + radius + pad) * scale);
      if (px < 0 || py < 0 || px >= size || py >= size) continue;
      const o = (py * size + px) * 4;
      if (data[o + 3] < 70) continue;
      r += data[o];
      g += data[o + 1];
      b += data[o + 2];
      n++;
    }
  }
  if (!n) return null;
  r /= n;
  g /= n;
  b /= n;
  // Walls sit in shade, bevels catch the light: the same hue as the artwork.
  return {
    side: hex(r * 0.52, g * 0.52, b * 0.52),
    edge: hex(r + (255 - r) * 0.42, g + (255 - g) * 0.42, b + (255 - b) * 0.42),
  };
}

/** The artwork's own dominant colours, for the chips and shards flying off it. */
export function artChips(pix: TargetPixels): string[] | null {
  const { data, size } = pix;
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  const step = Math.max(2, Math.floor(size / 96));
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const o = (y * size + x) * 4;
      if (data[o + 3] < 120) continue;
      const r = data[o], g = data[o + 1], b = data[o + 2];
      const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
      const hit = buckets.get(key);
      if (hit) {
        hit.n++;
        hit.r += r;
        hit.g += g;
        hit.b += b;
      } else {
        buckets.set(key, { n: 1, r, g, b });
      }
    }
  }
  const ranked = [...buckets.values()].sort((p, q) => q.n - p.n).slice(0, 3);
  if (!ranked.length) return null;
  const colors = ranked.map((c) => hex(c.r / c.n, c.g / c.n, c.b / c.n));
  // A single dark bucket (a silhouette) still needs a readable chip colour.
  const light = ranked.map((c) => (c.r + c.g + c.b) / (3 * c.n)).sort((p, q) => q - p);
  if (colors.length === 1) colors.push(hex(light[0] * 1.35, light[0] * 1.35, light[0] * 1.35));
  return colors;
}

/**
 * A stage-clear wedge, pre-baked.
 *
 * The shatter used to rebuild everything about every chunk on every frame: two
 * curved `clip()`s, two big `drawImage`s of the wheel artwork, a directional
 * light gradient and the bevel strokes — per chunk, per frame. Nine chunks for
 * almost a second is the frame budget of the whole stage-clear cinematic.
 *
 * The artwork side of a wedge never changes once the stage starts (only its
 * pitch, depth and position do), so it is painted once into an offscreen canvas
 * with the front face and the darker rear face side by side. Per frame the
 * renderer then just blits each face, which is the same picture for a fraction
 * of the work: no clip, no per-chunk gradient, no repeated texture scaling.
 */
export interface WedgeSprite {
  /** Front face | rear face, side by side in one canvas. */
  canvas: HTMLCanvasElement;
  /** Pixel size of one face. */
  px: number;
  /** World half-extent of one face: `radius + pad`. */
  span: number;
}

/**
 * Bake one wedge of the target artwork.
 *
 * `pixelScale` is device pixels per world unit, so the sprite is already at the
 * screen's own resolution and stays crisp when the chunk tumbles toward the
 * camera.
 */
export function bakeWedgeSprite(
  face: CanvasImageSource,
  radius: number,
  pad: number,
  start: number,
  end: number,
  edgeColor: string,
  pixelScale: number,
): WedgeSprite | null {
  if (typeof document === 'undefined') return null;
  const span = radius + pad;
  const px = Math.max(16, Math.round(span * 2 * Math.max(0.5, Math.min(2, pixelScale))));
  const canvas = document.createElement('canvas');
  canvas.width = px * 2;
  canvas.height = px;
  const c = canvas.getContext('2d');
  if (!c) return null;

  const sector = () => {
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(start) * radius, Math.sin(start) * radius);
    c.arc(0, 0, radius, start, end);
    c.closePath();
  };

  const paint = (dx: number, rear: boolean) => {
    c.save();
    c.setTransform(pixelScale, 0, 0, pixelScale, dx + px / 2, px / 2);
    // The artwork, trimmed to the wedge.
    c.save();
    sector();
    c.clip();
    c.drawImage(face, -span, -span, span * 2, span * 2);
    c.restore();
    if (rear) {
      // The lower face always sits in shade.
      sector();
      c.fillStyle = 'rgba(0,0,0,0.14)';
      c.fill();
    } else {
      // One fixed upper-left light, baked into the face. The chunk tumbles, so
      // the highlight travels with the piece instead of being re-derived for
      // every frame — at this size the difference is invisible, and it costs
      // nothing.
      const lightAngle = -Math.PI * 0.75;
      const lightX = Math.cos(lightAngle) * radius * 0.82;
      const lightY = Math.sin(lightAngle) * radius * 0.82;
      const frontLight = c.createLinearGradient(lightX, lightY, -lightX, -lightY);
      frontLight.addColorStop(0, 'rgba(255,255,255,0.20)');
      frontLight.addColorStop(0.22, 'rgba(255,255,255,0.07)');
      frontLight.addColorStop(0.58, 'rgba(0,0,0,0.01)');
      frontLight.addColorStop(1, 'rgba(0,0,0,0.14)');
      c.save();
      sector();
      c.clip();
      c.fillStyle = frontLight;
      c.fill();
      c.restore();
      // Fine bevel glints along the cut edges.
      sector();
      c.strokeStyle = 'rgba(0,0,0,0.30)';
      c.lineWidth = 2;
      c.stroke();
      c.save();
      sector();
      c.globalAlpha = 0.22;
      c.strokeStyle = edgeColor;
      c.lineWidth = 0.9;
      c.stroke();
      c.restore();
      c.beginPath();
      c.arc(0, 0, radius - 1.5, start + 0.025, end - 0.025);
      c.strokeStyle = 'rgba(255,255,255,0.46)';
      c.lineWidth = 1;
      c.stroke();
    }
    c.restore();
  };

  paint(0, false);
  paint(px, true);
  return { canvas, px, span };
}

/** Wall light gradients, reused across chunks that share a thickness. */
const wallGradientCache = new WeakMap<CanvasRenderingContext2D, Map<number, CanvasGradient>>();

function wallLightGradient(c: CanvasRenderingContext2D, sideDepth: number): CanvasGradient {
  let byDepth = wallGradientCache.get(c);
  if (!byDepth) {
    byDepth = new Map();
    wallGradientCache.set(c, byDepth);
  }
  // Chunks tumble, so their thickness changes a little every frame. Rounding to
  // whole pixels keeps this a cache hit instead of a gradient per chunk per
  // frame; the ramp is smooth enough that the difference is invisible.
  const rounded = Math.max(2, Math.round(sideDepth));
  const key = rounded;
  const hit = byDepth.get(key);
  if (hit) return hit;
  const g = c.createLinearGradient(0, 0, 0, rounded);
  g.addColorStop(0, 'rgba(255,255,255,0.24)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.08)');
  g.addColorStop(0.56, 'rgba(0,0,0,0.03)');
  g.addColorStop(1, 'rgba(0,0,0,0.18)');
  if (byDepth.size > 48) byDepth.clear();
  byDepth.set(key, g);
  return g;
}

/** Draw the stage-clear wheel chunks as extruded solids, including their textured rear face. */
export function drawExtrudedWheelFragment(
  c: CanvasRenderingContext2D,
  face: CanvasImageSource,
  radius: number,
  pad: number,
  start: number,
  end: number,
  depth: number,
  sideColor: string,
  edgeColor: string,
  pitch: number,
  lightAngle: number,
  /** Pre-baked faces of this wedge; without one the vector path paints them. */
  sprite?: WedgeSprite | null,
) {
  // Pitch the slice away from camera: compress its face and project its depth
  // toward the viewer instead of showing a flat, front-on wedge.
  const faceSquash = Math.max(0.22, Math.abs(Math.cos(pitch)));
  const sideDepth = depth * Math.abs(Math.sin(pitch)) / faceSquash;
  c.save();
  c.scale(1, faceSquash);
  const point = (angle: number, y = 0) => ({
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius + y,
  });
  const sector = (offsetY: number) => {
    c.beginPath();
    c.moveTo(0, offsetY);
    c.lineTo(Math.cos(start) * radius, Math.sin(start) * radius + offsetY);
    c.arc(0, offsetY, radius, start, end);
    c.closePath();
  };
  const drawTexturedSector = (offsetY: number) => {
    c.save();
    sector(offsetY);
    c.clip();
    c.drawImage(face, -radius - pad, -radius - pad + offsetY, (radius + pad) * 2, (radius + pad) * 2);
    c.restore();
  };

  const a = point(start);
  const b = point(end);
  const wallLight = wallLightGradient(c, sideDepth);

  // A small cast shadow separates the rear face from the glowing stage backdrop.
  c.save();
  sector(sideDepth + 4);
  c.fillStyle = 'rgba(0,0,0,0.16)';
  c.fill();
  c.restore();

  // The lower, textured face sits in shadow; the three connecting planes get
  // consistent light on their front bevel and darker shading toward the back.
  // A baked sprite is one blit; the vector path masks and shades it per frame.
  if (sprite) {
    c.drawImage(
      sprite.canvas, sprite.px, 0, sprite.px, sprite.px,
      -sprite.span, -sprite.span + sideDepth, sprite.span * 2, sprite.span * 2,
    );
  } else {
    drawTexturedSector(sideDepth);
    c.save();
    sector(sideDepth);
    c.clip();
    c.fillStyle = 'rgba(0,0,0,0.14)';
    c.fill();
    c.restore();
  }

  const paintWall = () => {
    c.fillStyle = sideColor;
    c.fill();
    c.fillStyle = wallLight;
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.16)';
    c.lineWidth = 1;
    c.stroke();
  };

  // All three connecting planes go into one path: they share the same fill, the
  // same wall-light ramp and the same outline, so painting them together is one
  // fill and one stroke instead of three of each (and the shared edges no longer
  // blend their alpha twice).
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(a.x, a.y);
  c.lineTo(a.x, a.y + sideDepth);
  c.lineTo(0, sideDepth);
  c.closePath();
  c.moveTo(0, 0);
  c.lineTo(b.x, b.y);
  c.lineTo(b.x, b.y + sideDepth);
  c.lineTo(0, sideDepth);
  c.closePath();
  c.moveTo(a.x, a.y);
  c.arc(0, 0, radius, start, end);
  c.lineTo(b.x, b.y + sideDepth);
  c.arc(0, sideDepth, radius, end, start, true);
  c.closePath();
  paintWall();

  // Front face: keep the artwork, but shade it from one fixed upper-left light
  // source so the bevel, surface and shadow all agree on the lighting direction.
  if (sprite) {
    c.drawImage(
      sprite.canvas, 0, 0, sprite.px, sprite.px,
      -sprite.span, -sprite.span, sprite.span * 2, sprite.span * 2,
    );
    c.restore();
    return;
  }
  drawTexturedSector(0);
  const lightX = Math.cos(lightAngle) * radius * 0.82;
  const lightY = Math.sin(lightAngle) * radius * 0.82;
  const frontLight = c.createLinearGradient(lightX, lightY, -lightX, -lightY);
  frontLight.addColorStop(0, 'rgba(255,255,255,0.20)');
  frontLight.addColorStop(0.22, 'rgba(255,255,255,0.07)');
  frontLight.addColorStop(0.58, 'rgba(0,0,0,0.01)');
  frontLight.addColorStop(1, 'rgba(0,0,0,0.14)');
  c.save();
  sector(0);
  c.clip();
  c.fillStyle = frontLight;
  c.fill();
  c.restore();

  // Fine bevel glints instead of a thick, uniformly bright outline.
  sector(0);
  c.strokeStyle = 'rgba(0,0,0,0.30)';
  c.lineWidth = 2;
  c.stroke();
  c.save();
  sector(0);
  c.globalAlpha = 0.22;
  c.strokeStyle = edgeColor;
  c.lineWidth = 0.9;
  c.stroke();
  c.restore();
  c.beginPath();
  c.arc(0, 0, radius - 1.5, start + 0.025, end - 0.025);
  c.strokeStyle = 'rgba(255,255,255,0.46)';
  c.lineWidth = 1;
  c.stroke();
  c.restore();
}

interface Flyer { x: number; y: number; vx: number; vy: number; rot: number; vr: number; kind: ItemType; w?: WeaponId; hue?: number; busterPellet?: boolean; scale?: number }
interface Beam { x: number; y: number; life: number; max: number; rgb: string }
interface Portal { x: number; y: number; life: number; max: number; rgb: string }
interface BossProjectile { x: number; y: number; vx: number; vy: number; rot: number; type: BossAttackFamily; head: BossHead }

interface RockFragment { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; seed: number; life: number; max: number }
/** Coordinates and angle are local to a rock cell (or to the open chest). */
interface EmbeddedShot { x: number; y: number; angle: number; age: number; w: WeaponId; scale: number; big: number; tint?: string; cellId?: number; hue?: number; flash?: number; s7?: SevenShot; xenoHybrid?: boolean; busterPellet?: boolean }
interface FallingCell { id: number; cx: number; cy: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; bullets: EmbeddedShot[] }
interface Star { x: number; y: number; r: number; vx: number; baseY: number; age: number; life: number; max: number }
interface BonusCoin { angle: number; radius: number; lx: number; ly: number; phase: number; taken: boolean }
export type TreasureBuff = 'rapid' | 'double' | 'mini' | 'giant';
export type BuffKind = 'speed' | 'ammo' | 'power' | TreasureBuff;

const STAGE_SECONDS: Record<'boulder' | SpecialMode, number> = { boulder: 65, bonus: 45, treasure: 10 };

/**
 * How far one hit reaches across the Diamond Breaker / bonus rock.
 *
 * Requested: the stone has to give way, "one shot and two chunks fall". The
 * rock's rings sit ~26px apart in its own 196px art space, so a 38px ring takes
 * the struck chunk plus the neighbour above or below it, while the old 43/32
 * rings mostly spent a whole shell on a single chunk (a `-2` damage falloff left
 * every 3hp chunk standing).
 */
const ROCK_SPLASH = 40;

/**
 * What the splash ring deals: the full damage of the shot.
 *
 * The old falloff (`damage - 2`) left every 3hp chunk standing, so a hit was
 * worth one chunk even when four neighbours were inside the ring. The hard 6hp
 * reef still needs the shot itself — it only lands the ring's damage.
 */
const rockSplashDamage = (dmg: number) => Math.max(1, dmg);

/**
 * The treasure chest, as the box the rounds are tested against.
 *
 * The chest is baked at one sprite size, so it shrinks by painting it through
 * `BOARD_PACKAGE_SCALE` — and the hit box has to take the same 10% or rounds
 * would stop in the air beside it. Values are the world-space half width, the
 * height of the open lid and the foot of the chest, measured before the shrink.
 */
const CHEST_HALF_W = Math.round(97 * BOARD_PACKAGE_SCALE); // 87
const CHEST_TOP = Math.round(90 * BOARD_PACKAGE_SCALE); // 81
const CHEST_BOTTOM = Math.round(88 * BOARD_PACKAGE_SCALE); // 79
/** Where the chest sprite sits below the board centre (`translate(0, 15)`). */
const CHEST_LIFT = 15 * BOARD_PACKAGE_SCALE; // 13.5
/** Diamond Breaker: how many shots the core diamond takes before it is won. */
const BOULDER_DIAMOND_HITS = 4;
/** Diamond Breaker's rock spins this much faster than an ordinary wheel. */
const BOULDER_SPIN_MULT = 1.6;

const PATTERNS: Record<PatternName, (t: number, b: number, d: number) => number> = {
  constant: (_t, b, d) => b * d,
  wave: (t, b, d) => b * d * (0.3 + 1.4 * (0.5 + 0.5 * Math.sin(t * 1.5))),
  pendulum: (t, b, d) => b * 1.7 * d * Math.sin(t * 1.0),
  stopgo: (t, b, d) => {
    const p = (t % 2.0) / 2.0;
    const s = p < 0.55 ? 1.6 : p < 0.72 ? 1.6 * (1 - (p - 0.55) / 0.17) : 0.04;
    return b * d * s;
  },
  jerk: (t, b, d) => {
    const k = Math.floor(t / 1.7);
    const dd = k % 2 === 0 ? 1 : -1;
    const p = (t % 1.7) / 1.7;
    return b * d * dd * (0.5 + 1.5 * Math.pow(Math.sin(p * Math.PI), 2));
  },
  chaos: (t, b, d) => b * d * (Math.sin(t * 1.1) * 1.4 + Math.sin(t * 2.7 + 1) * 0.75 + 0.35),
};

const PRAISE = ['MANTAP!', 'KEREN!', 'SEMPURNA!', 'GACOR!', 'JAGO!', 'LUAR BIASA!'];

export interface GameEvents {
  onGameOver: (score: number, level: number, coinsToBank: number, runCoins: number) => void;
  onBossDefeated?: (bossName: string, level: number, coinsEarned: number, bossHead: BossHead) => void;
  /** The treasure counter and saved balance both grow as each flying coin reaches the HUD. */
  onTreasureCoin?: (amount: number) => void;
  /** Bank any remaining special-stage reward at its end, exactly once. */
  onStageReward?: (mode: 'boulder' | SpecialMode, level: number, unbankedCoins: number, diamondReward: number) => void;
  /** Separate shop-diamond currency, awarded by the boulder core and small diamond pickups. */
  onDiamondCollected?: (amount: number, large: boolean, origin: { x: number; y: number }) => void;
  /** Called on successful standard-stage clears for the UI's short sunburst celebration. */
  onStageCleared?: (level: number, boss: boolean, origin: { x: number; y: number }) => void;
  /** Called whenever a new level begins so transient HUD modes can reset. */
  onStageChange?: () => void;
  onStarHit?: (treasure: boolean) => void;
  onShotFired?: (count: number) => void;
}

type State = 'idle' | 'intro' | 'play' | 'clear' | 'fail' | 'over';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private events: GameEvents;
  private scale = 1;
  private dpr = 1;
  private adaptiveDpr = new AdaptiveCanvasDpr();
  private cadence = new FrameCadence();
  /** Milliseconds the previous animation frame spent simulating and drawing. */
  private lastWork = 0;
  private raf = 0;
  private last = 0;
  private active = false;
  private hasRendered = false;
  private motionPreference: MediaQueryList | null = null;
  private gunEntryT = GAMEPLAY_GUN_ENTRY_DURATION;
  private onMotionPreferenceChange = () => {
    if (this.motionPreference?.matches) this.gunEntryT = GAMEPLAY_GUN_ENTRY_DURATION;
  };

  state: State = 'idle';
  level: LevelCfg;
  private rot = 0;
  /** Which way the wheel is turning right now (+1 / -1). */
  private rotDir = 1;
  private levelTime = 0;
  private items: Item[] = [];
  private ghostHand: GhostHand = -1;
  /** One direction per accepted Photon Saber trigger, independent of preview frames. */
  private saberSide: -1 | 1 = -1;
  private ghostVolleySequence = 0;
  private fireworkShots = 0;
  private projs: Proj[] = [];
  private particles: Particle[] = [];
  /** Metaball acid layer (slide-7 Xenomorph Acid Spitter parity). */
  private acidFluid = new AcidFluid();
  private frags: Fragment[] = [];
  /** Wedge boundaries, faces and palette for this stage, prepared before the burst. */
  private wedgePrep: {
    offset: number;
    sprites: (WedgeSprite | null)[];
    ink: ({ side: string; edge: string } | null)[];
    debris: string[] | null;
  } | null = null;
  private flyers: Flyer[] = [];
  private ammoLeft = 0;
  private stuck = 0;
  score = 0;
  coins = 0;
  private combo = 0;
  private comboPop = 0;
  private lastHit = -10;
  private shake = 0;
  private flashWhite = 0;
  private flashRed = 0;
  private timeScale = 1;
  private pace: SgaGameSpeed = 1;
  private bgTheme: SgaBackgroundTheme = 'auto';
  /**
   * Screen orientation. The world is always simulated in portrait coordinates;
   * this only changes how it is presented (see `layout.ts`'s landscape notes)
   * and where the HUD is drawn.
   */
  private orientation: SgaOrientation = getSavedSgaOrientation();
  private bump = 0;
  private hitFlash = 0;
  /** game-3 wheelFlash: tints only the target, never the whole screen. */
  private wheelFlash = 0;
  private wheelFlashRgb = '200,255,128';
  private introT = 0;
  private introDuration = 0.5;
  private synchronizedEntrance = false;
  private wheelEntryDuration = 1.1;
  /** Real seconds the wheel waits before it drops in (the scope cover). */
  private wheelEntryDelayT = 0;
  /** Perfect Shot's target entrance clock — runs for every wheel, however it spawned. */
  private wheelEntryT = 0;
  private wheelBurstT = 0;
  private wheelScale = 1;
  private wheelArtSource: WheelArtSource | null = null;
  /**
   * `?hitbox=1` is the *developer* inspection mode: it paints the collision
   * contour, the old circular ring and every impact marker over the head. It is
   * never part of a boss fight — a player only ever sees the blue edge of the
   * drawing itself (`drawBossSilhouette`), which is the one and only hitbox.
   */
  private readonly hitboxFlag = (() => {
    try {
      return typeof location !== 'undefined' && /(^|[?&])hitbox=1(&|$)/.test(location.search);
    } catch {
      return false;
    }
  })();
  private wheelArtCache = new Map<string, HTMLImageElement>();
  private wheelArtKey = '';
  private wheelImage: HTMLImageElement | null = null;
  /**
   * The radial contour of the boss artwork that is actually on screen. Boss
   * levels show the reference game's own head art (rasterised by `TargetArt`),
   * so the hit test samples THAT bitmap instead of the legacy portrait: a shot
   * sticks where the drawing is, exactly like the reference game's `edgeR()`.
   */
  private bossArtProfile: number[] | null = null;
  /** Alpha mask of the on-screen target art: hits are pixel tests, not circles. */
  private artMask: ArtMask | null = null;
  /** The artwork's exact silhouette, as a path traced from the alpha mask. */
  private maskOutline: Path2D | null = null;
  /**
   * The transform the boss art was actually painted with on the last frame
   * (wheel origin, scale, float/sway/breath, spin). The impact splinters are
   * painted later, straight in screen space, so this is what confines them to
   * the drawing instead of letting them drift into the empty sky.
   */
  private bossArtScreen: DOMMatrix | null = null;
  /** The current boss/wheel SVG markup, handed over by the React bridge. */
  private wheelSvg: string | null = null;
  /** That markup traced into paths: the collision shape without any pixel read. */
  private artMaskMaxR = 1;
  private gunEntryDelayT = 0;
  private gunEntryRate = 1;
  /**
   * While the menu's own captured frame is still flying to the gun slot, the
   * canvas must not paint a second weapon underneath it. This clock hides the
   * live gun for exactly as long as that flight lasts.
   */
  private gunHiddenT = 0;
  private stateT = 0;
  private recoil = 0;
  private muzzle = 0;
  private cooldown = 0;
  private face!: HTMLCanvasElement;
  private faceCtx!: CanvasRenderingContext2D;
  private faceScale = 2;
  private time = 0;
  private bannerT = 0;
  private dust: { x: number; y: number; s: number; v: number; a: number }[] = [];
  private failProjAngle = 0;
  weapon: Weapon = WEAPONS[0];
  private holding = false;
  private beams: Beam[] = [];
  private slowT = 0;
  private slowF = 0.3;
  private slowRgb = '170,230,255';
  private slowKind: 'ice' | 'water' | 'honey' | 'time' = 'ice';
  private aiming = false;
  private aimT = 0;
  private spin = 0;
  private savesLeft = 0;
  private perkCount = 0;
  private burnT = 0;
  private burnTick = 0;
  private spikeOffT = 0;
  private targetR = 0;
  /** The silhouette as a filled path, for the collision overlay. */
  private maskSurface: Path2D | null = null;
  /** Filled region a round can hit (the silhouette, windows included). */
  private maskSolidRegion: Path2D | null = null;
  /** The blue line itself: the exact boundary of that region. */
  private maskSolidEdge: Path2D | null = null;
  /**
   * Recent boss hits, as art-local angles. Each one lights a short piece of the
   * blue outline for a quarter of a second, so the player sees that the round
   * bit *the line* — the same bytes the hit test reads, not an invisible ring.
   */
  private bossEdgePing: { a: number; born: number }[] = [];
  /** Radius the face bitmap was baked at (`buildFace`), for pad scaling. */
  private faceBaseR = 0;
  private faceR = 106;
  private portals: Portal[] = [];
  private glitchT = 0;
  private rockFragments: RockFragment[] = [];
  /** World surface the canvas was last built for (`'420x760'` style key). */
  private cssSurface = '';
  /** Has `resize()` ever built a surface? The very first call always must. */
  private hasSized = false;
  /** Pieces already turned into the landscape screen's gravity frame (see `turnDebris`). */
  private readonly turnedDebris = new WeakSet<object>();
  private rockBullets: EmbeddedShot[] = [];
  private fallenCells: FallingCell[] = [];
  private chestBullets: EmbeddedShot[] = [];
  private treasureCoins: TreasureCoin[] = [];
  private stageRewardPaid = false;
  private lastCoinSound = -10;
  private coinPulse = 0;
  private rock: DiamondRock | null = null;
  private bonusCoins: BonusCoin[] = [];
  private chest: TreasureChest | null = null;
  private stageTime = 0;
  private reloadT = 0;
  private hudHidden = false;
  /** COMBO TITIK (SETTING): same-spot scoring ladder 10 · 20 · 30 … */
  private spotComboOn = getSavedSpotCombo();
  private spotHits = 0;
  private spotAngle = 0;
  private snowLoaded = SNOWBALL_MAG_SIZE;
  private stageStartCoins = 0;
  private bankedCoins = 0;
  private diamondPing = 0;
  private centerDiamondCollected = false;
  private centerDiamondHits = 0;
  private diamondHoldUntil = 0;
  private choosingBuff = false;
  private buff: 'speed' | 'ammo' | 'power' | 'double' | null = null;
  private treasureBuff: TreasureBuff | null = null;
  private twinGuns = false;
  private stageClearBurstT = 0;
  private stageClearBurstMax = 0.9;
  private stageClearBurstBoss = false;
  private star: Star | null = null;
  private starTimer = 6;
  private speedMult = 1;
  /** Player-tuned projectile speed (1x–3x), applied to every weapon's rounds. */
  private bulletMult: number = getSavedBulletSpeed();

  /**
   * Player-posed gun in landscape: how far it slides along the screen's
   * vertical axis (world +x is screen-down there) and how far it tilts towards
   * the pointer. Portrait never touches them, so it keeps the still gun.
   */
  private gunSlide = 0;
  private gunTilt = 0;
  private gunSlideUp = false;
  private gunSlideDown = false;
  /** Last pointer position in *display* pixels (landscape aim). */
  private aimPointer: { x: number; y: number } | null = null;
  /**
   * Rounds already turned to the barrel. A shot is aimed once, when it leaves
   * the muzzle, so `W`/`S` and a moving pointer can never bend a round in
   * flight or re-aim the same bullet every frame.
   */
  private aimedProjs = new WeakSet<object>();

  /** Guarded slide: harnesses build the game with `Object.create(prototype)`. */
  private get gunLift(): number {
    const slide = this.gunSlide;
    return Number.isFinite(slide) ? slide : 0;
  }

  private get gunTiltNow(): number {
    const tilt = this.gunTilt;
    return Number.isFinite(tilt) ? tilt : 0;
  }

  /** Where the gun really stands: its muzzle, effects and rounds follow it. */
  private get gunX(): number {
    return CX + this.gunLift;
  }

  /**
   * Guarded read of {@link bulletMult}: a few harnesses build the game with
   * `Object.create(Game.prototype)`, where class fields are never initialised,
   * and a NaN multiplier would stop the round dead in the air.
   */
  private get bulletK(): number {
    const k = this.bulletMult;
    return Number.isFinite(k) && k > 0 ? k : 1;
  }
  private dmgMult = 1;
  private maxAmmoMult = 1;
  private bossProjs: BossProjectile[] = [];
  private bossMuzzleFlashes: BossMuzzleFlash[] = [];
  private bossShootTimer = 1.6;
  private bossHp = 100;
  private bossMaxHp = 100;
  private bossHpRed = 100; // Tekken-style ghost damage gauge
  /** Game B's boss reactions: idle → laugh / angry, and the low-HP rage. */
  private bossMood: 'idle' | 'laugh' | 'angry' = 'idle';
  private bossMoodLeft = 0;
  private bossMoodAge = 0;
  private bossTauntT = 0;
  private bossRage = false;
  private bossHa: { age: number; i: number }[] = [];
  private lights: Light[] = [];
  private rt = 0;
  private lastShotRT = -9;
  private charging = false;
  private chargeT = 0;
  private chargeLevel = 0;
  private chargeStage = 0;
  private lastPaint = '';
  private stretchPlayed = true;
  /** Slide-2 FX layer + per-shot hue for the ported slide-2 weapons. */
  private s2State?: Slide2Fx;
  private get s2(): Slide2Fx {
    return (this.s2State ??= new Slide2Fx());
  }
  private s2Hue = 265;
  private s2Ambient = 1.4;

  /**
   * Slide 2 `voidBurst()` at a hit point: accretion inflow, delayed collapse
   * flash, bipolar jets and tangential ejecta, plus slide 2's own hit voice.
   */
  private slide2Impact(x: number, y: number, scale = 0.8) {
    if (!this.slide2Void) return;
    voidBurst2(
      this.s2,
      x,
      y,
      this.s2Hue,
      scale,
      (amount) => { this.shake = Math.max(this.shake, amount); },
      () => slide2Sfx.voidBoom(scale),
    );
    slide2Sfx.hitBH(Math.max(0, this.perkCount));
    this.sink.light(x, y, 170, '180,120,255', 0.22);
  }

  /**
   * True when the black-hole gun must run the slide-2 void shot. The slide-2
   * cannon keeps its own shot whenever its design is the selected one; the
   * slide-7 SET 1 staff (new default) uses the SET 1 shot below.
   */
  private get slide2Void(): boolean {
    return this.weapon.id === 'blackhole' && getGunEffect('blackhole') === 'new'
      && getGunVariant('blackhole') !== 'set1';
  }

  /**
   * Slide 2 (`games/fireworkgun`) FX layer for the eight exported weapons. Its
   * own muzzle recipe, round art, trail and wheel impact all live here; slide 1
   * only decides where the round is and what it hits.
   */
  private s2wState?: SetTwoFx;
  private get s2w(): SetTwoFx {
    const fx = (this.s2wState ??= new SetTwoFx());
    fx.host = {
      shake: (amount) => { this.shake = Math.max(this.shake, amount); },
      emit: () => { /* slide 2's UI callback: slide 1 refreshes on its own */ },
    };
    return fx;
  }

  /** The slide-2 gun behind the equipped slide-1 weapon, if it has one. */
  private get setTwoId(): TwoWeapon | null {
    // Bare test harnesses drive the stage lifecycle before a weapon is set.
    return this.weapon ? setTwoIdFor(this.weapon.id) : null;
  }

  /** How many rounds of this gun have left the barrel this stage. */
  private s2ShotIdx = 0;

  /** The colour slide 2 would load into the next round of this gun. */
  private s2HueFor(id: TwoWeapon): number {
    return twoAmmoHue(id, this.s2ShotIdx, 28);
  }

  /** True when the equipped gun must fire slide 2's own shot. */
  private get setTwoLive(): boolean {
    return this.setTwoId !== null && getGunEffect(this.weapon.id) === 'set2';
  }

  /**
   * True when the scene should wear slide 2's own look: its night sky, skyline,
   * stars, per-weapon atmosphere, wheel glow and its hand-drawn stuck rounds.
   * That is the same guns that fire slide 2's shot — plus BLACK HOLE while its
   * slide-2 cannon fires slide 2's collapsing singularity (with slide 3's staff
   * the same card is slide 3's own shot, on slide 1's own stage).
   */
  private get setTwoLook(): boolean {
    const weapon = this.weapon;
    if (!weapon || this.setTwoId === null) return false;
    const effect = getGunEffect(weapon.id);
    return effect === 'set2' || (weapon.id === 'blackhole' && this.slide2Void);
  }

  /** Plays slide 2's own clear/fail voice; false when it has none to play. */
  private setTwoVoice(kind: 'clear' | 'fail'): boolean {
    const id = this.setTwoId;
    if (!id || !this.setTwoLook) return false;
    (kind === 'clear' ? SET_TWO_CLEAR : SET_TWO_FAIL)[id]?.();
    return true;
  }

  /** Slide-7 SET 1 FX layer: its own particles, FX objects and after() timers. */
  private s1State?: SetOneFx;
  private get s1(): SetOneFx {
    return (this.s1State ??= new SetOneFx());
  }
  /** Last SET 1 shot, so special targets can replay the right impact burst. */
  private s1Last?: SetOneShot;

  /** The slide-7 SET 1 weapon behind the equipped slide-1 gun, if any. */
  private get setOneId(): SetOneId | null {
    return setOneIdFor(this.weapon.id);
  }

  /**
   * True when the equipped gun must fire slide 1's own port of the SET 1 shot.
   * Never any more: slide 3's own engine fires SET 1 exactly like SET 2..7
   * (`setSevenLive`), with slide 3's own speed, trigger interval and impact.
   */
  private get setOneLive(): boolean {
    return false;
  }

  /** The slide-7 side effects that only the game itself can perform. */
  private s1Hooks(): SetOneHooks {
    return {
      shake: (amount) => { this.shake = Math.max(this.shake, amount); },
      hitStop: () => { /* impact feedback stays visual; don't stall gameplay */ },
      flash: (rgb, strength) => {
        this.tintRgb = rgb;
        this.tintA = Math.max(this.tintA, strength);
      },
      paintWheel: (draw) => {
        this.faceCtx.save();
        draw(this.faceCtx);
        this.faceCtx.restore();
      },
      addWheelFx: (fx) => { this.s1.addWheel(fx); },
      wheel: () => this.wheelHook(),
    };
  }

  /**
   * Slide-7 SET 2..5 FX layer: slide 7's own particles, FX objects, animation
   * springs and the real slide-7 shots (`projectiles2..5.ts`).
   */
  private s7State?: SetSevenFx;
  private s7Weapon?: SlideThreeId;
  private get s7(): SetSevenFx {
    const fx = (this.s7State ??= new SetSevenFx());
    fx.setHooks(this.s7Hooks());
    fx.gunX = CX;
    fx.gunY = GUN_Y;
    return fx;
  }

  /** Last slide-7 shot, for special targets (stones/diamonds/gold). */
  private s7Last?: SevenShot;

  /**
   * Drop slide 7's own layer: its stuck rounds, particles, FX and timers all
   * belong to the level (and to the gun) that produced them, exactly like slide
   * 7 clears them on a new level or when the wheel shatters.
   */
  private resetSevenLayer() {
    this.s7State?.clear();
    this.s7Weapon = undefined;
    this.s7Last = undefined;
    this.s9State?.clear();
    this.nineShake = 0;
    this.nineFlashA = 0;
    this.nineStop = 0;
    this.nineQueued = false;
    this.elevenPending = 0;
    this.s11State?.clear();
    this.s6State?.clear();
    this.s2wState?.clear();
    this.s2ShotIdx = 0;
  }

  /**
   * Slide-6 (`games/game-2`) layer: its own beams, muzzle bursts, chip/spark
   * particles and the scorch marks it leaves on the wheel.
   */
  private s6State?: SetSixFx;

  private get s6(): SetSixFx {
    const fx = (this.s6State ??= new SetSixFx());
    fx.setHooks(this.sixHooks());
    fx.W = W;
    fx.H = H;
    return fx;
  }

  /** The slide-6 weapon behind the equipped slide-1 gun, if any. */
  private get setSixId(): SixId | null {
    return setSixIdFor(this.weapon.id);
  }

  /** True when the equipped gun must fire slide 6's own beam. */
  private get setSixLive(): boolean {
    return this.setSixId !== null && getGunEffect(this.weapon.id) === 'set6';
  }

  /** The slide-6 side effects that need the slide-1 game to act. */
  private sixHooks(): SixHooks {
    return {
      shake: (amount) => { this.shake = Math.max(this.shake, amount * 0.55); },
      wheel: () => this.wheelHookRot(),
    };
  }

  /**
   * Slide-9 (`games/game-6`) layer: its own particles, rounds, beams, entry
   * holes, timers and synthesizer.
   */
  private s9State?: SetNineFx;

  private get s9(): SetNineFx {
    const fx = (this.s9State ??= new SetNineFx());
    fx.setHooks(this.nineHooks());
    fx.W = W;
    fx.H = H;
    fx.floorY = H;
    return fx;
  }

  /** The slide-9 weapon behind the equipped slide-1 gun, if any. */
  private get setNineId(): NineId | null {
    // DEADBLAST's combined shot rides slide 9's repulsor round (effect #5).
    if (this.weapon.id === 'ironman_hand') return setNineIdFor('gauntlet_cannon');
    return setNineIdFor(this.weapon.id);
  }

  /** True when the equipped gun must fire slide 9's own shot. */
  private get setNineLive(): boolean {
    if (this.weapon.id === 'ironman_hand') return getGunEffect(this.weapon.id) === 'ironman_combo';
    return this.setNineId !== null && getGunEffect(this.weapon.id) === 'set9';
  }

  /** The slide-9 side effects that need the slide-1 game to act. */
  private nineHooks(): NineHooks {
    return {
      // Slide 9's own jolt (engine.ts `shake`): its shakes add up to 34 and
      // the scene moves ±0.35 of that, fading ×0.001 per second.
      shake: (amount) => { this.nineShake = Math.min(34, this.nineShake + amount); },
      // Slide 9's flash lights the whole screen (additively, at 0.6 of its
      // strength) and fades at 2.2/s: the newest colour, the strongest flash.
      flash: (color, strength) => {
        this.nineFlashRgb = hexToRgbTriplet(color);
        this.nineFlashA = Math.max(this.nineFlashA, strength);
      },
      // Keep the slide's flashes and shake, without a whole-world impact stall.
      hitStop: () => {},
      wheel: () => this.wheelHookRot(),
    };
  }

  /**
   * Slide-11 (`games/game-8`) layer: its own particles, rounds, entry holes,
   * wheel marks and sound engine. Slide 11 is the newest layer, so it sits on
   * top of slide 9 for the guns both of them update.
   */
  private s11State?: SetElevenFx;

  private get s11(): SetElevenFx {
    const fx = (this.s11State ??= new SetElevenFx());
    fx.setHooks(this.elevenHooks());
    return fx;
  }

  /** The slide-11 weapon behind the equipped slide-1 gun, if any. */
  private get setElevenId(): ElevenId | null {
    return setElevenIdFor(this.weapon.id);
  }

  /** True when the equipped gun must fire slide 11's own shot. */
  private get setElevenLive(): boolean {
    return this.setElevenId !== null && getGunEffect(this.weapon.id) === 'set11';
  }

  /** True while slide 11's layer is out (its gun, or its FX still finishing). */
  private get elevenActive(): boolean {
    return !!this.s11State && (this.setElevenLive || this.s11State.busy);
  }

  /** Slide 11's own wheel state (freeze, spin boost) while its layer is out. */
  private elevenWheel(): { freeze: number; boost: number } | null {
    const raw = this.elevenActive ? this.s11State?.raw : null;
    return raw ? { freeze: raw.wheel.freeze, boost: raw.wheel.boost } : null;
  }

  /**
   * Slide 11's kick, squash and shiver for slide 1's wheel this frame. The
   * rock, the chest and the bonus ring are not slide 11's wheel: they stay put.
   */
  private elevenMotion(): ElevenWheelMotion | null {
    if (!this.elevenActive || isSpecial(this.level.mode)) return null;
    const m = this.s11State!.wheelMotion();
    return m.dx || m.dy || m.sx !== 1 || m.sy !== 1 ? m : null;
  }

  /**
   * The slide-11 gun brings its own charge-up — the Mega Buster's whine and
   * glow, the shoulder caster's three-dot lock — so slide 1's generic charge
   * rings, sparks and voices must not play over it.
   */
  private get elevenOwnsCharge(): boolean {
    const id = this.setElevenId;
    if (!id || !this.setElevenLive) return false;
    const w = elevenWeapon(id);
    return !!(w.onRelease || w.channel);
  }

  /**
   * A plain slide-11 gun (no charged release, no channel) fires the moment
   * the trigger goes down, as on slide 11 — the sniper rifle and the bow too.
   * Slide 1's own scope (black vignette, red crosshair, slow-mo, fire on
   * release) and its draw-to-charge never existed for them on slide 11.
   */
  private get elevenPlainTrigger(): boolean {
    const id = this.setElevenId;
    if (!id || !this.setElevenLive) return false;
    const w = elevenWeapon(id);
    return !(w.onRelease || w.channel);
  }

  /**
   * The Slide 7 shoulder caster has no trigger of its own: held, its three-dot
   * lock closes on slide 7's 2.6 s clock and the burst leaves by itself, again
   * and again while it is held; let go early, nothing fires.
   */
  private get elevenCasterTrigger(): boolean {
    return this.setElevenLive && this.setElevenId === 'plasmacaster-mk2';
  }

  /** The Slide 7 Mega Buster: its blast grows on slide 7's own charge clock. */
  private get elevenBuster(): boolean {
    return this.setElevenLive && this.setElevenId === 'mega-buster';
  }

  /** True while slide 9's layer is out (its gun, or its FX still finishing). */
  private get nineActive(): boolean {
    return !!this.s9State && (this.setNineLive || this.s9State.busy);
  }

  /**
   * Every slide-9 gun but the bow fires the moment the trigger goes down, as
   * on slide 9: the sniper rifle without slide 1's scope and slow-mo, the
   * plasmacaster without slide 1's charge. Only the "Slide 5" card does this;
   * the other cards keep slide 1's own trigger.
   */
  private get ninePlainTrigger(): boolean {
    const id = this.setNineId;
    if (!id || !this.setNineLive) return false;
    return !nineWeapon(id).charged;
  }

  /** The slide-9 bow draws its own string: slide 1's charge rings stay quiet. */
  private get nineOwnsCharge(): boolean {
    const id = this.setNineId;
    return !!id && this.setNineLive && !!nineWeapon(id).charged;
  }

  private get plainTrigger(): boolean {
    return this.elevenPlainTrigger || this.ninePlainTrigger;
  }

  private get layerOwnsCharge(): boolean {
    return this.elevenOwnsCharge || this.nineOwnsCharge;
  }

  /** Slide 9's wheel recoil this frame (the rock and the chest stay put). */
  private nineKick(): { x: number; y: number } {
    if (!this.nineActive || isSpecial(this.level.mode)) return { x: 0, y: 0 };
    return this.s9State!.kick;
  }

  private elevenHooks(): ElevenHooks {
    return {
      // Slide 11's shake is in its own pixels around a wheel the size of slide
      // 1's, so it carries over one to one (slide 11's own jolt per hit).
      shake: (amount) => { this.shake = Math.max(this.shake, amount); },
      flash: (color, strength) => {
        this.tintRgb = hexToRgbTriplet(color);
        this.tintA = Math.max(this.tintA, Math.min(0.36, strength * 0.45));
      },
      // AK-47 and other Slide 5 hits stay responsive, while their own flash and jolt remain.
      hitStop: () => {},
      busterPlasmaImpact: (x, y) => {
        // Use Plasma Gun's actual burst recipe in yellow. This is visual only:
        // slide 11 still owns the Mega Buster's speed, scoring and collision.
        const fx = this.s7;
        fx.special = isSpecial(this.level.mode);
        fx.syncWheel();
        const local = norm(Math.atan2(y - this.targetY, x - CX) - this.rot);
        fx.flashScreen(YELLOW_PLASMA_IMPACT.screenFlash, 0.18);
        spawnPlasmaImpact(fx.g, local, x, y, YELLOW_PLASMA_IMPACT);
      },
      wheel: () => this.wheelHookRot({ dir: this.rotDir, marks: !isSpecial(this.level.mode) }),
    };
  }

  /**
   * The zip's "Skin 3" card is the design in use, so the page draws this gun as
   * the zip's live animated SVG. Every other card is ordinary canvas art.
   */
  private get zipCardLive(): boolean {
    return hasZipArt(this.weapon.id) && getGunVariant(this.weapon.id) === 'zip';
  }

  /** The slide-3 weapon (SET 1..7) behind the equipped slide-1 gun, if any. */
  private get setSevenId(): SlideThreeId | null {
    return slideThreeIdFor(this.weapon.id);
  }

  /**
   * True when the equipped gun fires slide 3's own shot: the "Slide 3" card.
   * SET 1 keeps the `new` card id its saved choices use (BLACK HOLE only
   * while slide 3's staff is its design — its slide-2 cannon fires slide 2's
   * void on that card); SET 2..7 use `set7`.
   */
  private get setSevenLive(): boolean {
    const id = this.weapon.id;
    if (this.setSevenId === null) return false;
    if (setOneIdFor(id)) return getGunEffect(id) === 'new' && !this.slide2Void;
    return getGunEffect(id) === 'set7';
  }

  /**
   * Slide 3 fires on the press itself — its `pointerdown` calls `fire()` —
   * once per press: no auto-fire while held, no spin-up, no scope, no held
   * charge (its charged guns charge inside their own recipe), and a press
   * while the gun is still cooling is simply ignored.
   */
  private get sevenPlainTrigger(): boolean {
    return this.setSevenLive;
  }

  /** Slide 3's layer when its wheel is on screen (not the rock or the chest). */
  private get sevenWheel(): SetSevenFx | null {
    const fx = this.s7State;
    if (!fx || isSpecial(this.level.mode) || !(fx.busy || this.setSevenLive)) return null;
    return fx;
  }

  /** Slide 3's own hit-stop is running: its world moves at 22 %. */
  private get sevenStopped(): boolean {
    return !!this.s7State && this.s7State.feel.stop > 0;
  }

  /** The slide-7 side effects that need the slide-1 game to act. */
  private s7Hooks(): SevenHooks {
    return {
      // Slide 3's shake: max(amount), e^-9t, ±amount a frame — slide 1's model.
      shake: (amount) => { this.shake = Math.max(this.shake, amount); },
      paintWheel: (draw, R) => {
        const c = this.faceCtx;
        c.save();
        c.beginPath();
        c.arc(0, 0, Math.max(1, R - 0.6), 0, TAU);
        c.clip();
        draw(c);
        c.restore();
      },
      wheel: () => this.wheelHookRot(),
    };
  }

  private fwState?: Firework8State;

  private getFwState(): Firework8State {
    if (!this.fwState) {
      this.fwState = createFirework8State(W, H);
    }
    return this.fwState;
  }
  private yoyoState?: YoyoSlideState;

  private getYoyoState(): YoyoSlideState {
    if (!this.yoyoState) {
      this.yoyoState = createYoyoSlideState(W, H);
    }
    return this.yoyoState;
  }
  private kerisState?: KerisSlideState;

  private getKerisState(): KerisSlideState {
    if (!this.kerisState) {
      this.kerisState = createKerisSlideState(W, H);
    }
    return this.kerisState;
  }
  private diamondState?: DiamondSlideState;

  private getDiamondState(): DiamondSlideState {
    if (!this.diamondState) {
      this.diamondState = createDiamondSlideState(W, H);
    }
    return this.diamondState;
  }
  private bazookaState?: BazookaSlideFx;

  private getBazookaState(): BazookaSlideFx {
    if (!this.bazookaState) {
      this.bazookaState = new BazookaSlideFx();
    }
    return this.bazookaState;
  }
  private hitStop = 0;
  /**
   * Slide 11's own hit-stop. Slide 11 slows its whole world to 12 % for it
   * (`update()`: `dt *= 0.12`), not to slide 1's 6 %: the wheel keeps
   * creeping on through the freeze the way it does on slide 11.
   */
  private elevenStop = 0;
  /** Slide 9's hit-stop: its world runs at 12 % meanwhile (engine.ts `update`). */
  private nineStop = 0;
  /** Slide 9's shake amount (0..34); the screen moves ±0.35 of it. */
  private nineShake = 0;
  /** Slide 9's full-screen flash: strength and colour. */
  private nineFlashA = 0;
  private nineFlashRgb = '255,255,255';
  /** Slide 9 remembers a click made up to 0.22 s before the gun is ready. */
  private nineQueued = false;
  /**
   * Slide 7's tap buffer (`pending` in its `press()`): every press keeps asking
   * for a shot for 0.22 s, so a tap that lands just before the gun is ready
   * still fires the moment it is.
   */
  private elevenPending = 0;
  /** How far the slide-9 bow was drawn when it was let go (0..1). */
  private nineDraw = 0;
  private camY = 0;
  private tintA = 0;
  private tintRgb = '255,255,255';
  private maxParticles = isMobilePerfProfile() ? 240 : 480;
  private vignetteBackdrop: HTMLCanvasElement | null = null;
  private vignetteBackdropDpr = 0;
  private vignetteGrad: CanvasGradient | null = null;
  private sink: FxSink = {
    push: (p: Particle) => {
      if (this.particles.length < this.maxParticles || p.kind === 'text') this.particles.push(p);
    },
    light: (x, y, r, rgb, life) => {
      if (this.lights.length < 18) this.lights.push({ x, y, r, rgb, life, max: life });
    },
  };

  setWeapon(id: WeaponId) {
    const changed = this.weapon?.id !== id;
    this.weapon = getWeapon(id);
    // Rounds stuck in the wheel belong to the gun that fired them.
    if (changed) {
      this.resetSevenLayer();
      if (id === 'photon_saber') this.saberSide = -1;
    }
    this.aiming = false;
    this.spin = 0;
    // A newly equipped cannon starts with no more balls than the level's
    // remaining ammo; changing guns never grants additional stage shots.
    if (id === 'snowball') this.snowLoaded = this.state === 'idle'
      ? SNOWBALL_MAG_SIZE : Math.min(SNOWBALL_MAG_SIZE, this.ammoLeft);
  }

  private get targetY() {
    const special = isSpecial(this.level.mode);
    const baseY = initialGameplayWheelCenterY(this.level.boss, special);
    if (this.level.boss && !special) {
      return Math.max(60 + this.level.radius, baseY - bossRiseOffset(this.levelTime));
    }
    return baseY;
  }

  /**
   * Steady stage Y used for cached full-screen background canvases so `bossRiseOffset`
   * never invalidates and reallocates 840x1520 Retina canvases 60 times per second.
   */
  private get steadyTargetY() {
    return initialGameplayWheelCenterY(this.level.boss, isSpecial(this.level.mode));
  }
  private get hasTwinGuns() { return this.level.mode === 'double' || this.twinGuns; }
  private get gunOffsets(): readonly number[] { return this.hasTwinGuns ? TWIN_BARRELS : SINGLE_BARREL; }

  /** Centre of the target's lower edge, accounting for the imported ghost's tip. */
  private ghostAimY(tip = 0): number {
    const radius = this.level.mode === 'treasure' ? Math.round(88 * BOARD_PACKAGE_SCALE)
      : this.bossRadiusAt(norm(Math.PI / 2 - this.rot));
    return this.targetY + radius + (isSpecial(this.level.mode) ? 0 : tip);
  }

  private ghostAimVx(x: number, y: number, vy: number, tip = 0): number {
    return (CX - x) * Math.max(0, -vy) / Math.max(1, y - this.ghostAimY(tip));
  }

  constructor(canvas: HTMLCanvasElement, events: GameEvents) {
    this.canvas = canvas;
    this.ctx = getFast2DContext(canvas, { opaque: true, desynchronized: true }) ?? canvas.getContext('2d')!;
    this.events = events;
    try {
      this.motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
      this.motionPreference?.addEventListener?.('change', this.onMotionPreferenceChange);
    } catch { this.motionPreference = null; }
    this.level = makeLevel(1);
    this.events.onStageChange?.();
    this.level.style = 'orange';
    this.buildFace();
    this.placeObstacles();
    for (let i = 0; i < 45; i++) {
      this.dust.push({ x: Math.random() * W, y: Math.random() * H, s: rand(0.6, 2.2), v: rand(6, 22), a: rand(0.1, 0.5) });
    }
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointer);
    canvas.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onRelease);
    window.addEventListener('pointercancel', this.onRelease);
    window.addEventListener('blur', this.onRelease);
    // Paint a still frame for inactive slides; start the simulation only on focus.
    this.render();
    this.hasRendered = true;

  }

  setGameSpeed(speed: number) {
    this.pace = normalizeSgaSpeed(speed, 1);
  }

  /** How far the landscape gun is slid along the screen (display px, + = down). */
  getGunSlide(): number {
    return this.gunLift;
  }

  /** Current tilt of the landscape gun in radians (0 = pointing at the wheel). */
  getGunTilt(): number {
    return this.gunTiltNow;
  }

  /** Multiplies the flight speed of every projectile the player fires. */
  setBulletSpeed(speed: number) {
    this.bulletMult = normalizeBulletSpeed(speed, 1);
  }

  getBulletSpeed(): number {
    return this.bulletK;
  }

  getGameSpeed(): SgaGameSpeed {
    return this.pace;
  }

  getWheelStyle(): Style {
    return this.level.style;
  }

  setBackgroundTheme(theme: SgaBackgroundTheme) {
    this.bgTheme = normalizeSgaBgTheme(theme);
    if (!this.active && this.hasRendered) {
      this.render();
    }
  }

  getBackgroundTheme(): SgaBackgroundTheme {
    return this.bgTheme;
  }

  setOrientation(next: SgaOrientation) {
    const normalized = normalizeSgaOrientation(next, this.orientation);
    if (normalized === this.orientation) return;
    this.orientation = normalized;
    // The backing store changes shape, so anything pre-baked at the old pixel
    // size has to go or it will be stretched over the new canvas.
    this.vignetteBackdrop = null;
    this.vignetteBackdropDpr = 0;
    this.specialOverlayCanvas = null;
    this.specialOverlayKey = '';
    this.cssSurface = '';
    this.resize();
  }

  getOrientation(): SgaOrientation {
    return this.orientation;
  }

  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    if (active) {
      // Discard elapsed time while unfocused; never fast-forward a level or timer.
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.adaptiveDpr.pause();
      // A held mouse/key must not resume firing when this slide is selected again.
      this.holding = false;
      this.aiming = false;
      this.charging = false;
      // Slide 11's beam hum / charge whine are loops: with the frame loop
      // stopped nothing would ever fade them out.
      this.s11State?.silence();
    }
  }

  destroy() {
    this.setActive(false);
    this.motionPreference?.removeEventListener?.('change', this.onMotionPreferenceChange);
    this.s11State?.dispose();
    this.s11State = undefined;
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.onPointer);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onRelease);
    window.removeEventListener('pointercancel', this.onRelease);
    window.removeEventListener('blur', this.onRelease);
  }

  private onRelease = () => {
    this.holding = false;
    this.releaseScope();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'KeyW') this.gunSlideUp = false;
    else if (e.code === 'KeyS') this.gunSlideDown = false;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      this.holding = false;
      this.releaseScope();
    }
  };

  private press() {
    if (this.choosingBuff) return;
    // Once input is accepted, keep the visible muzzle at the real projectile
    // origin even if the last few pixels of the entrance are still settling.
    if (this.state === 'play') {
      this.gunEntryDelayT = 0;
      this.gunEntryT = GAMEPLAY_GUN_ENTRY_DURATION;
    }
    this.holding = true;
    const plain = this.plainTrigger;
    // Slide 3 fires on the press (see `sevenPlainTrigger`).
    if (this.sevenPlainTrigger) {
      this.shoot();
      return;
    }
    // Slide 7's shoulder caster only starts locking on (`elevenCasterTrigger`).
    if (this.elevenCasterTrigger) {
      if (this.state === 'play') this.s11.press();
      return;
    }
    if (this.weapon.scope && !plain) {
      if (this.state === 'play' && this.cooldown <= 0 && this.ammoLeft > 0 && !this.aiming) {
        this.aiming = true;
        this.aimT = 0;
        sfx2.scope();
      }
      return;
    }
    if (this.weapon.spinup) {
      if (this.state === 'play' && this.spin < 0.1) sfx2.spinUp();
      return;
    }
    if (this.weapon.charge && !plain) {
      if (this.state === 'play' && this.cooldown <= 0 && this.ammoLeft > 0 && !this.charging) {
        this.charging = true;
        this.chargeT = 0;
        this.chargeStage = 0;
      }
      return;
    }
    // Slide 9 remembers a click made just before the gun is ready.
    if (this.ninePlainTrigger && this.state === 'play' && this.cooldown > 0 && this.cooldown <= 0.22) this.nineQueued = true;
    // Slide 7 fires its plain guns inside its frame, not in the input handler
    // (its `press()` only sets `pending`): the shot leaves on the next update,
    // after the frame has settled, and the press keeps asking for 0.22 s.
    if (this.elevenPlainTrigger) {
      if (this.state === 'play') this.elevenPending = 0.22;
      return;
    }
    this.shoot();
  }

  private releaseScope() {
    if (this.charging) {
      this.charging = false;
      // Slide 7's buster reaches its mid and full blast at 0.45 s and 1.2 s.
      const [lvMid, lvFull] = this.elevenBuster ? [0.45, 1.2] : [0.35, 1];
      this.chargeLevel = this.chargeT >= lvFull ? 2 : this.chargeT >= lvMid ? 1 : 0;
      // Slide 9's bow is fully drawn after 1/3.4 s.
      this.nineDraw = Math.min(1, this.chargeT * 3.4);
      this.chargeT = 0;
      this.shoot();
      this.chargeLevel = 0;
      this.nineDraw = 0;
      return;
    }
    if (!this.aiming) return;
    this.aiming = false;
    this.shoot();
  }

  /** Change only raster density; world coordinates, input and effects stay intact. */
  private applyCanvasDpr(dpr: number) {
    this.dpr = dpr;
    const { w, h } = displaySize(this.orientation);
    const width = Math.round(w * dpr), height = Math.round(h * dpr);
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
  }

  private resize = () => {
    this.scale = 1;
    // The canvas is a fixed world-sized surface (portrait 420x760, landscape
    // 760x420) that CSS scales to the screen, so a mobile browser's resize storm
    // — the address bar collapsing while the player scrolls, the keyboard
    // opening, a rotation the presentation already handled — usually asks for
    // exactly the surface we already have. Rebuilding it anyway meant a fresh
    // backing store (which starts out *empty*), a fresh fluid field and a reset
    // resolution governor, many times a minute: that is the blank flash plus the
    // hitch. Bail out before touching anything when the surface cannot change.
    const { w, h } = displaySize(this.orientation);
    const surface = `${w}x${h}`;
    if (surface === this.cssSurface && this.hasSized) return;
    this.cssSurface = surface;
    this.hasSized = true;
    // Start at the usual sharp mobile DPR; sustained slow frames may reduce it
    // gradually, and sustained smooth play restores it. No effects are removed.
    const baseDpr = getOptimalCanvasDpr(2);
    this.adaptiveDpr.reset(baseDpr, isMobilePerfProfile());
    // Re-measure the cadence against the new backing store.
    this.cadence.reset();
    this.lastWork = 0;
    // CSS size follows the *display* rectangle (landscape swaps W and H); the
    // engine keeps drawing in world units underneath.
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.applyCanvasDpr(baseDpr);
    // The fluid field is a world-space effect, so it keeps the world's size.
    this.acidFluid.resize(W, H);
    // Resizing clears the backing store and the next tick is up to a frame away
    // (further when the loop is throttled for an idle backdrop). Paint straight
    // away so the player never catches an empty canvas.
    if (this.hasRendered) this.render();
  };

  private onKey = (e: KeyboardEvent) => {
    if (!this.active) return;
    // W/S slide the landscape gun up and down the screen (portrait keeps them).
    if (this.orientation === 'landscape' && (e.code === 'KeyW' || e.code === 'KeyS')) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        if (e.code === 'KeyW') this.gunSlideUp = true;
        else this.gunSlideDown = true;
        return;
      }
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      if (this.state === 'play' || this.state === 'intro') {
        e.preventDefault();
        if (e.repeat) return;
        this.press();
      }
    }
  };

  /**
   * Landscape aim: remember where the pointer is in *display* pixels. The angle
   * itself is resolved in `updateGunPose`, where the gun's own position is known.
   */
  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const { w, h } = displaySize(this.orientation);
    this.aimPointer = {
      x: ((e.clientX - rect.left) / rect.width) * w,
      y: ((e.clientY - rect.top) / rect.height) * h,
    };
  };

  private onPointer = (e: PointerEvent) => {
    e.preventDefault();
    // Cek tap pada bintang power-up lebih dulu
    if (this.star) {
      const rect = this.canvas.getBoundingClientRect();
      // The canvas element is the *display* rectangle, which is rotated in
      // landscape, so the tap has to be mapped back through the same transform
      // the world was drawn with.
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const { x, y } = displayToWorld(this.orientation, nx, ny);
      if (this.tryTapStar(x, y)) return;
    }
    this.press();
  };

  private prewarmWeaponAudio() {
    try {
      if (this.setNineLive) unlockNineAudio();
      else if (this.setElevenLive) unlockElevenAudio(this.s11);
      else if (this.setSevenLive) sevenSfx.ensure();
      else if (this.weapon?.id === 'firework') fireworkSfx.unlock();
      else if (this.weapon && isSlide23Weapon(this.weapon.id)) slide23Sfx.unlock();
    } catch {
      /* AudioContext unavailable in headless tests */
    }
  }

  private startRun(
    level: number,
    forcedMode?: LevelMode,
    weaponHandoff = false,
    weaponEntryDelay = 0,
    synchronizedEntrance = false,
    wheelEntryDelay = 0,
    gunHiddenFor = 0,
  ) {
    sfx.unlock();
    // Slide 7's own AudioContext can only start after a user gesture as well.
    setOneSfx.unlock();
    this.prewarmWeaponAudio();
    this.score = 0;
    this.coins = 0;
    this.bankedCoins = 0;
    this.saberSide = -1;
    this.particles = [];
    this.frags = [];
    this.flyers = [];
    this.loadLevel(level, forcedMode);
    const reducedMotion = !!this.motionPreference?.matches;
    this.synchronizedEntrance = synchronizedEntrance && !reducedMotion;
    // Perfect Shot's target only starts dropping once the scope has opened, so the
    // same entrance is held back by the cover time instead of playing unseen.
    this.wheelEntryDelayT = this.synchronizedEntrance ? Math.max(0, wheelEntryDelay) * this.pace : 0;
    this.introDuration = this.synchronizedEntrance
      ? Math.max(1.35, Math.max(0, wheelEntryDelay) + 1.16) * this.pace
      : 0.5;
    this.wheelEntryDuration = 1.1 * this.pace;
    this.gunEntryDelayT = reducedMotion ? 0 : Math.max(0, weaponEntryDelay) * this.pace;
    this.gunEntryRate = this.synchronizedEntrance ? GAMEPLAY_GUN_ENTRY_DURATION / (0.56 * this.pace) : 1;
    this.gunEntryT = reducedMotion || weaponHandoff ? GAMEPLAY_GUN_ENTRY_DURATION : 0;
    // The flying menu frame is the only weapon on screen until it lands.
    this.gunHiddenT = weaponHandoff && !reducedMotion ? Math.max(0, gunHiddenFor) : 0;
  }

  /** Wire the Game B artwork source (the React side owns `TargetArt`). */
  setWheelArtSource(source: WheelArtSource | null) {
    this.wheelArtSource = source;
    this.syncWheelArt(true);
  }

  /** A rasterised Game B wheel arrived for `key`. */
  setWheelArt(key: string, image: HTMLImageElement, markup?: string) {
    this.wheelArtCache.set(key, image);
    if (key !== this.wheelArtKey) return; // another stage is on screen
    this.wheelImage = image;
    if (markup) this.wheelSvg = markup;
    this.buildFace();
  }

  private syncWheelArt(request: boolean) {
    const source = this.wheelArtSource;
    if (!source) return;
    const key = source.keyFor(this.level.n);
    const image = source.get(key) ?? this.wheelArtCache.get(key) ?? null;
    const changed = key !== this.wheelArtKey || image !== this.wheelImage;
    if (key !== this.wheelArtKey) this.wheelSvg = null;
    this.wheelArtKey = key;
    this.wheelImage = image;
    if (!image && request) source.request(this.level.n);
    if (changed) this.buildFace();
  }

  /**
   * First-use costs that would otherwise land on the frame a run starts.
   *
   * Nothing here draws to the visible canvas: the refraction scratch surface is
   * allocated and the HUD's fonts are shaped once into a throwaway 2x2 canvas so
   * the browser has already parsed `Russo One` at every size the HUD asks for.
   * Called while the engine sits idle on the menu, it removes a visible hitch
   * from the first shot of a stage without changing a single pixel.
   */
  prewarm() {
    this.s7State?.prewarmLens();
    try {
      const doc = (globalThis as { document?: Document }).document;
      if (!doc || typeof doc.createElement !== 'function') return;
      const scratch = doc.createElement('canvas');
      scratch.width = 2;
      scratch.height = 2;
      const c = scratch.getContext('2d');
      if (!c) return;
      const font = (size: number) => `${size}px 'Russo One', sans-serif`;
      c.textBaseline = 'middle';
      for (const size of [16, 13, 29, 40]) {
        c.font = font(size);
        c.fillText('0123456789 COMBO x BOSS', 0, 0);
      }
    } catch {
      // A blocked offscreen context is not an error worth interrupting the menu.
    }
  }

  start() { this.startRun(1); }

  /** Start an existing SGA level directly from the level map without changing its stage rules. */
  startAtLevel(
    level: number,
    weaponHandoff = false,
    weaponEntryDelay = 0,
    synchronizedEntrance = false,
    wheelEntryDelay = 0,
    gunHiddenFor = 0,
  ) {
    this.startRun(
      Math.max(1, Math.floor(level)),
      undefined,
      weaponHandoff,
      weaponEntryDelay,
      synchronizedEntrance,
      wheelEntryDelay,
      gunHiddenFor,
    );
  }

  /** Menu shortcuts enter the same real, playable levels as the Arcade progression. */
  startSpecialStage(
    mode: 'boulder' | SpecialMode,
    weaponEntryDelay = 0,
    synchronizedEntrance = false,
    wheelEntryDelay = 0,
    gunHiddenFor = 0,
    weaponHandoff = false,
  ) {
    this.startRun(4, mode, weaponHandoff, weaponEntryDelay, synchronizedEntrance, wheelEntryDelay, gunHiddenFor);
  }

  toIdle() {
    this.state = 'idle';
    this.gunEntryT = GAMEPLAY_GUN_ENTRY_DURATION;
    this.gunEntryDelayT = 0;
    this.gunEntryRate = 1;
    this.synchronizedEntrance = false;
    this.wheelEntryDelayT = 0;
    this.introDuration = 0.5;
    this.wheelEntryDuration = 1.1;
    this.snowLoaded = SNOWBALL_MAG_SIZE;
    this.level = makeLevel(1);
    this.events.onStageChange?.();
    this.level.style = 'orange';
    this.resetSevenLayer();
    this.items = [];
    this.projs = [];
    this.bossProjs = [];
    this.bossMuzzleFlashes = [];
    this.particles = [];
    this.frags = [];
    this.flyers = [];
    this.portals = [];
    this.lights = [];
    this.fwState = undefined;
    this.yoyoState = undefined;
    this.kerisState = undefined;
    this.diamondState = undefined;
    this.bazookaState = undefined;
    this.rock = null;
    this.chest = null;
    this.bonusCoins = [];
    this.rockBullets = [];
    this.fallenCells = [];
    this.chestBullets = [];
    this.treasureCoins = [];
    this.stageRewardPaid = false;
    this.coinPulse = 0;
    this.rockFragments = [];
    this.choosingBuff = false;
    this.twinGuns = false;
    this.star = null;
    this.flashWhite = 0;
    this.flashRed = 0;
    this.tintA = 0;
    this.shake = 0;
    this.bump = 0;
    this.wheelScale = 1;
    this.camY = 0;
    this.bannerT = 0;
    this.glitchT = 0;
    this.aiming = false;
    this.holding = false;
    this.charging = false;
    this.placeObstacles();
    this.buildFace();
    this.render();
  }

  continueAfterBoss() { this.loadLevel(this.level.n + 1); }

  startBossChallenge() { this.startRun(5); }

  applyBuff(kind: BuffKind) {
    if (!this.choosingBuff) return;
    if (!allowsStarPowerups(this.level)) {
      // Stale UI/input must never grant normal-stage star effects or leave play paused.
      this.choosingBuff = false;
      this.holding = false;
      this.aiming = false;
      this.aimT = 0;
      this.charging = false;
      this.chargeT = 0;
      this.chargeLevel = 0;
      gunState.charge = 0;
      return;
    }
    if (this.level.mode === 'treasure') {
      const treasureKinds: TreasureBuff[] = ['rapid', 'double', 'mini', 'giant'];
      this.treasureBuff = treasureKinds.includes(kind as TreasureBuff) ? kind as TreasureBuff : 'rapid';
    } else {
      const normalKinds = ['speed', 'ammo', 'power', 'double'] as const;
      const selected = normalKinds.includes(kind as typeof normalKinds[number])
        ? kind as typeof normalKinds[number] : 'speed';
      this.buff = selected;
      if (selected === 'ammo') {
        this.maxAmmoMult = 2;
        this.ammoLeft += this.level.ammo;
        if (this.weapon.id === 'snowball' && this.snowLoaded === 0 && this.reloadT === 0) this.reloadT = 0.85;
      }
      if (selected === 'power') this.dmgMult = 2;
    }
    if (kind === 'double') this.twinGuns = true;
    // Always release paused input state after a choice. This is particularly
    // important for boss fights and scoped/charged weapons interrupted by a star.
    this.choosingBuff = false;
    this.holding = false;
    this.aiming = false;
    this.aimT = 0;
    this.charging = false;
    this.chargeT = 0;
    this.chargeLevel = 0;
    gunState.charge = 0;
    sfx4.magic();
  }

  drawGunNowDirect(c: CanvasRenderingContext2D, id: WeaponId, cx: number, y0: number, t: number) {
    drawGun(c, id, cx, y0, t, 0, true);
  }

  /** Cek apakah tap mengenai bintang */
  tryTapStar(x: number, y: number): boolean {
    if (!this.star) return false;
    const s = this.star;
    if (Math.hypot(x - s.x, y - s.y) <= s.r * 1.35) {
      // The pickup moves; the weapon stays upright before and after selection.
      this.hitStar();
      return true;
    }
    return false;
  }

  private spawnFloatingStar() {
    if (!allowsStarPowerups(this.level)) return;
    const bottom = this.targetY + this.level.radius;
    const midGap = (bottom + GUN_Y) / 2;
    const baseY = Math.min(GUN_Y - 36, Math.max(bottom + 34, midGap + rand(-18, 18)));
    const fromLeft = Math.random() < 0.5;
    this.star = {
      x: fromLeft ? -40 : W + 40, y: baseY, baseY,
      vx: (fromLeft ? 1 : -1) * rand(125, 155), r: 26,
      age: 0, life: 6, max: 6,
    };
    sfx2.scope();
  }

  private hitStar() {
    if (!this.star || !allowsStarPowerups(this.level)) return;
    const s = this.star;
    this.star = null;
    this.holding = false;
    this.aiming = false;
    this.aimT = 0;
    this.charging = false;
    this.chargeT = 0;
    this.chargeLevel = 0;
    gunState.charge = 0;
    this.projs = [];
    // …and the imported layers forget the rounds slide 1 was flying. They each
    // draw their own carried round, and a carried round is never advanced by
    // its layer (slide 1 owns its position), so without this the screen the
    // star just cleared kept a round frozen in mid-air — slide 11's stayed for
    // the rest of the stage.
    this.s7.sweepCarried();
    this.s9.sweepCarried();
    this.s11.sweepCarried();
    this.choosingBuff = true;
    sfx4.magic();
    this.flashWhite = Math.max(this.flashWhite, 0.35);
    this.sink.light(s.x, s.y, 220, '250,204,21', 0.6);
    this.sink.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 90, color: '250,204,21', kind: 'shock', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 30; i++) {
      const a = rand(0, TAU);
      const v = rand(150, 520);
      this.sink.push({ x: s.x, y: s.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.9), max: 0.9, size: rand(3, 7), color: pick(['#fde047', '#ffffff', '#fbbf24']), kind: 'star', rot: 0, vr: 0, g: 0, drag: 2 });
    }
    this.addText('★ POWER UP!', s.x, s.y - 40, '#fde047', 26);
    this.events.onStarHit?.(this.level.mode === 'treasure');
  }

  private loadLevel(n: number, forcedMode?: LevelMode) {
    // A new stage brings a new target: its wedges are baked again from scratch.
    this.wedgePrep = null;
    // A continuing run keeps its weapon in place between stages. startRun()
    // explicitly re-arms the entrance for Play, map and special-stage starts.
    this.gunEntryT = GAMEPLAY_GUN_ENTRY_DURATION;
    this.gunEntryDelayT = 0;
    this.gunEntryRate = 1;
    this.synchronizedEntrance = false;
    this.wheelEntryDelayT = 0;
    this.introDuration = 0.5;
    this.wheelEntryDuration = 1.1;
    this.level = makeLevel(n, forcedMode);
    this.events.onStageChange?.();
    // A new level starts with an empty wheel: no rounds stuck from the last one.
    this.resetSevenLayer();
    this.items = [];
    this.projs = [];
    // …and with a clean screen. The debris of the stage that just ended — the
    // shattered wheel's nine wedge fragments, the rounds flung out of it, the
    // clear explosion's smoke and sparks — used to keep flying over the new
    // wheel, because only `startRun()` cleared these arrays and a stage
    // auto-advance comes through here instead. On screen that reads as the new
    // wheel "pecah padahal baru sekali tembak".
    this.frags = [];
    this.flyers = [];
    this.particles = [];
    this.lights = [];
    this.beams = [];
    this.rockFragments = [];
    this.rockBullets = [];
    this.fallenCells = [];
    this.chestBullets = [];
    this.treasureCoins = [];
    this.stageRewardPaid = false;
    this.coinPulse = 0;
    this.stageClearBurstT = 0;
    this.stageClearBurstBoss = false;
    this.rock = this.level.mode === 'boulder' || this.level.mode === 'bonus' ? new DiamondRock() : null;
    this.rock?.prebake();
    this.chest = this.level.mode === 'treasure' ? new TreasureChest() : null;
    this.bonusCoins =
      this.level.mode === 'bonus' || this.level.mode === 'boulder'
        ? this.buildBonusCoins()
        : [];
    this.stageTime = isSpecial(this.level.mode) ? STAGE_SECONDS[this.level.mode] : 0;
    this.stageStartCoins = this.coins;
    this.reloadT = 0;
    this.diamondPing = 0;
    this.centerDiamondCollected = false;
    this.centerDiamondHits = 0;
    this.diamondHoldUntil = 0;
    this.choosingBuff = false;
    this.buff = null;
    this.treasureBuff = null;
    this.twinGuns = false;
    this.star = null;
    // Only bosses and special/bonus stages get a star; treasure gets it early.
    this.starTimer = !allowsStarPowerups(this.level) ? Infinity
      : this.level.mode === 'treasure' ? 2.2 : 5 + Math.random() * 3;
    this.speedMult = 1;
    this.dmgMult = 1;
    this.maxAmmoMult = 1;
    this.level.maxHp = this.rock?.total ?? 0;
    this.level.hp = this.rock?.remaining ?? 0;
    this.placeObstacles();
    this.ammoLeft = this.level.ammo;
    this.snowLoaded = Math.min(SNOWBALL_MAG_SIZE, this.ammoLeft);
    this.stuck = 0;
    this.combo = 0;
    this.spotHits = 0;
    // Boss (kepala bos) tampil tegak dan TIDAK berputar seperti papan target biasa.
    this.rot = this.level.boss ? 0 : rand(0, TAU);
    this.levelTime = 0;
    this.state = 'intro';
    this.introT = 0;
    this.wheelEntryT = 0;
    this.wheelBurstT = 0;
    // A fresh wheel always drops in immediately; only the first stage of a run can
    // wait for the scope cover (startRun re-applies wheelEntryDelayT right after).
    this.wheelEntryDelayT = 0;
    this.wheelScale = 0.15;
    this.bannerT = 1.8;
    this.timeScale = 1;
    this.slowT = 0;
    this.savesLeft = this.weapon.saves ?? 0;
    this.perkCount = 0;
    this.burnT = 0;
    this.spikeOffT = 0;
    this.targetR = 0;
    this.aiming = false;
    this.portals = [];
    this.bossProjs = [];
    this.bossMuzzleFlashes = [];
    this.bossShootTimer = 1.8;
    const fw = this.getFwState();
    fw.shotIdx = 0;
    fw.impactIdx = 0;
    if (this.weapon.id === 'firework') {
      for (let i = 0; i < 2; i++) launchFirework8Sky(fw, true);
    }
    const yoyo = this.getYoyoState();
    yoyo.shotIdx = 0;
    yoyo.strings = [];
    const keris = this.getKerisState();
    keris.crawlArcs = [];
    keris.thunderFlash = 0;
    const diamond = this.getDiamondState();
    diamond.shotIdx = 0;
    const bazooka = this.getBazookaState();
    bazooka.shotHueIdx = 0;
    if (this.level.boss) {
      this.bossMaxHp = this.level.ammo * 10;
      this.bossHp = this.bossMaxHp;
      this.bossHpRed = this.bossMaxHp;
      this.bossMood = 'idle';
      this.bossMoodLeft = 0;
      this.bossMoodAge = 0;
      this.bossTauntT = 0;
      this.bossRage = false;
      this.bossHa = [];
    }
    if (!isSpecial(this.level.mode)) this.buildFace();
    this.syncWheelArt(true);
    sfx.start();
    if (this.level.boss) sfx.boss();
  }

  private buildBonusCoins(): BonusCoin[] {
    const coins: BonusCoin[] = [];
    for (const { radius, count } of [
      { radius: 96, count: 12 }, { radius: 132, count: 16 }, { radius: 168, count: 20 },
    ]) {
      for (let i = 0; i < count; i++) {
        const angle = (i * TAU) / count;
        coins.push({
          angle,
          radius,
          lx: Math.cos(angle) * radius,
          ly: Math.sin(angle) * radius,
          phase: rand(0, TAU),
          taken: false,
        });
      }
    }
    return coins;
  }

  private placeObstacles() {
    if (isSpecial(this.level.mode)) return;
    const place = (type: ItemType, count: number, sep: number) => {
      for (let i = 0; i < count; i++) {
        for (let t = 0; t < 300; t++) {
          const a = rand(0, TAU);
          if (this.items.every((it) => angDiff(it.angle, a) > sep)) {
            this.items.push({ angle: a, type, age: 10,
              scale: type === 'old' ? BOARD_OBSTACLE_SCALE : undefined });
            break;
          }
        }
      }
    };
    // A boss wears Perfect Shot's knives: 3–5 blades already sunk into the
    // drawing, leaning a few degrees, exactly like the reference boss stage.
    if (this.level.boss) {
      for (let i = 0; i < this.level.old; i++) {
        for (let t = 0; t < 300; t++) {
          const a = rand(0, TAU);
          if (this.items.every((it) => angDiff(it.angle, a) > 0.42)) {
            this.items.push({
              angle: a,
              type: 'old',
              age: 10,
              knife: knifeVariant(this.level.n, i),
              tilt: rand(-6, 6),
            });
            break;
          }
        }
      }
    }
    place('spike', this.level.spikes, 0.45);
    if (!this.level.boss) place('old', this.level.old, 0.4);
    place('coin', this.level.coins, 0.32);
    // Berlian / Diamond tertancap di arena yang butuh 2x tembakan baru jatuh!
    if (this.level.n >= 2 && Math.random() < 0.6) {
      place('diamond_chest', 1, 0.42);
    }
  }

  /** Game B's boss reactions: laugh, mock the player, and the low-HP rage. */
  private setBossMood(mood: 'laugh' | 'angry', dur: number) {
    if (!this.level.boss) return;
    this.bossMood = mood;
    this.bossMoodLeft = dur;
    this.bossMoodAge = 0;
    if (mood === 'laugh') {
      // Game B pops HA · HA · HA! 160 ms apart, each over its own 1 s flight.
      this.bossHa = [{ age: 0, i: 0 }, { age: -0.16, i: 1 }, { age: -0.32, i: 2 }];
      bossVoice.bossLaugh(bossHeadFor(this.level.n) ?? 'pirate');
    } else {
      bossVoice.bossGrowl();
    }
  }

  /** The rage pose Game B enters when only 40 % of the boss is left. */
  private enterBossRage(hitLocal?: number) {
    if (this.bossRage || !this.level.boss) return;
    this.bossRage = true;
    this.setBossMood('angry', 1.5);
    this.shake = Math.max(this.shake, 12);
    bossVoice.bossRage();
    this.pushBossKnife(hitLocal ?? rand(0, TAU));
  }

  /** Game B's rage throws one more knife, clear of everything already stuck. */
  private pushBossKnife(hitLocal: number) {
    const stuck = this.items.filter((it) => it.type === 'old' && it.knife !== undefined);
    let best = norm(hitLocal + Math.PI);
    let bestGap = -1;
    for (let k = 0; k < 36; k++) {
      const a = norm(hitLocal + Math.PI / 2 + (k * Math.PI) / 18);
      if (angDiff(a, hitLocal) <= 0.7) continue;
      const gap = Math.min(9, ...stuck.map((it) => angDiff(it.angle, a)));
      if (gap > bestGap) {
        bestGap = gap;
        best = a;
      }
    }
    this.items.push({ angle: best, type: 'old', age: 10, knife: 1, tilt: 0 });
  }

  /** bmLaugh / bmAngry / bm-rage sampled the way Game B's keyframes play. */
  private bossReaction() {
    const R = this.level.radius;
    let sx = 1, sy = 1, rot = 0, dx = 0, dy = 0;
    if (this.bossMood === 'laugh') {
      const u = Math.min(1, this.bossMoodAge / 1.1);
      const KEYS: [number, number, number, number, number][] = [
        [0, 1, 1, 0, 0],
        [0.1, 1.06, 0.94, 0, 0.02],
        [0.22, 0.96, 1.06, -3, -0.04],
        [0.34, 1.06, 0.94, 0, 0.02],
        [0.46, 0.96, 1.06, 3, -0.04],
        [0.58, 1.05, 0.95, 0, 0.02],
        [0.7, 0.97, 1.04, -2, -0.03],
        [0.84, 1.02, 0.98, 0, 0],
        [1, 1, 1, 0, 0],
      ];
      for (let i = 1; i < KEYS.length; i++) {
        const [t1, a1, b1, r1, d1] = KEYS[i];
        const [t0, a0, b0, r0, d0] = KEYS[i - 1];
        if (u > t1 && i < KEYS.length - 1) continue;
        const k = t1 === t0 ? 0 : Math.max(0, Math.min(1, (u - t0) / (t1 - t0)));
        const mix = (a: number, b: number) => a + (b - a) * k;
        sx = mix(a0, a1);
        sy = mix(b0, b1);
        rot = (mix(r0, r1) * Math.PI) / 180;
        dy = mix(d0, d1) * R * 0.5;
        break;
      }
    } else if (this.bossMood === 'angry') {
      const k = Math.max(0, 1 - this.bossMoodAge / 0.65);
      dx = Math.sin(this.bossMoodAge * 62) * 0.04 * R * k;
      sx = 1 + 0.06 * k;
      sy = 1 + 0.06 * k;
    }
    if (this.bossRage) {
      // bm-rage: a 0.5 s alternate scale on top of whatever the mood does.
      const pulse = 0.5 + 0.5 * Math.sin(this.time * TAU * 0.5);
      const s = 1 + 0.035 * pulse;
      sx *= s;
      sy *= s;
      dy -= R * 0.01 * pulse;
    }
    return { sx, sy, rot, dx, dy };
  }

  /**
   * Every transform the boss artwork wears this frame — the idle float, the
   * breath, and Game B's laugh / angry / rage pose — as one matrix. The render
   * applies it and the collision mask inverts it, so a round always meets the
   * drawing where it actually is.
   */
  private bossDecorMatrix(): BossMat {
    const t = this.time;
    let m: BossMat = { a: 1, b: 0, c: 0, d: 1, e: Math.sin(t * 0.53) * 3.2, f: Math.sin(t * 1.15) * 3.8 };
    const sway = Math.sin(t * 0.66 + 1.0) * 0.085;
    m = bossMatMul(m, bossMatRot(sway));
    const breath = 1 + Math.sin(t * 1.35) * 0.014;
    m = bossMatMul(m, bossMatScale(breath, breath));
    const r = this.bossReaction();
    if (r.sx !== 1 || r.sy !== 1 || r.rot !== 0 || r.dx !== 0 || r.dy !== 0) {
      // bmLaugh's transform-origin is 50% 85%: the chin stays put.
      const oy = this.level.radius * 0.7;
      m = bossMatMul(m, bossMatMove(0, oy));
      m = bossMatMul(m, bossMatRot(r.rot));
      m = bossMatMul(m, bossMatScale(r.sx, r.sy));
      m = bossMatMul(m, bossMatMove(0, -oy));
      m = bossMatMul(m, bossMatMove(r.dx, r.dy));
    }
    return m;
  }

  private buildFace() {
    // A new raster means new wedges: whatever was baked belongs to the old one.
    this.wedgePrep = null;
    const R = this.level.radius;
    const S = this.faceScale;
    const pad = this.level.boss ? 40 : 4;
    // The bitmap is baked at this radius. The Grow Ray moves `level.radius`
    // afterwards, so the geometry (mask, contour, impact points) is only in
    // agreement with the art while the pad scales with it — see `facePadNow()`.
    this.faceBaseR = R;
    const size = (R + pad) * 2;
    // Game B's own wheel artwork wins whenever it has been rasterised; the
    // canvas faces below stay as the instant fallback for the first frames.
    const paint = (ctx: CanvasRenderingContext2D) => {
      if (this.wheelImage) ctx.drawImage(this.wheelImage, -R, -R, R * 2, R * 2);
      // A boss is only ever Perfect Shot's own head. Until that raster lands the
      // canvas stays empty for a frame or two — Game A's old flat boss is gone.
      else if (!this.level.boss) drawFace(ctx, R, this.level.style);
    };
    // `art` stays pristine — it is the shape the player sees, so it is what the
    // bullets are tested against. `cv` is the live face and gets bullet holes
    // and scorch marks painted into it all stage long; masking that one would
    // grow the boss a little every time a round bit into it.
    const artSize = size;
    const art = document.createElement('canvas');
    art.width = art.height = artSize;
    const ac = art.getContext('2d')!;
    ac.translate(R + pad, R + pad);
    paint(ac);

    const cv = document.createElement('canvas');
    cv.width = cv.height = size * S;
    const c = cv.getContext('2d')!;
    c.scale(S, S);
    c.translate(R + pad, R + pad);
    c.drawImage(art, -R - pad, -R - pad);
    this.face = cv;
    this.faceCtx = c;
    this.faceR = R;
    // A boss is hit where its pixels are, never on a circle. Both the angular
    // profile (cheap broad phase, item placement) and the alpha mask (exact
    // pixel test for every bullet) are read back from `cv` — the exact canvas
    // the renderer blits — so the silhouette can never disagree with the art,
    // whether it came from Game B's raster or this file's vector fallback.
    const span = (R + pad) / R;
    // 384 bins keep thin rims (the boss' dark outline) inside a single sample,
    // so a round can never slip between two mask pixels and fly through.
    let mask = this.level.boss ? buildArtMask(art, span, 384) : null;
    // A readback that finds no ink at all is not a boss with no body — some
    // browsers hand back an empty (or blocked) buffer for a canvas that had an
    // SVG image drawn into it. Trace the markup instead: real paths, real
    // geometry, no pixel read anywhere.
    let readable = !!mask && mask.maxR > 0.05;
    if (this.level.boss && !readable) {
      const traced = buildArtMaskFromSvg(this.wheelSvg, span, 384);
      if (traced && traced.maxR > 0.05) {
        mask = traced;
        readable = true;
      }
    }
    // One shape only: the profile is read from the same mask every round is
    // tested against. A second sampler (a downscaled read of the same bitmap)
    // would drift from it by a pixel or two, and every knife, coin and spike
    // placed from the profile would sit just off the drawing.
    this.bossArtProfile = readable && mask ? maskProfile(mask) : null;
    this.artMask = readable ? mask : null;
    this.maskSolidRegion = null;
    this.maskSolidEdge = null;
    this.maskOutline = this.artMask ? buildMaskOutline(this.artMask) : null;
    this.maskSurface = this.artMask ? buildMaskSurface(this.artMask) : null;
    this.maskSolidRegion = this.artMask ? buildSolidRegion(this.artMask) : null;
    this.maskSolidEdge = this.artMask ? buildSolidOutline(this.artMask) : null;
    this.artMaskMaxR = this.artMask
      ? this.artMask.maxR
      : this.bossArtProfile ? Math.max(...this.bossArtProfile) : 1;
  }

  /**
   * 360-bin alpha contour of the artwork currently drawn as the target, in
   * units of R (the padded face canvas is scaled back by `span`).
   */
  /**
   * The target's surface radius at a local angle: the on-screen boss artwork's
   * own contour when it has one, the imported portrait's contour otherwise, and
   * a plain radius for the round stages. No circle is ever used for a boss.
   */
  /**
   * Pixel test against the artwork that is on screen right now. Returns the
   * exact radius (px) of the point where the round met the drawing, or null
   * when that point is empty space beside the boss.
   */
  /**
   * The collision mask of the boss that is on screen, rebuilt on demand.
   *
   * A boss is NEVER approximated by a radius. If the raster readback came back
   * empty (some WebViews refuse to read a canvas that had an SVG image drawn
   * into it) the very same head is rasterised again from Perfect Shot's own
   * SVG markup — real paths, real geometry, no pixel read of an image — and the
   * profile, the outline and the mask are all replaced together so nothing on
   * the stage can keep a stale shape.
   */
  private ensureArtMask(): ArtMask | null {
    if (!this.level.boss) return null;
    if (this.artMask) return this.artMask;
    const key = this.wheelArtKey;
    const markup = this.wheelSvg ?? (key ? this.wheelArtSource?.markup?.(key) ?? null : null);
    if (!markup) return null;
    const R = this.level.radius;
    const traced = buildArtMaskFromSvg(markup, (R + 40) / R, 384);
    if (!traced || traced.maxR <= 0.05) return null;
    this.wheelSvg = markup;
    this.artMask = traced;
    this.maskSolidRegion = null;
    this.maskSolidEdge = null;
    this.artMaskMaxR = traced.maxR;
    this.bossArtProfile = maskProfile(traced);
    this.maskOutline = buildMaskOutline(traced);
    this.maskSurface = buildMaskSurface(traced);
    this.maskSolidRegion = buildSolidRegion(traced);
    this.maskSolidEdge = buildSolidOutline(traced);
    return traced;
  }

  /**
   * `?hitbox=1`: the boss' collision geometry, drawn by the game itself in the
   * frame the artwork and the stuck weapons share.
   *
   *   cyan    — the artwork's exact silhouette (every edge pixel of the mask)
   *   green   — the 360-bin contour the placement and the broad phase use
   *             (red when the art never reached the engine: a legacy shape)
   *   yellow  — the exact point each stuck round bit into
   *   white   — which way that round points, and how deep it sank
   *   magenta — the centre of rotation (the point the head turns around)
   */
  /**
   * The boss' collision area, drawn over its art in colour — on for every boss
   * stage, not just `?hitbox=1`:
   *
   *   cyan   — the artwork's exact silhouette (the alpha edge of the drawing)
   *   green  — the same shape as a filled area: this is the collision region
   *            (its contour is what the placement maths reads)
   *   red    — the OLD circular hitbox (radius R), kept only to compare against.
   *            Nothing is ever placed on it.
   *   yellow — where each stuck round bit into the drawing, white = its heading
   *   magenta— the centre the head turns around
   */
  private drawHitboxDebug(c: CanvasRenderingContext2D) {
    const R = this.level.radius;
    const mask = this.artMask;
    c.save();
    c.setLineDash([]);
    // The collision region as an area: the exact silhouette, filled.
    if (mask && (this.maskSolidRegion ?? this.maskSurface)) {
      const k = (2 * mask.span * R) / mask.size;
      c.save();
      c.scale(k, k);
      c.translate(-mask.size / 2, -mask.size / 2);
      c.fillStyle = 'rgba(34,255,136,0.14)';
      c.fill((this.maskSolidRegion ?? this.maskSurface)!);
      c.restore();
    } else {
      // No artwork reached the engine: there is nothing to fill, and the red
      // ring below is the only shape left — which is exactly the bug it flags.
      c.fillStyle = 'rgba(255,64,64,0.16)';
      c.beginPath();
      c.arc(0, 0, R, 0, TAU);
      c.fill();
    }
    // `?hitbox=1` also shows the 360-bin contour the placement maths reads.
    if (this.hitboxFlag) {
      c.strokeStyle = 'rgba(34,255,136,0.85)';
      c.lineWidth = 1.3;
      c.setLineDash([6, 5]);
      c.beginPath();
      for (let deg = 0; deg <= 360; deg += 2) {
        const a = (deg * Math.PI) / 180;
        const r = this.bossRadiusAt(a);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (deg === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.stroke();
      c.setLineDash([]);
    }
    // The old circular hitbox, only in the inspection mode: in the game itself
    // it would look like a second, competing collision.
    if (this.hitboxFlag) {
      c.save();
      c.setLineDash([3, 7]);
      c.strokeStyle = 'rgba(255,64,96,0.95)';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(0, 0, R, 0, TAU);
      c.stroke();
      c.restore();
    }
    // The artwork's exact edge: every pixel where the drawing stops. Cheap
    // enough here because it only runs in the `?hitbox=1` inspection mode; the
    // always-on overlay strokes the cached surface path instead.
    if (mask && this.maskOutline) {
      c.save();
      c.setLineDash([]);
      if (this.maskSurface) {
        const k = (2 * mask.span * R) / mask.size;
        c.scale(k, k);
        c.translate(-mask.size / 2, -mask.size / 2);
        c.strokeStyle = 'rgba(56,189,248,0.98)';
        c.lineWidth = 2.2 / k;
        c.stroke(this.maskSurface);
      }
      c.restore();
      if (this.hitboxFlag) {
        const k = (2 * mask.span * R) / mask.size;
        c.save();
        c.scale(k, k);
        c.translate(-mask.size / 2, -mask.size / 2);
        c.strokeStyle = 'rgba(56,189,248,0.9)';
        c.lineWidth = 1.1 / k;
        c.stroke(this.maskOutline);
        c.restore();
      }
    }
    // where the rounds bit in, and where they point
    for (const it of this.items) {
      if (it.px === undefined || it.py === undefined) continue;
      if (it.type !== 'bullet' && it.type !== 'old') continue;
      c.fillStyle = '#facc15';
      c.beginPath();
      c.arc(it.px, it.py, 3.6, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.55)';
      c.lineWidth = 1;
      c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(it.px, it.py);
      c.lineTo(Math.cos(it.angle) * (this.bossRadiusAt(it.angle) + 26), Math.sin(it.angle) * (this.bossRadiusAt(it.angle) + 26));
      c.stroke();
    }
    // centre of rotation
    c.strokeStyle = 'rgba(255,0,200,0.95)';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-9, 0);
    c.lineTo(9, 0);
    c.moveTo(0, -9);
    c.lineTo(0, 9);
    c.stroke();
    c.beginPath();
    c.arc(0, 0, 3.2, 0, TAU);
    c.stroke();
    c.restore();
  }

  /**
   * The only hitbox marker a boss fight ever shows: the blue edge of the
   * drawing, traced from the very mask the rounds are tested against.
   *
   * Everything else the old overlay painted — the green collision fill, the
   * dashed contour, the red legacy ring, the impact dots, the heading lines and
   * the old hitbox banner — belonged to the inspection overlay and is gone from
   * play. `?hitbox=1` still paints it for development.
   */
  /**
   * Clip the canvas to the boss' blue outline, in the artwork's own frame.
   *
   * Boss mode has no disc: the head is the surface. A hit may light up the head
   * — it must never paint a filled circle of radius R, because that circle was
   * the old wheel hitbox and seeing it flash on every hit is exactly what makes
   * the collision look circular. Everything painted on a boss goes through this
   * clip.
   *
   * Returns false on every non-boss stage (nothing to clip — the wheel really
   * is a disc), and when no artwork mask exists.
   */
  private clipBossSurface(c: CanvasRenderingContext2D): boolean {
    if (!this.level.boss) return false;
    const mask = this.ensureArtMask();
    const region = this.maskSolidRegion ?? this.maskSurface;
    if (!mask || !region) return false;
    const R = this.level.radius;
    const k = (2 * mask.span * R) / mask.size;
    const half = mask.size / 2;
    c.scale(k, k);
    c.translate(-half, -half);
    c.clip(region);
    // Undo the two transforms so the caller keeps drawing in art coordinates.
    c.translate(half, half);
    c.scale(1 / k, 1 / k);
    return true;
  }

  /**
   * Fill the target's surface: the boss' outline on a boss stage, the wheel's
   * disc everywhere else. The caller owns the save/restore.
   */
  private paintTargetSurface(c: CanvasRenderingContext2D, style: string) {
    const R = this.level.radius;
    c.fillStyle = style;
    if (this.clipBossSurface(c)) {
      c.fillRect(-R * 1.5, -R * 1.5, R * 3, R * 3);
      return;
    }
    c.beginPath();
    c.arc(0, 0, R, 0, TAU);
    c.fill();
  }

  private drawBossSilhouette(c: CanvasRenderingContext2D) {
    /**
     * A treasure chest is not a boss head.
     *
     * On a boss the blue line is the hitbox the player aims at — the round stops
     * exactly there. A chest is hit as a box, so the same line is only geometry
     * leaking onto the screen: on the opened kado it reads as a stray blue
     * outline hanging beside the loot. Keep the line for the bosses that need
     * it, and leave the treasure stage clean.
     */
    if (this.level.mode === 'treasure') return;
    const mask = this.ensureArtMask();
    const surface = this.maskSolidEdge ?? this.maskSurface;
    if (!mask || !surface) return;
    const R = this.level.radius;
    const k = (2 * mask.span * R) / mask.size;
    c.save();
    c.setLineDash([]);
    c.scale(k, k);
    c.translate(-mask.size / 2, -mask.size / 2);
    // A soft dark pass underneath keeps the line readable over bright heads,
    // then the blue line itself — the exact edge a round stops on.
    c.strokeStyle = 'rgba(3,10,22,0.55)';
    c.lineWidth = 3.6 / k;
    c.lineJoin = 'round';
    c.stroke(surface);
    c.strokeStyle = 'rgba(56,189,248,0.95)';
    c.lineWidth = 1.7 / k;
    c.stroke(surface);
    // The last hits flash the very piece of the line they stopped on. A wedge
    // clip keeps the glow on the outline instead of smearing it over the face.
    const half = mask.size / 2;
    const now = this.time;
    for (const ping of this.bossEdgePing) {
      const age = now - ping.born;
      if (age < 0 || age > 0.45) continue;
      const fade = 1 - age / 0.45;
      c.save();
      c.beginPath();
      c.moveTo(half, half);
      c.arc(half, half, mask.size * 0.78, ping.a - 0.16, ping.a + 0.16);
      c.closePath();
      c.clip();
      c.strokeStyle = `rgba(186,240,255,${(0.9 * fade).toFixed(3)})`;
      c.lineWidth = (1.7 + 3.4 * fade) / k;
      c.stroke(surface);
      c.restore();
    }
    c.restore();
  }

  private artSurfaceAt(worldX: number, worldY: number): number | null {
    const hit = this.artHitAt(worldX, worldY);
    return hit ? hit.r : null;
  }

  /**
   * Where a world point lands on the artwork: the exact impact point in the
   * boss' own frame (`x`, `y` in art-local px) and its distance from the centre.
   * Everything downstream — the stuck round, its angle, its depth, the sparks —
   * is placed from this point, never from a radius.
   */
  private artHitAt(worldX: number, worldY: number): { r: number; x: number; y: number } | null {
    const mask = this.ensureArtMask();
    if (!mask) return null;
    const R = this.level.radius;
    // The boss floats, sways, breathes, laughs, rages and takes the wheel's hit
    // bump and entrance with it; undo every one of those transforms, in the
    // order the canvas applied them, so the test lands on the pixels the
    // player sees.
    const local = this.worldToArt(worldX, worldY);
    const lx = local.x;
    const ly = local.y;
    // Pixel-centre mapping of the padded blit: world 0 sits on the middle pixel.
    const u = Math.floor(((lx / R / mask.span) + 1) * 0.5 * mask.size);
    const v = Math.floor(((ly / R / mask.span) + 1) * 0.5 * mask.size);
    if (u < 0 || v < 0 || u >= mask.size || v >= mask.size) return null;
    // The outer bound is measured in the artwork's own frame: the head is
    // scaled up by its laugh / angry / rage pose, so a world-space bound would
    // cut the outer 14 % of the drawing away while it is animating.
    if (Math.hypot(lx, ly) > R * mask.maxR + 2) return null;
    // The decision is the blue outline (`maskSolid` = inside the line). Outside
    // it the round flies on; inside it the boss is solid, even where the head
    // has a see-through window in the middle of its drawing.
    if (!maskSolid(mask, u, v)) return null;
    // The round stops on the pixel that crossed the line. That pixel is the
    // first solid one along a ray walked in from outside, so it is always the
    // boundary itself — the exact point the blue line is stroked through — and
    // the radius is measured in the artwork's own frame, so it agrees with the
    // drawing and with the frame the head turns in.
    return { r: Math.hypot(lx, ly), x: lx, y: ly };
  }

  /** Every splinter, plume, chip, shard and spark of the last impacts. */
  private drawSplinters(c: CanvasRenderingContext2D) {
    // Droplets are one batched path per colour; the loop below skips them.
    drawDropParticles(c, this.particles);

    // particles
    for (const p of this.particles) {
      // Callouts are drawn by the caller, over the splinters.
      if (p.kind === 'text') continue;
      const a = Math.max(0, p.life / p.max);
      // Below ~4% alpha nothing is visible on a phone screen, but each one still
      // costs a fill. Skipping them keeps a paintball burst from paying for a
      // hundred invisible droplets.
      if (a < 0.04 || p.kind === 'drop') continue;
      switch (p.kind) {
        case 'spark':
          c.strokeStyle = cssColor(p.color);
          c.globalAlpha = a;
          c.lineWidth = p.size;
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
          c.stroke();
          c.globalAlpha = 1;
          break;
        case 'chip':
          c.save();
          c.globalAlpha = Math.min(1, a * 2);
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.fillStyle = cssColor(p.color);
          c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          c.restore();
          break;
        case 'smoke':
          // Soft plumes: a filled arc left a hard-edged disc, while slide 7
          // draws smoke through its glow sprite. Gradient falloff matches it,
          // and the gradient is cached per colour instead of being rebuilt for
          // every plume on every frame.
          drawSmokeParticle(c, p, a);
          break;
        case 'shell':
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.globalAlpha = Math.min(1, a * 3);
          c.fillStyle = cssColor(p.color);
          c.fillRect(-3.5, -7, 7, 13);
          c.fillStyle = 'rgba(255,255,255,0.5)';
          c.fillRect(-1.5, -6, 1.5, 11);
          c.fillStyle = 'rgba(0,0,0,0.35)';
          c.fillRect(-4, 5, 8, 2.5);
          c.restore();
          break;
        case 'bolt': {
          c.save();
          c.globalCompositeOperation = 'lighter';
          c.lineJoin = 'round';
          c.lineCap = 'round';
          const tx = p.tx ?? p.x;
          const ty = p.ty ?? p.y;
          c.beginPath();
          c.moveTo(p.x, p.y);
          for (let k = 1; k < 7; k++) {
            const f = k / 7;
            c.lineTo(p.x + (tx - p.x) * f + rand(-7, 7), p.y + (ty - p.y) * f + rand(-7, 7));
          }
          c.lineTo(tx, ty);
          const boltCol = cssColor(p.color);
          c.strokeStyle = boltCol;
          c.globalAlpha = 0.28 * a;
          c.lineWidth = p.size * 5.2 * a;
          c.stroke();
          c.globalAlpha = 1;
          c.lineWidth = p.size * 2.4 * a;
          c.stroke();
          c.strokeStyle = '#ffffff';
          c.lineWidth = p.size * 0.8 * a;
          c.stroke();
          c.restore();
          break;
        }
        case 'glow': {
          c.save();
          c.globalCompositeOperation = 'lighter';
          const r = p.size * (0.5 + a * 0.8);
          c.fillStyle = cssColor(p.color, a * 0.28);
          c.beginPath();
          c.arc(p.x, p.y, r * 1.85, 0, TAU);
          c.fill();
          c.fillStyle = cssColor(p.color, a * 0.68);
          c.beginPath();
          c.arc(p.x, p.y, r * 1.05, 0, TAU);
          c.fill();
          c.fillStyle = `rgba(255,255,255,${a * 0.9})`;
          c.beginPath();
          c.arc(p.x, p.y, r * 0.42, 0, TAU);
          c.fill();
          c.restore();
          break;
        }
        case 'ring': {
          const t = 1 - a;
          c.strokeStyle = cssColor(p.color);
          c.globalAlpha = a * 0.8;
          c.lineWidth = 4 * a + 1;
          c.beginPath();
          c.arc(p.x, p.y, p.size * (0.2 + t * 0.8), 0, TAU);
          c.stroke();
          c.globalAlpha = 1;
          break;
        }
        default:
          drawFxParticle(c, p, this.time);
          break;
      }
    }
  }

  /**
   * Boss stages: a round's splinters may only show inside the blue outline of
   * the boss drawing — the same silhouette the hit test stops rounds on. A
   * round never lands in the empty sky, so nothing may be painted there either;
   * whatever is outside the outline is space the round passed through.
   *
   * Ends with the canvas clipped to that outline, back in screen space.
   */
  private bossClipPaint(c: CanvasRenderingContext2D): boolean {
    if (!this.level.boss) return false;
    const mask = this.ensureArtMask();
    const surface = this.maskSolidRegion ?? this.maskSurface;
    const art = this.bossArtScreen;
    if (!mask || !surface || !art || typeof c.getTransform !== 'function') return false;
    const base = c.getTransform();
    if (!base) return false;
    const R = this.level.radius;
    const k = (2 * mask.span * R) / mask.size;
    c.setTransform(art);
    c.scale(k, k);
    c.translate(-mask.size / 2, -mask.size / 2);
    c.clip(surface);
    // Hand the canvas back in screen space, already clipped.
    c.setTransform(base);
    return true;
  }

  /**
   * Run a ported layer's own painting. On a boss stage the layer may only touch
   * the drawing: its FX are spawned on its own wheel rim (radius R), which is
   * empty sky around a head, and painting them there is what made a rifle's hit
   * look like it landed on a circle instead of on the outline.
   */
  private withBossPaintClip(c: CanvasRenderingContext2D, paint: () => void) {
    c.save();
    if (this.level.boss) this.bossClipPaint(c);
    try {
      paint();
    } catch {
      /* a layer's own art must never blank slide 1 */
    }
    c.restore();
  }

  /** A damage / combo callout: never splatter, so it is never clipped. */
  private drawImpactText(c: CanvasRenderingContext2D, p: Particle) {
    const k = Math.max(0, p.life / p.max);
    const pop = k < 0.15 ? 1.6 - (k / 0.15) * 0.6 : 1;
    const al = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    c.save();
    c.translate(p.x, p.y);
    // Landscape shows the whole world on its side. A callout is still text, so
    // it is turned back upright — otherwise every "+10" reads sideways.
    if (this.orientation === 'landscape') c.rotate(-Math.PI / 2);
    c.rotate(p.rot);
    c.scale(pop, pop);
    c.globalAlpha = al;
    c.font = `italic 900 ${p.size}px Impact, 'Arial Black', sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.lineJoin = 'round';
    c.strokeStyle = '#1a0a00'; c.lineWidth = p.size * 0.28;
    c.strokeText(p.text || '', 0, 0);
    c.strokeStyle = '#ffffff'; c.lineWidth = p.size * 0.14;
    c.strokeText(p.text || '', 0, 0);
    const tg = c.createLinearGradient(0, -p.size / 2, 0, p.size / 2);
    tg.addColorStop(0, '#fff6b0'); tg.addColorStop(0.5, cssColor(p.color)); tg.addColorStop(1, '#ff7a00');
    c.fillStyle = tg;
    c.fillText(p.text || '', 0, 0);
    c.restore();
  }

  /** Game B's red rage aura, drawn behind the boss head. */
  private drawBossAura(c: CanvasRenderingContext2D) {
    if (!this.level.boss || !this.bossRage || this.state === 'clear') return;
    const R = this.level.radius;
    const pulse = 0.5 + 0.5 * Math.sin(this.time * TAU * 0.55);
    const rad = R * (1.5 + 0.1 * pulse);
    const g = c.createRadialGradient(0, 0, R * 0.3, 0, 0, rad);
    g.addColorStop(0, `rgba(239,68,68,${(0.3 + 0.14 * pulse).toFixed(3)})`);
    g.addColorStop(0.68, 'rgba(239,68,68,0)');
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, rad, 0, TAU);
    c.fill();
    c.restore();
  }

  /**
   * Game B's boss reactions in screen space (they never rotate with the head):
   * the HA · HA · HA! pop, the rage steam and the MARAH! ×1.35 pill.
   */
  private drawBossMood(c: CanvasRenderingContext2D) {
    if (!this.level.boss || this.state === 'idle' || this.state === 'clear') return;
    const R = this.level.radius;
    // This layer lives in screen space, like Game B's, so it drops whatever
    // wheel transform the renderer is standing in.
    const k = this.scale * this.dpr;
    c.save();
    c.setTransform(k, 0, 0, k, 0, 0);
    const HA_KEYS: [number, number, number, number, number][] = [
      [0, 0, 14, 0.3, -14],
      [0.3, 1, -6, 1.15, 6],
      [0.7, 1, -14, 1, 0],
      [1, 0, -30, 0.9, 0],
    ];
    for (const ha of this.bossHa ?? []) {
      if (ha.age < 0) continue;
      const u = Math.min(1, ha.age);
      let alpha = 0, dy = 0, scl = 1, rot = 0;
      for (let i = 1; i < HA_KEYS.length; i++) {
        const [t1, a1, d1, s1, r1] = HA_KEYS[i];
        const [t0, a0, d0, s0, r0] = HA_KEYS[i - 1];
        if (u > t1 && i < HA_KEYS.length - 1) continue;
        const k = t1 === t0 ? 0 : Math.max(0, Math.min(1, (u - t0) / (t1 - t0)));
        const mix = (a: number, b: number) => a + (b - a) * k;
        alpha = mix(a0, a1);
        dy = mix(d0, d1);
        scl = mix(s0, s1);
        rot = (mix(r0, r1) * Math.PI) / 180;
        break;
      }
      if (alpha <= 0.01) continue;
      const x = CX + R * 1.02 + (ha.i % 2) * 16;
      const y = this.targetY - R * 0.72 + ha.i * 30;
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y + dy);
      c.rotate(rot);
      c.scale(scl, scl);
      c.font = "bold 26px Impact, 'Arial Black', sans-serif";
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.lineJoin = 'round';
      c.lineWidth = 6;
      c.strokeStyle = '#7c2d12';
      c.strokeText(ha.i === 2 ? 'HA!' : 'HA', 0, 0);
      c.fillStyle = '#ffd23f';
      c.fillText(ha.i === 2 ? 'HA!' : 'HA', 0, 0);
      c.restore();
    }
    if (!this.bossRage) {
      // The magazine can be full of HA!s with no rage: leave the canvas in the
      // stage's world frame, because everything drawn after this layer (the gun
      // above all) expects the rotated world transform, not screen space.
      c.restore();
      return;
    }
    // bm-steam: three puffs per side, drifting up and fading out.
    for (const sgn of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const phase = ((this.time * 0.95 + i * 0.35) % 1.05) / 1.05;
        const alpha = Math.sin(Math.PI * phase) * 0.85;
        if (alpha <= 0.02) continue;
        const size = (22 - i * 4) * (0.55 + phase * 0.95);
        const x = CX + sgn * (R * 1.0 + Math.abs(12 + i * 10) * phase);
        const y = this.targetY - R * 0.3 - phase * 52;
        c.save();
        c.globalAlpha = alpha;
        c.fillStyle = 'rgba(255,255,255,0.8)';
        c.beginPath();
        c.arc(x, y, size * 0.5, 0, TAU);
        c.fill();
        c.restore();
      }
    }
    // MARAH! ×1.35 pill under the boss.
    const label = 'MARAH! ×1.35';
    c.save();
    c.font = "bold 13px 'Russo One', Impact, sans-serif";
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const w = c.measureText(label).width + 26;
    const h = 22;
    const px = CX - w / 2;
    const py = this.targetY + R * 1.14;
    c.fillStyle = '#dc2626';
    c.beginPath();
    const r = h / 2;
    c.moveTo(px + r, py);
    c.lineTo(px + w - r, py);
    c.quadraticCurveTo(px + w, py, px + w, py + r);
    c.quadraticCurveTo(px + w, py + h, px + w - r, py + h);
    c.lineTo(px + r, py + h);
    c.quadraticCurveTo(px, py + h, px, py + r);
    c.quadraticCurveTo(px, py, px + r, py);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffffff';
    c.fillText(label, CX, py + h / 2);
    c.restore();
    c.restore();
  }

  /** Angular radius of the on-screen art (grid placement, item seats). */
  private bossRadiusAt(localAngle: number, radius = this.level.radius): number {
    if (!this.level.boss) return radius;
    const TAU = Math.PI * 2;
    const normA = ((localAngle % TAU) + TAU) % TAU;
    const deg = Math.floor((normA * 180) / Math.PI) % 360;
    // Placement (knives, coins, the aim hint) is read from the artwork too: if
    // the profile has not been sampled yet but the mask exists, derive it from
    // the mask instead of reaching for a legacy shape.
    if (!this.bossArtProfile && this.artMask) this.bossArtProfile = maskProfile(this.artMask);
    if (this.bossArtProfile) {
      // The profile *is* the traced edge (first solid pixel along the ray), so
      // this needs no fudge factor: it lands on the drawing the player sees.
      return this.bossArtProfile[deg] * radius;
    }
    // The old Game A portraits must not supply a hidden substitute hitbox.
    // Until Game B's head is ready there is no boss surface to place on.
    return 0;
  }

  private crack(a: number, tint?: string) {
    const c = this.faceCtx;
    c.save();
    drawPreciseWeaponDecal(c, this.faceR, a, this.weapon, this.level.style, this.time, tint);
    c.restore();
  }

  /**
   * Lateral speed for pellet `i` of an `n`-pellet burst, so the pellets fan out
   * and land on different angles of the wheel (the same 26 px fan slide 1 has
   * always used: `off * speed / travel`).
   *
   * Slides 7, 9 and 11 spawn every pellet in the same lane with `vx = 0`. For a
   * burst gun that meant pellets two and three flew straight into the round
   * their own sibling had just stuck into the wheel, `stepProj` reported
   * `fail`, and the stage ended on the very first trigger pull — the Sapphire
   * Shotgun did this every time, because its slide-7 look is its default one.
   */
  private pelletVx(i: number, n: number, speed: number) {
    if (n < 2) return 0;
    const travel = Math.max(1, GUN_Y - (this.targetY + this.level.radius));
    return (((i - (n - 1) / 2) * 26) * speed) / travel;
  }

  /**
   * Where each carried round of one trigger starts, and how it drifts.
   *
   * Slide 1's own guns walk `gunOffsets` (one round per barrel) and fan a burst
   * across `burst` lanes. The imported layers hand back their own rounds, whose
   * count does not have to match: a twin-barrel shotgun has six carriers for
   * three rounds, a volley gun has two rounds for one carrier. The plan keeps
   * every carrier on its own lane so two rounds can never fly into each other
   * (that collision failed the shot and ended the stage on the first trigger),
   * while a twin-barrel shot still leaves each barrel straight up, exactly the
   * way slide 1's own guns fly it.
   */
  private carrierPlan(n: number, rounds: number, speed: number) {
    const barrels = this.gunOffsets.length;
    const lanes = Math.max(n, Math.ceil(rounds / barrels));
    const plan: { ox: number; vx: number; first: boolean }[] = [];
    for (let i = 0; i < lanes * barrels; i++) {
      const barrel = i % barrels;
      const lane = Math.floor(i / barrels);
      plan.push({
        ox: this.gunOffsets[barrel] ?? 0,
        vx: this.pelletVx(lane, lanes, speed),
        first: lane === 0,
      });
    }
    return plan;
  }

  /**
   * A carrier whose round never arrives.
   *
   * Charged recipes (the emerald staff, the buster, the obliterator) build their
   * round from a charge, so the second barrel of a `double` shot cannot create a
   * second one — and a burst gun can hand back fewer rounds than slide 1 has
   * pellets. The carrier used to wait at the muzzle forever: it was invisible,
   * it never hit anything and it never went away.
   *
   * After a short grace period it becomes one of the invisible extra pellets the
   * imported guns already use (`s7Ghost` and friends) and flies out like them.
   * Returns true while the carrier should stay put.
   */
  private strandCarrier(p: Proj) {
    p.hold = (p.hold ?? 0) + 1 / 60;
    if (p.hold < 1) return true;
    if (p.setSevenPending) p.s7Ghost = (p.setSevenPending = false, true);
    else if (p.setNinePending) p.s9Ghost = (p.setNinePending = false, true);
    else if (p.setElevenPending) p.s11Ghost = (p.setElevenPending = p.s11Wait = false, true);
    return false;
  }

  /**
   * The second barrel of an imported gun.
   *
   * Slide 1's own guns fire one round per barrel — `gunOffsets` has two entries
   * while the treasure star's `double` (or the old `double` stage) is active,
   * and the classic fire loop walks them. The imported layers build exactly one
   * round per recipe, so the second barrel drew a gun that never fired: the
   * `double` card made the weapon *look* doubled while every shot, every hit
   * and the whole score still came from the left barrel alone.
   *
   * Each layer's recipe runs once more at its own muzzle. The ported voices are
   * muted for that call: slide 1 has always played a single voice per trigger,
   * so the extra barrel adds a round, not a second bang.
   */
  private fireTwinBarrel<T>(made: T[], fire: () => void, take: () => T[]) {
    if (!this.hasTwinGuns || made.length >= 2) return;
    silentPreview(() => {
      fire();
      made.push(...take());
    });
  }

  // ---------- actions ----------
  /**
   * Fire, then bring the shot's own spray with the barrel.
   *
   * Every weapon family paints its muzzle effects in world coordinates that
   * assume an upright gun. Rather than rewiring each of them, the particles and
   * lights a single `shoot()` call adds are rotated into the pose the gun is
   * actually drawn at — the same map `gunPosePoint` applies to the round itself.
   */
  shoot() {
    if (this.orientation !== 'landscape' || !this.gunTiltNow) {
      this.shootInner();
      this.capCooldown();
      return;
    }
    const firstParticle = this.particles.length;
    const firstLight = this.lights.length;
    this.shootInner();
    this.poseShotSpawns(firstParticle, firstLight);
    this.capCooldown();
  }

  /**
   * Whether the gun came from slide 1's table, from slide 2/6/9/11's own
   * trigger interval or from a held charge, a pull never locks the trigger for
   * longer than `MAX_WEAPON_COOLDOWN`. Slower guns are cut down to it; faster
   * ones (AK-47, nail gun, the SMGs) are left exactly as they were.
   */
  private capCooldown() {
    if (this.cooldown > MAX_WEAPON_COOLDOWN) this.cooldown = MAX_WEAPON_COOLDOWN;
  }

  private poseShotSpawns(firstParticle: number, firstLight: number) {
    const tilt = this.gunTiltNow;
    if (!tilt) return;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const pivotX = this.gunX;
    const pivotY = this.gunBaseY;
    const pose = <T extends { x: number; y: number; vx?: number; vy?: number }>(item: T) => {
      const dx = item.x - pivotX;
      const dy = item.y - pivotY;
      // Only the spray that leaves the gun is turned: anything the same call
      // drops at the target keeps the target's own frame.
      if (dy > -150) return;
      item.x = pivotX + dx * cos - dy * sin;
      item.y = pivotY + dx * sin + dy * cos;
      if (item.vx !== undefined && item.vy !== undefined) {
        const vx = item.vx;
        const vy = item.vy;
        item.vx = vx * cos - vy * sin;
        item.vy = vx * sin + vy * cos;
      }
    };
    for (let i = firstParticle; i < this.particles.length; i++) pose(this.particles[i]);
    for (let i = firstLight; i < this.lights.length; i++) pose(this.lights[i]);
  }

  private shootInner() {
    if (this.state !== 'play' || this.choosingBuff) return;
    if (this.cooldown > 0 || this.ammoLeft <= 0 || this.reloadT > 0) return;
    const w = this.weapon;
    // The gun can be slid/tilted by the player in landscape; every muzzle,
    // effect and round starts from its real position.
    const GX = this.gunX;
    // Slide 3 (`fire()`) spends one round a trigger: no snowball hopper, no
    // burst, no held charge and no paint roulette — those are slide 1's.
    const s3 = this.setSevenLive;
    if (w.id === 'snowball' && this.snowLoaded <= 0 && !s3) return;
    // Automatic/queued shots can fire without a new press; settle them too.
    this.gunEntryT = GAMEPLAY_GUN_ENTRY_DURATION;
    const n = s3 ? 1 : Math.min(w.burst ?? 1, this.ammoLeft);
    this.ammoLeft -= n;
    if (w.id === 'snowball' && !s3) this.snowLoaded = Math.max(0, Math.min(this.snowLoaded - n, this.ammoLeft));
    this.lastShotRT = this.rt;
    this.stretchPlayed = false;
    gunState.shots++;
    if (w.id === 'ghost') { this.ghostHand = this.ghostHand === 1 ? -1 : 1; gunState.ghostSide = this.ghostHand; }
    // Count the trigger, not the barrel/projectile: twin guns and rapid buffs
    // still alternate once per accepted shot, and rejected taps never flip it.
    if (w.id === 'photon_saber') this.saberSide = this.saberSide === 1 ? -1 : 1;
    // Twin hands converge on the same point; only siblings from this trigger
    // may overlap each other, never an older round or an obstacle.
    const ghostVolley = w.id === 'ghost' && this.hasTwinGuns ? ++this.ghostVolleySequence : undefined;
    const tube = w.id === 'firework' ? ((this.fireworkShots ?? 0) % 3) : 0;
    if (w.id === 'firework') { this.fireworkShots = (this.fireworkShots ?? 0) + 1; gunState.fireworkTube = tube; }
    const fireworkMuzzle = (ox: number) => {
      const m = fireworkMouth(getGunVariant('firework'), tube);
      const mirror = this.hasTwinGuns && ox < 0 ? -1 : 1;
      return { x: GX + ox + m.x * GAMEPLAY_GUN_SCALE * mirror, y: this.gunBaseY + m.y * GAMEPLAY_GUN_SCALE };
    };
    this.events?.onShotFired?.(n);
    const big = w.charge && !s3 ? this.chargeLevel : 0;
    const tint = w.paint && !s3 ? pick(PAINT) : undefined;
    const vx = 0; // stars never steer the weapon or its shots
    const vy = -w.speed * this.speedMult * this.bulletK;
    const offsets = this.gunOffsets;
    const sizeBuff = { mini: this.treasureBuff === 'mini', giant: this.treasureBuff === 'giant' };
    // ── Slide 6 (`games/game-2`) ───────────────────────────────────────────
    // Slide 6's own `fire()` runs: its muzzle burst and its beam, painted from
    // the muzzle to the wheel with slide 6's own colours, wobble and lifetime.
    // Slide 6's beams are hitscan there (the trigger paints the beam and
    // resolves the hit in the same call), so slide 1's carrier crosses the
    // field at beam speed — nothing is drawn at the carrier, the beam *is* the
    // shot, and the scorch mark appears while the beam is still lit.
    const s6id = this.setSixId;
    if (s6id && this.setSixLive) {
      const fx = this.s6;
      fx.selectWeapon(s6id);
      fx.time = this.time;
      fx.syncWheel();
      const mouth = this.gunPosePoint(GX + (offsets[0] ?? 0), this.gunBaseY - 4);
      const my = mouth.y;
      fx.fire(mouth.x, my);
      // Slide 6 shipped no audio at all (its component never opens an
      // AudioContext), so there is no voice to import: the gun keeps slide 1's
      // own fire sound instead of the export turning it silent.
      playFireSfx(w.id);
      // The second barrel of the `double` star paints slide 6's muzzle burst
      // from its own muzzle. Silent: slide 1 plays one voice per trigger.
      if (this.hasTwinGuns) {
        silentPreview(() => fx.fire(this.gunPosePoint(GX + (offsets[1] ?? offsets[0] ?? 0), this.gunBaseY - 4).x, my));
      }
      const beams = this.hasTwinGuns ? 2 : 1;
      const plan = this.carrierPlan(n, beams, SIX_BEAM_SPEED * this.bulletK);
      for (const step of plan) {
        this.projs.push({
          x: GX + step.ox, originX: GX + step.ox, y: my,
          vx: vx + step.vx, vy: -SIX_BEAM_SPEED * this.speedMult * this.bulletK,
          big, tint, ...sizeBuff, setSix: true,
        });
      }
      this.recoil = w.recoil;
      this.muzzle = 0.07;
      this.camY += FX[w.id].kick * 0.5;
      // Slide 6's own trigger interval (0.60 s for both the sniper and the
      // heat-ray, 0.45 s for the repulsor), plus slide 1's temporary buffs.
      this.cooldown = (sixCooldown(s6id) ?? w.cooldown)
        * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
      if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
      return;
    }
    // ── Slide 9 (games/game-6) ─────────────────────────────────────────────
    // Slide 9's own `fire()` runs: its muzzle FX, its particles, its sounds and
    // the real slide-9 projectile or beam. Slide 1 still owns the flight, the
    // hit test and the score, so it only carries that round.
    const s9id = this.setNineId;
    if (s9id && this.setNineLive) {
      const fx = this.s9;
      const nw = nineWeapon(s9id);
      fx.selectWeapon(s9id);
      fx.time = this.time;
      fx.syncWheel();
      const mouth = this.gunPosePoint(GX + (offsets[0] ?? 0), this.gunBaseY - 4);
      const mx = mouth.x;
      const my = mouth.y;
      // Slide 9 fans its sparks and aims its beams along the angle it is given,
      // so a tilted barrel has to hand it the barrel's own direction.
      const barrel = this.barrelAngle;
      unlockNineAudio();
      this.nineQueued = false;
      // Only slide 9's bow is charged: it flies as far as it was drawn.
      const charge = nw.charged ? this.nineDraw : 0;
      fx.fire(mx, my, barrel, charge);
      const made = fx.takeShots();
      this.fireTwinBarrel(made,
        () => fx.fireQuiet(this.gunPosePoint(GX + (offsets[1] ?? offsets[0] ?? 0), this.gunBaseY - 4).x, my, barrel, charge),
        () => fx.takeShots());
      // Slide 9's beams are hitscan: the carrier crosses the field at beam
      // speed — or exactly as fast as the dragon's flame travels — so the
      // score and the entry hole land with slide 9's own impact.
      const beam = nw.mode === 'beam';
      const delay = beam ? fx.beamDelay() : 0;
      const reach = Math.max(1, my - (this.targetY + this.level.radius));
      const beamSpeed = delay > 0 ? reach / delay : NINE_BEAM_SPEED;
      // A round flies at slide 9's own speed (the pistol 1800 px/s, the sword
      // 1300, the bow as fast as it was drawn), not at slide 1's.
      const sp = made[0] ? Math.hypot(made[0].vx, made[0].vy) : Math.abs(vy);
      const plan = this.carrierPlan(n, made.length, (beam ? beamSpeed : sp) * this.bulletK);
      for (let i = 0; i < plan.length; i++) {
        const own = made[i];
        const asBeam = beam && !own && plan[i].first;
        const proj: Proj = {
          x: GX + plan[i].ox, originX: GX + plan[i].ox, y: own ? own.y : my,
          vx: vx + plan[i].vx, vy: (asBeam ? -beamSpeed : -sp) * this.bulletK, big, tint, ...sizeBuff,
        };
        if (own) proj.setNine = own;
        else if (asBeam) proj.setNineBeam = delay;
        else if (plan[i].first) proj.setNinePending = true;
        else proj.s9Ghost = true;
        // DEADBLAST's combo: slide-6's repulsor beam (effect #3) is anchored at
        // the muzzle slide 9 spawned its round from, and ages on the shot clock.
        if (own && w.id === 'ironman_hand') proj.comboBeam = { x: own.x, y: own.y, born: this.time };
        this.projs.push(proj);
      }
      // Slide 9's recoil punch lives in its own artwork, and slide 9 has no
      // camera kick: slide 1's 22 px gun jump and its kick are not part of it.
      this.recoil = 0;
      this.muzzle = 0.07;
      // Slide 9's own trigger interval, plus slide 1's temporary buffs.
      this.cooldown = nw.cooldown
        * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
      if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
      return;
    }
    // ── Slide 11 (games/game-8) ────────────────────────────────────────────
    // Slide 11 is the newest layer: its own `fire()` runs (muzzle FX, particles,
    // sound, channel beams and the real slide-11 round), and slide 1 still owns
    // the flight, the hit test and the score.
    const s11id = this.setElevenId;
    if (s11id && this.setElevenLive) {
      const fx = this.s11;
      // Slide 11 works in its own upright frame (`cx`, `baseY`) and maps every
      // point it paints through `setGunPose()`, so it is handed the *upright*
      // muzzle and turns it itself — posing the input as well would rotate the
      // flash twice and throw it off the barrel.
      this.syncElevenPose();
      fx.gunY = this.gunBaseY - 4;
      fx.selectWeapon(s11id);
      fx.syncWheel();
      const my = this.gunBaseY - 4;
      unlockElevenAudio(fx);
      // Upright coordinates: slide 11 turns them into the drawn pose itself,
      // so handing it the slid muzzle as well would rotate its flash twice.
      fx.fire(CX + (offsets[0] ?? 0), my, w.charge ? big : 0);
      const made = fx.takeShots();
      this.fireTwinBarrel(made,
        () => fx.fire(CX + (offsets[1] ?? offsets[0] ?? 0), my, w.charge ? big : 0),
        () => fx.takeShots());
      // One carrier per barrel: the round slide 7 scores (`scoringRounds()`:
      // the nano swarm's centre drone, not just whichever round came first).
      // It leaves on slide 1's barrel line at slide 7's own speed and from then
      // on follows slide 7's own flight every frame (`flight()`: the
      // singularity's acceleration, a drone's brake and homing). Every other
      // round of a volley (eleven of the twelve nano drones) keeps flying,
      // homing and biting on slide 7's physics by itself.
      const barrels = Math.max(1, offsets.length);
      const lanes = n * barrels;
      const scoring = fx.scoringRounds(made, lanes);
      for (let i = 0; i < lanes; i++) {
        const own = scoring[i];
        const bx = GX + (offsets[i % barrels] ?? 0);
        const sx = own ? fx.aimRound(own, bx) : bx;
        const proj: Proj = own
          ? { x: sx, originX: bx, y: own.y, vx: own.vx, vy: own.vy, big, tint, ...sizeBuff }
          : { x: bx, originX: bx, y: my, vx: vx + this.pelletVx(Math.floor(i / barrels), n, Math.abs(vy)), vy, big, tint, ...sizeBuff };
        if (own) {
          proj.setEleven = own;
        } else if (i === 0) {
          // A beam or the railgun: nothing to carry, the hidden knife flies.
          // The sword's slash leaves 0.115 s after the swing: its carrier
          // waits at the muzzle for it instead of landing before it exists.
          proj.setElevenPending = true;
          if (fx.roundDue) proj.s11Wait = true;
        } else proj.s11Ghost = true;
        this.projs.push(proj);
      }
      // Slide 11's gun kicks by itself (`ws.recoil × kick` inside its own
      // artwork) and slide 11 never moves the camera on a shot. Slide 1's
      // 22 px gun jump on top doubled every kick and dropped the barrel away
      // from the muzzle flash slide 11 had just lit at the muzzle.
      this.recoil = 0;
      this.muzzle = 0.07;
      // Slide 7's own fire rate (`weapon.cooldown`) for every gun it fires shot
      // by shot: the railgun's 1.15 s recharge, the rifle's 0.15 s bolt, the
      // bow's 0.62 s draw. A channel beam's 0.1 s there is only its burn tick
      // while held; every round sticks here, so a beam keeps one round a press
      // at slide 1's pace.
      const own11 = elevenWeapon(s11id);
      this.elevenPending = 0;
      this.cooldown = (own11.channel ? (w.spinup ? 0.3 - 0.235 * this.spin : w.cooldown) : own11.cooldown)
        * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
      if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
      else if (w.id === 'snowball' && this.snowLoaded === 0 && this.ammoLeft > 0) this.reloadT = 0.85;
      return;
    }
    // ── Slide 2 (`games/fireworkgun`) ──────────────────────────────────────
    // Slide 2's own muzzle recipe runs (flash, cone, backblast, smoke, embers,
    // its voice) and the round it hands over is its own art, flown by slide 1.
    const s2id = this.setTwoId;
    if (s2id && this.setTwoLive) {
      const fx = this.s2w;
      const firstMuzzle = w.id === 'firework' ? fireworkMuzzle(offsets[0] ?? 0) : null;
      fx.cx = firstMuzzle?.x ?? GX;
      fx.cy = this.targetY;
      fx.radius = this.level.radius;
      fx.gunY = firstMuzzle ? firstMuzzle.y + 22 : this.gunBaseY;
      fx.h = H;
      slide2Sfx.unlock();
      // `fire()` also hands back the round slide 2 just loaded (its own seed),
      // so the trail and the impact wear exactly the colours slide 2 picked.
      const round = fx.fire(s2id, this.s2HueFor(s2id));
      const rounds = [round];
      // Its own recipe again for the second barrel: slide 2 hands back a fresh
      // round seed, so the two barrels do not share one trail.
      this.fireTwinBarrel(rounds, () => {
        if (w.id === 'firework') { const m = fireworkMuzzle(offsets[1] ?? 0); fx.cx = m.x; fx.gunY = m.y + 22; }
        rounds.push(fx.fire(s2id, this.s2HueFor(s2id)));
      }, () => []);
      fx.cx = GX; fx.gunY = this.gunBaseY;
      const plan = this.carrierPlan(n, rounds.length, w.speed * this.bulletK);
      for (let i = 0; i < plan.length; i++) {
        const mouth = w.id === 'firework' ? fireworkMuzzle(plan[i].ox) : null;
        this.projs.push({
          x: mouth?.x ?? GX + plan[i].ox, originX: GX + plan[i].ox, y: mouth ? mouth.y - 8 : this.gunBaseY - 22,
          vx: vx + plan[i].vx, vy,
          big, tint, ...sizeBuff,
          setTwo: { ...(rounds[i] ?? round) },
        });
      }
      this.recoil = w.recoil;
      this.muzzle = 0.07;
      this.camY += FX[w.id].kick * 0.5;
      this.cooldown = (w.spinup ? 0.3 - 0.235 * this.spin : w.cooldown)
        * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
      this.s2ShotIdx++;
      if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
      else if (w.id === 'snowball' && this.snowLoaded === 0 && this.ammoLeft > 0) this.reloadT = 0.85;
      return;
    }
    // ── Slide-7 SET 2..5 ───────────────────────────────────────────────────
    // Slide 7's own fire recipe runs (its muzzle FX, its particles, its sound),
    // and the shot it creates is the real slide-7 projectile: the very class
    // that paints the flight, the trail and the impact burst on slide 7. Slide 1
    // still owns the flight and the hit test, so it only carries that shot.
    const s7id = this.setSevenId;
    if (s7id && this.setSevenLive) {
      const fx = this.s7;
      if (this.s7Weapon !== s7id) {
        // A different weapon: slide 7 starts its animation from rest.
        fx.anim = newAnim();
        fx.particles.clear();
        fx.fx.length = 0;
        fx.wheelFx.length = 0;
        fx.timers.length = 0;
        fx.shots.length = 0;
        fx.stuck.length = 0;
        this.s7Weapon = s7id;
      }
      fx.weaponId = s7id;
      fx.syncWheel();
      // Slide 3's muzzle is its gun's own origin (`fire()`: mx = GUN_X,
      // my = this.gunBaseY, the point `drawWeaponLayer()` draws the gun from).
      const firstOx = offsets[0] ?? 0;
      const handShift = (ox: number) => w.id === 'ghost'
        ? this.ghostHand * (this.hasTwinGuns && ox < 0 ? -1 : 1) * GHOST_HAND_X * GAMEPLAY_GUN_SCALE : 0;
      const recipePoint = (ox: number) => {
        if (w.id === 'firework') {
          const mouth = fireworkMuzzle(ox);
          return { x: mouth.x - (tube - 1) * 15 * 0.92, y: mouth.y - (tube === 1 ? -4 : 8) * 0.92 };
        }
        return { x: GX + ox + handShift(ox), y: w.id === 'ghost' ? this.gunBaseY + GHOST_HAND_Y * GAMEPLAY_GUN_SCALE + 6 : this.gunBaseY };
      };
      const firstPoint = recipePoint(firstOx);
      const mx = firstPoint.x, my = firstPoint.y;
      // Slide 3 counts the shot before the recipe runs (the firework cycle
      // picks its rocket from that counter) and reads its ammo after spending
      // it (the soaker's tank gauge).
      if (w.id === 'firework') fx.shotsFired = this.fireworkShots;
      else fx.shotsFired++;
      fx.ammoLeft = this.ammoLeft;
      fx.ammoTotal = Math.max(1, this.level.ammo * this.maxAmmoMult);
      FIRE_RECIPES[s7id](fx, mx, my);
      const made = fx.takeShots();
      this.fireTwinBarrel(made,
        () => { const point = recipePoint(offsets[1] ?? offsets[0] ?? 0); FIRE_RECIPES[s7id](fx, point.x, point.y); },
        () => fx.takeShots());
      // The round slide 7 just launched decides how fast slide 1's carrier
      // travels: its own `vy` is the launch speed its class was built with, so
      // the flight, the trail spacing and the streak in its `draw()` all keep
      // slide 7's timing instead of slide 1's (snowball 1050 instead of 2000,
      // holy light 900 instead of an instant 14000 beam…).
      const shotSpeed = made[0] ? sevenShotSpeed(made[0], w.speed) : w.speed;
      const shotVy = -shotSpeed * this.speedMult * this.bulletK;
      // One carrier per round slide 3 made — every slide-3 recipe makes one a
      // barrel — starting exactly where slide 3 put it and flying straight up
      // at its own speed, as every slide-3 round does (no pellet spread: the
      // shotgun's nine pellets and the sapphire's shards live inside their one
      // round). A recipe that releases its round later (the staff's charge,
      // the blowpipe's breath, the meteor's summon…) leaves one waiting
      // carrier per barrel.
      if (made.length) {
        for (const [i, own] of made.entries()) {
          if (w.id === 'firework' && this.hasTwinGuns) {
            // The original rocket homes to wheel centre. Twin launchers need
            // separate targets so their two rockets cannot collide on landing.
            (own as FireworkShot).targetX = GX + (offsets[i % offsets.length] ?? 0);
          }
          const ownVy = -sevenCarrierSpeed(own, w.speed) * this.speedMult * this.bulletK;
          this.projs.push({
            x: own.x, originX: own.x, y: own.y,
            vx: w.id === 'ghost' ? this.ghostAimVx(own.x, own.y, ownVy, own.tip) : 0,
            vy: ownVy, ghostAim: w.id === 'ghost', ghostVolley,
            big, tint, hue: undefined, ...sizeBuff, setSeven: own,
          });
        }
      } else {
        for (const ox of offsets.length ? offsets : [0]) {
          this.projs.push({
            x: GX + ox, originX: GX + ox, y: my, vx: 0, vy: shotVy,
            big, tint, hue: undefined, ...sizeBuff, setSevenPending: true,
          });
        }
      }
      this.s7Last = made[0];
      // The bookkeeping slide 1 still owns: cooldown and reloads. Everything
      // you see (muzzle, smoke, casing, the gun's own recoil spring, the
      // shake) is slide 3's own recipe — slide 3 has no camera kick and no
      // 22 px gun jump, so slide 1's are not added.
      this.recoil = 0;
      this.muzzle = 0.07;
      // Slide 7's own trigger interval: the bee fires every 0.50 s there, not
      // every 0.10 s; the obliterator every 0.80 s, not 0.95 s. Slide 1's
      // temporary buffs still apply on top, exactly like they do for its own
      // guns.
      const s7Cool = sevenCooldown(s7id);
      this.cooldown = (s7Cool ?? (w.spinup ? 0.3 - 0.235 * this.spin : w.cooldown))
        * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
      if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
      return;
    }
    const fw = w.id === 'firework' ? this.getFwState() : null;
    const yoyo = w.id === 'yoyo' ? this.getYoyoState() : null;
    const keris = w.id === 'keris' ? this.getKerisState() : null;
    const diamond = w.id === 'diamond' ? this.getDiamondState() : null;
    const bazooka = w.id === 'bazooka' ? this.getBazookaState() : null;
    // Slide-7 SET 1: its own muzzle recipe per barrel, and its own spawn point
    // (the slingshot throws from the pouch, the blowpipe from the mouthpiece,
    // the black-hole staff releases the orb 0.28 s after the charge).
    const setOneLive = this.setOneLive;
    const s1Spawns = setOneLive
      ? offsets.map((ox) => fireSetOne(this.s1, this.setOneId!, ...(this.poseMuzzleXY(GX + ox, this.gunBaseY - 4)), this.s1Hooks(), (n) => setOneSfx.play(n)))
      : null;
    let s1i = 0;
    for (const ox of offsets) {
      const s1spawn = s1Spawns ? s1Spawns[s1i++] : null;
      const shotHue = fw
        ? firework8ShotHue(this.level?.n ?? 1, fw.shotIdx++)
        : yoyo
          ? yoyoAmmoHue(yoyo.shotIdx++)
          : diamond
            ? 205 + ((diamond.shotIdx++ * 13) % 22)
            : bazooka
              ? bazooka.nextHue()
              : undefined;
      const spawnDelay = s1spawn ? s1spawn.delay
        : w.id === 'keris' ? KERIS_GLEAM_DUR : undefined;
      if (fw && shotHue !== undefined) gunState.rocketHue = shotHue;
      if (yoyo && shotHue !== undefined) gunState.yoyoHue = shotHue;
      if (bazooka && shotHue !== undefined) gunState.bazookaHue = shotHue;
      // Weapon-specific spawn Y: dora barrel extends 70px above gun base, pred muzzle at this.gunBaseY-72 (game-3: my-68)
      const fwMouth = fw ? fireworkMuzzle(ox) : null;
      const spawnY = s1spawn ? s1spawn.y
        : fwMouth ? fwMouth.y - 8
        : w.id === 'dora' ? this.gunBaseY + w.recoil * 22 - 50 : w.id === 'pred' ? this.gunBaseY - 72
          : w.id === 'ghost' ? this.gunBaseY + GHOST_HAND_Y * GAMEPLAY_GUN_SCALE : this.gunBaseY - 4;
      const spawnX = s1spawn ? s1spawn.x : fwMouth ? fwMouth.x : GX + ox + (w.id === 'ghost'
        ? this.ghostHand * (this.hasTwinGuns && ox < 0 ? -1 : 1) * GHOST_HAND_X * GAMEPLAY_GUN_SCALE : 0);
      const isNewWeapon = w.id === 'dora' || w.id === 'xeno' || w.id === 'pred';
      const projExtra = isNewWeapon ? { wob: Math.random() * TAU, lastEcho: spawnY } : {};
      const s1State = s1spawn ? this.s1.newShot(this.setOneId!, spawnX, spawnY) : undefined;
      if (s1State) this.s1Last = s1State;
      if (n === 1) this.projs.push({ x: spawnX, originX: spawnX, y: spawnY, vx: w.id === 'ghost' ? this.ghostAimVx(spawnX, spawnY, vy) : vx, vy, ghostAim: w.id === 'ghost', ghostVolley, big, tint, hue: shotHue, spawnDelay, setOne: s1State, ...sizeBuff, ...projExtra });
      else {
        const travel = this.gunBaseY - (this.targetY + this.level.radius);
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * 26;
          // Multi-shot guns get their own slide-7 round each, so the pellets
          // and the stream never share an age with a sibling bullet.
          const own = s1spawn ? this.s1.newShot(this.setOneId!, spawnX, spawnY) : undefined;
          this.projs.push({ x: spawnX, originX: spawnX, y: spawnY, vx: vx + (off * w.speed) / travel, vy, big, tint, hue: shotHue, spawnDelay, setOne: own, ...sizeBuff, ...projExtra });
        }
      }
      if (fw && shotHue !== undefined) {
        const m = fwMouth!;
        spawnFirework8Muzzle(fw, m.x, m.y, shotHue);
        this.sink.light(m.x, m.y, 70, '255,180,220', 0.25);
        this.sink.push({ x: m.x, y: m.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 38, color: '#ff80bf', kind: 'ring', rot: 0, vr: 0, g: 0 });
      }
      if (yoyo && shotHue !== undefined) {
        spawnYoyoLaunch(yoyo, GX + ox, this.gunBaseY - 6, shotHue);
        this.sink.light(GX + ox, this.gunBaseY - 6, 70, '255,160,220', 0.25);
      }
      if (keris) {
        spawnKerisLaunch(keris, GX + ox, this.gunBaseY - 6);
        this.sink.light(GX + ox, this.gunBaseY - 6, 70, '77,238,234', 0.25);
      }
      if (diamond) {
        spawnDiamondLaunch(diamond, GX + ox, this.gunBaseY - 6);
        this.sink.light(GX + ox, this.gunBaseY - 6, 75, '165,243,252', 0.28);
      }
      if (bazooka) {
        { const mouth = this.gunPosePoint(GX + ox, this.gunBaseY - 6); bazooka.onShoot(mouth.x, mouth.y, H); }
        this.sink.light(GX + ox, this.gunBaseY - 6, 120, '255,150,55', 0.35);
      }
    }
    this.recoil = w.recoil;
    this.muzzle = 0.07;
    const fxp = FX[w.id];
    if (w.id !== 'firework' && w.id !== 'yoyo' && w.id !== 'keris' && w.id !== 'diamond' && w.id !== 'bazooka'
      && !(w.id === 'blackhole' && this.slide2Void) && !setOneLive) {
      for (const ox of offsets) {
        const hand = w.id === 'ghost' ? this.ghostHand * (this.hasTwinGuns && ox < 0 ? -1 : 1) * GHOST_HAND_X * GAMEPLAY_GUN_SCALE : 0;
        spawnMuzzle(this.sink, fxp, w, GX + ox + hand, w.id === 'ghost' ? this.gunBaseY + GHOST_HAND_Y * GAMEPLAY_GUN_SCALE : this.gunBaseY - 6);
      }
    }
    // Slide 2 black hole: collapsing sparks into the muzzle, cosmic hue band.
    if (w.id === 'blackhole' && this.slide2Void) {
      this.s2Hue = 215 + ((gunState.shots * 53) % 105);
      for (const ox of offsets) {
        fireBlackHole2(this.s2, ...(this.poseMuzzleXY(GX + ox, this.gunBaseY - 4)), this.s2Hue);
        this.sink.light(GX + ox, this.gunBaseY - 6, 90, '170,120,255', 0.22);
      }
    }
    this.camY += fxp.kick * 0.5;
    if (fxp.speedLines) for (const ox of offsets) {
      spawnSpeedLines(this.sink, GX + ox, this.targetY + this.level.radius + 20, this.gunBaseY - 30, w.trail);
    }
    this.cooldown = (w.spinup ? 0.3 - 0.235 * this.spin : w.cooldown)
      * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
    if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
    else if (w.id === 'snowball' && this.snowLoaded === 0 && this.ammoLeft > 0) this.reloadT = 0.85;
    if (w.burstFx) {
      const b = w.burstFx;
      for (const ox of offsets) for (let i = 0; i < b.n; i++) {
        const a = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        const v = rand(0.4, 1) * (b.spd ?? 200);
        this.particles.push({
          x: GX + ox + rand(-6, 6), y: this.gunBaseY - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.35, 0.8), max: 0.8,
          size: b.glow ? rand(3, b.size ?? 6) : rand(2, 4.5), color: pick(b.colors),
          kind: w.id === 'soaker' ? 'waterDrop' : w.id === 'snowball' ? 'snowflake' : b.glow ? 'glow' : 'chip',
          rot: rand(0, TAU), vr: rand(-12, 12), g: b.g ?? 600,
        });
      }
    }
    this.shake = Math.max(this.shake, w.shake);
    if (w.id === 'pred' && big > 0) {
      sfx6.pred();
      this.recoil = 1;
      this.shake = Math.max(this.shake, 10);
      this.camY += big * 3;
      for (const ox of offsets) {
        // flash: size 170, color PLASMA.glow, max 0.22 (game-3 releasePlasma)
        this.sink.light(GX + ox, this.gunBaseY - 6, 170, '111,211,255', 0.22);
        // flash: size 80, color #ffffff, max 0.12
        this.sink.light(GX + ox, this.gunBaseY - 6, 80, '255,255,255', 0.12);
        // ring: size 10 grow 420, color PLASMA.glow, max 0.3
        this.sink.push({ x: GX + ox, y: this.gunBaseY - 6, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 170, color: '111,211,255', kind: 'shock', rot: 0, vr: 0, g: 0 });
        // ringE: size 8 grow 300, color #ffffff, max 0.28
        this.sink.push({ x: GX + ox, y: this.gunBaseY - 6, vx: 0, vy: 0, life: 0.28, max: 0.28, size: 130, color: '255,255,255', kind: 'ring', rot: 0, vr: 0, g: 0 });
        // 6 bolts: ang -PI/2 + rand(-1.4, 1.4), color i%2 ? #ffffff : PLASMA.glow (game-3)
        for (let i = 0; i < 6; i++) {
          const ang = -Math.PI / 2 + rand(-1.4, 1.4);
          const col = i % 2 ? '255,255,255' : '111,211,255';
          this.sink.push({ x: GX + ox, y: this.gunBaseY - 6, vx: Math.cos(ang) * rand(30, 70), vy: Math.sin(ang) * rand(30, 70), life: rand(0.1, 0.2), max: 0.2, size: 3, color: col, kind: 'bolt', rot: 0, vr: 0, g: 0 });
        }
        // 26 spark burst (game-3: kind 'spark', size 1.8, drag 4, max 0.3)
        for (let i = 0; i < 26; i++) {
          const a = rand(-Math.PI / 2, 1.3);
          const sp = rand(200, 700);
          this.sink.push({ x: GX + ox, y: this.gunBaseY - 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 1.8, color: i % 2 ? '255,255,255' : '111,211,255', kind: 'spark', rot: 0, vr: 0, g: 0, drag: 4 });
        }
        // 6 smoke: color #3a4a60, size rand(12,22) (game-3)
        for (let i = 0; i < 6; i++) {
          this.sink.push({ x: GX + ox + rand(-16, 16), y: this.gunBaseY - 6 + 10, vx: rand(-50, 50), vy: rand(-40, 20), life: rand(0.7, 1.2), max: 1.2, size: rand(12, 22), color: '58,74,96', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 2 });
        }
      }
    } else if (w.charge && big > 0) {
      if (big === 2) sfx4.busterBig();
      else sfx4.busterMid();
      this.recoil = big === 2 ? 2.4 : 1.4;
      this.shake = Math.max(this.shake, big === 2 ? 9 : 4);
      this.camY += big * 3;
      for (const ox of offsets) {
        const paired = offsets.length > 1;
        this.sink.light(GX + ox, this.gunBaseY, big === 2 ? (paired ? 220 : 320) : (paired ? 130 : 180), big === 2 ? '254,240,138' : '125,211,252', 0.25);
        this.sink.push({ x: GX + ox, y: this.gunBaseY - 8, vx: 0, vy: 0, life: 0.4, max: 0.4, size: big === 2 ? (paired ? 105 : 150) : (paired ? 60 : 80), color: '125,211,252', kind: 'shock', rot: 0, vr: 0, g: 0 });
      }
      if (big === 2) for (const ox of offsets) {
        spawnSpeedLines(this.sink, GX + ox, this.targetY + this.level.radius + 20, this.gunBaseY - 30, '254,240,138');
      }
    } else if (this.slide2Void) slide2Sfx.shootBH();
    else if (!setOneLive) playFireSfx(w.id);
    if (w.id === 'xeno') {
      for (const ox of offsets) {
        // 16 viscous droplets behind the glob (game-3 fire())
        for (let i = 0; i < 16; i++) {
          const k = i / 16;
          this.sink.push({ x: GX + ox + rand(-3, 3), y: this.gunBaseY - 4 - k * 12, vx: rand(-25, 25), vy: vy * (0.45 + k * 0.5), life: rand(0.7, 1.2), max: 1.2, size: rand(2.5, 6.5) * (1 - k * 0.5) + 1.5, color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 900 });
        }
        // 10 fine mist (game-3: vy rand(-900, -300))
        for (let i = 0; i < 10; i++) {
          this.sink.push({ x: GX + ox + rand(-6, 6), y: this.gunBaseY - 4 - rand(0, 4), vx: rand(-120, 120), vy: rand(-900, -300), life: rand(0.4, 0.8), max: 0.8, size: rand(1.2, 2.2), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1200 });
        }
        // flash + ring (game-3: flash size 80, ring size 8 grow 220).
        // The flash is a soft bloom, not a filled disc.
        this.sink.light(GX + ox, this.gunBaseY - 6, 80, '182,255,26', 0.2);
        this.sink.push({ x: GX + ox, y: this.gunBaseY - 6, vx: 0, vy: 0, life: 0.2, max: 0.2, size: 34, color: '182,255,26', kind: 'glow', rot: 0, vr: 0, g: 0 });
        this.sink.push({ x: GX + ox, y: this.gunBaseY - 6, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 26, color: '182,255,26', kind: 'ring', rot: 0, vr: 0, g: 0 });
        // 6 smoke puffs (game-3: color #9bd13a, size rand(10,20))
        for (let i = 0; i < 6; i++) {
          this.sink.push({ x: GX + ox + rand(-14, 14), y: this.gunBaseY - 6, vx: rand(-40, 40), vy: rand(-90, -30), life: rand(0.8, 1.4), max: 1.4, size: rand(10, 20), color: '155,209,58', kind: 'smoke', rot: 0, vr: 0, g: 30, drag: 2 });
        }
      }
    }
    if (w.id === 'dora') {
      // Dora muzzle = y0 - 70 where y0 = this.gunBaseY + recoil*22 (barrel extends 150px upward from y0+80)
      const doraMuzzleY = this.gunBaseY + this.recoil * 22 - 70;
      for (const ox of offsets) {
        // flash + ringE (game-3 fireAir())
        this.sink.light(GX + ox, doraMuzzleY, 120, '255,255,255', 0.16);
        this.sink.push({ x: GX + ox, y: doraMuzzleY, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 120, color: '255,255,255', kind: 'ring', rot: 0, vr: 0, g: 0 });
        // ringE #1: size 14, grow 420, white, max 0.3
        this.sink.push({ x: GX + ox, y: doraMuzzleY, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 14, color: '255,255,255', kind: 'ringE', rot: 0, vr: 0, g: 0 });
        // ringE #2: size 8, grow 260, AIR.glow, max 0.36
        this.sink.push({ x: GX + ox, y: doraMuzzleY, vx: 0, vy: 0, life: 0.36, max: 0.36, size: 8, color: '159,220,255', kind: 'ringE', rot: 0, vr: 0, g: 0 });
        // 14 puff particles (game-3: size rand(12,22), grow 26, drag 3.2)
        for (let i = 0; i < 14; i++) {
          const a = rand(0, TAU);
          const sp = rand(90, 260);
          this.sink.push({ x: GX + ox + Math.cos(a) * 14, y: doraMuzzleY + 6 + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.5 + 30, life: rand(0.5, 0.9), max: 0.9, size: rand(12, 22), color: '#ffffff', kind: 'puff', rot: rand(0, TAU), vr: rand(-2, 2), g: 0, drag: 3.2 });
        }
        // 10 wind streaks (game-3: size rand(14,30), speed rand(500,900))
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + rand(-0.5, 0.5);
          this.sink.push({ x: GX + ox, y: doraMuzzleY, vx: Math.cos(a) * rand(500, 900), vy: Math.sin(a) * rand(500, 900), life: rand(0.18, 0.3), max: 0.3, size: rand(14, 30), color: '#ffffff', kind: 'wind', rot: 0, vr: 0, g: 0, drag: 1 });
        }
        // DOKAN! text (game-3: x+54, y-30, size 34, color #ffd23a, rot -0.18)
        this.sink.push({ x: GX + ox + 54, y: doraMuzzleY - 30, vx: 0, vy: 0, life: 0.7, max: 0.7, size: 34, color: '#ffd23a', kind: 'text', rot: -0.18, vr: 0, g: 0, text: 'DOKAN!' });
      }
      this.shake = Math.max(this.shake, 9);
    }
    if (w.id === 'slingshot') {
      sfx4.slingRelease();
      for (const ox of offsets) {
        for (const s of [-1, 1]) {
          for (let i = 0; i < 4; i++) {
            this.sink.push({ x: GX + ox + s * 24, y: this.gunBaseY + 6, vx: -s * rand(300, 600), vy: rand(-500, -200), life: 0.12, max: 0.12, size: rand(1, 2), color: 'rgba(255,220,200,0.9)', kind: 'streak', rot: 0, vr: 0, g: 0 });
          }
        }
        for (let i = 0; i < 6; i++) {
          this.sink.push({ x: GX + ox + rand(-10, 10), y: this.gunBaseY + 10, vx: rand(-80, 80), vy: rand(-60, 10), life: rand(0.4, 0.7), max: 0.7, size: rand(5, 10), color: 'rgba(210,190,160,', kind: 'smoke', rot: 0, vr: 0, g: -20, drag: 2 });
        }
        this.sink.push({ x: GX + ox, y: this.gunBaseY + 4, vx: 0, vy: 0, life: 0.25, max: 0.25, size: 70, color: '255,230,200', kind: 'shock', rot: 0, vr: 0, g: 0 });
      }
      this.addText('CTAK!', GX + rand(-50, 50), this.gunBaseY - 20, '#fde68a', 22);
    }
    if (w.id === 'obliterator') {
      this.flashWhite = Math.max(this.flashWhite, 0.2);
      this.tintA = Math.max(this.tintA, 0.25);
      this.tintRgb = '74,222,128';
    }
    if (w.casing) {
      for (const ox of offsets) {
        const side = ox < 0 ? -1 : 1; // cases eject outwards from mirrored guns
        this.particles.push({
          x: GX + ox + side * 16, y: this.gunBaseY + (w.ejectY ?? 48), vx: side * rand(180, 320), vy: rand(-520, -380), life: 1.1, max: 1.1,
          size: 1, color: w.casing, kind: 'shell', rot: rand(0, TAU), vr: side * rand(15, 28), g: 1600,
        });
      }
    }
    if (!w.energy && !w.noSmoke) {
      const ns = w.backblast || w.id === 'bamboo' || w.id === 'pirate' ? 10 : 4;
      for (const ox of offsets) for (let i = 0; i < ns; i++) {
        this.particles.push({
          x: GX + ox + rand(-6, 6), y: this.gunBaseY - 6, vx: rand(-50, 50), vy: rand(-90, -30), life: 0.5, max: 0.5,
          size: rand(6, w.backblast ? 18 : 12), color: 'rgba(200,200,200,', kind: 'smoke', rot: 0, vr: 0, g: -20,
        });
      }
    }
    if (w.backblast) {
      for (const ox of offsets) for (let i = 0; i < 14; i++) {
        this.particles.push({
          x: GX + ox + rand(-20, 20), y: H - rand(0, 30), vx: rand(-160, 160), vy: rand(-40, 80), life: rand(0.5, 1), max: 1,
          size: rand(14, 30), color: 'rgba(180,180,180,', kind: 'smoke', rot: 0, vr: 0, g: -40,
        });
        this.particles.push({
          x: GX + ox + rand(-14, 14), y: H - rand(0, 20), vx: rand(-120, 120), vy: rand(-30, 60), life: rand(0.2, 0.4), max: 0.4,
          size: rand(6, 12), color: '255,150,40', kind: 'glow', rot: 0, vr: 0, g: 0,
        });
      }
    }
    if (w.energy && w.id !== 'laser') {
      for (const ox of offsets) {
        this.particles.push({ x: GX + ox, y: this.gunBaseY + 10, vx: 0, vy: 0, life: 0.3, max: 0.3, size: w.id === 'cricket' ? 110 : 50, color: w.color, kind: 'ring', rot: 0, vr: 0, g: 0 });
        for (let i = 0; i < 10; i++) {
          const a = rand(0, TAU);
          const v = rand(60, 200);
          this.particles.push({
            x: GX + ox, y: this.gunBaseY + 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(0.25, 0.5), max: 0.5,
            size: rand(3, 6), color: w.trail, kind: 'glow', rot: 0, vr: 0, g: 0,
          });
        }
      }
    }
    if (w.id === 'cricket') {
      this.flashWhite = Math.max(this.flashWhite, 0.25);
      this.addText('BOOM!', GX + rand(-40, 40), this.gunBaseY - 40, '#9fd8ff', 26);
    }
    if (w.beam) {
      for (const ox of offsets) {
        // A laser is visible immediately, before its collision carrier reaches
        // the target. Trace the same ink used by bullets instead of stopping
        // the visible beam at the obsolete circular radius.
        const by = this.level.boss
          ? traceBossSegment(GX + ox, this.gunBaseY, GX + ox, -80, (x, y) => this.artHitAt(x, y) !== null)?.y ?? -80
          : this.targetY + this.level.radius - 4;
        this.beams.push({ x: GX + ox, y: by, life: 0.22, max: 0.22, rgb: w.trail });
        for (let i = 0; i < 14; i++) {
          const yy = rand(by, this.gunBaseY);
          this.sink.push({ x: GX + ox + rand(-3, 3), y: yy, vx: rand(-160, 160), vy: rand(-60, 60), life: rand(0.2, 0.45), max: 0.45, size: rand(2, 4.5), color: w.trail, kind: 'glow', rot: 0, vr: 0, g: 0, drag: 4 });
        }
        const starTrain = w.id === 'moonbeam' && getGunEffect(w.id) === 'new';
        for (let i = 0; i < (starTrain ? 16 : 6); i++) {
          this.sink.push({ x: GX + ox + (starTrain ? rand(-13, 13) : 0),
            y: rand(by, this.gunBaseY), vx: starTrain ? rand(-35, 35) : 0, vy: 0,
            life: starTrain ? 0.34 : 0.2, max: starTrain ? 0.34 : 0.2,
            size: rand(4, starTrain ? 10 : 7),
            color: starTrain ? pick(['#ffffff', '#e9ddff', '#ffeabb']) : '#ffffff',
            kind: 'star', rot: rand(0, TAU), vr: 0, g: 0 });
        }
      }
    }
  }

  /** find the local angle that is furthest from every obstacle */
  private safeAngle(): number {
    let best = 0;
    let bestD = -1;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU;
      let md = 99;
      for (const it of this.items) {
        if (it.type === 'coin') continue;
        md = Math.min(md, angDiff(a, it.angle));
      }
      if (md > bestD) {
        bestD = md;
        best = a;
      }
    }
    return best;
  }

  /**
   * The wheel object every imported weapon layer reads. `R` stays the plain
   * radius for an ordinary wheel, but on a boss the three new members let a
   * layer land on the drawing instead of on a circle:
   *
   *   radiusAt(localAngle)      — the silhouette's radius in that direction
   *   surfacePoint(localAngle)  — that point in world space (decor included)
   *   ink(worldX, worldY)       — is this screen point on the boss at all?
   */
  private wheelHook() {
    return {
      x: CX,
      y: this.targetY,
      R: this.level.radius,
      radiusAt: (a: number) => (this.level.boss ? this.bossRadiusAt(norm(a)) : this.level.radius),
      surfacePoint: (a: number) => this.surfacePointAt(norm(a)),
      // Only a boss has a drawing to test against; an ordinary wheel keeps its
      // layers' own circle maths (`ink` is absent there on purpose).
      ...(this.level.boss
        ? { ink: (x: number, y: number) => this.artHitAt(x, y) !== null }
        : {}),
    };
  }

  /** The same wheel object plus the wheel's own angle (rotating layers). */
  private wheelHookRot(extra: Record<string, unknown> = {}) {
    return { ...this.wheelHook(), angle: this.rot, ...extra };
  }

  /** World point on the silhouette along a wheel-local angle. */
  private surfacePointAt(localAngle: number) {
    const R = this.level.radius;
    if (!this.level.boss) {
      const wa = localAngle + this.rot;
      return { x: CX + Math.cos(wa) * R, y: this.targetY + Math.sin(wa) * R };
    }
    // Exact: march the mask itself, so the point handed to a weapon layer is a
    // pixel of the drawing. The 360-bin profile is only a cheap approximation
    // for placement that has to happen every frame.
    const exact = this.artSurfaceLocal(localAngle);
    if (exact) return this.artToWorld(exact.x, exact.y);
    const r = this.bossRadiusAt(localAngle);
    return this.artToWorld(Math.cos(localAngle) * r, Math.sin(localAngle) * r);
  }

  /**
   * The point on the drawing along one direction, measured in the artwork's own
   * frame: the mask is walked from just outside its furthest ink inwards, so the
   * first solid pixel is the surface the player sees. No binning, no averaging,
   * and no radius — a ray that slips through a gap between hat and shoulder
   * reports the gap, not a ring.
   */
  private artSurfaceLocal(localAngle: number): { x: number; y: number; r: number } | null {
    const mask = this.ensureArtMask();
    if (!mask) return null;
    const R = this.level.radius;
    const cos = Math.cos(localAngle);
    const sin = Math.sin(localAngle);
    const outer = R * mask.maxR + 2;
    for (let r = outer; r > 4; r -= 0.9) {
      if (!this.artSolidAtLocal(mask, cos * r, sin * r)) continue;
      // Sit a pixel and a half inside the traced edge. The artwork's own
      // anti-aliased border can flip a single sample, and an effect anchored on
      // the surface must never end up just outside the drawing.
      const inner = Math.max(4, r - 1.5);
      const at = this.artSolidAtLocal(mask, cos * inner, sin * inner) ? inner : r;
      return { x: cos * at, y: sin * at, r: at };
    }
    return null;
  }

  /** Is this art-local point on the drawing's pixels (untransformed frame)? */
  private artSolidAtLocal(mask: ArtMask, lx: number, ly: number): boolean {
    const R = this.level.radius;
    const u = Math.floor(((lx / R / mask.span) + 1) * 0.5 * mask.size);
    const v = Math.floor(((ly / R / mask.span) + 1) * 0.5 * mask.size);
    if (u < 0 || v < 0 || u >= mask.size || v >= mask.size) return false;
    return maskSolid(mask, u, v);
  }

  private worldPos(local: number, r: number) {
    const wa = local + this.rot;
    return { x: CX + Math.cos(wa) * r, y: this.targetY + Math.sin(wa) * r };
  }

  /**
   * Art-local point → world, through the exact transform the artwork is drawn
   * with (the boss' float/sway/breath/reaction, then the wheel angle). Every
   * spark, crack and burst is placed through this, so effects land on the
   * drawing instead of on a circle of radius R.
   */
  /**
   * The padding the face bitmap is blitted with, scaled by the same factor the
   * wheel itself has grown. Keeping the pad proportional is what makes the art
   * frame (mask, contour, impact points) equal to the drawn frame at any radius:
   * the grow ray scales the head, and the collision scales with it.
   */
  private facePadNow(R = this.level.radius): number {
    const pad = this.level.boss ? 40 : 4;
    const base = this.faceBaseR || R;
    return base > 0 ? pad * (R / base) : pad;
  }

  /**
   * The transform the wheel — and so the boss artwork — is really drawn with
   * this frame: Perfect Shot's entrance, the hit bump, the slide-11 kick, the
   * slide-9 shove and the slide-3 spring all move it. `render()` takes its
   * translate/scale from here, and the collision takes its inverse from here,
   * so the round stops where the drawing is and not where `targetY` used to be.
   */
  private wheelDrawFrame() {
    const R = this.level.radius;
    const entryT = this.wheelEntryT - this.wheelEntryDelayT;
    const entering = entryT < 1.16 * this.pace;
    const entry = entering ? perfectShotWheelEntry(entryT, this.pace, R) : RESTING_WHEEL_ENTRY;
    const wm = this.elevenMotion();
    const nk = this.nineKick();
    const sf = this.sevenWheel ? this.sevenWheel.feel : null;
    const sc = (entering ? 1 : this.wheelScale ?? 1) * (1 + this.bump * 0.035);
    const pulse = 1 + (sf?.pulseS ?? 0);
    return {
      x: CX + (wm?.dx ?? 0) + nk.x,
      y: this.targetY + entry.offsetY + this.bump * 7 + (wm?.dy ?? 0) + nk.y + (sf?.bumpY ?? 0),
      sx: sc * entry.scaleX * (wm?.sx ?? 1) * pulse,
      sy: sc * entry.scaleY * (wm?.sy ?? 1) * pulse,
    };
  }

  /**
   * Artwork space -> screen. The canvas applies, outermost first: the wheel
   * origin, the wheel scale, the boss' float/sway/breath/reaction, then the
   * wheel spin. So a point travels spin -> decor -> scale -> origin.
   */
  private artToWorld(lx: number, ly: number) {
    const cos = Math.cos(this.rot);
    const sin = Math.sin(this.rot);
    let x = lx * cos - ly * sin;
    let y = lx * sin + ly * cos;
    if (this.level.boss) {
      const p = bossMatApply(this.bossDecorMatrix(), x, y);
      x = p.x;
      y = p.y;
    }
    const f = this.wheelDrawFrame();
    return { x: f.x + x * f.sx, y: f.y + y * f.sy };
  }

  /**
   * Screen -> artwork space: the exact inverse of `artToWorld`, undo the wheel
   * origin, the scale, the boss' decor matrix and finally the wheel spin. Any
   * shortcut here (for example undoing the spin before the decor) leaves the
   * test up to 8 px away from the pixels the player sees.
   */
  private worldToArt(worldX: number, worldY: number) {
    const f = this.wheelDrawFrame();
    let x = (worldX - f.x) / (f.sx || 1);
    let y = (worldY - f.y) / (f.sy || 1);
    if (this.level.boss) {
      const p = bossMatApply(bossMatInvert(this.bossDecorMatrix()), x, y);
      x = p.x;
      y = p.y;
    }
    const cos = Math.cos(-this.rot);
    const sin = Math.sin(-this.rot);
    return { x: x * cos - y * sin, y: x * sin + y * cos };
  }

  /** returns true if a save was consumed */
  private trySave(p: Proj, spike: boolean): boolean {
    const w = this.weapon;
    if (this.savesLeft <= 0 || !w.saveFx) return false;
    // A slide-3 gun has no rescue perk: a blocked round is GAGAL, as there.
    if (this.setSevenLive) return false;
    if (w.saveSpikeOnly && !spike) return false;
    this.savesLeft--;
    const R = this.level.radius;
    switch (w.saveFx) {
      case 'return':
      case 'mirror':
      case 'bubble': {
        this.ammoLeft++;
        if (w.saveFx === 'bubble') {
          sfx2.pop();
          this.addText('🫧 POP! AMAN', p.x, p.y + 50, '#fbcfe8', 24);
          for (let i = 0; i < 16; i++) {
            const a = rand(0, TAU);
            const v = rand(80, 260);
            this.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6), max: 0.6, size: rand(2, 5), color: pick(['220,240,255', '255,200,240']), kind: 'glow', rot: 0, vr: 0, g: 0 });
          }
          this.particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 60, color: '#fbcfe8', kind: 'ring', rot: 0, vr: 0, g: 0 });
        } else {
          if (w.saveFx === 'mirror') sfx2.mirror();
          else sfx2.boomerang();
          this.addText(w.saveText ?? (w.saveFx === 'mirror' ? '🪞 MANTUL!' : '🪃 BALIK!'), p.x, p.y + 50, w.color, 24);
          this.flyers.push({ x: p.x, y: p.y + BLEN / 2, vx: rand(-120, 120), vy: 900, rot: Math.PI, vr: rand(14, 22), kind: 'bullet', w: w.id });
          for (let i = 0; i < 10; i++) {
            const a = rand(0, TAU);
            this.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 0.25, max: 0.25, size: 2, color: pick(w.sparks), kind: 'spark', rot: 0, vr: 0, g: 0 });
          }
        }
        return true;
      }
      case 'portal':
      case 'glitch': {
        const safe = this.safeAngle();
        const rgbA = w.saveFx === 'portal' ? '59,130,246' : '255,0,85';
        const rgbB = w.saveFx === 'portal' ? '251,146,60' : '0,255,238';
        const to = this.worldPos(safe, R + 20);
        this.portals.push({ x: p.x, y: p.y, life: 0.6, max: 0.6, rgb: rgbA });
        this.portals.push({ x: to.x, y: to.y, life: 0.6, max: 0.6, rgb: rgbB });
        if (w.saveFx === 'glitch') {
          this.glitchT = 0.35;
          sfx2.glitch();
        } else sfx2.warp();
        this.addText(w.saveFx === 'portal' ? '🌌 TELEPORT!' : '👾 LAG!', CX, CY + R + 70, w.color, 26);
        this.stickAt(safe);
        return true;
      }
    }
    return false;
  }

  /**
   * `ownVoice` / `ownFx`: false for a slide-11 shot, which already sounded
   * and painted its hit itself. Perks still score, but their slide-1 look
   * (lightning arcs, fire sparks, pop-up captions) never appears on slide 11.
   */
  private applyPerks(w: Weapon, hx: number, hy: number, R: number, ownVoice = true, ownFx = ownVoice) {
    if (w.explode) this.explodeAt(hx, hy, w.id === 'bazooka' ? 1.3 : w.id === 'bamboo' ? 1.2 : 1, w.explodeFx ?? 'fire');
    if (w.id === 'cricket') {
      this.particles.push({ x: hx, y: hy, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 180, color: '#7cc8ff', kind: 'ring', rot: 0, vr: 0, g: 0 });
      this.shake = Math.max(this.shake, 12);
    }
    if (w.chain && ownFx) {
      const others = this.items.filter((it) => it.type === 'bullet' || it.type === 'old').slice(0, -1);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      for (const it of others.slice(0, 4)) {
        const wa = it.angle + this.rot;
        this.particles.push({
          x: hx, y: hy, tx: CX + Math.cos(wa) * (R + 18), ty: this.targetY + Math.sin(wa) * (R + 18), vx: 0, vy: 0,
          life: 0.25, max: 0.25, size: 2, color: '#9be8ff', kind: 'bolt', rot: 0, vr: 0, g: 0,
        });
      }
      if (others.length) this.addText('⚡ SETRUM!', hx + rand(-50, 50), hy + 60, '#9be8ff', 20);
    }
    if (w.slow) {
      const water = w.id === 'soaker' || w.slowStyle === 'water';
      const honey = w.slowStyle === 'honey';
      if (!isSlide23Weapon(w.id)) {
        if (water || honey) sfx2.splat();
        else sfx.ice();
      }
      if (this.slowT <= 0) this.addText(w.slowText ?? '❄ BEKU!', hx + rand(-40, 40), hy + 60,
        honey ? '#ffd56c' : water ? '#93c5fd' : '#bff1ff', 24);
      this.applySlow(w.slowTime ?? 1.3, w.slowFactor ?? 0.3, w.slowRgb ?? '170,230,255',
        honey ? 'honey' : water ? 'water' : 'ice');
      // Both liquids already have their own splash and droplets in spawnImpact.
      if (w.id !== 'soaker' && w.id !== 'honey') for (let i = 0; i < 14; i++) {
        const a = rand(0, TAU);
        const v = rand(60, 260);
        this.particles.push({
          x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.8), max: 0.8,
          size: rand(2, 4), color: pick(water ? ['#ffffff', '#93c5fd', '#3b82f6'] : ['#ffffff', '#d6f6ff', '#9be7ff']), kind: 'chip', rot: rand(0, TAU), vr: rand(-10, 10), g: water ? 900 : 300,
        });
      }
    }
    if (w.luckyCoin && Math.random() < w.luckyCoin) {
      this.coins++;
      sfx.coin();
      this.addText(w.luckyText ?? '+1 💰 HOKI!', hx + rand(-40, 40), hy + 50, '#ffd23f', 20);
    }
    this.applyNewPerks(w, hx, hy, R, ownVoice, ownFx);
    if (w.id === 'fish') sfx.splash();
    if (w.pullCoins) {
      if (!isSlide23Weapon(w.id)) sfx.suck();
      const coins = this.items.filter((it) => it.type === 'coin');
      for (const it of coins) {
        const wa = it.angle + this.rot;
        const cx = CX + Math.cos(wa) * (R + 14);
        const cy = this.targetY + Math.sin(wa) * (R + 14);
        this.particles.push({
          x: cx, y: cy, tx: hx, ty: hy, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 3, color: '#d8b4fe', kind: 'bolt', rot: 0, vr: 0, g: 0,
        });
        this.collectCoin(it);
      }
      if (coins.length) this.addText('🕳 SEDOT!', hx, hy + 60, '#d8b4fe', 24);
      for (let i = 0; i < 16; i++) {
        const a = rand(0, TAU);
        const d = rand(40, 90);
        this.particles.push({
          x: hx + Math.cos(a) * d, y: hy + Math.sin(a) * d, vx: -Math.cos(a) * d * 3, vy: -Math.sin(a) * d * 3, life: 0.33, max: 0.33,
          size: rand(2, 5), color: '168,85,247', kind: 'glow', rot: 0, vr: 0, g: 0,
        });
      }
    }
  }

  private explodeAt(x: number, y: number, big: number, fx: 'fire' | 'white' | 'firework' = 'fire') {
    if (fx === 'firework') {
      this.fireworkAt(x, y);
      return;
    }
    if (this.weapon.id === 'bazooka') {
      this.shake = Math.max(this.shake, 12 * big);
      this.addText('DUAR!', x + rand(-30, 30), y + 50, '#ff9f1c', 30);
      return;
    }
    const white = fx === 'white';
    if (!isSlide23Weapon(this.weapon.id)) sfx.explosion();
    this.shake = Math.max(this.shake, 12 * big);
    this.flashWhite = Math.max(this.flashWhite, white ? 0.5 : 0.3);
    for (let i = 0; i < 30 * big; i++) {
      const a = rand(0, TAU);
      const v = rand(60, 380) * big;
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.7), max: 0.7,
        size: rand(6, 14), color: pick(white ? ['255,250,220', '255,230,150', '255,200,120'] : ['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -60,
      });
    }
    for (let i = 0; i < (white ? 22 : 12); i++) {
      this.particles.push({
        x: x + rand(-25, 25), y: y + rand(-20, 20), vx: rand(-110, 110), vy: rand(-130, 20), life: rand(0.8, 1.6), max: 1.6,
        size: rand(16, 34) * big, color: white ? 'rgba(245,245,245,' : 'rgba(70,70,70,', kind: 'smoke', rot: 0, vr: 0, g: -40,
      });
    }
    if (white) {
      for (let i = 0; i < 16; i++) {
        this.particles.push({ x, y, vx: rand(-300, 300), vy: rand(-350, 100), life: rand(0.5, 0.9), max: 0.9, size: rand(2, 4), color: pick(['#dc2626', '#fde047', '#ffffff']), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 900 });
      }
    }
    this.particles.push({ x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 150 * big, color: white ? '#ffffff' : '#ffb347', kind: 'ring', rot: 0, vr: 0, g: 0 });
    this.addText(white ? 'DUARR!!' : 'DUAR!', x + rand(-30, 30), y + 50, white ? '#ffffff' : '#ff9f1c', white ? 36 : 30);
  }

  private fireworkAt(x: number, y: number, hue?: number) {
    if (!isSlide23Weapon(this.weapon.id)) sfx3.fireworkBoom();
    this.shake = Math.max(this.shake, 8);
    const fw = this.getFwState();
    const h = hue ?? gunState.rocketHue ?? firework8ShotHue(this.level?.n ?? 1, fw.impactIdx);
    // Slide 2 has no extra flash ring here — the burst brings its own glow + shock ring.
    spawnFirework8StickBurst(fw, x, y, h);
  }

  private applySlow(time: number, factor: number, rgb: string, kind: 'ice' | 'water' | 'honey' | 'time') {
    this.slowT = time;
    this.slowF = factor;
    this.slowRgb = rgb;
    this.slowKind = kind;
  }

  private reverseSpin(text: string, x: number, y: number) {
    this.level.dir *= -1;
    sfx2.reverse();
    this.addText(text, x, y, '#fde047', 24);
    this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: this.level.radius * 2.6, color: '#fde047', kind: 'ring', rot: 0, vr: 0, g: 0 });
  }

  private applyNewPerks(w: Weapon, hx: number, hy: number, R: number, ownVoice = true, ownFx = ownVoice) {
    if (ownVoice && !isSlide23Weapon(w.id) && HIT_SFX[w.id]) HIT_SFX[w.id]!();
    const isPerk = (k: number) => this.perkCount > 0 && this.perkCount % k === 0;
    this.perkCount++;
    const ring = (color: string, size: number) =>
      this.particles.push({ x: hx, y: hy, vx: 0, vy: 0, life: 0.45, max: 0.45, size, color, kind: 'ring', rot: 0, vr: 0, g: 0 });

    if (w.burn) {
      if (this.burnT <= 0 && ownFx) this.addText(w.burnText ?? '🔥 TERBAKAR!', hx + rand(-40, 40), hy + 60, '#ff9f1c', 22);
      this.burnT = 2.6;
    }
    if (w.reverseChance && Math.random() < w.reverseChance) this.reverseSpin('🍌 TERPELESET!', hx + rand(-40, 40), hy + 70);
    if (w.reverseEvery && this.perkCount % w.reverseEvery === 0) this.reverseSpin('🌍 GRAVITASI BALIK!', hx, hy + 70);
    if (w.chronoEvery && this.perkCount % w.chronoEvery === 0) {
      sfx2.timestop();
      this.applySlow(1.2, 0, '250,220,120', 'time');
      this.addText(T('⏱ STOP WAKTU!'), CX, this.targetY, '#fde047', 30);
      this.flashWhite = Math.max(this.flashWhite, 0.25);
    }
    if (w.spikeOff) {
      this.spikeOffT = w.spikeOff;
      for (let i = 0; i < 3; i++) {
        this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.4 + i * 0.15, max: 0.4 + i * 0.15, size: R * (1.6 + i * 0.5), color: '#bef264', kind: 'ring', rot: 0, vr: 0, g: 0 });
      }
      if (this.items.some((it) => it.type === 'spike')) this.addText(w.spikeText ?? '🔊 DURI MASUK!', hx, hy + 70, w.color, 22);
    }
    if (w.pushSpikes) {
      const local = norm(Math.PI / 2 - this.rot);
      let pushed = false;
      for (const it of this.items) {
        if (it.type !== 'spike') continue;
        const d = norm(it.angle - local);
        const dd = d > Math.PI ? d - TAU : d;
        if (Math.abs(dd) < 1.3) {
          it.vel = (dd >= 0 ? 1 : -1) * 3.2;
          pushed = true;
        }
      }
      ring('#ef4444', 90);
      if (pushed) this.addText('🧲 TOLAK!', hx, hy + 70, '#fca5a5', 22);
    }
    if (w.shrink) {
      let any = false;
      for (const it of this.items) {
        if (it.type === 'bullet' || it.type === 'old') {
          if (it.w === 'sandal') continue; // keep the oversized sandal visibly chunky
          const before = it.scale ?? 1;
          it.scale = Math.max(0.45, before * 0.85);
          if (it.scale < before) any = true;
        }
      }
      for (let i = 0; i < 2; i++) this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: R * (2.8 - i * 0.6), color: '#4ade80', kind: 'ring', rot: 0, vr: 0, g: 0 });
      if (any) this.addText('🔬 MENGECIL!', hx, hy + 70, '#86efac', 22);
    }
    if (w.grow) {
      const base = this.level.boss ? 120 : 106;
      const before = this.targetR || this.level.radius;
      this.targetR = Math.min(base + 34, before + 6);
      if (this.targetR > before) this.addText('🔭 MEMBESAR!', hx, hy + 70, '#fdba74', 22);
      ring('#fb923c', R * 2.4);
    }
    if (w.snowman && isPerk(3)) {
      this.score += 3;
      sfx2.bloom();
      this.addText('⛄ MANUSIA SALJU +3', hx, hy + 70, '#e0f2fe', 24);
      for (let i = 0; i < 20; i++) {
        this.particles.push({ x: hx + rand(-30, 30), y: hy - rand(0, 40), vx: rand(-60, 60), vy: rand(-40, 40), life: rand(0.8, 1.4), max: 1.4, size: rand(2, 4), color: '#ffffff', kind: 'snowDust', rot: 0, vr: 0, g: 60 });
      }
    }
    if (w.breakSpike) {
      const local = norm(Math.PI / 2 - this.rot);
      const spikes = this.items.filter((it) => it.type === 'spike').sort((a, b) => angDiff(a.angle, local) - angDiff(b.angle, local));
      const sp = spikes[0];
      if (sp) {
        const p = this.worldPos(sp.angle, R + 10);
        this.items = this.items.filter((it) => it !== sp);
        this.flyers.push({ x: p.x, y: p.y, vx: rand(-200, 200), vy: -300, rot: sp.angle + this.rot - Math.PI / 2, vr: rand(-15, 15), kind: 'spike' });
        sfx2.crash();
        this.addText('🏴‍☠️ DURI HANCUR!', p.x, p.y - 20, '#e5e7eb', 22);
        for (let i = 0; i < 14; i++) {
          this.particles.push({ x: p.x, y: p.y, vx: rand(-250, 250), vy: rand(-250, 150), life: rand(0.4, 0.8), max: 0.8, size: rand(2, 5), color: pick(['#4b5563', '#9ca3af', '#ff3030']), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 900 });
        }
      }
      for (let i = 0; i < 8; i++) {
        this.particles.push({ x: hx + rand(-15, 15), y: hy, vx: rand(-80, 80), vy: rand(-60, 40), life: rand(0.6, 1.1), max: 1.1, size: rand(12, 22), color: 'rgba(120,120,120,', kind: 'smoke', rot: 0, vr: 0, g: -30 });
      }
    }
    if (w.randomBonus !== undefined) {
      const b = Math.floor(Math.random() * (w.randomBonus + 1));
      this.score += b;
      this.addText(b > 0 ? `KWEK! +${b}` : 'kwek...', hx + rand(-40, 40), hy + 70, b >= 4 ? '#fde047' : '#ffffff', 18 + b * 2);
    }
    if (w.jackpot && Math.random() < w.jackpot) {
      this.coins += 8;
      sfx2.jackpot();
      this.addText(w.jackpotText ?? '🂡 AS! JACKPOT +8 💰', CX, this.targetY + 10, '#fde047', 26);
      this.flashWhite = Math.max(this.flashWhite, 0.3);
      for (let i = 0; i < 24; i++) {
        const a = rand(0, TAU);
        const v = rand(150, 400);
        this.particles.push({ x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.5, 0.9), max: 0.9, size: rand(2, 4), color: pick(['#ffd23f', '#fff1a8', '#f59e0b']), kind: 'spark', rot: 0, vr: 0, g: 300 });
      }
    }
    if (w.confetti) {
      const cc = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c'];
      for (let i = 0; i < 30; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const v = rand(150, 450);
        this.particles.push({ x: hx, y: hy, vx: Math.cos(a) * v * 0.8, vy: Math.sin(a) * v * -0.6 + rand(-100, 50), life: rand(0.8, 1.4), max: 1.4, size: rand(3, 6), color: pick(cc), kind: 'chip', rot: rand(0, TAU), vr: rand(-25, 25), g: 350 });
      }
    }
    if (w.bossMult && this.level.boss) {
      this.score += w.points * (w.bossMult - 1);
      this.addText(`🐉 BOSS x${w.bossMult}!`, hx + rand(-30, 30), hy + 90, '#f87171', 22);
    }
    if ((w.burn || w.id === 'dragon') && ownFx) {
      for (let i = 0; i < 14; i++) {
        this.particles.push({ x: hx + rand(-10, 10), y: hy, vx: rand(-120, 120), vy: rand(-200, 40), life: rand(0.3, 0.6), max: 0.6, size: rand(5, 10), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -200 });
      }
    }
    if (w.rope && w.id !== 'yoyo') ring('#a5f3fc', 70);

    // ---------- wave 3 perks ----------
    if (w.notes) {
      const idx = Math.min(9, this.combo - 1);
      sfx3.note(idx);
      const noteCols = ['#fde68a', '#fca5a5', '#a5f3fc', '#bbf7d0', '#ddd6fe'];
      for (let i = 0; i < 3; i++) {
        this.particles.push({ x: hx + rand(-20, 20), y: hy, vx: rand(-60, 60), vy: rand(-160, -80), life: 1.1, max: 1.1, size: 18 + idx, color: pick(noteCols), kind: 'text', rot: 0, vr: 0, g: 0, text: pick(['♪', '♫', '♬']) });
      }
      const NAMES = ['da', 'mi', 'na', 'ti', 'la'];
      this.addText(NAMES[idx % 5].toUpperCase() + '♪', hx + rand(-40, 40), hy + 70, '#fde68a', 18 + idx * 1.5);
    }
    if (w.meltOld || (w.meltEvery && this.perkCount % w.meltEvery === 0)) {
      const local = norm(Math.PI / 2 - this.rot);
      const olds = this.items.filter((it) => it.type === 'old').sort((a, b) => angDiff(a.angle, local) - angDiff(b.angle, local));
      const o = olds[0];
      if (o) {
        const p = this.worldPos(o.angle, R + 14);
        this.items = this.items.filter((it) => it !== o);
        if (w.id === 'pencil') sfx4.erase();
        else if (w.id === 'holy') sfx4.purify();
        else sfx3.sizzle();
        const mc = w.meltColors ?? ['163,230,53', '190,242,100', '101,163,13'];
        this.addText(w.meltText ?? '🧪 MELELEH!', p.x, p.y - 20, `rgb(${mc[0]})`, 22);
        if (w.id === 'holy') {
          this.sink.push({ x: p.x, y: -20, tx: p.x, ty: p.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 5, color: '#fef9c3', kind: 'bolt', rot: 0, vr: 0, g: 0 });
          this.sink.light(p.x, p.y, 180, '255,240,180', 0.6);
        }
        for (let i = 0; i < 18; i++) {
          this.sink.push({ x: p.x + rand(-6, 6), y: p.y + rand(-8, 8), vx: rand(-40, 40), vy: rand(-120, -30), life: rand(0.5, 1), max: 1, size: rand(3, 7), color: pick(mc), kind: 'glow', rot: 0, vr: 0, g: -60, drag: 1.5 });
        }
        for (let i = 0; i < 8; i++) {
          this.sink.push({ x: p.x, y: p.y, vx: rand(-30, 30), vy: rand(-80, -20), life: rand(0.8, 1.4), max: 1.4, size: rand(8, 16), color: `rgba(${mc[0]},`, kind: 'smoke', rot: 0, vr: 0, g: -40 });
        }
      }
    }
    if (w.abductEvery && this.perkCount % w.abductEvery === 0) {
      const targets = this.items.filter((it) => it.type === 'spike' || it.type === 'old');
      const tg = targets.length ? pick(targets) : null;
      if (tg) {
        const p = this.worldPos(tg.angle, R + 16);
        this.items = this.items.filter((it) => it !== tg);
        sfx3.abduct();
        this.addText('🛸 DICULIK!', p.x, p.y - 30, '#86efac', 24);
        this.sink.light(p.x, p.y, 180, '134,239,172', 0.8);
        for (let i = 0; i < 26; i++) {
          this.sink.push({ x: p.x + rand(-14, 14), y: p.y - rand(0, 300), vx: rand(-10, 10), vy: rand(-500, -250), life: rand(0.4, 0.9), max: 0.9, size: rand(2, 5), color: '134,239,172', kind: 'glow', rot: 0, vr: 0, g: 0 });
        }
        for (let i = 0; i < 10; i++) {
          this.sink.push({ x: p.x + rand(-16, 16), y: rand(0, p.y), vx: 0, vy: -1600, life: 0.15, max: 0.15, size: rand(1.5, 3), color: 'rgba(187,247,208,0.9)', kind: 'streak', rot: 0, vr: 0, g: 0 });
        }
        this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.6, max: 0.6, size: 90, color: '134,239,172', kind: 'shock', rot: 0, vr: 0, g: 0 });
        // item floats up as a shard
        this.sink.push({ x: p.x, y: p.y, vx: 0, vy: -200, life: 1, max: 1, size: 10, color: tg.type === 'spike' ? '#ff3030' : '#8b6a5a', kind: 'shard', rot: 0, vr: 8, g: -500 });
      }
    }
    if (w.trailFx === 'rainbow' && this.combo >= 3) {
      this.coins += 1;
      this.addText('🌈 COMBO PELANGI +1 💰', hx, hy + 90, '#f9a8d4', 18);
    }
    if (w.id === 'storm') {
      // lightning strike from sky
      this.sink.push({ x: hx + rand(-20, 20), y: -20, tx: hx, ty: hy, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 4, color: '#dbeafe', kind: 'bolt', rot: 0, vr: 0, g: 0 });
      this.flashWhite = Math.max(this.flashWhite, 0.35);
    }
    if (w.id === 'meteor') {
      this.sink.push({ x: hx - 160, y: -40, tx: hx, ty: hy, vx: 0, vy: 0, life: 0.15, max: 0.15, size: 5, color: '#fb923c', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    }

    // ---------- wave 4 perks ----------
    if (w.everyBonus && this.perkCount % w.everyBonus.n === 0) {
      this.score += w.everyBonus.pts;
      sfx2.jackpot();
      this.addText(w.everyBonus.text, CX, this.targetY + 10, '#fda4af', 28);
      this.flashWhite = Math.max(this.flashWhite, 0.2);
      for (let i = 0; i < 18; i++) {
        const a = rand(0, TAU);
        this.sink.push({ x: hx, y: hy, vx: Math.cos(a) * rand(150, 380), vy: Math.sin(a) * rand(150, 380), life: rand(0.5, 0.9), max: 0.9, size: rand(4, 8), color: pick(['#fecdd3', '#e11d48', '#ffffff', '#fde047']), kind: 'star', rot: 0, vr: 0, g: 0, drag: 2.5 });
      }
    }
    if (w.transmute && Math.random() < w.transmute) this.transmuteOne(hx, hy, R, '✨ SIM SALABIM!');
    if (w.obliterate) this.obliterateAt(hx, hy, R, w.obliterate);
    if (w.randomMagic) {
      const roll = Math.floor(Math.random() * 5);
      sfx4.magic();
      if (roll === 0) {
        this.applySlow(1.3, 0.35, '250,190,240', 'ice');
        this.addText('🦄 BEKU AJAIB!', hx, hy + 70, '#f0abfc', 22);
      } else if (roll === 1) this.reverseSpin('🦄 PUTAR BALIK!', hx, hy + 70);
      else if (roll === 2) {
        this.coins += 2;
        sfx.coin();
        this.addText('🦄 +2 💰', hx, hy + 70, '#fde047', 24);
      } else if (roll === 3) {
        this.spikeOffT = 1.8;
        this.addText('🦄 DURI HILANG!', hx, hy + 70, '#c4b5fd', 22);
      } else this.transmuteOne(hx, hy, R, T('🦄 JADI KOIN!'));
      const RBC = ['248,113,113', '251,146,60', '250,204,21', '74,222,128', '96,165,250', '192,132,252'];
      for (let i = 0; i < 6; i++) this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5 + i * 0.06, max: 0.5 + i * 0.06, size: R * (1.4 + i * 0.25), color: RBC[i], kind: 'shock', rot: 0, vr: 0, g: 0 });
    }
  }

  private transmuteOne(hx: number, hy: number, R: number, text: string) {
    const local = norm(Math.PI / 2 - this.rot);
    const cands = this.items.filter((it) => it.type === 'old' || it.type === 'spike').sort((a, b) => angDiff(a.angle, local) - angDiff(b.angle, local));
    const tg = cands[0];
    if (!tg) return;
    const p = this.worldPos(tg.angle, R + 14);
    tg.type = 'coin';
    tg.age = 10;
    tg.w = undefined;
    tg.scale = undefined;
    sfx4.salabim();
    this.addText(text, p.x, p.y - 24, '#f5d0fe', 22);
    this.sink.light(p.x, p.y, 140, '233,213,255', 0.5);
    this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 70, color: '233,213,255', kind: 'shock', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU);
      this.sink.push({ x: p.x, y: p.y, vx: Math.cos(a) * rand(80, 260), vy: Math.sin(a) * rand(80, 260), life: rand(0.5, 0.9), max: 0.9, size: rand(3, 7), color: pick(['#ffffff', '#f5d0fe', '#fde047']), kind: 'star', rot: 0, vr: 0, g: 0, drag: 2.5 });
    }
    for (let i = 0; i < 8; i++) {
      this.sink.push({ x: p.x + rand(-6, 6), y: p.y + rand(-6, 6), vx: rand(-30, 30), vy: rand(-60, 0), life: rand(0.6, 1), max: 1, size: rand(8, 14), color: 'rgba(233,213,255,', kind: 'smoke', rot: 0, vr: 0, g: -30 });
    }
    void hx;
    void hy;
  }

  private obliterateAt(hx: number, hy: number, R: number, n: number) {
    const targets = this.items.filter((it) => it.type === 'spike' || it.type === 'old');
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    const kill = targets.slice(0, n);
    // tendrils to everything nearby (visual), destroy chosen
    for (const it of this.items) {
      if (it.type === 'coin') continue;
      const p = this.worldPos(it.angle, R + 16);
      this.sink.push({ x: hx, y: hy, tx: p.x, ty: p.y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: kill.includes(it) ? 4 : 2, color: '#86efac', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    }
    for (const it of kill) {
      const p = this.worldPos(it.angle, R + 14);
      this.items = this.items.filter((x) => x !== it);
      this.flyers.push({ x: p.x, y: p.y, vx: rand(-300, 300), vy: rand(-450, -200), rot: it.angle + this.rot - Math.PI / 2, vr: rand(-20, 20), kind: it.type, w: it.w });
      this.sink.light(p.x, p.y, 160, '74,222,128', 0.5);
      this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 80, color: '134,239,172', kind: 'shock', rot: 0, vr: 0, g: 0 });
      for (let i = 0; i < 12; i++) {
        const a = rand(0, TAU);
        this.sink.push({ x: p.x, y: p.y, vx: Math.cos(a) * rand(100, 320), vy: Math.sin(a) * rand(100, 320), life: rand(0.4, 0.8), max: 0.8, size: rand(3, 7), color: pick(['74,222,128', '187,247,208', '255,255,255']), kind: 'glow', rot: 0, vr: 0, g: 0, drag: 2 });
      }
    }
    this.flashWhite = Math.max(this.flashWhite, 0.45);
    this.tintA = Math.max(this.tintA, 0.5);
    this.tintRgb = '74,222,128';
    this.sink.light(CX, this.targetY, R * 4, '74,222,128', 0.8);
    this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.8, max: 0.8, size: R * 3.6, color: '74,222,128', kind: 'shock', rot: 0, vr: 0, g: 0 });
    this.addText(kill.length ? `☢️ ${kill.length}x DIMUSNAHKAN!` : '☢️ OBLITERATE!', CX, this.targetY - 10, '#86efac', 30);
  }

  private airBlast(x: number, y: number, k: number) {
    // Ported 100% from game-3 airBlast()
    this.sink.light(x, y, 160 * k, '255,255,255', 0.2);
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.32, max: 0.32, size: 10, color: '255,255,255', kind: 'ring', rot: 0, vr: 0, g: 0 });
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 6, color: '159,220,255', kind: 'ring', rot: 0, vr: 0, g: 0 });
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.35, max: 0.35, size: 20, color: '255,255,255', kind: 'ringE', rot: 0, vr: 0, g: 0 });
    // star burst
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.22, max: 0.22, size: 90 * k, color: '#fff4a0', kind: 'star', rot: 0, vr: 0, g: 0 });
    // manga speed lines radiating out of the slam (game-3 'speed' particle)
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.28, max: 0.28, size: 240 * k, color: '#ffffff', kind: 'speed', rot: 0, vr: 0, g: 0 });
    // 22 puff particles in a ring
    const n = Math.round(22 * k);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rand(-0.1, 0.1);
      const sp = rand(220, 420) * k;
      this.sink.push({ x: x + Math.cos(a) * 10, y: y + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 0.6 + 40, life: rand(0.6, 1.1), max: 1.1, size: rand(14, 26), color: '#ffffff', kind: 'puff', rot: rand(0, TAU), vr: rand(-3, 3), g: 0, drag: 3 });
    }
    // 10 large puffs
    for (let i = 0; i < 10; i++) this.sink.push({ x: x + rand(-20, 20), y: y + rand(-5, 10), vx: rand(-60, 60), vy: rand(-40, 40), life: rand(0.9, 1.4), max: 1.4, size: rand(22, 40), color: '#f4f8ff', kind: 'puff', rot: rand(0, TAU), vr: rand(-1.5, 1.5), g: 0, drag: 2.5 });
    // wood dust + splinters
    for (let i = 0; i < 14; i++) this.sink.push({ x: x + rand(-20, 20), y: y + rand(-10, 5), vx: rand(-120, 120), vy: rand(-60, 60), life: rand(0.8, 1.4), max: 1.4, size: rand(12, 24), color: '#a67c4a', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 2 });
    // ash particles
    for (let i = 0; i < 26; i++) this.sink.push({ x, y, vx: rand(-420, 420), vy: rand(-520, 100), life: rand(0.8, 1.6), max: 1.6, size: rand(3, 8), color: pick(['#d9b47a', '#9a6a36', '#5a3a1a']), kind: 'chip', rot: 0, vr: rand(-18, 18), g: 1100, drag: 0.5 });
    // wind burst
    for (let i = 0; i < 30; i++) {
      const a = Math.PI / 2 + rand(-Math.PI, 0);
      const sp = rand(300, 800);
      this.sink.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.3, max: 0.3, size: 18, color: '#ffffff', kind: 'wind', rot: 0, vr: 0, g: 0, drag: 1.5 });
    }
    // text
    this.sink.push({ x: x + 60 * (Math.random() < 0.5 ? 1 : -1), y: y - 50, vx: 0, vy: -70, life: 0.8, max: 0.8, size: 40 * k, color: '#ffd23a', kind: 'text', rot: rand(-0.25, 0.25), vr: 0, g: 0, text: pick(['DOKAN!', 'BAM!', 'DUARR!']) });
  }

  private plasmaImpact(x: number, y: number, k: number) {
    // Ported 100% from game-3 plasmaImpact()
    const down = Math.PI / 2;
    this.sink.light(x, y, 260 * k, '10,42,74', 0.4);
    this.sink.light(x, y, 170 * k, '111,211,255', 0.3);
    this.sink.light(x, y, 90 * k, '255,255,255', 0.16);
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 360 * k, color: '111,211,255', kind: 'shock', rot: 0, vr: 0, g: 0 });
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.2, max: 0.2, size: 120 * k, color: '255,255,255', kind: 'star', rot: 0, vr: 0, g: 0 });
    [[520, 0.34, '111,211,255'], [760, 0.46, '255,255,255'], [1000, 0.6, '10,42,74']].forEach(([g, m, col]) =>
      this.sink.push({ x, y, vx: 0, vy: 0, life: m as number, max: m as number, size: 8, color: col as string, kind: 'ring', rot: 0, vr: 0, g: 0 }));
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.35, max: 0.35, size: 14, color: '255,255,255', kind: 'ringE', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 12; i++) this.sink.push({ x, y, vx: Math.cos(down + rand(-1.7, 1.7)) * rand(50, 140) * k, vy: Math.sin(down + rand(-1.7, 1.7)) * rand(50, 140) * k, life: rand(0.12, 0.3), max: 0.3, size: 3, color: i % 2 ? '255,255,255' : '111,211,255', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 5; i++) this.sink.push({ x, y, vx: Math.cos(-down + rand(-0.8, 0.8)) * rand(40, 90), vy: Math.sin(-down + rand(-0.8, 0.8)) * rand(40, 90), life: rand(0.1, 0.2), max: 0.2, size: 2, color: '111,211,255', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 60 * k; i++) { const a = down + rand(-1.5, 1.5); const sp = rand(300, 1000); this.sink.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5, max: 0.5, size: 2, color: pick(['255,255,255', '111,211,255', '255,122,32']), kind: 'spark', rot: 0, vr: 0, g: 500, drag: 3 }); }
    for (let i = 0; i < 30 * k; i++) { const a = down + rand(-1.6, 1.6); const sp = rand(80, 420); this.sink.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2, max: 1.2, size: 2.2, color: pick(['255,176,96', '255,112,48', '255,210,122']), kind: 'glow', rot: 0, vr: 0, g: 200, drag: 1.5 }); }
    for (let i = 0; i < 12; i++) this.sink.push({ x: x + rand(-40, 40), y: y + rand(-10, 40), vx: 0, vy: 0, life: rand(0.2, 0.4), max: 0.4, size: rand(12, 26), color: '232,253,255', kind: 'star', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 14; i++) this.sink.push({ x: x + rand(-24, 24), y: y + rand(0, 14), vx: rand(-90, 90), vy: rand(-30, 60), life: rand(1.2, 2.2), max: 2.2, size: rand(18, 34), color: '42,52,66', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 1.5 });
    for (let i = 0; i < 20; i++) this.sink.push({ x, y, vx: rand(-380, 380), vy: rand(-480, 80), life: rand(0.8, 1.5), max: 1.5, size: rand(3, 7), color: pick(['28,20,16', '74,48,32', '217,180,122']), kind: 'ash', rot: 0, vr: rand(-16, 16), g: 1000 });
  }

  /** One short, visual-only effect-3 molecular wave for the hybrid's impact. */
  private xenoMolecularImpact(x: number, y: number) {
    this.particles.push({ x, y, vx: 0, vy: 0, life: 0.95, max: 0.95, size: 1,
      color: '200,255,90', kind: 'xenoMolecular', rot: 0, vr: 0, g: 0 });
  }

  private splash(x: number, y: number, k: number) {
    // Ported 100% from game-3 splash() (acid)
    const down = Math.PI / 2;
    this.sink.light(x, y, 110 * k, '182,255,26', 0.28);
    this.sink.light(x, y, 50, '255,255,255', 0.12);
    this.sink.push({ x, y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 8, color: '182,255,26', kind: 'ring', rot: 0, vr: 0, g: 0 });
    // pancake: blobs sliding sideways along the rim then falling
    for (let i = 0; i < 10; i++) {
      const side = i % 2 ? 1 : -1;
      this.sink.push({ x: x + side * i * 2, y: y + 2, vx: side * rand(90, 420) * k, vy: rand(-60, 20), life: rand(0.5, 0.9), max: 0.9, size: rand(4, 8), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1300, drag: 0.15 });
    }
    // main fan of drops (bounce downward/sideways)
    for (let i = 0; i < 48 * k; i++) {
      const a = down + rand(-1.55, 1.55);
      const s = rand(120, 640) * k;
      this.sink.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.7, 1.4), max: 1.4, size: rand(1.8, 5.2), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1100, drag: 0.15 });
    }
    // sprays upward (ricochet over the rim)
    for (let i = 0; i < 10; i++) this.sink.push({ x: x + rand(-10, 10), y, vx: rand(-240, 240), vy: rand(-420, -120), life: rand(0.5, 1), max: 1, size: rand(1.5, 3.2), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1100, drag: 0.15 });
    for (let i = 0; i < 18; i++) this.sink.push({ x: x + rand(-20, 20), y: y + rand(0, 10), vx: rand(-50, 50), vy: rand(-90, -20), life: rand(1.4, 2.6), max: 2.6, size: rand(12, 26), color: pick(['143,194,58', '200,255,90', '90,122,42']), kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 2 });
    for (let i = 0; i < 14; i++) this.sink.push({ x: x + rand(-18, 18), y: y + rand(-6, 6), vx: rand(-20, 20), vy: rand(-30, 10), life: rand(0.3, 0.8), max: 0.8, size: rand(1.5, 4), color: '155,209,58', kind: 'bubble', rot: 0, vr: 0, g: 0, grow: 6 });
    for (let i = 0; i < 14; i++) { const a = down + rand(-1.6, 1.6); const sp = rand(100, 400); this.sink.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4, max: 0.4, size: 1.5, color: pick(['255,255,255', '155,209,58']), kind: 'spark', rot: 0, vr: 0, g: 700, drag: 3 }); }
  }

  /**
   * True while slide 1 flies its own (game-3) xenomorph glob. Slide 11's acid
   * spitter paints its own glob, trail and drips on its round; growing the
   * game-3 metaball glob around that carrier as well drew two globs per shot.
   */
  private get ownXenoGlob(): boolean {
    return this.weapon.id === 'xeno' && !this.setElevenLive;
  }

  /** True while the acid layer has something to composite. */
  private hasAcidLayer(): boolean {
    if (this.ownXenoGlob && this.projs.length) return true;
    for (const p of this.particles) if (p.kind === 'acid') return true;
    for (const it of this.items) if (it.acid) return true;
    return false;
  }

  /**
   * Collect every acid source as metaballs, ported 1:1 from game-3
   * collectBlobs(): flying glob (head + body + tail + sampled trail), free
   * droplets, and the blobs stuck on the wheel (sagging, wobbling + drip).
   */
  private collectAcidBlobs() {
    const fluid = this.acidFluid;
    fluid.begin();
    const t = this.time;
    // Match the transform used by render(): the wheel bobs and breathes, so the
    // acid stuck to it must ride along or it would drift off the rim.
    const wScale = (this.wheelScale ?? 1) * (1 + this.bump * 0.035);
    const cy = this.targetY + this.bump * 7;
    const R = this.level.radius * wScale;

    if (this.ownXenoGlob) {
      for (const p of this.projs) {
        if (p.spawnDelay && p.spawnDelay > 0) continue;
        const pt = p.t ?? 0;
        fluid.add(p.x, p.y, 13);
        fluid.add(p.x, p.y + 9, 11);
        fluid.add(p.x + Math.sin(pt * 40) * 1.5, p.y + 19, 8.5);
        const trail = p.trail ?? [];
        for (let i = 2; i < trail.length; i++) {
          const k = i / trail.length;
          const tp = trail[i];
          fluid.add(tp.x + Math.sin(i * 1.7 + pt * 25) * k * 3, tp.y + 24 + i * 3, 7.5 * (1 - k) + 1.5);
        }
      }
    }

    for (const p of this.particles) {
      if (p.kind !== 'acid') continue;
      const k = p.life / p.max;
      const r = p.size * (k < 0.75 ? 1 : 1 - (k - 0.75) / 0.25);
      if (r < 0.6) continue;
      fluid.add(p.x, p.y, r);
      // teardrop streak along the velocity
      const sp = Math.hypot(p.vx, p.vy);
      if (sp > 150 && r > 1.5) {
        const f = Math.min(0.03, 6 / sp);
        fluid.add(p.x - p.vx * f, p.y - p.vy * f, r * 0.65);
      }
    }

    for (const it of this.items) {
      if (!it.acid || it.type !== 'bullet') continue;
      const a = it.angle + this.rot;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const surfaceR = this.level.boss
        ? (it.px !== undefined && it.py !== undefined ? Math.hypot(it.px, it.py) : this.bossRadiusAt(it.angle)) * wScale
        : R;
      const sag = Math.min(1, it.age / 1.2);
      for (const b of it.acid.blobs) {
        const wob = Math.sin(t * 3 + b.ph) * 1.2;
        const d = surfaceR + b.d * (0.6 + 0.4 * sag) + wob;
        const sd = b.s + Math.cos(t * 2.5 + b.ph) * 0.8;
        fluid.add(CX + ca * d - sa * sd, cy + sa * d + ca * sd, b.r);
      }
      if (it.acid.drip > 0) {
        const bx = CX + ca * (surfaceR + 8);
        const by = cy + sa * (surfaceR + 8);
        fluid.add(bx, by + it.acid.drip * 0.5, 3.5);
        fluid.add(bx, by + it.acid.drip, 3 + it.acid.drip * 0.12);
      }
    }
  }

  /**
   * Slide 11's aim pass, painted where slide 11 paints it: after the wheel and
   * under the gun. Its targeting overlay (laser sight, three-dot lock, beacon
   * designator) runs only while a stage is live; its channel beam joins the
   * muzzle to the wheel for as long as the channel still glows.
   */
  private drawElevenAim(c: CanvasRenderingContext2D) {
    const fx = this.s11State;
    if (!fx) return;
    const live = this.setElevenLive;
    if (!live && !fx.busy) return;
    try {
      if (live && this.state === 'play' && this.level.mode !== 'treasure') fx.drawOverlay(c);
      fx.drawBeam(c);
    } catch {
      /* keep drawing slide 1 */
    }
  }

  /**
   * Slide 7's entry holes and scorch marks and slide 5's marks, drawn right
   * after the wheel, as both slides draw them.
   */
  private drawLayerWheels(c: CanvasRenderingContext2D) {
    // Every one of these layers paints its marks on the rim of its own wheel:
    // `translate(radius, 0)` for each embed. A boss is not that wheel, so its
    // marks would land in the empty sky around the head at exactly radius R —
    // the circle this stage must never show. On a boss the shared renderer
    // draws each round at its exact impact pixel instead, and the layer keeps
    // its screen-space bursts (which are already at the contact point).
    if (this.level.boss) return;
    if (this.s11State && (this.s11State.busy || this.setElevenLive)) {
      // A bad frame from slide 7's own art must not blank slide 1.
      try {
        this.s11State.drawWheel(c, CX, this.targetY + this.bump * 7, this.level.radius, this.rot,
          this.elevenMotion() ?? undefined);
      } catch {
        /* keep drawing slide 1 */
      }
    }
    if (this.s9State && (this.s9State.busy || this.setNineLive)) {
      // A bad frame from slide 5's own art must not blank slide 1.
      try {
        const nk = this.nineKick();
        this.s9State.drawWheel(c, CX + nk.x, this.targetY + this.bump * 7 + nk.y, this.level.radius, this.rot);
      } catch {
        /* keep drawing slide 1 */
      }
    }
  }

  /**
   * Slide 5's beams, sparks and free rounds, then the rounds slide 1 carries
   * (slide 5 paints its rounds over their own sparks), all under its gun.
   */
  private drawNineLayer(c: CanvasRenderingContext2D) {
    if (!this.s9State || !(this.s9State.busy || this.setNineLive)) return;
    try {
      this.s9State.draw(c);
      for (const p of this.projs) {
        if (p.setNine && this.s9State.isCarried(p.setNine)) {
          this.drawCarriedRound(c, p, () => {
            // DEADBLAST: slide-6's repulsor beam (effect #3) rides under
            // slide-9's own round (effect #5), muzzle to round.
            if (p.comboBeam) drawIronmanCombo(c, p.x, p.y, this.time, () => this.s9.drawShot(c, p.setNine!), p.comboBeam);
            else this.s9.drawShot(c, p.setNine!);
          });
        }
      }
    } catch {
      /* keep drawing slide 1 */
    }
  }

  /**
   * Predator shoulder-caster tri-laser (game-3 drawTriLaser): three faint red
   * beams converge on a lock-on triangle of dots on the target, tightening into
   * a reticle while the core charges.
   */
  private drawTriLaser(c: CanvasRenderingContext2D) {
    if (this.state !== 'play' || this.weapon.id !== 'pred' || this.level.mode === 'treasure') return;
    // Slide 11's shoulder caster locks on with its own three red dots, from its
    // own laser module (`drawElevenAim`); this game-3 tri-laser starts where
    // the game-3 cannon's module sits and floated beside the slide-11 gun.
    if (this.setElevenLive || this.setNineLive) return;
    const t = this.time;
    const ch = this.charging ? Math.min(1, this.chargeT) : 0;
    const ap = { x: CX, y: this.targetY + this.level.radius - 18 };
    const lift = -this.spin * 6 + this.recoil * 8;
    const ex = CX - 50;
    const ey = GUN_Y - 92 + this.recoil * 14 + lift + 15;
    const jitter = () => (Math.random() - 0.5) * (1.2 - ch);
    const spreadR = 10 + (1 - ch) * 14 + Math.sin(t * 2) * 2;
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2 + t * 0.6;
      const dx = ap.x + Math.cos(a) * spreadR + jitter();
      const dy = ap.y + 8 + Math.sin(a) * spreadR * 0.45 + jitter();
      const g = c.createLinearGradient(ex, ey, dx, dy);
      g.addColorStop(0, 'rgba(255,30,30,0.45)');
      g.addColorStop(0.5, 'rgba(255,30,30,0.12)');
      g.addColorStop(1, 'rgba(255,30,30,0.5)');
      c.strokeStyle = g;
      c.lineWidth = 1.2 + ch * 0.6;
      const eo = [[-5, 2], [5, 2], [0, -4]][i];
      c.beginPath();
      c.moveTo(ex + eo[0], ey + eo[1]);
      c.lineTo(dx, dy);
      c.stroke();
      drawGlow(c, dx, dy, 9 + ch * 4, '#ff1e1e', 0.9);
      drawGlow(c, dx, dy, 3, '#ffffff', 0.9);
      c.fillStyle = '#ff5050';
      c.beginPath();
      c.arc(dx, dy, 1.6, 0, TAU);
      c.fill();
    }
    c.strokeStyle = `rgba(255,30,30,${0.25 + ch * 0.5})`;
    c.lineWidth = 1;
    c.beginPath();
    for (let i = 0; i <= 3; i++) {
      const a = (i / 3) * TAU - Math.PI / 2 + t * 0.6;
      const x = ap.x + Math.cos(a) * spreadR;
      const y = ap.y + 8 + Math.sin(a) * spreadR * 0.45;
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    }
    c.stroke();
    if (ch > 0) {
      c.strokeStyle = `rgba(255,30,30,${ch * 0.8})`;
      c.lineWidth = 1.5;
      const r = 26 - ch * 10;
      c.beginPath();
      c.ellipse(ap.x, ap.y + 8, r, r * 0.45, 0, 0, TAU);
      c.stroke();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + t * 3;
        c.beginPath();
        c.moveTo(ap.x + Math.cos(a) * r * 0.8, ap.y + 8 + Math.sin(a) * r * 0.36);
        c.lineTo(ap.x + Math.cos(a) * r * 1.3, ap.y + 8 + Math.sin(a) * r * 0.58);
        c.stroke();
      }
    }
    c.restore();
  }

  private stickAt(local: number, p?: Proj, surfaceR?: number, hitX?: number, hitY?: number) {
    const R = this.level.radius;
    const w = this.weapon;
    const big = p?.big ?? 0;
    const tint = p?.tint;
    /** SET 1 impact burst: slide 7's own recipe replaces slide 1's signature burst. */
    const s1Hit = this.setOneLive && p?.setOne ? p.setOne : null;
    /** SET 2..5 impact burst: slide 7's own `hit()` on its own round. */
    const s7Hit = this.setSevenLive && p?.setSeven ? p.setSeven : null;
    /** Slide 6 impact: its own beam burst plus the scorch mark it leaves. */
    const s6Hit = this.setSixLive && p?.setSix ? true : false;
    /** Slide 9 impact: its own `onImpact()` plus the entry hole it paints. */
    const s9Hit = this.setNineLive && p?.setNine ? p.setNine : null;
    /** Slide 11 impact: its own `onHit()` burst and its wheel embeds. */
    const s11Hit = this.setElevenLive && p?.setEleven ? p.setEleven : null;
    /** Slide 2 impact: its own `stick()` burst for the weapon that fired. */
    const s2Hit = this.setTwoLive && p?.setTwo ? p.setTwo : null;
    /**
     * A burst gun fires one round per pellet on slide 1 but exactly one on
     * slide 7 (the shotgun's nine pellets live inside that one blast). The
     * extra carriers still score — that is how slide 1 has always counted a
     * burst — but they must not leave a second bullet stuck in the wheel.
     */
    const s7GhostHit = this.setSevenLive && p?.s7Ghost ? true : false;
    // A slide-9 / slide-11 gun whose own round has not been released yet (beam
    // weapons, charged staffs, drums) still flies slide 1's carrier into the
    // wheel. That carrier must not leave a slide-1 bullet hole: the layer owns
    // the impact, exactly like it owns the shot.
    const s9Pending = this.setNineLive && p?.setNinePending ? true : false;
    const s11Pending = this.setElevenLive && p?.setElevenPending ? true : false;
    // An extra pellet slide 11 never fired (or a carrier whose round never
    // came) still scores, but it is invisible on slide 11: no slide-1 bullet,
    // crack, burst or voice may appear where it lands either.
    const s11GhostHit = this.setElevenLive && p?.s11Ghost ? true : false;
    // The same for slide 9: an extra pellet it never fired scores invisibly,
    // and a beam's carrier only scores — slide 9's beam bursts on its own.
    const s9GhostHit = this.setNineLive && p?.s9Ghost ? true : false;
    const s9BeamHit = this.setNineLive && p?.setNineBeam !== undefined ? true : false;
    // Slide 7's own `hit()` calls `landed()`, which draws the stuck round with
    // `drawStuckItem()`; slide 1 keeps its collision entry (spikes, coins, the
    // clear counter) but must not paint a second round on top of it.
    const layerHit = !!(s6Hit || s7Hit || s7GhostHit || s9Hit || s11Hit || s9Pending || s11Pending || s11GhostHit
      || s2Hit || s9GhostHit || s9BeamHit);
    // A slide-11 shot moves the wheel and the screen with slide 11's own
    // reaction only — the kick and squash, the warm flash, the jolt and the
    // hit-stop its `g.hit()` gives, sized by the weapon (a pistol round barely
    // nudges it, the plasma dome slams it). Every one of slide 1's own
    // reactions on top (bump, white flash, shake, camera kick, screen tint,
    // hit-stop) doubled or replaced it.
    const elevenHit = !!(s11Hit || s11Pending || s11GhostHit);
    // A slide-9 shot moves the wheel and the screen with slide 9's own
    // reaction only (its burst, recoil spring, jolt, flash and hit-stop).
    const nineHit = !!(s9Hit || s9Pending || s9GhostHit || s9BeamHit);
    // A slide-3 shot ("Slide 3" card) reacts the slide-3 way only: its own
    // `hit()` already kicked the wheel's spring, flashed its rim, shook the
    // screen and voiced the hit. Slide 1's bump, flashes, freeze, camera kick,
    // combo beep, perks (slow, burn, chain, explode, lucky coin…) and the
    // extra bursts of other slides' guns are not part of slide 3.
    const sevenHit = this.setSevenLive && !!(p?.setSeven || p?.s7Ghost || p?.setSevenPending);
    const layerFeel = elevenHit || nineHit || sevenHit;
    const impact = hitX !== undefined && hitY !== undefined
      ? this.artToWorld(hitX, hitY)
      : this.worldPos(local, surfaceR ?? R);
    if (this.level.boss && hitX !== undefined && hitY !== undefined) {
      // Light the exact spot on the outline that just stopped this round.
      this.bossEdgePing.push({ a: Math.atan2(hitY, hitX), born: this.time });
      if (this.bossEdgePing.length > 12) this.bossEdgePing.shift();
    }
    const hue = s2Hit ? s2Hit.hue : p?.hue ?? (w.id === 'firework' ? gunState.rocketHue : w.id === 'yoyo' ? gunState.yoyoHue : undefined);
    if (w.id === 'firework' && hue !== undefined) gunState.rocketHue = hue;
    if (w.id === 'yoyo' && hue !== undefined) gunState.yoyoHue = hue;
    // Only the real uncharged yellow shot remains visible as a plasma-like
    // orb. The larger blue charge shots keep their own existing impact art.
    const busterPellet = w.id === 'mega_buster' && !!s11Hit && big === 0;
    this.items.push({
      angle: local,
      type: 'bullet',
      age: 0,
      r: surfaceR,
      // The exact point the round bit into, in the target's own frame. The
      // renderer places the round here, so a stuck bullet can never slide onto
      // a radius while the boss turns.
      px: hitX,
      py: hitY,
      ghostVolley: p?.ghostVolley,
      w: w.id,
      big,
      tint,
      hue,
      flash: w.id === 'firework' || w.id === 'yoyo' || w.id === 'diamond' || w.id === 'bazooka' ? 1 : undefined,
      scale: busterPellet ? projectileSizeMultiplier(w.id, !!p?.mini, !!p?.giant)
        : big ? embeddedProjectileScale(big) : undefined,
      busterPellet: busterPellet || undefined,
      // Slide 9 / slide 11 / slide 2 paint their own round into the wheel, so
      // the slide-1 bullet art must not be drawn on top of it. On a boss those
      // layers would paint it on their own rim, radius R — a disc the boss does
      // not have — so there the shared renderer draws the round instead, at the
      // exact pixel this round bit (`px`, `py`), on the blue outline.
      hideArt: layerHit && !this.level.boss ? true : undefined,
      // Slide 2's artist draws the stuck round itself (see `setTwoLook.ts`).
      setTwo: s2Hit ? true : undefined,
    });
    this.stuck++;
    // The game-3 hit FX below (plasma impact, acid glob + splash) belong to
    // slide 1's own shot. When slide 11 owns the impact — its xenomorph and its
    // shoulder caster — slide 11 bursts, marks and sounds the hit itself;
    // running both sprayed a second, game-3 acid splash (and acid globs stuck
    // on the rim) or a second plasma blast, plus a second hit voice, over
    // every hit.
    // On a boss the shared renderer always owns the impact burst: the ported
    // layers spawn theirs on their own wheel rim — radius R, outside the
    // drawing — so their burst is clipped away while the round's real contact
    // pixel goes unmarked. This keeps the same burst on the same pixel for
    // every weapon, pistol or AK-47.
    const ownHitFx = !layerFeel || !!this.level.boss;
    // Dora airBlast hit FX (game-3)
    if (ownHitFx && w.id === 'dora') {
      const hp = impact;
      this.bump = Math.max(this.bump, 18);
      this.wheelFlash = Math.max(this.wheelFlash, 0.8);
      this.wheelFlashRgb = '220,242,255';
      this.shake = Math.max(this.shake, 13);
      this.airBlast(hp.x, hp.y, 1);
      sfx6.doraHit();
    }
    // Pred plasmaImpact hit FX (game-3)
    if (ownHitFx && w.id === 'pred') {
      const hp = impact;
      this.bump = Math.max(this.bump, 14);
      this.wheelFlash = Math.max(this.wheelFlash, 1);
      this.wheelFlashRgb = '200,235,255';
      this.shake = Math.max(this.shake, 15);
      this.plasmaImpact(hp.x, hp.y, 1);
      sfx6.predHit();
    }
    // Xeno acid splash hit FX (game-3)
    if (ownHitFx && w.id === 'xeno') {
      const hp = impact;
      this.bump = Math.max(this.bump, 8);
      this.wheelFlash = Math.max(this.wheelFlash, 1);
      this.wheelFlashRgb = '200,255,128';
      this.shake = Math.max(this.shake, 7);
      // The glob now lives in the metaball layer: five sub-blobs that sag,
      // wobble and eventually drip down the rim — exactly like slide 7.
      const stuckItem = this.items[this.items.length - 1];
      if (stuckItem) {
        stuckItem.acid = {
          blobs: [
            { d: 5, s: 0, r: 11, ph: rand(0, TAU) },
            { d: 13, s: rand(-3, 3), r: 8, ph: rand(0, TAU) },
            { d: 1, s: rand(6, 10), r: 6, ph: rand(0, TAU) },
            { d: 1, s: rand(-10, -6), r: 6, ph: rand(0, TAU) },
            { d: 20, s: rand(-2, 2), r: 4.5, ph: rand(0, TAU) },
          ],
          dripT: rand(0.5, 1.5),
          drip: 0,
          seed: Math.random() * 1000,
          hybrid: getGunEffect('xeno') === 'xeno_hybrid',
        };
      }
      if (getGunEffect('xeno') === 'xeno_hybrid') this.xenoMolecularImpact(hp.x, hp.y);
      this.splash(hp.x, hp.y, 1);
      sfx6.xenoHit();
    }
    if (this.time - this.lastHit < (w.comboWindow ?? 0.5)) this.combo++;
    else this.combo = 1;
    this.lastHit = this.time;
    // COMBO TITIK (SETTING): a round that bites the spot the previous one left
    // scores 10, then 20, 30, 40… and the award is banked as bonus coins.
    if (this.spotComboOn) {
      const arc = this.spotHits > 0
        ? Math.abs(Math.atan2(Math.sin(local - this.spotAngle), Math.cos(local - this.spotAngle))) * R
        : Infinity;
      // Only an almost-perfect repeat (inside 80 % of the tolerance, so the two
      // holes overlap) keeps the chain alive; anything looser starts over.
      this.spotHits = arc <= SPOT_COMBO_REACH ? this.spotHits + 1 : 1;
      this.spotAngle = local;
      const spotBonus = SPOT_COMBO_STEP * this.spotHits;
      this.score += spotBonus;
      this.coins += spotBonus;
      // One short, plain line — no glow sprite, no extra particles: the combo is
      // fired on every hit of an auto weapon, so it has to stay cheap.
      this.addText(`+${spotBonus} 💰`, CX, this.targetY + R + 30, '#fbbf24', 20);
    }
    let pts = w.points * (big === 2 ? 4 : big === 1 ? 2 : 1);
    if (big) {
      this.addText(big === 2 ? '⚡ FULL CHARGE x4!' : 'CHARGE x2', CX + rand(-40, 40), this.targetY + R + 60, big === 2 ? '#fde047' : '#7dd3fc', big === 2 ? 28 : 20);
      // A slide-11 charge shot (the Mega Buster's plasma, the caster's burst)
      // lands with slide 11's own light and blast; slide 1's shock ring and
      // white screen flash are not layered on top of it.
      if (big === 2 && !layerFeel) {
        const hp0 = impact;
        this.sink.light(hp0.x, hp0.y, 360, '254,240,138', 0.5);
        this.sink.push({ x: hp0.x, y: hp0.y, vx: 0, vy: 0, life: 0.6, max: 0.6, size: 220, color: '125,211,252', kind: 'shock', rot: 0, vr: 0, g: 0 });
        this.flashWhite = Math.max(this.flashWhite, 0.3);
      }
    }
    if (tint) {
      const hp0 = impact;
      // The droplet layer is batched into one path per colour now, so the burst
      // stays exactly as lush as it was: 22 droplets a hit used to mean ~900
      // fills a frame at 8 shots a second, and it is a handful of fills however
      // many land.
      for (let i = 0; i < 22; i++) {
        const a = rand(0, TAU);
        const v = rand(120, 520);
        this.sink.push({ x: hp0.x, y: hp0.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.8), max: 0.8, size: rand(2, 5), color: `rgb(${tint})`, kind: 'drop', rot: 0, vr: 0, g: 1100 });
      }
      this.sink.push({ x: hp0.x, y: hp0.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 24, color: `rgb(${tint})`, kind: 'paintSplat', rot: rand(0, TAU), vr: 0, g: 0 });
      if (tint === this.lastPaint) {
        pts += 3;
        sfx4.match();
        this.addText(T('🎨 WARNA SAMA! +3'), hp0.x, hp0.y + 60, `rgb(${tint})`, 22);
      }
      this.lastPaint = tint;
    }
    if (this.combo >= 2) {
      if (this.combo >= 3) pts *= 2;
      // Slide 5 (game-8) and slide 3 have no combo voice: their hits sound
      // only like the weapon. The combo still scores and still pops.
      if (!elevenHit && !sevenHit) sfx.combo(this.combo);
      this.comboPop = 1;
    }
    pts *= this.dmgMult; // POWER also doubles classic points / boss damage, not only rock damage.
    this.score += pts;
    // Slide 1's one-size bump, white flash and shake belong to its own shots
    // (`elevenHit`: slide 11 already moved the wheel its own way).
    if (!layerFeel) {
      this.bump = 1;
      this.hitFlash = 1;
      this.shake = Math.max(this.shake, 6);
    }
    if (!s1Hit && !s7Hit && !layerHit) this.crack(local, tint);
    if (isSlide23Weapon(w.id) && !layerHit) {
      const hitIdx = Math.max(0, this.stuck - 1);
      if (w.id === 'yoyo') slide23Sfx.hit('yoyo-spin', 0);
      if (w.id === 'firework') fireworkSfx.hit(hitIdx);
      else slide23Sfx.hit(w.id, hitIdx);
    } else if (!s1Hit && !s7Hit && !layerHit) {
      sfx.hit();
      if (w.energy && !w.slow && !w.pullCoins && !HIT_SFX[w.id]) sfx.zap();
    }
    const hp = impact;
    const hx = hp.x;
    const hy = hp.y;
    const cols = STYLE_COLORS[this.level.style].chips;
    if (s1Hit) impactSetOne(this.s1, s1Hit, hx, hy, local, this.s1Hooks(), (n) => setOneSfx.play(n));
    // Slide 7's own impact: cracks painted into the wheel face, the rim glow,
    // the burst, the stuck round and its sound — all from `projectiles*.ts`.
    else if (s7Hit) {
      const before = new Set(this.s7.stuck);
      s7Hit.hit(local, hx, hy);
      // Slide 3 decides how close the next round may come with its own numbers
      // (`collide()`: the round's `half` + the stuck one's `half`, met at
      // its `protrude`), so slide 1's entry keeps the stuck round's.
      const landed = this.s7.stuck.find((it) => !before.has(it));
      const entry = this.items[this.items.length - 1];
      if (entry && entry.type === 'bullet') {
        entry.s7Half = landed?.half ?? s7Hit.half;
        entry.s7Protrude = landed?.protrude ?? 12;
      }
      // Slide 7 keeps updating and drawing a round after it landed (the
      // shotgun's pellet shower, the minigun drum, the water jet…), so the
      // round goes back to slide 7's layer for the rest of its short life.
      this.s7.release(s7Hit);
      this.s7Last = undefined;
    }
    // Slide 6's own impact: the beam burst at the rim and the scorch it burns
    // into the wheel face, drawn with slide 6's own recipe.
    else if (s6Hit) this.s6.impact(hx, hy, local);
    // Slide 9's own impact: its burst, its sound and the entry hole it paints.
    else if (s9Hit) this.s9.impact(hx, hy, local, s9Hit);
    // Slide 11's own impact: its burst, its sound and the marks it leaves.
    else if (s11Hit) this.s11.impact(hx, hy, s11Hit);
    else if (s9BeamHit) this.s9.markBeam(local);
    else if (s9Pending) this.s9.impact(hx, hy, local, undefined, p ? Math.atan2(p.vy, p.vx) : undefined);
    // A slide-11 shot that is not a round (a beam, the railgun's hitscan, the
    // sword's delayed slash) paints its own impact where it lands: slide 1's
    // carrier only scores it, without sparks slide 11 never shows.
    // Slide 2's own impact: the shell burst, the bite mark, the shrapnel and
    // its own hit voice, played where the round actually landed.
    else if (s2Hit) {
      const s2id = this.setTwoId;
      if (s2id) this.s2w.stick(s2id, hx, hy, s2Hit.hue, s2Hit.seed);
    }
    this.slide2Impact(hx, hy);
    // Slide 11 already voiced the hit (its impact accent + its wood thunk).
    // Slide 3's guns have no perks at all.
    if (!sevenHit) this.applyPerks(w, hx, hy, R, !layerFeel, !layerFeel);
    if (w.id === 'yoyo' && !sevenHit) {
      spawnYoyoStickBurst(
        this.getYoyoState(),
        hx,
        hy,
        hue ?? gunState.yoyoHue,
        p?.originX ?? CX,
        GUN_Y - 10,
      );
    }
    if (w.id === 'keris' && !sevenHit) {
      spawnKerisImpact(
        this.getKerisState(),
        hx,
        hy,
        p?.originX ?? CX,
        GUN_Y - 6,
        local,
      );
    }
    if (w.id === 'diamond' && !sevenHit) {
      spawnDiamondStickBurst(this.getDiamondState(), hx, hy, 1);
    }
    if (w.id === 'bazooka' && !sevenHit) {
      this.getBazookaState().onHit(hx, hy, 1.05);
    }
    const fxp = FX[w.id];
    // Slide 9 and slide 11 spawn their own impact burst and sound, so slide 1's
    // signature burst would only stack a second explosion on top of them.
    if (w.id !== 'firework' && w.id !== 'yoyo' && w.id !== 'keris' && w.id !== 'diamond' && w.id !== 'bazooka'
      && !s1Hit && !layerHit) {
      spawnImpact(this.sink, fxp, w, hx, hy, (hx - CX) / R, (hy - this.targetY) / R, cols);
    }
    // Slide 1's own hit reaction (camera kick, shake and screen
    // tint from the FX table). A slide-11 shot already got slide 11's own
    // from its `g.hit()`: a pistol round barely moves the screen there, while
    // these added a camera jolt, a 3 px+ shake and a colour wash to every hit.
    if (!layerFeel) {
      this.camY -= fxp.kick;
      this.shake = Math.max(this.shake, 3 + fxp.kick * 0.8);
      if (fxp.tint) {
        this.tintA = Math.max(this.tintA, fxp.tint);
        this.tintRgb = fxp.light;
      }
    }
    if (this.level.boss) {
      const dmg = pts * 10;
      this.bossHp = Math.max(0, this.bossHp - dmg);
      // Game B: every hit resets the taunt and makes the boss angry; the hit
      // that pushes it under 40 % HP is the one that enrages it.
      this.bossTauntT = 0;
      if (!this.bossRage && this.bossHp > 0 && this.bossHp <= this.bossMaxHp * 0.4) this.enterBossRage(local);
      else if (this.bossHp > 0) this.setBossMood('angry', 0.65);
      if (this.bossHp <= 0 || this.stuck >= this.level.ammo) {
        this.clearLevel();
      }
    } else {
      if (this.stuck >= this.level.ammo) this.clearLevel();
    }
  }

  private collectCoin(it: Item) {
    const R = this.level.radius;
    const wa = it.angle + this.rot;
    const x = CX + Math.cos(wa) * (R + 14);
    const y = this.targetY + Math.sin(wa) * (R + 14);
    this.items = this.items.filter((i) => i !== it);
    // COMBO TITIK prices every shot coin at a flat 10 instead of the weapon's
    // own coin value.
    const v = this.spotComboOn ? SPOT_COMBO_COIN_VALUE : this.weapon.coinValue;
    this.coins += v;
    sfx.coin();
    this.addText(`+${v} 💰`, x, y - 10, '#ffd23f', v > 1 ? 26 : 20);
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      const v = rand(100, 320);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6), max: 0.6,
        size: rand(2, 4), color: pick(['#ffd23f', '#fff1a8', '#f59e0b']), kind: 'spark', rot: 0, vr: 0, g: 300,
      });
    }
  }

  private hitDiamond(it: Item) {
    it.hits = 1;
    const R = this.level.radius;
    const wa = it.angle + this.rot;
    const x = CX + Math.cos(wa) * (R + 18);
    const y = this.targetY + Math.sin(wa) * (R + 18);
    sfx4.shatter();
    this.shake = Math.max(this.shake, 6);
    this.addText('💎 1/2 RETAK!', x, y - 12, '#67e8f9', 18);
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x, y, vx: rand(-180, 180), vy: rand(-220, 100), life: rand(0.3, 0.6), max: 0.6,
        size: rand(2, 5), color: pick(['#67e8f9', '#ffffff', '#a5f3fc']), kind: 'spark', rot: 0, vr: 0, g: 600,
      });
    }
  }

  private collectDiamond(it: Item) {
    const R = this.level.radius;
    const wa = it.angle + this.rot;
    const x = CX + Math.cos(wa) * (R + 18);
    const y = this.targetY + Math.sin(wa) * (R + 18);
    this.items = this.items.filter((i) => i !== it);
    this.coins += 5;
    this.events.onDiamondCollected?.(10, false, { x, y });
    sfx3.chime();
    sfx2.jackpot();
    this.shake = Math.max(this.shake, 8);
    this.addText(T('BERLIAN +10! +5 APEL'), x, y - 12, '#67e8f9', 22);
    for (let i = 0; i < 26; i++) {
      const a = rand(0, TAU);
      const v = rand(120, 440);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.5, 0.9), max: 0.9,
        size: rand(2.5, 6), color: pick(['#67e8f9', '#a5f3fc', '#ffffff', '#fde047']), kind: 'star', rot: 0, vr: 0, g: 300,
      });
    }
  }

  private fail(p: Proj) {
    // Slide 7's own "blocked" burst (the round is stopped by a stuck weapon).
    if (this.setSevenLive && p.setSeven) {
      p.setSeven.block(p.x, p.y);
      this.s7.release(p.setSeven);
    }
    if (this.setSixLive && p.setSix) this.s6.block(p.x, p.y);
    if (this.setNineLive && p.setNine) this.s9.block(p.x, p.y, p.setNine);
    // A slide-11 shot ricochets off the obstacle with slide 11's own ping,
    // spark star and ring, and the blocked round goes. Then none of slide 11's
    // rounds may land after GAGAL! — carried or not — nor hang frozen in the
    // air over the fail screen.
    const elevenShot = this.setElevenLive && !!(p.setEleven || p.setElevenPending || p.s11Ghost);
    if (elevenShot) this.s11.block(p.x, p.y, p.setEleven);
    // A slide-9 shot already burst its own way (`block()` above, or its beam).
    const nineShot = this.setNineLive && !!(p.setNine || p.setNinePending || p.s9Ghost || p.setNineBeam !== undefined);
    if (this.s11State) this.s11State.sweepRounds();
    this.aiming = false;
    this.burnT = 0;
    this.state = 'fail';
    this.stateT = 0;
    // Game B's boss laughs at a miss, a beat after it happens.
    if (this.level.boss) this.setBossMood('laugh', 1.6);
    this.projs = [];
    this.holding = false;
    this.beams = [];
    this.flyers.push({ x: p.x, y: p.y + BLEN / 2, vx: rand(-260, 260), vy: rand(380, 520), rot: 0, vr: rand(14, 24) * (Math.random() < 0.5 ? -1 : 1), kind: 'bullet', w: this.weapon.id, hue: p.hue });
    if (this.weapon.id === 'firework') {
      spawnFirework8FailBurst(this.getFwState(), p.x, p.y, p.hue ?? gunState.rocketHue);
    }
    if (this.weapon.id === 'yoyo') {
      spawnYoyoFailBurst(this.getYoyoState(), p.x, p.y, p.hue ?? gunState.yoyoHue);
    }
    if (this.weapon.id === 'diamond') {
      spawnDiamondFailBurst(this.getDiamondState(), p.x, p.y);
    }
    if (this.weapon.id === 'bazooka') {
      this.getBazookaState().onHit(p.x, p.y, 1.45);
    }
    // The blunt slam and the plasma detonation also fire when the shot is
    // wasted on an obstacle (game-3 resolveHit: fail branch) — for slide 1's
    // own shot only: a slide-11 round already burst with `block()` above.
    if (this.weapon.id === 'dora') this.airBlast(p.x, p.y, 1.3);
    if (this.weapon.id === 'pred' && !elevenShot && !nineShot) this.plasmaImpact(p.x, p.y, 1.3);
    // Acid splashes off the obstacle (game-3 resolveHit fail branch).
    if (this.weapon.id === 'xeno' && !elevenShot) {
      if (getGunEffect('xeno') === 'xeno_hybrid') this.xenoMolecularImpact(p.x, p.y);
      this.splash(p.x, p.y + 10, 1.4);
      this.sink.light(p.x, p.y, 90, '255,255,255', 0.15);
      this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.25, max: 0.25, size: 6, color: '255,255,255', kind: 'ring', rot: 0, vr: 0, g: 0 });
      for (let i = 0; i < 24; i++) {
        const a = Math.PI / 2 + rand(-1.5, 1.5);
        const sp = rand(200, 700);
        this.sink.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5, max: 0.5, size: 2, color: pick(['#ffffff', '#fff2b0', '182,255,26']), kind: 'spark', rot: 0, vr: 0, g: 900, drag: 3 });
      }
    }
    if (!this.setTwoVoice('fail')) sfx.fail(this.weapon.id);
    this.shake = 16;
    this.flashRed = 1;
    this.timeScale = 0.12;
    this.hitStop = 0.14;
    this.camY -= 10;
    this.sink.light(p.x, p.y, 180, '255,70,50', 0.5);
    this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 45, color: '255,60,40', kind: 'shock', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 10; i++) {
      this.sink.push({ x: p.x, y: p.y, vx: rand(-300, 300), vy: rand(-200, 300), life: rand(0.4, 0.8), max: 0.8, size: rand(4, 8), color: pick(['#ffffff', '#ffd23f', '#9ca3af']), kind: 'shard', rot: rand(0, TAU), vr: rand(-20, 20), g: 1200 });
    }
    this.combo = 0;
    for (let i = 0; i < 26; i++) {
      const a = rand(0, TAU);
      const v = rand(200, 800);
      this.particles.push({
        x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.2, 0.5), max: 0.5,
        size: rand(1.5, 3), color: pick(['#ffffff', '#ffd23f', '#ff6b35']), kind: 'spark', rot: 0, vr: 0, g: 500,
      });
    }
    this.particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 70, color: '#ff3b3b', kind: 'ring', rot: 0, vr: 0, g: 0 });
    this.addText('GAGAL!', CX, this.targetY + this.level.radius + 110, '#ff4d4d', 40);
  }

  /**
   * Prepare this stage's shatter wedges — boundaries, palette, and both baked
   * faces of each of the nine chunks.
   *
   * Everything here depends only on the target artwork and the level, so it is
   * built once per stage rather than on the frame the wheel breaks. The render
   * loop asks for it as soon as the artwork exists (during the stage intro), so
   * the stage-clear cinematic starts with all of it already in hand.
   */
  private prepareWedges() {
    if (this.wedgePrep) return this.wedgePrep;
    const R = this.level.radius;
    const pad = this.level.boss ? 40 : 4;
    const pix = readTargetPixels(this.face ?? null);
    const offset = rand(0, TAU);
    const sprites: (WedgeSprite | null)[] = [];
    const ink: ({ side: string; edge: string } | null)[] = [];
    // Sprite density follows the screen, so a tumbling chunk is as crisp as the
    // wheel it came from without ever being larger than it needs to be.
    // Capped so a large board (a boss span is R+40) cannot allocate a huge canvas
    // per chunk: the pieces are tumbling, so a slightly lower density is invisible.
    const density = Math.max(0.75, Math.min(1.5, 320 / (2 * (R + pad)), (this.scale || 1) * (this.dpr || 1)));
    const k = 9;
    for (let i = 0; i < k; i++) {
      const a0 = offset + (i / k) * TAU;
      const a1 = offset + ((i + 1) / k) * TAU;
      const wedge = pix ? wedgeInk(pix, R, pad, this.faceScale, a0, a1) : null;
      ink.push(wedge);
      sprites.push(this.face
        ? bakeWedgeSprite(this.face, R, pad, a0, a1, wedge?.edge ?? STYLE_COLORS[this.level.style].chips[0], density)
        : null);
    }
    this.wedgePrep = { offset, sprites, ink, debris: pix ? artChips(pix) : null };
    return this.wedgePrep;
  }

  private clearLevel() {
    this.state = 'clear';
    this.stageClearBurstMax = this.level.boss ? 1.15 : 0.9;
    this.stageClearBurstT = this.stageClearBurstMax;
    this.stageClearBurstBoss = !!this.level.boss;
    this.events.onStageCleared?.(this.level.n, this.level.boss, { x: CX, y: this.targetY });
    this.stateT = 0;
    this.projs = [];
    const R = this.level.radius;
    // The chunks and debris take their colour from the target that just broke —
    // the wheel's own image, or the boss's image on a boss stage — so the pieces
    // look like they came out of that artwork instead of a fixed stage palette.
    //
    // All of that (reading the artwork back, averaging each wedge, baking its two
    // faces) is prepared during the stage and not here: this runs on the frame
    // the cinematic starts, which must not spend 20 ms doing still-image work.
    const prepared = this.prepareWedges();
    const debris = prepared.debris ?? STYLE_COLORS[this.level.style].chips;
    // Chunk thickness follows the art's own weight: heavier wheels read thicker,
    // and a boss slab is never as deep as it is wide.
    const depth = Math.max(5, Math.min(12, R * 0.07));
    const k = 9;
    const offs = prepared.offset;
    for (let i = 0; i < k; i++) {
      const a0 = offs + (i / k) * TAU;
      const a1 = offs + ((i + 1) / k) * TAU;
      const mid = (a0 + a1) / 2 + this.rot;
      const v = rand(260, 520);
      const ink = prepared.ink[i];
      this.frags.push({
        x: CX, y: this.targetY, vx: Math.cos(mid) * v, vy: Math.sin(mid) * v - 220,
        rot: this.rot, vr: rand(-6, 6), a0, a1,
        // Start each wedge already pitched away from the camera, then tumble it
        // between two oblique angles so the artwork never reads as a flat front.
        pitch: rand(0.68, 1.3), pitchV: rand(-3.2, 3.2),
        side: ink?.side, edge: ink?.edge, depth,
        sprite: prepared.sprites[i] ?? null,
      });
    }
    for (const it of this.items) {
      const wa = it.angle + this.rot;
      const v = rand(350, 650);
      this.flyers.push({
        x: CX + Math.cos(wa) * R, y: this.targetY + Math.sin(wa) * R, vx: Math.cos(wa) * v, vy: Math.sin(wa) * v - 200,
        rot: wa - Math.PI / 2, vr: rand(-14, 14), kind: it.type, w: it.w, hue: it.hue,
        busterPellet: it.busterPellet, scale: it.scale,
      });
    }
    if (this.weapon.id === 'firework') {
      spawnFirework8ClearFinale(this.getFwState(), CX, this.targetY, this.level?.n ?? 1);
    }
    if (this.weapon.id === 'yoyo') {
      spawnYoyoClearFinale(this.getYoyoState(), CX, this.targetY);
    }
    if (this.weapon.id === 'diamond') {
      spawnDiamondClearFinale(this.getDiamondState(), CX, this.targetY);
    }
    if (this.weapon.id === 'bazooka') {
      this.getBazookaState().onStageClear(CX, this.targetY);
    }
    // Xenomorph acid detonation: the burst soaks the arena in acid rain
    // (game-3 explodeWheel()).
    if (this.weapon.id === 'xeno') {
      for (const it of this.items) {
        if (!it.acid) continue;
        const wa = it.angle + this.rot;
        const sx = CX + Math.cos(wa) * (R + 10);
        const sy = this.targetY + Math.sin(wa) * (R + 10);
        for (let i = 0; i < 8; i++) {
          this.sink.push({ x: sx, y: sy, vx: Math.cos(wa) * rand(100, 500) + rand(-100, 100), vy: Math.sin(wa) * rand(100, 500) - 200, life: 1.6, max: 1.6, size: rand(3, 7), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1100, drag: 0.15 });
        }
      }
      for (let i = 0; i < 90; i++) {
        const a = rand(0, TAU);
        const sp = rand(150, 850);
        this.sink.push({ x: CX, y: this.targetY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(1, 1.8), max: 1.8, size: rand(2.5, 7), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1100, drag: 0.15 });
      }
      for (let i = 0; i < 30; i++) {
        this.sink.push({ x: CX + rand(-40, 40), y: this.targetY + rand(-40, 40), vx: rand(-200, 200), vy: rand(-200, 200), life: rand(1.5, 2.8), max: 2.8, size: rand(25, 55), color: '106,138,58', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 2 });
      }
    }
    // Air cannon detonation: a wall of cartoon puffs, manga speed lines and the
    // big DOKAAAN!! (game-3 explodeWheel dora branch).
    if (this.weapon.id === 'dora') {
      for (let i = 0; i < 40; i++) {
        const a = rand(0, TAU);
        const sp = rand(200, 700);
        this.sink.push({ x: CX, y: this.targetY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(1, 1.8), max: 1.8, size: rand(20, 44), color: '#ffffff', kind: 'puff', rot: rand(0, TAU), vr: rand(-2, 2), g: 0, drag: 2.2 });
      }
      this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 520, color: '#ffffff', kind: 'speed', rot: 3.7, vr: 0, g: 0 });
      this.sink.push({ x: CX, y: this.targetY - 40, vx: 0, vy: -60, life: 1.4, max: 1.4, size: 64, color: '#ffd23a', kind: 'text', rot: -0.12, vr: 0, g: 0, text: 'DOKAAAN!!' });
    }
    // Plasma detonation: blinding core, lightning web and molten embers
    // (game-3 explodeWheel pred branch).
    if (this.weapon.id === 'pred') {
      this.sink.light(CX, this.targetY, 600, '111,211,255', 0.6);
      for (let i = 0; i < 18; i++) {
        const a = rand(0, TAU);
        this.sink.push({ x: CX, y: this.targetY, vx: Math.cos(a) * rand(120, 280), vy: Math.sin(a) * rand(120, 280), life: 0.35, max: 0.35, size: 3, color: i % 2 ? '255,255,255' : '111,211,255', kind: 'bolt', rot: 0, vr: 0, g: 0 });
      }
      for (let i = 0; i < 80; i++) {
        const a = rand(0, Math.PI);
        const sp = rand(300, 1200);
        this.sink.push({ x: CX, y: this.targetY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.4, max: 1.4, size: 2.6, color: pick(['255,176,96', '255,112,48', '111,211,255']), kind: 'glow', rot: 0, vr: 0, g: 500, drag: 1.5 });
      }
    }
    this.resetSevenLayer();
    this.items = [];
    const cols = debris;
    for (let i = 0; i < 50; i++) {
      const a = rand(0, TAU);
      const v = rand(150, 750);
      this.particles.push({
        x: CX + Math.cos(a) * rand(0, R), y: this.targetY + Math.sin(a) * rand(0, R), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150,
        life: rand(0.6, 1.2), max: 1.2, size: rand(3, 7), color: pick(cols), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 1300,
      });
    }
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: CX + rand(-R, R) * 0.6, y: this.targetY + rand(-R, R) * 0.6, vx: rand(-60, 60), vy: rand(-60, 20), life: rand(0.6, 1.1), max: 1.1,
        size: rand(18, 34), color: 'rgba(220,220,220,', kind: 'smoke', rot: 0, vr: 0, g: -30,
      });
    }
    this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: R * 2.4, color: '#ffffff', kind: 'ring', rot: 0, vr: 0, g: 0 });
    if (!this.setTwoVoice('clear')) sfx.clear(this.weapon.id);
    this.shake = 18;
    this.flashWhite = 0.7;
    this.timeScale = 0.35;
    this.hitStop = 0.07;
    const wheelBurstRgb = getWheelSunburstTheme(this.level.style).rgb;
    this.sink.light(CX, this.targetY, R * 2.6, wheelBurstRgb, 0.65);
    this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: R * 1.85, color: wheelBurstRgb, kind: 'shock', rot: 0, vr: 0, g: 0 });
    const cc = debris;
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const v = rand(250, 700);
      this.sink.push({ x: CX + Math.cos(a) * R * 0.5, y: this.targetY + Math.sin(a) * R * 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, life: rand(0.7, 1.2), max: 1.2, size: rand(6, 12), color: pick(cc), kind: 'shard', rot: rand(0, TAU), vr: rand(-20, 20), g: 1300 });
    }
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      this.sink.push({ x: CX, y: this.targetY, vx: Math.cos(a) * rand(100, 400), vy: Math.sin(a) * rand(100, 400), life: rand(0.5, 1), max: 1, size: rand(6, 11), color: '#ffffff', kind: 'star', rot: rand(0, TAU), vr: 0, g: 0, drag: 2.5 });
    }
    if (this.level.boss) {
      this.coins += 5;
      this.score += 5;
      this.addText(T('BOS KALAH! +5 💰'), CX, this.targetY + 20, '#ffd23f', 28);
    } else {
      this.score += 3;
    }
  }

  private addText(text: string, x: number, y: number, color: string, size: number) {
    // Jaga area target (Y: 120..420) agar selalu bersih dan tidak terhalang teks!
    let safeY = y;
    const wheelTop = this.targetY - this.level.radius - 16;
    const wheelBottom = this.targetY + this.level.radius + 38;
    if (safeY > wheelTop && safeY < wheelBottom) {
      safeY = wheelBottom + 8;
    }
    // Bergerak turun menjauh dari target dan memudar dengan cepat
    this.particles.push({ x, y: safeY, vx: 0, vy: 25, life: 0.65, max: 0.65, size: Math.min(size, 24), color, kind: 'text', rot: 0, vr: 0, g: 0, text });
  }

  /**
   * Debris gravity, expressed for the screen the world is shown on.
   *
   * Portrait draws the world as-is, so wreckage falls along world +y. Landscape
   * lays the world on its side (`layout.ts`: world (x, y) is display (H - y, x)),
   * which makes the screen's floor world **+x**. Keeping the portrait's +y pull
   * there is what made chips, sparks and casings slide sideways across the
   * landscape screen instead of dropping: they all have to fall along +x now.
   */
  private get debrisFallsAlongX(): boolean {
    return this.orientation === 'landscape';
  }

  /**
   * Screen space for effects that have to respect *gravity on the screen* —
   * the treasure shower — rather than the world the engine simulates in.
   * Screen x is right, screen y is down; portrait and world are the same thing,
   * landscape swaps them (`layout.ts`).
   */
  private get showerScreen() {
    return this.debrisFallsAlongX ? SHOWER_LANDSCAPE : SHOWER_PORTRAIT;
  }

  /** Screen (right, down) → world, for a piece of a screen-space effect. */
  private screenToWorld(sx: number, sy: number): { x: number; y: number } {
    return this.debrisFallsAlongX ? { x: sy, y: H - sx } : { x: sx, y: sy };
  }

  /** World → screen (right, down); the inverse of `screenToWorld`. */
  private worldToScreen(x: number, y: number): { x: number; y: number } {
    return this.debrisFallsAlongX ? { x: H - y, y: x } : { x, y };
  }

  /** Has a falling piece reached the floor the player can see? `m` may be negative for a lip. */
  private pastDebrisFloor(x: number, y: number, m: number): boolean {
    return this.debrisFallsAlongX ? x > W + m : y > H + m;
  }

  /**
   * Turn a freshly launched piece into the screen's gravity frame, once.
   *
   * Every burst in the engine is written for the portrait world (a shard thrown
   * "up" is -y, a casing thrown "down" is +y). On the landscape screen world +x
   * is down and world -y is right, so the launch velocity is rotated a quarter
   * turn; without it the debris drops away from the impact instead of tumbling
   * toward the floor. The mark lives in a WeakSet so this costs one lookup per
   * piece per frame and nothing is ever written onto the piece itself.
   */
  private turnDebris<T extends { vx: number; vy: number }>(o: T): T {
    if (!this.debrisFallsAlongX || this.turnedDebris.has(o)) return o;
    this.turnedDebris.add(o);
    const vx = o.vx;
    o.vx = o.vy;
    o.vy = -vx;
    return o;
  }

  // ---------- loop ----------
  private loop = (now: number) => {
    if (!this.active) return;
    // Tick natively on every VSync (60 Hz / 90 Hz / 120 Hz) during live play so
    // 90 Hz & 60 Hz mobile screens never suffer beat-frequency frame drops;
    // throttle only idle/covered game-over backdrops.
    const idle = this.state === 'idle' || this.state === 'over';
    if (!idle || now - this.last >= 1000 / 15 - 1) {
      const elapsed = now - this.last;
      if (elapsed > 0) {
        const dt = Math.min(0.033, elapsed / 1000);
        this.last = now;
        const live = this.state === 'play' && !this.choosingBuff &&
          (typeof document === 'undefined' || document.visibilityState !== 'hidden');
        let resized = false;
        if (live) {
          const dpr = this.adaptiveDpr.recordFrame(elapsed);
          if (dpr !== null) {
            this.applyCanvasDpr(dpr);
            // A new backing store starts out empty; skipping this frame's draw
            // would show that emptiness as a flash.
            resized = true;
          }
        } else {
          this.adaptiveDpr.pause();
        }
        const started = performance.now();
        this.update(dt);
        // A 120 Hz screen that cannot hold 8.3 ms gets uneven frames; drawing on
        // the 60 Hz grid instead is the difference between "high fps" and
        // "smooth". Only drawing is skipped — the simulation above always runs.
        // The governor keeps working on its own; this never touches artwork.
        if (live ? resized || this.cadence.shouldRender(now, elapsed, this.lastWork) : true) {
          this.render();
          // Measured only on frames that really drew: a skipped render is not
          // evidence of headroom, and feeding it back would make the lock
          // release and re-engage in a loop.
          this.lastWork = performance.now() - started;
        }
      }
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private stepProj(p: Proj, stride = 0): StepRes {
    // A floating star can be collected by a straight shot before it reaches the target.
    if (this.state === 'play' && this.star
      && Math.hypot(p.x - this.star.x, p.y - this.star.y) < this.star.r + this.weapon.half * 0.5) {
      this.hitStar();
      return { res: 'hit' };
    }
    const isBoss = this.level.boss;
    const bType = isBoss ? (this.level.style as BossAttackFamily) : null;
    const px = p.x - CX;
    const py = p.y - this.targetY;
    const worldA = Math.atan2(py, px);
    const local = norm(worldA - this.rot);
    // Exact pixel-perfect raycast radius matching the cutout silhouette of the generated boss head!
    const effectiveR = bType ? this.bossRadiusAt(local) : this.level.radius;
    const dist = Math.hypot(px, py);
    // A slide-3 round ("Slide 3" card) meets the wheel the way slide 3's own
    // `collide()` decides it: from its tip (`y - tip`, up to 54 px ahead of
    // its centre), with its own `half`, against stuck rounds protruding up to
    // 54 px — and with no slide-1 perk (no piercing old knives, no ghosting
    // spikes).
    const s3 = this.setSevenLive;
    const shot7 = s3 ? p.setSeven : undefined;
    const reach = dist - (shot7 ? shot7.tip : 0);
    // With the artwork's mask in hand the broad phase has to reach the furthest
    // piece of ink, not the angular radius, or a horn would be unhittable.
    // A generous broad phase only has to be cheap; the artwork decides the hit.
    // The artwork is drawn up to 1.35x during its reactions, so the gate has to
    // cover that, or a shot dies before it can reach the head.
    const phaseR = this.artMask ? this.level.radius * this.artMaskMaxR * 1.4 : effectiveR;
    if (reach > phaseR + L + 4 + (shot7 ? 60 : 0)) return { res: 'none' };
    // Boss: the drawing decides, and only the drawing. The round's nose (and
    // then its centre) is tested against the artwork's own pixels, so a shot
    // flies through the empty space beside a horn or a shoulder instead of
    // sticking to an invisible circle. `artHitAt` rebuilds the mask from the
    // SVG if the runtime could not read the raster back — a boss stage has no
    // other path to a hit.
    if (isBoss) {
      const nose = shot7 ? shot7.tip : 0;
      // Walk the whole distance the round covered since the last frame (the
      // caller substeps at ≤ 7 px) in 1 px steps, oldest pixel first: start a
      // stride behind and close in. Every point further back than the substep
      // start is a spot this round has already flown through, so it is empty
      // space by definition — the first solid pixel found this way is the pixel
      // the round actually met, the blue outline, not a point buried up to a
      // stride deep inside the body.
      const speed = Math.hypot(p.vx, p.vy) || 1;
      const ux = p.vx / speed;
      const uy = p.vy / speed;
      // The caller hands over the exact length of the substep it just moved, so
      // the walk starts at the round's previous position and not a pixel past it.
      const span = Math.min(10, Math.max(1, stride || speed * 0.02));
      let hit: { r: number; x: number; y: number } | null = null;
      // The head laughs, rages and breathes: while a round is in the air the
      // drawing can grow *over* the spot it had already left, so the far end of
      // the stride is ink too. Step further back until the path is outside the
      // art again, then close in — the round still stops on the outline it met.
      let from = span;
      const limit = Math.min(48, span + 24);
      while (from < limit && this.artHitAt(p.x + ux * nose - ux * from, p.y + uy * nose - uy * from)) from += 1;
      for (let d = from; !hit; d -= 1) {
        const back = Math.max(0, d);
        hit = this.artHitAt(p.x + ux * nose - ux * back, p.y + uy * nose - uy * back);
        if (back === 0) break;
      }
      if (hit) {
        return {
          res: 'stick',
          local: Math.atan2(hit.y, hit.x),
          r: hit.r,
          px: hit.x,
          py: hit.y,
        };
      }
    }
    // On bosses the visible silhouette is the sole projectile blocker. Old
    // knives, embedded rounds and their radial approximations cannot stop a
    // shot in the empty space outside it.
    if (isBoss) return { res: 'none' };
    if (isSpecial(this.level.mode)) return this.stepSpecialProjectile(p);
    const w = this.weapon;
    const R = effectiveR;

    // Check collision against other stuck items (bullets/spikes)
    // IMPORTANT: only check items that are sufficiently close in angle to avoid false collisions!
    // Precise, fair collision check:
    // Only triggers failure if projectile hits an existing bullet or spike near the surface
    for (const it of [...this.items]) {
      if (it.type === 'coin') continue;
      if (p.ghostVolley !== undefined && p.ghostVolley === it.ghostVolley) continue;
      const d = angDiff(local, it.angle);
      // Tangential angular clearance threshold
      const itemR = it.r ?? (bType ? this.bossRadiusAt(it.angle) : this.level.radius);

      if (it.type === 'bullet' || it.type === 'old') {
        const sc = it.scale ?? 1;
        const totalWeaponLen = it.type === 'old' ? BLEN : (getWeapon(it.w || 'pistol').stick + 12);
        const stickLen = (totalWeaponLen * 0.5) * sc; // hanya terlihat setengah peluru di luar target
        const otherHalf = (it.type === 'old' ? 4.5 : getWeapon(it.w || 'pistol').half) * sc;
        if (shot7 && it.s7Half !== undefined) {
          // Two slide-3 rounds: blocked when their `half` angles overlap where
          // the stuck one protrudes — slide 3's rule, number for number. COMBO
          // TITIK (SETTING) makes that repeat a hit instead of a wasted shot.
          const lim = itemR + (it.s7Protrude ?? 12);
          if (d < it.s7Half + shot7.half && reach <= lim && reach >= itemR - 8) {
            if (!this.spotComboOn) return { res: 'fail', spike: false };
            continue;
          }
          continue;
        }
        const myHalf = shot7 ? shot7.half * Math.max(50, itemR) : w.half * (1 + (p.big ?? 0) * 0.3);
        const contactArc = (myHalf + otherHalf) / Math.max(50, itemR);

        // Check if projectile is in the collision arc and depth of stuck bullet
        if (d < contactArc && reach <= itemR + stickLen && reach >= itemR - 8) {
          if (it.type === 'old' && !s3 && (w.pierceOld || p.big === 2) && !p.pierced) {
            p.pierced = 1;
            this.items = this.items.filter((x) => x !== it);
            const wa = it.angle + this.rot;
            const pos = this.worldPos(it.angle, itemR + 15);
            this.flyers.push({ x: pos.x, y: pos.y, vx: rand(-250, 250), vy: -350, rot: wa - Math.PI / 2, vr: rand(-20, 20), kind: 'old' });
            this.addText('🧲 TEMBUS!', pos.x, pos.y - 20, '#7dd3fc', 22);
            sfx2.metal();
            continue;
          }
          // COMBO TITIK (SETTING): landing on the previous mark is the point of
          // the mode — the round bites where it aimed instead of being wasted on
          // the round already stuck there. The old round is knocked loose so a
          // long chain does not stack a dozen sprites on one spot.
          if (this.spotComboOn) {
            this.items = this.items.filter((x) => x !== it);
            const pos = this.worldPos(it.angle, itemR + 12);
            this.flyers.push({
              x: pos.x, y: pos.y, vx: rand(-220, 220), vy: rand(140, 360),
              rot: it.angle + this.rot - Math.PI / 2, vr: rand(-18, 18),
              kind: it.type === 'old' ? 'old' : 'bullet', w: it.w,
            });
            continue;
          }
          return { res: 'fail', spike: false };
        }
      } else if (it.type === 'spike') {
        if (this.spikeOffT > 0 || (w.phaseSpikes && !s3)) continue;
        const myHalf = w.half * (1 + (p.big ?? 0) * 0.3);
        const spikeArc = (myHalf + 9 * SPIKE_SCALE) / Math.max(50, itemR);

        // Check if projectile hits the spike protruding from boss head
        if (d < spikeArc && dist <= itemR + SPIKE_LEN * SPIKE_SCALE && dist >= itemR - 4) {
          return { res: 'fail', spike: true };
        }
      }
    }
    if (dist <= R + 36) {
      for (const it of [...this.items]) {
        if (it.type !== 'coin' && it.type !== 'diamond_chest') continue;
        const targetR = bType ? this.bossRadiusAt(it.angle) : this.level.radius;
        const cp = this.worldPos(it.angle, it.type === 'coin' ? targetR + 18 : targetR + 4);
        const hitDistance = Math.hypot(p.x - cp.x, p.y - cp.y);

        if (it.type === 'coin') {
          if (hitDistance < w.coinRadius + 8) this.collectCoin(it);
        } else if (it.type === 'diamond_chest') {
          if (hitDistance < w.coinRadius + 12) {
            if ((it.hits || 0) < 1) {
              this.hitDiamond(it);
            } else {
              this.collectDiamond(it);
            }
          }
        }
      }
    }
    // Ordinary wheels land on their rim. A boss never does: its surface is the
    // drawing, so a round that met no ink keeps flying rather than biting an
    // invisible ring around the head.
    if (!isBoss && reach <= R) return { res: 'stick', local };
    return { res: 'none' };
  }

  /** Each projectile is consumed on its first rock/coin/chest collision. */
  private stepSpecialProjectile(p: Proj): StepRes {
    const mode = this.level.mode;
    const ty = this.targetY;
    if (mode === 'treasure') {
      // Same open, coin-filled chest as the 10-second Diamond Breaker round.
      if (!this.chest || Math.abs(p.x - CX) > CHEST_HALF_W
        || p.y < ty + CHEST_LIFT - CHEST_TOP || p.y > ty + CHEST_LIFT + CHEST_BOTTOM) return { res: 'none' };
      const power = Math.max(1, this.weapon.stats.power + (p.big ?? 0) * 2);
      this.chest.hit(power);
      const reward = Math.max(1, Math.round(power * 0.48 + rand(0, 1))) * (this.treasureBuff === 'giant' ? 2 : 1);
      // The reward is not credited on impact: it physically erupts from the
      // chest, bounces on the floor, then reaches the counter in small steps.
      // The shower is simulated on the *screen* (see `treasureShower`), so the
      // hit point goes in as screen coordinates: gold then always leaps up the
      // screen and drops to its floor, in landscape just as in portrait.
      const gold = this.worldToScreen(p.x, ty);
      this.treasureCoins.push(...throwTreasureCoins(gold.x, gold.y, reward, Math.random, this.showerScreen));
      // Embedded rounds move with the rattling chest, not with the screen.
      const len = this.weapon.stick + EMBED;
      const embedded = this.makeEmbeddedShot(p, (p.x - CX) / BOARD_PACKAGE_SCALE, 68 - len * 0.5, Math.PI / 2);
      // A new hit in the same spot knocks the previous round loose instead of
      // stacking dozens of identical sprites into one blinding column.
      for (let i = this.chestBullets.length - 1; i >= 0; i--) {
        if (Math.abs(this.chestBullets[i].x - embedded.x) < Math.max(14, this.weapon.half * 2.5)) {
          this.dislodgeChestShot(this.chestBullets.splice(i, 1)[0]);
        }
      }
      this.chestBullets.push(embedded);
      if (this.chestBullets.length > 18) this.dislodgeChestShot(this.chestBullets.shift()!);
      if (!this.elevenSpecialImpact(p, p.x, p.y)) this.specialImpact(p.x, p.y, 'gold');
      this.burstSpecial(p.x, p.y, 'gold', 8);
      return { res: 'hit' };
    }

    const rock = this.rock;
    if (!rock) return { res: 'none' };
    const sc = this.level.radius / 196;
    const a = -this.rot;
    const dx = p.x - CX, dy = p.y - ty;
    const local = { x: (dx * Math.cos(a) - dy * Math.sin(a)) / sc, y: (dx * Math.sin(a) + dy * Math.cos(a)) / sc };

    if (this.bonusCoins?.length && (mode === 'bonus' || mode === 'boulder')) {
      // Gold rings rotate with the rock; in bonus mode a coin consumes the shot,
      // while in boulder (Diamond) mode the shot collects the coin stuck on the
      // stone AND continues through to crack the rock beneath it.
      const hitRad = 16 + this.weapon.coinRadius * 0.35;
      const hitRadSq = hitRad * hitRad;
      let coin: BonusCoin | undefined;
      for (let ci = 0; ci < this.bonusCoins.length; ci++) {
        const cand = this.bonusCoins[ci];
        if (cand.taken) continue;
        const cdx = local.x - cand.lx;
        const cdy = local.y - cand.ly;
        if (cdx * cdx + cdy * cdy < hitRadSq) {
          coin = cand;
          break;
        }
      }
      if (coin) {
        coin.taken = true;
        const x = CX + Math.cos(coin.angle + this.rot) * coin.radius * sc;
        const y = ty + Math.sin(coin.angle + this.rot) * coin.radius * sc;
        this.coins += 2;
        this.score += 50;
        if (mode === 'bonus') {
          if (!this.elevenSpecialImpact(p, x, y)) this.specialImpact(x, y, 'gold');
          this.burstSpecial(x, y, 'gold', 6);
          sfx.coin();
          if (this.bonusCoins.every(c => c.taken)) this.finishSpecialStage();
          return { res: 'hit' };
        }
        this.burstSpecial(x, y, 'gold', 5);
        sfx.coin();
      }
    }

    const dmg = Math.round((4 + (this.weapon.points - 1) * 2 + (p.big ?? 0) * 2) * this.dmgMult);
    // Both rounds use the same rock, and both must fall apart at a decent clip:
    // one shot shatters the chunk it lands on plus the neighbours inside the
    // splash ring.
    const splash = ROCK_SPLASH + (this.weapon.explode ? 30 : 0);
    const projectileRadius = diamondCoreProjectileRadius(
      this.weapon.half * (1 + (p.big ?? 0) * 0.3),
      projectileSizeMultiplier(this.weapon.id, !!p.mini, !!p.giant), sc,
    );
    const hit = rock.hitAt(local, dmg, splash, projectileRadius, rockSplashDamage(dmg));
    if (!hit) return { res: 'none' };
    if (hit.kind === 'diamond') {
      this.diamondPing = 1;
      // The core is collectible only in the designated boulder stage; the
      // bonus-rock round keeps its own ring-coin objective.
      if (mode !== 'boulder' || this.centerDiamondCollected) {
        if (!this.elevenSpecialImpact(p, p.x, p.y)) this.specialImpact(p.x, p.y, 'diamond');
        this.burstSpecial(p.x, p.y, 'diamond', 8);
        sfx3.chime();
        return { res: 'hit' };
      }
      this.centerDiamondHits++;
      this.addText(`${T('BERLIAN')} ${this.centerDiamondHits}/${BOULDER_DIAMOND_HITS}`, p.x, p.y - 26, '#a5f3fc', 22);
      this.sink.light(p.x, p.y, 90 + this.centerDiamondHits * 20, '103,232,249', 0.35);
      if (!this.elevenSpecialImpact(p, p.x, p.y)) this.specialImpact(p.x, p.y, 'diamond');
      this.burstSpecial(p.x, p.y, 'diamond', this.centerDiamondHits === BOULDER_DIAMOND_HITS ? 28 : 10);
      sfx3.chime();
      if (this.centerDiamondHits >= BOULDER_DIAMOND_HITS) {
        this.centerDiamondCollected = true;
        this.diamondHoldUntil = this.time + 3.1; // let the flight + reward burst finish before the next stage
        this.events.onDiamondCollected?.(50, true, { x: p.x, y: p.y });
        this.addText('DIAMOND DIDAPAT! +50', p.x, p.y - 54, '#e0f7ff', 28);
        this.sink.light(p.x, p.y, 190, '210,240,255', 0.8);
        this.burstSpecial(p.x, p.y, 'diamond', 56);
        sfx4.shatter();
        sfx2.jackpot();
        const scattered = this.rock?.shatterAll() ?? [];
        if (scattered.length) this.detachRockCells(scattered);
        this.finishSpecialStage();
      }
      return { res: 'hit' };
    }
    this.level.hp = hit.remaining;
    this.score += 1 + hit.broken.length * 10;
    // A Slide 7 round brings its own impact and shake.
    const ownRockHit = this.elevenSpecialImpact(p, p.x, p.y);
    if (!ownRockHit) {
      this.specialImpact(p.x, p.y, 'rock');
      // Rock impacts retain their particles and shake without interrupting
      // rapid coin-farming or pausing the wheel and player controls.
      this.shake = Math.max(
        this.shake,
        mode === 'bonus' ? (hit.broken.length ? 3.2 : 1.2) : (hit.broken.length ? 5 : 2),
      );
    }
    // Every round belongs to the exact cell it struck, including rounds that
    // break it immediately. Splash damage can knock off previously hit cells.
    const tip = 7 / sc;
    if (this.rockBullets.length >= 28) this.rockBullets.shift();
    this.rockBullets.push(this.makeEmbeddedShot(p,
      local.x - Math.sin(this.rot) * tip, local.y - Math.cos(this.rot) * tip,
      Math.PI / 2 - this.rot, hit.struckId));
    if (hit.broken.length) {
      this.detachRockCells(hit.broken);
      for (const cell of hit.broken) {
        const x = CX + (cell.x * Math.cos(this.rot) - cell.y * Math.sin(this.rot)) * sc;
        const y = ty + (cell.x * Math.sin(this.rot) + cell.y * Math.cos(this.rot)) * sc;
        const outward = Math.atan2(y - ty, x - CX);
        for (let i = 0; i < 2; i++) {
          if (this.rockFragments.length >= 28) this.rockFragments.shift();
          const speed = rand(130, 360);
          this.rockFragments.push({
            x, y, vx: Math.cos(outward) * speed + rand(-70, 70), vy: Math.sin(outward) * speed - rand(90, 170),
            rot: rand(0, TAU), vr: rand(-10, 10), size: rand(5, 12), seed: rand(0, 10), life: 1.3, max: 1.3,
          });
        }
        this.burstSpecial(x, y, 'rock', 2);
      }
      if (!isSlide23Weapon(this.weapon.id)) sfx4.shatter();
    } else if (!isSlide23Weapon(this.weapon.id) && !ownRockHit) sfx.hit();
    if (hit.remaining === 0 && mode === 'boulder') this.finishSpecialStage();
    return { res: 'hit' };
  }

  private dislodgeChestShot(shot: EmbeddedShot) {
    const side = shot.x < 0 ? -1 : 1;
    this.flyers.push({
      x: CX + shot.x * BOARD_PACKAGE_SCALE, y: this.targetY + CHEST_LIFT + shot.y * BOARD_PACKAGE_SCALE + BLEN / 2,
      vx: side * rand(100, 240), vy: rand(-160, 50), rot: 0, vr: side * rand(7, 14),
      kind: 'bullet', w: shot.w, hue: shot.hue, busterPellet: shot.busterPellet, scale: shot.scale,
    });
  }

  private makeEmbeddedShot(p: Proj, x: number, y: number, angle: number, cellId?: number): EmbeddedShot {
    return {
      x, y, angle, cellId, age: 0, w: this.weapon.id, big: p.big ?? 0, tint: p.tint,
      xenoHybrid: this.weapon.id === 'xeno' && getGunEffect('xeno') === 'xeno_hybrid',
      busterPellet: this.weapon.id === 'mega_buster' && this.setElevenLive && !!p.setEleven && !(p.big ?? 0),
      hue: p.hue ?? (this.weapon.id === 'firework' ? gunState.rocketHue : this.weapon.id === 'yoyo' ? gunState.yoyoHue : undefined),
      flash: this.weapon.id === 'firework' || this.weapon.id === 'yoyo' || this.weapon.id === 'diamond' || this.weapon.id === 'bazooka' ? 1 : undefined,
      scale: (1 + (p.big ?? 0) * 0.3) * projectileSizeMultiplier(this.weapon.id, !!p.mini, !!p.giant),
      // A slide-3 round is drawn with slide 3's own stuck art (see `s7Embeds`).
      s7: this.setSevenLive ? p.setSeven : undefined,
    };
  }

  private detachRockCells(cells: BrokenRockCell[]) {
    const ids = new Set(cells.map(cell => cell.id));
    const bullets = new Map<number, EmbeddedShot[]>();
    this.rockBullets = this.rockBullets.filter(shot => {
      if (shot.cellId === undefined || !ids.has(shot.cellId)) return true;
      const group = bullets.get(shot.cellId) ?? [];
      group.push(shot);
      bullets.set(shot.cellId, group);
      return false;
    });
    const sc = this.level.radius / 196;
    const rot = this.rot;
    if (this.level?.mode === 'boulder' && this.bonusCoins?.length) {
      // Coins in Diamond Breaker are physically stuck to the stone: when the
      // stone chunk under a coin shatters away, pop & collect that coin so no
      // orphan coins float over empty air.
      let poppedBursts = 0;
      const attachRadSq = 28 * 28;
      for (let ci = 0; ci < this.bonusCoins.length; ci++) {
        const coin = this.bonusCoins[ci];
        if (coin.taken) continue;
        let attached = this.centerDiamondCollected;
        if (!attached) {
          for (let bi = 0; bi < cells.length; bi++) {
            const dx = coin.lx - cells[bi].x;
            const dy = coin.ly - cells[bi].y;
            if (dx * dx + dy * dy <= attachRadSq) {
              attached = true;
              break;
            }
          }
        }
        if (attached) {
          coin.taken = true;
          this.coins += 2;
          this.score += 50;
          if (poppedBursts < 6) {
            const wx = CX + Math.cos(coin.angle + rot) * coin.radius * sc;
            const wy = this.targetY - this.bump * 9 + Math.sin(coin.angle + rot) * coin.radius * sc;
            this.burstSpecial(wx, wy, 'gold', 3);
            poppedBursts++;
          }
        }
      }
      if (poppedBursts > 0 && this.time - this.lastCoinSound > 0.06) {
        sfx.coin();
        this.lastCoinSound = this.time;
      }
    }
    for (const cell of cells) {
      const x = CX + (cell.x * Math.cos(rot) - cell.y * Math.sin(rot)) * sc;
      const y = this.targetY - this.bump * 9 + (cell.x * Math.sin(rot) + cell.y * Math.cos(rot)) * sc;
      const outward = Math.atan2(y - this.targetY, x - CX);
      const speed = rand(120, 290);
      if (this.fallenCells.length >= 24) this.fallenCells.shift();
      this.fallenCells.push({
        id: cell.id, cx: cell.x, cy: cell.y, x, y,
        vx: Math.cos(outward) * speed + rand(-55, 55),
        vy: Math.sin(outward) * speed - rand(140, 230),
        rot, vr: rand(-7, 7), life: 1.5, bullets: bullets.get(cell.id) ?? [],
      });
    }
  }

  /**
   * A Slide 7 round lands on the rock, the chest or the bonus ring with its
   * own slide-7 impact — its burst, light, shake, hit-stop and its own impact
   * accent and thunk — exactly as it lands on the wheel. Slide 1's generic hit
   * look and hit voice for that gun were never part of the slide-7 weapon.
   * Returns true when slide 7 took the hit (the stage's own material debris,
   * coin and chime still play).
   */
  private elevenSpecialImpact(p: Proj, x: number, y: number): boolean {
    if (this.sevenSpecialImpact(p, x, y)) return true;
    if (!this.setElevenLive) return false;
    if (p.setEleven) {
      this.s11.impact(x, y, p.setEleven);
      return true;
    }
    // A beam's or the railgun's hidden knife: slide 7's own hit already played.
    return !!(p.setElevenPending || p.s11Ghost);
  }

  /**
   * A slide-3 round lands on the rock, the chest or the bonus ring with slide
   * 3's own `hit()` — its burst, light, shake, hit-stop and voice — where it
   * struck. Only the wheel-only half of that hit is skipped (cracks painted
   * into the wheel, decals, the rim bounce, the round stuck in the wheel): the
   * stuck round is kept instead, so the rock and the chest show slide 3's own
   * stuck art (`drawStuckItem`) for it.
   */
  private sevenSpecialImpact(p: Proj, x: number, y: number): boolean {
    if (!this.setSevenLive || !(p.setSeven || p.s7Ghost || p.setSevenPending)) return false;
    const shot = p.setSeven;
    if (!shot) return true;
    const fx = this.s7;
    fx.special = true;
    fx.captured = null;
    try {
      shot.hit(norm(Math.atan2(y - this.targetY, x - CX) - this.rot), x, y);
    } finally {
      fx.special = isSpecial(this.level.mode);
    }
    if (fx.captured) this.s7Embeds.set(shot, fx.captured);
    fx.captured = null;
    fx.release(shot);
    this.s7Last = undefined;
    return true;
  }

  /** Slide 3's stuck round for each round embedded in the rock or the chest. */
  private s7Embeds = new WeakMap<SevenShot, StuckItem>();

  /** Keep the normal weapon's signature hit effect, with the correct material palette. */
  private specialImpact(x: number, y: number, material: 'rock' | 'diamond' | 'gold') {
    const w = this.weapon;
    const fx = FX[w.id];
    const dx = x - CX, dy = y - this.targetY;
    const dist = Math.hypot(dx, dy) || 1;
    const chips = material === 'rock' ? ['#aab6c6', '#627388', '#e1ebf7']
      : material === 'diamond' ? ['#a5f3fc', '#67e8f9', '#e0f2fe']
        : ['#fbbf24', '#fde68a', '#a16207'];
    const s1Special = this.setOneLive && this.s1Last ? this.s1Last : null;
    if (s1Special) {
      const theta = Math.atan2(dy, dx);
      impactSetOne(this.s1, s1Special, x, y, theta, this.s1Hooks(), (n) => setOneSfx.play(n));
    }
    this.slide2Impact(x, y);
    if (w.id === 'xeno' && getGunEffect('xeno') === 'xeno_hybrid') {
      this.xenoMolecularImpact(x, y);
      this.splash(x, y, 0.8);
    }
    if (w.id !== 'firework' && w.id !== 'yoyo' && w.id !== 'keris' && w.id !== 'diamond' && w.id !== 'bazooka'
      && !s1Special) {
      spawnImpact(this.sink, fx, w, x, y, dx / dist, dy / dist, chips);
    }
    if (w.id === 'yoyo') {
      spawnYoyoStickBurst(this.getYoyoState(), x, y, gunState.yoyoHue, CX, GUN_Y - 10);
    }
    if (w.id === 'keris') {
      spawnKerisImpact(this.getKerisState(), x, y, CX, GUN_Y - 6);
    }
    if (w.id === 'diamond') {
      spawnDiamondStickBurst(this.getDiamondState(), x, y, 1);
    }
    if (w.id === 'bazooka') {
      this.getBazookaState().onHit(x, y, 1.05);
    }
    this.camY -= fx.kick;
    this.bump = Math.max(this.bump, material === 'rock' ? 0.55 : 0.2);
    this.shake = Math.max(this.shake, 3 + fx.kick * 0.8);
    if (fx.tint) {
      this.tintA = Math.max(this.tintA, fx.tint);
      this.tintRgb = fx.light;
    }
    if (isSlide23Weapon(w.id) && !(w.id === 'blackhole' && this.slide2Void)) {
      const hitIdx = (this.perkCount = (this.perkCount || 0) + 1) - 1;
      if (w.id === 'yoyo') slide23Sfx.hit('yoyo-spin', 0);
      if (w.id === 'firework') fireworkSfx.hit(hitIdx);
      else slide23Sfx.hit(w.id, hitIdx);
    } else if (s1Special) {
      // Slide-7's impact recipe already played its own hit voice.
    } else if (HIT_SFX[w.id]) {
      HIT_SFX[w.id]!();
    } else if (w.energy && !w.slow && !w.pullCoins) {
      sfx.zap();
    }
    // Reuse the weapon's normal-stage signature effects without importing
    // classic-target perks (which would alter special-stage coin accounting).
    if (w.explode) this.explodeAt(x, y, w.id === 'bazooka' ? 1.3 : w.id === 'bamboo' ? 1.2 : 1, w.explodeFx ?? 'fire');
    if (w.id === 'cricket') {
      this.particles.push({ x, y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 180, color: '#7cc8ff', kind: 'ring', rot: 0, vr: 0, g: 0 });
      this.shake = Math.max(this.shake, 12);
    }
    if (w.id === 'storm') this.sink.push({ x, y: -20, tx: x, ty: y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 4, color: '#dbeafe', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    if (w.id === 'meteor') this.sink.push({ x: x - 160, y: -40, tx: x, ty: y, vx: 0, vy: 0, life: 0.15, max: 0.15, size: 5, color: '#fb923c', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    // Match the normal stage's weapon-specific flourish as well as its shared
    // impact profile. Only visual effects go here: chest coins still need to
    // fly to the counter, and obstacle perks must not invent classic targets.
    if (w.burn || w.id === 'dragon') for (let i = 0; i < 14; i++) {
      this.sink.push({ x: x + rand(-10, 10), y, vx: rand(-120, 120), vy: rand(-200, 40), life: rand(0.3, 0.6), max: 0.6,
        size: rand(5, 10), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -200 });
    }
    if (w.confetti) for (let i = 0; i < 28; i++) {
      this.sink.push({ x, y, vx: rand(-340, 340), vy: rand(-370, -80), life: rand(0.8, 1.4), max: 1.4,
        size: rand(3, 6), color: pick(['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c']),
        kind: 'chip', rot: rand(0, TAU), vr: rand(-25, 25), g: 350 });
    }
    if (w.rope && w.id !== 'yoyo') this.sink.push({ x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 70, color: '#a5f3fc', kind: 'ring', rot: 0, vr: 0, g: 0 });
    if (w.notes) {
      sfx3.note(this.perkCount++ % 10);
      for (let i = 0; i < 3; i++) this.sink.push({ x: x + rand(-20, 20), y, vx: rand(-60, 60), vy: rand(-160, -80),
        life: 1.1, max: 1.1, size: 18, color: pick(['#fde68a', '#fca5a5', '#a5f3fc', '#bbf7d0']), kind: 'text',
        rot: 0, vr: 0, g: 0, text: pick(['♪', '♫', '♬']) });
    }
    if (w.id === 'fish') sfx.splash();
    if (material === 'rock' && w.slow) {
      const water = w.slowStyle === 'water' || w.id === 'soaker';
      const honey = w.slowStyle === 'honey';
      if (this.slowT <= 0) this.addText(w.slowText ?? '❄ BEKU!', x, y + 50,
        honey ? '#ffd56c' : water ? '#93c5fd' : '#bff1ff', 22);
      this.applySlow(w.slowTime ?? 1.3, w.slowFactor ?? 0.3, w.slowRgb ?? '170,230,255',
        honey ? 'honey' : water ? 'water' : 'ice');
      if (w.id !== 'soaker' && w.id !== 'honey') for (let i = 0; i < 10; i++) {
        const a = rand(0, TAU), speed = rand(60, 260);
        this.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(0.4, 0.8), max: 0.8,
          size: rand(2, 4), color: pick(water ? ['#ffffff', '#93c5fd', '#3b82f6'] : ['#ffffff', '#d6f6ff', '#9be7ff']),
          kind: 'chip', rot: rand(0, TAU), vr: rand(-10, 10), g: water ? 900 : 300 });
      }
    }
  }

  /**
   * MINI/GIANT for a round that an imported layer paints itself.
   *
   * Slide 1 scales its own shot art inside the shared projectile renderer, so
   * the treasure star's size card never reached a slide-7/9/11/2 round: the
   * entry hole it made on the rock or the chest was small (`EmbeddedShot.scale`
   * always carried the buff) while the round in flight stayed full size, which
   * is why the buff looked like it did nothing at all. The carried round is
   * drawn through the same multiplier here.
   */
  /**
   * How far a round leans off the world's "straight up" flight line.
   *
   * Every shot sprite is built for an upright muzzle: nose up its own frame,
   * tail behind. The round travels along its *live* velocity — a speed buff, a
   * charge and the landscape aim all move it — so the angle has to come from
   * the round, never from the weapon's base speed.
   */
  private flightAngle(p: { vx: number; vy: number }): number {
    return Math.atan2(p.vx, -p.vy);
  }

  /**
   * Draw a round a ported layer paints, in the frame the round is flying.
   *
   * Those layers author their artwork for an upright muzzle. Landscape lets the
   * barrel lean, so a round kept in the layer's upright frame leaves the muzzle
   * pointing straight across the screen while its tracer flies off at an angle:
   * the whole shot (and its tail) leans against its own path. Turning the
   * painting about the round's own centre puts it back on the flight line.
   * Slide 9 and slide 11 already turn their own tracers, so they pass
   * `turn: false`.
   */
  private drawCarriedRound(c: CanvasRenderingContext2D, p: Proj, paint: () => void, turn = true) {
    const k = projectileSizeMultiplier(this.weapon.id, !!p.mini, !!p.giant);
    const ang = turn ? this.flightAngle(p) : 0;
    if (k === 1 && ang === 0) {
      paint();
      return;
    }
    c.save();
    c.translate(p.x, p.y);
    if (ang !== 0) c.rotate(ang);
    if (k !== 1) c.scale(k, k);
    c.translate(-p.x, -p.y);
    paint();
    c.restore();
  }

  /** Draw yellow tap pellets in the wheel's already-transformed coordinates. */
  private drawBusterWheelPellets(c: CanvasRenderingContext2D, radius: number) {
    for (const it of this.items) {
      if (it.type !== 'bullet' || !it.busterPellet) continue;
      c.save();
      c.rotate(it.angle);
      const itemR = it.px !== undefined && it.py !== undefined
        ? Math.hypot(it.px, it.py)
        : this.bossRadiusAt(it.angle, radius);
      c.translate(itemR + 3, 0);
      if (it.scale) c.scale(it.scale, it.scale);
      drawBusterPelletOrb(c, 0, 0, this.time + it.angle * 2);
      c.restore();
    }
  }

  private drawEmbeddedShot(c: CanvasRenderingContext2D, shot: EmbeddedShot, x: number, y: number, surfaceOffset = 0) {
    const item = shot.s7 ? this.s7Embeds.get(shot.s7) : undefined;
    if (item) {
      // Slide 3's own stuck round, standing out of the surface it struck the
      // way it stands out of slide 3's wheel rim.
      item.t = shot.age;
      c.save();
      c.translate(x, y);
      c.rotate(shot.angle);
      c.translate(surfaceOffset, 0);
      drawStuckItem(c, item, 0, this.s7State?.time ?? this.time);
      c.restore();
      return;
    }
    c.save();
    c.translate(x, y);
    c.rotate(shot.angle - Math.PI / 2);
    // The rock stores the impact 7px inside its cell; the chest stores it
    // half a bullet inside the lid. Align honey, peeled fruit, hornet,
    // energy orbs and celestial star art without moving the hitboxes.
    const surfaceAligned = shot.w === 'honey' || shot.w === 'banana'
      || shot.w === 'bee' || shot.w === 'moonbeam' || shot.w === 'plasma' || shot.w === 'blackhole'
      || shot.w === 'xeno' || shot.w === 'dora' || shot.w === 'pred' || shot.busterPellet;
    if (surfaceAligned) c.translate(0, surfaceOffset - (getWeapon(shot.w).stick + EMBED)
      * (shot.w === 'moonbeam' ? 0.53 : 0.5));
    if (shot.w === 'snowball') c.translate(0, surfaceOffset);
    if (shot.w === 'firework') {
      c.translate(0, surfaceOffset - FIREWORK_EMBED_NOSE);
      gunState.rocketHue = shot.hue ?? 340;
      gunState.rocketFlash = shot.flash ?? 0;
    }
    if (shot.w === 'yoyo') {
      c.translate(0, surfaceOffset + 4);
      gunState.yoyoHue = shot.hue ?? 0;
      gunState.yoyoFlash = shot.flash ?? 0;
    }
    if (shot.w === 'diamond') {
      c.translate(0, surfaceOffset + 9);
      gunState.diamondFlash = shot.flash ?? 0;
      gunState.diamondSeed = (shot.x + shot.y) * 0.1;
    }
    if (shot.w === 'bazooka') {
      c.translate(0, surfaceOffset - 5);
      gunState.bazookaHue = shot.hue ?? 45;
      gunState.bazookaFlash = shot.flash ?? 0;
      gunState.bazookaSeed = (shot.x + shot.y) * 0.1;
      gunState.bazookaBite = Math.max(0.38, 1 - shot.age * 0.8);
    }
    if (shot.w === 'gauntlet_cannon') {
      c.translate(0, surfaceOffset - 5.5);
    }
    if (shot.w === 'magnet') {
      c.translate(0, surfaceOffset - 4);
    }
    c.scale(shot.scale, shot.scale);
    const oldBig = gunState.bigShot, oldTint = gunState.tint;
    gunState.bigShot = shot.big;
    if (shot.tint) gunState.tint = shot.tint;
    // ---- specialized stuck rendering (game-3: drawAirVortex, drawPlasmaScar) ----
    const seed = (shot.x * 7 + shot.y * 3) % 1000;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const glowAt = (gx: number, gy: number, gr: number, gcolor: string, ga: number) => {
      c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = Math.min(1, ga); c.fillStyle = gcolor; c.beginPath(); c.arc(gx, gy, gr, 0, TAU); c.fill(); c.restore();
    };
    const rgbaH = (h: string, a: number) => { const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
    let skipProj = false;
    if (shot.busterPellet) {
      // Rock cells and the open chest carry the very same orb with their
      // surface; falling cells retain it as they tumble away.
      const surfaceY = (getWeapon(shot.w).stick + EMBED) * 0.5 / shot.scale;
      drawBusterPelletOrb(c, 0, surfaceY, this.time + seed * 0.01);
      skipProj = true;
    } else if (shot.w === 'xeno') {
      if (shot.xenoHybrid) {
        // The special surface has no wheel metaball layer: paint its liquid
        // puddle over the same growing corrosion mark in surface coordinates.
        const surfaceY = (getWeapon(shot.w).stick + EMBED) * 0.5 / shot.scale;
        drawXenoCorrosion(c, 0, surfaceY - 8, this.time, seed, shot.age);
        drawXenoSpecialPuddle(c, 0, surfaceY, this.time);
      }
      skipProj = true;
    } else if (shot.w === 'dora') {
      // game-3 drawAirVortex: rotating torus ring, curls, impact star
      skipProj = true;
      const pop = 1 + Math.max(0, 0.6 - shot.age) * 1.2;
      c.save();
      c.translate(10, 0);
      c.scale(pop, pop);
      c.globalCompositeOperation = 'lighter';
      glowAt(6, 0, 30, '#9fdcff', 0.35);
      c.globalCompositeOperation = 'source-over';
      c.lineCap = 'round';
      for (let k = 0; k < 3; k++) {
        const ph = this.time * 6 + k * 2.1 + seed;
        const ry = 16 - k * 3, rxx = 5 + Math.abs(Math.sin(ph)) * 3;
        c.strokeStyle = `rgba(255,255,255,${0.85 - k * 0.22})`;
        c.lineWidth = 2.5 - k * 0.6;
        c.beginPath(); c.ellipse(4 + k * 6, 0, rxx, ry, 0, 0, TAU); c.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const a = this.time * 5 + (i / 4) * TAU + seed;
        const px = 8 + Math.cos(a) * 6, py = Math.sin(a) * 17;
        c.strokeStyle = 'rgba(200,235,255,0.8)'; c.lineWidth = 1.6;
        c.beginPath(); c.arc(px, py, 4, a, a + 3.6); c.stroke();
      }
      const sa = Math.max(0, 1 - shot.age / 0.5);
      if (sa > 0) {
        c.fillStyle = rgbaH('#fff4a0', sa);
        c.beginPath();
        for (let i = 0; i < 16; i++) { const an = (i / 16) * TAU; const r = i % 2 ? 6 : 16 * (1 + shot.age * 2); i ? c.lineTo(-4 + Math.cos(an) * r, Math.sin(an) * r) : c.moveTo(-4 + r, 0); }
        c.closePath(); c.fill();
      }
      c.restore();
    } else if (shot.w === 'pred') {
      // game-3 drawPlasmaScar: charred spur, molten veins, plasma residue, arcs
      skipProj = true;
      const hot = clamp01(1 - shot.age / 6);
      const pop = 1 + Math.max(0, 0.4 - shot.age) * 1.5;
      c.save();
      c.scale(pop, pop);
      c.beginPath(); c.moveTo(-6, -9); c.lineTo(14, -6); c.lineTo(26, -1); c.lineTo(28, 1); c.lineTo(16, 6); c.lineTo(-6, 9); c.closePath();
      const sg = c.createLinearGradient(-6, 0, 28, 0);
      sg.addColorStop(0, hot > 0.3 ? '#3a1a08' : '#1a110a'); sg.addColorStop(1, '#0a0806');
      c.fillStyle = sg; c.fill();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = rgbaH('#ff7a20', 0.5 + hot * 0.5); c.lineWidth = 1.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-4, 0); c.lineTo(6, -2); c.lineTo(14, 1); c.lineTo(22, 0); c.stroke();
      c.strokeStyle = rgbaH('#ffe0a0', hot); c.lineWidth = 0.7; c.stroke();
      glowAt(2, 0, 14 + hot * 16, '#ff7a20', 0.3 + hot * 0.6);
      const pulse = 0.6 + 0.4 * Math.sin(this.time * 14 + seed);
      glowAt(0, 0, 22, '#6fd3ff', (0.2 + hot * 0.5) * pulse);
      glowAt(0, 0, 8, '#ffffff', hot * pulse);
      if (Math.random() < 0.4 + hot * 0.5) {
        c.beginPath(); let ax = 0, ay = 0; c.moveTo(ax, ay);
        const a = rand(0, TAU);
        for (let k = 0; k < 4; k++) { ax += Math.cos(a) * 5 + rand(-4, 4); ay += Math.sin(a) * 5 + rand(-4, 4); c.lineTo(ax, ay); }
        c.strokeStyle = rgbaH('#6fd3ff', 0.8); c.lineWidth = 2; c.stroke();
        c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke();
      }
      c.globalCompositeOperation = 'source-over';
      c.restore();
    }
    if (!skipProj) this.drawProj(c, shot.w, undefined, shot.age, shot.w === 'snowball' || surfaceAligned || shot.w === 'firework' || shot.w === 'yoyo' || shot.w === 'diamond' || shot.w === 'bazooka' || shot.w === 'gauntlet_cannon' || shot.w === 'magnet');
    gunState.bigShot = oldBig;
    gunState.tint = oldTint;
    gunState.rocketFlash = 0;
    gunState.yoyoFlash = 0;
    gunState.diamondFlash = 0;
    gunState.diamondSeed = 0;
    gunState.bazookaFlash = 0;
    c.restore();
  }

  private burstSpecial(x: number, y: number, type: 'rock' | 'diamond' | 'gold', count: number) {
    const palette = type === 'gold' ? ['#ffe99e', '#ffc83d', '#ffffff']
      : type === 'diamond' ? ['#a5f3fc', '#ffffff', '#67e8f9'] : ['#aab6c6', '#6a7b91', '#e1ebf7'];
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU), speed = rand(100, 320);
      this.particles.push({
        x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 80,
        life: rand(0.35, 0.7), max: 0.7, size: rand(2, 5), color: pick(palette),
        kind: type === 'rock' ? 'shard' : 'star', rot: rand(0, TAU), vr: rand(-12, 12), g: type === 'rock' ? 1000 : 280,
      });
    }
  }

  private payStageReward() {
    if (this.stageRewardPaid || this.state !== 'clear' || !isSpecial(this.level.mode)) return;
    // A chest hit isn't a payout until every coin has bounced and reached the HUD.
    if (this.level.mode === 'treasure' && this.treasureCoins.length) return;
    this.stageRewardPaid = true;
    const earned = this.coins - this.stageStartCoins;
    if (this.level.mode === 'treasure') {
      this.addText(`🧰 HARTA +${earned}!`, CX, this.targetY + 185, '#fde68a', 26);
      this.stateT = 0; // Show the final amount before loading the next level.
    }
    // Treasure coins were deposited one by one on arrival. Stage rewards for
    // stone/bonus (or a game without onTreasureCoin) are still paid here.
    const unbanked = this.level.mode === 'treasure' && this.events.onTreasureCoin ? 0 : earned;
    const diamondReward = this.level.mode === 'boulder' && this.centerDiamondCollected ? 50 : 0;
    if (this.events.onStageReward) {
      this.bankedCoins += unbanked;
      this.events.onStageReward(this.level.mode, this.level.n, unbanked, diamondReward);
    }
  }

  private finishSpecialStage() {
    if (this.state !== 'play' || !isSpecial(this.level.mode)) return;
    const mode = this.level.mode;
    this.state = 'clear';
    this.stageClearBurstMax = 0.95;
    this.stageClearBurstT = 0.95;
    this.stageClearBurstBoss = false;
    this.stateT = 0;
    this.projs = [];
    this.star = null;
    this.holding = false;
    this.choosingBuff = false;
    this.flashWhite = 0.42;
    this.shake = Math.max(this.shake, 8);
    if (mode === 'boulder') {
      this.coins += 3;
      this.score += 75;
      this.addText(T('BERLIAN BERSIH! +3 APEL'), CX, this.targetY + 185, '#a5f3fc', 28);
    } else if (mode === 'bonus') {
      this.addText(`🪙 BONUS +${this.coins - this.stageStartCoins}!`, CX, this.targetY + 185, '#fde68a', 26);
    } else if (this.treasureCoins.length) {
      this.addText(T('🪙 KOIN BERTEBARAN!'), CX, this.targetY + 185, '#fde68a', 26);
    }
    this.payStageReward();
    this.sink.light(CX, this.targetY, 250, '255,255,255', 0.8);
    this.burstSpecial(CX, this.targetY, mode === 'boulder' ? 'diamond' : 'gold', 28);
    if (!this.setTwoVoice('clear')) sfx.clear(this.weapon?.id);
  }

  private updateTreasureShower(dt: number) {
    this.coinPulse = Math.max(0, this.coinPulse - dt * 5);
    if (!this.treasureCoins.length) return;
    const landed = advanceTreasureCoins(
      this.treasureCoins,
      dt,
      (sx, sy) => { const at = this.screenToWorld(sx, sy); this.burstSpecial(at.x, at.y, 'gold', 3); },
      this.showerScreen,
    );
    if (landed > 0) {
      this.coins += landed;
      this.score += landed * 25;
      this.coinPulse = 1;
      this.sink.light(W - 28, 34, 58, '255,215,90', 0.18);
      this.burstSpecial(W - 28, 34, 'gold', Math.min(7, landed + 2));
      if (this.time - this.lastCoinSound > 0.08) {
        sfx.coin();
        this.lastCoinSound = this.time;
      }
      if (this.events.onTreasureCoin) {
        this.bankedCoins += landed;
        this.events.onTreasureCoin(landed);
      }
    }
    if (this.state === 'clear' && !this.treasureCoins.length) this.payStageReward();
  }

  /**
   * A spent magazine on a live stage reloads itself.
   *
   * Running the allowance dry while the wheel or the boss is still standing used
   * to leave the player holding a gun that could not fire — a soft dead end the
   * stage never recovered from. The gun now goes into its usual `ISI ULANG…`
   * beat (inside the gun's own reload time, no extra delay) and comes back full.
   */
  private startDryReload() {
    if (this.state !== 'play' || this.reloadT > 0 || this.ammoLeft > 0) return;
    if (this.projs.length || this.aiming || this.charging || this.choosingBuff) return;
    if (this.weapon.id === 'snowball' && this.snowLoaded > 0) return;
    this.reloadT = 0.65;
  }

  private advanceReload(dt: number) {
    if (this.reloadT <= 0) return;
    this.reloadT = Math.max(0, this.reloadT - dt);
    if (this.reloadT > 0) return;
    // Every stage refills its allowance here: the quota is a budget for one
    // magazine, not a life, so an empty gun with the wheel (or the boss) still
    // standing reloads instead of ending the run.
    if (this.ammoLeft === 0) this.ammoLeft = this.level.ammo * this.maxAmmoMult;
    if (this.weapon.id === 'snowball') this.snowLoaded = Math.min(SNOWBALL_MAG_SIZE, this.ammoLeft);
  }

  /**
   * Landscape gun control.
   *
   * W/S slide the gun along the screen's vertical axis (world +x), and the gun
   * tilts towards the pointer — on screen it starts out aimed to the right, so a
   * pointer above it tilts the barrel up. Both are eased and capped, and both
   * are locked to 0 in portrait, where the gun stays exactly where it was.
   */
  private updateGunPose(dt: number) {
    if (this.orientation !== 'landscape') {
      if (this.gunSlide !== 0 || this.gunTilt !== 0) {
        this.gunSlide = 0;
        this.gunTilt = 0;
      }
      return;
    }
    const dir = (this.gunSlideDown ? 1 : 0) - (this.gunSlideUp ? 1 : 0);
    if (dir !== 0) {
      this.gunSlide = Math.max(-GUN_SLIDE_MAX, Math.min(GUN_SLIDE_MAX, this.gunLift + dir * GUN_SLIDE_SPEED * dt));
    }
    // Chase the pointer with a fast exponential ease plus a rate floor: the
    // barrel is never more than a frame or two behind the mouse, yet it still
    // sweeps instead of teleporting when the pointer jumps across the screen.
    const target = this.gunAimAngleAt();
    const now = this.gunTiltNow;
    const step = Math.max(0, Number.isFinite(dt) ? dt : 0);
    const eased = now + (target - now) * (1 - Math.exp(-step * GUN_TILT_EASE));
    const least = GUN_TILT_MIN_RATE * step;
    this.gunTilt = Math.abs(target - eased) <= least ? target : eased;
    this.syncElevenPose();
  }

  /**
   * Where the barrel has to point so the round lands on the pointer.
   *
   * Display (x, y) is world (y, H - x) in landscape, so the pointer becomes a
   * world point the muzzle can be aimed at. The angle is then clamped to the
   * width of the target face: the gun may follow the pointer anywhere on the
   * screen, but the round still lands on the wheel instead of flying past it.
   */
  /**
   * Which way the barrel points, as the atan2 angle slide 9 expects: straight
   * up (world -y) when upright, leaning with the landscape tilt otherwise.
   */
  private get barrelAngle(): number {
    const tilt = this.orientation === 'landscape' ? this.gunTiltNow : 0;
    return -Math.PI / 2 + tilt;
  }

  /** Keep slide 11's own world in the pose the gun is drawn at. */
  private syncElevenPose() {
    const tilt = this.orientation === 'landscape' ? this.gunTiltNow : 0;
    try {
      this.s11?.setGunPose(tilt, this.gunX, CX, this.gunBaseY);
    } catch {
      /* a layer without a gun pose simply stays upright */
    }
  }

  private gunAimAngleAt(): number {
    const pointer = this.aimPointer;
    if (this.orientation !== 'landscape' || !pointer) return 0;
    const pointerWorld = { x: pointer.y, y: H - pointer.x };
    const muzzleY = this.gunBaseY - 6;
    const dx = pointerWorld.x - this.gunX;
    const dy = pointerWorld.y - muzzleY;
    if (Math.abs(dx) + Math.abs(dy) < 12) return 0;
    // Turn from "straight up the world" (world -y) towards the pointer.
    const want = Math.atan2(dx, -dy);
    const R = this.level?.radius ?? 100;
    const travel = Math.max(40, muzzleY - (this.targetY + R));
    // Aim assist: where that line meets the target's face has to stay on the
    // artwork. A gun slid to the edge of the screen would otherwise fire every
    // round past the wheel, so its barrel leans in to keep the shot on target.
    const face = R * 0.9;
    const hitX = Math.max(CX - face, Math.min(CX + face, this.gunX + Math.tan(want) * travel));
    const angle = Math.atan2(hitX - this.gunX, travel);
    return Math.max(-GUN_TILT_MAX, Math.min(GUN_TILT_MAX, angle));
  }

  /**
   * Turn a fresh round onto the barrel's line.
   *
   * Landscape lets the player aim, so a round leaves the muzzle along the
   * barrel instead of straight up the screen. Only the direction of travel
   * changes: speed, spread and every weapon's own recipe stay as they were.
   */
  /**
   * Turn a velocity onto the barrel line.
   *
   * Module weapons (slide 11, slide 3, slide 2…) build their rounds in their own
   * upright frame, so a round adopted from them still pointed straight up: the
   * tracer left the muzzle sideways while the gun leaned. Everything that takes
   * a velocity from a layer goes through here.
   */
  private poseVelocity(vx: number, vy: number): { vx: number; vy: number } {
    if (this.orientation !== 'landscape') return { vx, vy };
    const tilt = this.gunTiltNow;
    if (!tilt) return { vx, vy };
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    return { vx: vx * cos - vy * sin, vy: vx * sin + vy * cos };
  }

  private aimRoundAt(p: Proj) {
    if (this.orientation !== 'landscape') return;
    const tilt = this.gunTiltNow;
    if (!tilt) return;
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    // The muzzle the player sees is the posed one, so the round also starts
    // there: gun-side spawns are rotated about the gun's pivot, exactly like the
    // transform the weapon is drawn through. Anything spawned on the target's
    // side of the stage keeps its own position.
    if (p.y > this.gunBaseY - 150) {
      const dx = p.x - this.gunX;
      const dy = p.y - this.gunBaseY;
      p.x = this.gunX + dx * cos - dy * sin;
      p.y = this.gunBaseY + dx * sin + dy * cos;
      if (p.originX !== undefined) p.originX = p.x;
    }
    const posed = this.poseVelocity(p.vx, p.vy);
    p.vx = posed.vx;
    p.vy = posed.vy;
  }

  private update(rawDt: number) {
    const dt = rawDt * this.pace;
    // The stage clock and gun must stop while the player chooses a star upgrade.
    if (this.choosingBuff) return;
    this.updateGunPose(dt);
    if (this.gunHiddenT > 0) this.gunHiddenT = Math.max(0, this.gunHiddenT - dt);
    if (this.gunEntryDelayT > 0) {
      this.gunEntryDelayT = Math.max(0, this.gunEntryDelayT - dt);
    } else if (this.gunEntryT < GAMEPLAY_GUN_ENTRY_DURATION) {
      this.gunEntryT = Math.min(GAMEPLAY_GUN_ENTRY_DURATION, this.gunEntryT + dt * this.gunEntryRate);
    }
    if (this.stageClearBurstT > 0) this.stageClearBurstT = Math.max(0, this.stageClearBurstT - dt);
    this.rock?.update(dt);
    this.chest?.update(dt);
    this.diamondPing = Math.max(0, this.diamondPing - dt * 3);
    if (isSpecial(this.level.mode) && this.state === 'play') {
      this.stageTime = Math.max(0, this.stageTime - dt);
      if (this.stageTime === 0) {
        if (this.level.mode === 'boulder') {
          this.state = 'fail';
          this.stateT = 0;
          this.projs = [];
          this.holding = false;
          this.addText(T('WAKTU HABIS!'), CX, this.targetY + 185, '#fb7185', 26);
          if (!this.setTwoVoice('fail')) sfx.fail(this.weapon?.id);
        } else this.finishSpecialStage();
      }
    }
    this.startDryReload();
    this.advanceReload(dt);
    this.timeScale += (1 - this.timeScale) * Math.min(1, dt * 2.5);
    // Slide 7's clock for this frame, read before its hit-stop ticks down, as
    // its own `update()` reads it: 12 % for every frame of a hit-stop.
    const stop11 = this.elevenStop > 0;
    const s11dt = (this.hitStop > 0 || stop11 ? dt * 0.12 : dt) * this.timeScale;
    const active11 = this.elevenActive;
    // Slide 3's hit-stop (its `loop()`): every part of its world — the wheel,
    // the rounds, the gun's cooldown, its particles and timers — runs at 22 %
    // for that many real seconds.
    const stop7 = this.sevenStopped;
    let s = dt * this.timeScale;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      s *= 0.06;
    } else if (this.elevenStop > 0 || this.nineStop > 0) {
      s *= 0.12;
    } else if (stop7) {
      s *= 0.22;
    }
    if (this.elevenStop > 0) this.elevenStop -= dt;
    if (this.nineStop > 0) this.nineStop -= dt;
    if (stop7) this.s7State!.feel.stop -= dt;
    // The top of slide 7's frame: its wheel, its light, its gun and its screen
    // shake settle before any of its guns fire or its rounds land, so whatever
    // happens in this frame is seen at full strength, as on slide 7.
    if (active11) {
      this.s11State!.settle(s11dt);
      this.shake *= Math.exp(-(stop11 ? dt * 0.12 : dt) * 11);
    }
    this.camY *= Math.exp(-dt * 11);
    this.rt += dt;
    // ketapel: creak when starting to draw the band
    if (this.weapon.id === 'slingshot' && !this.stretchPlayed && this.rt - this.lastShotRT > 0.16 && !this.setSevenLive) {
      this.stretchPlayed = true;
      if (this.state === 'play' && this.ammoLeft > 0) sfx4.stretch();
    }
    // charge blaster
    if (this.charging) {
      if (this.state !== 'play') this.charging = false;
      this.chargeT += dt;
      const [stMid, stFull] = this.elevenBuster ? [0.45, 1.2] : [0.35, 1];
      const stage = this.chargeT >= stFull ? 2 : this.chargeT >= stMid ? 1 : 0;
      // A slide-11 gun charges with its own whine, glow and lock (see
      // `elevenOwnsCharge`): slide 1's generic charge-up stays quiet then.
      const slide1Charge = !this.layerOwnsCharge;
      if (stage > this.chargeStage) {
        this.chargeStage = stage;
        if (slide1Charge) {
          if (this.weapon.id === 'pred') sfx6.predCharge(stage === 2 ? 1 : 0.65);
          else if (stage === 1) sfx4.chargeStart();
          else sfx4.chargeFull();
          for (const ox of this.gunOffsets) this.sink.push({ x: CX + ox, y: GUN_Y + 2, vx: 0, vy: 0, life: 0.3, max: 0.3, size: stage === 2 ? 90 : 50, color: stage === 2 ? '254,240,138' : '125,211,252', kind: 'shock', rot: 0, vr: 0, g: 0 });
        }
      }
      if (slide1Charge) for (const ox of this.gunOffsets) {
        if (Math.random() < 0.6) {
          const a = rand(0, TAU);
          const d = rand(40, 70);
          this.sink.push({ x: CX + ox + Math.cos(a) * d, y: GUN_Y + 2 + Math.sin(a) * d, vx: -Math.cos(a) * d * 4, vy: -Math.sin(a) * d * 4, life: 0.25, max: 0.25, size: rand(2, 4), color: stage === 2 ? '254,240,138' : '125,211,252', kind: 'glow', rot: 0, vr: 0, g: 0 });
        }
        this.sink.light(CX + ox, GUN_Y, 60 + Math.min(1, this.chargeT) * 120, stage === 2 ? '254,240,138' : '125,211,252', 0.05);
      }
      // Predator: ions spiral into the shoulder-caster core, plus crackling
      // arcs — the slide-7 charge telegraph (game-3 startCharge block).
      if (slide1Charge && this.weapon.id === 'pred') {
        const coreY = GUN_Y - 72;
        for (const ox of this.gunOffsets) {
          if (Math.random() < 0.9) {
            const a = rand(0, TAU);
            const d = rand(40, 90);
            this.sink.push({
              x: CX + ox + Math.cos(a) * d, y: coreY + Math.sin(a) * d,
              vx: -Math.cos(a) * d * 4, vy: -Math.sin(a) * d * 4,
              life: 0.25, max: 0.25, size: 1.4, color: Math.random() < 0.5 ? '#ffffff' : '111,211,255',
              kind: 'spark', rot: 0, vr: 0, g: 0,
            });
          }
          if (Math.random() < Math.min(1, this.chargeT) * 0.5) {
            const a = rand(0, TAU);
            this.sink.push({
              x: CX + ox, y: coreY, vx: Math.cos(a) * rand(14, 34), vy: Math.sin(a) * rand(14, 34),
              life: 0.08, max: 0.08, size: 2, color: '111,211,255', kind: 'bolt', rot: 0, vr: 0, g: 0,
            });
          }
          this.sink.light(CX + ox, coreY, 40 + Math.min(1, this.chargeT) * 90, '111,211,255', 0.12);
        }
      }
      if (slide1Charge && stage === 2 && Math.random() < 0.15) sfx4.chargeHum(2);
    }
    gunState.charge = this.charging ? Math.min(1, this.chargeT) : Math.max(0, gunState.charge - dt * 3);
    this.tintA = Math.max(0, this.tintA - dt * 1.6);
    this.nineShake *= Math.pow(0.001, dt);
    if (this.nineShake < 0.01) this.nineShake = 0;
    this.nineFlashA = Math.max(0, this.nineFlashA - dt * 2.2);
    this.comboPop = Math.max(0, this.comboPop - dt * 4);
    // Tekken-style healthbar delayed red drain effect
    if (this.bossHpRed > this.bossHp) {
      this.bossHpRed = Math.max(this.bossHp, this.bossHpRed - dt * 35);
    }
    for (let i = this.lights.length - 1; i >= 0; i--) {
      this.lights[i].life -= dt;
      if (this.lights[i].life <= 0) this.lights.splice(i, 1);
    }
    if (this.bossEdgePing.length && this.bossEdgePing[0].born < this.time - 0.6) {
      this.bossEdgePing = this.bossEdgePing.filter((p) => this.time - p.born < 0.6);
    }
    this.time += s;
    // Real-time, staggered coin arrivals continue during the treasure-clear
    // celebration, but freeze while the star's choice modal is open.
    this.updateTreasureShower(dt);

    if (this.state !== 'clear') {
      this.levelTime += s;
      const patternV = this.state === 'idle' ? 1.1 : this.level.mode === 'bonus' ? this.level.dir * 1.05
        : this.level.mode === 'treasure' ? 0 : PATTERNS[this.level.pattern](this.levelTime, this.level.base, this.level.dir);
      // Diamond Breaker's rock spins faster than an ordinary wheel: a tighter
      // aim window, so saved shots are what reach the diamond in time.
      const v = patternV * (this.level.mode === 'boulder' ? BOULDER_SPIN_MULT : 1);
      const f0 = this.slowF;
      const slowF = this.slowT > 0 ? f0 + (1 - f0) * Math.max(0, (0.3 - this.slowT) / 0.3) : 1;
      const aimF = this.aiming ? 0.28 : 1;
      // A slide-11 gun brings slide 11's own wheel physics (its `update()`):
      // a frozen wheel — the chrono rifle's stasis — all but stops, at
      // `1 - 0.98 × freeze` like slide 11's, and every hit pushes the wheel on
      // with slide 11's spin boost (the chrono's thaw flings it round). Bosses
      // and the special stages keep their own rhythm: they only ever freeze.
      const s11w = this.elevenWheel();
      const freezeF = s11w ? 1 - 0.98 * s11w.freeze : 1;
      // Faster, readable boss rhythms: Knight reverses every 7s, Oni every 5s,
      // while Cyborg and Pirate reverse smoothly on their own distinct cycles.
      if (this.level.boss) {
        const bv = bossSpinSpeed(this.level.n, this.levelTime);
        // Game B's MARAH! state spins the boss 1.35x faster.
        this.rot += bv * s * slowF * aimF * freezeF * (this.bossRage ? 1.35 : 1);
        if (bv) this.rotDir = bv < 0 ? -1 : 1;
      } else {
        const boost = s11w && !isSpecial(this.level.mode) ? s11w.boost : 0;
        this.rot += (v + boost) * s * slowF * aimF * freezeF;
        if (v) this.rotDir = v < 0 ? -1 : 1;
      }
      this.slowT = Math.max(0, this.slowT - s);
    }
    if (this.level.boss) {
      if (this.bossMoodLeft > 0) {
        this.bossMoodLeft = Math.max(0, this.bossMoodLeft - dt);
        this.bossMoodAge += dt;
        if (this.bossMoodLeft === 0) this.bossMood = 'idle';
      }
      if (this.state === 'play') {
        // Game B taunts every 5.5 s (3.2 s once enraged).
        this.bossTauntT += dt;
        if (this.bossTauntT > (this.bossRage ? 3.2 : 5.5)) {
          this.bossTauntT = 0;
          this.setBossMood('laugh', 1.1);
        }
        if (!this.bossRage && this.bossMaxHp > 0 && this.bossHp <= this.bossMaxHp * 0.4) this.enterBossRage();
      }
      for (const ha of this.bossHa) ha.age += dt;
      this.bossHa = this.bossHa.filter((ha) => ha.age < 1);
    }
    if (this.aiming) {
      this.aimT += dt;
      if (this.state !== 'play') this.aiming = false;
    }
    // minigun spin (slide 1's trigger: slide 3's minigun fires one drum a press)
    if (this.weapon.spinup && !this.sevenPlainTrigger) {
      if (this.holding && this.state === 'play') this.spin = Math.min(1, this.spin + dt * 1.1);
      else this.spin = Math.max(0, this.spin - dt * 1.6);
      if (this.holding && this.spin > 0.25 && this.state === 'play') this.shoot();
    } else this.spin = 0;
    gunState.spin = this.spin;
    gunState.spinAngle += dt * (2 + this.spin * 40);
    // burn
    if (this.burnT > 0 && this.state === 'play') {
      this.burnT -= s;
      this.burnTick -= s;
      // A slide-11 heat-ray / dragon keeps the burn's points, but the wheel
      // burns the slide-11 way (its own heat glow and burning marks): slide
      // 1's crackle, embers and +1 captions are not part of that look.
      const burnLook = !this.setElevenLive && !this.setNineLive;
      if (this.burnTick <= 0) {
        this.burnTick = 0.5;
        this.score += 1;
        if (burnLook) {
          sfx2.burn();
          const a = rand(0, TAU);
          const p = this.worldPos(a, this.level.radius * rand(0.3, 0.95));
          this.addText(`+1${this.weapon.burnIcon ?? '🔥'}`, p.x, p.y, '#ffb347', 16);
        }
      }
      const isBee = this.weapon.burnIcon === '🐝';
      if (burnLook) for (let i = 0; i < (isBee ? 1 : 2); i++) {
        const a = rand(0, TAU);
        const p = { x: CX + Math.cos(a) * this.level.radius * rand(0.2, 1), y: CY + Math.sin(a) * this.level.radius * rand(0.2, 1) };
        if (isBee) this.particles.push({ x: p.x, y: p.y, vx: rand(-120, 120), vy: rand(-120, 120), life: 0.4, max: 0.4, size: 3, color: pick(['#facc15', '#111111']), kind: 'chip', rot: 0, vr: 30, g: 0 });
        else this.particles.push({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-90, -40), life: rand(0.3, 0.6), max: 0.6, size: rand(4, 8), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -60 });
      }
    }
    this.spikeOffT = Math.max(0, this.spikeOffT - s);
    this.glitchT = Math.max(0, this.glitchT - dt);
    // pushed spikes slide
    for (const it of this.items) {
      if (it.vel) {
        it.angle = norm(it.angle + it.vel * s);
        it.vel *= Math.exp(-s * 6);
        if (Math.abs(it.vel) < 0.02) it.vel = 0;
      }
      if (it.w === 'seed' && !it.harvested && it.age > 1.7 && this.state === 'play') {
        it.harvested = true;
        this.coins++;
        sfx2.bloom();
        const p = this.worldPos(it.angle, this.level.radius + 30);
        this.addText('🌸 +1 💰', p.x, p.y, '#f9a8d4', 18);
      }
    }
    // grow ray
    if (this.targetR && this.state !== 'clear') {
      const before = this.level.radius;
      this.level.radius += (this.targetR - this.level.radius) * Math.min(1, dt * 8);
      const k = this.level.radius / before;
      // The head has grown under the rounds that are already in it: their
      // artwork-local spots (px/py) are measured in this radius' units, so they
      // ride out with the drawing instead of drifting off it.
      if (Math.abs(k - 1) > 1e-6) {
        for (const it of this.items) {
          if (it.px !== undefined && it.py !== undefined) {
            it.px *= k;
            it.py *= k;
          }
          if (it.r !== undefined) it.r *= k;
        }
      }
    }
    for (let i = this.portals.length - 1; i >= 0; i--) {
      this.portals[i].life -= dt;
      if (this.portals[i].life <= 0) this.portals.splice(i, 1);
    }

    // Star flies across the open lane between the target and the upright gun.
    if (this.state === 'play' && allowsStarPowerups(this.level) && !this.star) {
      this.starTimer -= dt;
      if (this.starTimer <= 0) {
        this.starTimer = 14 + Math.random() * 8;
        this.spawnFloatingStar();
      }
    }
    if (this.star) {
      this.star.age += dt;
      this.star.life -= dt;
      this.star.x += this.star.vx * dt;
      this.star.y = this.star.baseY + Math.sin(this.star.age * 3.2) * 6;
      if (this.star.life <= 0 || this.star.x < -55 || this.star.x > W + 55) this.star = null;
    }

    // Rounds retain the local position/orientation of their exact rock cell;
    // detached cells and every round trapped in them share one rigid transform.
    for (const shot of this.rockBullets) shot.age += s;
    for (const shot of this.chestBullets) shot.age += s;
    for (let i = this.fallenCells.length - 1; i >= 0; i--) {
      const f = this.fallenCells[i];
      this.turnDebris(f);
      if (this.debrisFallsAlongX) f.vx += 1500 * s;
      else f.vy += 1500 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      f.life -= dt;
      for (const shot of f.bullets) shot.age += s;
      if (f.life <= 0 || this.pastDebrisFloor(f.x, f.y, 90)) this.fallenCells.splice(i, 1);
    }

    // ═══════ FRAGMEN BATU ═══════
    for (let i = this.rockFragments.length - 1; i >= 0; i--) {
      const f = this.rockFragments[i];
      this.turnDebris(f);
      if (this.debrisFallsAlongX) f.vx += 1500 * s;
      else f.vy += 1500 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      f.life -= dt;
      if (f.life <= 0 || this.pastDebrisFloor(f.x, f.y, 200)) this.rockFragments.splice(i, 1);
    }

    // ---------------- BOSS SHOOTING ATTACK MECHANIC ----------------
    if (this.level.boss && this.state === 'play') {
      this.bossShootTimer -= s;
      if (this.bossShootTimer <= 0) {
        // The boss firing is the Game B head on screen, not a Game A archetype:
        // its own fire rhythm, pace, colour and projectile read from the head.
        const boss = bossDef(bossHeadFor(this.level.n) ?? 'pirate');
        this.bossShootTimer = bossFireInterval(boss.fireInterval, rand(-0.18, 0.22));
        const bType = boss.family;
        // Boss launches projectile downward toward the player with aim spread
        const spawnY = this.targetY + this.level.radius * 0.8;
        const targetX = CX + rand(-60, 60);
        const dx = targetX - CX;
        const dy = (GUN_Y + 40) - spawnY;
        const dist = Math.hypot(dx, dy);
        // Boss shots travel 1.9x faster, but retain clear telegraphing and interceptable hitboxes.
        const spd = (160 + this.level.n * 3) * 1.9 * boss.shotPace;
        const shotRot = Math.atan2(dy, dx) - Math.PI / 2;
        this.bossProjs.push({
          x: CX,
          y: spawnY,
          vx: (dx / dist) * spd,
          vy: (dy / dist) * spd,
          rot: shotRot,
          type: bType,
          head: boss.head,
        });
        this.bossMuzzleFlashes.push({
          x: CX,
          y: spawnY,
          rot: shotRot,
          type: bType,
          head: boss.head,
          age: 0,
          max: 0.28,
        });
        // Attack SFX & alert cue
        if (bType === 'oni') sfx4.busterMid();
        else if (bType === 'cyborg') sfx2.railgun();
        else if (bType === 'pirate') sfx2.pirate();
        else sfx3.keris();
        // Crisp boss-specific firing flecks + directional shockwave ring.
        const bossRgb = boss.rgb;
        this.particles.push({
          x: CX, y: spawnY, vx: 0, vy: 0, life: 0.24, max: 0.24,
          size: 46, color: `rgb(${bossRgb})`, kind: 'ring', rot: 0, vr: 0, g: 0,
        });
        for (let k = 0; k < 6; k++) {
          const sa = shotRot + Math.PI / 2 + rand(-0.62, 0.62);
          const sv = rand(80, 195);
          this.particles.push({
            x: CX + rand(-10, 10), y: spawnY + rand(-6, 6),
            vx: Math.cos(sa) * sv, vy: Math.sin(sa) * sv, life: 0.2, max: 0.2,
            size: rand(2.2, 4.4), color: bossRgb, kind: bType === 'oni' ? 'glow' : 'spark',
            rot: 0, vr: 0, g: 0,
          });
        }
      }
    }

    for (let i = this.bossMuzzleFlashes.length - 1; i >= 0; i--) {
      const mf = this.bossMuzzleFlashes[i];
      mf.age += s;
      if (mf.age >= mf.max) this.bossMuzzleFlashes.splice(i, 1);
    }

    // Update & step boss projectiles
    for (let i = this.bossProjs.length - 1; i >= 0; i--) {
      const bp = this.bossProjs[i];
      bp.x += bp.vx * s;
      bp.y += bp.vy * s;
      // Ujung proyektil selalu menghadap arah geraknya (ke arah pemain),
      // tidak berputar-putar di jalan.
      bp.rot = Math.atan2(bp.vy, bp.vx) - Math.PI / 2;

      // Api/jejak menyala mengekor di EKOR peluru (sisi berlawanan arah
      // gerak), bukan menempel di badan peluru.
      const spdH = Math.hypot(bp.vx, bp.vy) || 1;
      const dirx = bp.vx / spdH, diry = bp.vy / spdH;
      advanceCosmeticTrail(bp, s, (x, y) => {
        const tailX = x - dirx * 44;
        const tailY = y - diry * 44;
        if (Math.random() < 0.5) {
          // Tail material/colour follows the head that fired it: eleven bosses,
          // eleven trails, even when two share a body family.
          const firedBy = bossDef(bp.head);
          const trail = firedBy.family === 'knight'
            ? { color: firedBy.rgb, kind: 'spark' as const }
            : firedBy.family === 'oni'
            ? { color: firedBy.rgb, kind: 'glow' as const }
            : firedBy.family === 'cyborg'
            ? { color: firedBy.rgb, kind: 'spark' as const }
            : { color: '71,85,105', kind: 'smoke' as const };
          this.particles.push({
            x: tailX + rand(-7, 7),
            y: tailY + rand(-7, 7),
            vx: -dirx * rand(30, 90) + rand(-25, 25),
            vy: -diry * rand(30, 90) + rand(-25, 25),
            life: bp.type === 'pirate' ? 0.42 : 0.24,
            max: bp.type === 'pirate' ? 0.42 : 0.24,
            size: bp.type === 'pirate' ? rand(4, 6.5) : rand(2.5, 4.8),
            color: bp.type === 'pirate' ? 'rgba(71,85,105,' : trail.color,
            kind: trail.kind,
            rot: 0,
            vr: 0,
            g: 0,
          });
          if (bp.type === 'oni' && Math.random() < 0.65) {
            this.particles.push({
              x: tailX + rand(-5, 5),
              y: tailY + rand(-5, 5),
              vx: -dirx * rand(40, 110) + rand(-18, 18),
              vy: -diry * rand(40, 110) + rand(-18, 18),
              life: 0.2, max: 0.2, size: rand(3.8, 6.8),
              color: pick(['255,200,80', '255,120,30', '255,60,20']),
              kind: 'glow', rot: 0, vr: 0, g: 0,
            });
          } else if (bp.type === 'pirate' && Math.random() < 0.45) {
            this.particles.push({
              x: tailX + rand(-5, 5), y: tailY + rand(-5, 5),
              vx: -dirx * 35 + rand(-20, 20), vy: -diry * 35 + rand(-20, 20),
              life: 0.26, max: 0.26, size: rand(2, 3.5), color: '34,197,94',
              kind: 'spark', rot: 0, vr: 0, g: 0,
            });
          }
        }
      });
      // Player shots pass through boss attacks. Only the blue boss silhouette
      // can stop a shot in a boss fight; the boss attack still reaches the gun.

      // 2. Boss projectile damage: only knocks player weapon or grazes (no unfair sudden deaths!)
      if (bp.y >= GUN_Y - 15 && bp.y <= GUN_Y + 70 && this.gunOffsets.some(ox => Math.abs(bp.x - (CX + ox)) < 26)) {
        this.bossProjs.splice(i, 1);
        sfx.clang();
        this.shake = Math.max(this.shake, 8);
        this.recoil = 1.6;
        this.addText(T('SERANGAN BOS!'), bp.x, GUN_Y - 20, '#ef4444', 20);
        this.sink.push({ x: bp.x, y: bp.y, vx: 0, vy: 0, life: 0.35, max: 0.35, size: 50, color: '#ef4444', kind: 'shock', rot: 0, vr: 0, g: 0 });
        break;
      }

      // Out of bounds
      if (bp.y > H + 50 || bp.x < -40 || bp.x > W + 40) {
        this.bossProjs.splice(i, 1);
      }
    }

    // The rival wheel ALWAYS drops in with Perfect Shot's entrance — every stage,
    // every speed, even with reduced motion — so Game A never pops a wheel in
    // without an animation. This clock is independent of the input-ready `intro`
    // state, so readiness keeps its original 0.5s / 1.35s timing.
    const wheelEntryTotal = this.wheelEntryDelayT + 1.16 * this.pace;
    if (this.wheelEntryT < wheelEntryTotal) {
      this.wheelEntryT = Math.min(wheelEntryTotal, this.wheelEntryT + dt);
      this.wheelScale = perfectShotWheelEntry(
        this.wheelEntryT - this.wheelEntryDelayT,
        this.pace,
        this.level.radius,
      ).scaleY;
    }
    if (this.wheelBurstT < this.wheelEntryDelayT + 1.75 * this.pace) this.wheelBurstT += dt;
    if (this.state === 'intro') {
      this.introT += dt;
      if (this.introT >= this.introDuration) {
        this.state = 'play';
        // Game B's boss greets the player with a laugh the moment play starts.
        if (this.level.boss) this.setBossMood('laugh', 1.4);
      }
    }
    this.bannerT = Math.max(0, this.bannerT - dt);

    // During slide 7's hit-stop its gun's cooldown and tap buffer run at 12 %,
    // like everything else in its `update()`.
    const cdDt = stop11 && this.setElevenLive ? dt * 0.12 : stop7 && this.setSevenLive ? dt * 0.22 : dt;
    this.cooldown -= cdDt;
    if (this.weapon.auto && !this.weapon.spinup && this.holding && this.state === 'play' && !this.elevenPlainTrigger
      && !this.sevenPlainTrigger) this.shoot();
    // Slide 7 fires its plain guns here, in its frame: again and again while
    // the trigger is held (every one of them, not only slide 1's automatics),
    // and once for a press that came up to 0.22 s before the gun was ready.
    if (this.elevenPlainTrigger) {
      this.elevenPending = Math.max(0, this.elevenPending - cdDt);
      if (this.state === 'play' && this.cooldown <= 0 && (this.holding || this.elevenPending > 0)) this.shoot();
    }
    // Slide 7's shoulder caster: the burst leaves once its own lock has closed.
    if (this.elevenCasterTrigger && this.holding && this.state === 'play' && this.cooldown <= 0
      && this.s11State?.casterLocked) this.shoot();
    if (this.nineQueued && this.cooldown <= 0) {
      this.nineQueued = false;
      if (this.ninePlainTrigger && this.state === 'play') this.shoot();
    }
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }
    // Slide 3 (SET 1..7): its own clock (22 % in its hit-stop), its timers, its
    // wheel's bounce and flash, its stuck rounds and decals, and — whenever
    // its gun is the one on screen — its animation springs (recoil, pump,
    // heat, spin, charge…) and the idle ambience that keeps the gun alive.
    // It runs before the rounds move, as in slide 3's own `update()`: a round a
    // timer releases this frame (the staff's orb, a beam after its charge)
    // flies — and a beam lands — in this same frame.
    if (this.s7State || this.setSevenId) {
      const fx = this.s7;
      const id = this.setSevenId;
      if (id) {
        fx.weaponId = id;
        fx.syncWheel();
      }
      const variant = getGunVariant(this.weapon.id);
      const ownGun = !!id && (this.setSevenLive || variant === 'set7' || variant === 'set1');
      // On the rock, the chest and the bonus ring there is no wheel: whatever a
      // slide-3 round still does after its burst (the shotgun's pellets, the
      // minigun's drum) may not leave holes or drips on one.
      fx.special = isSpecial(this.level.mode);
      fx.update(stop7 ? dt * 0.22 : dt, ownGun);
    }
    const tw = this.weapon;
    for (const p of this.projs) {
      if (p.spawnDelay && p.spawnDelay > 0) continue;
      if (p.setElevenPending) {
        // Only the sword's carrier waits for a round (its slash leaves a
        // moment after the swing); it takes it over where slide 7 released
        // it and from then on flies it slide 7's way. A beam's or the
        // railgun's hidden knife has no round to wait for.
        const made = p.s11Wait ? this.s11.takeShots() : [];
        if (made.length) {
          const own = made[0];
          const bx = p.originX ?? CX;
          p.setEleven = own;
          p.setElevenPending = false;
          p.s11Wait = false;
          p.x = this.s11.aimRound(own, bx);
          p.y = own.y;
          // The layer's round points straight up its own frame: the carrier
          // takes its speed but leaves along this barrel.
          const dir = this.poseVelocity(own.vx, own.vy);
          p.vx = dir.vx;
          p.vy = dir.vy;
        } else if (this.strandCarrier(p)) continue;
      }
      if (p.s11Ghost) continue; // extra pellet of a burst gun: slide 11 fired it
      if (p.setEleven) {
        // Slide 11's round keeps its own frames; slide 1 decides where it is.
        this.s11.carry(p.setEleven, p.x, p.y, Math.atan2(p.vy, p.vx));
        continue;
      }
      if (p.setTwo) {
        // Slide 2's round keeps its own trail, sparks and smoke; slide 1 only
        // says where the round is.
        const s2id = this.setTwoId;
        if (s2id) {
          const fx = this.s2w;
          fx.cx = CX;
          fx.gunY = GUN_Y;
          advanceTwoRoundTrail(fx, s2id, p.x, p.y, p.setTwo, dt);
        }
        continue;
      }
      if (p.setNinePending) {
        // Slide 9 releases some rounds later than the trigger (charged staffs,
        // drum bursts); hold the carrier still until its round exists.
        const made = this.s9.takeShots();
        if (made.length) {
          p.setNine = made[0];
          p.setNinePending = false;
          p.y = made[0].y;
        } else if (this.strandCarrier(p)) continue;
      }
      if (p.setNineBeam !== undefined) continue; // the beam is the shot: nothing rides the carrier
      if (p.s9Ghost) continue; // extra pellet of a burst gun: slide 9 fired it
      if (p.setNine) {
        // Slide 9's round keeps its own frames (trail, sub-particles, spin);
        // slide 1 decides where it actually is.
        this.s9.carry(p.setNine, p.x, p.y, Math.atan2(p.vy, p.vx));
        continue;
      }
      if (p.setSevenPending) {
        // Slide 7 releases some shots later than the trigger (the staff charges
        // first); hold the carrier still until its shot exists.
        const made = this.s7.takeShots();
        if (made.length) {
          p.setSeven = made[0];
          p.setSevenPending = false;
          p.x = p.originX = made[0].x;
          p.y = made[0].y;
          // The other barrel's round (twin guns) waits for its own carrier.
          if (made.length > 1) this.s7.shots.push(...made.slice(1));
          // A charged staff releases its round later than the trigger; from
          // that moment it travels at slide 3's speed (a beam lands at once).
          adoptSevenRound(p, made[0], Math.abs(p.vy) / this.speedMult, this.speedMult);
          if (this.setSevenLive) p.vy = -sevenCarrierSpeed(made[0], Math.abs(p.vy)) * this.speedMult;
          this.s7Last = made[0];
        } else if (this.strandCarrier(p)) continue;
      }
      if (p.s7Ghost) continue; // extra pellet of a burst gun: slide 7 shot it
      if (p.setOne) {
        this.s1.trail(p.setOne, p.x, p.y, s);
        continue;
      }
      if (p.setSeven) {
        // Slide 3's own frame: `update()` schedules its sub-projectiles (the
        // minigun drum, the swarm…), spawns its trail and moves the round its
        // own way — its speed, the RPG's and the gauntlet's acceleration, the
        // bubble's wobble, the rocket homing on the wheel's centre. Slide 1's
        // carrier then makes exactly that move through its own collision
        // sweep (below), and the round is drawn where the carrier is.
        const shot = p.setSeven;
        const x0 = p.x;
        const y0 = p.y;
        shot.x = x0;
        shot.y = y0;
        shot.update(s);
        if (this.setSevenLive && s > 0 && !isSevenBeam(shot)) {
          const dir = this.poseVelocity((shot.x - x0) / s, (shot.y - y0) / s);
          p.vx = dir.vx;
          p.vy = dir.vy;
        }
        shot.x = x0;
        shot.y = y0;
        continue;
      }
      if (tw.id === 'firework') {
        advanceCosmeticTrail(p, s, (x, y) => spawnFirework8FlightSparks(this.getFwState(), x, y, p.hue ?? gunState.rocketHue));
        continue;
      }
      if (tw.id === 'yoyo') {
        advanceCosmeticTrail(p, s, (x, y) => spawnYoyoFlightSparks(this.getYoyoState(), x, y, p.hue ?? gunState.yoyoHue));
        continue;
      }
      if (tw.id === 'keris') {
        advanceCosmeticTrail(p, s, (x, y) => spawnKerisFlightSparks(this.getKerisState(), x, y));
        continue;
      }
      if (tw.id === 'diamond') {
        advanceCosmeticTrail(p, s, (x, y) => spawnDiamondFlightSparks(this.getDiamondState(), x, y));
        continue;
      }
      if (tw.id === 'bazooka') {
        continue;
      }
      const px = p.x + rand(-4, 4);
      const py = p.y + rand(20, 46);
      if (tw.id === 'snowball') {
        advanceCosmeticTrail(p, s, (x, y) => {
          for (let k = 0; k < 6; k++) {
            this.sink.push({ x: x + rand(-16, 16), y: y + rand(29, 69),
              vx: rand(-60, 60), vy: rand(25, 90), life: rand(0.25, 0.49), max: 0.49,
              size: rand(1.5, 3.6), color: pick(['#ffffff', '#f8fdff', '#eaf6fb']), kind: 'snowDust',
              rot: 0, vr: 0, g: 110, drag: 1.4 });
          }
          for (let k = 0; k < 2; k++) {
            this.sink.push({ x: x + rand(-15, 15), y: y + rand(36, 64),
              vx: rand(-50, 50), vy: rand(20, 85), life: rand(0.3, 0.52), max: 0.52,
              size: rand(2.2, 4.2), color: '#ffffff', kind: 'snowflake',
              rot: rand(0, TAU), vr: rand(-5, 5), g: 75, drag: 1.7 });
          }
        });
        continue;
      }
      if (tw.id === 'soaker') {
        advanceCosmeticTrail(p, s, (x, y) => {
          for (let k = 0; k < 3; k++) {
            this.sink.push({ x: x + rand(-11, 11), y: y + rand(23, 67), vx: rand(-95, 95),
              vy: rand(45, 155), life: rand(0.23, 0.45), max: 0.45, size: rand(1.6, 4.1),
              color: pick(['#ddfaff', '#7dd3fc', '#bae6fd']), kind: 'waterDrop',
              rot: 0, vr: 0, g: 800, drag: 0.8 });
          }
        });
        continue;
      }
      // Dora projectile: echo ringE rings + wind streaks + puff particles (game-3)
      if (tw.id === 'dora') {
        if (p.t === undefined) p.t = 0;
        p.t += s;
        if (p.lastEcho === undefined) p.lastEcho = p.y;
        while (p.lastEcho - p.y > 44) {
          p.lastEcho -= 44;
          this.sink.push({ x: p.x, y: p.lastEcho, vx: 0, vy: 0, life: 0.32, max: 0.32, size: 26, color: '#ffffff', kind: 'ringE', rot: 0, vr: 0, g: 0 });
        }
        advanceCosmeticTrail(p, s, (x, y) => {
          if (Math.random() < 0.8) this.sink.push({ x: x + rand(-26, 26), y: y + rand(10, 40), vx: rand(-30, 30), vy: rand(150, 320), life: rand(0.15, 0.3), max: 0.3, size: rand(10, 24), color: '#ffffff', kind: 'wind', rot: 0, vr: 0, g: 0, drag: 1 });
          if (Math.random() < 0.3) this.sink.push({ x: x + rand(-30, 30), y: y + rand(0, 30), vx: rand(-80, 80), vy: rand(60, 160), life: rand(0.3, 0.5), max: 0.5, size: rand(5, 10), color: '#ffffff', kind: 'puff', rot: rand(0, TAU), vr: rand(-3, 3), g: 0, drag: 2 });
        });
        continue;
      }
      // Xeno projectile: shed droplets + green smoke (game-3)
      if (tw.id === 'xeno') {
        p.t = (p.t ?? 0) + s;
        p.trail = p.trail ?? [];
        advanceCosmeticTrail(p, s, (x, y) => {
          // Keep the sampled metaball tail the same world-time length on
          // 60/90/120 Hz screens instead of shrinking it at high refresh.
          p.trail!.unshift({ x: x + rand(-1, 1), y });
          if (p.trail!.length > 12) p.trail!.pop();
          if (Math.random() < 0.7) this.sink.push({ x: x + rand(-7, 7), y: y + rand(10, 40), vx: rand(-70, 70), vy: rand(-200, 100), life: rand(0.5, 1), max: 1, size: rand(1.5, 3.5), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1100, drag: 0.15 });
          if (Math.random() < 0.3) this.sink.push({ x: x + rand(-6, 6), y: y + 20, vx: rand(-20, 20), vy: rand(-20, 20), life: 0.8, max: 0.8, size: rand(6, 12), color: '182,255,26', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 0 });
        });
        continue;
      }
      // Pred projectile: sparks + bolts + ringE echo + smoke (game-3)
      if (tw.id === 'pred') {
        if (p.t === undefined) p.t = 0;
        p.t += s;
        if (p.lastEcho === undefined) p.lastEcho = p.y;
        while (p.lastEcho - p.y > 60) { p.lastEcho -= 60; this.sink.push({ x: p.x, y: p.lastEcho, vx: 0, vy: 0, life: 0.25, max: 0.25, size: 10, color: '111,211,255', kind: 'ringE', rot: 0, vr: 0, g: 0 }); }
        if (Math.random() < 0.9) this.sink.push({ x: p.x + rand(-8, 8), y: p.y + rand(10, 60), vx: rand(-120, 120), vy: rand(40, 200), life: rand(0.2, 0.4), max: 0.4, size: 1.5, color: Math.random() < 0.5 ? '#ffffff' : '111,211,255', kind: 'spark', rot: 0, vr: 0, g: 0, drag: 3 });
        if (Math.random() < 0.5) this.sink.push({ x: p.x, y: p.y + rand(0, 40), vx: Math.cos(rand(0, TAU)) * rand(16, 40), vy: Math.sin(rand(0, TAU)) * rand(16, 40), life: 0.08, max: 0.08, size: 2, color: '111,211,255', kind: 'bolt', rot: 0, vr: 0, g: 0 });
        if (Math.random() < 0.4) this.sink.push({ x: p.x + rand(-10, 10), y: p.y + 40, vx: rand(-20, 20), vy: rand(-10, 30), life: 0.7, max: 0.7, size: rand(8, 16), color: '74,106,144', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 0 });
        continue;
      }
      const emitTrail = this.particles.length < this.maxParticles && Math.random() < Math.min(1, s * 60);
      if (emitTrail) switch (tw.trailFx) {
        case 'glow':
        case 'void':
          this.sink.push({ x: px, y: py, vx: rand(-30, 30), vy: rand(20, 80), life: rand(0.2, 0.4), max: 0.4, size: rand(2.5, 5), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'smoke':
          this.sink.push({ x: px, y: py + 6, vx: rand(-25, 25), vy: rand(30, 90), life: rand(0.5, 0.9), max: 0.9, size: rand(6, 12), color: 'rgba(170,170,170,', kind: 'smoke', rot: 0, vr: 0, g: -20 });
          this.sink.push({ x: p.x, y: p.y + 44, vx: rand(-20, 20), vy: rand(60, 140), life: 0.15, max: 0.15, size: rand(5, 9), color: '255,160,50', kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'spark':
          this.sink.push({ x: px, y: py, vx: rand(-200, 200), vy: rand(-50, 150), life: 0.15, max: 0.15, size: 1.5, color: pick(tw.sparks), kind: 'spark', rot: 0, vr: 0, g: 0 });
          break;
        case 'bubble':
          if (Math.random() < 0.6) this.sink.push({ x: px, y: py, vx: rand(-20, 20), vy: rand(-10, 30), life: rand(0.3, 0.5), max: 0.5, size: rand(1.5, 3), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'frost':
          this.sink.push({ x: px, y: py, vx: rand(-40, 40), vy: rand(10, 60), life: rand(0.3, 0.5), max: 0.5, size: rand(2, 4), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'gold':
          this.sink.push({ x: px, y: py, vx: rand(-60, 60), vy: rand(0, 80), life: 0.25, max: 0.25, size: 1.5, color: pick(tw.sparks), kind: 'spark', rot: 0, vr: 0, g: 200 });
          break;
        case 'fire':
          for (let k = 0; k < 2; k++) this.sink.push({ x: px, y: py, vx: rand(-40, 40), vy: rand(40, 120), life: rand(0.2, 0.4), max: 0.4, size: rand(4, 8), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -100 });
          break;
        case 'pixel':
          this.sink.push({ x: px, y: py, vx: 0, vy: rand(20, 60), life: 0.3, max: 0.3, size: rand(2, 4), color: pick(['#ff0055', '#00ffee', '#22ff88']), kind: 'chip', rot: 0, vr: 0, g: 0 });
          break;
        case 'confetti':
          this.sink.push({ x: px, y: py, vx: rand(-80, 80), vy: rand(0, 80), life: rand(0.4, 0.7), max: 0.7, size: rand(2, 4), color: pick(tw.sparks), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 200 });
          break;
        case 'rainbow': {
          // Lush ribbon trail across all 6 pastel rainbow bands with trailing stardust
          const RBC = ['248,113,113', '251,146,60', '250,204,21', '74,222,128', '96,165,250', '192,132,252'];
          for (let k = 0; k < 6; k++) {
            const ox = (k - 2.5) * 3.2;
            this.sink.push({ x: p.x + ox, y: p.y + 18, vx: rand(-10, 10), vy: rand(50, 120), life: 0.45, max: 0.45, size: 3.5, color: RBC[k], kind: 'glow', rot: 0, vr: 0, g: 0 });
          }
          for (let k = 0; k < 2; k++) {
            this.sink.push({ x: px + rand(-12, 12), y: py + rand(10, 30), vx: rand(-40, 40), vy: rand(20, 60), life: rand(0.4, 0.7), max: 0.7, size: rand(4, 7), color: '#ffffff', kind: 'star', rot: 0, vr: 0, g: 0, drag: 2 });
          }
          break;
        }
        case 'petal':
          if (Math.random() < 0.7) this.sink.push({ x: px, y: py, vx: rand(-90, 90), vy: rand(-20, 60), life: rand(0.7, 1.2), max: 1.2, size: rand(2.5, 4.5), color: pick(['#fbcfe8', '#f9a8d4', '#fdf2f8']), kind: 'petal', rot: rand(0, TAU), vr: rand(-8, 8), g: 60, drag: 1.5 });
          break;
        case 'note':
          if (Math.random() < 0.25) this.sink.push({ x: px + rand(-14, 14), y: py, vx: rand(-40, 40), vy: rand(-30, 30), life: 0.7, max: 0.7, size: 14, color: pick(['#fde68a', '#fca5a5', '#a5f3fc']), kind: 'text', rot: 0, vr: 0, g: 0, text: pick(['♪', '♫']) });
          this.sink.push({ x: px, y: py, vx: 0, vy: 40, life: 0.3, max: 0.3, size: 3, color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'acid':
          // Xenomorph viscous acid drips + fine mist
          this.sink.push({ x: px, y: py, vx: rand(-20, 20), vy: rand(40, 100), life: rand(0.3, 0.6), max: 0.6, size: rand(3, 6), color: tw.trail, kind: 'drop', rot: 0, vr: 0, g: 500, drag: 0.8 });
          if (Math.random() < 0.5) this.sink.push({ x: px + rand(-8, 8), y: py + rand(5, 15), vx: rand(-30, 30), vy: rand(20, 80), life: rand(0.3, 0.6), max: 0.6, size: rand(1.5, 3), color: 'rgba(126,200,30,', kind: 'smoke', rot: 0, vr: 0, g: 100, drag: 2 });
          break;
        case 'air':
          // Dora compressed air ring puffs + light streaks
          this.sink.push({ x: px, y: py, vx: rand(-40, 40), vy: rand(30, 90), life: rand(0.4, 0.8), max: 0.8, size: rand(8, 14), color: 'rgba(220,240,255,', kind: 'smoke', rot: rand(0, TAU), vr: rand(-2, 2), g: -30, drag: 3 });
          if (Math.random() < 0.4) this.sink.push({ x: px, y: py, vx: 0, vy: 0, life: 0.2, max: 0.2, size: 14, color: '255,255,255', kind: 'ring', rot: 0, vr: 0, g: 0 });
          break;
        case 'plasma':
          // Predator plasma ion sparks + electric arcs
          this.sink.push({ x: px, y: py, vx: rand(-60, 60), vy: rand(40, 120), life: rand(0.15, 0.3), max: 0.3, size: rand(2, 4), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0, drag: 3 });
          if (Math.random() < 0.3) this.sink.push({ x: px + rand(-10, 10), y: py, vx: rand(-30, 30), vy: 0, life: 0.12, max: 0.12, size: 2, color: '255,255,255', kind: 'bolt', rot: 0, vr: 0, g: 0 });
          break;
      }
    }
    this.recoil = Math.max(0, this.recoil - dt * 7);
    this.muzzle -= dt;
    this.bump *= Math.exp(-dt * 14);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 7);
    // Slide 7's screen shake settles at the top of the frame (above), at its
    // own e^-11t; slide 1's own shake settles here at e^-9t.
    if (!active11) this.shake *= Math.exp(-dt * 9);
    this.flashWhite = Math.max(0, this.flashWhite - dt * 2.5);
    this.wheelFlash = Math.max(0, this.wheelFlash - dt * 5);
    this.flashRed = Math.max(0, this.flashRed - dt * 1.8);
    for (const it of this.items) {
      it.age += s;
      if (it.flash) it.flash = Math.max(0, it.flash - dt * 3.5);
    }
    // ---- ongoing stuck effects for xeno/dora/pred (game-3 update loop) ----
    if (this.state === 'play') {
      for (const it of this.items) {
        if (it.type !== 'bullet') continue;
        if (it.w !== 'xeno' && it.w !== 'dora' && it.w !== 'pred') continue;
        // A slide-11 hit keeps its own mark alive (slide 11's acid keeps eating,
        // its plasma scar keeps burning): no game-3 scar FX on top of it.
        if (it.hideArt && (this.setElevenLive || this.setNineLive)) continue;
        // On a boss the round bit a pixel of the drawing; its scar, drip and
        // smoke have to grow from that pixel, not from the rim of a wheel.
        const wp = this.level.boss && it.px !== undefined && it.py !== undefined
          ? this.artToWorld(it.px, it.py)
          : this.worldPos(it.angle, this.level.radius);
        const hx = wp.x, hy = wp.y;
        if (it.w === 'xeno') {
          // Ported from game-3: the blob sags, then a drip stretches until it
          // detaches and falls into the fluid layer, plus acid vapour/bubbles.
          if (it.acid) {
            const R0 = this.level.radius;
            const a = it.angle + this.rot;
            const bx = CX + Math.cos(a) * (R0 + 8);
            const by = this.targetY + Math.sin(a) * (R0 + 8);
            it.acid.dripT -= dt;
            if (it.acid.dripT <= 0) {
              it.acid.drip += dt * 14;
              if (it.acid.drip > 12) {
                this.sink.push({ x: bx + rand(-4, 4), y: by + 6, vx: rand(-10, 10), vy: 30, life: 1.8, max: 1.8, size: rand(3, 4.2), color: '#b6ff1a', kind: 'acid', rot: 0, vr: 0, g: 1100, drag: 0.15 });
                it.acid.drip = 0;
                it.acid.dripT = rand(0.8, 2.2);
              }
            }
            if (Math.random() < dt * 5) {
              this.sink.push({ x: bx + rand(-8, 8), y: by - 4, vx: rand(-15, 15), vy: rand(-45, -15), life: rand(1, 1.8), max: 1.8, size: rand(6, 12), color: '168,224,74', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 0 });
            }
            if (Math.random() < dt * 6) {
              this.sink.push({ x: bx + rand(-10, 10), y: by + rand(-10, 10), vx: 0, vy: -10, life: rand(0.3, 0.7), max: 0.7, size: rand(0.8, 1.8), color: '244,255,154', kind: 'bubble', rot: 0, vr: 0, g: 0, grow: 2 });
            }
            void hx; void hy;
          }
        } else if (it.w === 'dora') {
          // wind particles swirling around rim (game-3: white wind streaks, tangent direction)
          if (Math.random() < dt * 10) {
            const a = it.angle + this.rot;
            const ta = a + Math.PI / 2;
            this.sink.push({ x: hx + rand(-10, 10), y: hy + rand(-10, 10), vx: Math.cos(ta) * rand(60, 140) * (Math.random() < 0.5 ? 1 : -1), vy: Math.sin(ta) * rand(60, 140), life: rand(0.25, 0.45), max: 0.45, size: rand(6, 14), color: '#ffffff', kind: 'wind', rot: 0, vr: 0, g: 0, drag: 2 });
          }
        } else if (it.w === 'pred') {
          // plasma scar: bolts, embers, smoke (game-3)
          const hot = Math.max(0, 1 - it.age / 6);
          if (Math.random() < dt * (2 + hot * 6)) {
            const a = it.angle + this.rot + rand(-1.5, 1.5);
            this.sink.push({ x: hx, y: hy, vx: Math.cos(a) * rand(30, 70), vy: Math.sin(a) * rand(30, 70), life: rand(0.1, 0.2), max: 0.2, size: 3, color: '111,211,255', kind: 'bolt', rot: 0, vr: 0, g: 0 });
          }
          if (Math.random() < dt * (3 + hot * 12)) {
            this.sink.push({ x: hx + rand(-6, 6), y: hy + rand(-6, 6), vx: rand(-30, 30), vy: rand(-80, -20), life: rand(0.4, 0.9), max: 0.9, size: rand(1, 2.2), color: pick(['#ffb060', '#ff7030', '111,211,255']), kind: 'glow', rot: 0, vr: 0, g: 0, drag: 1 });
          }
          if (Math.random() < dt * (2 + hot * 6)) {
            this.sink.push({ x: hx + rand(-6, 6), y: hy, vx: rand(-10, 10), vy: rand(-50, -20), life: rand(1, 1.8), max: 1.8, size: rand(6, 12), color: '48,58,72', kind: 'smoke', rot: 0, vr: 0, g: 0, drag: 2 });
          }
        }
      }
    }
    for (const b of this.rockBullets) {
      b.age += s;
      if (b.flash) b.flash = Math.max(0, b.flash - dt * 3.5);
    }
    for (const b of this.chestBullets) {
      b.age += s;
      if (b.flash) b.flash = Math.max(0, b.flash - dt * 3.5);
    }
    if (
      this.bgTheme === 'skyline' ||
      this.weapon.id === 'firework' ||
      (this.fwState && (this.fwState.particles.length > 0 || this.fwState.glows.length > 0 || this.fwState.rings.length > 0 || this.fwState.sky.length > 0))
    ) {
      // Slide 2 runs its sky show on the menu / game over only — mirror that here.
      // (Gun Hit's idle screen uses its own menu backdrop, so 'over' is the match.)
      updateFirework8State(this.getFwState(), dt, this.weapon.id === 'firework' && this.state === 'over');
    }
    if (
      this.slide2Void || this.s2.particles.length > 0 || this.s2.glows.length > 0
      || this.s2.rings.length > 0 || this.s2.voids.length > 0 || this.s2.jets.length > 0
      || this.s2.beams.length > 0 || this.s2.smokes.length > 0 || this.s2.fireballs.length > 0
      || this.s2.flashes.length > 0 || this.s2.texts.length > 0 || this.s2.timers.length > 0
    ) {
      this.s2.update(dt);
    }
    // Slide 2's own layer: its round trails, bubbles, impact cracks, shrapnel
    // and the muzzle pulses its recipes feed the artwork.
    if (this.s2wState && (this.s2wState.busy || this.setTwoLive)) {
      const fx = this.s2w;
      fx.cx = CX;
      fx.cy = this.targetY;
      fx.ambient = this.state === 'play';
      fx.radius = this.level.radius;
      fx.gunY = GUN_Y;
      fx.h = H;
      setTwoGunFx(fx);
      fx.update(dt);
      if (fx.flash > 0) {
        // Slide 2 tints the screen with `min(0.45, flash * 0.45)`; slide 1's
        // white veil is drawn at 0.6× its value, so scale it to match.
        this.flashWhite = Math.max(this.flashWhite, Math.min(0.75, fx.flash * 0.75));
        this.wheelFlash = Math.max(this.wheelFlash, fx.flash * 0.6);
        fx.flash = 0;
      }
    }
    else setTwoGunFx(null);
    if (this.s1State && (this.s1State.busy || this.setOneLive)) this.s1State.update(dt);
    // Slide 11: its own clock, particles, rounds, marks and beams. A frame
    // that settled slide 7 at the top always runs the rest of its frame too.
    if (active11 || this.setElevenLive || (this.s11State && this.s11State.busy)) {
      const fx = this.s11;
      const id = this.setElevenId;
      if (id) {
        // The equipped gun's slide-11 weapon is live from the first frame, not
        // only from the first shot (its idle FX, its aiming overlay).
        if (this.setElevenLive) fx.follow(id);
        else fx.weaponId = id;
        fx.syncWheel();
      }
      // Holding the trigger keeps a slide-11 channel (flame, beam) flowing,
      // exactly like slide 11's own `press()`; slide 1 still owns every shot.
      // The caster's lock follows slide 1's charge meter.
      fx.chargeTime = this.charging ? this.chargeT : 0;
      // Slide 7's world runs on this frame's slide-7 clock (12 % in a hit-stop).
      fx.advance(s11dt, this.state === 'play' && this.holding);
    }
    // Slide 6: its own clock, beams, particles and scorch marks. Its beam is
    // painted on the trigger, so there is no carried round to follow.
    if (this.setSixLive || (this.s6State && this.s6State.busy)) {
      const fx = this.s6;
      const id = this.setSixId;
      if (id) {
        fx.weaponId = id;
        fx.time = this.time;
        fx.syncWheel();
      }
      // Slide 6's sniper keeps its laser sight lit while it is armed.
      fx.sight = this.state === 'play' && id !== null;
      fx.update(dt);
    }
    // Slide 9: its own clock, particles, rounds, beams and entry holes. Only
    // while that shot (or its leftover FX) is live, so a slide-9 layer can never
    // animate for a gun that is firing slide 11 instead.
    if (this.setNineLive || (this.s9State && this.s9State.busy)) {
      const fx = this.s9;
      const id = this.setNineId;
      if (id) {
        fx.weaponId = id;
        fx.time = this.time;
        fx.syncWheel();
      }
      // Slide 9's world slows to 12 % during a hit-stop; its timers do not.
      const raw = dt * this.timeScale;
      fx.update(this.hitStop > 0 || this.elevenStop > 0 || this.nineStop > 0 ? raw * 0.12 : raw, raw);
    }
    if (this.state === 'play' && this.slide2Void) {
      // Slide 2 keeps tearing voids open in the sky while the gun is live.
      ambientBlackHole2(this.s2, CX, GUN_Y, dt);
      this.s2Ambient -= dt;
      if (this.s2Ambient <= 0) {
        launchVoidSky2(this.s2, rand(0.8, 1.15), () => slide2Sfx.voidOpen(), () => slide2Sfx.voidBoom(1));
        this.s2Ambient = rand(1.6, 2.6);
      }
    }
    if (
      this.weapon.id === 'yoyo' ||
      (this.yoyoState &&
        (this.yoyoState.particles.length > 0 ||
          this.yoyoState.glows.length > 0 ||
          this.yoyoState.rings.length > 0 ||
          this.yoyoState.strings.length > 0 ||
          this.yoyoState.timers.length > 0 ||
          this.yoyoState.flash > 0.01 ||
          this.yoyoState.wpulse > 0.01))
    ) {
      const yoyo = this.getYoyoState();
      const stuckPins: { x: number; y: number; hue: number; age: number }[] = [];
      for (const it of this.items) {
        if (it.type === 'bullet' && it.w === 'yoyo') {
          const worldA = it.angle + this.rot;
          const itemR = this.bossRadiusAt(it.angle);
          const dist = itemR + 4;
          stuckPins.push({
            x: CX + Math.cos(worldA) * dist,
            y: this.targetY + Math.sin(worldA) * dist,
            hue: it.hue ?? 0,
            age: it.age,
          });
        }
      }
      updateYoyoSlideState(yoyo, dt, stuckPins);
    }
    if (
      this.bgTheme === 'mystic' ||
      this.weapon.id === 'keris' ||
      (this.kerisState &&
        (this.kerisState.particles.length > 0 ||
          this.kerisState.crawlArcs.length > 0 ||
          this.kerisState.thunderFlash > 0.01))
    ) {
      updateKerisSlideState(
        this.getKerisState(),
        dt,
        this.time,
        CX,
        GUN_Y + this.recoil * 22,
        this.weapon.id === 'keris' && !this.setSevenLive && (this.state === 'play' || this.state === 'intro'),
      );
    }
    if (
      this.weapon.id === 'diamond' ||
      (this.diamondState &&
        (this.diamondState.particles.length > 0 ||
          this.diamondState.shards.length > 0 ||
          this.diamondState.glows.length > 0 ||
          this.diamondState.rings.length > 0 ||
          this.diamondState.starflashes.length > 0 ||
          this.diamondState.timers.length > 0 ||
          this.diamondState.flash > 0.01 ||
          this.diamondState.wpulse > 0.01))
    ) {
      const diamond = this.getDiamondState();
      const stuckPins: { x: number; y: number }[] = [];
      for (const it of this.items) {
        if (it.type === 'bullet' && it.w === 'diamond' && !it.hideArt) {
          const worldA = it.angle + this.rot;
          const itemR = this.bossRadiusAt(it.angle);
          const dist = itemR + 14;
          stuckPins.push({
            x: CX + Math.cos(worldA) * dist,
            y: this.targetY + Math.sin(worldA) * dist,
          });
        }
      }
      updateDiamondSlideState(
        diamond,
        dt,
        stuckPins,
        this.weapon.id === 'diamond' && !this.setSevenLive && (this.state === 'play' || this.state === 'intro'),
        CX,
        GUN_Y,
      );
    }
    if (
      this.weapon.id === 'bazooka' ||
      (this.bazookaState &&
        (this.bazookaState.particles.length > 0 ||
          this.bazookaState.smokes.length > 0 ||
          this.bazookaState.fireballs.length > 0 ||
          this.bazookaState.flashes.length > 0 ||
          this.bazookaState.debris.length > 0 ||
          this.bazookaState.glows.length > 0 ||
          this.bazookaState.timers.length > 0 ||
          this.bazookaState.screenFlash > 0.01))
    ) {
      const bazooka = this.getBazookaState();
      const flyingShots =
        this.weapon.id === 'bazooka' && !this.setSevenLive
          ? this.projs
              .filter((p) => !p.spawnDelay || p.spawnDelay <= 0)
              .map((p) => ({ x: p.x, y: p.y }))
          : [];
      bazooka.update(
        dt,
        this.weapon.id === 'bazooka' && !this.setSevenLive && (this.state === 'play' || this.state === 'intro'),
        CX,
        GUN_Y,
        flyingShots,
        H,
      );
    }

    // projectiles
    for (let i = this.projs.length - 1; i >= 0; i--) {
      const p = this.projs[i];
      if (!this.aimedProjs.has(p)) {
        this.aimedProjs.add(p);
        this.aimRoundAt(p);
      }
      if (p.spawnDelay && p.spawnDelay > 0) {
        p.spawnDelay -= s;
        if (p.spawnDelay > 0) continue;
        if (this.weapon.id === 'keris') {
          this.sink.light(p.x, GUN_Y - 6, 80, '255,224,110', 0.28);
          this.sink.push({
            x: p.x,
            y: GUN_Y - 6,
            vx: 0,
            vy: 0,
            life: 0.24,
            max: 0.24,
            size: 32,
            color: '#ffd056',
            kind: 'ring',
            rot: 0,
            vr: 0,
            g: 0,
          });
        }
      }
      // A charged slide-7 gun (bamboo fuse, emerald/rail/freeze charge, the
      // buster) creates its round a fraction of a second *after* the trigger.
      // Slide 7 shows nothing in that time, so the carrier waits at the muzzle
      // instead of flying a bullet slide 7 never fired — without this it landed
      // before its round existed, the round was never drawn, and the wheel got
      // slide 1's bullet instead of slide 7's stuck art.
      if (p.setSevenPending) continue;
      // The sword's carrier waits at the muzzle until its slash exists.
      if (p.s11Wait) continue;
      if (p.setEleven) {
        // Slide 7's own update decided this frame's flight of the round
        // (spread, acceleration, braking, homing, swirl, a jump back under
        // the wheel, the prism's hand-over to its central ray).
        let f = this.s11.flight(p.setEleven);
        if (f?.next) {
          p.setEleven = f.next;
          f = this.s11.flight(f.next) ?? f;
        }
        if (f) {
          // Slide 11 flies the round straight up its own frame. Turn both its
          // step and its velocity onto this barrel, so the round leaves along
          // the muzzle it came out of instead of sliding back to the screen's
          // centre line.
          const step = this.poseVelocity(f.x - p.x, f.y - p.y);
          p.x += step.vx;
          p.y += step.vy;
          const dir = this.poseVelocity(f.vx, f.vy);
          p.vx = dir.vx;
          p.vy = dir.vy;
        }
      }
      const ghostN = FX[this.weapon.id].ghost;
      if (ghostN) {
        p.hist = p.hist ?? [];
        p.hist.push({ x: p.x, y: p.y });
        if (p.hist.length > ghostN) p.hist.shift();
      }
      if (this.slide2Void) trailBlackHole2(this.s2, p.x, p.y, this.s2Hue);
      // A slide-9 instant beam is light: its carrier ignores the hit-stop.
      const ps = p.setNineBeam === 0 ? dt * this.timeScale : s;
      // Imported GhostShot.update() resets vx; re-aim after its own update so
      // all three effects leave the moving hand and reach the same centre.
      const ghostTargetY = p.ghostAim ? this.ghostAimY(p.setSeven?.tip ?? 0) : 0;
      if (p.ghostAim) p.vx = (CX - p.x) * Math.max(0, -p.vy) / Math.max(1, p.y - ghostTargetY);
      const dist = Math.hypot(p.vx, p.vy) * ps;
      const steps = Math.max(1, Math.ceil(dist / 7));
      // Exactly how far one substep moves the round: the boss walk uses it to
      // find the pixel the round met instead of the pixel it ended up in.
      const stepLen = Math.hypot(p.vx, p.vy) * ps / steps;
      let r: StepRes = { res: 'none' };
      for (let k = 0; k < steps; k++) {
        const dy = (p.vy * ps) / steps;
        if (p.ghostAim) {
          // Clamp at centre when this substep passes the aim point; special
          // rocks can leave empty space and must not send the shot past centre.
          const remaining = p.y - ghostTargetY;
          const fraction = remaining > 0 ? Math.min(1, Math.max(0, -dy) / remaining) : 1;
          p.x += (CX - p.x) * fraction;
        } else p.x += (p.vx * ps) / steps;
        p.y += dy;
        r = this.stepProj(p, stepLen);
        if (r.res !== 'none') break;
      }
      if (r.res === 'stick') {
        this.projs.splice(i, 1);
        this.stickAt(r.local ?? norm(Math.PI / 2 - this.rot), p, r.r, r.px, r.py);
        if ((this.state as State) === 'clear') break;
      } else if (r.res === 'hit') {
        // Consume one projectile per stone/star hit; a star pauses further shots.
        const idx = this.projs.indexOf(p);
        if (idx >= 0) this.projs.splice(idx, 1);
        if (this.choosingBuff || (this.state as State) === 'clear') break;
      } else if (r.res === 'fail') {
        if (this.trySave(p, !!r.spike)) {
          const idx = this.projs.indexOf(p);
          if (idx >= 0) this.projs.splice(idx, 1);
          if ((this.state as State) === 'clear') break;
          continue;
        }
        this.failProjAngle = 0;
        this.fail(p);
        break;
      } else if (p.y < -80 || p.x < -80 || p.x > W + 80) {
        this.projs.splice(i, 1);
      }
    }

    // particles — zero-allocation in-place compaction (no per-particle splice GC)
    let pWrite = 0;
    const pLen = this.particles.length;
    const dropExcess = pLen > this.maxParticles ? pLen - this.maxParticles : 0;
    let dropped = 0;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];
      p.life -= s;
      if (p.life <= 0) continue;
      if (dropped < dropExcess && p.kind !== 'text' && p.kind !== 'xenoMolecular') {
        dropped++;
        continue;
      }
      this.turnDebris(p);
      if (this.debrisFallsAlongX) p.vx += p.g * s;
      else p.vy += p.g * s;
      if (p.drag) {
        const k = Math.exp(-p.drag * s);
        p.vx *= k;
        p.vy *= k;
      }
      p.x += p.vx * s;
      p.y += p.vy * s;
      p.rot += p.vr * s;
      if (p.kind === 'text') p.vy *= Math.exp(-s * 3);
      if ((p.kind === 'chip' || p.kind === 'shard' || p.kind === 'drop' || p.kind === 'snowChunk' || p.kind === 'waterDrop')
        && this.pastDebrisFloor(p.x, p.y, -14)) {
        if (this.debrisFallsAlongX) {
          p.x = W - 14;
          p.vx *= -0.35;
          p.vy *= 0.7;
        } else {
          p.y = H - 14;
          p.vy *= -0.35;
          p.vx *= 0.7;
        }
      }
      if (p.kind === 'shell' && this.pastDebrisFloor(p.x, p.y, -20)) {
        if (this.debrisFallsAlongX) {
          p.x = W - 20;
          p.vx *= -0.4;
          p.vy *= 0.6;
        } else {
          p.y = H - 20;
          p.vy *= -0.4;
          p.vx *= 0.6;
        }
      }
      this.particles[pWrite++] = p;
    }
    this.particles.length = pWrite;

    let fragWrite = 0;
    for (let i = 0; i < this.frags.length; i++) {
      const f = this.frags[i];
      this.turnDebris(f);
      if (this.debrisFallsAlongX) f.vx += 1300 * s;
      else f.vy += 1300 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      f.pitch += f.pitchV * s;
      if (f.pitch < 0.58 || f.pitch > 1.4) {
        f.pitch = Math.max(0.58, Math.min(1.4, f.pitch));
        f.pitchV *= -1;
      }
      if (!this.pastDebrisFloor(f.x, f.y, 200)) this.frags[fragWrite++] = f;
    }
    this.frags.length = fragWrite;

    let flyerWrite = 0;
    for (let i = 0; i < this.flyers.length; i++) {
      const f = this.flyers[i];
      this.turnDebris(f);
      if (this.debrisFallsAlongX) f.vx += 1400 * s;
      else f.vy += 1400 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      if (!this.pastDebrisFloor(f.x, f.y, 150)) this.flyers[flyerWrite++] = f;
    }
    this.flyers.length = flyerWrite;
    for (const d of this.dust) {
      if (this.debrisFallsAlongX) {
        // The motes drift *up the screen*: world -x is up once the world is
        // laid on its side, so they leave by world x = -5 and re-enter at W.
        d.x -= d.v * dt;
        d.y += Math.sin(this.time + d.x * 0.01) * 4 * dt;
        if (d.x < -5) {
          d.x = W + 5;
          d.y = Math.random() * H;
        }
      } else {
        d.y -= d.v * dt;
        d.x += Math.sin(this.time + d.y * 0.01) * 4 * dt;
        if (d.y < -5) {
          d.y = H + 5;
          d.x = Math.random() * W;
        }
      }
    }

    if (this.state === 'clear') {
      this.stateT += dt;
      if (this.stateT > 1.75 && this.time >= this.diamondHoldUntil && (this.level.mode !== 'treasure' || this.stageRewardPaid)) {
        if (this.level.boss && this.events.onBossDefeated) {
          this.state = 'idle';
          this.bankedCoins += 5; // the boss reward was already included in this.coins
          this.events.onBossDefeated(this.level.name, this.level.n, 5, bossHeadFor(this.level.n) ?? 'pirate');
        } else {
          this.loadLevel(this.level.n + 1);
        }
      }
    } else if (this.state === 'fail') {
      this.stateT += dt;
      if (this.stateT > 1.25) {
        this.state = 'over';
        this.events.onGameOver(this.score, this.level.n, Math.max(0, this.coins - this.bankedCoins), this.coins);
      }
    }
  }

  // ---------- drawing ----------
  private drawSpike(c: CanvasRenderingContext2D) {
    c.save();
    c.scale(SPIKE_SCALE, SPIKE_SCALE); // stage-board spikes are doubled; Nail Gun shots stay normal-sized
    const g = c.createLinearGradient(0, 0, 0, SPIKE_LEN + 6);
    g.addColorStop(0, '#2a2d33');
    g.addColorStop(0.6, '#5b616b');
    g.addColorStop(1, '#ff3030');
    c.beginPath();
    c.moveTo(-12, 0);
    c.lineTo(12, 0);
    c.lineTo(0, SPIKE_LEN + 6);
    c.closePath();
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = '#111';
    c.lineWidth = 1.5;
    c.stroke();
    c.beginPath();
    c.moveTo(-3, 2);
    c.lineTo(0, SPIKE_LEN);
    c.strokeStyle = 'rgba(255,255,255,0.35)';
    c.lineWidth = 1.2;
    c.stroke();
    c.restore();
  }

  private drawCoin(c: CanvasRenderingContext2D, t: number, glowing = true) {
    // One coin in the whole game: Diamond Breaker's reflective gold coin. The
    // HUD, every pickup, the bonus ring and the wallet all show this same art.
    drawBreakerCoin(c, 0, 0, CLASSIC_COIN_RADIUS, t, 0, Math.abs(Math.cos(t * 3)) * 0.6 + 0.4, glowing);
  }

  // Berlian / Diamond tertancap ke papan arena:
  // Ujung lancip (kerucut / pavilion) menancap ke dalam papan (-Y mengarah ke pusat target),
  // bagian atas (mahkota/table crown) menonjol keluar ke arah +Y sehingga hanya terlihat setengah berlian!
  // Wajib ditembak 2 kali baru lepas dan jatuh!
  private drawEmbeddedDiamond(c: CanvasRenderingContext2D, t: number, hits = 0) {
    const shake = hits === 1 ? Math.sin(t * 34) * 1.6 : 0;
    c.save();
    c.translate(shake, 0);
    c.scale(CLASSIC_DIAMOND_SCALE, CLASSIC_DIAMOND_SCALE);

    const D_SIZE = 14; // The board keeps its old footprint; only the gem art changes.

    // Pendaran kilau kristal (fast vector halo, zero Gaussian shadowBlur)
    c.fillStyle = hits === 1 ? 'rgba(251,113,133,0.28)' : 'rgba(56,189,248,0.26)';
    c.beginPath();
    c.arc(0, D_SIZE * 0.2, D_SIZE * 1.18, 0, TAU);
    c.fill();

    // Retakan & serpihan tanah/kayu di sekitar titik tancap (y = 0)
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath();
    c.ellipse(0, 0, D_SIZE * 0.8, 3.5, 0, 0, TAU);
    c.fill();

    // The gem itself is the collection screen's diamond — `DiamondSprite` draws
    // exactly this (`drawBreakerDiamond`), so the wallet and the board agree.
    // It sits a little proud of the board so the crown stays readable while the
    // pavilion is still sunk into the surface.
    drawBreakerDiamond(c, 0, -D_SIZE * 0.52, t, 0.22);

    // Retakan visual saat hits === 1
    if (hits === 1) {
      c.strokeStyle = 'rgba(255,255,255,0.95)';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-4, D_SIZE * 0.55);
      c.lineTo(1, D_SIZE * 0.2);
      c.lineTo(-2, -D_SIZE * 0.3);
      c.lineTo(3, -D_SIZE * 0.7);
      c.stroke();
    }

    // Badge hit indicator: "1x lagi!" atau "2x"
    c.font = 'bold 8.5px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const badgeLabel = hits === 1 ? '1x!' : '2x';
    c.strokeStyle = 'rgba(0,0,0,0.82)';
    c.lineWidth = 2.4;
    c.strokeText(badgeLabel, 0, D_SIZE * 0.95);
    c.fillStyle = hits === 1 ? '#ffe4e6' : '#ffffff';
    c.fillText(badgeLabel, 0, D_SIZE * 0.95);

    c.restore();
  }

  private drawProj(c: CanvasRenderingContext2D, kind: ProjKind, len?: number, age = 99, embedded = false) {
    const l = len ?? (kind === 'old' ? BLEN : getWeapon(kind).stick + EMBED);
    drawProjectile(c, kind, l, this.time, age, embedded, kind === 'diamond' ? 'new' : undefined);
  }

  /**
   * Slide 9's own aim guide (engine.ts `drawAimGuide`): a dashed line in the
   * weapon's accent from the muzzle to where it meets the wheel, and a
   * breathing ring with four turning ticks on that spot.
   */
  private drawNineAim(c: CanvasRenderingContext2D, muzzleY: number) {
    const id = this.setNineId;
    if (!id || this.level.mode === 'treasure') return;
    const acc = hexToRgbTriplet(nineWeapon(id).accent);
    const t = this.time;
    const R = this.level.radius;
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (const ox of this.gunOffsets) {
      const x = CX + ox;
      const hy = this.targetY + Math.sqrt(Math.max(0, R * R - ox * ox));
      c.setLineDash([3, 12]);
      c.lineDashOffset = -t * 60;
      c.strokeStyle = `rgba(${acc},0.3)`;
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(x, muzzleY - 4);
      c.lineTo(x, hy);
      c.stroke();
      c.setLineDash([]);
      const r = 10 + Math.sin(t * 8) * 2;
      c.strokeStyle = `rgba(${acc},0.8)`;
      c.lineWidth = 1.8;
      c.beginPath();
      c.arc(x, hy, r, 0, TAU);
      c.stroke();
      c.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + t * 1.5;
        c.moveTo(x + Math.cos(a) * (r + 3), hy + Math.sin(a) * (r + 3));
        c.lineTo(x + Math.cos(a) * (r + 9), hy + Math.sin(a) * (r + 9));
      }
      c.stroke();
    }
    c.restore();
  }

  /**
   * Slide 9's stand (engine.ts `drawPlayer`): the accent light pooled under
   * the weapon and the dark pedestal its grip rests over.
   */
  private drawNinePedestal(c: CanvasRenderingContext2D, y0: number) {
    const id = this.setNineId;
    if (!id) return;
    const acc = hexToRgbTriplet(nineWeapon(id).accent);
    const gs = GAMEPLAY_GUN_SCALE;
    for (const ox of this.gunOffsets) {
      const anchorX = CX + ox;
      const o = nineGunOrigin(id, anchorX, y0);
      const localDx = (o.x - anchorX) * gs;
      const localDy = (o.y - y0) * gs;
      // The left twin is drawn mirrored, so is its grip.
      const px = anchorX + (ox < 0 ? -localDx : localDx);
      const py = y0 + localDy;
      c.save();
      c.globalCompositeOperation = 'lighter';
      drawRgbGlowSprite(c, px, py + 42 * gs, 120 * gs, 32 * gs, acc, 0.72);
      c.restore();
      // No pedestal disc and no rim ring here: the gun stands in its own light
      // only, so no dark circle / outlined ellipse sits around the weapon.
    }
  }

  /**
   * World Y the weapon rig stands on.
   *
   * Portrait keeps the muzzle exactly at `GUN_Y`. Landscape rotates the world,
   * which turns world Y into screen X, so the rig is lifted by `LAND_GUN_LIFT`
   * to keep the grip (the widest part) clear of the screen's left edge.
   */
  /**
   * Hide the corner HUD while a celebration overlay owns the screen.
   *
   * The boss/victory panels keep the live stage visible behind them and print
   * their own stage and reward rows along the edges, so the score, wallet and
   * ammo corners would collide with that copy (in landscape they sit on exactly
   * the same pixels).
   */
  /** Turn the COMBO TITIK scoring mode on/off for the next (and current) run. */
  setSpotCombo(on: boolean) {
    this.spotComboOn = Boolean(on);
    if (!this.spotComboOn) this.spotHits = 0;
  }

  setHudHidden(hidden: boolean) {
    if (this.hudHidden === hidden) return;
    this.hudHidden = hidden;
    // The stage stops simulating behind a modal, so its last frame would stay on
    // screen — corners and all. Repaint once so the change is actually visible.
    if (this.canvas && typeof this.render === 'function') {
      try { this.render(); } catch { /* no 2D context yet */ }
    }
  }

  private get gunBaseY() {
    return this.orientation === 'landscape' ? GUN_Y - LAND_GUN_LIFT : GUN_Y;
  }

  /**
   * A point of the gun's rig in world space, including the landscape pose.
   *
   * Landscape draws the weapon through `translate(gunX, y) · rotate(tilt) ·
   * translate(-CX, -y)`, so the muzzle, every muzzle offset and every spark the
   * shot throws have to go through the same rotation — otherwise the rounds and
   * their effects leave from where the gun used to be before the player slid or
   * tilted it.
   */
  private gunPosePoint(x: number, y: number): { x: number; y: number } {
    if (this.orientation !== 'landscape') return { x, y };
    const tilt = this.gunTiltNow;
    if (!tilt) return { x, y };
    const cos = Math.cos(tilt);
    const sin = Math.sin(tilt);
    const dx = x - this.gunX;
    const dy = y - this.gunBaseY;
    return { x: this.gunX + dx * cos - dy * sin, y: this.gunBaseY + dx * sin + dy * cos };
  }

  /** `gunPosePoint` as the `(x, y)` tuple module fire calls take. */
  private poseMuzzleXY(x: number, y: number): [number, number] {
    const p = this.gunPosePoint(x, y);
    return [p.x, p.y];
  }

  /**
   * Where the page must draw the zip's weapon, for the five weapons whose art
   * lives in the DOM so its own CSS animation can run (see `ZipWeaponArt`).
   *
   * Null for every other weapon: those are drawn into this canvas.
   */
  private zipGunFrame: { x: number; y: number; rot: number; scale: number; hidden: boolean } | null = null;

  /** The zip weapon's anchor for the page overlay, in canvas px. */
  getZipGunFrame(): { x: number; y: number; rot: number; scale: number; hidden: boolean } | null {
    const frame = this.zipGunFrame;
    if (!frame) return null;
    // The menu never draws the gun (see `drawGunNow`'s caller), so a frame left
    // over from the last run must not float over the title screen.
    if (this.state === 'idle') return null;
    // The menu's captured frame owns the weapon while it travels in.
    return this.gunHiddenT > 0 ? { ...frame, hidden: true } : frame;
  }

  private drawGunNow(c: CanvasRenderingContext2D) {
    // One weapon only: the captured menu frame is still travelling here.
    if (this.gunHiddenT > 0) return;
    const sinceShot = this.state === 'idle' ? 9 : this.rt - this.lastShotRT;
    const kerisCharging =
      this.weapon.id === 'keris' && sinceShot >= 0 && sinceShot < KERIS_GLEAM_DUR;
    const ry = this.weapon.id === 'ghost' ? 0 : kerisCharging
      ? -3.5 * Math.sin((sinceShot / KERIS_GLEAM_DUR) * Math.PI)
      : this.recoil * 22 - (this.state === 'idle' ? Math.sin(this.time * 2) * 3 : 0);
    const entryOffset = gameplayGunEntryOffset(this.gunEntryT);
    const y0 = this.gunBaseY + ry + entryOffset;
    const R = this.level.radius;
    // The zip's five weapons are drawn by the page, in their own DOM layer, so
    // their glow and twinkle keep animating; everything else stays in canvas.
    // Only the "Skin 3" card is the zip's live SVG; every other card is drawn
    // into this canvas like any other gun.
    const zipGun = hasZipArt(this.weapon.id) && this.zipCardLive;
    this.zipGunFrame = zipGun
      ? {
          x: this.gunX,
          // The page draws the gun, so the shot's kick has to ride along with
          // the pose. The zip's own page travels its whole card back when it
          // fires, so the gun slides down the barrel axis, tips back and
          // punches out — that is the "senjata mundur" feel.
          y: y0 + this.recoil * zipKick(this.weapon.id).y,
          rot: this.gunTiltNow + this.recoil * zipKick(this.weapon.id).rot,
          scale: GAMEPLAY_GUN_SCALE * (1 + this.recoil * zipKick(this.weapon.id).punch),
          hidden: false,
        }
      : null;

    // Two upright barrels get two straight sights; a star never steers either.
    if (this.state === 'play' || this.state === 'intro') {
      // Landscape: the gun follows the pointer, so its sights turn with the
      // barrel and slide with the gun instead of pointing straight up.
      const posed = this.orientation === 'landscape' && (this.gunTiltNow !== 0 || this.gunLift !== 0);
      if (posed) {
        c.save();
        c.translate(this.gunX, y0);
        c.rotate(this.gunTiltNow);
        c.translate(-CX, -y0);
      }
      if (this.setSevenLive) {
        // Slide 3 shows no aim line — only its sniper's own laser sight.
        this.drawSevenSight(c, y0);
      } else if (this.weapon.id === 'firework' || this.weapon.id === 'yoyo') {
        const nextHue =
          this.weapon.id === 'firework'
            ? firework8ShotHue(this.level?.n ?? 1, this.getFwState().shotIdx)
            : yoyoAmmoHue(this.getYoyoState().shotIdx);
        const lg = c.createLinearGradient(0, y0, 0, this.targetY + R);
        lg.addColorStop(0, hsl(nextHue, 100, 70, 0.35));
        lg.addColorStop(1, 'rgba(255,255,255,0)');
        c.save();
        c.strokeStyle = lg;
        c.setLineDash([4, 7]);
        c.lineWidth = 1.5;
        for (const ox of this.gunOffsets) {
          c.beginPath();
          c.moveTo(CX + ox, y0);
          c.lineTo(CX + ox, this.targetY + R + 6);
          c.stroke();
        }
        c.setLineDash([]);
        c.restore();
      } else if (this.weapon.id === 'keris') {
        for (const ox of this.gunOffsets) {
          drawKerisAimGuide(c, CX + ox, y0, this.targetY + R, this.time);
        }
      } else if (this.setNineLive) {
        // Slide 9 brings its own aim guide (see `drawNineAim`).
        this.drawNineAim(c, y0);
      } else if (!this.setElevenLive) {
        // Slide 11 shows no generic aim line: its own sights (the rifle's
        // laser, the caster's three dots, the beacon's designator) come from
        // `drawElevenAim()`.
        const lg = c.createLinearGradient(0, y0, 0, this.targetY);
        lg.addColorStop(0, this.weapon.color + '66');
        lg.addColorStop(1, this.weapon.color + '00');
        c.fillStyle = lg;
        for (const ox of this.gunOffsets) {
          c.fillRect(CX + ox - 0.75, this.targetY + R, 1.5, y0 - this.targetY - R);
        }
      }
      if (posed) c.restore();
    }

    // laser beams
    for (const b of this.beams) {
      const a = b.life / b.max;
      if ((this.weapon.id === 'laser' || this.weapon.id === 'moonbeam')
        && getGunEffect(this.weapon.id) === 'original') {
        drawClassicBeam(c, b.x, b.y, y0, a, b.rgb);
        continue;
      }
      if (this.weapon.id === 'laser') {
        drawLaserBeam(c, b.x, b.y, y0, a, this.time);
        continue;
      }
      c.save();
      c.globalCompositeOperation = 'lighter';
      const wdt = 14 * a + 2;
      const bg = c.createLinearGradient(b.x - wdt, 0, b.x + wdt, 0);
      bg.addColorStop(0, `rgba(${b.rgb},0)`);
      bg.addColorStop(0.5, `rgba(${b.rgb},${a * 0.9})`);
      bg.addColorStop(1, `rgba(${b.rgb},0)`);
      c.fillStyle = bg;
      c.fillRect(b.x - wdt, b.y, wdt * 2, y0 - b.y);
      if (this.weapon.id === 'moonbeam') {
        // Instant beam mechanics stay intact, but the beam reads as a stream
        // of bright stars released from the wand rather than a laser rifle.
        c.shadowColor = '#d9c5ff'; c.shadowBlur = 12;
        c.strokeStyle = `rgba(255,244,218,${a * 0.75})`;
        c.lineWidth = 2.5 * a; c.lineCap = 'round';
        c.beginPath(); c.moveTo(b.x, b.y);
        for (let i = 0; i < 6; i++) {
          const yy = b.y + (y0 - b.y) * ((i + 1) / 6);
          c.lineTo(b.x + Math.sin(i * 2.4 + this.time * 8) * 6, yy);
        }
        c.stroke(); c.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
          const yy = b.y + (y0 - b.y) * ((i + 0.5) / 8);
          const xx = b.x + Math.sin(i * 2.8 + this.time * 8) * 7;
          const r = (i % 3 === 0 ? 8 : 5) * a;
          c.fillStyle = i % 3 === 0 ? '#fff2c5' : '#f7eeff';
          c.beginPath();
          for (let n = 0; n < 12; n++) {
            const theta = n * TAU / 12 - Math.PI / 2;
            const rad = n % 2 ? r * 0.4 : r;
            c.lineTo(xx + Math.cos(theta) * rad, yy + Math.sin(theta) * rad);
          }
          c.closePath(); c.fill();
        }
      } else {
        c.fillStyle = `rgba(255,255,255,${a})`;
        c.fillRect(b.x - 1.5 * a - 0.5, b.y, 3 * a + 1, y0 - b.y);
      }
      const hg = c.createRadialGradient(b.x, b.y, 1, b.x, b.y, 30);
      hg.addColorStop(0, `rgba(255,255,255,${a})`);
      hg.addColorStop(1, `rgba(${b.rgb},0)`);
      c.fillStyle = hg;
      c.beginPath();
      c.arc(b.x, b.y, 30, 0, TAU);
      c.fill();
      c.restore();
    }

    const ready = this.state === 'idle' || this.state === 'intro'
      || (this.cooldown <= 0 && this.reloadT === 0 && this.ammoLeft > 0
        && (this.weapon.id !== 'snowball' || this.snowLoaded > 0)
        && (this.weapon.id !== 'yoyo' || this.projs.length === 0));
    gunState.sinceShot = this.state === 'idle' ? 9 : this.rt - this.lastShotRT;
    gunState.saberSide = this.saberSide;
    gunState.reloadT = this.reloadT;
    // Slide-3 SET 1..7 artwork: hand the live motion over to the real renderer.
    // Firing slide 3's own shot, that is slide 3's own spring state (every
    // weapon kicks, pumps and charges with its own numbers); otherwise the
    // motion is rebuilt from the trigger age.
    const s3Variant = getGunVariant(this.weapon.id);
    // (SET 1's staff, pistol, slingshot… rebuild their own pose in
    // `setOneArt.ts` when slide 3's shot is not the one firing.)
    gunState.s7Anim = this.setSevenId && (s3Variant === 'set7' || (s3Variant === 'set1' && this.setSevenLive))
      ? (this.setSevenLive && this.s7State ? this.s7State.anim
        : buildSevenAnim({ sinceShot: gunState.sinceShot, charge: gunState.charge, spin: this.spin }))
      : null;
    if (this.weapon.id === 'firework' && gunState.s7Anim) gunState.s7Anim.idx = gunState.fireworkTube;
    // Slide 9's own draw state: its recoil curve, cycle, held charge and how
    // many of its rounds are still out (the identity disc uses that).
    gunState.s9Live = this.setNineLive;
    // Slide 6's own draw state: its draw progress across its own trigger
    // interval plus its 14 px recoil, so the live gun is the slide-6 gun.
    gunState.sixLive = this.setSixLive;
    gunState.sixState = this.setSixId
      ? sixStateFor(gunState.sinceShot, this.setSixId, this.time)
      : null;
    // Slide 11's own weapon state (recoil, charge, channel, shot clock) drives
    // its artwork inside the normal gun pipeline.
    gunState.elevenLive = this.setElevenLive;
    // Slide 2's own draw state: its recoil curve, its reload meter, the hue it
    // charges with and the cannon pulse its own shots feed.
    gunState.twoLive = this.setTwoLive;
    gunState.twoState = this.setTwoId
      ? {
        time: this.time,
        recoil: gunState.sinceShot >= 0.17 ? 0 : 1 - gunState.sinceShot / 0.17,
        loadP: this.setTwoLive
          ? Math.min(1, Math.max(0, gunState.sinceShot) * 7)
          : 1,
        ammo: Math.max(0, this.ammoLeft),
        hue: this.s2HueFor(this.setTwoId),
        live: this.state === 'play',
        cannonPulse: this.s2wState?.cannonPulse ?? 0,
      }
      : null;
    gunState.elevenState = this.setElevenId ? this.s11State?.state ?? null : null;
    const nineW = this.setNineId ? nineWeapon(this.setNineId) : null;
    const since9 = Math.max(0, gunState.sinceShot);
    gunState.s9State = nineW
      ? {
        t: this.time,
        // Slide 9's recoil: 1 → 0 at 6.4 per second.
        recoil: Math.max(0, 1 - since9 * 6.4),
        // The bow's string: drawn at 3.4 per second, let go at once.
        charge: this.setNineLive && nineW.charged && this.charging ? Math.min(1, this.chargeT * 3.4) : 0,
        // Its action (bolt, slide, pump, capacitor) cycles over its own interval.
        cycle: nineW.cooldown > 0 ? Math.min(1, since9 / nineW.cooldown) : 1,
        // Rounds still out — the disc stays out of the hand until it is caught.
        out: this.s9State ? this.s9State.out() : 0,
        catchT: this.s9State ? this.s9State.catchT : 9,
      }
      : null;
    const totalAmmo = this.level.ammo * this.maxAmmoMult;
    gunState.ammoRatio = totalAmmo > 0 ? Math.max(0, Math.min(1, this.ammoLeft / totalAmmo)) : 1;
    // xeno/pred animation state
    const wId = this.weapon.id;
    gunState.jaw = wId === 'xeno' ? Math.max(0, 1 - gunState.sinceShot / 0.3) : 0;
    gunState.glow = wId === 'xeno' ? Math.max(0, 1 - gunState.sinceShot / 0.4) : 0;
    gunState.servo = wId === 'pred' ? Math.max(0, 1 - gunState.sinceShot / 0.5) : 0;
    gunState.heat = wId === 'pred' ? Math.max(0, 1 - gunState.sinceShot / 0.6) : 0;
    const flash = Math.max(0, this.muzzle / 0.07);
    // Slide 3's own gun art brings its own light: the glows other slides paint
    // under the firework, yo-yo, keris and diamond guns are not part of it.
    const s3Art = gunState.s7Anim !== null;
    if (this.weapon.id === 'firework' && !s3Art) {
      const fw = this.getFwState();
      const nextHue = firework8ShotHue(this.level?.n ?? 1, fw.shotIdx);
      gunState.rocketHue = nextHue;
      for (const ox of this.gunOffsets) {
        drawFirework8GunGlow(c, CX + ox, y0 + 50 * GAMEPLAY_GUN_SCALE, nextHue, 0);
      }
    }
    if (this.weapon.id === 'yoyo' && !s3Art) {
      const yoyo = this.getYoyoState();
      const nextHue = yoyoAmmoHue(yoyo.shotIdx);
      gunState.yoyoHue = nextHue;
      for (const ox of this.gunOffsets) {
        drawYoyoSlideGunGlow(c, CX + ox, y0 + 60 * GAMEPLAY_GUN_SCALE, nextHue, this.recoil);
      }
    }
    if (this.weapon.id === 'diamond' && !s3Art) {
      for (const ox of this.gunOffsets) {
        drawDiamondSlideGunGlow(c, CX + ox, y0 + 70 * GAMEPLAY_GUN_SCALE, this.recoil);
      }
    }

    // Slide 2's voids (the singularity's event horizon) sit BEHIND the gun and
    // the wheel; everything else it paints is drawn later, on top.
    if (this.s2wState && this.s2wState.voids.length > 0) {
      this.s2wState.drawBehind(c, this.time);
    }
    // The slide-11 gun stands still on its contact shadow here (slide 11's
    // own stance); menu cards keep their idle sway and no shadow.
    gunState.elevenStage = this.setElevenLive;
    // The slide-9 gun stands still on slide 9's pedestal, in its accent light.
    gunState.nineStage = this.setNineLive;
    try {
      if (this.weapon?.rarity) {
        const rarityRgb = gunSunburstColor(this.weapon.rarity);
        c.save();
        c.globalCompositeOperation = 'lighter';
        drawRgbGlowSprite(c, this.gunX, GUN_Y + entryOffset + 42, 165, 92, rarityRgb, 0.42);
        c.restore();
      }
      if (this.setNineLive) this.drawNinePedestal(c, y0);
      // Only this live game draw supplies a particle sink. Menu and arsenal
      // previews can draw the same gun without mutating a paused game.
      const liveGunFx = this.weapon.id === 'blackhole' && s3Variant === 'latest' ? this.s2 : undefined;
      if (zipGun) {
        // Drawn by the page: `getZipGunFrame()` above is the only thing it needs.
      } else if (this.hasTwinGuns) {
        // Left gun mirrored and right gun normal: their grips/magazines face OUT,
        // matching the side-by-side AK-47 silhouette rather than overlapping.
        for (const ox of this.gunOffsets) {
          c.save();
          c.translate(this.gunX + ox, y0);
          if (this.gunTiltNow) c.rotate(this.gunTiltNow);
          this.sevenGunPose(c);
          c.scale(ox < 0 ? -GAMEPLAY_GUN_SCALE : GAMEPLAY_GUN_SCALE, GAMEPLAY_GUN_SCALE);
          drawGun(c, this.weapon.id, 0, 0, this.time, flash, ready, this.snowLoaded, undefined, liveGunFx);
          c.restore();
        }
      } else {
        c.save();
        c.translate(this.gunX, y0);
        if (this.gunTiltNow) c.rotate(this.gunTiltNow);
        this.sevenGunPose(c);
        c.scale(GAMEPLAY_GUN_SCALE, GAMEPLAY_GUN_SCALE);
        drawGun(c, this.weapon.id, 0, 0, this.time, flash, ready, this.snowLoaded, undefined, liveGunFx);
        c.restore();
      }
    } finally {
      gunState.elevenStage = false;
      gunState.nineStage = false;
    }

  }

  /**
   * Slide 3's `drawLaser()`: the sniper's red sight from just above its
   * muzzle (riding its recoil) to the bottom of the wheel, flickering at 40 Hz,
   * once the gun has settled 0.1 s after a shot.
   */
  private drawSevenSight(c: CanvasRenderingContext2D, y0: number) {
    const a = this.s7State?.anim;
    if (this.setSevenId !== 'sniper' || !a || this.state !== 'play' || a.fireT <= 0.1) return;
    const y1 = this.targetY + (this.s7State?.feel.bumpY ?? 0) + this.level.radius - 1;
    const fl = 0.85 + 0.15 * Math.sin(this.s7State!.time * 40);
    for (const ox of this.gunOffsets) {
      const x = CX + ox;
      const ys = y0 - 8 + a.recoil * 14;
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.lineCap = 'round';
      c.strokeStyle = `rgba(255,40,40,${(0.14 * fl).toFixed(3)})`;
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(x, ys);
      c.lineTo(x, y1);
      c.stroke();
      c.strokeStyle = `rgba(255,70,60,${(0.7 * fl).toFixed(3)})`;
      c.lineWidth = 1.3;
      c.stroke();
      c.strokeStyle = 'rgba(255,215,205,0.55)';
      c.lineWidth = 0.5;
      c.stroke();
      drawSprite(c, glowSprite('255,40,40'), x, y1, 30, 0.8 * fl);
      drawSprite(c, glowSprite('255,230,220'), x, y1, 9, 0.9);
      c.restore();
    }
  }

  /**
   * Slide 3's `drawWeaponLayer()` pose: the gun sways 1 px and bobs 1.2 px,
   * kicks back 14 px per unit of its recoil spring and tips by its own
   * `RECOIL_ROT` — slide 3's gun motion, in place of slide 1's 22 px jump.
   */
  private sevenGunPose(c: CanvasRenderingContext2D) {
    const id = this.setSevenId;
    const a = gunState.s7Anim;
    if (!id || !a || !this.setSevenLive || this.state === 'idle' || this.weapon.id === 'ghost') return;
    const s7t = this.s7State?.time ?? this.time;
    const sway = Math.sin(s7t * 1.6) * 1.0;
    const bob = Math.sin(s7t * 2.2) * 1.2;
    c.translate(sway, bob + a.recoil * 14);
    c.rotate(-a.recoil * (RECOIL_ROT[id] ?? 0));
  }

  private forestBackdrop: HTMLCanvasElement | null = null;
  private forestBackdropKey = '';
  private forestBackdropDensity = 0;
  private forestBackdropCtx: CanvasRenderingContext2D | null = null;
  private forestGlowPaint: CanvasGradient | null = null;
  private forestGlowKey = '';
  private specialOverlayCanvas: HTMLCanvasElement | null = null;
  private specialOverlayKey = '';

  private drawForestBackground(c: CanvasRenderingContext2D, pal: (typeof STYLE_COLORS)[Style], R: number) {
    const theme = this.bgTheme ?? 'auto';

    // Explicit player-selected themes always function across every SGA weapon & stage.
    if (theme === 'skyline') {
      drawFirework8Background(
        c,
        this.getFwState(),
        this.dpr,
        CX,
        this.targetY - this.bump * 9,
        R,
        this.level?.n ?? 1,
      );
      return;
    }
    if (theme === 'battlefield') {
      const bz = this.getBazookaState();
      bz.time = this.time;
      bz.drawBackground(c, W, H);
      return;
    }
    if (theme === 'mystic') {
      drawKerisSlideBackground(
        c,
        this.getKerisState(),
        CX,
        this.targetY - this.bump * 9,
        R,
        this.time,
        this.level?.boss ?? false,
        W,
        H,
      );
      return;
    }
    if (theme === 'crystal') {
      drawDiamondSlideBackground(
        c,
        this.getDiamondState(),
        this.dpr,
        CX,
        this.targetY - this.bump * 9,
        R,
        this.level?.n ?? 1,
        this.time,
      );
      return;
    }
    if (theme === 'yoyo_neon') {
      drawYoyoSlideBackground(
        c,
        this.getYoyoState(),
        this.dpr,
        CX,
        this.targetY - this.bump * 9,
        R,
        this.level?.n ?? 1,
        this.time,
      );
      return;
    }
    if (
      theme === 'morning' ||
      theme === 'town' ||
      theme === 'snow' ||
      theme === 'royal_vault' ||
      theme === 'cyber_grid' ||
      theme === 'nebula'
    ) {
      drawCustomSgaTheme(c, theme, {
        w: W,
        h: H,
        cx: CX,
        targetY: this.steadyTargetY,
        targetR: R,
        time: this.time,
        dpr: this.dpr,
        glow: pal.glow,
        dust: this.dust,
      });
      return;
    }

    // In 'auto' mode, the firework, yoyo, keris, diamond and bazooka scenes
    // belong to the slides those guns came from; in 'forest' mode, always keep
    // Gun Hit's forest even when equipping ported weapons.
    if (theme === 'auto') {
      const ownScene = !this.setSevenLive;
      if (this.state !== 'idle' && this.weapon.id === 'firework' && ownScene) {
        drawFirework8Background(
          c,
          this.getFwState(),
          this.dpr,
          CX,
          this.targetY - this.bump * 9,
          R,
          this.level?.n ?? 1,
        );
        return;
      }
      if (this.state !== 'idle' && this.weapon.id === 'yoyo') {
        drawYoyoSlideBackground(
          c,
          this.getYoyoState(),
          this.dpr,
          CX,
          this.targetY - this.bump * 9,
          R,
          this.level?.n ?? 1,
          this.time,
        );
        return;
      }
      if (this.state !== 'idle' && this.weapon.id === 'keris' && ownScene) {
        drawKerisSlideBackground(
          c,
          this.getKerisState(),
          CX,
          this.targetY - this.bump * 9,
          R,
          this.time,
          this.level?.boss ?? false,
          W,
          H,
        );
        return;
      }
      if (this.state !== 'idle' && this.weapon.id === 'diamond' && ownScene) {
        drawDiamondSlideBackground(
          c,
          this.getDiamondState(),
          this.dpr,
          CX,
          this.targetY - this.bump * 9,
          R,
          this.level?.n ?? 1,
          this.time,
        );
        return;
      }
      if (this.state !== 'idle' && this.weapon.id === 'bazooka' && ownScene) {
        this.getBazookaState().drawBackground(c, W, H);
        return;
      }
    }

    // Sky, silhouettes and the vignette never change inside a stage, so they are
    // rasterised once per style + raster density and blitted. The target glow is
    // the only part that follows the radius, and it is painted live on top —
    // baking it meant a full-screen backdrop repaint on every Grow/Shrink-Ray
    // frame (the radius eases by fractions of a pixel every frame), measured at
    // 34 ms per frame instead of 2.8 ms in the offline audit: a slideshow on a
    // phone. Live glow keeps the same pixels and follows the radius smoothly.
    const density = Math.ceil(this.dpr || 1);
    const key = `${this.level.style}:${density}`;
    if (key !== this.forestBackdropKey || !this.forestBackdrop) {
      // Reuse the same surface: allocating a fresh full-screen canvas per repaint
      // was the expensive half of the old behaviour.
      let backdrop = this.forestBackdrop;
      let bg = this.forestBackdropCtx;
      if (!backdrop || this.forestBackdropDensity !== density || !bg) {
        const doc = (globalThis as { document?: Document }).document;
        if (doc && typeof doc.createElement === 'function') {
          backdrop = doc.createElement('canvas');
          backdrop.width = W * density;
          backdrop.height = H * density;
          bg = backdrop.getContext('2d');
        } else {
          backdrop = null;
          bg = null;
        }
      }
      if (backdrop && bg) {
        bg.setTransform(1, 0, 0, 1, 0, 0);
        bg.clearRect(0, 0, backdrop.width, backdrop.height);
        bg.setTransform(density, 0, 0, density, 0, 0);
        this.paintForestBackdrop(bg);
        this.forestBackdrop = backdrop;
        this.forestBackdropCtx = bg;
        this.forestBackdropKey = key;
        this.forestBackdropDensity = density;
      }
    }
    if (this.forestBackdrop) {
      c.drawImage(this.forestBackdrop, 0, 0, W, H);
    } else {
      this.paintForestBackdrop(c);
    }
    this.paintForestGlow(c, pal, R, this.steadyTargetY);
    this.paintForestVignette(c);

    // 5. Golden fireflies still pulse individually, but their auras and cores
    // are batched instead of asking the canvas for 90 separate fills a frame.
    drawForestFireflies(c, this.dust, this.time);

    // 6. Bottom grass: the menu paints this same band (stageBackdrop.ts).
    paintStageGrass(c, this.time);
  }

  /**
   * The part of the forest that never changes inside a stage: sky gradient, far
   * and near tree silhouettes. Cached once per style + raster density, so the
   * radius easing of the Grow/Shrink Ray can never invalidate it.
   */
  private paintForestBackdrop(c: CanvasRenderingContext2D) {
    // Same painter the menu uses, so both rooms are the same room.
    paintStageForest(c, this.level.style);
  }

  /**
   * 4. Ambient target glow (cahaya lembut di sekitar buah / target).
   *
   * This one *does* follow the radius, so it is painted live on top of the
   * cached art instead of being baked into it. Two full-screen fills a frame cost
   * a fraction of a millisecond and are cheaper than repainting a whole
   * backdrop whenever the radius eases by a fraction of a pixel. The gradient is
   * kept while its geometry is unchanged, so growing a head does not allocate a
   * shader per frame either.
   */
  private paintForestGlow(
    c: CanvasRenderingContext2D,
    pal: (typeof STYLE_COLORS)[Style],
    R: number,
    glowCenterY = this.steadyTargetY,
  ) {
    const outer = Math.max(24, Math.round(R * 2.5 * 2) / 2);
    const centreY = Math.round(glowCenterY * 2) / 2;
    const key = `${outer}:${centreY}:${pal.glow}`;
    if (key !== this.forestGlowKey || !this.forestGlowPaint) {
      const targetGlow = c.createRadialGradient(CX, centreY, 20, CX, centreY, outer);
      targetGlow.addColorStop(0, pal.glow);
      targetGlow.addColorStop(0.6, pal.glow.replace(/[\d.]+\)$/, '0.06)'));
      targetGlow.addColorStop(1, 'rgba(0,0,0,0)');
      this.forestGlowPaint = targetGlow;
      this.forestGlowKey = key;
    }
    c.fillStyle = this.forestGlowPaint;
    c.fillRect(0, 0, W, H);
  }

  /** A restrained bottom vignette: depth without hiding the lower forest. */
  private paintForestVignette(c: CanvasRenderingContext2D) {
    paintStageVignette(c);
  }

  private drawBonusRing(c: CanvasRenderingContext2D, radius: number) {
    c.save();
    c.scale(radius / 196, radius / 196);
    for (let i = 0; i < this.bonusCoins.length; i++) {
      const coin = this.bonusCoins[i];
      if (coin.taken) continue;
      drawBonusCoin(c, coin.lx, coin.ly, 11, this.time, coin.phase, true);
    }
    c.restore();
  }

  private render() {
    const c = this.ctx;
    const k = this.scale * this.dpr;
    // Everything below draws in *world* coordinates. In landscape the base
    // transform is the 90° rotation from `layout.ts`, so the gun ends up on the
    // left firing right and the wheel on the right — without the engine ever
    // learning which way the screen is facing.
    c.setTransform(...worldTransform(this.orientation, k));
    // The gun pose is a frame input: an overlay repaint (a modal closing) must
    // draw slide 11's effects where the barrel is now, without waiting for a tick.
    this.syncElevenPose();
    const pal = STYLE_COLORS[this.level.style];
    const R = this.level.radius;
    let busterWheelTransform: DOMMatrix | null = null;
    let hasBusterWheelPellets = false;

    // Keep Gun Hit's forest or player-selected theme, while allowing 'auto' mode
    // to paint Slide 2's night sky when a Set-2 gun is equipped.
    const autoSetTwoSky = (this.bgTheme ?? 'auto') === 'auto' && this.setTwoLook;
    if (autoSetTwoSky) drawSetTwoSky(c);
    else this.drawForestBackground(c, pal, R);
    if (isSpecial(this.level.mode)) {
      const warmBg = this.level.mode === 'treasure' || this.level.mode === 'bonus';
      const ovKey = `${warmBg ? 'white-bonus' : 'white-ice'}:${SPECIAL_CY}`;
      if (ovKey !== this.specialOverlayKey || !this.specialOverlayCanvas) {
        const doc = (globalThis as { document?: Document }).document;
        if (doc && typeof doc.createElement === 'function') {
          const ov = doc.createElement('canvas');
          ov.width = W;
          ov.height = H;
          const oc = ov.getContext('2d');
          if (oc) {
            const tint = oc.createLinearGradient(0, 0, 0, H);
            tint.addColorStop(0, warmBg ? 'rgba(54,24,56,0.62)' : 'rgba(9,32,65,0.58)');
            tint.addColorStop(1, warmBg ? 'rgba(44,23,10,0.36)' : 'rgba(10,34,54,0.28)');
            oc.fillStyle = tint;
            oc.fillRect(0, 0, W, H);
            // Soft pure-white radial halo behind the special wheel (never yellow)
            const halo = oc.createRadialGradient(CX, SPECIAL_CY, 24, CX, SPECIAL_CY, 245);
            halo.addColorStop(0, 'rgba(255,255,255,0.20)');
            halo.addColorStop(1, 'rgba(255,255,255,0)');
            oc.fillStyle = halo;
            oc.fillRect(0, 0, W, H);
            this.specialOverlayCanvas = ov;
            this.specialOverlayKey = ovKey;
          }
        }
      }
      if (this.specialOverlayCanvas) {
        c.drawImage(this.specialOverlayCanvas, 0, 0, W, H);
      } else {
        const tint = c.createLinearGradient(0, 0, 0, H);
        tint.addColorStop(0, warmBg ? 'rgba(54,24,56,0.62)' : 'rgba(9,32,65,0.58)');
        tint.addColorStop(1, warmBg ? 'rgba(44,23,10,0.36)' : 'rgba(10,34,54,0.28)');
        c.fillStyle = tint; c.fillRect(0, 0, W, H);
        const halo = c.createRadialGradient(CX, this.targetY, 24, CX, this.targetY, 245);
        halo.addColorStop(0, 'rgba(255,255,255,0.20)');
        halo.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = halo; c.fillRect(0, 0, W, H);
      }
    }
    // Slide 2's 110 twinkling stars ride on top of the sky it just painted in 'auto' mode.
    if (autoSetTwoSky) drawSetTwoStars(c, this.time);

    c.save();
    // Slide 9's cinematic punch-zoom: the scene pushes in a touch on its heavy
    // shots and hits (engine.ts `render`), around the wheel.
    const nz = Math.min(1, this.nineShake / 30);
    if (nz > 0.02) {
      const zs = 1 + nz * nz * 0.03;
      c.translate(CX, this.targetY);
      c.scale(zs, zs);
      c.translate(-CX, -this.targetY);
    }
    if (this.shake > 0.1) c.translate(rand(-1, 1) * this.shake, rand(-1, 1) * this.shake);
    // Slide 9's jolt: ±0.35 of its shake amount.
    if (this.nineShake > 0.3) c.translate(rand(-1, 1) * this.nineShake * 0.35, rand(-1, 1) * this.nineShake * 0.35);
    c.translate(0, this.camY);
    // The per-weapon atmosphere wash slide 2 paints over its sky in 'auto' mode.
    if (autoSetTwoSky) {
      drawSetTwoAtmosphere(c, this.weapon.id, this.time, CX, this.targetY);
    }

    // Slide 11's scene light: its muzzles and impacts light the whole scene
    // under the wheel, the way slide 11's own `render()` paints it.
    if (this.state !== 'idle' && this.elevenActive) this.s11State!.drawLight(c);

    // The wheel artwork and its rays share one center/transform while Perfect
    // Shot's entrance plays — exactly like the right-hand game's target art.
    const wheelEntryT = this.wheelEntryT - this.wheelEntryDelayT;
    const burstT = this.wheelBurstT - this.wheelEntryDelayT;
    const wheelEntering = wheelEntryT < 1.16 * this.pace;
    const wheelEntry = wheelEntering
      ? perfectShotWheelEntry(wheelEntryT, this.pace, R)
      : RESTING_WHEEL_ENTRY;
    const wheelEntryBurst = burstT > 0 && burstT < 1.75 * this.pace
      ? perfectShotWheelBurst(burstT, this.pace)
      : NO_WHEEL_BURST;
    // Pure-white Sunburst ALWAYS renders BEHIND the front view of the wheel,
    // rock, bonus coin ring, treasure chest, and shattering wheel fragments!
    if (this.state !== 'idle' && isSpecial(this.level.mode)) {
      const specialRays = getSpecialSunburstTheme(this.level.mode as 'boulder' | 'bonus' | 'treasure');
      drawBehindWheelSunburst(
        c,
        CX,
        this.targetY + wheelEntry.offsetY,
        R * 1.92,
        this.time,
        0.42 * wheelEntry.opacity,
        specialRays.rgb,
      );
    }
    const clearBurstT = this.stageClearBurstT ?? 0;
    if (clearBurstT > 0) {
      const burstMax = this.stageClearBurstMax || 0.9;
      const u = Math.max(0, Math.min(1, 1 - clearBurstT / burstMax));
      const fade = 1 - u;
      const burstR = (this.stageClearBurstBoss ? 255 : 210) * (0.72 + 0.42 * Math.min(1, u * 2.2));
      const clearRays = getWheelSunburstTheme(this.level.style);
      drawBehindWheelSunburst(
        c,
        CX,
        this.targetY,
        burstR,
        this.time * 1.8,
        fade * (this.stageClearBurstBoss ? 0.95 : 0.82),
        clearRays.rgb,
      );
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = clearRays.shockwave.replace(/[\d.]+\)$/, `${(fade * 0.55).toFixed(3)})`);
      c.lineWidth = (this.stageClearBurstBoss ? 4.5 : 3.2) * fade;
      c.beginPath();
      c.arc(CX, this.targetY, R * 0.55 + u * (this.stageClearBurstBoss ? 195 : 155), 0, TAU);
      c.stroke();
      c.restore();
    }

    // Keep the clean diamond / chest visible through the special-stage celebration.
    if (this.state !== 'idle' && (this.state !== 'clear' || isSpecial(this.level.mode))) {
      const wheelFrame = this.wheelDrawFrame();
      // A slide-11 gun's hits kick, squash and shiver the wheel like slide 11's.
      const wm = this.elevenMotion();
      // …and a slide-9 gun's hits shove it back on slide 9's recoil spring.
      const nk = this.nineKick();
      // …and a slide-3 gun's hits bounce it on slide 3's own spring and pulse
      // its size (the shrink and grow rays).
      const s7w = this.sevenWheel;
      const sf = s7w ? s7w.feel : null;
      c.save();
      c.globalAlpha *= wheelEntry.opacity;
      if (wheelEntry.brightness !== 1) c.filter = `brightness(${wheelEntry.brightness})`;
      c.translate(wheelFrame.x, wheelFrame.y);
      if (wheelEntryBurst.flashOpacity > 0 || wheelEntryBurst.waves.some((wave) => wave.opacity > 0)) {
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.filter = 'none';
        const entryFlashRadius = R * 1.2 * wheelEntryBurst.flashScale;
        if (wheelEntryBurst.flashOpacity > 0) {
          const flash = c.createRadialGradient(0, 0, 0, 0, 0, entryFlashRadius);
          flash.addColorStop(0, 'rgba(255,255,255,.95)');
          flash.addColorStop(0.35, this.level.boss ? 'rgba(255,120,80,.6)' : 'rgba(255,240,200,.45)');
          flash.addColorStop(0.7, 'rgba(255,255,255,0)');
          c.globalAlpha *= wheelEntryBurst.flashOpacity;
          c.fillStyle = flash;
          c.beginPath();
          c.arc(0, 0, entryFlashRadius, 0, TAU);
          c.fill();
        }
        for (const [index, wave] of wheelEntryBurst.waves.entries()) {
          if (wave.opacity <= 0) continue;
          // A boss is not a disc: the entrance shockwave would draw two rings
          // around the head at radius R, i.e. exactly the circle this hitbox is
          // not. Its soft flash above still plays, so the arrival reads the same.
          if (this.level.boss) continue;
          c.globalAlpha = wheelEntry.opacity * wave.opacity;
          c.strokeStyle = index === 1
            ? 'rgba(255,255,255,1)'
            : this.level.boss ? '#ff6b6b' : '#fff3b0';
          c.shadowBlur = index === 1 ? 0 : this.level.boss ? 30 : 26;
          c.shadowColor = this.level.boss ? '#ff4d4d' : '#ffd27a';
          c.lineWidth = wave.width;
          c.beginPath();
          c.arc(0, 0, R * wave.scale, 0, TAU);
          c.stroke();
        }
        c.restore();
      }
      c.scale(wheelFrame.sx, wheelFrame.sy);
      // Slide 2's soft ring of light behind the target.
      if (this.setTwoLook) {
        drawSetTwoWheelGlow(c, R, setTwoWheelHue(this.weapon.id, this.level.n), Math.min(1, this.bump / 14));
      }
      // Ordinary round targets keep their drop shadow. The special rock and
      // treasure chest must NOT sit on a large black disk as chunks fall away.
      // A boss never gets one either: its head is drawn from Game B's art and
      // only the blue outline may frame it.
      if (!isSpecial(this.level.mode) && !this.level.boss) {
        c.beginPath();
        c.arc(0, 10, R + 6, 0, TAU);
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fill();
      }
      // Idle "hidup" untuk bos: melayang pelan, napas, dan goyangan lembut —
      // bos TIDAK diem, tapi juga TIDAK muter/membalik. Transform visual murni;
      // this.rot tetap terkunci 0 untuk fisika proyektil & bidikan.
      if (this.level.boss) {
        const decor = this.bossDecorMatrix();
        c.transform(decor.a, decor.b, decor.c, decor.d, decor.e, decor.f);
      }
      if (this.rock && !this.centerDiamondCollected) drawRockDiamond(c, R, this.time, this.diamondPing);
      // Lapisan target berputar — bos juga berputar pelan (this.rot di update),
      // bukan terkunci diam. Kecepatan boss konstan agar tidak muter liar.
      if (this.level.mode !== 'treasure') c.rotate(this.rot);
      // From here down the canvas is in the artwork's own frame. Remember it:
      // the boss' impact splinters are painted much later, in screen space, and
      // must be clipped to exactly this drawing.
      this.bossArtScreen = this.level.boss && typeof c.getTransform === 'function' ? c.getTransform() : null;
      hasBusterWheelPellets = !this.rock && !this.chest && this.items.some((it) => !!it.busterPellet);
      if (hasBusterWheelPellets && typeof c.getTransform === 'function') {
        busterWheelTransform = c.getTransform() ?? null;
      }
      for (const it of this.items) {
        // A boss stage's rintangan are Perfect Shot's knives: tip buried 30 %
        // into the drawing, handle hanging out, leaning a few degrees.
        if (it.type === 'old' && it.knife !== undefined) {
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const kh = R * 0.72;
          c.translate(0, this.bossRadiusAt(it.angle, R) - kh * KNIFE_SINK);
          c.rotate(((it.tilt ?? 0) * Math.PI) / 180);
          drawKnife(c, it.knife, kh);
          c.restore();
          continue;
        }
        if (it.type === 'bullet' || it.type === 'old') {
          if (it.hideArt) continue; // slide 9 paints its own entry hole
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const sink = it.type === 'bullet' ? Math.max(0, 1 - it.age * 12) * 6 : 0;
          const sc = it.scale ?? 1;
          const totalWeaponLen = it.type === 'old' ? BLEN : (getWeapon(it.w || 'pistol').stick + 12);
          const len = totalWeaponLen;
          // Masuk lebih dalam hingga hanya terlihat setengah (50% tertanam di
          // dalam papan). Di boss, kepala digambar SETELAH peluru, jadi yang
          // terlihat hanya bagian yang menonjol keluar garis: ujung peluru
          // duduk tepat DI garis biru (sisanya tertutup gambar kepala). Angka
          // ini sama untuk semua senjata — pistol, AK-47, minigun, shotgun —
          // supaya hit-nya terbaca identik di mana pun peluru berhenti.
          const embedDepth = totalWeaponLen * (this.level.boss ? 0.18 : 0.5);
          const pencilEmbedBonus = it.w === 'pencil' ? Math.sin(it.angle * 13) * 5 : 0;
          const itemR = it.px !== undefined && it.py !== undefined
            ? Math.hypot(it.px, it.py)
            : it.r ?? this.bossRadiusAt(it.angle, R);
          const snowball = it.type === 'bullet' && it.w === 'snowball';
          const firework = it.type === 'bullet' && it.w === 'firework';
          const yoyo = it.type === 'bullet' && it.w === 'yoyo';
          const keris = it.type === 'bullet' && it.w === 'keris';
          const diamond = it.type === 'bullet' && it.w === 'diamond';
          const bazooka = it.type === 'bullet' && it.w === 'bazooka';
          const gauntlet = it.type === 'bullet' && it.w === 'gauntlet_cannon';
          const magnet = it.type === 'bullet' && it.w === 'magnet';
          // Place the snowy hemisphere, firework rocket nose, yoyo, keris, diamond, bazooka, gauntlet knuckles, or 2x horseshoe magnet at the hit surface.
          c.translate(0, snowball || keris ? itemR + sink
            : firework ? itemR - FIREWORK_EMBED_NOSE * sc + sink
            : yoyo ? itemR + 4 * sc + sink
            : diamond ? itemR + 9 * sc + sink
            : bazooka ? itemR - 5 * sc + sink
            : gauntlet ? itemR - 5.5 * sc + sink
            : magnet ? itemR - 4 * sc + sink
            : itemR - (embedDepth + pencilEmbedBonus) * sc + sink);
          c.scale(sc, sc);
          gunState.bigShot = it.big ?? 0;
          if (it.tint) gunState.tint = it.tint;
          if (firework) {
            gunState.rocketHue = it.hue ?? 340;
            gunState.rocketFlash = it.flash ?? 0;
          }
          if (yoyo) {
            gunState.yoyoHue = it.hue ?? 0;
            gunState.yoyoFlash = it.flash ?? 0;
          }
          if (diamond) {
            gunState.diamondFlash = it.flash ?? 0;
            gunState.diamondSeed = it.angle * 3.7;
          }
          if (bazooka) {
            gunState.bazookaHue = it.hue ?? 45;
            gunState.bazookaFlash = it.flash ?? 0;
            gunState.bazookaSeed = it.angle * 3.7;
            gunState.bazookaBite = Math.max(0.38, 1 - it.age * 0.8);
          }
          // ---- specialized stuck rendering (game-3: drawAirVortex, drawPlasmaScar) ----
          const wSeed = (it.angle * 7 + this.targetY * 3) % 1000;
          const clamp01w = (v: number) => Math.max(0, Math.min(1, v));
          const glowAtW = (gx: number, gy: number, gr: number, gcolor: string, ga: number) => {
            if (ga <= 0.003 || gr <= 0) return;
            const alpha = Math.min(1, ga);
            c.save();
            c.globalCompositeOperation = 'lighter';
            c.fillStyle = gcolor;
            c.globalAlpha = alpha * 0.22;
            c.beginPath(); c.arc(gx, gy, gr, 0, TAU); c.fill();
            c.globalAlpha = alpha * 0.48;
            c.beginPath(); c.arc(gx, gy, gr * 0.56, 0, TAU); c.fill();
            c.globalAlpha = alpha * 0.85;
            c.beginPath(); c.arc(gx, gy, gr * 0.24, 0, TAU); c.fill();
            c.restore();
          };
          const rgbaW = (h: string, a: number) => { const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
          let skipWheelProj = false;
          if (it.w === 'xeno') {
            skipWheelProj = true; // the metaball layer paints the stuck acid
          } else if (it.w === 'dora') {
            skipWheelProj = true;
            const pop = 1 + Math.max(0, 0.6 - it.age) * 1.2;
            c.save();
            c.rotate(Math.PI / 2);
            c.translate(embedDepth * sc - sink + 10, 0);
            c.scale(pop, pop);
            c.globalCompositeOperation = 'lighter';
            glowAtW(6, 0, 30, '#9fdcff', 0.35);
            c.globalCompositeOperation = 'source-over';
            c.lineCap = 'round';
            for (let k = 0; k < 3; k++) {
              const ph = this.time * 6 + k * 2.1 + wSeed;
              const ry = 16 - k * 3, rxx = 5 + Math.abs(Math.sin(ph)) * 3;
              c.strokeStyle = `rgba(255,255,255,${0.85 - k * 0.22})`;
              c.lineWidth = 2.5 - k * 0.6;
              c.beginPath(); c.ellipse(4 + k * 6, 0, rxx, ry, 0, 0, TAU); c.stroke();
            }
            for (let i = 0; i < 4; i++) {
              const a = this.time * 5 + (i / 4) * TAU + wSeed;
              const px = 8 + Math.cos(a) * 6, py = Math.sin(a) * 17;
              c.strokeStyle = 'rgba(200,235,255,0.8)'; c.lineWidth = 1.6;
              c.beginPath(); c.arc(px, py, 4, a, a + 3.6); c.stroke();
            }
            const sa = Math.max(0, 1 - it.age / 0.5);
            if (sa > 0) {
              c.fillStyle = rgbaW('#fff4a0', sa);
              c.beginPath();
              for (let i = 0; i < 16; i++) { const an = (i / 16) * TAU; const r = i % 2 ? 6 : 16 * (1 + it.age * 2); i ? c.lineTo(-4 + Math.cos(an) * r, Math.sin(an) * r) : c.moveTo(-4 + r, 0); }
              c.closePath(); c.fill();
            }
            c.restore();
          } else if (it.w === 'pred') {
            skipWheelProj = true;
            const hot = clamp01w(1 - it.age / 6);
            const pop = 1 + Math.max(0, 0.4 - it.age) * 1.5;
            c.save();
            c.scale(pop, pop);
            c.beginPath(); c.moveTo(-6, -9); c.lineTo(14, -6); c.lineTo(26, -1); c.lineTo(28, 1); c.lineTo(16, 6); c.lineTo(-6, 9); c.closePath();
            const sg = c.createLinearGradient(-6, 0, 28, 0);
            sg.addColorStop(0, hot > 0.3 ? '#3a1a08' : '#1a110a'); sg.addColorStop(1, '#0a0806');
            c.fillStyle = sg; c.fill();
            c.globalCompositeOperation = 'lighter';
            c.strokeStyle = rgbaW('#ff7a20', 0.5 + hot * 0.5); c.lineWidth = 1.4; c.lineCap = 'round';
            c.beginPath(); c.moveTo(-4, 0); c.lineTo(6, -2); c.lineTo(14, 1); c.lineTo(22, 0); c.stroke();
            c.strokeStyle = rgbaW('#ffe0a0', hot); c.lineWidth = 0.7; c.stroke();
            glowAtW(2, 0, 14 + hot * 16, '#ff7a20', 0.3 + hot * 0.6);
            const pulse = 0.6 + 0.4 * Math.sin(this.time * 14 + wSeed);
            glowAtW(0, 0, 22, '#6fd3ff', (0.2 + hot * 0.5) * pulse);
            glowAtW(0, 0, 8, '#ffffff', hot * pulse);
            if (Math.random() < 0.4 + hot * 0.5) {
              c.beginPath(); let ax = 0, ay = 0; c.moveTo(ax, ay);
              const a = rand(0, TAU);
              for (let k = 0; k < 4; k++) { ax += Math.cos(a) * 5 + rand(-4, 4); ay += Math.sin(a) * 5 + rand(-4, 4); c.lineTo(ax, ay); }
              c.strokeStyle = rgbaW('#6fd3ff', 0.8); c.lineWidth = 2; c.stroke();
              c.strokeStyle = '#ffffff'; c.lineWidth = 0.8; c.stroke();
            }
            c.globalCompositeOperation = 'source-over';
            c.restore();
          }
          if (!skipWheelProj) this.drawProj(c, it.type === 'old' ? 'old' : it.w || 'pistol', len, it.age,
            snowball || firework || yoyo || keris || diamond || bazooka || gauntlet || magnet || it.w === 'honey' || it.w === 'banana'
              || it.w === 'bee' || it.w === 'moonbeam' || it.w === 'plasma' || it.w === 'blackhole'
              || it.w === 'nail');
          gunState.bigShot = 0;
          gunState.rocketFlash = 0;
          gunState.yoyoFlash = 0;
          gunState.diamondFlash = 0;
          gunState.diamondSeed = 0;
          gunState.bazookaFlash = 0;
          c.restore();
        } else if (it.type === 'spike') {
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const k = this.spikeOffT > 0 ? Math.min(1, this.spikeOffT / 0.25) * (this.spikeOffT > 0.3 ? 1 : this.spikeOffT / 0.3) : 0;
          // Di boss, duri menempel pas pada permukaan kontur kepala organik boss!
          const itemR = it.px !== undefined && it.py !== undefined
            ? Math.hypot(it.px, it.py)
            : this.bossRadiusAt(it.angle, R);
          c.translate(0, itemR - 6 - (SPIKE_LEN + 4) * SPIKE_SCALE * Math.min(1, k * 1.5));
          this.drawSpike(c);
          c.restore();
        }
      }
      // Slide 3 draws its ordinary stuck rounds before its wheel face, so the
      // part buried in the wood is hidden.
      if (s7w) s7w.drawStuck(c, R, false);
      const facePad = this.facePadNow(R);
      if (this.rock) {
        this.rock.draw(c, R, this.time);
        const sc = R / 196;
        for (const shot of this.rockBullets) this.drawEmbeddedShot(c, shot, shot.x * sc, shot.y * sc, 7);
        if (this.bonusCoins?.length) this.drawBonusRing(c, R);
      } else if (this.chest) {
        c.save();
        // 10% smaller like every other board-side package: the sprites are baked
        // at one size, so the painting is scaled about the board centre and the
        // hit box above shrinks with it.
        c.translate(0, CHEST_LIFT);
        c.scale(BOARD_PACKAGE_SCALE, BOARD_PACKAGE_SCALE);
        this.chest.draw(c, this.time, cc => {
          for (const shot of this.chestBullets) this.drawEmbeddedShot(cc, shot, shot.x, shot.y,
            (getWeapon(shot.w).stick + EMBED) * 0.5);
        });
        c.restore();
      } else {
        // Game B's rage aura burns behind the head, never over it.
        this.drawBossAura(c);
        c.drawImage(this.face, -R - facePad, -R - facePad, (R + facePad) * 2, (R + facePad) * 2);
      }
      // Slide 3's decals and its wheel-space FX (clipped to the wheel), then the
      // rim flash its `wheelImpact()` leaves — slide 3's own wheel order.
      let s7Frame: DOMMatrix | null = null;
      if (s7w) {
        s7w.drawFace(c, R);
        s7w.drawRim(c, R);
        s7Frame = typeof c.getTransform === 'function' ? c.getTransform() : null;
      }
      // Slide 2's artist draws every round it leaves in the target — shark jaws
      // clamped on the board, a stone buried in the bamboo, a shell rammed into
      // armour. Drawn after the wheel face so the round sits on top of it.
      if (this.setTwoLook) {
        const pins: SetTwoPin[] = [];
        for (const it of this.items) {
          if (it.type !== 'bullet' || !it.setTwo) continue;
          pins.push({
            a: it.angle,
            // A boss has no rim: the pin sits at the pixel its round bit.
            r: it.px !== undefined && it.py !== undefined ? Math.hypot(it.px, it.py) : undefined,
            hue: it.hue ?? 28,
            seed: (it.angle * 3.7) % 10,
            flash: Math.max(0, 1 - it.age * 5),
            bite: Math.max(0, 1 - it.age * 1.6),
          });
        }
        if (pins.length > 0) drawSetTwoPins(c, this.weapon.id, this.time, R, pins);
      }
      // If transform capture is unavailable, still paint the orb over the
      // face here. Modern canvases paint it after the slide-11 scorch below.
      if (hasBusterWheelPellets && !busterWheelTransform) this.drawBusterWheelPellets(c, R);
      // Slide #8 Keris & Slide #3 Bazooka rim crater on top of target face
      for (const it of this.items) {
        // Slide 3 / 5 / 4 paint their own rounds: no slide-1 crater under them.
        if (it.hideArt) continue;
        if (it.type === 'bullet' && it.w === 'xeno' && it.acid?.hybrid) {
          // Under the stuck fluid but *above* the wheel face, so the growing
          // effect-3 crater is not painted over by the target bitmap.
          c.save();
          if (!this.level.boss) { c.beginPath(); c.arc(0, 0, R, 0, TAU); c.clip(); }
          c.rotate(it.angle - Math.PI / 2);
          const itemR = it.px !== undefined && it.py !== undefined
            ? Math.hypot(it.px, it.py)
            : this.bossRadiusAt(it.angle, R);
          c.translate(0, itemR - 11);
          if (it.scale) c.scale(it.scale, it.scale);
          drawXenoCorrosion(c, 0, 0, this.time, it.acid.seed, it.age);
          c.restore();
        } else if (it.type === 'bullet' && it.w === 'keris') {
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const sink = Math.max(0, 1 - it.age * 12) * 6;
          const itemR = it.px !== undefined && it.py !== undefined
            ? Math.hypot(it.px, it.py)
            : this.bossRadiusAt(it.angle, R);
          c.translate(0, itemR + sink);
          if (it.scale) c.scale(it.scale, it.scale);
          drawKerisStuckCrater(c, 0, this.time);
          c.restore();
        } else if (it.type === 'bullet' && it.w === 'bazooka') {
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const sink = Math.max(0, 1 - it.age * 12) * 6;
          const itemR = it.px !== undefined && it.py !== undefined
            ? Math.hypot(it.px, it.py)
            : this.bossRadiusAt(it.angle, R);
          c.translate(0, itemR - 3 + sink);
          if (it.scale) c.scale(it.scale, it.scale);
          drawSlide3BazookaStuckCrater(c, this.time, it.angle * 3.7, Math.max(0.38, 1 - it.age * 0.8));
          c.restore();
        }
      }
      if (this.kerisState && this.kerisState.crawlArcs.length > 0) {
        drawKerisSurfaceArcs(c, this.kerisState, R, 0, this.time);
      }
      if (this.wheelFlash > 0 && this.level.mode !== 'treasure') {
        // Slide-7 impact tint: only the target lights up (game-3 wheelFlash).
        c.save();
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = this.wheelFlash * 0.2;
        // The head lights up, not a circle around it.
        this.paintTargetSurface(c, `rgb(${this.wheelFlashRgb})`);
        c.restore();
      }
      if (this.hitFlash > 0 && !isSpecial(this.level.mode)) {
        c.save();
        // Brief surface flash: the board — or, on a boss, the head itself —
        // lights up on impact. Never a disc behind the head.
        this.paintTargetSurface(c, `rgba(255,255,255,${this.hitFlash * 0.28})`);
        c.restore();
      }
      if (this.slowT > 0) {
        const fa = Math.min(1, this.slowT / 0.3);
        // On a boss every slow effect clings to the head: the film is clipped to
        // the blue outline, so no ring ever forms around it.
        c.save();
        this.clipBossSurface(c);
        if (this.slowKind === 'water') {
          drawWetSurface(c, R, this.time, fa);
        } else {
          c.beginPath();
          c.arc(0, 0, R, 0, TAU);
          c.fillStyle = `rgba(${this.slowRgb},${(this.slowKind === 'honey' ? 0.10 : 0.28) * fa})`;
          c.fill();
          c.strokeStyle = `rgba(${this.slowRgb},${(this.slowKind === 'honey' ? 0.48 : 0.9) * fa})`;
          c.lineWidth = 4;
          c.stroke();
          c.strokeStyle = `rgba(255,255,255,${0.5 * fa})`;
          c.lineWidth = 1.2;
          if (this.slowKind === 'honey') {
            // The honey film clings to the turning target instead of becoming
            // the Soaker's blue wet sheen or a field of icy glass cracks.
            c.strokeStyle = `rgba(255,232,143,${0.5 * fa})`;
            c.lineWidth = 2.4; c.lineCap = 'round';
            c.beginPath(); c.arc(0, 0, R - 6, 0.2, 1.85); c.stroke();
          } else if (this.slowKind === 'ice') {
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * TAU;
              c.beginPath();
              c.moveTo(Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3);
              c.lineTo(Math.cos(a + 0.15) * R * 0.95, Math.sin(a + 0.15) * R * 0.95);
              c.stroke();
            }
          } else {
            c.save();
            c.rotate(-this.rot);
            c.strokeStyle = `rgba(254,240,138,${0.9 * fa})`;
            c.lineWidth = 2;
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * TAU;
              c.beginPath();
              c.moveTo(Math.cos(a) * (R - 12), Math.sin(a) * (R - 12));
              c.lineTo(Math.cos(a) * (R - 3), Math.sin(a) * (R - 3));
              c.stroke();
            }
            c.lineWidth = 4;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(0, -R * 0.6);
            c.moveTo(0, 0);
            c.lineTo(R * 0.4, 0);
            c.stroke();
            c.restore();
          }
        }
        c.restore();
      }
      if (this.burnT > 0 && !this.setElevenLive) {
        const fa = Math.min(1, this.burnT / 0.4);
        c.save();
        this.paintTargetSurface(c, `rgba(255,100,20,${0.15 * fa + 0.05 * Math.sin(this.time * 20)})`);
        c.restore();
      }
      for (const it of this.items) {
        if (it.type !== 'coin' && it.type !== 'diamond_chest') continue;
        c.save();
        c.rotate(it.angle - Math.PI / 2);
        const itemR = this.bossRadiusAt(it.angle, R);
        if (it.type === 'coin') {
          c.translate(0, itemR + 18);
          this.drawCoin(c, this.time + it.angle);
        } else {
          // Diamond menancap di permukaan papan target (garis lingkaran R)
          // Bagian kerucut masuk ke dalam (< R), bagian mahkota muncul keluar (> R)
          c.translate(0, itemR + 2);
          this.drawEmbeddedDiamond(c, this.time + it.angle, it.hits || 0);
        }
      c.restore();
      }
      c.restore();
      // Above the art and the stuck rounds: the boss' one and only hitbox.
      // In play that is the blue edge of the drawing; `?hitbox=1` swaps in the
      // full developer overlay (contour, old ring, impact markers).
      if (this.level.boss) {
        c.save();
        // Same transform chain the head is drawn with: translate, scale, the
        // boss' float/sway/breath/reaction, then the wheel angle. Anything less
        // and the outline would sit a few pixels off the art it describes.
        const fxFrame = this.wheelDrawFrame();
        c.translate(fxFrame.x, fxFrame.y);
        c.scale(fxFrame.sx, fxFrame.sy);
        const decor = this.bossDecorMatrix();
        c.transform(decor.a, decor.b, decor.c, decor.d, decor.e, decor.f);
        if (this.level.mode !== 'treasure') c.rotate(this.rot);
        // The blue contour is inspection geometry, not artwork: the player asked
        // for it to be hidden from the boss display, so the game itself no longer
        // paints it. `?hitbox=1` still swaps in the full developer overlay, and
        // the hit test is untouched — it reads the same mask bytes either way.
        if (this.hitboxFlag) this.drawHitboxDebug(c);
        c.restore();
      }
      if (s7w) {
        // Slide 3's lens bends what is already on screen (the gravity orb,
        // the black hole), then its `front` stuck rounds go on top.
        s7w.applyLens(c, this.canvas);
        if (s7Frame && s7w.stuck.some((it) => it.front)) {
          c.save();
          c.setTransform(s7Frame);
          s7w.drawStuck(c, R, true);
          c.restore();
        }
      }
    }

    // Game B's boss reactions sit on top of the target and never rotate with
    // it: the HA · HA · HA! bursts, the rage aura, steam and the MARAH! pill.
    this.drawBossMood(c);

    // The stage's shatter wedges are baked as soon as the artwork is on screen —
    // during the intro, never on the frame the wheel breaks.
    if (!this.wedgePrep && this.face && this.state !== 'clear' && this.state !== 'idle') this.prepareWedges();

    // fragments: each chunk keeps the wheel artwork on top and underneath,
    // with dark, highlighted sidewalls that make its thickness obvious in flight.
    for (const f of this.frags) {
      c.save();
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      const fragPad = this.level.boss ? 40 : 4;
      const palette = STYLE_COLORS[this.level.style];
      drawExtrudedWheelFragment(
        c,
        this.face,
        R,
        fragPad,
        f.a0,
        f.a1,
        f.depth ?? 14,
        f.side ?? palette.chips[1],
        f.edge ?? palette.chips[0],
        f.pitch,
        -Math.PI * 0.75 - f.rot,
        f.sprite ?? null,
      );
      c.restore();
    }
    // Real, textured chunks keep their embedded rounds as they tumble away.
    // Drop rim is pre-baked into `cell.fallenSprite`, avoiding expensive runtime shadowBlur.
    for (const f of this.fallenCells) {
      c.save();
      c.globalAlpha = Math.min(1, f.life * 3);
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      this.rock?.drawFallenCell(c, f.id, R);
      const sc = R / 196;
      for (const shot of f.bullets) {
        this.drawEmbeddedShot(c, shot, (shot.x - f.cx) * sc, (shot.y - f.cy) * sc, 7);
      }
      c.restore();
    }
    // ═══ FRAGMEN BATU (boulder shatter) ═══
    for (const f of this.rockFragments) {
      const a = Math.max(0, Math.min(1, f.life / 0.6));
      c.save();
      c.globalAlpha = a;
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      drawRockFragment(c, f.size, f.seed);
      c.restore();
    }

    // The star travels across the gap with a short glowing trail, not a gun-aim arrow.
    if (this.star) {
      const st = this.star;
      const blink = st.life < 0.8 ? (Math.floor(this.time * 8) % 2 ? 0.35 : 1) : 1;
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= 3; i++) {
        c.globalAlpha = blink * (0.52 - i * 0.11);
        c.fillStyle = '#ffd54a';
        c.beginPath();
        c.ellipse(st.x - Math.sign(st.vx) * (st.r + i * 12), st.y + Math.sin(st.age * 4 - i) * 5, 6 - i, 4 - i * 0.5, 0, 0, TAU);
        c.fill();
      }
      c.restore();
      c.save();
      c.globalAlpha = blink;
      drawStar(c, st.x, st.y, st.r, this.time, '250,204,21');
      c.restore();
    }

    for (const f of this.flyers) {
      c.save();
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      if (f.kind === 'spike') this.drawSpike(c);
      else if (f.kind === 'coin') this.drawCoin(c, this.time);
      else if (f.kind === 'diamond_chest') this.drawEmbeddedDiamond(c, this.time, 1);
      else if (f.busterPellet) {
        if (f.scale) c.scale(f.scale, f.scale);
        drawBusterPelletOrb(c, 0, 0, this.time + f.rot);
      } else {
        if (f.w === 'firework') {
          gunState.rocketHue = f.hue ?? 340;
          gunState.rocketFlash = 0;
        }
        if (f.w === 'yoyo') {
          gunState.yoyoHue = f.hue ?? 0;
          gunState.yoyoFlash = 0;
        }
        c.translate(0, -BLEN / 2);
        this.drawProj(c, f.kind === 'old' ? 'old' : f.w || 'pistol');
      }
      c.restore();
    }

    // Slide 7 and slide 5 paint the marks on their wheel with the wheel itself,
    // under every round, beam and gun (`drawWheel()` opens their `render()`);
    // then slide 7 lays its sights and its channel beam, still under its rounds.
    this.drawLayerWheels(c);
    if (busterWheelTransform) {
      // Use the exact transformed wheel frame (including Boss bob/breath and
      // rotation) so the scorch cannot cover the glowing stuck projectile.
      c.save();
      c.setTransform(busterWheelTransform);
      this.drawBusterWheelPellets(c, R);
      c.restore();
    }
    if (this.state !== 'idle') this.drawElevenAim(c);

    // projectiles
    for (const p of this.projs) {
      if (p.spawnDelay && p.spawnDelay > 0) continue;
      const wid = this.weapon.id;
      const trailCol = this.weapon.trail;
      const ang = this.flightAngle(p);
      // Slide-7 SET 1 rounds are painted by slide 7's own renderers.
      if (p.setOne) {
        this.drawCarriedRound(c, p, () => this.s1.drawShot(c, p.setOne!, p.x, p.y));
        continue;
      }
      // …and so are the SET 1..7 rounds, drawn where slide 1's carrier is now.
      if (p.setSeven) {
        p.setSeven.x = p.x;
        p.setSeven.y = p.y;
        this.drawCarriedRound(c, p, () => {
          if (wid === 'crystal') drawCrystalEffectTwo(c, p.x, p.y, this.time);
          else p.setSeven!.draw(c);
        });
        continue;
      }
      if (p.setSevenPending) continue;
      if (p.s7Ghost) continue;
      // Slide 9's rounds are painted with its own layer, on top of its sparks.
      if (p.setNine || p.setNinePending || p.s9Ghost || p.setNineBeam !== undefined) continue;
      // …and so does slide 11.
      if (p.setEleven) {
        // Painted where its carrier is now (slide 7 paints a round after it
        // moved, not where it was at the top of the frame).
        p.setEleven.x = p.x;
        p.setEleven.y = p.y;
        this.drawCarriedRound(c, p, () => this.s11.drawShot(c, p.setEleven!), false);
        continue;
      }
      if (p.setElevenPending || p.s11Ghost) continue;
      // Slide 2's own round art (orb, shell, grenade, bolt, stone, drop, rocket).
      if (p.setTwo) {
        const s2id = this.setTwoId;
        if (s2id) this.drawCarriedRound(c, p, () => this.s2w.drawRound(c, s2id, p.setTwo!, p.x, p.y, this.time));
        continue;
      }
      if (this.weapon.rope) {
        if (wid === 'yoyo') {
          const gunX = p.originX ?? CX;
          const gunY = GUN_Y + this.recoil * 22 + 24 * GAMEPLAY_GUN_SCALE;
          drawSlide6String(
            c,
            { x: gunX - 18 * GAMEPLAY_GUN_SCALE, y: gunY + 46 * GAMEPLAY_GUN_SCALE },
            { x: p.x, y: p.y + 15 },
            7,
            4,
            this.time * 32,
            0,
            1,
            p.hue ?? gunState.yoyoHue,
          );
        } else {
          c.strokeStyle = 'rgba(254,243,199,0.9)';
          c.lineWidth = 1.2;
          c.beginPath();
          c.moveTo((p.originX ?? CX) - 14 * GAMEPLAY_GUN_SCALE, GUN_Y + 198 * GAMEPLAY_GUN_SCALE + this.recoil * 22);
          c.quadraticCurveTo((p.originX ?? CX) + 10 * GAMEPLAY_GUN_SCALE, (p.y + GUN_Y) / 2 + 30, p.x, p.y + 40);
          c.stroke();
        }
      }
      const fxp = FX[wid];
      // afterimages
      if (fxp.ghost && wid !== 'diamond' && p.hist) {
        for (let gi = 0; gi < p.hist.length; gi++) {
          const h = p.hist[gi];
          c.save();
          c.globalAlpha = ((gi + 1) / (p.hist.length + 1)) * 0.32;
          c.translate(h.x, h.y);
          c.rotate(ang);
          if (this.weapon.energy) c.globalCompositeOperation = 'lighter';
          this.drawProj(c, wid);
          c.restore();
        }
      }
      // The moving singularity pulls a helical light tether from its actual
      // muzzle (both muzzles when doubled). It still collides as a projectile.
      if (wid === 'blackhole' && this.slide2Void) {
        drawBlackHoleShot2(c, p.x, p.y, this.s2Hue, this.time);
        continue;
      }
      if (wid === 'blackhole' && getGunEffect(wid) === 'new' && this.slide2Void) {
        drawVoidTether(c, p.x, p.y, p.originX ?? CX,
          GUN_Y + this.recoil * 22, this.time);
      }
      c.save();
      c.translate(p.x, p.y);
      c.rotate(ang);
      // Water/snow have material trails, and a portal must remain a compact
      // ring; the usual white laser wedge made all three look like tadpoles.
      // The xenomorph glob is painted by the metaball layer; drawing the old
      // sprite + wedge on top of it produced the "stacked circles" look.
      if (wid !== 'xeno' && !drawMaterialTrail(c, wid, wid === 'diamond' ? 'new' : undefined)) {
        const tl = Math.min(260, 50 + this.weapon.speed * 0.045) * fxp.streak;
        const tw = Math.max(2, this.weapon.half) * 1.25
          * projectileSizeMultiplier(wid, !!p.mini, !!p.giant);
        c.globalCompositeOperation = 'lighter';
        const tg = c.createLinearGradient(0, 6, 0, 6 + tl);
        tg.addColorStop(0, `rgba(${trailCol},0.75)`);
        tg.addColorStop(0.35, `rgba(${trailCol},0.28)`);
        tg.addColorStop(1, `rgba(${trailCol},0)`);
        c.fillStyle = tg;
        c.beginPath();
        c.moveTo(-tw, 8);
        c.lineTo(tw, 8);
        c.lineTo(0.5, 8 + tl);
        c.lineTo(-0.5, 8 + tl);
        c.closePath();
        c.fill();
        const cg = c.createLinearGradient(0, 6, 0, 6 + tl * 0.55);
        cg.addColorStop(0, 'rgba(255,255,255,0.85)');
        cg.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = cg;
        c.fillRect(-0.9, 8, 1.8, tl * 0.55);
        const hr = tw * 4.5;
        const hg = c.createRadialGradient(0, 6, 0, 0, 6, hr);
        hg.addColorStop(0, `rgba(${trailCol},0.55)`);
        hg.addColorStop(1, `rgba(${trailCol},0)`);
        c.fillStyle = hg;
        c.beginPath();
        c.arc(0, 6, hr, 0, TAU);
        c.fill();
        c.globalCompositeOperation = 'source-over';
      }
      gunState.bigShot = p.big ?? 0;
      if (p.tint) gunState.tint = p.tint;
      if (wid === 'firework') {
        gunState.rocketHue = p.hue ?? 340;
        gunState.rocketFlash = p.flash ?? 0;
      }
      if (wid === 'yoyo') {
        gunState.yoyoHue = p.hue ?? 0;
        gunState.yoyoFlash = p.flash ?? 0;
      }
      if (wid === 'diamond') {
        gunState.diamondFlash = p.flash ?? 0;
        gunState.diamondSeed = (p.hue ?? 205) * 0.13;
      }
      if (wid === 'bazooka') {
        gunState.bazookaHue = p.hue ?? 45;
        gunState.bazookaFlash = p.flash ?? 0;
        gunState.bazookaSeed = (p.hue ?? 45) * 0.13;
      }
      if (p.big) c.scale(1 + p.big * 0.3, 1 + p.big * 0.3);
      const sizeMultiplier = projectileSizeMultiplier(wid, !!p.mini, !!p.giant);
      if (sizeMultiplier !== 1) c.scale(sizeMultiplier, sizeMultiplier);
      if (this.weapon.spinFly) {
        const l2 = this.weapon.stick + EMBED;
        c.translate(0, l2 / 2);
        c.rotate(this.time * 28);
        c.translate(0, -l2 / 2);
      }
      if (wid !== 'xeno') this.drawProj(c, wid);
      gunState.rocketFlash = 0;
      gunState.yoyoFlash = 0;
      gunState.diamondFlash = 0;
      gunState.diamondSeed = 0;
      gunState.bazookaFlash = 0;
      c.restore();
    }
    void this.failProjAngle;

    // portals
    for (const pt of this.portals) {
      const a = pt.life / pt.max;
      const s = Math.sin(a * Math.PI);
      c.save();
      c.translate(pt.x, pt.y);
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(0, 0, 2, 0, 0, 30 * s);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.5, `rgba(${pt.rgb},0.8)`);
      g.addColorStop(1, `rgba(${pt.rgb},0)`);
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, 0, 30 * s, 14 * s, 0, 0, TAU);
      c.fill();
      c.strokeStyle = `rgba(${pt.rgb},${a})`;
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(0, 0, 24 * s, 10 * s, 0, 0, TAU);
      c.stroke();
      c.restore();
    }

    // ---------------- Boss launch muzzle shockwaves & attack projectiles ----------------
    if (this.bossMuzzleFlashes?.length) {
      for (const mf of this.bossMuzzleFlashes) drawBossMuzzleFlash(c, mf);
    }
    for (const bp of this.bossProjs) drawBossProjectile(c, bp, this.time);

    // Boss stages: every splinter, spark, plume and shard a round throws belongs
    // to the drawing it bit into. The clip is the boss' own outline, so the
    // burst dies on the silhouette instead of hanging in the empty sky; a round
    // that is not on the outline never produced one in the first place. The
    // splinter layers below (slide 9, slide 11, firework) take the same clip
    // through `withSplinterClip`, while rounds still in flight keep flying.
    setSplinterClip(c, (fxCtx) => {
      if (!this.level.boss) return false;
      if (this.bossClipPaint(fxCtx)) return true;
      // Until the boss artwork is ready there is no valid surface. Do not
      // expose an unbounded burst for a frame (or invent a circular hitbox).
      fxCtx.beginPath();
      fxCtx.rect(0, 0, 0, 0);
      fxCtx.clip();
      return true;
    });

    // Slide 5's beams, sparks and rounds go under its gun: slide 5 paints the
    // gun last (`render()`: beams, particles, bullets, aim guide, player).
    this.drawNineLayer(c);

    if (this.state !== 'idle') {
      this.drawGunNow(c);
      this.drawTriLaser(c);
    }

    // ---- acid fluid (metaball) layer — slide 7 Acid Spitter parity ----
    // Drawn after the gun and the wheel, exactly like games/game-3, so the
    // glob covers the muzzle and the acid on the rim melts into one body.
    if (this.state !== 'idle' && this.hasAcidLayer()) {
      this.collectAcidBlobs();
      const hot = this.ownXenoGlob
        ? this.projs.filter((p) => !(p.spawnDelay && p.spawnDelay > 0)).map((p) => ({ x: p.x + Math.sin((p.t ?? 0) * 40) * 1.5, y: p.y }))
        : [];
      this.acidFluid.render(c, W, H, hot);
      if (this.ownXenoGlob && getGunEffect('xeno') === 'xeno_hybrid') {
        // Effect 2 still supplies the merged fluid; effect 3's own glassy
        // glob, bubbles and molecular tracers ride on that same carrier.
        for (const p of this.projs) {
          if (p.spawnDelay && p.spawnDelay > 0) continue;
          drawXenoHybridFlight(c, p.x, p.y, p.t ?? 0);
        }
      }
    }

    // Real gold pieces leap out of the chest, scatter, fall and bounce, then
    // sweep into the HUD. They render in front of the guns and behind the HUD.
    for (const coin of this.treasureCoins) {
      if (coin.delay > 0) continue;
      const scale = coin.state === 'collect' ? 1 - 0.45 * coin.collectT / coin.collectDuration : 1;
      // Stored on the screen, drawn in the world (see `treasureShower`).
      const at = this.screenToWorld(coin.x, coin.y);
      drawBonusCoin(c, at.x, at.y, coin.r * scale, this.time, coin.phase, true);
    }

    withSplinterClip(c, () => this.drawSplinters(c));
    // Damage / combo callouts are labels, not splatter: they stay legible even
    // at the very edge of the drawing.
    for (const p of this.particles) {
      if (p.kind === 'text') this.drawImpactText(c, p);
    }

    if (this.state !== 'idle' && (this.weapon.id === 'firework' || (this.fwState && (this.fwState.particles.length > 0 || this.fwState.rings.length > 0)))) {
      withSplinterClip(c, () => drawFirework8ParticlesAndRings(c, this.getFwState()));
    }
    // Slide-2 FX layer (black-hole voids, jets, warped starlight, smoke).
    if (this.s2State && (this.slide2Void || this.s2State.particles.length > 0 || this.s2State.voids.length > 0
      || this.s2State.glows.length > 0 || this.s2State.rings.length > 0 || this.s2State.jets.length > 0
      || this.s2State.beams.length > 0 || this.s2State.smokes.length > 0 || this.s2State.fireballs.length > 0
      || this.s2State.flashes.length > 0 || this.s2State.texts.length > 0)) {
      this.s2State.draw(c, this.time);
    }
    // Slide 2's own layer for the eight exported weapons: its rounds' bursts,
    // bubbles, bite marks, shrapnel and callouts.
    if (this.s2wState && (this.s2wState.busy || this.setTwoLive)) {
      this.withBossPaintClip(c, () => {
        this.s2wState!.draw(c, this.time);
        this.s2wState!.drawSky(c);
      });
    }
    // Slide 6 layer: scorch marks on the wheel face, then its beams and the
    // burst that follows them.
    if (this.s6State && (this.s6State.busy || this.setSixLive)) {
      this.withBossPaintClip(c, () => {
        // Its scorch marks sit at `translate(radius, 0)`: rim art, not boss art.
        if (!this.level.boss) this.s6State!.drawWheel(c, CX, this.targetY + this.bump * 7, this.level.radius, this.rot);
        this.s6State!.drawBeam(c);
        this.s6State!.draw(c);
      });
    }
    // Slide 7's bursts, sparks and smoke go over its gun, as on slide 7
    // (`render()`: wheel, sights, beam, rounds, gun, then fx and particles).
    if (this.s11State && (this.s11State.busy || this.setElevenLive)) {
      this.withBossPaintClip(c, () => this.s11State!.draw(c));
    }
    // Slide-3 layer: its particles and FX objects (its wheel was drawn with
    // the wheel itself).
    if (this.s7State && (this.s7State.busy || this.setSevenLive)) {
      this.withBossPaintClip(c, () => {
        this.s7State!.draw(c);
        this.s7State!.drawFront(c);
      });
    }
    // Slide-7 SET 1 layer: wheel-space sparks first, then its particles/FX.
    if (this.s1State && (this.s1State.busy || this.setOneLive)) {
      this.withBossPaintClip(c, () => {
        if (!this.level.boss) this.s1State!.drawWheel(c, CX, this.targetY + this.bump * 7);
        this.s1State!.draw(c);
        this.s1State!.drawFront(c);
      });
    }
    if (
      this.state !== 'idle' &&
      (this.weapon.id === 'yoyo' ||
        (this.yoyoState &&
          (this.yoyoState.particles.length > 0 ||
            this.yoyoState.rings.length > 0 ||
            this.yoyoState.strings.length > 0 ||
            this.yoyoState.flash > 0.01 ||
            this.yoyoState.wpulse > 0.01)))
    ) {
      withSplinterClip(c, () => drawYoyoSlideParticlesRingsAndStrings(c, this.getYoyoState(), CX, this.targetY, this.time));
    }
    if (
      this.state !== 'idle' &&
      (this.weapon.id === 'keris' ||
        (this.kerisState &&
          (this.kerisState.particles.length > 0 ||
            this.kerisState.thunderFlash > 0.01)))
    ) {
      withSplinterClip(c, () => drawKerisSlideParticlesAndArcs(c, this.getKerisState(), W, H));
    }
    if (
      this.state !== 'idle' &&
      (this.weapon.id === 'diamond' ||
        (this.diamondState &&
          (this.diamondState.particles.length > 0 ||
            this.diamondState.shards.length > 0 ||
            this.diamondState.rings.length > 0 ||
            this.diamondState.starflashes.length > 0 ||
            this.diamondState.flash > 0.01 ||
            this.diamondState.wpulse > 0.01)))
    ) {
      withSplinterClip(c, () => drawDiamondSlideForeground(c, this.getDiamondState(), CX, this.targetY));
    }
    if (
      this.state !== 'idle' &&
      (this.weapon.id === 'bazooka' ||
        (this.bazookaState &&
          (this.bazookaState.particles.length > 0 ||
            this.bazookaState.smokes.length > 0 ||
            this.bazookaState.fireballs.length > 0 ||
            this.bazookaState.flashes.length > 0 ||
            this.bazookaState.debris.length > 0 ||
            this.bazookaState.screenFlash > 0.01)))
    ) {
      withSplinterClip(c, () => this.getBazookaState().drawForeground(c, W, H));
    }

    // dynamic lights (bloom-like) — pre-baked radial sprite, zero per-frame gradients
    if (this.lights.length) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (const l of this.lights) {
        const a = l.life / l.max;
        drawRgbGlowSprite(c, l.x, l.y, l.r, l.r, l.rgb, a);
      }
      c.restore();
    }
    c.restore();

    // Slide 3's own screen flash (`flashScreen()`): a flat fill at its strength.
    if (this.s7State) this.s7State.drawFlash(c, W, H);

    // weapon-colored impact tint — pre-baked offscreen wash, zero per-frame gradients
    if (this.tintA > 0) {
      drawScreenTintWash(c, W, H, this.tintRgb, this.tintA);
    }

    // Slide 9's flash: the whole screen, additive, at 0.6 of its strength.
    if (this.nineFlashA > 0.001) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = `rgba(${this.nineFlashRgb},${Math.min(1, this.nineFlashA * 0.6)})`;
      c.fillRect(0, 0, W, H);
      c.restore();
    }

    // vignette — pre-baked once into an offscreen bitmap (or cached gradient in headless tests)
    const density = Math.ceil(this.dpr || 1);
    if (!this.vignetteBackdrop || this.vignetteBackdropDpr !== density) {
      const doc = (globalThis as { document?: Document }).document;
      if (doc && typeof doc.createElement === 'function') {
        const vc = doc.createElement('canvas');
        vc.width = W * density;
        vc.height = H * density;
        const vctx = vc.getContext('2d');
        if (vctx) {
          vctx.setTransform(density, 0, 0, density, 0, 0);
          const vg = vctx.createRadialGradient(CX, H / 2, H * 0.3, CX, H / 2, H * 0.75);
          vg.addColorStop(0, 'rgba(0,0,0,0)');
          vg.addColorStop(1, 'rgba(0,0,0,0.55)');
          vctx.fillStyle = vg;
          vctx.fillRect(0, 0, W, H);
          this.vignetteBackdrop = vc;
          this.vignetteBackdropDpr = density;
        }
      }
    }
    if (this.vignetteBackdrop) {
      c.drawImage(this.vignetteBackdrop, 0, 0, W, H);
    } else {
      if (!this.vignetteGrad) {
        const vg = c.createRadialGradient(CX, H / 2, H * 0.3, CX, H / 2, H * 0.75);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, 'rgba(0,0,0,0.55)');
        this.vignetteGrad = vg;
      }
      c.fillStyle = this.vignetteGrad;
      c.fillRect(0, 0, W, H);
    }

    // sniper scope overlay
    if (this.aiming) {
      const k2 = Math.min(1, this.aimT / 0.15);
      const rr2 = 520 - (520 - (R + 80)) * k2;
      c.save();
      c.beginPath();
      c.rect(0, 0, W, H);
      c.arc(CX, this.targetY + R * 0.5, rr2, 0, TAU, true);
      c.fillStyle = `rgba(0,0,0,${0.75 * k2})`;
      c.fill('evenodd');
      c.strokeStyle = `rgba(0,0,0,${0.9 * k2})`;
      c.lineWidth = 6;
      c.beginPath();
      c.arc(CX, this.targetY + R * 0.5, rr2, 0, TAU);
      c.stroke();
      c.strokeStyle = `rgba(255,40,40,${0.85 * k2})`;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(CX, this.targetY + R * 0.5 - rr2);
      c.lineTo(CX, this.targetY + R * 0.5 + rr2);
      c.moveTo(CX - rr2, this.targetY + R * 0.5);
      c.lineTo(CX + rr2, this.targetY + R * 0.5);
      c.stroke();
      c.beginPath();
      c.arc(CX, this.targetY + R, 6, 0, TAU);
      c.stroke();
      for (let i = 1; i < 5; i++) {
        c.beginPath();
        c.moveTo(CX - 5, this.targetY + R * 0.5 + i * 22);
        c.lineTo(CX + 5, this.targetY + R * 0.5 + i * 22);
        c.stroke();
      }
      c.fillStyle = `rgba(255,80,80,${k2})`;
      c.font = "13px 'Russo One', sans-serif";
      c.textAlign = 'center';
      c.fillText(T('LEPAS UNTUK MENEMBAK'), CX, this.targetY + R + rr2 * 0.55);
      c.restore();
    }
    // glitch screen
    if (this.glitchT > 0) {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = pick(['rgba(255,0,85,0.35)', 'rgba(0,255,238,0.35)', 'rgba(34,255,136,0.3)']);
        c.fillRect(0, rand(0, H), W, rand(2, 14));
      }
    }

    // The effect pass is over: no layer below (HUD, banners, overlays) may
    // inherit the boss' splinter clip.
    setSplinterClip(c, null);

    // From here on the drawing is *screen* furniture, not world: drop back to
    // plain display coordinates so the HUD's text stays upright and its corners
    // sit on the real screen edges in both orientations.
    const { w: dw, h: dh } = displaySize(this.orientation);
    c.setTransform(k, 0, 0, k, 0, 0);
    if (this.state !== 'idle' && !this.hudHidden) this.drawHUD(c);

    if (this.flashWhite > 0) {
      c.fillStyle = `rgba(255,255,255,${this.flashWhite * 0.6})`;
      c.fillRect(0, 0, dw, dh);
    }
    if (this.flashRed > 0) {
      c.fillStyle = `rgba(255,0,0,${this.flashRed * 0.3})`;
      c.fillRect(0, 0, dw, dh);
      const rg = c.createRadialGradient(dw / 2, dh / 2, dh * 0.2, dw / 2, dh / 2, dh * 0.7);
      rg.addColorStop(0, 'rgba(255,0,0,0)');
      rg.addColorStop(1, `rgba(255,0,0,${this.flashRed * 0.5})`);
      c.fillStyle = rg;
      c.fillRect(0, 0, dw, dh);
    }
  }

  private drawHUD(c: CanvasRenderingContext2D) {
    const font = (s: number) => `${s}px 'Russo One', sans-serif`;
    // The HUD is screen furniture, so it is laid out against the *display*
    // rectangle. In landscape that is 760x420 instead of the portrait world's
    // 420x760, which moves the score/coin corners and re-centres the stage,
    // timer and boss rows without the engine knowing the screen rotated.
    const { w: DW, h: DH } = displaySize(this.orientation);
    const DCX = DW / 2;
    c.textBaseline = 'middle';
    // score
    c.textAlign = 'left';
    c.font = font(isSpecial(this.level.mode) ? 29 : 40);
    c.lineWidth = 5;
    c.strokeStyle = 'rgba(0,0,0,0.6)';
    c.strokeText(String(this.score), 22, isSpecial(this.level.mode) ? 34 : 46);
    c.fillStyle = '#ffffff';
    c.fillText(String(this.score), 22, isSpecial(this.level.mode) ? 34 : 46);

    // combo badge di HUD kiri atas (di bawah skor angka, tidak menutupi target!)
    const cWindow = this.weapon.comboWindow ?? 0.5;
    const timeSinceHit = this.time - this.lastHit;
    if (this.combo >= 2 && timeSinceHit < cWindow) {
      const leftFrac = Math.max(0, 1 - (timeSinceHit / cWindow));
      const popScale = 1 + this.comboPop * 0.28;
      c.save();
      c.translate(22, 74);
      c.scale(popScale, popScale);
      c.textAlign = 'left';
      c.font = font(13);
      c.lineWidth = 3;
      c.strokeStyle = 'rgba(0,0,0,0.85)';
      const comboText = `⚡ COMBO x${this.combo}`;
      c.strokeText(comboText, 0, 0);
      c.fillStyle = this.combo >= 5 ? '#f43f5e' : this.combo >= 3 ? '#ffd23f' : '#38bdf8';
      c.fillText(comboText, 0, 0);

      // Bar timer combo halus yang menyusut
      c.fillStyle = 'rgba(255,255,255,0.18)';
      c.fillRect(0, 9, 82, 3);
      c.fillStyle = this.combo >= 5 ? '#f43f5e' : this.combo >= 3 ? '#ffd23f' : '#38bdf8';
      c.fillRect(0, 9, 82 * leftFrac, 3);
      c.restore();
    }

    // Coins: the wallet in the right corner reads at exactly the same size as
    // the score in the left corner (one HUD row, not two), and the coin itself
    // is drawn with the run clock so it keeps flipping instead of sitting on
    // its first frame like a frozen icon.
    const scoreSize = isSpecial(this.level.mode) ? 29 : 40;
    const coinSize = scoreSize;
    const coinY = isSpecial(this.level.mode) ? 34 : 46;
    const coinR = isSpecial(this.level.mode) ? 13 : 17.5;
    const coinCx = DW - coinR - 8;
    const coinCountX = coinCx - coinR - 8;
    c.textAlign = 'right';
    c.font = font(coinSize);
    // A long wallet must not run into the centred stage label (special stages)
    // or the boss bar: shrink the counter only as far as it has to.
    const coinText = String(this.coins);
    // Special stages put their timer pill on this row (ends at DCX + 118);
    // boss stages put the health bar there (ends at DCX + 103).
    const coinRowLeft = isSpecial(this.level.mode) ? 336 : this.level.boss ? 316 : 0;
    const coinRoom = coinRowLeft ? coinCountX - coinRowLeft : coinCountX;
    if (coinRoom > 24 && typeof c.measureText === 'function') {
      const wide = c.measureText(coinText).width;
      if (wide > coinRoom) c.font = font(Math.max(16, Math.floor((coinSize * coinRoom) / wide)));
    }
    c.strokeText(coinText, coinCountX, coinY);
    c.save();
    if (this.coinPulse > 0.04) {
      c.fillStyle = `rgba(251,191,36,${Math.min(0.45, this.coinPulse * 0.4)})`;
      c.beginPath();
      c.arc(coinCx, coinY, (coinR + 6) * this.coinPulse, 0, TAU);
      c.fill();
    }
    c.fillStyle = '#ffd23f';
    c.fillText(coinText, coinCountX, coinY);
    c.restore();
    c.save();
    c.translate(coinCx, coinY);
    const coinScale = (coinR / CLASSIC_COIN_RADIUS) * (1 + this.coinPulse * 0.16);
    c.scale(coinScale, coinScale);
    this.drawCoin(c, this.time, false); // no oversized halo clipped by the HUD edge
    c.restore();

    // Stage identity and countdown are above the target, never over the diamond.
    const n = this.level.n;
    c.textAlign = 'center';
    const modeLabel = this.level.mode === 'boulder' ? `💎 DIAMOND BREAKER • LV ${n}`
      : this.level.mode === 'bonus' ? `${T('🪙 BONUS STAGE')} • LV ${n}`
      : this.level.mode === 'treasure' ? `${T('🧰 HARTA KARUN')} • LV ${n}`
      : this.level.mode === 'double' ? `🔫🔫 DOUBLE GUN • LEVEL ${n}`
      : this.level.boss ? `${T('BOSS')} • ${this.level.name}` : `${T('LEVEL')} ${n}`;
    c.font = font(isSpecial(this.level.mode) ? 13 : 16);
    c.fillStyle = this.level.mode === 'treasure' || this.level.mode === 'bonus' ? '#fde68a'
      : this.level.mode === 'boulder' ? '#a5f3fc' : this.level.boss ? '#ff5050' : '#ffffff';
    c.fillText(modeLabel, DCX, isSpecial(this.level.mode) ? 20 : 24);

    if (isSpecial(this.level.mode)) {
      c.save();
      c.fillStyle = 'rgba(5,12,24,0.72)';
      c.strokeStyle = this.level.mode === 'boulder' ? 'rgba(103,232,249,0.7)' : 'rgba(252,211,77,0.7)';
      c.lineWidth = 1.4;
      c.beginPath(); c.roundRect(DCX - 118, 30, 236, 24, 11); c.fill(); c.stroke();
      c.font = font(12);
      const timeStr = `⏱ ${this.stageTime.toFixed(1)}s`;
      if (this.level.mode === 'boulder') {
        const ratio = 1 - this.level.hp / Math.max(1, this.level.maxHp);
        c.fillStyle = this.stageTime < 8 ? '#fb7185' : '#ffffff';
        c.textAlign = 'left';
        c.fillText(timeStr, DCX - 108, 42);
        c.textAlign = 'right';
        c.fillStyle = '#a5f3fc';
        c.fillText(`${T('BATU')} ${Math.round(ratio * 100)}%`, DCX + 108, 42);
        const barX = DCX - 26, barY = 39, barW = 64;
        c.fillStyle = '#164e63'; c.fillRect(barX, barY, barW, 6);
        c.fillStyle = '#67e8f9'; c.fillRect(barX, barY, barW * ratio, 6);
      } else if (this.level.mode === 'bonus') {
        let taken = 0;
        for (let ci = 0; ci < this.bonusCoins.length; ci++) {
          if (this.bonusCoins[ci].taken) taken++;
        }
        c.fillStyle = this.stageTime < 8 ? '#fb7185' : '#fde68a';
        c.fillText(`${timeStr}  •  KOIN ${taken}/${this.bonusCoins.length}`, DCX, 42);
      } else {
        const status = this.treasureBuff === 'double' ? T('2 SENJATA')
          : this.treasureBuff ? `${T('BONUS')} ${this.treasureBuff.toUpperCase()}` : T('BERONDONG PETI!');
        c.fillStyle = this.stageTime < 8 ? '#fb7185' : '#fde68a';
        c.fillText(`${timeStr}  •  ${status}`, DCX, 42);
      }
      c.restore();
    }

    // TEKKEN-STYLE SATISFYING BOSS HEALTHBAR
    if (this.level.boss) {
      const barW = 200;
      const barH = 12;
      const barX = DCX - barW / 2;
      const barY = 46;

      const hpFrac = Math.max(0, Math.min(1, this.bossHp / this.bossMaxHp));
      const hpRedFrac = Math.max(0, Math.min(1, this.bossHpRed / this.bossMaxHp));

      c.save();
      // Outer bevel metallic frame
      c.fillStyle = '#0a0d14';
      c.beginPath();
      c.roundRect(barX - 3, barY - 3, barW + 6, barH + 6, 6);
      c.fill();
      c.strokeStyle = '#eab308';
      c.lineWidth = 1.8;
      c.stroke();

      // Background empty bar
      c.fillStyle = '#261214';
      c.fillRect(barX, barY, barW, barH);

      // Delayed Red damage bar (Tekken ghost health drain)
      c.fillStyle = '#ef4444';
      c.fillRect(barX, barY, barW * hpRedFrac, barH);

      // Foreground yellow/green health gradient
      const hg = c.createLinearGradient(barX, barY, barX + barW, barY);
      hg.addColorStop(0, '#facc15');
      hg.addColorStop(0.5, '#4ade80');
      hg.addColorStop(1, '#22c55e');
      c.fillStyle = hg;
      c.fillRect(barX, barY, barW * hpFrac, barH);

      // Glass specular shine
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.fillRect(barX, barY, barW * hpFrac, barH * 0.45);

      // HP text
      c.font = 'bold 9px sans-serif';
      c.fillStyle = '#ffffff';
      c.textAlign = 'center';
      c.fillText(`${Math.round(this.bossHp)} / ${this.bossMaxHp} HP`, DCX, barY + barH * 0.7);
      c.restore();
    } else if (!isSpecial(this.level.mode)) {
      const idx = (n - 1) % 5;
      for (let i = 0; i < 5; i++) {
        const x = DCX - 52 + i * 26;
        const y = 47;
        const isBoss = i === 4;
        if (i === idx) {
          c.fillStyle = isBoss ? 'rgba(255,59,59,0.28)' : 'rgba(255,255,255,0.26)';
          c.beginPath();
          c.arc(x, y, 11.5, 0, TAU);
          c.fill();
        }
        if (isBoss) {
          const outerR = i === idx ? 9.6 : 8.4;
          traceHudStarPath(c, x, y, outerR, outerR * 0.44, 5);
        } else {
          c.beginPath();
          c.arc(x, y, i === idx ? 7 : 5.5, 0, TAU);
        }
        if (i < idx) c.fillStyle = '#ffd23f';
        else if (i === idx) c.fillStyle = isBoss ? '#ff3b3b' : '#ffffff';
        else c.fillStyle = isBoss ? 'rgba(255,60,60,0.42)' : 'rgba(255,255,255,0.22)';
        c.fill();
      }
    }

    // Timed stages refill automatically; the regular ammo buff adds one finite magazine.
    const total = this.level.ammo * this.maxAmmoMult;
    const spacing = Math.min(26, (DH * 0.48) / total);
    for (let i = 0; i < total; i++) {
      const x = 30;
      const y = DH - 40 - i * spacing;
      c.save();
      if (this.weapon.id === 'yoyo') {
        const used = i >= this.ammoLeft;
        const k = total - 1 - i;
        c.globalAlpha = used ? 0.18 : 1;
        c.translate(x, y - 6);
        drawSlide6Yoyo(c, 0, 0, 8, this.time * 4 + k * 1.6, 0, used ? 200 : yoyoAmmoHue(k));
      } else if (this.weapon.id === 'keris') {
        const used = i >= this.ammoLeft;
        const bob = used ? 0 : Math.sin(this.time * 2.4 + i * 0.5) * 1.4;
        c.translate(x, y - 6 + bob);
        c.scale(0.68, 0.68);
        drawKerisSlideMini(c, this.time + i * 0.3, used);
      } else if (this.weapon.id === 'diamond') {
        const used = i >= this.ammoLeft;
        const k = total - 1 - i;
        c.globalAlpha = used ? 0.18 : 1;
        c.translate(x, y - 6);
        drawSlide2DiamondBullet(c, 7.5, this.time, k * 1.5, 0);
      } else if (this.weapon.id === 'bazooka') {
        const used = i >= this.ammoLeft;
        const k = total - 1 - i;
        c.globalAlpha = used ? 0.18 : 1;
        c.translate(x, y - 16);
        c.scale(0.45, 0.45);
        drawSlide3BazookaShell(c, BAZOOKA_HUES[k % BAZOOKA_HUES.length], this.time, k * 1.5, 0, 0);
      } else {
        c.translate(x, y - 14);
        c.scale(0.5, 0.5);
        if (i < this.ammoLeft) {
          this.drawProj(c, this.weapon.id);
        } else {
          c.globalAlpha = 0.25;
          c.fillStyle = '#000';
          c.fillRect(-6, 0, 12, BLEN);
        }
      }
      c.restore();
    }
    c.textAlign = 'left';
    c.font = font(14);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    c.fillText(this.reloadT > 0 ? 'ISI ULANG…' : `x${this.ammoLeft}`, 46, DH - 30);

    // weapon label
    c.textAlign = 'right';
    c.font = font(12);
    c.fillStyle = this.weapon.energy ? this.weapon.color : 'rgba(255,255,255,0.6)';
    // A slide-3 gun carries no slide-1 perk: the label names its card instead.
    const s3Card = this.sevenPlainTrigger;
    c.fillText(`${this.weapon.name}${this.hasTwinGuns ? ' ×2' : ''} • ${s3Card ? 'SLIDE 3' : T(this.weapon.perk)}`, DW - 14, DH - 16);
    const wq = this.weapon;
    let info = '';
    if (s3Card) { /* slide 3: no perk counters, no charge meter, no spin-up */ }
    else
    if (wq.saves) info = `${wq.emoji} NYAWA: ${'●'.repeat(this.savesLeft)}${'○'.repeat(Math.max(0, wq.saves - this.savesLeft))}`;
    else if (wq.chronoEvery) info = `⏱ ${wq.chronoEvery - (this.perkCount % wq.chronoEvery)} lagi`;
    else if (wq.reverseEvery) info = `🌍 ${wq.reverseEvery - (this.perkCount % wq.reverseEvery)} lagi`;
    else if (wq.snowman) info = `⛄ ${3 - (this.perkCount % 3)} lagi`;
    else if (wq.abductEvery) info = `🛸 culik ${wq.abductEvery - (this.perkCount % wq.abductEvery)} lagi`;
    else if (wq.everyBonus) info = `🎰 lucky ${wq.everyBonus.n - (this.perkCount % wq.everyBonus.n)} lagi`;
    else if (wq.meltEvery && wq.meltEvery > 1) info = `✏️ ${T('hapus')} ${wq.meltEvery - (this.perkCount % wq.meltEvery)} ${T('lagi')}`;
    else if (wq.paint && this.lastPaint) info = T('🎨 warna terakhir ●');
    // A gun that fires on the press (a Slide 5 / Slide 7 card) has no charge to hold for.
    // Slide 7's caster locks on by itself while held (its 2.6 s lock).
    else if (this.elevenCasterTrigger) {
      info = this.holding && this.state === 'play' ? `🎯 ${T('kunci')} ${Math.round(this.s11.casterLock * 100)}%` : T('🎯 tahan = kunci & luncurkan');
    } else if (wq.charge && !this.plainTrigger) {
      const full = this.elevenBuster ? 1.2 : 1;
      info = this.charging ? `🔋 ${this.chargeT >= full ? 'FULL!' : Math.round(Math.min(1, this.chargeT / full) * 100) + '%'}` : T('🔋 tahan untuk charge');
    }
    else if (wq.phaseSpikes) info = T('👻 kebal duri');
    else if (wq.notes) info = `🎶 nada ${Math.min(10, Math.max(1, this.combo))}/10`;
    if (info) {
      c.font = font(13);
      c.fillStyle = wq.color;
      c.fillText(info, DW - 14, DH - 36);
    }
    if (wq.spinup && !s3Card) {
      c.fillStyle = 'rgba(255,255,255,0.15)';
      c.fillRect(DW - 114, DH - 46, 100, 7);
      c.fillStyle = this.spin > 0.25 ? '#22c55e' : '#f59e0b';
      c.fillRect(DW - 114, DH - 46, 100 * this.spin, 7);
      c.font = font(10);
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.fillText('SPIN', DW - 118, DH - 40);
    }

    // banner
    if (this.bannerT > 0) {
      const t = this.bannerT;
      const a = Math.min(1, t * 2.5) * Math.min(1, (1.8 - t) * 5);
      c.save();
      c.globalAlpha = a;
      // The banner is screen furniture as well. Portrait drops it just under the
      // wheel; landscape has no room there (that spot lands on the very bottom
      // edge and the text would be cut), so it uses the free strip along the
      // bottom of the display, above the weapon label and clear of the HUD.
      const bannerWorldY = isSpecial(this.level.mode) ? this.targetY + this.level.radius + 46 : CY + this.level.radius + 115;
      c.translate(DCX, this.orientation === 'landscape' ? DH - 58 : bannerWorldY);
      const s = 1 + Math.max(0, (t - 1.5)) * 1.5;
      c.scale(s, s);
      c.textAlign = 'center';
      if (this.level.boss) {
        // A full-width band would swallow the wheel and the gun in landscape.
        const bandW = this.orientation === 'landscape' ? Math.min(DW, 420) : DW;
        c.fillStyle = 'rgba(120,0,0,0.65)';
        c.fillRect(-bandW / 2, -38, bandW, 76);
        c.font = font(34);
        c.lineWidth = 6;
        c.strokeStyle = 'rgba(0,0,0,0.7)';
        c.strokeText('⚠ BOSS FIGHT ⚠', 0, -10);
        c.fillStyle = '#ff4040';
        c.fillText('⚠ BOSS FIGHT ⚠', 0, -10);
        c.font = font(16);
        c.fillStyle = '#ffd0d0';
        c.fillText(this.level.name, 0, 20);
      } else if (isSpecial(this.level.mode)) {
        const title = this.level.mode === 'boulder' ? `💎 ${T('DIAMOND BREAKER')}`
          : this.level.mode === 'bonus' ? T('🪙 BONUS STAGE') : T('🧰 HARTA KARUN');
        const hint = this.level.mode === 'boulder' ? T('Kikis batu, lalu tembak diamond 4x untuk mengambilnya!')
          : this.level.mode === 'bonus' ? T('Bidik koin yang berputar!') : T('10 detik! Berondong petinya!');
        c.font = font(27); c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.9)';
        c.strokeText(title, 0, -9);
        c.fillStyle = this.level.mode === 'boulder' ? '#a5f3fc' : '#fde68a';
        c.fillText(title, 0, -9);
        c.font = font(13); c.fillStyle = '#ffffff'; c.fillText(hint, 0, 25);
      } else {
        c.font = font(38);
        c.lineWidth = 6;
        c.strokeStyle = 'rgba(0,0,0,0.7)';
        c.strokeText(`LEVEL ${n}`, 0, 0);
        c.fillStyle = '#ffffff';
        c.fillText(`LEVEL ${n}`, 0, 0);
      }
      const plain = this.plainTrigger;
      const scope = this.weapon.scope && !plain, charge = this.weapon.charge && !plain;
      if (n <= 2 && !this.sevenPlainTrigger && (this.weapon.auto || scope || charge)) {
        c.font = font(13);
        c.fillStyle = '#ffd23f';
        const hint = charge ? T('TAP = TEMBAK, TAHAN = CHARGE x4!') : scope ? T('TAHAN = BIDIK SLOW-MO, LEPAS = TEMBAK') : this.weapon.spinup ? T('TAHAN LAYAR UNTUK MEMUTAR LARAS!') : T('TAHAN LAYAR / SPASI = AUTO-FIRE');
        c.fillText(hint, 0, 40);
      }
      c.restore();
    }

    // Slide #2 exact "STAGE CLEAR!" + "BONUS +3" banner (`games/firework/src/game/engine.ts` lines 3469–3515)
    if (this.state === 'clear' && !isSpecial(this.level.mode)) {
      const t = this.stateT;
      const sc =
        t < 0.35
          ? 0.4 + 0.6 * Math.pow(t / 0.35, 0.6) * (1 + 0.25 * Math.sin((t / 0.35) * Math.PI))
          : 1;
      const a = t > 1.35 ? Math.max(0, 1 - (t - 1.35) / 0.4) : 1;
      const clearFont = "Bungee, Impact, 'Arial Black', sans-serif";
      const w = this.weapon.id;
      c.save();
      c.globalAlpha = a;
      c.translate(DCX, 330);
      c.scale(sc, sc);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.font = `700 46px ${clearFont}`;
      const g = c.createLinearGradient(-140, -20, 140, 20);
      if (w === 'keris') {
        g.addColorStop(0, '#ffe9a8');
        g.addColorStop(0.5, '#ffd75e');
        g.addColorStop(1, '#ff8a3d');
        c.shadowColor = 'rgba(255,190,80,0.95)';
      } else if (w === 'blackhole') {
        g.addColorStop(0, '#b46bff');
        g.addColorStop(0.5, '#7ad7ff');
        g.addColorStop(1, '#f0e6ff');
        c.shadowColor = 'rgba(140,80,255,0.95)';
      } else if (w === 'yoyo') {
        g.addColorStop(0, '#ff5f8f');
        g.addColorStop(0.5, '#ffd75e');
        g.addColorStop(1, '#5fe7ff');
        c.shadowColor = 'rgba(255,150,120,0.95)';
      } else if (w === 'diamond') {
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.5, '#bfe6ff');
        g.addColorStop(1, '#7ab8ff');
        c.shadowColor = 'rgba(200,235,255,0.95)';
      } else if (w === 'bazooka') {
        g.addColorStop(0, '#ffe27a');
        g.addColorStop(0.5, '#ff9d2e');
        g.addColorStop(1, '#ff5a2e');
        c.shadowColor = 'rgba(255,140,40,0.95)';
      } else {
        g.addColorStop(0, '#ffb0e6');
        g.addColorStop(0.5, '#8adcff');
        g.addColorStop(1, '#c77dff');
        c.shadowColor = 'rgba(220,150,255,0.95)';
      }
      c.shadowBlur = 24;
      c.fillStyle = g;
      c.fillText('STAGE CLEAR!', 0, 0);
      c.shadowBlur = 0;
      c.font = `700 18px ${clearFont}`;
      c.fillStyle = '#fff';
      c.fillText(T('BONUS +3'), 0, 40);
      c.restore();
    }
  }
}
