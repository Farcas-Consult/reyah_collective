import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-[var(--brown-800)] mb-8">About Reyah Collective</h1>
          
          <div className="space-y-8 text-[var(--brown-700)] text-lg leading-relaxed">
            <p>
              Welcome to Reyah Collective, where timeless design meets conscious living. 
              We curate exceptional pieces that transform houses into homes and moments into memories.
            </p>
            
            <div className="bg-[var(--beige-50)] p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-4">Our Story</h2>
              <p>
                Founded in 2024, Reyah Collective was born from a passion for artisanal craftsmanship 
                and sustainable design. We believe that every object in your space should tell a story 
                and bring joy to your daily life.
              </p>
            </div>
            
            <div className="bg-[var(--beige-50)] p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-[var(--brown-800)] mb-4">Our Values</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span><strong>Quality:</strong> We partner with skilled artisans who take pride in their craft</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span><strong>Sustainability:</strong> Eco-friendly materials and ethical production practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span><strong>Timelessness:</strong> Pieces designed to last generations, not seasons</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span><strong>Community:</strong> Supporting local makers and building lasting relationships</span>
                </li>
              </ul>
            </div>
            
            <p>
              Each product in our collection is carefully selected for its beauty, functionality, 
              and the story behind its creation. We invite you to explore our curated selection 
              and discover pieces that resonate with your personal style.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
