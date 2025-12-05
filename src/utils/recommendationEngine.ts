import type {
  RecommendationConfig,
  UserBehavior,
  ProductRecommendation,
  RecommendationSet,
  ProductAffinityScore,
  TrendingProduct,
  RecommendationAnalytics,
  FeaturedProduct,
  RecommendationType,
  RecommendationAlgorithm,
  ABTestVariant,
  RecommendationScore
} from '@/types/recommendations';

// LocalStorage keys
const STORAGE_KEYS = {
  CONFIGS: 'reyah_recommendation_configs',
  USER_BEHAVIOR: 'reyah_user_behavior',
  PRODUCT_AFFINITY: 'reyah_product_affinity',
  TRENDING: 'reyah_trending_products',
  ANALYTICS: 'reyah_recommendation_analytics',
  FEATURED: 'reyah_featured_products',
  AB_TEST_ASSIGNMENTS: 'reyah_ab_test_assignments'
};

// ==================== Configuration Management ====================

export function getDefaultConfigs(): RecommendationConfig[] {
  return [
    {
      id: 'config_customers_also_bought',
      type: 'customers_also_bought',
      algorithm: 'collaborative_filtering',
      enabled: true,
      priority: 1,
      maxItems: 6,
      title: 'Customers Also Bought',
      description: 'Products frequently purchased together',
      abTestEnabled: false,
      minPurchaseCount: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'config_related_products',
      type: 'related_products',
      algorithm: 'content_based',
      enabled: true,
      priority: 2,
      maxItems: 6,
      title: 'Related Products',
      description: 'Similar items you might like',
      abTestEnabled: false,
      similarityThreshold: 0.5,
      categoryWeight: 0.6,
      priceRangeWeight: 0.3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'config_personalized',
      type: 'personalized',
      algorithm: 'hybrid',
      enabled: true,
      priority: 3,
      maxItems: 8,
      title: 'Recommended For You',
      description: 'Based on your browsing and purchase history',
      abTestEnabled: true,
      variantAAlgorithm: 'hybrid',
      variantBAlgorithm: 'collaborative_filtering',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'config_trending',
      type: 'trending',
      algorithm: 'trending',
      enabled: true,
      priority: 4,
      maxItems: 8,
      title: 'Trending Now',
      description: 'Popular items this week',
      abTestEnabled: false,
      trendingDays: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'config_best_sellers',
      type: 'best_sellers',
      algorithm: 'trending',
      enabled: true,
      priority: 5,
      maxItems: 6,
      title: 'Best Sellers',
      description: 'Our most popular products',
      abTestEnabled: false,
      trendingDays: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
}

export function getAllConfigs(): RecommendationConfig[] {
  if (typeof window === 'undefined') return getDefaultConfigs();
  
  const stored = localStorage.getItem(STORAGE_KEYS.CONFIGS);
  if (!stored) {
    const defaults = getDefaultConfigs();
    localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(defaults));
    return defaults;
  }
  
  return JSON.parse(stored, (key, value) => {
    if (key === 'createdAt' || key === 'updatedAt') return new Date(value);
    return value;
  });
}

export function getConfigByType(type: RecommendationType): RecommendationConfig | null {
  const configs = getAllConfigs();
  return configs.find(c => c.type === type && c.enabled) || null;
}

export function saveConfig(config: Partial<RecommendationConfig>): RecommendationConfig {
  const configs = getAllConfigs();
  const id = config.id || `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newConfig: RecommendationConfig = {
    id,
    type: config.type!,
    algorithm: config.algorithm!,
    enabled: config.enabled ?? true,
    priority: config.priority ?? 99,
    maxItems: config.maxItems ?? 6,
    title: config.title!,
    description: config.description,
    abTestEnabled: config.abTestEnabled ?? false,
    abTestVariant: config.abTestVariant,
    variantAAlgorithm: config.variantAAlgorithm,
    variantBAlgorithm: config.variantBAlgorithm,
    similarityThreshold: config.similarityThreshold,
    minPurchaseCount: config.minPurchaseCount,
    trendingDays: config.trendingDays,
    categoryWeight: config.categoryWeight,
    priceRangeWeight: config.priceRangeWeight,
    createdAt: config.createdAt || new Date(),
    updatedAt: new Date()
  };
  
  const existingIndex = configs.findIndex(c => c.id === id);
  if (existingIndex >= 0) {
    configs[existingIndex] = newConfig;
  } else {
    configs.push(newConfig);
  }
  
  localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(configs));
  return newConfig;
}

export function deleteConfig(id: string): void {
  const configs = getAllConfigs();
  const filtered = configs.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.CONFIGS, JSON.stringify(filtered));
}

// ==================== User Behavior Tracking ====================

export function getUserBehavior(userId: string): UserBehavior | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR);
  if (!stored) return null;
  
  const behaviors: UserBehavior[] = JSON.parse(stored, (key, value) => {
    if (key === 'timestamp' || key === 'lastActivity' || key === 'createdAt') {
      return new Date(value);
    }
    return value;
  });
  
  return behaviors.find(b => b.userId === userId) || null;
}

export function trackProductView(userId: string, product: { id: string; name: string; category: string; price: number; vendorId?: string }): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR);
  const behaviors: UserBehavior[] = stored ? JSON.parse(stored) : [];
  
  let userBehavior = behaviors.find(b => b.userId === userId);
  
  if (!userBehavior) {
    userBehavior = {
      userId,
      sessionId: `session_${Date.now()}`,
      viewedProducts: [],
      cartAdditions: [],
      purchases: [],
      searches: [],
      preferredCategories: [],
      preferredPriceRange: { min: 0, max: 999999 },
      favoriteVendors: [],
      lastActivity: new Date(),
      createdAt: new Date()
    };
    behaviors.push(userBehavior);
  }
  
  userBehavior.viewedProducts.push({
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: product.price,
    vendorId: product.vendorId,
    timestamp: new Date()
  });
  
  // Keep only last 100 views
  if (userBehavior.viewedProducts.length > 100) {
    userBehavior.viewedProducts = userBehavior.viewedProducts.slice(-100);
  }
  
  userBehavior.lastActivity = new Date();
  updateUserPreferences(userBehavior);
  
  localStorage.setItem(STORAGE_KEYS.USER_BEHAVIOR, JSON.stringify(behaviors));
}

export function trackCartAddition(userId: string, product: { id: string; name: string; category: string; price: number; quantity: number }): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR);
  const behaviors: UserBehavior[] = stored ? JSON.parse(stored) : [];
  
  let userBehavior = behaviors.find(b => b.userId === userId);
  if (!userBehavior) return;
  
  userBehavior.cartAdditions.push({
    productId: product.id,
    productName: product.name,
    category: product.category,
    price: product.price,
    quantity: product.quantity,
    timestamp: new Date()
  });
  
  userBehavior.lastActivity = new Date();
  updateUserPreferences(userBehavior);
  
  localStorage.setItem(STORAGE_KEYS.USER_BEHAVIOR, JSON.stringify(behaviors));
}

export function trackPurchase(userId: string, orderId: string, products: Array<{ id: string; name: string; category: string; price: number; quantity: number }>): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR);
  const behaviors: UserBehavior[] = stored ? JSON.parse(stored) : [];
  
  let userBehavior = behaviors.find(b => b.userId === userId);
  if (!userBehavior) return;
  
  products.forEach(product => {
    userBehavior!.purchases.push({
      orderId,
      productId: product.id,
      productName: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      timestamp: new Date()
    });
  });
  
  userBehavior.lastActivity = new Date();
  updateUserPreferences(userBehavior);
  updateProductAffinity(products.map(p => p.id));
  
  localStorage.setItem(STORAGE_KEYS.USER_BEHAVIOR, JSON.stringify(behaviors));
}

function updateUserPreferences(behavior: UserBehavior): void {
  // Update preferred categories
  const categoryCounts = new Map<string, number>();
  [...behavior.viewedProducts, ...behavior.cartAdditions, ...behavior.purchases].forEach(item => {
    categoryCounts.set(item.category, (categoryCounts.get(item.category) || 0) + 1);
  });
  
  behavior.preferredCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);
  
  // Update price range
  const prices = [...behavior.viewedProducts, ...behavior.purchases].map(p => p.price);
  if (prices.length > 0) {
    const sortedPrices = prices.sort((a, b) => a - b);
    const q1 = sortedPrices[Math.floor(prices.length * 0.25)];
    const q3 = sortedPrices[Math.floor(prices.length * 0.75)];
    behavior.preferredPriceRange = { min: q1, max: q3 };
  }
}

// ==================== Product Affinity (Collaborative Filtering) ====================

function updateProductAffinity(productIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCT_AFFINITY);
  const affinities: ProductAffinityScore[] = stored ? JSON.parse(stored) : [];
  
  // Update affinity for all product pairs in this order
  for (let i = 0; i < productIds.length; i++) {
    for (let j = i + 1; j < productIds.length; j++) {
      const [productA, productB] = [productIds[i], productIds[j]].sort();
      
      let affinity = affinities.find(a => a.productAId === productA && a.productBId === productB);
      
      if (!affinity) {
        affinity = {
          productAId: productA,
          productBId: productB,
          score: 0,
          count: 0,
          lastUpdated: new Date()
        };
        affinities.push(affinity);
      }
      
      affinity.count += 1;
      affinity.score = Math.min(1, affinity.count / 10); // Normalize to 0-1
      affinity.lastUpdated = new Date();
    }
  }
  
  localStorage.setItem(STORAGE_KEYS.PRODUCT_AFFINITY, JSON.stringify(affinities));
}

export function getProductAffinities(productId: string): ProductAffinityScore[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCT_AFFINITY);
  if (!stored) return [];
  
  const affinities: ProductAffinityScore[] = JSON.parse(stored);
  return affinities
    .filter(a => a.productAId === productId || a.productBId === productId)
    .sort((a, b) => b.score - a.score);
}

// ==================== Trending Products ====================

export function updateTrendingProducts(): void {
  if (typeof window === 'undefined') return;
  
  const behaviors = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_BEHAVIOR) || '[]');
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const productStats = new Map<string, { views: number; carts: number; purchases: number }>();
  
  behaviors.forEach((behavior: UserBehavior) => {
    // Views in last 7 days
    behavior.viewedProducts
      .filter(v => new Date(v.timestamp) > daysAgo(7))
      .forEach(v => {
        const stats = productStats.get(v.productId) || { views: 0, carts: 0, purchases: 0 };
        stats.views += 1;
        productStats.set(v.productId, stats);
      });
    
    // Cart additions
    behavior.cartAdditions
      .filter(c => new Date(c.timestamp) > daysAgo(7))
      .forEach(c => {
        const stats = productStats.get(c.productId) || { views: 0, carts: 0, purchases: 0 };
        stats.carts += 1;
        productStats.set(c.productId, stats);
      });
    
    // Purchases
    behavior.purchases
      .filter(p => new Date(p.timestamp) > daysAgo(7))
      .forEach(p => {
        const stats = productStats.get(p.productId) || { views: 0, carts: 0, purchases: 0 };
        stats.purchases += 1;
        productStats.set(p.productId, stats);
      });
  });
  
  const trending: TrendingProduct[] = Array.from(productStats.entries()).map(([productId, stats]) => {
    // Calculate trend score: weighted combination
    const trendScore = (stats.views * 1) + (stats.carts * 5) + (stats.purchases * 10);
    
    return {
      productId,
      trendScore,
      viewCount: stats.views,
      purchaseCount: stats.purchases,
      addToCartCount: stats.carts,
      periodDays: 7,
      calculatedAt: new Date()
    };
  }).sort((a, b) => b.trendScore - a.trendScore);
  
  localStorage.setItem(STORAGE_KEYS.TRENDING, JSON.stringify(trending));
}

export function getTrendingProducts(limit: number = 10): TrendingProduct[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.TRENDING);
  if (!stored) {
    updateTrendingProducts();
    return getTrendingProducts(limit);
  }
  
  const trending: TrendingProduct[] = JSON.parse(stored);
  return trending.slice(0, limit);
}

// ==================== Recommendation Algorithms ====================

export function getRecommendations(
  type: RecommendationType,
  allProducts: any[],
  options: {
    userId?: string;
    productId?: string;
    limit?: number;
    excludeProductIds?: string[];
  } = {}
): RecommendationSet {
  const config = getConfigByType(type);
  if (!config || !config.enabled) {
    return {
      type,
      title: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      products: [],
      algorithm: 'manual',
      generatedAt: new Date(),
      userId: options.userId,
      contextProductId: options.productId
    };
  }
  
  const limit = options.limit || config.maxItems;
  const excludeIds = new Set(options.excludeProductIds || []);
  
  // Determine algorithm (A/B test if enabled)
  let algorithm = config.algorithm;
  if (config.abTestEnabled && options.userId) {
    const variant = getABTestVariant(options.userId, config.id);
    algorithm = variant === 'A' ? (config.variantAAlgorithm || config.algorithm) : (config.variantBAlgorithm || config.algorithm);
  }
  
  let scoredProducts: RecommendationScore[] = [];
  
  switch (algorithm) {
    case 'collaborative_filtering':
      scoredProducts = collaborativeFiltering(options.productId, allProducts, config);
      break;
    case 'content_based':
      scoredProducts = contentBasedFiltering(options.productId, allProducts, config);
      break;
    case 'hybrid':
      scoredProducts = hybridRecommendation(options.userId, options.productId, allProducts, config);
      break;
    case 'trending':
      scoredProducts = trendingRecommendation(allProducts, config);
      break;
    case 'manual':
      scoredProducts = manualRecommendation(allProducts);
      break;
  }
  
  // Filter and limit
  const recommendations = scoredProducts
    .filter(s => !excludeIds.has(s.productId))
    .slice(0, limit)
    .map(scored => {
      const product = allProducts.find(p => p.id === scored.productId);
      return product ? {
        ...product,
        score: scored.score,
        reasons: scored.reasons,
        recommendationType: type
      } : null;
    })
    .filter(p => p !== null) as ProductRecommendation[];
  
  return {
    type,
    title: config.title,
    description: config.description,
    products: recommendations,
    algorithm,
    generatedAt: new Date(),
    userId: options.userId,
    contextProductId: options.productId
  };
}

function collaborativeFiltering(productId: string | undefined, allProducts: any[], config: RecommendationConfig): RecommendationScore[] {
  if (!productId) return [];
  
  const affinities = getProductAffinities(productId);
  const minCount = config.minPurchaseCount || 2;
  
  return affinities
    .filter(a => a.count >= minCount)
    .map(a => {
      const relatedProductId = a.productAId === productId ? a.productBId : a.productAId;
      return {
        productId: relatedProductId,
        score: a.score,
        reasons: [`Frequently bought with this item (${a.count} times)`],
        algorithm: 'collaborative_filtering' as RecommendationAlgorithm
      };
    });
}

function contentBasedFiltering(productId: string | undefined, allProducts: any[], config: RecommendationConfig): RecommendationScore[] {
  if (!productId) return [];
  
  const targetProduct = allProducts.find(p => p.id === productId);
  if (!targetProduct) return [];
  
  const categoryWeight = config.categoryWeight || 0.6;
  const priceWeight = config.priceRangeWeight || 0.3;
  const threshold = config.similarityThreshold || 0.5;
  
  return allProducts
    .filter(p => p.id !== productId)
    .map(product => {
      let score = 0;
      const reasons: string[] = [];
      
      // Category match
      if (product.category === targetProduct.category) {
        score += categoryWeight;
        reasons.push('Same category');
      }
      
      // Price similarity
      const priceDiff = Math.abs(product.price - targetProduct.price);
      const priceRatio = priceDiff / targetProduct.price;
      if (priceRatio < 0.3) {
        score += priceWeight * (1 - priceRatio);
        reasons.push('Similar price');
      }
      
      // Vendor match
      if (product.vendorId && product.vendorId === targetProduct.vendorId) {
        score += 0.1;
        reasons.push('Same vendor');
      }
      
      return {
        productId: product.id,
        score,
        reasons,
        algorithm: 'content_based' as RecommendationAlgorithm
      };
    })
    .filter(s => s.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

function hybridRecommendation(userId: string | undefined, productId: string | undefined, allProducts: any[], config: RecommendationConfig): RecommendationScore[] {
  const collaborative = collaborativeFiltering(productId, allProducts, config);
  const contentBased = contentBasedFiltering(productId, allProducts, config);
  
  // Combine scores
  const scoreMap = new Map<string, RecommendationScore>();
  
  collaborative.forEach(score => {
    scoreMap.set(score.productId, {
      ...score,
      score: score.score * 0.6, // 60% weight to collaborative
      algorithm: 'hybrid' as RecommendationAlgorithm
    });
  });
  
  contentBased.forEach(score => {
    const existing = scoreMap.get(score.productId);
    if (existing) {
      existing.score += score.score * 0.4; // 40% weight to content
      existing.reasons.push(...score.reasons);
    } else {
      scoreMap.set(score.productId, {
        ...score,
        score: score.score * 0.4,
        algorithm: 'hybrid' as RecommendationAlgorithm
      });
    }
  });
  
  // Add user preferences if available
  if (userId) {
    const behavior = getUserBehavior(userId);
    if (behavior) {
      behavior.preferredCategories.forEach((category, index) => {
        const categoryProducts = allProducts.filter(p => p.category === category);
        categoryProducts.forEach(product => {
          const existing = scoreMap.get(product.id);
          const boost = 0.1 * (1 - index * 0.15); // Decreasing boost
          if (existing) {
            existing.score += boost;
            existing.reasons.push('Matches your interests');
          } else {
            scoreMap.set(product.id, {
              productId: product.id,
              score: boost,
              reasons: ['Matches your interests'],
              algorithm: 'hybrid' as RecommendationAlgorithm
            });
          }
        });
      });
    }
  }
  
  return Array.from(scoreMap.values()).sort((a, b) => b.score - a.score);
}

function trendingRecommendation(allProducts: any[], config: RecommendationConfig): RecommendationScore[] {
  const trending = getTrendingProducts(config.maxItems * 2);
  
  return trending.map(t => ({
    productId: t.productId,
    score: t.trendScore / 100, // Normalize
    reasons: [`${t.viewCount} views, ${t.purchaseCount} purchases this week`],
    algorithm: 'trending' as RecommendationAlgorithm
  }));
}

function manualRecommendation(allProducts: any[]): RecommendationScore[] {
  const featured = getFeaturedProducts();
  const now = new Date();
  
  return featured
    .filter(f => f.isActive && new Date(f.startDate) <= now && new Date(f.endDate) >= now)
    .sort((a, b) => a.position - b.position)
    .map((f, index) => ({
      productId: f.productId,
      score: 1 - (index * 0.1),
      reasons: ['Featured by admin'],
      algorithm: 'manual' as RecommendationAlgorithm
    }));
}

// ==================== A/B Testing ====================

function getABTestVariant(userId: string, configId: string): ABTestVariant {
  if (typeof window === 'undefined') return 'A';
  
  const stored = localStorage.getItem(STORAGE_KEYS.AB_TEST_ASSIGNMENTS);
  const assignments: Record<string, Record<string, ABTestVariant>> = stored ? JSON.parse(stored) : {};
  
  if (!assignments[userId]) {
    assignments[userId] = {};
  }
  
  if (!assignments[userId][configId]) {
    // Assign 50/50
    assignments[userId][configId] = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(STORAGE_KEYS.AB_TEST_ASSIGNMENTS, JSON.stringify(assignments));
  }
  
  return assignments[userId][configId];
}

// ==================== Featured Products ====================

export function getFeaturedProducts(): FeaturedProduct[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.FEATURED);
  if (!stored) return [];
  
  return JSON.parse(stored, (key, value) => {
    if (key === 'startDate' || key === 'endDate' || key === 'createdAt') {
      return new Date(value);
    }
    return value;
  });
}

export function saveFeaturedProduct(featured: Partial<FeaturedProduct>): FeaturedProduct {
  const products = getFeaturedProducts();
  const id = featured.id || `featured_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const newFeatured: FeaturedProduct = {
    id,
    productId: featured.productId!,
    position: featured.position ?? products.length + 1,
    startDate: featured.startDate || new Date(),
    endDate: featured.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: featured.isActive ?? true,
    createdBy: featured.createdBy || 'admin',
    createdAt: featured.createdAt || new Date()
  };
  
  const existingIndex = products.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    products[existingIndex] = newFeatured;
  } else {
    products.push(newFeatured);
  }
  
  localStorage.setItem(STORAGE_KEYS.FEATURED, JSON.stringify(products));
  return newFeatured;
}

