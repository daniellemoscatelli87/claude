import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'pt' | 'en';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'dm-lang';

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'pt';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'pt' || stored === 'en') return stored;
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pt';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-IE';
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      toggle: () => setLangState((l) => (l === 'pt' ? 'en' : 'pt')),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

/** Pick the localized value from a { pt, en } record for the current language. */
export function useT<T>(record: { pt: T; en: T }): T {
  const { lang } = useLanguage();
  return record[lang];
}
