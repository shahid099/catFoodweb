'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real-time order data from your admin endpoint
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/allorders');
        const data = await res.json();

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || 'Failed to load dashboard data.');
        }
      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
        setError('Error connecting to server.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate Real-Time Stats dynamically from orders
  const totalRevenue = orders.reduce((sum, order) => {
    const amount = order.totalAmount || order.total || order.grandTotal || 0;
    return sum + Number(amount);
  }, 0);

  const totalOrdersCount = orders.length;

  // Unique customers derived from email, phone, or name
  const uniqueCustomers = new Set(
    orders.map(
      (order) =>
        order.customer?.email ||
        order.customer?.phone ||
        order.email ||
        order.customerName ||
        order.customer?.fullName
    )
  ).size;

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: 'Live Total',
    },
    {
      title: 'Total Orders',
      value: totalOrdersCount.toString(),
      icon: ShoppingBag,
      change: 'Live Count',
    },
    {
      title: 'Products in Stock',
      value: '--', // Integrate your Product API here
      icon: Package,
      change: 'In Catalog',
    },
    {
      title: 'Active Customers',
      value: uniqueCustomers.toString(),
      icon: Users,
      change: 'Unique Buyers',
    },
  ];

  // Pick top 5 most recent orders
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-sm text-slate-500">Here is what is happening with your pet store today.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <div className="p-2 bg-slate-50 rounded-xl text-orange-500">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? '...' : stat.value}
                </span>
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Recent Orders</h3>
          <Link href="/admin/orders" className="text-xs font-semibold text-orange-500 hover:text-orange-600">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span className="text-sm">Fetching real-time orders...</span>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No orders found in the database.
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items Summary</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => {
                  const orderId = `#${(order._id || order.id || '').toString().slice(-6).toUpperCase()}`;
                  const customerName =
                    order.customerName ||
                    order.customer?.fullName ||
                    order.customer?.name ||
                    order.email ||
                    'Guest User';

                  // Item string formatting
                  const firstItem = order.items?.[0]?.product?.title || order.items?.[0]?.product?.name || 'Item';
                  const itemLength = order.items?.length || 0;
                  const itemDisplay = itemLength > 1 
                    ? `${firstItem} (+${itemLength - 1} more)` 
                    : firstItem;

                  const total = order.totalAmount || order.total || order.grandTotal || 0;
                  const status = order.status || 'Pending';

                  return (
                    <tr key={order._id || order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-semibold text-slate-900">{orderId}</td>
                      <td className="px-6 py-4">{customerName}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{itemDisplay}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        ${Number(total).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          status.toLowerCase() === 'delivered' || status.toLowerCase() === 'completed'
                            ? 'bg-emerald-50 text-emerald-700' 
                            : status.toLowerCase() === 'processing'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}