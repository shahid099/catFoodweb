"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CatBackgroundImage } from '../assets/index';
import FloatingCartButton from '../Components/FloatingCartButton';
import Spinner from './Spinner';

export default function HomePage() {
  // 1. Initialize cart state (will be populated from localStorage after mount)
  const [cartItems, setCartItems] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // 2. Load cart items from localStorage when the component mounts
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error('Error reading cart from localStorage:', err);
    }
    setIsMounted(true);
  }, []);

  // 3. Save cart items to localStorage whenever `cartItems` updates
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
      } catch (err) {
        console.error('Error saving cart to localStorage:', err);
      }
    }
  }, [cartItems, isMounted]);

  // 4. Helper function to update quantity
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

  // Calculate total items for navbar/cart counter
  const totalCartCount = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  // Fetch Data State Variables
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();

        if (res.ok) {
          setProducts(data.products);
        } else {
          setError(data.error || 'Failed to load products');
        }
      } catch (err) {
        console.error(err);
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) 
    // Centers the spinner perfectly across the entire viewport
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
      <Spinner />
    </div>
  );
  if (error) return <div className="min-h-screen text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">

      {/* Hero Header Banner */}
      <header className="relative bg-gray-900 text-white py-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <Image
          src={CatBackgroundImage}
          alt="Cat eating food banner background"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Order Best Cat Food in Muscat
          </h1>
          <p className="text-gray-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto drop-shadow">
            Give your cat the healthy, simple food they deserve. From soft salmon mixes to crunchy kibble, our recipes offer great taste made with high-quality ingredients. Get 15% off your first box!
          </p>
        </div>
      </header>

      {/* Main Product Grid Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            Featured Products
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const qty = cartItems[product._id] || 0;

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col group"
              >
                {/* Product Image Container (Clickable) */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer"
                >
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-amber-900 text-white text-xs px-2.5 py-1 rounded-full font-semibold z-10 shadow-sm">
                      {product.tag}
                    </span>
                  )}
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(max-w-640px) 100vw, (max-w-768px) 50vw, (max-w-1024px) 33vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Product Info & Action Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-semibold text-gray-800 text-base md:text-lg tracking-tight group-hover:text-amber-700 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & Dynamic Cart Control */}
                  <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between gap-2">
                    <span className="text-xl font-extrabold text-gray-900">
                      <span>OMR</span> {product.price.toFixed(3)}
                    </span>

                    {qty === 0 ? (
                      <button
                        onClick={() => updateQuantity(product._id, 1)}
                        className="bg-amber-900 hover:bg-amber-800 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-sm hover:shadow"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                        <button
                          onClick={() => updateQuantity(product._id, -1)}
                          className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-amber-900 hover:text-white flex items-center justify-center font-bold text-base transition-colors shadow-sm active:scale-90"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 font-semibold text-sm text-gray-800 min-w-[2rem] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(product._id, 1)}
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

        {/* Modal Window */}
        {selectedProduct && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 text-gray-700 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              >
                ✕
              </button>

              <div className="relative w-full md:w-1/2 aspect-square bg-gray-100">
                {selectedProduct.tag && (
                  <span className="absolute top-4 left-4 bg-amber-900 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
                    {selectedProduct.tag}
                  </span>
                )}
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  fill
                  className="object-cover object-center"
                />
              </div>

              <div className="p-6 md:p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedProduct.title}
                  </h2>
                  <p className="text-2xl font-extrabold text-amber-900 mb-4">
                    OMR {selectedProduct.price.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 max-h-48 overflow-y-auto">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {cartItems[selectedProduct._id] ? (
                    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-xl">
                      <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(selectedProduct._id, -1)}
                          className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-amber-900 hover:text-white flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-gray-800">
                          {cartItems[selectedProduct._id]}
                        </span>
                        <button
                          onClick={() => updateQuantity(selectedProduct._id, 1)}
                          className="w-8 h-8 rounded-lg bg-white text-gray-700 hover:bg-amber-900 hover:text-white flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => updateQuantity(selectedProduct._id, 1)}
                      className="w-full bg-amber-900 hover:bg-amber-800 text-white font-semibold py-3 rounded-xl transition-colors shadow-md"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton
        totalCartCount={totalCartCount}
        cartItems={cartItems}
      />
    </div>
  );
}