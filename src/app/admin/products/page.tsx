'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  description: string;
  seller: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    stock: 0,
    image: '',
    description: '',
    seller: '',
  });
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/login');
      return;
    }

    loadProducts();
    loadCategories();
  }, [isAuthenticated, user, router]);

  const loadCategories = () => {
    const storedCategories = localStorage.getItem('reyah_categories');
    if (storedCategories) {
      const cats = JSON.parse(storedCategories);
      setCategories(cats.map((c: any) => c.name));
    } else {
      // Default categories
      setCategories(['Jewelry', 'Eco-Friendly', 'Vintage', 'Home Decor', 'Art', 'Fashion', 'Crafts']);
    }
  };

  const loadProducts = () => {
    // Get products from localStorage
    const storedProducts = localStorage.getItem('reyah_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Initialize with sample products
      const sampleProducts: Product[] = [
        {
          id: 1,
          name: 'Handcrafted Silver Ring Set',
          price: 11999,
          category: 'Jewelry',
          stock: 15,
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
          description: 'Beautiful handcrafted silver rings',
          seller: 'Artisan Metals Kenya',
        },
        {
          id: 2,
          name: 'Organic Beeswax Food Wraps',
          price: 1649,
          category: 'Eco-Friendly',
          stock: 50,
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
          description: 'Eco-friendly food storage solution',
          seller: 'Green Living Co.',
        },
        {
          id: 3,
          name: 'Vintage Leather Journal',
          price: 6099,
          category: 'Vintage',
          stock: 8,
          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400',
          description: 'Premium leather-bound journal',
          seller: 'Heritage Crafts',
        },
      ];
      localStorage.setItem('reyah_products', JSON.stringify(sampleProducts));
      setProducts(sampleProducts);
    }
  };

  const handleAddProduct = () => {
    if (!formData.name || !formData.price || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: formData.name,
      price: formData.price,
      category: formData.category,
      stock: formData.stock || 0,
      image: formData.image || '',
      description: formData.description || '',
      seller: formData.seller || 'Unknown Seller',
    };

    const updatedProducts = [...products, newProduct];
    localStorage.setItem('reyah_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setShowAddModal(false);
    resetForm();
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id
        ? { ...p, ...formData }
        : p
    );

    localStorage.setItem('reyah_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    setEditingProduct(null);
    resetForm();
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter((p) => p.id !== id);
      localStorage.setItem('reyah_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setImagePreview(product.image);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: '',
      stock: 0,
      image: '',
      description: '',
      seller: '',
    });
    setImagePreview('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-[var(--brown-800)]">Manage Products</h1>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-[var(--accent)] to-[var(--brown-600)] text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Stock</p>
                <p className="text-3xl font-bold text-[var(--brown-800)]">
                  {products.reduce((sum, p) => sum + p.stock, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock Items</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {products.filter((p) => p.stock < 10).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)] p-4 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, category, or seller..."
            className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--brown-800)]"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[var(--beige-300)]">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--beige-300)] bg-[var(--beige-50)]">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Product</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Category</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Price</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Stock</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Seller</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--brown-800)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-[var(--beige-200)] hover:bg-[var(--beige-50)]">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--beige-100)] to-[var(--beige-200)] rounded-md flex items-center justify-center">
                              <span className="text-lg font-bold text-[var(--brown-600)]">
                                {product.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[var(--brown-800)]">{product.name}</p>
                            <p className="text-xs text-gray-600 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-[var(--accent)]">KSH {product.price.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock < 10
                              ? 'bg-red-100 text-red-700'
                              : product.stock < 20
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">{product.seller}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--beige-300)]">
              <h2 className="text-2xl font-bold text-[var(--brown-800)]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Price (KSH) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Category *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex-1 px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Link
                    href="/admin/categories"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    title="Manage Categories"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Seller Name
                </label>
                <input
                  type="text"
                  value={formData.seller}
                  onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-[var(--beige-300)] rounded-md focus:outline-none focus:border-[var(--accent)]"
                  placeholder="Enter seller name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--brown-800)] mb-2">
                  Product Image *
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 border-2 border-[var(--beige-300)] rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, image: '' });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--beige-300)] rounded-md cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--beige-50)] transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
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
                  placeholder="Enter product description"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--beige-300)] flex gap-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="flex-1 px-6 py-3 border-2 border-[var(--beige-300)] text-[var(--brown-800)] rounded-md font-semibold hover:bg-[var(--beige-100)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--brown-600)] text-white rounded-md font-semibold hover:shadow-lg transition-shadow"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
