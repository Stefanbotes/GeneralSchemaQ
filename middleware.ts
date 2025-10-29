// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { SecurityUtils } from "./lib/auth-utils";

const protectedRoutes = ["/dashboard", "/assessment", "/admin", "/profile"];
const adminRoutes = ["/admin"];
const coachRoutes = ["/coach"];
const publicRoutes = ["/", "/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password", "/auth/verify-email"];

function withSecurityHeaders<T extends Response>(res: T): T {
  const headers = SecurityUtils.getSecurityHeaders();
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v as string);
  return res;
}
function startsWithSeg(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (request.method === "OPTIONS") {
    return withSecurityHeaders(NextResponse.next());
  }

  const isPublic =
    publicRoutes.some((r) => startsWithSeg(pathname, r)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (isPublic) {
    return withSecurityHeaders(NextResponse.next());
  }

  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const requiresAuth = protectedRoutes.some((r) => startsWithSeg(pathname, r));
    if (requiresAuth && !token) {
      const loginUrl = new URL("/auth/login", request.url);
      if (!startsWithSeg(pathname, "/auth/login")) {
        loginUrl.searchParams.set("callbackUrl", pathname + search);
      }
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (token) {
      // Optional email-verify gate:
      // if (!token.emailVerified && !startsWithSeg(pathname, "/auth/verify-email")) {
      //   return withSecurityHeaders(NextResponse.redirect(new URL("/auth/verify-email", request.url)));
      // }

      const isAdminRoute = adminRoutes.some((r) => startsWithSeg(pathname, r));
      if (isAdminRoute && token.role !== "ADMIN") {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }

      const isCoachRoute = coachRoutes.some((r) => startsWithSeg(pathname, r));
      if (isCoachRoute && token.role !== "COACH" && token.role !== "ADMIN") {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }

      if (startsWithSeg(pathname, "/auth") && !startsWithSeg(pathname, "/auth/verify-email")) {
        return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    }

    return withSecurityHeaders(NextResponse.next());
  } catch (err) {
    console.error("Middleware error:", err);
    const needsAuth = protectedRoutes.some((r) => startsWithSeg(pathname, r));
    if (needsAuth) {
      const loginUrl = new URL("/auth/login", request.url);
      if (!startsWithSeg(pathname, "/auth/login")) {
        loginUrl.searchParams.set("callbackUrl", pathname + search);
      }
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    return withSecurityHeaders(NextResponse.next());
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};

