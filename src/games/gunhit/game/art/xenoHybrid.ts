import { drawXenoAcidGlob } from '../../vendor/game-8/src/game/weapons/icons';

const TAU = Math.PI * 2;

/** Flight is effect 2's metaball carrier with effect 3's actual glassy acid glob on it. */
export function drawXenoHybridFlight(c: CanvasRenderingContext2D, x: number, y: number, time: number) {
  c.save();
  c.translate(x, y);
  // Smaller and translucent: the merged green fluid remains the main body.
  c.scale(0.78, 0.78);
  drawXenoAcidGlob(c, { x: 0, y: 0, age: time }, 0.68);
  c.restore();

  // A few molecular hexagons following the fluid make effect 3 recognizable
  // even before its larger honeycomb impact appears.
  c.save();
  c.strokeStyle = 'rgba(230,255,137,0.85)';
  c.lineWidth = 1.15;
  for (let i = 0; i < 3; i++) {
    const hx = x + (i % 2 ? 12 : -12) + Math.sin(time * 8 + i) * 2;
    const hy = y + 18 + i * 13;
    hexagon(c, hx, hy, 3.8 - i * 0.4);
    c.stroke();
  }
  c.restore();
}

function hexagon(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.beginPath();
  appendHexagon(c, x, y, r);
}

function appendHexagon(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  for (let k = 0; k < 6; k++) {
    const a = k * TAU / 6;
    const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (k) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
}

// Effect 3's 19-cell molecular shock wave (axial hex coordinates), computed
// once rather than allocating a grid on every frame or running a second hit.
const MOLECULES: { x: number; y: number; d: number }[] = [];
for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
  if (Math.abs(q + r) > 2) continue;
  const x = 11 * 1.5 * q, y = 11 * Math.sqrt(3) * (r + q / 2);
  MOLECULES.push({ x, y, d: Math.hypot(x, y) });
}

// Reused buckets batch similarly bright cells into a few paths. Eight alpha
// levels preserve the soft wave while avoiding 38 separate fills/strokes per
// impact on a phone; no cells, geometry or impact timing are removed.
const MOLECULAR_BUCKETS: number[][] = Array.from({ length: 8 }, () => []);

/** Pure impact artwork; no hit, score, projectile, or collision is created. */
export function drawXenoMolecularBurst(c: CanvasRenderingContext2D, x: number, y: number, age: number) {
  for (const bucket of MOLECULAR_BUCKETS) bucket.length = 0;
  for (let i = 0; i < MOLECULES.length; i++) {
    const u = (age - MOLECULES[i].d / (11 * 4.2) * 0.3) / 0.55;
    if (u <= 0 || u >= 1) continue;
    const bucket = Math.min(7, Math.floor(Math.sin(Math.PI * u) * 8));
    MOLECULAR_BUCKETS[bucket].push(i);
  }
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineWidth = 1.5;
  for (let b = 0; b < MOLECULAR_BUCKETS.length; b++) {
    const cells = MOLECULAR_BUCKETS[b];
    if (!cells.length) continue;
    c.beginPath();
    for (const i of cells) {
      const cell = MOLECULES[i];
      const u = (age - cell.d / (11 * 4.2) * 0.3) / 0.55;
      appendHexagon(c, x + cell.x, y + cell.y, 11 * (1 - u * 0.35));
    }
    const a = (b + 0.5) / MOLECULAR_BUCKETS.length;
    c.fillStyle = `rgba(160,240,44,${0.13 * a})`; c.fill();
    c.strokeStyle = `rgba(232,255,138,${0.95 * a})`; c.stroke();
  }
  c.restore();
}

const BUBBLE_BUCKETS: number[][] = Array.from({ length: 4 }, () => []);

