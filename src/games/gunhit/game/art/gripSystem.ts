import { TAU, lin, radial } from './kit';

export type GripMat = 'polymer' | 'rubber' | 'wood' | 'metal' | 'g10';

interface Mat {
  base: string; mid: string; dark: string; edge: string; tex: string; texA: number;
}
const MATS: Record<GripMat, Mat> = {
  polymer: { base: '#2b3038', mid: '#1a1d22', dark: '#0a0c0f', edge: '#4a525c', tex: '#ffffff', texA: 0.07 },
  rubber:  { base: '#15171c', mid: '#0d0f12', dark: '#050608', edge: '#33383f', tex: '#ffffff', texA: 0.06 },
  wood:    { base: '#8b4a20', mid: '#5c2f10', dark: '#331808', edge: '#b06a30', tex: '#000000', texA: 0.13 },
  metal:   { base: '#5a626c', mid: '#333940', dark: '#171a1e', edge: '#8a939e', tex: '#ffffff', texA: 0.09 },
  g10:     { base: '#1f232b', mid: '#11141a', dark: '#07080b', edge: '#3d4450', tex: '#ffffff', texA: 0.05 },
};

function shade(c: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

/** Prosedural wood grain that follows the grip's curvature */
function woodGrain(c: CanvasRenderingContext2D, cx: number, y: number) {
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(45,18,4,0.5)';
  c.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const o = (i - 4) * 4.2;
    c.beginPath();
    c.moveTo(cx + o * 0.6, y + 30);
    c.bezierCurveTo(cx + o + Math.sin(i) * 5, y + 55, cx + o - Math.sin(i) * 5, y + 78, cx + o * 1.4 + 6, y + 100);
    c.stroke();
  }
  c.strokeStyle = 'rgba(200,140,80,0.3)';
  c.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) {
    const o = (i - 2) * 6;
    c.beginPath();
    c.moveTo(cx + o, y + 34);
    c.bezierCurveTo(cx + o + 3, y + 60, cx + o - 2, y + 84, cx + o + 4, y + 100);
    c.stroke();
  }
  c.restore();
}

/** True diamond checkering pattern clipped to the panel */
function checkering(c: CanvasRenderingContext2D, mat: Mat, cx: number, y: number, w: number, h: number) {
  c.save();
  c.beginPath();
  c.rect(cx, y, w, h);
  c.clip();
  const s = 4.2;
  c.strokeStyle = mat.tex;
  c.globalAlpha = mat.texA;
  c.lineWidth = 0.9;
  for (let row = 0; row * s < h + s; row++) {
    const ry = y + row * s;
    for (let col = -1; col * s < w + s; col++) {
      const rx = cx + col * s + (row % 2) * s * 0.5;
      c.beginPath();
      c.moveTo(rx, ry);
      c.lineTo(rx + s * 0.5, ry + s * 0.5);
      c.lineTo(rx, ry + s);
      c.moveTo(rx, ry + s);
      c.lineTo(rx + s * 0.5, ry + s * 1.5);
      c.stroke();
    }
  }
  c.globalAlpha = 1;
  c.restore();
}

/** All themed grips share Golden Gun's pronounced downward rake. */
function beginGoldenAngleGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  c.save();
  c.translate(cx, y + 20);
  c.rotate(-0.72);
  c.translate(-cx, -(y + 20));
}

/** Portal Gun grip: silver shell, charcoal palm panel, and a live portal insert. */
export function drawPortalGrip(c: CanvasRenderingContext2D, cx: number, y: number, accent: string) {
  beginGoldenAngleGrip(c, cx, y);
  c.beginPath();
  c.moveTo(cx - 10, y + 18); c.lineTo(cx + 10, y + 18);
  c.lineTo(cx + 14, y + 34); c.lineTo(cx + 12, y + 73);
  c.lineTo(cx + 10, y + 84); c.lineTo(cx + 4, y + 91);
  c.lineTo(cx + 1, y + 97); c.lineTo(cx - 11, y + 87);
  c.lineTo(cx - 14, y + 35); c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 14, ['#64748b', '#f8fafc', '#cbd5e1', '#475569']);
  c.fill(); c.strokeStyle = '#1e293b'; c.lineWidth = 2.5; c.stroke();
  c.beginPath(); c.roundRect(cx - 6, y + 28, 12, 49, 6); c.fillStyle = '#111827'; c.fill();
  c.strokeStyle = '#475569'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = accent; c.beginPath(); c.roundRect(cx - 3.5, y + 33, 7, 32, 3.5); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.75)'; c.fillRect(cx - 2, y + 36, 1, 24);
  c.strokeStyle = '#334155'; c.lineWidth = 2;
  for (const gy of [y + 70, y + 77, y + 84]) {
    c.beginPath(); c.moveTo(cx - 9, gy); c.quadraticCurveTo(cx, gy + 4, cx + 9, gy); c.stroke();
  }
  c.strokeStyle = '#475569'; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(cx - 11, y + 24); c.quadraticCurveTo(cx - 22, y + 39, cx - 16, y + 54);
  c.quadraticCurveTo(cx - 12, y + 62, cx - 4, y + 59); c.stroke();
  c.fillStyle = accent; c.beginPath(); c.arc(cx, y + 88, 3.3, 0, TAU); c.fill();
  c.fillStyle = '#e2e8f0'; c.beginPath(); c.arc(cx, y + 88, 1.2, 0, TAU); c.fill();
  c.restore();
}

