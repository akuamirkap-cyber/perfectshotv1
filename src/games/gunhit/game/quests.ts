export type QuestCategory = 'daily' | 'skill';
export type AchievementProgress = (state: QuestState, ownedCount: number) => number;

export interface Quest {
  id: string;
  category: QuestCategory;
  title: string;
  desc: string;
  icon: string;
  target: number;
  rewardCoins: number;
  rewardWeapon?: string;
  progress: AchievementProgress;
}

export interface QuestState {
  claimed: string[];
  milestonesClaimed: number[];
  maxCombo: number;
  totalCoinsCollected: number;
  highestScore: number;
  highestLevel: number;
  stagesWon: number;
  bossesDefeated: number;
  boxesOpened: number;
  weaponEquips: number;
  shotsFired: number;
  highestPlayerLevel: number;
}

const daily = (id: string, title: string, desc: string, icon: string, target: number, rewardCoins: number, progress: AchievementProgress, rewardWeapon?: string): Quest => ({
  id, category: 'daily', title, desc, icon, target, rewardCoins, progress, ...(rewardWeapon ? { rewardWeapon } : {}),
});
const skill = (id: string, title: string, desc: string, icon: string, target: number, rewardCoins: number, progress: AchievementProgress, rewardWeapon?: string): Quest => ({
  id, category: 'skill', title, desc, icon, target, rewardCoins, progress, ...(rewardWeapon ? { rewardWeapon } : {}),
});

/** Gun Hit's SGB-style DAILY + SKILL achievement board. */
export const QUESTS: Quest[] = [
  // DAILY — six quick goals, matching the SGB achievement categories.
  daily('d-stage', 'Stage Pertama', 'Menangkan 1 stage Gun Hit', '🎯', 1, 100, s => s.stagesWon),
  daily('d-boss', 'Pemburu Boss', 'Kalahkan 1 boss', '👹', 1, 150, s => s.bossesDefeated),
  daily('d-box', 'Buka Hadiah', 'Buka 1 kotak hadiah boss', '🎁', 1, 150, s => s.boxesOpened),
  daily('d-equip', 'Ganti Senjata', 'Pilih senjata yang berbeda', '🔫', 1, 80, s => s.weaponEquips),
  daily('d-shots', 'Jari Kilat', 'Tembakkan 14 peluru', '💥', 14, 120, s => s.shotsFired),
  daily('d-coins', 'Pemburu Koin', 'Kumpulkan 20 koin', '🪙', 20, 100, s => s.totalCoinsCollected),

  // SKILL — long-term progression goals.
  skill('s-stage5', 'Penjelajah', 'Menangkan 5 stage', '🧭', 5, 300, s => s.stagesWon),
  skill('s-stage25', 'Veteran Stage', 'Menangkan 25 stage', '⚔️', 25, 700, s => s.stagesWon),
  skill('s-stage50', 'Master Stage', 'Menangkan 50 stage', '🏅', 50, 1200, s => s.stagesWon),
  skill('s-stage100', 'Legenda 100', 'Menangkan 100 stage', '👑', 100, 2500, s => s.stagesWon),
  skill('s-boss1', 'Pembunuh Pertama', 'Kalahkan 1 boss', '🗡️', 1, 300, s => s.bossesDefeated, 'shotgun'),
  skill('s-boss5', 'Pemburu Boss', 'Kalahkan 5 boss', '👹', 5, 700, s => s.bossesDefeated),
  skill('s-boss10', 'Penakluk Boss', 'Kalahkan 10 boss', '💜', 10, 1200, s => s.bossesDefeated),
  skill('s-boss20', 'MASTER SLAYER', 'Kalahkan 20 boss', '☀️', 20, 3000, s => s.bossesDefeated),
  skill('s-box5', 'Pembuka Kotak', 'Buka 5 kotak hadiah', '📦', 5, 500, s => s.boxesOpened),
  skill('s-box20', 'Raja Kotak', 'Buka 20 kotak hadiah', '🎁', 20, 1500, s => s.boxesOpened),
  skill('s-col3', 'Kolektor Junior', 'Kumpulkan 3 senjata hadiah', '🎒', 3, 250, (_s, owned) => owned),
  skill('s-col10', 'Kolektor Sejati', 'Kumpulkan 10 senjata hadiah', '💼', 10, 600, (_s, owned) => owned),
  skill('s-col25', 'Master Kolektor', 'Kumpulkan 25 senjata hadiah', '🏆', 25, 1500, (_s, owned) => owned),
  skill('s-coin2k', 'Tukang Koin', 'Kumpulkan 2.000 koin', '🪙', 2000, 400, s => s.totalCoinsCollected),
  skill('s-coin10k', 'Sultan Koin', 'Kumpulkan 10.000 koin', '💎', 10000, 1200, s => s.totalCoinsCollected),
  skill('s-shots200', 'Tangan Dewa', 'Tembakkan 200 peluru total', '🌟', 200, 800, s => s.shotsFired),
  skill('s-playerlevel5', 'Naik Level', 'Capai player level 5', '📈', 5, 1000, s => s.highestPlayerLevel, 'mega_buster'),
];

export interface AchievementMilestone {
  count: number;
  rarity: 'UMUM' | 'EPIC' | 'LEGENDARIS';
  label: string;
  desc: string;
}

// LANGKA is deliberately excluded: it must remain a 500-diamond purchase.
export const MILESTONES: AchievementMilestone[] = [
  { count: 5, rarity: 'UMUM', label: '5 Achievement', desc: 'Senjata UMUM random' },
  { count: 10, rarity: 'EPIC', label: '10 Achievement', desc: 'Senjata EPIC random' },
  { count: 20, rarity: 'LEGENDARIS', label: '20 Achievement', desc: 'Senjata LEGENDARIS random' },
];
