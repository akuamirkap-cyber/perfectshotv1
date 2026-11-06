import { storage } from './safeStorage';

/**
 * How fast the player's rounds leave the barrel.
 *
 * This is a feel setting, not a difficulty one: the flight of every projectile
 * (all weapon families — pistols, shotguns, beams, slide-2/3/7 payloads) is
 * multiplied by it, while fire rate, cooldowns and enemy speed stay untouched.
 * Range is 1x (the original tuning) to 3x.
 */
export const BULLET_SPEED_MIN = 1;
export const BULLET_SPEED_MAX = 3;
export const BULLET_SPEED_STEP = 0.1;
export const DEFAULT_BULLET_SPEED = 1;
export const BULLET_SPEED_STORAGE_KEY = 'gunhit_bullet_speed';

const round1 = (value: number) => Math.round(value * 10) / 10;

export function normalizeBulletSpeed(value: unknown, fallback = DEFAULT_BULLET_SPEED): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(BULLET_SPEED_MAX, Math.max(BULLET_SPEED_MIN, round1(num)));
}

export function formatBulletSpeed(value: number): string {
  return `${normalizeBulletSpeed(value).toFixed(1)}x`;
}

export function getSavedBulletSpeed(): number {
  const raw = storage.getItem(BULLET_SPEED_STORAGE_KEY);
  if (raw === null || raw === '') return DEFAULT_BULLET_SPEED;
  return normalizeBulletSpeed(raw, DEFAULT_BULLET_SPEED);
}

type Listener = (speed: number) => void;
const listeners = new Set<Listener>();

export function setSavedBulletSpeed(next: number): number {
  const normalized = normalizeBulletSpeed(next, DEFAULT_BULLET_SPEED);
  storage.setItem(BULLET_SPEED_STORAGE_KEY, String(normalized));
  for (const listener of listeners) listener(normalized);
  return normalized;
}

export function subscribeBulletSpeed(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
