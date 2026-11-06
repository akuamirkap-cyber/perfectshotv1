import { storage } from './safeStorage';

export type SgaBackgroundTheme =
  | 'forest'
  | 'morning'
  | 'town'
  | 'snow'
  | 'skyline'
  | 'battlefield'
  | 'mystic'
  | 'crystal'
  | 'yoyo_neon'
  | 'royal_vault'
  | 'cyber_grid'
  | 'nebula'
  | 'auto';

export interface SgaBgThemeOption {
  id: SgaBackgroundTheme;
  icon: string;
  label: string;
  desc: string;
  /** CSS gradient preview for theme selector cards */
  swatch: string;
}

export const SGA_BG_THEMES: readonly SgaBgThemeOption[] = [
  {
    id: 'forest',
    icon: '🌲',
    label: 'HUTAN',
    desc: 'Hutan rimba klasik SGA dengan siluet pepohonan & kunang-kunang emas',
    swatch: 'linear-gradient(180deg, #1b4d59 0%, #153743 68%, #0d252c 100%)',
  },
  {
    id: 'morning',
    icon: '🌅',
    label: 'PAGI',
    desc: 'Mentari pagi keemasan dengan berkas sinar hangat & embun hutan',
    swatch: 'linear-gradient(180deg, #5c3118 0%, #c9772c 52%, #29463e 100%)',
  },
  {
    id: 'town',
    icon: '🏘️',
    label: 'TOWN',
    desc: 'Senja kota dengan siluet gedung bertingkat & jendela hangat menyala',
    swatch: 'linear-gradient(180deg, #4b2a3e 0%, #b56548 50%, #101e28 100%)',
  },
  {
    id: 'snow',
    icon: '❄️',
    label: 'SALJU',
    desc: 'Musim dingin bersalju dengan pohon pinus es & butiran salju turun',
    swatch: 'linear-gradient(180deg, #163b59 0%, #3a7ca5 55%, #8ecae6 100%)',
  },
  {
    id: 'skyline',
    icon: '🌃',
    label: 'MALAM',
    desc: 'Langit kota malam ungu-magenta dengan gedung bercahaya & 110 bintang',
    swatch: 'linear-gradient(180deg, #04010f 0%, #12062e 48%, #4a1747 100%)',
  },
  {
    id: 'battlefield',
    icon: '🔥',
    label: 'PERANG',
    desc: 'Medan perang senja dengan lampu sorot menyapu, bara api & bunker',
    swatch: 'linear-gradient(180deg, #14111c 0%, #3b2a22 55%, #7c3b14 100%)',
  },
  {
    id: 'mystic',
    icon: '⚡',
    label: 'MISTIS',
    desc: 'Langit tengah malam mistis dengan 3 cincin kuno berputar & abu emas',
    swatch: 'linear-gradient(180deg, #0b1428 0%, #080d1c 55%, #1d2c3f 100%)',
  },
  {
    id: 'crystal',
    icon: '💎',
    label: 'KRISTAL',
    desc: 'Malam kristal es berlian dengan sorot prisma diagonal & bintang berkilau',
    swatch: 'linear-gradient(180deg, #071936 0%, #143d6b 55%, #1f5e8a 100%)',
  },
  {
    id: 'yoyo_neon',
    icon: '🪀',
    label: 'NEON',
    desc: 'Malam festival neon warna-warni dengan 14 cahaya bokeh pelangi',
    swatch: 'linear-gradient(180deg, #1e0830 0%, #2d1254 52%, #591642 100%)',
  },
  {
    id: 'royal_vault',
    icon: '🔮',
    label: 'KUBAH',
    desc: 'Kubah kerajaan ungu dengan 5 sorot lampu panggung & kisi berlian',
    swatch: 'linear-gradient(180deg, #1e0f3b 0%, #2a1452 50%, #0c0518 100%)',
  },
  {
    id: 'cyber_grid',
    icon: '🌐',
    label: 'CYBER',
    desc: 'Arena masa depan gelap dengan lantai grid perspektif neon biru',
    swatch: 'linear-gradient(180deg, #0b1020 0%, #121a2e 55%, #0c2340 100%)',
  },
  {
    id: 'nebula',
    icon: '🌌',
    label: 'NEBULA',
    desc: 'Angkasa dalam penuh gugusan kabut nebula ungu-biru & taburan bintang',
    swatch: 'linear-gradient(180deg, #1f1740 0%, #141233 52%, #07080f 100%)',
  },
  {
    id: 'auto',
    icon: '🎯',
    label: 'OTOMATIS',
    desc: 'Mengikuti latar khas tiap senjata spesial (Hutan untuk senjata standar)',
    swatch: 'linear-gradient(135deg, #1b4d59 0%, #2a0f4a 50%, #7c3b14 100%)',
  },
] as const;

