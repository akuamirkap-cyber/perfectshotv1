import { drawBreakerCoin } from '@/games/shared/coinArt';
import { type Ctx, TAU, drawSprite, glowSprite, makeBolt, pick, rand, randomPoly } from './core';
import { makeCracks, strokeLines } from './art';
import { RadialFlash } from './fx4';
import { ComicPop, RainbowBurst, RainbowRings } from './fx5';
import { FrostBloom } from './fx6';
import { GlitchBurst, HaloRing, HolyPillar, RadiationPulse, SaberSlash, WarpLines } from './fx7';
import { GlowLines, GlowSpot, K, Light, Rays } from './particles';
import { drawFlame4 } from './shapes4';
import { RAINBOW } from './shapes5';
import { drawBee } from './shapes4';
import {
  AMETHYST,
  EMERALD,
  RUBY,
  SAPPHIRE,
  drawBlasterBolt,
  drawChargeOrb,
  drawHolyEmblem,
  drawHolyOrb,
  drawIcicle,
  drawQuantumOrb,
  drawRainbowStream,
  drawRobotGlove,
  drawShardBolt,
  drawSlashWave,
  drawStinger,
  drawToxicOrb,
  drawTrefoil,
  drawUnicornHorn,
} from './shapes7';
import * as S from './spawn7';
import { sfx } from './audio';
import { Projectile, fallingCustom, makeItem } from './projectiles';
import { crater, loc, woodCracks } from './projectiles6';
import type { Game } from './Game';

const GREEN_GOO: [string, string, string] = ['rgba(20,90,10,0.92)', 'rgba(110,230,60,0.96)', 'rgba(200,255,140,0.92)'];
const STEEL_CHIPS = ['150,156,166', '110,116,126', '200,206,216', '80,86,96'];

/** soft coloured glow stamped on the wheel texture */
function glowPaint(g: Game, p: { x: number; y: number }, rgb: string, r: number, a = 0.45) {
  g.paint((c) => {
    const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    rg.addColorStop(0, `rgba(${rgb},${a})`);
    rg.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = rg;
    c.beginPath();
    c.arc(p.x, p.y, r, 0, TAU);
    c.fill();
  });
}

// ───────────────────────── HOLY LIGHT ─────────────────────────
export class HolyShot extends Projectile {
  weapon = 'holy' as const;
  tip = 24;
  half = 0.1;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -900);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.7) S.stars(ps, this.x + rand(-10, 10), this.y + rand(10, 50), 1, pick(['255,240,190', '255,225,140', '255,255,255']), [10, 70], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.3) S.feathers(ps, this.x + rand(-8, 8), this.y + rand(10, 30), 1, Math.PI / 2, 1.2, [20, 80]);
    if (Math.random() < 0.5) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-9, 9), y: this.y + rand(8, 40), vx: rand(-20, 20), vy: rand(10, 60), size: rand(1.4, 2.4), life: rand(0.5, 0.9), color: '255,230,150', g: -30 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y + 6, 0, this.y + 130);
    gr.addColorStop(0, 'rgba(255,240,190,0.65)');
    gr.addColorStop(1, 'rgba(255,215,120,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 12, this.y + 8);
    ctx.lineTo(this.x + 12, this.y + 8);
    ctx.lineTo(this.x + 1.5, this.y + 130);
    ctx.lineTo(this.x - 1.5, this.y + 130);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 8);
    drawHolyOrb(ctx, 11, this.age);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(9, 'rgba(255,240,200,');
    g.hitStop(0.06);
    g.shake(8);
    g.flashScreen('255,240,200', 0.2);
    g.addFX(new HolyPillar(hx, -30, hy, 0.75));
    g.addFX(new HaloRing(hx, hy + 4, 0.55, 1));
    g.addFX(new Light(hx, hy, 260, '255,225,140', 0.9, 0.45));
    g.addFX(new Rays(hx, hy, '255,230,150', 0.55, 16, Math.PI / 2, Math.PI * 0.9, 1.1));
    S.glow(ps, hx, hy, 180, 24, '255,245,210', 0.28, 1);
    S.ring(ps, hx, hy, 5, 100, '255,225,140', 5, 0.42, true);
    S.ring(ps, hx, hy, 4, 66, '255,255,255', 3, 0.28, true);
    S.feathers(ps, hx, hy, 20, Math.PI / 2, 1.7, [80, 360]);
    S.stars(ps, hx, hy, 14, '255,236,170', [80, 300], [9, 17], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.6, [200, 640], '255,225,140', 1.6);
    S.embers(ps, hx, hy, 14, -Math.PI / 2, 1.4, [60, 220], '255,230,150', 2);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 340]);
    const p = loc(g, theta, 0.9);
    glowPaint(g, p, '255,225,140', 24, 0.5);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta + Math.PI / 2);
      c.globalAlpha = 0.92;
      drawHolyEmblem(c, 13);
      c.restore();
    });
    woodCracks(g, theta, 4, [12, 28], '255,225,140', 1.2);
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '255,225,140', 1.6, 0.8));
    g.landed(makeItem('holy', theta, 0.1, 32, false), 0.4);
    sfx.play('holy_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new HolyPillar(hx, -30, hy, 0.5));
    g.addFX(new HaloRing(hx, hy + 4, 0.4, 0.8));
    g.addFX(new Light(hx, hy, 220, '255,225,140', 0.8, 0.35));
    S.feathers(ps, hx, hy, 14, Math.PI / 2, 1.6, [80, 300]);
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.5, [180, 560], '255,225,140', 1.5);
    S.stars(ps, hx, hy, 8, '255,236,170', [60, 240], [8, 14], Math.PI / 2, 1.7);
    fallingCustom(g, hx, hy, (c) => drawHolyOrb(c, 11, 0.3));
    sfx.play('holy_hit');
    this.alive = false;
  }
}

