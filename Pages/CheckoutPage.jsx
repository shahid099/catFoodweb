"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    area: 'Muscat',
    notes: '',
  });

  // Load cart data passed via localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cat_food_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error("Failed to parse cart data", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can integrate your backend API or send data to WhatsApp/Database
    setFormSubmitted(true);
    localStorage.removeItem('cat_food_cart'); // Clear cart after order placement
  };

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Order Received!</h2>
          <p className="text-sm text-gray-600">
            Thank you, <span className="font-semibold">{formData.fullName}</span>. We will contact you at <span className="font-semibold">{formData.phone}</span> shortly to confirm delivery to {formData.area}.
          </p>
          <Link
            href="/"
            className="inline-block bg-amber-900 hover:bg-amber-800 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors mt-4"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation back */}
        <Link href="/" className="inline-flex items-center text-sm font-medium text-amber-900 hover:underline">
          ← Continue Shopping
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout & Order Placement</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Delivery Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Salim Al-Busaidi"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Phone / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+968 9123 4567"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
              />
            </div>
          </div>

          {/* Area / City */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Area / City *
            </label>
            <input
              type="text"
              name="area"
              required
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. Al Khuwair, Muscat"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Detailed Street Address / Way No. *
            </label>
            <textarea
              name="address"
              required
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="Building name, apartment number, way number..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
            />
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Delivery Notes (Optional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Call before arrival or leave with security"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
            />
          </div>

          {/* Payment Method Option */}
          <div className="pt-2 border-t">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Payment Method</h3>
            <div className="flex items-center space-x-3 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <input type="radio" id="cod" name="payment" defaultChecked className="accent-amber-900" />
              <label htmlFor="cod" className="text-sm font-medium text-amber-950">
                Cash / Card on Delivery
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors text-sm"
          >
            Place Order Now
          </button>
        </form>
      </div>
    </div>
  );
}