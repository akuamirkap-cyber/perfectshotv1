import { TAU, rand, lin, vlin, steel, chrome, wood, rr, grip, guard, glow, star, radial, gunState } from './kit';
import { shotPulse } from './commonGunMotion';
import { drawFrostGrip, drawWaterGrip } from './gripSystem';

type C = CanvasRenderingContext2D;
export const SNOWBALL_MAG_SIZE = 5;

// ------------------------------------------------------------- KETAPEL PRO (animated draw / release)
const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

function slingshotPro(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const s = gunState.sinceShot;
  const REST_X = 0;
  const REST_Y = 14;
  // In resting/drawn pose, the pouch hangs STRAIGHT DOWN from the center of the
  // Y-fork (x offset 0) so the two red bands form a symmetric V going straight
  // down — no sideways tilt of the band/pouch assembly.
  const HANG_X = 0;
  const HANG_Y = 106;
  let px = HANG_X;
  let py = HANG_Y;
  let stretch = 1;
  let loaded = true;
  let vib = 0;
  const RELEASE = 0.16;
  const DRAW_END = 0.36;
  if (!ready && s > DRAW_END) {
    loaded = false;
    px = HANG_X * 0.7;
    py = HANG_Y * 0.85;
  } else if (s < RELEASE) {
    // CTAK! band snaps forward to the fork crotch and vibrates
    const k = s / RELEASE;
    vib = 1 - k;
    py = REST_Y - 20 * Math.sin(k * Math.PI * 4.5) * (1 - k) * (1 - k);
    px = REST_X + Math.sin(k * Math.PI * 7) * 5 * (1 - k);
    stretch = 0;
    loaded = false;
  } else if (s < DRAW_END) {
    const k = easeInOut((s - RELEASE) / (DRAW_END - RELEASE));
    px = REST_X + (HANG_X - REST_X) * k;
    py = REST_Y + (HANG_Y - REST_Y) * k;
    stretch = k;
  } else {
    py = HANG_Y + Math.sin(t * 3.2) * 1.6;
    px = HANG_X + Math.sin(t * 2.4) * 1.2;
    stretch = 1;
  }

  const bend = stretch * 2.2;
  const tipL = { x: cx - 25 + bend * 0.5, y: y0 + 15 + stretch * 1.2 };
  const tipR = { x: cx + 25 - bend * 0.5, y: y0 + 15 + stretch * 1.2 };
  const pouch = { x: cx + px, y: y0 + py };

  // ══════════════════ 1. CARVED NUSANTARA HARDWOOD Y-FRAME & LEATHER-WRAPPED HANDLE (matching KETAPEL image 1!) ══════════════════
  c.save();
  // Unified wide, muscular Y-shaped hardwood frame (fork arms + handle + bulbous pommel)
  c.beginPath();
  // Left fork crown tip (cx - 25, y0 + 3)
  c.moveTo(tipL.x - 7.5, tipL.y - 6);
  c.quadraticCurveTo(tipL.x, tipL.y - 13, tipL.x + 7.5, tipL.y - 6);
  // Inner U-crotch of the Y-fork
  c.bezierCurveTo(tipL.x + 6, y0 + 32, cx - 8, y0 + 50, cx, y0 + 53);
  c.bezierCurveTo(cx + 8, y0 + 50, tipR.x - 6, y0 + 32, tipR.x - 7.5, tipR.y - 6);
  // Right fork crown tip (cx + 25, y0 + 3)
  c.quadraticCurveTo(tipR.x, tipR.y - 13, tipR.x + 7.5, tipR.y - 6);
  // Right outer curve of fork sweeping into thick handle
  c.bezierCurveTo(tipR.x + 8, y0 + 32, cx + 16, y0 + 54, cx + 11.5, y0 + 74);
  // Handle shaft right edge down to bulbous rounded pommel
  c.lineTo(cx + 11, y0 + 144);
  c.bezierCurveTo(cx + 13.5, y0 + 156, cx + 8, y0 + 168, cx, y0 + 168);
  c.bezierCurveTo(cx - 8, y0 + 168, cx - 13.5, y0 + 156, cx - 11, y0 + 144);
  c.lineTo(cx - 11.5, y0 + 74);
  // Left outer curve of fork sweeping up to left crown tip
  c.bezierCurveTo(cx - 16, y0 + 54, tipL.x - 8, y0 + 32, tipL.x - 7.5, tipL.y - 6);
  c.closePath();

  const woodG = c.createLinearGradient(cx - 28, y0 + 8, cx + 28, y0 + 166);
  woodG.addColorStop(0, '#3b1a08');
  woodG.addColorStop(0.24, '#8c4b22');
  woodG.addColorStop(0.48, '#d4884e');
  woodG.addColorStop(0.74, '#7c3f18');
  woodG.addColorStop(1, '#2b1205');
  c.fillStyle = woodG;
  c.fill();
  c.strokeStyle = 'rgba(32,12,3,0.82)';
  c.lineWidth = 0.9;
  c.stroke();

  // Carved vertical wood flutes on both rounded fork crown knobs (above the red collars)
  c.strokeStyle = 'rgba(42,16,4,0.58)';
  c.lineWidth = 0.85;
  for (const tip of [tipL, tipR]) {
    for (const dx of [-3.5, 0, 3.5]) {
      c.beginPath();
      c.moveTo(tip.x + dx, tip.y - 10);
      c.lineTo(tip.x + dx, tip.y - 2);
      c.stroke();
    }
  }

  // Deeply Carved Spiral Wood Scrolls on Left & Right Fork Arms + Pommel Knot (matching image 1!)
  c.strokeStyle = 'rgba(45,18,5,0.62)';
  c.lineWidth = 1.1;
  for (const sDir of [-1, 1]) {
    const tx = sDir < 0 ? tipL.x : tipR.x;
    const ty = sDir < 0 ? tipL.y : tipR.y;
    c.beginPath();
    c.moveTo(cx + sDir * 5, y0 + 62);
    c.quadraticCurveTo(cx + sDir * 14, y0 + 40, tx + sDir * 1, ty + 10);
    c.stroke();
    // Spiral scroll carving on fork arm
    c.beginPath();
    c.arc(cx + sDir * 13, y0 + 42, 4.2, 0, Math.PI * 1.75);
    c.stroke();
  }
  // Carved wood grain spiral on the bulbous pommel
  c.beginPath();
  c.arc(cx - 2, y0 + 155, 5.5, 0.2, Math.PI * 1.65);
  c.stroke();

  // Sculpted V-Shaped Bronze/Wood Relief Shield with 7 Gold/Brass Studs at the Y-Crotch (y0 + 34 .. y0 + 74, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 16, y0 + 36);
  c.quadraticCurveTo(cx - 8, y0 + 50, cx, y0 + 53);
  c.quadraticCurveTo(cx + 8, y0 + 50, cx + 16, y0 + 36);
  c.lineTo(cx + 12.5, y0 + 52);
  c.lineTo(cx, y0 + 73);
  c.lineTo(cx - 12.5, y0 + 52);
  c.closePath();
  c.fillStyle = lin(c, cx - 16, cx + 16, ['#3b1b08', '#783f18', '#b46934', '#5c2c0e']);
  c.fill();
  c.strokeStyle = '#eab308';
  c.lineWidth = 0.9;
  c.stroke();

  // 7 Gleaming Brass/Gold Rivet Studs along the V-shield collar
  for (const [rx, ry] of [
    [cx - 12, y0 + 43],
    [cx - 8, y0 + 51],
    [cx - 4, y0 + 59],
    [cx, y0 + 66.5],
    [cx + 4, y0 + 59],
    [cx + 8, y0 + 51],
    [cx + 12, y0 + 43],
  ] as [number, number][]) {
    c.fillStyle = '#fef08a';
    c.beginPath();
    c.arc(rx, ry, 1.45, 0, TAU);
    c.fill();
    c.strokeStyle = '#713f12';
    c.lineWidth = 0.55;
    c.stroke();
  }

  // Thick Criss-Cross Leather Strap Wrapping along the Handle (y0 + 74 .. y0 + 146, matching image 1!)
  for (let i = 0; i < 8; i++) {
    const wy = y0 + 74 + i * 8.6;
    const tilt = i % 2 === 0 ? 4.2 : -4.2;
    c.beginPath();
    c.moveTo(cx - 11.6, wy);
    c.lineTo(cx + 11.6, wy + tilt);
    c.lineTo(cx + 11.6, wy + tilt + 7.4);
    c.lineTo(cx - 11.6, wy + 7.4);
    c.closePath();
    c.fillStyle = lin(c, cx - 12, cx + 12, ['#3b1d0c', '#8c5228', '#c88450', '#6b3b1c', '#2b1306']);
    c.fill();
    c.strokeStyle = 'rgba(28,11,3,0.75)';
    c.lineWidth = 0.78;
    c.stroke();

    // Warm tan highlight along upper strap edge
    c.strokeStyle = 'rgba(254,230,190,0.42)';
    c.lineWidth = 0.7;
    c.beginPath();
    c.moveTo(cx - 10.5, wy + 1);
    c.lineTo(cx + 10.5, wy + tilt + 1);
    c.stroke();
  }

  // Red & Gold Striped Collar Bindings at Both Fork Tips (matching image 1!)
  for (const [idx, tip] of [[0, tipL], [1, tipR]] as [number, { x: number; y: number }][]) {
    c.save();
    c.translate(tip.x, tip.y + 1);
    c.rotate(idx === 0 ? -0.22 : 0.22);
    c.beginPath();
    c.roundRect(-8.5, -5.2, 17, 10.4, 3.2);
    c.fillStyle = lin(c, -8.5, 8.5, ['#7f1d1d', '#dc2626', '#f87171', '#991b1b']);
    c.fill();
    c.strokeStyle = 'rgba(42,10,10,0.75)';
    c.lineWidth = 0.8;
    c.stroke();
    // Golden rattan binding cords
    c.strokeStyle = '#fbbf24';
    c.lineWidth = 1.15;
    for (const by of [-3.8, 0, 3.8]) {
      c.beginPath();
      c.moveTo(-8, by);
      c.lineTo(8, by);
      c.stroke();
    }
    c.restore();
  }

  // Pommel Lanyard Hole & Hanging Twin Two-Tone Feather Charms (angled so they hang vertically in the +45° Arsenal card!)
  const holeX = cx + 2.5;
  const holeY = y0 + 157;
  c.fillStyle = '#180802';
  c.beginPath();
  c.arc(holeX, holeY, 2.8, 0, TAU);
  c.fill();
  c.strokeStyle = '#d97706';
  c.lineWidth = 0.8;
  c.stroke();

  const sway = Math.sin(t * 3.4) * 1.8 + vib * 4;
  for (const [fIdx, angOff, cordLen] of [
    [0, -0.58, 15],
    [1, -0.88, 14],
  ] as [number, number, number][]) {
    const dirA = angOff + sway * 0.04;
    const bx = holeX + Math.sin(-dirA) * cordLen;
    const by = holeY + Math.cos(dirA) * cordLen;

    // Braided leather cord from hole to beads
    c.strokeStyle = '#92400e';
    c.lineWidth = 1.25;
    c.beginPath();
    c.moveTo(holeX, holeY);
    c.quadraticCurveTo(holeX + (bx - holeX) * 0.4, holeY + (by - holeY) * 0.6, bx, by);
    c.stroke();

    // Orange & gold beads above each feather
    c.fillStyle = '#f97316';
    c.beginPath();
    c.arc(bx, by, 2.0, 0, TAU);
    c.fill();
    c.fillStyle = '#fde047';
    c.beginPath();
    c.arc(bx + Math.sin(-dirA) * 2.6, by + Math.cos(dirA) * 2.6, 1.5, 0, TAU);
    c.fill();

    // Two-tone Feather (cream-white upper + dark-brown tip, matching image 1!)
    c.save();
    c.translate(bx + Math.sin(-dirA) * 4, by + Math.cos(dirA) * 4);
    c.rotate(dirA);
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(-4.6, 6.5, -2.8, 15);
    c.lineTo(0, 20);
    c.lineTo(2.8, 15);
    c.quadraticCurveTo(4.6, 6.5, 0, 0);
    c.closePath();
    const fGrad = c.createLinearGradient(0, 0, 0, 20);
    fGrad.addColorStop(0, '#fef3c7');
    fGrad.addColorStop(0.55, '#d6d3d1');
    fGrad.addColorStop(0.68, '#78350f');
    fGrad.addColorStop(1, '#1c0a02');
    c.fillStyle = fGrad;
    c.fill();
    c.strokeStyle = 'rgba(28,10,2,0.68)';
    c.lineWidth = 0.68;
    c.stroke();
    c.strokeStyle = '#fafaf9';
    c.lineWidth = 0.75;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, 17);
    c.stroke();
    c.restore();
  }
  c.restore();

  // ══════════════════ 2. CURVED RED ELASTIC BANDS, CUPPED LEATHER POUCH & 3 RIVER STONES (matching image 1!) ══════════════════
  const bandW = 3.8 - stretch * 0.8;

  // Left red elastic band: from Left Fork Tip (`tipL`) curving gracefully across to left side of pouch
  c.save();
  c.lineCap = 'round';
  c.strokeStyle = '#450a0a';
  c.lineWidth = bandW + 1.3;
  c.beginPath();
  c.moveTo(tipL.x + 2, tipL.y + 1);
  c.bezierCurveTo(
    tipL.x + 12,
    tipL.y + 24,
    pouch.x - 16,
    pouch.y - 26,
    pouch.x - 10.5,
    pouch.y - 4,
  );
  c.stroke();
  c.strokeStyle = '#dc2626';
  c.lineWidth = bandW;
  c.stroke();
  c.strokeStyle = 'rgba(254,202,202,0.65)';
  c.lineWidth = 0.95;
  c.stroke();

  // Right red elastic band: from Right Fork Tip (`tipR`) curving down to right side of pouch
  c.strokeStyle = '#450a0a';
  c.lineWidth = bandW + 1.3;
  c.beginPath();
  c.moveTo(tipR.x + 2, tipR.y + 1);
  c.bezierCurveTo(
    tipR.x - 12,
    tipR.y + 24,
    pouch.x + 16,
    pouch.y - 26,
    pouch.x + 10.5,
    pouch.y - 4,
  );
  c.stroke();
  c.strokeStyle = '#ef4444';
  c.lineWidth = bandW;
  c.stroke();
  c.strokeStyle = 'rgba(254,202,202,0.65)';
  c.lineWidth = 0.95;
  c.stroke();
  c.restore();

  // 3 Rounded Grey-White River Pebbles/Stones nestled inside the leather pouch (matching image 1!)
  if (loaded) {
    c.save();
    c.translate(pouch.x, pouch.y - 4.5);
    for (const [sx, sy, rx, ry, rot] of [
      [-4.2, 0.5, 5.2, 4.4, -0.35],
      [4.2, 0.8, 5.2, 4.4, 0.35],
      [0, -1.8, 6.2, 5.4, 0.1],
    ] as [number, number, number, number, number][]) {
      c.save();
      c.translate(sx, sy);
      c.rotate(rot);
      c.beginPath();
      c.ellipse(0, 0, rx, ry, 0, 0, TAU);
      c.fillStyle = radial(c, -1.5, -1.5, rx, ['#fafaf9', '#d6d3d1', '#78716c', '#292524']);
      c.fill();
      c.strokeStyle = 'rgba(28,25,23,0.72)';
      c.lineWidth = 0.75;
      c.stroke();
      c.restore();
    }
    c.restore();
  }

  // Plump 3D Cupped Brown Leather Pouch with Side Loops & Embossed Stitching (matching image 1!)
  c.save();
  c.translate(pouch.x, pouch.y);
  // Leather side attachment ears/loops
  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.ellipse(sDir * 10.5, -3.5, 3.2, 4.2, sDir * 0.25, 0, TAU);
    c.fillStyle = '#78350f';
    c.fill();
    c.strokeStyle = 'rgba(28,10,0,0.78)';
    c.lineWidth = 0.8;
    c.stroke();
  }

  // Main cupped leather pouch belly
  c.beginPath();
  c.moveTo(-12, -3.5);
  c.bezierCurveTo(-14, 7, -6, 13.5, 0, 13.5);
  c.bezierCurveTo(6, 13.5, 14, 7, 12, -3.5);
  c.quadraticCurveTo(0, 1.5, -12, -3.5);
  c.closePath();
  const pouchG = c.createRadialGradient(-2, 4, 1, 0, 5, 14);
  pouchG.addColorStop(0, '#d97706');
  pouchG.addColorStop(0.55, '#92400e');
  pouchG.addColorStop(1, '#3b1504');
  c.fillStyle = pouchG;
  c.fill();
  c.strokeStyle = 'rgba(28,10,0,0.82)';
  c.lineWidth = 0.88;
  c.stroke();

  // Decorative embossed stitch arc across the leather pouch belly
  c.strokeStyle = 'rgba(253,230,138,0.65)';
  c.lineWidth = 0.82;
  c.beginPath();
  c.arc(0, 1.5, 8.2, 0.25, Math.PI - 0.25);
  c.stroke();
  c.restore();

  // Release whoosh arcs when snapped
  if (vib > 0.3) {
    c.save();
    c.globalAlpha = (vib - 0.3) / 0.7;
    c.strokeStyle = '#ffffff';
    c.lineWidth = 1.6;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.arc(cx, y0 + 6 - i * 8, 15 + i * 6, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
    }
    c.restore();
  }
}

// ------------------------------------------------------------- KETAPEL
export function slingshot(c: C, cx: number, y0: number, t: number, ready: boolean) {
  slingshotPro(c, cx, y0, t, ready);
}
export const _legacySlingshot = (c: C, cx: number, y0: number, ready: boolean) => slingshotOld(c, cx, y0, ready);

function slingshotOld(c: C, cx: number, y0: number, ready: boolean) {
  // handle
  rr(c, cx - 6, y0 + 52, 12, 98, 5, wood(c, cx - 6, cx + 6), '#2a1205', 1.5);
  // rattan wraps
  c.strokeStyle = '#d9b26a';
  c.lineWidth = 2.5;
  for (let i = 0; i < 7; i++) {
    c.beginPath();
    c.moveTo(cx - 6, y0 + 92 + i * 6);
    c.lineTo(cx + 6, y0 + 95 + i * 6);
    c.stroke();
  }
  // fork
  c.lineCap = 'round';
  c.strokeStyle = '#5a2d0c';
  c.lineWidth = 11;
  c.beginPath();
  c.moveTo(cx, y0 + 60);
  c.quadraticCurveTo(cx - 4, y0 + 34, cx - 22, y0 + 6);
  c.moveTo(cx, y0 + 60);
  c.quadraticCurveTo(cx + 4, y0 + 34, cx + 22, y0 + 6);
  c.stroke();
  c.strokeStyle = '#b8743a';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(cx - 2, y0 + 58);
  c.quadraticCurveTo(cx - 6, y0 + 34, cx - 23, y0 + 7);
  c.moveTo(cx + 2, y0 + 58);
  c.quadraticCurveTo(cx + 2, y0 + 34, cx + 20, y0 + 7);
  c.stroke();
  // bands
  const py = ready ? y0 + 78 : y0 + 12;
  c.strokeStyle = '#c2410c';
  c.lineWidth = 3.2;
  c.beginPath();
  c.moveTo(cx - 22, y0 + 6);
  c.lineTo(cx - 7, py);
  c.moveTo(cx + 22, y0 + 6);
  c.lineTo(cx + 7, py);
  c.stroke();
  // pouch
  c.beginPath();
  c.ellipse(cx, py, 9, 5, 0, 0, TAU);
  c.fillStyle = '#6b3d1f';
  c.fill();
  c.strokeStyle = '#3a1d08';
  c.lineWidth = 1.5;
  c.stroke();
  if (ready) {
    c.beginPath();
    c.ellipse(cx, py - 3, 6, 5, 0.3, 0, TAU);
    c.fillStyle = radial(c, cx, py - 3, 6, ['#d6d3d1', '#78716c', '#44403c']);
    c.fill();
  }
  // carved initial
  c.fillStyle = 'rgba(40,15,0,0.6)';
  c.font = 'bold 8px sans-serif';
  c.textAlign = 'center';
  c.fillText('ID', cx, y0 + 80);
}

