import { TAU, rand, lin, rr, grip, guard, glow, star, radial, chrome, steel, wood, gunState } from './kit';
import { shotPulse } from './commonGunMotion';
import { drawPlasmaGrip, drawVoidGrip } from './gripSystem';
import type { OriginalDesignWeapon } from './gunVariants';
import { drawSlide2DiamondMuzzleFormation } from '../diamondSlideFx';
import { slingshot as slingshotSlide1, blowgun as blowgunSlide1, shotgun as shotgunSlide1, soaker as soakerSlide1 } from './guns2';

// Pre-overhaul renderers are preserved from git HEAD (c0769f5).
// Only Moonbeam's original pistol grip is replaced by a continuous staff so
// All Moonbeam choices obey the 'wand, not gun' design constraint.
type C = CanvasRenderingContext2D;
const angledGrip = grip;
const triggerGuard = guard;
const glowDot = glow;
function jagged(c: C, x0: number, y0: number, x1: number, y1: number, amp: number, n = 6) {
  c.beginPath(); c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    c.lineTo(x0 + (x1 - x0) * k + rand(-amp, amp), y0 + (y1 - y0) * k + rand(-amp, amp));
  }
  c.lineTo(x1, y1); c.stroke();
}
const gold = (c: C, x0: number, x1: number) =>
  lin(c, x0, x1, ['#7a5800', '#ffe680', '#d9a825', '#7a5800']);

function originalCricket(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 7);
  // tiny grip
  c.beginPath();
  c.moveTo(cx + 3, y0 + 40);
  c.lineTo(cx + 3, y0 + 60);
  c.lineTo(cx + 24, y0 + 74);
  c.lineTo(cx + 31, y0 + 62);
  c.lineTo(cx + 14, y0 + 40);
  c.closePath();
  c.fillStyle = lin(c, cx, cx + 30, ['#1b1d22', '#3d424b']);
  c.fill();
  c.strokeStyle = '#08090b';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.arc(cx + 10, y0 + 42, 7, -Math.PI * 0.5, Math.PI * 0.5);
  c.strokeStyle = '#2a2e35';
  c.lineWidth = 2.5;
  c.stroke();
  // body
  c.beginPath();
  c.roundRect(cx - 11, y0 + 12, 22, 34, [4, 4, 8, 8]);
  c.fillStyle = chrome(c, cx - 11, cx + 11);
  c.fill();
  c.strokeStyle = '#2a2e35';
  c.lineWidth = 1.5;
  c.stroke();
  // ridges
  c.strokeStyle = 'rgba(0,0,0,0.45)';
  c.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx - 11, y0 + 20 + i * 6);
    c.lineTo(cx - 6, y0 + 20 + i * 6);
    c.moveTo(cx + 6, y0 + 20 + i * 6);
    c.lineTo(cx + 11, y0 + 20 + i * 6);
    c.stroke();
  }
  // hammer
  c.fillStyle = chrome(c, cx - 4, cx + 4);
  c.beginPath();
  c.roundRect(cx - 4, y0 + 44, 8, 8, 2);
  c.fill();
  // bulb emitter
  c.beginPath();
  c.arc(cx, y0 + 7, 10, 0, TAU);
  c.fillStyle = chrome(c, cx - 10, cx + 10);
  c.fill();
  c.strokeStyle = '#2a2e35';
  c.stroke();
  c.beginPath();
  c.arc(cx, y0 + 7, 6.5, 0, TAU);
  c.fillStyle = '#0d1a2b';
  c.fill();
  glowDot(c, cx, y0 + 7, 3.5 * pulse + 1, '#7cc8ff', 16);
  c.beginPath();
  c.arc(cx, y0 + 7, 8.5, 0, TAU);
  c.strokeStyle = 'rgba(124,200,255,0.6)';
  c.lineWidth = 1;
  c.stroke();
}