/** Chrono Gun grip: warm walnut body, ivory palm scales, and brass time marks. */
export function drawChronoGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  beginGoldenAngleGrip(c, cx, y);
  c.beginPath();
  c.moveTo(cx - 9, y + 18); c.lineTo(cx + 9, y + 18);
  c.lineTo(cx + 14, y + 31); c.lineTo(cx + 11, y + 78);
  c.lineTo(cx + 8, y + 88); c.lineTo(cx + 1, y + 98);
  c.lineTo(cx - 10, y + 89); c.lineTo(cx - 12, y + 78);
  c.lineTo(cx - 14, y + 34); c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 14, ['#451a03', '#92400e', '#b45309', '#3f1b08']);
  c.fill(); c.strokeStyle = '#2b1205'; c.lineWidth = 2.5; c.stroke();
  c.beginPath(); c.moveTo(cx - 6, y + 29); c.lineTo(cx + 6, y + 27);
  c.lineTo(cx + 7, y + 78); c.lineTo(cx + 1, y + 86); c.lineTo(cx - 7, y + 78); c.closePath();
  c.fillStyle = lin(c, cx - 7, cx + 7, ['#d6b878', '#fff7d6', '#c9a85a']); c.fill();
  c.strokeStyle = '#713f12'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = '#a16207'; c.lineWidth = 2.5;
  for (const gy of [y + 42, y + 54, y + 66, y + 78]) {
    c.beginPath(); c.moveTo(cx - 8, gy); c.lineTo(cx + 8, gy - 2); c.stroke();
  }
  c.fillStyle = '#fef3c7'; c.beginPath(); c.arc(cx, y + 34, 2.5, 0, TAU); c.fill();
  c.strokeStyle = '#713f12'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#fbbf24'; c.strokeStyle = '#713f12'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(cx - 9, y + 88); c.lineTo(cx + 1, y + 96);
  c.lineTo(cx + 9, y + 88); c.lineTo(cx + 6, y + 94);
  c.lineTo(cx + 1, y + 98); c.lineTo(cx - 7, y + 92); c.closePath(); c.fill(); c.stroke();
  c.restore();
}

