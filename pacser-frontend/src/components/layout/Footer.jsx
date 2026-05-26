import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mt-auto shrink-0 w-full z-10 relative transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Branding */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-xl">
                Pa<span className="text-blue-600">CSE</span>r
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                Empowering your journey to civil service success.
              </p>
              <p className="text-slate-400 text-xs italic font-medium">
                Made with ❤️ for Filipino Aspirants
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-slate-900 dark:text-white font-extrabold mb-2 text-base tracking-tight">Quick Links</h3>
            <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Home</Link>
            <Link to="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Dashboard</Link>
            <Link to="/learn" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Learn</Link>
            <Link to="/leaderboards" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Leaderboards</Link>
            <Link to="/shop" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Shop</Link>
          </div>

          {/* Column 3: Support */}
          <div className="flex flex-col gap-3">
            <h3 className="text-slate-900 dark:text-white font-extrabold mb-2 text-base tracking-tight">Support</h3>
            <Link to="/contact" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Contact Us</Link>
            <Link to="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">FAQ</Link>
            <Link to="#" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors w-fit font-medium">Privacy Policy</Link>
          </div>

          {/* Column 4: Social */}
          <div className="flex flex-col gap-4">
            <h3 className="text-slate-900 dark:text-white font-extrabold mb-1 text-base tracking-tight">Follow Us</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center transition-all group hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center transition-all group hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center transition-all group hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">© 2026 PaCSEr. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}