// ───────────────────────── RAINBOW UNICORN HORN ─────────────────────────
export class UnicornShot extends Projectile {
  weapon = 'unicorn' as const;
  tip = 0;
  half = 0.075;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.stars(ps, this.x + rand(-12, 12), this.y + rand(20, 80), 1, pick(RAINBOW), [10, 70], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.2) S.hearts(ps, this.x + rand(-8, 8), this.y + rand(30, 70), 1, Math.PI / 2, 1, [10, 60]);
    if (Math.random() < 0.6) S.rainbowSparks(ps, this.x + rand(-8, 8), this.y + rand(10, 40), 1, Math.PI / 2, 1.2, [30, 120], 1.3);
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.translate(this.x, this.y + 40);
    drawRainbowStream(ctx, 170, 36, this.age);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,190,240'), this.x, this.y + 20, 90, 0.4);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    drawUnicornHorn(ctx, 48, 12, this.age);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(8, 'rgba(255,225,245,');
    g.hitStop(0.05);
    g.shake(7);
    g.addFX(new RainbowBurst(hx, hy + 6, 0.3, 1.15));
    g.addFX(new RainbowRings(hx, hy, 0.65, 1));
    g.addFX(new Light(hx, hy, 230, '255,200,245', 0.8, 0.38));
    S.glow(ps, hx, hy, 160, 20, '255,245,255', 0.26, 1);
    S.hearts(ps, hx, hy, 12, Math.PI / 2, 1.7, [90, 320]);
    S.rainbowSparks(ps, hx, hy, 36, Math.PI / 2, 1.7, [200, 620], 1.6);
    for (let i = 0; i < 7; i++) S.stars(ps, hx, hy, 2, RAINBOW[i], [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.smoke(ps, hx, hy, 5, '255,235,250', [12, 44], { vx: [-90, 90], vy: [-20, 50], alpha: 0.3, life: [0.6, 1] });
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    const p = loc(g, theta, 0.92);
    glowPaint(g, p, '255,190,235', 22, 0.4);
    g.paint((c) => {
      for (let i = 0; i < 7; i++) {
        c.strokeStyle = `rgba(${RAINBOW[i]},0.75)`;
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(p.x, p.y, 5 + i * 1.8, 0, TAU);
        c.stroke();
      }
      for (let i = 0; i < 9; i++) {
        c.fillStyle = `rgba(${RAINBOW[i % 7]},0.9)`;
        c.beginPath();
        c.arc(p.x + rand(-18, 18), p.y + rand(-18, 18), rand(0.8, 1.8), 0, TAU);
        c.fill();
      }
    });
    woodCracks(g, theta, 3, [10, 22], '255,190,240', 0.9);
    g.landed(makeItem('unicorn', theta, 0.075, 40, false, { wob: 0.2 }), 0.35);
    sfx.play('unicorn_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new RainbowBurst(hx, hy + 6, 0.26, 0.9));
    g.addFX(new RainbowRings(hx, hy, 0.5, 0.8));
    S.hearts(ps, hx, hy, 8, Math.PI / 2, 1.6, [80, 280]);
    S.rainbowSparks(ps, hx, hy, 28, Math.PI / 2, 1.6, [180, 560], 1.5);
    fallingCustom(g, hx, hy, (c) => drawUnicornHorn(c, 48, 12, 0));
    sfx.play('unicorn_hit');
    this.alive = false;
  }
}

// ───────────────────────── OBLITERATOR ORB ─────────────────────────
export class ObliteratorShot extends Projectile {
  weapon = 'obliterator' as const;
  tip = 14;
  half = 0.115;
  ringT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -640);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    this.ringT += dt;
    if (this.ringT > 0.07) {
      this.ringT = 0;
      S.ring(ps, this.x, this.y + 10, 5, 34, '130,255,90', 2.2, 0.34, true, 0.7);
    }
    if (Math.random() < 0.8) ps.add({ k: K.DROP, x: this.x + rand(-8, 8), y: this.y + rand(10, 30), vx: rand(-30, 30), vy: rand(30, 140), g: 600, size: rand(1.4, 3), life: 0.6, color: '110,255,80', alpha: 1.4, data: '30,110,20' });
    if (Math.random() < 0.5) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(10, 30), vx: rand(-20, 20), vy: rand(10, 50), size: 12, size2: 38, life: rand(0.7, 1.1), color: '80,190,60', alpha: 0.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < 0.3) S.miniBubble(ps, this.x + rand(-10, 10), this.y + 14, rand(-20, 20), rand(10, 50), rand(2.4, 5), rand(0.4, 0.8));
    if (Math.random() < 0.5) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-12, 12), y: this.y + rand(0, 40), vx: rand(-30, 30), vy: rand(20, 80), size: 1.8, life: 0.6, color: '170,255,120' });
  }
  draw(ctx: Ctx) {
    drawToxicOrb(ctx, this.x, this.y, 13.5, this.age, 1.15);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(14, 'rgba(190,255,150,');
    g.hitStop(0.1);
    g.shake(14);
    g.flashScreen('120,255,90', 0.2);
    g.addFX(new RadiationPulse(hx, hy, 0.8, 1.1));
    g.addFX(new Light(hx, hy, 330, '110,255,80', 1, 0.55));
    S.glow(ps, hx, hy, 250, 34, '210,255,170', 0.32, 1);
    S.ring(ps, hx, hy, 8, 190, '120,255,80', 10, 0.5, true);
    S.ring(ps, hx, hy, 4, 120, '240,255,210', 3.5, 0.3, true);
    S.smoke(ps, hx, hy, 14, '70,170,50', [22, 90], { vx: [-110, 110], vy: [-70, 60], alpha: 0.6, life: [1, 1.7], drag: 2 });
    S.goo(ps, hx - 3, hy, 16, Math.PI - 0.3, 0.5, [200, 480], [1.8, 3.8], '110,255,80', '30,110,20');
    S.goo(ps, hx + 3, hy, 16, 0.3, 0.5, [200, 480], [1.8, 3.8], '110,255,80', '30,110,20');
    S.goo(ps, hx, hy, 18, Math.PI / 2, 1.5, [100, 400], [1.4, 3.4], '110,255,80', '30,110,20');
    S.sparks(ps, hx, hy, 40, Math.PI / 2, 1.7, [200, 700], '150,255,100', 1.7);
    S.embers(ps, hx, hy, 28, Math.PI / 2, 1.8, [80, 400], '170,255,120', 2);
    S.chips(ps, hx, hy, 14, Math.PI / 2, 1.6, [140, 460]);
    crater(g, theta, 1, '110,255,80', 3.2);
    const p = loc(g, theta, 0.9);
    glowPaint(g, p, '110,255,80', 30, 0.45);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta + Math.PI / 2);
      c.globalAlpha = 0.9;
      drawTrefoil(c, 11, '#caff6a', '#0c2a08');
      c.restore();
    });
    g.addDecal({ kind: 'goo', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(11, 1, 0.4), next: 0.1, c: GREEN_GOO, drip: '110,255,80', dripData: '30,110,20' });
    g.landed(makeItem('obliterator', theta, 0.12, 15, false), 0.6);
    sfx.play('obl_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.flashScreen('120,255,90', 0.16);
    g.addFX(new RadiationPulse(hx, hy, 0.6, 0.9));
    g.addFX(new Light(hx, hy, 260, '110,255,80', 0.85, 0.4));
    S.smoke(ps, hx, hy, 10, '70,170,50', [20, 80], { vx: [-100, 100], vy: [-60, 60], alpha: 0.55 });
    S.goo(ps, hx, hy, 24, Math.PI / 2, 1.4, [150, 460], [1.6, 3.6], '110,255,80', '30,110,20');
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.6, [200, 620], '150,255,100', 1.6);
    sfx.play('obl_hit');
    this.alive = false;
  }
}

// ───────────────────────── COIN ─────────────────────────
export class CoinShot extends Projectile {
  weapon = 'coin' as const;
  tip = 13;
  half = 0.085;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1100);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.stars(ps, this.x + rand(-9, 9), this.y + rand(8, 44), 1, pick(['255,230,130', '255,210,80', '255,250,200']), [10, 60], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.12) S.coins(ps, this.x, this.y + 20, 1, Math.PI / 2, 1, [20, 90]);
    if (Math.random() < 0.5) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-8, 8), y: this.y + rand(6, 30), vx: rand(-20, 20), vy: rand(10, 60), size: 1.8, life: 0.5, color: '255,215,90' });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 90);
    gr.addColorStop(0, 'rgba(255,225,120,0.6)');
    gr.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(this.x - 6, this.y + 4, 12, 86);
    drawSprite(ctx, glowSprite('255,210,90'), this.x, this.y, 62, 0.55);
    ctx.restore();
    ctx.save();
    drawBreakerCoin(ctx, this.x, this.y, 13, this.age, 0, 1, true, true);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(7, 'rgba(255,240,180,');
    g.hitStop(0.04);
    g.shake(6);
    g.addFX(new ComicPop(hx, hy + 50, 'CLING!', '#fff3b0', '#ffb81a', '#6a3a00', 0.95, 0.55));
    g.addFX(new Light(hx, hy, 210, '255,215,100', 0.75, 0.32));
    S.glow(ps, hx, hy, 130, 18, '255,240,190', 0.22, 1);
    S.ring(ps, hx, hy, 4, 80, '255,215,100', 4, 0.36, true);
    S.ring(ps, hx, hy, 3, 52, '255,255,255', 2.5, 0.24, true);
    S.coins(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 560]);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [180, 560], '255,225,120', 1.5);
    S.stars(ps, hx, hy, 12, '255,230,130', [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    const p = loc(g, theta, 0.92);
    glowPaint(g, p, '255,215,100', 16, 0.4);
    woodCracks(g, theta, 3, [8, 20], '255,215,100', 0.8);
    g.landed(makeItem('coin', theta, 0.09, 24, false), 0.25);
    sfx.play('coin_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new ComicPop(hx, hy + 40, 'TING!', '#fff3b0', '#ffb81a', '#6a3a00', 0.8, 0.4));
    S.coins(ps, hx, hy, 12, Math.PI / 2, 1.5, [140, 480]);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [180, 540], '255,225,120', 1.4);
    sfx.play('coin_hit');
    this.alive = false;
  }
}

