import type {
  Language,
  LanguageCode,
  Currency,
  CurrencyCode,
  Translation,
  LocalizationSettings,
  ProductTranslation,
  CategoryTranslation,
  ExchangeRateHistory,
} from '@/types/localization';

// Storage Keys
const STORAGE_KEYS = {
  TRANSLATIONS: 'reyah_translations',
  LOCALIZATION_SETTINGS: 'reyah_localization_settings',
  USER_LOCALE: 'reyah_user_locale',
  PRODUCT_TRANSLATIONS: 'reyah_product_translations',
  CATEGORY_TRANSLATIONS: 'reyah_category_translations',
  EXCHANGE_RATES: 'reyah_exchange_rates',
  EXCHANGE_HISTORY: 'reyah_exchange_history',
} as const;

// Supported Languages
export const LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false,
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    flag: '🇰🇪',
    rtl: false,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    rtl: false,
  },
];

// Supported Currencies
export const CURRENCIES: Currency[] = [
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    flag: '🇰🇪',
    exchangeRate: 1,
    decimalPlaces: 2,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flag: '🇺🇸',
    exchangeRate: 0.0077,
    decimalPlaces: 2,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flag: '🇪🇺',
    exchangeRate: 0.0071,
    decimalPlaces: 2,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flag: '🇬🇧',
    exchangeRate: 0.0061,
    decimalPlaces: 2,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    flag: '🇿🇦',
    exchangeRate: 0.14,
    decimalPlaces: 2,
  },
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    flag: '🇳🇬',
    exchangeRate: 12.5,
    decimalPlaces: 2,
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    flag: '🇬🇭',
    exchangeRate: 0.095,
    decimalPlaces: 2,
  },
  {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TSh',
    flag: '🇹🇿',
    exchangeRate: 18.2,
    decimalPlaces: 2,
  },
  {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    flag: '🇺🇬',
    exchangeRate: 28.5,
    decimalPlaces: 0,
  },
];

