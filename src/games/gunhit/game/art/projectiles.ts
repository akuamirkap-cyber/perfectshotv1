import type { ProjKind } from '../weapons';
import { drawProjectileExtra } from './projectiles2';
import { getGunEffect, hasNoNewShot, isFixedClassicGun, supportsGunVariants, type GunEffect } from './gunVariants';
import { drawClassicProjectile, hasClassicProjectile } from './classicProjectiles';
import { drawSlide3BazookaEmbedded, drawSlide3BazookaShell } from '../bazookaSlideFx';
import { gunState } from './kit';
import { drawZipCrystalRound, isZipShot } from '../zipShotFx';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

// all projectiles: tip at y=0, base at y=len
export function drawProjectile(c: CanvasRenderingContext2D, kind: ProjKind, len: number, t: number, age = 99, embedded = false, effect: GunEffect = getGunEffect(kind)) {
  c.save();
  if (supportsGunVariants(kind) && (isFixedClassicGun(kind)
    || ((effect === 'original' || (effect === 'new' && hasNoNewShot(kind))) && hasClassicProjectile(kind)))) {
    drawClassicProjectile(c, kind, len, t);
    c.restore();
    return;
  }
  // The zip weapons ("Skin 3") fire the zip's own faceted crystal round.
  if (isZipShot(kind, effect)) {
    drawZipCrystalRound(c, len, t, gunState.diamondSeed, gunState.diamondFlash, embedded, kind, gunState.tint);
    c.restore();
    return;
  }
  switch (kind) {
    case 'pistol': round(c, len, 'normal'); break;
    case 'old': round(c, len, 'old'); break;
    case 'golden': round(c, len, 'gold'); break;
    case 'ak47': akRound(c, len); break;
    case 'cricket': cricket(c, len, t); break;
    case 'electro': electro(c, len); break;
    case 'nail': nail(c, len, embedded); break;
    case 'fish': fish(c, len, t); break;
    case 'crossbow': bolt(c, len); break;
    case 'bazooka': bazookaShell(c, t, embedded); break;
    case 'rpg': rpg(c, len); break;
    case 'freeze': shard(c, len, t); break;
    default: drawProjectileExtra(c, kind, len, t, age, embedded); break;
  }
  c.restore();
}

function lin(c: CanvasRenderingContext2D, x0: number, x1: number, stops: string[]) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}

/**
 * How much the pistol-family rounds are trimmed at the sides.
 *
 * These sprites are authored ±5 px wide (13 px with the base rim) and were drawn
 * ~1.35x wider than the shot the game actually collides with — `weapon.half` is
 * 4.75, i.e. a 9.5 px hitbox. A pistol round therefore read as fat as a rifle
 * round and visibly wider than the thing it hits. Trimming the sides (the length
 * is untouched, so the flight still reads as a bullet) lines the artwork up with
 * its own hitbox: 13 px → 10 px.
 */
const ROUND_TRIM = 0.78;

function round(c: CanvasRenderingContext2D, len: number, v: 'normal' | 'old' | 'gold') {
  c.save();
  c.scale(ROUND_TRIM, 1);
  const head = Math.round(len * 0.38);
  const tip = v === 'old' ? ['#2a1a14', '#8b6a5a', '#2a1a14'] : v === 'gold' ? ['#8a6400', '#fff6c0', '#a07800'] : ['#7a3212', '#f6b07a', '#7a3212'];
  const body = v === 'old' ? ['#2f3236', '#a3a8ad', '#2f3236'] : v === 'gold' ? ['#7a5800', '#ffe46a', '#7a5800'] : ['#8c5e10', '#ffe695', '#8c5e10'];
  c.beginPath();
  c.moveTo(-5, head);
  c.lineTo(-5, 7);
  c.quadraticCurveTo(-4.5, 0, 0, -1);
  c.quadraticCurveTo(4.5, 0, 5, 7);
  c.lineTo(5, head);
  c.closePath();
  c.fillStyle = lin(c, -6, 6, tip);
  c.fill();
  c.fillStyle = lin(c, -6, 6, body);
  c.fillRect(-5.5, head, 11, len - head - 3.5);
  c.fillStyle = 'rgba(0,0,0,0.35)';
  c.fillRect(-5.5, head, 11, 1.5);
  c.fillRect(-5.5, len - 5.5, 11, 1.5);
  c.fillStyle = v === 'old' ? '#55595e' : v === 'gold' ? '#d4a017' : '#c08a24';
  c.fillRect(-6.5, len - 3.5, 13, 3.5);
  if (v === 'gold') {
    c.fillStyle = 'rgba(255,255,255,0.8)';
    c.fillRect(-2.5, 4, 1.2, len - 10);
  }
  c.restore();
}

