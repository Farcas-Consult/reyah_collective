// Wishlist and Gift Registry Utilities

import { Wishlist, WishlistItem, WishlistNotification, WishlistAnalytics, WishlistPrivacy, RegistryType } from '@/types/wishlist';

const WISHLISTS_KEY = 'reyah_wishlists';
const NOTIFICATIONS_KEY = 'reyah_wishlist_notifications';

// Get all wishlists
export const getAllWishlists = (): Wishlist[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(WISHLISTS_KEY);
  return data ? JSON.parse(data) : [];
};

// Save wishlists
const saveWishlists = (wishlists: Wishlist[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WISHLISTS_KEY, JSON.stringify(wishlists));
};

// Get user's wishlists
export const getUserWishlists = (userEmail: string): Wishlist[] => {
  return getAllWishlists().filter(w => w.userEmail === userEmail);
};

// Get wishlist by ID
export const getWishlistById = (wishlistId: string): Wishlist | null => {
  const wishlists = getAllWishlists();
  return wishlists.find(w => w.id === wishlistId) || null;
};

// Get wishlist by share token
export const getWishlistByShareToken = (shareToken: string): Wishlist | null => {
  const wishlists = getAllWishlists();
  return wishlists.find(w => w.shareToken === shareToken && w.privacy !== 'private') || null;
};

