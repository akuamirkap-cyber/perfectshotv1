import type { WeaponId } from '../weapons';
import { TAU, rand, gunState } from './kit';
import { drawGlow } from './glowSprite';

type C = CanvasRenderingContext2D;

const ACID = { core: '#f4ff9a', glow: '#b6ff1a', deep: '#3f8a00' };
const AIR = { core: '#ffffff', glow: '#9fdcff', deep: '#1b8fe6' };
const PLASMA = { core: '#ffffff', glow: '#6fd3ff', deep: '#1a5cff', hot: '#dff6ff', laser: '#ff1e1e' };
const DORA = { blue: '#1ca0e8', blueDark: '#0f6fb0', red: '#e5322d', yellow: '#ffd23a' };

function clamp(v: number, a = 0, b = 1) { return Math.max(a, Math.min(b, v)); }
function hexRgb(h: string) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(h: string, a: number) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }

// Soft bloom (slide 7 glowSprite). A plain filled arc here produced the hard
// "solid circle" disc that appeared behind the Xenomorph Acid Spitter.
function glowAt(c: C, x: number, y: number, r: number, color: string, a: number) {
  drawGlow(c, x, y, r, color, a);
}

function sinceShot(max: number) { return Math.max(0, 1 - gunState.sinceShot / max); }

