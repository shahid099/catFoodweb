'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Plus, 
  LogOut, 
  LayoutDashboard, 
  Settings,
  Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Layer 2 Security Check: Verify user role on component mount
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (res.ok && data.user?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          router.replace('/'); // Redirect regular users to homepage
        }
      } catch (err) {
        console.error('Auth check error:', err);
        router.replace('/login'); // Redirect unauthenticated users to login
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [router]);


  // Dummy data — replace with actual MongoDB fetch calls
  const stats = [
    { title: 'Total Revenue', value: '$12,450.00', icon: DollarSign, change: '+12.5%' },
    { title: 'Total Orders', value: '184', icon: ShoppingBag, change: '+8.2%' },
    { title: 'Products in Stock', value: '45', icon: Package, change: '3 low stock' },
    { title: 'Active Customers', value: '312', icon: Users, change: '+18 this month' },
  ];

  const recentOrders = [
    { id: '#ORD-1092', customer: 'Sarah Connor', item: 'Premium Salmon Cat Food (5kg)', total: '$48.50', status: 'Delivered' },
    { id: '#ORD-1091', customer: 'Michael Scott', item: 'Grain-Free Chicken Kibble', total: '$32.00', status: 'Processing' },
    { id: '#ORD-1090', customer: 'Emma Watson', item: 'Organic Kitten Formula (2kg)', total: '$24.99', status: 'Pending' },
    { id: '#ORD-1089', customer: 'David Beckham', item: 'Salmon Treats Pack of 3', total: '$18.00', status: 'Delivered' },
  ];

  // Loading state while checking authorization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-slate-600 font-semibold text-sm">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Verifying administrative permissions...
        </div>
      </div>
    );
  }

  // Prevent rendering UI if unauthorized
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 gap-3 bg-slate-950 border-b border-slate-800">
            <span className="text-2xl">🐾</span>
            <div>
              <h1 className="font-bold text-white text-base leading-none">Maryam's Pets</h1>
              <span className="text-xs text-orange-400 font-medium">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                activeTab === 'overview' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <Package className="w-5 h-5" />
              Products
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <ShoppingBag className="w-5 h-5" />
              Orders
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <Users className="w-5 h-5" />
              Customers
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          >
            <LogOut className="w-4 h-4" />
            Exit to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm">
                A
              </div>
              <span className="text-sm font-semibold text-slate-700">Admin Account</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-6 space-y-6 overflow-y-auto">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Here is what is happening with your pet store today.</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/products/new"
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

        </main>
      </div>

    </div>
  );
}