'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// import BackButton from '@/components/BackButton';
import Link from 'next/link';
import Image from 'next/image';

import type { Order as ReyahOrder, StatusHistory } from '@/utils/orders';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  tracking?: {
    currentStatus: string;
    location: string;
    estimatedDelivery: string;
    timeline: Array<{
      status: string;
      date: string;
      time: string;
      location: string;
      description: string;
    }>;
  };
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    county: string;
  };
}

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'settings'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Remove early return, handle loading in main JSX

  // Dynamic orders data for logged-in user
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user?.email) {
      // Dynamically import getOrdersByEmail to avoid SSR issues
      import('@/utils/orders').then(mod => {
        const userOrders = mod.getOrdersByEmail(user.email);
        // Map orders to local interface
        const allowedStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        const mappedOrders = userOrders
          .filter((order: ReyahOrder) => allowedStatuses.includes(order.status))
          .map((order: ReyahOrder) => ({
            id: order.id,
            date: order.date,
            total: order.total,
            status: order.status as 'processing' | 'shipped' | 'delivered' | 'cancelled',
            items: order.items,
            tracking: order.trackingInfo
              ? {
                  currentStatus: order.trackingInfo.events?.[order.trackingInfo.events.length - 1]?.status || order.status,
                  location: order.trackingInfo.currentLocation || '',
                  estimatedDelivery: order.trackingInfo.estimatedDelivery || '',
                  timeline: order.trackingInfo.events?.map((ev: StatusHistory) => ({
                    status: allowedStatuses.includes(ev.status) ? ev.status : 'processing',
                    date: ev.timestamp ? new Date(ev.timestamp).toLocaleDateString() : '',
                    time: ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : '',
                    location: ev.location || '',
                    description: ev.note || '',
                  })) || [],
                }
              : undefined,
            shippingAddress: order.shipping
              ? {
                  name: order.customer?.firstName + ' ' + order.customer?.lastName,
                  address: order.shipping.address,
                  city: order.shipping.city,
                  county: order.shipping.county,
                }
              : { name: '', address: '', city: '', county: '' },
          }));
        setOrders(mappedOrders);
      });
    }
  }, [user?.email]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-yellow-100 text-yellow-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes('delivered')) {
      return (
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else if (status.toLowerCase().includes('shipped') || status.toLowerCase().includes('transit')) {
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-[var(--beige-300)]">
              <div className="flex items-center justify-between p-6 border-b border-[var(--beige-300)]">
                <h1 className="text-2xl font-bold text-[var(--brown-800)]">My Account</h1>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`py-2 px-4 rounded-md font-semibold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'bg-[var(--accent)] text-white' : 'text-[var(--brown-800)] hover:bg-[var(--beige-100)]'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 3v18h18M3 3l18 18" />
                    </svg>
                    Orders
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-2 px-4 rounded-md font-semibold transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-[var(--accent)] text-white' : 'text-[var(--brown-800)] hover:bg-[var(--beige-100)]'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 14v4h-8v-4M12 10V6m0 0H8m4 0h4m-4 0v8" />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-2 px-4 rounded-md font-semibold transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-[var(--accent)] text-white' : 'text-[var(--brown-800)] hover:bg-[var(--beige-100)]'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18M3 3v18h18M3 3l18 18" />
                    </svg>
                    Settings
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'orders' && (
                  <div>
                    {orders.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No orders found. Start shopping to see your orders here.</p>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-[var(--beige-50)] rounded-lg p-4 shadow-sm border border-[var(--beige-300)]">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Order ID: <span className="font-semibold text-[var(--brown-800)]">{order.id}</span></p>
                                <p className="text-sm text-gray-600">Total: KSH {order.total.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Order Date</p>
                                <p className="text-lg font-bold text-[var(--accent)]">{new Date(order.date).toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-[var(--beige-200)] last:border-0">
                                  <div className="w-16 h-16 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded overflow-hidden shrink-0 relative">
                                    {item.image && typeof item.image === 'string' ? (
                                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    ) : null}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[var(--brown-800)] line-clamp-1">{item.name}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity} × KSH {item.price.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-col md:flex-row gap-3">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="flex-1 bg-[var(--accent)] text-white py-2 px-4 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors"
                              >
                                Track Order
                              </button>
                              <Link
                                href={`mailto:support@reyahcollective.com?subject=Order ${order.id}`}
                                className="flex-1 border-2 border-[var(--accent)] text-[var(--accent)] py-2 px-4 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors text-center"
                              >
                                Contact Support
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'orders' && selectedOrder && (
                      <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="flex items-center gap-2 text-[var(--accent)] hover:text-[var(--brown-600)] mb-6 font-semibold"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Back to Orders
                        </button>

                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-2">Order {selectedOrder.id}</h2>
                              <p className="text-gray-600">Placed on {new Date(selectedOrder.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>
                              {selectedOrder.status.toUpperCase()}
                            </span>
                          </div>

                          {selectedOrder.tracking && (
                            <div className="bg-gradient-to-br from-[var(--beige-50)] to-[var(--beige-100)] rounded-lg p-6 mb-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Current Status</p>
                                  <p className="text-xl font-bold text-[var(--brown-800)]">{selectedOrder.tracking.currentStatus}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                                  <p className="text-lg font-bold text-[var(--accent)]">{selectedOrder.tracking.estimatedDelivery}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{selectedOrder.tracking.location}</span>
                              </div>
                            </div>
                          )}

                          <h3 className="text-xl font-bold text-[var(--brown-800)] mb-6">Tracking Timeline</h3>
                          <div className="space-y-6">
                            {selectedOrder.tracking?.timeline.map((event, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  {getStatusIcon(event.status)}
                                  {idx < selectedOrder.tracking!.timeline.length - 1 && (
                                    <div className="w-0.5 h-16 bg-[var(--beige-300)] my-2" />
                                  )}
                                </div>
                                <div className="flex-1 pb-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-[var(--brown-800)]">{event.status}</h4>
                                    <span className="text-sm text-gray-600">{event.time}</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-1">{event.description}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {event.location} • {event.date}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
