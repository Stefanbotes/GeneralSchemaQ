import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  // --- Core session / security setup ---
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" },

  // --- Auth provider(s) ---
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            role: true,
            emailVerified: true, // Date | null
            tokenVersion: true,
          },
        });

        if (!user) throw new Error("Invalid credentials");
        const ok = await compare(credentials.password, user.password);
        if (!ok) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          tokenVersion: user.tokenVersion,
        } as any;
      },
    }),
  ],

  // --- Callbacks ---
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role ?? "CLIENT";
        (token as any).emailVerified = (user as any).emailVerified ?? null;
        (token as any).tokenVersion = (user as any).tokenVersion ?? 0;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token as any).id,
        role: (token as any).role,
        emailVerified: (token as any).emailVerified ?? null,
      };
      return session;
    },

    /**
     * --- Redirect guard to keep users on same deploy (fixes preview→prod jump) ---
     */
    async redirect({ url, baseUrl }) {
      try {
        // Relative URLs → stay on same host
        if (url.startsWith("/")) return `${baseUrl}${url}`;

        // Absolute but same-origin URLs → allow
        const u = new URL(url);
        const b = new URL(baseUrl);
        if (u.origin === b.origin) return url;

        // Otherwise fallback to current deploy base
        return baseUrl;
      } catch {
        // In case URL constructor fails, safe fallback
        return baseUrl;
      }
    },
  },
};

