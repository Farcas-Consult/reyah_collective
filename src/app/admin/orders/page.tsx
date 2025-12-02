'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { getOrders, updateOrderStatus } from '@/utils/orders';
import BackButton from '@/components/BackButton';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    loadOrders();
  }, [isAuthenticated, user, router]);

  const loadOrders = () => {
    const allOrders = getOrders();
    setOrders(allOrders.reverse());
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus(orderId, newStatus as any);
    loadOrders();
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

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
              <Link href="/admin" className="text-2xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl">⭐</span>
              </Link>
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">ADMIN</span>
            </div>
            <Link href="/admin" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-8">Manage Orders</h1>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] mb-6">
          <div className="flex gap-2 p-2 overflow-x-auto">
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-gray-100 text-[var(--brown-700)] hover:bg-[var(--beige-200)]'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 text-xs">
                    ({orders.filter(o => o.status === status).length})
                  </span>
                )}
                {status === 'all' && (
                  <span className="ml-2 text-xs">({orders.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)]">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--beige-300)] bg-[var(--beige-50)]">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Order ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Customer</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Email</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Items</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Total</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)]">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-semibold text-[var(--accent)]">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-[var(--brown-800)]">
                        {order.customer.firstName} {order.customer.lastName}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {order.customer.email}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-[var(--accent)]">
                        KSH {order.total.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border-2 cursor-pointer ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                            'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold text-sm"
                        >
                          View Details
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
