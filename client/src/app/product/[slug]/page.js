'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import CompatibilityChecker from '../../../components/CompatibilityChecker';
import ProductCard from '../../../components/ProductCard';
import {
  Star,
  Shield,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Heart,
  Share2,
  CheckCircle,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart, showToast } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.getProduct(params.slug);
        if (res?.product) {
          setProduct(res.product);

          // Fetch related and reviews
          const [relRes, revRes] = await Promise.allSettled([
            api.getRelatedProducts(res.product._id),
            api.getProductReviews(res.product._id),
          ]);

          if (relRes.status === 'fulfilled' && relRes.value?.products) {
            setRelatedProducts(relRes.value.products);
          }
          if (revRes.status === 'fulfilled' && revRes.value?.reviews) {
            setReviews(revRes.value.reviews);
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      loadProduct();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        <p className="text-xs uppercase tracking-widest text-gray-400">Loading Product Specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-light text-black">Product Not Found</h2>
        <p className="text-xs text-gray-500">
          The requested accessory may have been discontinued or moved to a different collection.
        </p>
        <Link href="/shop" className="btn-primary mt-4">
          Return to Collection
        </Link>
      </div>
    );
  }

  const currentPrice =
    product.salePrice !== null && product.salePrice < product.price
      ? product.salePrice
      : product.price;

  const hasDiscount = product.salePrice !== null && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.stockQty < 1) {
      showToast('This product is out of stock.');
      return;
    }
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (product.stockQty < 1) {
      showToast('This product is out of stock.');
      return;
    }
    addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to leave a review.');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.createReview(product._id, {
        rating: newRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      showToast('Thank you! Your review has been recorded.');
      // Refresh reviews
      const updated = await api.getProductReviews(product._id);
      if (updated?.reviews) setReviews(updated.reviews);
      setReviewComment('');
      setReviewTitle('');
    } catch (err) {
      showToast(err.message || 'Unable to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

      {/* ── Breadcrumb ── */}
      <nav className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <Link href="/" className="hover:text-black">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-black">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-black font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* ── Top Main Product Stage: Gallery + Buy Box ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

        {/* ── Left: Image Gallery ── */}
        <div className="space-y-3 sm:space-y-4">
          {/* Main Selected Image */}
          <div className="relative aspect-square w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <Image
              src={
                product.images && product.images[selectedImage] && product.images[selectedImage].startsWith('http')
                  ? product.images[selectedImage]
                  : 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80'
              }
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#FB2E86] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-xs">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 border rounded-lg shrink-0 overflow-hidden transition-all ${
                    selectedImage === idx ? 'border-[#7E33E0] ring-2 ring-[#7E33E0]/30' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Product Purchase Stage ── */}
        <div className="space-y-6">

          {/* Brand & SKU Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-josefin text-xs uppercase tracking-wider text-[#FB2E86] font-bold">
                {product.brand}
              </span>
              <span className="text-[11px] text-[#8A8FB9] font-lato">
                SKU: {product.SKU}
              </span>
            </div>
            <h1 className="font-josefin text-2xl sm:text-3xl font-bold text-[#151875] tracking-tight leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Ratings Summary */}
          <div className="flex items-center gap-2 pb-4 border-b border-[#F2F0FF]">
            <div className="flex text-[#FFC416]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(product.rating || 5) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[#151875]">
              {product.rating ? product.rating.toFixed(1) : '5.0'}
            </span>
            <span className="text-xs text-[#8A8FB9] font-lato">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'customer reviews'})
            </span>
          </div>

          {/* Price & Stock */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="font-josefin text-3xl font-bold text-[#151875]">
                Rs. {Math.round(currentPrice).toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="font-josefin text-base text-[#FB2E86] line-through font-semibold">
                  Rs. {Math.round(product.price).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {product.stockQty > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium">
                  <Check size={14} /> In Stock ({product.stockQty} units available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  Sold Out / Backorder
                </span>
              )}
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-gray-500">Qty:</span>
              <div className="flex items-center border border-gray-300 rounded-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-500 hover:text-black transition-colors"
                >
                  <Minus size={13} />
                </button>
                <span className="px-4 text-xs font-mono font-medium text-black">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQty || 99, quantity + 1))}
                  className="px-3 py-2 text-gray-500 hover:text-black transition-colors"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stockQty === 0}
                className="btn-primary w-full py-3.5 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Add to Bag
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stockQty === 0}
                className="btn-secondary w-full py-3.5 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* ── Interactive Compatibility Checker ── */}
          <div className="pt-4">
            <CompatibilityChecker
              productId={product._id}
              compatibilityList={product.compatibility || []}
            />
          </div>

          {/* Value Props Small Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2 py-4 border-y border-gray-100 text-[11px] sm:text-xs text-gray-500 text-center">
            <div className="flex sm:flex-col items-center justify-center gap-1.5 sm:gap-1">
              <Truck size={16} className="text-[#FB2E86] shrink-0" />
              <span>Free Delivery Rs. 2,000+</span>
            </div>
            <div className="flex sm:flex-col items-center justify-center gap-1.5 sm:gap-1">
              <RotateCcw size={16} className="text-[#7E33E0] shrink-0" />
              <span>30-Day Hassle Free</span>
            </div>
            <div className="flex sm:flex-col items-center justify-center gap-1.5 sm:gap-1">
              <Shield size={16} className="text-[#00C1FE] shrink-0" />
              <span>12 Months Warranty</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Technical Specifications & Description Tab ── */}
      <section className="border-t border-gray-200 pt-8 sm:pt-12 space-y-6 sm:space-y-8">
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black">
            Design &amp; Architecture
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Technical Specs Table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div className="max-w-3xl space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black">
              Technical Specifications
            </h3>
            <div className="border border-gray-200 divide-y divide-gray-200 text-xs rounded-lg overflow-hidden">
              {Object.entries(product.specifications).map(([key, val]) => (
                <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white gap-1 sm:gap-0">
                  <span className="font-medium text-gray-500 uppercase tracking-wider text-[11px]">
                    {key}
                  </span>
                  <span className="sm:col-span-2 text-black font-light">{val}</span>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-3 p-3 bg-white gap-1 sm:gap-0">
                <span className="font-medium text-gray-500 uppercase tracking-wider text-[11px]">
                  Warranty
                </span>
                <span className="sm:col-span-2 text-black font-light">{product.warranty}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Customer Reviews & Ratings Section ── */}
      <section className="border-t border-gray-200 pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-medium">
              Customer Experience
            </span>
            <h3 className="text-2xl font-extralight text-black tracking-tight mt-1">
              Reviews &amp; Ratings ({reviews.length})
            </h3>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 font-light italic col-span-2">
              No reviews yet for this accessory. Be the first to share your thoughts below!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev._id} className="border border-gray-200 p-5 space-y-2 bg-white">
                <div className="flex justify-between items-center">
                  <div className="flex text-black">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rev.rating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-light">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {rev.title && <h5 className="text-xs font-medium text-black">{rev.title}</h5>}
                <p className="text-xs text-gray-600 font-light leading-relaxed">{rev.comment}</p>

                <div className="pt-2 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100">
                  <span className="font-medium text-black">{rev.userName}</span>
                  {rev.isVerifiedPurchase && (
                    <span className="text-green-700 font-medium flex items-center gap-1">
                      <CheckCircle size={11} /> Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Write a Review Box */}
        <div className="border border-gray-200 bg-gray-50 p-6 max-w-2xl space-y-4">
          <h4 className="text-xs uppercase tracking-[0.16em] font-medium text-black">
            Write a Customer Review
          </h4>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Rating:
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-black hover:scale-110 transition-transform"
                    >
                      <Star
                        size={18}
                        fill={star <= newRating ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Headline:
                </label>
                <input
                  type="text"
                  placeholder="Summarize your experience (e.g. Perfect fit!)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Review:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share details on texture, MagSafe strength, or durability..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-sm focus:outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="btn-primary py-2.5 text-xs disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          ) : (
            <div className="text-xs text-gray-500 space-y-2">
              <p>Please sign in with your customer account to post a verified review.</p>
              <Link href="/login" className="btn-secondary text-[11px] py-2 inline-block">
                Sign In to Review
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Related Accessories ── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-gray-200 pt-12 space-y-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-extralight text-black tracking-tight">
              Complementary Accessories
            </h3>
            <Link href="/shop" className="text-xs uppercase tracking-wider text-gray-500 hover:text-black">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
