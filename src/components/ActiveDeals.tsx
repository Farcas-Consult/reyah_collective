'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActiveDeals, updateSaleStatuses } from '@/utils/flashSaleUtils';
import { ActiveDeal } from '@/types/flashSale';
import CountdownTimer from './CountdownTimer';
import { calculateSalePrice } from '@/utils/flashSaleUtils';

export default function ActiveDeals() {
  const [deals, setDeals] = useState<ActiveDeal[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDeals();

    // Update deals every minute
    const interval = setInterval(() => {
      updateSaleStatuses();
      loadDeals();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadDeals = () => {
    // Load products
    const adminProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
    
    const sellerProducts = users
      .filter((u: any) => u.role === 'seller' && u.products)
      .flatMap((seller: any) =>
        seller.products.map((product: any) => ({
          ...product,
          sellerName: seller.businessName || `${seller.firstName} ${seller.lastName}`,
        }))
      );

    const products = [...adminProducts, ...sellerProducts];
    setAllProducts(products);
    setDeals(getActiveDeals(products));
  };

  if (deals.length === 0) {
    return null;
  }

  return (
    <div className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2 flex items-center justify-center gap-2">
            <span className="animate-pulse">⚡</span>
            Active Flash Deals
            <span className="animate-pulse">⚡</span>
          </h2>
          <p className="text-[var(--brown-700)]">Limited time offers - grab them before they're gone!</p>
        </div>

        {/* Deals Grid */}
        <div className="space-y-8">
          {deals.slice(0, 3).map((deal) => (
            <div
              key={deal.sale.id}
              className="bg-white rounded-lg shadow-lg border-2 border-red-300 overflow-hidden"
            >
              {/* Deal Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {deal.sale.type === 'flash_sale' ? '⚡' : deal.sale.type === 'daily_deal' ? '🎯' : '🔥'}
                      </span>
                      <h3 className="text-2xl font-bold">{deal.sale.name}</h3>
                    </div>
                    {deal.sale.description && (
                      <p className="text-white/90">{deal.sale.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-4">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                        Up to {deal.sale.discountValue}{deal.sale.discountType === 'percentage' ? '%' : ' KSH'} OFF
                      </span>
                      {deal.sale.stockLimit && deal.sale.stockRemaining !== undefined && (
                        <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold">
                          Only {deal.sale.stockRemaining} left!
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <CountdownTimer
                      endDate={deal.sale.endDate}
                      size="md"
                      showLabel={true}
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {deal.products.slice(0, 8).map((product) => {
                    const fullProduct = allProducts.find(p => p.id === product.productId);
                    
                    return (
                      <Link
                        key={product.productId}
                        href={`/product/${product.productId}`}
                        className="group bg-white rounded-lg overflow-hidden border-2 border-[var(--beige-300)] hover:border-[var(--accent)] transition-all hover:shadow-md"
                      >
                        {/* Product Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] overflow-hidden">
                          {fullProduct?.image ? (
                            <img
                              src={fullProduct.image}
                              alt={product.productName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[var(--brown-700)] text-xs p-2 text-center font-medium">
                              {product.productName}
                            </div>
                          )}
                          
                          {/* Discount Badge */}
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold shadow-lg">
                            -{product.discountPercentage}%
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-3">
                          <h4 className="font-semibold text-[var(--brown-800)] text-sm mb-2 line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
                            {product.productName}
                          </h4>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 line-through">
                                KSH {product.originalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-lg font-bold text-red-600">
                              KSH {product.salePrice.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              Save KSH {(product.originalPrice - product.salePrice).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* View All Link */}
                {deal.products.length > 8 && (
                  <div className="mt-6 text-center">
                    <Link
                      href={`/shop?sale=${deal.sale.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--brown-600)] transition-colors font-semibold"
                    >
                      View All {deal.products.length} Deals
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Deals Button */}
        {deals.length > 3 && (
          <div className="mt-8 text-center">
            <Link
              href="/shop?deals=all"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all font-bold text-lg shadow-lg"
            >
              <span className="animate-pulse">⚡</span>
              View All {deals.length} Active Deals
              <span className="animate-pulse">⚡</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
