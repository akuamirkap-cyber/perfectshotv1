const TAU = Math.PI * 2;
const DIAMOND_FRAMES = 16;
const DIAMOND_SPRITE_SIZE = 160;
const DIAMOND_SPRITE_DPR = 1.25;

const G = [
  { x: -54, y: -6 },
  { x: -27, y: -6 },
  { x: 0, y: -6 },
  { x: 27, y: -6 },
  { x: 54, y: -6 },
];
const T = [
  { x: -28, y: -29 },
  { x: -9, y: -29 },
  { x: 9, y: -29 },
  { x: 28, y: -29 },
];
const P = { x: 0, y: 52 };
const STRIP = [G[0], T[0], G[1], T[1], G[2], T[2], G[3], T[3], G[4]];
const CROWN_L = [78, 92, 70, 88, 64, 84, 72, 90, 76];
const PAV_L = [55, 72, 48, 66];

let cachedDiamondFrames: HTMLCanvasElement[] | null | undefined;

function renderDiamondVector(ctx: CanvasRenderingContext2D, t: number) {
  for (let i = 0; i < STRIP.length - 2; i++) {
    const a = STRIP[i], b = STRIP[i + 1], c = STRIP[i + 2];
    ctx.fillStyle = `hsl(${188 + i * 3},92%,${CROWN_L[i] + Math.sin(t * 2 + i) * 6}%)`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = `hsl(195,100%,${90 + Math.sin(t * 3) * 5}%)`;
  ctx.beginPath();
  ctx.moveTo(T[0].x, T[0].y);
  ctx.lineTo(T[3].x, T[3].y);
  ctx.lineTo(T[2].x, -21);
  ctx.lineTo(T[1].x, -21);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const a = G[i], b = G[i + 1];
    const midX = ((a.x + b.x) / 2) * 0.5;
    const midY = 22;
    const l = PAV_L[i] + Math.sin(t * 2.4 + i * 1.7) * 7;
    ctx.fillStyle = `hsl(${200 + i * 4},85%,${l}%)`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `hsl(${205 + i * 4},85%,${l - 12}%)`;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(P.x, P.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `hsl(${195 + i * 4},85%,${l + 8}%)`;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(midX, midY);
    ctx.lineTo(P.x, P.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(T[0].x, T[0].y);
  ctx.lineTo(T[3].x, T[3].y);
  ctx.lineTo(G[4].x, G[4].y);
  ctx.lineTo(P.x, P.y);
  ctx.lineTo(G[0].x, G[0].y);
  ctx.closePath();
  ctx.stroke();

  const sp = (Math.sin(t * 2) + 1) / 2;
  const sx = -20 + Math.sin(t) * 10, sy = -18, s = 6 + sp * 8;
  ctx.fillStyle = `rgba(255,255,255,${0.4 + sp * 0.6})`;
  ctx.beginPath();
  ctx.moveTo(sx, sy - s);
  ctx.lineTo(sx + s * 0.18, sy - s * 0.18);
  ctx.lineTo(sx + s, sy);
  ctx.lineTo(sx + s * 0.18, sy + s * 0.18);
  ctx.lineTo(sx, sy + s);
  ctx.lineTo(sx - s * 0.18, sy + s * 0.18);
  ctx.lineTo(sx - s, sy);
  ctx.lineTo(sx - s * 0.18, sy - s * 0.18);
  ctx.closePath();
  ctx.fill();
}

function getDiamondFrames(): HTMLCanvasElement[] | null {
  if (cachedDiamondFrames !== undefined) return cachedDiamondFrames;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    cachedDiamondFrames = null;
    return null;
  }
  const frames: HTMLCanvasElement[] = [];
  for (let i = 0; i < DIAMOND_FRAMES; i++) {
    const cv = document.createElement('canvas');
    if (!(cv instanceof HTMLCanvasElement)) {
      cachedDiamondFrames = null;
      return null;
    }
    cv.width = cv.height = DIAMOND_SPRITE_SIZE;
    const g = cv.getContext('2d');
    if (!g) {
      cachedDiamondFrames = null;
      return null;
    }
    g.setTransform(
      DIAMOND_SPRITE_DPR,
      0,
      0,
      DIAMOND_SPRITE_DPR,
      DIAMOND_SPRITE_SIZE * 0.5,
      DIAMOND_SPRITE_SIZE * 0.5,
    );
    renderDiamondVector(g, (i / DIAMOND_FRAMES) * TAU);
    frames.push(cv);
  }
  cachedDiamondFrames = frames;
  return cachedDiamondFrames;
}

/** The faceted diamond used by Diamond Breaker, shared with Gun Hit Arcade (16-frame sprite cached). */
export function drawBreakerDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  scale: number,
) {
  const frames = getDiamondFrames();
  if (frames) {
    const normPhase = (((t % TAU) + TAU) % TAU) / TAU;
    const idx = Math.min(DIAMOND_FRAMES - 1, (normPhase * DIAMOND_FRAMES) | 0);
    const drawSize = (DIAMOND_SPRITE_SIZE / DIAMOND_SPRITE_DPR) * scale;
    const half = drawSize * 0.5;
    ctx.drawImage(frames[idx], x - half, y - half, drawSize, drawSize);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  renderDiamondVector(ctx, t);
  ctx.restore();
}
