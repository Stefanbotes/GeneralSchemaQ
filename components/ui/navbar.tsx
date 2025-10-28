// components/ui/navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, User, LogIn, LogOut, Settings, Shield, LayoutDashboard } from 'lucide-react';
import { useMemo } from 'react';

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const authed = status === 'authenticated';

  // --- Keep callbacks on the same deploy (preview/prod/local) ---
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const returnTo = origin + (pathname || '/');

  // Build safe name / initials without assuming firstName/lastName types
  const displayName = useMemo(() => {
    const u = session?.user;
    if (!u) return 'Account';
    const nameFromDefault = u.name?.trim();
    if (nameFromDefault) return nameFromDefault;

    const first = (u as any)?.firstName as string | undefined;
    const last = (u as any)?.lastName as string | undefined;
    const fallback = [first, last].filter(Boolean).join(' ').trim();
    return fallback || (u.email ?? 'Account');
  }, [session]);

  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
    return letters.toUpperCase() || 'U';
  }, [displayName]);

  const role = (session?.user as any)?.role ?? 'CLIENT';
  const isVerified = Boolean(session?.user?.emailVerified); // Date|null → boolean

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/assessment', label: 'Assessment' },
    { href: '/results', label: 'Results' },
  ];

  // Role-gated links
  const adminLinks =
    role === 'ADMIN'
      ? [
          { href: '/admin', label: 'Admin', icon: <Shield className="h-4 w-4 mr-2" /> },
        ]
      : [];
  const coachLinks =
    role === 'COACH' || role === 'ADMIN'
      ? [
          { href: '/coach', label: 'Coach', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> },
        ]
      : [];

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-[#fcd0b1]-700">
              Inner Personas
            </Link>

            {/* Primary nav (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={classNames(
                    'rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100',
                    pathname === l.href && 'bg-gray-100 font-medium text-gray-900'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Auth / Profile */}
          <div className="flex items-center gap-2">
            {!authed ? (
              <Button
                onClick={() =>
