import {
  SalesMetrics,
  SalesTrend,
  ProductPerformance,
  CustomerInsight,
  InventoryMetrics,
  CategoryPerformance,
  AnalyticsAlert,
  SellerAnalyticsPermissions,
  ExportData,
  ChartData,
  SalesMilestone,
  CompetitorMetric,
} from '@/types/analytics';

// Storage Keys
const STORAGE_KEYS = {
  ANALYTICS_SALES: 'reyah_analytics_sales',
  ANALYTICS_PRODUCTS: 'reyah_analytics_products',
  ANALYTICS_CUSTOMERS: 'reyah_analytics_customers',
  ANALYTICS_ALERTS: 'reyah_analytics_alerts',
  ANALYTICS_PERMISSIONS: 'reyah_analytics_permissions',
  ANALYTICS_MILESTONES: 'reyah_analytics_milestones',
} as const;

// Helper function to get date range
export function getDateRange(period: '7d' | '30d' | '90d' | '1y' | 'all'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  
  switch (period) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2020, 0, 1);
      break;
  }
  
  return { start, end };
}

// Generate mock sales data (replace with real data from your backend)
function generateMockSalesData(sellerId: string, period: '7d' | '30d' | '90d' | '1y' | 'all') {
  const { start, end } = getDateRange(period);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const data: SalesTrend[] = [];
  const currentDate = new Date(start);
  
  for (let i = 0; i < days; i++) {
    const revenue = Math.floor(Math.random() * 5000) + 1000;
    const orders = Math.floor(Math.random() * 50) + 10;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      revenue,
      orders,
      units: orders * (Math.floor(Math.random() * 3) + 1),
      label: formatDateLabel(currentDate, period),
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}

function formatDateLabel(date: Date, period: '7d' | '30d' | '90d' | '1y' | 'all'): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (period === '7d') {
    return days[date.getDay()];
  } else if (period === '30d' || period === '90d') {
    return `${months[date.getMonth()]} ${date.getDate()}`;
  } else {
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }
}

