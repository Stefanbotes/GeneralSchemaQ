// remove /api/* from these lists
const protectedRoutes = ['/dashboard','/assessment','/admin','/profile']
const adminRoutes = ['/admin']
const coachRoutes = ['/coach']
const publicRoutes = ['/', '/auth/login','/auth/register','/auth/forgot-password','/auth/reset-password','/auth/verify-email']

function withSecurityHeaders(res: NextResponse) {
  const headers = SecurityUtils.getSecurityHeaders()
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v as string)
  return res
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const baseResponse = withSecurityHeaders(NextResponse.next())

  // early exit for public/static
  if (
    publicRoutes.some(r => pathname.startsWith(r)) ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return baseResponse
  }

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    const requiresAuth = protectedRoutes.some(r => pathname.startsWith(r))
    if (requiresAuth && !token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname + search)
      return withSecurityHeaders(NextResponse.redirect(loginUrl))
    }

    if (token) {
      // ⚠️ Remove this unless you've added emailVerified to the JWT in your NextAuth callbacks
      // if (!token.emailVerified && !pathname.startsWith('/auth/verify-email')) {
      //   return withSecurityHeaders(NextResponse.redirect(new URL('/auth/verify-email', request.url)))
      // }

      if (adminRoutes.some(r => pathname.startsWith(r)) && token.role !== 'ADMIN') {
        return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
      }
      if (coachRoutes.some(r => pathname.startsWith(r)) && token.role !== 'COACH' && token.role !== 'ADMIN') {
        return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
      }
      if (pathname.startsWith('/auth/') && pathname !== '/auth/verify-email') {
        return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)))
      }
    }

    return baseResponse
  } catch (err) {
    console.error('Middleware error:', err)
    const needsAuth = protectedRoutes.some(r => pathname.startsWith(r))
    if (needsAuth) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname + search)
      return withSecurityHeaders(NextResponse.redirect(loginUrl))
    }
    return baseResponse
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'],
}

