/**
 * Slide-2 weapons, drawn and fired exactly like slide 2.
 *
 * Slide 2 (`games/fireworkgun`) gives every gun its own art, its own muzzle
 * recipe and its own impact burst. This module ports those pieces verbatim —
 * same path points, same gradients, same particle counts, same hue bands — so
 * a gun that exists on both slides looks and fires identically on slide 1.
 *
 * Ported so far: `blackhole`. `shark`, `bamboo`, `soaker`, `rainbow`,
 * `bazooka` and `rpg` follow the same pattern (the kit they need already
 * lives in `slide2Fx.ts`).
 */
import { TAU, rnd, hsl, drawSlide2Orb, type Slide2Fx } from './slide2Fx';

/** Slide-2 logical canvas: the art below is authored against these. */
const CX = 210;
const GUNY = 596;

export interface Slide2GunState {
  time: number;
  /** Slide-2 `recoil`, 0..1 (decays 6/s). */
  recoil: number;
  /** Slide-2 `loadP`, 0..1 (the charge meter). */
  loadP: number;
  /** Hue of the projectile that is currently loaded. */
  hue: number;
  live: boolean;
  /** Present only for a live gameplay draw, never for menu previews. */
  fx?: Slide2Fx;
}

/**
 * Draws the slide-2 black-hole cannon with its muzzle exactly at (cx, y0).
 * The art is authored around slide-2's (CX, GUNY); translating the context
 * keeps every coordinate below identical to slide 2.
 */
