'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import SearchBar from '@/components/SearchBar';
import AdvancedFilters from '@/components/AdvancedFilters';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { calculateReviewStats } from '@/utils/productReviews';
import { addToComparison, isInComparison, removeFromComparison } from '@/utils/comparison';
import { searchAndFilterProducts, sortSearchResults, paginateResults, extractFilterOptions } from '@/utils/search';
import AddToWishlistButton from '@/components/AddToWishlistButton';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '@/components/StarRating';
import FlashSaleBadge from '@/components/FlashSaleBadge';
import WholesaleBadge from '@/components/WholesaleBadge';
import { updateSaleStatuses, getProductSale, calculateSalePrice } from '@/utils/flashSaleUtils';
import { getProductPricingRules } from '@/utils/wholesaleUtils';
import type { SearchFilters, SortOption } from '@/types/search';
import type { FlashSale } from '@/types/flashSale';
import type { BulkPricingRule } from '@/types/wholesale';
import { getProductImageSrc, getProductImage } from '@/data/products';
import { DATA_SYNC_EVENTS, onDataSync } from '@/utils/dataSync';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [comparisonStates, setComparisonStates] = useState<{[key: number]: boolean}>({});
  const [productSales, setProductSales] = useState<{[key: number]: { sale: FlashSale; salePrice: number } | null}>({});
  const [productPricingRules, setProductPricingRules] = useState<{[key: number]: BulkPricingRule | null}>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced search state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchQuery,
    category: categoryQuery || undefined,
  });
  const [sortBy, setSortBy] = useState<SortOption['value']>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [paginatedProducts, setPaginatedProducts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    brands: [] as string[],
    sellers: [] as string[],
    categories: [] as string[],
    tags: [] as string[],
    priceRange: { min: 0, max: 50000 },
  });

  // Load products from localStorage on mount
  useEffect(() => {
    const loadProducts = () => {
      // Get admin products from localStorage
      const adminProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
      const reviewsData = JSON.parse(localStorage.getItem('reyah_reviews') || '[]');
      
      // Default products if no admin products exist
      const defaultProducts = [
        // Handmade Jewelry
        { id: 1, name: 'Handcrafted Silver Ring Set', price: 11999, category: 'Handmade Jewelry', brand: 'Artisan Metals', tags: ['silver', 'ring', 'handmade', 'jewelry'], image: getProductImageSrc(1), stock: 10 },
        { id: 2, name: 'Beaded Necklace with Pendant', price: 8645, category: 'Handmade Jewelry', brand: 'Artisan Metals', tags: ['beads', 'necklace', 'pendant', 'jewelry'], image: getProductImageSrc('Beaded Necklace with Pendant'), stock: 15 },
        { id: 3, name: 'Custom Copper Earrings', price: 5717, category: 'Handmade Jewelry', brand: 'Copper Craft', tags: ['copper', 'earrings', 'custom', 'jewelry'], image: getProductImageSrc('Custom Copper Earrings'), stock: 8 },
        { id: 4, name: 'Leather Wrap Bracelet', price: 5120, category: 'Handmade Jewelry', brand: 'Leather Works', tags: ['leather', 'bracelet', 'wrap', 'jewelry'], image: getProductImageSrc('Leather Wrap Bracelet'), stock: 12 },
        { id: 5, name: 'Gemstone Pendant Necklace', price: 9200, category: 'Handmade Jewelry', brand: 'Gem Artisans', tags: ['gemstone', 'pendant', 'necklace', 'jewelry'], image: getProductImageSrc('Gemstone Pendant Necklace'), stock: 6 },

        // Artisan Home Decor
        { id: 6, name: 'Custom Macrame Wall Hanging', price: 10639, category: 'Artisan Home Decor', brand: 'Knot & Weave', tags: ['macrame', 'wall hanging', 'decor', 'handmade'], image: getProductImageSrc(5), stock: 5 },
        { id: 7, name: 'Hand-Painted Ceramic Vase', price: 7314, category: 'Artisan Home Decor', brand: 'Pottery Studio', tags: ['ceramic', 'vase', 'painted', 'pottery'], image: getProductImageSrc('Hand-Painted Ceramic Vase'), stock: 7 },
        { id: 8, name: 'Artisan Scented Candle Set', price: 5985, salePrice: 4788, category: 'Artisan Home Decor', brand: 'Wax & Wick', tags: ['candles', 'scented', 'artisan', 'set'], image: getProductImageSrc('Artisan Scented Candle Set'), stock: 20 },
        { id: 9, name: 'Handwoven Throw Pillow', price: 4387, category: 'Artisan Home Decor', brand: 'Textile Art', tags: ['pillow', 'woven', 'throw', 'textile'], image: getProductImageSrc('Handwoven Throw Pillow'), stock: 14 },
        { id: 10, name: 'Wooden Wall Art Panel', price: 8500, category: 'Artisan Home Decor', brand: 'Wood Craft Studio', tags: ['wooden', 'wall art', 'panel', 'decor'], image: getProductImageSrc('Wooden Wall Art Panel'), stock: 8 },

        // Vintage & Antiques
        { id: 11, name: 'Vintage Leather Journal', price: 6117, category: 'Vintage and Antiques', brand: 'Vintage Finds', tags: ['vintage', 'leather', 'journal', 'notebook'], image: getProductImageSrc(3), stock: 6 },
        { id: 12, name: 'Antique Brass Candlestick', price: 9044, category: 'Vintage and Antiques', brand: 'Antique Collection', tags: ['antique', 'brass', 'candlestick', 'vintage'], image: getProductImageSrc('Antique Brass Candlestick'), stock: 3 },
        { id: 13, name: 'Vintage Ceramic Planter', price: 5717, salePrice: 4574, category: 'Vintage and Antiques', brand: 'Vintage Garden', tags: ['vintage', 'ceramic', 'planter', 'pot'], image: getProductImageSrc('Vintage Ceramic Planter'), stock: 9 },
        { id: 14, name: 'Retro Wooden Photo Frame', price: 3791, category: 'Vintage and Antiques', brand: 'Retro Memories', tags: ['retro', 'wooden', 'frame', 'photo'], image: getProductImageSrc('Retro Wooden Photo Frame'), stock: 18 },
        { id: 15, name: 'Antique Clock', price: 12500, category: 'Vintage and Antiques', brand: 'Timeless Treasures', tags: ['antique', 'clock', 'vintage', 'timepiece'], image: getProductImageSrc('Antique Clock'), stock: 4 },

        // Eco-Friendly Products
        { id: 21, name: 'Organic Beeswax Food Wraps', price: 3324, category: 'Eco-Friendly', brand: 'Green Living', tags: ['beeswax', 'food wrap', 'eco', 'zero waste'], image: getProductImageSrc(2), stock: 25 },
        { id: 22, name: 'Reusable Produce Bags (5 Pack)', price: 2526, salePrice: 2021, category: 'Eco-Friendly', brand: 'Eco Essentials', tags: ['reusable', 'bags', 'produce', 'eco'], image: getProductImageSrc('Reusable Produce Bags (5 Pack)'), stock: 30 },
        { id: 23, name: 'Handmade Natural Soap Set', price: 3856, category: 'Eco-Friendly', brand: 'Natural Bath', tags: ['soap', 'natural', 'handmade', 'organic'], image: getProductImageSrc(6), stock: 22 },
        { id: 24, name: 'Bamboo Cutlery Set', price: 2993, category: 'Eco-Friendly', brand: 'Bamboo Goods', tags: ['bamboo', 'cutlery', 'eco', 'sustainable'], image: getProductImageSrc('Bamboo Cutlery Set'), stock: 16 },
      ];

      // Merge admin products with default products, converting admin product structure
      const convertedAdminProducts = adminProducts.map((p: any) => {
        const seller = users.find((u: any) => u.id === p.sellerId);
        const sellerReviews = reviewsData.filter((r: any) => r.sellerId === p.sellerId && !r.isSupplierReview);
        const sellerRating = sellerReviews.length > 0 
          ? sellerReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / sellerReviews.length 
          : 0;
        
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          salePrice: p.salePrice,
          category: p.category,
          brand: seller?.sellerName || p.brand || 'Unknown Seller',
          tags: p.tags || [p.category.toLowerCase(), p.name.toLowerCase()],
          image: p.image || '',
          description: p.description || '',
          stock: p.stock || 0,
          sellerId: p.sellerId,
          sellerName: seller?.sellerName,
          sellerRating: sellerRating,
          sellerReviewCount: sellerReviews.length
        };
      });

      const combinedProducts = [...convertedAdminProducts, ...defaultProducts];
      setAllProducts(combinedProducts);
      setReviews(reviewsData);
      
      // Extract filter options
      const options = extractFilterOptions(combinedProducts, reviewsData);
      setFilterOptions(options);
    };

    loadProducts();
  }, []);

  // Initialize comparison states when products load
  useEffect(() => {
    const states: {[key: number]: boolean} = {};
    allProducts.forEach(p => {
      states[p.id] = isInComparison(p.id);
    });
    setComparisonStates(states);
  }, [allProducts]);

  // Load flash sales and calculate sale prices
  useEffect(() => {
    updateSaleStatuses();
    
    const salesMap: {[key: number]: { sale: FlashSale; salePrice: number } | null} = {};
    const rulesMap: {[key: number]: BulkPricingRule | null} = {};
    
    allProducts.forEach(product => {
      const sale = getProductSale(product.id);
      if (sale) {
        const salePrice = calculateSalePrice(product.price, sale);
        salesMap[product.id] = { sale, salePrice };
      } else {
        salesMap[product.id] = null;
      }
      
      const rules = getProductPricingRules(product.id);
      const rule = rules.length > 0 ? rules[0] : null; // Use first active rule
      rulesMap[product.id] = rule;
    });
    
    setProductSales(salesMap);
    setProductPricingRules(rulesMap);
    
    // Refresh sale statuses every minute
    const interval = setInterval(() => {
      updateSaleStatuses();
      const updatedSalesMap: {[key: number]: { sale: FlashSale; salePrice: number } | null} = {};
      const updatedRulesMap: {[key: number]: BulkPricingRule | null} = {};
      
      allProducts.forEach(product => {
        const sale = getProductSale(product.id);
        if (sale) {
          const salePrice = calculateSalePrice(product.price, sale);
          updatedSalesMap[product.id] = { sale, salePrice };
        } else {
          updatedSalesMap[product.id] = null;
        }
        
        const rules = getProductPricingRules(product.id);
        const rule = rules.length > 0 ? rules[0] : null; // Use first active rule
        updatedRulesMap[product.id] = rule;
      });
      
      setProductSales(updatedSalesMap);
      setProductPricingRules(updatedRulesMap);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [allProducts]);

  // Listen for data sync events
  useEffect(() => {
    const cleanup = onDataSync(DATA_SYNC_EVENTS.PRODUCTS_UPDATED, () => {
      // Reload products when they're updated
      const adminProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
      
      const sellerProducts = users
        .filter((user: any) => user.role === 'seller' && user.products)
        .flatMap((seller: any) => 
          seller.products.map((product: any) => ({
            ...product,
            sellerName: seller.businessName || `${seller.firstName} ${seller.lastName}`,
            sellerRating: seller.rating || 0
          }))
        );

      const combined = adminProducts.length > 0 ? [...adminProducts, ...sellerProducts] : allProducts;
      setAllProducts(combined);
    });
    
    return cleanup;
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    // Search and filter products
    const searchResults = searchAndFilterProducts(allProducts, filters, reviews);
    
    // Sort results
    const sorted = sortSearchResults(searchResults, sortBy);
    
    setFilteredProducts(sorted);
    
    // Paginate results
    const { items, pagination } = paginateResults(sorted, currentPage, perPage);
    setPaginatedProducts(items);
    setTotalPages(pagination.totalPages);
  }, [filters, sortBy, allProducts, reviews, currentPage, perPage]);

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    setCurrentPage(1);
    router.push(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption['value']) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: any) => {
    const saleInfo = productSales[product.id];
    const priceToUse = saleInfo ? saleInfo.salePrice : product.price;
    
    addToCart({
      id: product.id,
      name: product.name,
      price: priceToUse,
      image: product.image || getProductImage(product.id) || getProductImage(product.name),
      category: product.category,
      inStock: product.stock > 0 || true
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const handleToggleComparison = (productId: number) => {
    const inComp = comparisonStates[productId];
    
    if (inComp) {
      removeFromComparison(productId);
      setComparisonStates(prev => ({ ...prev, [productId]: false }));
    } else {
      const added = addToComparison(productId);
      if (added) {
        setComparisonStates(prev => ({ ...prev, [productId]: true }));
      } else {
        alert('Maximum number of products reached for comparison. Please remove some products first.');
      }
    }
  };

  const sortOptions: { label: string; value: SortOption['value'] }[] = [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Top Rated', value: 'rating' },
    { label: 'Newest', value: 'newest' },
    { label: 'Most Popular', value: 'popular' },
  ];

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">
              {filters.query ? `Search: "${filters.query}"` : 'Shop All Products'}
            </h1>
            <p className="text-[var(--brown-700)]">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              initialQuery={filters.query}
              onSearch={handleSearch}
              products={allProducts}
              showVoiceSearch={true}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between bg-white border border-[var(--beige-300)] rounded-lg px-4 py-3 font-semibold text-[var(--brown-800)]"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Filters Sidebar - Desktop */}
            <aside className={`w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-32">
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  filterOptions={filterOptions}
                />
              </div>
            </aside>

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {/* Sort and View Options */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--beige-300)]">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-[var(--brown-800)]">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOption['value'])}
                    className="border border-[var(--beige-300)] rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-[var(--accent)]"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-[var(--brown-700)]">
                  Page {currentPage} of {totalPages}
                </div>
              </div>

              {/* Products Grid */}
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto text-[var(--beige-300)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-[var(--brown-800)] mb-2">No products found</h3>
                  <p className="text-[var(--brown-700)] mb-6">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setFilters({ query: '' });
                      setSortBy('relevance');
                      setCurrentPage(1);
                    }}
                    className="bg-[var(--accent)] text-white px-6 py-2 rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => {
                      const saleInfo = productSales[product.id];
                      const pricingRule = productPricingRules[product.id];
                      
                      return (
                    <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[var(--beige-300)]">
                      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--brown-700)] text-sm p-4 text-center font-medium">
                            {product.name}
                          </div>
                        )}
                        {saleInfo && (
                          <FlashSaleBadge
                            sale={saleInfo.sale}
                            originalPrice={product.price}
                            size="md"
                            position="top-right"
                          />
                        )}
                        {!saleInfo && pricingRule && (
                          <div className="absolute top-4 left-4">
                            <WholesaleBadge size="sm" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[var(--accent)] opacity-0 group-hover:opacity-10 transition-opacity" />
                      </Link>
                      <div className="p-4 space-y-2">
                        <p className="text-xs text-[var(--accent)] uppercase tracking-wider font-semibold">{product.category}</p>
                        <Link href={`/product/${product.id}`}>
                          <h3 className="font-bold text-[var(--brown-800)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                        
                        {/* Seller Info */}
                        {product.sellerName && (
                          <div className="flex items-center justify-between py-1">
                            <Link 
                              href={`/seller/profile/${encodeURIComponent(product.sellerName)}`}
                              className="flex items-center gap-2 text-xs text-green-700 hover:text-green-800 font-medium"
                            >
                              <span className="px-2 py-0.5 bg-green-100 rounded border border-green-300">
                                ✓ {product.sellerName}
                              </span>
                            </Link>
                            {product.sellerRating > 0 && (
                              <StarRating 
                                rating={product.sellerRating} 
                                size="sm" 
                                showNumber={false}
                              />
                            )}
                          </div>
                        )}

                        {/* Product Reviews */}
                        {(() => {
                          const stats = calculateReviewStats(product.id);
                          if (stats.totalReviews > 0) {
                            return (
                              <div className="flex items-center gap-2 py-1">
                                <div className="flex items-center gap-1">
                                  <StarRating 
                                    rating={stats.averageRating} 
                                    size="sm" 
                                    showNumber={false}
                                  />
                                  <span className="text-xs font-semibold text-[var(--brown-800)]">
                                    {stats.averageRating.toFixed(1)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        <div className="flex items-center justify-between pt-2">
                          {saleInfo ? (
                            <div className="flex flex-col gap-0.5">
                              <p className="text-lg text-red-600 font-bold">KSH {saleInfo.salePrice.toLocaleString()}</p>
                              <p className="text-sm text-gray-500 line-through">KSH {product.price.toLocaleString()}</p>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-0.5">
                              <p className="text-lg text-[var(--brown-800)] font-bold">KSH {product.price.toLocaleString()}</p>
                              {pricingRule && (
                                <p className="text-xs text-blue-600 font-semibold">Bulk pricing available</p>
                              )}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <AddToWishlistButton
                              productId={product.id}
                              productName={product.name}
                              productPrice={product.price}
                              productImage={product.image || ''}
                              productCategory={product.category}
                              variant="icon"
                              size="sm"
                            />
                            <button 
                              onClick={() => handleToggleComparison(product.id)}
                              className={`p-1.5 rounded-md text-sm transition-colors ${
                                comparisonStates[product.id]
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-[var(--beige-300)] text-[var(--accent)] hover:bg-[var(--beige-50)]'
                              }`}
                              title={comparisonStates[product.id] ? 'Remove from comparison' : 'Add to comparison'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                addedToCart === product.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-[var(--accent)] text-white hover:bg-[var(--brown-600)]'
                              }`}
                            >
                              {addedToCart === product.id ? '✓ Added' : 'Add to Cart'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>

                {/* Pagination Controls */}
                {paginatedProducts.length > 0 && totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, filteredProducts.length)} of {filteredProducts.length} products
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-[var(--beige-300)] text-[var(--accent)] hover:bg-[var(--beige-50)]'
                        }`}
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage = 
                            page === 1 || 
                            page === totalPages || 
                            (page >= currentPage - 1 && page <= currentPage + 1);
                          
                          const showEllipsis = 
                            (page === currentPage - 2 && currentPage > 3) ||
                            (page === currentPage + 2 && currentPage < totalPages - 2);

                          if (showEllipsis) {
                            return <span key={page} className="px-2 text-gray-400">...</span>;
                          }

                          if (!showPage) return null;

                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`min-w-[40px] px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-[var(--accent)] text-white'
                                  : 'bg-white border border-[var(--beige-300)] text-[var(--accent)] hover:bg-[var(--beige-50)]'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      {/* Mobile: Current Page Indicator */}
                      <div className="sm:hidden px-4 py-2 bg-white border border-[var(--beige-300)] rounded-md text-sm font-medium text-[var(--accent)]">
                        {currentPage} / {totalPages}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-[var(--beige-300)] text-[var(--accent)] hover:bg-[var(--beige-50)]'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-32 pb-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-600">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
