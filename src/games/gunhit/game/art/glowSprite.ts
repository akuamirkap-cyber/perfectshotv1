/**
 * Soft radial glow sprite (ported from games/game-3 glowSprite()).
 *
 * The slide-7 "Elemental Arsenal" guns draw their muzzle/acid glow with this
 * sprite. The slide-1 port used `fillStyle = color; arc(); fill()` which paints
 * a hard-edged *solid circle* — that is the green disc that showed up behind
 * the Xenomorph Acid Spitter. Everything that needs a bloom now samples this
 * cached gradient instead.
 */
type C = CanvasRenderingContext2D;

const cache = new Map<string, HTMLCanvasElement>();

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export function glowSprite(hex: string): HTMLCanvasElement {
  const hit = cache.get(hex);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, rgba(hex, 1));
  gr.addColorStop(0.18, rgba(hex, 0.8));
  gr.addColorStop(0.45, rgba(hex, 0.25));
  gr.addColorStop(1, rgba(hex, 0));
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  cache.set(hex, c);
  return c;
}

const rgbSpriteCache = new Map<string, HTMLCanvasElement | null>();
const tintWashCache = new Map<string, HTMLCanvasElement | null>();

function getRgbSprite(rgb: string): HTMLCanvasElement | null {
  const cached = rgbSpriteCache.get(rgb);
  if (cached !== undefined) return cached;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    rgbSpriteCache.set(rgb, null);
    return null;
  }
  const cv = document.createElement('canvas');
  if (!(cv instanceof HTMLCanvasElement)) {
    rgbSpriteCache.set(rgb, null);
    return null;
  }
  cv.width = cv.height = 96;
  const g = cv.getContext('2d');
  if (!g) {
    rgbSpriteCache.set(rgb, null);
    return null;
  }
  const gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
  gr.addColorStop(0, `rgba(${rgb},0.42)`);
  gr.addColorStop(0.3, `rgba(${rgb},0.16)`);
  gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 96, 96);
  if (rgbSpriteCache.size > 128) rgbSpriteCache.clear();
  rgbSpriteCache.set(rgb, cv);
  return cv;
}

/**
 * Fast pre-baked radial light sprite for dynamic bloom lights, pedestals and
 * rarity auras (eliminates per-frame `createRadialGradient` allocations).
 */
