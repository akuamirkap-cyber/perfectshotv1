// Slide #3 ("Firework 8-Gun" — games/fireworkgun) Bazooka projectile, muzzle sparks/heat,
// warhead detonation, sustainer trail, and smoky battlefield dusk background for SGA.

import { slide23Sfx } from './slide23Sfx';

const TAU = Math.PI * 2;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

export const BAZOOKA_HUES = [45, 90, 140, 200, 280, 0] as const;

function starPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Exact Slide #3 (`games/fireworkgun/src/game/engine.ts` lines 831–1128) `drawBazookaShell`,
 * oriented for SGA projectiles: copper shaped-charge nose cone & fuse tip at `y = 0` pointing UP (`-y`),
 * olive-drab steel body, white stencil star, red/yellow bands, blinking tracer halo, tail fins,
 * steel nozzle, warhead/projectile glow, and 3-layer sustainer exhaust flame + mach diamonds extending to `+y`.
 */
export function drawSlide3BazookaShell(
  ctx: CanvasRenderingContext2D,
  hue = 45,
  t = 0,
  seed = 1.7,
  flash = 0,
  exhaust = 1,
) {
  ctx.save();
  // Rotate +90 deg so Slide #3's nose at x=0 (facing -x) points UP (-y) and tail (+x) extends DOWN (+y)
  ctx.rotate(Math.PI / 2);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const line = 'rgba(18,20,9,0.92)';
  const flick = Math.sin(t * 43 + seed * 9) * 0.5 + Math.sin(t * 61 + seed * 4) * 0.3;

  // ---- Warm warhead & rocket-body aura glow (glow peluru bazooka Slide #3) ----
  ctx.save();
  const bodyGlow = ctx.createRadialGradient(26, 0, 2, 26, 0, 34);
  bodyGlow.addColorStop(0, `rgba(255,195,95,${0.32 + 0.16 * exhaust})`);
  bodyGlow.addColorStop(0.55, `rgba(255,125,35,${0.16 + 0.1 * exhaust})`);
  bodyGlow.addColorStop(1, 'rgba(255,90,20,0)');
  ctx.fillStyle = bodyGlow;
  ctx.beginPath();
  ctx.arc(26, 0, 34, 0, TAU);
  ctx.fill();
  ctx.restore();

  // ---- exhaust back-glow halo (under everything) ----
  if (exhaust > 0.01) {
    ctx.save();
    const halo = ctx.createRadialGradient(62, 0, 2, 62, 0, 36);
    halo.addColorStop(0, `rgba(255,200,110,${0.55 * exhaust})`);
    halo.addColorStop(0.5, `rgba(255,130,40,${0.25 * exhaust})`);
    halo.addColorStop(1, 'rgba(255,110,30,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(62, 0, 36, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // ---- tail fins with thickness + shadow ----
  for (const s of [-1, 1]) {
    ctx.fillStyle = 'rgba(12,14,6,0.55)';
    ctx.beginPath();
    ctx.moveTo(39, s * 4);
    ctx.lineTo(55, s * 12.5);
    ctx.lineTo(57.5, s * 12.5);
    ctx.lineTo(47, s * 4);
    ctx.closePath();
    ctx.fill();

    const fg = ctx.createLinearGradient(40, 0, 56, s * 12);
    fg.addColorStop(0, '#55652c');
    fg.addColorStop(0.55, '#3d4a20');
    fg.addColorStop(1, '#242b12');
    ctx.fillStyle = fg;
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(38, s * 4);
    ctx.lineTo(54, s * 11);
    ctx.lineTo(57, s * 11);
    ctx.lineTo(46, s * 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // worn yellow tip edge
    ctx.strokeStyle = '#e8c832';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(54, s * 11);
    ctx.lineTo(57, s * 11);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,240,0.35)';
    ctx.beginPath();
    ctx.moveTo(40, s * 4.5);
    ctx.lineTo(50, s * 9.5);
    ctx.lineTo(48.5, s * 9.5);
    ctx.lineTo(39, s * 4.5);
    ctx.closePath();
    ctx.fill();
  }

  // ---- exhaust nozzle: steel ring + dark bore + hot throat ----
  const nozG = ctx.createLinearGradient(0, -5, 0, 5);
  nozG.addColorStop(0, '#5a5a64');
  nozG.addColorStop(0.45, '#2b2b30');
  nozG.addColorStop(1, '#121214');
  ctx.fillStyle = nozG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(50, -4.8, 9.5, 9.6, 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#060608';
  ctx.beginPath();
  ctx.ellipse(59.5, 0, 2.2, 3.4, 0, 0, TAU);
  ctx.fill();
  if (exhaust > 0.01) {
    ctx.fillStyle = `rgba(255,${170 + Math.round(flick * 30)},80,${0.95 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(59.5, 0, 1.4, 2.4, 0, 0, TAU);
    ctx.fill();
  }

  // ---- main tube body: brushed olive steel ----
  const bodyG = ctx.createLinearGradient(0, -6.5, 0, 6.5);
  bodyG.addColorStop(0, '#a8b862');
  bodyG.addColorStop(0.22, '#7c8c44');
  bodyG.addColorStop(0.45, '#59682e');
  bodyG.addColorStop(0.72, '#39421e');
  bodyG.addColorStop(1, '#202613');
  ctx.fillStyle = bodyG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(14, -6.5, 38, 13, 2.5);
  ctx.fill();
  ctx.stroke();

  // cylindrical top light + bottom bounce
  ctx.fillStyle = 'rgba(255,255,225,0.42)';
  ctx.fillRect(16, -5.6, 34, 1.8);
  ctx.fillStyle = 'rgba(255,220,150,0.12)';
  ctx.fillRect(16, 3.2, 34, 2.2);

  // brushed-metal streaks
  ctx.strokeStyle = 'rgba(20,24,10,0.28)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    const yy = -2.5 + i * 2.4 + Math.sin(seed * 5 + i) * 0.5;
    ctx.beginPath();
    ctx.moveTo(16, yy);
    ctx.lineTo(50, yy);
    ctx.stroke();
  }

  // battle-wear scratches
  ctx.strokeStyle = 'rgba(230,235,200,0.5)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(20 + (seed % 6), -4);
  ctx.lineTo(24 + (seed % 6), 2);
  ctx.moveTo(44, 1);
  ctx.lineTo(47, 4.5);
  ctx.stroke();

  // red warhead band with shading
  const bandG = ctx.createLinearGradient(0, -6.5, 0, 6.5);
  bandG.addColorStop(0, '#e0484e');
  bandG.addColorStop(0.5, '#a01e24');
  bandG.addColorStop(1, '#5e1115');
  ctx.fillStyle = bandG;
  ctx.fillRect(30, -6.5, 5, 13);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(30, -6.5, 5, 2.2);

  // yellow stencil stripe + star with drop shadow
  ctx.fillStyle = '#e8c832';
  ctx.fillRect(42, -6.5, 3, 13);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(42, 2.5, 3, 4);

  ctx.save();
  ctx.translate(22.6, 0.7);
  ctx.scale(0.55, 0.55);
  starPath(ctx, 7);
  ctx.fillStyle = 'rgba(10,12,5,0.5)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(22, 0);
  ctx.scale(0.55, 0.55);
  starPath(ctx, 7);
  ctx.fillStyle = 'rgba(242,242,218,0.95)';
  ctx.fill();
  ctx.restore();

  // rivets with specular dots
  for (const rx of [17, 49]) {
    for (const ry of [-3.5, 3.5]) {
      ctx.fillStyle = '#1c1e10';
      ctx.beginPath();
      ctx.arc(rx, ry, 1.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,230,0.7)';
      ctx.beginPath();
      ctx.arc(rx - 0.35, ry - 0.35, 0.45, 0, TAU);
      ctx.fill();
    }
  }

  // ---- copper shaped-charge cone with specular sweep ----
  const noseG = ctx.createLinearGradient(0, -7.5, 0, 7.5);
  noseG.addColorStop(0, '#ffd9a0');
  noseG.addColorStop(0.3, '#e8934a');
  noseG.addColorStop(0.6, '#a05a1a');
  noseG.addColorStop(1, '#5e2f0c');
  ctx.fillStyle = noseG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.quadraticCurveTo(5, -7.5, 15, -6.5);
  ctx.lineTo(15, 6.5);
  ctx.quadraticCurveTo(5, 7.5, -1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // cone specular streak
  ctx.strokeStyle = 'rgba(255,240,215,0.75)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(3, -4.5);
  ctx.quadraticCurveTo(8, -5.2, 12.5, -5);
  ctx.stroke();

  // cone base ring
  ctx.fillStyle = '#3a3a40';
  ctx.fillRect(13.5, -6.5, 2.2, 13);

  // nose fuse tip: steel + glass dot
  const fuseG = ctx.createRadialGradient(-2, -1, 0.4, -1.5, 0, 2.8);
  fuseG.addColorStop(0, '#ffffff');
  fuseG.addColorStop(0.6, '#b8b8c4');
  fuseG.addColorStop(1, '#5a5a66');
  ctx.fillStyle = fuseG;
  ctx.strokeStyle = line;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(-1.5, 0, 2.5, 0, TAU);
  ctx.fill();
  ctx.stroke();

  // tracer light with halo
  const tw = 0.5 + 0.5 * Math.sin(t * 9 + seed * 6);
  ctx.save();
  const tg = ctx.createRadialGradient(37.5, 0, 0, 37.5, 0, 7.5);
  tg.addColorStop(0, hsl(hue, 100, 62, 0.65 * (0.4 + 0.6 * tw)));
  tg.addColorStop(1, hsl(hue, 100, 60, 0));
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.arc(37.5, 0, 7.5, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = hsl(hue, 100, 62, 0.65 + 0.35 * tw);
  ctx.beginPath();
  ctx.arc(37.5, 0, 1.9, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(37.1, -0.4, 0.65, 0, TAU);
  ctx.fill();

  // ---- sustainer exhaust: 3-layer flame + mach diamonds + smoke root + sparks ----
  if (exhaust > 0.01) {
    const fl = 17 + flick * 5;
    const wob = Math.sin(t * 55 + seed * 7) * 1.4;
    ctx.save();
    // outer tongue (deep orange, translucent)
    const outer = ctx.createLinearGradient(59, 0, 59 + fl + 14, 0);
    outer.addColorStop(0, `rgba(255,150,50,${0.8 * exhaust})`);
    outer.addColorStop(0.55, `rgba(255,110,25,${0.5 * exhaust})`);
    outer.addColorStop(1, 'rgba(255,70,15,0)');
    ctx.fillStyle = outer;
    ctx.beginPath();
    ctx.moveTo(59, -5.2);
    ctx.quadraticCurveTo(59 + fl * 0.55, -5.5 + wob, 59 + fl + 12, wob * 1.4);
    ctx.quadraticCurveTo(59 + fl * 0.55, 5.5 + wob, 59, 5.2);
    ctx.closePath();
    ctx.fill();

    // mid tongue (gold)
    const mid = ctx.createLinearGradient(59, 0, 59 + fl * 0.72, 0);
    mid.addColorStop(0, `rgba(255,240,180,${0.95 * exhaust})`);
    mid.addColorStop(0.6, `rgba(255,205,90,${0.82 * exhaust})`);
    mid.addColorStop(1, 'rgba(255,160,50,0)');
    ctx.fillStyle = mid;
    ctx.beginPath();
    ctx.moveTo(59, -3.2);
    ctx.quadraticCurveTo(59 + fl * 0.4, -3.4 + wob * 0.6, 59 + fl * 0.72, wob * 0.8);
    ctx.quadraticCurveTo(59 + fl * 0.4, 3.4 + wob * 0.6, 59, 3.2);
    ctx.closePath();
    ctx.fill();

    // white-hot core
    ctx.fillStyle = `rgba(255,255,255,${0.95 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(62.5, wob * 0.3, 5.5, 2.4, 0, 0, TAU);
    ctx.fill();

    // mach diamonds
    ctx.fillStyle = `rgba(220,240,255,${0.85 * exhaust})`;
    for (let i = 0; i < 2; i++) {
      const dx = 66 + i * 6 + flick * 1.5;
      const dw = 2.6 - i * 0.8;
      ctx.beginPath();
      ctx.moveTo(dx - dw, 0);
      ctx.lineTo(dx, -1.5);
      ctx.lineTo(dx + dw, 0);
      ctx.lineTo(dx, 1.5);
      ctx.closePath();
      ctx.fill();
    }

    // sparkling exhaust embers ("percikan-percikan bazooka")
    for (let i = 0; i < 5; i++) {
      const ph = ((t * 5.5 + i * 0.37 + seed) % 1);
      const sx = 61 + ph * (fl + 15);
      const sy = Math.sin(t * 19 + i * 2.4 + seed) * (3.5 + ph * 6.5);
      const sr = (1 - ph * 0.55) * 1.65;
      ctx.fillStyle = i % 2 === 0 ? `rgba(255,235,150,${(1 - ph) * 0.95 * exhaust})` : `rgba(255,150,50,${(1 - ph) * 0.9 * exhaust})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // smoke root wisp (normal blending, gray)
    ctx.fillStyle = `rgba(150,148,142,${0.4 * exhaust})`;
    ctx.beginPath();
    ctx.ellipse(59 + fl + 10, wob * 1.4, 7, 4.5, 0, 0, TAU);
    ctx.fill();
  }

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, flash) * 0.7})`;
    ctx.beginPath();
    ctx.roundRect(-2, -7, 61, 14, 4);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws the scorched crater, flickering molten rim, bent armor lips, glowing stress cracks,
 * and cooling ember sparks on top of the target wheel face where the Bazooka shell is lodged.
 */
export function drawSlide3BazookaStuckCrater(
  ctx: CanvasRenderingContext2D,
  t = 0,
  seed = 1.7,
  bite = 0.6,
) {
  ctx.save();
  const ck = Math.min(1, Math.max(0.38, bite * 1.4));
  const flick = 0.78 + 0.22 * Math.sin(t * 31 + seed * 9);

  // 1. Wide soot wash on the wheel rim
  const soot = ctx.createRadialGradient(0, -2, 2, 0, -2, 22);
  soot.addColorStop(0, `rgba(10,7,5,${0.82 * ck})`);
  soot.addColorStop(0.55, `rgba(20,14,9,${0.5 * ck})`);
  soot.addColorStop(1, 'rgba(25,18,12,0)');
  ctx.fillStyle = soot;
  ctx.beginPath();
  ctx.arc(0, -2, 22, 0, TAU);
  ctx.fill();

  // 2. Deep punched crater behind the shell nose
  ctx.fillStyle = `rgba(8,6,4,${0.72 + 0.23 * ck})`;
  ctx.beginPath();
  ctx.ellipse(0, -2, 8.5, 10, 0, 0, TAU);
  ctx.fill();

  // 3. Flickering molten orange-white crater rim
  const mg = ctx.createRadialGradient(0, -2, 1, 0, -2, 13);
  mg.addColorStop(0, `rgba(255,245,220,${0.8 * ck * flick})`);
  mg.addColorStop(0.45, `rgba(255,170,70,${0.6 * ck * flick})`);
  mg.addColorStop(1, 'rgba(255,110,30,0)');
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(0, -2, 13, 0, TAU);
  ctx.fill();

  // 4. Bent armor lips + glowing stress cracks
  ctx.strokeStyle = `rgba(200,190,150,${0.55 + 0.35 * ck})`;
  ctx.lineWidth = 1.8;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 6, -6);
    ctx.quadraticCurveTo(s * 9, -11, s * 8, -15);
    ctx.stroke();
  }
  const cracks: [number, number][] = [[-14, -12], [0, -18], [14, -12]];
  for (const [dx, dy] of cracks) {
    ctx.strokeStyle = `rgba(255,190,90,${0.58 * ck * flick})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(dx * 0.5, dy * 0.6, dx, dy);
    ctx.stroke();
  }

  // 5. Cooling ember dots ("percikan-percikan") around the crater
  for (let i = 0; i < 4; i++) {
    const a = seed * 3 + i * 1.7 + t * 0.6;
    const ex = Math.cos(a) * (11 + (i % 3) * 2.5);
    const ey = -2 + Math.sin(a) * (8 + (i % 2) * 2.5);
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 6 + i * 2.1 + seed * 5));
    ctx.fillStyle = `rgba(255,${145 + Math.round(tw * 65)},70,${tw * ck})`;
    ctx.beginPath();
    ctx.arc(ex, ey, 1.35, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws the stuck Slide #3 Bazooka shell rammed nose-first into the target wheel
 * with scorched crater, flickering molten rim, bent armor lips, glowing stress cracks,
 * and cooling ember sparks (`games/fireworkgun/src/game/engine.ts` lines 5348–5389 & 6063–6128).
 */
export function drawSlide3BazookaEmbedded(
  ctx: CanvasRenderingContext2D,
  hue = 45,
  t = 0,
  seed = 1.7,
  flash = 0,
  bite = 0.6,
) {
  ctx.save();
  drawSlide3BazookaStuckCrater(ctx, t, seed, bite);
  drawSlide3BazookaShell(ctx, hue, t, seed, flash, 0);
  ctx.restore();
}

/**
 * Enhances SGA's Slide #1 Bazooka gun muzzle (`cx, y0`) with Slide #3's:
 * - Hot battlefield glow & layered muzzle heat inside the blast bell
 * - Hovering/peeking Slide #3 Bazooka shell when `ready`
 * - Sparkling Bazooka embers & heat smoke wisps ("percikan-percikan bazooka kek slide 3")
 */
export function drawSlide3BazookaMuzzleFx(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y0: number,
  ready: boolean,
  t: number,
  sinceShot: number,
) {
  ctx.save();
  const heat = Math.max(0.28, Math.exp(-sinceShot * 5.5));

  // 1. Warm battlefield glow around the muzzle
  const bgGlow = ctx.createRadialGradient(cx, y0 + 8, 2, cx, y0 + 8, 52);
  bgGlow.addColorStop(0, `rgba(255,145,50,${0.22 + heat * 0.25})`);
  bgGlow.addColorStop(0.6, `rgba(255,105,25,${0.1 + heat * 0.12})`);
  bgGlow.addColorStop(1, 'rgba(255,80,15,0)');
  ctx.fillStyle = bgGlow;
  ctx.beginPath();
  ctx.arc(cx, y0 + 8, 52, 0, TAU);
  ctx.fill();

  // 2. Loaded Slide #3 Bazooka shell peeking out of the muzzle when ready
  if (ready) {
    const loadP = Math.min(1, sinceShot / 0.28);
    const e = 1 - Math.pow(1 - loadP, 3);
    const bob = Math.sin(t * 3.1) * 1.8;
    const tipY = y0 - 30 + (1 - e) * 28 + bob;
    if (e < 0.99) {
      ctx.strokeStyle = `rgba(255,200,110,${(1 - e) * 0.78})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(cx, tipY + 12, 12 + (1 - e) * 18, 0, TAU);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(cx, tipY);
    ctx.scale(0.68, 0.68);
    drawSlide3BazookaShell(ctx, 45, t, 3.3, 0, 0);
    ctx.restore();
  }

  // 3. Layered muzzle heat inside the flared blast bell (white core -> orange -> red rim)
  const eg = ctx.createRadialGradient(cx, y0, 0, cx, y0, 20);
  eg.addColorStop(0, `rgba(255,245,220,${heat * 0.85})`);
  eg.addColorStop(0.42, `rgba(255,190,90,${heat * 0.72})`);
  eg.addColorStop(0.78, `rgba(255,120,35,${heat * 0.42})`);
  eg.addColorStop(1, 'rgba(200,60,15,0)');
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.ellipse(cx, y0, 19, 6.5, 0, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = `rgba(255,${145 + Math.round(heat * 55)},70,${0.45 + heat * 0.45})`;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(cx, y0, 17, 4.2, 0, 0, TAU);
  ctx.stroke();

  // 4. Heat smoke wisps + sparkling Bazooka embers ("percikan-percikan bazooka") curling off muzzle
  for (let i = 0; i < 4; i++) {
    const cyc = (t * 0.85 + i * 0.25) % 1;
    const wx = cx + Math.sin(t * 2.4 + i * 1.9) * (6 + cyc * 10);
    const wy = y0 - 4 - cyc * 24;
    const wr = 4 + cyc * 6.5;
    const wa = (1 - cyc) * 0.28;
    const sg = ctx.createRadialGradient(wx, wy, 0, wx, wy, wr);
    sg.addColorStop(0, `rgba(95,88,78,${wa})`);
    sg.addColorStop(1, 'rgba(60,55,48,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(wx, wy, wr, 0, TAU);
    ctx.fill();
  }

  for (let i = 0; i < 8; i++) {
    const ph = (t * 1.45 + i * 0.125) % 1;
    const side = i % 2 === 0 ? -1 : 1;
    const sx = cx + side * (5 + ((i * 7) % 13)) + Math.sin(t * 5 + i * 1.7) * 5;
    const sy = y0 + 4 - ph * 34;
    const sr = (1 - ph * 0.55) * 1.85;
    const alpha = Math.sin(ph * Math.PI) * 0.95;
    // Outer ember halo
    const hg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3.2);
    hg.addColorStop(0, `rgba(255,190,75,${alpha * 0.65})`);
    hg.addColorStop(1, 'rgba(255,110,25,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 3.2, 0, TAU);
    ctx.fill();
    // Bright spark core
    ctx.fillStyle = i % 3 === 0 ? `rgba(255,250,210,${alpha})` : `rgba(255,165,55,${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}

interface BazookaParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  h: number;
  s: number;
  l: number;
  g: number;
  d: number;
  tr: number;
  tw: boolean;
}

interface SmokePuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  grow: number;
  dark: number;
  seed: number;
}

interface Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  hot: number;
  seed: number;
}

interface MuzzleFlash {
  x: number;
  y: number;
  life: number;
  max: number;
  r: number;
  seed: number;
}

interface BazookaDebris {
  kind: 'shard' | 'clod';
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  hue: number;
  a0: number;
  life: number;
  hot: number;
}

interface BazookaGlow {
  x: number;
  y: number;
  hue: number;
  life: number;
  max: number;
  r: number;
}

/**
 * Slide #3 (`games/fireworkgun/src/game/engine.ts`) Bazooka FX manager for SGA:
 * - Smoky battlefield dusk background with burning horizon glow, 2 sweeping searchlights,
 *   sandbag bunkers, and 60MM spare shell crate
 * - Muzzle flash, rolling fireballs, forward fire cone, downward backblast, billowing smoke, and gravity sparks
 * - In-flight rocket sustainer flame + smoke ribbon + sparks
 * - Warhead detonation (blinding flash, layered fireballs, 44 flame tongues, dark smoke, dust wall, shrapnel & clods, cook-off pops)
 * - Stage-clear artillery ground barrage
 */
export class BazookaSlideFx {
  time = 0;
  particles: BazookaParticle[] = [];
  smokes: SmokePuff[] = [];
  fireballs: Fireball[] = [];
  flashes: MuzzleFlash[] = [];
  debris: BazookaDebris[] = [];
  glows: BazookaGlow[] = [];
  timers: { t: number; fn: () => void }[] = [];
  screenFlash = 0;
  cannonPulse = 0;
  shotHueIdx = 0;

  private stars: { x: number; y: number; r: number; ph: number; sp: number }[] = [];

  constructor() {
    let s = 42;
    const rr = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 0; i < 65; i++) {
      this.stars.push({
        x: rr() * 420,
        y: rr() * 520,
        r: 0.6 + rr() * 1.3,
        ph: rr() * TAU,
        sp: 1.2 + rr() * 2.4,
      });
    }
  }

  reset() {
    this.particles.length = 0;
    this.smokes.length = 0;
    this.fireballs.length = 0;
    this.flashes.length = 0;
    this.debris.length = 0;
    this.glows.length = 0;
    this.timers.length = 0;
    this.screenFlash = 0;
    this.cannonPulse = 0;
  }

  nextHue(): number {
    const h = BAZOOKA_HUES[this.shotHueIdx % BAZOOKA_HUES.length];
    this.shotHueIdx++;
    return h;
  }

  private at(delay: number, fn: () => void) {
    this.timers.push({ t: delay, fn });
  }

  private spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    opts: Partial<BazookaParticle> = {},
  ) {
    if (this.particles.length > 1400) this.particles.splice(0, 220);
    const life = opts.life ?? rnd(0.45, 0.9);
    this.particles.push({
      x,
      y,
      vx,
      vy,
      life,
      max: life,
      size: opts.size ?? rnd(1.8, 3.2),
      h: opts.h ?? 36,
      s: opts.s ?? 100,
      l: opts.l ?? 65,
      g: opts.g ?? 0.08,
      d: opts.d ?? 0.96,
      tr: opts.tr ?? 2,
      tw: opts.tw ?? false,
    });
  }

  private spawnSmoke(
    x: number,
    y: number,
    vx: number,
    vy: number,
    r: number,
    life: number,
    dark = 0.5,
  ) {
    if (this.smokes.length > 220) this.smokes.splice(0, 35);
    this.smokes.push({
      x,
      y,
      vx,
      vy,
      life,
      max: life,
      r,
      grow: r * rnd(1.6, 2.4),
      dark,
      seed: rnd(0, 10),
    });
  }

  private spawnFireball(
    x: number,
    y: number,
    vx: number,
    vy: number,
    r: number,
    life: number,
    hot = 1,
  ) {
    if (this.fireballs.length > 90) this.fireballs.splice(0, 18);
    this.fireballs.push({
      x,
      y,
      vx,
      vy,
      life,
      max: life,
      r,
      hot,
      seed: rnd(0, 10),
    });
  }

  private spawnMuzzle(x: number, y: number, r: number) {
    if (this.flashes.length > 16) return;
    this.flashes.push({ x, y, life: 0.16, max: 0.16, r, seed: rnd(0, 10) });
  }

  private spawnShrapnel(x: number, y: number, n: number, scale: number) {
    for (let i = 0; i < n; i++) {
      const shard = Math.random() < 0.45;
      const a = rnd(0, TAU);
      const sp = rnd(180, 440) * scale;
      this.debris.push({
        kind: shard ? 'shard' : 'clod',
        x: x + rnd(-4, 4),
        y: y + rnd(-4, 4),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 160 * scale,
        rot: rnd(0, TAU),
        vr: rnd(-14, 14),
        hue: shard ? rnd(30, 50) : rnd(18, 32),
        a0: rnd(2.5, 5.5) * scale,
        life: rnd(0.9, 1.7),
        hot: shard ? 1 : 0.4,
      });
    }
  }

  /**
   * Exact Slide #3 (`games/fireworkgun/src/game/engine.ts` lines 1694–1780) Bazooka launch FX
   */
  onShoot(mx: number, my: number, canvasH = 760) {
    this.spawnMuzzle(mx, my, 52);
    this.spawnFireball(mx, my - 8, 0, -60, 26, 0.4, 1);
    this.spawnFireball(mx - 10, my - 4, -40, -30, 16, 0.35, 0.8);
    this.spawnFireball(mx + 10, my - 4, 40, -30, 16, 0.35, 0.8);

    // Forward fire cone — dense, layered
    for (let i = 0; i < 40; i++) {
      const a = -Math.PI / 2 + rnd(-0.5, 0.5);
      const sp = rnd(4, 14);
      const white = Math.random() < 0.25;
      this.spawn(mx + rnd(-10, 10), my, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.22, 0.55),
        size: rnd(1.8, 3.6),
        h: white ? 52 : rnd(14, 46),
        s: white ? 65 : 100,
        l: white ? 90 : rnd(56, 70),
        g: 0.02,
        d: 0.92,
        tr: 2.8,
        tw: false,
      });
    }

    // Real backblast — smoke + flame venting DOWNWARD behind the tube
    for (let i = 0; i < 14; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      this.spawnSmoke(
        mx + side * rnd(10, 22),
        my + rnd(50, 90),
        side * rnd(40, 130),
        rnd(60, 190),
        rnd(9, 16),
        rnd(1.0, 1.8),
        rnd(0.4, 0.85),
      );
    }
    for (let i = 0; i < 16; i++) {
      const a = Math.PI / 2 + rnd(-0.65, 0.65);
      const sp = rnd(3, 9);
      this.spawn(mx + rnd(-8, 8), my + 60, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.25, 0.55),
        size: rnd(1.6, 3.0),
        h: rnd(15, 45),
        s: 100,
        l: rnd(55, 68),
        g: -0.02,
        d: 0.92,
        tw: false,
      });
    }

    // Thick muzzle smoke billowing up + out
    for (let i = 0; i < 10; i++) {
      const a = rnd(0, TAU);
      this.spawnSmoke(
        mx + Math.cos(a) * 12,
        my + Math.sin(a) * 8,
        Math.cos(a) * rnd(20, 70),
        Math.sin(a) * rnd(20, 60) - 40,
        rnd(10, 18),
        rnd(1.1, 2.0),
        rnd(0.35, 0.8),
      );
    }

    // Hot embers/sparks with gravity ("percikan-percikan bazooka")
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + rnd(-0.9, 0.9);
      const sp = rnd(2, 7.5);
      this.spawn(mx + rnd(-8, 8), my + rnd(-4, 6), Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.35, 0.78),
        size: rnd(1.2, 2.0),
        h: rnd(30, 48),
        s: 100,
        l: 64,
        g: 0.14,
        d: 0.94,
        tr: 2.6,
        tw: false,
      });
    }

    // Ground dust kicked around the mount
    for (let i = 0; i < 8; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      this.spawnSmoke(
        mx + side * rnd(30, 60),
        canvasH - 46,
        side * rnd(30, 80),
        rnd(-30, -8),
        rnd(8, 14),
        rnd(0.9, 1.5),
        0.25,
      );
    }

    this.glows.push({ x: mx, y: my, hue: 36, life: 0.4, max: 0.4, r: 140 });
    this.glows.push({ x: mx, y: my, hue: 15, life: 0.5, max: 0.5, r: 190 });
    this.screenFlash = Math.max(this.screenFlash, 0.22);
    this.cannonPulse = Math.min(1, this.cannonPulse + 0.65);

    this.at(0.18, () => {
      for (let i = 0; i < 5; i++) {
        this.spawnSmoke(
          mx + rnd(-14, 14),
          my + rnd(-6, 30),
          rnd(-10, 10),
          rnd(-50, -20),
          rnd(10, 16),
          rnd(1.2, 1.9),
          rnd(0.5, 0.9),
        );
      }
    });
  }

  /**
   * Exact Slide #3 (`games/fireworkgun/src/game/engine.ts` lines 3373–3520) `warheadBurst`
   */
  warheadBurst(x: number, y: number, scale = 1) {
    const s = Math.max(0.6, scale);

    // 1) Blinding core flash + fire light
    this.flashes.push({ x, y, life: 0.22, max: 0.22, r: 68 * s, seed: rnd(0, 10) });
    this.spawn(x, y, 0, 0, {
      life: 0.16,
      size: 30 * s,
      h: 48,
      s: 100,
      l: 92,
      d: 1,
      g: 0,
      tr: 0,
      tw: false,
    });
    this.glows.push({ x, y, hue: 36, life: 0.55, max: 0.55, r: 170 * s + 30 });
    this.glows.push({ x, y, hue: 15, life: 0.7, max: 0.7, r: 220 * s + 40 });

    // 2) Layered fireballs — 1 big core + chaotic satellites
    this.spawnFireball(x, y, rnd(-12, 12), rnd(-28, -8), 36 * s, 0.65, 1);
    const sats = Math.round(6 * s);
    for (let i = 0; i < sats; i++) {
      const a = rnd(0, TAU);
      const d = rnd(8, 30) * s;
      this.spawnFireball(
        x + Math.cos(a) * d,
        y + Math.sin(a) * d * 0.7 - 6 * s,
        Math.cos(a) * rnd(25, 95) * s,
        Math.sin(a) * rnd(25, 90) * s - 55 * s,
        rnd(13, 23) * s,
        rnd(0.45, 0.78),
        rnd(0.5, 0.9),
      );
    }

    // 3) Flame tongues — chaotic, upward-rolling
    const n = Math.round(44 * s);
    for (let i = 0; i < n; i++) {
      const a = rnd(0, TAU);
      const upward = Math.sin(a) < 0 ? 1.25 : 0.7;
      const sp = rnd(2, 7.5) * s * upward;
      const white = Math.random() < 0.2;
      this.spawn(x + rnd(-6, 6), y + rnd(-4, 4), Math.cos(a) * sp, Math.sin(a) * sp - 1.2 * s, {
        life: rnd(0.3, 0.7),
        size: rnd(1.8, 3.4),
        h: white ? rnd(48, 55) : rnd(10, 42),
        s: white ? 70 : 100,
        l: white ? 88 : rnd(54, 66),
        g: 0.03,
        d: 0.93,
        tr: 2.2,
        tw: false,
      });
    }

    // 4) Thick dark smoke — billowing, long-lived + low dust wall
    const ns = Math.round(20 * s);
    for (let i = 0; i < ns; i++) {
      const a = rnd(0, TAU);
      const sp = rnd(14, 70) * s;
      this.spawnSmoke(
        x + Math.cos(a) * rnd(6, 20) * s,
        y + Math.sin(a) * rnd(6, 16) * s,
        Math.cos(a) * sp,
        Math.sin(a) * sp - 55 * s,
        rnd(10, 20) * s,
        rnd(1.2, 2.3),
        rnd(0.45, 1),
      );
    }
    for (let i = 0; i < Math.round(8 * s); i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      this.spawnSmoke(
        x + side * rnd(10, 40) * s,
        y + rnd(6, 22) * s,
        side * rnd(50, 130) * s,
        rnd(-18, 6),
        rnd(11, 19) * s,
        rnd(1.0, 1.8),
        0.35,
      );
    }

    // 5) Shrapnel + burning dirt clods
    this.spawnShrapnel(x, y, Math.round(10 * s), s);

    // 6) Heavy embers/sparks with gravity ("percikan-percikan bazooka")
    for (let i = 0; i < Math.round(22 * s); i++) {
      const a = rnd(0, TAU);
      const sp = rnd(2.5, 8) * s;
      this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
        life: rnd(0.45, 1.0),
        size: rnd(1.1, 1.9),
        h: rnd(28, 48),
        s: 100,
        l: 62,
        g: 0.2,
        d: 0.955,
        tr: 2.8,
        tw: false,
      });
    }

    // 7) Delayed secondary cook-off pops + rising smoke column
    this.at(0.14, () => {
      this.spawnFireball(
        x + rnd(-14, 14),
        y + rnd(-10, 10),
        rnd(-10, 10),
        rnd(-50, -20),
        18 * s,
        0.45,
        0.6,
      );
      for (let i = 0; i < Math.round(10 * s); i++) {
        const a = rnd(0, TAU);
        const sp = rnd(1.5, 5) * s;
        this.spawn(x, y, Math.cos(a) * sp, Math.sin(a) * sp, {
          life: rnd(0.3, 0.6),
          size: rnd(1.5, 2.6),
          h: rnd(15, 45),
          s: 100,
          l: 60,
          g: 0.04,
          d: 0.94,
          tw: false,
        });
      }
    });
    this.at(0.3, () => {
      for (let i = 0; i < Math.round(6 * s); i++) {
        this.spawnSmoke(
          x + rnd(-18, 18),
          y + rnd(-8, 14),
          rnd(-12, 12),
          rnd(-70, -30),
          rnd(12, 20) * s,
          rnd(1.4, 2.2),
          rnd(0.6, 1),
        );
      }
    });

    this.screenFlash = Math.max(this.screenFlash, 0.28 * Math.min(s, 1.3));
    this.cannonPulse = Math.min(1, this.cannonPulse + 0.6 * s);
  }

  onHit(x: number, y: number, scale = 1.05) {
    this.warheadBurst(x, y, scale);
  }

  private launchBazookaGround(scale = 1.0, canvasW = 420, canvasH = 760) {
    const x = rnd(40, canvasW - 40);
    const y = rnd(canvasH - 150, canvasH - 60);
    for (let i = 0; i < 6; i++) {
      this.spawn(x + rnd(-8, 8), y + rnd(-6, 6), rnd(-1, 1), rnd(-2, -0.5), {
        life: rnd(0.3, 0.5),
        size: rnd(1.4, 2.2),
        h: rnd(25, 40),
        s: 40,
        l: 50,
        g: 0.1,
        d: 0.94,
        tw: false,
      });
    }
    this.at(0.18, () => {
      this.warheadBurst(x, y, scale);
      for (let i = 0; i < 8; i++) {
        this.debris.push({
          kind: 'clod',
          x: x + rnd(-6, 6),
          y,
          vx: rnd(-120, 120),
          vy: rnd(-560, -260) * scale,
          rot: rnd(0, TAU),
          vr: rnd(-10, 10),
          hue: rnd(20, 32),
          a0: rnd(3, 6) * scale,
          life: rnd(1.0, 1.8),
          hot: 0.7,
        });
      }
      slide23Sfx.sky('bazooka', scale);
    });
  }

  onStageClear(cx: number, cy: number) {
    this.warheadBurst(cx, cy, 1.85);
    for (let k = 0; k < 5; k++) {
      this.at(0.1 + k * 0.12, () => {
        const dx = rnd(-100, 100);
        const dy = rnd(-80, 60);
        const sc = rnd(0.95, 1.35);
        this.warheadBurst(cx + dx, cy + dy, sc);
      });
    }
    for (let s = 0; s < 7; s++) {
      this.at(0.2 + s * 0.25, () => this.launchBazookaGround(rnd(0.95, 1.3)));
    }
  }

  update(
    dt: number,
    active: boolean,
    gunX: number,
    gunY: number,
    flyingShots: { x: number; y: number }[],
    canvasH = 760,
  ) {
    this.time += dt;
    const f = dt * 60;
    this.screenFlash = Math.max(0, this.screenFlash - dt * 1.6);
    this.cannonPulse = Math.max(0, this.cannonPulse - dt * 1.4);

    // Delayed timers
    for (let i = this.timers.length - 1; i >= 0; i--) {
      this.timers[i].t -= dt;
      if (this.timers[i].t <= 0) {
        const fn = this.timers[i].fn;
        this.timers.splice(i, 1);
        fn();
      }
    }

    if (active) {
      // Battlefield embers + cordite smoke curling around the launcher (Slide #3 lines 4385–4413)
      if (Math.random() < 0.55 * f) {
        if (Math.random() < 0.58) {
          this.spawn(
            gunX + rnd(-105, 105),
            rnd(gunY - 70, canvasH - 40),
            rnd(-0.3, 0.3),
            rnd(-0.95, -0.25),
            {
              life: rnd(0.7, 1.4),
              size: rnd(1.1, 2.1),
              h: rnd(18, 50),
              s: 100,
              l: 62,
              g: -0.01,
              d: 0.99,
              tr: 1.6,
            },
          );
        } else {
          this.spawn(
            gunX + rnd(-95, 95),
            rnd(gunY - 50, canvasH - 50),
            rnd(-0.25, 0.25),
            rnd(-0.6, -0.15),
            {
              life: rnd(0.9, 1.6),
              size: rnd(2, 3.4),
              h: 40,
              s: 8,
              l: 48,
              g: -0.012,
              d: 0.985,
              tr: 1.2,
              tw: false,
            },
          );
        }
      }

      // Heat smoke wisps + sparks curling off the muzzle (Slide #3 lines 7830–7841)
      if (Math.random() < (0.3 + this.cannonPulse * 0.5) * f) {
        if (Math.random() < 0.5) {
          this.spawnSmoke(
            gunX + rnd(-12, 12),
            gunY - 10,
            rnd(-8, 8),
            rnd(-30, -12),
            rnd(7, 12),
            rnd(0.9, 1.6),
            0.55,
          );
        } else {
          this.spawn(gunX + rnd(-14, 14), gunY - 8, rnd(-0.6, 0.6), rnd(-1.8, -0.5), {
            life: rnd(0.3, 0.6),
            size: 1.5,
            h: rnd(25, 50),
            s: 100,
            l: 66,
            g: -0.01,
            d: 0.95,
          });
        }
      }

      // In-flight Bazooka sustainer — roaring orange core + thick smoke ribbon + sparks (Slide #3 lines 4023–4065)
      for (const s of flyingShots) {
        const tx = s.x + Math.sin(this.time * 8) * 1.5;
        for (let k = 0; k < 4; k++) {
          const core = k < 2;
          this.spawn(tx + rnd(-5, 5), s.y + 38 + rnd(0, 16), rnd(-0.7, 0.7), rnd(2.5, 5.5), {
            life: rnd(0.2, 0.48),
            size: core ? rnd(2.0, 3.4) : rnd(1.5, 2.6),
            h: core ? rnd(38, 52) : rnd(15, 40),
            s: 100,
            l: core ? rnd(68, 82) : rnd(56, 66),
            g: 0.02,
            d: 0.9,
            tr: 3,
            tw: false,
          });
        }
        if (Math.random() < 0.85) {
          this.spawnSmoke(
            tx + rnd(-7, 7),
            s.y + rnd(42, 64),
            rnd(-14, 14),
            rnd(20, 60),
            rnd(8, 14),
            rnd(0.9, 1.6),
            rnd(0.35, 0.75),
          );
        }
        if (Math.random() < 0.6) {
          this.spawn(tx + rnd(-4, 4), s.y + rnd(32, 46), rnd(-1.2, 1.2), rnd(1.5, 3.5), {
            life: rnd(0.25, 0.55),
            size: rnd(1.1, 1.8),
            h: rnd(35, 48),
            s: 100,
            l: 64,
            g: 0.12,
            d: 0.93,
            tr: 2.6,
            tw: false,
          });
        }
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const dr = Math.pow(p.d, f);
      p.vx *= dr;
      p.vy = p.vy * dr + p.g * f;
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Update smoke puffs
    for (let i = this.smokes.length - 1; i >= 0; i--) {
      const s = this.smokes[i];
      const dr = Math.pow(0.95, f);
      s.vx *= dr;
      s.vy = s.vy * dr - 12 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.r += (s.grow - s.r) * Math.min(1, dt * 1.8);
      s.life -= dt;
      if (s.life <= 0) this.smokes.splice(i, 1);
    }

    // Update fireballs
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      const dr = Math.pow(0.92, f);
      fb.vx *= dr;
      fb.vy = fb.vy * dr - 35 * dt;
      fb.x += fb.vx * dt;
      fb.y += fb.vy * dt;
      fb.r += dt * 18;
      fb.life -= dt;
      if (fb.life <= 0) this.fireballs.splice(i, 1);
    }

    // Update flashes
    for (let i = this.flashes.length - 1; i >= 0; i--) {
      const fl = this.flashes[i];
      fl.life -= dt;
      if (fl.life <= 0) this.flashes.splice(i, 1);
    }

    // Update debris (shrapnel + clods)
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.vy += 680 * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.rot += d.vr * dt;
      d.life -= dt;
      if (d.hot > 0) d.hot = Math.max(0, d.hot - dt * 0.9);
      if (d.life <= 0 || d.y > canvasH + 80) this.debris.splice(i, 1);
    }

    // Update glows
    for (let i = this.glows.length - 1; i >= 0; i--) {
      const g = this.glows[i];
      g.life -= dt;
      if (g.life <= 0) this.glows.splice(i, 1);
    }
  }

  /**
   * Draws Slide #3's signature smoky battlefield dusk background for Bazooka
   * (`games/fireworkgun/src/game/engine.ts` lines 4730–4785, 4956–4998 & 7580–7619)
   */
  drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    const cx = w * 0.5;

    // 1. Exact Slide #3 `buildBg()` night-dusk sky + horizon haze + city skyline with lit windows
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#04010f');
    g.addColorStop(0.45, '#12062e');
    g.addColorStop(0.8, '#2a0f4a');
    g.addColorStop(1, '#4a1747');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const hz = ctx.createRadialGradient(cx, h, 10, cx, h, 420);
    hz.addColorStop(0, 'rgba(255,120,160,0.25)');
    hz.addColorStop(1, 'rgba(255,120,160,0)');
    ctx.fillStyle = hz;
    ctx.fillRect(0, 0, w, h);

    let bx = -10;
    let seed = 7;
    const rr = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    while (bx < w + 10) {
      const bw = 22 + rr() * 34;
      const bh = 40 + rr() * 110;
      ctx.fillStyle = '#0b0420';
      ctx.fillRect(bx, h - bh, bw, bh);
      ctx.fillStyle = 'rgba(255,210,120,0.55)';
      for (let wy = h - bh + 8; wy < h - 6; wy += 11) {
        for (let wx = bx + 4; wx < bx + bw - 5; wx += 8) {
          if (rr() > 0.72) ctx.fillRect(wx, wy, 3, 4);
        }
      }
      bx += bw + 1 + rr() * 4;
    }

    // 2. Twinkling stars
    for (const s of this.stars) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(this.time * s.sp + s.ph));
      ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, TAU);
      ctx.fill();
    }

    // 3. Smoky battlefield dusk overlay (`this.weapon === "bazooka"`, lines 4956–4963)
    const wg = ctx.createLinearGradient(0, 0, 0, h);
    wg.addColorStop(0, 'rgba(30,28,18,0.32)');
    wg.addColorStop(0.55, 'rgba(70,55,25,0.16)');
    wg.addColorStop(1, 'rgba(120,60,18,0.3)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, w, h);

    // 4. Burning horizon glow at the bottom (lines 4964–4970)
    const fg = ctx.createRadialGradient(cx, h, 20, cx, h, 400);
    const flick = 0.18 + 0.035 * Math.sin(this.time * 6) + 0.02 * Math.sin(this.time * 11);
    fg.addColorStop(0, `rgba(255,130,35,${flick})`);
    fg.addColorStop(1, 'rgba(255,130,35,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, w, h);

    // 5. Sweeping battlefield searchlights (lines 4972–4986)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.07 + 0.02 * Math.sin(this.time * 0.9);
    ctx.fillStyle = '#ffe9b8';
    for (let i = 0; i < 2; i++) {
      const slx = 70 + i * 200 + Math.sin(this.time * 0.4 + i * 2.6) * 40;
      ctx.beginPath();
      ctx.moveTo(slx, h);
      ctx.lineTo(slx + 34, h);
      ctx.lineTo(slx - 60 + (i === 0 ? 60 : -60), 0);
      ctx.lineTo(slx - 90 + (i === 0 ? 60 : -60), 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 6. Sandbag bunker silhouettes at the bottom corners (lines 4988–4998)
    ctx.fillStyle = 'rgba(88,70,40,0.85)';
    for (const sx of [0, 1]) {
      const sbx = sx === 0 ? 8 : w - 68;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.beginPath();
          ctx.ellipse(sbx + 10 + c * 20 + (r % 2) * 10, h - 14 - r * 14, 11, 7.5, 0, 0, TAU);
          ctx.fill();
        }
      }
    }

    // 7. 60MM Wooden Ammo Crate with 3 spare Bazooka shells (left of launcher mount, lines 7580–7619)
    ctx.save();
    ctx.translate(cx - 92, h - 22);
    ctx.fillStyle = '#6b4a22';
    ctx.strokeStyle = 'rgba(28,16,6,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-22, -22, 44, 30, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(40,24,8,0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-22, -12);
    ctx.lineTo(22, -12);
    ctx.moveTo(-22, -2);
    ctx.lineTo(22, -2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(240,235,210,0.82)';
    ctx.font = '700 7px Rubik, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('60MM', 0, 3);
    for (let i = 0; i < 3; i++) {
      const sx = -12 + i * 12;
      ctx.fillStyle = '#4c5a26';
      ctx.strokeStyle = 'rgba(15,17,8,0.9)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(sx - 4, -34, 8, 14, 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#b5651d';
      ctx.beginPath();
      ctx.moveTo(sx - 4, -34);
      ctx.lineTo(sx, -39);
      ctx.lineTo(sx + 4, -34);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 8. Additive explosion & muzzle glows
    ctx.globalCompositeOperation = 'lighter';
    for (const gl of this.glows) {
      const k = gl.life / gl.max;
      const rad = gl.r * (1.3 - 0.3 * k);
      const gr = ctx.createRadialGradient(gl.x, gl.y, 0, gl.x, gl.y, rad);
      gr.addColorStop(0, hsl(gl.hue, 100, 60, 0.38 * k));
      gr.addColorStop(1, hsl(gl.hue, 100, 50, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(gl.x - rad, gl.y - rad, rad * 2, rad * 2);
    }

    ctx.restore();
  }

  /**
   * Draws Slide #3's foreground Bazooka FX: shrapnel & clod debris, billowing smoke,
   * additive flame/ember particles, rolling fireballs, 8-spike star flashes, and screen flash.
   */
  drawForeground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();

    // 1. Shrapnel shards & burning dirt clods
    for (const d of this.debris) {
      const a = Math.min(1, d.life / 0.6);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      const s = d.a0 || 4;
      const hot = d.hot ?? 0;
      if (d.kind === 'shard') {
        ctx.fillStyle = hot > 0.4 ? `rgba(255,${120 + Math.round(hot * 80)},60,1)` : '#3a3a40';
        ctx.strokeStyle = 'rgba(10,10,10,0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-s, -s * 0.6);
        ctx.lineTo(s * 0.2, -s * 1.1);
        ctx.lineTo(s, s * 0.3);
        ctx.lineTo(-s * 0.3, s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (hot > 0.15) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(255,170,70,${hot * 0.7})`;
          ctx.beginPath();
          ctx.arc(0, 0, s * 1.6, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
      } else {
        ctx.fillStyle = hot > 0.3 ? '#5a3418' : '#3a2412';
        ctx.strokeStyle = 'rgba(15,8,4,0.9)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.75, 0.3, 0, TAU);
        ctx.fill();
        ctx.stroke();
        if (hot > 0.2) {
          ctx.fillStyle = `rgba(255,130,40,${hot * 0.6})`;
          ctx.beginPath();
          ctx.arc(-s * 0.2, -s * 0.2, s * 0.45, 0, TAU);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 2. Billowing smoke puffs (dark sooty core + hot orange underlit rim + pale sky-lit top)
    for (const s of this.smokes) {
      const k = Math.max(0, s.life / s.max);
      const fadeIn = Math.min(1, (1 - k) * 6 + 0.25);
      const a = Math.min(1, k * 1.6) * fadeIn;
      const wob = Math.sin(this.time * 3 + s.seed * 8) * s.r * 0.08;
      const g = ctx.createRadialGradient(s.x + wob, s.y, 0, s.x + wob, s.y, s.r);
      const base = 52 - s.dark * 30;
      g.addColorStop(0, `rgba(${base + 26},${base + 8},${base - 8},${0.5 * a})`);
      g.addColorStop(0.55, `rgba(${base},${base - 12},${base - 18},${0.34 * a})`);
      g.addColorStop(1, `rgba(${base - 18},${base - 24},${base - 26},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x + wob, s.y, s.r, 0, TAU);
      ctx.fill();

      if (k > 0.55) {
        const hg = ctx.createRadialGradient(s.x, s.y + s.r * 0.3, 0, s.x, s.y + s.r * 0.3, s.r * 0.75);
        hg.addColorStop(0, `rgba(255,140,50,${0.4 * (k - 0.55) * 2 * a})`);
        hg.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(s.x, s.y + s.r * 0.3, s.r * 0.75, 0, TAU);
        ctx.fill();
      }

      const tg = ctx.createRadialGradient(
        s.x - s.r * 0.3,
        s.y - s.r * 0.35,
        0,
        s.x - s.r * 0.3,
        s.y - s.r * 0.35,
        s.r * 0.55,
      );
      tg.addColorStop(0, `rgba(200,195,185,${0.22 * a})`);
      tg.addColorStop(1, 'rgba(200,195,185,0)');
      ctx.fillStyle = tg;
      ctx.beginPath();
      ctx.arc(s.x - s.r * 0.3, s.y - s.r * 0.35, s.r * 0.55, 0, TAU);
      ctx.fill();
    }

    // 3. Additive flame tongues & spark embers
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const p of this.particles) {
      const k = Math.max(0, p.life / p.max);
      let a = Math.pow(k, 0.7);
      if (p.tw && k < 0.6) a *= 0.55 + Math.random() * 0.45;
      const l = k > 0.88 ? Math.min(95, p.l + 25) : p.l - (1 - k) * 12;
      ctx.strokeStyle = hsl(p.h, p.s, l, a);
      ctx.lineWidth = Math.max(0.9, p.size * (0.4 + 0.6 * k));
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * p.tr, p.y - p.vy * p.tr);
      ctx.stroke();
    }

    // 4. Rolling Fireballs (outer red-orange envelope + 5 licking flame blobs + white-hot core)
    for (const fb of this.fireballs) {
      const k = Math.max(0, fb.life / fb.max);
      const fl = 0.85 + 0.15 * Math.sin(this.time * 47 + fb.seed * 11);
      const r = fb.r * fl;
      const g = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, r);
      g.addColorStop(0, `rgba(255,240,200,${0.85 * k})`);
      g.addColorStop(0.3, `rgba(255,190,80,${0.7 * k})`);
      g.addColorStop(0.62, `rgba(255,110,30,${0.5 * k})`);
      g.addColorStop(0.85, `rgba(200,50,15,${0.28 * k})`);
      g.addColorStop(1, 'rgba(150,30,10,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(fb.x, fb.y, r, 0, TAU);
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const a = fb.seed + i * 1.256 + this.time * (3 + i * 0.4);
        const bx = fb.x + Math.cos(a) * r * 0.72;
        const by = fb.y + Math.sin(a) * r * 0.72;
        const br = r * (0.28 + 0.12 * Math.sin(this.time * 9 + i * 2 + fb.seed));
        const bg = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        bg.addColorStop(0, `rgba(255,220,140,${0.7 * k})`);
        bg.addColorStop(0.6, `rgba(255,130,40,${0.4 * k})`);
        bg.addColorStop(1, 'rgba(255,90,20,0)');
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, TAU);
        ctx.fill();
      }

      if (fb.hot > 0.3 && k > 0.35) {
        const ck = Math.min(1, k * 1.4) * fb.hot;
        const cg = ctx.createRadialGradient(fb.x, fb.y, 0, fb.x, fb.y, r * 0.42);
        cg.addColorStop(0, `rgba(255,255,255,${0.95 * ck})`);
        cg.addColorStop(0.5, `rgba(255,245,215,${0.75 * ck})`);
        cg.addColorStop(1, 'rgba(255,230,170,0)');
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, r * 0.42, 0, TAU);
        ctx.fill();
      }
    }

    // 5. 8-spike star flashes
    for (const f of this.flashes) {
      const k = Math.max(0, f.life / f.max);
      const r = f.r * (0.7 + 0.3 * k);
      const spikes = 8;
      for (let i = 0; i < spikes; i++) {
        const a = f.seed + (i * TAU) / spikes;
        const len = r * (i % 2 === 0 ? 1 : 0.55);
        const g = ctx.createLinearGradient(f.x, f.y, f.x + Math.cos(a) * len, f.y + Math.sin(a) * len);
        g.addColorStop(0, `rgba(255,255,255,${0.9 * k})`);
        g.addColorStop(0.4, `rgba(255,225,150,${0.7 * k})`);
        g.addColorStop(1, 'rgba(255,140,40,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = (i % 2 === 0 ? 7 : 4) * k + 1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + Math.cos(a) * len, f.y + Math.sin(a) * len);
        ctx.stroke();
      }
      const cg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 0.55);
      cg.addColorStop(0, `rgba(255,255,255,${0.98 * k})`);
      cg.addColorStop(0.45, `rgba(255,240,200,${0.85 * k})`);
      cg.addColorStop(1, 'rgba(255,170,70,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r * 0.55, 0, TAU);
      ctx.fill();
    }

    // 6. Warm orange battlefield screen flash
    ctx.globalCompositeOperation = 'source-over';
    if (this.screenFlash > 0) {
      ctx.fillStyle = hsl(38, 100, 72, Math.min(0.4, this.screenFlash));
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }
}