// Default translations
const DEFAULT_TRANSLATIONS: { [key: string]: { [key in LanguageCode]?: string } } = {
  'common.welcome': {
    en: 'Welcome',
    sw: 'Karibu',
    fr: 'Bienvenue',
    ar: 'مرحبا',
    es: 'Bienvenido',
    pt: 'Bem-vindo',
  },
  'common.search': {
    en: 'Search',
    sw: 'Tafuta',
    fr: 'Rechercher',
    ar: 'بحث',
    es: 'Buscar',
    pt: 'Procurar',
  },
  'common.cart': {
    en: 'Cart',
    sw: 'Kikapu',
    fr: 'Panier',
    ar: 'عربة التسوق',
    es: 'Carrito',
    pt: 'Carrinho',
  },
  'common.account': {
    en: 'Account',
    sw: 'Akaunti',
    fr: 'Compte',
    ar: 'حساب',
    es: 'Cuenta',
    pt: 'Conta',
  },
  'nav.home': {
    en: 'Home',
    sw: 'Nyumbani',
    fr: 'Accueil',
    ar: 'الرئيسية',
    es: 'Inicio',
    pt: 'Início',
  },
  'nav.shop': {
    en: 'Shop',
    sw: 'Duka',
    fr: 'Boutique',
    ar: 'متجر',
    es: 'Tienda',
    pt: 'Loja',
  },
  'product.addToCart': {
    en: 'Add to Cart',
    sw: 'Ongeza kwenye Kikapu',
    fr: 'Ajouter au panier',
    ar: 'أضف إلى السلة',
    es: 'Añadir al carrito',
    pt: 'Adicionar ao carrinho',
  },
  'product.outOfStock': {
    en: 'Out of Stock',
    sw: 'Hazipatikani',
    fr: 'Rupture de stock',
    ar: 'نفذ من المخزون',
    es: 'Agotado',
    pt: 'Fora de estoque',
  },
  'product.price': {
    en: 'Price',
    sw: 'Bei',
    fr: 'Prix',
    ar: 'السعر',
    es: 'Precio',
    pt: 'Preço',
  },
  'checkout.title': {
    en: 'Checkout',
    sw: 'Malipo',
    fr: 'Paiement',
    ar: 'الدفع',
    es: 'Pagar',
    pt: 'Finalizar compra',
  },
  'checkout.placeOrder': {
    en: 'Place Order',
    sw: 'Weka Agizo',
    fr: 'Passer commande',
    ar: 'تقديم الطلب',
    es: 'Realizar pedido',
    pt: 'Fazer pedido',
  },
  'common.login': {
    en: 'Login',
    sw: 'Ingia',
    fr: 'Connexion',
    ar: 'تسجيل الدخول',
    es: 'Iniciar sesión',
    pt: 'Entrar',
  },
  'common.help': {
    en: 'Help',
    sw: 'Msaada',
    fr: 'Aide',
    ar: 'مساعدة',
    es: 'Ayuda',
    pt: 'Ajuda',
  },
  'common.need': {
    en: 'Need',
    sw: 'Unahitaji',
    fr: 'Besoin',
    ar: 'تحتاج',
    es: 'Necesitas',
    pt: 'Precisa',
  },
  'nav.sellOnReyah': {
    en: 'Sell on Reyah',
    sw: 'Uza kwenye Reyah',
    fr: 'Vendre sur Reyah',
    ar: 'البيع على رياح',
    es: 'Vender en Reyah',
    pt: 'Vender no Reyah',
  },
  'nav.adminDashboard': {
    en: 'Admin Dashboard',
    sw: 'Dashibodi ya Msimamizi',
    fr: 'Tableau de bord administrateur',
    ar: 'لوحة تحكم المسؤول',
    es: 'Panel de administración',
    pt: 'Painel de administração',
  },
  'nav.sellerDashboard': {
    en: 'Seller Dashboard',
    sw: 'Dashibodi ya Muuzaji',
    fr: 'Tableau de bord vendeur',
    ar: 'لوحة تحكم البائع',
    es: 'Panel de vendedor',
    pt: 'Painel de vendedor',
  },
  'nav.supplierDashboard': {
    en: 'Supplier Dashboard',
    sw: 'Dashibodi ya Muuzaji Jumla',
    fr: 'Tableau de bord fournisseur',
    ar: 'لوحة تحكم المورد',
    es: 'Panel de proveedor',
    pt: 'Painel de fornecedor',
  },
  'nav.becomeSeller': {
    en: 'Become a Seller',
    sw: 'Kuwa Muuzaji',
    fr: 'Devenir vendeur',
    ar: 'كن بائعًا',
    es: 'Conviértete en vendedor',
    pt: 'Torne-se vendedor',
  },
  'nav.becomeSupplier': {
    en: 'Become a Supplier',
    sw: 'Kuwa Msambazaji',
    fr: 'Devenir fournisseur',
    ar: 'كن موردًا',
    es: 'Conviértete en proveedor',
    pt: 'Torne-se fornecedor',
  },
  'nav.myAccount': {
    en: 'My Account',
    sw: 'Akaunti Yangu',
    fr: 'Mon compte',
    ar: 'حسابي',
    es: 'Mi cuenta',
    pt: 'Minha conta',
  },
  'nav.myOrders': {
    en: 'My Orders',
    sw: 'Maagizo Yangu',
    fr: 'Mes commandes',
    ar: 'طلباتي',
    es: 'Mis pedidos',
    pt: 'Meus pedidos',
  },
  'nav.rewards': {
    en: 'Rewards',
    sw: 'Zawadi',
    fr: 'Récompenses',
    ar: 'المكافآت',
    es: 'Recompensas',
    pt: 'Recompensas',
  },
  'nav.wishlists': {
    en: 'My Wishlists',
    sw: 'Orodha Zangu za Matakwa',
    fr: 'Mes listes de souhaits',
    ar: 'قوائم أمنياتي',
    es: 'Mis listas de deseos',
    pt: 'Minhas listas de desejos',
  },
  'nav.messages': {
    en: 'Messages',
    sw: 'Ujumbe',
    fr: 'Messages',
    ar: 'الرسائل',
    es: 'Mensajes',
    pt: 'Mensagens',
  },
  'nav.settings': {
    en: 'Settings',
    sw: 'Mipangilio',
    fr: 'Paramètres',
    ar: 'الإعدادات',
    es: 'Configuración',
    pt: 'Configurações',
  },
  'nav.logout': {
    en: 'Logout',
    sw: 'Toka',
    fr: 'Déconnexion',
    ar: 'تسجيل الخروج',
    es: 'Cerrar sesión',
    pt: 'Sair',
  },
  'common.hi': {
    en: 'Hi',
    sw: 'Habari',
    fr: 'Salut',
    ar: 'مرحبا',
    es: 'Hola',
    pt: 'Olá',
  },
  'delivery.nationwide': {
    en: 'NATIONWIDE DELIVERY',
    sw: 'UTOAJI WA NCHI NZIMA',
    fr: 'LIVRAISON NATIONALE',
    ar: 'التوصيل على مستوى البلاد',
    es: 'ENTREGA NACIONAL',
    pt: 'ENTREGA NACIONAL',
  },
  'delivery.fastReliable': {
    en: 'Fast & Reliable Shipping',
    sw: 'Usafirishaji wa Haraka na wa Kuaminika',
    fr: 'Expédition rapide et fiable',
    ar: 'شحن سريع وموثوق',
    es: 'Envío rápido y confiable',
    pt: 'Envio rápido e confiável',
  },
  'delivery.sameDay': {
    en: 'Same-Day Delivery Available',
    sw: 'Utoaji wa Siku Moja Unapatikana',
    fr: 'Livraison le jour même disponible',
    ar: 'التوصيل في نفس اليوم متاح',
    es: 'Entrega el mismo día disponible',
    pt: 'Entrega no mesmo dia disponível',
  },
  'delivery.freeOver': {
    en: 'Free Delivery on Orders Over KES 5,000',
    sw: 'Utoaji wa Bure kwa Maagizo Zaidi ya KES 5,000',
    fr: 'Livraison gratuite pour les commandes de plus de 5 000 KES',
    ar: 'توصيل مجاني للطلبات التي تزيد عن 5000 شلن كيني',
    es: 'Entrega gratis en pedidos superiores a 5,000 KES',
    pt: 'Entrega grátis em pedidos acima de 5.000 KES',
  },
  'status.pending': {
    en: 'Pending',
    sw: 'Inasubiri',
    fr: 'En attente',
    ar: 'قيد الانتظار',
    es: 'Pendiente',
    pt: 'Pendente',
  },
  'status.sellerStatus': {
    en: 'Seller Status',
    sw: 'Hali ya Muuzaji',
    fr: 'Statut du vendeur',
    ar: 'حالة البائع',
    es: 'Estado del vendedor',
    pt: 'Status do vendedor',
  },
  'status.supplierStatus': {
    en: 'Supplier Status',
    sw: 'Hali ya Msambazaji',
    fr: 'Statut du fournisseur',
    ar: 'حالة المورد',
    es: 'Estado del proveedor',
    pt: 'Status do fornecedor',
  },
};

