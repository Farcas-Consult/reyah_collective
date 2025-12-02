'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function SellerSetupPage() {
  const [sellerName, setSellerName] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const handleSetupSeller = () => {
    if (!sellerName) {
      setMessage('Please enter your business/seller name');
      return;
    }

    try {
      // Get all users
      const usersData = localStorage.getItem('reyah_users');
      if (!usersData) {
        setMessage('User not found. Please log in first.');
        return;
      }

      const users = JSON.parse(usersData);
      
      // Find current user
      const userIndex = users.findIndex((u: any) => u.email === user?.email);
      
      if (userIndex === -1) {
        setMessage('User not found!');
        return;
      }

      // Set seller info with pending status
      users[userIndex].isSeller = true;
      users[userIndex].sellerName = sellerName;
      users[userIndex].businessDescription = businessDescription;
      users[userIndex].sellerApproved = false;
      users[userIndex].sellerStatus = 'pending';
      users[userIndex].sellerRequestDate = new Date().toISOString();
      
      // Save back to localStorage
      localStorage.setItem('reyah_users', JSON.stringify(users));
      
      // Update current session
      const currentUser = localStorage.getItem('reyah_user');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.isSeller = true;
        parsed.sellerName = sellerName;
        parsed.businessDescription = businessDescription;
        parsed.sellerApproved = false;
        parsed.sellerStatus = 'pending';
        parsed.sellerRequestDate = new Date().toISOString();
        localStorage.setItem('reyah_user', JSON.stringify(parsed));
      }
      
      setMessage(`✅ Seller request submitted! Awaiting admin approval...`);
      
      // Redirect to seller pending page
      setTimeout(() => {
        router.push('/seller-pending');
      }, 2000);
      
    } catch (error) {
      setMessage('Error setting up seller account');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border-2 border-[var(--accent)] p-8 max-w-md w-full">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="text-center mb-6">
          <div className="text-3xl font-bold mb-2">
            <span className="text-[var(--brown-800)]">REYAH</span>
            <span className="text-[var(--accent)] text-4xl">⭐</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2">Become a Seller</h1>
          <p className="text-sm text-gray-600">Set up your seller account and start selling</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
              Business/Seller Name *
            </label>
            <input
              type="text"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[var(--beige-300)] focus:border-[var(--accent)] focus:outline-none text-[var(--brown-800)]"
              placeholder="e.g., Artisan Metals Kenya"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
              Business Description
            </label>
            <textarea
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[var(--beige-300)] focus:border-[var(--accent)] focus:outline-none text-[var(--brown-800)]"
              rows={3}
              placeholder="Brief description of your business..."
            />
          </div>

          <button
            onClick={handleSetupSeller}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-3 hover:from-green-700 hover:to-green-600 transition-colors"
          >
            🏪 Become a Seller
          </button>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : 'bg-red-100 border border-red-300 text-red-800'
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-[var(--beige-50)] border border-[var(--beige-300)] rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Seller Benefits:</strong><br/>
              • List and sell your products<br/>
              • Manage your inventory<br/>
              • Track your sales and earnings<br/>
              • Access analytics and insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
