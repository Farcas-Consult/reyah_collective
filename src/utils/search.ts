// Advanced Search Utilities with Typo Tolerance and Filtering

import type { SearchFilters, SearchSuggestion, SearchHistory, SearchResult } from '@/types/search';

const SEARCH_HISTORY_KEY = 'reyah_search_history';
const SEARCH_FILTERS_KEY = 'reyah_saved_filters';
const MAX_HISTORY_ITEMS = 10;

// Levenshtein distance for typo tolerance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Check if strings are similar (typo tolerance)
function isSimilar(str1: string, str2: string, threshold: number = 2): boolean {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1.includes(s2) || s2.includes(s1)) return true;

  const distance = levenshteinDistance(s1, s2);
  return distance <= threshold;
}

// Normalize search query
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

// Generate search suggestions
export function generateSearchSuggestions(
  query: string,
  products: any[],
  maxSuggestions: number = 8
): SearchSuggestion[] {
  if (!query || query.length < 2) {
    return getRecentSearches().map(search => ({
      text: search.query,
      type: 'recent' as const,
    }));
  }

  const normalizedQuery = normalizeQuery(query);
  const suggestions: SearchSuggestion[] = [];
  const seen = new Set<string>();

  // Product name suggestions
  products.forEach(product => {
    const normalizedName = normalizeQuery(product.name);
    if (
      (normalizedName.includes(normalizedQuery) || isSimilar(normalizedName, normalizedQuery)) &&
      !seen.has(product.name.toLowerCase())
    ) {
      suggestions.push({
        text: product.name,
        type: 'product',
        image: product.image,
      });
      seen.add(product.name.toLowerCase());
    }
  });

  // Category suggestions
  const categories = new Set<string>();
  products.forEach(p => {
    const normalizedCategory = normalizeQuery(p.category);
    if (
      (normalizedCategory.includes(normalizedQuery) || isSimilar(normalizedCategory, normalizedQuery)) &&
      !seen.has(p.category.toLowerCase())
    ) {
      categories.add(p.category);
    }
  });

  categories.forEach(category => {
    const count = products.filter(p => p.category === category).length;
    suggestions.push({
      text: category,
      type: 'category',
      count,
    });
    seen.add(category.toLowerCase());
  });

  // Brand suggestions
  const brands = new Set<string>();
  products.forEach(p => {
    if (p.brand) {
      const normalizedBrand = normalizeQuery(p.brand);
      if (
        (normalizedBrand.includes(normalizedQuery) || isSimilar(normalizedBrand, normalizedQuery)) &&
        !seen.has(p.brand.toLowerCase())
      ) {
        brands.add(p.brand);
      }
    }
  });

  brands.forEach(brand => {
    const count = products.filter(p => p.brand === brand).length;
    suggestions.push({
      text: brand,
      type: 'brand',
      count,
    });
    seen.add(brand.toLowerCase());
  });

  return suggestions.slice(0, maxSuggestions);
}

// Filter and search products
export function searchAndFilterProducts(
  products: any[],
  filters: SearchFilters,
  reviews: any[] = []
): SearchResult[] {
  let results = [...products];

  // Text search with typo tolerance
  if (filters.query) {
    const normalizedQuery = normalizeQuery(filters.query);
    results = results.filter(product => {
      const searchableText = `${product.name} ${product.category} ${product.brand || ''} ${product.description || ''} ${(product.tags || []).join(' ')}`;
      const normalizedText = normalizeQuery(searchableText);
      
      // Exact match or contains
      if (normalizedText.includes(normalizedQuery)) return true;

      // Check for typo tolerance on individual words
      const queryWords = normalizedQuery.split(' ');
      const textWords = normalizedText.split(' ');
      
      return queryWords.every(queryWord => 
        textWords.some(textWord => isSimilar(textWord, queryWord, 2))
      );
    });
  }

  // Category filter
  if (filters.category) {
    results = results.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    results = results.filter(p => 
      p.brand && filters.brands!.some(brand => brand.toLowerCase() === p.brand.toLowerCase())
    );
  }

  // Seller filter
  if (filters.sellers && filters.sellers.length > 0) {
    results = results.filter(p => 
      p.sellerName && filters.sellers!.includes(p.sellerName)
    );
  }

  // Price range filter
  if (filters.priceRange) {
    results = results.filter(p => {
      const price = p.salePrice || p.price;
      return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
    });
  }

  // Stock filter
  if (filters.inStock !== undefined) {
    results = results.filter(p => {
      if (p.stock !== undefined) {
        return filters.inStock ? p.stock > 0 : p.stock === 0;
      }
      return true;
    });
  }

  // Sale filter
  if (filters.onSale) {
    results = results.filter(p => p.salePrice && p.salePrice < p.price);
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(p => {
      const productTags = (p.tags || []).map((t: string) => t.toLowerCase());
      return filters.tags!.some(tag => productTags.includes(tag.toLowerCase()));
    });
  }

  // Rating filter (requires reviews)
  if (filters.rating && reviews.length > 0) {
    results = results.filter(p => {
      const productReviews = reviews.filter(r => r.productId === p.id && !r.isSupplierReview);
      if (productReviews.length === 0) return false;
      
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      return avgRating >= filters.rating!;
    });
  }

  // Map to SearchResult format
  return results.map(p => {
    const productReviews = reviews.filter(r => r.productId === p.id && !r.isSupplierReview);
    const avgRating = productReviews.length > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
      : 0;

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      salePrice: p.salePrice,
      category: p.category,
      brand: p.brand || '',
      image: p.image || '',
      rating: avgRating,
      reviewCount: productReviews.length,
      inStock: p.stock !== undefined ? p.stock > 0 : true,
      tags: p.tags || [],
      sellerId: p.sellerId,
      sellerName: p.sellerName,
      sellerRating: p.sellerRating,
    };
  });
}