// Get default settings
export function getDefaultSettings(): LocalizationSettings {
  return {
    defaultLanguage: 'en',
    defaultCurrency: 'KES',
    supportedLanguages: ['en', 'sw', 'fr', 'ar'],
    supportedCurrencies: ['KES', 'USD', 'EUR', 'GBP', 'ZAR', 'NGN'],
    autoDetectLanguage: true,
    autoDetectCurrency: false,
    fallbackLanguage: 'en',
    translationProvider: 'manual',
    currencyUpdateFrequency: 'daily',
    lastCurrencyUpdate: new Date(),
  };
}

// Get localization settings
export function getLocalizationSettings(): LocalizationSettings {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: return defaults
    return getDefaultSettings();
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.LOCALIZATION_SETTINGS);
  if (stored) {
    const settings = JSON.parse(stored);
    settings.lastCurrencyUpdate = settings.lastCurrencyUpdate ? new Date(settings.lastCurrencyUpdate) : undefined;
    return settings;
  }
  const defaults = getDefaultSettings();
  localStorage.setItem(STORAGE_KEYS.LOCALIZATION_SETTINGS, JSON.stringify(defaults));
  return defaults;
}

// Update localization settings
export function updateLocalizationSettings(settings: Partial<LocalizationSettings>): void {
  if (typeof window === 'undefined') return;
  
  const current = getLocalizationSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.LOCALIZATION_SETTINGS, JSON.stringify(updated));
}

