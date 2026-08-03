'use client';

import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Plus 
} from 'lucide-react';

export default function AdminDashboard() {
  // Stats summary data
  const stats = [
    { title: 'Total Revenue', value: '$12,450.00', icon: DollarSign, change: '+12.5%' },
    { title: 'Total Orders', value: '184', icon: ShoppingBag, change: '+8.2%' },
    { title: 'Products in Stock', value: '45', icon: Package, change: '3 low stock' },
    { title: 'Active Customers', value: '312', icon: Users, change: '+18 this month' },
  ];

  // Recent orders data
  const recentOrders = [
    { id: '#ORD-1092', customer: 'Sarah Connor', item: 'Premium Salmon Cat Food (5kg)', total: '$48.50', status: 'Delivered' },
    { id: '#ORD-1091', customer: 'Michael Scott', item: 'Grain-Free Chicken Kibble', total: '$32.00', status: 'Processing' },
    { id: '#ORD-1090', customer: 'Emma Watson', item: 'Organic Kitten Formula (2kg)', total: '$24.99', status: 'Pending' },
    { id: '#ORD-1089', customer: 'David Beckham', item: 'Salmon Treats Pack of 3', total: '$18.00', status: 'Delivered' },
  ];

  return (
    <>
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
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
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
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
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.map((order, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{order.id}</td>
                  <td className="px-6 py-4">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-500">{order.item}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : order.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}