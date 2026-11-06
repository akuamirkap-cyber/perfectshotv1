const TAU = Math.PI * 2;
const UNIT_RADIUS = 12;
const SPRITE_DPR = 1.25;
const SPRITE_SIZE = 64; // Fits true 25px halo at 1.25x (4x smaller L1 GPU cache footprint!).
const SWEEP_FRAMES = 12;

interface CoinSprites {
  plainFrames: HTMLCanvasElement[];
  glowFrames: HTMLCanvasElement[];
  twinkleSprite: HTMLCanvasElement;
}

let sprites: CoinSprites | null = null;

function makeSprite(size = SPRITE_SIZE, dpr = SPRITE_DPR) {
  const image = document.createElement('canvas');
  image.width = image.height = size;
  const c = image.getContext('2d')!;
  c.setTransform(dpr, 0, 0, dpr, size / 2, size / 2);
  return { image, c };
}

/**
 * Pre-bake 12 specular-sweep coin frames (both plain and glowing) + 1 twinkle star sprite
 * onto compact 64x64 L1-cache-friendly canvases. Eliminates per-frame `ctx.clip()`,
 * `ctx.save/restore`, `toFixed()` string allocations, and 75% of GPU texel reads on Bonus Stage!
 */
function coinSprites(): CoinSprites {
  if (sprites) return sprites;
  const r = UNIT_RADIUS;

  const { image: face, c } = makeSprite();
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#fff8d0');
  g.addColorStop(0.45, '#ffd54a');
  g.addColorStop(0.8, '#e8a317');
  g.addColorStop(1, '#a86a08');
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(255,245,190,0.85)';
  c.lineWidth = r * 0.12;
  c.beginPath();
  c.arc(0, 0, r * 0.76, 0, TAU);
  c.stroke();
  c.fillStyle = 'rgba(180,110,10,0.55)';
  c.font = `900 ${r * 1.05}px system-ui, sans-serif`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('$', 0, r * 0.06);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.beginPath();
  c.ellipse(-r * 0.34, -r * 0.4, r * 0.2, r * 0.13, -0.6, 0, TAU);
  c.fill();

  const { image: sheen, c: shine } = makeSprite();
  shine.rotate(-0.6);
  const stripe = shine.createLinearGradient(-r, 0, r, 0);
  stripe.addColorStop(0, 'rgba(255,255,255,0)');
  stripe.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  stripe.addColorStop(1, 'rgba(255,255,255,0)');
  shine.fillStyle = stripe;
  shine.beginPath();
  shine.ellipse(0, 0, r * 0.32, r, 0, 0, TAU);
  shine.fill();

  const { image: glow, c: light } = makeSprite();
  const halo = light.createRadialGradient(0, 0, 0, 0, 0, 25);
  halo.addColorStop(0, 'rgba(255,215,90,0.42)');
  halo.addColorStop(0.55, 'rgba(255,195,50,0.16)');
  halo.addColorStop(1, 'rgba(255,180,0,0)');
  light.fillStyle = halo;
  light.beginPath();
  light.arc(0, 0, 25, 0, TAU);
  light.fill();

  const plainFrames: HTMLCanvasElement[] = [];
  const glowFrames: HTMLCanvasElement[] = [];

  for (let i = 0; i < SWEEP_FRAMES; i++) {
    const sweep = i / (SWEEP_FRAMES - 1);

    // 1. Pre-clipped plain coin frame (face + circularly clipped sheen)
    const plain = document.createElement('canvas');
    plain.width = plain.height = SPRITE_SIZE;
    const pc = plain.getContext('2d')!;
    pc.drawImage(face, 0, 0);
    pc.save();
    pc.setTransform(SPRITE_DPR, 0, 0, SPRITE_DPR, SPRITE_SIZE / 2, SPRITE_SIZE / 2);
    pc.beginPath();
    pc.arc(0, 0, UNIT_RADIUS, 0, TAU);
    pc.clip();
    pc.globalCompositeOperation = 'lighter';
    pc.globalAlpha = 0.35 + sweep * 0.6;
    const dx = (sweep - 0.5) * UNIT_RADIUS * 1.9;
    pc.setTransform(1, 0, 0, 1, dx * SPRITE_DPR, 0);
    pc.drawImage(sheen, 0, 0);
    pc.restore();
    plainFrames.push(plain);

    // 2. Pre-composited glowing coin frame (halo + pre-clipped coin)
    const glowing = document.createElement('canvas');
    glowing.width = glowing.height = SPRITE_SIZE;
    const gc = glowing.getContext('2d')!;
    gc.drawImage(glow, 0, 0);
    gc.drawImage(plain, 0, 0);
    glowFrames.push(glowing);
  }

  // 3. Pre-baked 4-point coin twinkle sprite (eliminates per-frame path + string allocs)
  const twinkleSprite = document.createElement('canvas');
  twinkleSprite.width = twinkleSprite.height = 32;
  const tc = twinkleSprite.getContext('2d')!;
  tc.translate(16, 16);
  tc.fillStyle = '#fffbe0';
  const ts = 14;
  const ti = ts * 0.18;
  tc.beginPath();
  tc.moveTo(0, -ts);
  tc.lineTo(ti, -ti);
  tc.lineTo(ts, 0);
  tc.lineTo(ti, ti);
  tc.lineTo(0, ts);
  tc.lineTo(-ti, ti);
  tc.lineTo(-ts, 0);
  tc.lineTo(-ti, -ti);
  tc.closePath();
  tc.fill();

  sprites = { plainFrames, glowFrames, twinkleSprite };
  return sprites;
}

