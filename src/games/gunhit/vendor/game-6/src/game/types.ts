import type { Particle } from './core';

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  age: number;
  life: number;
  size: number;
  dead: boolean;
  kind: string;
  weapon: Weapon;
  trail: { x: number; y: number }[];
  trailMax: number;
  data: Record<string, number>;
  noStick?: boolean;
  /** persistent projectiles (e.g. the disc) handle the wheel themselves; return true to remove the bullet */
  collide?: (b: Bullet, api: GameAPI, hit: { x: number; y: number; nx: number; ny: number }) => boolean;
  update?: (b: Bullet, dt: number, api: GameAPI) => void;
  draw: (ctx: CanvasRenderingContext2D, b: Bullet, t: number) => void;
}

export interface Beam {
  weapon: Weapon;
  x: number;
  y: number;
  angle: number;
  age: number;
  duration: number;
  len: number;
  hitX: number;
  hitY: number;
  hit: boolean;
  impactDelay?: number;
  impacted?: boolean;
  tick?: (bm: Beam, dt: number, api: GameAPI) => void;
  draw: (ctx: CanvasRenderingContext2D, bm: Beam, t: number) => void;
}

export interface Mark {
  weapon: Weapon;
  a: number; // local angle on wheel
  r: number; // distance from wheel center
  size: number; // angular footprint in px along rim
  age: number;
  seed: number;
}

export interface GameAPI {
  cx: number;
  cy: number;
  wheelR: number;
  rotation: number;
  time: number;
  aim: number;
  floorY: number;
  W: number;
  H: number;
  particles: Particle[];
  bullets: Bullet[];
  beams: Beam[];
  shake: (n: number) => void;
  flash: (color: string, a: number) => void;
  hitstop: (s: number) => void;
  hitscan: (x: number, y: number, angle: number) => { hit: boolean; x: number; y: number; dist: number };
  registerHit: (x: number, y: number, weapon: Weapon, delay?: number, sizeMul?: number) => boolean;
  /** the weapon hand "catches" something: triggers the hand pulse animation */
  handPulse: () => void;
  toWorld: (lx: number, ly: number) => { x: number; y: number };
  after: (sec: number, fn: () => void) => void;
}

export interface WeaponDrawState {
  t: number;
  recoil: number; // 1 -> 0 right after a shot
  charge: number; // 0..1 hold charge (bow)
  cycle: number; // 0 right after a shot -> 1 when ready again
  out?: number; // how many projectiles of this weapon are still alive in the arena
  catchT?: number; // seconds since the hand last caught something
  saberSide?: -1 | 1; // mirror the energy sword's swing without changing its shot
  icon?: boolean;
}

export interface Weapon {
  id: string;
  name: string;
  tag: string;
  accent: string;
  accent2: string;
  mode: 'projectile' | 'beam';
  cooldown: number;
  charged?: boolean;
  recoilAmt: number;
  muzzle: [number, number];
  eject?: [number, number];
  markSize: number;
  /** short explanation shown in the side panel */
  note?: string;
  /** hint printed on the arena before the first shot */
  hint?: string;
  draw: (ctx: CanvasRenderingContext2D, s: WeaponDrawState) => void;
  /** compact, hand-composed silhouette for the narrow weapon rack */
  drawIcon?: (ctx: CanvasRenderingContext2D, s: WeaponDrawState) => void;
  fire: (api: GameAPI, x: number, y: number, angle: number, charge: number) => void;
  onImpact?: (api: GameAPI, x: number, y: number, angle: number) => void;
  drawMark: (ctx: CanvasRenderingContext2D, m: Mark, t: number) => void;
  /** called every frame for each mark: world position, outward angle */
  ambient?: (api: GameAPI, x: number, y: number, outward: number, m: Mark, dt: number) => void;
}
