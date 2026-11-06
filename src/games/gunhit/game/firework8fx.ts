/**
 * Firework Launcher FX for slide 1 (Gun Hit Arcade).
 *
 * This module is a 1:1 port of the Firework 8-Gun engine (slide 2,
 * `games/fireworkgun/src/game/engine.ts`) for the `firework` weapon:
 * the same burst patterns, the same particle counts, the same gravity / drag /
 * trail constants, the same glows and shock rings, and the same stage-clear and
 * fail finales. Only the slide-1 specifics are kept on top (420x760 stage,
 * skyline backdrop, muzzle anchored to the gun, gun glow).
 */
import { fireworkSfx } from './fireworkSlide2Sfx';

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const hsl = (h: number, s = 95, l = 60, a = 1) =>
  `hsla(${((h % 360) + 360) % 360}, ${s}%, ${l}%, ${a})`;

export const FIREWORK_PL = 46;
export const FIREWORK_EMBED_NOSE = 6;

export type BurstType =
  | 'peony'
  | 'ring'
  | 'star'
  | 'heart'
  | 'spiral'
  | 'crackle'
  | 'rainbow'
  | 'willow';

/** Slide 2 `IMPACT_TYPES` — the shells that can burst on a board hit. */
export const IMPACT_TYPES: readonly BurstType[] = [
  'peony',
  'ring',
  'star',
  'heart',
  'spiral',
  'crackle',
  'rainbow',
];

/** Slide 2 `SKY_TYPES` — the shells launched into the skyline. */
export const ALL_BURST_TYPES: readonly BurstType[] = [
  'peony',
  'ring',
  'star',
  'heart',
  'spiral',
  'crackle',
  'rainbow',
  'willow',
];

/** Slide 2 `Particle` — per-frame physics in 60 Hz units (f = dt * 60). */
export interface Firework8Particle {
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
  crackle: boolean;
}

export interface Firework8Glow {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface Firework8Ring {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
  impl?: boolean;
}

export interface Firework8SkyRocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: number;
  type: BurstType;
  scale: number;
  ambient?: boolean;
}

export interface Firework8Star {
  x: number;
  y: number;
  r: number;
  p: number;
  s: number;
  hue: number;
}

export interface Firework8Building {
  x: number;
  w: number;
  h: number;
  spire: boolean;
  wins: { x: number; y: number }[];
}

