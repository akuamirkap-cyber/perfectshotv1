/**
 * How each zip weapon moves when it fires (`svg-weapons-with-glow-animation.zip`).
 *
 * The zip's own page kicks the whole card with a translate (its `kick` per
 * weapon) and re-runs a one-shot CSS animation (`.dg-fire`, `.wb-fire`, …).
 * Our five guns stand upright, so the same numbers become "travel straight down
 * the barrel axis + tip back", and the class name is what the page re-applies to
 * the mounted SVG so the zip's own flashes, sheen, spins and chomps play.
 *
 * Kept markup-free so the engine can read the numbers without pulling the
 * 190 KB artwork chunk into itself.
 */
import type { ZipWeaponId } from './ids';

export interface ZipKick {
  /**
   * EXTRA pixels the gun travels back (down, away from the wheel) at full
   * recoil, on top of the shared 22 px jump every gun's pose already carries.
   */
  y: number;
  /** Radians the barrel tips back at full recoil. */
  rot: number;
  /** Scale pulse at full recoil — the punch that makes the shot read. */
  punch: number;
}

export const ZIP_KICK: Record<ZipWeaponId, ZipKick> = {
  // zip "Diamond Gun": kick { x: -11, y: 11 } of its 512 box, a heavy rifle.
  diamond: { y: 16, rot: 0.11, punch: 0.045 },
  // zip "Wars Blaster": kick { x: -12, y: 10 }.
  blaster: { y: 14, rot: 0.09, punch: 0.04 },
  // zip "Paintball Gun": the lightest of the five, kick { x: -9, y: 9 }.
  paintball: { y: 10, rot: 0.06, punch: 0.03 },
  // zip "Shark Launcher": kick { x: -14, y: 6 }, the hardest hit.
  shark: { y: 18, rot: 0.13, punch: 0.05 },
  // zip "Martian Heat-Ray": a pivot (`rot: -9`) rather than a slide.
  heat_ray: { y: 20, rot: 0.15, punch: 0.055 },
};

/** The zip's own one-shot fire class, on the SVG root. */
export const ZIP_FIRE_CLASS: Record<ZipWeaponId, string> = {
  diamond: 'dg-fire',
  blaster: 'wb-fire',
  paintball: 'pb-fire',
  shark: 'sl-fire',
  heat_ray: 'mh-fire',
};

/** The zip's idle float class, so a re-fire restarts from the same pose. */
export const ZIP_IDLE_CLASS: Record<ZipWeaponId, string> = {
  diamond: 'dg-bob',
  blaster: 'wb-idle',
  paintball: 'pb-neon',
  shark: 'sl-jet',
  heat_ray: 'mh-seg',
};

/** Length of the zip's own fire animation, in ms (its longest keyframe). */
export const ZIP_FIRE_MS = 780;

export function zipKick(id: string): ZipKick {
  return (ZIP_KICK as Record<string, ZipKick>)[id] ?? { y: 30, rot: 0.08, punch: 0.035 };
}

export function zipFireClass(id: string): string | null {
  return (ZIP_FIRE_CLASS as Record<string, string>)[id] ?? null;
}