export function drawRgbGlowSprite(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rgb: string,
  alpha: number,
) {
  if (rx <= 0 || ry <= 0 || alpha <= 0.004) return;
  const spr = getRgbSprite(rgb);
  const prevAlpha = c.globalAlpha;
  if (spr) {
    c.globalAlpha = prevAlpha * Math.min(1, alpha);
    c.drawImage(spr, x - rx, y - ry, rx * 2, ry * 2);
    c.globalAlpha = prevAlpha;
    return;
  }
  c.save();
  c.translate(x, y);
  if (rx !== ry) c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, `rgba(${rgb},${0.42 * alpha})`);
  g.addColorStop(0.3, `rgba(${rgb},${0.16 * alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, rx, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

export function drawScreenTintWash(c: C, w: number, h: number, rgb: string, alpha: number) {
  if (alpha <= 0.002) return;
  let spr = tintWashCache.get(rgb);
  if (spr === undefined) {
    if (typeof document !== 'undefined' && typeof HTMLCanvasElement !== 'undefined') {
      const cv = document.createElement('canvas');
      if (cv instanceof HTMLCanvasElement) {
        const sw = 105;
        const sh = 190;
        cv.width = sw;
        cv.height = sh;
        const g = cv.getContext('2d');
        if (g) {
          const gr = g.createRadialGradient(sw * 0.5, sh * 0.5, sh * 0.2, sw * 0.5, sh * 0.5, sh * 0.75);
          gr.addColorStop(0, `rgba(${rgb},0)`);
          gr.addColorStop(1, `rgba(${rgb},1)`);
          g.fillStyle = gr;
          g.fillRect(0, 0, sw, sh);
          if (tintWashCache.size > 64) tintWashCache.clear();
          spr = cv;
        } else spr = null;
      } else spr = null;
    } else spr = null;
    tintWashCache.set(rgb, spr);
  }
  c.save();
  c.globalCompositeOperation = 'lighter';
  if (spr) {
    c.globalAlpha = Math.min(1, alpha);
    c.drawImage(spr, 0, 0, w, h);
  } else {
    const tg2 = c.createRadialGradient(w * 0.5, h * 0.5, h * 0.2, w * 0.5, h * 0.5, h * 0.75);
    tg2.addColorStop(0, `rgba(${rgb},0)`);
    tg2.addColorStop(1, `rgba(${rgb},${alpha})`);
    c.fillStyle = tg2;
    c.fillRect(0, 0, w, h);
  }
  c.restore();
}

/**
 * Draw a soft bloom centered on (x, y) with radius r.
 * Falls back to a radial gradient when there is no DOM (headless tests).
 */
export function drawGlow(c: C, x: number, y: number, r: number, hex: string, alpha: number) {
  if (r <= 0 || alpha <= 0.003) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = Math.min(1, alpha);
  if (typeof document === 'undefined') {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(hex, 1));
    g.addColorStop(0.18, rgba(hex, 0.8));
    g.addColorStop(0.45, rgba(hex, 0.25));
    g.addColorStop(1, rgba(hex, 0));
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  } else {
    c.drawImage(glowSprite(hex), x - r, y - r, r * 2, r * 2);
  }
  c.restore();
}

interface WhiteSunburstSprites {
  primary: HTMLCanvasElement;
  secondary: HTMLCanvasElement;
}

let whiteSunburstCache: WhiteSunburstSprites | null | undefined;
const rayLayerCache = new Map<string, WhiteSunburstSprites | null>();

function buildWhiteRayLayer(
  size: number,
  rayCount: number,
  halfAngleFactor: number,
  rayAlpha: number,
  withHalo: boolean,
  rgb = '255,255,255',
): HTMLCanvasElement | null {
  const cv = document.createElement('canvas');
  if (!(cv instanceof HTMLCanvasElement)) return null;
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  if (!g) return null;
  const half = size * 0.5;
  const tau = Math.PI * 2;

  g.save();
  g.translate(half, half);

  if (withHalo) {
    const halo = g.createRadialGradient(0, 0, half * 0.08, 0, 0, half * 0.94);
    halo.addColorStop(0, `rgba(${rgb},0.52)`);
    halo.addColorStop(0.42, `rgba(${rgb},0.22)`);
    halo.addColorStop(0.76, `rgba(${rgb},0.06)`);
    halo.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = halo;
    g.beginPath();
    g.arc(0, 0, half * 0.94, 0, tau);
    g.fill();
  }

  g.fillStyle = `rgba(${rgb},${rayAlpha})`;
  const step = tau / rayCount;
  const halfW = step * halfAngleFactor;
  g.beginPath();
  for (let i = 0; i < rayCount; i++) {
    const a = i * step;
    g.moveTo(0, 0);
    g.arc(0, 0, half, a - halfW, a + halfW);
    g.closePath();
  }
  g.fill();

  // Smooth radial feather mask so rays taper gracefully to 0 before canvas bounds
  g.globalCompositeOperation = 'destination-in';
  const mask = g.createRadialGradient(0, 0, half * 0.14, 0, 0, half * 0.98);
  mask.addColorStop(0, 'rgba(255,255,255,0.95)');
  mask.addColorStop(0.55, 'rgba(255,255,255,0.72)');
  mask.addColorStop(0.84, 'rgba(255,255,255,0.22)');
  mask.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = mask;
  g.beginPath();
  g.arc(0, 0, half, 0, tau);
  g.fill();
  g.restore();

  return cv;
}

function getWhiteSunburstSprites(): WhiteSunburstSprites | null {
  if (whiteSunburstCache !== undefined) return whiteSunburstCache;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    whiteSunburstCache = null;
    return null;
  }
  const primary = buildWhiteRayLayer(288, 16, 0.24, 0.44, true);
  const secondary = buildWhiteRayLayer(288, 12, 0.16, 0.26, false);
  whiteSunburstCache = primary && secondary ? { primary, secondary } : null;
  return whiteSunburstCache;
}

/** The same two-ray-layer sunburst, baked in one stage colour. */
function getSunburstSprites(rgb: string): WhiteSunburstSprites | null {
  if (rgb === '255,255,255') return getWhiteSunburstSprites();
  const hit = rayLayerCache.get(rgb);
  if (hit !== undefined) return hit;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    rayLayerCache.set(rgb, null);
    return null;
  }
  const primary = buildWhiteRayLayer(288, 16, 0.24, 0.44, true, rgb);
  const secondary = buildWhiteRayLayer(288, 12, 0.16, 0.26, false, rgb);
  const made = primary && secondary ? { primary, secondary } : null;
  if (rayLayerCache.size > 32) rayLayerCache.clear();
  rayLayerCache.set(rgb, made);
  return made;
}

/**
 * Pure white FX-Lab sunburst rendered STRICTLY BEHIND the wheel on `<canvas>`
 * (2 cached `drawImage` calls, zero per-frame gradients, zero DOM overlays).
 */
export function drawBehindWheelSunburst(
  c: C,
  x: number,
  y: number,
  outerRadius: number,
  time: number,
  intensity = 1,
  rgb = '255,255,255',
) {
  if (outerRadius <= 0 || intensity <= 0.005) return;
  const sprites = getSunburstSprites(rgb);
  const alpha = Math.min(1, intensity);

  c.save();
  c.translate(x, y);
  c.globalCompositeOperation = 'lighter';

  if (sprites) {
    c.globalAlpha = alpha;
    c.save();
    c.rotate(time * 0.22);
    c.drawImage(sprites.primary, -outerRadius, -outerRadius, outerRadius * 2, outerRadius * 2);
    c.restore();

    const r2 = outerRadius * 0.9;
    c.globalAlpha = alpha * 0.78;
    c.rotate(-time * 0.15 + 0.2);
    c.drawImage(sprites.secondary, -r2, -r2, r2 * 2, r2 * 2);
  } else {
    // Headless Node fallback when HTMLCanvasElement is shimmed
    const g = c.createRadialGradient(0, 0, outerRadius * 0.1, 0, 0, outerRadius);
    g.addColorStop(0, `rgba(${rgb},${0.42 * alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, 0, outerRadius, 0, Math.PI * 2);
    c.fill();
  }

  c.restore();
}
