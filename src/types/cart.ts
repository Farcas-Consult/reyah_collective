// Cart persistence and abandonment types

export interface SavedCart {
  id: string;
  userId?: string;
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  savedAt: string;
  expiresAt: string;
  name?: string;
  notes?: string;
  deviceInfo?: {
    browser: string;
    platform: string;
  };
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  inStock: boolean;
  sellerId?: string;
  sellerName?: string;
}

export interface AbandonedCart {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  abandonedAt: string;
  lastUpdated: string;
  remindersSent: number;
  lastReminderSent?: string;
  recovered: boolean;
  recoveredAt?: string;
  deviceInfo?: {
    browser: string;
    platform: string;
  };
  checkoutUrl: string;
}

export interface CartReminder {
  id: string;
  cartId: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  reminderType: 'auto' | 'manual';
  scheduledFor: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  message: string;
  deliveryMethod: 'email' | 'sms' | 'both';
  openedAt?: string;
  clickedAt?: string;
}

export interface CartAnalytics {
  totalAbandoned: number;
  totalRecovered: number;
  recoveryRate: number;
  averageCartValue: number;
  averageAbandonedValue: number;
  totalLostRevenue: number;
  totalRecoveredRevenue: number;
  remindersSent: number;
  remindersOpened: number;
  remindersClicked: number;
  reminderConversionRate: number;
  abandonmentByHour: { [hour: string]: number };
  abandonmentByDay: { [day: string]: number };
  topAbandonedProducts: {
    productId: number;
    productName: string;
    abandonedCount: number;
    totalValue: number;
  }[];
  timeToAbandon: {
    lessThan5min: number;
    fiveTo30min: number;
    thirtyMinTo1hr: number;
    oneToTwentyFourHr: number;
    moreThan24hr: number;
  };
}

export interface CartSavePreferences {
  autoSave: boolean;
  saveInterval: number; // minutes
  notifyOnSave: boolean;
  syncAcrossDevices: boolean;
}

export interface ReminderSchedule {
  firstReminderDelay: number; // hours after abandonment
  secondReminderDelay: number; // hours after first reminder
  thirdReminderDelay: number; // hours after second reminder
  maxReminders: number;
  minCartValue: number; // minimum cart value to send reminder
}