export const SGA_BG_THEME_IDS: readonly SgaBackgroundTheme[] = SGA_BG_THEMES.map((t) => t.id);

export const DEFAULT_SGA_BG_THEME: SgaBackgroundTheme = 'forest';
export const SGA_BG_THEME_STORAGE_KEY = 'gunhit_menu_theme';

const VALID_SET = new Set<string>(SGA_BG_THEME_IDS);
const listeners = new Set<(theme: SgaBackgroundTheme) => void>();

export function normalizeSgaBgTheme(raw: unknown): SgaBackgroundTheme {
  if (typeof raw === 'string' && VALID_SET.has(raw)) {
    return raw as SgaBackgroundTheme;
  }
  return DEFAULT_SGA_BG_THEME;
}

export function getSavedSgaBgTheme(): SgaBackgroundTheme {
  const saved = storage.getItem(SGA_BG_THEME_STORAGE_KEY);
  return normalizeSgaBgTheme(saved);
}

export function setSavedSgaBgTheme(next: SgaBackgroundTheme): SgaBackgroundTheme {
  const valid = normalizeSgaBgTheme(next);
  storage.setItem(SGA_BG_THEME_STORAGE_KEY, valid);
  for (const fn of listeners) {
    try {
      fn(valid);
    } catch {
      /* ignore listener errors */
    }
  }
  return valid;
}

export function subscribeSgaBgTheme(fn: (theme: SgaBackgroundTheme) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

// ---------------------------------------------------------------------------
// Deterministic geometry helpers & offscreen static layer cache for Game.ts
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2;

const TOWN_SILHOUETTE = [
  { x: -4, w: 66, h: 158, step: true },
  { x: 52, w: 56, h: 242, step: false },
  { x: 104, w: 60, h: 184, step: false },
  { x: 160, w: 54, h: 288, step: true },
  { x: 210, w: 64, h: 204, step: false },
  { x: 270, w: 54, h: 256, step: false },
  { x: 320, w: 56, h: 176, step: true },
  { x: 372, w: 56, h: 230, step: false },
] as const;

const SNOW_FLAKES = Array.from({ length: 42 }, (_, i) => ({
  x0: ((i * 53 + 17) % 420),
  y0: ((i * 97 + 29) % 760),
  r: 1.6 + (i % 4) * 0.85,
  spd: 24 + (i % 5) * 11,
  swayAmp: 10 + (i % 4) * 6,
  swaySpd: 0.9 + (i % 5) * 0.32,
  phase: i * 1.13,
}));

const NEBULA_STARS = Array.from({ length: 74 }, (_, i) => {
  const h = (n: number) => (((Math.sin(i * 19.17 + n * 61.7) * 43758.5453) % 1) + 1) % 1;
  return {
    x: h(1) * 420,
    y: h(2) * 620,
    r: 0.45 + h(3) * 1.45,
    sp: 1.1 + h(4) * 2.1,
    ph: h(5) * TAU,
  };
});

const NEBULA_CLOUDS = Array.from({ length: 9 }, (_, i) => {
  const h = (n: number) => (((Math.sin(i * 31.7 + n * 47.3) * 19753.31) % 1) + 1) % 1;
  return {
    x: 35 + h(1) * 350,
    y: 60 + h(2) * 580,
    r: 55 + h(3) * 105,
    cr: Math.round(115 + h(4) * 85),
    cg: Math.round(70 + h(5) * 65),
  };
});

export interface CustomThemeRenderParams {
  w: number;
  h: number;
  cx: number;
  targetY: number;
  targetR: number;
  time: number;
  dpr: number;
  glow: string;
  dust: ReadonlyArray<{ x: number; y: number; s: number }>;
}

let cachedCanvas: HTMLCanvasElement | null = null;
let cachedKey = '';

function paintTargetGlow(
  c: CanvasRenderingContext2D,
  w: number,
  h: number,
  cx: number,
  ty: number,
  r: number,
  glow: string,
) {
  const tg = c.createRadialGradient(cx, ty, 18, cx, ty, r * 2.55);
  tg.addColorStop(0, glow);
  tg.addColorStop(0.6, glow.replace(/[\d.]+\)$/, '0.06)'));
  tg.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = tg;
  c.fillRect(0, 0, w, h);
}

