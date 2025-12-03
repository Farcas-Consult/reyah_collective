// Advanced Search and Filtering Types

export interface SearchFilters {
  query: string;
  category?: string;
  brands?: string[];
  sellers?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number; // Minimum rating (1-5)
  shippingOptions?: ('free' | 'express' | 'standard')[];
  inStock?: boolean;
  onSale?: boolean;
  tags?: string[];
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent';
  count?: number;
  image?: string;
}

export interface SearchHistory {
  query: string;
  filters: SearchFilters;
  timestamp: string;
}

export interface SortOption {
  label: string;
  value: 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'popular';
}

export interface SearchResult {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  category: string;
  brand: string;
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  tags: string[];
  sellerId?: number;
  sellerName?: string;
  sellerRating?: number;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  perPage: number;
}
