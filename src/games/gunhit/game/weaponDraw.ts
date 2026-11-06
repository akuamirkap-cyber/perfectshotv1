/**
 * The drawing half of the weapon module. Kept apart from `weapons.ts` so that
 * the menus — which only need the weapon table (name, rarity, unlock rules) —
 * do not pull every gun's artwork, and the ported slide art behind it, into the
 * first chunk.
 */
export { drawGun } from './art/guns';
export { drawProjectile } from './art/projectiles';
