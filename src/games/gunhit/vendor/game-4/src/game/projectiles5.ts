import { type Ctx, TAU, drawSprite, glowSprite, makeBolt, pick, rand, randomPoly } from './core';
import { makeCracks, strokeLines } from './art';
import { ChompFX, ComicPop, GhostSpirit, SpiritAura, MoonSlash, RainbowBurst, RainbowRings, RuneCircle, SplatFlash, StormStrike, TractorPulse } from './fx5';
import { PAINT, RAINBOW, drawDiamond, drawElectricOrb, drawGhost, drawGoldStar, drawMoon, drawPaintBall, drawPencil, drawRainbowArc, drawRock, drawSandal, drawShark, drawSplat, drawUfo, makeRock, strokeBolt } from './shapes5';
import { GlowLines, GlowSpot, K, Light, Lightning, Rays, SplashSheet } from './particles';
import * as S from './spawn5';
import { sfx } from './audio';
import { Projectile, fallingCustom, makeItem } from './projectiles';
import type { Game } from './Game';

function loc(g: Game, theta: number, k = 0.94) {
  const R = g.wheel.R;
  return { x: Math.cos(theta) * R * k, y: Math.sin(theta) * R * k };
}
function woodCracks(g: Game, theta: number, n: number, len: [number, number], rgb: string, glowLife: number, spread = 1.3) {
  const cracks = makeCracks(theta, g.wheel.R, n, len, spread);
  g.paint((c) => {
    strokeLines(c, cracks, 'rgba(255,225,180,0.25)', 0.6, 0.5, 0.5);
    strokeLines(c, cracks, 'rgba(30,14,4,0.9)', 1.2);
  });
  g.addWheelFX(new GlowLines(cracks, rgb, 1.2, glowLife));
  return cracks;
}

// ───────────────────────── MOONBEAM: crescent ─────────────────────────
export class MoonShot extends Projectile {
  weapon = 'moonbeam' as const;
  tip = 17;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -980);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.stars(ps, this.x + rand(-8, 8), this.y + rand(8, 40), 1, pick(['230,225,255', '200,185,255', '255,255,255']), [10, 60], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.6) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-9, 9), y: this.y + rand(8, 36), vx: rand(-20, 20), vy: rand(10, 50), size: rand(1.4, 2.4), life: rand(0.5, 0.9), color: '210,200,255', g: -30 });
    if (Math.random() < 0.5) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-4, 4), y: this.y + rand(10, 30), vx: rand(-10, 10), vy: rand(20, 60), size: rand(16, 26), size2: 3, color: '170,150,255', life: rand(0.25, 0.4), alpha: 0.55 });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 130);
    gr.addColorStop(0, 'rgba(235,228,255,0.7)');
    gr.addColorStop(1, 'rgba(150,120,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 12, this.y + 8);
    ctx.lineTo(this.x + 12, this.y + 8);
    ctx.lineTo(this.x + 1.5, this.y + 130);
    ctx.lineTo(this.x - 1.5, this.y + 130);
    ctx.closePath();
    ctx.fill();
    drawSprite(ctx, glowSprite('170,150,255'), this.x, this.y + 6, 112, 0.5);
    drawSprite(ctx, glowSprite('240,235,255'), this.x, this.y + 4, 46, 0.65);
    ctx.restore();
    for (let i = 3; i >= 1; i--) {
      ctx.save();
      ctx.globalAlpha = 0.2 * ((4 - i) / 3);
      ctx.translate(this.x, this.y + 6 + i * 15);
      ctx.scale(1 - i * 0.1, 1 - i * 0.1);
      drawMoon(ctx, 17);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(this.x, this.y + 4);
    ctx.rotate(Math.sin(t * 8) * 0.08);
    drawMoon(ctx, 17);
    ctx.restore();
    for (let i = 0; i < 4; i++) {
      const a = t * 6 + (i * TAU) / 4;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawSprite(ctx, glowSprite('255,255,255'), this.x + Math.cos(a) * 20, this.y + 6 + Math.sin(a) * 9, 7, 0.85);
      ctx.restore();
    }
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(9, 'rgba(235,228,255,');
    g.hitStop(0.06);
    g.shake(7);
    g.addFX(new Light(hx, hy, 240, '190,170,255', 0.85, 0.4));
    g.addFX(new MoonSlash(hx, hy + 4, 0.5, 1));
    g.addFX(new RuneCircle(hx, hy + 8, '200,190,255', '255,250,255', 0.6, 1, 0.5, 1));
    g.addFX(new Rays(hx, hy, '215,205,255', 0.5, 14, Math.PI / 2, Math.PI * 0.8, 1));
    S.glow(ps, hx, hy, 160, 22, '240,235,255', 0.26, 1);
    S.ring(ps, hx, hy, 5, 110, '200,185,255', 5, 0.42, true);
    S.ring(ps, hx, hy, 4, 70, '255,255,255', 3, 0.28, true);
    S.stars(ps, hx, hy, 16, '235,228,255', [80, 300], [9, 17], Math.PI / 2, 1.6);
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.6, [200, 640], '210,200,255', 1.6);
    S.moonDust(ps, hx, hy, 22, Math.PI / 2, 1.8, [30, 160]);
    S.smoke(ps, hx, hy, 6, '200,190,240', [14, 56], { vx: [-90, 90], vy: [-20, 60], alpha: 0.3, life: [0.7, 1.2] });
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380]);
    const p = loc(g, theta, 0.93);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 17);
      rg.addColorStop(0, 'rgba(36,24,66,0.75)');
      rg.addColorStop(0.7, 'rgba(70,50,110,0.35)');
      rg.addColorStop(1, 'rgba(70,50,110,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 17, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(215,205,255,0.55)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(p.x, p.y, 10.5, 0, TAU);
      c.stroke();
      for (const [dx, dy, r] of [
        [-6, 4, 2.6],
        [5, -5, 2],
        [7, 6, 1.6],
      ]) {
        c.fillStyle = 'rgba(24,16,48,0.7)';
        c.beginPath();
        c.arc(p.x + dx, p.y + dy, r, 0, TAU);
        c.fill();
        c.strokeStyle = 'rgba(215,205,255,0.5)';
        c.lineWidth = 0.7;
        c.stroke();
      }
    });
    woodCracks(g, theta, 5, [14, 34], '200,185,255', 1.3);
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '190,170,255', 1.6, 0.8));
    g.landed(makeItem('moonbeam', theta, 0.095, 22, false), 0.4);
    sfx.play('moon_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 210, '190,170,255', 0.8, 0.35));
    g.addFX(new MoonSlash(hx, hy + 4, 0.4, 0.8));
    S.stars(ps, hx, hy, 12, '235,228,255', [80, 260], [8, 14], Math.PI / 2, 1.6);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.5, [180, 560], '210,200,255', 1.5);
    S.ring(ps, hx, hy, 4, 80, '200,185,255', 4, 0.34, true);
    fallingCustom(g, hx, hy, (c) => drawMoon(c, 17));
    sfx.play('moon_hit');
    this.alive = false;
  }
}

