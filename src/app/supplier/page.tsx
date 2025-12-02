'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import BackButton from '@/components/BackButton'

interface SupplierProduct {
  id: string
  name: string
  category: string
  price: number
  stock: number
  supplier: string
}

interface Order {
  id: string
  items: any[]
  total: number
  status: string
  createdAt: string
}

export default function SupplierDashboard() {
  const router = useRouter()
  const { user } = useAuth()
  const [products, setProducts] = useState<SupplierProduct[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    if (!user.isSupplier) {
      router.push('/supplier-setup')
      return
    }

    if (user.supplierStatus !== 'approved') {
      router.push('/supplier-pending')
      return
    }
    
    loadData()
  }, [user, router])

  const loadData = () => {
    const storedProducts = localStorage.getItem('reyah_supplier_products')
    const storedOrders = localStorage.getItem('reyah_supplier_orders')
    
    if (storedProducts) {
      const allProducts = JSON.parse(storedProducts)
      const supplierProducts = allProducts.filter((p: SupplierProduct) => p.supplier === user?.companyName)
      setProducts(supplierProducts)
    }

    if (storedOrders) {
      const allOrders = JSON.parse(storedOrders)
      const supplierOrders = allOrders.filter((o: Order) => 
        o.items.some((item: any) => 
          products.some((p: SupplierProduct) => p.name === item.productName)
        )
      )
      setOrders(supplierOrders)
    }
  }

  const calculateStats = () => {
    const totalProducts = products.length
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
    const lowStock = products.filter(p => p.stock < 10).length
    const outOfStock = products.filter(p => p.stock === 0).length

    return { totalProducts, totalStock, lowStock, outOfStock }
  }

  const stats = calculateStats()

  if (!user || !user.isSupplier || user.supplierStatus !== 'approved') {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--brown-800)]">Supplier Dashboard</h1>
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                  SUPPLIER
                </span>
              </div>
              <p className="text-gray-600">Welcome back, {user.companyName}</p>
              <p className="text-sm text-gray-500">{user.supplierType}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-3xl font-bold text-[var(--brown-800)] mt-1">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Stock</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalStock}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Low Stock</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Out of Stock</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            href="/supplier/products"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="font-bold text-[var(--brown-800)] mb-1">Manage Products</h3>
                <p className="text-sm text-gray-600">Add and manage inventory</p>
              </div>
            </div>
          </Link>

          <Link
            href="/supplier/orders"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="font-bold text-[var(--brown-800)] mb-1">Supply Orders</h3>
                <p className="text-sm text-gray-600">Track and fulfill orders</p>
              </div>
            </div>
          </Link>

          <Link
            href="/supplier/analytics"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
              <div>
                <h3 className="font-bold text-[var(--brown-800)] mb-1">Analytics</h3>
                <p className="text-sm text-gray-600">View performance metrics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Low Stock Alert */}
        {stats.lowStock > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-800 mb-1">Low Stock Alert</h3>
                <p className="text-yellow-700">
                  You have {stats.lowStock} product(s) with low stock. Consider restocking soon.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
