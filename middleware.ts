
// Security middleware for authentication and CSRF protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SecurityUtils } from './lib/auth-utils';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/assessment',
  '/admin',
  '/profile',
  '/api/assessment',
  '/api/admin',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Coach or higher routes
const coachRoutes = [
  '/coach',
  '/api/coach',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/auth',
  '/api/signup',
  '/api/verify-email',
  '/api/forgot-password',
  '/api/reset-password',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Apply security headers
  const response = NextResponse.next();
  const securityHeaders = SecurityUtils.getSecurityHeaders();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Skip middleware for public routes and static files
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return response;
  }

  try {
    // Get the JWT token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if route requires authentication
    const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (requiresAuth && !token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (token) {
      // Check email verification
      if (!token.emailVerified && !pathname.startsWith('/auth/verify-email')) {
        const verifyUrl = new URL('/auth/verify-email', request.url);
        return NextResponse.redirect(verifyUrl);
      }

      // Check role-based access
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (token.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      if (coachRoutes.some(route => pathname.startsWith(route))) {
        if (token.role !== 'COACH' && token.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // Redirect authenticated users away from auth pages
      if (pathname.startsWith('/auth/') && pathname !== '/auth/verify-email') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login for protected routes
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - /api/* (API routes)
     * - /_next/static (static files)  
     * - /_next/image (image optimization files)
     * - /favicon.ico (favicon file)
     * - Files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
