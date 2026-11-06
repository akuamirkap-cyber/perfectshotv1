/**
 * Bahasa aplikasi (Indonesia / Inggris).
 *
 * Disimpan di perangkat dan dibagikan lewat subscription, jadi satu pilihan di
 * Pengaturan langsung berlaku untuk semua layar yang memakai `useLanguage()`.
 * Katalog teksnya ada di `src/i18n/catalog.ts`.
 */
import { telemetryStorage } from '../telemetry/analytics';
import type { KeyValueStore } from '../games/gunhit/game/safeStorage';

export type Language = 'id' | 'en';

export const LANGUAGE_STORAGE_KEY = 'sga.language.v1';
export const LANGUAGES: readonly { id: Language; label: string; short: string }[] = [
  { id: 'id', label: 'Bahasa Indonesia', short: 'ID' },
  { id: 'en', label: 'English', short: 'EN' },
];

const listeners = new Set<(language: Language) => void>();
let current: Language | null = null;

/** Browser/HP berbahasa Inggris → English; selain itu Indonesia. */
export function detectLanguage(navigatorLanguage = typeof navigator === 'undefined' ? '' : navigator.language): Language {
  return /^en\b/i.test(navigatorLanguage) ? 'en' : 'id';
}

function normalize(value: string | null | undefined): Language | null {
  return value === 'id' || value === 'en' ? value : null;
}

export function getLanguage(store: KeyValueStore = telemetryStorage): Language {
  if (current) return current;
  current = normalize(store.getItem(LANGUAGE_STORAGE_KEY)) ?? detectLanguage();
  return current;
}

function applyToDocument(language: Language) {
  if (typeof document === 'undefined') return;
  try {
    document.documentElement.lang = language;
  } catch {
    // A refused document is not a reason to break the menu.
  }
}

export function setLanguage(next: Language, store: KeyValueStore = telemetryStorage): void {
  if (next !== 'id' && next !== 'en') return;
  current = next;
  try {
    store.setItem(LANGUAGE_STORAGE_KEY, next);
  } catch {
    // keep the in-memory choice even if the store refuses it
  }
  applyToDocument(next);
  for (const listener of listeners) listener(next);
}

export function subscribeLanguage(listener: (language: Language) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Test seam: forget the cached choice and every listener. */
export function resetLanguageForTests(): void {
  current = null;
  listeners.clear();
}

applyToDocument(getLanguage());
