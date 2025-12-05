'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getTranslations,
  upsertTranslation,
  deleteTranslation,
  getLocalizationSettings,
  updateLocalizationSettings,
  getTranslationStats,
  LANGUAGES,
  CURRENCIES,
  updateExchangeRates,
} from '@/utils/localizationUtils';
import type { Translation, LocalizationSettings, LanguageCode, CurrencyCode } from '@/types/localization';

export default function AdminLocalizationPage() {
  const [activeTab, setActiveTab] = useState<'translations' | 'currencies' | 'settings'>('translations');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [settings, setSettings] = useState<LocalizationSettings | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newTranslation, setNewTranslation] = useState({
    key: '',
    category: 'common' as any,
    translations: {} as any,
  });
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const trans = getTranslations();
    setTranslations(trans);
    const sett = getLocalizationSettings();
    setSettings(sett);
    const st = getTranslationStats();
    setStats(st);
    
    // Initialize exchange rates
    const rates: any = {};
    CURRENCIES.forEach(c => {
      rates[c.code] = c.exchangeRate.toString();
    });
    setExchangeRates(rates);
  };

  const handleSaveTranslation = () => {
    if (!newTranslation.key) return;
    
    upsertTranslation({
      ...newTranslation,
      updatedBy: 'admin',
    });
    
    setNewTranslation({ key: '', category: 'common', translations: {} });
    loadData();
    showSuccessMessage();
  };

  const handleDeleteTranslation = (key: string) => {
    if (confirm(`Delete translation "${key}"?`)) {
      deleteTranslation(key);
      loadData();
      showSuccessMessage();
    }
  };

  const handleUpdateSettings = () => {
    if (!settings) return;
    updateLocalizationSettings(settings);
    showSuccessMessage();
  };

  const handleUpdateExchangeRates = () => {
    const rates: any = {};
    Object.entries(exchangeRates).forEach(([code, rate]) => {
      rates[code] = parseFloat(rate) || 1;
    });
    updateExchangeRates(rates);
    loadData();
    showSuccessMessage();
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!settings || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Localization Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage languages, translations, and currencies</p>
            </div>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Admin
            </Link>
          </div>

          <div className="flex gap-4 mt-4 border-b border-gray-200">
            {[
              { value: 'translations', label: 'Translations', icon: '🌐' },
              { value: 'currencies', label: 'Currencies', icon: '💱' },
              { value: 'settings', label: 'Settings', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                  activeTab === tab.value
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-green-600 text-2xl">✓</span>
            <p className="text-green-800 font-medium">Changes saved successfully!</p>
          </div>
        )}

        {activeTab === 'translations' && (
          <div className="space-y-6">
            {/* Translation Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LANGUAGES.filter(l => settings.supportedLanguages.includes(l.code)).map((lang) => {
                const langStats = stats.byLanguage[lang.code];
                return (
                  <div key={lang.code} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{lang.flag}</span>
                      <p className="font-medium text-gray-900">{lang.name}</p>
                    </div>
                    <div className="mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${langStats?.percentage || 0}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">
                      {langStats?.completed || 0} / {langStats?.total || 0} ({langStats?.percentage?.toFixed(0) || 0}%)
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Add New Translation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Translation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Translation Key</label>
                  <input
                    type="text"
                    value={newTranslation.key}
                    onChange={(e) => setNewTranslation({ ...newTranslation, key: e.target.value })}
                    placeholder="e.g., product.buyNow"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newTranslation.category}
                    onChange={(e) => setNewTranslation({ ...newTranslation, category: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="common">Common</option>
                    <option value="product">Product</option>
                    <option value="checkout">Checkout</option>
                    <option value="account">Account</option>
                    <option value="admin">Admin</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {settings.supportedLanguages.map((lang) => {
                  const language = LANGUAGES.find(l => l.code === lang);
                  return (
                    <div key={lang}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language?.flag} {language?.name}
                      </label>
                      <input
                        type="text"
                        value={newTranslation.translations[lang] || ''}
                        onChange={(e) => setNewTranslation({
                          ...newTranslation,
                          translations: { ...newTranslation.translations, [lang]: e.target.value }
                        })}
                        placeholder={`Translation in ${language?.name}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleSaveTranslation}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Save Translation
              </button>
            </div>

            {/* Existing Translations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Translations ({translations.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Languages</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {translations.slice(0, 50).map((trans) => (
                      <tr key={trans.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{trans.key}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{trans.category}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-1">
                            {settings.supportedLanguages.map((lang) => (
                              <span
                                key={lang}
                                className={`text-lg ${trans.translations[lang] ? '' : 'opacity-30'}`}
                                title={LANGUAGES.find(l => l.code === lang)?.name}
                              >
                                {LANGUAGES.find(l => l.code === lang)?.flag}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => handleDeleteTranslation(trans.key)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'currencies' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Exchange Rates (to KES)</h2>
              <p className="text-sm text-gray-600 mb-4">
                Set exchange rates relative to Kenyan Shilling (KES = 1.0)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {CURRENCIES.map((curr) => (
                  <div key={curr.code} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{curr.flag}</span>
                      <div>
                        <p className="font-medium text-gray-900">{curr.code}</p>
                        <p className="text-xs text-gray-600">{curr.name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Exchange Rate</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={exchangeRates[curr.code] || ''}
                        onChange={(e) => setExchangeRates({ ...exchangeRates, [curr.code]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        1 KES = {curr.symbol}{(parseFloat(exchangeRates[curr.code]) || 0).toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpdateExchangeRates}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
              >
                Update Exchange Rates
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value as LanguageCode })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value as CurrencyCode })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.flag} {curr.code} - {curr.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supported Languages</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {LANGUAGES.map((lang) => (
                      <label key={lang.code} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.supportedLanguages.includes(lang.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                supportedLanguages: [...settings.supportedLanguages, lang.code]
                              });
                            } else {
                              setSettings({
                                ...settings,
                                supportedLanguages: settings.supportedLanguages.filter(l => l !== lang.code)
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{lang.flag} {lang.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoDetectLanguage}
                      onChange={(e) => setSettings({ ...settings, autoDetectLanguage: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-detect user language</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoDetectCurrency}
                      onChange={(e) => setSettings({ ...settings, autoDetectCurrency: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Auto-detect user currency</span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleUpdateSettings}
                className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
