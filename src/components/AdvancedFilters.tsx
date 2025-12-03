'use client';

import { useState, useEffect } from 'react';
import type { SearchFilters } from '@/types/search';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  filterOptions: {
    brands: string[];
    sellers: string[];
    categories: string[];
    tags: string[];
    priceRange: { min: number; max: number };
  };
  className?: string;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  filterOptions,
  className = '',
}: AdvancedFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    brand: false,
    seller: false,
    rating: false,
    other: false,
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = (key: 'brands' | 'sellers' | 'tags', value: string) => {
    const current = localFilters[key] || [];
    const newValue = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleFilterChange(key, newValue.length > 0 ? newValue : undefined);
  };

  const clearFilters = () => {
    const cleared: SearchFilters = { query: localFilters.query };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.category ||
      (localFilters.brands && localFilters.brands.length > 0) ||
      (localFilters.sellers && localFilters.sellers.length > 0) ||
      localFilters.priceRange ||
      localFilters.rating ||
      localFilters.inStock !== undefined ||
      localFilters.onSale ||
      (localFilters.tags && localFilters.tags.length > 0)
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-[var(--beige-300)] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--beige-300)] flex items-center justify-between">
        <h3 className="font-bold text-[var(--brown-800)]">Filters</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearFilters}
            className="text-sm text-[var(--accent)] hover:text-[var(--brown-600)] font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="divide-y divide-[var(--beige-200)]">
        {/* Category Filter */}
        {filterOptions.categories.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection('category')}
              className="w-full flex items-center justify-between text-left mb-2"
            >
              <span className="font-semibold text-[var(--brown-800)]">Category</span>
              <svg
                className={`w-4 h-4 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.category && (
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                    !localFilters.category
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--beige-100)]'
                  }`}
                >
                  All Categories
                </button>
                {filterOptions.categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleFilterChange('category', category)}
                    className={`block w-full text-left px-3 py-1.5 rounded text-sm transition-colors ${
                      localFilters.category === category
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--beige-100)]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Range Filter */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-left mb-2"
          >
            <span className="font-semibold text-[var(--brown-800)]">Price Range</span>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.price && (
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.priceRange?.min ?? ''}
                  onChange={(e) =>
                    handleFilterChange('priceRange', {
                      min: Number(e.target.value) || filterOptions.priceRange.min,
                      max: localFilters.priceRange?.max || filterOptions.priceRange.max,
                    })
                  }
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.priceRange?.max ?? ''}
                  onChange={(e) =>
                    handleFilterChange('priceRange', {
                      min: localFilters.priceRange?.min || filterOptions.priceRange.min,
                      max: Number(e.target.value) || filterOptions.priceRange.max,
                    })
                  }
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                />
              </div>
              {localFilters.priceRange && (
                <button
                  onClick={() => handleFilterChange('priceRange', undefined)}
                  className="text-xs text-[var(--accent)] hover:underline"
                >
                  Clear price range
                </button>
              )}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        {filterOptions.brands.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection('brand')}
              className="w-full flex items-center justify-between text-left mb-2"
            >
              <span className="font-semibold text-[var(--brown-800)]">Brand</span>
              <svg
                className={`w-4 h-4 transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.brand && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.brands.map(brand => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--beige-50)] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={localFilters.brands?.includes(brand) || false}
                      onChange={() => toggleArrayFilter('brands', brand)}
                      className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span className="text-sm">{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seller Filter */}
        {filterOptions.sellers.length > 0 && (
          <div className="p-4">
            <button
              onClick={() => toggleSection('seller')}
              className="w-full flex items-center justify-between text-left mb-2"
            >
              <span className="font-semibold text-[var(--brown-800)]">Seller</span>
              <svg
                className={`w-4 h-4 transition-transform ${expandedSections.seller ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSections.seller && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.sellers.map(seller => (
                  <label key={seller} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--beige-50)] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={localFilters.sellers?.includes(seller) || false}
                      onChange={() => toggleArrayFilter('sellers', seller)}
                      className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <span className="text-sm">{seller}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rating Filter */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between text-left mb-2"
          >
            <span className="font-semibold text-[var(--brown-800)]">Minimum Rating</span>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.rating && (
            <div className="space-y-2">
              {[4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange('rating', localFilters.rating === rating ? undefined : rating)}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 rounded text-sm transition-colors ${
                    localFilters.rating === rating
                      ? 'bg-[var(--accent)] text-white'
                      : 'hover:bg-[var(--beige-100)]'
                  }`}
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Other Filters */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('other')}
            className="w-full flex items-center justify-between text-left mb-2"
          >
            <span className="font-semibold text-[var(--brown-800)]">Other</span>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.other ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.other && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer hover:bg-[var(--beige-50)] p-1 rounded">
                <input
                  type="checkbox"
                  checked={localFilters.inStock || false}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-[var(--beige-50)] p-1 rounded">
                <input
                  type="checkbox"
                  checked={localFilters.onSale || false}
                  onChange={(e) => handleFilterChange('onSale', e.target.checked || undefined)}
                  className="rounded border-gray-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                />
                <span className="text-sm">On Sale</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
