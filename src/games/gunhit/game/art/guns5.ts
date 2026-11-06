import type { WeaponId } from '../weapons';
import { TAU, rand, lin, steel, chrome, brass, wood, rr, grip, guard, glow, jag, star, radial, gunState } from './kit';
import { shotPulse } from './commonGunMotion';
import { bit8Gun, coinGun, kunaiGun, starWarsBlaster } from './guns6';
import { drawGunExtra4, FLASH4 } from './guns7';

type C = CanvasRenderingContext2D;

function gem(c: C, x: number, y: number, s: number, light: string, mid: string, dark: string) {
  c.beginPath();
  c.moveTo(x, y - s);
  c.lineTo(x + s * 0.8, y - s * 0.3);
  c.lineTo(x + s * 0.55, y + s * 0.8);
  c.lineTo(x - s * 0.55, y + s * 0.8);
  c.lineTo(x - s * 0.8, y - s * 0.3);
  c.closePath();
  const g = c.createLinearGradient(x - s, y - s, x + s, y + s);
  g.addColorStop(0, light);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, dark);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(x - s * 0.8, y - s * 0.3);
  c.lineTo(x + s * 0.8, y - s * 0.3);
  c.moveTo(x, y - s);
  c.lineTo(x - s * 0.3, y - s * 0.3);
  c.lineTo(x, y + s * 0.8);
  c.lineTo(x + s * 0.3, y - s * 0.3);
  c.closePath();
  c.stroke();
}

// ------------------------------------------------------------- PENCIL (LEBIH RAMPING & ELEGANT!)
function pencilGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const click = shotPulse(gunState.sinceShot, 0.28);
  grip(c, cx, y0 + 120, '#f472b6', '#f9a8d4', 0.65);
  guard(c, cx, y0 + 114, '#9d174d');
  // Sleek slender hexagonal pencil body (lebar ramping 16px bukan 30px)
  rr(c, cx - 8, y0 + 36, 16, 118, 2, lin(c, cx - 8, cx + 8, ['#ca8a04', '#fde047', '#facc15', '#ca8a04']), '#713f12', 1.2);
  c.strokeStyle = 'rgba(113,63,18,0.45)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx, y0 + 36); c.lineTo(cx, y0 + 154);
  c.stroke();
  c.fillStyle = `rgba(255,255,255,${0.22 + 0.28 * Math.sin(t * 3) ** 2})`;
  c.fillRect(cx - 6, y0 + 43 + (t * 19) % 85, 1.8, 15);
  c.fillStyle = '#111';
  c.font = "bold 7px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.save();
  c.translate(cx, y0 + 96);
  c.rotate(-Math.PI / 2);
  c.fillText('2B', 0, 2.5);
  c.restore();
  // Sleek silver ferrule + pink eraser
  rr(c, cx - 8.5, y0 + 152, 17, 10, 1.5, chrome(c, cx - 8.5, cx + 8.5), '#475569', 1);
  rr(c, cx - 8, y0 + 162 + click * 4, 16, 14 - click * 4, [1, 1, 6, 6],
    lin(c, cx - 8, cx + 8, ['#db2777', '#f9a8d4', '#ec4899']), '#831843', 1);
  // Sharpened slender cone
  c.beginPath();
  c.moveTo(cx - 8, y0 + 36);
  c.lineTo(cx + 8, y0 + 36);
  c.lineTo(cx + 2.5, y0 + 8);
  c.lineTo(cx - 2.5, y0 + 8);
  c.closePath();
  c.fillStyle = lin(c, cx - 8, cx + 8, ['#c08a5a', '#f1cfa6', '#d4a373']);
  c.fill();
  c.strokeStyle = '#7c4a1e';
  c.lineWidth = 1;
  c.stroke();
  // Graphite sharp needle tip
  c.beginPath();
  c.moveTo(cx - 2.5, y0 + 8);
  c.lineTo(cx + 2.5, y0 + 8);
  c.lineTo(cx, y0 - 4 - click * 10);
  c.closePath();
  c.fillStyle = '#1f2937';
  c.fill();
  if (ready) glow(c, cx, y0 - 3, 2, '#9ca3af', 5);
  if (click > 0.02) {
    c.fillStyle = `rgba(226,232,240,${click * 0.8})`;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.arc(cx + side * (6 + click * 7), y0 - 5 - click * 7, 1.8, 0, TAU);
      c.fill();
    }
  }
}

// ------------------------------------------------------------- SANDAL JEPIT
export function drawSandal(c: C, x: number, y: number, s: number, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  // sole
  c.beginPath();
  c.moveTo(0, -24);
  c.bezierCurveTo(12, -24, 12, -6, 9, 2);
  c.bezierCurveTo(7, 10, 11, 20, 0, 24);
  c.bezierCurveTo(-11, 20, -7, 10, -9, 2);
  c.bezierCurveTo(-12, -6, -12, -24, 0, -24);
  c.closePath();
  c.fillStyle = '#f8fafc';
  c.fill();
  c.strokeStyle = '#1e3a8a';
  c.lineWidth = 2.6;
  c.stroke();
  // blue bottom edge
  c.save();
  c.clip();
  c.fillStyle = '#2563eb';
  c.fillRect(-14, 16, 28, 10);
  c.restore();
  // strap V
  c.strokeStyle = '#2563eb';
  c.lineWidth = 4;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-9, 2);
  c.quadraticCurveTo(-2, -10, 0, -16);
  c.quadraticCurveTo(2, -10, 9, 2);
  c.stroke();
  c.fillStyle = '#1e3a8a';
  c.beginPath();
  c.arc(0, -16, 2.5, 0, TAU);
  c.fill();
  c.restore();
}

function sandalGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const snap = shotPulse(gunState.sinceShot, 0.34);
  grip(c, cx, y0 + 112, '#1e3a8a', '#2563eb', 0.8);
  guard(c, cx, y0 + 104, '#172554');
  // launcher body: blue-white striped like the iconic sandal
  rr(c, cx - 18, y0 + 50, 36, 82, 8, lin(c, cx - 18, cx + 18, ['#e2e8f0', '#ffffff', '#cbd5e1']), '#1e3a8a', 2);
  c.fillStyle = '#2563eb';
  c.fillRect(cx - 18, y0 + 112, 36, 8);
  c.fillRect(cx - 18, y0 + 62, 36, 4);
  c.fillStyle = '#1e3a8a';
  c.font = "bold 8px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.fillText('EMAK', cx, y0 + 88);
  c.fillText('POWER', cx, y0 + 100);
  // Rubber launch lips snap outward, then settle back into their blue rim.
  rr(c, cx - 22, y0 + 38 + snap * 5, 44, 14, 6, '#1d4ed8', '#172554', 1.5);
  if (ready) drawSandal(c, cx, y0 + 12 + Math.sin(t * 3) * 2 - snap * 8,
    0.9, Math.sin(t * 3) * 0.08);
  else {
    c.fillStyle = '#0b1530';
    c.beginPath();
    c.ellipse(cx, y0 + 40, 16, 4, 0, 0, TAU);
    c.fill();
  }
  if (snap > 0.02) {
    c.strokeStyle = `rgba(191,219,254,${snap * 0.8})`;
    c.lineWidth = 2.5;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(cx + side * 17, y0 + 41);
      c.quadraticCurveTo(cx + side * (26 + snap * 9), y0 + 30,
        cx + side * (29 + snap * 12), y0 + 18);
      c.stroke();
    }
  }
}

// ------------------------------------------------------------- PAINTBALL
function paintballGun(c: C, cx: number, y0: number, t: number) {
  const churn = shotPulse(gunState.sinceShot, 0.32);
  grip(c, cx, y0 + 130, '#111827', '#374151', 0.8);
  guard(c, cx, y0 + 122, '#000');
  // CO2 tank
  rr(c, cx + 20, y0 + 140, 16, 70, 8, chrome(c, cx + 20, cx + 36), '#334155', 1.5);
  rr(c, cx + 23, y0 + 136, 10, 8, 2, '#111');
  // body (neon)
  rr(c, cx - 14, y0 + 90, 28, 70, 6, lin(c, cx - 14, cx + 14, ['#9d174d', '#f472b6', '#db2777', '#831843']), '#500724', 2);
  c.fillStyle = '#facc15';
  c.fillRect(cx - 14, y0 + 112, 28, 4);
  // hopper (transparent with colored balls)
  c.beginPath();
  c.roundRect(cx - 34, y0 + 62, 30, 44, 12);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fill();
  c.save();
  c.clip();
  const cols = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c'];
  for (let i = 0; i < 9; i++) {
    const bx = cx - 28 + (i % 3) * 9 + (Math.floor(i / 3) % 2) * 4;
    const by = y0 + 98 - Math.floor(i / 3) * 9
      + Math.sin(t * 6 + i) * (0.8 + churn * 4.5);
    c.beginPath();
    c.arc(bx, by, 4.2, 0, TAU);
    c.fillStyle = radial(c, bx, by, 4.2, ['#ffffff', cols[i % 6], cols[i % 6]]);
    c.fill();
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 34, y0 + 62, 30, 44, 12);
  c.strokeStyle = '#111';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 12, y0 + 92, 10, 8, 2, '#111');
  // barrel
  rr(c, cx - 5, y0 + 2, 10, 92, 3, lin(c, cx - 5, cx + 5, ['#111', '#4b5563', '#111']), '#000', 1);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(cx, y0 + 10 + i * 6, 1, 0, TAU);
    c.fill();
  }
  // paint splats on body
  c.fillStyle = 'rgba(34,211,238,0.85)';
  c.beginPath();
  c.arc(cx + 6, y0 + 130, 4, 0, TAU);
  c.arc(cx + 9, y0 + 136, 2, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(250,204,21,0.9)';
  c.beginPath();
  c.arc(cx - 7, y0 + 146, 3, 0, TAU);
  c.fill();
  // Color sloshes up the feed line; tiny paint beads shake free on a shot.
  c.fillStyle = `rgba(34,211,238,${0.25 + 0.45 * Math.sin(t * 3) ** 2})`;
  c.fillRect(cx + 7, y0 + 98 + (t * 22) % 35, 2, 9);
  if (churn > 0.02) {
    for (const side of [-1, 1]) {
      c.fillStyle = side < 0 ? `rgba(250,204,21,${churn})` : `rgba(244,114,182,${churn})`;
      c.beginPath();
      c.arc(cx + side * (6 + churn * 8), y0 - 5 - churn * 8, 2.4, 0, TAU);
      c.fill();
    }
  }
}

