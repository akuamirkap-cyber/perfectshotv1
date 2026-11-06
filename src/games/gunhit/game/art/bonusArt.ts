import { drawBreakerCoin } from '../../../shared/coinArt';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** The very same reflective dollar coin and specular sweep as Diamond Breaker. */
export function drawBonusCoin(
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number,
  phase = 0, glowing = false,
) {
  const flat = Math.abs(Math.cos(time * 2.2 + phase)) * 0.8 + 0.2;
  drawBreakerCoin(ctx, x, y, r, time, phase, flat, glowing);
}

interface SharedChestSprites {
  glow: HTMLCanvasElement;
  lid: HTMLCanvasElement;
  front: HTMLCanvasElement;
}

let sharedChestSprites: SharedChestSprites | null | undefined;

function getSharedChestSprites(): SharedChestSprites | null {
  if (sharedChestSprites !== undefined) return sharedChestSprites;
  if (typeof document === 'undefined' || typeof HTMLCanvasElement === 'undefined') {
    sharedChestSprites = null;
    return null;
  }

  const glow = document.createElement('canvas');
  const lid = document.createElement('canvas');
  const front = document.createElement('canvas');
  if (
    !(glow instanceof HTMLCanvasElement) ||
    !(lid instanceof HTMLCanvasElement) ||
    !(front instanceof HTMLCanvasElement)
  ) {
    sharedChestSprites = null;
    return null;
  }

  // 1. Pre-baked golden chest aura (192x192, scaled to 380x380)
  glow.width = glow.height = 192;
  const gc = glow.getContext('2d')!;
  const gl = gc.createRadialGradient(96, 96, 5, 96, 96, 96);
  gl.addColorStop(0, 'rgba(255,215,110,0.58)');
  gl.addColorStop(0.55, 'rgba(255,190,60,0.2)');
  gl.addColorStop(1, 'rgba(255,170,0,0)');
  gc.fillStyle = gl;
  gc.beginPath();
  gc.arc(96, 96, 96, 0, TAU);
  gc.fill();

  // 2. Pre-baked wooden curved lid (204x72, origin at (102, 58))
  lid.width = 204;
  lid.height = 72;
  const lc = lid.getContext('2d')!;
  lc.translate(102, 58);
  const lg = lc.createLinearGradient(0, -46, 0, 6);
  lg.addColorStop(0, '#8a5a2c');
  lg.addColorStop(0.5, '#6b4420');
  lg.addColorStop(1, '#4a2d14');
  lc.fillStyle = lg;
  lc.beginPath();
  lc.moveTo(-92, 4);
  lc.quadraticCurveTo(-92, -48, 0, -48);
  lc.quadraticCurveTo(92, -48, 92, 4);
  lc.closePath();
  lc.fill();
  lc.strokeStyle = '#c9972f';
  lc.lineWidth = 6;
  lc.beginPath();
  lc.moveTo(-34, -42);
  lc.lineTo(-34, 4);
  lc.moveTo(34, -42);
  lc.lineTo(34, 4);
  lc.stroke();
  lc.strokeStyle = '#8b6a1e';
  lc.lineWidth = 4;
  lc.beginPath();
  lc.moveTo(-92, 2);
  lc.quadraticCurveTo(0, -46, 92, 2);
  lc.stroke();
  lc.fillStyle = 'rgba(255,220,150,0.18)';
  lc.beginPath();
  lc.moveTo(-84, 2);
  lc.quadraticCurveTo(-84, -40, 0, -40);
  lc.quadraticCurveTo(84, -40, 84, 2);
  lc.closePath();
  lc.fill();

  // 3. Pre-baked wooden front wall + brass bands + keyhole + rivets (200x76, origin at (100, 4))
  front.width = 200;
  front.height = 76;
  const fc = front.getContext('2d')!;
  fc.translate(100, -2);
  const body = fc.createLinearGradient(0, 7, 0, 70);
  body.addColorStop(0, '#825326');
  body.addColorStop(0.45, '#60401e');
  body.addColorStop(1, '#3a2310');
  fc.fillStyle = body;
  fc.beginPath();
  fc.roundRect(-92, 10, 184, 58, 7);
  fc.fill();
  fc.strokeStyle = 'rgba(0,0,0,0.35)';
  fc.lineWidth = 2;
  for (let i = 1; i < 3; i++) {
    fc.beginPath();
    fc.moveTo(-92, 10 + i * 19);
    fc.lineTo(92, 10 + i * 19);
    fc.stroke();
  }
  fc.fillStyle = '#c9972f';
  fc.fillRect(-40, 10, 11, 58);
  fc.fillRect(29, 10, 11, 58);
  fc.fillStyle = 'rgba(255,240,180,0.45)';
  fc.fillRect(-40, 10, 3, 58);
  fc.fillRect(29, 10, 3, 58);
  fc.fillStyle = '#a87b1d';
  fc.beginPath();
  fc.roundRect(-92, 6, 184, 10, 3);
  fc.fill();
  fc.fillStyle = 'rgba(255,225,150,0.35)';
  fc.fillRect(-92, 6, 184, 2.5);
  fc.fillStyle = '#d4a62c';
  fc.beginPath();
  fc.roundRect(-13, 17, 26, 24, 5);
  fc.fill();
  fc.fillStyle = '#5a3f0a';
  fc.beginPath();
  fc.arc(0, 27, 4.6, 0, TAU);
  fc.fill();
  fc.fillRect(-1.8, 27, 3.6, 9);
  fc.fillStyle = '#e6c25a';
  for (let i = 0; i < 6; i++) {
    fc.beginPath();
    fc.arc(-80 + i * 32, 62, 2.8, 0, TAU);
    fc.fill();
  }

  sharedChestSprites = { glow, lid, front };
  return sharedChestSprites;
}

