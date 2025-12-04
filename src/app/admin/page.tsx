'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { getOrders } from '@/utils/orders';
import BackButton from '@/components/BackButton';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    activeSellers: 0,
    activeSuppliers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is admin
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    // Load dashboard data
    const orders = getOrders();
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');

    const activeSellers = users.filter((u: any) => u.isSeller && u.sellerStatus === 'approved').length;
    const activeSuppliers = users.filter((u: any) => u.isSupplier && u.supplierStatus === 'approved').length;

    setStats({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalUsers: users.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      activeSellers,
      activeSuppliers,
    });

    // Get recent orders (last 5)
    setRecentOrders(orders.slice(-5).reverse());
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      {/* Admin Header */}
      <header className="bg-white shadow-md border-b border-[var(--beige-300)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl">⭐</span>
              </Link>
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">ADMIN</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--brown-700)]">
                Welcome, <span className="font-bold">{user?.firstName}</span>
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
        <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Sellers</p>
                <p className="text-3xl font-bold text-teal-600">{stats.activeSellers}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Suppliers</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.activeSuppliers}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Orders</h3>
            <p className="text-sm text-[var(--brown-700)]">View and update order status</p>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Users</h3>
            <p className="text-sm text-[var(--brown-700)]">View all registered users</p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Products</h3>
            <p className="text-sm text-[var(--brown-700)]">Add, edit, or remove products</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Categories</h3>
            <p className="text-sm text-[var(--brown-700)]">Add, edit category options</p>
          </Link>

          <Link
            href="/admin/sellers"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Sellers</h3>
            <p className="text-sm text-[var(--brown-700)]">Approve and manage sellers</p>
          </Link>

          <Link
            href="/admin/suppliers"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Suppliers</h3>
            <p className="text-sm text-[var(--brown-700)]">Approve and manage suppliers</p>
          </Link>

          <Link
            href="/admin/reviews"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Manage Reviews</h3>
            <p className="text-sm text-[var(--brown-700)]">Moderate product reviews</p>
          </Link>

          <Link
            href="/admin/questions"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Product Q&A</h3>
            <p className="text-sm text-[var(--brown-700)]">Moderate questions & answers</p>
          </Link>

          <Link
            href="/admin/loyalty"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Loyalty Program</h3>
            <p className="text-sm text-[var(--brown-700)]">Manage rewards & points</p>
          </Link>

          <Link
            href="/admin/comparison"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Comparison Settings</h3>
            <p className="text-sm text-[var(--brown-700)]">Configure product comparison</p>
          </Link>

          <Link
            href="/admin/qa"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Q&A Management</h3>
            <p className="text-sm text-[var(--brown-700)]">Answer customer questions</p>
          </Link>

          <Link
            href="/admin/abandoned-carts"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Abandoned Carts</h3>
            <p className="text-sm text-[var(--brown-700)]">Recover lost sales</p>
          </Link>

          <Link
            href="/admin/flash-sales"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Flash Sales</h3>
            <p className="text-sm text-[var(--brown-700)]">Create limited-time deals</p>
          </Link>

          <Link
            href="/admin/wholesale"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Wholesale & Bulk</h3>
            <p className="text-sm text-[var(--brown-700)]">Manage bulk pricing rules</p>
          </Link>

          <Link
            href="/admin/shipping"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Shipping Management</h3>
            <p className="text-sm text-[var(--brown-700)]">Configure zones, methods & rates</p>
          </Link>

          <Link
            href="/admin/wishlists"
            className="bg-white rounded-lg shadow-sm border-2 border-[var(--accent)] p-6 hover:shadow-md transition-shadow"
          >
            <svg className="w-8 h-8 text-[var(--accent)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="font-bold text-[var(--brown-800)] mb-2">Wishlist Analytics</h3>
            <p className="text-sm text-[var(--brown-700)]">Monitor popular wishlist items</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)]">Recent Orders</h2>
            <Link
              href="/admin/orders"
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Action</th>
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
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold text-sm"
                        >
                          View
                        </Link>
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
