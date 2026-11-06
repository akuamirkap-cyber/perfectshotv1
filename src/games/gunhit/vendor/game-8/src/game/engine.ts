import type { BurstOpts, Embed, Fx, Particle, Proj, SpawnOpts, Weapon, WeaponState } from './types';
import { SoundEngine } from './sound';
import { TAU, clamp, drawGlow, easeOut, glowSprite, lerp, palAt, pick, rand, rgb, rgba, rr, wrapAng } from './util';

const CHIPS = ['#f0c283', '#d9a062', '#b4733a', '#8a5226', '#5f3818'];

function mulberry(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface HudState { hits: number; goal: number; round: number; state: string }

export class Game {
  readonly W = 540;
  readonly H = 960;
  readonly cx = 270;
  readonly baseY = 940;
  readonly wy0 = 288;
  readonly R = 122;

  ctx: CanvasRenderingContext2D;
  dpr: number;
  time = 0;
  wheel = { angle: 0, dir: 1, boost: 0, kick: 0, kickV: 0, sq: 0, flash: 0, heat: 0, heatC: '#ff8a2a', scale: 1, spawnT: 1, freezeT: 0, freeze: 0, shiver: 0 };
  state: 'play' | 'break' = 'play';
  breakT = 0;
  hits = 0;
  goal = 15;
  round = 1;
  embeds: Embed[] = [];
  parts: Particle[] = [];
  fx: Fx[] = [];
  projs: Proj[] = [];
  weapon!: Weapon;
  ws!: WeaponState;
  shakeAmt = 0;
  lightC = '#ffffff';
  lightA = 0;
  hitstop = 0;
  swapT = 1;
  pending = 0;
  /** Optional host for Mega Buster's yellow Plasma Gun hit; returns true when drawn. */
  busterPlasmaImpact?: (x: number, y: number) => boolean;
  private face!: HTMLCanvasElement;
  private faceSize = 0;
  private bg!: HTMLCanvasElement;
  readonly sfx = new SoundEngine();
  private clearedOnce = false;
  private raf = 0;
  private last = 0;
  private running = false;
  private onState?: (s: HudState) => void;

  constructor(canvas: HTMLCanvasElement, dpr: number, onState?: (s: HudState) => void) {
    this.ctx = canvas.getContext('2d')!;
    this.dpr = dpr;
    this.onState = onState;
    this.buildFace();
    this.buildBg();
    this.resetWheel(false);
  }

  get wy() { return this.wy0 + this.wheel.kick; }
  get active() { return this.state === 'play' && this.wheel.scale > 0.9; }

  /* ---------------- lifecycle ---------------- */
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
  emit() {
    this.onState?.({ hits: this.hits, goal: this.goal, round: this.round, state: this.state });
  }

  setWeapon(w: Weapon) {
    this.sfx.unlock();
    this.sfx.stopAll();
    this.sfx.select();
    this.weapon = w;
    this.ws = {
      recoil: 0, cd: 0, cdMax: w.cooldown, ready: 1, chan: 0, minHold: 0, holding: false,
      t: 0, fireT: 99, shots: 0, charge: 0, data: {},
    };
    this.projs = [];
    this.swapT = 0;
    w.onSelect?.(this, this.ws);
  }
  press() {
    this.sfx.unlock();
    this.ws.holding = true;
    this.ws.charge = 0;
    if (!this.weapon.onRelease) this.pending = 0.22;
    if (this.weapon.channel) this.ws.minHold = this.weapon.minHold ?? 0.25;
  }
  release() {
    const ws = this.ws, w = this.weapon;
    const was = ws.holding;
    ws.holding = false;
    if (w.onRelease && was) {
      const c = ws.charge;
      ws.charge = 0;
      if (ws.cd <= 0 || c > 0.3) {
        ws.cd = ws.cdMax = w.cooldown; ws.ready = 0; ws.recoil = 1; ws.fireT = 0; ws.shots++;
        w.onRelease(this, ws, c);
        this.sfx.playRelease(w.id, c);
      }
    }
  }

  /* ---------------- spawn helpers ---------------- */
  spawn(o: SpawnOpts) {
    if (this.parts.length > 2600) return;
    const type = o.type;
    const life = o.life ?? 0.5;
    const addDef = type === 'glow' || type === 'flame' || type === 'spark' || type === 'ring' || type === 'cube';
    this.parts.push({
      type, x: o.x ?? 0, y: o.y ?? 0, vx: o.vx ?? 0, vy: o.vy ?? 0, ay: o.ay ?? 0, drag: o.drag ?? 0,
      life, max: life, size: o.size ?? 4, size1: o.size1 ?? o.size ?? 4,
      pal: (o.pal ?? ['#ffffff']).map(rgb), alpha: o.alpha ?? 1, rot: o.rot ?? rand(0, TAU), vr: o.vr ?? 0,
      add: o.add ?? addDef, len: o.len ?? 0.02, fadeIn: o.fadeIn ?? 0, turb: o.turb ?? 0, seed: Math.random() * 100,
      hit: o.hit,
    });
  }
  burst(x: number, y: number, o: BurstOpts) {
    const [s0, s1] = o.speed ?? [100, 300];
    const [l0, l1] = o.life ?? [0.3, 0.7];
    const [z0, z1] = o.size ?? [2, 4];
    for (let i = 0; i < o.n; i++) {
      const a = (o.ang ?? 0) + rand(-1, 1) * (o.spread ?? Math.PI);
      const sp = rand(s0, s1);
      const size = rand(z0, z1);
      const size1 = Array.isArray(o.size1) ? rand(o.size1[0], o.size1[1]) : o.size1 ?? size;
      this.spawn({
        type: o.type ?? 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: rand(l0, l1), size, size1,
        pal: o.rpal ? [pick(o.pal)] : o.pal, ay: o.ay, drag: o.drag, len: o.len, alpha: o.alpha, add: o.add,
        vr: o.vr !== undefined ? rand(-o.vr, o.vr) : undefined, turb: o.turb, fadeIn: o.fadeIn, hit: o.hit,
      });
    }
  }
  addFx(f: Omit<Fx, 'age'>) { this.fx.push({ age: 0, ...f }); }
  addProj(p: Partial<Proj> & Pick<Proj, 'x' | 'y' | 'vx' | 'vy' | 'draw' | 'onHit'>) {
    const sid = this.weapon.id;
    const baseHit = p.onHit;
    p.onHit = (g, hx, hy, pr) => { this.sfx.impact(sid); baseHit(g, hx, hy, pr); };
    this.projs.push({ alive: true, age: 0, ...p });
  }
  glow(x: number, y: number, r: number, color: string, life = 0.15, alpha = 1) {
    this.addFx({ max: life, add: true, draw: (ctx, k) => drawGlow(ctx, x, y, r * (1 + k * 0.4), color, alpha * (1 - k)) });
  }
  ring(x: number, y: number, r0: number, r1: number, color: string, life = 0.35, width = 4, squash = 1) {
    this.addFx({
      max: life, add: true,
      draw: (ctx, k) => {
        const e = easeOut(k);
        ctx.strokeStyle = rgba(color, 0.9 * (1 - k));
        ctx.lineWidth = Math.max(0.5, width * (1 - k));
        ctx.beginPath();
        ctx.ellipse(x, y, lerp(r0, r1, e), lerp(r0, r1, e) * squash, 0, 0, TAU);
        ctx.stroke();
      },
    });
  }
  light(color: string, amt: number) {
    this.lightC = color;
    this.lightA = Math.max(this.lightA * 0.6, amt);
  }
  shake(a: number) { this.shakeAmt = Math.max(this.shakeAmt, a); }
  /** local (weapon) coordinates -> world */
  lw(x: number, y: number) {
    const sc = this.weapon.scale ?? 1;
    return { x: this.cx + (y - this.weapon.muzzleY) * sc, y: this.baseY - (x - this.ws.recoil * this.weapon.kick) * sc };
  }
  muzzlePos() {
    const sc = this.weapon.scale ?? 1;
    return { x: this.cx, y: this.baseY - (this.weapon.muzzle - this.ws.recoil * this.weapon.kick) * sc };
  }

  muzzleFlash(x: number, y: number, o: { size: number; color: string; core?: string; spikes?: number; life?: number; spread?: number }) {
    const n = o.spikes ?? 6;
    const sp = Array.from({ length: n }, (_, i) => ({
      a: -Math.PI / 2 + (i === 0 ? 0 : rand(-1, 1) * (o.spread ?? 0.7)),
      l: o.size * (i === 0 ? 1.5 : rand(0.5, 1.1)),
      w: o.size * rand(0.1, 0.2),
    }));
    this.addFx({
      max: o.life ?? 0.07, add: true,
      draw: (ctx, k) => {
        const a = 1 - k;
        drawGlow(ctx, x, y - o.size * 0.2, o.size * 1.9, o.color, 0.6 * a);
        for (const s of sp) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(s.a);
          const L = s.l * (1 - k * 0.45);
          ctx.fillStyle = rgba(o.color, 0.95 * a);
          ctx.beginPath(); ctx.moveTo(0, -s.w); ctx.lineTo(L, 0); ctx.lineTo(0, s.w); ctx.closePath(); ctx.fill();
          ctx.fillStyle = rgba(o.core ?? '#ffffff', a);
          ctx.beginPath(); ctx.moveTo(0, -s.w * 0.45); ctx.lineTo(L * 0.62, 0); ctx.lineTo(0, s.w * 0.45); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        drawGlow(ctx, x, y, o.size * 0.7, '#ffffff', 0.9 * a);
      },
    });
  }

  lightning(x1: number, y1: number, x2: number, y2: number, o: { color: string; core?: string; life?: number; width?: number; jag?: number; fork?: number }) {
    const jag = o.jag ?? 14;
    let pts: number[][] = [];
    let forks: number[][][] = [];
    let stamp = -1;
    const gen = () => {
      pts = [];
      forks = [];
      const n = 11;
      const dx = x2 - x1, dy = y2 - y1;
      const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L, ny = dx / L;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const e = i === 0 || i === n ? 0 : rand(-1, 1) * jag;
        pts.push([x1 + dx * t + nx * e, y1 + dy * t + ny * e]);
      }
      const nf = Math.random() < (o.fork ?? 0.6) ? 1 + ((Math.random() * 2) | 0) : 0;
      for (let f = 0; f < nf; f++) {
        const s = pts[1 + ((Math.random() * (n - 3)) | 0)];
        const a = Math.atan2(dy, dx) + rand(-1, 1) * 1.1;
        const l = rand(0.15, 0.35) * L;
        const mid = [s[0] + Math.cos(a) * l * 0.5 + rand(-6, 6), s[1] + Math.sin(a) * l * 0.5 + rand(-6, 6)];
        forks.push([s, mid, [s[0] + Math.cos(a) * l, s[1] + Math.sin(a) * l]]);
      }
    };
    this.addFx({
      max: o.life ?? 0.18, add: true,
      draw: (ctx, k, fx) => {
        const st = Math.floor(fx.age / 0.04);
        if (st !== stamp) { stamp = st; gen(); }
        const a = 1 - k;
        const stroke = (w: number, c: string, al: number) => {
          ctx.strokeStyle = rgba(c, al);
          ctx.lineWidth = w;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.beginPath();
          pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          for (const f of forks) { ctx.moveTo(f[0][0], f[0][1]); ctx.lineTo(f[1][0], f[1][1]); ctx.lineTo(f[2][0], f[2][1]); }
          ctx.stroke();
        };
        const w = o.width ?? 2;
        stroke(w * 4, o.color, 0.18 * a);
        stroke(w * 1.8, o.color, 0.75 * a);
        stroke(w * 0.8, o.core ?? '#ffffff', a);
      },
    });
  }

  /* ---------------- wheel interaction ---------------- */
  aim() {
    const dx = 0;
    const sy = this.wy + Math.sqrt(this.R * this.R - dx * dx);
    return { x: this.cx, y: this.active ? sy : -40, hit: this.active };
  }
  bottomLocal() { return Math.PI / 2 - this.wheel.angle; }
  localAngle(hx: number, hy: number) { return Math.atan2(hy - this.wy, hx - this.cx) - this.wheel.angle; }
  knifeNear(hx: number, hy: number) {
    const la = this.localAngle(hx, hy);
    return this.embeds.some((e) => e.kind === 'knife' && Math.abs(wrapAng(la - e.a)) < 0.15);
  }
  normalAt(hx: number, hy: number) { return Math.atan2(hy - this.wy, hx - this.cx); }
  heatWheel(color: string, amt: number) {
    this.wheel.heatC = color;
    this.wheel.heat = clamp(this.wheel.heat + amt, 0, 0.8);
  }

  ricochet(hx: number, hy: number) {
    this.sfx.ricochet();
    const n = this.normalAt(hx, hy);
    this.burst(hx, hy, { n: 14, ang: n, spread: 1.2, speed: [250, 700], life: [0.15, 0.4], size: [1.2, 2.4], pal: ['#fff6c8', '#ffd35a', '#ff9a2e'], len: 0.05, ay: 500 });
    this.glow(hx, hy, 34, '#ffe9a8', 0.14);
    this.ring(hx, hy, 4, 26, '#fff0c0', 0.22, 2.5);
    this.addFx({
      max: 0.16, add: true,
      draw: (ctx, k) => {
        ctx.strokeStyle = rgba('#ffffff', 1 - k);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = i * (Math.PI / 2) + 0.4;
          const l = (i % 2 ? 14 : 28) * (1 - k * 0.5);
          ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * l, hy + Math.sin(a) * l);
        }
        ctx.stroke();
      },
    });
    this.wheel.kickV -= 30;
    this.shake(1.2);
  }

  addEmbed(hx: number, hy: number, o: { kind: Embed['kind']; color?: string; glow?: string; size?: number; rot?: number; fire?: number; cracks?: number; perm?: boolean; a?: number; cool?: number }) {
    const size = o.size ?? 1;
    const cracks: number[][] = [];
    for (let i = 0; i < (o.cracks ?? 0); i++) {
      const ang = Math.PI + rand(-1, 1) * 1.05;
      const len = rand(10, 28) * size;
      const j = () => rand(-3, 3) * size;
      cracks.push([0, 0, Math.cos(ang) * len * 0.5 + j(), Math.sin(ang) * len * 0.5 + j(), Math.cos(ang) * len, Math.sin(ang) * len]);
    }
    const e: Embed = {
      kind: o.kind, a: o.a ?? this.localAngle(hx, hy), born: this.time, color: o.color ?? '#d9a441', glow: o.glow ?? '#ffb347',
      size, rot: o.rot ?? 0, cracks, fire: o.fire ?? 0, fade: 0, perm: !!o.perm, seed: Math.random() * 100, cool: o.cool ?? 1.2,
    };
    this.embeds.push(e);
    const live = this.embeds.filter((x) => !x.perm && x.fade === 0);
    if (live.length > 52) live[0].fade = 0.4;
    return e;
  }

  hit(hx: number, hy: number, o: { power?: number; count?: number; chips?: number; kick?: number; flash?: number; shake?: number; stop?: number; dust?: boolean } = {}) {
    const p = o.power ?? 1;
    this.sfx.thunk(p);
    const w = this.wheel;
    w.kickV -= 140 * p * (o.kick ?? 1);
    w.sq = clamp(w.sq + 0.012 * p * (o.kick ?? 1), 0, 0.06);
    w.flash = Math.max(w.flash, o.flash ?? 0.35 * Math.min(1.4, p));
    w.boost += 0.22 * p * w.dir;
    const n = this.normalAt(hx, hy);
    const chips = o.chips ?? Math.round(4 + 4 * p);
    for (let i = 0; i < chips; i++) {
      const a = n + rand(-1.15, 1.15);
      const sp = rand(110, 420) * (0.6 + 0.4 * Math.min(2, p));
      this.spawn({
        type: 'chip', x: hx + rand(-4, 4), y: hy, vx: Math.cos(a) * sp + rand(-40, 40), vy: Math.sin(a) * sp - rand(0, 120),
        ay: 820, size: rand(2.2, 5.4), life: rand(0.5, 1.0), vr: rand(-18, 18), pal: [pick(CHIPS)], drag: 0.6,
      });
    }
    if (o.dust !== false) {
      for (let i = 0; i < 2 + Math.round(p); i++) {
        this.spawn({
          type: 'smoke', x: hx + rand(-6, 6), y: hy + rand(-2, 4), vx: rand(-60, 60), vy: rand(10, 70), size: rand(6, 10), size1: rand(20, 34),
          life: rand(0.35, 0.65), alpha: 0.22, pal: ['#e6c9a0', '#9a8068'], drag: 2.5,
        });
      }
    }
    this.shake(o.shake ?? 1.6 * p);
    if (o.stop) this.hitstop = Math.max(this.hitstop, o.stop);
    if (this.state === 'play' && this.active) {
      this.hits += o.count ?? 1;
      if (this.hits >= this.goal) this.breakWheel();
      this.emit();
    }
  }

  /* ---------------- level flow ---------------- */
  resetWheel(anim = true) {
    this.embeds = [];
    const base = rand(0, TAU);
    [0, 2.15, 4.3].forEach((o) => this.addEmbed(0, 0, { kind: 'knife', a: base + o + rand(-0.2, 0.2), perm: true }));
    this.hits = 0;
    this.state = 'play';
    this.wheel.angle = rand(0, TAU);
    this.wheel.kick = 0; this.wheel.kickV = 0; this.wheel.heat = 0; this.wheel.flash = 0; this.wheel.freezeT = 0; this.wheel.freeze = 0; this.wheel.shiver = 0;
    this.clearedOnce = false;
    this.wheel.spawnT = anim ? 0 : 1;
    this.wheel.scale = anim ? 0 : 1;
    this.emit();
  }
  breakWheel() {
    this.sfx.breakWheel();
    this.state = 'break';
    this.breakT = 0;
    const a0 = this.wheel.angle;
    const cx = this.cx, cy = this.wy;
    const N = 11;
    const R = this.R;
    for (let i = 0; i < N; i++) {
      const s0 = (i / N) * TAU + rand(-0.04, 0.04);
      const s1 = ((i + 1) / N) * TAU;
      const am = (s0 + s1) / 2;
      const wa = am + a0;
      const mx = Math.cos(wa) * R * 0.6, my = Math.sin(wa) * R * 0.6;
      const sp = rand(220, 460);
      const piece = { x: cx + mx, y: cy + my, vx: Math.cos(wa) * sp, vy: Math.sin(wa) * sp - 260, rot: 0, vr: rand(-6, 6) };
      this.addFx({
        max: 2.4,
        draw: (ctx, k) => {
          ctx.save();
          ctx.globalAlpha = clamp((1 - k) * 3);
          ctx.translate(piece.x, piece.y);
          ctx.rotate(piece.rot);
          ctx.translate(-mx, -my);
          ctx.rotate(a0);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, R - 1, s0, s1);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(this.face, -this.faceSize / 2, -this.faceSize / 2, this.faceSize, this.faceSize);
          ctx.restore();
        },
        update: (dt) => {
          piece.vy += 1100 * dt;
          piece.x += piece.vx * dt; piece.y += piece.vy * dt; piece.rot += piece.vr * dt;
        },
      });
    }
    for (let i = 0; i < 70; i++) {
      const a = rand(0, TAU), sp = rand(150, 650);
      this.spawn({ type: 'chip', x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 200, ay: 900, size: rand(2.5, 6.5), life: rand(0.8, 1.6), vr: rand(-15, 15), pal: [pick(CHIPS)] });
    }
    this.ring(cx, cy, 20, 260, '#ffe8b0', 0.6, 8);
    this.ring(cx, cy, 10, 190, '#ffffff', 0.45, 4);
    this.glow(cx, cy, 240, '#ffd9a0', 0.4, 0.9);
    this.shake(14);
    this.hitstop = 0.12;
    this.embeds = [];
    this.emit();
  }

  /* ---------------- update ---------------- */
  update(realDt: number) {
    let dt = realDt;
    if (this.hitstop > 0) { this.hitstop -= realDt; dt *= 0.12; }
    this.time += dt;
    const w = this.wheel;
    const ws = this.ws;
    const wp = this.weapon;

    // wheel
    w.boost *= Math.exp(-dt * 2.5);
    w.shiver *= Math.exp(-dt * 6);
    w.freezeT = Math.max(0, w.freezeT - dt);
    w.freeze += ((w.freezeT > 0 ? 1 : 0) - w.freeze) * (1 - Math.exp(-dt * (w.freezeT > 0 ? 14 : 5)));
    w.angle += (1.35 * w.dir + w.boost) * dt * (1 - 0.98 * w.freeze);
    w.kickV += (-300 * w.kick - 15 * w.kickV) * dt;
    w.kick += w.kickV * dt;
    w.sq *= Math.exp(-dt * 10);
    w.flash *= Math.exp(-dt * 9);
    w.heat *= Math.exp(-dt * 1.1);
    if (w.spawnT < 1) { w.spawnT = Math.min(1, w.spawnT + dt / 0.55); const t = w.spawnT; const c1 = 1.70158, c3 = c1 + 1; w.scale = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); if (t >= 1) w.scale = 1; }
    if (this.state === 'break') {
      this.breakT += dt;
      if (this.breakT > 2.3) { this.round++; this.resetWheel(true); }
      if (this.breakT > 0.32 && !this.clearedOnce) { this.clearedOnce = true; this.sfx.levelClear(); }
    }
    this.shakeAmt *= Math.exp(-dt * 11);
    this.lightA *= Math.exp(-dt * 6);
    this.swapT = Math.min(1, this.swapT + realDt / 0.35);

    // weapon
    ws.t += dt; ws.fireT += dt;
    ws.recoil *= Math.exp(-dt * 15);
    ws.cd = Math.max(0, ws.cd - dt);
    this.pending = Math.max(0, this.pending - dt);
    ws.ready = ws.cdMax > 0 ? 1 - ws.cd / ws.cdMax : 1;
    if (wp.onRelease) {
      if (ws.holding) ws.charge = Math.min(wp.maxCharge ?? 1.6, ws.charge + dt);
      if (ws.holding) this.sfx.charge(wp.id, ws.charge);
    } else if (!wp.channel) {
      if ((ws.holding || this.pending > 0) && ws.cd <= 0) {
        ws.cd = ws.cdMax = wp.cooldown; ws.ready = 0; ws.recoil = 1; ws.fireT = 0; ws.shots++;
        this.pending = 0;
        wp.fire?.(this, ws);
      }
    } else {
      ws.minHold = Math.max(0, ws.minHold - dt);
      const target = ws.holding || ws.minHold > 0 ? 1 : 0;
      ws.chan += (target - ws.chan) * (1 - Math.exp(-dt * (target ? 16 : 8)));
      if (ws.chan < 0.01 && !target) ws.chan = 0;
      if (ws.chan > 0.01) wp.channelUpdate?.(this, ws, dt);
      this.sfx.channel(wp.id, ws.chan);
    }
    wp.update?.(this, ws, dt);

    // projectiles
    const R = this.R;
    for (const p of this.projs) {
      p.age += dt;
      p.update?.(this, dt, p);
      const py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (!p.noCollide && this.active && p.vy < 0) {
        const dx = p.x - this.cx;
        if (Math.abs(dx) < R) {
          const sy = this.wy + Math.sqrt(R * R - dx * dx);
          if (py >= sy && p.y <= sy) {
            p.alive = false;
            if (this.knifeNear(p.x, sy)) this.ricochet(p.x, sy);
            else p.onHit(this, p.x, sy, p);
          }
        }
      }
      if (p.y < -160 || p.y > this.H + 260 || p.x < -200 || p.x > this.W + 200) p.alive = false;
    }
    this.projs = this.projs.filter((p) => p.alive);

    // particles
    const parts = this.parts;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
      if (p.drag) { const f = Math.exp(-p.drag * dt); p.vx *= f; p.vy *= f; }
      if (p.turb) p.vx += Math.sin(this.time * 14 + p.seed) * p.turb * dt;
      p.vy += p.ay * dt;
      const py = p.y;
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.hit && this.active && p.vy < 0) {
        const dx = p.x - this.cx;
        if (Math.abs(dx) < R * 0.97) {
          const sy = this.wy + Math.sqrt(R * R - dx * dx);
          if (py >= sy && p.y <= sy) { p.y = sy; p.life = 0; p.hit(this, p); }
        }
      }
    }
    // fx
    for (const f of this.fx) { f.age += dt; f.update?.(dt, f); }
    this.fx = this.fx.filter((f) => f.age < f.max);

    // embeds
    for (const e of this.embeds) {
      if (e.fade > 0) e.fade -= dt;
      if (e.fire > 0 && e.kind === 'acid') {
        e.fire -= dt;
        const an = w.angle + e.a;
        const ex = this.cx + Math.cos(an) * R, ey = this.wy + Math.sin(an) * R;
        const k = clamp(e.fire / 2.4);
        if (Math.random() < dt * 22 * k) {
          this.spawn({ type: 'smoke', x: ex + rand(-8, 8), y: ey + rand(-8, 4), vx: rand(-14, 14), vy: rand(-80, -30), size: 4, size1: rand(16, 26), life: rand(0.8, 1.4), alpha: 0.24, pal: ['#f0ffc0', '#a8d84a', '#5a7a2a'], drag: 0.8 });
        }
        if (Math.random() < dt * 16 * k) {
          this.spawn({ type: 'ring', x: ex + rand(-9, 9), y: ey + rand(-6, 6), size: 1, size1: rand(4, 7), len: 1.3, life: rand(0.25, 0.5), pal: ['#e8ff8a', '#9aff2a'], alpha: 0.9 });
        }
        if (ey > this.wy + R * 0.45 && Math.random() < dt * 9 * k) {
          this.spawn({ type: 'dot', x: ex + rand(-5, 5), y: ey + 2, vx: rand(-8, 8), vy: rand(10, 50), ay: 760, size: rand(1.4, 2.6), size1: rand(1, 1.8), life: rand(0.5, 0.9), pal: ['#eaff7a', '#8be82a'], alpha: 1 });
        }
      } else if (e.fire > 0) {
        e.fire -= dt;
        if (Math.random() < dt * 14) {
          const an = w.angle + e.a;
          this.spawn({
            type: 'glow', x: this.cx + Math.cos(an) * R, y: this.wy + Math.sin(an) * R, vx: rand(-14, 14), vy: rand(-70, -30), size: rand(2, 4), size1: 0,
            life: rand(0.5, 1.0), pal: ['#ffe9a0', '#ff9a2e', '#7a2a10'], alpha: 0.9,
          });
        }
      }
    }
    this.embeds = this.embeds.filter((e) => e.fade >= 0);
  }

  /* ---------------- render ---------------- */
  render() {
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(this.bg, 0, 0, this.W, this.H);
    ctx.save();
    if (this.shakeAmt > 0.05) ctx.translate(rand(-1, 1) * this.shakeAmt, rand(-1, 1) * this.shakeAmt);

    // ambient light
    if (this.lightA > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, this.cx, this.wy + 60, 420, this.lightC, this.lightA * 0.45);
      drawGlow(ctx, this.cx, this.baseY - 260, 300, this.lightC, this.lightA * 0.3);
      ctx.globalCompositeOperation = 'source-over';
    }

    this.drawWheel(ctx);
    this.weapon.drawOverlay?.(ctx, this, this.ws);
    if (this.weapon.channel && this.ws.chan > 0.02) this.weapon.drawBeam?.(ctx, this, this.ws);
    for (const p of this.projs) { ctx.save(); p.draw(ctx, this, p); ctx.restore(); }

    // weapon
    ctx.save();
    ctx.translate(this.cx, this.baseY);
    ctx.rotate(-Math.PI / 2);
    const sw = (1 - easeOut(this.swapT)) * 260;
    const wsc = this.weapon.scale ?? 1;
    // soft contact shadow so the weapon sits in the scene
    ctx.save();
    ctx.scale(1, 1);
    const shg = ctx.createRadialGradient(0, 0, 0, 0, 0, 150 * wsc);
    shg.addColorStop(0, 'rgba(0,0,0,.45)'); shg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shg;
    ctx.fillRect(-60 * wsc, -170 * wsc, 300 * wsc, 340 * wsc);
    ctx.restore();
    ctx.scale(wsc, wsc);
    ctx.translate(-this.ws.recoil * this.weapon.kick - sw, -this.weapon.muzzleY);
    this.weapon.draw(ctx, this, this.ws);
    ctx.restore();

    // fx
    for (const f of this.fx) {
      ctx.save();
      if (f.add) ctx.globalCompositeOperation = 'lighter';
      f.draw(ctx, clamp(f.age / f.max), f);
      ctx.restore();
    }
    this.drawParticles(ctx);
    this.drawBanner(ctx);
    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    let addMode = false;
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this.parts) {
      const k = 1 - p.life / p.max;
      if (p.add !== addMode) { addMode = p.add; ctx.globalCompositeOperation = addMode ? 'lighter' : 'source-over'; }
      const size = lerp(p.size, p.size1, k);
      const c = palAt(p.pal, k);
      let a = p.alpha * (p.fadeIn > 0 ? Math.min(1, k / p.fadeIn) : 1) * (1 - k);
      switch (p.type) {
        case 'glow': case 'flame': case 'smoke': {
          if (p.type === 'flame') a = p.alpha * Math.min(1, k / 0.12) * (1 - k * k);
          ctx.globalAlpha = Math.min(1, a);
          ctx.drawImage(glowSprite(c[0], c[1], c[2]), p.x - size, p.y - size, size * 2, size * 2);
          break;
        }
        case 'spark': {
          ctx.globalAlpha = Math.min(1, a * 1.2);
          ctx.strokeStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.lineWidth = Math.max(0.6, size * (1 - k * 0.5));
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * p.len, p.y - p.vy * p.len);
          ctx.stroke();
          break;
        }
        case 'chip': {
          ctx.globalAlpha = Math.min(1, (1 - k) * 2.5);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillRect(-size, -size * 0.4, size * 2, size * 0.8);
          ctx.fillStyle = 'rgba(0,0,0,.25)';
          ctx.fillRect(-size, size * 0.1, size * 2, size * 0.3);
          ctx.restore();
          break;
        }
        case 'shell': {
          ctx.globalAlpha = Math.min(1, (1 - k) * 3);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = '#e3b04b';
          ctx.fillRect(-size, -size * 0.35, size * 2, size * 0.7);
          ctx.fillStyle = '#fff1b5';
          ctx.fillRect(-size, -size * 0.35, size * 2, size * 0.2);
          ctx.fillStyle = '#8d5c16';
          ctx.fillRect(size * 0.7, -size * 0.35, size * 0.3, size * 0.7);
          ctx.restore();
          break;
        }
        case 'dot': {
          ctx.globalAlpha = Math.min(1, a);
          ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, size), 0, TAU); ctx.fill();
          break;
        }
        case 'ring': {
          ctx.globalAlpha = Math.min(1, a);
          ctx.strokeStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.lineWidth = Math.max(0.5, p.len * (1 - k));
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, size), 0, TAU); ctx.stroke();
          break;
        }
        case 'cube': {
          ctx.globalAlpha = Math.min(1, a * 1.3);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillRect(-size, -size, size * 2, size * 2);
          ctx.restore();
          break;
        }
        case 'ash': {
          ctx.globalAlpha = Math.min(1, a * 1.5);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.fillRect(-size, -size * 0.6, size * 2, size * 1.2);
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawBanner(ctx: CanvasRenderingContext2D) {
    if (this.state !== 'break') return;
    const t = this.breakT;
    const a = clamp(t * 4) * clamp((2.2 - t) * 3);
    const s = 0.7 + 0.3 * easeOut(t * 3);
    ctx.save();
    ctx.translate(this.cx, 560);
    ctx.scale(s, s);
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.globalCompositeOperation = 'lighter';
    drawGlow(ctx, 0, -18, 190, '#ffb02e', 0.35);
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = '900 52px system-ui, sans-serif';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255,170,40,.9)';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 11;
    ctx.strokeStyle = 'rgba(60,24,0,.95)';
    ctx.strokeText('LEVEL 1 CLEAR!', 0, 0);
    ctx.shadowBlur = 0;
    const g = ctx.createLinearGradient(0, -42, 0, 8);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#ffe58a'); g.addColorStop(1, '#ff9d1e');
    ctx.fillStyle = g;
    ctx.fillText('LEVEL 1 CLEAR!', 0, 0);
    ctx.restore();
  }

  /* ---------------- wheel drawing ---------------- */
  private drawWheel(ctx: CanvasRenderingContext2D) {
    const w = this.wheel;
    if (this.state === 'break' || w.scale <= 0.01) return;
    const R = this.R;
    const cx = this.cx, wy = this.wy;
    // shadow
    const sh = ctx.createRadialGradient(cx, wy + 18, R * 0.6, cx, wy + 18, R * 1.25);
    sh.addColorStop(0, 'rgba(0,0,0,.45)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath(); ctx.arc(cx, wy + 18, R * 1.25, 0, TAU); ctx.fill();

    const jx = w.shiver > 0.05 ? (Math.random() - 0.5) * 2 * w.shiver : 0;
    const jy = w.shiver > 0.05 ? (Math.random() - 0.5) * 2 * w.shiver : 0;
    ctx.save();
    ctx.translate(cx + jx, wy + jy);
    ctx.scale(w.scale * (1 + w.sq), w.scale * (1 - w.sq));
    ctx.rotate(w.angle);

    // outside parts (handles, shafts) – behind the face
    for (const e of this.embeds) {
      ctx.save();
      ctx.rotate(e.a);
      ctx.translate(R, 0);
      ctx.globalAlpha = e.fade > 0 ? clamp(e.fade / 0.4) : 1;
      this.embedOut(ctx, e);
      ctx.restore();
    }
    ctx.drawImage(this.face, -this.faceSize / 2, -this.faceSize / 2, this.faceSize, this.faceSize);

    // inside parts
    ctx.save();
    ctx.beginPath(); ctx.arc(0, 0, R - 1, 0, TAU); ctx.clip();
    for (const e of this.embeds) {
      ctx.save();
      ctx.rotate(e.a);
      ctx.translate(R, 0);
      ctx.globalAlpha = e.fade > 0 ? clamp(e.fade / 0.4) : 1;
      this.embedIn(ctx, e);
      ctx.restore();
    }
    ctx.restore();
    ctx.restore();

    // static shading + flash + heat (world oriented)
    ctx.save();
    ctx.translate(cx + jx, wy + jy);
    ctx.scale(w.scale * (1 + w.sq), w.scale * (1 - w.sq));
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
    const hl = ctx.createRadialGradient(-R * 0.4, -R * 0.45, 4, -R * 0.2, -R * 0.2, R * 1.1);
    hl.addColorStop(0, 'rgba(255,245,220,.22)'); hl.addColorStop(0.5, 'rgba(255,245,220,0)'); hl.addColorStop(1, 'rgba(10,0,20,.28)');
    ctx.fillStyle = hl; ctx.fillRect(-R, -R, R * 2, R * 2);
    const ed = ctx.createRadialGradient(0, 0, R * 0.72, 0, 0, R);
    ed.addColorStop(0, 'rgba(0,0,0,0)'); ed.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = ed; ctx.fillRect(-R, -R, R * 2, R * 2);
    if (w.heat > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, 0, R * 0.9, R * 1.2, w.heatC, w.heat * 0.5);
    }
    if (w.freeze > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(90,200,255,${0.1 * w.freeze})`;
      ctx.fillRect(-R, -R, R * 2, R * 2);
    }
    if (w.flash > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(255,236,205,${Math.min(0.3, w.flash * 0.26)})`;
      ctx.fillRect(-R, -R, R * 2, R * 2);
    }
    ctx.restore();

    // flames over burning marks (world frame)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const e of this.embeds) {
      if (e.fire <= 0 || e.kind === 'acid') continue;
      const an = w.angle + e.a;
      const x = cx + Math.cos(an) * R, y = wy + Math.sin(an) * R;
      const f = clamp(e.fire / 0.6);
      const fl = 0.75 + 0.25 * Math.sin(this.time * 30 + e.seed);
      drawGlow(ctx, x, y - 8, 15 * fl, '#ff7a1a', 0.8 * f);
      drawGlow(ctx, x, y - 13 * fl, 9 * fl, '#ffd25a', 0.9 * f);
      drawGlow(ctx, x, y - 6, 5, '#ffffff', 0.6 * f);
    }
    ctx.restore();
  }

  private embedOut(ctx: CanvasRenderingContext2D, e: Embed) {
    const age = this.time - e.born;
    const cool = clamp(1 - age / e.cool);
    switch (e.kind) {
      case 'knife': {
        const g = ctx.createLinearGradient(0, -7, 0, 7);
        g.addColorStop(0, '#6a4326'); g.addColorStop(0.5, '#3a2210'); g.addColorStop(1, '#1c0f06');
        ctx.fillStyle = g;
        rr(ctx, 14, -6, 34, 12, 4); ctx.fill();
        ctx.strokeStyle = '#d3a14a'; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(20 + i * 7, -6); ctx.lineTo(20 + i * 7, 6); ctx.stroke(); }
        const gg = ctx.createLinearGradient(0, -12, 0, 12);
        gg.addColorStop(0, '#fff0b0'); gg.addColorStop(1, '#a8741c');
        ctx.fillStyle = gg; rr(ctx, 8, -12, 7, 24, 3); ctx.fill();
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(50, 0, 7, 0, TAU); ctx.fill();
        ctx.fillStyle = '#c02c3c'; ctx.beginPath(); ctx.arc(50, 0, 3, 0, TAU); ctx.fill();
        break;
      }
      case 'arrow': {
        const wob = Math.sin(age * 42) * 0.16 * Math.exp(-age * 5);
        ctx.rotate(wob);
        const g = ctx.createLinearGradient(0, -2.5, 0, 2.5);
        g.addColorStop(0, '#f2cf93'); g.addColorStop(1, '#8c5a2a');
        ctx.fillStyle = g; ctx.fillRect(-4, -2.2, 66, 4.4);
        // fletching
        for (const s of [-1, 1]) {
          ctx.fillStyle = s === 1 ? '#e8e8ee' : '#d63a3a';
          ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(44, s * 9); ctx.lineTo(64, s * 9); ctx.lineTo(62, 0); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = '#d63a3a'; ctx.beginPath(); ctx.moveTo(34, 0); ctx.lineTo(44, 7.5); ctx.lineTo(64, 7.5); ctx.lineTo(62, 0); ctx.fill();
        ctx.fillStyle = '#3b2a1a'; ctx.fillRect(60, -3, 5, 6);
        break;
      }
      case 'slug': {
        const pop = Math.min(1, age * 14);
        const s = e.size;
        ctx.fillStyle = 'rgba(30,12,4,.8)';
        ctx.beginPath(); ctx.arc(0, 0, 6.5 * s, 0, TAU); ctx.fill();
        const g = ctx.createLinearGradient(0, -3.5 * s, 0, 3.5 * s);
        g.addColorStop(0, e.color); g.addColorStop(1, '#6e440e');
        ctx.fillStyle = g;
        rr(ctx, -1, -3.4 * s, 6 * pop * s, 6.8 * s, 1.5); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(-1, -3 * s, 5 * pop * s, 1.1);
        break;
      }
      case 'dent': {
        ctx.fillStyle = 'rgba(30,12,4,.75)';
        ctx.beginPath(); ctx.arc(0, 0, 6 * e.size, 0, TAU); ctx.fill();
        break;
      }
      case 'nano': case 'clock': case 'helix': case 'sonic': case 'frost': case 'solar': case 'acid': break;
      default: {
        ctx.fillStyle = 'rgba(20,8,2,.85)';
        ctx.beginPath(); ctx.arc(0, 0, 7.5 * e.size, 0, TAU); ctx.fill();
        if (cool > 0) {
          ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, 0, 0, 20 * e.size, e.glow, cool * 0.9);
        }
      }
    }
  }

  private embedIn(ctx: CanvasRenderingContext2D, e: Embed) {
    const age = this.time - e.born;
    const cool = clamp(1 - age / e.cool);
    switch (e.kind) {
      case 'knife': {
        const g = ctx.createLinearGradient(0, -7, 0, 7);
        g.addColorStop(0, '#f5f8ff'); g.addColorStop(0.5, '#9aa6b8'); g.addColorStop(1, '#50596a');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(4, -7); ctx.lineTo(-52, -2); ctx.lineTo(-62, 3); ctx.lineTo(-40, 7); ctx.lineTo(4, 7); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(2, -1); ctx.lineTo(-48, 1); ctx.stroke();
        break;
      }
      case 'arrow': case 'slug': case 'dent': {
        ctx.strokeStyle = 'rgba(55,26,8,.75)'; ctx.lineWidth = 1.2;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke(); }
        if (e.kind === 'slug') {
          const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 10);
          g.addColorStop(0, 'rgba(25,10,3,.7)'); g.addColorStop(1, 'rgba(25,10,3,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 10 * e.size, 0, TAU); ctx.fill();
          if (cool > 0) { ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, -2, 0, 13 * e.size, e.glow, cool * 0.55); }
        }
        break;
      }
      case 'clock': {
        const r = 13 * e.size;
        const lit = clamp(1 - age / (e.cool + 0.3));
        const pop = Math.min(1, age * 9);
        ctx.translate(-r - 3, 0);
        ctx.scale(pop, pop);
        ctx.fillStyle = 'rgba(14,10,4,.82)';
        ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, 0, 0, r * 2, e.glow, lit * 0.5);
        ctx.strokeStyle = rgba(e.glow, 0.45 + 0.55 * lit); ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU, l = i % 3 ? 3 : 5.5;
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * (r - 1), Math.sin(a) * (r - 1)); ctx.lineTo(Math.cos(a) * (r - l), Math.sin(a) * (r - l)); ctx.stroke();
        }
        const tick = this.wheel.freeze > 0.5 ? 0 : this.time * 4;
        const ha = e.seed, ma = e.seed * 3 + tick;
        ctx.lineCap = 'round';
        ctx.strokeStyle = rgba('#fff3c8', 0.5 + 0.5 * lit); ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ha) * r * 0.5, Math.sin(ha) * r * 0.5); ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ma) * r * 0.78, Math.sin(ma) * r * 0.78); ctx.stroke();
        drawGlow(ctx, 0, 0, 4, '#ffffff', 0.8);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'helix': {
        const L = 40 * e.size;
        const lit = clamp(1 - age / (e.cool + 0.3));
        const gd = ctx.createRadialGradient(0, 0, 1, 0, 0, 13 * e.size);
        gd.addColorStop(0, 'rgba(14,6,20,.8)'); gd.addColorStop(1, 'rgba(14,6,20,0)');
        ctx.fillStyle = gd; ctx.beginPath(); ctx.arc(0, 0, 13 * e.size, 0, TAU); ctx.fill();
        ctx.translate(-3, 0);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        const yy = (u: number, sg: number) => Math.sin(u * 11 + e.seed + sg * Math.PI) * 6 * e.size * (1 - u * 0.3);
        for (let sg = 0; sg < 2; sg++) {
          ctx.strokeStyle = rgba(sg ? e.glow : e.color, (0.22 + 0.75 * lit) * (0.8 + 0.2 * Math.sin(this.time * 20 + sg)));
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i <= 24; i++) { const u = i / 24; i ? ctx.lineTo(-u * L, yy(u, sg)) : ctx.moveTo(0, yy(0, sg)); }
          ctx.stroke();
        }
        ctx.strokeStyle = rgba('#ffffff', 0.5 * lit); ctx.lineWidth = 1;
        for (let i = 1; i < 24; i += 2) { const u = i / 24; ctx.beginPath(); ctx.moveTo(-u * L, yy(u, 0)); ctx.lineTo(-u * L, yy(u, 1)); ctx.stroke(); }
        drawGlow(ctx, 0, 0, 16 * e.size, e.glow, lit * 0.6);
        drawGlow(ctx, 0, 0, 10 * e.size, e.color, lit * 0.5);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'sonic': {
        const lit = clamp(1 - age / (e.cool + 0.3));
        const rad = 17 * e.size;
        const dg = ctx.createRadialGradient(0, 0, 1, 0, 0, rad);
        dg.addColorStop(0, 'rgba(20,6,14,.8)'); dg.addColorStop(1, 'rgba(20,6,14,0)');
        ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(0, 0, rad, 0, TAU); ctx.fill();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20,6,12,.85)'; ctx.lineWidth = 1.6;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(e.glow, (0.3 + 0.7 * lit) * 0.9); ctx.lineWidth = 1.4;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke(); }
        for (let i = 0; i < 4; i++) {
          const r = (9 + i * 8) * e.size;
          ctx.strokeStyle = rgba(i % 2 ? e.glow : '#ffffff', (0.85 - i * 0.16) * (0.25 + 0.75 * lit));
          ctx.lineWidth = 2.2 - i * 0.35;
          ctx.beginPath(); ctx.arc(0, 0, r, Math.PI - 1.15, Math.PI + 1.15); ctx.stroke();
        }
        drawGlow(ctx, -4, 0, 24 * e.size, e.glow, lit * 0.55);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'frost': {
        const grow = easeOut(clamp(age / 0.55));
        const sz = e.size * grow;
        const tw = 0.65 + 0.35 * Math.sin(this.time * 6 + e.seed);
        const hr = 36 * e.size;
        const hg = ctx.createRadialGradient(-8, 0, 2, -8, 0, hr);
        hg.addColorStop(0, 'rgba(240,252,255,.6)'); hg.addColorStop(0.55, 'rgba(180,228,255,.28)'); hg.addColorStop(1, 'rgba(180,228,255,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(-8, 0, hr * (0.4 + 0.6 * grow), 0, TAU); ctx.fill();
        ctx.save();
        ctx.translate(-8 * e.size, 0); ctx.rotate(e.seed);
        ctx.lineCap = 'round';
        const arm = () => {
          const L = 30 * sz;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(L, 0);
          for (const [b, l] of [[0.34, 0.4], [0.6, 0.3], [0.82, 0.17]] as number[][]) {
            const bx = L * b, bl = L * l;
            ctx.moveTo(bx, 0); ctx.lineTo(bx + bl * 0.5, bl * 0.87);
            ctx.moveTo(bx, 0); ctx.lineTo(bx + bl * 0.5, -bl * 0.87);
          }
        };
        for (let pass = 0; pass < 2; pass++) {
          ctx.strokeStyle = pass === 0 ? 'rgba(150,215,255,.4)' : 'rgba(255,255,255,.95)';
          ctx.lineWidth = pass === 0 ? 4.4 : 1.7;
          for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate((k * TAU) / 6); arm(); ctx.stroke(); ctx.restore(); }
        }
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
        drawGlow(ctx, -8 * e.size, 0, 16 * e.size, '#cfeeff', 0.5 * tw * grow);
        for (let k = 0; k < 3; k++) {
          const a = e.seed + k * 2.4, d = (10 + k * 9) * e.size;
          const tk = Math.max(0, Math.sin(this.time * 4 + k * 2 + e.seed));
          drawGlow(ctx, -8 * e.size + Math.cos(a) * d, Math.sin(a) * d, 6, '#ffffff', tk * 0.9 * grow);
        }
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'solar': {
        const lit = clamp(1 - age / (e.cool + 0.8));
        const fl = 0.85 + 0.15 * Math.sin(this.time * 16 + e.seed);
        const rad = 24 * e.size;
        const cg = ctx.createRadialGradient(0, 0, 1, 0, 0, rad);
        cg.addColorStop(0, 'rgba(8,3,1,.92)'); cg.addColorStop(0.55, 'rgba(30,12,4,.55)'); cg.addColorStop(1, 'rgba(30,12,4,0)');
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, rad, 0, TAU); ctx.fill();
        const rays: number[][] = [];
        for (let i = 0; i < 9; i++) {
          const ang = Math.PI + (i - 4) * 0.36 + Math.sin(e.seed * 7 + i * 3.1) * 0.12;
          const len = (20 + (Math.sin(e.seed * 3 + i * 4.7) * 0.5 + 0.5) * 34) * e.size;
          rays.push([Math.cos(ang) * len, Math.sin(ang) * len, Math.cos(ang + 0.2) * len * 0.5, Math.sin(ang + 0.2) * len * 0.5]);
        }
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(12,5,1,.85)'; ctx.lineWidth = 3;
        for (const r of rays) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r[2], r[3], r[0], r[1]); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(e.glow, 0.9 * lit * fl); ctx.lineWidth = 2;
        for (const r of rays) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r[2], r[3], r[0], r[1]); ctx.stroke(); }
        ctx.strokeStyle = rgba('#fff4c8', 0.8 * lit * fl); ctx.lineWidth = 0.9;
        for (const r of rays) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(r[2], r[3], r[0], r[1]); ctx.stroke(); }
        ctx.strokeStyle = rgba('#ffd870', 0.7 * lit); ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(-3, 0, 11 * e.size, Math.PI - 1.3, Math.PI + 1.3); ctx.stroke();
        drawGlow(ctx, -3, 0, rad * 1.25, e.glow, lit * 0.8 * fl);
        drawGlow(ctx, -3, 0, rad * 0.45, '#fff2c0', lit * 0.8);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'acid': {
        const grow = 1 - Math.exp(-age * 2.1);
        const rad = e.size * (9 + 17 * grow);
        const lit = 0.16 + 0.84 * clamp(1 - age / (e.cool + 1.6));
        ctx.translate(-rad * 0.35, 0);
        // wet yellow-green stain on the wood
        const st = ctx.createRadialGradient(0, 0, rad * 0.5, 0, 0, rad * 1.9);
        st.addColorStop(0, 'rgba(110,140,24,.38)'); st.addColorStop(1, 'rgba(110,140,24,0)');
        ctx.fillStyle = st; ctx.beginPath(); ctx.arc(0, 0, rad * 1.9, 0, TAU); ctx.fill();
        // irregular eaten pit
        const pit = () => {
          ctx.beginPath();
          for (let i = 0; i <= 56; i++) {
            const a = (i / 56) * TAU;
            const rr0 = rad * (0.9 + 0.08 * Math.sin(a * 3 + e.seed) + 0.045 * Math.sin(a * 5 + e.seed * 2) + 0.02 * Math.sin(a * 11 + e.seed * 3));
            i ? ctx.lineTo(Math.cos(a) * rr0, Math.sin(a) * rr0) : ctx.moveTo(Math.cos(a) * rr0, Math.sin(a) * rr0);
          }
          ctx.closePath();
        };
        const sc = ctx.createRadialGradient(0, 0, rad * 0.8, 0, 0, rad * 1.55);
        sc.addColorStop(0, 'rgba(18,9,3,.7)'); sc.addColorStop(1, 'rgba(18,9,3,0)');
        ctx.fillStyle = sc; ctx.beginPath(); ctx.arc(0, 0, rad * 1.55, 0, TAU); ctx.fill();
        pit();
        ctx.fillStyle = 'rgba(14,9,3,.95)'; ctx.fill();
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(8,4,1,.95)'; ctx.lineWidth = 5; ctx.stroke();
        ctx.save(); pit(); ctx.clip();
        const pg = ctx.createRadialGradient(0, 0, 1, 0, 0, rad);
        pg.addColorStop(0, '#010100'); pg.addColorStop(0.6, '#070a02'); pg.addColorStop(1, '#1c2606');
        ctx.fillStyle = pg; ctx.fillRect(-rad * 1.4, -rad * 1.4, rad * 2.8, rad * 2.8);
        // glossy acid pool inside
        ctx.globalCompositeOperation = 'lighter';
        const ag = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
        ag.addColorStop(0, rgba('#d8ff4a', 0)); ag.addColorStop(0.55, rgba('#7be21a', 0.08 * lit)); ag.addColorStop(0.86, rgba('#9aef2a', 0.42 * lit)); ag.addColorStop(1, rgba('#c8ff3a', 0.85 * lit));
        ctx.fillStyle = ag; ctx.fillRect(-rad * 1.4, -rad * 1.4, rad * 2.8, rad * 2.8);
        // bubbles
        for (let i = 0; i < 9; i++) {
          const ph = (this.time * (0.9 + (i % 4) * 0.35) + i * 0.37 + e.seed) % 1;
          const bx = Math.cos(i * 2.4 + e.seed) * rad * 0.58 * ((i % 3 + 1) / 3);
          const by = Math.sin(i * 2.4 + e.seed) * rad * 0.58 * ((i % 3 + 1) / 3);
          const br = (1.2 + ph * 3.6) * e.size;
          ctx.strokeStyle = rgba('#f4ffb0', Math.sin(Math.PI * ph) * 0.95 * (0.3 + 0.7 * lit)); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(bx, by, br, 0, TAU); ctx.stroke();
          ctx.fillStyle = rgba('#ffffff', Math.sin(Math.PI * ph) * 0.7 * lit);
          ctx.beginPath(); ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.28, 0, TAU); ctx.fill();
        }
        ctx.restore();
        // glowing eaten rim + radial cracks
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(8,4,1,.9)'; ctx.lineWidth = 1.8;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2] * 1.6, c[3] * 1.6); ctx.lineTo(c[4] * 1.6, c[5] * 1.6); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba('#c8ff3a', 0.8 * lit); ctx.lineWidth = 1.6;
        pit(); ctx.stroke();
        ctx.strokeStyle = rgba('#e8ff8a', 0.55 * lit); ctx.lineWidth = 1.1;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2] * 1.6, c[3] * 1.6); ctx.lineTo(c[4] * 1.6, c[5] * 1.6); ctx.stroke(); }
        drawGlow(ctx, 0, 0, rad * 1.7, '#9aff2a', lit * 0.32);
        ctx.globalCompositeOperation = 'source-over';
        break;
      }
      case 'nano': {
        const r = 5 * e.size;
        const cells = [[0, 0], [1.5, 0.866], [1.5, -0.866], [-1.5, 0.866], [-1.5, -0.866], [0, 1.732], [0, -1.732], [3, 0], [-3, 0], [1.5, 2.598], [1.5, -2.598], [-1.5, 2.598], [-1.5, -2.598]];
        ctx.translate(-9 * e.size, 0);
        cells.forEach((c, i) => {
          const delay = Math.hypot(c[0], c[1]) * 0.035;
          if (age < delay) return;
          const lit = clamp(1 - (age - delay) / (e.cool + 0.2));
          const fl = 0.75 + 0.25 * Math.sin(this.time * 22 + i * 1.7 + e.seed);
          const cx0 = c[0] * r * 1.06, cy0 = c[1] * r * 1.06;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; const px = cx0 + Math.cos(a) * r * 0.9, py = cy0 + Math.sin(a) * r * 0.9; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.closePath();
          ctx.fillStyle = 'rgba(10,18,4,.82)'; ctx.fill();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = rgba(e.glow, 0.22 * lit * fl); ctx.fill();
          ctx.strokeStyle = rgba(e.glow, (0.25 + 0.7 * lit) * fl); ctx.lineWidth = 1.2; ctx.stroke();
          if (lit > 0.3) drawGlow(ctx, cx0, cy0, r * 1.7, e.glow, lit * 0.45 * fl);
          ctx.globalCompositeOperation = 'source-over';
        });
        break;
      }
      case 'slash': {
        const L = 74 * e.size;
        ctx.save();
        ctx.rotate(Math.PI + e.rot);
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(20,8,2,.8)'; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, 5, L, 0); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = rgba(e.glow, 0.25 + 0.75 * cool); ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, 5, L, 0); ctx.stroke();
        ctx.strokeStyle = rgba('#ffffff', 0.15 + 0.85 * cool); ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
        break;
      }
      default: {
        // scorch / burn / crater
        const rad = (e.kind === 'crater' ? 20 : 15) * e.size;
        const g = ctx.createRadialGradient(0, 0, 1, 0, 0, rad);
        g.addColorStop(0, e.kind === 'burn' ? 'rgba(10,4,1,.88)' : 'rgba(14,6,2,.8)');
        g.addColorStop(0.6, 'rgba(30,14,5,.45)'); g.addColorStop(1, 'rgba(30,14,5,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rad, 0, TAU); ctx.fill();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(15,6,2,.85)'; ctx.lineWidth = 1.6;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke(); }
        ctx.globalCompositeOperation = 'lighter';
        const flick = e.kind === 'burn' ? 0.8 + 0.2 * Math.sin(this.time * 18 + e.seed) : 1;
        const gl = e.kind === 'burn' ? clamp(1 - age / (e.cool + 1)) : cool;
        ctx.strokeStyle = rgba(e.glow, 0.85 * gl * flick); ctx.lineWidth = 1.6;
        for (const c of e.cracks) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke(); }
        drawGlow(ctx, -3, 0, rad * 0.9, e.glow, gl * 0.7 * flick);
        if (e.kind === 'crater') {
          ctx.strokeStyle = rgba(e.glow, 0.7 * cool); ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(-2, 0, 12 * e.size, 0, TAU); ctx.stroke();
        }
      }
    }
  }

  /* ---------------- pre-rendered art ---------------- */
  private buildBg() {
    const c = document.createElement('canvas');
    c.width = this.W * this.dpr; c.height = this.H * this.dpr;
    const x = c.getContext('2d')!;
    x.scale(this.dpr, this.dpr);
    const g = x.createLinearGradient(0, 0, 0, this.H);
    g.addColorStop(0, '#1f1740'); g.addColorStop(0.5, '#141233'); g.addColorStop(1, '#07080f');
    x.fillStyle = g; x.fillRect(0, 0, this.W, this.H);
    const rng = mulberry(7);
    for (let i = 0; i < 70; i++) {
      const px = rng() * this.W, py = rng() * this.H * 0.8, r = rng() * 1.4 + 0.3;
      x.fillStyle = `rgba(190,200,255,${0.1 + rng() * 0.4})`;
      x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    }
    for (let i = 0; i < 9; i++) {
      const px = rng() * this.W, py = rng() * this.H, r = 30 + rng() * 90;
      const bg = x.createRadialGradient(px, py, 0, px, py, r);
      bg.addColorStop(0, `rgba(${(120 + rng() * 80) | 0},${(80 + rng() * 60) | 0},255,0.07)`); bg.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = bg; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    }
    const halo = x.createRadialGradient(this.cx, this.wy0, 20, this.cx, this.wy0, 330);
    halo.addColorStop(0, 'rgba(255,170,90,.22)'); halo.addColorStop(0.5, 'rgba(120,70,200,.1)'); halo.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = halo; x.fillRect(0, 0, this.W, this.H);
    // lane guide
    const lane = x.createLinearGradient(0, this.wy0 + this.R, 0, this.H);
    lane.addColorStop(0, 'rgba(255,255,255,.05)'); lane.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = lane; x.fillRect(this.cx - 26, this.wy0 + this.R, 52, this.H);
    const floor = x.createLinearGradient(0, this.H - 190, 0, this.H);
    floor.addColorStop(0, 'rgba(0,0,0,0)'); floor.addColorStop(1, 'rgba(0,0,0,.55)');
    x.fillStyle = floor; x.fillRect(0, this.H - 190, this.W, 190);
    this.bg = c;
  }

  private buildFace() {
    const R = this.R;
    const pad = 16;
    const size = (R + pad) * 2;
    this.faceSize = size;
    const c = document.createElement('canvas');
    c.width = c.height = Math.ceil(size * this.dpr);
    const x = c.getContext('2d')!;
    x.scale(this.dpr, this.dpr);
    x.translate(size / 2, size / 2);
    const rng = mulberry(42);
    // bark
    x.beginPath();
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * TAU;
      const r = R + Math.sin(a * 11) * 1.8 + Math.sin(a * 23) * 1.1 + (rng() - 0.5) * 1.2;
      i ? x.lineTo(Math.cos(a) * r, Math.sin(a) * r) : x.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    x.closePath();
    const bark = x.createRadialGradient(0, 0, R - 18, 0, 0, R + 2);
    bark.addColorStop(0, '#6b4121'); bark.addColorStop(0.6, '#4a2a13'); bark.addColorStop(1, '#2a160a');
    x.fillStyle = bark; x.fill();
    x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1;
    for (let i = 0; i < 90; i++) {
      const a = rng() * TAU, l = 4 + rng() * 9;
      x.beginPath(); x.moveTo(Math.cos(a) * (R - 1), Math.sin(a) * (R - 1)); x.lineTo(Math.cos(a) * (R - 1 - l), Math.sin(a) * (R - 1 - l)); x.stroke();
    }
    // face
    const fr = R - 12;
    const wood = x.createRadialGradient(0, 0, 4, 0, 0, fr);
    wood.addColorStop(0, '#f6d49b'); wood.addColorStop(0.55, '#e0a964'); wood.addColorStop(1, '#bd783a');
    x.fillStyle = wood; x.beginPath(); x.arc(0, 0, fr, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(255,230,180,.55)'; x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, fr, 0, TAU); x.stroke();
    x.save();
    x.beginPath(); x.arc(0, 0, fr, 0, TAU); x.clip();
    // radial grain
    for (let i = 0; i < 70; i++) {
      const a = rng() * TAU;
      x.strokeStyle = `rgba(110,60,20,${0.05 + rng() * 0.08})`; x.lineWidth = 0.8 + rng();
      x.beginPath(); x.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); x.lineTo(Math.cos(a) * fr, Math.sin(a) * fr); x.stroke();
    }
    // growth rings
    for (let r = 12; r < fr; r += 8 + rng() * 3) {
      x.beginPath();
      for (let i = 0; i <= 100; i++) {
        const a = (i / 100) * TAU;
        const rr2 = r + Math.sin(a * 3 + r) * 1.3 + Math.sin(a * 5 + r * 0.7) * 0.9;
        i ? x.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : x.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
      }
      x.closePath();
      x.strokeStyle = `rgba(104,56,18,${0.2 + rng() * 0.18})`; x.lineWidth = 1 + rng() * 1.3; x.stroke();
      x.strokeStyle = 'rgba(255,236,190,.18)'; x.lineWidth = 0.8; x.stroke();
    }
    // checks / cracks
    for (let i = 0; i < 5; i++) {
      const a = rng() * TAU, l = 24 + rng() * 34;
      let px = Math.cos(a) * fr, py = Math.sin(a) * fr;
      x.beginPath(); x.moveTo(px, py);
      for (let s = 1; s <= 4; s++) { px -= Math.cos(a) * l / 4 + (rng() - 0.5) * 4; py -= Math.sin(a) * l / 4 + (rng() - 0.5) * 4; x.lineTo(px, py); }
      x.strokeStyle = 'rgba(70,32,8,.7)'; x.lineWidth = 1.6; x.stroke();
    }
    // knots
    for (let i = 0; i < 3; i++) {
      const a = rng() * TAU, d = 38 + rng() * 40;
      const kx = Math.cos(a) * d, ky = Math.sin(a) * d;
      const kg = x.createRadialGradient(kx, ky, 0, kx, ky, 9);
      kg.addColorStop(0, '#5a2f10'); kg.addColorStop(1, 'rgba(120,70,30,0)');
      x.fillStyle = kg; x.beginPath(); x.ellipse(kx, ky, 9, 5, a, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(80,40,12,.5)'; x.lineWidth = 1;
      x.beginPath(); x.ellipse(kx, ky, 5, 2.6, a, 0, TAU); x.stroke();
    }
    // painted rim dots
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      x.fillStyle = i % 3 === 0 ? 'rgba(200,50,60,.85)' : 'rgba(90,40,14,.6)';
      x.beginPath(); x.arc(Math.cos(a) * (fr - 12), Math.sin(a) * (fr - 12), i % 3 === 0 ? 4.2 : 2.6, 0, TAU); x.fill();
    }
    x.restore();
    // hub
    const hub = x.createRadialGradient(-4, -4, 1, 0, 0, 22);
    hub.addColorStop(0, '#9a6a3a'); hub.addColorStop(0.6, '#5b3718'); hub.addColorStop(1, '#2e1a08');
    x.fillStyle = hub; x.beginPath(); x.arc(0, 0, 21, 0, TAU); x.fill();
    x.strokeStyle = '#e8c070'; x.lineWidth = 2; x.beginPath(); x.arc(0, 0, 21, 0, TAU); x.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      x.fillStyle = '#e8c070'; x.beginPath(); x.arc(Math.cos(a) * 13, Math.sin(a) * 13, 2, 0, TAU); x.fill();
    }
    const bolt = x.createRadialGradient(-1, -1, 0, 0, 0, 6);
    bolt.addColorStop(0, '#fff'); bolt.addColorStop(1, '#888');
    x.fillStyle = bolt; x.beginPath(); x.arc(0, 0, 5.5, 0, TAU); x.fill();
    this.face = c;
  }
}
