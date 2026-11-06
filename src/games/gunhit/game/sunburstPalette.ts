import type { Style } from './faces';
import type { Rarity } from './weapons';

// Knife Boss's SunburstFX accepts RGB triplets. The four Gun Hit tiers use
// separate silver, aqua, violet and gold light for the rarity halo under the gun
// and for a weapon-unlock celebration. The Menu and Arsenal showcases do *not*
// use this: their light is plain white, so a purple EPIC tint can never leak
// into the cover screen.
export const GUN_SUNBURST_RGB: Record<Rarity, string> = {
  UMUM: '201,220,238',
  LANGKA: '56,204,248',
  EPIC: '174,104,255',
  LEGENDARIS: '255,193,52',
};

export const gunSunburstColor = (rarity: Rarity) => GUN_SUNBURST_RGB[rarity];

export interface StageClearSunburstTheme {
  rgb: string;
  shockwave: string;
  burstColors: [string, string, string, string];
}

/**
 * Gun Hit's own sunburst, stage by stage: the warm amber rays this game has
 * always drawn behind its wheel. The pure-white variant still exists for the
 * places that ask for it explicitly, but it is no longer forced on every stage.
 */
export const WHITE_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '255,255,255',
  shockwave: 'rgba(255,255,255,.94)',
  burstColors: ['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0'],
};

export const AMBER_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '255,196,92',
  shockwave: 'rgba(255,214,130,.95)',
  burstColors: ['#fff7ed', '#fde047', '#fbbf24', '#f59e0b'],
};

export const HONEY_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '255,198,110',
  shockwave: 'rgba(255,220,150,.95)',
  burstColors: ['#fffaf0', '#fde68a', '#f6c453', '#c7853a'],
};

export const TARGET_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '255,146,120',
  shockwave: 'rgba(255,190,170,.94)',
  burstColors: ['#fff1f2', '#fecdd3', '#fb7185', '#e11d48'],
};

export const KNIGHT_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '178,208,255',
  shockwave: 'rgba(214,232,255,.94)',
  burstColors: ['#f8fbff', '#c7ddff', '#93b6f5', '#5b7fbf'],
};

export const ONI_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '255,132,104',
  shockwave: 'rgba(255,190,175,.94)',
  burstColors: ['#fff5f5', '#fecaca', '#f87171', '#b91c1c'],
};

export const CYBORG_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '132,232,255',
  shockwave: 'rgba(190,244,255,.94)',
  burstColors: ['#f0fdff', '#a5f3fc', '#67e8f9', '#0891b2'],
};

export const PIRATE_WHEEL_SUNBURST: StageClearSunburstTheme = {
  rgb: '255,205,120',
  shockwave: 'rgba(255,226,160,.95)',
  burstColors: ['#fffbea', '#fde68a', '#fbbf24', '#b45309'],
};

export const WHEEL_SUNBURST_THEMES: Record<Style, StageClearSunburstTheme> = {
  orange: AMBER_WHEEL_SUNBURST,
  wood: HONEY_WHEEL_SUNBURST,
  target: TARGET_WHEEL_SUNBURST,
  knight: KNIGHT_WHEEL_SUNBURST,
  oni: ONI_WHEEL_SUNBURST,
  cyborg: CYBORG_WHEEL_SUNBURST,
  pirate: PIRATE_WHEEL_SUNBURST,
};

export const SPECIAL_SUNBURST_THEMES: Record<'boulder' | 'bonus' | 'treasure', StageClearSunburstTheme> = {
  boulder: CYBORG_WHEEL_SUNBURST,
  bonus: AMBER_WHEEL_SUNBURST,
  treasure: HONEY_WHEEL_SUNBURST,
};

export function getWheelSunburstTheme(style: Style): StageClearSunburstTheme {
  return WHEEL_SUNBURST_THEMES[style] ?? AMBER_WHEEL_SUNBURST;
}

export function getSpecialSunburstTheme(
  mode: 'boulder' | 'bonus' | 'treasure',
): StageClearSunburstTheme {
  return SPECIAL_SUNBURST_THEMES[mode] ?? AMBER_WHEEL_SUNBURST;
}
