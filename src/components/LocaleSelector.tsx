'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocalization } from '@/context/LocalizationContext';
import { LANGUAGES, CURRENCIES } from '@/utils/localizationUtils';
import type { LanguageCode, CurrencyCode } from '@/types/localization';

export default function LocaleSelector() {
  const { language, currency, setLanguage, setCurrency } = useLocalization();
  const [showLanguage, setShowLanguage] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const currRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLanguage(false);
      }
      if (currRef.current && !currRef.current.contains(event.target as Node)) {
        setShowCurrency(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = LANGUAGES.find(l => l.code === language);
  const currentCurrency = CURRENCIES.find(c => c.code === currency);

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code);
    setShowLanguage(false);
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    setShowCurrency(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => {
            setShowLanguage(!showLanguage);
            setShowCurrency(false);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl">{currentLanguage?.flag}</span>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {currentLanguage?.code.toUpperCase()}
          </span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showLanguage && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Select Language</p>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    language === lang.code
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{lang.name}</p>
                    <p className="text-xs text-gray-500">{lang.nativeName}</p>
                  </div>
                  {language === lang.code && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Currency Selector */}
      <div className="relative" ref={currRef}>
        <button
          onClick={() => {
            setShowCurrency(!showCurrency);
            setShowLanguage(false);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-xl">{currentCurrency?.flag}</span>
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {currentCurrency?.code}
          </span>
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCurrency && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-500 uppercase px-3 py-2">Select Currency</p>
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleCurrencyChange(curr.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    currency === curr.code
                      ? 'bg-green-50 text-green-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{curr.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{curr.code} - {curr.symbol}</p>
                    <p className="text-xs text-gray-500">{curr.name}</p>
                  </div>
                  {currency === curr.code && (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
