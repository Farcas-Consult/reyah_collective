'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BackButton from '@/components/BackButton'
import StarRating from '@/components/StarRating'
import ReviewDisplay from '@/components/ReviewDisplay'
import { Review } from '@/types/review'

interface Product {
  id: string
  name: string
  price: number
  category: string
  seller: string
  stock: number
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
}

interface ProductSale {
  name: string
  totalSold: number
  revenue: number
}

interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

interface ReviewTrend {
  month: string
  averageRating: number
  reviewCount: number
}

interface CustomerFeedback {
  averageRating: number
  totalReviews: number
  ratingBreakdown: { 5: number; 4: number; 3: number; 2: number; 1: number }
  satisfactionRate: number
  recentReviews: Review[]
}

export default function SellerAnalyticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<ProductSale[]>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [reviewTrends, setReviewTrends] = useState<ReviewTrend[]>([])
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback>({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    satisfactionRate: 0,
    recentReviews: []
  })
  const [timeRange, setTimeRange] = useState('30') // days

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
    
    loadData()
  }, [user, router, timeRange])

  const loadData = () => {
    const storedProducts = localStorage.getItem('reyah_products')
    const storedOrders = localStorage.getItem('reyah_orders')
    
    if (storedProducts) {
      const allProducts = JSON.parse(storedProducts)
      const sellerProducts = allProducts.filter((p: Product) => p.seller === user?.sellerName)
      setProducts(sellerProducts)
      
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders)
        
        // Filter orders containing seller's products
        const sellerOrders = allOrders
          .map((order: Order) => {
            const sellerItems = order.items.filter(item => {
              return sellerProducts.some((p: Product) => p.name === item.name)
            })
            
            if (sellerItems.length > 0) {
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
          .filter((order: Order) => {
            const orderDate = new Date(order.createdAt)
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange))
            return orderDate >= cutoffDate
          })
        
        setOrders(sellerOrders)
        calculateTopProducts(sellerOrders)
        calculateMonthlyRevenue(sellerOrders)
      }
    }
    
    // Load customer feedback
    loadCustomerFeedback()
  }

  const loadCustomerFeedback = () => {
    const allReviews = JSON.parse(localStorage.getItem('reyah_reviews') || '[]') as Review[]
    const sellerReviews = allReviews.filter(r => r.sellerId === user?.id && !r.isSupplierReview)
    
    // Filter by time range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange))
    const recentReviews = sellerReviews.filter(r => new Date(r.date) >= cutoffDate)
    
    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    recentReviews.forEach(r => {
      breakdown[r.rating as keyof typeof breakdown]++
    })
    
    // Calculate average rating
    const avgRating = recentReviews.length > 0
      ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
      : 0
    
    // Calculate satisfaction rate (4-5 stars)
    const satisfiedReviews = recentReviews.filter(r => r.rating >= 4).length
    const satisfactionRate = recentReviews.length > 0
      ? (satisfiedReviews / recentReviews.length) * 100
      : 0
    
    setCustomerFeedback({
      averageRating: avgRating,
      totalReviews: recentReviews.length,
      ratingBreakdown: breakdown,
      satisfactionRate,
      recentReviews: recentReviews.slice(-5).reverse()
    })
    
    // Calculate review trends by month
    calculateReviewTrends(sellerReviews)
  }

  const calculateTopProducts = (sellerOrders: Order[]) => {
    const productSales: { [key: string]: ProductSale } = {}
    
    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = {
            name: item.name,
            totalSold: 0,
            revenue: 0
          }
        }
        productSales[item.name].totalSold += item.quantity
        productSales[item.name].revenue += item.price * item.quantity
      })
    })
    
    const sorted = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    setTopProducts(sorted)
  }

  const calculateMonthlyRevenue = (sellerOrders: Order[]) => {
    const monthlyData: { [key: string]: MonthlyRevenue } = {}
    
    sellerOrders.forEach(order => {
      const date = new Date(order.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          revenue: 0,
          orders: 0
        }
      }
      
      monthlyData[monthKey].revenue += order.total
      monthlyData[monthKey].orders += 1
    })
    
    const sorted = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
    
    setMonthlyRevenue(sorted)
  }

  const calculateReviewTrends = (allSellerReviews: Review[]) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(timeRange))
    const recentReviews = allSellerReviews.filter(r => new Date(r.date) >= cutoffDate)
    
    const monthlyReviews: { [key: string]: ReviewTrend } = {}
    
    recentReviews.forEach(review => {
      const date = new Date(review.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!monthlyReviews[monthKey]) {
        monthlyReviews[monthKey] = {
          month: monthName,
          averageRating: 0,
          reviewCount: 0
        }
      }
      
      monthlyReviews[monthKey].reviewCount += 1
    })
    
    // Calculate average ratings
    Object.keys(monthlyReviews).forEach(monthKey => {
      const monthReviews = recentReviews.filter(r => {
        const date = new Date(r.date)
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return key === monthKey
      })
      
      const avgRating = monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length
      monthlyReviews[monthKey].averageRating = avgRating
    })
    
    const sorted = Object.values(monthlyReviews)
      .sort((a, b) => a.month.localeCompare(b.month))
    
    setReviewTrends(sorted)
  }

  const calculateOverallStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalItemsSold = orders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    return { totalRevenue, totalOrders, totalItemsSold, averageOrderValue }
  }

  const stats = calculateOverallStats()

  const getMaxRevenue = () => {
    return Math.max(...monthlyRevenue.map(m => m.revenue), 0)
  }

  if (!user || !user.isSeller || !user.sellerApproved) {
    return null
  }

  return (
    <div className="bg-[var(--beige-100)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--brown-800)]">Sales Analytics</h1>
                <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                  SELLER
                </span>
              </div>
              <p className="text-gray-600">Track your sales performance and trends</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Items Sold</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalItemsSold}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Order Value</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ${stats.averageOrderValue.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Monthly Revenue</h2>
          {monthlyRevenue.length > 0 ? (
            <div className="space-y-4">
              {monthlyRevenue.map((month) => {
                const maxRevenue = getMaxRevenue()
                const widthPercentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                
                return (
                  <div key={month.month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[var(--brown-800)]">
                        {month.month}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600">
                          ${month.revenue.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({month.orders} orders)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{ width: `${widthPercentage}%` }}
                      >
                        {widthPercentage > 15 && (
                          <span className="text-white text-xs font-bold">
                            ${month.revenue.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available for this time range.</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Top Selling Products</h2>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-green-800 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--brown-800)]">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.totalSold} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        ${product.revenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Total Revenue</p>
                    </div>
                  </div>
                  
                  {/* Revenue Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-600 h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${topProducts.length > 0 ? (product.revenue / topProducts[0].revenue) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales data available for this time range.</p>
          )}
        </div>

        {/* Product Inventory Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Inventory Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-[var(--brown-800)]">{products.length}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.stock > 0).length}
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Feedback Section */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Customer Satisfaction Overview */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Customer Satisfaction</h2>
            
            <div className="text-center mb-6">
              <div className="inline-block">
                <p className="text-5xl font-bold text-[var(--accent)] mb-2">
                  {customerFeedback.averageRating.toFixed(1)}
                </p>
                <StarRating rating={customerFeedback.averageRating} size="lg" showNumber={false} />
                <p className="text-sm text-gray-600 mt-2">{customerFeedback.totalReviews} reviews</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Satisfaction Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {customerFeedback.satisfactionRate.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-green-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${customerFeedback.satisfactionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Customers rating 4-5 stars</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-[var(--brown-800)] mb-3">Rating Breakdown</h3>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = customerFeedback.ratingBreakdown[rating as keyof typeof customerFeedback.ratingBreakdown]
                const percentage = customerFeedback.totalReviews > 0 
                  ? (count / customerFeedback.totalReviews) * 100 
                  : 0
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm font-semibold w-8">{rating}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Review Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Review Trends</h2>
            {reviewTrends.length > 0 ? (
              <div className="space-y-4">
                {reviewTrends.map((trend) => (
                  <div key={trend.month}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-[var(--brown-800)]">
                        {trend.month}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-sm font-bold text-[var(--accent)]">
                            {trend.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({trend.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${(trend.averageRating / 5) * 100}%` }}
                      >
                        {trend.averageRating > 2.5 && (
                          <span className="text-white text-xs font-bold">
                            {trend.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No review data available for this time range.</p>
            )}
          </div>
        </div>

        {/* Recent Customer Feedback */}
        {customerFeedback.recentReviews.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Recent Customer Feedback</h2>
            <div className="space-y-4">
              {customerFeedback.recentReviews.map((review) => (
                <ReviewDisplay key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
