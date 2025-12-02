'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

export default function AdminSetupPage() {
  const [email, setEmail] = useState('admin@reyahcollective.com');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSetAdmin = () => {
    try {
      // Get all users
      const usersData = localStorage.getItem('reyah_users');
      if (!usersData) {
        setMessage('No users found!');
        return;
      }

      const users = JSON.parse(usersData);
      
      // Find user by email
      const userIndex = users.findIndex((u: any) => u.email === email);
      
      if (userIndex === -1) {
        setMessage(`User with email "${email}" not found!`);
        return;
      }

      // Set isAdmin flag
      users[userIndex].isAdmin = true;
      
      // Save back to localStorage
      localStorage.setItem('reyah_users', JSON.stringify(users));
      
      // Also update current session if this user is logged in
      const currentUser = localStorage.getItem('reyah_user');
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        if (parsed.email === email) {
          parsed.isAdmin = true;
          localStorage.setItem('reyah_user', JSON.stringify(parsed));
        }
      }
      
      setMessage(`✅ Successfully set ${email} as admin! You can now access the admin dashboard.`);
      
      // Redirect to admin after 2 seconds
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
      
    } catch (error) {
      setMessage('Error setting admin status');
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
          <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2">Admin Setup</h1>
          <p className="text-sm text-gray-600">Grant admin access to a user account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
              User Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[var(--beige-300)] focus:border-[var(--accent)] focus:outline-none text-[var(--brown-800)]"
              placeholder="Enter email address"
            />
          </div>

          <button
            onClick={handleSetAdmin}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 hover:from-red-700 hover:to-red-600 transition-colors"
          >
            🔐 Grant Admin Access
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
              <strong>Instructions:</strong><br/>
              1. Make sure the user account exists (sign up first if needed)<br/>
              2. Enter the email address above<br/>
              3. Click "Grant Admin Access"<br/>
              4. The user can now access /admin dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
