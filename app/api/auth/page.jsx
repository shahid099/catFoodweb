'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Call backend API to expire the httpOnly cookie
        await fetch('/api/auth/logout', { 
          method: 'POST',
          cache: 'no-store'
        });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setIsLoggingOut(false);

        // 2. Automatically redirect to homepage after 2 seconds
        const timer = setTimeout(() => {
          router.push('/');
          router.refresh(); // Refresh route cache
        }, 2000);

        return () => clearTimeout(timer);
      }
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center space-y-6">
        
        {isLoggingOut ? (
          /* State 1: In Progress */
          <div className="space-y-4">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Signing out...</h1>
              <p className="text-sm text-slate-500 mt-1">Clearing your session securely.</p>
            </div>
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          /* State 2: Successful Logout */
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">You have been logged out</h1>
              <p className="text-sm text-slate-500 mt-1">
                Redirecting you to the home page in 2 seconds...
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Log Back In
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Return Home <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}