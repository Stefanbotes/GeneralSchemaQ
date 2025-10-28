// components/ui/navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const authed = status === 'authenticated';

  // Keep callbacks on the same deploy (preview/prod/local)
  const origin =
    typeof window !== 'undefined' && typeof window.location?.origin === 'string'
      ? window.location.origin
      : '';
  const returnTo = origin + (pathname || '/');

  // Build safe name / initials without assuming firstName/lastName types
  const displayName = useMemo(() => {
    const u = session?.user;
    if (!u) return 'Account';
    const nameFromDefault = (u.name || '').trim();
    if (nameFromDefault) return nameFromDefault;

    const first = (u as any)?.firstName as string | undefined;
    const last = (u as any)?.lastName as string | undefined;
    const fallback = [first, last].filter(Boolean).join(' ').trim();
    return fallback || u.email || 'Account';
  }, [session]);

  const initials = useMemo(() => {
    const parts = displayName.split(/\s+/).filter(Boolean);
    const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
    return (letters || 'U').toUpperCase();
  }, [displayName]);

  const role = (session?.user as any)?.role ?? 'CLIENT';
  const isVerified = Boolean((session?.user as any)?.emailVerified);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/assessment', label: 'Assessment' },
    { href: '/results', label: 'Results' },
  ];

  const adminLinks =
    role === 'ADMIN'
      ? [{ href: '/admin', label: 'Admin', icon: <Shield className="h-4 w-4 mr-2" /> }]
      : [];

  const coachLinks =
    role === 'COACH' || role === 'ADMIN'
      ? [{ href: '/coach', label: 'Coach', icon: <LayoutDashboard className="h-4 w-4 mr-2" /> }]
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
                onClick={() => signIn(undefined, { callbackUrl: returnTo })}
                size="sm"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{displayName}</span>
                    <span className="inline sm:hidden rounded-full bg-[#fcd0b1]-600 text-white h-6 w-6 grid place-items-center text-xs">
                      {initials}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="flex flex-col">
                    <span className="font-medium">{displayName}</span>
                    <span className="text-xs text-gray-500 truncate">{session?.user?.email}</span>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{role}</Badge>
                      {isVerified ? (
                        <Badge variant="secondary">Verified</Badge>
                      ) : (
                        <Badge variant="destructive">Unverified</Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>

                  {coachLinks.map((l) => (
                    <Link key={l.href} href={l.href}>
                      <DropdownMenuItem className="cursor-pointer">
                        {l.icon}
                        {l.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}

                  {adminLinks.map((l) => (
                    <Link key={l.href} href={l.href}>
                      <DropdownMenuItem className="cursor-pointer">
                        {l.icon}
                        {l.label}
                      </DropdownMenuItem>
                    </Link>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={async () => {
                      // Prevent NextAuth from constructing a cross-host URL
                      await signOut({ redirect: false });
                      // Then navigate yourself on the SAME host
                      router.push(origin + '/');
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu button (if you have a sidebar/drawer) */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
