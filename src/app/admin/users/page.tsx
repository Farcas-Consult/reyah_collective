'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    const allUsers = JSON.parse(localStorage.getItem('reyah_users') || '[]');
    // Filter out admin users from the customers list
    const customerUsers = allUsers.filter((u: any) => !u.isAdmin);
    setUsers(customerUsers);
  }, [isAuthenticated, user, router]);

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      {/* Admin Header */}
      <header className="bg-white shadow-md border-b border-[var(--beige-300)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-2xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl">⭐</span>
              </Link>
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">ADMIN</span>
            </div>
            <Link href="/admin" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--brown-800)]">Manage Users</h1>
          <div className="text-sm text-gray-600">
            Total Users: <span className="font-bold">{users.length}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)]">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--beige-300)] bg-[var(--beige-50)]">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">User ID</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Name</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Email</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Phone</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)]">
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-600">#{u.id}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--brown-600)] flex items-center justify-center text-white font-bold">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <span className="font-semibold text-[var(--brown-800)]">
                            {u.firstName} {u.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {u.email}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {u.phone}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
