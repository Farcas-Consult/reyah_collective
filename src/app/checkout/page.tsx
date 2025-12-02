'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { saveOrder, generateOrderNumber, generateTrackingNumber, sendOrderConfirmationEmail } from '@/utils/orders';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [formData, setFormData] = useState({
    // Contact Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Delivery Address
    address: '',
    city: '',
    county: '',
    postalCode: '',
    
    // Payment Method
    paymentMethod: 'mpesa',
    
    // M-Pesa Details
    mpesaNumber: '',
    
    // Additional Notes
    notes: ''
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal > 5000 ? 0 : 500;
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Generate order details
      const newOrderNumber = generateOrderNumber();
      const trackingNum = generateTrackingNumber();
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // 5 days from now

      const order = {
        id: Date.now().toString(),
        orderNumber: newOrderNumber,
        date: new Date().toISOString(),
        status: 'pending' as const,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          county: formData.county,
          postalCode: formData.postalCode
        },
        payment: {
          method: formData.paymentMethod,
          status: 'completed' as const
        },
        subtotal,
        shippingCost,
        total,
        trackingNumber: trackingNum,
        estimatedDelivery: estimatedDelivery.toISOString(),
        notes: formData.notes
      };

      // Save order to localStorage
      saveOrder(order);

      // Send confirmation email
      await sendOrderConfirmationEmail(order);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      setOrderNumber(newOrderNumber);
      setIsProcessing(false);
      setOrderPlaced(true);
      clearCart();

      // Redirect to orders page after 3 seconds
      setTimeout(() => {
        router.push(`/account/orders/${order.id}`);
      }, 3000);
    } catch (error) {
      console.error('Order processing error:', error);
      setIsProcessing(false);
      alert('There was an error processing your order. Please try again.');
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-32 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <BackButton />
            <svg className="w-24 h-24 mx-auto mb-4 text-[var(--beige-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-4">Your cart is empty</h1>
            <p className="text-[var(--brown-700)] mb-6">Add some items to your cart before checking out</p>
            <Link href="/shop" className="inline-block bg-[var(--accent)] text-white px-8 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors">
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-32 pb-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg border border-[var(--beige-300)] p-12">
              <svg className="w-24 h-24 mx-auto mb-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-4">Order Placed Successfully!</h1>
              <p className="text-[var(--brown-700)] mb-2 text-lg">
                Thank you for your order, {formData.firstName}!
              </p>
              <p className="text-sm text-gray-600 mb-6">
                A confirmation email has been sent to <strong>{formData.email}</strong>
              </p>
              <div className="bg-[var(--beige-100)] rounded-lg p-6 mb-6">
                <p className="text-sm text-[var(--brown-700)] mb-2">Order Number</p>
                <p className="text-2xl font-bold text-[var(--accent)] mb-4">{orderNumber}</p>
                <p className="text-sm text-[var(--brown-700)] mb-2">Order Total</p>
                <p className="text-3xl font-bold text-[var(--accent)]">KSH {total.toLocaleString()}</p>
              </div>
              <p className="text-sm text-gray-600 mb-6">Redirecting to order tracking...</p>
              <div className="flex gap-3 justify-center">
                <Link href="/account/orders" className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors">
                  View My Orders
                </Link>
                <Link href="/" className="inline-block bg-white border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-3 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-8">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="0712345678"
                      className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Delivery Address</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">County *</label>
                      <input
                        type="text"
                        name="county"
                        value={formData.county}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === 'mpesa'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[var(--accent)]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--brown-800)]">M-Pesa</p>
                      <p className="text-sm text-gray-600">Pay with your M-Pesa account</p>
                    </div>
                  </label>

                  {formData.paymentMethod === 'mpesa' && (
                    <div className="ml-8 mt-3">
                      <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">M-Pesa Number *</label>
                      <input
                        type="tel"
                        name="mpesaNumber"
                        value={formData.mpesaNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="0712345678"
                        className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-3 p-4 border-2 border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[var(--accent)]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--brown-800)]">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Visa, Mastercard accepted</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-[var(--accent)]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[var(--brown-800)]">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Order Notes (Optional)</h2>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Any special instructions for your order?"
                  className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] resize-none text-[var(--brown-800)]"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 sticky top-32">
                <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b border-[var(--beige-300)]">
                      <div className="w-16 h-16 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-[var(--brown-600)]">{item.image}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--brown-800)] line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-[var(--accent)]">KSH {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[var(--brown-700)]">
                    <span>Subtotal</span>
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
                  <div className="border-t border-[var(--beige-300)] pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-lg font-bold text-[var(--brown-800)]">Total</span>
                      <span className="text-2xl font-bold text-[var(--accent)]">
                        KSH {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-md font-bold text-lg transition-colors shadow-md hover:shadow-lg ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[var(--accent)] hover:bg-[var(--brown-600)] text-white'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>

                {/* Security Badge */}
                <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 mt-4">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Secure Checkout
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
