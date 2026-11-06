/** First point of a beam on the same boss mask used by projectiles.
 * Null means empty space all the way to the end of the segment. */
export function traceBossSegment(
  x0: number, y0: number, x1: number, y1: number,
  ink: (x: number, y: number) => boolean,
): { x: number; y: number; dist: number } | null {
  const distance = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(distance));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    if (ink(x, y)) return { x, y, dist: distance * t };
  }
  return null;
}
