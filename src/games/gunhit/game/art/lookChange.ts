/**
 * A tiny bus for "the player picked a different skin or shot".
 *
 * The engine and the arsenal own the choice (`art/gunVariants.ts`), but the menu
 * caches its painted weapon frame and the ink pivot it measured for it. Since a
 * gun's design is now a real choice — the zip's animated SVG is one card among
 * several — a screen has to be told when that choice changes.
 *
 * Kept in its own module, with no imports at all, so the menu can subscribe to
 * it without dragging the gun artwork (or the 190 KB zip markup) into the entry
 * chunk.
 */
export type GunLookChangeListener = () => void;

let listener: GunLookChangeListener | null = null;

export function setGunLookChangeListener(fn: GunLookChangeListener | null): void {
  listener = fn;
}

export function notifyGunLookChange(): void {
  try {
    listener?.();
  } catch {
    /* A screen that throws while repainting must never break the pick. */
  }
}
