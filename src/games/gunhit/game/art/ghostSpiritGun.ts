import { drawGlow } from './glowSprite';
import { shotPulse } from './commonGunMotion';

/** Hand centers in the gun's local coordinates at the instant a throw starts. */
export const GHOST_HAND_X = 47;
export const GHOST_HAND_Y = 82;
export type GhostHand = -1 | 1;

/** An expressive ghost, with no barrel, nozzle or muzzle on either skin. */
export function drawGhostSpiritGun(
  c: CanvasRenderingContext2D, cx: number, y0: number, time: number,
  sinceShot: number, side: GhostHand, alternateSkin: boolean,
) {
  const bob = Math.sin(time * 2.2) * 2;
  const swing = shotPulse(sinceShot, 0.4);
  const bodyY = y0 + bob;
  c.save();
  drawGlow(c, cx, bodyY + 90, 125, alternateSkin ? '#8effed' : '#94caff', 0.23);

  // Two independent arms pivot upward in turn as a shot leaves the hand.
  for (const hand of [-1, 1] as const) {
    const lift = hand === side ? swing : 0;
    const hx = cx + hand * (GHOST_HAND_X - lift * 6);
    const hy = bodyY + GHOST_HAND_Y - lift * 62 + Math.sin(time * 2.8 + hand) * 1.2;
    c.lineCap = 'round';
    c.strokeStyle = alternateSkin ? '#b9faf5' : '#c9e9ff'; c.lineWidth = 15;
    c.beginPath(); c.moveTo(cx + hand * 28, bodyY + 83);
    c.quadraticCurveTo(cx + hand * 53, bodyY + 95 - lift * 23, hx, hy); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.86)'; c.lineWidth = 8;
    c.beginPath(); c.moveTo(cx + hand * 29, bodyY + 81);
    c.quadraticCurveTo(cx + hand * 50, bodyY + 91 - lift * 23, hx, hy); c.stroke();
    c.fillStyle = '#f5ffff'; c.beginPath(); c.ellipse(hx, hy, 9, 10, hand * 0.3, 0, Math.PI * 2); c.fill();
    if (lift > 0.02) drawGlow(c, hx, hy, 30, '#efffff', lift * 0.4);
  }

  // Soft spectral sheet and three independently moving points, rather than a
  // pistol handle: its full silhouette stays visible at the bottom of the game.
  c.beginPath();
  c.moveTo(cx - 35, bodyY + 71);
  c.bezierCurveTo(cx - 35, bodyY + 6, cx + 35, bodyY + 6, cx + 35, bodyY + 71);
  c.lineTo(cx + 35, bodyY + 132);
  for (let i = 0; i < 4; i++) {
    const x0 = cx + 35 - i * 17.5, x1 = x0 - 17.5;
    const wave = Math.sin(time * 3.5 + i * 1.6) * 3;
    c.quadraticCurveTo((x0 + x1) / 2, bodyY + 147 + (i % 2 ? -5 : 8) + wave, x1, bodyY + 132);
  }
  c.closePath();
  const body = c.createRadialGradient(cx - 14, bodyY + 36, 3, cx, bodyY + 85, 83);
  body.addColorStop(0, '#ffffff'); body.addColorStop(0.52, alternateSkin ? '#e8fffb' : '#eef7ff');
  body.addColorStop(1, alternateSkin ? '#8ee3dc' : '#9ec8ec');
  c.fillStyle = body; c.fill();
  c.strokeStyle = alternateSkin ? 'rgba(92,233,222,0.85)' : 'rgba(115,191,240,0.8)';
  c.lineWidth = 1.8; c.stroke();
  if (alternateSkin) {
    // The second skin remains its own cooler, ornamented spirit silhouette.
    c.strokeStyle = 'rgba(117,255,244,0.58)'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(cx, bodyY + 25, 22, 4, -0.08, 0, Math.PI * 2); c.stroke();
    for (const hand of [-1, 1] as const) {
      c.fillStyle = 'rgba(178,255,248,0.8)'; c.beginPath();
      c.arc(cx + hand * 27, bodyY + 110, 2.5, 0, Math.PI * 2); c.fill();
    }
  }

  // Curious face, with a little shine in each eye.
  for (const hand of [-1, 1] as const) {
    c.fillStyle = '#102c3b'; c.beginPath(); c.ellipse(cx + hand * 12, bodyY + 61, 5.5, 8.5, hand * 0.07, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx + hand * 12 - 1.5, bodyY + 57, 1.7, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = '#193346'; c.beginPath();
  c.ellipse(cx, bodyY + 82, 4.7, 6 + swing * 2, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(255,175,205,0.24)';
  for (const hand of [-1, 1] as const) { c.beginPath(); c.ellipse(cx + hand * 21, bodyY + 78, 5, 3, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
