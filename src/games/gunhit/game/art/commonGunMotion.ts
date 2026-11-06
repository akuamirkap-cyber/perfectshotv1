import type { WeaponId } from '../weapons';

/** All UMUM weapons have their own moving parts; keep this in sync with weapons.ts. */
export const COMMON_GUN_IDS = [
  'pistol', 'ak47', 'nail', 'crossbow', 'slingshot', 'blowgun', 'shotgun',
  'soaker', 'snowball', 'honey', 'coconut', 'pencil', 'sandal', 'paintball',
  // Slide 9's two new common-rarity guns.
  'longbow', 'mp5',
] as const satisfies readonly WeaponId[];

const commonGuns: ReadonlySet<WeaponId> = new Set(COMMON_GUN_IDS);
export const isCommonGun = (id: WeaponId) => commonGuns.has(id);

/** One quick out-and-back stroke, driven by the real shot clock (no particles/timers). */
export function shotPulse(sinceShot: number, duration = 0.28): number {
  return Number.isFinite(sinceShot) && sinceShot >= 0 && sinceShot < duration
    ? Math.sin(Math.PI * sinceShot / duration) : 0;
}

/** Only used by the menu/Arsenal canvas; gameplay always uses its actual shot/reload state. */
export function commonGunPreviewState(t: number) {
  const cycle = ((Number.isFinite(t) ? t : 0) % 2.8 + 2.8) % 2.8;
  const sinceShot = cycle - 0.85;
  if (sinceShot < 0) return { sinceShot: 9, reloadT: 0, ready: true, flash: 0 };
  return {
    sinceShot,
    reloadT: sinceShot >= 0.23 && sinceShot < 0.72 ? 0.72 - sinceShot : 0,
    ready: sinceShot >= 0.72,
    flash: sinceShot < 0.09 ? 0.55 * (1 - sinceShot / 0.09) : 0,
  };
}