// ------------------------------------------------------------- SUMPIT DAYAK
export function blowgun(c: C, cx: number, y0: number, t: number) {
  const breath = shotPulse(gunState.sinceShot, 0.32);
  // tube
  rr(c, cx - 5, y0, 10, 286, 4, lin(c, cx - 5, cx + 5, ['#2b1406', '#7a4420', '#3a1a08']), '#140800', 1.5);
  // motif bands (zigzag Dayak)
  for (const by of [y0 + 70, y0 + 150, y0 + 230]) {
    c.fillStyle = '#111';
    c.fillRect(cx - 5, by, 10, 16);
    c.strokeStyle = '#f5f5f4';
    c.lineWidth = 1.2;
    c.beginPath();
    for (let i = 0; i <= 4; i++) c.lineTo(cx - 5 + (i % 2) * 10, by + i * 4);
    c.stroke();
    c.fillStyle = '#dc2626';
    c.fillRect(cx - 5, by - 3, 10, 3);
    c.fillRect(cx - 5, by + 16, 10, 3);
  }
  // mouthpiece
  rr(c, cx - 6, y0 + 276, 12, 12, 3, '#1c1917');
  // spear blade (mata tombak)
  c.save();
  c.translate(cx + 7, y0 + 34);
  c.beginPath();
  c.moveTo(0, -46);
  c.quadraticCurveTo(7, -22, 4, 0);
  c.lineTo(-1, 0);
  c.quadraticCurveTo(-4, -22, 0, -46);
  c.closePath();
  c.fillStyle = lin(c, -4, 7, ['#6b7280', '#f3f4f6', '#9ca3af']);
  c.fill();
  c.strokeStyle = '#374151';
  c.lineWidth = 1;
  c.stroke();
  c.beginPath();
  c.moveTo(1, -42);
  c.lineTo(1.5, -4);
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.stroke();
  c.restore();
  // rattan binding
  c.strokeStyle = '#d6a960';
  c.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 6, y0 + 32 + i * 3.5);
    c.lineTo(cx + 12, y0 + 34 + i * 3.5);
    c.stroke();
  }
  // red hair tassel (rambut)
  c.strokeStyle = '#b91c1c';
  c.lineWidth = 1.2;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(cx + 10, y0 + 52);
    c.quadraticCurveTo(cx + 16 + i + breath * 7, y0 + 62,
      cx + 12 + i * 1.6 + Math.sin(t * 5 + i * 0.6) * 3 + breath * 11,
      y0 + 78 + (i % 3) * 3);
    c.stroke();
  }
  rr(c, cx - 7, y0 - 2, 14, 6, 2, '#1c1917');
  if (breath > 0.02) {
    c.strokeStyle = `rgba(230,255,212,${breath * 0.72})`;
    c.lineWidth = 2;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(cx + side * 5, y0 - 3);
      c.quadraticCurveTo(cx + side * (10 + breath * 6), y0 - 13,
        cx + side * (13 + breath * 11), y0 - 25);
      c.stroke();
    }
  }
}

// ------------------------------------------------------------- SHOTGUN
export function shotgun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const kick = shotPulse(gunState.sinceShot, 0.38);
  const pulse = 0.72 + 0.28 * Math.sin(t * 4.5);

  const bluedSteel = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d16', '#263244', '#64748b', '#cbd5e1', '#475569', '#0f172a']);
  const walnutWood = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#2b1205', '#733b19', '#c26d38', '#8c4920', '#381808']);

  // Helper for chunky 12-gauge red & brass shotgun shells mounted on the receiver (matching SHOTGUN image 1!)
  const drawShell = (sx: number, sy: number, sw: number, sh: number, brassAtTop: boolean) => {
    c.save();
    c.translate(sx, sy);
    // Crimson plastic hull
    c.beginPath();
    c.roundRect(-sw / 2, -sh / 2, sw, sh, 1.4);
    c.fillStyle = lin(c, -sw / 2, sw / 2, ['#7f1d1d', '#dc2626', '#fca5a5', '#b91c1c']);
    c.fill();
    c.strokeStyle = 'rgba(42,10,10,0.82)';
    c.lineWidth = 0.72;
    c.stroke();
    // Gleaming brass rim cap
    const bh = sh * 0.36;
    const by = brassAtTop ? -sh / 2 : sh / 2 - bh;
    c.beginPath();
    c.roundRect(-sw / 2 - 0.4, by, sw + 0.8, bh, 0.9);
    c.fillStyle = lin(c, -sw / 2, sw / 2, ['#713f12', '#eab308', '#fef9c3', '#ca8a04']);
    c.fill();
    c.strokeStyle = 'rgba(84,40,8,0.75)';
    c.lineWidth = 0.65;
    c.stroke();
    c.restore();
  };

  // ══════════════════ 1. MUSCULAR CARVED WALNUT BUTTSTOCK WITH CHECKERED PATCH & SCROLLWORK (y0 + 160 .. y0 + 224, matching image 1!) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 12, y0 + 160);
  c.lineTo(cx + 13.5, y0 + 162);
  // Deep ergonomic pistol-grip curve & wide lower stock toe
  c.bezierCurveTo(cx + 19, y0 + 170, cx + 22, y0 + 180, cx + 14.5, y0 + 188);
  c.bezierCurveTo(cx + 19, y0 + 198, cx + 27, y0 + 210, cx + 32, y0 + 220);
  c.lineTo(cx - 5, y0 + 226);
  // Comb of stock sweeping back up to receiver
  c.bezierCurveTo(cx - 9, y0 + 204, cx - 13, y0 + 182, cx - 12, y0 + 160);
  c.closePath();
  c.fillStyle = walnutWood(cx - 13, cx + 32);
  c.fill();
  c.strokeStyle = 'rgba(32,12,3,0.84)';
  c.lineWidth = 0.92;
  c.stroke();
  c.clip();

  // Warm specular wood highlight along comb of stock
  c.strokeStyle = 'rgba(253,210,160,0.38)';
  c.lineWidth = 2.2;
  c.beginPath();
  c.moveTo(cx - 9.5, y0 + 164);
  c.quadraticCurveTo(cx - 7.5, y0 + 192, cx - 3.5, y0 + 220);
  c.stroke();

  // Inset Dark-Walnut Checkered Grip Patch on upper stock wrist (matching image 1!)
  c.beginPath();
  c.moveTo(cx - 6, y0 + 166);
  c.lineTo(cx + 13, y0 + 168);
  c.lineTo(cx + 15.5, y0 + 187);
  c.lineTo(cx - 2.5, y0 + 189);
  c.closePath();
  c.fillStyle = '#361606';
  c.fill();
  c.strokeStyle = 'rgba(20,8,2,0.78)';
  c.lineWidth = 0.8;
  c.stroke();
  // Crosshatch diamond checkering lines on grip patch
  c.strokeStyle = 'rgba(198,125,70,0.34)';
  c.lineWidth = 0.68;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(cx - 4.5, y0 + 169 + i * 3.8);
    c.lineTo(cx + 13, y0 + 171.5 + i * 3.8);
    c.moveTo(cx - 2 + i * 3.4, y0 + 167);
    c.lineTo(cx - 4 + i * 3.4, y0 + 188);
    c.stroke();
  }

  // Bold 3D Carved Baroque Scrollwork Relief on the lower walnut buttstock (matching image 1!)
  c.strokeStyle = '#240d02';
  c.lineWidth = 1.65;
  c.beginPath();
  c.moveTo(cx + 1, y0 + 193);
  c.bezierCurveTo(cx + 14, y0 + 197, cx + 17, y0 + 211, cx + 5, y0 + 215);
  c.bezierCurveTo(cx - 2, y0 + 213, cx - 1, y0 + 203, cx + 6, y0 + 205);
  c.moveTo(cx + 11, y0 + 202);
  c.bezierCurveTo(cx + 21, y0 + 206, cx + 23, y0 + 215, cx + 16, y0 + 218);
  c.stroke();
  // Warm carved edge highlight next to scrollwork
  c.strokeStyle = 'rgba(245,185,125,0.42)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.arc(cx + 6, y0 + 207, 5.2, -0.3, Math.PI * 1.1);
  c.stroke();

  // Thick Dark-Charcoal Rubber Recoil Pad at the heel/toe of the stock
  c.beginPath();
  c.moveTo(cx - 6, y0 + 219);
  c.lineTo(cx + 33, y0 + 213);
  c.lineTo(cx + 33, y0 + 222);
  c.lineTo(cx - 6, y0 + 228);
  c.closePath();
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = '#475569';
  c.lineWidth = 0.88;
  c.stroke();
  c.restore();

  // ══════════════════ 2. TRIGGER GUARD, CURVED STEEL TRIGGER & 6 MOUNTED 12-GAUGE SHELLS (matching image 1!) ══════════════════
  // Blued-steel trigger guard & curved trigger on right (+x)
  c.beginPath();
  c.moveTo(cx + 11, y0 + 142);
  c.bezierCurveTo(cx + 26, y0 + 144, cx + 27, y0 + 162, cx + 13, y0 + 166);
  c.lineTo(cx + 11, y0 + 161);
  c.bezierCurveTo(cx + 21, y0 + 159, cx + 21, y0 + 148, cx + 11, y0 + 146);
  c.closePath();
  c.fillStyle = bluedSteel(cx + 11, cx + 27);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.82)';
  c.lineWidth = 0.85;
  c.stroke();

  // Trigger blade
  c.beginPath();
  c.moveTo(cx + 12.5, y0 + 149);
  c.quadraticCurveTo(cx + 19, y0 + 154, cx + 14.5, y0 + 160);
  c.strokeStyle = '#e2e8f0';
  c.lineWidth = 1.8;
  c.stroke();

  // 3 Big Red & Brass Shells on the Upper-Left Saddle (`cx - 17`, matching image 1!)
  for (let i = 0; i < 3; i++) {
    drawShell(cx - 17, y0 + 118 + i * 7.8, 9.2, 5.8, true);
  }
  // 3 Red & Brass Shells on the Lower-Right Carrier (`cx + 16`, matching image 1!)
  for (let i = 0; i < 3; i++) {
    drawShell(cx + 16, y0 + 117 + i * 7.8, 8.4, 5.5, false);
  }

  // ══════════════════ 3. WIDE CONTOURED BLUED-STEEL RECEIVER WITH EJECTION PORT & RED PILL LIGHT (matching image 1!) ══════════════════
  // Rear sight guard ear on upper-left of receiver (`cx - 18.5, y0 + 109 .. y0 + 116`)
  c.beginPath();
  c.roundRect(cx - 18.5, y0 + 108, 5.5, 7, 1.5);
  c.fillStyle = bluedSteel(cx - 18.5, cx - 13);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.8)';
  c.lineWidth = 0.78;
  c.stroke();

  // Main contoured gunmetal-blue receiver (`cx - 14 .. cx + 14, y0 + 104 .. y0 + 164`)
  c.beginPath();
  c.moveTo(cx - 13.5, y0 + 104);
  c.lineTo(cx + 13.5, y0 + 104);
  c.lineTo(cx + 14.5, y0 + 150);
  c.quadraticCurveTo(cx + 13.5, y0 + 161, cx + 9.5, y0 + 164);
  c.lineTo(cx - 11, y0 + 162);
  c.quadraticCurveTo(cx - 14.5, y0 + 152, cx - 13.5, y0 + 104);
  c.closePath();
  c.fillStyle = bluedSteel(cx - 14.5, cx + 14.5);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.85)';
  c.lineWidth = 0.92;
  c.stroke();

  // Bright metallic bevel highlight along left receiver ridge
  c.fillStyle = 'rgba(226,232,240,0.42)';
  c.beginPath();
  c.roundRect(cx - 11.5, y0 + 107, 2.6, 50, 1.3);
  c.fill();

  // Recessed dark bolt/ejection port window in the middle of the receiver (`y0 + 113 .. y0 + 138`)
  c.beginPath();
  c.roundRect(cx - 5, y0 + 113, 10.5, 25, 2.8);
  c.fillStyle = lin(c, cx - 5, cx + 5.5, ['#060911', '#1e293b', '#475569', '#090d16']);
  c.fill();
  c.strokeStyle = 'rgba(148,163,184,0.62)';
  c.lineWidth = 0.8;
  c.stroke();

  // Receiver pin rivets
  c.fillStyle = '#cbd5e1';
  for (const [rx, ry] of [[cx - 8.5, y0 + 142], [cx + 7.5, y0 + 142], [cx - 7.5, y0 + 155]] as [number, number][]) {
    c.beginPath();
    c.arc(rx, ry, 1.5, 0, TAU);
    c.fill();
  }

  // Glowing Neon-Red Pill Status Indicator Light on the rear receiver (matching image 1!)
  c.save();
  c.shadowColor = '#ef4444';
  c.shadowBlur = (ready ? 9 : 4) * pulse;
  c.fillStyle = ready ? '#ef4444' : '#7f1d1d';
  c.beginPath();
  c.roundRect(cx - 3.8, y0 + 144, 4.4, 11.5, 2.2);
  c.fill();
  if (ready) {
    c.fillStyle = '#fecaca';
    c.beginPath();
    c.roundRect(cx - 2.6, y0 + 145.8, 2.0, 7.5, 1);
    c.fill();
  }
  c.restore();

  // ══════════════════ 4. WIDE PERFORATED HEAT-SHIELD BARREL, KNURLED MAG CAP & THICK 10-RIB WALNUT PUMP (matching image 1!) ══════════════════
  // Under-barrel steel magazine tube (+x side: cx + 3 .. cx + 13.5, y0 + 12 .. y0 + 105)
  c.beginPath();
  c.roundRect(cx + 3, y0 + 12, 10.5, 93, 2.2);
  c.fillStyle = bluedSteel(cx + 3, cx + 13.5);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.8)';
  c.lineWidth = 0.85;
  c.stroke();

  // Knurled/ribbed steel magazine cap & barrel clamp ahead of the walnut pump (`y0 + 13 .. y0 + 31`)
  c.beginPath();
  c.roundRect(cx + 2, y0 + 13, 12.6, 16, 2.4);
  c.fillStyle = bluedSteel(cx + 2, cx + 14.6);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.82)';
  c.lineWidth = 0.82;
  c.stroke();
  c.strokeStyle = 'rgba(15,23,42,0.82)';
  c.lineWidth = 1.15;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx + 2.8, y0 + 16 + i * 3.1);
    c.lineTo(cx + 13.8, y0 + 16 + i * 3.1);
    c.stroke();
  }

  // Main Upper Blued-Steel Barrel (`cx - 13 .. cx + 4, y0 + 1 .. y0 + 105`)
  c.beginPath();
  c.roundRect(cx - 13, y0 + 1, 17, 104, 2.8);
  c.fillStyle = bluedSteel(cx - 13, cx + 4);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.85)';
  c.lineWidth = 0.92;
  c.stroke();

  // Thick muzzle ring collar (`y0 + 0.5 .. y0 + 8`)
  c.beginPath();
  c.roundRect(cx - 13.6, y0 + 0.5, 18.2, 7.5, 2.2);
  c.fillStyle = bluedSteel(cx - 13.6, cx + 4.6);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.85)';
  c.lineWidth = 0.85;
  c.stroke();

  // Raised Ventilated Heat-Shield Plate with 2 Staggered Columns of Large Cooling Holes (`y0 + 20 .. y0 + 102`, matching image 1!)
  c.beginPath();
  c.roundRect(cx - 13.8, y0 + 20, 15.2, 82, 2.4);
  c.fillStyle = lin(c, cx - 13.8, cx + 1.4, ['#1e293b', '#64748b', '#cbd5e1', '#475569', '#0f172a']);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.8)';
  c.lineWidth = 0.82;
  c.stroke();

  // Two bold staggered rows of circular cooling perforations along the heat shield
  for (let i = 0; i < 10; i++) {
    const hy = y0 + 25.5 + i * 7.6;
    c.fillStyle = '#070a12';
    c.beginPath();
    c.arc(cx - 9.2, hy, 2.05, 0, TAU);
    c.arc(cx - 3.2, hy + 1.8, 1.85, 0, TAU);
    c.fill();
    // Subtle metallic rim highlight on each cooling hole
    c.strokeStyle = 'rgba(226,232,240,0.38)';
    c.lineWidth = 0.55;
    c.beginPath();
    c.arc(cx - 9.2, hy, 2.05, 0.2, Math.PI * 0.9);
    c.stroke();
  }

  // Front sight post near muzzle on left (-x: `cx - 18 .. cx - 13, y0 + 5 .. y0 + 16`)
  c.beginPath();
  c.moveTo(cx - 13.5, y0 + 5);
  c.lineTo(cx - 18, y0 + 8);
  c.lineTo(cx - 18, y0 + 15);
  c.lineTo(cx - 13.5, y0 + 17);
  c.closePath();
  c.fillStyle = bluedSteel(cx - 18, cx - 13.5);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.8)';
  c.lineWidth = 0.78;
  c.stroke();

  // Muzzle bore opening
  c.beginPath();
  c.ellipse(cx - 4.5, y0 + 1.5, 6.2, 2.0, 0, 0, TAU);
  c.fillStyle = '#05070c';
  c.fill();

  // Thick Ribbed Carved Walnut Pump Forend (`cx + 1 .. cx + 19, length = 54`, slides during shot & reload, matching image 1!)
  const travel = gunState.reloadT > 0
    ? Math.min(1, gunState.reloadT / 0.18) * (9 + 9 * Math.sin(t * 11))
    : ready ? 15 * kick : 15 - 10 * kick;
  const py = y0 + 36 + travel + (ready ? Math.sin(t * 2.3) * 1.2 : 0);

  c.beginPath();
  c.roundRect(cx + 1, py, 18, 54, 6.5);
  c.fillStyle = walnutWood(cx + 1, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(32,12,3,0.84)';
  c.lineWidth = 0.9;
  c.stroke();

  // 10 Deep Horizontal Grip Ribs across the muscular walnut pump forend
  for (let i = 0; i < 10; i++) {
    const ry = py + 5.2 + i * 4.85;
    c.strokeStyle = 'rgba(24,8,1,0.75)';
    c.lineWidth = 1.55;
    c.beginPath();
    c.moveTo(cx + 2.4, ry);
    c.lineTo(cx + 17.6, ry);
    c.stroke();
    c.strokeStyle = 'rgba(254,215,170,0.38)';
    c.lineWidth = 0.75;
    c.beginPath();
    c.moveTo(cx + 2.8, ry - 1.1);
    c.lineTo(cx + 17.2, ry - 1.1);
    c.stroke();
  }
}

