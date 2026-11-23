'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../lib/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import PromotionalBanner from '../components/PromotionalBanner';
import { BRANDING } from '../lib/branding';
import { INITIAL_CATEGORIES, INITIAL_FEATURED_PRODUCTS, INITIAL_BEST_SELLERS } from '../lib/initialData';
import { Truck, RotateCcw, Award, ShieldCheck, ArrowRight, Star, Headphones } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [featuredProducts, setFeaturedProducts] = useState(INITIAL_FEATURED_PRODUCTS);
  const [bestSellers, setBestSellers] = useState(INITIAL_BEST_SELLERS);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catRes, featRes, bestRes, trendRes] = await Promise.allSettled([
          api.getCategories(),
          api.getProducts({ featured: 'true', limit: 4 }),
          api.getProducts({ bestSeller: 'true', limit: 4 }),
          api.getProducts({ trending: 'true', limit: 4 }),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.categories?.length > 0) {
          setCategories(catRes.value.categories);
        }
        if (featRes.status === 'fulfilled' && featRes.value?.products?.length > 0) {
          setFeaturedProducts(featRes.value.products);
        } else {
          try {
            const fallbackRes = await api.getProducts({ limit: 4 });
            if (fallbackRes?.products?.length > 0) {
              setFeaturedProducts(fallbackRes.products);
            }
          } catch (e) {}
        }
        if (bestRes.status === 'fulfilled' && bestRes.value?.products?.length > 0) {
          setBestSellers(bestRes.value.products);
        }
        if (trendRes.status === 'fulfilled' && trendRes.value?.products?.length > 0) {
          setTrendingProducts(trendRes.value.products);
        }
      } catch (err) {
        console.error('Failed loading home data from server:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-12 sm:space-y-20 lg:space-y-24">

      {/* ── 1. Hekto Signature Hero Section ── */}
      <section className="bg-[#F2F0FF] py-10 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Decorative soft circles */}
        <div className="absolute top-10 left-10 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#ECD2FA]/30 pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-[#ECD2FA]/40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-left">
              <span className="font-lato text-xs sm:text-sm md:text-base font-bold text-[#FB2E86] uppercase tracking-wider block">
                Best Accessories For Your Digital Life...
              </span>

              <h1 className="font-josefin text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-[#151875] tracking-tight leading-[1.15]">
                New Mobile Gear &amp; Trends Collection 2026
              </h1>

              <p className="font-lato text-sm sm:text-base md:text-lg text-[#8A8FB9] max-w-xl leading-relaxed">
                Precision-engineered phone protection, ultra-fast GaN charging blocks, and studio-grade audio crafted for everyday excellence.
              </p>

              <div className="pt-2 flex items-center gap-3 sm:gap-4 flex-wrap">
                <Link href="/shop" className="btn-primary">
                  Shop Now
                </Link>
                <Link href="/shop?category=mobile-cases-and-covers" className="btn-secondary">
                  Explore Cases
                </Link>
              </div>
            </div>

            {/* Right Hero Product Card Showcase */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
              <div className="w-56 h-56 xs:w-64 xs:h-64 sm:w-80 sm:h-80 rounded-full bg-[#ECD2FA]/60 absolute" />
              <div className="w-48 h-48 xs:w-56 xs:h-56 sm:w-72 sm:h-72 rounded-full bg-[#E0D3F5] absolute" />

              {/* Floating 50% Off Badge */}
              <div className="absolute top-2 right-2 sm:top-6 sm:right-6 bg-[#00C1FE] text-white font-josefin font-bold text-xs sm:text-sm w-12 h-12 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-lg z-20 transform rotate-12">
                <span>50%</span>
                <span className="text-[9px] uppercase -mt-1 font-semibold">Off</span>
              </div>

              <div className="relative z-10 w-full aspect-square max-w-xs sm:max-w-sm flex items-center justify-center p-4">
                <Image
                  src="https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&q=80"
                  alt="Gadget District Hero Showcase"
                  width={380}
                  height={380}
                  priority
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. Featured Products Section ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10 space-y-1 sm:space-y-2">
          <h2 className="font-josefin text-2xl sm:text-3xl lg:text-5xl font-bold text-[#151875]">
            Featured Products
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8FB9] font-lato">
            Hand-picked customer favorites engineered with certified materials
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* ── 3. What Gadget District Offers (Hekto 4-Column Feature Boxes) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10 space-y-1 sm:space-y-2">
          <h2 className="font-josefin text-2xl sm:text-3xl lg:text-5xl font-bold text-[#151875]">
            What We Offer!
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8FB9] font-lato">
            Built for reliability and guaranteed satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-[#E8E6F1] p-5 sm:p-8 text-center rounded-lg hekto-card-shadow space-y-2 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#FFF6FB] text-[#FB2E86] flex items-center justify-center">
              <Truck size={24} />
            </div>
            <h4 className="font-josefin text-base sm:text-lg font-bold text-[#151875]">Free Delivery</h4>
            <p className="text-xs text-[#8A8FB9] font-lato leading-relaxed">
              Enjoy free tracked shipping on all orders over Rs. 2,000 across Pakistan.
            </p>
          </div>

          <div className="bg-white border border-[#E8E6F1] p-5 sm:p-8 text-center rounded-lg hekto-card-shadow space-y-2 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#F3F0FE] text-[#7E33E0] flex items-center justify-center">
              <RotateCcw size={24} />
            </div>
            <h4 className="font-josefin text-base sm:text-lg font-bold text-[#151875]">30 Days Return</h4>
            <p className="text-xs text-[#8A8FB9] font-lato leading-relaxed">
              Hassle-free 30-day exchange or refund if you change your mind.
            </p>
          </div>

          <div className="bg-white border border-[#E8E6F1] p-5 sm:p-8 text-center rounded-lg hekto-card-shadow space-y-2 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#E8F8FD] text-[#00C1FE] flex items-center justify-center">
              <Award size={24} />
            </div>
            <h4 className="font-josefin text-base sm:text-lg font-bold text-[#151875]">12-Mo Warranty</h4>
            <p className="text-xs text-[#8A8FB9] font-lato leading-relaxed">
              Official manufacturer warranty against material and technical defects.
            </p>
          </div>

          <div className="bg-white border border-[#E8E6F1] p-5 sm:p-8 text-center rounded-lg hekto-card-shadow space-y-2 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-[#FFF9EC] text-[#FFA800] flex items-center justify-center">
              <Headphones size={24} />
            </div>
            <h4 className="font-josefin text-base sm:text-lg font-bold text-[#151875]">24/7 Support</h4>
            <p className="text-xs text-[#8A8FB9] font-lato leading-relaxed">
              Dedicated phone and email support ready to assist you any time.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Promotional Architectural Banner ── */}
      <PromotionalBanner />

      {/* ── 5. Shop by Category (Hekto Circular Category Capsules) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-10 space-y-1 sm:space-y-2">
          <h2 className="font-josefin text-2xl sm:text-3xl lg:text-5xl font-bold text-[#151875]">
            Top Categories
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8FB9] font-lato">
            Explore curated accessories organized by department
          </p>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat._id || cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* ── 6. Best-Selling Products ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-6 sm:mb-8 pb-3 border-b border-[#E8E6F1]">
          <div>
            <h2 className="font-josefin text-xl sm:text-2xl lg:text-4xl font-bold text-[#151875]">
              Best Selling Accessories
            </h2>
            <p className="text-xs text-[#8A8FB9] font-lato mt-0.5">
              Top trending devices chosen by thousands of happy customers
            </p>
          </div>
          <Link
            href="/shop?sort=popular"
            className="text-xs font-josefin font-semibold text-[#FB2E86] hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            View All <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((prod) => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

    </div>
  );
}