// Get user locale preferences
export function getUserLocale(): { language: LanguageCode; currency: CurrencyCode } {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: return defaults
    return {
      language: 'en',
      currency: 'KES',
    };
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_LOCALE);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const settings = getLocalizationSettings();
  
  // Auto-detect language from browser
  let language = settings.defaultLanguage;
  if (settings.autoDetectLanguage && typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    if (settings.supportedLanguages.includes(browserLang)) {
      language = browserLang;
    }
  }
  
  return {
    language,
    currency: settings.defaultCurrency,
  };
}

// Set user locale
export function setUserLocale(language: LanguageCode, currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER_LOCALE, JSON.stringify({ language, currency }));
}

// Get language by code
export function getLanguage(code: LanguageCode): Language | undefined {
  return LANGUAGES.find(l => l.code === code);
}

// Get currency by code
export function getCurrency(code: CurrencyCode): Currency | undefined {
  return CURRENCIES.find(c => c.code === code);
}

// Convert currency
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  const from = getCurrency(fromCurrency);
  const to = getCurrency(toCurrency);
  
  if (!from || !to) return amount;
  
  // Convert to base currency (KES) then to target currency
  const inKES = amount / from.exchangeRate;
  const converted = inKES * to.exchangeRate;
  
  return Number(converted.toFixed(to.decimalPlaces));
}

