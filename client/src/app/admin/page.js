'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import AdminLoginPage from './login/page';
import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Upload,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, logout } = useAuth();

  // Active tab: 'overview' | 'products' | 'orders' | 'customers'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product Form state
  const [prodForm, setProdForm] = useState({
    name: '',
    brand: '',
    category: '',
    SKU: '',
    price: '',
    salePrice: '',
    stockQty: '',
    description: '',
    images: [],
    compatibility: '',
    warranty: '12 Months Official Manufacturer Warranty',
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
  });

  // ImgBB Image Upload State
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNote, setStatusNote] = useState('');

  // Customers state
  const [customers, setCustomers] = useState([]);

  // Notification message
  const [actionMessage, setActionMessage] = useState(null);

  const showMsg = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // 1. Load Stats
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.getDashboardStats();
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. Load Products
  const loadProducts = async () => {
    try {
      const res = await api.getProducts({ limit: 50, search: productSearch });
      if (res?.products) setProducts(res.products);
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Load Orders
  const loadOrders = async () => {
    try {
      const params = {};
      if (orderStatusFilter !== 'All') params.status = orderStatusFilter;
      if (orderSearch) params.search = orderSearch;
      const res = await api.getAdminOrders(params);
      if (res?.orders) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Load Customers
  const loadCustomers = async () => {
    try {
      const res = await api.getAdminCustomers();
      if (res?.customers) setCustomers(res.customers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      api.getCategories().then((res) => {
        if (res?.categories) setCategories(res.categories);
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'products') loadProducts();
    if (activeTab === 'orders') loadOrders();
    if (activeTab === 'customers') loadCustomers();
  }, [activeTab, isAdmin, orderStatusFilter, productSearch, orderSearch]);

  if (!isAuthenticated || !isAdmin) {
    return <AdminLoginPage />;
  }

  // Handle Product Save (Create or Update)
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageList = Array.isArray(prodForm.images)
        ? prodForm.images.map((url) => (typeof url === 'string' ? url.trim() : '')).filter(Boolean)
        : typeof prodForm.images === 'string'
        ? prodForm.images.split(',').map((url) => url.trim()).filter(Boolean)
        : [];

      if (imageList.length === 0) {
        showMsg('Please upload at least one product image before saving.');
        return;
      }

      const payload = {
        name: prodForm.name,
        brand: prodForm.brand,
        category: prodForm.category,
        SKU: prodForm.SKU,
        price: Number(prodForm.price),
        salePrice: prodForm.salePrice ? Number(prodForm.salePrice) : null,
        stockQty: Number(prodForm.stockQty),
        description: prodForm.description,
        images: imageList,
        compatibility: typeof prodForm.compatibility === 'string'
          ? prodForm.compatibility.split(',').map((c) => c.trim()).filter(Boolean)
          : prodForm.compatibility,
        warranty: prodForm.warranty,
        isFeatured: prodForm.isFeatured,
        isBestSeller: prodForm.isBestSeller,
        isTrending: prodForm.isTrending,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
        showMsg(`Updated ${prodForm.name} successfully.`);
      } else {
        await api.createProduct(payload);
        showMsg(`Created product ${prodForm.name}.`);
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      loadProducts();
      loadStats();
    } catch (err) {
      showMsg(err.message || 'Error saving product.');
    }
  };

  // Upload images to ImgBB via Node.js backend
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.uploadImages(formData);
      if (res?.urls && res.urls.length > 0) {
        setProdForm((prev) => ({
          ...prev,
          images: [...(Array.isArray(prev.images) ? prev.images : []), ...res.urls],
        }));
        showMsg(`Uploaded ${res.urls.length} image(s) to ImgBB successfully.`);
      }
    } catch (err) {
      console.error(err);
      showMsg(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingImages(false);
      e.target.value = ''; // Reset input to allow re-uploading the same file if needed
    }
  };

  // Replace a specific image with a new upload to ImgBB
  const handleReplaceImage = async (index, file) => {
    if (!file) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.uploadImages(formData);
      const newUrl = res?.urls?.[0] || res?.url;
      if (newUrl) {
        setProdForm((prev) => {
          const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
          currentList[index] = newUrl;
          return { ...prev, images: currentList };
        });
        showMsg('Image replaced on ImgBB successfully.');
      }
    } catch (err) {
      console.error(err);
      showMsg(err.message || 'Failed to replace image.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image from list
  const handleRemoveImage = (index) => {
    setProdForm((prev) => {
      const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
      return {
        ...prev,
        images: currentList.filter((_, i) => i !== index),
      };
    });
  };

  // Make chosen image primary (move to index 0)
  const handleMakePrimary = (index) => {
    setProdForm((prev) => {
      const currentList = Array.isArray(prev.images) ? [...prev.images] : [];
      if (index <= 0 || index >= currentList.length) return prev;
      const [chosen] = currentList.splice(index, 1);
      currentList.unshift(chosen);
      return { ...prev, images: currentList };
    });
  };

  // Optional manual URL addition
  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setProdForm((prev) => ({
      ...prev,
      images: [...(Array.isArray(prev.images) ? prev.images : []), customImageUrl.trim()],
    }));
    setCustomImageUrl('');
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setCustomImageUrl('');
    setProdForm({
      name: '',
      brand: '',
      category: categories[0]?._id || '',
      SKU: `GD-${Date.now().toString().slice(-4)}`,
      price: '',
      salePrice: '',
      stockQty: '25',
      description: '',
      images: [],
      compatibility: 'iPhone 16 Pro, iPhone 16 Pro Max, iPhone 15 Pro',
      warranty: '12 Months Official Manufacturer Warranty',
      isFeatured: false,
      isBestSeller: false,
      isTrending: false,
    });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setCustomImageUrl('');
    setProdForm({
      name: prod.name,
      brand: prod.brand,
      category: prod.category?._id || prod.category || '',
      SKU: prod.SKU,
      price: prod.price,
      salePrice: prod.salePrice || '',
      stockQty: prod.stockQty,
      description: prod.description,
      images: Array.isArray(prod.images)
        ? [...prod.images]
        : prod.images
        ? prod.images.split(',').map((url) => url.trim()).filter(Boolean)
        : [],
      compatibility: Array.isArray(prod.compatibility)
        ? prod.compatibility.join(', ')
        : prod.compatibility || '',
      warranty: prod.warranty || '12 Months Official Manufacturer Warranty',
      isFeatured: Boolean(prod.isFeatured),
      isBestSeller: Boolean(prod.isBestSeller),
      isTrending: Boolean(prod.isTrending),
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.deleteProduct(id);
      showMsg(`Deleted ${name}.`);
      loadProducts();
      loadStats();
    } catch (err) {
      showMsg(err.message);
    }
  };

  // Handle Order Status Update
  const handleOrderStatusUpdate = async (orderId) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, statusNote);
      showMsg(`Order status updated to "${newStatus}".`);
      setUpdatingOrderId(null);
      setStatusNote('');
      loadOrders();
      loadStats();
    } catch (err) {
      showMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Dedicated Clean Admin Bar (No customer navbar/footer) ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-base font-light tracking-[0.16em] uppercase text-black font-semibold">
                Gadget District
              </span>
              <span className="bg-black text-white text-[9px] uppercase tracking-wider px-2 py-0.5 font-mono">
                Admin
              </span>
            </Link>
          </div>

          {/* Center Tabs */}
          <div className="hidden sm:flex border border-gray-200 p-0.5 bg-gray-50 rounded-sm text-xs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: 'Products' },
              { id: 'orders', label: 'Orders' },
              { id: 'customers', label: 'Customers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 uppercase tracking-wider transition-colors font-medium text-[11px] ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-500 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              target="_blank"
              className="text-gray-600 hover:text-black flex items-center gap-1 font-light tracking-wider uppercase text-[11px] transition-colors"
            >
              Live Store ↗
            </Link>
            <span className="hidden md:inline text-gray-400 font-mono text-[11px]">
              {user?.email}
            </span>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-2.5 py-1 text-[11px] uppercase tracking-wider text-red-600 border border-gray-200 hover:border-red-600 rounded-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="sm:hidden flex border-t border-gray-200 divide-x divide-gray-200 bg-gray-50 text-[11px] uppercase font-medium overflow-x-auto scrollbar-none">
          {['overview', 'products', 'orders', 'customers'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[75px] py-2.5 px-2 text-center min-h-[44px] flex items-center justify-center transition-colors ${
                activeTab === tab ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {actionMessage && (
          <div className="p-3 border border-black bg-black text-white text-xs rounded-sm">
            {actionMessage}
          </div>
        )}

      {/* ═══════════════════════════════════════════════════
           TAB 1: OVERVIEW & REAL DATABASE ANALYTICS
      ════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-10">

          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="border border-gray-200 bg-white p-4 sm:p-5 rounded-sm space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                Total Revenue
              </span>
              <div className="text-2xl sm:text-3xl font-light text-black">
                Rs. {Math.round(stats?.totalRevenue || 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-gray-400">Calculated from confirmed orders</p>
            </div>

            <div className="border border-gray-200 bg-white p-4 sm:p-5 rounded-sm space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                Total Orders
              </span>
              <div className="text-2xl sm:text-3xl font-light text-black">
                {stats?.totalOrders || 0}
              </div>
              <p className="text-[10px] text-gray-400">{stats?.pendingOrders || 0} awaiting confirmation</p>
            </div>

            <div className="border border-gray-200 bg-white p-4 sm:p-5 rounded-sm space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                Total Products
              </span>
              <div className="text-2xl sm:text-3xl font-light text-black">
                {stats?.totalProducts || 0}
              </div>
              <p className="text-[10px] text-gray-400">{stats?.lowStockProducts || 0} low stock items</p>
            </div>

            <div className="border border-gray-200 bg-white p-4 sm:p-5 rounded-sm space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium block">
                Registered Customers
              </span>
              <div className="text-2xl sm:text-3xl font-light text-black">
                {stats?.totalCustomers || 0}
              </div>
              <p className="text-[10px] text-gray-400">Database user profiles</p>
            </div>
          </div>

          {/* Recent Orders & Top Sellers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left 2 Cols: Recent Orders Table */}
            <div className="lg:col-span-2 border border-gray-200 bg-white p-6 rounded-sm space-y-4">
              <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black">
                  Recent Orders
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-[11px] uppercase tracking-wider text-black underline"
                >
                  Manage All →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left min-w-[520px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="py-2">Order #</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-light">
                    {stats?.recentOrders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-mono font-medium text-black">{ord.orderNumber}</td>
                        <td className="py-2.5">{ord.customer?.name}</td>
                        <td className="py-2.5 font-medium">Rs. {Math.round(ord.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-2.5">
                          <span
                            className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-none font-medium ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-green-100 text-green-900'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-red-100 text-red-900'
                                : 'bg-black text-white'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-gray-400 text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: Top Selling Accessories */}
            <div className="border border-gray-200 bg-white p-6 rounded-sm space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black border-b border-gray-100 pb-3">
                Top Products by Sales
              </h3>

              {stats?.bestSellingProducts?.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No sales recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {stats?.bestSellingProducts?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-gray-400 text-xs">#{idx + 1}</span>
                        <div>
                          <p className="font-light text-black truncate max-w-[140px]">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">SKU: {item.SKU}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-black">{item.totalSold} sold</span>
                        <p className="text-[10px] text-gray-400">Rs. {Math.round(item.totalRevenue || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════
           TAB 2: PRODUCT MANAGEMENT
      ════════════════════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search products by SKU, name, or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-sm focus:outline-none focus:border-black"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>

            <button onClick={openAddProduct} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={14} /> Add New Accessory
            </button>
          </div>

          {/* Products Table */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Brand</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Sale</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-light">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-black max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-md bg-[#F6F5FF] border border-[#E8E6F1] overflow-hidden shrink-0">
                          {prod.images && prod.images.length > 0 ? (
                            <Image
                              src={prod.images[0]}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <span className="truncate">{prod.name}</span>
                      </div>
                    </td>
                    <td className="p-3">{prod.brand}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{prod.SKU}</td>
                    <td className="p-3">Rs. {Math.round(prod.price).toLocaleString()}</td>
                    <td className="p-3 text-gray-400">
                      {prod.salePrice ? `Rs. ${Math.round(prod.salePrice).toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-mono px-2 py-0.5 rounded-sm ${
                          prod.stockQty <= 5
                            ? 'bg-red-100 text-red-800 font-medium'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {prod.stockQty}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">{prod.category?.name || 'Accessories'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditProduct(prod)}
                        className="text-gray-500 hover:text-black p-1"
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id, prod.name)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════
           TAB 3: ORDER MANAGEMENT
      ════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="space-y-6">

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search orders by number, customer, phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-sm focus:outline-none focus:border-black"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-xs font-light">
              {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 border rounded-sm shrink-0 uppercase tracking-wider text-[10px] ${
                    orderStatusFilter === st
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:border-black'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="border border-gray-200 bg-white rounded-sm overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-light">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-medium text-black">
                      <Link href={`/track-order?orderNumber=${ord.orderNumber}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-black">{ord.customer?.name}</p>
                      <p className="text-[10px] text-gray-400">{ord.customer?.email}</p>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{ord.customer?.phone}</td>
                    <td className="p-3 text-gray-500">{ord.items?.length} items</td>
                    <td className="p-3 font-medium text-black">Rs. {Math.round(ord.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-mono text-gray-600 uppercase">
                        {ord.paymentMethod} ({ord.paymentStatus})
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-none font-medium ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-green-100 text-green-900'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-black text-white'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setUpdatingOrderId(ord._id);
                          setNewStatus(ord.orderStatus);
                        }}
                        className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-gray-300 hover:border-black rounded-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal to update status */}
          {updatingOrderId && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-300 rounded-sm p-6 max-w-md w-full space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-black">
                  Update Order Dispatch Status
                </h3>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Select New Status:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm text-xs text-black"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled (Auto-Restores Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Tracking Note / Courier Info:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Package handed to DHL courier #49281"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm text-xs"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <button
                    onClick={() => setUpdatingOrderId(null)}
                    className="btn-ghost text-xs py-2 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleOrderStatusUpdate(updatingOrderId)}
                    className="btn-primary text-xs py-2 w-full sm:w-auto"
                  >
                    Save Status
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═══════════════════════════════════════════════════
           TAB 4: CUSTOMER MANAGEMENT
      ════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="border border-gray-200 bg-white rounded-sm overflow-x-auto">
            <table className="w-full text-xs text-left min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Total Orders</th>
                  <th className="p-3">Total Spend</th>
                  <th className="p-3 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-light">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-black">{c.name}</td>
                    <td className="p-3 text-gray-600">{c.email}</td>
                    <td className="p-3 font-mono text-[11px] text-gray-500">{c.phone || 'N/A'}</td>
                    <td className="p-3 text-gray-500">{c.address?.city || 'N/A'}</td>
                    <td className="p-3 font-medium text-black">{c.totalOrders || 0}</td>
                    <td className="p-3 font-medium text-black">Rs. {Math.round(c.totalSpent || 0).toLocaleString()}</td>
                    <td className="p-3 text-right text-gray-400 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
           ADD / EDIT PRODUCT MODAL
      ════════════════════════════════════════════════════ */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-300 rounded-xl sm:rounded-2xl p-4 sm:p-8 max-w-2xl w-full my-4 sm:my-8 space-y-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-sm uppercase tracking-[0.2em] font-medium text-black border-b border-gray-200 pb-3">
              {editingProduct ? 'Edit Accessory Details' : 'Add New Accessory to Catalog'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Category *
                  </label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm text-black"
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.SKU}
                    onChange={(e) => setProdForm({ ...prodForm, SKU: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Regular Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Discounted Sale Price (Rs.) (Optional)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={prodForm.salePrice}
                    onChange={(e) => setProdForm({ ...prodForm, salePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodForm.stockQty}
                    onChange={(e) => setProdForm({ ...prodForm, stockQty: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                    Warranty Term
                  </label>
                  <input
                    type="text"
                    value={prodForm.warranty}
                    onChange={(e) => setProdForm({ ...prodForm, warranty: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                  />
                </div>
              </div>

              {/* ── ImgBB Image Upload & Management ── */}
              <div className="space-y-3 bg-[#F6F5FF] p-4 rounded-xl border border-[#E8E6F1]">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold font-josefin text-[#151875] uppercase tracking-wider">
                      Product Images (ImgBB Hosted) *
                    </label>
                    <p className="text-[11px] text-[#8A8FB9]">
                      Upload one or more product photos. First image is used as the primary showcase.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[#7E33E0] bg-white px-2.5 py-1 rounded-full border border-[#E8E6F1]">
                    {Array.isArray(prodForm.images) ? prodForm.images.length : 0} {prodForm.images?.length === 1 ? 'image' : 'images'}
                  </span>
                </div>

                {/* Upload Button / Drop Zone */}
                <div className="border-2 border-dashed border-[#7E33E0]/30 hover:border-[#7E33E0] bg-white rounded-xl p-5 text-center transition-all">
                  <input
                    type="file"
                    id="product-images-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImages}
                    className="hidden"
                  />
                  <label
                    htmlFor="product-images-upload"
                    className={`cursor-pointer inline-flex flex-col items-center gap-2 ${
                      uploadingImages ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#F6F5FF] border border-[#E8E6F1] flex items-center justify-center text-[#7E33E0] shadow-xs">
                      {uploadingImages ? (
                        <Loader2 className="animate-spin" size={22} />
                      ) : (
                        <Upload size={22} />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#7E33E0] hover:underline">
                        {uploadingImages ? 'Uploading images to ImgBB...' : 'Click to Upload Images from Device'}
                      </span>
                      <p className="text-[11px] text-[#8A8FB9] mt-0.5">
                        Supports PNG, JPG, WEBP, GIF. Uploads multiple images in one go.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Image Previews Grid */}
                {Array.isArray(prodForm.images) && prodForm.images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-semibold text-[#151875] uppercase tracking-wider">
                      Image Gallery (Drag/Click to edit, replace or reorder):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {prodForm.images.map((url, idx) => (
                        <div
                          key={idx}
                          className="group relative bg-white border border-[#E8E6F1] rounded-lg overflow-hidden shadow-xs p-1.5 flex flex-col"
                        >
                          <div className="relative w-full aspect-square bg-[#F6F5FF] rounded-md overflow-hidden">
                            <Image
                              src={url}
                              alt={`Product ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                            {idx === 0 ? (
                              <span className="absolute top-1 left-1 bg-[#FB2E86] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                                Primary
                              </span>
                            ) : (
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Action Toolbar */}
                          <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                            <div>
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMakePrimary(idx)}
                                  className="text-[10px] text-[#7E33E0] hover:underline font-semibold"
                                  title="Make this the primary showcase image"
                                >
                                  Set Primary
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {/* Replace button with hidden file input */}
                              <label
                                className="cursor-pointer text-gray-500 hover:text-[#7E33E0] p-1 rounded hover:bg-gray-100"
                                title="Replace with new photo"
                              >
                                <RefreshCw size={12} />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleReplaceImage(idx, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>

                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                title="Remove photo"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional manual URL input */}
                <div className="pt-2 border-t border-[#E8E6F1]/60 flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. https://...)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E8E6F1] rounded-md focus:outline-none focus:border-[#7E33E0]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-3 py-1.5 text-xs bg-[#7E33E0] text-white rounded-md hover:bg-[#6b22cd] font-medium"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Compatible Device Models (Comma-separated)
                </label>
                <input
                  type="text"
                  value={prodForm.compatibility}
                  onChange={(e) => setProdForm({ ...prodForm, compatibility: e.target.value })}
                  placeholder="iPhone 16 Pro, iPhone 16 Pro Max, Samsung S24"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                  Full Technical Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-sm"
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isFeatured}
                    onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    className="accent-black"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isBestSeller}
                    onChange={(e) => setProdForm({ ...prodForm, isBestSeller: e.target.checked })}
                    className="accent-black"
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodForm.isTrending}
                    onChange={(e) => setProdForm({ ...prodForm, isTrending: e.target.checked })}
                    className="accent-black"
                  />
                  <span>Trending</span>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-ghost text-xs py-2.5 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2.5 w-full sm:w-auto">
                  {editingProduct ? 'Save Changes' : 'Create Accessory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
