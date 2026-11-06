import type { Game } from './engine';
import type { RGB } from './util';

export type PType = 'glow' | 'flame' | 'spark' | 'chip' | 'smoke' | 'dot' | 'ring' | 'shell' | 'cube' | 'ash';

export interface Particle {
  type: PType;
  x: number; y: number; vx: number; vy: number;
  ay: number; drag: number;
  life: number; max: number;
  size: number; size1: number;
  pal: RGB[];
  alpha: number; rot: number; vr: number;
  add: boolean; len: number; fadeIn: number; turb: number; seed: number;
  hit?: (g: Game, p: Particle) => void;
}
export interface SpawnOpts extends Partial<Omit<Particle, 'pal' | 'max' | 'seed'>> {
  type: PType;
  pal?: string[];
}
export interface BurstOpts {
  n: number;
  type?: PType;
  ang?: number; spread?: number;
  speed?: [number, number];
  life?: [number, number];
  size?: [number, number];
  size1?: [number, number] | number;
  pal: string[];
  ay?: number; drag?: number; len?: number; alpha?: number; add?: boolean;
  vr?: number; turb?: number; fadeIn?: number; rpal?: boolean;
  hit?: (g: Game, p: Particle) => void;
}

export interface Fx {
  age: number; max: number; add?: boolean;
  draw: (ctx: CanvasRenderingContext2D, k: number, fx: Fx) => void;
  update?: (dt: number, fx: Fx) => void;
}

export interface Proj {
  x: number; y: number; vx: number; vy: number;
  alive: boolean; age: number;
  noCollide?: boolean;
  update?: (g: Game, dt: number, p: Proj) => void;
  draw: (ctx: CanvasRenderingContext2D, g: Game, p: Proj) => void;
  onHit: (g: Game, hx: number, hy: number, p: Proj) => void;
  data?: any;
}

export interface Embed {
  kind: 'slug' | 'arrow' | 'knife' | 'scorch' | 'slash' | 'burn' | 'crater' | 'dent' | 'nano' | 'clock' | 'helix' | 'sonic' | 'frost' | 'solar' | 'acid';
  a: number; born: number;
  color: string; glow: string;
  size: number; rot: number;
  cracks: number[][];
  fire: number; fade: number; perm: boolean; seed: number;
  cool: number;
}

export interface WeaponState {
  recoil: number;
  cd: number; cdMax: number; ready: number;
  chan: number; minHold: number; holding: boolean;
  t: number; fireT: number; shots: number; charge: number;
  data: any;
}

export interface Weapon {
  id: string;
  name: string;
  tag: string;
  sub: string;
  desc: string;
  accent: string;
  hint: string;
  muzzle: number;   // local x of muzzle
  muzzleY: number;  // local y of muzzle axis
  kick: number;     // recoil travel (px)
  scale?: number;   // draw scale
  isNew?: boolean;
  maxCharge?: number;
  onRelease?: (g: Game, s: WeaponState, charge: number) => void;
  cooldown: number;
  channel?: boolean;
  minHold?: number;
  draw: (ctx: CanvasRenderingContext2D, g: Game, s: WeaponState) => void;
  fire?: (g: Game, s: WeaponState) => void;
  channelUpdate?: (g: Game, s: WeaponState, dt: number) => void;
  drawBeam?: (ctx: CanvasRenderingContext2D, g: Game, s: WeaponState) => void;
  drawOverlay?: (ctx: CanvasRenderingContext2D, g: Game, s: WeaponState) => void;
  update?: (g: Game, s: WeaponState, dt: number) => void;
  onSelect?: (g: Game, s: WeaponState) => void;
}
