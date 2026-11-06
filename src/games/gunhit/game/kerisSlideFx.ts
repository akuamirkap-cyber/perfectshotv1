// Slide #8 ("Tap & Stick" — games/gunhitdev) Keris Halilintar weapon, effects & background
// combined with Slide #4 ("Keris Sakti" — games/keris) wavy Luk Keris blade (Wilah) design.

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export interface BoltSegment {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  thick: number;
  alpha: number;
}

export function createCrispBolt(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  opts: {
    sway?: number;
    steps?: number;
    branchChance?: number;
  } = {},
): BoltSegment[] {
  const segments: BoltSegment[] = [];
  const sway = opts.sway ?? 6;
  const steps = opts.steps ?? 6;
  const branchChance = opts.branchChance ?? 0.25;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;

  let curX = x0;
  let curY = y0;

  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    const envelope = Math.sin(u * Math.PI);
    const offset = (Math.random() - 0.5) * sway * envelope * 2;
    const nextX = x0 + dx * u + nx * offset;
    const nextY = y0 + dy * u + ny * offset;

    segments.push({
      x0: curX,
      y0: curY,
      x1: nextX,
      y1: nextY,
      thick: 1.2,
      alpha: 0.95,
    });

    if (i > 1 && i < steps && Math.random() < branchChance) {
      const bLen = dist * (0.12 + Math.random() * 0.15);
      const bAngle = (Math.random() - 0.5) * 1.1;
      const cosA = Math.cos(bAngle);
      const sinA = Math.sin(bAngle);
      const vx = (dx / dist) * bLen;
      const vy = (dy / dist) * bLen;
      const bx = curX + (vx * cosA - vy * sinA);
      const by = curY + (vx * sinA + vy * cosA);

      segments.push({
        x0: curX,
        y0: curY,
        x1: bx,
        y1: by,
        thick: 0.7,
        alpha: 0.6,
      });
    }

    curX = nextX;
    curY = nextY;
  }

  return segments;
}

export function renderCrispBolt(
  ctx: CanvasRenderingContext2D,
  segments: BoltSegment[],
  color = '#4deeea',
  bloomSize = 6,
) {
  if (segments.length === 0) return;
  void bloomSize;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeStyle = rgba(color, 0.22);
  ctx.lineWidth = 4.2;
  ctx.beginPath();
  for (const s of segments) {
    ctx.moveTo(s.x0, s.y0);
    ctx.lineTo(s.x1, s.y1);
  }
  ctx.stroke();

  ctx.strokeStyle = rgba(color, 0.8);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (const s of segments) {
    ctx.moveTo(s.x0, s.y0);
    ctx.lineTo(s.x1, s.y1);
  }
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.85;
  ctx.beginPath();
  for (const s of segments) {
    ctx.moveTo(s.x0, s.y0);
    ctx.lineTo(s.x1, s.y1);
  }
  ctx.stroke();

  ctx.restore();
}

export function drawCircleSurfaceArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweepAngle: number,
  seed = 0,
  glowColor = '#4deeea',
) {
  const steps = 8;
  const step = sweepAngle / steps;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = startAngle + i * step;
    const jitter = (Math.sin(i * 3.7 + seed * 11) - 0.5) * 3;
    const r = radius + jitter;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.strokeStyle = rgba(glowColor, 0.35);
  ctx.lineWidth = 3.0;
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.9;
  ctx.stroke();

  ctx.restore();
}

const GOLD = {
  bright: '#fff6cf',
  hi: '#ffe08a',
  mid: '#e8b64c',
  deep: '#b57d16',
  dark: '#8a5a10',
  ink: '#4a2c15',
};

