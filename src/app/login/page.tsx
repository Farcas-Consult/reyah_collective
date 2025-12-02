'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const success = await login(email, password);

    if (success) {
      router.push('/account');
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="mb-4">
          <BackButton />
        </div>
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <div className="text-4xl font-bold">
            <span className="text-[var(--brown-800)]">REYAH</span>
            <span className="text-[var(--accent)] text-5xl">⭐</span>
          </div>
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg border border-[var(--beige-300)] p-8">
          <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2 text-center">Welcome Back</h1>
          <p className="text-[var(--brown-700)] text-center mb-6">Login to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[var(--brown-700)] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-[var(--accent)]" />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] text-white py-3 rounded-md font-bold text-lg hover:bg-[var(--brown-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--brown-700)]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-bold">
                Sign Up
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--beige-300)]">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