function paintStaticThemeLayer(
  c: CanvasRenderingContext2D,
  theme: SgaBackgroundTheme,
  p: CustomThemeRenderParams,
) {
  const { w, h, cx, targetY, targetR, glow } = p;

  switch (theme) {
    case 'morning': {
      // Warm golden sunrise sky with darkened top crown so HUD numbers stay crisp
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#3a2216');
      sky.addColorStop(0.22, '#7d4722');
      sky.addColorStop(0.5, '#c97b32');
      sky.addColorStop(0.76, '#626247');
      sky.addColorStop(1, '#182d2a');
      c.fillStyle = sky;
      c.fillRect(0, 0, w, h);

      // Morning sun halo in upper-right sky
      const sx = w * 0.78;
      const sy = h * 0.2;
      const sunHalo = c.createRadialGradient(sx, sy, 8, sx, sy, 210);
      sunHalo.addColorStop(0, 'rgba(255, 248, 200, 0.72)');
      sunHalo.addColorStop(0.28, 'rgba(255, 208, 115, 0.36)');
      sunHalo.addColorStop(0.65, 'rgba(255, 165, 70, 0.10)');
      sunHalo.addColorStop(1, 'rgba(255, 150, 50, 0)');
      c.fillStyle = sunHalo;
      c.fillRect(0, 0, w, h);

      c.fillStyle = 'rgba(255, 250, 218, 0.82)';
      c.beginPath();
      c.arc(sx, sy, 23, 0, TAU);
      c.fill();

      // Distant sunlit misty ridge
      c.fillStyle = 'rgba(54, 62, 48, 0.55)';
      c.beginPath();
      c.moveTo(0, h * 0.72);
      c.quadraticCurveTo(w * 0.28, h * 0.64, w * 0.56, h * 0.7);
      c.quadraticCurveTo(w * 0.82, h * 0.75, w, h * 0.66);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Far sunlit tree trunks
      c.fillStyle = 'rgba(62, 46, 34, 0.52)';
      c.beginPath();
      c.moveTo(52, 0); c.lineTo(84, 0); c.lineTo(74, h); c.lineTo(42, h); c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(332, 0); c.lineTo(368, 0); c.lineTo(354, h); c.lineTo(318, h); c.closePath();
      c.fill();

      // Near warm-rimmed forest trunks
      const warmTree = (x0: number, x1: number, x2: number, x3: number) => {
        const tg = c.createLinearGradient(x0, 0, x1, 0);
        tg.addColorStop(0, 'rgba(26, 22, 18, 0.94)');
        tg.addColorStop(0.65, 'rgba(52, 38, 26, 0.9)');
        tg.addColorStop(1, 'rgba(96, 64, 34, 0.88)');
        c.fillStyle = tg;
        c.beginPath();
        c.moveTo(x0, 0); c.lineTo(x1, 0); c.lineTo(x2, h); c.lineTo(x3, h); c.closePath();
        c.fill();
      };
      warmTree(-15, 42, 33, -24);
      warmTree(378, 435, 444, 386);

      c.fillStyle = 'rgba(28, 20, 14, 0.9)';
      c.beginPath();
      c.moveTo(28, 122); c.quadraticCurveTo(78, 100, 126, 42); c.lineTo(118, 37); c.quadraticCurveTo(73, 92, 26, 108); c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(392, 150); c.quadraticCurveTo(344, 122, 294, 54); c.lineTo(302, 48); c.quadraticCurveTo(348, 114, 396, 136); c.closePath();
      c.fill();

      paintTargetGlow(c, w, h, cx, targetY, targetR, glow);
      break;
    }

    case 'town': {
      // Warm sunset dusk sky over town skyline
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#231733');
      sky.addColorStop(0.28, '#593048');
      sky.addColorStop(0.56, '#b06449');
      sky.addColorStop(0.78, '#d48d5c');
      sky.addColorStop(1, '#12222b');
      c.fillStyle = sky;
      c.fillRect(0, 0, w, h);

      // Sunset sun glow near upper-right horizon
      const sun = c.createRadialGradient(w * 0.76, h * 0.22, 6, w * 0.76, h * 0.22, 175);
      sun.addColorStop(0, 'rgba(255, 224, 172, 0.55)');
      sun.addColorStop(0.45, 'rgba(251, 146, 60, 0.2)');
      sun.addColorStop(1, 'rgba(251, 146, 60, 0)');
      c.fillStyle = sun;
      c.fillRect(0, 0, w, h);

      // Back skyline layer
      c.fillStyle = 'rgba(26, 34, 48, 0.72)';
      for (let i = 0; i < TOWN_SILHOUETTE.length; i++) {
        const b = TOWN_SILHOUETTE[i];
        const bh = b.h * 1.16;
        c.fillRect(b.x + 12, h - bh, b.w * 0.9, bh);
      }

      // Foreground buildings with stepped roofs & warm lit windows
      for (let i = 0; i < TOWN_SILHOUETTE.length; i++) {
        const b = TOWN_SILHOUETTE[i];
        const topY = h - b.h;
        const bg = c.createLinearGradient(0, topY, 0, h);
        bg.addColorStop(0, '#243a48');
        bg.addColorStop(1, '#0d1922');
        c.fillStyle = bg;
        c.fillRect(b.x, topY, b.w, b.h);

        if (b.step) {
          c.fillRect(b.x + b.w * 0.26, topY - 18, b.w * 0.48, 18);
          c.fillStyle = '#385264';
          c.fillRect(b.x + b.w * 0.48, topY - 34, 3, 16);
        }

        c.strokeStyle = 'rgba(203, 213, 225, 0.14)';
        c.lineWidth = 1;
        c.strokeRect(b.x + 0.5, topY + 0.5, b.w - 1, b.h - 1);

        // Window grid
        for (let wy = topY + 12; wy < h - 26; wy += 15) {
          for (let wx = b.x + 8; wx < b.x + b.w - 10; wx += 12) {
            const hash = ((wx * 17 + wy * 31 + i * 13) % 11);
            if (hash < 6) {
              c.fillStyle = hash < 2 ? 'rgba(254, 240, 138, 0.78)' : 'rgba(251, 191, 36, 0.46)';
              c.fillRect(wx, wy, 5, 7);
            }
          }
        }
      }

      // Street mist at bottom
      const mist = c.createLinearGradient(0, h * 0.78, 0, h);
      mist.addColorStop(0, 'rgba(7, 21, 27, 0)');
      mist.addColorStop(1, 'rgba(7, 21, 27, 0.86)');
      c.fillStyle = mist;
      c.fillRect(0, h * 0.78, w, h * 0.22);

      paintTargetGlow(c, w, h, cx, targetY, targetR, glow);
      break;
    }

    case 'snow': {
      // Crisp arctic winter sky with deep twilight crown so white HUD & snowballs pop cleanly
      const sky = c.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#102a45');
      sky.addColorStop(0.32, '#1f4e75');
      sky.addColorStop(0.68, '#3f7ea6');
      sky.addColorStop(1, '#7bb5d4');
      c.fillStyle = sky;
      c.fillRect(0, 0, w, h);

      // Winter moon / ice sun glow
      const moon = c.createRadialGradient(w * 0.8, h * 0.18, 6, w * 0.8, h * 0.18, 150);
      moon.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
      moon.addColorStop(0.4, 'rgba(202, 240, 248, 0.22)');
      moon.addColorStop(1, 'rgba(202, 240, 248, 0)');
      c.fillStyle = moon;
      c.fillRect(0, 0, w, h);

      // Distant icy mountain peaks
      c.fillStyle = 'rgba(28, 64, 94, 0.58)';
      c.beginPath();
      c.moveTo(0, h * 0.72);
      c.lineTo(88, h * 0.54);
      c.lineTo(178, h * 0.67);
      c.lineTo(286, h * 0.5);
      c.lineTo(376, h * 0.64);
      c.lineTo(w, h * 0.58);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      // Snow-covered pine silhouettes on left & right edges
      const drawPine = (px: number, baseY: number, pw: number, ph: number) => {
        for (let tier = 0; tier < 4; tier++) {
          const ty = baseY - ph * (0.22 * tier);
          const tw = pw * (1 - tier * 0.18);
          const th = ph * 0.36;
          c.fillStyle = '#12324a';
          c.beginPath();
          c.moveTo(px, ty - th);
          c.lineTo(px - tw, ty);
          c.lineTo(px + tw, ty);
          c.closePath();
          c.fill();
          // Snow cap on pine tier
          c.fillStyle = 'rgba(230, 247, 255, 0.52)';
          c.beginPath();
          c.moveTo(px, ty - th);
          c.lineTo(px - tw * 0.55, ty - th * 0.45);
          c.lineTo(px + tw * 0.55, ty - th * 0.45);
          c.closePath();
          c.fill();
        }
      };
      drawPine(26, h - 55, 48, 250);
      drawPine(74, h - 48, 34, 175);
      drawPine(394, h - 52, 48, 245);
      drawPine(348, h - 46, 32, 165);

      // Soft snowbanks at bottom
      const bank = c.createLinearGradient(0, h - 125, 0, h);
      bank.addColorStop(0, 'rgba(235, 249, 255, 0.62)');
      bank.addColorStop(1, 'rgba(186, 224, 245, 0.85)');
      c.fillStyle = bank;
      c.beginPath();
      c.moveTo(0, h - 78);
      c.quadraticCurveTo(w * 0.28, h - 112, w * 0.55, h - 82);
      c.quadraticCurveTo(w * 0.8, h - 58, w, h - 94);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.closePath();
      c.fill();

      paintTargetGlow(c, w, h, cx, targetY, targetR, glow);
      break;
    }

    case 'royal_vault': {
      // Ported from Set 3 / Game 4 (`games/game-4/src/game/art.ts` renderBackground)
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#1e0f3b');
      bg.addColorStop(0.42, '#2a1452');
      bg.addColorStop(1, '#0c0518');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      const rg = c.createRadialGradient(cx, targetY, 10, cx, targetY, 330);
      rg.addColorStop(0, 'rgba(175, 115, 255, 0.34)');
      rg.addColorStop(0.45, 'rgba(110, 60, 210, 0.14)');
      rg.addColorStop(1, 'rgba(60, 20, 120, 0)');
      c.fillStyle = rg;
      c.fillRect(0, 0, w, h);

      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const x = 50 + i * 80;
        const beam = c.createLinearGradient(0, 0, 0, h * 0.82);
        beam.addColorStop(0, 'rgba(185, 145, 255, 0.085)');
        beam.addColorStop(1, 'rgba(185, 145, 255, 0)');
        c.fillStyle = beam;
        c.beginPath();
        c.moveTo(x - 12, 0);
        c.lineTo(x + 12, 0);
        c.lineTo(x + 60 - i * 22, h * 0.82);
        c.lineTo(x + 8 - i * 22, h * 0.82);
        c.closePath();
        c.fill();
      }
      c.restore();

      c.strokeStyle = 'rgba(255, 255, 255, 0.026)';
      c.lineWidth = 1;
      for (let x = -h; x < w + h; x += 34) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x + h, h);
        c.stroke();
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x - h, h);
        c.stroke();
      }

      const botGlow = c.createRadialGradient(cx, h - 70, 10, cx, h - 70, 250);
      botGlow.addColorStop(0, 'rgba(255, 205, 255, 0.11)');
      botGlow.addColorStop(1, 'rgba(255, 205, 255, 0)');
      c.fillStyle = botGlow;
      c.fillRect(0, 0, w, h);
      break;
    }

    case 'cyber_grid': {
      // Ported from Set 9 / Game 6 (`games/game-6/src/game/engine.ts` drawBackground)
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#0b1020');
      bg.addColorStop(0.45, '#121a2e');
      bg.addColorStop(1, '#070a13');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      c.save();
      c.globalCompositeOperation = 'lighter';
      const sp = c.createRadialGradient(cx, targetY, 10, cx, targetY, targetR * 4.1);
      sp.addColorStop(0, 'rgba(90, 130, 200, 0.3)');
      sp.addColorStop(0.5, 'rgba(60, 90, 160, 0.11)');
      sp.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = sp;
      c.fillRect(0, 0, w, h);
      c.restore();

      const fy = h - 92;
      const fg = c.createLinearGradient(0, fy - 36, 0, h);
      fg.addColorStop(0, 'rgba(20, 28, 44, 0)');
      fg.addColorStop(0.38, '#141c2c');
      fg.addColorStop(1, '#0a0e18');
      c.fillStyle = fg;
      c.fillRect(0, fy - 36, w, h - fy + 36);

      c.strokeStyle = 'rgba(120, 180, 255, 0.22)';
      c.lineWidth = 1;
      for (let i = -8; i <= 8; i++) {
        c.beginPath();
        c.moveTo(cx + i * 36, fy);
        c.lineTo(cx + i * 210, h);
        c.stroke();
      }
      for (let row = 0; row <= 4; row++) {
        const ry = fy + Math.pow(row / 4, 1.45) * (h - fy);
        c.beginPath();
        c.moveTo(0, ry);
        c.lineTo(w, ry);
        c.strokeStyle = `rgba(130, 195, 255, ${0.28 - row * 0.04})`;
        c.stroke();
      }
      break;
    }

    case 'nebula':
    default: {
      // Ported from Set 11 / Game 8 (`games/game-8/src/game/engine.ts`)
      const bg = c.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#1f1740');
      bg.addColorStop(0.5, '#141233');
      bg.addColorStop(1, '#07080f');
      c.fillStyle = bg;
      c.fillRect(0, 0, w, h);

      for (const cl of NEBULA_CLOUDS) {
        const ng = c.createRadialGradient(cl.x, cl.y, 0, cl.x, cl.y, cl.r);
        ng.addColorStop(0, `rgba(${cl.cr}, ${cl.cg}, 255, 0.095)`);
        ng.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = ng;
        c.beginPath();
        c.arc(cl.x, cl.y, cl.r, 0, TAU);
        c.fill();
      }

      const halo = c.createRadialGradient(cx, targetY, 20, cx, targetY, 330);
      halo.addColorStop(0, 'rgba(255, 170, 90, 0.22)');
      halo.addColorStop(0.5, 'rgba(120, 70, 200, 0.11)');
      halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = halo;
      c.fillRect(0, 0, w, h);

      const lane = c.createLinearGradient(0, targetY + targetR, 0, h);
      lane.addColorStop(0, 'rgba(255, 255, 255, 0.055)');
      lane.addColorStop(1, 'rgba(255, 255, 255, 0)');
      c.fillStyle = lane;
      c.fillRect(cx - 26, targetY + targetR, 52, h - (targetY + targetR));

      const floor = c.createLinearGradient(0, h - 190, 0, h);
      floor.addColorStop(0, 'rgba(0, 0, 0, 0)');
      floor.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
      c.fillStyle = floor;
      c.fillRect(0, h - 190, w, 190);
      break;
    }
  }
}