/** Effect 3's growing eaten pit, bright rim, cracks and bubbling acid. */
export function drawXenoCorrosion(c: CanvasRenderingContext2D, x: number, y: number, time: number, seed = 0, age = 1) {
  const grow = 1 - Math.exp(-Math.max(0, age) * 2.1);
  const rad = 9 + 17 * grow;
  const lit = 0.35 + 0.65 * Math.max(0, 1 - Math.max(0, age) / 4);
  c.save();
  c.translate(x, y);
  const stain = c.createRadialGradient(0, 0, rad * 0.25, 0, 0, rad * 1.7);
  stain.addColorStop(0, 'rgba(138,190,30,0.42)');
  stain.addColorStop(1, 'rgba(110,140,24,0)');
  c.fillStyle = stain;
  c.beginPath(); c.arc(0, 0, rad * 1.7, 0, TAU); c.fill();

  c.beginPath();
  for (let i = 0; i <= 24; i++) {
    const a = i * TAU / 24;
    const rr = rad * (0.88 + 0.08 * Math.sin(a * 3 + seed) + 0.045 * Math.sin(a * 5 + seed * 2));
    const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  c.closePath();
  c.fillStyle = 'rgba(8,18,3,0.91)'; c.fill();
  c.strokeStyle = `rgba(190,255,55,${0.5 + 0.35 * lit})`; c.lineWidth = 2; c.stroke();

  // The wet core and travelling bubbles reproduce the acid-blood corrosion,
  // while the larger fluid sheet is drawn separately over the rim.
  const pool = c.createRadialGradient(-rad * 0.3, -rad * 0.3, 0, 0, 0, rad);
  pool.addColorStop(0, 'rgba(166,243,39,0.38)');
  pool.addColorStop(0.7, 'rgba(53,111,8,0.28)');
  pool.addColorStop(1, 'rgba(17,39,3,0)');
  c.fillStyle = pool; c.fill();
  c.lineCap = 'round';
  c.strokeStyle = `rgba(204,255,100,${0.65 * lit})`; c.lineWidth = 1.15;
  c.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = seed + i * TAU / 6;
    const dx = Math.cos(a), dy = Math.sin(a);
    c.moveTo(dx * rad * 0.8, dy * rad * 0.8);
    c.lineTo(dx * rad * 1.16 - dy * 3, dy * rad * 1.16 + dx * 3);
    c.lineTo(dx * rad * 1.5, dy * rad * 1.5);
  }
  c.stroke();
  for (const bucket of BUBBLE_BUCKETS) bucket.length = 0;
  for (let i = 0; i < 7; i++) {
    // Coordinates/seeds on a rock or chest can be negative; `%` would make a
    // negative radius. Keep the phase nonnegative for every stage.
    const progress = time * (0.9 + (i % 3) * 0.22) + i * 0.37 + seed * 0.1;
    const phase = progress - Math.floor(progress);
    const orbit = rad * (0.22 + (i % 3) * 0.18);
    const bx = Math.cos(i * 2.4 + seed) * orbit;
    const by = Math.sin(i * 2.4 + seed) * orbit;
    const br = 1.2 + phase * 3.2;
    const bucket = Math.min(3, Math.floor(Math.sin(Math.PI * phase) * 4));
    BUBBLE_BUCKETS[bucket].push(bx, by, br);
  }
  c.lineWidth = 1;
  for (let b = 0; b < BUBBLE_BUCKETS.length; b++) {
    const bubbles = BUBBLE_BUCKETS[b];
    if (!bubbles.length) continue;
    c.strokeStyle = `rgba(244,255,176,${((b + 0.5) / 4) * 0.9 * lit})`;
    c.beginPath();
    for (let i = 0; i < bubbles.length; i += 3) {
      c.moveTo(bubbles[i] + bubbles[i + 2], bubbles[i + 1]);
      c.arc(bubbles[i], bubbles[i + 1], bubbles[i + 2], 0, TAU);
    }
    c.stroke();
  }
  c.restore();
}

/** Liquid left on a special rock/chest, where the wheel metaball layer is absent. */
export function drawXenoSpecialPuddle(c: CanvasRenderingContext2D, x: number, y: number, time: number) {
  c.save(); c.translate(x, y);
  const liquid = c.createRadialGradient(-4, -4, 1, 0, 2, 20);
  liquid.addColorStop(0, 'rgba(244,255,166,0.95)');
  liquid.addColorStop(0.45, 'rgba(175,255,34,0.88)');
  liquid.addColorStop(1, 'rgba(76,180,8,0.65)');
  c.fillStyle = liquid;
  c.beginPath();
  c.moveTo(-16, 0);
  c.bezierCurveTo(-17, -9, -8, -12, 0, -9);
  c.bezierCurveTo(10, -13, 18, -6, 15, 2);
  c.bezierCurveTo(14, 9, 6, 9, 3, 11);
  c.bezierCurveTo(0, 16 + Math.sin(time * 3) * 2, -3, 15, -5, 9);
  c.bezierCurveTo(-14, 9, -18, 5, -16, 0);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(210,255,100,0.85)'; c.lineWidth = 1.2; c.stroke();
  c.restore();
}
