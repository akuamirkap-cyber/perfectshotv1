import type { WeaponId } from './weapons';
import type { S2Particle, Slide2Fx } from './slide2Fx';

/**
 * Slide 2 (`games/fireworkgun`) gun artwork, exported to slide 1.
 *
 * Every one of the eight slide-2 weapons lives on slide 1 under the same name,
 * so the hub does not need a single new weapon: each of them becomes a
 * "Slide 2" design card on the gun it belongs to.
 *
 * The drawing code below is slide 2's own source, copied unchanged. Slide 2
 * authors its guns around `(CX, GUNY) = (210, 596)`; `drawSetTwoGun()` moves the
 * context so the muzzle lands exactly where slide 1 draws it, which is all it
 * takes for every path, gradient and glow to stay pixel-identical.
 */

/** Slide 2 canvas width/height (slide 1 draws the same 420x760 play field). */
const W = 420;
const H = 760;
const CX = W / 2;
/** Muzzle line of slide 2's canvas. */
const GUNY = 596;
/** Rocket length, used by the rocket art. */
const PL = 46;
const TAU = Math.PI * 2;

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

/** The eight slide-2 weapons, in slide 2's own order. */
export const SET_TWO_IDS = [
  'firework', 'blackhole', 'shark', 'bamboo', 'soaker', 'rainbow', 'bazooka', 'rpg',
] as const;
export type SetTwoId = (typeof SET_TWO_IDS)[number];
/** Slide 2's own name for the same thing (kept for the FX layer's imports). */
export type TwoWeapon = SetTwoId;

/**
 * slide-1 gun id -> slide-2 weapon id. Every slide-2 weapon kept its slide-1
 * name, so this is the identity; the table exists so a future slide-2 weapon
 * that arrived under a different name has one place to be matched.
 */
export const SET_TWO_BY_SLIDE1_ID: Record<string, SetTwoId> = Object.fromEntries(
  SET_TWO_IDS.map((id) => [id, id]),
) as Record<string, SetTwoId>;

/** The slide-2 weapon behind a slide-1 gun, or null when it has none. */
export function setTwoIdFor(slide1Id: WeaponId | string | null | undefined): SetTwoId | null {
  if (!slide1Id) return null;
  return SET_TWO_BY_SLIDE1_ID[slide1Id] ?? null;
}

/** True for the eight slide-2 guns slide 1 already had. */
export function isSetTwoWeapon(id: WeaponId | 'old' | string): id is SetTwoId {
  return (SET_TWO_IDS as readonly string[]).includes(id);
}

/**
 * Everything slide 2's guns read while drawing: the clock, the recoil spring,
 * the reload/charge meter, the ammo left and the colour of the loaded round.
 */
export interface SetTwoDrawState {
  /** Seconds since the game started (drives every idle wobble). */
  time: number;
  /** 1 right after a shot, decaying to 0. */
  recoil: number;
  /** 0..1 reload/charge progress (the loaded round rising into the barrel). */
  loadP: number;
  /** Colour of the round that is loaded now. */
  hue: number;
  /** Rounds left in this stage; 0 hides the loaded round. */
  ammo: number;
  /** False while the game is paused/between stages. */
  live: boolean;
  /** Barrel heat pulse of bazooka / rpg, 0..1. */
  cannonPulse: number;
}

/** Backwards-compatible name for the draw state. */
export type SetTwoState = SetTwoDrawState;

/** The resting pose: nothing loaded, nothing moving. */
export function restTwoState(hue = 28, over: Partial<SetTwoDrawState> = {}): SetTwoDrawState {
  return { time: 0, recoil: 0, loadP: 0, hue, ammo: 6, live: true, cannonPulse: 0, ...over };
}

/**
 * The colour slide 2 loads into round `i`. Every weapon has its own cycle, so
 * the loaded round, the flight trail and the impact all share one hue.
 */
export function twoAmmoHue(id: SetTwoId, i: number, hueBase = 28): number {
  if (id === 'blackhole') return 215 + ((i * 53) % 105);
  if (id === 'shark') return 192 + ((i * 37) % 30);
  if (id === 'bamboo') return 20 + ((i * 29) % 40);
  if (id === 'soaker') return 190 + ((i * 23) % 25);
  if (id === 'rainbow') return (i * 47) % 360;
  if (id === 'bazooka') return [45, 90, 140, 200, 280, 0][i % 6];
  if (id === 'rpg') return [15, 45, 120, 190, 265, 320][i % 6];
  return (hueBase + i * 41) % 360;
}

export function starPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function drawRocketShape(ctx: CanvasRenderingContext2D, hue: number, flash = 0) {
  // stick
  ctx.strokeStyle = "#e6c27a";
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(PL, 0);
  ctx.stroke();
  // fins
  ctx.fillStyle = hsl(hue, 85, 38);
  ctx.beginPath();
  ctx.moveTo(24, -4.5);
  ctx.lineTo(36, -10.5);
  ctx.lineTo(36, -4.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(24, 4.5);
  ctx.lineTo(36, 10.5);
  ctx.lineTo(36, 4.5);
  ctx.closePath();
  ctx.fill();
  // body
  const g = ctx.createLinearGradient(0, -5.5, 0, 5.5);
  g.addColorStop(0, hsl(hue, 90, 74));
  g.addColorStop(0.5, hsl(hue, 90, 52));
  g.addColorStop(1, hsl(hue, 90, 32));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(11, -5.5, 24, 11, 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(18, -5.5, 2.6, 11);
  ctx.fillRect(25, -5.5, 2.6, 11);
  // nose
  ctx.fillStyle = hsl(hue + 35, 100, 62);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(6, -5.5, 12, -5.5);
  ctx.lineTo(12, 5.5);
  ctx.quadraticCurveTo(6, 5.5, 0, 0);
  ctx.closePath();
  ctx.fill();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.85})`;
    ctx.beginPath();
    ctx.roundRect(0, -6, 36, 12, 3);
    ctx.fill();
  }
}

export function drawShark(
  ctx: CanvasRenderingContext2D,
  hue: number,
  open: number,
  t: number,
  seed: number,
  flash = 0
) {
  const wag = Math.sin(t * 11 + seed * 7) * 3.5;
  const breathe = Math.sin(t * 3 + seed * 3) * 0.6;
  const o = Math.max(0, Math.min(1, open));
  const line = "rgba(8,30,55,0.85)";

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // ---- tail fin (behind body) ----
  ctx.fillStyle = hsl(hue, 60, 36);
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(58, -2 + wag * 0.3);
  ctx.quadraticCurveTo(66, -8 + wag, 73, -14 + wag * 1.4);
  ctx.quadraticCurveTo(70, -6 + wag * 0.8, 68, 0 + wag * 0.4);
  ctx.quadraticCurveTo(70, 5 + wag * 0.4, 72, 10 + wag * 0.6);
  ctx.quadraticCurveTo(65, 8 + wag * 0.4, 59, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ---- body ----
  const bodyG = ctx.createLinearGradient(0, -14, 0, 12);
  bodyG.addColorStop(0, hsl(hue, 65, 46));
  bodyG.addColorStop(0.45, hsl(hue, 60, 58));
  bodyG.addColorStop(0.75, hsl(Math.min(hue + 10, 220), 45, 80));
  bodyG.addColorStop(1, hsl(205, 50, 93));
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 1); // nose tip
  ctx.quadraticCurveTo(10, -11, 30, -12); // head top
  ctx.quadraticCurveTo(48, -12.5, 60, -3 + wag * 0.3); // back to tail base
  ctx.lineTo(60, 5); // tail base
  ctx.quadraticCurveTo(45, 11, 28, 10.5); // belly
  ctx.quadraticCurveTo(12, 10, 3, 5.5); // toward mouth
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ---- belly shine ----
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.ellipse(32, 5.5, 17, 3.2, 0.02, 0, TAU);
  ctx.fill();
  // top highlight
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -8.5);
  ctx.quadraticCurveTo(24, -11.5, 40, -10.5);
  ctx.stroke();

  // ---- spots ----
  ctx.fillStyle = hsl(hue, 55, 72, 0.8);
  for (const [sx, sy, sr] of [[38, -6, 1.7], [45, -4.5, 1.4], [31, -7.5, 1.3]] as const) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }

  // ---- dorsal fin ----
  const finG = ctx.createLinearGradient(0, -24, 0, -8);
  finG.addColorStop(0, hsl(hue, 65, 34));
  finG.addColorStop(1, hsl(hue, 60, 48));
  ctx.fillStyle = finG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(34, -11);
  ctx.quadraticCurveTo(38, -22, 47, -25);
  ctx.quadraticCurveTo(45, -18, 46, -11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ---- pectoral fin ----
  ctx.fillStyle = hsl(hue, 60, 40);
  ctx.beginPath();
  ctx.moveTo(30, 8);
  ctx.quadraticCurveTo(36, 13 + breathe, 44, 15 + breathe);
  ctx.quadraticCurveTo(38, 11, 36, 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ---- gills ----
  ctx.strokeStyle = "rgba(8,30,55,0.5)";
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(25 + i * 3.4, -4);
    ctx.quadraticCurveTo(27 + i * 3.4, 0, 25 + i * 3.4, 4.5);
    ctx.stroke();
  }

  // ---- MOUTH ----
  const hingeX = 21;
  const hingeY = 5.5;
  if (o > 0.03) {
    // open mouth interior
    const tipX = 2 + o * 5;
    const tipY = 4 + o * 17;
    ctx.fillStyle = "#7a1020";
    ctx.beginPath();
    ctx.moveTo(2, 3);
    ctx.quadraticCurveTo(12, 5.5, hingeX, hingeY);
    ctx.lineTo(tipX, tipY);
    ctx.quadraticCurveTo(9, 7 + o * 6, 2, 3);
    ctx.closePath();
    ctx.fill();
    // tongue
    ctx.fillStyle = "#e2607a";
    ctx.beginPath();
    ctx.ellipse(11 + o * 2, 7 + o * 7, 4.5, 2.4, 0.35, 0, TAU);
    ctx.fill();
    // upper teeth (pointing down)
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    const teeth = 4;
    for (let i = 0; i < teeth; i++) {
      const tx = 4 + i * 4.4;
      const ty = 3.4 + i * 0.55;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 2.4, ty + 0.4);
      ctx.lineTo(tx + 1.1, ty + 3.6 + o * 1.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // lower jaw
    ctx.fillStyle = hsl(205, 45, 88);
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hingeX, hingeY);
    ctx.lineTo(tipX, tipY);
    ctx.quadraticCurveTo(tipX - 1, tipY + 2.6, tipX - 4, tipY + 1.5);
    ctx.lineTo(hingeX - 2, hingeY + 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // lower teeth (pointing up)
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 3; i++) {
      const f = 0.25 + i * 0.28;
      const tx = hingeX + (tipX - hingeX) * f;
      const ty = hingeY + 2.5 + (tipY - hingeY) * f;
      ctx.beginPath();
      ctx.moveTo(tx - 1.6, ty);
      ctx.lineTo(tx + 1.6, ty - 0.6);
      ctx.lineTo(tx - 0.2, ty - 3.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // closed mouth — sly smile
    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, 3.5);
    ctx.quadraticCurveTo(11, 6.5, 20, 5.5);
    ctx.stroke();
  }

  // ---- eye (fierce + cute) ----
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(11.5, -4.5, 3.4, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  const lookX = -o * 1.2;
  ctx.fillStyle = "#0a1a30";
  ctx.beginPath();
  ctx.arc(11 + lookX, -4.4, 1.9, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(10.4 + lookX, -5, 0.8, 0, TAU);
  ctx.fill();
  // angry brow
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6.5, -9.5);
  ctx.lineTo(15, -7.5);
  ctx.stroke();

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(32, 0, 34, 13, 0, 0, TAU);
    ctx.fill();
  }
}

export function drawOrb(ctx: CanvasRenderingContext2D, hue: number, r: number, t: number, seed: number) {
  // ---- deep gravitational lensing halo (two layers) ----
  const halo = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 3.4);
  halo.addColorStop(0, hsl(hue, 100, 60, 0.55));
  halo.addColorStop(0.45, hsl(hue + 25, 100, 55, 0.2));
  halo.addColorStop(1, hsl(hue + 40, 100, 55, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 3.4, 0, TAU);
  ctx.fill();
  // faint outer einstein ring
  ctx.strokeStyle = hsl(hue + 30, 100, 70, 0.28);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.5, 0, TAU);
  ctx.stroke();
  // ---- accretion disk: wide faint band + hot thin band ----
  ctx.save();
  ctx.rotate(-0.35);
  ctx.scale(1, 0.45);
  ctx.strokeStyle = hsl(hue - 20, 95, 45, 0.55);
  ctx.lineWidth = r * 0.52;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.45, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue, 100, 62, 0.95);
  ctx.lineWidth = r * 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.38, 0, TAU);
  ctx.stroke();
  // doppler-bright side (one side burns white-hot)
  ctx.strokeStyle = hsl(hue + 45, 100, 80, 0.95);
  ctx.lineWidth = Math.max(1.4, r * 0.14);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.38, Math.PI * 0.95, Math.PI * 1.95);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.38, Math.PI * 1.2, Math.PI * 1.7);
  ctx.stroke();
  // racing hotspots on the disk
  const k1 = t * 4.5 + seed;
  ctx.fillStyle = "#fff";
  for (const a of [k1, k1 + (TAU / 3), k1 + (TAU * 2) / 3]) {
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 1.38, Math.sin(a) * r * 1.38, Math.max(1.1, r * 0.15), 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // ---- event horizon: abyssal black with hawking shimmer rim ----
  const eg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  eg.addColorStop(0, "#05010f");
  eg.addColorStop(0.7, "#020108");
  eg.addColorStop(1, "#000");
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  const shim = 0.75 + 0.25 * Math.sin(t * 9 + seed * 5);
  ctx.strokeStyle = hsl(hue + 60, 100, 82, 0.95 * shim + 0.05);
  ctx.lineWidth = 2.2;
  ctx.stroke();
  // double photon ring
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.85, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue + 40, 100, 75, 0.6);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.68, 0, TAU);
  ctx.stroke();
  // inner swirls (counter-rotating)
  ctx.strokeStyle = hsl(hue, 100, 70, 0.85);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, t * 5 + seed, t * 5 + seed + Math.PI * 1.2);
  ctx.stroke();
  ctx.strokeStyle = hsl(hue + 70, 100, 78, 0.7);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, -t * 7 + seed * 2, -t * 7 + seed * 2 + Math.PI);
  ctx.stroke();
  // orbiting light motes bent around the well
  for (let q = 0; q < 2; q++) {
    const sa = t * 2.6 + seed + q * Math.PI;
    ctx.fillStyle = q === 0 ? "#fff" : hsl(hue + 55, 100, 78, 0.95);
    ctx.beginPath();
    ctx.arc(Math.cos(sa) * r * 1.9, Math.sin(sa) * r * 1.9, q === 0 ? 1.7 : 1.3, 0, TAU);
    ctx.fill();
  }
}

export function drawStone(ctx: CanvasRenderingContext2D, hue: number, r: number, t: number, seed: number, flash = 0) {
  const spin = t * 2.2 + seed * 3;
  ctx.save();
  ctx.rotate(spin * 0.35);
  // soft shadow glow for readability
  const halo = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.1);
  halo.addColorStop(0, "rgba(255,200,130,0.22)");
  halo.addColorStop(1, "rgba(255,200,130,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.1, 0, TAU);
  ctx.fill();
  // lumpy rock silhouette (deterministic by seed)
  ctx.beginPath();
  const lumps = 9;
  for (let i = 0; i <= lumps; i++) {
    const a = (i / lumps) * TAU;
    const wob = 1 + 0.1 * Math.sin(seed * 12.9 + i * 2.4) + 0.05 * Math.sin(seed * 5.1 + i * 5.2);
    const rr = r * wob;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr * 0.92;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const pa = ((i - 1) / lumps) * TAU;
      const mx = (Math.cos(pa) + Math.cos(a)) * 0.5 * rr;
      const my = (Math.sin(pa) + Math.sin(a)) * 0.5 * rr * 0.92;
      ctx.quadraticCurveTo(Math.cos(pa) * rr, Math.sin(pa) * rr * 0.92, mx, my);
    }
  }
  ctx.closePath();
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.15, 0, 0, r * 1.25);
  g.addColorStop(0, hsl(hue, 14, 72));
  g.addColorStop(0.55, hsl(hue, 12, 52));
  g.addColorStop(1, hsl(hue, 14, 32));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "rgba(25,18,12,0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();
  // top-left highlight
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.42, r * 0.34, r * 0.2, -0.5, 0, TAU);
  ctx.fill();
  // cracks
  ctx.strokeStyle = "rgba(20,14,10,0.55)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-r * 0.15, -r * 0.1);
  ctx.lineTo(r * 0.25, r * 0.05);
  ctx.lineTo(r * 0.1, r * 0.42);
  ctx.moveTo(r * 0.02, -r * 0.02);
  ctx.lineTo(-r * 0.35, r * 0.3);
  ctx.stroke();
  // speckles
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 4; i++) {
    const a = seed + i * 1.7;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.45, Math.sin(a * 1.3) * r * 0.4, 1.2, 0, TAU);
    ctx.fill();
  }
  // moss patch
  ctx.fillStyle = "rgba(110,170,70,0.75)";
  ctx.beginPath();
  ctx.ellipse(r * 0.42, -r * 0.34, r * 0.24, r * 0.16, 0.4, 0, TAU);
  ctx.fill();
  ctx.restore();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.65})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.05, 0, TAU);
    ctx.fill();
  }
}

export function drawDrop(ctx: CanvasRenderingContext2D, hue: number, r: number, t: number, seed: number, flash = 0) {
  const wob = Math.sin(t * 9 + seed * 6) * 0.09;
  // aqua halo
  const halo = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.6);
  halo.addColorStop(0, hsl(hue, 100, 62, 0.4));
  halo.addColorStop(1, hsl(hue, 100, 55, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.6, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.scale(1 + wob, 1 - wob);
  // droplet body (round bottom, soft point on top)
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.3, r * 0.15, 0, 0, r * 1.3);
  g.addColorStop(0, hsl(hue, 95, 78));
  g.addColorStop(0.45, hsl(hue, 95, 62));
  g.addColorStop(1, hsl(hue + 12, 90, 42));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.35);
  ctx.bezierCurveTo(r * 0.75, -r * 0.5, r * 0.95, -r * 0.1, r * 0.95, r * 0.32);
  ctx.bezierCurveTo(r * 0.95, r * 0.85, r * 0.5, r * 1.1, 0, r * 1.1);
  ctx.bezierCurveTo(-r * 0.5, r * 1.1, -r * 0.95, r * 0.85, -r * 0.95, r * 0.32);
  ctx.bezierCurveTo(-r * 0.95, -r * 0.1, -r * 0.75, -r * 0.5, 0, -r * 1.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  // glossy highlight
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.ellipse(-r * 0.34, r * 0.1, r * 0.16, r * 0.34, -0.25, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.arc(r * 0.3, -r * 0.5, r * 0.11, 0, TAU);
  ctx.fill();
  // inner sparkle
  const tw = 0.5 + 0.5 * Math.sin(t * 6 + seed * 9);
  ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * tw})`;
  ctx.beginPath();
  ctx.arc(r * 0.12, r * 0.45, r * 0.13, 0, TAU);
  ctx.fill();
  ctx.restore();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, TAU);
    ctx.fill();
  }
}

