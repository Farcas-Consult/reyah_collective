'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getProductImageSrc } from '@/data/products';

const products = [
  {
    id: 7,
    name: 'Hand-Painted Ceramic Vase',
    price: 7314,
    image: getProductImageSrc('Hand-Painted Ceramic Vase'),
    category: 'Home Decor',
  },
  {
    id: 9,
    name: 'Handwoven Throw Pillow',
    price: 4387,
    image: getProductImageSrc('Handwoven Throw Pillow'),
    category: 'Textiles',
  },
  {
    id: 10,
    name: 'Wooden Wall Art Panel',
    price: 8500,
    image: getProductImageSrc('Wooden Wall Art Panel'),
    category: 'Art',
  },
  {
    id: 6,
    name: 'Custom Macrame Wall Hanging',
    price: 10639,
    image: getProductImageSrc(5),
    category: 'Home Decor',
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
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
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
