'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import bn from './bn';
import en from './en';

export type Language = 'bn' | 'en';

type TranslationValue = string | Record<string, unknown>;
type TranslationDict = Record<string, TranslationValue>;

const translations: Record<Language, TranslationDict> = { bn, en };

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function resolveKey(obj: TranslationDict, key: string): string | undefined {
  const parts = key.split('.');
  let current: TranslationValue | undefined = obj;

  for (const part of parts) {
    if (typeof current === 'object' && current !== null && part in current) {
      current = (current as TranslationDict)[part];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('bn');

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[lang];
      let value = resolveKey(dict, key) || resolveKey(translations.en, key) || key;

      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }

      return value;
    },
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useT() {
  const { t } = useI18n();
  return t;
}
