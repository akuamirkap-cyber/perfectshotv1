import { drawBreakerCoin } from '../../../shared/coinArt';
import type { ProjKind } from '../weapons';
import { TAU, lin, radial, star, gunState } from './kit';
import { drawSandal } from './guns5';
import { drawProjectileExtra4 } from './projectiles5';

type C = CanvasRenderingContext2D;

function glowE(c: C, y: number, rx: number, ry: number, rgb: string, a: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, y, 1, 0, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, y, rx, ry, 0, 0, TAU);
  c.fill();
  c.restore();
}

function gemShard(c: C, len: number, a: string, b: string, d: string) {
  c.beginPath();
  c.moveTo(0, -3);
  c.lineTo(5, len * 0.35);
  c.lineTo(4, len * 0.75);
  c.lineTo(0, len);
  c.lineTo(-4, len * 0.75);
  c.lineTo(-5, len * 0.35);
  c.closePath();
  const g = c.createLinearGradient(-5, 0, 5, len);
  g.addColorStop(0, a);
  g.addColorStop(0.5, b);
  g.addColorStop(1, d);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(-5, len * 0.35);
  c.lineTo(5, len * 0.35);
  c.moveTo(0, -3);
  c.lineTo(0, len);
  c.stroke();
}

export function drawProjectileExtra3(c: C, kind: ProjKind, len: number, t: number, embedded = false) {
  switch (kind) {
    case 'pencil': {
      c.fillStyle = '#1f2937';
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(1.6, 2);
      c.lineTo(-1.6, 2);
      c.fill();
      c.beginPath();
      c.moveTo(-1.6, 2);
      c.lineTo(1.6, 2);
      c.lineTo(3.5, 9);
      c.lineTo(-3.5, 9);
      c.closePath();
      c.fillStyle = '#e9c49a';
      c.fill();
      c.fillStyle = lin(c, -3.5, 3.5, ['#ca8a04', '#fde047', '#eab308']);
      c.fillRect(-3.5, 9, 7, len - 18);
      c.fillStyle = 'rgba(113,63,18,0.4)';
      c.fillRect(-0.5, 9, 1, len - 18);
      c.fillStyle = lin(c, -3.8, 3.8, ['#64748b', '#e2e8f0', '#64748b']);
      c.fillRect(-3.8, len - 9, 7.6, 4);
      c.fillStyle = '#f472b6';
      c.beginPath();
      c.roundRect(-3.5, len - 5, 7, 5, [0, 0, 2.5, 2.5]);
      c.fill();
      break;
    }
    case 'sandal':
      // SANDAL 2X BIGGER!
      drawSandal(c, 0, len / 2, (len / 52) * 2.0);
      break;
    case 'paintball': {
      const col = gunState.tint;
      const r = Math.min(6, len * 0.4);
      c.beginPath();
      c.arc(0, r, r, 0, TAU);
      c.fillStyle = radial(c, 0, r, r, ['#ffffff', `rgb(${col})`, `rgb(${col})`]);
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.25)';
      c.lineWidth = 0.8;
      c.stroke();
      if (len > r * 2 + 2) {
        // splatted ball stuck: paint drips
        c.fillStyle = `rgba(${col},0.9)`;
        c.beginPath();
        c.ellipse(0, len - 3, 6, 3, 0, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'wand': {
      glowE(c, len * 0.35, 11, len * 0.55, '250,204,21', 0.58);
      glowE(c, len * 0.65, 9, len * 0.45, '216,180,254', 0.48);
      // Swirling golden & violet stardust tail
      c.strokeStyle = 'rgba(232,121,249,0.75)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(0, 8);
      c.bezierCurveTo(5, len * 0.35, -5, len * 0.68, 0, len);
      c.stroke();

      // 8-pointed faceted golden star tip
      c.save();
      c.translate(0, 7);
      c.rotate(t * 7);
      c.shadowColor = '#fde047';
      c.shadowBlur = 10;
      star(c, 0, 0, 8.5, '#fde047', 8);
      c.shadowBlur = 0;
      star(c, 0, 0, 4.5, '#ffffff', 8);
      c.restore();

      for (let i = 0; i < 4; i++) {
        const tw = 0.5 + 0.5 * Math.sin(t * 20 + i * 2);
        star(c, Math.sin(t * 6 + i) * 3.2, 16 + i * ((len - 16) / 4), 2 + tw * 1.5, i % 2 ? '#f5d0fe' : '#fef08a', 4);
      }
      break;
    }
    case 'ruby': {
      glowE(c, len * 0.32, 9, len * 0.55, '244,63,94', 0.52);
      // Faceted ruby crystal warhead with fiery amber heart
      c.beginPath();
      c.moveTo(0, -3.5);
      c.lineTo(5, len * 0.22);
      c.lineTo(4.6, len * 0.46);
      c.lineTo(-4.6, len * 0.46);
      c.lineTo(-5, len * 0.22);
      c.closePath();
      c.fillStyle = radial(c, -1, len * 0.22, 9, ['#fff1f2', '#fb7185', '#e11d48', '#881337']);
      c.fill();
      c.strokeStyle = 'rgba(255,228,236,0.8)';
      c.lineWidth = 0.72;
      c.stroke();
      // Facet ridge on ruby warhead
      c.beginPath();
      c.moveTo(0, -3.5);
      c.lineTo(0, len * 0.46);
      c.moveTo(-5, len * 0.22);
      c.lineTo(5, len * 0.22);
      c.stroke();

      // 24K Gold engraved casing
      c.fillStyle = lin(c, -5, 5, ['#78350f', '#fde047', '#fef9c3', '#ca8a04', '#78350f']);
      c.beginPath();
      c.roundRect(-4.8, len * 0.45, 9.6, len * 0.55 - 2.5, 1.5);
      c.fill();
      c.strokeStyle = 'rgba(120,53,15,0.68)';
      c.lineWidth = 0.72;
      c.stroke();
      // Flared gold rim
      c.fillStyle = lin(c, -6, 6, ['#92400e', '#fef08a', '#b45309']);
      c.beginPath();
      c.roundRect(-5.8, len - 3, 11.6, 3, 1);
      c.fill();
      break;
    }
    case 'emerald':
      glowE(c, len / 2, 8, len * 0.6, '52,211,153', 0.5);
      gemShard(c, len, '#d1fae5', '#10b981', '#064e3b');
      break;
    case 'sapphire': {
      glowE(c, len / 2, 10, len * 0.65, '56,189,248', 0.55);
      c.save();
      c.shadowColor = '#38bdf8';
      c.shadowBlur = 9;
      gemShard(c, len, '#ffffff', '#38bdf8', '#1e3a8a');
      c.restore();
      // Twin flanking frost-sapphire sub-shards
      for (const s of [-1, 1]) {
        c.save();
        c.translate(s * 4.5, len * 0.55);
        c.rotate(s * 0.28);
        gemShard(c, len * 0.38, '#e0f2fe', '#0ea5e9', '#1e3a8a');
        c.restore();
      }
      break;
    }
    case 'crystal': {
      glowE(c, len / 2, 13, len * 0.65, '232,121,249', 0.6);
      c.save();
      c.shadowColor = '#f0abfc';
      c.shadowBlur = 11;
      gemShard(c, len, '#ffffff', '#e879f9', '#7e22ce');
      c.restore();
      c.save();
      c.translate(-5.2, len * 0.54);
      c.rotate(-0.38);
      gemShard(c, len * 0.42, '#fae8ff', '#c084fc', '#581c87');
      c.restore();
      c.save();
      c.translate(5.2, len * 0.58);
      c.rotate(0.38);
      gemShard(c, len * 0.38, '#fae8ff', '#d946ef', '#6b21a8');
      c.restore();
      star(c, -1, len * 0.28, 3.8, '#ffffff', 4);
      break;
    }
    case 'beerifle': {
      glowE(c, len * 0.3, 6, len * 0.5, '250,204,21', 0.4);
      c.fillStyle = lin(c, -2, 2, ['#713f12', '#fde047', '#a16207']);
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(2.2, 8);
      c.lineTo(1.4, len - 8);
      c.lineTo(-1.4, len - 8);
      c.lineTo(-2.2, 8);
      c.closePath();
      c.fill();
      c.fillStyle = '#111';
      for (let i = 0; i < 3; i++) c.fillRect(-2, len - 8 - i * 6, 4, 2.5);
      c.fillStyle = 'rgba(224,242,254,0.7)';
      c.beginPath();
      c.ellipse(-3.5, len - 6, 3, 1.6, 0.6, 0, TAU);
      c.ellipse(3.5, len - 6, 3, 1.6, -0.6, 0, TAU);
      c.fill();
      break;
    }
    case 'buster': {
      const big = gunState.bigShot;
      if (big === 0) {
        glowE(c, len * 0.35, 8, 10, '254,240,138', 0.6);
        c.beginPath();
        c.ellipse(0, 6, 5, 7, 0, 0, TAU);
        c.fillStyle = radial(c, 0, 6, 7, ['#ffffff', '#fef08a', '#eab308']);
        c.fill();
        c.fillStyle = 'rgba(254,240,138,0.4)';
        c.fillRect(-1.5, 12, 3, len - 12);
      } else if (big === 1) {
        glowE(c, len * 0.4, 14, len * 0.5, '125,211,252', 0.7);
        c.beginPath();
        c.ellipse(0, 9, 8, 10, 0, 0, TAU);
        c.fillStyle = radial(c, 0, 9, 10, ['#ffffff', '#7dd3fc', '#0284c7']);
        c.fill();
        c.strokeStyle = 'rgba(224,242,254,0.9)';
        c.lineWidth = 1.4;
        c.beginPath();
        c.ellipse(0, 9, 11, 4, t * 10, 0, TAU);
        c.stroke();
      } else {
        // full charge: big crescent plasma blast
        c.save();
        c.globalCompositeOperation = 'lighter';
        const g = c.createRadialGradient(0, 10, 0, 0, 10, 26);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.35, 'rgba(254,240,138,0.9)');
        g.addColorStop(0.7, 'rgba(56,189,248,0.6)');
        g.addColorStop(1, 'rgba(56,189,248,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(0, 10, 26, 0, TAU);
        c.fill();
        c.restore();
        c.beginPath();
        c.moveTo(-14, 16);
        c.quadraticCurveTo(0, -12, 14, 16);
        c.quadraticCurveTo(0, 2, -14, 16);
        c.fillStyle = '#fef9c3';
        c.fill();
        c.strokeStyle = '#38bdf8';
        c.lineWidth = 2;
        c.stroke();
        c.fillStyle = 'rgba(125,211,252,0.6)';
        c.fillRect(-4, 16, 8, len - 16);
      }
      break;
    }
    case 'holy': {
      glowE(c, len * 0.4, 12, len * 0.6, '255,240,180', 0.65);
      // arrow of light with feather
      c.save();
      c.shadowColor = '#fde047';
      c.shadowBlur = 12;
      c.fillStyle = '#fffbeb';
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(5, 8);
      c.lineTo(1.3, 7);
      c.lineTo(1.3, len - 8);
      c.lineTo(-1.3, len - 8);
      c.lineTo(-1.3, 7);
      c.lineTo(-5, 8);
      c.closePath();
      c.fill();
      c.restore();
      c.fillStyle = 'rgba(255,255,255,0.9)';
      for (const s of [-1, 1]) {
        c.beginPath();
        c.ellipse(s * 3.5, len - 6, 4.5, 2, s * 0.7, 0, TAU);
        c.fill();
      }
      c.strokeStyle = '#fde047';
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, 12, 6, 2, 0, 0, TAU);
      c.stroke();
      break;
    }
    case 'unicorn': {
      glowE(c, len * 0.4, 12, len * 0.6, '250,190,240', 0.6);
      const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
      // spiral horn projectile
      c.save();
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(5, len * 0.7);
      c.lineTo(-5, len * 0.7);
      c.closePath();
      c.fillStyle = lin(c, -5, 5, ['#fde047', '#fffbeb', '#facc15']);
      c.fill();
      c.clip();
      for (let i = 0; i < 6; i++) {
        c.strokeStyle = RB[(i + Math.floor(t * 10)) % 6];
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-6, len * 0.7 - i * 5);
        c.lineTo(6, len * 0.7 - i * 5 - 4);
        c.stroke();
      }
      c.restore();
      for (let i = 0; i < 3; i++) star(c, Math.sin(t * 8 + i) * 4, len * 0.78 + i * 4, 2.5, RB[(i * 2 + Math.floor(t * 6)) % 6], 4);
      break;
    }
    case 'obliterator': {
      // huge green energy ball with crackling tendrils
      const r = Math.min(14, len * 0.42);
      c.save();
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(0, r, 0, 0, r, r * 2.6);
      g.addColorStop(0, 'rgba(240,255,244,1)');
      g.addColorStop(0.3, 'rgba(134,239,172,0.9)');
      g.addColorStop(0.65, 'rgba(34,197,94,0.45)');
      g.addColorStop(1, 'rgba(21,128,61,0)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, r, r * 2.6, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(220,252,231,0.9)';
      c.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + t * 3;
        c.beginPath();
        c.moveTo(Math.cos(a) * r * 0.6, r + Math.sin(a) * r * 0.6);
        let px = Math.cos(a) * r * 0.6;
        let py = r + Math.sin(a) * r * 0.6;
        for (let k = 0; k < 4; k++) {
          px += Math.cos(a + Math.sin(t * 20 + i + k) * 0.8) * r * 0.45;
          py += Math.sin(a + Math.sin(t * 20 + i + k) * 0.8) * r * 0.45;
          c.lineTo(px, py);
        }
        c.stroke();
      }
      c.restore();
      c.beginPath();
      c.arc(0, r, r * 0.55, 0, TAU);
      c.fillStyle = '#f0fdf4';
      c.fill();
      break;
    }
    case 'slingshot': {
      // tumbling river stone
      const r = Math.min(7.5, len * 0.42);
      c.save();
      c.translate(0, r);
      c.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        const rr2 = r * (0.85 + Math.sin(i * 2.7) * 0.15);
        c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2 * 0.85);
      }
      c.closePath();
      c.fillStyle = radial(c, 0, 0, r, ['#e7e5e4', '#8a817c', '#3f3a36']);
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.35)';
      c.lineWidth = 0.8;
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.5)';
      c.beginPath();
      c.ellipse(-r * 0.35, -r * 0.3, r * 0.3, r * 0.18, -0.4, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'coingun': {
      // Same round, reflective face and moving glint as collectible coins.
      drawBreakerCoin(c, 0, 12, 13, t, 0, 1, true, true);
      break;
    }
    case 'blaster': {
      // Star Wars bright red glowing laser plasma bolt
      glowE(c, len * 0.45, 9, len * 0.65, '239,68,68', 0.85);
      c.beginPath();
      c.roundRect(-3.5, 0, 7, len, 3.5);
      c.fillStyle = '#ef4444';
      c.shadowColor = '#f87171';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      // White hot core
      c.beginPath();
      c.roundRect(-1.2, 2, 2.4, len - 4, 1.2);
      c.fillStyle = '#ffffff';
      c.fill();
      break;
    }
    default:
      drawProjectileExtra4(c, kind, len, t, embedded);
  }
}
