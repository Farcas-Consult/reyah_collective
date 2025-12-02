'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter submission
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-20 px-6 bg-[var(--beige-200)]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[var(--brown-800)] mb-4">Join Our Community</h2>
        <p className="text-[var(--brown-700)] text-lg mb-8">
          Subscribe to receive exclusive offers, style tips, and updates on new arrivals
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-6 py-3 rounded-md border-2 border-[var(--beige-300)] bg-white focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
            required
          />
          <button
            type="submit"
            className="px-8 py-3 bg-[var(--brown-800)] text-[var(--beige-50)] rounded-md hover:bg-[var(--brown-700)] transition-colors font-medium whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
