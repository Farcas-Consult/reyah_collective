'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { getAllWishlists } from '@/utils/wishlist';
import type { Wishlist, WishlistItem } from '@/types/wishlist';

interface PopularItem {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  wishlistCount: number;
  totalQuantity: number;
  averagePriority: number;
}

interface RegistryStats {
  type: string;
  count: number;
  percentage: number;
}

export default function AdminWishlistsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [registryStats, setRegistryStats] = useState<RegistryStats[]>([]);
  const [totalWishlists, setTotalWishlists] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [publicWishlists, setPublicWishlists] = useState(0);
  const [sharedWishlists, setSharedWishlists] = useState(0);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/admin/login');
      return;
    }
    loadWishlistAnalytics();
  }, [user, router]);

  const loadWishlistAnalytics = () => {
    const allWishlists = getAllWishlists();
    setWishlists(allWishlists);
    setTotalWishlists(allWishlists.length);

    // Count public and shared wishlists
    const publicCount = allWishlists.filter(w => w.privacy === 'public').length;
    const sharedCount = allWishlists.filter(w => w.privacy === 'shared').length;
    setPublicWishlists(publicCount);
    setSharedWishlists(sharedCount);

    // Calculate total items
    const itemCount = allWishlists.reduce((sum, w) => sum + w.items.length, 0);
    setTotalItems(itemCount);

    // Calculate popular items
    const itemMap = new Map<number, {
      productId: number;
      productName: string;
      productPrice: number;
      productImage: string;
      count: number;
      totalQuantity: number;
      totalPriority: number;
      priorityCount: number;
    }>();

    allWishlists.forEach(wishlist => {
      wishlist.items.forEach(item => {
        const existing = itemMap.get(item.productId);
        if (existing) {
          existing.count++;
          existing.totalQuantity += item.quantity;
          if (item.priority) {
            existing.totalPriority += item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1;
            existing.priorityCount++;
          }
        } else {
          itemMap.set(item.productId, {
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            productImage: item.productImage,
            count: 1,
            totalQuantity: item.quantity,
            totalPriority: item.priority ? (item.priority === 'high' ? 3 : item.priority === 'medium' ? 2 : 1) : 0,
            priorityCount: item.priority ? 1 : 0,
          });
        }
      });
    });

    const popular = Array.from(itemMap.values())
      .map(item => ({
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        productImage: item.productImage,
        wishlistCount: item.count,
        totalQuantity: item.totalQuantity,
        averagePriority: item.priorityCount > 0 ? item.totalPriority / item.priorityCount : 0,
      }))
      .sort((a, b) => b.wishlistCount - a.wishlistCount)
      .slice(0, 10);

    setPopularItems(popular);

    // Calculate registry type distribution
    const registryTypes = new Map<string, number>();
    allWishlists.forEach(wishlist => {
      const type = wishlist.type;
      registryTypes.set(type, (registryTypes.get(type) || 0) + 1);
    });

    const stats = Array.from(registryTypes.entries())
      .map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        percentage: (count / allWishlists.length) * 100,
      }))
      .sort((a, b) => b.count - a.count);

    setRegistryStats(stats);
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 2.5) {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded">High Priority</span>;
    } else if (priority >= 1.5) {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded">Medium Priority</span>;
    } else if (priority > 0) {
      return <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded">Low Priority</span>;
    }
    return null;
  };

  return (
    <div className="bg-[var(--beige-100)]">
      <Header />
        <BackButton />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wishlist Analytics</h1>
          <p className="mt-2 text-gray-600">Monitor popular items and wishlist trends</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Wishlists</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalWishlists}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{totalItems}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Public Wishlists</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{publicWishlists}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared Wishlists</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{sharedWishlists}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popular Items */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Most Wishlisted Products</h2>
              <p className="text-sm text-gray-600 mt-1">Top 10 products across all wishlists</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wishlists</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {popularItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No wishlist data available yet
                      </td>
                    </tr>
                  ) : (
                    popularItems.map((item, index) => (
                      <tr key={item.productId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded overflow-hidden">
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                  No img
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                              <p className="text-xs text-gray-500">ID: {item.productId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          KSH {item.productPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 rounded">
                            {item.wishlistCount} {item.wishlistCount === 1 ? 'wishlist' : 'wishlists'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.totalQuantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(item.averagePriority)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registry Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Registry Types</h2>
              <p className="text-sm text-gray-600 mt-1">Distribution by type</p>
            </div>
            <div className="p-6">
              {registryStats.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No data available</p>
              ) : (
                <div className="space-y-4">
                  {registryStats.map((stat) => (
                    <div key={stat.type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{stat.type}</span>
                        <span className="text-sm font-semibold text-gray-900">{stat.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{stat.percentage.toFixed(1)}% of total</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {popularItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Inventory Recommendations</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Consider stocking more units of the top 3 wishlisted products</li>
                  <li>• Create promotional campaigns around high-priority wishlist items</li>
                  <li>• Monitor stock levels for products appearing in multiple wishlists</li>
                  <li>• Set up notifications for users when wishlisted items go on sale</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