// ------------------------------------------------------------- SUPER SOAKER
export function soaker(c: C, cx: number, y0: number, t: number) {
  const pressure = shotPulse(gunState.sinceShot, 0.34);

  const limeGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#269e00', '#65a30d', '#a3e635', '#ecfccb', '#84cc16', '#365314']);
  const orangeGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#7c2d12', '#ea580c', '#fb923c', '#ffedd5', '#f97316', '#9a3412']);
  const blueBand = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#172554', '#1d4ed8', '#60a5fa', '#e0f2fe', '#2563eb', '#1e3a8a']);

  // Helper to draw a 3D bent copper pressure pipe with flanged collars (matching SUPER SOAKER image 1!)
  const drawCopperPipe = (pts: [number, number, number, number, number, number]) => {
    const [x0, y0p, cx1, cy1, x1, y1p] = pts;
    c.save();
    c.lineCap = 'round';
    c.strokeStyle = '#3b1105';
    c.lineWidth = 6.8;
    c.beginPath();
    c.moveTo(x0, y0p);
    c.quadraticCurveTo(cx1, cy1, x1, y1p);
    c.stroke();

    c.strokeStyle = '#d97706';
    c.lineWidth = 5.0;
    c.stroke();

    c.strokeStyle = '#fef08a';
    c.lineWidth = 1.6;
    c.stroke();
    c.restore();
  };

  // ══════════════════ 1. BENT COPPER PIPES BEHIND THE TANK & BODY (matching image 1!) ══════════════════
  // Upper copper U-pipe looping from upper lime receiver into top of water tank
  drawCopperPipe([cx - 21, y0 + 26, cx - 19, y0 + 12, cx - 8, y0 + 20]);
  // Lower-rear 90° copper elbow pipe connecting bottom of blue tank cap into rear of lime body
  drawCopperPipe([cx - 27, y0 + 110, cx - 27, y0 + 129, cx - 9, y0 + 126]);

  // ══════════════════ 2. ERGONOMIC LIME-GREEN & SKY-BLUE GRIP + ORANGE TRIGGER (matching image 1!) ══════════════════
  // Sculpted Lime-Green Pistol Grip (`cx - 4 .. cx + 38, y0 + 100 .. y0 + 160`)
  c.beginPath();
  c.moveTo(cx - 4, y0 + 112);
  c.lineTo(cx + 15, y0 + 100);
  c.bezierCurveTo(cx + 24, y0 + 116, cx + 33, y0 + 134, cx + 38, y0 + 149);
  c.quadraticCurveTo(cx + 39, y0 + 156, cx + 32, y0 + 158);
  c.lineTo(cx + 15, y0 + 162);
  c.quadraticCurveTo(cx + 9, y0 + 162, cx + 7, y0 + 154);
  c.bezierCurveTo(cx + 3, y0 + 138, cx - 1, y0 + 125, cx - 4, y0 + 112);
  c.closePath();
  c.fillStyle = limeGrad(cx - 4, cx + 38);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.82)';
  c.lineWidth = 0.9;
  c.stroke();

  // Molded Sky-Blue Finger-Grooved Front Grip Insert inside the lime handle (matching image 1!)
  c.beginPath();
  c.moveTo(cx + 5, y0 + 115);
  c.lineTo(cx + 14, y0 + 111);
  c.bezierCurveTo(cx + 21, y0 + 125, cx + 28, y0 + 138, cx + 32, y0 + 151);
  c.lineTo(cx + 18, y0 + 155);
  c.bezierCurveTo(cx + 13, y0 + 140, cx + 8, y0 + 127, cx + 5, y0 + 115);
  c.closePath();
  c.fillStyle = blueBand(cx + 5, cx + 32);
  c.fill();
  c.strokeStyle = 'rgba(23,37,84,0.75)';
  c.lineWidth = 0.78;
  c.stroke();

  // Bright Orange Trigger inside the Lime Trigger Guard
  c.beginPath();
  c.moveTo(cx + 13, y0 + 94);
  c.quadraticCurveTo(cx + 23, y0 + 100, cx + 18, y0 + 110);
  c.lineTo(cx + 12, y0 + 108);
  c.closePath();
  c.fillStyle = orangeGrad(cx + 12, cx + 23);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.75)';
  c.lineWidth = 0.75;
  c.stroke();

  // Lime-green trigger guard loop
  c.beginPath();
  c.moveTo(cx + 14, y0 + 86);
  c.bezierCurveTo(cx + 29, y0 + 90, cx + 30, y0 + 111, cx + 16, y0 + 117);
  c.lineTo(cx + 13, y0 + 112);
  c.bezierCurveTo(cx + 24, y0 + 108, cx + 24, y0 + 95, cx + 14, y0 + 91);
  c.closePath();
  c.fillStyle = limeGrad(cx + 13, cx + 30);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.78)';
  c.lineWidth = 0.82;
  c.stroke();

  // ══════════════════ 3. CHUNKY RIBBED ORANGE FOREND PUMP ON BLUE/GOLD GUIDE ROD (matching image 1!) ══════════════════
  // Blue/steel guide rod with golden-orange front cap (`cx + 15 .. cx + 22.5, y0 + 24 .. y0 + 90`)
  c.beginPath();
  c.roundRect(cx + 15.5, y0 + 28, 6.8, 60, 2.8);
  c.fillStyle = blueBand(cx + 15.5, cx + 22.3);
  c.fill();
  c.strokeStyle = 'rgba(23,37,84,0.78)';
  c.lineWidth = 0.8;
  c.stroke();
  // Golden-yellow front cap on guide rod
  c.beginPath();
  c.roundRect(cx + 14.8, y0 + 24, 8.2, 6, 2.2);
  c.fillStyle = lin(c, cx + 14.8, cx + 23, ['#b45309', '#facc15', '#fef9c3', '#ea580c']);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.75)';
  c.lineWidth = 0.75;
  c.stroke();

  // Plump 5-Ribbed Bright-Orange Pump Handle (`cx + 12 .. cx + 28`, moves with shot pressure, matching image 1!)
  const pumpY = y0 + 40 + pressure * 12;
  c.beginPath();
  c.roundRect(cx + 12, pumpY, 16, 40, 5.5);
  c.fillStyle = orangeGrad(cx + 12, cx + 28);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.82)';
  c.lineWidth = 0.88;
  c.stroke();

  for (let i = 0; i < 4; i++) {
    const ry = pumpY + 7 + i * 8.4;
    c.strokeStyle = 'rgba(67,20,7,0.72)';
    c.lineWidth = 1.75;
    c.beginPath();
    c.moveTo(cx + 13.5, ry);
    c.lineTo(cx + 26.5, ry);
    c.stroke();
    c.strokeStyle = 'rgba(255,237,213,0.45)';
    c.lineWidth = 0.75;
    c.beginPath();
    c.moveTo(cx + 14, ry - 1.2);
    c.lineTo(cx + 26, ry - 1.2);
    c.stroke();
  }

  // ══════════════════ 4. SCULPTED NEON LIME-GREEN MAIN BODY, ORANGE CHAMBER & LARGE PRESSURE GAUGE (matching image 1!) ══════════════════
  c.beginPath();
  c.moveTo(cx - 12, y0 + 17);
  c.lineTo(cx + 12, y0 + 17);
  c.lineTo(cx + 15.5, y0 + 29);
  c.lineTo(cx + 15.5, y0 + 95);
  c.quadraticCurveTo(cx + 15, y0 + 117, cx + 5, y0 + 131);
  c.lineTo(cx - 11.5, y0 + 133);
  c.quadraticCurveTo(cx - 16, y0 + 123, cx - 15, y0 + 103);
  c.lineTo(cx - 15, y0 + 29);
  c.closePath();
  c.fillStyle = limeGrad(cx - 16, cx + 16);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.84)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glossy white-lime highlight stripe along the left of the main receiver
  c.fillStyle = 'rgba(236,252,203,0.55)';
  c.beginPath();
  c.roundRect(cx - 12, y0 + 23, 3.4, 96, 1.7);
  c.fill();

  // Plump 3D Bright-Orange Central Pressure Capsule in the middle of the lime body (`cx - 8.5 .. cx + 8.5, y0 + 62 .. y0 + 93`, matching image 1!)
  c.beginPath();
  c.roundRect(cx - 8.5, y0 + 62, 17, 31, 6.5);
  c.fillStyle = orangeGrad(cx - 8.5, cx + 8.5);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.8)';
  c.lineWidth = 0.85;
  c.stroke();
  // Specular highlight on the orange capsule
  c.fillStyle = 'rgba(255,237,213,0.52)';
  c.beginPath();
  c.roundRect(cx - 5.5, y0 + 65, 3.2, 24, 1.6);
  c.fill();

  // Center copper feed pipe from bottom of orange capsule to green/brass boss on lower receiver (matching image 1!)
  drawCopperPipe([cx - 1, y0 + 93, cx - 1.5, y0 + 107, cx - 8, y0 + 110]);
  c.fillStyle = '#84cc16';
  c.beginPath();
  c.arc(cx - 8, y0 + 110, 3.6, 0, TAU);
  c.fill();
  c.strokeStyle = '#365314';
  c.lineWidth = 0.8;
  c.stroke();
  c.fillStyle = '#fde047';
  c.beginPath();
  c.arc(cx - 8, y0 + 110, 1.7, 0, TAU);
  c.fill();

  // Large Circular Silver-Rimmed Pressure Gauge (`cx + 2, y0 + 44, r = 10.6`, matching image 1!)
  const gx = cx + 2;
  const gy = y0 + 44;
  c.beginPath();
  c.arc(gx, gy, 10.6, 0, TAU);
  c.fillStyle = lin(c, gx - 11, gx + 11, ['#1e293b', '#cbd5e1', '#ffffff', '#64748b', '#0f172a']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.82)';
  c.lineWidth = 0.88;
  c.stroke();

  // Crisp white gauge dial face
  c.beginPath();
  c.arc(gx, gy, 8.0, 0, TAU);
  c.fillStyle = '#f8fafc';
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 0.72;
  c.stroke();

  // Green / Yellow / Red pressure zone arc on the dial
  c.strokeStyle = '#22c55e';
  c.lineWidth = 1.7;
  c.beginPath();
  c.arc(gx, gy, 5.7, Math.PI * 0.82, Math.PI * 1.48);
  c.stroke();
  c.strokeStyle = '#ef4444';
  c.beginPath();
  c.arc(gx, gy, 5.7, Math.PI * 1.48, Math.PI * 2.18);
  c.stroke();

  // Animated Red Pressure Needle
  c.save();
  c.translate(gx, gy);
  c.rotate(-0.82 + Math.sin(t * 3.2) * 0.45 + pressure * 1.35);
  c.strokeStyle = '#dc2626';
  c.lineWidth = 1.55;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(0, 1.4);
  c.lineTo(0, -6.2);
  c.stroke();
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.arc(0, 0, 1.6, 0, TAU);
  c.fill();
  c.restore();

  // ══════════════════ 5. GLOSSY CLEAR-GLASS & VIBRANT CYAN WATER TANK WITH CENTRAL BLUE STRAP & BASE CAP (matching image 1!) ══════════════════
  const tx = cx - 40;
  const ty = y0 + 23;
  const tw = 26;
  const th = 89;

  c.save();
  c.beginPath();
  c.roundRect(tx, ty, tw, th, 13);
  c.clip();

  // Clear, glossy upper glass dome (dark-tinted transparent glass with sky reflection so the top 38% looks like real clear glass over water!)
  const glassG = c.createLinearGradient(tx, ty, tx + tw, ty);
  glassG.addColorStop(0, 'rgba(56,189,248,0.28)');
  glassG.addColorStop(0.28, 'rgba(224,242,254,0.42)');
  glassG.addColorStop(0.65, 'rgba(14,165,233,0.18)');
  glassG.addColorStop(1, 'rgba(30,58,138,0.38)');
  c.fillStyle = glassG;
  c.fillRect(tx, ty, tw, th);

  // Vibrant Cyan-Blue Sloshing Water Fill in the lower 62% of the tank (`lvl ~ ty + 33`, matching image 1!)
  const lvl = ty + 33 + Math.sin(t * 4) * (1.8 + pressure * 2.5) + pressure * 5;
  c.beginPath();
  c.moveTo(tx, lvl);
  for (let x = 0; x <= tw; x += 2) {
    c.lineTo(tx + x, lvl + Math.sin(t * 5.5 + x * 0.4) * 1.3);
  }
  c.lineTo(tx + tw, ty + th);
  c.lineTo(tx, ty + th);
  c.closePath();
  const waterG = c.createLinearGradient(tx, lvl, tx + tw, ty + th);
  waterG.addColorStop(0, '#22d3ee');
  waterG.addColorStop(0.35, '#0ea5e9');
  waterG.addColorStop(0.75, '#0284c7');
  waterG.addColorStop(1, '#1e3a8a');
  c.fillStyle = waterG;
  c.fill();

  // 3D Elliptical Light-Cyan Water Meniscus Surface at `lvl` (gives the exact 3D cylinder liquid look from image 1!)
  c.beginPath();
  c.ellipse(tx + tw / 2, lvl, tw / 2 - 0.5, 3.6, 0, 0, TAU);
  c.fillStyle = 'rgba(165,243,252,0.78)';
  c.fill();
  c.strokeStyle = '#ecfeff';
  c.lineWidth = 1.25;
  c.stroke();

  // Rising Effervescent Water Bubbles inside the cyan water (matching image 1!)
  for (const [bxOff, byBase, br] of [
    [7, 16, 2.2],
    [18, 22, 1.7],
    [11, 30, 1.5],
    [16, 11, 1.9],
    [8, 36, 1.3],
  ] as [number, number, number][]) {
    const by = ty + th - 12 - ((byBase + t * 18) % 42);
    c.fillStyle = 'rgba(224,242,254,0.82)';
    c.beginPath();
    c.arc(tx + bxOff, by, br, 0, TAU);
    c.fill();
  }

  // High-gloss curved white glass reflection on the upper dome & down the left side of the tank
  c.fillStyle = 'rgba(255,255,255,0.62)';
  c.beginPath();
  c.roundRect(tx + 3.2, ty + 5, 3.8, th - 18, 1.9);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.beginPath();
  c.ellipse(tx + tw * 0.58, ty + 8.5, 5.5, 2.4, 0.35, 0, TAU);
  c.fill();
  c.restore();

  // Crisp outer glass rim contour of the water tank
  c.beginPath();
  c.roundRect(tx, ty, tw, th, 13);
  c.strokeStyle = 'rgba(125,211,252,0.82)';
  c.lineWidth = 1.0;
  c.stroke();

  // ONE Wide Central Metallic-Blue Clamping Band around the middle of the tank (`ty + 31`, matching image 1!)
  c.beginPath();
  c.roundRect(tx - 1.4, ty + 31, tw + 2.8, 9.5, 2.8);
  c.fillStyle = blueBand(tx - 1.4, tx + tw + 1.4);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.82)';
  c.lineWidth = 0.85;
  c.stroke();
  // Subtle horizontal groove across the central blue mounting strap
  c.strokeStyle = 'rgba(191,219,254,0.55)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(tx + 1, ty + 34.5);
  c.lineTo(tx + tw - 1, ty + 34.5);
  c.stroke();

  // Molded Ribbed Royal-Blue Bottom Tank Base Cap (`ty + th - 14`, matching image 1!)
  c.beginPath();
  c.roundRect(tx - 0.8, ty + th - 14, tw + 1.6, 15, [2.5, 2.5, 11, 11]);
  c.fillStyle = blueBand(tx - 0.8, tx + tw + 0.8);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.84)';
  c.lineWidth = 0.88;
  c.stroke();
  c.strokeStyle = 'rgba(147,197,253,0.5)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(tx + 1.5, ty + th - 9.5);
  c.lineTo(tx + tw - 1.5, ty + th - 9.5);
  c.stroke();

  // ══════════════════ 6. RIBBED BLUE NOZZLE COLLAR & GOLDEN-ORANGE CONE NOZZLE + WATER MIST (matching image 1!) ══════════════════
  // Ribbed Royal-Blue Nozzle Collar (`y0 + 6 .. y0 + 18`)
  c.beginPath();
  c.roundRect(cx - 9, y0 + 6.5, 18, 12, 3.2);
  c.fillStyle = blueBand(cx - 9, cx + 9);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.82)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = 'rgba(15,23,42,0.6)';
  c.lineWidth = 1.1;
  for (const ny of [y0 + 10.2, y0 + 14.2]) {
    c.beginPath();
    c.moveTo(cx - 8, ny);
    c.lineTo(cx + 8, ny);
    c.stroke();
  }

  // Tapered Golden-Yellow / Orange Cone Nozzle at the Muzzle Tip (`y0 - 2.5 .. y0 + 7.5`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 7.5, y0 + 7.5);
  c.lineTo(cx - 4.8, y0 - 2);
  c.lineTo(cx + 4.8, y0 - 2);
  c.lineTo(cx + 7.5, y0 + 7.5);
  c.closePath();
  c.fillStyle = lin(c, cx - 7.5, cx + 7.5, ['#b45309', '#facc15', '#fef9c3', '#f97316', '#9a3412']);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.8)';
  c.lineWidth = 0.85;
  c.stroke();

  // Dark nozzle aperture
  c.beginPath();
  c.ellipse(cx, y0 - 2, 3.0, 1.2, 0, 0, TAU);
  c.fillStyle = '#0f172a';
  c.fill();

  // Animated pressurized water mist & droplets at the nozzle tip (matching image 1!)
  const mistA = 0.34 + 0.22 * Math.sin(t * 7) + pressure * 0.42;
  c.save();
  const mistG = c.createRadialGradient(cx, y0 - 4, 1, cx, y0 - 13, 18);
  mistG.addColorStop(0, `rgba(224,242,254,${mistA})`);
  mistG.addColorStop(0.55, `rgba(125,211,252,${mistA * 0.6})`);
  mistG.addColorStop(1, 'rgba(56,189,248,0)');
  c.fillStyle = mistG;
  c.beginPath();
  c.moveTo(cx - 3.5, y0 - 2);
  c.lineTo(cx - 14 - pressure * 5, y0 - 19 - pressure * 6);
  c.quadraticCurveTo(cx, y0 - 24 - pressure * 8, cx + 14 + pressure * 5, y0 - 19 - pressure * 6);
  c.lineTo(cx + 3.5, y0 - 2);
  c.closePath();
  c.fill();
  c.restore();

  if (pressure > 0.02) {
    c.fillStyle = `rgba(215,247,255,${pressure * 0.82})`;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.ellipse(
        cx + side * (7 + pressure * 7),
        y0 - 6 - pressure * 9,
        2.3,
        3.6,
        side * 0.3,
        0,
        TAU,
      );
      c.fill();
    }
  }
}

