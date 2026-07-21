"use client";
import Link from 'next/link';

export default function FloatingCartButton({ totalCartCount = 0, cartItems = {} }) {
  const handleSaveCart = () => {
    // Persists the current cart items so the checkout page can access them
    localStorage.setItem('cat_food_cart', JSON.stringify(cartItems));
  };

  return (
    <Link
      href="/checkout"
      onClick={handleSaveCart}
      className="fixed bottom-6 left-6 z-50 bg-amber-900 hover:bg-amber-800 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center group"
      aria-label="Proceed to Checkout"
    >
      {/* Dynamic Item Badge Count */}
      {totalCartCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-amber-950 text-xs font-extrabold h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
          {totalCartCount > 99 ? '99+' : totalCartCount}
        </span>
      )}

      {/* Shopping Cart / Trolley Icon */}
      <svg
        className="w-6 h-6 fill-none stroke-current"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>

      <span className="max-w-0 overflow-hidden whitespace-nowrap inline-block text-sm font-medium transition-all duration-300 group-hover:max-w-xs group-hover:pl-2">
        Checkout
      </span>
    </Link>
  );
}