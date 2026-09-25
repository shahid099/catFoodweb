"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, Phone, User, ArrowRight, X } from 'lucide-react';

const DELIVERY_FEE = 0.790; // Flat delivery charge in OMR
const MINIMUM_ORDER_AMOUNT = 2.500; // Minimum subtotal required for delivery

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auth & Popup state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    area: 'Muscat',
    notes: '',
    paymentMethod: 'cash',
  });

  // Check auth status on mount and pre-fill form if logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me'); // Endpoint to verify session/JWT
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setIsLoggedIn(true);
          // Pre-fill user details if available
          setFormData((prev) => ({
            ...prev,
            fullName: data.user.name || prev.fullName,
            email: data.user.email || prev.email,
            phone: data.user.phone || prev.phone,
          }));
          return true;
        }
      }
    } catch (err) {
      console.error('Error verifying auth status:', err);
    }
    setIsLoggedIn(false);
    return false;
  };

  // Load cart data passed via localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        fetchProductDetails();
      } catch (err) {
        console.error("Failed to parse cart data", err);
        setLoadingProducts(false);
      }
    } else {
      setLoadingProducts(false);
    }
  }, []);

  // Fetch full product objects for accuracy
  const fetchProductDetails = async () => {
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

  // Safe Subtotal Calculation
  const subtotal = Object.entries(cartItems).reduce((acc, [key, val]) => {
    let itemPrice = 0;
    let itemQty = 1;

    if (typeof val === 'object' && val !== null) {
      itemPrice = parseFloat(val.price) || 0;
      itemQty = parseInt(val.quantity, 10) || 1;
    } else if (typeof val === 'number') {
      itemQty = parseInt(val, 10) || 0;
      const matchedProduct = products.find((p) => p._id === key || p.id === key);
      itemPrice = matchedProduct ? parseFloat(matchedProduct.price) || 0 : 0;
    }

    return acc + (itemPrice * itemQty);
  }, 0);

  const isCartEmpty = Object.keys(cartItems).length === 0;
  const isBelowMinimum = subtotal < MINIMUM_ORDER_AMOUNT;
  const amountNeeded = MINIMUM_ORDER_AMOUNT - subtotal;
  const grandTotal = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  // Process order execution
  const executeOrderSubmission = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          area: formData.area,
          address: formData.address,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          totalAmount: grandTotal,
          items: cartItems,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormSubmitted(true);
        localStorage.removeItem('cartItems');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCartEmpty) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    if (isBelowMinimum) {
      setErrorMessage(`Minimum order value for delivery is OMR ${MINIMUM_ORDER_AMOUNT.toFixed(3)}. Please add OMR ${amountNeeded.toFixed(3)} more worth of items.`);
      return;
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setErrorMessage('Please provide at least an Email address or Phone number so we can contact you.');
      return;
    }

    // Step 1: Check database auth status before proceeding
    const authenticated = await checkAuthStatus();

    if (!authenticated) {
      // Show modal popup if user is not logged in
      setShowAuthModal(true);
      return;
    }

    // Step 2: Proceed with order submission if logged in
    await executeOrderSubmission();
  };

  const handleAuthSuccess = (userData) => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        fullName: userData.name || prev.fullName,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
      }));
    }
    // Auto-submit order after login
    executeOrderSubmission();
  };

  if (formSubmitted) {
    const contactInfo = [formData.phone, formData.email].filter(Boolean).join(' or ');

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full text-center space-y-4 border border-gray-100">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Order Received!</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Thank you, <span className="font-semibold text-gray-800">{formData.fullName}</span>. We will contact you at <span className="font-semibold text-gray-800">{contactInfo}</span> shortly to confirm delivery to {formData.area}.
          </p>
          <div className="bg-gray-50 p-3 rounded-xl border text-xs text-gray-600">
            Payment Method: <span className="font-semibold capitalize text-gray-800">{formData.paymentMethod === 'card' ? 'Card on Delivery (POS)' : 'Cash on Delivery'}</span>
          </div>
          <Link
            href="/"
            className="inline-block w-full bg-amber-900 hover:bg-amber-800 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors mt-4"
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
        
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-amber-900 hover:underline">
          ← Continue Shopping
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout & Order Placement</h1>

        {isCartEmpty && !loadingProducts && (
          <div className="p-6 bg-white border border-gray-200 rounded-2xl text-center space-y-3">
            <p className="text-gray-700 font-medium text-sm">Your shopping cart is currently empty.</p>
            <Link
              href="/"
              className="inline-block bg-amber-900 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!isCartEmpty && isBelowMinimum && !loadingProducts && (
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {!isCartEmpty && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-3">Delivery Information</h2>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="salim@example.com"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+968 9123 4567"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 -mt-3">
              * Please provide at least one contact method (email or phone).
            </p>

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

            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items Subtotal</span>
                <span className={isBelowMinimum ? "text-red-600 font-semibold" : ""}>
                  <span className="pr-1">OMR</span>{subtotal.toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Charges</span>
                <span><span className="pr-1">OMR</span>{DELIVERY_FEE.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t">
                <span>Total Amount</span>
                <span><span className="pr-1">OMR</span>{grandTotal.toFixed(3)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || loadingProducts || isBelowMinimum || isCartEmpty}
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
        )}
      </div>

      {/* Auth Modal Popup */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

// Reusable Auth Modal Component
function AuthModal({ onClose, onSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setName('');
    setIdentifier('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() && !phone.trim()) {
        setError('Please provide either an email or a phone number.');
        return;
      }
    } else {
      if (!identifier.trim()) {
        setError('Please enter your email or phone number.');
        return;
      }
    }

    setIsLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignUp
      ? { name, email, phone, password }
      : { identifier, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden p-6 sm:p-8 border border-slate-100">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-2xl">
            🐾
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            {isSignUp
              ? 'Sign up to complete your order'
              : 'Sign in to your account to place the order'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 rounded-r-md">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label htmlFor="modal-name" className="block text-xs font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="modal-name"
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          )}

          {!isSignUp ? (
            <div>
              <label htmlFor="modal-identifier" className="block text-xs font-medium text-slate-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="modal-identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="user@example.com or +1234567890"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="modal-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="modal-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="modal-phone" className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    id="modal-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="modal-password" className="block text-xs font-medium text-slate-700 mb-1">
              Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-9 pr-9 py-2 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isSignUp ? 'Create Account & Place Order' : 'Sign In & Place Order'} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-orange-500 hover:text-orange-600 transition duration-150 focus:outline-none underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}