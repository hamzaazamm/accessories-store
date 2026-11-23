'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PromotionalBanner() {
  return (
    <section className="my-10 sm:my-16 bg-[#F2F0FF] py-10 sm:py-20 relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute top-1/2 -right-16 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-[#ECD2FA]/40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 items-center">

          {/* Left: Product Highlight Image */}
          <div className="relative aspect-square max-w-xs sm:max-w-md mx-auto w-full flex items-center justify-center">
            <div className="w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-[#E0D3F5] absolute" />
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 sm:p-6">
              <Image
                src="https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&q=80"
                alt="BoostCharge Pro 3-in-1 MagSafe Dock"
                width={400}
                height={400}
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right: Hekto Promotional Features & Copy */}
          <div className="space-y-4 sm:space-y-6 text-left">
            <span className="text-xs uppercase tracking-wider font-josefin font-semibold text-[#FB2E86]">
              Trending Deal of the Month
            </span>

            <h2 className="font-josefin text-2xl sm:text-3xl lg:text-4xl font-bold text-[#151875] tracking-tight leading-snug">
              Unique Features Of Latest &amp; Trending Mobile Accessories
            </h2>

            <ul className="space-y-2.5 sm:space-y-3.5 text-xs sm:text-sm font-lato text-[#8A8FB9]">
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FB2E86] shrink-0 mt-1" />
                <span>All frames crafted with aerospace-grade anodized aluminum &amp; Horween leather.</span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B2BF5] shrink-0 mt-1" />
                <span>Reinforced double-braided nylon cords with 240W high-velocity GaN power transfer.</span>
              </li>
              <li className="flex items-start gap-2.5 sm:gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2BF5CC] shrink-0 mt-1" />
                <span>Certified MagSafe alignment with 15W peak wireless induction charging.</span>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-4 sm:gap-5 flex-wrap">
              <Link href="/shop" className="btn-primary">
                Add To Cart
              </Link>
              <div className="font-josefin">
                <p className="text-xs sm:text-sm font-bold text-[#151875]">BoostCharge Pro 3-in-1</p>
                <p className="text-xs sm:text-sm text-[#FB2E86] font-semibold">Rs. 13,499</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