/** Freeze Ray grip: ergonomic dark slate-navy handle with 5 molded ribs, glowing cyan energy channel, power jewel, and silver heel cap. */
export function drawFreezeGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  beginGoldenAngleGrip(c, cx, y);

  // Main ergonomic dark slate-navy handle body
  c.beginPath();
  c.moveTo(cx - 11, y + 18);
  c.lineTo(cx + 11, y + 18);
  c.lineTo(cx + 15, y + 31);
  c.lineTo(cx + 13, y + 79);
  c.lineTo(cx + 10, y + 89);
  c.lineTo(cx + 1, y + 99);
  c.lineTo(cx - 10, y + 90);
  c.lineTo(cx - 13, y + 78);
  c.lineTo(cx - 14, y + 32);
  c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 15, ['#0f1a26', '#2b4057', '#3f5a75', '#1d2d3e', '#0d1620']);
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.68)';
  c.lineWidth = 0.85;
  c.stroke();

  // Deep-teal palm panel & glowing cryogenic cyan front channel (preserves #075985 and #67e8f9)
  c.beginPath();
  c.roundRect(cx - 12, y + 32, 7.5, 48, 3);
  c.fillStyle = '#075985';
  c.fill();
  c.strokeStyle = 'rgba(15,28,42,0.55)';
  c.lineWidth = 0.7;
  c.stroke();

  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 6;
  c.fillStyle = '#67e8f9';
  c.beginPath();
  c.roundRect(cx - 10.2, y + 34, 4, 44, 2);
  c.fill();
  c.restore();

  // Segmented horizontal bars across the cyan front channel (like image 1)
  c.strokeStyle = 'rgba(15,37,55,0.75)';
  c.lineWidth = 0.9;
  for (const sy of [y + 42, y + 50, y + 58, y + 66, y + 74]) {
    c.beginPath();
    c.moveTo(cx - 12, sy);
    c.lineTo(cx - 4.5, sy);
    c.stroke();
  }

  // 5 horizontal dark ergonomic grip ribs on the rear/side palm swell
  for (const gy of [y + 36, y + 45, y + 54, y + 63, y + 72]) {
    c.fillStyle = '#13202e';
    c.beginPath();
    c.roundRect(cx - 2, gy, 12.5, 6.2, 2);
    c.fill();
    c.strokeStyle = 'rgba(9,17,25,0.6)';
    c.lineWidth = 0.7;
    c.stroke();
    c.strokeStyle = 'rgba(165,243,252,0.38)';
    c.lineWidth = 0.75;
    c.beginPath();
    c.moveTo(cx - 0.5, gy + 1.2);
    c.lineTo(cx + 9, gy + 1.2);
    c.stroke();
  }

  // Glowing cyan hexagonal/round power jewel near bottom of grip
  c.save();
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 8;
  c.fillStyle = '#00e5ff';
  c.beginPath();
  c.arc(cx + 1.5, y + 83, 3.6, 0, TAU);
  c.fill();
  c.fillStyle = '#e0fbff';
  c.beginPath();
  c.arc(cx + 0.8, y + 82.2, 1.6, 0, TAU);
  c.fill();
  c.restore();

  // Clean silver-white beveled heel cap / buttplate at the bottom
  c.fillStyle = lin(c, cx - 10, cx + 10, ['#9bb3c9', '#ffffff', '#d8e8f5', '#6c859c']);
  c.strokeStyle = 'rgba(15,28,42,0.65)';
  c.lineWidth = 0.85;
  c.beginPath();
  c.moveTo(cx - 10, y + 88);
  c.lineTo(cx + 1, y + 94);
  c.lineTo(cx + 10, y + 88);
  c.lineTo(cx + 7, y + 95);
  c.lineTo(cx + 1, y + 99);
  c.lineTo(cx - 8, y + 93);
  c.closePath();
  c.fill();
  c.stroke();

  // Small dark accent slot on the silver heel cap
  c.fillStyle = '#162433';
  c.beginPath();
  c.roundRect(cx - 3.5, y + 92.5, 5, 2.3, 1);
  c.fill();

  c.restore();
}

/** Slim aquarium-blue grip with a fin-shaped butt for the Fish Gun. */
export function drawFishGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  beginGoldenAngleGrip(c, cx, y);
  c.beginPath();
  c.moveTo(cx - 8, y + 18); c.lineTo(cx + 8, y + 18);
  c.lineTo(cx + 12, y + 34); c.lineTo(cx + 9, y + 68);
  c.lineTo(cx + 14, y + 75); c.lineTo(cx + 7, y + 81);
  c.lineTo(cx + 5, y + 89); c.lineTo(cx + 1, y + 98);
  c.lineTo(cx - 8, y + 90); c.lineTo(cx - 15, y + 83);
  c.lineTo(cx - 9, y + 76); c.lineTo(cx - 12, y + 68);
  c.lineTo(cx - 12, y + 34); c.closePath();
  c.fillStyle = lin(c, cx - 15, cx + 14, ['#082f49', '#0e7490', '#38bdf8', '#164e63']);
  c.fill(); c.strokeStyle = '#062338'; c.lineWidth = 2; c.stroke();
  c.beginPath(); c.roundRect(cx - 5, y + 29, 8, 48, 3);
  c.fillStyle = lin(c, cx - 5, cx + 3, ['#075985', '#67e8f9', '#0e7490']); c.fill();
  c.fillStyle = 'rgba(224,251,255,0.72)'; c.fillRect(cx - 3, y + 34, 1.4, 38);
  c.strokeStyle = 'rgba(3,42,63,0.82)'; c.lineWidth = 1.8;
  for (const gy of [y + 47, y + 59, y + 71]) {
    c.beginPath(); c.moveTo(cx - 8, gy); c.quadraticCurveTo(cx - 4, gy + 5, cx, gy + 3);
    c.quadraticCurveTo(cx + 5, gy + 5, cx + 8, gy); c.stroke();
  }
  // Tail-like butt cap and a small amber locking pin.
  c.fillStyle = lin(c, cx - 15, cx + 14, ['#c2410c', '#fb923c', '#fdba74']);
  c.strokeStyle = '#7c2d12'; c.lineWidth = 1.3;
  c.beginPath(); c.moveTo(cx - 13, y + 78); c.lineTo(cx - 5, y + 82);
  c.lineTo(cx + 1, y + 97); c.lineTo(cx + 7, y + 82);
  c.lineTo(cx + 13, y + 76); c.lineTo(cx + 9, y + 89);
  c.lineTo(cx + 1, y + 98); c.lineTo(cx - 10, y + 88); c.closePath(); c.fill(); c.stroke();
  c.strokeStyle = 'rgba(255,237,213,0.8)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(cx + 1, y + 84); c.lineTo(cx + 1, y + 95); c.stroke();
  c.fillStyle = '#ffedd5'; c.beginPath(); c.arc(cx - 5, y + 38, 1.5, 0, TAU); c.fill();
  c.restore();
}

