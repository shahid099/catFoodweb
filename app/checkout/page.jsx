"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DELIVERY_FEE = 0.790; // Flat delivery charge in OMR
const MINIMUM_ORDER_AMOUNT = 2.500; // Minimum subtotal required for delivery

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    area: 'Muscat',
    notes: '',
    paymentMethod: 'cash',
  });

  // 1. Load cart data passed via localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cat_food_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);

        // Fetch products if cart stores product IDs
        fetchProductDetails(parsedCart);
      } catch (err) {
        console.error("Failed to parse cart data", err);
        setLoadingProducts(false);
      }
    } else {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch full product objects for accuracy
  const fetchProductDetails = async (cart) => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data || []);
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Safe Subtotal Calculation
  const subtotal = Object.entries(cartItems).reduce((acc, [key, val]) => {
    let itemPrice = 0;
    let itemQty = 1;

    if (typeof val === 'object' && val !== null) {
      // If object structure: { price: 2.500, quantity: 2 }
      itemPrice = parseFloat(val.price) || 0;
      itemQty = parseInt(val.quantity, 10) || 1;
    } else if (typeof val === 'number') {
      // If key-value structure: { "productId": quantity }
      itemQty = parseInt(val, 10) || 0;
      const matchedProduct = products.find((p) => p._id === key || p.id === key);
      itemPrice = matchedProduct ? parseFloat(matchedProduct.price) || 0 : 0;
    }

    return acc + (itemPrice * itemQty);
  }, 0);

  // Minimum order validation checks
  const isBelowMinimum = subtotal < MINIMUM_ORDER_AMOUNT;
  const amountNeeded = MINIMUM_ORDER_AMOUNT - subtotal;
  const grandTotal = subtotal + DELIVERY_FEE;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if subtotal is below minimum threshold
    if (isBelowMinimum) {
      setErrorMessage(`Minimum order value for delivery is OMR ${MINIMUM_ORDER_AMOUNT.toFixed(3)}. Please add OMR ${amountNeeded.toFixed(3)} more worth of items.`);
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          totalAmount: grandTotal,
          items: cartItems,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormSubmitted(true);
        localStorage.removeItem('cat_food_cart');
      } else {
        setErrorMessage(data.error || 'Failed to submit order. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
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
          <div className="bg-gray-50 p-3 rounded-xl border text-xs text-gray-600">
            Payment Method: <span className="font-semibold capitalize text-gray-800">{formData.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Card on Delivery (POS)'}</span>
          </div>
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

        {/* Minimum Order Warning Alert */}
        {isBelowMinimum && !loadingProducts && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">Delivery Minimum Not Met</p>
              <p className="text-xs text-amber-800">
                Delivery is only available for orders of <strong>OMR {MINIMUM_ORDER_AMOUNT.toFixed(3)}</strong> or more. 
                Please add <strong>OMR {amountNeeded.toFixed(3)}</strong> worth of items to continue.
              </p>
            </div>
            <Link
              href="/"
              className="inline-block bg-amber-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-amber-800 text-center transition-colors whitespace-nowrap"
            >
              + Add Items
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

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
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
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
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
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
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
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
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
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
              className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
            />
          </div>

          {/* Payment Method Option */}
          <div className="pt-2 border-t">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Payment Method *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                formData.paymentMethod === 'cash' 
                  ? 'bg-amber-50 border-amber-900 ring-1 ring-amber-900' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="accent-amber-900 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Cash on Delivery</span>
                  <span className="text-xs text-gray-500 block">Pay with exact cash upon receipt</span>
                </div>
              </label>

              <label className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                formData.paymentMethod === 'card' 
                  ? 'bg-amber-50 border-amber-900 ring-1 ring-amber-900' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="accent-amber-900 w-4 h-4"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">Card on Delivery</span>
                  <span className="text-xs text-gray-500 block">Pay via card machine upon delivery</span>
                </div>
              </label>
            </div>
          </div>

          {/* Price Summary Breakdown */}
          <div className="pt-3 border-t space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Items Subtotal</span>
              <span className={isBelowMinimum ? "text-red-600 font-semibold" : ""}>
                <span className="px-1">OMR</span>{subtotal.toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Charges</span>
              <span><span className="px-1">OMR</span>{DELIVERY_FEE.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
              <span>Total Amount</span>
              <span><span className="px-1">OMR</span>{grandTotal.toFixed(3)}</span>
            </div>
          </div>

          {/* Submit Button - Disabled if below minimum */}
          <button
            type="submit"
            disabled={loading || loadingProducts || isBelowMinimum}
            className="w-full bg-amber-900 hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-colors text-sm flex items-center justify-center gap-2"
          >
            {isBelowMinimum ? (
              `Minimum Order OMR ${MINIMUM_ORDER_AMOUNT.toFixed(3)} Required`
            ) : loading ? (
              'Processing Order...'
            ) : (
              `Place Order (OMR ${grandTotal.toFixed(3)})`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}