import { TAU } from './kit';

interface StarSpritePair {
  auraRays: HTMLCanvasElement;
  body: HTMLCanvasElement;
}

const starSpriteCache = new Map<string, StarSpritePair | null>();
let rockShardCache: HTMLCanvasElement[] | null | undefined;

function getStarSprites(rgb: string): StarSpritePair | null {
  const cached = starSpriteCache.get(rgb);
  if (cached !== undefined) return cached;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    starSpriteCache.set(rgb, null);
    return null;
  }

  const auraCv = document.createElement('canvas');
  const bodyCv = document.createElement('canvas');
  if (!(auraCv instanceof HTMLCanvasElement) || !(bodyCv instanceof HTMLCanvasElement)) {
    starSpriteCache.set(rgb, null);
    return null;
  }

  // 1. Pre-baked aura + 8 feathered rays (radius = 3x star unit radius = 78px -> 160x160)
  const auraSize = 160;
  const ah = auraSize * 0.5;
  const unitR = 24;
  auraCv.width = auraCv.height = auraSize;
  const ag = auraCv.getContext('2d');
  const bg = bodyCv.getContext('2d');
  if (!ag || !bg) {
    starSpriteCache.set(rgb, null);
    return null;
  }

  ag.translate(ah, ah);
  const g = ag.createRadialGradient(0, 0, unitR * 0.3, 0, 0, unitR * 3);
  g.addColorStop(0, `rgba(${rgb},0.72)`);
  g.addColorStop(0.4, `rgba(${rgb},0.26)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ag.fillStyle = g;
  ag.beginPath();
  ag.arc(0, 0, unitR * 3, 0, TAU);
  ag.fill();

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const l = unitR * (i % 2 === 0 ? 2.25 : 1.85);
    const lg = ag.createLinearGradient(0, 0, Math.cos(a) * l, Math.sin(a) * l);
    lg.addColorStop(0, 'rgba(255,255,255,0.52)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    ag.strokeStyle = lg;
    ag.lineWidth = 2.6;
    ag.lineCap = 'round';
    ag.beginPath();
    ag.moveTo(0, 0);
    ag.lineTo(Math.cos(a) * l, Math.sin(a) * l);
    ag.stroke();
  }

  // 2. Pre-baked 5-point star body + soft outer rim glow (zero runtime shadowBlur)
  const bodySize = 96;
  const bh = bodySize * 0.5;
  const br = 28;
  bodyCv.width = bodyCv.height = bodySize;
  bg.translate(bh, bh);

  const rimGlow = bg.createRadialGradient(0, 0, br * 0.35, 0, 0, br * 1.45);
  rimGlow.addColorStop(0, `rgba(${rgb},0.65)`);
  rimGlow.addColorStop(0.55, `rgba(${rgb},0.22)`);
  rimGlow.addColorStop(1, `rgba(${rgb},0)`);
  bg.fillStyle = rimGlow;
  bg.beginPath();
  bg.arc(0, 0, br * 1.45, 0, TAU);
  bg.fill();

  bg.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? br : br * 0.45;
    const a = (i / 10) * TAU - Math.PI / 2;
    if (i === 0) bg.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else bg.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  bg.closePath();
  const sg = bg.createRadialGradient(-br * 0.2, -br * 0.3, br * 0.1, 0, 0, br);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.5, `rgb(${rgb})`);
  sg.addColorStop(1, '#b45309');
  bg.fillStyle = sg;
  bg.fill();
  bg.strokeStyle = '#ffffff';
  bg.lineWidth = 1.8;
  bg.stroke();

  const pair = { auraRays: auraCv, body: bodyCv };
  starSpriteCache.set(rgb, pair);
  return pair;
}

/** Bintang power-up 3 pilihan (sprite-cached: 0 per-frame gradients, 0 shadowBlur) */
export function drawStar(c: CanvasRenderingContext2D, x: number, y: number, r: number, time: number, rgb: string) {
  const sprites = getStarSprites(rgb);
  const pulse = 0.85 + 0.15 * Math.sin(time * 6);

  if (sprites) {
    const prevAlpha = c.globalAlpha;
    c.save();
    c.translate(x, y);

    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = prevAlpha * pulse;
    c.rotate(time * 1.5);
    const auraSpan = (r / 24) * 160;
    c.drawImage(sprites.auraRays, -auraSpan * 0.5, -auraSpan * 0.5, auraSpan, auraSpan);
    c.restore();

    c.rotate(time * 1.2);
    const bodySpan = (r / 28) * 96;
    c.drawImage(sprites.body, -bodySpan * 0.5, -bodySpan * 0.5, bodySpan, bodySpan);
    c.restore();
    return;
  }

  // Headless Node vector fallback
  c.save();
  c.translate(x, y);
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * TAU - Math.PI / 2;
    if (i === 0) c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
  c.fillStyle = `rgb(${rgb})`;
  c.fill();
  c.restore();
}

function getRockShardSprites(): HTMLCanvasElement[] | null {
  if (rockShardCache !== undefined) return rockShardCache;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    rockShardCache = null;
    return null;
  }
  const list: HTMLCanvasElement[] = [];
  const spriteSize = 48;
  const half = spriteSize * 0.5;
  const baseR = 16;

  for (let v = 0; v < 8; v++) {
    const cv = document.createElement('canvas');
    if (!(cv instanceof HTMLCanvasElement)) {
      rockShardCache = null;
      return null;
    }
    cv.width = cv.height = spriteSize;
    const g = cv.getContext('2d');
    if (!g) {
      rockShardCache = null;
      return null;
    }
    g.translate(half, half);
    const seed = v * 1.37;
    const pts = 7;
    g.beginPath();
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * TAU;
      const n = Math.sin(seed + i * 1.9);
      const r = baseR * (0.7 + n * 0.35);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.closePath();
    const gr = g.createLinearGradient(-baseR, -baseR, baseR, baseR);
    gr.addColorStop(0, '#bfccdc');
    gr.addColorStop(0.5, '#708092');
    gr.addColorStop(1, '#303e52');
    g.fillStyle = gr;
    g.fill();
    g.strokeStyle = 'rgba(6,11,18,0.8)';
    g.lineWidth = 1.3;
    g.stroke();
    list.push(cv);
  }
  rockShardCache = list;
  return rockShardCache;
}

/** Pecahan bongkahan batu (pre-baked 8-variant sprite cache: 0 per-frame gradients!) */
export function drawRockFragment(c: CanvasRenderingContext2D, size: number, seed: number) {
  const shards = getRockShardSprites();
  if (shards) {
    const idx = ((seed * 3.1) | 0) & 7;
    const span = (size / 16) * 48;
    const half = span * 0.5;
    c.drawImage(shards[idx], -half, -half, span, span);
    return;
  }

  const pts = 7;
  c.beginPath();
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * TAU;
    const n = Math.sin(seed + i * 1.9);
    const r = size * (0.7 + n * 0.35);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
  c.fillStyle = '#708092';
  c.fill();
}
