// lib/auth-config.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

const REQUIRE_VERIFIED_EMAIL =
  (process.env.REQUIRE_VERIFIED_EMAIL ?? "true").toLowerCase() === "true";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
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
            emailVerified: true,
            lockoutUntil: true,
          },
        });
        if (!user) return null;

        if (user.lockoutUntil && user.lockoutUntil > new Date()) {
          return null;
        }

        const ok = await compare(creds.password, user.password);
        if (!ok) return null;

        if (REQUIRE_VERIFIED_EMAIL && !user.emailVerified) {
          return null;
        }

        // Seed minimal safe fields into JWT on first sign-in
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion ?? 0,
          emailVerified: user.emailVerified ?? null,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, copy fields from returned user
      if (user?.email) {
        // ensure id on token (both sub and id for safety)
        // @ts-ignore
        token.sub = (user as any).id || token.sub;
        // @ts-ignore
        token.id = (user as any).id || token.id;

        token.email = user.email;
        // @ts-ignore
        token.role = (user as any).role || "CLIENT";
        // @ts-ignore
        token.tokenVersion = (user as any).tokenVersion ?? 0;
        // @ts-ignore
        token.emailVerified = (user as any).emailVerified ?? null;
      }

      // Keep token fresh from DB so promotions/verification reflect
      if (token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: String(token.email).toLowerCase() },
          select: { id: true, role: true, tokenVersion: true, emailVerified: true },
        });
        if (dbUser) {
          // @ts-ignore
          token.sub = dbUser.id || token.sub;
          // @ts-ignore
          token.id = dbUser.id || token.id;
          // @ts-ignore
          token.role = dbUser.role || "CLIENT";
          // @ts-ignore
          token.tokenVersion = dbUser.tokenVersion ?? 0;
          // @ts-ignore (JWT stores dates as strings; fine for our mapping below)
          token.emailVerified = dbUser.emailVerified ?? null;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // prefer token.sub, fallback token.id
        // @ts-ignore
        session.user.id = (token?.sub as string) || (token as any)?.id || session.user.id;
        // @ts-ignore
        session.user.role = (token as any).role || "CLIENT";
        // @ts-ignore
        session.user.tokenVersion = (token as any).tokenVersion ?? 0;
        const ev = (token as any).emailVerified as string | null;
        // @ts-ignore
        session.user.emailVerified = ev ? new Date(ev) : null;
      }
      return session;
    },
  },

  // Use arrow function property to avoid parser quirks
  events: {
    signIn: async ({ user }) => {
      try {
        await db.user.update({
          where: { id: (user as any).id },
          data: { lastLogin: new Date(), loginAttempts: 0 },
        });
      } catch {
        // best-effort: do not block sign-in
      }
    },
  },

  // debug: process.env.NODE_ENV !== "production",
};

