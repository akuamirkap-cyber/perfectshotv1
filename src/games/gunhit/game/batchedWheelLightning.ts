import type { BatchableWheelLightning } from '../vendor/game-4/src/game/particles';

// Scratch buckets are reused; they hold paths only for the duration of draw().
// Fading is quantized to 16 levels, a tiny difference in a flickering bolt, and
// lets overlapping yellow Plasma impacts share three strokes per width/alpha.
const STEPS = 16;
const buckets: { main: number[][]; branches: number[][] }[] = Array.from({ length: STEPS + 1 }, () => ({ main: [], branches: [] }));
const LAYERS = [[6, 0.16], [2.2, 0.55], [0.7, 0.95]] as const;

/**
 * The regular single-impact Plasma bolts are drawn unmodified. During rapid
 * fire, many identical yellow wheel bolts coexist; batch their additive paths
 * by fade and width, without removing any bolt, branch, color or lifetime.
 */
export function drawBatchedWheelLightning(c: CanvasRenderingContext2D, bolts: readonly BatchableWheelLightning[]) {
  if (!bolts.length) return;
  const color = bolts[0].color, width = bolts[0].width;
  // This optimization only combines the same authored Plasma palette/width.
  if (bolts.some(b => b.color !== color || b.width !== width)) {
    for (const bolt of bolts) bolt.draw(c);
    return;
  }
  for (const bucket of buckets) { bucket.main.length = 0; bucket.branches.length = 0; }
  for (const bolt of bolts) {
    const fade = Math.max(0, 1 - bolt.age / bolt.life) * (0.6 + Math.random() * 0.4);
    const step = Math.min(STEPS, Math.max(0, Math.round(fade * STEPS)));
    if (!step) continue;
    const bucket = buckets[step];
    if (bolt.pts[0]) bucket.main.push(bolt.pts[0]);
    for (let i = 1; i < bolt.pts.length; i++) bucket.branches.push(bolt.pts[i]);
  }
  c.save();
  try {
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
    for (let step = 1; step <= STEPS; step++) {
      const bucket = buckets[step], fade = step / STEPS;
      strokePaths(c, bucket.main, width, fade, color);
      strokePaths(c, bucket.branches, width * 0.55, fade, color);
    }
  } finally {
    c.restore();
    // The scratch cache must not keep dead effects alive between frames.
    for (const bucket of buckets) { bucket.main.length = 0; bucket.branches.length = 0; }
  }
}

function strokePaths(c: CanvasRenderingContext2D, paths: number[][], width: number, fade: number, color: string) {
  if (!paths.length) return;
  c.beginPath();
  for (const p of paths) {
    if (p.length < 4) continue;
    c.moveTo(p[0], p[1]);
    for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]);
  }
  for (let layer = 0; layer < LAYERS.length; layer++) {
    const [w, a] = LAYERS[layer];
    c.lineWidth = width * w;
    c.strokeStyle = `rgba(${layer === 2 ? '255,255,255' : color},${a * fade})`;
    c.stroke();
  }
}

/**
 * Cache the clipped additive wheel layer between its rapid lightning changes.
 * This avoids rasterizing dozens of overlapping, branched paths every display
 * frame, while newly arriving hits invalidate it immediately.
 */
export class WheelLightningCache {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private lastBolt: BatchableWheelLightning | null = null;
  private radius = 0;
  private resolution = 0;
  private next = -Infinity;

  clear() {
    this.lastBolt = null;
    this.next = -Infinity;
  }

  draw(c: CanvasRenderingContext2D, bolts: readonly BatchableWheelLightning[], radius: number, time: number) {
    if (!bolts.length || radius <= 0) return;
    if (!this.canvas && typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) { this.canvas = canvas; this.context = context; }
      } catch {
        // The vector path below is still available if an offscreen canvas is refused.
      }
    }
    const canvas = this.canvas, off = this.context;
    if (!canvas || !off) {
      c.save(); c.beginPath(); c.arc(0, 0, radius, 0, Math.PI * 2); c.clip();
      drawBatchedWheelLightning(c, bolts); c.restore();
      return;
    }
    const matrix = typeof c.getTransform === 'function' ? c.getTransform() : null;
    const scale = matrix && Number.isFinite(matrix.a) && Number.isFinite(matrix.b)
      ? Math.max(1, Math.min(2, Math.hypot(matrix.a, matrix.b))) : 1;
    const required = Math.ceil(radius * 2 * scale);
    // A Boss breathes and the wheel kicks by a few pixels every frame. Keep
    // the backing canvas stable through those small scale changes; only grow
    // it when there is a substantial DPR/size increase, or a new wheel radius.
    const resize = radius !== this.radius || required > this.resolution * 1.15;
    const resolution = resize ? Math.ceil(required / 32) * 32 : this.resolution;
    const last = bolts[bolts.length - 1];
    if (resize || last !== this.lastBolt || time >= this.next) {
      if (resolution !== this.resolution) canvas.width = canvas.height = resolution;
      off.save();
      try {
        off.setTransform(1, 0, 0, 1, 0, 0); off.clearRect(0, 0, canvas.width, canvas.height);
        // Use the exact rounded backing size so the clipped layer stays aligned.
        const px = resolution / (radius * 2);
        off.setTransform(px, 0, 0, px, resolution / 2, resolution / 2);
        off.beginPath(); off.arc(0, 0, radius, 0, Math.PI * 2); off.clip();
        drawBatchedWheelLightning(off, bolts);
      } finally { off.restore(); }
      this.lastBolt = last; this.radius = radius; this.resolution = resolution;
      this.next = time + 0.075;
    }
    c.save(); c.globalCompositeOperation = 'lighter';
    c.drawImage(canvas, -radius, -radius, radius * 2, radius * 2);
    c.restore();
  }
}
