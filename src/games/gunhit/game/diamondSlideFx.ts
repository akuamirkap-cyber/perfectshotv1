import { slide23Sfx } from './slide23Sfx';

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const diamondHsl = (h: number, s = 90, l = 72, a = 1) =>
  `hsla(${((Math.round(h) % 360) + 360) % 360},${s}%,${l}%,${a})`;

/** Slide #2 wheel hue progression for diamond: 205 + ((level * 11) % 15) */
export function diamondWheelHue(level: number): number {
  return 205 + ((level * 11) % 15);
}

/**
 * Exact Diamond bullet & glow from Slide #2 (`games/firework/src/game/engine.ts` `drawDiamondBullet` lines 199–282).
 * Draws the outer radial ice-blue halo glow, 7-vertex faceted crown + pavilion gem,
 * inner facet lines, twinkling 4-ray sparkle cross, and impact flash overlay.
 */
export function drawSlide2DiamondBullet(
  ctx: CanvasRenderingContext2D,
  r: number,
  t: number,
  seed: number,
  flash = 0,
) {
  const halo = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.8);
  halo.addColorStop(0, 'rgba(200,235,255,0.55)');
  halo.addColorStop(1, 'rgba(140,200,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.8, 0, TAU);
  ctx.fill();

  // Faceted gem: sharp pavilion tip at (0, -r) pointing UP / into target, crown at +y
  const tw = 0.5 + 0.5 * Math.sin(t * 6 + seed * 5);
  const pts: [number, number][] = [
    [-0.72, 0.42],
    [-0.28, 0.62],
    [0.28, 0.62],
    [0.72, 0.42],
    [1, -0.12],
    [0, -1],
    [-1, -0.12],
  ];
  const x = (i: number) => pts[i][0] * r;
  const y = (i: number) => pts[i][1] * r;
  const facets: [number[], string][] = [
    [[0, 1, 5, 6], '#e8f6ff'],
    [[1, 2, 5], '#ffffff'],
    [[2, 3, 4, 5], '#c4e6ff'],
    [[0, 6, 4, 3], '#9fd4ff'],
  ];
  for (const [idx, col] of facets) {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (let j = 0; j < idx.length; j++) {
      if (j === 0) ctx.moveTo(x(idx[0]), y(idx[0]));
      else ctx.lineTo(x(idx[j]), y(idx[j]));
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  pts.forEach(([px, py], i) => {
    if (i === 0) ctx.moveTo(px * r, py * r);
    else ctx.lineTo(px * r, py * r);
  });
  ctx.closePath();
  ctx.stroke();

  // Facet lines
  ctx.strokeStyle = 'rgba(120,170,220,0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x(1), y(1));
  ctx.lineTo(x(5), y(5));
  ctx.moveTo(x(2), y(2));
  ctx.lineTo(x(5), y(5));
  ctx.moveTo(x(0), y(0));
  ctx.lineTo(x(6), y(6));
  ctx.moveTo(x(3), y(3));
  ctx.lineTo(x(4), y(4));
  ctx.stroke();

  // Sparkle cross
  const sa = 0.5 + 0.5 * tw;
  ctx.strokeStyle = `rgba(255,255,255,${sa})`;
  ctx.lineWidth = 1.6;
  const sr = r * (0.9 + tw * 0.5);
  ctx.beginPath();
  ctx.moveTo(-sr, 0);
  ctx.lineTo(sr, 0);
  ctx.moveTo(0, -sr * 0.7);
  ctx.lineTo(0, sr * 0.7);
  ctx.stroke();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.7})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, TAU);
    ctx.fill();
  }
}

/**
 * Draws the Slide #2 Diamond Gun muzzle formation (`games/firework/src/game/engine.ts` lines 3229–3275)
 * plus ambient diamond sparkles/shards ("formasi diamond didekat moncong senjata kek di diamond gun slide 2
 * dan percikan percikan diamond jg kek di slide 2") on top of SGA's Diamond Gun silhouette.
 */
