import { drawBreakerDiamond } from '../../../shared/diamondArt';

const TAU = Math.PI * 2;
const REFERENCE_RADIUS = 196;
const IMAGE_RADIUS = 230;
export const LARGE_DIAMOND_CORE_RADIUS = 62; // Covers the full visible gem outline in rock-local coordinates.
const rand = (a: number, b: number) => a + Math.random() * (b - a);
type Point = { x: number; y: number };

type RockCell = {
  id: number;
  poly: Point[];
  center: Point;
  rMin: number;
  rMax: number;
  hp: number;
  maxHp: number;
  type: 'rock' | 'hard' | 'ore' | 'crystal';
  alive: boolean;
  hue: number;
  sat: number;
  light: number;
  specks: { x: number; y: number; r: number }[];
  pits: { x: number; y: number; r: number; a: number }[];
  moss: { x: number; y: number; r: number }[];
  grain: { x: number; y: number; r: number; d: number }[];
  shardSeed: number;
  cracks: Point[][];
  flash: number;
  path?: Path2D;
  speckPath?: Path2D;
  fallenSprite?: { image: HTMLCanvasElement; x: number; y: number };
};

export type BrokenRockCell = Point & { id: number };
export type RockHit = { kind: 'rock'; struckId: number; broken: BrokenRockCell[]; remaining: number }
  | { kind: 'diamond'; broken: []; remaining: number };

