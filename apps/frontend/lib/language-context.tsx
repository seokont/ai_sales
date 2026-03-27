'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, getT } from './i18n';

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: ReturnType<typeof getT>;
};

const LangContext = createContext<LangContextType | null>(null);

const STORAGE_KEY = 'ai-seller-lang';

export function LangProvider({ children, initialLang }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang || 'en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored && (stored === 'en' || stored === 'uk' || stored === 'ru' || stored === 'he')) {
      setLangState(stored);
    } else if (initialLang) {
      setLangState(initialLang);
    }
  }, [initialLang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, l);
  };

  if (!mounted) return <>{children}</>;

  return (
    <LangContext.Provider value={{ lang, setLang, t: getT(lang) }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) return { lang: 'en' as Lang, setLang: () => {}, t: getT('en') };
  return ctx;
}