// ───────────────────────── PHOTON SABER SLASH ─────────────────────────
export class SaberShot extends Projectile {
  weapon = 'saber' as const;
  tip = 10;
  half = 0.14;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1500);
  }
  trail() {
    const ps = this.g.particles;
    for (const s of [-1, 1]) S.sparks(ps, this.x + s * 42, this.y + 20, 1, Math.PI / 2, 0.8, [40, 160], '150,235,255', 1.4, 0, 0.03);
    if (Math.random() < 0.6) S.stars(ps, this.x + rand(-34, 34), this.y + rand(8, 40), 1, pick(['190,245,255', '255,255,255', '110,215,255']), [10, 60], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.3) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-30, 30), y: this.y + rand(8, 24), size: rand(18, 30), size2: 3, color: '70,200,255', life: 0.25, alpha: 0.55 });
  }
  draw(ctx: Ctx) {
    for (let i = 3; i >= 1; i--) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.22 * (4 - i);
      ctx.translate(this.x, this.y + 8 + i * 18);
      ctx.scale(1 - i * 0.12, 1 - i * 0.12);
      drawSlashWave(ctx, 46);
      ctx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('80,200,255'), this.x, this.y + 14, 140, 0.45);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(this.x, this.y + 14);
    drawSlashWave(ctx, 46);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(10, 'rgba(200,245,255,');
    g.hitStop(0.07);
    g.shake(9);
    g.flashScreen('160,235,255', 0.14);
    g.addFX(new SaberSlash(hx, hy + 2, -0.5, 170, 0.34));
    g.addFX(new SaberSlash(hx, hy + 2, 0.5, 120, 0.28));
    g.addFX(new Light(hx, hy, 250, '90,210,255', 0.85, 0.4));
    g.addFX(new Rays(hx, hy, '150,235,255', 0.4, 12, Math.PI / 2, Math.PI * 0.9, 1));
    S.glow(ps, hx, hy, 150, 20, '220,248,255', 0.24, 1);
    S.ring(ps, hx, hy, 5, 100, '110,225,255', 4, 0.4, true);
    S.ring(ps, hx, hy, 3, 60, '255,255,255', 3, 0.26, true);
    S.sparks(ps, hx, hy, 34, Math.PI / 2, 1.7, [220, 700], '140,235,255', 1.6);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.5, [300, 700], '255,255,255', 1.2);
    S.stars(ps, hx, hy, 10, '200,245,255', [80, 260], [9, 15], Math.PI / 2, 1.7);
    S.chips(ps, hx, hy, 12, Math.PI / 2, 1.5, [140, 420]);
    S.splinters(ps, hx, hy, 8, Math.PI / 2, 1.4, [200, 520]);
    const p = loc(g, theta, 0.9);
    const phi = theta + Math.PI / 2 + 0.4;
    const x0 = p.x - Math.cos(phi) * 36;
    const y0 = p.y - Math.sin(phi) * 36;
    const x1 = p.x + Math.cos(phi) * 36;
    const y1 = p.y + Math.sin(phi) * 36;
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(phi);
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(110,225,255,0.5)';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(-34, 0);
      c.lineTo(34, 0);
      c.stroke();
      c.beginPath();
      c.moveTo(-36, 0);
      c.quadraticCurveTo(0, -4.4, 36, 0);
      c.quadraticCurveTo(0, 4.4, -36, 0);
      c.fillStyle = 'rgba(12,8,6,0.95)';
      c.fill();
      c.strokeStyle = 'rgba(210,248,255,0.75)';
      c.lineWidth = 0.8;
      c.stroke();
      c.restore();
    });
    g.addWheelFX(new GlowLines([[x0, y0, x1, y1]], '110,225,255', 1.6, 1.4));
    g.addWheelFX(new GlowSpot(p.x, p.y, 60, '110,225,255', 1.1, 0.7));
    g.landed(makeItem('saber', theta, 0.11, 28, true), 0.35);
    sfx.play('saber_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new SaberSlash(hx, hy + 2, -0.5, 150, 0.3));
    g.addFX(new Light(hx, hy, 220, '90,210,255', 0.8, 0.35));
    S.sparks(ps, hx, hy, 32, Math.PI / 2, 1.6, [200, 640], '140,235,255', 1.5);
    S.ring(ps, hx, hy, 4, 80, '110,225,255', 4, 0.32, true);
    sfx.play('saber_hit');
    this.alive = false;
  }
}

// ───────────────────────── GAUNTLET CANNON FIST ─────────────────────────
export class GauntletShot extends Projectile {
  weapon = 'gauntlet' as const;
  tip = 37;
  half = 0.145;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -520);
  }
  trail(dt: number) {
    this.vy = Math.max(-1250, this.vy - 2800 * dt);
    const ps = this.g.particles;
    S.fire(ps, this.x, this.y + 54, 2, Math.PI / 2, 0.3, [80, 240], [14, 24], [28, 46], [0.14, 0.3], { g: 0, drag: 1 });
    ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + rand(56, 80), vx: rand(-18, 18), vy: rand(10, 50), size: 12, size2: 40, life: rand(0.7, 1.1), color: '170,174,180', alpha: 0.45, rot: rand(0, TAU), vrot: rand(-1, 1) });
    if (Math.random() < 0.7) ps.add({ k: K.SPARK, add: true, x: this.x + rand(-6, 6), y: this.y + 54, vx: rand(-100, 100), vy: rand(80, 280), g: 400, size: 1.5, len: 0.03, life: rand(0.3, 0.6), color: '255,200,110', drag: 2 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite('255,150,60'), 0, 56, 80, 0.55);
    ctx.restore();
    ctx.save();
    ctx.translate(0, 52);
    ctx.rotate(Math.PI);
    drawFlame4(ctx, 46, 16, this.age, 2);
    ctx.restore();
    ctx.rotate(Math.sin(this.age * 22) * 0.025);
    drawRobotGlove(ctx, 1.05, this.age, 0.9);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    g.wheelImpact(20, 'rgba(255,215,160,');
    g.hitStop(0.15);
    g.shake(20);
    g.flashScreen('255,200,140', 0.2);
    g.pulseWheel(-0.06);
    g.addFX(new ComicPop(hx, hy + 76, 'POW!', '#fff1a0', '#ff6a1a', '#5a1400', 1.3, 0.7));
    g.addFX(new RadialFlash(hx, hy, ['255,170,70', '255,240,200', '255,120,40', '255,255,255'], 0.2, 150, 20));
    g.addFX(new Light(hx, hy, 340, '255,150,60', 1, 0.5));
    g.addFX(new Rays(hx, hy, '255,200,130', 0.45, 14, Math.PI / 2, Math.PI * 0.9, 1.2));
    S.glow(ps, hx, hy, 230, 32, '255,235,190', 0.3, 1);
    S.ring(ps, hx, hy, 8, 210, '255,180,90', 12, 0.5, true);
    S.ring(ps, hx, hy, 5, 140, '255,245,210', 4, 0.32, true);
    S.ring(ps, hx, hy, 6, 270, '255,150,60', 6, 0.66, true, 0.7);
    S.chips(ps, hx, hy, 22, Math.PI / 2, 1.6, [180, 620], STEEL_CHIPS);
    S.chips(ps, hx, hy, 16, Math.PI / 2, 1.6, [140, 500]);
    S.splinters(ps, hx, hy, 12, Math.PI / 2, 1.6, [200, 560]);
    S.sparks(ps, hx, hy, 50, Math.PI / 2, 1.7, [220, 800], '255,200,110', 1.8);
    S.embers(ps, hx, hy, 20, Math.PI / 2, 1.8, [80, 400]);
    S.smoke(ps, hx, hy, 10, '120,118,116', [20, 80], { vx: [-110, 110], vy: [-60, 60], alpha: 0.55, life: [0.9, 1.5], drag: 2.2 });
    S.stars(ps, hx, hy, 12, '255,230,160', [80, 300], [9, 17], Math.PI / 2, 1.7);
    const p = loc(g, theta, 0.93);
    const cracks = makeCracks(theta, R, 9, [24, 56], 1.5);
    g.paint((c) => {
      const wide = c.createRadialGradient(p.x, p.y, 4, p.x, p.y, 40);
      wide.addColorStop(0, 'rgba(40,20,8,0.65)');
      wide.addColorStop(1, 'rgba(40,20,8,0)');
      c.fillStyle = wide;
      c.beginPath();
      c.arc(p.x, p.y, 40, 0, TAU);
      c.fill();
      for (const [r, a] of [
        [24, 0.5],
        [17, 0.7],
        [10, 0.9],
      ] as [number, number][]) {
        c.strokeStyle = `rgba(12,6,2,${a})`;
        c.lineWidth = 1.8;
        c.beginPath();
        c.arc(p.x, p.y, r, 0, TAU);
        c.stroke();
        c.strokeStyle = `rgba(255,225,180,${a * 0.3})`;
        c.lineWidth = 0.7;
        c.beginPath();
        c.arc(p.x, p.y, r + 1.4, 0, TAU);
        c.stroke();
      }
      strokeLines(c, cracks, 'rgba(255,225,180,0.25)', 0.6, 0.5, 0.5);
      strokeLines(c, cracks, 'rgba(12,6,2,0.92)', 1.6);
    });
    g.addWheelFX(new GlowLines(cracks, '255,150,60', 1.5, 2.4));
    g.addWheelFX(new GlowSpot(p.x, p.y, 90, '255,140,50', 2.0, 0.85));
    g.landed(makeItem('gauntlet', theta, 0.14, 54, false, { wob: 0.3 }), 0.5);
    sfx.play('gauntlet_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.flashScreen('255,200,140', 0.2);
    g.addFX(new ComicPop(hx, hy + 60, 'BONK!', '#fff1a0', '#ff6a1a', '#5a1400', 1.0, 0.5));
    g.addFX(new RadialFlash(hx, hy, ['255,170,70', '255,240,200', '255,255,255'], 0.18, 110, 16));
    g.addFX(new Light(hx, hy, 260, '255,150,60', 0.9, 0.4));
    S.ring(ps, hx, hy, 6, 150, '255,180,90', 8, 0.4, true);
    S.chips(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 560], STEEL_CHIPS);
    S.sparks(ps, hx, hy, 36, Math.PI / 2, 1.6, [200, 680], '255,200,110', 1.6);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, 18);
      drawRobotGlove(c, 1.05, 0, 0.5);
    });
    sfx.play('gauntlet_hit');
    this.alive = false;
  }
}

