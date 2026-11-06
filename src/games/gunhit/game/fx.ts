import { drawSpiritMote } from '../../shared/spiritArt';
import { drawXenoMolecularBurst } from './art/xenoHybrid';
import type { Weapon, WeaponId } from './weapons';
import { getGunEffect, supportsGunVariants } from './art/gunVariants';
import { spawnClassicMuzzle, spawnClassicImpact } from './classicShotFx';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];


// ---------------------------------------------------------------- colors
/**
 * Particle colors arrive in three shapes across the codebase: hex (`#b6ff1a`),
 * bare rgb triplets (`182,255,26`, used by the slide-7 port) and already
 * wrapped rgba strings. `fill()`/`stroke()` silently ignore a bare triplet, so
 * whole rings, bolts, sparks and smoke plumes from the elemental weapons were
 * invisible. Normalising here restores them everywhere.
 */
/**
 * Parsed `r,g,b` triplet per colour string.
 *
 * `cssColor` runs once per drawn particle per frame — on a paintball burst that
 * is a thousand regex matches a second, and the profiler showed it as the
 * single biggest JS cost of a frame. The set of colours in play is tiny, so the
 * triplet is parsed once and reused; only the alpha has to be re-formatted.
 */
const tripletCache = new Map<string, string | null>();
/** Colour strings that already are opaque CSS, keyed by the string itself. */
const plainCache = new Map<string, string>();