// ───────────────────────── STORM CALLER: ball lightning + sky strike ─────────────────────────
export class StormShot extends Projectile {
  weapon = 'storm' as const;
  tip = 10;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1150);
  }
  trail() {
    const g = this.g;
    const ps = g.particles;
    S.sparks(ps, this.x, this.y + 6, 1, Math.PI / 2, 1.2, [60, 220], '170,220,255', 1.3, 0, 0.03);
    if (Math.random() < 0.3) g.addFX(new Lightning(this.x + rand(-6, 6), this.y + 4, this.x + rand(-26, 26), this.y + rand(30, 70), 0.09, '150,210,255', 1.1, 1, 0.03));
    if (Math.random() < 0.5) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-4, 4), y: this.y + rand(6, 24), vx: rand(-14, 14), vy: rand(20, 60), size: rand(16, 26), size2: 3, color: '80,170,255', life: rand(0.2, 0.35), alpha: 0.6 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    strokeBolt(ctx, makeBolt(this.x, this.y + 8, this.x + rand(-5, 5), this.y + 100, 0.3, 4), 1.6);
    ctx.restore();
    drawElectricOrb(ctx, this.x, this.y, 10, this.age * 4, 1.15, 3);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    const item = makeItem('storm', theta, 0.1, 16, true);
    g.landed(item, 0.7);
    item.world.x = hx;
    item.world.y = hy;
    g.wheelImpact(4, 'rgba(190,230,255,');
    g.shake(3);
    S.glow(ps, hx, hy, 90, 14, '200,235,255', 0.14, 1);
    S.sparks(ps, hx, hy, 14, Math.PI / 2, 1.5, [150, 450], '170,220,255', 1.4);
    sfx.play('storm_charge');
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    g.after(0.1, () => {
      const px = item.world.x;
      const py = item.world.y;
      g.addFX(new StormStrike(px, -30, py));
      g.flashScreen('200,230,255', 0.5);
      g.hitStop(0.1);
      g.shake(15);
      g.wheelImpact(13, 'rgba(210,240,255,');
      g.addFX(new Light(px, py, 330, '140,200,255', 1, 0.5));
      S.glow(ps, px, py, 220, 30, '220,240,255', 0.3, 1);
      S.ring(ps, px, py, 6, 170, '150,210,255', 8, 0.5, true);
      S.ring(ps, px, py, 4, 110, '255,255,255', 4, 0.3, true);
      S.ring(ps, px, py, 3, 60, '90,160,255', 5, 0.24, true);
      S.sparks(ps, px, py, 44, Math.PI / 2, 1.7, [220, 720], '170,220,255', 1.8);
      S.sparks(ps, px, py, 14, Math.PI / 2, 1.5, [300, 700], '255,255,255', 1.2);
      S.chips(ps, px, py, 14, Math.PI / 2, 1.5, [140, 460]);
      S.splinters(ps, px, py, 10, Math.PI / 2, 1.5, [200, 540]);
      S.smoke(ps, px, py, 8, '70,70,86', [14, 56], { vx: [-90, 90], vy: [-60, 50], alpha: 0.45, life: [0.8, 1.3], drag: 2.4 });
      S.stars(ps, px, py, 10, '200,235,255', [80, 280], [9, 16], Math.PI / 2, 1.6);
      for (let i = 0; i < 7; i++) {
        const a2 = theta + Math.PI + rand(-1.15, 1.15);
        const d = rand(40, 100);
        g.addWheelFX(new Lightning(lx * 0.98, ly * 0.98, lx + Math.cos(a2) * d, ly + Math.sin(a2) * d, rand(0.3, 0.55), '150,210,255', 1.5, 2, 0.04));
      }
      const fern: number[][] = [];
      for (let i = 0; i < 7; i++) {
        const a = theta + Math.PI + rand(-1.3, 1.3);
        const L = rand(18, 40);
        fern.push(makeBolt(lx * 0.95, ly * 0.95, lx * 0.95 + Math.cos(a) * L, ly * 0.95 + Math.sin(a) * L, 0.35, 4));
      }
      g.paint((c) => {
        const rg = c.createRadialGradient(lx * 0.95, ly * 0.95, 0, lx * 0.95, ly * 0.95, 20);
        rg.addColorStop(0, 'rgba(10,8,8,0.92)');
        rg.addColorStop(0.5, 'rgba(30,24,22,0.55)');
        rg.addColorStop(1, 'rgba(40,30,24,0)');
        c.fillStyle = rg;
        c.beginPath();
        c.arc(lx * 0.95, ly * 0.95, 20, 0, TAU);
        c.fill();
        strokeLines(c, fern, 'rgba(14,10,8,0.9)', 1.5);
        strokeLines(c, fern, 'rgba(150,210,255,0.45)', 0.5);
      });
      g.addWheelFX(new GlowSpot(lx * 0.95, ly * 0.95, 80, '120,190,255', 1.8, 0.9));
      sfx.play('storm_strike');
    });
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new StormStrike(hx, -30, hy, 0.35));
    g.flashScreen('200,230,255', 0.3);
    g.addFX(new Light(hx, hy, 260, '140,200,255', 0.9, 0.4));
    S.ring(ps, hx, hy, 5, 120, '150,210,255', 6, 0.4, true);
    S.sparks(ps, hx, hy, 34, Math.PI / 2, 1.6, [200, 640], '170,220,255', 1.6);
    sfx.play('storm_strike');
    this.alive = false;
  }
}