// ------------------------------------------------------------- MAGIC WAND
function magicWand(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.72 + 0.28 * Math.sin(t * 5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.22
    ? 6 * Math.sin(Math.PI * gunState.sinceShot / 0.22) : 0;

  c.save();
  c.translate(0, recoil);

  // ══════════════════ 1. SWIRLING GOLDEN & VIOLET MAGICAL AURA RIBBONS (matching image 3!) ══════════════════
  c.save();
  c.lineCap = 'round';
  // Soft violet magic wisp curling around the lower-mid shaft
  const vWisp = c.createLinearGradient(cx - 24, y0 + 150, cx + 18, y0 + 68);
  vWisp.addColorStop(0, 'rgba(168,85,247,0)');
  vWisp.addColorStop(0.35, `rgba(192,132,252,${0.36 * pulse})`);
  vWisp.addColorStop(0.7, `rgba(232,121,249,${0.44 * pulse})`);
  vWisp.addColorStop(1, 'rgba(192,132,252,0)');
  c.strokeStyle = vWisp;
  c.lineWidth = 7.5;
  c.beginPath();
  c.moveTo(cx - 12, y0 + 152);
  c.bezierCurveTo(
    cx - 28 + Math.sin(t * 2.4) * 3,
    y0 + 124,
    cx + 25 + Math.cos(t * 2.4) * 3,
    y0 + 104,
    cx - 10,
    y0 + 72,
  );
  c.stroke();

  c.strokeStyle = `rgba(245,208,254,${0.55 * pulse})`;
  c.lineWidth = 2;
  c.stroke();

  // Golden stardust swirl ribbon coiling around the upper collar and star tip
  const gWisp = c.createLinearGradient(cx - 24, y0 + 76, cx + 26, y0 + 8);
  gWisp.addColorStop(0, 'rgba(250,204,21,0)');
  gWisp.addColorStop(0.35, `rgba(250,204,21,${0.34 * pulse})`);
  gWisp.addColorStop(0.7, `rgba(254,240,138,${0.48 * pulse})`);
  gWisp.addColorStop(1, 'rgba(250,204,21,0)');
  c.strokeStyle = gWisp;
  c.lineWidth = 5.5;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 74);
  c.bezierCurveTo(
    cx - 24,
    y0 + 42,
    cx + 28,
    y0 + 56,
    cx + 18 + Math.sin(t * 3) * 2.5,
    y0 + 18,
  );
  c.stroke();

  c.strokeStyle = `rgba(254,249,195,${0.62 * pulse})`;
  c.lineWidth = 1.6;
  c.stroke();
  c.restore();

  // ══════════════════ 2. ROYAL-VIOLET WAND SHAFT, SILVER SPIRAL RIBBON & GLOWING RUNES ══════════════════
  // Tapered royal-purple cylindrical shaft (y0 + 48 .. y0 + 174)
  c.beginPath();
  c.moveTo(cx - 6.8, y0 + 48);
  c.lineTo(cx + 6.8, y0 + 48);
  c.lineTo(cx + 5.2, y0 + 174);
  c.lineTo(cx - 5.2, y0 + 174);
  c.closePath();
  c.fillStyle = lin(c, cx - 7, cx + 7, [
    '#14062b',
    '#4c1d95',
    '#7c3aed',
    '#5b21b6',
    '#2e1065',
    '#120524',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(18,7,38,0.68)';
  c.lineWidth = 0.8;
  c.stroke();

  // Glossy lavender-white cylindrical highlight along left side of shaft
  c.fillStyle = 'rgba(233,213,255,0.34)';
  c.beginPath();
  c.roundRect(cx - 4.4, y0 + 52, 2.2, 118, 1.1);
  c.fill();

  // Glowing neon pink-violet arcane rune glyphs along the purple shaft (matching image 3!)
  c.save();
  c.shadowColor = '#e879f9';
  c.shadowBlur = 7 * pulse;
  c.strokeStyle = '#fae8ff';
  c.lineWidth = 1.35;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  const runeY = [63, 76, 89, 106, 125, 141, 156];
  for (let i = 0; i < runeY.length; i++) {
    const ry = y0 + runeY[i];
    const rGlow = 0.65 + 0.35 * Math.sin(t * 7 - i * 0.8);
    c.globalAlpha = rGlow;
    c.beginPath();
    if (i % 3 === 0) {
      c.moveTo(cx - 2.2, ry - 2.5);
      c.lineTo(cx + 2, ry - 0.5);
      c.lineTo(cx - 1.5, ry + 2.5);
      c.moveTo(cx - 0.2, ry - 1.2);
      c.lineTo(cx + 2.4, ry + 2);
    } else if (i % 3 === 1) {
      c.moveTo(cx - 2, ry - 2.8);
      c.lineTo(cx + 1.8, ry - 2.2);
      c.lineTo(cx - 1.2, ry + 0.5);
      c.lineTo(cx + 2, ry + 2.6);
    } else {
      c.moveTo(cx, ry - 3);
      c.lineTo(cx - 2.2, ry);
      c.lineTo(cx + 2.2, ry + 0.5);
      c.lineTo(cx - 0.5, ry + 3);
    }
    c.stroke();
  }
  c.restore();

  // Helical polished silver-platinum spiral ribbon wrapping around the purple shaft (matching image 3!)
  for (const sy of [y0 + 82, y0 + 114, y0 + 145]) {
    c.beginPath();
    c.moveTo(cx - 6.3, sy + 14);
    c.bezierCurveTo(cx - 5.5, sy + 4, cx + 5.5, sy - 4, cx + 6.3, sy - 14);
    c.lineTo(cx + 6.3, sy - 6.5);
    c.bezierCurveTo(cx + 5.5, sy + 2.5, cx - 5.5, sy + 10.5, cx - 6.3, sy + 20.5);
    c.closePath();
    c.fillStyle = lin(c, cx - 6.5, cx + 6.5, ['#334155', '#cbd5e1', '#ffffff', '#e2e8f0', '#475569']);
    c.fill();
    c.strokeStyle = 'rgba(15,23,42,0.65)';
    c.lineWidth = 0.72;
    c.stroke();
  }

  // ══════════════════ 3. ORNATE SILVER FILIGREE POMMEL & DARK-AMETHYST DIAMOND TIP ══════════════════
  // Pointed dark-violet / obsidian diamond crystal at the bottom tip (y0 + 175 .. y0 + 194)
  c.beginPath();
  c.moveTo(cx, y0 + 194);
  c.lineTo(cx - 6.8, y0 + 180);
  c.lineTo(cx, y0 + 172);
  c.lineTo(cx + 6.8, y0 + 180);
  c.closePath();
  c.fillStyle = lin(c, cx - 7, cx + 7, ['#4c1d95', '#7c3aed', '#2e1065', '#0f051d']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.72)';
  c.lineWidth = 0.8;
  c.stroke();
  // Central crystal facet ridge on pommel tip
  c.strokeStyle = 'rgba(216,180,254,0.65)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx, y0 + 174);
  c.lineTo(cx, y0 + 193.5);
  c.stroke();

  // Ornate silver filigree pommel crown sleeve (y0 + 161 .. y0 + 181)
  c.beginPath();
  c.moveTo(cx - 5.5, y0 + 161);
  c.quadraticCurveTo(cx, y0 + 165, cx + 5.5, y0 + 161);
  c.lineTo(cx + 8.5, y0 + 179);
  c.lineTo(cx, y0 + 174.5);
  c.lineTo(cx - 8.5, y0 + 179);
  c.closePath();
  c.fillStyle = lin(c, cx - 8.5, cx + 8.5, ['#334155', '#cbd5e1', '#ffffff', '#94a3b8', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Engraved dark-violet filigree arch inside silver pommel
  c.strokeStyle = '#31105e';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - 4.5, y0 + 175);
  c.quadraticCurveTo(cx, y0 + 166, cx + 4.5, y0 + 175);
  c.stroke();

  // ══════════════════ 4. ORNATE SILVER UPPER COLLAR & ROSE-GOLD CHALICE MOUNT (matching image 3!) ══════════════════
  // Ringed silver collar at top of purple shaft (y0 + 46 .. y0 + 58)
  c.beginPath();
  c.roundRect(cx - 8.2, y0 + 47, 16.4, 10, 3.5);
  c.fillStyle = lin(c, cx - 8.5, cx + 8.5, ['#334155', '#e2e8f0', '#ffffff', '#94a3b8', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Flared silver filigree chalice wings cradling the rose-gold chevron (y0 + 25 .. y0 + 49)
  c.beginPath();
  c.moveTo(cx - 7.5, y0 + 48);
  c.quadraticCurveTo(cx - 13.5, y0 + 38, cx - 10.5, y0 + 24);
  c.lineTo(cx, y0 + 34);
  c.lineTo(cx + 10.5, y0 + 24);
  c.quadraticCurveTo(cx + 13.5, y0 + 38, cx + 7.5, y0 + 48);
  c.closePath();
  c.fillStyle = lin(c, cx - 13, cx + 13, ['#475569', '#f1f5f9', '#ffffff', '#cbd5e1', '#334155']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.82;
  c.stroke();

  // Dark-violet scrollwork lines on the silver chalice wings
  c.strokeStyle = '#3b0764';
  c.lineWidth = 0.9;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 8.5, y0 + 29);
    c.quadraticCurveTo(cx + s * 9.5, y0 + 38, cx + s * 4.5, y0 + 45);
    c.stroke();
  }

  // Rose-pink & 24K gold V-chevron gem setting directly beneath the star (matching image 3!)
  c.beginPath();
  c.moveTo(cx - 7.8, y0 + 23);
  c.lineTo(cx, y0 + 42);
  c.lineTo(cx + 7.8, y0 + 23);
  c.lineTo(cx, y0 + 29);
  c.closePath();
  c.fillStyle = lin(c, cx - 8, cx + 8, ['#f59e0b', '#fef08a', '#facc15', '#d97706']);
  c.fill();
  c.strokeStyle = 'rgba(120,53,15,0.68)';
  c.lineWidth = 0.75;
  c.stroke();

  // Inner rose-pink crystal V-inlay
  c.beginPath();
  c.moveTo(cx - 5.6, y0 + 21);
  c.lineTo(cx, y0 + 37.5);
  c.lineTo(cx + 5.6, y0 + 21);
  c.lineTo(cx, y0 + 26);
  c.closePath();
  c.fillStyle = lin(c, cx - 6, cx + 6, ['#be185d', '#f472b6', '#fbcfe8', '#ec4899']);
  c.fill();

  // ══════════════════ 5. BLAZING 3D FACETED 8-POINTED GOLDEN STAR TIP (matching image 3!) ══════════════════
  const starY = y0 + 13;
  c.save();
  c.translate(cx, starY);
  c.rotate(-0.12 + Math.sin(t * 2.5) * 0.05);

  // Soft golden-amber radial halo behind the 8-pointed star
  const halo = c.createRadialGradient(0, 0, 2, 0, 0, 32);
  halo.addColorStop(0, `rgba(255,255,255,${0.85 * pulse})`);
  halo.addColorStop(0.35, `rgba(253,224,71,${0.55 * pulse})`);
  halo.addColorStop(0.7, `rgba(245,158,11,${0.22 * pulse})`);
  halo.addColorStop(1, 'rgba(245,158,11,0)');
  c.fillStyle = halo;
  c.beginPath();
  c.arc(0, 0, 32, 0, TAU);
  c.fill();

  // 8-pointed 3D bevel-faceted golden star (alternating primary 25px rays and secondary 19.5px rays)
  const rays = 8;
  const rInner = 8.6;
  for (let i = 0; i < rays; i++) {
    const aMid = (i / rays) * TAU - Math.PI / 2;
    const aPrev = ((i - 0.5) / rays) * TAU - Math.PI / 2;
    const aNext = ((i + 0.5) / rays) * TAU - Math.PI / 2;
    const rOut = i % 2 === 0 ? 25.5 : 19.5;

    const tx = Math.cos(aMid) * rOut;
    const ty = Math.sin(aMid) * rOut;
    const px = Math.cos(aPrev) * rInner;
    const py = Math.sin(aPrev) * rInner;
    const nx = Math.cos(aNext) * rInner;
    const ny = Math.sin(aNext) * rInner;

    // Left (sunlit) triangular facet of ray
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(px, py);
    c.lineTo(tx, ty);
    c.closePath();
    c.fillStyle = i % 2 === 0 ? '#fef08a' : '#fde047';
    c.fill();

    // Right (warm amber-gold) triangular facet of ray
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(tx, ty);
    c.lineTo(nx, ny);
    c.closePath();
    c.fillStyle = i % 2 === 0 ? '#f59e0b' : '#d97706';
    c.fill();
  }

  // Crisp delicate outer contour & internal facet ridges of the 8-pointed star
  c.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const a = (i / (rays * 2)) * TAU - Math.PI / 2;
    const r = i % 2 === 0 ? (i % 4 === 0 ? 25.5 : 19.5) : rInner;
    if (i === 0) c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  c.closePath();
  c.strokeStyle = 'rgba(146,64,14,0.75)';
  c.lineWidth = 0.82;
  c.stroke();

  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 0.72;
  for (let i = 0; i < rays; i++) {
    const aMid = (i / rays) * TAU - Math.PI / 2;
    const rOut = i % 2 === 0 ? 24.5 : 18.5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(aMid) * rOut, Math.sin(aMid) * rOut);
    c.stroke();
  }

  // Blinding white-hot center flare at the heart of the star
  const coreG = c.createRadialGradient(0, 0, 0.5, 0, 0, 9.5);
  coreG.addColorStop(0, '#ffffff');
  coreG.addColorStop(0.5, 'rgba(254,249,195,0.92)');
  coreG.addColorStop(1, 'rgba(250,204,21,0)');
  c.fillStyle = coreG;
  c.beginPath();
  c.arc(0, 0, 9.5, 0, TAU);
  c.fill();
  c.restore();

  // Twinkling 4-pointed golden diamond sparkles around the wand tip (matching image 3!)
  for (const [sx, sy, sr, ph] of [
    [cx + 15, y0 - 10, 4.5, 0],
    [cx - 18, y0 + 2, 3.2, 1.4],
    [cx + 24, y0 + 8, 3.5, 2.7],
    [cx - 21, y0 + 36, 3.4, 3.9],
    [cx + 16, y0 + 50, 3, 5.1],
  ] as [number, number, number, number][]) {
    const tw = 0.55 + 0.45 * Math.sin(t * 6 + ph);
    star(c, sx, sy, sr * tw, '#fef08a', 4);
    star(c, sx, sy, sr * tw * 0.5, '#ffffff', 4);
  }

  c.restore();
}

// ------------------------------------------------------------- RUBY REVOLVER
function rubyRevolver(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.2
    ? 6.5 * Math.sin(Math.PI * gunState.sinceShot / 0.2) : 0;
  const k = gunState.sinceShot >= 0 && gunState.sinceShot < 0.14 ? gunState.sinceShot / 0.14 : 1;
  const cylRot = (gunState.shots - 1 + k) * (TAU / 6);
  const hammerCock = gunState.sinceShot >= 0 && gunState.sinceShot < 0.14
    ? Math.sin(Math.PI * gunState.sinceShot / 0.14) * 0.36 : 0;

  c.save();
  c.translate(0, recoil);

  const goldGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#ca8a04', '#fde047', '#fef9c3', '#facc15', '#b45309', '#5c2808']);

  // ══════════════════ 1. ORNATE GOLD-FRAMED BURGUNDY GRIP WITH GOLD FILIGREE SCROLLS (matching image 1!) ══════════════════
  // Outer sculpted 24K Gold Grip Frame & Flared Pommel Cap (y0 + 114 .. y0 + 184)
  c.beginPath();
  c.moveTo(cx - 11, y0 + 115);
  c.lineTo(cx + 13, y0 + 117);
  // Inner (front) curve of grip
  c.bezierCurveTo(cx + 17, y0 + 136, cx + 26, y0 + 154, cx + 46, y0 + 169);
  // Flared gold pommel cap
  c.quadraticCurveTo(cx + 50, y0 + 174, cx + 43, y0 + 178);
  c.lineTo(cx + 17, y0 + 184);
  c.quadraticCurveTo(cx + 10, y0 + 184, cx + 9, y0 + 176);
  // Outer (backstrap) curve of grip
  c.bezierCurveTo(cx + 4, y0 + 154, cx - 6, y0 + 136, cx - 11, y0 + 115);
  c.closePath();
  c.fillStyle = goldGrad(cx - 12, cx + 48);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Inset Deep Burgundy-Crimson / Ruby Grip Panel inside the gold border
  c.save();
  c.beginPath();
  c.moveTo(cx - 6.5, y0 + 121);
  c.quadraticCurveTo(cx + 2, y0 + 118, cx + 9.5, y0 + 123);
  c.bezierCurveTo(cx + 13, y0 + 140, cx + 21, y0 + 156, cx + 38, y0 + 170);
  c.quadraticCurveTo(cx + 27, y0 + 176, cx + 14, y0 + 177);
  c.bezierCurveTo(cx + 8, y0 + 156, cx - 1, y0 + 138, cx - 6.5, y0 + 121);
  c.closePath();
  const gripG = c.createLinearGradient(cx - 6, y0 + 122, cx + 38, y0 + 176);
  gripG.addColorStop(0, '#4c0519');
  gripG.addColorStop(0.28, '#9f1239');
  gripG.addColorStop(0.55, '#e11d48');
  gripG.addColorStop(0.82, '#881337');
  gripG.addColorStop(1, '#3b0414');
  c.fillStyle = gripG;
  c.fill();
  c.strokeStyle = 'rgba(76,5,25,0.72)';
  c.lineWidth = 0.78;
  c.stroke();
  c.clip();

  // Glossy crimson-pink highlight along left curve of grip panel
  c.strokeStyle = 'rgba(253,164,175,0.42)';
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(cx - 4.5, y0 + 123);
  c.bezierCurveTo(cx + 1, y0 + 142, cx + 9, y0 + 158, cx + 15, y0 + 175);
  c.stroke();

  // Ornate 24K Gold Arabesque / C-Scroll Filigree Vines on the crimson grip (matching image 1!)
  const drawScroll = (col: string, lw: number, dy: number) => {
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.lineCap = 'round';
    c.beginPath();
    // Main central S-vine & upper C-scrolls
    c.moveTo(cx + 2, y0 + 125 + dy);
    c.bezierCurveTo(cx + 11, y0 + 128 + dy, cx + 13, y0 + 142 + dy, cx + 5, y0 + 146 + dy);
    c.bezierCurveTo(cx + 12, y0 + 149 + dy, cx + 22, y0 + 158 + dy, cx + 16, y0 + 169 + dy);
    // Upper-right spiral curl
    c.moveTo(cx + 7, y0 + 135 + dy);
    c.quadraticCurveTo(cx + 14, y0 + 132 + dy, cx + 13, y0 + 139 + dy);
    // Mid-right spiral curl
    c.moveTo(cx + 11, y0 + 149 + dy);
    c.quadraticCurveTo(cx + 21, y0 + 147 + dy, cx + 20, y0 + 155 + dy);
    // Lower spiral flourish near pommel
    c.moveTo(cx + 15, y0 + 161 + dy);
    c.quadraticCurveTo(cx + 27, y0 + 162 + dy, cx + 29, y0 + 170 + dy);
    c.stroke();
  };
  drawScroll('rgba(60,5,20,0.65)', 2.2, 0.9);
  drawScroll('#facc15', 1.5, 0);
  drawScroll('#fef9c3', 0.7, -0.3);
  c.restore();

  // ══════════════════ 2. SCULPTED GOLD TRIGGER GUARD (WITH FINIAL SPUR) & CURVED TRIGGER ══════════════════
  // Curved gold trigger blade inside guard
  c.beginPath();
  c.moveTo(cx + 12, y0 + 104);
  c.quadraticCurveTo(cx + 22, y0 + 114, cx + 16, y0 + 124);
  c.quadraticCurveTo(cx + 11, y0 + 116, cx + 10, y0 + 106);
  c.closePath();
  c.fillStyle = goldGrad(cx + 10, cx + 22);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.75;
  c.stroke();

  // Sculpted 24K Gold Trigger Guard with pointed decorative finial spur (matching image 1!)
  c.beginPath();
  c.moveTo(cx + 14, y0 + 95);
  c.bezierCurveTo(cx + 31, y0 + 101, cx + 33, y0 + 124, cx + 24, y0 + 133);
  // Pointed ornamental spur at bottom-right of guard
  c.lineTo(cx + 27.5, y0 + 139.5);
  c.lineTo(cx + 19.5, y0 + 136);
  c.quadraticCurveTo(cx + 14, y0 + 135, cx + 11, y0 + 129);
  c.lineTo(cx + 12, y0 + 124);
  c.quadraticCurveTo(cx + 18, y0 + 130, cx + 22, y0 + 127);
  c.bezierCurveTo(cx + 28, y0 + 120, cx + 26, y0 + 104, cx + 14, y0 + 100);
  c.closePath();
  c.fillStyle = goldGrad(cx + 11, cx + 32);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.8;
  c.stroke();

  // ══════════════════ 3. ORNATE S-CURVED GOLD HAMMER SPUR (matching image 1!) ══════════════════
  c.save();
  c.translate(cx - 13, y0 + 114);
  c.rotate(-hammerCock);
  c.beginPath();
  c.moveTo(0, -6);
  c.quadraticCurveTo(-7, -8, -11, -12);
  c.lineTo(-13, -9);
  c.lineTo(-16.5, -10.5);
  c.quadraticCurveTo(-15.5, -4, -9, -2);
  c.quadraticCurveTo(-4, 0, 0, 5);
  c.closePath();
  c.fillStyle = goldGrad(-17, 2);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.8;
  c.stroke();
  c.restore();

  // ══════════════════ 4. HEAVY 24K GOLD BARREL, SHARK-FIN SIGHT & STEEL EJECTOR ROD ══════════════════
  // Dark gunmetal-steel under-barrel ejector rod (cx + 8.5 .. cx + 14.5, y0 + 32 .. y0 + 65, matching image 1!)
  c.beginPath();
  c.roundRect(cx + 8.2, y0 + 32, 6.2, 34, 2);
  c.fillStyle = lin(c, cx + 8, cx + 15, ['#0f172a', '#475569', '#cbd5e1', '#64748b', '#1e293b']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Sculpted 24K gold forward under-lug shroud ahead of the steel rod (y0 + 9 .. y0 + 34)
  c.beginPath();
  c.moveTo(cx + 8, y0 + 9);
  c.lineTo(cx + 15.5, y0 + 13);
  c.quadraticCurveTo(cx + 17.5, y0 + 23, cx + 15.5, y0 + 33);
  c.lineTo(cx + 8, y0 + 34);
  c.closePath();
  c.fillStyle = goldGrad(cx + 8, cx + 17.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.8;
  c.stroke();
  // Gold collar ring where steel rod meets under-lug
  c.beginPath();
  c.roundRect(cx + 7.8, y0 + 30.5, 8.2, 4.2, 1.8);
  c.fillStyle = goldGrad(cx + 7.8, cx + 16);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.65)';
  c.lineWidth = 0.72;
  c.stroke();

  // Shark-fin 24K gold front sight blade on upper-left (-x) near muzzle (y0 + 8 .. y0 + 29)
  c.beginPath();
  c.moveTo(cx - 8.5, y0 + 8);
  c.lineTo(cx - 16, y0 + 13);
  c.lineTo(cx - 15.5, y0 + 23);
  c.lineTo(cx - 8.5, y0 + 29);
  c.closePath();
  c.fillStyle = goldGrad(cx - 16, cx - 8);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Main cylindrical 24K Gold Barrel (cx - 9.5 .. cx + 9.5, y0 + 5 .. y0 + 66)
  c.beginPath();
  c.roundRect(cx - 9.5, y0 + 5, 19, 61, 3);
  c.fillStyle = goldGrad(cx - 9.5, cx + 9.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.72)';
  c.lineWidth = 0.88;
  c.stroke();

  // Brilliant cream-white lengthwise specular highlight down the gold barrel
  c.fillStyle = 'rgba(255,253,230,0.78)';
  c.beginPath();
  c.roundRect(cx - 4.8, y0 + 8, 3.6, 54, 1.8);
  c.fill();

  // Stepped 24K gold muzzle crown ring at the tip (y0 + 1.5 .. y0 + 6.5)
  c.beginPath();
  c.roundRect(cx - 8.2, y0 + 1.5, 16.4, 5, 2);
  c.fillStyle = goldGrad(cx - 8.2, cx + 8.2);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Recessed dark muzzle bore ellipse
  c.beginPath();
  c.ellipse(cx, y0 + 1.8, 5.2, 1.6, 0, 0, TAU);
  c.fillStyle = '#1c0d04';
  c.fill();

  // ══════════════════ 5. SCULPTED 24K GOLD RECEIVER FRAME & RUBY CABOCHON PIN ══════════════════
  // Stepped barrel-to-frame gold collar band (y0 + 59 .. y0 + 67)
  c.beginPath();
  c.roundRect(cx - 14.5, y0 + 59, 29, 8.5, 3);
  c.fillStyle = goldGrad(cx - 14.5, cx + 14.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.68)';
  c.lineWidth = 0.82;
  c.stroke();

  // Main sculpted 24K Gold Receiver Frame surrounding the ruby cylinder (y0 + 65 .. y0 + 125)
  c.beginPath();
  c.moveTo(cx - 16.5, y0 + 66);
  c.lineTo(cx + 16.5, y0 + 66);
  c.lineTo(cx + 17.5, y0 + 104);
  c.quadraticCurveTo(cx + 16, y0 + 116, cx + 12.5, y0 + 122);
  c.lineTo(cx - 11.5, y0 + 120);
  c.quadraticCurveTo(cx - 17.5, y0 + 114, cx - 17.5, y0 + 104);
  c.closePath();
  c.fillStyle = goldGrad(cx - 17.5, cx + 17.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.72)';
  c.lineWidth = 0.9;
  c.stroke();

  // Recessed triangular gold side-plate engraving behind the cylinder (matching image 1!)
  c.beginPath();
  c.moveTo(cx - 11, y0 + 107);
  c.lineTo(cx + 3, y0 + 107);
  c.lineTo(cx - 5, y0 + 117.5);
  c.closePath();
  c.fillStyle = '#92400e';
  c.fill();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.78;
  c.stroke();

  // Glowing pink-ruby cabochon gem pin in a gold bezel above the trigger guard (matching image 1!)
  c.save();
  c.translate(cx + 8.5, y0 + 114.5);
  c.beginPath();
  c.arc(0, 0, 4.2, 0, TAU);
  c.fillStyle = '#78350f';
  c.fill();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.75;
  c.stroke();
  c.beginPath();
  c.arc(0, 0, 3.1, 0, TAU);
  c.fillStyle = radial(c, -0.8, -0.8, 3.5, ['#ffe4e6', '#fb7185', '#e11d48', '#881337']);
  c.fill();
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(-0.9, -0.9, 0.9, 0, TAU);
  c.fill();
  c.restore();

  // ══════════════════ 6. FACETED TRANSLUCENT RUBY GEMSTONE CYLINDER DRUM (matching image 1!) ══════════════════
  c.save();
  // Recessed dark-ruby cylinder window border
  c.beginPath();
  c.roundRect(cx - 13, y0 + 68.5, 26, 36.5, 4);
  c.fillStyle = '#2e0210';
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.75)';
  c.lineWidth = 0.85;
  c.stroke();

  // Clip to the Ruby Cylinder Drum
  c.beginPath();
  c.roundRect(cx - 12, y0 + 69.5, 24, 34.5, 3.5);
  c.clip();

  // Rich ruby-magenta base gradient
  const rubG = c.createLinearGradient(cx - 12, y0 + 69, cx + 12, y0 + 104);
  rubG.addColorStop(0, '#881337');
  rubG.addColorStop(0.22, '#e11d48');
  rubG.addColorStop(0.5, '#fb7185');
  rubG.addColorStop(0.78, '#be123c');
  rubG.addColorStop(1, '#4c0519');
  c.fillStyle = rubG;
  c.fillRect(cx - 12, y0 + 69.5, 24, 34.5);

  // Warm fiery golden-orange inner crystal glow in the lower-center of the ruby cylinder (matching image 1!)
  const fireHeart = c.createRadialGradient(cx + 2, y0 + 91, 1, cx + 1, y0 + 90, 14);
  fireHeart.addColorStop(0, `rgba(254,249,195,${0.95 * pulse})`);
  fireHeart.addColorStop(0.35, `rgba(251,191,36,${0.82 * pulse})`);
  fireHeart.addColorStop(0.7, 'rgba(244,63,94,0.45)');
  fireHeart.addColorStop(1, 'rgba(136,19,55,0)');
  c.fillStyle = fireHeart;
  c.fillRect(cx - 12, y0 + 69.5, 24, 34.5);

  // Geometric polygonal ruby crystal facets across the drum
  c.fillStyle = 'rgba(255,228,236,0.28)';
  c.beginPath();
  c.moveTo(cx - 12, y0 + 70);
  c.lineTo(cx + 3, y0 + 70);
  c.lineTo(cx - 3, y0 + 86);
  c.lineTo(cx - 12, y0 + 82);
  c.closePath();
  c.fill();

  c.strokeStyle = 'rgba(255,228,236,0.48)';
  c.lineWidth = 0.75;
  c.beginPath();
  c.moveTo(cx - 11, y0 + 82);
  c.lineTo(cx - 2, y0 + 86);
  c.lineTo(cx + 4, y0 + 71);
  c.moveTo(cx - 2, y0 + 86);
  c.lineTo(cx + 2, y0 + 96);
  c.lineTo(cx + 11, y0 + 88);
  c.moveTo(cx - 2, y0 + 86);
  c.lineTo(cx - 9, y0 + 99);
  c.stroke();

  // Animated revolving oval cylinder flutes with warm amber-gold inner glow (matching image 1!)
  for (let i = 0; i < 6; i++) {
    const a = cylRot + (i / 6) * TAU + 0.52;
    const fx = cx + Math.sin(a) * 8.2;
    const z = Math.cos(a);
    if (z < 0.05) continue;
    const fw = Math.max(1.4, 3.2 * z);
    const fh = 11.5;
    const fy = y0 + 86.5;

    // Deep burgundy-amber fluted recess
    const flG = c.createLinearGradient(fx - fw, fy - fh, fx + fw, fy + fh);
    flG.addColorStop(0, '#4c0519');
    flG.addColorStop(0.45, '#d97706');
    flG.addColorStop(0.75, '#fbbf24');
    flG.addColorStop(1, '#881337');
    c.fillStyle = flG;
    c.beginPath();
    c.ellipse(fx, fy, fw, fh, 0, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(254,205,211,0.65)';
    c.lineWidth = 0.72;
    c.stroke();
  }

  // Glossy left specular streak on the ruby cylinder
  c.fillStyle = 'rgba(255,255,255,0.45)';
  c.beginPath();
  c.roundRect(cx - 10.2, y0 + 72, 2.6, 29, 1.3);
  c.fill();
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- EMERALD LASER
function emeraldLaser(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#064e3b', '#047857', 0.78);
  guard(c, cx, y0 + 100, '#022c22');
  rr(c, cx - 15, y0 + 50, 30, 80, 6, chrome(c, cx - 15, cx + 15), '#064e3b', 1.5);
  // emerald core (big rectangular step cut)
  c.save();
  c.translate(cx, y0 + 88);
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  c.shadowColor = '#34d399';
  c.shadowBlur = 16 * pulse;
  c.beginPath();
  c.moveTo(-8, -22);
  c.lineTo(8, -22);
  c.lineTo(11, -18);
  c.lineTo(11, 18);
  c.lineTo(8, 22);
  c.lineTo(-8, 22);
  c.lineTo(-11, 18);
  c.lineTo(-11, -18);
  c.closePath();
  c.fillStyle = lin(c, -11, 11, ['#065f46', '#6ee7b7', '#10b981', '#064e3b']);
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.lineWidth = 0.8;
  c.strokeRect(-6, -16, 12, 32);
  c.strokeRect(-3, -10, 6, 20);
  c.restore();
  // prongs + lens
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 6, y0 + 52);
    c.lineTo(cx + s * 14, y0 + 20);
    c.lineTo(cx + s * 9, y0 + 16);
    c.lineTo(cx + s * 3, y0 + 52);
    c.closePath();
    c.fillStyle = chrome(c, cx - 14, cx + 14);
    c.fill();
    c.strokeStyle = '#064e3b';
    c.lineWidth = 1;
    c.stroke();
  }
  gem(c, cx, y0 + 12, 9, '#d1fae5', '#10b981', '#064e3b');
  glow(c, cx, y0 + 8, 3, '#a7f3d0', 14);
}

// ------------------------------------------------------------- SAPPHIRE SHOTGUN
function sapphireShotgun(c: C, cx: number, y0: number, t: number, _ready: boolean) {
  const pulse = 0.74 + 0.26 * Math.sin(t * 5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.24
    ? 7.5 * Math.sin(Math.PI * gunState.sinceShot / 0.24) : 0;
  const k = gunState.sinceShot >= 0 && gunState.sinceShot < 0.16 ? gunState.sinceShot / 0.16 : 1;
  const cylRot = (gunState.shots - 1 + k) * (TAU / 6);

  c.save();
  c.translate(0, recoil);

  const silverGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#334155', '#94a3b8', '#f8fafc', '#ffffff', '#cbd5e1', '#475569', '#1e293b']);

  // Helper for faceted diamond-shaped sapphire gems inlaid into wood/silver
  const drawSapphireDiamond = (gx: number, gy: number, rx: number, ry: number, rot = 0) => {
    c.save();
    c.translate(gx, gy);
    c.rotate(rot);
    // Recessed bezel
    c.beginPath();
    c.moveTo(0, -ry - 1.4);
    c.lineTo(rx + 1.4, 0);
    c.lineTo(0, ry + 1.4);
    c.lineTo(-rx - 1.4, 0);
    c.closePath();
    c.fillStyle = '#1e293b';
    c.fill();
    // Glowing cyan-blue sapphire diamond
    c.beginPath();
    c.moveTo(0, -ry);
    c.lineTo(rx, 0);
    c.lineTo(0, ry);
    c.lineTo(-rx, 0);
    c.closePath();
    c.fillStyle = lin(c, -rx, rx, ['#e0f2fe', '#38bdf8', '#0284c7', '#1e3a8a']);
    c.fill();
    c.strokeStyle = '#bae6fd';
    c.lineWidth = 0.7;
    c.stroke();
    // Bright upper-left facet
    c.fillStyle = 'rgba(255,255,255,0.75)';
    c.beginPath();
    c.moveTo(0, -ry);
    c.lineTo(-rx, 0);
    c.lineTo(0, 0);
    c.closePath();
    c.fill();
    c.restore();
  };

  // ══════════════════ 1. CARVED WALNUT WOOD STOCK WITH SAPPHIRE CRYSTAL BUTTPLATE & GEM INLAYS (matching image 2!) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 10, y0 + 148);
  c.lineTo(cx + 12, y0 + 150);
  c.bezierCurveTo(cx + 18, y0 + 172, cx + 31, y0 + 194, cx + 44, y0 + 216);
  c.lineTo(cx + 17, y0 + 232);
  c.bezierCurveTo(cx + 7, y0 + 205, cx - 3, y0 + 178, cx - 10, y0 + 148);
  c.closePath();
  const woodG = c.createLinearGradient(cx - 10, y0 + 150, cx + 44, y0 + 228);
  woodG.addColorStop(0, '#3b1d0b');
  woodG.addColorStop(0.28, '#7c431e');
  woodG.addColorStop(0.55, '#9a582b');
  woodG.addColorStop(0.82, '#623315');
  woodG.addColorStop(1, '#2b1407');
  c.fillStyle = woodG;
  c.fill();
  c.strokeStyle = 'rgba(38,18,7,0.72)';
  c.lineWidth = 0.85;
  c.stroke();
  c.clip();

  // Carved organic walnut wood-grain grooves
  c.strokeStyle = 'rgba(38,18,7,0.52)';
  c.lineWidth = 1.1;
  for (const ox of [-4, 3, 10, 17]) {
    c.beginPath();
    c.moveTo(cx + ox, y0 + 152);
    c.quadraticCurveTo(cx + ox + 10, y0 + 188, cx + ox + 22, y0 + 226);
    c.stroke();
  }

  // Glowing Ice-Blue Sapphire Crystal Buttplate with jagged crystal teeth (matching image 2!)
  c.beginPath();
  c.moveTo(cx + 15, y0 + 233);
  c.lineTo(cx + 7, y0 + 210);
  c.lineTo(cx + 13, y0 + 215);
  c.lineTo(cx + 16, y0 + 209);
  c.lineTo(cx + 22, y0 + 219);
  c.lineTo(cx + 35, y0 + 212);
  c.lineTo(cx + 32, y0 + 202);
  c.lineTo(cx + 45, y0 + 215);
  c.closePath();
  c.fillStyle = lin(c, cx + 10, cx + 45, ['#e0f2fe', '#38bdf8', '#0284c7', '#1e3a8a']);
  c.fill();
  c.strokeStyle = '#bae6fd';
  c.lineWidth = 0.85;
  c.stroke();
  c.restore();

  // 3 Faceted Diamond Sapphire Gems inlaid into the walnut stock (matching image 2!)
  drawSapphireDiamond(cx + 17.5, y0 + 191, 5.2, 11.5, -0.42);
  drawSapphireDiamond(cx + 4.5, y0 + 173, 2.8, 6.2, -0.38);
  drawSapphireDiamond(cx + 13.5, y0 + 166, 3.2, 6.8, -0.38);

  // ══════════════════ 2. FROST-SILVER TRIGGER GUARD & CURVED SILVER TRIGGER ══════════════════
  // Trigger blade
  c.beginPath();
  c.moveTo(cx + 11, y0 + 132);
  c.quadraticCurveTo(cx + 19, y0 + 140, cx + 14, y0 + 149);
  c.quadraticCurveTo(cx + 9.5, y0 + 142, cx + 9, y0 + 134);
  c.closePath();
  c.fillStyle = silverGrad(cx + 9, cx + 19);
  c.fill();

  // Frost-silver trigger guard with glowing cyan outer energy rim
  c.beginPath();
  c.moveTo(cx + 12, y0 + 121);
  c.bezierCurveTo(cx + 27, y0 + 127, cx + 29, y0 + 149, cx + 18, y0 + 157);
  c.quadraticCurveTo(cx + 11, y0 + 160, cx + 8, y0 + 152);
  c.lineTo(cx + 10, y0 + 148);
  c.quadraticCurveTo(cx + 14, y0 + 153, cx + 18, y0 + 150);
  c.bezierCurveTo(cx + 23, y0 + 144, cx + 22, y0 + 130, cx + 12, y0 + 126);
  c.closePath();
  c.fillStyle = silverGrad(cx + 8, cx + 28);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.8;
  c.stroke();

  // Cyan energy accent on front of trigger guard
  c.strokeStyle = `rgba(56,189,248,${0.75 * pulse})`;
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx + 13.5, y0 + 121);
  c.quadraticCurveTo(cx + 27, y0 + 129, cx + 24, y0 + 148);
  c.stroke();

  // ══════════════════ 3. PURE FACETED SAPPHIRE CRYSTAL BARRELS & CARVED WOOD FOREND (matching image 2!) ══════════════════
  // Secondary lower pointed Sapphire Crystal Spike protruding ahead of the wood forend (y0 + 18 .. y0 + 48)
  c.save();
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 10 * pulse;
  c.beginPath();
  c.moveTo(cx + 5, y0 + 46);
  c.lineTo(cx + 18, y0 + 17);
  c.lineTo(cx + 20.5, y0 + 27);
  c.lineTo(cx + 15.5, y0 + 47);
  c.closePath();
  c.fillStyle = lin(c, cx + 5, cx + 21, ['#bae6fd', '#38bdf8', '#0284c7', '#1e3a8a']);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.72)';
  c.lineWidth = 0.8;
  c.stroke();
  // Internal white facet ridge on secondary crystal spike
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx + 18, y0 + 17);
  c.lineTo(cx + 12, y0 + 45);
  c.stroke();
  c.restore();

  // Main Upper Faceted Sapphire & Ice-Blue Crystal Barrel (cx - 12.5 .. cx + 8.5, y0 + 3 .. y0 + 100)
  c.save();
  c.shadowColor = '#0ea5e9';
  c.shadowBlur = 12 * pulse;

  // Shark-fin Sapphire Crystal Front Sight on upper-left (-x) near muzzle (y0 + 8 .. y0 + 28)
  c.beginPath();
  c.moveTo(cx - 10, y0 + 7);
  c.lineTo(cx - 17, y0 + 12);
  c.lineTo(cx - 16, y0 + 24);
  c.lineTo(cx - 10, y0 + 29);
  c.closePath();
  c.fillStyle = lin(c, cx - 17, cx - 10, ['#ffffff', '#bae6fd', '#38bdf8', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.68)';
  c.lineWidth = 0.75;
  c.stroke();

  // Left (sunlit ice-cyan) crystal barrel plane
  c.beginPath();
  c.moveTo(cx - 6, y0 + 2);
  c.lineTo(cx - 12.5, y0 + 10);
  c.lineTo(cx - 12.5, y0 + 100);
  c.lineTo(cx - 2.5, y0 + 100);
  c.lineTo(cx - 2.5, y0 + 5);
  c.closePath();
  c.fillStyle = lin(c, cx - 12.5, cx - 2.5, ['#7dd3fc', '#e0f2fe', '#ffffff', '#bae6fd']);
  c.fill();

  // Center (vibrant sky-sapphire) crystal barrel plane
  c.beginPath();
  c.moveTo(cx - 6, y0 + 2);
  c.lineTo(cx + 3.5, y0 + 4);
  c.lineTo(cx + 3.5, y0 + 100);
  c.lineTo(cx - 2.5, y0 + 100);
  c.lineTo(cx - 2.5, y0 + 5);
  c.closePath();
  c.fillStyle = lin(c, cx - 2.5, cx + 3.5, ['#38bdf8', '#0ea5e9', '#0284c7']);
  c.fill();

  // Right (deep royal-sapphire) crystal barrel plane
  c.beginPath();
  c.moveTo(cx + 3.5, y0 + 4);
  c.lineTo(cx + 8.5, y0 + 11);
  c.lineTo(cx + 8.5, y0 + 100);
  c.lineTo(cx + 3.5, y0 + 100);
  c.closePath();
  c.fillStyle = lin(c, cx + 3.5, cx + 8.5, ['#0369a1', '#1d4ed8', '#1e3a8a']);
  c.fill();

  // Outer delicate sapphire barrel contour
  c.beginPath();
  c.moveTo(cx - 6, y0 + 2);
  c.lineTo(cx + 3.5, y0 + 4);
  c.lineTo(cx + 8.5, y0 + 11);
  c.lineTo(cx + 8.5, y0 + 100);
  c.lineTo(cx - 12.5, y0 + 100);
  c.lineTo(cx - 12.5, y0 + 10);
  c.closePath();
  c.strokeStyle = 'rgba(12,74,110,0.72)';
  c.lineWidth = 0.85;
  c.stroke();

  // Crisp white geometric crystal facet seams along the sapphire barrel
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx - 2.5, y0 + 5);
  c.lineTo(cx - 2.5, y0 + 98);
  c.moveTo(cx + 3.5, y0 + 4);
  c.lineTo(cx + 3.5, y0 + 98);
  // Diagonal crystal cleavage lines
  c.moveTo(cx - 12.5, y0 + 26);
  c.lineTo(cx - 2.5, y0 + 19);
  c.lineTo(cx + 3.5, y0 + 24);
  c.moveTo(cx - 12.5, y0 + 56);
  c.lineTo(cx - 2.5, y0 + 48);
  c.lineTo(cx + 3.5, y0 + 54);
  c.moveTo(cx - 12.5, y0 + 82);
  c.lineTo(cx - 2.5, y0 + 75);
  c.stroke();
  c.restore();

  // Carved Walnut Wood Forend with Frost-Silver Cap & Glowing Cyan Filigree (cx + 4.5 .. cx + 18, y0 + 40 .. y0 + 98)
  c.beginPath();
  c.moveTo(cx + 4.5, y0 + 42);
  c.lineTo(cx + 15.5, y0 + 42);
  c.quadraticCurveTo(cx + 18.5, y0 + 46, cx + 18, y0 + 54);
  c.lineTo(cx + 16.5, y0 + 97);
  c.lineTo(cx + 4.5, y0 + 97);
  c.closePath();
  c.fillStyle = lin(c, cx + 4.5, cx + 18, ['#3b1d0b', '#854a24', '#623315', '#2b1407']);
  c.fill();
  c.strokeStyle = 'rgba(38,18,7,0.72)';
  c.lineWidth = 0.82;
  c.stroke();

  // Frost-silver nose cap at top of wood forend (y0 + 40 .. y0 + 51)
  c.beginPath();
  c.moveTo(cx + 4, y0 + 40);
  c.lineTo(cx + 15.5, y0 + 40);
  c.quadraticCurveTo(cx + 18.5, y0 + 44, cx + 18, y0 + 50);
  c.lineTo(cx + 4, y0 + 52);
  c.closePath();
  c.fillStyle = silverGrad(cx + 4, cx + 18.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.68)';
  c.lineWidth = 0.78;
  c.stroke();

  // Glowing neon-cyan S-scroll filigree vine inlaid into the wood forend (matching image 2!)
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 7 * pulse;
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 1.5;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(cx + 13, y0 + 55);
  c.bezierCurveTo(cx + 16, y0 + 64, cx + 7, y0 + 68, cx + 9, y0 + 78);
  c.bezierCurveTo(cx + 11, y0 + 85, cx + 15, y0 + 84, cx + 13, y0 + 77);
  c.moveTo(cx + 9, y0 + 78);
  c.quadraticCurveTo(cx + 8, y0 + 88, cx + 13, y0 + 92);
  c.stroke();
  c.strokeStyle = '#e0f2fe';
  c.lineWidth = 0.7;
  c.stroke();
  c.restore();

  // ══════════════════ 4. ENGRAVED FROST-SILVER RECEIVER, ICE-CRYSTAL CREST & SAPPHIRE CHAMBER ══════════════════
  // Jagged glowing Ice-Crystal Dorsal Crest & Hammer Spur along upper-left (-x) of receiver (matching image 2!)
  c.save();
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 9 * pulse;
  c.beginPath();
  c.moveTo(cx - 13, y0 + 90);
  c.lineTo(cx - 18.5, y0 + 94);
  c.lineTo(cx - 16.5, y0 + 104);
  c.lineTo(cx - 19, y0 + 112);
  c.lineTo(cx - 16.5, y0 + 119);
  // Pointed sapphire crystal hammer spur
  c.lineTo(cx - 23.5, y0 + 126);
  c.lineTo(cx - 21.5, y0 + 131);
  c.lineTo(cx - 13, y0 + 132);
  c.closePath();
  c.fillStyle = lin(c, cx - 23.5, cx - 13, ['#ffffff', '#bae6fd', '#38bdf8', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.68)';
  c.lineWidth = 0.78;
  c.stroke();
  c.restore();

  // Main Sculpted Frost-Silver / Platinum Receiver (y0 + 88 .. y0 + 156)
  c.beginPath();
  c.moveTo(cx - 13.5, y0 + 90);
  c.lineTo(cx + 5, y0 + 86);
  c.lineTo(cx + 15.5, y0 + 96);
  c.lineTo(cx + 15.5, y0 + 124);
  c.quadraticCurveTo(cx + 14, y0 + 144, cx + 11, y0 + 156);
  c.lineTo(cx - 11, y0 + 152);
  c.quadraticCurveTo(cx - 15.5, y0 + 136, cx - 15.5, y0 + 102);
  c.closePath();
  c.fillStyle = silverGrad(cx - 15.5, cx + 15.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.72)';
  c.lineWidth = 0.88;
  c.stroke();

  // Inset Glowing Cyan Triangular Runic Gems on the silver receiver (matching image 2!)
  // Lower-rear cyan triangle below the cylinder
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 7 * pulse;
  c.beginPath();
  c.moveTo(cx - 9.5, y0 + 132);
  c.lineTo(cx + 3.5, y0 + 133);
  c.lineTo(cx - 4.5, y0 + 144.5);
  c.closePath();
  c.fillStyle = lin(c, cx - 9.5, cx + 3.5, ['#ffffff', '#7dd3fc', '#0ea5e9']);
  c.fill();
  c.strokeStyle = '#0369a1';
  c.lineWidth = 0.75;
  c.stroke();

  // Upper-front cyan triangle ahead of the cylinder
  c.beginPath();
  c.moveTo(cx + 4, y0 + 97);
  c.lineTo(cx + 12, y0 + 95);
  c.lineTo(cx + 9.5, y0 + 103);
  c.closePath();
  c.fillStyle = lin(c, cx + 4, cx + 12, ['#ffffff', '#7dd3fc', '#0ea5e9']);
  c.fill();
  c.stroke();
  c.restore();

  // Glowing Faceted Sapphire Cylinder Drum inside the silver receiver window (y0 + 101 .. y0 + 129)
  c.save();
  c.beginPath();
  c.roundRect(cx - 10.5, y0 + 101, 21, 28, 3.5);
  c.fillStyle = '#082f49';
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.75)';
  c.lineWidth = 0.82;
  c.stroke();
  c.clip();

  const sapCyl = c.createLinearGradient(cx - 10.5, y0 + 101, cx + 10.5, y0 + 129);
  sapCyl.addColorStop(0, '#1e3a8a');
  sapCyl.addColorStop(0.3, '#0284c7');
  sapCyl.addColorStop(0.58, '#38bdf8');
  sapCyl.addColorStop(0.8, '#bae6fd');
  sapCyl.addColorStop(1, '#1d4ed8');
  c.fillStyle = sapCyl;
  c.fillRect(cx - 10.5, y0 + 101, 21, 28);

  // Revolving sapphire cylinder flutes
  for (let i = 0; i < 6; i++) {
    const a = cylRot + (i / 6) * TAU + 0.5;
    const fx = cx + Math.sin(a) * 6.8;
    const z = Math.cos(a);
    if (z < 0.05) continue;
    const fw = Math.max(1.2, 2.6 * z);
    c.beginPath();
    c.ellipse(fx, y0 + 115, fw, 9, 0, 0, TAU);
    c.fillStyle = lin(c, fx - fw, fx + fw, ['#0c4a6e', '#0ea5e9', '#7dd3fc']);
    c.fill();
    c.strokeStyle = 'rgba(224,242,254,0.7)';
    c.lineWidth = 0.68;
    c.stroke();
  }

  // Glossy white-cyan specular highlight on sapphire drum
  c.fillStyle = 'rgba(255,255,255,0.52)';
  c.beginPath();
  c.roundRect(cx - 8.5, y0 + 103, 2.4, 24, 1.2);
  c.fill();
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- CRYSTAL CANNON
function crystalCannon(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.74 + 0.26 * Math.sin(t * 4.5);
  const recoil = gunState.sinceShot >= 0 && gunState.sinceShot < 0.25
    ? 7.5 * Math.sin(Math.PI * gunState.sinceShot / 0.25) : 0;

  c.save();
  c.translate(0, recoil);

  // Helper to draw a true 3D multi-faceted hexagonal amethyst/quartz crystal spire (matching image 4!)
  const drawCrystalSpire = (
    x: number,
    y: number,
    w: number,
    h: number,
    ang: number,
    flare = false,
  ) => {
    c.save();
    c.translate(x, y);
    c.rotate(ang);

    const shoulderY = -h * 0.68;
    const midLeftX = -w * 0.28;
    const midRightX = w * 0.34;
    const waistY = -h * 0.62;

    // 1. Left shaft plane (bright white-pink to lavender)
    c.beginPath();
    c.moveTo(-w * 0.82, 0);
    c.lineTo(-w, shoulderY);
    c.lineTo(midLeftX, waistY);
    c.lineTo(-w * 0.22, 0);
    c.closePath();
    c.fillStyle = lin(c, -w, midLeftX, ['#ffffff', '#fae8ff', '#f5d0fe']);
    c.fill();

    // 2. Center shaft plane (vibrant orchid-magenta)
    c.beginPath();
    c.moveTo(-w * 0.22, 0);
    c.lineTo(midLeftX, waistY);
    c.lineTo(midRightX, shoulderY * 0.96);
    c.lineTo(w * 0.28, 0);
    c.closePath();
    c.fillStyle = lin(c, midLeftX, midRightX, ['#f5d0fe', '#e879f9', '#d946ef', '#a855f7']);
    c.fill();

    // 3. Right shaft plane (deep royal amethyst)
    c.beginPath();
    c.moveTo(w * 0.28, 0);
    c.lineTo(midRightX, shoulderY * 0.96);
    c.lineTo(w, shoulderY * 0.92);
    c.lineTo(w * 0.82, 0);
    c.closePath();
    c.fillStyle = lin(c, midRightX, w, ['#a855f7', '#7e22ce', '#581c87']);
    c.fill();

    // 4. Upper-left pyramid termination facet (blinding white-pink)
    c.beginPath();
    c.moveTo(0, -h);
    c.lineTo(-w, shoulderY);
    c.lineTo(midLeftX, waistY);
    c.closePath();
    c.fillStyle = lin(c, -w, 0, ['#ffffff', '#fdf4ff', '#f5d0fe']);
    c.fill();

    // 5. Upper-center diamond termination facet (luminous pink-orchid)
    c.beginPath();
    c.moveTo(0, -h);
    c.lineTo(midLeftX, waistY);
    c.lineTo(midRightX, shoulderY * 0.96);
    c.closePath();
    c.fillStyle = lin(c, midLeftX, midRightX, ['#ffffff', '#fae8ff', '#e879f9']);
    c.fill();

    // 6. Upper-right pyramid termination facet (rich violet-indigo)
    c.beginPath();
    c.moveTo(0, -h);
    c.lineTo(midRightX, shoulderY * 0.96);
    c.lineTo(w, shoulderY * 0.92);
    c.closePath();
    c.fillStyle = lin(c, 0, w, ['#d946ef', '#9333ea', '#6b21a8']);
    c.fill();

    // Crisp delicate outer crystal silhouette
    c.beginPath();
    c.moveTo(0, -h);
    c.lineTo(w, shoulderY * 0.92);
    c.lineTo(w * 0.82, 0);
    c.lineTo(-w * 0.82, 0);
    c.lineTo(-w, shoulderY);
    c.closePath();
    c.strokeStyle = 'rgba(88,28,135,0.62)';
    c.lineWidth = 0.78;
    c.stroke();

    // Razor-sharp white internal crystal facet ridges
    c.strokeStyle = 'rgba(255,255,255,0.88)';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(0, -h);
    c.lineTo(midLeftX, waistY);
    c.lineTo(-w * 0.22, 0);
    c.moveTo(0, -h);
    c.lineTo(midRightX, shoulderY * 0.96);
    c.lineTo(w * 0.28, 0);
    c.moveTo(-w, shoulderY);
    c.lineTo(midLeftX, waistY);
    c.lineTo(midRightX, shoulderY * 0.96);
    c.lineTo(w, shoulderY * 0.92);
    c.stroke();

    // Optional starburst lens flare on the primary spire's upper facet junction (matching image 4!)
    if (flare) {
      glow(c, midLeftX + 1.5, waistY + 1, 5.5 * pulse, '#ffffff', 14);
      star(c, midLeftX + 1.5, waistY + 1, 6.5 * pulse, '#ffffff', 4);
    }

    c.restore();
  };

  // Helper to draw a detached floating faceted amethyst shard (matching image 4!)
  const drawFloatingShard = (sx: number, sy: number, sw: number, sh: number, rot: number) => {
    c.save();
    c.translate(sx, sy);
    c.rotate(rot);
    c.shadowColor = '#e879f9';
    c.shadowBlur = 8 * pulse;
    c.beginPath();
    c.moveTo(0, -sh);
    c.lineTo(sw, -sh * 0.15);
    c.lineTo(sw * 0.45, sh);
    c.lineTo(-sw * 0.55, sh * 0.85);
    c.lineTo(-sw, -sh * 0.2);
    c.closePath();
    c.fillStyle = lin(c, -sw, sw, ['#ffffff', '#f5d0fe', '#d946ef', '#7e22ce']);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 0.72;
    c.stroke();
    // Internal facet lines
    c.beginPath();
    c.moveTo(0, -sh);
    c.lineTo(-sw * 0.1, sh * 0.1);
    c.lineTo(sw * 0.45, sh);
    c.moveTo(-sw, -sh * 0.2);
    c.lineTo(-sw * 0.1, sh * 0.1);
    c.lineTo(sw, -sh * 0.15);
    c.stroke();
    c.restore();
  };

  // ══════════════════ 1. STEPPED METALLIC CANNON BARREL DRUM BEHIND THE CRYSTALS (matching image 4!) ══════════════════
  c.save();
  c.translate(cx + 2, y0 + 58);
  c.rotate(0.18);
  for (const [ry, rw, rh] of [
    [-16, 20, 14],
    [-8, 22.5, 16],
    [0, 24, 18],
  ] as [number, number, number][]) {
    c.beginPath();
    c.roundRect(-rw, ry, rw * 2, rh, 4);
    c.fillStyle = lin(c, -rw, rw, ['#1a1626', '#52476b', '#9d8ec4', '#493e63', '#14111f']);
    c.fill();
    c.strokeStyle = 'rgba(20,16,32,0.7)';
    c.lineWidth = 0.8;
    c.stroke();
  }
  c.restore();

  // ══════════════════ 2. COLOSSAL ERUPTING CLUSTER OF FACETED QUARTZ & AMETHYST SPIRES (matching image 4!) ══════════════════
  c.save();
  c.shadowColor = '#e879f9';
  c.shadowBlur = 14 * pulse;

  // Back/outer fan of smaller crystal spikes on left (-x) and right (+x)
  drawCrystalSpire(cx - 21, y0 + 78, 3.8, 22, -0.72);
  drawCrystalSpire(cx - 17, y0 + 73, 4.8, 36, -0.48);
  drawCrystalSpire(cx - 12, y0 + 69, 5.8, 46, -0.30);

  // Right-side fanning crystal spikes erupting along the right flank of the crown (matching image 4!)
  drawCrystalSpire(cx + 15, y0 + 98, 4.2, 22, 1.05);
  drawCrystalSpire(cx + 17, y0 + 91, 4.8, 28, 0.88);
  drawCrystalSpire(cx + 17, y0 + 82, 6.2, 42, 0.68);
  drawCrystalSpire(cx + 14, y0 + 73, 6.0, 38, 0.46);

  // Tall secondary upper-left crystal spire
  drawCrystalSpire(cx - 7.5, y0 + 66, 8.2, 60, -0.15);

  // GIANT CENTRAL PRIMARY FACETED CRYSTAL SPIRE (towering to y0 - 8 with lens flare!)
  drawCrystalSpire(cx + 2, y0 + 70, 11.8, 78, 0.08, true);
  c.restore();

  // ══════════════════ 3. DARK OBSIDIAN-STEEL GOTHIC ARMOR HOUSING, RUNE CORE & JAGGED CROWN ══════════════════
  // Lower contoured dark obsidian-slate cannon housing & handle (y0 + 76 .. y0 + 184)
  c.beginPath();
  c.moveTo(cx - 19.5, y0 + 76);
  c.lineTo(cx + 19.5, y0 + 78);
  c.lineTo(cx + 16, y0 + 142);
  c.lineTo(cx + 13.5, y0 + 180);
  c.quadraticCurveTo(cx, y0 + 186, cx - 14.5, y0 + 180);
  c.lineTo(cx - 17, y0 + 140);
  c.closePath();
  c.fillStyle = lin(c, cx - 20, cx + 20, [
    '#0d0e17',
    '#282a40',
    '#494d6e',
    '#25273b',
    '#121320',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(10,11,18,0.72)';
  c.lineWidth = 0.88;
  c.stroke();

  // Glowing Heart/Shield-Shaped Amethyst Energy Core Window on upper body (y0 + 92 .. y0 + 128, matching image 4!)
  c.save();
  // Sculpted dark-silver shield bezel around the energy window
  c.beginPath();
  c.moveTo(cx - 13.5, y0 + 95);
  c.quadraticCurveTo(cx - 2, y0 + 89, cx + 11.5, y0 + 96);
  c.quadraticCurveTo(cx + 14, y0 + 114, cx - 1, y0 + 129);
  c.quadraticCurveTo(cx - 15, y0 + 114, cx - 13.5, y0 + 95);
  c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 14, ['#1e2030', '#94a3b8', '#e2e8f0', '#475569', '#141622']);
  c.fill();
  c.strokeStyle = 'rgba(12,14,24,0.72)';
  c.lineWidth = 0.82;
  c.stroke();

  // Inner glowing amethyst-pink energy chamber
  c.beginPath();
  c.moveTo(cx - 10.5, y0 + 98);
  c.quadraticCurveTo(cx - 2, y0 + 93, cx + 8.5, y0 + 99);
  c.quadraticCurveTo(cx + 10.5, y0 + 112, cx - 1, y0 + 124.5);
  c.quadraticCurveTo(cx - 11.5, y0 + 112, cx - 10.5, y0 + 98);
  c.closePath();
  const coreG = c.createRadialGradient(cx - 3, y0 + 106, 1, cx - 1, y0 + 109, 15);
  coreG.addColorStop(0, '#ffffff');
  coreG.addColorStop(0.35, '#f5d0fe');
  coreG.addColorStop(0.7, '#c026d3');
  coreG.addColorStop(1, '#3b0764');
  c.fillStyle = coreG;
  c.fill();
  c.clip();

  // Crackling bright pink-white energy veins inside the shield window (matching image 4!)
  c.strokeStyle = `rgba(255,255,255,${0.85 * pulse})`;
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 5, y0 + 96);
  c.lineTo(cx - 2, y0 + 105);
  c.lineTo(cx + 5, y0 + 102);
  c.moveTo(cx - 2, y0 + 105);
  c.lineTo(cx - 6, y0 + 114);
  c.lineTo(cx + 1, y0 + 120);
  c.stroke();
  c.restore();

  // Glowing Neon-Violet Arcane Runes etched in the recessed dark band (y0 + 132 .. y0 + 152, matching image 4!)
  c.save();
  c.shadowColor = '#d946ef';
  c.shadowBlur = 7 * pulse;
  c.strokeStyle = '#f0abfc';
  c.lineWidth = 1.25;
  c.lineCap = 'round';
  // Upper & lower glowing violet rune borders
  c.beginPath();
  c.moveTo(cx - 12, y0 + 132);
  c.quadraticCurveTo(cx, y0 + 128, cx + 13, y0 + 134);
  c.moveTo(cx - 11, y0 + 147);
  c.quadraticCurveTo(cx, y0 + 141, cx + 12, y0 + 148);
  c.stroke();
  // Ancient angular rune glyphs between the borders
  for (let i = 0; i < 4; i++) {
    const rx = cx - 8 + i * 5.2;
    const ry = y0 + 138 + (i % 2) * 1.5;
    c.beginPath();
    c.moveTo(rx - 1.5, ry - 2.5);
    c.lineTo(rx + 1.5, ry - 0.5);
    c.lineTo(rx - 1, ry + 2.5);
    c.stroke();
  }
  c.restore();

  // Criss-crossing sculpted dark-silver armor straps across the lower body (matching image 4!)
  c.beginPath();
  c.moveTo(cx - 16.5, y0 + 108);
  c.quadraticCurveTo(cx - 9, y0 + 138, cx - 13, y0 + 176);
  c.lineTo(cx - 7.5, y0 + 178);
  c.quadraticCurveTo(cx - 3.5, y0 + 138, cx - 12, y0 + 104);
  c.closePath();
  c.fillStyle = lin(c, cx - 17, cx - 4, ['#1e2030', '#cbd5e1', '#ffffff', '#64748b', '#141622']);
  c.fill();
  c.strokeStyle = 'rgba(12,14,24,0.7)';
  c.lineWidth = 0.78;
  c.stroke();

  // Jagged Multi-Peak Dark-Steel Gothic Crown Collar clasping the crystal base (y0 + 60 .. y0 + 96, matching image 4!)
  c.beginPath();
  c.moveTo(cx - 21.5, y0 + 84);
  c.lineTo(cx - 17, y0 + 69);
  c.lineTo(cx - 11, y0 + 75);
  // Central tall crown peak holding the diamond amethyst gem
  c.lineTo(cx - 1, y0 + 60);
  c.lineTo(cx + 8, y0 + 75);
  // Right crown peaks
  c.lineTo(cx + 15.5, y0 + 68);
  c.lineTo(cx + 15, y0 + 78);
  c.lineTo(cx + 22, y0 + 74);
  c.lineTo(cx + 18, y0 + 96);
  c.lineTo(cx + 10, y0 + 92);
  c.lineTo(cx + 6, y0 + 84);
  c.lineTo(cx - 8, y0 + 84);
  c.lineTo(cx - 14, y0 + 90);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 22, [
    '#141622',
    '#475569',
    '#cbd5e1',
    '#f8fafc',
    '#64748b',
    '#272a3f',
    '#0f111a',
  ]);
  c.fill();
  c.strokeStyle = 'rgba(10,11,18,0.75)';
  c.lineWidth = 0.88;
  c.stroke();

  // Crisp silver bevel highlights along the jagged crown peaks
  c.strokeStyle = 'rgba(255,255,255,0.78)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - 17, y0 + 69.5);
  c.lineTo(cx - 11, y0 + 75.5);
  c.lineTo(cx - 1, y0 + 61);
  c.lineTo(cx + 8, y0 + 75.5);
  c.lineTo(cx + 15.5, y0 + 68.5);
  c.stroke();

  // Inset Faceted Amethyst Diamond Gem in the center peak of the dark-steel crown (matching image 4!)
  c.save();
  c.translate(cx - 1, y0 + 74);
  c.beginPath();
  c.moveTo(0, -8.5);
  c.lineTo(6.8, 0);
  c.lineTo(0, 8.5);
  c.lineTo(-6.8, 0);
  c.closePath();
  c.fillStyle = '#14111f';
  c.fill();

  c.beginPath();
  c.moveTo(0, -7);
  c.lineTo(5.5, 0);
  c.lineTo(0, 7);
  c.lineTo(-5.5, 0);
  c.closePath();
  c.fillStyle = lin(c, -5.5, 5.5, ['#fae8ff', '#e879f9', '#a21caf', '#581c87']);
  c.fill();
  c.strokeStyle = '#f5d0fe';
  c.lineWidth = 0.72;
  c.stroke();
  // Inner diamond table facet
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.beginPath();
  c.moveTo(0, -7);
  c.lineTo(-5.5, 0);
  c.lineTo(0, 0);
  c.closePath();
  c.fill();
  c.restore();

  // ══════════════════ 4. 3 LEVITATING DETACHED FACETED AMETHYST SHARDS (matching image 4!) ══════════════════
  const bob1 = Math.sin(t * 3.8) * 2.5;
  const bob2 = Math.cos(t * 3.4 + 1.2) * 2.8;
  const bob3 = Math.sin(t * 4.1 + 2.4) * 2.4;
  // Upper-left floating shard
  drawFloatingShard(cx - 18, y0 + 20 + bob1, 3.2, 8.5, -0.12);
  // Mid-right floating shard
  drawFloatingShard(cx + 26, y0 + 44 + bob2, 4.8, 10.5, 0.38);
  // Lower-right floating shard
  drawFloatingShard(cx + 12, y0 + 132 + bob3, 5.5, 11.5, 0.65);

  c.restore();
}

// ------------------------------------------------------------- BEE RIFLE
function beeRifle(c: C, cx: number, y0: number, t: number) {
  // honeycomb stock
  c.beginPath();
  c.moveTo(cx - 12, y0 + 232);
  c.lineTo(cx + 14, y0 + 232);
  c.lineTo(cx + 30, y0 + 300);
  c.lineTo(cx - 12, y0 + 300);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 30, ['#a16207', '#fbbf24', '#b45309']);
  c.fill();
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(120,53,15,0.5)';
  c.lineWidth = 1;
  for (let r2 = 0; r2 < 8; r2++) {
    for (let k = 0; k < 5; k++) {
      const hx = cx - 10 + k * 9 + (r2 % 2) * 4.5;
      const hy = y0 + 236 + r2 * 8;
      c.beginPath();
      for (let i = 0; i < 6; i++) c.lineTo(hx + Math.cos((i / 6) * TAU) * 4.5, hy + Math.sin((i / 6) * TAU) * 4.5);
      c.closePath();
      c.stroke();
    }
  }
  c.restore();
  c.strokeStyle = '#451a03';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 12, y0 + 232);
  c.lineTo(cx + 14, y0 + 232);
  c.lineTo(cx + 30, y0 + 300);
  c.lineTo(cx - 12, y0 + 300);
  c.closePath();
  c.stroke();
  // grip
  c.beginPath();
  c.moveTo(cx + 12, y0 + 214);
  c.lineTo(cx + 40, y0 + 240);
  c.lineTo(cx + 30, y0 + 250);
  c.lineTo(cx + 12, y0 + 232);
  c.closePath();
  c.fillStyle = '#111';
  c.fill();
  guard(c, cx - 8, y0 + 216, '#111', 11);
  // body stripes (yellow/black)
  c.save();
  c.beginPath();
  c.roundRect(cx - 11, y0 + 100, 22, 134, 5);
  c.clip();
  for (let i = 0; i < 12; i++) {
    c.fillStyle = i % 2 ? '#111111' : '#facc15';
    c.fillRect(cx - 11, y0 + 100 + i * 11.2, 22, 11.2);
  }
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.fillRect(cx - 7, y0 + 100, 3, 134);
  c.restore();
  // translucent wings on sides
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 12, y0 + 150);
    c.rotate(s * (0.5 + Math.sin(t * 30) * 0.08));
    c.beginPath();
    c.ellipse(s * 12, -6, 14, 7, 0, 0, TAU);
    c.fillStyle = 'rgba(224,242,254,0.55)';
    c.fill();
    c.strokeStyle = 'rgba(148,163,184,0.8)';
    c.lineWidth = 0.8;
    c.stroke();
    c.restore();
  }
  // barrel
  rr(c, cx - 3, y0 + 10, 6, 94, 1, steel(c, cx - 3, cx + 3));
  // stinger muzzle
  c.beginPath();
  c.moveTo(cx - 5, y0 + 14);
  c.lineTo(cx, y0 - 6);
  c.lineTo(cx + 5, y0 + 14);
  c.closePath();
  c.fillStyle = '#111';
  c.fill();
  // scope (bee shaped)
  rr(c, cx - 30, y0 + 150, 13, 70, 6, '#111', '#000', 1);
  for (let i = 0; i < 4; i++) {
    c.fillStyle = '#facc15';
    c.fillRect(cx - 30, y0 + 160 + i * 14, 13, 6);
  }
  c.beginPath();
  c.ellipse(cx - 23.5, y0 + 148, 8, 2.5, 0, 0, TAU);
  c.fillStyle = radial(c, cx - 23.5, y0 + 148, 8, ['#fef3c7', '#d97706', '#451a03']);
  c.fill();
}