/** Compact insulated hand-grip with a live cyan conductor spine. */
export function drawElectroGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  beginGoldenAngleGrip(c, cx, y);
  c.beginPath();
  c.moveTo(cx - 9, y + 18); c.lineTo(cx + 9, y + 18);
  c.lineTo(cx + 13, y + 32); c.lineTo(cx + 10, y + 78);
  c.lineTo(cx + 6, y + 89); c.lineTo(cx + 1, y + 98);
  c.lineTo(cx - 10, y + 89); c.lineTo(cx - 13, y + 76);
  c.lineTo(cx - 13, y + 32); c.closePath();
  c.fillStyle = lin(c, cx - 13, cx + 13, ['#071a26', '#0f2f43', '#17506a', '#071a26']);
  c.fill(); c.strokeStyle = '#03111b'; c.lineWidth = 2.4; c.stroke();
  c.beginPath(); c.moveTo(cx - 5, y + 29); c.lineTo(cx + 5, y + 29);
  c.lineTo(cx + 3, y + 81); c.lineTo(cx + 1, y + 90); c.lineTo(cx - 5, y + 84); c.closePath();
  c.fillStyle = lin(c, cx - 5, cx + 5, ['#164e63', '#22d3ee', '#0e7490']); c.fill();
  c.fillStyle = 'rgba(224,251,255,0.8)'; c.fillRect(cx - 2, y + 35, 1.5, 42);
  c.strokeStyle = '#d97732'; c.lineWidth = 1.6;
  for (const gy of [y + 48, y + 61, y + 74]) {
    c.beginPath(); c.moveTo(cx - 10, gy); c.lineTo(cx + 10, gy - 2); c.stroke();
  }
  c.fillStyle = '#fbbf24'; c.strokeStyle = '#713f12'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(cx - 9, y + 87); c.lineTo(cx + 1, y + 95);
  c.lineTo(cx + 9, y + 86); c.lineTo(cx + 5, y + 94);
  c.lineTo(cx + 1, y + 98); c.lineTo(cx - 7, y + 92); c.closePath(); c.fill(); c.stroke();
  c.restore();
}

/** Molded, toy-like grip to match the bright Super Soaker body. */
export function drawWaterGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  c.save();
  // The grip branches off the receiver at a downward angle instead of
  // continuing the barrel axis like a bazooka tube.
  c.translate(cx, y + 20);
  c.rotate(-0.72);
  c.translate(-cx, -(y + 20));
  c.beginPath();
  c.moveTo(cx - 9, y + 20); c.lineTo(cx + 9, y + 20);
  c.quadraticCurveTo(cx + 15, y + 25, cx + 14, y + 43);
  c.lineTo(cx + 12, y + 78); c.lineTo(cx + 9, y + 85);
  c.lineTo(cx + 3, y + 91); c.lineTo(cx + 1, y + 96);
  c.lineTo(cx - 9, y + 88); c.quadraticCurveTo(cx - 15, y + 81, cx - 14, y + 68);
  c.lineTo(cx - 14, y + 34); c.quadraticCurveTo(cx - 13, y + 24, cx - 9, y + 20);
  c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 15, ['#064e3b', '#0f766e', '#14b8a6', '#65a30d']);
  c.fill(); c.strokeStyle = '#052e2b'; c.lineWidth = 2.5; c.stroke();
  c.save(); c.clip();
  c.fillStyle = 'rgba(190,242,100,0.78)';
  c.beginPath(); c.moveTo(cx + 6, y + 28); c.lineTo(cx + 11, y + 32); c.lineTo(cx + 9, y + 76); c.lineTo(cx + 3, y + 83); c.closePath(); c.fill();
  c.fillStyle = 'rgba(125,211,252,0.85)';
  c.beginPath(); c.roundRect(cx - 11, y + 35, 6, 37, 3); c.fill();
  c.strokeStyle = 'rgba(5,46,42,0.7)'; c.lineWidth = 2;
  for (const gy of [y + 50, y + 61, y + 72]) {
    c.beginPath(); c.moveTo(cx - 6, gy); c.quadraticCurveTo(cx, gy + 3, cx + 7, gy); c.stroke();
  }
  c.restore();
  // Molded trigger loop and orange release lever, matching the pump detail.
  c.beginPath(); c.moveTo(cx - 11, y + 25); c.quadraticCurveTo(cx - 20, y + 37, cx - 15, y + 53);
  c.quadraticCurveTo(cx - 12, y + 61, cx - 4, y + 58);
  c.strokeStyle = '#0f766e'; c.lineWidth = 2.8; c.stroke();
  c.strokeStyle = '#99f6e4'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#fb923c'; c.beginPath(); c.roundRect(cx - 6, y + 29, 4, 13, 2); c.fill();
  c.fillStyle = '#a3e635'; c.strokeStyle = '#14532d'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(cx - 9, y + 84); c.lineTo(cx + 1, y + 92);
  c.lineTo(cx + 9, y + 84); c.lineTo(cx + 7, y + 91);
  c.lineTo(cx + 1, y + 96); c.lineTo(cx - 8, y + 90); c.closePath(); c.fill(); c.stroke();
  c.restore();
}

