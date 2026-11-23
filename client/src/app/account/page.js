
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Package, User, MapPin, ExternalLink, ArrowRight } from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address edit state
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setPostalCode(user.address?.postalCode || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        const res = await api.getMyOrders();
        if (res?.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-2xl font-bold font-josefin text-[#151875]">Sign In Required</h1>
        <p className="text-sm text-[#8A8FB9]">Please sign in to view your orders and profile information.</p>
        <Link href="/login" className="btn-primary mt-4 inline-block rounded-lg">
          Sign In
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        phone,
        address: { street, city, postalCode, country: 'United States' },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">

      {/* Header */}
      <div className="border-b border-[#E8E6F1] pb-6 flex justify-between items-baseline flex-wrap gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8FB9] font-medium">
            Customer Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-josefin text-[#151875] tracking-tight mt-1">
            Hello, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#8A8FB9] break-all">{user?.email}</p>
        </div>

        <button
          onClick={logout}
          className="text-xs sm:text-sm text-[#FB2E86] hover:text-[#d4206e] transition-colors font-medium min-h-[44px] flex items-center"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Left 2 Columns: Order History ── */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold font-josefin text-[#151875] border-b border-[#E8E6F1] pb-3">
            Order History ({orders.length})
          </h3>

          {loading ? (
            <p className="text-sm text-[#8A8FB9]">Loading your past orders...</p>
          ) : orders.length === 0 ? (
            <div className="border border-[#E8E6F1] bg-[#F6F5FF] p-10 text-center space-y-3 rounded-2xl">
              <Package size={32} className="text-[#8A8FB9] mx-auto" />
              <p className="text-sm font-semibold text-[#151875]">No past orders found.</p>
              <Link href="/shop" className="btn-primary text-sm inline-block rounded-lg">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord._id} className="border border-[#E8E6F1] bg-white p-5 space-y-4 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start border-b border-[#E8E6F1] pb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#151875]">{ord.orderNumber}</span>
                      <p className="text-xs text-[#8A8FB9] mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString()} · {ord.items.length} items
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 font-semibold rounded-lg ${
                        ord.orderStatus === 'Delivered'
                          ? 'bg-green-100 text-green-800'
                          : ord.orderStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-[#7E33E0] text-white'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </div>

                  <div className="text-xs text-[#8A8FB9] space-y-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{it.quantity}x {it.name}</span>
                        <span className="text-[#151875] font-medium">Rs. {Math.round(it.price * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#E8E6F1] flex justify-between items-center text-sm">
                    <span className="font-bold text-[#151875]">Total: Rs. {Math.round(ord.totalAmount).toLocaleString()}</span>
                    <Link
                      href={`/track-order?orderNumber=${ord.orderNumber}`}
                      className="text-[#FB2E86] hover:underline font-medium text-xs flex items-center gap-1"
                    >
                      Live Tracking <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column: Saved Delivery Address ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-[#E8E6F1] bg-[#F6F5FF] p-4 sm:p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold font-josefin text-[#151875] border-b border-[#E8E6F1] pb-3">
              Delivery Address
            </h3>

            {savedSuccess && (
              <p className="text-xs text-green-700 font-medium">Address updated successfully.</p>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3 text-sm">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-white border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-white border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-white border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-white border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] transition-colors"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 min-h-[44px] text-sm font-semibold rounded-lg">
                Save Address
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