// ------------------------------------------------------------- SNOWBALL CANNON
export function snowball(c: C, cx: number, y0: number, t: number, loaded = SNOWBALL_MAG_SIZE) {
  const thump = shotPulse(gunState.sinceShot, 0.34);
  const pulse = 0.78 + 0.22 * Math.sin(t * 5);

  c.save();
  c.translate(0, thump * 4.5);

  const royalGold = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef9c3', '#eab308', '#92400e']);
  const glacierBlue = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#1e3a8a', '#2563eb', '#60a5fa', '#e0f2fe', '#93c5fd', '#1d4ed8']);

  // Helper to draw an intricate 6-branched snowflake
  const drawSnowflake = (sx: number, sy: number, r: number, col = '#ffffff', lw = 1.35) => {
    c.save();
    c.translate(sx, sy);
    c.strokeStyle = col;
    c.lineWidth = lw;
    c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      c.save();
      c.rotate((i * TAU) / 6);
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(0, -r);
      // V-branches along arm
      c.moveTo(0, -r * 0.52);
      c.lineTo(-r * 0.26, -r * 0.74);
      c.moveTo(0, -r * 0.52);
      c.lineTo(r * 0.26, -r * 0.74);
      c.moveTo(0, -r * 0.78);
      c.lineTo(-r * 0.18, -r * 0.94);
      c.moveTo(0, -r * 0.78);
      c.lineTo(r * 0.18, -r * 0.94);
      c.stroke();
      c.restore();
    }
    c.fillStyle = col;
    c.beginPath();
    c.arc(0, 0, lw * 0.95, 0, TAU);
    c.fill();
    c.restore();
  };

  // ══════════════════ 1. CURLING ICE-BLUE SATIN RIBBON & SPARKLES ON UPPER-LEFT (-x, y0 + 104 .. y0 + 148, matching image 1!) ══════════════════
  const sway = Math.sin(t * 3.4) * 1.4;
  c.save();
  // Upper-left looping ribbon tail (`cx - 42 .. cx - 13, y0 + 105 .. y0 + 146`)
  c.beginPath();
  c.moveTo(cx - 14, y0 + 120);
  c.bezierCurveTo(cx - 28, y0 + 106, cx - 39, y0 + 112 + sway, cx - 34, y0 + 128 + sway);
  c.bezierCurveTo(cx - 30, y0 + 139 + sway, cx - 20, y0 + 142, cx - 12, y0 + 134);
  c.lineTo(cx - 13, y0 + 127);
  c.bezierCurveTo(cx - 21, y0 + 133, cx - 27, y0 + 130 + sway, cx - 28, y0 + 121 + sway);
  c.bezierCurveTo(cx - 29, y0 + 113 + sway, cx - 21, y0 + 113, cx - 14, y0 + 120);
  c.closePath();
  c.fillStyle = lin(c, cx - 40, cx - 12, ['#0369a1', '#0ea5e9', '#7dd3fc', '#bae6fd', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.82)';
  c.lineWidth = 0.8;
  c.stroke();

  // Forked swallowtail ribbon end flaring out to the left (`cx - 45 .. cx - 28, y0 + 104 .. y0 + 122`)
  c.beginPath();
  c.moveTo(cx - 33, y0 + 112 + sway);
  c.quadraticCurveTo(cx - 41, y0 + 105 + sway, cx - 45, y0 + 111 + sway);
  c.lineTo(cx - 40, y0 + 116 + sway);
  c.lineTo(cx - 44, y0 + 122 + sway);
  c.quadraticCurveTo(cx - 37, y0 + 122 + sway, cx - 32, y0 + 118 + sway);
  c.closePath();
  c.fillStyle = lin(c, cx - 45, cx - 32, ['#38bdf8', '#bae6fd', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.78)';
  c.lineWidth = 0.75;
  c.stroke();

  // 2 four-point violet-white sparkles beside the ribbon (`matching image 1!`)
  for (const [sx, sy, sr] of [
    [cx - 35, y0 + 96, 3.8],
    [cx - 38, y0 + 134, 3.2],
  ] as [number, number, number][]) {
    star(c, sx, sy, sr * pulse, '#f5d0fe', 4);
    star(c, sx, sy, sr * 0.55, '#ffffff', 4);
  }
  c.restore();

  // ══════════════════ 2. TOP-SPINE GOLD-FRAMED SNOWBALL MAGAZINE TROUGH WITH 5 SNOWBALLS (`cx - 29 .. cx - 11, y0 + 44 .. y0 + 114`, matching image 1!) ══════════════════
  // Beveled gold trough frame along the upper-left spine (`-x`)
  c.beginPath();
  c.moveTo(cx - 12, y0 + 42);
  c.lineTo(cx - 26.5, y0 + 48);
  c.lineTo(cx - 27.5, y0 + 108);
  c.lineTo(cx - 12, y0 + 115);
  c.closePath();
  c.fillStyle = '#090e24';
  c.fill();
  c.strokeStyle = royalGold(cx - 28, cx - 12);
  c.lineWidth = 2.4;
  c.stroke();
  c.strokeStyle = 'rgba(120,53,15,0.85)';
  c.lineWidth = 0.78;
  c.stroke();

  // 5 3D White Snowballs in the trough (4 lined up visibly in the gold trough + 1 in the front feed chute; `r = 5.9` for test compatibility!)
  const ballPositions: [number, number][] = [
    [-19.2, 99.5],
    [-19.2, 85.5],
    [-19.2, 71.5],
    [-19.2, 57.5],
    [-11.5, 48.5],
  ];
  for (let i = 0; i < SNOWBALL_MAG_SIZE; i++) {
    if (i >= loaded) continue;
    const [bx, by] = ballPositions[i];
    const sx = cx + bx;
    const sy = y0 + by;
    const sg = c.createRadialGradient(sx - 2.0, sy - 2.0, 0.8, sx, sy, 5.9);
    sg.addColorStop(0, '#ffffff');
    sg.addColorStop(0.6, '#f0f9ff');
    sg.addColorStop(0.88, '#bae6fd');
    sg.addColorStop(1, '#60a5fa');
    c.fillStyle = sg;
    c.beginPath();
    c.arc(sx, sy, 5.9, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(30,58,138,0.42)';
    c.lineWidth = 0.65;
    c.stroke();
  }

  // ══════════════════ 3. ORNATE FACETED ICE-CRYSTAL & GOLD PISTOL GRIP + GOLDEN TRIGGER GUARD (`y0 + 124 .. y0 + 194`, matching image 1!) ══════════════════
  // Ornate Golden Trigger Guard with Star-Spur & Cyan Trigger on underside (`+x`, `cx + 6 .. cx + 24, y0 + 124 .. y0 + 156`)
  c.beginPath();
  c.moveTo(cx + 8, y0 + 124);
  c.lineTo(cx + 22, y0 + 132);
  c.lineTo(cx + 20, y0 + 148);
  c.lineTo(cx + 24, y0 + 152);
  c.lineTo(cx + 16, y0 + 153);
  c.lineTo(cx + 8, y0 + 148);
  c.lineTo(cx + 9, y0 + 143);
  c.lineTo(cx + 16, y0 + 145);
  c.lineTo(cx + 17, y0 + 135);
  c.lineTo(cx + 7, y0 + 129);
  c.closePath();
  c.fillStyle = royalGold(cx + 7, cx + 24);
  c.fill();
  c.strokeStyle = 'rgba(92,40,8,0.86)';
  c.lineWidth = 0.82;
  c.stroke();

  // Curved cyan- & gold-rimmed trigger inside guard
  c.beginPath();
  c.moveTo(cx + 9, y0 + 131);
  c.quadraticCurveTo(cx + 15, y0 + 136, cx + 12, y0 + 142);
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 2.2;
  c.stroke();

  // Contoured Faceted Ice-Crystal & Cobalt Pistol Grip (`cx - 13 .. cx + 19, y0 + 126 .. y0 + 192`)
  c.save();
  c.beginPath();
  c.moveTo(cx - 11, y0 + 126);
  c.lineTo(cx + 9, y0 + 126);
  c.lineTo(cx + 12, y0 + 148);
  c.lineTo(cx + 18, y0 + 174);
  c.lineTo(cx + 12, y0 + 191);
  c.lineTo(cx - 4, y0 + 188);
  c.lineTo(cx - 11, y0 + 158);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 18, ['#1e1b4b', '#1d4ed8', '#38bdf8', '#93c5fd', '#1e40af']);
  c.fill();
  c.clip();

  // Geometric white-ice crystal facet bands across the grip
  c.fillStyle = 'rgba(224,242,254,0.75)';
  c.beginPath();
  c.moveTo(cx - 12, y0 + 143);
  c.lineTo(cx + 14, y0 + 138);
  c.lineTo(cx + 14, y0 + 145);
  c.lineTo(cx - 12, y0 + 150);
  c.closePath();
  c.fill();

  // Hexagonal Cyan Ice Medallion with White Snowflake on Grip (`cx + 3, y0 + 163`, matching image 1!)
  c.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * TAU) / 6 + Math.PI / 6;
    const px = cx + 3 + Math.cos(a) * 10.5;
    const py = y0 + 163 + Math.sin(a) * 10.5;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
  c.fillStyle = lin(c, cx - 8, cx + 14, ['#0284c7', '#38bdf8', '#7dd3fc', '#0369a1']);
  c.fill();
  c.strokeStyle = '#e0f2fe';
  c.lineWidth = 1.1;
  c.stroke();
  drawSnowflake(cx + 3, y0 + 163, 6.2, '#ffffff', 1.15);

  // Golden & White-Ice Pointed Pommel Cap (`y0 + 176 .. y0 + 192`)
  c.beginPath();
  c.moveTo(cx - 6, y0 + 178);
  c.lineTo(cx + 18, y0 + 174);
  c.lineTo(cx + 13, y0 + 192);
  c.lineTo(cx - 4, y0 + 189);
  c.closePath();
  c.fillStyle = royalGold(cx - 6, cx + 18);
  c.fill();
  c.restore();

  // Outer grip contour & golden upper grip spur
  c.beginPath();
  c.moveTo(cx - 11, y0 + 126);
  c.lineTo(cx + 9, y0 + 126);
  c.lineTo(cx + 12, y0 + 148);
  c.lineTo(cx + 18, y0 + 174);
  c.lineTo(cx + 12, y0 + 191);
  c.lineTo(cx - 4, y0 + 188);
  c.lineTo(cx - 11, y0 + 158);
  c.closePath();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.9;
  c.stroke();

  // Protruding cyan ice crystal tip at the bottom of the pommel (`cx + 6, y0 + 194`)
  c.beginPath();
  c.moveTo(cx + 1, y0 + 189);
  c.lineTo(cx + 11, y0 + 190);
  c.lineTo(cx + 6, y0 + 196);
  c.closePath();
  c.fillStyle = '#38bdf8';
  c.fill();
  c.strokeStyle = '#bae6fd';
  c.lineWidth = 0.75;
  c.stroke();

  // ══════════════════ 4. MAIN FACETED GLACIER-CRYSTAL BARREL WITH SNOWFLAKE & GOLD FILIGREE (`cx - 15 .. cx + 16, y0 + 40 .. y0 + 128`, matching image 1!) ══════════════════
  c.save();
  c.beginPath();
  c.roundRect(cx - 14.5, y0 + 40, 30, 88, 6);
  c.fillStyle = glacierBlue(cx - 14.5, cx + 15.5);
  c.fill();
  c.clip();

  // Low-poly geometric crystal facets across the barrel body
  const facets: [number, number, number, number, number, number, string][] = [
    [-15, 42, 2, 58, -15, 76, 'rgba(255,255,255,0.34)'],
    [2, 58, 16, 46, 16, 78, 'rgba(30,58,138,0.28)'],
    [-15, 76, 4, 88, -15, 108, 'rgba(186,230,253,0.38)'],
    [4, 88, 16, 78, 16, 112, 'rgba(29,78,216,0.32)'],
    [-6, 42, 14, 42, 2, 62, 'rgba(240,249,255,0.42)'],
    [-8, 96, 12, 102, 0, 124, 'rgba(224,242,254,0.32)'],
  ];
  for (const [x1, y1, x2, y2, x3, y3, fcol] of facets) {
    c.fillStyle = fcol;
    c.beginPath();
    c.moveTo(cx + x1, y0 + y1);
    c.lineTo(cx + x2, y0 + y2);
    c.lineTo(cx + x3, y0 + y3);
    c.closePath();
    c.fill();
  }

  // Crisp specular highlight ridge along the barrel
  c.fillStyle = 'rgba(255,255,255,0.42)';
  c.fillRect(cx - 8.5, y0 + 42, 4.2, 82);
  c.restore();

  // Barrel outer contour
  c.beginPath();
  c.roundRect(cx - 14.5, y0 + 40, 30, 88, 6);
  c.strokeStyle = 'rgba(15,23,42,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // Large Ornate 6-Branched White Snowflake Emblem in the Center of the Barrel (`cx + 0.5, y0 + 86`, matching image 1!)
  drawSnowflake(cx + 0.5, y0 + 86, 12.5, '#ffffff', 1.55);

  // Ornate Golden V-Chevron Filigree & Deep-Sapphire Diamond Window (`y0 + 40 .. y0 + 70`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 10, y0 + 41);
  c.lineTo(cx + 11, y0 + 41);
  c.lineTo(cx + 12.5, y0 + 54);
  c.lineTo(cx + 0.5, y0 + 70);
  c.lineTo(cx - 11.5, y0 + 54);
  c.closePath();
  c.fillStyle = royalGold(cx - 12, cx + 13);
  c.fill();
  c.strokeStyle = 'rgba(92,40,8,0.85)';
  c.lineWidth = 0.82;
  c.stroke();

  // Inner deep-sapphire diamond recess with 3 glowing cyan-white dots
  c.beginPath();
  c.moveTo(cx + 0.5, y0 + 43);
  c.lineTo(cx + 7.5, y0 + 53);
  c.lineTo(cx + 0.5, y0 + 64);
  c.lineTo(cx - 6.5, y0 + 53);
  c.closePath();
  c.fillStyle = lin(c, cx - 7, cx + 8, ['#0c4a6e', '#0284c7', '#38bdf8', '#0369a1']);
  c.fill();
  c.strokeStyle = '#bae6fd';
  c.lineWidth = 0.75;
  c.stroke();
  for (const dy of [49, 53.5, 58]) {
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(cx + 0.5, y0 + dy, 1.15, 0, TAU);
    c.fill();
  }

  // Ornate Golden Filigree Rear Collar & Faceted Cyan Diamond Gem (`y0 + 112 .. y0 + 131`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 16.5, y0 + 118);
  c.quadraticCurveTo(cx + 0.5, y0 + 109, cx + 17.5, y0 + 118);
  c.lineTo(cx + 16.5, y0 + 128);
  c.quadraticCurveTo(cx + 0.5, y0 + 132, cx - 15.5, y0 + 128);
  c.closePath();
  c.fillStyle = royalGold(cx - 17, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(92,40,8,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  // Faceted Cyan Diamond Gem set in the center of the rear gold collar (`cx + 0.5, y0 + 121`)
  c.beginPath();
  c.moveTo(cx + 0.5, y0 + 113.5);
  c.lineTo(cx + 8.5, y0 + 121);
  c.lineTo(cx + 0.5, y0 + 128.5);
  c.lineTo(cx - 7.5, y0 + 121);
  c.closePath();
  c.fillStyle = lin(c, cx - 8, cx + 9, ['#0284c7', '#7dd3fc', '#ffffff', '#38bdf8', '#0369a1']);
  c.fill();
  c.strokeStyle = '#78350f';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 5. FLARED ROYAL-BLUE COLLAR, JAGGED ICE SHARDS, SPIKED GOLD CROWN & DIAMOND MUZZLE (`y0 + 8 .. y0 + 44`, matching image 1!) ══════════════════
  // Jagged Protruding Ice-Crystal Shards jutting out on both sides of the muzzle (`cx - 28 .. cx + 28, y0 + 10 .. y0 + 42`)
  for (const sDir of [-1, 1]) {
    // Rear lateral ice shard
    c.beginPath();
    c.moveTo(cx + sDir * 14, y0 + 36);
    c.lineTo(cx + sDir * 26.5, y0 + 27);
    c.lineTo(cx + sDir * 21, y0 + 21);
    c.lineTo(cx + sDir * 13, y0 + 26);
    c.closePath();
    c.fillStyle = lin(c, cx - 27, cx + 27, ['#38bdf8', '#e0f2fe', '#ffffff', '#0284c7']);
    c.fill();
    c.strokeStyle = 'rgba(12,74,110,0.82)';
    c.lineWidth = 0.8;
    c.stroke();

    // Forward pointed white-ice crystal spike
    c.beginPath();
    c.moveTo(cx + sDir * 13, y0 + 24);
    c.lineTo(cx + sDir * 27.5, y0 + 11);
    c.lineTo(cx + sDir * 16.5, y0 + 14);
    c.closePath();
    c.fillStyle = lin(c, cx - 28, cx + 28, ['#bae6fd', '#ffffff', '#7dd3fc']);
    c.fill();
    c.strokeStyle = 'rgba(2,132,199,0.82)';
    c.lineWidth = 0.8;
    c.stroke();
  }

  // Deep Royal-Blue Flared Muzzle Collar (`cx - 17.5 .. cx + 18.5, y0 + 22 .. y0 + 43`)
  c.beginPath();
  c.moveTo(cx - 18, y0 + 22);
  c.lineTo(cx + 19, y0 + 22);
  c.lineTo(cx + 16, y0 + 43);
  c.lineTo(cx - 15, y0 + 43);
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 19, ['#0f172a', '#1d4ed8', '#3b82f6', '#60a5fa', '#1e3a8a']);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.9;
  c.stroke();

  // Bright White Snowflake Crest on the Muzzle Collar (`cx + 0.5, y0 + 33`, matching image 1!)
  drawSnowflake(cx + 0.5, y0 + 33, 8.2, '#ffffff', 1.35);

  // Spiked 3D Royal-Gold Muzzle Crown (`cx - 22 .. cx + 23, y0 + 9 .. y0 + 25`, matching image 1!)
  c.beginPath();
  c.moveTo(cx - 18, y0 + 23);
  c.lineTo(cx - 22.5, y0 + 16);
  c.lineTo(cx - 14, y0 + 14);
  c.lineTo(cx - 11, y0 + 8.5);
  c.lineTo(cx - 4, y0 + 12.5);
  c.lineTo(cx + 0.5, y0 + 7.5);
  c.lineTo(cx + 5, y0 + 12.5);
  c.lineTo(cx + 12, y0 + 8.5);
  c.lineTo(cx + 15, y0 + 14);
  c.lineTo(cx + 23.5, y0 + 16);
  c.lineTo(cx + 19, y0 + 23);
  c.closePath();
  c.fillStyle = royalGold(cx - 23, cx + 24);
  c.fill();
  c.strokeStyle = 'rgba(92,40,8,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  // Faceted Glowing Cyan-Blue Diamond Muzzle Lens (`cx + 0.5, y0 + 15.5`, matching image 1!)
  c.save();
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 8 * pulse;
  c.beginPath();
  c.ellipse(cx + 0.5, y0 + 15.5, 13.5, 4.8, 0, 0, TAU);
  c.fillStyle = lin(c, cx - 13, cx + 14, ['#0284c7', '#38bdf8', '#e0f2fe', '#ffffff', '#0ea5e9']);
  c.fill();
  c.strokeStyle = '#fef08a';
  c.lineWidth = 0.9;
  c.stroke();
  c.restore();

  // ══════════════════ 6. ERUPTING CRYO SNOWFLAKE, ICE SHARDS & FROST ORBS AT MUZZLE (`y0 - 18 .. y0 + 6`, matching image 1!) ══════════════════
  c.save();
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 8;
  drawSnowflake(cx + 0.5, y0 - 6 - thump * 4, 8.5 * pulse, '#e0f2fe', 1.35);

  // Flying faceted ice crystal shards flanking the muzzle snowflake
  for (const [ix, iy, rot, sc] of [
    [-14, -3, -0.48, 1.0],
    [15, -2, 0.48, 1.0],
    [-8, -14, -0.25, 0.72],
    [9, -13, 0.25, 0.72],
  ] as [number, number, number, number][]) {
    c.save();
    c.translate(cx + ix, y0 + iy - thump * 5);
    c.rotate(rot);
    c.scale(sc, sc);
    c.beginPath();
    c.moveTo(0, -6.5);
    c.lineTo(3.2, 0);
    c.lineTo(0, 5.5);
    c.lineTo(-3.2, 0);
    c.closePath();
    c.fillStyle = lin(c, -3.2, 3.2, ['#38bdf8', '#e0f2fe', '#ffffff']);
    c.fill();
    c.strokeStyle = '#0284c7';
    c.lineWidth = 0.65;
    c.stroke();
    c.restore();
  }

  // Glowing cryo frost motes around the muzzle burst
  for (const [mx, my, mr] of [
    [-19, 3, 1.6],
    [20, 4, 1.6],
    [-4, 2, 1.4],
    [5, 2, 1.4],
  ] as [number, number, number][]) {
    c.fillStyle = '#bae6fd';
    c.beginPath();
    c.arc(cx + mx, y0 + my, mr, 0, TAU);
    c.fill();
  }
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- SNIPER AWP
export function sniper(c: C, cx: number, y0: number) {
  const kick = shotPulse(gunState.sinceShot, 0.28);

  const awpGreenGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#1a2e05', '#4d7c0f', '#84cc16', '#bef264', '#65a30d', '#365314']);
  const gunmetalGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#090d16', '#1e293b', '#475569', '#94a3b8', '#334155', '#0f172a']);

  c.save();
  c.translate(0, kick * 4.5);

  // ══════════════════ 1. SCULPTED TACTICAL LIME-GREEN THUMBHOLE STOCK, CHEEK REST & BUTTPAD (`y0 + 148 .. y0 + 226`) ══════════════════
  // Adjustable black tactical cheek rest on left/top spine of stock (`cx - 18 .. cx - 8, y0 + 166 .. y0 + 204`)
  c.beginPath();
  c.roundRect(cx - 17.5, y0 + 168, 9.5, 34, 3.5);
  c.fillStyle = gunmetalGrad(cx - 17.5, cx - 8);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.84;
  c.stroke();

  // Main lime-green AWP thumbhole stock (`cx - 13 .. cx + 31, y0 + 148 .. y0 + 220`, matching SNIPER AWP image!)
  c.beginPath();
  c.moveTo(cx - 12, y0 + 150);
  c.lineTo(cx + 12, y0 + 148);
  // Protruding angled pistol grip section behind trigger guard (`cx + 30, y0 + 166`)
  c.lineTo(cx + 30, y0 + 164);
  c.lineTo(cx + 22, y0 + 178);
  // Lower stock hook cutout (`cx + 22, y0 + 190` -> `cx + 30, y0 + 210`)
  c.lineTo(cx + 21, y0 + 190);
  c.lineTo(cx + 29, y0 + 210);
  c.lineTo(cx + 25, y0 + 219);
  c.lineTo(cx - 13, y0 + 219);
  c.closePath();
  c.fillStyle = awpGreenGrad(cx - 13, cx + 30);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.9)';
  c.lineWidth = 0.92;
  c.stroke();

  // Large sculpted thumbhole cutout in the stock (`cx + 1 .. cx + 15, y0 + 166 .. y0 + 195`)
  c.beginPath();
  c.roundRect(cx + 1, y0 + 166, 13.5, 27, 5);
  c.fillStyle = '#090d16';
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.88)';
  c.lineWidth = 0.86;
  c.stroke();

  // Molded dark grip inlay & stock panel bevels
  c.beginPath();
  c.roundRect(cx - 7.5, y0 + 196, 6.5, 16, 2);
  c.fillStyle = 'rgba(15,23,42,0.6)';
  c.fill();
  c.strokeStyle = 'rgba(236,252,203,0.45)';
  c.lineWidth = 1.1;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 156);
  c.lineTo(cx - 10, y0 + 214);
  c.stroke();

  // Heavy rubberized black recoil buttpad at bottom of stock (`cx - 14 .. cx + 26, y0 + 217 .. y0 + 226`)
  c.beginPath();
  c.roundRect(cx - 14, y0 + 217, 40, 8.5, [2, 2, 4, 4]);
  c.fillStyle = gunmetalGrad(cx - 14, cx + 26);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // ══════════════════ 2. DETACHABLE BOX MAGAZINE, TRIGGER GUARD & BOLT-ACTION RECEIVER (`y0 + 106 .. y0 + 162`) ══════════════════
  // Prominent detachable dark gunmetal sniper box magazine (`cx + 10 .. cx + 31, y0 + 108 .. y0 + 138`)
  c.beginPath();
  c.moveTo(cx + 10, y0 + 108);
  c.lineTo(cx + 31, y0 + 114);
  c.lineTo(cx + 28, y0 + 138);
  c.lineTo(cx + 10, y0 + 135);
  c.closePath();
  c.fillStyle = gunmetalGrad(cx + 10, cx + 31);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.88;
  c.stroke();
  // Magazine reinforcement ribs
  c.strokeStyle = 'rgba(148,163,184,0.5)';
  c.lineWidth = 0.9;
  for (let i = 0; i < 3; i++) {
    const my = y0 + 115 + i * 6;
    c.beginPath();
    c.moveTo(cx + 13, my);
    c.lineTo(cx + 26, my + 2);
    c.stroke();
  }

  // Gunmetal trigger guard & curved trigger (`cx + 10 .. cx + 24, y0 + 136 .. y0 + 158`)
  c.beginPath();
  c.moveTo(cx + 10, y0 + 136);
  c.lineTo(cx + 23, y0 + 139);
  c.lineTo(cx + 22, y0 + 156);
  c.lineTo(cx + 10, y0 + 156);
  c.closePath();
  c.fillStyle = 'rgba(15,23,42,0.38)';
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 1.3;
  c.stroke();
  // Trigger blade
  c.beginPath();
  c.moveTo(cx + 12, y0 + 141);
  c.quadraticCurveTo(cx + 18, y0 + 145, cx + 16, y0 + 152);
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 1.5;
  c.stroke();

  // Upper gunmetal bolt-action receiver (`cx - 13 .. cx + 4, y0 + 104 .. y0 + 156`)
  c.beginPath();
  c.roundRect(cx - 13, y0 + 104, 17, 52, 3);
  c.fillStyle = gunmetalGrad(cx - 13, cx + 4);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Ejection port & silver bolt cylinder inside receiver
  c.beginPath();
  c.roundRect(cx - 9, y0 + 114 + kick * 5, 8, 22, 2);
  c.fillStyle = lin(c, cx - 9, cx - 1, ['#475569', '#f8fafc', '#64748b']);
  c.fill();

  // Muscular lime-green lower chassis body along receiver (`cx - 3 .. cx + 13, y0 + 104 .. y0 + 156`)
  c.beginPath();
  c.roundRect(cx - 3, y0 + 104, 16, 52, 3.5);
  c.fillStyle = awpGreenGrad(cx - 3, cx + 13);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.9)';
  c.lineWidth = 0.9;
  c.stroke();

  // Angular black chassis accent on receiver side
  c.beginPath();
  c.moveTo(cx + 1, y0 + 112);
  c.lineTo(cx + 9, y0 + 116);
  c.lineTo(cx + 9, y0 + 132);
  c.lineTo(cx + 1, y0 + 128);
  c.closePath();
  c.fillStyle = '#0f172a';
  c.fill();

  // Bolt handle & spherical tactical knob (`cx + 6 .. cx + 21, y0 + 138 .. y0 + 148`)
  c.strokeStyle = '#cbd5e1';
  c.lineWidth = 2.4;
  c.beginPath();
  c.moveTo(cx + 6, y0 + 140 + kick * 4);
  c.lineTo(cx + 19, y0 + 145 + kick * 4);
  c.stroke();
  c.beginPath();
  c.arc(cx + 20, y0 + 146 + kick * 4, 3.6, 0, TAU);
  c.fillStyle = radial(c, cx + 19, y0 + 145 + kick * 4, 4, ['#f8fafc', '#64748b', '#0f172a']);
  c.fill();

  // ══════════════════ 3. SLOTTED TACTICAL LIME-GREEN FOREND (`cx - 13 .. cx + 13, y0 + 54 .. y0 + 108`) ══════════════════
  c.beginPath();
  c.moveTo(cx - 9, y0 + 54);
  c.lineTo(cx + 9, y0 + 54);
  c.lineTo(cx + 13, y0 + 66);
  c.lineTo(cx + 13, y0 + 108);
  c.lineTo(cx - 13, y0 + 108);
  c.lineTo(cx - 13, y0 + 62);
  c.closePath();
  c.fillStyle = awpGreenGrad(cx - 13, cx + 13);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.9)';
  c.lineWidth = 0.92;
  c.stroke();

  // 3 dark tactical cooling slots along the lime-green forend (matching SNIPER AWP image!)
  for (let i = 0; i < 3; i++) {
    const vy = y0 + 64 + i * 13;
    c.beginPath();
    c.roundRect(cx - 5.5, vy, 11, 7, 2);
    c.fillStyle = '#0f172a';
    c.fill();
    c.strokeStyle = 'rgba(190,242,100,0.5)';
    c.lineWidth = 0.7;
    c.stroke();
  }

  // Front gunmetal bipod mount lug under forend (`cx + 11 .. cx + 19, y0 + 58 .. y0 + 76`)
  c.beginPath();
  c.roundRect(cx + 11, y0 + 58, 7, 18, 2);
  c.fillStyle = gunmetalGrad(cx + 11, cx + 18);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.86)';
  c.lineWidth = 0.8;
  c.stroke();

  // ══════════════════ 4. PRECISION FLUTED BARREL & MULTI-PORT MUZZLE BRAKE (`y0 - 8 .. y0 + 56`) ══════════════════
  // Heavy free-floating gunmetal barrel (`cx - 4.5 .. cx + 4.5, y0 + 11 .. y0 + 56`)
  c.beginPath();
  c.roundRect(cx - 4.5, y0 + 11, 9, 45, 1.5);
  c.fillStyle = gunmetalGrad(cx - 4.5, cx + 4.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.86;
  c.stroke();
  // Specular barrel flute line
  c.strokeStyle = 'rgba(226,232,240,0.55)';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(cx - 1.4, y0 + 14);
  c.lineTo(cx - 1.4, y0 + 52);
  c.stroke();

  // Chamfered multi-port tactical muzzle brake (`cx - 8 .. cx + 8, y0 - 8 .. y0 + 13`)
  c.beginPath();
  c.roundRect(cx - 8, y0 - 8, 16, 21, 3);
  c.fillStyle = gunmetalGrad(cx - 8, cx + 8);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();
  // Side baffle ports on muzzle brake
  c.fillStyle = '#090d16';
  for (let i = 0; i < 2; i++) {
    const py = y0 - 2 + i * 6;
    c.fillRect(cx - 6, py, 3.8, 3.2);
    c.fillRect(cx + 2.2, py, 3.8, 3.2);
  }
  // Glowing neon-green ring inside muzzle brake tip (matching SNIPER AWP image!)
  c.beginPath();
  c.ellipse(cx, y0 - 6, 5.2, 2.2, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 - 6, 5.5, ['#ffffff', '#bef264', '#4ade80', '#15803d']);
  c.fill();

  // ══════════════════ 5. TELESCOPIC SNIPER SCOPE WITH LIME RINGS & 3D GREEN LENS (`cx - 37 .. cx - 11, y0 + 64 .. y0 + 156`) ══════════════════
  // Dual heavy Picatinny scope mount rings (`y0 + 92` and `y0 + 128`)
  for (const my of [92, 128]) {
    c.beginPath();
    c.roundRect(cx - 22, y0 + my, 11, 8, 1.5);
    c.fillStyle = gunmetalGrad(cx - 22, cx - 11);
    c.fill();
    c.strokeStyle = 'rgba(15,23,42,0.88)';
    c.lineWidth = 0.82;
    c.stroke();
  }

  // Main telescopic scope tube (`cx - 31 .. cx - 19, y0 + 78 .. y0 + 146`)
  c.beginPath();
  c.roundRect(cx - 31, y0 + 78, 12, 68, 3);
  c.fillStyle = gunmetalGrad(cx - 31, cx - 19);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Flared front objective bell (`cx - 35 .. cx - 15, y0 + 62 .. y0 + 86`)
  c.beginPath();
  c.roundRect(cx - 35, y0 + 62, 20, 24, [7, 7, 3, 3]);
  c.fillStyle = gunmetalGrad(cx - 35, cx - 15);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.9;
  c.stroke();

  // Tactical lime-green accent bands on scope bell & eyepiece (matching SNIPER AWP image!)
  c.fillStyle = awpGreenGrad(cx - 35, cx - 15);
  c.fillRect(cx - 34, y0 + 72, 18, 4.5);
  c.fillRect(cx - 30, y0 + 138, 10, 4);

  // Flared rear ocular eyepiece (`cx - 33 .. cx - 17, y0 + 142 .. y0 + 156`)
  c.beginPath();
  c.roundRect(cx - 33, y0 + 142, 16, 14, [2.5, 2.5, 5, 5]);
  c.fillStyle = gunmetalGrad(cx - 33, cx - 17);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.86;
  c.stroke();

  // Elevation/windage turret knob (`cx - 37.5 .. cx - 30, y0 + 106 .. y0 + 120`)
  c.beginPath();
  c.roundRect(cx - 37.5, y0 + 106, 7, 14, 2);
  c.fillStyle = awpGreenGrad(cx - 37.5, cx - 30.5);
  c.fill();
  c.strokeStyle = 'rgba(26,46,5,0.88)';
  c.lineWidth = 0.8;
  c.stroke();

  // Glowing 3D neon-green front objective lens (`cx - 25, y0 + 65`, matching SNIPER AWP image!)
  c.save();
  c.shadowColor = '#84cc16';
  c.shadowBlur = 10;
  c.beginPath();
  c.ellipse(cx - 25, y0 + 64.5, 8.2, 4.2, 0, 0, TAU);
  c.fillStyle = radial(c, cx - 26, y0 + 64, 8.5, ['#ffffff', '#bef264', '#4ade80', '#15803d']);
  c.fill();
  c.strokeStyle = '#ecfccb';
  c.lineWidth = 0.75;
  c.stroke();
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- FLAMETHROWER
export function flamethrower(c: C, cx: number, y0: number, t: number) {
  const kick = shotPulse(gunState.sinceShot, 0.25);
  const f = 0.82 + 0.18 * Math.sin(t * 24);
  const sway = Math.sin(t * 16) * 1.4;

  const gunmetalGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#0f172a', '#334155', '#64748b', '#94a3b8', '#334155', '#0f172a']);
  const redTankGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#450a0a', '#991b1b', '#ef4444', '#fca5a5', '#dc2626', '#7f1d1d']);
  const brassNozzleGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#78350f', '#d97706', '#facc15', '#fef08a', '#b45309', '#451a03']);

  const drawCorrugatedHose = (
    x0: number, yStart: number, c1x: number, c1y: number, c2x: number, c2y: number, x1: number, yEnd: number,
  ) => {
    c.save();
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(15,23,42,0.92)';
    c.lineWidth = 8.8;
    c.beginPath();
    c.moveTo(x0, yStart);
    c.bezierCurveTo(c1x, c1y, c2x, c2y, x1, yEnd);
    c.stroke();

    c.strokeStyle = '#64748b';
    c.lineWidth = 6.4;
    c.stroke();

    // Explicit transverse ribbing rings along the bezier curve so both Canvas and SVG show crisp corrugation!
    for (let i = 1; i < 11; i++) {
      const u = i / 11;
      const v = 1 - u;
      const px = v * v * v * x0 + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * x1;
      const py = v * v * v * yStart + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * yEnd;
      c.beginPath();
      c.arc(px, py, 3.1, 0, TAU);
      c.fillStyle = i % 2 === 0 ? '#94a3b8' : '#1e293b';
      c.fill();
    }
    c.restore();
  };

  c.save();
  c.translate(0, kick * 3.5);

  // ══════════════════ 1. DUAL CORRUGATED STEEL FUEL HOSES (TOP-LEFT SPINE + BOTTOM-RIGHT UNDER-GRIP, matching FLAMETHROWER image!) ══════════════════
  // Upper-left corrugated hose arching from mid-receiver (`cx - 14, y0 + 88`) to rear stock (`cx - 16, y0 + 140`)
  drawCorrugatedHose(
    cx - 14, y0 + 88,
    cx - 32, y0 + 96,
    cx - 32, y0 + 132,
    cx - 15, y0 + 140,
  );
  // Lower-right corrugated hose looping from rear stock (`cx + 2, y0 + 138`) around pistol grip (`cx + 42, y0 + 136`) to red fuel tank (`cx + 27, y0 + 94`)
  drawCorrugatedHose(
    cx + 2, y0 + 138,
    cx + 28, y0 + 158,
    cx + 46, y0 + 130,
    cx + 27, y0 + 94,
  );

  // ══════════════════ 2. REAR STOCK WITH CRIMSON-RED TRIM & ERGONOMIC PISTOL GRIP (`y0 + 98 .. y0 + 168`) ══════════════════
  // Rear tactical stock / buttpad (`cx - 20 .. cx + 14, y0 + 132 .. y0 + 166`)
  c.beginPath();
  c.moveTo(cx - 15, y0 + 132);
  c.lineTo(cx + 11, y0 + 132);
  c.lineTo(cx + 15, y0 + 156);
  c.lineTo(cx - 19, y0 + 165);
  c.closePath();
  c.fillStyle = gunmetalGrad(cx - 19, cx + 15);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.9;
  c.stroke();

  // Crimson-red rear stock lower section (`cx - 4 .. cx + 15, y0 + 136 .. y0 + 158`, matching FLAMETHROWER image!)
  c.beginPath();
  c.moveTo(cx - 3, y0 + 138);
  c.lineTo(cx + 13, y0 + 136);
  c.lineTo(cx + 15, y0 + 154);
  c.lineTo(cx - 3, y0 + 158);
  c.closePath();
  c.fillStyle = redTankGrad(cx - 3, cx + 15);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.88)';
  c.lineWidth = 0.84;
  c.stroke();

  // Gunmetal collar strap across rear stock
  c.beginPath();
  c.roundRect(cx - 18, y0 + 142, 32, 6, 2);
  c.fillStyle = gunmetalGrad(cx - 18, cx + 14);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.8;
  c.stroke();

  // Trigger guard & trigger (`cx + 10 .. cx + 26, y0 + 92 .. y0 + 114`)
  c.beginPath();
  c.roundRect(cx + 10, y0 + 92, 15, 20, 4);
  c.fillStyle = 'rgba(15,23,42,0.35)';
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 1.4;
  c.stroke();
  c.beginPath();
  c.moveTo(cx + 12, y0 + 97);
  c.quadraticCurveTo(cx + 19, y0 + 102, cx + 16, y0 + 108);
  c.strokeStyle = '#cbd5e1';
  c.lineWidth = 1.6;
  c.stroke();

  // Ergonomic dark gunmetal pistol grip angling out to `+x` (`cx + 4 .. cx + 36, y0 + 104 .. y0 + 140`)
  c.beginPath();
  c.moveTo(cx + 4, y0 + 108);
  c.lineTo(cx + 18, y0 + 100);
  c.bezierCurveTo(cx + 27, y0 + 110, cx + 34, y0 + 122, cx + 35, y0 + 132);
  c.lineTo(cx + 21, y0 + 140);
  c.bezierCurveTo(cx + 14, y0 + 130, cx + 8, y0 + 118, cx + 4, y0 + 108);
  c.closePath();
  c.fillStyle = gunmetalGrad(cx + 4, cx + 35);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // ══════════════════ 3. CRIMSON-RED UNDER-BARREL FUEL CANISTER & YELLOW HAZARD STICKER (`cx + 13 .. cx + 40, y0 + 44 .. y0 + 98`) ══════════════════
  // Upper angled brass/gunmetal pilot-igniter torch (`cx + 16 .. cx + 32, y0 + 18 .. y0 + 46`, matching FLAMETHROWER image!)
  c.save();
  c.translate(cx + 24, y0 + 36);
  c.rotate(-0.18);
  c.beginPath();
  c.roundRect(-5, -18, 10, 18, 2);
  c.fillStyle = gunmetalGrad(-5, 5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.82;
  c.stroke();
  // Brass conical igniter tip
  c.beginPath();
  c.moveTo(-4.5, -18);
  c.lineTo(-2.4, -27);
  c.lineTo(2.4, -27);
  c.lineTo(4.5, -18);
  c.closePath();
  c.fillStyle = brassNozzleGrad(-4.5, 4.5);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.86)';
  c.lineWidth = 0.78;
  c.stroke();
  c.restore();

  // Main cylindrical crimson-red fuel tank (`cx + 13 .. cx + 39, y0 + 44 .. y0 + 96`)
  c.beginPath();
  c.roundRect(cx + 13, y0 + 44, 26, 52, 7.5);
  c.fillStyle = redTankGrad(cx + 13, cx + 39);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.9)';
  c.lineWidth = 0.92;
  c.stroke();

  // Brass/gold neck band & dark bottom cap on the red fuel tank
  c.fillStyle = brassNozzleGrad(cx + 13, cx + 39);
  c.fillRect(cx + 13.8, y0 + 48, 24.4, 5);
  c.fillStyle = gunmetalGrad(cx + 13, cx + 39);
  c.fillRect(cx + 14, y0 + 89, 24, 5.5);

  // Yellow diamond hazard warning sticker (`♦` with red flame inside) on the red fuel tank (`cx + 26, y0 + 71`)
  c.save();
  c.translate(cx + 26, y0 + 71);
  c.beginPath();
  c.moveTo(0, -9);
  c.lineTo(9, 0);
  c.lineTo(0, 9);
  c.lineTo(-9, 0);
  c.closePath();
  c.fillStyle = '#facc15';
  c.fill();
  c.strokeStyle = '#78350f';
  c.lineWidth = 0.85;
  c.stroke();
  // Red flame inside yellow hazard diamond
  c.beginPath();
  c.moveTo(0, -4.8);
  c.quadraticCurveTo(3.6, -0.5, 2, 3.6);
  c.quadraticCurveTo(0, 5, -2, 3.6);
  c.quadraticCurveTo(-3.6, -0.5, 0, -4.8);
  c.closePath();
  c.fillStyle = '#dc2626';
  c.fill();
  c.restore();

  // ══════════════════ 4. HEAVY INDUSTRIAL DARK-GUNMETAL RECEIVER & CARRY RAIL (`cx - 22 .. cx + 15, y0 + 42 .. y0 + 136`) ══════════════════
  // Raised left/top carry rail (`cx - 22 .. cx - 12, y0 + 54 .. y0 + 90`)
  c.beginPath();
  c.roundRect(cx - 22, y0 + 54, 10, 36, 3);
  c.fillStyle = gunmetalGrad(cx - 22, cx - 12);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.88)';
  c.lineWidth = 0.84;
  c.stroke();

  // Main gunmetal receiver housing (`cx - 15 .. cx + 15, y0 + 42 .. y0 + 136`)
  c.beginPath();
  c.roundRect(cx - 15, y0 + 42, 30, 94, 6);
  c.fillStyle = gunmetalGrad(cx - 15, cx + 15);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.92)';
  c.lineWidth = 0.92;
  c.stroke();

  // Recessed dark armor panel, silver rivets & 2 glowing crimson-orange indicator buttons (matching FLAMETHROWER image!)
  c.beginPath();
  c.roundRect(cx - 10, y0 + 52, 19, 68, 3.5);
  c.fillStyle = 'rgba(15,23,42,0.48)';
  c.fill();
  for (const by of [90, 103]) {
    c.beginPath();
    c.roundRect(cx - 6, y0 + by, 6.5, 8, 2);
    c.fillStyle = '#ef4444';
    c.fill();
    c.strokeStyle = '#450a0a';
    c.lineWidth = 0.72;
    c.stroke();
  }
  // Diagonal vent slots on upper receiver
  c.fillStyle = '#090d16';
  for (let i = 0; i < 3; i++) {
    c.fillRect(cx - 7, y0 + 58 + i * 7, 12, 3);
  }

  // ══════════════════ 5. SLOTTED HEAT SHIELD, BRASS CONICAL NOZZLE & ROARING FLAME JET (`y0 - 30 .. y0 + 44`) ══════════════════
  // Slotted dark gunmetal heat-shield collar (`cx - 13 .. cx + 13, y0 + 24 .. y0 + 44`)
  c.beginPath();
  c.roundRect(cx - 13, y0 + 24, 26, 20, 3.5);
  c.fillStyle = gunmetalGrad(cx - 13, cx + 13);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.88;
  c.stroke();
  c.fillStyle = '#090d16';
  for (let i = 0; i < 3; i++) {
    c.fillRect(cx - 8.5, y0 + 28 + i * 5, 17, 2.3);
  }

  // Tapered golden-brass conical burner nozzle (`cx - 11 .. cx + 11` -> `cx - 6 .. cx + 6` at `y0 + 5 .. y0 + 25`)
  c.beginPath();
  c.moveTo(cx - 11, y0 + 25);
  c.lineTo(cx - 6, y0 + 6);
  c.lineTo(cx + 6, y0 + 6);
  c.lineTo(cx + 11, y0 + 25);
  c.closePath();
  c.fillStyle = brassNozzleGrad(cx - 11, cx + 11);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.9)';
  c.lineWidth = 0.88;
  c.stroke();

  // Dark steel muzzle tip ring (`cx - 5.5 .. cx + 5.5, y0 .. y0 + 7`)
  c.beginPath();
  c.roundRect(cx - 5.5, y0, 11, 7, 2);
  c.fillStyle = gunmetalGrad(cx - 5.5, cx + 5.5);
  c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.9)';
  c.lineWidth = 0.82;
  c.stroke();

  // Roaring multi-layered jagged flame jet erupting from the muzzle (`y0 - 32 .. y0 + 2`, matching FLAMETHROWER image!)
  c.save();
  c.shadowColor = '#f97316';
  c.shadowBlur = 16 * f;
  // Outer crimson-orange jagged flame tongue
  c.beginPath();
  c.moveTo(cx - 5, y0 + 1);
  c.bezierCurveTo(cx - 15, y0 - 6, cx - 16, y0 - 16 * f, cx - 8 + sway, y0 - 22 * f);
  c.lineTo(cx - 10 + sway, y0 - 15 * f);
  c.bezierCurveTo(cx - 8 + sway, y0 - 24 * f, cx - 2 + sway, y0 - 30 * f, cx + sway * 1.2, y0 - 34 * f);
  c.bezierCurveTo(cx + 5 + sway, y0 - 28 * f, cx + 10 + sway, y0 - 22 * f, cx + 9 + sway, y0 - 14 * f);
  c.lineTo(cx + 13 + sway, y0 - 19 * f);
  c.bezierCurveTo(cx + 16, y0 - 12 * f, cx + 13, y0 - 5, cx + 5, y0 + 1);
  c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 14, ['#dc2626', '#f97316', '#fbbf24', '#ea580c']);
  c.fill();

  // Mid bright golden-amber flame
  c.beginPath();
  c.moveTo(cx - 3.5, y0 + 1);
  c.bezierCurveTo(cx - 10, y0 - 6, cx - 8 + sway * 0.8, y0 - 17 * f, cx + sway, y0 - 25 * f);
  c.bezierCurveTo(cx + 8 + sway * 0.8, y0 - 17 * f, cx + 10, y0 - 6, cx + 3.5, y0 + 1);
  c.closePath();
  c.fillStyle = '#facc15';
  c.fill();

  // Inner white-hot core flame
  c.beginPath();
  c.moveTo(cx - 2.2, y0 + 1);
  c.quadraticCurveTo(cx - 4.5 + sway * 0.4, y0 - 10 * f, cx + sway * 0.5, y0 - 15 * f);
  c.quadraticCurveTo(cx + 4.5 + sway * 0.4, y0 - 10 * f, cx + 2.2, y0 + 1);
  c.closePath();
  c.fillStyle = '#fffbeb';
  c.fill();
  c.restore();

  c.restore();
}

