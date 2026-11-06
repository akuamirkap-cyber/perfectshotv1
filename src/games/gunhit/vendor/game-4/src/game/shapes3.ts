import { type Ctx, TAU, clamp, drawSprite, easeOutCubic, glowSprite, lin, makeBolt, makeCanvas, mulberry32, polyPath, starSprite } from './core';
import { drawAmmoGlyph4, drawStuckItem4 } from './shapes4';
import type { StuckItem, WeaponId } from './weapons';

export const CONF_HEX = ['#ff4f87', '#ffc928', '#38b6ff', '#5bdc72', '#b06bff', '#ff8a2b'];

// ───────────────────────── small organic shapes ─────────────────────────
/** feather pointing +X */
export function drawFeather(ctx: Ctx, L: number, fill = '#fffbe0', edge = '#e7c14b') {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(L * 0.2, -L * 0.3, L * 0.78, -L * 0.28, L, 0);
  ctx.bezierCurveTo(L * 0.78, L * 0.28, L * 0.2, L * 0.3, 0, 0);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(190,140,30,0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-L * 0.12, 0);
  ctx.lineTo(L * 0.92, 0);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(200,155,40,0.4)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let i = 1; i < 6; i++) {
    const x = (L * i) / 6.4;
    const h = L * 0.2 * Math.sin((Math.PI * i) / 6.4);
    ctx.moveTo(x, 0);
    ctx.lineTo(x + L * 0.1, -h);
    ctx.moveTo(x, 0);
    ctx.lineTo(x + L * 0.1, h);
  }
  ctx.stroke();
}

/** leaf pointing +X */
export function drawLeaf(ctx: Ctx, L: number, w: number, c0 = '#8ae26a', c1 = '#2a8c38') {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(L * 0.25, -w, L * 0.8, -w * 0.85, L, 0);
  ctx.bezierCurveTo(L * 0.8, w * 0.85, L * 0.25, w, 0, 0);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, -w, 0, w, [
    [0, c0],
    [1, c1],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,70,25,0.7)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(210,255,190,0.6)';
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(L * 0.9, 0);
  ctx.stroke();
}

