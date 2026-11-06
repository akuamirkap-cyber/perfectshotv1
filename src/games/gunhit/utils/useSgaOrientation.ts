import { useCallback, useEffect, useState } from 'react';
import {
  getSavedSgaOrientation,
  setSavedSgaOrientation,
  subscribeSgaOrientation,
  type SgaOrientation,
} from '../game/orientation';

export function useSgaOrientation(): [SgaOrientation, (next: SgaOrientation) => void] {
  const [orientation, setOrientation] = useState<SgaOrientation>(() => getSavedSgaOrientation());

  useEffect(() => {
    setOrientation(getSavedSgaOrientation());
    return subscribeSgaOrientation((next) => setOrientation(next));
  }, []);

  const updateOrientation = useCallback((next: SgaOrientation) => {
    setSavedSgaOrientation(next);
  }, []);

  return [orientation, updateOrientation];
}