/** Frosted insulated grip with pale blue wraps for the Snowball Cannon. */
export function drawFrostGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  c.save();
  // The grip branches off the receiver at a downward angle instead of
  // continuing the barrel axis like a bazooka tube.
  c.translate(cx, y + 20);
  c.rotate(-0.72);
  c.translate(-cx, -(y + 20));
  c.beginPath();
  c.moveTo(cx - 12, y + 19); c.lineTo(cx + 12, y + 19);
  c.lineTo(cx + 16, y + 29); c.lineTo(cx + 14, y + 82);
  c.quadraticCurveTo(cx + 13, y + 94, cx, y + 98);
  c.quadraticCurveTo(cx - 13, y + 94, cx - 14, y + 82);
  c.lineTo(cx - 16, y + 29); c.closePath();
  c.fillStyle = lin(c, cx - 16, cx + 16, ['#0c4a6e', '#38bdf8', '#bae6fd', '#38bdf8', '#075985']);
  c.fill(); c.strokeStyle = '#082f49'; c.lineWidth = 2.5; c.stroke();
  c.save(); c.clip();
  c.fillStyle = 'rgba(255,255,255,0.78)';
  c.beginPath(); c.moveTo(cx - 10, y + 30); c.lineTo(cx - 5, y + 26); c.lineTo(cx - 6, y + 88); c.lineTo(cx - 12, y + 84); c.closePath(); c.fill();
  for (const gy of [y + 43, y + 56, y + 69, y + 82]) {
    c.fillStyle = 'rgba(7,89,133,0.62)';
    c.beginPath(); c.roundRect(cx - 14, gy, 28, 4, 2); c.fill();
    c.fillStyle = 'rgba(224,242,254,0.68)';
    c.fillRect(cx - 11, gy, 22, 1);
  }
  c.restore();
  c.fillStyle = '#e0f2fe';
  c.beginPath(); c.arc(cx + 7, y + 34, 2, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(cx, y + 86); c.lineTo(cx - 4, y + 92); c.lineTo(cx + 4, y + 92); c.closePath(); c.fill();
  c.fillStyle = '#7dd3fc'; c.beginPath(); c.roundRect(cx - 13, y + 92, 26, 7, 3); c.fill();
  c.restore();
}

/** Segmented violet containment grip for the BLACK HOLE launcher. */
export function drawVoidGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  c.save();
  // The grip branches off the receiver at a downward angle instead of
  // continuing the barrel axis like a bazooka tube.
  c.translate(cx, y + 20);
  c.rotate(-0.72);
  c.translate(-cx, -(y + 20));
  c.beginPath();
  c.moveTo(cx - 11, y + 20); c.lineTo(cx + 11, y + 20);
  c.lineTo(cx + 17, y + 31); c.lineTo(cx + 12, y + 79);
  c.quadraticCurveTo(cx + 10, y + 94, cx, y + 98);
  c.quadraticCurveTo(cx - 10, y + 94, cx - 12, y + 79);
  c.lineTo(cx - 17, y + 31); c.closePath();
  c.fillStyle = lin(c, cx - 17, cx + 17, ['#10091b', '#3b1d59', '#6b3c91', '#2b123f', '#0c0714']);
  c.fill(); c.strokeStyle = '#170d29'; c.lineWidth = 3; c.stroke();
  c.save(); c.clip();
  c.fillStyle = 'rgba(196,132,252,0.38)';
  c.beginPath(); c.moveTo(cx - 5, y + 26); c.lineTo(cx + 2, y + 24); c.lineTo(cx + 4, y + 91); c.lineTo(cx - 4, y + 91); c.closePath(); c.fill();
  for (let i = 0; i < 4; i++) {
    const gy = y + 40 + i * 13;
    c.strokeStyle = i % 2 ? '#a855f7' : '#d8b4fe'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx - 13, gy); c.quadraticCurveTo(cx, gy + 5, cx + 13, gy); c.stroke();
    c.strokeStyle = 'rgba(17,10,28,0.8)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 11, gy + 4); c.quadraticCurveTo(cx, gy + 8, cx + 11, gy + 4); c.stroke();
  }
  c.restore();
  c.fillStyle = '#e9d5ff'; c.beginPath(); c.arc(cx, y + 33, 3, 0, TAU); c.fill();
  c.fillStyle = '#a855f7'; c.beginPath(); c.roundRect(cx - 13, y + 92, 26, 7, 3); c.fill();
  c.restore();
}

