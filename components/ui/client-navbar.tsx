
// Client-only navbar wrapper to prevent SSR issues
'use client';

import { useEffect, useState } from 'react';
import { Navbar } from './navbar';

export function ClientNavbar() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    // Render a basic navbar structure during SSR/hydration
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-8">
              <a 
                href="/" 
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Assessment
              </a>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-blue-400 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return <Navbar />;
}