// ============================================================ XENOMORPH HEAD
// Side profile: dome extends upward from throat, hoses extend downward.
// Muzzle = throat/mouth center. Ported 100% from game-3 drawHead().
export function xenoHeadGun(c: C, cx: number, y0: number, t: number) {
  const recoil = gunState.sinceShot < 0.25 ? Math.sin(gunState.sinceShot / 0.25 * Math.PI) : 0;
  const glow = sinceShot(0.4);
  const jaw = sinceShot(0.3);

  c.save();
  c.translate(cx - 32, y0 + 74 + recoil * 10);
  const open = 0.5 + 0.32 * Math.pow(jaw, 0.7);
  const ext = 14 + 66 * Math.pow(jaw, 0.6);
  const breath = Math.sin(t * 1.4);
  const H = { x: 32, y: 16 };
  const UT = { x: 12, y: -104 };
  const base = Math.atan2(UT.y - H.y, UT.x - H.x);
  const ja = base + open;
  const bis = base + open / 2;
  const JL = 126;
  const LT = { x: H.x + Math.cos(ja) * JL, y: H.y + Math.sin(ja) * JL };

  // green light cone above mouth
  if (glow > 0.02) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    const cone = c.createLinearGradient(0, -60, 0, -360);
    cone.addColorStop(0, rgba('#9dff1a', 0.35 * glow));
    cone.addColorStop(1, rgba('#9dff1a', 0));
    c.fillStyle = cone;
    c.beginPath(); c.moveTo(14, -60); c.lineTo(50, -60); c.lineTo(70, -360); c.lineTo(-6, -360); c.closePath(); c.fill();
    c.restore();
  }

  // Hoses now root INSIDE the neck and only emerge from its sides, so they read
  // as part of the creature instead of floating in mid-air.
  c.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    // Both ends tuck BEHIND the skull/neck (drawn afterwards), so the hoses read
    // as hydraulic lines plugged into the creature — never as dangling tubes.
    const sx = 6 + i * 8, sy = 188 + i * 11;
    const ex = 22 + i * 5, ey = 266 + i * 7;
    const path = () => {
      c.beginPath();
      c.moveTo(sx, sy);
      c.bezierCurveTo(sx + 44 + i * 4, sy + 30, ex + 36 + i * 5, ey - 36, ex, ey);
    };
    path(); c.strokeStyle = '#04060a'; c.lineWidth = 10; c.stroke();
    path(); c.strokeStyle = '#1a222d'; c.lineWidth = 6; c.stroke();
    path(); c.strokeStyle = 'rgba(150,175,210,0.28)'; c.lineWidth = 1.5; c.stroke();
  }

  // Tapering ribbed neck: ONE closed silhouette that continues the skull, so the
  // back no longer ends in a flat cut with a stack of pancake rings below it.
  const neckPath = () => {
    c.beginPath();
    c.moveTo(-52, 206);
    c.bezierCurveTo(-48, 258, -40, 298, -27, 326);
    c.bezierCurveTo(-19, 344, 13, 346, 23, 328);
    c.bezierCurveTo(36, 300, 47, 258, 52, 206);
    c.closePath();
  };
  const neckG = c.createLinearGradient(-54, 0, 54, 0);
  neckG.addColorStop(0, '#04060a'); neckG.addColorStop(0.24, '#161d27');
  neckG.addColorStop(0.48, '#3d4a60'); neckG.addColorStop(0.72, '#141a23'); neckG.addColorStop(1, '#04060a');
  neckPath(); c.fillStyle = neckG; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.85)'; c.lineWidth = 1.6; c.stroke();
  c.save(); neckPath(); c.clip();
  for (let i = 0; i < 7; i++) {
    const y = 214 + i * 17;
    c.beginPath(); c.moveTo(-64, y); c.quadraticCurveTo(0, y + 13, 64, y);
    c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 2.6; c.stroke();
    c.beginPath(); c.moveTo(-64, y - 3); c.quadraticCurveTo(0, y + 9, 64, y - 3);
    c.strokeStyle = 'rgba(165,195,235,0.2)'; c.lineWidth = 1.2; c.stroke();
  }
  c.fillStyle = 'rgba(190,215,245,0.13)';
  c.beginPath(); c.ellipse(-18, 274, 7, 48, 0.04, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.16)';
  c.beginPath(); c.ellipse(-24, 232, 3, 26, 0.1, 0, TAU); c.fill();
  c.restore();

  // dome / cranium
  const domePath = () => {
    c.beginPath();
    c.moveTo(-56, 232);
    c.bezierCurveTo(-80, 130, -74, 20, -48, -56);
    c.bezierCurveTo(-38, -88, -22, -108, -4, -113);
    c.bezierCurveTo(6, -116, 15, -112, UT.x, UT.y);
    c.quadraticCurveTo(16, -40, 26, 10);
    c.bezierCurveTo(42, 60, 54, 140, 52, 232);
    // Rounded lower edge that flows into the neck (was a flat horizontal cut).
    c.bezierCurveTo(32, 252, -34, 252, -56, 232);
    c.closePath();
  };
  const dome = c.createLinearGradient(-76, 0, 54, 0);
  dome.addColorStop(0, '#03040a'); dome.addColorStop(0.28, '#131922'); dome.addColorStop(0.5, '#46536c');
  dome.addColorStop(0.64, '#19202b'); dome.addColorStop(1, '#04060a');
  domePath(); c.fillStyle = dome; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.9)'; c.lineWidth = 1.5; c.stroke();
  c.save(); domePath(); c.clip();
  for (let i = 0; i < 9; i++) {
    const y = 88 + i * 17;
    c.beginPath(); c.moveTo(-80, y); c.quadraticCurveTo(-12, y - 12, 60, y + 4);
    c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 2.2; c.stroke();
    c.beginPath(); c.moveTo(-80, y - 2); c.quadraticCurveTo(-12, y - 14, 60, y + 2);
    c.strokeStyle = 'rgba(160,185,220,0.2)'; c.lineWidth = 1.2; c.stroke();
  }
  c.fillStyle = 'rgba(190,210,240,0.13)';
  c.beginPath(); c.ellipse(-20, 40, 9, 120, 0.08, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.22)';
  c.beginPath(); c.ellipse(-26, -40, 3.5, 40, 0.12, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(-54, 200); c.bezierCurveTo(-76, 120, -70, 20, -44, -56);
  c.strokeStyle = 'rgba(170,200,240,0.3)'; c.lineWidth = 2; c.stroke();
  c.restore();

  // mouth interior
  const mouthPath = () => { c.beginPath(); c.moveTo(H.x - 4, H.y); c.lineTo(UT.x, UT.y); c.lineTo(LT.x, LT.y); c.closePath(); };
  mouthPath(); c.fillStyle = '#0b0507'; c.fill();
  c.save(); mouthPath(); c.clip();
  const mg = c.createRadialGradient(H.x, H.y - 20, 0, H.x, H.y - 20, 150);
  mg.addColorStop(0, rgba('#c8ff3a', 0.75)); mg.addColorStop(0.45, rgba('#5fbf00', 0.35)); mg.addColorStop(1, rgba('#1a4a00', 0));
  c.fillStyle = mg; c.fillRect(-40, -260, 260, 300);
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2;
  for (let i = 1; i < 6; i++) { c.beginPath(); c.arc(H.x, H.y, i * 16, base - 0.2, ja + 0.2); c.stroke(); }
  c.restore();
  c.globalCompositeOperation = 'lighter';
  glowAt(c, H.x + 6, H.y - 50, 60 + glow * 40, '#7dff00', 0.35 + glow * 0.6);
  c.globalCompositeOperation = 'source-over';

  // inner jaw
  c.save();
  c.translate(H.x + 2, H.y - 4);
  c.rotate(bis + Math.PI / 2);
  const ig = c.createLinearGradient(-8, 0, 8, 0);
  ig.addColorStop(0, '#15101a'); ig.addColorStop(0.5, '#4d3d4a'); ig.addColorStop(1, '#100b12');
  c.fillStyle = ig;
  c.beginPath(); c.roundRect(-7.5, -ext - 2, 15, ext + 24, 6); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.7)'; c.lineWidth = 1; c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.1)';
  for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-6, -ext + 6 + i * 9); c.lineTo(6, -ext + 6 + i * 9); c.stroke(); }
  c.fillStyle = 'rgba(200,255,80,0.35)'; c.fillRect(-1.2, -ext, 2.4, ext + 10);
  c.fillStyle = '#2a1a22'; c.beginPath(); c.roundRect(-10, -ext - 12, 20, 12, 4); c.fill();
  c.fillStyle = '#eef1f6';
  for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * 2.7 - 1.1, -ext - 12); c.lineTo(i * 2.7, -ext - 19); c.lineTo(i * 2.7 + 1.1, -ext - 12); c.fill(); }
  c.globalCompositeOperation = 'lighter';
  glowAt(c, 0, -ext - 14, 14, ACID.glow, 0.5 + glow * 0.5);
  c.globalCompositeOperation = 'source-over';
  c.restore();

  // upper teeth
  const ux = UT.x - (H.x - 6), uy = UT.y - (H.y - 6);
  const ul = Math.hypot(ux, uy);
  const udx = ux / ul, udy = uy / ul;
  const unx = -udy, uny = udx;
  const upperTips: { x: number; y: number }[] = [];
  c.strokeStyle = '#1c1216'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(H.x - 6, H.y - 6); c.lineTo(UT.x, UT.y); c.stroke();
  for (let i = 0; i < 11; i++) {
    const k = 0.06 + (i / 11) * 0.9;
    const bx = (H.x - 6) + udx * ul * k, by = (H.y - 6) + udy * ul * k;
    const len = 8 + Math.sin(i * 1.4) * 2.5 + (i > 7 ? 3 : 0);
    const tip = { x: bx + unx * len + udx * 2, y: by + uny * len + udy * 2 };
    upperTips.push(tip);
    c.beginPath(); c.moveTo(bx - udx * 3, by - udy * 3); c.lineTo(tip.x, tip.y); c.lineTo(bx + udx * 3, by + udy * 3); c.closePath();
    c.fillStyle = '#eef1f6'; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.6; c.stroke();
  }

  // lower jaw
  const cj = Math.cos(ja), sj = Math.sin(ja);
  const lowerTips: { x: number; y: number }[] = [];
  c.save();
  c.translate(H.x, H.y);
  c.rotate(ja + Math.PI / 2);
  const lg = c.createLinearGradient(-14, 0, 16, 0);
  lg.addColorStop(0, '#0b0f15'); lg.addColorStop(0.42, '#3d4a5e'); lg.addColorStop(0.6, '#161c26'); lg.addColorStop(1, '#04060a');
  c.fillStyle = lg;
  c.beginPath();
  c.moveTo(-13, 8); c.lineTo(-10, -62); c.quadraticCurveTo(-8, -116, 0, -JL - 2);
  c.quadraticCurveTo(11, -116, 15, -62); c.lineTo(17, 8); c.closePath();
  c.fill(); c.strokeStyle = 'rgba(0,0,0,0.9)'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = 'rgba(190,210,240,0.14)'; c.beginPath(); c.ellipse(4, -60, 3, 48, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-12, -4 - i * 10); c.lineTo(16, -6 - i * 10); c.stroke(); }
  c.strokeStyle = '#1c1216'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-10, -4); c.lineTo(-6, -112); c.stroke();
  for (let i = 0; i < 11; i++) {
    const y = -12 - i * 9.2;
    const ex = -10 + (i / 11) * 3.5;
    const len = 8 + Math.cos(i * 1.2) * 2.5 + (i < 2 ? 4 : 0);
    c.beginPath(); c.moveTo(ex, y + 3); c.lineTo(ex - len, y - 1); c.lineTo(ex, y - 3); c.closePath();
    c.fillStyle = '#eef1f6'; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.6; c.stroke();
    const lx = ex - len, ly = y - 1;
    const cr = Math.cos(ja + Math.PI / 2), sr = Math.sin(ja + Math.PI / 2);
    lowerTips.push({ x: H.x + lx * cr - ly * sr, y: H.y + lx * sr + ly * cr });
  }
  c.restore();

  // acid strings
  c.lineCap = 'round';
  for (let i = 1; i < 10; i += 2) {
    const a = upperTips[i], b = lowerTips[Math.min(lowerTips.length - 1, i)];
    if (!a || !b) continue;
    const sag = 10 + i * 2 + Math.sin(t * 3 + i) * 3;
    const mx = (a.x + b.x) / 2, my = Math.max(a.y, b.y) + sag;
    c.strokeStyle = rgba('#c8ff3a', 0.6); c.lineWidth = 1 + (i % 3) * 0.4;
    c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(mx, my, b.x, b.y); c.stroke();
    c.globalCompositeOperation = 'lighter';
    glowAt(c, mx, my - sag * 0.3, 6, '#b6ff1a', 0.55);
    c.globalCompositeOperation = 'source-over';
  }
  const ijTip = { x: H.x + 2 + Math.cos(bis) * (ext + 12), y: H.y - 4 + Math.sin(bis) * (ext + 12) };
  for (let i = 2; i < 8; i += 2) {
    const b = lowerTips[i];
    c.strokeStyle = rgba('#d8ff5a', 0.5); c.lineWidth = 1;
    c.beginPath(); c.moveTo(ijTip.x, ijTip.y); c.quadraticCurveTo((ijTip.x + b.x) / 2, Math.max(ijTip.y, b.y) + 8, b.x, b.y); c.stroke();
  }

  // drool
  c.globalCompositeOperation = 'lighter';
  const dr = (t * 0.7) % 1;
  glowAt(c, LT.x - 4, LT.y + 10 + dr * 46, 5, '#b6ff1a', 1 - dr);
  glowAt(c, UT.x + 8, UT.y + 12 + ((t * 0.55 + 0.4) % 1) * 46, 4, '#b6ff1a', 0.7);
  glowAt(c, H.x + cj * 60, H.y + sj * 60, 30, '#7dff00', 0.18 + breath * 0.04);
  c.globalCompositeOperation = 'source-over';
  c.restore();
}