function pointInPoly(p: Point, poly: Point[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/**
 * Diamond Breaker's irregular, individually breakable slate/ore/crystal chunks,
 * adapted to Gun Hit's smaller spinning target. Geometry stays in the source
 * game's 196px space; only drawing and projectile coordinates are scaled.
 */
export class DiamondRock {
  private cells: RockCell[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private intactCanvas: HTMLCanvasElement | null = null;
  private dpr = 1;
  private dirty = true;
  private shimmer: RockCell[] = [];
  private flashing: RockCell[] = [];
  private cracked: RockCell[] = [];
  remaining = 0;
  readonly total: number;

  constructor() {
    this.generate();
    this.total = this.cells.length;
    this.remaining = this.total;
  }

  private generate() {
    // Same concentric, jagged stone construction and palette as Diamond Breaker.
    const RINGS = [64, 90, 116, 142, 168, 196];
    const SECT = [8, 12, 16, 24, 32];
    const STEPS = 96;
    const seed = Math.random() * 1000;
    const h = (a: number, b: number, c = 0) => {
      const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + seed) * 43758.5453;
      return s - Math.floor(s);
    };
    const wrap = (k: number) => ((k % STEPS) + STEPS) % STEPS;
    const bp = (i: number, k: number): Point => {
      k = wrap(k);
      const th = (k / STEPS) * TAU;
      let r = RINGS[i];
      if (i === 0) r += (h(i, k) - 0.5) * 3;
      else if (i === RINGS.length - 1) r += Math.sin(th * 3 + seed) * 9 + Math.sin(th * 7 + seed * 2) * 5 + (h(i, k) - 0.5) * 12;
      else r += (h(i, k) - 0.5) * 10;
      return { x: Math.cos(th) * r, y: Math.sin(th) * r };
    };
    const rm = (i: number, k: number): Point => {
      k = wrap(k);
      const a = bp(i, k), b = bp(i + 1, k);
      const th = (k / STEPS) * TAU;
      const off = (h(i, k, 7) - 0.5) * 9;
      return { x: (a.x + b.x) / 2 - Math.sin(th) * off, y: (a.y + b.y) / 2 + Math.cos(th) * off };
    };
    for (let i = 0; i < SECT.length; i++) {
      const n = SECT[i], per = STEPS / n;
      for (let j = 0; j < n; j++) {
        const k0 = j * per, k1 = k0 + per;
        const poly: Point[] = [];
        for (let k = k0; k <= k1; k++) poly.push(bp(i, k));
        poly.push(rm(i, k1));
        for (let k = k1; k >= k0; k--) poly.push(bp(i + 1, k));
        poly.push(rm(i, k0));
        let cx = 0, cy = 0, rMin = Infinity, rMax = 0;
        for (const p of poly) {
          cx += p.x; cy += p.y;
          const r = Math.hypot(p.x, p.y);
          rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
        }
        cx /= poly.length; cy /= poly.length;
        const roll = Math.random();
        let type: RockCell['type'] = 'rock';
        if (i > 0 && i < 4 && roll < 0.12) type = 'hard';
        else if (roll > 0.93) type = 'ore';
        else if (i < 3 && roll > 0.86) type = 'crystal';
        const baseHp = i === 0 ? 3 : i === 4 ? 2 : 2 + (Math.random() < 0.3 ? 1 : 0);
        const hp = type === 'hard' ? 6 : type === 'ore' ? 3 : type === 'crystal' ? 4 : baseHp;
        const inPoly = (f1: number, f2: number) => {
          const p = poly[Math.floor(Math.random() * poly.length)];
          const f = rand(f1, f2);
          return { x: cx + (p.x - cx) * f, y: cy + (p.y - cy) * f };
        };
        const specks: RockCell['specks'] = [];
        if (type === 'ore') for (let s = 0; s < 9; s++) specks.push({ ...inPoly(0.1, 0.78), r: rand(1.5, 3.4) });
        const pits: RockCell['pits'] = [];
        for (let s = 0; s < 5; s++) pits.push({ ...inPoly(0.1, 0.8), r: rand(2, 6.5), a: rand(0.05, 0.16) });
        const moss: RockCell['moss'] = [];
        if (i >= 3 && Math.random() < 0.5) for (let s = 0; s < 4; s++) moss.push({ ...inPoly(0.5, 0.95), r: rand(3, 8) });
        const grain: RockCell['grain'] = [];
        for (let s = 0; s < 22; s++) grain.push({ ...inPoly(0.05, 0.95), r: rand(1, 2.4), d: Math.random() < 0.5 ? 1 : -1 });
        this.cells.push({
          id: this.cells.length, poly, center: { x: cx, y: cy }, rMin, rMax, hp, maxHp: hp, type, alive: true,
          hue: type === 'hard' ? 222 : type === 'crystal' ? 268 : type === 'ore' ? 200 : rand(205, 228),
          sat: type === 'hard' ? 16 : type === 'crystal' ? 30 : type === 'ore' ? 14 : rand(8, 16),
          light: type === 'hard' ? rand(22, 28) : type === 'crystal' ? rand(34, 42)
            : type === 'ore' ? rand(40, 47) : rand(42, 54) - i * 2.4,
          specks, pits, moss, grain, shardSeed: Math.random() * 10, cracks: [], flash: 0,
        });
      }
    }
    this.shimmer = this.cells.filter(c => c.type === 'crystal' || c.type === 'ore');
  }

  /** Break every surviving chunk at once when the large core is collected. */
  shatterAll(): BrokenRockCell[] {
    const broken: BrokenRockCell[] = [];
    for (const cell of this.cells) {
      if (!cell.alive) continue;
      cell.alive = false;
      cell.flash = 1;
      this.remaining--;
      this.eraseChunk(cell);
      broken.push({ id: cell.id, ...cell.center });
    }
    this.shimmer = [];
    this.flashing = [];
    this.cracked = [];
    return broken;
  }

  /** Projectile position is in rock-local Diamond Breaker coordinates. */
  /**
   * `splashDamage` defaults to the old "two less than the hit" falloff; the game
   * passes the full damage so one shot always takes a couple of chunks with it.
   */
  hitAt(p: Point, damage: number, splash: number, projectileRadius = 0,
    splashDamage = Math.max(1, damage - 2)): RockHit | null {
    const r = Math.hypot(p.x, p.y);
    if (r > 215) return null;
    // The gem is visible beneath the inner rock rim. Give its full silhouette a
    // forgiving, weapon-aware hit area so skinny/offset shots don't look inert.
    if (r <= LARGE_DIAMOND_CORE_RADIUS + Math.max(0, projectileRadius)) {
      return { kind: 'diamond', broken: [], remaining: this.remaining };
    }
    // Keep an untouched texture for chunks that later fall away. In the game
    // this is normally baked by the first render, before a shot can arrive.
    if (typeof document !== 'undefined' && !this.intactCanvas) this.bake();
    let struck = this.cells.find(c => c.alive && r >= c.rMin - 2 && r <= c.rMax + 2 && pointInPoly(p, c.poly));
    if (!struck) {
      // The stone is a soup of jagged polygons, so a round can slip through the
      // seam between two chunk edges and out the back of the rock — it reads as
      // a shot that simply vanished. A hit anywhere on the stone is a hit: fall
      // back to the nearest surviving chunk within a chunk's own width.
      let nearest: RockCell | undefined;
      let nearestD = Infinity;
      for (const c of this.cells) {
        if (!c.alive) continue;
        const d = Math.hypot(c.center.x - p.x, c.center.y - p.y);
        if (d < nearestD) { nearestD = d; nearest = c; }
      }
      if (nearest && nearestD <= 34) struck = nearest;
    }
    if (!struck) return null;

    const broken: BrokenRockCell[] = [];
    const damageCell = (c: RockCell, amount: number, at: Point) => {
      c.hp -= amount;
      c.flash = 1;
      if (!this.flashing.includes(c)) this.flashing.push(c);
      if (!this.cracked.includes(c)) this.cracked.push(c);
      // Stable crack marks on the impacted chunk, not random lines each frame.
      const crackLine = [at, { x: (at.x + c.center.x) / 2 + rand(-4, 4), y: (at.y + c.center.y) / 2 + rand(-4, 4) }, c.center];
      c.cracks.push(crackLine);
      if (c.hp <= 0) {
        c.alive = false;
        this.remaining--;
        this.eraseChunk(c);
        broken.push({ id: c.id, ...c.center });
        this.shimmer = this.shimmer.filter(s => s !== c);
        this.cracked = this.cracked.filter(s => s !== c);
      } else {
        this.paintCrackOnCanvas(c, crackLine);
      }
    };
    damageCell(struck, damage, p);
    if (splash > 0) {
      for (const c of this.cells) {
        if (!c.alive || c === struck) continue;
        if (Math.hypot(c.center.x - p.x, c.center.y - p.y) < splash) {
          damageCell(c, Math.max(1, splashDamage), c.center);
        }
      }
    }
    return { kind: 'rock', struckId: struck.id, broken, remaining: this.remaining };
  }

  private paintCrackOnCanvas(c: RockCell, line: { x: number; y: number }[]) {
    if (!this.canvas || !c.path || line.length < 2) return;
    const ctx = this.canvas.getContext('2d')!;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.translate(IMAGE_RADIUS, IMAGE_RADIUS);
    ctx.clip(c.path);
    ctx.beginPath();
    ctx.moveTo(line[0].x, line[0].y);
    for (let k = 1; k < line.length; k++) ctx.lineTo(line[k].x, line[k].y);
    ctx.strokeStyle = 'rgba(8,14,22,0.92)';
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(225,240,255,0.3)';
    ctx.lineWidth = 1;
    ctx.translate(1.2, 1.2);
    ctx.stroke();
    ctx.restore();
  }

  private eraseChunk(c: RockCell) {
    // Don't re-paint all 92 textured chunks for every bullet: punch only this
    // polygon out of the cached rock. The diamond beneath remains visible.
    if (!this.canvas || !c.path) { this.dirty = true; return; }
    const ctx = this.canvas.getContext('2d')!;
    ctx.save();
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.translate(IMAGE_RADIUS, IMAGE_RADIUS);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fill(c.path);
    ctx.lineWidth = 2;
    ctx.stroke(c.path);
    ctx.restore();
  }

  update(dt: number) {
    for (let i = this.flashing.length - 1; i >= 0; i--) {
      const c = this.flashing[i];
      c.flash = Math.max(0, c.flash - dt * 7);
      if (c.flash === 0) this.flashing.splice(i, 1);
    }
  }

  /** Pre-bake rock bitmap on stage load so Frame 1 of Bonus/Boulder play has 0ms hitch. */
  prebake() {
    if (
      this.dirty &&
      typeof document !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined'
    ) {
      const probe = document.createElement('canvas');
      if (probe instanceof HTMLCanvasElement) {
        this.bake();
      }
    }
  }

  private bake() {
    const R = IMAGE_RADIUS, size = R * 2;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      // The 460px source bitmap is already ~2x the 224px on-screen target.
      this.dpr = 1;
      this.canvas.width = size * this.dpr;
      this.canvas.height = size * this.dpr;
    }
    const ctx = this.canvas.getContext('2d')!;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(R, R);
    ctx.lineJoin = 'round';
    const lightDir = -Math.PI * 0.72;
    const gx = Math.cos(lightDir), gy = Math.sin(lightDir);
    const hasPath2D = typeof Path2D !== 'undefined';

    for (const c of this.cells) {
      if (!c.alive) continue;
      if (!c.path) {
        const path = new Path2D();
        path.moveTo(c.poly[0].x, c.poly[0].y);
        for (let k = 1; k < c.poly.length; k++) path.lineTo(c.poly[k].x, c.poly[k].y);
        path.closePath();
        c.path = path;
      }
      if (c.type === 'ore' && !c.speckPath && hasPath2D) {
        const spPath = new Path2D();
        for (const sp of c.specks) {
          const sr = sp.r * 0.75;
          spPath.moveTo(sp.x + sr, sp.y);
          spPath.arc(sp.x, sp.y, sr, 0, TAU);
        }
        c.speckPath = spPath;
      }
      const path = c.path;
      const lit = Math.cos(Math.atan2(c.center.y, c.center.x) - lightDir);
      const rf = Math.hypot(c.center.x, c.center.y) / REFERENCE_RADIUS;
      const L = c.light + lit * 11 * rf - (1 - c.hp / c.maxHp) * 9;
      const span = c.rMax - c.rMin + 26;
      const g = ctx.createLinearGradient(c.center.x + gx * span, c.center.y + gy * span, c.center.x - gx * span, c.center.y - gy * span);
      g.addColorStop(0, `hsl(${c.hue - 6},${c.sat + 4}%,${L + 15}%)`);
      g.addColorStop(0.32, `hsl(${c.hue},${c.sat}%,${L + 4}%)`);
      g.addColorStop(0.66, `hsl(${c.hue + 4},${c.sat + 2}%,${L - 5}%)`);
      g.addColorStop(1, `hsl(${c.hue + 10},${c.sat + 8}%,${Math.max(5, L - 17)}%)`);
      ctx.fillStyle = g;
      ctx.fill(path);

      ctx.save();
      ctx.clip(path);

      // Faceted crystalline planes (2 batched color passes instead of 4)
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = `hsl(${c.hue + 8},${c.sat + 4}%,${L - 13}%)`;
      ctx.beginPath();
      for (let f = 0; f < 4; f += 2) {
        const a = c.shardSeed + f * 1.7;
        ctx.moveTo(c.center.x + Math.cos(a) * 44, c.center.y + Math.sin(a) * 44);
        ctx.lineTo(c.center.x + Math.cos(a + 1) * 50, c.center.y + Math.sin(a + 1) * 50);
        ctx.lineTo(c.center.x + Math.cos(a + 2.3) * 28, c.center.y + Math.sin(a + 2.3) * 28);
        ctx.closePath();
      }
      ctx.fill();

      ctx.globalAlpha = 0.2;
      ctx.fillStyle = `hsl(${c.hue - 4},${c.sat}%,${L + 16}%)`;
      ctx.beginPath();
      for (let f = 1; f < 4; f += 2) {
        const a = c.shardSeed + f * 1.7;
        ctx.moveTo(c.center.x + Math.cos(a) * 44, c.center.y + Math.sin(a) * 44);
        ctx.lineTo(c.center.x + Math.cos(a + 1) * 50, c.center.y + Math.sin(a + 1) * 50);
        ctx.lineTo(c.center.x + Math.cos(a + 2.3) * 28, c.center.y + Math.sin(a + 2.3) * 28);
        ctx.closePath();
      }
      ctx.fill();

      // Batched stone grain (2 fillStyle switches instead of 22 hsla() strings per cell)
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = `hsla(${c.hue - 10},${c.sat + 10}%,${L + 30}%,0.5)`;
      for (const grain of c.grain) {
        if (grain.d > 0) ctx.fillRect(grain.x, grain.y, grain.r, grain.r);
      }
      ctx.fillStyle = `hsla(${c.hue + 14},${c.sat}%,${Math.max(4, L - 24)}%,0.55)`;
      for (const grain of c.grain) {
        if (grain.d <= 0) ctx.fillRect(grain.x, grain.y, grain.r, grain.r);
      }

      ctx.globalAlpha = 1;
      for (const pit of c.pits) {
        ctx.fillStyle = `rgba(0,0,0,${pit.a})`;
        ctx.beginPath();
        ctx.ellipse(pit.x, pit.y, pit.r, pit.r * 0.72, pit.r, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath();
      for (const pit of c.pits) {
        const hx = pit.x - pit.r * 0.25, hy = pit.y - pit.r * 0.35;
        ctx.moveTo(hx + pit.r * 0.55, hy);
        ctx.ellipse(hx, hy, pit.r * 0.55, pit.r * 0.4, 0, 0, TAU);
      }
      ctx.fill();

      if (c.moss.length) {
        ctx.fillStyle = 'rgba(120,165,180,0.16)';
        ctx.beginPath();
        for (const m of c.moss) {
          ctx.moveTo(m.x + m.r, m.y);
          ctx.arc(m.x, m.y, m.r, 0, TAU);
        }
        ctx.fill();
      }

      if (c.type === 'hard') {
        ctx.strokeStyle = 'rgba(165,190,225,0.35)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(c.poly[0].x, c.poly[0].y);
        ctx.lineTo(c.center.x, c.center.y);
        ctx.lineTo(c.poly[(c.poly.length / 2) | 0].x, c.poly[(c.poly.length / 2) | 0].y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(190,215,255,0.1)';
        ctx.fill(path);
      } else if (c.type === 'crystal') {
        ctx.fillStyle = 'rgba(190,140,255,0.18)';
        ctx.fill(path);
        ctx.strokeStyle = 'rgba(226,190,255,0.55)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let v = 0; v < 2; v++) {
          const a = c.shardSeed * 2 + v * 2;
          ctx.moveTo(c.center.x + Math.cos(a) * 26, c.center.y + Math.sin(a) * 26);
          ctx.quadraticCurveTo(c.center.x, c.center.y, c.center.x + Math.cos(a + 2.6) * 24, c.center.y + Math.sin(a + 2.6) * 24);
        }
        ctx.stroke();
      } else if (c.type === 'ore') {
        ctx.strokeStyle = 'rgba(190,225,245,0.3)';
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        c.specks.forEach((sp, k) => (k ? ctx.lineTo(sp.x, sp.y) : ctx.moveTo(sp.x, sp.y)));
        ctx.stroke();
        ctx.fillStyle = 'rgba(205,235,255,0.85)';
        ctx.beginPath();
        for (const sp of c.specks) {
          ctx.moveTo(sp.x + sp.r, sp.y);
          ctx.arc(sp.x, sp.y, sp.r, 0, TAU);
        }
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        for (const sp of c.specks) {
          const hx = sp.x - sp.r * 0.3, hy = sp.y - sp.r * 0.3, hr = sp.r * 0.35;
          ctx.moveTo(hx + hr, hy);
          ctx.arc(hx, hy, hr, 0, TAU);
        }
        ctx.fill();
      }

      // Dark beveled seams + bright lit edges (3 crisp passes instead of 5)
      ctx.save();
      ctx.translate(-gx * 2.8, -gy * 2.8);
      ctx.strokeStyle = 'rgba(0,0,0,0.52)';
      ctx.lineWidth = 8.5;
      ctx.stroke(path);
      ctx.restore();

      ctx.save();
      ctx.translate(gx * 2.8, gy * 2.8);
      ctx.strokeStyle = `hsla(${c.hue - 8},${c.sat + 16}%,${Math.min(95, L + 34)}%,0.74)`;
      ctx.lineWidth = 3.2;
      ctx.stroke(path);
      ctx.restore();

      ctx.restore();
      ctx.strokeStyle = 'rgba(6,11,18,0.82)';
      ctx.lineWidth = 1.7;
      ctx.stroke(path);
    }
    ctx.restore();
    if (!this.intactCanvas) {
      this.intactCanvas = document.createElement('canvas');
      this.intactCanvas.width = this.canvas.width;
      this.intactCanvas.height = this.canvas.height;
      this.intactCanvas.getContext('2d')!.drawImage(this.canvas, 0, 0);
    }
    this.dirty = false;
  }

  /** A whole textured cell, detached from the spinning rock after it breaks (with pre-baked drop rim, zero shadowBlur). */
  drawFallenCell(ctx: CanvasRenderingContext2D, id: number, radius: number) {
    const cell = this.cells[id];
    if (!cell || !this.intactCanvas) return;
    if (!cell.fallenSprite) {
      const pad = 8;
      const x0 = Math.floor(Math.min(...cell.poly.map(p => p.x)) - pad);
      const y0 = Math.floor(Math.min(...cell.poly.map(p => p.y)) - pad);
      const x1 = Math.ceil(Math.max(...cell.poly.map(p => p.x)) + pad);
      const y1 = Math.ceil(Math.max(...cell.poly.map(p => p.y)) + pad + 3);
      const image = document.createElement('canvas');
      image.width = x1 - x0;
      image.height = y1 - y0;
      const c = image.getContext('2d')!;
      c.translate(-x0, -y0);
      // Pre-baked crisp dark drop rim so runtime never needs expensive shadowBlur
      c.save();
      c.translate(0, 3);
      c.fillStyle = 'rgba(0,0,0,0.34)';
      c.fill(cell.path!);
      c.restore();
      c.clip(cell.path!);
      c.drawImage(this.intactCanvas, -IMAGE_RADIUS, -IMAGE_RADIUS);
      cell.fallenSprite = { image, x: x0 - cell.center.x, y: y0 - cell.center.y };
    }
    const { image, x, y } = cell.fallenSprite;
    const sc = radius / REFERENCE_RADIUS;
    ctx.drawImage(image, x * sc, y * sc, image.width * sc, image.height * sc);
  }

  /** Draws at the already-translated / already-rotated origin of Gun Hit's target. */
  draw(ctx: CanvasRenderingContext2D, radius: number, time: number) {
    if (this.dirty || !this.canvas) this.bake();
    const sc = radius / REFERENCE_RADIUS;
    ctx.save();
    ctx.scale(sc, sc);
    ctx.drawImage(this.canvas!, -IMAGE_RADIUS, -IMAGE_RADIUS, IMAGE_RADIUS * 2, IMAGE_RADIUS * 2);
    if (this.shimmer.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (const c of this.shimmer) {
        if (!c.alive) continue;
        const pulse = 0.5 + 0.5 * Math.sin(time * 3 + c.shardSeed);
        if (c.type === 'crystal') {
          ctx.globalAlpha = 0.1 + pulse * 0.14;
          ctx.fillStyle = '#c084fc';
          ctx.fill(c.path!);
        } else {
          ctx.globalAlpha = 0.25 + pulse * 0.45;
          ctx.fillStyle = '#e6f6ff';
          if (c.speckPath) {
            ctx.fill(c.speckPath);
          } else {
            ctx.beginPath();
            for (const sp of c.specks) {
              const sr = sp.r * 0.75;
              ctx.moveTo(sp.x + sr, sp.y);
              ctx.arc(sp.x, sp.y, sr, 0, TAU);
            }
            ctx.fill();
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }
    for (const c of this.flashing) {
      if (c.alive && c.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${c.flash * 0.55})`;
        ctx.fill(c.path!);
      }
    }
    ctx.restore();
  }
}

let cachedDiamondAura: HTMLCanvasElement | null = null;
function getDiamondAuraSprite(): HTMLCanvasElement | null {
  if (cachedDiamondAura) return cachedDiamondAura;
  const doc = (globalThis as { document?: Document }).document;
  if (!doc || typeof doc.createElement !== 'function') return null;
  const size = 256;
  const cv = doc.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d');
  if (!c) return null;
  const r = size * 0.5;
  const aura = c.createRadialGradient(r, r, 4, r, r, r);
  aura.addColorStop(0, 'rgba(174,247,255,0.78)');
  aura.addColorStop(0.55, 'rgba(94,224,255,0.28)');
  aura.addColorStop(1, 'rgba(56,189,248,0)');
  c.fillStyle = aura;
  c.beginPath();
  c.arc(r, r, r, 0, TAU);
  c.fill();
  cachedDiamondAura = cv;
  return cv;
}

/** The diamond sits *behind* the segmented rock, like in Diamond Breaker. */
export function drawRockDiamond(ctx: CanvasRenderingContext2D, radius: number, time: number, ping = 0) {
  const sc = radius / REFERENCE_RADIUS;
  const auraR = radius * 0.7;
  const sprite = getDiamondAuraSprite();
  if (sprite) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, 0.62 + ping * 0.38);
    ctx.drawImage(sprite, -auraR, -auraR, auraR * 2, auraR * 2);
    ctx.restore();
  } else {
    const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, auraR);
    aura.addColorStop(0, `rgba(174,247,255,${0.47 + ping * 0.3})`);
    aura.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = aura;
    ctx.beginPath(); ctx.arc(0, 0, auraR, 0, TAU); ctx.fill();
  }
  drawBreakerDiamond(ctx, 0, 0, time, sc * (1 + ping * 0.08));
}
