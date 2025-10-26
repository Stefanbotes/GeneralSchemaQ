// components/navbar.tsx
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

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Skeleton (pre-hydration) – keep visuals consistent with theme
  if (!isHydrated) {
    return (
      <nav className="bg-gradient-to-r from-primary to-accent shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex space-x-8">
              <Link
                href="/"
                className="text-primary-foreground/90 hover:text-primary-foreground px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Assessment
              </Link>
            </div>
            <div className="flex items-center">
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-primary/40 rounded" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-primary to-accent shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left links */}
          <div className="flex space-x-8">
            <Link
              href="/"
              className="text-primary-foreground hover:text-primary-foreground/80 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Assessment
            </Link>

            {session && (
              <Link
                href="/dashboard"
                className="text-primary-foreground hover:text-primary-foreground/80 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Dashboard
              </Link>
            )}

            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-primary-foreground hover:text-primary-foreground/80 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-primary/40 rounded" />
              </div>
            ) : session?.user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary/20"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-haspopup="menu"
                  aria-expanded={showUserMenu}
                  aria-label={`User menu for ${session.user.firstName}`}
                  title={`Open user menu for ${session.user.firstName} ${session.user.lastName}`}
                >
                  <User className="h-4 w-4 mr-2" />
                  {session.user.firstName}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-lg z-50"
                    role="menu"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-border">
                        <div className="font-medium">
                          {session.user.firstName} {session.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{session.user.email}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {session.user.role?.toLowerCase() || 'user'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = '/profile';
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = '/dashboard';
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                        role="menuitem"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </button>

                      {session.user.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            window.location.href = '/admin';
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                          role="menuitem"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </button>
                      )}

                      <div className="border-t my-1 border-border" />

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleSignOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center"
                        role="menuitem"
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
                  <Button variant="ghost" className="text-primary-foreground hover:bg-primary/20">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="outline"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
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
