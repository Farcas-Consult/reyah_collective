import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const collections = [
  {
    id: 1,
    name: 'Modern Minimalism',
    description: 'Clean lines and understated elegance for contemporary spaces',
    itemCount: 24,
  },
  {
    id: 2,
    name: 'Artisan Heritage',
    description: 'Handcrafted pieces celebrating traditional techniques',
    itemCount: 18,
  },
  {
    id: 3,
    name: 'Coastal Calm',
    description: 'Serene designs inspired by seaside living',
    itemCount: 32,
  },
  {
    id: 4,
    name: 'Botanical Beauty',
    description: 'Nature-inspired pieces bringing the outdoors in',
    itemCount: 27,
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-[var(--brown-800)] mb-4">Our Collections</h1>
            <p className="text-[var(--brown-700)] text-lg">Curated selections for every style and season</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <div className="group bg-[var(--beige-50)] rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-[var(--beige-200)] to-[var(--beige-300)] flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[var(--brown-800)] opacity-0 group-hover:opacity-10 transition-opacity" />
                    <h3 className="text-2xl font-bold text-[var(--brown-800)] z-10">{collection.name}</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-[var(--brown-700)] mb-4">{collection.description}</p>
                    <p className="text-sm text-[var(--accent)] font-medium">
                      {collection.itemCount} items in collection
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