function akRound(c: CanvasRenderingContext2D, len: number) {
  // Same trim as the pistol family: the AK's round shares the base rim width.
  c.save();
  c.scale(ROUND_TRIM, 1);
  c.beginPath();
  c.moveTo(-4, 15);
  c.lineTo(-4, 8);
  c.quadraticCurveTo(-3.5, 0, 0, -2);
  c.quadraticCurveTo(3.5, 0, 4, 8);
  c.lineTo(4, 15);
  c.closePath();
  c.fillStyle = lin(c, -5, 5, ['#6e300e', '#f0a36a', '#6e300e']);
  c.fill();
  c.fillStyle = lin(c, -6, 6, ['#30361f', '#a9b37f', '#30361f']);
  c.fillRect(-4.3, 14, 8.6, 5);
  c.beginPath();
  c.moveTo(-4.3, 19);
  c.lineTo(-5.5, 23);
  c.lineTo(5.5, 23);
  c.lineTo(4.3, 19);
  c.closePath();
  c.fill();
  c.fillRect(-5.5, 23, 11, len - 26.5);
  c.fillStyle = '#596138';
  c.fillRect(-6.5, len - 3.5, 13, 3.5);
  c.restore();
}

function glowEllipse(c: CanvasRenderingContext2D, y: number, rx: number, ry: number, rgb: string, a: number) {
  const g = c.createRadialGradient(0, y, 1, 0, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, y, rx, ry, 0, 0, TAU);
  c.fill();
}

function plasma(c: CanvasRenderingContext2D, len: number, t: number, embedded: boolean) {
  // A contained, swirling plasma orb rather than a featureless green capsule.
  const y = embedded ? len * 0.5 : 12;
  glowEllipse(c, y, 20, 25, '57,255,156', embedded ? 0.43 : 0.66);
  c.save(); c.translate(0, y); c.rotate(t * 2.4);
  c.shadowColor = '#56ffc0'; c.shadowBlur = 15;
  const plasma = c.createRadialGradient(-4, -5, 1, 0, 0, 13);
  plasma.addColorStop(0, '#ffffff'); plasma.addColorStop(0.32, '#b9ffe2');
  plasma.addColorStop(0.7, '#24db94'); plasma.addColorStop(1, '#0e7259');
  c.fillStyle = plasma; c.beginPath(); c.ellipse(0, 0, 12, 13, 0, 0, TAU); c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(235,255,245,0.89)'; c.lineWidth = 1.5;
  c.beginPath(); c.ellipse(0, 0, 15, 5, 0.33, -0.8, Math.PI * 1.5); c.stroke();
  c.strokeStyle = 'rgba(80,255,181,0.86)'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 15, 5, -0.44, Math.PI * 0.3, Math.PI * 1.45); c.stroke();
  c.fillStyle = '#edfff9';
  for (const [x, yy, r] of [[-5, -3, 2.4], [5, 4, 1.6]]) {
    c.beginPath(); c.arc(x, yy, r, 0, TAU); c.fill();
  }
  c.restore();
  if (!embedded) {
    for (const [x, yy, r] of [[-13, y + 13, 2], [12, y + 19, 1.6], [-5, len - 3, 1.4]]) {
      c.fillStyle = '#aeffdd'; c.beginPath(); c.arc(x, yy, r, 0, TAU); c.fill();
    }
  }
}

