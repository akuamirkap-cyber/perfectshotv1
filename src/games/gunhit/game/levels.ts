/**
 * Level tables for Game A: which stage is a boss, how many shots it takes, its
 * pattern and its wheel style. Pure data plus Perfect Shot's boss identity — no
 * engine — so the menu can build a stage config (and the "GO!!" banner) without
 * loading the whole game.
 */
import { BOARD_PACKAGE_SCALE } from './layout';
import { bossDef } from './bossCatalog';
import { bossNameFor, bossStyleFor } from './bossIdentity';
import type { Style } from './faces';

/**
 * The Diamond Breaker rock: ~80% of the screen, as on Diamond Breaker's 480px
 * screen, then 10% smaller like every other board-side package.
 */
export const ROCK_RADIUS = Math.round(166 * BOARD_PACKAGE_SCALE); // 149

export type SpecialMode = 'bonus' | 'treasure';
export type LevelMode = 'classic' | 'boulder' | 'double' | SpecialMode;
export type PatternName = 'constant' | 'wave' | 'pendulum' | 'stopgo' | 'jerk' | 'chaos';

/** A special stage is the boulder round or one of the two bonus rounds. */
export const isSpecial = (mode: LevelMode): mode is 'boulder' | SpecialMode =>
  mode === 'boulder' || mode === 'bonus' || mode === 'treasure';

/** Star power-ups are reserved for bosses and special/bonus stages. */
export function allowsStarPowerups(level: Pick<LevelCfg, 'boss' | 'mode'>) {
  return level.boss || isSpecial(level.mode);
}

export interface LevelCfg {
  mode: LevelMode; hp: number; maxHp: number;
  n: number; boss: boolean; ammo: number; base: number; pattern: PatternName; dir: number;
  radius: number; style: Style; name: string; old: number; spikes: number; coins: number;
}

export const bossKnifeCount = (n: number) => Math.min(5, 3 + Math.floor(n / 30));
const WORLD_STYLES: Style[] = ['orange', 'wood', 'target'];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function makeLevel(n: number, forcedMode?: LevelMode): LevelCfg {
  const boss = n % 5 === 0;
  const world = Math.floor((n - 1) / 5);
  const base = Math.min(1.5 + n * 0.11, 4.3);
  let pattern: PatternName;
  if (n <= 2) pattern = 'constant';
  else if (boss) pattern = n === 5 ? 'wave' : n >= 15 ? pick<PatternName>(['chaos', 'jerk']) : pick<PatternName>(['jerk', 'stopgo', 'chaos']);
  else {
    const pool: PatternName[] = ['constant', 'wave', 'pendulum'];
    if (n >= 6) pool.push('stopgo');
    if (n >= 11) pool.push('jerk');
    if (n >= 16) pool.push('chaos');
    pattern = pick(pool);
  }
  const regularAmmo = Math.min(5 + Math.floor(n * 0.5), 13);
  // Double the boss shot quota so the fight can sustain exactly twice the HP without an early ammo clear.
  const ammo = boss ? (regularAmmo + 2) * 2 : regularAmmo;
  // The boss on screen *is* Perfect Shot's head. Game A has no boss roster of
  // its own any more: stage 5 is the pirate, 10 the jester, … 55 the sun, and
  // the name, the colours and the attack all come from that same head.
  const style: Style = boss
    ? bossStyleFor(n) ?? bossDef('pirate').family
    : WORLD_STYLES[world % WORLD_STYLES.length];
  const bossName = boss ? bossNameFor(n) : '';
  const old = n < 2 ? 0 : Math.min(1 + Math.floor((n - 2) / 3), 5);
  const spikes = boss
    ? Math.min(5, 2 + Math.floor(n / 5)) // 2 sampai 5 duri jebakan mematikan di kepala boss!
    : n < 4
    ? 0
    : Math.min(1 + Math.floor((n - 4) / 4), 4);
  const coins = (Math.random() < 0.65 ? 1 : 0) + (Math.random() < 0.3 ? 1 : 0);
  // Each five-stage boss cycle is three ordinary stages, one random special,
  // then a boss: stages 4, 9, 14... use one of the two bonus rounds.
  //
  // Diamond Breaker (`boulder`) is deliberately *not* in that draw: it is skipped
  // in the normal progression and only reachable by picking it in Settings, which
  // hands `makeLevel` a forced mode. Everything that advances on its own —
  // `continueAfterBoss()` and the stage-clear auto-advance — comes through here
  // without a forced mode, so this one list keeps the boulder out of the run.
  const mode: LevelMode = forcedMode ?? (boss ? 'classic'
    : n % 5 === 4 ? pick<LevelMode>(['bonus', 'treasure'])
    : 'classic');
  return {
    // Diamond Breaker is the tight, fast challenge: a half-size magazine
    // forces saved shots while its rock spins up (BOULDER_SPIN_MULT in Game).
    n, boss, ammo: mode === 'boulder' ? 6 : isSpecial(mode) ? 12 : ammo, base, pattern, dir: Math.random() < 0.5 ? 1 : -1,
    // The board itself is the "wheel package": its rim, its gems and every round
    // buried in it are radius-derived, so one scaled radius shrinks them all
    // — 10% smaller, while the weapon above keeps its own 20%.
    radius: boss ? Math.round(122 * BOARD_PACKAGE_SCALE) // 110
      : mode === 'boulder' || mode === 'bonus' ? ROCK_RADIUS // 149
      : Math.round(106 * BOARD_PACKAGE_SCALE), // 95
    style,
    name: boss
      ? bossName
      // the HUD prints the level name as-is for non-boss stages
      : '',
    // Perfect Shot's boss stage has no spikes at all: its rintangan are the 3–5
    // knives already buried in the head, so Game A uses exactly those.
    old: isSpecial(mode) ? 0 : boss ? bossKnifeCount(n) : old,
    spikes: isSpecial(mode) ? 0 : boss ? 0 : spikes,
    coins: isSpecial(mode) ? 0 : coins,
    mode, hp: 0, maxHp: 0, // populated from the actual number of breakable chunks
  };
}
