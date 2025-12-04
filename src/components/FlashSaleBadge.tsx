'use client';

import { FlashSale } from '@/types/flashSale';

interface FlashSaleBadgeProps {
  sale: FlashSale;
  originalPrice: number;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export default function FlashSaleBadge({
  sale,
  originalPrice,
  size = 'md',
  position = 'top-right',
  className = '',
}: FlashSaleBadgeProps) {
  const calculateDiscount = () => {
    if (sale.discountType === 'percentage') {
      return `${sale.discountValue}%`;
    } else {
      const percentage = Math.round((sale.discountValue / originalPrice) * 100);
      return `${percentage}%`;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const getSaleTypeLabel = () => {
    switch (sale.type) {
      case 'flash_sale':
        return '⚡ FLASH SALE';
      case 'daily_deal':
        return '🎯 DAILY DEAL';
      case 'limited_offer':
        return '🔥 LIMITED OFFER';
      default:
        return '💰 SALE';
    }
  };

  const discount = calculateDiscount();

  return (
    <div className={`absolute ${positionClasses[position]} z-10 ${className}`}>
      <div className="flex flex-col gap-1">
        {/* Discount Badge */}
        <div className={`${sizeClasses[size]} bg-red-600 text-white font-bold rounded-md shadow-lg flex items-center gap-1`}>
          <span>-{discount} OFF</span>
        </div>

        {/* Sale Type Badge */}
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-md shadow-lg animate-pulse`}>
          {getSaleTypeLabel()}
        </div>

        {/* Limited Stock Warning */}
        {sale.stockLimit && sale.stockRemaining !== undefined && sale.stockRemaining < 10 && (
          <div className={`${sizeClasses[size]} bg-orange-600 text-white font-bold rounded-md shadow-lg`}>
            ⚠️ Only {sale.stockRemaining} left!
          </div>
        )}
      </div>
    </div>
  );
}