// ───────────────────────── RUBY BULLET ─────────────────────────
export class RubyShot extends Projectile {
  weapon = 'ruby' as const;
  tip = 15;
  half = 0.07;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1500);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.stars(ps, this.x + rand(-8, 8), this.y + rand(8, 50), 1, pick(['255,120,150', '255,200,215', '255,255,255']), [10, 60], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.5) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-6, 6), y: this.y + rand(6, 30), vx: rand(-20, 20), vy: rand(10, 60), size: 1.7, life: 0.5, color: '255,90,120' });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 120);
    gr.addColorStop(0, 'rgba(255,110,140,0.7)');
    gr.addColorStop(1, 'rgba(255,60,100,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 6, this.y + 6);
    ctx.lineTo(this.x + 6, this.y + 6);
    ctx.lineTo(this.x + 0.8, this.y + 120);
    ctx.lineTo(this.x - 0.8, this.y + 120);
    ctx.closePath();
    ctx.fill();
    drawSprite(ctx, glowSprite(RUBY.rgb), this.x, this.y + 4, 56, 0.6);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y + 14);
    ctx.scale(0.55 + 0.45 * Math.abs(Math.cos(this.age * 10)), 1);
    drawShardBolt(ctx, 32, 13, RUBY);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(8, 'rgba(255,200,215,');
    g.hitStop(0.05);
    g.shake(7);
    g.addFX(new RadialFlash(hx, hy, ['255,70,100', '255,200,215', '255,255,255', '230,40,80'], 0.18, 110, 16));
    g.addFX(new Rays(hx, hy, '255,150,175', 0.4, 12, Math.PI / 2, Math.PI * 0.9, 0.9));
    g.addFX(new Light(hx, hy, 210, '255,70,100', 0.85, 0.34));
    S.glow(ps, hx, hy, 130, 18, '255,225,232', 0.22, 1);
    S.ring(ps, hx, hy, 4, 84, '255,90,120', 4, 0.36, true);
    S.gemShards(ps, hx, hy, 18, Math.PI / 2, 1.6, [160, 560], RUBY);
    S.stars(ps, hx, hy, 10, '255,170,190', [80, 260], [9, 16], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [200, 620], '255,110,140', 1.5);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    const p = loc(g, theta, 0.92);
    glowPaint(g, p, '255,70,100', 20, 0.4);
    woodCracks(g, theta, 5, [14, 32], '255,80,110', 1.4);
    g.addWheelFX(new GlowSpot(p.x, p.y, 58, '255,70,100', 1.2, 0.7));
    g.landed(makeItem('ruby', theta, 0.075, 20, false), 0.25);
    sfx.play('ruby_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new RadialFlash(hx, hy, ['255,70,100', '255,200,215', '255,255,255'], 0.16, 90, 14));
    S.gemShards(ps, hx, hy, 14, Math.PI / 2, 1.6, [140, 480], RUBY);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.5, [180, 540], '255,110,140', 1.4);
    sfx.play('ruby_hit');
    this.alive = false;
  }
}

// ───────────────────────── EMERALD BEAM ─────────────────────────
export class EmeraldBeam extends Projectile {
  weapon = 'emerald' as const;
  tip = 0;
  half = 0.07;
  life = 0.55;
  fired = false;
  endY: number;
  mode: 'none' | 'hit' | 'block' = 'none';
  ox: number;
  oy: number;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -100);
    this.ox = x;
    this.oy = y;
    this.endY = g.wheel.y + g.wheel.R;
  }
  update(dt: number) {
    this.age += dt;
    const g = this.g;
    const w = g.wheel;
    const ps = g.particles;
    if (!this.fired) {
      this.fired = true;
      const bottom = w.y + w.bumpY + w.R;
      this.endY = bottom;
      g.collide(this, this.y, bottom - 3);
      if (this.mode === 'none') this.endY = -40;
    }
    const top = this.oy;
    const bot = this.endY;
    if (this.age < this.life - 0.12 && top - bot > 10) {
      for (let i = 0; i < 2; i++) {
        const yy = rand(bot, top);
        ps.add({ k: K.STAR, add: true, x: this.ox + rand(-9, 9), y: yy, vx: rand(-30, 30), vy: rand(-20, 40), size: rand(7, 14), life: rand(0.3, 0.6), color: pick(['190,255,215', '90,255,160', '255,255,255']), drag: 2 });
      }
      if (Math.random() < 0.4) S.sparks(ps, this.ox + rand(-6, 6), rand(bot, top), 1, rand(0, TAU), 0.3, [60, 200], '120,255,180', 1.2, 0, 0.03);
    }
    if (this.mode === 'hit' && !g.wheelGone && this.age < this.life - 0.12) {
      S.sparks(ps, this.ox, bot, 1, Math.PI / 2, 1.5, [100, 340], '150,255,200', 1.3);
      if (Math.random() < dt * 24) S.gemShards(ps, this.ox, bot, 1, Math.PI / 2, 1.4, [80, 260], EMERALD);
    }
    if (this.age > this.life) this.alive = false;
  }
  draw(ctx: Ctx) {
    const y0 = this.oy;
    const y1 = this.endY;
    const L = y0 - y1;
    if (L < 2) return;
    const grow = Math.min(1, this.age / 0.06);
    const fade = this.age > this.life - 0.16 ? Math.max(0, (this.life - this.age) / 0.16) : 1;
    const s = grow * fade * (0.93 + 0.07 * Math.sin(this.age * 70));
    const x = this.ox;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const [w, col] of [
      [34, 'rgba(30,220,120,0.12)'],
      [18, 'rgba(60,240,150,0.3)'],
      [9, 'rgba(150,255,200,0.66)'],
      [3.6, 'rgba(240,255,248,0.97)'],
    ] as [number, string][]) {
      const n = 26;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const yy = y0 - (i / n) * L;
        const ww = w * 0.5 * s * (1 + 0.14 * Math.sin(yy * 0.08 - this.age * 55));
        if (i === 0) ctx.moveTo(x - ww, yy);
        else ctx.lineTo(x - ww, yy);
      }
      for (let i = n; i >= 0; i--) {
        const yy = y0 - (i / n) * L;
        const ww = w * 0.5 * s * (1 + 0.14 * Math.sin(yy * 0.08 - this.age * 55));
        ctx.lineTo(x + ww, yy);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.fill();
    }
    ctx.strokeStyle = `rgba(220,255,235,${0.8 * s})`;
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 6; i++) {
      const yy = y0 - ((this.age * 900 + (i * L) / 6) % L);
      ctx.beginPath();
      ctx.moveTo(x, yy - 7);
      ctx.lineTo(x + 6, yy);
      ctx.lineTo(x, yy + 7);
      ctx.lineTo(x - 6, yy);
      ctx.closePath();
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('60,255,150'), x, y0 - 2, 130 * s, 0.9 * s);
    drawSprite(ctx, glowSprite('240,255,245'), x, y0 - 2, 44 * s, s);
    if (this.mode !== 'none') {
      drawSprite(ctx, glowSprite('100,255,170'), x, y1, 130 * s, 0.9 * s);
      drawSprite(ctx, glowSprite('255,255,255'), x, y1, 44 * s, s);
    }
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    const R = g.wheel.R;
    this.mode = 'hit';
    this.endY = hy;
    g.wheelImpact(7, 'rgba(200,255,225,');
    g.hitStop(0.05);
    g.shake(7);
    g.flashScreen('120,255,180', 0.14);
    g.addFX(new RadialFlash(hx, hy, ['60,255,150', '200,255,225', '255,255,255', '30,200,110'], 0.2, 120, 18));
    g.addFX(new Light(hx, hy, 250, '60,255,150', 0.9, 0.45));
    S.glow(ps, hx, hy, 150, 20, '220,255,235', 0.26, 1);
    S.ring(ps, hx, hy, 5, 100, '90,255,170', 5, 0.4, true);
    S.gemShards(ps, hx, hy, 16, Math.PI / 2, 1.6, [140, 520], EMERALD);
    S.stars(ps, hx, hy, 12, '170,255,205', [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 22, Math.PI / 2, 1.6, [200, 600], '120,255,180', 1.5);
    const p = loc(g, theta, 0.94);
    const cracks = makeCracks(theta, R, 6, [18, 40], 1.2);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
      rg.addColorStop(0, 'rgba(6,20,12,0.9)');
      rg.addColorStop(1, 'rgba(20,50,30,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 14, 0, TAU);
      c.fill();
      strokeLines(c, cracks, 'rgba(8,24,14,0.9)', 1.3);
    });
    g.addWheelFX(new GlowLines(cracks, '90,255,170', 1.3, 1.8));
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '60,255,150', 1.6, 0.85));
    g.landed(makeItem('emerald', theta, 0.08, 40, false), 0.6);
    sfx.play('emerald_hit');
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.mode = 'block';
    this.endY = hy;
    g.addFX(new RadialFlash(hx, hy, ['60,255,150', '200,255,225', '255,255,255'], 0.18, 100, 14));
    g.addFX(new Light(hx, hy, 210, '60,255,150', 0.8, 0.35));
    S.gemShards(ps, hx, hy, 14, Math.PI / 2, 1.6, [140, 480], EMERALD);
    S.ring(ps, hx, hy, 4, 80, '90,255,170', 4, 0.34, true);
    sfx.play('emerald_hit');
  }
}

