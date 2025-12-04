'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import {
  getAllWholesaleCustomers,
  getAllApplications,
  getAllPricingRules,
  getAllBulkOrders,
  getWholesaleStats,
  approveApplication,
  rejectApplication,
  updateWholesaleCustomer,
  savePricingRule,
  updatePricingRule,
  deletePricingRule,
  getBusinessTypeLabel,
  formatPaymentTerms,
} from '@/utils/wholesaleUtils';
import type { WholesaleCustomer, WholesaleApplication, BulkPricingRule, WholesaleStats } from '@/types/wholesale';

type TabType = 'overview' | 'applications' | 'customers' | 'pricing' | 'orders';
type CustomerFilter = 'all' | 'approved' | 'pending' | 'suspended';

export default function AdminWholesalePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [customers, setCustomers] = useState<WholesaleCustomer[]>([]);
  const [applications, setApplications] = useState<WholesaleApplication[]>([]);
  const [pricingRules, setPricingRules] = useState<BulkPricingRule[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState<WholesaleStats | null>(null);
  const [customerFilter, setCustomerFilter] = useState<CustomerFilter>('all');
  const [selectedApplication, setSelectedApplication] = useState<WholesaleApplication | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<WholesaleCustomer | null>(null);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BulkPricingRule | null>(null);

  // Pricing rule form state
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleProducts, setRuleProducts] = useState<string>('');
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [tiers, setTiers] = useState<Array<{ minQty: number; maxQty: string; price: number; discount: number }>>([
    { minQty: 10, maxQty: '49', price: 0, discount: 5 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCustomers(getAllWholesaleCustomers());
    setApplications(getAllApplications());
    setPricingRules(getAllPricingRules());
    setOrders(getAllBulkOrders());
    setStats(getWholesaleStats());
  };

  const handleApproveApplication = (appId: string) => {
    const result = approveApplication(appId, 'admin', {
      discountPercentage: 10,
      paymentTerms: 'Net 30',
    });
    
    if (result) {
      alert(`Application approved! Wholesale customer account created for ${result.customer.businessName}`);
      loadData();
      setSelectedApplication(null);
    }
  };

  const handleRejectApplication = (appId: string, reason: string) => {
    const result = rejectApplication(appId, 'admin', reason);
    if (result) {
      alert('Application rejected');
      loadData();
      setSelectedApplication(null);
    }
  };

  const handleUpdateCustomer = (customerId: string, updates: Partial<WholesaleCustomer>) => {
    updateWholesaleCustomer(customerId, updates);
    alert('Customer updated successfully');
    loadData();
    setSelectedCustomer(null);
  };

  const handleSavePricingRule = () => {
    if (!ruleName || !ruleProducts || tiers.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    const productIds = ruleProducts.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (productIds.length === 0) {
      alert('Please enter valid product IDs (comma-separated)');
      return;
    }

    const ruleTiers = tiers.map(tier => ({
      minQuantity: tier.minQty,
      maxQuantity: tier.maxQty ? parseInt(tier.maxQty) : undefined,
      pricePerUnit: tier.price,
      discountPercentage: tier.discount,
      savings: 0, // Will be calculated based on base price
    }));

    const ruleData = {
      name: ruleName,
      description: ruleDescription,
      productIds,
      tiers: ruleTiers,
      wholesaleOnly,
      isActive: true,
    };

    if (editingRule) {
      updatePricingRule(editingRule.id, ruleData);
      alert('Pricing rule updated successfully');
    } else {
      savePricingRule(ruleData);
      alert('Pricing rule created successfully');
    }

    resetPricingForm();
    loadData();
  };

  const resetPricingForm = () => {
    setShowPricingForm(false);
    setEditingRule(null);
    setRuleName('');
    setRuleDescription('');
    setRuleProducts('');
    setWholesaleOnly(false);
    setTiers([{ minQty: 10, maxQty: '49', price: 0, discount: 5 }]);
  };

  const handleEditRule = (rule: BulkPricingRule) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description || '');
    setRuleProducts(rule.productIds.join(', '));
    setWholesaleOnly(rule.wholesaleOnly);
    setTiers(rule.tiers.map(t => ({
      minQty: t.minQuantity,
      maxQty: t.maxQuantity?.toString() || '',
      price: t.pricePerUnit,
      discount: t.discountPercentage,
    })));
    setShowPricingForm(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this pricing rule?')) {
      deletePricingRule(ruleId);
      alert('Pricing rule deleted');
      loadData();
    }
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMinQty = lastTier.maxQty ? parseInt(lastTier.maxQty) + 1 : lastTier.minQty + 50;
    setTiers([...tiers, { minQty: newMinQty, maxQty: '', price: 0, discount: lastTier.discount + 5 }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((_, i) => i !== index));
    }
  };

  const filteredCustomers = customers.filter(customer => {
    if (customerFilter === 'all') return true;
    return customer.status === customerFilter;
  });

  const pendingApplications = applications.filter(a => a.status === 'pending');

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">
              Wholesale Management
            </h1>
            <p className="text-[var(--brown-700)]">
              Manage wholesale customers, applications, bulk pricing, and orders
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--beige-300)]">
            {[
              { id: 'overview', label: 'Overview', count: null },
              { id: 'applications', label: 'Applications', count: pendingApplications.length },
              { id: 'customers', label: 'Customers', count: customers.length },
              { id: 'pricing', label: 'Pricing Rules', count: pricingRules.length },
              { id: 'orders', label: 'Bulk Orders', count: orders.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 font-semibold transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                    : 'text-[var(--brown-700)] hover:text-[var(--accent)]'
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-600">Total Customers</h3>
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.totalCustomers}</p>
                  <p className="text-sm text-gray-600 mt-1">{stats.approvedCustomers} approved</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-600">Pending Applications</h3>
                    <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">{stats.pendingApplications}</p>
                  <p className="text-sm text-gray-600 mt-1">Requires review</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-600">Total Revenue</h3>
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">
                    KSH {stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">From {stats.totalBulkOrders} orders</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-600">Avg Order Value</h3>
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">
                    KSH {stats.averageOrderValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Per bulk order</p>
                </div>
              </div>

              {/* Top Products */}
              {stats.topProducts.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                  <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">Top Bulk Products</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--beige-100)] border-b border-[var(--beige-300)]">
                        <tr>
                          <th className="text-left p-3 font-semibold text-[var(--brown-800)]">Product</th>
                          <th className="text-right p-3 font-semibold text-[var(--brown-800)]">Units Sold</th>
                          <th className="text-right p-3 font-semibold text-[var(--brown-800)]">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.topProducts.slice(0, 5).map(product => (
                          <tr key={product.productId} className="border-b border-[var(--beige-200)]">
                            <td className="p-3 font-medium">{product.productName}</td>
                            <td className="p-3 text-right">{product.quantitySold.toLocaleString()}</td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              KSH {product.revenue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              {pendingApplications.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No pending applications</p>
                </div>
              ) : (
                pendingApplications.map(app => (
                  <div key={app.id} className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--brown-800)]">{app.businessName}</h3>
                        <p className="text-sm text-gray-600">{getBusinessTypeLabel(app.businessType)}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                        Pending Review
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Contact Person</p>
                        <p className="font-semibold">{app.contactName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{app.contactEmail}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold">{app.contactPhone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tax ID</p>
                        <p className="font-semibold">{app.taxId}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600">Business Address</p>
                      <p className="font-semibold">{app.businessAddress}</p>
                    </div>

                    {app.businessDescription && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Business Description</p>
                        <p className="text-sm">{app.businessDescription}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveApplication(app.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) handleRejectApplication(app.id, reason);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex gap-2 mb-4">
                {(['all', 'approved', 'pending', 'suspended'] as CustomerFilter[]).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setCustomerFilter(filter)}
                    className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                      customerFilter === filter
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-white border border-[var(--beige-300)] text-[var(--brown-700)] hover:bg-[var(--beige-50)]'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">No customers found</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md border border-[var(--beige-300)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[var(--beige-100)] border-b border-[var(--beige-300)]">
                        <tr>
                          <th className="text-left p-3 font-semibold text-[var(--brown-800)]">Business</th>
                          <th className="text-left p-3 font-semibold text-[var(--brown-800)]">Type</th>
                          <th className="text-left p-3 font-semibold text-[var(--brown-800)]">Contact</th>
                          <th className="text-left p-3 font-semibold text-[var(--brown-800)]">Status</th>
                          <th className="text-right p-3 font-semibold text-[var(--brown-800)]">Discount</th>
                          <th className="text-right p-3 font-semibold text-[var(--brown-800)]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map(customer => (
                          <tr key={customer.id} className="border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)]">
                            <td className="p-3">
                              <div>
                                <p className="font-semibold">{customer.businessName}</p>
                                <p className="text-sm text-gray-600">{customer.taxId}</p>
                              </div>
                            </td>
                            <td className="p-3">{getBusinessTypeLabel(customer.businessType)}</td>
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{customer.contactName}</p>
                                <p className="text-sm text-gray-600">{customer.contactEmail}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                customer.status === 'approved' ? 'bg-green-100 text-green-800' :
                                customer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                customer.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                              </span>
                            </td>
                            <td className="p-3 text-right font-semibold text-green-600">
                              {customer.discountPercentage || 0}%
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Rules Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[var(--brown-800)]">Bulk Pricing Rules</h2>
                <button
                  onClick={() => setShowPricingForm(true)}
                  className="bg-[var(--accent)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors"
                >
                  + Create Pricing Rule
                </button>
              </div>

              {showPricingForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                  <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">
                    {editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-1">
                        Rule Name *
                      </label>
                      <input
                        type="text"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        className="w-full border border-[var(--beige-300)] rounded px-3 py-2"
                        placeholder="e.g., Standard Bulk Pricing"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-1">
                        Description
                      </label>
                      <textarea
                        value={ruleDescription}
                        onChange={(e) => setRuleDescription(e.target.value)}
                        className="w-full border border-[var(--beige-300)] rounded px-3 py-2"
                        rows={2}
                        placeholder="Optional description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-1">
                        Product IDs (comma-separated) *
                      </label>
                      <input
                        type="text"
                        value={ruleProducts}
                        onChange={(e) => setRuleProducts(e.target.value)}
                        className="w-full border border-[var(--beige-300)] rounded px-3 py-2"
                        placeholder="e.g., 1, 2, 3"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="wholesaleOnly"
                        checked={wholesaleOnly}
                        onChange={(e) => setWholesaleOnly(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="wholesaleOnly" className="text-sm font-semibold text-[var(--brown-800)]">
                        Wholesale customers only
                      </label>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-[var(--brown-800)]">
                          Pricing Tiers *
                        </label>
                        <button
                          onClick={addTier}
                          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          + Add Tier
                        </button>
                      </div>
                      {tiers.map((tier, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                          <input
                            type="number"
                            value={tier.minQty}
                            onChange={(e) => {
                              const newTiers = [...tiers];
                              newTiers[index].minQty = parseInt(e.target.value) || 0;
                              setTiers(newTiers);
                            }}
                            className="border border-[var(--beige-300)] rounded px-2 py-1 text-sm"
                            placeholder="Min Qty"
                          />
                          <input
                            type="text"
                            value={tier.maxQty}
                            onChange={(e) => {
                              const newTiers = [...tiers];
                              newTiers[index].maxQty = e.target.value;
                              setTiers(newTiers);
                            }}
                            className="border border-[var(--beige-300)] rounded px-2 py-1 text-sm"
                            placeholder="Max Qty"
                          />
                          <input
                            type="number"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...tiers];
                              newTiers[index].price = parseFloat(e.target.value) || 0;
                              setTiers(newTiers);
                            }}
                            className="border border-[var(--beige-300)] rounded px-2 py-1 text-sm"
                            placeholder="Price"
                          />
                          <input
                            type="number"
                            value={tier.discount}
                            onChange={(e) => {
                              const newTiers = [...tiers];
                              newTiers[index].discount = parseFloat(e.target.value) || 0;
                              setTiers(newTiers);
                            }}
                            className="border border-[var(--beige-300)] rounded px-2 py-1 text-sm"
                            placeholder="Discount %"
                          />
                          <button
                            onClick={() => removeTier(index)}
                            className="text-red-600 hover:text-red-800"
                            disabled={tiers.length === 1}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleSavePricingRule}
                        className="flex-1 bg-[var(--accent)] text-white px-4 py-2 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors"
                      >
                        {editingRule ? 'Update Rule' : 'Create Rule'}
                      </button>
                      <button
                        onClick={resetPricingForm}
                        className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pricingRules.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">No pricing rules defined yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pricingRules.map(rule => (
                    <div key={rule.id} className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--brown-800)]">{rule.name}</h3>
                          {rule.description && (
                            <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {rule.wholesaleOnly && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                              Wholesale Only
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Products: {rule.productIds.join(', ')}</p>
                      </div>

                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-sm">
                          <thead className="bg-[var(--beige-100)]">
                            <tr>
                              <th className="text-left p-2">Quantity Range</th>
                              <th className="text-right p-2">Price/Unit</th>
                              <th className="text-right p-2">Discount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rule.tiers.map((tier, idx) => (
                              <tr key={idx} className="border-t border-[var(--beige-200)]">
                                <td className="p-2">
                                  {tier.minQuantity}+{tier.maxQuantity ? ` - ${tier.maxQuantity}` : ''}
                                </td>
                                <td className="p-2 text-right font-semibold">
                                  KSH {tier.pricePerUnit.toLocaleString()}
                                </td>
                                <td className="p-2 text-right text-green-600 font-semibold">
                                  {tier.discountPercentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-md text-center">
                  <p className="text-gray-600">No bulk orders yet</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-lg shadow-md border border-[var(--beige-300)]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--brown-800)]">
                          Order #{order.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Subtotal</p>
                        <p className="font-semibold">KSH {order.subtotal.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Volume Discount</p>
                        <p className="font-semibold text-green-600">-KSH {order.volumeDiscount.toLocaleString()}</p>
                      </div>
                      {order.wholesaleDiscount > 0 && (
                        <div>
                          <p className="text-sm text-gray-600">Wholesale Discount</p>
                          <p className="font-semibold text-green-600">-KSH {order.wholesaleDiscount.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-lg">KSH {order.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer font-semibold text-[var(--accent)] hover:text-[var(--brown-600)]">
                        View Items ({order.items.length})
                      </summary>
                      <div className="mt-2 space-y-2">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between p-2 bg-[var(--beige-50)] rounded">
                            <span>{item.productName} (x{item.quantity})</span>
                            <span className="font-semibold">KSH {item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
