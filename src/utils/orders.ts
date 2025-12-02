export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
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

export const updateOrderStatus = (orderId: string, status: Order['status'], trackingNumber?: string): void => {
  const orders = getOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    if (trackingNumber) {
      orders[orderIndex].trackingNumber = trackingNumber;
    }
    localStorage.setItem('reyah_orders', JSON.stringify(orders));
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
      const error = await response.json();
      console.error('Email API Error:', error);
      return false;
    }

    const result = await response.json();
    console.log('✅ Order confirmation email sent successfully to:', order.customer.email);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
};
