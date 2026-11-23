'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import { BRANDING } from '../../lib/branding';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    shippingFee,
    total,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const freeShippingThreshold = BRANDING.policies.freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <span className="text-5xl block">🛍️</span>
        <h1 className="text-3xl font-extralight text-black tracking-tight">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-gray-500 font-light max-w-sm mx-auto">
          Explore our minimal collection of leather cases, braided cables, and GaN fast chargers.
        </p>
        <Link href="/shop" className="btn-primary mt-4 inline-flex items-center gap-2">
          Discover Accessories <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

      {/* Header */}
      <div className="border-b border-[#E8E6F1] pb-6 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8FB9] font-medium">
            Checkout Review
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-josefin text-[#151875] tracking-tight mt-1">
            Shopping Bag ({itemCount})
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-[#8A8FB9] hover:text-[#FB2E86] transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Free Shipping Alert */}
      <div className="bg-[#F6F5FF] border border-[#E8E6F1] p-4 rounded-xl">
        {amountToFreeShipping > 0 ? (
          <p className="text-sm text-[#8A8FB9]">
            Add <span className="font-bold text-[#151875]">Rs. {Math.round(amountToFreeShipping).toLocaleString()}</span> more to unlock <span className="font-bold text-[#151875]">Free Standard Shipping</span>.
          </p>
        ) : (
          <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
            <ShieldCheck size={16} /> Free Standard Shipping unlocked on this order!
          </p>
        )}
        <div className="w-full bg-[#E8E6F1] h-2 mt-2 rounded-full overflow-hidden">
          <div className="bg-[#FB2E86] h-full transition-all duration-300" style={{ width: `${freeShippingProgress}%` }} />
        </div>
      </div>

      {/* Main Grid: Bag Items + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        {/* ── Left Column: Items Table ── */}
        <div className="lg:col-span-2 divide-y divide-[#E8E6F1] border-t border-b border-[#E8E6F1]">
          {items.map((item) => {
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
              <div key={id} className="py-4 sm:py-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                {/* Image & Info row on mobile */}
                <div className="flex gap-3 sm:gap-4 items-center w-full sm:w-auto flex-1 min-w-0">
                  <div className="relative w-18 h-18 sm:w-24 sm:h-24 bg-gray-50 border border-gray-200 shrink-0 overflow-hidden rounded-lg">
                    <Image src={imageSrc} alt={p.name || 'Product'} fill className="object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block truncate">
                      {p.brand}
                    </span>
                    <Link href={`/product/${p.slug || id}`} className="block">
                      <h3 className="text-sm font-medium text-black hover:underline line-clamp-2">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-gray-400 font-mono">SKU: {p.SKU || 'N/A'}</p>
                  </div>
                </div>

                {/* Qty & Price */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(id, item.quantity - 1)}
                      className="p-2 text-gray-500 hover:text-black min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="px-3 text-xs font-mono font-medium text-black">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(id, item.quantity + 1)}
                      className="p-2 text-gray-500 hover:text-black min-h-[36px] min-w-[36px] flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <div className="text-sm font-bold text-[#151875]">
                      Rs. {Math.round(price * item.quantity).toLocaleString()}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[10px] text-gray-400 font-light">
                        Rs. {Math.round(price).toLocaleString()} each
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right Column: Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="border border-[#E8E6F1] bg-[#F6F5FF] p-6 space-y-6 rounded-2xl sticky top-28">
            <h3 className="text-sm font-bold font-josefin text-[#151875] border-b border-[#E8E6F1] pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-[#8A8FB9]">
                <span>Subtotal ({itemCount} items)</span>
                <span className="text-[#151875] font-medium">Rs. {Math.round(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#8A8FB9]">
                <span>Estimated Shipping</span>
                <span className="text-[#151875] font-medium">
                  {shippingFee === 0 ? 'FREE' : `Rs. ${Math.round(shippingFee).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-[#8A8FB9]">
                <span>Estimated Taxes</span>
                <span className="text-[#151875] font-medium">Rs. 0</span>
              </div>

              <div className="pt-4 border-t border-[#E8E6F1] flex justify-between">
                <span className="text-[#151875] font-semibold">Total Due</span>
                <span className="font-bold text-xl text-[#FB2E86]">Rs. {Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link href="/checkout" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 rounded-lg">
                Proceed to Checkout <ArrowRight size={14} />
              </Link>
              <Link
                href="/shop"
                className="w-full text-center block text-sm text-[#8A8FB9] hover:text-[#7E33E0] pt-1 transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>

            <div className="pt-4 border-t border-[#E8E6F1] space-y-2 text-xs text-[#8A8FB9]">
              <p>✓ Cash on Delivery (COD) accepted at checkout</p>
              <p>✓ 30-Day Money Back Guarantee</p>
              <p>✓ Fast tracked door-to-door delivery</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
