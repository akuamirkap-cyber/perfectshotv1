import type { ProjKind } from '../weapons';
import { TAU, rand, lin, radial } from './kit';

import { drawProjectileExtra2 } from './projectiles3';

type C = CanvasRenderingContext2D;
export const SNOWBALL_RADIUS = 16; // Twice the former 8px snowball, before any stage size buff.

/** A round, deep vortex medallion: its light is part of the shot, not a trailing stem. */
function portalDisc(c: C, t: number) {
  const blue = Math.floor(t * 0.7) % 2 === 0;
  const rim = blue ? '#50bdff' : '#ffb053';
  const counter = blue ? '#ffad54' : '#64d4ff';
  c.save();
  c.translate(0, 11);
  c.scale(1, 1.18);
  const halo = c.createRadialGradient(0, 0, 5, 0, 0, 23);
  halo.addColorStop(0, blue ? 'rgba(56,189,248,0.3)' : 'rgba(251,146,60,0.3)');
  halo.addColorStop(1, 'rgba(56,189,248,0)');
  c.fillStyle = halo;
  c.beginPath(); c.arc(0, 0, 23, 0, TAU); c.fill();

  const depth = c.createRadialGradient(-3, -4, 1, 0, 0, 12.5);
  depth.addColorStop(0, '#405894');
  depth.addColorStop(0.32, '#162750');
  depth.addColorStop(0.72, '#07132e');
  depth.addColorStop(1, '#06101c');
  c.fillStyle = depth;
  c.beginPath(); c.arc(0, 0, 11.2, 0, TAU); c.fill();

  // The swirl is INSIDE the rim, so the shot reads as a tiny portal at any angle.
  c.save();
  c.beginPath(); c.arc(0, 0, 9.3, 0, TAU); c.clip();
  c.rotate(t * 2.4);
  for (let i = 0; i < 3; i++) {
    c.rotate(TAU / 3);
    c.strokeStyle = i === 1 ? 'rgba(255,176,91,0.73)' : 'rgba(122,224,255,0.78)';
    c.lineWidth = i === 1 ? 1.4 : 1.7;
    c.lineCap = 'round';
    c.beginPath(); c.arc(1.5, 0, 6.4, -0.8, 1.65); c.stroke();
  }
  c.restore();
  c.fillStyle = '#e7f8ff';
  c.beginPath(); c.arc(-1, -1, 1.7, 0, TAU); c.fill();

  c.shadowColor = rim;
  c.shadowBlur = 12;
  c.lineWidth = 3.3;
  c.strokeStyle = rim;
  c.beginPath(); c.arc(0, 0, 12.3, 0, TAU); c.stroke();
  c.shadowBlur = 0;
  c.lineWidth = 1;
  c.strokeStyle = 'rgba(226,249,255,0.9)';
  c.beginPath(); c.arc(0, 0, 10.4, -2.7, -0.75); c.stroke();
  c.strokeStyle = counter;
  c.lineWidth = 2.8;
  c.lineCap = 'round';
  c.beginPath(); c.arc(0, 0, 12.3, t * 2.4, t * 2.4 + 0.95); c.stroke();
  c.beginPath(); c.arc(0, 0, 12.3, t * 2.4 + Math.PI, t * 2.4 + Math.PI + 0.52); c.stroke();
  c.restore();
}

