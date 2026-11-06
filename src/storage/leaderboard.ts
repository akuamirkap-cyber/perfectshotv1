/**
 * Papan skor Game A: **lokal dan offline**, disimpan di perangkat pemain.
 *
 * Keputusan produk untuk part 9: tidak ada leaderboard online. Alasannya bukan
 * kemalasan teknis, tapi konsekuensi yang tidak ingin ditanggung game ini:
 *
 * - game ini offline-first (satu file APK, tanpa akun) — papan online butuh
 *   identitas pemain, dan identitas butuh server, moderasi, dan kebijakan data
 *   baru yang harus dilaporkan di Play Console;
 * - papan online tanpa anti-cheat cuma memindahkan "skor palsu" dari HP pemain
 *   ke server pemain;
 * - target audiensnya anak-anak (rating IARC 3+), jadi mengumpulkan nama dan
 *   skor anak ke server adalah risiko yang tidak sepadan.
 *
 * Yang disimpan: sepuluh run terbaik pemain sendiri (`score`, `stage`, `coins`,
 * waktu). Isinya diperlakukan seperti progres lain: dibungkus versi + checksum,
 * jadi data rusak atau hasil editan `localStorage` tidak pernah tampil sebagai
 * rekor.
 */
import { encodeBlob, migrateValue, readBlob } from './saveBlob';
import type { KeyValueStore } from '../games/gunhit/game/safeStorage';
import { storage } from '../games/gunhit/game/safeStorage';

/** Kunci simpanan papan skor. Ikut dihapus saat \"RESET PROGRES\". */
export const RUNS_KEY = 'gunhit_runs_v1';

/** Berapa run yang disimpan. */
export const MAX_RUNS = 10;

/** Versi skema papan skor. */
export const RUNS_VERSION = 1;

export interface RunRecord {
  /** Skor akhir run. */
  score: number;
  /** Stage tertinggi yang dicapai. */
  stage: number;
  /** Koin yang dikumpulkan selama run. */
  coins: number;
  /** Kapan run selesai (ISO date). */
  at: string;
}

const MAX_VALUE = 1_000_000_000;

function toCount(value: unknown): number {
  const number = typeof value === 'string' ? Number(value) : value;
  if (typeof number !== 'number' || !Number.isFinite(number) || number < 0) return 0;
  return Math.min(MAX_VALUE, Math.round(number));
}

function validateRuns(value: unknown): RunRecord[] | null {
  if (Array.isArray(value)) {
    const list = value.map((entry) => validateRun(entry)).filter((run): run is RunRecord => run !== null);
    return sortRuns(dedupe(list)).slice(0, MAX_RUNS);
  }
  // Bentuk lama (sebelum ada versi): array polos, ditangani di atas. Objek
  // berbentuk `{ runs: [...] }` juga diterima supaya migrasi lama mulus.
  if (typeof value === 'object' && value !== null && Array.isArray((value as { runs?: unknown }).runs)) {
    return validateRuns((value as { runs: unknown[] }).runs);
  }
  return null;
}

function validateRun(value: unknown): RunRecord | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Partial<RunRecord>;
  const score = toCount(raw.score);
  const stage = Math.max(1, toCount(raw.stage));
  const coins = toCount(raw.coins);
  const at = typeof raw.at === 'string' && !Number.isNaN(Date.parse(raw.at)) ? raw.at : new Date(0).toISOString();
  if (score === 0 && stage <= 1 && coins === 0) return null;
  return { score, stage, coins, at };
}

function dedupe(runs: RunRecord[]): RunRecord[] {
  const seen = new Set<string>();
  return runs.filter((run) => {
    const key = `${run.score}|${run.stage}|${run.coins}|${run.at}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortRuns(runs: RunRecord[]): RunRecord[] {
  return [...runs].sort((a, b) => b.score - a.score || b.stage - a.stage || Date.parse(b.at) - Date.parse(a.at));
}

/** Migrasi bentuk papan skor antar versi. */
const RUNS_MIGRATIONS = {
  0: (runs: RunRecord[]) => runs,
};

/** Baca papan skor. Data rusak atau dari build lebih baru → daftar kosong. */
export function readRuns(store: KeyValueStore = storage): RunRecord[] {
  const read = readBlob(store.getItem(RUNS_KEY), RUNS_VERSION, validateRuns);
  if (!read.value) return [];
  if (read.status === 'ok') return read.value;
  return sortRuns(dedupe(migrateValue(read.value, read.version, RUNS_VERSION, RUNS_MIGRATIONS))).slice(0, MAX_RUNS);
}

/** Timpa papan skor dengan daftar ini (sudah dirapikan + diberi checksum). */
export function writeRuns(runs: RunRecord[], store: KeyValueStore = storage): RunRecord[] {
  const clean = sortRuns(dedupe(runs.map((run) => validateRun(run)).filter((run): run is RunRecord => run !== null))).slice(0, MAX_RUNS);
  try {
    store.setItem(RUNS_KEY, encodeBlob(clean, RUNS_VERSION));
  } catch {
    /* penyimpanan menolak: papan skor tetap benar di sesi ini */
  }
  return clean;
}

export interface RecordRunInput {
  score: number;
  stage: number;
  coins: number;
  /** Untuk tes yang butuh waktu tetap. */
  at?: string;
}

/**
 * Simpan satu run bila masuk sepuluh besar. Mengembalikan papan skor terbaru
 * dan apakah run ini masuk daftar.
 */
export function recordRun(input: RecordRunInput, store: KeyValueStore = storage): { runs: RunRecord[]; added: boolean } {
  const run = validateRun({ ...input, at: input.at ?? new Date().toISOString() });
  if (!run) return { runs: readRuns(store), added: false };
  const current = readRuns(store);
  const next = sortRuns([...current, run]).slice(0, MAX_RUNS);
  const added = next.some((entry) => entry.at === run.at && entry.score === run.score && entry.stage === run.stage);
  if (!added) return { runs: current, added: false };
  return { runs: writeRuns(next, store), added: true };
}

/** Run terbaik, atau `null` bila papan masih kosong. */
export function bestRun(store: KeyValueStore = storage): RunRecord | null {
  return readRuns(store)[0] ?? null;
}
