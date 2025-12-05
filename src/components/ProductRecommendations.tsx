'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { RecommendationSet, RecommendationType } from '@/types/recommendations';
import { getRecommendations, trackRecommendationImpression, trackRecommendationClick } from '@/utils/recommendationEngine';

interface ProductRecommendationsProps {
  type: RecommendationType;
  allProducts: any[];
  currentProductId?: string;
  userId?: string;
  limit?: number;
  layout?: 'grid' | 'carousel';
  showReasons?: boolean;
}

export default function ProductRecommendations({
  type,
  allProducts,
  currentProductId,
  userId,
  limit,
  layout = 'grid',
  showReasons = false
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendationSet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [type, currentProductId, userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = getRecommendations(type, allProducts, {
        userId,
        productId: currentProductId,
        limit,
        excludeProductIds: currentProductId ? [currentProductId] : []
      });
      
      setRecommendations(recs);
      
      // Track impression
      if (recs.products.length > 0) {
        trackRecommendationImpression(type, recs.algorithm);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    if (recommendations) {
      trackRecommendationClick(type, recommendations.algorithm);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {recommendations.title}
        </h2>
        {recommendations.description && (
          <p className="text-gray-600">{recommendations.description}</p>
        )}
      </div>

      {/* Products Grid/Carousel */}
      {layout === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {recommendations.products.map(product => (
            <RecommendationCard
              key={product.id}
              product={product}
              showReasons={showReasons}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {recommendations.products.map(product => (
              <div key={product.id} className="flex-shrink-0 w-48 snap-start">
                <RecommendationCard
                  product={product}
                  showReasons={showReasons}
                  onClick={() => handleProductClick(product.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm Badge (for admins/testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-gray-500">
          Algorithm: {recommendations.algorithm} | Products: {recommendations.products.length}
        </div>
      )}
    </div>
  );
}

interface RecommendationCardProps {
  product: any;
  showReasons?: boolean;
  onClick: () => void;
}

function RecommendationCard({ product, showReasons, onClick }: RecommendationCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      onClick={onClick}
      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <span className="text-4xl md:text-6xl font-bold text-gray-400">
            {product.name?.charAt(0) || '?'}
          </span>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              NEW
            </span>
          )}
          {product.isTrending && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              🔥 HOT
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded text-center font-semibold">
              Only {product.stock} left!
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-1 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        {product.category && (
          <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <svg
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              ))}
            </div>
            {product.reviewCount && (
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-[var(--accent)]">
            KSH {product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">
              KSH {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Vendor */}
        {product.vendorName && (
          <p className="text-xs text-gray-600 mb-2">
            by <span className="font-semibold">{product.vendorName}</span>
          </p>
        )}

        {/* Recommendation Reasons */}
        {showReasons && product.reasons && product.reasons.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 italic line-clamp-2">
              {product.reasons[0]}
            </p>
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            // Handle add to cart
          }}
          className="w-full mt-2 bg-[var(--accent)] text-white py-2 px-3 rounded-md text-sm font-semibold hover:bg-[var(--brown-600)] transition-colors opacity-0 group-hover:opacity-100"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
