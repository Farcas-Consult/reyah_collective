'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import Link from 'next/link';
import Image from 'next/image';

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

  if (!isAuthenticated || !user) {
    return null; // or a loading spinner
  }

  // Sample orders data - in real app, this would come from API/database
  const orders: Order[] = [
    {
      id: 'ORD-2024-001',
      date: '2024-12-01',
      total: 18298,
      status: 'shipped',
      items: [
        { id: 1, name: 'Handcrafted Silver Ring Set', quantity: 1, price: 11999, image: 'JW' },
        { id: 2, name: 'Organic Beeswax Food Wraps', quantity: 2, price: 3299, image: 'EC' }
      ],
      tracking: {
        currentStatus: 'In Transit',
        location: 'Nairobi Distribution Center',
        estimatedDelivery: 'Dec 3, 2024',
        timeline: [
          {
            status: 'Order Placed',
            date: 'Dec 1, 2024',
            time: '10:30 AM',
            location: 'Reyah Collective',
            description: 'Your order has been confirmed'
          },
          {
            status: 'Processing',
            date: 'Dec 1, 2024',
            time: '2:15 PM',
            location: 'Artisan Metals Kenya',
            description: 'Seller is preparing your items'
          },
          {
            status: 'Shipped',
            date: 'Dec 2, 2024',
            time: '9:00 AM',
            location: 'Nairobi Distribution Center',
            description: 'Package is on the way'
          }
        ]
      },
      shippingAddress: {
        name: 'John Doe',
        address: '123 Moi Avenue',
        city: 'Nairobi',
        county: 'Nairobi'
      }
    },
    {
      id: 'ORD-2024-002',
      date: '2024-11-28',
      total: 6099,
      status: 'delivered',
      items: [
        { id: 3, name: 'Vintage Leather Journal', quantity: 1, price: 6099, image: 'VG' }
      ],
      tracking: {
        currentStatus: 'Delivered',
        location: 'Your Address',
        estimatedDelivery: 'Nov 30, 2024',
        timeline: [
          {
            status: 'Order Placed',
            date: 'Nov 28, 2024',
            time: '3:20 PM',
            location: 'Reyah Collective',
            description: 'Your order has been confirmed'
          },
          {
            status: 'Shipped',
            date: 'Nov 29, 2024',
            time: '8:45 AM',
            location: 'Heritage Crafts',
            description: 'Package dispatched'
          },
          {
            status: 'Out for Delivery',
            date: 'Nov 30, 2024',
            time: '7:30 AM',
            location: 'Nairobi Hub',
            description: 'Your package is out for delivery'
          },
          {
            status: 'Delivered',
            date: 'Nov 30, 2024',
            time: '2:15 PM',
            location: 'Your Address',
            description: 'Package delivered successfully'
          }
        ]
      },
      shippingAddress: {
        name: 'John Doe',
        address: '123 Moi Avenue',
        city: 'Nairobi',
        county: 'Nairobi'
      }
    }
  ];

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
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-8">My Account</h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-4">
                <div className="text-center mb-6 pb-6 border-b border-[var(--beige-300)]">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--brown-600)] mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <h3 className="font-bold text-[var(--brown-800)]">{user.firstName} {user.lastName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                      activeTab === 'orders'
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--beige-100)] text-[var(--brown-700)]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    My Orders
                  </button>
                  <Link
                    href="/orders/track"
                    className="w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 hover:bg-[var(--beige-100)] text-[var(--brown-700)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Track Order
                  </Link>
                  <Link
                    href="/account/notifications"
                    className="w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 hover:bg-[var(--beige-100)] text-[var(--brown-700)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                  </Link>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                      activeTab === 'profile'
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--beige-100)] text-[var(--brown-700)]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                      activeTab === 'settings'
                        ? 'bg-[var(--accent)] text-white'
                        : 'hover:bg-[var(--beige-100)] text-[var(--brown-700)]'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'orders' && !selectedOrder && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[var(--brown-800)]">Order History</h2>
                    <div className="text-sm text-gray-600">{orders.length} orders</div>
                  </div>

                  {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-[var(--brown-800)]">Order {order.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Placed on {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          <p className="text-2xl font-bold text-[var(--accent)]">KSH {order.total.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 pb-3 border-b border-[var(--beige-200)] last:border-0">
                            <div className="w-16 h-16 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded overflow-hidden flex-shrink-0 relative">
                              {item.image && typeof item.image === 'object' ? (
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

                      <div className="flex gap-3">
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

                    <div className="mt-8 pt-6 border-t border-[var(--beige-300)]">
                      <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">Delivery Address</h3>
                      <div className="bg-[var(--beige-50)] rounded-lg p-4">
                        <p className="font-semibold text-[var(--brown-800)]">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-sm text-gray-700">{selectedOrder.shippingAddress.address}</p>
                        <p className="text-sm text-gray-700">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.county}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-6">Profile Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">First Name</label>
                        <input type="text" defaultValue={user.firstName} className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Last Name</label>
                        <input type="text" defaultValue={user.lastName} className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Email</label>
                        <input type="email" defaultValue={user.email} className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">Phone</label>
                        <input type="tel" defaultValue={user.phone} className="w-full px-4 py-2 border border-[var(--beige-300)] rounded-md" />
                      </div>
                    </div>
                    <button className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
                  <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-6">Email Notifications</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)]">
                      <div>
                        <p className="font-semibold text-[var(--brown-800)]">Order Confirmations</p>
                        <p className="text-sm text-gray-600">Get notified when your order is placed</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-[var(--accent)]" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)]">
                      <div>
                        <p className="font-semibold text-[var(--brown-800)]">Shipping Updates</p>
                        <p className="text-sm text-gray-600">Track your order with real-time notifications</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-[var(--accent)]" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)]">
                      <div>
                        <p className="font-semibold text-[var(--brown-800)]">Delivery Confirmations</p>
                        <p className="text-sm text-gray-600">Get notified when your order is delivered</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 text-[var(--accent)]" />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-[var(--beige-300)] rounded-lg cursor-pointer hover:border-[var(--accent)]">
                      <div>
                        <p className="font-semibold text-[var(--brown-800)]">Promotions & Offers</p>
                        <p className="text-sm text-gray-600">Receive exclusive deals and discounts</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-[var(--accent)]" />
                    </label>
                    <button className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-semibold hover:bg-[var(--brown-600)] transition-colors">
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
