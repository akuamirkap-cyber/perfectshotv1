import type { ProjKind } from '../weapons';
import { TAU, rand, lin, radial, star, gunState } from './kit';
import { drawFirework8Projectile } from '../firework8fx';
import { drawSlide6Yoyo, drawYoyoSlideStuckSpinFx } from '../yoyoSlideFx';
import { drawKerisSlideProjectile } from '../kerisSlideFx';
import { drawSlide2DiamondBullet } from '../diamondSlideFx';

import { drawProjectileExtra3 } from './projectiles4';

type C = CanvasRenderingContext2D;

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

const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'];

export function drawProjectileExtra2(c: C, kind: ProjKind, len: number, t: number, age: number, embedded = false) {
  switch (kind) {
    case 'honey': {
      if (embedded) {
        // The bead's middle sits ON the surface (the shot origin is half a
        // bullet inside it). Drips point outward and stay with the board.
        const y = len * 0.5;
        c.fillStyle = 'rgba(117,57,8,0.62)';
        c.beginPath(); c.ellipse(0, y, 12, 6, 0, 0, TAU); c.fill();
        c.beginPath(); c.moveTo(-12, y);
        c.bezierCurveTo(-12, y - 8, -6, y - 8, -4, y - 7);
        c.quadraticCurveTo(3, y - 11, 8, y - 5);
        c.bezierCurveTo(14, y, 9, y + 5, 5, y + 8);
        c.quadraticCurveTo(3, y + 17, 1, y + 17);
        c.quadraticCurveTo(-1, y + 17, -1, y + 10);
        c.quadraticCurveTo(-9, y + 10, -12, y); c.closePath();
        c.fillStyle = radial(c, -3, y - 3, 17, ['#fff1ab', '#fbbf24', '#c0750c', '#884008']);
        c.fill();
        c.strokeStyle = '#9a5008'; c.lineWidth = 0.85; c.stroke();
        c.fillStyle = 'rgba(255,255,218,0.86)';
        c.beginPath(); c.ellipse(-4, y - 3, 4, 1.8, -0.25, 0, TAU); c.fill();
        c.fillStyle = '#efac19';
        for (const [x, dy, r] of [[-13, 4, 2.4], [12, 5, 2.1], [6, 13, 1.8]]) {
          c.beginPath(); c.arc(x, y + dy, r, 0, TAU); c.fill();
        }
      } else {
        // A cohesive, viscous droplet with a stretching syrup tail; no
        // metallic cartridge, white laser wedge, or blue water spray.
        c.beginPath(); c.moveTo(0, -4);
        c.bezierCurveTo(10, -1, 11, 12, 6, 19);
        c.bezierCurveTo(3, 24, 3, len * 0.72, 1, len + 3);
        c.quadraticCurveTo(-1, len + 4, -2, len * 0.76);
        c.bezierCurveTo(-5, 23, -10, 21, -10, 12);
        c.bezierCurveTo(-10, 2, -5, -4, 0, -4); c.closePath();
        c.fillStyle = radial(c, -2, 8, 26, ['#fff5bf', '#f9bb35', '#c4710c', '#85400c']);
        c.fill(); c.strokeStyle = '#9b5510'; c.lineWidth = 0.8; c.stroke();
        c.strokeStyle = 'rgba(255,255,216,0.83)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-4, 1); c.bezierCurveTo(-8, 7, -7, 15, -4, 18); c.stroke();
        c.fillStyle = '#f4ad19';
        for (const [x, y, r] of [[-10, 22, 2.2], [9, 27, 1.7]]) {
          c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
        }
      }
      break;
    }
    case 'coconut': {
      const r = Math.min(9, len * 0.4);
      c.beginPath();
      c.arc(0, r, r, 0, TAU);
      c.fillStyle = radial(c, 0, r, r, ['#bef264', '#65a30d', '#365314']);
      c.fill();
      c.strokeStyle = '#1a2e05';
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.beginPath();
      c.ellipse(-3, r - 3, 2, 3, 0.4, 0, TAU);
      c.fill();
      c.fillStyle = '#f7fee7';
      c.beginPath();
      c.ellipse(0, 2, 3.5, 1.8, 0, 0, TAU);
      c.fill();
      c.strokeStyle = '#f43f5e';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(1, 2);
      c.lineTo(4, -6);
      c.stroke();
      if (len > r * 2) {
        c.fillStyle = 'rgba(217,249,157,0.45)';
        c.fillRect(-2, r * 2, 4, len - r * 2);
      }
      break;
    }
    case 'angklung': {
      glowE(c, len * 0.4, 9, len * 0.5, '253,230,138', 0.45);
      // eighth note ♪
      c.fillStyle = lin(c, -5, 5, ['#92400e', '#fde68a', '#b45309']);
      c.beginPath();
      c.ellipse(-1, len - 6, 5.5, 4, -0.4, 0, TAU);
      c.fill();
      c.fillRect(3, 2, 2, len - 8);
      c.beginPath();
      c.moveTo(5, 2);
      c.quadraticCurveTo(12, 8 + Math.sin(t * 10) * 2, 9, 16);
      c.quadraticCurveTo(10, 10, 5, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = '#451a03';
      c.lineWidth = 0.8;
      c.stroke();
      break;
    }
    case 'bee': {
      // The hornet flies stinger-first. When embedded the tip is drawn well
      // inside the target, the base at the surface, and its head remains out.
      const tip = embedded ? len * 0.35 : 0;
      c.save();
      if (!embedded) c.translate(Math.sin(t * 38) * 0.7, 0);
      if (embedded) {
        // Tiny amber puncture halo straddles the exact surface, while the
        // needle's sharp point reaches farther INSIDE the board than the halo.
        const surface = len * 0.5;
        c.strokeStyle = 'rgba(255,203,92,0.8)'; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(0, surface, 8, 3, 0, 0, TAU); c.stroke();
        c.fillStyle = '#ffe18d';
        for (const side of [-1, 1]) {
          c.beginPath(); c.arc(side * 9, surface - 3, 1.3, 0, TAU); c.fill();
        }
      }
      c.strokeStyle = '#322115'; c.lineWidth = 1.4; c.lineCap = 'round';
      for (const side of [-1, 1]) {
        c.beginPath(); c.moveTo(side * 3.6, tip + 26);
        c.lineTo(side * 8, tip + 30); c.lineTo(side * 9, tip + 33);
        c.moveTo(side * 3.5, tip + 30); c.lineTo(side * 7, tip + 35); c.stroke();
        c.fillStyle = 'rgba(222,248,255,0.78)';
        c.beginPath(); c.moveTo(side * 2, tip + 26);
        c.bezierCurveTo(side * 6, tip + 11, side * 16, tip + 14, side * 12, tip + 29);
        c.quadraticCurveTo(side * 7, tip + 33, side * 2, tip + 26); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.65; c.stroke();
      }
      // Tapered, banded abdomen: the pointed end starts OUTSIDE the face,
      // so a visible length of needle runs from it into the board.
      c.beginPath(); c.moveTo(0, tip + 14);
      c.bezierCurveTo(-6, tip + 15, -8, tip + 21, -5, tip + 25);
      c.quadraticCurveTo(0, tip + 30, 5, tip + 25);
      c.bezierCurveTo(8, tip + 21, 6, tip + 15, 0, tip + 14); c.closePath();
      c.fillStyle = lin(c, -7, 7, ['#412616', '#ffd340', '#f5ae19', '#40251a']);
      c.fill(); c.strokeStyle = '#261c19'; c.lineWidth = 1.1; c.stroke();
      c.save(); c.clip(); c.strokeStyle = '#251f1d'; c.lineWidth = 3;
      c.beginPath();
      for (const yy of [tip + 12, tip + 18, tip + 24]) {
        c.moveTo(-8, yy); c.quadraticCurveTo(0, yy + 3, 8, yy);
      }
      c.stroke();
      c.restore();
      c.fillStyle = '#40312a'; c.beginPath(); c.ellipse(0, tip + 28, 4.5, 5, 0, 0, TAU); c.fill();
      c.fillStyle = '#ffc53b'; c.beginPath(); c.arc(0, tip + 35, 5, 0, TAU); c.fill();
      c.strokeStyle = '#34251b'; c.lineWidth = 1; c.stroke();
      c.fillStyle = '#231c20';
      c.beginPath();
      for (const side of [-1, 1]) {
        c.moveTo(side * 3 + 1.35, tip + 35); c.arc(side * 3, tip + 35, 1.35, 0, TAU);
      }
      c.fill();
      c.strokeStyle = '#3b241c'; c.lineWidth = 1;
      c.beginPath();
      for (const side of [-1, 1]) {
        c.moveTo(side * 3, tip + 32);
        c.quadraticCurveTo(side * 7, tip + 27, side * 8, tip + 29);
      }
      c.stroke();
      c.beginPath(); c.moveTo(-2.8, tip + 16);
      c.lineTo(0, tip - 12); c.lineTo(2.8, tip + 16); c.closePath();
      c.fillStyle = '#231920'; c.fill();
      // Two tiny backward-facing barbs make the tail read as a piercing
      // hornet stinger, rather than a dark stripe behind its abdomen.
      c.strokeStyle = '#34201b'; c.lineWidth = 1.5;
      c.beginPath();
      for (const side of [-1, 1]) {
        c.moveTo(0, tip + 2); c.lineTo(side * 4.3, tip + 6);
        c.lineTo(side * 1.2, tip + 5);
      }
      c.stroke();
      c.strokeStyle = '#fff0b0'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(-0.4, tip + 12); c.lineTo(0, tip - 10); c.stroke();
      c.restore();
      break;
    }
    case 'yoyo': {
      const hue = gunState.yoyoHue ?? 0;
      const flash = gunState.yoyoFlash ?? 0;
      const spin = embedded ? Math.max(0, 1 - age * 0.9) : (gunState.yoyoSpin || 0.5);
      const rot = t * (2 + spin * 22);
      const cy = embedded ? 0 : 12.5;
      if (embedded && age < 0.55) {
        drawYoyoSlideStuckSpinFx(c, 0, cy, 12.5, age, t, hue);
      }
      drawSlide6Yoyo(c, 0, cy, 12.5, rot, spin, hue, flash);
      break;
    }
    case 'sakura': {
      c.save();
      c.translate(0, len * 0.35);
      c.rotate(t * 6);
      for (let i = 0; i < 5; i++) {
        c.rotate(TAU / 5);
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(4, -4, 2, -8);
        c.lineTo(0, -6.5);
        c.lineTo(-2, -8);
        c.quadraticCurveTo(-4, -4, 0, 0);
        c.fillStyle = i % 2 ? '#fbcfe8' : '#f9a8d4';
        c.fill();
      }
      c.fillStyle = '#fde047';
      c.beginPath();
      c.arc(0, 0, 1.6, 0, TAU);
      c.fill();
      c.restore();
      c.strokeStyle = '#7c2d12';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, len * 0.5);
      c.quadraticCurveTo(2, len * 0.75, 0, len);
      c.stroke();
      c.fillStyle = '#4ade80';
      c.beginPath();
      c.ellipse(2.5, len * 0.72, 2.5, 1.2, 0.5, 0, TAU);
      c.fill();
      break;
    }
    case 'acid': {
      glowE(c, len * 0.4, 10, len * 0.55, '163,230,53', 0.5);
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(7, len * 0.15, 6, len * 0.55, 0, len * 0.7);
      c.bezierCurveTo(-6, len * 0.55, -7, len * 0.15, 0, -2);
      c.fillStyle = radial(c, -1, len * 0.3, 8, ['#ecfccb', '#a3e635', '#3f6212']);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(Math.sin(t * 7 + i * 2) * 3, len * 0.2 + i * 6, 1.1, 0, TAU);
        c.fill();
      }
      c.fillStyle = 'rgba(163,230,53,0.6)';
      c.beginPath();
      c.arc(1, len * 0.85, 1.6, 0, TAU);
      c.arc(-1.5, len * 0.95, 1.1, 0, TAU);
      c.fill();
      break;
    }
    case 'keris': {
      drawKerisSlideProjectile(c, t, embedded);
      break;
    }
    case 'firework': {
      drawFirework8Projectile(c, gunState.rocketHue, gunState.rocketFlash);
      break;
    }
    case 'anchor': {
      c.save();
      c.strokeStyle = lin(c, -10, 10, ['#334155', '#e2e8f0', '#475569']) as unknown as string;
      c.lineCap = 'round';
      c.lineWidth = 3.5;
      // anchor pointing down-tip first (tip at 0): flukes at top
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(0, len - 6);
      c.stroke();
      c.beginPath();
      c.arc(0, 4, 9, Math.PI * 1.15, Math.PI * 1.85, true);
      c.stroke();
      c.beginPath();
      c.moveTo(-5, len - 12);
      c.lineTo(5, len - 12);
      c.stroke();
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, len - 3, 3, 0, TAU);
      c.stroke();
      c.restore();
      c.fillStyle = '#cbd5e1';
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(s * 9, 6);
        c.lineTo(s * 11, -1);
        c.lineTo(s * 5, 3);
        c.fill();
      }
      break;
    }
    case 'shark': {
      const wig = Math.sin(t * 16) * 2;
      c.beginPath();
      c.moveTo(0, -3);
      c.bezierCurveTo(8, 4, 8, len * 0.6, 2, len * 0.78);
      c.lineTo(-2, len * 0.78);
      c.bezierCurveTo(-8, len * 0.6, -8, 4, 0, -3);
      c.fillStyle = lin(c, -8, 8, ['#334155', '#94a3b8', '#e2e8f0']);
      c.fill();
      c.strokeStyle = '#1e293b';
      c.lineWidth = 1;
      c.stroke();
      // fins
      c.fillStyle = '#475569';
      c.beginPath();
      c.moveTo(-6, len * 0.4);
      c.lineTo(-12, len * 0.55);
      c.lineTo(-5, len * 0.5);
      c.moveTo(6, len * 0.4);
      c.lineTo(12, len * 0.55);
      c.lineTo(5, len * 0.5);
      c.fill();
      c.beginPath();
      c.moveTo(0, len * 0.75);
      c.lineTo(-7 + wig, len + 2);
      c.lineTo(0, len * 0.9);
      c.lineTo(7 + wig, len + 2);
      c.closePath();
      c.fill();
      // mouth + teeth + eyes
      c.fillStyle = '#7f1d1d';
      c.beginPath();
      c.ellipse(0, 5, 4, 2.5, 0, 0, TAU);
      c.fill();
      c.fillStyle = '#fff';
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(i * 2.2 - 1, 3.5);
        c.lineTo(i * 2.2, 5.5);
        c.lineTo(i * 2.2 + 1, 3.5);
        c.fill();
      }
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(-4, 9, 1.2, 0, TAU);
      c.arc(4, 9, 1.2, 0, TAU);
      c.fill();
      break;
    }
    case 'ghost': {
      c.save();
      c.globalAlpha = 0.75 + 0.2 * Math.sin(t * 8);
      glowE(c, len * 0.4, 12, len * 0.6, '199,210,254', 0.5);
      c.beginPath();
      c.moveTo(-7, len * 0.7);
      c.lineTo(-7, 8);
      c.quadraticCurveTo(-7, -2, 0, -2);
      c.quadraticCurveTo(7, -2, 7, 8);
      c.lineTo(7, len * 0.7);
      for (let i = 0; i < 4; i++) c.quadraticCurveTo(5 - i * 4, len * 0.85 + Math.sin(t * 10 + i) * 3, 3.5 - i * 3.5, len * 0.7);
      c.closePath();
      c.fillStyle = 'rgba(238,242,255,0.95)';
      c.fill();
      c.fillStyle = '#1e1b4b';
      c.beginPath();
      c.ellipse(-2.5, 8, 1.6, 2.4, 0, 0, TAU);
      c.ellipse(2.5, 8, 1.6, 2.4, 0, 0, TAU);
      c.fill();
      c.beginPath();
      c.ellipse(0, 14, 1.6, 2, 0, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'ufo': {
      glowE(c, len * 0.5, 10, len * 0.6, '134,239,172', 0.5);
      c.fillStyle = 'rgba(134,239,172,0.35)';
      c.beginPath();
      c.moveTo(-3, 10);
      c.lineTo(3, 10);
      c.lineTo(6, len);
      c.lineTo(-6, len);
      c.closePath();
      c.fill();
      c.beginPath();
      c.ellipse(0, 4, 5, 4.5, 0, Math.PI, TAU);
      c.fillStyle = 'rgba(187,247,208,0.85)';
      c.fill();
      c.beginPath();
      c.ellipse(0, 6, 10, 3.5, 0, 0, TAU);
      c.fillStyle = lin(c, -10, 10, ['#475569', '#e2e8f0', '#64748b']);
      c.fill();
      for (let i = -1; i <= 1; i++) {
        c.fillStyle = Math.sin(t * 10 + i) > 0 ? '#facc15' : '#4ade80';
        c.beginPath();
        c.arc(i * 5, 7, 1, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'rainbow': {
      glowE(c, 12, 17, 27, '255,215,246', 0.65);
      for (let i = 0; i < 6; i++) {
        c.strokeStyle = RB[i]; c.lineWidth = 2.5; c.lineCap = 'round';
        c.beginPath(); c.moveTo((i - 2.5) * 1.5, 9);
        c.bezierCurveTo((i - 2.5) * 2.6, len * 0.45,
          (i - 2.5) * 1.2 + Math.sin(t * 10 + i) * 2, len * 0.7,
          (i - 2.5) * 0.7, len); c.stroke();
      }
      c.save(); c.translate(0, 7); c.rotate(t * 4);
      c.shadowColor = '#fff7e9'; c.shadowBlur = 13;
      star(c, 0, 0, 9, '#ffffff', 6);
      c.shadowBlur = 0; star(c, 0, 0, 4.5, '#ffe69c', 6); c.restore();
      star(c, -7, len * 0.47, 2.6, '#ffffff', 4);
      star(c, 8, len * 0.78, 2.1, '#fff7ed', 4);
      break;
    }
    case 'meteor': {
      const r = Math.min(9, len * 0.35);
      glowE(c, r + 2, 22, len * 0.9, '255,124,34', 0.64);
      const flame = c.createLinearGradient(0, r, 0, len + 22);
      flame.addColorStop(0, 'rgba(255,253,206,0.96)');
      flame.addColorStop(0.25, 'rgba(251,158,49,0.8)');
      flame.addColorStop(0.66, 'rgba(234,64,27,0.56)');
      flame.addColorStop(1, 'rgba(185,28,28,0)');
      c.fillStyle = flame;
      c.beginPath(); c.moveTo(-r, r);
      c.bezierCurveTo(-r - 5, len * 0.55, -4, len * 0.65, -3, len + 18);
      c.quadraticCurveTo(1, len * 0.88, 2, len * 0.72);
      c.quadraticCurveTo(6, len * 0.9, 3, len + 10);
      c.bezierCurveTo(r + 8, len * 0.45, r + 2, len * 0.24, r, r);
      c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,230,124,0.88)';
      c.beginPath(); c.moveTo(-3, r + 5);
      c.quadraticCurveTo(-5, len * 0.55, 0, len * 0.78);
      c.quadraticCurveTo(4, len * 0.5, 3, r + 5); c.closePath(); c.fill();
      c.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = i * TAU / 10, size = r * (i % 2 ? 0.91 : 1.08);
        c.lineTo(Math.cos(angle) * size, r + Math.sin(angle) * size);
      }
      c.closePath(); c.fillStyle = radial(c, 0, r, r * 1.3,
        ['#e7d2b0', '#685455', '#241d24']); c.fill();
      c.strokeStyle = '#ff993f'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(-r * 0.65, r - 4);
      c.lineTo(-2, r - 1); c.lineTo(1, r + 4); c.lineTo(r * 0.6, r + 2);
      c.moveTo(-2, r - 1); c.lineTo(1, r - r * 0.65); c.stroke();
      c.fillStyle = '#ffdb82';
      for (const [x, y, size] of [[-12, len * 0.5, 1.8], [11, len * 0.68, 1.5]]) {
        c.beginPath(); c.arc(x, y, size, 0, TAU); c.fill();
      }
      break;
    }
    case 'diamond': {
      c.save();
      if (!embedded) {
        c.rotate(Math.sin(t * 3 + gunState.diamondSeed) * 0.2);
      }
      drawSlide2DiamondBullet(
        c,
        embedded ? 11.5 : 12,
        t,
        gunState.diamondSeed,
        gunState.diamondFlash,
      );
      c.restore();
      break;
    }
    case 'moonbeam': {
      // The actual shot is a radiant celestial star, NOT a silver crescent.
      // When stuck, keep its center at the surface instead of hiding the
      // entire constellation beneath the target's painted face.
      const cy = embedded ? len * 0.53 : 8;
      glowE(c, cy + 1, 25, 30, '182,150,255', 0.7);
      glowE(c, cy + 1, 14, 17, '255,248,217', 0.7);
      c.save(); c.translate(0, cy); c.rotate(t * 3);
      c.shadowColor = '#e9dcff'; c.shadowBlur = 20;
      star(c, 0, 0, 11, '#d9c5ff', 6);
      c.shadowBlur = 0; c.rotate(-t * 4.5);
      star(c, 0, 0, 7.5, '#ffffff', 6);
      star(c, 0, 0, 3.7, '#fff0bd', 6); c.restore();
      c.strokeStyle = 'rgba(224,204,255,0.62)'; c.lineWidth = 1;
      c.beginPath(); c.ellipse(0, cy + 1, 14, 5, t * 2, 0, TAU); c.stroke();
      const dust = embedded ? [[-11, cy + 12, 2.5], [10, cy + 18, 2], [-3, cy + 25, 1.8]]
        : [[-6, 22, 3.5], [6, 31, 3], [-3, len - 4, 2.5]];
      for (const [x, yy, size] of dust) {
        star(c, x + Math.sin(t * 8 + yy) * 1.5, yy, size, '#faf5ff', 5);
      }
      break;
    }
    case 'storm': {
      glowE(c, len * 0.4, 10, len * 0.6, '147,197,253', 0.55);
      c.save();
      c.shadowColor = '#93c5fd';
      c.shadowBlur = 12;
      c.fillStyle = '#eff6ff';
      c.beginPath();
      c.moveTo(1, -3);
      c.lineTo(-5, len * 0.45);
      c.lineTo(0, len * 0.45);
      c.lineTo(-3, len);
      c.lineTo(6, len * 0.38);
      c.lineTo(1, len * 0.38);
      c.lineTo(4, -3);
      c.closePath();
      c.fill();
      c.restore();
      c.strokeStyle = '#3b82f6';
      c.lineWidth = 0.8;
      c.stroke();
      break;
    }
    default:
      drawProjectileExtra3(c, kind, len, t, embedded);
  }
}