// Calculate sales metrics
export function calculateSalesMetrics(
  sellerId: string,
  period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
): SalesMetrics {
  const salesData = generateMockSalesData(sellerId, period);
  
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const totalUnits = salesData.reduce((sum, day) => sum + day.units, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Calculate previous period for comparison
  const previousPeriodData = generateMockSalesData(sellerId, period);
  const prevRevenue = previousPeriodData.reduce((sum, day) => sum + day.revenue * 0.85, 0);
  const prevOrders = previousPeriodData.reduce((sum, day) => sum + day.orders * 0.90, 0);
  const prevUnits = previousPeriodData.reduce((sum, day) => sum + day.units * 0.88, 0);
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;
  
  return {
    totalRevenue,
    totalOrders,
    totalUnits,
    averageOrderValue,
    conversionRate: Math.random() * 5 + 2, // 2-7%
    period,
    previousPeriod: {
      totalRevenue: prevRevenue,
      totalOrders: prevOrders,
      totalUnits: prevUnits,
      averageOrderValue: prevAov,
    },
    growth: {
      revenue: ((totalRevenue - prevRevenue) / prevRevenue) * 100,
      orders: ((totalOrders - prevOrders) / prevOrders) * 100,
      units: ((totalUnits - prevUnits) / prevUnits) * 100,
      aov: ((averageOrderValue - prevAov) / prevAov) * 100,
    },
  };
}

// Get sales trends
export function getSalesTrends(
  sellerId: string,
  period: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
): SalesTrend[] {
  return generateMockSalesData(sellerId, period);
}

// Calculate product performance
export function calculateProductPerformance(sellerId: string): ProductPerformance[] {
  const products = [
    { id: '1', name: 'African Print Dress', category: 'Clothing' },
    { id: '2', name: 'Beaded Necklace', category: 'Jewelry' },
    { id: '3', name: 'Handwoven Basket', category: 'Home Decor' },
    { id: '4', name: 'Kente Cloth Scarf', category: 'Accessories' },
    { id: '5', name: 'Wooden Sculpture', category: 'Art' },
  ];
  
  return products.map((product) => {
    const revenue = Math.floor(Math.random() * 10000) + 2000;
    const unitsSold = Math.floor(Math.random() * 100) + 20;
    const ordersCount = Math.floor(Math.random() * 80) + 15;
    const viewCount = Math.floor(Math.random() * 1000) + 200;
    const stockLevel = Math.floor(Math.random() * 50) + 5;
    
    return {
      productId: product.id,
      productName: product.name,
      category: product.category,
      revenue,
      unitsSold,
      ordersCount,
      averagePrice: revenue / unitsSold,
      stockLevel,
      viewCount,
      conversionRate: (ordersCount / viewCount) * 100,
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      trendPercentage: Math.random() * 30 - 10,
    } as ProductPerformance;
  });
}

// Get top performing products
export function getTopProducts(sellerId: string, limit: number = 5): ProductPerformance[] {
  const products = calculateProductPerformance(sellerId);
  return products
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// Calculate customer insights
export function calculateCustomerInsights(sellerId: string): CustomerInsight {
  const totalCustomers = Math.floor(Math.random() * 500) + 100;
  const newCustomers = Math.floor(Math.random() * 100) + 20;
  const returningCustomers = totalCustomers - newCustomers;
  
  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    averageLifetimeValue: Math.floor(Math.random() * 1000) + 200,
    repeatPurchaseRate: (returningCustomers / totalCustomers) * 100,
    topCustomers: [
      {
        customerId: '1',
        customerName: 'Amara Okafor',
        email: 'amara@example.com',
        totalSpent: 5420,
        ordersCount: 12,
        lastOrderDate: '2024-01-15',
      },
      {
        customerId: '2',
        customerName: 'Kwame Mensah',
        email: 'kwame@example.com',
        totalSpent: 4890,
        ordersCount: 10,
        lastOrderDate: '2024-01-10',
      },
      {
        customerId: '3',
        customerName: 'Fatima Ibrahim',
        email: 'fatima@example.com',
        totalSpent: 3750,
        ordersCount: 8,
        lastOrderDate: '2024-01-08',
      },
    ],
    customersByRegion: [
      { region: 'Nairobi', count: 120, revenue: 45000 },
      { region: 'Lagos', count: 95, revenue: 38000 },
      { region: 'Accra', count: 80, revenue: 32000 },
      { region: 'Kampala', count: 65, revenue: 25000 },
    ],
  };
}

// Calculate inventory metrics
export function calculateInventoryMetrics(sellerId: string): InventoryMetrics {
  const totalProducts = 25;
  const lowStock = 5;
  const outOfStock = 2;
  const inStock = totalProducts - outOfStock;
  
  return {
    totalProducts,
    inStock,
    lowStock,
    outOfStock,
    totalInventoryValue: Math.floor(Math.random() * 50000) + 20000,
    averageStockLevel: Math.floor(Math.random() * 30) + 15,
    stockTurnoverRate: Math.random() * 3 + 2, // 2-5 times per period
    lowStockProducts: [
      {
        productId: '1',
        productName: 'African Print Dress',
        currentStock: 3,
        threshold: 10,
        status: 'critical',
      },
      {
        productId: '2',
        productName: 'Beaded Necklace',
        currentStock: 7,
        threshold: 15,
        status: 'low',
      },
      {
        productId: '3',
        productName: 'Handwoven Basket',
        currentStock: 12,
        threshold: 20,
        status: 'warning',
      },
    ],
  };
}

// Calculate category performance
export function calculateCategoryPerformance(sellerId: string): CategoryPerformance[] {
  const categories = [
    { name: 'Clothing', base: 40 },
    { name: 'Jewelry', base: 25 },
    { name: 'Home Decor', base: 20 },
    { name: 'Accessories', base: 10 },
    { name: 'Art', base: 5 },
  ];
  
  const totalRevenue = categories.reduce((sum, cat) => sum + cat.base * 1000, 0);
  
  return categories.map((cat) => {
    const revenue = cat.base * 1000 + Math.random() * 5000;
    const ordersCount = Math.floor(Math.random() * 100) + 20;
    
    return {
      category: cat.name,
      revenue,
      ordersCount,
      unitsSold: ordersCount * (Math.floor(Math.random() * 3) + 1),
      averagePrice: Math.floor(Math.random() * 100) + 50,
      conversionRate: Math.random() * 5 + 2,
      percentage: (revenue / totalRevenue) * 100,
    };
  });
}

// Get analytics alerts
export function getAnalyticsAlerts(sellerId: string): AnalyticsAlert[] {
  const storedAlerts = localStorage.getItem(STORAGE_KEYS.ANALYTICS_ALERTS);
  if (storedAlerts) {
    return JSON.parse(storedAlerts);
  }
  
  const defaultAlerts: AnalyticsAlert[] = [
    {
      id: '1',
      type: 'low_stock',
      severity: 'critical',
      title: 'Critical Stock Level',
      message: 'African Print Dress is running critically low (3 units remaining)',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/seller/inventory',
      metadata: { productId: '1', value: 3 },
    },
    {
      id: '2',
      type: 'trending_product',
      severity: 'info',
      title: 'Trending Product',
      message: 'Beaded Necklace is trending! 45% increase in views this week',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      actionUrl: '/seller/products/2',
      metadata: { productId: '2', value: 45 },
    },
    {
      id: '3',
      type: 'sales_milestone',
      severity: 'info',
      title: 'Sales Milestone Reached',
      message: 'Congratulations! You\'ve reached KES 50,000 in sales this month',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      read: false,
      metadata: { value: 50000 },
    },
  ];
  
  localStorage.setItem(STORAGE_KEYS.ANALYTICS_ALERTS, JSON.stringify(defaultAlerts));
  return defaultAlerts;
}

// Mark alert as read
export function markAlertAsRead(alertId: string): void {
  const alerts = getAnalyticsAlerts('');
  const updatedAlerts = alerts.map((alert) =>
    alert.id === alertId ? { ...alert, read: true } : alert
  );
  localStorage.setItem(STORAGE_KEYS.ANALYTICS_ALERTS, JSON.stringify(updatedAlerts));
}

// Delete alert
export function deleteAlert(alertId: string): void {
  const alerts = getAnalyticsAlerts('');
  const filteredAlerts = alerts.filter((alert) => alert.id !== alertId);
  localStorage.setItem(STORAGE_KEYS.ANALYTICS_ALERTS, JSON.stringify(filteredAlerts));
}

// Get seller permissions
export function getSellerPermissions(sellerId: string): SellerAnalyticsPermissions {
  const storedPermissions = localStorage.getItem(STORAGE_KEYS.ANALYTICS_PERMISSIONS);
  if (storedPermissions) {
    const allPermissions = JSON.parse(storedPermissions);
    return allPermissions.find((p: SellerAnalyticsPermissions) => p.sellerId === sellerId) || getDefaultPermissions(sellerId);
  }
  
  return getDefaultPermissions(sellerId);
}

function getDefaultPermissions(sellerId: string): SellerAnalyticsPermissions {
  return {
    sellerId,
    sellerName: 'Demo Seller',
    canViewSales: true,
    canViewCustomers: true,
    canViewInventory: true,
    canExportData: true,
    canViewAdvancedMetrics: true,
    maxDataRange: 'all',
    enabledFeatures: {
      salesTrends: true,
      productPerformance: true,
      customerInsights: true,
      inventoryAlerts: true,
      competitorAnalysis: true,
    },
    updatedBy: 'system',
    updatedAt: new Date(),
  };
}

// Update seller permissions
export function updateSellerPermissions(permissions: SellerAnalyticsPermissions): void {
  const storedPermissions = localStorage.getItem(STORAGE_KEYS.ANALYTICS_PERMISSIONS);
  let allPermissions: SellerAnalyticsPermissions[] = storedPermissions ? JSON.parse(storedPermissions) : [];
  
  const index = allPermissions.findIndex((p) => p.sellerId === permissions.sellerId);
  if (index >= 0) {
    allPermissions[index] = permissions;
  } else {
    allPermissions.push(permissions);
  }
  
  localStorage.setItem(STORAGE_KEYS.ANALYTICS_PERMISSIONS, JSON.stringify(allPermissions));
}

// Get sales milestones
export function getSalesMilestones(sellerId: string): SalesMilestone[] {
  const metrics = calculateSalesMetrics(sellerId, '30d');
  
  return [
    {
      id: '1',
      type: 'revenue',
      threshold: 50000,
      title: 'Revenue Champion',
      description: 'Reach KES 50,000 in monthly sales',
      achieved: metrics.totalRevenue >= 50000,
      achievedAt: metrics.totalRevenue >= 50000 ? new Date() : undefined,
      progress: (metrics.totalRevenue / 50000) * 100,
      icon: '💰',
    },
    {
      id: '2',
      type: 'orders',
      threshold: 100,
      title: 'Order Master',
      description: 'Complete 100 orders in a month',
      achieved: metrics.totalOrders >= 100,
      achievedAt: metrics.totalOrders >= 100 ? new Date() : undefined,
      progress: (metrics.totalOrders / 100) * 100,
      icon: '📦',
    },
    {
      id: '3',
      type: 'units',
      threshold: 500,
      title: 'Sales Hero',
      description: 'Sell 500 units in a month',
      achieved: metrics.totalUnits >= 500,
      achievedAt: metrics.totalUnits >= 500 ? new Date() : undefined,
      progress: (metrics.totalUnits / 500) * 100,
      icon: '🎯',
    },
    {
      id: '4',
      type: 'customers',
      threshold: 50,
      title: 'Customer Magnet',
      description: 'Gain 50 new customers in a month',
      achieved: false,
      progress: 64,
      icon: '👥',
    },
  ];
}

// Get competitor metrics
export function getCompetitorMetrics(sellerId: string): CompetitorMetric[] {
  return [
    {
      category: 'Clothing',
      averagePrice: 1850,
      topSellingPrice: 2200,
      marketShare: 12.5,
      yourPosition: 3,
      totalSellers: 24,
      recommendations: [
        'Consider pricing slightly above average to position as premium',
        'Bundle products to increase average order value',
      ],
    },
    {
      category: 'Jewelry',
      averagePrice: 950,
      topSellingPrice: 1100,
      marketShare: 18.2,
      yourPosition: 2,
      totalSellers: 18,
      recommendations: [
        'You\'re performing well in this category',
        'Expand product range to capture more market share',
      ],
    },
  ];
}

// Export data to CSV
export function exportToCSV(data: ExportData, sellerId: string): string {
  let csvContent = '';
  
  if (data.type === 'sales') {
    const salesData = getSalesTrends(sellerId, '30d');
    csvContent = 'Date,Revenue,Orders,Units\n';
    salesData.forEach((day) => {
      csvContent += `${day.date},${day.revenue},${day.orders},${day.units}\n`;
    });
  } else if (data.type === 'products') {
    const products = calculateProductPerformance(sellerId);
    csvContent = 'Product Name,Category,Revenue,Units Sold,Orders,Stock Level,Conversion Rate\n';
    products.forEach((product) => {
      csvContent += `${product.productName},${product.category},${product.revenue},${product.unitsSold},${product.ordersCount},${product.stockLevel},${product.conversionRate.toFixed(2)}%\n`;
    });
  } else if (data.type === 'customers') {
    const insights = calculateCustomerInsights(sellerId);
    csvContent = 'Customer Name,Email,Total Spent,Orders,Last Order Date\n';
    insights.topCustomers.forEach((customer) => {
      csvContent += `${customer.customerName},${customer.email},${customer.totalSpent},${customer.ordersCount},${customer.lastOrderDate}\n`;
    });
  }
  
  return csvContent;
}

// Convert data to chart format
export function convertToChartData(data: SalesTrend[], type: 'revenue' | 'orders' | 'units'): ChartData {
  return {
    labels: data.map((d) => d.label || d.date),
    datasets: [
      {
        label: type === 'revenue' ? 'Revenue (KES)' : type === 'orders' ? 'Orders' : 'Units',
        data: data.map((d) => type === 'revenue' ? d.revenue : type === 'orders' ? d.orders : d.units),
        backgroundColor: type === 'revenue' ? 'rgba(59, 130, 246, 0.5)' : type === 'orders' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)',
        borderColor: type === 'revenue' ? 'rgb(59, 130, 246)' : type === 'orders' ? 'rgb(16, 185, 129)' : 'rgb(245, 158, 11)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };
}

export function convertCategoryToChartData(data: CategoryPerformance[]): ChartData {
  return {
    labels: data.map((c) => c.category),
    datasets: [
      {
        label: 'Revenue by Category',
        data: data.map((c) => c.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };
}
