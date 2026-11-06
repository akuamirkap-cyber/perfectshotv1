export const TAU = Math.PI * 2;
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** shared mutable state the game sets before drawing (e.g. minigun spin) */
import type { WeaponAnim } from '../../vendor/game-4/src/game/weapons';
import type { WeaponDrawState as NineDrawState } from '../../vendor/game-6/src/game/types';

export const gunState = { fireworkTube: 0, ghostSide: 1 as -1 | 1, saberSide: 1 as -1 | 1, spin: 0, spinAngle: 0, sinceShot: 9, reloadT: 0, charge: 0, shots: 0, tint: '244,63,94', bigShot: 0, rocketHue: 340, rocketFlash: 0, yoyoHue: 0, yoyoFlash: 0, yoyoSpin: 0, diamondFlash: 0, diamondSeed: 0, s7Anim: null as WeaponAnim | null, s9State: null as NineDrawState | null, s9Live: false, sixState: null as import('../setSixArt').SixDrawState | null, sixLive: false, elevenState: null as import('../../vendor/game-8/src/game/types').WeaponState | null, elevenLive: false, elevenStage: false, nineStage: false, twoState: null as import('../setTwoArt').SetTwoState | null, twoLive: false, bazookaHue: 45, bazookaSeed: 1.7, bazookaFlash: 0, bazookaBite: 0.6, inPreview: false, ammoRatio: 1, jaw: 0, glow: 0, servo: 0, heat: 0 };

type C = CanvasRenderingContext2D;

type RGBA = [number, number, number, number];

function parseColor(color: string): RGBA | null {
  const hex = color.match(/^#([\da-f]{3,8})$/i);
  if (hex) {
    let value = hex[1];
    if (value.length === 3 || value.length === 4) value = [...value].map(ch => ch + ch).join('');
    if (value.length !== 6 && value.length !== 8) return null;
    return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16),
      parseInt(value.slice(4, 6), 16), value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1];
  }
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if (!rgb) return null;
  const alpha = rgb[4] ? (rgb[4].endsWith('%') ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4])) : 1;
  return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), alpha];
}

function formatGlossColor([r, g, b, a]: RGBA, amount: number) {
  const lift = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `rgba(${lift(r)},${lift(g)},${lift(b)},${a})`;
}

/** Build a broad, opaque specular highlight by sampling and lifting the
 * material itself. This stays smooth on segmented bodies—no white cutout bands. */
function addGlossStops(g: CanvasGradient, stops: string[], peak = 0.43) {
  const palette = stops.map(parseColor);
  if (palette.some(color => color === null)) {
    stops.forEach((color, i) => g.addColorStop(i / (stops.length - 1), color));
    return;
  }
  const colors = palette as RGBA[];
  const sourcePositions = colors.map((_, i) => i / (colors.length - 1));
  const positions = [...new Set([...sourcePositions, 0.16, 0.32, peak, 0.62, 0.82])].sort((a, b) => a - b);
  for (const at of positions) {
    let index = sourcePositions.findIndex(position => position >= at);
    if (index < 0) index = colors.length - 1;
    const left = Math.max(0, index - 1), right = index;
    const span = sourcePositions[right] - sourcePositions[left];
    const mix = span === 0 ? 0 : (at - sourcePositions[left]) / span;
    const base = colors[left].map((channel, i) => channel + (colors[right][i] - channel) * mix) as RGBA;
    const distance = (at - peak) / 0.28;
    const sheen = 0.04 + 0.26 * Math.exp(-(distance * distance));
    g.addColorStop(at, formatGlossColor(base, sheen));
  }
}

export function lin(c: C, x0: number, x1: number, stops: string[]) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  addGlossStops(g, stops, 0.43);
  return g;
}
export function vlin(c: C, y0: number, y1: number, stops: string[]) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  addGlossStops(g, stops, 0.42);
  return g;
}
export const steel = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#141619', '#5a6068', '#141619']);
export const chrome = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#4a515c', '#f5f7fa', '#aeb6c2', '#3d434c']);
export const wood = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#4a220b', '#c4692b', '#a0521f', '#4a220b']);
export const brass = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#5a3a08', '#f3cf6a', '#c28f22', '#4a2e05']);

export function rr(c: C, x: number, y: number, w: number, h: number, r: number | number[], fill: string | CanvasGradient, stroke?: string, lw = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = lw;
    c.stroke();
  }
}

import { drawModernGrip } from './gripSystem';

export function grip(c: C, cx: number, y: number, c1: string, _c2?: string, _len = 0.85) {
  drawModernGrip(c, cx, y, c1, 'g10');
}

export function guard(_c: C, _cx: number, _y: number, _col = '#1a1c20', _r = 14) {
  // Integrated seamlessly inside drawModernGrip
}

export function glow(c: C, x: number, y: number, r: number, col: string, blur = 12) {
  c.save();
  const prevAlpha = c.globalAlpha;
  c.fillStyle = col;
  if (blur > 0) {
    c.globalAlpha = prevAlpha * 0.2;
    c.beginPath();
    c.arc(x, y, r + blur * 0.44, 0, TAU);
    c.fill();
    c.globalAlpha = prevAlpha * 0.42;
    c.beginPath();
    c.arc(x, y, r + blur * 0.2, 0, TAU);
    c.fill();
    c.globalAlpha = prevAlpha;
  }
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.restore();
}

export function jag(c: C, x0: number, y0: number, x1: number, y1: number, amp: number, n = 6) {
  c.beginPath();
  c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    c.lineTo(x0 + (x1 - x0) * k + rand(-amp, amp), y0 + (y1 - y0) * k + rand(-amp, amp));
  }
  c.lineTo(x1, y1);
  c.stroke();
}

export function star(c: C, x: number, y: number, r: number, fill: string, points = 5) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rr2 = i % 2 === 0 ? r : r * 0.45;
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
  }
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

export function radial(c: C, x: number, y: number, r: number, stops: string[]) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
