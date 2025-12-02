'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem, cartCount } = useCart();  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">Shopping Cart</h1>
            <p className="text-[var(--brown-700)]">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-[var(--beige-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-2">Your cart is empty</h2>
              <p className="text-[var(--brown-700)] mb-6">Add some amazing handcrafted items to get started!</p>
              <Link 
                href="/shop" 
                className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-4 md:p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded-lg flex items-center justify-center">
                        <span className="text-2xl md:text-3xl font-bold text-[var(--brown-600)]">{item.image}</span>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 pr-4">
                            <h3 className="font-bold text-[var(--brown-800)] text-lg md:text-xl mb-1 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-sm text-[var(--accent)] uppercase tracking-wide font-semibold">
                              {item.category}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Stock Status */}
                        <div className="mb-3">
                          {item.inStock ? (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              In Stock
                            </span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                          )}
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--brown-700)] font-medium">Qty:</span>
                            <div className="flex items-center border border-[var(--beige-300)] rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1.5 hover:bg-[var(--beige-100)] transition-colors text-[var(--brown-800)] font-bold"
                                disabled={item.quantity <= 1}
                              >
                                −
                              </button>
                              <span className="px-4 py-1.5 text-[var(--brown-800)] font-semibold min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1.5 hover:bg-[var(--beige-100)] transition-colors text-[var(--brown-800)] font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-xl md:text-2xl font-bold text-[var(--accent)]">
                              KSH {(item.price * item.quantity).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              KSH {item.price.toLocaleString()} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Continue Shopping Link */}
                <Link 
                  href="/shop"
                  className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--brown-600)] font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Continue Shopping
                </Link>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 sticky top-32">
                  <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Order Summary</h2>

                  {/* Summary Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[var(--brown-700)]">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span className="font-semibold">KSH {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[var(--brown-700)]">
                      <span>Shipping</span>
                      <span className="font-semibold">
                        {shippingCost === 0 ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          `KSH ${shippingCost.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    {subtotal < 5000 && (
                      <div className="text-xs text-[var(--accent)] bg-[var(--beige-100)] p-3 rounded-md">
                        Add KSH {(5000 - subtotal).toLocaleString()} more for FREE delivery!
                      </div>
                    )}
                    <div className="border-t border-[var(--beige-300)] pt-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-lg font-bold text-[var(--brown-800)]">Total</span>
                        <span className="text-2xl font-bold text-[var(--accent)]">
                          KSH {total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link 
                    href="/checkout"
                    className="block w-full bg-[var(--accent)] text-white py-3 rounded-md font-bold text-lg hover:bg-[var(--brown-600)] transition-colors shadow-md hover:shadow-lg mb-3 text-center"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Security Badge */}
                  <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure Checkout
                  </div>

                  {/* Accepted Payments */}
                  <div className="mt-6 pt-6 border-t border-[var(--beige-300)]">
                    <p className="text-xs text-gray-500 mb-3 text-center font-semibold">We Accept</p>
                    <p className="text-sm text-[var(--brown-700)] text-center font-medium">
                      M-Pesa • Cards • Cash on Delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trust Badges */}
          {cartItems.length > 0 && (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <h3 className="font-bold text-[var(--brown-800)] mb-1">Fast Delivery</h3>
                <p className="text-sm text-[var(--brown-700)]">Nationwide shipping across Kenya</p>
              </div>
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-[var(--brown-800)] mb-1">100% Authentic</h3>
                <p className="text-sm text-[var(--brown-700)]">All handmade & artisan products</p>
              </div>
              <div className="bg-white rounded-lg border border-[var(--beige-300)] p-6 text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <h3 className="font-bold text-[var(--brown-800)] mb-1">Easy Returns</h3>
                <p className="text-sm text-[var(--brown-700)]">7-day return policy</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