// ============================================================ DORAEMON AIR CANNON
// Barrel extends upward from muzzle, mechanical arm holds from below.
// Ported 100% from game-3 drawCannon().
export function doraCannonGun(c: C, cx: number, y0: number, t: number) {
  const recoil = gunState.sinceShot < 0.25 ? Math.sin(gunState.sinceShot / 0.25 * Math.PI) : 0;
  const rc = recoil;
  const glow = sinceShot(0.4);

  c.save();
  c.translate(cx, y0 + 80 + rc * 26);
  const W = 34;
  const L = 150;
  const muzzleRy = 13;

  // Only the cannon itself: the robot arm that used to hold it read as a hand
  // and was cropped in every thumbnail, so it is gone. The breech is now a
  // rounded cap that belongs to the barrel instead of a separate limb.
  c.lineCap = 'round';
  const breech = c.createLinearGradient(-W, 0, W, 0);
  breech.addColorStop(0, '#05070a'); breech.addColorStop(0.24, '#2a2f38');
  breech.addColorStop(0.46, '#5d6472'); breech.addColorStop(0.62, '#343945');
  breech.addColorStop(1, '#05070a');
  c.fillStyle = breech;
  c.beginPath();
  c.moveTo(-W, -2);
  c.quadraticCurveTo(-W - 2, 16, -14, 20);
  c.quadraticCurveTo(0, 23, 14, 20);
  c.quadraticCurveTo(W + 2, 16, W, -2);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.6; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.14)';
  c.beginPath(); c.ellipse(-W * 0.32, 8, 3.4, 9, 0.2, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-W + 3, 12); c.quadraticCurveTo(0, 17, W - 3, 12); c.stroke();

  // barrel body
  const body = c.createLinearGradient(-W, 0, W, 0);
  body.addColorStop(0, '#0a0b0e'); body.addColorStop(0.22, '#2a2d34'); body.addColorStop(0.42, '#5b6170');
  body.addColorStop(0.5, '#6f7685'); body.addColorStop(0.62, '#3a3e48'); body.addColorStop(1, '#07080a');
  c.fillStyle = body;
  c.beginPath(); c.rect(-W, -L, W * 2, L); c.fill();
  c.beginPath(); c.ellipse(0, 0, W + 3, muzzleRy + 1, 0, 0, Math.PI); c.fillStyle = '#15171c'; c.fill();
  c.beginPath(); c.ellipse(0, 0, W + 3, muzzleRy + 1, 0, 0, TAU); c.strokeStyle = '#0a0b0e'; c.lineWidth = 3; c.stroke();
  const band = (y: number, h: number) => {
    const g = c.createLinearGradient(-W, 0, W, 0);
    g.addColorStop(0, '#050608'); g.addColorStop(0.45, '#8a909c'); g.addColorStop(0.55, '#a0a6b2'); g.addColorStop(1, '#050608');
    c.fillStyle = g; c.fillRect(-W - 3, y, W * 2 + 6, h);
    c.beginPath(); c.ellipse(0, y, W + 3, muzzleRy, 0, Math.PI, TAU); c.fillStyle = '#2b2f37'; c.fill();
    c.beginPath(); c.ellipse(0, y + h, W + 3, muzzleRy, 0, 0, Math.PI); c.fillStyle = '#0b0c10'; c.fill();
  };
  band(-26, 8);
  band(-L + 22, 10);
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(-W * 0.2, -L + 4, 5, L - 8);
  c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(W * 0.35, -L + 4, 3, L - 8);

  // muzzle
  const my = -L;
  const flare = c.createLinearGradient(-W - 6, 0, W + 6, 0);
  flare.addColorStop(0, '#0a0b0e'); flare.addColorStop(0.4, '#6c7280'); flare.addColorStop(0.55, '#8c93a0'); flare.addColorStop(1, '#0a0b0e');
  c.fillStyle = flare;
  c.beginPath(); c.moveTo(-W, my + 14); c.lineTo(-W - 6, my); c.lineTo(W + 6, my); c.lineTo(W, my + 14); c.closePath(); c.fill();
  const rim = c.createLinearGradient(-W - 6, 0, W + 6, 0);
  rim.addColorStop(0, '#2a2d34'); rim.addColorStop(0.5, '#c9ced8'); rim.addColorStop(1, '#2a2d34');
  c.beginPath(); c.ellipse(0, my, W + 6, muzzleRy + 2, 0, 0, TAU); c.fillStyle = rim; c.fill();
  const bore = c.createRadialGradient(0, my + 2, 2, 0, my, W);
  bore.addColorStop(0, '#000000'); bore.addColorStop(0.7, '#0c0d11'); bore.addColorStop(1, '#2a2d34');
  c.beginPath(); c.ellipse(0, my, W, muzzleRy - 1, 0, 0, TAU); c.fillStyle = bore; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.1)'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(0, my + 1, W * 0.7, (muzzleRy - 1) * 0.7, 0, 0, TAU); c.stroke();
  c.beginPath(); c.ellipse(0, my + 2, W * 0.4, (muzzleRy - 1) * 0.4, 0, 0, TAU); c.stroke();
  c.fillStyle = '#1c1f26'; c.beginPath(); c.roundRect(-4, my + 8, 8, 12, 1.5); c.fill();
  c.fillStyle = '#9aa1ad'; c.fillRect(-1.2, my + 9, 2.4, 6);
  // air shimmer
  c.globalCompositeOperation = 'lighter';
  const e = 0.2 + glow * 0.9;
  glowAt(c, 0, my, 40 + glow * 40, AIR.glow, e * 0.6);
  glowAt(c, 0, my, 14, '#ffffff', e * 0.8);
  if (rc > 0.1) glowAt(c, 0, my - 10, 60 * rc, '#ffffff', rc * 0.35);
  c.globalCompositeOperation = 'source-over';
  c.restore();
}

