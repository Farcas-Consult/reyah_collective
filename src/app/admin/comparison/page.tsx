'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  getComparisonConfig,
  saveComparisonConfig,
  toggleAttributeEnabled,
  reorderAttributes,
} from '@/utils/comparison';
import { ComparisonConfig, ComparisonAttribute } from '@/types/comparison';

export default function AdminComparisonSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [config, setConfig] = useState<ComparisonConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    loadConfig();
  }, [isAuthenticated, user, router]);

  const loadConfig = () => {
    const currentConfig = getComparisonConfig();
    setConfig(currentConfig);
    setLoading(false);
  };

  const handleToggleAttribute = (attributeId: string) => {
    toggleAttributeEnabled(attributeId);
    loadConfig();
  };

  const handleReorder = (attributeId: string, direction: 'up' | 'down') => {
    if (!config) return;

    const attribute = config.customAttributes.find(attr => attr.id === attributeId);
    if (!attribute) return;

    const newOrder = direction === 'up' ? attribute.order - 1 : attribute.order + 1;
    
    if (newOrder < 1 || newOrder > config.customAttributes.length) return;

    // Swap orders
    const otherAttribute = config.customAttributes.find(attr => attr.order === newOrder);
    if (otherAttribute) {
      reorderAttributes(attributeId, newOrder);
      reorderAttributes(otherAttribute.id, attribute.order);
      loadConfig();
    }
  };

  const handleSaveMaxProducts = (maxProducts: number) => {
    if (!config) return;

    const updatedConfig: ComparisonConfig = {
      ...config,
      maxProducts,
    };

    saveComparisonConfig(updatedConfig);
    loadConfig();
    showSuccessMessage('Maximum products limit updated');
  };

  const handleToggleSharing = () => {
    if (!config) return;

    const updatedConfig: ComparisonConfig = {
      ...config,
      allowSharing: !config.allowSharing,
    };

    saveComparisonConfig(updatedConfig);
    loadConfig();
    showSuccessMessage(`Sharing ${!config.allowSharing ? 'enabled' : 'disabled'}`);
  };

  const handleToggleSaving = () => {
    if (!config) return;

    const updatedConfig: ComparisonConfig = {
      ...config,
      allowSaving: !config.allowSaving,
    };

    saveComparisonConfig(updatedConfig);
    loadConfig();
    showSuccessMessage(`Saving ${!config.allowSaving ? 'enabled' : 'disabled'}`);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const groupedAttributes = config?.customAttributes.reduce((acc, attr) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, ComparisonAttribute[]>);

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-2">
                  Product Comparison Settings
                </h1>
                <p className="text-gray-600">
                  Configure which attributes appear in product comparisons
                </p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                ← Back to Admin
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* General Settings */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">General Settings</h2>
            
            <div className="space-y-4">
              {/* Max Products */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--beige-200)]">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Maximum Products in Comparison
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum number of products users can compare at once
                  </p>
                </div>
                <select
                  value={config.maxProducts}
                  onChange={(e) => handleSaveMaxProducts(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-lg px-4 py-2 font-semibold"
                >
                  {[2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} products</option>
                  ))}
                </select>
              </div>

              {/* Allow Sharing */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--beige-200)]">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Allow Sharing
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable users to share comparison links
                  </p>
                </div>
                <button
                  onClick={handleToggleSharing}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.allowSharing ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.allowSharing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Allow Saving */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
                    Allow Saving/Exporting
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Enable users to save or export comparisons
                  </p>
                </div>
                <button
                  onClick={handleToggleSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.allowSaving ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.allowSaving ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Attribute Settings */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Comparison Attributes</h2>
            <p className="text-sm text-gray-600 mb-6">
              Select which product attributes to display in comparisons and set their order
            </p>

            {groupedAttributes && Object.entries(groupedAttributes).map(([category, attributes]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--accent)] mb-3 capitalize">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                
                <div className="space-y-2">
                  {attributes
                    .sort((a, b) => a.order - b.order)
                    .map((attr, index) => (
                      <div
                        key={attr.id}
                        className="flex items-center justify-between p-3 bg-[var(--beige-50)] rounded-lg hover:bg-[var(--beige-100)] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => handleToggleAttribute(attr.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              attr.enabled ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                attr.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{attr.label}</p>
                            <p className="text-xs text-gray-500">Order: {attr.order}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(attr.id, 'up')}
                            disabled={attr.order === 1}
                            className="p-2 text-gray-600 hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleReorder(attr.id, 'down')}
                            disabled={attr.order === config.customAttributes.length}
                            className="p-2 text-gray-600 hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Summary</p>
                <p className="text-sm text-blue-700">
                  {config.enabledAttributes.length} of {config.customAttributes.length} attributes enabled • 
                  Max {config.maxProducts} products • 
                  Sharing {config.allowSharing ? 'enabled' : 'disabled'} • 
                  Export {config.allowSaving ? 'enabled' : 'disabled'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
