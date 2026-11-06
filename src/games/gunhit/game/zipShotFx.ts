/**
 * The zip weapons' own shot (`svg-weapons-with-glow-animation.zip`, "Skin 3").
 *
 * Each of the five guns the zip draws fires the round *it* is drawn with:
 *
 *   Diamond Gun     → the ice-blue faceted crystal (slide 2's own gem)
 *   Wars Blaster    → a red plasma bolt (the zip's red core, `#ff2a12`)
 *   Paintball Gun   → one of the zip's paint balls, in its own paint colour
 *   Shark Launcher  → a blue harpoon bolt trailing bubbles
 *   Martian Heat-Ray→ a lime plasma mote, the zip's `#8dff3b` green
 *
 * Every other gun used to borrow the Diamond crystal, which is why a Wars
 * Blaster carried diamonds around: the round belongs to the gun that fires it.
 *
 * Kept in its own module, importing nothing but the slide-2 gem painter, so the
 * menu, the arsenal cards and the engine all read the same look without any of
 * them dragging the others in.
 */
import { drawSlide2DiamondBullet } from './diamondSlideFx';

const TAU = Math.PI * 2;

/** The zip weapon a round belongs to. */
export type ZipRoundId = 'diamond' | 'blaster' | 'paintball' | 'shark' | 'heat_ray';

/** True when the equipped weapon fires the zip's own round. */
export function isZipShot(id: string | null | undefined, effect: string): boolean {
  return effect === 'zip'
    && (id === 'diamond' || id === 'blaster' || id === 'paintball' || id === 'shark' || id === 'heat_ray');
}

/**
 * The zip's own colours, read off its artwork: `WarsBlaster`'s red core, the
 * `SharkLauncher`'s hull blue, the `MartianHeatray`'s lime. The Diamond Gun and
 * the Paintball Gun already have their palettes on slide 2.
 */
const ZIP_ROUND = {
  blaster: { core: '#fff3f0', hot: '#ff7a5c', deep: '#d81b0a', glow: '255,90,60' },
  shark: { core: '#f2fbff', hot: '#8ed8ff', deep: '#1f74c9', glow: '95,190,255' },
  heat_ray: { core: '#f6ffe8', hot: '#b6ff5a', deep: '#4fbf18', glow: '141,255,59' },
} as const;

export type ZipRoundPaint = { core: string; hot: string; deep: string; glow: string };

/** The paint the round is drawn in, for the trail and the card behind it. */
export function zipRoundPaint(id: string | null | undefined): ZipRoundPaint {
  if (id === 'blaster') return ZIP_ROUND.blaster;
  if (id === 'shark') return ZIP_ROUND.shark;
  if (id === 'heat_ray') return ZIP_ROUND.heat_ray;
  // Diamond Gun and Paintball Gun keep slide 2's ice palette (the paint ball is
  // drawn in its own paint colour, the halo stays the zip's cyan).
  return { core: '#ffffff', hot: '#c4e6ff', deep: '#3aa8ff', glow: '120,225,255' };
}

/** The paint ball's palette, the same six colours slide 1 paints its rounds in. */
const PAINT = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c'];

/** Wars Blaster: a plasma bolt — a hot core inside a red teardrop. */
function plasmaBolt(c: CanvasRenderingContext2D, r: number, t: number, seed: number) {
  const paint = ZIP_ROUND.blaster;
  const wob = Math.sin(t * 9 + seed) * 0.18;
  const halo = c.createRadialGradient(0, -r * 0.2, r * 0.2, 0, -r * 0.2, r * 3);
  halo.addColorStop(0, 'rgba(255,120,80,0.6)');
  halo.addColorStop(1, 'rgba(255,60,30,0)');
  c.fillStyle = halo;
  c.beginPath(); c.arc(0, -r * 0.2, r * 3, 0, TAU); c.fill();
  c.save();
  c.rotate(wob);
  c.fillStyle = paint.deep;
  c.beginPath();
  c.moveTo(0, -r * 1.45);
  c.quadraticCurveTo(r * 0.85, -r * 0.2, 0, r * 1.5);
  c.quadraticCurveTo(-r * 0.85, -r * 0.2, 0, -r * 1.45);
  c.closePath(); c.fill();
  c.fillStyle = paint.hot;
  c.beginPath();
  c.moveTo(0, -r * 1.1);
  c.quadraticCurveTo(r * 0.45, -r * 0.15, 0, r * 1.05);
  c.quadraticCurveTo(-r * 0.45, -r * 0.15, 0, -r * 1.1);
  c.closePath(); c.fill();
  c.fillStyle = paint.core;
  c.beginPath(); c.ellipse(0, 0, r * 0.22, r * 0.62, 0, 0, TAU); c.fill();
  c.restore();
}