/**
 * Pegangan senjata ultra-detail & ergonomis.
 * Memanjang ke bawah dari (cx, y). Lebar kira-kira 44px, panjang 100px.
 */
export function drawModernGrip(
  c: CanvasRenderingContext2D,
  cx: number,
  y: number,
  accent = '#5a626c',
  mat: GripMat = 'g10',
) {
  const M = MATS[mat] ?? MATS.g10;
  c.save();

  // ══════════════════ 1. SILHOUETTE (ergonomis: beavertail, backstrap, front strap, finger grooves) ══════════════════
  const P = [
    [cx - 11, y + 30], // tang kiri atas (biasa disambungkan ke frame)
    [cx + 7, y + 30],  // tang kanan atas
    [cx + 20, y + 31], // keluar ke beavertail
    [cx + 26, y + 44], // lekukan beavertail (sesuai sela ibu jari)
    [cx + 29, y + 72], // punggung grip melengkung
    [cx + 30, y + 98], // dasar belakang
    [cx + 13, y + 104],// bibir magwell kanan
    [cx + 6, y + 88],  // lekukan jari 3 (lekuk)
    [cx + 7, y + 76],
    [cx + 9, y + 66],  // lekukan jari 2
    [cx + 8, y + 56],
    [cx + 4, y + 48],  // lekukan jari 1
    [cx - 6, y + 42],  // pangkal pelatuk
    [cx - 13, y + 42],
  ] as [number, number][];

  c.beginPath();
  c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) {
    const [x, yy] = P[i];
    const [px, py] = P[i - 1];
    c.quadraticCurveTo(px, py, (px + x) / 2, (py + yy) / 2);
  }
  c.closePath();

  // ══════════════════ 2. BADAN UTAMA dengan gradasi material ══════════════════
  const bg = c.createLinearGradient(cx - 12, y + 30, cx + 30, y + 104);
  bg.addColorStop(0, M.edge);
  bg.addColorStop(0.28, M.base);
  bg.addColorStop(0.62, M.mid);
  bg.addColorStop(1, M.dark);
  c.fillStyle = bg;
  c.fill();

  // aksen warna senjata di sisi dalam (subtle)
  c.save();
  c.clip();
  const ag = c.createLinearGradient(cx - 12, y + 30, cx + 6, y + 104);
  ag.addColorStop(0, 'rgba(255,255,255,0.10)');
  // CanvasGradient rejects five-digit hex (#111 + 18 => #11118). Some
  // weapons use shorthand accents; expand them before adding alpha or a
  // single Arsenal thumbnail can throw and blank the entire React slide.
  const hex = /^#[\da-f]{3}$/i.test(accent)
    ? `#${[...accent.slice(1)].map(ch => ch + ch).join('')}` : accent;
  ag.addColorStop(1, /^#[\da-f]{6}$/i.test(hex) ? `${hex}18` : 'rgba(255,255,255,0.09)');
  c.fillStyle = ag;
  c.fillRect(cx - 14, y + 28, 46, 80);
  // ambient occlusion di pinggir bawah
  shade(c, cx + 10, y + 104, 34, 0.4);
  // rim light tepi kiri
  c.strokeStyle = 'rgba(255,255,255,0.22)';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx - 11, y + 32);
  c.quadraticCurveTo(cx - 6, y + 42, cx + 8, y + 56);
  c.quadraticCurveTo(cx + 7, y + 76, cx + 6, y + 88);
  c.stroke();
  c.restore();

  // outline tegas
  c.strokeStyle = '#050608';
  c.lineWidth = 2;
  c.stroke();

  // ══════════════════ 3. PANEL GRIP BER-TEXTSTUR (sisi kanan grip) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx + 8, y + 50);
  c.quadraticCurveTo(cx + 8, y + 78, cx + 13, y + 98);
  c.lineTo(cx + 27, y + 94);
  c.quadraticCurveTo(cx + 25, y + 70, cx + 24, y + 48);
  c.quadraticCurveTo(cx + 16, y + 44, cx + 8, y + 50);
  c.closePath();
  const pg = c.createLinearGradient(cx + 8, y + 46, cx + 27, y + 98);
  pg.addColorStop(0, M.base);
  pg.addColorStop(0.5, M.mid);
  pg.addColorStop(1, M.dark);
  c.fillStyle = pg;
  c.fill();
  c.strokeStyle = '#050608';
  c.lineWidth = 1.4;
  c.stroke();
  if (mat === 'wood') woodGrain(c, cx + 8, y + 44);
  else checkering(c, M, cx + 8, y + 44, 19, 56);
  // highlight sisi panel
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx + 11, y + 52);
  c.quadraticCurveTo(cx + 11, y + 80, cx + 14, y + 96);
  c.stroke();
  c.restore();

  // ══════════════════ 4. SEK GRIP BER-KILAU (atas & bawah) ══════════════════
  for (const [sy, sx, r] of [[y + 54, cx + 16, 2.6], [y + 90, cx + 20, 2.6]] as [number, number, number][]) {
    c.save();
    c.translate(sx, sy);
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.fillStyle = radial(c, 0, 0, r, ['#f1f5f9', '#94a3b8', '#334155']);
    c.fill();
    c.strokeStyle = '#0b0e12';
    c.lineWidth = 0.9;
    c.stroke();
    // kait silang
    c.strokeStyle = 'rgba(15,23,42,0.85)';
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(-r * 0.6, 0);
    c.lineTo(r * 0.6, 0);
    c.stroke();
    c.restore();
  }

  // ══════════════════ 5. TRIGGER GUARD + PELATUK (terintegrasi) ══════════════════
  c.save();
  // guard melengkung
  c.beginPath();
  c.moveTo(cx - 15, y + 14);
  c.quadraticCurveTo(cx - 22, y + 36, cx - 14, y + 44);
  c.lineTo(cx - 2, y + 44);
  c.strokeStyle = '#050608';
  c.lineWidth = 3.4;
  c.lineCap = 'round';
  c.stroke();
  // highlight guard
  c.strokeStyle = 'rgba(255,255,255,0.2)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx - 16, y + 16);
  c.quadraticCurveTo(cx - 21, y + 34, cx - 14, y + 42);
  c.stroke();
  // pelatuk baja melengkung
  c.beginPath();
  c.moveTo(cx - 9, y + 20);
  c.quadraticCurveTo(cx - 4, y + 27, cx - 6, y + 37);
  c.strokeStyle = lin(c, cx - 8, cx - 5, ['#cbd5e1', '#f8fafc', '#64748b']);
  c.lineWidth = 2.2;
  c.stroke();
  c.restore();

  // ══════════════════ 6. MAGWELL / BASEPLATE melebar ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 4, y + 96);
  c.lineTo(cx + 30, y + 94);
  c.quadraticCurveTo(cx + 33, y + 100, cx + 29, y + 104);
  c.lineTo(cx - 2, y + 106);
  c.quadraticCurveTo(cx - 6, y + 100, cx - 4, y + 96);
  c.closePath();
  const mw = c.createLinearGradient(cx - 6, y + 94, cx + 32, y + 106);
  mw.addColorStop(0, '#22262c');
  mw.addColorStop(0.5, '#0c0e11');
  mw.addColorStop(1, '#22262c');
  c.fillStyle = mw;
  c.fill();
  c.strokeStyle = '#050608';
  c.lineWidth = 1.6;
  c.stroke();
  // garis magwell
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx - 2, y + 99);
  c.lineTo(cx + 28, y + 97);
  c.stroke();
  c.restore();

  c.restore();
}

