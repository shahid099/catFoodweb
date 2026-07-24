"use client";

import { useState } from 'react';
import Image from 'next/image';
import { CatBackgroundImage } from '../assets/index'
import FloatingCartButton from '../Components/FloatingCartButton'

import { MOCK_PRODUCTS } from './productsData'; // Adjust to where you saved the mock data


export default function HomePage() {

  // 1. State to track quantities by product ID (e.g., { 1: 2, 3: 1 })
  const [cartItems, setCartItems] = useState({});

  // 2. Helper functions to update quantity
  const updateQuantity = (productId, delta) => {
    setCartItems((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[productId]; // Remove item if quantity hits 0
        return updated;
      }

      return { ...prev, [productId]: newQty };
    });
  };

  // Calculate total items for your navbar/cart counter
  const totalCartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">

      {/* 2. Hero Header Banner */}
      <header className="relative bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* 1. Background Image using Next.js Image */}
        <Image
          src={CatBackgroundImage}
          alt="Cat eating food banner background"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* 2. Dark Overlay (Ensures text stays readable regardless of image brightness) */}
        <div className="absolute inset-0 bg-black/55" />

        {/* 3. Text Content (Must be relative + z-10 to sit above the image and overlay) */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Order Best Cat Food in Muscat
          </h1>
          <p className="text-gray-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto drop-shadow">
            Spoil your favorite feline with recipes they will actually crave! From premium salmon patés to crunchy grain-free kibble, we make healthy cat food that keeps tails wagging and bowls empty. Grab 15% off your first box!
          </p>
        </div>
      </header>

      {/* 3. Main Product Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Featured Products
          </h2>
        </div>

        {/* Responsive Grid Setup: 1 Column Mobile -> 2 Tablet -> 3 Medium Screen -> 4 Desktop */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => {
            const qty = cartItems[product.id] || 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group"
              >
                {/* Product Image Container */}
                <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-amber-900 text-white text-xs px-2.5 py-1 rounded-full font-semibold z-10 shadow-sm">
                      {product.tag}
                    </span>
                  )}
                  <Image
                    src={product.image}
                    alt={product.title}
                    placeholder="blur"
                    fill
                    sizes="(max-w-640px) 100vw, (max-w-768px) 50vw, (max-w-1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info & Action Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 className="font-semibold text-gray-800 text-base md:text-lg tracking-tight group-hover:text-amber-700 transition-colors line-clamp-1">
                      {product.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & Dynamic Cart Control */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                    <span className="text-xl font-extrabold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>

                    {/* Dynamic Button / Counter Controller */}
                    {qty === 0 ? (
                      /* State 1: Standard Add to Cart Button */
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      /* State 2: Quantity Controls (+ / -) */
                      <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-amber-900 hover:text-white flex items-center justify-center font-bold text-base transition-colors shadow-sm active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 font-semibold text-sm text-gray-800 min-w-[2rem] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-amber-900 hover:text-white flex items-center justify-center font-bold text-base transition-colors shadow-sm active:scale-90"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 🛒 Floating Cart Button */}

      <FloatingCartButton
        totalCartCount={totalCartCount}
        cartItems={cartItems}
      />

    </div>
  );
}