export interface Firework8State {
  w: number;
  h: number;
  stars: Firework8Star[];
  skyline: Firework8Building[];
  particles: Firework8Particle[];
  glows: Firework8Glow[];
  rings: Firework8Ring[];
  sky: Firework8SkyRocket[];
  timers: { t: number; fn: () => void }[];
  shotIdx: number;
  impactIdx: number;
  /** Countdown for the idle/celebration show (slide 2 `ambientT`). */
  ambientT: number;
  bgCanvas?: HTMLCanvasElement | null;
  bgDpr?: number;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Exact firework rocket shape from slide 2. Drawn horizontally in local space:
 * nose tip at (0, 0) pointing toward -x, striped body at x = 11..35,
 * swept fins at x = 24..36, wooden stick at x = 30..46.
 */
export function drawRocketShape(ctx: CanvasRenderingContext2D, hue: number, flash = 0) {
  ctx.strokeStyle = '#e6c27a';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(FIREWORK_PL, 0);
  ctx.stroke();

  ctx.fillStyle = hsl(hue, 85, 38);
  ctx.beginPath();
  ctx.moveTo(24, -4.5);
  ctx.lineTo(36, -11);
  ctx.lineTo(33, -4.5);
  ctx.closePath();
  ctx.moveTo(24, 4.5);
  ctx.lineTo(36, 11);
  ctx.lineTo(33, 4.5);
  ctx.closePath();
  ctx.fill();

  const grad = ctx.createLinearGradient(0, -6, 0, 6);
  grad.addColorStop(0, hsl(hue, 90, 74));
  grad.addColorStop(0.5, hsl(hue, 95, 52));
  grad.addColorStop(1, hsl(hue, 90, 32));
  ctx.fillStyle = grad;
  roundRectPath(ctx, 11, -5.5, 24, 11, 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(18, -5.5, 3, 11);
  ctx.fillRect(25, -5.5, 3, 11);

  ctx.fillStyle = hsl(hue + 35, 100, 62);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(5, -6.5, 12, -6);
  ctx.lineTo(12, 6);
  ctx.quadraticCurveTo(5, 6.5, 0, 0);
  ctx.closePath();
  ctx.fill();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash * 0.7})`;
    roundRectPath(ctx, 0, -6, 36, 12, 3);
    ctx.fill();
  }
}

/** Rocket oriented for the vertical projectile convention: nose up (-y). */
export function drawFirework8Projectile(
  ctx: CanvasRenderingContext2D,
  hue = 340,
  flash = 0,
) {
  ctx.save();
  ctx.rotate(Math.PI / 2);
  drawRocketShape(ctx, hue, flash);
  ctx.restore();
}

export function createFirework8State(w = 420, h = 760): Firework8State {
  const stars: Firework8Star[] = [];
  for (let i = 0; i < 110; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h * 0.78,
      r: rnd(0.5, 1.9),
      p: rnd(0, TAU),
      s: rnd(1, 3.5),
      hue: Math.random() < 0.3 ? rnd(190, 320) : 50,
    });
  }

  const skyline: Firework8Building[] = [];
  let x = 0;
  while (x < w) {
    const bw = Math.floor(rnd(18, 42));
    const bh = Math.floor(rnd(28, 95));
    const wins: { x: number; y: number }[] = [];
    for (let wy = 8; wy < bh - 10; wy += 9) {
      for (let wx = 4; wx < bw - 6; wx += 7) {
        if (Math.random() < 0.38) wins.push({ x: wx, y: wy });
      }
    }
    skyline.push({ x, w: bw, h: bh, spire: Math.random() < 0.25, wins });
    x += bw - 2;
  }

  return {
    w,
    h,
    stars,
    skyline,
    particles: [],
    glows: [],
    rings: [],
    sky: [],
    timers: [],
    shotIdx: 0,
    impactIdx: 0,
    ambientT: rnd(0.6, 1.4),
    bgCanvas: null,
    bgDpr: 0,
  };
}

export function firework8HueBase(level: number): number {
  return (level * 53) % 360;
}

/** Slide 2 `ammoHue`: every shell climbs 41° around the wheel (+41 per shot). */
export function firework8ShotHue(level: number, shotIdx: number): number {
  return (firework8HueBase(level) + shotIdx * 41) % 360;
}

export function paintFirework8Backdrop(
  ctx: CanvasRenderingContext2D,
  state: Firework8State,
) {
  const { w, h, skyline } = state;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#04010f');
  g.addColorStop(0.45, '#12062e');
  g.addColorStop(0.8, '#2a0f4a');
  g.addColorStop(1, '#4a1747');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const hg = ctx.createRadialGradient(w * 0.5, h * 0.92, 10, w * 0.5, h * 0.92, w * 0.9);
  hg.addColorStop(0, 'rgba(255, 120, 160, 0.25)');
  hg.addColorStop(0.6, 'rgba(140, 50, 140, 0.08)');
  hg.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, w, h);

  for (const b of skyline) {
    const by = h - b.h;
    ctx.fillStyle = '#0b0420';
    ctx.fillRect(b.x, by, b.w, b.h);
    if (b.spire) {
      ctx.beginPath();
      ctx.moveTo(b.x + b.w * 0.5 - 3, by);
      ctx.lineTo(b.x + b.w * 0.5, by - 14);
      ctx.lineTo(b.x + b.w * 0.5 + 3, by);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 210, 120, 0.55)';
    for (const win of b.wins) {
      ctx.fillRect(b.x + win.x, by + win.y, 3, 4);
    }
  }
}

export function drawFirework8Background(
  ctx: CanvasRenderingContext2D,
  state: Firework8State,
  dpr: number,
  targetX: number,
  targetY: number,
  targetR: number,
  level: number,
) {
  const density = Math.ceil(dpr || 1);
  if (!state.bgCanvas || state.bgDpr !== density) {
    if (typeof document !== 'undefined') {
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = state.w * density;
      bgCanvas.height = state.h * density;
      const bctx = bgCanvas.getContext('2d');
      if (bctx) {
        bctx.setTransform(density, 0, 0, density, 0, 0);
        paintFirework8Backdrop(bctx, state);
        state.bgCanvas = bgCanvas;
        state.bgDpr = density;
      }
    }
  }
  if (state.bgCanvas) {
    ctx.drawImage(state.bgCanvas, 0, 0, state.w, state.h);
  } else {
    paintFirework8Backdrop(ctx, state);
  }

  // Twinkling stars (slide 2: 110 stars, 0.35..1 alpha)
  for (const st of state.stars) {
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(st.p));
    ctx.fillStyle = hsl(st.hue, 80, 90, a);
    ctx.beginPath();
    ctx.arc(st.x, st.y, st.r, 0, TAU);
    ctx.fill();
  }

  // Glows — slide 2 `render()` formula: radius grows as the glow dies.
  if (state.glows.length > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const g of state.glows) {
      const k = g.life / g.max;
      const rad = g.r * (1.3 - 0.3 * k);
      const gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, rad);
      gr.addColorStop(0, hsl(g.hue, 100, 60, 0.38 * k));
      gr.addColorStop(1, hsl(g.hue, 100, 50, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(g.x - rad, g.y - rad, rad * 2, rad * 2);
    }
    ctx.restore();
  }

  // Wheel / board glow from slide 2's fireworks backdrop
  const hueBase = firework8HueBase(level);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const wg = ctx.createRadialGradient(targetX, targetY, targetR * 0.2, targetX, targetY, targetR * 2.1);
  wg.addColorStop(0, hsl(hueBase, 95, 55, 0.28));
  wg.addColorStop(0.5, hsl((hueBase + 60) % 360, 90, 45, 0.1));
  wg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.arc(targetX, targetY, targetR * 2.1, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawFirework8ParticlesAndRings(
  ctx: CanvasRenderingContext2D,
  state: Firework8State,
) {
  if (state.rings.length === 0 && state.particles.length === 0 && state.sky.length === 0) {
    return;
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  // Particles — slide 2 `render()`: k = life/max, alpha = k^0.7, trail from -v*tr,
  // twinkle flicker in the last 40% of life, soft halo on big sparks.
  for (const p of state.particles) {
    const k = Math.max(0, p.life / p.max);
    let a = Math.pow(k, 0.7);
    if (p.tw && k < 0.6) a *= 0.55 + Math.random() * 0.45;
    const l = k > 0.88 ? Math.min(95, p.l + 25) : p.l - (1 - k) * 12;
    const size = p.size * (0.45 + 0.55 * k);
    ctx.strokeStyle = hsl(p.h, p.s, l, a);
    ctx.lineWidth = size * 1.6;
    ctx.beginPath();
    ctx.moveTo(p.x - p.vx * p.tr, p.y - p.vy * p.tr);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    if (size > 2.1 && a > 0.2) {
      ctx.fillStyle = hsl(p.h, p.s, 70, a * 0.18);
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 3.2, 0, TAU);
      ctx.fill();
    }
  }

  // Sky rocket heads
  for (const s of state.sky) {
    ctx.fillStyle = 'rgba(255,230,160,0.95)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.6, 0, TAU);
    ctx.fill();
  }

  // Shock rings — slide 2 expansion curve
  for (const r of state.rings) {
    const k = r.life / r.max;
    if (r.impl) {
      const rad = Math.max(2, r.r * k);
      ctx.strokeStyle = hsl(r.hue, 100, 72, 0.85 * (1 - k * 0.4));
      ctx.lineWidth = 1.5 + 3.5 * (1 - k);
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - k)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(r.x, r.y, Math.max(1, rad - 3), 0, TAU);
      ctx.stroke();
    } else {
      ctx.strokeStyle = hsl(r.hue, 100, 70, 0.7 * k);
      ctx.lineWidth = 3 * k + 0.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r * (1 - k * k) + 4, 0, TAU);
      ctx.stroke();
    }
  }

  ctx.restore();
}

export function drawFirework8GunGlow(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  nextHue: number,
  recoilAmt: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(gx, gy, 4, gx, gy, 75);
  gg.addColorStop(0, hsl(nextHue, 100, 60, 0.25));
  gg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(gx, gy, 75, 0, TAU);
  ctx.fill();

  if (recoilAmt > 0.05) {
    ctx.fillStyle = hsl(nextHue, 100, 70, recoilAmt * 0.8);
    ctx.beginPath();
    ctx.ellipse(gx, gy - 36, 18 * recoilAmt, 10 * recoilAmt, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/** Slide 2 `launchSky()`: ballistic launch that peaks at `targetY`. */
export function launchFirework8Sky(state: Firework8State, ambient = false, scale = 1.1) {
  const x0 = rnd(50, state.w - 50);
  const y0 = state.h - 110;
  const ty = rnd(70, 330);
  const tx = rnd(50, state.w - 50);
  const a = 700;
  const dist = y0 - ty;
  const vy = -Math.sqrt(2 * a * dist);
  const tt = -vy / a;
  state.sky.push({
    x: x0,
    y: y0,
    vx: (tx - x0) / tt,
    vy,
    hue: rnd(0, 360),
    type: pick(ALL_BURST_TYPES),
    scale,
    ambient,
  });
  fireworkSfx.skyLaunch();
}

/** Slide 2 `spawn()` helper. */
function push(
  state: Firework8State,
  x: number,
  y: number,
  vx: number,
  vy: number,
  o: Partial<Firework8Particle>,
) {
  if (state.particles.length > 3600) return;
  const life = o.life ?? 1.2;
  state.particles.push({
    x,
    y,
    vx,
    vy,
    life,
    max: life,
    size: o.size ?? 2,
    h: o.h ?? 0,
    s: o.s ?? 100,
    l: o.l ?? 60,
    g: o.g ?? 0.05,
    d: o.d ?? 0.96,
    tr: o.tr ?? 2.5,
    tw: o.tw ?? true,
    crackle: o.crackle ?? false,
  });
}

/**
 * Slide 2 `burst()` — every pattern with its exact counts, speeds, colours,
 * gravity, drag and lifetime. `scale` mirrors the shell size (1 = full finale).
 */
export function burstFirework8(
  state: Firework8State,
  x: number,
  y: number,
  hue: number,
  type: BurstType = 'peony',
  scale = 1,
  hueJitter = 25,
) {
  const speed = 5.2 * scale;
  const cnt = Math.max(0.5, scale);
  const life = () => rnd(1.0, 1.6) * (0.7 + scale * 0.3);
  state.glows.push({ x, y, hue, life: 0.5, max: 0.5, r: 90 * scale + 30 });
  push(state, x, y, 0, 0, { life: 0.22, size: 22 * scale, h: hue, l: 92, d: 1, g: 0, tr: 0, tw: false });

  const jh = () => rnd(-hueJitter, hueJitter);

  switch (type) {
    case 'peony': {
      const n = Math.round(80 * cnt);
      for (let i = 0; i < n; i++) {
        const a = rnd(0, TAU);
        const sp = speed * (0.7 + 0.3 * Math.random());
        push(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: life(),
          size: rnd(1.6, 2.6),
          h: hue + jh(),
          g: 0.035,
          d: 0.955,
        });
      }
      for (let i = 0; i < n * 0.45; i++) {
        const a = rnd(0, TAU);
        const sp = speed * 0.42 * (0.4 + Math.random() * 0.6);
        push(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: life() * 0.8,
          size: 1.8,
          h: hue + 150,
          l: 72,
          g: 0.035,
          d: 0.955,
        });
      }
      break;
    }
    case 'ring': {
      const n = Math.round(56 * cnt);
      const off = rnd(0, TAU);
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * TAU;
        push(state, x, y, Math.cos(a) * speed, Math.sin(a) * speed, {
          life: life(),
          size: 2.4,
          h: hue + jh() * 0.3,
          g: 0.02,
          d: 0.958,
        });
      }
      const m = Math.round(30 * cnt);
      for (let i = 0; i < m; i++) {
        const a = off + (i / m) * TAU;
        push(state, x, y, Math.cos(a) * speed * 0.55, Math.sin(a) * speed * 0.55, {
          life: life() * 0.85,
          size: 2,
          h: hue + 120,
          l: 70,
          g: 0.02,
          d: 0.958,
        });
      }
      break;
    }
    case 'star': {
      const n = Math.round(110 * cnt);
      const off = rnd(0, TAU);
      for (let i = 0; i < n; i++) {
        const seg = (i / n) * 10;
        const k = Math.floor(seg);
        const f = seg - k;
        const a1 = (k * Math.PI) / 5 - Math.PI / 2 + off;
        const a2 = ((k + 1) * Math.PI) / 5 - Math.PI / 2 + off;
        const r1 = k % 2 === 0 ? 1 : 0.42;
        const r2 = (k + 1) % 2 === 0 ? 1 : 0.42;
        const vx = Math.cos(a1) * r1 * (1 - f) + Math.cos(a2) * r2 * f;
        const vy = Math.sin(a1) * r1 * (1 - f) + Math.sin(a2) * r2 * f;
        push(state, x, y, vx * speed * 1.05, vy * speed * 1.05, {
          life: life(),
          size: 2.3,
          h: hue + jh() * 0.3,
          l: 66,
          g: 0.015,
          d: 0.957,
        });
      }
      break;
    }
    case 'heart': {
      const n = Math.round(70 * cnt);
      const hh = rnd(325, 360);
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        const k = (speed * 1.05) / 17;
        push(state, x, y, hx * k, hy * k, {
          life: life(),
          size: 2.5,
          h: hh + rnd(-8, 8),
          l: 64,
          g: 0.015,
          d: 0.957,
        });
      }
      break;
    }
    case 'spiral': {
      const n = Math.round(100 * cnt);
      const off = rnd(0, TAU);
      for (let i = 0; i < n; i++) {
        const a = off + i * 0.34;
        const sp = speed * (0.15 + 0.85 * (i / n));
        push(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: life(),
          size: 2.2,
          h: hue + (i / n) * 90,
          g: 0.02,
          d: 0.957,
        });
      }
      break;
    }
    case 'crackle': {
      const n = Math.round(70 * cnt);
      for (let i = 0; i < n; i++) {
        const a = rnd(0, TAU);
        const sp = speed * (0.55 + 0.45 * Math.random());
        push(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.9, 1.3),
          size: 2.4,
          h: hue + jh(),
          l: 68,
          g: 0.03,
          d: 0.955,
          crackle: true,
        });
      }
      break;
    }
    case 'rainbow': {
      const n = Math.round(90 * cnt);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        const sp = speed * (0.75 + 0.25 * Math.random());
        push(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: life(),
          size: 2.3,
          h: hue + (i / n) * 360,
          l: 62,
          g: 0.03,
          d: 0.955,
        });
      }
      break;
    }
    case 'willow': {
      const n = Math.round(80 * cnt);
      for (let i = 0; i < n; i++) {
        const a = rnd(0, TAU);
        const sp = speed * rnd(0.35, 1);
        push(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(1.8, 2.8),
          size: 1.7,
          h: rnd(36, 50),
          s: 95,
          l: 66,
          g: 0.045,
          d: 0.972,
          tr: 4,
        });
      }
      break;
    }
  }
}

/** Slide 2 `fire()` muzzle: 22 sparks, white pop, glow and a small shock ring. */
export function spawnFirework8Muzzle(
  state: Firework8State,
  mx: number,
  my: number,
  hue: number,
) {
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI / 2 + rnd(-0.55, 0.55);
    const sp = rnd(2, 8);
    push(state, mx, my, Math.cos(a) * sp, Math.sin(a) * sp, {
      life: rnd(0.25, 0.55),
      size: rnd(1.2, 2.6),
      h: hue + rnd(-25, 25),
      l: 65,
      g: 0.12,
      d: 0.92,
    });
  }
  push(state, mx, my, 0, 0, {
    life: 0.14,
    size: 16,
    h: hue,
    l: 85,
    d: 1,
    g: 0,
    tr: 0,
    tw: false,
  });
  state.glows.push({ x: mx, y: my - 2, hue, life: 0.25, max: 0.25, r: 70 });
  state.rings.push({ x: mx, y: my + 2, hue, life: 0.3, max: 0.3, r: 38 });
}

/** Slide 2 flying-rocket trail: 3 sparks per frame below the stick. */
export function spawnFirework8FlightSparks(
  state: Firework8State,
  rx: number,
  ry: number,
  hue: number,
) {
  for (let k = 0; k < 3; k++) {
    push(
      state,
      rx + rnd(-2, 2),
      ry + FIREWORK_PL + rnd(0, 10),
      rnd(-0.6, 0.6),
      rnd(1, 3.5),
      {
        life: rnd(0.2, 0.5),
        size: rnd(1.5, 2.8),
        h: hue + rnd(-25, 25),
        l: k === 0 ? 90 : 62,
        g: 0.02,
        d: 0.93,
      },
    );
  }
}

/**
 * Slide 2 `stick()` for the firework weapon: a random shell bursts 30px under the
 * hit point, a smaller peony pops right at the rim, plus the 90px shock ring.
 */
export function spawnFirework8StickBurst(
  state: Firework8State,
  hx: number,
  hy: number,
  hue: number,
) {
  const type = IMPACT_TYPES[Math.floor(Math.random() * IMPACT_TYPES.length)];
  const by = hy + FIREWORK_PL * 0.65;
  burstFirework8(state, hx, by, hue, type, 0.72);
  burstFirework8(state, hx, hy + 4, (hue + 60) % 360, 'peony', 0.35);
  state.rings.push({ x: hx, y: by, hue, life: 0.45, max: 0.45, r: 90 });
}

/**
 * Slide 2 `clearLevel()` finale: rainbow + ring + willow over the board, one big
 * shock ring and glow, then a 9-rocket sky show over ~2 seconds.
 */
export function spawnFirework8ClearFinale(
  state: Firework8State,
  cx: number,
  cy: number,
  level: number,
) {
  const hueBase = firework8HueBase(level);
  burstFirework8(state, cx, cy, hueBase, 'rainbow', 1.5, 0);
  burstFirework8(state, cx, cy, (hueBase + 120) % 360, 'ring', 1.3, 0);
  burstFirework8(state, cx, cy, 45, 'willow', 1.4, 0);
  state.rings.push({ x: cx, y: cy, hue: hueBase, life: 0.8, max: 0.8, r: 260 });
  state.glows.push({ x: cx, y: cy, hue: hueBase, life: 0.9, max: 0.9, r: 260 });

  for (let i = 0; i < 9; i++) {
    state.timers.push({
      t: 0.15 + i * 0.22 + rnd(0, 0.1),
      fn: () => launchFirework8Sky(state, true, rnd(1.0, 1.35)),
    });
  }
}

/** Slide 2 `failRocket()`: white peony + warm ring + soft glow at the crash point. */
export function spawnFirework8FailBurst(
  state: Firework8State,
  x: number,
  y: number,
  _hue?: number,
) {
  burstFirework8(state, x, y, 0, 'peony', 0.6, 20);
  burstFirework8(state, x, y, 45, 'ring', 0.5, 20);
  state.glows.push({ x, y, hue: 0, life: 0.5, max: 0.5, r: 120 });
}

/**
 * Slide 2 `update()` for the firework system.
 * `celebrate` turns on the idle sky show (slide 2 runs it on the menu / game over:
 * one rocket every 0.7–1.5 s, each with its own launch whistle and boom).
 */
export function updateFirework8State(
  state: Firework8State,
  dt: number,
  celebrate = false,
) {
  const f = dt * 60;

  // Scheduled timers (stage-clear sky show)
  for (let i = state.timers.length - 1; i >= 0; i--) {
    state.timers[i].t -= dt;
    if (state.timers[i].t <= 0) {
      const fn = state.timers[i].fn;
      state.timers.splice(i, 1);
      fn();
    }
  }

  // Twinkling stars
  for (const st of state.stars) {
    st.p += st.s * dt;
  }

  // Sky rockets — slide 2 ballistic flight (a = 700 px/s²), burst when it peaks
  for (let i = state.sky.length - 1; i >= 0; i--) {
    const s = state.sky[i];
    s.vy += 700 * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    for (let k = 0; k < 2; k++) {
      push(state, s.x, s.y, rnd(-0.5, 0.5), rnd(0.5, 2), {
        life: rnd(0.3, 0.7),
        size: 1.8,
        h: 38 + rnd(-10, 10),
        l: 70,
        g: 0.02,
        d: 0.94,
      });
    }
    if (s.vy > -40) {
      state.sky.splice(i, 1);
      burstFirework8(state, s.x, s.y, s.hue, s.type, s.scale, 30);
      fireworkSfx.boom(s.scale);
    }
  }

  // Idle celebration show (slide 2 `ambientT`: 0.7–1.5 s between rockets)
  if (celebrate) {
    state.ambientT -= dt;
    if (state.ambientT <= 0) {
      launchFirework8Sky(state, true, rnd(0.9, 1.2));
      state.ambientT = rnd(0.7, 1.5);
    }
  }

  // Particles — slide 2 physics (drag, gravity, life, crackle spawns white sparks)
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
      if (p.crackle) {
        for (let k = 0; k < 3; k++) {
          const a = rnd(0, TAU);
          const sp = rnd(0.8, 2.2);
          push(state, p.x, p.y, Math.cos(a) * sp, Math.sin(a) * sp, {
            life: rnd(0.2, 0.45),
            size: 1.3,
            h: 50,
            s: 40,
            l: 92,
            g: 0.02,
            d: 0.92,
            tr: 1,
          });
        }
      }
      state.particles[i] = state.particles[state.particles.length - 1];
      state.particles.pop();
    }
  }

  // Glows & rings simply run out of life
  for (let i = state.glows.length - 1; i >= 0; i--) {
    state.glows[i].life -= dt;
    if (state.glows[i].life <= 0) state.glows.splice(i, 1);
  }
  for (let i = state.rings.length - 1; i >= 0; i--) {
    state.rings[i].life -= dt;
    if (state.rings[i].life <= 0) state.rings.splice(i, 1);
  }
}
