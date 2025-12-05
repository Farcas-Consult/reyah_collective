'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import Image from 'next/image';
import { getOrders, type Order } from '@/utils/orders';
import ReviewForm from '@/components/ReviewForm';
import { Review } from '@/types/review';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const userOrders = getOrders();
    // Sort by date, newest first
    const sortedOrders = userOrders.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setOrders(sortedOrders);
    setLoading(false);
  }, []);

  const hasReviewed = (orderId: string): boolean => {
    const reviews = JSON.parse(localStorage.getItem('reyah_reviews') || '[]');
    return reviews.some((r: Review) => r.orderId === orderId);
  };

  const handleSubmitReview = (review: Review) => {
    // Save review to localStorage
    const reviews = JSON.parse(localStorage.getItem('reyah_reviews') || '[]');
    reviews.push(review);
    localStorage.setItem('reyah_reviews', JSON.stringify(reviews));

    // Update seller ratings
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
    const sellerIndex = users.findIndex((u: { id: string }) => u.id === review.sellerId);
    
    if (sellerIndex !== -1) {
      const seller = users[sellerIndex];
      const sellerReviews = reviews.filter((r: Review) => r.sellerId === review.sellerId && !r.isSupplierReview);
      const avgRating = sellerReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / sellerReviews.length;
      
      seller.sellerRating = avgRating;
      seller.sellerReviewCount = sellerReviews.length;
      
      localStorage.setItem('reyah_users', JSON.stringify(users));
    }

    setReviewingOrder(null);
    alert('Review submitted successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-32 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-[var(--brown-700)]">Loading your orders...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">My Orders</h1>
              <p className="text-[var(--brown-700)]">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            /* No Orders */
            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-[var(--beige-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-2">No orders yet</h2>
              <p className="text-[var(--brown-700)] mb-6">Start shopping and your orders will appear here!</p>
              <Link 
                href="/shop" 
                className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b border-[var(--beige-300)]">
                      <div>
                        <Link 
                          href={`/account/orders/${order.id}`}
                          className="text-xl font-bold text-[var(--brown-800)] hover:text-[var(--accent)] transition-colors"
                        >
                          Order #{order.orderNumber}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Placed on {new Date(order.date).toLocaleDateString('en-KE', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <p className="text-lg font-bold text-[var(--accent)]">
                          KSH {order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="mb-4">
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div 
                            key={idx}
                            className="flex-shrink-0 flex items-center gap-3 bg-[var(--beige-50)] rounded-lg p-3 min-w-[200px]"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded overflow-hidden relative flex-shrink-0">
                              {item.image && typeof item.image === 'object' ? (
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[var(--brown-800)] truncate">{item.name}</p>
                              <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex-shrink-0 flex items-center justify-center bg-[var(--beige-100)] rounded-lg p-3 min-w-[100px]">
                            <p className="text-sm font-semibold text-[var(--accent)]">
                              +{order.items.length - 4} more
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-xs text-blue-700 font-semibold">Tracking Number</p>
                              <p className="text-sm font-mono text-blue-800">{order.trackingNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="flex-1 min-w-[150px] bg-[var(--accent)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors text-center"
                      >
                        Track Order
                      </Link>
                      {order.status === 'delivered' && !hasReviewed(order.id) && order.sellerId && (
                        <button 
                          onClick={() => setReviewingOrder(order)}
                          className="flex-1 min-w-[150px] bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
                        >
                          Leave Review
                        </button>
                      )}
                      {order.trackingNumber && (
                        <button 
                          className="flex-1 min-w-[150px] bg-white border-2 border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingNumber!);
                            alert('Tracking number copied to clipboard!');
                          }}
                        >
                          Copy Tracking #
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {reviewingOrder && user && (
        <ReviewForm
          orderId={reviewingOrder.id}
          sellerId={reviewingOrder.sellerId || ''}
          sellerName={reviewingOrder.sellerName || 'Seller'}
          buyerId={user.id}
          buyerName={`${user.firstName} ${user.lastName}`}
          onSubmit={handleSubmitReview}
          onCancel={() => setReviewingOrder(null)}
        />
      )}
    </div>
  );
}
