import { type Ctx, TAU, dotSprite, drawSprite, glowSprite, lerp, makeBolt, makeCanvas, polyPath, rand, smokeSprite, starSprite } from './core';

// particle kinds
export const K = {
  SPARK: 0,
  GLOW: 1,
  SMOKE: 2,
  CHIP: 3,
  STAR: 4,
  DROP: 5,
  EMBER: 6,
  CUSTOM: 7,
  FLAKE: 8,
  RING: 9,
  TEXT: 10,
  FIRE: 11,
} as const;

export interface Particle {
  k: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  size2: number;
  rot: number;
  vrot: number;
  g: number;
  drag: number;
  color: string; // "r,g,b"
  alpha: number;
  add: boolean;
  back: boolean;
  len: number;
  variant: number;
  poly: number[] | null;
  target: { x: number; y: number } | null;
  pull: number;
  draw: ((ctx: Ctx, p: Particle) => void) | null;
  seed: number;
  text: string;
  data: unknown;
  die: ((p: Particle) => void) | null;
}

export function makeParticle(o: Partial<Particle>): Particle {
  const life = o.life ?? 1;
  const size = o.size ?? 4;
  return {
    k: K.GLOW,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: 0,
    vrot: 0,
    g: 0,
    drag: 0,
    color: '255,255,255',
    alpha: 1,
    add: false,
    back: false,
    len: 0.03,
    variant: Math.floor(Math.random() * 4),
    poly: null,
    target: null,
    pull: 0,
    draw: null,
    seed: Math.random() * 100,
    text: '',
    data: null,
    die: null,
    ...o,
    life,
    max: o.max ?? life,
    size,
    size2: o.size2 ?? size,
  };
}

export class Particles {
  list: Particle[] = [];

  add(o: Partial<Particle>) {
    const p = makeParticle(o);
    this.list.push(p);
    return p;
  }

  clear() {
    this.list.length = 0;
  }

  update(dt: number) {
    const L = this.list;
    let j = 0;
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      p.life -= dt;
      if (p.life <= 0) {
        if (p.die) p.die(p);
        continue;
      }
      if (p.target) {
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < 5) continue; // swallowed
        const acc = p.pull / (d * 0.012 + 0.3);
        p.vx += ((dx / d) * acc + (-dy / d) * acc * 0.5) * dt;
        p.vy += ((dy / d) * acc + (dx / d) * acc * 0.5) * dt;
      }
      if (p.drag) {
        const f = Math.exp(-p.drag * dt);
        p.vx *= f;
        p.vy *= f;
      }
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      L[j++] = p;
    }
    L.length = j;
  }

  draw(ctx: Ctx, back: boolean) {
    const L = this.list;
    // Droplets and sparks are the only kinds a rapid-fire gun spawns by the
    // hundred (Paintball throws ~66 droplets per hit at eight hits a second),
    // and drawing them one by one costs a `save`/`rotate`/`fill`/`stroke` each.
    // They are batched into one path per colour + alpha step first, then the
    // remaining kinds are drawn in their original order.
    if (!back) {
      drawBatchedDrops(ctx, L);
      drawBatchedSparks(ctx, L, false, false);
    }
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      if (p.back !== back || p.add) continue;
      if (!back && (p.k === K.DROP || p.k === K.SPARK)) continue; // already batched
      if (isConfetti(p)) {
        // Only combine adjacent paper pieces; unrelated custom drawing stays in
        // its original order and still executes its own callback.
        let end = i + 1;
        while (end < L.length && L[end].back === back && !L[end].add && isConfetti(L[end])) end++;
        drawConfettiRun(ctx, L, i, end);
        i = end - 1;
        continue;
      }
      drawParticle(ctx, p);
    }
    ctx.globalCompositeOperation = 'lighter';
    // Golden Gun's sparks are additive. Keep them in the additive pass, but
    // batch their separate paths just like the non-additive sparks above.
    drawBatchedSparks(ctx, L, true, back);
    for (let i = 0; i < L.length; i++) {
      const p = L[i];
      if (p.back === back && p.add && p.k !== K.SPARK) drawParticle(ctx, p);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}

