'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  seller?: string
}

interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  items: OrderItem[]
  total: number
  status: string
  shippingAddress: string
  createdAt: string
}

export default function SellerOrdersPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

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
    const storedOrders = localStorage.getItem('reyah_orders')
    const storedProducts = localStorage.getItem('reyah_products')
    
    if (storedOrders && storedProducts) {
      const allOrders = JSON.parse(storedOrders)
      const allProducts = JSON.parse(storedProducts)
      
      // Get all products from this seller
      const sellerProducts = allProducts.filter((p: any) => p.seller === user?.sellerName)
      const sellerProductIds = sellerProducts.map((p: any) => p.id)
      
      // Filter orders that contain at least one item from seller's products
      const sellerOrders = allOrders
        .map((order: Order) => {
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
              total: sellerTotal
            }
          }
          return null
        })
        .filter((order: Order | null) => order !== null)
        .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setOrders(sellerOrders)
    }
  }

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt)
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const pendingOrders = orders.filter(o => o.status === 'Pending').length
    const completedOrders = orders.filter(o => o.status === 'Delivered').length
    
    return { totalOrders, totalRevenue, pendingOrders, completedOrders }
  }

  const stats = calculateStats()

  if (!user || !user.isSeller || !user.sellerApproved) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)] py-12">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                  ${stats.totalRevenue.toFixed(2)}
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
                <p className="text-gray-600 text-sm">Pending Orders</p>
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
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.completedOrders}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
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
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
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
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[var(--brown-800)]">
                        Order #{order.id}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-semibold">Customer:</span> {order.userName}</p>
                      <p><span className="font-semibold">Email:</span> {order.userEmail}</p>
                      <p><span className="font-semibold">Date:</span> {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Your Revenue</p>
                    <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
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
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-[var(--brown-800)] mb-2">Shipping Address:</h4>
                  <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
