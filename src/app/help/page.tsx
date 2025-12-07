'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const helpCategories = [
    {
      title: 'Orders & Delivery',
      icon: '📦',
      topics: [
        { name: 'Track My Order', link: '/account/orders' },
        { name: 'Delivery Information', link: '#delivery' },
        { name: 'Change or Cancel Order', link: '#change-order' },
        { name: 'Return & Refund Policy', link: '#returns' },
      ]
    },
    {
      title: 'Payment',
      icon: '💳',
      topics: [
        { name: 'Payment Methods', link: '#payment-methods' },
        { name: 'M-Pesa Payments', link: '#mpesa' },
        { name: 'Cash on Delivery', link: '#cod' },
        { name: 'Payment Issues', link: '#payment-issues' },
      ]
    },
    {
      title: 'Account & Shopping',
      icon: '👤',
      topics: [
        { name: 'Create an Account', link: '#create-account' },
        { name: 'My Shopping Cart', link: '/cart' },
        { name: 'How to Place an Order', link: '#place-order' },
        { name: 'Account Settings', link: '#settings' },
      ]
    },
    {
      title: 'Products',
      icon: '🛍️',
      topics: [
        { name: 'Product Information', link: '#product-info' },
        { name: 'Artisan & Sellers', link: '#sellers' },
        { name: 'Product Quality', link: '#quality' },
        { name: 'Browse Categories', link: '/shop' },
      ]
    },
  ];

  const faqs = [
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-5 business days within Kenya. Orders placed before 2 PM are processed the same day. You will receive a tracking number via email once your order ships.',
      id: 'delivery'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept M-Pesa, Visa/Mastercard, and Cash on Delivery (COD). All online payments are secure and encrypted.',
      id: 'payment-methods'
    },
    {
      question: 'Can I return a product?',
      answer: 'Yes! You can return products within 7 days of delivery if they are unused and in original packaging. Contact our support team to initiate a return.',
      id: 'returns'
    },
    {
      question: 'How do I track my order?',
      answer: 'After placing your order, you will receive a confirmation email with your order number and tracking number. You can track your order status in the "My Orders" section of your account.',
      id: 'track-order'
    },
    {
      question: 'What if I receive a damaged product?',
      answer: 'We inspect all items before shipping, but if you receive a damaged product, please contact us within 24 hours with photos. We will arrange a replacement or full refund immediately.',
      id: 'quality'
    },
    {
      question: 'Do you ship outside Kenya?',
      answer: 'Currently, we only ship within Kenya. We are working on expanding our delivery to East Africa soon. Stay tuned!',
      id: 'shipping'
    },
  ];

  const allSearchableContent = [
    ...helpCategories.flatMap(cat => cat.topics.map(t => t.name)),
    ...faqs.map(faq => faq.question),
    'M-Pesa', 'payment', 'delivery', 'tracking', 'return', 'refund', 'order', 'account', 'cart', 'checkout',
    'artisan', 'seller', 'product', 'quality', 'shipping', 'cash on delivery', 'COD'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const results = allSearchableContent.filter(item => 
      item.toLowerCase().includes(query)
    );
    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--brown-800)] mb-4">
              How Can We Help You?
            </h1>
            <p className="text-lg text-[var(--brown-700)] max-w-2xl mx-auto">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
                className="w-full px-6 py-4 rounded-lg border-2 border-[var(--beige-300)] focus:border-[var(--accent)] focus:outline-none text-[var(--brown-800)]"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--accent)] text-white px-6 py-2 rounded-md hover:bg-[var(--brown-600)] transition-colors"
              >
                Search
              </button>
            </form>

            {/* Search Results */}
            {searchQuery && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-4">
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-[var(--brown-800)] mb-2">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}:
                    </p>
                    <ul className="space-y-2">
                      {searchResults.map((result, idx) => (
                        <li key={idx} className="text-[var(--accent)] hover:text-[var(--brown-600)] cursor-pointer">
                          • {result}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">No results found for "{searchQuery}". Try different keywords.</p>
                )}
              </div>
            )}
          </div>

          {/* Help Categories */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-lg font-bold text-[var(--brown-800)] mb-4">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIdx) => (
                      <li key={topicIdx}>
                        <Link
                          href={topic.link}
                          className="text-[var(--accent)] hover:text-[var(--brown-600)] text-sm hover:underline"
                        >
                          {topic.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  id={faq.id}
                  className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 hover:shadow-md transition-shadow group"
                >
                  <summary className="font-semibold text-[var(--brown-800)] cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <svg
                      className="w-5 h-5 text-[var(--accent)] group-open:rotate-180 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="mt-4 text-[var(--brown-700)] leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--brown-600)] rounded-lg shadow-lg p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our customer support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@reyahcollective.com"
                className="bg-white text-[var(--accent)] px-8 py-3 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors inline-flex items-center justify-center gap-2"
                onClick={() => {
                  console.log('Opening email client for support@reyahcollective.com');
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
              <a
                href="tel:+254700000000"
                className="bg-white text-[var(--accent)] px-8 py-3 rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors inline-flex items-center justify-center gap-2"
                onClick={(e) => {
                  // Check if device supports calling
                  if (typeof window !== 'undefined' && !('ontouchstart' in window)) {
                    e.preventDefault();
                    alert('Call us at: +254 700 000 000');
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Us
              </a>
              <a
                href="https://wa.me/254700000000?text=Hi%2C%20I%20need%20help%20with%20my%20order%20from%20Reyah%20Collective"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#20BA5A] transition-colors inline-flex items-center justify-center gap-2"
                onClick={() => {
                  console.log('Opening WhatsApp chat');
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
