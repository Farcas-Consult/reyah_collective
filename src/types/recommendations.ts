// Recommendation Types

export type RecommendationType = 
  | 'customers_also_bought'
  | 'related_products'
  | 'personalized'
  | 'trending'
  | 'recently_viewed'
  | 'new_arrivals'
  | 'best_sellers'
  | 'similar_to_cart';

export type RecommendationAlgorithm =
  | 'collaborative_filtering'
  | 'content_based'
  | 'hybrid'
  | 'trending'
  | 'manual';

export type ABTestVariant = 'A' | 'B';

export interface RecommendationConfig {
  id: string;
  type: RecommendationType;
  algorithm: RecommendationAlgorithm;
  enabled: boolean;
  priority: number; // Higher priority = shown first
  maxItems: number;
  title: string;
  description?: string;
  
  // A/B Testing
  abTestEnabled: boolean;
  abTestVariant?: ABTestVariant;
  variantAAlgorithm?: RecommendationAlgorithm;
  variantBAlgorithm?: RecommendationAlgorithm;
  
  // Algorithm parameters
  similarityThreshold?: number; // 0-1 for content-based
  minPurchaseCount?: number; // For collaborative filtering
  trendingDays?: number; // Look back days for trending
  categoryWeight?: number; // 0-1 for category matching
  priceRangeWeight?: number; // 0-1 for price similarity
  
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBehavior {
  userId: string;
  email?: string;
  sessionId: string;
  
  // Tracking data
  viewedProducts: ProductView[];
  cartAdditions: CartAddition[];
  purchases: Purchase[];
  searches: Search[];
  
  // Preferences (derived)
  preferredCategories: string[];
  preferredPriceRange: { min: number; max: number };
  favoriteVendors: string[];
  
  lastActivity: Date;
  createdAt: Date;
}

export interface ProductView {
  productId: string;
  productName: string;
  category: string;
  price: number;
  vendorId?: string;
  timestamp: Date;
  durationSeconds?: number;
}

export interface CartAddition {
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  timestamp: Date;
}

export interface Purchase {
  orderId: string;
  productId: string;
  productName: string;
  category: string;
  price: number;
  quantity: number;
  timestamp: Date;
}

export interface Search {
  query: string;
  resultsCount: number;
  timestamp: Date;
}

export interface RecommendationScore {
  productId: string;
  score: number;
  reasons: string[]; // Why this was recommended
  algorithm: RecommendationAlgorithm;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  vendorId?: string;
  vendorName?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  
  // Recommendation metadata
  score: number;
  reasons: string[];
  recommendationType: RecommendationType;
}

export interface RecommendationSet {
  type: RecommendationType;
  title: string;
  description?: string;
  products: ProductRecommendation[];
  algorithm: RecommendationAlgorithm;
  generatedAt: Date;
  userId?: string;
  contextProductId?: string; // For "Related to X" recommendations
}

export interface FeaturedProduct {
  id: string;
  productId: string;
  position: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface RecommendationAnalytics {
  id: string;
  type: RecommendationType;
  algorithm: RecommendationAlgorithm;
  abTestVariant?: ABTestVariant;
  
  // Performance metrics
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  
  // Calculated metrics
  ctr: number; // Click-through rate
  conversionRate: number;
  avgOrderValue: number;
  
  // Time period
  periodStart: Date;
  periodEnd: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAffinityScore {
  productAId: string;
  productBId: string;
  score: number; // How often bought together (0-1)
  count: number; // Number of co-occurrences
  lastUpdated: Date;
}

export interface CategoryAffinity {
  categoryA: string;
  categoryB: string;
  score: number;
  count: number;
}

export interface TrendingProduct {
  productId: string;
  trendScore: number;
  viewCount: number;
  purchaseCount: number;
  addToCartCount: number;
  periodDays: number;
  calculatedAt: Date;
}
