'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  calculateSalesMetrics,
  getSalesTrends,
  calculateProductPerformance,
  calculateCustomerInsights,
  calculateInventoryMetrics,
  calculateCategoryPerformance,
  getAnalyticsAlerts,
  getSalesMilestones,
  convertToChartData,
  convertCategoryToChartData,
  markAlertAsRead,
} from '@/utils/analyticsEngine';
import LineChart from '@/components/LineChart';
import BarChart from '@/components/BarChart';
import PieChart from '@/components/PieChart';
import MetricCard from '@/components/MetricCard';
import ExportButton from '@/components/ExportButton';
import type { SalesMetrics, AnalyticsAlert } from '@/types/analytics';

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers' | 'inventory'>('overview');
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [alerts, setAlerts] = useState<AnalyticsAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const sellerId = 'demo-seller';

  useEffect(() => {
    const metrics = calculateSalesMetrics(sellerId, period);
    setSalesMetrics(metrics);
    const alertsData = getAnalyticsAlerts(sellerId);
    setAlerts(alertsData);
  }, [period]);

  const handleAlertClick = (alertId: string) => {
    markAlertAsRead(alertId);
    const alertsData = getAnalyticsAlerts(sellerId);
    setAlerts(alertsData);
  };

  if (!salesMetrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const salesTrends = getSalesTrends(sellerId, period);
  const products = calculateProductPerformance(sellerId);
  const customerInsights = calculateCustomerInsights(sellerId);
  const inventoryMetrics = calculateInventoryMetrics(sellerId);
  const categoryPerformance = calculateCategoryPerformance(sellerId);
  const milestones = getSalesMilestones(sellerId);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Track your store performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                🔔
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadAlerts}
                  </span>
                )}
              </button>

              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {[
                  { value: '7d', label: '7D' },
                  { value: '30d', label: '30D' },
                  { value: '90d', label: '90D' },
                  { value: '1y', label: '1Y' },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPeriod(p.value as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      period === p.value
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <Link href="/seller" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back
              </Link>
            </div>
          </div>

          <div className="flex gap-4 mt-4 border-b border-gray-200">
            {[
              { value: 'overview', label: 'Overview', icon: '📊' },
              { value: 'products', label: 'Products', icon: '📦' },
              { value: 'customers', label: 'Customers', icon: '👥' },
              { value: 'inventory', label: 'Inventory', icon: '📋' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 ${
                  activeTab === tab.value
                    ? 'border-blue-600 text-blue-600 font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Dropdown */}
      {showAlerts && (
        <div className="absolute right-4 top-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => handleAlertClick(alert.id)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left ${
                  !alert.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {alert.type === 'low_stock' ? '⚠️' : alert.type === 'trending_product' ? '📈' : '🎉'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value={`KES ${salesMetrics.totalRevenue.toLocaleString()}`}
                change={salesMetrics.growth?.revenue}
                trend={salesMetrics.growth && salesMetrics.growth.revenue > 0 ? 'up' : 'down'}
                icon="💰"
                colorScheme="blue"
              />
              <MetricCard
                title="Total Orders"
                value={salesMetrics.totalOrders.toLocaleString()}
                change={salesMetrics.growth?.orders}
                trend={salesMetrics.growth && salesMetrics.growth.orders > 0 ? 'up' : 'down'}
                icon="📦"
                colorScheme="green"
              />
              <MetricCard
                title="Units Sold"
                value={salesMetrics.totalUnits.toLocaleString()}
                change={salesMetrics.growth?.units}
                trend={salesMetrics.growth && salesMetrics.growth.units > 0 ? 'up' : 'down'}
                icon="📊"
                colorScheme="yellow"
              />
              <MetricCard
                title="Avg Order Value"
                value={`KES ${salesMetrics.averageOrderValue.toFixed(0)}`}
                change={salesMetrics.growth?.aov}
                trend={salesMetrics.growth && salesMetrics.growth.aov > 0 ? 'up' : 'down'}
                icon="💳"
                colorScheme="purple"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends</h2>
              <LineChart data={convertToChartData(salesTrends, 'revenue')} height={300} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h2>
                <PieChart data={convertCategoryToChartData(categoryPerformance)} size={250} />
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h2>
                <div className="space-y-4">
                  {milestones.map((m) => (
                    <div key={m.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900">{m.title}</p>
                            <p className="text-sm text-gray-600">{m.description}</p>
                          </div>
                        </div>
                        {m.achieved && <span className="text-green-600 font-semibold">✓</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${m.achieved ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${Math.min(m.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{m.progress.toFixed(0)}% Complete</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Performance</h2>
              <ExportButton sellerId={sellerId} dataType="products" label="Export Products" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Units</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Conv Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((p) => (
                    <tr key={p.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.productName}</td>
                      <td className="px-4 py-3 text-sm text-right">KES {p.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-right">{p.unitsSold}</td>
                      <td className="px-4 py-3 text-sm text-right">{p.conversionRate.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={p.stockLevel < 10 ? 'text-red-600 font-semibold' : ''}>
                          {p.stockLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Customers"
                value={customerInsights.totalCustomers.toLocaleString()}
                icon="👥"
                colorScheme="blue"
              />
              <MetricCard
                title="New Customers"
                value={customerInsights.newCustomers.toLocaleString()}
                icon="✨"
                colorScheme="green"
              />
              <MetricCard
                title="Repeat Rate"
                value={`${customerInsights.repeatPurchaseRate.toFixed(1)}%`}
                icon="🔄"
                colorScheme="purple"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Customers by Region</h2>
                <ExportButton sellerId={sellerId} dataType="customers" label="Export Customers" />
              </div>
              <BarChart
                data={{
                  labels: customerInsights.customersByRegion.map(r => r.region),
                  datasets: [{
                    label: 'Customers',
                    data: customerInsights.customersByRegion.map(r => r.count),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                  }],
                }}
                height={300}
                showValues
              />
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Products"
                value={inventoryMetrics.totalProducts}
                icon="📦"
                colorScheme="blue"
              />
              <MetricCard
                title="In Stock"
                value={inventoryMetrics.inStock}
                icon="✅"
                colorScheme="green"
              />
              <MetricCard
                title="Low Stock"
                value={inventoryMetrics.lowStock}
                icon="⚠️"
                colorScheme="yellow"
              />
              <MetricCard
                title="Out of Stock"
                value={inventoryMetrics.outOfStock}
                icon="❌"
                colorScheme="red"
              />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h2>
              <div className="space-y-3">
                {inventoryMetrics.lowStockProducts.map((p) => (
                  <div
                    key={p.productId}
                    className={`border rounded-lg p-4 ${
                      p.status === 'critical'
                        ? 'border-red-200 bg-red-50'
                        : p.status === 'low'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{p.productName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Stock: <span className="font-semibold">{p.currentStock}</span> • 
                          Threshold: {p.threshold}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.status === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : p.status === 'low'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
