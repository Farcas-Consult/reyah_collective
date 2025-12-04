export type WholesaleStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type BusinessType = 'retailer' | 'distributor' | 'manufacturer' | 'reseller' | 'other';

export interface WholesaleCustomer {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  taxId: string;
  businessAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: WholesaleStatus;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  creditLimit?: number;
  paymentTerms?: string; // e.g., "Net 30", "Net 60"
  discountPercentage?: number; // Additional wholesale discount
  minOrderValue?: number;
  createdAt: Date;
  updatedAt: Date;
  documents?: {
    businessLicense?: string;
    taxCertificate?: string;
    tradeReference?: string;
  };
}

export interface PricingTier {
  id: string;
  productId: number;
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discountPercentage: number;
  savings: number; // Savings per unit compared to retail
}

export interface BulkPricingRule {
  id: string;
  name: string;
  description?: string;
  productIds: number[]; // Products this rule applies to
  tiers: Omit<PricingTier, 'id' | 'productId'>[]; // Tiered pricing
  wholesaleOnly: boolean; // Only for wholesale customers
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BulkOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  tierApplied?: PricingTier;
  subtotal: number;
  savings: number;
}

export interface BulkOrder {
  id: string;
  customerId: string;
  customerName: string;
  isWholesale: boolean;
  items: BulkOrderItem[];
  subtotal: number;
  wholesaleDiscount: number;
  volumeDiscount: number;
  totalSavings: number;
  totalAmount: number;
  status: 'draft' | 'submitted' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentTerms?: string;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
}

export interface WholesaleStats {
  totalCustomers: number;
  pendingApplications: number;
  approvedCustomers: number;
  totalBulkOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topProducts: {
    productId: number;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface WholesaleApplication {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  taxId: string;
  businessAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  annualRevenue?: string;
  numberOfEmployees?: string;
  yearsInBusiness?: string;
  currentSuppliers?: string;
  estimatedMonthlyOrder?: string;
  businessDescription?: string;
  status: WholesaleStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}
