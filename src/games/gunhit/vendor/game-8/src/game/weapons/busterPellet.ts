import { drawPlasmaOrb, YELLOW_PLASMA_ORB } from '../../../../game-4/src/game/shapes3';

/** The tap shot stays twice its original size, in flight and on the target. */
export const BUSTER_PELLET_RADIUS = 14;
type C = CanvasRenderingContext2D;
let orbSprite: HTMLCanvasElement | null | undefined;
const BOLT_LAYERS = [
  [3.4, 'rgba(255,214,45,0.30)'],
  [1.3, 'rgba(255,245,175,0.9)'],
  [0.5, 'rgba(255,255,255,1)'],
] as const;

/** Bake the same static radial core as Plasma Gun, recolored yellow. */
function pelletSprite(): HTMLCanvasElement | null {
  if (orbSprite !== undefined) return orbSprite;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const c = cv.getContext('2d');
  if (!c) { orbSprite = null; return null; }
  const r = 63.5, x = 64, y = 64;
  const g = c.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.35, YELLOW_PLASMA_ORB.coreLight);
  g.addColorStop(0.7, YELLOW_PLASMA_ORB.coreMid);
  g.addColorStop(1, YELLOW_PLASMA_ORB.coreEdge);
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  orbSprite = cv;
  return cv;
}

/** The Plasma Gun's small crackling bolt, recolored without per-frame particles. */
function drawPelletLightning(c: C, x: number, y: number, r: number, time: number) {
  // Tick in world time rather than rolling on every display frame: high-refresh
  // phones get the same animated flicker without ever accumulating objects.
  const tick = Math.floor(time * 18);
  if (((tick % 4) + 4) % 4 === 1) return;
  const a = tick * 2.399963 + 0.6;
  const dx = Math.cos(a), dy = Math.sin(a);
  const nx = -dy, ny = dx;
  const start = r * 0.7;
  const end = r + 16 + (0.5 + 0.5 * Math.sin(tick * 4.2)) * 8;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath();
  for (let i = 0; i <= 8; i++) {
    const u = i / 8, d = start + (end - start) * u;
    const jitter = Math.sin(tick * 19.7 + i * 23.9) * 4 * Math.sin(Math.PI * u);
    const px = x + dx * d + nx * jitter, py = y + dy * d + ny * jitter;
    if (i) c.lineTo(px, py); else c.moveTo(px, py);
  }
  // Reuse one path for all three glow layers instead of rebuilding the bolt.
  for (const [width, color] of BOLT_LAYERS) {
    c.lineWidth = width; c.strokeStyle = color; c.stroke();
  }
  c.restore();
}

/**
 * The real Plasma Gun's swirling core and aura in yellow, used both for the
 * flight and the copy attached to a target. A pulsing radius and a brief
 * crackling arc match its stuck plasma; the core and glow sprites are cached.
 */
export function drawBusterPelletOrb(c: C, x: number, y: number, time: number): void {
  c.save();
  const r = BUSTER_PELLET_RADIUS * (1 + 0.12 * Math.sin(time * 9));
  drawPlasmaOrb(c, x, y, r, time * 1.8, 1.1, YELLOW_PLASMA_ORB, pelletSprite());
  drawPelletLightning(c, x, y, r, time);
  c.restore();
}

/** Plasma Gun's tapered energy tail, recolored yellow; never drawn when stuck. */
export function drawBusterPellet(c: C, p: { x: number; y: number; age: number }): void {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const trail = c.createLinearGradient(0, p.y, 0, p.y + 110);
  trail.addColorStop(0, 'rgba(255,242,150,0.7)');
  trail.addColorStop(1, 'rgba(255,194,20,0)');
  c.fillStyle = trail;
  c.beginPath();
  c.moveTo(p.x - 10.5, p.y + 4); c.lineTo(p.x + 10.5, p.y + 4);
  c.lineTo(p.x + 1, p.y + 110); c.lineTo(p.x - 1, p.y + 110);
  c.closePath(); c.fill();
  c.restore();
  drawBusterPelletOrb(c, p.x, p.y, p.age);
}
