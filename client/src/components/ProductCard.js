'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, showToast } = useCart();
  const { isAuthenticated } = useAuth();

  if (!product) return null;

  const currentPrice =
    product.salePrice !== null && product.salePrice < product.price
      ? product.salePrice
      : product.price;

  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      const res = await api.toggleWishlist(product._id);
      showToast(res.message);
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stockQty < 1) {
      showToast('This product is currently out of stock.');
      return;
    }
    addToCart(product, 1);
  };

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80';

  return (
    <div className="group relative bg-white border border-[#E8E6F1] rounded-lg overflow-hidden hekto-card-shadow flex flex-col h-full transition-all duration-300">
      
      {/* ── Image Canvas Container (#F6F5FF) ── */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square w-full bg-[#F6F5FF] overflow-hidden flex items-center justify-center p-3 sm:p-6 block">
        {/* Quick Action Icons: Visible on touch/mobile, hover on desktop */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 sm:gap-2 z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:-translate-x-2 sm:group-hover:translate-x-0">
          <button
            onClick={handleQuickAdd}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#151875] hover:bg-[#FB2E86] hover:text-white shadow-md flex items-center justify-center transition-colors min-h-[32px] min-w-[32px] sm:min-h-0 sm:min-w-0"
            title="Add to cart"
            aria-label="Add to cart"
          >
            <ShoppingCart size={13} />
          </button>
          <button
            onClick={handleWishlistToggle}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#151875] hover:bg-[#FB2E86] hover:text-white shadow-md flex items-center justify-center transition-colors min-h-[32px] min-w-[32px] sm:min-h-0 sm:min-w-0"
            title="Add to wishlist"
            aria-label="Add to wishlist"
          >
            <Heart size={13} />
          </button>
        </div>

        {/* Discount / Tag Pill */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#FB2E86] text-white text-[9px] sm:text-[10px] font-josefin font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-xs z-10">
            Sale
          </span>
        )}

        {/* Product Image */}
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-500"
        />

        {/* Bottom Hover "View Details" Pill */}
        <div className="hidden sm:flex absolute bottom-3 inset-x-0 justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="bg-[#08D15F] hover:bg-[#06b852] text-white text-[11px] font-josefin font-semibold px-3 py-1 rounded-[2px] shadow-sm">
            View Details
          </span>
        </div>
      </Link>

      {/* ── Product Info Block ── */}
      <div className="p-2.5 sm:p-4 text-center flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2 bg-white">
        <div>
          {/* Hekto Signature Color Palette Dots */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1">
            <span className="w-2 h-0.5 sm:w-2.5 sm:h-1 rounded-full bg-[#05E6B7]" />
            <span className="w-2 h-0.5 sm:w-2.5 sm:h-1 rounded-full bg-[#FB2E86]" />
            <span className="w-2 h-0.5 sm:w-2.5 sm:h-1 rounded-full bg-[#00009D]" />
          </div>

          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-josefin text-xs sm:text-sm md:text-base font-bold text-[#151875] group-hover:text-[#FB2E86] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          <p className="text-[10px] sm:text-xs text-[#8A8FB9] font-lato mt-0.5 font-medium truncate">
            {product.brand} · {product.SKU || 'GD-ITEM'}
          </p>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 pt-1 flex-wrap">
          <span className="font-josefin text-xs sm:text-sm md:text-base font-bold text-[#151875]">
            Rs. {Math.round(currentPrice).toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="font-josefin text-[10px] sm:text-xs text-[#FB2E86] line-through font-medium">
              Rs. {Math.round(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
