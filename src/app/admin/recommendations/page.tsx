'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/components/BackButton';
import type { RecommendationConfig, RecommendationAnalytics, FeaturedProduct, RecommendationType, RecommendationAlgorithm } from '@/types/recommendations';
import {
  getAllConfigs,
  saveConfig,
  deleteConfig,
  getAllAnalytics,
  getFeaturedProducts,
  saveFeaturedProduct,
  deleteFeaturedProduct,
  updateTrendingProducts
} from '@/utils/recommendationEngine';

export default function AdminRecommendations() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'configs' | 'featured' | 'analytics'>('configs');
  
  // Configs
  const [configs, setConfigs] = useState<RecommendationConfig[]>([]);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RecommendationConfig | null>(null);
  
  // Featured
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [showFeaturedForm, setShowFeaturedForm] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState<FeaturedProduct | null>(null);
  
  // Analytics
  const [analytics, setAnalytics] = useState<RecommendationAnalytics[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = () => {
    setConfigs(getAllConfigs());
    setFeatured(getFeaturedProducts());
    setAnalytics(getAllAnalytics());
  };

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const configData: Partial<RecommendationConfig> = {
      id: editingConfig?.id,
      type: formData.get('type') as RecommendationType,
      algorithm: formData.get('algorithm') as RecommendationAlgorithm,
      enabled: formData.get('enabled') === 'true',
      priority: parseInt(formData.get('priority') as string),
      maxItems: parseInt(formData.get('maxItems') as string),
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      abTestEnabled: formData.get('abTestEnabled') === 'true',
      similarityThreshold: formData.get('similarityThreshold') ? parseFloat(formData.get('similarityThreshold') as string) : undefined,
      minPurchaseCount: formData.get('minPurchaseCount') ? parseInt(formData.get('minPurchaseCount') as string) : undefined,
      trendingDays: formData.get('trendingDays') ? parseInt(formData.get('trendingDays') as string) : undefined,
      categoryWeight: formData.get('categoryWeight') ? parseFloat(formData.get('categoryWeight') as string) : undefined,
      priceRangeWeight: formData.get('priceRangeWeight') ? parseFloat(formData.get('priceRangeWeight') as string) : undefined,
    };

    if (configData.abTestEnabled) {
      configData.variantAAlgorithm = formData.get('variantAAlgorithm') as RecommendationAlgorithm;
      configData.variantBAlgorithm = formData.get('variantBAlgorithm') as RecommendationAlgorithm;
    }

    saveConfig(configData);
    setShowConfigForm(false);
    setEditingConfig(null);
    loadData();
  };

  const handleDeleteConfig = (id: string) => {
    if (!confirm('Delete this recommendation configuration?')) return;
    deleteConfig(id);
    loadData();
  };

  const handleSaveFeatured = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const featuredData: Partial<FeaturedProduct> = {
      id: editingFeatured?.id,
      productId: formData.get('productId') as string,
      position: parseInt(formData.get('position') as string),
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      isActive: formData.get('isActive') === 'true',
      createdBy: user?.email || 'admin'
    };

    saveFeaturedProduct(featuredData);
    setShowFeaturedForm(false);
    setEditingFeatured(null);
    loadData();
  };

  const handleDeleteFeatured = (id: string) => {
    if (!confirm('Remove this featured product?')) return;
    deleteFeaturedProduct(id);
    loadData();
  };

  const handleUpdateTrending = () => {
    updateTrendingProducts();
    alert('Trending products updated!');
  };

  if (!isAuthenticated || !user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommendation Engine</h1>
          <p className="text-gray-600">Configure algorithms, manage featured products, and view analytics</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('configs')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'configs'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Algorithms ({configs.length})
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'featured'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Featured Products ({featured.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics & A/B Tests
            </button>
          </div>

          <div className="p-6">
            {/* CONFIGS TAB */}
            {activeTab === 'configs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recommendation Algorithms</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateTrending}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600"
                    >
                      🔄 Update Trending
                    </button>
                    <button
                      onClick={() => {
                        setEditingConfig(null);
                        setShowConfigForm(true);
                      }}
                      className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--brown-600)]"
                    >
                      + Add Configuration
                    </button>
                  </div>
                </div>

                {showConfigForm && (
                  <ConfigForm
                    config={editingConfig}
                    onSubmit={handleSaveConfig}
                    onCancel={() => {
                      setShowConfigForm(false);
                      setEditingConfig(null);
                    }}
                  />
                )}

                <div className="space-y-4">
                  {configs.sort((a, b) => a.priority - b.priority).map(config => (
                    <div key={config.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{config.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${config.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {config.enabled ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{config.type}</span>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">{config.algorithm}</span>
                            {config.abTestEnabled && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">A/B Test</span>
                            )}
                          </div>
                          {config.description && <p className="text-sm text-gray-600 mb-2">{config.description}</p>}
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Priority:</strong> {config.priority} | <strong>Max Items:</strong> {config.maxItems}</p>
                            {config.similarityThreshold && <p><strong>Similarity Threshold:</strong> {config.similarityThreshold}</p>}
                            {config.minPurchaseCount && <p><strong>Min Purchase Count:</strong> {config.minPurchaseCount}</p>}
                            {config.trendingDays && <p><strong>Trending Period:</strong> {config.trendingDays} days</p>}
                            {config.abTestEnabled && (
                              <p><strong>A/B Variants:</strong> A={config.variantAAlgorithm}, B={config.variantBAlgorithm}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingConfig(config);
                              setShowConfigForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(config.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURED TAB */}
            {activeTab === 'featured' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
                  <button
                    onClick={() => {
                      setEditingFeatured(null);
                      setShowFeaturedForm(true);
                    }}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--brown-600)]"
                  >
                    + Add Featured Product
                  </button>
                </div>

                {showFeaturedForm && (
                  <FeaturedForm
                    featured={editingFeatured}
                    onSubmit={handleSaveFeatured}
                    onCancel={() => {
                      setShowFeaturedForm(false);
                      setEditingFeatured(null);
                    }}
                  />
                )}

                <div className="space-y-4">
                  {featured.sort((a, b) => a.position - b.position).map(item => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">Position {item.position}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Product ID:</strong> {item.productId}</p>
                            <p><strong>Period:</strong> {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</p>
                            <p><strong>Created By:</strong> {item.createdBy}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingFeatured(item);
                              setShowFeaturedForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFeatured(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
                
                {analytics.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>No analytics data yet. Start showing recommendations to collect data!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Algorithm</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Variant</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Impressions</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Clicks</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">CTR</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Conversions</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Conv. Rate</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {analytics.map(record => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{record.type}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{record.algorithm}</td>
                            <td className="px-4 py-3 text-sm">
                              {record.abTestVariant && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                  {record.abTestVariant}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{record.impressions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{record.clicks.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{record.ctr.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{record.conversions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{record.conversionRate.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                              KSH {record.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Config Form Component
function ConfigForm({ config, onSubmit, onCancel }: any) {
  return (
    <form onSubmit={onSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">{config ? 'Edit' : 'Add'} Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <select
            name="type"
            defaultValue={config?.type}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="customers_also_bought">Customers Also Bought</option>
            <option value="related_products">Related Products</option>
            <option value="personalized">Personalized</option>
            <option value="trending">Trending</option>
            <option value="best_sellers">Best Sellers</option>
            <option value="recently_viewed">Recently Viewed</option>
            <option value="new_arrivals">New Arrivals</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Algorithm</label>
          <select
            name="algorithm"
            defaultValue={config?.algorithm}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="collaborative_filtering">Collaborative Filtering</option>
            <option value="content_based">Content Based</option>
            <option value="hybrid">Hybrid</option>
            <option value="trending">Trending</option>
            <option value="manual">Manual (Featured)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={config?.title}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
          <input
            type="number"
            name="priority"
            defaultValue={config?.priority ?? 1}
            required
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Items</label>
          <input
            type="number"
            name="maxItems"
            defaultValue={config?.maxItems ?? 6}
            required
            min="1"
            max="20"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          defaultValue={config?.description}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enabled"
            value="true"
            defaultChecked={config?.enabled ?? true}
            className="rounded"
          />
          <span className="text-sm font-semibold text-gray-700">Enabled</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="abTestEnabled"
            value="true"
            defaultChecked={config?.abTestEnabled}
            className="rounded"
          />
          <span className="text-sm font-semibold text-gray-700">A/B Testing</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold">
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Featured Form Component
function FeaturedForm({ featured, onSubmit, onCancel }: any) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 rounded-lg p-6 mb-6">
      <h3 className="font-bold text-gray-900 mb-4">{featured ? 'Edit' : 'Add'} Featured Product</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Product ID</label>
          <input
            type="text"
            name="productId"
            defaultValue={featured?.productId}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
          <input
            type="number"
            name="position"
            defaultValue={featured?.position ?? 1}
            required
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            name="startDate"
            defaultValue={featured?.startDate ? new Date(featured.startDate).toISOString().split('T')[0] : today}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            name="endDate"
            defaultValue={featured?.endDate ? new Date(featured.endDate).toISOString().split('T')[0] : thirtyDaysLater}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            value="true"
            defaultChecked={featured?.isActive ?? true}
            className="rounded"
          />
          <span className="text-sm font-semibold text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-semibold">
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
