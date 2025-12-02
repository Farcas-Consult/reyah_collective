'use client';

import Link from 'next/link';

const products = [
  {
    id: 1,
    name: 'Artisan Ceramic Vase',
    price: 89.99,
    image: '/placeholder-product-1.jpg',
    category: 'Home Decor',
  },
  {
    id: 2,
    name: 'Handwoven Throw Blanket',
    price: 129.99,
    image: '/placeholder-product-2.jpg',
    category: 'Textiles',
  },
  {
    id: 3,
    name: 'Minimalist Wall Art',
    price: 149.99,
    image: '/placeholder-product-3.jpg',
    category: 'Art',
  },
  {
    id: 4,
    name: 'Organic Cotton Pillow Set',
    price: 79.99,
    image: '/placeholder-product-4.jpg',
    category: 'Bedding',
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--brown-800)] mb-4">Featured Products</h2>
          <p className="text-[var(--brown-700)] text-lg">Handpicked selections from our latest collection</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-square bg-[var(--beige-200)] rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--brown-700)] text-sm">
                    {product.name}
                  </div>
                  <div className="absolute inset-0 bg-[var(--brown-800)] opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[var(--accent)] uppercase tracking-wide">{product.category}</p>
                  <h3 className="font-semibold text-[var(--brown-800)] group-hover:text-[var(--accent)] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[var(--brown-700)] font-medium">${product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-[var(--brown-800)] text-[var(--beige-50)] rounded-md hover:bg-[var(--brown-700)] transition-colors font-medium"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
