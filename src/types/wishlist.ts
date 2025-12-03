// Wishlist and Gift Registry Types

export type WishlistPrivacy = 'private' | 'public' | 'shared';
export type RegistryType = 'wishlist' | 'wedding' | 'baby' | 'birthday' | 'holiday' | 'other';

export interface WishlistItem {
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productSalePrice?: number;
  addedAt: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  quantity: number;
  purchased?: boolean;
  purchasedBy?: string;
  purchasedAt?: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  name: string;
  description?: string;
  type: RegistryType;
  privacy: WishlistPrivacy;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
  eventDate?: string;
  shareToken?: string;
  notifyOnSale: boolean;
  notifyOnStock: boolean;
}

export interface WishlistNotification {
  id: string;
  wishlistId: string;
  productId: number;
  productName: string;
  type: 'sale' | 'back_in_stock' | 'price_drop';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface WishlistAnalytics {
  totalWishlists: number;
  totalItems: number;
  popularProducts: {
    productId: number;
    productName: string;
    timesAdded: number;
    currentPrice: number;
  }[];
  wishlistsByType: {
    type: RegistryType;
    count: number;
  }[];
  recentActivity: {
    date: string;
    wishlists: number;
    items: number;
  }[];
}
