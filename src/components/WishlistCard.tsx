'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Wishlist } from '@/types/wishlist';
import { deleteWishlist, updatePrivacy, generateShareUrl } from '@/utils/wishlist';

interface WishlistCardProps {
  wishlist: Wishlist;
  onUpdate: () => void;
}

export default function WishlistCard({ wishlist, onUpdate }: WishlistCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDelete = () => {
    if (confirm(`Delete "${wishlist.name}"? This action cannot be undone.`)) {
      deleteWishlist(wishlist.id);
      onUpdate();
    }
  };

  const handleShare = () => {
    // Ensure wishlist is shareable
    if (wishlist.privacy === 'private') {
      updatePrivacy(wishlist.id, 'shared');
      onUpdate();
    }
    
    const url = generateShareUrl(wishlist.id);
    if (url) {
      setShareUrl(url);
      setShowShareModal(true);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalItems = wishlist.items.length;
  const totalValue = wishlist.items.reduce(
    (sum, item) => sum + (item.productSalePrice || item.productPrice) * item.quantity,
    0
  );
  const purchasedCount = wishlist.items.filter(item => item.purchased).length;

  const typeIcons: { [key: string]: string } = {
    wishlist: '💝',
    wedding: '💍',
    baby: '👶',
    birthday: '🎂',
    holiday: '🎄',
    other: '🎁',
  };

  const privacyColors: { [key: string]: string } = {
    private: 'bg-gray-100 text-gray-700',
    public: 'bg-green-100 text-green-700',
    shared: 'bg-blue-100 text-blue-700',
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="p-6 border-b border-[var(--beige-200)]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{typeIcons[wishlist.type]}</span>
              <div>
                <Link 
                  href={`/account/wishlists/${wishlist.id}`}
                  className="text-xl font-bold text-[var(--brown-800)] hover:text-[var(--accent)] transition-colors"
                >
                  {wishlist.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${privacyColors[wishlist.privacy]}`}>
                    {wishlist.privacy}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(wishlist.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {wishlist.description && (
            <p className="text-sm text-gray-600 mb-3">{wishlist.description}</p>
          )}
          
          {wishlist.eventDate && (
            <div className="flex items-center gap-2 text-sm text-[var(--accent)] font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Event: {new Date(wishlist.eventDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-[var(--beige-50)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--brown-800)]">{totalItems}</p>
            <p className="text-xs text-gray-600">Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">
              KSH {totalValue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{purchasedCount}</p>
            <p className="text-xs text-gray-600">Purchased</p>
          </div>
        </div>

        {/* Preview Items */}
        {totalItems > 0 && (
          <div className="p-4">
            <div className="flex gap-2 overflow-x-auto">
              {wishlist.items.slice(0, 4).map((item) => (
                <div key={item.productId} className="relative flex-shrink-0">
                  <Image
                    src={item.productImage || '/placeholder.png'}
                    alt={item.productName}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                  {item.purchased && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
              {totalItems > 4 && (
                <div className="w-16 h-16 bg-[var(--beige-100)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-600">+{totalItems - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-[var(--beige-200)] flex gap-2">
          <Link
            href={`/account/wishlists/${wishlist.id}`}
            className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm text-center"
          >
            View
          </Link>
          <button
            onClick={handleShare}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            Share
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
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
            
            <p className="text-gray-600 mb-4">Share this wishlist link with friends and family:</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out my wishlist: ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center font-semibold text-sm"
              >
                WhatsApp
              </a>
              <a
                href={`mailto:?subject=Check out my wishlist&body=I'd love for you to see my wishlist: ${shareUrl}`}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-semibold text-sm"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
