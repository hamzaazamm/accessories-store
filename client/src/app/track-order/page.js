'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { Search, Package, CheckCircle2, Clock, Truck, Home, AlertCircle } from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-search if orderNumber is in URL
  useEffect(() => {
    if (initialOrderNumber) {
      performTracking(initialOrderNumber, '');
    }
  }, [initialOrderNumber]);

  const performTracking = async (num, tel) => {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await api.trackOrder(num.trim(), tel.trim());
      if (res?.order) {
        setOrder(res.order);
      }
    } catch (err) {
      setError(err.message || 'No order found with the provided details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    performTracking(orderNumber, phone);
  };

  // Stepper statuses
  const statuses = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
  ];

  const getStatusIndex = (status) => {
    const idx = statuses.indexOf(status);
    return idx > -1 ? idx : 0;
  };

  const isCancelled = order?.orderStatus === 'Cancelled';
  const currentStep = order ? getStatusIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8FB9] font-medium">
          Live Dispatch Tracker
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-josefin text-[#151875] tracking-tight">
          Track Your Order
        </h1>
        <p className="text-sm text-[#8A8FB9]">
          Enter your Order Number (e.g. GD-2026-XXXXX) and phone number to monitor real-time fulfillment and transit status.
        </p>
      </div>

      {/* Tracking Form */}
      <form onSubmit={handleTrackSubmit} className="max-w-2xl mx-auto border border-[#E8E6F1] bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. GD-2026-A1092"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] uppercase font-mono placeholder-[#8A8FB9] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
              Phone Number (Optional verification)
            </label>
            <input
              type="tel"
              placeholder="+92 (300) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] placeholder-[#8A8FB9] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-sm font-semibold tracking-wide rounded-lg min-h-[44px]"
        >
          {loading ? 'Searching Package...' : 'Track Package'}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 border border-[#FB2E86]/30 bg-[#FB2E86]/5 text-[#FB2E86] text-xs sm:text-sm rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Progress Card */}
      {order && (
        <div className="max-w-3xl mx-auto border border-[#E8E6F1] bg-white p-4 sm:p-8 space-y-6 sm:space-y-8 rounded-xl sm:rounded-2xl shadow-lg">

          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-[#E8E6F1] gap-3 sm:gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8A8FB9] font-medium block">
                Order Number
              </span>
              <span className="font-bold font-josefin text-[#151875] text-base sm:text-lg">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8A8FB9] font-medium block">
                Current Status
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider mt-1 ${
                  isCancelled
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : order.orderStatus === 'Delivered'
                    ? 'bg-green-100 text-green-900 border border-green-200'
                    : 'bg-[#FB2E86] text-white'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>


          {/* Stepper Progress Bar */}
          {!isCancelled ? (
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-1 sm:gap-2 text-center">
                {statuses.map((step, idx) => (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-mono transition-colors ${
                        idx < currentStep
                          ? 'bg-[#7E33E0] text-white'
                          : idx === currentStep
                          ? 'bg-[#FB2E86] text-white'
                          : 'bg-[#F6F5FF] text-[#8A8FB9] border border-[#E8E6F1]'
                      }`}
                    >
                      {idx < currentStep ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[8px] sm:text-[9px] uppercase tracking-wider mt-1.5 hidden sm:block ${
                        idx <= currentStep ? 'text-[#151875] font-semibold' : 'text-[#8A8FB9]'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* Progress Line */}
              <div className="w-full bg-[#E8E6F1] h-1.5 sm:h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#FB2E86] h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (currentStep / (statuses.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Mobile current step label */}
              <div className="sm:hidden text-center text-xs text-[#151875] font-semibold">
                Step {currentStep + 1} of {statuses.length}: <span className="text-[#FB2E86]">{statuses[currentStep]}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-sm">
              This order has been cancelled. If you believe this is an error, please contact customer support.
            </div>
          )}

          {/* Tracking History Log */}
          {order.trackingHistory && order.trackingHistory.length > 0 && (
            <div className="pt-6 border-t border-gray-200 space-y-3">
              <h4 className="text-xs uppercase tracking-[0.18em] font-medium text-black">
                Tracking Activity Log
              </h4>
              <div className="space-y-3 divide-y divide-gray-100">
                {order.trackingHistory
                  .slice()
                  .reverse()
                  .map((log, i) => (
                    <div key={i} className="pt-3 flex justify-between items-start text-xs font-light">
                      <div>
                        <span className="font-medium text-black block">{log.status}</span>
                        <p className="text-gray-500">{log.note}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-4">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Delivery & Items Summary */}
          <div className="pt-6 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-light">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block mb-1">
                Recipient
              </span>
              <p className="font-medium text-black">{order.customer.name}</p>
              <p className="text-gray-500">{order.customer.city}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block mb-1">
                Total Amount Due
              </span>
              <p className="font-medium text-black text-sm">Rs. {Math.round(order.totalAmount).toLocaleString()}</p>
              <p className="text-gray-500 font-mono text-[10px]">Method: {order.paymentMethod}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
