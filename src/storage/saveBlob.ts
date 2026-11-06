/**
 * Versi + checksum untuk semua data simpanan.
 *
 * Pemain bisa mematikan tab di tengah penulisan, browser bisa memotong kuota,
 * dan sebagian orang memang mengedit `localStorage`. Ketiganya berakhir sama:
 * nilai yang terbaca tidak lagi masuk akal (skor `NaN`, 400 senjata, JSON
 * setengah jadi) dan satu `throw` di layar menu mematikan seluruh aplikasi.
 *
 * Jadi setiap simpanan dibungkus satu objek kecil:
 *
 * ```json
 * { "v": 2, "c": "1f3c9ab2", "d": { …isi sebenarnya… } }
 * ```
 *
 * `v` adalah versi skema, `c` checksum isi, `d` datanya. `readBlob()` memeriksa
 * ketiganya dan melaporkan apa yang terjadi, bukan melempar error — pemanggil
 * yang memutuskan apakah perlu memperbaiki, memigrasi, atau memakai default.
 */

/** FNV-1a 32-bit: cukup untuk mendeteksi data rusak, tanpa dependensi. */
export function checksum(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export interface Blob<T> {
  /** Skema versi data di dalam `d`. */
  v: number;
  /** Checksum `JSON.stringify(d)`. */
  c: string;
  d: T;
}

export type BlobStatus = 'ok' | 'missing' | 'unversioned' | 'corrupt' | 'newer';

export type BlobRead<T> =
  | { status: 'ok' | 'unversioned'; value: T; version: number }
  | { status: 'missing'; value: null; version: 0 }
  | { status: 'corrupt' | 'newer'; value: null; version: number; reason: string };

/** Bungkus nilai jadi blob berversi + checksum. */
export function encodeBlob<T>(value: T, version: number): string {
  const digest = checksum(JSON.stringify(value));
  return JSON.stringify({ v: version, c: digest, d: value } satisfies Blob<T>);
}

function looksLikeBlob(parsed: unknown): parsed is Partial<Blob<unknown>> {
  return typeof parsed === 'object' && parsed !== null && 'd' in parsed;
}

/**
 * Baca blob. `currentVersion` adalah versi yang dikenal aplikasi ini.
 *
 * - `ok` — versi cocok dan checksum benar.
 * - `unversioned` — data lama (sebelum ada versi/checksum); `validate()` sudah
 *   dijalankan, pemanggil tinggal menulis ulang dalam bentuk blob.
 * - `missing` — belum pernah disimpan.
 * - `corrupt` — JSON rusak, checksum tidak cocok, atau `validate()` menolak.
 * - `newer` — dibuat aplikasi versi lebih baru (mis. setelah downgrade); isinya
 *   tidak dipakai supaya tidak merusak simpanan yang lebih kaya.
 */
export function readBlob<T>(
  raw: string | null,
  currentVersion: number,
  validate: (value: unknown) => T | null,
): BlobRead<T> {
  if (raw === null) return { status: 'missing', value: null, version: 0 };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'corrupt', value: null, version: 0, reason: 'not json' };
  }

  if (!looksLikeBlob(parsed)) {
    const value = validate(parsed);
    if (value === null) return { status: 'corrupt', value: null, version: 0, reason: 'rejected plain value' };
    return { status: 'unversioned', value, version: 0 };
  }

  const blob = parsed as Blob<unknown>;
  const version = typeof blob.v === 'number' && Number.isFinite(blob.v) ? blob.v : 0;
  if (version > currentVersion) {
    return { status: 'newer', value: null, version, reason: 'written by a newer build' };
  }
  if (typeof blob.c !== 'string' || blob.c !== checksum(JSON.stringify(blob.d))) {
    return { status: 'corrupt', value: null, version, reason: 'checksum mismatch' };
  }
  const value = validate(blob.d);
  if (value === null) return { status: 'corrupt', value: null, version, reason: 'rejected payload' };
  return { status: 'ok', value, version };
}

/** Rantai migrasi: kunci = versi asal, nilai = fungsi menuju versi berikutnya. */
export type Migrations<T> = Record<number, (value: T) => T>;

/**
 * Naikkan nilai dari `fromVersion` ke `toVersion` lewat `migrations`.
 * Versi yang tidak punya langkah migrasi berarti tidak ada perubahan bentuk.
 */
export function migrateValue<T>(value: T, fromVersion: number, toVersion: number, migrations: Migrations<T>): T {
  let current = value;
  for (let version = Math.max(1, fromVersion); version < toVersion; version++) {
    const step = migrations[version];
    if (step) current = step(current);
  }
  return current;
}
