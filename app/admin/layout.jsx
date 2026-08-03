'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  LogOut, 
  LayoutDashboard, 
  Bell 
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Security Check: Verify user role on layout mount
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

  // Prevent rendering layout if unauthorized
  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 gap-3 bg-slate-950 border-b border-slate-800">
            <span className="text-2xl">🐾</span>
            <div>
              <h1 className="font-bold text-white text-base leading-none">Hasnan's Pets</h1>
              <span className="text-xs text-orange-400 font-medium">Admin Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname === '/admin' 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>

            <Link
              href="/admin/products/add"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith('/admin/products')
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-5 h-5" />
              Add Products
            </Link>

            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith('/admin/orders')
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Orders
            </Link>

            <Link
              href="/admin/customers"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                pathname.startsWith('/admin/customers')
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
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
      <div className="flex-1 flex flex-col min-w-0">
        
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

        {/* Dynamic Admin Page Content */}
        <main className="p-6 space-y-6 overflow-y-auto flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}