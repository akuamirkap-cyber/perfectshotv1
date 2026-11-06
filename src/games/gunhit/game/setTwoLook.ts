/**
 * Slide 2's look, ported for slide 1.
 *
 * `games/fireworkgun` (slide 2) does not just paint different guns: it has its
 * own night sky with a lit skyline, twinkling stars, one atmosphere wash per
 * weapon, a glow ring around the wheel and a hand-drawn artist's version of the
 * round it leaves stuck in the target. Slide 1 kept all of that to itself, so a
 * slide-2 gun looked imported until you compared side by side.
 *
 * Everything below is lifted from slide 2's `engine.ts` — same paint order, same
 * colours, same numbers. The only edits are mechanical: `ctx` -> `c`,
 * `this.time` -> `time`, `this.weapon` -> `weapon`, the wheel radius `R` -> `r`
 * and the wheel centre `CY` -> `cy`, so slide 1 can hand over its own geometry.
 */
import { TAU } from './art/kit';
import {
  drawBazookaShell,
  drawDrop,
  drawOrb,
  drawRainbowBolt,
  drawRocketShape,
  drawRpgGrenade,
  drawShark,
  drawStone,
} from './setTwoArt';

const W = 420;
const H = 760;
const CX = 210;
const hsl = (h: number, s: number, l: number, a = 1) =>
  `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;

/** One round slide 2 has left in the target. */
export interface SetTwoPin {
  /** Where on the rim it landed, in wheel-local radians. */
  a: number;
  /**
   * How deep it bit, in canvas px from the centre. A boss has no rim: the round
   * stops on the drawing, so the pin has to sit at the spot it struck instead of
   * on a circle of radius `r`.
   */
  r?: number;
  hue: number;
  seed: number;
  /** 1 right after the hit, then cools to 0 over ~0.45s. */
  flash: number;
  /** 1 while it is still settling into the wood/armour, then 0. */
  bite: number;
}

/** Slide 2's sunless night sky, its horizon haze and its lit skyline. */
function paintSky(c: CanvasRenderingContext2D) {
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#04010f");
    g.addColorStop(0.45, "#12062e");
    g.addColorStop(0.8, "#2a0f4a");
    g.addColorStop(1, "#4a1747");
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
    // horizon haze
    const hz = c.createRadialGradient(W / 2, H, 10, W / 2, H, 420);
    hz.addColorStop(0, "rgba(255,120,160,0.25)");
    hz.addColorStop(1, "rgba(255,120,160,0)");
    c.fillStyle = hz;
    c.fillRect(0, 0, W, H);
    // skyline
    let x = -10;
    let seed = 7;
    const rr = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    while (x < W + 10) {
      const w = 22 + rr() * 34;
      const h = 40 + rr() * 110;
      c.fillStyle = "#0b0420";
      c.fillRect(x, H - h, w, h);
      c.fillStyle = "rgba(255,210,120,0.55)";
      for (let wy = H - h + 8; wy < H - 6; wy += 11) {
        for (let wx = x + 4; wx < x + w - 5; wx += 8) {
          if (rr() > 0.72) c.fillRect(wx, wy, 3, 4);
        }
      }
      x += w + 1 + rr() * 4;
    }
}

let skyLayer: HTMLCanvasElement | null = null;

function skyCanvas(): HTMLCanvasElement | null {
  if (skyLayer) return skyLayer;
  const doc = (globalThis as { document?: Document }).document;
  if (!doc?.createElement) return null;
  const cv = doc.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const g = cv.getContext('2d');
  if (!g) return null;
  paintSky(g as unknown as CanvasRenderingContext2D);
  skyLayer = cv;
  return cv;
}

/** Drop the cached sky (used when the canvas is resized). */
export function resetSetTwoSky() {
  skyLayer = null;
}

export function drawSetTwoSky(c: CanvasRenderingContext2D) {
  const cv = skyCanvas();
  if (!cv) return;
  c.drawImage(cv, 0, 0, W, H);
}

/** Slide 2's 110 stars, drawn at their own twinkle speeds. */
const STARS = Array.from({ length: 110 }, (_, i) => {
  const r1 = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    x: r1(1) * W,
    y: r1(2) * (H - 120),
    r: 0.4 + r1(3) * 1.3,
    ph: r1(4) * TAU,
    sp: 0.8 + r1(5) * 2.2,
  };
});

export function drawSetTwoStars(c: CanvasRenderingContext2D, time: number) {
  for (const s of STARS) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(time * s.sp + s.ph));
    c.fillStyle = `rgba(255,255,255,${a * 0.85})`;
    c.beginPath();
    c.arc(s.x, s.y, s.r, 0, TAU);
    c.fill();
  }
}

/**
 * Slide 2's per-weapon backdrop: the black-hole nebula and its lensing arcs, the
 * shark's underwater god rays, the bamboo cannon's jungle dusk, the soaker's
 * pool-party tint, the rainbow's aurora, the bazooka's smoky battlefield and the
 * RPG's desert haze. Call it after the sky, before the wheel.
 */
export function drawSetTwoAtmosphere(
  c: CanvasRenderingContext2D,
  weapon: string,
  time: number,
  cx: number,
  cy: number,
) {
    // deep-space nebula + gravitational warping for the black-hole gun
    if (weapon === "blackhole") {
      // darker cosmos base
      const dk = c.createLinearGradient(0, 0, 0, H);
      dk.addColorStop(0, "rgba(2,0,10,0.35)");
      dk.addColorStop(1, "rgba(8,2,24,0.3)");
      c.fillStyle = dk;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = "lighter";
      const na = 0.12 + 0.03 * Math.sin(time * 0.7);
      const neb1 = c.createRadialGradient(cx - 120, 200, 0, cx - 120, 200, 260);
      neb1.addColorStop(0, `rgba(110,30,200,${na})`);
      neb1.addColorStop(1, "rgba(90,30,180,0)");
      c.fillStyle = neb1;
      c.fillRect(0, 0, W, H);
      const neb2 = c.createRadialGradient(cx + 130, 420, 0, cx + 130, 420, 280);
      neb2.addColorStop(0, `rgba(20,110,220,${na})`);
      neb2.addColorStop(1, "rgba(20,90,200,0)");
      c.fillStyle = neb2;
      c.fillRect(0, 0, W, H);
      // magenta heart glow near the wheel
      const neb3 = c.createRadialGradient(cx, cy, 0, cx, cy, 220);
      neb3.addColorStop(0, `rgba(200,40,180,${na * 0.7})`);
      neb3.addColorStop(1, "rgba(200,40,180,0)");
      c.fillStyle = neb3;
      c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = "source-over";
      // warped light arcs bending around the scene (gravitational lensing)
      c.save();
      c.strokeStyle = "rgba(160,130,255,0.10)";
      c.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const rr = 190 + i * 46 + Math.sin(time * 0.8 + i * 2) * 6;
        c.beginPath();
        c.arc(cx, cy, rr, Math.PI * 0.15 + time * 0.05 * (i + 1), Math.PI * 0.85 + time * 0.05 * (i + 1));
        c.stroke();
        c.beginPath();
        c.arc(cx, cy, rr, Math.PI * 1.15 - time * 0.04 * (i + 1), Math.PI * 1.85 - time * 0.04 * (i + 1));
        c.stroke();
      }
      c.restore();
    }

    // underwater tint + god rays for the shark gun
    if (weapon === "shark") {
      const wg = c.createLinearGradient(0, 0, 0, H);
      wg.addColorStop(0, "rgba(8,40,90,0.28)");
      wg.addColorStop(0.6, "rgba(10,80,140,0.16)");
      wg.addColorStop(1, "rgba(6,30,70,0.34)");
      c.fillStyle = wg;
      c.fillRect(0, 0, W, H);
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.1 + 0.03 * Math.sin(time * 0.9);
      c.fillStyle = "#9fdcff";
      for (let i = 0; i < 3; i++) {
        const bx = 60 + i * 130 + Math.sin(time * 0.4 + i * 2) * 18;
        c.beginPath();
        c.moveTo(bx, -10);
        c.lineTo(bx + 44, -10);
        c.lineTo(bx + 110, H);
        c.lineTo(bx + 40, H);
        c.closePath();
        c.fill();
      }
      c.restore();
      // seabed glow at the bottom
      const sg = c.createLinearGradient(0, H - 90, 0, H);
      sg.addColorStop(0, "rgba(20,120,170,0)");
      sg.addColorStop(1, "rgba(20,140,190,0.22)");
      c.fillStyle = sg;
      c.fillRect(0, H - 90, W, 90);
    }

    // warm jungle dusk for the bamboo cannon
    if (weapon === "bamboo") {
      const jg = c.createLinearGradient(0, 0, 0, H);
      jg.addColorStop(0, "rgba(20,60,25,0.3)");
      jg.addColorStop(0.55, "rgba(60,70,20,0.14)");
      jg.addColorStop(1, "rgba(120,60,15,0.26)");
      c.fillStyle = jg;
      c.fillRect(0, 0, W, H);
      // fire glow from below
      const fg = c.createRadialGradient(cx, H, 20, cx, H, 380);
      const flick = 0.16 + 0.03 * Math.sin(time * 7) + 0.02 * Math.sin(time * 13);
      fg.addColorStop(0, `rgba(255,140,40,${flick})`);
      fg.addColorStop(1, "rgba(255,140,40,0)");
      c.fillStyle = fg;
      c.fillRect(0, 0, W, H);
      // bamboo silhouettes on the sides
      c.fillStyle = "rgba(25,70,30,0.5)";
      for (const [sx, sw, lean] of [[-14, 16, 0.06], [W - 2, 16, -0.06]] as const) {
        c.save();
        c.translate(sx, H);
        c.rotate(lean);
        c.fillRect(0, -H * 0.75, sw, H * 0.75);
        c.fillStyle = "rgba(40,110,45,0.5)";
        for (let i = 0; i < 5; i++) {
          c.fillRect(-3, -H * 0.72 + i * 110, sw + 6, 7);
        }
        c.fillStyle = "rgba(25,70,30,0.5)";
        c.restore();
      }
    }

    // bright pool-party tint for the super soaker
    if (weapon === "soaker") {
      const pg = c.createLinearGradient(0, 0, 0, H);
      pg.addColorStop(0, "rgba(40,140,220,0.2)");
      pg.addColorStop(0.6, "rgba(60,180,240,0.1)");
      pg.addColorStop(1, "rgba(20,100,180,0.24)");
      c.fillStyle = pg;
      c.fillRect(0, 0, W, H);
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.08 + 0.025 * Math.sin(time * 1.1);
      c.fillStyle = "#d8f4ff";
      for (let i = 0; i < 2; i++) {
        const bx = 90 + i * 190 + Math.sin(time * 0.5 + i * 2.4) * 16;
        c.beginPath();
        c.moveTo(bx, -10);
        c.lineTo(bx + 60, -10);
        c.lineTo(bx + 110, H);
        c.lineTo(bx + 30, H);
        c.closePath();
        c.fill();
      }
      c.restore();
    }

    // prismatic aurora for the rainbow laser gun
    if (weapon === "rainbow") {
      const ag = c.createLinearGradient(0, 0, 0, H);
      ag.addColorStop(0, "rgba(30,10,60,0.25)");
      ag.addColorStop(0.5, "rgba(20,30,90,0.12)");
      ag.addColorStop(1, "rgba(40,10,70,0.28)");
      c.fillStyle = ag;
      c.fillRect(0, 0, W, H);
      c.save();
      c.globalCompositeOperation = "lighter";
      // sweeping aurora ribbons
      for (let i = 0; i < 3; i++) {
        const hue = (time * 40 + i * 120) % 360;
        c.globalAlpha = 0.07 + 0.02 * Math.sin(time * 1.3 + i * 2);
        c.fillStyle = hsl(hue, 100, 60);
        const bx = 40 + i * 120 + Math.sin(time * 0.45 + i * 2.1) * 34;
        c.beginPath();
        c.moveTo(bx, -10);
        c.lineTo(bx + 52, -10);
        c.lineTo(bx + 130, H);
        c.lineTo(bx + 48, H);
        c.closePath();
        c.fill();
      }
      c.restore();
      // faint giant rainbow arc behind the wheel
      c.save();
      c.globalAlpha = 0.16;
      c.lineWidth = 9;
      for (let i = 0; i < 6; i++) {
        c.strokeStyle = hsl((time * 30 + i * 60) % 360, 100, 62);
        c.beginPath();
        c.arc(cx, cy + 190, 250 - i * 9, Math.PI * 1.12, Math.PI * 1.88);
        c.stroke();
      }
      c.restore();
    }

    // smoky battlefield dusk for the bazooka
    if (weapon === "bazooka") {
      const wg = c.createLinearGradient(0, 0, 0, H);
      wg.addColorStop(0, "rgba(30,28,18,0.32)");
      wg.addColorStop(0.55, "rgba(70,55,25,0.16)");
      wg.addColorStop(1, "rgba(120,60,18,0.3)");
      c.fillStyle = wg;
      c.fillRect(0, 0, W, H);
      // burning horizon glow
      const fg = c.createRadialGradient(cx, H, 20, cx, H, 400);
      const flick = 0.18 + 0.035 * Math.sin(time * 6) + 0.02 * Math.sin(time * 11);
      fg.addColorStop(0, `rgba(255,130,35,${flick})`);
      fg.addColorStop(1, "rgba(255,130,35,0)");
      c.fillStyle = fg;
      c.fillRect(0, 0, W, H);
      // sweeping searchlights
      c.save();
      c.globalCompositeOperation = "lighter";
      c.globalAlpha = 0.07 + 0.02 * Math.sin(time * 0.9);
      c.fillStyle = "#ffe9b8";
      for (let i = 0; i < 2; i++) {
        const bx = 70 + i * 200 + Math.sin(time * 0.4 + i * 2.6) * 40;
        c.beginPath();
        c.moveTo(bx, H);
        c.lineTo(bx + 34, H);
        c.lineTo(bx - 60 + (i === 0 ? 60 : -60), 0);
        c.lineTo(bx - 90 + (i === 0 ? 60 : -60), 0);
        c.closePath();
        c.fill();
      }
      c.restore();
      // sandbag silhouettes at the bottom corners
      c.fillStyle = "rgba(88,70,40,0.85)";
      for (const sx of [0, 1]) {
        const bx = sx === 0 ? 8 : W - 68;
        for (let r = 0; r < 2; r++) {
          for (let sb = 0; sb < 3; sb++) {
            c.beginPath();
            c.ellipse(bx + 10 + sb * 20 + (r % 2) * 10, H - 14 - r * 14, 11, 7.5, 0, 0, TAU);
            c.fill();
          }
        }
      }
    }

    // desert-storm combat haze for the RPG
    if (weapon === "rpg") {
      const dg = c.createLinearGradient(0, 0, 0, H);
      dg.addColorStop(0, "rgba(80,40,20,0.3)");
      dg.addColorStop(0.55, "rgba(140,80,35,0.14)");
      dg.addColorStop(1, "rgba(90,45,20,0.3)");
      c.fillStyle = dg;
      c.fillRect(0, 0, W, H);
      // dust sun glow
      const sg = c.createRadialGradient(cx + 110, 150, 10, cx + 110, 150, 260);
      const sa = 0.14 + 0.03 * Math.sin(time * 0.8);
      sg.addColorStop(0, `rgba(255,190,110,${sa})`);
      sg.addColorStop(1, "rgba(255,190,110,0)");
      c.fillStyle = sg;
      c.fillRect(0, 0, W, H);
      // drifting dust sheets
      c.save();
      c.globalAlpha = 0.08 + 0.02 * Math.sin(time * 1.2);
      c.fillStyle = "#e8c890";
      for (let i = 0; i < 2; i++) {
        const yy = 200 + i * 220 + Math.sin(time * 0.5 + i * 2) * 24;
        c.beginPath();
        c.ellipse(cx + Math.sin(time * 0.3 + i * 3) * 40, yy, 190, 26, 0, 0, TAU);
        c.fill();
      }
      c.restore();
      // distant tracer streaks arcing across the sky
      c.save();
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) {
        const tt = (time * 0.25 + i * 0.37) % 1;
        const tx = 30 + tt * (W - 60);
        const ty = 90 + i * 46 + Math.sin(tt * 6 + i) * 14;
        const grad = c.createLinearGradient(tx - 46, ty + 10, tx, ty);
        grad.addColorStop(0, "rgba(255,150,60,0)");
        grad.addColorStop(1, "rgba(255,200,120,0.7)");
        c.strokeStyle = grad;
        c.lineWidth = 2;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(tx - 46, ty + 10);
        c.lineTo(tx, ty);
        c.stroke();
        c.fillStyle = "rgba(255,240,210,0.9)";
        c.beginPath();
        c.arc(tx, ty, 1.8, 0, TAU);
        c.fill();
      }
      c.restore();
    }
}

/** Slide 2's wheel colour for a gun, exactly as slide 2 picks it per level. */
export function setTwoWheelHue(weapon: string, level: number): number {
  if (weapon === 'blackhole') return 235 + ((level * 37) % 80);
  if (weapon === 'shark') return 198 + ((level * 13) % 22);
  if (weapon === 'bamboo') return 95 + ((level * 17) % 30);
  if (weapon === 'soaker') return 190 + ((level * 11) % 20);
  if (weapon === 'rainbow') return (level * 67) % 360;
  if (weapon === 'bazooka') return 75 + ((level * 19) % 25);
  if (weapon === 'rpg') return 18 + ((level * 23) % 22);
  return (level * 47 + 280) % 360;
}

/** The soft ring of light slide 2 puts behind the wheel. */
export function drawSetTwoWheelGlow(
  c: CanvasRenderingContext2D,
  r: number,
  hue: number,
  pulse: number,
) {
    c.globalCompositeOperation = "lighter";
    const og = c.createRadialGradient(0, 0, r * 0.8, 0, 0, r + 85);
    og.addColorStop(0, hsl(hue, 100, 55, 0.3 + pulse * 0.25));
    og.addColorStop(1, hsl(hue, 100, 55, 0));
    c.fillStyle = og;
    c.beginPath();
    c.arc(0, 0, r + 85, 0, TAU);
    c.fill();
    c.globalCompositeOperation = "source-over";

}

/**
 * The rounds stuck in the wheel. Call it with the wheel's own transform in place
 * (centred on the wheel, rotated by its spin) — exactly how slide 2 calls it.
 */
export function drawSetTwoPins(
  c: CanvasRenderingContext2D,
  weapon: string,
  time: number,
  r: number,
  pins: readonly SetTwoPin[],
) {
  const shW = weapon === 'shark';
  const bbW = weapon === 'bamboo';
  const sqW = weapon === 'soaker';
  const rwW = weapon === 'rainbow';
  const bzW = weapon === 'bazooka';
  const rpW = weapon === 'rpg';
    for (const p of pins) {
      c.save();
      c.rotate(p.a);
      // The pin sits where its own round bit; `r` is only the flat-wheel rim.
      const pr = p.r ?? r;
      if (weapon === "blackhole") {
        c.translate(pr + 2, 0);
        drawOrb(c, p.hue, 11.5, time, p.hue * 0.7);
        if (p.flash > 0) {
          c.fillStyle = `rgba(255,255,255,${p.flash * 0.65})`;
          c.beginPath();
          c.arc(0, 0, 12.5, 0, TAU);
          c.fill();
        }
        // orbiting sparks
        for (let q = 0; q < 2; q++) {
          const sa = time * 3.2 + p.hue + q * Math.PI;
          c.fillStyle = q === 0 ? "#fff" : hsl(p.hue + 50, 100, 75, 0.95);
          c.beginPath();
          c.arc(Math.cos(sa) * 17, Math.sin(sa) * 17, q === 0 ? 2 : 1.6, 0, TAU);
          c.fill();
        }
      } else if (shW) {
        // shark clamped onto the board, tail wiggling, jaws snapping shut on bite
        const wig = Math.sin(time * 6 + p.seed * 8) * 0.028 * (0.4 + p.bite);
        c.rotate(wig);
        c.translate(pr - 3, 0);
        const snap = Math.sin(Math.min(1, p.bite) * Math.PI) * 0.4;
        const idle = Math.max(0, Math.sin(time * 1.6 + p.seed * 9)) * 0.07;
        drawShark(c, p.hue, 0.16 + snap + idle, time, p.seed, p.flash);
      } else if (bbW) {
        // stone embedded in the wood, half-buried
        c.translate(pr + 2, 0);
        drawStone(c, p.hue, 13, time * 0.3, p.seed, p.flash);
        // wooden splinter ring around fresh impacts
        if (p.bite > 0.15) {
          c.strokeStyle = `rgba(255,235,200,${p.bite * 0.8})`;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(0, 0, 15 + (1 - p.bite) * 8, 0, TAU);
          c.stroke();
        }
      } else if (sqW) {
        // water blob stuck on the board, wobbling
        c.translate(pr + 4, 0);
        c.rotate(-Math.PI / 2);
        const squash = 1 + Math.sin(time * 7 + p.seed * 8) * 0.06 + p.bite * 0.15;
        c.scale(squash, 1 / squash);
        drawDrop(c, p.hue, 11.5, time, p.seed, p.flash);
      } else if (rwW) {
        // rainbow laser bolt lodged tip-first, humming with spectrum energy
        c.translate(pr - 4, 0);
        const jig = Math.sin(time * 10 + p.seed * 9) * 0.012;
        c.rotate(jig);
        const pop = 1 + p.bite * 0.25;
        c.scale(pop, pop);
        drawRainbowBolt(c, time, p.seed, p.flash, 1);
      } else if (bzW) {
        // bazooka shell rammed nose-first into armor — crater + molten rim + smoke
        const sink = (1 - Math.min(1, p.bite * 1.6)) * 2;
        c.translate(pr - 5 - sink, 0);
        const jig = Math.sin(time * 9 + p.seed * 8) * 0.014 * (0.4 + p.bite);
        c.rotate(jig);
        // scorched crater behind the shell (cools from white to black)
        const ck = Math.min(1, p.bite * 1.4);
        c.fillStyle = `rgba(8,6,4,${0.55 + 0.35 * ck})`;
        c.beginPath();
        c.ellipse(-3, 0, 11, 8.5, 0, 0, TAU);
        c.fill();
        if (p.bite > 0.05) {
          c.save();
          c.globalCompositeOperation = "lighter";
          const mg = c.createRadialGradient(-3, 0, 0, -3, 0, 13);
          mg.addColorStop(0, `rgba(255,240,210,${0.7 * ck})`);
          mg.addColorStop(0.45, `rgba(255,160,60,${0.5 * ck})`);
          mg.addColorStop(1, "rgba(255,110,30,0)");
          c.fillStyle = mg;
          c.beginPath();
          c.arc(-3, 0, 13, 0, TAU);
          c.fill();
          c.restore();
          // bent armor lips
          c.strokeStyle = `rgba(200,190,150,${0.5 + 0.4 * ck})`;
          c.lineWidth = 2;
          for (const s of [-1, 1]) {
            c.beginPath();
            c.moveTo(-8, s * 6);
            c.quadraticCurveTo(-13, s * 9, -17, s * 8);
            c.stroke();
          }
        }
        drawBazookaShell(c, p.hue, time, p.seed, p.flash, 0);
        if (p.bite > 0.12) {
          c.strokeStyle = `rgba(255,190,110,${p.bite * 0.7})`;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(-2, 0, 13 + (1 - p.bite) * 12, 0, TAU);
          c.stroke();
        }
      } else if (rpW) {
        // RPG grenade pierced deep — star-shaped breach + white-hot jet hole
        const sink = (1 - Math.min(1, p.bite * 1.6)) * 3;
        c.translate(pr - 7 - sink, 0);
        const jig = Math.sin(time * 8 + p.seed * 7) * 0.014 * (0.4 + p.bite);
        c.rotate(jig);
        const ck = Math.min(1, p.bite * 1.5);
        // jagged breach
        c.fillStyle = `rgba(10,6,4,${0.6 + 0.35 * ck})`;
        c.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU + p.seed;
          const rr = 9 + (i % 2) * 4.5;
          const px = -3 + Math.cos(a) * rr;
          const py = Math.sin(a) * rr * 0.8;
          if (i === 0) c.moveTo(px, py);
          else c.lineTo(px, py);
        }
        c.closePath();
        c.fill();
        if (p.bite > 0.05) {
          c.save();
          c.globalCompositeOperation = "lighter";
          const mg = c.createRadialGradient(-4, 0, 0, -4, 0, 12);
          mg.addColorStop(0, `rgba(255,255,255,${0.8 * ck})`);
          mg.addColorStop(0.4, `rgba(200,235,255,${0.55 * ck})`);
          mg.addColorStop(1, "rgba(255,150,60,0)");
          c.fillStyle = mg;
          c.beginPath();
          c.arc(-4, 0, 12, 0, TAU);
          c.fill();
          c.restore();
          // peeled steel petals
          c.strokeStyle = `rgba(215,190,150,${0.55 + 0.35 * ck})`;
          c.lineWidth = 2;
          for (let i = 0; i < 4; i++) {
            const a = p.seed + (i * TAU) / 4;
            c.beginPath();
            c.moveTo(-3 + Math.cos(a) * 8, Math.sin(a) * 7);
            c.lineTo(-3 + Math.cos(a) * 15, Math.sin(a) * 12);
            c.stroke();
          }
        }
        drawRpgGrenade(c, p.hue, time, p.seed, p.flash, 0);
        if (p.bite > 0.12) {
          c.strokeStyle = `rgba(220,240,255,${p.bite * 0.6})`;
          c.lineWidth = 2;
          c.beginPath();
          c.arc(-4, 0, 14 + (1 - p.bite) * 12, 0, TAU);
          c.stroke();
        }
      } else {
        c.translate(pr - 6, 0);
        drawRocketShape(c, p.hue, p.flash);
      }
      c.restore();
    }
}
