import {
  bossDef,
  bossPalette,
  type BossAttackFamily,
  type BossHead,
} from './bossCatalog';

const TAU = Math.PI * 2;

/**
 * A boss shot. `type` is only the FX family the drawn body belongs to; `head`
 * is the boss that fired it (one of Game B's eleven heads) and supplies the
 * accent colour, sigil and palette. A boss can never be mistaken for another
 * one just because two heads share a body shape.
 */
export interface BossProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  type: BossAttackFamily;
  head?: BossHead;
}

export interface BossMuzzleFlash {
  x: number;
  y: number;
  rot: number;
  type: BossAttackFamily;
  head?: BossHead;
  age: number;
  max: number;
}

/** Body family used when a caller only names the family (older tooling). */
const FAMILY_HEAD: Record<BossAttackFamily, BossHead> = {
  knight: 'skeleton',
  oni: 'oni',
  cyborg: 'robot',
  pirate: 'pirate',
};

const headOf = (bp: { type: BossAttackFamily; head?: BossHead }): BossHead =>
  bp.head ?? FAMILY_HEAD[bp.type];

/** `#rrggbb` + alpha → `rgba(...)`; non-hex input is returned unchanged. */
const colorWithAlpha = (color: string, alpha: number): string => {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha.toFixed(2)})`;
};

/**
 * The boss' own mark, in the boss' own colour, around the shot's core. Eleven
 * heads → eleven different marks, so the attack in the air is identifiable as
 * the head that threw it even while two share a body family.
 */
function drawBossSigil(c: CanvasRenderingContext2D, head: BossHead, pulse: number) {
  const { accent } = bossPalette(head);
  const a = 0.72 + pulse * 0.28;
  c.save();
  c.globalAlpha *= a;
  c.strokeStyle = accent;
  c.fillStyle = accent;
  c.lineWidth = 1.5;
  c.lineJoin = 'round';
  c.lineCap = 'round';
  switch (head) {
    case 'pirate': {
      // Trident of the seven seas.
      c.beginPath();
      c.moveTo(0, -9); c.lineTo(0, 9);
      c.moveTo(-6, -6); c.lineTo(0, -9); c.lineTo(6, -6);
      c.moveTo(-5.5, -1.5); c.lineTo(5.5, -1.5);
      c.stroke();
      break;
    }
    case 'jester': {
      // A spinning playing card.
      c.rotate(pulse * 1.6);
      c.strokeRect(-5, -7, 10, 14);
      c.beginPath();
      c.arc(0, 0, 2.2, 0, TAU);
      c.fill();
      break;
    }
    case 'dragon': {
      // Scaled wing arcs.
      for (const side of [-1, 1]) {
        c.beginPath();
        c.moveTo(side * 1.5, 6);
        c.quadraticCurveTo(side * 12, 2, side * 8, -8);
        c.stroke();
      }
      break;
    }
    case 'skeleton': {
      // Crossed bone.
      c.beginPath();
      c.moveTo(-6, -6); c.lineTo(6, 6);
      c.moveTo(6, -6); c.lineTo(-6, 6);
      c.stroke();
      for (const [bx, by] of [[-6, -6], [6, -6], [-6, 6], [6, 6]] as const) {
        c.beginPath();
        c.arc(bx, by, 1.7, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'tiki': {
      // Carved totem eye.
      c.strokeRect(-6.5, -3.5, 13, 7);
      c.beginPath();
      c.arc(0, 0, 2.2, 0, TAU);
      c.fill();
      break;
    }
    case 'viking': {
      // Rune wheel.
      c.beginPath();
      c.arc(0, 0, 6.5, 0, TAU);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + pulse * 0.6;
        c.moveTo(Math.cos(ang) * 2.4, Math.sin(ang) * 2.4);
        c.lineTo(Math.cos(ang) * 9.4, Math.sin(ang) * 9.4);
      }
      c.stroke();
      break;
    }
    case 'oni': {
      // Two demon horns.
      for (const side of [-1, 1]) {
        c.beginPath();
        c.moveTo(side * 3, 4);
        c.quadraticCurveTo(side * 10, -2, side * 6.5, -9);
        c.stroke();
      }
      break;
    }
    case 'robot': {
      // Targeting reticle.
      c.strokeRect(-5.5, -5.5, 11, 11);
      c.beginPath();
      c.moveTo(-9, 0); c.lineTo(-6, 0);
      c.moveTo(9, 0); c.lineTo(6, 0);
      c.moveTo(0, -9); c.lineTo(0, -6);
      c.stroke();
      break;
    }
    case 'alien': {
      // Big-headed visitor.
      c.beginPath();
      c.ellipse(0, -1, 5.6, 7.4, 0, 0, TAU);
      c.stroke();
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(side * 2.4, -1.5, 1.5, 2.4, side * 0.5, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'vampire': {
      // Bat silhouette.
      c.beginPath();
      c.moveTo(0, -1);
      c.quadraticCurveTo(-6, -7, -10, -3);
      c.quadraticCurveTo(-7, -1, -6, 3);
      c.quadraticCurveTo(-3, 1, 0, 4);
      c.quadraticCurveTo(3, 1, 6, 3);
      c.quadraticCurveTo(7, -1, 10, -3);
      c.quadraticCurveTo(6, -7, 0, -1);
      c.fill();
      break;
    }
    case 'sun': {
      // Crown of rays.
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * TAU + pulse * 0.3;
        c.beginPath();
        c.moveTo(Math.cos(ang) * 4.5, Math.sin(ang) * 4.5);
        c.lineTo(Math.cos(ang) * (8.2 + pulse * 1.6), Math.sin(ang) * (8.2 + pulse * 1.6));
        c.stroke();
      }
      c.beginPath();
      c.arc(0, 0, 3.4, 0, TAU);
      c.fill();
      break;
    }
    default:
      break;
  }
  c.restore();
}

/**
 * Crisp directional muzzle shockwave & energy burst when a boss launches an attack.
 * Uses pure vector paths & alpha layers (no GPU-expensive blur filters) for ultra-high FPS.
 */
export function drawBossMuzzleFlash(c: CanvasRenderingContext2D, mf: BossMuzzleFlash) {
  const p = Math.max(0, Math.min(1, mf.age / mf.max));
  const a = 1 - p;
  if (a <= 0.02) return;

  c.save();
  c.translate(mf.x, mf.y);
  c.rotate(mf.rot);

  const expand = 0.65 + p * 1.15;
  // The flash wears the firing head's own accent — eleven heads, eleven flashes.
  const head = headOf(mf);
  const own = bossPalette(head);
  const palette = {
    outer: `rgba(${own.rgb},`,
    mid: `rgba(${own.rgb},`,
    accent: `${own.accent}`,
  };

  // 1. Directional forward crescent shockwave
  c.strokeStyle = `${palette.outer}${(a * 0.85).toFixed(2)})`;
  c.lineWidth = 4.2 * a;
  c.beginPath();
  c.arc(0, 10 * expand, 24 * expand, 0.22 * Math.PI, 0.78 * Math.PI);
  c.stroke();

  c.strokeStyle = colorWithAlpha(palette.accent, a * 0.9);
  c.lineWidth = 2.2 * a;
  c.beginPath();
  c.arc(0, 15 * expand, 17 * expand, 0.26 * Math.PI, 0.74 * Math.PI);
  c.stroke();

  // 2. Crisp 6-spike directional launch star
  c.fillStyle = `${palette.mid}${(a * 0.92).toFixed(2)})`;
  c.beginPath();
  const spikes = 6;
  for (let i = 0; i < spikes * 2; i++) {
    const ang = (i * Math.PI) / spikes - Math.PI / 2;
    const isForward = Math.sin(ang) > 0.25;
    const rad = i % 2 === 0 ? (isForward ? 30 : 18) * (1 - p * 0.35) : 5.5 * a;
    const sx = Math.cos(ang) * rad;
    const sy = Math.sin(ang) * rad;
    if (i === 0) c.moveTo(sx, sy);
    else c.lineTo(sx, sy);
  }
  c.closePath();
  c.fill();

  // 3. White-hot launch core diamond
  c.fillStyle = `rgba(255,255,255,${(a * 0.95).toFixed(2)})`;
  const core = 8 * a;
  c.beginPath();
  c.moveTo(0, core * 1.6);
  c.lineTo(core * 0.85, 0);
  c.lineTo(0, -core * 0.8);
  c.lineTo(-core * 0.85, 0);
  c.closePath();
  c.fill();

  c.restore();
}

/**
 * Draw a distinct, high-impact arcade projectile + animated wake & sonic wave for each boss;
 * pure crisp vector layers and linear gradients for 60–120 FPS mobile smoothness.
 */
export function drawBossProjectile(
  c: CanvasRenderingContext2D,
  bp: BossProjectile,
  time: number,
  visualScale = 1,
) {
  c.save();
  c.translate(bp.x, bp.y);
  c.scale(2.65 * visualScale, 2.65 * visualScale);
  c.rotate(bp.rot);

  const pulse = 0.5 + 0.5 * Math.sin(time * 24 + bp.x * 0.05);
  const wave = Math.sin(time * 28 + bp.y * 0.04);

  // ── 1. INDIVIDUAL ANIMATED WAKES & TRAILS (local -Y, behind projectile) ──
  if (bp.type === 'knight') {
    // Swept abyssal slash ribbons & rune motes
    c.fillStyle = 'rgba(56,189,248,0.24)';
    c.beginPath();
    c.moveTo(-4.5, -10);
    c.quadraticCurveTo(wave * 3.2, -29, 0, -48 - pulse * 5);
    c.quadraticCurveTo(-wave * 2.4, -28, 4.5, -10);
    c.closePath();
    c.fill();

    // Twin razor wing-streaks
    c.fillStyle = 'rgba(125,211,252,0.52)';
    c.beginPath();
    c.moveTo(-6, -11);
    c.quadraticCurveTo(-13, -22, -14 - pulse * 2, -33);
    c.lineTo(-4, -18);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(6, -11);
    c.quadraticCurveTo(13, -22, 14 + pulse * 2, -33);
    c.lineTo(4, -18);
    c.closePath();
    c.fill();

    // Crimson cursed core ribbon + rune diamonds
    c.fillStyle = 'rgba(244,63,94,0.55)';
    c.beginPath();
    c.moveTo(-1.8, -14);
    c.lineTo(wave * 1.4, -36 - pulse * 4);
    c.lineTo(1.8, -14);
    c.closePath();
    c.fill();

    c.fillStyle = '#bae6fd';
    for (let m = 0; m < 2; m++) {
      const my = -23 - ((time * 38 + m * 12) % 20);
      const ms = (1 - (-my - 23) / 22) * 2.1;
      if (ms > 0.3) {
        c.beginPath();
        c.moveTo(0, my - ms);
        c.lineTo(ms, my);
        c.lineTo(0, my + ms);
        c.lineTo(-ms, my);
        c.closePath();
        c.fill();
      }
    }
  } else if (bp.type === 'oni') {
    // Roaring hellfire comet wake with whipping demon-horn flame tongues
    const flick = 1 + Math.sin(time * 30 + bp.x * 0.06) * 0.2;
    c.fillStyle = 'rgba(153,27,27,0.52)';
    c.beginPath();
    c.moveTo(-11, -4);
    c.quadraticCurveTo(-16 * flick, -26, wave * 2.5, -47 * flick);
    c.quadraticCurveTo(16 * flick, -26, 11, -4);
    c.closePath();
    c.fill();

    c.fillStyle = '#dc2626';
    c.beginPath();
    c.moveTo(-8, -8);
    c.quadraticCurveTo(-13 * flick, -27, -2.5 + wave, -41 * flick);
    c.lineTo(0, -13);
    c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(8, -8);
    c.quadraticCurveTo(13 * flick, -27, 2.5 + wave, -41 * flick);
    c.lineTo(0, -13);
    c.closePath();
    c.fill();

    c.fillStyle = '#fb923c';
    c.beginPath();
    c.moveTo(-4.8, -10);
    c.quadraticCurveTo(-6.5, -24, wave * 1.2, -34 * flick);
    c.quadraticCurveTo(6.5, -24, 4.8, -10);
    c.closePath();
    c.fill();

    c.fillStyle = '#fef08a';
    c.beginPath();
    c.moveTo(-2.2, -11);
    c.lineTo(wave * 0.6, -24 * flick);
    c.lineTo(2.2, -11);
    c.closePath();
    c.fill();
  } else if (bp.type === 'cyborg') {
    // Mach diamond plasma thruster plume + digital telemetry chevrons
    const thrust = 1 + Math.sin(time * 42 + bp.y * 0.08) * 0.22;
    c.strokeStyle = 'rgba(34,211,238,0.48)';
    c.lineWidth = 1.4;
    for (let i = 0; i < 3; i++) {
      const cy = -18 - ((time * 40 + i * 9) % 26);
      const cw = 6.5 - i * 1.1;
      c.beginPath();
      c.moveTo(-cw, cy - 3);
      c.lineTo(0, cy);
      c.lineTo(cw, cy - 3);
      c.stroke();
    }

    // Outer plasma exhaust cone
    c.fillStyle = 'rgba(249,115,22,0.85)';
    c.beginPath();
    c.moveTo(-4.2, -12);
    c.lineTo(0, -33 * thrust);
    c.lineTo(4.2, -12);
    c.closePath();
    c.fill();

    // Inner cyan-white Mach shock diamond
    c.fillStyle = '#22d3ee';
    c.beginPath();
    c.moveTo(-2.6, -12);
    c.lineTo(0, -24 * thrust);
    c.lineTo(2.6, -12);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.moveTo(-1.3, -12);
    c.lineTo(0, -18 * thrust);
    c.lineTo(1.3, -12);
    c.closePath();
    c.fill();
  } else if (bp.type === 'pirate') {
    // Billowing cannon-smoke rings + swirling cursed emerald ghost-flames
    c.fillStyle = 'rgba(30,41,59,0.58)';
    for (const puff of [
      { x: -4.2 + wave * 0.8, y: -17, r: 5.2 },
      { x: 3.8 - wave * 0.9, y: -27, r: 5.8 },
      { x: -1.8 + wave * 0.6, y: -38, r: 4.1 },
    ]) {
      c.beginPath();
      c.arc(puff.x, puff.y, puff.r, 0, TAU);
      c.fill();
    }
    // Spectral green ectoplasm wisps
    c.fillStyle = 'rgba(34,197,94,0.68)';
    c.beginPath();
    c.moveTo(-6, -10);
    c.quadraticCurveTo(-9 + wave * 1.5, -23, -1.5, -35 - pulse * 4);
    c.quadraticCurveTo(0, -22, 2, -11);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(134,239,172,0.82)';
    c.beginPath();
    c.moveTo(1, -11);
    c.quadraticCurveTo(7 - wave * 1.4, -20, 2.5, -28 - pulse * 3);
    c.lineTo(-1.5, -13);
    c.closePath();
    c.fill();
  }

  // ── 2. PROJECTILE BODY & LEADING SONIC WAVE (local +Y = direction of travel) ──
  if (bp.type === 'knight') {
    // Abyssal Runeblade — a clearly readable flying knight sword: blade points
    // along +Y travel, with dual-bevel steel, crimson rune fuller, winged guard, and leading slash crescent.

    // Leading crescent slash shockwave ahead of blade tip
    c.fillStyle = 'rgba(56,189,248,0.34)';
    c.beginPath();
    c.arc(0, 9, 15.5 + pulse * 1.4, 0.16 * Math.PI, 0.84 * Math.PI);
    c.arc(0, 12.2, 12.8 + pulse * 1.1, 0.82 * Math.PI, 0.18 * Math.PI, true);
    c.closePath();
    c.fill();

    c.strokeStyle = '#e0f2fe';
    c.lineWidth = 1.3;
    c.beginPath();
    c.arc(0, 10.2, 14.5 + pulse * 1.2, 0.24 * Math.PI, 0.76 * Math.PI);
    c.stroke();

    // Sword silhouette with bold dark armor outline
    c.fillStyle = '#041322';
    c.beginPath();
    c.moveTo(-5.4, -9);
    c.lineTo(-5.8, 9.5);
    c.lineTo(0, 22.8);
    c.lineTo(5.8, 9.5);
    c.lineTo(5.4, -9);
    c.closePath();
    c.fill();

    // Left mirror-bright blade bevel
    c.fillStyle = '#e0f2fe';
    c.beginPath();
    c.moveTo(-4.1, -8.5);
    c.lineTo(-4.4, 9.5);
    c.lineTo(0, 21);
    c.lineTo(0, -8.5);
    c.closePath();
    c.fill();

    // Right deep sky-steel bevel
    c.fillStyle = '#0284c7';
    c.beginPath();
    c.moveTo(0, -8.5);
    c.lineTo(0, 21);
    c.lineTo(4.4, 9.5);
    c.lineTo(4.1, -8.5);
    c.closePath();
    c.fill();

    // Dark fuller channel + glowing crimson-cyan rune core
    c.fillStyle = '#082f49';
    c.beginPath();
    c.moveTo(-1.5, -7);
    c.lineTo(-1.5, 10.5);
    c.lineTo(0, 16.5);
    c.lineTo(1.5, 10.5);
    c.lineTo(1.5, -7);
    c.closePath();
    c.fill();

    c.fillStyle = pulse > 0.5 ? '#fda4af' : '#7dd3fc';
    c.fillRect(-0.65, -5.5, 1.3, 18);

    // Winged dark-knight crossguard
    c.fillStyle = '#082f49';
    c.beginPath();
    c.moveTo(-12.5, -11.5);
    c.lineTo(-7.5, -6.8);
    c.lineTo(7.5, -6.8);
    c.lineTo(12.5, -11.5);
    c.lineTo(9.5, -2.5);
    c.lineTo(0, -4.4);
    c.lineTo(-9.5, -2.5);
    c.closePath();
    c.fill();

    c.fillStyle = '#38bdf8';
    c.beginPath();
    c.moveTo(-11, -10.2);
    c.lineTo(-7, -6.2);
    c.lineTo(7, -6.2);
    c.lineTo(11, -10.2);
    c.lineTo(8.5, -3.5);
    c.lineTo(0, -5.1);
    c.lineTo(-8.5, -3.5);
    c.closePath();
    c.fill();

    // Crimson demon-eye gem in crossguard
    c.fillStyle = '#ff1133';
    c.beginPath();
    c.moveTo(0, -3.2);
    c.lineTo(2.3, -6);
    c.lineTo(0, -8.8);
    c.lineTo(-2.3, -6);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffe4e6';
    c.fillRect(-0.6, -6.8, 1.2, 1.4);

    // Wrapped hilt & spiked pommel
    c.fillStyle = '#082f49';
    c.fillRect(-2.8, -18.5, 5.6, 10);
    c.fillStyle = '#7dd3fc';
    for (const gy of [-16.5, -13.2, -9.9]) c.fillRect(-3.1, gy, 6.2, 1.3);
    c.fillStyle = '#082f49';
    c.beginPath();
    c.arc(0, -20.5, 3.8, 0, TAU);
    c.fill();
    c.fillStyle = '#38bdf8';
    c.beginPath();
    c.arc(0, -20.5, 2.3, 0, TAU);
    c.fill();
  } else if (bp.type === 'oni') {
    // Hellfire Horned Meteor — hot red fireball with two horn-shaped tongues,
    // volcanic magma crust, blazing bow-wave, and fierce demon eyes.

    // Leading solar bow-wave arc
    c.strokeStyle = 'rgba(253,224,71,0.78)';
    c.lineWidth = 1.9;
    c.beginPath();
    c.arc(0, 2, 15.8 + pulse * 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
    c.stroke();

    // Curved golden demon horns flanking the fireball
    for (const side of [-1, 1]) {
      c.fillStyle = '#450a0a';
      c.beginPath();
      c.moveTo(side * 6.5, -7);
      c.quadraticCurveTo(side * 16.5, -12, side * 13.8, -20);
      c.quadraticCurveTo(side * 11.2, -11, side * 9.5, -3.5);
      c.closePath();
      c.fill();

      c.fillStyle = '#facc15';
      c.beginPath();
      c.moveTo(side * 7, -7.5);
      c.lineTo(side * 13.2, -18.2);
      c.lineTo(side * 10, -4.5);
      c.closePath();
      c.fill();
    }

    // Volcanic dark rim + layered magma core
    c.fillStyle = '#450a0a';
    c.beginPath();
    c.arc(0, 1.5, 13.8, 0, TAU);
    c.fill();

    c.fillStyle = '#b91c1c';
    c.beginPath();
    c.arc(0, 1.5, 12.2, 0, TAU);
    c.fill();

    c.fillStyle = '#ef4444';
    c.beginPath();
    c.arc(0, 2.2, 10.2, 0, TAU);
    c.fill();

    c.fillStyle = '#fb923c';
    c.beginPath();
    c.arc(0, 3.2, 7.6, 0, TAU);
    c.fill();

    c.fillStyle = '#fde047';
    c.beginPath();
    c.arc(0, 4.2, 4.9 + pulse * 0.8, 0, TAU);
    c.fill();

    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(0, 5, 2.4, 0, TAU);
    c.fill();

    // Fierce Oni glare slits on the fireball
    c.fillStyle = '#450a0a';
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(side * 7.8, -1.2);
      c.lineTo(side * 2.2, 1.4);
      c.lineTo(side * 3.8, -2.8);
      c.closePath();
      c.fill();
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.arc(side * 4.6, -0.8, 1.15, 0, TAU);
      c.fill();
      c.fillStyle = '#450a0a';
    }
  } else if (bp.type === 'cyborg') {
    // Hard-edged cyan micro-rocket, with red plasma seeker nose, armored bevels,
    // swept delta stabilizer fins, and leading Mach V-shockwave.

    // Leading sonic Mach chevron
    c.strokeStyle = 'rgba(103,232,249,0.75)';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-10.5, 10.5);
    c.lineTo(0, 21.5 + pulse * 1.8);
    c.lineTo(10.5, 10.5);
    c.stroke();

    // Swept stabilizer delta wings
    c.fillStyle = '#082f49';
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(side * 5, -11.5);
      c.lineTo(side * 13.5, -15.5);
      c.lineTo(side * 12, -4);
      c.lineTo(side * 5, 1);
      c.closePath();
      c.fill();

      c.fillStyle = '#0891b2';
      c.beginPath();
      c.moveTo(side * 5, -10.2);
      c.lineTo(side * 11.8, -13.8);
      c.lineTo(side * 10.6, -4.8);
      c.lineTo(side * 5, -0.2);
      c.closePath();
      c.fill();

      // Crimson hazard tip on wing
      c.fillStyle = '#ff1133';
      c.fillRect(side > 0 ? 9.2 : -11.4, -12.5, 2.2, 5.5);
      c.fillStyle = '#082f49';
    }

    // Armored fuselage dark outline
    c.fillStyle = '#082f49';
    c.beginPath();
    c.moveTo(-6.2, -12.5);
    c.lineTo(-6.2, 7.5);
    c.lineTo(0, 19);
    c.lineTo(6.2, 7.5);
    c.lineTo(6.2, -12.5);
    c.closePath();
    c.fill();

    // Left bright cyan armor bevel
    c.fillStyle = '#67e8f9';
    c.beginPath();
    c.moveTo(-4.8, -11.2);
    c.lineTo(-4.8, 7.2);
    c.lineTo(0, 17.2);
    c.lineTo(0, -11.2);
    c.closePath();
    c.fill();

    // Right deeper cyan-steel armor bevel
    c.fillStyle = '#06b6d4';
    c.beginPath();
    c.moveTo(0, -11.2);
    c.lineTo(0, 17.2);
    c.lineTo(4.8, 7.2);
    c.lineTo(4.8, -11.2);
    c.closePath();
    c.fill();

    // Red laser-seeker nose cone & glowing optical warhead slit
    c.fillStyle = '#ff1133';
    c.beginPath();
    c.moveTo(-3.4, 9.2);
    c.lineTo(0, 17.2);
    c.lineTo(3.4, 9.2);
    c.closePath();
    c.fill();

    c.fillStyle = '#0f172a';
    c.fillRect(-3.2, -3.5, 6.4, 8.5);
    c.fillStyle = pulse > 0.45 ? '#ff1133' : '#fb7185';
    c.fillRect(-1.9, -2.2, 3.8, 6);
    c.fillStyle = '#ffffff';
    c.fillRect(-0.8, -1, 1.6, 3.4);

    // Rear thruster collar
    c.fillStyle = '#1e293b';
    c.fillRect(-4.5, -13, 9, 2.6);
  } else {
    // Pirate iron shot: battered dark cannonball with cursed emerald shockwave,
    // golden pirate band, specular iron rim, and glowing Jolly Roger skull mark.

    // Leading cursed emerald-gold shockwave crescent
    c.strokeStyle = 'rgba(74,222,128,0.72)';
    c.lineWidth = 1.8;
    c.beginPath();
    c.arc(0, 1.5, 15.6 + pulse * 1.3, 0.2 * Math.PI, 0.8 * Math.PI);
    c.stroke();

    // Heavy iron sphere + dark cartoon outline
    c.fillStyle = '#020617';
    c.beginPath();
    c.arc(0, 0, 13.8, 0, TAU);
    c.fill();

    const iron = c.createLinearGradient(-10, -10, 10, 10);
    iron.addColorStop(0, '#334155');
    iron.addColorStop(0.45, '#1e293b');
    iron.addColorStop(1, '#090d16');
    c.fillStyle = iron;
    c.beginPath();
    c.arc(0, 0, 12.2, 0, TAU);
    c.fill();

    // Specular metallic highlight arc
    c.fillStyle = 'rgba(148,163,184,0.38)';
    c.beginPath();
    c.ellipse(-4.5, -4.8, 4.2, 2.3, -0.65, 0, TAU);
    c.fill();

    // Gold pirate rim & riveted band
    c.strokeStyle = '#eab308';
    c.lineWidth = 1.9;
    c.beginPath();
    c.arc(0, 0, 12.2, 0, TAU);
    c.stroke();

    c.fillStyle = '#ca8a04';
    c.fillRect(-10.5, 5.8, 21, 2.6);
    c.fillStyle = '#fef08a';
    for (const rx of [-7, 0, 7]) {
      c.beginPath();
      c.arc(rx, 7.1, 0.9, 0, TAU);
      c.fill();
    }

    // Glowing ghostly-emerald Jolly Roger skull & crossbones
    c.strokeStyle = '#86efac';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-6.2, -5.5);
    c.lineTo(6.2, 2.5);
    c.moveTo(6.2, -5.5);
    c.lineTo(-6.2, 2.5);
    c.stroke();

    c.fillStyle = '#4ade80';
    c.beginPath();
    c.arc(0, -2, 5.2, 0, TAU);
    c.fill();
    c.fillRect(-3.1, 1.2, 6.2, 2.8);

    c.fillStyle = '#052e16';
    c.beginPath();
    c.arc(-2, -2.2, 1.25, 0, TAU);
    c.arc(2, -2.2, 1.25, 0, TAU);
    c.fill();
    c.fillRect(-2.4, 2, 4.8, 1.1);
  }

  // The head that fired it, stamped in its own accent so the eleven Game B
  // bosses stay tellable apart even when their bodies share a family.
  drawBossSigil(c, headOf(bp), pulse);
  c.restore();
}