// ------------------------------------------------------------- CHARGE BLASTER (arm cannon)
function chargeBlaster(c: C, cx: number, y0: number, t: number) {
  const ch = gunState.charge;
  // arm cylinder
  rr(c, cx - 22, y0 + 40, 44, 120, [14, 14, 18, 18], lin(c, cx - 22, cx + 22, ['#1e3a8a', '#60a5fa', '#3b82f6', '#1e3a8a']), '#172554', 2);
  // rings
  for (let i = 0; i < 3; i++) {
    rr(c, cx - 24, y0 + 64 + i * 30, 48, 10, 5, lin(c, cx - 24, cx + 24, ['#0c4a6e', '#7dd3fc', '#0c4a6e']), '#082f49', 1.2);
  }
  // highlight
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 14, y0 + 46, 5, 108);
  // wrist cuff
  rr(c, cx - 26, y0 + 150, 52, 22, 8, lin(c, cx - 26, cx + 26, ['#0e7490', '#67e8f9', '#0891b2']), '#083344', 2);
  // energy meter on side
  for (let i = 0; i < 6; i++) {
    const on = i / 6 < ch;
    c.fillStyle = on ? (i > 4 ? '#fde047' : '#67e8f9') : 'rgba(8,47,73,0.8)';
    c.fillRect(cx + 16, y0 + 140 - i * 12, 5, 9);
  }
  // muzzle head
  c.beginPath();
  c.roundRect(cx - 18, y0 + 8, 36, 40, [10, 10, 6, 6]);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#1e3a8a', '#93c5fd', '#2563eb', '#1e3a8a']);
  c.fill();
  c.strokeStyle = '#172554';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 10, 12, 4.5, 0, 0, TAU);
  c.fillStyle = '#020617';
  c.fill();
  // charge orb
  if (ch > 0.02) {
    const full = ch >= 1;
    const flick = full ? (Math.floor(t * 20) % 2 ? '#fde047' : '#67e8f9') : '#7dd3fc';
    const r = 3 + ch * 13 + (full ? Math.sin(t * 40) * 1.5 : 0);
    c.save();
    c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(cx, y0 + 6, 0, cx, y0 + 6, r * 2.4);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, flick);
    g.addColorStop(1, 'rgba(56,189,248,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(cx, y0 + 6, r * 2.4, 0, TAU);
    c.fill();
    // converging streaks
    c.strokeStyle = flick;
    c.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 5;
      const d = 30 + ((t * 120 + i * 13) % 26);
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * d, y0 + 6 + Math.sin(a) * d);
      c.lineTo(cx + Math.cos(a) * (d - 9), y0 + 6 + Math.sin(a) * (d - 9));
      c.stroke();
    }
    c.restore();
  } else glow(c, cx, y0 + 10, 2, '#7dd3fc', 8);
}