// ───────────────────────── SAPPHIRE SHOTGUN ─────────────────────────
interface Pel {
  x: number;
  y: number;
  vx: number;
  vy: number;
  px: number;
  py: number;
  done: boolean;
}
function segCircle(x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  if (c < 0) return 0;
  const disc = b * b - 4 * a * c;
  if (disc < 0 || a === 0) return -1;
  const t = (-b - Math.sqrt(disc)) / (2 * a);
  return t >= 0 && t <= 1 ? t : -1;
}

export class SapphireBlast extends Projectile {
  weapon = 'sapphire' as const;
  tip = 0;
  half = 0.15;
  pellets: Pel[] = [];
  outcome: 'none' | 'hit' | 'block' = 'none';
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -2200);
    const n = 7;
    for (let i = 0; i < n; i++) {
      const ang = -Math.PI / 2 + (i - (n - 1) / 2) * 0.036 + rand(-0.01, 0.01);
      const sp = 2200 * rand(0.92, 1.05);
      this.pellets.push({ x: x + rand(-2, 2), y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, px: x, py: y, done: false });
    }
  }
  update(dt: number) {
    this.age += dt;
    const g = this.g;
    const prev = this.y - this.tip;
    this.y += this.vy * dt;
    if (this.outcome === 'none' && !this.resolved) g.collide(this, prev, this.y - this.tip);
    const w = g.wheel;
    const cx = w.x;
    const cy = w.y + w.bumpY;
    let all = true;
    for (const p of this.pellets) {
      if (p.done) continue;
      all = false;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (this.outcome !== 'none' && !g.wheelGone) {
        const t = segCircle(p.px, p.py, p.x, p.y, cx, cy, w.R);
        if (t >= 0) {
          p.done = true;
          this.pelletImpact(p.px + (p.x - p.px) * t, p.py + (p.y - p.py) * t);
          continue;
        }
      }
      if (p.y < -40) p.done = true;
    }
    if (all) this.alive = false;
  }
  pelletImpact(ix: number, iy: number) {
    const g = this.g;
    const ps = g.particles;
    const w = g.wheel;
    const cy = w.y + w.bumpY;
    const out = Math.atan2(iy - cy, ix - w.x);
    if (this.outcome === 'block') {
      S.sparks(ps, ix, iy, 6, out, 0.9, [200, 500], '140,190,255', 1.4);
      S.glow(ps, ix, iy, 22, 4, '170,210,255', 0.1, 1);
      return;
    }
    const local = out - w.angle;
    const depth = rand(3, 8);
    const lx = Math.cos(local) * (w.R - depth);
    const ly = Math.sin(local) * (w.R - depth);
    g.paint((c) => {
      const rg = c.createRadialGradient(lx, ly, 0, lx, ly, 7);
      rg.addColorStop(0, 'rgba(10,18,50,0.8)');
      rg.addColorStop(1, 'rgba(10,18,50,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(lx, ly, 7, 0, TAU);
      c.fill();
      c.fillStyle = '#060a1e';
      c.beginPath();
      c.arc(lx, ly, 2.3, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(130,180,255,0.8)';
      c.lineWidth = 0.7;
      c.stroke();
    });
    g.addWheelFX(new GlowSpot(lx, ly, 18, '90,160,255', 1.4, 0.95));
    S.glow(ps, ix, iy, 30, 6, '170,205,255', 0.1, 1);
    S.sparks(ps, ix, iy, 4, out, 0.9, [160, 440], '120,170,255', 1.2);
    S.gemShards(ps, ix, iy, 2, out, 1, [100, 300], SAPPHIRE);
    S.splinters(ps, ix, iy, 2, out, 1, [100, 300]);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    this.outcome = 'hit';
    this.resolved = true;
    g.wheelImpact(11, 'rgba(200,220,255,');
    g.hitStop(0.06);
    g.shake(8);
    g.addFX(new Light(hx, hy, 210, '90,160,255', 0.7, 0.3));
    S.chips(ps, hx, hy, 16, Math.PI / 2, 1.5, [140, 460]);
    S.splinters(ps, hx, hy, 10, Math.PI / 2, 1.5, [200, 500]);
    S.gemShards(ps, hx, hy, 12, Math.PI / 2, 1.6, [160, 520], SAPPHIRE);
    S.smoke(ps, hx, hy, 6, '150,160,190', [10, 44], { vx: [-90, 90], vy: [-20, 60], alpha: 0.4, life: [0.7, 1.1] });
    g.landed(makeItem('sapphire', theta, 0.13, 7, false), 0.25);
    sfx.play('sapphire_hit');
  }
  block(hx: number, hy: number) {
    this.outcome = 'block';
    this.resolved = true;
    S.sparks(this.g.particles, hx, hy, 24, Math.PI / 2, 1.3, [250, 650], '150,195,255', 1.5);
    S.glow(this.g.particles, hx, hy, 70, 10, '170,210,255', 0.16, 1);
    sfx.play('ricochet');
  }
  draw(ctx: Ctx) {
    for (const p of this.pellets) {
      if (p.done) continue;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const tx = p.x - p.vx * 0.018;
      const ty = p.y - p.vy * 0.018;
      ctx.strokeStyle = 'rgba(90,150,255,0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(210,230,255,0.95)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.01, p.y - p.vy * 0.01);
      ctx.stroke();
      drawSprite(ctx, glowSprite(SAPPHIRE.rgb), p.x, p.y, 20, 0.8);
      ctx.restore();
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(p.vy, p.vx) + Math.PI / 2);
      drawShardBolt(ctx, 15, 6, SAPPHIRE);
      ctx.restore();
    }
  }
}

// ───────────────────────── CRYSTAL CANNON ─────────────────────────
export class CrystalShot extends Projectile {
  weapon = 'crystal' as const;
  tip = 24;
  half = 0.12;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -820);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.stars(ps, this.x + rand(-12, 12), this.y + rand(8, 50), 1, pick(['225,175,255', '195,120,255', '255,255,255']), [10, 70], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.6) ps.add({ k: K.EMBER, add: true, x: this.x + rand(-12, 12), y: this.y + rand(8, 40), vx: rand(-30, 30), vy: rand(10, 60), size: 1.8, life: 0.6, color: '210,150,255' });
    if (Math.random() < 0.4) ps.add({ k: K.SMOKE, x: this.x + rand(-8, 8), y: this.y + rand(20, 44), vx: rand(-16, 16), vy: rand(10, 40), size: 8, size2: 28, life: 0.6, color: '170,110,230', alpha: 0.3, rot: rand(0, TAU) });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    drawSprite(ctx, glowSprite(AMETHYST.rgb), this.x, this.y + 14, 110, 0.5);
    ctx.restore();
    for (let k = 0; k < 3; k++) {
      const a = this.age * 5 + (k * TAU) / 3;
      ctx.save();
      ctx.translate(this.x + Math.cos(a) * 24, this.y + 14 + Math.sin(a) * 10);
      ctx.rotate(a);
      drawShardBolt(ctx, 14, 6, AMETHYST);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(this.x, this.y + 14);
    ctx.scale(0.5 + 0.5 * Math.abs(Math.cos(this.age * 4)), 1);
    drawShardBolt(ctx, 46, 20, AMETHYST);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(10, 'rgba(230,200,255,');
    g.hitStop(0.07);
    g.shake(9);
    g.addFX(new RadialFlash(hx, hy, ['195,120,255', '240,215,255', '255,255,255', '150,80,230'], 0.2, 130, 18));
    g.addFX(new Light(hx, hy, 250, '180,100,255', 0.85, 0.4));
    g.addFX(new Rays(hx, hy, '215,170,255', 0.45, 14, Math.PI / 2, Math.PI * 0.9, 1));
    S.glow(ps, hx, hy, 160, 22, '235,215,255', 0.26, 1);
    S.ring(ps, hx, hy, 5, 100, '190,120,255', 5, 0.42, true);
    S.ring(ps, hx, hy, 4, 66, '255,255,255', 3, 0.28, true);
    S.gemShards(ps, hx, hy, 28, Math.PI / 2, 1.7, [160, 600], AMETHYST);
    S.stars(ps, hx, hy, 12, '225,180,255', [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [200, 620], '210,150,255', 1.5);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 340]);
    const p = loc(g, theta, 0.92);
    glowPaint(g, p, '195,120,255', 24, 0.45);
    woodCracks(g, theta, 5, [14, 32], '195,120,255', 1.4);
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '190,110,255', 1.5, 0.8));
    g.landed(makeItem('crystal', theta, 0.11, 36, false), 0.6);
    sfx.play('crystal_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new RadialFlash(hx, hy, ['195,120,255', '240,215,255', '255,255,255'], 0.18, 100, 14));
    g.addFX(new Light(hx, hy, 220, '180,100,255', 0.8, 0.35));
    S.gemShards(ps, hx, hy, 22, Math.PI / 2, 1.6, [140, 520], AMETHYST);
    S.ring(ps, hx, hy, 4, 80, '190,120,255', 4, 0.34, true);
    sfx.play('crystal_hit');
    this.alive = false;
  }
}