/** Snow, not a second ball on a stick: one softly shaded 32px sphere. */
function snowSphere(c: C, y: number, embedded: boolean) {
  const r = SNOWBALL_RADIUS;
  c.save();
  if (!embedded) { c.shadowColor = 'rgba(168,226,255,0.75)'; c.shadowBlur = 9; }
  const snow = c.createRadialGradient(-r * 0.35, y - r * 0.38, 1, 0, y, r * 1.12);
  snow.addColorStop(0, '#ffffff');
  snow.addColorStop(0.37, '#fbfeff');
  snow.addColorStop(0.74, '#eef7fa');
  snow.addColorStop(1, '#d3e5eb');
  c.fillStyle = snow;
  c.beginPath(); c.arc(0, y, r, 0, TAU); c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = embedded ? 'rgba(167,194,203,0.7)' : 'rgba(155,189,201,0.7)';
  c.lineWidth = embedded ? 1.4 : 1.1; c.stroke();
  c.clip();
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.beginPath(); c.ellipse(-5.5, y - 5, 4.3, 2.1, -0.5, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(171,198,208,0.3)'; c.lineWidth = 1.2;
  c.beginPath(); c.arc(3, y + 3, 6.5, 0.15, 1.85); c.stroke();
  c.beginPath(); c.arc(-6, y + 3, 3, 2.6, 4.5); c.stroke();
  for (const [x, dy, size] of [[-7, 5, 1.3], [4, -5, 1.2], [7, 6, 1.1], [-1, 8, 0.8]]) {
    c.fillStyle = 'rgba(170,200,208,0.43)';
    c.beginPath(); c.arc(x, y + dy, size, 0, TAU); c.fill();
  }
  c.restore();
}

function snowballShot(c: C, embedded: boolean) {
  const r = SNOWBALL_RADIUS;
  if (!embedded) { snowSphere(c, r, false); return; }
  // y=0 is the surface. Only the outer hemisphere survives impact; the
  // flattened snow crust and tiny fractures make its entry feel physical.
  c.save();
  c.beginPath(); c.rect(-r - 3, 0, 2 * (r + 3), r + 5); c.clip();
  snowSphere(c, 0, true);
  c.restore();
  const slush = c.createLinearGradient(0, -1, 0, 5);
  slush.addColorStop(0, '#ffffff'); slush.addColorStop(1, '#e3f0f3');
  c.fillStyle = slush;
  c.beginPath(); c.ellipse(0, 1.5, r + 1, 2.8, 0, 0, TAU); c.fill();
  // Subtle packed-snow creases, not the dark angular facets of cracked ice.
  c.strokeStyle = 'rgba(171,199,207,0.5)'; c.lineWidth = 1;
  c.beginPath();
  c.moveTo(-9, 5); c.quadraticCurveTo(-5, 6, -3, 9);
  c.moveTo(8, 5); c.quadraticCurveTo(4, 6, 3, 10);
  c.stroke();
  c.fillStyle = '#ffffff';
  for (const [x, y, size] of [[-12, 4, 1.7], [11, 5, 2], [0, 14, 1.1], [-6, 12, 1.2]]) {
    c.beginPath(); c.arc(x, y, size, 0, TAU); c.fill();
  }
}

function glowE(c: C, y: number, rx: number, ry: number, rgb: string, a: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, y, 1, 0, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, y, rx, ry, 0, 0, TAU);
  c.fill();
  c.restore();
}

function bullet(c: C, len: number, w: number, tip: string[], body: string[], rim: string) {
  const head = len * 0.36;
  c.beginPath();
  c.moveTo(-w / 2, head);
  c.lineTo(-w / 2, 6);
  c.quadraticCurveTo(-w / 2, -1, 0, -2);
  c.quadraticCurveTo(w / 2, -1, w / 2, 6);
  c.lineTo(w / 2, head);
  c.closePath();
  c.fillStyle = lin(c, -w / 2, w / 2, tip);
  c.fill();
  c.fillStyle = lin(c, -w / 2, w / 2, body);
  c.fillRect(-w / 2 - 0.5, head, w + 1, len - head - 3);
  c.fillStyle = rim;
  c.fillRect(-w / 2 - 1.2, len - 3, w + 2.4, 3);
}

