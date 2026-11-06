/**
 * Obstacle knives, drawn on canvas with the reference geometry.
 *
 * The art bersama shipped three kinds of knife with the target artwork: a
 * wooden-handled kitchen knife, a knight's dagger with a golden guard, and a
 * black kunai with a ring pommel. They always use the same 28 x 84 box with the
 * tip at the top, ~30 % of it sunk into the target. Game A's boss stage uses
 * those exact shapes.
 *
 * Each variant is baked once into a small offscreen sprite; the engine then
 * costs one `drawImage` per knife per frame.
 */

const KNIFE_W = 28;
const KNIFE_H = 84;
/** Baked at 4x the reference box so a knife stays crisp on a retina screen. */
const SPRITE_SCALE = 4;
const OUTLINE = '#1a1020';

type Ctx = CanvasRenderingContext2D;

const roundRectPath = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
};

const grad = (
  c: Ctx,
  stops: [number, string][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) => {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
};

const STEEL: [number, string][] = [
  [0, '#7d8996'],
  [0.45, '#f5f8fb'],
  [0.6, '#c7d0d9'],
  [1, '#6b7681'],
];
const DARK_STEEL: [number, string][] = [
  [0, '#1f2430'],
  [0.5, '#5b6475'],
  [1, '#1a1e28'],
];
const WOOD: [number, string][] = [
  [0, '#5b2c0f'],
  [0.45, '#b8733a'],
  [1, '#4a2208'],
];
const GOLD: [number, string][] = [
  [0, '#fff3b0'],
  [0.5, '#f5b82e'],
  [1, '#9a5b00'],
];
const RED: [number, string][] = [
  [0, '#7f1d1d'],
  [0.5, '#ef4444'],
  [1, '#7f1d1d'],
];

/** Paint one knife in the reference 28 x 84 box: tip at (14, 0), handle below. */
function paintKnife(c: Ctx, variant: number) {
  const v = ((variant % 3) + 3) % 3;
  c.save();
  c.lineJoin = 'round';
  c.lineWidth = 1.3;
  c.strokeStyle = OUTLINE;

  if (v === 0) {
    // Kitchen knife: long blade, riveted wooden handle.
    c.beginPath();
    c.moveTo(16.5, 0.5);
    c.lineTo(18.6, 50);
    c.lineTo(8.6, 50);
    c.quadraticCurveTo(9, 20, 16.5, 0.5);
    c.closePath();
    c.fillStyle = grad(c, STEEL, 8.6, 0, 18.6, 50);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(16.6, 4);
    c.lineTo(18.2, 48);
    c.strokeStyle = 'rgba(255,255,255,0.8)';
    c.lineWidth = 1;
    c.stroke();
    c.beginPath();
    c.moveTo(11, 34);
    c.quadraticCurveTo(11.6, 22, 15, 10);
    c.strokeStyle = 'rgba(91,102,112,0.5)';
    c.lineWidth = 0.8;
    c.stroke();
    c.strokeStyle = OUTLINE;
    c.lineWidth = 1.3;
    roundRectPath(c, 7.6, 49.5, 12, 5, 1.4);
    c.fillStyle = '#cfd6de';
    c.fill();
    c.stroke();
    roundRectPath(c, 8.8, 54, 9.6, 28.5, 3.6);
    c.fillStyle = grad(c, WOOD, 9.2, 0, 18.4, 0);
    c.fill();
    c.stroke();
    c.fillStyle = '#e5e7eb';
    for (const y of [61, 68.5, 76]) {
      c.beginPath();
      c.arc(13.6, y, 1.6, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
  } else if (v === 1) {
    // Knight's dagger: golden cross-guard, red wrap, golden pommel ring.
    c.beginPath();
    c.moveTo(14, 0.5);
    c.lineTo(18.6, 11);
    c.lineTo(18, 52);
    c.lineTo(10, 52);
    c.lineTo(9.4, 11);
    c.closePath();
    c.fillStyle = grad(c, STEEL, 9.4, 0, 18.6, 52);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(14, 5);
    c.lineTo(14, 48);
    c.strokeStyle = '#5b6670';
    c.lineWidth = 1.4;
    c.stroke();
    c.beginPath();
    c.moveTo(14.9, 6);
    c.lineTo(15, 47);
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 0.8;
    c.stroke();
    c.beginPath();
    c.moveTo(3, 51.5);
    c.quadraticCurveTo(14, 48, 25, 51.5);
    c.lineTo(24, 57);
    c.quadraticCurveTo(14, 54.5, 4, 57);
    c.closePath();
    c.fillStyle = grad(c, GOLD, 3, 48, 25, 57);
    c.fill();
    c.stroke();
    for (const x of [3.4, 24.6]) {
      c.beginPath();
      c.arc(x, 54.2, 2.4, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    c.beginPath();
    c.moveTo(10.8, 56);
    c.lineTo(17.2, 56);
    c.lineTo(17.2, 74.5);
    c.quadraticCurveTo(17.2, 76.5, 14, 76.5);
    c.quadraticCurveTo(10.8, 76.5, 10.8, 74.5);
    c.closePath();
    c.fillStyle = grad(c, RED, 10.8, 0, 17.2, 0);
    c.fill();
    c.stroke();
    c.strokeStyle = '#3b0606';
    c.lineWidth = 0.9;
    for (const y of [60, 65, 70]) {
      c.beginPath();
      c.moveTo(10.8, y);
      c.lineTo(17.2, y + 3);
      c.stroke();
    }
    c.beginPath();
    c.arc(14, 79.5, 4, 0, Math.PI * 2);
    c.fillStyle = grad(c, GOLD, 10, 75.5, 18, 83.5);
    c.fill();
    c.strokeStyle = OUTLINE;
    c.lineWidth = 1.3;
    c.stroke();
  } else {
    // Kunai: black steel blade, wrapped grip, ring pommel.
    c.beginPath();
    c.moveTo(14, 0.5);
    c.lineTo(20.2, 25);
    c.lineTo(16.2, 44.5);
    c.lineTo(11.8, 44.5);
    c.lineTo(7.8, 25);
    c.closePath();
    c.fillStyle = grad(c, DARK_STEEL, 7.8, 0, 20.2, 44.5);
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(14, 3);
    c.lineTo(14, 42);
    c.strokeStyle = '#9aa3b2';
    c.lineWidth = 1;
    c.stroke();
    c.beginPath();
    c.moveTo(14, 3);
    c.lineTo(19, 24);
    c.strokeStyle = 'rgba(255,255,255,0.5)';
    c.lineWidth = 0.8;
    c.stroke();
    c.strokeStyle = OUTLINE;
    c.lineWidth = 1.3;
    roundRectPath(c, 11.6, 44, 4.8, 25, 1.2);
    c.fillStyle = '#2a1d14';
    c.fill();
    c.stroke();
    c.strokeStyle = '#c9b48a';
    c.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const y = 47 + i * 4.5;
      c.beginPath();
      c.moveTo(11.6, y);
      c.lineTo(16.4, y + 3);
      c.stroke();
    }
    c.beginPath();
    c.arc(14, 75.5, 6.2, 0, Math.PI * 2);
    c.strokeStyle = OUTLINE;
    c.lineWidth = 4.2;
    c.stroke();
    c.strokeStyle = grad(c, DARK_STEEL, 8, 69, 20, 82);
    c.lineWidth = 2.4;
    c.stroke();
  }
  c.restore();
}

let sprites: (HTMLCanvasElement | null)[] | null = null;

function knifeSprite(variant: number): HTMLCanvasElement | null {
  if (!sprites) sprites = [null, null, null];
  const v = ((variant % 3) + 3) % 3;
  const hit = sprites[v];
  if (hit) return hit;
  try {
    const cv = document.createElement('canvas');
    cv.width = KNIFE_W * SPRITE_SCALE;
    cv.height = KNIFE_H * SPRITE_SCALE;
    const c = cv.getContext('2d');
    if (!c) return null;
    c.scale(SPRITE_SCALE, SPRITE_SCALE);
    paintKnife(c, v);
    sprites[v] = cv;
    return cv;
  } catch {
    return null; // a canvas we cannot build: the vector path still draws it
  }
}

/** Width/height of a knife of the given on-screen height. */
export const knifeWidth = (height: number) => (KNIFE_W / KNIFE_H) * height;

/**
 * Draw a knife with its tip at the current origin and the handle hanging in
 * +y, `height` px tall. The engine calls this once the frame is already rotated
 * to the knife's angle, so the tip points into the target.
 */
export function drawKnife(c: CanvasRenderingContext2D, variant: number, height: number) {
  const w = knifeWidth(height);
  const sprite = knifeSprite(variant);
  if (sprite) {
    c.drawImage(sprite, -w / 2, 0, w, height);
    return;
  }
  c.save();
  c.scale(w / KNIFE_W, height / KNIFE_H);
  c.translate(-KNIFE_W / 2, 0);
  paintKnife(c, variant);
  c.restore();
}

/** Perfect Shot's knife roster: which knife sits at which angle on a stage. */
export const knifeVariant = (n: number, i: number) => ((n + i) % 3 + 3) % 3;
/** How much of the blade disappears into the target, exactly like Game B. */
export const KNIFE_SINK = 0.3;
