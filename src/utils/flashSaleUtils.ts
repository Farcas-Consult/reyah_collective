import { FlashSale, FlashSaleProduct, ActiveDeal, FlashSaleStats, SaleNotification } from '@/types/flashSale';

const STORAGE_KEY = 'reyah_flash_sales';
const NOTIFICATIONS_KEY = 'reyah_sale_notifications';

// Get all flash sales
export function getAllFlashSales(): FlashSale[] {
  if (typeof window === 'undefined') return [];
  const sales = localStorage.getItem(STORAGE_KEY);
  return sales ? JSON.parse(sales) : [];
}

// Get flash sale by ID
export function getFlashSaleById(id: string): FlashSale | null {
  const sales = getAllFlashSales();
  return sales.find(sale => sale.id === id) || null;
}

// Save flash sale
export function saveFlashSale(sale: Omit<FlashSale, 'id' | 'createdAt' | 'status'>): FlashSale {
  const sales = getAllFlashSales();
  const now = new Date().toISOString();
  const startDate = new Date(sale.startDate);
  const currentDate = new Date();
  
  const newSale: FlashSale = {
    ...sale,
    id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: startDate > currentDate ? 'scheduled' : 'active',
    createdAt: now,
    stockRemaining: sale.stockLimit,
    totalRevenue: 0,
    totalItemsSold: 0,
  };

  sales.push(newSale);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  
  return newSale;
}

