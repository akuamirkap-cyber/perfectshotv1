import { useEffect, useState } from 'react';
import { getLanguage, setLanguage, subscribeLanguage, type Language } from './language';

/** Bahasa aktif + setter-nya, ikut berubah kalau layar lain mengganti bahasa. */
export function useLanguage(): [Language, (next: Language) => void] {
  const [language, setState] = useState<Language>(() => getLanguage());
  useEffect(() => {
    const unsubscribe = subscribeLanguage(setState);
    // A change that landed between render and subscribe would otherwise be lost.
    setState(getLanguage());
    return unsubscribe;
  }, []);
  return [language, setLanguage];
}