export function deleteFeaturedProduct(id: string): void {
  const products = getFeaturedProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.FEATURED, JSON.stringify(filtered));
}

// ==================== Analytics ====================

export function trackRecommendationImpression(type: RecommendationType, algorithm: RecommendationAlgorithm, variant?: ABTestVariant): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  const analytics: RecommendationAnalytics[] = stored ? JSON.parse(stored) : [];
  
  const key = `${type}_${algorithm}_${variant || 'none'}`;
  let record = analytics.find(a => `${a.type}_${a.algorithm}_${a.abTestVariant || 'none'}` === key);
  
  if (!record) {
    record = {
      id: `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      algorithm,
      abTestVariant: variant,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      ctr: 0,
      conversionRate: 0,
      avgOrderValue: 0,
      periodStart: new Date(),
      periodEnd: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    analytics.push(record);
  }
  
  record.impressions += 1;
  record.updatedAt = new Date();
  calculateMetrics(record);
  
  localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
}

export function trackRecommendationClick(type: RecommendationType, algorithm: RecommendationAlgorithm, variant?: ABTestVariant): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  const analytics: RecommendationAnalytics[] = stored ? JSON.parse(stored) : [];
  
  const key = `${type}_${algorithm}_${variant || 'none'}`;
  const record = analytics.find(a => `${a.type}_${a.algorithm}_${a.abTestVariant || 'none'}` === key);
  
  if (record) {
    record.clicks += 1;
    record.updatedAt = new Date();
    calculateMetrics(record);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  }
}

export function trackRecommendationConversion(type: RecommendationType, algorithm: RecommendationAlgorithm, revenue: number, variant?: ABTestVariant): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  const analytics: RecommendationAnalytics[] = stored ? JSON.parse(stored) : [];
  
  const key = `${type}_${algorithm}_${variant || 'none'}`;
  const record = analytics.find(a => `${a.type}_${a.algorithm}_${a.abTestVariant || 'none'}` === key);
  
  if (record) {
    record.conversions += 1;
    record.revenue += revenue;
    record.updatedAt = new Date();
    calculateMetrics(record);
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analytics));
  }
}

function calculateMetrics(analytics: RecommendationAnalytics): void {
  analytics.ctr = analytics.impressions > 0 ? (analytics.clicks / analytics.impressions) * 100 : 0;
  analytics.conversionRate = analytics.clicks > 0 ? (analytics.conversions / analytics.clicks) * 100 : 0;
  analytics.avgOrderValue = analytics.conversions > 0 ? analytics.revenue / analytics.conversions : 0;
}

export function getAllAnalytics(): RecommendationAnalytics[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.ANALYTICS);
  if (!stored) return [];
  
  return JSON.parse(stored, (key, value) => {
    if (key === 'periodStart' || key === 'periodEnd' || key === 'createdAt' || key === 'updatedAt') {
      return new Date(value);
    }
    return value;
  });
}
