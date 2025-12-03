'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
  isSeller?: boolean;
  sellerName?: string;
  businessDescription?: string;
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  sellerRequestDate?: string;
  sellerApproved?: boolean;
  sellerRating?: number;
  sellerReviewCount?: number;
  sellerTotalSales?: number;
  isSupplier?: boolean;
  companyName?: string;
  supplierType?: string;
  supplierStatus?: 'pending' | 'approved' | 'rejected';
  supplierRating?: number;
  supplierReviewCount?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('reyah_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get all users from localStorage
      const usersData = localStorage.getItem('reyah_users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user with matching email and password
      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('reyah_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = localStorage.getItem('reyah_users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if email already exists
      if (users.some((u: any) => u.email === userData.email)) {
        return false;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        ...userData,
      };

      // Save to users array
      users.push(newUser);
      localStorage.setItem('reyah_users', JSON.stringify(users));

      // Auto-login after signup
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('reyah_user', JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('reyah_user');
  };

  const refreshUser = () => {
    const storedUser = localStorage.getItem('reyah_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
