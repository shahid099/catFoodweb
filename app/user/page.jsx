'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { Logo } from '../../assets/index';

export default function UserProfileDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});

  // 1. Fetch current logged-in user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, []);

  // 2. Fetch orders specific to the logged-in user from /api/user
  useEffect(() => {
    if (loadingUser) return;
    if (!user) {
      setLoadingOrders(false);
      return;
    }

    // Replace your fetchUserOrders inside app/user/page.jsx with this debug version:
async function fetchUserOrders() {
  try {
    setLoadingOrders(true);
    setError(null);

    const userId = user._id || user.id;

    console.log('[DEBUG Frontend] Currently logged-in user object:', user);
    console.log('[DEBUG Frontend] Target User ID:', userId);

    if (!userId) {
      setError('User ID not found in session');
      return;
    }

    const res = await fetch(`/api/user?customerId=${encodeURIComponent(userId)}`);
    const data = await res.json();

    console.log('[DEBUG Frontend] Response from /api/user:', data);

    if (res.ok && data.success) {
      setOrders(data.orders || []);
    } else {
      setError(data.error || 'Failed to fetch order history');
    }
  } catch (err) {
    console.error('Fetch orders error:', err);
    setError('Error connecting to server');
  } finally {
    setLoadingOrders(false);
  }
}

    fetchUserOrders();
  }, [user, loadingUser]);

  // Toggle order accordion
  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="flex items-center justify-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
                <Image
                  src={Logo}
                  alt="Logo"
                  priority
                  className="h-14 w-auto object-contain"
                />
                <h2 className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
                  PUREMEOWS
                </h2>
              </span>
            </Link>
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {loadingUser ? 'Loading...' : user?.name || 'Guest'}
            </h1>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>

          {/* Logout */}
          <Link href="/logout">
            <button
              type="button"
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-slate-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Order History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track and review your past purchases
          </p>
        </div>

        {/* Orders Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Your Orders</h2>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Total: {orders.length}
            </span>
          </div>

          {/* Loading State */}
          {(loadingUser || loadingOrders) && (
            <div className="p-8 text-center text-gray-500 text-sm font-medium">
              Loading your orders...
            </div>
          )}

          {/* Error State */}
          {error && !loadingOrders && (
            <div className="p-6">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium text-center">
                {error}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loadingOrders && !error && orders.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-sm">
              You haven't placed any orders yet.
            </div>
          )}

          {/* Orders List */}
          {!loadingOrders && !error && orders.length > 0 && (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => {
                const itemsList = Array.isArray(order.items) ? order.items : [];
                const isExpanded = !!expandedOrders[order._id];

                const totalItemsCount = itemsList.reduce(
                  (acc, item) => acc + (item.quantity || 0),
                  0
                );

                return (
                  <div key={order._id} className="transition-colors">
                    {/* Header Row */}
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                      {/* Accordion Toggle + Order ID */}
                      <div
                        onClick={() => toggleOrder(order._id)}
                        className="flex items-center gap-4 min-w-[180px] cursor-pointer"
                      >
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <svg
                            className={`w-5 h-5 transform transition-transform ${
                              isExpanded ? 'rotate-180' : 'rotate-0'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Order Number
                          </p>
                          <p className="font-mono text-xs font-bold text-amber-900">
                            #{order._id ? String(order._id).slice(-6).toUpperCase() : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Items Count */}
                      <div className="text-xs font-medium text-gray-600">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                          {totalItemsCount}{' '}
                          {totalItemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Status Badge & Date */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                            order.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
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
                    </div>

                    {/* Collapsible Order Details */}
                    {isExpanded && (
                      <div className="bg-gray-50/60 border-t border-gray-100 p-6 space-y-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Ordered Items
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {itemsList.map(({ product, quantity }, idx) => (
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
                                      <span> × OMR {Number(product.price).toFixed(2)}</span>
                                    )}
                                  </p>
                                </div>
                                {product?.price != null && (
                                  <span className="font-bold text-xs text-gray-900">
                                    OMR {(Number(product.price) * quantity).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ))}
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