interface ConfettiData { kind: 'confetti'; color: string; w: number; h: number; dot: boolean; paint: Particle['draw'] }

function isConfetti(p: Particle): boolean {
  return p.k === K.CUSTOM && !!p.draw && !!p.data
    && (p.data as { kind?: unknown }).kind === 'confetti'
    && (p.data as ConfettiData).paint === p.draw;
}

interface ConfettiBatch { color: string; alpha: number; pieces: Particle[]; frame: number }
const confettiBatches = new Map<string, ConfettiBatch>();
const activeConfettiBatches: ConfettiBatch[] = [];
let confettiFrame = 0;
const CONFETTI_ALPHA_STEPS = 16;

function confettiBackColor(hex: string): string {
  const rgb = Number.parseInt(hex.slice(1), 16);
  const r = Math.round(((rgb >> 16) & 255) * 0.78);
  const g = Math.round(((rgb >> 8) & 255) * 0.78);
  const b = Math.round((rgb & 255) * 0.78);
  return `rgb(${r},${g},${b})`;
}

/** Draw every fluttering dot/rectangle, retaining its color, rotation and flip. */
function drawConfettiRun(ctx: Ctx, list: Particle[], start: number, end: number) {
  if (end - start < 3 || typeof ctx.ellipse !== 'function') {
    for (let i = start; i < end; i++) drawParticle(ctx, list[i]);
    return;
  }
  const frame = ++confettiFrame;
  let used = 0;
  for (let i = start; i < end; i++) {
    const p = list[i];
    const data = p.data as ConfettiData;
    const t = p.life / p.max;
    const age = p.max - p.life;
    const flip = Math.cos(p.seed + age * 14);
    const alpha = Math.round(Math.min(1, t * 3) * CONFETTI_ALPHA_STEPS) / CONFETTI_ALPHA_STEPS;
    const key = `${data.color}:${alpha}:${flip < 0 ? 1 : 0}`;
    let batch = confettiBatches.get(key);
    if (!batch) {
      batch = { color: flip < 0 ? confettiBackColor(data.color) : data.color, alpha, pieces: [], frame: 0 };
      confettiBatches.set(key, batch);
    }
    if (batch.frame !== frame) {
      batch.frame = frame;
      batch.pieces.length = 0;
      activeConfettiBatches[used++] = batch;
    }
    batch.pieces.push(p);
  }
  ctx.save();
  for (let i = 0; i < used; i++) {
    const batch = activeConfettiBatches[i];
    ctx.globalAlpha = batch.alpha;
    ctx.fillStyle = batch.color;
    ctx.beginPath();
    for (const p of batch.pieces) {
      const data = p.data as ConfettiData;
      const t = p.life / p.max;
      const age = p.max - p.life;
      const x = p.x + Math.sin(p.seed + age * 5) * 2.4 * (1 - t);
      const y = p.y;
      const scale = 0.14 + 0.86 * Math.abs(Math.cos(p.seed + age * 14));
      const cos = Math.cos(p.rot), sin = Math.sin(p.rot);
      if (data.dot) {
        const rx = data.w * 0.5, ry = rx * scale;
        moveToEllipseStart(ctx, x, y, rx, ry, p.rot);
        ctx.ellipse(x, y, rx, ry, p.rot, 0, TAU);
      } else {
        const hw = data.w / 2, hh = data.h * scale / 2;
        const ax = hw * cos, ay = hw * sin, bx = -hh * sin, by = hh * cos;
        ctx.moveTo(x - ax - bx, y - ay - by);
        ctx.lineTo(x + ax - bx, y + ay - by);
        ctx.lineTo(x + ax + bx, y + ay + by);
        ctx.lineTo(x - ax + bx, y - ay + by);
        ctx.closePath();
      }
    }
    ctx.fill();
    batch.pieces.length = 0; // do not retain dead particles in the reusable cache
  }
  ctx.restore();
  activeConfettiBatches.length = 0;
}

