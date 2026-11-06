import type { BossAttackFamily } from './bossCatalog';

/**
 * A target's look. Bosses are not a style any more: every boss in Game A is
 * one of Game B's eleven heads, painted from Perfect Shot's own artwork, and
 * `BossAttackFamily` only picks the FX/decals an attack is drawn with.
 */
export type Style = 'orange' | 'wood' | 'target' | BossAttackFamily;

const TAU = Math.PI * 2;

function shade(c: CanvasRenderingContext2D, R: number, strength = 0.35) {
  // Spherical gloss 3D
  const g = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.08, 0, 0, R);
  g.addColorStop(0, 'rgba(255,255,255,0.28)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  g.addColorStop(0.7, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.fillStyle = g;
  c.fill();

  // Outer rim highlight
  c.beginPath();
  c.arc(0, 0, R - 2, 0, TAU);
  c.strokeStyle = 'rgba(255,255,255,0.3)';
  c.lineWidth = 1.8;
  c.stroke();
  c.beginPath();
  c.arc(0, 0, R - 1, Math.PI * 1.05, Math.PI * 1.95);
  c.strokeStyle = 'rgba(255,255,255,0.6)';
  c.lineWidth = 2.2;
  c.stroke();
}

export function drawFace(c: CanvasRenderingContext2D, R: number, style: Style) {
  // A boss never reaches this function: Game A's boss is always Perfect Shot's
  // head (`buildFace` paints the raster and leaves the canvas empty until it
  // lands). The old four hand-drawn villains are gone with `bossRoster.ts`.
  if (style === 'knight' || style === 'oni' || style === 'cyborg' || style === 'pirate') return;

  // ----------------- NORMAL ROUND TARGETS -----------------
  c.save();
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.clip();

  switch (style) {
    // ------------------------------------------------------------- ORANGE (Perfect Shot level 1, 1:1)
    //
    // This is a straight canvas port of the right-hand game's `TargetArt` "orange"
    // SVG (viewBox -100..100): rind + pith + 10 pith spokes + 30 juice seeds +
    // centre pith + the glossy streak. Level 1 of SGA therefore shows the *same*
    // wheel Perfect Shot draws; only the shatter stays SGA's own.
    case 'orange': {
      const k = R / 100; // SVG unit -> canvas unit
      const u = (v: number) => v * k;
      // r=98 stroke #b45309 width 4 runs from 96 to 100, i.e. right to the rim.
      c.beginPath();
      c.arc(0, 0, R, 0, TAU);
      c.fillStyle = '#b45309';
      c.fill();
      // r=98 rind
      c.beginPath();
      c.arc(0, 0, u(98), 0, TAU);
      c.fillStyle = '#f59e0b';
      c.fill();
      c.lineWidth = u(4);
      c.strokeStyle = '#b45309';
      c.stroke();
      // r=90 pith
      c.beginPath();
      c.arc(0, 0, u(90), 0, TAU);
      c.fillStyle = '#fff4dc';
      c.fill();
      // r=83 flesh with the reference radial gradient (white 50% -> orange)
      const flesh = c.createRadialGradient(0, 0, 0, 0, 0, u(83));
      flesh.addColorStop(0, 'rgba(255,255,255,0.5)');
      flesh.addColorStop(0.25, '#fb923c');
      flesh.addColorStop(1, '#ea7a1c');
      c.beginPath();
      c.arc(0, 0, u(83), 0, TAU);
      c.fillStyle = flesh;
      c.fill();
      // 10 spokes from the centre out to r=84
      c.strokeStyle = '#fff4dc';
      c.lineWidth = u(4);
      c.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * TAU;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(Math.cos(a) * u(84), Math.sin(a) * u(84));
        c.stroke();
      }
      // 30 juice seeds (rx 7 / ry 2.2), rotated to their own angle
      c.fillStyle = 'rgba(255,255,255,0.45)';
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * TAU + 0.18;
        const r = u(34 + (i % 3) * 16);
        c.beginPath();
        c.ellipse(Math.cos(a) * r, Math.sin(a) * r, u(7), u(2.2), a, 0, TAU);
        c.fill();
      }
      // centre pith
      c.beginPath();
      c.arc(0, 0, u(9), 0, TAU);
      c.fillStyle = '#fff4dc';
      c.fill();
      // glossy streak: M-70 -50 A85 85 0 0 1 -20 -82, stroke #fff width 6, .55
      c.beginPath();
      c.arc(0, 0, u(85), Math.atan2(-50, -70), Math.atan2(-82, -20));
      c.strokeStyle = 'rgba(255,255,255,0.55)';
      c.lineWidth = u(6);
      c.lineCap = 'round';
      c.stroke();
      c.lineCap = 'butt';
      break;
    }

    // ------------------------------------------------------------- WOOD (Hutan Klasik)
    case 'wood': {
      const g = c.createRadialGradient(0, 0, 4, 0, 0, R);
      g.addColorStop(0, '#d98b43');
      g.addColorStop(0.7, '#a55b23');
      g.addColorStop(1, '#683411');
      c.fillStyle = g;
      c.fillRect(-R, -R, R * 2, R * 2);

      // Cincin serat kayu
      for (let r = 8; r < R - 4; r += 7) {
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.strokeStyle = 'rgba(74, 34, 10, 0.28)';
        c.lineWidth = 2;
        c.stroke();
      }

      // Kulit kayu luar
      c.beginPath();
      c.arc(0, 0, R - 4, 0, TAU);
      c.strokeStyle = '#421f08';
      c.lineWidth = 8;
      c.stroke();
      shade(c, R, 0.4);
      break;
    }

    // ------------------------------------------------------------- TARGET (Papan Sasaran Bersih)
    case 'target': {
      c.fillStyle = '#1e293b';
      c.fillRect(-R, -R, R * 2, R * 2);
      const rings = 7;
      for (let i = 0; i < rings; i++) {
        const r = (R - 4) * (1 - i / rings);
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fillStyle = i % 2 === 0 ? '#f8fafc' : '#ef4444';
        c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.18)';
        c.lineWidth = 1;
        c.stroke();
      }
      // Titik tengah Bullseye emas
      c.beginPath();
      c.arc(0, 0, R * 0.16, 0, TAU);
      c.fillStyle = '#eab308';
      c.fill();
      c.beginPath();
      c.arc(0, 0, 4, 0, TAU);
      c.fillStyle = '#111';
      c.fill();
      shade(c, R, 0.35);
      break;
    }
  }
  c.restore();
}

