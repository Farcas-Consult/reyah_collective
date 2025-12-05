'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { getOrders } from '@/utils/orders';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    activeSellers: 0,
    activeSuppliers: 0,
    totalProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
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
    const allProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');

    const activeSellers = users.filter((u: any) => u.isSeller && u.sellerStatus === 'approved').length;
    const activeSuppliers = users.filter((u: any) => u.isSupplier && u.supplierStatus === 'approved').length;

    setStats({
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      totalUsers: users.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      activeSellers,
      activeSuppliers,
      totalProducts: allProducts.length,
    });

    // Get recent orders (last 5)
    setRecentOrders(orders.slice(-5).reverse());
    
    // Get all products
    setProducts(allProducts);
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Admin Header */}
        <header className="bg-white shadow-md border-b border-[var(--beige-300)]">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[var(--brown-800)]">Dashboard</h1>
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

        <main className="px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

          {/* Products Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--brown-800)]">Products Overview</h2>
                <p className="text-sm text-gray-600 mt-1">Total Products: {stats.totalProducts}</p>
              </div>
              <Link
                href="/admin/products"
                className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold text-sm"
              >
                Manage Products →
              </Link>
            </div>

            {products.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No products available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--beige-300)]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Image</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Product Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Stock</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Seller</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--brown-800)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)]">
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 overflow-hidden relative rounded">
                            {product.image && typeof product.image === 'object' ? (
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            ) : product.images && product.images.length > 0 ? (
                              <div className="w-full h-full bg-[var(--beige-200)] flex items-center justify-center">
                                <span className="text-xs text-gray-500">IMG</span>
                              </div>
                            ) : (
                              <div className="w-full h-full bg-[var(--beige-200)] flex items-center justify-center">
                                <span className="text-xs text-gray-500">No img</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Link 
                            href={`/product/${product.id}`}
                            className="text-sm font-medium text-[var(--brown-800)] hover:text-[var(--accent)]"
                          >
                            {product.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{product.category}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-[var(--accent)]">
                          KSH {product.price.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 10 ? 'bg-green-100 text-green-700' :
                            product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {product.sellerName || 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {product.stock > 0 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
    </div>
  );
}
