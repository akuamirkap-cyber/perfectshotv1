import { type Ctx, H, TAU, W, angleDiff, drawSprite, easeOutBack, easeOutCubic, glowSprite, makeCanvas, normAngle, pick, rand, randomPoly } from './core';
import {
  TEX_SCALE,
  WOOD_COLS,
  ammoIcon,
  cloneCanvas,
  createWheelTexture,
  drawApple,
  drawAppleHalf,
  drawCasing,
  drawShell,
  drawStuckItem,
  drawWad,
  makeShatterPolys,
  renderBackground,
  type ShatterPoly,
} from './art';
import { GOLDEN_SCALE, SHOTGUN_SCALE, drawWeapon } from './weaponArt';
import { type FX, K, Light, Lightning, MuzzleFlash, Particles } from './particles';
import * as S from './spawn7';
import { BeeRifleShot, ChargeShot, CoinShot, CrystalShot, CryoShot, EmeraldBeam, GauntletShot, HolyShot, HyperShot, ObliteratorShot, PulseShot, QuantumShot, RubyShot, SaberShot, SapphireBlast, UnicornShot, WarsShot } from './projectiles7';
import { GlitchBurst, HaloRing, RadiationPulse, SaberSlash, WarpLines } from './fx7';
import { AMETHYST, EMERALD, SAPPHIRE } from './shapes7';
import { sfx } from './audio';
import { BlackHoleShot, DartShot, GoldenBullet, type Projectile, ShotgunBlast, StoneShot, WaterJet } from './projectiles';
import { BambooShot, BananaShot, BubbleShot, FlameJet, SniperShot, SnowballShot } from './projectiles2';
import { BambooBlast, BananaPop, FrostFlash, SniperFlash } from './fx2';
import { drawBubble, drawRifleCasing } from './shapes2';
import { ChickenShot, ConfettiShot, CrossbowShot, HarpoonShot, LaserBeam, MinigunBurst, PizzaShot, PlasmaShot, SeedShot } from './projectiles3';
import { ArcWaves, PartyPop, PlasmaFlash } from './fx3';
import { BeeSwarm, CoconutShot, DragonFire, FireworkShot, GravityShot, HoneyShot, KerisShot, NoteShot, SakuraShot } from './projectiles4';
import { DragonBreathFlash, GravityPulse, HexBurst, Mandala, RadialFlash, SpiralFX } from './fx4';
import { ROCKET_COLS } from './shapes4';
import { DiamondShot, GhostShot, MeteorShot, MoonShot, PaintShot, PencilShot, RainbowShot, SandalShot, SharkShot, StormShot, UfoShot, WandShot } from './projectiles5';
import { MoonSlash, RainbowBurst, RainbowRings, RuneCircle } from './fx5';
import { PAINT, RAINBOW } from './shapes5';
import { BazookaShot, CardShot, CricketShot, ElectroShot, FishShot, FreezeBeam, MagnetShot, PirateShot, RailShot, RpgShot, SizeShot } from './projectiles6';
import { ConvergeRings, FieldLines, FrostBloom } from './fx6';
import { SplashSheet } from './particles';
import { type StuckItem, WEAPON_MAP, type WeaponAnim, type WeaponId, newAnim } from './weapons';
import { RECOIL_ROT } from './recoil';

// Re-exported so this game and Game A's port keep one source of truth.
export { RECOIL_ROT };

export type GameStatus = 'playing' | 'cleared' | 'failed';
export interface GameInfo {
  status: GameStatus;
  score: number;
  apples: number;
  hits: number;
  total: number;
}

export type Decal =
  | { kind: 'poison'; angle: number; t: number; seed: number }
  | { kind: 'wet'; angle: number; t: number; seed: number; blob: number[]; next: number }
  | { kind: 'smolder'; angle: number; r: number; t: number; seed: number }
  | { kind: 'goo'; angle: number; t: number; seed: number; blob: number[]; next: number; c?: [string, string, string]; drip?: string; dripData?: string };

interface Apple {
  angle: number;
  half: number;
  alive: boolean;
}
interface Piece extends ShatterPoly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  life: number;
}
interface Timer {
  t: number;
  fn: () => void;
}
interface LensReq {
  x: number;
  y: number;
  r: number;
  s: number;
}

const WHEEL_X = W / 2;
const WHEEL_Y = 262;
const WHEEL_R = 108;
const GUN_X = W / 2;
const GUN_Y = 600;
const SPIN = 1.9;
const PURPLES = ['200,140,255', '255,180,255', '150,100,255', '230,200,255'];
const GREENS = ['120,255,170', '190,255,215', '60,255,140', '230,255,240'];
const MOON_COLS = ['225,215,255', '200,185,255', '255,255,255'];
const FX5_RGB: Partial<Record<WeaponId, string>> = {
  moonbeam: '210,200,255',
  storm: '150,215,255',
  pencil: '150,150,165',
  sandal: '255,230,110',
  paintball: '255,110,130',
  wand: '255,160,235',
  shark: '160,220,255',
  ghost: '130,255,240',
  ufo: '120,255,150',
  rainbow: '255,200,120',
  meteor: '255,150,60',
  diamond: '180,235,255',
  fish: '170,225,255',
  rpg: '255,170,80',
  cricket: '200,130,255',
  electro: '130,205,255',
  bazooka: '255,170,80',
  freeze: '170,235,255',
  rail: '160,195,255',
  magnet: '255,130,150',
  shrink: '70,255,140',
  grow: '255,160,50',
  pirate: '255,200,90',
  card: '255,160,180',
  holy: '255,226,140',
  unicorn: '255,200,245',
  obliterator: '130,255,90',
  coin: '255,215,100',
  saber: '110,225,255',
  gauntlet: '255,170,90',
  ruby: '255,90,120',
  emerald: '90,255,170',
  sapphire: '120,170,255',
  crystal: '195,130,255',
  beerifle: '255,210,70',
  charge: '90,210,255',
  pulse: '110,225,255',
  cryo: '170,235,255',
  hyperdrive: '150,190,255',
  quantum: '190,110,255',
  wars: '255,100,90',
};
const ENERGY_RGB: Partial<Record<WeaponId, string>> = {
  electro: '130,205,255',
  cricket: '190,110,255',
  rail: '150,190,255',
  shrink: '70,255,140',
  grow: '255,160,50',
  obliterator: '110,255,80',
  holy: '255,225,140',
  hyperdrive: '130,180,255',
  quantum: '170,80,255',
  charge: '70,200,255',
  pulse: '70,215,255',
  wars: '255,70,60',
  saber: '90,210,255',
};
const SMOKERS: Partial<Record<WeaponId, string>> = {
  rpg: '110,106,100',
  bazooka: '120,116,110',
  pirate: '100,96,92',
  cricket: '130,100,170',
  freeze: '200,238,255',
  obliterator: '90,200,70',
  gauntlet: '150,154,160',
  wars: '100,90,86',
};
const ICE_COLS = ['190,235,255', '140,210,255', '230,248,255', '170,225,255'];

export class Game {
  canvas: HTMLCanvasElement;
  ctx: Ctx;
  k = 1;
  bg: HTMLCanvasElement | null = null;
  time = 0;
  weaponId: WeaponId;
  status: GameStatus = 'playing';
  levelId = 0;
  wheel = { x: WHEEL_X, y: WHEEL_Y, R: WHEEL_R, angle: 0, bumpY: 0, bumpV: 0, flash: 0, flashColor: 'rgba(255,255,255,', scale: 1, intro: 0, shakeT: 0, shakeX: 0 };
  wheelGone = false;
  baseTex: HTMLCanvasElement;
  tex: HTMLCanvasElement;
  texCtx: Ctx;
  texSize: number;
  stuck: StuckItem[] = [];
  apples: Apple[] = [];
  projectiles: Projectile[] = [];
  particles = new Particles();
  fx: FX[] = [];
  wheelFx: FX[] = [];
  decals: Decal[] = [];
  pieces: Piece[] = [];
  timers: Timer[] = [];
  lensReq: LensReq[] = [];
  lensCanvas = makeCanvas(4, 4);
  anim: WeaponAnim = newAnim();
  ammoTotal = 8;
  ammoLeft = 8;
  hits = 0;
  score = 0;
  applesHit = 0;
  shotsFired = 0;
  cool = 0;
  shakeAmt = 0;
  shakeX = 0;
  shakeY = 0;
  screenFlash = { color: '255,255,255', a: 0 };
  motes: { x: number; y: number; r: number; s: number; ph: number }[] = [];
  orbTarget = { x: GUN_X, y: GUN_Y };
  private raf = 0;
  private last = 0;
  private ro: ResizeObserver | null = null;
  private onStatus: (info: GameInfo) => void;