export function drawCustomSgaTheme(
  c: CanvasRenderingContext2D,
  theme: 'morning' | 'town' | 'snow' | 'royal_vault' | 'cyber_grid' | 'nebula',
  p: CustomThemeRenderParams,
) {
  const { w, h, time, dpr, dust } = p;
  const density = Math.max(1, Math.ceil(dpr || 1));
  const key = `${theme}:${w}:${h}:${p.targetY}:${p.targetR}:${p.glow}:${density}`;

  const doc = (globalThis as { document?: Document }).document;
  if (!doc) {
    cachedCanvas = null;
    cachedKey = '';
  } else if (key !== cachedKey || !cachedCanvas) {
    cachedCanvas = null;
    if (typeof doc.createElement === 'function') {
      const cv = doc.createElement('canvas');
      cv.width = w * density;
      cv.height = h * density;
      const bc = cv.getContext('2d');
      if (bc) {
        bc.setTransform(density, 0, 0, density, 0, 0);
        paintStaticThemeLayer(bc, theme, p);
        cachedCanvas = cv;
        cachedKey = key;
      }
    }
  }

  if (cachedCanvas) {
    c.drawImage(cachedCanvas, 0, 0, w, h);
  } else {
    paintStaticThemeLayer(c, theme, p);
  }

  // Live animated foreground details per theme
  switch (theme) {
    case 'morning': {
      // Soft pulsing sunbeams from upper-right + warm floating pollen motes + sunlit grass
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = 0.08 + 0.03 * Math.sin(time * 1.3);
      c.fillStyle = '#fde68a';
      for (let i = 0; i < 3; i++) {
        const shift = Math.sin(time * 0.55 + i * 1.4) * 18;
        c.beginPath();
        c.moveTo(w * 0.84, h * 0.14);
        c.lineTo(w * 0.94, h * 0.22);
        c.lineTo(w * (0.28 - i * 0.12) + shift, h);
        c.lineTo(w * (0.12 - i * 0.12) + shift, h);
        c.closePath();
        c.fill();
      }
      c.restore();

      for (const d of dust) {
        const pulse = 0.45 + 0.55 * Math.sin(time * 2.2 + d.x);
        c.fillStyle = `rgba(255, 237, 160, ${0.32 * pulse})`;
        c.beginPath();
        c.arc(d.x, d.y, d.s * 2.5, 0, TAU);
        c.fill();
        c.fillStyle = `rgba(255, 251, 215, ${0.9 * pulse})`;
        c.beginPath();
        c.arc(d.x, d.y, d.s * 0.85, 0, TAU);
        c.fill();
      }

      // Warm dark-olive grass blades swaying in morning breeze
      c.fillStyle = '#0e1d1a';
      c.beginPath();
      c.moveTo(0, h);
      const blades = 28;
      for (let i = 0; i <= blades; i++) {
        const bx = (i / blades) * w;
        const wind = Math.sin(time * 1.9 + i * 0.5) * 4;
        const hb = 20 + (i % 3) * 11 + Math.sin(i * 1.5) * 7;
        c.lineTo(bx - 4, h);
        c.quadraticCurveTo(bx + wind * 0.5, h - hb * 0.6, bx + wind, h - hb);
        c.quadraticCurveTo(bx + 4 + wind * 0.5, h - hb * 0.6, bx + 6, h);
      }
      c.lineTo(w, h);
      c.closePath();
      c.fill();
      break;
    }

    case 'town': {
      // Twinkling dusk stars in top sky + warm drifting street embers
      for (let i = 0; i < 18; i++) {
        const sx = ((i * 73 + 29) % (w - 24)) + 12;
        const sy = ((i * 41 + 15) % 210) + 14;
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(time * 1.8 + i * 2.1));
        c.fillStyle = `rgba(255, 244, 214, ${a})`;
        c.beginPath();
        c.arc(sx, sy, 0.8 + (i % 2) * 0.5, 0, TAU);
        c.fill();
      }
      for (const d of dust) {
        const pulse = 0.35 + 0.65 * Math.sin(time * 2.0 + d.y * 0.05);
        c.fillStyle = `rgba(251, 146, 60, ${0.24 * pulse})`;
        c.beginPath();
        c.arc(d.x, d.y, d.s * 2.1, 0, TAU);
        c.fill();
      }
      break;
    }

    case 'snow': {
      // Live falling & swaying snowflakes across the entire stage
      for (const f of SNOW_FLAKES) {
        const y = (f.y0 + time * f.spd) % (h + 16) - 8;
        const x = (f.x0 + Math.sin(time * f.swaySpd + f.phase) * f.swayAmp + w) % w;
        const alpha = 0.52 + 0.38 * Math.sin(time * 2.4 + f.phase);
        c.fillStyle = `rgba(235, 250, 255, ${alpha * 0.32})`;
        c.beginPath();
        c.arc(x, y, f.r * 2.1, 0, TAU);
        c.fill();
        c.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        c.beginPath();
        c.arc(x, y, f.r, 0, TAU);
        c.fill();
      }
      break;
    }

    case 'royal_vault': {
      // Floating violet/gold arcane motes inside the spotlight beams
      for (const d of dust) {
        const pulse = 0.4 + 0.6 * Math.sin(time * 2.3 + d.x);
        c.fillStyle = `rgba(216, 180, 254, ${0.28 * pulse})`;
        c.beginPath();
        c.arc(d.x, d.y, d.s * 2.4, 0, TAU);
        c.fill();
        c.fillStyle = `rgba(250, 232, 255, ${0.82 * pulse})`;
        c.beginPath();
        c.arc(d.x, d.y, d.s * 0.85, 0, TAU);
        c.fill();
      }
      break;
    }

    case 'cyber_grid': {
      // Animated neon horizon pulse + drifting cyan data motes
      const fy = h - 92;
      const scanP = (time * 0.55) % 1;
      const scanY = fy + Math.pow(scanP, 1.45) * (h - fy);
      c.save();
      c.strokeStyle = `rgba(56, 189, 248, ${0.55 * (1 - scanP)})`;
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(0, scanY);
      c.lineTo(w, scanY);
      c.stroke();
      c.restore();

      for (const d of dust) {
        const pulse = 0.35 + 0.65 * Math.sin(time * 3.0 + d.x);
        c.fillStyle = `rgba(56, 189, 248, ${0.26 * pulse})`;
        c.beginPath();
        c.arc(d.x, d.y, d.s * 2.0, 0, TAU);
        c.fill();
      }
      break;
    }

    case 'nebula': {
      // Twinkling deep-space starfield
      for (const st of NEBULA_STARS) {
        const a = 0.25 + 0.7 * (0.5 + 0.5 * Math.sin(time * st.sp + st.ph));
        c.fillStyle = `rgba(210, 220, 255, ${a * 0.82})`;
        c.beginPath();
        c.arc(st.x, st.y, st.r, 0, TAU);
        c.fill();
      }
      break;
    }
  }
}
