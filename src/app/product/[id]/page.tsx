'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

// Sample product data - in a real app, this would come from an API/database
const allProducts = [
  // Flash Deals
  { id: 1, name: 'Handcrafted Silver Ring Set', price: 11999, originalPrice: 19500, category: 'Jewelry', seller: 'Artisan Metals Kenya', sellerRating: 4.8, description: 'Beautiful handcrafted silver ring set featuring intricate designs. Made from 925 sterling silver by skilled artisans. Perfect for special occasions or everyday wear.', rating: 4.9, reviews: 234, stock: 50, images: ['JW'], features: ['925 Sterling Silver', 'Handcrafted', 'Adjustable Size', 'Gift Boxed'], specifications: { Material: 'Sterling Silver', Weight: '12g', Origin: 'Kenya' } },
  { id: 2, name: 'Organic Beeswax Food Wraps', price: 3299, originalPrice: 4650, category: 'Eco-Friendly', seller: 'Green Living KE', sellerRating: 4.9, description: 'Reusable organic beeswax food wraps - an eco-friendly alternative to plastic wrap. Made from organic cotton and sustainably sourced beeswax. Set of 5 in various sizes.', rating: 4.9, reviews: 189, stock: 45, images: ['EC'], features: ['100% Organic Cotton', 'Reusable', 'Biodegradable', 'Set of 5'], specifications: { Material: 'Organic Cotton & Beeswax', Sizes: 'Small, Medium, Large', Care: 'Hand wash cold water' } },
  { id: 3, name: 'Vintage Leather Journal', price: 6099, originalPrice: 8650, category: 'Vintage', seller: 'Heritage Crafts', sellerRating: 4.7, description: 'Authentic vintage-style leather journal with handmade paper. Features a leather strap closure and aged paper for a classic feel. Perfect for writers and artists.', rating: 4.8, reviews: 156, stock: 60, images: ['VG'], features: ['Genuine Leather', 'Handmade Paper', '200 Pages', 'Strap Closure'], specifications: { Size: '6x8 inches', Pages: '200', Binding: 'Hand-stitched' } },
  { id: 4, name: 'Artisan Coffee Blend - 500g', price: 4399, originalPrice: 5999, category: 'Food', seller: 'Kenyan Coffee Co.', sellerRating: 5.0, description: 'Premium artisan coffee blend sourced from the highlands of Kenya. Medium roast with notes of chocolate and citrus. Freshly roasted to order.', rating: 5.0, reviews: 312, stock: 30, images: ['FD'], features: ['Single Origin', 'Medium Roast', 'Freshly Roasted', 'Fair Trade'], specifications: { Weight: '500g', Origin: 'Kenya Highlands', Roast: 'Medium' } },
  
  // Trending
  { id: 5, name: 'Custom Macrame Wall Hanging', price: 10599, originalPrice: 14650, category: 'Home Decor', seller: 'Knot & Weave', sellerRating: 4.8, description: 'Beautiful custom macrame wall hanging, handcrafted using premium cotton cord. Adds a bohemian touch to any space. Can be customized in size and color.', rating: 4.8, reviews: 145, stock: 25, images: ['HD'], features: ['100% Cotton', 'Handcrafted', 'Custom Sizes', 'Boho Style'], specifications: { Material: 'Cotton Cord', Size: '24x36 inches', Weight: '800g' } },
  { id: 6, name: 'Handmade Natural Soap Set', price: 3849, originalPrice: 5320, category: 'Wellness', seller: 'Natural Beauty Kenya', sellerRating: 4.9, description: 'Set of 6 handmade natural soaps using organic ingredients. Free from harsh chemicals and synthetic fragrances. Gentle on sensitive skin.', rating: 4.9, reviews: 267, stock: 80, images: ['WL'], features: ['All Natural', 'Chemical Free', 'Set of 6', 'Various Scents'], specifications: { Weight: '100g each', Ingredients: 'Organic oils & herbs', 'Shelf Life': '12 months' } },
];

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  const productId = parseInt(params.id as string);
  const product = allProducts.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-32 pb-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-4">Product Not Found</h1>
            <Link href="/shop" className="text-[var(--accent)] hover:underline">
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category,
        inStock: product.stock > 0
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded-lg overflow-hidden border border-[var(--beige-300)]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl font-bold text-[var(--brown-600)]">{product.images[selectedImage]}</span>
                </div>
                {product.originalPrice && (
                  <div className="absolute top-4 left-4 bg-[var(--accent)] text-white px-3 py-1.5 rounded-md text-sm font-bold">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-[var(--accent)] font-semibold">{product.category}</span>
                  {product.stock > 0 ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">In Stock</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Out of Stock</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-4">{product.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-500">
                      {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span className="text-sm font-semibold text-[var(--brown-800)]">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="bg-[var(--beige-50)] p-4 rounded-lg mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-[var(--accent)]">
                      KSH {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        KSH {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border border-[var(--beige-300)] rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-[var(--brown-800)] mb-2">Sold by</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/seller/${product.seller.toLowerCase().replace(/\s+/g, '-')}`} className="text-[var(--accent)] font-semibold hover:underline">
                      {product.seller}
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex text-yellow-500 text-sm">
                        {'★'.repeat(Math.floor(product.sellerRating))}{'☆'.repeat(5 - Math.floor(product.sellerRating))}
                      </div>
                      <span className="text-sm text-gray-600">({product.sellerRating})</span>
                    </div>
                  </div>
                  <Link 
                    href={`/seller/${product.seller.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm text-[var(--accent)] hover:underline font-medium"
                  >
                    Visit Shop →
                  </Link>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--brown-800)]">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border-2 border-[var(--beige-300)] rounded-md hover:border-[var(--accent)] transition-colors flex items-center justify-center font-bold text-[var(--brown-800)]"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 h-10 border-2 border-[var(--beige-300)] rounded-md text-center font-semibold text-[var(--brown-800)] focus:outline-none focus:border-[var(--accent)]"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 border-2 border-[var(--beige-300)] rounded-md hover:border-[var(--accent)] transition-colors flex items-center justify-center font-bold text-[var(--brown-800)]"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600">{product.stock} available</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 px-6 rounded-md font-bold transition-colors ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[var(--accent)] text-white hover:bg-[var(--brown-600)]'
                  }`}
                >
                  {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 px-6 rounded-md font-bold transition-colors ${
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[var(--brown-800)] text-white hover:bg-[var(--brown-700)]'
                  }`}
                >
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--beige-300)]">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-1 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <p className="text-xs text-[var(--brown-700)] font-medium">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-1 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-[var(--brown-700)] font-medium">Authentic</p>
                </div>
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-1 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-xs text-[var(--brown-700)] font-medium">Easy Returns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 mb-8">
            <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-4">Product Description</h2>
            <p className="text-[var(--brown-700)] leading-relaxed mb-6">{product.description}</p>

            <h3 className="text-xl font-bold text-[var(--brown-800)] mb-3">Features</h3>
            <ul className="space-y-2 mb-6">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[var(--brown-700)]">
                  <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-bold text-[var(--brown-800)] mb-3">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex border-b border-[var(--beige-300)] pb-2">
                  <span className="font-semibold text-[var(--brown-800)] w-1/3">{key}:</span>
                  <span className="text-[var(--brown-700)]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
