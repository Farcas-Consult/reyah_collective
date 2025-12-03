// Product Comparison Utilities

import { ComparisonItem, ComparisonData, ComparisonConfig, ComparisonAttribute, DEFAULT_COMPARISON_CONFIG } from '@/types/comparison';

const COMPARISON_STORAGE_KEY = 'reyah_comparison';
const COMPARISON_CONFIG_KEY = 'reyah_comparison_config';

// Get comparison data
export const getComparisonData = (): ComparisonData => {
  if (typeof window === 'undefined') {
    return { items: [], lastUpdated: new Date().toISOString() };
  }
  
  const data = localStorage.getItem(COMPARISON_STORAGE_KEY);
  if (!data) {
    return { items: [], lastUpdated: new Date().toISOString() };
  }
  
  try {
    return JSON.parse(data);
  } catch {
    return { items: [], lastUpdated: new Date().toISOString() };
  }
};

// Save comparison data
const saveComparisonData = (data: ComparisonData): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(data));
};

// Get comparison config
export const getComparisonConfig = (): ComparisonConfig => {
  if (typeof window === 'undefined') {
    return DEFAULT_COMPARISON_CONFIG;
  }
  
  const config = localStorage.getItem(COMPARISON_CONFIG_KEY);
  if (!config) {
    return DEFAULT_COMPARISON_CONFIG;
  }
  
  try {
    return JSON.parse(config);
  } catch {
    return DEFAULT_COMPARISON_CONFIG;
  }
};

// Save comparison config
export const saveComparisonConfig = (config: ComparisonConfig): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMPARISON_CONFIG_KEY, JSON.stringify(config));
};

// Add product to comparison
export const addToComparison = (productId: number): boolean => {
  const data = getComparisonData();
  const config = getComparisonConfig();
  
  // Check if already in comparison
  if (data.items.some(item => item.productId === productId)) {
    return false;
  }
  
  // Check max limit
  if (data.items.length >= config.maxProducts) {
    return false;
  }
  
  const newItem: ComparisonItem = {
    productId,
    addedAt: new Date().toISOString(),
  };
  
  const updatedData: ComparisonData = {
    items: [...data.items, newItem],
    lastUpdated: new Date().toISOString(),
  };
  
  saveComparisonData(updatedData);
  return true;
};

// Remove product from comparison
export const removeFromComparison = (productId: number): void => {
  const data = getComparisonData();
  
  const updatedData: ComparisonData = {
    items: data.items.filter(item => item.productId !== productId),
    lastUpdated: new Date().toISOString(),
  };
  
  saveComparisonData(updatedData);
};

// Clear all comparison
export const clearComparison = (): void => {
  const updatedData: ComparisonData = {
    items: [],
    lastUpdated: new Date().toISOString(),
  };
  
  saveComparisonData(updatedData);
};

// Check if product is in comparison
export const isInComparison = (productId: number): boolean => {
  const data = getComparisonData();
  return data.items.some(item => item.productId === productId);
};

// Get comparison count
export const getComparisonCount = (): number => {
  const data = getComparisonData();
  return data.items.length;
};

// Get product IDs in comparison
export const getComparisonProductIds = (): number[] => {
  const data = getComparisonData();
  return data.items.map(item => item.productId);
};

// Update comparison attribute
export const updateComparisonAttribute = (attributeId: string, updates: Partial<ComparisonAttribute>): void => {
  const config = getComparisonConfig();
  
  const updatedAttributes = config.customAttributes.map(attr => 
    attr.id === attributeId ? { ...attr, ...updates } : attr
  );
  
  const updatedConfig: ComparisonConfig = {
    ...config,
    customAttributes: updatedAttributes,
    enabledAttributes: updatedAttributes.filter(attr => attr.enabled).map(attr => attr.id),
  };
  
  saveComparisonConfig(updatedConfig);
};

// Toggle attribute enabled status
export const toggleAttributeEnabled = (attributeId: string): void => {
  const config = getComparisonConfig();
  const attribute = config.customAttributes.find(attr => attr.id === attributeId);
  
  if (attribute) {
    updateComparisonAttribute(attributeId, { enabled: !attribute.enabled });
  }
};

// Reorder attributes
export const reorderAttributes = (attributeId: string, newOrder: number): void => {
  const config = getComparisonConfig();
  
  const updatedAttributes = config.customAttributes.map(attr => {
    if (attr.id === attributeId) {
      return { ...attr, order: newOrder };
    }
    return attr;
  }).sort((a, b) => a.order - b.order);
  
  const updatedConfig: ComparisonConfig = {
    ...config,
    customAttributes: updatedAttributes,
  };
  
  saveComparisonConfig(updatedConfig);
};

// Get enabled attributes sorted by order
export const getEnabledAttributes = (): ComparisonAttribute[] => {
  const config = getComparisonConfig();
  return config.customAttributes
    .filter(attr => attr.enabled)
    .sort((a, b) => a.order - b.order);
};

// Generate shareable comparison URL
export const generateComparisonUrl = (): string => {
  const productIds = getComparisonProductIds();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/compare?products=${productIds.join(',')}`;
};

// Load comparison from URL params
export const loadComparisonFromUrl = (productIdsParam: string): void => {
  const productIds = productIdsParam.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
  
  const config = getComparisonConfig();
  const limitedIds = productIds.slice(0, config.maxProducts);
  
  const items: ComparisonItem[] = limitedIds.map(productId => ({
    productId,
    addedAt: new Date().toISOString(),
  }));
  
  const data: ComparisonData = {
    items,
    lastUpdated: new Date().toISOString(),
  };
  
  saveComparisonData(data);
};

// Export comparison data as JSON
export const exportComparisonAsJson = (products: any[]): string => {
  const config = getComparisonConfig();
  const enabledAttrs = getEnabledAttributes();
  
  const comparisonData = products.map(product => {
    const data: any = {};
    enabledAttrs.forEach(attr => {
      data[attr.label] = getProductAttributeValue(product, attr.id);
    });
    return data;
  });
  
  return JSON.stringify(comparisonData, null, 2);
};

// Helper to get product attribute value
const getProductAttributeValue = (product: any, attributeId: string): any => {
  switch (attributeId) {
    case 'name': return product.name;
    case 'description': return product.description;
    case 'category': return product.category;
    case 'price': return product.price;
    case 'salePrice': return product.salePrice;
    case 'discount': return product.salePrice ? `${Math.round((1 - product.salePrice / product.price) * 100)}%` : 'N/A';
    case 'rating': return product.rating || 'No rating';
    case 'reviews': return product.reviews || 0;
    case 'stock': return product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock';
    case 'colors': return product.colors?.join(', ') || 'N/A';
    case 'sizes': return product.sizes?.join(', ') || 'N/A';
    case 'materials': return product.materials || 'N/A';
    case 'seller': return product.seller;
    case 'sellerRating': return product.sellerRating || 'N/A';
    case 'shipping': return product.shipping || 'Free';
    case 'shippingTime': return product.shippingTime || '3-5 days';
    default: return 'N/A';
  }
};