/** Plasma sidearm grip: angled titanium shell, dark palm panel and restrained green power details. */
export function drawPlasmaGrip(c: CanvasRenderingContext2D, cx: number, y: number, t = 0) {
  c.save();
  c.translate(cx, y + 15);
  c.rotate(-0.32);
  c.translate(-cx, -(y + 15));

  c.beginPath();
  c.moveTo(cx - 18, y + 4);
  c.lineTo(cx + 17, y + 4);
  c.lineTo(cx + 19, y + 19);
  c.lineTo(cx + 12, y + 65);
  c.quadraticCurveTo(cx + 10, y + 81, cx + 2, y + 91);
  c.lineTo(cx - 19, y + 80);
  c.quadraticCurveTo(cx - 27, y + 76, cx - 24, y + 66);
  c.lineTo(cx - 14, y + 22);
  c.closePath();
  c.fillStyle = lin(c, cx - 27, cx + 20, ['#10191d', '#45565a', '#26383b', '#0b1417']);
  c.fill();
  c.strokeStyle = '#061013'; c.lineWidth = 2.8; c.stroke();

  // Replaceable, slightly inset palm pad, kept dark so the green accents read as hardware.
  c.beginPath();
  c.moveTo(cx - 11, y + 26);
  c.quadraticCurveTo(cx - 4, y + 22, cx + 10, y + 27);
  c.lineTo(cx + 7, y + 66);
  c.quadraticCurveTo(cx + 5, y + 75, cx - 2, y + 81);
  c.lineTo(cx - 16, y + 72);
  c.closePath();
  c.fillStyle = lin(c, cx - 17, cx + 11, ['#061313', '#102b27', '#071714']);
  c.fill(); c.strokeStyle = '#172d29'; c.lineWidth = 1.4; c.stroke();

  c.strokeStyle = 'rgba(155,255,216,0.42)'; c.lineWidth = 1.1;
  for (let i = 0; i < 5; i++) {
    const gy = y + 39 + i * 7;
    c.beginPath(); c.moveTo(cx - 11, gy); c.quadraticCurveTo(cx - 2, gy + 3, cx + 7, gy + 1); c.stroke();
  }
  c.fillStyle = '#152321';
  c.beginPath(); c.roundRect(cx - 6, y + 8, 12, 8, 3); c.fill();
  c.strokeStyle = '#7bffd0'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(cx - 4, y + 12); c.lineTo(cx + 4, y + 12); c.stroke();
  const pulse = 0.45 + 0.35 * Math.sin(t * 5);
  c.fillStyle = `rgba(67,255,183,${pulse})`;
  c.beginPath(); c.arc(cx + 8, y + 72, 2.2, 0, TAU); c.fill();

  // Raised, beveled heel cap makes the grip end deliberate rather than blunt.
  c.beginPath();
  c.moveTo(cx - 20, y + 75); c.lineTo(cx - 2, y + 85);
  c.lineTo(cx + 2, y + 91); c.lineTo(cx - 9, y + 89);
  c.closePath();
  c.fillStyle = lin(c, cx - 20, cx + 3, ['#101719', '#65767a', '#202a2d']);
  c.fill(); c.strokeStyle = '#071013'; c.lineWidth = 1.4; c.stroke();
  c.restore();
}

