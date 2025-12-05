export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type ShippingCarrier = 'REYAH' | 'DHL' | 'UPS' | 'FedEx' | 'USPS' | 'Other';

export interface StatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  location?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  carrier: ShippingCarrier;
  currentLocation?: string;
  estimatedDelivery: string;
  lastUpdate: string;
  events: StatusHistory[];
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    sellerId?: string;
    sellerName?: string;
  }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    county: string;
    postalCode: string;
  };
  payment: {
    method: string;
    status: 'pending' | 'completed' | 'failed';
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  sellerId?: string;
  sellerName?: string;
  trackingInfo?: TrackingInfo;
  statusHistory: StatusHistory[];
  notificationsSent?: {
    orderConfirmation?: string;
    shipped?: string;
    outForDelivery?: string;
    delivered?: string;
  };
}

export const saveOrder = (order: Order): void => {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem('reyah_orders', JSON.stringify(orders));
};

export const getOrders = (): Order[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('reyah_orders');
  return stored ? JSON.parse(stored) : [];
};

export const getOrderById = (orderId: string): Order | undefined => {
  const orders = getOrders();
  return orders.find(order => order.id === orderId);
};

export const getOrdersByEmail = (email: string): Order[] => {
  const orders = getOrders();
  return orders.filter(order => order.customer.email.toLowerCase() === email.toLowerCase());
};

export const updateOrderStatus = (
  orderId: string, 
  status: OrderStatus, 
  trackingNumber?: string,
  note?: string,
  location?: string
): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    // Add to status history
    const statusUpdate: StatusHistory = {
      status,
      timestamp: new Date().toISOString(),
      note,
      location
    };
    
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push(statusUpdate);
    
    // Update tracking info
    if (order.trackingInfo) {
      order.trackingInfo.lastUpdate = new Date().toISOString();
      order.trackingInfo.events.push(statusUpdate);
      if (location) {
        order.trackingInfo.currentLocation = location;
      }
    }
    
    localStorage.setItem('reyah_orders', JSON.stringify(orders));
    
    // Trigger notification
    sendOrderStatusNotification(order);
  }
};

export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${year}${month}${day}-${random}`;
};

export const generateTrackingNumber = (): string => {
  const prefix = 'REYAH';
  const random = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return `${prefix}${random}`;
};

export const sendOrderConfirmationEmail = async (order: Order): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        orderNumber: order.orderNumber,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
        items: order.items,
        total: order.total,
        trackingNumber: order.trackingNumber,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('Email API returned error (non-critical):', errorText);
      // Don't fail the order if email fails - just log it
      return false;
    }

    const result = await response.json();
    console.log('✅ Order confirmation email sent successfully to:', order.customer.email);
    return true;
  } catch (error) {
    console.warn('Failed to send order confirmation email (non-critical):', error);
    // Email failure shouldn't block order creation
    return false;
  }
};

export const updateTrackingInfo = (
  orderId: string, 
  trackingInfo: Partial<TrackingInfo>
): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    
    if (!order.trackingInfo) {
      order.trackingInfo = {
        trackingNumber: trackingInfo.trackingNumber || order.trackingNumber || '',
        carrier: trackingInfo.carrier || 'REYAH',
        estimatedDelivery: trackingInfo.estimatedDelivery || order.estimatedDelivery || '',
        lastUpdate: new Date().toISOString(),
        events: order.statusHistory || []
      };
    } else {
      order.trackingInfo = {
        ...order.trackingInfo,
        ...trackingInfo,
        lastUpdate: new Date().toISOString()
      };
    }
    
    // Update order-level fields for backwards compatibility
    if (trackingInfo.trackingNumber) {
      order.trackingNumber = trackingInfo.trackingNumber;
    }
    if (trackingInfo.estimatedDelivery) {
      order.estimatedDelivery = trackingInfo.estimatedDelivery;
    }
    
    localStorage.setItem('reyah_orders', JSON.stringify(orders));
  }
};

export const sendOrderStatusNotification = async (order: Order): Promise<void> => {
  // Log notification (in production, this would send actual email/SMS)
  const statusMessages: Record<OrderStatus, string> = {
    pending: 'Your order has been received and is pending confirmation.',
    processing: 'Your order is being processed.',
    shipped: `Your order has been shipped! Tracking number: ${order.trackingNumber || 'N/A'}`,
    out_for_delivery: 'Your order is out for delivery and will arrive soon!',
    delivered: 'Your order has been delivered. Thank you for shopping with us!',
    cancelled: 'Your order has been cancelled.'
  };
  
  const notification = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customer: `${order.customer.firstName} ${order.customer.lastName}`,
    email: order.customer.email,
    phone: order.customer.phone,
    status: order.status,
    message: statusMessages[order.status],
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    timestamp: new Date().toISOString()
  };
  
  // Store notification in localStorage for history
  const notifications = JSON.parse(localStorage.getItem('reyah_notifications') || '[]');
  notifications.push(notification);
  localStorage.setItem('reyah_notifications', JSON.stringify(notifications));
  
  // Update order with notification timestamp
  if (!order.notificationsSent) {
    order.notificationsSent = {};
  }
  
  const notificationKey = order.status === 'out_for_delivery' ? 'outForDelivery' : order.status;
  if (notificationKey in order.notificationsSent) {
    order.notificationsSent[notificationKey as keyof typeof order.notificationsSent] = new Date().toISOString();
  }
  
  console.log('📧 Notification sent:', notification);
  
  // In production, this would call an email/SMS API
  // await sendEmail(order.customer.email, notification.message);
  // await sendSMS(order.customer.phone, notification.message);
};

export const getNotificationHistory = (): Array<{
  orderId: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  status: OrderStatus;
  message: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  timestamp: string;
}> => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('reyah_notifications');
  return stored ? JSON.parse(stored) : [];
};

export const calculateEstimatedDelivery = (daysToAdd: number = 5): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split('T')[0];
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return labels[status];
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    out_for_delivery: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status];
};

