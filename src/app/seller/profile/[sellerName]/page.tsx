'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import StarRating from '@/components/StarRating';
import ReviewDisplay from '@/components/ReviewDisplay';
import Link from 'next/link';
import Image from 'next/image';
import { Review, ReviewStats } from '@/types/review';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  sellerId?: string;
  sellerName?: string;
}

interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  sellerName: string;
  businessDescription?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  sellerTotalSales?: number;
  isSeller?: boolean;
}

export default function SellerProfilePage() {
  const params = useParams();
  const sellerName = decodeURIComponent(params.sellerName as string);
  
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load seller data
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
    const foundSeller = users.find((u: Seller) => u.sellerName === sellerName && u.isSeller);
    
    if (foundSeller) {
      setSeller(foundSeller);
      
      // Load seller's products
      const allProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const sellerProducts = allProducts.filter((p: Product) => p.sellerId === foundSeller.id);
      setProducts(sellerProducts);
      
      // Load seller's reviews
      const allReviews = JSON.parse(localStorage.getItem('reyah_reviews') || '[]');
      const sellerReviews = allReviews.filter((r: Review) => 
        r.sellerId === foundSeller.id && !r.isSupplierReview
      );
      setReviews(sellerReviews);
      
      // Calculate stats
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      sellerReviews.forEach((r: Review) => {
        breakdown[r.rating as keyof typeof breakdown]++;
      });
      
      const avgRating = sellerReviews.length > 0
        ? sellerReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / sellerReviews.length
        : 0;
      
      setStats({
        averageRating: avgRating,
        totalReviews: sellerReviews.length,
        ratingBreakdown: breakdown
      });
    }
    
    setLoading(false);
  }, [sellerName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-40 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-[var(--brown-700)]">Loading seller profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-40 pb-12 px-4">
          <div className="max-w-6xl mx-auto">
            <BackButton />
            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-12 text-center">
              <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2">Seller Not Found</h1>
              <p className="text-[var(--brown-700)] mb-6">The seller you're looking for doesn't exist.</p>
              <Link 
                href="/shop"
                className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          
          {/* Seller Header */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-white">
                  {seller.firstName[0]}{seller.lastName[0]}
                </span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[var(--brown-800)]">{seller.sellerName}</h1>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full border border-green-300">
                    ✓ Verified Seller
                  </span>
                </div>
                
                {seller.businessDescription && (
                  <p className="text-[var(--brown-700)] mb-4">{seller.businessDescription}</p>
                )}
                
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rating</p>
                    <StarRating rating={stats.averageRating} size="lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Reviews</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{stats.totalReviews}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Products</p>
                    <p className="text-2xl font-bold text-[var(--accent)]">{products.length}</p>
                  </div>
                  {seller.sellerTotalSales !== undefined && seller.sellerTotalSales > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-[var(--accent)]">{seller.sellerTotalSales}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Products Section */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-4">Products from {seller.sellerName}</h2>
              
              {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-8 text-center">
                  <p className="text-[var(--brown-700)]">No products available yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.id}`}
                      className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] relative overflow-hidden">
                        {product.image && typeof product.image === 'object' ? (
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-[var(--brown-800)] mb-2">{product.name}</h3>
                        <p className="text-xl font-bold text-[var(--accent)]">KSH {product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-4">Customer Reviews</h2>
              
              {/* Rating Breakdown */}
              {stats.totalReviews > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 mb-4">
                  <div className="text-center mb-4">
                    <p className="text-4xl font-bold text-[var(--accent)] mb-1">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <StarRating rating={stats.averageRating} size="lg" showNumber={false} />
                    <p className="text-sm text-gray-600 mt-2">{stats.totalReviews} reviews</p>
                  </div>
                  
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown];
                      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                      
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm font-semibold w-8">{rating}★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Reviews List */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-600">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review) => (
                      <ReviewDisplay key={review.id} review={review} />
                    ))}
                    {reviews.length > 5 && (
                      <p className="text-center text-sm text-gray-600 pt-4 border-t">
                        +{reviews.length - 5} more reviews
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
