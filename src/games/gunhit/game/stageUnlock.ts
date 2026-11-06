import { useEffect, useState } from 'react';
import { storage } from './safeStorage';

/**
 * "All stages are open" — a debug convenience the player owns.
 *
 * Game A ships with every stage unlocked so the whole map can be inspected
 * without grinding to it. Pressing **P** on the quest page flips the map back to
 * the real progression (stage 1, then one at a time), and pressing it again
 * opens everything back up. The choice is remembered, so the map keeps the mode
 * the player last chose.
 */
const KEY = 'gunhit_all_stages_open';

const read = (): boolean => {
  try {
    const raw = storage.getItem(KEY);
    // First run: everything is open. Only an explicit "0" turns the map back to
    // the earned progression, which is what pressing P writes.
    return raw === null ? true : raw !== '0';
  } catch {
    return true;
  }
};

let open = read();
const listeners = new Set<(value: boolean) => void>();

export function allStagesOpen(): boolean {
  return open;
}

export function setAllStagesOpen(value: boolean): void {
  if (open === value) return;
  open = value;
  try {
    storage.setItem(KEY, value ? '1' : '0');
  } catch {
    /* a refused write only costs the memory of the toggle */
  }
  for (const fn of [...listeners]) fn(open);
}

/** Flip the map between "everything open" and the real progression. */
export function toggleAllStagesOpen(): boolean {
  setAllStagesOpen(!open);
  return open;
}

export function subscribeAllStages(fn: (value: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Live value for React: re-renders every map screen the moment P is pressed. */
export function useAllStagesOpen(): boolean {
  const [value, setValue] = useState(open);
  useEffect(() => {
    setValue(open);
    return subscribeAllStages(setValue);
  }, []);
  return value;
}

/** `true` when the P shortcut should be listened for (never while typing). */
export function isUnlockShortcut(ev: KeyboardEvent | React.KeyboardEvent): boolean {
  const key = ev.key;
  if (key !== 'p' && key !== 'P') return false;
  const target = ev.target as HTMLElement | null;
  const tag = target?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return false;
  if (target?.isContentEditable) return false;
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return false;
  return true;
}