// Sort search results
export function sortSearchResults(
  results: SearchResult[],
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular'
): SearchResult[] {
  const sorted = [...results];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    
    case 'price-desc':
      return sorted.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
    
    case 'popular':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
    
    case 'relevance':
    default:
      return sorted;
  }
}

// Paginate results
export function paginateResults<T>(
  items: T[],
  page: number,
  perPage: number
): { items: T[]; pagination: { currentPage: number; totalPages: number; totalResults: number; perPage: number } } {
  const totalPages = Math.ceil(items.length / perPage);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      currentPage,
      totalPages,
      totalResults: items.length,
      perPage,
    },
  };
}

// Save search to history
export function saveSearchToHistory(filters: SearchFilters): void {
  if (!filters.query) return;

  const history = getSearchHistory();
  const newEntry: SearchHistory = {
    query: filters.query,
    filters,
    timestamp: new Date().toISOString(),
  };

  // Remove duplicates
  const filtered = history.filter(h => h.query.toLowerCase() !== filters.query.toLowerCase());
  
  // Add new entry at the beginning
  filtered.unshift(newEntry);

  // Keep only recent items
  const trimmed = filtered.slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
}

// Get search history
export function getSearchHistory(): SearchHistory[] {
  try {
    const data = localStorage.getItem(SEARCH_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Get recent searches (just queries)
export function getRecentSearches(): SearchHistory[] {
  return getSearchHistory().slice(0, 5);
}

// Clear search history
export function clearSearchHistory(): void {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

// Save filter preferences
export function saveFilterPreferences(filters: Partial<SearchFilters>): void {
  localStorage.setItem(SEARCH_FILTERS_KEY, JSON.stringify(filters));
}

// Get saved filter preferences
export function getSavedFilterPreferences(): Partial<SearchFilters> {
  try {
    const data = localStorage.getItem(SEARCH_FILTERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Extract unique values for filter options
export function extractFilterOptions(products: any[], reviews: any[] = []) {
  const brands = new Set<string>();
  const sellers = new Set<string>();
  const categories = new Set<string>();
  const tags = new Set<string>();
  let minPrice = Infinity;
  let maxPrice = 0;

  products.forEach(product => {
    if (product.brand) brands.add(product.brand);
    if (product.sellerName) sellers.add(product.sellerName);
    if (product.category) categories.add(product.category);
    
    const price = product.salePrice || product.price;
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;

    if (product.tags) {
      product.tags.forEach((tag: string) => tags.add(tag));
    }
  });

  return {
    brands: Array.from(brands).sort(),
    sellers: Array.from(sellers).sort(),
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    priceRange: {
      min: minPrice === Infinity ? 0 : minPrice,
      max: maxPrice,
    },
  };
}

// Voice search (browser API)
export function startVoiceSearch(
  onResult: (transcript: string) => void,
  onError?: (error: string) => void
): (() => void) | null {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    onError?.('Voice search is not supported in this browser');
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError?.(`Voice search error: ${event.error}`);
  };

  recognition.start();

  return () => recognition.stop();
}
