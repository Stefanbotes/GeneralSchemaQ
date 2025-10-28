// middleware.ts (at project root or /src)
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SecurityUtils } from "./lib/auth-utils";

// Routes config (no /api/* here – matcher excludes it)
const protectedRoutes = ["/dashboard", "/assessment", "/admin", "/profile"];
const adminRoutes = ["/admin"];
const coachRoutes = ["/coach"];
const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"];

function withSecurityHeaders<T extends Response>(res: T): T {
  const headers = SecurityUtils.getSecurityHeaders();
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v as string);
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // public/static early exit
  if (
    publicRoutes.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return withSecurityHeaders(NextResponse.next());
  }

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const requiresAuth = protectedRoutes.some((r) => pathname.startsWith(r));
    if (requiresAuth && !token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (token) {
      // Only keep this if you actually put emailVerified on the JWT
      // if (!token.emailVerified && !pathname.startsWith("/auth/verify-email")) {
      //   return withSecurityHeaders(NextResponse.redirect(new URL("/auth/verify-email", request.url)));
      // }

      if (adminRoutes.some((r) => pathname.startsWith(r)) && token.role !== "ADMIN") {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
      if (coachRoutes.some((r) => pathname.startsWith(r)) && token.role !== "COACH" && token.role !== "ADMIN") {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
      if (pathname.startsWith("/auth/") && pathname !== "/auth/verify-email") {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    }

    return withSecurityHeaders(NextResponse.next());
  } catch (err) {
    console.error("Middleware error:", err);
    const needsAuth = protectedRoutes.some((r) => pathname.startsWith(r));
    if (needsAuth) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname + search);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    return withSecurityHeaders(NextResponse.next());
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};