/** Vector equivalent for non-browser canvas hosts that cannot create sprite canvases. */
function drawVectorCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number, phase: number, flat: number, glowing: boolean, sparkle: boolean) {
  ctx.save(); ctx.translate(x, y); ctx.scale(flat, 1);
  if (glowing) {
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
    halo.addColorStop(0, 'rgba(255,215,90,0.42)'); halo.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, r * 2, 0, TAU); ctx.fill();
  }
  const face = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  face.addColorStop(0, '#fff8d0'); face.addColorStop(0.45, '#ffd54a');
  face.addColorStop(0.8, '#e8a317'); face.addColorStop(1, '#a86a08');
  ctx.fillStyle = face; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,245,190,0.85)'; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.76, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(180,110,10,0.55)'; ctx.font = `900 ${r * 1.05}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, r * 0.06);
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath();
  ctx.ellipse(-r * 0.34 + Math.sin(time * 3.4 + phase) * r * 0.1, -r * 0.4, r * 0.2, r * 0.13, -0.6, 0, TAU); ctx.fill();
  if (sparkle && Math.sin(time * 5 + phase * 2) > 0.78) {
    ctx.strokeStyle = '#fffbe0'; ctx.lineWidth = r * 0.1;
    ctx.beginPath(); ctx.moveTo(r * 0.25, -r * 0.5); ctx.lineTo(r * 0.75, -r * 0.5);
    ctx.moveTo(r * 0.5, -r * 0.75); ctx.lineTo(r * 0.5, -r * 0.25); ctx.stroke();
  }
  ctx.restore();
}

/** The same reflective dollar sign, moving specular sweep and sparkle in both games — zero per-frame clip() or save/restore! */
export function drawBreakerCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  phase = 0,
  flat = 1,
  glowing = false,
  sparkle = true,
) {
  if (typeof document === 'undefined') {
    drawVectorCoin(ctx, x, y, r, time, phase, flat, glowing, sparkle);
    return;
  }
  const { plainFrames, glowFrames, twinkleSprite } = coinSprites();
  const imageScale = r / (UNIT_RADIUS * SPRITE_DPR);
  const sweep = (Math.sin(time * 3.4 + phase) + 1) * 0.5;
  const frameIdx = Math.min(SWEEP_FRAMES - 1, Math.max(0, (sweep * SWEEP_FRAMES) | 0));
  const frame = glowing ? glowFrames[frameIdx] : plainFrames[frameIdx];

  const drawSize = SPRITE_SIZE * imageScale;
  const drawW = drawSize * flat;
  ctx.drawImage(frame, x - drawW * 0.5, y - drawSize * 0.5, drawW, drawSize);

  if (!sparkle) return;
  const twinkle = Math.sin(time * 5 + phase * 2);
  if (twinkle <= 0.78) return;
  const alpha = Math.min(1, (twinkle - 0.78) * 4.2);
  const prevAlpha = ctx.globalAlpha;
  ctx.globalAlpha = prevAlpha * alpha;
  const sx = x + r * 0.5;
  const sy = y - r * 0.5;
  const size = r * 1.45;
  ctx.drawImage(twinkleSprite, sx - size, sy - size, size * 2, size * 2);
  ctx.globalAlpha = prevAlpha;
}
