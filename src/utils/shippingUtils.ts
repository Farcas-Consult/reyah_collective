import type {
  ShippingZone,
  ShippingMethod,
  ShippingRate,
  ShippingCalculation,
  ShippingQuote,
  ShipmentTracking,
  TrackingEvent,
  ShippingAddress,
  CarrierSettings,
  ShipmentStatus,
  ShippingCarrier
} from '@/types/shipping';

const STORAGE_KEYS = {
  ZONES: 'reyah_shipping_zones',
  METHODS: 'reyah_shipping_methods',
  RATES: 'reyah_shipping_rates',
  CARRIERS: 'reyah_carrier_settings',
  TRACKING: 'reyah_shipment_tracking',
} as const;

// ============================================================================
// Shipping Zones
// ============================================================================

export function getAllShippingZones(): ShippingZone[] {
  if (typeof window === 'undefined') return [];
  const zones = localStorage.getItem(STORAGE_KEYS.ZONES);
  if (!zones) return getDefaultZones();
  return JSON.parse(zones).map((zone: any) => ({
    ...zone,
    createdAt: new Date(zone.createdAt),
    updatedAt: new Date(zone.updatedAt),
  }));
}

export function getDefaultZones(): ShippingZone[] {
  const defaultZones: ShippingZone[] = [
    {
      id: 'zone_local',
      name: 'Local (Kenya)',
      description: 'Shipping within Kenya',
      countries: ['KE'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'zone_east_africa',
      name: 'East Africa',
      description: 'Uganda, Tanzania, Rwanda, Burundi',
      countries: ['UG', 'TZ', 'RW', 'BI'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'zone_africa',
      name: 'Rest of Africa',
      description: 'Other African countries',
      countries: ['NG', 'GH', 'ZA', 'EG', 'MA'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'zone_international',
      name: 'International',
      description: 'Rest of the world',
      countries: ['US', 'GB', 'CA', 'AU', 'EU'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(defaultZones));
  return defaultZones;
}

export function getShippingZone(id: string): ShippingZone | null {
  const zones = getAllShippingZones();
  return zones.find(z => z.id === id) || null;
}

export function saveShippingZone(zone: Omit<ShippingZone, 'id' | 'createdAt' | 'updatedAt'>): ShippingZone {
  const zones = getAllShippingZones();
  const newZone: ShippingZone = {
    ...zone,
    id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  zones.push(newZone);
  localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
  return newZone;
}

export function updateShippingZone(id: string, updates: Partial<ShippingZone>): ShippingZone | null {
  const zones = getAllShippingZones();
  const index = zones.findIndex(z => z.id === id);
  if (index === -1) return null;
  
  zones[index] = {
    ...zones[index],
    ...updates,
    id,
    updatedAt: new Date(),
  };
  localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(zones));
  return zones[index];
}

export function deleteShippingZone(id: string): boolean {
  const zones = getAllShippingZones();
  const filtered = zones.filter(z => z.id !== id);
  if (filtered.length === zones.length) return false;
  localStorage.setItem(STORAGE_KEYS.ZONES, JSON.stringify(filtered));
  return true;
}

export function findZoneByCountry(countryCode: string): ShippingZone | null {
  const zones = getAllShippingZones().filter(z => z.isActive);
  return zones.find(z => z.countries.includes(countryCode)) || null;
}

// ============================================================================
// Shipping Methods
// ============================================================================

export function getAllShippingMethods(): ShippingMethod[] {
  if (typeof window === 'undefined') return [];
  const methods = localStorage.getItem(STORAGE_KEYS.METHODS);
  if (!methods) return getDefaultMethods();
  return JSON.parse(methods).map((method: any) => ({
    ...method,
    createdAt: new Date(method.createdAt),
    updatedAt: new Date(method.updatedAt),
  }));
}

export function getDefaultMethods(): ShippingMethod[] {
  const defaultMethods: ShippingMethod[] = [
    {
      id: 'method_standard_local',
      name: 'Standard Delivery',
      type: 'standard',
      carrier: 'posta_kenya',
      description: 'Regular delivery within Kenya',
      estimatedDays: { min: 3, max: 5 },
      zoneId: 'zone_local',
      isActive: true,
      features: ['Tracking', 'Insurance up to KSH 10,000'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'method_express_local',
      name: 'Express Delivery',
      type: 'express',
      carrier: 'dhl',
      description: 'Fast delivery within Kenya',
      estimatedDays: { min: 1, max: 2 },
      zoneId: 'zone_local',
      isActive: true,
      cutoffTime: '15:00',
      features: ['Real-time Tracking', 'Insurance', 'Signature Required'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'method_pickup',
      name: 'Store Pickup',
      type: 'pickup',
      carrier: 'custom',
      description: 'Pick up from our store',
      estimatedDays: { min: 0, max: 1 },
      zoneId: 'zone_local',
      isActive: true,
      features: ['Free', 'Same Day Available'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'method_international',
      name: 'International Shipping',
      type: 'international',
      carrier: 'dhl',
      description: 'Worldwide shipping',
      estimatedDays: { min: 7, max: 14 },
      zoneId: 'zone_international',
      isActive: true,
      features: ['Tracking', 'Customs Clearance', 'Insurance'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  localStorage.setItem(STORAGE_KEYS.METHODS, JSON.stringify(defaultMethods));
  return defaultMethods;
}

export function getShippingMethod(id: string): ShippingMethod | null {
  const methods = getAllShippingMethods();
  return methods.find(m => m.id === id) || null;
}

export function getMethodsByZone(zoneId: string): ShippingMethod[] {
  return getAllShippingMethods().filter(m => m.zoneId === zoneId && m.isActive);
}

export function saveShippingMethod(method: Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>): ShippingMethod {
  const methods = getAllShippingMethods();
  const newMethod: ShippingMethod = {
    ...method,
    id: `method_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  methods.push(newMethod);
  localStorage.setItem(STORAGE_KEYS.METHODS, JSON.stringify(methods));
  return newMethod;
}

export function updateShippingMethod(id: string, updates: Partial<ShippingMethod>): ShippingMethod | null {
  const methods = getAllShippingMethods();
  const index = methods.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  methods[index] = {
    ...methods[index],
    ...updates,
    id,
    updatedAt: new Date(),
  };
  localStorage.setItem(STORAGE_KEYS.METHODS, JSON.stringify(methods));
  return methods[index];
}

export function deleteShippingMethod(id: string): boolean {
  const methods = getAllShippingMethods();
  const filtered = methods.filter(m => m.id !== id);
  if (filtered.length === methods.length) return false;
  localStorage.setItem(STORAGE_KEYS.METHODS, JSON.stringify(filtered));
  return true;
}

// ============================================================================
// Shipping Rates
// ============================================================================

export function getAllShippingRates(): ShippingRate[] {
  if (typeof window === 'undefined') return [];
  const rates = localStorage.getItem(STORAGE_KEYS.RATES);
  if (!rates) return getDefaultRates();
  return JSON.parse(rates).map((rate: any) => ({
    ...rate,
    createdAt: new Date(rate.createdAt),
    updatedAt: new Date(rate.updatedAt),
  }));
}

export function getDefaultRates(): ShippingRate[] {
  const defaultRates: ShippingRate[] = [
    {
      id: 'rate_standard_local',
      methodId: 'method_standard_local',
      name: 'Standard Local Rate',
      baseRate: 500,
      rateType: 'flat',
      freeShippingThreshold: 10000,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'rate_express_local',
      methodId: 'method_express_local',
      name: 'Express Local Rate',
      baseRate: 1500,
      rateType: 'weight_based',
      weightTiers: [
        { minWeight: 0, maxWeight: 2, rate: 1500 },
        { minWeight: 2, maxWeight: 5, rate: 2500 },
        { minWeight: 5, maxWeight: 10, rate: 4000 },
        { minWeight: 10, rate: 6000 },
      ],
      fuelSurcharge: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'rate_pickup',
      methodId: 'method_pickup',
      name: 'Pickup Rate',
      baseRate: 0,
      rateType: 'flat',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'rate_international',
      methodId: 'method_international',
      name: 'International Rate',
      baseRate: 5000,
      rateType: 'weight_based',
      weightTiers: [
        { minWeight: 0, maxWeight: 1, rate: 5000 },
        { minWeight: 1, maxWeight: 3, rate: 8000 },
        { minWeight: 3, maxWeight: 5, rate: 12000 },
        { minWeight: 5, rate: 18000 },
      ],
      handlingFee: 500,
      insuranceFee: 300,
      fuelSurcharge: 15,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(defaultRates));
  return defaultRates;
}

export function getShippingRate(id: string): ShippingRate | null {
  const rates = getAllShippingRates();
  return rates.find(r => r.id === id) || null;
}

export function getRatesByMethod(methodId: string): ShippingRate[] {
  return getAllShippingRates().filter(r => r.methodId === methodId && r.isActive);
}

export function saveShippingRate(rate: Omit<ShippingRate, 'id' | 'createdAt' | 'updatedAt'>): ShippingRate {
  const rates = getAllShippingRates();
  const newRate: ShippingRate = {
    ...rate,
    id: `rate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  rates.push(newRate);
  localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  return newRate;
}

export function updateShippingRate(id: string, updates: Partial<ShippingRate>): ShippingRate | null {
  const rates = getAllShippingRates();
  const index = rates.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  rates[index] = {
    ...rates[index],
    ...updates,
    id,
    updatedAt: new Date(),
  };
  localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  return rates[index];
}

export function deleteShippingRate(id: string): boolean {
  const rates = getAllShippingRates();
  const filtered = rates.filter(r => r.id !== id);
  if (filtered.length === rates.length) return false;
  localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(filtered));
  return true;
}

// ============================================================================
// Shipping Calculation
// ============================================================================

export function calculateShipping(
  methodId: string,
  orderValue: number,
  weight: number,
  itemCount: number
): ShippingCalculation | null {
  const method = getShippingMethod(methodId);
  if (!method) return null;
  
  const rates = getRatesByMethod(methodId);
  if (rates.length === 0) return null;
  
  const rate = rates[0]; // Use first active rate
  let baseRate = rate.baseRate;
  
  // Calculate based on rate type
  switch (rate.rateType) {
    case 'weight_based':
      if (rate.weightTiers) {
        const tier = rate.weightTiers
          .sort((a, b) => b.minWeight - a.minWeight)
          .find(t => weight >= t.minWeight && (!t.maxWeight || weight <= t.maxWeight));
        if (tier) baseRate = tier.rate;
      }
      break;
      
    case 'price_based':
      if (rate.priceTiers) {
        const tier = rate.priceTiers
          .sort((a, b) => b.minValue - a.minValue)
          .find(t => orderValue >= t.minValue && (!t.maxValue || orderValue <= t.maxValue));
        if (tier) baseRate = tier.rate;
      }
      break;
      
    case 'item_based':
      if (rate.perItemRate) {
        baseRate = rate.perItemRate * itemCount;
      }
      break;
      
    case 'flat':
    default:
      // Use base rate as is
      break;
  }
  
  // Check for free shipping
  const isFreeShipping = !!(rate.freeShippingThreshold && orderValue >= rate.freeShippingThreshold);
  if (isFreeShipping) {
    baseRate = 0;
  }
  
  // Calculate additional fees
  const handlingFee = isFreeShipping ? 0 : (rate.handlingFee || 0);
  const insuranceFee = isFreeShipping ? 0 : (rate.insuranceFee || 0);
  const fuelSurcharge = isFreeShipping ? 0 : (baseRate * (rate.fuelSurcharge || 0) / 100);
  
  const totalCost = baseRate + handlingFee + insuranceFee + fuelSurcharge;
  
  return {
    methodId: method.id,
    methodName: method.name,
    carrier: method.carrier,
    baseRate,
    handlingFee,
    insuranceFee,
    fuelSurcharge,
    totalCost: Math.round(totalCost),
    estimatedDays: method.estimatedDays,
    isFreeShipping,
    features: method.features || [],
  };
}

export function getShippingQuotes(
  countryCode: string,
  orderValue: number,
  weight: number,
  itemCount: number
): ShippingQuote[] {
  const zone = findZoneByCountry(countryCode);
  if (!zone) return [];
  
  const methods = getMethodsByZone(zone.id);
  const quotes: ShippingQuote[] = [];
  
  for (const method of methods) {
    const calculation = calculateShipping(method.id, orderValue, weight, itemCount);
    if (!calculation) continue;
    
    const now = new Date();
    const earliestDelivery = new Date(now);
    earliestDelivery.setDate(earliestDelivery.getDate() + method.estimatedDays.min);
    const latestDelivery = new Date(now);
    latestDelivery.setDate(latestDelivery.getDate() + method.estimatedDays.max);
    
    quotes.push({
      methodId: method.id,
      methodName: method.name,
      type: method.type,
      carrier: method.carrier,
      cost: calculation.totalCost,
      estimatedDays: method.estimatedDays,
      deliveryDate: {
        earliest: earliestDelivery,
        latest: latestDelivery,
      },
      features: method.features || [],
      isRecommended: method.type === 'standard', // Mark standard as recommended
    });
  }
  
  return quotes.sort((a, b) => a.cost - b.cost);
}

// ============================================================================
// Shipment Tracking
// ============================================================================

export function getAllShipmentTracking(): ShipmentTracking[] {
  if (typeof window === 'undefined') return [];
  const tracking = localStorage.getItem(STORAGE_KEYS.TRACKING);
  if (!tracking) return [];
  return JSON.parse(tracking).map((t: any) => ({
    ...t,
    estimatedDelivery: t.estimatedDelivery ? new Date(t.estimatedDelivery) : undefined,
    actualDelivery: t.actualDelivery ? new Date(t.actualDelivery) : undefined,
    events: t.events.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    })),
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }));
}

export function getShipmentTracking(trackingNumber: string): ShipmentTracking | null {
  const allTracking = getAllShipmentTracking();
  return allTracking.find(t => t.trackingNumber === trackingNumber) || null;
}

export function getTrackingByOrderId(orderId: string): ShipmentTracking | null {
  const allTracking = getAllShipmentTracking();
  return allTracking.find(t => t.orderId === orderId) || null;
}

export function createShipment(
  orderId: string,
  methodId: string,
  recipientName: string,
  recipientAddress: string
): ShipmentTracking {
  const method = getShippingMethod(methodId);
  if (!method) throw new Error('Shipping method not found');
  
  const trackingNumber = generateTrackingNumber(method.carrier);
  const now = new Date();
  const estimatedDelivery = new Date(now);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + method.estimatedDays.max);
  
  const shipment: ShipmentTracking = {
    id: `shipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    orderId,
    trackingNumber,
    carrier: method.carrier,
    methodId,
    status: 'pending',
    estimatedDelivery,
    events: [{
      timestamp: now,
      status: 'pending',
      location: 'Warehouse',
      description: 'Order received and being prepared for shipment',
    }],
    recipientName,
    recipientAddress,
    createdAt: now,
    updatedAt: now,
  };
  
  const allTracking = getAllShipmentTracking();
  allTracking.push(shipment);
  localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(allTracking));
  
  return shipment;
}

export function updateShipmentStatus(
  trackingNumber: string,
  status: ShipmentStatus,
  location: string,
  description: string
): ShipmentTracking | null {
  const allTracking = getAllShipmentTracking();
  const index = allTracking.findIndex(t => t.trackingNumber === trackingNumber);
  if (index === -1) return null;
  
  const event: TrackingEvent = {
    timestamp: new Date(),
    status,
    location,
    description,
  };
  
  allTracking[index].events.push(event);
  allTracking[index].status = status;
  allTracking[index].currentLocation = location;
  allTracking[index].updatedAt = new Date();
  
  if (status === 'delivered') {
    allTracking[index].actualDelivery = new Date();
  }
  
  localStorage.setItem(STORAGE_KEYS.TRACKING, JSON.stringify(allTracking));
  return allTracking[index];
}

function generateTrackingNumber(carrier: ShippingCarrier): string {
  const prefix = carrier.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 12).toUpperCase();
  const timestamp = Date.now().toString().substring(-6);
  return `${prefix}${timestamp}${random}`;
}

// ============================================================================
// Carrier Settings
// ============================================================================

export function getCarrierSettings(carrier: ShippingCarrier): CarrierSettings | null {
  if (typeof window === 'undefined') return null;
  const settings = localStorage.getItem(STORAGE_KEYS.CARRIERS);
  if (!settings) return null;
  const allSettings = JSON.parse(settings) as CarrierSettings[];
  return allSettings.find(s => s.carrier === carrier) || null;
}

export function saveCarrierSettings(settings: CarrierSettings): void {
  const allSettings = getAllCarrierSettings();
  const index = allSettings.findIndex(s => s.carrier === settings.carrier);
  
  if (index >= 0) {
    allSettings[index] = settings;
  } else {
    allSettings.push(settings);
  }
  
  localStorage.setItem(STORAGE_KEYS.CARRIERS, JSON.stringify(allSettings));
}

export function getAllCarrierSettings(): CarrierSettings[] {
  if (typeof window === 'undefined') return [];
  const settings = localStorage.getItem(STORAGE_KEYS.CARRIERS);
  return settings ? JSON.parse(settings) : [];
}

// ============================================================================
// Validation
// ============================================================================

export function validateShippingAddress(address: ShippingAddress): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!address.firstName?.trim()) errors.push('First name is required');
  if (!address.lastName?.trim()) errors.push('Last name is required');
  if (!address.addressLine1?.trim()) errors.push('Address line 1 is required');
  if (!address.city?.trim()) errors.push('City is required');
  if (!address.state?.trim()) errors.push('State/Province is required');
  if (!address.postalCode?.trim()) errors.push('Postal code is required');
  if (!address.country?.trim()) errors.push('Country is required');
  if (!address.phone?.trim()) errors.push('Phone number is required');
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function canShipToAddress(address: ShippingAddress): boolean {
  const zone = findZoneByCountry(address.countryCode);
  return zone !== null && zone.isActive;
}