export function drawProjectileExtra(c: C, kind: ProjKind, len: number, t: number, age: number, embedded = false) {
  if ((kind as string) === 'slingshot' && len < 999) {
    drawProjectileExtra2(c, kind, len, t, age);
    return;
  }
  switch (kind) {
    case 'slingshot': {
      c.beginPath();
      c.moveTo(0, -1);
      c.bezierCurveTo(8, 0, 9, len * 0.7, 3, len);
      c.lineTo(-3, len);
      c.bezierCurveTo(-9, len * 0.7, -8, 0, 0, -1);
      c.fillStyle = radial(c, -2, len * 0.3, len * 0.8, ['#e7e5e4', '#a8a29e', '#57534e']);
      c.fill();
      c.strokeStyle = '#44403c';
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.beginPath();
      c.ellipse(-2.5, len * 0.3, 1.5, 3, 0.3, 0, TAU);
      c.fill();
      break;
    }
    case 'blowgun': {
      c.fillStyle = lin(c, -1, 1, ['#525252', '#f5f5f5', '#525252']);
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(1, 4);
      c.lineTo(0.8, len - 12);
      c.lineTo(-0.8, len - 12);
      c.lineTo(-1, 4);
      c.closePath();
      c.fill();
      c.fillStyle = 'rgba(132,204,22,0.8)';
      c.fillRect(-1, 0, 2, 7);
      // kapok tuft
      c.beginPath();
      c.moveTo(0, len - 14);
      c.quadraticCurveTo(6, len - 6, 3, len);
      c.lineTo(-3, len);
      c.quadraticCurveTo(-6, len - 6, 0, len - 14);
      c.fillStyle = radial(c, 0, len - 6, 7, ['#ffffff', '#fef3c7', '#dc2626']);
      c.fill();
      break;
    }
    case 'shotgun': {
      // 12-gauge shell
      c.fillStyle = lin(c, -5, 5, ['#7f1d1d', '#ef4444', '#991b1b']);
      c.beginPath();
      c.roundRect(-5, 0, 10, len - 10, [3, 3, 0, 0]);
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.3)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-2, 1);
      c.lineTo(0, 4);
      c.lineTo(2, 1);
      c.stroke();
      c.fillStyle = lin(c, -5.5, 5.5, ['#8c5e10', '#ffe695', '#8c5e10']);
      c.fillRect(-5.5, len - 11, 11, 8);
      c.fillStyle = '#c08a24';
      c.fillRect(-6.5, len - 3, 13, 3);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      c.fillRect(-3, 2, 1.2, len - 14);
      break;
    }
    case 'sniper':
      bullet(c, len, 7, ['#7a3212', '#f6b07a', '#7a3212'], ['#8c5e10', '#ffe695', '#8c5e10'], '#c08a24');
      c.fillStyle = '#111';
      c.fillRect(-3.5, len * 0.36, 7, 1.5);
      break;
    case 'minigun':
      bullet(c, len, 6.5, ['#6e300e', '#e89a5a', '#6e300e'], ['#8c5e10', '#f5d77a', '#8c5e10'], '#a87818');
      c.fillStyle = '#374151';
      c.fillRect(-4.5, len - 9, 9, 2.5);
      break;
    case 'railgun': {
      glowE(c, len / 2, 8, len * 0.6, '56,189,248', 0.55);
      c.fillStyle = lin(c, -2.5, 2.5, ['#334155', '#f1f5f9', '#475569']);
      c.fillRect(-2.5, 0, 5, len);
      c.save();
      c.shadowColor = '#38bdf8';
      c.shadowBlur = 10;
      c.strokeStyle = '#7dd3fc';
      c.lineWidth = 1.3;
      for (let i = 0; i < 4; i++) {
        const y = ((t * 60 + i * (len / 4)) % len);
        c.beginPath();
        c.ellipse(0, y, 5, 1.6, 0, 0, TAU);
        c.stroke();
      }
      c.restore();
      c.fillStyle = '#fff';
      c.beginPath();
      c.moveTo(-2.5, 2);
      c.lineTo(0, -3);
      c.lineTo(2.5, 2);
      c.fill();
      break;
    }
    case 'flamethrower':
    case 'dragon': {
      const isDragon = kind === 'dragon';
      glowE(c, len * 0.38, isDragon ? 21 : 12, len * 0.75, '255,120,30', 0.68);
      const flicker = Math.sin(t * 24) * 2;
      c.save(); c.globalCompositeOperation = 'lighter';
      const outer = c.createLinearGradient(0, 0, 0, len + 16);
      outer.addColorStop(0, '#fffbd4'); outer.addColorStop(0.27, '#ffb839');
      outer.addColorStop(0.6, '#ef5b26'); outer.addColorStop(1, 'rgba(185,28,28,0)');
      c.fillStyle = outer;
      c.beginPath(); c.moveTo(0, -6);
      c.bezierCurveTo(12, 6, 8, len * 0.44, 6, len * 0.55);
      c.quadraticCurveTo(13, len * 0.57, 7, len + 12);
      c.quadraticCurveTo(3, len * 0.75, 1, len * 0.74);
      c.quadraticCurveTo(-4, len + 14, -7, len + 7);
      c.quadraticCurveTo(-5, len * 0.65, -8, len * 0.57);
      c.bezierCurveTo(-13, len * 0.38, -11, 8, 0, -6);
      c.closePath(); c.fill();
      const core = c.createLinearGradient(0, 0, 0, len);
      core.addColorStop(0, '#ffffff'); core.addColorStop(0.4, '#fff5c0');
      core.addColorStop(1, 'rgba(255,183,53,0)');
      c.fillStyle = core;
      c.beginPath(); c.moveTo(0, -3);
      c.bezierCurveTo(5, 3, 4 + flicker * 0.3, len * 0.4, 1, len * 0.6);
      c.quadraticCurveTo(-5, len * 0.41, -5, 7);
      c.closePath(); c.fill();
      if (isDragon) {
        for (const side of [-1, 1]) {
          c.fillStyle = 'rgba(255,156,44,0.64)'; c.beginPath();
          c.moveTo(side * 6, 11);
          c.quadraticCurveTo(side * 18, len * 0.33, side * (13 + flicker), len * 0.7);
          c.quadraticCurveTo(side * 12, len * 0.36, side * 5, 20); c.closePath(); c.fill();
        }
        c.fillStyle = '#ffe9a3';
        for (const [x, y, size] of [[-11, len * 0.42, 1.6], [13, len * 0.7, 1.8]]) {
          c.beginPath(); c.arc(x, y, size, 0, TAU); c.fill();
        }
      }
      c.restore();
      break;
    }
    case 'bamboo': {
      // petasan (firecracker)
      c.fillStyle = lin(c, -5, 5, ['#7f1d1d', '#ef4444', '#991b1b']);
      c.fillRect(-5, 4, 10, len - 4);
      c.fillStyle = '#facc15';
      c.fillRect(-5, 9, 10, 3);
      c.fillRect(-5, len - 9, 10, 3);
      c.fillStyle = '#fef3c7';
      c.font = 'bold 6px serif';
      c.textAlign = 'center';
      c.fillText('福', 0, len * 0.55);
      c.fillStyle = '#e7e5e4';
      c.fillRect(-5, 1, 10, 4);
      c.strokeStyle = '#78716c';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, 1);
      c.quadraticCurveTo(3, -3, 1, -6);
      c.stroke();
      if (age < 0.05 || Math.sin(t * 40) > 0) {
        c.fillStyle = '#fde047';
        c.beginPath();
        c.arc(1, -6, 1.6, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'banana': {
      // Slide #7 Weapon #6 (Banana Gun) BANANA FLESH — cream, tapered, launched from the peel
      c.save();
      const px = (x7: number) => x7 * 0.88;
      const py = (y7: number) => -2 + ((y7 + 34) / 64) * (len + 2);

      c.beginPath();
      c.moveTo(px(-7), py(26));
      c.quadraticCurveTo(px(-13), py(-4), px(-5), py(-26));
      c.quadraticCurveTo(px(-1), py(-35), px(3), py(-33));
      c.quadraticCurveTo(px(10), py(-17), px(9), py(5));
      c.quadraticCurveTo(px(8), py(21), px(1), py(30));
      c.closePath();

      const fg = c.createLinearGradient(px(-12), 0, px(10), 0);
      fg.addColorStop(0, '#dccf9a');
      fg.addColorStop(0.3, '#f7efc9');
      fg.addColorStop(0.55, '#fffdf2');
      fg.addColorStop(0.8, '#f3e9bd');
      fg.addColorStop(1, '#d8ca94');
      c.fillStyle = fg;
      c.fill();
      c.strokeStyle = '#c9b877';
      c.lineWidth = 1.1;
      c.stroke();

      // Longitudinal flesh ridges (Slide #7)
      c.strokeStyle = 'rgba(190,166,100,0.6)';
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(px(-4), py(22));
      c.quadraticCurveTo(px(-8), py(-6), px(-2), py(-26));
      c.moveTo(px(3), py(24));
      c.quadraticCurveTo(px(7), py(-6), px(4), py(-27));
      c.stroke();

      // Tiny seed dots (Slide #7)
      c.fillStyle = 'rgba(122,92,32,0.5)';
      for (const [sx, sy] of [
        [1, -12],
        [0, 0],
        [2, 12],
      ] as const) {
        c.beginPath();
        c.arc(px(sx), py(sy), 0.9, 0, TAU);
        c.fill();
      }

      // Little brown peel nub where the flesh was torn off (Slide #7)
      c.fillStyle = '#8a5a1a';
      c.beginPath();
      c.arc(px(-1), py(30), 2.3, 0, TAU);
      c.fill();

      // Soft highlight (Slide #7)
      c.strokeStyle = 'rgba(255,255,255,0.5)';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(px(-5), py(20));
      c.quadraticCurveTo(px(-10), py(-4), px(-4), py(-22));
      c.stroke();

      if (embedded) {
        // Surface at 50% of the length: the rest remains visibly OUTSIDE.
        const y = len * 0.5;
        c.fillStyle = 'rgba(255,243,199,0.9)';
        c.beginPath();
        c.ellipse(0.5, y, 8.5, 2.6, -0.1, 0, TAU);
        c.fill();
      }
      c.restore();
      break;
    }
    case 'magnet': {
      c.save();
      // Stuck magnet on the wheel is 2x larger ("magnet yg nempel diroda lebih besar 2x")
      const mScale = embedded ? 2 : 1;
      c.scale(mScale, mScale);
      const outerR = 9.5;
      const innerR = 4.2;
      const archY = 14;
      const tipY = 0;

      // 3D Crimson Horseshoe Magnet U-body
      c.beginPath();
      c.moveTo(-outerR, tipY);
      c.lineTo(-outerR, archY);
      c.arc(0, archY, outerR, Math.PI, 0, true);
      c.lineTo(outerR, tipY);
      c.lineTo(innerR, tipY);
      c.lineTo(innerR, archY);
      c.arc(0, archY, innerR, 0, Math.PI, false);
      c.lineTo(-innerR, tipY);
      c.closePath();
      c.fillStyle = lin(c, -outerR, outerR, ['#7f1d1d', '#ef4444', '#f87171', '#dc2626', '#991b1b']);
      c.fill();
      c.strokeStyle = '#2a0606';
      c.lineWidth = 1.1;
      c.stroke();

      // Specular highlight along the U-arch
      c.strokeStyle = 'rgba(255,225,225,0.5)';
      c.lineWidth = 1.1;
      c.beginPath();
      c.arc(0, archY, (outerR + innerR) * 0.5, Math.PI * 0.85, Math.PI * 0.15, true);
      c.stroke();

      // Gold separator bands & polished silver-chrome pole tips
      const armW = outerR - innerR;
      for (const [ax, label] of [
        [-outerR, 'N'],
        [innerR, 'S'],
      ] as const) {
        c.fillStyle = '#fbbf24';
        c.fillRect(ax, tipY + 4.2, armW, 1.5);
        c.fillStyle = lin(c, ax, ax + armW, ['#64748b', '#f8fafc', '#cbd5e1', '#475569']);
        c.fillRect(ax - 0.2, tipY - 2, armW + 0.4, 6.2);
        c.strokeStyle = '#0f172a';
        c.lineWidth = 0.9;
        c.strokeRect(ax - 0.2, tipY - 2, armW + 0.4, 6.2);
        c.fillStyle = label === 'N' ? '#dc2626' : '#1d4ed8';
        c.font = 'bold 4.2px sans-serif';
        c.textAlign = 'center';
        c.fillText(label, ax + armW * 0.5, tipY + 2.6);
      }
      c.restore();
      break;
    }
    case 'bubble': {
      c.save();
      c.translate(0, len * 0.42);
      const r = Math.min(10, len * 0.42);
      const wob = 1 + 0.05 * Math.sin(t * 9);
      c.scale(wob, 2 - wob);
      const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
      g.addColorStop(0, 'rgba(255,255,255,0.7)');
      g.addColorStop(0.6, 'rgba(200,230,255,0.15)');
      g.addColorStop(0.85, 'rgba(255,170,230,0.45)');
      g.addColorStop(1, 'rgba(150,240,255,0.7)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(-r * 0.3, -r * 0.3, r * 0.45, Math.PI, Math.PI * 1.6);
      c.stroke();
      c.restore();
      break;
    }
    case 'shrink':
    case 'grow': {
      const isG = kind === 'grow';
      const rgb = isG ? '251,146,60' : '74,222,128';
      const w = isG ? 6.5 : 3.5;
      glowE(c, len / 2, w + 6, len * 0.6, rgb, 0.55);
      c.save();
      c.shadowColor = `rgb(${rgb})`;
      c.shadowBlur = 10;
      c.fillStyle = `rgb(${rgb})`;
      c.beginPath();
      c.roundRect(-w, -1, w * 2, len, w);
      c.fill();
      c.restore();
      c.fillStyle = '#fff';
      c.beginPath();
      c.roundRect(-w * 0.4, 2, w * 0.8, len - 6, w * 0.4);
      c.fill();
      c.strokeStyle = `rgba(${rgb},0.9)`;
      c.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const k = ((t * 2 + i / 3) % 1);
        const s = isG ? 0.5 + k : 1.5 - k;
        c.beginPath();
        c.ellipse(0, len * 0.4, (w + 3) * s, 2 * s, 0, 0, TAU);
        c.stroke();
      }
      break;
    }
    case 'harpoon': {
      c.fillStyle = lin(c, -1.5, 1.5, ['#64748b', '#f8fafc', '#64748b']);
      c.fillRect(-1.5, 6, 3, len - 6);
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(4, 7);
      c.lineTo(-4, 7);
      c.closePath();
      c.fillStyle = '#e2e8f0';
      c.fill();
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(1, 8);
      c.lineTo(5, 15);
      c.moveTo(-1, 8);
      c.lineTo(-5, 15);
      c.stroke();
      c.beginPath();
      c.arc(0, len - 2, 2.5, 0, TAU);
      c.strokeStyle = '#94a3b8';
      c.stroke();
      break;
    }
    case 'soaker': {
      // A translucent bead with a moving-looking reflection, not a blue
      // energy round capped by a smaller ball like a tadpole's head and stem.
      const water = c.createRadialGradient(-2.8, 3, 0, 0, 9, 10);
      water.addColorStop(0, 'rgba(255,255,255,0.98)');
      water.addColorStop(0.28, 'rgba(215,252,255,0.94)');
      water.addColorStop(0.67, 'rgba(69,199,235,0.76)');
      water.addColorStop(1, 'rgba(14,129,195,0.42)');
      c.shadowColor = '#5bd7f5'; c.shadowBlur = 8;
      c.fillStyle = water;
      c.beginPath(); c.ellipse(0, 9, 7.3, 9, -0.12, 0, TAU); c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = 'rgba(218,250,255,0.84)'; c.lineWidth = 1.2;
      c.beginPath(); c.ellipse(0, 9, 6.7, 8.2, -0.12, -2.8, 0.55); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.88)';
      c.beginPath(); c.ellipse(-2.8, 4.7, 1.4, 2.9, -0.35, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(231,253,255,0.75)'; c.lineWidth = 0.9;
      c.beginPath(); c.arc(1.5, 10, 3.9, 0.1, 1.75); c.stroke();
      break;
    }
    case 'snowball':
      snowballShot(c, embedded);
      break;
    case 'pirate': {
      const r = Math.min(8, len * 0.4);
      c.beginPath();
      c.arc(0, r, r, 0, TAU);
      c.fillStyle = radial(c, 0, r, r, ['#9ca3af', '#374151', '#030712']);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.beginPath();
      c.arc(-2.5, r - 2.5, 2, 0, TAU);
      c.fill();
      if (len > 2 * r) {
        c.fillStyle = 'rgba(120,120,120,0.35)';
        c.fillRect(-r * 0.6, r * 2 - 1, r * 1.2, len - r * 2);
      }
      break;
    }
    case 'chicken': {
      // Twice the original chick's width AND almost twice its length. Its
      // actual 12px collision half-width matches the oversized rubber body.
      c.save();
      const wobble = embedded ? 0 : Math.sin(t * 19) * 1.1;
      c.strokeStyle = '#b76616'; c.lineWidth = 2.5;
      for (const side of [-1, 1]) {
        c.beginPath(); c.moveTo(side * 6, len * 0.83);
        c.lineTo(side * (7 + wobble), len + 3);
        c.lineTo(side * 13, len + 6); c.stroke();
      }
      c.fillStyle = '#ebaa27'; c.beginPath();
      c.moveTo(5, len * 0.65); c.quadraticCurveTo(18, len * 0.77, 17, len * 0.46);
      c.quadraticCurveTo(22, len * 0.84, 10, len * 0.92); c.fill();
      c.beginPath(); c.ellipse(0, len * 0.63, 12, len * 0.35, 0, 0, TAU);
      c.fillStyle = lin(c, -13, 13, ['#c48c22', '#ffdf5c', '#fff4a3', '#e5ad30']);
      c.fill(); c.strokeStyle = '#a36517'; c.lineWidth = 1.3; c.stroke();
      c.fillStyle = 'rgba(255,255,226,0.72)';
      c.beginPath(); c.ellipse(-4, len * 0.51, 2.3, len * 0.22, 0, 0, TAU); c.fill();
      for (const side of [-1, 1]) {
        c.fillStyle = '#f7c244'; c.beginPath();
        c.ellipse(side * 10, len * 0.57, 6, 13, side * 0.29, 0, TAU); c.fill();
        c.strokeStyle = '#ac701b'; c.lineWidth = 1; c.stroke();
        c.strokeStyle = 'rgba(255,250,206,0.84)';
        c.beginPath(); c.moveTo(side * 8, len * 0.48);
        c.quadraticCurveTo(side * 14, len * 0.6, side * 8, len * 0.69); c.stroke();
      }
      c.fillStyle = '#ffe469'; c.beginPath(); c.ellipse(0, 13, 10, 14, 0, 0, TAU); c.fill();
      c.strokeStyle = '#a36517'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#e13d31';
      for (let i = -1; i <= 1; i++) {
        c.beginPath(); c.arc(i * 4.8, 0 - (i === 0 ? 3 : 0), 4, 0, TAU); c.fill();
      }
      c.fillStyle = '#ef7c24'; c.beginPath();
      c.moveTo(-5, 9); c.lineTo(5, 9); c.lineTo(0, -5); c.closePath(); c.fill();
      c.strokeStyle = '#b65315'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#38251c';
      for (const side of [-1, 1]) {
        c.beginPath(); c.arc(side * 5, 14, 1.7, 0, TAU); c.fill();
      }
      c.fillStyle = '#ed6251'; c.beginPath(); c.ellipse(10, 24, 2.3, 4, 0, 0, TAU); c.fill();
      c.restore(); break;
    }
    case 'card': {
      // CARD 1.8X BIGGER!
      c.save();
      c.scale(1.8, 1.8);
      c.beginPath();
      c.roundRect(-4.5, 0, 9, len / 1.8 - 2, 1.5);
      c.fillStyle = '#ffffff';
      c.fill();
      c.strokeStyle = '#a1a1aa';
      c.lineWidth = 0.8;
      c.stroke();
      c.fillStyle = '#dc2626';
      c.font = 'bold 8px serif';
      c.textAlign = 'center';
      c.fillText('A', 0, 8);
      c.fillText('♥', 0, (len / 1.8) * 0.62);
      c.fillStyle = 'rgba(0,0,0,0.08)';
      c.fillRect(1.5, 0, 3, len / 1.8 - 2);
      c.restore();
      break;
    }
    case 'confetti': {
      // party popper
      c.beginPath();
      c.moveTo(-6, 4);
      c.lineTo(6, 4);
      c.lineTo(1.5, len);
      c.lineTo(-1.5, len);
      c.closePath();
      c.fillStyle = lin(c, -6, 6, ['#be185d', '#f472b6', '#db2777']);
      c.fill();
      c.fillStyle = '#facc15';
      c.fillRect(-4.5, 12, 9, 2.5);
      c.fillRect(-3, 22, 6, 2.5);
      const cc = ['#f43f5e', '#facc15', '#22d3ee', '#4ade80', '#a855f7'];
      for (let i = 0; i < 6; i++) {
        c.save();
        c.translate(-5 + i * 2, 2 + Math.sin(t * 8 + i) * 2 - (i % 2) * 3);
        c.rotate(t * 3 + i);
        c.fillStyle = cc[i % 5];
        c.fillRect(-1.5, -1, 3, 2);
        c.restore();
      }
      break;
    }
    case 'seed': {
      const grow = Math.min(1, Math.max(0, (age - 0.2) / 1.4));
      // seed
      c.beginPath();
      c.moveTo(0, len - 18);
      c.bezierCurveTo(5, len - 12, 5, len - 4, 0, len);
      c.bezierCurveTo(-5, len - 4, -5, len - 12, 0, len - 18);
      c.fillStyle = lin(c, -5, 5, ['#451a03', '#a16207', '#78350f']);
      c.fill();
      c.strokeStyle = 'rgba(254,243,199,0.5)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(0, len - 16);
      c.lineTo(0, len - 2);
      c.stroke();
      if (age > 50 || grow <= 0) {
        // flying: show little sprout tip
        c.fillStyle = '#4ade80';
        c.beginPath();
        c.ellipse(0, len - 21, 2, 4, 0, 0, TAU);
        c.fill();
        c.fillStyle = 'rgba(132,204,22,0.4)';
        c.fillRect(-0.8, 0, 1.6, len - 22);
        break;
      }
      // stem
      const top = len - 18 - (len - 22) * grow;
      c.strokeStyle = '#16a34a';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, len - 18);
      c.quadraticCurveTo(Math.sin(t * 2) * 3, (top + len - 18) / 2, 0, top);
      c.stroke();
      c.fillStyle = '#4ade80';
      c.beginPath();
      c.ellipse(-4, (top + len) / 2, 4 * grow, 2 * grow, -0.6, 0, TAU);
      c.ellipse(4, (top + len) / 2 + 5, 4 * grow, 2 * grow, 0.6, 0, TAU);
      c.fill();
      if (grow >= 1) {
        const bloom = Math.min(1, (age - 1.6) * 3);
        if (bloom > 0) {
          c.save();
          c.translate(0, top);
          c.rotate(t);
          for (let i = 0; i < 6; i++) {
            c.rotate(TAU / 6);
            c.beginPath();
            c.ellipse(0, -4.5 * bloom, 2.6 * bloom, 4.5 * bloom, 0, 0, TAU);
            c.fillStyle = i % 2 ? '#f472b6' : '#fb7185';
            c.fill();
          }
          c.beginPath();
          c.arc(0, 0, 2.6 * bloom, 0, TAU);
          c.fillStyle = '#facc15';
          c.fill();
          c.restore();
        }
      }
      break;
    }
    case 'gravity': {
      glowE(c, 9, 12, 14, '129,140,248', 0.5);
      c.beginPath();
      c.arc(0, 9, 6, 0, TAU);
      c.fillStyle = radial(c, 0, 9, 6, ['#e0e7ff', '#6366f1', '#1e1b4b']);
      c.fill();
      c.save();
      c.translate(0, 9);
      c.rotate(-0.4);
      c.strokeStyle = 'rgba(199,210,254,0.9)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, 0, 10, 3, 0, 0, TAU);
      c.stroke();
      c.restore();
      const ma = t * 5;
      c.fillStyle = '#e0e7ff';
      c.beginPath();
      c.arc(Math.cos(ma) * 10, 9 + Math.sin(ma) * 3, 1.3, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(129,140,248,0.6)';
      c.fillRect(-1, 16, 2, len - 16);
      break;
    }
    case 'pizza': {
      c.beginPath();
      c.moveTo(0, -2);
      c.lineTo(9, len - 6);
      c.quadraticCurveTo(0, len + 1, -9, len - 6);
      c.closePath();
      c.fillStyle = '#fbbf24';
      c.fill();
      c.strokeStyle = '#b45309';
      c.lineWidth = 1;
      c.stroke();
      c.beginPath();
      c.moveTo(9, len - 6);
      c.quadraticCurveTo(0, len + 1, -9, len - 6);
      c.quadraticCurveTo(0, len - 3, 9, len - 6);
      c.lineWidth = 4;
      c.strokeStyle = '#d97706';
      c.stroke();
      c.fillStyle = '#b91c1c';
      for (const [px, py] of [[0, len * 0.35], [-3, len * 0.62], [3.5, len * 0.7]]) {
        c.beginPath();
        c.arc(px, py, 2.3, 0, TAU);
        c.fill();
      }
      c.fillStyle = '#16a34a';
      c.fillRect(2, len * 0.45, 2, 1.5);
      c.fillRect(-4, len * 0.48, 2, 1.5);
      break;
    }
    default: {
      void portalDisc;
      drawProjectileExtra2(c, kind, len, t, age, embedded);
    }
  }
}
