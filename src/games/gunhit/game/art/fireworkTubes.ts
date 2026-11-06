import type { GunVariant } from './gunVariants';

/** Tube positions in the *unscaled* gun art, ordered red, blue, yellow. */
export function fireworkMouth(variant: GunVariant, index: number) {
  const tube = ((Math.floor(index) % 3) + 3) % 3;
  if (variant === 'set2') return { x: 0, y: -22 }; // the separate one-barrel Firework skin
  if (variant === 'set7') return { x: (tube - 1) * 15 * 0.92, y: (tube === 1 ? -4 : 8) * 0.92 };
  return { x: (tube - 1) * 12, y: tube === 1 ? 30 : 38 };
}
