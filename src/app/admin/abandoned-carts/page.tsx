'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { 
  getAbandonedCarts, 
  calculateCartAnalytics, 
  scheduleReminder,
  markReminderAsSent,
  getPendingReminders,
  markCartAsRecovered,
} from '@/utils/cartStorage';
import { AbandonedCart, CartAnalytics, CartReminder } from '@/types/cart';

export default function AbandonedCartsPage() {
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [analytics, setAnalytics] = useState<CartAnalytics | null>(null);
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [activeTab, setActiveTab] = useState<'carts' | 'analytics'>('carts');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMessage, setReminderMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'no-reminders' | 'reminders-sent'>('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const carts = getAbandonedCarts();
    setAbandonedCarts(carts);
    const stats = calculateCartAnalytics();
    setAnalytics(stats);
  };

  const handleSendReminder = (cart: AbandonedCart) => {
    if (!cart.userEmail) {
      alert('No email address available for this cart');
      return;
    }
    setSelectedCart(cart);
    setReminderMessage(`Hi ${cart.userName || 'Valued Customer'}, you left items in your cart! Complete your purchase now and get free shipping on orders over KSH 5000.`);
    setShowReminderModal(true);
  };

  const confirmSendReminder = () => {
    if (!selectedCart) return;
    
    const reminder = scheduleReminder(
      selectedCart.id,
      selectedCart.userEmail!,
      selectedCart.userName,
      'manual',
      0
    );
    
    markReminderAsSent(reminder.id);
    
    alert('Reminder scheduled successfully!');
    setShowReminderModal(false);
    setSelectedCart(null);
    loadData();
  };

  const handleMarkRecovered = (cartId: string) => {
    if (confirm('Mark this cart as recovered?')) {
      markCartAsRecovered(cartId);
      loadData();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSinceAbandoned = (abandonedAt: string) => {
    const now = Date.now();
    const abandoned = new Date(abandonedAt).getTime();
    const diffMs = now - abandoned;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHrs > 0) return `${diffHrs}h ago`;
    return 'Just now';
  };

  const filteredCarts = abandonedCarts.filter(cart => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'no-reminders') return cart.remindersSent === 0;
    if (filterStatus === 'reminders-sent') return cart.remindersSent > 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <BackButton />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">
              Abandoned Carts
            </h1>
            <p className="text-[var(--brown-700)]">
              Track and recover abandoned shopping carts
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-[var(--beige-300)]">
            <button
              onClick={() => setActiveTab('carts')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'carts'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--brown-700)] hover:text-[var(--accent)]'
              }`}
            >
              Abandoned Carts ({abandonedCarts.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--brown-700)] hover:text-[var(--accent)]'
              }`}
            >
              Analytics
            </button>
          </div>

          {activeTab === 'carts' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-semibold text-[var(--brown-800)]">Filter:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === 'all'
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--beige-100)] text-[var(--brown-800)] hover:bg-[var(--beige-200)]'
                      }`}
                    >
                      All ({abandonedCarts.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('no-reminders')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === 'no-reminders'
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--beige-100)] text-[var(--brown-800)] hover:bg-[var(--beige-200)]'
                      }`}
                    >
                      No Reminders ({abandonedCarts.filter(c => c.remindersSent === 0).length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('reminders-sent')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        filterStatus === 'reminders-sent'
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--beige-100)] text-[var(--brown-800)] hover:bg-[var(--beige-200)]'
                      }`}
                    >
                      Reminders Sent ({abandonedCarts.filter(c => c.remindersSent > 0).length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Abandoned Carts List */}
              {filteredCarts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-[var(--beige-300)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-[var(--brown-800)] mb-2">No Abandoned Carts</h3>
                  <p className="text-[var(--brown-700)]">Great! No carts have been abandoned.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {filteredCarts.map((cart) => (
                    <div
                      key={cart.id}
                      className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Cart Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-[var(--brown-800)] mb-1">
                                {cart.userName || 'Guest User'}
                              </h3>
                              {cart.userEmail && (
                                <p className="text-sm text-[var(--brown-700)] mb-2">{cart.userEmail}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {getTimeSinceAbandoned(cart.abandonedAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                                  {cart.itemCount} items
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  KSH {cart.total.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            
                            {cart.remindersSent > 0 && (
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                                {cart.remindersSent} {cart.remindersSent === 1 ? 'Reminder' : 'Reminders'} Sent
                              </div>
                            )}
                          </div>

                          {/* Cart Items Preview */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-[var(--brown-800)] mb-2">Items in Cart:</h4>
                            <div className="flex flex-wrap gap-2">
                              {cart.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="bg-[var(--beige-50)] px-3 py-1 rounded text-xs text-[var(--brown-700)]">
                                  {item.name} (x{item.quantity})
                                </div>
                              ))}
                              {cart.items.length > 3 && (
                                <div className="bg-[var(--beige-50)] px-3 py-1 rounded text-xs text-[var(--brown-700)]">
                                  +{cart.items.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Last Reminder */}
                          {cart.lastReminderSent && (
                            <p className="text-xs text-gray-500">
                              Last reminder: {formatDate(cart.lastReminderSent)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 lg:w-48">
                          <button
                            onClick={() => handleSendReminder(cart)}
                            disabled={!cart.userEmail}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                              cart.userEmail
                                ? 'bg-[var(--accent)] text-white hover:bg-[var(--brown-600)]'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Send Reminder
                            </span>
                          </button>
                          
                          <a
                            href={cart.checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white border-2 border-[var(--beige-300)] text-[var(--brown-800)] rounded-md hover:border-[var(--accent)] transition-colors font-medium text-center"
                          >
                            View Cart
                          </a>
                          
                          <button
                            onClick={() => handleMarkRecovered(cart.id)}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium"
                          >
                            Mark Recovered
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--brown-700)]">Total Abandoned</h3>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">{analytics.totalAbandoned}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--brown-700)]">Recovered</h3>
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">{analytics.totalRecovered}</p>
                  <p className="text-sm text-green-600 mt-1">{analytics.recoveryRate.toFixed(1)}% recovery rate</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--brown-700)]">Lost Revenue</h3>
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">
                    KSH {analytics.totalLostRevenue.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-[var(--brown-700)]">Recovered Revenue</h3>
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-[var(--brown-800)]">
                    KSH {analytics.totalRecoveredRevenue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Reminder Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h3 className="text-xl font-bold text-[var(--brown-800)] mb-4">Reminder Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-[var(--brown-700)] mb-1">Reminders Sent</p>
                    <p className="text-2xl font-bold text-[var(--brown-800)]">{analytics.remindersSent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--brown-700)] mb-1">Opened</p>
                    <p className="text-2xl font-bold text-[var(--brown-800)]">{analytics.remindersOpened}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--brown-700)] mb-1">Clicked</p>
                    <p className="text-2xl font-bold text-[var(--brown-800)]">{analytics.remindersClicked}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--brown-700)] mb-1">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.reminderConversionRate.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Top Abandoned Products */}
              {analytics.topAbandonedProducts.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <h3 className="text-xl font-bold text-[var(--brown-800)] mb-4">Top Abandoned Products</h3>
                  <div className="space-y-3">
                    {analytics.topAbandonedProducts.slice(0, 5).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between py-3 border-b border-[var(--beige-200)]">
                        <div>
                          <p className="font-semibold text-[var(--brown-800)]">{product.productName}</p>
                          <p className="text-sm text-gray-600">Abandoned {product.abandonedCount} times</p>
                        </div>
                        <p className="font-bold text-[var(--accent)]">
                          KSH {product.totalValue.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Send Reminder Modal */}
      {showReminderModal && selectedCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--brown-800)]">Send Reminder</h2>
              <button
                onClick={() => setShowReminderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-[var(--brown-700)] mb-2">
                To: <span className="font-semibold">{selectedCart.userEmail}</span>
              </p>
              <p className="text-sm text-[var(--brown-700)] mb-2">
                Cart Value: <span className="font-semibold">KSH {selectedCart.total.toLocaleString()}</span>
              </p>
              <p className="text-sm text-[var(--brown-700)]">
                Items: <span className="font-semibold">{selectedCart.itemCount}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[var(--brown-800)] mb-2">
                Message
              </label>
              <textarea
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReminderModal(false)}
                className="flex-1 px-4 py-2 border-2 border-[var(--beige-300)] text-[var(--brown-800)] rounded-md hover:border-[var(--accent)] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmSendReminder}
                className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium"
              >
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