export function drawRainbowBolt(
  ctx: CanvasRenderingContext2D,
  t: number,
  seed: number,
  flash = 0,
  scale = 1
) {
  const L = 64 * scale;
  const flow = t * 320 + seed * 140;
  ctx.lineCap = "round";
  // outer rainbow aura
  for (let i = 0; i < 3; i++) {
    const wdt = (10 - i * 2.6) * scale;
    const grad = ctx.createLinearGradient(0, 0, L, 0);
    for (let s = 0; s <= 6; s++) {
      grad.addColorStop(s / 6, hsl(flow + s * 60 + i * 22, 100, 60, 0.28 - i * 0.07));
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = wdt + 4 * scale;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(L, 0);
    ctx.stroke();
  }
  // spectrum bands (6 flowing stripes)
  for (let b = 0; b < 6; b++) {
    const yy = (-7.5 + b * 3) * scale;
    const grad = ctx.createLinearGradient(0, 0, L, 0);
    for (let s = 0; s <= 5; s++) {
      grad.addColorStop(s / 5, hsl(flow + b * 24 + s * 72, 100, 62, 0.95));
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.6 * scale;
    ctx.beginPath();
    ctx.moveTo(4, yy);
    ctx.lineTo(L - 2, yy * 0.4);
    ctx.stroke();
  }
  // white-hot laser core
  const core = ctx.createLinearGradient(0, 0, L, 0);
  core.addColorStop(0, "rgba(255,255,255,0.95)");
  core.addColorStop(0.7, "rgba(255,255,255,0.85)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.strokeStyle = core;
  ctx.lineWidth = 3.4 * scale;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(L, 0);
  ctx.stroke();
  // crackling arcs around the bolt
  ctx.lineWidth = 1.2 * scale;
  for (let i = 0; i < 3; i++) {
    const a0 = t * 9 + seed * 4 + (i * TAU) / 3;
    const mx = L * 0.45 + Math.cos(a0) * 6 * scale;
    const my = Math.sin(a0) * 9 * scale;
    ctx.strokeStyle = hsl(flow + i * 120, 100, 75, 0.8);
    ctx.beginPath();
    ctx.moveTo(L * 0.25, 0);
    ctx.quadraticCurveTo(mx, my, L * 0.65, 0);
    ctx.stroke();
  }
  // prism crystal tip (nose)
  const tipG = ctx.createLinearGradient(-8 * scale, 0, 10 * scale, 0);
  tipG.addColorStop(0, "#ffffff");
  tipG.addColorStop(0.5, hsl(flow, 100, 72));
  tipG.addColorStop(1, hsl(flow + 120, 100, 65));
  ctx.fillStyle = tipG;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-9 * scale, 0);
  ctx.lineTo(2 * scale, -6.5 * scale);
  ctx.lineTo(9 * scale, 0);
  ctx.lineTo(2 * scale, 6.5 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // tip sparkle
  const tw = 0.5 + 0.5 * Math.sin(t * 12 + seed * 8);
  ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * tw})`;
  ctx.beginPath();
  ctx.arc(0, 0, (2 + tw * 1.6) * scale, 0, TAU);
  ctx.fill();
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(L * 0.45, 0, L * 0.55, 11 * scale, 0, 0, TAU);
    ctx.fill();
  }
}

export function drawBazookaShell(
  ctx: CanvasRenderingContext2D,
  hue: number,
  t: number,
  seed: number,
  flash = 0,
  exhaust = 0
) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const line = "rgba(18,20,9,0.92)";
  const flick = Math.sin(t * 43 + seed * 9) * 0.5 + Math.sin(t * 61 + seed * 4) * 0.3;

  // ---- exhaust back-glow halo (under everything) ----
  if (exhaust > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(62, 0, 2, 62, 0, 34);
    halo.addColorStop(0, `rgba(255,200,110,${0.5 * exhaust})`);
    halo.addColorStop(0.5, `rgba(255,130,40,${0.22 * exhaust})`);
    halo.addColorStop(1, "rgba(255,110,30,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(62, 0, 34, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ---- tail fins with thickness + shadow ----
  for (const s of [-1, 1]) {
    // shadow side
    ctx.fillStyle = "rgba(12,14,6,0.55)";
    ctx.beginPath();
    ctx.moveTo(39, s * 4);
    ctx.lineTo(55, s * 12.5);
    ctx.lineTo(57.5, s * 12.5);
    ctx.lineTo(47, s * 4);
    ctx.closePath();
    ctx.fill();
    const fg = ctx.createLinearGradient(40, 0, 56, s * 12);
    fg.addColorStop(0, "#55652c");
    fg.addColorStop(0.55, "#3d4a20");
    fg.addColorStop(1, "#242b12");
    ctx.fillStyle = fg;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(38, s * 4);
    ctx.lineTo(54, s * 11);
    ctx.lineTo(57, s * 11);
    ctx.lineTo(46, s * 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // worn yellow tip edge
    ctx.strokeStyle = "#e8c832";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(54, s * 11);
    ctx.lineTo(57, s * 11);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,240,0.35)";
    ctx.beginPath();
    ctx.moveTo(40, s * 4.5);
    ctx.lineTo(50, s * 9.5);
    ctx.lineTo(48.5, s * 9.5);
    ctx.lineTo(39, s * 4.5);
    ctx.closePath();
    ctx.fill();
  }

  // ---- exhaust nozzle: steel ring + dark bore + hot throat ----
  const nozG = ctx.createLinearGradient(0, -5, 0, 5);
  nozG.addColorStop(0, "#5a5a64");
  nozG.addColorStop(0.45, "#2b2b30");
  nozG.addColorStop(1, "#121214");
  ctx.fillStyle = nozG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(50, -4.8, 9.5, 9.6, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#060608";
  ctx.beginPath();
  ctx.ellipse(59.5, 0, 2.2, 3.4, 0, 0, TAU);
  ctx.fill();
  if (exhaust > 0.01) {
    ctx.fillStyle = `rgba(255,${170 + Math.round(flick * 30)},80,${0.95 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(59.5, 0, 1.4, 2.4, 0, 0, TAU);
    ctx.fill();
  }

  // ---- main tube body: brushed olive steel ----
  const bodyG = ctx.createLinearGradient(0, -6.5, 0, 6.5);
  bodyG.addColorStop(0, "#a8b862");
  bodyG.addColorStop(0.22, "#7c8c44");
  bodyG.addColorStop(0.45, "#59682e");
  bodyG.addColorStop(0.72, "#39421e");
  bodyG.addColorStop(1, "#202613");
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(14, -6.5, 38, 13, 2.5);
  ctx.fill();
  ctx.stroke();
  // cylindrical top light + bottom bounce
  ctx.fillStyle = "rgba(255,255,225,0.42)";
  ctx.fillRect(16, -5.6, 34, 1.8);
  ctx.fillStyle = "rgba(255,220,150,0.12)";
  ctx.fillRect(16, 3.2, 34, 2.2);
  // brushed-metal streaks
  ctx.strokeStyle = "rgba(20,24,10,0.28)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    const yy = -2.5 + i * 2.4 + Math.sin(seed * 5 + i) * 0.5;
    ctx.beginPath();
    ctx.moveTo(16, yy);
    ctx.lineTo(50, yy);
    ctx.stroke();
  }
  // battle-wear scratches
  ctx.strokeStyle = "rgba(230,235,200,0.5)";
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(20 + (seed % 6), -4);
  ctx.lineTo(24 + (seed % 6), 2);
  ctx.moveTo(44, 1);
  ctx.lineTo(47, 4.5);
  ctx.stroke();
  // red warhead band with shading
  const bandG = ctx.createLinearGradient(0, -6.5, 0, 6.5);
  bandG.addColorStop(0, "#e0484e");
  bandG.addColorStop(0.5, "#a01e24");
  bandG.addColorStop(1, "#5e1115");
  ctx.fillStyle = bandG;
  ctx.fillRect(30, -6.5, 5, 13);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(30, -6.5, 5, 2.2);
  // yellow stencil stripe + star with drop shadow
  ctx.fillStyle = "#e8c832";
  ctx.fillRect(42, -6.5, 3, 13);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(42, 2.5, 3, 4);
  ctx.save();
  ctx.translate(22.6, 0.7);
  ctx.scale(0.55, 0.55);
  starPath(ctx, 7);
  ctx.fillStyle = "rgba(10,12,5,0.5)";
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.translate(22, 0);
  ctx.scale(0.55, 0.55);
  starPath(ctx, 7);
  ctx.fillStyle = "rgba(242,242,218,0.95)";
  ctx.fill();
  ctx.restore();
  // rivets with specular dots
  for (const rx of [17, 49]) {
    for (const ry of [-3.5, 3.5]) {
      ctx.fillStyle = "#1c1e10";
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,230,0.7)";
      ctx.beginPath();
      ctx.arc(rx - 0.35, ry - 0.35, 0.45, 0, TAU);
      ctx.fill();
    }
  }

  // ---- copper shaped-charge cone with specular sweep ----
  const noseG = ctx.createLinearGradient(0, -7.5, 0, 7.5);
  noseG.addColorStop(0, "#ffd9a0");
  noseG.addColorStop(0.3, "#e8934a");
  noseG.addColorStop(0.6, "#a05a1a");
  noseG.addColorStop(1, "#5e2f0c");
  ctx.fillStyle = noseG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.quadraticCurveTo(5, -7.5, 15, -6.5);
  ctx.lineTo(15, 6.5);
  ctx.quadraticCurveTo(5, 7.5, -1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // cone specular streak
  ctx.strokeStyle = "rgba(255,240,215,0.75)";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(3, -4.5);
  ctx.quadraticCurveTo(8, -5.2, 12.5, -5);
  ctx.stroke();
  // cone base ring
  ctx.fillStyle = "#3a3a40";
  ctx.fillRect(13.5, -6.5, 2.2, 13);
  // nose fuse tip: steel + glass dot
  const fuseG = ctx.createRadialGradient(-2, -1, 0.4, -1.5, 0, 2.8);
  fuseG.addColorStop(0, "#ffffff");
  fuseG.addColorStop(0.6, "#b8b8c4");
  fuseG.addColorStop(1, "#5a5a66");
  ctx.fillStyle = fuseG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(-1.5, 0, 2.5, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // tracer light with halo
  const tw = 0.5 + 0.5 * Math.sin(t * 9 + seed * 6);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const tg = ctx.createRadialGradient(37.5, 0, 0, 37.5, 0, 6);
  tg.addColorStop(0, hsl(hue, 100, 62, 0.55 * (0.4 + 0.6 * tw)));
  tg.addColorStop(1, hsl(hue, 100, 60, 0));
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.arc(37.5, 0, 6, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = hsl(hue, 100, 62, 0.6 + 0.4 * tw);
  ctx.beginPath();
  ctx.arc(37.5, 0, 1.8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(37.1, -0.4, 0.6, 0, TAU);
  ctx.fill();

  // ---- sustainer exhaust: 3-layer flame + mach diamonds + smoke root ----
  if (exhaust > 0.01) {
    const fl = 17 + flick * 5;
    const wob = Math.sin(t * 55 + seed * 7) * 1.4;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // outer tongue (deep orange, translucent)
    const outer = ctx.createLinearGradient(59, 0, 59 + fl + 14, 0);
    outer.addColorStop(0, `rgba(255,150,50,${0.75 * exhaust})`);
    outer.addColorStop(0.55, `rgba(255,110,25,${0.45 * exhaust})`);
    outer.addColorStop(1, "rgba(255,70,15,0)");
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.moveTo(59, -5.2);
    ctx.quadraticCurveTo(59 + fl * 0.55, -5.5 + wob, 59 + fl + 12, wob * 1.4);
    ctx.quadraticCurveTo(59 + fl * 0.55, 5.5 + wob, 59, 5.2);
    ctx.closePath();
    ctx.fill();
    // mid tongue (gold)
    const mid = ctx.createLinearGradient(59, 0, 59 + fl * 0.72, 0);
    mid.addColorStop(0, `rgba(255,240,180,${0.95 * exhaust})`);
    mid.addColorStop(0.6, `rgba(255,205,90,${0.8 * exhaust})`);
    mid.addColorStop(1, "rgba(255,160,50,0)");
    ctx.fillStyle = mid;
    ctx.beginPath();
    ctx.moveTo(59, -3.2);
    ctx.quadraticCurveTo(59 + fl * 0.4, -3.4 + wob * 0.6, 59 + fl * 0.72, wob * 0.8);
    ctx.quadraticCurveTo(59 + fl * 0.4, 3.4 + wob * 0.6, 59, 3.2);
    ctx.closePath();
    ctx.fill();
    // white-hot core
    ctx.fillStyle = `rgba(255,255,255,${0.95 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(62.5, wob * 0.3, 5.5, 2.4, 0, 0, TAU);
    ctx.fill();
    // mach diamonds
    ctx.fillStyle = `rgba(220,240,255,${0.85 * exhaust})`;
    for (let i = 0; i < 2; i++) {
      const dx = 66 + i * 6 + flick * 1.5;
      const dw = 2.6 - i * 0.8;
      ctx.beginPath();
      ctx.moveTo(dx - dw, 0);
      ctx.lineTo(dx, -1.5);
      ctx.lineTo(dx + dw, 0);
      ctx.lineTo(dx, 1.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    // smoke root wisp (normal blending, gray)
    ctx.fillStyle = `rgba(150,148,142,${0.4 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(59 + fl + 10, wob * 1.4, 7, 4.5, 0, 0, TAU);
    ctx.fill();
  }
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.7})`;
    ctx.beginPath();
    ctx.roundRect(-2, -7, 61, 14, 4);
    ctx.fill();
  }
}

export function drawRpgGrenade(
  ctx: CanvasRenderingContext2D,
  hue: number,
  t: number,
  seed: number,
  flash = 0,
  exhaust = 0
) {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const line = "rgba(22,12,5,0.92)";
  const flick = Math.sin(t * 47 + seed * 8) * 0.5 + Math.sin(t * 67 + seed * 3) * 0.3;

  if (exhaust > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const halo = ctx.createRadialGradient(63, 0, 2, 63, 0, 38);
    halo.addColorStop(0, `rgba(210,240,255,${0.45 * exhaust})`);
    halo.addColorStop(0.45, `rgba(255,190,100,${0.25 * exhaust})`);
    halo.addColorStop(1, "rgba(255,130,40,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(63, 0, 38, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ---- far fins (dark, behind) for 4-blade depth ----
  ctx.fillStyle = "rgba(16,30,14,0.85)";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(47, s * 2);
    ctx.lineTo(57, s * 8);
    ctx.lineTo(59, s * 8);
    ctx.lineTo(51, s * 2);
    ctx.closePath();
    ctx.fill();
  }
  // ---- near fins ----
  for (const s of [-1, 1]) {
    ctx.fillStyle = "rgba(10,18,8,0.5)";
    ctx.beginPath();
    ctx.moveTo(44, s * 3);
    ctx.lineTo(58, s * 13.5);
    ctx.lineTo(61, s * 13.5);
    ctx.lineTo(50, s * 3);
    ctx.closePath();
    ctx.fill();
    const fg = ctx.createLinearGradient(44, 0, 60, s * 13);
    fg.addColorStop(0, "#4d7f40");
    fg.addColorStop(0.6, "#2c5222");
    fg.addColorStop(1, "#162b12");
    ctx.fillStyle = fg;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(44, s * 3);
    ctx.lineTo(58, s * 12);
    ctx.lineTo(61, s * 12);
    ctx.lineTo(50, s * 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#d8ef9a";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(58, s * 12);
    ctx.lineTo(61, s * 12);
    ctx.stroke();
    ctx.fillStyle = "rgba(220,255,200,0.3)";
    ctx.beginPath();
    ctx.moveTo(46, s * 3.4);
    ctx.lineTo(54, s * 9.5);
    ctx.lineTo(52.5, s * 9.5);
    ctx.lineTo(45, s * 3.4);
    ctx.closePath();
    ctx.fill();
  }

  // ---- booster nozzle with heat tint ----
  const nozG = ctx.createLinearGradient(0, -4, 0, 4);
  nozG.addColorStop(0, "#5a5a64");
  nozG.addColorStop(0.5, "#2e2e34");
  nozG.addColorStop(1, "#101014");
  ctx.fillStyle = nozG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(52, -3.8, 8.5, 7.6, 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#07070a";
  ctx.beginPath();
  ctx.ellipse(60.5, 0, 2, 2.8, 0, 0, TAU);
  ctx.fill();
  if (exhaust > 0.01) {
    ctx.fillStyle = `rgba(200,235,255,${0.95 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(60.5, 0, 1.3, 2, 0, 0, TAU);
    ctx.fill();
  }

  // ---- skinny booster stick with heat discoloration ----
  const stickG = ctx.createLinearGradient(0, -4, 0, 4);
  stickG.addColorStop(0, "#8cc45a");
  stickG.addColorStop(0.4, "#55883a");
  stickG.addColorStop(0.75, "#334f22");
  stickG.addColorStop(1, "#1c3013");
  ctx.fillStyle = stickG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(26, -4, 28, 8, 2.5);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.fillRect(28, -3, 24, 1.6);
  // heat tint near nozzle (blued steel)
  if (exhaust > 0.01) {
    ctx.fillStyle = `rgba(90,120,255,${0.35 * exhaust})`;
    ctx.fillRect(46, -4, 8, 8);
    ctx.fillStyle = `rgba(180,110,255,${0.25 * exhaust})`;
    ctx.fillRect(42, -4, 5, 8);
  }
  // red arming band + white stripe
  const armG = ctx.createLinearGradient(0, -4, 0, 4);
  armG.addColorStop(0, "#f05048");
  armG.addColorStop(0.5, "#b02820");
  armG.addColorStop(1, "#5e130e");
  ctx.fillStyle = armG;
  ctx.fillRect(44, -4, 4.5, 8);

  // ---- FAT onion warhead: rusted steel with speckle + specular ----
  const warG = ctx.createLinearGradient(0, -11, 0, 11);
  warG.addColorStop(0, "#f2c88e");
  warG.addColorStop(0.3, "#c98a48");
  warG.addColorStop(0.6, "#8a5527");
  warG.addColorStop(0.85, "#54300f");
  warG.addColorStop(1, "#331b08");
  ctx.fillStyle = warG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.quadraticCurveTo(4, -10.8, 14, -10.8);
  ctx.quadraticCurveTo(24, -10.2, 27, -4);
  ctx.lineTo(27, 4);
  ctx.quadraticCurveTo(24, 10.2, 14, 10.8);
  ctx.quadraticCurveTo(4, 10.8, -1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // big soft specular
  ctx.fillStyle = "rgba(255,244,220,0.5)";
  ctx.beginPath();
  ctx.ellipse(11, -5.8, 6.5, 2.8, -0.4, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.ellipse(9, -6.2, 2.6, 1.1, -0.4, 0, TAU);
  ctx.fill();
  // rust speckle (deterministic)
  ctx.fillStyle = "rgba(60,30,10,0.5)";
  for (let i = 0; i < 7; i++) {
    const a = seed * 3 + i * 2.3;
    const px = 8 + Math.cos(a) * 9;
    const py = Math.sin(a * 1.4) * 6.5;
    if (px > 1 && px < 25 && Math.abs(py) < 9) {
      ctx.beginPath();
      ctx.arc(px, py, 0.7 + (i % 3) * 0.4, 0, TAU);
      ctx.fill();
    }
  }
  // lathe rings
  ctx.strokeStyle = "rgba(50,28,10,0.55)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(14, -10.2);
  ctx.quadraticCurveTo(17, 0, 14, 10.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(21, -8.6);
  ctx.quadraticCurveTo(23.5, 0, 21, 8.6);
  ctx.stroke();
  // base collar ring
  ctx.fillStyle = "#3c3c38";
  ctx.fillRect(25.5, -4.5, 2.5, 9);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(25.5, -4.5, 2.5, 1.6);

  // standoff spike + piezo tip with glint
  const spikeG = ctx.createLinearGradient(0, -2, 0, 2);
  spikeG.addColorStop(0, "#e8e8f0");
  spikeG.addColorStop(0.5, "#a8a8b4");
  spikeG.addColorStop(1, "#55555e");
  ctx.fillStyle = spikeG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(-6.5, -1.8, 7.5, 3.6, 1.5);
  ctx.fill();
  ctx.stroke();
  const tipG = ctx.createRadialGradient(-7, -0.6, 0.3, -6.5, 0, 2.2);
  tipG.addColorStop(0, "#ffffff");
  tipG.addColorStop(0.7, "#c4c4d0");
  tipG.addColorStop(1, "#6a6a76");
  ctx.fillStyle = tipG;
  ctx.beginPath();
  ctx.arc(-6.5, 0, 2.1, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // tracer light with halo
  const tw = 0.5 + 0.5 * Math.sin(t * 10 + seed * 7);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const tg = ctx.createRadialGradient(33, 0, 0, 33, 0, 5.5);
  tg.addColorStop(0, hsl(hue, 100, 64, 0.55 * (0.4 + 0.6 * tw)));
  tg.addColorStop(1, hsl(hue, 100, 60, 0));
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.arc(33, 0, 5.5, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = hsl(hue, 100, 64, 0.6 + 0.4 * tw);
  ctx.beginPath();
  ctx.arc(33, 0, 1.7, 0, TAU);
  ctx.fill();

  // ---- booster jet: long blue-white core + orange sheath + mach diamonds ----
  if (exhaust > 0.01) {
    const fl = 23 + flick * 6;
    const wob = Math.sin(t * 58 + seed * 6) * 1.2;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // outer sheath
    const outer = ctx.createLinearGradient(60, 0, 60 + fl + 14, 0);
    outer.addColorStop(0, `rgba(255,170,70,${0.7 * exhaust})`);
    outer.addColorStop(0.5, `rgba(255,120,35,${0.45 * exhaust})`);
    outer.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.moveTo(60, -4.4);
    ctx.quadraticCurveTo(60 + fl * 0.55, -4.6 + wob, 60 + fl + 12, wob * 1.3);
    ctx.quadraticCurveTo(60 + fl * 0.55, 4.6 + wob, 60, 4.4);
    ctx.closePath();
    ctx.fill();
    // blue-white core jet
    const core = ctx.createLinearGradient(60, 0, 60 + fl * 0.8, 0);
    core.addColorStop(0, `rgba(255,255,255,${0.98 * exhaust})`);
    core.addColorStop(0.4, `rgba(205,240,255,${0.9 * exhaust})`);
    core.addColorStop(1, "rgba(140,200,255,0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.moveTo(60, -2.6);
    ctx.quadraticCurveTo(60 + fl * 0.45, -2.8 + wob * 0.5, 60 + fl * 0.8, wob * 0.7);
    ctx.quadraticCurveTo(60 + fl * 0.45, 2.8 + wob * 0.5, 60, 2.6);
    ctx.closePath();
    ctx.fill();
    // mach diamonds chain
    ctx.fillStyle = `rgba(235,250,255,${0.9 * exhaust})`;
    for (let i = 0; i < 3; i++) {
      const dx = 65 + i * 5.5 + flick * 1.2;
      const dw = 2.4 - i * 0.55;
      ctx.beginPath();
      ctx.moveTo(dx - dw, wob * 0.4);
      ctx.lineTo(dx, -1.3);
      ctx.lineTo(dx + dw, wob * 0.4);
      ctx.lineTo(dx, 1.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = `rgba(160,158,152,${0.38 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(60 + fl + 11, wob * 1.3, 7.5, 4.5, 0, 0, TAU);
    ctx.fill();
  }
  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(26, 0, 34, 11, 0, 0, TAU);
    ctx.fill();
  }
}

/**
 * Slide 2's gun renderer. The ten fields below are exactly the state slide 2's
 * own drawing methods read, so the copied bodies below compile and behave
 * exactly as they do on slide 2.
 */
class TwoGuns {
  ctx!: CanvasRenderingContext2D;
  /** Live FX layer for the guns' idle sparks and mist (menus pass none). */
  fx: Slide2Fx | null = null;
  weapon: SetTwoId = 'firework';
  time = 0;
  recoil = 0;
  loadP = 0;
  ammo = 6;
  hueBase = 28;
  queue: number[] = [28];
  shotIdx = 0;
  state: 'playing' | 'menu' = 'playing';
  cannonPulse = 0;

  /** Slide 2 `spawn()` — the idle charge sparks a few guns breathe out. */
  private spawn(x: number, y: number, vx: number, vy: number, o: Partial<S2Particle>) {
    this.fx?.spawn(x, y, vx, vy, o);
  }

  /** Slide 2 `spawnSmoke()` — the same, for the soaker's cold mist. */
  private spawnSmoke(x: number, y: number, vx: number, vy: number, r: number, life: number, dark: number) {
    this.fx?.spawnSmoke(x, y, vx, vy, r, life, dark);
  }

  drawGun() {
    if (this.weapon === "blackhole") {
      this.drawBHGun();
      return;
    }
    if (this.weapon === "shark") {
      this.drawSharkGun();
      return;
    }
    if (this.weapon === "bamboo") {
      this.drawBambooGun();
      return;
    }
    if (this.weapon === "soaker") {
      this.drawSoakerGun();
      return;
    }
    if (this.weapon === "rainbow") {
      this.drawRainbowGun();
      return;
    }
    if (this.weapon === "bazooka") {
      this.drawBazookaGun();
      return;
    }
    if (this.weapon === "rpg") {
      this.drawRpgGun();
      return;
    }
    const ctx = this.ctx;
    const oy = this.recoil * 16;
    const nextHue = this.queue[this.shotIdx] ?? this.hueBase;
    const live = this.state === "playing" && this.ammo > 0;

    // loaded rocket peeking out of barrel
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 22 + (1 - e) * 46 + oy;
      ctx.save();
      ctx.translate(CX, tipY);
      ctx.rotate(Math.PI / 2);
      drawRocketShape(ctx, nextHue);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(0, oy);

    // glow behind gun
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 100, 10, CX, GUNY + 100, 120);
    gg.addColorStop(0, hsl(nextHue, 100, 55, 0.25));
    gg.addColorStop(1, hsl(nextHue, 100, 55, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 130, GUNY - 30, 260, 260);
    ctx.globalCompositeOperation = "source-over";

    // body (base)
    const bodyG = ctx.createLinearGradient(CX - 50, 0, CX + 50, 0);
    bodyG.addColorStop(0, "#3a1d6e");
    bodyG.addColorStop(0.35, "#7a47c9");
    bodyG.addColorStop(0.65, "#5a30a3");
    bodyG.addColorStop(1, "#2a1456");
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(CX - 24, GUNY + 70);
    ctx.lineTo(CX + 24, GUNY + 70);
    ctx.lineTo(CX + 52, GUNY + 100);
    ctx.quadraticCurveTo(CX + 58, GUNY + 150, CX + 44, GUNY + 165);
    ctx.lineTo(CX - 44, GUNY + 165);
    ctx.quadraticCurveTo(CX - 58, GUNY + 150, CX - 52, GUNY + 100);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffd75e";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // side shells
    for (const sx of [-1, 1]) {
      const hx = CX + sx * 40;
      const hy = GUNY + 125;
      ctx.fillStyle = hsl(nextHue + sx * 70, 90, 55);
      ctx.beginPath();
      ctx.arc(hx, hy, 9, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.arc(hx - 3, hy - 3, 2.4, 0, TAU);
      ctx.fill();
    }

    // barrel
    const bg = ctx.createLinearGradient(CX - 18, 0, CX + 18, 0);
    bg.addColorStop(0, "#2b2b4a");
    bg.addColorStop(0.3, "#9aa3d6");
    bg.addColorStop(0.5, "#e8ecff");
    bg.addColorStop(0.75, "#6c74a8");
    bg.addColorStop(1, "#23233f");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 17, GUNY, 34, 92);

    // rainbow bands (cycling)
    for (let i = 0; i < 4; i++) {
      const by = GUNY + 18 + i * 16;
      const bh = hsl(this.time * 90 + i * 55, 100, 60);
      ctx.fillStyle = bh;
      ctx.fillRect(CX - 17, by, 34, 6);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(CX - 17, by, 34, 2);
    }

    // muzzle ring
    const mg = ctx.createLinearGradient(CX - 25, 0, CX + 25, 0);
    mg.addColorStop(0, "#a8741a");
    mg.addColorStop(0.4, "#ffe58a");
    mg.addColorStop(1, "#9c6a14");
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.roundRect(CX - 25, GUNY - 7, 50, 17, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
    // muzzle glow when recoiling
    if (this.recoil > 0) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = hsl(nextHue, 100, 70, this.recoil * 0.8);
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 6, 26, 12, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    // collar
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.roundRect(CX - 28, GUNY + 66, 56, 12, 4);
    ctx.fill();

    // core gem
    const gy = GUNY + 130;
    ctx.globalCompositeOperation = "lighter";
    const cg = ctx.createRadialGradient(CX, gy, 0, CX, gy, 26);
    cg.addColorStop(0, hsl(nextHue, 100, 70, 0.9));
    cg.addColorStop(1, hsl(nextHue, 100, 60, 0));
    ctx.fillStyle = cg;
    ctx.fillRect(CX - 28, gy - 28, 56, 56);
    ctx.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.translate(CX, gy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = hsl(nextHue, 100, 62);
    ctx.fillRect(-9, -9, 18, 18);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(-9, -9, 18, 18);
    ctx.restore();

    // little stars on the body
    ctx.fillStyle = "#ffd75e";
    for (const [sx, sy, r] of [
      [-22, 92, 4],
      [22, 92, 4],
      [0, 152, 3],
    ] as const) {
      ctx.save();
      ctx.translate(CX + sx, GUNY + sy);
      starPath(ctx, r);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawBHGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 16;
    const nextHue = this.queue[this.shotIdx] ?? 265;
    const live = this.state === "playing" && this.ammo > 0;

    // charging singularity floating above the muzzle
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 38 + (1 - e) * 42 + oy + Math.sin(this.time * 3.2) * 2.5;
      if (e < 1) {
        // converging collapse rings while charging
        for (let i = 0; i < 2; i++) {
          const rr = 16 + (1 - e) * (30 + i * 16);
          ctx.strokeStyle = hsl(nextHue + i * 30, 100, 70, (1 - e) * (0.7 - i * 0.25));
          ctx.lineWidth = 2.5 - i * 0.7;
          ctx.beginPath();
          ctx.arc(CX, tipY, rr, this.time * (3 + i * 2), this.time * (3 + i * 2) + Math.PI * 1.5);
          ctx.stroke();
        }
      } else {
        // fully charged: thin photon halo breathing
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.15 * Math.sin(this.time * 5)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(CX, tipY, 17 + Math.sin(this.time * 5) * 1.5, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY);
      drawOrb(ctx, nextHue, 12, this.time, 4.2);
      ctx.restore();
      // infalling sparks spiralling into the charged orb
      if (Math.random() < 0.6) {
        const a = rnd(0, TAU);
        const rr = rnd(22, 38);
        this.spawn(
          CX + Math.cos(a) * rr,
          tipY + Math.sin(a) * rr,
          -Math.cos(a) * 3 - Math.sin(a) * 2,
          -Math.sin(a) * 3 + Math.cos(a) * 2,
          {
            life: rnd(0.25, 0.45),
            size: 1.6,
            h: nextHue + rnd(-20, 30),
            l: 76,
            g: 0,
            d: 0.93,
            ax: CX,
            ay: tipY,
            pull: 5,
          }
        );
      }
    }

    ctx.save();
    ctx.translate(0, oy);

    // cosmic glow behind gun
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 100, 10, CX, GUNY + 100, 130);
    gg.addColorStop(0, hsl(nextHue, 100, 55, 0.3));
    gg.addColorStop(1, hsl(nextHue, 100, 55, 0));
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 140, GUNY - 40, 280, 270);
    ctx.globalCompositeOperation = "source-over";

    // obsidian base
    const bodyG = ctx.createLinearGradient(CX - 50, 0, CX + 50, 0);
    bodyG.addColorStop(0, "#150826");
    bodyG.addColorStop(0.35, "#3d1a72");
    bodyG.addColorStop(0.65, "#2a1258");
    bodyG.addColorStop(1, "#0d0518");
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.moveTo(CX - 24, GUNY + 70);
    ctx.lineTo(CX + 24, GUNY + 70);
    ctx.lineTo(CX + 52, GUNY + 100);
    ctx.quadraticCurveTo(CX + 58, GUNY + 150, CX + 44, GUNY + 165);
    ctx.lineTo(CX - 44, GUNY + 165);
    ctx.quadraticCurveTo(CX - 58, GUNY + 150, CX - 52, GUNY + 100);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hsl(nextHue, 100, 65);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = hsl(nextHue, 100, 60);
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // containment coils
    for (const sx of [-1, 1]) {
      const hx = CX + sx * 40;
      const hy = GUNY + 125;
      ctx.globalCompositeOperation = "lighter";
      const cg2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 20);
      cg2.addColorStop(0, hsl(nextHue + sx * 40, 100, 60, 0.5));
      cg2.addColorStop(1, hsl(nextHue + sx * 40, 100, 60, 0));
      ctx.fillStyle = cg2;
      ctx.fillRect(hx - 20, hy - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.arc(hx, hy, 9, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = hsl(nextHue + sx * 40, 100, 65);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, 9, this.time * 5 * sx, this.time * 5 * sx + Math.PI * 0.7);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(hx, hy, 2, 0, TAU);
      ctx.fill();
    }

    // dark barrel
    const bg = ctx.createLinearGradient(CX - 15, 0, CX + 15, 0);
    bg.addColorStop(0, "#0b0b18");
    bg.addColorStop(0.35, "#343a5e");
    bg.addColorStop(0.55, "#12122a");
    bg.addColorStop(1, "#07070f");
    ctx.fillStyle = bg;
    ctx.fillRect(CX - 15, GUNY, 30, 92);
    ctx.strokeStyle = hsl(nextHue, 90, 55, 0.6);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(CX - 15, GUNY, 30, 92);

    // twin helical energy streams spiralling up into the muzzle
    for (let i = 0; i < 6; i++) {
      const cyc = (this.time * 64 + i * 17) % 92;
      const by = GUNY + 86 - cyc;
      const sway = Math.sin(this.time * 6 + i * 1.1) * 6;
      ctx.fillStyle = hsl(nextHue + i * 12, 100, 62);
      ctx.beginPath();
      ctx.arc(CX - 7 + sway * 0.5, by, 3.4, 0, TAU);
      ctx.arc(CX + 7 - sway * 0.5, by, 3.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.beginPath();
      ctx.arc(CX - 7 + sway * 0.5, by, 1.3, 0, TAU);
      ctx.arc(CX + 7 - sway * 0.5, by, 1.3, 0, TAU);
      ctx.fill();
    }

    // muzzle: grand event-horizon gate with double photon rings
    ctx.save();
    ctx.translate(CX, GUNY - 2);
    ctx.globalCompositeOperation = "lighter";
    const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, 48);
    mg.addColorStop(0, hsl(nextHue, 100, 62, 0.6));
    mg.addColorStop(0.6, hsl(nextHue + 30, 100, 55, 0.25));
    mg.addColorStop(1, hsl(nextHue, 100, 60, 0));
    ctx.fillStyle = mg;
    ctx.fillRect(-48, -34, 96, 68);
    ctx.globalCompositeOperation = "source-over";
    // outer accretion lip
    ctx.strokeStyle = hsl(nextHue - 15, 90, 42);
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(0, 0, 27, 11.5, 0, 0, TAU);
    ctx.stroke();
    // main horizon ring
    ctx.strokeStyle = hsl(nextHue, 100, 62);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 10, 0, 0, TAU);
    ctx.stroke();
    // abyss
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 7.2, 0, 0, TAU);
    ctx.fill();
    // twin photon arcs racing opposite ways
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 21.5, 8.8, 0, this.time * 5, this.time * 5 + Math.PI * 0.75);
    ctx.stroke();
    ctx.strokeStyle = hsl(nextHue + 55, 100, 80, 0.95);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 10, 0, -this.time * 4, -this.time * 4 + Math.PI * 0.9);
    ctx.stroke();
    // doppler hot spot
    const hot = this.time * 4;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(Math.cos(hot) * 24, Math.sin(hot) * 10, 2.2, 0, TAU);
    ctx.fill();
    ctx.restore();

    // recoil flash
    if (this.recoil > 0) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = hsl(nextHue + 40, 100, 75, this.recoil * 0.85);
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 4, 30, 14, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    // collar
    ctx.fillStyle = "#0d0518";
    ctx.beginPath();
    ctx.roundRect(CX - 26, GUNY + 66, 52, 12, 4);
    ctx.fill();
    ctx.strokeStyle = hsl(nextHue, 100, 65);
    ctx.lineWidth = 2;
    ctx.stroke();

    // singularity core
    const gy = GUNY + 130;
    ctx.globalCompositeOperation = "lighter";
    const sg = ctx.createRadialGradient(CX, gy, 0, CX, gy, 30);
    sg.addColorStop(0, hsl(nextHue, 100, 65, 0.7));
    sg.addColorStop(1, hsl(nextHue, 100, 60, 0));
    ctx.fillStyle = sg;
    ctx.fillRect(CX - 32, gy - 32, 64, 64);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(CX, gy, 11, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = hsl(nextHue, 100, 68);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX, gy, 6.5, -this.time * 4, -this.time * 4 + Math.PI * 1.2);
    ctx.stroke();

    // neon diamonds
    ctx.fillStyle = hsl(nextHue, 100, 70);
    for (const [sx, sy, r] of [
      [-22, 92, 4],
      [22, 92, 4],
      [0, 152, 3],
    ] as const) {
      ctx.save();
      ctx.translate(CX + sx, GUNY + sy);
      ctx.rotate(Math.PI / 4 + this.time * 0.8);
      ctx.fillRect(-r, -r, r * 2, r * 2);
      ctx.restore();
    }

    // captured debris orbiting the whole cannon
    for (let q = 0; q < 4; q++) {
      const sa = this.time * (0.9 + q * 0.22) + (q * TAU) / 4;
      const rad = 74 + (q % 2) * 14;
      const ox = CX + Math.cos(sa) * rad;
      const oy2 = GUNY + 110 + Math.sin(sa) * rad * 0.62;
      ctx.fillStyle = q % 2 ? hsl(nextHue + 40, 90, 68, 0.9) : "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(ox, oy2, q % 2 ? 2 : 1.5, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = hsl(nextHue, 90, 60, 0.22);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 110, 74, 46, 0, 0, TAU);
    ctx.stroke();

    ctx.restore();
  }

  drawSharkGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 18;
    const nextHue = this.queue[this.shotIdx] ?? 205;
    const live = this.state === "playing" && this.ammo > 0;
    const jawOpen = 0.22 + this.recoil * 0.78;

    // aqua glow behind gun
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 100, 10, CX, GUNY + 100, 130);
    gg.addColorStop(0, `rgba(40,160,220,${0.28 + this.recoil * 0.25})`);
    gg.addColorStop(1, "rgba(40,160,220,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 140, GUNY - 50, 280, 280);
    ctx.restore();

    ctx.save();
    ctx.translate(0, oy);

    // ---- coral rock base ----
    const rockG = ctx.createLinearGradient(CX - 55, 0, CX + 55, 0);
    rockG.addColorStop(0, "#0d3a52");
    rockG.addColorStop(0.4, "#16607f");
    rockG.addColorStop(0.6, "#12506b");
    rockG.addColorStop(1, "#082a3d");
    ctx.fillStyle = rockG;
    ctx.beginPath();
    ctx.moveTo(CX - 24, GUNY + 70);
    ctx.lineTo(CX + 24, GUNY + 70);
    ctx.lineTo(CX + 52, GUNY + 100);
    ctx.quadraticCurveTo(CX + 58, GUNY + 150, CX + 44, GUNY + 165);
    ctx.lineTo(CX - 44, GUNY + 165);
    ctx.quadraticCurveTo(CX - 58, GUNY + 150, CX - 52, GUNY + 100);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#e8c37a";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // seaweed swaying on the base
    for (const [wx, ww, wh, ph] of [[-46, 7, 42, 0], [-34, 5, 30, 2], [36, 6, 38, 4], [47, 5, 28, 1]] as const) {
      const sway = Math.sin(this.time * 2.2 + ph) * 6;
      ctx.strokeStyle = "#3fae6a";
      ctx.lineWidth = ww;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(CX + wx, GUNY + 162);
      ctx.quadraticCurveTo(CX + wx + sway, GUNY + 162 - wh * 0.6, CX + wx + sway * 1.6, GUNY + 162 - wh);
      ctx.stroke();
      ctx.strokeStyle = "rgba(180,255,210,0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(CX + wx, GUNY + 162);
      ctx.quadraticCurveTo(CX + wx + sway, GUNY + 162 - wh * 0.6, CX + wx + sway * 1.6, GUNY + 162 - wh);
      ctx.stroke();
    }
    // pink coral branches
    ctx.strokeStyle = "#ff7eb0";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    for (const sx of [-1, 1]) {
      const bx = CX + sx * 44;
      const by = GUNY + 158;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + sx * 6, by - 14, bx + sx * 2, by - 24);
      ctx.moveTo(bx + sx * 3, by - 12);
      ctx.quadraticCurveTo(bx + sx * 10, by - 16, bx + sx * 12, by - 22);
      ctx.stroke();
      ctx.fillStyle = "#ffb3cf";
      ctx.beginPath();
      ctx.arc(bx + sx * 2, by - 25, 3, 0, TAU);
      ctx.arc(bx + sx * 12, by - 23, 2.4, 0, TAU);
      ctx.fill();
    }
    // shells on the base
    for (const [sx, sy] of [[-20, 152], [22, 155]] as const) {
      ctx.fillStyle = "#f3d9a8";
      ctx.strokeStyle = "rgba(90,50,20,0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(CX + sx, GUNY + sy, 6, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(150,90,40,0.7)";
      ctx.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(CX + sx, GUNY + sy);
        ctx.lineTo(CX + sx + i * 4, GUNY + sy - 5.4);
        ctx.stroke();
      }
    }

    // ---- shark-skin barrel ----
    const skinG = ctx.createLinearGradient(CX - 18, 0, CX + 18, 0);
    skinG.addColorStop(0, "#274f6b");
    skinG.addColorStop(0.35, "#5e92b5");
    skinG.addColorStop(0.55, "#7fb6d9");
    skinG.addColorStop(1, "#1d3a52");
    ctx.fillStyle = skinG;
    ctx.fillRect(CX - 17, GUNY + 12, 34, 80);
    // gill slits
    ctx.strokeStyle = "rgba(10,30,50,0.75)";
    ctx.lineWidth = 2.4;
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const gy = GUNY + 34 + i * 9;
        ctx.beginPath();
        ctx.moveTo(CX + sx * 8, gy);
        ctx.quadraticCurveTo(CX + sx * 14, gy + 2, CX + sx * 15, gy + 5);
        ctx.stroke();
      }
    }
    // water shine sweeping up the barrel
    for (let i = 0; i < 3; i++) {
      const cyc = (this.time * 60 + i * 30) % 80;
      const by = GUNY + 86 - cyc;
      ctx.fillStyle = "rgba(200,240,255,0.5)";
      ctx.fillRect(CX - 17, by, 34, 3);
    }
    // barnacles
    ctx.fillStyle = "#d8e4ea";
    for (const [bx, by2] of [[-15, 66], [14, 52], [-13, 44]] as const) {
      ctx.beginPath();
      ctx.arc(CX + bx, GUNY + by2, 2.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#8ba3ad";
      ctx.beginPath();
      ctx.arc(CX + bx, GUNY + by2, 1, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#d8e4ea";
    }

    // side fins
    for (const sx of [-1, 1]) {
      ctx.fillStyle = "#3d6f93";
      ctx.strokeStyle = "rgba(8,30,55,0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(CX + sx * 16, GUNY + 60);
      ctx.quadraticCurveTo(CX + sx * 34, GUNY + 66, CX + sx * 40, GUNY + 82);
      ctx.quadraticCurveTo(CX + sx * 28, GUNY + 80, CX + sx * 16, GUNY + 76);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // ---- GIANT JAWS (the muzzle) ----
    // mouth interior (dark, visible when open)
    ctx.fillStyle = "#5e0a1a";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 8, 20, 5 + jawOpen * 13, 0, 0, TAU);
    ctx.fill();

    // upper jaw dome (behind the loaded shark)
    const domeG = ctx.createLinearGradient(0, GUNY - 22, 0, GUNY + 14);
    domeG.addColorStop(0, "#6fa2c4");
    domeG.addColorStop(0.6, "#487a9e");
    domeG.addColorStop(1, "#33597a");
    ctx.fillStyle = domeG;
    ctx.strokeStyle = "rgba(8,30,55,0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 27, GUNY + 14);
    ctx.quadraticCurveTo(CX - 24, GUNY - 12, CX, GUNY - 20);
    ctx.quadraticCurveTo(CX + 24, GUNY - 12, CX + 27, GUNY + 14);
    ctx.quadraticCurveTo(CX, GUNY + 4, CX - 27, GUNY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // dome shine
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 14, GUNY - 10);
    ctx.quadraticCurveTo(CX - 6, GUNY - 16, CX + 4, GUNY - 16.5);
    ctx.stroke();
    // furious eyes
    for (const sx of [-1, 1]) {
      const ex = CX + sx * 15;
      const ey = GUNY - 2;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ex, ey, 4.6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(8,30,55,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = jawOpen > 0.5 ? "#c00f2e" : "#0a1a30";
      ctx.beginPath();
      ctx.arc(ex - sx * 1, ey + 0.5, 2.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(ex - sx * 1.6, ey - 0.2, 0.9, 0, TAU);
      ctx.fill();
      // angry brow
      ctx.strokeStyle = "rgba(8,30,55,0.9)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ex + sx * 5.5, ey - 7.5);
      ctx.lineTo(ex - sx * 4.5, ey - 4.5);
      ctx.stroke();
    }

    // loaded shark leaping out of the jaws
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 40 + (1 - e) * 52 + Math.sin(this.time * 3.4) * 2;
      if (e < 1) {
        ctx.strokeStyle = `rgba(150,225,255,${(1 - e) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, tipY, 13 + (1 - e) * 24, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY);
      ctx.rotate(Math.PI / 2);
      ctx.scale(0.62, 0.62);
      drawShark(ctx, nextHue, 0.3 + Math.sin(this.time * 2.4) * 0.12, this.time, 3.7, 0);
      ctx.restore();
    }

    // upper teeth (hanging down)
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "rgba(8,30,55,0.9)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      const tx = CX - 17 + i * 8.5;
      const edgeY = GUNY + 8 - Math.abs(i - 2) * 1.6;
      ctx.beginPath();
      ctx.moveTo(tx - 3.4, edgeY);
      ctx.lineTo(tx + 3.4, edgeY);
      ctx.lineTo(tx, edgeY + 8.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // lower jaw (snaps open on fire)
    const hingeY = GUNY + 13;
    const tipJawY = hingeY + 6 + jawOpen * 24;
    const jawG = ctx.createLinearGradient(0, hingeY, 0, tipJawY + 8);
    jawG.addColorStop(0, "#e9f4fa");
    jawG.addColorStop(1, "#9fc3d8");
    ctx.fillStyle = jawG;
    ctx.strokeStyle = "rgba(8,30,55,0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 25, hingeY);
    ctx.quadraticCurveTo(CX - 12, tipJawY + 4, CX, tipJawY);
    ctx.quadraticCurveTo(CX + 12, tipJawY + 4, CX + 25, hingeY);
    ctx.quadraticCurveTo(CX, hingeY + 9, CX - 25, hingeY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // lower teeth (pointing up)
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 4; i++) {
      const f = i / 3;
      const tx = CX - 15 + f * 30;
      const ty = hingeY + 5 + Math.sin(f * Math.PI) * jawOpen * 12;
      ctx.beginPath();
      ctx.moveTo(tx - 3, ty + 4);
      ctx.lineTo(tx + 3, ty + 4);
      ctx.lineTo(tx, ty - 4.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // recoil water flash in the mouth
    if (this.recoil > 0.15) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(160,225,255,${this.recoil * 0.75})`;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY + 8, 24, 8 + jawOpen * 12, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    // rope collar
    ctx.strokeStyle = "#d9b36a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(CX - 27, GUNY + 68);
    ctx.lineTo(CX + 27, GUNY + 68);
    ctx.stroke();
    ctx.strokeStyle = "rgba(90,55,20,0.8)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      const rx = CX - 24 + i * 6;
      ctx.beginPath();
      ctx.moveTo(rx, GUNY + 65);
      ctx.lineTo(rx + 3, GUNY + 71);
      ctx.stroke();
    }

    // pearl in a clam (the core)
    const py = GUNY + 122;
    ctx.globalCompositeOperation = "lighter";
    const pg = ctx.createRadialGradient(CX, py, 0, CX, py, 30);
    pg.addColorStop(0, "rgba(190,240,255,0.65)");
    pg.addColorStop(1, "rgba(190,240,255,0)");
    ctx.fillStyle = pg;
    ctx.fillRect(CX - 32, py - 32, 64, 64);
    ctx.globalCompositeOperation = "source-over";
    // clam bottom
    ctx.fillStyle = "#c9a06a";
    ctx.strokeStyle = "rgba(70,40,15,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(CX, py + 7, 17, 8, 0, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // pearl
    const pearlG = ctx.createRadialGradient(CX - 3, py - 4, 1, CX, py, 10);
    pearlG.addColorStop(0, "#ffffff");
    pearlG.addColorStop(0.6, "#d8f0ff");
    pearlG.addColorStop(1, "#8fc4e8");
    ctx.fillStyle = pearlG;
    ctx.beginPath();
    ctx.arc(CX, py - 1 + Math.sin(this.time * 2.5) * 1.5, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(CX - 2.5, py - 4 + Math.sin(this.time * 2.5) * 1.5, 2.2, 0, TAU);
    ctx.fill();
    // clam top (slightly open, animated)
    const clamOpen = 0.5 + Math.sin(this.time * 1.8) * 0.12;
    ctx.fillStyle = "#a8814f";
    ctx.beginPath();
    ctx.ellipse(CX, py - 9 - clamOpen * 4, 15, 6, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawBambooGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 20;
    const nextHue = this.queue[this.shotIdx] ?? 38;
    const live = this.state === "playing" && this.ammo > 0;

    // warm glow behind the cannon
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 90, 10, CX, GUNY + 90, 135);
    gg.addColorStop(0, `rgba(255,150,60,${0.22 + this.recoil * 0.3})`);
    gg.addColorStop(1, "rgba(255,150,60,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 140, GUNY - 60, 280, 280);
    ctx.restore();

    ctx.save();
    ctx.translate(0, oy);

    // ---- wooden carriage (A-frame stand) ----
    ctx.fillStyle = "#5a3a1c";
    ctx.strokeStyle = "rgba(30,16,6,0.9)";
    ctx.lineWidth = 2.5;
    for (const sx of [-1, 1]) {
      // leg
      ctx.save();
      ctx.translate(CX + sx * 30, GUNY + 118);
      ctx.rotate(sx * 0.42);
      ctx.beginPath();
      ctx.roundRect(-8, -10, 16, 62, 6);
      ctx.fill();
      ctx.stroke();
      // wood grain
      ctx.strokeStyle = "rgba(40,22,8,0.6)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-2, -4);
      ctx.lineTo(-2, 44);
      ctx.moveTo(3, -4);
      ctx.lineTo(3, 44);
      ctx.stroke();
      ctx.strokeStyle = "rgba(30,16,6,0.9)";
      ctx.lineWidth = 2.5;
      ctx.restore();
      // rattan lashing where leg meets the tube
      ctx.fillStyle = "#a0713a";
      ctx.beginPath();
      ctx.roundRect(CX + sx * 22 - 7, GUNY + 78, 14, 16, 4);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,35,12,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.strokeStyle = "rgba(70,42,14,0.8)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(CX + sx * 22 - 7, GUNY + 82 + i * 5);
        ctx.lineTo(CX + sx * 22 + 7, GUNY + 82 + i * 5);
        ctx.stroke();
      }
    }
    // base beam
    const beamG = ctx.createLinearGradient(0, GUNY + 148, 0, GUNY + 166);
    beamG.addColorStop(0, "#7a5228");
    beamG.addColorStop(1, "#4a2f14");
    ctx.fillStyle = beamG;
    ctx.strokeStyle = "rgba(30,16,6,0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(CX - 62, GUNY + 148, 124, 17, 7);
    ctx.fill();
    ctx.stroke();
    // brass studs on the beam
    for (const bx of [-48, -24, 0, 24, 48]) {
      ctx.fillStyle = "#f0d080";
      ctx.beginPath();
      ctx.arc(CX + bx, GUNY + 156.5, 2.8, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(60,35,10,0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // ---- giant bamboo tube ----
    const tubeG = ctx.createLinearGradient(CX - 22, 0, CX + 22, 0);
    tubeG.addColorStop(0, "#3f7a2c");
    tubeG.addColorStop(0.3, "#7cc24f");
    tubeG.addColorStop(0.5, "#a8e07e");
    tubeG.addColorStop(0.72, "#5da24a");
    tubeG.addColorStop(1, "#2c5a1e");
    ctx.fillStyle = tubeG;
    ctx.fillRect(CX - 21, GUNY + 6, 42, 88);
    // vertical fibre streaks
    ctx.strokeStyle = "rgba(30,70,18,0.45)";
    ctx.lineWidth = 1.4;
    for (const fx of [-13, -5, 5, 13]) {
      ctx.beginPath();
      ctx.moveTo(CX + fx, GUNY + 10);
      ctx.quadraticCurveTo(CX + fx + 1.5, GUNY + 50, CX + fx, GUNY + 90);
      ctx.stroke();
    }
    // shine
    ctx.fillStyle = "rgba(255,255,255,0.28)";
    ctx.fillRect(CX - 9, GUNY + 10, 5, 80);
    // leaf sprig painted on the tube
    ctx.fillStyle = "#2f8f3a";
    ctx.strokeStyle = "rgba(15,60,20,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(CX - 11, GUNY + 44, 6, 2.6, -0.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(CX + 11, GUNY + 62, 6, 2.6, 0.5, 0, TAU);
    ctx.fill();
    ctx.stroke();

    // node rings (bamboo joints) with rattan binding
    for (const ny of [GUNY + 24, GUNY + 56, GUNY + 88]) {
      ctx.fillStyle = "#d9e8a8";
      ctx.fillRect(CX - 21, ny - 2, 42, 4);
      ctx.fillStyle = "#8a5f2e";
      ctx.fillRect(CX - 24, ny - 7, 48, 11);
      ctx.strokeStyle = "rgba(50,28,8,0.9)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(CX - 24, ny - 7, 48, 11);
      // rope X stitches
      ctx.strokeStyle = "rgba(60,36,12,0.85)";
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 6; i++) {
        const rx = CX - 20 + i * 8;
        ctx.beginPath();
        ctx.moveTo(rx, ny - 7);
        ctx.lineTo(rx + 4, ny + 4);
        ctx.moveTo(rx + 4, ny - 7);
        ctx.lineTo(rx, ny + 4);
        ctx.stroke();
      }
    }

    // fuse hole on the side with a live spark
    ctx.fillStyle = "#1a0e04";
    ctx.beginPath();
    ctx.arc(CX + 21, GUNY + 70, 4, 0, TAU);
    ctx.fill();
    const spark = 0.6 + 0.4 * Math.sin(this.time * 23);
    ctx.fillStyle = `rgba(255,${140 + Math.round(80 * spark)},40,${0.5 + 0.4 * spark})`;
    ctx.beginPath();
    ctx.arc(CX + 21, GUNY + 70, 2.2 * spark + 0.8, 0, TAU);
    ctx.fill();
    if (Math.random() < 0.3) {
      this.spawn(CX + 24, GUNY + 68, rnd(0.5, 1.8), rnd(-1.5, -0.3), {
        life: rnd(0.3, 0.6),
        size: 1.3,
        h: rnd(25, 45),
        s: 100,
        l: 65,
        g: -0.01,
        d: 0.95,
      });
    }

    // ---- muzzle: open bamboo mouth ----
    // lip ring
    ctx.fillStyle = "#c9e79a";
    ctx.strokeStyle = "rgba(35,70,20,0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 2, 25, 11, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    // dark hollow
    ctx.fillStyle = "#120a04";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 2, 18, 7.5, 0, 0, TAU);
    ctx.fill();
    // ember glow inside after firing
    if (this.recoil > 0.05) {
      ctx.globalCompositeOperation = "lighter";
      const eg = ctx.createRadialGradient(CX, GUNY + 2, 0, CX, GUNY + 2, 22);
      eg.addColorStop(0, `rgba(255,180,70,${this.recoil * 0.9})`);
      eg.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY + 2, 24, 12, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    // loaded stone hovering over the mouth
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 30 + (1 - e) * 40 + Math.sin(this.time * 3) * 2;
      if (e < 1) {
        ctx.strokeStyle = `rgba(255,200,120,${(1 - e) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, tipY, 15 + (1 - e) * 22, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY);
      drawStone(ctx, nextHue, 13, this.time, 2.2, 0);
      ctx.restore();
    }

    // carved tribal band on the base beam
    ctx.fillStyle = "#f0d080";
    for (let i = 0; i < 7; i++) {
      const tx = CX - 45 + i * 15;
      ctx.save();
      ctx.translate(tx, GUNY + 156.5);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-2.2, -2.2, 4.4, 4.4);
      ctx.restore();
    }

    ctx.restore();
  }

  drawSoakerGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 14;
    const nextHue = this.queue[this.shotIdx] ?? 200;
    const live = this.state === "playing" && this.ammo > 0;

    // bubbly glow behind the gun
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 100, 10, CX, GUNY + 100, 130);
    gg.addColorStop(0, `rgba(70,200,255,${0.24 + this.recoil * 0.25})`);
    gg.addColorStop(1, "rgba(70,200,255,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 140, GUNY - 50, 280, 280);
    ctx.restore();

    ctx.save();
    ctx.translate(0, oy);

    // ---- chunky toy body ----
    const bodyG = ctx.createLinearGradient(CX - 50, 0, CX + 50, 0);
    bodyG.addColorStop(0, "#e06a00");
    bodyG.addColorStop(0.4, "#ff9d2e");
    bodyG.addColorStop(0.6, "#ffc44d");
    bodyG.addColorStop(1, "#b34d00");
    ctx.fillStyle = bodyG;
    ctx.strokeStyle = "#7a3200";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 24, GUNY + 70);
    ctx.lineTo(CX + 24, GUNY + 70);
    ctx.lineTo(CX + 52, GUNY + 100);
    ctx.quadraticCurveTo(CX + 58, GUNY + 150, CX + 44, GUNY + 165);
    ctx.lineTo(CX - 44, GUNY + 165);
    ctx.quadraticCurveTo(CX - 58, GUNY + 150, CX - 52, GUNY + 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // body shine
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.beginPath();
    ctx.roundRect(CX - 38, GUNY + 104, 10, 44, 5);
    ctx.fill();

    // wave decal sticker
    ctx.save();
    ctx.beginPath();
    ctx.rect(CX - 34, GUNY + 128, 68, 22);
    ctx.clip();
    ctx.fillStyle = "#2ea8dd";
    ctx.beginPath();
    ctx.moveTo(CX - 34, GUNY + 150);
    for (let x = -34; x <= 34; x += 4) {
      ctx.lineTo(CX + x, GUNY + 140 + Math.sin((x + this.time * 30) * 0.25) * 3);
    }
    ctx.lineTo(CX + 34, GUNY + 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.moveTo(CX - 34, GUNY + 150);
    for (let x = -34; x <= 34; x += 4) {
      ctx.lineTo(CX + x, GUNY + 145 + Math.sin((x + this.time * 30) * 0.25 + 1) * 2.5);
    }
    ctx.lineTo(CX + 34, GUNY + 150);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#0d5a80";
    ctx.lineWidth = 2;
    ctx.strokeRect(CX - 34, GUNY + 128, 68, 22);
    // lightning bolt logo
    ctx.fillStyle = "#ffe93e";
    ctx.strokeStyle = "#7a5200";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(CX + 2, GUNY + 78);
    ctx.lineTo(CX - 8, GUNY + 96);
    ctx.lineTo(CX - 1, GUNY + 96);
    ctx.lineTo(CX - 4, GUNY + 106);
    ctx.lineTo(CX + 7, GUNY + 88);
    ctx.lineTo(CX, GUNY + 88);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // ---- translucent water tank ----
    const tankX = CX - 32;
    const tankY = GUNY + 26;
    const tankW = 64;
    const tankH = 34;
    ctx.fillStyle = "rgba(190,235,255,0.35)";
    ctx.strokeStyle = "#0d5a80";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(tankX, tankY, tankW, tankH, 9);
    ctx.fill();
    ctx.stroke();
    // water inside (level bobs)
    const wl = tankY + 9 + Math.sin(this.time * 2.6) * 1.6;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(tankX + 2, tankY + 2, tankW - 4, tankH - 4, 7);
    ctx.clip();
    const waterG = ctx.createLinearGradient(0, wl, 0, tankY + tankH);
    waterG.addColorStop(0, "rgba(90,210,255,0.9)");
    waterG.addColorStop(1, "rgba(20,140,220,0.95)");
    ctx.fillStyle = waterG;
    ctx.beginPath();
    ctx.moveTo(tankX, tankY + tankH);
    ctx.lineTo(tankX, wl);
    for (let x = 0; x <= tankW; x += 4) {
      ctx.lineTo(tankX + x, wl + Math.sin((x + this.time * 40) * 0.2) * 1.8);
    }
    ctx.lineTo(tankX + tankW, tankY + tankH);
    ctx.closePath();
    ctx.fill();
    // bubbles in the tank
    for (let i = 0; i < 3; i++) {
      const bph = (this.time * 0.5 + i * 0.37) % 1;
      const bx2 = tankX + 12 + i * 20 + Math.sin(this.time * 3 + i * 4) * 3;
      const by2 = tankY + tankH - 5 - bph * (tankH - 14);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx2, by2, 1.6 + i * 0.5, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    // tank shine
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.roundRect(tankX + 6, tankY + 5, 6, tankH - 10, 3);
    ctx.fill();
    // tank cap
    ctx.fillStyle = "#ffd23e";
    ctx.strokeStyle = "#7a5200";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX + 22, tankY - 9, 18, 12, 3);
    ctx.fill();
    ctx.stroke();

    // ---- pump handle (slides when firing) ----
    const pumpY = GUNY + 8 + this.recoil * 10;
    ctx.fillStyle = "#2ea8dd";
    ctx.strokeStyle = "#0d5a80";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(CX - 34, pumpY, 20, 16, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(CX - 30, pumpY + 3, 12, 3);
    // pump rod
    ctx.fillStyle = "#d7ecf7";
    ctx.fillRect(CX - 16, pumpY + 5, 16, 6);

    // ---- nozzle cone ----
    const nozG = ctx.createLinearGradient(CX - 14, 0, CX + 14, 0);
    nozG.addColorStop(0, "#c25e00");
    nozG.addColorStop(0.5, "#ffd23e");
    nozG.addColorStop(1, "#c25e00");
    ctx.fillStyle = nozG;
    ctx.strokeStyle = "#7a3200";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 13, GUNY + 26);
    ctx.lineTo(CX - 7, GUNY - 6);
    ctx.lineTo(CX + 7, GUNY - 6);
    ctx.lineTo(CX + 13, GUNY + 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // nozzle tip ring
    ctx.fillStyle = "#ff5a5a";
    ctx.beginPath();
    ctx.roundRect(CX - 10, GUNY - 14, 20, 10, 4);
    ctx.fill();
    ctx.strokeStyle = "#7a1010";
    ctx.lineWidth = 2;
    ctx.stroke();
    // water glint at the tip
    ctx.fillStyle = "rgba(150,225,255,0.9)";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 9, 5.5, 3, 0, 0, TAU);
    ctx.fill();
    // recoil spray flash
    if (this.recoil > 0.15) {
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(150,220,255,${this.recoil * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 12, 20, 12, 0, 0, TAU);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    // loaded water blob jiggling over the nozzle
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 42 + (1 - e) * 40 + Math.sin(this.time * 3.4) * 2;
      if (e < 1) {
        ctx.strokeStyle = `rgba(150,225,255,${(1 - e) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, tipY, 14 + (1 - e) * 22, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY);
      drawDrop(ctx, nextHue, 11.5, this.time, 5.1, 0);
      ctx.restore();
    }

    // trigger guard + trigger
    ctx.strokeStyle = "#7a3200";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CX - 40, GUNY + 118, 12, -0.4, Math.PI + 0.4);
    ctx.stroke();
    ctx.fillStyle = "#ffe93e";
    ctx.strokeStyle = "#7a5200";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX - 44, GUNY + 110 + this.recoil * 3, 8, 14, 3);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawRainbowGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 14;
    const flow = this.time * 70;
    const live = this.state === "playing" && this.ammo > 0;

    // prismatic aura behind the cannon
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const hue = (flow + i * 120) % 360;
      const gg = ctx.createRadialGradient(CX, GUNY + 100, 10, CX, GUNY + 100, 130 - i * 22);
      gg.addColorStop(0, hsl(hue, 100, 60, 0.16 + this.recoil * 0.12));
      gg.addColorStop(1, hsl(hue, 100, 60, 0));
      ctx.fillStyle = gg;
      ctx.fillRect(CX - 140, GUNY - 50, 280, 280);
    }
    ctx.restore();

    // loaded laser bolt hovering over the muzzle
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 46 + (1 - e) * 44 + Math.sin(this.time * 3.6) * 2;
      if (e < 1) {
        ctx.strokeStyle = hsl((flow + 180) % 360, 100, 70, (1 - e) * 0.8);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, tipY, 13 + (1 - e) * 24, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY + oy * 0.4);
      ctx.rotate(Math.PI / 2);
      drawRainbowBolt(ctx, this.time, 7.7, 0, 0.62);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(0, oy);

    // ---- chrome pedestal ----
    const pedG = ctx.createLinearGradient(CX - 50, 0, CX + 50, 0);
    pedG.addColorStop(0, "#3a3f66");
    pedG.addColorStop(0.35, "#aab4e8");
    pedG.addColorStop(0.55, "#eef1ff");
    pedG.addColorStop(1, "#2c3050");
    ctx.fillStyle = pedG;
    ctx.strokeStyle = "#10122b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 24, GUNY + 70);
    ctx.lineTo(CX + 24, GUNY + 70);
    ctx.lineTo(CX + 52, GUNY + 100);
    ctx.quadraticCurveTo(CX + 58, GUNY + 150, CX + 44, GUNY + 165);
    ctx.lineTo(CX - 44, GUNY + 165);
    ctx.quadraticCurveTo(CX - 58, GUNY + 150, CX - 52, GUNY + 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // spectrum trim line around the pedestal
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = hsl(flow + i * 45, 100, 62, 0.9);
      ctx.beginPath();
      ctx.arc(CX, GUNY + 128, 40 - i * 0.4, Math.PI * (0.15 + i * 0.0875), Math.PI * (0.15 + (i + 1) * 0.0875));
      ctx.stroke();
    }

    // ---- giant crystal prism core ----
    const py = GUNY + 122;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const pg = ctx.createRadialGradient(CX, py, 0, CX, py, 44);
    pg.addColorStop(0, hsl(flow % 360, 100, 65, 0.5));
    pg.addColorStop(1, hsl(flow % 360, 100, 60, 0));
    ctx.fillStyle = pg;
    ctx.fillRect(CX - 46, py - 46, 92, 92);
    ctx.restore();
    // prism triangle (slowly breathing)
    const breathe = 1 + Math.sin(this.time * 2.4) * 0.04;
    ctx.save();
    ctx.translate(CX, py);
    ctx.scale(breathe, breathe);
    const prism = ctx.createLinearGradient(-16, 0, 16, 0);
    prism.addColorStop(0, hsl(flow % 360, 90, 65));
    prism.addColorStop(0.5, "#ffffff");
    prism.addColorStop(1, hsl((flow + 160) % 360, 90, 62));
    ctx.fillStyle = prism;
    ctx.strokeStyle = "rgba(255,255,255,0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -19);
    ctx.lineTo(16, 10);
    ctx.lineTo(-16, 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // inner facet light
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(7, 6);
    ctx.lineTo(-7, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ---- glass laser barrel with flowing spectrum ----
    // glass tube
    ctx.fillStyle = "rgba(200,225,255,0.22)";
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX - 16, GUNY + 2, 32, 66, 8);
    ctx.fill();
    ctx.stroke();
    // flowing spectrum inside
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(CX - 14, GUNY + 4, 28, 62, 6);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      const cyc = (this.time * 90 + i * 19) % 78;
      const by = GUNY + 62 - cyc;
      ctx.fillStyle = hsl((this.time * 130 + i * 72) % 360, 100, 60, 0.95);
      ctx.fillRect(CX - 14, by, 28, 7);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillRect(CX - 14, by, 28, 2);
    }
    ctx.restore();
    // tube shine
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(CX - 12, GUNY + 8, 4, 54);

    // focusing coil rings around the barrel
    for (let i = 0; i < 3; i++) {
      const ry = GUNY + 16 + i * 20;
      const hue = (flow + i * 120) % 360;
      ctx.strokeStyle = hsl(hue, 100, 62, 0.95);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(CX, ry, 22, 7, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(CX, ry, 18, 5.4, 0, this.time * 3 + i * 2, this.time * 3 + i * 2 + Math.PI * 0.9);
      ctx.stroke();
    }

    // side prism pods
    for (const sx of [-1, 1]) {
      const hx = CX + sx * 40;
      const hy = GUNY + 84;
      const hue = (flow + (sx > 0 ? 130 : 250)) % 360;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const pod = ctx.createRadialGradient(hx, hy, 0, hx, hy, 20);
      pod.addColorStop(0, hsl(hue, 100, 62, 0.55));
      pod.addColorStop(1, hsl(hue, 100, 60, 0));
      ctx.fillStyle = pod;
      ctx.fillRect(hx - 20, hy - 20, 40, 40);
      ctx.restore();
      // little diamond crystal
      ctx.save();
      ctx.translate(hx, hy + Math.sin(this.time * 3 + sx) * 1.5);
      ctx.rotate(Math.PI / 4);
      const dg2 = ctx.createLinearGradient(-7, -7, 7, 7);
      dg2.addColorStop(0, "#fff");
      dg2.addColorStop(0.5, hsl(hue, 100, 68));
      dg2.addColorStop(1, hsl((hue + 60) % 360, 100, 60));
      ctx.fillStyle = dg2;
      ctx.fillRect(-7, -7, 14, 14);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -7, 14, 14);
      ctx.restore();
    }

    // ---- muzzle: prism emitter ring ----
    ctx.save();
    ctx.translate(CX, GUNY - 2);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, 42);
    mg.addColorStop(0, hsl(flow % 360, 100, 65, 0.6));
    mg.addColorStop(1, hsl(flow % 360, 100, 60, 0));
    ctx.fillStyle = mg;
    ctx.fillRect(-42, -30, 84, 60);
    ctx.restore();
    // spectrum emitter ring (segmented)
    for (let i = 0; i < 12; i++) {
      ctx.strokeStyle = hsl((this.time * 90 + i * 30) % 360, 100, 64, 0.95);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 10, 0, (i * TAU) / 12, ((i + 0.85) * TAU) / 12);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 7.6, 0, 0, TAU);
    ctx.stroke();
    // bright aperture
    const ap = ctx.createRadialGradient(0, 0, 0, 0, 0, 17);
    ap.addColorStop(0, "#ffffff");
    ap.addColorStop(0.6, hsl((flow + 40) % 360, 100, 72));
    ap.addColorStop(1, "rgba(20,10,40,0.9)");
    ctx.fillStyle = ap;
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 6.6, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    // recoil flash
    if (this.recoil > 0.12) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = hsl((flow + 60) % 360, 100, 72, this.recoil * 0.7);
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 6, 30, 14, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,255,${this.recoil * 0.7})`;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 6, 16, 8, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawBazookaGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 22;
    const nextHue = this.queue[this.shotIdx] ?? 45;
    const live = this.state === "playing" && this.ammo > 0;

    // hot battlefield glow behind the launcher
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 90, 10, CX, GUNY + 90, 140);
    gg.addColorStop(0, `rgba(255,140,50,${0.2 + this.recoil * 0.35})`);
    gg.addColorStop(1, "rgba(255,140,50,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 140, GUNY - 60, 280, 280);
    ctx.restore();

    ctx.save();
    ctx.translate(0, oy);

    // ground shadow + blast scorch that deepens as you fire
    ctx.fillStyle = "rgba(0,0,0,0.42)";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 168, 74, 10, 0, 0, TAU);
    ctx.fill();
    const scorchA = 0.25 + this.cannonPulse * 0.45;
    const scorch = ctx.createRadialGradient(CX, GUNY + 160, 4, CX, GUNY + 160, 66);
    scorch.addColorStop(0, `rgba(12,8,5,${scorchA})`);
    scorch.addColorStop(0.6, `rgba(20,14,8,${scorchA * 0.6})`);
    scorch.addColorStop(1, "rgba(25,18,10,0)");
    ctx.fillStyle = scorch;
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 160, 66, 12, 0, 0, TAU);
    ctx.fill();
    // ammo crate with spare shells (left of the mount)
    ctx.save();
    ctx.translate(CX - 88, GUNY + 148);
    ctx.fillStyle = "#6b4a22";
    ctx.strokeStyle = "rgba(28,16,6,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, -22, 44, 30, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(40,24,8,0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-22, -12);
    ctx.lineTo(22, -12);
    ctx.moveTo(-22, -2);
    ctx.lineTo(22, -2);
    ctx.stroke();
    ctx.fillStyle = "rgba(240,235,210,0.8)";
    ctx.font = "700 7px Rubik, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("60MM", 0, 3);
    for (let i = 0; i < 3; i++) {
      const sx = -12 + i * 12;
      ctx.fillStyle = "#4c5a26";
      ctx.strokeStyle = "rgba(15,17,8,0.9)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(sx - 4, -34, 8, 14, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#b5651d";
      ctx.beginPath();
      ctx.moveTo(sx - 4, -34);
      ctx.lineTo(sx, -39);
      ctx.lineTo(sx + 4, -34);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // ---- tripod mount ----
    ctx.fillStyle = "#3a3a40";
    ctx.strokeStyle = "rgba(12,12,14,0.9)";
    ctx.lineWidth = 2.5;
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.translate(CX + sx * 26, GUNY + 122);
      ctx.rotate(sx * 0.5);
      ctx.beginPath();
      ctx.roundRect(-7, -8, 14, 60, 6);
      ctx.fill();
      ctx.stroke();
      // leg ridges
      ctx.strokeStyle = "rgba(15,15,18,0.7)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-7, 4 + i * 11);
        ctx.lineTo(7, 4 + i * 11);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(12,12,14,0.9)";
      ctx.lineWidth = 2.5;
      ctx.restore();
      // pivot joint
      ctx.fillStyle = "#5a5a64";
      ctx.beginPath();
      ctx.arc(CX + sx * 20, GUNY + 84, 6, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(12,12,14,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#c8c8d2";
      ctx.beginPath();
      ctx.arc(CX + sx * 20, GUNY + 84, 2, 0, TAU);
      ctx.fill();
    }
    // base plate
    const plateG = ctx.createLinearGradient(0, GUNY + 150, 0, GUNY + 166);
    plateG.addColorStop(0, "#565656");
    plateG.addColorStop(1, "#2c2c30");
    ctx.fillStyle = plateG;
    ctx.strokeStyle = "rgba(12,12,14,0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(CX - 58, GUNY + 150, 116, 15, 6);
    ctx.fill();
    ctx.stroke();
    // hazard chevrons on the plate
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 ? "#1c1c14" : "#e8c832";
      ctx.save();
      ctx.beginPath();
      ctx.rect(CX - 52 + i * 15, GUNY + 152, 15, 11);
      ctx.clip();
      ctx.translate(CX - 52 + i * 15 + 7.5, GUNY + 157.5);
      ctx.rotate(0.5);
      ctx.fillRect(-9, -3, 18, 6);
      ctx.restore();
    }

    // ---- fat olive launch tube ----
    const tubeG = ctx.createLinearGradient(CX - 24, 0, CX + 24, 0);
    tubeG.addColorStop(0, "#33391e");
    tubeG.addColorStop(0.3, "#6b7a38");
    tubeG.addColorStop(0.5, "#9aa856");
    tubeG.addColorStop(0.72, "#4c5a26");
    tubeG.addColorStop(1, "#232817");
    ctx.fillStyle = tubeG;
    ctx.strokeStyle = "rgba(15,17,8,0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(CX - 22, GUNY + 4, 44, 92, 6);
    ctx.fill();
    ctx.stroke();
    // tube shine
    ctx.fillStyle = "rgba(255,255,225,0.28)";
    ctx.fillRect(CX - 12, GUNY + 10, 6, 80);
    // cooling vents
    ctx.fillStyle = "rgba(12,14,6,0.85)";
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.roundRect(CX - 16, GUNY + 30 + i * 12, 9, 5, 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(CX + 7, GUNY + 30 + i * 12, 9, 5, 2);
      ctx.fill();
    }
    // white stencil star + text
    ctx.save();
    ctx.translate(CX, GUNY + 78);
    starPath(ctx, 9);
    ctx.fillStyle = "rgba(240,240,215,0.92)";
    ctx.fill();
    ctx.strokeStyle = "rgba(20,22,10,0.8)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(240,240,215,0.75)";
    ctx.font = "700 7px Rubik, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("M-9A1", CX, GUNY + 56);
    // red warning band
    ctx.fillStyle = "#c0272d";
    ctx.fillRect(CX - 22, GUNY + 40, 44, 6);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(CX - 22, GUNY + 40, 44, 2);

    // iron sights
    ctx.fillStyle = "#22242a";
    ctx.strokeStyle = "rgba(10,10,12,0.9)";
    ctx.lineWidth = 1.6;
    // rear sight ring
    ctx.beginPath();
    ctx.arc(CX - 26, GUNY + 34, 5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#9be86a";
    ctx.beginPath();
    ctx.arc(CX - 26, GUNY + 34, 1.6, 0, TAU);
    ctx.fill();
    // front post
    ctx.fillStyle = "#22242a";
    ctx.fillRect(CX + 21, GUNY + 18, 4, 14);
    ctx.fillStyle = "#ff5a4a";
    ctx.beginPath();
    ctx.arc(CX + 23, GUNY + 16, 2.2, 0, TAU);
    ctx.fill();

    // pistol grip + trigger
    ctx.fillStyle = "#4a2f18";
    ctx.strokeStyle = "rgba(20,12,4,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX + 24, GUNY + 66, 12, 30, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(30,18,6,0.7)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + 25, GUNY + 74 + i * 7);
      ctx.lineTo(CX + 35, GUNY + 74 + i * 7);
      ctx.stroke();
    }
    ctx.strokeStyle = "#1c1c20";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(CX + 18, GUNY + 62, 9, -0.3, Math.PI + 0.3);
    ctx.stroke();
    ctx.fillStyle = "#c8c8d2";
    ctx.fillRect(CX + 15, GUNY + 56 + this.recoil * 3, 4, 10);

    // ---- muzzle: flared blast bell ----
    ctx.fillStyle = "#3d4525";
    ctx.strokeStyle = "rgba(15,17,8,0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 22, GUNY + 8);
    ctx.lineTo(CX - 28, GUNY - 6);
    ctx.lineTo(CX + 28, GUNY - 6);
    ctx.lineTo(CX + 22, GUNY + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // muzzle rim
    ctx.fillStyle = "#20240f";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 6, 28, 10, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#9aa856";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // dark bore with carbon scoring
    ctx.fillStyle = "#0a0a08";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 6, 20, 6.8, 0, 0, TAU);
    ctx.fill();
    // carbon scoring ring around the muzzle (wears with heat)
    ctx.strokeStyle = `rgba(12,10,8,${0.5 + this.recoil * 0.4})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 6, 24, 8.6, 0, 0, TAU);
    ctx.stroke();
    // layered heat: white core -> orange -> dull red rim, cooling with recoil
    if (this.recoil > 0.04) {
      const heat = this.recoil;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const eg = ctx.createRadialGradient(CX, GUNY - 6, 0, CX, GUNY - 6, 26);
      eg.addColorStop(0, `rgba(255,245,220,${heat * 0.95})`);
      eg.addColorStop(0.4, `rgba(255,190,90,${heat * 0.85})`);
      eg.addColorStop(0.75, `rgba(255,120,35,${heat * 0.5})`);
      eg.addColorStop(1, "rgba(200,60,15,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 6, 24, 10, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      // glowing muzzle rim while hot
      ctx.strokeStyle = `rgba(255,${140 + Math.round(heat * 60)},70,${heat * 0.9})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 6, 21, 7.4, 0, 0, TAU);
      ctx.stroke();
    }
    // heat smoke wisps + sparks curling off the muzzle
    if (Math.random() < 0.3 + this.recoil * 0.5) {
      if (Math.random() < 0.55) {
        this.spawnSmoke(CX + rnd(-12, 12), GUNY - 12, rnd(-8, 8), rnd(-30, -12), rnd(7, 12), rnd(0.9, 1.6), 0.55);
      } else {
        this.spawn(CX + rnd(-14, 14), GUNY - 10, rnd(-0.6, 0.6), rnd(-1.8, -0.5), {
          life: rnd(0.3, 0.6),
          size: 1.4,
          h: rnd(25, 50),
          s: 100,
          l: 65,
          g: -0.01,
          d: 0.95,
        });
      }
    }

    // loaded shell hovering over the muzzle
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 44 + (1 - e) * 46 + Math.sin(this.time * 3.1) * 2;
      if (e < 1) {
        ctx.strokeStyle = `rgba(255,200,110,${(1 - e) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, tipY, 15 + (1 - e) * 22, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY);
      ctx.rotate(Math.PI / 2);
      ctx.scale(0.72, 0.72);
      drawBazookaShell(ctx, nextHue, this.time, 3.3, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  drawRpgGun() {
    const ctx = this.ctx;
    const oy = this.recoil * 20;
    const nextHue = this.queue[this.shotIdx] ?? 30;
    const live = this.state === "playing" && this.ammo > 0;

    // dusty combat glow behind the launcher
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(CX, GUNY + 90, 10, CX, GUNY + 90, 135);
    gg.addColorStop(0, `rgba(255,160,70,${0.2 + this.recoil * 0.32})`);
    gg.addColorStop(1, "rgba(255,160,70,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(CX - 140, GUNY - 60, 280, 280);
    ctx.restore();

    ctx.save();
    ctx.translate(0, oy);

    // ground shadow + dust scorch
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 164, 66, 9, 0, 0, TAU);
    ctx.fill();
    const scorchA = 0.2 + this.cannonPulse * 0.4;
    const scorch = ctx.createRadialGradient(CX, GUNY + 156, 4, CX, GUNY + 156, 60);
    scorch.addColorStop(0, `rgba(15,10,6,${scorchA})`);
    scorch.addColorStop(1, "rgba(25,18,10,0)");
    ctx.fillStyle = scorch;
    ctx.beginPath();
    ctx.ellipse(CX, GUNY + 156, 60, 11, 0, 0, TAU);
    ctx.fill();
    // grenade crate with fat warheads (right of the mount)
    ctx.save();
    ctx.translate(CX + 86, GUNY + 148);
    ctx.fillStyle = "#5a4020";
    ctx.strokeStyle = "rgba(26,15,6,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-20, -20, 40, 28, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(38,22,8,0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-20, -10);
    ctx.lineTo(20, -10);
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();
    ctx.fillStyle = "rgba(240,235,210,0.8)";
    ctx.font = "700 6px Rubik, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("PG-7V", 0, 5);
    for (let i = 0; i < 2; i++) {
      const sx = -9 + i * 18;
      ctx.fillStyle = "#b5793a";
      ctx.strokeStyle = "rgba(25,14,6,0.9)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx, -32);
      ctx.quadraticCurveTo(sx + 5, -28, sx + 5, -24);
      ctx.lineTo(sx + 5, -20);
      ctx.lineTo(sx - 5, -20);
      ctx.lineTo(sx - 5, -24);
      ctx.quadraticCurveTo(sx - 5, -28, sx, -32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#4a7a2c";
      ctx.fillRect(sx - 2, -20, 4, 4);
      ctx.fillStyle = "#b5793a";
    }
    ctx.restore();

    // ---- bipod stand ----
    ctx.fillStyle = "#46463e";
    ctx.strokeStyle = "rgba(14,12,8,0.9)";
    ctx.lineWidth = 2.5;
    for (const sx of [-1, 1]) {
      ctx.save();
      ctx.translate(CX + sx * 24, GUNY + 124);
      ctx.rotate(sx * 0.55);
      ctx.beginPath();
      ctx.roundRect(-6, -6, 12, 54, 5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // rubber foot
      ctx.fillStyle = "#1c1c1c";
      ctx.beginPath();
      ctx.ellipse(CX + sx * 40, GUNY + 158, 9, 4, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#46463e";
    }
    // saddle clamp holding the tube
    ctx.fillStyle = "#5a5a52";
    ctx.strokeStyle = "rgba(14,12,8,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX - 20, GUNY + 96, 40, 14, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c8c8b8";
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(CX + sx * 14, GUNY + 103, 2.4, 0, TAU);
      ctx.fill();
    }

    // ---- long slim launch tube ----
    const tubeG = ctx.createLinearGradient(CX - 15, 0, CX + 15, 0);
    tubeG.addColorStop(0, "#2a2a26");
    tubeG.addColorStop(0.35, "#6a6a60");
    tubeG.addColorStop(0.55, "#8f8f82");
    tubeG.addColorStop(1, "#1e1e1a");
    ctx.fillStyle = tubeG;
    ctx.strokeStyle = "rgba(12,10,6,0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(CX - 14, GUNY + 2, 28, 96, 5);
    ctx.fill();
    ctx.stroke();
    // tube shine
    ctx.fillStyle = "rgba(255,255,245,0.3)";
    ctx.fillRect(CX - 9, GUNY + 8, 4, 84);
    // heat discoloration creeping down from the muzzle after firing
    if (this.recoil > 0.06) {
      const heatH = 34 * this.recoil;
      const heatG = ctx.createLinearGradient(0, GUNY + 2, 0, GUNY + 2 + heatH);
      heatG.addColorStop(0, `rgba(120,140,255,${0.5 * this.recoil})`);
      heatG.addColorStop(0.5, `rgba(200,130,255,${0.35 * this.recoil})`);
      heatG.addColorStop(1, "rgba(200,130,255,0)");
      ctx.fillStyle = heatG;
      ctx.fillRect(CX - 14, GUNY + 2, 28, heatH);
    }
    // stencil markings
    ctx.fillStyle = "rgba(240,235,210,0.8)";
    ctx.font = "700 7px Rubik, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("RPG-7V", CX, GUNY + 66);
    ctx.fillText("▲ 40mm", CX, GUNY + 76);

    // ---- wooden heat guard (signature RPG look) ----
    const woodG = ctx.createLinearGradient(CX - 19, 0, CX + 19, 0);
    woodG.addColorStop(0, "#6e3f1c");
    woodG.addColorStop(0.5, "#a86a32");
    woodG.addColorStop(1, "#5a3316");
    ctx.fillStyle = woodG;
    ctx.strokeStyle = "rgba(30,16,6,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX - 18, GUNY + 30, 36, 34, 7);
    ctx.fill();
    ctx.stroke();
    // wood grain
    ctx.strokeStyle = "rgba(50,26,8,0.6)";
    ctx.lineWidth = 1.2;
    for (const gx of [-10, -3, 4, 11]) {
      ctx.beginPath();
      ctx.moveTo(CX + gx, GUNY + 34);
      ctx.quadraticCurveTo(CX + gx + 1.5, GUNY + 47, CX + gx, GUNY + 60);
      ctx.stroke();
    }
    // metal bands on the wood
    ctx.fillStyle = "#3a3a36";
    for (const by of [GUNY + 32, GUNY + 58]) {
      ctx.fillRect(CX - 18, by, 36, 4);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(CX - 18, by, 36, 1.4);
      ctx.fillStyle = "#3a3a36";
    }

    // optical drum sight
    ctx.fillStyle = "#2c2c28";
    ctx.strokeStyle = "rgba(10,10,8,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(CX - 24, GUNY + 22, 9, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7ab648";
    ctx.beginPath();
    ctx.arc(CX - 24, GUNY + 22, 4.5, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(10,20,8,0.9)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(CX - 24, GUNY + 18);
    ctx.lineTo(CX - 24, GUNY + 26);
    ctx.moveTo(CX - 28, GUNY + 22);
    ctx.lineTo(CX - 20, GUNY + 22);
    ctx.stroke();
    ctx.fillStyle = "#3a3a36";
    ctx.fillRect(CX - 18, GUNY + 20, 6, 4);

    // pistol grip + trigger
    ctx.fillStyle = "#5a3a20";
    ctx.strokeStyle = "rgba(24,14,4,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(CX + 16, GUNY + 68, 11, 28, 5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#1a1a18";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(CX + 10, GUNY + 64, 8, -0.3, Math.PI + 0.3);
    ctx.stroke();
    ctx.fillStyle = "#d8d8d0";
    ctx.fillRect(CX + 7, GUNY + 58 + this.recoil * 2.5, 4, 9);

    // ---- flared blast nozzle (bell) ----
    ctx.fillStyle = "#4a4a44";
    ctx.strokeStyle = "rgba(12,10,6,0.95)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(CX - 14, GUNY + 6);
    ctx.lineTo(CX - 21, GUNY - 8);
    ctx.lineTo(CX + 21, GUNY - 8);
    ctx.lineTo(CX + 14, GUNY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#24241f";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 8, 21, 8.5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#a8a89c";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.fillStyle = "#080806";
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 8, 14, 5.4, 0, 0, TAU);
    ctx.fill();
    // carbon scoring around the bell
    ctx.strokeStyle = `rgba(10,9,7,${0.45 + this.recoil * 0.35})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 8, 18, 7, 0, 0, TAU);
    ctx.stroke();
    // layered booster heat: blue-white throat -> orange bell
    if (this.recoil > 0.04) {
      const heat = this.recoil;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const eg = ctx.createRadialGradient(CX, GUNY - 8, 0, CX, GUNY - 8, 24);
      eg.addColorStop(0, `rgba(235,250,255,${heat * 0.9})`);
      eg.addColorStop(0.35, `rgba(190,235,255,${heat * 0.7})`);
      eg.addColorStop(0.7, `rgba(255,180,80,${heat * 0.6})`);
      eg.addColorStop(1, "rgba(255,120,30,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 8, 21, 9, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = `rgba(200,235,255,${heat * 0.75})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(CX, GUNY - 8, 15, 6, 0, 0, TAU);
      ctx.stroke();
    }
    // booster smoke wisps curling off the bell
    if (Math.random() < 0.3 + this.recoil * 0.5) {
      if (Math.random() < 0.55) {
        this.spawnSmoke(CX + rnd(-10, 10), GUNY - 12, rnd(-8, 8), rnd(-32, -12), rnd(7, 12), rnd(0.9, 1.6), 0.55);
      } else {
        this.spawn(CX + rnd(-10, 10), GUNY - 12, rnd(-0.6, 0.6), rnd(-1.8, -0.5), {
          life: rnd(0.3, 0.55),
          size: 1.3,
          h: rnd(30, 50),
          s: 100,
          l: 68,
          g: -0.01,
          d: 0.95,
        });
      }
    }

    // loaded grenade with fat warhead hovering over the muzzle
    if (live) {
      const e = 1 - Math.pow(1 - this.loadP, 3);
      const tipY = GUNY - 46 + (1 - e) * 46 + Math.sin(this.time * 3.3) * 2;
      if (e < 1) {
        ctx.strokeStyle = `rgba(255,190,110,${(1 - e) * 0.8})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, tipY, 15 + (1 - e) * 22, 0, TAU);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(CX, tipY);
      ctx.rotate(Math.PI / 2);
      ctx.scale(0.72, 0.72);
      drawRpgGrenade(ctx, nextHue, this.time, 4.4, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}

/** One instance is enough: every field is overwritten before each draw. */
const twoGuns = new TwoGuns();

/**
 * Hand the guns the running FX layer so their idle ambience (charge sparks,
 * tank mist) keeps breathing. Menus pass `null`, so a menu thumbnail can never
 * spawn a particle into the live game.
 */
export function setTwoGunFx(fx: Slide2Fx | null) {
  twoGuns.fx = fx;
}

/**
 * Draw one of slide 2's eight guns with its muzzle at slide 1's `(cx, y0)`.
 *
 * Slide 2 draws straight into its own 420x760 canvas with the muzzle at
 * `(CX, GUNY)`; translating by the difference is the whole export.
 */
export function drawSetTwoGun(
  c: CanvasRenderingContext2D,
  id: SetTwoId,
  cx: number,
  y0: number,
  st: SetTwoDrawState,
) {
  const g = twoGuns;
  g.ctx = c;
  g.weapon = id;
  g.time = st.time;
  g.recoil = st.recoil;
  g.loadP = st.loadP;
  g.ammo = st.ammo;
  g.hueBase = st.hue;
  g.queue = [st.hue];
  g.shotIdx = 0;
  g.state = st.live ? 'playing' : 'menu';
  g.cannonPulse = st.cannonPulse;
  c.save();
  c.translate(cx - CX, y0 - GUNY);
  g.drawGun();
  c.restore();
}

/** Where each slide-2 gun's barrel actually is, for the shot recipes. */
export interface TwoMuzzle {
  /** x of the muzzle bore, in slide-2 canvas space. */
  x: number;
  /** y of the muzzle bore, in slide-2 canvas space. */
  y: number;
}

export const SET_TWO_MUZZLE: Record<SetTwoId, TwoMuzzle> = {
  firework: { x: CX, y: GUNY - 22 },
  blackhole: { x: CX, y: GUNY - 22 },
  shark: { x: CX, y: GUNY - 22 },
  bamboo: { x: CX, y: GUNY - 22 },
  soaker: { x: CX, y: GUNY - 22 },
  rainbow: { x: CX, y: GUNY - 22 },
  bazooka: { x: CX, y: GUNY - 14 },
  rpg: { x: CX, y: GUNY - 14 },
};

/** Slide 2's canvas size and muzzle line, for callers that draw in its space. */
export const SET_TWO_CANVAS = { W, H, CX, GUNY };
