'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const success = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (success) {
      router.push('/account');
    } else {
      setError('Email already exists. Please login instead.');
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

        {/* Signup Card */}
        <div className="bg-white rounded-lg shadow-lg border border-[var(--beige-300)] p-8">
          <h1 className="text-2xl font-bold text-[var(--brown-800)] mb-2 text-center">Create Account</h1>
          <p className="text-[var(--brown-700)] text-center mb-6">Join Reyah Collective today</p>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                placeholder="+254 700 000 000"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                placeholder="Re-enter password"
              />
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" required className="w-4 h-4 mt-1 text-[var(--accent)]" />
              <label className="text-sm text-[var(--brown-700)]">
                I agree to the{' '}
                <Link href="/terms" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] text-white py-3 rounded-md font-bold text-lg hover:bg-[var(--brown-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[var(--brown-700)]">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-bold">
                Login
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
