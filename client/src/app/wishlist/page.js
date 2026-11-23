'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getWishlist();
        if (res?.products) {
          setWishlist(res.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <Heart size={44} className="text-gray-300 mx-auto" strokeWidth={1.5} />
        <h1 className="text-2xl font-light text-black">Sign In to View Your Wishlist</h1>
        <p className="text-xs text-gray-500 font-light max-w-sm mx-auto">
          Save accessories you admire across devices and review them anytime.
        </p>
        <Link href="/login" className="btn-primary mt-4 inline-block">
          Sign In Now
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-gray-400">
        Loading saved accessories...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#E8E6F1] pb-6 flex justify-between items-baseline flex-wrap gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8FB9] font-medium">
            Saved For Later
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-josefin text-[#151875] tracking-tight mt-1">
            My Wishlist ({wishlist.length})
          </h1>
        </div>
        <Link href="/shop" className="text-xs sm:text-sm text-[#8A8FB9] hover:text-[#7E33E0] transition-colors">
          Browse Collection →
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="border border-[#E8E6F1] bg-[#F6F5FF] p-6 sm:p-12 text-center space-y-3 rounded-2xl">
          <p className="text-base sm:text-lg font-semibold font-josefin text-[#151875]">Your wishlist is currently empty.</p>
          <p className="text-xs sm:text-sm text-[#8A8FB9]">
            Click the heart icon on any accessory to save it here for later.
          </p>
          <Link href="/shop" className="btn-primary text-xs sm:text-sm mt-3 inline-block rounded-lg">
            Start Exploring
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {wishlist.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      )}
    </div>
  );
}
