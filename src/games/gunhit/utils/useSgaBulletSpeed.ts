import { useCallback, useEffect, useState } from 'react';
import {
  getSavedBulletSpeed,
  setSavedBulletSpeed,
  subscribeBulletSpeed,
} from '../game/bulletSpeed';

/** Saved bullet-speed multiplier (1x–3x) for every weapon, shared live. */
export function useSgaBulletSpeed(): [number, (next: number) => void] {
  const [speed, setSpeed] = useState<number>(() => getSavedBulletSpeed());

  useEffect(() => {
    setSpeed(getSavedBulletSpeed());
    return subscribeBulletSpeed((next) => setSpeed(next));
  }, []);

  const update = useCallback((next: number) => {
    setSavedBulletSpeed(next);
  }, []);

  return [speed, update];
}
