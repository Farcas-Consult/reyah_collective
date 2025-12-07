'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductComparison from '@/components/ProductComparison';
import { loadComparisonFromUrl } from '@/utils/comparison';
import Link from 'next/link';

function CompareContent() {
  const searchParams = useSearchParams();
  const productsParam = searchParams.get('products');

  useEffect(() => {
    if (productsParam) {
      loadComparisonFromUrl(productsParam);
    }
  }, [productsParam]);

  return (
    <div className="bg-[var(--beige-100)]">
      <Header />
      <main className="pt-40 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--brown-800)] mb-2">
                  Product Comparison
                </h1>
                <p className="text-gray-600">
                  Compare products side by side to make the best decision
                </p>
              </div>
              <Link
                href="/shop"
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Comparison Component */}
          <ProductComparison />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--beige-100)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