/**
 * Batched droplet layer.
 *
 * `drawParticle`'s K.DROP case draws each droplet with its own translate /
 * rotate / two fills / a stroke, so a Paintball burst (66 droplets a hit, ~500
 * live) asked the canvas for ~1000 fills a second from this layer alone. Because
 * `ellipse()` takes a rotation argument, the whole layer collapses into one path
 * per colour + alpha step: body + outline per bucket, and the white gloss in a
 * second path. Alpha is bucketed in 8 steps (invisible on a 2-3px speck) and the
 * gloss is skipped below ~1.7px, where it was always a sub-pixel dot.
 *
 * The bucket map and arrays are module-level scratch reused every frame: the
 * first version of this batching in the slide-1 renderer allocated a Map and an
 * array per colour per frame, and that allocation showed up as GC time — the
 * exact cost the batching exists to remove.
 */
const DROP_ALPHA_STEPS = 8;
const GLOSS_MIN_RADIUS = 0.6;

interface DropBatch {
  color: string;
  data: string;
  alpha: number;
  /** Flat `x, y, rx, ry, rot` per droplet. */
  body: number[];
  /** Flat `x, y, r` per gloss dot. */
  gloss: number[];
  frame: number;
}

/**
 * Restart the path at an ellipse's own start point.
 *
 * `ellipse()`/`arc()` follow the canvas spec: if a subpath is already open they
 * add a straight line from the current point to the arc start. Chaining a
 * hundred droplets into one batched path therefore drew a web of lines joining
 * every droplet — filled, that web is big triangular wedges of paint smeared
 * across the wheel (the "efek paintball glitch" report). A `moveTo` at the arc
 * start makes each droplet its own subpath and the lines disappear.
 */
function moveToArcStart(ctx: Ctx, x: number, y: number, r: number) {
  ctx.moveTo(x + r, y);
}

/** Same, for a rotated ellipse. */
function moveToEllipseStart(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot: number) {
  void ry;
  ctx.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx);
}

const dropBatches = new Map<string, DropBatch>();
const dropActive: DropBatch[] = [];
let dropFrame = 0;

