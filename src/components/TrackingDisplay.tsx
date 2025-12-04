'use client';

import { useState, useEffect } from 'react';
import type { ShipmentTracking, ShipmentStatus } from '@/types/shipping';

interface TrackingDisplayProps {
  trackingNumber: string;
  showFullDetails?: boolean;
}

export default function TrackingDisplay({ trackingNumber, showFullDetails = true }: TrackingDisplayProps) {
  const [tracking, setTracking] = useState<ShipmentTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracking();
  }, [trackingNumber]);

  const loadTracking = async () => {
    setLoading(true);
    try {
      const { getShipmentTracking } = await import('@/utils/shippingUtils');
      const data = getShipmentTracking(trackingNumber);
      setTracking(data);
    } catch (error) {
      console.error('Error loading tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ShipmentStatus) => {
    const colors: Record<ShipmentStatus, string> = {
      pending: 'gray',
      processing: 'blue',
      shipped: 'indigo',
      in_transit: 'purple',
      out_for_delivery: 'orange',
      delivered: 'green',
      failed: 'red',
      returned: 'yellow',
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status: ShipmentStatus) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shipped':
      case 'in_transit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'out_for_delivery':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'failed':
      case 'returned':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusLabel = (status: ShipmentStatus) => {
    const labels: Record<ShipmentStatus, string> = {
      pending: 'Order Received',
      processing: 'Processing',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      failed: 'Delivery Failed',
      returned: 'Returned',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
          <span className="ml-3 text-gray-600">Loading tracking information...</span>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Tracking Not Found</h3>
          <p className="text-gray-600">No tracking information available for this number.</p>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(tracking.status);
  const latestEvent = tracking.events[tracking.events.length - 1];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`bg-${statusColor}-50 border-b border-${statusColor}-200 p-6`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {getStatusLabel(tracking.status)}
            </h3>
            <p className="text-gray-600">Tracking Number: <span className="font-mono font-semibold">{tracking.trackingNumber}</span></p>
          </div>
          <div className={`p-3 rounded-full bg-${statusColor}-100 text-${statusColor}-700`}>
            {getStatusIcon(tracking.status)}
          </div>
        </div>

        {/* Current Status */}
        {latestEvent && (
          <div className="bg-white rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className={`mt-1 p-2 rounded-full bg-${statusColor}-100 text-${statusColor}-700`}>
                {getStatusIcon(tracking.status)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{latestEvent.description}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {latestEvent.location} • {new Date(latestEvent.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Delivery */}
        {tracking.estimatedDelivery && tracking.status !== 'delivered' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              Estimated delivery: <strong>{new Date(tracking.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong>
            </span>
          </div>
        )}
      </div>

      {showFullDetails && (
        <>
          {/* Recipient Info */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Delivery Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-700">{tracking.recipientName}</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-700">{tracking.recipientAddress}</span>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Tracking History</h4>
            <div className="space-y-4">
              {tracking.events.slice().reverse().map((event, index) => {
                const eventColor = getStatusColor(event.status);
                const isLatest = index === 0;
                
                return (
                  <div key={index} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${isLatest ? `bg-${eventColor}-600` : `bg-${eventColor}-300`} flex-shrink-0`} />
                      {index < tracking.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 flex-1 mt-1" />
                      )}
                    </div>

                    {/* Event Details */}
                    <div className={`flex-1 pb-4 ${isLatest ? '' : 'opacity-70'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-semibold ${isLatest ? 'text-gray-900' : 'text-gray-700'}`}>
                            {event.description}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {event.location}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 text-right whitespace-nowrap">
                          <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                          <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
