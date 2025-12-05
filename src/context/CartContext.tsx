'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  saveCart as saveCartToStorage, 
  getSavedCarts, 
  deleteSavedCart,
  trackAbandonedCart,
  markCartAsRecovered,
  syncCartToServer,
  restoreCartFromServer,
  processAbandonedCarts,
} from '@/utils/cartStorage';
import { SavedCart } from '@/types/cart';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | any; // Can be string path or imported image object
  category: string;
  inStock: boolean;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  // New save/restore functions
  saveCurrentCart: (name?: string, notes?: string) => SavedCart;
  getSavedCartsList: () => SavedCart[];
  restoreSavedCart: (cartId: string) => void;
  deleteSaved: (cartId: string) => void;
  trackAbandonment: (userEmail?: string, userName?: string) => void;
  markRecovered: () => void;
  syncCart: (userId: string) => Promise<void>;
  restoreFromServer: (userId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [abandonmentTracked, setAbandonmentTracked] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('reyah_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('reyah_cart', JSON.stringify(cartItems));
    setLastActivity(Date.now());
    setAbandonmentTracked(false); // Reset when cart changes
  }, [cartItems]);

  // Track cart abandonment (check every 5 minutes)
  useEffect(() => {
    const checkAbandonment = () => {
      const now = Date.now();
      const minutesSinceActivity = (now - lastActivity) / (1000 * 60);
      
      // If cart has items and no activity for 30 minutes, track as abandoned
      if (cartItems.length > 0 && minutesSinceActivity >= 30 && !abandonmentTracked) {
        const userStr = localStorage.getItem('reyah_user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        trackAbandonedCart(
          cartItems,
          user?.id,
          user?.email,
          user ? `${user.firstName} ${user.lastName}` : undefined
        );
        
        setAbandonmentTracked(true);
      }
      
      // Process abandoned carts and schedule reminders
      processAbandonedCarts();
    };

    const interval = setInterval(checkAbandonment, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, [cartItems, lastActivity, abandonmentTracked]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Item already in cart, increase quantity
        return prevItems.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // New item, add with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Save current cart
  const saveCurrentCart = (name?: string, notes?: string): SavedCart => {
    const userStr = localStorage.getItem('reyah_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return saveCartToStorage(cartItems, user?.id, name, notes);
  };

  // Get list of saved carts
  const getSavedCartsList = (): SavedCart[] => {
    const userStr = localStorage.getItem('reyah_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return getSavedCarts(user?.id);
  };

  // Restore a saved cart
  const restoreSavedCart = (cartId: string): void => {
    const savedCarts = getSavedCarts();
    const cart = savedCarts.find(c => c.id === cartId);
    
    if (cart) {
      setCartItems(cart.items);
    }
  };

  // Delete a saved cart
  const deleteSaved = (cartId: string): void => {
    deleteSavedCart(cartId);
  };

  // Track cart abandonment manually
  const trackAbandonment = (userEmail?: string, userName?: string): void => {
    const userStr = localStorage.getItem('reyah_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    trackAbandonedCart(
      cartItems,
      user?.id,
      userEmail || user?.email,
      userName || (user ? `${user.firstName} ${user.lastName}` : undefined)
    );
  };

  // Mark cart as recovered
  const markRecovered = (): void => {
    const abandonedCarts = JSON.parse(localStorage.getItem('reyah_abandoned_carts') || '[]');
    const userStr = localStorage.getItem('reyah_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Find most recent abandoned cart for this user
    const userCart = abandonedCarts
      .filter((cart: any) => cart.userId === user?.id)
      .sort((a: any, b: any) => new Date(b.abandonedAt).getTime() - new Date(a.abandonedAt).getTime())[0];
    
    if (userCart) {
      markCartAsRecovered(userCart.id);
    }
  };

  // Sync cart to server for logged-in users
  const syncCart = async (userId: string): Promise<void> => {
    await syncCartToServer(userId, cartItems);
  };

  // Restore cart from server
  const restoreFromServer = async (userId: string): Promise<void> => {
    const items = await restoreCartFromServer(userId);
    if (items.length > 0) {
      setCartItems(items);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      cartCount,
      cartTotal,
      saveCurrentCart,
      getSavedCartsList,
      restoreSavedCart,
      deleteSaved,
      trackAbandonment,
      markRecovered,
      syncCart,
      restoreFromServer,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
