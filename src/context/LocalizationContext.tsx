'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { LanguageCode, CurrencyCode } from '@/types/localization';
import {
  getUserLocale,
  setUserLocale,
  getTranslation,
  formatCurrency,
  convertCurrency,
  getLanguage,
  getCurrency,
} from '@/utils/localizationUtils';

interface LocalizationContextType {
  language: LanguageCode;
  currency: CurrencyCode;
  setLanguage: (lang: LanguageCode) => void;
  setCurrency: (curr: CurrencyCode) => void;
  t: (key: string) => string;
  formatPrice: (amount: number, fromCurrency?: CurrencyCode) => string;
  convertPrice: (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => number;
  isRTL: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [currency, setCurrencyState] = useState<CurrencyCode>('KES');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    const locale = getUserLocale();
    setLanguageState(locale.language);
    setCurrencyState(locale.currency);
    
    const lang = getLanguage(locale.language);
    setIsRTL(lang?.rtl || false);
    
    // Update HTML dir attribute for RTL
    if (typeof document !== 'undefined') {
      document.documentElement.dir = lang?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = locale.language;
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    setUserLocale(lang, currency);
    
    const langObj = getLanguage(lang);
    setIsRTL(langObj?.rtl || false);
    
    if (typeof document !== 'undefined') {
      document.documentElement.dir = langObj?.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const setCurrency = (curr: CurrencyCode) => {
    setCurrencyState(curr);
    setUserLocale(language, curr);
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  const formatPrice = (amount: number, fromCurrency: CurrencyCode = 'KES'): string => {
    const converted = convertCurrency(amount, fromCurrency, currency);
    return formatCurrency(converted, currency);
  };

  const convertPrice = (amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    return convertCurrency(amount, fromCurrency, toCurrency);
  };

  return (
    <LocalizationContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        t,
        formatPrice,
        convertPrice,
        isRTL,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
}