export function drawBlackHoleGun2(c: CanvasRenderingContext2D, cx: number, y0: number, st: Slide2GunState) {
  const ctx = c;
  const nextHue = st.hue;
  ctx.save();
  ctx.translate(cx - CX, y0 - GUNY);
  const oy = st.recoil * 16;
  const live = st.live;

  if (live) {
    const e = 1 - Math.pow(1 - st.loadP, 3);
    const tipY = GUNY - 38 + (1 - e) * 42 + oy + Math.sin(st.time * 3.2) * 2.5;
    if (e < 1) {
      for (let i = 0; i < 2; i++) {
        const rr = 16 + (1 - e) * (30 + i * 16);
        ctx.strokeStyle = hsl(nextHue + i * 30, 100, 70, (1 - e) * (0.7 - i * 0.25));
        ctx.lineWidth = 2.5 - i * 0.7;
        ctx.beginPath();
        ctx.arc(CX, tipY, rr, st.time * (3 + i * 2), st.time * (3 + i * 2) + Math.PI * 1.5);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.15 * Math.sin(st.time * 5)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(CX, tipY, 17 + Math.sin(st.time * 5) * 1.5, 0, TAU);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(CX, tipY);
    drawSlide2Orb(ctx, nextHue, 12, st.time, 4.2);
    ctx.restore();
    if (st.fx && Math.random() < 0.6) {
      const a = rnd(0, TAU);
      const rr = rnd(22, 38);
      st.fx.spawn(
        CX + Math.cos(a) * rr,
        tipY + Math.sin(a) * rr,
        -Math.cos(a) * 3 - Math.sin(a) * 2,
        -Math.sin(a) * 3 + Math.cos(a) * 2,
        {
          life: rnd(0.25, 0.45),
          size: 1.6,
          h: nextHue + rnd(-20, 30),
          l: 76,
          g: 0,
          d: 0.93,
          ax: CX,
          ay: tipY,
          pull: 5,
        },
      );
    }
  }

  ctx.save();
  ctx.translate(0, oy);

  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(CX, GUNY + 100, 10, CX, GUNY + 100, 130);
  gg.addColorStop(0, hsl(nextHue, 100, 55, 0.3));
  gg.addColorStop(1, hsl(nextHue, 100, 55, 0));
  ctx.fillStyle = gg;
  ctx.fillRect(CX - 140, GUNY - 40, 280, 270);
  ctx.globalCompositeOperation = 'source-over';

  const bodyG = ctx.createLinearGradient(CX - 50, 0, CX + 50, 0);
  bodyG.addColorStop(0, '#150826');
  bodyG.addColorStop(0.35, '#3d1a72');
  bodyG.addColorStop(0.65, '#2a1258');
  bodyG.addColorStop(1, '#0d0518');
  ctx.fillStyle = bodyG;
  ctx.beginPath();
  ctx.moveTo(CX - 24, GUNY + 70);
  ctx.lineTo(CX + 24, GUNY + 70);
  ctx.lineTo(CX + 52, GUNY + 100);
  ctx.quadraticCurveTo(CX + 58, GUNY + 150, CX + 44, GUNY + 165);
  ctx.lineTo(CX - 44, GUNY + 165);
  ctx.quadraticCurveTo(CX - 58, GUNY + 150, CX - 52, GUNY + 100);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = hsl(nextHue, 100, 65);
  ctx.lineWidth = 2.5;
  ctx.shadowColor = hsl(nextHue, 100, 60);
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (const sx of [-1, 1]) {
    const hx = CX + sx * 40;
    const hy = GUNY + 125;
    ctx.globalCompositeOperation = 'lighter';
    const cg2 = ctx.createRadialGradient(hx, hy, 0, hx, hy, 20);
    cg2.addColorStop(0, hsl(nextHue + sx * 40, 100, 60, 0.5));
    cg2.addColorStop(1, hsl(nextHue + sx * 40, 100, 60, 0));
    ctx.fillStyle = cg2;
    ctx.fillRect(hx - 20, hy - 20, 40, 40);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(hx, hy, 9, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = hsl(nextHue + sx * 40, 100, 65);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hx, hy, 9, st.time * 5 * sx, st.time * 5 * sx + Math.PI * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(hx, hy, 2, 0, TAU);
    ctx.fill();
  }

  const bg = ctx.createLinearGradient(CX - 15, 0, CX + 15, 0);
  bg.addColorStop(0, '#0b0b18');
  bg.addColorStop(0.35, '#343a5e');
  bg.addColorStop(0.55, '#12122a');
  bg.addColorStop(1, '#07070f');
  ctx.fillStyle = bg;
  ctx.fillRect(CX - 15, GUNY, 30, 92);
  ctx.strokeStyle = hsl(nextHue, 90, 55, 0.6);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(CX - 15, GUNY, 30, 92);

  for (let i = 0; i < 6; i++) {
    const cyc = (st.time * 64 + i * 17) % 92;
    const by = GUNY + 86 - cyc;
    const sway = Math.sin(st.time * 6 + i * 1.1) * 6;
    ctx.fillStyle = hsl(nextHue + i * 12, 100, 62);
    ctx.beginPath();
    ctx.arc(CX - 7 + sway * 0.5, by, 3.4, 0, TAU);
    ctx.arc(CX + 7 - sway * 0.5, by, 3.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.beginPath();
    ctx.arc(CX - 7 + sway * 0.5, by, 1.3, 0, TAU);
    ctx.arc(CX + 7 - sway * 0.5, by, 1.3, 0, TAU);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(CX, GUNY - 2);
  ctx.globalCompositeOperation = 'lighter';
  const mg = ctx.createRadialGradient(0, 0, 0, 0, 0, 48);
  mg.addColorStop(0, hsl(nextHue, 100, 62, 0.6));
  mg.addColorStop(0.6, hsl(nextHue + 30, 100, 55, 0.25));
  mg.addColorStop(1, hsl(nextHue, 100, 60, 0));
  ctx.fillStyle = mg;
  ctx.fillRect(-48, -34, 96, 68);
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = hsl(nextHue - 15, 90, 42);
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.ellipse(0, 0, 27, 11.5, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = hsl(nextHue, 100, 62);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 10, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, 0, 19, 7.2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 21.5, 8.8, 0, st.time * 5, st.time * 5 + Math.PI * 0.75);
  ctx.stroke();
  ctx.strokeStyle = hsl(nextHue + 55, 100, 80, 0.95);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 10, 0, -st.time * 4, -st.time * 4 + Math.PI * 0.9);
  ctx.stroke();
  const hot = st.time * 4;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(Math.cos(hot) * 24, Math.sin(hot) * 10, 2.2, 0, TAU);
  ctx.fill();
  ctx.restore();

  if (st.recoil > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hsl(nextHue + 40, 100, 75, st.recoil * 0.85);
    ctx.beginPath();
    ctx.ellipse(CX, GUNY - 4, 30, 14, 0, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.fillStyle = '#0d0518';
  ctx.beginPath();
  ctx.roundRect(CX - 26, GUNY + 66, 52, 12, 4);
  ctx.fill();
  ctx.strokeStyle = hsl(nextHue, 100, 65);
  ctx.lineWidth = 2;
  ctx.stroke();

  const gy = GUNY + 130;
  ctx.globalCompositeOperation = 'lighter';
  const sg = ctx.createRadialGradient(CX, gy, 0, CX, gy, 30);
  sg.addColorStop(0, hsl(nextHue, 100, 65, 0.7));
  sg.addColorStop(1, hsl(nextHue, 100, 60, 0));
  ctx.fillStyle = sg;
  ctx.fillRect(CX - 32, gy - 32, 64, 64);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(CX, gy, 11, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = hsl(nextHue, 100, 68);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CX, gy, 6.5, -st.time * 4, -st.time * 4 + Math.PI * 1.2);
  ctx.stroke();

  ctx.fillStyle = hsl(nextHue, 100, 70);
  for (const [sx, sy, r] of [
    [-22, 92, 4],
    [22, 92, 4],
    [0, 152, 3],
  ] as const) {
    ctx.save();
    ctx.translate(CX + sx, GUNY + sy);
    ctx.rotate(Math.PI / 4 + st.time * 0.8);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  for (let q = 0; q < 4; q++) {
    const sa = st.time * (0.9 + q * 0.22) + (q * TAU) / 4;
    const rad = 74 + (q % 2) * 14;
    const ox = CX + Math.cos(sa) * rad;
    const oy2 = GUNY + 110 + Math.sin(sa) * rad * 0.62;
    ctx.fillStyle = q % 2 ? hsl(nextHue + 40, 90, 68, 0.9) : 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(ox, oy2, q % 2 ? 2 : 1.5, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = hsl(nextHue, 90, 60, 0.22);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(CX, GUNY + 110, 74, 46, 0, 0, TAU);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

/** Slide 2 `fire()` → `if (bh)`: collapsing sparks into the muzzle. */
export function fireBlackHole2(fx: Slide2Fx, mx: number, my: number, hue: number) {
  for (let i = 0; i < 16; i++) {
    const a = rnd(0, TAU);
    const rr = rnd(14, 44);
    const sx = mx + Math.cos(a) * rr;
    const sy = my - 18 + Math.sin(a) * rr * 0.7;
    fx.spawn(sx, sy, -Math.cos(a) * rnd(2, 4.5), -Math.sin(a) * rnd(2, 4.5), {
      life: rnd(0.2, 0.4),
      size: rnd(1.4, 2.4),
      h: hue + rnd(-25, 25),
      l: 75,
      g: 0,
      d: 0.93,
      ax: mx,
      ay: my - 18,
      pull: 5,
    });
  }
  fx.spawn(mx, my - 18, 0, 0, { life: 0.16, size: 18, h: hue + 50, s: 80, l: 90, d: 1, g: 0, tr: 0, tw: false });
  fx.glow(mx, my - 20, hue, 0.25, 80);
  fx.ring(mx, my - 18, hue + 40, 0.35, 46);
}

/** Slide 2's flying singularity trail, spawned once per frame. */
export function trailBlackHole2(fx: Slide2Fx, x: number, y: number, hue: number) {
  for (let k = 0; k < 4; k++) {
    const a = rnd(0, TAU);
    const rr = rnd(10, 26);
    fx.spawn(
      x + Math.cos(a) * rr,
      y + Math.sin(a) * rr * 0.7,
      -Math.sin(a) * rnd(2, 4),
      Math.cos(a) * rnd(1, 2) + rnd(2, 4.5),
      {
        life: rnd(0.3, 0.65),
        size: rnd(1.4, 2.6),
        h: hue + rnd(-30, 30),
        s: 100,
        l: k === 0 ? 88 : 68,
        g: 0,
        d: 0.93,
        ax: x,
        ay: y,
        pull: 3.2,
        tr: 3,
      },
    );
  }
  if (Math.random() < 0.55) {
    const side = Math.random() < 0.5 ? -1 : 1;
    fx.spawn(x + side * rnd(18, 34), y + rnd(-14, 14), -side * rnd(1, 2.5), rnd(2, 4), {
      life: rnd(0.3, 0.55),
      size: 1.6,
      h: 0,
      s: 0,
      l: 92,
      g: 0,
      d: 0.94,
      ax: x,
      ay: y,
      pull: 2,
      tr: 4,
    });
  }
}

/**
 * Slide 2 `voidBurst()` — the impact. Accretion inflow, a delayed collapse
 * flash, bipolar relativistic jets and tangential ejecta (never a radial
 * firework shell). `onShake` receives slide 2's 5 * scale shake.
 */
export function voidBurst2(
  fx: Slide2Fx,
  x: number,
  y: number,
  hue: number,
  scale = 1,
  onShake?: (amount: number) => void,
  onBoom?: () => void,
) {
  const h = 215 + ((((hue - 215) % 105) + 105) % 105);
  fx.void(x, y, h, 0.85, 62 * scale + 18);
  fx.ring(x, y, h, 0.5, 130 * scale, true);
  fx.ring(x, y, h + 40, 0.55, 110 * scale);
  fx.glow(x, y, h, 0.6, 140 * scale + 20);
  const n = Math.round(52 * scale);
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU);
    const rr = rnd(70, 160) * scale;
    const sx = x + Math.cos(a) * rr;
    const sy = y + Math.sin(a) * rr;
    const sp = rnd(3.5, 6.5);
    const swirl = 0.9;
    fx.spawn(
      sx,
      sy,
      -Math.cos(a) * sp - Math.sin(a) * sp * swirl,
      -Math.sin(a) * sp + Math.cos(a) * sp * swirl,
      {
        life: rnd(0.45, 0.75),
        size: rnd(1.6, 2.6),
        h: h + rnd(-30, 30),
        l: 70,
        g: 0,
        d: 0.94,
        ax: x,
        ay: y,
        pull: 6,
      },
    );
  }
  fx.at(0.15, () => {
    fx.spawn(x, y, 0, 0, { life: 0.22, size: 20 * scale, h: h + 45, s: 70, l: 92, d: 1, g: 0, tr: 0, tw: false });
    fx.glow(x, y, h + 40, 0.35, 110 * scale);
    fx.jet(x, y, h, 0.5, 200 * scale, 13 * scale);
    for (let i = 0; i < Math.round(26 * scale); i++) {
      const up = i % 2 === 0;
      fx.spawn(x + rnd(-6, 6), y + rnd(-8, 8), rnd(-0.6, 0.6), (up ? -1 : 1) * rnd(6, 12) * scale, {
        life: rnd(0.4, 0.8),
        size: rnd(1.4, 2.3),
        h: h + rnd(-20, 40),
        s: 85,
        l: 84,
        g: 0,
        d: 0.965,
        tr: 3.5,
      });
    }
    const m = Math.round(30 * scale);
    const dir = Math.random() < 0.5 ? 1 : -1;
    for (let i = 0; i < m; i++) {
      const a = rnd(0, TAU);
      const sp = rnd(2.5, 5.5) * scale;
      fx.spawn(
        x + Math.cos(a) * 10,
        y + Math.sin(a) * 10,
        Math.cos(a) * sp * 0.45 - Math.sin(a) * sp * dir,
        Math.sin(a) * sp * 0.45 + Math.cos(a) * sp * dir,
        {
          life: rnd(0.6, 1.1),
          size: rnd(1.5, 2.4),
          h: h + rnd(-25, 35),
          l: 68,
          g: 0,
          d: 0.958,
          ax: x,
          ay: y,
          pull: 1.2,
        },
      );
    }
    fx.ring(x, y, h + 30, 0.4, 90 * scale);
    onShake?.(5 * scale);
    onBoom?.();
  });
}

/** Draws the flying black-hole projectile (slide 2 `drawOrb(ctx, r.hue, 12.5, …)`). */
export function drawBlackHoleShot2(c: CanvasRenderingContext2D, x: number, y: number, hue: number, time: number) {
  c.save();
  c.translate(x, y);
  drawSlide2Orb(c, hue, 12.5, time, 2.3);
  c.restore();
}

/** Slide 2's ambient black-hole sky: cosmic dust + warped star streaks. */
export function ambientBlackHole2(fx: Slide2Fx, mx: number, my: number, dt: number) {
  const f = dt * 60;
  if (Math.random() < 0.4 * f) {
    fx.spawn(mx + rnd(-90, 90), rnd(my - 60, 760 - 60), rnd(-0.3, 0.3), rnd(-0.9, -0.25), {
      life: rnd(0.9, 1.8),
      size: rnd(1, 2.1),
      h: rnd(215, 305),
      l: 72,
      g: -0.008,
      d: 0.995,
      tr: 1.5,
    });
  }
  if (Math.random() < 0.12 * f) {
    const sx = rnd(0, 420);
    fx.spawn(sx, rnd(-10, 200), (mx - sx) * 0.004, rnd(1.5, 3), {
      life: rnd(0.5, 0.9),
      size: 1.4,
      h: 0,
      s: 0,
      l: 88,
      g: 0,
      d: 0.99,
      tr: 5,
      tw: false,
    });
  }
}

/** Slide 2 `launchVoidSky()` — a void tears open in the sky, then collapses. */
export function launchVoidSky2(fx: Slide2Fx, scale = 1, onOpen?: () => void, onBoom?: () => void) {
  const x = rnd(50, 420 - 50);
  const y = rnd(60, 330);
  const hue = 215 + rnd(0, 105);
  onOpen?.();
  for (let i = 0; i < 26; i++) {
    const a = rnd(0, TAU);
    const rr = rnd(50, 115);
    fx.spawn(x + Math.cos(a) * rr, y + Math.sin(a) * rr, -Math.cos(a) * 2.5, -Math.sin(a) * 2.5, {
      life: rnd(0.4, 0.7),
      size: 1.6,
      h: hue + rnd(-20, 20),
      l: 72,
      g: 0,
      d: 0.95,
      ax: x,
      ay: y,
      pull: 4,
    });
  }
  fx.at(0.32, () => {
    voidBurst2(fx, x, y, hue, scale, undefined, onBoom);
  });
}
