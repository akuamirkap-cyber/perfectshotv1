import { type Ctx, TAU, rand } from './core';
import { K, type Particle, type Particles } from './particles';
import { type GemPal, drawShardBolt } from './shapes7';

export * from './spawn6';

type Range = [number, number];

/** faceted gem splinters in a given palette */
export function gemShards(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range, pal: GemPal) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const L = rand(7, 15);
    const w = L * rand(0.4, 0.62);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-4, 4),
      y: y + rand(-4, 4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: 900,
      drag: 0.8,
      rot: rand(0, TAU),
      vrot: rand(-14, 14),
      life: rand(0.7, 1.3),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.globalAlpha = Math.min(1, t * 3);
        drawShardBolt(c, L, w, pal);
        c.restore();
      },
    });
  }
}

export function hearts(ps: Particles, x: number, y: number, n: number, ang: number, spread: number, speed: Range) {
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-spread, spread);
    const sp = rand(speed[0], speed[1]);
    const r = rand(4.4, 7.4);
    ps.add({
      k: K.CUSTOM,
      x: x + rand(-5, 5),
      y: y + rand(-5, 5),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      g: -50,
      drag: 1.9,
      rot: rand(-0.4, 0.4),
      seed: rand(0, 100),
      life: rand(0.9, 1.6),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        c.save();
        c.translate(p.x + Math.sin(p.seed + age * 4) * 5, p.y);
        c.rotate(p.rot + Math.sin(p.seed + age * 3) * 0.25);
        c.scale(1 + 0.08 * Math.sin(age * 10), 1 + 0.08 * Math.sin(age * 10));
        c.globalAlpha = Math.min(1, t * 2.6);
        c.beginPath();
        c.moveTo(0, r * 0.95);
        c.bezierCurveTo(-r * 1.6, -r * 0.1, -r * 0.9, -r * 1.1, 0, -r * 0.4);
        c.bezierCurveTo(r * 0.9, -r * 1.1, r * 1.6, -r * 0.1, 0, r * 0.95);
        c.closePath();
        const g = c.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.3);
        g.addColorStop(0, '#ffd0e8');
        g.addColorStop(0.5, '#ff6aa8');
        g.addColorStop(1, '#c42a78');
        c.fillStyle = g;
        c.fill();
        c.strokeStyle = 'rgba(130,20,80,0.8)';
        c.lineWidth = 0.8;
        c.stroke();
        c.fillStyle = 'rgba(255,255,255,0.7)';
        c.beginPath();
        c.ellipse(-r * 0.4, -r * 0.35, r * 0.25, r * 0.13, -0.6, 0, TAU);
        c.fill();
        c.restore();
      },
    });
  }
}

/** flickering glitch pixels */
export function glitchBits(ps: Particles, x: number, y: number, n: number, spread: number) {
  const cols = ['190,90,255', '90,230,255', '255,90,220', '255,255,255'];
  for (let i = 0; i < n; i++) {
    const col = cols[Math.floor(rand(0, 4))];
    const w = rand(3, 14);
    const h = rand(1.6, 4.4);
    ps.add({
      k: K.CUSTOM,
      add: true,
      x: x + rand(-spread, spread),
      y: y + rand(-spread * 0.7, spread * 0.7),
      vx: rand(-60, 60),
      vy: rand(-60, 60),
      drag: 2,
      seed: rand(0, 100),
      life: rand(0.35, 0.8),
      draw: (c: Ctx, p: Particle) => {
        const t = p.life / p.max;
        const age = p.max - p.life;
        if (Math.sin(p.seed + age * 60) < -0.2) return;
        c.fillStyle = `rgba(${col},${0.85 * t})`;
        c.fillRect(p.x + Math.sin(age * 40 + p.seed) * 3, p.y, w, h);
      },
    });
  }
}