// ------------------------------------------------------------- BOOMERANG
export function boomerangGun(c: C, cx: number, y0: number, ready: boolean) {
  // woomera plank
  c.beginPath();
  c.moveTo(cx - 6, y0 + 20);
  c.quadraticCurveTo(cx - 12, y0 + 100, cx - 7, y0 + 176);
  c.lineTo(cx + 9, y0 + 176);
  c.quadraticCurveTo(cx + 14, y0 + 100, cx + 6, y0 + 20);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 14, ['#5c2a0e', '#b45f2a', '#7c3a14']);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 2;
  c.stroke();
  // dot painting
  const cols = ['#fde68a', '#fff7ed', '#f97316', '#fef3c7'];
  for (let i = 0; i < 26; i++) {
    const yy = y0 + 32 + i * 5.3;
    c.fillStyle = cols[i % 4];
    c.beginPath();
    c.arc(cx + Math.sin(i * 0.9) * 5, yy, 1.4, 0, TAU);
    c.fill();
  }
  // leather grip
  rr(c, cx - 9, y0 + 140, 18, 34, 4, '#3f2a1c', '#140a04', 1.5);
  c.strokeStyle = '#7c5a40';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 9, y0 + 144 + i * 5);
    c.lineTo(cx + 9, y0 + 147 + i * 5);
    c.stroke();
  }
  // hook
  c.beginPath();
  c.moveTo(cx - 3, y0 + 22);
  c.lineTo(cx, y0 + 12);
  c.lineTo(cx + 3, y0 + 22);
  c.fillStyle = '#e7e5e4';
  c.fill();
  if (ready) drawBoomerang(c, cx, y0 + 2, 1);
}

