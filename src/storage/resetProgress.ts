/**
 * "RESET PROGRES" — menghapus kemajuan pemain tanpa menyentuh pengaturan.
 *
 * Daftar kuncinya eksplisit (bukan "hapus semua gunhit_*") supaya pilihan
 * bahasa, volume, kecepatan, tema, dan status CARA MAIN tetap ada: pemain yang
 * me-reset progres tidak ingin kehilangan pengaturannya.
 */
import type { KeyValueStore } from '../games/gunhit/game/safeStorage';

/** Semua yang dihitung sebagai *kemajuan* (dihapus saat reset). */
export const PROGRESS_KEYS = [
  'gunhit_best',
  'gunhit_best_level',
  'gunhit_coins',
  'gunhit_diamonds',
  'gunhit_weapon',
  'gunhit_owned_weapons',
  'gunhit_rare_owned',
  'gunhit_quests_state',
  'gunhit_player_xp',
  'gunhit_player_level',
  'gunhit_all_stages_open',
  'gunhit_runs_v1',
  'gunhit_save_meta',
] as const;

/** Pengaturan yang sengaja DIPERTAHANKAN saat reset progres. */
export const SETTINGS_KEYS_KEPT = [
  'gunhit_volume',
  'gunhit_game_speed',
  'gunhit_menu_theme',
  'sga.language.v1',
  'sga.onboarding.v1',
] as const;

export type ResetResult = { cleared: string[]; kept: string[] };

/**
 * Hapus progres. Mengembalikan daftar kunci yang benar-benar dihapus (berguna
 * untuk konfirmasi dan tes) dan kunci pengaturan yang masih ada.
 */
export function resetProgress(store: KeyValueStore): ResetResult {
  const cleared: string[] = [];
  for (const key of PROGRESS_KEYS) {
    try {
      if (store.getItem(key) !== null) cleared.push(key);
      store.removeItem(key);
    } catch {
      // A refused store must not throw out of a settings button.
    }
  }
  return { cleared, kept: [...SETTINGS_KEYS_KEPT] };
}
