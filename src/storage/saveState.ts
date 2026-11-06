/**
 * Simpanan progres Game A: versi skema, migrasi, dan checksum.
 *
 * Progres disimpan sebagai kunci-kunci terpisah (`gunhit_best`, `gunhit_coins`,
 * …) karena begitulah cara seluruh layar membacanya. Yang ditambahkan di sini
 * adalah lapisan penjaga di atasnya:
 *
 * - **versi** — `gunhit_save_meta` menyimpan versi skema yang menulis data ini,
 *   jadi build baru tahu apakah perlu migrasi.
 * - **migrasi** — `MIGRATIONS` berisi langkah per versi. v0 = simpanan lama
 *   tanpa meta; v1 = nilai dirapikan (angka bulat, id senjata dikenal);
 *   v2 = ditambah sidik jari (checksum) seluruh kunci progres.
 * - **checksum** — sidik jari isi progres. Kalau berbeda dari yang tercatat,
 *   berarti ada yang mengubah kunci di luar aplikasi (atau tulisan terpotong),
 *   dan nilai dirapikan lagi sebelum dipakai.
 *
 * Semua fungsi di sini tidak pernah melempar: simpanan rusak hanya berarti
 * "pakai default", bukan layar putih.
 */
import { checksum, encodeBlob, readBlob } from './saveBlob';
import { trackSaveState } from '../telemetry/gameAnalytics';
import { WEAPONS } from '../games/gunhit/game/weapons';
import { QUESTS, MILESTONES } from '../games/gunhit/game/quests';
import type { KeyValueStore } from '../games/gunhit/game/safeStorage';
import { storage } from '../games/gunhit/game/safeStorage';

/** Versi skema yang ditulis aplikasi ini. */
export const SAVE_VERSION = 2;

/** Kunci meta (bukan progres, jadi tidak ikut di-reset). */
export const SAVE_META_KEY = 'gunhit_save_meta';

/** Semua kunci yang dihitung sebagai progres dan ikut dijaga checksum-nya. */
export const SAVE_PROGRESS_KEYS = [
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
] as const;

export type SaveProgressKey = (typeof SAVE_PROGRESS_KEYS)[number];

const MAX_COUNTER = 1_000_000_000;
const WEAPON_IDS = new Set<string>(WEAPONS.map((weapon) => weapon.id));
const RARE_IDS = new Set<string>(WEAPONS.filter((weapon) => weapon.rarity === 'LANGKA').map((weapon) => weapon.id));
const QUEST_IDS = new Set(QUESTS.map((quest) => quest.id));
const MILESTONE_COUNTS = new Set(MILESTONES.map((milestone) => milestone.count));

/** Angka bulat 0..MAX_COUNTER; `null` bila nilainya tidak bisa dipercaya. */
function safeCount(value: unknown): number | null {
  const number = typeof value === 'string' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) return null;
  const rounded = Math.round(number);
  if (rounded < 0) return 0;
  return Math.min(MAX_COUNTER, rounded);
}

function idList(value: unknown, allowed: Set<string>): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids = value.filter((id): id is string => typeof id === 'string' && allowed.has(id));
  return [...new Set(ids)];
}

/** `QuestState` yang sah, atau `null` bila bentuknya bukan objek. */
export function readQuestState(value: unknown): Record<string, number | string[] | number[]> | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const claimed = idList(raw.claimed, QUEST_IDS);
  if (!claimed) return null;
  const milestones = Array.isArray(raw.milestonesClaimed)
    ? [...new Set(raw.milestonesClaimed.filter((count): count is number => typeof count === 'number' && MILESTONE_COUNTS.has(count)))]
    : [];
  const state: Record<string, number | string[] | number[]> = { claimed, milestonesClaimed: milestones };
  for (const key of [
    'maxCombo',
    'totalCoinsCollected',
    'highestScore',
    'highestLevel',
    'stagesWon',
    'bossesDefeated',
    'boxesOpened',
    'weaponEquips',
    'shotsFired',
    'highestPlayerLevel',
  ]) {
    state[key] = safeCount(raw[key]) ?? 0;
  }
  return state;
}