// Format currency
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const currency = getCurrency(currencyCode);
  if (!currency) return amount.toString();
  
  const formatted = amount.toFixed(currency.decimalPlaces);
  return `${currency.symbol}${formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Get translation
export function getTranslation(key: string, language: LanguageCode): string {
  const translations = getTranslations();
  const translation = translations.find(t => t.key === key);
  
  if (translation && translation.translations[language]) {
    return translation.translations[language]!;
  }
  
  // Fallback to default translations
  if (DEFAULT_TRANSLATIONS[key] && DEFAULT_TRANSLATIONS[key][language]) {
    return DEFAULT_TRANSLATIONS[key][language]!;
  }
  
  // Fallback to English
  if (language !== 'en' && DEFAULT_TRANSLATIONS[key] && DEFAULT_TRANSLATIONS[key]['en']) {
    return DEFAULT_TRANSLATIONS[key]['en']!;
  }
  
  return key;
}

// Get all translations
export function getTranslations(): Translation[] {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: return empty array, translations will use DEFAULT_TRANSLATIONS
    return [];
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSLATIONS);
  if (stored) {
    return JSON.parse(stored).map((t: any) => ({
      ...t,
      updatedAt: new Date(t.updatedAt),
    }));
  }
  
  // Initialize with default translations
  const defaults: Translation[] = Object.entries(DEFAULT_TRANSLATIONS).map(([key, translations], index) => ({
    id: `default-${index}`,
    key,
    category: key.split('.')[0] as any,
    translations,
    updatedAt: new Date(),
    updatedBy: 'system',
  }));
  
  localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(defaults));
  return defaults;
}

// Add or update translation
export function upsertTranslation(translation: Omit<Translation, 'id' | 'updatedAt'>): void {
  const translations = getTranslations();
  const existing = translations.find(t => t.key === translation.key);
  
  if (existing) {
    const updated = translations.map(t =>
      t.key === translation.key
        ? { ...translation, id: t.id, updatedAt: new Date() }
        : t
    );
    localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(updated));
  } else {
    const newTranslation: Translation = {
      ...translation,
      id: `trans-${Date.now()}`,
      updatedAt: new Date(),
    };
    localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify([...translations, newTranslation]));
  }
}

// Delete translation
export function deleteTranslation(key: string): void {
  const translations = getTranslations();
  const filtered = translations.filter(t => t.key !== key);
  localStorage.setItem(STORAGE_KEYS.TRANSLATIONS, JSON.stringify(filtered));
}

// Get product translation
export function getProductTranslation(productId: string, language: LanguageCode): ProductTranslation | null {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCT_TRANSLATIONS);
  if (!stored) return null;
  
  const translations: ProductTranslation[] = JSON.parse(stored);
  return translations.find(t => t.productId === productId && t.language === language) || null;
}

// Save product translation
export function saveProductTranslation(translation: ProductTranslation): void {
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCT_TRANSLATIONS);
  const translations: ProductTranslation[] = stored ? JSON.parse(stored) : [];
  
  const existing = translations.findIndex(
    t => t.productId === translation.productId && t.language === translation.language
  );
  
  if (existing >= 0) {
    translations[existing] = translation;
  } else {
    translations.push(translation);
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCT_TRANSLATIONS, JSON.stringify(translations));
}

// Get category translation
export function getCategoryTranslation(categoryId: string, language: LanguageCode): CategoryTranslation | null {
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORY_TRANSLATIONS);
  if (!stored) return null;
  
  const translations: CategoryTranslation[] = JSON.parse(stored);
  return translations.find(t => t.categoryId === categoryId && t.language === language) || null;
}

// Save category translation
export function saveCategoryTranslation(translation: CategoryTranslation): void {
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORY_TRANSLATIONS);
  const translations: CategoryTranslation[] = stored ? JSON.parse(stored) : [];
  
  const existing = translations.findIndex(
    t => t.categoryId === translation.categoryId && t.language === translation.language
  );
  
  if (existing >= 0) {
    translations[existing] = translation;
  } else {
    translations.push(translation);
  }
  
  localStorage.setItem(STORAGE_KEYS.CATEGORY_TRANSLATIONS, JSON.stringify(translations));
}

// Update exchange rates
export function updateExchangeRates(rates: { [key in CurrencyCode]?: number }): void {
  const currencies = CURRENCIES.map(currency => {
    if (rates[currency.code] !== undefined) {
      return { ...currency, exchangeRate: rates[currency.code]! };
    }
    return currency;
  });
  
  // Save to history
  const history: ExchangeRateHistory[] = Object.entries(rates).map(([code, rate]) => ({
    currency: code as CurrencyCode,
    rate,
    date: new Date(),
    source: 'manual',
  }));
  
  const stored = localStorage.getItem(STORAGE_KEYS.EXCHANGE_HISTORY);
  const existingHistory: ExchangeRateHistory[] = stored ? JSON.parse(stored) : [];
  localStorage.setItem(STORAGE_KEYS.EXCHANGE_HISTORY, JSON.stringify([...history, ...existingHistory].slice(0, 1000)));
  
  // Update settings
  updateLocalizationSettings({ lastCurrencyUpdate: new Date() });
}

// Get exchange rate history
export function getExchangeRateHistory(currency: CurrencyCode, days: number = 30): ExchangeRateHistory[] {
  const stored = localStorage.getItem(STORAGE_KEYS.EXCHANGE_HISTORY);
  if (!stored) return [];
  
  const history: ExchangeRateHistory[] = JSON.parse(stored).map((h: any) => ({
    ...h,
    date: new Date(h.date),
  }));
  
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  return history
    .filter(h => h.currency === currency && h.date >= cutoff)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Detect user's country/currency from IP (mock implementation)
export async function detectUserLocation(): Promise<{ country: string; currency: CurrencyCode }> {
  // In production, use a geolocation API
  // For now, return default
  return {
    country: 'Kenya',
    currency: 'KES',
  };
}

// Get translation completion stats
export function getTranslationStats(): {
  total: number;
  byLanguage: { [key in LanguageCode]?: { completed: number; total: number; percentage: number } };
} {
  const translations = getTranslations();
  const settings = getLocalizationSettings();
  
  const stats: any = {
    total: translations.length,
    byLanguage: {},
  };
  
  settings.supportedLanguages.forEach(lang => {
    const completed = translations.filter(t => t.translations[lang]).length;
    stats.byLanguage[lang] = {
      completed,
      total: translations.length,
      percentage: translations.length > 0 ? (completed / translations.length) * 100 : 0,
    };
  });
  
  return stats;
}