function laser(c: CanvasRenderingContext2D, len: number, t: number) {
  const pulse = 0.8 + 0.2 * Math.sin(t * 15);
  c.shadowColor = '#ff2a55';
  c.shadowBlur = 16 * pulse;
  c.fillStyle = lin(c, -5, 5, ['#8a001c', '#ff8fa6', '#ff3a63', '#8a001c']);
  c.beginPath();
  c.moveTo(0, -2);
  c.lineTo(5, 10);
  c.lineTo(4, len - 7);
  c.lineTo(0, len);
  c.lineTo(-4, len - 7);
  c.lineTo(-5, 10);
  c.closePath();
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = `rgba(255,255,255,${0.75 * pulse})`;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(0, 2);
  c.lineTo(0, len - 6);
  c.stroke();
}

function cricket(c: CanvasRenderingContext2D, len: number, t: number) {
  const pulse = 0.8 + 0.2 * Math.sin(t * 20);
  c.globalCompositeOperation = 'lighter';
  glowEllipse(c, len * 0.35, 16, len * 0.6, '90,170,255', 0.7 * pulse);
  c.shadowColor = '#7cc8ff';
  c.shadowBlur = 18;
  c.fillStyle = '#9fd8ff';
  c.beginPath();
  c.ellipse(0, len * 0.3, 7, len * 0.32, 0, 0, TAU);
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.ellipse(0, len * 0.28, 3.5, len * 0.22, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(180,225,255,0.8)';
  c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(0, len * 0.3, 9 + i * 2, 3, ((t * 6 + i) % 3) - 1.5, 0, TAU);
    c.stroke();
  }
}

function electro(c: CanvasRenderingContext2D, len: number) {
  c.globalCompositeOperation = 'lighter';
  glowEllipse(c, len * 0.5, 12, len * 0.6, '90,209,255', 0.5);
  const pts: [number, number][] = [[0, -1]];
  for (let i = 1; i < 6; i++) pts.push([rand(-6, 6), (len * i) / 6]);
  pts.push([0, len]);
  for (const [w, col] of [[6, 'rgba(90,209,255,0.5)'], [3, '#9be8ff'], [1.3, '#ffffff']] as const) {
    c.strokeStyle = col;
    c.lineWidth = w;
    c.lineJoin = 'round';
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
    c.stroke();
  }
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(0, 0, 3, 0, TAU);
  c.fill();
}

function nail(c: CanvasRenderingContext2D, len: number, embedded: boolean) {
  if (embedded) {
    // Once it lands, show a proper knife embedded point-first in the board:
    // the blade disappears into the target while the guard and grip remain visible.
    const guardY = len * 0.52;
    const gripY = len * 0.6;
    c.beginPath();
    c.moveTo(0, -2);
    c.lineTo(4.2, guardY - 8);
    c.lineTo(3.2, guardY);
    c.lineTo(-3.2, guardY);
    c.lineTo(-4.2, guardY - 8);
    c.closePath();
    c.fillStyle = lin(c, -4, 4, ['#64748b', '#f8fafc', '#94a3b8']);
    c.fill();
    c.strokeStyle = '#334155';
    c.lineWidth = 0.9;
    c.stroke();
    c.fillStyle = '#dbeafe';
    c.beginPath();
    c.moveTo(0, 3);
    c.lineTo(1, guardY - 9);
    c.lineTo(-0.5, guardY - 9);
    c.closePath();
    c.fill();

    // Brass guard and a dark, wrapped handle jut out from the board.
    c.fillStyle = '#fbbf24';
    c.beginPath();
    c.roundRect(-7, guardY - 1.5, 14, 4, 1.5);
    c.fill();
    c.fillStyle = '#5b3520';
    c.beginPath();
    c.roundRect(-3.6, gripY, 7.2, len - gripY - 1, 3.2);
    c.fill();
    c.strokeStyle = '#d6a36a';
    c.lineWidth = 0.9;
    for (let y = gripY + 4; y < len - 3; y += 4) {
      c.beginPath();
      c.moveTo(-3, y);
      c.lineTo(3, y + 1.5);
      c.stroke();
    }
    c.fillStyle = '#cbd5e1';
    c.beginPath();
    c.roundRect(-4.5, len - 3.5, 9, 3.5, 1.5);
    c.fill();
    return;
  }

  c.fillStyle = lin(c, -2, 2, ['#5a6068', '#e8edf2', '#5a6068']);
  c.beginPath();
  c.moveTo(0, -2);
  c.lineTo(1.7, 7);
  c.lineTo(1.7, len - 4);
  c.lineTo(-1.7, len - 4);
  c.lineTo(-1.7, 7);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.25)';
  c.lineWidth = 0.6;
  for (let y = 10; y < 22; y += 2.5) {
    c.beginPath();
    c.moveTo(-1.7, y);
    c.lineTo(1.7, y + 1.2);
    c.stroke();
  }
  c.fillStyle = lin(c, -5, 5, ['#4a5058', '#d8dde3', '#4a5058']);
  c.beginPath();
  c.roundRect(-5, len - 4.5, 10, 4.5, 1.5);
  c.fill();
}

