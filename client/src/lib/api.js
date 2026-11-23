/**
 * Centralized API Client Wrapper
 * Handles JWT authentication headers, standardized error reporting, and backend communication.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Standard request helper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const headers = {
    ...(options.headers || {}),
  };

  // Only set application/json if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Attach token from localStorage in client environment
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gd_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `API request failed with status ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`❌ [API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/update-profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProduct: (slugOrId) => request(`/products/${slugOrId}`),
  getRelatedProducts: (id) => request(`/products/${id}/related`),
  checkCompatibility: (id, device) =>
    request(`/products/${id}/check-compatibility?device=${encodeURIComponent(device)}`),

  // Categories & Brands
  getCategories: () => request('/categories'),
  getBrands: () => request('/brands'),

  // Cart
  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1) =>
    request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId, quantity) =>
    request(`/cart/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),
  syncCart: (items) => request('/cart/sync', { method: 'POST', body: JSON.stringify({ items }) }),

  // Orders & Tracking
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  trackOrder: (orderNumber, phone = '') =>
    request(`/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`),
  getMyOrders: () => request('/orders/my-orders'),
  getOrder: (identifier) => request(`/orders/${identifier}`),

  // Wishlist
  getWishlist: () => request('/wishlist'),
  toggleWishlist: (productId) =>
    request('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Reviews
  getProductReviews: (productId) => request(`/reviews/${productId}`),
  createReview: (productId, body) =>
    request(`/reviews/${productId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Newsletter
  subscribeNewsletter: (email) =>
    request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),

  // Admin
  getDashboardStats: () => request('/admin/dashboard'),
  uploadImages: (formData) => request('/upload', { method: 'POST', body: formData }),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/orders${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (orderId, status, note = '') =>
    request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    }),
  getAdminCustomers: () => request('/admin/customers'),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};
