'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getWishlistByShareToken, markItemPurchased } from '@/utils/wishlist';
import { Wishlist } from '@/types/wishlist';

export default function SharedWishlistPage() {
  const params = useParams();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaserName, setPurchaserName] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  useEffect(() => {
    loadWishlist();
  }, [params.token]);

  const loadWishlist = () => {
    const token = params.token as string;
    const data = getWishlistByShareToken(token);
    
    if (!data) {
      setLoading(false);
      return;
    }

    setWishlist(data);
    setLoading(false);
  };

  const handleMarkPurchased = () => {
    if (!wishlist || !selectedProduct || !purchaserName.trim()) return;

    markItemPurchased(wishlist.id, selectedProduct, purchaserName.trim());
    setSelectedProduct(null);
    setPurchaserName('');
    loadWishlist();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="bg-[var(--beige-100)]">
        <Header />
        <main className="pt-40 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Wishlist Not Found</h1>
            <p className="text-gray-600 mb-6">This wishlist link is invalid or has been removed.</p>
            <button
              onClick={() => router.push('/')}
              className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
            >
              Go to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalValue = wishlist.items.reduce((sum, item) => sum + (item.productSalePrice || item.productPrice) * item.quantity, 0);
  const purchasedCount = wishlist.items.filter(item => item.purchased).length;
  const remainingValue = wishlist.items
    .filter(item => !item.purchased)
    .reduce((sum, item) => sum + (item.productSalePrice || item.productPrice) * item.quantity, 0);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      wishlist: '💝',
      wedding: '💍',
      baby: '👶',
      birthday: '🎂',
      holiday: '🎄',
      other: '🎁',
    };
    return icons[type] || '💝';
  };

  const sortedItems = [...wishlist.items].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.purchased !== b.purchased) return a.purchased ? 1 : -1;
    return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
  });

  return (
    <div className="bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">{getTypeIcon(wishlist.type)}</span>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)]">
                  {wishlist.name}
                </h1>
                <p className="text-gray-600 mt-1">by {wishlist.userName}</p>
              </div>
            </div>

            {wishlist.description && (
              <p className="text-gray-700 mb-4">{wishlist.description}</p>
            )}

            {wishlist.eventDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Event Date: {new Date(wishlist.eventDate).toLocaleDateString()}
              </div>
            )}

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">
                  {purchasedCount} / {wishlist.items.length} items purchased
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(purchasedCount / wishlist.items.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--brown-800)]">{wishlist.items.length}</div>
                <div className="text-xs text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-[var(--accent)]">KSH {totalValue.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Total Value</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">KSH {remainingValue.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Remaining</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {sortedItems.map(item => (
              <div
                key={item.productId}
                className={`bg-white rounded-lg border border-[var(--beige-300)] p-4 ${
                  item.purchased ? 'opacity-60' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    {item.purchased && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <div className="bg-white rounded-full p-2">
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-[var(--brown-800)]">{item.productName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {item.productSalePrice && item.productSalePrice < item.productPrice ? (
                            <>
                              <span className="text-xl font-bold text-red-600">
                                KSH {item.productSalePrice.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                KSH {item.productPrice.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-[var(--accent)]">
                              KSH {item.productPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : item.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.priority} priority
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-sm text-gray-600 mb-3">{item.notes}</p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Quantity needed: <span className="font-semibold">{item.quantity}</span>
                      </div>

                      {item.purchased ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Purchased by {item.purchasedBy}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedProduct(item.productId)}
                          className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                        >
                          Mark as Purchased
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {/* Mark Purchased Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[var(--brown-800)] mb-4">Mark as Purchased</h3>
            <p className="text-gray-600 mb-4">
              Let {wishlist.userName} know you've purchased this item!
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={purchaserName}
                onChange={(e) => setPurchaserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                maxLength={100}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setPurchaserName('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPurchased}
                disabled={!purchaserName.trim()}
                className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
