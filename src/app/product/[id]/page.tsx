'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/types/message';
import { ProductReview } from '@/types/productReview';
import { 
  getProductReviews, 
  calculateReviewStats, 
  sortReviews,
  hasCustomerReviewed,
  hasCustomerPurchased 
} from '@/utils/productReviews';
import ProductReviewDisplay from '@/components/ProductReviewDisplay';
import ProductReviewForm from '@/components/ProductReviewForm';
import ProductQA from '@/components/ProductQA';
import { addToComparison, isInComparison, removeFromComparison } from '@/utils/comparison';
import AddToWishlistButton from '@/components/AddToWishlistButton';
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
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'rating-high' | 'rating-low' | 'helpful'>('date');
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);
  const [inComparison, setInComparison] = useState(false);

  const productId = parseInt(params.id as string);
  const product = allProducts.find(p => p.id === productId);

  useEffect(() => {
    if (product) {
      loadReviews();
      setInComparison(isInComparison(product.id));
    }
  }, [product, sortBy]);

  const loadReviews = () => {
    const productReviews = getProductReviews(productId, 'approved');
    const sorted = sortReviews(productReviews, sortBy);
    setReviews(sorted);
  };

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    loadReviews();
  };

  const handleEditReview = (review: ProductReview) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const canWriteReview = () => {
    if (!isAuthenticated || !user) return false;
    const alreadyReviewed = hasCustomerReviewed(productId, user.email);
    return !alreadyReviewed;
  };

  const stats = product ? calculateReviewStats(productId) : null;

  const handleToggleComparison = () => {
    if (!product) return;
    
    if (inComparison) {
      removeFromComparison(product.id);
      setInComparison(false);
    } else {
      const added = addToComparison(product.id);
      if (added) {
        setInComparison(true);
      } else {
        alert('Maximum number of products reached for comparison. Please remove some products first.');
      }
    }
  };

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

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user) return;

    // Get seller info from users
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
    const seller = users.find((u: any) => u.sellerName === product.seller);

    if (!seller) {
      alert('Seller not found');
      return;
    }

    // Create or find existing conversation
    const conversationId = [user.id, seller.id].sort().join('-');
    const allMessages = JSON.parse(localStorage.getItem('reyah_messages') || '[]');
    
    // Check if conversation exists
    const existingConversation = allMessages.find((msg: Message) => msg.conversationId === conversationId);

    if (!existingConversation) {
      // Create initial message
      const initialMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId,
        senderId: user.id,
        senderName: `${user.firstName} ${user.lastName}`,
        receiverId: seller.id,
        receiverName: seller.sellerName,
        message: `Hi! I'm interested in your product: ${product.name}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      allMessages.push(initialMessage);
      localStorage.setItem('reyah_messages', JSON.stringify(allMessages));
    }

    router.push('/messages');
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
                <div className="flex items-center justify-between mb-3">
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
                <button
                  onClick={handleContactSeller}
                  className="w-full bg-white border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded-lg font-semibold hover:bg-[var(--beige-50)] transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Seller
                </button>
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
              <div className="flex flex-col gap-3">
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
                    {addedToCart ? '✓ Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                  <AddToWishlistButton
                    productId={product.id}
                    productName={product.name}
                    productPrice={product.price}
                    productSalePrice={product.originalPrice}
                    productImage={product.images[0]}
                    productCategory={product.category}
                    variant="icon"
                    size="lg"
                  />
                  <button
                    onClick={handleToggleComparison}
                    className={`py-3 px-6 rounded-md font-bold transition-colors border-2 ${
                      inComparison
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--beige-50)]'
                    }`}
                    title={inComparison ? 'Remove from comparison' : 'Add to comparison'}
                  >
                    {inComparison ? '✓ In Comparison' : 'Compare'}
                  </button>
                </div>
              
                {inComparison && (
                  <Link
                    href="/compare"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    View Comparison →
                  </Link>
                )}

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`w-full py-3 px-6 rounded-md font-bold transition-colors ${
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

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--brown-800)]">Customer Reviews</h2>
              {canWriteReview() && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Write Review
                </button>
              )}
            </div>

            {/* Review Stats */}
            {stats && stats.totalReviews > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-[var(--beige-300)]">
                {/* Average Rating */}
                <div className="text-center md:text-left">
                  <div className="text-5xl font-bold text-[var(--brown-800)] mb-2">
                    {stats.averageRating.toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${
                          star <= Math.round(stats.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        fill={star <= Math.round(stats.averageRating) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600">
                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </p>
                  {stats.verifiedPurchaseCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.verifiedPurchaseCount} verified purchase{stats.verifiedPurchaseCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.ratingBreakdown[rating as 1 | 2 | 3 | 4 | 5] || 0;
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--brown-800)] w-12">
                          {rating} star
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-yellow-400 h-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && user && (
              <div className="mb-8">
                <ProductReviewForm
                  productId={productId}
                  productName={product.name}
                  customerName={`${user.firstName} ${user.lastName}`}
                  customerEmail={user.email}
                  existingReview={editingReview}
                  onSuccess={handleReviewSubmitSuccess}
                  onCancel={() => {
                    setShowReviewForm(false);
                    setEditingReview(null);
                  }}
                />
              </div>
            )}

            {/* Sort Options */}
            {reviews.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="date">Most Recent</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                    <option value="helpful">Most Helpful</option>
                  </select>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ProductReviewDisplay
                    key={review.id}
                    review={review}
                    currentUserEmail={user?.email || ''}
                    onEdit={handleEditReview}
                    showProductName={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
                <p className="text-gray-600 mb-4">Be the first to review this product!</p>
                {canWriteReview() && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="bg-[var(--accent)] text-white px-6 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                  >
                    Write the First Review
                  </button>
                )}
                {!isAuthenticated && (
                  <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
                    Sign in to write a review
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Q&A Section */}
          <div className="mt-12">
            <ProductQA productId={productId} productName={product.name} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
