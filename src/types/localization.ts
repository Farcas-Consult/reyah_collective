// Localization Types

export type LanguageCode = 'en' | 'sw' | 'fr' | 'ar' | 'es' | 'pt';
export type CurrencyCode = 'KES' | 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'NGN' | 'GHS' | 'TZS' | 'UGX';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean; // Right-to-left
}

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  exchangeRate: number; // Rate to KES (base currency)
  decimalPlaces: number;
}

export interface Translation {
  id: string;
  key: string;
  category: 'common' | 'product' | 'checkout' | 'account' | 'admin' | 'notification';
  translations: {
    [key in LanguageCode]?: string;
  };
  updatedAt: Date;
  updatedBy: string;
}

export interface TranslationCategory {
  category: string;
  label: string;
  description: string;
  translationCount: number;
}

export interface LocalizationSettings {
  defaultLanguage: LanguageCode;
  defaultCurrency: CurrencyCode;
  supportedLanguages: LanguageCode[];
  supportedCurrencies: CurrencyCode[];
  autoDetectLanguage: boolean;
  autoDetectCurrency: boolean;
  fallbackLanguage: LanguageCode;
  translationProvider: 'manual' | 'google' | 'microsoft';
  currencyUpdateFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  lastCurrencyUpdate?: Date;
}

export interface UserLocalePreference {
  userId: string;
  language: LanguageCode;
  currency: CurrencyCode;
  autoDetect: boolean;
  updatedAt: Date;
}

export interface ProductTranslation {
  productId: string;
  language: LanguageCode;
  name: string;
  description: string;
  shortDescription?: string;
  features?: string[];
  specifications?: { [key: string]: string };
}

export interface CategoryTranslation {
  categoryId: string;
  language: LanguageCode;
  name: string;
  description?: string;
}

export interface ExchangeRateHistory {
  currency: CurrencyCode;
  rate: number;
  date: Date;
  source: string;
}

export interface LocalizationStats {
  totalTranslations: number;
  completedTranslations: number;
  completionRate: number;
  languageStats: {
    [key in LanguageCode]?: {
      total: number;
      completed: number;
      percentage: number;
    };
  };
  lastUpdated: Date;
}

// Translation keys structure
export interface TranslationKeys {
  // Common
  'common.welcome': string;
  'common.search': string;
  'common.cart': string;
  'common.account': string;
  'common.login': string;
  'common.signup': string;
  'common.logout': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.back': string;
  'common.next': string;
  'common.submit': string;
  'common.loading': string;
  'common.error': string;
  'common.success': string;
  'common.currency': string;
  'common.language': string;
  
  // Navigation
  'nav.home': string;
  'nav.shop': string;
  'nav.about': string;
  'nav.contact': string;
  'nav.collections': string;
  
  // Product
  'product.addToCart': string;
  'product.outOfStock': string;
  'product.inStock': string;
  'product.price': string;
  'product.description': string;
  'product.features': string;
  'product.specifications': string;
  'product.reviews': string;
  'product.rating': string;
  
  // Checkout
  'checkout.title': string;
  'checkout.shipping': string;
  'checkout.payment': string;
  'checkout.review': string;
  'checkout.placeOrder': string;
  'checkout.total': string;
  'checkout.subtotal': string;
  'checkout.tax': string;
  
  // Account
  'account.profile': string;
  'account.orders': string;
  'account.wishlist': string;
  'account.settings': string;
  'account.notifications': string;
  
  // Notifications
  'notification.orderPlaced': string;
  'notification.orderShipped': string;
  'notification.orderDelivered': string;
  'notification.paymentReceived': string;
}
