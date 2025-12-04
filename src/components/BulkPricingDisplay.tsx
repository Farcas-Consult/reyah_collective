'use client';

import { useState, useEffect } from 'react';
import type { PricingTier } from '@/types/wholesale';

interface BulkPricingDisplayProps {
  productId: number;
  basePrice: number;
  tiers: PricingTier[];
  currentQuantity?: number;
  isWholesale?: boolean;
  wholesaleDiscount?: number;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
}

export default function BulkPricingDisplay({
  productId,
  basePrice,
  tiers,
  currentQuantity = 1,
  isWholesale = false,
  wholesaleDiscount = 0,
  size = 'md',
  showSavings = true,
}: BulkPricingDisplayProps) {
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  useEffect(() => {
    // Find applicable tier for current quantity
    const applicableTier = tiers.find(tier => 
      currentQuantity >= tier.minQuantity && 
      (!tier.maxQuantity || currentQuantity <= tier.maxQuantity)
    );
    setSelectedTier(applicableTier || null);
  }, [currentQuantity, tiers]);

  if (tiers.length === 0) return null;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const headerSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={`font-bold text-blue-900 ${headerSizeClasses[size]}`}>
            Bulk Pricing Available
          </h3>
        </div>
        {isWholesale && wholesaleDiscount > 0 && (
          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
            +{wholesaleDiscount}% Wholesale Discount
          </span>
        )}
      </div>

      {/* Pricing Tiers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 border-b border-blue-200">
              <th className={`text-left p-2 font-semibold text-blue-900 ${sizeClasses[size]}`}>
                Quantity
              </th>
              <th className={`text-right p-2 font-semibold text-blue-900 ${sizeClasses[size]}`}>
                Price/Unit
              </th>
              {showSavings && (
                <th className={`text-right p-2 font-semibold text-blue-900 ${sizeClasses[size]}`}>
                  Savings
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Base Price Row */}
            <tr className={`border-b border-blue-100 ${currentQuantity < (tiers[0]?.minQuantity || 0) ? 'bg-blue-50 ring-2 ring-blue-400' : 'bg-white'}`}>
              <td className={`p-2 ${sizeClasses[size]}`}>
                1 - {(tiers[0]?.minQuantity || 2) - 1}
              </td>
              <td className={`p-2 text-right font-semibold ${sizeClasses[size]}`}>
                KSH {basePrice.toLocaleString()}
              </td>
              {showSavings && (
                <td className={`p-2 text-right text-gray-500 ${sizeClasses[size]}`}>
                  -
                </td>
              )}
            </tr>

            {/* Tier Rows */}
            {tiers.map((tier, index) => {
              const isActive = selectedTier?.id === tier.id;
              const finalPrice = isWholesale && wholesaleDiscount > 0
                ? tier.pricePerUnit * (1 - wholesaleDiscount / 100)
                : tier.pricePerUnit;
              const totalSavings = basePrice - finalPrice;
              const savingsPercentage = (totalSavings / basePrice) * 100;

              return (
                <tr
                  key={tier.id}
                  className={`border-b border-blue-100 transition-colors ${
                    isActive
                      ? 'bg-blue-50 ring-2 ring-blue-400'
                      : 'bg-white hover:bg-blue-25'
                  }`}
                >
                  <td className={`p-2 ${sizeClasses[size]} ${isActive ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                    {tier.minQuantity}+
                    {tier.maxQuantity ? ` - ${tier.maxQuantity}` : ''}
                    {isActive && (
                      <span className="ml-2 text-blue-600 text-xs">← Current</span>
                    )}
                  </td>
                  <td className={`p-2 text-right ${sizeClasses[size]} ${isActive ? 'font-bold text-blue-900' : 'font-semibold text-gray-800'}`}>
                    KSH {finalPrice.toLocaleString()}
                  </td>
                  {showSavings && (
                    <td className={`p-2 text-right ${sizeClasses[size]}`}>
                      <div className="flex flex-col items-end">
                        <span className="text-green-600 font-semibold">
                          -{savingsPercentage.toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          (Save KSH {totalSavings.toLocaleString()})
                        </span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Current Savings Summary */}
      {selectedTier && showSavings && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <span className={`text-blue-900 font-semibold ${sizeClasses[size]}`}>
              Your Savings ({currentQuantity} units):
            </span>
            <div className="text-right">
              <div className="text-green-600 font-bold text-lg">
                KSH {(selectedTier.savings * currentQuantity).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                {selectedTier.discountPercentage.toFixed(0)}% off retail
                {isWholesale && wholesaleDiscount > 0 && ` + ${wholesaleDiscount}% wholesale`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wholesale Benefits */}
      {!isWholesale && tiers.some(t => t.discountPercentage > 0) && (
        <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-green-800">
              <span className="font-semibold">Wholesale customers</span> get even better pricing!
              <a href="/wholesale/apply" className="ml-1 underline hover:text-green-900">
                Apply now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-3 flex items-start gap-2 text-xs text-gray-600">
        <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Prices automatically adjust based on quantity. Higher quantities = lower unit prices.
        </span>
      </div>
    </div>
  );
}
