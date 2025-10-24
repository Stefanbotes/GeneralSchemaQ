
// Navigation bar with authentication state
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, Shield, BarChart3, ChevronDown } from 'lucide-react';

export function Navbar() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session, status } = useSession() || {};

  useEffect(() => {
    setIsHydrated(true);
    
    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showUserMenu && !target.closest('.relative')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  if (!isHydrated) {
    // Render a loading state during hydration
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-8">
              <Link 
                href="/" 
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Assessment
              </Link>
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-8">
            <Link 
              href="/" 
              className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Assessment
            </Link>
            
            {session && (
              <Link 
                href="/dashboard" 
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Dashboard
              </Link>
            )}

            {session?.user?.role === 'ADMIN' && (
              <Link 
                href="/admin" 
                className="text-white hover:text-blue-100 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-blue-400 rounded"></div>
              </div>
            ) : session?.user ? (
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-blue-100 hover:bg-blue-500/20"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label={`User menu for ${session.user.firstName}`}
                  title={`Open user menu for ${session.user.firstName} ${session.user.lastName}`}
                >
                  <User className="h-4 w-4 mr-2" />
                  {session.user.firstName}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b">
                        <div className="font-medium text-gray-900">
                          {session.user.firstName} {session.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{session.user.email}</div>
                        <div className="text-xs text-gray-400 capitalize">
                          {session.user.role?.toLowerCase() || 'user'}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => { setShowUserMenu(false); window.location.href = '/profile'; }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); window.location.href = '/dashboard'; }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </button>

                      {session.user.role === 'ADMIN' && (
                        <button
                          onClick={() => { setShowUserMenu(false); window.location.href = '/admin'; }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </button>
                      )}

                      <div className="border-t my-1"></div>
                      
                      <button
                        onClick={() => { setShowUserMenu(false); handleSignOut(); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:text-blue-100 hover:bg-blue-500/20">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
