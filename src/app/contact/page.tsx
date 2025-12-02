'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    // Handle form submission
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      <Header />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-[var(--brown-800)] mb-8">Get in Touch</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--brown-800)] mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-[var(--brown-800)] mb-2">Email</h3>
                  <p className="text-[var(--brown-700)]">hello@reyahcollective.com</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-[var(--brown-800)] mb-2">Phone</h3>
                  <p className="text-[var(--brown-700)]">+1 (555) 123-4567</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-[var(--brown-800)] mb-2">Hours</h3>
                  <p className="text-[var(--brown-700)]">Monday - Friday: 9am - 6pm</p>
                  <p className="text-[var(--brown-700)]">Saturday: 10am - 4pm</p>
                  <p className="text-[var(--brown-700)]">Sunday: Closed</p>
                </div>
              </div>
            </div>
            
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[var(--brown-800)] font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border-2 border-[var(--beige-300)] bg-white focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-[var(--brown-800)] font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border-2 border-[var(--beige-300)] bg-white focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-[var(--brown-800)] font-medium mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md border-2 border-[var(--beige-300)] bg-white focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-[var(--brown-800)] font-medium mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 rounded-md border-2 border-[var(--beige-300)] bg-white focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)] resize-none"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-[var(--brown-800)] text-[var(--beige-50)] rounded-md hover:bg-[var(--brown-700)] transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
