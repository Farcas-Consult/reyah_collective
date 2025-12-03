'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  getOrders, 
  updateOrderStatus, 
  updateTrackingInfo,
  calculateEstimatedDelivery,
  getOrderStatusLabel,
  getOrderStatusColor,
  type Order,
  type OrderStatus,
  type ShippingCarrier
} from '@/utils/orders';
import BackButton from '@/components/BackButton';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '' as OrderStatus,
    trackingNumber: '',
    carrier: 'REYAH' as ShippingCarrier,
    estimatedDelivery: '',
    location: '',
    note: ''
  });
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

  const openEditModal = (order: Order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      carrier: order.trackingInfo?.carrier || 'REYAH',
      estimatedDelivery: order.estimatedDelivery || calculateEstimatedDelivery(5),
      location: order.trackingInfo?.currentLocation || '',
      note: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;

    // Update status with history
    updateOrderStatus(
      selectedOrder.id,
      editForm.status,
      editForm.trackingNumber,
      editForm.note,
      editForm.location
    );

    // Update tracking info
    if (editForm.trackingNumber) {
      updateTrackingInfo(selectedOrder.id, {
        trackingNumber: editForm.trackingNumber,
        carrier: editForm.carrier,
        estimatedDelivery: editForm.estimatedDelivery,
        currentLocation: editForm.location,
        lastUpdate: new Date().toISOString(),
        events: []
      });
    }

    setShowEditModal(false);
    setSelectedOrder(null);
    loadOrders();
  };

  const handleBulkStatusUpdate = (status: OrderStatus) => {
    if (confirm(`Update all ${filter} orders to ${status}?`)) {
      filteredOrders.forEach(order => {
        updateOrderStatus(order.id, status);
      });
      loadOrders();
    }
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap transition-colors ${
                    filter === status
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-gray-100 text-[var(--brown-700)] hover:bg-[var(--beige-200)]'
                  }`}
                >
                  {status === 'all' ? 'All' : getOrderStatusLabel(status as OrderStatus)}
                  <span className="ml-2 text-xs">
                    ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
                  </span>
                </button>
              ))}
            </div>
            
            {filter !== 'all' && filteredOrders.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusUpdate('processing')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-semibold text-sm"
                >
                  Mark All Processing
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate('shipped')}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 font-semibold text-sm"
                >
                  Mark All Shipped
                </button>
              </div>
            )}
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
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Date</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Items</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Total</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Tracking</th>
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
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-semibold text-[var(--brown-800)]">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                          <p className="text-gray-600 text-xs">{order.customer.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-[var(--accent)]">
                        €{order.total.toFixed(2)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {order.trackingNumber ? (
                          <span className="font-mono text-xs text-gray-700">
                            {order.trackingNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(order)}
                            className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold text-sm"
                          >
                            Edit
                          </button>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit Order Modal */}
        {showEditModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--brown-800)]">
                    Update Order {selectedOrder.orderNumber}
                  </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order Status *
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as OrderStatus })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Tracking Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={editForm.trackingNumber}
                      onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                      placeholder="e.g., REYAH123456789"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Carrier */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Shipping Carrier
                    </label>
                    <select
                      value={editForm.carrier}
                      onChange={(e) => setEditForm({ ...editForm, carrier: e.target.value as ShippingCarrier })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    >
                      <option value="REYAH">REYAH Logistics</option>
                      <option value="DHL">DHL</option>
                      <option value="UPS">UPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="USPS">USPS</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Estimated Delivery */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estimated Delivery Date
                    </label>
                    <input
                      type="date"
                      value={editForm.estimatedDelivery}
                      onChange={(e) => setEditForm({ ...editForm, estimatedDelivery: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Current Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="e.g., Dublin Distribution Center"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Status Update Note */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status Update Note
                    </label>
                    <textarea
                      value={editForm.note}
                      onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                      placeholder="Optional note about this status update..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p><span className="font-semibold">Name:</span> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                      <p><span className="font-semibold">Email:</span> {selectedOrder.customer.email}</p>
                      <p><span className="font-semibold">Phone:</span> {selectedOrder.customer.phone}</p>
                      <p><span className="font-semibold">Address:</span> {selectedOrder.shipping.address}, {selectedOrder.shipping.city}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateOrder}
                    className="flex-1 bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                  >
                    Update Order
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
