type Firefly = { x: number; y: number; s: number };

// Reuse buckets: no per-frame arrays and no line joining between circles.
const PULSE_STEPS = 16;
const buckets: Firefly[][] = Array.from({ length: PULSE_STEPS + 1 }, () => []);
const TAU = Math.PI * 2;

/** The same pulsing gold aura and bright core, batched by a fine opacity step. */
export function drawForestFireflies(ctx: CanvasRenderingContext2D, dust: readonly Firefly[], time: number) {
  for (const bucket of buckets) bucket.length = 0;
  for (const d of dust) {
    const pulse = Math.max(0, 0.4 + 0.6 * Math.sin(time * 2.5 + d.x));
    if (pulse <= 0) continue;
    const step = Math.min(PULSE_STEPS, Math.max(1, Math.round(pulse * PULSE_STEPS)));
    buckets[step].push(d);
  }
  for (let step = 1; step <= PULSE_STEPS; step++) {
    const group = buckets[step];
    if (!group.length) continue;
    const pulse = step / PULSE_STEPS;
    ctx.fillStyle = `rgba(250,204,21,${0.28 * pulse})`;
    ctx.beginPath();
    for (const d of group) {
      const r = d.s * 2.8;
      ctx.moveTo(d.x + r, d.y);
      ctx.arc(d.x, d.y, r, 0, TAU);
    }
    ctx.fill();
    ctx.fillStyle = `rgba(254,240,138,${0.9 * pulse})`;
    ctx.beginPath();
    for (const d of group) {
      const r = d.s * 0.9;
      ctx.moveTo(d.x + r, d.y);
      ctx.arc(d.x, d.y, r, 0, TAU);
    }
    ctx.fill();
  }
}