function parseTriplet(color: string): string | null {
  const hit = tripletCache.get(color);
  if (hit !== undefined) return hit;
  let out: string | null = null;
  if (color[0] === '#') {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
    if (hex.length === 6) {
      const n = parseInt(hex, 16);
      out = `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    }
  } else {
    const triplet = color.match(/^\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
    if (triplet) out = `${+triplet[1]},${+triplet[2]},${+triplet[3]}`;
    else {
      const open = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*$/);
      if (open) out = `${+open[1]},${+open[2]},${+open[3]}`;
      else {
        const full = color.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)$/);
        if (full) out = `${+full[1]},${+full[2]},${+full[3]}`;
      }
    }
  }
  if (tripletCache.size > 4096) tripletCache.clear();
  tripletCache.set(color, out);
  return out;
}

export function cssColor(color: string, alpha = 1): string {
  if (!color) return `rgba(255,255,255,${alpha})`;
  if (alpha === 1) {
    const plain = plainCache.get(color);
    if (plain) return plain;
    const trip = parseTriplet(color);
    const out = trip === null ? color : `rgba(${trip},1)`;
    if (plainCache.size > 4096) plainCache.clear();
    plainCache.set(color, out);
    return out;
  }
  const trip = parseTriplet(color);
  return trip === null ? color : `rgba(${trip},${alpha})`;
}

/**
 * All `drop` particles of the frame, batched into one path per colour + alpha
 * step.
 *
 * A single paintball hit throws 22 droplets and the gun fires eight times a
 * second, so the droplet layer was ~900 separate `fill()` calls every frame.
 * Ellipses take a rotation argument, so they batch perfectly: a screen full of
 * droplets now costs a handful of fills, and the shape, colour, angle, gloss and
 * fade are unchanged (the alpha is bucketed in 8 steps, well below what an eye
 * can resolve on a 3-6px speck). Droplet count itself was left alone — the gun
 * still paints exactly as thick as it did.
 *
 * The buckets are module-level scratch reused frame to frame; the first version
 * built a `Map` and an array per colour per frame, and that allocation showed up
 * as GC time in the profile — the very thing this batching exists to avoid.
 */
/**
 * Restart the path at a shape's own start point before drawing it.
 *
 * `ellipse()`/`arc()` add a straight line from the current point to the arc
 * start when a subpath is already open, so chaining droplets into one batched
 * path joined them with lines — filled, that showed up as triangular wedges of
 * paint smeared over the wheel instead of separate droplets.
 */
function moveToArcStart(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.moveTo(x + r, y);
}

function moveToEllipseStart(c: CanvasRenderingContext2D, x: number, y: number, rx: number, rot: number) {
  c.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx);
}

const dropBuckets = new Map<string, Particle[][]>();
const dropActive: string[] = [];

/**
 * Boss stages: every splinter, spark, plume, chip and shard a round throws
 * belongs to the drawing it bit into. The game registers the boss' silhouette
 * here for the length of its effect pass, and each splinter layer runs its own
 * particle draw through `withSplinterClip` — so the debris stops on the blue
 * outline the round stopped on, while a round that is still in flight (painted
 * by its own layer, outside this hook) keeps flying straight through.
 */
type SplinterClipPaint = (c: CanvasRenderingContext2D) => boolean;
let splinterClip: { ctx: CanvasRenderingContext2D; paint: SplinterClipPaint } | null = null;

export function setSplinterClip(ctx: CanvasRenderingContext2D, paint: SplinterClipPaint | null): void {
  splinterClip = paint ? { ctx, paint } : null;
}

export function withSplinterClip(c: CanvasRenderingContext2D, draw: () => void): void {
  if (!splinterClip || splinterClip.ctx !== c) { draw(); return; }
  const paint = splinterClip.paint;
  c.save();
  if (!paint(c)) { c.restore(); draw(); return; }
  try { draw(); } finally { c.restore(); }
}

export function drawDropParticles(c: CanvasRenderingContext2D, particles: readonly Particle[]): void {
  // Wipe whatever the previous frame left in the shared buckets.
  for (const color of dropActive) {
    const byStep = dropBuckets.get(color)!;
    for (const list of byStep) list.length = 0;
  }
  dropActive.length = 0;

  let any = false;
  for (const p of particles) {
    if (p.kind !== 'drop') continue;
    const a = Math.max(0, p.life / p.max);
    if (a < 0.04) continue;
    const step = Math.min(7, Math.max(0, Math.round(Math.min(1, a * 2) * 8) - 1));
    let byStep = dropBuckets.get(p.color);
    if (!byStep) {
      byStep = [[], [], [], [], [], [], [], []];
      dropBuckets.set(p.color, byStep);
    }
    byStep[step].push(p);
    any = true;
  }
  if (!any) return;

  c.save();
  for (const [color, byStep] of dropBuckets) {
    let used = false;
    for (let step = 0; step < 8; step++) {
      const list = byStep[step];
      if (!list.length) continue;
      used = true;
      c.globalAlpha = (step + 1) / 8;
      c.fillStyle = cssColor(color);
      c.beginPath();
      for (const p of list) {
        const rot = Math.atan2(p.vy, p.vx);
        moveToEllipseStart(c, p.x, p.y, p.size * dropStretch(p), rot);
        c.ellipse(p.x, p.y, p.size * dropStretch(p), p.size * 0.7, rot, 0, TAU);
      }
      c.fill();
      // Gloss: sub-pixel below ~3.4px, so it is batched only where it shows.
      let gloss = false;
      for (const p of list) {
        if (p.size < 3.4) continue;
        if (!gloss) {
          gloss = true;
          c.fillStyle = 'rgba(255,255,255,0.7)';
          c.beginPath();
        }
        const ang = Math.atan2(p.vy, p.vx);
        const hx = 0.3 * p.size;
        const hy = -0.2 * p.size;
        const gx = p.x + hx * Math.cos(ang) - hy * Math.sin(ang);
        const gy = p.y + hx * Math.sin(ang) + hy * Math.cos(ang);
        moveToArcStart(c, gx, gy, p.size * 0.22);
        c.arc(gx, gy, p.size * 0.22, 0, TAU);
      }
      if (gloss) c.fill();
    }
    if (used) dropActive.push(color);
  }
  c.restore();
}

/** How much a moving droplet is stretched along its direction of travel. */
function dropStretch(p: Particle): number {
  return Math.min(2.5, Math.hypot(p.vx, p.vy) / 250 + 1);
}

/**
 * Smoke plumes, drawn from a radial gradient cached per context + colour.
 *
 * The plume used to build a fresh `createRadialGradient` with three colour
 * stops for every particle on every frame — the biggest source of gradient
 * allocations in the whole game (a snowball or freeze burst made 400 of them a
 * frame). One unit-radius gradient per colour does the same job: the transform
 * places and scales it, and `globalAlpha` carries the fade-in/out.
 */
const smokeGradients = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>();

export function drawSmokeParticle(c: CanvasRenderingContext2D, p: Particle, alpha: number): void {
  const r = p.size * (1.6 - alpha * 0.6);
  if (r <= 0.2 || alpha <= 0.01) return;
  let byColor = smokeGradients.get(c);
  if (!byColor) {
    byColor = new Map();
    smokeGradients.set(c, byColor);
  }
  let g = byColor.get(p.color);
  if (!g) {
    g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, cssColor(p.color, 0.45));
    g.addColorStop(0.55, cssColor(p.color, 0.2));
    g.addColorStop(1, cssColor(p.color, 0));
    byColor.set(p.color, g);
  }
  c.save();
  c.globalAlpha = Math.min(1, alpha);
  c.translate(p.x, p.y);
  c.scale(r, r);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 1, 0, TAU);
  c.fill();
  c.restore();
}

// ---------------------------------------------------------------- particles
export type PKind =
  | 'spark' | 'chip' | 'smoke' | 'shell' | 'text' | 'ring' | 'glow' | 'bolt'
  | 'star' | 'shard' | 'shock' | 'drop' | 'streak' | 'petal'
  | 'snowflake' | 'snowChunk' | 'snowDust' | 'waterDrop' | 'waterSplash' | 'honeyDrop' | 'honeySplash'
  | 'bananaDrop' | 'bananaSplash' | 'slap' | 'pencilShaving' | 'paintSplat' | 'prism' | 'feather'
  | 'ringE' | 'puff' | 'wind' | 'ash' | 'bubble' | 'acid' | 'speed' | 'spirit' | 'xenoMolecular';

export interface Particle {
  tx?: number; ty?: number;
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string;
  kind: PKind; rot: number; vr: number; g: number; text?: string;
  drag?: number; extra?: number; grow?: number;
}

export interface FxSink {
  push(p: Particle): void;
  light(x: number, y: number, r: number, rgb: string, life: number): void;
}

// ---------------------------------------------------------------- profiles
export type Impact =
  | 'bullet' | 'heavy' | 'energy' | 'electric' | 'ice' | 'water' | 'snow' | 'fire' | 'explosive'
  | 'pixel' | 'void' | 'magic' | 'honey' | 'blade' | 'nature' | 'confetti' | 'gold' | 'stone' | 'glass' | 'sonic'
  | 'sandal' | 'slingshot' | 'pencil' | 'paintball' | 'holy' | 'gem' | 'buster' | 'obliterator' | 'unicorn' | 'wand';

export type Decal =
  | 'hole' | 'bigHole' | 'scorch' | 'burn' | 'frost' | 'splash' | 'paint' | 'glow' | 'slit' | 'pixel' | 'dent' | 'snow' | 'none';
export type MuzzleKind = 'fire' | 'energy' | 'soft' | 'quiet' | 'none';

export interface FxProfile {
  impact: Impact;
  decal: Decal;
  muzzle: MuzzleKind;
  light: string; // rgb
  lightR: number;
  hitstop: number;
  kick: number;
  ghost: number;
  streak: number;
  speedLines: boolean;
  tint: number;
  decalColors?: string[];
}

const P = (impact: Impact, decal: Decal, muzzle: MuzzleKind, light: string, lightR: number, extra: Partial<FxProfile> = {}): FxProfile => ({
  impact, decal, muzzle, light, lightR, hitstop: 0.02, kick: 3, ghost: 0, streak: 1, speedLines: false, tint: 0, ...extra,
});

const WARM = '255,200,120';

export const FX: Record<WeaponId, FxProfile> = {
  // Originals
  pistol: P('bullet', 'hole', 'fire', WARM, 90, { kick: 3 }),
  ak47: P('bullet', 'hole', 'fire', '255,190,110', 80, { hitstop: 0.012, kick: 2.5 }),
  nail: P('blade', 'slit', 'quiet', '255,235,180', 50, { hitstop: 0.008, kick: 1, streak: 0.8 }),
  crossbow: P('blade', 'slit', 'quiet', '255,255,255', 60, { kick: 2, streak: 1.3, speedLines: true }),
  plasma: P('energy', 'glow', 'energy', '57,255,156', 150, { hitstop: 0.035, kick: 4, ghost: 4, tint: 0.12, decalColors: ['#0b3d24', '#39ff9c'] }),
  laser: P('energy', 'glow', 'energy', '255,42,85', 130, { kick: 3, decalColors: ['#3d0010', '#ff2a55'] }),
  fish: P('water', 'splash', 'soft', '120,210,255', 80, { kick: 2, decalColors: ['rgba(80,170,255,0.35)'] }),
  rpg: P('explosive', 'scorch', 'fire', '255,150,60', 250, { hitstop: 0.08, kick: 10, tint: 0.25, streak: 1.3 }),
  cricket: P('heavy', 'bigHole', 'energy', '120,190,255', 300, { hitstop: 0.13, kick: 16, tint: 0.35, speedLines: true, ghost: 3 }),
  electro: P('electric', 'glow', 'energy', '90,209,255', 150, { hitstop: 0.03, kick: 3, decalColors: ['#05202e', '#5ad1ff'] }),
  bazooka: P('explosive', 'scorch', 'fire', '255,140,50', 280, { hitstop: 0.11, kick: 13, tint: 0.3, streak: 1.4 }),
  freeze: P('ice', 'frost', 'energy', '155,231,255', 150, { hitstop: 0.04, kick: 3, tint: 0.15 }),
  // Frequent Golden Gun hits must stay responsive even on the original effect.
  golden: P('gold', 'hole', 'fire', '255,215,90', 160, { hitstop: 0, kick: 4, ghost: 2, tint: 0.12 }),
  blackhole: P('void', 'glow', 'energy', '168,85,247', 180, { hitstop: 0.05, kick: 5, ghost: 5, tint: 0.2, decalColors: ['#000000', '#a855f7'] }),

  // Nusantara & fun
  slingshot: P('slingshot', 'dent', 'quiet', '230,220,200', 70, { hitstop: 0.045, kick: 5, speedLines: true, ghost: 2, streak: 1.2 }),
  blowgun: P('blade', 'slit', 'quiet', '230,255,210', 40, { hitstop: 0, kick: 1, streak: 0.9 }),
  shotgun: P('heavy', 'hole', 'fire', '255,190,100', 160, { hitstop: 0.03, kick: 5 }),
  soaker: P('water', 'splash', 'soft', '96,165,250', 70, { hitstop: 0, kick: 1, decalColors: ['rgba(59,130,246,0.3)'] }),
  snowball: P('snow', 'snow', 'soft', '230,245,255', 80, { kick: 2 }),
  sniper: P('heavy', 'bigHole', 'fire', '255,220,160', 200, { hitstop: 0.09, kick: 10, speedLines: true, streak: 1.6, tint: 0.12 }),
  flamethrower: P('fire', 'burn', 'fire', '255,140,40', 120, { hitstop: 0, kick: 1.5 }),
  bamboo: P('explosive', 'scorch', 'fire', '255,240,200', 260, { hitstop: 0.09, kick: 11, tint: 0.3 }),
  banana: P('water', 'paint', 'soft', '255,230,80', 70, { kick: 2, decalColors: ['rgba(250,204,21,0.5)', 'rgba(254,240,138,0.5)'] }),
  bubble: P('water', 'none', 'soft', '220,200,255', 80, { kick: 1, ghost: 2 }),
  harpoon: P('blade', 'slit', 'quiet', '200,240,255', 60, { hitstop: 0.03, kick: 3, speedLines: true }),
  chicken: P('water', 'none', 'soft', '255,240,150', 80, { kick: 2 }),
  confetti: P('confetti', 'paint', 'soft', '255,180,220', 100, { kick: 2, decalColors: ['rgba(244,63,94,0.5)', 'rgba(250,204,21,0.5)', 'rgba(34,211,238,0.5)', 'rgba(168,85,247,0.5)'] }),
  seed: P('nature', 'none', 'soft', '180,230,120', 60, { kick: 1 }),
  pizza: P('water', 'paint', 'soft', '255,200,120', 70, { kick: 2, decalColors: ['rgba(185,28,28,0.5)', 'rgba(251,191,36,0.4)'] }),
  minigun: P('bullet', 'hole', 'fire', '255,200,120', 80, { hitstop: 0, kick: 1.5 }),
  railgun: P('electric', 'glow', 'energy', '120,200,255', 200, { hitstop: 0.07, kick: 8, speedLines: true, ghost: 3, tint: 0.18, decalColors: ['#04182a', '#38bdf8'] }),
  magnet: P('electric', 'dent', 'energy', '255,100,100', 120, { kick: 3 }),
  shrink: P('energy', 'glow', 'energy', '74,222,128', 120, { kick: 2, ghost: 4, decalColors: ['#052e16', '#4ade80'] }),
  grow: P('energy', 'glow', 'energy', '251,146,60', 140, { kick: 4, ghost: 3, decalColors: ['#431407', '#fb923c'] }),
  pirate: P('heavy', 'bigHole', 'fire', '255,180,90', 220, { hitstop: 0.08, kick: 11, tint: 0.15 }),
  card: P('blade', 'slit', 'quiet', '255,255,255', 50, { hitstop: 0.01, kick: 1, ghost: 2 }),
  dragon: P('fire', 'burn', 'fire', '255,110,40', 180, { hitstop: 0.04, kick: 5, tint: 0.15, ghost: 2 }),
  gravity: P('void', 'glow', 'energy', '129,140,248', 160, { hitstop: 0.04, kick: 4, ghost: 3, decalColors: ['#0f0a2e', '#818cf8'] }),

  // Wave 3
  honey: P('honey', 'paint', 'soft', '251,191,36', 95, { kick: 1.5, decalColors: ['rgba(245,158,11,0.65)', 'rgba(251,191,36,0.75)'] }),
  coconut: P('water', 'dent', 'soft', '217,249,157', 90, { hitstop: 0.04, kick: 6 }),
  angklung: P('magic', 'glow', 'soft', '253,230,138', 90, { kick: 2, decalColors: ['#451a03', '#fbbf24'] }),
  bee: P('blade', 'slit', 'quiet', '250,204,21', 50, { hitstop: 0, kick: 1 }),
  yoyo: P('slingshot', 'dent', 'quiet', '255,140,140', 70, { kick: 2.5 }),
  sakura: P('nature', 'paint', 'quiet', '249,168,212', 80, { kick: 1.5, ghost: 2, decalColors: ['rgba(249,168,212,0.55)', 'rgba(251,207,232,0.6)'] }),
  acid: P('water', 'burn', 'soft', '163,230,53', 90, { kick: 2, tint: 0.08 }),
  keris: P('electric', 'slit', 'energy', '77,238,234', 160, { hitstop: 0.04, kick: 5, ghost: 0, speedLines: false, tint: 0.08 }),
  firework: P('confetti', 'scorch', 'fire', '255,180,200', 200, { hitstop: 0.06, kick: 6, tint: 0.15 }),
  anchor: P('heavy', 'bigHole', 'quiet', '180,190,210', 160, { hitstop: 0.09, kick: 11 }),
  shark: P('water', 'bigHole', 'soft', '125,211,252', 110, { hitstop: 0.05, kick: 6, decalColors: ['rgba(14,165,233,0.35)'] }),
  ghost: P('magic', 'glow', 'energy', '199,210,254', 120, { kick: 2, ghost: 6, decalColors: ['#1e1b4b', '#c7d2fe'] }),
  ufo: P('energy', 'glow', 'energy', '134,239,172', 130, { kick: 3, ghost: 3, decalColors: ['#052e16', '#4ade80'] }),
  rainbow: P('unicorn', 'paint', 'energy', '255,200,230', 150, { hitstop: 0.03, kick: 3, ghost: 5, tint: 0.1,
    decalColors: ['rgba(248,113,113,0.5)', 'rgba(250,204,21,0.5)', 'rgba(74,222,128,0.5)', 'rgba(96,165,250,0.5)', 'rgba(167,139,250,0.5)'] }),
  meteor: P('explosive', 'scorch', 'fire', '255,140,50', 300, { hitstop: 0.12, kick: 14, tint: 0.3, streak: 1.6 }),
  diamond: P('gem', 'slit', 'quiet', '165,243,252', 140, { hitstop: 0.03, kick: 3, ghost: 3, tint: 0.08 }),
  moonbeam: P('magic', 'glow', 'energy', '205,186,255', 210, { hitstop: 0.03, kick: 3, tint: 0.12, decalColors: ['#1e1b4b', '#c4b5fd'] }),
  storm: P('electric', 'scorch', 'energy', '147,197,253', 220, { hitstop: 0.06, kick: 7, tint: 0.2, speedLines: true }),

  // Wave 4
  pencil: P('pencil', 'slit', 'quiet', '255,240,180', 50, { kick: 1.5, ghost: 2 }),
  sandal: P('sandal', 'dent', 'soft', '147,197,253', 70, { hitstop: 0.05, kick: 5 }),
  paintball: P('paintball', 'none', 'soft', '255,255,255', 60, { hitstop: 0.01, kick: 1.5 }),
  wand: P('wand', 'glow', 'energy', '216,180,254', 130, { kick: 2, ghost: 4, decalColors: ['#3b0764', '#e879f9'] }),
  ruby: P('gem', 'hole', 'fire', '255,100,130', 140, { hitstop: 0.03, kick: 5, ghost: 2 }),
  emerald: P('gem', 'glow', 'energy', '52,211,153', 150, { hitstop: 0.03, kick: 3, tint: 0.12, decalColors: ['#022c22', '#34d399'] }),
  sapphire: P('gem', 'frost', 'fire', '96,165,250', 170, { hitstop: 0.04, kick: 6, tint: 0.12 }),
  crystal: P('gem', 'glow', 'energy', '240,171,252', 180, { hitstop: 0.07, kick: 8, ghost: 3, tint: 0.18, decalColors: ['#4a044e', '#f0abfc'] }),
  beerifle: P('blade', 'slit', 'fire', '250,204,21', 140, { hitstop: 0.06, kick: 8, speedLines: true, streak: 1.5 }),
  buster: P('buster', 'glow', 'energy', '125,211,252', 130, { hitstop: 0.02, kick: 2, decalColors: ['#082f49', '#38bdf8'] }),
  holy: P('holy', 'glow', 'energy', '255,240,180', 200, { hitstop: 0.05, kick: 4, tint: 0.2, decalColors: ['#fef9c3', '#fde047'] }),
  unicorn: P('unicorn', 'paint', 'energy', '250,190,240', 180, { hitstop: 0.04, kick: 3, ghost: 5, tint: 0.15,
    decalColors: ['rgba(248,113,113,0.5)', 'rgba(250,204,21,0.5)', 'rgba(74,222,128,0.5)', 'rgba(96,165,250,0.5)', 'rgba(192,132,252,0.5)'] }),
  obliterator: P('obliterator', 'scorch', 'energy', '74,222,128', 340, { hitstop: 0.16, kick: 18, ghost: 5, tint: 0.45, streak: 1.6 }),
  coingun: P('gold', 'dent', 'soft', '250,204,21', 140, { hitstop: 0.03, kick: 3, ghost: 2, tint: 0.1 }),
  blaster: P('energy', 'scorch', 'energy', '239,68,68', 220, { hitstop: 0.05, kick: 5, speedLines: true, tint: 0.18, decalColors: ['#450a0a', '#ef4444'] }),

  // ---------------------------------------------------------------- SCI-FI
  photon_saber: P('energy', 'glow', 'energy', '34,211,238', 220, { hitstop: 0.05, kick: 5, ghost: 3, tint: 0.18, decalColors: ['#083344', '#22d3ee'] }),
  gauntlet_cannon: P('energy', 'scorch', 'energy', '251,146,60', 340, { hitstop: 0.095, kick: 13, ghost: 5, speedLines: true, streak: 1.5, tint: 0.34, decalColors: ['#450a0a', '#ef4444', '#facc15'] }),
  ironman_hand: P('energy', 'scorch', 'energy', '251,146,60', 340, { hitstop: 0.095, kick: 13, ghost: 5, speedLines: true, streak: 1.5, tint: 0.34, decalColors: ['#450a0a', '#ef4444', '#facc15'] }),
  pulse_rifle: P('electric', 'glow', 'energy', '56,189,248', 160, { hitstop: 0.02, kick: 3, ghost: 2, tint: 0.12, decalColors: ['#082f49', '#38bdf8'] }),
  cryo_blaster: P('ice', 'frost', 'energy', '103,232,249', 190, { hitstop: 0.04, kick: 3, ghost: 3, tint: 0.15 }),
  hyperdrive: P('energy', 'glow', 'energy', '96,165,250', 220, { hitstop: 0.04, kick: 4, ghost: 4, speedLines: true, tint: 0.18, decalColors: ['#1e3a8a', '#60a5fa'] }),
  quantum_destabilizer: P('void', 'glow', 'energy', '168,85,247', 200, { hitstop: 0.05, kick: 4, ghost: 5, tint: 0.2, decalColors: ['#0f0a2e', '#a855f7'] }),

  // ---------------------------------------------------------------- ELEMENTAL ARSENAL (slide 7)
  xeno: P('energy', 'splash', 'energy', '182,255,26', 180, { hitstop: 0.03, kick: 4, ghost: 3, tint: 0.15, decalColors: ['#3f8a00', '#b6ff1a'] }),
  dora: P('sonic', 'dent', 'energy', '255,255,255', 200, { hitstop: 0.04, kick: 5, ghost: 2, tint: 0.1, speedLines: true }),
  pred: P('energy', 'scorch', 'energy', '111,211,255', 220, { hitstop: 0.05, kick: 6, ghost: 4, tint: 0.2, speedLines: true, decalColors: ['#1a5cff', '#6fd3ff'] }),
  // Slide 9 (games/game-6): the classic fallback profiles of the ported guns.
  longbow: P('blade', 'slit', 'quiet', '255,240,200', 70, { hitstop: 0.04, kick: 4, streak: 1.3, speedLines: true }),
  mp5: P('bullet', 'hole', 'fire', '125,211,252', 70, { hitstop: 0.01, kick: 2 }),
  tesla_rifle: P('electric', 'glow', 'energy', '56,189,248', 180, { hitstop: 0.04, kick: 5, ghost: 3, decalColors: ['#082f49', '#38bdf8'] }),
  ion_smg: P('energy', 'glow', 'energy', '192,132,252', 130, { hitstop: 0.02, kick: 3, ghost: 2, decalColors: ['#2e1065', '#c084fc'] }),
  phaser: P('energy', 'glow', 'energy', '251,146,60', 150, { hitstop: 0.04, kick: 4, ghost: 3, decalColors: ['#431407', '#fb923c'] }),
  yautja: P('energy', 'glow', 'energy', '163,230,53', 170, { hitstop: 0.05, kick: 5, ghost: 3, decalColors: ['#1a2e05', '#a3e635'] }),
  identity_disc: P('energy', 'glow', 'energy', '34,211,238', 150, { hitstop: 0.04, kick: 5, ghost: 4, tint: 0.15, decalColors: ['#042f2e', '#22d3ee'] }),
  proton_pack: P('electric', 'glow', 'energy', '253,224,71', 190, { hitstop: 0.05, kick: 6, ghost: 4, decalColors: ['#422006', '#fde047'] }),
  heat_ray: P('fire', 'burn', 'fire', '255,77,77', 200, { hitstop: 0.06, kick: 7, tint: 0.2 }),

  // Slide 11 (games/game-8)
  mega_buster: P('buster', 'glow', 'energy', '140,200,255', 120, { kick: 3.4, ghost: 3, tint: 0.1 }),
  harmonic_disruptor: P('sonic', 'glow', 'energy', '190,160,255', 130, { kick: 3.6, hitstop: 0.03 }),
  absolute_zero: P('ice', 'frost', 'energy', '150,220,255', 120, { kick: 3, tint: 0.12 }),
  helios_flare: P('fire', 'burn', 'energy', '255,200,90', 150, { kick: 4.2, hitstop: 0.035, ghost: 4, tint: 0.14 }),
  chrono_rifle: P('energy', 'glow', 'energy', '120,230,240', 110, { kick: 3, tint: 0.1 }),
  orbital_beacon: P('heavy', 'scorch', 'energy', '255,150,210', 140, { kick: 4.6, hitstop: 0.05 }),
  helix_pulsar: P('energy', 'glow', 'energy', '200,140,255', 100, { kick: 2.4, streak: 1.2 }),
  singularity: P('void', 'glow', 'energy', '190,120,255', 150, { kick: 4.4, hitstop: 0.05, ghost: 4, tint: 0.16 }),
  prism_lance: P('energy', 'glow', 'energy', '120,235,245', 120, { kick: 3, tint: 0.1 }),
  nano_swarm: P('nature', 'hole', 'soft', '130,230,150', 100, { kick: 2.6, streak: 1.1 }),

};

// ---------------------------------------------------------------- helpers
function mk(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, kind: PKind, extra: Partial<Particle> = {}): Particle {
  return { x, y, vx, vy, life, max: life, size, color, kind, rot: rand(0, TAU), vr: rand(-12, 12), g: 0, ...extra };
}

function cone(nx: number, ny: number, spread: number, vmin: number, vmax: number): [number, number] {
  const a = Math.atan2(ny, nx) + rand(-spread, spread);
  const v = rand(vmin, vmax);
  return [Math.cos(a) * v, Math.sin(a) * v];
}

function rgbOf(hex: string) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

// ---------------------------------------------------------------- muzzle
export function spawnMuzzle(s: FxSink, prof: FxProfile, w: Weapon, x: number, y: number) {
  if (supportsGunVariants(w.id) && getGunEffect(w.id) === 'original') {
    spawnClassicMuzzle(s, prof, w, x, y);
    return;
  }
  if (prof.muzzle === 'none') return;
  s.light(x, y, prof.lightR * (prof.muzzle === 'quiet' ? 0.3 : 0.6), prof.light, prof.muzzle === 'fire' ? 0.08 : 0.12);
  switch (prof.muzzle) {
    case 'fire': {
      const n = 5 + Math.round(prof.kick * 0.8);
      for (let i = 0; i < n; i++) {
        const [vx, vy] = cone(0, -1, 0.55, 140, 420);
        s.push(mk(x, y - 4, vx, vy, rand(0.12, 0.28), rand(1.2, 2.0), pick(['#fff7d6', '#ffd23f', '#ff9f1c']), 'spark', { g: 500, drag: 2 }));
      }
      break;
    }
    case 'energy': {
      if (w.id === 'gauntlet_cannon') {
        s.push(mk(x, y - 6, 0, 0, 0.24, 44, '250,204,21', 'shock'));
        for (let i = 0; i < 10; i++) {
          const [vx, vy] = cone(0, -1, 0.65, 160, 480);
          s.push(mk(x, y - 6, vx, vy, rand(0.16, 0.32), rand(1.6, 2.8), pick(['#ffffff', '#fef08a', '#facc15', '#f97316', '#ef4444']), 'spark', { g: 420, drag: 1.8 }));
        }
      }
      for (let i = 0; i < (w.id === 'moonbeam' || w.id === 'gauntlet_cannon' ? 8 : 4); i++) {
        const [vx, vy] = cone(0, -1, 0.8, 60, 200);
        s.push(mk(x, y - 4, vx, vy, rand(0.2, 0.4), rand(3, 5), `rgb(${prof.light})`, 'star', { drag: 3 }));
      }
      break;
    }
    case 'soft': {
      if (w.id === 'honey') {
        for (let i = 0; i < 6; i++) {
          const [vx, vy] = cone(0, -1, 0.75, 45, 160);
          s.push(mk(x, y - 3, vx, vy, rand(0.27, 0.52), rand(1.7, 3.7),
            '#fbbf24', 'honeyDrop', { g: 760, drag: 1.2 }));
        }
      } else if (w.id === 'banana') {
        for (let i = 0; i < 7; i++) {
          const [vx, vy] = cone(0, -1, 0.92, 60, 205);
          s.push(mk(x, y - 4, vx, vy, rand(0.28, 0.55), rand(2, 4.2),
            pick(['#fff8dd', '#ffe4a0', '#f8d478']), 'bananaDrop', { g: 850, drag: 1.3 }));
        }
      } else if (w.id === 'soaker') {
        for (let i = 0; i < 7; i++) {
          const [vx, vy] = cone(0, -1, 0.8, 100, 260);
          s.push(mk(x, y - 4, vx, vy, rand(0.22, 0.45), rand(2, 4), '#7dd3fc', 'waterDrop', { g: 750, drag: 1 }));
        }
      } else if (w.id === 'snowball') {
        for (let i = 0; i < 6; i++) {
          const [vx, vy] = cone(0, -1, 0.9, 50, 160);
          s.push(mk(x, y - 4, vx, vy, rand(0.3, 0.52), rand(2.2, 4.5), '#ffffff', 'snowflake', { g: 65, drag: 1.8 }));
        }
        for (let i = 0; i < 9; i++) {
          const [vx, vy] = cone(0, -1, 1.25, 60, 180);
          s.push(mk(x, y - 5, vx, vy, rand(0.24, 0.42), rand(1.5, 3.8), '#ffffff', 'snowDust', { g: 150, drag: 1.3 }));
        }
      } else for (let i = 0; i < 4; i++) {
        const [vx, vy] = cone(0, -1, 0.7, 30, 120);
        s.push(mk(x, y - 4, vx, vy, rand(0.25, 0.45), rand(4, 8), 'rgba(255,255,255,', 'smoke', { g: -20, drag: 2 }));
      }
      break;
    }
    case 'quiet': {
      for (let i = 0; i < 2; i++) {
        s.push(mk(x + rand(-3, 3), y - 4, 0, rand(-800, -500), 0.08, 1.0, 'rgba(255,255,255,0.7)', 'streak'));
      }
      break;
    }
  }
}

export function spawnSpeedLines(s: FxSink, x: number, yTop: number, yBot: number, rgb: string) {
  for (let i = 0; i < 6; i++) {
    s.push(mk(x + rand(-24, 24), rand(yTop, yBot), 0, rand(-2200, -1400), rand(0.06, 0.12), rand(0.8, 1.6), `rgba(${rgb},0.85)`, 'streak'));
  }
}

// ---------------------------------------------------------------- impact
export function spawnImpact(s: FxSink, prof: FxProfile, w: Weapon, x: number, y: number, nx: number, ny: number, chips: string[]) {
  if (w.id === 'ghost') {
    // A soft, rising white aura replaces the old star/splash-shaped burst.
    s.light(x, y, 110, '215,255,250', 0.22);
    for (let i = 0; i < 7; i++) {
      s.push(mk(x + rand(-8, 8), y + rand(-3, 3), rand(-25, 25), rand(-105, -35),
        rand(0.55, 0.95), rand(13, 25), '240,255,255', 'spirit', { drag: 1, rot: rand(0, TAU) }));
    }
    return;
  }
  if (supportsGunVariants(w.id) && getGunEffect(w.id) === 'original') {
    spawnClassicImpact(s, prof, w, x, y, nx, ny, chips);
    return;
  }
  const L = prof.light;
  const lightCss = `rgb(${L})`;

  s.light(x, y, Math.min(180, prof.lightR * 0.75), L, 0.16 + prof.hitstop);

  const sparks = (n: number, cols: string[], vmin = 250, vmax = 650, spread = 1.1, g = 900) => {
    for (let i = 0; i < n; i++) {
      const [vx, vy] = cone(nx, ny, spread, vmin, vmax);
      s.push(mk(x, y, vx, vy, rand(0.12, 0.32), rand(1.1, 2.2), pick(cols), 'spark', { g, drag: 1.8 }));
    }
  };
  const chipBurst = (n: number, cols: string[], kind: PKind = 'chip', vmax = 320, g = 1300, size = [2.0, 4.5]) => {
    for (let i = 0; i < n; i++) {
      const [vx, vy] = cone(nx, ny, 1.2, 60, vmax);
      s.push(mk(x, y, vx, vy, rand(0.35, 0.75), rand(size[0], size[1]), pick(cols), kind, { g }));
    }
  };
  const dust = (n: number, col = 'rgba(190,180,165,', size = [5, 11]) => {
    for (let i = 0; i < n; i++) {
      const [vx, vy] = cone(nx, ny, 1.0, 20, 90);
      s.push(mk(x + rand(-3, 3), y + rand(-3, 3), vx, vy, rand(0.4, 0.8), rand(size[0], size[1]), col, 'smoke', { g: -15, drag: 2.2 }));
    }
  };
  const stars = (n: number, cols: string[], vmax = 220, size = [3.5, 6.5]) => {
    for (let i = 0; i < n; i++) {
      const [vx, vy] = cone(nx, ny, Math.PI * 0.85, 30, vmax);
      s.push(mk(x, y, vx, vy, rand(0.3, 0.65), rand(size[0], size[1]), pick(cols), 'star', { drag: 3.2 }));
    }
  };
  const glows = (n: number, rgbs: string[], vmax = 220, g = 0, size = [2.5, 5.5]) => {
    for (let i = 0; i < n; i++) {
      const [vx, vy] = cone(nx, ny, Math.PI * 0.8, 30, vmax);
      s.push(mk(x, y, vx, vy, rand(0.25, 0.5), rand(size[0], size[1]), pick(rgbs), 'glow', { g, drag: 2.2 }));
    }
  };

  switch (prof.impact) {
    case 'sandal': {
      s.push(mk(x, y, 0, 0, 0.28, 28, '#38bdf8', 'slap', { extra: Math.atan2(ny, nx) }));
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI - Math.PI * 0.5;
        const [vx, vy] = cone(Math.cos(a), Math.sin(a), 0.3, 180, 360);
        s.push(mk(x, y, vx, vy, 0.12, 1.5, 'rgba(255,255,255,0.85)', 'streak'));
      }
      stars(5, ['#fde047', '#ffffff', '#93c5fd'], 140, [3, 5]);
      dust(4, 'rgba(219,234,254,', [5, 9]);
      break;
    }
    case 'slingshot': {
      chipBurst(9, ['#a8a29e', '#78716c', '#d6d3d1', '#57534e'], 'shard', 260, 1100, [2.5, 5]);
      sparks(8, ['#ffffff', '#f5d0a0', '#ffd23f'], 180, 480, 0.9, 1100);
      dust(6, 'rgba(180,150,120,', [6, 12]);
      chipBurst(5, chips, 'chip', 200);
      break;
    }
    case 'pencil': {
      for (let i = 0; i < 7; i++) {
        const [vx, vy] = cone(nx, ny, 1.2, 50, 200);
        s.push(mk(x, y, vx, vy, rand(0.5, 0.9), rand(4, 7), pick(['#fde047', '#d4a373', '#c08a5a']), 'pencilShaving', { g: 300, drag: 2.5 }));
      }
      chipBurst(8, ['#f472b6', '#fbcfe8', '#374151', '#1f2937'], 'chip', 180, 800, [1.5, 3]);
      dust(4, 'rgba(60,60,60,', [4, 8]);
      break;
    }
    case 'paintball': {
      for (let i = 0; i < 14; i++) {
        const [vx, vy] = cone(nx, ny, 1.3, 80, 340);
        s.push(mk(x, y, vx, vy, rand(0.35, 0.7), rand(2.5, 5.5), lightCss, 'drop', { g: 900, drag: 1.5 }));
      }
      s.push(mk(x, y, 0, 0, 0.35, 22, lightCss, 'paintSplat'));
      break;
    }
    case 'wand': {
      stars(14, ['#ffffff', '#fde047', '#f5d0fe', '#c084fc', '#e879f9'], 220, [3, 6]);
      glows(8, ['216,180,254', '253,224,71'], 140, -40, [2.5, 4.5]);
      for (let i = 0; i < 4; i++) {
        const [vx, vy] = cone(nx, ny, 1.0, 100, 240);
        s.push(mk(x, y, vx, vy, 0.16, 1.2, 'rgba(255,255,255,0.9)', 'streak'));
      }
      break;
    }
    case 'holy': {
      for (let i = 0; i < 6; i++) {
        s.push(mk(x + rand(-16, 16), y + rand(-40, 20), 0, rand(-600, -300), rand(0.18, 0.35), rand(1.5, 3.0), 'rgba(255,248,220,0.85)', 'streak'));
      }
      for (let i = 0; i < 5; i++) {
        const [vx, vy] = cone(nx, ny, 1.4, 20, 100);
        s.push(mk(x, y, vx, vy - 30, rand(0.7, 1.3), rand(4, 7), '#ffffff', 'feather', { g: 50, drag: 2.8 }));
      }
      stars(8, ['#ffffff', '#fde68a'], 160, [3, 5]);
      break;
    }
    case 'gem': {
      for (let i = 0; i < 11; i++) {
        const [vx, vy] = cone(nx, ny, 1.3, 90, 360);
        s.push(mk(x, y, vx, vy, rand(0.4, 0.8), rand(3, 6), lightCss, 'prism', { g: 1100, drag: 1.2 }));
      }
      stars(7, ['#ffffff', lightCss], 200, [3, 5]);
      sparks(6, ['#ffffff', lightCss], 200, 500, 0.9);
      break;
    }
    case 'buster': {
      s.push(mk(x, y, 0, 0, 0.22, 26, '125,211,252', 'shock'));
      glows(10, ['125,211,252', '254,240,138'], 180, 0, [2.5, 4.5]);
      sparks(8, ['#ffffff', '#7dd3fc', '#fef08a'], 220, 550, 1.0);
      break;
    }
    case 'obliterator': {
      for (let i = 0; i < 6; i++) {
        const a = Math.atan2(ny, nx) + rand(-1.2, 1.2);
        const d = rand(30, 70);
        s.push(mk(x, y, 0, 0, rand(0.15, 0.28), 2.2, '#86efac', 'bolt', { tx: x + Math.cos(a) * d, ty: y + Math.sin(a) * d }));
      }
      glows(16, ['74,222,128', '34,197,94', '220,252,231'], 240, 0, [4, 8]);
      chipBurst(8, ['#15803d', '#22c55e', '#bbf7d0'], 'chip', 280);
      s.push(mk(x, y, 0, 0, 0.35, 46, '74,222,128', 'shock'));
      break;
    }
    case 'unicorn': {
      const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
      stars(12, RB, 240, [3.5, 6]);
      glows(8, ['250,190,240', '254,240,138'], 160, -20, [3, 5]);
      for (let i = 0; i < 6; i++) {
        const [vx, vy] = cone(nx, ny, 1.2, 80, 260);
        s.push(mk(x, y, vx, vy, rand(0.4, 0.7), rand(2.5, 4.5), pick(RB), 'drop', { g: 700 }));
      }
      break;
    }
    case 'bullet':
      sparks(10, ['#ffffff', '#fff3b0', '#ffd23f', '#ff9f1c']);
      chipBurst(7, chips);
      dust(3);
      break;
    case 'heavy':
      sparks(16, ['#ffffff', '#fff3b0', '#ffd23f', '#ff9f1c'], 300, 800, 1.2);
      chipBurst(12, chips, 'chip', 380);
      dust(6, 'rgba(180,170,150,', [7, 14]);
      if (w.energy) glows(10, [w.trail, '255,255,255'], 220);
      break;
    case 'energy':
      if (w.id === 'gauntlet_cannon') {
        // Heavy mecha-punch impact: double concentric golden & crimson shockwaves, crackling energy bolts, heavy sparks & target chips
        s.push(mk(x, y, 0, 0, 0.36, 74, '239,68,68', 'shock'));
        s.push(mk(x, y, 0, 0, 0.26, 46, '250,204,21', 'shock'));
        for (let i = 0; i < 7; i++) {
          const ang = Math.atan2(ny, nx) + rand(-1.35, 1.35);
          const dist = rand(24, 62);
          s.push(mk(x, y, 0, 0, rand(0.14, 0.28), 2.4,
            pick(['#fef08a', '#facc15', '#f97316', '#ef4444']), 'bolt',
            { tx: x + Math.cos(ang) * dist, ty: y + Math.sin(ang) * dist }));
        }
        sparks(18, ['#ffffff', '#fef08a', '#facc15', '#f97316', '#ef4444'], 260, 720, 1.25, 650);
        glows(14, ['250,204,21', '249,115,22', '239,68,68', '255,255,255'], 260, 0, [3.5, 7]);
        stars(9, ['#ffffff', '#fef08a', '#f97316', '#ef4444'], 240, [4, 7.5]);
        chipBurst(10, chips, 'chip', 340);
        dust(6, 'rgba(251,146,60,', [7, 14]);
        break;
      }
      glows(14, [w.trail, '255,255,255'], 220);
      stars(6, ['#ffffff', lightCss]);
      sparks(6, [lightCss, '#ffffff'], 200, 500, 1.1, 200);
      s.push(mk(x, y, 0, 0, 0.25, 30, L, 'shock'));
      chipBurst(4, chips);
      if (w.id === 'plasma' || w.id === 'laser') {
        const plasma = w.id === 'plasma';
        s.push(mk(x, y, 0, 0, 0.31, plasma ? 50 : 45,
          plasma ? '57,255,156' : '255,75,130', 'shock'));
        for (let i = 0; i < 5; i++) {
          const ang = rand(0, TAU), dist = rand(13, 34);
          s.push(mk(x, y, 0, 0, rand(0.11, 0.24), 1.6,
            plasma ? '#c1ffe5' : '#ffd2df', 'bolt',
            { tx: x + Math.cos(ang) * dist, ty: y + Math.sin(ang) * dist }));
        }
      }
      break;
    case 'electric':
      for (let i = 0; i < 5; i++) {
        const a = Math.atan2(ny, nx) + rand(-1.4, 1.4);
        const d = rand(24, 60);
        s.push(mk(x, y, 0, 0, rand(0.1, 0.2), 1.8, lightCss, 'bolt', { tx: x + Math.cos(a) * d, ty: y + Math.sin(a) * d }));
      }
      sparks(12, ['#ffffff', lightCss], 240, 650, 1.3, 300);
      glows(7, [L, '255,255,255'], 180);
      chipBurst(4, chips);
      break;
    case 'ice':
      chipBurst(12, ['#ffffff', '#e0f7ff', '#9be7ff', '#7fd3ff'], 'shard', 320, 800, [3, 7]);
      dust(4, 'rgba(210,240,255,', [6, 12]);
      stars(6, ['#ffffff', '#bff1ff']);
      break;
    case 'honey': {
      // Heavy syrup beads, an elastic splash crown and a warm translucent
      // pool. No blue water drops or brittle glass-chip slow particles.
      s.push(mk(x, y, 0, 0, 0.4, 27, '#e9a51d', 'honeySplash',
        { extra: Math.atan2(ny, nx) }));
      for (let i = 0; i < 17; i++) {
        const [vx, vy] = cone(nx, ny, 1.45, 55, 270);
        s.push(mk(x, y, vx, vy, rand(0.38, 0.8), rand(2, 5.5),
          pick(['#fff1a8', '#ffcf4c', '#d99116']), 'honeyDrop', { g: 900, drag: 1.1 }));
      }
      break;
    }
    case 'water':
      if (w.id === 'banana') {
        // Banana pulp bursts into a generous creamy juice crown, NEVER into
        // the Soaker's blue water or brittle ice/wood chips. The flesh itself
        // remains attached to the target after this short-lived splash.
        s.push(mk(x, y, 0, 0, 0.49, 39, '#fff0b5', 'bananaSplash',
          { extra: Math.atan2(ny, nx) }));
        s.push(mk(x, y, 0, 0, 0.26, 53, '255,226,142', 'shock'));
        for (let i = 0; i < 26; i++) {
          const [vx, vy] = cone(nx, ny, 1.56, 65, 390);
          s.push(mk(x, y, vx, vy, rand(0.33, 0.75), rand(2.2, 6.6),
            pick(['#fffdf0', '#fff0bb', '#f9d879']), 'bananaDrop', { g: 990, drag: 0.85 }));
        }
      } else if (w.id === 'soaker') {
        // A translucent splash crown, flying liquid beads and fine spray —
        // not the opaque blue rectangular chips of the generic slow perk.
        s.push(mk(x, y, 0, 0, 0.42, 36, '#7dd3fc', 'waterSplash', { extra: Math.atan2(ny, nx) }));
        for (let i = 0; i < 22; i++) {
          const [vx, vy] = cone(nx, ny, 1.48, 70, 420);
          s.push(mk(x, y, vx, vy, rand(0.32, 0.67), rand(1.9, 6.4), pick(['#e1faff', '#7dd3fc', '#38bdf8']),
            'waterDrop', { g: 1050, drag: 0.9 }));
        }
      } else for (let i = 0; i < 14; i++) {
        const [vx, vy] = cone(nx, ny, 1.1, 90, 360);
        s.push(mk(x, y, vx, vy, rand(0.35, 0.65), rand(2, 4), pick(['#bfdbfe', '#60a5fa', '#ffffff', '#3b82f6']), 'drop', { g: 1100 }));
      }
      if (w.id !== 'soaker' && w.id !== 'banana') dust(2, 'rgba(190,220,255,', [6, 10]);
      break;
    case 'snow': {
      // Packed snow separates into soft white clumps and fine powder, NOT
      // blue crystalline ice. A brief cloud cushions the half-buried ball.
      dust(6, 'rgba(246,252,255,', [7, 13]);
      s.push(mk(x, y, 0, 0, 0.26, 27, '239,250,255', 'shock'));
      for (let i = 0; i < 24; i++) {
        const [vx, vy] = cone(nx, ny, 1.75, 80, 340);
        s.push(mk(x, y, vx, vy, rand(0.35, 0.7), rand(1.4, 3.5),
          pick(['#ffffff', '#fafcff', '#eaf6fb']), 'snowDust', { g: 180, drag: 1.2 }));
      }
      for (let i = 0; i < 12; i++) {
        const [vx, vy] = cone(nx, ny, 1.6, 120, 340);
        s.push(mk(x, y, vx, vy, rand(0.42, 0.76), rand(3.8, 7.2),
          pick(['#ffffff', '#f6fcff', '#e5f3fa']), 'snowChunk', { g: 600, drag: 0.55 }));
      }
      for (let i = 0; i < 5; i++) {
        const [vx, vy] = cone(nx, ny, 1.65, 60, 200);
        s.push(mk(x, y, vx, vy, rand(0.35, 0.62), rand(2.4, 4.5), '#ffffff', 'snowflake', { g: 90, drag: 2 }));
      }
      break;
    }
    case 'fire':
      for (let i = 0; i < 14; i++) {
        const [vx, vy] = cone(nx, ny, 1.2, 50, 240);
        s.push(mk(x, y, vx, vy - 40, rand(0.28, 0.6), rand(1.1, 1.8), pick(['#fff3b0', '#ffd23f', '#ff9f1c', '#ff4500']), 'spark', { g: -200, drag: 1.8 }));
      }
      glows(10, ['255,220,120', '255,140,40', '255,60,20'], 180, -120, [3, 7]);
      dust(4, 'rgba(60,50,45,', [6, 12]);
      break;
    case 'explosive':
      if (w.id === 'bamboo') {
        // Lebaran-style white powder plume and hot wick sparks. The gameplay
        // explosion still comes from explodeAt; no extra damage or hitbox.
        sparks(18, ['#fffdf1', '#fef3c7', '#f8cb59', '#f16a43'], 220, 680, 1.5, 450);
        s.push(mk(x, y, 0, 0, 0.35, 65, '255,249,228', 'shock'));
        dust(7, 'rgba(255,250,237,', [9, 17]);
        break;
      }
      chipBurst(12, ['#3f3f46', '#57534e', ...chips], 'shard', 480, 1200, [4, 8]);
      sparks(18, ['#ffffff', '#fff3b0', '#ffd23f', '#ff6a00'], 300, 850, 1.5, 600);
      s.push(mk(x, y, 0, 0, 0.35, 60, '255,200,120', 'shock'));
      dust(8, 'rgba(100,90,80,', [9, 18]);
      if (w.id === 'meteor') glows(8, ['255,191,74', '255,113,31'], 200, -100, [3, 7]);
      break;
    case 'pixel':
      for (let i = 0; i < 18; i++) {
        const [vx, vy] = cone(nx, ny, Math.PI, 40, 300);
        s.push(mk(x, y, vx, vy, rand(0.25, 0.55), rand(2.5, 4.5), pick(['#22ff88', '#ff0055', '#00ffee', '#ffffff']), 'chip', { g: 200, rot: 0, vr: 0 }));
      }
      break;
    case 'void':
      for (let i = 0; i < 16; i++) {
        const a = rand(0, TAU);
        const d = rand(35, 80);
        s.push(mk(x + Math.cos(a) * d, y + Math.sin(a) * d, -Math.cos(a) * d * 2.2, -Math.sin(a) * d * 2.2, 0.32, rand(2, 4), L, 'glow'));
      }
      s.push(mk(x, y, 0, 0, 0.32, w.id === 'blackhole' ? 37 : 40,
        w.id === 'blackhole' ? '168,85,247' : '20,0,40', 'shock'));
      if (w.id === 'blackhole') {
        // A small inward spiral, not a giant opaque black mark on the stone.
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * TAU;
          s.push(mk(x + Math.cos(ang) * 23, y + Math.sin(ang) * 23,
            -Math.cos(ang) * 50, -Math.sin(ang) * 50, 0.34, 1.8,
            '226,199,255', 'glow'));
        }
      }
      break;
    case 'magic':
      if (w.id === 'moonbeam') {
        stars(18, ['#ffffff', '#ede9fe', '#c4b5fd', '#fff1be'], 270, [3.5, 7.5]);
        glows(10, ['205,186,255', '255,239,190'], 170);
        s.push(mk(x, y, 0, 0, 0.45, 62, L, 'shock'));
        s.push(mk(x, y, 0, 0, 0.32, 34, '255,239,190', 'shock'));
      } else {
        stars(10, ['#ffffff', lightCss, '#fde047'], 220, [3, 6]);
        glows(7, [L, '255,255,255'], 150);
        s.push(mk(x, y, 0, 0, 0.3, 40, L, 'shock'));
      }
      break;
    case 'blade': {
      const px = -ny;
      const py = nx;
      s.push(mk(x - px * 18, y - py * 18, px * 700, py * 700, 0.08, 1.8, 'rgba(255,255,255,0.9)', 'streak'));
      sparks(6, ['#ffffff', '#e5e7eb', '#fde68a'], 200, 500, 0.8);
      chipBurst(4, chips, 'chip', 180);
      break;
    }
    case 'nature':
      for (let i = 0; i < 10; i++) {
        const [vx, vy] = cone(nx, ny, 1.4, 40, 180);
        s.push(mk(x, y, vx, vy, rand(0.6, 1.1), rand(2.5, 4.5), pick(['#86efac', '#4ade80', '#f9a8d4', '#fb7185', '#fde047']), 'petal', { g: 100, drag: 2.2 }));
      }
      stars(4, ['#ffffff', '#bef264'], 140);
      break;
    case 'confetti':
      stars(8, ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80'], 240);
      break;
    case 'gold':
      sparks(14, ['#ffffff', '#fff1a8', '#ffd23f', '#f59e0b'], 240, 700, 1.2, 600);
      stars(8, ['#ffffff', '#fff1a8', '#ffd23f'], 200, [3.5, 7]);
      // New Golden Gun effect adds a luminous glint; the opted-in classic
      // effect still calls the original, simpler impact in classicShotFx.
      if (w.id === 'golden') {
        stars(9, ['#fffdf1', '#ffe69c'], 185, [2.6, 5.3]);
        glows(6, ['255,228,138', '255,246,203'], 150, -70, [2.8, 5]);
      }
      chipBurst(5, chips);
      break;
    case 'stone':
      chipBurst(9, ['#a8a29e', '#78716c', '#d6d3d1'], 'shard', 260, 1100, [2.5, 5]);
      dust(5, 'rgba(160,150,140,', [6, 12]);
      break;
    case 'glass':
      chipBurst(12, ['#ffffff', '#e2e8f0', '#bae6fd', '#f1f5f9'], 'shard', 340, 900, [2.5, 6]);
      stars(6, ['#ffffff', '#e0f2fe'], 170);
      break;
    case 'sonic':
      for (let i = 0; i < 3; i++) s.push(mk(x, y, 0, 0, 0.22 + i * 0.08, 30 + i * 22, L, 'shock'));
      glows(6, [L], 160);
      break;
  }
}

// ---------------------------------------------------------------- decals (on rotating target face)
// RETAKAN PETIR KARTUN PROFESIONAL (AUTHENTIC ARCADE LIGHTNING FRACTURES)
// Dibuat dari simpul garis petir bersudut tajam (miter join), bercabang jernih,
// dengan bayangan gelap tipis di bawah dan pendaran specular highlight putih tajam di atas.
// Tidak ada gumpalan hitam/kutu sama sekali!
export function drawLightningBolt(
  c: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  displace = 8,
  minSeg = 3,
  forkChance = 0.45,
  depth = 0
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);

  if (dist < minSeg || depth > 2) {
    c.lineTo(x2, y2);
    return;
  }

  // Midpoint with perpendicular displacement
  const midX = (x1 + x2) / 2 + (-dy / dist) * (Math.random() - 0.5) * displace;
  const midY = (y1 + y2) / 2 + (dx / dist) * (Math.random() - 0.5) * displace;

  drawLightningBolt(c, x1, y1, midX, midY, displace * 0.55, minSeg, forkChance, depth + 1);
  drawLightningBolt(c, midX, midY, x2, y2, displace * 0.55, minSeg, forkChance, depth + 1);

  // Sub-branch forked lightning
  if (depth < 2 && Math.random() < forkChance) {
    const forkAngle = Math.atan2(dy, dx) + (Math.random() < 0.5 ? 0.55 : -0.55);
    const forkLen = dist * 0.45;
    const fx2 = midX + Math.cos(forkAngle) * forkLen;
    const fy2 = midY + Math.sin(forkAngle) * forkLen;
    drawLightningBolt(c, midX, midY, fx2, fy2, displace * 0.4, minSeg, 0, depth + 1);
  }
}

export function lightningImpactDecal(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  inwardAngle: number,
  _radius = 3.5,
  isBig = false,
  glowColor?: string
) {
  c.save();
  c.lineJoin = 'miter';
  c.lineCap = 'butt';

  // Jumlah cabang petir utama (3-4 cabang yang menyebar tajam ke arah dalam target)
  const numCracks = isBig ? 4 : 3;
  const baseReach = (isBig ? 24 : 16) + Math.random() * 4;

  interface CrackPath {
    destX: number;
    destY: number;
    midDisplace: number;
  }

  const branches: CrackPath[] = [];

  // Hitung target cabang petir merambat ke arah dalam target (inwardAngle)
  for (let i = 0; i < numCracks; i++) {
    // Sudut menyebar ke dalam (+/- 75 derajat dari arah tancap)
    const spread = (i - (numCracks - 1) / 2) * 0.48 + (Math.random() - 0.5) * 0.25;
    const crackAngle = inwardAngle + spread;
    const reach = baseReach * (0.8 + Math.random() * 0.4);
    branches.push({
      destX: x + Math.cos(crackAngle) * reach,
      destY: y + Math.sin(crackAngle) * reach,
      midDisplace: 7 + Math.random() * 4,
    });
  }

  // 1. LAYER 1: Shadow Crevice (celah retakan gelap di dasar)
  c.strokeStyle = 'rgba(10, 8, 12, 0.75)';
  c.lineWidth = isBig ? 2.0 : 1.4;
  for (const b of branches) {
    c.beginPath();
    c.moveTo(x, y);
    drawLightningBolt(c, x, y, b.destX, b.destY, b.midDisplace, 4, 0.4, 0);
    c.stroke();
  }

  // 2. LAYER 2: Crisp Razor Core (garis retakan petir putih/terang di tengah celah)
  c.strokeStyle = glowColor ? `rgba(${glowColor}, 0.9)` : 'rgba(255, 255, 255, 0.85)';
  c.lineWidth = isBig ? 1.0 : 0.7;
  for (const b of branches) {
    c.beginPath();
    c.moveTo(x, y);
    drawLightningBolt(c, x, y, b.destX, b.destY, b.midDisplace * 0.85, 4, 0.3, 0);
    c.stroke();
  }

  // 3. LAYER 3: Entry Pin Notch (tanda titik tancap kecil 1.5px, BUKAN kutu bulat besar!)
  c.fillStyle = '#0a080c';
  c.beginPath();
  c.arc(x, y, isBig ? 2.2 : 1.5, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(255, 255, 255, 0.9)';
  c.beginPath();
  c.arc(x - 0.4, y - 0.4, isBig ? 1.0 : 0.7, 0, TAU);
  c.fill();

  c.restore();
}

function cleanSlitDecal(c: CanvasRenderingContext2D, x: number, y: number, a: number, len = 10, w = 2.2) {
  c.save();
  c.translate(x, y);
  c.rotate(a + Math.PI / 2);
  // Soft shadow
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.beginPath();
  c.roundRect(-w - 1, -len / 2 - 1, (w + 1) * 2, len + 2, w + 1);
  c.fill();
  // Clean slit
  c.fillStyle = '#0a0705';
  c.beginPath();
  c.roundRect(-w, -len / 2, w * 2, len, w);
  c.fill();
  // Specular edge
  c.fillStyle = 'rgba(255,255,255,0.4)';
  c.fillRect(-w + 0.5, -len / 2 + 1, 0.8, len - 2);
  c.restore();
}

function blob(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string) {
  c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i <= 8; i++) {
    const a = (i / 8) * TAU;
    const rr = r * rand(0.8, 1.15);
    c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  c.closePath();
  c.fill();
}

export function drawDecal(c: CanvasRenderingContext2D, R: number, a: number, prof: FxProfile) {
  const x = Math.cos(a) * (R - 4);
  const y = Math.sin(a) * (R - 4);
  c.save();
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.clip();
  const cols = prof.decalColors ?? [];

  switch (prof.decal) {
    case 'hole':
    case 'bigHole': {
      const big = prof.decal === 'bigHole';
      const r = big ? 5.5 : 3.8;
      // Retakan petir tajam & indah, bukan kutu/bunderan jelek!
      lightningImpactDecal(c, x, y, a + Math.PI, r, big);
      break;
    }
    case 'scorch': {
      // Retakan petir ledakan yang membakar & bercabang
      lightningImpactDecal(c, x, y, a + Math.PI, 6, true);
      break;
    }
    case 'burn': {
      // Warm ember scorched lightning fractures
      lightningImpactDecal(c, x, y, a + Math.PI, 3.2, false, '251,146,60');
      break;
    }
    case 'frost': {
      // Clean geometric frost star (crystal diamond)
      const g = c.createRadialGradient(x, y, 1, x, y, 15);
      g.addColorStop(0, 'rgba(224, 242, 254, 0.85)');
      g.addColorStop(0.6, 'rgba(186, 230, 253, 0.4)');
      g.addColorStop(1, 'rgba(125, 211, 252, 0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, 15, 0, TAU);
      c.fill();
      // Crisp 4-point ice crystal
      c.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(x - 9, y); c.lineTo(x + 9, y);
      c.moveTo(x, y - 9); c.lineTo(x, y + 9);
      c.moveTo(x - 5, y - 5); c.lineTo(x + 5, y + 5);
      c.moveTo(x + 5, y - 5); c.lineTo(x - 5, y + 5);
      c.stroke();
      break;
    }
    case 'splash':
    case 'paint': {
      const list = cols.length ? cols : ['rgba(0,0,0,0.2)'];
      blob(c, x, y, rand(6, 9), pick(list));
      for (let i = 0; i < 3; i++) {
        const aa = a + Math.PI + rand(-1.0, 1.0);
        const d = rand(8, 15);
        blob(c, x + Math.cos(aa) * d, y + Math.sin(aa) * d, rand(1.8, 3.2), pick(list));
      }
      break;
    }
    case 'glow': {
      const [, col] = cols.length >= 2 ? cols : ['#000000', '#ffffff'];
      lightningImpactDecal(c, x, y, a + Math.PI, 3.5, false, rgbOf(col));
      break;
    }
    case 'slit': {
      // Clean precision needle / blade slit
      cleanSlitDecal(c, x, y, a, 9, 1.6);
      break;
    }
    case 'pixel': {
      c.fillStyle = pick(['#22ff88', '#ff0055', '#00ffee', '#ffffff']);
      for (let k = -1; k <= 1; k++) {
        c.fillRect(Math.round(x / 4) * 4 + k * 4, Math.round(y / 4) * 4, 3.5, 3.5);
      }
      break;
    }
    case 'dent': {
      // Clean spherical surface dent
      const g = c.createRadialGradient(x - 1, y - 1, 0.5, x, y, 7);
      g.addColorStop(0, 'rgba(0,0,0,0.45)');
      g.addColorStop(0.65, 'rgba(0,0,0,0.1)');
      g.addColorStop(1, 'rgba(255,255,255,0.2)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, 7, 0, TAU);
      c.fill();
      break;
    }
    case 'snow': {
      for (let i = 0; i < 3; i++) blob(c, x + rand(-5, 5), y + rand(-5, 5), rand(2.5, 4.5), 'rgba(255,255,255,0.85)');
      break;
    }
    case 'none':
      break;
  }
  c.restore();
}

// ---------------------------------------------------------------- render custom particle kinds
const PUFF_LOBES = [[0, 0, 1], [-0.55, 0.15, 0.7], [0.55, 0.1, 0.72], [0.1, -0.5, 0.65], [-0.2, 0.45, 0.6]] as const;

export function drawFxParticle(c: CanvasRenderingContext2D, p: Particle, time: number): void {
  const a = Math.max(0, p.life / p.max);
  const t = 1 - a;
  switch (p.kind) {
    case 'slap': {
      const ang = p.extra ?? 0;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(ang);
      c.globalAlpha = Math.min(1, a * 2.2);
      c.strokeStyle = cssColor(p.color);
      c.lineWidth = 2.4 * a;
      c.lineCap = 'round';
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        const r2 = p.size * (0.6 + t * 0.8) + i * 6;
        c.arc(0, 0, r2, -Math.PI * 0.35, Math.PI * 0.35);
        c.stroke();
      }
      c.restore();
      break;
    }
    case 'pencilShaving': {
      c.save();
      c.globalAlpha = Math.min(1, a * 2);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.arc(0, 0, p.size, 0, Math.PI * 1.3);
      c.arc(0, 0, p.size * 0.65, Math.PI * 1.3, 0, true);
      c.closePath();
      c.fill();
      c.strokeStyle = '#1f2937';
      c.lineWidth = 0.8;
      c.beginPath();
      c.arc(0, 0, p.size, 0, Math.PI * 1.3);
      c.stroke();
      c.restore();
      break;
    }
    case 'paintSplat': {
      c.save();
      c.translate(p.x, p.y);
      c.globalAlpha = Math.min(1, a * 1.8);
      c.fillStyle = cssColor(p.color);
      const r = p.size * (0.4 + t * 0.6);
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.beginPath();
      c.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'prism': {
      c.save();
      c.globalAlpha = Math.min(1, a * 2);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.moveTo(0, -p.size);
      c.lineTo(p.size * 0.8, -p.size * 0.2);
      c.lineTo(p.size * 0.4, p.size);
      c.lineTo(-p.size * 0.6, p.size * 0.6);
      c.lineTo(-p.size * 0.8, -p.size * 0.2);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.85)';
      c.lineWidth = 0.8;
      c.stroke();
      c.beginPath();
      c.moveTo(0, -p.size);
      c.lineTo(0, p.size * 0.4);
      c.lineTo(p.size * 0.8, -p.size * 0.2);
      c.stroke();
      c.restore();
      break;
    }
    case 'feather': {
      c.save();
      c.globalAlpha = Math.min(1, a * 1.8);
      c.translate(p.x, p.y);
      c.rotate(p.rot + Math.sin(time * 6 + p.x) * 0.3);
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.ellipse(0, 0, p.size * 0.4, p.size, 0, 0, TAU);
      c.fill();
      c.strokeStyle = '#fde68a';
      c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(0, -p.size);
      c.lineTo(0, p.size);
      c.stroke();
      c.restore();
      break;
    }
    case 'star': {
      const tw = 0.6 + 0.4 * Math.sin(time * 25 + p.rot * 4);
      const r = p.size * (0.4 + a * 0.7) * tw;
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = Math.min(1, a * 1.5);
      c.translate(p.x, p.y);
      c.rotate(p.rot * 0.15);
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.moveTo(0, -r);
      c.quadraticCurveTo(0, 0, r, 0);
      c.quadraticCurveTo(0, 0, 0, r);
      c.quadraticCurveTo(0, 0, -r, 0);
      c.quadraticCurveTo(0, 0, 0, -r);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 0, r * 0.25, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'snowflake': {
      c.save();
      c.globalAlpha = Math.min(1, a * 1.7);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.shadowColor = '#93c5fd'; c.shadowBlur = 3;
      c.strokeStyle = cssColor(p.color);
      c.lineCap = 'round'; c.lineWidth = Math.max(0.7, p.size * 0.16);
      for (let i = 0; i < 3; i++) {
        c.rotate(TAU / 6);
        c.beginPath(); c.moveTo(-p.size, 0); c.lineTo(p.size, 0);
        c.moveTo(p.size * 0.48, 0); c.lineTo(p.size * 0.7, -p.size * 0.24);
        c.moveTo(p.size * 0.48, 0); c.lineTo(p.size * 0.7, p.size * 0.24);
        c.stroke();
      }
      c.restore();
      break;
    }
    case 'snowDust': {
      c.save();
      c.translate(p.x, p.y);
      c.globalAlpha = Math.min(1, a * 1.7);
      const r = p.size * (0.7 + t * 0.35);
      const powder = c.createRadialGradient(-r * 0.2, -r * 0.25, 0, 0, 0, r * 1.55);
      powder.addColorStop(0, cssColor(p.color));
      powder.addColorStop(0.48, 'rgba(246,252,255,0.86)');
      powder.addColorStop(1, 'rgba(244,251,255,0)');
      c.fillStyle = powder;
      c.beginPath(); c.arc(0, 0, r * 1.55, 0, TAU); c.fill();
      c.restore();
      break;
    }
    case 'snowChunk': {
      c.save();
      c.globalAlpha = Math.min(1, a * 1.8);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      const s = p.size;
      const packed = c.createRadialGradient(-s * 0.35, -s * 0.45, s * 0.08, 0, 0, s * 1.25);
      packed.addColorStop(0, '#ffffff'); packed.addColorStop(0.52, cssColor(p.color)); packed.addColorStop(1, '#c5dee9');
      c.fillStyle = packed;
      c.beginPath();
      c.moveTo(-s * 0.92, -s * 0.14);
      c.quadraticCurveTo(-s * 1.04, -s * 0.79, -s * 0.38, -s * 0.85);
      c.quadraticCurveTo(s * 0.09, -s * 1.18, s * 0.44, -s * 0.67);
      c.quadraticCurveTo(s * 0.95, -s * 0.47, s * 0.91, s * 0.2);
      c.quadraticCurveTo(s * 0.8, s * 0.89, s * 0.13, s * 0.84);
      c.quadraticCurveTo(-s * 0.35, s * 1.01, -s * 0.88, s * 0.37);
      c.closePath(); c.fill();
      c.strokeStyle = 'rgba(155,194,212,0.56)'; c.lineWidth = 0.75; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.95)';
      c.beginPath(); c.arc(-s * 0.28, -s * 0.26, s * 0.2, 0, TAU);
      c.arc(s * 0.37, -s * 0.09, s * 0.12, 0, TAU); c.fill();
      c.restore();
      break;
    }
    case 'shard': {
      c.save();
      c.globalAlpha = Math.min(1, a * 2);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.moveTo(0, -p.size);
      c.lineTo(p.size * 0.5, p.size * 0.6);
      c.lineTo(-p.size * 0.5, p.size * 0.4);
      c.closePath();
      c.fill();
      c.restore();
      break;
    }
    case 'xenoMolecular': {
      drawXenoMolecularBurst(c, p.x, p.y, p.max - p.life);
      break;
    }
    case 'spirit': {
      drawSpiritMote(c, p.x, p.y, p.size * 0.75, time * 3 + p.rot, Math.min(1, a * 1.4));
      break;
    }
    case 'shock': {
      const e = 1 - Math.pow(1 - t, 2.5);
      const r = p.size * (0.2 + 0.8 * e);
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = cssColor(p.color, 0.65 * a);
      c.lineWidth = Math.max(1, 2.4 * a);
      c.beginPath();
      c.arc(p.x, p.y, r, 0, TAU);
      c.stroke();
      c.restore();
      break;
    }
    case 'petal': {
      c.save();
      c.globalAlpha = Math.min(1, a * 2);
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.scale(1, 0.4 + 0.6 * Math.abs(Math.sin(time * 6 + p.rot)));
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'bananaSplash': {
      c.save(); c.translate(p.x, p.y);
      c.rotate((p.extra ?? Math.PI / 2) - Math.PI / 2);
      c.globalAlpha = Math.min(1, a * 2.1);
      const r = p.size * (0.55 + t * 0.58);
      const juice = c.createRadialGradient(0, 0, 1, 0, 0, r * 1.2);
      juice.addColorStop(0, 'rgba(255,255,230,0.95)');
      juice.addColorStop(0.52, 'rgba(251,223,148,0.67)');
      juice.addColorStop(1, 'rgba(232,177,78,0)');
      c.fillStyle = juice;
      c.beginPath(); c.ellipse(0, 0, r * 1.4, r * 0.42, 0, 0, TAU); c.fill();
      // Fluid sheets and round beads crest above the point of impact.
      for (const side of [-1, 1]) {
        c.fillStyle = side < 0 ? 'rgba(255,250,217,0.89)' : 'rgba(249,217,136,0.84)';
        c.beginPath(); c.moveTo(side * r * 0.1, 1);
        c.bezierCurveTo(side * r * 0.38, -r * 0.14, side * r * 0.58, -r * 0.66, side * r * 0.74, -r * 0.55);
        c.quadraticCurveTo(side * r * 0.65, -r * 0.2, side * r * 0.39, 1);
        c.closePath(); c.fill();
        c.fillStyle = '#fff5cd'; c.beginPath();
        c.arc(side * r * 0.78, -r * 0.57, 3.1, 0, TAU); c.fill();
      }
      c.strokeStyle = 'rgba(255,255,247,0.95)'; c.lineWidth = 1.7;
      c.beginPath(); c.ellipse(0, 0, r * 0.8, r * 0.21, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      c.restore(); break;
    }
    case 'bananaDrop': {
      c.save(); c.translate(p.x, p.y); c.rotate(Math.atan2(p.vy, p.vx));
      c.globalAlpha = Math.min(1, a * 1.9);
      const r = p.size;
      c.fillStyle = cssColor(p.color);
      c.beginPath(); c.moveTo(-r * 1.5, 0);
      c.bezierCurveTo(-r * 0.7, -r * 0.25, -r * 0.25, -r * 0.9, r * 0.3, -r * 0.8);
      c.quadraticCurveTo(r * 1.27, -r * 0.45, r * 0.86, r * 0.65);
      c.quadraticCurveTo(-r * 0.4, r, -r * 1.5, 0);
      c.fill(); c.strokeStyle = 'rgba(219,179,98,0.64)'; c.lineWidth = 0.7; c.stroke();
      c.fillStyle = '#ffffff'; c.beginPath(); c.ellipse(0, -r * 0.45, r * 0.24, r * 0.11, 0, 0, TAU); c.fill();
      c.restore(); break;
    }
    case 'honeySplash': {
      c.save(); c.translate(p.x, p.y);
      c.rotate((p.extra ?? Math.PI / 2) - Math.PI / 2);
      c.globalAlpha = Math.min(1, a * 2);
      const r = p.size * (0.65 + t * 0.38);
      const pool = c.createRadialGradient(0, 1, 0, 0, 1, r);
      pool.addColorStop(0, 'rgba(255,228,126,0.81)');
      pool.addColorStop(0.55, 'rgba(218,137,22,0.49)');
      pool.addColorStop(1, 'rgba(151,78,10,0)');
      c.fillStyle = pool; c.beginPath(); c.ellipse(0, 1, r, r * 0.34, 0, 0, TAU); c.fill();
      c.fillStyle = '#fbbf38';
      for (const side of [-1, 1]) {
        c.beginPath(); c.moveTo(side * r * 0.13, 0);
        c.bezierCurveTo(side * r * 0.4, -r * 0.16, side * r * 0.53, -r * 0.68, side * r * 0.7, -r * 0.62);
        c.quadraticCurveTo(side * r * 0.71, -r * 0.32, side * r * 0.46, -r * 0.09);
        c.quadraticCurveTo(side * r * 0.35, 2, side * r * 0.13, 0); c.fill();
        c.fillStyle = '#ffe1a0'; c.beginPath();
        c.arc(side * r * 0.7, -r * 0.66, 2.6, 0, TAU); c.fill();
        c.fillStyle = '#fbbf38';
      }
      c.strokeStyle = 'rgba(255,250,194,0.88)'; c.lineWidth = 1.7;
      c.beginPath(); c.ellipse(0, 1, r * 0.66, r * 0.17, 0, Math.PI * 1.07, Math.PI * 1.91); c.stroke();
      c.restore(); break;
    }
    case 'honeyDrop': {
      const angle = Math.atan2(p.vy, p.vx);
      c.save(); c.translate(p.x, p.y); c.rotate(angle);
      c.globalAlpha = Math.min(1, a * 1.8);
      const r = p.size;
      const syrup = c.createRadialGradient(-r * 0.4, -r * 0.2, 0, 0, 0, r * 1.5);
      syrup.addColorStop(0, '#fff6c3'); syrup.addColorStop(0.43, '#ffc83d');
      syrup.addColorStop(1, '#a9560c'); c.fillStyle = syrup;
      c.beginPath(); c.moveTo(-r * 1.6, 0);
      c.bezierCurveTo(-r * 0.6, -r * 0.46, r * 0.45, -r, r, 0);
      c.bezierCurveTo(r * 0.45, r, -r * 0.6, r * 0.46, -r * 1.6, 0);
      c.fill(); c.restore(); break;
    }
    case 'waterSplash': {
      c.save();
      c.translate(p.x, p.y);
      c.rotate((p.extra ?? Math.PI / 2) - Math.PI / 2);
      c.globalAlpha = Math.min(1, a * 1.8);
      const r = p.size * (0.7 + t * 0.42);
      const pool = c.createRadialGradient(0, 0, 1, 0, 0, r);
      pool.addColorStop(0, 'rgba(27,159,224,0.58)');
      pool.addColorStop(0.55, 'rgba(44,184,227,0.4)');
      pool.addColorStop(1, 'rgba(22,144,207,0)');
      c.fillStyle = pool;
      c.beginPath(); c.ellipse(0, 0, r * 1.25, r * 0.32, 0, 0, TAU); c.fill();
      const crest = c.createLinearGradient(0, -r * 0.45, 0, r * 0.18);
      crest.addColorStop(0, 'rgba(220,252,255,0.72)');
      crest.addColorStop(1, 'rgba(23,164,217,0.12)');
      c.fillStyle = crest;
      c.beginPath();
      c.moveTo(-r * 0.42, 1);
      c.quadraticCurveTo(-r * 0.36, -r * 0.28, -r * 0.13, -r * 0.21);
      c.quadraticCurveTo(-r * 0.03, -r * 0.57, r * 0.12, -r * 0.24);
      c.quadraticCurveTo(r * 0.31, -r * 0.29, r * 0.41, 1);
      c.quadraticCurveTo(0, r * 0.12, -r * 0.42, 1);
      c.fill();
      c.lineCap = 'round';
      // Two broad curling sheets of water rise and fold outward. Unlike five
      // straight rays they read as a splash crown, even at normal game scale.
      for (const side of [-1, 1]) {
        const peak = side < 0 ? 0.61 : 0.48;
        c.fillStyle = 'rgba(28,159,220,0.56)';
        c.beginPath();
        c.moveTo(side * r * 0.12, 1);
        c.bezierCurveTo(side * r * 0.42, r * 0.07, side * r * 0.72, r * 0.5, side * r, r * peak);
        c.quadraticCurveTo(side * r * 0.81, r * 0.21, side * r * 0.58, r * 0.08);
        c.quadraticCurveTo(side * r * 0.29, -r * 0.06, side * r * 0.12, 1);
        c.closePath(); c.fill();
        c.strokeStyle = 'rgba(206,248,255,0.85)'; c.lineWidth = 1.3 + a;
        c.beginPath(); c.moveTo(side * r * 0.26, 1);
        c.bezierCurveTo(side * r * 0.48, r * 0.08, side * r * 0.78, r * 0.51, side * r, r * peak);
        c.stroke();
        c.fillStyle = 'rgba(194,247,255,0.92)';
        c.beginPath(); c.arc(side * r * 1.03, r * peak, 2.3, 0, TAU); c.fill();
        c.beginPath(); c.arc(side * r * 1.18, r * 0.18, 1.3, 0, TAU); c.fill();
      }
      c.strokeStyle = 'rgba(240,255,255,0.83)'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-r * 0.3, -r * 0.04);
      c.quadraticCurveTo(-r * 0.12, -r * 0.4, r * 0.04, -r * 0.22); c.stroke();
      c.strokeStyle = 'rgba(69,190,234,0.8)'; c.lineWidth = 2.2;
      c.beginPath(); c.ellipse(0, 2.5, r * (0.88 + t * 0.14), r * 0.23, 0, 0, Math.PI); c.stroke();
      c.strokeStyle = 'rgba(224,251,255,0.82)'; c.lineWidth = 1;
      c.beginPath(); c.ellipse(0, 2.5, r * (1.15 + t * 0.2), r * 0.28, 0, 0.12, Math.PI * 0.83); c.stroke();
      c.restore();
      break;
    }
    case 'waterDrop': {
      const ang = Math.atan2(p.vy, p.vx);
      c.save();
      c.translate(p.x, p.y); c.rotate(ang);
      c.globalAlpha = Math.min(1, a * 1.8);
      const s = p.size;
      const water = c.createRadialGradient(s * 0.22, -s * 0.3, 0, 0, 0, s * 1.6);
      water.addColorStop(0, 'rgba(255,255,255,0.9)');
      water.addColorStop(0.31, 'rgba(213,250,255,0.82)');
      water.addColorStop(0.72, 'rgba(37,184,228,0.63)');
      water.addColorStop(1, 'rgba(17,129,188,0.32)');
      c.fillStyle = water;
      c.beginPath();
      c.moveTo(-s * 1.45, 0);
      c.bezierCurveTo(-s * 0.65, -s * 0.2, -s * 0.3, -s * 0.95, s * 0.28, -s * 0.86);
      c.bezierCurveTo(s * 1.4, -s * 0.6, s * 1.4, s * 0.75, s * 0.27, s * 0.92);
      c.bezierCurveTo(-s * 0.3, s * 0.93, -s * 0.65, s * 0.22, -s * 1.45, 0);
      c.fill();
      c.strokeStyle = 'rgba(221,251,255,0.75)'; c.lineWidth = Math.max(0.6, s * 0.17); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.9)';
      c.beginPath(); c.ellipse(s * 0.37, -s * 0.36, s * 0.23, s * 0.13, -0.4, 0, TAU); c.fill();
      c.restore();
      break;
    }
    case 'drop': {
      const ang = Math.atan2(p.vy, p.vx);
      const sp = Math.min(2.5, Math.hypot(p.vx, p.vy) / 250 + 1);
      const r = p.size;
      c.save();
      c.globalAlpha = Math.min(1, a * 2);
      c.translate(p.x, p.y);
      c.rotate(ang);
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.ellipse(0, 0, r * sp, r * 0.7, 0, 0, TAU);
      c.fill();
      // The glossy highlight is a sub-pixel speck below ~3.4px: drawing it feeds
      // 2 fills per droplet for nothing. Paintball fires 8 shots a second, so
      // that is a real slice of the frame budget.
      if (r >= 3.4) {
        c.fillStyle = 'rgba(255,255,255,0.7)';
        c.beginPath();
        c.arc(r * 0.3, -r * 0.2, r * 0.22, 0, TAU);
        c.fill();
      }
      c.restore();
      break;
    }
    case 'streak': {
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = a * 0.85;
      c.strokeStyle = cssColor(p.color);
      c.lineWidth = p.size;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
      c.stroke();
      c.restore();
      break;
    }
    case 'ringE': {
      c.strokeStyle = cssColor(p.color);
      c.globalAlpha = a * 0.9;
      c.lineWidth = 1 + a * 2.5;
      c.beginPath();
      c.ellipse(p.x, p.y, p.size * (0.3 + t * 0.7), p.size * 0.38 * (0.3 + t * 0.7), 0, 0, TAU);
      c.stroke();
      c.globalAlpha = 1;
      break;
    }
    case 'puff': {
      const fade = Math.min(1, t * 5) * Math.min(1, a * 2.5);
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.rot);
      c.globalAlpha = fade;
      const s = p.size;
      // Overlapping translucent lobes build up depth, so preserve their
      // separate fills. Once the coloured body is opaque, its lobes can share
      // a path without flattening the fading cloud's layered appearance.
      c.fillStyle = 'rgba(120,150,190,0.45)';
      for (const [lx, ly, lr] of PUFF_LOBES) {
        c.beginPath(); c.arc(lx * s + 3, ly * s + 4, lr * s, 0, TAU); c.fill();
      }
      c.fillStyle = cssColor(p.color);
      if (c.globalAlpha >= 1) {
        c.beginPath();
        for (const [lx, ly, lr] of PUFF_LOBES) {
          const x = lx * s, y = ly * s, r = lr * s;
          c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU);
        }
        c.fill();
      } else {
        for (const [lx, ly, lr] of PUFF_LOBES) {
          c.beginPath(); c.arc(lx * s, ly * s, lr * s, 0, TAU); c.fill();
        }
      }
      c.fillStyle = 'rgba(255,255,255,0.9)';
      c.beginPath(); c.arc(-s * 0.25, -s * 0.3, s * 0.4, 0, TAU); c.fill();
      c.restore();
      c.globalAlpha = 1;
      break;
    }
    case 'wind': {
      const sp = Math.hypot(p.vx, p.vy) || 1;
      const ux = p.vx / sp, uy = p.vy / sp;
      const len = p.size * (0.6 + a);
      c.strokeStyle = cssColor(p.color);
      c.globalAlpha = a * 0.8;
      c.lineWidth = 1.6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(p.x, p.y);
      c.quadraticCurveTo(p.x - ux * len * 0.5 - uy * 6, p.y - uy * len * 0.5 + ux * 6, p.x - ux * len, p.y - uy * len);
      c.stroke();
      c.globalAlpha = 1;
      break;
    }
    case 'ash': {
      c.globalAlpha = a * 0.8;
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.arc(p.x, p.y, p.size * 0.5, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
      break;
    }
    case 'speed': {
      // 28 manga spokes that race outward from the impact (game-3 'speed')
      const seed = (p.rot || 1) * 9301 + 49297;
      let rs = seed % 233280;
      const rnd = () => { rs = (rs * 9301 + 49297) % 233280; return rs / 233280; };
      const R0 = p.size * (0.25 + t * 0.5);
      const R1 = p.size * (0.6 + t * 0.6);
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.strokeStyle = cssColor(p.color, a * 0.8);
      c.lineCap = 'round';
      for (let i = 0; i < 28; i++) {
        const an = (i / 28) * TAU + rnd() * 0.2;
        const l0 = R0 + rnd() * p.size * 0.2;
        const l1 = R1 + rnd() * p.size * 0.3;
        c.lineWidth = 1 + rnd() * 2.5;
        c.beginPath();
        c.moveTo(p.x + Math.cos(an) * l0, p.y + Math.sin(an) * l0);
        c.lineTo(p.x + Math.cos(an) * l1, p.y + Math.sin(an) * l1);
        c.stroke();
      }
      c.restore();
      break;
    }
    case 'bubble': {
      c.globalAlpha = a * 0.7;
      c.strokeStyle = cssColor(p.color);
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(p.x, p.y, p.size, 0, TAU);
      c.stroke();
      c.fillStyle = cssColor(p.color);
      c.beginPath();
      c.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
      break;
    }
    default:
      break;
  }
}
