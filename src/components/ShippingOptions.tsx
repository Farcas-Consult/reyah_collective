'use client';

import { useState, useEffect } from 'react';
import type { ShippingQuote } from '@/types/shipping';

interface ShippingOptionsProps {
  countryCode: string;
  orderValue: number;
  weight?: number;
  itemCount?: number;
  selectedMethodId?: string;
  onSelectMethod: (methodId: string, quote: ShippingQuote) => void;
  showDetails?: boolean;
}

export default function ShippingOptions({
  countryCode,
  orderValue,
  weight,
  itemCount,
  selectedMethodId,
  onSelectMethod,
  showDetails = true,
}: ShippingOptionsProps) {
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, [countryCode, orderValue, weight, itemCount]);

    const loadQuotes = async () => {
    setLoading(true);
    try {
      // Dynamic import to avoid SSR issues
      const { getShippingQuotes } = await import('@/utils/shippingUtils');
      const availableQuotes = getShippingQuotes(
        countryCode, 
        orderValue, 
        weight || 1, // Default to 1kg if not provided
        itemCount || 1 // Default to 1 item if not provided
      );
      setQuotes(availableQuotes);
    } catch (error) {
      console.error('Error loading shipping quotes:', error);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDeliveryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCarrierIcon = (carrier: string) => {
    const icons: Record<string, string> = {
      dhl: '📦',
      fedex: '✈️',
      ups: '🚚',
      usps: '📮',
      aramex: '📫',
      posta_kenya: '🇰🇪',
      custom: '🏪',
    };
    return icons[carrier] || '📦';
  };

  const getMethodColor = (type: string) => {
    const colors: Record<string, string> = {
      standard: 'blue',
      express: 'purple',
      overnight: 'red',
      international: 'green',
      pickup: 'orange',
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          <span className="ml-3 text-gray-600">Loading shipping options...</span>
        </div>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Shipping Options Available</h3>
          <p className="text-gray-600">We currently don't ship to this location. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Shipping Method</h3>
      
      {quotes.map((quote) => {
        const isSelected = selectedMethodId === quote.methodId;
        const color = getMethodColor(quote.type);
        
        return (
          <div
            key={quote.methodId}
            onClick={() => onSelectMethod(quote.methodId, quote)}
            className={`relative bg-white rounded-lg border-2 p-4 cursor-pointer transition-all ${
              isSelected
                ? 'border-[var(--accent)] shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            {/* Recommended Badge */}
            {quote.isRecommended && !isSelected && (
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  Recommended
                </span>
              </div>
            )}

            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3">
                <div className="w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Carrier Icon */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-lg bg-${color}-50 flex items-center justify-center text-2xl`}>
                  {getCarrierIcon(quote.carrier)}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{quote.methodName}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        {quote.estimatedDays.min === quote.estimatedDays.max
                          ? `${quote.estimatedDays.min} ${quote.estimatedDays.min === 1 ? 'day' : 'days'}`
                          : `${quote.estimatedDays.min}-${quote.estimatedDays.max} days`}
                      </span>
                    </div>
                    
                    {showDetails && quote.deliveryDate && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Estimated delivery:</span>{' '}
                        {formatDeliveryDate(quote.deliveryDate.earliest)} - {formatDeliveryDate(quote.deliveryDate.latest)}
                      </p>
                    )}

                    {/* Features */}
                    {showDetails && quote.features && quote.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {quote.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    {quote.cost === 0 ? (
                      <div className="text-xl font-bold text-green-600">FREE</div>
                    ) : (
                      <div className="text-xl font-bold text-gray-900">
                        KSH {quote.cost.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Shipping Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Shipping Information</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Delivery times are estimates and may vary</li>
              <li>All shipments include tracking information</li>
              <li>Free shipping available on orders over KSH 10,000</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