// ───────────────────────── PENCIL ─────────────────────────
export class PencilShot extends Projectile {
  weapon = 'pencil' as const;
  tip = 0;
  half = 0.06;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1300);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.6) ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + rand(40, 70), vx: rand(-14, 14), vy: rand(10, 40), size: 5, size2: 16, life: 0.45, color: '120,120,132', alpha: 0.28, rot: rand(0, TAU) });
    if (Math.random() < 0.3) S.chips(ps, this.x, this.y + 40, 1, Math.PI / 2, 1.2, [30, 110], ['255,150,172', '240,120,150']);
  }
  draw(ctx: Ctx) {
    const x = this.x;
    const y = this.y;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const gr = ctx.createLinearGradient(0, y + 46, 0, y + 230);
    gr.addColorStop(0, 'rgba(60,60,72,0.9)');
    gr.addColorStop(1, 'rgba(60,60,72,0)');
    ctx.strokeStyle = gr;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    for (let i = 0; i <= 70; i++) {
      const u = i / 70;
      const ph = u * 46 - this.age * 30;
      const px = x + Math.sin(ph) * (7 + u * 7);
      const py = y + 46 + u * 180 + Math.cos(ph) * 5;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(this.age * 20) * 0.04);
    drawPencil(ctx, 50, 11);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(7, 'rgba(255,240,200,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new ComicPop(hx, hy + 38, 'TAK!', '#fff3a0', '#ffc22a', '#5a3600', 0.8, 0.45));
    g.addFX(new Light(hx, hy, 160, '255,225,150', 0.5, 0.25));
    S.chips(ps, hx, hy, 14, Math.PI / 2, 1.5, [140, 440]);
    S.splinters(ps, hx, hy, 14, Math.PI / 2, 1.4, [180, 520]);
    S.shavings(ps, hx, hy, 9, Math.PI / 2, 1.6, [80, 320]);
    S.scribbles(ps, hx, hy, 9, Math.PI / 2, 1.6, [100, 380]);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [100, 340], ['255,150,172', '240,120,150', '255,190,205']);
    S.chips(ps, hx, hy, 6, Math.PI / 2, 1.4, [120, 360], ['255,210,40', '240,190,20']);
    S.smoke(ps, hx, hy, 6, '150,150,162', [10, 40], { vx: [-80, 80], vy: [-20, 60], alpha: 0.35, life: [0.6, 1] });
    S.sparks(ps, hx, hy, 8, Math.PI / 2, 1.4, [150, 400], '230,230,240', 1.1);
    S.ring(ps, hx, hy, 4, 54, '200,200,210', 3, 0.28, true);
    const p = loc(g, theta, 0.9);
    const scr: number[][] = [];
    for (let k = 0; k < 4; k++) {
      const a = theta + Math.PI + rand(-1.2, 1.2);
      const ln: number[] = [];
      const bx = p.x + Math.cos(theta + Math.PI / 2) * rand(-10, 10);
      const by = p.y + Math.sin(theta + Math.PI / 2) * rand(-10, 10);
      for (let j = 0; j < 14; j++) ln.push(bx + Math.cos(a) * j * 1.6 + Math.sin(j * 1.9) * 3.2, by + Math.sin(a) * j * 1.6 + Math.cos(j * 1.9) * 3.2);
      scr.push(ln);
    }
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 13);
      rg.addColorStop(0, 'rgba(40,40,52,0.55)');
      rg.addColorStop(1, 'rgba(40,40,52,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 13, 0, TAU);
      c.fill();
      strokeLines(c, scr, 'rgba(50,50,62,0.8)', 1.1);
    });
    woodCracks(g, theta, 4, [10, 26], '255,220,150', 0.8);
    g.landed(makeItem('pencil', theta, 0.06, 40, false, { wob: 0.2 }), 0.25);
    sfx.play('pencil_hit');
    void R;
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new ComicPop(hx, hy + 30, 'TING!', '#e8f0ff', '#8aa6d8', '#1a2a50', 0.7, 0.4));
    S.scribbles(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 360]);
    S.sparks(ps, hx, hy, 20, Math.PI / 2, 1.4, [200, 560], '255,235,190', 1.4);
    S.shavings(ps, hx, hy, 6, Math.PI / 2, 1.5, [80, 280]);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 22);
      drawPencil(c, 50, 11);
    });
    sfx.play('ricochet');
    this.alive = false;
  }
}

// ───────────────────────── SANDAL ─────────────────────────
export class SandalShot extends Projectile {
  weapon = 'sandal' as const;
  tip = 26;
  half = 0.11;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -900);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.6) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(16, 40), vx: rand(-20, 20), vy: rand(10, 50), size: 8, size2: 26, life: 0.5, color: '215,195,165', alpha: 0.35, rot: rand(0, TAU) });
    if (Math.random() < 0.35) ps.add({ k: K.STAR, add: true, x: this.x + rand(-12, 12), y: this.y + rand(0, 30), vx: rand(-25, 25), vy: rand(0, 50), size: rand(6, 10), life: 0.35, color: '255,235,140', drag: 2 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    for (const k of [-1, 0, 1]) {
      ctx.beginPath();
      ctx.moveTo(this.x + k * 14, this.y + 24 + Math.abs(k) * 6);
      ctx.lineTo(this.x + k * 12, this.y + 70 + Math.abs(k) * 6);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(0.4 + 0.6 * Math.abs(Math.cos(this.age * 11)), 1);
    ctx.rotate(Math.sin(this.age * 7) * 0.25);
    drawSandal(ctx, 1);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(11, 'rgba(255,240,200,');
    g.hitStop(0.07);
    g.shake(9);
    g.addFX(new ComicPop(hx, hy + 40, 'PLAK!', '#ffe27a', '#ff5a2a', '#6a1200', 1, 0.6));
    g.addFX(new Light(hx, hy, 200, '255,225,150', 0.6, 0.3));
    S.ring(ps, hx, hy, 5, 90, '225,205,170', 6, 0.4, false, 0.8);
    S.ring(ps, hx, hy, 4, 60, '255,255,255', 3, 0.26, true);
    S.smoke(ps, hx, hy, 12, '215,195,165', [14, 60], { vx: [-130, 130], vy: [-10, 80], alpha: 0.5, life: [0.7, 1.2], drag: 2.4 });
    S.orbitStars(ps, hx, hy + 44, 5, 1.1);
    S.stars(ps, hx, hy, 10, '255,230,120', [80, 260], [8, 14], Math.PI / 2, 1.6);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380]);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.5, [180, 480], '255,235,170', 1.3);
    const p = loc(g, theta, 0.92);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta);
      c.fillStyle = 'rgba(210,60,50,0.28)';
      c.beginPath();
      c.ellipse(0, 0, 16, 11, 0, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(160,30,24,0.5)';
      c.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU;
        c.beginPath();
        c.moveTo(Math.cos(a) * 18, Math.sin(a) * 13);
        c.lineTo(Math.cos(a) * 25, Math.sin(a) * 19);
        c.stroke();
      }
      c.restore();
    });
    woodCracks(g, theta, 4, [10, 24], '255,200,120', 0.7);
    g.landed(makeItem('sandal', theta, 0.1, 32, true, { wob: 0.4 }), 0.3);
    sfx.play('sandal_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new ComicPop(hx, hy + 34, 'DUK!', '#ffe27a', '#ff7a2a', '#6a1200', 0.8, 0.45));
    S.smoke(ps, hx, hy, 8, '215,195,165', [12, 50], { vx: [-110, 110], vy: [0, 70], alpha: 0.45 });
    S.stars(ps, hx, hy, 8, '255,230,120', [80, 240], [8, 14], Math.PI / 2, 1.6);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 8);
      drawSandal(c, 1);
    });
    sfx.play('sandal_hit');
    this.alive = false;
  }
}

