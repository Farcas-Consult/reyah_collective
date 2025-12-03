'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getComparisonProductIds,
  removeFromComparison,
  clearComparison,
  getEnabledAttributes,
  generateComparisonUrl,
  exportComparisonAsJson,
} from '@/utils/comparison';
import StarRating from './StarRating';

interface Product {
  id: number;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  description: string;
  category: string;
  rating?: number;
  reviews?: number;
  stock: number;
  colors?: string[];
  sizes?: string[];
  materials?: string;
  seller: string;
  sellerRating?: number;
  shipping?: string;
  shippingTime?: string;
}

export default function ProductComparison() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const productIds = getComparisonProductIds();
    const allProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
    
    const comparisonProducts = allProducts.filter((p: Product) => 
      productIds.includes(p.id)
    );
    
    setProducts(comparisonProducts);
    setLoading(false);
  };

  const handleRemove = (productId: number) => {
    removeFromComparison(productId);
    loadProducts();
  };

  const handleClearAll = () => {
    if (confirm('Remove all products from comparison?')) {
      clearComparison();
      loadProducts();
    }
  };

  const handleShare = () => {
    const url = generateComparisonUrl();
    setShareUrl(url);
    setShowShareModal(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const json = exportComparisonAsJson(products);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product-comparison-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const enabledAttributes = getEnabledAttributes();

  const getAttributeValue = (product: Product, attributeId: string): any => {
    switch (attributeId) {
      case 'name': return product.name;
      case 'image': return product.image;
      case 'description': return product.description;
      case 'category': return product.category;
      case 'price': return `$${product.price}`;
      case 'salePrice': return product.salePrice ? `$${product.salePrice}` : 'N/A';
      case 'discount': 
        return product.salePrice 
          ? `${Math.round((1 - product.salePrice / product.price) * 100)}% OFF` 
          : 'No discount';
      case 'rating': return product.rating || 0;
      case 'reviews': return product.reviews || 0;
      case 'stock': 
        return product.stock > 0 
          ? <span className="text-green-600 font-semibold">In Stock ({product.stock})</span>
          : <span className="text-red-600 font-semibold">Out of Stock</span>;
      case 'colors': return product.colors?.join(', ') || 'N/A';
      case 'sizes': return product.sizes?.join(', ') || 'N/A';
      case 'materials': return product.materials || 'N/A';
      case 'seller': return product.seller;
      case 'sellerRating': return product.sellerRating || 'No rating';
      case 'shipping': return product.shipping || 'Free';
      case 'shippingTime': return product.shippingTime || '3-5 business days';
      default: return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[var(--beige-300)] p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Products to Compare</h3>
        <p className="text-gray-600 mb-6">Add products to comparison to see them here</p>
        <Link 
          href="/shop" 
          className="inline-block bg-[var(--accent)] text-white px-6 py-3 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-[var(--brown-800)]">
          Comparing {products.length} Product{products.length > 1 ? 's' : ''}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Desktop Comparison Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full bg-white rounded-lg border border-[var(--beige-300)]">
          <thead>
            <tr className="border-b border-[var(--beige-300)]">
              <th className="p-4 text-left font-bold text-[var(--brown-800)] bg-[var(--beige-100)] sticky left-0">
                Attribute
              </th>
              {products.map(product => (
                <th key={product.id} className="p-4 text-center border-l border-[var(--beige-300)]">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                      title="Remove from comparison"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <Link 
                      href={`/product/${product.id}`}
                      className="text-[var(--accent)] hover:underline font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {enabledAttributes.map((attr, index) => (
              <tr 
                key={attr.id} 
                className={index % 2 === 0 ? 'bg-white' : 'bg-[var(--beige-50)]'}
              >
                <td className="p-4 font-semibold text-gray-700 border-r border-[var(--beige-300)] sticky left-0 bg-inherit">
                  {attr.label}
                </td>
                {products.map(product => {
                  const value = getAttributeValue(product, attr.id);
                  
                  return (
                    <td key={product.id} className="p-4 text-center border-l border-[var(--beige-300)]">
                      {attr.id === 'image' ? (
                        <div className="flex justify-center">
                          <Image
                            src={value}
                            alt={product.name}
                            width={100}
                            height={100}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ) : attr.id === 'rating' ? (
                        <div className="flex justify-center">
                          <StarRating rating={value} size="sm" />
                        </div>
                      ) : attr.id === 'price' || attr.id === 'salePrice' ? (
                        <span className="font-bold text-lg text-[var(--accent)]">{value}</span>
                      ) : (
                        <span className="text-gray-700">{value}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Comparison Cards */}
      <div className="md:hidden space-y-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg border border-[var(--beige-300)] p-4">
            <div className="flex items-start justify-between mb-4">
              <Link 
                href={`/product/${product.id}`}
                className="text-lg font-bold text-[var(--accent)] hover:underline"
              >
                {product.name}
              </Link>
              <button
                onClick={() => handleRemove(product.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {enabledAttributes.map(attr => {
                const value = getAttributeValue(product, attr.id);
                
                if (attr.id === 'name') return null;
                
                return (
                  <div key={attr.id} className="flex justify-between items-center border-b border-[var(--beige-200)] pb-2">
                    <span className="text-sm font-semibold text-gray-600">{attr.label}:</span>
                    <span className="text-sm text-gray-800">
                      {attr.id === 'image' ? (
                        <Image
                          src={value}
                          alt={product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                      ) : attr.id === 'rating' ? (
                        <StarRating rating={value} size="sm" />
                      ) : (
                        value
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <Link
              href={`/product/${product.id}`}
              className="mt-4 block w-full text-center bg-[var(--accent)] text-white py-2 rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--brown-800)]">Share Comparison</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">Share this comparison link with others:</p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--brown-600)] transition-colors font-semibold text-sm"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="flex gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this product comparison`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors text-center font-semibold text-sm"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold text-sm"
              >
                Facebook
              </a>
              <a
                href={`mailto:?subject=Product Comparison&body=Check out this product comparison: ${shareUrl}`}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center font-semibold text-sm"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