// ------------------------------------------------------------- HOLY LIGHT
function holyGun(c: C, cx: number, y0: number, t: number) {
  // wings
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 14, y0 + 80);
    c.rotate(s * (0.12 + Math.sin(t * 2.5) * 0.06));
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.ellipse(s * (14 + i * 6), -10 + i * 9, 16 - i * 1.5, 5.5, s * (-0.6 + i * 0.25), 0, TAU);
      c.fillStyle = i % 2 ? '#fefce8' : '#ffffff';
      c.fill();
      c.strokeStyle = 'rgba(202,138,4,0.5)';
      c.lineWidth = 0.8;
      c.stroke();
    }
    c.restore();
  }
  // Sculpted pearl-white handle, not a dark pistol grip/trigger guard.
  c.beginPath();
  c.moveTo(cx - 12, y0 + 112); c.quadraticCurveTo(cx - 15, y0 + 139, cx - 11, y0 + 165);
  c.quadraticCurveTo(cx, y0 + 177, cx + 11, y0 + 165);
  c.quadraticCurveTo(cx + 15, y0 + 139, cx + 12, y0 + 112); c.closePath();
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#cbd5df', '#ffffff', '#fffdf8', '#e5eaf1']);
  c.fill(); c.strokeStyle = '#cfb775'; c.lineWidth = 1.3; c.stroke();
  rr(c, cx - 12, y0 + 153, 24, 4, 2, brass(c, cx - 12, cx + 12));
  c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(cx - 7, y0 + 124, 2, 30);
  // ivory+gold body
  rr(c, cx - 14, y0 + 44, 28, 88, 8, lin(c, cx - 14, cx + 14, ['#e7e0cf', '#ffffff', '#f5f0e1']), '#a16207', 2);
  for (const y of [y0 + 52, y0 + 120]) rr(c, cx - 15, y, 30, 5, 2, brass(c, cx - 15, cx + 15));
  // A luminous pearl medallion, in place of the former cross.
  c.save(); c.shadowColor = '#fde68a'; c.shadowBlur = 12;
  c.beginPath(); c.ellipse(cx, y0 + 86, 7, 10, 0, 0, TAU);
  c.fillStyle = brass(c, cx - 7, cx + 7); c.fill(); c.restore();
  gem(c, cx, y0 + 86, 5.5, '#ffffff', '#fff3ca', '#d6a84f');
  // barrel
  rr(c, cx - 5, y0 + 16, 10, 32, 3, brass(c, cx - 5, cx + 5), '#713f12', 1);
  // halo
  c.save();
  c.translate(cx, y0 + 6);
  c.shadowColor = '#fde047';
  c.shadowBlur = 16;
  c.strokeStyle = '#fde047';
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(0, 0, 16, 5, 0, 0, TAU);
  c.stroke();
  c.restore();
  // god rays
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.6;
    const l = 24 + Math.sin(t * 3 + i) * 6;
    const g = c.createLinearGradient(cx, y0 + 6, cx + Math.cos(a) * l, y0 + 6 + Math.sin(a) * l);
    g.addColorStop(0, 'rgba(255,240,180,0.55)');
    g.addColorStop(1, 'rgba(255,240,180,0)');
    c.strokeStyle = g;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(cx, y0 + 6);
    c.lineTo(cx + Math.cos(a) * l, y0 + 6 + Math.sin(a) * l);
    c.stroke();
  }
  c.restore();
  glow(c, cx, y0 + 6, 4, '#ffffff', 16);
}

