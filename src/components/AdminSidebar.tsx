'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
  {
    category: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
    ]
  },
  {
    category: 'Commerce',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: '📦' },
      { name: 'Products', href: '/admin/products', icon: '🏷️' },
      { name: 'Categories', href: '/admin/categories', icon: '📁' },
      { name: 'Flash Sales', href: '/admin/flash-sales', icon: '⚡' },
      { name: 'Wholesale & Bulk', href: '/admin/wholesale', icon: '📦' },
    ]
  },
  {
    category: 'Users',
    items: [
      { name: 'All Users', href: '/admin/users', icon: '👥' },
      { name: 'Sellers', href: '/admin/sellers', icon: '🏪' },
      { name: 'Suppliers', href: '/admin/suppliers', icon: '🚚' },
    ]
  },
  {
    category: 'Customer Engagement',
    items: [
      { name: 'Reviews', href: '/admin/reviews', icon: '⭐' },
      { name: 'Q&A', href: '/admin/qa', icon: '❓' },
      { name: 'Loyalty Program', href: '/admin/loyalty', icon: '🎁' },
      { name: 'Wishlist Analytics', href: '/admin/wishlists', icon: '❤️' },
      { name: 'Abandoned Carts', href: '/admin/abandoned-carts', icon: '🛒' },
    ]
  },
  {
    category: 'Settings',
    items: [
      { name: 'Shipping', href: '/admin/shipping', icon: '🚛' },
      { name: 'Recommendations', href: '/admin/recommendations', icon: '💡' },
      { name: 'Comparison', href: '/admin/comparison', icon: '📊' },
      { name: 'Localization', href: '/admin/localization', icon: '🌍' },
    ]
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[var(--accent)] text-white p-2 rounded-lg shadow-lg"
      >
        {collapsed ? '☰' : '✕'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-[var(--beige-300)] shadow-lg transition-all duration-300 z-40 ${
          collapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-72'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--beige-300)]">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-[var(--brown-800)]">REYAH</span>
              <span className="text-[var(--accent)] text-3xl">⭐</span>
            </span>
            {!collapsed && (
              <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                ADMIN
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto h-[calc(100vh-100px)] py-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {!collapsed && (
                <h3 className="px-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {section.category}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                          isActive
                            ? 'bg-[var(--accent)] text-white border-l-4 border-[var(--brown-800)]'
                            : 'text-[var(--brown-700)] hover:bg-[var(--beige-100)]'
                        }`}
                        title={collapsed ? item.name : undefined}
                      >
                        <span className="text-xl">{item.icon}</span>
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.name}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle (Desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block absolute bottom-4 right-4 bg-[var(--beige-200)] p-2 rounded-full hover:bg-[var(--beige-300)] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