// Update flash sale
export function updateFlashSale(id: string, updates: Partial<FlashSale>): FlashSale | null {
  const sales = getAllFlashSales();
  const index = sales.findIndex(sale => sale.id === id);
  
  if (index === -1) return null;
  
  sales[index] = { ...sales[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  
  return sales[index];
}

// Delete flash sale
export function deleteFlashSale(id: string): boolean {
  const sales = getAllFlashSales();
  const filtered = sales.filter(sale => sale.id !== id);
  
  if (filtered.length === sales.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Get active flash sales
export function getActiveFlashSales(): FlashSale[] {
  const sales = getAllFlashSales();
  const now = new Date();
  
  return sales.filter(sale => {
    if (sale.status === 'cancelled' || sale.status === 'ended') return false;
    
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    
    return now >= start && now <= end;
  });
}

// Get scheduled flash sales
export function getScheduledFlashSales(): FlashSale[] {
  const sales = getAllFlashSales();
  const now = new Date();
  
  return sales.filter(sale => {
    if (sale.status === 'cancelled' || sale.status === 'ended') return false;
    
    const start = new Date(sale.startDate);
    return now < start;
  });
}

// Update sale statuses (should be called periodically)
export function updateSaleStatuses(): void {
  const sales = getAllFlashSales();
  const now = new Date();
  let updated = false;
  
  sales.forEach(sale => {
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    
    if (sale.status === 'scheduled' && now >= start && now <= end) {
      sale.status = 'active';
      updated = true;
    } else if (sale.status === 'active' && now > end) {
      sale.status = 'ended';
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  }
}

// Calculate sale price for a product
export function calculateSalePrice(originalPrice: number, sale: FlashSale): number {
  let discount = 0;
  
  if (sale.discountType === 'percentage') {
    discount = originalPrice * (sale.discountValue / 100);
  } else {
    discount = sale.discountValue;
  }
  
  // Apply max discount cap if specified
  if (sale.maxDiscountAmount && discount > sale.maxDiscountAmount) {
    discount = sale.maxDiscountAmount;
  }
  
  const salePrice = originalPrice - discount;
  return Math.max(salePrice, 0); // Ensure price doesn't go negative
}

// Check if product is on sale
export function getProductSale(productId: number): FlashSale | null {
  const activeSales = getActiveFlashSales();
  
  // Return the first active sale that includes this product
  // Could be enhanced to return the best sale if multiple apply
  return activeSales.find(sale => sale.productIds.includes(productId)) || null;
}

// Get flash sale products with pricing
export function getFlashSaleProducts(sale: FlashSale, allProducts: any[]): FlashSaleProduct[] {
  return sale.productIds
    .map(productId => {
      const product = allProducts.find(p => p.id === productId);
      if (!product) return null;
      
      const salePrice = calculateSalePrice(product.price, sale);
      const discountPercentage = Math.round(((product.price - salePrice) / product.price) * 100);
      
      return {
        productId: product.id,
        productName: product.name,
        originalPrice: product.price,
        salePrice,
        discountPercentage,
        stockRemaining: sale.stockRemaining,
        image: product.image,
      };
    })
    .filter(Boolean) as FlashSaleProduct[];
}

// Calculate time remaining for a sale
export function calculateTimeRemaining(endDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const end = new Date(endDate).getTime();
  const now = new Date().getTime();
  const total = Math.max(end - now, 0);
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, total };
}

// Get active deals with products and countdown
export function getActiveDeals(allProducts: any[]): ActiveDeal[] {
  const activeSales = getActiveFlashSales();
  
  return activeSales.map(sale => {
    const products = getFlashSaleProducts(sale, allProducts);
    const timeRemaining = calculateTimeRemaining(sale.endDate);
    const isExpiringSoon = timeRemaining.total < 24 * 60 * 60 * 1000; // Less than 24 hours
    
    return {
      sale,
      products,
      timeRemaining,
      isExpiringSoon,
    };
  });
}

// Track sale purchase
export function trackSalePurchase(saleId: string, itemCount: number, revenue: number): void {
  const sale = getFlashSaleById(saleId);
  if (!sale) return;
  
  const updates: Partial<FlashSale> = {
    totalItemsSold: (sale.totalItemsSold || 0) + itemCount,
    totalRevenue: (sale.totalRevenue || 0) + revenue,
  };
  
  // Update stock if limited
  if (sale.stockLimit && sale.stockRemaining !== undefined) {
    updates.stockRemaining = Math.max(sale.stockRemaining - itemCount, 0);
  }
  
  updateFlashSale(saleId, updates);
}

// Get flash sale statistics
export function getFlashSaleStats(): FlashSaleStats {
  const sales = getAllFlashSales();
  
  const stats: FlashSaleStats = {
    totalSales: sales.length,
    activeSales: sales.filter(s => s.status === 'active').length,
    scheduledSales: sales.filter(s => s.status === 'scheduled').length,
    endedSales: sales.filter(s => s.status === 'ended').length,
    totalRevenue: sales.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
    totalItemsSold: sales.reduce((sum, s) => sum + (s.totalItemsSold || 0), 0),
    conversionRate: 0, // Would need view tracking to calculate accurately
  };
  
  return stats;
}

// Send sale notification (simulated)
export function sendSaleNotification(
  sale: FlashSale,
  type: SaleNotification['type'],
  recipients: string[]
): SaleNotification {
  const messages = {
    upcoming: `${sale.name} starts in 24 hours! Get ready for amazing deals.`,
    started: `${sale.name} is now live! Don't miss out on up to ${sale.discountValue}${sale.discountType === 'percentage' ? '%' : ' KSH'} off!`,
    ending_soon: `Last chance! ${sale.name} ends soon. Grab your deals now!`,
    ended: `${sale.name} has ended. Stay tuned for more amazing deals!`,
  };
  
  const notification: SaleNotification = {
    id: `notif_${Date.now()}`,
    saleId: sale.id,
    saleName: sale.name,
    type,
    message: messages[type],
    sentAt: new Date().toISOString(),
    recipients,
  };
  
  // Store notification
  const notifications = getAllSaleNotifications();
  notifications.push(notification);
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  
  // Simulate sending (in production, this would call an API)
  console.log('📧 Sale Notification Sent:', {
    type,
    message: notification.message,
    recipients: recipients.length,
  });
  
  return notification;
}

// Get all sale notifications
export function getAllSaleNotifications(): SaleNotification[] {
  if (typeof window === 'undefined') return [];
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  return notifications ? JSON.parse(notifications) : [];
}

// Check for sales that need notifications
export function checkAndSendNotifications(): void {
  const sales = getAllFlashSales();
  const now = new Date();
  const notifications = getAllSaleNotifications();
  
  // Get all users (would normally come from user service)
  const users = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('reyah_users') || '[]')
    : [];
  const recipients = users.map((u: any) => u.email).filter(Boolean);
  
  if (recipients.length === 0) return;
  
  sales.forEach(sale => {
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    const timeUntilStart = start.getTime() - now.getTime();
    const timeUntilEnd = end.getTime() - now.getTime();
    
    // Check if we already sent this notification
    const alreadySent = (type: SaleNotification['type']) =>
      notifications.some(n => n.saleId === sale.id && n.type === type);
    
    // Send "upcoming" notification 24 hours before start
    if (timeUntilStart > 0 && timeUntilStart < 24 * 60 * 60 * 1000 && !alreadySent('upcoming')) {
      sendSaleNotification(sale, 'upcoming', recipients);
    }
    
    // Send "started" notification when sale begins
    if (sale.status === 'active' && !alreadySent('started')) {
      sendSaleNotification(sale, 'started', recipients);
    }
    
    // Send "ending_soon" notification 2 hours before end
    if (sale.status === 'active' && timeUntilEnd > 0 && timeUntilEnd < 2 * 60 * 60 * 1000 && !alreadySent('ending_soon')) {
      sendSaleNotification(sale, 'ending_soon', recipients);
    }
    
    // Send "ended" notification when sale ends
    if (sale.status === 'ended' && !alreadySent('ended')) {
      sendSaleNotification(sale, 'ended', recipients);
    }
  });
}
