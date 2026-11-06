import { slide23Sfx } from './slide23Sfx';

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const smooth = (x: number) => {
  const t = clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
};

export const yoyoHsl = (h: number, s = 95, l = 60, a = 1) =>
  `hsla(${((Math.round(h) % 360) + 360) % 360},${s}%,${l}%,${a})`;

/** Slide #2 ammo hue progression: (i * 61) % 360 */
export function yoyoAmmoHue(index: number): number {
  return ((index * 61) % 360 + 360) % 360;
}

/** Slide #2 wheel hue progression for yoyo: (level * 53) % 360 */
export function yoyoWheelHue(level: number): number {
  return ((level * 53) % 360 + 360) % 360;
}

function softGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hue: number,
  s: number,
  l: number,
  alpha = 0.5,
) {
  if (r <= 0 || alpha <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, yoyoHsl(hue, s, Math.min(96, l + 18), alpha));
  g.addColorStop(0.4, yoyoHsl(hue, s, l, alpha * 0.55));
  g.addColorStop(1, yoyoHsl(hue, s, l, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function star4(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot = 0,
  color = '#ffffff',
  alpha = 1,
) {
  if (r <= 0 || alpha <= 0.01) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const d = i % 2 === 0 ? r : r * 0.22;
    const px = Math.cos(a) * d;
    const py = Math.sin(a) * d;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Exact Yoyo wheel shape & animation from Slide #6 (`games/weaponskins/src/engine/weapons/yoyo.ts` `drawYoyo`).
 */
export function drawSlide6Yoyo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rot: number,
  spin = 0,
  hue = 0,
  flash = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  softGlow(ctx, 0, 0, r * 2.2, hue + 320, 100, 60, 0.3 + 0.2 * spin);

  // Pelek warna-warni (conic gradient with safe fallback for test proxy contexts)
  const cg =
    typeof ctx.createConicGradient === 'function' ? ctx.createConicGradient(rot, 0, 0) : null;
  if (cg) {
    const n = 12;
    for (let i = 0; i <= n; i++) cg.addColorStop(i / n, yoyoHsl(hue + i * 30, 95, 60));
    ctx.fillStyle = cg;
  } else {
    const lg = ctx.createLinearGradient(-r, -r, r, r);
    lg.addColorStop(0, yoyoHsl(hue, 95, 60));
    lg.addColorStop(0.5, yoyoHsl(hue + 120, 95, 60));
    lg.addColorStop(1, yoyoHsl(hue + 240, 95, 60));
    ctx.fillStyle = lg;
  }
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();

  // Tepi mengilap
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = r * 0.07;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.965, 0, TAU);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(50,10,90,0.5)';
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.77, 0, TAU);
  ctx.stroke();

  // Cakram dalam
  const ig = ctx.createRadialGradient(-r * 0.22, -r * 0.28, r * 0.05, 0, 0, r * 0.76);
  ig.addColorStop(0, '#ffffff');
  ig.addColorStop(0.55, '#ffe0f4');
  ig.addColorStop(1, '#ff9ad6');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.74, 0, TAU);
  ctx.fill();

  // Irisan berputar
  ctx.save();
  ctx.rotate(rot * 1.1);
  for (let k = 0; k < 8; k += 2) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 0.73, (k * TAU) / 8, ((k + 1) * TAU) / 8);
    ctx.closePath();
    ctx.fillStyle = yoyoHsl(hue + k * 45, 95, 60, 0.6 * (1 - spin * 0.75));
    ctx.fill();
  }
  ctx.restore();

  if (spin > 0.2) {
    // Kabur gerak: cincin konsentris
    ctx.strokeStyle = `rgba(255,255,255,${0.35 * spin})`;
    ctx.lineWidth = 1.3;
    for (let k = 1; k < 4; k++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.15 + k * 0.17), 0, TAU);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = r * 0.035;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.45, 0, TAU);
  ctx.stroke();

  // As tengah + bintang
  const ag = ctx.createRadialGradient(-r * 0.05, -r * 0.06, 0.5, 0, 0, r * 0.2);
  ag.addColorStop(0, '#ffffff');
  ag.addColorStop(0.5, '#ffe14a');
  ag.addColorStop(1, '#ff8a2a');
  ctx.fillStyle = ag;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.rotate(-rot * 1.3);
  ctx.fillStyle = '#7b3dff';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10 - Math.PI / 2;
    const rad = i % 2 ? r * 0.05 : r * 0.12;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Kilau
  ctx.save();
  ctx.rotate(-0.75);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.84, r * 0.3, r * 0.06, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.65})`;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Elastic wavy string from Slide #6 (`drawString` in `games/weaponskins/src/engine/weapons/yoyo.ts`).
 */
export function drawSlide6String(
  ctx: CanvasRenderingContext2D,
  a: { x: number; y: number },
  b: { x: number; y: number },
  amp: number,
  waves: number,
  phase: number,
  sag: number,
  alpha = 1,
  hue?: number,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const A = Math.min(amp, len * 0.3);
  const N = 24;
  const path = () => {
    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const env = Math.sin(Math.PI * u);
      const off = A * env * Math.sin(u * waves * TAU + phase);
      const x = a.x + dx * u + nx * off;
      const y = a.y + dy * u + ny * off + sag * 4 * u * (1 - u);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  };
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'lighter';
  path();
  ctx.strokeStyle = hue !== undefined ? yoyoHsl(hue, 95, 72, 0.55) : 'rgba(255,170,240,0.35)';
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 4.2;
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  path();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

const YX = 174; // pusat yoyo (moncong) in Slide #6 local coordinates
const YR = 54;
const ANCH = { x: 76, y: -62 }; // titik keluar tali dari gulungan in Slide #6 local coordinates
const GUN_SCALE = 0.48;

/**
 * Exact Yoyo Gun body & yoyo shooting/catch-back animation from Slide #6
 * (`YoyoGun.drawBody` in `games/weaponskins/src/engine/weapons/yoyo.ts`),
 * oriented vertically for SGA so the muzzle yoyo sits at `(cx, y0)` pointing upward (`-y`).
 */
export function drawSlide6YoyoGun(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y0: number,
  t: number,
  ready: boolean,
  sinceShot = 9,
  nextHue = 0,
  inPreview = false,
) {
  const safeSince = Number.isFinite(sinceShot) && sinceShot >= 0 ? sinceShot : 9;
  const kickEnv =
    safeSince < 0.03
      ? safeSince / 0.03
      : safeSince < 1.2
        ? Math.exp(-(safeSince - 0.03) * 9) * Math.cos((safeSince - 0.03) * 13)
        : 0;
  const recoilShift = -10 * kickEnv;
  const out = !ready || safeSince < 0.14;
  const catchT = out ? 99 : Math.max(0, safeSince - 0.14);
  const wobble = out ? 0 : Math.exp(-catchT * 3.2);
  const reelSpin = t * 2.8 + (safeSince < 0.8 ? Math.exp(-safeSince * 4) * 12 : 0);

  const bob = Math.sin(t * 2.3) * 8;
  const sway = Math.sin(t * 1.7) * 0.12;
  const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);

  ctx.save();
  ctx.translate(cx, y0);
  ctx.scale(GUN_SCALE, GUN_SCALE);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(-(YX + YR) + recoilShift, 0);

  // Pendar latar
  ctx.save();
  ctx.translate(40, 8);
  ctx.scale(1, 0.45);
  softGlow(ctx, 0, 0, 230, 322, 100, 68, 0.14 + 0.05 * pulse);
  ctx.restore();

  // ===== Gagang =====
  ctx.beginPath();
  ctx.moveTo(-122, 28);
  ctx.lineTo(-64, 32);
  ctx.quadraticCurveTo(-58, 78, -62, 110);
  ctx.quadraticCurveTo(-64, 126, -82, 127);
  ctx.lineTo(-104, 127);
  ctx.quadraticCurveTo(-124, 125, -124, 106);
  ctx.quadraticCurveTo(-126, 68, -122, 28);
  ctx.closePath();
  const gg = ctx.createLinearGradient(-124, 30, -62, 120);
  gg.addColorStop(0, '#ffe45a');
  gg.addColorStop(1, '#ff8f2e');
  ctx.fillStyle = gg;
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke();

  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(190,80,20,0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(-126, 58 + i * 14);
    ctx.quadraticCurveTo(-92, 66 + i * 14, -58, 58 + i * 14);
    ctx.stroke();
  }
  ctx.restore();

  // Lencana bintang
  ctx.fillStyle = '#ff4fa3';
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * TAU) / 10 - Math.PI / 2;
    const rad = i % 2 ? 4 : 9;
    const px = -92 + Math.cos(a) * rad;
    const py = 42 + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Pelindung picu
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#1fd2ee';
  ctx.beginPath();
  ctx.moveTo(-60, 40);
  ctx.bezierCurveTo(-56, 84, -4, 84, 0, 44);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#ff4fa3';
  ctx.beginPath();
  ctx.moveTo(-34, 44);
  ctx.lineTo(-30, 62);
  ctx.stroke();
  ctx.restore();

  // ===== Badan kapsul =====
  const body = () => {
    ctx.beginPath();
    ctx.roundRect(-156, -42, 262, 84, 40);
  };
  ctx.save();
  ctx.shadowColor = 'rgba(255,120,210,0.55)';
  ctx.shadowBlur = 22;
  body();
  const bg = ctx.createLinearGradient(0, -42, 0, 42);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.55, '#ffe4f3');
  bg.addColorStop(1, '#ffa6d4');
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  ctx.save();
  body();
  ctx.clip();
  // Tutup kuning belakang
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.moveTo(-160, -50);
  ctx.lineTo(-114, -50);
  ctx.quadraticCurveTo(-98, 0, -114, 50);
  ctx.lineTo(-160, 50);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pita diagonal tosca & ungu
  const sg = ctx.createLinearGradient(-30, 0, 40, 0);
  sg.addColorStop(0, '#2ee6ff');
  sg.addColorStop(1, '#8a5bff');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-26, -46);
  ctx.lineTo(26, -46);
  ctx.lineTo(-4, 46);
  ctx.lineTo(-56, 46);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffd23f';
  ctx.beginPath();
  ctx.moveTo(34, -46);
  ctx.lineTo(48, -46);
  ctx.lineTo(18, 46);
  ctx.lineTo(4, 46);
  ctx.closePath();
  ctx.fill();

  // Polkadot
  ctx.fillStyle = 'rgba(255,79,163,0.75)';
  const dots: [number, number, number][] = [
    [-94, -24, 6],
    [-80, 6, 4.5],
    [-98, 20, 3.5],
    [66, -14, 5],
    [82, 12, 4],
    [92, -20, 3],
  ];
  for (const [dx, dy, dr] of dots) {
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, TAU);
    ctx.fill();
  }

  // Kilau atas
  const gl = ctx.createLinearGradient(0, -42, 0, -12);
  gl.addColorStop(0, 'rgba(255,255,255,0.95)');
  gl.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.beginPath();
  ctx.roundRect(-130, -38, 220, 22, 12);
  ctx.fill();

  // Bayangan bawah
  const sh = ctx.createLinearGradient(0, 14, 0, 42);
  sh.addColorStop(0, 'rgba(200,60,150,0)');
  sh.addColorStop(1, 'rgba(200,60,150,0.35)');
  ctx.fillStyle = sh;
  ctx.fillRect(-160, 14, 270, 30);
  ctx.restore();

  ctx.lineWidth = 1.6;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  body();
  ctx.stroke();

  // ===== Gulungan tali =====
  ctx.save();
  ctx.translate(66, -54);
  ctx.fillStyle = '#7b3dff';
  ctx.beginPath();
  ctx.roundRect(-9, 4, 18, 14, 4);
  ctx.fill();
  const rg = ctx.createRadialGradient(-3, -4, 2, 0, 0, 17);
  rg.addColorStop(0, '#b6f6ff');
  rg.addColorStop(0.6, '#2ee6ff');
  rg.addColorStop(1, '#1b8fc9');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 1;
  for (let k = 1; k < 3; k++) {
    ctx.beginPath();
    ctx.arc(0, 0, 4 + k * 3.4, 0, TAU);
    ctx.stroke();
  }
  ctx.save();
  ctx.rotate(reelSpin);
  ctx.strokeStyle = '#ff4fa3';
  ctx.lineWidth = 2;
  for (let k = 0; k < 3; k++) {
    ctx.rotate(TAU / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(11, 0);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 2.6, 0, TAU);
  ctx.fill();
  ctx.restore();

  // ===== Dudukan (cradle) yoyo =====
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#18b8d8';
  ctx.beginPath();
  ctx.arc(YX, 0, YR + 9, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#2ee6ff';
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(YX, 0, YR + 10.5, Math.PI * 0.64, Math.PI * 1.36);
  ctx.stroke();
  ctx.restore();

  if (out) {
    // Dudukan kosong saat yoyo dilontarkan: cincin hantu + as
    ctx.save();
    ctx.globalAlpha = 0.28 + 0.15 * pulse;
    if (typeof ctx.setLineDash === 'function') ctx.setLineDash([6, 7]);
    ctx.lineDashOffset = -t * 30;
    ctx.strokeStyle = '#ffd0f2';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(YX, 0, YR, 0, TAU);
    ctx.stroke();
    if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
    ctx.restore();
    softGlow(ctx, YX, 0, 26, 318, 100, 74, 0.4 + 0.2 * pulse);
    ctx.fillStyle = '#ffe14a';
    ctx.beginPath();
    ctx.arc(YX, 0, 6, 0, TAU);
    ctx.fill();
    if (inPreview && safeSince < 0.14) {
      const u = safeSince / 0.14;
      const flyX = YX + Math.sin(u * Math.PI) * 96;
      drawSlide6String(
        ctx,
        { x: ANCH.x, y: ANCH.y },
        { x: flyX - 6, y: 0 },
        6,
        3,
        t * 28,
        0,
        1,
        nextHue,
      );
      drawSlide6Yoyo(ctx, flyX, 0, YR * 0.9, t * 22, 0.4 * (1 - u), nextHue);
    }
  } else {
    // Tali (dengan getar elastis setelah ditangkap kembali)
    const a = { x: ANCH.x, y: ANCH.y };
    const b = { x: YX - 6, y: bob - 6 };
    drawSlide6String(
      ctx,
      a,
      b,
      1.2 + 9 * wobble,
      2 + wobble * 1.5,
      t * 3 + catchT * 30,
      5 + bob * 0.3,
      1,
      nextHue,
    );

    // Yoyo di dudukan (berputar 10x lebih cepat dari sebelumnya: t * 16)
    const cs =
      catchT < 1.2 ? 1 + 0.26 * Math.exp(-catchT * 8) * Math.cos(catchT * 24) : 1;
    ctx.save();
    ctx.translate(YX, bob);
    ctx.rotate(sway);
    ctx.scale(cs, cs);
    drawSlide6Yoyo(ctx, 0, 0, YR, t * 16, 0, nextHue + Math.sin(t * 0.4) * 20);
    ctx.restore();

    // Percik bintang berkelip
    for (let k = 0; k < 3; k++) {
      const ang = t * 0.9 + k * 2.1;
      const al = 0.5 + 0.5 * Math.sin(t * 3 + k * 2);
      star4(
        ctx,
        YX + Math.cos(ang) * YR * 1.35,
        bob + Math.sin(ang) * YR * 1.2,
        3 + 4 * al,
        ang,
        yoyoHsl(k * 120 + 330, 100, 82),
        al * 0.9,
      );
    }

    if (catchT < 0.45) {
      const u = catchT / 0.45;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1 - u;
      ctx.strokeStyle = yoyoHsl(330 + u * 200, 100, 75);
      ctx.lineWidth = 3 * (1 - u) + 0.5;
      ctx.beginPath();
      ctx.arc(YX, bob, YR * (1 + u * 0.9), 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}

/* ============================================================================
 * Slide #2 (`games/firework/src/game/engine.ts`) Yoyo Effects, Stuck Yoyo,
 * Elastic String Snap, and Background Atmosphere
 * ========================================================================== */

export interface YoyoParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  h: number;
  s: number;
  l: number;
  g: number;
  d: number;
  tr: number;
  tw: boolean;
}

export interface YoyoGlow {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface YoyoRing {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface YoyoStringSnap {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  life: number;
  max: number;
  hue: number;
}

export interface YoyoStar {
  x: number;
  y: number;
  r: number;
  sp: number;
  ph: number;
}

export interface YoyoBuilding {
  x: number;
  w: number;
  h: number;
  wins: { x: number; y: number }[];
}

export interface YoyoSlideState {
  w: number;
  h: number;
  stars: YoyoStar[];
  skyline: YoyoBuilding[];
  particles: YoyoParticle[];
  glows: YoyoGlow[];
  rings: YoyoRing[];
  strings: YoyoStringSnap[];
  timers: { t: number; fn: () => void }[];
  shotIdx: number;
  wpulse: number;
  flash: number;
  flashHue: number;
  bgCanvas?: HTMLCanvasElement | null;
  bgDpr?: number;
}

export function createYoyoSlideState(w = 420, h = 760): YoyoSlideState {
  const stars: YoyoStar[] = [];
  for (let i = 0; i < 95; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * (h - 140),
      r: Math.random() < 0.18 ? 1.7 : 0.9,
      sp: 1.5 + Math.random() * 2.5,
      ph: Math.random() * TAU,
    });
  }

  const skyline: YoyoBuilding[] = [];
  let x = -10;
  let seed = 7;
  const sRand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  while (x < w + 10) {
    const bw = 22 + sRand() * 34;
    const bh = 40 + sRand() * 110;
    const wins: { x: number; y: number }[] = [];
    for (let wy = h - bh + 8; wy < h - 6; wy += 11) {
      for (let wx = x + 4; wx < x + bw - 5; wx += 8) {
        if (sRand() > 0.72) wins.push({ x: wx, y: wy });
      }
    }
    skyline.push({ x, w: bw, h: bh, wins });
    x += bw + 1 + sRand() * 4;
  }

  return {
    w,
    h,
    stars,
    skyline,
    particles: [],
    glows: [],
    rings: [],
    strings: [],
    timers: [],
    shotIdx: 0,
    wpulse: 0,
    flash: 0,
    flashHue: 320,
    bgCanvas: null,
    bgDpr: 0,
  };
}

function spawnParticle(
  state: YoyoSlideState,
  x: number,
  y: number,
  vx: number,
  vy: number,
  opts: Partial<YoyoParticle> = {},
) {
  if (state.particles.length > 900) return;
  const life = opts.life ?? rnd(0.45, 0.95);
  state.particles.push({
    x,
    y,
    vx,
    vy,
    life,
    max: life,
    size: opts.size ?? rnd(1.5, 2.8),
    h: ((opts.h ?? 30) % 360 + 360) % 360,
    s: opts.s ?? 100,
    l: opts.l ?? 66,
    g: opts.g ?? 0.05,
    d: opts.d ?? 0.96,
    tr: opts.tr ?? 2.2,
    tw: opts.tw ?? true,
  });
}

/**
 * Slide #2 `fire()` when `w === "yoyo"`:
 * springy launch puff + string snap sparkle + glow + ring + wpulse.
 */
export function spawnYoyoLaunch(state: YoyoSlideState, x: number, y: number, hue: number) {
  for (let i = 0; i < 14; i++) {
    const a = -Math.PI / 2 + rnd(-0.6, 0.6);
    const sp = rnd(2, 7);
    spawnParticle(state, x + rnd(-8, 8), y, Math.cos(a) * sp, Math.sin(a) * sp, {
      life: rnd(0.25, 0.5),
      size: rnd(1.3, 2.4),
      h: hue + rnd(-40, 40),
      s: 100,
      l: 68,
      g: 0.08,
      d: 0.93,
    });
  }
  state.glows.push({ x, y: y - 2, hue, life: 0.28, max: 0.28, r: 70 });
  state.rings.push({ x, y: y - 2, hue: hue + 60, life: 0.32, max: 0.32, r: 40 });
  state.wpulse = Math.min(1, state.wpulse + 0.4);
}

/**
 * Slide #2 in-flight trail sparks for `w === "yoyo"`.
 */
export function spawnYoyoFlightSparks(state: YoyoSlideState, x: number, y: number, hue: number) {
  for (let k = 0; k < 2; k++) {
    spawnParticle(state, x + rnd(-6, 6), y + 16 + rnd(0, 12), rnd(-0.8, 0.8), rnd(1.5, 3.5), {
      life: rnd(0.2, 0.45),
      size: rnd(1.3, 2.3),
      h: hue + k * 55 + rnd(-15, 15),
      s: 100,
      l: 68,
      g: 0.05,
      d: 0.92,
    });
  }
}

/**
 * Slide #2 `yoyoBurst(x, y, hue, scale)` — 52 rainbow particles in a full circle +
 * central white flash + 2 expanding rings + large radial glow.
 */
export function yoyoBurst(
  state: YoyoSlideState,
  x: number,
  y: number,
  hue: number,
  scale = 1,
) {
  const n = Math.round(52 * scale);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const sp = rnd(2.5, 6) * scale;
    spawnParticle(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
      life: rnd(0.5, 0.95),
      size: rnd(1.5, 2.6),
      h: hue + (i / n) * 160,
      s: 100,
      l: 66,
      g: 0.05,
      d: 0.955,
      tr: 2.6,
    });
  }
  spawnParticle(state, x, y, 0, 0, {
    life: 0.2,
    size: 20 * scale,
    h: 0,
    s: 0,
    l: 96,
    d: 1,
    g: 0,
    tr: 0,
    tw: false,
  });
  state.rings.push({ x, y, hue, life: 0.45, max: 0.45, r: 95 * scale });
  state.rings.push({ x, y, hue: hue + 80, life: 0.55, max: 0.55, r: 125 * scale });
  state.glows.push({ x, y, hue, life: 0.45, max: 0.45, r: 130 * scale + 20 });
}

/**
 * Slide #2 `stick()` for `w === "yoyo"`:
 * elastic string snaps back + `yoyoBurst` + screen flash + weapon vignette pulse.
 */
export function spawnYoyoStickBurst(
  state: YoyoSlideState,
  x: number,
  y: number,
  hue: number,
  gunX: number,
  gunY: number,
  scale = 1,
) {
  state.strings.push({
    x0: gunX,
    y0: gunY,
    x1: x,
    y1: y,
    life: 0.4,
    max: 0.4,
    hue,
  });
  state.flash = Math.max(state.flash, 0.18);
  state.flashHue = hue;
  state.wpulse = Math.min(1, state.wpulse + 0.55);
  yoyoBurst(state, x, y, hue, scale);
}

/**
 * Slide #2 `clearLevel()` for `w === "yoyo"`:
 * 5 staggered `yoyoBurst` explosions + large radial glow + screen flash.
 */
export function spawnYoyoClearFinale(state: YoyoSlideState, cx: number, cy: number) {
  state.flash = Math.max(state.flash, 0.55);
  state.flashHue = rnd(0, 360);
  state.glows.push({ x: cx, y: cy, hue: 40, life: 0.9, max: 0.9, r: 280 });
  yoyoBurst(state, cx, cy, rnd(0, 360), 1.25);
  for (let i = 1; i < 5; i++) {
    state.timers.push({
      t: i * 0.18,
      fn: () => {
        const a = rnd(0, TAU);
        slide23Sfx.sky('yoyo');
        yoyoBurst(state, cx + Math.cos(a) * 60, cy + Math.sin(a) * 60, rnd(0, 360), 1.2);
      },
    });
  }
}

/**
 * Slide #2 `failRocket()` for `w === "yoyo"`:
 */
export function spawnYoyoFailBurst(state: YoyoSlideState, x: number, y: number, hue: number) {
  state.flash = Math.max(state.flash, 0.7);
  state.flashHue = hue;
  yoyoBurst(state, x, y, hue, 1.2);
}

export function updateYoyoSlideState(
  state: YoyoSlideState,
  dt: number,
  stuckPins: { x: number; y: number; hue: number; age: number }[] = [],
) {
  const f = dt * 60;
  state.wpulse = Math.max(0, state.wpulse - dt * 1.4);
  state.flash = Math.max(0, state.flash - dt * 2.2);

  for (let i = state.timers.length - 1; i >= 0; i--) {
    state.timers[i].t -= dt;
    if (state.timers[i].t <= 0) {
      const fn = state.timers[i].fn;
      state.timers.splice(i, 1);
      fn();
    }
  }

  // Stuck yoyo pins: fast impact spin sparks (first 0.5s) + ambient rim sparks (Slide #2 lines 1568-1581 & 1666-1680)
  for (const p of stuckPins) {
    if (p.age < 0.5) {
      for (let k = 0; k < 2; k++) {
        const a = rnd(0, TAU);
        const sp = rnd(2, 5.5);
        spawnParticle(state, p.x, p.y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.25, 0.5),
          size: rnd(1.3, 2.3),
          h: p.hue + rnd(0, 160),
          s: 100,
          l: 68,
          g: 0.04,
          d: 0.93,
        });
      }
    }
    if (Math.random() < 0.28 * f) {
      const a = rnd(0, TAU);
      spawnParticle(state, p.x, p.y, Math.cos(a) * rnd(0.5, 1.6), Math.sin(a) * rnd(0.5, 1.6), {
        life: rnd(0.35, 0.7),
        size: rnd(1.1, 1.9),
        h: p.hue + rnd(-50, 50),
        s: 100,
        l: 70,
        g: 0,
        d: 0.95,
      });
    }
  }

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    const dr = Math.pow(p.d, f);
    p.vx *= dr;
    p.vy *= dr;
    p.vy += p.g * f;
    p.x += p.vx * f;
    p.y += p.vy * f;
    p.life -= dt;
    if (p.life <= 0) {
      state.particles[i] = state.particles[state.particles.length - 1];
      state.particles.pop();
    }
  }

  for (let i = state.glows.length - 1; i >= 0; i--) {
    state.glows[i].life -= dt;
    if (state.glows[i].life <= 0) state.glows.splice(i, 1);
  }
  for (let i = state.rings.length - 1; i >= 0; i--) {
    state.rings[i].life -= dt;
    if (state.rings[i].life <= 0) state.rings.splice(i, 1);
  }
  for (let i = state.strings.length - 1; i >= 0; i--) {
    state.strings[i].life -= dt;
    if (state.strings[i].life <= 0) state.strings.splice(i, 1);
  }
}

function paintStaticBackdrop(c: CanvasRenderingContext2D, state: YoyoSlideState) {
  const { w, h, skyline } = state;
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#04010f');
  g.addColorStop(0.45, '#12062e');
  g.addColorStop(0.8, '#2a0f4a');
  g.addColorStop(1, '#4a1747');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  const hz = c.createRadialGradient(w / 2, h, 10, w / 2, h, 420);
  hz.addColorStop(0, 'rgba(255,120,160,0.25)');
  hz.addColorStop(1, 'rgba(255,120,160,0)');
  c.fillStyle = hz;
  c.fillRect(0, 0, w, h);

  for (const b of skyline) {
    c.fillStyle = '#0b0420';
    c.fillRect(b.x, h - b.h, b.w, b.h);
    c.fillStyle = 'rgba(255,210,120,0.55)';
    for (const win of b.wins) {
      c.fillRect(win.x, win.y, 3, 4);
    }
  }
}

/**
 * Slide #2 background when `w === "yoyo"`:
 * night skyline + twinkling stars + purple/indigo/rose yoyo atmosphere gradient +
 * 14 twinkling rainbow dots + glows + target wheel rainbow glow.
 */
export function drawYoyoSlideBackground(
  c: CanvasRenderingContext2D,
  state: YoyoSlideState,
  dpr: number,
  cx: number,
  cy: number,
  R: number,
  level: number,
  time: number,
) {
  const { w, h } = state;
  if (typeof document !== 'undefined' && (!state.bgCanvas || state.bgDpr !== dpr)) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    const bc = cv.getContext('2d');
    if (bc) {
      bc.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintStaticBackdrop(bc, state);
      state.bgCanvas = cv;
      state.bgDpr = dpr;
    }
  }

  if (state.bgCanvas) {
    c.drawImage(state.bgCanvas, 0, 0, w, h);
  } else {
    paintStaticBackdrop(c, state);
  }

  // Twinkling stars
  for (const s of state.stars) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(time * s.sp + s.ph));
    c.fillStyle = `rgba(255,255,255,${a * 0.85})`;
    c.beginPath();
    c.arc(s.x, s.y, s.r, 0, TAU);
    c.fill();
  }

  // Slide #2 yoyo atmosphere overlay
  const yg = c.createLinearGradient(0, 0, 0, h);
  yg.addColorStop(0, 'rgba(60,10,60,0.2)');
  yg.addColorStop(0.6, 'rgba(20,20,80,0.08)');
  yg.addColorStop(1, 'rgba(80,20,40,0.2)');
  c.fillStyle = yg;
  c.fillRect(0, 0, w, h);

  c.save();
  c.globalAlpha = 0.5;
  for (let i = 0; i < 14; i++) {
    const px = (i * 97 + 31) % w;
    const py = (i * 211 + 60) % (h - 100);
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(time * 2 + i * 1.1));
    c.fillStyle = yoyoHsl((i * 47 + time * 20) % 360, 100, 70, 0.35 * tw);
    c.beginPath();
    c.arc(px, py, 2.2, 0, TAU);
    c.fill();
  }
  c.restore();

  // Additive glows + target wheel rainbow glow
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (const g of state.glows) {
    const k = Math.max(0, g.life / g.max);
    const rad = g.r * (1.3 - 0.3 * k);
    const gr = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, rad);
    gr.addColorStop(0, yoyoHsl(g.hue, 100, 60, 0.38 * k));
    gr.addColorStop(1, yoyoHsl(g.hue, 100, 50, 0));
    c.fillStyle = gr;
    c.fillRect(g.x - rad, g.y - rad, rad * 2, rad * 2);
  }

  const wheelHue = yoyoWheelHue(level);
  const og = c.createRadialGradient(cx, cy, R * 0.8, cx, cy, R + 85);
  og.addColorStop(0, yoyoHsl(wheelHue, 100, 55, 0.32));
  og.addColorStop(1, yoyoHsl(wheelHue, 100, 55, 0));
  c.fillStyle = og;
  c.beginPath();
  c.arc(cx, cy, R + 85, 0, TAU);
  c.fill();
  c.restore();
}

export function drawYoyoSlideGunGlow(
  c: CanvasRenderingContext2D,
  cx: number,
  gunY: number,
  nextHue: number,
  recoil: number,
) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const gg = c.createRadialGradient(cx, gunY, 10, cx, gunY, 130);
  gg.addColorStop(0, yoyoHsl(nextHue, 100, 60, 0.2 + recoil * 0.25));
  gg.addColorStop(1, yoyoHsl(nextHue, 100, 60, 0));
  c.fillStyle = gg;
  c.fillRect(cx - 140, gunY - 140, 280, 280);
  c.restore();
}

/**
 * Draws the fast-spin speed arcs when a yoyo first hits/sticks on the wheel (for `age < 0.55`).
 */
export function drawYoyoSlideStuckSpinFx(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  age: number,
  time: number,
  hue: number,
) {
  if (age >= 0.55) return;
  const pt = clamp(age / 0.55, 0, 1);
  const k = easeOutCubic(Math.min(1, pt * 6)) * (1 - smooth((pt - 0.65) / 0.35));
  if (k <= 0.01) return;
  const rot = time * 32;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  for (let j = 0; j < 3; j++) {
    const R = r * (1.28 + j * 0.38) + 2.5 * Math.sin(age * 22 + j);
    const dir = j % 2 ? -1 : 1;
    for (let m = 0; m < 3; m++) {
      const st = rot * 0.55 * dir + (m * TAU) / 3 + j;
      c.strokeStyle = yoyoHsl(hue + j * 70 + m * 40, 100, 66);
      c.globalAlpha = 0.85 * k;
      c.lineWidth = 3.5 - j * 0.8;
      c.beginPath();
      c.arc(x, y, R, st, st + 1.25);
      c.stroke();
    }
  }
  c.globalAlpha = 0.5 * k;
  c.lineWidth = 1.4;
  for (let i = 0; i < 12; i++) {
    const an = rot * 0.4 + (i * TAU) / 12;
    c.strokeStyle = yoyoHsl(hue + i * 30, 100, 72);
    c.beginPath();
    c.moveTo(x + Math.cos(an) * r * 1.55, y + Math.sin(an) * r * 1.55);
    c.lineTo(x + Math.cos(an) * r * 2.25, y + Math.sin(an) * r * 2.25);
    c.stroke();
  }
  c.restore();
}

export function drawYoyoSlideParticlesRingsAndStrings(
  c: CanvasRenderingContext2D,
  state: YoyoSlideState,
  cx: number,
  cy: number,
  time: number,
) {
  // Elastic string snap-backs (Slide #2 `drawStrings`)
  for (const s of state.strings) {
    const k = Math.max(0, s.life / s.max);
    const wob = Math.sin(time * 22 + s.x0) * 6 * k;
    const mx = (s.x0 + s.x1) / 2 + wob;
    const my = (s.y0 + s.y1) / 2;
    c.save();
    c.strokeStyle = yoyoHsl(s.hue, 90, 72, 0.85 * k);
    c.lineWidth = 2 * k + 0.6;
    c.beginPath();
    c.moveTo(s.x0, s.y0);
    c.quadraticCurveTo(mx, my, s.x1, s.y1);
    c.stroke();
    c.strokeStyle = `rgba(255,255,255,${0.5 * k})`;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(s.x0, s.y0);
    c.quadraticCurveTo(mx, my, s.x1, s.y1);
    c.stroke();
    c.restore();
  }

  // Particles & rings (Slide #2 `render`)
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'round';
  for (const p of state.particles) {
    const k = Math.max(0, p.life / p.max);
    let a = Math.pow(k, 0.7);
    if (p.tw && k < 0.6) a *= 0.55 + Math.random() * 0.45;
    const l = k > 0.88 ? Math.min(95, p.l + 25) : p.l - (1 - k) * 12;
    const size = p.size * (0.45 + 0.55 * k);
    c.strokeStyle = yoyoHsl(p.h, p.s, l, a);
    c.lineWidth = size * 1.6;
    c.beginPath();
    c.moveTo(p.x - p.vx * p.tr, p.y - p.vy * p.tr);
    c.lineTo(p.x, p.y);
    c.stroke();
    if (size > 2.1 && a > 0.2) {
      c.fillStyle = yoyoHsl(p.h, p.s, 70, a * 0.18);
      c.beginPath();
      c.arc(p.x, p.y, size * 3.2, 0, TAU);
      c.fill();
    }
  }

  for (const r of state.rings) {
    const k = Math.max(0, r.life / r.max);
    c.strokeStyle = yoyoHsl(r.hue, 100, 70, 0.7 * k);
    c.lineWidth = 3 * k + 0.5;
    c.beginPath();
    c.arc(r.x, r.y, r.r * (1 - k * k) + 4, 0, TAU);
    c.stroke();
  }
  c.restore();

  // Slide #2 rainbow weapon vignette pulse & impact flash
  if (state.wpulse > 0.01) {
    const hue = (time * 120) % 360;
    const vg = c.createRadialGradient(cx, cy, 60, cx, cy, 430);
    vg.addColorStop(0, yoyoHsl(hue, 100, 60, 0));
    vg.addColorStop(1, yoyoHsl(hue, 100, 60, 0.35 * state.wpulse));
    c.fillStyle = vg;
    c.fillRect(0, 0, state.w, state.h);
  }
  if (state.flash > 0.01) {
    c.fillStyle = yoyoHsl(state.flashHue, 100, 70, Math.min(0.35, state.flash * 0.38));
    c.fillRect(0, 0, state.w, state.h);
  }
}