// ───────────────────────── rubber chicken (head up, centred) ─────────────────────────
export function drawChicken(ctx: Ctx, s = 1, flap = 0, mouth = 0.25) {
  ctx.save();
  ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // legs
  for (const k of [-1, 1]) {
    ctx.strokeStyle = '#a85a00';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(k * 5, 16);
    ctx.lineTo(k * 6.5, 27);
    ctx.stroke();
    ctx.strokeStyle = '#ff9a1f';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(k * 5, 16);
    ctx.lineTo(k * 6.5, 27);
    ctx.stroke();
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (const d of [-5, 0, 5]) {
      ctx.moveTo(k * 6.5, 27);
      ctx.lineTo(k * 6.5 + d, 31);
    }
    ctx.stroke();
  }
  // tail
  for (const k of [-1, 0, 1]) {
    ctx.save();
    ctx.translate(0, 15);
    ctx.rotate(k * 0.45);
    ctx.beginPath();
    ctx.ellipse(0, 6, 3.6, 8.5, 0, 0, TAU);
    ctx.fillStyle = '#e8a800';
    ctx.fill();
    ctx.strokeStyle = '#8a5200';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();
  }
  // wings
  for (const k of [-1, 1]) {
    ctx.save();
    ctx.translate(k * 12.5, 2);
    ctx.rotate(k * (0.55 + flap));
    ctx.beginPath();
    ctx.ellipse(0, 6, 5.5, 11.5, 0, 0, TAU);
    ctx.fillStyle = lin(ctx, -5, 0, 5, 0, [
      [0, '#ffe84a'],
      [1, '#d99a00'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#8a5200';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();
  }
  // body + head
  const bodyG = ctx.createRadialGradient(-5, -2, 2, 0, 3, 20);
  bodyG.addColorStop(0, '#fff7a8');
  bodyG.addColorStop(0.35, '#ffe030');
  bodyG.addColorStop(0.8, '#f2b200');
  bodyG.addColorStop(1, '#b87800');
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = '#8a5200';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(0, 4, 14.5, 17.5, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -16, 10.6, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-6, -2, 3.2, 7, 0.25, 0, TAU);
  ctx.fill();
  // comb
  for (const [x, y, r] of [
    [-5, -26.5, 3.5],
    [0, -28.6, 4.3],
    [5, -26.5, 3.5],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = lin(ctx, 0, y - r, 0, y + r, [
      [0, '#ff6a58'],
      [1, '#c1121f'],
    ]);
    ctx.fill();
    ctx.strokeStyle = '#7a0a10';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  // eyes
  for (const k of [-1, 1]) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#3a2a10';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.arc(k * 4.4, -18.2, 3.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(k * 3.8, -17.6, 1.7, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(k * 3.3, -18.3, 0.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#8a5200';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(k * 7.8, -23 + k * 0.6);
    ctx.lineTo(k * 2, -21.6 - k * 0.6);
    ctx.stroke();
  }
  // wattle + beak
  ctx.fillStyle = '#d62839';
  ctx.beginPath();
  ctx.ellipse(0, -3.8 + mouth * 3.6, 2.5, 3.8, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ff9a1f';
  ctx.strokeStyle = '#a85a00';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5, -13.4);
  ctx.lineTo(5, -13.4);
  ctx.lineTo(0, -9.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#5e1008';
  ctx.beginPath();
  ctx.ellipse(0, -9.4 + mouth * 1.2, 3.4, 0.6 + mouth * 3.2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#f58a10';
  ctx.beginPath();
  ctx.moveTo(-3.4, -9 + mouth * 2.4);
  ctx.lineTo(3.4, -9 + mouth * 2.4);
  ctx.lineTo(0, -5.4 + mouth * 4.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ───────────────────────── seed (nose up, centred) ─────────────────────────
export function drawSeed(ctx: Ctx, L = 18, w = 7) {
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(0, -L / 2);
    ctx.bezierCurveTo(w * 1.05, -L * 0.18, w * 0.92, L * 0.3, 0, L / 2);
    ctx.bezierCurveTo(-w * 0.92, L * 0.3, -w * 1.05, -L * 0.18, 0, -L / 2);
    ctx.closePath();
  };
  path();
  ctx.fillStyle = lin(ctx, -w, 0, w, 0, [
    [0, '#8e8a7e'],
    [0.4, '#fffdf2'],
    [1, '#a5a090'],
  ]);
  ctx.fill();
  ctx.save();
  path();
  ctx.clip();
  ctx.strokeStyle = '#1b1b20';
  ctx.lineCap = 'round';
  for (const o of [-0.62, -0.22, 0.22, 0.62]) {
    ctx.lineWidth = 1.5 + (1 - Math.abs(o)) * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -L / 2 + 1);
    ctx.bezierCurveTo(w * o * 1.9, -L * 0.18, w * o * 1.6, L * 0.3, 0, L / 2 - 0.5);
    ctx.stroke();
  }
  ctx.restore();
  path();
  ctx.strokeStyle = 'rgba(30,28,20,0.9)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.35, -L * 0.15, w * 0.14, L * 0.16, 0.2, 0, TAU);
  ctx.fill();
}

// ───────────────────────── pizza slice (tip up, crust down, centred) ─────────────────────────
export function drawPizzaSlice(ctx: Ctx, L = 36) {
  const w = L * 0.86;
  const top = -L / 2;
  const bot = L / 2 - L * 0.06;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, top);
  ctx.lineTo(w / 2, bot);
  ctx.quadraticCurveTo(0, bot + L * 0.1, -w / 2, bot);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, 0, top, 0, bot, [
    [0, '#ffb52e'],
    [0.5, '#ffd24a'],
    [1, '#ffbe2a'],
  ]);
  ctx.fill();
  ctx.strokeStyle = '#c26a0e';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(214,60,28,0.8)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(1.5, top + 5);
  ctx.lineTo(w / 2 - 2, bot - 2);
  ctx.moveTo(-1.5, top + 5);
  ctx.lineTo(-w / 2 + 2, bot - 2);
  ctx.stroke();
  ctx.lineCap = 'round';
  const crust = (off: number, lw: number, col: string) => {
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(-w / 2, bot + off);
    ctx.quadraticCurveTo(0, bot + L * 0.1 + off, w / 2, bot + off);
    ctx.stroke();
  };
  crust(0, L * 0.21, '#9a5012');
  crust(-L * 0.01, L * 0.15, '#e8a043');
  crust(-L * 0.04, L * 0.045, 'rgba(255,232,175,0.75)');
  const pep = (x: number, y: number, r: number) => {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#f05a46');
    g.addColorStop(1, '#a8180f');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#6a0f08';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = 'rgba(100,10,5,0.45)';
    for (const [dx, dy] of [
      [-0.3, 0.2],
      [0.35, -0.1],
      [0.05, 0.45],
    ]) {
      ctx.beginPath();
      ctx.arc(x + dx * r, y + dy * r, r * 0.16, 0, TAU);
      ctx.fill();
    }
  };
  pep(-w * 0.14, bot - L * 0.3, L * 0.115);
  pep(w * 0.16, bot - L * 0.26, L * 0.105);
  pep(0.01, top + L * 0.4, L * 0.085);
  ctx.save();
  ctx.translate(w * 0.03, bot - L * 0.1);
  ctx.rotate(-0.5);
  drawLeaf(ctx, L * 0.22, L * 0.08, '#78dc5a', '#237a30');
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,230,0.55)';
  ctx.beginPath();
  ctx.ellipse(-w * 0.06, top + L * 0.22, L * 0.06, L * 0.03, 0.9, 0, TAU);
  ctx.fill();
}

interface PizzaSprite { canvas: HTMLCanvasElement; x: number; y: number; w: number; h: number }
const pizzaSprites = new Map<string, PizzaSprite>();

/** Reuse the static shaded pizza while its rotation, squash and translucent afterimages stay animated. */
export function drawFastPizzaSlice(ctx: Ctx, length = 36) {
  const a = ctx.globalAlpha;
  // These are the actual three afterimage opacities and the opaque pizza. By
  // baking each opacity into all the vector layers we preserve translucent
  // overlap; fading the finished opaque image would flatten the toppings.
  const alpha = [0.12, 0.24, 0.36, 1].find((value) => Math.abs(value - a) < 1e-6);
  const canCache = typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined'
    && ctx.canvas instanceof HTMLCanvasElement && ctx.globalCompositeOperation === 'source-over'
    && (length === 24 || length === 34 || length === 36) && alpha !== undefined;
  if (!canCache) { drawPizzaSlice(ctx, length); return; }
  const key = `${length}:${alpha}`;
  let sprite = pizzaSprites.get(key);
  if (!sprite) {
    try {
      const x = Math.floor(-length * 0.56 - 3), y = Math.floor(-length * 0.5 - 3);
      const w = Math.ceil(length * 0.56 + 3) - x, h = Math.ceil(length * 0.67 + 3) - y;
      const density = 4;
      const canvas = makeCanvas(w * density, h * density);
      const c = canvas.getContext('2d');
      if (c) {
        c.setTransform(density, 0, 0, density, -x * density, -y * density);
        c.globalAlpha = alpha;
        drawPizzaSlice(c, length);
        sprite = { canvas, x, y, w, h };
        pizzaSprites.set(key, sprite); // at most 3 sizes × 4 opacity levels
      }
    } catch { /* Keep the original vector path when an offscreen canvas fails. */ }
  }
  if (!sprite) { drawPizzaSlice(ctx, length); return; }
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.drawImage(sprite.canvas, sprite.x, sprite.y, sprite.w, sprite.h);
  ctx.restore();
}

// ───────────────────────── crossbow bolt (tip at 0,0 pointing up; tail +Y 52) ─────────────────────────
export function drawBolt(ctx: Ctx) {
  ctx.fillStyle = lin(ctx, -1.9, 0, 1.9, 0, [
    [0, '#4a2a0c'],
    [0.5, '#d29a58'],
    [1, '#4a2a0c'],
  ]);
  ctx.fillRect(-1.9, 12, 3.8, 34);
  for (const k of [-1, 1]) {
    polyPath(ctx, [k * 1.9, 36, k * 8.4, 44, k * 8.4, 54, k * 1.9, 49]);
    ctx.fillStyle = k < 0 ? '#e0303f' : '#a31622';
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,5,10,0.7)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }
  ctx.fillStyle = '#fff3e8';
  ctx.fillRect(-0.9, 38, 1.8, 15);
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(-2.2, 52, 4.4, 2);
  polyPath(ctx, [0, 0, 5.2, 13, 1.9, 15, -1.9, 15, -5.2, 13]);
  ctx.fillStyle = lin(ctx, -5, 0, 5, 0, [
    [0, '#4f5863'],
    [0.45, '#f4f8fc'],
    [1, '#4a525c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,24,30,0.8)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.lineTo(0, 14);
  ctx.stroke();
}

// ───────────────────────── harpoon (tip at 0,0 pointing up; tail +Y 56) ─────────────────────────
export function drawHarpoonProj(ctx: Ctx) {
  ctx.fillStyle = lin(ctx, -2.2, 0, 2.2, 0, [
    [0, '#4a525c'],
    [0.45, '#e6ecf2'],
    [1, '#3c434c'],
  ]);
  ctx.fillRect(-2.2, 18, 4.4, 38);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const y of [30, 41, 51]) {
    ctx.fillStyle = 'rgba(70,255,230,0.9)';
    ctx.fillRect(-2.3, y, 4.6, 1.6);
    drawSprite(ctx, glowSprite('70,255,230'), 0, y + 0.8, 11, 0.5);
  }
  ctx.restore();
  for (const k of [-1, 1]) {
    polyPath(ctx, [k * 4.4, 15, k * 12.5, 31, k * 3, 25]);
    ctx.fillStyle = k < 0 ? '#aeb6c0' : '#7c858f';
    ctx.fill();
    ctx.strokeStyle = 'rgba(15,20,26,0.85)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(7.4, 7, 8.6, 15, 5.4, 21);
  ctx.lineTo(0, 17.5);
  ctx.lineTo(-5.4, 21);
  ctx.bezierCurveTo(-8.6, 15, -7.4, 7, 0, 0);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -8, 0, 8, 0, [
    [0, '#58616c'],
    [0.46, '#f8fbff'],
    [0.54, '#a3adb8'],
    [1, '#4a525c'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(15,20,26,0.85)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(60,70,82,0.6)';
  ctx.beginPath();
  ctx.moveTo(0, 2);
  ctx.lineTo(0, 17);
  ctx.stroke();
  ctx.strokeStyle = '#d8b04a';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 58, 3.4, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#c1121f';
  ctx.fillRect(-2.6, 54.6, 5.2, 2.2);
}

// ───────────────────────── plasma orb ─────────────────────────
export interface PlasmaOrbPalette {
  outerGlow: string; innerGlow: string;
  coreLight: string; coreMid: string; coreEdge: string;
  filament: string; outline: string;
}
export const GREEN_PLASMA_ORB: Readonly<PlasmaOrbPalette> = {
  outerGlow: '40,255,140', innerGlow: '170,255,210',
  coreLight: '#c9ffdc', coreMid: '#33e87c', coreEdge: '#08863f',
  filament: '215,255,228', outline: 'rgba(190,255,215,0.9)',
};
export const YELLOW_PLASMA_ORB: Readonly<PlasmaOrbPalette> = {
  outerGlow: '255,209,28', innerGlow: '255,244,165',
  coreLight: '#fff8bc', coreMid: '#ffe02b', coreEdge: '#b47e06',
  filament: '255,247,200', outline: 'rgba(255,239,155,0.95)',
};

export function drawPlasmaOrb(
  ctx: Ctx, x: number, y: number, r: number, t: number, power = 1,
  color: Readonly<PlasmaOrbPalette> = GREEN_PLASMA_ORB,
  coreSprite?: HTMLCanvasElement | null,
) {
  // The old green path remains identical. A colored sprite can be supplied for
  // long-lived copies so many stuck orbs do not build gradients every frame.
  const alpha = Number.isFinite(ctx.globalAlpha) ? ctx.globalAlpha : 1;
  const alphaForGlow = color === GREEN_PLASMA_ORB ? 1 : alpha;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  drawSprite(ctx, glowSprite(color.outerGlow), x, y, r * 6.4, 0.6 * power * alphaForGlow);
  drawSprite(ctx, glowSprite(color.innerGlow), x, y, r * 3, 0.5 * power * alphaForGlow);
  ctx.restore();
  if (coreSprite) {
    ctx.drawImage(coreSprite, x - r, y - r, r * 2, r * 2);
  } else {
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, color.coreLight);
    g.addColorStop(0.7, color.coreMid);
    g.addColorStop(1, color.coreEdge);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    ctx.strokeStyle = `rgba(${color.filament},${0.6 - k * 0.14})`;
    ctx.lineWidth = r * 0.2;
    const a0 = t * (5 + k * 1.7) + k * 2.1;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a0) * r * 0.2, y + Math.sin(a0) * r * 0.2, r * (0.42 + k * 0.17), a0, a0 + 1.7);
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = color.outline;
  ctx.lineWidth = Math.max(0.8, r * 0.08);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.stroke();
}

/** small copper-jacket bullet, nose up, centred */
export function drawMiniBullet(ctx: Ctx, L = 13, w = 5) {
  const top = -L / 2;
  const bot = L / 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2, bot);
  ctx.lineTo(-w / 2, top + L * 0.38);
  ctx.bezierCurveTo(-w / 2, top + L * 0.1, -w * 0.2, top, 0, top);
  ctx.bezierCurveTo(w * 0.2, top, w / 2, top + L * 0.1, w / 2, top + L * 0.38);
  ctx.lineTo(w / 2, bot);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, -w / 2, 0, w / 2, 0, [
    [0, '#6b3a05'],
    [0.2, '#d9a03a'],
    [0.45, '#fff0b8'],
    [0.7, '#e0a53c'],
    [1, '#5a3004'],
  ]);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,5,0.75)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

// ───────────────────────── stuck items (local frame: +X = outward, rim at x = R) ─────────────────────────
function ribbon(ctx: Ctx, len: number, amp: number, t: number, ph: number, col: string, w = 2.6) {
  ctx.strokeStyle = col;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let j = 0; j <= 10; j++) {
    const s = j / 10;
    const px = s * len;
    const py = Math.sin(s * 7 + t * 4 + ph) * amp * s;
    if (j === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = w * 0.3;
  ctx.stroke();
}

export function drawStuckItem3(ctx: Ctx, it: StuckItem, R: number, time: number) {
  switch (it.weapon) {
    case 'harpoon': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 5.5) * Math.sin(it.t * 52);
      ctx.save();
      ctx.translate(R, 0);
      ctx.rotate(wob);
      ctx.translate(-16, 0);
      ctx.rotate(-Math.PI / 2);
      drawHarpoonProj(ctx);
      ctx.restore();
      break;
    }
    case 'crossbow': {
      const wob = (it.wob ?? 0) * Math.exp(-it.t * 6) * Math.sin(it.t * 58);
      ctx.save();
      ctx.translate(R, 0);
      ctx.rotate(wob);
      ctx.translate(-17, 0);
      ctx.rotate(-Math.PI / 2);
      drawBolt(ctx);
      ctx.restore();
      break;
    }
    case 'chicken': {
      const sq = 1 + 0.42 * Math.exp(-it.t * 4.2) * Math.sin(it.t * 26);
      const flap = 0.55 * Math.exp(-it.t * 3) * Math.sin(it.t * 30);
      ctx.save();
      ctx.translate(R + 13, 0);
      ctx.rotate(Math.PI / 2);
      ctx.scale(1 / Math.sqrt(sq), sq);
      drawChicken(ctx, 0.7, flap, 0.2 + 0.4 * Math.max(0, Math.exp(-it.t * 4)));
      ctx.restore();
      break;
    }
    case 'confetti': {
      const rnd = mulberry32(Math.floor(it.seed * 997) + 11);
      ctx.save();
      ctx.translate(R + 1, 0);
      const sway = Math.sin(time * 3 + it.seed) * 0.1;
      for (let k = 0; k < 9; k++) {
        ctx.save();
        ctx.rotate(-1.25 + (k / 8) * 2.5 + sway);
        ribbon(ctx, 14 + rnd() * 20, 3 + rnd() * 3, time, k * 1.3, CONF_HEX[k % CONF_HEX.length], 2.6);
        ctx.restore();
      }
      for (let k = 0; k < 7; k++) {
        ctx.save();
        ctx.translate(rnd() * 12 - 2, (rnd() - 0.5) * 30);
        ctx.rotate(rnd() * TAU);
        ctx.fillStyle = CONF_HEX[Math.floor(rnd() * CONF_HEX.length)];
        ctx.fillRect(-2.6, -1.4, 5.2, 2.8);
        ctx.restore();
      }
      const bg = ctx.createRadialGradient(-1, -1, 0.5, 0, 0, 5.6);
      bg.addColorStop(0, '#ffffff');
      bg.addColorStop(0.5, '#ffd0ea');
      bg.addColorStop(1, '#d94f9b');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(1, 0, 5.4, 0, TAU);
      ctx.fill();
      const ph = (time * 0.6 + it.seed) % 1;
      if (ph < 0.16) {
        const k = Math.sin((ph / 0.16) * Math.PI);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, starSprite('255,235,255'), 10, -3, 22 * k, k, time);
        ctx.restore();
      }
      ctx.restore();
      break;
    }
    case 'seed': {
      const gr = clamp(it.t / 1.3, 0, 1);
      const e = easeOutCubic(gr);
      const sway = Math.sin(time * 2.2 + it.seed) * 0.1 * e;
      ctx.save();
      ctx.translate(R + 1, 0);
      ctx.fillStyle = '#4a2c14';
      ctx.beginPath();
      ctx.ellipse(1, 0, 4.4, 9, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#7a4c26';
      ctx.beginPath();
      ctx.ellipse(1.8, -2, 2.2, 4, 0, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.rotate(sway);
      const len = 4 + 26 * e;
      const stem = (lw: number, col: string) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(len * 0.5, sway * 22, len, 0);
        ctx.stroke();
      };
      stem(3.6, '#1d5e28');
      stem(2.2, '#47b04a');
      const lf = (at: number, ang: number, L: number) => {
        ctx.save();
        ctx.translate(len * at, 0);
        ctx.rotate(ang);
        drawLeaf(ctx, L, L * 0.42);
        ctx.restore();
      };
      if (gr > 0.18) {
        const k = easeOutCubic(clamp((gr - 0.18) / 0.35, 0, 1));
        lf(0.4, 1.0, 9 * k);
        lf(0.4, -1.0, 9 * k);
      }
      if (gr > 0.5) {
        const k = easeOutCubic(clamp((gr - 0.5) / 0.35, 0, 1));
        lf(0.75, 0.65, 12 * k);
        lf(0.75, -0.65, 12 * k);
      }
      if (gr > 0.84) {
        const k = easeOutCubic((gr - 0.84) / 0.16);
        ctx.translate(len, 0);
        for (let p = 0; p < 6; p++) {
          ctx.save();
          ctx.rotate((p / 6) * TAU + 0.3);
          ctx.fillStyle = p % 2 ? '#ff8fc0' : '#ffb3d5';
          ctx.strokeStyle = 'rgba(160,40,90,0.7)';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.ellipse(4.4 * k, 0, 4.4 * k, 2.6 * k, 0, 0, TAU);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.arc(0, 0, 2.6 * k, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      ctx.restore();
      break;
    }
    case 'pizza': {
      const sq = 1 + 0.12 * Math.exp(-it.t * 5) * Math.sin(it.t * 24);
      ctx.save();
      ctx.translate(R + 8, 0);
      ctx.rotate(-Math.PI / 2);
      ctx.scale(sq, 1 / sq);
      drawFastPizzaSlice(ctx, 34);
      ctx.restore();
      break;
    }
    case 'minigun': {
      ctx.save();
      ctx.translate(R + 1, 0);
      ctx.rotate(-Math.PI / 2);
      drawMiniBullet(ctx, 13, 5.2);
      ctx.restore();
      const hot = Math.max(0, 1 - it.t / 1.3);
      if (hot > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,150,50'), R + 3, 0, 26 * hot + 8, 0.8 * hot);
        ctx.restore();
      }
      break;
    }
    case 'plasma': {
      const pulse = 1 + 0.12 * Math.sin(time * 9 + it.seed);
      const r = 9 * pulse;
      drawPlasmaOrb(ctx, R + 3, 0, r, time * 1.5 + it.seed, 0.9);
      if (Math.random() < 0.45) {
        const a = Math.random() * TAU;
        const pts = makeBolt(R + 3 + Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6, R + 3 + Math.cos(a) * (r + 16), Math.sin(a) * (r + 16), 0.4, 3);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        for (const [w, c] of [
          [3, 'rgba(60,255,150,0.3)'],
          [1.1, 'rgba(190,255,215,0.95)'],
        ] as [number, string][]) {
          ctx.strokeStyle = c;
          ctx.lineWidth = w;
          ctx.beginPath();
          ctx.moveTo(pts[0], pts[1]);
          for (let k = 2; k < pts.length; k += 2) ctx.lineTo(pts[k], pts[k + 1]);
          ctx.stroke();
        }
        ctx.restore();
      }
      break;
    }
    case 'laser': {
      const hot = Math.max(0, 1 - it.t / 2.6);
      ctx.save();
      ctx.translate(R - 1.5, 0);
      ctx.fillStyle = 'rgba(14,6,3,0.82)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.2, 6.4, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      const fl = 0.8 + 0.2 * Math.sin(time * 30 + it.seed);
      drawSprite(ctx, glowSprite('255,70,50'), 0, 0, 24 * (0.4 + hot), 0.9 * hot * fl);
      drawSprite(ctx, glowSprite('255,240,220'), 0, 0, 8 * hot + 2, hot);
      ctx.restore();
      break;
    }
    default:
      drawStuckItem4(ctx, it, R, time);
      break;
  }
}

// ───────────────────────── HUD ammo glyphs (g pre-translated to centre, scaled 2.2x) ─────────────────────────
export function drawAmmoGlyph3(g: Ctx, weapon: WeaponId) {
  switch (weapon) {
    case 'harpoon':
      g.save();
      g.scale(0.5, 0.5);
      g.translate(0, -29);
      drawHarpoonProj(g);
      g.restore();
      break;
    case 'chicken':
      g.save();
      g.scale(0.5, 0.5);
      drawChicken(g, 1, 0.1, 0.3);
      g.restore();
      break;
    case 'confetti':
      g.save();
      for (let i = 0; i < 7; i++) {
        g.save();
        g.rotate(i * 0.9);
        g.translate(6 + (i % 2) * 2, 0);
        g.fillStyle = CONF_HEX[i % CONF_HEX.length];
        g.fillRect(-2.4, -1.2, 4.8, 2.4);
        g.restore();
      }
      g.fillStyle = '#ffd0ea';
      g.beginPath();
      g.arc(0, 0, 3.6, 0, TAU);
      g.fill();
      g.restore();
      break;
    case 'seed':
      drawSeed(g, 22, 9);
      break;
    case 'pizza':
      g.save();
      g.rotate(0.3);
      drawFastPizzaSlice(g, 24);
      g.restore();
      break;
    case 'minigun':
      drawMiniBullet(g, 22, 8.4);
      break;
    case 'crossbow':
      g.save();
      g.scale(0.5, 0.5);
      g.translate(0, -26);
      drawBolt(g);
      g.restore();
      break;
    case 'plasma': {
      const rg = g.createRadialGradient(-2, -2, 1, 0, 0, 9.5);
      rg.addColorStop(0, '#ffffff');
      rg.addColorStop(0.4, '#9dffc4');
      rg.addColorStop(0.8, '#1fcf6a');
      rg.addColorStop(1, '#08863f');
      g.fillStyle = rg;
      g.beginPath();
      g.arc(0, 0, 9.5, 0, TAU);
      g.fill();
      break;
    }
    case 'laser':
      g.beginPath();
      g.roundRect?.(-3, -11, 6, 22, 3);
      g.fillStyle = lin(g, -3, 0, 3, 0, [
        [0, '#ff2d3e'],
        [0.5, '#fff0ee'],
        [1, '#ff2d3e'],
      ]);
      g.fill();
      break;
    default:
      drawAmmoGlyph4(g, weapon);
      break;
  }
}
