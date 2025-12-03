// Product Comparison Types

export interface ComparisonAttribute {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
  category: 'basic' | 'pricing' | 'specifications' | 'seller' | 'shipping';
}

export interface ComparisonConfig {
  maxProducts: number;
  enabledAttributes: string[];
  customAttributes: ComparisonAttribute[];
  allowSharing: boolean;
  allowSaving: boolean;
}

export interface ComparisonItem {
  productId: number;
  addedAt: string;
}

export interface ComparisonData {
  items: ComparisonItem[];
  lastUpdated: string;
}

// Default comparison attributes
export const DEFAULT_COMPARISON_ATTRIBUTES: ComparisonAttribute[] = [
  // Basic Info
  { id: 'name', label: 'Product Name', enabled: true, order: 1, category: 'basic' },
  { id: 'image', label: 'Image', enabled: true, order: 2, category: 'basic' },
  { id: 'description', label: 'Description', enabled: true, order: 3, category: 'basic' },
  { id: 'category', label: 'Category', enabled: true, order: 4, category: 'basic' },
  
  // Pricing
  { id: 'price', label: 'Price', enabled: true, order: 5, category: 'pricing' },
  { id: 'salePrice', label: 'Sale Price', enabled: true, order: 6, category: 'pricing' },
  { id: 'discount', label: 'Discount', enabled: true, order: 7, category: 'pricing' },
  
  // Specifications
  { id: 'rating', label: 'Rating', enabled: true, order: 8, category: 'specifications' },
  { id: 'reviews', label: 'Number of Reviews', enabled: true, order: 9, category: 'specifications' },
  { id: 'stock', label: 'Stock Status', enabled: true, order: 10, category: 'specifications' },
  { id: 'colors', label: 'Available Colors', enabled: true, order: 11, category: 'specifications' },
  { id: 'sizes', label: 'Available Sizes', enabled: true, order: 12, category: 'specifications' },
  { id: 'materials', label: 'Materials', enabled: true, order: 13, category: 'specifications' },
  
  // Seller Info
  { id: 'seller', label: 'Seller', enabled: true, order: 14, category: 'seller' },
  { id: 'sellerRating', label: 'Seller Rating', enabled: true, order: 15, category: 'seller' },
  
  // Shipping
  { id: 'shipping', label: 'Shipping Cost', enabled: true, order: 16, category: 'shipping' },
  { id: 'shippingTime', label: 'Delivery Time', enabled: true, order: 17, category: 'shipping' },
];

export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  maxProducts: 4,
  enabledAttributes: DEFAULT_COMPARISON_ATTRIBUTES.filter(attr => attr.enabled).map(attr => attr.id),
  customAttributes: DEFAULT_COMPARISON_ATTRIBUTES,
  allowSharing: true,
  allowSaving: true,
};
