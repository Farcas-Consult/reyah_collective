import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-[90vh] flex items-center justify-center bg-gradient-to-br from-[var(--beige-50)] to-[var(--beige-200)]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-[var(--brown-800)] mb-6 tracking-tight">
          Elevate Your Style
        </h1>
        <p className="text-xl md:text-2xl text-[var(--brown-700)] mb-8 max-w-2xl mx-auto">
          Discover our curated collection of timeless pieces crafted with care
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="px-8 py-4 bg-[var(--brown-800)] text-[var(--beige-50)] rounded-md hover:bg-[var(--brown-700)] transition-colors font-medium"
          >
            Shop Now
          </Link>
          <Link
            href="/collections"
            className="px-8 py-4 bg-transparent border-2 border-[var(--brown-800)] text-[var(--brown-800)] rounded-md hover:bg-[var(--brown-800)] hover:text-[var(--beige-50)] transition-colors font-medium"
          >
            View Collections
          </Link>
        </div>
      </div>
    </section>
  );
}