// ------------------------------------------------------------- RAINBOW UNICORN
function unicornGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 124, '#f9a8d4', '#f0abfc', 0.78);
  guard(c, cx, y0 + 116, '#be185d');
  // rainbow mane flowing
  const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
  for (let i = 0; i < 6; i++) {
    c.strokeStyle = RB[i];
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx + 10, y0 + 46 + i * 7);
    c.bezierCurveTo(cx + 30 + Math.sin(t * 3 + i) * 4, y0 + 60 + i * 8, cx + 22, y0 + 100 + i * 6, cx + 34 + Math.sin(t * 2 + i) * 6, y0 + 124 + i * 4);
    c.stroke();
  }
  // head (white, facing up)
  c.beginPath();
  c.moveTo(cx - 16, y0 + 130);
  c.quadraticCurveTo(cx - 22, y0 + 80, cx - 12, y0 + 46);
  c.quadraticCurveTo(cx - 8, y0 + 28, cx, y0 + 26);
  c.quadraticCurveTo(cx + 10, y0 + 28, cx + 12, y0 + 46);
  c.quadraticCurveTo(cx + 18, y0 + 80, cx + 16, y0 + 130);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 18, ['#e9d5ff', '#ffffff', '#fdf4ff', '#f5d0fe']);
  c.fill();
  c.strokeStyle = '#c084fc';
  c.lineWidth = 2;
  c.stroke();
  // snout
  c.beginPath();
  c.ellipse(cx, y0 + 36, 9, 8, 0, 0, TAU);
  c.fillStyle = '#fbcfe8';
  c.fill();
  c.fillStyle = '#9d174d';
  c.beginPath();
  c.ellipse(cx - 3.5, y0 + 34, 1.4, 2, 0, 0, TAU);
  c.ellipse(cx + 3.5, y0 + 34, 1.4, 2, 0, 0, TAU);
  c.fill();
  // eyes w/ lashes
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(cx + s * 8, y0 + 64, 3.5, 4.5, 0, 0, TAU);
    c.fillStyle = '#1e1b4b';
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(cx + s * 8 - 1, y0 + 62.5, 1.3, 0, TAU);
    c.fill();
    c.strokeStyle = '#1e1b4b';
    c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(cx + s * (8 + i * 1.5), y0 + 60);
      c.lineTo(cx + s * (10 + i * 2), y0 + 57);
      c.stroke();
    }
  }
  // blush
  c.fillStyle = 'rgba(244,114,182,0.5)';
  c.beginPath();
  c.ellipse(cx - 11, y0 + 74, 3.5, 2, 0, 0, TAU);
  c.ellipse(cx + 11, y0 + 74, 3.5, 2, 0, 0, TAU);
  c.fill();
  // ears
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 8, y0 + 96);
    c.lineTo(cx + s * 20, y0 + 104);
    c.lineTo(cx + s * 10, y0 + 108);
    c.closePath();
    c.fillStyle = '#fdf4ff';
    c.fill();
    c.strokeStyle = '#c084fc';
    c.lineWidth = 1;
    c.stroke();
  }
  // golden spiral horn (barrel)
  c.save();
  c.beginPath();
  c.moveTo(cx - 6, y0 + 30);
  c.lineTo(cx, y0 - 8);
  c.lineTo(cx + 6, y0 + 30);
  c.closePath();
  c.fillStyle = lin(c, cx - 6, cx + 6, ['#ca8a04', '#fef08a', '#eab308']);
  c.shadowColor = '#fde047';
  c.shadowBlur = 12;
  c.fill();
  c.shadowBlur = 0;
  c.clip();
  c.strokeStyle = '#a16207';
  c.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 6, y0 + 28 - i * 6.5);
    c.lineTo(cx + 6, y0 + 23 - i * 6.5);
    c.stroke();
  }
  c.restore();
  // sparkles
  for (let i = 0; i < 4; i++) {
    const a = Math.sin(t * 3 + i * 1.7);
    if (a > 0.2) star(c, cx + [-20, 20, -14, 16][i], y0 + [10, 20, 100, 40][i], 5 * a, RB[i + 1], 4);
  }
}

