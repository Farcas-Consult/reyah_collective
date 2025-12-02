import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--beige-200)] border-t border-[var(--beige-300)] mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-[var(--brown-800)] mb-4">REYAH COLLECTIVE</h3>
            <p className="text-[var(--brown-700)] text-sm">
              Curated collections for the discerning lifestyle.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--brown-800)] mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop/new" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/shop/best-sellers" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/shop/sale" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Sale
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--brown-800)] mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shipping" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[var(--brown-800)] mb-4">Connect</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-[var(--brown-700)] hover:text-[var(--accent)] text-sm transition-colors">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--beige-300)] mt-8 pt-8 text-center">
          <p className="text-[var(--brown-700)] text-sm">
            © {new Date().getFullYear()} Reyah Collective. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
