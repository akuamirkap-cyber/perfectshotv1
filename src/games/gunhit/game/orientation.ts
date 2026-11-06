import { storage } from './safeStorage';

/**
 * Screen orientation for Game A's gameplay canvas.
 *
 * `portrait` is the game's original layout: the gun sits at the bottom-centre
 * and shoots *up* at the wheel. `landscape` lays the same world on its side so
 * the gun sits on the LEFT, fires toward the RIGHT, and the wheel/target sits
 * on the RIGHT with flying enemies arriving from that side.
 *
 * The engine keeps simulating in its original portrait world (420x760) — the
 * orientation is a presentation transform plus a re-laid-out HUD, not a second
 * physics implementation. That keeps one code path for aiming, collision and
 * every effect.
 */
export const SGA_ORIENTATION_OPTIONS = ['portrait', 'landscape'] as const;
export type SgaOrientation = (typeof SGA_ORIENTATION_OPTIONS)[number];

export const DEFAULT_SGA_ORIENTATION: SgaOrientation = 'portrait';
export const SGA_ORIENTATION_STORAGE_KEY = 'gunhit_orientation';

type OrientationListener = (orientation: SgaOrientation) => void;
const listeners = new Set<OrientationListener>();

export function normalizeSgaOrientation(
  value: unknown,
  fallback: SgaOrientation = DEFAULT_SGA_ORIENTATION,
): SgaOrientation {
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    for (const opt of SGA_ORIENTATION_OPTIONS) {
      if (lower === opt) return opt;
    }
  }
  return fallback;
}

export function isLandscape(orientation: SgaOrientation): boolean {
  return orientation === 'landscape';
}

export function getSavedSgaOrientation(): SgaOrientation {
  const raw = storage.getItem(SGA_ORIENTATION_STORAGE_KEY);
  if (raw === null || raw === '') return DEFAULT_SGA_ORIENTATION;
  return normalizeSgaOrientation(raw, DEFAULT_SGA_ORIENTATION);
}

export function setSavedSgaOrientation(next: unknown): SgaOrientation {
  const normalized = normalizeSgaOrientation(next, DEFAULT_SGA_ORIENTATION);
  storage.setItem(SGA_ORIENTATION_STORAGE_KEY, normalized);
  for (const listener of listeners) {
    listener(normalized);
  }
  return normalized;
}

export function subscribeSgaOrientation(listener: OrientationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