function fish(c: CanvasRenderingContext2D, len: number, t: number) {
  const wig = Math.sin(t * 18) * 2.5;
  const bodyLen = len * 0.78;
  // tail
  c.fillStyle = '#ff7a1a';
  c.beginPath();
  c.moveTo(0, bodyLen - 4);
  c.lineTo(-8 + wig, len + 2);
  c.lineTo(0, len - 3);
  c.lineTo(8 + wig, len + 2);
  c.closePath();
  c.fill();
  c.strokeStyle = '#1a1a1a';
  c.lineWidth = 1;
  c.stroke();
  // side fins
  c.fillStyle = '#ff9a3a';
  c.beginPath();
  c.ellipse(-7, bodyLen * 0.45, 3, 6, -0.6, 0, TAU);
  c.ellipse(7, bodyLen * 0.45, 3, 6, 0.6, 0, TAU);
  c.fill();
  // body
  const g = c.createLinearGradient(-7, 0, 7, 0);
  g.addColorStop(0, '#d9500a');
  g.addColorStop(0.45, '#ffa84a');
  g.addColorStop(1, '#d9500a');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, bodyLen / 2, 7, bodyLen / 2, 0, 0, TAU);
  c.fill();
  c.strokeStyle = '#1a1a1a';
  c.stroke();
  // stripes
  c.save();
  c.beginPath();
  c.ellipse(0, bodyLen / 2, 7, bodyLen / 2, 0, 0, TAU);
  c.clip();
  c.fillStyle = '#ffffff';
  for (const y of [bodyLen * 0.3, bodyLen * 0.62]) {
    c.beginPath();
    c.ellipse(0, y, 8, 2.6, 0, 0, TAU);
    c.fill();
  }
  c.restore();
  // eye
  c.fillStyle = '#fff';
  c.beginPath();
  c.arc(-2.6, 6, 2.4, 0, TAU);
  c.arc(2.6, 6, 2.4, 0, TAU);
  c.fill();
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(-2.6, 5.5, 1.2, 0, TAU);
  c.arc(2.6, 5.5, 1.2, 0, TAU);
  c.fill();
}

function bolt(c: CanvasRenderingContext2D, len: number) {
  c.fillStyle = lin(c, -2, 2, ['#6b3d15', '#d8a060', '#6b3d15']);
  c.fillRect(-1.6, 9, 3.2, len - 10);
  c.fillStyle = lin(c, -4, 4, ['#4b5058', '#f0f4f8', '#4b5058']);
  c.beginPath();
  c.moveTo(0, -2);
  c.lineTo(4.5, 9);
  c.lineTo(1.6, 10);
  c.lineTo(-1.6, 10);
  c.lineTo(-4.5, 9);
  c.closePath();
  c.fill();
  c.fillStyle = '#e02424';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 1.6, len - 15);
    c.lineTo(s * 6.5, len - 3);
    c.lineTo(s * 1.6, len - 5);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#ffffff';
  c.fillRect(-0.6, len - 14, 1.2, 10);
  c.fillStyle = '#222';
  c.fillRect(-2, len - 2, 4, 2);
}

