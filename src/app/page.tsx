"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ActiveDeals from '@/components/ActiveDeals';
import ProductRecommendations from '@/components/ProductRecommendations';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getProductImageSrc, getProductImage } from '@/data/products';
import HandmadeJewelry1 from '@/assets/HandmadeJewelry1.jpg';
import Artisan1 from '@/assets/Artisan1.jpg';
import Vintage1 from '@/assets/Vintage1.jpg';

// Sample product data - in a real app, this would come from an API/database
const allProducts = [
  { id: 1, name: 'Handcrafted Silver Ring Set', price: 11999, originalPrice: 19500, category: 'Jewelry', seller: 'Artisan Metals Kenya', description: 'Beautiful handcrafted silver ring set', rating: 4.9, reviews: 234, stock: 50, images: [getProductImageSrc(1)] },
  { id: 2, name: 'Organic Beeswax Food Wraps', price: 3299, originalPrice: 4650, category: 'Eco-Friendly', seller: 'Green Living KE', description: 'Reusable organic beeswax food wraps', rating: 4.9, reviews: 189, stock: 45, images: [getProductImageSrc(2)] },
  { id: 3, name: 'Vintage Leather Journal', price: 6099, originalPrice: 8650, category: 'Vintage', seller: 'Heritage Crafts', description: 'Authentic vintage-style leather journal', rating: 4.8, reviews: 156, stock: 60, images: [getProductImageSrc(3)] },
  { id: 4, name: 'Artisan Coffee Blend - 500g', price: 4399, originalPrice: 5999, category: 'Food', seller: 'Kenyan Coffee Co.', description: 'Premium artisan coffee blend', rating: 5.0, reviews: 312, stock: 30, images: [getProductImageSrc(4)] },
  { id: 5, name: 'Custom Macrame Wall Hanging', price: 10599, originalPrice: 14650, category: 'Home Decor', seller: 'Knot & Weave', description: 'Beautiful custom macrame wall hanging', rating: 4.8, reviews: 145, stock: 25, images: [getProductImageSrc(5)] },
  { id: 6, name: 'Handmade Natural Soap Set', price: 3849, originalPrice: 5320, category: 'Wellness', seller: 'Natural Beauty Kenya', description: 'Set of 6 handmade natural soaps', rating: 4.9, reviews: 267, stock: 80, images: [getProductImageSrc(6)] },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [addedToCart, setAddedToCart] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const heroSlides = [
    {
      title: "Black Friday Deals - Up to 60% OFF",
      subtitle: "Massive savings on home decor, furniture, and more!",
      cta: "Shop Now",
      ctaLink: "/shop",
      badge: "🔥 BLACK FRIDAY"
    },
    {
      title: "New Collection Arrivals",
      subtitle: "Discover the latest styles in home decor and textiles!",
      cta: "Shop Collection",
      ctaLink: "/collections",
      badge: "✨ NEW ARRIVALS"
    },
    {
      title: "Free Delivery on Orders Over $100",
      subtitle: "Shop comfortable and stylish pieces for your home!",
      cta: "Start Shopping",
      ctaLink: "/shop",
      badge: "🚚 FREE SHIPPING"
    },
    {
      title: "Premium Artisan Collection",
      subtitle: "Handcrafted pieces made with care and precision!",
      cta: "Explore Premium",
      ctaLink: "/collections",
      badge: "🌟 PREMIUM"
    }
  ];

  const categories = [
    { name: "Handmade Jewelry", icon: '💎', link: '/shop?category=jewelry' },
    { name: 'Artisan Home Decor', icon: '🏠', link: '/shop?category=home-decor' },
    { name: 'Vintage Goods', icon: '⏰', link: '/shop?category=vintage' },
    { name: 'Art & Prints', icon: '🎨', link: '/shop?category=art' },
    { name: 'Crafts & DIY', icon: '✂', link: '/shop?category=crafts' },
    { name: 'Eco-Friendly', icon: '🌱', link: '/shop?category=eco-friendly' },
    { name: 'Food & Beverages', icon: '☕', link: '/shop?category=food' },
    { name: 'All Products', icon: '📦', link: '/shop' }
  ];

  const flashDeals = [
    {
      name: 'Handcrafted Silver Ring Set',
      price: 11999,
      originalPrice: 19500,
      discount: 38,
      rating: 4.9,
      reviews: 234,
      sold: 156,
      stock: 50,
      badge: 'Best Value',
      image: getProductImage(1)
    },
    {
      name: 'Organic Beeswax Food Wraps',
      price: 3299,
      originalPrice: 4650,
      discount: 29,
      rating: 4.9,
      reviews: 189,
      sold: 203,
      stock: 45,
      badge: 'Eco-Friendly',
      image: getProductImage(2)
    },
    {
      name: 'Vintage Leather Journal',
      price: 6099,
      originalPrice: 8650,
      discount: 29,
      rating: 4.8,
      reviews: 156,
      sold: 134,
      stock: 60,
      badge: 'Popular',
      image: getProductImage(3)
    },
    {
      name: 'Artisan Coffee Blend - 500g',
      price: 4399,
      originalPrice: 5999,
      discount: 27,
      rating: 5.0,
      reviews: 312,
      sold: 289,
      stock: 30,
      badge: 'Best Offer',
      image: getProductImage(4)
    }
  ];

  const trendingProducts = [
    { name: 'Custom Macrame Wall Hanging', price: 10599, originalPrice: 14650, discount: 27, rating: 4.8, badge: 'Trending', image: getProductImage(5) },
    { name: 'Handmade Natural Soap Set', price: 3849, originalPrice: 5320, discount: 28, rating: 4.9, badge: 'Hot', image: getProductImage(6) },
    { name: 'Vintage Ceramic Planter', price: 5699, originalPrice: 7980, discount: 28, rating: 4.7, badge: 'Best Seller', image: getProductImage('Vintage Ceramic Planter') },
    { name: 'DIY Embroidery Kit', price: 4779, originalPrice: 6650, discount: 28, rating: 4.9, badge: 'New', image: getProductImage('DIY Embroidery Kit') },
    { name: 'Reusable Produce Bags (5 Pack)', price: 2519, originalPrice: 3724, discount: 32, rating: 4.8, badge: 'Sale', image: getProductImage('Reusable Produce Bags (5 Pack)') },
    { name: 'Artisan Honey - Pure Raw', price: 3319, originalPrice: 4655, discount: 29, rating: 4.9, badge: 'Popular', image: getProductImage('Artisan Honey - Pure Raw') }
  ];

  const showcaseImages = [
    { title: 'Handcrafted Jewelry', category: 'Custom Designs', image: HandmadeJewelry1 },
    { title: 'Artisan Gallery', category: 'Original Art & Prints', image: Artisan1 },
    { title: 'Vintage Treasures', category: 'Curated Finds', image: Vintage1 },
    { title: 'Eco Collection', category: 'Sustainable Living', image: getProductImage(6) }
  ];

  const handleAddToCart = (product: { name: string; price: number; id?: number }, id: number) => {
    addToCart({
      id,
      name: product.name,
      price: product.price,
      image: getProductImage(product.id || id),
      category: 'General',
      inStock: true
    });
    setAddedToCart(id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-[180px]">
        {/* Hero Banner with Sidebar - Jumia Style */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-7xl py-4">
            <div className="flex gap-4">
              {/* Left Sidebar - Categories */}
              <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-lg border border-[var(--beige-300)] overflow-hidden shadow-sm">
                  <div className="bg-[var(--brown-800)] text-[var(--beige-50)] px-4 py-3 font-bold text-sm">
                    📂 SHOP BY CATEGORY
                  </div>
                  <div className="divide-y divide-[var(--beige-300)]">
                    {[
                      { name: "Handmade Jewelry", icon: "💎", link: "/shop?category=jewelry" },
                      { name: "Artisan Home Decor", icon: "🏠", link: "/shop?category=home-decor" },
                      { name: "Vintage & Antiques", icon: "⏰", link: "/shop?category=vintage" },
                      { name: "Art & Prints", icon: "🎨", link: "/shop?category=art" },
                      { name: "Crafts & DIY Kits", icon: "✂", link: "/shop?category=crafts" },
                      { name: "Eco-Friendly Products", icon: "🌱", link: "/shop?category=eco-friendly" },
                      { name: "Custom Clothing", icon: "👔", link: "/shop?category=clothing" },
                      { name: "Artisan Food", icon: "☕", link: "/shop?category=food" },
                      { name: "Health & Wellness", icon: "⚕", link: "/shop?category=wellness" },
                      { name: "Books & Publications", icon: "📖", link: "/shop?category=books" },
                      { name: "Children's Products", icon: "👶", link: "/shop?category=kids" },
                      { name: "All Categories", icon: "📦", link: "/shop" }
                    ].map((category, idx) => (
                      <Link
                        key={idx}
                        href={category.link}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--beige-100)] transition-colors group"
                      >
                        <span className="text-sm text-[var(--brown-700)] group-hover:text-[var(--accent)] font-medium">
                          {category.name}
                        </span>
                        <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center - Main Banner Slider */}
              <div className="flex-1 relative h-[320px] md:h-[400px] overflow-hidden rounded-lg bg-gradient-to-br from-black via-[var(--navy)] to-[var(--emerald-green)]">
                {heroSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {/* Black Friday Style Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-[var(--navy)] to-[var(--emerald-green)]" />
                    
                    {/* Product Image Area */}
                    <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-br from-[#0E7A53] via-[#0A5D3E] to-[#085A3B]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 bg-white/20 rounded-full blur-3xl" />
                      </div>
                      <div className="relative h-full flex items-center justify-center p-8">
                        <div className="w-48 h-48 border-8 border-white/20 rounded-full"></div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center z-10">
                      <div className="px-6 md:px-12 max-w-xl">
                        {/* Black Friday Badge */}
                        <div className="inline-block mb-4">
                          <div className="bg-white text-black px-6 py-3 font-bold text-xl md:text-2xl tracking-tight">
                            BLACK FRIDAY
                          </div>
                          <div className="bg-[var(--navy)] text-white px-6 py-2 font-bold text-lg">
                            EXTRA TIME!
                          </div>
                        </div>

                        <h1 className="text-white text-3xl md:text-5xl font-bold mb-4 leading-tight">
                          {slide.title}
                        </h1>
                        
                        {/* Price Display */}
                        <div className="mb-6">
                          <div className="flex items-baseline gap-3 mb-2">
                            <span className="text-gray-400 text-sm line-through">KSHS 26,199</span>
                            <span className="text-[var(--emerald-green)] text-5xl md:text-6xl font-bold">14,999</span>
                          </div>
                        </div>

                        <button className="px-8 py-3 bg-white text-black font-bold rounded-md hover:bg-gray-100 transition-all duration-300 shadow-lg text-sm md:text-base">
                          SHOP NOW
                        </button>
                      </div>
                    </div>

                    {/* Slider Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
                        <button
                          key={dot}
                          onClick={() => setCurrentSlide(dot % heroSlides.length)}
                          className={`h-2 rounded-full transition-all ${
                            dot % heroSlides.length === currentSlide
                              ? 'bg-[var(--emerald-green)] w-8'
                              : 'bg-white/40 w-2'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Sidebar - Quick Actions */}
              <div className="hidden xl:block w-64 flex-shrink-0 space-y-4">
                {/* WhatsApp Card */}
                <div className="bg-gradient-to-br from-[var(--emerald-green)] to-[#0A5D3E] rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <div className="font-bold">WhatsApp</div>
                      <div className="text-xs text-white/90">Text To Order</div>
                    </div>
                  </div>
                </div>

                {/* China Town */}
                <div className="bg-gradient-to-br from-[var(--navy)] to-[#3A3A3A] rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏮</span>
                    </div>
                    <div>
                      <div className="font-bold">CHINA TOWN</div>
                      <div className="text-xs text-white/90">NOW ON REYAH</div>
                    </div>
                  </div>
                </div>

                {/* Sell on Reyah */}
                <div className="bg-gradient-to-br from-[var(--emerald-green)] to-[#0A5D3E] rounded-lg p-4 text-white cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <div className="font-bold">SELL ON REYAH</div>
                      <div className="text-xs text-white/90">Millions Of Visitors</div>
                    </div>
                  </div>
                </div>

                {/* Call or WhatsApp */}
                <div className="bg-gradient-to-br from-[var(--emerald-green)] to-[#0A5D3E] rounded-lg p-5 text-white text-center cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-4xl">📞</span>
                  </div>
                  <div className="font-bold text-sm mb-1">CALL OR WHATSAPP</div>
                  <div className="text-2xl font-bold">0741 941 941</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Flash Deals Section */}
        <ActiveDeals />

        {/* Flash Sales */}
        <section className="py-6 md:py-8 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-[var(--brown-800)]">⚡ Flash Sales</h2>
                <div className="hidden md:flex items-center gap-2 bg-[var(--accent)] text-white px-3 py-1.5 rounded-md text-sm font-bold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
                  </svg>
                  Time Left: 23:45:12
                </div>
              </div>
              <Link href="/shop" className="text-[var(--accent)] font-semibold hover:underline text-sm flex items-center gap-1">
                See All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {flashDeals.map((product, i) => (
                <div
                  key={i}
                  className={`group bg-white border border-[var(--beige-300)] rounded-lg overflow-hidden hover:shadow-lg hover:border-[var(--accent)] transition-all duration-300 ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <Link href={`/product/${i + 1}`} className="relative block aspect-square overflow-hidden bg-[var(--beige-200)]">
                    {product.image && (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-[var(--accent)] text-white px-2 py-1 rounded text-xs font-bold shadow-md">
                      -{product.discount}%
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <div className="text-white text-xs font-semibold mb-1">🔥 {product.sold} sold</div>
                      <div className="w-full bg-gray-200/30 rounded-full h-1.5">
                        <div 
                          className="bg-[var(--accent)] h-1.5 rounded-full" 
                          style={{ width: `${(product.sold / (product.sold + product.stock)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </Link>

                  <div className="p-3">
                    <Link href={`/product/${i + 1}`} className="block">
                      <h3 className="font-medium text-sm mb-1.5 line-clamp-2 text-[var(--brown-800)] group-hover:text-[var(--accent)] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-500 text-xs">
                        {'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>

                    <div className="mb-3">
                      <div className="text-lg md:text-xl font-bold text-[var(--accent)]">
                        KSH {product.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 line-through">
                          KSH {product.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleAddToCart(product, i + 1)}
                      className={`w-full py-2 md:py-2.5 rounded-md text-sm font-bold transition-colors shadow-sm ${
                        addedToCart === i + 1
                          ? 'bg-green-600 text-white'
                          : 'bg-[var(--brown-800)] text-white hover:bg-[var(--brown-700)]'
                      }`}
                    >
                      {addedToCart === i + 1 ? '✓ ADDED TO CART' : 'ADD TO CART'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banners */}
        <section className="py-0 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              <div className="relative h-32 md:h-40 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-r from-[var(--emerald-green)] to-[#0A5D3E]">
                <div className="relative h-full flex flex-col justify-center px-6">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1">FREE DELIVERY</h3>
                  <p className="text-white/90 text-xs md:text-sm">Orders above $100</p>
                </div>
              </div>

              <div className="relative h-32 md:h-40 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-r from-[var(--emerald-green)] to-[#0A5D3E]">
                <div className="relative h-full flex flex-col justify-center px-6">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1">100% AUTHENTIC</h3>
                  <p className="text-white/90 text-xs md:text-sm">Quality guaranteed</p>
                </div>
              </div>

              <div className="relative h-32 md:h-40 rounded-xl overflow-hidden group cursor-pointer bg-gradient-to-r from-[var(--emerald-green)] to-[#0A5D3E]">
                <div className="relative h-full flex flex-col justify-center px-6">
                  <svg className="w-10 h-10 md:w-12 md:h-12 text-white mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <h3 className="text-white font-bold text-base md:text-lg mb-1">EASY RETURNS</h3>
                  <p className="text-white/90 text-xs md:text-sm">Hassle-free returns</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Picks */}
        <section className="py-6 md:py-8 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--brown-800)]">🌟 Top Picks For You</h2>
              <Link href="/shop" className="text-[var(--accent)] font-semibold hover:underline text-sm flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trendingProducts.map((product, i) => (
                <div
                  key={i}
                  className={`group bg-white border border-[var(--beige-300)] rounded-lg overflow-hidden hover:shadow-md hover:border-[var(--accent)] transition-all duration-300 ${
                    isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <Link href={`/product/${i + 5}`} className="relative block aspect-square overflow-hidden bg-[var(--beige-200)]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </Link>

                  <div className="p-2 md:p-3">
                    <Link href={`/product/${i + 5}`}>
                      <h3 className="font-medium text-xs mb-1 line-clamp-2 text-[var(--brown-800)] group-hover:text-[var(--accent)] transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 mb-1.5">
                      <div className="flex text-yellow-500 text-xs">
                        {'★'.repeat(Math.floor(product.rating))}
                      </div>
                      <span className="text-xs text-gray-500">({product.rating})</span>
                    </div>

                    <div className="mb-2">
                      <div className="text-sm md:text-base font-bold text-[var(--accent)]">
                        KSH {product.price.toLocaleString()}
                      </div>
                      {product.discount > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          KSH {product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => handleAddToCart(product, i + 5)}
                      className={`w-full py-1.5 rounded text-xs font-semibold transition-colors ${
                        addedToCart === i + 5
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-[var(--brown-800)] hover:bg-[var(--accent)] hover:text-white'
                      }`}
                    >
                      {addedToCart === i + 5 ? '✓ ADDED' : '+ ADD'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-6 md:py-8 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--brown-800)]">Featured Products</h2>
              <Link href="/shop" className="text-[var(--accent)] font-semibold hover:underline text-sm flex items-center gap-1">
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {showcaseImages.map((item, i) => (
                <Link
                  key={i}
                  href="/shop"
                  className={`group relative h-48 md:h-56 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-[var(--beige-300)] ${
                    isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                      <h4 className="text-white font-bold text-sm md:text-base mb-1">{item.title}</h4>
                      <p className="text-white/95 text-xs md:text-sm font-semibold">{item.category}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Shop Section */}
        <section className="py-6 md:py-8 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--brown-800)]">Shop by Department</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Handmade Jewelry */}
              <div className="bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={HandmadeJewelry1}
                    alt="Handmade Jewelry"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                    Handmade Jewelry
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/shop?category=Handmade Jewelry" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Custom Rings
                  </Link>
                  <Link href="/shop?category=Handmade Jewelry" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Necklaces & Pendants
                  </Link>
                  <Link href="/shop?category=Handmade Jewelry" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Earrings
                  </Link>
                  <Link href="/shop?category=Handmade Jewelry" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Bracelets
                  </Link>
                  <Link href="/shop?category=Handmade Jewelry" className="block text-sm font-semibold text-[var(--accent)] hover:underline mt-3">
                    View All Jewelry →
                  </Link>
                </div>
              </div>

              {/* Artisan Home Decor */}
              <div className="bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={Artisan1}
                    alt="Artisan Home Decor"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                    Artisan Home Decor
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/shop?category=Artisan Home Decor" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Handmade Ceramics
                  </Link>
                  <Link href="/shop?category=Artisan Home Decor" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Wall Art & Hangings
                  </Link>
                  <Link href="/shop?category=Artisan Home Decor" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Artisan Candles
                  </Link>
                  <Link href="/shop?category=Artisan Home Decor" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Handmade Furniture
                  </Link>
                  <Link href="/shop?category=Artisan Home Decor" className="block text-sm font-semibold text-[var(--accent)] hover:underline mt-3">
                    View All Home Decor →
                  </Link>
                </div>
              </div>

              {/* Vintage & Antiques */}
              <div className="bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={Vintage1}
                    alt="Vintage and Antiques"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">
                    Vintage & Antiques
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/shop?category=Vintage and Antiques" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Vintage Clothing
                  </Link>
                  <Link href="/shop?category=Vintage and Antiques" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Antique Furniture
                  </Link>
                  <Link href="/shop?category=Vintage and Antiques" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Collectibles
                  </Link>
                  <Link href="/shop?category=Vintage and Antiques" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Rare Books
                  </Link>
                  <Link href="/shop?category=Vintage and Antiques" className="block text-sm font-semibold text-[var(--accent)] hover:underline mt-3">
                    View All Vintage →
                  </Link>
                </div>
              </div>

              {/* Crafts & DIY */}
              <div className="bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-4 bg-gradient-to-r from-[var(--beige-200)] to-[var(--beige-100)] flex items-center">
                  <Image src={require('@/assets/Craft1.jpg')} alt="Crafts & DIY" width={80} height={80} className="w-20 h-20 object-cover rounded-lg mr-4" />
                  <h3 className="text-lg font-bold text-[var(--brown-800)] mb-2">
                    Crafts & DIY
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/shop?category=craft-kits" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Craft Kits
                  </Link>
                  <Link href="/shop?category=art-supplies" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Art Supplies
                  </Link>
                  <Link href="/shop?category=sewing" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Sewing & Fabrics
                  </Link>
                  <Link href="/shop?category=embroidery" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Embroidery Kits
                  </Link>
                  <Link href="/shop?category=crafts" className="block text-sm font-semibold text-[var(--accent)] hover:underline mt-3">
                    View All Crafts →
                  </Link>
                </div>
              </div>

              {/* Eco-Friendly Products */}
              <div className="bg-[var(--beige-50)] rounded-lg border border-[var(--beige-300)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-4 bg-gradient-to-r from-[var(--beige-200)] to-[var(--beige-100)] flex items-center">
                  <Image src={require('@/assets/Ecofriendly1.jpg')} alt="Eco-Friendly Products" width={80} height={80} className="w-20 h-20 object-cover rounded-lg mr-4" />
                  <h3 className="text-lg font-bold text-[var(--brown-800)] mb-2">
                    Eco-Friendly Products
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/shop?category=zero-waste" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Zero Waste Items
                  </Link>
                  <Link href="/shop?category=natural-skincare" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Natural Skincare
                  </Link>
                  <Link href="/shop?category=reusables" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Reusable Products
                  </Link>
                  <Link href="/shop?category=organic" className="block text-sm text-[var(--brown-700)] hover:text-[var(--accent)] hover:translate-x-1 transition-all">
                    → Organic Goods
                  </Link>
                  <Link href="/shop?category=eco-friendly" className="block text-sm font-semibold text-[var(--accent)] hover:underline mt-3">
                    View All Eco Products →
                  </Link>
                </div>
              </div>

              {/* Artisan Food & Beverages */}
              <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--brown-600)] rounded-lg border border-[var(--brown-700)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Artisan Food & Beverages
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/shop?category=coffee" className="block text-sm text-white/90 hover:text-white hover:translate-x-1 transition-all">
                    → Artisan Coffee & Tea
                  </Link>
                  <Link href="/shop?category=chocolates" className="block text-sm text-white/90 hover:text-white hover:translate-x-1 transition-all">
                    → Handmade Chocolates
                  </Link>
                  <Link href="/shop?category=honey" className="block text-sm text-white/90 hover:text-white hover:translate-x-1 transition-all">
                    → Pure Honey & Jams
                  </Link>
                  <Link href="/shop?category=spices" className="block text-sm text-white/90 hover:text-white hover:translate-x-1 transition-all">
                    → Exotic Spices
                  </Link>
                  <Link href="/shop?category=food" className="block text-sm font-semibold text-white hover:underline mt-3">
                    View All Food & Beverages →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 space-y-12">
            <ProductRecommendations
              type="trending"
              allProducts={allProducts}
              userId={user?.id}
              limit={6}
            />

            {user?.id && (
              <ProductRecommendations
                type="personalized"
                allProducts={allProducts}
                userId={user.id}
                limit={6}
              />
            )}

            <ProductRecommendations
              type="best_sellers"
              allProducts={allProducts}
              userId={user?.id}
              limit={6}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
