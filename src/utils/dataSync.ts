/**
 * Data Synchronization Utility
 * Ensures all changes made by admin, seller, or supplier are updated across the website and dashboards
 */

// Event names for different data types
export const DATA_SYNC_EVENTS = {
  PRODUCTS_UPDATED: 'reyah_products_updated',
  USERS_UPDATED: 'reyah_users_updated',
  ORDERS_UPDATED: 'reyah_orders_updated',
  FLASH_SALES_UPDATED: 'reyah_flash_sales_updated',
  REVIEWS_UPDATED: 'reyah_reviews_updated',
} as const;

/**
 * Trigger a data sync event
 * This will notify all listening components to refresh their data
 */
export function triggerDataSync(eventName: string, data?: any) {
  if (typeof window === 'undefined') return;
  
  const event = new CustomEvent(eventName, { detail: data });
  window.dispatchEvent(event);
  
  // Also trigger a storage event for cross-tab sync
  window.dispatchEvent(new Event('storage'));
}

/**
 * Listen for data sync events
 * @param eventName - The event to listen for
 * @param callback - Function to call when event is triggered
 * @returns Cleanup function to remove the listener
 */
export function onDataSync(eventName: string, callback: (data?: any) => void) {
  if (typeof window === 'undefined') return () => {};
  
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    callback(customEvent.detail);
  };
  
  window.addEventListener(eventName, handler);
  
  // Also listen for storage events
  const storageHandler = () => callback();
  window.addEventListener('storage', storageHandler);
  
  return () => {
    window.removeEventListener(eventName, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

/**
 * Save products and trigger update event
 */
export function saveProductsWithSync(products: any[]) {
  localStorage.setItem('reyah_products', JSON.stringify(products));
  triggerDataSync(DATA_SYNC_EVENTS.PRODUCTS_UPDATED, products);
}

/**
 * Save users and trigger update event
 */
export function saveUsersWithSync(users: any[]) {
  localStorage.setItem('reyah_users', JSON.stringify(users));
  triggerDataSync(DATA_SYNC_EVENTS.USERS_UPDATED, users);
}

/**
 * Save orders and trigger update event
 */
export function saveOrdersWithSync(orders: any[]) {
  localStorage.setItem('reyah_orders', JSON.stringify(orders));
  triggerDataSync(DATA_SYNC_EVENTS.ORDERS_UPDATED, orders);
}

/**
 * Save flash sales and trigger update event
 */
export function saveFlashSalesWithSync(sales: any[]) {
  localStorage.setItem('reyah_flash_sales', JSON.stringify(sales));
  triggerDataSync(DATA_SYNC_EVENTS.FLASH_SALES_UPDATED, sales);
}

/**
 * Save reviews and trigger update event
 */
export function saveReviewsWithSync(reviews: any[]) {
  localStorage.setItem('reyah_reviews', JSON.stringify(reviews));
  triggerDataSync(DATA_SYNC_EVENTS.REVIEWS_UPDATED, reviews);
}

/**
 * Get products from localStorage
 */
export function getProducts(): any[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('reyah_products') || '[]');
}

/**
 * Get users from localStorage
 */
export function getUsers(): any[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('reyah_users') || '[]');
}

/**
 * Get orders from localStorage
 */
export function getOrders(): any[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('reyah_orders') || '[]');
}

/**
 * Update a single product and sync
 */
export function updateProduct(productId: number, updates: Partial<any>) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);
  
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    saveProductsWithSync(products);
    return products[index];
  }
  
  return null;
}

/**
 * Add a new product and sync
 */
export function addProduct(product: any) {
  const products = getProducts();
  products.push(product);
  saveProductsWithSync(products);
  return product;
}

/**
 * Delete a product and sync
 */
export function deleteProduct(productId: number) {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveProductsWithSync(filtered);
  return filtered;
}

/**
 * Update seller/supplier products in user data
 */
export function updateSellerProducts(userId: string, products: any[]) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users[index].products = products;
    saveUsersWithSync(users);
    return users[index];
  }
  
  return null;
}