export function drawBoomerang(c: C, x: number, y: number, s: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(-18, 6, -30, 26);
  c.quadraticCurveTo(-26, 30, -21, 28);
  c.quadraticCurveTo(-12, 15, 0, 9);
  c.quadraticCurveTo(12, 15, 21, 28);
  c.quadraticCurveTo(26, 30, 30, 26);
  c.quadraticCurveTo(18, 6, 0, 0);
  c.closePath();
  c.fillStyle = lin(c, -30, 30, ['#7c3a14', '#e8a35a', '#b45f2a', '#7c3a14']);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 1.5;
  c.stroke();
  c.fillStyle = '#fff7ed';
  for (let i = 1; i < 6; i++) {
    c.beginPath();
    c.arc(-i * 4.6, 4 + i * 3.6, 1.1, 0, TAU);
    c.arc(i * 4.6, 4 + i * 3.6, 1.1, 0, TAU);
    c.fill();
  }
  c.restore();
}

// ------------------------------------------------------------- MERIAM BAMBU
export function bamboo(c: C, cx: number, y0: number, t: number) {
  // A real, hollow bamboo culm: warm green-gold fibres, swollen nodes,
  // rattan lashings and a burnt firing rim. The side wick supplies the bang.
  const pulse = 0.65 + 0.35 * Math.sin(t * 13);
  c.beginPath(); c.moveTo(cx - 15, y0 + 7);
  c.lineTo(cx + 15, y0 + 7); c.lineTo(cx + 21, y0 + 190);
  c.quadraticCurveTo(cx + 1, y0 + 206, cx - 20, y0 + 192);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 22,
    ['#284910', '#628c21', '#d5e875', '#83a33a', '#2f4c16']);
  c.fill(); c.strokeStyle = '#20370f'; c.lineWidth = 2.5; c.stroke();
  // Hard glossy enamel highlights and age marks follow the grain.
  c.strokeStyle = 'rgba(243,255,188,0.63)'; c.lineWidth = 2.3;
  c.beginPath(); c.moveTo(cx - 9, y0 + 12);
  c.quadraticCurveTo(cx - 14, y0 + 89, cx - 9, y0 + 182); c.stroke();
  c.strokeStyle = 'rgba(48,84,15,0.51)'; c.lineWidth = 1.1;
  for (const dx of [-13, -3, 6, 14]) {
    c.beginPath(); c.moveTo(cx + dx, y0 + 13);
    c.quadraticCurveTo(cx + dx + 2, y0 + 90, cx + dx + 2, y0 + 187); c.stroke();
  }
  for (const [i, by] of [41, 85, 130, 175].entries()) {
    const swell = i % 2 ? 2 : 0;
    rr(c, cx - 21 - swell, y0 + by - 4, 42 + swell * 2, 9, 4,
      lin(c, cx - 22, cx + 22, ['#41651a', '#dbec82', '#819d31', '#395813']), '#33521a', 1.4);
    c.fillStyle = 'rgba(251,255,193,0.6)';
    c.fillRect(cx - 16, y0 + by - 1, 25, 1.4);
    c.strokeStyle = 'rgba(43,63,17,0.45)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 18, y0 + by + 8);
    c.quadraticCurveTo(cx - 5, y0 + by + 5, cx + 16, y0 + by + 8); c.stroke();
  }
  // Two crossed rattan belts prevent the hollow cannon from splitting.
  for (const by of [66, 150]) {
    rr(c, cx - 23, y0 + by, 46, 15, 4,
      lin(c, cx - 23, cx + 23, ['#5f3516', '#c68e4d', '#eac184', '#7a481e']), '#41280f', 1.4);
    c.strokeStyle = '#5e371b'; c.lineWidth = 1.25;
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.moveTo(cx - 21 + i * 8, y0 + by + 2);
      c.lineTo(cx - 15 + i * 8, y0 + by + 13); c.stroke();
    }
    c.fillStyle = '#ffdd8f'; c.beginPath(); c.arc(cx + 18, y0 + by + 7, 2, 0, TAU); c.fill();
  }
  // Carved red/gold firecracker crest instead of a generic gun badge.
  c.fillStyle = '#a52b21'; c.beginPath(); c.roundRect(cx - 10, y0 + 102, 20, 24, 3); c.fill();
  c.strokeStyle = '#f7ce68'; c.lineWidth = 1.8; c.stroke();
  c.fillStyle = '#ffe7a2'; star(c, cx, y0 + 114, 7, '#ffe7a2', 8);
  rr(c, cx - 23, y0 + 189, 46, 10, 4,
    lin(c, cx - 23, cx + 23, ['#244415', '#99b947', '#456e1d']), '#1d3910', 1.5);
  // Charring is confined to the rim, never a black circle on the target.
  const rim = c.createLinearGradient(cx - 19, y0 - 2, cx + 19, y0 + 14);
  rim.addColorStop(0, '#2e4518'); rim.addColorStop(0.45, '#f3de8d');
  rim.addColorStop(0.77, '#557624'); rim.addColorStop(1, '#253716');
  c.fillStyle = rim; c.beginPath();
  c.moveTo(cx - 23, y0 - 1); c.lineTo(cx + 23, y0 - 1);
  c.lineTo(cx + 18, y0 + 16); c.lineTo(cx - 18, y0 + 16); c.closePath(); c.fill();
  c.strokeStyle = '#243616'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#261f12'; c.beginPath(); c.ellipse(cx, y0, 20, 5, 0, 0, TAU); c.fill();
  c.strokeStyle = '#f0df94'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(255,203,93,0.36)'; c.beginPath();
  c.ellipse(cx, y0 + 1, 11, 2.4, 0, 0, TAU); c.fill();
  // Red-white Festival ribbon tied around the centre binding.
  const sway = Math.sin(t * 3) * 3;
  c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(cx - 22, y0 + 69);
  c.quadraticCurveTo(cx - 34, y0 + 72 + sway, cx - 44, y0 + 68 + sway);
  c.lineTo(cx - 40, y0 + 78 + sway);
  c.quadraticCurveTo(cx - 31, y0 + 78 + sway, cx - 22, y0 + 76); c.fill();
  c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(cx - 22, y0 + 76);
  c.quadraticCurveTo(cx - 31, y0 + 78 + sway, cx - 40, y0 + 78 + sway);
  c.lineTo(cx - 37, y0 + 84 + sway);
  c.quadraticCurveTo(cx - 29, y0 + 83 + sway, cx - 22, y0 + 82); c.fill();
  // Side touchhole, fuse, and the separate glowing ignition stick.
  c.fillStyle = '#311d0a'; c.beginPath();
  c.ellipse(cx + 20, y0 + 168, 5, 4, 0, 0, TAU); c.fill();
  c.strokeStyle = '#c8ac79'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx + 21, y0 + 168);
  c.quadraticCurveTo(cx + 35, y0 + 163, cx + 40, y0 + 153); c.stroke();
  c.save(); c.translate(cx + 46, y0 + 172); c.rotate(-0.36);
  rr(c, -3, -58, 7, 72, 3, wood(c, -4, 4), '#603a19', 1);
  c.strokeStyle = '#ecd8b0'; c.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    c.beginPath(); c.moveTo(-3, -30 + i * 6); c.lineTo(4, -28 + i * 6); c.stroke();
  }
  c.fillStyle = '#3e3128'; c.fillRect(-4, -61, 9, 6);
  c.save(); c.shadowColor = '#ffac2b'; c.shadowBlur = 19;
  c.fillStyle = '#ff8c27'; c.beginPath();
  c.moveTo(-5, -60); c.quadraticCurveTo(-8, -72, Math.sin(t * 18) * 2, -84);
  c.quadraticCurveTo(9, -71, 5, -60); c.fill();
  c.fillStyle = '#fff7be'; c.beginPath(); c.ellipse(0, -65, 2.4, 6 * pulse, 0, 0, TAU); c.fill();
  c.restore(); c.restore();
  glow(c, cx + 20, y0 + 168, 2.5 * pulse, '#ffab46', 10);
}

// ------------------------------------------------------------- BANANA GUN
/** The peel opens at the shot, then folds shut by the next 0.2s shot/reload. */
export function bananaPeelOpen(sinceShot: number): number {
  if (sinceShot < 0 || sinceShot >= 0.2) return 0;
  return sinceShot < 0.065 ? sinceShot / 0.065 : (0.2 - sinceShot) / 0.135;
}

/** A shot empties the visible fruit; flesh grows back as the peel closes. */
export function bananaFleshFill(sinceShot: number): number {
  if (sinceShot < 0 || sinceShot >= 0.2) return 1;
  return Math.max(0, Math.min(1, (sinceShot - 0.06) / 0.14));
}

export function banana(c: C, cx: number, y0: number, t: number) {
  const open = bananaPeelOpen(gunState.sinceShot);
  const flesh = bananaFleshFill(gunState.sinceShot);
  // The curved fruit IS the launcher. No generic grip, barrel or googly eye.
  c.beginPath(); c.moveTo(cx - 4, y0 + 9);
  c.bezierCurveTo(cx - 26, y0 + 58, cx - 15, y0 + 123, cx + 32, y0 + 158);
  c.quadraticCurveTo(cx + 42, y0 + 161, cx + 42, y0 + 145);
  c.bezierCurveTo(cx + 11, y0 + 113, cx + 4, y0 + 64, cx + 9, y0 + 7);
  c.closePath();
  c.fillStyle = lin(c, cx - 26, cx + 40,
    ['#855017', '#e9ab18', '#fff094', '#ffcf27', '#c3830b']);
  c.fill(); c.strokeStyle = '#633b10'; c.lineWidth = 2.6; c.stroke();
  // Tapered chocolate-brown tip of a ripe banana.
  c.fillStyle = '#4b2d19'; c.beginPath();
  c.moveTo(cx + 32, y0 + 149); c.quadraticCurveTo(cx + 37, y0 + 160, cx + 42, y0 + 159);
  c.quadraticCurveTo(cx + 46, y0 + 160, cx + 45, y0 + 148); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,248,165,0.82)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx - 15, y0 + 43);
  c.bezierCurveTo(cx - 25, y0 + 112, cx + 10, y0 + 149, cx + 28, y0 + 152); c.stroke();
  c.strokeStyle = 'rgba(122,75,18,0.6)'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(cx + 5, y0 + 29);
  c.bezierCurveTo(cx - 3, y0 + 84, cx + 15, y0 + 129, cx + 36, y0 + 145); c.stroke();
  c.fillStyle = 'rgba(112,64,13,0.58)';
  for (const [x, y, r] of [[-16, 63, 2.2], [-11, 88, 1.5], [0, 116, 2], [17, 137, 1.8], [9, 51, 1.6]]) {
    c.beginPath(); c.ellipse(cx + x, y0 + y, r, r * 0.67, 0.35, 0, TAU); c.fill();
  }
  // Hollow interior of the peel (visible when open, Slide #7 Weapon #6)
  c.save();
  c.beginPath();
  c.moveTo(cx - 8, y0 + 8);
  c.quadraticCurveTo(cx - 12, y0 + 55, cx, y0 + 106);
  c.quadraticCurveTo(cx + 10, y0 + 55, cx + 6, y0 + 8);
  c.closePath();
  c.fillStyle = `rgba(84,54,16,${0.25 + 0.55 * open})`;
  c.fill();
  c.restore();

  // THE BANANA FLESH (Slide #7 Weapon #6) — cream colored, refills while the peel closes
  if (flesh > 0.02) {
    const fh = 10 * flesh;
    const topY = y0 + 6 + (1 - flesh) * 96;
    const midY = (topY + (y0 + 106)) * 0.5;
    c.save();
    c.beginPath();
    c.moveTo(cx - fh * 0.75, topY);
    c.quadraticCurveTo(cx - 4 - fh * 0.85, midY, cx - fh * 0.9, y0 + 106);
    c.lineTo(cx + fh * 0.9, y0 + 106);
    c.quadraticCurveTo(cx - 2 + fh * 0.85, midY, cx + fh * 0.75, topY);
    c.closePath();
    const fgrad = c.createLinearGradient(cx - fh, 0, cx + fh, 0);
    fgrad.addColorStop(0, '#f0e2ad');
    fgrad.addColorStop(0.45, '#fffdf2');
    fgrad.addColorStop(1, '#e6d7a2');
    c.fillStyle = fgrad;
    c.fill();
    c.strokeStyle = '#cdbd85';
    c.lineWidth = 1;
    c.stroke();

    // Longitudinal flesh ridges (Slide #7)
    c.strokeStyle = 'rgba(196,172,104,0.55)';
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(cx - fh * 0.36, topY + 4);
    c.quadraticCurveTo(cx - 3 - fh * 0.4, midY, cx - fh * 0.42, y0 + 100);
    c.moveTo(cx + fh * 0.36, topY + 4);
    c.quadraticCurveTo(cx - 1 + fh * 0.4, midY, cx + fh * 0.42, y0 + 100);
    c.stroke();

    // Tiny seed dots near the muzzle end (Slide #7)
    c.fillStyle = 'rgba(122,92,32,0.5)';
    for (const sx of [-0.35, 0, 0.35]) {
      c.beginPath();
      c.arc(cx + fh * sx, topY + 8, 1, 0, TAU);
      c.fill();
    }
    c.restore();
  }
  // Hinge the two peels at the neck: opening launches the flesh, closing
  // reloads it. The animation follows shot time, not the scene clock.
  for (const side of [-1, 1]) {
    c.save(); c.translate(cx + side * 8, y0 + 44); c.rotate(side * open * 0.82);
    c.beginPath(); c.moveTo(0, 33);
    c.bezierCurveTo(side * 11, 11, side * 11, -27, side * 4, -39);
    c.quadraticCurveTo(side * -4, -15, side * -5, 25); c.closePath();
    c.fillStyle = lin(c, -11, 11, side < 0
      ? ['#ad7419', '#facc15', '#ffeb69', '#e8ae20']
      : ['#e8ae20', '#fff29a', '#facc15', '#ad7419']);
    c.fill(); c.strokeStyle = '#8d6015'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(255,249,186,0.9)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(side * 2, 20);
    c.quadraticCurveTo(side * 7, -8, side * 3, -31); c.stroke();
    c.fillStyle = '#74471a'; c.beginPath(); c.ellipse(side * 4, -38, 2.2, 3, 0, 0, TAU); c.fill();
    c.restore();
  }
  // Small organic stem/nozzle, not a metal firing tube.
  c.fillStyle = '#5d4020'; c.beginPath(); c.roundRect(cx - 4, y0 - 7, 8, 12, 2); c.fill();
  c.fillStyle = '#fbefbf'; c.beginPath(); c.ellipse(cx, y0 + 1, 3.4, 2, 0, 0, TAU); c.fill();
  const glowY = y0 + 35 + (t * 3 % 1) * 37;
  c.fillStyle = `rgba(255,253,210,${0.4 + 0.2 * Math.sin(t * 6)})`;
  c.beginPath(); c.arc(cx - 1, glowY, 1.6, 0, TAU); c.fill();
}

