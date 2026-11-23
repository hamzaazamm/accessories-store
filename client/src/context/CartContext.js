'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { BRANDING } from '../lib/branding';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Show a minimal toast message
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load cart on startup or when auth status changes
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isAuthenticated) {
        try {
          // Check if guest cart exists in localStorage to sync with backend
          const localCart = localStorage.getItem('gd_guest_cart');
          if (localCart) {
            const parsedGuestItems = JSON.parse(localCart);
            if (parsedGuestItems.length > 0) {
              await api.syncCart(parsedGuestItems);
              localStorage.removeItem('gd_guest_cart');
            }
          }

          const data = await api.getCart();
          if (data?.items) {
            setItems(data.items);
          }
        } catch (error) {
          console.error('Failed to load user cart:', error.message);
        }
      } else {
        // Guest user: load from localStorage
        const saved = localStorage.getItem('gd_guest_cart');
        if (saved) {
          try {
            setItems(JSON.parse(saved));
          } catch (e) {
            console.error('Failed parsing guest cart:', e);
            setItems([]);
          }
        } else {
          setItems([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [isAuthenticated, user?._id]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      localStorage.setItem('gd_guest_cart', JSON.stringify(items));
    }
  }, [items, isAuthenticated, loading]);

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    const qty = Math.max(1, Number(quantity));

    if (isAuthenticated) {
      try {
        const res = await api.addToCart(product._id || product.id, qty);
        if (res?.items) {
          setItems(res.items);
          showToast(`Added ${product.name} to bag.`);
          setIsDrawerOpen(true);
        }
      } catch (error) {
        showToast(error.message || 'Could not add product to cart.');
      }
    } else {
      // Guest cart logic
      const prodId = product._id || product.id;
      const currentPrice =
        product.salePrice !== null && product.salePrice < product.price
          ? product.salePrice
          : product.price;

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => (item.product?._id || item.product?.id || item.productId) === prodId
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          const newQuantity = updated[existingIndex].quantity + qty;
          if (product.stockQty && newQuantity > product.stockQty) {
            showToast(`Maximum stock limit reached (${product.stockQty} items).`);
            return prevItems;
          }
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQuantity,
          };
          return updated;
        } else {
          return [
            ...prevItems,
            {
              product: {
                _id: prodId,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                images: product.images || [],
                stockQty: product.stockQty,
                SKU: product.SKU,
                brand: product.brand,
                slug: product.slug,
              },
              quantity: qty,
              price: currentPrice,
            },
          ];
        }
      });

      showToast(`Added ${product.name} to bag.`);
      setIsDrawerOpen(true);
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    const newQty = Number(quantity);
    if (newQty < 1) {
      return removeFromCart(productId);
    }

    if (isAuthenticated) {
      try {
        const res = await api.updateCartItem(productId, newQty);
        if (res?.items) {
          setItems(res.items);
        }
      } catch (error) {
        showToast(error.message);
      }
    } else {
      setItems((prevItems) =>
        prevItems.map((item) => {
          const id = item.product?._id || item.product?.id || item.productId;
          if (id === productId) {
            return { ...item, quantity: newQty };
          }
          return item;
        })
      );
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await api.removeFromCart(productId);
        if (res?.items) {
          setItems(res.items);
          showToast('Item removed from bag.');
        }
      } catch (error) {
        showToast(error.message);
      }
    } else {
      setItems((prevItems) =>
        prevItems.filter(
          (item) => (item.product?._id || item.product?.id || item.productId) !== productId
        )
      );
      showToast('Item removed from bag.');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await api.clearCart();
        setItems([]);
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    } else {
      setItems([]);
      localStorage.removeItem('gd_guest_cart');
    }
  };

  // Financial calculations
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const p = item.product;
    const price =
      item.price !== undefined
        ? item.price
        : p?.salePrice !== null && p?.salePrice < p?.price
        ? p?.salePrice
        : p?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const shippingFee =
    subtotal >= BRANDING.policies.freeShippingThreshold || subtotal === 0
      ? 0
      : BRANDING.policies.shippingFee;

  const total = Number((subtotal + shippingFee).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal: Number(subtotal.toFixed(2)),
        shippingFee,
        total,
        loading,
        isDrawerOpen,
        toastMessage,
        setIsDrawerOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
