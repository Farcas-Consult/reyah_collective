'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSellerPermissions, updateSellerPermissions } from '@/utils/analyticsEngine';
import type { SellerAnalyticsPermissions } from '@/types/analytics';

export default function AdminAnalyticsPage() {
  const [selectedSeller, setSelectedSeller] = useState<string>('');
  const [permissions, setPermissions] = useState<SellerAnalyticsPermissions | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const mockSellers = [
    { id: 'seller1', name: 'African Crafts Co.' },
    { id: 'seller2', name: 'Kenyan Artisans' },
    { id: 'seller3', name: 'Heritage Textiles' },
  ];

  const loadPermissions = (sellerId: string) => {
    const perms = getSellerPermissions(sellerId);
    setPermissions(perms);
    setSelectedSeller(sellerId);
  };

  const handleSave = () => {
    if (permissions) {
      updateSellerPermissions({
        ...permissions,
        updatedBy: 'admin',
        updatedAt: new Date(),
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage seller analytics permissions</p>
            </div>
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <span className="text-green-600 text-2xl">✓</span>
            <p className="text-green-800 font-medium">Permissions updated successfully!</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Seller</h2>
          <select
            value={selectedSeller}
            onChange={(e) => loadPermissions(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          >
            <option value="">-- Select a seller --</option>
            {mockSellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>

        {permissions && (
          <div className="mt-6 space-y-6">
            {/* Basic Permissions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Permissions</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.canViewSales}
                    onChange={(e) => setPermissions({ ...permissions, canViewSales: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">View Sales Data</p>
                    <p className="text-sm text-gray-600">Access to sales metrics and revenue reports</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.canViewCustomers}
                    onChange={(e) => setPermissions({ ...permissions, canViewCustomers: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">View Customer Data</p>
                    <p className="text-sm text-gray-600">Access to customer insights and demographics</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.canViewInventory}
                    onChange={(e) => setPermissions({ ...permissions, canViewInventory: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">View Inventory Data</p>
                    <p className="text-sm text-gray-600">Access to stock levels and inventory metrics</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.canExportData}
                    onChange={(e) => setPermissions({ ...permissions, canExportData: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-600">Download reports in CSV/Excel format</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.canViewAdvancedMetrics}
                    onChange={(e) => setPermissions({ ...permissions, canViewAdvancedMetrics: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Advanced Metrics</p>
                    <p className="text-sm text-gray-600">Access to detailed analytics and insights</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Data Range Limit */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Access Range</h2>
              <select
                value={permissions.maxDataRange}
                onChange={(e) => setPermissions({ ...permissions, maxDataRange: e.target.value as any })}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <p className="text-sm text-gray-600 mt-2">Maximum time range the seller can view</p>
            </div>

            {/* Feature Access */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Access</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.enabledFeatures.salesTrends}
                    onChange={(e) => setPermissions({
                      ...permissions,
                      enabledFeatures: { ...permissions.enabledFeatures, salesTrends: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Sales Trends</p>
                    <p className="text-sm text-gray-600">View revenue and sales trend charts</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.enabledFeatures.productPerformance}
                    onChange={(e) => setPermissions({
                      ...permissions,
                      enabledFeatures: { ...permissions.enabledFeatures, productPerformance: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Product Performance</p>
                    <p className="text-sm text-gray-600">View top products and conversion rates</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.enabledFeatures.customerInsights}
                    onChange={(e) => setPermissions({
                      ...permissions,
                      enabledFeatures: { ...permissions.enabledFeatures, customerInsights: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Customer Insights</p>
                    <p className="text-sm text-gray-600">View customer demographics and behavior</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.enabledFeatures.inventoryAlerts}
                    onChange={(e) => setPermissions({
                      ...permissions,
                      enabledFeatures: { ...permissions.enabledFeatures, inventoryAlerts: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Inventory Alerts</p>
                    <p className="text-sm text-gray-600">Receive low stock and restock notifications</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={permissions.enabledFeatures.competitorAnalysis}
                    onChange={(e) => setPermissions({
                      ...permissions,
                      enabledFeatures: { ...permissions.enabledFeatures, competitorAnalysis: e.target.checked }
                    })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Competitor Analysis</p>
                    <p className="text-sm text-gray-600">View market benchmarks and recommendations</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Permissions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