// ------------------------------------------------------------- BUBBLE GUN
export function bubbleGun(c: C, cx: number, y0: number, t: number) {
  const kick = shotPulse(gunState.sinceShot, 0.25);
  const slosh = Math.sin(t * 3.4) * 2.2;

  const cyanBodyGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#075985', '#0284c7', '#38bdf8', '#bae6fd', '#0ea5e9', '#0369a1']);
  const pinkRingGrad = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#831843', '#db2777', '#f472b6', '#fbcfe8', '#ec4899', '#9d174d']);

  const drawSoapBubble = (bx: number, by: number, br: number, alpha = 0.85) => {
    c.save();
    c.globalAlpha = alpha;
    const bg = c.createRadialGradient(bx - br * 0.3, by - br * 0.3, br * 0.1, bx, by, br);
    bg.addColorStop(0, 'rgba(255,255,255,0.94)');
    bg.addColorStop(0.45, 'rgba(186,230,253,0.48)');
    bg.addColorStop(0.78, 'rgba(244,114,182,0.55)');
    bg.addColorStop(1, 'rgba(56,189,248,0.78)');
    c.fillStyle = bg;
    c.beginPath();
    c.arc(bx, by, br, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.9)';
    c.lineWidth = 0.75;
    c.stroke();
    // Specular highlight dot
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(bx - br * 0.34, by - br * 0.34, Math.max(0.7, br * 0.24), 0, TAU);
    c.fill();
    c.restore();
  };

  c.save();
  c.translate(0, kick * 3.5);

  // ══════════════════ 1. LOWER SKY-BLUE SHELL, DORSAL FIN, PINK POMMEL & PISTOL GRIP (`y0 + 92 .. y0 + 164`) ══════════════════
  // Cute sky-blue dorsal fin on left rear (`cx - 30 .. cx - 14, y0 + 102 .. y0 + 132`, matching BUBBLE GUN image!)
  c.beginPath();
  c.moveTo(cx - 15, y0 + 102);
  c.quadraticCurveTo(cx - 30, y0 + 108, cx - 29, y0 + 122);
  c.quadraticCurveTo(cx - 24, y0 + 129, cx - 15, y0 + 132);
  c.closePath();
  c.fillStyle = cyanBodyGrad(cx - 30, cx - 15);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.85)';
  c.lineWidth = 0.85;
  c.stroke();

  // Neon-pink trigger guard & trigger (`cx + 9 .. cx + 29, y0 + 94 .. y0 + 120`)
  c.beginPath();
  c.moveTo(cx + 11, y0 + 94);
  c.bezierCurveTo(cx + 28, y0 + 96, cx + 28, y0 + 116, cx + 14, y0 + 120);
  c.lineTo(cx + 10, y0 + 114);
  c.bezierCurveTo(cx + 21, y0 + 112, cx + 21, y0 + 100, cx + 10, y0 + 99);
  c.closePath();
  c.fillStyle = pinkRingGrad(cx + 10, cx + 28);
  c.fill();
  c.strokeStyle = 'rgba(131,24,67,0.85)';
  c.lineWidth = 0.82;
  c.stroke();

  // Contoured sky-blue pistol grip angling out to `+x, +y` (`cx + 3 .. cx + 38, y0 + 108 .. y0 + 158`, matching BUBBLE GUN image!)
  c.beginPath();
  c.moveTo(cx + 3, y0 + 114);
  c.lineTo(cx + 18, y0 + 106);
  c.bezierCurveTo(cx + 27, y0 + 118, cx + 35, y0 + 132, cx + 38, y0 + 144);
  c.quadraticCurveTo(cx + 38, y0 + 154, cx + 28, y0 + 156);
  c.lineTo(cx + 18, y0 + 156);
  c.quadraticCurveTo(cx + 12, y0 + 152, cx + 10, y0 + 142);
  c.bezierCurveTo(cx + 8, y0 + 132, cx + 5, y0 + 122, cx + 3, y0 + 114);
  c.closePath();
  c.fillStyle = cyanBodyGrad(cx + 3, cx + 38);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.88)';
  c.lineWidth = 0.9;
  c.stroke();
  // Molded cyan grip ribs
  c.strokeStyle = 'rgba(186,230,253,0.6)';
  c.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.moveTo(cx + 11 + i * 4, y0 + 122 + i * 7);
    c.lineTo(cx + 22 + i * 4, y0 + 118 + i * 7);
    c.stroke();
  }

  // Neon-pink rear pommel cap at bottom of lower chamber (`cx - 13 .. cx + 9, y0 + 144 .. y0 + 158`)
  c.beginPath();
  c.roundRect(cx - 13, y0 + 143, 21, 13, [3, 3, 7, 7]);
  c.fillStyle = pinkRingGrad(cx - 13, cx + 8);
  c.fill();
  c.strokeStyle = 'rgba(131,24,67,0.86)';
  c.lineWidth = 0.84;
  c.stroke();

  // Lower sky-blue chamber housing (`cx - 18 .. cx + 14, y0 + 94 .. y0 + 148`)
  c.beginPath();
  c.roundRect(cx - 18, y0 + 94, 32, 54, [6, 6, 9, 9]);
  c.fillStyle = cyanBodyGrad(cx - 18, cx + 14);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.88)';
  c.lineWidth = 0.9;
  c.stroke();

  // Translucent cyan lower bubble window inside the lower housing (`cx - 13 .. cx + 9, y0 + 100 .. y0 + 139`)
  c.save();
  c.beginPath();
  c.roundRect(cx - 13, y0 + 100, 22, 39, 7.5);
  c.fillStyle = 'rgba(224,242,254,0.52)';
  c.fill();
  c.clip();
  for (let i = 0; i < 5; i++) {
    const by = y0 + 135 - ((t * 18 + i * 7.5) % 34);
    const bx = cx - 7 + (i % 3) * 5.2 + Math.sin(t * 3 + i) * 1.2;
    drawSoapBubble(bx, by, 2.3 + (i % 2) * 0.9, 0.85);
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 13, y0 + 100, 22, 39, 7.5);
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.lineWidth = 0.8;
  c.stroke();

  // ══════════════════ 2. LARGE ROUND TRANSPARENT GLASS BUBBLE GLOBE WITH HORIZONTAL PINK LIQUID (`cx - 24 .. cx + 24, y0 + 42 .. y0 + 98`) ══════════════════
  // Neon-pink base collar ring under the glass dome (`cx - 19 .. cx + 19, y0 + 90 .. y0 + 99`)
  c.beginPath();
  c.roundRect(cx - 19, y0 + 90, 38, 9, 4.5);
  c.fillStyle = pinkRingGrad(cx - 19, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(131,24,67,0.88)';
  c.lineWidth = 0.86;
  c.stroke();

  // Plump spherical transparent glass globe (`cx, y0 + 68`, rx = 23.5, ry = 24.5)
  c.save();
  c.beginPath();
  c.ellipse(cx, y0 + 68, 23.5, 24.5, 0, 0, TAU);
  const glassG = c.createRadialGradient(cx - 7, y0 + 56, 3, cx, y0 + 68, 25);
  glassG.addColorStop(0, 'rgba(240,249,255,0.58)');
  glassG.addColorStop(0.55, 'rgba(186,230,253,0.32)');
  glassG.addColorStop(1, 'rgba(56,189,248,0.48)');
  c.fillStyle = glassG;
  c.fill();
  c.clip();

  // Glowing neon pink-magenta bubble liquid rotated by `-0.62 rad` so it sits horizontally in the 45° card (matching BUBBLE GUN image!)
  c.save();
  c.translate(cx, y0 + 68);
  c.rotate(-0.62);
  const liqY = 2 + slosh * 0.45;
  c.beginPath();
  c.moveTo(-28, liqY);
  c.bezierCurveTo(-10, liqY + slosh, 10, liqY - slosh, 28, liqY);
  c.lineTo(28, 30);
  c.lineTo(-28, 30);
  c.closePath();
  const liqG = c.createLinearGradient(0, liqY, 0, 26);
  liqG.addColorStop(0, '#fbcfe8');
  liqG.addColorStop(0.22, '#f472b6');
  liqG.addColorStop(0.65, '#ec4899');
  liqG.addColorStop(1, '#be185d');
  c.fillStyle = liqG;
  c.fill();

  // Bright glossy pink liquid surface meniscus ellipse
  c.beginPath();
  c.ellipse(0, liqY, 22.5, 4.4, 0, 0, TAU);
  c.fillStyle = 'rgba(253,242,248,0.82)';
  c.fill();
  c.restore();

  // Floating iridescent soap bubbles inside the glass dome (matching BUBBLE GUN image!)
  const domeBubbles: [number, number, number][] = [
    [-9, 61, 4.4], [8, 58, 3.6], [-1, 50, 3.0], [10, 71, 2.7], [-11, 75, 2.5], [2, 80, 3.2],
  ];
  for (let i = 0; i < domeBubbles.length; i++) {
    const [ox, oy, br] = domeBubbles[i];
    const floatY = y0 + oy + Math.sin(t * 3.2 + i * 1.3) * 2.2;
    const floatX = cx + ox + Math.cos(t * 2.5 + i) * 1.2;
    drawSoapBubble(floatX, floatY, br, 0.92);
  }
  c.restore();

  // Crisp outer glass dome outline & curved white specular highlight
  c.beginPath();
  c.ellipse(cx, y0 + 68, 23.5, 24.5, 0, 0, TAU);
  c.strokeStyle = 'rgba(12,74,110,0.86)';
  c.lineWidth = 0.9;
  c.stroke();

  c.strokeStyle = 'rgba(255,255,255,0.86)';
  c.lineWidth = 2.4;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(cx, y0 + 68, 19.5, Math.PI * 0.82, Math.PI * 1.3);
  c.stroke();

  // ══════════════════ 3. TURQUOISE UPPER COLLAR, PINK NECK & WIDE FLARED NEON-PINK RING MUZZLE (`y0 - 3 .. y0 + 46`) ══════════════════
  // Turquoise-cyan upper dome cap (`cx - 17 .. cx + 17, y0 + 32 .. y0 + 46`)
  c.beginPath();
  c.moveTo(cx - 17, y0 + 45);
  c.quadraticCurveTo(cx - 16, y0 + 32, cx, y0 + 32);
  c.quadraticCurveTo(cx + 16, y0 + 32, cx + 17, y0 + 45);
  c.closePath();
  c.fillStyle = cyanBodyGrad(cx - 17, cx + 17);
  c.fill();
  c.strokeStyle = 'rgba(12,74,110,0.88)';
  c.lineWidth = 0.88;
  c.stroke();

  // Glowing pink accent button on right side of turquoise collar (`cx + 8.5, y0 + 39`)
  c.beginPath();
  c.arc(cx + 8.5, y0 + 39, 3.4, 0, TAU);
  c.fillStyle = radial(c, cx + 7.5, y0 + 38, 3.8, ['#fce7f3', '#f472b6', '#be185d']);
  c.fill();

  // Tapered neon-pink emitter neck (`cx - 8.5 .. cx + 8.5, y0 + 13 .. y0 + 33`)
  c.beginPath();
  c.moveTo(cx - 8.5, y0 + 33);
  c.lineTo(cx - 6, y0 + 13);
  c.lineTo(cx + 6, y0 + 13);
  c.lineTo(cx + 8.5, y0 + 33);
  c.closePath();
  c.fillStyle = pinkRingGrad(cx - 8.5, cx + 8.5);
  c.fill();
  c.strokeStyle = 'rgba(131,24,67,0.88)';
  c.lineWidth = 0.86;
  c.stroke();

  // Wide flared 3D neon-pink megaphone ring muzzle (`cx - 22 .. cx + 22, y0 - 3 .. y0 + 16`, matching BUBBLE GUN image!)
  c.beginPath();
  c.ellipse(cx, y0 + 6.5, 21.5, 9.5, 0, 0, TAU);
  c.fillStyle = pinkRingGrad(cx - 21.5, cx + 21.5);
  c.fill();
  c.strokeStyle = 'rgba(131,24,67,0.9)';
  c.lineWidth = 0.92;
  c.stroke();

  // Glowing sky-blue / iridescent inner bubble-wand aperture inside the pink ring
  c.beginPath();
  c.ellipse(cx, y0 + 5.8, 13.5, 5.2, 0, 0, TAU);
  c.fillStyle = radial(c, cx - 2, y0 + 5, 14, ['#ffffff', '#bae6fd', '#38bdf8', '#0284c7']);
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.88)';
  c.lineWidth = 0.82;
  c.stroke();

  // Glossy white rim highlight on the pink muzzle ring
  c.strokeStyle = 'rgba(255,255,255,0.82)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(cx, y0 + 6.5, 18.5, 7.2, 0, Math.PI * 1.08, Math.PI * 1.78);
  c.stroke();

  // Ambient floating soap bubbles drifting around the Bubble Gun (matching BUBBLE GUN image!)
  drawSoapBubble(cx - 22, y0 + 26 + Math.sin(t * 3) * 2, 3.4, 0.88);
  drawSoapBubble(cx + 23, y0 + 20 + Math.cos(t * 2.7) * 2, 2.8, 0.85);
  drawSoapBubble(cx + 20, y0 + 50 + Math.sin(t * 3.5 + 1) * 2, 2.4, 0.8);

  c.restore();
}

// ------------------------------------------------------------- HARPOON
export function harpoon(c: C, cx: number, y0: number, ready: boolean) {
  // stock/rail
  rr(c, cx - 8, y0 + 22, 16, 236, [3, 3, 8, 8], lin(c, cx - 8, cx + 8, ['#3b1d0a', '#9a5b2c', '#5a2d0c']), '#1c0a00');
  rr(c, cx - 3, y0 + 22, 6, 236, 2, 'rgba(0,0,0,0.3)');
  // muzzle head
  rr(c, cx - 14, y0 + 14, 28, 14, 4, '#111827', '#000', 1);
  // grip
  c.beginPath();
  c.moveTo(cx + 8, y0 + 186);
  c.lineTo(cx + 42, y0 + 214);
  c.lineTo(cx + 32, y0 + 226);
  c.lineTo(cx + 8, y0 + 206);
  c.closePath();
  c.fillStyle = '#111827';
  c.fill();
  guard(c, cx - 8, y0 + 190, '#000', 11);
  // reel
  c.beginPath();
  c.arc(cx - 14, y0 + 210, 12, 0, TAU);
  c.fillStyle = '#0e7490';
  c.fill();
  c.strokeStyle = '#083344';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(cx - 14, y0 + 210, 7, 0, TAU);
  c.strokeStyle = '#facc15';
  c.lineWidth = 3;
  c.stroke();
  // bands
  c.strokeStyle = '#1f2937';
  c.lineWidth = 5;
  c.lineCap = 'round';
  const ny = ready ? y0 + 120 : y0 + 30;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 13, y0 + 20);
    c.lineTo(cx + s * 4, ny);
    c.stroke();
  }
  // spear
  if (ready) {
    c.fillStyle = chrome(c, cx - 1.5, cx + 1.5);
    c.fillRect(cx - 1.5, y0 + 6, 3, 240);
    c.beginPath();
    c.moveTo(cx, y0 - 8);
    c.lineTo(cx + 4.5, y0 + 6);
    c.lineTo(cx - 4.5, y0 + 6);
    c.closePath();
    c.fillStyle = '#e5e7eb';
    c.fill();
    // barbs
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(cx + 1, y0 + 8);
    c.lineTo(cx + 6, y0 + 16);
    c.moveTo(cx - 1, y0 + 8);
    c.lineTo(cx - 6, y0 + 16);
    c.stroke();
  }
  // line
  c.strokeStyle = '#fef3c7';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 198);
  c.quadraticCurveTo(cx - 22, y0 + 150, cx - 2, y0 + 240);
  c.stroke();
}

// ------------------------------------------------------------- RUBBER CHICKEN
export function chickenGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const shot = gunState.sinceShot;
  const squish = shot >= 0 && shot < 0.24 ? Math.sin((Math.PI * shot) / 0.24) * 0.14 : 0;

  const redGrip = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#7f1d1d', '#dc2626', '#ef4444', '#fca5a5', '#b91c1c', '#450a0a']);
  const yellowGold = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#92400e', '#eab308', '#facc15', '#fef9c3', '#ca8a04']);
  const rubberYellow = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#a16207', '#eab308', '#facc15', '#fef08a', '#ca8a04']);

  // ══════════════════ 1. ERGONOMIC BRIGHT-RED PISTOL GRIP WITH YELLOW COLLAR, SIDE BADGE, TRIGGER & POMMEL (matching RUBBER CHICKEN image!) ══════════════════
  // Golden-Yellow Trigger Guard & Curved Yellow Trigger on right (`+x`, `cx + 8 .. cx + 23, y0 + 122 .. y0 + 150`)
  c.beginPath();
  c.moveTo(cx + 9, y0 + 122);
  c.bezierCurveTo(cx + 23, y0 + 124, cx + 24, y0 + 145, cx + 11, y0 + 149);
  c.lineTo(cx + 8, y0 + 144);
  c.bezierCurveTo(cx + 18, y0 + 141, cx + 18, y0 + 129, cx + 8, y0 + 127);
  c.closePath();
  c.fillStyle = yellowGold(cx + 8, cx + 24);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.82)';
  c.lineWidth = 0.82;
  c.stroke();

  // Yellow trigger blade inside guard
  c.beginPath();
  c.moveTo(cx + 10, y0 + 128);
  c.quadraticCurveTo(cx + 17, y0 + 134, cx + 13, y0 + 142);
  c.lineTo(cx + 9, y0 + 140);
  c.closePath();
  c.fillStyle = yellowGold(cx + 9, cx + 17);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.78)';
  c.lineWidth = 0.72;
  c.stroke();

  // Ribbed Golden-Yellow Side Badge on upper-left (`-x`, `cx - 15 .. cx - 9, y0 + 123 .. y0 + 141`)
  c.beginPath();
  c.roundRect(cx - 15, y0 + 123, 6.5, 18, 2);
  c.fillStyle = yellowGold(cx - 15, cx - 8.5);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.82)';
  c.lineWidth = 0.78;
  c.stroke();
  for (let i = 0; i < 3; i++) {
    c.strokeStyle = 'rgba(113,63,18,0.65)';
    c.lineWidth = 0.85;
    c.beginPath();
    c.moveTo(cx - 14, y0 + 127.5 + i * 4.5);
    c.lineTo(cx - 9.5, y0 + 127.5 + i * 4.5);
    c.stroke();
  }

  // Main Sculpted Bright-Red Pistol Grip Frame (`cx - 13 .. cx + 13, y0 + 115 .. y0 + 184`)
  c.beginPath();
  c.moveTo(cx - 11.5, y0 + 115);
  c.lineTo(cx + 11.5, y0 + 115);
  c.lineTo(cx + 13, y0 + 127);
  c.quadraticCurveTo(cx + 8, y0 + 136, cx + 9.5, y0 + 148);
  c.lineTo(cx + 11, y0 + 183);
  c.lineTo(cx - 13.5, y0 + 183);
  c.lineTo(cx - 11.5, y0 + 144);
  c.lineTo(cx - 11.5, y0 + 115);
  c.closePath();
  c.fillStyle = redGrip(cx - 13.5, cx + 13);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.85)';
  c.lineWidth = 0.9;
  c.stroke();

  // Dark-red stippled/checkered grip texture panel on lower handle (`y0 + 146 .. y0 + 178`)
  c.beginPath();
  c.roundRect(cx - 9.5, y0 + 146, 16, 31, 3.5);
  c.fillStyle = '#991b1b';
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.72)';
  c.lineWidth = 0.75;
  c.stroke();
  c.strokeStyle = 'rgba(254,202,202,0.28)';
  c.lineWidth = 0.68;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 7.5, y0 + 150 + i * 4.6);
    c.lineTo(cx + 4.5, y0 + 152 + i * 4.6);
    c.stroke();
  }

  // Brass screw pin on upper-right of red receiver
  c.fillStyle = '#fde047';
  c.beginPath();
  c.arc(cx + 8.5, y0 + 123, 1.8, 0, TAU);
  c.fill();
  c.strokeStyle = '#713f12';
  c.lineWidth = 0.65;
  c.stroke();

  // Golden-Yellow Flanged Base Cap at bottom of grip (`y0 + 181 .. y0 + 189`)
  c.beginPath();
  c.roundRect(cx - 15, y0 + 181, 27.5, 7.5, 2.8);
  c.fillStyle = yellowGold(cx - 15, cx + 12.5);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.84)';
  c.lineWidth = 0.85;
  c.stroke();

  // Ribbed Golden-Yellow Adapter Collar at top of red receiver (`y0 + 105 .. y0 + 117`)
  c.beginPath();
  c.roundRect(cx - 12.5, y0 + 105, 25, 11.5, 3);
  c.fillStyle = yellowGold(cx - 12.5, cx + 12.5);
  c.fill();
  c.strokeStyle = 'rgba(113,63,18,0.84)';
  c.lineWidth = 0.85;
  c.stroke();
  c.strokeStyle = 'rgba(113,63,18,0.6)';
  c.lineWidth = 0.9;
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(cx + i * 3.1, y0 + 106.5);
    c.lineTo(cx + i * 3.1, y0 + 115);
    c.stroke();
  }

  // ══════════════════ 2. ELONGATED YELLOW RUBBER CHICKEN BODY, WINGS, NECK & SCREAMING HEAD (matching RUBBER CHICKEN image!) ══════════════════
  c.save();
  c.translate(cx, y0 + 56 + Math.sin(t * 5.5) * 0.8);
  c.scale(1 + squish * 0.7, 1 - squish * 0.5);

  // Plump Sculpted Yellow Rubber Chicken Torso (`y = -8 .. +50`)
  c.beginPath();
  c.moveTo(-5.5, -10);
  c.bezierCurveTo(-15, -2, -16, 28, -9.5, 50);
  c.lineTo(9.5, 50);
  c.bezierCurveTo(16, 28, 15, -2, 5.5, -10);
  c.closePath();
  c.fillStyle = rubberYellow(-15, 15);
  c.fill();
  c.strokeStyle = 'rgba(120,53,15,0.82)';
  c.lineWidth = 0.88;
  c.stroke();

  // Folded Rubber Chicken Wings on Left & Right Sides (`y = 0 .. +38`)
  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.moveTo(sDir * 9, 0);
    c.bezierCurveTo(sDir * 17.5, 6, sDir * 17, 28, sDir * 10.5, 39);
    c.quadraticCurveTo(sDir * 7, 34, sDir * 6.5, 18);
    c.closePath();
    c.fillStyle = sDir < 0 ? '#fde047' : '#eab308';
    c.fill();
    c.strokeStyle = 'rgba(120,53,15,0.78)';
    c.lineWidth = 0.82;
    c.stroke();

    // Wing feather crease lines
    c.strokeStyle = 'rgba(161,98,7,0.6)';
    c.lineWidth = 0.8;
    for (let i = 0; i < 2; i++) {
      c.beginPath();
      c.moveTo(sDir * 8.5, 12 + i * 9);
      c.quadraticCurveTo(sDir * 13, 16 + i * 9, sDir * 11.5, 25 + i * 8);
      c.stroke();
    }
  }

  // Glossy breastbone specular highlight down the middle of the rubber chicken torso
  c.fillStyle = 'rgba(254,249,195,0.68)';
  c.beginPath();
  c.ellipse(-2.5, 18, 4.2, 19, -0.06, 0, TAU);
  c.fill();

  // Slender Yellow Rubber Chicken Neck (`y = -32 .. -8`)
  c.beginPath();
  c.moveTo(-5.2, -32);
  c.lineTo(5.2, -32);
  c.lineTo(6.2, -8);
  c.lineTo(-6.2, -8);
  c.closePath();
  c.fillStyle = rubberYellow(-6, 6);
  c.fill();
  c.strokeStyle = 'rgba(120,53,15,0.8)';
  c.lineWidth = 0.82;
  c.stroke();

  // Bright Red Collar Ring around the neck (`y = -24 .. -19`, matching RUBBER CHICKEN image!)
  c.beginPath();
  c.roundRect(-6.8, -24.5, 13.6, 5.2, 2.4);
  c.fillStyle = redGrip(-6.8, 6.8);
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.82)';
  c.lineWidth = 0.78;
  c.stroke();

  // Bright Red 3-Lobed Comb on Top of the Head (`y = -61 .. -49`, matching RUBBER CHICKEN image!)
  c.fillStyle = '#dc2626';
  c.strokeStyle = 'rgba(69,10,10,0.82)';
  c.lineWidth = 0.8;
  for (const [cxOff, cyOff, cr] of [
    [-4.2, -53, 3.8],
    [0, -56.5, 4.6],
    [4.2, -53, 3.8],
  ] as [number, number, number][]) {
    c.beginPath();
    c.arc(cxOff, cyOff, cr, 0, TAU);
    c.fill();
    c.stroke();
  }

  // Screaming Yellow Rubber Chicken Head (`y = -53 .. -30`)
  c.beginPath();
  c.ellipse(0, -41.5, 10.2, 11.5, 0, 0, TAU);
  c.fillStyle = radial(c, -3, -45, 14, ['#fef9c3', '#facc15', '#eab308', '#ca8a04']);
  c.fill();
  c.strokeStyle = 'rgba(120,53,15,0.84)';
  c.lineWidth = 0.88;
  c.stroke();

  // Two Big Bulging White Googly Eyes (`x = -5.8` and `+5.8, y = -44.5`, matching RUBBER CHICKEN image!)
  for (const sDir of [-1, 1]) {
    c.beginPath();
    c.arc(sDir * 5.6, -44.5, 4.1, 0, TAU);
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = 'rgba(69,26,3,0.8)';
    c.lineWidth = 0.78;
    c.stroke();

    c.beginPath();
    c.arc(sDir * 5.2, -44.5, 1.85, 0, TAU);
    c.fillStyle = '#0f172a';
    c.fill();

    c.beginPath();
    c.arc(sDir * 4.6, -45.3, 0.75, 0, TAU);
    c.fillStyle = '#ffffff';
    c.fill();
  }

  // Red Wattle under the screaming beak (`y = -32 .. -27`)
  c.beginPath();
  c.ellipse(0, -29.5, 3.6, 3.2, 0, 0, TAU);
  c.fillStyle = '#dc2626';
  c.fill();
  c.strokeStyle = 'rgba(69,10,10,0.78)';
  c.lineWidth = 0.72;
  c.stroke();

  // Wide-Open Screaming Orange-Red O-Beak (`y = -40 .. -30`, matching RUBBER CHICKEN image!)
  c.beginPath();
  c.ellipse(0, -35.2, 5.6, 5.2, 0, 0, TAU);
  c.fillStyle = lin(c, -5.6, 5.6, ['#c2410c', '#f97316', '#fde047', '#ea580c']);
  c.fill();
  c.strokeStyle = 'rgba(90,30,8,0.84)';
  c.lineWidth = 0.82;
  c.stroke();

  // Deep dark-red screaming mouth throat inside the O-beak
  c.beginPath();
  c.ellipse(0, -35.0, 3.4, 3.3, 0, 0, TAU);
  c.fillStyle = '#450a0a';
  c.fill();
  c.beginPath();
  c.ellipse(0, -33.6, 2.2, 1.3, 0, 0, TAU);
  c.fillStyle = '#ef4444';
  c.fill();

  c.restore();
  if (!ready || shot < 0.18) glow(c, cx, y0 - 4, 2.5, '#fef08a', 8);
}

