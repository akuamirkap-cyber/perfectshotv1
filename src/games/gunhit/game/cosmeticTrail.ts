/** Mutable clock carried by a projectile; it never changes its physics. */
export interface CosmeticTrailClock {
  x: number;
  y: number;
  trailCarry?: number;
  trailX?: number;
  trailY?: number;
}

/**
 * Legacy effects were authored once per 60 Hz frame. Emit at that density per
 * game second rather than per display refresh, interpolating catch-up ticks
 * along the travelled path. Collision and motion still run every update.
 */
export function advanceCosmeticTrail(
  clock: CosmeticTrailClock,
  dt: number,
  emit: (x: number, y: number) => void,
): void {
  if (!Number.isFinite(dt) || dt <= 0) return;
  const x0 = clock.trailX ?? clock.x;
  const y0 = clock.trailY ?? clock.y;
  const carry = (clock.trailCarry ?? 0) + Math.min(dt, 0.1) * 60;
  const ticks = Math.min(6, Math.floor(carry + 1e-8));
  clock.trailCarry = Math.max(0, carry - ticks);
  clock.trailX = clock.x;
  clock.trailY = clock.y;
  for (let i = 1; i <= ticks; i++) {
    const f = i / ticks;
    emit(x0 + (clock.x - x0) * f, y0 + (clock.y - y0) * f);
  }
}
