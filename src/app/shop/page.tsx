'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useCart } from '@/context/CartContext';
import { calculateReviewStats } from '@/utils/productReviews';
import { addToComparison, isInComparison, removeFromComparison } from '@/utils/comparison';
import Link from 'next/link';
import StarRating from '@/components/StarRating';

function ShopContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [comparisonStates, setComparisonStates] = useState<{[key: number]: boolean}>({});
  
  const [selectedCategory, setSelectedCategory] = useState(categoryQuery);
  const [selectedSeller, setSelectedSeller] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 40000]);
  const [sellers, setSellers] = useState<string[]>([]);

  const categories = ['All Products', 'Jewelry', 'Home Decor', 'Vintage', 'Art', 'Crafts', 'Eco-Friendly', 'Food', 'Clothing', 'Wellness', 'Kids', 'Books'];

  // Load products from localStorage on mount
  useEffect(() => {
    const loadProducts = () => {
      // Get admin products from localStorage
      const adminProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
      const reviews = JSON.parse(localStorage.getItem('reyah_reviews') || '[]');
      
      // Default products if no admin products exist
      const defaultProducts = [
        // Handmade Jewelry
        { id: 1, name: 'Handcrafted Silver Ring Set', price: 11999, category: 'Jewelry', brand: 'Artisan Metals', tags: ['silver', 'ring', 'handmade', 'jewelry'], image: '' },
        { id: 2, name: 'Beaded Necklace with Pendant', price: 8645, category: 'Jewelry', brand: 'Artisan Metals', tags: ['beads', 'necklace', 'pendant', 'jewelry'], image: '' },
        { id: 3, name: 'Custom Copper Earrings', price: 5717, category: 'Jewelry', brand: 'Copper Craft', tags: ['copper', 'earrings', 'custom', 'jewelry'], image: '' },
        { id: 4, name: 'Leather Wrap Bracelet', price: 5120, category: 'Jewelry', brand: 'Leather Works', tags: ['leather', 'bracelet', 'wrap', 'jewelry'], image: '' },

        // Artisan Home Decor
        { id: 5, name: 'Custom Macrame Wall Hanging', price: 10639, category: 'Home Decor', brand: 'Knot & Weave', tags: ['macrame', 'wall hanging', 'decor', 'handmade'], image: '' },
        { id: 6, name: 'Hand-Painted Ceramic Vase', price: 7314, category: 'Home Decor', brand: 'Pottery Studio', tags: ['ceramic', 'vase', 'painted', 'pottery'], image: '' },
        { id: 7, name: 'Artisan Scented Candle Set', price: 5985, category: 'Home Decor', brand: 'Wax & Wick', tags: ['candles', 'scented', 'artisan', 'set'], image: '' },
        { id: 8, name: 'Handwoven Throw Pillow', price: 4387, category: 'Home Decor', brand: 'Textile Art', tags: ['pillow', 'woven', 'throw', 'textile'], image: '' },

        // Vintage & Antiques
        { id: 9, name: 'Vintage Leather Journal', price: 6117, category: 'Vintage', brand: 'Vintage Finds', tags: ['vintage', 'leather', 'journal', 'notebook'], image: '' },
        { id: 10, name: 'Antique Brass Candlestick', price: 9044, category: 'Vintage', brand: 'Antique Collection', tags: ['antique', 'brass', 'candlestick', 'vintage'], image: '' },
        { id: 11, name: 'Vintage Ceramic Planter', price: 5717, category: 'Vintage', brand: 'Vintage Garden', tags: ['vintage', 'ceramic', 'planter', 'pot'], image: '' },
        { id: 12, name: 'Retro Wooden Photo Frame', price: 3791, category: 'Vintage', brand: 'Retro Memories', tags: ['retro', 'wooden', 'frame', 'photo'], image: '' },

        // Eco-Friendly Products
        { id: 21, name: 'Organic Beeswax Food Wraps', price: 3324, category: 'Eco-Friendly', brand: 'Green Living', tags: ['beeswax', 'food wrap', 'eco', 'zero waste'], image: '' },
        { id: 22, name: 'Reusable Produce Bags (5 Pack)', price: 2526, category: 'Eco-Friendly', brand: 'Eco Essentials', tags: ['reusable', 'bags', 'produce', 'eco'], image: '' },
        { id: 23, name: 'Handmade Natural Soap Set', price: 3856, category: 'Eco-Friendly', brand: 'Natural Bath', tags: ['soap', 'natural', 'handmade', 'organic'], image: '' },
        { id: 24, name: 'Bamboo Cutlery Set', price: 2993, category: 'Eco-Friendly', brand: 'Bamboo Goods', tags: ['bamboo', 'cutlery', 'eco', 'sustainable'], image: '' },
      ];

      // Merge admin products with default products, converting admin product structure
      const convertedAdminProducts = adminProducts.map((p: any) => {
        const seller = users.find((u: any) => u.id === p.sellerId);
        const sellerReviews = reviews.filter((r: any) => r.sellerId === p.sellerId && !r.isSupplierReview);
        const sellerRating = sellerReviews.length > 0 
          ? sellerReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / sellerReviews.length 
          : 0;
        
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          brand: seller?.sellerName || 'Unknown Seller',
          tags: [p.category.toLowerCase(), p.name.toLowerCase()],
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
      setFilteredProducts(combinedProducts);
      
      // Extract unique sellers
      const uniqueSellers = Array.from(new Set(
        convertedAdminProducts
          .filter((p: any) => p.sellerName)
          .map((p: any) => p.sellerName)
      )) as string[];
      setSellers(uniqueSellers);
    };

    loadProducts();
    
    // Initialize comparison states
    const states: {[key: number]: boolean} = {};
    allProducts.forEach(p => {
      states[p.id] = isInComparison(p.id);
    });
    setComparisonStates(states);
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.category.substring(0, 2).toUpperCase(),
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

  useEffect(() => {
    let results = allProducts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All Products') {
      results = results.filter(product => product.category === selectedCategory);
    }

    // Filter by seller
    if (selectedSeller) {
      results = results.filter(product => product.sellerName === selectedSeller);
    }

    // Filter by price range
    results = results.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(results);
  }, [searchQuery, selectedCategory, selectedSeller, priceRange, allProducts]);
  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--brown-800)] mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop All'}
            </h1>
            <p className="text-[var(--brown-700)] text-lg">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-[var(--beige-50)] p-6 rounded-lg border border-[var(--beige-300)] sticky top-32">
                <h3 className="font-bold text-[var(--brown-800)] mb-4 text-lg">Filters</h3>
                
                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-semibold text-[var(--brown-800)] mb-3 text-sm uppercase tracking-wide">Categories</h4>
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => setSelectedCategory(category === 'All Products' ? '' : category)}
                          className={`text-sm transition-colors w-full text-left px-3 py-1.5 rounded ${
                            (category === 'All Products' && !selectedCategory) || selectedCategory === category
                              ? 'bg-[var(--accent)] text-white font-medium'
                              : 'text-[var(--brown-700)] hover:text-[var(--accent)] hover:bg-[var(--beige-200)]'
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sellers */}
                {sellers.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-[var(--brown-800)] mb-3 text-sm uppercase tracking-wide">Sellers</h4>
                    <ul className="space-y-2">
                      <li>
                        <button
                          onClick={() => setSelectedSeller('')}
                          className={`text-sm transition-colors w-full text-left px-3 py-1.5 rounded ${
                            !selectedSeller
                              ? 'bg-[var(--accent)] text-white font-medium'
                              : 'text-[var(--brown-700)] hover:text-[var(--accent)] hover:bg-[var(--beige-200)]'
                          }`}
                        >
                          All Sellers
                        </button>
                      </li>
                      {sellers.map((seller) => (
                        <li key={seller}>
                          <button
                            onClick={() => setSelectedSeller(seller)}
                            className={`text-sm transition-colors w-full text-left px-3 py-1.5 rounded ${
                              selectedSeller === seller
                                ? 'bg-[var(--accent)] text-white font-medium'
                                : 'text-[var(--brown-700)] hover:text-[var(--accent)] hover:bg-[var(--beige-200)]'
                            }`}
                          >
                            {seller}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold text-[var(--brown-800)] mb-3 text-sm uppercase tracking-wide">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-[var(--brown-700)]">
                      <span>KSH {priceRange[0].toLocaleString()}</span>
                      <span>KSH {priceRange[1].toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40000"
                      step="1000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-[var(--accent)]"
                    />
                    <button
                      onClick={() => setPriceRange([0, 40000])}
                      className="text-xs text-[var(--accent)] hover:text-[var(--brown-600)] font-medium"
                    >
                      Reset Price
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <svg className="w-24 h-24 mx-auto text-[var(--beige-300)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-[var(--brown-800)] mb-2">No products found</h3>
                  <p className="text-[var(--brown-700)] mb-6">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPriceRange([0, 40000]);
                      window.history.pushState({}, '', '/shop');
                    }}
                    className="bg-[var(--accent)] text-white px-6 py-2 rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[var(--beige-300)]">
                      <Link href={`/product/${product.id}`} className="relative block aspect-square bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--brown-700)] text-sm p-4 text-center font-medium">
                            {product.name}
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
                          <p className="text-lg text-[var(--brown-800)] font-bold">KSH {product.price.toLocaleString()}</p>
                          <div className="flex gap-2">
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
                  ))}
                </div>
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
