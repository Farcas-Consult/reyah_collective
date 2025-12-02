'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    loadCategories();
  }, [isAuthenticated, user, router]);

  const loadCategories = () => {
    const storedCategories = localStorage.getItem('reyah_categories');
    const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    
    if (storedCategories) {
      const cats = JSON.parse(storedCategories);
      // Update product counts
      const updatedCats = cats.map((cat: Category) => ({
        ...cat,
        productCount: products.filter((p: any) => p.category === cat.name).length
      }));
      setCategories(updatedCats);
    } else {
      // Initialize with default categories
      const defaultCategories: Category[] = [
        { id: 1, name: 'Jewelry', description: 'Handcrafted jewelry and accessories', productCount: 0 },
        { id: 2, name: 'Eco-Friendly', description: 'Sustainable and eco-friendly products', productCount: 0 },
        { id: 3, name: 'Vintage', description: 'Vintage and antique items', productCount: 0 },
        { id: 4, name: 'Home Decor', description: 'Home decoration and living items', productCount: 0 },
        { id: 5, name: 'Art', description: 'Art pieces and collectibles', productCount: 0 },
        { id: 6, name: 'Fashion', description: 'Fashion and clothing items', productCount: 0 },
        { id: 7, name: 'Crafts', description: 'DIY and craft supplies', productCount: 0 },
      ];
      
      const withCounts = defaultCategories.map(cat => ({
        ...cat,
        productCount: products.filter((p: any) => p.category === cat.name).length
      }));
      
      localStorage.setItem('reyah_categories', JSON.stringify(defaultCategories));
      setCategories(withCounts);
    }
  };

  const handleAddCategory = () => {
    if (!formData.name) {
      alert('Please enter category name');
      return;
    }

    const newCategory: Category = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      productCount: 0
    };

    const updatedCategories = [...categories, newCategory];
    localStorage.setItem('reyah_categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    setShowAddModal(false);
    setFormData({ name: '', description: '' });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id
        ? { ...cat, name: formData.name, description: formData.description }
        : cat
    );

    localStorage.setItem('reyah_categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleDeleteCategory = (id: number, name: string) => {
    const products = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    const hasProducts = products.some((p: any) => p.category === name);

    if (hasProducts) {
      alert('Cannot delete category with existing products. Please reassign or delete the products first.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${name}" category?`)) {
      const updatedCategories = categories.filter(cat => cat.id !== id);
      localStorage.setItem('reyah_categories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--beige-100)]">
      {/* Admin Header */}
      <header className="bg-white shadow-md border-b border-[var(--beige-300)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-2xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl">⭐</span>
              </Link>
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">ADMIN</span>
            </div>
            <Link href="/admin" className="text-[var(--accent)] hover:text-[var(--brown-600)] font-semibold">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <BackButton />
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[var(--brown-800)]">Manage Categories</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[var(--accent)] text-white px-6 py-3 rounded-md hover:bg-[var(--brown-600)] transition-colors font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[var(--brown-800)] mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description || 'No description'}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-[var(--beige-300)]">
                <button
                  onClick={() => openEditModal(category)}
                  className="flex-1 bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors font-semibold text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                  className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-md hover:bg-red-100 transition-colors font-semibold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add/Edit Category Modal */}
      {(showAddModal || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-[var(--beige-300)]">
              <h2 className="text-2xl font-bold text-[var(--brown-800)]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                  placeholder="e.g., Electronics, Books, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                  rows={3}
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[var(--beige-300)] flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '' });
                }}
                className="flex-1 bg-gray-100 text-[var(--brown-800)] py-2 px-4 rounded-md hover:bg-gray-200 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                className="flex-1 bg-[var(--accent)] text-white py-2 px-4 rounded-md hover:bg-[var(--brown-600)] transition-colors font-semibold"
              >
                {editingCategory ? 'Update' : 'Add'} Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
