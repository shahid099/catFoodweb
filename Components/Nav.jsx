"use client"
import { useState } from 'react';
import Image from 'next/image';
import Logo from '../assets/logo.jpeg'
export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer">
              <Image src={Logo} alt='Logo' priority className="h-14 w-auto object-contain"/>
            </span>
          </div>

          {/* Desktop Search Bar (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-50 text-gray-900 pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Desktop Right Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Categories</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">AboutUs</a>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-sm transition-colors">
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-100 transition-all`} id="mobile-menu">
        <div className="px-4 pt-2 pb-4 space-y-3">
          {/* Mobile Search Bar */}
          <div className="relative w-full mt-1">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-50 text-gray-900 pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Mobile Links */}
          <a href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            Categories
          </a>
          <a href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600">
            AboutUs
          </a>
          
          {/* Mobile Login Button */}
          <div className="pt-2 border-t border-gray-100">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-base font-medium shadow-sm transition-colors">
              Login
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