// ------------------------------------------------------------- OBLITERATOR 9000
function obliterator(c: C, cx: number, y0: number, t: number) {
  const p = 0.6 + 0.4 * Math.sin(t * 4);
  // rear handle + grip
  grip(c, cx, y0 + 168, '#1f2937', '#374151', 0.85);
  guard(c, cx, y0 + 160, '#030712');
  // massive body
  c.beginPath();
  c.moveTo(cx - 34, y0 + 186);
  c.lineTo(cx - 38, y0 + 70);
  c.lineTo(cx - 26, y0 + 40);
  c.lineTo(cx + 26, y0 + 40);
  c.lineTo(cx + 38, y0 + 70);
  c.lineTo(cx + 34, y0 + 186);
  c.closePath();
  c.fillStyle = lin(c, cx - 38, cx + 38, ['#111827', '#4b5563', '#374151', '#6b7280', '#111827']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2.5;
  c.stroke();
  // hazard plates
  c.save();
  c.beginPath();
  c.rect(cx - 36, y0 + 170, 72, 12);
  c.clip();
  for (let i = -2; i < 14; i++) {
    c.fillStyle = i % 2 ? '#111' : '#facc15';
    c.beginPath();
    c.moveTo(cx - 36 + i * 8, y0 + 182);
    c.lineTo(cx - 28 + i * 8, y0 + 170);
    c.lineTo(cx - 20 + i * 8, y0 + 170);
    c.lineTo(cx - 28 + i * 8, y0 + 182);
    c.fill();
  }
  c.restore();
  // green core window
  rr(c, cx - 14, y0 + 74, 28, 88, 8, '#03140a', '#16a34a', 2);
  c.save();
  c.beginPath();
  c.roundRect(cx - 12, y0 + 76, 24, 84, 7);
  c.clip();
  c.shadowColor = '#4ade80';
  c.shadowBlur = 20 * p;
  const cg = c.createLinearGradient(0, y0 + 76, 0, y0 + 160);
  cg.addColorStop(0, '#bbf7d0');
  cg.addColorStop(0.5, '#22c55e');
  cg.addColorStop(1, '#14532d');
  c.fillStyle = cg;
  c.fillRect(cx - 9, y0 + 80 + (1 - p) * 10, 18, 80);
  c.strokeStyle = 'rgba(220,252,231,0.8)';
  c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) jag(c, cx + rand(-6, 6), y0 + 82, cx + rand(-6, 6), y0 + 156, 4, 6);
  c.restore();
  // side vents
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      c.fillStyle = `rgba(74,222,128,${0.3 + 0.5 * p * ((i + 1) / 6)})`;
      c.fillRect(cx + s * 26 - 4, y0 + 84 + i * 13, 8, 5);
    }
  }
  // radiation emblem
  c.save();
  c.translate(cx, y0 + 56);
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(0, 0, 9, 0, TAU);
  c.fill();
  c.fillStyle = '#111';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(0, 0, 8, (i / 3) * TAU - 0.5, (i / 3) * TAU + 0.5);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(0, 0, 2.5, 0, TAU);
  c.fill();
  c.restore();
  // huge muzzle
  rr(c, cx - 30, y0 + 2, 60, 42, [8, 8, 4, 4], lin(c, cx - 30, cx + 30, ['#030712', '#4b5563', '#030712']), '#000', 2);
  c.beginPath();
  c.ellipse(cx, y0 + 6, 24, 7, 0, 0, TAU);
  c.fillStyle = '#020a05';
  c.fill();
  // swirling green energy in muzzle
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(cx, y0 + 6, 0, cx, y0 + 6, 24);
  g.addColorStop(0, `rgba(220,252,231,${0.9 * p})`);
  g.addColorStop(0.4, `rgba(74,222,128,${0.6 * p})`);
  g.addColorStop(1, 'rgba(22,163,74,0)');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(cx, y0 + 6, 24, 9, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(187,247,208,0.8)';
  c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(cx, y0 + 6, 8 + i * 5, 2.5 + i * 1.5, t * (2 + i), 0, Math.PI * 1.3);
    c.stroke();
  }
  c.restore();
  // "9000" stamp
  c.fillStyle = '#9ca3af';
  c.font = "bold 9px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.fillText('9000', cx, y0 + 34);
}

