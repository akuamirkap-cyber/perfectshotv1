import { storage } from './safeStorage';

export const SGA_SPEED_OPTIONS = [1, 1.2, 1.3, 1.4] as const;
export type SgaGameSpeed = (typeof SGA_SPEED_OPTIONS)[number];

export const DEFAULT_SGA_SPEED: SgaGameSpeed = 1.2;
export const SGA_SPEED_STORAGE_KEY = 'gunhit_game_speed';

type SpeedListener = (speed: SgaGameSpeed) => void;
const listeners = new Set<SpeedListener>();

export function normalizeSgaSpeed(
  value: unknown,
  fallback: SgaGameSpeed = DEFAULT_SGA_SPEED,
): SgaGameSpeed {
  const num = Number(value);
  if (Number.isFinite(num)) {
    for (const opt of SGA_SPEED_OPTIONS) {
      if (Math.abs(num - opt) < 1e-6) return opt;
    }
  }
  return fallback;
}

export function formatSgaSpeed(speed: SgaGameSpeed): string {
  return `${speed}x`;
}

export function getSavedSgaSpeed(): SgaGameSpeed {
  const raw = storage.getItem(SGA_SPEED_STORAGE_KEY);
  if (raw === null || raw === '') return DEFAULT_SGA_SPEED;
  return normalizeSgaSpeed(raw, DEFAULT_SGA_SPEED);
}

export function setSavedSgaSpeed(next: number): SgaGameSpeed {
  const normalized = normalizeSgaSpeed(next, DEFAULT_SGA_SPEED);
  storage.setItem(SGA_SPEED_STORAGE_KEY, String(normalized));
  for (const listener of listeners) {
    listener(normalized);
  }
  return normalized;
}

export function subscribeSgaSpeed(listener: SpeedListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
