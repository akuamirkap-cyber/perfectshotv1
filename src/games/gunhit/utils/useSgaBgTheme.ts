import { useCallback, useEffect, useState } from 'react';
import {
  getSavedSgaBgTheme,
  setSavedSgaBgTheme,
  subscribeSgaBgTheme,
  type SgaBackgroundTheme,
} from '../game/backgroundThemes';

export function useSgaBgTheme(): [SgaBackgroundTheme, (next: SgaBackgroundTheme) => void] {
  const [theme, setTheme] = useState<SgaBackgroundTheme>(() => getSavedSgaBgTheme());

  useEffect(() => {
    setTheme(getSavedSgaBgTheme());
    return subscribeSgaBgTheme((next) => setTheme(next));
  }, []);

  const updateTheme = useCallback((next: SgaBackgroundTheme) => {
    setSavedSgaBgTheme(next);
  }, []);

  return [theme, updateTheme];
}