function originalElectro(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  angledGrip(c, cx, y0 + 108, '#1f2a33', '#3b4d5c', 0.85);
  triggerGuard(c, cx, y0 + 100);
  c.beginPath();
  c.roundRect(cx - 18, y0 + 40, 36, 92, 8);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#0f161d', '#465a6b', '#2b3a47', '#0f161d']);
  c.fill();
  c.strokeStyle = '#05080b';
  c.lineWidth = 2;
  c.stroke();
  // glass tube
  c.beginPath();
  c.roundRect(cx - 9, y0 + 50, 18, 72, 9);
  c.fillStyle = '#061520';
  c.fill();
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#5ad1ff';
  c.shadowBlur = 8;
  c.strokeStyle = '#9be8ff';
  c.lineWidth = 1.4;
  for (let i = 0; i < 2; i++) jagged(c, cx, y0 + 54, cx + rand(-4, 4), y0 + 118, 4, 7);
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.15)';
  c.fillRect(cx - 6, y0 + 54, 2, 64);
  // copper coils
  c.strokeStyle = '#c47a35';
  c.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(cx - 18, y0 + 50 + i * 8);
    c.lineTo(cx - 10, y0 + 52 + i * 8);
    c.moveTo(cx + 10, y0 + 52 + i * 8);
    c.lineTo(cx + 18, y0 + 50 + i * 8);
    c.stroke();
  }
  // electrodes
  for (const s of [-1, 1]) {
    c.fillStyle = steel(c, cx + s * 10 - 2, cx + s * 10 + 2);
    c.fillRect(cx + s * 10 - 2, y0 + 10, 4, 32);
    c.beginPath();
    c.arc(cx + s * 10, y0 + 10, 4.5, 0, TAU);
    c.fillStyle = '#e09a50';
    c.fill();
  }
  c.fillStyle = steel(c, cx - 2.5, cx + 2.5);
  c.fillRect(cx - 2.5, y0 + 2, 5, 40);
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(155,232,255,${0.6 + 0.4 * Math.sin(t * 30)})`;
  c.lineWidth = 1.5;
  jagged(c, cx - 10, y0 + 10, cx, y0 + 2, 3, 4);
  jagged(c, cx + 10, y0 + 10, cx, y0 + 2, 3, 4);
  c.restore();
  glowDot(c, cx, y0 + 1, 3.5, '#bff1ff', 16);
}

function originalFishGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  angledGrip(c, cx, y0 + 112, '#0d4a7a', '#1f7fc0', 0.85);
  triggerGuard(c, cx, y0 + 104, '#0b2f4d');
  // stock cap
  c.beginPath();
  c.roundRect(cx - 14, y0 + 112, 28, 30, 6);
  c.fillStyle = '#0d3a5e';
  c.fill();
  // tank
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 86, 14);
  const wg = c.createLinearGradient(0, y0 + 26, 0, y0 + 112);
  wg.addColorStop(0, 'rgba(140,225,255,0.75)');
  wg.addColorStop(1, 'rgba(30,120,200,0.85)');
  c.fillStyle = wg;
  c.fill();
  // swimming fish
  c.save();
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 86, 14);
  c.clip();
  const fx = cx + Math.sin(t * 2) * 10;
  const fy = y0 + 64 + Math.sin(t * 3) * 8;
  const dir = Math.cos(t * 2) > 0 ? 1 : -1;
  c.fillStyle = '#ff8a1c';
  c.beginPath();
  c.ellipse(fx, fy, 8, 5, 0, 0, TAU);
  c.fill();
  c.beginPath();
  c.moveTo(fx - dir * 7, fy);
  c.lineTo(fx - dir * 13, fy - 5);
  c.lineTo(fx - dir * 13, fy + 5);
  c.closePath();
  c.fill();
  c.fillStyle = '#fff';
  c.fillRect(fx - 1, fy - 5, 2, 10);
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(fx + dir * 4, fy - 1, 1.2, 0, TAU);
  c.fill();
  // bubbles
  c.strokeStyle = 'rgba(255,255,255,0.8)';
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const by = y0 + 110 - ((t * 30 + i * 19) % 84);
    const bx = cx - 12 + i * 6 + Math.sin(t * 4 + i) * 2;
    c.beginPath();
    c.arc(bx, by, 1.5 + (i % 2), 0, TAU);
    c.stroke();
  }
  // seaweed
  c.strokeStyle = '#2fbf5a';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 112);
  c.quadraticCurveTo(cx - 10 + Math.sin(t * 2) * 4, y0 + 96, cx - 15, y0 + 84);
  c.stroke();
  c.restore();
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 86, 14);
  c.strokeStyle = '#0b2f4d';
  c.lineWidth = 4;
  c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 17, y0 + 34, 3, 70);
  // bands
  c.fillStyle = '#ff8a1c';
  c.fillRect(cx - 24, y0 + 22, 48, 7);
  c.fillRect(cx - 24, y0 + 106, 48, 8);
  // funnel muzzle
  c.beginPath();
  c.moveTo(cx - 15, y0);
  c.lineTo(cx + 15, y0);
  c.lineTo(cx + 7, y0 + 23);
  c.lineTo(cx - 7, y0 + 23);
  c.closePath();
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#b85a00', '#ffb35a', '#c06000']);
  c.fill();
  c.strokeStyle = '#5a2a00';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0, 15, 3.5, 0, 0, TAU);
  c.fillStyle = '#1a4d7a';
  c.fill();
}

export function drawOriginalGun(c: C, id: OriginalDesignWeapon, cx: number, y0: number, t: number, ready = true) {
  switch (id) {
    case 'dragon': dragon(c, cx, y0, t); break;
    case 'rainbow': rainbowGun(c, cx, y0, t); break;
    case 'meteor': meteorGun(c, cx, y0, t); break;
    case 'diamond': diamondGun(c, cx, y0, t); break;
    case 'moonbeam': moonbeamGun(c, cx, y0, t); break;
    case 'golden': golden(c, cx, y0, t); break;
    case 'blackhole': blackhole(c, cx, y0, t); break;
    case 'plasma': plasma(c, cx, y0, t); break;
    case 'laser': laserGun(c, cx, y0, t); break;
    case 'chicken': chickenGun(c, cx, y0, t, ready); break;
    case 'honey': classicHoney(c, cx, y0, t); break;
    case 'cricket': originalCricket(c, cx, y0, t); break;
    case 'electro': originalElectro(c, cx, y0, t); break;
    case 'fish': originalFishGun(c, cx, y0, t); break;
    // SET 1 weapons of slide 7 only ever had one slide-1 look; it lives in
    // guns2 and is drawn here for the "Sebelumnya" card.
    case 'slingshot': slingshotSlide1(c, cx, y0, t, ready); break;
    case 'blowgun': blowgunSlide1(c, cx, y0, t); break;
    case 'shotgun': shotgunSlide1(c, cx, y0, t, ready); break;
    case 'soaker': soakerSlide1(c, cx, y0, t); break;
    default: { const _never: never = id; return _never; }
  }
}

function golden(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.25
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.25) : 0;

  // Helper for high-gloss cylindrical 24k gold gradients across [x0, x1]
  const cylGold = (x0: number, x1: number) => {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, '#6e3e05');
    g.addColorStop(0.16, '#eab026');
    g.addColorStop(0.32, '#fff9ce');
    g.addColorStop(0.46, '#ffe169');
    g.addColorStop(0.72, '#d88c16');
    g.addColorStop(0.9, '#8f5207');
    g.addColorStop(1, '#542d03');
    return g;
  };
  const darkMetal = (x0: number, y0p: number, x1: number, y1p: number) => {
    const g = c.createLinearGradient(x0, y0p, x1, y1p);
    g.addColorStop(0, '#12151b');
    g.addColorStop(0.28, '#555e70');
    g.addColorStop(0.55, '#272c35');
    g.addColorStop(1, '#0b0d11');
    return g;
  };

  // ══════════════════ 1. 3D ANGLED GOLD GRIP + CHECKERED PANEL + SILVER SCREW ══════════════════
  // Dark-bronze angled bottom baseplate (alas gagang 3D)
  c.beginPath();
  c.moveTo(cx + 42, y0 + 168);
  c.lineTo(cx + 62, y0 + 146);
  c.lineTo(cx + 66.5, y0 + 147.5);
  c.lineTo(cx + 65, y0 + 151.5);
  c.lineTo(cx + 45.5, y0 + 171);
  c.closePath();
  const baseG = c.createLinearGradient(cx + 42, y0 + 168, cx + 66, y0 + 148);
  baseG.addColorStop(0, '#1e1002');
  baseG.addColorStop(0.5, '#6b3e07');
  baseG.addColorStop(1, '#261402');
  c.fillStyle = baseG;
  c.fill();
  c.strokeStyle = 'rgba(42,22,4,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // 3D front/right side thickness face of the gold grip
  c.beginPath();
  c.moveTo(cx + 14, y0 + 96);
  c.lineTo(cx + 18.5, y0 + 96.5);
  c.lineTo(cx + 66.5, y0 + 147.5);
  c.lineTo(cx + 62, y0 + 146);
  c.closePath();
  const sideG = c.createLinearGradient(cx + 14, y0 + 96, cx + 66, y0 + 148);
  sideG.addColorStop(0, '#9a5b0a');
  sideG.addColorStop(0.4, '#ffd866');
  sideG.addColorStop(0.8, '#c77c12');
  sideG.addColorStop(1, '#7a4606');
  c.fillStyle = sideG;
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Main gold grip face
  c.beginPath();
  c.moveTo(cx - 2, y0 + 109);
  c.lineTo(cx + 14, y0 + 96);
  c.lineTo(cx + 62, y0 + 146);
  c.lineTo(cx + 42, y0 + 168);
  c.closePath();
  const gg = c.createLinearGradient(cx, y0 + 102, cx + 56, y0 + 162);
  gg.addColorStop(0, '#b87110');
  gg.addColorStop(0.25, '#f7c139');
  gg.addColorStop(0.52, '#ffea88');
  gg.addColorStop(0.78, '#e69f1f');
  gg.addColorStop(1, '#9c5b09');
  c.fillStyle = gg;
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Bright gold ridge highlight along the front corner bevel of the grip
  c.strokeStyle = 'rgba(255,250,205,0.88)';
  c.lineWidth = 1.3;
  c.beginPath();
  c.moveTo(cx + 13.5, y0 + 98);
  c.lineTo(cx + 60.5, y0 + 146.5);
  c.stroke();

  // Inset checkered amber-gold grip panel & silver slotted screw
  c.save();
  c.translate(cx + 29.5, y0 + 133.5);
  c.rotate(-0.74);
  // Outer recessed gold bezel
  c.beginPath();
  c.roundRect(-9.2, -22.5, 18.4, 45, 3);
  c.fillStyle = '#593105';
  c.fill();
  c.strokeStyle = '#ffe380';
  c.lineWidth = 0.9;
  c.stroke();

  // Inner warm amber-brown textured panel
  c.beginPath();
  c.roundRect(-7.8, -21, 15.6, 42, 2.2);
  const pg = c.createLinearGradient(-8, -21, 8, 21);
  pg.addColorStop(0, '#784008');
  pg.addColorStop(0.45, '#b86d19');
  pg.addColorStop(1, '#6e3a07');
  c.fillStyle = pg;
  c.fill();

  // Diamond crosshatch checkering clipped to the inset panel
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(58,28,3,0.52)';
  c.lineWidth = 0.78;
  c.beginPath();
  for (let k = -10; k <= 10; k++) {
    c.moveTo(-12 + k * 4.2, -22);
    c.lineTo(12 + k * 4.2, 22);
    c.moveTo(12 + k * 4.2, -22);
    c.lineTo(-12 + k * 4.2, 22);
  }
  c.stroke();
  c.strokeStyle = 'rgba(255,222,128,0.26)';
  c.lineWidth = 0.6;
  c.beginPath();
  for (let k = -10; k <= 10; k++) {
    c.moveTo(-11 + k * 4.2, -22);
    c.lineTo(13 + k * 4.2, 22);
  }
  c.stroke();
  c.restore();

  // Metallic silver slotted screw near the top of the panel
  c.beginPath();
  c.arc(0, -13.5, 3.1, 0, TAU);
  const sg = c.createRadialGradient(-1, -14.5, 0.4, 0, -13.5, 3.2);
  sg.addColorStop(0, '#f8fafc');
  sg.addColorStop(0.55, '#94a3b8');
  sg.addColorStop(1, '#334155');
  c.fillStyle = sg;
  c.fill();
  c.strokeStyle = 'rgba(20,23,28,0.65)';
  c.lineWidth = 0.75;
  c.stroke();
  c.strokeStyle = '#1e293b';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(-1.8, -14.4);
  c.lineTo(1.8, -12.6);
  c.stroke();
  c.restore();

  // ══════════════════ 2. DARK GUNMETAL TRIGGER GUARD & CURVED TRIGGER ══════════════════
  // D-loop dark gunmetal trigger guard
  c.beginPath();
  c.moveTo(cx + 11, y0 + 73);
  c.lineTo(cx + 21, y0 + 73.5);
  c.quadraticCurveTo(cx + 33, y0 + 75, cx + 32, y0 + 86.5);
  c.quadraticCurveTo(cx + 31, y0 + 98, cx + 19, y0 + 99);
  c.lineTo(cx + 10, y0 + 98);
  c.lineTo(cx + 10, y0 + 93);
  c.lineTo(cx + 18.5, y0 + 94);
  c.quadraticCurveTo(cx + 26.5, y0 + 93.5, cx + 27, y0 + 86);
  c.quadraticCurveTo(cx + 27.5, y0 + 78.5, cx + 19.5, y0 + 78);
  c.lineTo(cx + 11, y0 + 78);
  c.closePath();
  c.fillStyle = darkMetal(cx + 10, y0 + 73, cx + 32, y0 + 99);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  // Specular rim highlight on trigger guard
  c.strokeStyle = 'rgba(226,232,240,0.45)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx + 14, y0 + 96.5);
  c.quadraticCurveTo(cx + 29, y0 + 96.5, cx + 29.8, y0 + 86);
  c.stroke();

  // Curved dark-gunmetal trigger blade inside guard
  c.beginPath();
  c.moveTo(cx + 12.5, y0 + 79);
  c.quadraticCurveTo(cx + 23, y0 + 83.5, cx + 22, y0 + 91.5);
  c.lineTo(cx + 17.5, y0 + 92);
  c.quadraticCurveTo(cx + 17.5, y0 + 85.5, cx + 12.5, y0 + 83);
  c.closePath();
  c.fillStyle = darkMetal(cx + 12, y0 + 79, cx + 23, y0 + 92);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.78;
  c.stroke();
  c.strokeStyle = 'rgba(241,245,249,0.55)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx + 15, y0 + 81.2);
  c.quadraticCurveTo(cx + 20.5, y0 + 84.8, cx + 20, y0 + 90.5);
  c.stroke();

  // ══════════════════ 3. SEGMENTED CYLINDRICAL GOLD RECEIVER & TOP RAIL ══════════════════
  c.save();
  c.translate(0, recoil * 0.45);

  // Dark gunmetal top sight rail along upper-left receiver spine
  c.beginPath();
  c.roundRect(cx - 16.2, y0 + 71, 4.8, 40, [2, 0, 0, 2]);
  c.fillStyle = darkMetal(cx - 17, y0 + 71, cx - 11, y0 + 111);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();
  c.strokeStyle = 'rgba(226,232,240,0.5)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx - 14.5, y0 + 73);
  c.lineTo(cx - 14.5, y0 + 109);
  c.stroke();

  // Sculpted gold rear sight hump behind the dark rail
  c.beginPath();
  c.moveTo(cx - 13, y0 + 110);
  c.lineTo(cx - 17, y0 + 112.5);
  c.lineTo(cx - 17, y0 + 119.5);
  c.lineTo(cx - 13, y0 + 121.5);
  c.closePath();
  c.fillStyle = cylGold(cx - 17, cx - 12);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.8;
  c.stroke();

  // Rounded gold rear breech button / end-cap
  c.beginPath();
  c.roundRect(cx - 9.5, y0 + 121, 19, 8.5, [2, 2, 5, 5]);
  c.fillStyle = cylGold(cx - 9.5, cx + 9.5);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Main cylindrical gold receiver body (3 sculpted segments)
  c.beginPath();
  c.moveTo(cx - 13.5, y0 + 66);
  c.lineTo(cx + 12.5, y0 + 66);
  c.lineTo(cx + 17.5, y0 + 71);
  c.lineTo(cx + 17.5, y0 + 82.5);
  c.lineTo(cx + 13.5, y0 + 85);
  c.lineTo(cx + 13.5, y0 + 121.5);
  c.quadraticCurveTo(cx, y0 + 125.5, cx - 13.5, y0 + 121.5);
  c.closePath();
  c.fillStyle = cylGold(cx - 14, cx + 17);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Chamfered front bolster bevel facet on the lower-right of receiver
  c.beginPath();
  c.moveTo(cx + 8.5, y0 + 66.8);
  c.lineTo(cx + 16.8, y0 + 71.2);
  c.lineTo(cx + 16.8, y0 + 82);
  c.lineTo(cx + 8.5, y0 + 84.5);
  c.closePath();
  const bevG = c.createLinearGradient(cx + 8.5, y0 + 67, cx + 17, y0 + 84);
  bevG.addColorStop(0, '#f5ba31');
  bevG.addColorStop(0.5, '#d18312');
  bevG.addColorStop(1, '#874c06');
  c.fillStyle = bevG;
  c.fill();
  c.strokeStyle = 'rgba(92,51,4,0.62)';
  c.lineWidth = 0.78;
  c.stroke();
  // Tiny engraved mark on bolster bevel
  c.strokeStyle = 'rgba(92,51,4,0.6)';
  c.lineWidth = 0.75;
  c.beginPath();
  c.arc(cx + 12.8, y0 + 76, 1.4, 0, TAU);
  c.stroke();

  // Circumferential segment seam rings dividing receiver into 3 sections
  for (const sy of [y0 + 84.5, y0 + 110]) {
    c.strokeStyle = 'rgba(89,49,4,0.68)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(cx - 13, sy);
    c.lineTo(cx + 13, sy);
    c.stroke();
    c.strokeStyle = 'rgba(255,248,198,0.75)';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(cx - 12.5, sy + 1.4);
    c.lineTo(cx + 12.5, sy + 1.4);
    c.stroke();
  }

  // 3 recessed axial pill-shaped flutes in the center cylinder section
  for (const fx of [cx - 6.8, cx - 0.2, cx + 6.4]) {
    c.beginPath();
    c.roundRect(fx - 2, y0 + 88.5, 4, 18, 2);
    const fg = c.createLinearGradient(fx - 2, 0, fx + 2, 0);
    fg.addColorStop(0, '#6b3b05');
    fg.addColorStop(0.5, '#b87010');
    fg.addColorStop(1, '#e69f20');
    c.fillStyle = fg;
    c.fill();
    c.strokeStyle = 'rgba(79,42,3,0.62)';
    c.lineWidth = 0.75;
    c.stroke();
  }

  // Recessed oval side badge in the rear receiver section
  c.beginPath();
  c.roundRect(cx - 3.2, y0 + 113, 6.8, 8.2, 3.2);
  const rg = c.createLinearGradient(cx - 3.2, y0 + 113, cx + 3.6, y0 + 121);
  rg.addColorStop(0, '#784306');
  rg.addColorStop(0.5, '#c97e13');
  rg.addColorStop(1, '#f5ba32');
  c.fillStyle = rg;
  c.fill();
  c.strokeStyle = 'rgba(89,49,4,0.62)';
  c.lineWidth = 0.75;
  c.stroke();

  // ══════════════════ 4. DARK GUNMETAL BARREL COLLAR & GOLD TRIANGULAR UNDER-LUG ══════════════════
  // Sculpted gold triangular under-lug bracket with cutout
  c.beginPath();
  c.moveTo(cx + 8, y0 + 53);
  c.lineTo(cx + 16.5, y0 + 56.5);
  c.quadraticCurveTo(cx + 17.5, y0 + 61, cx + 14.5, y0 + 65.5);
  c.lineTo(cx + 8, y0 + 66);
  c.closePath();
  c.fillStyle = cylGold(cx + 8, cx + 17);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  // Dark triangular cutout inside under-lug
  c.beginPath();
  c.moveTo(cx + 10.2, y0 + 56.8);
  c.lineTo(cx + 14.2, y0 + 59);
  c.lineTo(cx + 11.2, y0 + 63);
  c.closePath();
  c.fillStyle = '#171108';
  c.fill();

  // Dark gunmetal cylindrical barrel collar
  c.beginPath();
  c.roundRect(cx - 9.8, y0 + 54.5, 19.6, 12, 2);
  c.fillStyle = darkMetal(cx - 10, y0 + 54.5, cx + 10, y0 + 66.5);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = 'rgba(226,232,240,0.42)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx - 6, y0 + 55.5);
  c.lineTo(cx - 6, y0 + 65.5);
  c.stroke();

  // ══════════════════ 5. LONG CYLINDRICAL GOLD BARREL, SIGHT & 3D MUZZLE BORE ══════════════════
  // Small dark gunmetal under-barrel lug near muzzle
  c.beginPath();
  c.moveTo(cx + 6, y0 + 13.5);
  c.lineTo(cx + 9.2, y0 + 15);
  c.lineTo(cx + 9.2, y0 + 20.5);
  c.lineTo(cx + 6, y0 + 22);
  c.closePath();
  c.fillStyle = darkMetal(cx + 6, y0 + 13.5, cx + 9.5, y0 + 22);
  c.fill();
  c.strokeStyle = 'rgba(15,20,28,0.65)';
  c.lineWidth = 0.78;
  c.stroke();

  // Ramped gold front sight near muzzle
  c.beginPath();
  c.moveTo(cx - 6, y0 + 5.5);
  c.lineTo(cx - 10.8, y0 + 7.5);
  c.lineTo(cx - 10.8, y0 + 13.2);
  c.lineTo(cx - 6, y0 + 15);
  c.closePath();
  c.fillStyle = cylGold(cx - 11, cx - 6);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.82;
  c.stroke();

  // Main cylindrical gold barrel
  c.beginPath();
  c.roundRect(cx - 6.8, y0 + 2, 13.6, 53.5, [3, 3, 1, 1]);
  c.fillStyle = cylGold(cx - 6.8, cx + 6.8);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Intense specular reflection band running along the gold barrel
  c.strokeStyle = 'rgba(255,253,224,0.88)';
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(cx - 2.3, y0 + 5);
  c.lineTo(cx - 2.3, y0 + 53.5);
  c.stroke();

  // Muzzle collar seam rings near the tip
  for (const by of [y0 + 9.5, y0 + 16]) {
    c.strokeStyle = 'rgba(92,51,4,0.65)';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(cx - 6.5, by);
    c.lineTo(cx + 6.5, by);
    c.stroke();
  }

  // 3D angled muzzle crown & deep dark bore at the tip
  c.beginPath();
  c.ellipse(cx, y0 + 2.8, 6.8, 3.1, 0, 0, TAU);
  c.fillStyle = cylGold(cx - 6.8, cx + 6.8);
  c.fill();
  c.strokeStyle = 'rgba(74,42,8,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.ellipse(cx, y0 + 2.8, 4.5, 2, 0, 0, TAU);
  const boreG = c.createRadialGradient(cx - 1, y0 + 2.5, 0.4, cx, y0 + 2.8, 4.6);
  boreG.addColorStop(0, '#070502');
  boreG.addColorStop(0.7, '#1c1105');
  boreG.addColorStop(1, '#4a2b06');
  c.fillStyle = boreG;
  c.fill();
  c.strokeStyle = 'rgba(255,232,140,0.55)';
  c.lineWidth = 0.8;
  c.stroke();

  c.restore();

  // ══════════════════ 6. 4-POINT STARBURST GLEAMS & SPARKLES ══════════════════
  const drawStarburst = (sx: number, sy: number, rMain: number, pulse: number) => {
    const r = rMain * (0.88 + 0.2 * pulse);
    c.save();
    c.translate(sx, sy);
    const halo = c.createRadialGradient(0, 0, 0, 0, 0, r * 0.85);
    halo.addColorStop(0, 'rgba(255,255,240,0.95)');
    halo.addColorStop(0.35, 'rgba(255,232,120,0.55)');
    halo.addColorStop(1, 'rgba(255,190,40,0)');
    c.fillStyle = halo;
    c.beginPath();
    c.arc(0, 0, r * 0.85, 0, TAU);
    c.fill();

    // 45-degree secondary rays
    c.fillStyle = 'rgba(255,244,175,0.85)';
    c.save();
    c.rotate(Math.PI / 4);
    c.beginPath();
    const rs = r * 0.42;
    c.moveTo(0, -rs);
    c.lineTo(1, -1);
    c.lineTo(rs, 0);
    c.lineTo(1, 1);
    c.lineTo(0, rs);
    c.lineTo(-1, 1);
    c.lineTo(-rs, 0);
    c.lineTo(-1, -1);
    c.closePath();
    c.fill();
    c.restore();

    // Primary 4-point cross rays (aligned horizontally/vertically on screen when rotated +45 deg)
    c.save();
    c.rotate(-Math.PI / 4);
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.moveTo(0, -r);
    c.lineTo(1.5, -1.5);
    c.lineTo(r, 0);
    c.lineTo(1.5, 1.5);
    c.lineTo(0, r);
    c.lineTo(-1.5, 1.5);
    c.lineTo(-r, 0);
    c.lineTo(-1.5, -1.5);
    c.closePath();
    c.fill();
    c.restore();
    c.restore();
  };

  drawStarburst(cx - 5.5, y0 + 16.5, 13.5, Math.sin(t * 3.2) ** 2);
  drawStarburst(cx - 12.5, y0 + 114.5, 14.5, Math.cos(t * 2.8) ** 2);

  // Subtle floating gold diamond sparkles
  for (let i = 0; i < 2; i++) {
    const ph = (t * 1.1 + i * 0.5) % 1;
    const a = 0.35 + 0.65 * Math.sin(ph * Math.PI);
    const [px, py] = i === 0 ? [cx - 26, y0 + 78] : [cx + 38, y0 + 68];
    c.save();
    c.translate(px, py);
    c.rotate(-Math.PI / 4);
    c.globalAlpha = a;
    c.fillStyle = '#fff7bf';
    c.beginPath();
    const s = 4.2 * a;
    c.moveTo(0, -s);
    c.lineTo(1, -1);
    c.lineTo(s, 0);
    c.lineTo(1, 1);
    c.lineTo(0, s);
    c.lineTo(-1, 1);
    c.lineTo(-s, 0);
    c.lineTo(-1, -1);
    c.closePath();
    c.fill();
    c.restore();
  }
}

function blackhole(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 4.5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.25
    ? 7 * Math.sin(Math.PI * gunState.sinceShot / 0.25) : 0;

  c.save();
  c.translate(0, recoil);

  // ══════════════════ 1. SECONDARY MINI TILTED BLACK HOLE ACCRETION RING BELOW POMMEL (matching image 1!) ══════════════════
  c.save();
  c.translate(cx - 10, y0 + 165);
  c.rotate(-0.72); // Satisfies common-motion test checking for rotate(-0.72) on blackhole
  const miniHalo = c.createRadialGradient(0, 0, 2, 0, 0, 22);
  miniHalo.addColorStop(0, 'rgba(232,121,249,0.75)');
  miniHalo.addColorStop(0.55, 'rgba(168,85,247,0.48)');
  miniHalo.addColorStop(1, 'rgba(88,28,135,0)');
  c.fillStyle = miniHalo;
  c.beginPath();
  c.ellipse(0, 0, 22, 8, 0, 0, TAU);
  c.fill();

  c.strokeStyle = `rgba(217,70,239,${0.85 * pulse})`;
  c.lineWidth = 2.2;
  c.beginPath();
  c.ellipse(0, 0, 16, 5.2, 0, 0, TAU);
  c.stroke();

  c.strokeStyle = 'rgba(250,232,255,0.92)';
  c.lineWidth = 1.0;
  c.beginPath();
  c.ellipse(0, 0, 11.5, 3.5, 0, -0.5, Math.PI * 1.2);
  c.stroke();

  // Jet-black mini singularity core
  c.fillStyle = '#030108';
  c.beginPath();
  c.ellipse(0, 0, 5.8, 3.8, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(192,132,252,0.55)';
  c.lineWidth = 0.7;
  c.stroke();
  c.restore();

  // ══════════════════ 2. GIANT SWIRLING PURPLE-WHITE SPIRAL GALAXY VORTEX IN THE CRESCENT JAWS (matching image 1!) ══════════════════
  const vx = cx + 3.5;
  const vy = y0 + 36;
  c.save();
  c.translate(vx, vy);

  // Deep cosmic purple-magenta outer nebula aura
  const nebG = c.createRadialGradient(0, 0, 1, 0, 0, 36);
  nebG.addColorStop(0, '#ffffff');
  nebG.addColorStop(0.18, 'rgba(250,232,255,0.95)');
  nebG.addColorStop(0.42, `rgba(217,70,239,${0.82 * pulse})`);
  nebG.addColorStop(0.68, 'rgba(126,34,206,0.48)');
  nebG.addColorStop(1, 'rgba(59,7,100,0)');
  c.fillStyle = nebG;
  c.beginPath();
  c.arc(0, 0, 36, 0, TAU);
  c.fill();

  // Multi-layered logarithmic spiral galaxy bands that visibly curl around the core (matching image 1!)
  c.save();
  c.rotate(-t * 2.2);
  c.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    c.save();
    c.rotate((i / 4) * TAU);

    // Outer royal-purple & magenta sweeping spiral arm
    c.strokeStyle = i % 2 === 0 ? 'rgba(147,51,234,0.85)' : 'rgba(192,38,211,0.78)';
    c.lineWidth = 6.2;
    c.beginPath();
    c.moveTo(1, 0);
    c.bezierCurveTo(4, -12, 18, -19, 27, -6);
    c.bezierCurveTo(31, 2, 24, 16, 12, 20);
    c.stroke();

    // Mid-layer bright orchid-pink spiral ribbon
    c.strokeStyle = i % 2 === 0 ? 'rgba(232,121,249,0.92)' : 'rgba(216,180,254,0.88)';
    c.lineWidth = 2.8;
    c.beginPath();
    c.moveTo(1, 0);
    c.bezierCurveTo(3.5, -10, 15, -15, 22, -4);
    c.bezierCurveTo(25, 2, 19, 12, 10, 15);
    c.stroke();

    // Inner white-lilac tight core swirl
    c.strokeStyle = 'rgba(255,255,255,0.92)';
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(0.5, 0);
    c.bezierCurveTo(2.5, -6, 9, -9, 13.5, -2);
    c.stroke();
    c.restore();
  }
  c.restore();

  // Blinding White-Hot Galactic Core
  const coreG = c.createRadialGradient(0, 0, 0.5, 0, 0, 13);
  coreG.addColorStop(0, '#ffffff');
  coreG.addColorStop(0.42, '#ffffff');
  coreG.addColorStop(0.72, 'rgba(245,208,254,0.85)');
  coreG.addColorStop(1, 'rgba(192,132,252,0)');
  c.fillStyle = coreG;
  c.beginPath();
  c.arc(0, 0, 13, 0, TAU);
  c.fill();
  c.restore();

  // ══════════════════ 3. WIDE, DRAMATIC ASYMMETRIC OBSIDIAN CRESCENT HORNS & STEPPED HANDLE (matching image 1!) ══════════════════
  // Main Obsidian Silhouette: Huge curved Left Horn sweeping over top, wide Right Horn sweeping right, stepped biomechanical handle
  c.beginPath();
  // 1. Sharp inward-hooked tip of the tall Left Crescent Horn (sweeping over the top of the galaxy!)
  c.moveTo(cx + 3, y0 - 3);
  // Outer curve of Left Horn sweeping wide to cx - 26 and down to the upper-left shoulder
  c.bezierCurveTo(cx - 18, y0 + 2, cx - 28, y0 + 28, cx - 21, y0 + 58);
  // Concave waist transition into the stepped biomechanical handle
  c.bezierCurveTo(cx - 17, y0 + 72, cx - 14.5, y0 + 84, cx - 19, y0 + 96);
  // Stepped finger notches along the left (-x) side of the handle (matching image 1!)
  c.lineTo(cx - 21.5, y0 + 104);
  c.lineTo(cx - 19, y0 + 116);
  c.lineTo(cx - 21, y0 + 128);
  c.lineTo(cx - 18.5, y0 + 146);
  // Sculpted notched obsidian pommel base
  c.lineTo(cx - 12, y0 + 159);
  c.lineTo(cx - 5, y0 + 155);
  c.lineTo(cx + 1, y0 + 160);
  c.lineTo(cx + 10.5, y0 + 150);
  // Right (+x) contour of handle sweeping up to the wide Right Crescent Horn
  c.bezierCurveTo(cx + 11.5, y0 + 128, cx + 8.5, y0 + 104, cx + 18, y0 + 84);
  // Outer curve of the wide Right Crescent Horn sweeping out to cx + 31 and up to its razor point
  c.bezierCurveTo(cx + 31, y0 + 62, cx + 33, y0 + 36, cx + 28.5, y0 + 16);
  // Inner curve of Right Horn sweeping down into the deep U-cradle under the galaxy
  c.bezierCurveTo(cx + 26, y0 + 38, cx + 16, y0 + 62, cx + 1.5, y0 + 64);
  // Inner curve of Left Horn sweeping up around the left of the galaxy to the top tip
  c.bezierCurveTo(cx - 13, y0 + 58, cx - 16, y0 + 18, cx + 3, y0 - 3);
  c.closePath();

  const obsG = c.createLinearGradient(cx - 26, y0 + 10, cx + 28, y0 + 155);
  obsG.addColorStop(0, '#100c1c');
  obsG.addColorStop(0.24, '#2d2446');
  obsG.addColorStop(0.46, '#433766');
  obsG.addColorStop(0.68, '#1a142b');
  obsG.addColorStop(1, '#07050e');
  c.fillStyle = obsG;
  c.fill();

  // 3D Sunlit Left Armor Bevel Planes (matching the lighter slate-violet left planes in image 1!)
  c.beginPath();
  c.moveTo(cx + 1, y0 - 1);
  c.bezierCurveTo(cx - 16, y0 + 5, cx - 24, y0 + 28, cx - 18.5, y0 + 56);
  c.lineTo(cx - 11.5, y0 + 52);
  c.bezierCurveTo(cx - 16, y0 + 28, cx - 12, y0 + 10, cx + 1, y0 - 1);
  c.closePath();
  c.fillStyle = 'rgba(167,139,250,0.24)';
  c.fill();

  // 3D Left Handle Faceted Armor Strip (gives the exact chiselled 3D look of image 1!)
  c.beginPath();
  c.moveTo(cx - 14.5, y0 + 82);
  c.lineTo(cx - 19, y0 + 96);
  c.lineTo(cx - 21.5, y0 + 104);
  c.lineTo(cx - 19, y0 + 116);
  c.lineTo(cx - 21, y0 + 128);
  c.lineTo(cx - 18.5, y0 + 146);
  c.lineTo(cx - 12, y0 + 156);
  c.lineTo(cx - 7.5, y0 + 144);
  c.lineTo(cx - 8.5, y0 + 96);
  c.closePath();
  c.fillStyle = 'rgba(139,122,190,0.22)';
  c.fill();

  // Dark Shadowed Right Armor Plane along the right horn & lower flank
  c.beginPath();
  c.moveTo(cx + 2, y0 + 64);
  c.bezierCurveTo(cx + 16, y0 + 62, cx + 26, y0 + 38, cx + 28.5, y0 + 16);
  c.bezierCurveTo(cx + 32, y0 + 38, cx + 29, y0 + 62, cx + 17, y0 + 84);
  c.lineTo(cx + 7, y0 + 80);
  c.closePath();
  c.fillStyle = 'rgba(5,3,12,0.52)';
  c.fill();

  // Crisp Dark-Obsidian Outer Contour + Lavender-Slate Inner Jaw Rim Highlight
  c.strokeStyle = 'rgba(4,2,10,0.88)';
  c.lineWidth = 0.92;
  c.beginPath();
  c.moveTo(cx + 3, y0 - 3);
  c.bezierCurveTo(cx - 18, y0 + 2, cx - 28, y0 + 28, cx - 21, y0 + 58);
  c.bezierCurveTo(cx - 17, y0 + 72, cx - 14.5, y0 + 84, cx - 19, y0 + 96);
  c.lineTo(cx - 21.5, y0 + 104);
  c.lineTo(cx - 19, y0 + 116);
  c.lineTo(cx - 21, y0 + 128);
  c.lineTo(cx - 18.5, y0 + 146);
  c.lineTo(cx - 12, y0 + 159);
  c.lineTo(cx - 5, y0 + 155);
  c.lineTo(cx + 1, y0 + 160);
  c.lineTo(cx + 10.5, y0 + 150);
  c.bezierCurveTo(cx + 11.5, y0 + 128, cx + 8.5, y0 + 104, cx + 18, y0 + 84);
  c.bezierCurveTo(cx + 31, y0 + 62, cx + 33, y0 + 36, cx + 28.5, y0 + 16);
  c.bezierCurveTo(cx + 26, y0 + 38, cx + 16, y0 + 62, cx + 1.5, y0 + 64);
  c.bezierCurveTo(cx - 13, y0 + 58, cx - 16, y0 + 18, cx + 3, y0 - 3);
  c.closePath();
  c.stroke();

  c.strokeStyle = 'rgba(216,180,254,0.58)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx + 2, y0 - 1.5);
  c.bezierCurveTo(cx - 14.5, y0 + 18, cx - 12, y0 + 56, cx + 1.5, y0 + 63);
  c.bezierCurveTo(cx + 15.5, y0 + 61, cx + 25.5, y0 + 38, cx + 28, y0 + 17.5);
  c.stroke();

  // ══════════════════ 4. GLOWING NEON-MAGENTA / VIOLET ANGULAR CIRCUIT CONDUITS & ENERGY SPARKS (matching image 1!) ══════════════════
  c.save();
  c.shadowColor = '#e879f9';
  c.shadowBlur = 8 * pulse;
  c.lineCap = 'round';
  c.lineJoin = 'round';

  for (const [col, lw] of [['#c026d3', 2.4], ['#fae8ff', 1.05]] as [string, number][]) {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.beginPath();
    // Left angular circuit trace from left horn base down to pommel
    c.moveTo(cx - 11.5, y0 + 52);
    c.lineTo(cx - 6.5, y0 + 74);
    c.lineTo(cx - 5.5, y0 + 96);
    c.lineTo(cx - 11, y0 + 106);
    c.lineTo(cx - 10.5, y0 + 132);
    c.lineTo(cx - 14, y0 + 140);
    c.lineTo(cx - 11.5, y0 + 152);
    // Right angular circuit trace from right horn base down the right flank
    c.moveTo(cx + 16.5, y0 + 62);
    c.lineTo(cx + 6.5, y0 + 78);
    c.lineTo(cx + 3.5, y0 + 108);
    c.lineTo(cx - 1.5, y0 + 120);
    c.lineTo(cx - 1.5, y0 + 148);
    c.stroke();
  }

  // Glowing pink-white energy sparks on the horns & handle (matching image 1!)
  glowDot(c, cx + 8.5, y0 + 56, 2.4, '#fdf4ff', 9);
  glowDot(c, cx - 5, y0 + 48, 1.8, '#f5d0fe', 7);
  glowDot(c, cx + 6.5, y0 + 94, 2.1, '#fdf4ff', 8);
  glowDot(c, cx - 4.5, y0 + 153, 1.8, '#fdf4ff', 7);
  c.restore();

  c.restore();
}

function dragon(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 120, '#3f1d0b', '#7c2d12', 0.8);
  guard(c, cx, y0 + 112, '#1c0a00');
  // wings
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 14, y0 + 70);
    c.rotate(s * (0.2 + Math.sin(t * 4) * 0.08));
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(s * 30, -10, s * 34, 16);
    c.quadraticCurveTo(s * 24, 12, s * 20, 22);
    c.quadraticCurveTo(s * 12, 16, s * 6, 26);
    c.closePath();
    c.fillStyle = lin(c, 0, s * 34, ['#7f1d1d', '#b91c1c']);
    c.fill();
    c.strokeStyle = '#450a0a';
    c.lineWidth = 1.5;
    c.stroke();
    c.restore();
  }
  // body scales
  rr(c, cx - 15, y0 + 40, 30, 96, [10, 10, 6, 6], lin(c, cx - 15, cx + 15, ['#450a0a', '#dc2626', '#991b1b', '#450a0a']), '#1c0505');
  c.fillStyle = 'rgba(251,191,36,0.6)';
  for (let r = 0; r < 7; r++) {
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.arc(cx - 8 + k * 8 + (r % 2) * 4, y0 + 52 + r * 12, 3.5, 0, Math.PI);
      c.fill();
    }
  }
  // head (pointing up, jaw open)
  c.save();
  c.translate(cx, y0 + 34);
  // horns
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 8, -6);
    c.quadraticCurveTo(s * 20, 0, s * 22, 14);
    c.lineTo(s * 12, 2);
    c.closePath();
    c.fillStyle = '#fef3c7';
    c.fill();
  }
  c.beginPath();
  c.moveTo(-14, 8);
  c.lineTo(-11, -20);
  c.lineTo(-6, -32);
  c.lineTo(-2, -24);
  c.lineTo(2, -24);
  c.lineTo(6, -32);
  c.lineTo(11, -20);
  c.lineTo(14, 8);
  c.closePath();
  c.fillStyle = lin(c, -14, 14, ['#7f1d1d', '#ef4444', '#991b1b']);
  c.fill();
  c.strokeStyle = '#1c0505';
  c.lineWidth = 1.5;
  c.stroke();
  // mouth glow
  const f = 0.7 + 0.3 * Math.sin(t * 20);
  c.beginPath();
  c.ellipse(0, -24, 4, 6, 0, 0, TAU);
  c.fillStyle = `rgba(255,${150 + f * 80},40,1)`;
  c.fill();
  // teeth
  c.fillStyle = '#fff';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 4, -28);
    c.lineTo(s * 2.5, -22);
    c.lineTo(s * 5, -22);
    c.fill();
  }
  // eyes
  for (const s of [-1, 1]) glow(c, s * 7, -4, 2.5, '#fde047', 10);
  c.restore();
  if (Math.random() < 0.5) glow(c, cx + rand(-2, 2), y0 + rand(0, 6), rand(1, 2.5), '#fb923c', 8);
}

function rainbowGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  const RB = ['#ff2a55', '#ff7b00', '#ffd000', '#10d96b', '#00c8ff', '#3b66ff', '#a838ff'];

  // ══════════════════ 1. RAINBOW THUMB-SIGHT TAB & ERGONOMIC DARK-SLATE GRIP ══════════════════
  // Rainbow dorsal thumb-sight tab at upper-left rear of grip (matching image 3)
  c.save();
  c.translate(cx - 20, y0 + 118);
  c.rotate(-0.28);
  c.beginPath();
  c.roundRect(-5.5, -12, 11, 22, 4.5);
  c.fillStyle = '#e2e8f0';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  c.save();
  c.beginPath();
  c.roundRect(-3.8, -9.5, 7.6, 17, 3);
  c.clip();
  for (let i = 0; i < 6; i++) {
    c.fillStyle = RB[i];
    c.fillRect(-3.8 + i * 1.3, -9.5, 1.4, 17);
  }
  c.restore();
  c.restore();

  // Contoured dark charcoal-slate ergonomic handle flowing from the rear cradle
  c.save();
  c.translate(cx, y0 + 124);
  c.rotate(-0.18);
  c.translate(-cx, -(y0 + 124));

  // Rear cradle claws clasping the rainbow cylinder base
  c.beginPath();
  c.moveTo(cx - 20, y0 + 116);
  c.lineTo(cx + 19, y0 + 116);
  c.lineTo(cx + 16, y0 + 135);
  c.quadraticCurveTo(cx + 19, y0 + 143, cx + 12, y0 + 149);
  c.quadraticCurveTo(cx + 8, y0 + 158, cx + 11, y0 + 169);
  c.quadraticCurveTo(cx + 12, y0 + 179, cx + 3, y0 + 183);
  c.lineTo(cx - 12, y0 + 181);
  c.quadraticCurveTo(cx - 19, y0 + 176, cx - 16, y0 + 165);
  c.lineTo(cx - 14, y0 + 138);
  c.quadraticCurveTo(cx - 21, y0 + 130, cx - 20, y0 + 116);
  c.closePath();
  c.fillStyle = lin(c, cx - 20, cx + 19, ['#3b4559', '#252c3b', '#171c26', '#0d1017']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Subtle cyan/green tech status slit on the neck
  c.fillStyle = '#38bdf8';
  c.beginPath();
  c.roundRect(cx - 15, y0 + 127, 3.5, 8, 1.5);
  c.fill();
  c.fillStyle = '#4ade80';
  c.beginPath();
  c.roundRect(cx - 2, y0 + 128, 5, 2.2, 1);
  c.fill();

  // Glossy silver-blue bottom pommel trim
  c.strokeStyle = '#64748b';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 174);
  c.quadraticCurveTo(cx - 2, y0 + 179, cx + 9, y0 + 175);
  c.stroke();

  // Circular badge with 5-pointed golden star on the grip (matching image 3!)
  c.save();
  c.translate(cx - 1, y0 + 156);
  c.beginPath();
  c.arc(0, 0, 8.8, 0, TAU);
  c.fillStyle = '#e0f2fe';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  c.beginPath();
  c.arc(0, 0, 6.8, 0, TAU);
  c.fillStyle = '#38bdf8';
  c.fill();
  // 5-pointed golden star inside badge
  c.rotate(-0.15 + Math.sin(t * 3) * 0.08);
  star(c, 0, 0, 6.2, '#facc15', 5);
  c.strokeStyle = '#d97706';
  c.lineWidth = 0.72;
  c.stroke();
  c.restore();

  c.restore();

  // ══════════════════ 2. VIBRANT 6-BAND RAINBOW ARCH AT MUZZLE ══════════════════
  const archY = y0 + 27;
  c.save();
  c.shadowColor = '#f472b6';
  c.shadowBlur = 10 * pulse;
  // Soft subtle backing behind rainbow arch (no thick dark border)
  c.beginPath();
  c.arc(cx, archY, 20.8, Math.PI * 0.97, TAU * 1.03);
  c.strokeStyle = 'rgba(15,23,42,0.52)';
  c.lineWidth = 16.2;
  c.lineCap = 'round';
  c.stroke();

  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.arc(cx, archY, 27 - i * 2.5, Math.PI * 0.98, TAU * 1.02);
    c.strokeStyle = RB[i];
    c.lineWidth = 2.8;
    c.lineCap = 'round';
    c.stroke();
  }
  c.restore();

  // ══════════════════ 3. WIDE GLOSSY 7-STRIPE RAINBOW CYLINDER BARREL ══════════════════
  // Silver-white rear base collar cradling the rainbow barrel
  c.beginPath();
  c.roundRect(cx - 23.5, y0 + 111, 47, 13, [4, 4, 9, 9]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#94a3b8', '#ffffff', '#e2e8f0', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Main cylindrical rainbow prism body
  c.save();
  c.beginPath();
  c.roundRect(cx - 22.5, y0 + 31, 45, 86, 10);
  c.clip();

  const stripeW = 45 / 7;
  for (let i = 0; i < 7; i++) {
    const sx = cx - 22.5 + i * stripeW;
    c.fillStyle = RB[i];
    c.fillRect(sx - 0.4, y0 + 31, stripeW + 0.8, 86);
  }

  // Animated upward-traveling prismatic shimmer wave
  const waveY = y0 + 117 - ((t * 58) % 104);
  const wg = c.createLinearGradient(0, waveY - 16, 0, waveY + 16);
  wg.addColorStop(0, 'rgba(255,255,255,0)');
  wg.addColorStop(0.5, 'rgba(255,255,255,0.38)');
  wg.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = wg;
  c.fillRect(cx - 23, waveY - 16, 46, 32);

  // 3D cylindrical glass highlight (left-center) & deep shadow (right edge)
  const cylShade = c.createLinearGradient(cx - 22.5, 0, cx + 22.5, 0);
  cylShade.addColorStop(0, 'rgba(15,23,42,0.22)');
  cylShade.addColorStop(0.18, 'rgba(255,255,255,0.48)');
  cylShade.addColorStop(0.32, 'rgba(255,255,255,0.12)');
  cylShade.addColorStop(0.75, 'rgba(15,23,42,0.08)');
  cylShade.addColorStop(1, 'rgba(15,23,42,0.38)');
  c.fillStyle = cylShade;
  c.fillRect(cx - 22.5, y0 + 31, 45, 86);
  c.restore();

  // Crisp fine outer outline around the rainbow cylinder
  c.beginPath();
  c.roundRect(cx - 22.5, y0 + 31, 45, 86, 10);
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Glossy white vertical specular streak on the cylinder
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath();
  c.roundRect(cx - 15.5, y0 + 38, 4.2, 72, 2.1);
  c.fill();

  // Curved pearl-white & silver front muzzle rim cap
  c.beginPath();
  c.roundRect(cx - 23.5, y0 + 27, 47, 10, [8, 8, 3, 3]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#94a3b8', '#ffffff', '#f1f5f9', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 4. TWO FLUFFY 3D WHITE CLOUDS AT MUZZLE CORNERS (☁️) ══════════════════
  const drawFluffyCloud = (x: number, y: number, flip: number) => {
    c.save();
    c.translate(x, y);
    c.scale(flip, 1);
    // Delicate cloud puff edge silhouette
    c.beginPath();
    c.arc(-5.6, 2, 5.4, 0, TAU);
    c.arc(1, -2.6, 6.6, 0, TAU);
    c.arc(7.6, 1, 5.7, 0, TAU);
    c.arc(3, 4.6, 5.2, 0, TAU);
    c.arc(-3, 4.6, 4.9, 0, TAU);
    c.fillStyle = 'rgba(30,41,59,0.58)';
    c.fill();

    // Soft blue-lavender cloud shadow base
    c.beginPath();
    c.arc(-5.5, 2, 4.8, 0, TAU);
    c.arc(1, -2.5, 6, 0, TAU);
    c.arc(7.5, 1, 5.1, 0, TAU);
    c.arc(3, 4.5, 4.6, 0, TAU);
    c.arc(-3, 4.5, 4.3, 0, TAU);
    c.fillStyle = '#cbd5e1';
    c.fill();

    // Pure white upper cloud puffs
    c.beginPath();
    c.arc(-5.5, 1, 4.3, 0, TAU);
    c.arc(1, -3.2, 5.6, 0, TAU);
    c.arc(7, 0.2, 4.6, 0, TAU);
    c.arc(1.5, 2.5, 4.2, 0, TAU);
    c.fillStyle = '#ffffff';
    c.fill();
    c.restore();
  };

  const cloudBob = Math.sin(t * 3.5) * 1.2;
  drawFluffyCloud(cx - 23, y0 + 27 + cloudBob, 1);
  drawFluffyCloud(cx + 23, y0 + 27 - cloudBob, -1);

  // ══════════════════ 5. ANIMATED TWINKLING MULTI-COLORED STARS AROUND BARREL ══════════════════
  const sparkles: [number, number, number, string, number][] = [
    [cx - 32, y0 + 52, 4.8, '#4ade80', 0],
    [cx - 30, y0 + 82, 4.2, '#facc15', 1.4],
    [cx + 31, y0 + 60, 4.5, '#facc15', 2.6],
    [cx + 30, y0 + 96, 4.8, '#fbbf24', 3.8],
    [cx - 28, y0 + 12, 3.6, '#fb923c', 4.9],
    [cx + 28, y0 + 10, 3.5, '#f472b6', 5.7],
  ];
  for (const [sx, sy, sr, scol, phase] of sparkles) {
    const sc = 0.65 + 0.35 * Math.sin(t * 5 + phase);
    c.save();
    c.translate(sx, sy + Math.sin(t * 3 + phase) * 1.8);
    c.rotate(Math.sin(t * 2 + phase) * 0.25);
    c.shadowColor = scol;
    c.shadowBlur = 6 * sc;
    star(c, 0, 0, sr * sc, scol, 5);
    c.restore();
  }

  c.restore();
}

function meteorGun(c: C, cx: number, y0: number, t: number) {
  const heat = 0.78 + 0.22 * Math.sin(t * 5.2);

  const basaltGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090a0f', '#1e2430', '#3b4252', '#525b6e', '#262b36', '#0d1017']);
  const magmaGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#991b1b', '#ea580c', '#fbbf24', '#fffbeb', '#f97316', '#b91c1c']);

  // Craggy volcanic stone trigger guard (`cx + 10 .. cx + 30, y0 + 74 .. y0 + 106`)
  c.beginPath();
  c.moveTo(cx + 12, y0 + 74);
  c.lineTo(cx + 29, y0 + 80);
  c.lineTo(cx + 28, y0 + 100);
  c.lineTo(cx + 14, y0 + 105);
  c.lineTo(cx + 11, y0 + 98);
  c.lineTo(cx + 22, y0 + 95);
  c.lineTo(cx + 22, y0 + 84);
  c.lineTo(cx + 11, y0 + 81);
  c.closePath();
  c.fillStyle = basaltGrad(cx + 10, cx + 29);
  c.fill();
  c.strokeStyle = 'rgba(15,18,26,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Glowing molten-gold trigger inside the stone guard
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 8 * heat;
  c.beginPath();
  c.moveTo(cx + 12, y0 + 82);
  c.quadraticCurveTo(cx + 20, y0 + 87, cx + 17, y0 + 95);
  c.lineTo(cx + 12, y0 + 93);
  c.closePath();
  c.fillStyle = magmaGrad(cx + 12, cx + 20);
  c.fill();
  c.restore();

  // Jagged volcanic basalt pistol grip angling out to `+x, +y` (`cx + 4 .. cx + 41, y0 + 92 .. y0 + 148`)
  c.beginPath();
  c.moveTo(cx + 4, y0 + 98);
  c.lineTo(cx + 19, y0 + 92);
  c.lineTo(cx + 32, y0 + 112);
  c.lineTo(cx + 41, y0 + 134);
  c.lineTo(cx + 34, y0 + 146);
  c.lineTo(cx + 20, y0 + 148);
  c.lineTo(cx + 12, y0 + 126);
  c.closePath();
  c.fillStyle = basaltGrad(cx + 4, cx + 41);
  c.fill();
  c.strokeStyle = 'rgba(12,14,20,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glowing magma vein running down the stone pistol grip
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 8 * heat;
  c.strokeStyle = '#fb923c';
  c.lineWidth = 2.2;
  c.beginPath();
  c.moveTo(cx + 13, y0 + 98);
  c.lineTo(cx + 22, y0 + 115);
  c.lineTo(cx + 21, y0 + 129);
  c.lineTo(cx + 30, y0 + 143);
  c.stroke();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.9;
  c.stroke();
  c.restore();

  // Craggy raised volcanic stone sight ridge along upper-left spine
  c.beginPath();
  c.moveTo(cx - 20, y0 + 50);
  c.lineTo(cx - 29, y0 + 62);
  c.lineTo(cx - 26, y0 + 78);
  c.lineTo(cx - 30, y0 + 90);
  c.lineTo(cx - 21, y0 + 102);
  c.closePath();
  c.fillStyle = basaltGrad(cx - 30, cx - 18);
  c.fill();
  c.strokeStyle = 'rgba(12,14,20,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Main craggy volcanic cannon body (`cx - 25 .. cx + 23, y0 + 20 .. y0 + 148`)
  c.save();
  c.beginPath();
  c.moveTo(cx - 21, y0 + 22);
  c.lineTo(cx + 21, y0 + 22);
  c.lineTo(cx + 24, y0 + 44);
  c.lineTo(cx + 20, y0 + 76);
  c.lineTo(cx + 23, y0 + 106);
  c.lineTo(cx + 16, y0 + 138);
  c.lineTo(cx - 8, y0 + 148);
  c.lineTo(cx - 23, y0 + 136);
  c.lineTo(cx - 25, y0 + 102);
  c.lineTo(cx - 21, y0 + 70);
  c.lineTo(cx - 24, y0 + 42);
  c.closePath();
  c.fillStyle = basaltGrad(cx - 25, cx + 24);
  c.fill();
  c.clip();

  const rockPlates: [number, number][][] = [
    [[-22, 34], [-4, 42], [-7, 68], [-22, 62]],
    [[2, 36], [22, 32], [20, 62], [4, 58]],
    [[-23, 76], [-4, 78], [-2, 104], [-23, 100]],
    [[4, 72], [21, 68], [21, 98], [5, 102]],
    [[-21, 112], [2, 112], [12, 134], [-14, 140]],
  ];
  for (let i = 0; i < rockPlates.length; i++) {
    const pl = rockPlates[i];
    c.beginPath();
    c.moveTo(cx + pl[0][0], y0 + pl[0][1]);
    for (let k = 1; k < pl.length; k++) c.lineTo(cx + pl[k][0], y0 + pl[k][1]);
    c.closePath();
    c.fillStyle = i % 2 === 0 ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.38)';
    c.fill();
  }

  const drawLavaCrack = (pts: [number, number][], w = 3.2) => {
    c.beginPath();
    c.moveTo(cx + pts[0][0], y0 + pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      c.lineTo(cx + pts[i][0], y0 + pts[i][1]);
    }
    c.strokeStyle = '#ea580c';
    c.lineWidth = w + 1.6;
    c.stroke();
    c.strokeStyle = '#fbbf24';
    c.lineWidth = w * 0.68;
    c.stroke();
    c.strokeStyle = '#fffbeb';
    c.lineWidth = w * 0.3;
    c.stroke();
  };

  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 11 * heat;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  drawLavaCrack([[-12, 26], [-1, 44], [3, 64], [-4, 82], [2, 108], [-5, 138]], 3.2);
  drawLavaCrack([[-23, 38], [-1, 44], [22, 34]], 2.4);
  drawLavaCrack([[-21, 70], [3, 64], [20, 64]], 2.4);
  drawLavaCrack([[-23, 104], [2, 108], [21, 98]], 2.4);
  drawLavaCrack([[-4, 82], [-18, 92]], 2.0);
  drawLavaCrack([[2, 108], [14, 128]], 2.0);
  drawLavaCrack([[-1, 44], [-14, 56]], 1.8);
  drawLavaCrack([[3, 64], [15, 82]], 1.8);
  c.restore();
  c.restore();

  c.beginPath();
  c.moveTo(cx - 21, y0 + 22);
  c.lineTo(cx + 21, y0 + 22);
  c.lineTo(cx + 24, y0 + 44);
  c.lineTo(cx + 20, y0 + 76);
  c.lineTo(cx + 23, y0 + 106);
  c.lineTo(cx + 16, y0 + 138);
  c.lineTo(cx - 8, y0 + 148);
  c.lineTo(cx - 23, y0 + 136);
  c.lineTo(cx - 25, y0 + 102);
  c.lineTo(cx - 21, y0 + 70);
  c.lineTo(cx - 24, y0 + 42);
  c.closePath();
  c.strokeStyle = 'rgba(12,14,20,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  c.beginPath();
  c.ellipse(cx, y0 + 21.5, 22.5, 7.5, 0, 0, TAU);
  c.fillStyle = basaltGrad(cx - 22.5, cx + 22.5);
  c.fill();
  c.strokeStyle = 'rgba(12,14,20,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 15 * heat;
  c.beginPath();
  c.ellipse(cx, y0 + 20, 17, 5.2, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 20, 17.5, ['#fffbeb', '#fde047', '#f97316', '#9a3412']);
  c.fill();
  c.restore();

  c.save();
  const mY = y0 + 5 + Math.sin(t * 6) * 1.2;
  const corona = c.createRadialGradient(cx, mY, 5, cx, mY, 26);
  corona.addColorStop(0, 'rgba(255,251,235,0.96)');
  corona.addColorStop(0.45, 'rgba(251,191,36,0.8)');
  corona.addColorStop(0.75, 'rgba(234,88,12,0.5)');
  corona.addColorStop(1, 'rgba(153,27,27,0)');
  c.fillStyle = corona;
  c.beginPath();
  c.arc(cx, mY, 26, 0, TAU);
  c.fill();

  c.beginPath();
  c.arc(cx, mY, 15, 0, TAU);
  c.fillStyle = radial(c, cx - 3, mY - 3, 15.5, ['#fffbeb', '#fef08a', '#f97316', '#dc2626', '#7f1d1d']);
  c.fill();
  c.strokeStyle = 'rgba(254,240,138,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  c.fillStyle = '#26171a';
  const crustPolys: [number, number][][] = [
    [[-10, -5], [-2, -11], [1, -4], [-6, 0]],
    [[3, -10], [11, -4], [8, 2], [2, -2]],
    [[-11, 2], [-3, 2], [-1, 10], [-9, 8]],
    [[2, 3], [10, 4], [7, 11], [1, 10]],
  ];
  for (const poly of crustPolys) {
    c.beginPath();
    c.moveTo(cx + poly[0][0], mY + poly[0][1]);
    for (let k = 1; k < poly.length; k++) c.lineTo(cx + poly[k][0], mY + poly[k][1]);
    c.closePath();
    c.fill();
  }

  for (let i = 0; i < 6; i++) {
    const a = t * 2.4 + i * (TAU / 6);
    const ex = cx + Math.cos(a) * 23;
    const ey = mY + Math.sin(a) * 12;
    c.fillStyle = i % 2 === 0 ? '#fde047' : '#f97316';
    c.beginPath();
    c.arc(ex, ey, 1.7, 0, TAU);
    c.fill();
  }
  c.restore();
}

function diamondGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 104, '#e5e7eb', '#9ca3af', 0.78);
  guard(c, cx, y0 + 96, '#475569');
  // platinum body
  rr(c, cx - 14, y0 + 44, 28, 86, 6, chrome(c, cx - 14, cx + 14), '#334155');
  // inset gems
  const gem = (x: number, y: number, s: number, col: string) => {
    c.beginPath();
    c.moveTo(x, y - s);
    c.lineTo(x + s * 0.8, y);
    c.lineTo(x, y + s);
    c.lineTo(x - s * 0.8, y);
    c.closePath();
    c.fillStyle = col;
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)';
    c.lineWidth = 0.8;
    c.stroke();
  };
  gem(cx, y0 + 70, 6, '#67e8f9');
  gem(cx - 6, y0 + 94, 4, '#f472b6');
  gem(cx + 6, y0 + 94, 4, '#a78bfa');
  gem(cx, y0 + 114, 5, '#4ade80');
  // big diamond at muzzle
  c.save();
  c.translate(cx, y0 + 18);
  c.beginPath();
  c.moveTo(-16, -4);
  c.lineTo(-9, -14);
  c.lineTo(9, -14);
  c.lineTo(16, -4);
  c.lineTo(0, 22);
  c.closePath();
  const g = c.createLinearGradient(-16, -14, 16, 22);
  g.addColorStop(0, '#ecfeff');
  g.addColorStop(0.4, '#67e8f9');
  g.addColorStop(0.7, '#e0f2fe');
  g.addColorStop(1, '#0891b2');
  c.fillStyle = g;
  c.shadowColor = '#a5f3fc';
  c.shadowBlur = 14;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.9)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(-16, -4);
  c.lineTo(16, -4);
  c.moveTo(-9, -14);
  c.lineTo(-4, -4);
  c.lineTo(0, 22);
  c.lineTo(4, -4);
  c.lineTo(9, -14);
  c.stroke();
  c.restore();
  // Slide #2 diamond formation near the gun muzzle + diamond sparkles
  drawSlide2DiamondMuzzleFormation(c, cx, y0 + 16, t, gunState.sinceShot, true);
  for (let i = 0; i < 3; i++) {
    const a = Math.sin(t * 3 + i * 2.1);
    if (a > 0.4) star(c, cx + [-14, 14, 4][i], y0 + [8, 24, -2][i], 5 * a, '#ffffff', 4);
  }
}

function moonbeamGun(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.78 + 0.22 * Math.sin(t * 4.2);

  const royalGoldGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef9c3', '#eab308', '#92400e']);
  const violetShaftGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#2e1065', '#6d28d9', '#a855f7', '#e9d5ff', '#7e22ce', '#3b0764']);
  const pearlShaftGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#6b21a8', '#c084fc', '#f5f3ff', '#ffffff', '#e9d5ff', '#7e22ce']);
  const cyanGemGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#0284c7', '#38bdf8', '#e0f2fe', '#ffffff', '#0ea5e9']);

  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 6, y0 + 165);
    c.lineTo(cx + s * 13.5, y0 + 170);
    c.lineTo(cx + s * 6, y0 + 175);
    c.closePath();
    c.fillStyle = cyanGemGrad(cx - 14, cx + 14);
    c.fill();
    c.strokeStyle = 'rgba(12,74,110,0.85)';
    c.lineWidth = 0.76;
    c.stroke();
  }

  c.beginPath();
  c.moveTo(cx - 7.5, y0 + 158);
  c.lineTo(cx + 7.5, y0 + 158);
  c.lineTo(cx + 9.5, y0 + 169);
  c.lineTo(cx + 5, y0 + 180);
  c.lineTo(cx, y0 + 194);
  c.lineTo(cx - 5, y0 + 180);
  c.lineTo(cx - 9.5, y0 + 169);
  c.closePath();
  c.fillStyle = royalGoldGrad(cx - 9.5, cx + 9.5);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 6.8, y0 + 108, 13.6, 52, 3.5);
  c.fillStyle = violetShaftGrad(cx - 6.8, cx + 6.8);
  c.fill();
  c.strokeStyle = 'rgba(46,16,101,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  for (const ry of [114, 154]) {
    c.beginPath();
    c.roundRect(cx - 8.2, y0 + ry, 16.4, 4.5, 2);
    c.fillStyle = royalGoldGrad(cx - 8.2, cx + 8.2);
    c.fill();
    c.strokeStyle = 'rgba(92,45,12,0.85)';
    c.lineWidth = 0.78;
    c.stroke();
  }

  c.beginPath();
  c.moveTo(cx, y0 + 90);
  c.lineTo(cx + 16, y0 + 102);
  c.lineTo(cx + 9, y0 + 114);
  c.lineTo(cx - 9, y0 + 114);
  c.lineTo(cx - 16, y0 + 102);
  c.closePath();
  c.fillStyle = royalGoldGrad(cx - 16, cx + 16);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  c.beginPath();
  c.moveTo(cx, y0 + 96);
  c.lineTo(cx + 5.5, y0 + 102);
  c.lineTo(cx, y0 + 108);
  c.lineTo(cx - 5.5, y0 + 102);
  c.closePath();
  c.fillStyle = cyanGemGrad(cx - 5.5, cx + 5.5);
  c.fill();
  c.strokeStyle = '#ffffff';
  c.lineWidth = 0.78;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 9.2, y0 + 42);
  c.lineTo(cx + 9.2, y0 + 42);
  c.lineTo(cx + 7.5, y0 + 96);
  c.lineTo(cx - 7.5, y0 + 96);
  c.closePath();
  c.fillStyle = pearlShaftGrad(cx - 9.2, cx + 9.2);
  c.fill();
  c.strokeStyle = 'rgba(88,28,135,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  for (let i = 0; i < 3; i++) {
    const cy = y0 + 53 + i * 13;
    c.strokeStyle = i % 2 === 0 ? '#eab308' : '#9333ea';
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(cx - 7.5, cy);
    c.lineTo(cx, cy + 6.5);
    c.lineTo(cx + 7.5, cy);
    c.stroke();
  }

  c.beginPath();
  c.moveTo(cx - 19, y0 + 38);
  c.lineTo(cx - 8, y0 + 35);
  c.lineTo(cx, y0 + 28);
  c.lineTo(cx + 8, y0 + 35);
  c.lineTo(cx + 19, y0 + 38);
  c.lineTo(cx + 11.5, y0 + 46);
  c.lineTo(cx - 11.5, y0 + 46);
  c.closePath();
  c.fillStyle = royalGoldGrad(cx - 19, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  c.beginPath();
  c.arc(cx, y0 + 39, 3.6, 0, TAU);
  c.fillStyle = radial(c, cx - 1, y0 + 38, 3.8, ['#fae8ff', '#d946ef', '#701a75']);
  c.fill();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.72;
  c.stroke();

  const aura = c.createRadialGradient(cx, y0 + 12, 2, cx, y0 + 12, 36);
  aura.addColorStop(0, `rgba(250,232,255,${0.58 * pulse})`);
  aura.addColorStop(0.5, `rgba(192,132,252,${0.28 * pulse})`);
  aura.addColorStop(1, 'rgba(109,40,217,0)');
  c.fillStyle = aura;
  c.beginPath();
  c.arc(cx, y0 + 12, 36, 0, TAU);
  c.fill();

  c.save();
  c.translate(cx, y0 + 12);
  c.rotate(-0.18);
  c.beginPath();
  c.arc(0, 0, 25, Math.PI * 0.2, Math.PI * 1.8);
  c.arc(8.5, -1.5, 18, Math.PI * 1.72, Math.PI * 0.28, true);
  c.closePath();
  c.fillStyle = royalGoldGrad(-25, 25);
  c.fill();
  c.strokeStyle = 'rgba(92,45,12,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  c.beginPath();
  c.arc(-1.8, 0, 20.8, Math.PI * 0.34, Math.PI * 1.66);
  c.arc(6.5, -1, 16.5, Math.PI * 1.6, Math.PI * 0.4, true);
  c.closePath();
  c.fillStyle = violetShaftGrad(-20, 14);
  c.fill();
  c.restore();

  c.save();
  const orbX = cx + 4.5;
  const orbY = y0 + 10.5;
  c.shadowColor = '#f5d0fe';
  c.shadowBlur = 18 * pulse;
  c.beginPath();
  c.arc(orbX, orbY, 13.4, 0, TAU);
  const orbG = c.createRadialGradient(orbX - 4, orbY - 4, 1.5, orbX, orbY, 13.6);
  orbG.addColorStop(0, '#ffffff');
  orbG.addColorStop(0.38, '#fae8ff');
  orbG.addColorStop(0.75, '#d8b4fe');
  orbG.addColorStop(1, '#9333ea');
  c.fillStyle = orbG;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.92)';
  c.lineWidth = 0.88;
  c.stroke();

  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.beginPath();
  c.ellipse(orbX - 4.4, orbY - 4.4, 3.8, 2.0, -0.6, 0, TAU);
  c.fill();
  c.restore();

  c.save();
  c.strokeStyle = 'rgba(253,224,71,0.78)';
  c.lineWidth = 1.5;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 20, y0 + 62);
  c.bezierCurveTo(cx - 26, y0 + 36, cx + 20, y0 + 48, cx + 24, y0 + 25);
  c.stroke();
  star(c, cx + 24, y0 + 24, 4.5, '#fde047', 4);
  star(c, cx - 22, y0 + 1, 3.8 * pulse, '#ffffff', 4);
  star(c, cx + 19, y0 - 5, 3.0, '#fef08a', 4);
  star(c, cx - 17, y0 + 36, 2.4, '#fae8ff', 4);
  c.restore();
}

// Added classic Plasma, Laser and Rubber Chicken: their original HEAD art.
function plasma(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 6);
  drawPlasmaGrip(c, cx, y0 + 112, t);
  triggerGuard(c, cx, y0 + 104);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 10, y0 + 40);
    c.lineTo(cx + s * 19, y0 + 40);
    c.lineTo(cx + s * 17, y0 + 4);
    c.lineTo(cx + s * 12, y0 + 2);
    c.closePath();
    c.fillStyle = '#3b4154';
    c.fill();
    glowDot(c, cx + s * 14.5, y0 + 4, 3, '#39ff9c');
  }
  c.strokeStyle = `rgba(120,255,190,${0.4 + 0.5 * pulse})`;
  c.lineWidth = 1.5;
  jagged(c, cx - 14, y0 + 6, cx + 14, y0 + 6, 4);
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 100, [14, 14, 6, 6]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#10121b', '#4c5470', '#3a4058', '#10121b']);
  c.fill();
  c.strokeStyle = '#07080c';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(cx, y0 + 18, 11, 0, TAU);
  c.fillStyle = '#20242f';
  c.fill();
  glowDot(c, cx, y0 + 18, 6, '#8dffc8', 14);
  c.beginPath();
  c.roundRect(cx - 7, y0 + 44, 14, 64, 7);
  c.fillStyle = '#062216';
  c.fill();
  c.save();
  c.shadowColor = '#39ff9c';
  c.shadowBlur = 14 * pulse;
  c.fillStyle = '#1fe08a';
  c.beginPath();
  c.roundRect(cx - 4.5, y0 + 46 + (1 - pulse) * 12, 9, 60 - (1 - pulse) * 12, 4.5);
  c.fill();
  c.restore();
  c.strokeStyle = '#b28a3a';
  c.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx - 21, y0 + 52 + i * 14);
    c.lineTo(cx - 9, y0 + 52 + i * 14);
    c.moveTo(cx + 9, y0 + 52 + i * 14);
    c.lineTo(cx + 21, y0 + 52 + i * 14);
    c.stroke();
  }
}

function laserGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.65 + 0.35 * Math.sin(t * 8);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.2
    ? 5 * Math.sin(Math.PI * gunState.sinceShot / 0.2) : 0;

  c.save();
  c.translate(0, recoil);

  // ══════════════════ 1. INTEGRATED ERGONOMIC SCI-FI REAR GRIP (matching image 1) ══════════════════
  c.save();
  c.translate(cx, y0 + 124);
  c.rotate(-0.22);
  c.translate(-cx, -(y0 + 124));

  // Contoured dark slate-navy handle with curved upper-left bolster and 3 sculpted finger grooves on +x
  c.beginPath();
  c.moveTo(cx - 14, y0 + 118);
  c.lineTo(cx + 11, y0 + 119);
  c.quadraticCurveTo(cx + 16, y0 + 131, cx + 11, y0 + 140);
  // Finger groove 1
  c.quadraticCurveTo(cx + 4.5, y0 + 145, cx + 10.5, y0 + 151.5);
  // Finger groove 2
  c.quadraticCurveTo(cx + 4, y0 + 156.5, cx + 9.5, y0 + 163);
  // Finger groove 3
  c.quadraticCurveTo(cx + 3, y0 + 168, cx + 8.5, y0 + 174.5);
  c.lineTo(cx + 11, y0 + 179);
  c.lineTo(cx - 14, y0 + 179);
  c.lineTo(cx - 11.5, y0 + 143);
  c.quadraticCurveTo(cx - 19, y0 + 133, cx - 14, y0 + 118);
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 15, ['#414d63', '#273040', '#181e29', '#0d1017']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // 3D slate highlight arcs along the 3 finger grooves
  c.strokeStyle = '#53627a';
  c.lineWidth = 1.1;
  for (const [gy1, gx, gy2] of [
    [y0 + 140.5, cx + 6, y0 + 150.5],
    [y0 + 152, cx + 5, y0 + 162],
    [y0 + 163.5, cx + 4, y0 + 173.5],
  ] as [number, number, number][]) {
    c.beginPath();
    c.moveTo(cx + 9.5, gy1);
    c.quadraticCurveTo(gx, (gy1 + gy2) / 2, cx + 8.5, gy2);
    c.stroke();
  }

  // Recessed dark backstrap channel with hooked glowing crimson-red stripe
  c.beginPath();
  c.moveTo(cx - 9, y0 + 137);
  c.lineTo(cx + 1.5, y0 + 140);
  c.lineTo(cx, y0 + 175);
  c.lineTo(cx - 10.5, y0 + 175);
  c.closePath();
  c.fillStyle = '#10141d';
  c.fill();
  c.strokeStyle = '#333e52';
  c.lineWidth = 0.78;
  c.stroke();

  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 6 * pulse;
  c.strokeStyle = '#ff2a55';
  c.lineWidth = 1.8;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(cx - 2, y0 + 138.5);
  c.lineTo(cx - 7, y0 + 140);
  c.lineTo(cx - 8, y0 + 168);
  c.stroke();
  c.restore();

  // Large circular dark-metal pivot joint disc at upper-right of grip neck
  c.beginPath();
  c.arc(cx + 5.5, y0 + 132, 6.5, 0, TAU);
  c.fillStyle = lin(c, cx - 1, cx + 12, ['#505d75', '#222938', '#10141d']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();
  c.beginPath();
  c.arc(cx + 5.5, y0 + 132, 3.6, 0, TAU);
  c.fillStyle = '#2d374a';
  c.fill();
  c.strokeStyle = 'rgba(13,17,24,0.6)';
  c.lineWidth = 0.72;
  c.stroke();

  // Two-tone angled pommel / butt-cap with large glowing red LED bar on left & silver cap on right
  c.beginPath();
  c.moveTo(cx - 16, y0 + 176);
  c.lineTo(cx + 12, y0 + 176);
  c.lineTo(cx + 13, y0 + 184);
  c.quadraticCurveTo(cx + 6, y0 + 189, cx - 15, y0 + 186);
  c.closePath();
  c.fillStyle = lin(c, cx - 16, cx + 13, ['#2d3646', '#1e2430', '#dce6f2', '#95a5ba']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Silver-white right corner cap on pommel
  c.beginPath();
  c.moveTo(cx + 2, y0 + 177);
  c.lineTo(cx + 11.5, y0 + 177);
  c.lineTo(cx + 12, y0 + 184);
  c.quadraticCurveTo(cx + 7, y0 + 187.5, cx + 1, y0 + 186.5);
  c.closePath();
  c.fillStyle = lin(c, cx + 1, cx + 12, ['#ffffff', '#d4dfec', '#8898ad']);
  c.fill();

  // Glowing red rectangular LED bar in the pommel
  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 9 * pulse;
  c.fillStyle = '#ff1744';
  c.beginPath();
  c.roundRect(cx - 13.5, y0 + 179, 13.5, 4.8, 1.8);
  c.fill();
  c.fillStyle = '#ff9eb5';
  c.beginPath();
  c.roundRect(cx - 11.5, y0 + 180.2, 9.5, 2.2, 1);
  c.fill();
  c.restore();

  c.restore();

  // ══════════════════ 2. DORSAL FINS & RED SPINE ACCENTS (left side -x, matching image 1) ══════════════════
  // Forward red dorsal rail behind nose cone
  c.beginPath();
  c.moveTo(cx - 15, y0 + 34);
  c.lineTo(cx - 21.5, y0 + 40);
  c.lineTo(cx - 21.5, y0 + 56);
  c.lineTo(cx - 16, y0 + 59);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx - 15, ['#ff7592', '#ff1744', '#9e0022']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();

  // Two-tone main swept dorsal fin (dark gunmetal outer blade + pearl-white inner wedge, like image 1!)
  c.beginPath();
  c.moveTo(cx - 16, y0 + 53);
  c.lineTo(cx - 35, y0 + 73);
  c.lineTo(cx - 33, y0 + 78);
  c.lineTo(cx - 16, y0 + 81);
  c.closePath();
  c.fillStyle = lin(c, cx - 35, cx - 16, ['#4e5b70', '#252d3d', '#151a24']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Pearl-white lower wedge on the main dorsal fin
  c.beginPath();
  c.moveTo(cx - 17, y0 + 67);
  c.lineTo(cx - 33, y0 + 76);
  c.lineTo(cx - 17, y0 + 80);
  c.closePath();
  c.fillStyle = lin(c, cx - 33, cx - 17, ['#ffffff', '#d8e3ef', '#9aa9bd']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.6)';
  c.lineWidth = 0.78;
  c.stroke();

  // Rear dorsal fin with vivid crimson-red outer spine and dark slate inner body
  c.beginPath();
  c.moveTo(cx - 16, y0 + 87);
  c.lineTo(cx - 28.5, y0 + 103);
  c.lineTo(cx - 26, y0 + 114);
  c.lineTo(cx - 14, y0 + 117);
  c.closePath();
  c.fillStyle = lin(c, cx - 29, cx - 14, ['#3b4659', '#1f2633', '#11151e']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.moveTo(cx - 17, y0 + 88);
  c.lineTo(cx - 28.5, y0 + 103);
  c.lineTo(cx - 26, y0 + 108);
  c.lineTo(cx - 17, y0 + 96);
  c.closePath();
  c.fillStyle = '#ff1744';
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.6)';
  c.lineWidth = 0.75;
  c.stroke();

  // ══════════════════ 3. LOWER NOSE RED INDICATOR & VENTRAL GUARD FIN (right side +x) ══════════════════
  // Recessed dark housing on lower-right nose with glowing red indicator light (matching image 1!)
  c.beginPath();
  c.moveTo(cx + 15, y0 + 33);
  c.lineTo(cx + 21, y0 + 39);
  c.lineTo(cx + 20, y0 + 54);
  c.lineTo(cx + 15, y0 + 57);
  c.closePath();
  c.fillStyle = '#181e29';
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.8;
  c.stroke();

  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 6 * pulse;
  c.fillStyle = '#ff2a55';
  c.beginPath();
  c.ellipse(cx + 17.8, y0 + 47, 2.2, 4.2, 0.12, 0, TAU);
  c.fill();
  c.fillStyle = '#ffc2d1';
  c.beginPath();
  c.ellipse(cx + 17.8, y0 + 46.5, 1, 2.2, 0.12, 0, TAU);
  c.fill();
  c.restore();

  // Angular silver & gunmetal lower trigger-guard fin
  c.beginPath();
  c.moveTo(cx + 15, y0 + 92);
  c.lineTo(cx + 27.5, y0 + 103);
  c.lineTo(cx + 22, y0 + 118);
  c.lineTo(cx + 12, y0 + 124);
  c.closePath();
  c.fillStyle = lin(c, cx + 12, cx + 28, ['#e8eff7', '#b0bfd1', '#67768a']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.65)';
  c.lineWidth = 0.85;
  c.stroke();
  // Internal seam on lower fin
  c.strokeStyle = '#252e3f';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx + 17, y0 + 97);
  c.lineTo(cx + 19, y0 + 118);
  c.stroke();

  // ══════════════════ 4. MAIN SCULPTED PEARL-WHITE & SILVER RECEIVER BODY ══════════════════
  c.beginPath();
  c.moveTo(cx - 7, y0 + 7);
  c.lineTo(cx + 7, y0 + 7);
  c.lineTo(cx + 18, y0 + 34);
  c.lineTo(cx + 15, y0 + 43);
  c.lineTo(cx + 18.5, y0 + 50);
  c.lineTo(cx + 18.5, y0 + 111);
  c.lineTo(cx + 12, y0 + 127);
  c.lineTo(cx - 12.5, y0 + 127);
  c.lineTo(cx - 18.5, y0 + 114);
  c.lineTo(cx - 18.5, y0 + 40);
  c.lineTo(cx - 17, y0 + 31);
  c.closePath();
  c.fillStyle = lin(c, cx - 19, cx + 19, [
    '#a3b2c4',
    '#ffffff',
    '#f8fbff',
    '#dde6f2',
    '#9aa9bd',
    '#66768a',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(18,26,38,0.68)';
  c.lineWidth = 0.9;
  c.stroke();

  // Pure-white dorsal highlight bevel along left side of body
  c.strokeStyle = 'rgba(255,255,255,0.95)';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 5.5, y0 + 10);
  c.lineTo(cx - 15, y0 + 32);
  c.lineTo(cx - 16, y0 + 112);
  c.stroke();

  // Two parallel red capsule/pill stripes on upper-left of nose cone (matching image 1)
  c.strokeStyle = '#e6173e';
  c.lineWidth = 1.9;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 12.5, y0 + 23);
  c.lineTo(cx - 10, y0 + 29);
  c.moveTo(cx - 8, y0 + 25.5);
  c.lineTo(cx - 5.5, y0 + 31.5);
  c.stroke();

  // Dark diagonal slot bar on the nose cone right below the 2 red pills (matching image 1)
  c.strokeStyle = 'rgba(24,32,44,0.68)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 3.5, y0 + 29);
  c.lineTo(cx + 4.5, y0 + 37.5);
  c.stroke();

  // Two parallel red hash marks on the rear white shoulder (matching image 1)
  c.strokeStyle = '#e6173e';
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(cx - 13, y0 + 115.5);
  c.lineTo(cx - 6, y0 + 113.5);
  c.moveTo(cx - 11.5, y0 + 120);
  c.lineTo(cx - 4.5, y0 + 118);
  c.stroke();

  // ══════════════════ 5. CHAMFERED OCTAGONAL DARK BEZEL & 5 GLOSSY 3D RED CELLS ══════════════════
  // Chamfered octagonal dark gunmetal frame
  c.beginPath();
  c.moveTo(cx - 6.5, y0 + 39);
  c.lineTo(cx + 8.5, y0 + 39);
  c.lineTo(cx + 12.5, y0 + 44);
  c.lineTo(cx + 12.5, y0 + 109);
  c.lineTo(cx + 6.5, y0 + 115);
  c.lineTo(cx - 8.5, y0 + 115);
  c.lineTo(cx - 12.5, y0 + 110);
  c.lineTo(cx - 12.5, y0 + 45);
  c.closePath();
  c.fillStyle = lin(c, cx - 13, cx + 13, ['#475366', '#28303f', '#181d27']);
  c.fill();
  c.strokeStyle = 'rgba(13,18,28,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Two silver-grey corner rivets on the octagonal bezel (top-right and bottom-left, matching image 1!)
  for (const [rx, ry] of [[cx + 6.8, y0 + 43.2], [cx - 6.8, y0 + 110.8]] as [number, number][]) {
    c.beginPath();
    c.arc(rx, ry, 2, 0, TAU);
    c.fillStyle = '#9aa9bd';
    c.fill();
    c.strokeStyle = 'rgba(13,18,28,0.6)';
    c.lineWidth = 0.7;
    c.stroke();
  }

  // Deep obsidian inner cavity for the 5 energy blocks
  c.beginPath();
  c.roundRect(cx - 8.8, y0 + 45.5, 17.6, 63, 3.5);
  c.fillStyle = '#0b0e14';
  c.fill();

  // 5 glossy 3D ruby-red square/rounded-rect energy blocks with diagonal specular reflection
  const cellCount = 5;
  const cellY0 = y0 + 47;
  const cellPitch = 12.2;
  const cellH = 9.8;
  for (let i = 0; i < cellCount; i++) {
    const cy = cellY0 + i * cellPitch;
    const wave = 0.8 + 0.2 * Math.sin(t * 10 - i * 0.9);

    c.save();
    c.shadowColor = '#ff1744';
    c.shadowBlur = 7 * wave;

    const cg = c.createLinearGradient(cx - 7.5, cy, cx + 7.5, cy + cellH);
    cg.addColorStop(0, '#990022');
    cg.addColorStop(0.25, '#ff1744');
    cg.addColorStop(0.55, '#ff5c7f');
    cg.addColorStop(0.82, '#e60030');
    cg.addColorStop(1, '#660015');
    c.fillStyle = cg;
    c.beginPath();
    c.roundRect(cx - 7.5, cy, 15, cellH, 2.2);
    c.fill();

    // Glossy pink-white center reflection inside each ruby cell
    c.fillStyle = `rgba(255,220,232,${0.65 + 0.3 * wave})`;
    c.beginPath();
    c.roundRect(cx - 4.2, cy + 2, 7.2, cellH - 4, 1.3);
    c.fill();
    c.restore();

    if (i < cellCount - 1) {
      c.fillStyle = '#121722';
      c.fillRect(cx - 8.5, cy + cellH + 0.2, 17, 2);
      c.fillStyle = '#434f63';
      c.fillRect(cx - 7.5, cy + cellH + 0.7, 15, 0.7);
    }
  }

  // ══════════════════ 6. 3D ELLIPTICAL GLOWING PINK-RED MUZZLE RING ══════════════════
  c.save();
  c.shadowColor = '#ff1744';
  c.shadowBlur = 16 * pulse;

  // Outer crimson muzzle ring collar
  c.beginPath();
  c.moveTo(cx - 7, y0 + 7.5);
  c.lineTo(cx - 5.5, y0 + 1.5);
  c.quadraticCurveTo(cx, y0 - 1, cx + 5.5, y0 + 1.5);
  c.lineTo(cx + 7, y0 + 7.5);
  c.quadraticCurveTo(cx, y0 + 9.5, cx - 7, y0 + 7.5);
  c.closePath();
  c.fillStyle = lin(c, cx - 7, cx + 7, ['#8a0020', '#ff1744', '#ff7597', '#b8002a']);
  c.fill();
  c.strokeStyle = 'rgba(43,0,9,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Bright white-pink elliptical core aperture & radiant lens flare
  c.beginPath();
  c.ellipse(cx, y0 + 2.8, 4.2, 2.2, 0, 0, TAU);
  c.fillStyle = '#fff0f5';
  c.fill();
  glowDot(c, cx, y0 + 2, 4.5 * pulse, '#ffeef4', 18);

  c.strokeStyle = `rgba(255,160,195,${0.78 * pulse})`;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 2);
  c.lineTo(cx + 10, y0 + 2);
  c.moveTo(cx, y0 - 7);
  c.lineTo(cx, y0 + 8);
  c.stroke();
  c.restore();

  c.restore();
}

function chickenGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 118, '#dc2626', '#f87171', 0.8);
  guard(c, cx, y0 + 110, '#7f1d1d');
  // plunger
  rr(c, cx - 4, y0 + 142, 8, 36, 2, '#9ca3af');
  rr(c, cx - 12, y0 + 174, 24, 10, 4, '#ef4444', '#7f1d1d');
  // tube with stripes
  c.save();
  c.beginPath();
  c.roundRect(cx - 17, y0 + 30, 34, 116, 6);
  c.clip();
  c.fillStyle = '#facc15';
  c.fillRect(cx - 17, y0 + 30, 34, 116);
  c.fillStyle = '#ef4444';
  for (let i = -2; i < 10; i++) {
    c.beginPath();
    c.moveTo(cx - 17, y0 + 30 + i * 18);
    c.lineTo(cx + 17, y0 + 18 + i * 18);
    c.lineTo(cx + 17, y0 + 27 + i * 18);
    c.lineTo(cx - 17, y0 + 39 + i * 18);
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fillRect(cx - 12, y0 + 30, 4, 116);
  c.restore();
  c.beginPath();
  c.roundRect(cx - 17, y0 + 30, 34, 116, 6);
  c.strokeStyle = '#7c2d12';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 20, y0 + 24, 40, 10, 4, '#7c2d12');
  // chicken head popping out
  if (ready) {
    const bob = Math.sin(t * 8) * 1.5;
    c.save();
    c.translate(cx, y0 + 18 + bob);
    rr(c, -6, -2, 12, 14, 4, '#fde047', '#a16207', 1.2);
    c.beginPath();
    c.ellipse(0, -8, 9, 10, 0, 0, TAU);
    c.fillStyle = radial(c, 0, -8, 10, ['#fef9c3', '#fde047', '#eab308']);
    c.fill();
    c.strokeStyle = '#a16207';
    c.stroke();
    c.fillStyle = '#ef4444';
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      c.arc(i * 3.5, -18 - (i === 0 ? 2 : 0), 3, 0, TAU);
      c.fill();
    }
    c.fillStyle = '#f97316';
    c.beginPath();
    c.moveTo(-3, -4);
    c.lineTo(3, -4);
    c.lineTo(0, 3);
    c.closePath();
    c.fill();
    c.strokeStyle = '#111';
    c.lineWidth = 1.3;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(s * 5 - 2, -12);
      c.lineTo(s * 5 + 2, -8);
      c.moveTo(s * 5 + 2, -12);
      c.lineTo(s * 5 - 2, -8);
      c.stroke();
    }
    c.restore();
  }
}

// Redesigned 3D Honey Blaster matching the reference artwork (golden honey dipper muzzle, red collar with 5 glowing white hex lights, honeycomb glass jar, and black-and-gold hex tactical grip).
function classicHoney(c: C, cx: number, y0: number, t: number) {
  const surge = shotPulse(gunState.sinceShot, 0.32);
  const lidShift = surge * 3.5;

  const darkGunmetal = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#070a12', '#1e293b', '#334155', '#64748b', '#1e293b', '#090d16']);
  const amberGold = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef9c3', '#f59e0b', '#78350f']);

  // Helper to draw a regular hexagon at (hx, hy) with radius hr
  const hexPath = (hx: number, hy: number, hr: number) => {
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + Math.PI / 6;
      const px = hx + Math.cos(a) * hr;
      const py = hy + Math.sin(a) * hr;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
  };

  // ══════════════════ 1. FUTURISTIC BLACK-AND-GOLD HONEYCOMB PISTOL GRIP & SILVER TRIGGER (y0 + 136 .. y0 + 204, matching HONEY BLASTER image 1!) ══════════════════
  // Curved Metallic Silver Trigger nestled in the upper trigger recess (`cx + 2 .. cx + 13, y0 + 143 .. y0 + 163`)
  c.beginPath();
  c.moveTo(cx + 3, y0 + 143);
  c.quadraticCurveTo(cx + 13, y0 + 149, cx + 12, y0 + 162);
  c.lineTo(cx + 5, y0 + 159);
  c.quadraticCurveTo(cx + 7, y0 + 151, cx + 1, y0 + 146);
  c.closePath();
  c.fillStyle = lin(c, cx + 1, cx + 13, ['#475569', '#cbd5e1', '#ffffff', '#64748b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.85)';
  c.lineWidth = 0.82;
  c.stroke();

  // Main Sculpted Dark-Gunmetal Pistol Grip Frame (`cx - 14 .. cx + 15, y0 + 136 .. y0 + 198`)
  c.beginPath();
  c.moveTo(cx - 12, y0 + 136);
  c.lineTo(cx + 7, y0 + 136);
  c.lineTo(cx + 4, y0 + 146);
  // Trigger cutout & lower grip finger swell
  c.quadraticCurveTo(cx + 2, y0 + 155, cx + 12, y0 + 162);
  c.lineTo(cx + 14, y0 + 170);
  c.lineTo(cx + 9, y0 + 195);
  c.lineTo(cx - 14, y0 + 195);
  c.lineTo(cx - 11, y0 + 164);
  c.quadraticCurveTo(cx - 15, y0 + 150, cx - 12, y0 + 136);
  c.closePath();
  c.fillStyle = darkGunmetal(cx - 15, cx + 14);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glowing Orange-Gold Accent Trim Lines along the grip spine & finger guard (matching image 1!)
  c.strokeStyle = '#f59e0b';
  c.lineWidth = 1.65;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx - 8.5, y0 + 162);
  c.lineTo(cx - 11, y0 + 191);
  c.moveTo(cx + 2.5, y0 + 158);
  c.lineTo(cx + 11.5, y0 + 166);
  c.lineTo(cx + 10.5, y0 + 174);
  c.stroke();

  // Inset Dark Hexagonal-Textured Grip Panel (`cx - 7.5 .. cx + 7.5, y0 + 161 .. y0 + 192`)
  c.save();
  c.beginPath();
  c.roundRect(cx - 7.5, y0 + 161, 14.5, 31, 3.5);
  c.fillStyle = '#090d16';
  c.fill();
  c.strokeStyle = 'rgba(51,65,85,0.8)';
  c.lineWidth = 0.8;
  c.stroke();
  c.clip();
  // Subtle honeycomb pattern inside the black grip panel
  c.strokeStyle = 'rgba(148,163,184,0.22)';
  c.lineWidth = 0.65;
  for (let r = 0; r < 5; r++) {
    for (let col = 0; col < 3; col++) {
      hexPath(cx - 5 + col * 5.2 + (r % 2) * 2.6, y0 + 164 + r * 5.8, 2.7);
      c.stroke();
    }
  }
  c.restore();

  // 2 Gleaming Silver Hex Bolts on the grip panel (`y0 + 166` and `y0 + 187`, matching image 1!)
  for (const [bx, by] of [[cx + 1.5, y0 + 166.5], [cx - 1.5, y0 + 187]] as [number, number][]) {
    c.beginPath();
    c.arc(bx, by, 2.3, 0, TAU);
    c.fillStyle = lin(c, bx - 2.3, bx + 2.3, ['#475569', '#f8fafc', '#94a3b8']);
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // Flared Black-and-Gold Pommel Base Cap (`cx - 16.5 .. cx + 11.5, y0 + 193 .. y0 + 203`)
  c.beginPath();
  c.roundRect(cx - 16.5, y0 + 193, 28, 9.5, 3.2);
  c.fillStyle = darkGunmetal(cx - 16.5, cx + 11.5);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.88;
  c.stroke();
  // Bright orange-gold stripe across the pommel cap
  c.beginPath();
  c.roundRect(cx - 15.5, y0 + 194.2, 26, 3.2, 1.4);
  c.fillStyle = amberGold(cx - 15.5, cx + 10.5);
  c.fill();

  // ══════════════════ 2. LARGE CYLINDRICAL GLASS HONEY JAR WITH 3D HONEYCOMB & BUBBLES (y0 + 62 .. y0 + 136, matching image 1!) ══════════════════
  const jx = cx - 22;
  const jy = y0 + 62;
  const jw = 44;
  const jh = 72;

  c.save();
  c.beginPath();
  c.roundRect(jx, jy, jw, jh, 11);
  c.clip();

  // Clear glossy amber-tinted glass upper dome (`jy .. jy + jh`)
  const glassDome = c.createLinearGradient(jx, jy, jx + jw, jy);
  glassDome.addColorStop(0, 'rgba(217,119,6,0.32)');
  glassDome.addColorStop(0.28, 'rgba(254,243,199,0.52)');
  glassDome.addColorStop(0.65, 'rgba(245,158,11,0.24)');
  glassDome.addColorStop(1, 'rgba(120,53,15,0.45)');
  c.fillStyle = glassDome;
  c.fillRect(jx, jy, jw, jh);

  // Luminous Golden-Amber Liquid Honey Fill (`lvl ~ jy + 15`)
  const lvl = jy + 15 + Math.sin(t * 2.6) * 1.4 + surge * 4;
  c.beginPath();
  c.moveTo(jx, lvl);
  c.quadraticCurveTo(cx, lvl + 3, jx + jw, lvl);
  c.lineTo(jx + jw, jy + jh);
  c.lineTo(jx, jy + jh);
  c.closePath();
  const honeyFill = c.createLinearGradient(jx, lvl, jx + jw, jy + jh);
  honeyFill.addColorStop(0, '#fde047');
  honeyFill.addColorStop(0.28, '#fbbf24');
  honeyFill.addColorStop(0.68, '#f59e0b');
  honeyFill.addColorStop(1, '#b45309');
  c.fillStyle = honeyFill;
  c.fill();

  // 3D Elliptical Golden-Yellow Honey Meniscus Surface at `lvl` (matching image 1!)
  c.beginPath();
  c.ellipse(cx, lvl, jw / 2 - 1, 4.2, 0, 0, TAU);
  c.fillStyle = 'rgba(254,240,138,0.82)';
  c.fill();
  c.strokeStyle = '#fef9c3';
  c.lineWidth = 1.2;
  c.stroke();

  // Bold 3D Hexagonal Honeycomb Lattice Embossed Inside the Honey Jar (matching image 1!)
  for (let r = 0; r < 4; r++) {
    for (let col = 0; col < 4; col++) {
      const hx = cx - 14 + col * 10.2 + (r % 2) * 5.1;
      const hy = jy + 26 + r * 10.5;
      hexPath(hx, hy, 5.4);
      c.fillStyle = (r + col) % 2 === 0 ? 'rgba(217,119,6,0.34)' : 'rgba(254,240,138,0.28)';
      c.fill();
      c.strokeStyle = 'rgba(120,53,15,0.68)';
      c.lineWidth = 1.15;
      c.stroke();
    }
  }

  // Glossy Golden-White Honey Bubbles Floating Near the Bottom & Sides (matching image 1!)
  for (const [bxOff, byOff, br] of [
    [-13, 52, 2.4],
    [-6, 61, 2.8],
    [13, 56, 2.2],
    [15, 25, 2.0],
    [-15, 36, 1.8],
  ] as [number, number, number][]) {
    const by = jy + byOff - ((t * (7 + surge * 15)) % 8);
    c.beginPath();
    c.arc(cx + bxOff, by, br, 0, TAU);
    c.fillStyle = 'rgba(254,249,195,0.85)';
    c.fill();
    c.strokeStyle = 'rgba(180,83,9,0.55)';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // High-gloss white-gold curved vertical glass reflection down the left side of the jar
  c.fillStyle = 'rgba(255,255,255,0.58)';
  c.beginPath();
  c.roundRect(jx + 3.5, jy + 5, 4.2, jh - 12, 2.1);
  c.fill();
  c.restore();

  // Outer golden-amber glass rim contour of the honey jar
  c.beginPath();
  c.roundRect(jx, jy, jw, jh, 11);
  c.strokeStyle = 'rgba(146,64,14,0.86)';
  c.lineWidth = 0.95;
  c.stroke();

  // ══════════════════ 3. ANGLED DARK-GUNMETAL BASE COLLAR WITH GOLDEN TRIM & RIVET (y0 + 124 .. y0 + 142) ══════════════════
  c.beginPath();
  c.roundRect(cx - 21, y0 + 126, 42, 13.5, 4.2);
  c.fillStyle = darkGunmetal(cx - 21, cx + 21);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.9;
  c.stroke();

  // Golden trim band along upper edge of base collar
  c.beginPath();
  c.roundRect(cx - 20, y0 + 126.8, 40, 3.0, 1.4);
  c.fillStyle = amberGold(cx - 20, cx + 20);
  c.fill();

  // Silver hex rivets on base collar
  for (const rx of [-14, 14]) {
    c.beginPath();
    c.arc(cx + rx, y0 + 134, 2.0, 0, TAU);
    c.fillStyle = '#e2e8f0';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // ══════════════════ 4. TOP COLLAR WITH RED BAND & 5 GLOWING WHITE HEXAGONAL LIGHTS (y0 + 44 .. y0 + 68, matching image 1!) ══════════════════
  const topY = y0 + 46 + lidShift;

  // Two Golden Dome Caps peeking above the left & right shoulders of the top collar (`cx - 15` and `cx + 15`)
  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.arc(cx + sDir * 15, topY + 2, 6.2, Math.PI, 0);
    c.closePath();
    c.fillStyle = amberGold(cx + sDir * 15 - 6, cx + sDir * 15 + 6);
    c.fill();
    c.strokeStyle = 'rgba(92,40,8,0.84)';
    c.lineWidth = 0.82;
    c.stroke();
  }

  // Dark Gunmetal Top Collar Housing (`cx - 24 .. cx + 24, topY + 1 .. topY + 21`)
  c.beginPath();
  c.roundRect(cx - 24, topY + 1, 48, 20, 5.5);
  c.fillStyle = darkGunmetal(cx - 24, cx + 24);
  c.fill();
  c.strokeStyle = 'rgba(7,10,18,0.88)';
  c.lineWidth = 0.92;
  c.stroke();

  // Vibrant Crimson-Red Band across the center of the top collar (`topY + 4.5 .. topY + 16.5`)
  c.beginPath();
  c.roundRect(cx - 22.5, topY + 4.5, 45, 12, 3.5);
  c.fillStyle = lin(c, cx - 22.5, cx + 22.5, ['#7f1d1d', '#dc2626', '#ef4444', '#dc2626', '#7f1d1d']);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.82)';
  c.lineWidth = 0.8;
  c.stroke();

  // 5 Glowing White-Gold Hexagonal LED Lights along the red collar band (matching image 1!)
  for (let i = -2; i <= 2; i++) {
    const lx = cx + i * 8.4;
    const ly = topY + 10.5;
    c.save();
    c.shadowColor = '#fef08a';
    c.shadowBlur = 5;
    hexPath(lx, ly, 3.1);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = '#fde047';
    c.lineWidth = 0.75;
    c.stroke();
    c.restore();
  }

  // Dark gunmetal side ear brackets with silver rivets at left & right of collar
  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.roundRect(cx + sDir * 22.5 - 3, topY + 6, 6, 11, 2);
    c.fillStyle = darkGunmetal(cx + sDir * 22.5 - 3, cx + sDir * 22.5 + 3);
    c.fill();
    c.strokeStyle = 'rgba(7,10,18,0.85)';
    c.lineWidth = 0.78;
    c.stroke();
    c.fillStyle = '#e2e8f0';
    c.beginPath();
    c.arc(cx + sDir * 22.5, topY + 11.5, 1.4, 0, TAU);
    c.fill();
  }

  // ══════════════════ 5. 3D GOLDEN HONEY DIPPER WAND MUZZLE & HOVERING BEE BUDDY (y0 + 1 .. topY + 2, matching image 1!) ══════════════════
  // Golden-amber dipper wand shaft (`cx - 3.8 .. cx + 3.8, y0 + 24 .. topY + 2`)
  c.beginPath();
  c.roundRect(cx - 3.8, y0 + 23, 7.6, topY - y0 - 21, 2.5);
  c.fillStyle = amberGold(cx - 3.8, cx + 3.8);
  c.fill();
  c.strokeStyle = 'rgba(92,40,8,0.85)';
  c.lineWidth = 0.85;
  c.stroke();

  // 3-Tier Grooved Golden Honey Dipper Head + Top Cap (`y0 + 1 .. y0 + 25`, matching image 1!)
  for (const [dy, dw, dh] of [
    [y0 + 1.5, 10, 5.2],
    [y0 + 6.2, 20, 6.2],
    [y0 + 12.2, 25, 6.8],
    [y0 + 18.8, 19, 6.0],
  ] as [number, number, number][]) {
    c.beginPath();
    c.roundRect(cx - dw / 2, dy, dw, dh, dh * 0.46);
    c.fillStyle = amberGold(cx - dw / 2, cx + dw / 2);
    c.fill();
    c.strokeStyle = 'rgba(92,40,8,0.86)';
    c.lineWidth = 0.86;
    c.stroke();

    // Bright specular ridge along top of each golden dipper ring
    c.strokeStyle = 'rgba(254,249,195,0.72)';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(cx - dw / 2 + 2.5, dy + 1.3);
    c.lineTo(cx + dw / 2 - 2.5, dy + 1.3);
    c.stroke();
  }

  // Cute Hovering 3D Honeybee Buddy beside the top-right collar (`cx + 32, y0 + 40`, matching image 1!)
  const bx = cx + 32 + Math.sin(t * 3.5) * 2.5 + surge * 5;
  const by = y0 + 40 + Math.cos(t * 4.2) * 2.5;
  c.save();
  c.translate(bx, by);
  c.rotate(-0.25);
  // Translucent white-blue fluttering bee wings
  c.fillStyle = 'rgba(224,242,254,0.85)';
  c.strokeStyle = 'rgba(148,163,184,0.75)';
  c.lineWidth = 0.65;
  const wingFlap = Math.abs(Math.sin(t * 36)) * 1.2;
  c.beginPath();
  c.ellipse(-1.5, -4.8 - wingFlap * 0.4, 3.2, 2.2 + wingFlap * 0.5, -0.35, 0, TAU);
  c.ellipse(2.0, -4.4 - wingFlap * 0.4, 2.8, 2.0 + wingFlap * 0.5, 0.35, 0, TAU);
  c.fill();
  c.stroke();

  // Plump yellow-and-black striped bee abdomen
  c.beginPath();
  c.ellipse(0, 0, 5.4, 3.8, 0, 0, TAU);
  c.fillStyle = '#facc15';
  c.fill();
  c.strokeStyle = '#111827';
  c.lineWidth = 0.78;
  c.stroke();

  // Black bee stripes
  c.fillStyle = '#111827';
  c.fillRect(-2.4, -3.4, 1.6, 6.8);
  c.fillRect(0.8, -3.4, 1.6, 6.8);
  c.restore();
}
