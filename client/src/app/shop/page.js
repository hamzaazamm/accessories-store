'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import { Filter, SlidersHorizontal, RotateCcw, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters state initialized from URL params
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter values
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentInStock = searchParams.get('inStock') === 'true';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Local inputs
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Update URL helper
  const updateQuery = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/shop?${params.toString()}`);
  };

  // Load Categories & Brands
  useEffect(() => {
    Promise.allSettled([api.getCategories(), api.getBrands()]).then(([catRes, brandRes]) => {
      if (catRes.status === 'fulfilled' && catRes.value?.categories) {
        setCategories(catRes.value.categories);
      }
      if (brandRes.status === 'fulfilled' && brandRes.value?.brands) {
        setBrands(brandRes.value.brands);
      }
    });
  }, []);

  // Fetch filtered products
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: 12,
          sort: currentSort,
        };

        if (currentSearch) queryParams.search = currentSearch;
        if (currentCategory) queryParams.category = currentCategory;
        if (currentBrand) queryParams.brand = currentBrand;
        if (currentInStock) queryParams.inStock = 'true';
        if (currentMinPrice) queryParams.minPrice = currentMinPrice;
        if (currentMaxPrice) queryParams.maxPrice = currentMaxPrice;

        const res = await api.getProducts(queryParams);
        if (res?.products) {
          setProducts(res.products);
          setTotalProducts(res.total || 0);
          setTotalPages(res.pages || 1);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [
    currentCategory,
    currentBrand,
    currentSearch,
    currentSort,
    currentInStock,
    currentMinPrice,
    currentMaxPrice,
    currentPage,
  ]);

  const handlePriceApply = (e) => {
    e.preventDefault();
    updateQuery({ minPrice: minPriceInput, maxPrice: maxPriceInput, page: 1 });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ search: searchInput, page: 1 });
  };

  const resetFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/shop');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page Header ── */}
      <div className="border-b border-[#E8E6F1] pb-8 mb-8">
        <span className="font-lato text-xs uppercase tracking-wider text-[#FB2E86] font-bold">
          The Full Collection
        </span>
        <h1 className="font-josefin text-3xl sm:text-4xl font-bold text-[#151875] tracking-tight mt-1">
          {currentCategory
            ? categories.find((c) => c.slug === currentCategory)?.name || 'Accessories'
            : currentSearch
            ? `Search Results for "${currentSearch}"`
            : 'All Mobile Accessories'}
        </h1>
        <p className="text-xs text-[#8A8FB9] font-lato mt-1">
          Showing {totalProducts} curated products designed with minimal elegance and durability.
        </p>
      </div>

      {/* ── Top Filter & Sort Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E6F1] text-xs">
        {/* Search inside shop */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by name, SKU, or brand..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-[#F6F5FF] border border-[#E8E6F1] rounded-[4px] focus:outline-none focus:border-[#7E33E0] text-xs text-[#151875]"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-[#8A8FB9]" />
        </form>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-[#E8E6F1] rounded-[4px] text-[#151875] font-josefin font-semibold text-xs"
          >
            <SlidersHorizontal size={13} />
            Filters
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[#8A8FB9] text-xs hidden sm:inline font-lato">
              Sort By:
            </span>
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
              className="px-3 py-2 bg-white border border-[#E8E6F1] rounded-[4px] text-xs font-lato focus:outline-none focus:border-[#7E33E0] text-[#151875]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Popularity &amp; Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Content Layout: Sidebar + Product Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">

        {/* ── Mobile Filter Modal Drawer (when mobileFilterOpen is true) ── */}
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Body */}
            <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
              <div className="p-4 border-b border-[#E8E6F1] flex items-center justify-between bg-[#F6F5FF]">
                <h3 className="font-josefin text-base font-bold text-[#151875] flex items-center gap-2">
                  <SlidersHorizontal size={16} /> Filters
                </h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-2 text-[#151875] hover:text-[#FB2E86] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-6 flex-1 overflow-y-auto">
                {/* Active Filters Reset */}
                {(currentCategory || currentBrand || currentSearch || currentInStock || currentMinPrice || currentMaxPrice) && (
                  <div className="pb-3 border-b border-[#F2F0FF] flex items-center justify-between">
                    <span className="font-josefin text-xs font-bold text-[#151875]">Active Filters</span>
                    <button
                      onClick={() => {
                        resetFilters();
                        setMobileFilterOpen(false);
                      }}
                      className="text-xs text-[#FB2E86] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw size={11} /> Clear All
                    </button>
                  </div>
                )}

                {/* Category Filter */}
                <div className="space-y-2">
                  <h4 className="font-josefin text-sm font-bold text-[#151875]">Categories</h4>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                    <button
                      onClick={() => {
                        updateQuery({ category: '', page: 1 });
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-2 rounded-md transition-colors ${
                        !currentCategory ? 'bg-[#F6F5FF] text-[#FB2E86] font-bold' : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => {
                          updateQuery({ category: cat.slug, page: 1 });
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left text-xs py-2 px-2 rounded-md transition-colors ${
                          currentCategory === cat.slug
                            ? 'bg-[#F6F5FF] text-[#FB2E86] font-bold'
                            : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                        }`}
                      >
                        <span className="truncate block">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2 pt-4 border-t border-[#F2F0FF]">
                  <h4 className="font-josefin text-sm font-bold text-[#151875]">Brands</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        updateQuery({ brand: '', page: 1 });
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-2 rounded-md transition-colors ${
                        !currentBrand ? 'bg-[#F6F5FF] text-[#FB2E86] font-bold' : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                      }`}
                    >
                      All Brands
                    </button>
                    {brands.map((b) => (
                      <button
                        key={b.slug}
                        onClick={() => {
                          updateQuery({ brand: b.name, page: 1 });
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left text-xs py-2 px-2 rounded-md transition-colors ${
                          currentBrand.toLowerCase() === b.name.toLowerCase()
                            ? 'bg-[#F6F5FF] text-[#FB2E86] font-bold'
                            : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2 pt-4 border-t border-[#F2F0FF]">
                  <h4 className="font-josefin text-sm font-bold text-[#151875]">Price Range (Rs.)</h4>
                  <form
                    onSubmit={(e) => {
                      handlePriceApply(e);
                      setMobileFilterOpen(false);
                    }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPriceInput}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                        className="w-1/2 px-2.5 py-2 text-xs bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg text-[#151875]"
                      />
                      <span className="text-[#8A8FB9]">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPriceInput}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                        className="w-1/2 px-2.5 py-2 text-xs bg-[#F6F5FF] border border-[#E8E6F1] rounded-lg text-[#151875]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#FB2E86] text-white font-josefin font-semibold rounded-lg text-xs"
                    >
                      Apply Range
                    </button>
                  </form>
                </div>

                {/* Availability Toggle */}
                <div className="pt-4 border-t border-[#F2F0FF]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#151875] font-lato">
                    <input
                      type="checkbox"
                      checked={currentInStock}
                      onChange={(e) => {
                        updateQuery({ inStock: e.target.checked ? 'true' : '', page: 1 });
                        setMobileFilterOpen(false);
                      }}
                      className="rounded border-[#E8E6F1] text-[#FB2E86] focus:ring-[#FB2E86] accent-[#FB2E86]"
                    />
                    <span className="font-medium">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Desktop Filter Sidebar ── */}
        <aside className="hidden lg:block lg:col-span-1 space-y-8 pr-4 border-r border-[#E8E6F1]">
          {/* Active Filters Reset */}
          {(currentCategory || currentBrand || currentSearch || currentInStock || currentMinPrice || currentMaxPrice) && (
            <div className="pb-4 border-b border-[#F2F0FF] flex items-center justify-between">
              <span className="font-josefin text-xs font-bold text-[#151875]">
                Active Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-xs text-[#FB2E86] hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw size={11} /> Clear All
              </button>
            </div>
          )}

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="font-josefin text-base font-bold text-[#151875]">
              Categories
            </h4>
            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
              <button
                onClick={() => updateQuery({ category: '', page: 1 })}
                className={`w-full text-left text-xs py-1 transition-colors ${
                  !currentCategory ? 'text-[#FB2E86] font-bold' : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => updateQuery({ category: cat.slug, page: 1 })}
                  className={`w-full text-left text-sm py-1.5 transition-colors flex justify-between items-center ${
                    currentCategory === cat.slug
                      ? 'text-[#FB2E86] font-bold underline'
                      : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-3 pt-6 border-t border-[#F2F0FF]">
            <h4 className="font-josefin text-base font-bold text-[#151875]">
              Brands
            </h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateQuery({ brand: '', page: 1 })}
                className={`w-full text-left text-xs py-1 transition-colors ${
                  !currentBrand ? 'text-[#FB2E86] font-bold' : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b.slug}
                  onClick={() => updateQuery({ brand: b.name, page: 1 })}
                  className={`w-full text-left text-xs py-1 transition-colors ${
                    currentBrand.toLowerCase() === b.name.toLowerCase()
                      ? 'text-[#FB2E86] font-bold underline'
                      : 'text-[#8A8FB9] hover:text-[#FB2E86]'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-6 border-t border-[#F2F0FF]">
            <h4 className="font-josefin text-base font-bold text-[#151875]">
              Price Range (Rs.)
            </h4>
            <form onSubmit={handlePriceApply} className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs bg-white border border-[#E8E6F1] rounded-[4px] focus:outline-none focus:border-[#7E33E0] text-[#151875]"
                />
                <span className="text-[#8A8FB9]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 text-xs bg-white border border-[#E8E6F1] rounded-[4px] focus:outline-none focus:border-[#7E33E0] text-[#151875]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-[#FB2E86] text-white hover:bg-[#e02575] transition-colors text-xs font-josefin font-semibold rounded-[4px]"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Availability Toggle */}
          <div className="pt-6 border-t border-[#F2F0FF]">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#151875] font-lato">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateQuery({ inStock: e.target.checked ? 'true' : '', page: 1 })}
                className="rounded-[2px] border-[#E8E6F1] text-[#FB2E86] focus:ring-[#FB2E86] accent-[#FB2E86]"
              />
              <span className="font-medium">In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* ── Product Grid: 2 columns on mobile, 2 sm, 3 md/lg ── */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse border border-[#E8E6F1] p-3 sm:p-4 rounded-lg space-y-3">
                  <div className="aspect-square bg-gray-100 rounded-md w-full" />
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-[#E8E6F1] p-8 sm:p-16 text-center space-y-3 bg-[#F6F5FF] rounded-xl">
              <p className="text-base font-semibold text-[#151875]">No accessories found matching your criteria.</p>
              <p className="text-xs text-[#8A8FB9] max-w-sm mx-auto">
                Try loosening your filters or search keywords to view other premium products.
              </p>
              <button onClick={resetFilters} className="btn-secondary text-xs mt-3">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateQuery({ page: currentPage - 1 })}
                className="btn-ghost flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <span className="text-xs text-gray-400 font-mono">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => updateQuery({ page: currentPage + 1 })}
                className="btn-ghost flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none text-xs"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
