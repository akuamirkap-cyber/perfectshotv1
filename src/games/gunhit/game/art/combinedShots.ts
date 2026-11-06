import { glow } from '../../vendor/game-2/src/weapons';
import { drawProjectile } from './projectiles';

const TAU = Math.PI * 2;
/** Slide-6 repulsor ('iron') colour and beam lifetime — its own pixels and timing. */
const IRON_COL = '140,220,255';
const IRON_BEAM_LIFE = 0.28;

/**
 * These are visual layers only. The caller owns exactly one projectile and one
 * collision; never run a second weapon's fire/hit recipe here.
 */

/** Where the combo's effect-3 beam comes from: the muzzle and the shot clock. */
export interface ComboBeam {
  x: number;
  y: number;
  born: number;
}

/**
 * Slide-6's 'iron' repulsor muzzle burst (its `spawnMuzzle()` particles), at
 * `age` seconds old: the additive glow and the two expanding rings, with the
 * same sizes, colours and lifetimes slide-6's own particle renderer uses.
 */
function drawRepulsorMuzzle(c: CanvasRenderingContext2D, x: number, y: number, age: number) {
  const kGlow = Math.max(0, 1 - age / 0.3);
  const rings: readonly [number, number, string][] = [[0.35, 55, IRON_COL], [0.25, 30, '255,255,255']];
  if (kGlow <= 0 && age >= rings[0][0]) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  if (kGlow > 0) glow(c, x, y, 90 * (0.6 + 0.4 * kGlow), IRON_COL, kGlow);
  for (const [life, size, col] of rings) {
    const k = Math.max(0, 1 - age / life);
    if (k <= 0) continue;
    c.strokeStyle = `rgba(${col},${k * 0.9})`;
    c.lineWidth = 3 * k + 0.5;
    c.beginPath();
    c.arc(x, y, size * (1 - k * 0.8), 0, TAU);
    c.stroke();
  }
  c.restore();
}

/**
 * Slide-6's 'iron' repulsor beam (its `drawBeam()`), stretched from the muzzle
 * (x1, y1) to the round in flight (x2, y2), at `age` seconds into its own
 * 0.28 s fade: the same three lighter strokes and the same four travelling
 * rings slide 6 paints, sweeping from the gun towards the glove.
 */
function drawRepulsorBeam(
  c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, age: number,
) {
  const k = Math.max(0, 1 - age / IRON_BEAM_LIFE);
  if (k <= 0) return;
  c.save();
  c.globalCompositeOperation = 'lighter';
  const line = (wd: number, col: string) => {
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.strokeStyle = col;
    c.lineWidth = wd;
    c.lineCap = 'round';
    c.stroke();
  };
  line(44 * k, `rgba(120,200,255,${0.15 * k})`);
  line(20 * k, `rgba(160,225,255,${0.55 * k})`);
  line(8 * k, `rgba(255,255,255,${k})`);
  const ph = (1 - k) * 4;
  for (let i = 0; i < 4; i++) {
    const u = (i / 4 + ph) % 1;
    c.strokeStyle = `rgba(200,240,255,${0.6 * k})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, 16 * k + 4, 5, 0, 0, TAU);
    c.stroke();
  }
  c.restore();
}

/**
 * DEADBLAST's combined shot: GAUNTLET CANNON effect #3 (slide-6's repulsor
 * beam) + effect #5 (slide-9's repulsor round). Effect #5 supplies the flying
 * round, its trail, impact and entry mark; effect #3 fires its muzzle burst
 * and stretches its beam from the gun to the round for its own 0.28 s.
 */
export function drawIronmanCombo(
  c: CanvasRenderingContext2D, x: number, y: number, time: number, drawRound: () => void,
  beam?: ComboBeam,
) {
  if (beam) {
    const age = Math.max(0, time - beam.born);
    drawRepulsorMuzzle(c, beam.x, beam.y, age);
    drawRepulsorBeam(c, beam.x, beam.y, x, y, age);
  }
  drawRound();
}

/** Effect 3 keeps its CrystalShot collision and growth, but flies as effect 2. */
export function drawCrystalEffectTwo(c: CanvasRenderingContext2D, x: number, y: number, time: number) {
  c.save();
  c.translate(x, y - 4);
  drawProjectile(c, 'crystal', 44, time, 0, false, 'new');
  c.restore();
}
