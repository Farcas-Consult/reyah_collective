export type ShippingMethodType = 'standard' | 'express' | 'overnight' | 'international' | 'pickup';
export type ShippingCarrier = 'dhl' | 'fedex' | 'ups' | 'usps' | 'aramex' | 'posta_kenya' | 'custom';
export type ShipmentStatus = 'pending' | 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';

export interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  countries: string[]; // Country codes (e.g., 'KE', 'US', 'GB')
  regions?: string[]; // State/province codes
  postalCodes?: string[]; // Specific postal codes or patterns
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingMethod {
  id: string;
  name: string;
  type: ShippingMethodType;
  carrier: ShippingCarrier;
  description?: string;
  estimatedDays: {
    min: number;
    max: number;
  };
  zoneId: string; // Which zone this method applies to
  isActive: boolean;
  cutoffTime?: string; // e.g., "15:00" for same-day processing
  features?: string[]; // e.g., ["Tracking", "Insurance", "Signature Required"]
  restrictions?: {
    minWeight?: number; // in kg
    maxWeight?: number;
    minValue?: number; // order value in currency
    maxValue?: number;
    excludedProducts?: number[]; // Product IDs that can't use this method
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRate {
  id: string;
  methodId: string;
  name: string;
  baseRate: number; // Base shipping cost
  rateType: 'flat' | 'weight_based' | 'price_based' | 'item_based';
  
  // Weight-based pricing
  weightTiers?: {
    minWeight: number; // in kg
    maxWeight?: number;
    rate: number;
  }[];
  
  // Price-based pricing
  priceTiers?: {
    minValue: number;
    maxValue?: number;
    rate: number;
  }[];
  
  // Item-based pricing
  perItemRate?: number;
  
  // Free shipping threshold
  freeShippingThreshold?: number;
  
  // Additional fees
  handlingFee?: number;
  insuranceFee?: number;
  fuelSurcharge?: number; // Percentage
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarrierSettings {
  carrier: ShippingCarrier;
  apiKey?: string;
  apiSecret?: string;
  accountNumber?: string;
  isActive: boolean;
  isTestMode: boolean;
  supportedServices: string[];
  defaultService?: string;
  features: {
    realTimeRates: boolean;
    tracking: boolean;
    labelGeneration: boolean;
    pickupScheduling: boolean;
  };
}

export interface ShippingCalculation {
  methodId: string;
  methodName: string;
  carrier: ShippingCarrier;
  baseRate: number;
  handlingFee: number;
  insuranceFee: number;
  fuelSurcharge: number;
  totalCost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  isFreeShipping: boolean;
  features: string[];
}

export interface TrackingEvent {
  timestamp: Date;
  status: ShipmentStatus;
  location: string;
  description: string;
  courierStatus?: string; // Original carrier status
}

export interface ShipmentTracking {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
  methodId: string;
  status: ShipmentStatus;
  currentLocation?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  events: TrackingEvent[];
  recipientName: string;
  recipientAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  countryCode: string;
  phone: string;
  email?: string;
  isResidential?: boolean;
}

export interface ShipmentLabel {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier: ShippingCarrier;
  labelUrl: string; // URL to download label PDF
  labelFormat: 'pdf' | 'png' | 'zpl';
  cost: number;
  createdAt: Date;
}

export interface ShippingQuote {
  methodId: string;
  methodName: string;
  type: ShippingMethodType;
  carrier: ShippingCarrier;
  cost: number;
  estimatedDays: {
    min: number;
    max: number;
  };
  deliveryDate?: {
    earliest: Date;
    latest: Date;
  };
  features: string[];
  isRecommended?: boolean;
}
