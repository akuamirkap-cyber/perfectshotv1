/**
 * Katalog teks dua bahasa.
 *
 * Bagian 7 mengisi teks untuk layar baru (CARA MAIN, reset progres, pemilih
 * bahasa). Bagian 8 (i18n) melanjutkan pengisian untuk menu, HUD, quest, dan
 * layar bos memakai modul yang sama — kuncinya ditambah di sini, bukan
 * disebar ke tiap komponen.
 *
 * Aturan: setiap kunci WAJIB ada di kedua bahasa; tes menolaknya kalau tidak.
 */
import type { Language } from './language';

export const catalog = {
  id: {
    'common.close': 'TUTUP',
    'common.cancel': 'BATAL',

    'settings.language': 'BAHASA',
    'settings.help': '❓ CARA MAIN',
    'settings.reset': '🗑 RESET PROGRES',

    'help.title': 'CARA MAIN',
    'help.firstRun': 'Sekali ini saja — bisa dibuka lagi di Pengaturan',
    'help.subtitle': 'GUNHIT · SGA',
    'help.start': 'MENGERTI, MULAI!',
    'help.steps': [
      'Sentuh layar untuk menembak lurus ke atas, ke arah roda yang berputar. Senjata scope/charge ditahan dulu, lalu dilepas untuk melepas tembakan.',
      'Pecahkan roda sampai habis sebelum peluru habis. Sisa peluru tertera di kiri bawah layar (x…).',
      'Koin dan diamond jatuh dari roda yang pecah — semuanya otomatis masuk ke saldo.',
      'Setiap stage ke-5 adalah BOSS: kepala bos besar dengan 3–5 pisau tertancap. Hancurkan sebelum peluru habis.',
      'Stage spesial (BATU, BONUS, HARTA) muncul di siklus tiap 5 stage: pecahkan batu, atau berburu koin dan peti.',
      'Bintang = power-up. Pilih salah satu: tembak 2x cepat, ammo 2x, daya 2x, atau dua senjata.',
      'Koin dan diamond dipakai di ARSENAL untuk membuka senjata baru — tiap senjata punya perilaku berbeda.',
    ],
    'help.tip': 'Tips: tombol Back di HP membuka jeda saat sedang bermain.',

    'reset.title': 'HAPUS SEMUA PROGRES?',
    'reset.body':
      'Skor terbaik, stage tertinggi, koin, diamond, senjata yang dimiliki, level pemain, dan progres misi akan dihapus. Pengaturan (volume, bahasa, tema) tetap disimpan.',
    'reset.confirm': 'YA, HAPUS',
    'reset.done': 'Progres dihapus. Aplikasi dimulai ulang…',
  },
  en: {
    'common.close': 'CLOSE',
    'common.cancel': 'CANCEL',

    'settings.language': 'LANGUAGE',
    'settings.help': '❓ HOW TO PLAY',
    'settings.reset': '🗑 RESET PROGRESS',

    'help.title': 'HOW TO PLAY',
    'help.firstRun': 'Shown once — reopen it from Settings',
    'help.subtitle': 'GUNHIT · SGA',
    'help.start': 'GOT IT, LET’S GO!',
    'help.steps': [
      'Tap the screen to shoot straight up into the spinning wheel. Scope/charge weapons need a short hold, then a release.',
      'Break the whole wheel before your ammo runs out — the remaining shots are counted at the bottom left (x…).',
      'Coins and diamonds drop from a broken wheel and are banked automatically.',
      'Every 5th stage is a BOSS: a big cartoon head with 3–5 knives stuck in it. Destroy it before you run out of ammo.',
      'Special stages (BOULDER, BONUS, TREASURE) appear once per 5-stage cycle: smash the rock, or hunt coins and chests.',
      'A star is a power-up: pick 2x fire rate, double ammo, double power, or dual weapons.',
      'Spend coins and diamonds in the ARMORY to unlock new weapons — each one behaves differently.',
    ],
    'help.tip': 'Tip: the phone’s Back button pauses a run.',

    'reset.title': 'DELETE ALL PROGRESS?',
    'reset.body':
      'Best score, highest stage, coins, diamonds, owned weapons, player level and quest progress will be deleted. Settings (volume, language, theme) stay.',
    'reset.confirm': 'YES, DELETE',
    'reset.done': 'Progress deleted. Restarting the app…',
  },
} as const satisfies Record<Language, Record<string, unknown>>;

export type StringKey = keyof (typeof catalog)['id'];

/** Terjemahan untuk satu kunci; jatuh ke bahasa Indonesia kalau kosong. */
export function t(language: Language, key: StringKey): string {
  const value = catalog[language][key] ?? catalog.id[key];
  return Array.isArray(value) ? value.join('\n') : String(value);
}

/** Versi daftar (untuk layar yang butuh array, seperti langkah CARA MAIN). */
export function tList(language: Language, key: StringKey): string[] {
  const value = catalog[language][key] ?? catalog.id[key];
  return Array.isArray(value) ? [...value] : [String(value)];
}
