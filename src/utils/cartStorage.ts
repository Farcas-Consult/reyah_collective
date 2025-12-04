import { SavedCart, AbandonedCart, CartReminder, CartAnalytics, CartItem, ReminderSchedule } from '@/types/cart';

// Generate unique IDs
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get session ID (or create if doesn't exist)
export const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('reyah_session_id');
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem('reyah_session_id', sessionId);
  }
  return sessionId;
};

// Get device info
export const getDeviceInfo = () => {
  if (typeof window === 'undefined') return { browser: 'Unknown', platform: 'Unknown' };
  
  return {
    browser: navigator.userAgent,
    platform: navigator.platform,
  };
};

// Calculate cart total
export const calculateCartTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Save cart to localStorage
export const saveCart = (
  items: CartItem[],
  userId?: string,
  name?: string,
  notes?: string
): SavedCart => {
  const savedCart: SavedCart = {
    id: generateId(),
    userId,
    sessionId: getSessionId(),
    items,
    total: calculateCartTotal(items),
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    savedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    name,
    notes,
    deviceInfo: getDeviceInfo(),
  };

  const savedCarts = getSavedCarts(userId);
  savedCarts.push(savedCart);
  localStorage.setItem('reyah_saved_carts', JSON.stringify(savedCarts));

  return savedCart;
};

// Get all saved carts
export const getSavedCarts = (userId?: string): SavedCart[] => {
  if (typeof window === 'undefined') return [];
  
  const savedCarts = JSON.parse(localStorage.getItem('reyah_saved_carts') || '[]');
  const now = new Date().toISOString();
  
  // Filter out expired carts and optionally filter by user
  return savedCarts.filter((cart: SavedCart) => {
    const notExpired = cart.expiresAt > now;
    const matchesUser = !userId || cart.userId === userId;
    return notExpired && matchesUser;
  });
};

// Get specific saved cart
export const getSavedCart = (cartId: string): SavedCart | null => {
  const savedCarts = getSavedCarts();
  return savedCarts.find(cart => cart.id === cartId) || null;
};

// Delete saved cart
export const deleteSavedCart = (cartId: string): void => {
  const savedCarts = getSavedCarts();
  const filtered = savedCarts.filter(cart => cart.id !== cartId);
  localStorage.setItem('reyah_saved_carts', JSON.stringify(filtered));
};

// Track cart abandonment
export const trackAbandonedCart = (
  items: CartItem[],
  userId?: string,
  userEmail?: string,
  userName?: string
): AbandonedCart => {
  if (items.length === 0) return null as any;

  const abandonedCart: AbandonedCart = {
    id: generateId(),
    userId,
    userEmail,
    userName,
    sessionId: getSessionId(),
    items,
    total: calculateCartTotal(items),
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    abandonedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    remindersSent: 0,
    recovered: false,
    deviceInfo: getDeviceInfo(),
    checkoutUrl: `${window.location.origin}/checkout`,
  };

  const abandonedCarts = getAbandonedCarts();
  
  // Check if cart already exists for this session
  const existingIndex = abandonedCarts.findIndex(cart => cart.sessionId === abandonedCart.sessionId);
  
  if (existingIndex >= 0) {
    // Update existing cart
    abandonedCarts[existingIndex] = {
      ...abandonedCarts[existingIndex],
      items: abandonedCart.items,
      total: abandonedCart.total,
      itemCount: abandonedCart.itemCount,
      lastUpdated: abandonedCart.lastUpdated,
    };
  } else {
    // Add new cart
    abandonedCarts.push(abandonedCart);
  }
  
  localStorage.setItem('reyah_abandoned_carts', JSON.stringify(abandonedCarts));
  return abandonedCart;
};

// Get all abandoned carts
export const getAbandonedCarts = (): AbandonedCart[] => {
  if (typeof window === 'undefined') return [];
  
  const abandonedCarts = JSON.parse(localStorage.getItem('reyah_abandoned_carts') || '[]');
  return abandonedCarts.filter((cart: AbandonedCart) => !cart.recovered);
};

// Mark cart as recovered
export const markCartAsRecovered = (cartId: string): void => {
  const abandonedCarts = JSON.parse(localStorage.getItem('reyah_abandoned_carts') || '[]');
  const updated = abandonedCarts.map((cart: AbandonedCart) => {
    if (cart.id === cartId) {
      return {
        ...cart,
        recovered: true,
        recoveredAt: new Date().toISOString(),
      };
    }
    return cart;
  });
  localStorage.setItem('reyah_abandoned_carts', JSON.stringify(updated));
};

