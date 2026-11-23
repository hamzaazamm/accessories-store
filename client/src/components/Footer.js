'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BRANDING } from '../lib/branding';
import { api } from '../lib/api';
import { Facebook, Twitter, Instagram, Send, ShieldCheck, Truck, Headphones, Award } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    try {
      await api.subscribeNewsletter(email);
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#EEEFFB] text-[#8A8FB9] mt-12 sm:mt-20">
      {/* ── Main Footer Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">

          {/* Col 1 & 2: Brand & Newsletter */}
          <div className="sm:col-span-2 lg:col-span-2 space-y-4 sm:space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-josefin text-2xl sm:text-3xl font-bold tracking-tight text-[#151875]">
                Gadget<span className="text-[#FB2E86]">.</span>District
              </span>
            </Link>

            {/* Newsletter input with Hekto Pink Button */}
            <form onSubmit={handleSubscribe} className="flex flex-col xs:flex-row max-w-sm pt-1 gap-2 xs:gap-0">
              <input
                type="email"
                required
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-white border border-[#E8E6F1] xs:border-r-0 rounded-lg xs:rounded-r-none xs:rounded-l-lg focus:outline-none text-[#151875] placeholder-[#8A8FB9] min-h-[44px]"
              />
              <button
                type="submit"
                disabled={loading || subscribed}
                className="px-6 py-2.5 bg-[#FB2E86] text-white text-xs font-josefin font-semibold rounded-lg xs:rounded-l-none xs:rounded-r-lg hover:bg-[#e02575] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                {subscribed ? 'Joined' : loading ? '...' : 'Sign Up'}
              </button>
            </form>
            {subscribed && (
              <p className="text-[11px] text-green-700 font-medium">Thank you for subscribing to our newsletter!</p>
            )}

            <div className="text-xs space-y-1 pt-2 text-[#8A8FB9]">
              <p className="font-semibold text-[#151875]">Contact Info</p>
              <p>{BRANDING.contact.address}</p>
              <p>Email: {BRANDING.contact.email}</p>
              <p>Phone: {BRANDING.contact.phone}</p>
            </div>
          </div>

          {/* Col 3: Categories */}
          <div className="space-y-4">
            <h4 className="font-josefin text-lg font-bold text-[#151875]">
              Categories
            </h4>
            <ul className="space-y-2.5 text-xs font-lato">
              <li>
                <Link href="/shop?category=mobile-cases-and-covers" className="hover:text-[#FB2E86] transition-colors">
                  Cases &amp; Covers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=screen-protectors" className="hover:text-[#FB2E86] transition-colors">
                  Screen Protectors
                </Link>
              </li>
              <li>
                <Link href="/shop?category=chargers-and-adapters" className="hover:text-[#FB2E86] transition-colors">
                  GaN Fast Chargers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=wireless-earbuds-and-headphones" className="hover:text-[#FB2E86] transition-colors">
                  Wireless Earbuds
                </Link>
              </li>
              <li>
                <Link href="/shop?category=power-banks" className="hover:text-[#FB2E86] transition-colors">
                  Magnetic Power Banks
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Care */}
          <div className="space-y-4">
            <h4 className="font-josefin text-lg font-bold text-[#151875]">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs font-lato">
              <li>
                <Link href="/account" className="hover:text-[#FB2E86] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#FB2E86] transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#FB2E86] transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-[#FB2E86] transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#FB2E86] transition-colors">
                  Discounted Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Pages & Store */}
          <div className="space-y-4">
            <h4 className="font-josefin text-lg font-bold text-[#151875]">
              Pages
            </h4>
            <ul className="space-y-2.5 text-xs font-lato">
              <li>
                <Link href="/shop" className="hover:text-[#FB2E86] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?featured=true" className="hover:text-[#FB2E86] transition-colors">
                  Featured Items
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=popular" className="hover:text-[#FB2E86] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#FB2E86] transition-colors">
                  Customer Sign In
                </Link>
              </li>
              
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom Copyright Bar ── */}
      <div className="bg-[#E7E4F8] py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#9DA0AE]">
          <p>© 2026 {BRANDING.name} - All Rights Reserved</p>
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-[#151875] text-white flex items-center justify-center hover:bg-[#FB2E86] transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={13} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-[#151875] text-white flex items-center justify-center hover:bg-[#FB2E86] transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={13} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-[#151875] text-white flex items-center justify-center hover:bg-[#FB2E86] transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={13} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
