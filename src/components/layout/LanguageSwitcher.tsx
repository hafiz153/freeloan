'use client';

import { useI18n } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  const toggle = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
      title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
    >
      {lang === 'bn' ? (
        <>
          <span className="text-sm">🇧🇩</span>
          <span className="text-gray-600">EN</span>
        </>
      ) : (
        <>
          <span className="text-sm">🇬🇧</span>
          <span className="text-gray-600">বাংলা</span>
        </>
      )}
    </button>
  );
}
