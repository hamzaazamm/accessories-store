'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { CheckCircle2, Package, Truck, ArrowRight, Printer } from 'lucide-react';
import { BRANDING } from '../../../lib/branding';

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!params.orderNumber) return;
      try {
        const res = await api.getOrder(params.orderNumber);
        if (res?.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.orderNumber]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-xs text-gray-400">
        Loading order receipt...
      </div>
    );
  }

  const orderNum = params.orderNumber;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-8 sm:space-y-10">

      {/* Confirmation Banner */}
      <div className="border border-gray-200 bg-gray-50/60 p-5 sm:p-8 text-center space-y-3 rounded-sm">
        <CheckCircle2 size={40} className="text-black mx-auto" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-medium">
          Order Confirmed
        </span>
        <h1 className="text-2xl sm:text-3xl font-extralight text-black tracking-tight">
          Thank you for your order.
        </h1>
        <p className="text-xs text-gray-500 font-light max-w-md mx-auto leading-relaxed">
          We have received your order and our fulfillment team has started preparing your accessories.
        </p>

        <div className="inline-block mt-3 p-2.5 sm:p-3 bg-white border border-gray-200 rounded-sm font-mono text-xs sm:text-sm font-semibold tracking-wider text-black break-all max-w-full">
          {orderNum}
        </div>
      </div>

      {/* Order Details Receipt Box */}
      {order && (
        <div className="border border-gray-200 bg-white p-6 sm:p-8 space-y-6 rounded-sm">
          <div className="flex justify-between items-baseline border-b border-gray-100 pb-4">
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black">
              Receipt Summary
            </h3>
            <span className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Delivery & Payment info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-light">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                Deliver To:
              </span>
              <p className="font-medium text-black">{order.customer.name}</p>
              <p className="text-gray-500">{order.customer.address}</p>
              <p className="text-gray-500">{order.customer.city}, {order.customer.postalCode}</p>
              <p className="text-gray-500">{order.customer.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                Payment Method:
              </span>
              <p className="font-medium text-black">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod}
              </p>
              <p className="text-gray-500">Status: {order.paymentStatus}</p>
              <p className="text-gray-500">Order Status: <span className="font-medium text-black">{order.orderStatus}</span></p>
            </div>
          </div>

          {/* Items */}
          <div className="pt-4 border-t border-gray-100 divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <div className="relative w-12 h-12 bg-gray-50 border border-gray-200 shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                  )}
                  <div>
                    <span className="font-light text-black block">{item.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Qty: {item.quantity} · SKU: {item.SKU}
                    </span>
                  </div>
                </div>
                <span className="font-light text-black">Rs. {Math.round(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs text-right">
            <div className="text-gray-500">Subtotal: Rs. {Math.round(order.subtotal).toLocaleString()}</div>
            <div className="text-gray-500">
              Shipping: {order.shippingFee === 0 ? 'FREE' : `Rs. ${Math.round(order.shippingFee).toLocaleString()}`}
            </div>
            <div className="text-base font-light text-black pt-2 border-t border-gray-100">
              Total Payable: <span className="font-medium text-lg">Rs. {Math.round(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href={`/track-order?orderNumber=${encodeURIComponent(orderNum)}`}
          className="btn-primary w-full sm:w-auto"
        >
          Track Package Status →
        </Link>
        <Link href="/shop" className="btn-secondary w-full sm:w-auto">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
}
