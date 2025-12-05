// Analytics Types for Sellers

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  averageOrderValue: number;
  conversionRate: number;
  period: '7d' | '30d' | '90d' | '1y' | 'all';
  previousPeriod?: {
    totalRevenue: number;
    totalOrders: number;
    totalUnits: number;
    averageOrderValue: number;
  };
  growth?: {
    revenue: number; // percentage
    orders: number;
    units: number;
    aov: number;
  };
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orders: number;
  units: number;
  label?: string; // e.g., "Mon", "Jan 1", etc.
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  revenue: number;
  unitsSold: number;
  ordersCount: number;
  averagePrice: number;
  stockLevel: number;
  viewCount: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface CustomerInsight {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageLifetimeValue: number;
  topCustomers: {
    customerId: string;
    customerName: string;
    email: string;
    totalSpent: number;
    ordersCount: number;
    lastOrderDate: string;
  }[];
  customersByRegion: {
    region: string;
    count: number;
    revenue: number;
  }[];
  repeatPurchaseRate: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventoryValue: number;
  averageStockLevel: number;
  stockTurnoverRate: number;
  lowStockProducts: {
    productId: string;
    productName: string;
    currentStock: number;
    threshold: number;
    status: 'critical' | 'low' | 'warning';
  }[];
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  ordersCount: number;
  unitsSold: number;
  averagePrice: number;
  conversionRate: number;
  percentage: number; // of total revenue
}

export interface AnalyticsAlert {
  id: string;
  type: 'low_stock' | 'trending_product' | 'sales_milestone' | 'new_review' | 'high_return_rate';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    productId?: string;
    orderId?: string;
    value?: number;
  };
}

export interface SellerAnalyticsPermissions {
  sellerId: string;
  sellerName: string;
  canViewSales: boolean;
  canViewCustomers: boolean;
  canViewInventory: boolean;
  canExportData: boolean;
  canViewAdvancedMetrics: boolean;
  maxDataRange: '7d' | '30d' | '90d' | '1y' | 'all';
  enabledFeatures: {
    salesTrends: boolean;
    productPerformance: boolean;
    customerInsights: boolean;
    inventoryAlerts: boolean;
    competitorAnalysis: boolean;
  };
  updatedBy: string;
  updatedAt: Date;
}

export interface ExportData {
  type: 'sales' | 'customers' | 'products' | 'inventory';
  format: 'csv' | 'json' | 'excel';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: {
    category?: string;
    status?: string;
    minValue?: number;
    maxValue?: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface SalesMilestone {
  id: string;
  type: 'revenue' | 'orders' | 'units' | 'customers';
  threshold: number;
  title: string;
  description: string;
  achieved: boolean;
  achievedAt?: Date;
  progress: number; // percentage
  icon: string;
}

export interface CompetitorMetric {
  category: string;
  averagePrice: number;
  topSellingPrice: number;
  marketShare: number;
  yourPosition: number;
  totalSellers: number;
  recommendations: string[];
}