// ───────────────────────── BEE STINGER ─────────────────────────
export class BeeRifleShot extends Projectile {
  weapon = 'beerifle' as const;
  tip = 0;
  half = 0.065;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1700);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.7) S.sparks(ps, this.x + rand(-5, 5), this.y + rand(20, 60), 1, Math.PI / 2, 1.2, [30, 130], '255,215,80', 1.3, 0, 0.03);
    if (Math.random() < 0.5) S.stars(ps, this.x + rand(-8, 8), this.y + rand(20, 70), 1, pick(['255,235,140', '255,210,70']), [10, 50], [5, 10], Math.PI / 2, 1.4);
    if (Math.random() < 0.18) S.hexes(ps, this.x + rand(-6, 6), this.y + rand(30, 60), 1, Math.PI / 2, 1.2, [20, 80]);
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y + 20, 0, this.y + 130);
    gr.addColorStop(0, 'rgba(255,215,80,0.5)');
    gr.addColorStop(1, 'rgba(255,200,60,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(this.x - 4, this.y + 20, 8, 110);
    drawSprite(ctx, glowSprite('255,210,70'), this.x, this.y + 20, 70, 0.4);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.age * 40) * 0.025);
    drawStinger(ctx, 46);
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const a = this.age * 11 + (i * TAU) / 3;
      ctx.save();
      ctx.translate(this.x + Math.cos(a) * 18, this.y + 36 + Math.sin(a) * 12);
      ctx.rotate(Math.cos(a) * 0.5);
      drawBee(ctx, 0.7, Math.sin(this.age * 70 + i));
      ctx.restore();
    }
  }
  private swarm(hx: number, hy: number, n: number) {
    const ps = this.g.particles;
    S.bees(ps, hx, hy, n, Math.PI / 2, 1.7, [160, 440]);
    S.bees(ps, hx, hy, Math.round(n * 0.6), -Math.PI / 2, 1.2, [120, 320]);
    ps.add({ k: K.TEXT, x: hx, y: hy + 52, vy: -40, drag: 1.5, size: 26, text: 'BZZT!', color: '255,220,60', life: 0.85 });
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(8, 'rgba(255,235,150,');
    g.hitStop(0.05);
    g.shake(6);
    g.addFX(new Light(hx, hy, 190, '255,210,70', 0.65, 0.3));
    S.glow(ps, hx, hy, 110, 16, '255,240,170', 0.2, 0.9);
    this.swarm(hx, hy, 12);
    S.goo(ps, hx - 3, hy, 8, Math.PI - 0.3, 0.6, [160, 380], [1.6, 3], '255,184,30', '150,80,0');
    S.goo(ps, hx + 3, hy, 8, 0.3, 0.6, [160, 380], [1.6, 3], '255,184,30', '150,80,0');
    S.hexes(ps, hx, hy, 10, Math.PI / 2, 1.6, [100, 320]);
    S.stars(ps, hx, hy, 8, '255,230,130', [80, 240], [8, 14], Math.PI / 2, 1.6);
    S.ring(ps, hx, hy, 4, 66, '255,215,90', 3.5, 0.32, true);
    S.splinters(ps, hx, hy, 8, Math.PI / 2, 1.4, [120, 360]);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.4, [100, 320]);
    const p = loc(g, theta, 0.92);
    glowPaint(g, p, '255,200,60', 16, 0.35);
    woodCracks(g, theta, 3, [8, 20], '255,210,70', 0.8);
    g.addDecal({ kind: 'goo', angle: theta, t: 0, seed: rand(0, 10), blob: randomPoly(9, 1, 0.4), next: 0.4, c: ['rgba(150,70,0,0.92)', 'rgba(255,176,30,0.96)', 'rgba(255,226,120,0.95)'], drip: '255,184,30', dripData: '150,80,0' });
    g.landed(makeItem('beerifle', theta, 0.065, 40, false, { wob: 0.3 }), 0.3);
    sfx.play('beerifle_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    this.swarm(hx, hy, 10);
    S.goo(g.particles, hx, hy, 12, Math.PI / 2, 1.4, [120, 360], [1.4, 3], '255,184,30', '150,80,0');
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, -4);
      drawStinger(c, 46);
    });
    sfx.play('beerifle_hit');
    this.alive = false;
  }
}

// ───────────────────────── CHARGE BLASTER (Mega Buster) ─────────────────────────
export class ChargeShot extends Projectile {
  weapon = 'charge' as const;
  tip = 16;
  half = 0.12;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1550);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.sparks(ps, this.x + rand(-10, 10), this.y + rand(8, 40), 1, Math.PI / 2, 1.2, [40, 180], '150,230,255', 1.4, 0, 0.03);
    if (Math.random() < 0.5) S.stars(ps, this.x + rand(-10, 10), this.y + rand(8, 50), 1, pick(['190,245,255', '255,255,255']), [10, 60], [6, 12], Math.PI / 2, 1.4);
    if (Math.random() < 0.5) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-5, 5), y: this.y + rand(8, 28), vx: rand(-14, 14), vy: rand(20, 60), size: rand(18, 30), size2: 3, color: '70,200,255', life: 0.28, alpha: 0.6 });
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y, 0, this.y + 140);
    gr.addColorStop(0, 'rgba(160,235,255,0.7)');
    gr.addColorStop(1, 'rgba(60,180,255,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.moveTo(this.x - 14, this.y + 6);
    ctx.lineTo(this.x + 14, this.y + 6);
    ctx.lineTo(this.x + 2, this.y + 140);
    ctx.lineTo(this.x - 2, this.y + 140);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    drawChargeOrb(ctx, this.x, this.y, 14, this.age, 1.1);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(12, 'rgba(200,245,255,');
    g.hitStop(0.08);
    g.shake(11);
    g.flashScreen('140,225,255', 0.16);
    g.addFX(new ComicPop(hx, hy + 60, 'BLAST!', '#e8fbff', '#3ac0ff', '#06326e', 1.05, 0.55));
    g.addFX(new RadialFlash(hx, hy, ['60,200,255', '210,248,255', '255,255,255', '30,140,240'], 0.2, 130, 20));
    g.addFX(new Light(hx, hy, 300, '70,200,255', 0.95, 0.45));
    g.addFX(new Rays(hx, hy, '160,235,255', 0.45, 12, Math.PI / 2, Math.PI * 0.9, 1));
    S.glow(ps, hx, hy, 200, 28, '225,250,255', 0.28, 1);
    S.ring(ps, hx, hy, 6, 150, '80,205,255', 8, 0.45, true);
    S.ring(ps, hx, hy, 4, 100, '255,255,255', 3.5, 0.3, true);
    S.ring(ps, hx, hy, 3, 64, '40,150,240', 5, 0.24, true);
    S.sparks(ps, hx, hy, 40, Math.PI / 2, 1.7, [220, 720], '140,230,255', 1.7);
    S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.5, [300, 700], '255,255,255', 1.2);
    S.stars(ps, hx, hy, 12, '190,240,255', [80, 280], [9, 17], Math.PI / 2, 1.7);
    S.chips(ps, hx, hy, 12, Math.PI / 2, 1.5, [140, 440]);
    S.smoke(ps, hx, hy, 6, '120,150,190', [14, 54], { vx: [-90, 90], vy: [-40, 60], alpha: 0.35, life: [0.7, 1.1] });
    crater(g, theta, 0.8, '80,200,255', 1.6);
    g.landed(makeItem('charge', theta, 0.12, 9, false), 0.3);
    sfx.play('charge_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.flashScreen('140,225,255', 0.14);
    g.addFX(new RadialFlash(hx, hy, ['60,200,255', '210,248,255', '255,255,255'], 0.18, 100, 14));
    g.addFX(new Light(hx, hy, 240, '70,200,255', 0.85, 0.35));
    S.ring(ps, hx, hy, 5, 110, '80,205,255', 6, 0.38, true);
    S.sparks(ps, hx, hy, 32, Math.PI / 2, 1.6, [200, 620], '140,230,255', 1.5);
    sfx.play('charge_hit');
    this.alive = false;
  }
}