  constructor(canvas: HTMLCanvasElement, onStatus: (info: GameInfo) => void, weapon: WeaponId = 'golden') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onStatus = onStatus;
    this.weaponId = weapon;
    this.baseTex = createWheelTexture(WHEEL_R, 11);
    this.tex = cloneCanvas(this.baseTex);
    this.texCtx = this.tex.getContext('2d')!;
    this.texSize = this.tex.width / TEX_SCALE;
    for (let i = 0; i < 42; i++) this.motes.push({ x: rand(0, W), y: rand(0, H), r: rand(0.6, 2), s: rand(6, 22), ph: rand(0, TAU) });
    this.resize();
    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(canvas);
    }
    canvas.addEventListener('pointerdown', this.onPointer);
    window.addEventListener('keydown', this.onKey);
    this.reset();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onPointer);
    window.removeEventListener('keydown', this.onKey);
  }

  private onPointer = (e: PointerEvent) => {
    e.preventDefault();
    this.fire();
  };
  private onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) this.fire();
    }
  };

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (w === this.canvas.width && h === this.canvas.height && this.bg) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.k = w / W;
    this.bg = renderBackground(this.k);
  }

  setWeapon(id: WeaponId) {
    this.weaponId = id;
    this.reset();
  }

  reset() {
    this.levelId++;
    const def = WEAPON_MAP[this.weaponId];
    this.status = 'playing';
    this.stuck = [];
    this.projectiles = [];
    this.particles.clear();
    this.fx = [];
    this.wheelFx = [];
    this.decals = [];
    this.pieces = [];
    this.timers = [];
    this.wheelGone = false;
    this.tex = cloneCanvas(this.baseTex);
    this.texCtx = this.tex.getContext('2d')!;
    const w = this.wheel;
    w.angle = rand(0, TAU);
    w.bumpY = 0;
    w.bumpV = 0;
    w.flash = 0;
    w.intro = 0;
    w.scale = 0.01;
    w.shakeT = 0;
    w.shakeX = 0;
    this.ammoTotal = def.ammo;
    this.ammoLeft = def.ammo;
    this.hits = 0;
    this.score = 0;
    this.applesHit = 0;
    this.shotsFired = 0;
    this.cool = 0.4;
    this.anim = newAnim();
    this.screenFlash.a = 0;
    this.apples = [];
    const n = Math.random() < 0.55 ? 2 : 1;
    const base = rand(0, TAU);
    for (let i = 0; i < n; i++) this.apples.push({ angle: normAngle(base + i * Math.PI * rand(0.75, 1.25)), half: 0.11, alive: true });
    this.emit();
  }

  emit() {
    this.onStatus({ status: this.status, score: this.score, apples: this.applesHit, hits: this.hits, total: this.ammoTotal });
  }

  // ───────────────────────── API used by projectiles ─────────────────────────
  after(delay: number, fn: () => void) {
    const id = this.levelId;
    this.timers.push({
      t: delay,
      fn: () => {
        if (this.levelId === id) fn();
      },
    });
  }
  addFX(f: FX) {
    this.fx.push(f);
  }
  addWheelFX(f: FX) {
    this.wheelFx.push(f);
  }
  addDecal(d: Decal) {
    this.decals.push(d);
  }
  lens(x: number, y: number, r: number, s: number) {
    this.lensReq.push({ x, y, r, s });
  }
  shake(a: number) {
    this.shakeAmt = Math.max(this.shakeAmt, a);
  }
  flashScreen(color: string, a: number) {
    this.screenFlash.color = color;
    this.screenFlash.a = Math.max(this.screenFlash.a, a);
  }
  wheelImpact(power: number, color = 'rgba(255,255,255,') {
    const w = this.wheel;
    w.bumpV -= power * 26;
    w.flash = 1;
    w.flashColor = color;
  }
  paint(fn: (c: Ctx) => void) {
    const g = this.texCtx;
    const sz = this.tex.width;
    g.save();
    g.setTransform(TEX_SCALE, 0, 0, TEX_SCALE, sz / 2, sz / 2);
    g.beginPath();
    g.arc(0, 0, this.wheel.R - 0.6, 0, TAU);
    g.clip();
    fn(g);
    g.restore();
  }

  collide(p: Projectile, prev: number, tip: number) {
    if (this.wheelGone) return;
    const w = this.wheel;
    const bottom = w.y + w.bumpY + w.R;
    if (tip > bottom + 110) return;
    const theta = normAngle(Math.PI / 2 - w.angle);
    for (const ap of this.apples) {
      if (!ap.alive) continue;
      const lim = bottom + 24;
      if (prev > lim && tip <= lim && angleDiff(ap.angle, theta) < ap.half + p.half * 0.5) this.sliceApple(ap, p);
    }
    for (const it of this.stuck) {
      const lim = bottom + it.protrude;
      if (prev > lim && tip <= lim && angleDiff(it.angle, theta) < it.half + p.half) {
        p.resolved = true;
        p.block(w.x, lim);
        this.fail();
        return;
      }
    }
    if (prev > bottom && tip <= bottom) {
      p.resolved = true;
      p.hit(theta, w.x, bottom);
    }
  }

  landed(it: StuckItem, clearDelay = 0.15) {
    const w = this.wheel;
    const a = it.angle + w.angle;
    it.world.x = w.x + Math.cos(a) * w.R;
    it.world.y = w.y + w.bumpY + Math.sin(a) * w.R;
    this.stuck.push(it);
    this.stuck.sort((x, y) => y.protrude - x.protrude);
    if (this.status !== 'playing') return;
    this.hits++;
    this.score++;
    if (this.hits >= this.ammoTotal) {
      this.status = 'cleared';
      this.after(clearDelay, () => this.shatter());
      this.after(clearDelay + 1.3, () => this.emit());
    }
  }

  fail() {
    if (this.status !== 'playing') return;
    this.status = 'failed';
    this.flashScreen('255,40,70', 0.42);
    this.hitStop(0.1);
    this.shake(10);
    this.wheel.shakeT = 0.45;
    sfx.play('fail');
    this.after(1.0, () => this.emit());
  }

  private appleBurst(ax: number, ay: number, a: number) {
    const ps = this.particles;
    for (const side of [-1, 1]) {
      const dir = a + (Math.PI / 2) * side;
      const sp = rand(90, 160);
      ps.add({
        k: K.CUSTOM,
        x: ax,
        y: ay,
        vx: Math.cos(a) * 110 + Math.cos(dir) * sp,
        vy: Math.sin(a) * 110 + Math.sin(dir) * sp - 120,
        g: 1200,
        rot: a + Math.PI / 2,
        vrot: side * rand(5, 9),
        life: 1.4,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          drawAppleHalf(c, 11, side);
          c.restore();
        },
      });
    }
    S.droplets(ps, ax, ay, 14, a, 1.3, [80, 260], [1, 2.2], '255,95,85', 900);
    S.droplets(ps, ax, ay, 6, a, 1.3, [60, 200], [0.8, 1.6], '255,240,200', 900);
  }

  private appleBubble(ax: number, ay: number, a: number) {
    const ps = this.particles;
    const t0 = this.time;
    ps.add({
      k: K.CUSTOM,
      x: ax,
      y: ay,
      vx: Math.cos(a) * 40,
      vy: -90,
      g: -40,
      drag: 0.6,
      life: 1.1,
      rot: 0,
      vrot: 1.5,
      draw: (c, q) => {
        const age = q.max - q.life;
        const w = Math.sin(age * 14) * 0.06;
        c.save();
        c.translate(q.x, q.y);
        c.rotate(q.rot * 0.3);
        c.save();
        c.scale(0.8, 0.8);
        drawApple(c, 11);
        c.restore();
        c.scale(1 + w, 1 - w);
        drawBubble(c, 18, t0 + age, 1, 1);
        c.restore();
      },
      die: (q) => {
        S.bubblePop(ps, q.x, q.y, 18);
        this.appleBurst(q.x, q.y, -Math.PI / 2);
        sfx.play('bubble_pop');
      },
    });
  }

  sliceApple(ap: Apple, p: Projectile) {
    ap.alive = false;
    this.applesHit++;
    const w = this.wheel;
    const a = ap.angle + w.angle;
    const ax = w.x + Math.cos(a) * (w.R + 10);
    const ay = w.y + w.bumpY + Math.sin(a) * (w.R + 10);
    const ps = this.particles;
    if (p.weapon === 'blackhole' || p.weapon === 'gravity') {
      for (let i = 0; i < 30; i++)
        ps.add({ k: K.SPARK, x: ax + rand(-9, 9), y: ay + rand(-9, 9), target: p, pull: 3200, size: rand(1.4, 3), len: 0.03, life: 0.7, color: pick(['230,40,50', '255,120,110', '120,200,80', '255,240,200']) });
      ps.add({
        k: K.CUSTOM,
        x: ax,
        y: ay,
        target: p,
        pull: 2400,
        life: 0.4,
        rot: a + Math.PI / 2,
        vrot: 16,
        draw: (c, q) => {
          const s = q.life / q.max;
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          c.scale(s, s * (0.5 + s * 0.5));
          drawApple(c, 11);
          c.restore();
        },
      });
    } else if (p.weapon === 'bubble') {
      this.appleBubble(ax, ay, a);
    } else {
      this.appleBurst(ax, ay, a);
      if (p.weapon === 'golden') S.stars(ps, ax, ay, 8, '255,220,130', [60, 200], [8, 14]);
      if (p.weapon === 'soaker') S.droplets(ps, ax, ay, 10, a, 1.4, [100, 300], [1.2, 2.6]);
      if (p.weapon === 'sumpit') S.smoke(ps, ax, ay, 3, '110,225,80', [6, 24], { alpha: 0.35 });
      if (p.weapon === 'snowball') {
        S.smoke(ps, ax, ay, 6, '240,248,255', [10, 40], { alpha: 0.5 });
        S.snowflakes(ps, ax, ay, 8, a, 1.3, [60, 200]);
        S.stars(ps, ax, ay, 6, '200,235,255', [60, 180], [8, 14]);
      }
      if (p.weapon === 'flame') {
        S.fire(ps, ax, ay, 12, a, 1.4, [60, 220], [16, 28], [30, 50], [0.25, 0.45]);
        S.smoke(ps, ax, ay, 3, '60,52,46', [10, 34], { alpha: 0.4 });
      }
      if (p.weapon === 'sniper') S.sparks(ps, ax, ay, 14, a, 1.4, [300, 800], '255,235,170', 1.4);
      if (p.weapon === 'bamboo') {
        S.fire(ps, ax, ay, 14, a, 1.6, [100, 320], [22, 36], [40, 70], [0.3, 0.5]);
        S.smoke(ps, ax, ay, 5, '60,52,46', [14, 50], { alpha: 0.5 });
      }
      const fx5 = FX5_RGB[p.weapon];
      if (fx5) {
        S.stars(ps, ax, ay, 8, fx5, [60, 200], [8, 14]);
        S.sparks(ps, ax, ay, 14, a, 1.4, [180, 520], fx5, 1.4);
        S.ring(ps, ax, ay, 3, 40, fx5, 2.5, 0.26, true);
      }
      if (p.weapon === 'dragon') {
        S.fire(ps, ax, ay, 14, a, 1.4, [80, 300], [20, 34], [40, 70], [0.3, 0.5]);
        S.smoke(ps, ax, ay, 3, '60,52,46', [10, 34], { alpha: 0.4 });
      }
      if (p.weapon === 'honey') S.goo(ps, ax, ay, 10, a, 1.4, [80, 260], [1.4, 2.8], '255,184,30', '150,80,0');
      if (p.weapon === 'coconut') S.droplets(ps, ax, ay, 10, a, 1.4, [100, 300], [1.2, 2.4], '235,245,255');
      if (p.weapon === 'angklung') S.notes(ps, ax, ay, 5, a, 1.2, [60, 200]);
      if (p.weapon === 'bee') S.bees(ps, ax, ay, 5, a, 1.4, [80, 260]);
      if (p.weapon === 'sakura') S.petals(ps, ax, ay, 14, a, 1.4, [60, 240]);
      if (p.weapon === 'firework') S.fireworkBurst(ps, ax, ay, 0, 0.55);
      if (p.weapon === 'keris') {
        S.stars(ps, ax, ay, 8, '255,225,130', [60, 200], [8, 14]);
        S.sparks(ps, ax, ay, 14, a, 1.4, [200, 560], '255,225,140', 1.4);
      }
      if (p.weapon === 'confetti') {
        S.confetti(ps, ax, ay, 26, a, 1.5, [100, 380], [3, 6], [1, 1.7]);
        S.stars(ps, ax, ay, 6, '255,235,250', [60, 200], [8, 14]);
      }
      if (p.weapon === 'plasma') {
        S.glow(ps, ax, ay, 90, 10, '170,255,200', 0.2, 1);
        S.sparks(ps, ax, ay, 16, a, 1.5, [120, 400], '140,255,190', 1.4);
      }
      if (p.weapon === 'laser') S.sparks(ps, ax, ay, 18, a, 1.5, [150, 500], '255,190,130', 1.4);
      if (p.weapon === 'pizza') S.goo(ps, ax, ay, 8, a, 1.4, [80, 260], [1.4, 2.6], '255,200,60', '170,90,10');
      if (p.weapon === 'seed') S.leaves(ps, ax, ay, 8, a, 1.5, [60, 220]);
      if (p.weapon === 'chicken') S.feathers(ps, ax, ay, 8, a, 1.5, [60, 240]);
      if (p.weapon === 'harpoon' || p.weapon === 'crossbow' || p.weapon === 'minigun') S.sparks(ps, ax, ay, 10, a, 1.4, [150, 450], '255,235,190', 1.2);
      if (p.weapon === 'banana') {
        S.stars(ps, ax, ay, 8, '255,230,100', [60, 200], [8, 14]);
        S.droplets(ps, ax, ay, 8, a, 1.4, [80, 260], [1.2, 2.4], '255,226,110');
      }
    }
    ps.add({ k: K.TEXT, x: ax, y: ay - 16, vy: -60, drag: 2, size: 22, text: '+1', color: '255,120,110', life: 0.9 });
    sfx.play('apple');
  }

  shatter() {
    if (this.wheelGone) return;
    const w = this.wheel;
    const ps = this.particles;
    const cx = w.x;
    const cy = w.y + w.bumpY;
    this.wheelGone = true;
    const ca = Math.cos(w.angle);
    const sa = Math.sin(w.angle);
    this.pieces = makeShatterPolys(w.R, 9).map((pp) => {
      const wx = cx + pp.cx * ca - pp.cy * sa;
      const wy = cy + pp.cx * sa + pp.cy * ca;
      const dir = Math.atan2(wy - cy, wx - cx);
      const sp = rand(240, 440);
      return { ...pp, x: wx, y: wy, vx: Math.cos(dir) * sp, vy: Math.sin(dir) * sp - 180, rot: w.angle, vrot: rand(-5, 5), life: 1.7 };
    });
    for (const it of this.stuck) {
      const a = it.angle + w.angle;
      const px = cx + Math.cos(a) * w.R;
      const py = cy + Math.sin(a) * w.R;
      if (it.weapon === 'shotgun') continue;
      if (it.weapon === 'soaker') {
        S.droplets(ps, px, py, 12, a, 0.9, [150, 380], [1.2, 3]);
        continue;
      }
      if (it.weapon === 'blackhole') {
        S.glow(ps, px, py, 70, 10, '220,170,255', 0.25, 1);
        S.ring(ps, px, py, 4, 50, '190,120,255', 5, 0.35, true);
        S.sparks(ps, px, py, 14, a, Math.PI, [120, 380], '215,165,255', 1.4);
        continue;
      }
      if (it.weapon === 'freeze') {
        S.crystalShards(ps, px, py, 12, a, 1.2, [140, 460]);
        S.snowChunks(ps, px, py, 5, a, 1, [120, 360]);
        S.glow(ps, px, py, 80, 10, '150,230,255', 0.25, 1);
        continue;
      }
      const energyRgb = ENERGY_RGB[it.weapon];
      if (energyRgb) {
        S.glow(ps, px, py, 80, 10, energyRgb, 0.25, 1);
        S.ring(ps, px, py, 4, 50, energyRgb, 5, 0.35, true);
        S.sparks(ps, px, py, 14, a, Math.PI, [120, 380], energyRgb, 1.4);
        continue;
      }
      if (it.weapon === 'ghost') {
        S.ghostWisps(ps, px, py, 10, a, 1.3, [80, 300]);
        S.glow(ps, px, py, 70, 10, '120,255,240', 0.25, 1);
        continue;
      }
      if (it.weapon === 'storm') {
        S.sparks(ps, px, py, 16, a, Math.PI, [120, 420], '170,220,255', 1.4);
        S.ring(ps, px, py, 4, 50, '150,210,255', 5, 0.35, true);
        continue;
      }
      if (it.weapon === 'paintball') {
        S.paintDrops(ps, px, py, 14, a, 0.9, [150, 400], [1.4, 3], PAINT[(it.shape?.[0] ?? 0) % PAINT.length]);
        continue;
      }
      if (it.weapon === 'rainbow') {
        S.rainbowSparks(ps, px, py, 24, a, 1.3, [120, 440]);
        continue;
      }
      if (it.weapon === 'meteor') {
        S.fire(ps, px, py, 10, a, 1.2, [60, 280], [24, 40], [44, 80], [0.3, 0.55]);
        S.rocks(ps, px, py, 6, a, 1.2, [140, 420]);
        continue;
      }
      if (it.weapon === 'dragon') {
        S.fire(ps, px, py, 10, a, 1.2, [60, 260], [22, 36], [44, 76], [0.3, 0.55]);
        S.embers(ps, px, py, 12, a, Math.PI, [80, 320]);
        continue;
      }
      if (it.weapon === 'gravity') {
        S.glow(ps, px, py, 80, 10, '160,220,255', 0.25, 1);
        S.ring(ps, px, py, 4, 50, '120,205,255', 5, 0.35, true);
        S.sparks(ps, px, py, 14, a, Math.PI, [120, 380], '160,220,255', 1.4);
        continue;
      }
      if (it.weapon === 'honey') {
        S.goo(ps, px, py, 12, a, 0.9, [150, 380], [1.4, 3], '255,184,30', '150,80,0');
        continue;
      }
      if (it.weapon === 'bee') {
        S.bees(ps, px, py, 6, a, 1.3, [120, 360]);
        continue;
      }
      if (it.weapon === 'sakura') {
        S.petals(ps, px, py, 16, a, 1.3, [100, 320]);
        continue;
      }
      if (it.weapon === 'firework') {
        S.fireworkBurst(ps, px, py, it.shape?.[0] ?? 0, 0.7);
        continue;
      }
      if (it.weapon === 'plasma' || it.weapon === 'laser') {
        const col = it.weapon === 'plasma' ? '60,255,150' : '255,80,70';
        S.glow(ps, px, py, 80, 10, col, 0.25, 1);
        S.ring(ps, px, py, 4, 50, col, 5, 0.35, true);
        S.sparks(ps, px, py, 14, a, Math.PI, [120, 380], it.weapon === 'plasma' ? '140,255,190' : '255,200,150', 1.4);
        continue;
      }
      if (it.weapon === 'confetti') {
        S.confetti(ps, px, py, 22, a, 1.2, [120, 420], [3, 6], [1, 1.8]);
        continue;
      }
      if (it.weapon === 'flame') {
        S.fire(ps, px, py, 8, a, 1.2, [60, 260], [20, 34], [40, 70], [0.3, 0.55]);
        S.embers(ps, px, py, 12, a, Math.PI, [80, 320]);
        continue;
      }
      if (it.weapon === 'bubble') {
        S.bubblePop(ps, px, py, 12);
        S.bubblePop(ps, px + 8, py + 4, 6);
        continue;
      }
      if (it.weapon === 'snowball') {
        S.smoke(ps, px, py, 4, '240,248,255', [14, 50], { alpha: 0.5 });
        S.snowChunks(ps, px, py, 6, a, 0.9, [150, 380]);
      }
      const sp = rand(320, 520);
      const R = w.R;
      const item = it;
      const t0 = this.time;
      ps.add({
        k: K.CUSTOM,
        x: px,
        y: py,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 220,
        g: 1300,
        rot: a,
        vrot: rand(-11, 11),
        life: 1.8,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          c.translate(-R, 0);
          drawStuckItem(c, item, R, t0);
          c.restore();
        },
      });
    }
    for (const ap of this.apples) {
      if (!ap.alive) continue;
      ap.alive = false;
      const a = ap.angle + w.angle;
      this.appleBurst(cx + Math.cos(a) * (w.R + 10), cy + Math.sin(a) * (w.R + 10), a);
    }
    this.stuck = [];
    this.decals = [];
    this.wheelFx = [];
    for (let i = 0; i < 48; i++) {
      const an = rand(0, TAU);
      const r = rand(0, w.R);
      const sp = rand(150, 520);
      ps.add({
        k: K.CHIP,
        x: cx + Math.cos(an) * r,
        y: cy + Math.sin(an) * r,
        vx: Math.cos(an) * sp,
        vy: Math.sin(an) * sp - 150,
        g: 1200,
        drag: 0.5,
        rot: rand(0, TAU),
        vrot: rand(-20, 20),
        life: rand(0.8, 1.4),
        poly: randomPoly(5, rand(2, 5), 0.5),
        color: pick(WOOD_COLS),
      });
    }
    S.smoke(ps, cx, cy, 14, '200,170,130', [30, 120], { spread: w.R * 0.6, vx: [-120, 120], vy: [-120, 60], alpha: 0.45, life: [0.9, 1.5], drag: 2.2 });
    S.glow(ps, cx, cy, 260, 60, '255,240,210', 0.35, 0.8);
    S.ring(ps, cx, cy, w.R * 0.8, w.R * 2.4, '255,240,210', 8, 0.5, true, 0.7);
    this.addFX(new Light(cx, cy, 300, '255,220,170', 0.6, 0.5));
    this.flashScreen('255,255,255', 0.4);
    this.hitStop(0.12);
    this.shake(10);
    sfx.play('clear');
  }

  // ───────────────────────── firing ─────────────────────────
  fire() {
    sfx.ensure();
    if (this.status !== 'playing' || this.ammoLeft <= 0 || this.cool > 0 || this.wheel.intro < 0.95) return;
    const def = WEAPON_MAP[this.weaponId];
    this.ammoLeft--;
    this.shotsFired++;
    this.cool = def.cooldown;
    const mx = GUN_X;
    const my = GUN_Y;
    switch (this.weaponId) {
      case 'golden':
        this.fireGolden(mx, my);
        break;
      case 'blackhole':
        this.fireBlackHole(mx, my);
        break;
      case 'ketapel':
        this.fireKetapel(mx, my);
        break;
      case 'sumpit':
        this.fireSumpit(mx, my);
        break;
      case 'shotgun':
        this.fireShotgun(mx, my);
        break;
      case 'soaker':
        this.fireSoaker(mx, my);
        break;
      case 'snowball':
        this.fireSnowball(mx, my);
        break;
      case 'sniper':
        this.fireSniper(mx, my);
        break;
      case 'flame':
        this.fireFlame(mx, my);
        break;
      case 'bubble':
        this.fireBubble(mx, my);
        break;
      case 'bamboo':
        this.fireBamboo(mx, my);
        break;
      case 'banana':
        this.fireBanana(mx, my);
        break;
      case 'harpoon':
        this.fireHarpoon(mx, my);
        break;
      case 'chicken':
        this.fireChicken(mx, my);
        break;
      case 'confetti':
        this.fireConfetti(mx, my);
        break;
      case 'seed':
        this.fireSeed(mx, my);
        break;
      case 'pizza':
        this.firePizza(mx, my);
        break;
      case 'minigun':
        this.fireMinigun(mx, my);
        break;
      case 'crossbow':
        this.fireCrossbow(mx, my);
        break;
      case 'plasma':
        this.firePlasma(mx, my);
        break;
      case 'laser':
        this.fireLaser(mx, my);
        break;
      case 'dragon':
        this.fireDragon(mx, my);
        break;
      case 'gravity':
        this.fireGravity(mx, my);
        break;
      case 'honey':
        this.fireHoney(mx, my);
        break;
      case 'coconut':
        this.fireCoconut(mx, my);
        break;
      case 'angklung':
        this.fireAngklung(mx, my);
        break;
      case 'bee':
        this.fireBee(mx, my);
        break;
      case 'sakura':
        this.fireSakura(mx, my);
        break;
      case 'firework':
        this.fireFirework(mx, my);
        break;
      case 'keris':
        this.fireKeris(mx, my);
        break;
      case 'moonbeam':
        this.fireMoonbeam(mx, my);
        break;
      case 'storm':
        this.fireStorm(mx, my);
        break;
      case 'pencil':
        this.firePencil(mx, my);
        break;
      case 'sandal':
        this.fireSandal(mx, my);
        break;
      case 'paintball':
        this.firePaintball(mx, my);
        break;
      case 'wand':
        this.fireWand(mx, my);
        break;
      case 'shark':
        this.fireShark(mx, my);
        break;
      case 'ghost':
        this.fireGhost(mx, my);
        break;
      case 'ufo':
        this.fireUfo(mx, my);
        break;
      case 'rainbow':
        this.fireRainbow(mx, my);
        break;
      case 'meteor':
        this.fireMeteor(mx, my);
        break;
      case 'diamond':
        this.fireDiamond(mx, my);
        break;
      case 'fish':
        this.fireFish(mx, my);
        break;
      case 'rpg':
        this.fireRpg(mx, my);
        break;
      case 'cricket':
        this.fireCricket(mx, my);
        break;
      case 'electro':
        this.fireElectro(mx, my);
        break;
      case 'bazooka':
        this.fireBazooka(mx, my);
        break;
      case 'freeze':
        this.fireFreeze(mx, my);
        break;
      case 'rail':
        this.fireRail(mx, my);
        break;
      case 'magnet':
        this.fireMagnet(mx, my);
        break;
      case 'shrink':
        this.fireSizeRay(mx, my, false);
        break;
      case 'grow':
        this.fireSizeRay(mx, my, true);
        break;
      case 'pirate':
        this.firePirate(mx, my);
        break;
      case 'card':
        this.fireCard(mx, my);
        break;
      case 'holy':
        this.fireHoly(mx, my);
        break;
      case 'unicorn':
        this.fireUnicorn(mx, my);
        break;
      case 'obliterator':
        this.fireObliterator(mx, my);
        break;
      case 'coin':
        this.fireCoin(mx, my);
        break;
      case 'saber':
        this.fireSaber(mx, my);
        break;
      case 'gauntlet':
        this.fireGauntlet(mx, my);
        break;
      case 'ruby':
        this.fireRuby(mx, my);
        break;
      case 'emerald':
        this.fireEmerald(mx, my);
        break;
      case 'sapphire':
        this.fireSapphire(mx, my);
        break;
      case 'crystal':
        this.fireCrystal(mx, my);
        break;
      case 'beerifle':
        this.fireBeeRifle(mx, my);
        break;
      case 'charge':
        this.fireCharge(mx, my);
        break;
      case 'pulse':
        this.firePulse(mx, my);
        break;
      case 'cryo':
        this.fireCryo(mx, my);
        break;
      case 'hyperdrive':
        this.fireHyper(mx, my);
        break;
      case 'quantum':
        this.fireQuantum(mx, my);
        break;
      case 'wars':
        this.fireWars(mx, my);
        break;
    }
  }

  private fireGolden(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 15;
    this.addFX(new MuzzleFlash(mx, my - 4, 'gold', 0.085));
    this.addFX(new Light(mx, my - 10, 220, '255,190,80', 0.75, 0.2));
    S.stars(ps, mx, my - 8, 14, '255,220,130', [80, 300], [7, 14], -Math.PI / 2, 0.9);
    S.smoke(ps, mx, my - 10, 6, '235,215,175', [10, 44], { vy: [-90, -40], vx: [-30, 30], alpha: 0.35, life: [0.8, 1.3] });
    S.ring(ps, mx, my - 6, 3, 30, '255,230,160', 2, 0.2, true);
    S.sparks(ps, mx, my - 6, 10, -Math.PI / 2, 0.5, [300, 600], '255,220,140', 1.3, 300);
    this.projectiles.push(new GoldenBullet(this, mx, my - 6));
    this.after(0.035, () => {
      const ex = mx - 5.5 * GOLDEN_SCALE;
      const ey = my + 87 * GOLDEN_SCALE;
      ps.add({
        k: K.CUSTOM,
        x: ex,
        y: ey,
        vx: rand(-280, -180),
        vy: rand(-300, -190),
        g: 1300,
        rot: 0,
        vrot: rand(-30, -18),
        life: 1.5,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          drawCasing(c);
          c.restore();
        },
      });
      S.smoke(ps, ex, ey, 2, '220,210,190', [5, 18], { vy: [-40, -15], alpha: 0.3 });
      S.stars(ps, ex, ey, 3, '255,220,130', [30, 90], [6, 10]);
    });
    this.shake(4);
    sfx.play('golden_fire');
  }

  private fireBlackHole(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('bh_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my;
    for (let i = 0; i < 28; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(PURPLES) });
    }
    for (let i = 0; i < 3; i++) {
      const an = rand(0, TAU);
      this.addFX(new Lightning(mx + Math.cos(an) * 52, my + Math.sin(an) * 52, mx, my, 0.28, '190,120,255', 1.1, 1, 0.05));
    }
    this.after(0.28, () => {
      a.charging = false;
      a.charge = 0;
      a.orb = 0.12;
      a.fireT = 0;
      a.recoilV += 8;
      this.projectiles.push(new BlackHoleShot(this, mx, my - 4));
      S.ring(ps, mx, my, 6, 84, '190,120,255', 7, 0.42, true);
      S.ring(ps, mx, my, 3, 42, '255,255,255', 3, 0.22, true);
      this.addFX(new Light(mx, my, 210, '160,80,255', 0.85, 0.32));
      S.sparks(ps, mx, my, 18, -Math.PI / 2, 1.2, [150, 450], '215,165,255', 1.5, 200);
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + rand(-1.6, 1.6);
        const L = rand(40, 80);
        this.addFX(new Lightning(mx, my, mx + Math.cos(an) * L, my + Math.sin(an) * L, 0.16, '200,140,255', 1.3, 1));
      }
      this.shake(5);
      sfx.play('bh_fire');
    });
  }

  private fireKetapel(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.loaded = false;
    a.pouchTarget = 0;
    a.pouchV = -1700;
    a.bandWob = 7;
    a.fireT = 0;
    a.recoilV += 2.5;
    this.projectiles.push(new StoneShot(this, mx, my + 40));
    S.smoke(ps, mx, my, 5, '240,240,250', [6, 26], { vy: [-120, -50], alpha: 0.22, life: [0.4, 0.7] });
    S.ring(ps, mx, my - 2, 4, 32, '255,255,255', 2, 0.25, false, 0.5);
    S.smoke(ps, mx, my + 46, 3, '200,175,140', [5, 18], { vy: [-20, 10], alpha: 0.3 });
    sfx.play('sling_fire');
    this.after(0.34, () => {
      a.loaded = true;
      a.pouchTarget = 46;
    });
  }

  private fireSumpit(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.pulse = 0;
    a.fireT = 0;
    sfx.play('sumpit_fire');
    this.after(0.075, () => {
      a.recoilV += 4;
      a.tasselV += 7;
      this.projectiles.push(new DartShot(this, mx, my - 38));
      S.smoke(ps, mx, my - 4, 8, '235,242,255', [5, 28], { vy: [-140, -40], vx: [-50, 50], alpha: 0.32, life: [0.5, 0.9], drag: 3 });
      S.ring(ps, mx, my - 4, 2, 24, '255,255,255', 2, 0.26, false, 0.6);
    });
  }

  private fireShotgun(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 22;
    this.addFX(new MuzzleFlash(mx, my - 6, 'shotgun', 0.1));
    this.addFX(new Light(mx, my - 30, 330, '255,150,60', 0.9, 0.22));
    this.flashScreen('255,190,120', 0.16);
    this.projectiles.push(new ShotgunBlast(this, mx, my - 8));
    S.smoke(ps, mx, my - 14, 13, '165,165,170', [14, 74], { vy: [-150, -50], vx: [-45, 45], alpha: 0.5, life: [1.1, 1.8], drag: 1.7 });
    S.embers(ps, mx, my - 8, 16, -Math.PI / 2, 0.38, [300, 760]);
    ps.add({
      k: K.CUSTOM,
      x: mx,
      y: my - 10,
      vx: rand(-40, 40),
      vy: -780,
      g: 700,
      drag: 4.2,
      rot: 0,
      vrot: rand(-22, 22),
      life: 1.3,
      draw: (c, q) => {
        c.save();
        c.translate(q.x, q.y);
        c.rotate(q.rot);
        drawWad(c);
        c.restore();
      },
    });
    this.shake(10);
    sfx.play('shotgun_fire');
    this.after(0.17, () => {
      a.pumpStart = this.time;
      sfx.play('pump');
    });
    this.after(0.28, () => {
      const ex = mx - 2.5 * SHOTGUN_SCALE;
      const ey = my + 146 * SHOTGUN_SCALE;
      ps.add({
        k: K.CUSTOM,
        x: ex,
        y: ey,
        vx: rand(-330, -230),
        vy: rand(-340, -240),
        g: 1400,
        rot: 0,
        vrot: rand(-26, -14),
        life: 1.6,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          drawShell(c);
          c.restore();
        },
      });
      S.smoke(ps, ex, ey, 3, '170,170,175', [5, 22], { vy: [-60, -20], alpha: 0.35 });
    });
  }

  private fireSoaker(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    a.slosh = Math.min(1.8, a.slosh + 1.1);
    a.gauge = 0.22;
    a.water = this.ammoLeft / this.ammoTotal;
    this.projectiles.push(new WaterJet(this, mx, my - 2));
    S.droplets(ps, mx, my - 4, 16, -Math.PI / 2, 0.26, [300, 650], [0.7, 1.5], '170,220,255', 500);
    S.smoke(ps, mx, my - 8, 5, '220,240,255', [6, 28], { vy: [-120, -40], alpha: 0.26, life: [0.4, 0.8] });
    sfx.play('soaker_fire');
    this.after(0.1, () => {
      a.pumpStart = this.time;
    });
  }

  private fireSnowball(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 9;
    this.addFX(new FrostFlash(mx, my - 4));
    this.addFX(new Light(mx, my - 16, 210, '140,210,255', 0.75, 0.24));
    S.smoke(ps, mx, my - 10, 11, '238,247,255', [10, 54], { vx: [-80, 80], vy: [-190, -60], alpha: 0.55, life: [0.5, 1.0], drag: 2.2 });
    S.snowflakes(ps, mx, my - 10, 16, -Math.PI / 2, 0.85, [140, 420]);
    S.shards(ps, mx, my - 8, 9, -Math.PI / 2, 0.7, [260, 560], ICE_COLS);
    S.stars(ps, mx, my - 10, 10, '200,235,255', [80, 270], [8, 15], -Math.PI / 2, 0.9);
    S.ring(ps, mx, my - 6, 3, 44, '200,235,255', 3, 0.26, true);
    S.ring(ps, mx, my - 6, 2, 24, '255,255,255', 2, 0.18, true);
    this.projectiles.push(new SnowballShot(this, mx, my - 14));
    this.shake(4);
    sfx.play('snow_fire');
  }

  private fireSniper(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 22;
    this.addFX(new SniperFlash(mx, my - 4));
    this.addFX(new Light(mx, my - 24, 280, '255,235,190', 0.85, 0.2));
    this.flashScreen('255,245,220', 0.18);
    this.shake(9);
    S.ring(ps, mx, my - 4, 4, 70, '255,240,210', 3, 0.26, true);
    for (const side of [-1, 1]) {
      S.smoke(ps, mx + side * 8, my + 4, 5, '215,205,190', [10, 40], { vx: [side * 90, side * 260], vy: [-30, 20], alpha: 0.4, life: [0.5, 0.9], drag: 3 });
      S.sparks(ps, mx + side * 8, my, 8, side > 0 ? 0 : Math.PI, 0.35, [250, 600], '255,220,140', 1.3, 200);
    }
    S.embers(ps, mx, my - 8, 10, -Math.PI / 2, 0.4, [200, 600]);
    S.smoke(ps, mx, my - 12, 6, '225,215,200', [8, 32], { vy: [-120, -40], vx: [-20, 20], alpha: 0.3 });
    this.projectiles.push(new SniperShot(this, mx, my - 14));
    sfx.play('sniper_fire');
    this.after(0.28, () => {
      a.boltStart = this.time;
      sfx.play('bolt');
    });
    this.after(0.46, () => {
      const ex = mx + 4;
      const ey = my + 140;
      ps.add({
        k: K.CUSTOM,
        x: ex,
        y: ey,
        vx: rand(150, 260),
        vy: rand(-360, -240),
        g: 1500,
        rot: 0,
        vrot: rand(14, 26),
        life: 1.6,
        draw: (c, q) => {
          c.save();
          c.translate(q.x, q.y);
          c.rotate(q.rot);
          drawRifleCasing(c);
          c.restore();
        },
      });
      S.smoke(ps, ex, ey, 2, '200,190,170', [5, 18], { vy: [-40, -15], alpha: 0.3 });
    });
  }

  private fireFlame(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 2.5;
    this.addFX(new Light(mx, my - 16, 220, '255,150,50', 0.8, 0.25));
    S.fire(ps, mx, my - 8, 10, -Math.PI / 2, 0.35, [150, 380], [18, 28], [30, 48], [0.2, 0.35], { g: -100 });
    S.embers(ps, mx, my - 8, 14, -Math.PI / 2, 0.6, [150, 480]);
    S.smoke(ps, mx, my - 12, 4, '70,60,55', [8, 28], { vy: [-120, -40], alpha: 0.28, life: [0.6, 1] });
    this.projectiles.push(new FlameJet(this, mx, my - 8));
    sfx.play('flame_fire');
  }

  private fireBubble(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 2.5;
    S.bubbleSpray(ps, mx, my - 8);
    S.ring(ps, mx, my - 6, 4, 46, '255,160,230', 3, 0.3, true);
    S.ring(ps, mx, my - 6, 3, 34, '140,225,255', 2.2, 0.26, true);
    S.stars(ps, mx, my - 8, 10, '255,225,250', [60, 220], [7, 13], -Math.PI / 2, 0.9);
    this.addFX(new Light(mx, my - 12, 150, '255,170,230', 0.5, 0.22));
    this.projectiles.push(new BubbleShot(this, mx, my - 8));
    sfx.play('bubble_fire');
  }

  private fireBamboo(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const fx = mx - 50;
    const fy = my + 114;
    a.fuse = 0.18;
    sfx.play('bamboo_fuse');
    S.sparks(ps, fx, fy, 14, -Math.PI / 2, Math.PI, [60, 220], '255,220,120', 1.3, 500);
    S.glow(ps, fx, fy, 40, 10, '255,200,100', 0.2, 1);
    this.after(0.17, () => {
      a.fireT = 0;
      a.recoilV += 26;
      this.addFX(new BambooBlast(mx, my - 6));
      this.addFX(new Light(mx, my - 40, 420, '255,160,60', 1, 0.34));
      this.flashScreen('255,200,120', 0.26);
      for (let i = 0; i < 16; i++) {
        const an = (i / 16) * TAU;
        ps.add({ k: K.SMOKE, x: mx + Math.cos(an) * 10, y: my - 14 + Math.sin(an) * 3, vx: Math.cos(an) * rand(150, 230), vy: Math.sin(an) * rand(25, 50) - 30, size: 16, size2: 46, life: rand(0.8, 1.3), color: '200,190,175', alpha: 0.5, drag: 2.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
      }
      S.fire(ps, mx, my - 10, 18, -Math.PI / 2, 0.55, [220, 520], [24, 38], [46, 80], [0.25, 0.5], { g: -120 });
      S.smoke(ps, mx, my - 20, 14, '60,52,46', [26, 100], { vx: [-70, 70], vy: [-190, -60], alpha: 0.6, life: [1.2, 2], drag: 1.8 });
      S.embers(ps, mx, my - 8, 26, -Math.PI / 2, 0.8, [200, 700]);
      S.sparks(ps, mx, my - 8, 20, -Math.PI / 2, 0.7, [250, 700], '255,210,120', 1.5, 300);
      S.chips(ps, mx, my - 10, 10, -Math.PI / 2, 0.7, [200, 500], ['120,170,50', '90,140,40', '200,225,120']);
      S.ring(ps, mx, my - 8, 6, 120, '255,200,120', 6, 0.35, true);
      this.projectiles.push(new BambooShot(this, mx, my - 16));
      this.shake(14);
      sfx.play('bamboo_fire');
    });
  }

  private fireBanana(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 4;
    this.addFX(new BananaPop(mx, my - 24, 1));
    this.addFX(new Light(mx, my - 14, 170, '255,220,90', 0.6, 0.2));
    S.stars(ps, mx, my - 12, 12, '255,230,100', [90, 300], [8, 15], -Math.PI / 2, 0.9);
    S.sparks(ps, mx, my - 10, 12, -Math.PI / 2, 0.8, [200, 500], '255,225,100', 1.4, 400);
    S.chips(ps, mx, my - 8, 6, -Math.PI / 2, 0.8, [150, 380], ['255,225,80', '240,190,20', '255,240,150']);
    S.ring(ps, mx, my - 8, 3, 40, '255,230,120', 3, 0.24, true);
    S.smoke(ps, mx, my - 12, 4, '255,238,160', [8, 30], { vy: [-120, -40], alpha: 0.28, life: [0.4, 0.8] });
    this.projectiles.push(new BananaShot(this, mx, my - 12));
    this.shake(4);
    sfx.play('banana_fire');
  }

  private fireHarpoon(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 24;
    a.fireT = 0;
    a.recoilV += 12;
    a.spinV += 34;
    this.addFX(new Light(mx, y, 190, '120,255,235', 0.65, 0.2));
    S.ring(ps, mx, y, 4, 64, '170,255,245', 3, 0.28, true);
    S.ring(ps, mx, y, 3, 38, '255,255,255', 2, 0.2, true);
    S.smoke(ps, mx, y, 9, '225,245,250', [8, 36], { vx: [-90, 90], vy: [-160, -40], alpha: 0.4, life: [0.4, 0.8], drag: 2.8 });
    S.sparks(ps, mx, y, 12, -Math.PI / 2, 0.9, [200, 520], '160,255,240', 1.3, 300);
    S.stars(ps, mx, y, 6, '170,255,245', [60, 200], [7, 12], -Math.PI / 2, 0.9);
    this.projectiles.push(new HarpoonShot(this, mx, y));
    this.shake(6);
    sfx.play('harpoon_fire');
  }

  private fireChicken(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 10;
    a.fireT = 0;
    a.recoilV += 7;
    this.addFX(new ArcWaves(mx, y - 6));
    this.addFX(new Light(mx, y, 150, '255,230,110', 0.5, 0.2));
    S.feathers(ps, mx, y, 12, -Math.PI / 2, 0.9, [120, 360]);
    S.stars(ps, mx, y, 8, '255,235,120', [80, 260], [7, 13], -Math.PI / 2, 0.9);
    S.smoke(ps, mx, y, 5, '255,248,215', [8, 30], { vy: [-120, -40], vx: [-50, 50], alpha: 0.35, life: [0.4, 0.8] });
    ps.add({ k: K.TEXT, x: mx, y: y - 52, vy: -80, drag: 1.8, size: 22, text: 'SQUEEK!', color: '255,236,140', life: 0.8 });
    this.projectiles.push(new ChickenShot(this, mx, y - 4));
    this.shake(4);
    sfx.play('chicken_fire');
  }

  private fireConfetti(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 8;
    a.fireT = 0;
    a.recoilV += 10;
    this.addFX(new PartyPop(mx, y));
    this.addFX(new Light(mx, y - 10, 210, '255,200,255', 0.7, 0.24));
    S.confetti(ps, mx, y, 54, -Math.PI / 2, 0.75, [180, 560], [3, 6.5], [1.2, 2.1]);
    S.streamers(ps, mx, y, 6, -Math.PI / 2, 0.7, [220, 520]);
    S.smoke(ps, mx, y, 6, '255,235,250', [10, 40], { vy: [-140, -50], vx: [-60, 60], alpha: 0.35, life: [0.5, 0.9] });
    S.ring(ps, mx, y, 3, 56, '255,230,110', 3, 0.26, true);
    S.stars(ps, mx, y, 8, '255,235,250', [80, 260], [8, 14], -Math.PI / 2, 0.9);
    this.projectiles.push(new ConfettiShot(this, mx, y - 4));
    this.shake(5);
    sfx.play('confetti_fire');
  }

  private fireSeed(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 8;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new Light(mx, y, 130, '150,255,120', 0.45, 0.2));
    S.leaves(ps, mx, y, 10, -Math.PI / 2, 0.9, [140, 380]);
    S.soil(ps, mx, y, 8, -Math.PI / 2, 0.7, [120, 340]);
    S.smoke(ps, mx, y, 5, '170,225,140', [8, 30], { vy: [-120, -40], vx: [-50, 50], alpha: 0.3, life: [0.4, 0.8] });
    S.stars(ps, mx, y, 6, '190,255,150', [60, 220], [7, 12], -Math.PI / 2, 0.9);
    S.ring(ps, mx, y, 3, 40, '160,255,130', 2.5, 0.24, true);
    this.projectiles.push(new SeedShot(this, mx, y - 4));
    this.shake(3);
    sfx.play('seed_fire');
  }

  private firePizza(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 8;
    a.fireT = 0;
    a.recoilV += 8;
    this.addFX(new Light(mx, y - 8, 190, '255,190,80', 0.65, 0.24));
    S.smoke(ps, mx, y, 10, '255,248,235', [10, 46], { vx: [-80, 80], vy: [-170, -50], alpha: 0.4, life: [0.5, 1.0], drag: 2.2 });
    S.pepperoni(ps, mx, y, 3, -Math.PI / 2, 0.8, [200, 420]);
    S.goo(ps, mx, y, 8, -Math.PI / 2, 0.8, [160, 400], [1.6, 3], '255,200,60', '170,90,10');
    S.embers(ps, mx, y, 12, -Math.PI / 2, 0.7, [150, 450], '255,190,70');
    S.ring(ps, mx, y, 3, 52, '255,215,120', 3, 0.26, true);
    S.stars(ps, mx, y, 6, '255,225,130', [60, 220], [7, 12], -Math.PI / 2, 0.9);
    this.projectiles.push(new PizzaShot(this, mx, y - 4));
    this.shake(4);
    sfx.play('pizza_fire');
  }

  private fireMinigun(mx: number, my: number) {
    const a = this.anim;
    a.fireT = 0;
    a.spinV = 48;
    this.projectiles.push(new MinigunBurst(this, mx, my - 6));
    sfx.play('minigun_fire');
  }

  private fireCrossbow(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 10;
    this.addFX(new Light(mx, my - 10, 130, '255,230,180', 0.4, 0.14));
    S.ring(ps, mx, my - 6, 3, 50, '235,240,245', 2.5, 0.26, false, 0.7);
    S.ring(ps, mx - 67, my + 12, 2, 24, '255,255,255', 1.8, 0.22, true);
    S.ring(ps, mx + 67, my + 12, 2, 24, '255,255,255', 1.8, 0.22, true);
    S.smoke(ps, mx, my - 4, 6, '220,215,205', [8, 34], { vx: [-110, 110], vy: [-60, 30], alpha: 0.35, life: [0.4, 0.8], drag: 3 });
    S.sparks(ps, mx, my - 4, 6, -Math.PI / 2, 1.2, [150, 400], '255,235,200', 1.1, 300);
    this.projectiles.push(new CrossbowShot(this, mx, my - 4));
    this.shake(4);
    sfx.play('crossbow_fire');
  }

  private firePlasma(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('plasma_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 6;
    for (let i = 0; i < 30; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(GREENS) });
    }
    for (let i = 0; i < 3; i++) {
      const an = rand(0, TAU);
      this.addFX(new Lightning(mx + Math.cos(an) * 54, my + Math.sin(an) * 54, mx, my - 6, 0.28, '120,255,170', 1.1, 1, 0.05));
    }
    this.after(0.2, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 9;
      this.addFX(new PlasmaFlash(mx, my - 6));
      this.addFX(new Light(mx, my - 14, 230, '60,255,150', 0.85, 0.28));
      S.ring(ps, mx, my - 6, 5, 90, '90,255,170', 6, 0.4, true);
      S.ring(ps, mx, my - 6, 3, 44, '255,255,255', 3, 0.22, true);
      S.sparks(ps, mx, my - 6, 22, -Math.PI / 2, 1.2, [150, 520], '140,255,190', 1.5, 200);
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + rand(-1.6, 1.6);
        const L = rand(40, 80);
        this.addFX(new Lightning(mx, my - 6, mx + Math.cos(an) * L, my - 6 + Math.sin(an) * L, 0.16, '150,255,190', 1.3, 1));
      }
      this.projectiles.push(new PlasmaShot(this, mx, my - 8));
      this.shake(6);
      sfx.play('plasma_fire');
    });
  }

  private fireLaser(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('laser_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 2;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 100);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: this.orbTarget, pull: 1500, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['255,90,90', '255,170,150', '255,230,225']) });
    }
    this.addFX(new Light(mx, my - 6, 150, '255,60,60', 0.5, 0.3));
    this.after(0.26, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 6;
      this.projectiles.push(new LaserBeam(this, mx, my - 4));
      this.addFX(new Light(mx, my - 10, 240, '255,70,60', 0.9, 0.34));
      S.ring(ps, mx, my - 4, 4, 80, '255,100,100', 5, 0.36, true);
      S.sparks(ps, mx, my - 4, 16, -Math.PI / 2, 1.2, [150, 450], '255,200,170', 1.4, 200);
      this.shake(5);
      sfx.play('laser_fire');
    });
  }

  private fireDragon(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 4;
    a.fireT = 0;
    a.recoilV += 12;
    this.addFX(new DragonBreathFlash(mx, y));
    this.addFX(new Light(mx, y - 20, 300, '255,140,50', 0.9, 0.3));
    this.flashScreen('255,150,60', 0.14);
    S.fire(ps, mx, y, 22, -Math.PI / 2, 0.55, [260, 620], [26, 44], [50, 90], [0.25, 0.5], { g: -140 });
    S.embers(ps, mx, y, 26, -Math.PI / 2, 0.8, [200, 640]);
    S.sparks(ps, mx, y, 18, -Math.PI / 2, 0.9, [260, 640], '255,200,110', 1.5, 200);
    S.smoke(ps, mx, y - 10, 9, '60,50,46', [18, 70], { vx: [-70, 70], vy: [-180, -60], alpha: 0.5, life: [0.8, 1.4] });
    S.ring(ps, mx, y, 5, 90, '255,170,70', 6, 0.36, true);
    this.projectiles.push(new DragonFire(this, mx, y - 18));
    this.shake(8);
    sfx.play('dragon_fire');
  }

  private fireGravity(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('gravity_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 10;
    for (let i = 0; i < 28; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 10 + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['120,200,255', '200,240,255', '80,160,255']) });
    }
    S.ring(ps, mx, my - 10, 70, 6, '120,205,255', 3, 0.26, true, 0.8);
    this.after(0.26, () => {
      a.charging = false;
      a.charge = 0;
      a.orb = 0.12;
      a.fireT = 0;
      a.recoilV += 8;
      this.projectiles.push(new GravityShot(this, mx, my - 12));
      this.addFX(new GravityPulse(mx, my - 6, 0.5, 0.9));
      this.addFX(new Light(mx, my - 8, 210, '90,180,255', 0.85, 0.32));
      S.ring(ps, mx, my - 8, 6, 84, '120,205,255', 6, 0.42, true);
      S.sparks(ps, mx, my - 8, 18, -Math.PI / 2, 1.2, [150, 450], '160,220,255', 1.5, 200);
      this.shake(5);
      sfx.play('gravity_fire');
    });
  }

  private fireHoney(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 2;
    a.fireT = 0;
    a.recoilV += 6;
    this.addFX(new HexBurst(mx, y - 6, 0.3, 0.6));
    this.addFX(new Light(mx, y - 8, 150, '255,190,60', 0.5, 0.2));
    S.goo(ps, mx, y, 12, -Math.PI / 2, 0.7, [200, 520], [1.4, 3], '255,184,30', '150,80,0');
    S.hexes(ps, mx, y, 8, -Math.PI / 2, 0.9, [100, 320]);
    S.stars(ps, mx, y, 6, '255,225,130', [60, 220], [7, 12], -Math.PI / 2, 0.9);
    S.ring(ps, mx, y, 3, 42, '255,200,80', 3, 0.26, true);
    this.projectiles.push(new HoneyShot(this, mx, y - 10));
    this.shake(3);
    sfx.play('honey_fire');
  }

  private fireCoconut(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 4;
    a.fireT = 0;
    a.recoilV += 11;
    this.addFX(new Light(mx, y - 10, 190, '255,240,200', 0.55, 0.22));
    S.smoke(ps, mx, y - 4, 12, '245,248,240', [12, 56], { vx: [-80, 80], vy: [-190, -60], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    S.sparks(ps, mx, y - 4, 8, -Math.PI / 2, 0.8, [200, 500], '255,235,190', 1.2, 300);
    S.petals(ps, mx - 24, my + 160, 5, -Math.PI / 2, 1.2, [60, 200], [1, 1.8], 90);
    S.leaves(ps, mx, y, 6, -Math.PI / 2, 1, [80, 240]);
    S.ring(ps, mx, y - 2, 4, 50, '240,255,230', 3, 0.28, true);
    this.projectiles.push(new CoconutShot(this, mx, y - 8));
    this.shake(6);
    sfx.play('coconut_fire');
  }

  private fireAngklung(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 2;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new GravityPulse(mx, y - 4, 0.4, 0.8, '255,215,100'));
    this.addFX(new Light(mx, y - 10, 180, '255,210,90', 0.6, 0.24));
    S.notes(ps, mx, y - 6, 9, -Math.PI / 2, 1.0, [120, 340]);
    S.ring(ps, mx, y - 4, 4, 56, '255,215,100', 3, 0.3, true);
    S.ring(ps, mx, y - 4, 3, 38, '255,255,255', 2, 0.22, true);
    S.stars(ps, mx, y - 6, 8, '255,235,160', [60, 220], [7, 13], -Math.PI / 2, 1);
    this.projectiles.push(new NoteShot(this, mx, y - 8));
    this.shake(3);
    sfx.play('angklung_fire');
  }

  private fireBee(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 2;
    a.fireT = 0;
    a.recoilV += 4;
    this.addFX(new Light(mx, y - 8, 160, '255,210,80', 0.5, 0.22));
    S.bees(ps, mx, y - 6, 7, -Math.PI / 2, 0.8, [180, 480]);
    S.goo(ps, mx, y, 8, -Math.PI / 2, 0.7, [160, 400], [1.3, 2.6], '255,184,30', '150,80,0');
    S.hexes(ps, mx, y, 6, -Math.PI / 2, 0.9, [100, 300]);
    S.ring(ps, mx, y - 4, 3, 44, '255,215,90', 3, 0.26, true);
    ps.add({ k: K.TEXT, x: mx, y: y - 44, vy: -70, drag: 1.8, size: 22, text: 'BZZ!', color: '255,226,80', life: 0.75 });
    this.projectiles.push(new BeeSwarm(this, mx, y - 12));
    this.shake(3);
    sfx.play('bee_fire');
  }

  private fireSakura(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 8;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new SpiralFX(mx, y - 6, '255,170,205', 0.5, 3, 64, 1));
    this.addFX(new Light(mx, y - 10, 170, '255,170,205', 0.55, 0.26));
    S.petals(ps, mx, y - 4, 20, -Math.PI / 2, 1.0, [140, 400], [1.2, 2.2], 80);
    S.stars(ps, mx, y - 6, 8, '255,220,235', [60, 220], [7, 13], -Math.PI / 2, 1);
    S.ring(ps, mx, y - 4, 4, 54, '255,160,200', 3, 0.28, true);
    S.sparks(ps, mx, y - 4, 8, -Math.PI / 2, 0.9, [150, 400], '255,210,230', 1.2, 200);
    this.projectiles.push(new SakuraShot(this, mx, y - 10));
    this.shake(3);
    sfx.play('sakura_fire');
  }

  private fireFirework(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const idx = (this.shotsFired - 1) % 3;
    a.idx = idx;
    a.fireT = 0;
    a.recoilV += 6;
    // Match the tighter, slightly lower side tubes in drawFireworkLauncher.
    const tx = mx + (idx - 1) * 15 * 0.92;
    const ty = my + (idx === 1 ? -4 : 8) * 0.92;
    const cols = ROCKET_COLS[idx].burst;
    this.addFX(new RadialFlash(tx, ty - 4, cols, 0.12, 44, 12));
    this.addFX(new Light(tx, ty - 10, 200, cols[0], 0.7, 0.24));
    S.sparks(ps, tx, ty - 4, 20, -Math.PI / 2, 0.8, [200, 560], '255,225,130', 1.4, 400);
    S.smoke(ps, tx, ty - 6, 8, '225,225,230', [10, 44], { vx: [-70, 70], vy: [-150, -50], alpha: 0.45, life: [0.7, 1.2], drag: 2.2 });
    S.embers(ps, tx, ty - 4, 12, -Math.PI / 2, 0.7, [150, 450], cols[0]);
    S.ring(ps, tx, ty - 4, 3, 40, cols[0], 3, 0.24, true);
    this.projectiles.push(new FireworkShot(this, tx, ty - 8, idx));
    this.shake(5);
    sfx.play('firework_fire');
  }

  private fireKeris(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 6;
    this.addFX(new Mandala(mx, my + 10, 0.5, 0.7, 0.5, 1));
    this.addFX(new Light(mx, my - 6, 220, '255,205,90', 0.8, 0.3));
    S.sparks(ps, mx, my, 18, -Math.PI / 2, 0.9, [200, 560], '255,225,130', 1.5, 200);
    S.stars(ps, mx, my - 4, 10, '255,230,150', [60, 240], [8, 14], -Math.PI / 2, 1);
    S.ring(ps, mx, my - 2, 4, 70, '255,215,100', 4, 0.34, true);
    S.smoke(ps, mx, my - 4, 5, '255,240,205', [10, 40], { vy: [-120, -40], vx: [-40, 40], alpha: 0.25, life: [0.6, 1] });
    this.projectiles.push(new KerisShot(this, mx, my - 2));
    this.shake(5);
    sfx.play('keris_fire');
  }

  private fireMoonbeam(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('moon_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my + 9;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + 9 + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(MOON_COLS) });
    }
    this.addFX(new RuneCircle(mx, my + 10, '200,190,255', '255,250,255', 0.34, 0.6, 0.5, 1));
    this.after(0.22, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 7;
      this.addFX(new MoonSlash(mx, my - 6, 0.4, 0.7));
      this.addFX(new Light(mx, my - 10, 220, '190,170,255', 0.85, 0.3));
      S.stars(ps, mx, my - 8, 12, '235,228,255', [80, 280], [7, 13], -Math.PI / 2, 0.9);
      S.moonDust(ps, mx, my - 6, 10, -Math.PI / 2, 1.2, [40, 160]);
      S.ring(ps, mx, my - 4, 5, 70, '200,185,255', 4, 0.34, true);
      S.sparks(ps, mx, my - 6, 14, -Math.PI / 2, 1.1, [150, 460], '210,200,255', 1.4, 200);
      this.projectiles.push(new MoonShot(this, mx, my - 6));
      this.shake(5);
      sfx.play('moon_fire');
    });
  }

  private fireStorm(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('storm_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my + 7;
    for (let i = 0; i < 5; i++) this.addFX(new Lightning(mx + rand(-44, 44), my - 30 + rand(-12, 12), mx, my + 7, 0.24, '150,210,255', 1.2, 1, 0.04));
    for (let i = 0; i < 22; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 90);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + 7 + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2), len: 0.03, life: 0.5, color: pick(['170,220,255', '255,255,255', '110,180,255']) });
    }
    this.after(0.22, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 8;
      this.addFX(new Light(mx, my - 4, 230, '140,200,255', 0.85, 0.28));
      S.ring(ps, mx, my - 2, 5, 80, '150,210,255', 5, 0.36, true);
      S.sparks(ps, mx, my - 2, 20, -Math.PI / 2, 1.3, [150, 480], '170,220,255', 1.5, 200);
      for (let i = 0; i < 5; i++) {
        const an = -Math.PI / 2 + rand(-1.6, 1.6);
        const L = rand(40, 80);
        this.addFX(new Lightning(mx, my, mx + Math.cos(an) * L, my + Math.sin(an) * L, 0.16, '170,220,255', 1.3, 1));
      }
      this.projectiles.push(new StormShot(this, mx, my - 2));
      this.shake(6);
      sfx.play('storm_fire');
    });
  }

  private firePencil(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new Light(mx, my - 6, 130, '255,235,170', 0.4, 0.16));
    S.scribbles(ps, mx, my - 6, 6, -Math.PI / 2, 0.9, [160, 420]);
    S.shavings(ps, mx, my - 4, 5, -Math.PI / 2, 1.1, [100, 300]);
    S.chips(ps, mx, my - 2, 5, -Math.PI / 2, 0.9, [150, 380], ['255,150,172', '240,120,150']);
    S.smoke(ps, mx, my - 6, 4, '150,150,162', [8, 28], { vy: [-120, -40], vx: [-40, 40], alpha: 0.3, life: [0.4, 0.8] });
    S.sparks(ps, mx, my - 6, 6, -Math.PI / 2, 0.8, [150, 380], '235,235,245', 1.1, 300);
    S.ring(ps, mx, my - 4, 3, 36, '210,210,220', 2.5, 0.22, true);
    this.projectiles.push(new PencilShot(this, mx, my - 8));
    this.shake(3);
    sfx.play('pencil_fire');
  }

  private fireSandal(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 11;
    this.addFX(new Light(mx, my - 8, 170, '255,235,180', 0.5, 0.2));
    S.smoke(ps, mx, my - 2, 12, '215,195,165', [12, 52], { vx: [-110, 110], vy: [-170, -40], alpha: 0.5, life: [0.5, 1.0], drag: 2.2 });
    S.stars(ps, mx, my - 6, 8, '255,230,120', [80, 260], [7, 13], -Math.PI / 2, 0.9);
    S.sparks(ps, mx, my - 4, 10, -Math.PI / 2, 1.0, [180, 480], '255,240,190', 1.2, 300);
    S.ring(ps, mx, my - 2, 4, 52, '235,215,180', 3, 0.28, true);
    this.projectiles.push(new SandalShot(this, mx, my - 12));
    this.shake(5);
    sfx.play('sandal_fire');
  }

  private firePaintball(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const ci = (this.shotsFired - 1) % PAINT.length;
    const col = PAINT[ci];
    a.idx = ci;
    a.fireT = 0;
    a.recoilV += 4;
    this.addFX(new Light(mx, my - 6, 140, col.rgb, 0.45, 0.2));
    S.smoke(ps, mx, my - 4, 6, '245,250,255', [8, 34], { vx: [-70, 70], vy: [-150, -50], alpha: 0.4, life: [0.4, 0.8], drag: 2.4 });
    S.paintDrops(ps, mx, my - 4, 10, -Math.PI / 2, 0.7, [200, 520], [1, 2.2], col);
    S.ring(ps, mx, my - 2, 3, 40, col.hi, 2.5, 0.24, true);
    S.glow(ps, mx, my - 4, 50, 8, col.hi, 0.14, 0.9);
    this.projectiles.push(new PaintShot(this, mx, my - 6, ci));
    this.shake(3);
    sfx.play('paint_fire');
  }

  private fireWand(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 4;
    this.addFX(new SpiralFX(mx, my, '255,150,230', 0.5, 3, 62, 1));
    this.addFX(new RuneCircle(mx, my + 4, '255,150,230', '255,235,150', 0.34, 0.5, 0.5, -1));
    this.addFX(new Light(mx, my - 4, 190, '255,170,235', 0.65, 0.26));
    S.stars(ps, mx, my - 4, 12, '255,200,240', [80, 280], [7, 13], -Math.PI / 2, 1.2);
    S.stars(ps, mx, my - 4, 6, '255,230,130', [60, 220], [7, 12], -Math.PI / 2, 1.2);
    S.sparks(ps, mx, my - 4, 14, -Math.PI / 2, 1.2, [160, 460], '255,215,245', 1.3, 300);
    S.ring(ps, mx, my - 2, 4, 50, '255,150,230', 3, 0.28, true);
    this.projectiles.push(new WandShot(this, mx, my - 6));
    this.shake(3);
    sfx.play('wand_fire');
  }

  private fireShark(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 6;
    a.fireT = 0;
    a.recoilV += 8;
    this.addFX(new Light(mx, y - 8, 180, '150,215,255', 0.55, 0.22));
    S.droplets(ps, mx, y - 4, 20, -Math.PI / 2, 0.55, [260, 620], [1, 2.6], '170,225,255', 600);
    S.smoke(ps, mx, y - 6, 7, '230,244,255', [10, 40], { vx: [-80, 80], vy: [-170, -50], alpha: 0.4, life: [0.5, 0.9] });
    for (let i = 0; i < 4; i++) S.miniBubble(ps, mx + rand(-12, 12), y - 8, rand(-50, 50), rand(-170, -60), rand(2.6, 5.4), rand(0.5, 0.9));
    S.ring(ps, mx, y - 4, 4, 60, '190,230,255', 3.5, 0.3, true);
    this.projectiles.push(new SharkShot(this, mx, y - 10));
    this.shake(5);
    sfx.play('shark_fire');
  }

  private fireGhost(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new Light(mx, my - 6, 190, '100,255,238', 0.6, 0.26));
    S.ghostWisps(ps, mx, my - 4, 6, -Math.PI / 2, 1.0, [120, 340]);
    S.smoke(ps, mx, my - 4, 8, '190,250,244', [10, 42], { vx: [-60, 60], vy: [-140, -40], alpha: 0.35, life: [0.6, 1.1] });
    S.stars(ps, mx, my - 4, 6, '170,255,248', [60, 220], [7, 12], -Math.PI / 2, 1);
    S.ring(ps, mx, my - 2, 4, 56, '110,255,240', 3, 0.3, true);
    ps.add({ k: K.TEXT, x: mx, y: my - 48, vy: -70, drag: 1.8, size: 24, text: 'BOO!', color: '190,255,248', life: 0.8 });
    this.projectiles.push(new GhostShot(this, mx, my - 6));
    this.shake(3);
    sfx.play('ghost_fire');
  }

  private fireUfo(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new GravityPulse(mx, my + 8, 0.45, 0.8, '120,255,160'));
    this.addFX(new Light(mx, my - 4, 200, '90,255,140', 0.65, 0.26));
    S.ring(ps, mx, my - 2, 4, 66, '120,255,160', 3.5, 0.3, true);
    S.ring(ps, mx, my - 2, 3, 40, '255,255,255', 2, 0.22, true);
    S.sparks(ps, mx, my - 4, 16, -Math.PI / 2, 1.2, [160, 480], '140,255,170', 1.4, 200);
    S.stars(ps, mx, my - 4, 8, '160,255,190', [60, 220], [7, 12], -Math.PI / 2, 1.1);
    this.projectiles.push(new UfoShot(this, mx, my - 4));
    this.shake(4);
    sfx.play('ufo_fire');
  }

  private fireRainbow(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new RainbowBurst(mx, my + 6, 0.26, 0.9));
    this.addFX(new RainbowRings(mx, my + 6, 0.5, 0.5));
    this.addFX(new Light(mx, my, 190, '255,220,250', 0.6, 0.24));
    S.rainbowSparks(ps, mx, my, 20, -Math.PI / 2, 1.2, [160, 520], 1.5);
    for (let i = 0; i < 7; i++) S.stars(ps, mx, my, 1, RAINBOW[i], [60, 240], [7, 13], -Math.PI / 2, 1.2);
    S.smoke(ps, mx - 26, my + 14, 3, '250,252,255', [14, 40], { vx: [-80, -20], vy: [-80, -10], alpha: 0.5, life: [0.6, 1] });
    S.smoke(ps, mx + 26, my + 14, 3, '250,252,255', [14, 40], { vx: [20, 80], vy: [-80, -10], alpha: 0.5, life: [0.6, 1] });
    this.projectiles.push(new RainbowShot(this, mx, my - 2));
    this.shake(4);
    sfx.play('rainbow_fire');
  }

  private fireMeteor(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('meteor_charge');
    for (let i = 0; i < 16; i++) ps.add({ k: K.EMBER, add: true, x: mx + rand(-30, 30), y: my + 34 + rand(-6, 6), vx: rand(-40, 40), vy: rand(-140, -40), size: rand(1.6, 2.8), life: rand(0.4, 0.8), color: '255,170,60', g: -40 });
    this.addFX(new Light(mx, my + 30, 200, '255,120,40', 0.6, 0.3));
    this.after(0.3, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 24;
      this.flashScreen('255,160,60', 0.22);
      this.addFX(new Light(mx, my + 10, 400, '255,130,40', 1, 0.4));
      S.fire(ps, mx, my + 30, 22, -Math.PI / 2, 0.7, [220, 560], [28, 48], [54, 96], [0.3, 0.55], { g: -140 });
      S.rocks(ps, mx, my + 30, 8, -Math.PI / 2, 0.9, [200, 520]);
      S.embers(ps, mx, my + 30, 24, -Math.PI / 2, 0.9, [200, 640]);
      S.sparks(ps, mx, my + 30, 20, -Math.PI / 2, 0.9, [250, 700], '255,200,110', 1.6, 300);
      S.smoke(ps, mx, my + 20, 10, '50,42,38', [20, 80], { vx: [-70, 70], vy: [-180, -60], alpha: 0.55, life: [1, 1.7] });
      S.ring(ps, mx, my + 30, 6, 130, '255,160,60', 6, 0.38, true);
      this.projectiles.push(new MeteorShot(this, mx, my + 18));
      this.shake(14);
      sfx.play('meteor_fire');
    });
  }

  private fireDiamond(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new RainbowBurst(mx, my - 2, 0.22, 0.8));
    this.addFX(new Light(mx, my - 4, 190, '170,230,255', 0.7, 0.24));
    S.crystalShards(ps, mx, my - 4, 7, -Math.PI / 2, 0.9, [200, 520]);
    S.stars(ps, mx, my - 4, 8, '235,252,255', [60, 240], [7, 13], -Math.PI / 2, 1.1);
    S.rainbowSparks(ps, mx, my - 4, 14, -Math.PI / 2, 1.1, [160, 480], 1.4);
    S.ring(ps, mx, my - 2, 4, 56, '170,230,255', 3, 0.28, true);
    this.projectiles.push(new DiamondShot(this, mx, my - 4));
    this.shake(4);
    sfx.play('diamond_fire');
  }

  private fireFish(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 18;
    a.fireT = 0;
    a.recoilV += 7;
    this.addFX(new SplashSheet(mx, y - 6, -Math.PI / 2, 46, 0.22));
    this.addFX(new Light(mx, y - 8, 180, '150,215,255', 0.55, 0.22));
    S.droplets(ps, mx, y - 4, 22, -Math.PI / 2, 0.5, [260, 640], [1, 2.6], '170,225,255', 600);
    S.smoke(ps, mx, y - 6, 7, '230,244,255', [10, 40], { vx: [-70, 70], vy: [-170, -50], alpha: 0.4, life: [0.5, 0.9] });
    for (let i = 0; i < 5; i++) S.miniBubble(ps, mx + rand(-12, 12), y - 8, rand(-60, 60), rand(-190, -70), rand(2.6, 6), rand(0.5, 0.95));
    S.ring(ps, mx, y - 4, 4, 60, '190,230,255', 3.5, 0.3, true);
    this.projectiles.push(new FishShot(this, mx, y - 10));
    this.shake(5);
    sfx.play('fish_fire');
  }

  private fireRpg(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 24;
    a.fireT = 0;
    a.recoilV += 11;
    this.addFX(new RadialFlash(mx, y - 8, ['255,170,70', '255,240,200', '255,120,40'], 0.14, 60, 12));
    this.addFX(new Light(mx, y - 10, 220, '255,150,60', 0.7, 0.26));
    S.fire(ps, mx, y - 6, 12, -Math.PI / 2, 0.5, [200, 480], [20, 34], [40, 70], [0.2, 0.4], { g: -100 });
    S.smoke(ps, mx, y - 6, 8, '215,215,220', [12, 50], { vx: [-90, 90], vy: [-170, -50], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    for (const s of [-1, 1]) S.smoke(ps, mx + s * 16, my + 90, 5, '225,225,228', [12, 44], { vx: [s * 70, s * 210], vy: [-30, 30], alpha: 0.45, life: [0.6, 1], drag: 2.4 });
    S.sparks(ps, mx, y - 6, 14, -Math.PI / 2, 0.9, [200, 560], '255,210,120', 1.4, 300);
    S.ring(ps, mx, y - 4, 4, 56, '255,200,140', 3, 0.26, true);
    this.projectiles.push(new RpgShot(this, mx, my - 2));
    this.shake(8);
    sfx.play('rpg_fire');
  }

  private fireCricket(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 26;
    a.fireT = 0;
    a.recoilV += 26;
    this.addFX(new RadialFlash(mx, y - 6, ['190,110,255', '240,215,255', '255,255,255', '150,90,255'], 0.18, 90, 16));
    this.addFX(new Light(mx, y - 10, 300, '170,90,255', 0.95, 0.34));
    this.flashScreen('190,120,255', 0.16);
    S.ring(ps, mx, y - 4, 5, 100, '190,120,255', 6, 0.38, true);
    S.ring(ps, mx, y - 4, 3, 60, '255,255,255', 3, 0.24, true);
    S.sparks(ps, mx, y - 4, 26, -Math.PI / 2, 1.2, [200, 680], '215,160,255', 1.6, 200);
    S.stars(ps, mx, y - 6, 10, '235,205,255', [80, 280], [8, 14], -Math.PI / 2, 1.1);
    S.smoke(ps, mx, y - 8, 6, '100,60,150', [10, 40], { vx: [-70, 70], vy: [-150, -40], alpha: 0.4, life: [0.6, 1] });
    ps.add({ k: K.TEXT, x: mx + 34, y: my - 12, vy: -70, drag: 1.8, size: 20, text: 'KRIK!', color: '225,190,255', life: 0.7 });
    this.projectiles.push(new CricketShot(this, mx, y - 4));
    this.shake(13);
    sfx.play('cricket_fire');
  }

  private fireElectro(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my - 12;
    a.fireT = 0;
    a.recoilV += 6;
    for (let i = 0; i < 5; i++) this.addFX(new Lightning(mx + rand(-30, 30), y + rand(14, 90), mx + rand(-14, 14), y + rand(-4, 6), 0.2, '130,205,255', 1.3, 1, 0.04));
    this.addFX(new RadialFlash(mx, y, ['110,190,255', '230,245,255', '255,215,90'], 0.14, 70, 14));
    this.addFX(new Light(mx, y - 6, 230, '110,190,255', 0.8, 0.26));
    S.ring(ps, mx, y, 4, 70, '130,205,255', 4, 0.3, true);
    S.sparks(ps, mx, y, 22, -Math.PI / 2, 1.3, [180, 560], '170,225,255', 1.5, 200);
    S.sparks(ps, mx, y, 8, -Math.PI / 2, 1.0, [200, 520], '255,220,110', 1.3, 200);
    this.projectiles.push(new ElectroShot(this, mx, y - 4));
    this.shake(5);
    sfx.play('electro_fire');
  }

  private fireBazooka(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const y = my + 24;
    a.fireT = 0;
    a.recoilV += 16;
    this.addFX(new RadialFlash(mx, y - 8, ['255,170,70', '255,240,200', '255,120,40'], 0.16, 80, 14));
    this.addFX(new Light(mx, y - 12, 280, '255,150,60', 0.85, 0.3));
    this.flashScreen('255,180,90', 0.16);
    S.fire(ps, mx, y - 6, 16, -Math.PI / 2, 0.55, [220, 540], [22, 38], [44, 80], [0.22, 0.45], { g: -110 });
    S.smokeRing(ps, mx, y - 6, 14, '235,235,240', 14, 210, 0.3);
    for (const s of [-1, 1]) S.smoke(ps, mx + s * 20, my + 100, 6, '230,230,234', [14, 50], { vx: [s * 80, s * 240], vy: [-30, 30], alpha: 0.5, life: [0.7, 1.2], drag: 2.4 });
    S.sparks(ps, mx, y - 6, 18, -Math.PI / 2, 0.9, [220, 600], '255,210,120', 1.5, 300);
    S.ring(ps, mx, y - 4, 5, 80, '255,210,150', 3.5, 0.3, true);
    this.projectiles.push(new BazookaShot(this, mx, my + 2));
    this.shake(12);
    sfx.play('bazooka_fire');
  }

  private fireFreeze(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('freeze_fire');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 14;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 14 + Math.sin(an) * d, target: this.orbTarget, pull: 1600, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['190,240,255', '255,255,255', '120,215,255']) });
    }
    S.snowflakes(ps, mx, my - 14, 8, -Math.PI / 2, Math.PI, [30, 100]);
    this.addFX(new Light(mx, my - 10, 160, '110,215,255', 0.5, 0.26));
    this.after(0.2, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 5;
      this.addFX(new FrostBloom(mx, my - 18, 0.45, 0.5));
      this.addFX(new Light(mx, my - 14, 230, '110,215,255', 0.85, 0.3));
      S.ring(ps, mx, my - 14, 4, 70, '150,230,255', 4, 0.32, true);
      S.snowflakes(ps, mx, my - 16, 10, -Math.PI / 2, 1.1, [120, 340]);
      S.sparks(ps, mx, my - 16, 14, -Math.PI / 2, 1.1, [150, 460], '200,240,255', 1.3, 200);
      this.projectiles.push(new FreezeBeam(this, mx, my - 16));
      this.shake(4);
      sfx.play('freeze_fire');
    });
  }

  private fireRail(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('rail_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my + 2;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 100);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + 2 + Math.sin(an) * d, target: this.orbTarget, pull: 1800, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['150,190,255', '200,160,255', '255,255,255']) });
    }
    this.after(0.3, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 22;
      this.addFX(new Light(mx, my - 6, 320, '130,170,255', 1, 0.3));
      this.flashScreen('200,220,255', 0.2);
      S.ring(ps, mx, my - 2, 5, 100, '130,175,255', 6, 0.36, true);
      S.sparks(ps, mx, my - 2, 24, -Math.PI / 2, 1.0, [220, 700], '170,205,255', 1.6, 200);
      this.projectiles.push(new RailShot(this, mx, my - 4));
      this.shake(12);
      sfx.play('rail_fire');
    });
  }

  private fireMagnet(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new FieldLines(mx, my + 6, 0.7, 0.85));
    this.addFX(new Light(mx, my, 190, '255,130,150', 0.6, 0.26));
    S.sparks(ps, mx - 30, my + 6, 12, -Math.PI / 2, 1.0, [160, 460], '255,110,110', 1.4, 200);
    S.sparks(ps, mx + 30, my + 6, 12, -Math.PI / 2, 1.0, [160, 460], '130,170,255', 1.4, 200);
    S.ring(ps, mx, my + 4, 4, 60, '255,200,210', 3, 0.28, true);
    this.projectiles.push(new MagnetShot(this, mx, my - 12));
    this.shake(4);
    sfx.play('magnet_fire');
  }

  private fireSizeRay(mx: number, my: number, grow: boolean) {
    const a = this.anim;
    const ps = this.particles;
    const rgb = grow ? '255,160,50' : '70,255,140';
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new ConvergeRings(mx, my + 4, rgb, grow ? 1 : -1, 0.5, 0.65));
    this.addFX(new Light(mx, my, 190, rgb, 0.65, 0.26));
    S.ring(ps, mx, my + 4, 4, 56, rgb, 3, 0.28, true);
    S.sparks(ps, mx, my + 4, 16, -Math.PI / 2, 1.2, [160, 480], rgb, 1.4, 200);
    S.stars(ps, mx, my, 6, rgb, [60, 220], [7, 12], -Math.PI / 2, 1.1);
    S.plusMinus(ps, mx, my - 8, 3, grow ? '+' : '-', rgb, [80, 200]);
    this.projectiles.push(new SizeShot(this, mx, my - 4, grow));
    this.shake(4);
    sfx.play(grow ? 'grow_fire' : 'shrink_fire');
  }

  private firePirate(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fuse = 0.2;
    sfx.play('bamboo_fuse');
    S.sparks(ps, mx + 38, my + 16, 14, -Math.PI / 2, Math.PI, [60, 220], '255,220,120', 1.3, 500);
    S.glow(ps, mx + 38, my + 16, 40, 10, '255,200,100', 0.2, 1);
    this.after(0.2, () => {
      a.fireT = 0;
      a.recoilV += 22;
      this.addFX(new RadialFlash(mx, my + 6, ['255,170,70', '255,240,200', '255,120,40'], 0.17, 100, 16));
      this.addFX(new Light(mx, my - 10, 340, '255,150,60', 1, 0.34));
      this.flashScreen('255,190,90', 0.22);
      S.fire(ps, mx, my + 8, 18, -Math.PI / 2, 0.6, [220, 520], [24, 40], [46, 84], [0.25, 0.5], { g: -120 });
      S.smokeRing(ps, mx, my + 8, 16, '175,170,165', 16, 230, 0.32);
      S.smoke(ps, mx, my - 6, 12, '110,106,102', [24, 90], { vx: [-70, 70], vy: [-190, -60], alpha: 0.6, life: [1.1, 1.8] });
      S.embers(ps, mx, my + 6, 22, -Math.PI / 2, 0.9, [200, 640]);
      S.sparks(ps, mx, my + 6, 20, -Math.PI / 2, 0.8, [250, 700], '255,210,120', 1.5, 300);
      S.coins(ps, mx, my + 8, 6, -Math.PI / 2, 0.8, [260, 520]);
      S.ring(ps, mx, my + 8, 6, 120, '255,200,120', 6, 0.36, true);
      this.projectiles.push(new PirateShot(this, mx, my - 2));
      this.shake(13);
      sfx.play('pirate_fire');
    });
  }

  private fireCard(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const suit = a.idx;
    a.idx = (a.idx + 1) % 4;
    a.fireT = 0;
    a.recoilV += 4;
    this.addFX(new Light(mx, my + 6, 170, '255,225,210', 0.5, 0.22));
    S.cards(ps, mx, my + 8, 8, -Math.PI / 2, 0.95, [200, 470], 0.6);
    S.stars(ps, mx, my + 6, 8, '255,235,170', [60, 240], [7, 13], -Math.PI / 2, 1);
    S.sparks(ps, mx, my + 6, 12, -Math.PI / 2, 0.9, [160, 460], '255,235,190', 1.3, 300);
    S.ring(ps, mx, my + 6, 3, 46, '255,200,210', 2.5, 0.26, true);
    this.projectiles.push(new CardShot(this, mx, my - 4, suit));
    this.shake(3);
    sfx.play('card_fire');
  }

  private fireHoly(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 6;
    this.addFX(new HaloRing(mx, my - 18, 0.45, 0.9));
    this.addFX(new Light(mx, my - 14, 200, '255,230,150', 0.7, 0.26));
    S.feathers(ps, mx, my - 10, 10, -Math.PI / 2, 0.9, [120, 360]);
    S.stars(ps, mx, my - 12, 10, '255,236,170', [80, 280], [7, 13], -Math.PI / 2, 1);
    S.sparks(ps, mx, my - 12, 14, -Math.PI / 2, 1.0, [160, 480], '255,225,140', 1.4, 200);
    S.embers(ps, mx, my - 10, 10, -Math.PI / 2, 0.9, [60, 200], '255,230,150', 2);
    S.ring(ps, mx, my - 14, 4, 60, '255,235,170', 3, 0.3, true);
    this.projectiles.push(new HolyShot(this, mx, my - 16));
    this.shake(4);
    sfx.play('holy_fire');
  }

  private fireUnicorn(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new RainbowBurst(mx, my - 4, 0.26, 0.8));
    this.addFX(new RainbowRings(mx, my - 4, 0.5, 0.5));
    this.addFX(new Light(mx, my - 6, 190, '255,200,245', 0.6, 0.24));
    S.hearts(ps, mx, my - 6, 8, -Math.PI / 2, 1.0, [100, 300]);
    S.rainbowSparks(ps, mx, my - 6, 20, -Math.PI / 2, 1.2, [160, 520], 1.5);
    for (let i = 0; i < 7; i++) S.stars(ps, mx, my - 6, 1, RAINBOW[i], [60, 240], [7, 13], -Math.PI / 2, 1.2);
    this.projectiles.push(new UnicornShot(this, mx, my - 4));
    this.shake(4);
    sfx.play('unicorn_fire');
  }

  private fireObliterator(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('obl_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 13;
    for (let i = 0; i < 26; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 95);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 13 + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['150,255,100', '210,255,170', '100,230,60']) });
    }
    this.addFX(new Light(mx, my - 10, 160, '110,255,80', 0.5, 0.3));
    this.after(0.26, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 8;
      this.addFX(new RadiationPulse(mx, my - 12, 0.5, 0.55));
      this.addFX(new Light(mx, my - 12, 230, '110,255,80', 0.85, 0.3));
      S.smoke(ps, mx, my - 12, 8, '80,190,60', [12, 46], { vx: [-70, 70], vy: [-160, -40], alpha: 0.45, life: [0.6, 1.1] });
      S.goo(ps, mx, my - 12, 8, -Math.PI / 2, 0.8, [160, 420], [1.4, 3], '110,255,80', '30,110,20');
      S.ring(ps, mx, my - 12, 5, 80, '120,255,90', 5, 0.38, true);
      S.sparks(ps, mx, my - 12, 18, -Math.PI / 2, 1.1, [160, 520], '150,255,100', 1.5, 200);
      this.projectiles.push(new ObliteratorShot(this, mx, my - 14));
      this.shake(8);
      sfx.play('obl_fire');
    });
  }

  private fireCoin(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new Light(mx, my - 10, 170, '255,215,100', 0.55, 0.22));
    S.coins(ps, mx, my - 10, 6, -Math.PI / 2, 0.9, [260, 520]);
    S.stars(ps, mx, my - 12, 8, '255,230,130', [60, 240], [7, 13], -Math.PI / 2, 1);
    S.sparks(ps, mx, my - 12, 12, -Math.PI / 2, 1.0, [160, 460], '255,225,120', 1.4, 300);
    S.ring(ps, mx, my - 10, 3, 50, '255,215,100', 3, 0.28, true);
    this.projectiles.push(new CoinShot(this, mx, my - 12));
    this.shake(3);
    sfx.play('coin_fire');
  }

  private fireSaber(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    const ty = my - 114;
    a.fireT = 0;
    a.recoilV += 3;
    this.addFX(new SaberSlash(mx, ty + 20, 0.3, 150, 0.26));
    this.addFX(new Light(mx, ty + 10, 220, '90,210,255', 0.7, 0.26));
    S.sparks(ps, mx, ty + 10, 18, -Math.PI / 2, 1.3, [160, 520], '140,235,255', 1.5, 200);
    S.stars(ps, mx, ty + 10, 8, '200,245,255', [60, 240], [7, 13], -Math.PI / 2, 1.2);
    S.ring(ps, mx, ty + 14, 4, 60, '110,225,255', 3, 0.28, true);
    this.projectiles.push(new SaberShot(this, mx, ty));
    this.shake(5);
    sfx.play('saber_fire');
  }

  private fireGauntlet(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 16;
    this.addFX(new RadialFlash(mx, my + 10, ['255,170,70', '255,240,200', '255,120,40'], 0.14, 60, 12));
    this.addFX(new Light(mx, my + 4, 220, '255,150,60', 0.7, 0.26));
    S.smoke(ps, mx, my + 50, 10, '215,218,224', [12, 46], { vx: [-100, 100], vy: [-90, 10], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    for (const s of [-1, 1]) S.smoke(ps, mx + s * 28, my + 54, 4, '225,228,232', [10, 36], { vx: [s * 60, s * 190], vy: [-40, 20], alpha: 0.45, life: [0.5, 0.9], drag: 2.4 });
    S.chips(ps, mx, my + 40, 6, -Math.PI / 2, 1.2, [100, 280], ['150,156,166', '110,116,126', '200,206,216']);
    S.sparks(ps, mx, my + 20, 16, -Math.PI / 2, 1.2, [200, 560], '255,200,110', 1.4, 300);
    S.ring(ps, mx, my + 6, 4, 62, '255,200,130', 3, 0.28, true);
    this.projectiles.push(new GauntletShot(this, mx, my));
    this.shake(9);
    sfx.play('gauntlet_fire');
  }

  private fireRuby(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 7;
    a.spinV += 14;
    this.addFX(new RadialFlash(mx, my - 4, ['255,70,100', '255,200,215', '255,255,255'], 0.12, 70, 14));
    this.addFX(new Light(mx, my - 6, 180, '255,80,110', 0.65, 0.22));
    S.stars(ps, mx, my - 4, 8, '255,150,175', [80, 260], [7, 12], -Math.PI / 2, 1);
    S.sparks(ps, mx, my - 4, 14, -Math.PI / 2, 0.9, [200, 540], '255,110,140', 1.4, 300);
    S.smoke(ps, mx, my - 6, 3, '230,215,220', [8, 28], { vy: [-120, -40], vx: [-40, 40], alpha: 0.28, life: [0.5, 0.9] });
    this.projectiles.push(new RubyShot(this, mx, my - 2));
    this.shake(4);
    sfx.play('ruby_fire');
  }

  private fireEmerald(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('emerald_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 11;
    for (let i = 0; i < 24; i++) {
      const an = rand(0, TAU);
      const d = rand(40, 90);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 11 + Math.sin(an) * d, target: this.orbTarget, pull: 1700, size: rand(1, 2.2), len: 0.03, life: 0.5, color: pick(['120,255,180', '200,255,225', '60,230,130']) });
    }
    this.after(0.22, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 5;
      this.addFX(new RadialFlash(mx, my - 12, ['60,255,150', '200,255,225', '255,255,255'], 0.16, 80, 14));
      this.addFX(new Light(mx, my - 12, 230, '60,255,150', 0.85, 0.3));
      S.ring(ps, mx, my - 12, 4, 70, '90,255,170', 4, 0.32, true);
      S.gemShards(ps, mx, my - 12, 6, -Math.PI / 2, 1.0, [160, 400], EMERALD);
      S.sparks(ps, mx, my - 12, 14, -Math.PI / 2, 1.1, [150, 460], '120,255,180', 1.3, 200);
      this.projectiles.push(new EmeraldBeam(this, mx, my - 14));
      this.shake(4);
      sfx.play('emerald_fire');
    });
  }

  private fireSapphire(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 18;
    this.addFX(new RadialFlash(mx, my - 6, ['90,160,255', '210,228,255', '255,255,255', '60,110,230'], 0.12, 100, 16));
    this.addFX(new Light(mx, my - 20, 300, '90,160,255', 0.9, 0.22));
    this.flashScreen('150,190,255', 0.12);
    S.gemShards(ps, mx, my - 4, 10, -Math.PI / 2, 0.5, [260, 640], SAPPHIRE);
    S.smoke(ps, mx, my - 10, 9, '165,175,205', [12, 58], { vy: [-150, -50], vx: [-45, 45], alpha: 0.45, life: [1, 1.6], drag: 1.8 });
    S.sparks(ps, mx, my - 6, 18, -Math.PI / 2, 0.6, [300, 760], '130,180,255', 1.5, 200);
    S.embers(ps, mx, my - 6, 12, -Math.PI / 2, 0.5, [300, 700], '130,180,255');
    this.projectiles.push(new SapphireBlast(this, mx, my - 4));
    this.shake(9);
    sfx.play('sapphire_fire');
  }

  private fireCrystal(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 9;
    this.addFX(new RadialFlash(mx, my - 6, ['195,120,255', '240,215,255', '255,255,255'], 0.14, 80, 14));
    this.addFX(new Light(mx, my - 10, 220, '180,100,255', 0.7, 0.26));
    S.gemShards(ps, mx, my - 8, 8, -Math.PI / 2, 1.0, [160, 440], AMETHYST);
    S.stars(ps, mx, my - 8, 8, '225,180,255', [60, 240], [7, 13], -Math.PI / 2, 1.1);
    S.ring(ps, mx, my - 8, 4, 64, '190,120,255', 3, 0.3, true);
    S.smoke(ps, mx, my - 8, 4, '170,110,230', [10, 38], { vy: [-120, -40], vx: [-40, 40], alpha: 0.3, life: [0.6, 1] });
    this.projectiles.push(new CrystalShot(this, mx, my - 8));
    this.shake(5);
    sfx.play('crystal_fire');
  }

  private fireBeeRifle(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 9;
    this.addFX(new Light(mx, my - 30, 170, '255,210,70', 0.55, 0.22));
    S.bees(ps, mx, my - 30, 6, -Math.PI / 2, 0.8, [180, 480]);
    S.goo(ps, mx, my - 28, 5, -Math.PI / 2, 0.7, [160, 360], [1.3, 2.6], '255,184,30', '150,80,0');
    S.hexes(ps, mx, my - 30, 5, -Math.PI / 2, 0.9, [100, 300]);
    S.sparks(ps, mx, my - 30, 12, -Math.PI / 2, 0.9, [160, 460], '255,215,80', 1.3, 300);
    ps.add({ k: K.TEXT, x: mx, y: my - 62, vy: -70, drag: 1.8, size: 22, text: 'BZZ!', color: '255,226,80', life: 0.75 });
    this.projectiles.push(new BeeRifleShot(this, mx, my - 32));
    this.shake(4);
    sfx.play('beerifle_fire');
  }

  private fireCharge(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.charging = true;
    a.charge = 0;
    sfx.play('charge_charge');
    this.orbTarget.x = mx;
    this.orbTarget.y = my - 11;
    for (let i = 0; i < 14; i++) {
      const an = rand(0, TAU);
      const d = rand(30, 70);
      ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 11 + Math.sin(an) * d, target: this.orbTarget, pull: 2600, size: rand(1, 2), len: 0.03, life: 0.3, color: pick(['150,230,255', '255,255,255', '70,200,255']) });
    }
    this.after(0.1, () => {
      a.charging = false;
      a.charge = 0;
      a.fireT = 0;
      a.recoilV += 11;
      this.addFX(new RadialFlash(mx, my - 12, ['60,200,255', '210,248,255', '255,255,255'], 0.14, 90, 14));
      this.addFX(new Light(mx, my - 12, 230, '70,200,255', 0.8, 0.24));
      S.ring(ps, mx, my - 12, 4, 76, '90,210,255', 4, 0.3, true);
      S.sparks(ps, mx, my - 12, 16, -Math.PI / 2, 1.1, [180, 540], '150,230,255', 1.4, 200);
      S.smoke(ps, mx + 18, my + 38, 4, '225,240,250', [8, 30], { vx: [20, 80], vy: [-90, -20], alpha: 0.4, life: [0.5, 0.9] });
      S.smoke(ps, mx - 18, my + 38, 4, '225,240,250', [8, 30], { vx: [-80, -20], vy: [-90, -20], alpha: 0.4, life: [0.5, 0.9] });
      this.projectiles.push(new ChargeShot(this, mx, my - 12));
      this.shake(6);
      sfx.play('charge_fire');
    });
  }

  private firePulse(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 5;
    this.addFX(new Light(mx, my - 6, 160, '70,215,255', 0.55, 0.2));
    for (let k = 0; k < 3; k++) this.after(k * 0.05, () => S.ring(ps, mx, my - 4, 3, 40 + k * 10, '110,225,255', 2.5, 0.22, true));
    S.sparks(ps, mx, my - 4, 12, -Math.PI / 2, 0.9, [160, 460], '130,230,255', 1.3, 200);
    S.smoke(ps, mx, my - 4, 3, '215,235,245', [8, 26], { vy: [-100, -30], vx: [-30, 30], alpha: 0.25, life: [0.4, 0.8] });
    this.projectiles.push(new PulseShot(this, mx, my - 4));
    this.shake(3);
    sfx.play('pulse_fire');
  }

  private fireCryo(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 6;
    this.addFX(new Light(mx, my - 6, 180, '110,215,255', 0.55, 0.24));
    S.smoke(ps, mx, my - 6, 10, '220,244,255', [12, 48], { vx: [-80, 80], vy: [-170, -50], alpha: 0.5, life: [0.6, 1.1], drag: 2.2 });
    S.snowflakes(ps, mx, my - 6, 10, -Math.PI / 2, 1.0, [120, 340]);
    S.crystalShards(ps, mx, my - 6, 6, -Math.PI / 2, 0.8, [200, 460]);
    S.stars(ps, mx, my - 6, 6, '200,245,255', [60, 220], [7, 12], -Math.PI / 2, 1);
    S.ring(ps, mx, my - 6, 4, 56, '150,230,255', 3, 0.28, true);
    this.projectiles.push(new CryoShot(this, mx, my - 4));
    this.shake(4);
    sfx.play('cryo_fire');
  }

  private fireHyper(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 10;
    this.addFX(new WarpLines(mx, my - 6, 0.3, 0.7));
    this.addFX(new RadialFlash(mx, my - 4, ['130,180,255', '230,240,255', '255,255,255'], 0.12, 80, 14));
    this.addFX(new Light(mx, my - 8, 230, '120,170,255', 0.8, 0.24));
    S.ring(ps, mx, my - 6, 4, 70, '130,180,255', 4, 0.3, true);
    S.sparks(ps, mx, my - 6, 20, -Math.PI / 2, 1.0, [220, 640], '170,205,255', 1.4, 200);
    S.stars(ps, mx, my - 6, 8, '210,228,255', [60, 240], [7, 13], -Math.PI / 2, 1.1);
    this.projectiles.push(new HyperShot(this, mx, my - 4));
    this.shake(6);
    sfx.play('hyper_fire');
  }

  private fireQuantum(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 8;
    this.addFX(new GlitchBurst(mx, my - 10, 0.4, 0.55));
    this.addFX(new Light(mx, my - 10, 200, '170,80,255', 0.7, 0.26));
    S.glitchBits(ps, mx, my - 10, 18, 40);
    S.ring(ps, mx, my - 10, 4, 66, '190,110,255', 3.5, 0.3, true);
    S.sparks(ps, mx, my - 10, 14, -Math.PI / 2, 1.1, [160, 480], '210,150,255', 1.4, 200);
    S.stars(ps, mx, my - 10, 6, '225,185,255', [60, 220], [7, 12], -Math.PI / 2, 1.1);
    this.projectiles.push(new QuantumShot(this, mx, my - 12));
    this.shake(5);
    sfx.play('quantum_fire');
  }

  private fireWars(mx: number, my: number) {
    const a = this.anim;
    const ps = this.particles;
    a.fireT = 0;
    a.recoilV += 7;
    this.addFX(new RadialFlash(mx, my - 6, ['255,70,60', '255,220,210', '255,255,255'], 0.1, 60, 12));
    this.addFX(new Light(mx, my - 8, 170, '255,70,60', 0.65, 0.2));
    S.sparks(ps, mx, my - 6, 12, -Math.PI / 2, 0.8, [200, 520], '255,120,100', 1.3, 300);
    S.smoke(ps, mx, my - 6, 3, '120,110,106', [8, 26], { vy: [-110, -30], vx: [-30, 30], alpha: 0.25, life: [0.4, 0.8] });
    S.ring(ps, mx, my - 6, 3, 40, '255,90,80', 2.5, 0.22, true);
    this.projectiles.push(new WarsShot(this, mx, my - 6));
    this.shake(3);
    sfx.play('wars_fire');
  }

  // ───────────────────────── loop ─────────────────────────
  slowT = 0;
  pulseS = 0;
  pulseV = 0;
  /** visual-only wheel size pulse (shrink < 0, grow > 0) */
  pulseWheel(a: number) {
    this.pulseS = a;
    this.pulseV = 0;
  }
  paused = false;
  /** debug helper: advance the simulation deterministically (used for visual tests) */
  debugStep(seconds: number) {
    const n = Math.max(1, Math.round(seconds * 60));
    for (let i = 0; i < n; i++) this.update(1 / 60);
    this.render();
  }
  /** brief slow-motion "hit-stop" for heavy impacts */
  hitStop(t: number) {
    this.slowT = Math.max(this.slowT, t);
  }

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    let dt = Math.min(0.05, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    if (this.paused) return;
    if (this.slowT > 0) {
      this.slowT -= dt;
      dt *= 0.22;
    }
    this.update(dt);
    this.render();
  };

  update(dt: number) {
    this.time += dt;
    this.lensReq.length = 0;
    if (this.timers.length) {
      const run: Timer[] = [];
      this.timers = this.timers.filter((t) => {
        t.t -= dt;
        if (t.t <= 0) {
          run.push(t);
          return false;
        }
        return true;
      });
      for (const t of run) t.fn();
    }
    this.cool = Math.max(0, this.cool - dt);
    this.pulseV += (-130 * this.pulseS - 9 * this.pulseV) * dt;
    this.pulseS += this.pulseV * dt;
    const w = this.wheel;
    w.intro = Math.min(1, w.intro + dt / 0.45);
    w.scale = easeOutBack(w.intro);
    if (!this.wheelGone) w.angle += SPIN * dt * (0.4 + 0.6 * w.intro);
    w.bumpV += (-420 * w.bumpY - 22 * w.bumpV) * dt;
    w.bumpY += w.bumpV * dt;
    w.flash = Math.max(0, w.flash - dt * 7);
    if (w.shakeT > 0) {
      w.shakeT -= dt;
      w.shakeX = Math.sin(this.time * 70) * 6 * Math.max(0, w.shakeT / 0.45);
    } else w.shakeX = 0;

    for (const it of this.stuck) {
      it.t += dt;
      const a = it.angle + w.angle;
      it.world.x = w.x + Math.cos(a) * w.R;
      it.world.y = w.y + w.bumpY + Math.sin(a) * w.R;
      it.up = -a;
      const smk = SMOKERS[it.weapon];
      if (smk && it.t < 7 && !this.wheelGone && Math.random() < dt * 9)
        this.particles.add({ k: K.SMOKE, x: it.world.x + rand(-4, 4), y: it.world.y - 14 + rand(-3, 3), vx: rand(-10, 10), vy: rand(-60, -30), size: 6, size2: 28, life: rand(0.8, 1.3), color: smk, alpha: 0.3, rot: rand(0, TAU), vrot: rand(-1, 1) });
      if (it.weapon === 'gravity' && it.t < 0.5) this.lens(it.world.x, it.world.y, 74 * (1 - it.t / 0.5) + 18, 1.3 * (1 - it.t / 0.5) + 0.15);
      if (it.weapon === 'flame' && !this.wheelGone) {
        const wp = it.world;
        if (Math.random() < dt * 24)
          this.particles.add({ k: K.SMOKE, x: wp.x + rand(-4, 4), y: wp.y - 22 + rand(-4, 4), vx: rand(-10, 10), vy: rand(-60, -30), size: 6, size2: 30, life: rand(0.7, 1.2), color: '70,60,55', alpha: 0.28, rot: rand(0, TAU), vrot: rand(-1, 1) });
        if (Math.random() < dt * 12)
          this.particles.add({ k: K.EMBER, add: true, x: wp.x + rand(-6, 6), y: wp.y - 12, vx: rand(-30, 30), vy: rand(-110, -50), size: rand(1.2, 2.2), life: rand(0.6, 1.1), color: '255,170,60', g: -40 });
      }
      if (it.weapon === 'blackhole') {
        if (it.t < 0.45) this.lens(it.world.x, it.world.y, 66 * (1 - it.t / 0.45) + 16, 1.4 * (1 - it.t / 0.45) + 0.15);
        if (Math.random() < dt * 7) {
          const an = rand(0, TAU);
          const d = rand(18, 30);
          this.particles.add({ k: K.SPARK, add: true, x: it.world.x + Math.cos(an) * d, y: it.world.y + Math.sin(an) * d, target: it.world, pull: 700, size: rand(0.7, 1.4), len: 0.03, life: 0.6, color: pick(PURPLES) });
        }
      }
    }

    // weapon animation state
    const a = this.anim;
    a.intro = Math.min(1, a.intro + dt / 0.45);
    a.fireT += dt;
    a.recoilV += (-260 * a.recoil - 20 * a.recoilV) * dt;
    a.recoil += a.recoilV * dt;
    const ft = a.fireT;
    a.slide = ft < 0.035 ? ft / 0.035 : Math.max(0, 1 - (ft - 0.035) / 0.09);
    if (a.pumpStart >= 0) {
      const tp = this.time - a.pumpStart;
      let v = 0;
      if (tp < 0.12) v = easeOutCubic(tp / 0.12);
      else if (tp < 0.27) v = 1 - easeOutCubic((tp - 0.12) / 0.15);
      else a.pumpStart = -1;
      if (this.weaponId === 'shotgun') a.pump = v;
      else a.pumpS = v;
    }
    if (a.charging) a.charge = Math.min(1, a.charge + dt / 0.28);
    a.orb = Math.min(1, a.orb + dt * 2.2);
    const kS = a.loaded ? 160 : 900;
    const cS = a.loaded ? 20 : 10;
    a.pouchV += (-kS * (a.pouchY - a.pouchTarget) - cS * a.pouchV) * dt;
    a.pouchY += a.pouchV * dt;
    a.bandWob *= Math.exp(-6 * dt);
    if (a.pulse >= 0) {
      a.pulse += dt / 0.075;
      if (a.pulse > 1) a.pulse = -1;
    }
    a.tasselV += (-28 * a.tassel - 2.4 * a.tasselV) * dt;
    a.tassel += a.tasselV * dt;
    a.slosh *= Math.exp(-1.4 * dt);
    a.gauge += (0.92 - a.gauge) * Math.min(1, dt * 2.2);

    if (a.boltStart >= 0) {
      const tb = this.time - a.boltStart;
      let lift = 0;
      let back = 0;
      if (tb < 0.12) lift = tb / 0.12;
      else if (tb < 0.3) {
        lift = 1;
        back = easeOutCubic((tb - 0.12) / 0.18);
      } else if (tb < 0.4) {
        lift = 1;
        back = 1;
      } else if (tb < 0.58) {
        lift = 1;
        back = 1 - easeOutCubic((tb - 0.4) / 0.18);
      } else if (tb < 0.7) lift = 1 - (tb - 0.58) / 0.12;
      else a.boltStart = -1;
      a.bolt = back;
      a.lift = lift;
    } else {
      a.bolt = 0;
      a.lift = 0;
    }
    a.fuse = Math.max(0, a.fuse - dt);
    a.fan += dt * (a.fireT < 0.7 ? 28 : 3);
    a.spin += a.spinV * dt;
    a.spinV *= Math.exp(-2.4 * dt);
    a.heat *= Math.exp(-0.9 * dt);

    // idle weapon ambience
    const mx = GUN_X;
    const my = GUN_Y + (1 - easeOutCubic(a.intro)) * 170;
    const ps = this.particles;
    switch (this.weaponId) {
      case 'golden':
        if (Math.random() < dt * 4.5) {
          const onGrip = Math.random() < 0.3;
          ps.add({ k: K.STAR, add: true, x: onGrip ? mx + rand(18, 66) : mx + rand(-11, 9), y: onGrip ? my + rand(96, 134) : my + rand(4, 118), size: rand(8, 15), life: rand(0.45, 0.8), color: '255,230,150', vrot: rand(-1, 1) });
        }
        if (a.fireT < 1 && Math.random() < dt * 16 * (1 - a.fireT))
          ps.add({ k: K.SMOKE, x: mx + rand(-1.5, 1.5), y: my - 2, vx: rand(-6, 6), vy: rand(-45, -25), size: 3, size2: 16, life: rand(0.7, 1.1), color: '230,220,200', alpha: 0.28, rot: rand(0, TAU), vrot: rand(-1, 1) });
        break;
      case 'blackhole':
        if (Math.random() < dt * 10) {
          const an = rand(0, TAU);
          const d = rand(26, 46);
          this.orbTarget.x = mx;
          this.orbTarget.y = my;
          ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my + Math.sin(an) * d, target: this.orbTarget, pull: 900, size: rand(0.8, 1.6), len: 0.03, life: 0.8, color: pick(PURPLES) });
        }
        break;
      case 'shotgun':
        if (a.fireT < 1.8 && Math.random() < dt * 24 * (1 - a.fireT / 1.8))
          ps.add({ k: K.SMOKE, x: mx + rand(-2, 2), y: my - 4, vx: rand(-8, 8), vy: rand(-55, -25), size: 4, size2: 24, life: rand(0.8, 1.3), color: '175,175,180', alpha: 0.32, rot: rand(0, TAU), vrot: rand(-1, 1) });
        break;
      case 'soaker':
        if (Math.random() < dt * 0.9) ps.add({ k: K.DROP, x: mx + rand(-1, 1), y: my + 2, vy: 30, g: 900, size: rand(1.2, 1.8), life: 1, color: '150,210,255' });
        break;
      case 'snowball':
        if (Math.random() < dt * 6) S.snowflakes(ps, mx + rand(-16, 16), my + rand(0, 60), 1, -Math.PI / 2, 1.2, [10, 40]);
        if (Math.random() < dt * 2.5) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 12), y: my + rand(0, 110), size: rand(7, 13), life: rand(0.45, 0.8), color: '200,235,255', vrot: rand(-1, 1) });
        break;
      case 'flame':
        if (Math.random() < dt * 6) ps.add({ k: K.EMBER, add: true, x: mx + rand(-3, 3), y: my - 6, vx: rand(-20, 20), vy: rand(-90, -40), size: rand(1.2, 2), life: rand(0.5, 0.9), color: '255,170,60', g: -60 });
        if (Math.random() < dt * 4) ps.add({ k: K.SMOKE, x: mx + rand(-2, 2), y: my - 14, vx: rand(-8, 8), vy: rand(-50, -25), size: 3, size2: 14, life: rand(0.7, 1.1), color: '110,100,95', alpha: 0.2, rot: rand(0, TAU) });
        break;
      case 'bubble':
        if (Math.random() < dt * 1.6) S.miniBubble(ps, mx + rand(-8, 8), my - 8, rand(-14, 14), rand(-60, -30), rand(2.5, 6), rand(1.2, 2));
        break;
      case 'bamboo':
        if (Math.random() < dt * 6) ps.add({ k: K.SMOKE, x: mx - 50 + rand(-2, 2), y: my + 114 + rand(-2, 2), vx: rand(-6, 6), vy: rand(-40, -20), size: 3, size2: 14, life: rand(0.8, 1.2), color: '200,195,185', alpha: 0.2, rot: rand(0, TAU) });
        if (a.fireT < 2.4 && Math.random() < dt * 22 * (1 - a.fireT / 2.4)) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my - 4, vx: rand(-14, 14), vy: rand(-60, -25), size: 6, size2: 30, life: rand(0.9, 1.4), color: '120,112,104', alpha: 0.32, rot: rand(0, TAU), vrot: rand(-1, 1) });
        break;
      case 'banana':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-16, 16), y: my + rand(10, 120), size: rand(7, 13), life: rand(0.45, 0.8), color: '255,235,120', vrot: rand(-1, 1) });
        break;
      case 'harpoon':
        if (Math.random() < dt * 3) ps.add({ k: K.STAR, add: true, x: mx + rand(-6, 6), y: my + rand(30, 130), size: rand(6, 11), life: rand(0.4, 0.7), color: '130,255,235', vrot: rand(-1, 1) });
        break;
      case 'chicken':
        if (Math.random() < dt * 0.9) S.feathers(ps, mx + rand(-6, 6), my - 6, 1, -Math.PI / 2, 1, [20, 60]);
        break;
      case 'confetti':
        if (Math.random() < dt * 4) S.confetti(ps, mx + rand(-8, 8), my - 8, 1, -Math.PI / 2, 0.9, [40, 130], [3, 5], [1.1, 1.9]);
        break;
      case 'seed':
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-8, 8), y: my - 6, vx: rand(-20, 20), vy: rand(-60, -25), size: 1.6, life: rand(0.6, 1.1), color: Math.random() < 0.5 ? '255,235,120' : '150,255,120', g: -20 });
        if (Math.random() < dt * 0.8) S.leaves(ps, mx + rand(-20, 20), my + rand(0, 40), 1, -Math.PI / 2, 1.2, [20, 50]);
        break;
      case 'pizza':
        if (Math.random() < dt * 7) ps.add({ k: K.SMOKE, x: mx + rand(-3, 3), y: my - 6, vx: rand(-10, 10), vy: rand(-60, -30), size: 4, size2: 20, life: rand(0.8, 1.2), color: '255,250,240', alpha: 0.22, rot: rand(0, TAU) });
        break;
      case 'minigun':
        if (a.heat > 0.25 && Math.random() < dt * 30 * a.heat) ps.add({ k: K.SMOKE, x: mx + rand(-14, 14), y: my - 4, vx: rand(-14, 14), vy: rand(-70, -30), size: 5, size2: 26, life: rand(0.7, 1.2), color: '150,148,145', alpha: 0.26, rot: rand(0, TAU) });
        break;
      case 'plasma':
        if (Math.random() < dt * 8) S.sparks(ps, mx, my - 6, 1, -Math.PI / 2, 1.4, [30, 110], '140,255,190', 1.2, -60, 0.03);
        break;
      case 'laser':
        if (Math.random() < dt * 5) ps.add({ k: K.STAR, add: true, x: mx + rand(-6, 6), y: my + rand(-10, 10), size: rand(6, 11), life: rand(0.3, 0.55), color: '255,150,150', vrot: rand(-1, 1) });
        break;
      case 'dragon':
        if (Math.random() < dt * 6) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my - 2, vx: rand(-14, 14), vy: rand(-70, -30), size: 5, size2: 26, life: rand(0.8, 1.3), color: '70,60,56', alpha: 0.3, rot: rand(0, TAU), vrot: rand(-1, 1) });
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-9, 9), y: my, vx: rand(-20, 20), vy: rand(-90, -40), size: rand(1.2, 2.2), life: rand(0.5, 0.9), color: '255,170,60', g: -40 });
        break;
      case 'gravity':
        if (Math.random() < dt * 10) {
          const an = rand(0, TAU);
          const d = rand(26, 46);
          this.orbTarget.x = mx;
          this.orbTarget.y = my - 10;
          ps.add({ k: K.SPARK, add: true, x: mx + Math.cos(an) * d, y: my - 10 + Math.sin(an) * d, target: this.orbTarget, pull: 900, size: rand(0.8, 1.6), len: 0.03, life: 0.8, color: pick(['120,200,255', '200,240,255']) });
        }
        break;
      case 'honey':
        if (Math.random() < dt * 5) S.hexes(ps, mx + rand(-14, 14), my + rand(30, 160), 1, -Math.PI / 2, 0.6, [10, 40]);
        if (Math.random() < dt * 1.4) ps.add({ k: K.DROP, x: mx + rand(-1, 1), y: my + 20, vy: 40, g: 900, size: rand(1.2, 1.8), life: 1, color: '255,184,30', alpha: 1.4, data: '150,80,0' });
        break;
      case 'coconut':
        if (Math.random() < dt * 1.2) S.petals(ps, mx - 24, my + 160, 1, -Math.PI / 2, 1.2, [10, 50], [1.4, 2.2], 40);
        break;
      case 'angklung':
        if (Math.random() < dt * 1.6) S.notes(ps, mx + rand(-30, 30), my + 4, 1, -Math.PI / 2, 0.5, [30, 70]);
        break;
      case 'bee':
        if (Math.random() < dt * 0.8) S.bees(ps, mx + 8, my + 140, 1, -Math.PI / 2, 1.2, [60, 150]);
        break;
      case 'sakura':
        if (Math.random() < dt * 2.5) S.petals(ps, mx + rand(-30, 40), my + rand(-4, 40), 1, -Math.PI / 2, 1.2, [10, 40], [1.6, 2.6], 30);
        break;
      case 'firework':
        if (Math.random() < dt * 14) ps.add({ k: K.SPARK, add: true, x: mx + 31, y: my + 24, vx: rand(-60, 60), vy: rand(-120, -30), g: 300, drag: 1.6, size: 1.2, len: 0.03, life: rand(0.3, 0.6), color: '255,210,110' });
        break;
      case 'keris':
        if (Math.random() < dt * 9) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 14), y: my + rand(0, 160), vx: rand(-10, 10), vy: rand(-50, -15), size: rand(6, 11), life: rand(0.5, 0.9), color: '255,230,150', vrot: rand(-1, 1) });
        if (Math.random() < dt * 8) ps.add({ k: K.EMBER, add: true, x: mx + rand(-10, 10), y: my + rand(20, 150), vx: rand(-14, 14), vy: rand(-60, -25), size: 1.6, life: rand(0.6, 1.1), color: '255,215,110', g: -30 });
        break;
      case 'moonbeam':
        if (Math.random() < dt * 6) S.moonDust(ps, mx + rand(-14, 14), my + rand(-10, 20), 1, -Math.PI / 2, 1, [10, 40]);
        break;
      case 'storm':
        if (Math.random() < dt * 3) this.addFX(new Lightning(mx - 20, my - 25, mx + 20, my - 25, 0.08, '150,210,255', 1, 0, 0.03));
        if (Math.random() < dt * 8) S.sparks(ps, mx + rand(-20, 20), my - 22, 1, -Math.PI / 2, 1.4, [30, 120], '170,220,255', 1.1, 100);
        break;
      case 'paintball':
        if (Math.random() < dt * 0.9) ps.add({ k: K.DROP, x: mx + rand(-1, 1), y: my + 4, vy: 40, g: 900, size: rand(1.2, 1.8), life: 1, color: PAINT[a.idx % PAINT.length].rgb, alpha: 1.4, data: PAINT[a.idx % PAINT.length].lo });
        break;
      case 'wand':
        if (Math.random() < dt * 7) S.stars(ps, mx + rand(-26, 26), my + rand(-24, 24), 1, pick(['255,170,235', '255,230,130', '200,150,255']), [10, 40], [6, 11], -Math.PI / 2, 1);
        break;
      case 'shark':
        if (Math.random() < dt * 2) S.droplets(ps, mx + rand(-20, 20), my + 30, 1, Math.PI / 2, 0.3, [20, 60], [1.2, 2], '170,225,255');
        break;
      case 'ghost':
        if (Math.random() < dt * 4) S.ghostWisps(ps, mx + rand(-14, 14), my + rand(0, 40), 1, -Math.PI / 2, 0.6, [20, 60]);
        break;
      case 'ufo':
        if (Math.random() < dt * 7) ps.add({ k: K.STAR, add: true, x: mx + rand(-24, 24), y: my + rand(0, 34), vx: rand(-10, 10), vy: rand(-40, -10), size: rand(6, 11), life: rand(0.4, 0.8), color: pick(['150,255,180', '220,255,230']), vrot: rand(-1, 1) });
        break;
      case 'rainbow':
        if (Math.random() < dt * 4) S.rainbowSparks(ps, mx + rand(-30, 30), my + rand(-20, 30), 1, -Math.PI / 2, 1, [10, 50]);
        break;
      case 'meteor':
        if (Math.random() < dt * 8) ps.add({ k: K.EMBER, add: true, x: mx + rand(-24, 24), y: my + 34, vx: rand(-20, 20), vy: rand(-110, -40), size: rand(1.4, 2.4), life: rand(0.5, 1), color: '255,160,50', g: -30 });
        if (Math.random() < dt * 5) ps.add({ k: K.SMOKE, x: mx + rand(-20, 20), y: my + 30, vx: rand(-10, 10), vy: rand(-60, -25), size: 6, size2: 26, life: rand(0.8, 1.3), color: '70,60,56', alpha: 0.28, rot: rand(0, TAU) });
        break;
      case 'diamond':
        if (Math.random() < dt * 6) ps.add({ k: K.STAR, add: true, x: mx + rand(-24, 24), y: my + rand(0, 200), size: rand(7, 13), life: rand(0.4, 0.7), color: pick(['235,252,255', '170,230,255']), vrot: rand(-1, 1) });
        break;
      case 'fish':
        if (Math.random() < dt * 2.4) S.miniBubble(ps, mx + rand(-6, 6), my - 22, rand(-14, 14), rand(-60, -30), rand(2.4, 5), rand(0.9, 1.6));
        break;
      case 'rpg':
        if (a.fireT < 2.2 && Math.random() < dt * 20 * (1 - a.fireT / 2.2)) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my + 28, vx: rand(-14, 14), vy: rand(-60, -25), size: 5, size2: 28, life: rand(0.9, 1.4), color: '150,148,145', alpha: 0.3, rot: rand(0, TAU) });
        break;
      case 'cricket':
        if (Math.random() < dt * 4) S.sparks(ps, mx + 36, my + 3, 1, -Math.PI / 2, 1.4, [30, 100], '210,150,255', 1.2, 60, 0.03);
        break;
      case 'electro':
        if (Math.random() < dt * 5) this.addFX(new Lightning(mx - 16, my - 14, mx + 16, my - 14, 0.08, '130,205,255', 1, 0, 0.03));
        break;
      case 'bazooka':
        if (a.fireT < 2.6 && Math.random() < dt * 22 * (1 - a.fireT / 2.6)) ps.add({ k: K.SMOKE, x: mx + rand(-10, 10), y: my + 24, vx: rand(-14, 14), vy: rand(-60, -25), size: 6, size2: 30, life: rand(1, 1.5), color: '170,170,172', alpha: 0.3, rot: rand(0, TAU) });
        break;
      case 'freeze':
        if (Math.random() < dt * 7) ps.add({ k: K.SMOKE, x: mx + rand(-16, 16), y: my + 6, vx: rand(-14, 14), vy: rand(10, 36), size: 6, size2: 26, life: rand(0.8, 1.3), color: '200,238,255', alpha: 0.28, rot: rand(0, TAU) });
        if (Math.random() < dt * 3) S.snowflakes(ps, mx + rand(-20, 20), my - 10, 1, -Math.PI / 2, 1.2, [10, 40]);
        break;
      case 'rail':
        if (Math.random() < dt * 8) S.sparks(ps, mx + rand(-12, 12), my + rand(0, 160), 1, rand(0, TAU), 0.3, [20, 80], '150,190,255', 1.1, 0, 0.03);
        break;
      case 'magnet':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-30, 30), my + rand(-8, 10), 1, -Math.PI / 2, 1.2, [20, 80], Math.random() < 0.5 ? '255,110,110' : '130,170,255', 1.1, 0, 0.03);
        break;
      case 'shrink':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-20, 20), my + rand(0, 120), 1, -Math.PI / 2, 1.2, [20, 70], '70,255,140', 1.1, 0, 0.03);
        break;
      case 'grow':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-20, 20), my + rand(0, 120), 1, -Math.PI / 2, 1.2, [20, 70], '255,160,50', 1.1, 0, 0.03);
        break;
      case 'pirate':
        if (Math.random() < dt * 7) ps.add({ k: K.SMOKE, x: mx + 36, y: my + 16, vx: rand(-8, 8), vy: rand(-50, -25), size: 3, size2: 14, life: rand(0.8, 1.2), color: '190,185,175', alpha: 0.22, rot: rand(0, TAU) });
        if (a.fireT < 2 && Math.random() < dt * 18 * (1 - a.fireT / 2)) ps.add({ k: K.SMOKE, x: mx + rand(-8, 8), y: my + 6, vx: rand(-12, 12), vy: rand(-60, -25), size: 6, size2: 30, life: rand(0.9, 1.4), color: '120,116,112', alpha: 0.3, rot: rand(0, TAU) });
        break;
      case 'card':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-30, 30), y: my + rand(40, 200), size: rand(7, 12), life: rand(0.4, 0.7), color: pick(['255,235,190', '255,160,180']), vrot: rand(-1, 1) });
        break;
      case 'holy':
        if (Math.random() < dt * 5) S.stars(ps, mx + rand(-30, 30), my + rand(-20, 140), 1, '255,236,170', [10, 40], [6, 11], -Math.PI / 2, 1);
        if (Math.random() < dt * 1.2) S.feathers(ps, mx + rand(-40, 40), my + rand(40, 120), 1, -Math.PI / 2, 1, [10, 40]);
        break;
      case 'unicorn':
        if (Math.random() < dt * 5) S.rainbowSparks(ps, mx + rand(-40, 40), my + rand(60, 160), 1, -Math.PI / 2, 1, [10, 60], 1.2);
        if (Math.random() < dt * 0.9) S.hearts(ps, mx + rand(-20, 20), my + 60, 1, -Math.PI / 2, 0.6, [30, 70]);
        break;
      case 'obliterator':
        if (Math.random() < dt * 4) S.miniBubble(ps, mx + rand(-8, 8), my + rand(50, 150), rand(-6, 6), rand(-50, -20), rand(2, 4), rand(0.6, 1.1));
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-12, 12), y: my - 12, vx: rand(-20, 20), vy: rand(-70, -30), size: 1.6, life: rand(0.5, 0.9), color: '150,255,100', g: -30 });
        break;
      case 'coin':
        if (Math.random() < dt * 5) ps.add({ k: K.STAR, add: true, x: mx + rand(-20, 20), y: my + rand(-20, 140), size: rand(6, 11), life: rand(0.4, 0.7), color: '255,230,130', vrot: rand(-1, 1) });
        break;
      case 'saber':
        if (Math.random() < dt * 14) ps.add({ k: K.SPARK, add: true, x: mx + rand(-3, 3), y: my - 116, vx: rand(-40, 40), vy: rand(-70, 20), g: 100, drag: 1.5, size: 1.2, len: 0.03, life: rand(0.3, 0.6), color: '140,235,255' });
        break;
      case 'gauntlet':
        if (a.fireT < 1.2 && Math.random() < dt * 22 * (1 - a.fireT / 1.2)) ps.add({ k: K.SMOKE, x: mx + rand(-14, 14), y: my + 52, vx: rand(-14, 14), vy: rand(-50, -20), size: 5, size2: 24, life: rand(0.7, 1.1), color: '190,194,200', alpha: 0.3, rot: rand(0, TAU) });
        break;
      case 'ruby':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-12, 12), y: my + rand(20, 100), size: rand(6, 11), life: rand(0.4, 0.7), color: '255,150,175', vrot: rand(-1, 1) });
        break;
      case 'emerald':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-24, 24), my - 12 + rand(-24, 24), 1, -Math.PI / 2, 1.4, [10, 50], '120,255,180', 1.1, -40, 0.03);
        break;
      case 'sapphire':
        if (Math.random() < dt * 4) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 14), y: my + rand(10, 150), size: rand(6, 11), life: rand(0.4, 0.7), color: '170,205,255', vrot: rand(-1, 1) });
        if (a.fireT < 1.6 && Math.random() < dt * 20 * (1 - a.fireT / 1.6)) ps.add({ k: K.SMOKE, x: mx + rand(-10, 10), y: my - 4, vx: rand(-10, 10), vy: rand(-60, -25), size: 5, size2: 26, life: rand(0.8, 1.2), color: '170,176,196', alpha: 0.3, rot: rand(0, TAU) });
        break;
      case 'crystal':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-30, 30), my + rand(-10, 90), 1, -Math.PI / 2, 1.4, [10, 60], '210,150,255', 1.1, -30, 0.03);
        break;
      case 'beerifle':
        if (Math.random() < dt * 0.9) S.bees(ps, mx + rand(-10, 10), my + 60, 1, -Math.PI / 2, 1.2, [60, 140]);
        break;
      case 'charge':
        if (a.fireT < 1.2 && Math.random() < dt * 22 * (1 - a.fireT / 1.2)) ps.add({ k: K.SMOKE, x: mx + rand(-22, 22), y: my + 40, vx: rand(-12, 12), vy: rand(-50, -20), size: 5, size2: 22, life: rand(0.7, 1.1), color: '225,240,250', alpha: 0.25, rot: rand(0, TAU) });
        if (Math.random() < dt * 5) S.sparks(ps, mx + rand(-20, 20), my + rand(-8, 8), 1, -Math.PI / 2, 1.3, [20, 80], '130,225,255', 1.1, -30, 0.03);
        break;
      case 'pulse':
        if (Math.random() < dt * 6) S.sparks(ps, mx + rand(-14, 14), my + rand(0, 130), 1, rand(0, TAU), 0.3, [20, 70], '110,225,255', 1.1, 0, 0.03);
        break;
      case 'cryo':
        if (Math.random() < dt * 6) ps.add({ k: K.SMOKE, x: mx + rand(-10, 10), y: my - 2, vx: rand(-12, 12), vy: rand(-40, -15), size: 5, size2: 22, life: rand(0.8, 1.2), color: '210,240,255', alpha: 0.22, rot: rand(0, TAU) });
        if (Math.random() < dt * 2.4) S.snowflakes(ps, mx + rand(-20, 20), my - 6, 1, -Math.PI / 2, 1.2, [10, 40]);
        break;
      case 'hyperdrive':
        if (Math.random() < dt * 7) ps.add({ k: K.STAR, add: true, x: mx + rand(-14, 14), y: my + rand(0, 150), vx: 0, vy: rand(-90, -40), size: rand(5, 9), life: rand(0.3, 0.6), color: '200,225,255' });
        break;
      case 'quantum':
        if (Math.random() < dt * 6) S.glitchBits(ps, mx + rand(-16, 16), my - 8 + rand(-14, 14), 1, 10);
        break;
      case 'wars':
        if (Math.random() < dt * 5) ps.add({ k: K.EMBER, add: true, x: mx + rand(-4, 4), y: my - 4, vx: rand(-14, 14), vy: rand(-50, -20), size: rand(1.2, 2), life: rand(0.5, 0.9), color: '255,100,80', g: -20 });
        break;
      default:
        break;
    }

    for (let i = 0; i < this.projectiles.length; i++) this.projectiles[i].update(dt);
    this.projectiles = this.projectiles.filter((p) => p.alive);
    this.particles.update(dt);
    for (const f of this.fx) f.update(dt);
    this.fx = this.fx.filter((f) => !f.done);
    for (const f of this.wheelFx) f.update(dt);
    this.wheelFx = this.wheelFx.filter((f) => !f.done);

    for (const d of this.decals) {
      d.t += dt;
      if (this.wheelGone) continue;
      if (d.kind === 'wet') {
        d.next -= dt;
        if (d.next <= 0) {
          d.next = d.t < 6 ? rand(0.12, 0.4) : rand(0.8, 2.2);
          const wa = d.angle + rand(-0.06, 0.06) + w.angle;
          const px = w.x + Math.cos(wa) * (w.R + 1);
          const py = w.y + w.bumpY + Math.sin(wa) * (w.R + 1);
          const tv = SPIN * w.R;
          ps.add({ k: K.DROP, x: px, y: py, vx: -Math.sin(wa) * tv + Math.cos(wa) * 40, vy: Math.cos(wa) * tv + Math.sin(wa) * 40, g: 900, size: rand(1.1, 2.1), life: 1.2, color: '150,210,255' });
        }
      } else if (d.kind === 'goo') {
        d.next -= dt;
        if (d.next <= 0) {
          d.next = d.t < 5 ? rand(0.18, 0.5) : rand(1, 2.6);
          const wa = d.angle + rand(-0.05, 0.05) + w.angle;
          const px = w.x + Math.cos(wa) * (w.R + 1);
          const py = w.y + w.bumpY + Math.sin(wa) * (w.R + 1);
          const tv = SPIN * w.R;
          ps.add({ k: K.DROP, x: px, y: py, vx: -Math.sin(wa) * tv + Math.cos(wa) * 30, vy: Math.cos(wa) * tv + Math.sin(wa) * 30, g: 900, size: rand(1.6, 2.8), life: 1.2, color: d.drip ?? '255,226,110', alpha: 1.4, data: d.dripData ?? '190,130,20' });
        }
      } else if (d.kind === 'smolder') {
        if (d.t < 1.8 && Math.random() < dt * 9) {
          const wa = d.angle + w.angle;
          ps.add({ k: K.SMOKE, x: w.x + Math.cos(wa) * d.r, y: w.y + w.bumpY + Math.sin(wa) * d.r, vx: rand(-6, 6), vy: rand(-40, -20), size: 3, size2: 16, life: rand(0.7, 1.1), color: '160,155,150', alpha: 0.35, rot: rand(0, TAU) });
        }
      }
    }

    for (const p of this.pieces) {
      p.vy += 1300 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      p.life -= dt;
    }
    if (this.pieces.length) this.pieces = this.pieces.filter((p) => p.life > 0);

    for (const m of this.motes) {
      m.y -= m.s * dt;
      m.x += Math.sin(this.time * 0.5 + m.ph) * 4 * dt;
      if (m.y < -4) {
        m.y = H + 4;
        m.x = rand(0, W);
      }
    }
    this.shakeAmt *= Math.exp(-dt * 9);
    if (this.shakeAmt < 0.05) this.shakeAmt = 0;
    this.shakeX = (Math.random() * 2 - 1) * this.shakeAmt;
    this.shakeY = (Math.random() * 2 - 1) * this.shakeAmt;
    this.screenFlash.a = Math.max(0, this.screenFlash.a - dt * 2.2);
  }

  // ───────────────────────── render ─────────────────────────
  render() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (this.bg) ctx.drawImage(this.bg, 0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.k, 0, 0, this.k, 0, 0);
    this.drawMotes(ctx);
    ctx.save();
    ctx.translate(this.shakeX, this.shakeY);
    this.particles.draw(ctx, true);
    this.drawWheelBase(ctx);
    this.drawPieces(ctx);
    for (const l of this.lensReq) this.applyLens(l);
    this.drawWheelFront(ctx);
    if (this.weaponId === 'sniper' && this.status === 'playing' && !this.wheelGone && this.wheel.intro > 0.9 && this.anim.fireT > 0.1) this.drawLaser(ctx);
    this.drawWeaponLayer(ctx);
    for (const p of this.projectiles) p.draw(ctx);
    this.particles.draw(ctx, false);
    for (const f of this.fx) f.draw(ctx);
    ctx.restore();
    if (this.screenFlash.a > 0) {
      ctx.fillStyle = `rgba(${this.screenFlash.color},${this.screenFlash.a.toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
    this.drawHUD(ctx);
  }

  private drawMotes(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const spr = glowSprite('200,170,255');
    for (const m of this.motes) drawSprite(ctx, spr, m.x, m.y, m.r * 6, 0.22 + 0.22 * Math.sin(this.time * 2 + m.ph));
    ctx.restore();
  }

  private drawWheelBase(ctx: Ctx) {
    if (this.wheelGone) return;
    const w = this.wheel;
    const s = w.scale * (1 + this.pulseS);
    if (s <= 0.02) return;
    const cx = w.x + w.shakeX;
    const cy = w.y + w.bumpY;
    const R = w.R;
    drawSprite(ctx, glowSprite('0,0,0'), cx + 3, cy + 16, R * 2.9 * s, 0.6);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('150,90,255'), cx, cy, R * 3.3 * s, 0.16);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    ctx.rotate(w.angle);
    for (const it of this.stuck) {
      if (it.front) continue;
      ctx.save();
      ctx.rotate(it.angle);
      drawStuckItem(ctx, it, R, this.time);
      ctx.restore();
    }
    const T = this.texSize;
    ctx.drawImage(this.tex, -T / 2, -T / 2, T, T);
    this.drawDecals(ctx);
    if (this.wheelFx.length) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, TAU);
      ctx.clip();
      for (const f of this.wheelFx) f.draw(ctx);
      ctx.restore();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);
    const lg = ctx.createRadialGradient(-R * 0.4, -R * 0.45, R * 0.05, 0, 0, R * 1.02);
    lg.addColorStop(0, 'rgba(255,250,235,0.2)');
    lg.addColorStop(0.5, 'rgba(255,255,255,0)');
    lg.addColorStop(0.85, 'rgba(20,5,30,0.12)');
    lg.addColorStop(1, 'rgba(20,5,30,0.4)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(0, 0, R - 0.8, 0, TAU);
    ctx.fill();
    if (w.flash > 0) {
      ctx.fillStyle = `${w.flashColor}${(w.flash * 0.6).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(0, 0, R - 0.5, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    for (const ap of this.apples) {
      if (!ap.alive) continue;
      const a = ap.angle + w.angle;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * (R + 10) * s, cy + Math.sin(a) * (R + 10) * s);
      ctx.rotate(a + Math.PI / 2);
      ctx.scale(s, s);
      drawApple(ctx, 11);
      ctx.restore();
    }
  }

  private drawDecals(ctx: Ctx) {
    const R = this.wheel.R;
    for (const d of this.decals) {
      if (d.kind === 'poison') {
        const k = Math.min(1, d.t / 1.6);
        const r = 3 + 11 * Math.sqrt(k);
        const x = Math.cos(d.angle) * (R - 9);
        const y = Math.sin(d.angle) * (R - 9);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(40,110,25,0.5)');
        g.addColorStop(0.6, 'rgba(70,150,40,0.28)');
        g.addColorStop(1, 'rgba(70,150,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      } else if (d.kind === 'goo') {
        const grow = Math.min(1, d.t / 0.2);
        const b = d.blob;
        const n = b.length / 2;
        const blobAt = (sx: number, sy: number, fill: string) => {
          ctx.save();
          ctx.scale(sx * grow + 0.01, sy * grow + 0.01);
          ctx.beginPath();
          ctx.moveTo((b[0] + b[(n - 1) * 2]) / 2, (b[1] + b[(n - 1) * 2 + 1]) / 2);
          for (let i = 0; i < n; i++) {
            const nx = b[((i + 1) % n) * 2];
            const ny = b[((i + 1) % n) * 2 + 1];
            ctx.quadraticCurveTo(b[i * 2], b[i * 2 + 1], (b[i * 2] + nx) / 2, (b[i * 2 + 1] + ny) / 2);
          }
          ctx.closePath();
          ctx.fillStyle = fill;
          ctx.fill();
          ctx.restore();
        };
        ctx.save();
        ctx.rotate(d.angle);
        ctx.translate(R - 10, 0);
        const cc = d.c ?? ['rgba(184,120,10,0.9)', 'rgba(255,226,110,0.95)', 'rgba(255,244,190,0.9)'];
        blobAt(18, 14, cc[0]);
        blobAt(16, 12.2, cc[1]);
        blobAt(10, 7.5, cc[2]);
        ctx.fillStyle = `rgba(255,255,255,${(0.75 * grow).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(-4, -4.5, 4.4 * grow, 1.6 * grow, 0.4, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, 3.5, 1.4 * grow, 0, TAU);
        ctx.fill();
        ctx.restore();
      } else if (d.kind === 'wet') {
        const grow = Math.min(1, d.t / 0.25);
        const dry = Math.max(0.5, 1 - d.t / 30);
        ctx.save();
        ctx.rotate(d.angle);
        ctx.translate(R - 11, 0);
        ctx.save();
        ctx.scale(15 * grow + 0.01, 12 * grow + 0.01);
        ctx.beginPath();
        const b = d.blob;
        const n = b.length / 2;
        ctx.moveTo((b[0] + b[(n - 1) * 2]) / 2, (b[1] + b[(n - 1) * 2 + 1]) / 2);
        for (let i = 0; i < n; i++) {
          const nx = b[((i + 1) % n) * 2];
          const ny = b[((i + 1) % n) * 2 + 1];
          ctx.quadraticCurveTo(b[i * 2], b[i * 2 + 1], (b[i * 2] + nx) / 2, (b[i * 2 + 1] + ny) / 2);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(55,28,10,${(0.4 * dry).toFixed(3)})`;
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = `rgba(255,255,255,${(0.3 * dry * grow).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(-3, -4, 4.5 * grow, 1.4 * grow, 0.4, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 3, 1.3 * grow, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-6, 4.5, 0.9 * grow, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  private drawWheelFront(ctx: Ctx) {
    if (this.wheelGone || !this.stuck.some((i) => i.front)) return;
    const w = this.wheel;
    ctx.save();
    ctx.translate(w.x + w.shakeX, w.y + w.bumpY);
    ctx.scale(w.scale * (1 + this.pulseS), w.scale * (1 + this.pulseS));
    ctx.rotate(w.angle);
    for (const it of this.stuck) {
      if (!it.front) continue;
      ctx.save();
      ctx.rotate(it.angle);
      drawStuckItem(ctx, it, w.R, this.time);
      ctx.restore();
    }
    ctx.restore();
  }

  private drawPieces(ctx: Ctx) {
    if (!this.pieces.length) return;
    const T = this.texSize;
    const R = this.wheel.R;
    for (const p of this.pieces) {
      const path = () => {
        ctx.beginPath();
        for (let i = 0; i < p.poly.length; i += 2) {
          const x = p.poly[i] - p.cx;
          const y = p.poly[i + 1] - p.cy;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      };
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life / 0.5);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.save();
      path();
      ctx.clip();
      ctx.drawImage(this.tex, -T / 2 - p.cx, -T / 2 - p.cy, T, T);
      ctx.restore();
      ctx.save();
      ctx.beginPath();
      ctx.arc(-p.cx, -p.cy, R - 1.5, 0, TAU);
      ctx.clip();
      path();
      ctx.strokeStyle = 'rgba(60,30,10,0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    }
  }

  private applyLens(l: LensReq) {
    const k = this.k;
    const ctx = this.ctx;
    const size = Math.ceil(l.r * 2 * k);
    if (size < 4) return;
    let sx = Math.round((l.x + this.shakeX - l.r) * k);
    let sy = Math.round((l.y + this.shakeY - l.r) * k);
    let sw = size;
    let sh = size;
    let dx = 0;
    let dy = 0;
    if (sx < 0) {
      dx = -sx;
      sw += sx;
      sx = 0;
    }
    if (sy < 0) {
      dy = -sy;
      sh += sy;
      sy = 0;
    }
    if (sx + sw > this.canvas.width) sw = this.canvas.width - sx;
    if (sy + sh > this.canvas.height) sh = this.canvas.height - sy;
    if (sw <= 2 || sh <= 2) return;
    if (this.lensCanvas.width !== size || this.lensCanvas.height !== size) {
      this.lensCanvas.width = size;
      this.lensCanvas.height = size;
    }
    const lc = this.lensCanvas.getContext('2d')!;
    lc.clearRect(0, 0, size, size);
    lc.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
    const rings = 10;
    for (let i = 1; i < rings; i++) {
      const f = i / rings;
      const rr = l.r * (1 - f);
      ctx.save();
      ctx.beginPath();
      ctx.arc(l.x, l.y, rr, 0, TAU);
      ctx.clip();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.s * 1.2 * f * f + this.time * l.s * 0.9 * f);
      const z = 1 + l.s * 0.45 * f;
      ctx.scale(z, z);
      ctx.drawImage(this.lensCanvas, -l.r, -l.r, l.r * 2, l.r * 2);
      ctx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(200,150,255,${(0.18 * Math.min(1, l.s)).toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r * 0.55, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  private drawLaser(ctx: Ctx) {
    const w = this.wheel;
    const x = GUN_X;
    const y0 = GUN_Y - 8 + this.anim.recoil * 14;
    const y1 = w.y + w.bumpY + w.R - 1;
    const fl = 0.85 + 0.15 * Math.sin(this.time * 40);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(255,40,40,${(0.14 * fl).toFixed(3)})`;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,70,60,${(0.7 * fl).toFixed(3)})`;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,215,205,0.55)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    drawSprite(ctx, glowSprite('255,40,40'), x, y1, 30, 0.8 * fl);
    drawSprite(ctx, glowSprite('255,230,220'), x, y1, 9, 0.9);
    ctx.restore();
  }

  private drawWeaponLayer(ctx: Ctx) {
    const a = this.anim;
    const intro = (1 - easeOutCubic(a.intro)) * 170;
    const sway = Math.sin(this.time * 1.6) * 1.0;
    const bob = Math.sin(this.time * 2.2) * 1.2;
    ctx.save();
    ctx.translate(GUN_X + sway, GUN_Y + intro + bob + a.recoil * 14);
    ctx.rotate(-a.recoil * RECOIL_ROT[this.weaponId]);
    drawWeapon(ctx, this.weaponId, a, this.time);
    ctx.restore();
  }

  private drawHUD(ctx: Ctx) {
    ctx.save();
    ctx.textBaseline = 'alphabetic';
    ctx.font = '42px "Lilita One", system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillText(String(this.score), 23, 63);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(this.score), 20, 60);

    ctx.save();
    ctx.translate(W - 28, 44);
    drawApple(ctx, 10);
    ctx.restore();
    ctx.font = '26px "Lilita One", system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillText(String(this.applesHit), W - 46, 55);
    ctx.fillStyle = '#ffd7a8';
    ctx.fillText(String(this.applesHit), W - 48, 53);

    ctx.textAlign = 'center';
    ctx.font = '20px "Lilita One", system-ui, sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillText('LEVEL 1', W / 2 + 1.5, 39.5);
    ctx.fillStyle = '#ffe08a';
    ctx.fillText('LEVEL 1', W / 2, 38);
    for (let i = 0; i < 5; i++) {
      const x = W / 2 - 44 + i * 22;
      const y = 56;
      if (i === 4) {
        ctx.fillStyle = 'rgba(255,80,90,0.25)';
        ctx.strokeStyle = 'rgba(255,120,130,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - 7);
        ctx.lineTo(x + 7, y);
        ctx.lineTo(x, y + 7);
        ctx.lineTo(x - 7, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (i === 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        drawSprite(ctx, glowSprite('255,210,90'), x, y, 28, 0.55 + 0.3 * Math.sin(this.time * 4));
        ctx.restore();
        ctx.fillStyle = '#ffd34d';
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, TAU);
        ctx.fill();
      }
    }

    for (let i = 0; i < this.ammoTotal; i++) {
      const y = H - 34 - i * 30;
      ctx.drawImage(ammoIcon(this.weaponId, i >= this.ammoLeft), 14, y - 14, 28, 28);
    }

    if (this.status === 'playing' && this.shotsFired === 0 && this.wheel.intro >= 1) {
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(this.time * 4);
      ctx.font = '17px "Lilita One", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillText('TAP / KLIK / SPASI UNTUK MENEMBAK', W / 2 + 1, 506);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('TAP / KLIK / SPASI UNTUK MENEMBAK', W / 2, 505);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}
