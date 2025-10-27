// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: Date | null;
    tokenVersion?: number;
    // You can add firstName/lastName if you want to use them everywhere:
    // firstName?: string | null;
    // lastName?: string | null;
  }

  interface Session {
    user: {
      id?: string;
      role?: "CLIENT" | "COACH" | "ADMIN";
      emailVerified?: Date | null;
      // firstName?: string | null;
      // lastName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "CLIENT" | "COACH" | "ADMIN";
    emailVerified?: Date | null;
    tokenVersion?: number;
    // firstName?: string | null;
    // lastName?: string | null;
  }
}