/** Compact polymer handgun grip using the same pronounced rearward rake as the Electro Gun. */
export function drawPistolGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  beginGoldenAngleGrip(c, cx, y);
  c.beginPath();
  c.moveTo(cx - 12, y + 15); c.lineTo(cx + 12, y + 15);
  c.quadraticCurveTo(cx + 17, y + 22, cx + 14, y + 38);
  c.lineTo(cx + 11, y + 72);
  c.quadraticCurveTo(cx + 9, y + 85, cx - 2, y + 94);
  c.lineTo(cx - 24, y + 80);
  c.quadraticCurveTo(cx - 31, y + 75, cx - 27, y + 64);
  c.lineTo(cx - 17, y + 29);
  c.quadraticCurveTo(cx - 15, y + 19, cx - 12, y + 15);
  c.closePath();
  c.fillStyle = lin(c, cx - 30, cx + 17, ['#090b0f', '#333a43', '#171b20', '#080a0d']);
  c.fill(); c.strokeStyle = '#050608'; c.lineWidth = 2.8; c.stroke();

  c.save();
  c.beginPath();
  c.moveTo(cx - 12, y + 31); c.lineTo(cx + 8, y + 38);
  c.lineTo(cx + 5, y + 72); c.quadraticCurveTo(cx + 3, y + 82, cx - 4, y + 86);
  c.lineTo(cx - 20, y + 76); c.closePath(); c.clip();
  c.fillStyle = lin(c, cx - 22, cx + 10, ['#11151a', '#252b33', '#101317']);
  c.fillRect(cx - 23, y + 28, 34, 61);
  c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const gy = y + 39 + i * 5;
    c.beginPath(); c.moveTo(cx - 19, gy); c.lineTo(cx + 6, gy + 7); c.stroke();
  }
  c.restore();
  c.strokeStyle = '#424b55'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(cx - 11, y + 22); c.lineTo(cx + 9, y + 22); c.stroke();
  c.fillStyle = '#0b0d10'; c.beginPath(); c.roundRect(cx - 18, y + 72, 28, 5, 2); c.fill();
  c.restore();
}

/** Pegangan kayu klasik dengan ukiran (untuk senjata klasik) */
export function drawWoodGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  drawModernGrip(c, cx, y, '#b06a30', 'wood');
}

/** Pegangan futuristik dengan garis LED (untuk senjata sci-fi) */
export function drawCyberGrip(c: CanvasRenderingContext2D, cx: number, y: number, color: string, t = 0) {
  drawModernGrip(c, cx, y, color, 'g10');
  c.save();
  const pulse = 0.55 + 0.45 * Math.sin(t * 6);
  c.shadowColor = color;
  c.shadowBlur = 8 * pulse;
  c.strokeStyle = color;
  c.lineWidth = 1.4;
  c.globalAlpha = 0.55 + 0.4 * pulse;
  // garis LED vertikal di sisi grip
  c.beginPath();
  c.moveTo(cx + 3, y + 50);
  c.quadraticCurveTo(cx + 4, y + 78, cx + 8, y + 96);
  c.stroke();
  c.restore();
}
