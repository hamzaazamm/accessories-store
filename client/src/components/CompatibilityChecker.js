'use client';

import React, { useState } from 'react';
import { api } from '../lib/api';
import { CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

export default function CompatibilityChecker({ productId, compatibilityList = [] }) {
  const [deviceInput, setDeviceInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Common quick-pick models
  const popularPhones = [
    'iPhone 16 Pro',
    'iPhone 16 Pro Max',
    'iPhone 15 Pro',
    'Samsung Galaxy S24 Ultra',
    'Google Pixel 9 Pro',
  ];

  const checkDevice = async (device) => {
    if (!device || !device.trim()) return;
    setLoading(true);
    try {
      const res = await api.checkCompatibility(productId, device.trim());
      setResult(res);
    } catch (err) {
      console.error(err);
      // Fallback local check
      const isCompat = compatibilityList.some((m) =>
        m.toLowerCase().includes(device.toLowerCase()) || device.toLowerCase().includes(m.toLowerCase())
      );
      setResult({
        isCompatible: isCompat,
        device,
        message: isCompat
          ? `Verified! Fully compatible with ${device}.`
          : `May not fit ${device}. Please review the certified models below.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    checkDevice(deviceInput);
  };

  return (
    <div className="border border-gray-200 bg-gray-50/50 p-5 rounded-sm space-y-4">
      <div className="flex items-center gap-2">
        <Smartphone size={16} className="text-gray-600" />
        <h4 className="text-xs uppercase tracking-[0.14em] font-medium text-black">
          Device Compatibility Checker
        </h4>
      </div>

      <p className="text-xs text-gray-500 font-light">
        Ensure this accessory fits your exact smartphone or smartwatch before purchase.
      </p>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. iPhone 16 Pro, Galaxy S24 Ultra..."
          value={deviceInput}
          onChange={(e) => setDeviceInput(e.target.value)}
          className="flex-1 px-3 py-2 text-xs bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={loading || !deviceInput.trim()}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-wider rounded-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? '...' : 'Check'}
        </button>
      </form>

      {/* Quick Select Chips */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
        <span className="text-gray-400 font-light">Quick Check:</span>
        {popularPhones.map((phone) => (
          <button
            key={phone}
            type="button"
            onClick={() => {
              setDeviceInput(phone);
              checkDevice(phone);
            }}
            className="px-2 py-0.5 bg-white border border-gray-200 rounded-sm hover:border-black text-gray-600 hover:text-black transition-colors"
          >
            {phone}
          </button>
        ))}
      </div>

      {/* Result Output */}
      {result && (
        <div
          className={`p-3 border rounded-sm flex items-start gap-2.5 text-xs ${
            result.isCompatible
              ? 'bg-green-50/60 border-green-200 text-green-900'
              : 'bg-amber-50/60 border-amber-200 text-amber-900'
          }`}
        >
          {result.isCompatible ? (
            <CheckCircle2 size={16} className="text-green-700 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-medium">{result.message}</p>
          </div>
        </div>
      )}

      {/* Full compatibility list */}
      {compatibilityList.length > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
            Certified Compatible Models:
          </span>
          <div className="flex flex-wrap gap-1">
            {compatibilityList.map((model, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-sm text-gray-700"
              >
                {model}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
