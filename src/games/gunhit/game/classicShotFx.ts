import type { Weapon } from './weapons';

import type { FxSink, FxProfile, Particle, PKind } from './fx';



// Muzzle & impact effects copied from the pre-overhaul version (c0769f5).

// Called ONLY for opted-in weapons. No collision, scoring, hitstop or ammo logic lives here.

const TAU = Math.PI * 2;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];



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

export function spawnClassicMuzzle(s: FxSink, prof: FxProfile, w: Weapon, x: number, y: number) {
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
      for (let i = 0; i < 4; i++) {
        const [vx, vy] = cone(0, -1, 0.8, 60, 200);
        s.push(mk(x, y - 4, vx, vy, rand(0.2, 0.4), rand(3, 5), `rgb(${prof.light})`, 'star', { drag: 3 }));
      }
      break;
    }
    case 'soft': {
      for (let i = 0; i < 4; i++) {
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
  void w;
}

export function spawnClassicImpact(s: FxSink, prof: FxProfile, w: Weapon, x: number, y: number, nx: number, ny: number, chips: string[]) {
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
      glows(14, [w.trail, '255,255,255'], 220);
      stars(6, ['#ffffff', lightCss]);
      sparks(6, [lightCss, '#ffffff'], 200, 500, 1.1, 200);
      s.push(mk(x, y, 0, 0, 0.25, 30, L, 'shock'));
      chipBurst(4, chips);
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
    case 'water':
      for (let i = 0; i < 14; i++) {
        const [vx, vy] = cone(nx, ny, 1.1, 90, 360);
        s.push(mk(x, y, vx, vy, rand(0.35, 0.65), rand(2, 4), pick(['#bfdbfe', '#60a5fa', '#ffffff', '#3b82f6']), 'drop', { g: 1100 }));
      }
      dust(2, 'rgba(190,220,255,', [6, 10]);
      break;
    case 'snow':
      chipBurst(14, ['#ffffff', '#f0f9ff', '#e0f2fe'], 'chip', 260, 500, [2, 4]);
      dust(5, 'rgba(255,255,255,', [6, 13]);
      break;
    case 'fire':
      for (let i = 0; i < 14; i++) {
        const [vx, vy] = cone(nx, ny, 1.2, 50, 240);
        s.push(mk(x, y, vx, vy - 40, rand(0.28, 0.6), rand(1.1, 1.8), pick(['#fff3b0', '#ffd23f', '#ff9f1c', '#ff4500']), 'spark', { g: -200, drag: 1.8 }));
      }
      glows(10, ['255,220,120', '255,140,40', '255,60,20'], 180, -120, [3, 7]);
      dust(4, 'rgba(60,50,45,', [6, 12]);
      break;
    case 'explosive':
      chipBurst(12, ['#3f3f46', '#57534e', ...chips], 'shard', 480, 1200, [4, 8]);
      sparks(18, ['#ffffff', '#fff3b0', '#ffd23f', '#ff6a00'], 300, 850, 1.5, 600);
      s.push(mk(x, y, 0, 0, 0.35, 60, '255,200,120', 'shock'));
      dust(8, 'rgba(100,90,80,', [9, 18]);
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
      // Keep the historical whorl, but no opaque black disk over rock or treasure.
      s.push(mk(x, y, 0, 0, 0.32, 37, '168,85,247', 'shock'));
      break;
    case 'magic':
      stars(10, ['#ffffff', lightCss, '#fde047'], 220, [3, 6]);
      glows(7, [L, '255,255,255'], 150);
      s.push(mk(x, y, 0, 0, 0.3, 40, L, 'shock'));
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
