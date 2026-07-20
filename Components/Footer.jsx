import Image from 'next/image';
import logo from '../assets/logo.jpeg'; // Reuses your logo import pattern

export default function Footer() {
  return (
    <footer className="bg-amber-950 text-amber-50/90 border-t border-amber-900/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Info, Links, and Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-amber-900">
          
          {/* Brand & About Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center cursor-pointer">
              <Image
                src={logo}
                alt="Cat Food Brand Logo"
                className="h-12 w-12 object-contain" // Makes your dark logo white to match the footer background
              />
            </div>
            <p className="text-sm leading-relaxed max-w-sm text-amber-200/70">
              Crafting premium, biologically appropriate recipes to keep your tiny lions thriving, active, and purring from kittenhood to their golden years.
            </p>
            {/* Social Media Links */}
            <div className="flex space-x-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Instagram">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.5 6.5h.01" />
                  <rect x="2" y="2" width="20" height="20" rx="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Facebook">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors" aria-label="TikTok">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.15 1.13 1.18 2.69 1.83 4.31 1.94v3.91c-1.32-.17-2.61-.71-3.65-1.54-.51-.41-.95-.91-1.3-1.47v6.62c.02 1.93-.47 3.87-1.49 5.42-1.42 2.06-3.83 3.42-6.38 3.46-3.08.01-5.99-1.74-7.3-4.53-1.39-2.88-1.01-6.42.98-8.89 1.49-1.8 3.8-2.83 6.13-2.69v3.97c-1.12-.13-2.28.32-3.02 1.16-.76.91-.86 2.27-.24 3.29.57.99 1.69 1.61 2.83 1.53 1.34-.05 2.51-1.05 2.73-2.38.07-.4.08-.81.08-1.21V0z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider text-amber-400 uppercase">Shop Recipes</h4>
            <ul className="space-y-2 text-sm text-amber-200/60">
              <li><a href="#kitten" className="hover:text-amber-300 transition-colors">Kitten Formulas</a></li>
              <li><a href="#adult" className="hover:text-amber-300 transition-colors">Adult Wet Food</a></li>
              <li><a href="#grain-free" className="hover:text-amber-300 transition-colors">Grain-Free Kibble</a></li>
              <li><a href="#treats" className="hover:text-amber-300 transition-colors">Freeze-Dried Treats</a></li>
            </ul>
          </div>

          {/* Customer Care Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider text-amber-400 uppercase">Support</h4>
            <ul className="space-y-2 text-sm text-amber-200/60">
              <li><a href="#track" className="hover:text-amber-300 transition-colors">Track Auto-Ship</a></li>
              <li><a href="#shipping" className="hover:text-amber-300 transition-colors">Shipping & Returns</a></li>
              <li><a href="#faqs" className="hover:text-amber-300 transition-colors">FAQ & Help</a></li>
              <li><a href="#contact" className="hover:text-amber-300 transition-colors">Contact Cat Experts</a></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="space-y-3 md:col-span-2 lg:col-span-1">
            <h4 className="text-sm font-bold tracking-wider text-amber-400 uppercase">Join the Club</h4>
            <p className="text-xs text-amber-200/60 leading-relaxed">
              Subscribe for wholesale pricing drop notifications and 15% off your first box.
            </p>
            <form className="mt-2 flex max-w-md">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full bg-amber-900/40 text-amber-50 px-3 py-2 text-xs rounded-l-xl border border-amber-800/80 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-amber-200/30"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-4 py-2 text-xs rounded-r-xl transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Legal Section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-amber-200/40 gap-4">
          
          {/* Vet Disclaimer (Crucial for pet food compliance) */}
          <p className="max-w-md text-center md:text-left leading-normal">
            Disclaimer: Statements have not been evaluated by the FDA. Our food is designed for dynamic feline nutrition; consult your veterinarian for specialized prescription diets.
          </p>

          {/* Legal Links & Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex space-x-4">
              <a href="#privacy" className="hover:text-amber-300 transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-amber-300 transition-colors">Terms of Service</a>
            </div>
            <p>© 2026 WhiskerFeast Co. All rights reserved.</p>
          </div>

        </div>

      </div>
    </footer>
  );
}