// ================================================================ dispatch
export function drawGunExtra3(c: C, id: WeaponId, cx: number, y0: number, t: number, ready: boolean) {
  switch (id) {
    case 'pencil': pencilGun(c, cx, y0, t, ready); break;
    case 'sandal': sandalGun(c, cx, y0, t, ready); break;
    case 'paintball': paintballGun(c, cx, y0, t); break;
    case 'wand': magicWand(c, cx, y0, t); break;
    case 'ruby': rubyRevolver(c, cx, y0, t); break;
    case 'emerald': emeraldLaser(c, cx, y0, t); break;
    case 'sapphire': sapphireShotgun(c, cx, y0, t, ready); break;
    case 'crystal': crystalCannon(c, cx, y0, t); break;
    case 'beerifle': beeRifle(c, cx, y0, t); break;
    case 'buster': chargeBlaster(c, cx, y0, t); break;
    case 'holy': holyGun(c, cx, y0, t); break;
    case 'unicorn': unicornGun(c, cx, y0, t); break;
    case 'obliterator': obliterator(c, cx, y0, t); break;
    case 'coingun': coinGun(c, cx, y0, t, ready); break;
    case 'blaster': starWarsBlaster(c, cx, y0, t); break;
    default: {
      void bit8Gun;
      void kunaiGun;
      drawGunExtra4(c, id, cx, y0, t, ready);
      break;
    }
  }
  void wood;
}

