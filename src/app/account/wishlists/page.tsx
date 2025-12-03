'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WishlistCard from '@/components/WishlistCard';
import { getUserWishlists, createWishlist } from '@/utils/wishlist';
import { Wishlist, RegistryType } from '@/types/wishlist';

export default function WishlistsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState('');
  const [newWishlistType, setNewWishlistType] = useState<RegistryType>('wishlist');
  const [newWishlistDescription, setNewWishlistDescription] = useState('');
  const [newWishlistEventDate, setNewWishlistEventDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadWishlists();
  }, [isAuthenticated, router]);

  const loadWishlists = () => {
    if (!user?.email) return;
    const userWishlists = getUserWishlists(user.email);
    setWishlists(userWishlists);
    setLoading(false);
  };

  const handleCreateWishlist = () => {
    if (!newWishlistName.trim() || !user) return;

    createWishlist(
      user.email,
      `${user.firstName} ${user.lastName}`,
      newWishlistName,
      newWishlistType,
      newWishlistDescription || undefined,
      newWishlistEventDate || undefined
    );

    setNewWishlistName('');
    setNewWishlistType('wishlist');
    setNewWishlistDescription('');
    setNewWishlistEventDate('');
    setShowCreateModal(false);
    loadWishlists();
  };

  const wishlistTypes: { value: RegistryType; label: string; icon: string }[] = [
    { value: 'wishlist', label: 'General Wishlist', icon: '💝' },
    { value: 'wedding', label: 'Wedding Registry', icon: '💍' },
    { value: 'baby', label: 'Baby Registry', icon: '👶' },
    { value: 'birthday', label: 'Birthday Wishlist', icon: '🎂' },
    { value: 'holiday', label: 'Holiday Wishlist', icon: '🎄' },
    { value: 'other', label: 'Other', icon: '🎁' },
  ];

  if (loading) {
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">
                My Wishlists & Registries
              </h1>
              <p className="text-gray-600">
                Save your favorite items and share with friends and family
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </button>
          </div>

          {/* Wishlists Grid */}
          {wishlists.length === 0 ? (
            <div className="bg-white rounded-lg border border-[var(--beige-300)] p-12 text-center">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Wishlists Yet</h3>
              <p className="text-gray-600 mb-6">Create your first wishlist to start saving items you love</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
              >
                Create Your First Wishlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlists.map(wishlist => (
                <WishlistCard
                  key={wishlist.id}
                  wishlist={wishlist}
                  onUpdate={loadWishlists}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Create Wishlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[var(--brown-800)]">Create Wishlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {wishlistTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setNewWishlistType(type.value)}
                      className={`p-3 rounded-lg border-2 transition-colors text-left ${
                        newWishlistType === type.value
                          ? 'border-[var(--accent)] bg-[var(--beige-50)]'
                          : 'border-gray-200 hover:border-[var(--accent)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-semibold">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newWishlistName}
                  onChange={(e) => setNewWishlistName(e.target.value)}
                  placeholder="e.g., Summer Wishlist, Our Wedding"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newWishlistDescription}
                  onChange={(e) => setNewWishlistDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  rows={3}
                  maxLength={500}
                />
              </div>

              {/* Event Date */}
              {newWishlistType !== 'wishlist' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newWishlistEventDate}
                    onChange={(e) => setNewWishlistEventDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWishlist}
                  disabled={!newWishlistName.trim()}
                  className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