// ───────────────────────── PAINTBALL ─────────────────────────
export class PaintShot extends Projectile {
  weapon = 'paintball' as const;
  tip = 7;
  half = 0.075;
  ci: number;
  seed = Math.floor(rand(1, 900));
  constructor(g: Game, x: number, y: number, ci: number) {
    super(g, x, y, -1250);
    this.ci = ci % PAINT.length;
  }
  trail() {
    const ps = this.g.particles;
    const col = PAINT[this.ci];
    if (Math.random() < 0.6) S.paintDrops(ps, this.x + rand(-3, 3), this.y + rand(8, 30), 1, Math.PI / 2, 1.3, [20, 100], [1, 2.2], col);
    if (Math.random() < 0.4) ps.add({ k: K.SMOKE, x: this.x + rand(-3, 3), y: this.y + rand(10, 26), vx: rand(-12, 12), vy: rand(10, 36), size: 6, size2: 18, life: 0.4, color: col.rgb, alpha: 0.25, rot: rand(0, TAU) });
  }
  draw(ctx: Ctx) {
    const col = PAINT[this.ci];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x - 4.2, this.y + 5);
    ctx.quadraticCurveTo(this.x - 1.2 + Math.sin(this.age * 30) * 1.4, this.y + 36, this.x, this.y + 76);
    ctx.quadraticCurveTo(this.x + 1.2 + Math.sin(this.age * 30 + 1) * 1.4, this.y + 36, this.x + 4.2, this.y + 5);
    ctx.closePath();
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 76);
    gr.addColorStop(0, `rgba(${col.rgb},0.95)`);
    gr.addColorStop(1, `rgba(${col.rgb},0)`);
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    drawPaintBall(ctx, 7, col);
    ctx.restore();
  }
  private splat(hx: number, hy: number, n: number) {
    const g = this.g;
    const ps = g.particles;
    const col = PAINT[this.ci];
    g.addFX(new SplatFlash(hx, hy + 8, col, 0.5, 26, this.seed));
    S.paintDrops(ps, hx - 3, hy, n, Math.PI - 0.3, 0.5, [200, 480], [1.6, 3.6], col);
    S.paintDrops(ps, hx + 3, hy, n, 0.3, 0.5, [200, 480], [1.6, 3.6], col);
    S.paintDrops(ps, hx, hy, n + 6, Math.PI / 2, 1.5, [100, 420], [1.2, 3.2], col);
    S.paintDrops(ps, hx, hy, n, Math.PI / 2, 1.5, [220, 560], [0.7, 1.4], col);
    S.smoke(ps, hx, hy, 5, col.rgb, [10, 44], { vx: [-90, 90], vy: [-20, 60], alpha: 0.28, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 58, col.hi, 3, 0.28, true);
    ps.add({ k: K.TEXT, x: hx, y: hy + 44, vy: -40, drag: 1.5, size: 26, text: 'SPLAT!', color: col.hi, life: 0.8 });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const col = PAINT[this.ci];
    g.wheelImpact(6, `rgba(${col.hi},`);
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new Light(hx, hy, 170, col.rgb, 0.5, 0.26));
    this.splat(hx, hy, 12);
    const p = loc(g, theta, 0.9);
    const seed = this.seed;
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta);
      drawSplat(c, 15, col, seed, 0.97);
      c.restore();
    });
    g.addDecal({
      kind: 'goo',
      angle: theta,
      t: 0,
      seed: rand(0, 10),
      blob: randomPoly(10, 1, 0.4),
      next: 0.15,
      c: [`rgba(${col.lo},0.95)`, `rgba(${col.rgb},0.97)`, `rgba(${col.hi},0.95)`],
      drip: col.rgb,
      dripData: col.lo,
    });
    g.landed(makeItem('paintball', theta, 0.075, 9, false, { shape: [this.ci] }), 0.2);
    sfx.play('paint_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    this.splat(hx, hy, 10);
    sfx.play('paint_hit');
    this.alive = false;
  }
}

// ───────────────────────── MAGIC WAND: star ─────────────────────────
export class WandShot extends Projectile {
  weapon = 'wand' as const;
  tip = 12;
  half = 0.09;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.85) S.stars(ps, this.x + rand(-9, 9), this.y + rand(6, 46), 1, pick(['255,170,235', '200,150,255', '255,230,130', '170,235,255']), [10, 70], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.6) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-9, 9), y: this.y + rand(6, 40), vx: rand(-24, 24), vy: rand(10, 60), size: rand(1.4, 2.4), life: rand(0.4, 0.8), color: pick(['255,200,240', '255,235,150']), g: -20 });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,150,230'), this.x, this.y + 4, 90, 0.55);
    for (let k = 0; k < 3; k++) {
      for (let j = 0; j < 10; j++) {
        const u = j / 9;
        const ang = t * 12 + (k * TAU) / 3 + u * 5;
        const rr = 4 + u * 12;
        const px = this.x + Math.sin(ang) * rr * (0.4 + u * 0.6);
        const py = this.y + 10 + u * 84;
        drawSprite(ctx, glowSprite(k === 1 ? '200,150,255' : k === 2 ? '255,230,130' : '255,170,235'), px, py, 9 * (1 - u) + 2, 0.9 * (1 - u));
      }
    }
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 2);
    ctx.rotate(t * 5);
    drawGoldStar(ctx, 12, -Math.PI / 2, true);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(7, 'rgba(255,215,245,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new Light(hx, hy, 220, '255,170,235', 0.75, 0.36));
    g.addFX(new RuneCircle(hx, hy + 8, '255,150,230', '255,235,150', 0.6, 1.05, 0.5, 1));
    g.addFX(new Rays(hx, hy, '255,200,240', 0.5, 14, Math.PI / 2, Math.PI * 0.85, 1));
    S.glow(ps, hx, hy, 150, 20, '255,235,252', 0.24, 1);
    S.ring(ps, hx, hy, 5, 100, '255,150,230', 4, 0.4, true);
    S.ring(ps, hx, hy, 4, 66, '255,235,150', 3, 0.3, true);
    S.ring(ps, hx, hy, 3, 40, '255,255,255', 2.5, 0.24, true);
    S.stars(ps, hx, hy, 14, '255,170,235', [80, 300], [9, 17], Math.PI / 2, 1.7);
    S.stars(ps, hx, hy, 10, '255,230,130', [80, 280], [8, 15], Math.PI / 2, 1.7);
    S.stars(ps, hx, hy, 8, '170,235,255', [60, 240], [8, 13], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [200, 620], '255,200,240', 1.5, 500);
    S.sparks(ps, hx, hy, 14, Math.PI / 2, 1.6, [200, 560], '255,235,150', 1.3, 500);
    S.moonDust(ps, hx, hy, 14, Math.PI / 2, 1.8, [30, 150]);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 340]);
    const p = loc(g, theta, 0.9);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta + Math.PI / 2);
      const sg = c.createRadialGradient(0, 0, 1, 0, 0, 22);
      sg.addColorStop(0, 'rgba(255,200,240,0.5)');
      sg.addColorStop(1, 'rgba(255,200,240,0)');
      c.fillStyle = sg;
      c.beginPath();
      c.arc(0, 0, 22, 0, TAU);
      c.fill();
      c.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * TAU) / 5;
        if (i === 0) c.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
        else c.lineTo(Math.cos(a) * 14, Math.sin(a) * 14);
      }
      c.closePath();
      c.strokeStyle = 'rgba(255,235,150,0.9)';
      c.lineWidth = 1.3;
      c.stroke();
      c.strokeStyle = 'rgba(255,150,230,0.7)';
      c.lineWidth = 0.7;
      c.beginPath();
      c.arc(0, 0, 14, 0, TAU);
      c.stroke();
      c.restore();
    });
    woodCracks(g, theta, 4, [12, 28], '255,170,235', 1.2);
    g.addWheelFX(new GlowSpot(p.x, p.y, 64, '255,170,235', 1.4, 0.8));
    g.landed(makeItem('wand', theta, 0.09, 28, true), 0.35);
    sfx.play('wand_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 200, '255,170,235', 0.75, 0.32));
    S.stars(ps, hx, hy, 18, '255,200,240', [80, 280], [8, 15], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.5, [180, 580], '255,215,245', 1.5);
    S.ring(ps, hx, hy, 4, 80, '255,150,230', 4, 0.34, true);
    fallingCustom(g, hx, hy, (c) => drawGoldStar(c, 12, -Math.PI / 2, true));
    sfx.play('wand_hit');
    this.alive = false;
  }
}

