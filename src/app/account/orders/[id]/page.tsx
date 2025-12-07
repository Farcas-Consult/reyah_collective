'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderById, type Order } from '@/utils/orders';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = params.id as string;
    const foundOrder = getOrderById(orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
    }
    setLoading(false);
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { name: 'Order Placed', status: 'pending', icon: '📦' },
      { name: 'Processing', status: 'processing', icon: '⚙️' },
      { name: 'Shipped', status: 'shipped', icon: '🚚' },
      { name: 'Delivered', status: 'delivered', icon: '✓' }
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = order ? statusOrder.indexOf(order.status) : -1;

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-40 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[var(--brown-700)]">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--beige-100)]">
        <Header />
        <main className="pt-40 pb-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <BackButton />
            <svg className="w-24 h-24 mx-auto mb-4 text-[var(--beige-300)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h1 className="text-3xl font-bold text-[var(--brown-800)] mb-4">Order Not Found</h1>
            <p className="text-[var(--brown-700)] mb-6">We couldn't find the order you're looking for.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/account/orders" className="bg-[var(--accent)] text-white px-6 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors">
                View All Orders
              </Link>
              <Link href="/shop" className="bg-white border-2 border-[var(--accent)] text-[var(--accent)] px-6 py-3 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <BackButton />

          {/* Order Header */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--brown-800)] mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-sm text-gray-600">
                  Placed on {new Date(order.date).toLocaleDateString('en-KE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="bg-[var(--beige-50)] rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-[var(--brown-800)] mb-1">Tracking Number</p>
                <p className="text-lg font-mono text-[var(--accent)]">{order.trackingNumber}</p>
              </div>
            )}

            {/* Estimated Delivery */}
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-blue-800">
                    Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-KE', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Status Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--brown-800)] mb-6">Order Status</h2>
            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-1 bg-[var(--beige-300)]" style={{ zIndex: 0 }}></div>
              <div 
                className="absolute top-6 left-0 h-1 bg-[var(--accent)] transition-all duration-500" 
                style={{ 
                  width: `${(statusSteps.filter(s => s.completed).length - 1) * (100 / (statusSteps.length - 1))}%`,
                  zIndex: 0
                }}
              ></div>
              
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center" style={{ zIndex: 1 }}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-2 border-4 ${
                      step.completed 
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white' 
                        : 'bg-white border-[var(--beige-300)] text-gray-400'
                    }`}>
                      {step.icon}
                    </div>
                    <p className={`text-xs md:text-sm font-semibold text-center max-w-[80px] ${
                      step.active ? 'text-[var(--accent)]' : step.completed ? 'text-[var(--brown-800)]' : 'text-gray-400'
                    }`}>
                      {step.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Items */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
              <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-[var(--beige-300)] last:border-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded-lg overflow-hidden relative flex-shrink-0">
                      {item.image && typeof item.image === 'object' ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--brown-800)] mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                      <p className="text-lg font-bold text-[var(--accent)]">
                        KSH {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Details */}
            <div className="space-y-6">
              {/* Price Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h2 className="text-xl font-bold text-[var(--brown-800)] mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-[var(--brown-700)]">
                    <span>Subtotal</span>
                    <span>KSH {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--brown-700)]">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? 'FREE' : `KSH ${order.shippingCost.toLocaleString()}`}</span>
                  </div>
                  <div className="border-t border-[var(--beige-300)] pt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[var(--brown-800)]">Total</span>
                      <span className="text-2xl font-bold text-[var(--accent)]">
                        KSH {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h3 className="font-bold text-[var(--brown-800)] mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-[var(--brown-700)]">
                    <strong>Name:</strong> {order.customer.firstName} {order.customer.lastName}
                  </p>
                  <p className="text-[var(--brown-700)]">
                    <strong>Email:</strong> {order.customer.email}
                  </p>
                  <p className="text-[var(--brown-700)]">
                    <strong>Phone:</strong> {order.customer.phone}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h3 className="font-bold text-[var(--brown-800)] mb-3">Shipping Address</h3>
                <div className="text-sm text-[var(--brown-700)]">
                  <p>{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.county}</p>
                  {order.shipping.postalCode && <p>{order.shipping.postalCode}</p>}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                <h3 className="font-bold text-[var(--brown-800)] mb-3">Payment Method</h3>
                <p className="text-sm text-[var(--brown-700)] capitalize">
                  {order.payment.method === 'mpesa' ? 'M-Pesa' : 
                   order.payment.method === 'card' ? 'Credit/Debit Card' : 
                   'Cash on Delivery'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Status: <span className="font-semibold text-green-600">{order.payment.status}</span>
                </p>
              </div>

              {order.notes && (
                <div className="bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)] p-6">
                  <h3 className="font-bold text-[var(--brown-800)] mb-2">Order Notes</h3>
                  <p className="text-sm text-[var(--brown-700)]">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/account/orders"
              className="bg-[var(--accent)] text-white px-8 py-3 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors text-center"
            >
              View All Orders
            </Link>
            <Link 
              href="/shop"
              className="bg-white border-2 border-[var(--accent)] text-[var(--accent)] px-8 py-3 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
