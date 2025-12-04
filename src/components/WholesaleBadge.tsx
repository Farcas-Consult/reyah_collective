'use client';

interface WholesaleBadgeProps {
  variant?: 'customer' | 'product' | 'eligible';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  minQuantity?: number;
  maxDiscount?: number;
}

export default function WholesaleBadge({
  variant = 'product',
  size = 'md',
  showIcon = true,
  minQuantity,
  maxDiscount,
}: WholesaleBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variants = {
    customer: {
      bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
      text: 'text-white',
      icon: (
        <svg className={iconSizes[size]} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Wholesale Customer',
    },
    product: {
      bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      text: 'text-white',
      icon: (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      label: 'Bulk Pricing',
    },
    eligible: {
      bg: 'bg-gradient-to-r from-purple-600 to-pink-600',
      text: 'text-white',
      icon: (
        <svg className={iconSizes[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Wholesale Eligible',
    },
  };

  const config = variants[variant];

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${sizeClasses[size]} rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
      {variant === 'product' && minQuantity && (
        <span className="ml-1 opacity-90">
          ({minQuantity}+ units)
        </span>
      )}
      {variant === 'product' && maxDiscount && (
        <span className="ml-1 bg-white/20 px-1.5 rounded-full">
          Up to {maxDiscount}% off
        </span>
      )}
    </div>
  );
}
