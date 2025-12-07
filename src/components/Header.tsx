'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { Message } from '@/types/message';
import SearchBar from '@/components/SearchBar';
import LocaleSelector from '@/components/LocaleSelector';
import { getProductImageSrc } from '@/data/products';

export default function Header() {
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const router = useRouter();
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Count unread messages
      const messages = JSON.parse(localStorage.getItem('reyah_messages') || '[]') as Message[];
      const unread = messages.filter((msg) => msg.receiverId === user.id && !msg.read).length;
      setUnreadCount(unread);
    }
  }, [isAuthenticated, user]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Load products for search suggestions
  useEffect(() => {
    const loadProducts = () => {
      const adminProducts = JSON.parse(localStorage.getItem('reyah_products') || '[]');
      const users = JSON.parse(localStorage.getItem('reyah_users') || '[]');
      
      const defaultProducts = [
        { id: 1, name: 'Handwoven Basket', category: 'Artisan Home Decor', price: 2500, image: getProductImageSrc(5), sellerName: 'Artisan Weaves', sellerRating: 4.8 },
        { id: 2, name: 'Beaded Necklace', category: 'Handmade Jewelry', price: 1500, image: getProductImageSrc('Beaded Necklace with Pendant'), sellerName: 'Bead Craft Co.', sellerRating: 4.5 },
        { id: 3, name: 'Vintage Clock', category: 'Vintage and Antiques', price: 3500, image: getProductImageSrc(3), sellerName: 'Timeless Treasures', sellerRating: 4.9 },
        { id: 4, name: 'Ceramic Vase', category: 'Artisan Home Decor', price: 1800, image: getProductImageSrc('Hand-Painted Ceramic Vase'), sellerName: 'Clay Masters', sellerRating: 4.7 },
        { id: 5, name: 'Gemstone Earrings', category: 'Handmade Jewelry', price: 2200, image: getProductImageSrc('Gemstone Pendant Necklace'), sellerName: 'Gem Artisans', sellerRating: 4.6 },
        { id: 6, name: 'Antique Mirror', category: 'Vintage and Antiques', price: 4500, image: getProductImageSrc('Antique Brass Candlestick'), sellerName: 'Heritage Collection', sellerRating: 4.8 },
      ];

      const sellerProducts = users
        .filter((user: any) => user.role === 'seller' && user.products)
        .flatMap((seller: any) => 
          seller.products.map((product: any) => ({
            ...product,
            sellerName: seller.businessName || `${seller.firstName} ${seller.lastName}`,
            sellerRating: seller.rating || 0
          }))
        );

      const combinedProducts = adminProducts.length > 0 ? adminProducts : [...defaultProducts, ...sellerProducts];
      setAllProducts(combinedProducts);
    };

    loadProducts();
  }, []);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      setShowAccountMenu(!showAccountMenu);
    } else {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    logout();
    setShowAccountMenu(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[var(--beige-200)] to-[var(--beige-100)] border-b border-[var(--beige-300)]">
        <div className="max-w-7xl mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between text-xs">
            <Link href="/sell" className="flex items-center gap-1.5 text-[var(--accent)] hover:text-[var(--brown-600)] transition-colors font-medium">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              <span>{t('nav.sellOnReyah')}</span>
            </Link>
            <div className="flex items-center gap-6 text-[var(--brown-700)]">
              <span className="font-bold text-[var(--brown-800)]">REYAH</span>
              <span className="opacity-40 text-xs">PAY</span>
              <span className="opacity-40 text-xs">DELIVERY</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[var(--beige-50)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="text-2xl md:text-3xl font-bold">
                <span className="text-[var(--brown-800)]">REYAH</span>
                <span className="text-[var(--accent)] text-3xl md:text-4xl">⭐</span>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                initialQuery=""
                onSearch={handleSearch}
                products={allProducts}
                showVoiceSearch={true}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative">
                <button 
                  onClick={handleAccountClick}
                  className="flex items-center gap-1.5 text-[var(--brown-700)] hover:text-[var(--accent)] transition-colors group"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs text-gray-500 group-hover:text-[var(--accent)]">
                      {isAuthenticated ? t('common.hi') + ',' : t('common.login')}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">
                        {isAuthenticated ? user?.firstName : t('common.account')}
                      </span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Account Dropdown Menu */}
                {isAuthenticated && showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-[var(--beige-300)] z-50">
                    <div className="p-4 border-b border-[var(--beige-300)]">
                      <p className="font-bold text-[var(--brown-800)]">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      {user?.isAdmin && (
                        <>
                          <Link 
                            href="/admin"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-colors font-bold"
                          >
                            🔐 {t('nav.adminDashboard')}
                          </Link>
                          <div className="border-t border-[var(--beige-300)] my-2"></div>
                        </>
                      )}
                      {user?.isSeller && user?.sellerApproved && (
                        <>
                          <Link 
                            href="/seller"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-colors font-bold"
                          >
                            🏪 {t('nav.sellerDashboard')}
                          </Link>
                          <div className="border-t border-[var(--beige-300)] my-2"></div>
                        </>
                      )}
                      {user?.isSeller && !user?.sellerApproved && (
                        <>
                          <Link 
                            href="/seller-pending"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-white bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 transition-colors font-bold"
                          >
                            ⏳ {t('status.sellerStatus')}: {t('status.pending')}
                          </Link>
                          <div className="border-t border-[var(--beige-300)] my-2"></div>
                        </>
                      )}
                      {user?.isSupplier && user?.supplierStatus === 'approved' && (
                        <>
                          <Link 
                            href="/supplier"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-white bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 transition-colors font-bold"
                          >
                            🏭 {t('nav.supplierDashboard')}
                          </Link>
                          <div className="border-t border-[var(--beige-300)] my-2"></div>
                        </>
                      )}
                      {user?.isSupplier && user?.supplierStatus !== 'approved' && (
                        <>
                          <Link 
                            href="/supplier-pending"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-white bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 transition-colors font-bold"
                          >
                            ⏳ {t('status.supplierStatus')}: {t('status.pending')}
                          </Link>
                          <div className="border-t border-[var(--beige-300)] my-2"></div>
                        </>
                      )}
                      {!user?.isSeller && !user?.isAdmin && !user?.isSupplier && (
                        <>
                          <Link 
                            href="/seller-setup"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-green-600 hover:bg-green-50 transition-colors font-semibold"
                          >
                            🏪 {t('nav.becomeSeller')}
                          </Link>
                          <Link 
                            href="/supplier-setup"
                            onClick={() => setShowAccountMenu(false)}
                            className="block px-4 py-2 text-purple-600 hover:bg-purple-50 transition-colors font-semibold"
                          >
                            🏭 {t('nav.becomeSupplier')}
                          </Link>
                          <div className="border-t border-[var(--beige-300)] my-2"></div>
                        </>
                      )}
                      <Link 
                        href="/account"
                        onClick={() => setShowAccountMenu(false)}
                        className="block px-4 py-2 text-[var(--brown-800)] hover:bg-[var(--beige-100)] transition-colors"
                      >
                        {t('nav.myAccount')}
                      </Link>
                      <Link 
                        href="/account/orders"
                        onClick={() => setShowAccountMenu(false)}
                        className="block px-4 py-2 text-[var(--brown-800)] hover:bg-[var(--beige-100)] transition-colors"
                      >
                        {t('nav.myOrders')}
                      </Link>
                      <Link 
                        href="/account/rewards"
                        onClick={() => setShowAccountMenu(false)}
                        className="block px-4 py-2 text-[var(--brown-800)] hover:bg-[var(--beige-100)] transition-colors flex items-center gap-2"
                      >
                        <span>⭐ {t('nav.rewards')}</span>
                      </Link>
                      <Link 
                        href="/account/wishlists"
                        onClick={() => setShowAccountMenu(false)}
                        className="block px-4 py-2 text-[var(--brown-800)] hover:bg-[var(--beige-100)] transition-colors flex items-center gap-2"
                      >
                        <span>❤️ {t('nav.wishlists')}</span>
                      </Link>
                      <Link 
                        href="/messages"
                        onClick={() => setShowAccountMenu(false)}
                        className="block px-4 py-2 text-[var(--brown-800)] hover:bg-[var(--beige-100)] transition-colors flex items-center justify-between"
                      >
                        <span>{t('nav.messages')}</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link 
                        href="/account"
                        onClick={() => setShowAccountMenu(false)}
                        className="block px-4 py-2 text-[var(--brown-800)] hover:bg-[var(--beige-100)] transition-colors"
                      >
                        {t('nav.settings')}
                      </Link>
                    </div>
                    <div className="border-t border-[var(--beige-300)] py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-semibold"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/help" className="flex items-center gap-1.5 text-[var(--brown-700)] hover:text-[var(--accent)] transition-colors group">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="hidden lg:flex flex-col items-start">
                  <span className="text-xs text-gray-500 group-hover:text-[var(--accent)]">{t('common.need')}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{t('common.help')}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </Link>

              {/* Language & Currency Selector */}
              <LocaleSelector />

              <Link href="/cart" className="relative flex items-center gap-2 text-[var(--brown-700)] hover:text-[var(--accent)] transition-colors">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden lg:block text-sm font-medium">{t('common.cart')}</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--accent)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>


      {/* Delivery Info Bar - Now inside header, below navigation */}
      <div className="bg-gradient-to-r from-[var(--accent)] via-[var(--brown-600)] to-[var(--accent)] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-8 py-3 text-sm font-medium overflow-x-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="font-semibold">{t('delivery.nationwide')}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{t('delivery.fastReliable')}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('delivery.sameDay')}</span>
            </div>
            <div className="hidden xl:flex items-center gap-2 whitespace-nowrap">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>{t('delivery.freeOver')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