// ------------------------------------------------------------- CONFETTI CANNON
export function confettiGun(c: C, cx: number, y0: number, t: number) {
  const kick = shotPulse(gunState.sinceShot, 0.32);

  c.save();
  c.translate(0, kick * 4.5);

  const goldCollar = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#713f12', '#ca8a04', '#facc15', '#fef9c3', '#eab308', '#854d0e']);

  // ══════════════════ 1. SLEEK DARK-SLATE PISTOL GRIP & CURVED GOLDEN LEVER (matching CONFETTI CANNON image!) ══════════════════
  // Contoured dark charcoal/slate pistol grip (`cx - 11 .. cx + 18, y0 + 128 .. y0 + 174`)
  c.beginPath();
  c.moveTo(cx - 10, y0 + 128);
  c.lineTo(cx + 10, y0 + 128);
  c.bezierCurveTo(cx + 15, y0 + 142, cx + 18, y0 + 156, cx + 15, y0 + 169);
  c.quadraticCurveTo(cx + 12, y0 + 175, cx + 4, y0 + 174);
  c.lineTo(cx - 7, y0 + 171);
  c.quadraticCurveTo(cx - 12, y0 + 168, cx - 11, y0 + 158);
  c.bezierCurveTo(cx - 10, y0 + 146, cx - 10, y0 + 136, cx - 10, y0 + 128);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 18, ['#090d16', '#1e293b', '#475569', '#94a3b8', '#1e293b', '#090d16']);
  c.fill();
  c.strokeStyle = 'rgba(9,13,22,0.86)';
  c.lineWidth = 0.9;
  c.stroke();

  // Beveled silver-slate edge highlight along the grip
  c.strokeStyle = 'rgba(203,213,225,0.48)';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx - 8, y0 + 132);
  c.quadraticCurveTo(cx - 8.5, y0 + 152, cx - 7, y0 + 167);
  c.stroke();

  // Curved Golden Pull-Trigger / Horn on the left (`-x`, `cx - 25 .. cx - 11, y0 + 120 .. y0 + 136`, matching CONFETTI CANNON image!)
  c.beginPath();
  c.moveTo(cx - 12, y0 + 122);
  c.quadraticCurveTo(cx - 23, y0 + 123, cx - 25, y0 + 134);
  c.quadraticCurveTo(cx - 21, y0 + 136, cx - 18, y0 + 130);
  c.quadraticCurveTo(cx - 15, y0 + 127, cx - 11, y0 + 128);
  c.closePath();
  c.fillStyle = goldCollar(cx - 25, cx - 11);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.82)';
  c.lineWidth = 0.8;
  c.stroke();

  // ══════════════════ 2. FLARED DIAGONAL-STRIPED PARTY POPPER CONE (y0 + 14 .. y0 + 124, matching CONFETTI CANNON image!) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 25.5, y0 + 14);
  c.lineTo(cx + 25.5, y0 + 14);
  c.lineTo(cx + 11.5, y0 + 124);
  c.lineTo(cx - 11.5, y0 + 124);
  c.closePath();
  c.clip();

  // Vibrant diagonal spiral bands: Hot Pink, Purple, Cyan, Gold-Yellow, Royal Blue
  const stripeCols = ['#ec4899', '#7e22ce', '#06b6d4', '#eab308', '#2563eb', '#f43f5e'];
  for (let i = -3; i < 14; i++) {
    const sy = y0 + i * 11;
    c.fillStyle = stripeCols[((i % stripeCols.length) + stripeCols.length) % stripeCols.length];
    c.beginPath();
    c.moveTo(cx - 28, sy);
    c.lineTo(cx + 28, sy - 16);
    c.lineTo(cx + 28, sy - 4);
    c.lineTo(cx - 28, sy + 12);
    c.closePath();
    c.fill();
  }

  // 3D cylindrical shading & glossy specular highlight strip along the cone
  const cylG = c.createLinearGradient(cx - 25, y0, cx + 25, y0);
  cylG.addColorStop(0, 'rgba(15,6,34,0.46)');
  cylG.addColorStop(0.24, 'rgba(255,255,255,0.42)');
  cylG.addColorStop(0.45, 'rgba(255,255,255,0.08)');
  cylG.addColorStop(0.82, 'rgba(15,6,34,0.28)');
  cylG.addColorStop(1, 'rgba(15,6,34,0.58)');
  c.fillStyle = cylG;
  c.fillRect(cx - 26, y0 + 12, 52, 114);
  c.restore();

  // Crisp outer contour of the flared cone
  c.beginPath();
  c.moveTo(cx - 25.5, y0 + 14);
  c.lineTo(cx + 25.5, y0 + 14);
  c.lineTo(cx + 11.5, y0 + 124);
  c.lineTo(cx - 11.5, y0 + 124);
  c.closePath();
  c.strokeStyle = 'rgba(46,16,101,0.85)';
  c.lineWidth = 0.92;
  c.stroke();

  // ══════════════════ 3. THICK 3D POLISHED GOLD BASE COLLAR & WIDE GOLD MUZZLE RIM (matching CONFETTI CANNON image!) ══════════════════
  // Thick 3D Golden Base Collar (`y0 + 118 .. y0 + 131`)
  c.beginPath();
  c.roundRect(cx - 14.5, y0 + 118, 29, 12.5, 4.5);
  c.fillStyle = goldCollar(cx - 14.5, cx + 14.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.85)';
  c.lineWidth = 0.88;
  c.stroke();
  c.strokeStyle = 'rgba(113,63,18,0.65)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - 13, y0 + 124.2);
  c.lineTo(cx + 13, y0 + 124.2);
  c.stroke();

  // Wide 3D Golden Muzzle Torus Rim (`cx - 28.5 .. cx + 28.5, y0 + 7 .. y0 + 20`)
  c.beginPath();
  c.ellipse(cx, y0 + 13.5, 28.5, 7.2, 0, 0, TAU);
  c.fillStyle = goldCollar(cx - 28.5, cx + 28.5);
  c.fill();
  c.strokeStyle = 'rgba(84,40,8,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // Deep dark-violet/gold interior mouth bore
  c.beginPath();
  c.ellipse(cx, y0 + 12.8, 22.5, 4.6, 0, 0, TAU);
  c.fillStyle = lin(c, cx - 22.5, cx + 22.5, ['#1e1b4b', '#4c1d95', '#713f12', '#1e1b4b']);
  c.fill();
  c.strokeStyle = 'rgba(254,240,138,0.75)';
  c.lineWidth = 0.8;
  c.stroke();

  // ══════════════════ 4. BURST OF 3D GLOWING STARS & CONFETTI ERUPTING FROM MUZZLE (matching CONFETTI CANNON image!) ══════════════════
  const starSpecs: [number, number, number, string][] = [
    [-14, 4, 4.8, '#fde047'],
    [-4, -2, 6.2, '#facc15'],
    [9, 3, 5.4, '#f43f5e'],
    [18, -3, 4.6, '#38bdf8'],
    [-19, -7, 4.2, '#38bdf8'],
    [3, -12, 4.5, '#ec4899'],
    [-9, -14, 3.8, '#a855f7'],
    [14, -13, 3.6, '#fde047'],
  ];
  for (let i = 0; i < starSpecs.length; i++) {
    const [sx, sy, sr, scol] = starSpecs[i];
    const bob = Math.sin(t * 5 + i * 0.9) * 1.6;
    c.save();
    c.shadowColor = scol;
    c.shadowBlur = 5;
    star(c, cx + sx, y0 + sy + bob, sr, scol);
    c.restore();
  }

  // Tiny glowing round confetti dots around the stars
  const dotSpecs: [number, number, string][] = [
    [-22, 1, '#f43f5e'],
    [-11, -7, '#fde047'],
    [0, 5, '#38bdf8'],
    [12, -6, '#a855f7'],
    [22, 4, '#fde047'],
    [-4, -18, '#38bdf8'],
  ];
  for (const [dx, dy, dcol] of dotSpecs) {
    c.fillStyle = dcol;
    c.beginPath();
    c.arc(cx + dx, y0 + dy + Math.cos(t * 6 + dx) * 1.2, 1.8, 0, TAU);
    c.fill();
  }

  c.restore();
}

// ------------------------------------------------------------- SEED GUN
export function seedGun(c: C, cx: number, y0: number, t: number) {
  const kick = shotPulse(gunState.sinceShot, 0.32);

  c.save();
  c.translate(0, kick * 4.5);

  const woodGrip = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#2d1507', '#78350f', '#b45309', '#d97706', '#7c2d12', '#291205']);
  const bronzeGold = (x0: number, x1: number) =>
    lin(c, x0, x1, ['#451a03', '#a16207', '#eab308', '#fef08a', '#ca8a04', '#713f12']);

  // Helper to draw a 3D veined glowing lime-green leaf (matching SEED GUN image!)
  const drawLeaf = (lx: number, ly: number, rot: number, sc: number) => {
    c.save();
    c.translate(lx, ly);
    c.rotate(rot);
    c.scale(sc, sc);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(-5.5, -3.5, -5.5, -10.5, 0, -14);
    c.bezierCurveTo(5.5, -10.5, 5.5, -3.5, 0, 0);
    c.closePath();
    const lg = c.createLinearGradient(-5, -14, 5, 0);
    lg.addColorStop(0, '#bef264');
    lg.addColorStop(0.5, '#4ade80');
    lg.addColorStop(1, '#15803d');
    c.fillStyle = lg;
    c.fill();
    c.strokeStyle = 'rgba(5,46,22,0.82)';
    c.lineWidth = 0.8;
    c.stroke();
    // Central leaf vein
    c.strokeStyle = 'rgba(236,252,203,0.8)';
    c.lineWidth = 0.75;
    c.beginPath();
    c.moveTo(0, -1);
    c.lineTo(0, -12);
    c.stroke();
    c.restore();
  };

  // ══════════════════ 1. CARVED WOODEN PISTOL GRIP & CURLING VINE LOOP (y0 + 106 .. y0 + 178, matching SEED GUN image!) ══════════════════
  // Curling woody vine tendril loop on the upper-left (`-x`) of the wooden grip (`cx - 24 .. cx - 9, y0 + 104 .. y0 + 132`)
  c.save();
  c.lineCap = 'round';
  c.strokeStyle = '#3b1504';
  c.lineWidth = 5.4;
  c.beginPath();
  c.moveTo(cx - 11, y0 + 108);
  c.bezierCurveTo(cx - 25, y0 + 108, cx - 26, y0 + 128, cx - 12, y0 + 130);
  c.stroke();
  c.strokeStyle = '#b45309';
  c.lineWidth = 3.6;
  c.stroke();
  c.strokeStyle = '#fde68a';
  c.lineWidth = 1.1;
  c.stroke();
  c.restore();

  // Contoured Walnut Wooden Pistol Grip (`cx - 11 .. cx + 20, y0 + 118 .. y0 + 176`)
  c.beginPath();
  c.moveTo(cx - 11, y0 + 118);
  c.lineTo(cx + 11, y0 + 118);
  c.bezierCurveTo(cx + 15, y0 + 134, cx + 19, y0 + 152, cx + 17, y0 + 169);
  c.quadraticCurveTo(cx + 15, y0 + 176, cx + 6, y0 + 176);
  c.lineTo(cx - 5, y0 + 173);
  c.quadraticCurveTo(cx - 10, y0 + 170, cx - 9, y0 + 160);
  c.bezierCurveTo(cx - 8, y0 + 144, cx - 10, y0 + 130, cx - 11, y0 + 118);
  c.closePath();
  c.fillStyle = woodGrip(cx - 11, cx + 19);
  c.fill();
  c.strokeStyle = 'rgba(30,12,4,0.85)';
  c.lineWidth = 0.9;
  c.stroke();

  // Carved wood grain lines & brass rivets on the grip
  c.strokeStyle = 'rgba(42,16,4,0.55)';
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(cx - 4, y0 + 126);
  c.quadraticCurveTo(cx + 1, y0 + 148, cx + 4, y0 + 170);
  c.moveTo(cx + 3, y0 + 126);
  c.quadraticCurveTo(cx + 8, y0 + 148, cx + 11, y0 + 168);
  c.stroke();
  c.fillStyle = '#fde047';
  c.beginPath();
  c.arc(cx - 5, y0 + 134, 1.5, 0, TAU);
  c.arc(cx + 6, y0 + 142, 1.5, 0, TAU);
  c.fill();

  // ══════════════════ 2. TERRACOTTA CLAY FLOWER POT HOPPER & SPROUT ON UPPER-LEFT (-x, matching SEED GUN image!) ══════════════════
  c.save();
  c.translate(cx - 25, y0 + 44);
  c.rotate(-0.42);
  // Terracotta pot body
  c.beginPath();
  c.moveTo(-9.5, -6);
  c.lineTo(9.5, -6);
  c.lineTo(7.2, 14);
  c.lineTo(-7.2, 14);
  c.closePath();
  c.fillStyle = lin(c, -9.5, 9.5, ['#7c2d12', '#c2410c', '#fb923c', '#9a3412']);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.84)';
  c.lineWidth = 0.85;
  c.stroke();

  // Thick terracotta pot rim collar
  c.beginPath();
  c.roundRect(-11.5, -11, 23, 6, 2.2);
  c.fillStyle = lin(c, -11.5, 11.5, ['#7c2d12', '#ea580c', '#fed7aa', '#9a3412']);
  c.fill();
  c.strokeStyle = 'rgba(67,20,7,0.84)';
  c.lineWidth = 0.85;
  c.stroke();

  // Sprouting green stem + 2 veined leaves emerging from the flower pot!
  const sway = Math.sin(t * 3.2) * 0.1;
  c.rotate(sway);
  c.strokeStyle = '#15803d';
  c.lineWidth = 2.2;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(0, -11);
  c.quadraticCurveTo(-2, -20, 0, -27);
  c.stroke();
  drawLeaf(-1, -24, -0.75, 0.95);
  drawLeaf(1, -25, 0.72, 0.95);
  c.restore();

  // ══════════════════ 3. LUMINOUS EMERALD-GREEN GLASS SEED CHAMBER & BRONZE CAPS (y0 + 26 .. y0 + 122, matching SEED GUN image!) ══════════════════
  // Glowing Emerald-Green Cylindrical Glass Chamber (`cx - 16.5 .. cx + 16.5, y0 + 30 .. y0 + 116`)
  c.save();
  c.beginPath();
  c.roundRect(cx - 16.5, y0 + 30, 33, 86, 13);
  const glassG = c.createLinearGradient(cx - 16.5, y0 + 30, cx + 16.5, y0 + 116);
  glassG.addColorStop(0, '#064e3b');
  glassG.addColorStop(0.24, '#10b981');
  glassG.addColorStop(0.5, '#6ee7b7');
  glassG.addColorStop(0.76, '#059669');
  glassG.addColorStop(1, '#022c22');
  c.fillStyle = glassG;
  c.fill();
  c.clip();

  // Inner bright lime-green bioluminescent core glow
  const coreG = c.createRadialGradient(cx, y0 + 72, 2, cx, y0 + 72, 34);
  coreG.addColorStop(0, 'rgba(217,249,157,0.78)');
  coreG.addColorStop(0.55, 'rgba(74,222,128,0.38)');
  coreG.addColorStop(1, 'rgba(6,78,59,0)');
  c.fillStyle = coreG;
  c.fillRect(cx - 17, y0 + 30, 34, 86);

  // Floating glowing golden-green life seeds inside the chamber
  for (let i = 0; i < 6; i++) {
    const sx = cx - 7 + (i % 3) * 7 + Math.sin(t * 3 + i) * 1.5;
    const sy = y0 + 42 + i * 11 + Math.cos(t * 2.5 + i) * 1.5;
    c.fillStyle = 'rgba(236,252,203,0.85)';
    c.beginPath();
    c.arc(sx, sy, 1.8, 0, TAU);
    c.fill();
  }

  // High-gloss white curved glass reflection down the left side of the tank
  c.fillStyle = 'rgba(255,255,255,0.58)';
  c.beginPath();
  c.roundRect(cx - 12.5, y0 + 36, 3.8, 72, 1.9);
  c.fill();
  c.restore();

  // Outer emerald glass contour
  c.beginPath();
  c.roundRect(cx - 16.5, y0 + 30, 33, 86, 13);
  c.strokeStyle = 'rgba(2,44,34,0.86)';
  c.lineWidth = 0.92;
  c.stroke();

  // Antique Bronze / Gold Top & Bottom Chamber Caps (`y0 + 25 .. y0 + 34` and `y0 + 111 .. y0 + 121`)
  c.beginPath();
  c.roundRect(cx - 13.5, y0 + 25, 27, 8.5, 3.5);
  c.fillStyle = bronzeGold(cx - 13.5, cx + 13.5);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.84)';
  c.lineWidth = 0.85;
  c.stroke();

  c.beginPath();
  c.roundRect(cx - 15, y0 + 111, 30, 9.5, 3.8);
  c.fillStyle = bronzeGold(cx - 15, cx + 15);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.84)';
  c.lineWidth = 0.85;
  c.stroke();

  // ══════════════════ 4. 3D WOODY VINES & VEINED LIME LEAVES WRAPPING AROUND THE GLASS TANK (matching SEED GUN image!) ══════════════════
  c.save();
  c.lineCap = 'round';
  // Two diagonal woody vine wraps across the green glass tank
  for (const [yStart, yMid, yEnd, dir] of [
    [y0 + 34, y0 + 56, y0 + 76, 1],
    [y0 + 74, y0 + 96, y0 + 114, -1],
  ] as [number, number, number, number][]) {
    c.strokeStyle = '#3b1504';
    c.lineWidth = 5.0;
    c.beginPath();
    c.moveTo(cx - dir * 16.5, yStart);
    c.bezierCurveTo(cx - dir * 6, yMid - 6, cx + dir * 6, yMid + 6, cx + dir * 16.5, yEnd);
    c.stroke();

    c.strokeStyle = '#92400e';
    c.lineWidth = 3.3;
    c.stroke();

    c.strokeStyle = '#fbbf24';
    c.lineWidth = 1.0;
    c.stroke();
  }
  c.restore();

  // 5 Lush Veined Lime-Green Leaves sprouting along the woody vines (matching SEED GUN image!)
  drawLeaf(cx + 12, y0 + 46, 0.85, 0.92);
  drawLeaf(cx - 4, y0 + 58, -0.65, 0.88);
  drawLeaf(cx + 15, y0 + 74, 1.05, 0.95);
  drawLeaf(cx - 13, y0 + 90, -0.9, 0.9);
  drawLeaf(cx + 6, y0 + 104, 0.7, 0.85);

  // ══════════════════ 5. FLARED GOLDEN WATERING-CAN ROSE SPRINKLER NOZZLE (y0 - 2 .. y0 + 26, matching SEED GUN image!) ══════════════════
  // Brass neck (`y0 + 14 .. y0 + 26`)
  c.beginPath();
  c.roundRect(cx - 5.5, y0 + 14, 11, 12.5, 2.2);
  c.fillStyle = bronzeGold(cx - 5.5, cx + 5.5);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.84)';
  c.lineWidth = 0.82;
  c.stroke();

  // Conical Golden Sprinkler Bell (`cx - 15 .. cx + 15, y0 + 1 .. y0 + 15`)
  c.beginPath();
  c.moveTo(cx - 15, y0 + 2);
  c.lineTo(cx + 15, y0 + 2);
  c.lineTo(cx + 6, y0 + 15);
  c.lineTo(cx - 6, y0 + 15);
  c.closePath();
  c.fillStyle = bronzeGold(cx - 15, cx + 15);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.85)';
  c.lineWidth = 0.88;
  c.stroke();

  // Convex Perforated Golden Sprinkler Rose Face at `(cx, y0 + 2)`
  c.beginPath();
  c.ellipse(cx, y0 + 2, 15, 4.6, 0, 0, TAU);
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#854d0e', '#facc15', '#fef9c3', '#ca8a04']);
  c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.86)';
  c.lineWidth = 0.88;
  c.stroke();

  // Dark sprinkler holes across the golden watering-can rose face
  c.fillStyle = '#3b1504';
  for (const [hx, hy] of [
    [-9, 1.8],
    [-4.5, 0.8],
    [0, 0.5],
    [4.5, 0.8],
    [9, 1.8],
    [-6.5, 3.1],
    [-2, 2.8],
    [2.5, 2.8],
    [7, 3.1],
  ] as [number, number][]) {
    c.beginPath();
    c.arc(cx + hx, y0 + hy, 1.05, 0, TAU);
    c.fill();
  }

  c.restore();
}
