import { useCallback, useEffect, useState } from 'react';
import { getSavedSpotCombo, setSavedSpotCombo, subscribeSpotCombo } from '../game/spotCombo';

/** Saved COMBO TITIK mode flag, shared live between SETTING and the engine. */
export function useSgaSpotCombo(): [boolean, (next: boolean) => void] {
  const [on, setOn] = useState<boolean>(() => getSavedSpotCombo());

  useEffect(() => {
    setOn(getSavedSpotCombo());
    return subscribeSpotCombo((next) => setOn(next));
  }, []);

  const update = useCallback((next: boolean) => {
    setSavedSpotCombo(next);
  }, []);

  return [on, update];
}
