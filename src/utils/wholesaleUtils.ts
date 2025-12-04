import type { 
  WholesaleCustomer, 
  WholesaleApplication, 
  BulkPricingRule, 
  PricingTier,
  BulkOrder,
  BulkOrderItem,
  WholesaleStats,
  WholesaleStatus 
} from '@/types/wholesale';

// ===== WHOLESALE CUSTOMER MANAGEMENT =====

export function getAllWholesaleCustomers(): WholesaleCustomer[] {
  const customers = localStorage.getItem('reyah_wholesale_customers');
  return customers ? JSON.parse(customers) : [];
}

export function getWholesaleCustomer(id: string): WholesaleCustomer | null {
  const customers = getAllWholesaleCustomers();
  return customers.find(c => c.id === id) || null;
}

export function getWholesaleCustomerByUserId(userId: string): WholesaleCustomer | null {
  const customers = getAllWholesaleCustomers();
  return customers.find(c => c.userId === userId) || null;
}

export function saveWholesaleCustomer(customer: Omit<WholesaleCustomer, 'id' | 'createdAt' | 'updatedAt'>): WholesaleCustomer {
  const customers = getAllWholesaleCustomers();
  const newCustomer: WholesaleCustomer = {
    ...customer,
    id: `wholesale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  customers.push(newCustomer);
  localStorage.setItem('reyah_wholesale_customers', JSON.stringify(customers));
  return newCustomer;
}

export function updateWholesaleCustomer(id: string, updates: Partial<WholesaleCustomer>): WholesaleCustomer | null {
  const customers = getAllWholesaleCustomers();
  const index = customers.findIndex(c => c.id === id);
  
  if (index === -1) return null;
  
  customers[index] = {
    ...customers[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  localStorage.setItem('reyah_wholesale_customers', JSON.stringify(customers));
  return customers[index];
}

export function approveWholesaleCustomer(id: string, approvedBy: string): WholesaleCustomer | null {
  return updateWholesaleCustomer(id, {
    status: 'approved',
    approvedAt: new Date(),
    approvedBy,
  });
}

export function rejectWholesaleCustomer(id: string, reason: string): WholesaleCustomer | null {
  return updateWholesaleCustomer(id, {
    status: 'rejected',
    rejectedAt: new Date(),
    rejectionReason: reason,
  });
}

export function deleteWholesaleCustomer(id: string): boolean {
  const customers = getAllWholesaleCustomers();
  const filtered = customers.filter(c => c.id !== id);
  
  if (filtered.length === customers.length) return false;
  
  localStorage.setItem('reyah_wholesale_customers', JSON.stringify(filtered));
  return true;
}

// ===== WHOLESALE APPLICATIONS =====

export function getAllApplications(): WholesaleApplication[] {
  const applications = localStorage.getItem('reyah_wholesale_applications');
  return applications ? JSON.parse(applications) : [];
}

export function getApplication(id: string): WholesaleApplication | null {
  const applications = getAllApplications();
  return applications.find(a => a.id === id) || null;
}

export function submitWholesaleApplication(application: Omit<WholesaleApplication, 'id' | 'status' | 'submittedAt'>): WholesaleApplication {
  const applications = getAllApplications();
  const newApplication: WholesaleApplication = {
    ...application,
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    submittedAt: new Date(),
  };
  applications.push(newApplication);
  localStorage.setItem('reyah_wholesale_applications', JSON.stringify(applications));
  return newApplication;
}

export function updateApplication(id: string, updates: Partial<WholesaleApplication>): WholesaleApplication | null {
  const applications = getAllApplications();
  const index = applications.findIndex(a => a.id === id);
  
  if (index === -1) return null;
  
  applications[index] = {
    ...applications[index],
    ...updates,
  };
  
  localStorage.setItem('reyah_wholesale_applications', JSON.stringify(applications));
  return applications[index];
}

export function approveApplication(applicationId: string, approvedBy: string, customerDetails?: Partial<WholesaleCustomer>): { application: WholesaleApplication; customer: WholesaleCustomer } | null {
  const application = getApplication(applicationId);
  if (!application) return null;
  
  // Update application status
  const updatedApplication = updateApplication(applicationId, {
    status: 'approved',
    reviewedAt: new Date(),
    reviewedBy: approvedBy,
  });
  
  if (!updatedApplication) return null;
  
  // Create wholesale customer
  const customer = saveWholesaleCustomer({
    userId: application.userId,
    businessName: application.businessName,
    businessType: application.businessType,
    taxId: application.taxId,
    businessAddress: application.businessAddress,
    contactName: application.contactName,
    contactEmail: application.contactEmail,
    contactPhone: application.contactPhone,
    status: 'approved',
    approvedAt: new Date(),
    approvedBy,
    ...customerDetails,
  });
  
  return { application: updatedApplication, customer };
}

export function rejectApplication(applicationId: string, reviewedBy: string, reviewNotes: string): WholesaleApplication | null {
  return updateApplication(applicationId, {
    status: 'rejected',
    reviewedAt: new Date(),
    reviewedBy,
    reviewNotes,
  });
}

// ===== BULK PRICING RULES =====

export function getAllPricingRules(): BulkPricingRule[] {
  const rules = localStorage.getItem('reyah_bulk_pricing_rules');
  return rules ? JSON.parse(rules) : [];
}

export function getPricingRule(id: string): BulkPricingRule | null {
  const rules = getAllPricingRules();
  return rules.find(r => r.id === id) || null;
}

export function getProductPricingRules(productId: number): BulkPricingRule[] {
  const rules = getAllPricingRules();
  const now = new Date();
  
  return rules.filter(rule => {
    if (!rule.isActive) return false;
    if (rule.startDate && new Date(rule.startDate) > now) return false;
    if (rule.endDate && new Date(rule.endDate) < now) return false;
    return rule.productIds.includes(productId);
  });
}

export function savePricingRule(rule: Omit<BulkPricingRule, 'id' | 'createdAt' | 'updatedAt'>): BulkPricingRule {
  const rules = getAllPricingRules();
  const newRule: BulkPricingRule = {
    ...rule,
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  rules.push(newRule);
  localStorage.setItem('reyah_bulk_pricing_rules', JSON.stringify(rules));
  return newRule;
}

export function updatePricingRule(id: string, updates: Partial<BulkPricingRule>): BulkPricingRule | null {
  const rules = getAllPricingRules();
  const index = rules.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  rules[index] = {
    ...rules[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  localStorage.setItem('reyah_bulk_pricing_rules', JSON.stringify(rules));
  return rules[index];
}

export function deletePricingRule(id: string): boolean {
  const rules = getAllPricingRules();
  const filtered = rules.filter(r => r.id !== id);
  
  if (filtered.length === rules.length) return false;
  
  localStorage.setItem('reyah_bulk_pricing_rules', JSON.stringify(filtered));
  return true;
}

// ===== PRICING CALCULATIONS =====

export function calculateTieredPrice(basePrice: number, quantity: number, productId: number, isWholesale: boolean = false): {
  unitPrice: number;
  subtotal: number;
  tier?: PricingTier;
  savings: number;
  savingsPercentage: number;
} {
  const rules = getProductPricingRules(productId);
  
  // Filter rules based on wholesale status
  const applicableRules = rules.filter(rule => !rule.wholesaleOnly || isWholesale);
  
  if (applicableRules.length === 0) {
    return {
      unitPrice: basePrice,
      subtotal: basePrice * quantity,
      savings: 0,
      savingsPercentage: 0,
    };
  }
  
  // Find best matching tier across all applicable rules
  interface TierCandidate {
    pricePerUnit: number;
    minQuantity: number;
    maxQuantity?: number;
    discountPercentage: number;
    savings: number;
    ruleId: string;
  }
  
  let bestTier: TierCandidate | null = null;
  
  for (const rule of applicableRules) {
    const matchingTiers = rule.tiers
      .filter(tier => quantity >= tier.minQuantity && (!tier.maxQuantity || quantity <= tier.maxQuantity));
    
    if (matchingTiers.length > 0) {
      // Create a copy before sorting to avoid mutation
      const sortedTiers = [...matchingTiers].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
      const cheapestTier = sortedTiers[0];
      
      if (cheapestTier && (!bestTier || cheapestTier.pricePerUnit < bestTier.pricePerUnit)) {
        bestTier = {
          pricePerUnit: cheapestTier.pricePerUnit,
          minQuantity: cheapestTier.minQuantity,
          maxQuantity: cheapestTier.maxQuantity,
          discountPercentage: cheapestTier.discountPercentage,
          savings: cheapestTier.savings,
          ruleId: rule.id,
        };
      }
    }
  }
  
  if (bestTier !== null) {
    const unitPrice = bestTier.pricePerUnit;
    const subtotal = unitPrice * quantity;
    const savings = (basePrice - unitPrice) * quantity;
    const savingsPercentage = ((basePrice - unitPrice) / basePrice) * 100;
    
    const completeTier: PricingTier = {
      id: `tier_${bestTier.ruleId}_${bestTier.minQuantity}`,
      productId,
      minQuantity: bestTier.minQuantity,
      maxQuantity: bestTier.maxQuantity,
      pricePerUnit: bestTier.pricePerUnit,
      discountPercentage: bestTier.discountPercentage,
      savings: basePrice - unitPrice,
    };
    
    return {
      unitPrice,
      subtotal,
      tier: completeTier,
      savings,
      savingsPercentage,
    };
  }
  
  return {
    unitPrice: basePrice,
    subtotal: basePrice * quantity,
    savings: 0,
    savingsPercentage: 0,
  };
}

export function getProductPricingTiers(productId: number, basePrice: number, isWholesale: boolean = false): PricingTier[] {
  const rules = getProductPricingRules(productId);
  const applicableRules = rules.filter(rule => !rule.wholesaleOnly || isWholesale);
  
  if (applicableRules.length === 0) return [];
  
  // Collect all tiers from applicable rules
  const allTiers: PricingTier[] = [];
  
  applicableRules.forEach(rule => {
    rule.tiers.forEach(tier => {
      allTiers.push({
        id: `tier_${rule.id}_${tier.minQuantity}`,
        productId,
        ...tier,
        savings: basePrice - tier.pricePerUnit,
      });
    });
  });
  
  // Merge overlapping tiers, keeping the best price
  const mergedTiers: Map<number, PricingTier> = new Map();
  
  allTiers.forEach(tier => {
    const existing = mergedTiers.get(tier.minQuantity);
    if (!existing || tier.pricePerUnit < existing.pricePerUnit) {
      mergedTiers.set(tier.minQuantity, tier);
    }
  });
  
  return Array.from(mergedTiers.values()).sort((a, b) => a.minQuantity - b.minQuantity);
}

// ===== BULK ORDERS =====

export function getAllBulkOrders(): BulkOrder[] {
  const orders = localStorage.getItem('reyah_bulk_orders');
  return orders ? JSON.parse(orders) : [];
}

export function getBulkOrder(id: string): BulkOrder | null {
  const orders = getAllBulkOrders();
  return orders.find(o => o.id === id) || null;
}

export function getCustomerBulkOrders(customerId: string): BulkOrder[] {
  const orders = getAllBulkOrders();
  return orders.filter(o => o.customerId === customerId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createBulkOrder(
  customerId: string,
  customerName: string,
  isWholesale: boolean,
  items: { productId: number; productName: string; quantity: number; basePrice: number }[],
  wholesaleDiscountPercentage: number = 0
): BulkOrder {
  const orderItems: BulkOrderItem[] = items.map(item => {
    const pricing = calculateTieredPrice(item.basePrice, item.quantity, item.productId, isWholesale);
    
    return {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: pricing.unitPrice,
      tierApplied: pricing.tier,
      subtotal: pricing.subtotal,
      savings: pricing.savings,
    };
  });
  
  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const volumeDiscount = orderItems.reduce((sum, item) => sum + item.savings, 0);
  const wholesaleDiscount = isWholesale ? (subtotal * wholesaleDiscountPercentage / 100) : 0;
  const totalSavings = volumeDiscount + wholesaleDiscount;
  const totalAmount = subtotal - wholesaleDiscount;
  
  const order: BulkOrder = {
    id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    customerName,
    isWholesale,
    items: orderItems,
    subtotal,
    wholesaleDiscount,
    volumeDiscount,
    totalSavings,
    totalAmount,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const orders = getAllBulkOrders();
  orders.push(order);
  localStorage.setItem('reyah_bulk_orders', JSON.stringify(orders));
  
  return order;
}

export function updateBulkOrder(id: string, updates: Partial<BulkOrder>): BulkOrder | null {
  const orders = getAllBulkOrders();
  const index = orders.findIndex(o => o.id === id);
  
  if (index === -1) return null;
  
  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  localStorage.setItem('reyah_bulk_orders', JSON.stringify(orders));
  return orders[index];
}

export function confirmBulkOrder(id: string): BulkOrder | null {
  return updateBulkOrder(id, {
    status: 'confirmed',
    confirmedAt: new Date(),
  });
}

export function shipBulkOrder(id: string): BulkOrder | null {
  return updateBulkOrder(id, {
    status: 'shipped',
    shippedAt: new Date(),
  });
}

// ===== STATISTICS =====

export function getWholesaleStats(): WholesaleStats {
  const customers = getAllWholesaleCustomers();
  const orders = getAllBulkOrders();
  
  const totalCustomers = customers.length;
  const pendingApplications = getAllApplications().filter(a => a.status === 'pending').length;
  const approvedCustomers = customers.filter(c => c.status === 'approved').length;
  const totalBulkOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue = totalBulkOrders > 0 ? totalRevenue / totalBulkOrders : 0;
  
  // Calculate top products
  const productMap = new Map<number, { name: string; quantity: number; revenue: number }>();
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        productMap.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.subtotal,
        });
      }
    });
  });
  
  const topProducts = Array.from(productMap.entries())
    .map(([productId, data]) => ({
      productId,
      productName: data.name,
      quantitySold: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  return {
    totalCustomers,
    pendingApplications,
    approvedCustomers,
    totalBulkOrders,
    totalRevenue,
    averageOrderValue,
    topProducts,
  };
}

// ===== HELPER FUNCTIONS =====

export function isWholesaleCustomer(userId: string): boolean {
  const customer = getWholesaleCustomerByUserId(userId);
  return customer !== null && customer.status === 'approved';
}

export function getWholesaleDiscount(userId: string): number {
  const customer = getWholesaleCustomerByUserId(userId);
  return customer?.discountPercentage || 0;
}

export function canPlaceBulkOrder(userId: string, orderValue: number): { allowed: boolean; reason?: string } {
  const customer = getWholesaleCustomerByUserId(userId);
  
  if (!customer) {
    return { allowed: true }; // Non-wholesale customers can still place bulk orders
  }
  
  if (customer.status === 'suspended') {
    return { allowed: false, reason: 'Wholesale account is suspended' };
  }
  
  if (customer.status !== 'approved') {
    return { allowed: false, reason: 'Wholesale account not approved' };
  }
  
  if (customer.minOrderValue && orderValue < customer.minOrderValue) {
    return { allowed: false, reason: `Minimum order value is KSH ${customer.minOrderValue.toLocaleString()}` };
  }
  
  if (customer.creditLimit && orderValue > customer.creditLimit) {
    return { allowed: false, reason: `Order exceeds credit limit of KSH ${customer.creditLimit.toLocaleString()}` };
  }
  
  return { allowed: true };
}

export function formatPaymentTerms(terms?: string): string {
  if (!terms) return 'Payment on delivery';
  return terms;
}

export function getBusinessTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    retailer: 'Retailer',
    distributor: 'Distributor',
    manufacturer: 'Manufacturer',
    reseller: 'Reseller',
    other: 'Other',
  };
  return labels[type] || type;
}