// ============================================================ PREDATOR PLASMA CASTER
// Heavy shoulder mount with tri-laser targeting pod, plasma core at muzzle.
// Ported 100% from game-3 drawCaster(). charge = 0..1 charge level.
export function predCasterGun(c: C, cx: number, y0: number, t: number, charge: number, servo: number, heat: number) {
  const rc = gunState.sinceShot < 0.25 ? Math.sin(gunState.sinceShot / 0.25 * Math.PI) : 0;
  const ch = clamp(charge);
  const sv = servo;

  c.save();
  c.translate(cx, y0 - 60 + rc * 14);

  const metal = (x0: number, x1: number, tone = 0) => {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    if (tone === 1) { g.addColorStop(0, '#0d1014'); g.addColorStop(0.4, '#363d47'); g.addColorStop(0.55, '#454d58'); g.addColorStop(1, '#0a0c10'); }
    else if (tone === 2) { g.addColorStop(0, '#2a2f37'); g.addColorStop(0.5, '#6b747f'); g.addColorStop(1, '#1a1e24'); }
    else { g.addColorStop(0, '#171b21'); g.addColorStop(0.16, '#525a66'); g.addColorStop(0.4, '#bfc7d0'); g.addColorStop(0.52, '#e9edf2'); g.addColorStop(0.72, '#737c88'); g.addColorStop(1, '#101316'); }
    return g;
  };
  const edge = (a = 0.9, w = 1.5) => { c.strokeStyle = `rgba(0,0,0,${a})`; c.lineWidth = w; c.stroke(); };
  const poly = (pts: number[][], fill: CanvasGradient | string) => {
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fillStyle = fill; c.fill(); edge();
  };
  const seg = (y0s: number, y1s: number, hw: number, r = 3, tone = 0) => {
    c.beginPath(); c.roundRect(-hw, y0s, hw * 2, y1s - y0s, r); c.fillStyle = metal(-hw, hw, tone); c.fill(); edge();
  };
  const groove = (y: number, hw: number, x = 0) => {
    c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - hw, y); c.lineTo(x + hw, y); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - hw + 2, y + 2); c.lineTo(x + hw - 2, y + 2); c.stroke();
  };
  const rivet = (x: number, y: number, r = 2.4) => {
    const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 0, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#8c949e'); g.addColorStop(1, '#1f2328');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  };
  const hexBolt = (x: number, y: number, r: number) => {
    c.beginPath(); for (let k = 0; k < 6; k++) { const an = (k / 6) * TAU; k ? c.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r) : c.moveTo(x + r, y); } c.closePath();
    c.fillStyle = metal(x - r, x + r, 2); c.fill(); edge(0.8, 1);
    c.beginPath(); c.arc(x, y, r * 0.4, 0, TAU); c.fillStyle = '#0c0e12'; c.fill();
  };
  const vents = (x: number, y: number, n: number, w: number, h: number, gap: number, glow: number) => {
    for (let i = 0; i < n; i++) {
      c.fillStyle = '#04060a'; c.beginPath(); c.roundRect(x + i * (w + gap), y, w, h, 1.5); c.fill();
      if (glow > 0.02) { c.globalCompositeOperation = 'lighter'; glowAt(c, x + i * (w + gap) + w / 2, y + h / 2, h * 0.7, '#ff8030', glow); c.globalCompositeOperation = 'source-over'; }
    }
  };

  // shoulder armor plate
  poly([[-100, 300], [-84, 250], [-40, 236], [40, 236], [84, 250], [100, 300]], metal(-100, 100));
  poly([[-66, 300], [-56, 262], [56, 262], [66, 300]], metal(-66, 66, 1));
  c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 1;
  for (let r = 0; r < 3; r++) for (let i = -4; i <= 4; i++) {
    const hx = i * 12 + (r % 2) * 6, hy = 272 + r * 10.5;
    c.beginPath(); for (let k = 0; k < 6; k++) { const an = (k / 6) * TAU + 0.52; k ? c.lineTo(hx + Math.cos(an) * 5.2, hy + Math.sin(an) * 5.2) : c.moveTo(hx + Math.cos(an) * 5.2, hy + Math.sin(an) * 5.2); } c.closePath(); c.stroke();
  }
  [-88, -50, 50, 88].forEach((x) => hexBolt(x, 250, 4));
  seg(214, 240, 34, 5, 1);
  groove(222, 34); rivet(-26, 232); rivet(26, 232);
  // servo ring
  c.save(); c.translate(0, 214);
  const dg = c.createRadialGradient(-6, -6, 2, 0, 0, 24);
  dg.addColorStop(0, '#d6dce3'); dg.addColorStop(0.6, '#5c646f'); dg.addColorStop(1, '#1b1e24');
  c.beginPath(); c.arc(0, 0, 24, 0, TAU); c.fillStyle = dg; c.fill(); edge();
  c.save(); c.rotate(sv * 1.2 + rc * 0.8 + t * 0.15 * sv);
  c.fillStyle = '#272c34';
  for (let i = 0; i < 14; i++) { c.save(); c.rotate((i / 14) * TAU); c.fillRect(19, -3, 7, 6); c.restore(); }
  c.restore();
  c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fillStyle = '#121519'; c.fill();
  c.globalCompositeOperation = 'lighter';
  glowAt(c, 16, -14, 7, PLASMA.laser, 0.6 + 0.4 * Math.sin(t * (sv > 0.6 ? 20 : 4)));
  c.globalCompositeOperation = 'source-over';
  c.restore();

  const lift = -sv * 6 + rc * 8;
  // riser arm + hydraulic piston
  poly([[-16, 216], [-13, 176 + lift], [13, 176 + lift], [16, 216]], metal(-16, 16));
  groove(200, 14);
  c.beginPath(); c.moveTo(26, 218); c.lineTo(22, 184 + lift); c.strokeStyle = '#0b0d10'; c.lineWidth = 14; c.stroke();
  c.beginPath(); c.moveTo(26, 218); c.lineTo(22, 184 + lift); c.strokeStyle = metal(16, 32); c.lineWidth = 10; c.stroke();
  c.beginPath(); c.moveTo(24, 204 + rc * 3); c.lineTo(22, 184 + lift); c.strokeStyle = '#eef1f5'; c.lineWidth = 5; c.stroke();
  // yoke plates
  for (const sx of [-1, 1]) {
    poly([[sx * 46, 118 + lift], [sx * 36, 108 + lift], [sx * 30, 176 + lift], [sx * 14, 180 + lift], [sx * 48, 176 + lift]], metal(sx * 48, sx * 14, 2));
  }
  // cables
  c.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const sx = -22 - i * 4, ex = -50 - i * 8;
    const p = () => { c.beginPath(); c.moveTo(sx, 170 + lift); c.bezierCurveTo(sx - 22, 196, ex - 4, 212, ex, 262); };
    p(); c.strokeStyle = '#06080a'; c.lineWidth = 8; c.stroke();
    p(); c.strokeStyle = i === 1 ? '#6a1a1a' : i === 3 ? '#1e2a3a' : '#262b33'; c.lineWidth = 5; c.stroke();
    p(); c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1.2; c.stroke();
  }

  // cannon body
  c.save();
  c.translate(0, lift);
  c.rotate(Math.sin(t * 0.9) * 0.008 * sv);

  // rear exhaust block
  seg(176, 196, 26, 4, 1);
  vents(-20, 179, 5, 6, 14, 2.5, heat * 0.9);

  // receiver
  poly([[-36, 104], [-40, 118], [-40, 170], [-32, 178], [32, 178], [40, 170], [40, 118], [36, 104]], metal(-40, 40));
  poly([[-40, 118], [-28, 118], [-28, 170], [-32, 178], [-40, 170]], 'rgba(0,0,0,0.28)');
  poly([[28, 118], [40, 118], [40, 170], [32, 178], [28, 170]], 'rgba(255,255,255,0.08)');
  groove(112, 36); groove(170, 32);
  [-34, 34].forEach((x) => { rivet(x, 124); rivet(x, 164); });
  // side drum
  c.save(); c.translate(-6, 142);
  const pg = c.createRadialGradient(-10, -10, 2, 0, 0, 30);
  pg.addColorStop(0, '#f2f4f7'); pg.addColorStop(0.35, '#aab2bc'); pg.addColorStop(0.75, '#555d68'); pg.addColorStop(1, '#1a1e24');
  c.beginPath(); c.arc(0, 0, 30, 0, TAU); c.fillStyle = pg; c.fill(); edge();
  c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1.5;
  [25, 18, 11].forEach((r) => { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); });
  c.strokeStyle = 'rgba(255,255,255,0.22)'; c.lineWidth = 1;
  [24, 17].forEach((r) => { c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); });
  for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU; rivet(Math.cos(an) * 21.5, Math.sin(an) * 21.5, 2); }
  c.save(); c.rotate(t * (0.4 + ch * 6) * (0.3 + sv));
  c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 2.6;
  for (let i = 0; i < 3; i++) { c.save(); c.rotate((i / 3) * TAU); c.beginPath(); c.moveTo(0, -5); c.lineTo(0, -15); c.stroke(); c.restore(); }
  c.restore();
  c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fillStyle = '#090b0e'; c.fill();
  c.globalCompositeOperation = 'lighter';
  glowAt(c, 0, 0, 10 + ch * 10, PLASMA.glow, 0.5 + ch * 0.5);
  glowAt(c, 0, 0, 3.5, '#ffffff', 0.6 + ch * 0.4);
  c.globalCompositeOperation = 'source-over';
  c.restore();
  // capacitor cylinder
  c.beginPath(); c.roundRect(26, 98, 18, 70, 6); c.fillStyle = metal(26, 44); c.fill(); edge();
  [110, 126, 142, 158].forEach((y) => groove(y, 8, 35));
  c.beginPath(); c.ellipse(35, 98, 9, 4, 0, Math.PI, TAU); c.fillStyle = '#aab2bc'; c.fill(); edge();

  // cooling fin stack
  seg(70, 104, 20, 2, 1);
  for (let i = 0; i < 7; i++) { c.beginPath(); c.roundRect(-30, 72 + i * 4.6, 60, 2.8, 1); c.fillStyle = metal(-30, 30); c.fill(); }
  c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 1.2; c.strokeRect(-30, 71, 60, 33);

  // barrel shroud
  poly([[-24, 10], [-24, 72], [24, 72], [24, 10]], metal(-24, 24));
  poly([[-24, 10], [-14, 10], [-14, 72], [-24, 72]], 'rgba(0,0,0,0.3)');
  poly([[14, 10], [24, 10], [24, 72], [14, 72]], 'rgba(255,255,255,0.06)');
  [24, 38, 52].forEach((y) => groove(y, 24));
  for (let i = 0; i < 3; i++) {
    c.fillStyle = '#04060a'; c.beginPath(); c.roundRect(-5, 14 + i * 14, 10, 8, 2); c.fill();
    c.globalCompositeOperation = 'lighter';
    glowAt(c, 0, 18 + i * 14, 8, PLASMA.glow, 0.35 + ch * 0.6 + (0.2 * Math.sin(t * 6 + i)) * ch);
    c.globalCompositeOperation = 'source-over';
  }
  // side rails
  for (const sx of [-1, 1]) {
    c.beginPath(); c.roundRect(sx * 30 - 4, 16, 8, 50, 2); c.fillStyle = metal(sx * 30 - 4, sx * 30 + 4, 2); c.fill(); edge();
    for (let y = 22; y < 62; y += 10) { c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(sx * 30 - 2.5, y, 5, 2); }
  }

  // muzzle
  poly([[-24, 12], [-30, 2], [30, 2], [24, 12]], metal(-30, 30));
  c.beginPath(); c.ellipse(0, 2, 30, 11, 0, 0, TAU); c.fillStyle = metal(-30, 30); c.fill(); edge();
  c.fillStyle = '#1a1e24';
  for (let i = 0; i < 10; i++) { const an = (i / 10) * TAU; c.beginPath(); c.arc(Math.cos(an) * 27, 2 + Math.sin(an) * 9.5, 2.2, 0, TAU); c.fill(); }
  c.beginPath(); c.ellipse(0, 2, 20, 7.5, 0, 0, TAU); c.fillStyle = '#2a2f37'; c.fill(); edge(0.8, 1);
  const bore = c.createRadialGradient(0, 3, 1, 0, 2, 17);
  bore.addColorStop(0, '#000000'); bore.addColorStop(0.75, '#05070b'); bore.addColorStop(1, '#2a2f37');
  c.beginPath(); c.ellipse(0, 2, 17, 6.2, 0, 0, TAU); c.fillStyle = bore; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1;
  c.beginPath(); c.ellipse(0, 2.5, 11, 4, 0, 0, TAU); c.stroke();

  // tri-laser targeting pod
  c.beginPath(); c.roundRect(-36, 40, 12, 10, 2); c.fillStyle = metal(-36, -24, 1); c.fill(); edge();
  poly([[-66, 22], [-58, 16], [-36, 16], [-34, 24], [-34, 70], [-40, 78], [-62, 78], [-66, 70]], metal(-66, -34, 1));
  poly([[-66, 22], [-58, 16], [-58, 78], [-62, 78], [-66, 70]], 'rgba(0,0,0,0.3)');
  c.strokeStyle = 'rgba(0,0,0,0.65)'; c.lineWidth = 1.2;
  for (let y = 52; y < 74; y += 5) { c.beginPath(); c.moveTo(-62, y); c.lineTo(-38, y); c.stroke(); }
  rivet(-60, 28, 1.8); rivet(-40, 28, 1.8); rivet(-60, 46, 1.8); rivet(-40, 46, 1.8);
  // lens cowl
  poly([[-64, 16], [-60, 6], [-40, 6], [-36, 16]], metal(-64, -36, 2));
  c.beginPath(); c.roundRect(-60, 8, 20, 14, 3); c.fillStyle = '#160808'; c.fill(); edge(0.7, 1);
  const emit = [[-55, 17], [-45, 17], [-50, 11]];
  for (const [ex, ey] of emit) {
    c.beginPath(); c.arc(ex, ey, 2.8, 0, TAU); c.fillStyle = '#3a0000'; c.fill();
    c.globalCompositeOperation = 'lighter';
    glowAt(c, ex, ey, 8, PLASMA.laser, 0.9);
    glowAt(c, ex, ey, 2.4, '#ffffff', 0.9);
    c.globalCompositeOperation = 'source-over';
  }

  // coolant line
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const yy = 14 + ((i * 11 + (t * 70 * (0.3 + ch)) % 54) % 54);
    glowAt(c, 9, yy, 4, PLASMA.glow, 0.25 + ch * 0.6);
  }
  // plasma core at muzzle
  const coreY = -8;
  const idle = 0.5 + 0.5 * Math.sin(t * 3);
  const ee = 0.22 + idle * 0.1 + ch * 1.1;
  const flick = 1 + (ch > 0 ? Math.sin(t * 90) * 0.12 * ch : 0);
  glowAt(c, 0, coreY, (34 + ch * 80) * flick, PLASMA.deep, ee * 0.6);
  glowAt(c, 0, coreY, (18 + ch * 34) * flick, PLASMA.glow, ee);
  glowAt(c, 0, coreY, (7 + ch * 14) * flick, '#ffffff', Math.min(1, ee));
  if (ch > 0.15) {
    for (let i = 0; i < 4; i++) {
      if (Math.random() > ch * 0.9) continue;
      const a0 = rand(0, TAU);
      let x = Math.cos(a0) * 18, y = 2 + Math.sin(a0) * 7;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (0 - x) * 0.35 + rand(-5, 5); y += (coreY - y) * 0.35 + rand(-5, 5); c.lineTo(x, y); }
      c.lineTo(0, coreY);
      c.strokeStyle = rgba(PLASMA.glow, 0.6); c.lineWidth = 3; c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 1.2; c.stroke();
    }
    const rr = (1 - ((t * 2.5) % 1)) * 70 + 10;
    c.strokeStyle = rgba(PLASMA.glow, 0.5 * ch); c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(0, coreY, rr, rr * 0.45, 0, 0, TAU); c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
  c.restore();
  c.restore();
}

// ============================================================ dispatch
export function drawGunExtra5(c: C, id: WeaponId, cx: number, y0: number, t: number, _ready: boolean) {
  switch (id) {
    case 'xeno': xenoHeadGun(c, cx, y0, t); break;
    case 'dora': doraCannonGun(c, cx, y0, t); break;
    case 'pred': {
      // charge level from gunState if available, else 0
      const charge = gunState.charge || 0;
      predCasterGun(c, cx, y0, t, charge, 0, 0);
      break;
    }
    default: break;
  }
}

// ============================================================ muzzle flashes
export const FLASH5: Partial<Record<WeaponId, { k: 'energy'; rgb: string; r: number }>> = {
  xeno: { k: 'energy', rgb: '182,255,26', r: 55 },
  dora: { k: 'energy', rgb: '255,255,255', r: 60 },
  pred: { k: 'energy', rgb: '111,211,255', r: 65 },
};