function bazookaShell(c: CanvasRenderingContext2D, t: number, embedded: boolean) {
  const hue = gunState.bazookaHue || 45;
  const seed = gunState.bazookaSeed || 1.7;
  const flash = gunState.bazookaFlash || 0;
  if (embedded) {
    drawSlide3BazookaEmbedded(c, hue, t, seed, flash, gunState.bazookaBite || 0.6);
  } else {
    drawSlide3BazookaShell(c, hue, t, seed, flash, 1);
  }
}

function rpg(c: CanvasRenderingContext2D, len: number) {
  c.fillStyle = '#2b2f33';
  c.fillRect(-2.5, 24, 5, len - 26);
  c.fillStyle = '#3d4a24';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 2.5, len - 12);
    c.lineTo(s * 8, len - 2);
    c.lineTo(s * 2.5, len);
    c.closePath();
    c.fill();
  }
  c.fillStyle = lin(c, -8, 8, ['#2f3a1e', '#a0b066', '#2f3a1e']);
  c.beginPath();
  c.moveTo(0, -3);
  c.lineTo(3, 2);
  c.lineTo(8, 15);
  c.lineTo(6, 22);
  c.lineTo(2.5, 26);
  c.lineTo(-2.5, 26);
  c.lineTo(-6, 22);
  c.lineTo(-8, 15);
  c.lineTo(-3, 2);
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.4)';
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = '#c9a227';
  c.fillRect(-7.5, 14, 15, 2);
}

function shard(c: CanvasRenderingContext2D, len: number, t: number) {
  const pulse = 0.8 + 0.2 * Math.sin(t * 9);
  c.shadowColor = '#9be7ff';
  c.shadowBlur = 14 * pulse;
  const g = c.createLinearGradient(-6, 0, 6, len);
  g.addColorStop(0, 'rgba(230,250,255,0.95)');
  g.addColorStop(0.5, 'rgba(120,210,255,0.85)');
  g.addColorStop(1, 'rgba(60,150,230,0.9)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -3);
  c.lineTo(6, 10);
  c.lineTo(4, len - 5);
  c.lineTo(0, len);
  c.lineTo(-4, len - 5);
  c.lineTo(-6, 10);
  c.closePath();
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.9)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(0, -3);
  c.lineTo(-1.5, len - 4);
  c.moveTo(-6, 10);
  c.lineTo(6, 10);
  c.moveTo(-5, 22);
  c.lineTo(1, 16);
  c.stroke();
}

function voidOrb(c: CanvasRenderingContext2D, len: number, t: number, embedded: boolean) {
  // A small genuine singularity with a thin animated accretion disk. There
  // is no giant opaque black disk applied to a treasure chest or rock face.
  const y = embedded ? len * 0.5 : 10;
  glowEllipse(c, y, 22, 20, '168,85,247', embedded ? 0.32 : 0.6);
  c.save(); c.translate(0, y); c.rotate(t * 3.4);
  const disk = c.createRadialGradient(0, 0, 2, 0, 0, 18);
  disk.addColorStop(0, 'rgba(225,159,255,0)');
  disk.addColorStop(0.38, 'rgba(255,204,144,0.87)');
  disk.addColorStop(0.62, 'rgba(200,106,251,0.72)');
  disk.addColorStop(1, 'rgba(121,40,185,0)');
  c.fillStyle = disk; c.beginPath(); c.ellipse(0, 0, 19, 8, 0, 0, TAU); c.fill();
  c.strokeStyle = '#fff0ca'; c.lineWidth = 1.5;
  c.beginPath(); c.ellipse(0, 0, 14, 4.5, 0, -0.7, 1.9); c.stroke();
  c.strokeStyle = '#b884fa'; c.lineWidth = 1.8;
  c.beginPath(); c.ellipse(0, 0, 14, 4.5, 0, 2.3, 5.4); c.stroke();
  c.restore();
  c.fillStyle = '#090519'; c.beginPath(); c.arc(0, y, 6, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(238,218,255,0.96)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#ffe2aa'; c.beginPath(); c.arc(-1.5, y - 6, 1.1, 0, TAU); c.fill();
}
