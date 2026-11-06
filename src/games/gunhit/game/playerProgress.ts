export const PLAYER_XP_PER_LEVEL = 100;

export interface PlayerProgress {
  level: number;
  xp: number;
}

/** Derive the persistent player level and progress from lifetime XP. */
export function getPlayerProgress(totalXp: number): PlayerProgress {
  const safeXp = Math.max(0, Math.floor(totalXp));
  return {
    level: Math.floor(safeXp / PLAYER_XP_PER_LEVEL) + 1,
    xp: safeXp % PLAYER_XP_PER_LEVEL,
  };
}

/** Boss victories award XP that feeds the persistent player-level track. */
export function bossXpReward(stage: number): number {
  return 35 + Math.floor(Math.max(0, stage) / 5) * 10;
}
