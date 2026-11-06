/**
 * Status "sudah pernah lihat CARA MAIN".
 *
 * Layar CARA MAIN muncul sendiri sekali setelah menu siap, lalu bisa dibuka
 * kapan saja dari Pengaturan. Kuncinya terpisah dari progres, jadi reset progres
 * tidak memunculkannya lagi (pemain sudah tahu cara main).
 */
import type { KeyValueStore } from '../games/gunhit/game/safeStorage';

export const HOW_TO_PLAY_SEEN_KEY = 'sga.onboarding.v1';

export function shouldShowHowToPlay(store: KeyValueStore): boolean {
  try {
    return store.getItem(HOW_TO_PLAY_SEEN_KEY) !== '1';
  } catch {
    // Storage refused: better to stay quiet than to nag on every launch.
    return false;
  }
}

export function markHowToPlaySeen(store: KeyValueStore): void {
  try {
    store.setItem(HOW_TO_PLAY_SEEN_KEY, '1');
  } catch {
    // ignore
  }
}