// ───────────────────────── SHARK ─────────────────────────
export class SharkShot extends Projectile {
  weapon = 'shark' as const;
  tip = 34;
  half = 0.115;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -880);
  }
  trail() {
    const ps = this.g.particles;
    S.droplets(ps, this.x + rand(-8, 8), this.y + rand(20, 50), 1, Math.PI / 2, 1.3, [40, 160], [1.2, 2.6], '170,225,255', 600);
    if (Math.random() < 0.6) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(30, 60), vx: rand(-20, 20), vy: rand(10, 50), size: 8, size2: 26, life: 0.5, color: '230,244,255', alpha: 0.4, rot: rand(0, TAU) });
    if (Math.random() < 0.12) S.miniBubble(ps, this.x + rand(-10, 10), this.y + 40, rand(-20, 20), rand(10, 40), rand(2.4, 4.5), rand(0.4, 0.7));
  }
  draw(ctx: Ctx) {
    ctx.save();
    const gr = ctx.createLinearGradient(0, this.y + 34, 0, this.y + 150);
    gr.addColorStop(0, 'rgba(235,247,255,0.7)');
    gr.addColorStop(1, 'rgba(160,210,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 14, this.y + 36);
    ctx.quadraticCurveTo(this.x - 20 + Math.sin(this.age * 14) * 5, this.y + 90, this.x, this.y + 150);
    ctx.quadraticCurveTo(this.x + 20 + Math.sin(this.age * 14) * 5, this.y + 90, this.x + 14, this.y + 36);
    ctx.closePath();
    ctx.fill();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.age * 14) * 0.08);
    drawShark(ctx, 1, this.age, 0.75);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(11, 'rgba(190,230,255,');
    g.hitStop(0.07);
    g.shake(9);
    g.addFX(new ChompFX(hx, hy + 2));
    g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 62, 0.28));
    g.addFX(new Light(hx, hy, 200, '150,215,255', 0.6, 0.3));
    S.droplets(ps, hx - 3, hy, 16, Math.PI - 0.3, 0.45, [200, 500], [1.4, 3.6]);
    S.droplets(ps, hx + 3, hy, 16, 0.3, 0.45, [200, 500], [1.4, 3.6]);
    S.droplets(ps, hx, hy, 18, Math.PI / 2, 1.5, [120, 440], [1.2, 3.2]);
    S.smoke(ps, hx, hy, 8, '230,244,255', [12, 54], { vx: [-100, 100], vy: [-10, 60], alpha: 0.36, life: [0.6, 1] });
    S.ring(ps, hx, hy, 4, 66, '200,235,255', 3.5, 0.34, false, 0.85);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 360]);
    S.splinters(ps, hx, hy, 8, Math.PI / 2, 1.4, [160, 440]);
    ps.add({ k: K.TEXT, x: hx, y: hy + 62, vy: -40, drag: 1.5, size: 26, text: 'CHOMP!', color: '255,255,255', life: 0.8 });
    const p = loc(g, theta, 0.94);
    const tx = -Math.sin(theta);
    const ty = Math.cos(theta);
    g.paint((c) => {
      for (const [depth, sz, ln] of [
        [5, 3.4, 20],
        [11, 2.6, 15],
      ] as [number, number, number][]) {
        const bx = p.x - Math.cos(theta) * depth;
        const by = p.y - Math.sin(theta) * depth;
        for (let i = -4; i <= 4; i++) {
          const s = (i * ln) / 4;
          const px = bx + tx * s;
          const py = by + ty * s;
          c.fillStyle = 'rgba(22,10,6,0.88)';
          c.beginPath();
          c.moveTo(px + tx * sz, py + ty * sz);
          c.lineTo(px - tx * sz, py - ty * sz);
          c.lineTo(px - Math.cos(theta) * sz * 2.2, py - Math.sin(theta) * sz * 2.2);
          c.closePath();
          c.fill();
        }
      }
      c.strokeStyle = 'rgba(255,225,190,0.35)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(p.x - Math.cos(theta) * 3 + tx * -22, p.y - Math.sin(theta) * 3 + ty * -22);
      c.lineTo(p.x - Math.cos(theta) * 3 + tx * 22, p.y - Math.sin(theta) * 3 + ty * 22);
      c.stroke();
    });
    g.addDecal({ kind: 'wet', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(10, 1, 0.45), next: 0.1 });
    g.landed(makeItem('shark', theta, 0.115, 44, false), 0.35);
    sfx.play('shark_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new ChompFX(hx, hy + 2, 0.45));
    g.addFX(new SplashSheet(hx, hy, Math.PI / 2, 50, 0.24));
    S.droplets(ps, hx, hy, 28, Math.PI / 2, 1.3, [180, 520], [1.2, 3.4]);
    S.smoke(ps, hx, hy, 6, '230,244,255', [10, 44], { vx: [-90, 90], vy: [0, 60], alpha: 0.35 });
    sfx.play('shark_hit');
    this.alive = false;
  }
}

// ───────────────────────── GHOST ─────────────────────────
export class GhostShot extends Projectile {
  weapon = 'ghost' as const;
  tip = 26;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -820);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    // Keep a gentle mist and a few spirits at the same density on 60/120 Hz
    // displays; the old per-frame emitter doubled the clutter at high refresh.
    const ticks = this.cosmeticTicks(dt);
    for (let i = 0; i < ticks; i++) {
      if (Math.random() < 0.24) S.ghostWisps(ps, this.x + rand(-10, 10), this.y + rand(20, 50), 1, Math.PI / 2, 1.2, [20, 90]);
      if (Math.random() < 0.55) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-8, 8), y: this.y + rand(14, 40), vx: rand(-14, 14), vy: rand(20, 60), size: rand(16, 28), size2: 3, color: '100,255,238', life: rand(0.25, 0.4), alpha: 0.55 });
      if (Math.random() < 0.3) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(24, 50), vx: rand(-14, 14), vy: rand(10, 40), size: 8, size2: 24, life: 0.5, color: '190,250,244', alpha: 0.25, rot: rand(0, TAU) });
    }
  }
  draw(ctx: Ctx) {
    // A short cloud of mist follows the ghost, with no long pointed tail.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const dx = Math.sin(this.age * 5 + i * 1.8) * (3 + i * 2);
      drawSprite(ctx, glowSprite('140,255,245'), this.x + dx, this.y + 24 + i * 16,
        32 - i * 5, 0.24 - i * 0.055);
    }
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 6 + Math.sin(this.age * 9) * 2);
    ctx.rotate(Math.sin(this.age * 6) * 0.12);
    drawGhost(ctx, 1.1, this.age, 0.94, 0.5);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(7, 'rgba(190,255,248,');
    g.hitStop(0.05);
    g.shake(6);
    g.flashScreen('120,255,240', 0.12);
    g.addFX(new GhostSpirit(hx, hy + 6));
    g.addFX(new SpiritAura(hx, hy));
    g.addFX(new Light(hx, hy, 230, '100,255,238', 0.8, 0.45));
    S.glow(ps, hx, hy, 150, 20, '200,255,250', 0.26, 1);
    S.ghostWisps(ps, hx, hy, 10, Math.PI / 2, 1.8, [60, 280]);
    S.smoke(ps, hx, hy, 10, '190,250,244', [16, 64], { vx: [-90, 90], vy: [-60, 40], alpha: 0.35, life: [0.9, 1.5], drag: 2 });
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    ps.add({ k: K.TEXT, x: hx, y: hy + 56, vy: -50, drag: 1.5, size: 26, text: 'BUUU!', color: '190,255,248', life: 0.85 });
    const p = loc(g, theta, 0.92);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22);
      rg.addColorStop(0, 'rgba(10,40,48,0.75)');
      rg.addColorStop(0.6, 'rgba(60,200,200,0.3)');
      rg.addColorStop(1, 'rgba(100,255,238,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 22, 0, TAU);
      c.fill();
      // Soft concentric spectral rings, rather than little curved tails.
      c.strokeStyle = 'rgba(150,255,246,0.42)';
      c.lineWidth = 1;
      for (const radius of [8, 14, 20]) {
        c.beginPath(); c.ellipse(p.x, p.y, radius, radius * 0.65, 0, 0, TAU); c.stroke();
      }
    });
    woodCracks(g, theta, 5, [14, 32], '110,255,240', 1.6);
    g.addWheelFX(new GlowSpot(p.x, p.y, 76, '100,255,238', 1.8, 0.8));
    g.landed(makeItem('ghost', theta, 0.1, 30, true), 0.4);
    sfx.play('ghost_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new GhostSpirit(hx, hy, 0.6));
    g.addFX(new SpiritAura(hx, hy, 0.7));
    g.addFX(new Light(hx, hy, 210, '100,255,238', 0.75, 0.35));
    S.ghostWisps(ps, hx, hy, 8, Math.PI / 2, 1.8, [60, 260]);
    sfx.play('ghost_hit');
    this.alive = false;
  }
}

