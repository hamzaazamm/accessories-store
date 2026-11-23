'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { BRANDING } from '../lib/branding';

export default function CartDrawer() {
  const pathname = usePathname();
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Do not render cart drawer on admin routes
  if (pathname?.startsWith('/admin') || !isDrawerOpen) return null;

  const freeShippingThreshold = BRANDING.policies.freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-full sm:w-screen max-w-md bg-white border-l border-gray-200 flex flex-col shadow-2xl">

          {/* Drawer Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#E8E6F1] flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <h2 className="font-josefin text-base sm:text-lg font-bold text-[#151875]">
                Shopping Cart
              </h2>
              <span className="text-xs text-[#8A8FB9] font-lato">
                ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 text-[#8A8FB9] hover:text-[#FB2E86] focus:outline-none transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              aria-label="Close cart drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-[#F2F0FF] px-4 sm:px-6 py-3 border-b border-[#E8E6F1] text-xs">
            {amountToFreeShipping > 0 ? (
              <p className="text-[#151875] font-lato">
                Add <span className="font-bold text-[#FB2E86]">Rs. {Math.round(amountToFreeShipping).toLocaleString()}</span> more for <span className="font-semibold text-[#151875]">Free Shipping</span>.
              </p>
            ) : (
              <p className="text-green-700 font-medium flex items-center gap-1.5 font-lato">
                <ShieldCheck size={14} /> Free Standard Shipping unlocked!
              </p>
            )}
            <div className="w-full bg-[#E8E6F1] h-1.5 mt-2 rounded-full overflow-hidden">
              <div
                className="bg-[#FB2E86] h-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-gray-400 space-y-3">
                <span className="text-4xl">🛍️</span>
                <p className="text-sm font-light text-black">Your shopping bag is empty.</p>
                <p className="text-xs text-gray-400 max-w-xs">
                  Discover our minimal phone cases, chargers, and audio essentials.
                </p>
                <Link
                  href="/shop"
                  onClick={() => setIsDrawerOpen(false)}
                  className="btn-primary mt-4"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const p = item.product || {};
                const id = p._id || p.id || item.productId;
                const price =
                  item.price !== undefined
                    ? item.price
                    : p.salePrice !== null && p.salePrice < p.price
                    ? p.salePrice
                    : p.price || 0;

                const imageSrc =
                  p.images && p.images.length > 0
                    ? p.images[0]
                    : 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80';

                return (
                  <div key={id} className="py-4 flex gap-3 sm:gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border border-gray-200 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={imageSrc}
                        alt={p.name || 'Product'}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block truncate">
                        {p.brand}
                      </span>
                      <Link
                        href={`/product/${p.slug || id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className="block text-xs font-medium text-black hover:underline truncate"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-[#151875]">
                          Rs. {Math.round(price).toLocaleString()}
                        </span>
                        {p.salePrice && p.salePrice < p.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            Rs. {Math.round(p.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center border border-gray-200 rounded-sm">
                          <button
                            onClick={() => updateQuantity(id, item.quantity - 1)}
                            className="p-1.5 text-gray-500 hover:text-black min-h-[32px] min-w-[32px] flex items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="px-2 text-xs font-mono font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(id, item.quantity + 1)}
                            className="p-1.5 text-gray-500 hover:text-black min-h-[32px] min-w-[32px] flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Actions */}
          {items.length > 0 && (
            <div className="border-t border-[#E8E6F1] p-6 bg-white space-y-4">
              <div className="space-y-1.5 text-xs font-lato">
                <div className="flex justify-between text-[#8A8FB9]">
                  <span>Subtotal</span>
                  <span className="font-josefin font-bold text-[#151875]">Rs. {Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#8A8FB9]">
                  <span>Shipping Estimate</span>
                  <span className="font-semibold text-[#151875]">{shippingFee === 0 ? 'FREE' : `Rs. ${Math.round(shippingFee).toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#151875] pt-2 border-t border-[#F2F0FF]">
                  <span className="font-josefin">Estimated Total</span>
                  <span className="font-josefin text-[#FB2E86]">Rs. {Math.round(total).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full btn-primary text-center py-3 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={14} />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full btn-secondary text-center py-2.5 block text-xs"
                >
                  View Full Cart
                </Link>
              </div>

              <p className="text-[10px] text-center text-[#8A8FB9]">
                Taxes calculated at checkout · COD available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
