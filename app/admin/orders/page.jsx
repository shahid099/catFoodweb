"use client";

import React, { useState, useEffect } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders');
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

  // Summary Metrics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Orders Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and review customer orders
            </p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Orders
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalOrders}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Pending Deliveries
            </p>
            <p className="text-2xl font-bold text-amber-900 mt-2">{pendingOrders}</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              No orders found yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Contact / Area</th>
                    <th className="py-3 px-6">Items Count</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                  {orders.map((order) => {
                    // Calculate total quantity of items ordered
                    const itemCount = order.items
                      ? Object.values(order.items).reduce((a, b) => a + Number(b), 0)
                      : 0;

                    return (
                      <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-medium text-gray-500">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-gray-900">
                            {order.customer?.fullName}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {order.customer?.address}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-medium">{order.customer?.phone}</p>
                          <p className="text-xs text-gray-500">{order.customer?.area}</p>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-800">
                          {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}