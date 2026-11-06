/**
 * The five weapons from `svg-weapons-with-glow-animation.zip`, keyed by the
 * game's weapon id whose name matches the zip's:
 *
 *   Diamond Gun      → diamond
 *   Wars Blaster     → blaster
 *   Paintball Gun    → paintball
 *   Shark Launcher   → shark
 *   Martian Heatray  → heat_ray
 *
 * Each entry is the zip's own SVG — including its `<style>` block, so every
 * glow, twinkle, shimmer and fire animation runs in the page exactly as the zip
 * plays it — rotated upright, plus the ink bounds the screens place it by.
 */
export { ZIP_WEAPON_IDS, hasZipArt, type ZipWeaponId } from './ids';

import { box as diamondBox, ink as diamondInk, markup as diamondGun } from './diamondGun';
import { box as blasterBox, ink as blasterInk, markup as warsBlaster } from './warsBlaster';
import { box as paintballBox, ink as paintballInk, markup as paintballGun } from './paintballGun';
import { box as sharkBox, ink as sharkInk, markup as sharkLauncher } from './sharkLauncher';
import { box as rayBox, ink as rayInk, markup as martianHeatray } from './martianHeatray';
import type { ZipWeaponId } from './ids';

export interface ZipInk {
  x0: number; y0: number; x1: number; y1: number;
  /** Barrel tip, in the same units: the point every screen anchors to. */
  muzzleX: number; muzzleY: number;
}

export interface ZipArt {
  /** The zip's SVG, upright, with its animations intact. */
  markup: string;
  /** Side of the square viewBox the markup draws in (user units). */
  box: number;
  /** Where the viewBox starts (`-pad`), so user units map to box pixels. */
  pad: number;
  ink: ZipInk;
}

export const ZIP_ART: Record<ZipWeaponId, ZipArt> = {
  diamond: { markup: diamondGun, box: diamondBox, pad: 256, ink: diamondInk },
  blaster: { markup: warsBlaster, box: blasterBox, pad: 256, ink: blasterInk },
  paintball: { markup: paintballGun, box: paintballBox, pad: 256, ink: paintballInk },
  shark: { markup: sharkLauncher, box: sharkBox, pad: 256, ink: sharkInk },
  heat_ray: { markup: martianHeatray, box: rayBox, pad: 256, ink: rayInk },
};

export function zipArt(id: string | null | undefined): ZipArt | null {
  if (typeof id !== 'string') return null;
  return (ZIP_ART as Record<string, ZipArt>)[id] ?? null;
}

/** Ink height in user units: what every screen scales against. */
export function inkHeight(art: ZipArt): number {
  return Math.max(1, art.ink.y1 - art.ink.y0);
}

/**
 * Placement for a weapon drawn at `height` CSS px.
 *
 * `scale` makes the artwork's ink exactly `height` px tall; `left`/`top` are the
 * offsets of the drawing box inside its container, so either the barrel tip or
 * the ink's centre lands on the container's anchor. The same numbers drive the
 * DOM overlay and the offline preview render, so what is checked is what ships.
 */
export function placeZipArt(
  art: ZipArt,
  height: number,
  anchor: 'muzzle' | 'center' = 'muzzle',
): { size: number; scale: number; left: number; top: number } {
  const scale = height / inkHeight(art);
  const size = art.box * scale;
  const toBox = (u: number) => (u + art.pad) * scale;
  if (anchor === 'muzzle') {
    return { size, scale, left: -toBox(art.ink.muzzleX), top: -toBox(art.ink.muzzleY) };
  }
  const cx = toBox((art.ink.x0 + art.ink.x1) / 2);
  const cy = toBox((art.ink.y0 + art.ink.y1) / 2);
  return { size, scale, left: -cx, top: -cy };
}
