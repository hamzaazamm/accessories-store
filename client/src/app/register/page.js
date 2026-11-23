'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { BRANDING } from '../../lib/branding';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ name, email, password, phone });
      router.push('/shop');
    } catch (err) {
      setError(err.message || 'Unable to register account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5FF] flex items-center justify-center px-4 py-8 sm:py-16">
    <div className="w-full max-w-md space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A8FB9] font-medium">
          Join {BRANDING.name}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold font-josefin text-[#151875] tracking-tight">
          Create Your Account
        </h1>
        <p className="text-xs sm:text-sm text-[#8A8FB9]">
          Enjoy streamlined checkout, fast tracking, and saved device profiles.
        </p>
      </div>

      {error && (
        <div className="p-3 border border-[#FB2E86]/30 bg-[#FB2E86]/5 text-[#FB2E86] text-xs rounded-lg flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-[#E8E6F1] p-5 sm:p-8 rounded-2xl shadow-lg space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Miller"
            className="w-full px-4 py-2.5 min-h-[44px] text-sm bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] placeholder-[#8A8FB9] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
            Email Address *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-4 py-2.5 min-h-[44px] text-sm bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] placeholder-[#8A8FB9] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
            Phone Number (for order delivery)
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92 (300) 123-4567"
            className="w-full px-4 py-2.5 min-h-[44px] text-sm bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] placeholder-[#8A8FB9] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider text-[#8A8FB9] mb-1.5">
            Password (min 6 characters) *
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 text-sm bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg focus:outline-none focus:border-[#7E33E0] focus:ring-2 focus:ring-[#7E33E0]/10 text-[#151875] placeholder-[#8A8FB9] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3 text-sm font-semibold tracking-wide disabled:opacity-50 mt-2 rounded-lg"
        >
          {submitting ? 'Creating Account...' : 'Register Account'}
        </button>

        <div className="text-center pt-3 text-sm text-[#8A8FB9] border-t border-[#E8E6F1]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FB2E86] hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </form>
    </div>
    </div>
  );
}