export class TreasureChest {
  shake = 0;
  lid = 0;
  private coins: { x: number; y: number; r: number; phase: number }[];
  private coinPile: HTMLCanvasElement | null = null;

  constructor() {
    // Overlapping tiers form a low, rounded heap WITHIN the 168px-wide mouth.
    const tiers = [
      { count: 5, halfWidth: 31, y: -29, radius: 9 },
      { count: 7, halfWidth: 49, y: -17, radius: 9.5 },
      { count: 9, halfWidth: 61, y: -5, radius: 10 },
      { count: 11, halfWidth: 70, y: 7, radius: 10 },
    ];
    this.coins = tiers.flatMap(({ count, halfWidth, y, radius }, row) =>
      Array.from({ length: count }, (_, i) => ({
        x: -halfWidth + (2 * halfWidth * i) / (count - 1) + rand(-1.2, 1.2) + (row % 2 ? 2 : -2),
        y: y + rand(-1, 1),
        r: radius + rand(-0.45, 0.45),
        phase: rand(0, TAU),
      })),
    ).sort((a, b) => a.y - b.y);
  }

  hit(power: number) {
    this.shake = Math.min(14, this.shake + 4 + power);
    this.lid = Math.min(1, this.lid + 0.04 + power * 0.01);
  }

  update(dt: number) {
    this.shake = Math.max(0, this.shake - dt * 30);
    this.lid = Math.max(0, this.lid - dt * 0.12);
  }

  private getCoinPile() {
    if (this.coinPile) return this.coinPile;
    const image = document.createElement('canvas');
    // Pre-bakes shadow + recessed cavity + coin heap into one crisp sprite!
    image.width = 240;
    image.height = 180;
    const c = image.getContext('2d')!;
    c.translate(120, 82);

    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath();
    c.ellipse(0, 72, 108, 18, 0, 0, TAU);
    c.fill();

    c.fillStyle = '#633914';
    c.beginPath();
    c.roundRect(-87, -8, 174, 29, 9);
    c.fill();
    const cavity = c.createRadialGradient(0, 2, 8, 0, 3, 92);
    cavity.addColorStop(0, '#47290d');
    cavity.addColorStop(1, '#211207');
    c.fillStyle = cavity;
    c.beginPath();
    c.ellipse(0, 3, 83, 17, 0, 0, TAU);
    c.fill();
    c.strokeStyle = '#a16d2d';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, 3, 85, 17, 0, Math.PI, TAU);
    c.stroke();

    const mound = c.createLinearGradient(0, -40, 0, 18);
    mound.addColorStop(0, '#f4cf6d');
    mound.addColorStop(0.4, '#d5a337');
    mound.addColorStop(1, '#764415');
    c.beginPath();
    c.moveTo(-80, 15);
    c.bezierCurveTo(-79, -13, -52, -26, -37, -27);
    c.bezierCurveTo(-27, -39, 17, -40, 37, -27);
    c.bezierCurveTo(61, -23, 79, -6, 80, 15);
    c.closePath();
    c.fillStyle = mound;
    c.fill();
    c.strokeStyle = 'rgba(81,45,12,0.6)';
    c.lineWidth = 1.5;
    c.stroke();
    for (const coin of this.coins) drawBonusCoin(c, coin.x, coin.y, coin.r, 0, coin.phase);
    this.coinPile = image;
    return image;
  }

  /** The source chest is drawn at (0,0), 184px across and 162px high (sprite-cached). */
  draw(ctx: CanvasRenderingContext2D, time: number, drawEmbedded?: (ctx: CanvasRenderingContext2D) => void) {
    const shared = getSharedChestSprites();
    ctx.save();
    ctx.translate(
      this.shake ? rand(-1, 1) * this.shake * 0.5 : 0,
      this.shake ? rand(-1, 1) * this.shake * 0.3 : 0,
    );

    if (shared) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = Math.min(1, 0.48 + this.lid * 0.48);
      ctx.drawImage(shared.glow, -190, -210, 380, 380);
      ctx.restore();

      ctx.save();
      ctx.translate(0, -34);
      ctx.rotate(-0.95 - this.lid * 0.25);
      ctx.drawImage(shared.lid, -102, -58);
      ctx.restore();

      ctx.drawImage(this.getCoinPile(), -120, -82);
      ctx.drawImage(shared.front, -100, 2);
    }

    drawEmbedded?.(ctx);

    for (const [i, x, y] of [[0, -39, -21], [1, 5, -32], [2, 48, -12]]) {
      const glint = Math.max(0, Math.sin(time * 3 + i * 2.1)) ** 4;
      if (glint < 0.05) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = glint * 0.8;
      ctx.fillStyle = '#fff5c7';
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(1, -1);
      ctx.lineTo(4, 0);
      ctx.lineTo(1, 1);
      ctx.lineTo(0, 4);
      ctx.lineTo(-1, 1);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-1, -1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}