// ───────────────────────── PULSE RIFLE ─────────────────────────
export class PulseShot extends Projectile {
  weapon = 'pulse' as const;
  tip = 22;
  half = 0.07;
  ringT = 0;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1900);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    this.ringT += dt;
    if (this.ringT > 0.035) {
      this.ringT = 0;
      S.ring(ps, this.x, this.y + 30, 3, 22, '110,225,255', 1.6, 0.26, true, 0.6);
    }
    if (Math.random() < 0.6) S.sparks(ps, this.x + rand(-6, 6), this.y + rand(10, 50), 1, Math.PI / 2, 1.2, [30, 120], '120,230,255', 1.2, 0, 0.03);
  }
  draw(ctx: Ctx) {
    drawBlasterBolt(ctx, this.x, this.y, 48, 2.8, '70,215,255');
    drawBlasterBolt(ctx, this.x, this.y + 74, 36, 2.1, '70,215,255');
    drawBlasterBolt(ctx, this.x, this.y + 134, 26, 1.6, '70,215,255');
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(6, 'rgba(200,245,255,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new Light(hx, hy, 220, '70,215,255', 0.8, 0.4));
    for (let k = 0; k < 3; k++)
      g.after(k * 0.07, () => {
        S.ring(ps, hx, hy, 4, 70 + k * 18, k === 1 ? '255,255,255' : '90,220,255', 4 - k * 0.8, 0.32, true);
        S.sparks(ps, hx, hy, 12, Math.PI / 2, 1.6, [180, 520], '130,230,255', 1.4);
        S.glow(ps, hx, hy, 90 - k * 10, 12, '200,245,255', 0.14, 0.9);
        g.shake(3);
        if (k > 0) g.wheelImpact(2.5, 'rgba(200,245,255,');
      });
    S.stars(ps, hx, hy, 8, '190,240,255', [80, 240], [8, 14], Math.PI / 2, 1.6);
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 320]);
    const p = loc(g, theta, 0.94);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 11);
      rg.addColorStop(0, 'rgba(8,16,24,0.9)');
      rg.addColorStop(1, 'rgba(20,40,60,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 11, 0, TAU);
      c.fill();
      for (const r of [4, 7.5, 11]) {
        c.strokeStyle = `rgba(100,220,255,${0.7 - r * 0.04})`;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(p.x, p.y, r, 0, TAU);
        c.stroke();
      }
    });
    g.addWheelFX(new GlowSpot(p.x, p.y, 40, '70,215,255', 1.2, 0.9));
    woodCracks(g, theta, 3, [8, 18], '90,220,255', 0.9);
    g.landed(makeItem('pulse', theta, 0.07, 8, false), 0.4);
    sfx.play('pulse_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new Light(hx, hy, 200, '70,215,255', 0.75, 0.3));
    S.ring(ps, hx, hy, 4, 80, '90,220,255', 4, 0.3, true);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.5, [180, 560], '130,230,255', 1.4);
    sfx.play('pulse_hit');
    this.alive = false;
  }
}

// ───────────────────────── CRYO ICICLE ─────────────────────────
export class CryoShot extends Projectile {
  weapon = 'cryo' as const;
  tip = 0;
  half = 0.075;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -1000);
  }
  trail(dt: number) {
    const ps = this.g.particles;
    for (let i = 0, n = this.cosmeticTicks(dt); i < n; i++) {
      if (Math.random() < 0.7) ps.add({ k: K.SMOKE, x: this.x + rand(-6, 6), y: this.y + rand(24, 60), vx: rand(-20, 20), vy: rand(10, 50), size: 9, size2: 32, life: rand(0.5, 0.9), color: '215,242,255', alpha: 0.4, rot: rand(0, TAU), vrot: rand(-1, 1) });
      if (Math.random() < 0.5) S.stars(ps, this.x + rand(-8, 8), this.y + rand(10, 60), 1, pick(['200,245,255', '255,255,255', '140,215,255']), [10, 50], [6, 11], Math.PI / 2, 1.4);
      if (Math.random() < 0.3) S.snowflakes(ps, this.x + rand(-8, 8), this.y + rand(20, 50), 1, Math.PI / 2, 1.4, [10, 50]);
    }
  }
  draw(ctx: Ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createLinearGradient(0, this.y + 20, 0, this.y + 120);
    gr.addColorStop(0, 'rgba(190,240,255,0.5)');
    gr.addColorStop(1, 'rgba(120,210,255,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(this.x - 6, this.y + 20, 12, 100);
    drawSprite(ctx, glowSprite('130,225,255'), this.x, this.y + 20, 76, 0.45);
    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.age * 18) * 0.04);
    drawIcicle(ctx, 54, 15);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(8, 'rgba(215,245,255,');
    g.hitStop(0.05);
    g.shake(7);
    g.addFX(new FrostBloom(hx, hy, 0.75, 0.85));
    g.addFX(new Light(hx, hy, 220, '110,215,255', 0.8, 0.4));
    S.glow(ps, hx, hy, 140, 18, '225,250,255', 0.24, 1);
    S.ring(ps, hx, hy, 5, 90, '150,230,255', 4, 0.4, true);
    S.crystalShards(ps, hx, hy, 18, Math.PI / 2, 1.6, [140, 520]);
    S.snowChunks(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 360]);
    S.snowflakes(ps, hx, hy, 12, Math.PI / 2, 1.7, [60, 240]);
    S.stars(ps, hx, hy, 10, '210,246,255', [80, 260], [9, 16], Math.PI / 2, 1.7);
    S.smoke(ps, hx, hy, 7, '220,244,255', [14, 54], { vx: [-90, 90], vy: [-30, 50], alpha: 0.4, life: [0.8, 1.3] });
    const p = loc(g, theta, 0.9);
    const cr = makeCracks(theta, g.wheel.R, 6, [12, 26], 1.5);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20);
      rg.addColorStop(0, 'rgba(235,250,255,0.8)');
      rg.addColorStop(0.6, 'rgba(180,230,250,0.45)');
      rg.addColorStop(1, 'rgba(160,220,250,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 20, 0, TAU);
      c.fill();
      strokeLines(c, cr, 'rgba(120,200,245,0.7)', 1.6);
      strokeLines(c, cr, 'rgba(255,255,255,0.95)', 0.6);
    });
    g.addWheelFX(new GlowSpot(p.x, p.y, 64, '130,225,255', 1.2, 0.75));
    g.landed(makeItem('cryo', theta, 0.09, 32, false), 0.4);
    sfx.play('cryo_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new FrostBloom(hx, hy, 0.55, 0.7));
    g.addFX(new Light(hx, hy, 200, '110,215,255', 0.75, 0.3));
    S.crystalShards(ps, hx, hy, 14, Math.PI / 2, 1.6, [140, 480]);
    S.snowflakes(ps, hx, hy, 10, Math.PI / 2, 1.7, [60, 220]);
    fallingCustom(g, hx, hy, (c) => {
      c.translate(0, -10);
      drawIcicle(c, 54, 15);
    });
    sfx.play('cryo_hit');
    this.alive = false;
  }
}

