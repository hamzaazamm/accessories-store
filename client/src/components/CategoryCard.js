'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function CategoryCard({ category }) {
  if (!category) return null;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group block text-center p-1.5 sm:p-3 transition-transform duration-300"
    >
      {/* Circular / Rounded Hekto Category Container */}
      <div className="relative mx-auto w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-[#F6F5FF] mb-2 sm:mb-3 flex items-center justify-center border-2 border-transparent group-hover:border-[#7E33E0] shadow-xs sm:shadow-sm transition-all duration-300 overflow-hidden">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100px, 160px"
            className="object-cover p-1.5 sm:p-2 rounded-full group-hover:scale-108 transition-transform duration-500"
          />
        ) : (
          <div className="text-xl xs:text-2xl sm:text-3xl text-[#7E33E0]">
            {category.icon || '📱'}
          </div>
        )}

        {/* Subtle Hekto hover badge inside circle */}
        <div className="absolute inset-0 bg-[#7E33E0]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-[#08D15F] text-white text-[9px] sm:text-[10px] font-josefin font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-xs">
            Explore
          </span>
        </div>
      </div>

      <h3 className="font-josefin text-xs sm:text-sm font-semibold text-[#151875] group-hover:text-[#FB2E86] transition-colors line-clamp-2 leading-tight">
        {category.name}
      </h3>
    </Link>
  );
}