// Schedule reminder
export const scheduleReminder = (
  cartId: string,
  userEmail: string,
  userName?: string,
  reminderType: 'auto' | 'manual' = 'auto',
  delayHours: number = 1
): CartReminder => {
  const reminder: CartReminder = {
    id: generateId(),
    cartId,
    userEmail,
    userName,
    reminderType,
    scheduledFor: new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    message: generateReminderMessage(userName),
    deliveryMethod: 'email',
  };

  const reminders = getReminders();
  reminders.push(reminder);
  localStorage.setItem('reyah_cart_reminders', JSON.stringify(reminders));

  return reminder;
};

// Generate reminder message
const generateReminderMessage = (userName?: string): string => {
  const name = userName || 'Valued Customer';
  return `Hi ${name}, you left items in your cart! Complete your purchase now and get free shipping on orders over KSH 5000.`;
};

// Get all reminders
export const getReminders = (): CartReminder[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('reyah_cart_reminders') || '[]');
};

// Get pending reminders
export const getPendingReminders = (): CartReminder[] => {
  const reminders = getReminders();
  const now = new Date().toISOString();
  
  return reminders.filter(reminder => 
    reminder.status === 'pending' && reminder.scheduledFor <= now
  );
};

// Mark reminder as sent
export const markReminderAsSent = (reminderId: string): void => {
  const reminders = getReminders();
  const updated = reminders.map(reminder => {
    if (reminder.id === reminderId) {
      return {
        ...reminder,
        status: 'sent' as const,
        sentAt: new Date().toISOString(),
      };
    }
    return reminder;
  });
  localStorage.setItem('reyah_cart_reminders', JSON.stringify(updated));

  // Update abandoned cart reminder count
  const reminder = reminders.find(r => r.id === reminderId);
  if (reminder) {
    incrementReminderCount(reminder.cartId);
  }
};

// Increment reminder count for cart
const incrementReminderCount = (cartId: string): void => {
  const abandonedCarts = JSON.parse(localStorage.getItem('reyah_abandoned_carts') || '[]');
  const updated = abandonedCarts.map((cart: AbandonedCart) => {
    if (cart.id === cartId) {
      return {
        ...cart,
        remindersSent: cart.remindersSent + 1,
        lastReminderSent: new Date().toISOString(),
      };
    }
    return cart;
  });
  localStorage.setItem('reyah_abandoned_carts', JSON.stringify(updated));
};

// Default reminder schedule
export const DEFAULT_REMINDER_SCHEDULE: ReminderSchedule = {
  firstReminderDelay: 1, // 1 hour
  secondReminderDelay: 24, // 24 hours after first
  thirdReminderDelay: 72, // 72 hours after second
  maxReminders: 3,
  minCartValue: 500, // KSH 500
};

// Process abandoned carts and schedule reminders
export const processAbandonedCarts = (schedule: ReminderSchedule = DEFAULT_REMINDER_SCHEDULE): void => {
  const abandonedCarts = getAbandonedCarts();
  const now = Date.now();

  abandonedCarts.forEach(cart => {
    if (!cart.userEmail || cart.total < schedule.minCartValue) return;
    if (cart.remindersSent >= schedule.maxReminders) return;

    const abandonedTime = new Date(cart.abandonedAt).getTime();
    const hoursSinceAbandoned = (now - abandonedTime) / (1000 * 60 * 60);

    // Schedule first reminder
    if (cart.remindersSent === 0 && hoursSinceAbandoned >= schedule.firstReminderDelay) {
      scheduleReminder(cart.id, cart.userEmail, cart.userName, 'auto', 0);
    }
    // Schedule second reminder
    else if (cart.remindersSent === 1 && cart.lastReminderSent) {
      const lastReminderTime = new Date(cart.lastReminderSent).getTime();
      const hoursSinceLastReminder = (now - lastReminderTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastReminder >= schedule.secondReminderDelay) {
        scheduleReminder(cart.id, cart.userEmail, cart.userName, 'auto', 0);
      }
    }
    // Schedule third reminder
    else if (cart.remindersSent === 2 && cart.lastReminderSent) {
      const lastReminderTime = new Date(cart.lastReminderSent).getTime();
      const hoursSinceLastReminder = (now - lastReminderTime) / (1000 * 60 * 60);
      
      if (hoursSinceLastReminder >= schedule.thirdReminderDelay) {
        scheduleReminder(cart.id, cart.userEmail, cart.userName, 'auto', 0);
      }
    }
  });
};

