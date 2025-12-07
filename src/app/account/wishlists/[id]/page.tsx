'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  getWishlistById, 
  updateWishlist, 
  updatePrivacy, 
  removeFromWishlist,
  updateWishlistItem,
  generateShareUrl 
} from '@/utils/wishlist';
import { Wishlist, WishlistPrivacy } from '@/types/wishlist';

export default function WishlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadWishlist();
  }, [isAuthenticated, params.id]);

  const loadWishlist = () => {
    const id = params.id as string;
    const data = getWishlistById(id);
    
    if (!data || data.userEmail !== user?.email) {
      router.push('/account/wishlists');
      return;
    }

    setWishlist(data);
    setLoading(false);
  };

  const handlePrivacyChange = (privacy: WishlistPrivacy) => {
    if (!wishlist) return;
    updatePrivacy(wishlist.id, privacy);
    loadWishlist();
  };

  const handleToggleNotifications = (type: 'sale' | 'stock') => {
    if (!wishlist) return;
    updateWishlist(wishlist.id, {
      notifyOnSale: type === 'sale' ? !wishlist.notifyOnSale : wishlist.notifyOnSale,
      notifyOnStock: type === 'stock' ? !wishlist.notifyOnStock : wishlist.notifyOnStock,
    });
    loadWishlist();
  };

  const handleRemoveItem = (productId: string) => {
    if (!wishlist || !confirm('Remove this item from your wishlist?')) return;
    removeFromWishlist(wishlist.id, Number(productId));
    loadWishlist();
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (!wishlist || quantity < 1) return;
    updateWishlistItem(wishlist.id, Number(productId), { quantity });
    loadWishlist();
  };

  const handleUpdatePriority = (productId: string, priority: 'low' | 'medium' | 'high') => {
    if (!wishlist) return;
    updateWishlistItem(wishlist.id, Number(productId), { priority });
    loadWishlist();
  };

  const handleShare = () => {
    if (!wishlist) return;
    const url = generateShareUrl(wishlist.id);
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleCopyUrl = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (!wishlist) {
    return null;
  }

  const totalValue = wishlist.items.reduce((sum, item) => sum + (item.productSalePrice || item.productPrice) * item.quantity, 0);
  const purchasedCount = wishlist.items.filter(item => item.purchased).length;

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

  const privacyOptions: { value: WishlistPrivacy; label: string; description: string }[] = [
    { value: 'private', label: 'Private', description: 'Only you can see this' },
    { value: 'shared', label: 'Shared', description: 'Anyone with link can view' },
    { value: 'public', label: 'Public', description: 'Visible to everyone' },
  ];

  return (
    <div className="bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/account/wishlists')}
              className="flex items-center gap-2 text-gray-600 hover:text-[var(--accent)] mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Wishlists
            </button>

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getTypeIcon(wishlist.type)}</span>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)]">
                    {wishlist.name}
                  </h1>
                  {wishlist.description && (
                    <p className="text-gray-600 mt-1">{wishlist.description}</p>
                  )}
                  {wishlist.eventDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Event Date: {new Date(wishlist.eventDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleShare}
                className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
              >
                Share
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--brown-800)]">{wishlist.items.length}</div>
                <div className="text-sm text-gray-600">Items</div>
              </div>
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--accent)]">KSH {totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{purchasedCount}</div>
                <div className="text-sm text-gray-600">Purchased</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">Settings</h3>

                {/* Privacy */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Privacy</label>
                  <div className="space-y-2">
                    {privacyOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handlePrivacyChange(option.value)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          wishlist.privacy === option.value
                            ? 'border-[var(--accent)] bg-[var(--beige-50)]'
                            : 'border-gray-200 hover:border-[var(--accent)]'
                        }`}
                      >
                        <div className="font-semibold text-sm">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notifications</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wishlist.notifyOnSale}
                        onChange={() => handleToggleNotifications('sale')}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-semibold">Price Drops</div>
                        <div className="text-xs text-gray-600">Get notified when items go on sale</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={wishlist.notifyOnStock}
                        onChange={() => handleToggleNotifications('stock')}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="text-sm font-semibold">Back in Stock</div>
                        <div className="text-xs text-gray-600">Get notified when items are available</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="lg:col-span-2">
              {wishlist.items.length === 0 ? (
                <div className="bg-white rounded-lg border border-[var(--beige-300)] p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No Items Yet</h3>
                  <p className="text-gray-600">Start adding items to your wishlist from the shop</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.items.map(item => (
                    <div
                      key={item.productId}
                      className={`bg-white rounded-lg border border-[var(--beige-300)] p-4 ${
                        item.purchased ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-[var(--brown-800)]">{item.productName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {item.productSalePrice && item.productSalePrice < item.productPrice ? (
                                  <>
                                    <span className="text-lg font-bold text-red-600">
                                      KSH {item.productSalePrice.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      KSH {item.productPrice.toLocaleString()}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-lg font-bold text-[var(--accent)]">
                                    KSH {item.productPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.productId.toString())}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {item.notes && (
                            <p className="text-sm text-gray-600 mb-2">{item.notes}</p>
                          )}

                          <div className="flex items-center gap-4 flex-wrap">
                            {/* Quantity */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Qty:</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.productId.toString(), item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                              >
                                -
                              </button>
                              <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.productId.toString(), item.quantity + 1)}
                                className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>

                            {/* Priority */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Priority:</span>
                              <select
                                value={item.priority}
                                onChange={(e) => handleUpdatePriority(item.productId.toString(), e.target.value as any)}
                                className="text-sm border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>

                            {/* Purchased Status */}
                            {item.purchased && (
                              <div className="flex items-center gap-1 text-green-600 text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>Purchased by {item.purchasedBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[var(--brown-800)]">Share Wishlist</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl || ''}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out my wishlist: ${shareUrl || ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=Check out my wishlist&body=${encodeURIComponent(shareUrl || '')}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
