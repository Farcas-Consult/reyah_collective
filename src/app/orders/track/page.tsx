'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TrackingDisplay from '@/components/TrackingDisplay';
import { 
  getOrderById, 
  getOrdersByEmail, 
  type Order, 
  type OrderStatus,
  getOrderStatusLabel,
  getOrderStatusColor 
} from '@/utils/orders';

const statusSteps: OrderStatus[] = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function TrackOrderPage() {
  const [searchType, setSearchType] = useState<'orderNumber' | 'email'>('orderNumber');
  const [searchValue, setSearchValue] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setError('');
    setOrder(null);
    setOrders([]);
    setLoading(true);

    setTimeout(() => {
      if (searchType === 'orderNumber') {
        const allOrders = JSON.parse(localStorage.getItem('reyah_orders') || '[]');
        const foundOrder = allOrders.find((o: Order) => 
          o.orderNumber.toLowerCase() === searchValue.toLowerCase()
        );
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found. Please check your order number and try again.');
        }
      } else {
        const foundOrders = getOrdersByEmail(searchValue);
        if (foundOrders.length > 0) {
          setOrders(foundOrders);
        } else {
          setError('No orders found for this email address.');
        }
      }
      setLoading(false);
    }, 500);
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    return statusSteps.indexOf(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTrackingTimeline = (order: Order) => {
    const currentStepIndex = getStatusStepIndex(order.status);
    
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-6">Order Status Timeline</h3>
        
        {/* Desktop Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
              <div 
                className="h-full bg-green-500 transition-all duration-500"
                style={{ 
                  width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` 
                }}
              />
            </div>
            
            {/* Status Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const statusHistory = order.statusHistory?.find(h => h.status === step);
                
                return (
                  <div key={step} className="flex flex-col items-center" style={{ width: '20%' }}>
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="mt-3 text-center">
                      <p className={`font-medium text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                        {getOrderStatusLabel(step)}
                      </p>
                      {statusHistory && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(statusHistory.timestamp)}
                        </p>
                      )}
                      {statusHistory?.location && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {statusHistory.location}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden space-y-4">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const statusHistory = order.statusHistory?.find(h => h.status === step);
            
            return (
              <div key={step} className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`w-1 h-16 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
                
                <div className="flex-1 pb-8">
                  <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                    {getOrderStatusLabel(step)}
                  </p>
                  {statusHistory && (
                    <>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(statusHistory.timestamp)}
                      </p>
                      {statusHistory.location && (
                        <p className="text-sm text-gray-600 mt-1">
                          📍 {statusHistory.location}
                        </p>
                      )}
                      {statusHistory.note && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {statusHistory.note}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderOrderDetails = (order: Order) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h2>
          <p className="text-gray-600 mt-1">Placed on {formatDate(order.date)}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>
      </div>

      {/* Tracking Information */}
      {order.trackingNumber && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Shipment Tracking</h3>
          <TrackingDisplay trackingNumber={order.trackingNumber} showFullDetails={true} />
        </div>
      )}

      {/* Fallback for old tracking info structure */}
      {!order.trackingNumber && order.trackingInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Tracking Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tracking Number</p>
              <p className="font-mono font-semibold text-gray-900">{order.trackingInfo.trackingNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carrier</p>
              <p className="font-semibold text-gray-900">{order.trackingInfo.carrier}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estimated Delivery</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.trackingInfo.estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {order.trackingInfo.currentLocation && (
              <div>
                <p className="text-sm text-gray-600">Current Location</p>
                <p className="font-semibold text-gray-900">📍 {order.trackingInfo.currentLocation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {renderTrackingTimeline(order)}

      {/* Order Items */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center space-x-4 border-b pb-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                {item.sellerName && (
                  <p className="text-sm text-gray-600">Seller: {item.sellerName}</p>
                )}
              </div>
              <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Information */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
          <div className="text-gray-700">
            <p>{order.customer.firstName} {order.customer.lastName}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}, {order.shipping.county}</p>
            <p>{order.shipping.postalCode}</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
          <div className="text-gray-700">
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Subtotal</span>
            <span className="font-medium">€{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Shipping</span>
            <span className="font-medium">€{order.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span>€{order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link 
          href="/account/orders"
          className="flex-1 bg-[#2D5F3F] text-white px-6 py-3 rounded-lg hover:bg-[#234830] transition-colors text-center font-medium"
        >
          View All Orders
        </Link>
        <button className="flex-1 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Contact Support
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number or email to view tracking details</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search By</label>
              <select
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value as 'orderNumber' | 'email');
                  setSearchValue('');
                  setError('');
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent"
              >
                <option value="orderNumber">Order Number</option>
                <option value="email">Email Address</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'orderNumber' ? 'Order Number' : 'Email Address'}
              </label>
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === 'orderNumber' ? 'e.g., ORD-20241203-1234' : 'your@email.com'}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#2D5F3F] focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={!searchValue || loading}
            className="w-full bg-[#2D5F3F] text-white px-6 py-3 rounded-lg hover:bg-[#234830] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Single Order Result */}
        {order && renderOrderDetails(order)}

        {/* Multiple Orders Result (Email Search) */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Your Orders ({orders.length})</h2>
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#2D5F3F] transition-colors cursor-pointer"
                  onClick={() => setOrder(ord)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-lg">{ord.orderNumber}</p>
                      <p className="text-gray-600 text-sm">Placed on {formatDate(ord.date)}</p>
                      <p className="text-gray-700 mt-1">€{ord.total.toFixed(2)}</p>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getOrderStatusColor(ord.status)}`}>
                        {getOrderStatusLabel(ord.status)}
                      </span>
                    </div>
                  </div>
                  {ord.trackingNumber && (
                    <p className="text-sm text-gray-600 mt-2">
                      Tracking: <span className="font-mono">{ord.trackingNumber}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        {!order && orders.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
            <div className="space-y-3 text-gray-700">
              <p>• Your order number can be found in your order confirmation email</p>
              <p>• Make sure to enter the complete order number (e.g., ORD-20241203-1234)</p>
              <p>• Tracking information is typically available within 24-48 hours of shipment</p>
              <p>• For assistance, please <Link href="/contact" className="text-[#2D5F3F] hover:underline">contact our support team</Link></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
