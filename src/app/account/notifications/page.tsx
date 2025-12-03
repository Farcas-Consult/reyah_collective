'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { getNotificationHistory, getOrderStatusLabel, getOrderStatusColor } from '@/utils/orders';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadNotifications();
  }, [isAuthenticated, router]);

  const loadNotifications = () => {
    const allNotifications = getNotificationHistory();
    // Filter by current user's email
    const userNotifications = allNotifications.filter(n => 
      n.email.toLowerCase() === user?.email.toLowerCase()
    );
    setNotifications(userNotifications.reverse());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.status === filter);

  const clearAllNotifications = () => {
    if (confirm('Clear all notifications?')) {
      const allNotifications = getNotificationHistory();
      const otherNotifications = allNotifications.filter(n => 
        n.email.toLowerCase() !== user?.email.toLowerCase()
      );
      localStorage.setItem('reyah_notifications', JSON.stringify(otherNotifications));
      setNotifications([]);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link 
            href="/account" 
            className="text-[#2D5F3F] hover:underline mb-4 inline-block"
          >
            ← Back to Account
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Order Notifications</h1>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="mt-4 md:mt-0 text-red-600 hover:text-red-800 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex gap-2 p-2 overflow-x-auto">
            {['all', 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md font-semibold whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-[#2D5F3F] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : getOrderStatusLabel(status as any)}
                <span className="ml-2 text-xs">
                  ({status === 'all' ? notifications.length : notifications.filter(n => n.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-lg">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-gray-600">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(notification.status)}`}>
                          {getOrderStatusLabel(notification.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(notification.timestamp)}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/orders/track?orderNumber=${notification.orderNumber}`}
                        className="font-semibold text-gray-900 hover:text-[#2D5F3F]"
                      >
                        Order {notification.orderNumber}
                      </Link>
                      
                      <p className="text-gray-700 mt-1">{notification.message}</p>
                      
                      {notification.trackingNumber && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Tracking:</span>
                          <span className="font-mono font-semibold text-gray-900">{notification.trackingNumber}</span>
                        </div>
                      )}
                      
                      {notification.estimatedDelivery && (
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Est. Delivery:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(notification.estimatedDelivery).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      href={`/orders/track?orderNumber=${notification.orderNumber}`}
                      className="text-[#2D5F3F] hover:text-[#234830] font-semibold text-sm whitespace-nowrap"
                    >
                      Track Order →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📧 About Notifications</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll receive notifications when your order status changes</li>
            <li>• Track your order in real-time using the tracking number</li>
            <li>• Notifications are automatically sent to your email and phone</li>
            <li>• You can view all notification history here</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
