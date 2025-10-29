// lib/auth-config.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

// Gatekeeper: require verified email to sign in?
const REQUIRE_VERIFIED_EMAIL =
  (process.env.REQUIRE_VERIFIED_EMAIL ?? "true").toLowerCase() === "true";

// NOTE: Ensure NEXTAUTH_SECRET is set in Vercel env.
// Also set NEXTAUTH_URL or NEXT_PUBLIC_APP_URL for correct callback URLs.

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  // Your app uses /auth/login
  pages: { signIn: "/auth/login" },

  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const email = creds.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            tokenVersion: true,
            emailVerified: true,   // needed if you want to gate logins
            lockoutUntil: true,    // optional if you use lockouts
          },
        });
        if (!user) return null;

        // Optional: lockout window
        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          return null;
        }

        const ok = await compare(creds.password, user.password);
        if (!ok) return null;

        // Gate on verification if desired
        if (REQUIRE_VERIFIED_EMAIL && !user.emailVerified) {
          // refuse to sign in until they verify (your UI should show a message / resend flow)
          return null;
        }

        // Minimal, safe fields for JWT seed
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion ?? 0,
          // we’ll copy emailVerified via callbacks too
          emailVerified: user.emailVerified ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, seed from the returned user
      if (user?.email) {
        token.email = user.email;
        // @ts-ignore
        token.role = (user as any).role || "CLIENT";
        // @ts-ignore
        token.tokenVersion = (user as any).tokenVersion ?? 0;
        // @ts-ignore
        token.emailVerified = (user as any).emailVerified ?? null;
      }

      // Keep role/emailVerified/tokenVersion fresh so promotions/verification reflect immediately
      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: { role: true, tokenVersion: true, emailVerified: true },
        });
        if (dbUser) {
          // @ts-ignore
          token.role = dbUser.role || "CLIENT";
          // @ts-ignore
          token.tokenVersion = dbUser.tokenVersion ?? 0;
          // @ts-ignore
          token.emailVerified = dbUser.emailVerified ?? null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.role = (token as any).role || "CLIENT";
        // @ts-ignore
        session.user.tokenVersion = (token as any).tokenVersion ?? 0;
        // @ts-ignore
        session.user.emailVerified = (token as any).emailVerified ?? null;
      }
      return session;
    },
  },

  // Nice-to-have: keep audit fields current
  events: {
    async signIn({ user }) {
      // best-effort; don’t block auth if it fails
      try {
        await db.user.update({
          where: { id: (user as any).id },
          data: { lastLogin: new Date(), loginAttempts: 0 },
        });
      } catch {}
    },
  },

  // Helpful during setup; remove or guard by NODE_ENV in production if noisy
  // debug: process.env.NODE_ENV !== "production",
};

