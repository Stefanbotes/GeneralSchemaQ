// lib/auth-config.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Minimal select to avoid type conflicts with custom typings elsewhere
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            password: true,
            role: true,
            emailVerified: true,   // Date | null in DB
            tokenVersion: true,
          },
        });

        if (!user) throw new Error("Invalid credentials");
        const ok = await compare(credentials.password, user.password);
        if (!ok) throw new Error("Invalid credentials");

        // Return a minimal object; details will be copied into the JWT in callbacks
        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
          emailVerified: user.emailVerified, // Date | null
          tokenVersion: user.tokenVersion,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, copy selected fields from "user" into the token
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role ?? "CLIENT";
        (token as any).emailVerified = (user as any).emailVerified ?? null; // Date | null
        (token as any).tokenVersion = (user as any).tokenVersion ?? 0;
      }
      return token;
    },

    async session({ session, token }) {
      // Expose essentials on session.user (keep shape aligned with your augmentation)
      session.user = {
        ...session.user,
        id: (token as any).id,
        role: (token as any).role,
        emailVerified: (token as any).emailVerified ?? null, // Date | null
      };
      return session;
    },
  },
};