function rgba(hex: string, a: number): string {
  const c = clamp(a, 0, 1);
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map(ch => ch + ch)
          .join('')
      : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${c.toFixed(3)})`;
}

function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  a = 1,
  color = '#ffffff',
) {
  if (a <= 0.01 || r <= 0.1) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rgba(color, a);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i * Math.PI) / 4;
    const rad = i % 2 === 0 ? r : r * 0.22;
    const px = Math.cos(ang) * rad;
    const py = Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function glowDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  core: string,
  a: number,
) {
  ctx.save();
  ctx.globalAlpha = clamp(a * 0.32, 0, 1);
  ctx.beginPath();
  ctx.arc(x, y, r * 2.6, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = clamp(a, 0, 1);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fillStyle = core;
  ctx.fill();
  ctx.restore();
}

type Pt = { x: number; y: number };

function boltPts(x0: number, y0: number, x1: number, y1: number, rough: number, seed = 0): Pt[] {
  let pts: Pt[] = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
  ];
  let off = rough;
  let s = seed + 1;
  for (let pass = 0; pass < 4; pass++) {
    const next: Pt[] = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      s = (s * 1664525 + 1013904223) >>> 0;
      const randSym = ((s & 0xffff) / 0x8000) - 1;
      const d = randSym * off;
      next.push({ x: (a.x + b.x) / 2 + nx * d, y: (a.y + b.y) / 2 + ny * d });
      next.push(b);
    }
    pts = next;
    off *= 0.5;
  }
  return pts;
}

function strokeJolt(ctx: CanvasRenderingContext2D, pts: Pt[], w: number, alpha: number) {
  if (alpha <= 0.01 || pts.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const passes: [number, string][] = [
    [w * 4.2, `rgba(255,170,40,${0.14 * alpha})`],
    [w * 2.1, `rgba(255,205,80,${0.46 * alpha})`],
    [w, `rgba(255,244,200,${0.9 * alpha})`],
    [w * 0.42, `rgba(255,255,252,${0.95 * alpha})`],
  ];
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  for (const [width, color] of passes) {
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  ctx.restore();
}

/* =========================================================================
   SLIDE #8 KERIS HULU, MENDAK, WARANGKA & GANJA
   ========================================================================= */

function drawKerisHulu(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(-6.5, 0);
  ctx.bezierCurveTo(-7.5, 12, -5.5, 26, -1.5, 38);
  ctx.bezierCurveTo(1.5, 46, 8.5, 48, 12.5, 42);
  ctx.bezierCurveTo(15.0, 38, 13.0, 31, 9.0, 29);
  ctx.bezierCurveTo(6.0, 28, 5.5, 22, 6.8, 13);
  ctx.bezierCurveTo(7.5, 6, 7.0, 2, 6.5, 0);
  ctx.closePath();

  const woodGrad = ctx.createLinearGradient(-8, 0, 14, 46);
  woodGrad.addColorStop(0, '#1e1107');
  woodGrad.addColorStop(0.28, '#3a210d');
  woodGrad.addColorStop(0.55, '#593518');
  woodGrad.addColorStop(0.8, '#291709');
  woodGrad.addColorStop(1, '#120a04');
  ctx.fillStyle = woodGrad;
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 227, 143, 0.72)';
  ctx.lineWidth = 0.95;
  ctx.stroke();

  // Ukiran Patra Emas di Punggung Gagang
  ctx.strokeStyle = 'rgba(255, 215, 110, 0.35)';
  ctx.lineWidth = 0.75;
  for (let i = 0; i < 3; i++) {
    const yOff = 10 + i * 7.5;
    ctx.beginPath();
    ctx.arc(0, yOff, 4.8 - i * 0.5, 0.25, Math.PI - 0.25);
    ctx.stroke();
  }

  // Sabuk Emas Pangkal Hulu (Selut)
  ctx.fillStyle = '#ffd056';
  ctx.fillRect(-6.8, 1.5, 13.6, 2.0);
  ctx.fillStyle = '#fff5d1';
  ctx.fillRect(-6.5, 5.0, 13.0, 1.3);

  // Mata Garuda Berlian Cyan di Lekuk Kepala
  const eyePulse = 0.75 + 0.25 * Math.sin(t * 5);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rgba('#4deeea', eyePulse);
  ctx.beginPath();
  ctx.arc(6.0, 35.5, 2.0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(6.0, 35.5, 0.9, 0, TAU);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawKerisMendak(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();

  const mGrad = ctx.createLinearGradient(-11, 0, 11, 0);
  mGrad.addColorStop(0, '#593a10');
  mGrad.addColorStop(0.25, '#ffd056');
  mGrad.addColorStop(0.5, '#ffffff');
  mGrad.addColorStop(0.75, '#ffd056');
  mGrad.addColorStop(1, '#593a10');
  ctx.fillStyle = mGrad;

  ctx.beginPath();
  ctx.roundRect(-9.5, -2.5, 19, 3.8, 1.8);
  ctx.fill();

  ctx.beginPath();
  ctx.roundRect(-11.5, -5.8, 23, 3.5, 1.6);
  ctx.fill();

  for (let i = -2; i <= 2; i++) {
    const gx = i * 4.2;
    const isGold = i % 2 === 0;
    const glowA = 0.65 + 0.35 * Math.sin(t * 6 + i);
    ctx.fillStyle = isGold ? rgba('#ffd056', glowA) : rgba('#ff2a5f', glowA);
    ctx.beginPath();
    ctx.arc(gx, -4.0, 1.25, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

function drawKerisWarangka(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(-48, -28);
  ctx.bezierCurveTo(-34, -22, -20, -18, 0, -18);
  ctx.bezierCurveTo(18, -18, 30, -21, 40, -25);
  ctx.bezierCurveTo(46, -15, 36, -3, 18, 1);
  ctx.bezierCurveTo(6, 3, -8, 3, -20, 0);
  ctx.bezierCurveTo(-36, -4, -46, -16, -48, -28);
  ctx.closePath();

  const wGrad = ctx.createLinearGradient(-48, -28, 42, 4);
  wGrad.addColorStop(0, '#241409');
  wGrad.addColorStop(0.3, '#4a2b13');
  wGrad.addColorStop(0.5, '#663d1d');
  wGrad.addColorStop(0.7, '#4a2b13');
  wGrad.addColorStop(1, '#1a0e06');
  ctx.fillStyle = wGrad;
  ctx.fill();

  const goldTrim = ctx.createLinearGradient(-48, -28, 42, 4);
  goldTrim.addColorStop(0, '#ffe38f');
  goldTrim.addColorStop(0.5, '#ffffff');
  goldTrim.addColorStop(1, '#f39c12');
  ctx.strokeStyle = goldTrim;
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Pelat Pendok Emas Tengah Berukir
  ctx.beginPath();
  ctx.moveTo(-15, -18.5);
  ctx.lineTo(15, -18.5);
  ctx.lineTo(12, 2.2);
  ctx.lineTo(-12, 2.2);
  ctx.closePath();

  const pGrad = ctx.createLinearGradient(-15, 0, 15, 0);
  pGrad.addColorStop(0, '#785216');
  pGrad.addColorStop(0.25, '#ffd056');
  pGrad.addColorStop(0.5, '#fff6d6');
  pGrad.addColorStop(0.75, '#e0a938');
  pGrad.addColorStop(1, '#61400e');
  ctx.fillStyle = pGrad;
  ctx.fill();
  ctx.strokeStyle = '#ffea9f';
  ctx.lineWidth = 0.85;
  ctx.stroke();

  // Permata Inti Pusaka di Tengah Warangka
  const corePulse = 0.7 + 0.3 * Math.sin(t * 4.5);
  ctx.fillStyle = '#241406';
  ctx.beginPath();
  ctx.moveTo(0, -14.5);
  ctx.lineTo(5.0, -8.5);
  ctx.lineTo(0, -2.5);
  ctx.lineTo(-5.0, -8.5);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = rgba('#ffd056', 0.88 * corePulse);
  ctx.beginPath();
  ctx.moveTo(0, -13.2);
  ctx.lineTo(3.8, -8.5);
  ctx.lineTo(0, -3.8);
  ctx.lineTo(-3.8, -8.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -8.5, 1.4, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Cincin Sabuk Pengikat Sarung
  ctx.strokeStyle = '#fff5d1';
  ctx.lineWidth = 1.4;
  for (const sx of [-14, 14]) {
    ctx.beginPath();
    ctx.moveTo(sx, -18.5);
    ctx.lineTo(sx * 0.86, 2.0);
    ctx.stroke();
  }

  ctx.restore();
}

function drawKerisGanja(ctx: CanvasRenderingContext2D) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(-20, -22);
  ctx.quadraticCurveTo(-24, -26, -18, -28);
  ctx.lineTo(18, -28);
  ctx.lineTo(22, -25);
  ctx.lineTo(19, -23);
  ctx.lineTo(23, -21);
  ctx.lineTo(15, -20);
  ctx.lineTo(-16, -20);
  ctx.closePath();

  const gGrad = ctx.createLinearGradient(-22, -24, 22, -24);
  gGrad.addColorStop(0, '#4a3210');
  gGrad.addColorStop(0.25, '#ffd056');
  gGrad.addColorStop(0.5, '#fff3c4');
  gGrad.addColorStop(0.75, '#d49b27');
  gGrad.addColorStop(1, '#3d280b');
  ctx.fillStyle = gGrad;
  ctx.fill();

  ctx.strokeStyle = '#ffea9f';
  ctx.lineWidth = 1.0;
  ctx.stroke();

  ctx.fillStyle = '#fff6cf';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 6, -24, 1.2, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

/* =========================================================================
   SLIDE #4 WILAH (BILAH KERIS LUK) ON SLIDE #8 KERIS WEAPON
   ========================================================================= */

/** Duration (seconds) of the bottom-to-top blade gleam before the Keris spirit launches. */
export const KERIS_GLEAM_DUR = 0.095;

function drawSlide4WilahOnGun(
  ctx: CanvasRenderingContext2D,
  t: number,
  flash: number,
  sinceShot = 99,
) {
  void pulse_unused;
  const glow = clamp(flash, 0, 1);
  const gleamActive = sinceShot >= 0 && sinceShot < KERIS_GLEAM_DUR * 1.15;
  const gleamU = gleamActive ? clamp(sinceShot / KERIS_GLEAM_DUR, 0, 1) : -1;

  const BASE = -28;
  const TOP = -158;
  const LUK = 5;
  const amp = (tt: number) => 5 * (1 - tt * 0.5);
  const halfw = (tt: number) => 13.6 * Math.pow(1 - tt, 0.82) + 1.4;
  const bx = (tt: number) => amp(tt) * Math.sin(tt * LUK * Math.PI);
  const by = (tt: number) => BASE - tt * (BASE - TOP);

  // 1. Halo rings embracing the blade (Slide #4)
  const rings: [number, number, number, number][] = [
    [-136, 24, 6.2, 1.7],
    [-102, 30, 7.6, -1.2],
    [-68, 36, 8.8, 0.9],
  ];
  for (let idx = 0; idx < rings.length; idx++) {
    const [ry, rx, ey, sp] = rings[idx];
    ctx.strokeStyle = `rgba(181,125,22,${0.42 + glow * 0.3})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.ellipse(0, ry, rx, ey, 0, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = `rgba(255,236,170,${0.3 + glow * 0.3})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(0, ry, rx + 2.6, ey + 1.2, 0, 0, TAU);
    ctx.stroke();

    const a = t * sp + idx * 2.1;
    glowDot(ctx, Math.cos(a) * rx, ry + Math.sin(a) * ey, 1.6, '#e8b64c', '#fffdf6', 0.9);
  }

  // 2. Wavy 5-Luk Blade Silhouette (Slide #4)
  const NB = 42;
  const traceWilahPath = () => {
    ctx.beginPath();
    for (let i = 0; i <= NB; i++) {
      const tt = i / NB;
      const x = bx(tt) - halfw(tt);
      if (i === 0) ctx.moveTo(x, by(tt));
      else ctx.lineTo(x, by(tt));
    }
    for (let i = NB; i >= 0; i--) {
      const tt = i / NB;
      ctx.lineTo(bx(tt) + halfw(tt), by(tt));
    }
    ctx.closePath();
  };

  traceWilahPath();

  const bladeGrad = ctx.createLinearGradient(-15, 0, 15, 0);
  bladeGrad.addColorStop(0, '#c98a1e');
  bladeGrad.addColorStop(0.16, '#f0cf7d');
  bladeGrad.addColorStop(0.38, '#fffdf4');
  bladeGrad.addColorStop(0.5, '#ffffff');
  bladeGrad.addColorStop(0.62, '#fffdf4');
  bladeGrad.addColorStop(0.84, '#f0cf7d');
  bladeGrad.addColorStop(1, '#c98a1e');
  ctx.fillStyle = bladeGrad;
  ctx.fill();

  // Idle specular sweep + Shot Bottom-to-Top Gleam Sweep inside blade
  ctx.save();
  ctx.clip();
  const sweep = ((t * 0.38) % 2.0) - 0.4;
  if (sweep >= 0 && sweep <= 1) {
    const sy = BASE - sweep * (BASE - TOP);
    ctx.globalCompositeOperation = 'lighter';
    const sweepG = ctx.createLinearGradient(0, sy - 20, 0, sy + 20);
    sweepG.addColorStop(0, 'rgba(255,255,255,0)');
    sweepG.addColorStop(0.5, 'rgba(255, 248, 220, 0.48)');
    sweepG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sweepG;
    ctx.fillRect(-22, sy - 20, 44, 40);
  }

  // EFEK MENGKILAT DARI BAWAH NAIK KE ATAS SAAT MENEMBAK (Gleam Sweep Base -> Tip)
  if (gleamU >= 0) {
    const sy = BASE - gleamU * (BASE - TOP);
    ctx.globalCompositeOperation = 'lighter';

    // Golden-white mirror sheen band surging from bottom (BASE) to top (TOP)
    const shotGleam = ctx.createLinearGradient(0, sy + 36, 0, sy - 36);
    shotGleam.addColorStop(0, 'rgba(255, 208, 86, 0)');
    shotGleam.addColorStop(0.22, 'rgba(255, 215, 90, 0.78)');
    shotGleam.addColorStop(0.44, 'rgba(255, 250, 220, 0.98)');
    shotGleam.addColorStop(0.5, '#ffffff');
    shotGleam.addColorStop(0.56, 'rgba(255, 250, 220, 0.98)');
    shotGleam.addColorStop(0.78, 'rgba(255, 215, 90, 0.78)');
    shotGleam.addColorStop(1, 'rgba(255, 208, 86, 0)');
    ctx.fillStyle = shotGleam;
    ctx.fillRect(-26, sy - 38, 52, 76);

    // Angled high-gloss metallic reflection slashes across the blade
    ctx.save();
    ctx.translate(bx(gleamU), sy);
    ctx.rotate(-0.34);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-24, -4.5, 48, 9);
    ctx.fillStyle = 'rgba(255, 232, 140, 0.92)';
    ctx.fillRect(-24, 7.5, 48, 4.5);
    ctx.restore();
  }
  ctx.restore();

  ctx.lineWidth = 1.1;
  ctx.strokeStyle = GOLD.dark;
  ctx.stroke();

  // 3. Pamor echo lines (Slide #4)
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = 'rgba(176,120,40,0.55)';
  for (const s of [-0.5, 0.5]) {
    ctx.beginPath();
    for (let i = 0; i <= NB; i++) {
      const tt = i / NB;
      const x = bx(tt) + s * halfw(tt);
      if (i === 0) ctx.moveTo(x, by(tt));
      else ctx.lineTo(x, by(tt));
    }
    ctx.stroke();
  }

  // 4. Channel of holy light along the spine (Slide #4)
  ctx.lineWidth = 5.5;
  ctx.strokeStyle = `rgba(255,226,150,${0.32 + glow * 0.4})`;
  ctx.beginPath();
  for (let i = 0; i <= NB; i++) {
    const tt = i / NB;
    const x = bx(tt);
    if (i === 0) ctx.moveTo(x, by(tt));
    else ctx.lineTo(x, by(tt));
  }
  ctx.stroke();
  ctx.lineWidth = 2.1;
  ctx.strokeStyle = `rgba(255,255,255,${0.82 + glow * 0.18})`;
  ctx.stroke();

  // 4b. Rising edge gleam & traveling glint flare from bottom to top when shooting
  if (gleamU >= 0) {
    const sy = BASE - gleamU * (BASE - TOP);
    const sx = bx(gleamU);
    const u0 = Math.max(0, gleamU - 0.38);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Glowing white-gold edge trace climbing the left & right Luk curves
    for (const side of [-1, 1]) {
      ctx.strokeStyle = 'rgba(255, 224, 110, 0.92)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) {
        const uu = u0 + (gleamU - u0) * (i / 16);
        const ex = bx(uu) + side * halfw(uu);
        const ey = by(uu);
        if (i === 0) ctx.moveTo(ex, ey);
        else ctx.lineTo(ex, ey);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Traveling Kilatan Cahaya (horizontal glint + golden halo) rising to the tip
    const glintGrad = ctx.createRadialGradient(sx, sy, 1, sx, sy, 22);
    glintGrad.addColorStop(0, '#ffffff');
    glintGrad.addColorStop(0.35, 'rgba(255, 244, 190, 0.92)');
    glintGrad.addColorStop(0.7, 'rgba(255, 208, 86, 0.45)');
    glintGrad.addColorStop(1, 'rgba(255, 208, 86, 0)');
    ctx.fillStyle = glintGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 22, 11, 0, 0, TAU);
    ctx.fill();

    // Sharp horizontal specular glint bar (not a star at the tip)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(sx, sy, 16 * (1 - gleamU * 0.35), 2.4, -0.18, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  // 5. Golden lightning living inside the blade (Slide #4)
  const tick = Math.floor(t * 16);
  if (gleamU >= 0) {
    const sy = BASE - gleamU * (BASE - TOP);
    strokeJolt(ctx, boltPts(0, BASE - 2, bx(gleamU), sy, 6, tick), 1.45, 0.98);
  } else if (glow > 0.08) {
    strokeJolt(ctx, boltPts(0, BASE - 4, 0, TOP + 10, 6, tick), 1.25, Math.min(1, glow + 0.15));
    strokeJolt(
      ctx,
      boltPts(bx(0.5), by(0.5), bx(0.5) - 10, by(0.5) - 12, 3, tick + 7),
      0.9,
      glow * 0.8,
    );
    strokeJolt(
      ctx,
      boltPts(bx(0.72), by(0.72), bx(0.72) + 9, by(0.72) - 10, 3, tick + 13),
      0.9,
      glow * 0.8,
    );
  } else if (tick % 6 === 0) {
    strokeJolt(
      ctx,
      boltPts(bx(0.22), by(0.22), bx(0.72), by(0.72), 4, tick),
      0.95,
      0.85,
    );
  }

  // 6. Floating rune diamonds beside the blade edges (Slide #4)
  for (let i = 0; i < 5; i++) {
    const tt = 0.18 + i * 0.16;
    if (tt > 0.96) continue;
    const y = by(tt);
    const side = i % 2 === 0 ? 1 : -1;
    const x = bx(tt) + side * (halfw(tt) + 6.8);
    const sa = 0.45 + 0.3 * Math.sin(t * 3 + i * 1.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.globalAlpha = sa;
    ctx.fillStyle = '#e8b64c';
    ctx.fillRect(-1.6, -1.6, 3.2, 3.2);
    ctx.strokeStyle = '#8a5a10';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-1.6, -1.6, 3.2, 3.2);
    ctx.restore();
  }

  // 7. Naga crests — flame-dragons with ruby eyes at the blade base (Slide #4)
  for (const m of [-1, 1]) {
    ctx.save();
    ctx.translate(0, BASE - 36);
    ctx.beginPath();
    ctx.moveTo(m * 4, 37);
    ctx.bezierCurveTo(m * 16, 34, m * 20, 22, m * 12, 14);
    ctx.bezierCurveTo(m * 16, 21, m * 12, 27, m * 4.5, 29);
    ctx.closePath();
    const nagaGrad = ctx.createLinearGradient(m * 20, 14, m * 4, 37);
    nagaGrad.addColorStop(0, GOLD.bright);
    nagaGrad.addColorStop(0.55, GOLD.mid);
    nagaGrad.addColorStop(1, GOLD.dark);
    ctx.fillStyle = nagaGrad;
    ctx.fill();
    ctx.strokeStyle = GOLD.ink;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(110,66,10,0.8)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(m * 6.5, 33);
    ctx.bezierCurveTo(m * 12, 30, m * 14.5, 24, m * 12.5, 18.5);
    ctx.stroke();
    glowDot(ctx, m * 11.5, 18.5, 1.15, '#ff8aa0', '#e02547', 0.9);
    ctx.restore();
  }
}

const pulse_unused = 0;

/**
 * Draws a translucent golden-white Spirit silhouette ("Roh Keris") emerging from the Keris blade.
 */
function drawEmergingKerisSpirit(
  ctx: CanvasRenderingContext2D,
  riseProgress: number,
  alpha: number,
  t: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = clamp(alpha, 0, 1);

  // As riseProgress goes 0 -> 1, the Spirit Keris rises from the blade body up to the tip (-158)
  const yCenter = -55 - riseProgress * 105;
  ctx.translate(0, yCenter);

  // Golden-white spirit aura behind the emerging Roh Keris
  const spiritHalo = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
  spiritHalo.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  spiritHalo.addColorStop(0.45, 'rgba(255, 224, 110, 0.65)');
  spiritHalo.addColorStop(1, 'rgba(255, 190, 50, 0)');
  ctx.fillStyle = spiritHalo;
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 36, 0, 0, TAU);
  ctx.fill();

  drawKerisHalilintarLukBlade(ctx, -18, 52, 14, t, false);
  ctx.restore();
}

/**
 * Draws the complete Keris weapon:
 * - Slide #8 Hulu, Mendak, Warangka, Ganja, aura, and recoil/flash shooting animation
 * - Slide #4 Wavy Luk 5 Wilah (blade), halo rings, pamor, spine channel, runes, and naga crests (NO tip star)
 * - Bottom-to-top blade gleam sweep followed by the emerging Spirit Keris ("Roh dari Keris")
 * Muzzle tip is placed at (cx, y0).
 */
export function drawSlide8KerisGun(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y0: number,
  t: number,
  flash = 0,
  recoil = 0,
  sinceShot = 99,
  inPreview = false,
) {
  ctx.save();
  // In Slide #8 local space, the blade tip is at y = -160 and the hulu base is at y = +48.
  // Translating to (cx, y0 + 160) places the blade tip right at (cx, y0).
  ctx.translate(cx, y0 + 160);

  // Recoil kicks after the bottom-to-top gleam reaches the tip and releases the Spirit Keris
  const delayedRecoil =
    sinceShot >= 0 && sinceShot < KERIS_GLEAM_DUR
      ? recoil * 0.25 * (sinceShot / KERIS_GLEAM_DUR)
      : recoil;
  const rec = delayedRecoil * 12;
  ctx.translate(0, rec);

  const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);

  // 1. Aura Pusaka Emas (Slide #4 + Slide #8)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const aura = ctx.createRadialGradient(0, -82, 6, 0, -82, 98);
  aura.addColorStop(0, rgba('#ffd056', 0.15 + pulse * 0.06 + flash * 0.1));
  aura.addColorStop(0.55, rgba('#e8b64c', 0.05 + flash * 0.05));
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(0, -82, 66, 100, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // 2. Hulu (Slide #8)
  drawKerisHulu(ctx, t);

  // 3. Mendak (Slide #8)
  drawKerisMendak(ctx, t);

  // 4. Warangka (Slide #8)
  drawKerisWarangka(ctx, t);

  // 5. Ganja & Gandik (Slide #8)
  drawKerisGanja(ctx);

  // 6. Wilah / Bilah Keris (Slide #4 design + bottom-to-top shot gleam, NO tip star)
  drawSlide4WilahOnGun(ctx, t, flash, sinceShot);

  // 7. ROH KERIS (Spirit of the Keris) rising along the blade & emerging from the tip!
  if (sinceShot >= KERIS_GLEAM_DUR * 0.28 && sinceShot < KERIS_GLEAM_DUR) {
    const u = (sinceShot - KERIS_GLEAM_DUR * 0.28) / (KERIS_GLEAM_DUR * 0.72);
    drawEmergingKerisSpirit(ctx, u, 0.35 + u * 0.65, t);
  } else if (inPreview && sinceShot >= KERIS_GLEAM_DUR && sinceShot < 0.32) {
    // In menu/Arsenal preview, show the Spirit Keris launching upward out of the tip
    const flyU = (sinceShot - KERIS_GLEAM_DUR) / (0.32 - KERIS_GLEAM_DUR);
    drawEmergingKerisSpirit(ctx, 1 + flyU * 1.35, 1 - flyU, t);
  }

  ctx.restore();
}

/* =========================================================================
   PROJECTILE & STUCK KERIS:
   IDENTICAL FULL KERIS DESIGN AS THE SHOOTING KERIS
   (Slide #4 Luk 5 Wilah + Naga Crests + Slide #8 Ganja, Warangka, Mendak & Hulu)
   WITH ZERO BLUE GLOW — ONLY CRISP YELLOW/GOLDEN LIGHTNING (LISTRIK KUNING)
   ========================================================================= */

/**
 * Draws the miniature full Keris (same design as the Keris weapon that shoots:
 * Hulu Garuda Jawa + Mendak + Warangka Perahu Ladrang + Ganja + Luk 5 Wilah + Naga Crests)
 * with yellow/golden lightning (`listrik kuning`) and no blue glow.
 */
export function drawKerisHalilintarLukBlade(
  ctx: CanvasRenderingContext2D,
  tipY: number,
  tailY: number,
  maxW: number,
  t = 0,
  isStuck = false,
) {
  void tipY;
  void tailY;
  void maxW;
  ctx.save();

  // Scale down the exact full Keris gun geometry (-158 tip to +48 hulu base = 206px):
  // With scale (0.31, 0.34) and translate(0, 36):
  // - Blade tip (-158 * 0.34 + 36 = -17.7px) penetrates 18px into the target rim (y = 0)
  // - Protruding Luk 5 Wilah + Naga Crests span y = 0 to +26.5px
  // - Ganja, Warangka perahu, Mendak, and Hulu Garuda Jawa span y = +26.5px to +52.3px
  ctx.translate(0, 36);
  ctx.scale(0.31, 0.34);

  const BASE = -28;
  const TOP = -158;
  const LUK = 5;
  const amp = (tt: number) => 5.6 * (1 - tt * 0.45);
  const halfw = (tt: number) => 15.2 * Math.pow(1 - tt, 0.8) + 1.6;
  const bx = (tt: number) => amp(tt) * Math.sin(tt * LUK * Math.PI);
  const by = (tt: number) => BASE - tt * (BASE - TOP);

  // 1. Hulu, Mendak, Warangka & Ganja (Slide #8 — same as the shooting Keris)
  drawKerisHulu(ctx, t);
  drawKerisMendak(ctx, t);
  drawKerisWarangka(ctx, t);
  drawKerisGanja(ctx);

  // 2. Wavy 5-Luk Wilah Blade Silhouette (Slide #4 — same as the shooting Keris, NO blue glow)
  ctx.beginPath();
  const NB = 36;
  for (let i = 0; i <= NB; i++) {
    const tt = i / NB;
    const x = bx(tt) - halfw(tt);
    if (i === 0) ctx.moveTo(x, by(tt));
    else ctx.lineTo(x, by(tt));
  }
  for (let i = NB; i >= 0; i--) {
    const tt = i / NB;
    ctx.lineTo(bx(tt) + halfw(tt), by(tt));
  }
  ctx.closePath();

  const bladeGrad = ctx.createLinearGradient(-16, 0, 16, 0);
  bladeGrad.addColorStop(0, '#c98a1e');
  bladeGrad.addColorStop(0.16, '#f0cf7d');
  bladeGrad.addColorStop(0.38, '#fffdf4');
  bladeGrad.addColorStop(0.5, '#ffffff');
  bladeGrad.addColorStop(0.62, '#fffdf4');
  bladeGrad.addColorStop(0.84, '#f0cf7d');
  bladeGrad.addColorStop(1, '#c98a1e');
  ctx.fillStyle = bladeGrad;
  ctx.fill();

  ctx.lineWidth = 1.6;
  ctx.strokeStyle = GOLD.dark;
  ctx.stroke();

  // 3. Pamor echo lines (Slide #4)
  ctx.lineWidth = 1.3;
  ctx.strokeStyle = 'rgba(176,120,40,0.6)';
  for (const s of [-0.5, 0.5]) {
    ctx.beginPath();
    for (let i = 0; i <= NB; i++) {
      const tt = i / NB;
      const x = bx(tt) + s * halfw(tt);
      if (i === 0) ctx.moveTo(x, by(tt));
      else ctx.lineTo(x, by(tt));
    }
    ctx.stroke();
  }

  // 4. Channel of holy light along the spine (Slide #4)
  ctx.lineWidth = 5.5;
  ctx.strokeStyle = 'rgba(255,226,150,0.42)';
  ctx.beginPath();
  for (let i = 0; i <= NB; i++) {
    const tt = i / NB;
    const x = bx(tt);
    if (i === 0) ctx.moveTo(x, by(tt));
    else ctx.lineTo(x, by(tt));
  }
  ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.stroke();

  // 5. Naga crests — flame-dragons with ruby eyes at the blade base (Slide #4)
  for (const m of [-1, 1]) {
    ctx.save();
    ctx.translate(0, BASE - 36);
    ctx.beginPath();
    ctx.moveTo(m * 4, 37);
    ctx.bezierCurveTo(m * 16, 34, m * 20, 22, m * 12, 14);
    ctx.bezierCurveTo(m * 16, 21, m * 12, 27, m * 4.5, 29);
    ctx.closePath();
    const nagaGrad = ctx.createLinearGradient(m * 20, 14, m * 4, 37);
    nagaGrad.addColorStop(0, GOLD.bright);
    nagaGrad.addColorStop(0.55, GOLD.mid);
    nagaGrad.addColorStop(1, GOLD.dark);
    ctx.fillStyle = nagaGrad;
    ctx.fill();
    ctx.strokeStyle = GOLD.ink;
    ctx.lineWidth = 1.1;
    ctx.stroke();
    glowDot(ctx, m * 11.5, 18.5, 1.4, '#ff8aa0', '#e02547', 0.95);
    ctx.restore();
  }

  // 6. LISTRIK KUNING (Golden-Yellow Lightning) dancing on the Keris blade!
  const seed = Math.floor(t * 20);
  if (isStuck) {
    // Main yellow lightning bolt crackling along the exposed blade
    strokeJolt(ctx, boltPts(bx(0.06), by(0.06), bx(0.68), by(0.68), 8, seed), 2.2, 0.95);
    // Branching yellow lightning arcs on the sides of the blade
    const side = seed % 2 === 0 ? 1 : -1;
    strokeJolt(
      ctx,
      boltPts(
        bx(0.28) + side * halfw(0.28),
        by(0.28),
        bx(0.56) + side * (halfw(0.56) + 12),
        by(0.56),
        6,
        seed + 5,
      ),
      1.8,
      0.9,
    );
    strokeJolt(
      ctx,
      boltPts(
        bx(0.18) - side * halfw(0.18),
        by(0.18),
        bx(0.42) - side * (halfw(0.42) + 10),
        by(0.42),
        5,
        seed + 11,
      ),
      1.6,
      0.85,
    );
  } else {
    // Crisp golden lightning along flying blade
    strokeJolt(ctx, boltPts(bx(0.08), by(0.08), bx(0.88), by(0.88), 6, seed), 1.9, 0.9);
  }

  ctx.restore();
}

/**
 * Renders the golden-yellow electric impact point (Listrik Kuning) right at the target rim.
 */
export function drawKerisStuckCrater(ctx: CanvasRenderingContext2D, rimY = 0, t = 0) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Cincin sengatan listrik kuning-emas di bibir lingkaran (tanpa glow biru)
  ctx.strokeStyle = 'rgba(255, 208, 86, 0.92)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(0, rimY, 6.5, 2.4, 0, 0, TAU);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 224, 110, 0.92)';
  ctx.beginPath();
  ctx.arc(0, rimY, 2.8, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, rimY, 1.5, 0, TAU);
  ctx.fill();

  // Listrik kuning menyambar tipis di sekitar titik tancap
  const seed = Math.floor(t * 22);
  const dir = seed % 2 === 0 ? 1 : -1;
  strokeJolt(ctx, boltPts(0, rimY, dir * 11, rimY + 7, 3.2, seed), 1.1, 0.9);
  strokeJolt(ctx, boltPts(0, rimY, -dir * 8, rimY + 12, 2.8, seed + 7), 0.95, 0.82);

  ctx.restore();
}

/**
 * Draws the flying Keris projectile or embedded stuck Keris in SGA.
 * Both use the exact same full Keris shape as the shooting weapon + yellow lightning.
 */
export function drawKerisSlideProjectile(
  ctx: CanvasRenderingContext2D,
  t: number,
  embedded: boolean,
) {
  ctx.save();
  if (!embedded) {
    // 1. Ekor Roh Keris & Bayangan Roh Emas-Putih di belakang saat melesat
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const trailGrad = ctx.createLinearGradient(0, 32, 0, 82);
    trailGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    trailGrad.addColorStop(0.3, 'rgba(255, 224, 110, 0.65)');
    trailGrad.addColorStop(0.75, 'rgba(255, 180, 40, 0.25)');
    trailGrad.addColorStop(1, 'rgba(255, 180, 40, 0)');
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.moveTo(-4.8, 32);
    ctx.lineTo(4.8, 32);
    ctx.lineTo(0.8, 82);
    ctx.lineTo(-0.8, 82);
    ctx.closePath();
    ctx.fill();

    // Aura Roh Keris (ethereal golden-white spirit veil around the flying Keris)
    const spiritAura = ctx.createRadialGradient(0, 14, 2, 0, 14, 34);
    spiritAura.addColorStop(0, 'rgba(255, 252, 230, 0.62)');
    spiritAura.addColorStop(0.5, 'rgba(255, 215, 90, 0.34)');
    spiritAura.addColorStop(1, 'rgba(255, 180, 40, 0)');
    ctx.fillStyle = spiritAura;
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 36, 0, 0, TAU);
    ctx.fill();

    // Bayangan Roh (Spirit afterimages trailing behind the flying Keris)
    for (const [dy, sc, al] of [
      [18, 0.9, 0.32],
      [34, 0.8, 0.16],
    ] as const) {
      ctx.save();
      ctx.globalAlpha = al;
      ctx.translate(0, dy);
      ctx.scale(sc, sc);
      drawKerisHalilintarLukBlade(ctx, -18, 52, 14, t, false);
      ctx.restore();
    }
    ctx.restore();

    drawKerisHalilintarLukBlade(ctx, -18, 52, 14, t, false);
  } else {
    drawKerisStuckCrater(ctx, 0, t);
    drawKerisHalilintarLukBlade(ctx, -18, 52, 14, t, true);
  }
  ctx.restore();
}

/**
 * Mini Ammo Icon using the same full Keris silhouette.
 */
export function drawKerisSlideMini(ctx: CanvasRenderingContext2D, t: number, used = false) {
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  ctx.save();
  ctx.globalAlpha = used ? 0.2 : 0.9 + pulse * 0.1;
  ctx.translate(0, -8);
  ctx.scale(0.55, 0.55);
  drawKerisHalilintarLukBlade(ctx, -18, 52, 14, t, false);
  ctx.restore();
}

/* =========================================================================
   SLIDE #8 PARTICLES, LIGHTNING BOLTS, CRAWL ARCS & BACKGROUND STATE
   ========================================================================= */

export interface KerisParticle {
  kind: 'spark' | 'streak' | 'mote' | 'ring' | 'flash' | 'arc';
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  grav: number;
  drag: number;
  grow: number;
  thick: number;
  bolts?: BoltSegment[];
}

export interface KerisCrawlArc {
  angle: number;
  life: number;
  max: number;
}

export interface KerisDust {
  x: number;
  y: number;
  z: number;
  r: number;
  p: number;
}

export interface KerisSlideState {
  particles: KerisParticle[];
  crawlArcs: KerisCrawlArc[];
  dust: KerisDust[];
  thunderFlash: number;
  ambientTimer: number;
  width: number;
  height: number;
}

export function createKerisSlideState(width = 420, height = 760): KerisSlideState {
  const dust: KerisDust[] = [];
  const n = 44;
  for (let i = 0; i < n; i++) {
    dust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.25 + Math.random() * 0.9,
      r: 0.5 + Math.random() * 1.9,
      p: Math.random() * TAU,
    });
  }
  return {
    particles: [],
    crawlArcs: [],
    dust,
    thunderFlash: 0,
    ambientTimer: 0,
    width,
    height,
  };
}

function pushParticle(state: KerisSlideState, p: Partial<KerisParticle> & { x: number; y: number }) {
  if (state.particles.length > 420) state.particles.splice(0, 60);
  const life = p.life ?? 0.4;
  const vx = p.vx ?? 0;
  const vy = p.vy ?? 0;
  const kind = p.kind ?? 'spark';
  let bolts: BoltSegment[] | undefined;
  if (kind === 'arc') {
    const alen = Math.hypot(vx, vy);
    bolts = createCrispBolt(p.x, p.y, p.x + vx, p.y + vy, {
      sway: alen > 35 ? 8 : clamp(alen * 0.14, 3, 7),
      steps: alen > 35 ? 6 : 4,
      branchChance: alen > 35 ? 0.28 : 0.15,
    });
  }
  state.particles.push({
    kind,
    x: p.x,
    y: p.y,
    vx,
    vy,
    life,
    max: life,
    size: p.size ?? 2,
    color: p.color ?? '#ffffff',
    rot: p.rot ?? 0,
    vr: p.vr ?? 0,
    grav: p.grav ?? 0,
    drag: p.drag ?? 0,
    grow: p.grow ?? 0,
    thick: p.thick ?? 2,
    bolts,
  });
}

/**
 * Slide #8 `kerisGun.onFire`:
 * 3 lightning arcs + 10 high-speed sparks + cyan muzzle flash + expanding cyan shock ring.
 */
export function spawnKerisLaunch(state: KerisSlideState, x: number, y: number) {
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i - 1) * 0.32 + (Math.random() - 0.5) * 0.15;
    const len = 32 + Math.random() * 28;
    pushParticle(state, {
      x,
      y,
      vx: Math.cos(a) * len,
      vy: Math.sin(a) * len,
      life: 0.15 + Math.random() * 0.1,
      size: 1.1,
      color: i % 2 === 0 ? '#4deeea' : '#ffd056',
      kind: 'arc',
      rot: Math.random() * 10,
    });
  }

  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
    const sp = 150 + Math.random() * 260;
    pushParticle(state, {
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.2 + Math.random() * 0.2,
      size: 1.4 + Math.random() * 1.8,
      color: i % 3 === 0 ? '#ffffff' : i % 2 === 0 ? '#4deeea' : '#ffd056',
      kind: 'spark',
      grav: 180,
      drag: 2.2,
    });
  }

  pushParticle(state, {
    x,
    y,
    kind: 'flash',
    life: 0.12,
    size: 28,
    color: '#4deeea',
  });
  pushParticle(state, {
    x,
    y,
    kind: 'ring',
    life: 0.26,
    size: 5,
    grow: 260,
    color: '#4deeea',
    thick: 2.2,
  });
}

/**
 * Slide #8 `engine.ts` bullet flight streak particles.
 */
export function spawnKerisFlightSparks(state: KerisSlideState, x: number, y: number) {
  if (Math.random() < 0.88) {
    pushParticle(state, {
      x: x + (Math.random() - 0.5) * 4,
      y: y + 14,
      vx: (Math.random() - 0.5) * 14,
      vy: 40 + Math.random() * 60,
      life: 0.22 + Math.random() * 0.16,
      size: 1.1 + Math.random() * 2.1,
      color: Math.random() < 0.5 ? '#4deeea' : '#ffd056',
      kind: 'streak',
      drag: 2,
    });
  }
}

/**
 * Slide #8 `kerisGun.onImpact` + `engine.ts` `resolveHit`:
 * - Main cyan lightning bolt from muzzle (mx, my) to impact (x, y)
 * - Secondary gold lightning bolt from muzzle to impact
 * - 5 radial branching lightning arcs at impact
 * - 18 high-speed sparks
 * - 2 expanding shockwave rings (#4deeea & #ffd056) + white flash
 * - Crawling surface lightning arc along the wheel rim + full-screen thunderFlash
 */
export function spawnKerisImpact(
  state: KerisSlideState,
  x: number,
  y: number,
  mx: number,
  my: number,
  localAngle?: number,
) {
  const startX = mx || x;
  const startY = my || y + 220;

  // 1. Sambaran petir utama ramping dari moncong ke target
  pushParticle(state, {
    x: startX,
    y: startY,
    vx: x - startX,
    vy: y - startY,
    life: 0.22,
    size: 1.6,
    color: '#4deeea',
    kind: 'arc',
    rot: Math.random() * 20,
  });

  // 2. Satu petir pendamping emas tipis
  const offset = (Math.random() - 0.5) * 28;
  pushParticle(state, {
    x: startX + offset * 0.3,
    y: startY,
    vx: x - startX - offset * 0.3,
    vy: y - startY,
    life: 0.16,
    size: 1.1,
    color: '#ffd056',
    kind: 'arc',
    rot: Math.random() * 20,
  });

  // 3. Cabang petir menyebar di titik tumbukan
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU + (Math.random() - 0.5) * 0.4;
    const len = 28 + Math.random() * 44;
    pushParticle(state, {
      x,
      y,
      vx: Math.cos(a) * len,
      vy: Math.sin(a) * len,
      life: 0.16 + Math.random() * 0.1,
      size: 1.2,
      color: i % 2 === 0 ? '#4deeea' : '#ffd056',
      kind: 'arc',
      rot: i * 3.1,
    });
  }

  // 4. Percikan energi tajam
  const cols = ['#ffffff', '#4deeea', '#ffd056', '#a5f5ff'];
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * TAU;
    const sp = 110 + Math.random() * 340;
    pushParticle(state, {
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.28 + Math.random() * 0.28,
      size: 1.4 + Math.random() * 2.2,
      color: cols[i % cols.length],
      kind: 'spark',
      grav: 240,
      drag: 1.8,
    });
  }

  // 5. Cincin kejut & flash inti
  pushParticle(state, {
    x,
    y,
    kind: 'ring',
    life: 0.34,
    size: 8,
    grow: 380,
    color: '#4deeea',
    thick: 2.8,
  });
  pushParticle(state, {
    x,
    y,
    kind: 'ring',
    life: 0.44,
    size: 4,
    grow: 220,
    color: '#ffd056',
    thick: 1.8,
  });
  pushParticle(state, {
    x,
    y,
    kind: 'flash',
    life: 0.16,
    size: 42,
    color: '#ffffff',
  });

  state.thunderFlash = 1.0;
  if (localAngle !== undefined) {
    state.crawlArcs.push({
      angle: localAngle,
      life: 0.38,
      max: 0.38,
    });
  }
}

/**
 * Updates Slide #8 Keris particles, crawl arcs, thunderFlash, and gun ambient motes/arcs.
 */
export function updateKerisSlideState(
  state: KerisSlideState,
  dt: number,
  t: number,
  gunX: number,
  gunTipY: number,
  emitAmbient = true,
) {
  state.thunderFlash *= Math.exp(-8 * dt);

  for (let i = state.crawlArcs.length - 1; i >= 0; i--) {
    state.crawlArcs[i].life -= dt;
    if (state.crawlArcs[i].life <= 0) state.crawlArcs.splice(i, 1);
  }

  // Ambient dust drift
  for (const d of state.dust) {
    d.y -= (7 + d.z * 14) * dt;
    d.x += Math.sin(t * 0.5 + d.p) * 11 * dt;
    if (d.y < -6) {
      d.y = state.height + 6;
      d.x = Math.random() * state.width;
    }
  }

  // Slide #8 `kerisGun.ambient` (golden motes drifting along the blade, no tip squiggle)
  if (emitAmbient) {
    if (Math.random() < dt * 9) {
      const side = Math.random() < 0.5 ? -1 : 1;
      pushParticle(state, {
        x: gunX + side * (5 + Math.random() * 12),
        y: gunTipY + 130 - Math.random() * 110,
        vx: (Math.random() - 0.5) * 10,
        vy: -18 - Math.random() * 24,
        life: 0.5 + Math.random() * 0.4,
        size: 1.1 + Math.random() * 1.3,
        color: Math.random() < 0.65 ? '#ffd056' : '#fff6cf',
        kind: 'mote',
        rot: Math.random() * TAU,
      });
    }
  }

  // Update particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      state.particles.splice(i, 1);
      continue;
    }
    if (p.kind === 'ring') {
      p.size += p.grow * dt;
    } else if (p.kind === 'mote') {
      p.x += Math.sin(t * 1.4 + p.rot) * 8 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    } else if (p.kind !== 'flash' && p.kind !== 'arc') {
      p.vy += p.grav * dt;
      if (p.drag) {
        const k = Math.exp(-p.drag * dt);
        p.vx *= k;
        p.vy *= k;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    p.rot += p.vr * dt;
  }
}

/**
 * Draws Slide #8's crawling surface lightning arcs on the target wheel rim.
 */
export function drawKerisSurfaceArcs(
  ctx: CanvasRenderingContext2D,
  state: KerisSlideState,
  R: number,
  wheelRot: number,
  t: number,
) {
  for (const ca of state.crawlArcs) {
    const pRatio = clamp(ca.life / ca.max, 0, 1);
    const arcSweep = (1 - pRatio) * 1.6;
    drawCircleSurfaceArc(
      ctx,
      0,
      0,
      R,
      ca.angle - arcSweep * 0.5 + wheelRot,
      arcSweep,
      Math.floor(t * 30),
      '#4deeea',
    );
  }
}

/**
 * Draws Slide #8 particles (sparks, streaks, motes, rings, flashes, crisp lightning arcs)
 * and the subtle cyan thunderFlash overlay.
 */
export function drawKerisSlideParticlesAndArcs(
  ctx: CanvasRenderingContext2D,
  state: KerisSlideState,
  W = 420,
  H = 760,
) {
  ctx.save();
  for (const p of state.particles) {
    const k = clamp(p.life / p.max, 0, 1);
    switch (p.kind) {
      case 'spark':
      case 'streak': {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(p.color, clamp(k * 1.3, 0, 1));
        ctx.lineWidth = p.size * (0.4 + k * 0.6);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'mote': {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = rgba(p.color, clamp(Math.sin(k * Math.PI) * 0.9, 0, 1));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'ring': {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(p.color, k * 0.85);
        ctx.lineWidth = Math.max(0.4, p.thick * k);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, TAU);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'flash': {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const r = p.size * (1.25 - k * 0.4);
        const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        fg.addColorStop(0, rgba('#ffffff', k * 0.85));
        fg.addColorStop(0.5, rgba(p.color, k * 0.55));
        fg.addColorStop(1, rgba(p.color, 0));
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'arc': {
        const bolts =
          p.bolts ??
          createCrispBolt(p.x, p.y, p.x + p.vx, p.y + p.vy, {
            sway: 6,
            steps: 5,
            branchChance: 0.25,
          });
        renderCrispBolt(ctx, bolts, p.color, 8);
        break;
      }
    }
  }

  if (state.thunderFlash > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = rgba('#4deeea', 0.05 * state.thunderFlash);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draws Slide #8 (`games/gunhitdev/src/game/engine.ts`) background & ambient atmosphere:
 * - Deep navy-midnight linear gradient (#0b1428 -> #080d1c -> #05070f)
 * - Radial cyan glow behind the target wheel (#4deeea, radius R * 3.1)
 * - Golden weapon ember glow at the bottom of the screen (#ffd056)
 * - 3 slowly counter-rotating dashed mystic rings around the target wheel
 * - Rising glowing ambient dust particles (#bcd8ff & #ffd9a0)
 * - Radial edge vignette
 */
export function drawKerisSlideBackground(
  ctx: CanvasRenderingContext2D,
  state: KerisSlideState,
  cx: number,
  cy: number,
  R: number,
  t: number,
  boss = false,
  W = 420,
  H = 760,
) {
  ctx.save();

  // 1. Base dark gradient (#0b1428 -> #080d1c -> #05070f)
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0b1428');
  bg.addColorStop(0.45, '#080d1c');
  bg.addColorStop(1, '#05070f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const hue = boss ? '#ff4d6a' : '#4deeea';
  const hue2 = '#ffd056';

  // 2. Radial glow behind target wheel + golden ember at bottom
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 3.1);
  g.addColorStop(0, rgba(hue, 0.16));
  g.addColorStop(0.5, rgba(hue, 0.05));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 3.1, 0, TAU);
  ctx.fill();

  const g2 = ctx.createRadialGradient(cx, H, 10, cx, H, H * 0.42);
  g2.addColorStop(0, rgba(hue2, 0.13));
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, H * 0.55, W, H * 0.45);
  ctx.restore();

  // 3. 3 slowly counter-rotating dashed rings around the target wheel
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  for (let i = 0; i < 3; i++) {
    const rr = R * (1.9 + i * 0.62);
    ctx.save();
    ctx.rotate(t * (i % 2 === 0 ? 0.06 : -0.045) + i);
    ctx.setLineDash([i === 1 ? 3 : 16, i === 1 ? 22 : 30]);
    ctx.lineWidth = i === 1 ? 1 : 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // 4. Rising ambient dust particles
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const d of state.dust) {
    const a = 0.05 + d.z * 0.16;
    ctx.fillStyle = rgba(d.z > 0.7 ? '#bcd8ff' : '#ffd9a0', a);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * d.z, 0, TAU);
    ctx.fill();
  }
  ctx.restore();

  // 5. Subtle radial vignette
  const vig = ctx.createRadialGradient(
    W / 2,
    H * 0.45,
    Math.min(W, H) * 0.25,
    W / 2,
    H * 0.5,
    Math.max(W, H) * 0.78,
  );
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.62)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
}

/**
 * Draws Slide #8's animated dashed cyan aim guide and pulsing impact target ring.
 */
export function drawKerisAimGuide(
  ctx: CanvasRenderingContext2D,
  x: number,
  muzzleY: number,
  targetBottomY: number,
  t: number,
) {
  const y0 = muzzleY - 10;
  const y1 = targetBottomY;
  ctx.save();
  ctx.strokeStyle = rgba('#4deeea', 0.18);
  ctx.lineWidth = 1.4;
  ctx.setLineDash([5, 11]);
  ctx.lineDashOffset = -t * 46;
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1 + 14);
  ctx.stroke();
  ctx.setLineDash([]);

  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = rgba('#4deeea', 0.32 + pulse * 0.35);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y1, 9 + pulse * 4, 0, TAU);
  ctx.stroke();
  ctx.restore();
}
