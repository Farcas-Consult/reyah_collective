'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'
import { 
  getOrders, 
  updateOrderStatus, 
  updateTrackingInfo,
  generateTrackingNumber,
  calculateEstimatedDelivery,
  getOrderStatusLabel,
  getOrderStatusColor,
  type Order as OrderType,
  type OrderStatus,
  type ShippingCarrier
} from '@/utils/orders'

interface OrderItem {
  id: string | number
  name: string
  price: number
  quantity: number
  seller?: string
  image?: string
  sellerId?: string
  sellerName?: string
}

interface Order extends OrderType {
  userId?: string
  userName?: string
  userEmail?: string
  shippingAddress?: string
  createdAt?: string
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showFulfillModal, setShowFulfillModal] = useState(false)
  const [fulfillForm, setFulfillForm] = useState({
    status: '' as OrderStatus,
    trackingNumber: '',
    carrier: 'REYAH' as ShippingCarrier,
    estimatedDelivery: '',
    location: '',
    note: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!user.isSeller) {
      router.push('/seller-setup')
      return
    }
    
    if (user.isSeller && !user.sellerApproved) {
      router.push('/seller-pending')
      return
    }
    
    loadOrders()
  }, [user, router])

  const loadOrders = () => {
    const allOrders = getOrders()
    const allProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]')
    
    // Get all products from this seller
    const sellerProducts = allProducts.filter((p: any) => p.seller === user?.sellerName)
    
    // Filter orders that contain at least one item from seller's products
    const sellerOrders: Order[] = allOrders
      .map((order) => {
        // Filter order items to only include seller's products
        const sellerItems = order.items.filter(item => {
          const product = sellerProducts.find((p: any) => p.name === item.name)
          return product !== undefined
        })
        
        if (sellerItems.length > 0) {
          // Calculate total for seller's items only
          const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          
          return {
            ...order,
            items: sellerItems,
            total: sellerTotal,
            userName: `${order.customer.firstName} ${order.customer.lastName}`,
            userEmail: order.customer.email,
            shippingAddress: `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.county} ${order.shipping.postalCode}`,
            createdAt: order.date
          } as Order
        }
        return null
      })
      .filter((order): order is Order => order !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    setOrders(sellerOrders)
  }

  const openFulfillModal = (order: Order) => {
    setSelectedOrder(order)
    setFulfillForm({
      status: order.status === 'pending' ? 'processing' : order.status,
      trackingNumber: order.trackingNumber || generateTrackingNumber(),
      carrier: order.trackingInfo?.carrier || 'REYAH',
      estimatedDelivery: order.estimatedDelivery || calculateEstimatedDelivery(5),
      location: '',
      note: ''
    })
    setShowFulfillModal(true)
  }

  const handleFulfillOrder = () => {
    if (!selectedOrder) return

    updateOrderStatus(
      selectedOrder.id,
      fulfillForm.status,
      fulfillForm.trackingNumber,
      fulfillForm.note,
      fulfillForm.location
    )

    updateTrackingInfo(selectedOrder.id, {
      trackingNumber: fulfillForm.trackingNumber,
      carrier: fulfillForm.carrier,
      estimatedDelivery: fulfillForm.estimatedDelivery,
      currentLocation: fulfillForm.location,
      lastUpdate: new Date().toISOString(),
      events: []
    })

    setShowFulfillModal(false)
    setSelectedOrder(null)
    loadOrders()
  }

  const handleQuickShip = (order: Order) => {
    const trackingNumber = generateTrackingNumber()
    const estimatedDelivery = calculateEstimatedDelivery(5)

    updateOrderStatus(order.id, 'shipped', trackingNumber, 'Order shipped by seller')
    updateTrackingInfo(order.id, {
      trackingNumber,
      carrier: 'REYAH',
      estimatedDelivery,
      lastUpdate: new Date().toISOString(),
      events: []
    })

    loadOrders()
  }

  const printShippingLabel = (order: Order) => {
    // In production, this would generate a PDF shipping label
    window.print()
  }

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt || order.date)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateFilter) {
          case 'today':
            matchesDate = diffDays === 0
            break
          case 'week':
            matchesDate = diffDays <= 7
            break
          case 'month':
            matchesDate = diffDays <= 30
            break
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }

  const filteredOrders = getFilteredOrders()

  const calculateStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length
    const shippedOrders = orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    
    return { totalOrders, totalRevenue, pendingOrders, shippedOrders, completedOrders }
  }

  const stats = calculateStats()

  if (!user || !user.isSeller || !user.sellerApproved) {
    return null
  }

  return (
    <div className="bg-[var(--beige-100)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-[var(--brown-800)]">My Orders</h1>
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
              SELLER
            </span>
          </div>
          <p className="text-gray-600">Track and manage orders for your products</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-[var(--brown-800)] mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  €{stats.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">To Fulfill</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Shipped</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.shippedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Search Orders
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order ID, customer name, or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">
              {orders.length === 0 
                ? "No orders yet. Your orders will appear here once customers purchase your products."
                : "No orders found matching your filters."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-[var(--brown-800)]">
                        {order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                      {order.trackingNumber && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-mono rounded">
                          {order.trackingNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-semibold">Customer:</span> {order.userName}</p>
                      <p><span className="font-semibold">Email:</span> {order.userEmail}</p>
                      <p><span className="font-semibold">Date:</span> {new Date(order.createdAt || order.date).toLocaleDateString()} at {new Date(order.createdAt || order.date).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Revenue</p>
                    <p className="text-2xl font-bold text-green-600">€{order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-[var(--brown-800)] mb-3">Your Products in this Order:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="font-medium text-[var(--brown-800)]">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-[var(--brown-800)]">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-[var(--brown-800)] mb-2">Shipping Address:</h4>
                  <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                </div>

                {/* Fulfillment Actions */}
                <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-2">
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={() => handleQuickShip(order)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                    >
                      🚚 Quick Ship
                    </button>
                  )}
                  <button
                    onClick={() => openFulfillModal(order)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    📦 Update Fulfillment
                  </button>
                  <button
                    onClick={() => printShippingLabel(order)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                  >
                    🖨️ Print Label
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fulfillment Modal */}
      {showFulfillModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--brown-800)]">
                  Fulfill Order {selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={() => setShowFulfillModal(false)}
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
                    value={fulfillForm.status}
                    onChange={(e) => setFulfillForm({ ...fulfillForm, status: e.target.value as OrderStatus })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Tracking Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tracking Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fulfillForm.trackingNumber}
                      onChange={(e) => setFulfillForm({ ...fulfillForm, trackingNumber: e.target.value })}
                      placeholder="e.g., REYAH123456789"
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                    <button
                      onClick={() => setFulfillForm({ ...fulfillForm, trackingNumber: generateTrackingNumber() })}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* Carrier */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shipping Carrier
                  </label>
                  <select
                    value={fulfillForm.carrier}
                    onChange={(e) => setFulfillForm({ ...fulfillForm, carrier: e.target.value as ShippingCarrier })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
                    value={fulfillForm.estimatedDelivery}
                    onChange={(e) => setFulfillForm({ ...fulfillForm, estimatedDelivery: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                {/* Current Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Location (optional)
                  </label>
                  <input
                    type="text"
                    value={fulfillForm.location}
                    onChange={(e) => setFulfillForm({ ...fulfillForm, location: e.target.value })}
                    placeholder="e.g., Dublin Warehouse"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fulfillment Note (optional)
                  </label>
                  <textarea
                    value={fulfillForm.note}
                    onChange={(e) => setFulfillForm({ ...fulfillForm, note: e.target.value })}
                    placeholder="Optional note about fulfillment..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><span className="font-semibold">Customer:</span> {selectedOrder.userName}</p>
                    <p><span className="font-semibold">Email:</span> {selectedOrder.userEmail}</p>
                    <p><span className="font-semibold">Items:</span> {selectedOrder.items.length} product(s)</p>
                    <p><span className="font-semibold">Total:</span> €{selectedOrder.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleFulfillOrder}
                  disabled={!fulfillForm.status || !fulfillForm.trackingNumber}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Update & Notify Customer
                </button>
                <button
                  onClick={() => setShowFulfillModal(false)}
                  className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
