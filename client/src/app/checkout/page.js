'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { ShieldCheck, Truck, Lock, AlertCircle } from 'lucide-react';
import { BRANDING } from '../../lib/branding';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, total, clearCart, showToast } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address?.street || '',
    city: user?.address?.city || '',
    postalCode: user?.address?.postalCode || '',
    deliveryNotes: '',
    paymentMethod: 'COD',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-light text-black">Your bag is empty</h2>
        <p className="text-xs text-gray-500">Please add products to your bag before proceeding to checkout.</p>
        <Link href="/shop" className="btn-primary mt-4">
          Browse Accessories
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.postalCode
    ) {
      setErrorMessage('Please complete all delivery information fields.');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          deliveryNotes: formData.deliveryNotes,
        },
        items: items.map((i) => ({
          productId: i.product?._id || i.product?.id || i.productId,
          quantity: i.quantity,
          name: i.product?.name,
        })),
        paymentMethod: formData.paymentMethod,
        deliveryNotes: formData.deliveryNotes,
      };

      const res = await api.createOrder(orderPayload);
      if (res?.order) {
        clearCart();
        router.push(`/order-confirmation/${res.order.orderNumber}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while creating your order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

      {/* Header */}
      <div className="border-b border-[#E8E6F1] pb-6">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8FB9] font-medium">
          Step 2 of 2
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-josefin text-[#151875] tracking-tight mt-1">
          Secure Checkout
        </h1>
        <p className="text-sm text-[#8A8FB9] mt-1">
          Complete your delivery details to place your order with Cash on Delivery.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 border border-[#FB2E86]/30 bg-[#FB2E86]/5 text-[#FB2E86] text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2-Column Checkout Layout */}
      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        {/* ── Left Column: Delivery Form + Payment ── */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">

          {/* Delivery Information */}
          <div className="border border-[#E8E6F1] bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4">
            <h3 className="text-sm font-bold font-josefin text-[#151875] border-b border-[#E8E6F1] pb-3">
              1. Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Miller"
                  className="w-full px-3 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Phone Number (for order delivery &amp; tracking) *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92 (300) 123-4567"
                  className="w-full px-3 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lahore / Karachi / Islamabad"
                  className="w-full px-3 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Street Address &amp; Apartment / Suite *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Main Boulevard, Gulberg III, House 12"
                  className="w-full px-3 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="54000"
                  className="w-full px-3 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="Pakistan"
                  className="w-full px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-sm text-gray-700 font-medium cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  name="deliveryNotes"
                  rows={2}
                  value={formData.deliveryNotes}
                  onChange={handleChange}
                  placeholder="Gate code, leave on porch, ring doorbell, etc."
                  className="w-full px-3 py-2 text-xs bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] text-[#151875] placeholder-[#8A8FB9] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-[#E8E6F1] bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-4">
            <h3 className="text-sm font-bold font-josefin text-[#151875] border-b border-[#E8E6F1] pb-3">
              2. Payment Method
            </h3>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3.5 sm:p-4 border border-[#7E33E0] bg-[#F6F5FF] rounded-xl cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                  className="mt-1 accent-[#7E33E0]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#151875]">
                      Cash on Delivery (COD)
                    </span>
                    <span className="bg-[#FB2E86] text-white text-[9px] uppercase px-2 py-0.5 font-semibold rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8FB9] mt-1">
                    Pay with cash or card directly to the courier agent upon physical package delivery.
                  </p>
                </div>
              </label>

              {/* Extensible Future Gateway Slot */}
              <div className="p-3.5 sm:p-4 border border-[#E8E6F1] bg-[#F6F5FF]/50 rounded-xl opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#8A8FB9]">
                    Credit / Debit Card (Online Gateway)
                  </span>
                  <span className="text-[10px] text-[#8A8FB9]">Available Soon</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right Column: Order Review & Confirmation Button ── */}
        <div className="lg:col-span-1">
          <div className="border border-[#E8E6F1] bg-[#F6F5FF] p-4 sm:p-6 space-y-6 rounded-xl sm:rounded-2xl lg:sticky lg:top-28">
            <h3 className="text-sm font-bold font-josefin text-[#151875] border-b border-[#E8E6F1] pb-3">
              Order Summary
            </h3>

            {/* Mini Items List */}
            <div className="divide-y divide-[#E8E6F1] max-h-56 overflow-y-auto pr-1">
              {items.map((item) => {
                const p = item.product || {};
                const id = p._id || p.id || item.productId;
                const price =
                  item.price !== undefined
                    ? item.price
                    : p.salePrice !== null && p.salePrice < p.price
                    ? p.salePrice
                    : p.price || 0;

                return (
                  <div key={id} className="py-2.5 flex justify-between items-center text-xs">
                    <div className="pr-2 truncate">
                      <span className="font-light text-black truncate block">{p.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Qty: {item.quantity} · SKU: {p.SKU || 'N/A'}
                      </span>
                    </div>
                    <span className="font-light text-black shrink-0">
                      Rs. {Math.round(price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-[#E8E6F1] text-sm">
              <div className="flex justify-between text-[#8A8FB9]">
                <span>Subtotal</span>
                <span className="text-[#151875] font-medium">Rs. {Math.round(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#8A8FB9]">
                <span>Shipping</span>
                <span className="text-[#151875] font-medium">
                  {shippingFee === 0 ? 'FREE' : `Rs. ${Math.round(shippingFee).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#E8E6F1]">
                <span className="text-[#151875] font-semibold">Total Payable</span>
                <span className="font-bold text-xl text-[#FB2E86]">Rs. {Math.round(total).toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-4 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
            >
              {submitting ? 'Securing Order...' : `Place Order · Rs. ${Math.round(total).toLocaleString()}`}
            </button>

            <div className="space-y-1.5 text-xs text-[#8A8FB9] text-center">
              <p className="flex items-center justify-center gap-1">
                <Lock size={11} /> 256-bit encrypted checkout
              </p>
              <p>You will receive instant SMS &amp; email order tracking details.</p>
            </div>
          </div>
        </div>

      </form>

    </div>
  );
}