function drawBatchedDrops(ctx: Ctx, L: Particle[]) {
  dropFrame++;
  let used = 0;
  for (let i = 0; i < L.length; i++) {
    const p = L[i];
    if (p.k !== K.DROP || p.add || p.back === true) continue;
    const t = p.life / p.max; // 1 → 0
    const a = p.alpha * Math.min(1, t * 3);
    if (a <= 0.02) continue;
    const step = Math.max(1, Math.round(a * DROP_ALPHA_STEPS)) / DROP_ALPHA_STEPS;
    const data = (p.data as string | null) || '20,70,140';
    const key = `${p.color}|${data}|${step}`;
    let b = dropBatches.get(key);
    if (!b) {
      if (dropBatches.size > 512) dropBatches.clear();
      b = { color: p.color, data, alpha: step, body: [], gloss: [], frame: 0 };
      dropBatches.set(key, b);
    }
    if (b.frame !== dropFrame) {
      b.frame = dropFrame;
      b.body.length = 0;
      b.gloss.length = 0;
      dropActive[used++] = b;
    }
    const sp = Math.hypot(p.vx, p.vy);
    const st = 1 + Math.min(sp / 260, 2.2);
    const ang = Math.atan2(p.vy, p.vx);
    b.body.push(p.x, p.y, p.size * st, p.size, ang);
    const gr = p.size * 0.36;
    if (gr >= GLOSS_MIN_RADIUS) {
      const dx = p.size * st * 0.3;
      const dy = -p.size * 0.35;
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      b.gloss.push(p.x + dx * cos - dy * sin, p.y + dx * sin + dy * cos, gr);
    }
  }

  for (let i = 0; i < used; i++) {
    const b = dropActive[i];
    const body = b.body;
    if (!body.length) continue;
    ctx.beginPath();
    for (let k = 0; k < body.length; k += 5) {
      moveToEllipseStart(ctx, body[k], body[k + 1], body[k + 2], body[k + 3], body[k + 4]);
      ctx.ellipse(body[k], body[k + 1], body[k + 2], body[k + 3], body[k + 4], 0, TAU);
    }
    ctx.fillStyle = `rgba(${b.color},${b.alpha * 0.72})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${b.data},${b.alpha * 0.35})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
    const gloss = b.gloss;
    if (gloss.length) {
      ctx.beginPath();
      for (let k = 0; k < gloss.length; k += 3) {
        moveToArcStart(ctx, gloss[k], gloss[k + 1], gloss[k + 2]);
        ctx.arc(gloss[k], gloss[k + 1], gloss[k + 2], 0, TAU);
      }
      ctx.fillStyle = `rgba(255,255,255,${b.alpha * 0.9})`;
      ctx.fill();
    }
  }
  dropActive.length = used;
}

/**
 * Batched spark layer: every spark is a short round-capped line with its own
 * colour, alpha and width. One path per colour + alpha step + half-pixel width
 * turns hundreds of strokes into a handful (the freeze-ray and keris guns were
 * asking for ~70k strokes a second from sparks alone).
 */
const SPARK_ALPHA_STEPS = 8;

interface SparkBatch {
  color: string;
  alpha: number;
  width: number;
  seg: number[];
  frame: number;
}

const sparkBatches = new Map<string, SparkBatch>();
const sparkActive: SparkBatch[] = [];
let sparkFrame = 0;

function drawBatchedSparks(ctx: Ctx, L: Particle[], additive: boolean, back: boolean) {
  sparkFrame++;
  let used = 0;
  for (let i = 0; i < L.length; i++) {
    const p = L[i];
    if (p.k !== K.SPARK || p.add !== additive || p.back !== back) continue;
    const t = p.life / p.max;
    const a = p.alpha * Math.min(1, t * 1.8);
    if (a <= 0.02) continue;
    const step = Math.max(1, Math.round(a * SPARK_ALPHA_STEPS)) / SPARK_ALPHA_STEPS;
    const width = Math.max(0.5, Math.round(p.size * (0.35 + 0.65 * t) * 2) / 2);
    const key = `${p.color}|${step}|${width}`;
    let b = sparkBatches.get(key);
    if (!b) {
      if (sparkBatches.size > 512) sparkBatches.clear();
      b = { color: p.color, alpha: step, width, seg: [], frame: 0 };
      sparkBatches.set(key, b);
    }
    if (b.frame !== sparkFrame) {
      b.frame = sparkFrame;
      b.seg.length = 0;
      sparkActive[used++] = b;
    }
    b.seg.push(p.x, p.y, p.x - p.vx * p.len, p.y - p.vy * p.len);
  }

  if (used) ctx.lineCap = 'round';
  for (let i = 0; i < used; i++) {
    const b = sparkActive[i];
    const seg = b.seg;
    if (!seg.length) continue;
    ctx.beginPath();
    for (let k = 0; k < seg.length; k += 4) {
      ctx.moveTo(seg[k], seg[k + 1]);
      ctx.lineTo(seg[k + 2], seg[k + 3]);
    }
    ctx.strokeStyle = `rgba(${b.color},${b.alpha})`;
    ctx.lineWidth = b.width;
    ctx.stroke();
  }
  sparkActive.length = used;
}

const FIRE_PAL = ['255,255,238', '255,238,160', '255,208,80', '255,158,34', '244,104,18', '196,60,10', '120,32,8', '64,16,6'];

function drawParticle(ctx: Ctx, p: Particle) {
  const t = p.life / p.max; // 1 → 0
  const age = 1 - t;
  switch (p.k) {
    case K.SPARK: {
      const a = p.alpha * Math.min(1, t * 1.8);
      ctx.strokeStyle = `rgba(${p.color},${a})`;
      ctx.lineWidth = p.size * (0.35 + 0.65 * t);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * p.len, p.y - p.vy * p.len);
      ctx.stroke();
      break;
    }
    case K.GLOW:
      drawSprite(ctx, glowSprite(p.color), p.x, p.y, lerp(p.size, p.size2, age), p.alpha * t);
      break;
    case K.SMOKE: {
      const s = lerp(p.size, p.size2, 1 - Math.pow(t, 1.8));
      const fade = Math.min(1, age * 7) * Math.pow(t, 0.8);
      drawSprite(ctx, smokeSprite(p.color, p.variant), p.x, p.y, s, p.alpha * fade, p.rot);
      break;
    }
    case K.CHIP: {
      if (!p.poly) break;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha * Math.min(1, t * 3);
      ctx.fillStyle = `rgb(${p.color})`;
      polyPath(ctx, p.poly);
      ctx.fill();
      ctx.strokeStyle = (p.data as string | null) || 'rgba(255,236,200,0.4)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
      break;
    }
    case K.STAR: {
      const tw = 0.55 + 0.45 * Math.sin(p.seed + age * 26);
      drawSprite(ctx, starSprite(p.color), p.x, p.y, p.size * tw * Math.min(1, t * 2.5), p.alpha * Math.min(1, t * 2), p.rot);
      break;
    }
    case K.DROP: {
      const sp = Math.hypot(p.vx, p.vy);
      const st = 1 + Math.min(sp / 260, 2.2);
      const ang = Math.atan2(p.vy, p.vx);
      const a = p.alpha * Math.min(1, t * 3);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(ang);
      ctx.fillStyle = `rgba(${p.color},${a * 0.72})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * st, p.size, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = `rgba(${(p.data as string | null) || '20,70,140'},${a * 0.35})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`;
      ctx.beginPath();
      ctx.arc(p.size * st * 0.3, -p.size * 0.35, p.size * 0.36, 0, TAU);
      ctx.fill();
      ctx.restore();
      break;
    }
    case K.EMBER: {
      const fl = 0.6 + 0.4 * Math.sin(p.seed + age * 38);
      drawSprite(ctx, dotSprite(p.color), p.x, p.y, p.size * (0.6 + 0.4 * t) * 2.6, p.alpha * t * fl);
      break;
    }
    case K.FLAKE: {
      const flip = Math.cos(p.seed + age * 16);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.abs(flip) * 0.9 + 0.1);
      ctx.globalAlpha = p.alpha * Math.min(1, t * 3);
      ctx.fillStyle = flip > 0 ? '#ffe9a0' : '#b97a1c';
      ctx.beginPath();
      ctx.moveTo(-p.size, -p.size * 0.5);
      ctx.lineTo(p.size * 0.7, -p.size * 0.8);
      ctx.lineTo(p.size, p.size * 0.5);
      ctx.lineTo(-p.size * 0.6, p.size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
      break;
    }
    case K.RING: {
      const e = 1 - Math.pow(t, 3);
      const r = lerp(p.size, p.size2, e);
      ctx.strokeStyle = `rgba(${p.color},${p.alpha * t})`;
      ctx.lineWidth = p.len * t + 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, TAU);
      ctx.stroke();
      break;
    }
    case K.TEXT: {
      ctx.globalAlpha = Math.min(1, t * 2.5);
      ctx.font = `${p.size}px "Lilita One", system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(30,10,40,0.85)';
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillStyle = `rgb(${p.color})`;
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
      break;
    }
    case K.FIRE: {
      const idx = Math.min(FIRE_PAL.length - 1, Math.floor(age * FIRE_PAL.length * 0.98));
      const sz = lerp(p.size, p.size2, Math.min(1, age * 1.6));
      const fa = p.alpha * Math.min(1, age * 12) * Math.min(1, t / 0.12);
      drawSprite(ctx, glowSprite(FIRE_PAL[idx]), p.x, p.y, sz, fa);
      if (age < 0.4) drawSprite(ctx, glowSprite('255,250,225'), p.x, p.y, sz * 0.45, fa * (1 - age / 0.4));
      break;
    }
    case K.CUSTOM:
      if (p.draw) p.draw(ctx, p);
      break;
  }
}

// ───────────────────────── FX objects ─────────────────────────
export interface FX {
  done: boolean;
  update(dt: number): void;
  draw(ctx: Ctx): void;
}

function strokePoly(ctx: Ctx, pts: number[], style: string, width: number) {
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
}

export class Lightning implements FX {
  done = false;
  age = 0;
  pts: number[][] = [];
  private regenT = 0;
  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number,
    public life = 0.3,
    public color = '190,120,255',
    public width = 2,
    public branches = 2,
    public regen = 0.045,
  ) {
    this.gen();
  }
  gen() {
    const main = makeBolt(this.x1, this.y1, this.x2, this.y2, 0.3, 5);
    this.pts = [main];
    const n = main.length / 2;
    for (let b = 0; b < this.branches; b++) {
      const idx = 2 * Math.floor(rand(0.2, 0.75) * n);
      const bx = main[idx];
      const by = main[idx + 1];
      const ang = Math.atan2(this.y2 - this.y1, this.x2 - this.x1) + rand(-1, 1);
      const len = Math.hypot(this.x2 - this.x1, this.y2 - this.y1) * rand(0.2, 0.45);
      this.pts.push(makeBolt(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len, 0.32, 4));
    }
  }
  update(dt: number) {
    this.age += dt;
    this.regenT += dt;
    if (this.regenT > this.regen) {
      this.regenT = 0;
      this.gen();
    }
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = 1 - this.age / this.life;
    const fl = 0.6 + Math.random() * 0.4;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.pts.forEach((p, i) => {
      const m = i === 0 ? 1 : 0.55;
      strokePoly(ctx, p, `rgba(${this.color},${0.16 * t * fl})`, this.width * 6 * m);
      strokePoly(ctx, p, `rgba(${this.color},${0.55 * t * fl})`, this.width * 2.2 * m);
      strokePoly(ctx, p, `rgba(255,255,255,${0.95 * t * fl})`, this.width * 0.7 * m);
    });
    ctx.restore();
  }
}

/**
 * Identical to Lightning when drawn on its own. The host can recognize these
 * yellow wheel bolts and batch overlapping rapid-fire impacts, without
 * changing Plasma Gun's original green renderer or lifetime.
 */
export class BatchableWheelLightning extends Lightning {}

export function flame(ctx: Ctx, ang: number, len: number, wid: number, c0: string, c1: string, c2: string, alpha = 1) {
  if (len < 1 || wid < 0.3) return;
  ctx.save();
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, `rgba(${c0},${alpha})`);
  g.addColorStop(0.35, `rgba(${c1},${0.9 * alpha})`);
  g.addColorStop(1, `rgba(${c2},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -wid * 0.45);
  ctx.quadraticCurveTo(len * 0.32, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.32, wid, 0, wid * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function spike(ctx: Ctx, ang: number, len: number, wid: number, col: string, alpha = 1) {
  ctx.save();
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, len, 0);
  g.addColorStop(0, `rgba(255,255,255,${alpha})`);
  g.addColorStop(0.3, `rgba(${col},${0.85 * alpha})`);
  g.addColorStop(1, `rgba(${col},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -wid / 2);
  ctx.lineTo(len, 0);
  ctx.lineTo(0, wid / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export class MuzzleFlash implements FX {
  done = false;
  age = 0;
  rot = rand(0, TAU);
  seedA = Math.random();
  constructor(public x: number, public y: number, public kind: 'gold' | 'shotgun', public life = 0.09) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const s = t < 0.3 ? 1 : 1 - (t - 0.3) / 0.7;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    if (this.kind === 'gold') {
      drawSprite(ctx, glowSprite('255,180,50'), 0, -14, 190 * s, 0.85 * s);
      drawSprite(ctx, glowSprite('255,245,200'), 0, -8, 70 * s, s);
      for (let i = 0; i < 10; i++) {
        const a = this.rot + (i * TAU) / 10;
        const up = Math.max(0, -Math.sin(a));
        const len = (16 + up * 52 + (i % 2) * 8) * (0.6 + 0.4 * s);
        spike(ctx, a, len, (i % 2 ? 3 : 5) * s, '255,226,140', s);
      }
      flame(ctx, -Math.PI / 2, 64 * (0.7 + 0.3 * s), 13 * s, '255,255,240', '255,214,90', '255,140,20', s);
      flame(ctx, -Math.PI / 2 - 0.35, 30 * s, 7 * s, '255,255,230', '255,200,80', '255,120,20', s);
      flame(ctx, -Math.PI / 2 + 0.35, 30 * s, 7 * s, '255,255,230', '255,200,80', '255,120,20', s);
      ctx.fillStyle = `rgba(255,255,255,${s})`;
      ctx.beginPath();
      ctx.arc(0, -3, 7 * s, 0, TAU);
      ctx.fill();
    } else {
      drawSprite(ctx, glowSprite('255,130,40'), 0, -26, 300 * s, 0.85 * s);
      drawSprite(ctx, glowSprite('255,230,170'), 0, -14, 110 * s, s);
      for (let i = 0; i < 7; i++) {
        const off = (i - 3) * 0.17 + (this.seedA - 0.5) * 0.12;
        const a = -Math.PI / 2 + off;
        const len = (i === 3 ? 125 : 95 - Math.abs(i - 3) * 14 + rand(-8, 8)) * (0.7 + 0.3 * s);
        flame(ctx, a, len, (i === 3 ? 22 : 13) * s, '255,255,235', '255,196,70', '255,80,10', s);
      }
      flame(ctx, Math.PI - 0.25, 30 * s, 9 * s, '255,250,220', '255,180,60', '255,70,0', s);
      flame(ctx, 0.25, 30 * s, 9 * s, '255,250,220', '255,180,60', '255,70,0', s);
      ctx.fillStyle = `rgba(255,255,240,${s})`;
      ctx.beginPath();
      ctx.arc(0, -4, 10 * s, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class Light implements FX {
  done = false;
  age = 0;
  constructor(public x: number, public y: number, public r: number, public color: string, public intensity: number, public life: number) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = 1 - this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(this.color), this.x, this.y, this.r * 2, this.intensity * t * t);
    ctx.restore();
  }
}

/** A reusable tapered gradient ray, tinted per palette instead of rebuilt per ray per frame. */
const raySprites = new Map<string, HTMLCanvasElement>();
function getRaySprite(ctx: Ctx, color: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined'
    || !(ctx.canvas instanceof HTMLCanvasElement)) return null;
  const cached = raySprites.get(color);
  if (cached) return cached;
  try {
    const w = 128;
    const h = 32;
    const sprite = makeCanvas(w, h);
    const c = sprite.getContext('2d');
    if (!c) return null;
    const g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'rgba(255,255,240,0.9)');
    g.addColorStop(0.4, `rgba(${color},0.5)`);
    g.addColorStop(1, `rgba(${color},0)`);
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(0, h * 0.3);
    c.lineTo(w, 0);
    c.lineTo(w, h);
    c.lineTo(0, h * 0.7);
    c.closePath();
    c.fill();
    if (raySprites.size >= 64) {
      const oldest = raySprites.keys().next().value;
      if (oldest !== undefined) raySprites.delete(oldest);
    }
    raySprites.set(color, sprite);
    return sprite;
  } catch {
    return null;
  }
}

export class Rays implements FX {
  done = false;
  age = 0;
  rays: { a: number; len: number; w: number }[] = [];
  constructor(public x: number, public y: number, public color: string, public life = 0.45, n = 12, base = Math.PI / 2, spread = Math.PI, public scale = 1) {
    for (let i = 0; i < n; i++) this.rays.push({ a: base + rand(-spread, spread), len: rand(50, 120) * scale, w: rand(3, 9) * scale });
  }
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const grow = 1 - Math.pow(1 - Math.min(1, t * 2.2), 3);
    const a = 1 - t;
    const sprite = getRaySprite(ctx, this.color);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y);
    if (sprite) ctx.globalAlpha *= Math.max(0, a);
    for (const r of this.rays) {
      const len = r.len * grow;
      if (len <= 0.01 || r.w <= 0) continue;
      ctx.save();
      ctx.rotate(r.a + t * 0.25);
      if (sprite) {
        // Preserve each ray's original width, angle and animated length; the
        // bitmap contains only its static gradient and tapered silhouette.
        ctx.drawImage(sprite, 0, -r.w * 0.5, len, r.w);
      } else {
        const g = ctx.createLinearGradient(0, 0, len, 0);
        g.addColorStop(0, `rgba(255,255,240,${0.9 * a})`);
        g.addColorStop(0.4, `rgba(${this.color},${0.5 * a})`);
        g.addColorStop(1, `rgba(${this.color},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -r.w * 0.2);
        ctx.lineTo(len, -r.w * 0.5);
        ctx.lineTo(len, r.w * 0.5);
        ctx.lineTo(0, r.w * 0.2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}

/** fading tapered streak (bullet tracer after impact) */
export class Streak implements FX {
  done = false;
  age = 0;
  constructor(public x: number, public y1: number, public y2: number, public w: number, public color: string, public life: number) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = 1 - this.age / this.life;
    const y2 = lerp(this.y1, this.y2, t);
    if (Math.abs(y2 - this.y1) < 1) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, this.y1, 0, y2);
    g.addColorStop(0, `rgba(255,255,230,${0.95 * t})`);
    g.addColorStop(0.25, `rgba(${this.color},${0.6 * t})`);
    g.addColorStop(1, `rgba(${this.color},0)`);
    ctx.fillStyle = g;
    const w = this.w * t;
    ctx.beginPath();
    ctx.moveTo(this.x - w, this.y1);
    ctx.lineTo(this.x + w, this.y1);
    ctx.lineTo(this.x, y2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/** water splash sheet (crown) */
export class SplashSheet implements FX {
  done = false;
  age = 0;
  constructor(public x: number, public y: number, public ang: number, public size = 46, public life = 0.22) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = this.age / this.life;
    const r = this.size * (1 - Math.pow(1 - t, 2.5));
    const a = 1 - t;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.ang);
    const g = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r);
    g.addColorStop(0, `rgba(210,240,255,${0.05 * a})`);
    g.addColorStop(0.7, `rgba(170,220,255,${0.35 * a})`);
    g.addColorStop(1, `rgba(255,255,255,${0.6 * a})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const spread = 1.25;
    const n = 14;
    for (let i = 0; i <= n; i++) {
      const aa = -spread + (i / n) * spread * 2;
      const rr = r * (0.75 + 0.25 * Math.sin(i * 2.3 + 1.7));
      ctx.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * a})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }
}

/** glowing polylines, used for hot cracks on the wheel (wheel-local space) */
export class GlowLines implements FX {
  done = false;
  age = 0;
  constructor(public lines: number[][], public color: string, public width: number, public life: number) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = 1 - this.age / this.life;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // Every crack has the same three glow layers. Build one disconnected path
    // and stroke it three times instead of doing three strokes per crack.
    ctx.beginPath();
    for (const l of this.lines) {
      if (l.length < 4) continue;
      ctx.moveTo(l[0], l[1]);
      for (let i = 2; i < l.length; i += 2) ctx.lineTo(l[i], l[i + 1]);
    }
    ctx.strokeStyle = `rgba(${this.color},${0.25 * t})`;
    ctx.lineWidth = this.width * 4;
    ctx.stroke();
    ctx.strokeStyle = `rgba(${this.color},${0.8 * t})`;
    ctx.lineWidth = this.width * 1.4;
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,230,${0.9 * t * t})`;
    ctx.lineWidth = this.width * 0.5;
    ctx.stroke();
    ctx.restore();
  }
}

/** fading glow spot (wheel-local) */
export class GlowSpot implements FX {
  done = false;
  age = 0;
  constructor(public x: number, public y: number, public size: number, public color: string, public life: number, public intensity = 1) {}
  update(dt: number) {
    this.age += dt;
    if (this.age >= this.life) this.done = true;
  }
  draw(ctx: Ctx) {
    const t = 1 - this.age / this.life;
    const fl = 0.85 + 0.15 * Math.sin(this.age * 30 + this.x);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(this.color), this.x, this.y, this.size, this.intensity * t * fl);
    ctx.restore();
  }
}
