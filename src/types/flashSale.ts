export interface FlashSale {
  id: string;
  name: string;
  description: string;
  type: 'flash_sale' | 'daily_deal' | 'limited_offer';
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g., 20 for 20%) or fixed amount
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  productIds: number[]; // Products included in the sale
  categoryIds?: string[]; // Optional: Categories included
  minPurchaseAmount?: number; // Optional: Minimum purchase requirement
  maxDiscountAmount?: number; // Optional: Maximum discount cap
  stockLimit?: number; // Optional: Limited quantity available
  stockRemaining?: number; // Tracks remaining stock
  totalRevenue?: number; // Revenue generated
  totalItemsSold?: number; // Items sold during sale
  createdAt: string;
  createdBy: string; // Admin user ID
}

export interface FlashSaleProduct {
  productId: number;
  productName: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  stockRemaining?: number;
  image?: string;
}

export interface ActiveDeal {
  sale: FlashSale;
  products: FlashSaleProduct[];
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number; // total milliseconds
  };
  isExpiringSoon: boolean; // Less than 24 hours remaining
}

export interface FlashSaleStats {
  totalSales: number;
  activeSales: number;
  scheduledSales: number;
  endedSales: number;
  totalRevenue: number;
  totalItemsSold: number;
  conversionRate: number; // Percentage of viewers who purchased
}

export interface SaleNotification {
  id: string;
  saleId: string;
  saleName: string;
  type: 'upcoming' | 'started' | 'ending_soon' | 'ended';
  message: string;
  sentAt: string;
  recipients: string[]; // User IDs or email addresses
}
