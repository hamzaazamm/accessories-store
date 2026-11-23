'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { BRANDING } from '../../../lib/branding';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(email, password);
      if (res?.user?.role !== 'admin') {
        logout();
        setError('Access denied. This portal is restricted to administrators only.');
        return;
      }
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Invalid administrator email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-sm mb-2">
          <Shield size={24} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-base font-light tracking-[0.2em] uppercase text-black font-semibold">
            {BRANDING.name}
          </span>
          <span className="bg-black text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-mono">
            Admin Portal
          </span>
        </div>
        <h1 className="text-xl font-light text-gray-800 tracking-tight">
          Internal Management Console
        </h1>
        <p className="text-xs text-gray-500 font-light">
          Authorized personnel access only. All actions are logged.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md px-0 sm:px-4">
        <div className="bg-white border border-gray-200 py-6 sm:py-8 px-5 sm:px-10 shadow-sm rounded-sm space-y-6">

          {error && (
            <div className="p-3 border border-red-200 bg-red-50 text-red-800 text-xs rounded-sm flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-600 font-medium mb-1">
                Admin Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-gray-600 font-medium mb-1">
                Master Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-sm focus:outline-none focus:border-black text-black"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-xs uppercase tracking-wider disabled:opacity-50 mt-2"
            >
              {submitting ? 'Verifying Credentials...' : 'Authenticate & Enter'}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-gray-100">
            <Link
              href="/"
              className="text-gray-500 hover:text-black text-xs font-light inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={12} /> Return to Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