// Calculate cart analytics
export const calculateCartAnalytics = (): CartAnalytics => {
  const allAbandonedCarts = JSON.parse(localStorage.getItem('reyah_abandoned_carts') || '[]');
  const reminders = getReminders();

  const totalAbandoned = allAbandonedCarts.length;
  const recoveredCarts = allAbandonedCarts.filter((cart: AbandonedCart) => cart.recovered);
  const totalRecovered = recoveredCarts.length;
  const recoveryRate = totalAbandoned > 0 ? (totalRecovered / totalAbandoned) * 100 : 0;

  const totalAbandonedValue = allAbandonedCarts.reduce(
    (sum: number, cart: AbandonedCart) => sum + cart.total,
    0
  );
  const averageAbandonedValue = totalAbandoned > 0 ? totalAbandonedValue / totalAbandoned : 0;

  const totalRecoveredValue = recoveredCarts.reduce(
    (sum: number, cart: AbandonedCart) => sum + cart.total,
    0
  );

  const sentReminders = reminders.filter(r => r.status === 'sent');
  const openedReminders = reminders.filter(r => r.openedAt);
  const clickedReminders = reminders.filter(r => r.clickedAt);

  const reminderConversionRate = sentReminders.length > 0
    ? (clickedReminders.length / sentReminders.length) * 100
    : 0;

  // Group by hour and day
  const abandonmentByHour: { [hour: string]: number } = {};
  const abandonmentByDay: { [day: string]: number } = {};

  allAbandonedCarts.forEach((cart: AbandonedCart) => {
    const date = new Date(cart.abandonedAt);
    const hour = date.getHours().toString();
    const day = date.toLocaleDateString();

    abandonmentByHour[hour] = (abandonmentByHour[hour] || 0) + 1;
    abandonmentByDay[day] = (abandonmentByDay[day] || 0) + 1;
  });

  // Top abandoned products
  const productCounts: { [key: string]: { name: string; count: number; value: number } } = {};
  
  allAbandonedCarts.forEach((cart: AbandonedCart) => {
    cart.items.forEach(item => {
      const key = item.id.toString();
      if (!productCounts[key]) {
        productCounts[key] = { name: item.name, count: 0, value: 0 };
      }
      productCounts[key].count += item.quantity;
      productCounts[key].value += item.price * item.quantity;
    });
  });

  const topAbandonedProducts = Object.entries(productCounts)
    .map(([id, data]) => ({
      productId: parseInt(id),
      productName: data.name,
      abandonedCount: data.count,
      totalValue: data.value,
    }))
    .sort((a, b) => b.abandonedCount - a.abandonedCount)
    .slice(0, 10);

  // Time to abandon
  const timeToAbandon = {
    lessThan5min: 0,
    fiveTo30min: 0,
    thirtyMinTo1hr: 0,
    oneToTwentyFourHr: 0,
    moreThan24hr: 0,
  };

  allAbandonedCarts.forEach((cart: AbandonedCart) => {
    const abandonedTime = new Date(cart.abandonedAt).getTime();
    const createdTime = abandonedTime; // In real scenario, track cart creation time
    const minutesDiff = (abandonedTime - createdTime) / (1000 * 60);

    if (minutesDiff < 5) timeToAbandon.lessThan5min++;
    else if (minutesDiff < 30) timeToAbandon.fiveTo30min++;
    else if (minutesDiff < 60) timeToAbandon.thirtyMinTo1hr++;
    else if (minutesDiff < 1440) timeToAbandon.oneToTwentyFourHr++;
    else timeToAbandon.moreThan24hr++;
  });

  return {
    totalAbandoned,
    totalRecovered,
    recoveryRate,
    averageCartValue: averageAbandonedValue,
    averageAbandonedValue,
    totalLostRevenue: totalAbandonedValue - totalRecoveredValue,
    totalRecoveredRevenue: totalRecoveredValue,
    remindersSent: sentReminders.length,
    remindersOpened: openedReminders.length,
    remindersClicked: clickedReminders.length,
    reminderConversionRate,
    abandonmentByHour,
    abandonmentByDay,
    topAbandonedProducts,
    timeToAbandon,
  };
};

// Sync cart across devices (for logged-in users)
export const syncCartToServer = async (userId: string, items: CartItem[]): Promise<void> => {
  // In a real app, this would sync to backend
  // For now, we'll use localStorage with user ID as key
  const userCarts = JSON.parse(localStorage.getItem(`reyah_user_cart_${userId}`) || 'null');
  
  const cartData = {
    userId,
    items,
    lastSynced: new Date().toISOString(),
    deviceInfo: getDeviceInfo(),
  };
  
  localStorage.setItem(`reyah_user_cart_${userId}`, JSON.stringify(cartData));
};

// Restore cart from server
export const restoreCartFromServer = async (userId: string): Promise<CartItem[]> => {
  // In a real app, this would fetch from backend
  const userCart = JSON.parse(localStorage.getItem(`reyah_user_cart_${userId}`) || 'null');
  
  if (userCart && userCart.items) {
    return userCart.items;
  }
  
  return [];
};