/** Paintball Gun: a glossy ball in its own paint colour (`tint` is the shot's). */
function paintBall(c: CanvasRenderingContext2D, r: number, tint: string) {
  const col = PAINT.includes(tint as never)
    ? tint
    : PAINT[Math.abs(tint.length * 7) % PAINT.length];
  const halo = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.4);
  halo.addColorStop(0, 'rgba(255,255,255,0.32)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = halo;
  c.beginPath(); c.arc(0, 0, r * 2.4, 0, TAU); c.fill();
  const ball = c.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.15, 0, 0, r * 1.05);
  ball.addColorStop(0, '#ffffff');
  ball.addColorStop(0.3, col);
  ball.addColorStop(1, '#7c1030');
  c.fillStyle = ball;
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.beginPath(); c.ellipse(-r * 0.32, -r * 0.38, r * 0.22, r * 0.15, -0.6, 0, TAU); c.fill();
}

/** Shark Launcher: a stubby harpoon head, the launcher's own blue. */
function harpoonBolt(c: CanvasRenderingContext2D, r: number, t: number) {
  const paint = ZIP_ROUND.shark;
  const halo = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.6);
  halo.addColorStop(0, 'rgba(95,190,255,0.5)');
  halo.addColorStop(1, 'rgba(95,190,255,0)');
  c.fillStyle = halo;
  c.beginPath(); c.arc(0, 0, r * 2.6, 0, TAU); c.fill();
  // The launcher's trail: air bubbles streaming behind the harpoon.
  c.fillStyle = 'rgba(190,240,255,0.5)';
  for (let i = 0; i < 3; i++) {
    const u = (t * 0.9 + i / 3) % 1;
    c.beginPath();
    c.arc(Math.sin(i * 2 + t * 3) * r * 0.55, r * (0.9 + u * 2.6), r * (0.1 + u * 0.2), 0, TAU);
    c.fill();
  }
  c.fillStyle = paint.deep;
  c.beginPath();
  c.moveTo(0, -r * 1.5); c.lineTo(r * 0.55, -r * 0.1);
  c.lineTo(0, r * 1.4); c.lineTo(-r * 0.55, -r * 0.1);
  c.closePath(); c.fill();
  c.fillStyle = paint.hot;
  c.beginPath();
  c.moveTo(0, -r * 1.5); c.lineTo(r * 0.55, -r * 0.1); c.lineTo(0, r * 0.15);
  c.closePath(); c.fill();
  c.fillStyle = paint.core;
  c.beginPath(); c.moveTo(0, -r * 1.2); c.lineTo(r * 0.2, -r * 0.2); c.lineTo(0, r * 0.4); c.closePath(); c.fill();
  // Barbed fins, in the hull's own blue rather than a hard white line.
  c.fillStyle = paint.hot;
  const fin = r * (0.62 + 0.06 * Math.sin(t * 6));
  c.beginPath();
  c.moveTo(0, r * 0.45); c.lineTo(-fin, r * 0.95); c.lineTo(0, r * 0.82);
  c.lineTo(fin, r * 0.95);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(240,252,255,0.55)';
  c.lineWidth = 0.9;
  c.stroke();
}

/** Martian Heat-Ray: a lime plasma mote with a hot white centre. */
function heatMote(c: CanvasRenderingContext2D, r: number, t: number, seed: number) {
  const paint = ZIP_ROUND.heat_ray;
  const pulse = 1 + 0.12 * Math.sin(t * 8 + seed * 2);
  const halo = c.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 3 * pulse);
  halo.addColorStop(0, 'rgba(214,255,138,0.7)');
  halo.addColorStop(0.45, 'rgba(141,255,59,0.35)');
  halo.addColorStop(1, 'rgba(141,255,59,0)');
  c.fillStyle = halo;
  c.beginPath(); c.arc(0, 0, r * 3 * pulse, 0, TAU); c.fill();
  c.fillStyle = paint.deep;
  c.beginPath(); c.arc(0, 0, r * 0.86 * pulse, 0, TAU); c.fill();
  c.fillStyle = paint.hot;
  c.beginPath(); c.arc(0, 0, r * 0.6 * pulse, 0, TAU); c.fill();
  c.fillStyle = paint.core;
  c.beginPath(); c.arc(-r * 0.12, -r * 0.12, r * 0.26 * pulse, 0, TAU); c.fill();
}

/**
 * The zip's round, drawn tip-up like every other projectile sprite: the round
 * points along the flight and wears the colour of the gun that fired it.
 */
export function drawZipCrystalRound(
  c: CanvasRenderingContext2D,
  len: number,
  t: number,
  seed = 0,
  flash = 0,
  embedded = false,
  id: string | null = 'diamond',
  /** The shot's paint colour, for the Paintball Gun's ball. */
  tint?: string,
): void {
  c.save();
  // The gem is authored ~46 px tall; every screen asks for its own round size.
  const r = Math.max(7, Math.min(16, len * 0.34));
  c.translate(0, r * 0.55);
  if (!embedded) c.rotate(Math.sin(t * 3 + seed) * 0.2);
  if (id === 'blaster') plasmaBolt(c, r, t, seed);
  else if (id === 'paintball') paintBall(c, r, tint ?? '');
  else if (id === 'shark') harpoonBolt(c, r, t);
  else if (id === 'heat_ray') heatMote(c, r, t, seed);
  // DIAMOND GUN fires the zip's big faceted crystal; slide 2 already paints it.
  else drawSlide2DiamondBullet(c, r, t, seed, flash);
  c.restore();
}
