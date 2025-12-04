'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getAllFlashSales,
  saveFlashSale,
  updateFlashSale,
  deleteFlashSale,
  getActiveFlashSales,
  getScheduledFlashSales,
  getFlashSaleStats,
  updateSaleStatuses,
  sendSaleNotification,
} from '@/utils/flashSaleUtils';
import { FlashSale } from '@/types/flashSale';
import CountdownTimer from '@/components/CountdownTimer';

export default function AdminFlashSalesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [stats, setStats] = useState(getFlashSaleStats());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'ended'>('all');
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'flash_sale' as FlashSale['type'],
    discountType: 'percentage' as FlashSale['discountType'],
    discountValue: 0,
    startDate: '',
    endDate: '',
    productIds: [] as number[],
    minPurchaseAmount: undefined as number | undefined,
    maxDiscountAmount: undefined as number | undefined,
    stockLimit: undefined as number | undefined,
  });

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    loadData();
    
    // Update sale statuses every minute
    const interval = setInterval(() => {
      updateSaleStatuses();
      loadData();
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, router]);

  const loadData = () => {
    updateSaleStatuses();
    setSales(getAllFlashSales());
    setStats(getFlashSaleStats());
    
    // Load products
    const adminProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
    
    const sellerProducts = users
      .filter((u: any) => u.role === 'seller' && u.products)
      .flatMap((seller: any) =>
        seller.products.map((product: any) => ({
          ...product,
          sellerName: seller.businessName || `${seller.firstName} ${seller.lastName}`,
        }))
      );

    setAllProducts([...adminProducts, ...sellerProducts]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.productIds.length === 0) {
      alert('Please select at least one product');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert('End date must be after start date');
      return;
    }

    if (editingSale) {
      updateFlashSale(editingSale.id, formData);
    } else {
      const newSale = saveFlashSale({
        ...formData,
        createdBy: user?.email || 'admin',
      });
      
      // Send notification if sale starts within 24 hours
      const hoursUntilStart = (new Date(formData.startDate).getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntilStart < 24 && hoursUntilStart > 0) {
        const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
        const recipients = users.map((u: any) => u.email).filter(Boolean);
        sendSaleNotification(newSale, 'upcoming', recipients);
      }
    }

    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'flash_sale',
      discountType: 'percentage',
      discountValue: 0,
      startDate: '',
      endDate: '',
      productIds: [],
      minPurchaseAmount: undefined,
      maxDiscountAmount: undefined,
      stockLimit: undefined,
    });
    setEditingSale(null);
    setShowCreateForm(false);
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    setFormData({
      name: sale.name,
      description: sale.description,
      type: sale.type,
      discountType: sale.discountType,
      discountValue: sale.discountValue,
      startDate: sale.startDate,
      endDate: sale.endDate,
      productIds: sale.productIds,
      minPurchaseAmount: sale.minPurchaseAmount,
      maxDiscountAmount: sale.maxDiscountAmount,
      stockLimit: sale.stockLimit,
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this flash sale?')) {
      deleteFlashSale(id);
      loadData();
    }
  };

  const handleCancelSale = (id: string) => {
    if (confirm('Are you sure you want to cancel this flash sale?')) {
      updateFlashSale(id, { status: 'cancelled' });
      loadData();
    }
  };

  const toggleProductSelection = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const filteredSales = sales.filter(sale => {
    if (filter === 'all') return true;
    if (filter === 'active') return sale.status === 'active';
    if (filter === 'scheduled') return sale.status === 'scheduled';
    if (filter === 'ended') return sale.status === 'ended';
    return true;
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">
                ⚡ Flash Sales Management
              </h1>
              <p className="text-[var(--brown-700)]">Create and manage flash sales, daily deals, and limited offers</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-[var(--beige-200)] text-[var(--brown-800)] rounded-md hover:bg-[var(--beige-300)] transition-colors font-medium"
            >
              ← Back to Admin
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Active Sales</p>
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.activeSales}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Scheduled</p>
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.scheduledSales}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-[var(--accent)]">
                KSH {stats.totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Items Sold</p>
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{stats.totalItemsSold}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white border border-[var(--beige-300)] text-[var(--brown-800)] hover:bg-[var(--beige-50)]'
                }`}
              >
                All ({sales.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white border border-[var(--beige-300)] text-[var(--brown-800)] hover:bg-[var(--beige-50)]'
                }`}
              >
                Active ({stats.activeSales})
              </button>
              <button
                onClick={() => setFilter('scheduled')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'scheduled'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white border border-[var(--beige-300)] text-[var(--brown-800)] hover:bg-[var(--beige-50)]'
                }`}
              >
                Scheduled ({stats.scheduledSales})
              </button>
              <button
                onClick={() => setFilter('ended')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === 'ended'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white border border-[var(--beige-300)] text-[var(--brown-800)] hover:bg-[var(--beige-50)]'
                }`}
              >
                Ended ({stats.endedSales})
              </button>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Create Flash Sale
            </button>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
                <div className="p-6 border-b border-[var(--beige-300)]">
                  <h2 className="text-2xl font-bold text-[var(--brown-800)]">
                    {editingSale ? 'Edit Flash Sale' : 'Create New Flash Sale'}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Sale Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Sale Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as FlashSale['type'] })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        required
                      >
                        <option value="flash_sale">⚡ Flash Sale</option>
                        <option value="daily_deal">🎯 Daily Deal</option>
                        <option value="limited_offer">🔥 Limited Offer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                      rows={3}
                    />
                  </div>

                  {/* Discount Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Discount Type *
                      </label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as FlashSale['discountType'] })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        required
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (KSH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                  </div>

                  {/* Optional Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Min Purchase (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.minPurchaseAmount || ''}
                        onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        placeholder="KSH"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Max Discount (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxDiscountAmount || ''}
                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        placeholder="KSH"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                        Stock Limit (optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stockLimit || ''}
                        onChange={(e) => setFormData({ ...formData, stockLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                        placeholder="Units"
                      />
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                      Select Products * ({formData.productIds.length} selected)
                    </label>
                    <div className="border border-[var(--beige-300)] rounded-md p-4 max-h-60 overflow-y-auto">
                      {allProducts.length === 0 ? (
                        <p className="text-gray-500 text-center">No products available</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {allProducts.map((product) => (
                            <label
                              key={product.id}
                              className="flex items-center gap-2 p-2 hover:bg-[var(--beige-50)] rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.productIds.includes(product.id)}
                                onChange={() => toggleProductSelection(product.id)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">
                                {product.name} - KSH {product.price.toLocaleString()}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--beige-300)]">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium"
                    >
                      {editingSale ? 'Update Sale' : 'Create Sale'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Sales List */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)]">
            {filteredSales.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500 mb-4">No flash sales found</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium"
                >
                  Create Your First Flash Sale
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--beige-50)] border-b border-[var(--beige-300)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[var(--beige-200)]">
                    {filteredSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-[var(--beige-50)]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-bold text-[var(--brown-800)]">{sale.name}</div>
                            <div className="text-sm text-gray-500">
                              {sale.type === 'flash_sale' ? '⚡ Flash Sale' : sale.type === 'daily_deal' ? '🎯 Daily Deal' : '🔥 Limited Offer'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {sale.productIds.length} products
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-red-600">
                            -{sale.discountValue}{sale.discountType === 'percentage' ? '%' : ' KSH'}
                          </div>
                          {sale.maxDiscountAmount && (
                            <div className="text-xs text-gray-500">
                              Max: KSH {sale.maxDiscountAmount}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-gray-500">
                              Starts: {new Date(sale.startDate).toLocaleString()}
                            </div>
                            <div className="text-gray-500">
                              Ends: {new Date(sale.endDate).toLocaleString()}
                            </div>
                            {sale.status === 'active' && (
                              <div className="mt-2">
                                <CountdownTimer endDate={sale.endDate} size="sm" showLabel={false} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-semibold text-[var(--accent)]">
                              KSH {(sale.totalRevenue || 0).toLocaleString()}
                            </div>
                            <div className="text-gray-500">
                              {sale.totalItemsSold || 0} items sold
                            </div>
                            {sale.stockLimit && (
                              <div className="text-xs text-gray-500 mt-1">
                                {sale.stockRemaining}/{sale.stockLimit} remaining
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              sale.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : sale.status === 'scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : sale.status === 'ended'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {sale.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {sale.status !== 'ended' && sale.status !== 'cancelled' && (
                              <>
                                <button
                                  onClick={() => handleEdit(sale)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleCancelSale(sale.id)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Cancel"
                                >
                                  ⏸️
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(sale.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