// ───────────────────────── HYPERDRIVE STREAK ─────────────────────────
export class HyperShot extends Projectile {
  weapon = 'hyperdrive' as const;
  tip = 0;
  half = 0.075;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -2300);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.8) S.stars(ps, this.x + rand(-12, 12), this.y + rand(20, 160), 1, pick(['200,225,255', '255,255,255', '130,180,255']), [10, 60], [5, 11], Math.PI / 2, 1.4);
    if (Math.random() < 0.6) S.sparks(ps, this.x + rand(-10, 10), this.y + rand(10, 120), 1, rand(0, TAU), 0.3, [60, 200], '170,205,255', 1.2, 0, 0.03);
  }
  draw(ctx: Ctx) {
    drawBlasterBolt(ctx, this.x, this.y, 210, 3.6, '130,180,255');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 5; k++) {
      const ph = (this.age * 6 + k / 5) % 1;
      ctx.strokeStyle = `rgba(200,225,255,${0.75 * (1 - ph)})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y + 14 + ph * 170, 6 + ph * 14, 2 + ph * 4, 0, 0, TAU);
      ctx.stroke();
    }
    drawSprite(ctx, glowSprite('255,255,255'), this.x, this.y, 30, 0.9);
    ctx.restore();
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(9, 'rgba(210,225,255,');
    g.hitStop(0.06);
    g.shake(9);
    g.flashScreen('190,215,255', 0.18);
    g.pulseWheel(0.1);
    g.after(0.12, () => g.pulseWheel(-0.06));
    g.addFX(new WarpLines(hx, hy + 4, 0.42, 1.2));
    g.addFX(new RadialFlash(hx, hy, ['130,180,255', '230,240,255', '255,255,255'], 0.18, 120, 18));
    g.addFX(new Light(hx, hy, 280, '120,170,255', 0.95, 0.45));
    g.addFX(new ComicPop(hx, hy + 56, 'ZOOM!', '#eaf2ff', '#6a9cff', '#102a70', 1.0, 0.5));
    S.glow(ps, hx, hy, 190, 26, '230,240,255', 0.28, 1);
    S.ring(ps, hx, hy, 6, 150, '130,180,255', 7, 0.45, true);
    S.ring(ps, hx, hy, 4, 100, '255,255,255', 3, 0.3, true);
    S.sparks(ps, hx, hy, 36, Math.PI / 2, 1.7, [260, 800], '170,205,255', 1.6);
    S.stars(ps, hx, hy, 12, '210,228,255', [80, 280], [9, 16], Math.PI / 2, 1.7);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [140, 440]);
    const p = loc(g, theta, 0.93);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.rotate(theta);
      c.lineCap = 'round';
      for (let i = 0; i < 9; i++) {
        const a = rand(-1.2, 1.2);
        c.strokeStyle = `rgba(${i % 2 ? '190,215,255' : '120,170,255'},0.65)`;
        c.lineWidth = rand(0.8, 1.8);
        c.beginPath();
        c.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
        c.lineTo(Math.cos(a + Math.PI) * rand(10, 26), Math.sin(a + Math.PI) * rand(10, 26));
        c.stroke();
      }
      c.restore();
    });
    glowPaint(g, p, '130,180,255', 22, 0.4);
    g.landed(makeItem('hyperdrive', theta, 0.075, 12, false), 0.35);
    sfx.play('hyper_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new WarpLines(hx, hy + 4, 0.34, 1));
    g.addFX(new Light(hx, hy, 230, '120,170,255', 0.85, 0.35));
    S.ring(ps, hx, hy, 5, 110, '130,180,255', 5, 0.34, true);
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.6, [220, 700], '170,205,255', 1.5);
    sfx.play('hyper_hit');
    this.alive = false;
  }
}

// ───────────────────────── QUANTUM ORB ─────────────────────────
export class QuantumShot extends Projectile {
  weapon = 'quantum' as const;
  tip = 13;
  half = 0.11;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -900);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.5) S.glitchBits(ps, this.x, this.y + 20, 1, 20);
    if (Math.random() < 0.7) S.sparks(ps, this.x + rand(-10, 10), this.y + rand(6, 36), 1, Math.PI / 2, 1.3, [40, 160], pick(['210,140,255', '120,230,255', '255,120,230']), 1.3, 0, 0.03);
    if (Math.random() < 0.4) ps.add({ k: K.GLOW, add: true, x: this.x + rand(-6, 6), y: this.y + rand(8, 28), vx: rand(-14, 14), vy: rand(20, 60), size: rand(16, 28), size2: 3, color: '170,80,255', life: 0.28, alpha: 0.55 });
  }
  draw(ctx: Ctx) {
    const t = this.age;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i <= 3; i++) {
      const ox = Math.sin(t * 30 + i * 2.1) * 14;
      const oy = i * 24;
      const flick = Math.sin(t * 40 + i * 5) > -0.3 ? 1 : 0.2;
      drawSprite(ctx, glowSprite(i % 2 ? '110,230,255' : '255,110,230'), this.x + ox, this.y + oy, 56, 0.4 * flick);
      ctx.strokeStyle = `rgba(${i % 2 ? '150,235,255' : '255,160,235'},${0.7 * flick})`;
      ctx.lineWidth = 1.6;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(this.x + ox, this.y + oy, 12, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    drawQuantumOrb(ctx, this.x + Math.sin(t * 50) * 1.6, this.y, 13, t, 1.15);
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(9, 'rgba(230,200,255,');
    g.hitStop(0.07);
    g.shake(9);
    g.flashScreen('190,110,255', 0.16);
    g.wheel.shakeT = 0.5;
    g.pulseWheel(0.07);
    g.after(0.08, () => g.pulseWheel(-0.08));
    g.after(0.17, () => g.pulseWheel(0.05));
    g.addFX(new GlitchBurst(hx, hy, 0.6, 1.1));
    g.addFX(new Light(hx, hy, 260, '170,80,255', 0.9, 0.45));
    S.glow(ps, hx, hy, 170, 22, '235,210,255', 0.26, 1);
    S.ring(ps, hx, hy, 5, 110, '190,110,255', 6, 0.42, true);
    S.ring(ps, hx, hy, 4, 78, '120,230,255', 3.5, 0.34, true);
    S.ring(ps, hx, hy, 3, 54, '255,110,230', 3, 0.28, true);
    S.glitchBits(ps, hx, hy, 34, 60);
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.7, [200, 640], '210,150,255', 1.6);
    S.stars(ps, hx, hy, 10, '225,185,255', [80, 260], [9, 16], Math.PI / 2, 1.7);
    S.chips(ps, hx, hy, 10, Math.PI / 2, 1.5, [120, 380]);
    const p = loc(g, theta, 0.9);
    glowPaint(g, p, '170,80,255', 26, 0.42);
    g.paint((c) => {
      c.save();
      c.translate(p.x, p.y);
      c.lineCap = 'round';
      for (let k = 0; k < 2; k++) {
        c.strokeStyle = `rgba(${k ? '120,230,255' : '210,140,255'},0.75)`;
        c.lineWidth = 1.4;
        c.beginPath();
        for (let j = 0; j <= 26; j++) {
          const u = j / 26;
          const a = k * Math.PI + u * 6;
          const r = 18 * (1 - u);
          if (j === 0) c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        c.stroke();
      }
      for (let i = 0; i < 12; i++) {
        c.fillStyle = `rgba(${pick(['190,90,255', '90,230,255', '255,90,220'])},0.7)`;
        c.fillRect(rand(-22, 22), rand(-16, 16), rand(3, 11), rand(1.4, 3.4));
      }
      c.restore();
    });
    g.addWheelFX(new GlowSpot(p.x, p.y, 70, '170,80,255', 1.4, 0.8));
    g.landed(makeItem('quantum', theta, 0.11, 14, false), 0.45);
    sfx.play('quantum_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new GlitchBurst(hx, hy, 0.5, 0.9));
    g.addFX(new Light(hx, hy, 230, '170,80,255', 0.8, 0.35));
    S.glitchBits(ps, hx, hy, 26, 50);
    S.ring(ps, hx, hy, 5, 100, '190,110,255', 5, 0.36, true);
    S.sparks(ps, hx, hy, 24, Math.PI / 2, 1.6, [180, 580], '210,150,255', 1.5);
    sfx.play('quantum_hit');
    this.alive = false;
  }
}

// ───────────────────────── WARS BLASTER BOLT ─────────────────────────
export class WarsShot extends Projectile {
  weapon = 'wars' as const;
  tip = 0;
  half = 0.06;
  constructor(g: Game, x: number, y: number) {
    super(g, x, y, -2200);
  }
  trail() {
    const ps = this.g.particles;
    if (Math.random() < 0.7) S.sparks(ps, this.x + rand(-4, 4), this.y + rand(20, 70), 1, Math.PI / 2, 1.2, [20, 100], '255,110,90', 1.2, 0, 0.03);
  }
  draw(ctx: Ctx) {
    drawBlasterBolt(ctx, this.x, this.y, 58, 2.8, '255,60,50');
  }
  hit(theta: number, hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.wheelImpact(7, 'rgba(255,200,190,');
    g.hitStop(0.04);
    g.shake(5);
    g.addFX(new RadialFlash(hx, hy, ['255,70,60', '255,220,210', '255,255,255'], 0.14, 80, 14));
    g.addFX(new Light(hx, hy, 190, '255,70,60', 0.8, 0.3));
    S.glow(ps, hx, hy, 100, 14, '255,230,225', 0.16, 1);
    S.ring(ps, hx, hy, 4, 60, '255,90,80', 3.5, 0.3, true);
    S.sparks(ps, hx, hy, 30, Math.PI / 2, 1.6, [200, 640], '255,120,100', 1.6);
    S.sparks(ps, hx, hy, 10, Math.PI / 2, 1.2, [260, 700], '255,255,255', 1.2);
    S.smoke(ps, hx, hy, 4, '90,80,76', [8, 32], { vx: [-60, 60], vy: [-70, -10], alpha: 0.35, life: [0.7, 1.2] });
    S.chips(ps, hx, hy, 8, Math.PI / 2, 1.5, [100, 340]);
    S.embers(ps, hx, hy, 8, Math.PI / 2, 1.6, [60, 240], '255,120,80', 1.8);
    const p = loc(g, theta, 0.95);
    g.paint((c) => {
      const rg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
      rg.addColorStop(0, 'rgba(10,4,4,0.95)');
      rg.addColorStop(0.6, 'rgba(40,14,10,0.6)');
      rg.addColorStop(1, 'rgba(60,20,14,0)');
      c.fillStyle = rg;
      c.beginPath();
      c.arc(p.x, p.y, 10, 0, TAU);
      c.fill();
      c.fillStyle = '#050202';
      c.beginPath();
      c.arc(p.x, p.y, 2.6, 0, TAU);
      c.fill();
    });
    g.addWheelFX(new GlowSpot(p.x, p.y, 30, '255,70,60', 1.8, 0.95));
    g.addDecal({ kind: 'smolder', angle: theta, r: g.wheel.R - 3, t: 0, seed: rand(0, 10) });
    g.landed(makeItem('wars', theta, 0.06, 5, false), 0.2);
    sfx.play('wars_hit');
    this.alive = false;
  }
  block(hx: number, hy: number) {
    const g = this.g;
    const ps = g.particles;
    g.addFX(new RadialFlash(hx, hy, ['255,70,60', '255,220,210', '255,255,255'], 0.14, 80, 12));
    S.sparks(ps, hx, hy, 26, Math.PI / 2, 1.5, [200, 620], '255,120,100', 1.5);
    S.ring(ps, hx, hy, 4, 60, '255,90,80', 3, 0.26, true);
    sfx.play('wars_hit');
    this.alive = false;
  }
}

// keep helper imports referenced
export const _refs = [makeBolt, drawHolyOrb];
