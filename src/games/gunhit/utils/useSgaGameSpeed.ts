import { useCallback, useEffect, useState } from 'react';
import {
  getSavedSgaSpeed,
  setSavedSgaSpeed,
  subscribeSgaSpeed,
  type SgaGameSpeed,
} from '../game/gameSpeed';

export function useSgaGameSpeed(): [SgaGameSpeed, (next: SgaGameSpeed) => void] {
  const [speed, setSpeed] = useState<SgaGameSpeed>(() => getSavedSgaSpeed());

  useEffect(() => {
    setSpeed(getSavedSgaSpeed());
    return subscribeSgaSpeed((next) => setSpeed(next));
  }, []);

  const updateSpeed = useCallback((next: SgaGameSpeed) => {
    setSavedSgaSpeed(next);
  }, []);

  return [speed, updateSpeed];
}
