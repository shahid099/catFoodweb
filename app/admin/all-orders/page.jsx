"use client";

import React, { useState, useEffect, useMemo } from 'react';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

export default function AllOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [updatingId, setUpdatingId] = useState(null);

  // Search, Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('a-z'); // 'a-z', 'z-a', 'newest', 'oldest'

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/allorders');
        const data = await res.json();

        if (res.ok && data.success) {
          setOrders(data.orders);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('Error updating order status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter and sort logic
  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search term matching (Name, Phone, Area, Order ID)
        const term = searchTerm.toLowerCase().trim();
        const customerName = (order.customer?.fullName || '').toLowerCase();
        const phone = (order.customer?.phone || '').toLowerCase();
        const area = (order.customer?.area || '').toLowerCase();
        const orderId = (order._id || '').toLowerCase();

        const matchesSearch =
          !term ||
          customerName.includes(term) ||
          phone.includes(term) ||
          area.includes(term) ||
          orderId.includes(term);

        // Date range matching
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);

        let matchesStartDate = true;
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesStartDate = orderDate >= start;
        }

        let matchesEndDate = true;
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesEndDate = orderDate <= end;
        }

        return matchesSearch && matchesStartDate && matchesEndDate;
      })
      .sort((a, b) => {
        if (sortBy === 'a-z') {
          return (a.customer?.fullName || '').localeCompare(b.customer?.fullName || '');
        }
        if (sortBy === 'z-a') {
          return (b.customer?.fullName || '').localeCompare(a.customer?.fullName || '');
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      });
  }, [orders, searchTerm, startDate, endDate, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-gray-600 font-medium">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  const totalOrders = filteredAndSortedOrders.length;
  const pendingOrders = filteredAndSortedOrders.filter((o) => o.status === 'Pending').length;
  const totalRevenue = filteredAndSortedOrders.reduce((sum, order) => {
    const orderTotal = Array.isArray(order.items)
      ? order.items.reduce((itemSum, item) => itemSum + ((item.product?.price || 0) * item.quantity), 0)
      : 0;
    return sum + orderTotal;
  }, 0);

  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSortBy('a-z');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              All Orders Archive
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse, filter by date, and search through all historical orders from A to Z
            </p>
          </div>
        </div>

        {/* Analytics Cards (Reflects Filtered Results) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filtered Orders
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Pending Deliveries
            </p>
            <p className="text-2xl font-bold text-amber-900 mt-2">{pendingOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Filtered Revenue
            </p>
            <p className="text-2xl font-bold text-emerald-900 mt-2">
              OMR {totalRevenue.toFixed(3)}
            </p>
          </div>
        </div>

        {/* Search & Date Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Name, phone, area, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition-colors bg-gray-50/50"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition-colors bg-gray-50/50 text-gray-700"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition-colors bg-gray-50/50 text-gray-700"
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-500 transition-colors bg-gray-50/50 text-gray-700 cursor-pointer"
              >
                <option value="a-z">Customer Name (A to Z)</option>
                <option value="z-a">Customer Name (Z to A)</option>
                <option value="newest">Date (Newest First)</option>
                <option value="oldest">Date (Oldest First)</option>
              </select>
            </div>
          </div>

          {(searchTerm || startDate || endDate || sortBy !== 'a-z') && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-amber-900 hover:text-amber-700 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Orders List Container */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-800">All Orders</h2>
            <span className="text-xs font-semibold text-gray-400">
              Showing {filteredAndSortedOrders.length} of {orders.length}
            </span>
          </div>

          {filteredAndSortedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No orders found matching your search or date criteria.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAndSortedOrders.map((order) => {
                const itemsList = Array.isArray(order.items) ? order.items : [];
                const isExpanded = !!expandedOrders[order._id];

                const totalItemsCount = itemsList.reduce((acc, item) => acc + item.quantity, 0);
                const orderTotal = itemsList.reduce(
                  (sum, item) => sum + (item.product?.price || 0) * item.quantity,
                  0
                );

                return (
                  <div key={order._id} className="transition-colors">
                    {/* Header Row */}
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors">
                      {/* Left: Accordion Toggle + ID + Customer */}
                      <div
                        onClick={() => toggleOrder(order._id)}
                        className="flex items-center gap-4 min-w-[220px] cursor-pointer"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div>
                          <p className="font-mono text-xs font-bold text-amber-900">
                            #{order._id.slice(-6)}
                          </p>
                          <p className="font-semibold text-gray-900 text-sm mt-0.5">
                            {order.customer?.fullName}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="text-xs text-gray-600 min-w-[150px]">
                        <p className="font-medium text-gray-800">{order.customer?.phone}</p>
                        <p className="text-gray-400">{order.customer?.area}</p>
                      </div>

                      {/* Items Brief */}
                      <div className="text-xs font-medium text-gray-600">
                        <span className="bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                          {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>

                      {/* Total Price */}
                      <div className="font-bold text-sm text-gray-900">
                        OMR {orderTotal.toFixed(3)}
                        <div className="flex font-extralight text-xs text-gray-500">{order.paymentMethod}</div>
                      </div>

                      {/* Interactive Status Selector */}
                      <div className="flex items-center gap-3">
                        <select
                          disabled={updatingId === order._id}
                          value={order.status || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border border-transparent outline-none cursor-pointer transition-colors ${
                            order.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : order.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status} className="bg-white text-gray-800">
                              {status}
                            </option>
                          ))}
                        </select>

                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Collapsible Details Body */}
                    {isExpanded && (
                      <div className="bg-gray-50/60 border-t border-gray-100 p-6 space-y-4">
                        {/* Delivery Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 bg-white p-4 rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                              Delivery Address
                            </p>
                            <p className="mt-1 font-medium text-gray-900">
                              {order.customer?.address}, {order.customer?.area}
                            </p>
                          </div>
                          {order.customer?.notes && (
                            <div>
                              <p className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">
                                Customer Note
                              </p>
                              <p className="mt-1 italic text-amber-900">
                                "{order.customer.notes}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Items List */}
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                            Ordered Items
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {itemsList.map(({ product, quantity }, idx) => (
                              <div
                                key={product?._id || idx}
                                className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100"
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
                                    Qty: <span className="font-bold text-gray-700">{quantity}</span> × OMR {(product?.price || 0).toFixed(2)}
                                  </p>
                                </div>
                                <span className="font-bold text-xs text-gray-900">
                                  OMR {((product?.price || 0) * quantity).toFixed(2)}
                                </span>
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
      </div>
    </div>
  );
}