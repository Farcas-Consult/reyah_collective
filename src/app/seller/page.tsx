'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import StarRating from '@/components/StarRating';
import ReviewDisplay from '@/components/ReviewDisplay';
import { Review } from '@/types/review';

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.isSeller) {
      router.push('/seller-setup');
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, user, router]);

  const loadDashboardData = () => {
    const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    const orders = JSON.parse(localStorage.getItem('reyah_orders') || '[]');
    const reviews = JSON.parse(localStorage.getItem('reyah_reviews') || '[]');

    // Filter products by seller
    const sellerProducts = products.filter((p: any) => p.seller === user?.sellerName);
    
    // Filter orders containing seller's products
    const sellerOrders = orders.filter((order: any) =>
      order.items.some((item: any) => {
        const product = products.find((p: any) => p.id === item.id);
        return product && product.seller === user?.sellerName;
      })
    );

    // Get seller reviews
    const sellerReviews = reviews.filter((r: Review) => r.sellerId === user?.id && !r.isSupplierReview);
    const avgRating = sellerReviews.length > 0
      ? sellerReviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / sellerReviews.length
      : 0;

    // Calculate stats
    const totalRevenue = sellerOrders.reduce((sum: number, order: any) => {
      const sellerItems = order.items.filter((item: any) => {
        const product = products.find((p: any) => p.id === item.id);
        return product && product.seller === user?.sellerName;
      });
      return sum + sellerItems.reduce((itemSum: number, item: any) => itemSum + (item.price * item.quantity), 0);
    }, 0);

    setStats({
      totalProducts: sellerProducts.length,
      totalSales: sellerOrders.length,
      totalRevenue,
      pendingOrders: sellerOrders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
      averageRating: avgRating,
      totalReviews: sellerReviews.length,
    });

    // Get recent orders (last 5)
    setRecentOrders(sellerOrders.slice(-5).reverse());
    
    // Get recent reviews (last 3)
    setRecentReviews(sellerReviews.slice(-3).reverse());
  };

  if (!isAuthenticated || !user?.isSeller) {
    return null;
  }

  return (
    <div className="bg-[var(--beige-100)]">
      {/* Seller Header */}
      <header className="bg-white shadow-md border-b border-[var(--beige-300)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl">⭐</span>
              </Link>
              <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">SELLER</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--brown-700)]">
                <span className="font-bold">{user?.sellerName}</span>
              </span>
              <Link
                href="/"
                className="text-sm text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold"
              >
                View Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-8">Seller Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Products</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalSales}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">KSH {stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Customer Rating</p>
                <div className="flex items-center gap-2">
                  <StarRating rating={stats.averageRating} size="lg" />
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalReviews}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/seller/products"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">My Products</h3>
            <p className="text-sm text-[var(--brown-700)]">Add, edit, or manage your products</p>
          </Link>

          <Link
            href="/seller/orders"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">My Orders</h3>
            <p className="text-sm text-[var(--brown-700)]">View and manage your sales</p>
          </Link>

          <Link
            href="/seller/questions"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Customer Q&A</h3>
            <p className="text-sm text-[var(--brown-700)]">Answer product questions</p>
          </Link>

          <Link
            href="/seller/analytics"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Analytics</h3>
            <p className="text-sm text-[var(--brown-700)]">View sales statistics and trends</p>
          </Link>
        </div>

        {/* Recent Reviews Section */}
        {recentReviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--brown-800)]">Recent Customer Reviews</h2>
              <Link 
                href={`/seller/profile/${encodeURIComponent(user?.sellerName || '')}`}
                className="text-sm text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold"
              >
                View All Reviews
              </Link>
            </div>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <ReviewDisplay key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)]">Recent Orders</h2>
            <Link
              href="/seller/orders"
              className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold text-sm"
            >
              View All →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--beige-300)]">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)]">
                      <td className="py-3 px-4 text-sm font-mono text-[var(--brown-700)]">{order.orderNumber}</td>
                      <td className="py-3 px-4 text-sm text-[var(--brown-800)]">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {order.items.length} item(s)
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-[var(--accent)]">
                        KSH {order.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