/**
 * Rapikan satu kunci progres. Mengembalikan nilai kanonik (string yang akan
 * ditulis ulang) atau `null` untuk membuang kunci yang tidak bisa diselamatkan.
 */
function normalizeValue(key: SaveProgressKey, raw: string): string | null {
  switch (key) {
    case 'gunhit_best':
    case 'gunhit_coins':
    case 'gunhit_diamonds':
    case 'gunhit_player_xp':
    case 'gunhit_player_level':
      // Angka yang tidak bisa dipercaya jadi 0, bukan dibuang: kuncinya tetap
      // ada supaya checksum stabil dan aplikasi tidak menulis ulang tiap boot.
      return String(safeCount(raw) ?? 0);
    case 'gunhit_best_level':
      return String(Math.max(1, safeCount(raw) ?? 1));
    case 'gunhit_all_stages_open':
      return raw === '0' ? '0' : '1';
    case 'gunhit_weapon':
      return WEAPON_IDS.has(raw) ? raw : 'pistol';
    case 'gunhit_owned_weapons':
    case 'gunhit_rare_owned': {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return null;
      }
      const allowed = key === 'gunhit_rare_owned' ? RARE_IDS : WEAPON_IDS;
      const ids = idList(parsed, allowed);
      if (!ids) return null;
      const onlyOwnRarity = key === 'gunhit_rare_owned' ? ids : ids.filter((id) => !RARE_IDS.has(id));
      return JSON.stringify(onlyOwnRarity);
    }
    case 'gunhit_quests_state': {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return null;
      }
      const state = readQuestState(parsed);
      return state ? JSON.stringify(state) : null;
    }
    default:
      return raw;
  }
}

export interface SaveMeta {
  version: number;
  /** Sidik jari seluruh kunci progres saat meta ditulis. */
  digest: string;
  /** ISO date penulisan terakhir. */
  updatedAt: string;
}

/** Sidik jari isi progres: `kunci=nilai` urut, di-hash. */
export function progressDigest(store: KeyValueStore): string {
  const parts: string[] = [];
  for (const key of SAVE_PROGRESS_KEYS) {
    const value = store.getItem(key);
    if (value !== null) parts.push(`${key}=${value}`);
  }
  return checksum(parts.join('\n'));
}

function validateMeta(value: unknown): SaveMeta | null {
  if (typeof value !== 'object' || value === null) return null;
  const meta = value as Partial<SaveMeta>;
  if (typeof meta.version !== 'number' || !Number.isFinite(meta.version)) return null;
  if (typeof meta.digest !== 'string') return null;
  return {
    version: meta.version,
    digest: meta.digest,
    updatedAt: typeof meta.updatedAt === 'string' ? meta.updatedAt : new Date(0).toISOString(),
  };
}

export type SaveStatus = 'fresh' | 'current' | 'migrated' | 'repaired' | 'reset-for-downgrade';

export interface SaveReport {
  status: SaveStatus;
  /** Versi simpanan sebelum dijalankan (0 = belum ada meta). */
  fromVersion: number;
  toVersion: number;
  /** Kunci yang nilainya dirapikan/dibuang. */
  repaired: SaveProgressKey[];
  /** Langkah migrasi yang dijalankan, mis. `[1, 2]`. */
  migrations: number[];
  /** Sidik jari sesudah perbaikan. */
  digest: string;
}

/** Tulis ulang kunci progres bila nilainya berubah jadi bentuk kanonik. */
function normalizeAll(store: KeyValueStore): SaveProgressKey[] {
  const repaired: SaveProgressKey[] = [];
  for (const key of SAVE_PROGRESS_KEYS) {
    const raw = store.getItem(key);
    if (raw === null) continue;
    const normalized = normalizeValue(key, raw);
    if (normalized === null) {
      store.removeItem(key);
      repaired.push(key);
      continue;
    }
    if (normalized !== raw) {
      store.setItem(key, normalized);
      repaired.push(key);
    }
  }
  return repaired;
}