// Create new wishlist
export const createWishlist = (
  userEmail: string,
  userName: string,
  name: string,
  type: RegistryType = 'wishlist',
  description?: string,
  eventDate?: string
): Wishlist => {
  const wishlists = getAllWishlists();
  
  const newWishlist: Wishlist = {
    id: `wishlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: userEmail,
    userEmail,
    userName,
    name,
    description,
    type,
    privacy: 'private',
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    eventDate,
    notifyOnSale: true,
    notifyOnStock: true,
  };
  
  wishlists.push(newWishlist);
  saveWishlists(wishlists);
  
  return newWishlist;
};

// Update wishlist
export const updateWishlist = (
  wishlistId: string,
  updates: Partial<Omit<Wishlist, 'id' | 'userId' | 'userEmail' | 'createdAt'>>
): Wishlist | null => {
  const wishlists = getAllWishlists();
  const index = wishlists.findIndex(w => w.id === wishlistId);
  
  if (index === -1) return null;
  
  wishlists[index] = {
    ...wishlists[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveWishlists(wishlists);
  return wishlists[index];
};

// Delete wishlist
export const deleteWishlist = (wishlistId: string): boolean => {
  const wishlists = getAllWishlists();
  const filtered = wishlists.filter(w => w.id !== wishlistId);
  
  if (filtered.length === wishlists.length) return false;
  
  saveWishlists(filtered);
  return true;
};

// Add item to wishlist
export const addToWishlist = (
  wishlistId: string,
  productId: number,
  productName: string,
  productImage: string,
  productPrice: number,
  productSalePrice?: number,
  quantity: number = 1,
  priority?: 'low' | 'medium' | 'high',
  notes?: string
): Wishlist | null => {
  const wishlists = getAllWishlists();
  const index = wishlists.findIndex(w => w.id === wishlistId);
  
  if (index === -1) return null;
  
  // Check if item already exists
  const itemIndex = wishlists[index].items.findIndex(item => item.productId === productId);
  
  if (itemIndex !== -1) {
    // Update quantity if item exists
    wishlists[index].items[itemIndex].quantity += quantity;
    if (priority) wishlists[index].items[itemIndex].priority = priority;
    if (notes) wishlists[index].items[itemIndex].notes = notes;
  } else {
    // Add new item
    const newItem: WishlistItem = {
      productId,
      productName,
      productImage,
      productPrice,
      productSalePrice,
      addedAt: new Date().toISOString(),
      priority,
      notes,
      quantity,
    };
    
    wishlists[index].items.push(newItem);
  }
  
  wishlists[index].updatedAt = new Date().toISOString();
  saveWishlists(wishlists);
  
  return wishlists[index];
};

// Remove item from wishlist
export const removeFromWishlist = (wishlistId: string, productId: number): Wishlist | null => {
  const wishlists = getAllWishlists();
  const index = wishlists.findIndex(w => w.id === wishlistId);
  
  if (index === -1) return null;
  
  wishlists[index].items = wishlists[index].items.filter(item => item.productId !== productId);
  wishlists[index].updatedAt = new Date().toISOString();
  
  saveWishlists(wishlists);
  return wishlists[index];
};

// Update wishlist item
export const updateWishlistItem = (
  wishlistId: string,
  productId: number,
  updates: Partial<WishlistItem>
): Wishlist | null => {
  const wishlists = getAllWishlists();
  const wishlistIndex = wishlists.findIndex(w => w.id === wishlistId);
  
  if (wishlistIndex === -1) return null;
  
  const itemIndex = wishlists[wishlistIndex].items.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) return null;
  
  wishlists[wishlistIndex].items[itemIndex] = {
    ...wishlists[wishlistIndex].items[itemIndex],
    ...updates,
  };
  
  wishlists[wishlistIndex].updatedAt = new Date().toISOString();
  saveWishlists(wishlists);
  
  return wishlists[wishlistIndex];
};

// Mark item as purchased
export const markItemPurchased = (
  wishlistId: string,
  productId: number,
  purchasedBy: string
): Wishlist | null => {
  return updateWishlistItem(wishlistId, productId, {
    purchased: true,
    purchasedBy,
    purchasedAt: new Date().toISOString(),
  });
};

// Check if product is in any wishlist for user
export const isInWishlist = (userEmail: string, productId: number): boolean => {
  const wishlists = getUserWishlists(userEmail);
  return wishlists.some(w => w.items.some(item => item.productId === productId));
};

// Get wishlist containing product
export const getWishlistsWithProduct = (userEmail: string, productId: number): Wishlist[] => {
  const wishlists = getUserWishlists(userEmail);
  return wishlists.filter(w => w.items.some(item => item.productId === productId));
};

// Update privacy settings
export const updatePrivacy = (wishlistId: string, privacy: WishlistPrivacy): Wishlist | null => {
  const updates: any = { privacy };
  
  // Generate share token if changing to shared
  if (privacy === 'shared') {
    updates.shareToken = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  } else if (privacy === 'private') {
    updates.shareToken = undefined;
  }
  
  return updateWishlist(wishlistId, updates);
};

// Generate share URL
export const generateShareUrl = (wishlistId: string): string | null => {
  const wishlist = getWishlistById(wishlistId);
  
  if (!wishlist || wishlist.privacy === 'private') return null;
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  if (wishlist.shareToken) {
    return `${baseUrl}/wishlist/shared/${wishlist.shareToken}`;
  }
  
  return `${baseUrl}/wishlist/${wishlistId}`;
};

// Notifications
export const getNotifications = (userEmail: string): WishlistNotification[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  const allNotifications: WishlistNotification[] = data ? JSON.parse(data) : [];
  
  const userWishlists = getUserWishlists(userEmail);
  const wishlistIds = userWishlists.map(w => w.id);
  
  return allNotifications.filter(n => wishlistIds.includes(n.wishlistId));
};

// Create notification
export const createNotification = (
  wishlistId: string,
  productId: number,
  productName: string,
  type: 'sale' | 'back_in_stock' | 'price_drop',
  message: string
): void => {
  if (typeof window === 'undefined') return;
  
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  const notifications: WishlistNotification[] = data ? JSON.parse(data) : [];
  
  const notification: WishlistNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    wishlistId,
    productId,
    productName,
    type,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  
  notifications.push(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

// Mark notification as read
export const markNotificationRead = (notificationId: string): void => {
  if (typeof window === 'undefined') return;
  
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) return;
  
  const notifications: WishlistNotification[] = JSON.parse(data);
  const index = notifications.findIndex(n => n.id === notificationId);
  
  if (index !== -1) {
    notifications[index].read = true;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }
};

// Get unread notification count
export const getUnreadNotificationCount = (userEmail: string): number => {
  const notifications = getNotifications(userEmail);
  return notifications.filter(n => !n.read).length;
};

// Analytics
export const getWishlistAnalytics = (): WishlistAnalytics => {
  const wishlists = getAllWishlists();
  
  // Count total items
  const totalItems = wishlists.reduce((sum, w) => sum + w.items.length, 0);
  
  // Get popular products
  const productCounts: Map<number, { name: string; count: number; price: number }> = new Map();
  
  wishlists.forEach(wishlist => {
    wishlist.items.forEach(item => {
      const existing = productCounts.get(item.productId);
      if (existing) {
        existing.count += 1;
      } else {
        productCounts.set(item.productId, {
          name: item.productName,
          count: 1,
          price: item.productSalePrice || item.productPrice,
        });
      }
    });
  });
  
  const popularProducts = Array.from(productCounts.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      timesAdded: data.count,
      currentPrice: data.price,
    }))
    .sort((a, b) => b.timesAdded - a.timesAdded)
    .slice(0, 10);
  
  // Count wishlists by type
  const typeMap: Map<RegistryType, number> = new Map();
  wishlists.forEach(w => {
    typeMap.set(w.type, (typeMap.get(w.type) || 0) + 1);
  });
  
  const wishlistsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
    type,
    count,
  }));
  
  // Recent activity (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentActivity: { date: string; wishlists: number; items: number }[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayWishlists = wishlists.filter(w => 
      w.createdAt.startsWith(dateStr)
    ).length;
    
    const dayItems = wishlists.reduce((sum, w) => {
      const itemsAdded = w.items.filter(item => 
        item.addedAt.startsWith(dateStr)
      ).length;
      return sum + itemsAdded;
    }, 0);
    
    recentActivity.push({
      date: dateStr,
      wishlists: dayWishlists,
      items: dayItems,
    });
  }
  
  return {
    totalWishlists: wishlists.length,
    totalItems,
    popularProducts,
    wishlistsByType,
    recentActivity,
  };
};

// Check for price drops and stock changes
export const checkForWishlistUpdates = (userEmail: string): void => {
  if (typeof window === 'undefined') return;
  
  const wishlists = getUserWishlists(userEmail);
  const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
  
  wishlists.forEach(wishlist => {
    if (!wishlist.notifyOnSale && !wishlist.notifyOnStock) return;
    
    wishlist.items.forEach(item => {
      const currentProduct = products.find((p: any) => p.id === item.productId);
      
      if (!currentProduct) return;
      
      // Check for price drop
      if (wishlist.notifyOnSale) {
        const oldPrice = item.productSalePrice || item.productPrice;
        const newPrice = currentProduct.salePrice || currentProduct.price;
        
        if (newPrice < oldPrice) {
          createNotification(
            wishlist.id,
            item.productId,
            item.productName,
            'price_drop',
            `${item.productName} is now KSH ${newPrice.toLocaleString()} (was KSH ${oldPrice.toLocaleString()})`
          );
        }
      }
      
      // Check for back in stock
      if (wishlist.notifyOnStock) {
        if (currentProduct.stock > 0 && (!item.productPrice || item.productPrice === 0)) {
          createNotification(
            wishlist.id,
            item.productId,
            item.productName,
            'back_in_stock',
            `${item.productName} is back in stock!`
          );
        }
      }
    });
  });
};