export const STYLE_COLORS: Record<Style, { chips: string[]; bgTop: string; bgBot: string; glow: string; gridColor: string }> = {
  // Latar hutan dibuat sedikit lebih kaya warna tanpa menghilangkan suasana gelap.
  orange: { chips: ['#fffae8', '#ffa700', '#ff7a00'], bgTop: '#1b4d59', bgBot: '#153743', glow: 'rgba(255,165,0,0.32)', gridColor: 'rgba(255,165,0,0.08)' },
  wood: { chips: ['#d98b43', '#a55b23', '#683411'], bgTop: '#2b4c4a', bgBot: '#1a3436', glow: 'rgba(245,158,11,0.3)', gridColor: 'rgba(245,158,11,0.08)' },
  target: { chips: ['#f8fafc', '#ef4444', '#eab308'], bgTop: '#214b57', bgBot: '#163540', glow: 'rgba(239,68,68,0.3)', gridColor: 'rgba(239,68,68,0.08)' },

  // Boss palettes keep their identity, with a little more saturation in the forest sky.
  knight: { chips: ['#38bdf8', '#0284c7', '#ff1133'], bgTop: '#20465c', bgBot: '#122c40', glow: 'rgba(56,189,248,0.42)', gridColor: 'rgba(56,189,248,0.1)' },
  oni: { chips: ['#ef4444', '#b91c1c', '#facc15'], bgTop: '#46212b', bgBot: '#28121c', glow: 'rgba(239,68,68,0.45)', gridColor: 'rgba(239,68,68,0.1)' },
  cyborg: { chips: ['#94a3b8', '#475569', '#ff1133'], bgTop: '#26435b', bgBot: '#172d42', glow: 'rgba(34,211,238,0.42)', gridColor: 'rgba(34,211,238,0.1)' },
  pirate: { chips: ['#f1f5f9', '#0f172a', '#eab308'], bgTop: '#263752', bgBot: '#17283b', glow: 'rgba(234,179,8,0.42)', gridColor: 'rgba(234,179,8,0.1)' },
};