/** Langkah migrasi. Kuncinya versi asal → versi tujuan. */
export const MIGRATIONS: Record<number, (store: KeyValueStore) => SaveProgressKey[]> = {
  // v0 → v1: simpanan sebelum ada versi. Tidak ada perubahan bentuk, hanya
  // pembersihan nilai yang tidak masuk akal (skor `NaN`, senjata tak dikenal).
  0: (store) => normalizeAll(store),
  // v1 → v2: skema sama, sekarang dijaga checksum di `gunhit_save_meta`.
  1: () => [],
};

export function writeSaveMeta(store: KeyValueStore, version = SAVE_VERSION): SaveMeta {
  const meta: SaveMeta = {
    version,
    digest: progressDigest(store),
    updatedAt: new Date().toISOString(),
  };
  try {
    store.setItem(SAVE_META_KEY, encodeBlob(meta, version));
  } catch {
    /* a refused write only costs the migration guard */
  }
  return meta;
}

/**
 * Jalankan migrasi + verifikasi checksum. Dipanggil sekali saat aplikasi mulai,
 * sebelum layar pertama membaca progres.
 */
export function migrateSave(store: KeyValueStore = storage): SaveReport {
  const metaRead = readBlob(store.getItem(SAVE_META_KEY), SAVE_VERSION, validateMeta);
  const fromVersion = metaRead.value ? metaRead.value.version : 0;
  const migrations: number[] = [];
  let repaired: SaveProgressKey[] = [];
  let status: SaveStatus;

  if (metaRead.status === 'newer') {
    // Dibuka build lama setelah build baru: jangan sentuh progresnya, cukup
    // rapikan yang jelas rusak dan catat ulang meta di versi kita.
    repaired = normalizeAll(store);
    status = 'reset-for-downgrade';
  } else if (metaRead.status === 'missing' && SAVE_PROGRESS_KEYS.every((key) => store.getItem(key) === null)) {
    status = 'fresh';
  } else {
    for (let version = fromVersion; version < SAVE_VERSION; version++) {
      const step = MIGRATIONS[version];
      if (!step) continue;
      repaired.push(...step(store));
      migrations.push(version + 1);
    }
    if (fromVersion === 0 && migrations.length === 0) repaired = normalizeAll(store);
    status = fromVersion === 0 ? 'migrated' : 'current';
    // Checksum hanya bisa dibandingkan kalau meta ada. Bila berbeda, ada
    // penulisan di luar lapisan ini (atau data terpotong): rapikan dulu, dan
    // baru sebut "diperbaiki" kalau memang ada yang berubah.
    const expected = metaRead.value?.digest;
    if (expected && expected !== progressDigest(store)) {
      const changes = normalizeAll(store);
      repaired.push(...changes);
      if (changes.length > 0) status = 'repaired';
    }
  }

  const meta = writeSaveMeta(store, SAVE_VERSION);
  return {
    status,
    fromVersion,
    toVersion: SAVE_VERSION,
    repaired: [...new Set(repaired)],
    migrations,
    digest: meta.digest,
  };
}

let booted: SaveReport | null = null;

/**
 * Migrasi + verifikasi sekali per proses, sebelum layar pertama membaca progres.
 *
 * `gunhit/App.tsx` memanggilnya di lingkup modul: modul itu dievaluasi sebelum
 * komponen apa pun merender, jadi `useState(() => num(LS.best))` sudah melihat
 * data yang sudah dirapikan.
 */
export function bootSave(store: KeyValueStore = storage): SaveReport {
  if (booted) return booted;
  booted = migrateSave(store);
  trackSaveState(booted);
  return booted;
}

/** Test seam: lupakan bahwa boot sudah pernah jalan. */
export function resetSaveBootForTests(): void {
  booted = null;
}

/**
 * Catat ulang sidik jari setelah aplikasi menulis progres.
 *
 * Tanpa ini, setiap perubahan sah akan terlihat seperti "checksum meleset", dan
 * pada boot berikutnya seluruh progres dianggap rusak.
 */
export function flushSaveMeta(store: KeyValueStore = storage): void {
  writeSaveMeta(store, SAVE_VERSION);
}
