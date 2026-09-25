'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LogOut,
  Package,
  MapPin,
  CreditCard,
  FileText,
  User,
  ChevronDown,
} from 'lucide-react';
import { Logo } from '../../assets/index';

export default function UserProfileDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  // =====================================================
  // Fetch logged-in customer's profile + orders
  // =====================================================
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/orders', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(
            data.error || 'Failed to load your profile and orders.'
          );
          return;
        }

        setUser(data.customer || null);
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        console.error('Error fetching customer orders:', err);
        setError(
          'Server error. Please check your connection and try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // =====================================================
  // Toggle order accordion
  // =====================================================
  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Status Badge Color Helper
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* =================================================
          Header
      ================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              <Image
                src={Logo}
                alt="Logo"
                priority
                className="h-8 w-auto object-contain"
              />
              <span className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                PUREMEOWS
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div className="text-right sm:text-left">
          </div>

          {/* Logout */}
          <Link
            href="/logout"
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-slate-200"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      {/* =================================================
          Main
      ================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Order History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and review your past purchases
          </p>
        </div>

        {/* =================================================
            Orders Container
        ================================================= */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Your Orders</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Total: {orders.length}
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-16 bg-slate-100 animate-pulse rounded-xl w-full"
                ></div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-6">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium text-center">
                {error}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && orders.length === 0 && (
            <div className="p-12 text-center text-gray-500 text-sm space-y-3">
              <Package className="w-10 h-10 mx-auto text-gray-300" />
              <p>You haven't placed any orders yet.</p>
              <Link
                href="/"
                className="inline-block mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {/* Orders List */}
          {!loading && !error && orders.length > 0 && (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => {
                const itemsList = Array.isArray(order.items)
                  ? order.items
                  : [];
                const isExpanded = !!expandedOrders[order._id];

                const totalItemsCount = itemsList.reduce(
                  (acc, item) => acc + Number(item.quantity || 0),
                  0
                );

                const customerName =
                  order.customer?.fullName ||
                  order.customer?.name ||
                  user?.fullName ||
                  user?.name ||
                  'Customer';

                const customerEmail =
                  order.customer?.email || user?.email || 'N/A';
                const customerPhone =
                  order.customer?.phone || user?.phone || 'N/A';
                const deliveryAddress =
                  order.customer?.address || user?.address || 'N/A';
                const deliveryArea =
                  order.customer?.area || user?.area || '';
                const orderNotes =
                  order.customer?.notes ||
                  order.notes ||
                  order.instructions ||
                  'No instructions provided.';

                const deliveryFee = Number(order.deliveryFee || 0);
                const totalAmount = Number(order.totalAmount || 0);
                const subtotal = Number(
                  order.subtotal ||
                    (totalAmount > deliveryFee
                      ? totalAmount - deliveryFee
                      : totalAmount)
                );

                return (
                  <div key={order._id} className="transition-colors">
                    {/* Order Header */}
                    <button
                      type="button"
                      onClick={() => toggleOrder(order._id)}
                      aria-expanded={isExpanded}
                      className="w-full text-left p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors cursor-pointer focus:outline-none focus:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 min-w-[180px]">
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Order Number
                          </p>
                          <p className="font-mono text-xs font-bold text-slate-800">
                            #
                            {order._id
                              ? String(order._id).slice(-6).toUpperCase()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="text-xs font-medium text-gray-600">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                          {totalItemsCount}{' '}
                          {totalItemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="text-xs font-bold text-slate-900">
                        {/* OMR {totalAmount.toFixed(3)} */}
                      </div>

                      {/* Status + Date */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${getStatusBadgeStyle(
                            order.status
                          )}`}
                        >
                          {order.status || 'Pending'}
                        </span>

                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                'en-GB',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                }
                              )
                            : 'N/A'}
                        </span>
                      </div>
                    </button>

                    {/* Order Details */}
                    {isExpanded && (
                      <div className="bg-gray-50/60 border-t border-gray-100 p-6 space-y-6">
                        {/* Ordered Items */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Ordered Items
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {itemsList.map(
                              ({ product, quantity }, idx) => (
                                <div
                                  key={product?._id || idx}
                                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm"
                                >
                                  {product?.imageUrl ? (
                                    <img
                                      src={product.imageUrl}
                                      alt={product.title || 'Product'}
                                      className="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 flex-shrink-0">
                                      No Image
                                    </div>
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-800 truncate">
                                      {product?.title || 'Unknown Product'}
                                    </p>

                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Qty:{' '}
                                      <span className="font-bold text-gray-700">
                                        {quantity}
                                      </span>
                                      {product?.price != null && (
                                        <span>
                                          {' '}
                                          × OMR{' '}
                                          {Number(product.price).toFixed(2)}
                                        </span>
                                      )}
                                    </p>
                                  </div>

                                  {product?.price != null && (
                                    <span className="font-bold text-xs text-gray-900">
                                      OMR{' '}
                                      {(
                                        Number(product.price) * Number(quantity)
                                      ).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200/60 text-xs">
                          {/* Customer */}
                          <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-gray-700 mb-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span>Customer Details</span>
                            </div>
                            <p className="text-gray-800 font-semibold">
                              {customerName}
                            </p>
                            <p className="text-gray-500 truncate">
                              {customerEmail}
                            </p>
                            <p className="text-gray-500">{customerPhone}</p>
                          </div>

                          {/* Delivery */}
                          <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-gray-700 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span>Delivery Address</span>
                            </div>
                            <p className="text-gray-600">{deliveryAddress}</p>
                            {deliveryArea && (
                              <p className="text-gray-500 font-medium">
                                {deliveryArea}
                              </p>
                            )}
                          </div>

                          {/* Payment */}
                          <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-gray-700 mb-1">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                              <span>Payment Method</span>
                            </div>
                            <p className="text-gray-600 font-medium">
                              {order.paymentMethod || 'Cash on Delivery'}
                            </p>
                            <p className="text-gray-500">
                              Subtotal: OMR {subtotal.toFixed(2)}
                            </p>
                            <p className="text-gray-500">
                              Delivery: OMR {deliveryFee.toFixed(2)}
                            </p>
                          </div>

                          {/* Notes */}
                          <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-gray-700 mb-1">
                              <FileText className="w-3.5 h-3.5 text-gray-400" />
                              <span>Order Notes</span>
                            </div>
                            <p className="text-gray-600 italic">
                              {orderNotes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}