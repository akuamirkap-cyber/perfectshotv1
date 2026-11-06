import { storage } from './safeStorage';

/**
 * "COMBO TITIK" — the same-spot scoring mode.
 *
 * With the mode on, a round that lands almost exactly on the previous round's
 * mark scores a rising combo: the first mark is worth 10, the next one on the
 * same spot 20, then 30, 40 and so on. The award is credited both to the score
 * and to the coin wallet ("bonus coin"), and a shot coin is worth a flat 10
 * coins. A mark only counts when it is within 80 % of the tolerance, so the two
 * holes really overlap — a near miss starts the chain over.
 *
 * It is off by default: the classic stage economy (weapon points + the timed
 * combo) stays the vanilla one until the player turns the mode on in SETTING.
 */
export const SPOT_COMBO_STORAGE_KEY = 'gunhit_spot_combo';
export const DEFAULT_SPOT_COMBO = false;
/** How close the new mark has to be to the last one to count as "the same spot". */
export const SPOT_COMBO_RADIUS = 20;
/**
 * ...and it has to be *that* accurate: the round must land inside this share of
 * the tolerance (80 %), i.e. almost on top of the previous hole. A near miss no
 * longer keeps a chain alive.
 */
export const SPOT_COMBO_ACCURACY = 0.8;
/** The real distance a mark has to land within to keep the chain going. */
export const SPOT_COMBO_REACH = SPOT_COMBO_RADIUS * SPOT_COMBO_ACCURACY;
/** Each hit on the spot is worth this many points/coins more than the last. */
export const SPOT_COMBO_STEP = 10;
/** A coin target is worth this many coins while the mode is on. */
export const SPOT_COMBO_COIN_VALUE = 10;

export function getSavedSpotCombo(): boolean {
  const raw = storage.getItem(SPOT_COMBO_STORAGE_KEY);
  return raw === null || raw === '' ? DEFAULT_SPOT_COMBO : raw === '1';
}

type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

export function setSavedSpotCombo(next: boolean): boolean {
  const value = Boolean(next);
  storage.setItem(SPOT_COMBO_STORAGE_KEY, value ? '1' : '0');
  for (const listener of listeners) listener(value);
  return value;
}

export function subscribeSpotCombo(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
