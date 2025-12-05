'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { SavedCart } from '@/types/cart';
import Image from 'next/image';

export default function SavedCarts() {
  const { getSavedCartsList, restoreSavedCart, deleteSaved } = useCart();
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [selectedCart, setSelectedCart] = useState<SavedCart | null>(null);

  useEffect(() => {
    loadSavedCarts();
  }, []);

  const loadSavedCarts = () => {
    const carts = getSavedCartsList();
    setSavedCarts(carts);
  };

  const handleRestore = (cartId: string) => {
    restoreSavedCart(cartId);
    // Show success message
    alert('Cart restored successfully!');
  };

  const handleDelete = (cartId: string) => {
    if (confirm('Are you sure you want to delete this saved cart?')) {
      deleteSaved(cartId);
      loadSavedCarts();
      if (selectedCart?.id === cartId) {
        setSelectedCart(null);
      }
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

  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (savedCarts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-[var(--beige-300)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <h3 className="text-xl font-bold text-[var(--brown-800)] mb-2">No Saved Carts</h3>
        <p className="text-[var(--brown-700)]">You haven't saved any carts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--brown-800)]">Saved Carts</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Saved Carts List */}
        <div className="space-y-4">
          {savedCarts.map((cart) => {
            const daysLeft = getDaysUntilExpiry(cart.expiresAt);
            const isExpiringSoon = daysLeft <= 7;

            return (
              <div
                key={cart.id}
                className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                  selectedCart?.id === cart.id
                    ? 'border-[var(--accent)]'
                    : 'border-[var(--beige-300)] hover:border-[var(--accent)]'
                }`}
                onClick={() => setSelectedCart(cart)}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--brown-800)] mb-1">
                        {cart.name || `Cart from ${formatDate(cart.savedAt)}`}
                      </h3>
                      {cart.notes && (
                        <p className="text-sm text-[var(--brown-700)] mb-2">{cart.notes}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          KSH {cart.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(cart.id);
                        }}
                        className="p-2 bg-[var(--accent)] text-white rounded-md hover:bg-[var(--brown-600)] transition-colors"
                        title="Restore cart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cart.id);
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                        title="Delete cart"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expiry Warning */}
                  {isExpiringSoon && (
                    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                    </div>
                  )}

                  {/* Device Info */}
                  {cart.deviceInfo && (
                    <div className="mt-3 text-xs text-gray-500">
                      Saved from {cart.deviceInfo.platform}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Details */}
        {selectedCart && (
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 sticky top-6">
            <h3 className="text-xl font-bold text-[var(--brown-800)] mb-4">Cart Details</h3>

            <div className="space-y-4 mb-6">
              {selectedCart.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-[var(--beige-200)]">
                  <div className="w-16 h-16 bg-[var(--beige-100)] rounded flex-shrink-0 overflow-hidden relative">
                    {item.image && typeof item.image === 'object' ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover rounded" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[var(--brown-700)] text-xs font-bold">
                          {item.category?.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[var(--brown-800)] text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                      <span className="font-bold text-[var(--brown-800)]">
                        KSH {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--beige-300)] pt-4 mb-6">
              <div className="flex justify-between items-center text-lg font-bold text-[var(--brown-800)]">
                <span>Total</span>
                <span>KSH {selectedCart.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleRestore(selectedCart.id)}
                className="w-full bg-[var(--accent)] text-white px-6 py-3 rounded-md hover:bg-[var(--brown-600)] transition-colors font-medium"
              >
                Restore This Cart
              </button>
              <button
                onClick={() => handleDelete(selectedCart.id)}
                className="w-full bg-red-100 text-red-600 px-6 py-3 rounded-md hover:bg-red-200 transition-colors font-medium"
              >
                Delete This Cart
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-600">
              <p>Saved: {formatDate(selectedCart.savedAt)}</p>
              <p>Expires: {formatDate(selectedCart.expiresAt)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