export function drawSlide2DiamondMuzzleFormation(
  ctx: CanvasRenderingContext2D,
  cx: number,
  muzzleY: number,
  t: number,
  sinceShot = 9,
  ready = true,
) {
  const safeSince = Number.isFinite(sinceShot) && sinceShot >= 0 ? sinceShot : 9;
  const recoil = safeSince < 0.22 ? Math.max(0, 1 - safeSince / 0.22) : 0;
  const loadP = safeSince < 0.16 ? clamp(safeSince / 0.16, 0, 1) : 1;

  // 1. Orbiting 8-diamond ring formation + glowing aperture at muzzle (exact Slide #2 lines 3229–3264)
  ctx.save();
  ctx.translate(cx, muzzleY);
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8 + t * 0.8;
    const px = Math.cos(a) * 21;
    const py = Math.sin(a) * 8.5;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.PI / 4);
    const dg2 = ctx.createLinearGradient(-4, -4, 4, 4);
    dg2.addColorStop(0, '#ffffff');
    dg2.addColorStop(1, '#9fd4ff');
    ctx.fillStyle = dg2;
    ctx.fillRect(-4, -4, 8, 8);
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 0.75;
    ctx.strokeRect(-4, -4, 8, 8);
    ctx.restore();
  }
  const ap = ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
  ap.addColorStop(0, '#ffffff');
  ap.addColorStop(0.6, 'rgba(200,235,255,0.9)');
  ap.addColorStop(1, 'rgba(120,170,220,0.2)');
  ctx.fillStyle = ap;
  ctx.beginPath();
  ctx.ellipse(0, 0, 15, 6, 0, 0, TAU);
  ctx.fill();
  ctx.restore();

  // 2. Muzzle recoil flash ellipse (Slide #2 lines 3257–3264)
  if (recoil > 0.12) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(255,255,255,${recoil * 0.75})`;
    ctx.beginPath();
    ctx.ellipse(cx, muzzleY - 4, 28, 13, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // 3. Loaded floating diamond gem preview above the muzzle (Slide #2 lines 3266–3274)
  if (ready) {
    const e = 1 - Math.pow(1 - loadP, 3);
    const py = muzzleY - 22 + (1 - e) * 22 + Math.sin(t * 3.2) * 2;
    ctx.save();
    ctx.translate(cx, py);
    ctx.rotate(Math.sin(t * 1.8) * 0.2);
    drawSlide2DiamondBullet(ctx, 9.5, t, 8.8, 0);
    ctx.restore();
  }

  // 4. Sparkling diamond shards & glints ("percikan-percikan diamond") dancing around the muzzle formation
  const sparkOffsets: [number, number, number, number][] = [
    [-25, -8, 3.2, 0.4],
    [25, -6, 3.0, 1.7],
    [-19, -22, 2.6, 2.9],
    [20, -21, 2.8, 4.1],
    [-13, 11, 2.4, 5.2],
    [14, 12, 2.5, 6.0],
  ];
  for (let i = 0; i < sparkOffsets.length; i++) {
    const [dx, dy, sz, ph] = sparkOffsets[i];
    const pulse = 0.35 + 0.65 * Math.max(0, Math.sin(t * 4.6 + ph));
    const driftY = Math.sin(t * 2.8 + ph) * 2.2;
    const sx = cx + dx;
    const sy = muzzleY + dy + driftY;
    const s = sz * (0.65 + 0.35 * pulse);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(t * 1.6 + ph);
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#bfe6ff';
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(0, -s * 0.62);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s * 0.62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

/* ============================================================================
 * Slide #2 (`games/firework/src/game/engine.ts`) Diamond Effects, Shards,
 * Star Flashes, Glows, Rings, and Background Atmosphere
 * ========================================================================== */

export interface DiamondParticle {
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

export interface DiamondShardDebris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  hue: number;
  a0: number;
  life: number;
  seed: number;
}

export interface DiamondGlow {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface DiamondRing {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

export interface DiamondStarFlash {
  x: number;
  y: number;
  life: number;
  max: number;
  r: number;
  rot: number;
  spd: number;
  hue: number;
}

export interface DiamondSkyStar {
  x: number;
  y: number;
  r: number;
  sp: number;
  ph: number;
}

export interface DiamondBuilding {
  x: number;
  w: number;
  h: number;
  wins: { x: number; y: number }[];
}

export interface DiamondSlideState {
  w: number;
  h: number;
  stars: DiamondSkyStar[];
  skyline: DiamondBuilding[];
  particles: DiamondParticle[];
  shards: DiamondShardDebris[];
  glows: DiamondGlow[];
  rings: DiamondRing[];
  starflashes: DiamondStarFlash[];
  timers: { t: number; fn: () => void }[];
  shotIdx: number;
  wpulse: number;
  flash: number;
  flashHue: number;
  bgCanvas?: HTMLCanvasElement | null;
  bgDpr?: number;
}

export function createDiamondSlideState(w = 420, h = 760): DiamondSlideState {
  const stars: DiamondSkyStar[] = [];
  for (let i = 0; i < 110; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * (h - 120),
      r: rnd(0.4, 1.7),
      ph: Math.random() * TAU,
      sp: rnd(0.8, 3),
    });
  }

  const skyline: DiamondBuilding[] = [];
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
    shards: [],
    glows: [],
    rings: [],
    starflashes: [],
    timers: [],
    shotIdx: 0,
    wpulse: 0,
    flash: 0,
    flashHue: 205,
    bgCanvas: null,
    bgDpr: 0,
  };
}

function spawnParticle(
  state: DiamondSlideState,
  x: number,
  y: number,
  vx: number,
  vy: number,
  opts: Partial<DiamondParticle> = {},
) {
  if (state.particles.length > 1000) return;
  const life = opts.life ?? 1.0;
  state.particles.push({
    x,
    y,
    vx,
    vy,
    life,
    max: life,
    size: opts.size ?? 2,
    h: ((opts.h ?? 205) % 360 + 360) % 360,
    s: opts.s ?? 85,
    l: opts.l ?? 78,
    g: opts.g ?? 0.05,
    d: opts.d ?? 0.955,
    tr: opts.tr ?? 2.6,
    tw: opts.tw ?? true,
  });
}

/**
 * Slide #2 `fire()` when `w === "diamond"` (`games/firework/src/game/engine.ts` lines 632–646):
 * 18 diamond launch sparks + flying mini diamond shards + 4-ray starflash + radial glow + wpulse.
 */
export function spawnDiamondLaunch(state: DiamondSlideState, x: number, y: number) {
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI / 2 + rnd(-0.5, 0.5);
    const sp = rnd(2.5, 9);
    const white = i % 3 === 0;
    spawnParticle(state, x + rnd(-7, 7), y, Math.cos(a) * sp, Math.sin(a) * sp, {
      life: rnd(0.25, 0.55),
      size: rnd(1.2, 2.3),
      h: white ? 0 : rnd(195, 220),
      s: white ? 0 : 85,
      l: white ? 96 : 76,
      g: 0.04,
      d: 0.93,
      tr: 2.6,
    });
  }
  for (let i = 0; i < 4; i++) {
    const a = -Math.PI / 2 + rnd(-0.55, 0.55);
    const sp = rnd(110, 240);
    state.shards.push({
      x: x + rnd(-6, 6),
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      rot: rnd(0, TAU),
      vr: rnd(-12, 12),
      hue: rnd(195, 220),
      a0: rnd(2.6, 4.5),
      life: rnd(0.45, 0.8),
      seed: rnd(0, 10),
    });
  }
  state.starflashes.push({
    x,
    y: y - 2,
    life: 0.35,
    max: 0.35,
    r: 26,
    rot: rnd(0, TAU),
    spd: 2,
    hue: 210,
  });
  state.glows.push({ x, y, hue: 205, life: 0.3, max: 0.3, r: 85 });
  state.wpulse = Math.min(1, state.wpulse + 0.4);
}

/**
 * Slide #2 in-flight trail sparks for `w === "diamond"` (`games/firework/src/game/engine.ts` lines 1584–1595).
 */
export function spawnDiamondFlightSparks(state: DiamondSlideState, x: number, y: number) {
  for (let k = 0; k < 2; k++) {
    spawnParticle(state, x + rnd(-5, 5), y + 16 + rnd(0, 14), rnd(-0.6, 0.6), rnd(2, 4), {
      life: rnd(0.2, 0.45),
      size: rnd(1.2, 2.1),
      h: k === 0 ? 0 : rnd(198, 218),
      s: k === 0 ? 0 : 85,
      l: k === 0 ? 97 : 78,
      g: 0.03,
      d: 0.92,
      tr: 2.5,
    });
  }
}

/**
 * Slide #2 `diamondBurst(x, y, scale)` (`games/firework/src/game/engine.ts` lines 1228–1262):
 * 8 faceted diamond shard debris + 26 sparkling diamond particles + rotating 4-ray StarFlash +
 * expanding ice-blue ring + large radial glow.
 */
export function diamondBurst(state: DiamondSlideState, x: number, y: number, scale = 1) {
  for (let i = 0; i < Math.round(8 * scale); i++) {
    const a = rnd(0, TAU);
    const sp = rnd(150, 380) * scale;
    state.shards.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 160 * scale,
      rot: rnd(0, TAU),
      vr: rnd(-12, 12),
      hue: rnd(195, 220),
      a0: rnd(3, 6) * scale,
      life: rnd(0.9, 1.6),
      seed: rnd(0, 10),
    });
  }
  for (let i = 0; i < Math.round(26 * scale); i++) {
    const a = rnd(0, TAU);
    const sp = rnd(2.5, 7.5) * scale;
    const white = Math.random() < 0.4;
    spawnParticle(state, x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
      life: rnd(0.4, 0.85),
      size: rnd(1.2, 2.2),
      h: white ? 0 : rnd(195, 215),
      s: white ? 0 : 85,
      l: white ? 97 : 78,
      g: 0.05,
      d: 0.955,
      tr: 2.8,
    });
  }
  state.starflashes.push({
    x,
    y,
    life: 0.55,
    max: 0.55,
    r: 34 * scale,
    rot: rnd(0, TAU),
    spd: 2.5,
    hue: 208,
  });
  state.rings.push({ x, y, hue: 208, life: 0.45, max: 0.45, r: 100 * scale });
  state.glows.push({ x, y, hue: 205, life: 0.45, max: 0.45, r: 140 * scale + 20 });
}

/**
 * Slide #2 `stick()` when `w === "diamond"` (`games/firework/src/game/engine.ts` lines 697–701).
 */
export function spawnDiamondStickBurst(
  state: DiamondSlideState,
  x: number,
  y: number,
  scale = 1,
) {
  state.flash = Math.max(state.flash, 0.22);
  state.flashHue = 205;
  state.wpulse = Math.min(1, state.wpulse + 0.55);
  diamondBurst(state, x, y, scale);
}

/**
 * Slide #2 `clearLevel()` when `w === "diamond"` (`games/firework/src/game/engine.ts` lines 837–852):
 * Triple `diamondBurst` + giant StarFlash + large radial glow + 6 staggered sky diamond bursts.
 */
export function spawnDiamondClearFinale(state: DiamondSlideState, cx: number, cy: number) {
  state.flash = Math.max(state.flash, 0.55);
  state.flashHue = 205;
  state.wpulse = 1;
  diamondBurst(state, cx, cy, 1.9);
  diamondBurst(state, cx - 70, cy + 30, 1.1);
  diamondBurst(state, cx + 70, cy + 30, 1.1);
  state.starflashes.push({
    x: cx,
    y: cy,
    life: 0.9,
    max: 0.9,
    r: 60,
    rot: 0,
    spd: 1.5,
    hue: 210,
  });
  state.glows.push({ x: cx, y: cy, hue: 205, life: 0.9, max: 0.9, r: 300 });

  for (let i = 0; i < 6; i++) {
    state.timers.push({
      t: 0.3 + i * 0.3 + rnd(0, 0.1),
      fn: () => {
        slide23Sfx.sky('diamond');
        diamondBurst(state, rnd(60, state.w - 60), rnd(80, 320), rnd(0.85, 1.2) * 0.9);
      },
    });
  }
}

/**
 * Slide #2 `failRocket()` when `w === "diamond"` (`games/firework/src/game/engine.ts` lines 740–741).
 */
export function spawnDiamondFailBurst(state: DiamondSlideState, x: number, y: number) {
  state.flash = Math.max(state.flash, 0.7);
  state.flashHue = 205;
  diamondBurst(state, x, y, 1.2);
}

export function updateDiamondSlideState(
  state: DiamondSlideState,
  dt: number,
  stuckPins: { x: number; y: number }[] = [],
  gunActive = false,
  gunX = 210,
  gunY = 596,
) {
  const f = dt * 60;
  state.wpulse = Math.max(0, state.wpulse - dt * 2.2);
  state.flash = Math.max(0, state.flash - dt * 1.8);

  for (let i = state.timers.length - 1; i >= 0; i--) {
    state.timers[i].t -= dt;
    if (state.timers[i].t <= 0) {
      const fn = state.timers[i].fn;
      state.timers.splice(i, 1);
      fn();
    }
  }

  // Stuck diamond pins emit rising diamond glints (Slide #2 lines 1483–1494)
  for (const p of stuckPins) {
    if (Math.random() < 0.08 * f) {
      const white = Math.random() < 0.4;
      spawnParticle(
        state,
        p.x + rnd(-6, 6),
        p.y + rnd(-6, 6),
        rnd(-0.3, 0.3),
        rnd(-0.8, -0.2),
        {
          life: rnd(0.4, 0.8),
          size: rnd(1, 1.8),
          h: white ? 0 : rnd(198, 218),
          s: white ? 0 : 85,
          l: 88,
          g: -0.01,
          d: 0.96,
          tr: 1.6,
        },
      );
    }
  }

  // Diamond Gun idle glints around the weapon (Slide #2 lines 1656–1668)
  if (gunActive && Math.random() < 0.35 * f) {
    const white = Math.random() < 0.5;
    spawnParticle(
      state,
      gunX + rnd(-60, 60),
      rnd(gunY - 40, state.h - 60),
      rnd(-0.3, 0.3),
      rnd(-0.7, -0.2),
      {
        life: rnd(0.5, 1.0),
        size: rnd(0.9, 1.7),
        h: white ? 0 : 208,
        s: white ? 0 : 85,
        l: 90,
        g: -0.008,
        d: 0.99,
        tr: 1.4,
      },
    );
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

  for (let i = state.shards.length - 1; i >= 0; i--) {
    const d = state.shards[i];
    d.vy += 1300 * dt;
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    d.rot += d.vr * dt;
    d.life -= dt;
    if (d.life <= 0 || d.y > state.h + 100) state.shards.splice(i, 1);
  }

  for (let i = state.glows.length - 1; i >= 0; i--) {
    state.glows[i].life -= dt;
    if (state.glows[i].life <= 0) state.glows.splice(i, 1);
  }
  for (let i = state.rings.length - 1; i >= 0; i--) {
    state.rings[i].life -= dt;
    if (state.rings[i].life <= 0) state.rings.splice(i, 1);
  }
  for (let i = state.starflashes.length - 1; i >= 0; i--) {
    state.starflashes[i].life -= dt;
    if (state.starflashes[i].life <= 0) state.starflashes.splice(i, 1);
  }
}

function paintStaticBackdrop(c: CanvasRenderingContext2D, state: DiamondSlideState) {
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
 * Slide #2 background when `w === "diamond"` (`games/firework/src/game/engine.ts` lines 1998–2016):
 * night skyline + twinkling stars + icy-blue diamond atmosphere + diagonal crystal light beam +
 * additive glows + target wheel icy-blue aura.
 */
export function drawDiamondSlideBackground(
  c: CanvasRenderingContext2D,
  state: DiamondSlideState,
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

  // Slide #2 diamond atmosphere overlay + diagonal crystal light beam
  const dg = c.createLinearGradient(0, 0, 0, h);
  dg.addColorStop(0, 'rgba(30,60,100,0.22)');
  dg.addColorStop(0.6, 'rgba(40,80,130,0.08)');
  dg.addColorStop(1, 'rgba(20,40,80,0.24)');
  c.fillStyle = dg;
  c.fillRect(0, 0, w, h);

  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = 0.07 + 0.02 * Math.sin(time * 1.2);
  c.fillStyle = '#d8f0ff';
  const bx = 60 + Math.sin(time * 0.35) * 60;
  c.beginPath();
  c.moveTo(bx, -10);
  c.lineTo(bx + 70, -10);
  c.lineTo(bx + 150, h);
  c.lineTo(bx + 50, h);
  c.closePath();
  c.fill();
  c.restore();

  // Additive glows + target wheel icy-blue aura
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (const g of state.glows) {
    const k = Math.max(0, g.life / g.max);
    const rad = g.r * (1.3 - 0.3 * k);
    const gr = c.createRadialGradient(g.x, g.y, 0, g.x, g.y, rad);
    gr.addColorStop(0, diamondHsl(g.hue, 100, 60, 0.38 * k));
    gr.addColorStop(1, diamondHsl(g.hue, 100, 50, 0));
    c.fillStyle = gr;
    c.fillRect(g.x - rad, g.y - rad, rad * 2, rad * 2);
  }

  const wheelHue = diamondWheelHue(level);
  const og = c.createRadialGradient(cx, cy, R * 0.8, cx, cy, R + 85);
  og.addColorStop(0, diamondHsl(wheelHue, 100, 55, 0.32));
  og.addColorStop(1, diamondHsl(wheelHue, 100, 55, 0));
  c.fillStyle = og;
  c.beginPath();
  c.arc(cx, cy, R + 85, 0, TAU);
  c.fill();
  c.restore();
}

export function drawDiamondSlideGunGlow(
  c: CanvasRenderingContext2D,
  cx: number,
  gunY: number,
  recoil: number,
) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const gg = c.createRadialGradient(cx, gunY, 10, cx, gunY, 130);
  gg.addColorStop(0, `rgba(190,230,255,${0.22 + recoil * 0.3})`);
  gg.addColorStop(1, 'rgba(150,210,255,0)');
  c.fillStyle = gg;
  c.fillRect(cx - 140, gunY - 140, 280, 280);
  c.restore();
}

export function drawDiamondSlideForeground(
  c: CanvasRenderingContext2D,
  state: DiamondSlideState,
  cx: number,
  cy: number,
) {
  // 1. Flying faceted diamond shards (`kind: "shard"` in Slide #2 `drawDebris` lines 2605–2617)
  for (const d of state.shards) {
    const a = Math.min(1, d.life / 0.6);
    const s = d.a0 || 4;
    c.save();
    c.globalAlpha = a;
    c.translate(d.x, d.y);
    c.rotate(d.rot);
    c.fillStyle = diamondHsl(d.hue, 90, 72);
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(-s, 0);
    c.lineTo(0, -s * 0.6);
    c.lineTo(s, 0);
    c.lineTo(0, s * 0.6);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  // 2. Rotating 4-ray StarFlashes (`drawStarFlashes` in Slide #2 lines 1421–1453)
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (const s of state.starflashes) {
    const k = Math.max(0, s.life / s.max);
    const r = s.r * (0.6 + 0.4 * k);
    c.save();
    c.translate(s.x, s.y);
    c.rotate(s.rot + (1 - k) * s.spd);
    for (let i = 0; i < 4; i++) {
      const a = (i * TAU) / 4;
      const len = r * (i % 2 === 0 ? 1 : 0.45);
      const g = c.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
      g.addColorStop(0, `rgba(255,255,255,${0.95 * k})`);
      g.addColorStop(0.5, diamondHsl(s.hue, 90, 80, 0.7 * k));
      g.addColorStop(1, diamondHsl(s.hue, 90, 70, 0));
      c.strokeStyle = g;
      c.lineWidth = (i % 2 === 0 ? 5 : 3) * k + 0.8;
      c.lineCap = 'round';
      c.beginPath();
      ctxMoveLineTo(c, Math.cos(a) * len, Math.sin(a) * len);
      c.stroke();
    }
    c.fillStyle = `rgba(255,255,255,${0.9 * k})`;
    c.beginPath();
    c.arc(0, 0, r * 0.22, 0, TAU);
    c.fill();
    c.restore();
  }

  // 3. Sparkling diamond streak particles + expanding rings (Slide #2 lines 2067–2111)
  c.lineCap = 'round';
  for (const p of state.particles) {
    const k = Math.max(0, p.life / p.max);
    let a = Math.pow(k, 0.7);
    if (p.tw && k < 0.6) a *= 0.55 + Math.random() * 0.45;
    const l = k > 0.88 ? Math.min(95, p.l + 25) : p.l - (1 - k) * 12;
    const size = p.size * (0.45 + 0.55 * k);
    c.strokeStyle = diamondHsl(p.h, p.s, l, a);
    c.lineWidth = size * 1.6;
    c.beginPath();
    c.moveTo(p.x - p.vx * p.tr, p.y - p.vy * p.tr);
    c.lineTo(p.x, p.y);
    c.stroke();
    if (size > 2.1 && a > 0.2) {
      c.fillStyle = diamondHsl(p.h, p.s, 70, a * 0.18);
      c.beginPath();
      c.arc(p.x, p.y, size * 3.2, 0, TAU);
      c.fill();
    }
  }

  for (const r of state.rings) {
    const k = Math.max(0, r.life / r.max);
    c.strokeStyle = diamondHsl(r.hue, 100, 70, 0.7 * k);
    c.lineWidth = 3 * k + 0.5;
    c.beginPath();
    c.arc(r.x, r.y, r.r * (1 - k * k) + 4, 0, TAU);
    c.stroke();
  }
  c.restore();

  // 4. Slide #2 icy-blue weapon vignette pulse & impact flash
  if (state.wpulse > 0.01) {
    const vg = c.createRadialGradient(cx, cy, 60, cx, cy, 430);
    vg.addColorStop(0, diamondHsl(208, 100, 60, 0));
    vg.addColorStop(1, diamondHsl(208, 100, 60, 0.35 * state.wpulse));
    c.fillStyle = vg;
    c.fillRect(0, 0, state.w, state.h);
  }
  if (state.flash > 0.01) {
    c.fillStyle = diamondHsl(state.flashHue, 100, 70, Math.min(0.35, state.flash * 0.38));
    c.fillRect(0, 0, state.w, state.h);
  }
}

function ctxMoveLineTo(c: CanvasRenderingContext2D, x: number, y: number) {
  c.moveTo(0, 0);
  c.lineTo(x, y);
}