// ───────────────────────── UFO ─────────────────────────
export class UfoShot extends Projectile {
  weapon = 'ufo' as const;
  tip = 15;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -780);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.6) ps.add({ k: K.STAR, add: true, x: this.x + rand(-14, 14), y: this.y + rand(14, 60), vx: rand(-20, 20), vy: rand(10, 60), size: rand(6, 11), life: rand(0.3, 0.55), color: pick(['150,255,180', '220,255,230']), drag: 2 });
    if (Math.random() < 0.5) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-12, 12), y: this.y + rand(12, 50), vx: rand(-20, 20), vy: rand(10, 60), size: 1.6, life: 0.5, color: '120,255,160' });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y + 6, 0, this.y + 100);
    gr.addColorStop(0, 'rgba(130,255,170,0.4)');
    gr.addColorStop(1, 'rgba(130,255,170,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 7, this.y + 8);
    ctx.lineTo(this.x - 26, this.y + 100);
    ctx.lineTo(this.x + 26, this.y + 100);
    ctx.lineTo(this.x + 7, this.y + 8);
    ctx.closePath();
    ctx.fill();
    for (let k = 0; k < 3; k++) {
      const ph = (this.age * 3 + k / 3) % 1;
      ctx.strokeStyle = `rgba(190,255,210,${0.7 * (1 - ph)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 10 + ph * 80, 8 + ph * 18, 2 + ph * 5, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 2);
    ctx.rotate(Math.sin(this.age * 7) * 0.1);
    drawUfo(ctx, 1.15, this.age);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(7, 'rgba(190,255,205,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new TractorPulse(hx, hy + 20, 0.9, 120));
    g.addFX(new Light(hx, hy, 220, '90,255,140', 0.75, 0.4));
    const tgt = { x: hx, y: hy + 18 };
    for (let i = 0; i < 26; i++) {
      const a = Math.PI + rand(-1.1, 1.1);
      const d = rand(20, 70);
      if (i % 2) ps.add({ k: K.CHIP, x: hx + Math.cos(a - Math.PI) * d * 0.6, y: hy - rand(6, 70), target: tgt, pull: 1800, rot: rand(0, TAU), vrot: rand(-18, 18), poly: randomPoly(4, rand(1.4, 3), 0.5), color: pick(['196,140,80', '222,178,118', '170,112,58']), life: 0.7 });
      else ps.add({ k: K.SPARK, add: true, x: hx + rand(-40, 40), y: hy - rand(0, 80), target: tgt, pull: 2200, size: rand(1, 2.2), len: 0.025, life: 0.7, color: pick(['120,255,160', '200,255,220', '90,255,140']) });
    }
    S.glow(ps, hx, hy, 130, 18, '190,255,210', 0.3, 0.9);
    S.ring(ps, hx, hy, 4, 74, '120,255,160', 4, 0.4, true);
    S.ring(ps, hx, hy, 3, 46, '255,255,255', 2.5, 0.26, true);
    S.stars(ps, hx, hy, 10, '160,255,190', [60, 220], [8, 14], -Math.PI / 2, 1.2);
    S.sparks(ps, hx, hy, 14, Math.PI / 2, 1.5, [160, 460], '140,255,170', 1.3);
    const p = loc(g, theta, 0.88);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta);
      const rg = c.createRadialGradient(0, 0, 2, 0, 0, 26);
      rg.addColorStop(0, 'rgba(10,30,16,0.7)');
      rg.addColorStop(0.7, 'rgba(40,120,60,0.25)');
      rg.addColorStop(1, 'rgba(60,200,90,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(0, 0, 26, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(130,255,170,0.65)';
      for (const [r, w] of [
        [8, 1.4],
        [14, 1],
        [20, 1.2],
      ]) {
        c.lineWidth = w;
        c.setLineDash(r === 14 ? [4, 3] : []);
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.stroke();
      }
      c.setLineDash([]);
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6;
        c.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
        c.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
      }
      c.stroke();
      c.restore();
    });
    woodCracks(g, theta, 3, [10, 22], '120,255,160', 1.0);
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '90,255,140', 1.5, 0.8));
    g.landed(makeItem('ufo', theta, 0.1, 24, true), 0.4);
    sfx.play('ufo_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new TractorPulse(hx, hy + 14, 0.5, 90));
    g.addFX(new Light(hx, hy, 200, '90,255,140', 0.7, 0.3));
    S.ring(ps, hx, hy, 4, 80, '120,255,160', 4, 0.34, true);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [160, 520], '140,255,170', 1.4);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 8);
      drawUfo(c, 1.15, 0);
    });
    sfx.play('ufo_hit');
    this.alive = false;
  }
}

// ───────────────────────── RAINBOW ─────────────────────────
export class RainbowShot extends Projectile {
  weapon = 'rainbow' as const;
  tip = 11;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.85) S.stars(ps, this.x + rand(-10, 10), this.y + rand(8, 60), 1, pick(RAINBOW), [10, 70], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.15) S.smoke(ps, this.x + rand(-8, 8), this.y + rand(20, 50), 1, '250,252,255', [8, 24], { vx: [-20, 20], vy: [10, 40], alpha: 0.35, life: [0.4, 0.7] });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const gr = ctx.createLinearGradient(0, this.y + 6, 0, this.y + 170);
      gr.addColorStop(0, `rgba(${RAINBOW[i]},0.95)`);
      gr.addColorStop(1, `rgba(${RAINBOW[i]},0)`);
      ctx.strokeStyle = gr;
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      for (let j = 0; j <= 22; j++) {
        const u = j / 22;
        const px = this.x + (i - 3) * 3.2 + Math.sin(u * 9 - t * 18 + i * 0.6) * 3.4 * (0.4 + u);
        const py = this.y + 6 + u * 164;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(RAINBOW[Math.floor(t * 8) % 7]), this.x, this.y + 4, 80, 0.55);
    drawSprite(ctx, glowSprite('255,255,255'), this.x, this.y + 4, 36, 0.8);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 4);
    ctx.rotate(t * 4);
    drawGoldStar(ctx, 9.5, -Math.PI / 2, true);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(8, 'rgba(255,235,250,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new RainbowBurst(hx, hy + 6, 0.3, 1.2));
    g.addFX(new RainbowRings(hx, hy, 0.65, 1));
    g.addFX(new Light(hx, hy, 230, '255,220,250', 0.8, 0.38));
    S.glow(ps, hx, hy, 150, 20, '255,245,255', 0.26, 1);
    S.rainbowSparks(ps, hx, hy, 40, Math.PI / 2, 1.7, [200, 640], 1.7);
    for (let i = 0; i < 7; i++) S.stars(ps, hx, hy, 2, RAINBOW[i], [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.smoke(ps, hx - 30, hy + 6, 4, '250,252,255', [18, 54], { vx: [-110, -30], vy: [-30, 40], alpha: 0.5, life: [0.7, 1.2] });
    S.smoke(ps, hx + 30, hy + 6, 4, '250,252,255', [18, 54], { vx: [30, 110], vy: [-30, 40], alpha: 0.5, life: [0.7, 1.2] });
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    const p = loc(g, theta, 0.96);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta - Math.PI / 2);
      drawRainbowArc(c, 24, 28, 3.2, 0.92);
      c.restore();
    });
    woodCracks(g, theta, 3, [10, 22], '255,200,240', 0.9);
    g.landed(makeItem('rainbow', theta, 0.12, 30, true), 0.3);
    sfx.play('rainbow_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new RainbowBurst(hx, hy + 6, 0.26, 1));
    g.addFX(new RainbowRings(hx, hy, 0.5, 0.8));
    S.rainbowSparks(ps, hx, hy, 30, Math.PI / 2, 1.6, [180, 560], 1.6);
    for (let i = 0; i < 7; i++) S.stars(ps, hx, hy, 1, RAINBOW[i], [60, 240], [8, 14], Math.PI / 2, 1.7);
    sfx.play('rainbow_hit');
    this.alive = false;
  }
}

// ───────────────────────── METEOR ─────────────────────────
export class MeteorShot extends Projectile {
  weapon = 'meteor' as const;
  tip = 17;
  half = 0.13;
  rock = makeRock(16, Math.floor(rand(1, 500)));
  rot = 0;
  lightT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -700);
  }
  trail(dt?: number) {
    const g = this.g;
    const ps = g.particles;
    this.rot += (dt ?? 0.016) * 4;
    for (let i = 0; i < 3; i++) ps.add({ k: K.FIRE, add: true, x: this.x + rand(-10, 10), y: this.y + rand(10, 80), vx: rand(-30, 30), vy: rand(40, 150), size: rand(20, 34), size2: rand(44, 70), life: rand(0.25, 0.46), alpha: 0.9, g: -80 });
    if (Math.random() < 0.8) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-12, 12), y: this.y + rand(8, 60), vx: rand(-70, 70), vy: rand(30, 160), size: rand(1.4, 2.8), life: rand(0.4, 0.9), color: pick(['255,200,90', '255,130,40']), g: 140, drag: 1.4 });
    if (Math.random() < 0.55) ps.add({ k: K.SMOKE, x: this.x + rand(-10, 10), y: this.y + rand(40, 100), vx: rand(-20, 20), vy: rand(10, 50), size: 16, size2: 54, life: rand(0.8, 1.2), color: '44,36,32', alpha: 0.5, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < 0.18) S.rocks(ps, this.x, this.y + 18, 1, Math.PI / 2, 1.2, [20, 120]);
    this.lightT += dt ?? 0.016;
    if (this.lightT > 0.05) {
      this.lightT = 0;
      g.addFX(new Light(this.x, this.y + 10, 220, '255,120,40', 0.6, 0.14));
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [w, h, c0, a] of [
      [18, 170, '255,90,20', 0.5],
      [11, 130, '255,170,60', 0.7],
      [5, 90, '255,245,200', 0.9],
    ] as [number, number, string, number][]) {
      const gr = ctx.createLinearGradient(0, this.y + 6, 0, this.y + h);
      gr.addColorStop(0, `rgba(${c0},${a})`);
      gr.addColorStop(1, `rgba(${c0},0)`);
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(this.x - w, this.y + 4);
      ctx.quadraticCurveTo(this.x - w * 0.4 + Math.sin(this.age * 20) * 5, this.y + h * 0.5, this.x, this.y + h);
      ctx.quadraticCurveTo(this.x + w * 0.4 + Math.sin(this.age * 20 + 1) * 5, this.y + h * 0.5, this.x + w, this.y + 4);
      ctx.closePath();
      ctx.fill();
    }
    drawSprite(ctx, glowSprite('255,130,40'), this.x, this.y + 10, 120, 0.6);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    drawRock(ctx, this.rock, this.age, 1);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(18, 'rgba(255,200,120,');
    g.hitStop(0.14);
    g.shake(20);
    g.flashScreen('255,160,60', 0.34);
    g.addFX(new Light(hx, hy, 430, '255,130,40', 1, 0.6));
    S.glow(ps, hx, hy, 300, 40, '255,235,190', 0.34, 1);
    S.fire(ps, hx, hy, 44, Math.PI / 2, 1.7, [80, 520], [36, 64], [64, 120], [0.45, 0.9], { g: -220, drag: 2 });
    S.fire(ps, hx, hy - 12, 16, -Math.PI / 2, 1.2, [60, 260], [32, 54], [60, 100], [0.4, 0.75], { g: -160 });
    S.ring(ps, hx, hy, 10, 220, '255,150,50', 14, 0.55, true);
    S.ring(ps, hx, hy, 6, 160, '255,240,200', 4, 0.34, true);
    S.ring(ps, hx, hy, 8, 290, '255,110,30', 6, 0.7, true, 0.7);
    S.rocks(ps, hx, hy, 16, Math.PI / 2, 1.5, [160, 560]);
    S.chips(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 540]);
    S.splinters(ps, hx, hy, 12, Math.PI / 2, 1.6, [200, 600]);
    S.goo(ps, hx, hy, 24, Math.PI / 2, 1.5, [120, 520], [1.6, 3.8], '255,120,30', '120,30,5');
    S.sparks(ps, hx, hy, 60, Math.PI / 2, 1.7, [200, 820], '255,200,110', 1.9);
    S.embers(ps, hx, hy, 34, Math.PI / 2, 1.8, [80, 440]);
    S.smoke(ps, hx, hy, 14, '40,34,30', [24, 100], { vx: [-130, 130], vy: [-80, 80], alpha: 0.7, life: [1, 1.8], drag: 2 });
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const cracks = makeCracks(theta, R, 8, [22, 54], 1.4);
    g.paint((c) => {
      const cx = lx * 0.94;
      const cy = ly * 0.94;
      const wide = c.createRadialGradient(cx, cy, 6, cx, cy, 46);
      wide.addColorStop(0, 'rgba(50,24,8,0.6)');
      wide.addColorStop(1, 'rgba(50,24,8,0)');
      c.fillStyle = wide;
      c.beginPath();
      c.arc(cx, cy, 46, 0, TAU);
      c.fill();
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 30);
      rg.addColorStop(0, 'rgba(8,4,2,0.97)');
      rg.addColorStop(0.55, 'rgba(26,12,5,0.78)');
      rg.addColorStop(1, 'rgba(40,20,8,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 30, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,140,40,0.55)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(cx, cy, 17, 0, TAU);
      c.stroke();
      strokeLines(c, cracks, 'rgba(12,6,2,0.92)', 1.5);
    });
    g.addWheelFX(new GlowLines(cracks, '255,120,30', 1.7, 4.2));
    g.addWheelFX(new GlowSpot(lx * 0.94, ly * 0.94, 120, '255,110,30', 3.6, 0.9));
    g.landed(makeItem('meteor', theta, 0.115, 14, false), 0.7);
    sfx.play('meteor_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 320, '255,130,40', 0.95, 0.45));
    g.flashScreen('255,160,60', 0.22);
    S.fire(ps, hx, hy, 28, Math.PI / 2, 1.7, [80, 420], [30, 52], [56, 100], [0.4, 0.75], { g: -200 });
    S.ring(ps, hx, hy, 8, 170, '255,150,50', 10, 0.45, true);
    S.rocks(ps, hx, hy, 10, Math.PI / 2, 1.5, [140, 460]);
    S.sparks(ps, hx, hy, 36, Math.PI / 2, 1.6, [200, 680], '255,200,110', 1.7);
    S.smoke(ps, hx, hy, 8, '40,34,30', [20, 80], { vx: [-100, 100], vy: [-40, 70], alpha: 0.6 });
    sfx.play('meteor_hit');
    this.alive = false;
  }
}

// ───────────────────────── DIAMOND ─────────────────────────
export class DiamondShot extends Projectile {
  weapon = 'diamond' as const;
  tip = 9;
  half = 0.08;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1150);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.75) S.stars(ps, this.x + rand(-8, 8), this.y + rand(8, 50), 1, pick(['235,252,255', '170,230,255', '255,255,255']), [10, 60], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.6) S.rainbowSparks(ps, this.x + rand(-6, 6), this.y + rand(6, 30), 1, Math.PI / 2, 1.2, [40, 160], 1.2);
    if (Math.random() < 0.3) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-5, 5), y: this.y + rand(8, 26), vx: rand(-12, 12), vy: rand(20, 60), size: rand(14, 24), size2: 3, color: '150,225,255', life: rand(0.2, 0.35), alpha: 0.5 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [dx, rgb] of [
      [-3.4, '255,90,100'],
      [0, '120,255,150'],
      [3.4, '110,150,255'],
    ] as [number, string][]) {
      const gr = ctx.createLinearGradient(0, this.y + 6, 0, this.y + 110);
      gr.addColorStop(0, `rgba(${rgb},0.8)`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      ctx.strokeStyle = gr;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(this.x + dx, this.y + 8);
      ctx.lineTo(this.x + dx * 2.2, this.y + 110);
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('150,225,255'), this.x, this.y + 2, 60, 0.5);
    drawSprite(ctx, glowSprite('255,255,255'), this.x, this.y + 2, 24, 0.7);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 2);
    ctx.scale(0.45 + 0.55 * Math.abs(Math.cos(this.age * 9)), 1);
    drawDiamond(ctx, 11, this.age);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(9, 'rgba(225,248,255,');
    g.hitStop(0.07);
    g.shake(8);
    g.flashScreen('225,248,255', 0.12);
    g.addFX(new RainbowBurst(hx, hy + 4, 0.3, 1.1));
    g.addFX(new Light(hx, hy, 240, '170,230,255', 0.9, 0.4));
    g.addFX(new Rays(hx, hy, '200,240,255', 0.5, 16, Math.PI / 2, Math.PI * 0.9, 1));
    S.glow(ps, hx, hy, 160, 22, '235,252,255', 0.26, 1);
    S.ring(ps, hx, hy, 5, 100, '170,230,255', 4, 0.4, true);
    S.ring(ps, hx, hy, 4, 66, '255,255,255', 3, 0.28, true);
    S.crystalShards(ps, hx, hy, 22, Math.PI / 2, 1.6, [160, 560]);
    S.stars(ps, hx, hy, 14, '235,252,255', [80, 300], [9, 17], Math.PI / 2, 1.7);
    S.rainbowSparks(ps, hx, hy, 26, Math.PI / 2, 1.7, [180, 620], 1.5);
    S.sparks(ps, hx, hy, 18, Math.PI / 2, 1.6, [200, 640], '220,248,255', 1.5);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [100, 340]);
    S.smoke(ps, hx, hy, 5, '220,244,255', [12, 44], { vx: [-80, 80], vy: [-20, 50], alpha: 0.25, life: [0.6, 1] });
    const lx = Math.cos(theta) * R;
    const ly = Math.sin(theta) * R;
    const cracks = makeCracks(theta, R, 7, [16, 40], 1.35);
    const bits = Array.from({ length: 12 }, () => ({ a: rand(0, TAU), d: rand(4, 24), r: rand(0, TAU), s: rand(1.6, 3.4) }));
    g.paint((c) => {
      const cx = lx * 0.93;
      const cy = ly * 0.93;
      const rg = c.createRadialGradient(cx, cy, 0, cx, cy, 18);
      rg.addColorStop(0, 'rgba(210,240,255,0.55)');
      rg.addColorStop(1, 'rgba(210,240,255,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(cx, cy, 18, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(170,225,250,0.6)', 1.6);
      strokeLines(c, cracks, 'rgba(255,255,255,0.9)', 0.6);
      for (const b of bits) {
        c.save();
        c.translate(cx + Math.cos(b.a) * b.d, cy + Math.sin(b.a) * b.d);
        c.rotate(b.r);
        c.beginPath();
        c.moveTo(0, -b.s);
        c.lineTo(b.s * 0.7, b.s * 0.2);
        c.lineTo(0, b.s);
        c.lineTo(-b.s * 0.7, b.s * 0.2);
        c.closePath();
        c.fillStyle = 'rgba(210,244,255,0.92)';
        c.fill();
        c.strokeStyle = 'rgba(70,160,220,0.8)';
        c.lineWidth = 0.5;
        c.stroke();
        c.restore();
      }
    });
    g.addWheelFX(new GlowLines(cracks, '170,230,255', 1.2, 1.4));
    g.addWheelFX(new GlowSpot(lx * 0.93, ly * 0.93, 70, '150,225,255', 1.2, 0.8));
    g.landed(makeItem('diamond', theta, 0.08, 20, false), 0.3);
    sfx.play('diamond_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new RainbowBurst(hx, hy + 4, 0.26, 0.9));
    g.addFX(new Light(hx, hy, 200, '170,230,255', 0.8, 0.32));
    S.crystalShards(ps, hx, hy, 16, Math.PI / 2, 1.6, [140, 500]);
    S.rainbowSparks(ps, hx, hy, 20, Math.PI / 2, 1.6, [160, 540], 1.4);
    S.stars(ps, hx, hy, 8, '235,252,255', [60, 240], [8, 14], Math.PI / 2, 1.7);
    sfx.play('diamond_hit');
    this.alive = false;
  }
}
