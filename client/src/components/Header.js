'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BRANDING } from '../lib/branding';
import { Search, ShoppingBag, Heart, User, Shield, Menu, X, ChevronDown, Mail, Phone, Truck } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsDrawerOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Do not render public store header on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white">
      {/* ── 1. Hekto Signature Purple Top Bar ── */}
      <div className="bg-[#7E33E0] text-[#F1F1F1] text-xs py-2 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[11px] sm:text-xs">
          {/* Left contact info */}
          <div className="flex items-center gap-3 sm:gap-5 font-lato min-w-0">
            <span className="flex items-center gap-1.5 hover:text-white transition-colors truncate">
              <Mail size={13} className="text-[#F1F1F1] shrink-0" />
              <a href={`mailto:${BRANDING.contact.email}`} className="truncate max-w-[130px] sm:max-w-none">
                {BRANDING.contact.email}
              </a>
            </span>
            <span className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors shrink-0">
              <Phone size={13} className="text-[#F1F1F1]" />
              <a href={`tel:${BRANDING.contact.phone}`}>{BRANDING.contact.phone}</a>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-white/90 shrink-0">
              <Truck size={13} />
              Free Delivery over Rs. 2,000
            </span>
          </div>

          {/* Right utilities (Currency, Wishlist, Login) */}
          <div className="flex items-center gap-3 sm:gap-5 font-lato shrink-0">
            <span className="hidden xs:inline font-medium text-white/90">PKR (Rs.)</span>

            <Link
              href="/wishlist"
              className="flex items-center gap-1 hover:text-white transition-colors py-1"
            >
              <Heart size={13} />
              <span className="hidden sm:inline">Wishlist</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 font-medium hover:text-white transition-colors py-1"
                >
                  <User size={13} />
                  <span className="max-w-[70px] sm:max-w-none truncate">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={11} />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E8E6F1] shadow-xl py-2 z-50 rounded-lg text-[#151875]">
                    <div className="px-4 py-2 border-b border-[#F2F0FF]">
                      <p className="text-xs font-semibold">{user?.name}</p>
                      <p className="text-[10px] text-[#8A8FB9] truncate">{user?.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-[#F6F5FF] text-[#7E33E0] font-medium"
                      >
                        <Shield size={13} />
                        Admin Portal
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs hover:bg-[#F6F5FF] text-[#151875]"
                    >
                      My Orders &amp; Profile
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs hover:bg-[#F6F5FF] text-[#151875]"
                    >
                      Track My Order
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-[#F2F0FF]"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 hover:text-white font-medium transition-colors py-1"
              >
                <User size={13} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Main Navigation Bar ── */}
      <div className="border-b border-[#E8E6F1] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2">

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 -ml-1.5 text-[#151875] hover:text-[#FB2E86] focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* ── Brand Logo ── */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-josefin text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-[#151875] hover:text-[#FB2E86] transition-colors">
                  Gadget<span className="text-[#FB2E86]">.</span>District
                </span>
              </Link>
            </div>

            {/* ── Desktop Navigation Links ── */}
            <nav className="hidden lg:flex items-center space-x-7">
              <Link
                href="/"
                className={`font-lato text-base font-semibold transition-colors ${
                  pathname === '/' ? 'text-[#FB2E86]' : 'text-[#151875] hover:text-[#FB2E86]'
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                className={`font-lato text-base font-semibold transition-colors ${
                  pathname === '/shop' ? 'text-[#FB2E86]' : 'text-[#151875] hover:text-[#FB2E86]'
                }`}
              >
                Products
              </Link>
              <Link
                href="/shop?category=mobile-cases-and-covers"
                className="font-lato text-base font-semibold text-[#151875] hover:text-[#FB2E86] transition-colors"
              >
                Cases
              </Link>
              <Link
                href="/shop?category=chargers-and-adapters"
                className="font-lato text-base font-semibold text-[#151875] hover:text-[#FB2E86] transition-colors"
              >
                Chargers
              </Link>
              <Link
                href="/shop?category=wireless-earbuds-and-headphones"
                className="font-lato text-base font-semibold text-[#151875] hover:text-[#FB2E86] transition-colors"
              >
                Audio
              </Link>
              <Link
                href="/track-order"
                className={`font-lato text-base font-semibold transition-colors ${
                  pathname === '/track-order' ? 'text-[#FB2E86]' : 'text-[#151875] hover:text-[#FB2E86]'
                }`}
              >
                Order Tracking
              </Link>
            </nav>

            {/* ── Right Actions: Search Box & Cart ── */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop/Tablet Integrated Search Form */}
              <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center">
                <input
                  type="text"
                  placeholder="Search accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 lg:w-64 px-4 py-2 text-sm border border-[#E8E6F1] border-r-0 rounded-l-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] bg-white placeholder-[#8A8FB9]"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="px-3.5 py-2 bg-[#FB2E86] text-white rounded-r-lg hover:bg-[#e02575] transition-colors flex items-center justify-center border border-[#FB2E86]"
                >
                  <Search size={16} />
                </button>
              </form>

              {/* Shopping Bag Button with Hekto Pink Badge */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2.5 text-[#151875] hover:text-[#FB2E86] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                aria-label="View shopping cart"
              >
                <ShoppingBag size={22} strokeWidth={1.8} />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#FB2E86] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E8E6F1] flex items-center justify-between bg-[#F6F5FF]">
              <span className="font-josefin text-xl font-bold text-[#151875]">
                Gadget<span className="text-[#FB2E86]">.</span>District
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#151875] hover:text-[#FB2E86] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-[#E8E6F1]">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-[#E8E6F1] border-r-0 rounded-l-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] bg-[#F6F5FF]"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="px-4 py-2.5 bg-[#FB2E86] text-white rounded-r-lg flex items-center justify-center min-h-[44px]"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                  pathname === '/' ? 'bg-[#F6F5FF] text-[#FB2E86]' : 'text-[#151875] hover:bg-[#F6F5FF]'
                }`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                  pathname === '/shop' ? 'bg-[#F6F5FF] text-[#FB2E86]' : 'text-[#151875] hover:bg-[#F6F5FF]'
                }`}
              >
                All Products
              </Link>
              <Link
                href="/shop?category=mobile-cases-and-covers"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#151875] hover:bg-[#F6F5FF] py-2.5 px-3 rounded-lg transition-colors"
              >
                Mobile Cases &amp; Covers
              </Link>
              <Link
                href="/shop?category=chargers-and-adapters"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#151875] hover:bg-[#F6F5FF] py-2.5 px-3 rounded-lg transition-colors"
              >
                Fast Chargers &amp; GaN Adapters
              </Link>
              <Link
                href="/shop?category=wireless-earbuds-and-headphones"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#151875] hover:bg-[#F6F5FF] py-2.5 px-3 rounded-lg transition-colors"
              >
                Wireless Audio
              </Link>
              <Link
                href="/shop?category=power-banks"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-semibold text-[#151875] hover:bg-[#F6F5FF] py-2.5 px-3 rounded-lg transition-colors"
              >
                Magnetic Power Banks
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-semibold py-2.5 px-3 rounded-lg transition-colors ${
                  pathname === '/track-order' ? 'bg-[#F6F5FF] text-[#FB2E86]' : 'text-[#151875] hover:bg-[#F6F5FF]'
                }`}
              >
                Track Order
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-base font-semibold text-[#151875] hover:bg-[#F6F5FF] py-2.5 px-3 rounded-lg transition-colors"
              >
                <Heart size={16} /> My Wishlist
              </Link>
            </nav>

            {/* Mobile Auth & Account Footer */}
            <div className="p-4 border-t border-[#E8E6F1] bg-[#F6F5FF] space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-[#151875] font-semibold px-2 py-1">
                    <User size={14} />
                    <span className="truncate">{user?.name} ({user?.email})</span>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#7E33E0] hover:bg-white rounded-lg transition-colors"
                    >
                      <Shield size={14} /> Admin Portal
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-xs font-medium text-[#151875] hover:bg-white rounded-lg transition-colors"
                  >
                    My Orders &amp; Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-center py-2.5 text-xs rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-center py-2.5 text-xs rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
