"use client";

import React, { useState } from 'react';
import Image from 'next/image';
// import Navbar from './components/Navbar'; // Adjust this path to where your Navbar file lives
import { MOCK_PRODUCTS } from './productsData'; // Adjust to where you saved the mock data

export default function HomePage() {
  // Simple state to keep track of items added to the cart
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = (productTitle) => {
    setCartCount(prev => prev + 1);
    alert(`Added "${productTitle}" to your cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* 1. Responsive Navbar Hookup */}
      {/* <Navbar /> */}

      {/* 2. Hero Header Banner */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Summer Essentials Collection
          </h1>
          <p className="text-blue-100 text-base sm:text-lg">
            Discover premium engineered gear curated specifically for your everyday comfort and lifestyle.
          </p>
        </div>
      </header>

      {/* 3. Main Product Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Featured Products
          </h2>
          <div className="bg-blue-50 text-blue-700 text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold">
            Cart Items: <span className="font-bold">{cartCount}</span>
          </div>
        </div>

        {/* Responsive Grid Setup: 1 Column Mobile -> 2 Tablet -> 3 Medium Screen -> 4 Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group"
            >
              {/* Product Image Container */}
              <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                {product.tag && (
                  <span className="absolute top-3 left-3 bg-gray-900 text-white text-xs px-2.5 py-1 rounded-full font-semibold z-10 shadow-sm">
                    {product.tag}
                  </span>
                )}
                <Image
                  src={product.image}
                  alt={product.title}
                  placeholder="blur" // Adds smooth native Next.js loading blur
                  fill
                  sizes="(max-w-640px) 100vw, (max-w-768px) 50vw, (max-w-1024px) 33vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Product Info & Action Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title */}
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Pricing & Add to Cart Action */}
                <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                  <span className="text-xl font-extrabold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  
                  <button
                    onClick={() => handleAddToCart(product.title)}
                    className="bg-gray-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}