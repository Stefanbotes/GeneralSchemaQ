// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
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
            emailVerified: true,   // Date | null
            tokenVersion: true,
          },
        });

        if (!user) throw new Error("Invalid credentials");

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid credentials");

        // Return a NextAuth-compatible user object
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
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "CLIENT";
        token.emailVerified = (user as any).emailVerified ?? null;
        token.tokenVersion = (user as any).tokenVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: (token as any).id,
