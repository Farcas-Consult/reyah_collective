'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getUserWishlists,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  createWishlist,
} from '@/utils/wishlist';
import { Wishlist } from '@/types/wishlist';

interface AddToWishlistButtonProps {
  productId: number;
  productName: string;
  productPrice: number;
  productSalePrice?: number;
  productImage: string;
  productCategory: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

export default function AddToWishlistButton({
  productId,
  productName,
  productPrice,
  productSalePrice,
  productImage,
  productCategory,
  size = 'md',
  variant = 'button',
  className = '',
}: AddToWishlistButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [selectedWishlistId, setSelectedWishlistId] = useState<string>('');

  useEffect(() => {
    if (user?.email) {
      loadWishlists();
      checkIfInWishlist();
    }
  }, [user, productId]);

  const loadWishlists = () => {
    if (!user?.email) return;
    const userWishlists = getUserWishlists(user.email);
    setWishlists(userWishlists);
    if (userWishlists.length > 0) {
      setSelectedWishlistId(userWishlists[0].id);
    }
  };

  const checkIfInWishlist = () => {
    if (!user?.email) return;
    const inList = isInWishlist(user.email, productId);
    setInWishlist(inList);
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (wishlists.length === 0) {
      // Create default wishlist
      if (!user) return;
      createWishlist(user.email, `${user.firstName} ${user.lastName}`, 'My Wishlist');
      loadWishlists();
    }

    setShowModal(true);
  };

  const handleAddToWishlist = (wishlistId: string) => {
    if (!user) return;

    const success = addToWishlist(
      wishlistId,
      productId,
      productName,
      productImage,
      productPrice,
      productSalePrice,
      1, // quantity
      'medium', // priority
      '' // notes
    );

    if (success) {
      setInWishlist(true);
      setShowModal(false);
    }
  };

  const handleRemoveFromWishlist = () => {
    if (!user?.email) return;

    const userWishlists = getUserWishlists(user.email);
    userWishlists.forEach(wishlist => {
      removeFromWishlist(wishlist.id, productId);
    });

    setInWishlist(false);
  };

  const sizeClasses = {
    sm: variant === 'icon' ? 'w-8 h-8' : 'px-3 py-1.5 text-sm',
    md: variant === 'icon' ? 'w-10 h-10' : 'px-4 py-2 text-base',
    lg: variant === 'icon' ? 'w-12 h-12' : 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={inWishlist ? handleRemoveFromWishlist : handleClick}
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-colors ${
            inWishlist
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-white border-2 border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
          } ${className}`}
          title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={iconSizes[size]}
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--brown-800)]">Add to Wishlist</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {wishlists.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You don't have any wishlists yet</p>
                  <button
                    onClick={() => {
                      if (!user) return;
                      createWishlist(user.email, `${user.firstName} ${user.lastName}`, 'My Wishlist');
                      loadWishlists();
                    }}
                    className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                  >
                    Create Wishlist
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Select a wishlist to add this product:</p>
                  {wishlists.map(wishlist => (
                    <button
                      key={wishlist.id}
                      onClick={() => handleAddToWishlist(wishlist.id)}
                      className="w-full text-left p-3 border-2 border-[var(--beige-300)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--beige-50)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[var(--brown-800)]">{wishlist.name}</p>
                          <p className="text-sm text-gray-600">{wishlist.items.length} items</p>
                        </div>
                        <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={inWishlist ? handleRemoveFromWishlist : handleClick}
        className={`${sizeClasses[size]} rounded-lg font-semibold transition-colors flex items-center gap-2 ${
          inWishlist
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-white border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--beige-50)]'
        } ${className}`}
      >
        <svg
          className={iconSizes[size]}
          fill={inWishlist ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--brown-800)]">Add to Wishlist</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {wishlists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any wishlists yet</p>
                <button
                  onClick={() => {
                    if (!user) return;
                    createWishlist(user.email, `${user.firstName} ${user.lastName}`, 'My Wishlist');
                    loadWishlists();
                  }}
                  className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
                >
                  Create Wishlist
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">Select a wishlist to add this product:</p>
                {wishlists.map(wishlist => (
                  <button
                    key={wishlist.id}
                    onClick={() => handleAddToWishlist(wishlist.id)}
                    className="w-full text-left p-3 border-2 border-[var(--beige-300)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--beige-50)] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--brown-800)]">{wishlist.name}</p>
                        <p className="text-sm text-gray-600">{wishlist.items.length} items</p>
                      </div>
                      <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
