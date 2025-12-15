'use client';

import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';

export type Language = 'fr' | 'en';

export const useLanguage = () => {
  const { t, i18n } = useTranslation('common');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      i18n.changeLanguage(savedLanguage);
    } else {
      i18n.changeLanguage('fr');
    }
  }, [i18n]);

  const changeLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      localStorage.setItem('language', lang);
    },
    [i18n]
  );

  const toggleLanguage = useCallback(() => {
    const newLang: Language = i18n.language === 'fr' ? 'en' : 'fr';
    changeLanguage(newLang);
  }, [i18n.language, changeLanguage]);

  return {
    t,
    language: i18n.language as Language,
    i18n,
    changeLanguage,
    toggleLanguage,
    isReady: i18n.isInitialized,
  };
};