export type Flash3 = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number } | { k: 'puff'; col: string; n: number };
export const FLASH3: Partial<Record<WeaponId, Flash3>> = {
  pencil: { k: 'puff', col: 'rgba(240,220,190,', n: 5 }, sandal: { k: 'puff', col: 'rgba(219,234,254,', n: 8 },
  paintball: { k: 'puff', col: 'rgba(255,255,255,', n: 6 }, wand: { k: 'energy', rgb: '233,213,255', r: 46 },
  ruby: { k: 'fire', s: 1.2 }, emerald: { k: 'energy', rgb: '52,211,153', r: 44 }, sapphire: { k: 'fire', s: 1.6 },
  crystal: { k: 'energy', rgb: '240,171,252', r: 56 }, beerifle: { k: 'fire', s: 1.3 }, buster: { k: 'energy', rgb: '125,211,252', r: 40 },
  holy: { k: 'energy', rgb: '255,240,180', r: 60 }, unicorn: { k: 'energy', rgb: '250,190,240', r: 50 }, obliterator: { k: 'energy', rgb: '74,222,128', r: 90 },
  coingun: { k: 'energy', rgb: '250,204,21', r: 36 },
  blaster: { k: 'energy', rgb: '239,68,68', r: 54 },
  ...FLASH4,
};
