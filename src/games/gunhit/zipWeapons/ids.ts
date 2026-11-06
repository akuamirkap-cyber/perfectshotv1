/**
 * The weapons whose artwork comes from `svg-weapons-with-glow-animation.zip`.
 *
 * Kept in its own module (no markup) so the engine can ask "does this weapon
 * have the new art?" without pulling the artwork's chunk into the bundle.
 */
export const ZIP_WEAPON_IDS = ['diamond', 'blaster', 'paintball', 'shark', 'heat_ray'] as const;

export type ZipWeaponId = (typeof ZIP_WEAPON_IDS)[number];

const ZIP_SET: ReadonlySet<string> = new Set<string>(ZIP_WEAPON_IDS);

/** True when the zip's artwork replaces this weapon's canvas drawing. */
export function hasZipArt(id: string | null | undefined): boolean {
  return typeof id === 'string' && ZIP_SET.has(id);
}
